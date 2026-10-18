import { Request, Response } from "express";
import prisma from "../config/prisma.js";

// Obtener el padrón de alumnos (limitado a los 10 más recientes por defecto para evitar saturación)
export const obtenerAlumnosActivos = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const alumnosCrudos = await prisma.aspirante.findMany({
      where: {
        matricula: { not: null },
      },
      take: 10,
      include: {
        documentos: true,
        generoRel: true,
        subsistema: true,
        validacionExpedientes: true,
        tutorParentescoRel: true,
        identidadCultural: true,
        discapacidades: {
          include: {
            discapacidad: true,
          },
        },
      },
      orderBy: { creadoEn: "desc" },
    });

    const alumnos = alumnosCrudos.map((alumno: any) => {
      const listaDiscapacidades =
        alumno.discapacidades?.map((d: any) => d.discapacidad?.nombre) || [];

      return {
        ...alumno,
        identidadCulturalTexto: alumno.identidadCultural?.nombre || "NINGUNO",
        discapacidadesTexto:
          listaDiscapacidades.length > 0
            ? listaDiscapacidades.join(", ")
            : "Ninguna",
      };
    });

    res.status(200).json({
      ok: true,
      data: alumnos,
    });
  } catch (error) {
    console.error("Error al obtener el padrón de alumnos:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error interno al consultar el padrón de alumnos.",
    });
  }
};

// Cambiar estatus de un alumno (ACTIVO_REGULAR / BAJA)
export const cambiarEstatusAlumno = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { estatus } = req.body; // "Activo" | "Baja"

    const alumnoActualizado = await prisma.aspirante.update({
      where: { id: Number(id) },
      data: {
        estatusAcademico: estatus === "Activo" ? "ACTIVO_REGULAR" : "BAJA",
      },
    });

    res.status(200).json({
      ok: true,
      mensaje: "Estatus académico actualizado correctamente.",
      data: alumnoActualizado,
    });
  } catch (error) {
    console.error("Error al cambiar estatus del alumno:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error interno al cambiar el estatus del alumno.",
    });
  }
};

// Obtener el plan completo y calificaciones del alumno (Replicando la lógica del Historial Académico)
export const obtenerCalificacionesAlumno = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const alumno = await prisma.aspirante.findUnique({
      where: { id: Number(id) },
      include: {
        historiales: {
          include: {
            materia: true,
          },
        },
      },
    });

    if (!alumno) {
      res.status(404).json({ ok: false, mensaje: "Alumno no encontrado." });
      return;
    }

    // Si el alumno tiene un plan de estudios asignado, buscamos las materias de ese plan
    let materiasDelPlan: any[] = [];
    if (alumno.planEstudios) {
      const planObj = await prisma.planEstudio.findUnique({
        where: { clave: alumno.planEstudios },
        include: {
          materias: {
            orderBy: [{ semestre: "asc" }, { codigo: "asc" }],
          },
        },
      });
      if (planObj && planObj.materias) {
        materiasDelPlan = planObj.materias;
      }
    }

    // Cruzamos el plan completo con el historial del alumno (para mostrar materias aun sin calificación)
    const calificacionesMapeadas = materiasDelPlan.map((mat) => {
      const registroHistorial = alumno.historiales.find(
        (h: any) => h.materiaId === mat.id,
      );

      const nota = registroHistorial?.calificacion;
      const estatusReg = registroHistorial?.estatus || "PENDIENTE";

      return {
        materia: mat.nombreCompleto,
        codigo: mat.codigo,
        semestre: mat.semestre,
        parcial1: nota !== null && nota !== undefined ? nota : "-",
        parcial2: "-",
        final: nota !== null && nota !== undefined ? nota : "-",
        estatus: nota !== null && nota !== undefined ? estatusReg : "PENDIENTE",
      };
    });

    res.status(200).json({
      ok: true,
      data: {
        alumno: `${alumno.nombres} ${alumno.apellidoPaterno} ${alumno.apellidoMaterno || ""}`,
        matricula: alumno.matricula,
        curp: alumno.curp,
        planEstudios: alumno.planEstudios || null,
        calificaciones: calificacionesMapeadas,
      },
    });
  } catch (error) {
    console.error("Error al obtener calificaciones del alumno:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error interno al consultar las calificaciones.",
    });
  }
};
