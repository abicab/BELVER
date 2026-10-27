import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getPerfilAlumno = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const alumnoId = Number(id);

    if (!id || !Number.isInteger(alumnoId) || alumnoId <= 0) {
      res.status(400).json({ ok: false, error: "ID de alumno inválido." });
      return;
    }

    // 1. Obtener datos del alumno con sus relaciones en la base de datos
    const alumno = await prisma.aspirante.findUnique({
      where: { id: alumnoId },
      include: {
        documentos: true,
        materiasInscritas: {
          include: {
            materia: true,
            calificaciones: true,
          },
        },
        historiales: {
          include: {
            materia: true,
            planEstudio: true,
          },
        },
      },
    });

    if (!alumno) {
      res.status(404).json({ ok: false, error: "Alumno no encontrado." });
      return;
    }

    // Formatear dirección particular
    const direccion = `${alumno.calle || ''} ${alumno.numeroExterior ? '#' + alumno.numeroExterior : ''}, Col. ${alumno.colonia || ''}, ${alumno.municipio || ''}, ${alumno.estado || ''}. C.P. ${alumno.codigoPostal || ''}`.trim();

    // 2. Mapear materias activas en cursamiento
    const materiasCursando = alumno.materiasInscritas
      .filter((mi) => mi.estatus.toUpperCase() === "CURSANDO")
      .map((mi) => {
        const califObj = mi.calificaciones[mi.calificaciones.length - 1];
        return {
          id: mi.id,
          codigo: mi.materia.codigo,
          nombre: mi.materia.nombreCompleto,
          creditos: 8,
          calificacion: califObj ? califObj.calificacion : 0,
        };
      });

    // 3. Mapear documentos del expediente digital
    const documentosExpediente = alumno.documentos.map((doc) => ({
      id: doc.id.toString(),
      nombre: doc.nombreArchivo || doc.tipoDoc,
      subido: true,
      fecha: doc.creadoEn.toISOString().split("T")[0],
      formato: "PDF",
      esRevalidacion: doc.tipoDoc.toLowerCase().includes("revalidación") || doc.tipoDoc.toLowerCase().includes("equivalencia"),
    }));

    // 4. Construir Kárdex completo organizado por semestres
    const semestresMap: Record<number, any[]> = {};
    
    alumno.historiales.forEach((hist) => {
      const semestreNum = hist.materia.semestre || 1;
      if (!semestresMap[semestreNum]) {
        semestresMap[semestreNum] = [];
      }
      semestresMap[semestreNum].push({
        codigo: hist.materia.codigo,
        nombre: hist.materia.nombreCompleto,
        creditos: 8,
        calificacion: hist.calificacion || 0,
        estatus: hist.estatus === "ACREDITADA" ? "Acreditada" : hist.estatus === "REPROBADA" ? "Reprobada" : "Cursando",
      });
    });

    const kardexPlanCompleto = [1, 2, 3, 4, 5, 6].map((semNum) => {
      const materiasSem = semestresMap[semNum] || [];
      let nombreSemestre = `${semNum}° Semestre`;
      if (semNum === 2) nombreSemestre = `${semNum}° Semestre (En Cursamiento)`;
      if (semNum >= 3) nombreSemestre = `${semNum}° Semestre (Pendiente por Cursar)`;

      return {
        semestre: nombreSemestre,
        materias: materiasSem.length > 0 ? materiasSem : [
          { codigo: `MAT-${semNum}01`, nombre: `Materia por cursar del ${semNum}° Semestre`, creditos: 8, calificacion: 0, estatus: 'Por Cursar' }
        ],
      };
    });

    const studentResponse = {
      matricula: alumno.matricula || alumno.folio,
      curp: alumno.curp,
      nombre: alumno.nombres,
      apellidos: `${alumno.apellidoPaterno} ${alumno.apellidoMaterno || ''}`.trim(),
      direccion: direccion,
      modalidadIngreso: alumno.tipoAdmision || 'Regular',
      esRevalidante: (alumno.tipoAdmision || '').toLowerCase().includes('revalidación'),
      planEstudiosNombre: alumno.planEstudios || 'Plan de Estudios Bachillerato General SEP',
    };

    res.json({
      ok: true,
      alumno: studentResponse,
      materiasCursando,
      documentosExpediente,
      kardexPlanCompleto,
    });
  } catch (error: any) {
    console.error("Error al obtener perfil del alumno:", error);
    res.status(500).json({ ok: false, error: error.message || "Error al consultar perfil del alumno." });
  }
  
};

export const verDocumentoControl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentoId } = req.params;
    const idNumerico = Number(documentoId);

    if (!documentoId || !Number.isInteger(idNumerico) || idNumerico <= 0) {
      res.status(400).json({ ok: false, mensaje: "ID de documento inválido." });
      return;
    }

    const documento = await prisma.documento.findUnique({
      where: { id: idNumerico },
    });

    if (!documento || !documento.archivoBlob || documento.archivoBlob.length === 0) {
      res.status(404).json({ ok: false, mensaje: "Archivo no encontrado en el servidor." });
      return;
    }

    // Detectar el tipo de archivo por su extensión.
    const nombreArchivo = documento.nombreArchivo || "documento";
    const extension = nombreArchivo.split(".").pop()?.toLowerCase();

    const tiposMime: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    };

    const contentType = tiposMime[extension || ""] || "application/octet-stream";
    const archivo = Buffer.from(documento.archivoBlob);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", archivo.length);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${nombreArchivo.replace(/["\\\\\\r\\n]/g, "_")}"`
    );
    res.setHeader("X-Content-Type-Options", "nosniff");

    res.send(archivo);
  } catch (error) {
    console.error("Error al visualizar documento:", error);
    res.status(500).json({ ok: false, mensaje: "Error al intentar abrir el archivo." });
  }
};