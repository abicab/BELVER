import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { admissionSchema } from "../middlewares/admissionValidation.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

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

// Endpoint para verificar duplicados en el Paso 1
export const verificarDuplicado = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { curp, email } = req.query;

    const aspiranteExistente = await prisma.aspirante.findFirst({
      where: {
        OR: [
          { curp: String(curp || "").toUpperCase() },
          { correoElectronico1: String(email || "").toLowerCase() },
        ],
      },
    });

    if (aspiranteExistente) {
      res.status(200).json({
        ok: true,
        existe: true,
        mensaje:
          "La CURP o el correo electrónico proporcionado ya se encuentran registrados en el sistema.",
      });
      return;
    }

    res.status(200).json({ ok: true, existe: false });
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error al verificar duplicados." });
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
        dateStyle: "medium",
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
            : "REVALIDACIÓN / CON HISTORIAL",
        fechaRegistro: aspirante.creadoEn.toISOString().split("T")[0],
        vigencia: fechaVigenciaObj.toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        estatus: aspirante.controlEscolar?.dictamenGeneral || "EN REVISIÓN",
        observaciones: aspirante.controlEscolar?.observaciones || null,
        fechaValidacion: fechaValidacionFormateada,
        matricula: aspirante.matricula || null, // Se envía la matrícula para mostrarla en pantalla
        password: aspirante.password || null, // Se envía la contraseña permanente para mostrarla en pantalla
        documentos: aspirante.documentos.map((doc) => ({
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
    const validationResult = admissionSchema.safeParse(req.body);

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

    const {
      previousSchoolCct,
      previousHighSchoolName,
      previousSchoolState,
      currentSemester,
      studyPlan,
      generoIdentidad,
      identidadCultural,
      tieneDiscapacidad,
      situacionLaboral,
      medioEnterado,
      tipoSecundaria,
      tutorParentesco,
      tipoEstudiante,
      ...restoDatos
    } = datosValidados;

    const [
      generoRecord,
      identidadRecord,
      discapacidadRecord,
      situacionRecord,
      medioRecord,
      tipoSecundariaRecord,
      parentescoRecord,
      tipoEstudianteRecord,
      semestreRecord,
    ] = await Promise.all([
      generoIdentidad
        ? prisma.genero.findUnique({ where: { nombre: generoIdentidad } })
        : null,
      identidadCultural
        ? prisma.identidadCultural.findUnique({
            where: { nombre: identidadCultural },
          })
        : null,
      tieneDiscapacidad && tieneDiscapacidad !== "NO"
        ? prisma.discapacidad.findUnique({
            where: { nombre: tieneDiscapacidad },
          })
        : null,
      situacionLaboral
        ? prisma.situacionLaboral.findUnique({
            where: { nombre: situacionLaboral },
          })
        : null,
      medioEnterado
        ? prisma.medioEnterado.findUnique({ where: { nombre: medioEnterado } })
        : null,
      tipoSecundaria
        ? prisma.tipoSecundaria.findUnique({
            where: { nombre: tipoSecundaria },
          })
        : null,
      tutorParentesco
        ? prisma.parentesco.findUnique({ where: { nombre: tutorParentesco } })
        : null,
      tipoEstudiante
        ? prisma.tipoEstudiante.findUnique({
            where: { nombre: tipoEstudiante },
          })
        : null,
      currentSemester
        ? prisma.semestre.findUnique({ where: { nombre: currentSemester } })
        : null,
    ]);

    const nuevoAspirante = await prisma.$transaction(async (tx) => {
      const aspirante = await tx.aspirante.create({
        data: {
          folio: randomFolio,
          vigenciaFolio: fechaVigencia,
          ...restoDatos,
          cctBachilleratoPrevio: previousSchoolCct || null,
          nombreBachilleratoPrevio: previousHighSchoolName || null,
          estadoBachilleratoPrevio: previousSchoolState || null,
          planEstudios: studyPlan || null,

          generoId: generoRecord?.id || null,
          identidadCulturalId: identidadRecord?.id || null,
          discapacidadId: discapacidadRecord?.id || null,
          situacionLaboralId: situacionRecord?.id || null,
          medioEnteradoId: medioRecord?.id || null,
          tipoSecundariaId: tipoSecundariaRecord?.id || null,
          parentescoTutorId: parentescoRecord?.id || null,
          tipoEstudianteId: tipoEstudianteRecord?.id || null,
          semestreId: semestreRecord?.id || null,
        },
      });

      if (files) {
        for (const [fieldKey, fileList] of Object.entries(files)) {
          if (fileList && fileList.length > 0) {
            const file = fileList[0];
            await tx.documento.create({
              data: {
                aspiranteId: aspirante.id,
                tipoDoc: fieldKey,
                nombreArchivo: file.originalname,
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

      await transporter.sendMail({
        from: '"Sistema BELVER" <noreply@belver.gob.mx>',
        to: datosValidados.correoElectronico1,
        subject: "¡Inscripción Exitosa a BELVER - Folio de Seguimiento!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #1e3a8a; text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px;">Bachillerato en Línea de Veracruz (BELVER)</h2>
            <p>Estimado(a) <strong>${datosValidados.nombres} ${datosValidados.apellidoPaterno}</strong>,</p>
            <p>Tu solicitud de inscripción ha sido registrada de manera exitosa en nuestro sistema institucional.</p>

            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; display: block;">Tu Folio de Seguimiento Oficial</span>
              <h1 style="color: #0f172a; font-family: monospace; font-size: 28px; margin: 10px 0;">${nuevoAspirante.folio}</h1>
              <p style="font-size: 12px; color: #b45309; margin: 5px 0;">⚠️ Vigencia del trámite: <strong>${fechaFormateada}</strong></p>
            </div>

            <p style="font-size: 13px; color: #334155;">Conserva este correo y tu folio para consultar el estatus de validación de tus documentos en el portal oficial de BELVER.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 10px; color: #94a3b8; text-align: center;">Este correo es informativo, favor de no responder a esta dirección.</p>
          </div>
        `,
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
          "El registro ya existe en el sistema (Verifique campos únicos como CURP o correo).",
      });
      return;
    }

    res.status(500).json({
      ok: false,
      mensaje: "Error interno del servidor al procesar la inscripción.",
    });
  }
};

// Endpoint para actualizar documentos en revisión
export const actualizarDocumentoAspirante = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { folio, curp, tipoDoc } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!folio || !curp || !tipoDoc || !files || !files[tipoDoc]) {
      res.status(400).json({
        ok: false,
        mensaje: "Datos incompletos para la actualización del archivo.",
      });
      return;
    }

    const aspirante = await prisma.aspirante.findFirst({
      where: {
        folio: String(folio).trim().toUpperCase(),
        curp: String(curp).trim().toUpperCase(),
      },
      include: { documentos: true },
    });

    if (!aspirante) {
      res.status(404).json({ ok: false, mensaje: "Aspirante no encontrado." });
      return;
    }

    const archivoNuevo = files[tipoDoc][0];
    const docExistente = aspirante.documentos.find(
      (d) => d.tipoDoc === tipoDoc,
    );

    if (docExistente) {
      await prisma.documento.update({
        where: { id: docExistente.id },
        data: {
          nombreArchivo: archivoNuevo.originalname,
          archivoBlob: archivoNuevo.buffer,
          estatusDoc: "EN REVISIÓN",
        },
      });
    } else {
      await prisma.documento.create({
        data: {
          aspiranteId: aspirante.id,
          tipoDoc: tipoDoc,
          nombreArchivo: archivoNuevo.originalname,
          archivoBlob: archivoNuevo.buffer,
          estatusDoc: "EN REVISIÓN",
        },
      });
    }

    res.status(200).json({
      ok: true,
      mensaje: "Documento actualizado correctamente.",
    });
  } catch (error) {
    console.error("Error al actualizar documento:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error interno al actualizar el archivo." });
  }
};

// ENDPOINT PARA APROBAR ASPIRANTE Y GENERAR CREDENCIALES
export const aprobarYGenerarCredenciales = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        ok: false,
        mensaje: "El ID del aspirante es obligatorio.",
      });
      return;
    }

    const aspiranteId = Number(id);
    if (isNaN(aspiranteId)) {
      res.status(400).json({
        ok: false,
        mensaje: "El ID proporcionado no es válido.",
      });
      return;
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const aspirante = await tx.aspirante.findUnique({
        where: { id: aspiranteId },
      });

      if (!aspirante) {
        throw new Error("ASPIRANTE_NO_ENCONTRADO");
      }

      if (aspirante.matricula) {
        throw new Error("YA_TIENE_MATRICULA");
      }

      const anioActual = "26";
      const prefijo = `B${anioActual}`;

      const ultimoAlumno = await tx.aspirante.findFirst({
        where: {
          matricula: {
            startsWith: prefijo,
          },
        },
        orderBy: {
          matricula: "desc",
        },
      });

      let siguienteNumero = 1;
      if (ultimoAlumno && ultimoAlumno.matricula) {
        const partesNumericas = ultimoAlumno.matricula.replace(prefijo, "");
        const numeroExtraido = parseInt(partesNumericas, 10);
        if (!isNaN(numeroExtraido)) {
          siguienteNumero = numeroExtraido + 1;
        }
      }

      const consecutivoStr = String(siguienteNumero).padStart(6, "0");
      const nuevaMatricula = `${prefijo}${consecutivoStr}`;

      const passwordAleatorio = crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase();

      const aspiranteActualizado = await tx.aspirante.update({
        where: { id: aspiranteId },
        data: {
          matricula: nuevaMatricula,
          password: passwordAleatorio,
          rol: "ALUMNO",
        },
      });

      return aspiranteActualizado;
    });

    res.status(200).json({
      ok: true,
      mensaje: "¡Aspirante aprobado y credenciales generadas exitosamente!",
      data: {
        id: resultado.id,
        nombre: `${resultado.nombres} ${resultado.apellidoPaterno}`,
        folio: resultado.folio,
        matricula: resultado.matricula,
        password: resultado.password,
        rol: resultado.rol,
      },
    });
  } catch (error: any) {
    console.error("Error al aprobar aspirante y generar credenciales:", error);

    if (error.message === "ASPIRANTE_NO_ENCONTRADO") {
      res.status(404).json({ ok: false, mensaje: "Aspirante no encontrado." });
      return;
    }

    if (error.message === "YA_TIENE_MATRICULA") {
      res.status(400).json({
        ok: false,
        mensaje:
          "El aspirante ya cuenta con una matrícula asignada previamente.",
      });
      return;
    }

    res.status(500).json({
      ok: false,
      mensaje: "Error interno al procesar la aprobación del aspirante.",
    });
  }
};
