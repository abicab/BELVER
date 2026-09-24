import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { admissionSchema } from "../middlewares/admissionMiddleware.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const verificarDuplicado = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { curp } = req.query;
    if (!curp) {
      res.status(400).json({ ok: false, mensaje: "La CURP es obligatoria." });
      return;
    }
    const aspiranteExistente = await prisma.aspirante.findFirst({
      where: { curp: String(curp).toUpperCase() },
    });
    if (aspiranteExistente) {
      res.status(200).json({
        ok: true,
        existe: true,
        mensaje: "La CURP proporcionada ya se encuentra registrada en el sistema institucional de BELVER.",
      });
      return;
    }
    res.status(200).json({ ok: true, existe: false });
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
    res.status(500).json({ ok: false, mensaje: "Error al verificar duplicados en el servidor." });
  }
};

export const consultarEstatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { folio, curp } = req.query;
    if (!folio || !curp) {
      res.status(400).json({ ok: false, mensaje: "El folio y la CURP son obligatorios." });
      return;
    }
    const aspirante = await prisma.aspirante.findFirst({
      where: {
        folio: String(folio).trim().toUpperCase(),
        curp: String(curp).trim().toUpperCase(),
      },
      include: {
        documentos: true,
        validacionExpedientes: true,
        discapacidades: { include: { discapacidad: true } },
      },
    });

    if (!aspirante) {
      res.status(404).json({ ok: false, mensaje: "No se encontró ninguna solicitud con ese folio o la CURP no coincide." });
      return;
    }

    const fechaVigenciaObj = aspirante.vigenciaFolio ? new Date(aspirante.vigenciaFolio) : new Date();
    const validacionActual = aspirante.validacionExpedientes || null;

    let fechaValidacionFormateada = null;
    if (validacionActual?.fechaValidacion) {
      fechaValidacionFormateada = new Date(validacionActual.fechaValidacion).toLocaleString("es-MX", {
        dateStyle: "medium" as any,
        timeStyle: "short",
      });
    }

    res.status(200).json({
      ok: true,
      data: {
        folio: aspirante.folio,
        aspirante: `${aspirante.apellidoPaterno} ${aspirante.apellidoMaterno || ""} ${aspirante.nombres}`.trim(),
        curp: aspirante.curp,
        modalidad: aspirante.tipoAdmision === "nuevo_ingreso" ? "NUEVO INGRESO (SECUNDARIA REGULAR)" : "REVALIDACIÓN / EQUIVALENCIA",
        fechaRegistro: aspirante.creadoEn.toISOString().split("T")[0],
        vigencia: fechaVigenciaObj.toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" }),
        estatus: validacionActual?.dictamenGeneral || "EN REVISIÓN",
        observaciones: validacionActual?.observaciones || null,
        fechaValidacion: fechaValidacionFormateada,
        matricula: aspirante.matricula || null,
        password: aspirante.password || null,
        discapacidades: aspirante.discapacidades.map((d: any) => d.discapacidad.nombre),
        documentos: aspirante.documentos.map((doc: any) => ({
          id: doc.id,
          tipo: doc.tipoDoc,
          nombreArchivo: doc.nombreArchivo,
          estatusDoc: doc.estatusDoc,
        })),
      },
    });
  } catch (error) {
    console.error("Error al consultar estatus:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno al procesar la consulta." });
  }
};

