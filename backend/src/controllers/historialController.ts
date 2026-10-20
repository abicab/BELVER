import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Obtener lista de alumnos (todos o filtrados por revalidación)
export const getAlumnosHistorial = async (req: Request, res: Response) => {
  try {
    const { tipo } = req.query; // 'revalidacion' o undefined
    
    const whereCondition: any = {};
    if (tipo === "revalidacion") {
      whereCondition.tipoAdmision = {
        contains: "revalidación",
      };
    }

    const alumnos = await prisma.aspirante.findMany({
      where: whereCondition,
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
        tipoAdmision: true,
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
        planEstudio: true,
      },
      orderBy: { materia: { semestre: "asc" } },
    });
    return res.json(historial);
  } catch (error) {
    console.error("Error al obtener historial del alumno:", error);
    return res.status(500).json({ error: "Error al consultar el historial académico." });
  }
};

// Asignar materias y calificaciones enteras (5-10) validando que tenga matrícula
export const asignarMateriasHistorial = async (req: Request, res: Response) => {
  try {
    const { 
      aspiranteId, 
      planEstudioClave, 
      materiasAsignadas 
    } = req.body;

    if (!aspiranteId || !planEstudioClave || !materiasAsignadas || !Array.isArray(materiasAsignadas)) {
      return res.status(400).json({ error: "Datos incompletos para realizar la asignación." });
    }

    const idAlumno = Number(aspiranteId);

    // Validar que el alumno cuente con matrícula asignada
    const alumnoVerif = await prisma.aspirante.findUnique({
      where: { id: idAlumno },
      select: { matricula: true, tipoAdmision: true },
    });

    if (!alumnoVerif || !alumnoVerif.matricula) {
      return res.status(400).json({ 
        error: "No se le puede asignar un plan de estudios ni historial a un alumno de nuevo ingreso sin matrícula." 
      });
    }

    const planObj = await prisma.planEstudio.findUnique({
      where: { clave: planEstudioClave },
    });

    if (!planObj) {
      return res.status(404).json({ error: "El plan de estudios seleccionado no existe." });
    }

    const planEstudioId = planObj.id;
    const fechaCapturaAutomatica = new Date();
    const periodoPeriodoLectivo = fechaCapturaAutomatica.toISOString().split('T')[0];

    await prisma.$transaction(async (tx) => {
      // 1. Actualizar el plan de estudios del alumno
      await tx.aspirante.update({
        where: { id: idAlumno },
        data: { planEstudios: planEstudioClave },
      });

      for (const item of materiasAsignadas) {
        const { materiaId, calificacion, tipoExamen } = item;
        
        if (calificacion !== undefined && calificacion !== null && calificacion !== "") {
          const nota = Number(calificacion);
          if (isNaN(nota) || nota < 5 || nota > 10) {
            throw new Error(`Calificación inválida (${nota}). Solo se permiten enteros del 5 al 10.`);
          }
        }

        const notaFinal = calificacion !== undefined && calificacion !== null && calificacion !== "" ? Math.round(Number(calificacion)) : null;
        const tipoEx = tipoExamen || "F";
        const estatusMateria = notaFinal !== null && notaFinal >= 6 ? "ACREDITADA" : (notaFinal === 5 ? "REPROBADA" : "CURSANDO");

        // 2. Historial Académico
        await tx.historialAcademico.upsert({
          where: {
            aspiranteId_materiaId: {
              aspiranteId: idAlumno,
              materiaId: Number(materiaId),
            },
          },
          update: {
            planEstudioId: planEstudioId,
            calificacion: notaFinal,
            tipoExamen: tipoEx,
            estatus: estatusMateria,
            planEstudiosCapturado: fechaCapturaAutomatica,
          },
          create: {
            aspiranteId: idAlumno,
            materiaId: Number(materiaId),
            planEstudioId: planEstudioId,
            calificacion: notaFinal,
            tipoExamen: tipoEx,
            estatus: estatusMateria,
            planEstudiosCapturado: fechaCapturaAutomatica,
          },
        });

        // 3. Materia Inscrita
        await tx.materiaInscrita.upsert({
          where: {
            aspiranteId_materiaId: {
              aspiranteId: idAlumno,
              materiaId: Number(materiaId),
            },
          },
          update: {
            planEstudioId: planEstudioId,
            estatus: estatusMateria,
          },
          create: {
            aspiranteId: idAlumno,
            materiaId: Number(materiaId),
            planEstudioId: planEstudioId,
            estatus: estatusMateria,
          },
        });

        // 4. Calificación
        if (notaFinal !== null) {
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
                periodo: periodoPeriodoLectivo,
              },
            },
            update: {
              planEstudioId: planEstudioId,
              calificacion: notaFinal,
              materiaInscritaId: materiaInscritaReg?.id,
            },
            create: {
              aspiranteId: idAlumno,
              materiaId: Number(materiaId),
              planEstudioId: planEstudioId,
              materiaInscritaId: materiaInscritaReg?.id,
              parcial: 1,
              calificacion: notaFinal,
              periodo: periodoPeriodoLectivo,
            },
          });
        }
      }
    });

    return res.json({ message: "Historial académico actualizado correctamente con plan de estudios y calificaciones." });
  } catch (error: any) {
    console.error("Error al asignar materias e historial:", error);
    return res.status(500).json({ error: error.message || "Ocurrió un error al guardar los cambios en el historial." });
  }
};