import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { admissionSchema } from "../middlewares/admissionMiddleware.js";
import nodemailer from "nodemailer";

// Configuración del transportador de correos
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Endpoint para verificar duplicados en el Paso 1 (Únicamente por CURP)
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
      where: {
        curp: String(curp).toUpperCase(),
      },
    });

    if (aspiranteExistente) {
      res.status(200).json({
        ok: true,
        existe: true,
        mensaje:
          "La CURP proporcionada ya se encuentra registrada en el sistema institucional de BELVER.",
      });
      return;
    }

    res.status(200).json({ ok: true, existe: false });
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error al verificar duplicados en el servidor.",
    });
  }
};

// Endpoint para consultar estatus y documentos
export const consultarEstatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { folio, curp } = req.query;

    if (!folio || !curp) {
      res
        .status(400)
        .json({ ok: false, mensaje: "El folio y la CURP son obligatorios." });
      return;
    }

    const aspirante = await prisma.aspirante.findFirst({
      where: {
        folio: String(folio).trim().toUpperCase(),
        curp: String(curp).trim().toUpperCase(),
      },
      include: {
        documentos: true,
        controlEscolar: true,
        discapacidades: {
          include: {
            discapacidad: true,
          },
        },
      },
    });

    if (!aspirante) {
      res.status(404).json({
        ok: false,
        mensaje:
          "No se encontró ninguna solicitud con ese folio o la CURP no coincide.",
      });
      return;
    }

    const fechaVigenciaObj = aspirante.vigenciaFolio
      ? new Date(aspirante.vigenciaFolio)
      : new Date();

    let fechaValidacionFormateada = null;
    if (aspirante.controlEscolar?.fechaValidacion) {
      fechaValidacionFormateada = new Date(
        aspirante.controlEscolar.fechaValidacion,
      ).toLocaleString("es-MX", {
        dateStyle: "medium" as any,
        timeStyle: "short",
      });
    }

    res.status(200).json({
      ok: true,
      data: {
        folio: aspirante.folio,
        aspirante:
          `${aspirante.apellidoPaterno} ${aspirante.apellidoMaterno || ""} ${aspirante.nombres}`.trim(),
        curp: aspirante.curp,
        modalidad:
          aspirante.tipoAdmision === "nuevo_ingreso"
            ? "NUEVO INGRESO (SECUNDARIA REGULAR)"
            : "REVALIDACIÓN / EQUIVALENCIA",
        fechaRegistro: aspirante.creadoEn.toISOString().split("T")[0],
        vigencia: fechaVigenciaObj.toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        estatus: aspirante.controlEscolar?.dictamenGeneral || "EN REVISIÓN",
        observaciones: aspirante.controlEscolar?.observaciones || null,
        fechaValidacion: fechaValidacionFormateada,
        matricula: aspirante.matricula || null,
        password: aspirante.password || null,
        discapacidades: aspirante.discapacidades.map(
          (d: any) => d.discapacidad.nombre,
        ),
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
    res
      .status(500)
      .json({ ok: false, mensaje: "Error interno al procesar la consulta." });
  }
};

// Endpoint para registrar al aspirante y enviar correo institucional
export const registrarAspirante = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const rawBody = { ...req.body };

    // Procesar el arreglo de discapacidades si viene serializado como cadena JSON
    if (typeof rawBody.discapacidades === "string") {
      try {
        rawBody.discapacidades = JSON.parse(rawBody.discapacidades);
      } catch {
        rawBody.discapacidades = [];
      }
    }

    const validationResult = admissionSchema.safeParse(rawBody);

    if (!validationResult.success) {
      console.error(
        "Errores de validación Zod:",
        validationResult.error.format(),
      );
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
      // 1. Buscar el ID de la identidad cultural si fue proporcionada
      let identidadCulturalId = null;
      if (datosValidados.identidadCultural) {
        const catIdentidad = await tx.identidadCultural.findUnique({
          where: { nombre: datosValidados.identidadCultural },
        });
        if (catIdentidad) {
          identidadCulturalId = catIdentidad.id;
        }
      }

      // 2. Buscar los IDs de las discapacidades seleccionadas en el catálogo
      const nombresDiscapacidades = datosValidados.discapacidades || [];
      const registrosDiscapacidades = await tx.discapacidad.findMany({
        where: {
          nombre: { in: nombresDiscapacidades },
        },
      });

      // 3. Crear el registro del aspirante con la llave foránea correcta
      const aspirante = await tx.aspirante.create({
        data: {
          folio: randomFolio,
          vigenciaFolio: fechaVigencia,
          apellidoPaterno: datosValidados.apellidoPaterno,
          apellidoMaterno: datosValidados.apellidoMaterno || null,
          nombres: datosValidados.nombres,
          curp: datosValidados.curp,
          fechaNacimiento: datosValidados.fechaNacimiento
            ? new Date(datosValidados.fechaNacimiento)
            : null,
          generoId: datosValidados.generoId
            ? Number(datosValidados.generoId)
            : null,
          correoElectronico1: datosValidados.correoElectronico1,
          correoElectronico2: datosValidados.correoElectronico2 || null,
          telefonoCelular: datosValidados.telefonoCelular,
          telefonoParticular: datosValidados.telefonoParticular || null,

          identidadCulturalId: identidadCulturalId,

          // Domicilio
          pais: datosValidados.pais,
          codigoPostal: datosValidados.codigoPostal || null,
          estado: datosValidados.estado,
          municipio: datosValidados.municipio,
          colonia: datosValidados.colonia,
          calle: datosValidados.calle,
          numeroExterior: datosValidados.numeroExterior || null,
          numeroInterior: datosValidados.numeroInterior || null,

          // Tutor usando el campo de llave foránea escalar directamente
          tutorApellidoPaterno: datosValidados.tutorApellidoPaterno || null,
          tutorApellidoMaterno: datosValidados.tutorApellidoMaterno || null,
          tutorNombres: datosValidados.tutorNombres || null,
          tutorTelefono: datosValidados.tutorTelefono || null,
          parentescoTutorId: datosValidados.tutorParentesco
            ? Number(datosValidados.tutorParentesco)
            : null,

          // Antecedentes Escolares
          tipoAdmision: datosValidados.tipoAdmision,
          cctEscuelaProcedencia: datosValidados.cctEscuelaProcedencia || null,
          nombreEscuelaProcedencia:
            datosValidados.nombreEscuelaProcedencia || null,
          sistemaProcedenciaLetra:
            datosValidados.sistemaProcedenciaLetra || null,
          otroSistemaProcedencia: datosValidados.otroSistemaProcedencia || null,
          cctBachilleratoPrevio: datosValidados.previousSchoolCct || null,
          nombreBachilleratoPrevio:
            datosValidados.previousHighSchoolName || null,

          // Conectamos las múltiples discapacidades relacionales
          discapacidades: {
            create: registrosDiscapacidades.map((d: any) => ({
              discapacidad: {
                connect: { id: d.id },
              },
            })),
          },
        },
      });

      // 4. Registro de archivos en el expediente digital con nombre seguro (truncado a 190 chars)
      if (files) {
        for (const [fieldKey, fileList] of Object.entries(files)) {
          if (fileList && fileList.length > 0) {
            const file = fileList[0];
            const nombreSeguro =
              file.originalname.length > 190
                ? file.originalname.substring(0, 190)
                : file.originalname;

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
      const fechaFormateada = fechaVigencia.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      // Plantilla HTML estructurada y profesional
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px; color: #333333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">

            <!-- Cabecera institucional -->
            <div style="background-color: #0f172a; color: #ffffff; padding: 20px; text-align: center;">
              <h2 style="margin: 0; font-size: 20px;">Sistema BELVER</h2>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #94a3b8;">Control Interno y Servicios Escolares</p>
            </div>

            <!-- Cuerpo del mensaje -->
            <div style="padding: 30px;">
              <p style="font-size: 16px; margin-top: 0;">Estimado(a) <strong>${datosValidados.nombres}</strong>,</p>

              <p style="font-size: 14px; line-height: 1.5; color: #475569;">
                Tu solicitud de inscripción ha sido registrada con éxito en el sistema institucional. A continuación, te compartimos los detalles de tu registro y seguimiento oficial:
              </p>

              <!-- Tarjeta de Folio -->
              <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 5px 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Folio de Seguimiento Oficial:</p>
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1e293b;">${nuevoAspirante.folio}</p>
              </div>

              <p style="font-size: 14px; line-height: 1.5; color: #475569;">
                📅 <strong>Vigencia del trámite:</strong> ${fechaFormateada}
              </p>

              <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                Por favor, conserve este folio para futuras consultas sobre el estatus de validación de sus documentos en el departamento de Control Escolar.
              </p>
            </div>

            <!-- Pie de página -->
            <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 11px; color: #94a3b8;">
              Este correo fue generado automáticamente por el sistema BELVER. No responda a este mensaje.
            </div>

          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"Sistema BELVER" <${process.env.SMTP_USER}>`,
        to: datosValidados.correoElectronico1,
        subject: "¡Inscripción Exitosa a BELVER - Folio de Seguimiento!",
        html: htmlContent,
        text: `Estimado(a) ${datosValidados.nombres}, tu solicitud ha sido registrada con éxito en el sistema BELVER. Tu folio de seguimiento oficial es: ${nuevoAspirante.folio}. Vigencia del trámite: ${fechaFormateada}.`,
      });
    } catch (emailError) {
      console.error(
        "Advertencia: No se pudo enviar el correo electrónico:",
        emailError,
      );
    }

    res.status(201).json({
      ok: true,
      mensaje: "¡Registro de aspirante exitoso!",
      data: { folio: nuevoAspirante.folio },
    });
  } catch (error: any) {
    console.error("Error detallado al registrar aspirante:", error);

    if (error.code === "P2002") {
      res.status(400).json({
        ok: false,
        mensaje:
          "El registro ya existe en el sistema (La CURP ingresada ya cuenta con una solicitud activa).",
      });
      return;
    }

    res.status(500).json({
      ok: false,
      mensaje: "Error interno del servidor al procesar la inscripción.",
    });
  }
};
