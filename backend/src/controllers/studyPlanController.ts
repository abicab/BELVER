// studyPlanController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { StudyPlanService } from '../services/studyPlanService';

const prisma = new PrismaClient();

// Obtener todos los planes con sus materias y seriación
export const getPlanes = async (req: Request, res: Response) => {
  try {
    const planes = await StudyPlanService.obtenerTodos();
    res.json(planes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los planes de estudio' });
  }
};

// Crear Plan de Estudios con Materias y Seriación Integrada (Todo en Uno)
export const createPlanEstudio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clave, nombre, descripcion, materias, seriaciones } = req.body;

    const nuevoPlan = await prisma.$transaction(async (tx) => {
      // 1. Crear el plan de estudios
      const plan = await tx.planEstudio.create({
        data: {
          clave,
          nombre,
          descripcion,
          materias: {
            create: (materias || []).map((m: any) => ({
              codigo: m.codigo,
              nombreCompleto: m.nombreCompleto || m.nombre,
              nombreCorto: m.nombreCorto || m.nombreCompleto || m.nombre,
              semestre: Number(m.semestre),
            }))
          }
        },
        include: { materias: true }
      });

      // 2. Mapear seriaciones si se enviaron desde el frontend
      if (seriaciones && Array.isArray(seriaciones) && seriaciones.length > 0) {
        for (const s of seriaciones) {
          const materiaActual = plan.materias.find(m => m.codigo === s.codigoMateria);
          const materiaPrerrequisito = plan.materias.find(m => m.codigo === s.codigoPrerrequisito);

          if (materiaActual && materiaPrerrequisito) {
            await tx.seriacion.create({
              data: {
                materiaId: materiaActual.id,
                prerrequisitoMateriaId: materiaPrerrequisito.id
              }
            });
          }
        }
      }

      return plan;
    });

    res.status(201).json(nuevoPlan);
  } catch (error: any) {
    res.status(400).json({ error: 'Error al crear el plan de estudio', details: error.message });
  }
};

// Inscribir materias a un alumno (Validando reglas)
export const inscribirMateriasModulo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { aspiranteId, materiaIds, semestre, modulo } = req.body;

    const resultado = await StudyPlanService.validarEInscribirMaterias({
      aspiranteId: Number(aspiranteId),
      materiaIds,
      semestre: Number(semestre),
      modulo: Number(modulo)
    });

    res.json({ mensaje: 'Inscripción realizada con éxito', resultado });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};