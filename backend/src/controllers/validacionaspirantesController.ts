import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import crypto from "crypto";
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

// Obtener lista de aspirantes con filtros para Control Escolar (Excluye aprobados con matrícula)
export const obtenerAspirantesControlEscolar = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { estatus, modalidad, busqueda } = req.query;

    // Filtro base: Solo mostrar expedientes que aún NO tienen matrícula asignada
    const whereClause: any = {
      matricula: null,
    };

    if (modalidad && modalidad !== "TODOS") {
      whereClause.tipoAdmision = String(modalidad);
    }

    if (busqueda) {
      const query = String(busqueda).trim();
      whereClause.OR = [
        { folio: { contains: query } },
        { curp: { contains: query } },
        { nombres: { contains: query } },
        { apellidoPaterno: { contains: query } },
      ];
    }

    const aspirantesCrudos = await prisma.aspirante.findMany({
      where: whereClause,
      include: {
        documentos: true,
        generoRel: true,
        subsistema: true,
        validacionExpedientes: true,
        identidadCultural: true,
        tutorParentescoRel: true,
        discapacidades: {
          include: {
            discapacidad: true,
          },
        },
      },
      orderBy: { creadoEn: "desc" },
    });

    const aspirantes = aspirantesCrudos.map((aspirante) => {
      const listaDiscapacidades =
        aspirante.discapacidades?.map((d) => d.discapacidad?.nombre) || [];

      return {
        ...aspirante,
        identidadCulturalTexto:
          aspirante.identidadCultural?.nombre || "NINGUNO",
        discapacidadesTexto:
          listaDiscapacidades.length > 0
            ? listaDiscapacidades.join(", ")
            : "Ninguna",
      };
    });

    res.status(200).json({
      ok: true,
      data: aspirantes,
    });
  } catch (error) {
    console.error("Error al obtener aspirantes en control escolar:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error interno al consultar los registros.",
    });
  }
};

// Actualizar estatus de un documento individual
export const actualizarEstatusDocumentoControl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { documentoId } = req.params;
    const { estatusDoc } = req.body;

    if (!documentoId || !estatusDoc) {
      res.status(400).json({
        ok: false,
        mensaje: "El ID del documento y el nuevo estatus son obligatorios.",
      });
      return;
    }

    const documentoActualizado = await prisma.documento.update({
      where: { id: Number(documentoId) },
      data: { estatusDoc: String(estatusDoc).toUpperCase() },
    });

    res.status(200).json({
      ok: true,
      mensaje: "Estatus del documento actualizado correctamente.",
      data: documentoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar estatus de documento:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error interno al actualizar el documento.",
    });
  }
};

// Endpoint para ver/descargar el archivo binario del documento
export const verDocumentoControl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { documentoId } = req.params;

    const documento = await prisma.documento.findUnique({
      where: { id: Number(documentoId) },
    });

    if (!documento || !documento.archivoBlob) {
      res
        .status(404)
        .json({ ok: false, mensaje: "Archivo no encontrado en el servidor." });
      return;
    }

    let contentType = "application/pdf";
    if (
      documento.tipoDoc === "photo" ||
      documento.nombreArchivo.match(/\.(jpg|jpeg|png)$/i)
    ) {
      contentType = "image/jpeg";
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${documento.nombreArchivo}"`,
    );
    res.send(Buffer.from(documento.archivoBlob));
  } catch (error) {
    console.error("Error al visualizar documento:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error al intentar abrir el archivo." });
  }
};

