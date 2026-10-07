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
        validacionExpedientes: true,
        discapacidades: { include: { discapacidad: true } },
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
    const validacionActual = aspirante.validacionExpedientes || null;

    let fechaValidacionFormateada = null;
    if (validacionActual?.fechaValidacion) {
      fechaValidacionFormateada = new Date(
        validacionActual.fechaValidacion,
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
        estatus: validacionActual?.dictamenGeneral || "PENDIENTE",
        observaciones: validacionActual?.observaciones || null,
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
          comentario: doc.comentario || null,
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

    if (typeof rawBody.semestresSeleccionados === "string") {
      try {
        rawBody.semestresSeleccionados = JSON.parse(
          rawBody.semestresSeleccionados,
        );
      } catch {
        rawBody.semestresSeleccionados = [];
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

    const datosValidados = validationResult.data as any;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const randomFolio = `BEL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fechaVigencia = new Date();
    fechaVigencia.setDate(fechaVigencia.getDate() + 15);

    const parseId = (val: any) => {
      const num = Number(val);
      return isNaN(num) || num <= 0 ? null : num;
    };

    const gId = parseId(datosValidados.generoId || rawBody.generoId);
    const iId = parseId(
      datosValidados.identidadCulturalId || rawBody.identidadCulturalId,
    );
    const pId = parseId(
      datosValidados.parentescoTutorId || rawBody.parentescoTutorId,
    );

    const nuevoAspirante = await prisma.$transaction(async (tx) => {
      const nombresDiscapacidades = datosValidados.discapacidades || [];
      const registrosDiscapacidades = await tx.discapacidad.findMany({
        where: { nombre: { in: nombresDiscapacidades } },
      });

      // ID 2 corresponde a "Aspirante" en la tabla tipo_usuario
      const tipoUsuarioAspiranteId = 2;

      let subsistemaIdFinal = parseId(
        datosValidados.subsistemaId || rawBody.subsistemaId,
      );
      let letraProcedencia = null;

      if (datosValidados.tipoAdmision === "nuevo_ingreso") {
        let subSecundaria = await tx.subsistema.findFirst({
          where: { nombre: { contains: "SECUNDARIA" } },
        });
        if (!subSecundaria) {
          subSecundaria = await tx.subsistema.findFirst({ where: { id: 1 } });
        }
        subsistemaIdFinal = subSecundaria ? subSecundaria.id : 1;
      }

      if (subsistemaIdFinal) {
        const subObj = await tx.subsistema.findUnique({
          where: { id: subsistemaIdFinal },
        });
        if (subObj && subObj.nombre) {
          letraProcedencia = subObj.nombre.charAt(0).toUpperCase();
        }
      }

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

          tipoUsuarioRel: { connect: { id: tipoUsuarioAspiranteId } },

          ...(gId && { generoRel: { connect: { id: gId } } }),
          ...(iId && { identidadCultural: { connect: { id: iId } } }),
          ...(subsistemaIdFinal && {
            subsistema: { connect: { id: subsistemaIdFinal } },
          }),
          ...(pId && { tutorParentescoRel: { connect: { id: pId } } }),

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

          tipoAdmision: datosValidados.tipoAdmision,
          cctEscuelaProcedencia: datosValidados.cctEscuelaProcedencia || null,
          nombreEscuelaProcedencia:
            datosValidados.nombreEscuelaProcedencia || null,
          sistemaProcedenciaLetra: letraProcedencia,
          otroSistemaProcedencia: datosValidados.otroSistemaProcedencia || null,
          semestresSeleccionados: datosValidados.semestresSeleccionados || [],

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
            const nombreSeguro =
              file.originalname.length > 250
                ? file.originalname.substring(0, 250)
                : file.originalname;

            await tx.documento.create({
              data: {
                aspiranteId: aspirante.id,
                tipoDoc: fieldKey,
                nombreArchivo: nombreSeguro,
                archivoBlob: file.buffer,
                estatusDoc: "PENDIENTE",
              },
            });
          }
        }
      }

      return aspirante;
    });

    const nombreCompleto =
      `${datosValidados.apellidoPaterno} ${datosValidados.apellidoMaterno || ""} ${datosValidados.nombres}`.trim();
    const linkConsulta = "http://localhost:5173";

    // Envío de correo en segundo plano (No bloquea ni demora la respuesta al usuario)
    transporter
      .sendMail({
        from: `"Sistema BELVER" <${process.env.SMTP_USER}>`,
        to: datosValidados.correoElectronico1,
        subject: `Comprobante de Registro y Folio Oficial: ${nuevoAspirante.folio} - BELVER`,
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f1f5f9; padding: 25px; color: #1e293b;">
          <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
            <div style="padding: 16px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background-color: #ffffff;">
              <span style="font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">[ Logo Institucional ]</span>
              <span style="font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">[ Logo BELVER ]</span>
            </div>
            <div style="padding: 30px 24px; text-align: center;">
              <div style="width: 48px; height: 48px; background-color: #dbeafe; color: #1e40af; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; margin-bottom: 15px;">✓</div>
              <h2 style="margin: 0 0 5px 0; font-size: 18px; font-weight: bold; color: #0f172a;">¡Solicitud Registrada Exitosamente!</h2>
              <p style="margin: 0 0 20px 0; font-size: 11px; color: #64748b;">Comprobante oficial de registro institucional - BELVER</p>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: left;">
                <div style="margin-bottom: 12px;">
                  <span style="font-size: 9px; font-weight: bold; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 2px;">Nombre del Estudiante</span>
                  <div style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase;">${nombreCompleto}</div>
                </div>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center;">
                  <span style="font-size: 9px; font-weight: bold; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">Folio de Seguimiento Oficial</span>
                  <div style="font-family: monospace; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: 1px;">${nuevoAspirante.folio}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
        text: `¡Solicitud Registrada Exitosamente! Nombre: ${nombreCompleto}, Folio: ${nuevoAspirante.folio}.`,
      })
      .catch((emailError) => {
        console.error(
          "Advertencia: No se pudo enviar el correo de registro:",
          emailError,
        );
      });

    res.status(201).json({
      ok: true,
      mensaje: "¡Registro de aspirante exitoso!",
      data: { folio: nuevoAspirante.folio },
    });
  } catch (error: any) {
    console.error("Error detallado al registrar aspirante:", error);
    if (error.code === "P2002") {
      res
        .status(400)
        .json({ ok: false, mensaje: "El registro ya existe en el sistema." });
      return;
    }
    res.status(500).json({
      ok: false,
      mensaje: "Error interno del servidor al procesar la inscripción.",
    });
  }
};

export const aprobarExpediente = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { aspiranteId } = req.params;
    const { observaciones, estatusDocumentos } = req.body;

    const anioDosDigitos = String(new Date().getFullYear()).slice(-2);
    const prefijo = `B${anioDosDigitos}`;

    const ultimoAlumno = await prisma.aspirante.findFirst({
      where: {
        matricula: {
          startsWith: prefijo,
        },
      },
      orderBy: {
        matricula: "desc",
      },
      select: {
        matricula: true,
      },
    });

    let siguienteConsecutivo = 1;
    if (ultimoAlumno && ultimoAlumno.matricula) {
      const numeroActual = parseInt(
        ultimoAlumno.matricula.replace(prefijo, ""),
        10,
      );
      if (!isNaN(numeroActual)) {
        siguienteConsecutivo = numeroActual + 1;
      }
    }

    const consecutivoFormateado = String(siguienteConsecutivo).padStart(6, "0");
    const matriculaGenerada = `${prefijo}${consecutivoFormateado}`;
    const passwordGenerada = Math.random().toString(36).slice(-8).toUpperCase();

    // ID 5 corresponde inequívocamente a "Alumno" en la tabla tipo_usuario
    const tipoUsuarioAlumnoId = 5;

    const resultado = await prisma.$transaction(async (tx) => {
      const aspiranteActualizado = await tx.aspirante.update({
        where: { id: Number(aspiranteId) },
        data: {
          matricula: matriculaGenerada,
          password: passwordGenerada,
          tipoUsuarioId: tipoUsuarioAlumnoId, // Actualiza formalmente a Alumno (ID 5)
          estatusAcademico: "ACTIVO_REGULAR",
        },
      });

      await tx.validacionExpediente.update({
        where: { aspiranteId: Number(aspiranteId) },
        data: {
          dictamenGeneral: "APROBADO",
          observaciones: null,
          fechaValidacion: new Date(),
        },
      });

      if (estatusDocumentos && Array.isArray(estatusDocumentos)) {
        for (const doc of estatusDocumentos) {
          await tx.documento.update({
            where: { id: doc.id },
            data: {
              estatusDoc: doc.estatusDoc,
              comentario: doc.comentario || null,
            },
          });
        }
      }

      return aspiranteActualizado;
    });

    // Envío de correo de aprobación en segundo plano
    transporter
      .sendMail({
        from: `"Sistema BELVER" <${process.env.SMTP_USER}>`,
        to: resultado.correoElectronico1,
        subject:
          "¡Aprobación de Expediente y Asignación de Matrícula - BELVER!",
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px; color: #333333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="background-color: #0f172a; color: #ffffff; padding: 20px; text-align: center;">
              <h2 style="margin: 0; font-size: 20px;">¡Expediente Aprobado - Sistema BELVER!</h2>
            </div>
            <div style="padding: 30px;">
              <p>Estimado(a) <strong>${resultado.nombres}</strong>,</p>
              <p>Tu expediente ha sido <strong>APROBADO</strong> satisfactoriamente.</p>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Matrícula Asignada:</strong> <span style="font-family: monospace; color: #1e3a8a; font-size: 16px;">${resultado.matricula}</span></p>
                <p style="margin: 5px 0;"><strong>Contraseña Única:</strong> <span style="font-family: monospace; color: #1e3a8a; font-size: 16px;">${resultado.password}</span></p>
              </div>
            </div>
          </div>
        </div>
      `,
        text: `Tu expediente fue aprobado. Matrícula: ${resultado.matricula}, Contraseña: ${resultado.password}`,
      })
      .catch((emailError) => {
        console.error(
          "Advertencia: No se pudo enviar el correo de aprobación:",
          emailError,
        );
      });

    res.status(200).json({
      ok: true,
      mensaje:
        "¡Expediente aprobado, matrícula y contraseña generadas con éxito!",
      data: { matricula: resultado.matricula, password: resultado.password },
    });
  } catch (error) {
    console.error("Error al aprobar expediente:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error interno al procesar la aprobación." });
  }
};

export const verDocumento = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const documento = await prisma.documento.findUnique({
      where: { id: Number(id) },
    });

    if (!documento || !documento.archivoBlob) {
      res.status(404).json({ ok: false, mensaje: "Documento no encontrado." });
      return;
    }

    const nombreArchivo = documento.nombreArchivo.toLowerCase();
    let contentType = "application/octet-stream";
    if (nombreArchivo.endsWith(".pdf")) contentType = "application/pdf";
    else if (nombreArchivo.endsWith(".png")) contentType = "image/png";
    else if (nombreArchivo.endsWith(".jpg") || nombreArchivo.endsWith(".jpeg"))
      contentType = "image/jpeg";

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${documento.nombreArchivo}"`,
    );
    res.send(documento.archivoBlob);
  } catch (error) {
    console.error("Error al visualizar documento:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error interno al visualizar el documento.",
    });
  }
};
