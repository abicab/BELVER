import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Obtener lista de alumnos/aspirantes activos o registrados
export const getAlumnosHistorial = async (req: Request, res: Response) => {
  try {
    const alumnos = await prisma.aspirante.findMany({
      select: {
        id: true,
        matricula: true,
        folio: true,
        nombres: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        curp: true,
        estatusAcademico: true,
        planEstudios: true,
      },
      orderBy: { id: "desc" },
    });
    return res.json(alumnos);
  } catch (error) {
    console.error("Error al obtener alumnos para historial:", error);
    return res.status(500).json({ error: "Error al cargar la lista de alumnos." });
  }
};

// Obtener planes de estudio con sus materias
export const getPlanesEstudioConMaterias = async (req: Request, res: Response) => {
  try {
    const planes = await prisma.planEstudio.findMany({
      where: { activo: true },
      include: {
        materias: {
          orderBy: [{ semestre: "asc" }, { codigo: "asc" }],
        },
      },
    });
    return res.json(planes);
  } catch (error) {
    console.error("Error al obtener planes de estudio:", error);
    return res.status(500).json({ error: "Error al cargar los planes de estudio." });
  }
};

// Obtener el historial académico actual de un alumno específico
export const getHistorialPorAlumno = async (req: Request, res: Response) => {
  try {
    const { aspiranteId } = req.params;
    const historial = await prisma.historialAcademico.findMany({
      where: { aspiranteId: Number(aspiranteId) },
      include: {
        materia: true,
      },
      orderBy: { materia: { semestre: "asc" } },
    });
    return res.json(historial);
  } catch (error) {
    console.error("Error al obtener historial del alumno:", error);
    return res.status(500).json({ error: "Error al consultar el historial académico." });
  }
};

// Asignar materias y calificaciones al historial académico del alumno
export const asignarMateriasHistorial = async (req: Request, res: Response) => {
  try {
    const { aspiranteId, planEstudioClave, materiasAsignadas, periodo } = req.body;

    if (!aspiranteId || !materiasAsignadas || !Array.isArray(materiasAsignadas) || materiasAsignadas.length === 0) {
      return res.status(400).json({ error: "Datos incompletos para realizar la asignación." });
    }

    const idAlumno = Number(aspiranteId);
    const periodoLectivo = periodo || "2024-2025";

    // Transacción atómica para consistencia total en DB
    await prisma.$transaction(async (tx) => {
      // 1. Actualizar el plan de estudios del alumno si se envió uno
      if (planEstudioClave) {
        await tx.aspirante.update({
          where: { id: idAlumno },
          data: { planEstudios: planEstudioClave },
        });
      }

      for (const item of materiasAsignadas) {
        const { materiaId, calificacion, tipoExamen } = item;
        const nota = calificacion !== undefined && calificacion !== null ? Number(calificacion) : null;
        const tipoEx = tipoExamen || "F";
        const estatusMateria = nota !== null && nota >= 6 ? "ACREDITADA" : "CURSANDO";

        // 2. Insertar o actualizar en HistorialAcademico
        await tx.historialAcademico.upsert({
          where: {
            aspiranteId_materiaId: {
              aspiranteId: idAlumno,
              materiaId: Number(materiaId),
            },
          },
          update: {
            calificacion: nota,
            tipoExamen: tipoEx,
            estatus: estatusMateria,
            periodo: periodoLectivo,
          },
          create: {
            aspiranteId: idAlumno,
            materiaId: Number(materiaId),
            calificacion: nota,
            tipoExamen: tipoEx,
            estatus: estatusMateria,
            periodo: periodoLectivo,
          },
        });

        // 3. Registrar o actualizar en MateriaInscrita para reflejo en tiempo real
        await tx.materiaInscrita.upsert({
          where: {
            aspiranteId_materiaId: {
              aspiranteId: idAlumno,
              materiaId: Number(materiaId),
            },
          },
          update: {
            estatus: estatusMateria,
          },
          create: {
            aspiranteId: idAlumno,
            materiaId: Number(materiaId),
            estatus: estatusMateria,
          },
        });

        // 4. Registrar en Calificacion si existe una nota capturada
        if (nota !== null) {
          const materiaInscritaReg = await tx.materiaInscrita.findUnique({
            where: {
              aspiranteId_materiaId: {
                aspiranteId: idAlumno,
                materiaId: Number(materiaId),
              },
            },
          });

          await tx.calificacion.upsert({
            where: {
              aspiranteId_materiaId_parcial_periodo: {
                aspiranteId: idAlumno,
                materiaId: Number(materiaId),
                parcial: 1,
                periodo: periodoLectivo,
              },
            },
            update: {
              calificacion: nota,
              materiaInscritaId: materiaInscritaReg?.id,
            },
            create: {
              aspiranteId: idAlumno,
              materiaId: Number(materiaId),
              materiaInscritaId: materiaInscritaReg?.id,
              parcial: 1,
              calificacion: nota,
              periodo: periodoLectivo,
            },
          });
        }
      }
    });

    return res.json({ message: "Materias y calificaciones asignadas con éxito al historial." });
  } catch (error) {
    console.error("Error al asignar materias e historial:", error);
    return res.status(500).json({ error: "Ocurrió un error al guardar los cambios en el historial." });
  }
};