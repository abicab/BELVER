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

// Crear Plan de Estudios con Materias
export const createPlanEstudio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clave, nombre, acuerdoSep, totalCreditos, descripcion, materias } = req.body;

    const nuevoPlan = await prisma.planEstudio.create({
      data: {
        clave,
        nombre,
        acuerdoSep,
        totalCreditos: Number(totalCreditos),
        descripcion,
        materias: {
          create: materias.map((m: any) => ({
            codigo: m.codigo,
            nombre: m.nombre,
            semestre: Number(m.semestre),
            modulo: Number(m.modulo || 1),
            creditos: Number(m.creditos)
          }))
        }
      },
      include: { materias: true }
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