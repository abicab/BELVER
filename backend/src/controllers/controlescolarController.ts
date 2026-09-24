import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import crypto from "crypto";

// Obtener lista de aspirantes con filtros para Control Escolar
export const obtenerAspirantesControlEscolar = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { estatus, modalidad, busqueda } = req.query;

    const whereClause: any = {};

    //if (estatus && estatus !== "TODOS") {
    //  whereClause.rol = String(estatus).toUpperCase();
    //}

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

    const aspirantes = await prisma.aspirante.findMany({
      where: whereClause,
      include: {
        documentos: true,
        generoRel: true,
        subsistema: true,
        validacionExpedientes: true,
        identidadCultural: true,
      },
      orderBy: { creadoEn: "desc" },
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

    // Detectar el tipo MIME basándose en la extensión o tipo de documento
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

// Aprobar aspirante, generar matrícula B26000001 y contraseña segura
export const aprobarYGenerarCredencialesControl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

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

      // --- VALIDACIÓN ESTRICTA DE DOCUMENTOS ---
      if (!aspirante.documentos || aspirante.documentos.length === 0) {
        throw new Error("SIN_DOCUMENTOS");
      }

      // Verificamos si hay algún documento que NO esté validado (es decir, esté en "EN REVISIÓN" o "RECHAZADO")
      const documentosNoValidados = aspirante.documentos.some(
        (d) => d.estatusDoc !== "VALIDADO",
      );

      if (documentosNoValidados) {
        throw new Error("DOCUMENTOS_PENDIENTES_O_RECHAZADOS");
      }
      // ----------------------------------------

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
          rol: "ALUMNO",
        },
      });

      await tx.validacionExpediente.upsert({
        where: { aspiranteId: Number(id) },
        update: { dictamenGeneral: "APROBADO" },
        create: {
          aspiranteId: Number(id),
          dictamenGeneral: "APROBADO",
          validadoPor: "Control Escolar",
          fechaValidacion: new Date(),
        },
      });

      return aspiranteActualizado;
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
          "No se puede aprobar el expediente. Todos los documentos deben estar marcados explícitamente como 'Validado ✓'.",
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

    // Guardar o actualizar en la tabla ValidacionExpedientes
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