export const registrarAspirante = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const rawBody = { ...req.body };

    if (typeof rawBody.discapacidades === "string") {
      try {
        rawBody.discapacidades = JSON.parse(rawBody.discapacidades);
      } catch {
        rawBody.discapacidades = [];
      }
    }

    const validationResult = admissionSchema.safeParse(rawBody);

    if (!validationResult.success) {
      console.error("Errores de validación Zod:", validationResult.error.format());
      res.status(400).json({
        ok: false,
        mensaje: "Errores de validación en el formulario",
        errores: validationResult.error.format(),
      });
      return;
    }

    const datosValidados = validationResult.data;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const randomFolio = `BEL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fechaVigencia = new Date();
    fechaVigencia.setDate(fechaVigencia.getDate() + 15);

    const nuevoAspirante = await prisma.$transaction(async (tx) => {
      // 1. Resolver Identidad Cultural ID de forma flexible
      let identidadCulturalId = null;
      if (datosValidados.identidadCultural) {
        const catIdentidad = await tx.identidadCultural.findFirst({
          where: {
            nombre: {
              equals: datosValidados.identidadCultural.trim().toUpperCase(),
            },
          },
        });
        if (catIdentidad) identidadCulturalId = catIdentidad.id;
      }

      // 2. Resolver Género ID usando generoIdentidad
      let generoIdFinal = null;
      if (datosValidados.generoIdentidad) {
        const catGenero = await tx.genero.findFirst({
          where: {
            nombre: {
              equals: datosValidados.generoIdentidad.trim().toUpperCase(),
            },
          },
        });
        if (catGenero) generoIdFinal = catGenero.id;
      }

      // 3. Resolver Subsistema ID mapeando las letras del frontend a las etiquetas de la BD
      let subsistemaIdFinal = null;
      if (datosValidados.sistemaProcedenciaLetra) {
        const letra = datosValidados.sistemaProcedenciaLetra.trim().toUpperCase();

        // Mapeo institucional de las letras del frontend hacia los nombres reales en la BD de subsistemas
        const mapaSubsistemas: Record<string, string> = {
          "C": "DGB",
          "D": "DGB / TEBAEV",
          "E": "TEBACOM",
          "F": datosValidados.otroSistemaProcedencia ? datosValidados.otroSistemaProcedencia.trim().toUpperCase() : "OTRO"
        };

        const nombreBusqueda = mapaSubsistemas[letra] || letra;

        const catSubsistema = await tx.subsistema.findFirst({
          where: {
            nombre: {
              equals: nombreBusqueda,
            },
          },
        });
        if (catSubsistema) {
          subsistemaIdFinal = catSubsistema.id;
        }
      }

      // 4. Buscar los IDs de las discapacidades
      const nombresDiscapacidades = datosValidados.discapacidades || [];
      const registrosDiscapacidades = await tx.discapacidad.findMany({
        where: { nombre: { in: nombresDiscapacidades } },
      });

      // 5. Crear el registro del aspirante
      const aspirante = await tx.aspirante.create({
        data: {
          folio: randomFolio,
          vigenciaFolio: fechaVigencia,
          apellidoPaterno: datosValidados.apellidoPaterno,
          apellidoMaterno: datosValidados.apellidoMaterno || null,
          nombres: datosValidados.nombres,
          curp: datosValidados.curp,
          fechaNacimiento: datosValidados.fechaNacimiento ? new Date(datosValidados.fechaNacimiento) : null,

          generoId: generoIdFinal,
          identidadCulturalId: identidadCulturalId,
          subsistemaId: subsistemaIdFinal,

          correoElectronico1: datosValidados.correoElectronico1,
          correoElectronico2: datosValidados.correoElectronico2 || null,
          telefonoCelular: datosValidados.telefonoCelular,
          telefonoParticular: datosValidados.telefonoParticular || null,

          pais: datosValidados.pais,
          codigoPostal: datosValidados.codigoPostal || null,
          estado: datosValidados.estado,
          municipio: datosValidados.municipio,
          colonia: datosValidados.colonia,
          calle: datosValidados.calle,
          numeroExterior: datosValidados.numeroExterior || null,
          numeroInterior: datosValidados.numeroInterior || null,

          tutorApellidoPaterno: datosValidados.tutorApellidoPaterno || null,
          tutorApellidoMaterno: datosValidados.tutorApellidoMaterno || null,
          tutorNombres: datosValidados.tutorNombres || null,
          tutorTelefono: datosValidados.tutorTelefono || null,
          parentescoTutorId: datosValidados.tutorParentesco ? Number(datosValidados.tutorParentesco) : null,

          tipoAdmision: datosValidados.tipoAdmision,
          cctEscuelaProcedencia: datosValidados.cctEscuelaProcedencia || null,
          nombreEscuelaProcedencia: datosValidados.nombreEscuelaProcedencia || null,
          sistemaProcedenciaLetra: datosValidados.sistemaProcedenciaLetra || null,
          otroSistemaProcedencia: datosValidados.otroSistemaProcedencia || null,

          discapacidades: {
            create: registrosDiscapacidades.map((d: any) => ({
              discapacidad: { connect: { id: d.id } },
            })),
          },
        },
      });

      if (files) {
        for (const [fieldKey, fileList] of Object.entries(files)) {
          if (fileList && fileList.length > 0) {
            const file = fileList[0];
            const nombreSeguro = file.originalname.length > 190 ? file.originalname.substring(0, 190) : file.originalname;

            await tx.documento.create({
              data: {
                aspiranteId: aspirante.id,
                tipoDoc: fieldKey,
                nombreArchivo: nombreSeguro,
                archivoBlob: file.buffer,
                estatusDoc: "EN REVISIÓN",
              },
            });
          }
        }
      }

      return aspirante;
    });

    try {
      const fechaFormateada = fechaVigencia.toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px; color: #333333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="background-color: #0f172a; color: #ffffff; padding: 20px; text-align: center;">
              <h2 style="margin: 0; font-size: 20px;">Sistema BELVER</h2>
            </div>
            <div style="padding: 30px;">
              <p>Estimado(a) <strong>${datosValidados.nombres}</strong>,</p>
              <p>Tu solicitud ha sido registrada con éxito. Tu folio oficial es: <strong>${nuevoAspirante.folio}</strong></p>
            </div>
          </div>
        </div>
      `;
      await transporter.sendMail({
        from: `"Sistema BELVER" <${process.env.SMTP_USER}>`,
        to: datosValidados.correoElectronico1,
        subject: "¡Inscripción Exitosa a BELVER - Folio de Seguimiento!",
        html: htmlContent,
        text: `Tu solicitud en BELVER fue exitosa. Folio: ${nuevoAspirante.folio}`,
      });
    } catch (emailError) {
      console.error("Advertencia: No se pudo enviar el correo:", emailError);
    }

    res.status(201).json({
      ok: true,
      mensaje: "¡Registro de aspirante exitoso!",
      data: { folio: nuevoAspirante.folio },
    });
  } catch (error: any) {
    console.error("Error detallado al registrar aspirante:", error);
    if (error.code === "P2002") {
      res.status(400).json({ ok: false, mensaje: "El registro ya existe en el sistema." });
      return;
    }
    res.status(500).json({ ok: false, mensaje: "Error interno del servidor al procesar la inscripción." });
  }
};