// Aprobar aspirante, cambiar tipo de usuario a Alumno (ID 5), generar matrícula y credenciales
export const aprobarYGenerarCredencialesControl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    // ID 5 corresponde a "Alumno" en tu catálogo tipo_usuario
    const tipoUsuarioAlumnoId = 5;

    const resultado = await prisma.$transaction(async (tx) => {
      const aspirante = await tx.aspirante.findUnique({
        where: { id: Number(id) },
        include: { documentos: true },
      });

      if (!aspirante) {
        throw new Error("ASPIRANTE_NO_ENCONTRADO");
      }

      if (aspirante.matricula) {
        throw new Error("YA_TIENE_MATRICULA");
      }

      if (!aspirante.documentos || aspirante.documentos.length === 0) {
        throw new Error("SIN_DOCUMENTOS");
      }

      const documentosNoValidados = aspirante.documentos.some(
        (d) => d.estatusDoc !== "APROBADO",
      );

      if (documentosNoValidados) {
        throw new Error("DOCUMENTOS_PENDIENTES_O_RECHAZADOS");
      }

      const anioActual = "26";
      const prefijo = `B${anioActual}`;

      const ultimoAlumno = await tx.aspirante.findFirst({
        where: { matricula: { startsWith: prefijo } },
        orderBy: { matricula: "desc" },
      });

      let siguienteNumero = 1;
      if (ultimoAlumno && ultimoAlumno.matricula) {
        const partesNumericas = ultimoAlumno.matricula.replace(prefijo, "");
        const numeroExtraido = parseInt(partesNumericas, 10);
        if (!isNaN(numeroExtraido)) {
          siguienteNumero = numeroExtraido + 1;
        }
      }

      const nuevaMatricula = `${prefijo}${String(siguienteNumero).padStart(6, "0")}`;
      const passwordAleatorio = crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase();

      const aspiranteActualizado = await tx.aspirante.update({
        where: { id: Number(id) },
        data: {
          matricula: nuevaMatricula,
          password: passwordAleatorio,
          tipoUsuarioId: tipoUsuarioAlumnoId,
          estatusAcademico: "ACTIVO_REGULAR",
        },
      });

      await tx.validacionExpediente.upsert({
        where: { aspiranteId: Number(id) },
        update: {
          dictamenGeneral: "APROBADO",
          observaciones: null,
        },
        create: {
          aspiranteId: Number(id),
          dictamenGeneral: "APROBADO",
          observaciones: null,
          validadoPor: "Control Escolar",
          fechaValidacion: new Date(),
        },
      });

      return aspiranteActualizado;
    });

    // Envío del correo institucional en segundo plano
    transporter
      .sendMail({
        from: `"Sistema BELVER" <${process.env.SMTP_USER}>`,
        to: resultado.correoElectronico1,
        subject: "¡Documentos Validados y Asignación de Matrícula - BELVER!",
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px; color: #333333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="background-color: #0f172a; color: #ffffff; padding: 20px; text-align: center;">
              <h2 style="margin: 0; font-size: 20px;">¡Documentos Validados y Expediente Aprobado - Sistema BELVER!</h2>
            </div>
            <div style="padding: 30px;">
              <p>Estimado(a) <strong>${resultado.nombres}</strong>,</p>
              <p>Tus documentos han sido validados con éxito y tu expediente ha sido <strong>APROBADO</strong> por el departamento de Control Escolar.</p>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Matrícula Asignada:</strong> <span style="font-family: monospace; color: #1e3a8a; font-size: 16px;">${resultado.matricula}</span></p>
                <p style="margin: 5px 0;"><strong>Contraseña Única:</strong> <span style="font-family: monospace; color: #1e3a8a; font-size: 16px;">${resultado.password}</span></p>
              </div>
              <p>Guarda estos datos en un lugar seguro; los necesitarás para acceder a tu portal escolar.</p>
            </div>
          </div>
        </div>
      `,
        text: `Tus documentos fueron validados con éxito. Matrícula: ${resultado.matricula}, Contraseña: ${resultado.password}`,
      })
      .catch((emailError) => {
        console.error(
          "Advertencia: No se pudo enviar el correo de aprobación:",
          emailError,
        );
      });

    res.status(200).json({
      ok: true,
      mensaje: "¡Aspirante aprobado y credenciales generadas exitosamente!",
      data: {
        id: resultado.id,
        matricula: resultado.matricula,
        password: resultado.password,
      },
    });
  } catch (error: any) {
    console.error("Error en aprobación de control escolar:", error);

    if (error.message === "ASPIRANTE_NO_ENCONTRADO") {
      res.status(404).json({ ok: false, mensaje: "Aspirante no encontrado." });
      return;
    }
    if (
      error.message === "DOCUMENTOS_PENDIENTES_O_RECHAZADOS" ||
      error.message === "SIN_DOCUMENTOS"
    ) {
      res.status(400).json({
        ok: false,
        mensaje:
          "No se puede aprobar el expediente. Todos los documentos deben estar marcados explícitamente como 'Aprobado'.",
      });
      return;
    }
    if (error.message === "YA_TIENE_MATRICULA") {
      res.status(400).json({
        ok: false,
        mensaje: "El aspirante ya cuenta con una matrícula asignada.",
      });
      return;
    }

    res
      .status(500)
      .json({ ok: false, mensaje: "Error interno al procesar la aprobación." });
  }
};

// Endpoint para emitir observaciones y requerir correcciones al aspirante
export const emitirObservacionesControl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { observaciones } = req.body;

    if (!id || !observaciones || !observaciones.trim()) {
      res.status(400).json({
        ok: false,
        mensaje: "El ID y el texto de las observaciones son obligatorios.",
      });
      return;
    }

    const fechaActual = new Date();

    const controlActualizado = await prisma.validacionExpediente.upsert({
      where: { aspiranteId: Number(id) },
      update: {
        dictamenGeneral: "CON_OBSERVACIONES",
        observaciones: observaciones.trim(),
        fechaValidacion: fechaActual,
        validadoPor: "Control Escolar",
      },
      create: {
        aspiranteId: Number(id),
        dictamenGeneral: "CON_OBSERVACIONES",
        observaciones: observaciones.trim(),
        fechaValidacion: fechaActual,
        validadoPor: "Control Escolar",
      },
    });

    res.status(200).json({
      ok: true,
      mensaje: "Observaciones guardadas y enviadas al aspirante correctamente.",
      data: controlActualizado,
    });
  } catch (error) {
    console.error("Error al emitir observaciones:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error interno al guardar las observaciones.",
    });
  }
};
