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

// Crear Plan de Estudios con Materias (Actualizado sin acuerdoSep ni totalCreditos, y con las nuevas columnas de materia)
export const createPlanEstudio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clave, nombre, descripcion, materias } = req.body;

    const nuevoPlan = await prisma.planEstudio.create({
      data: {
        clave,
        nombre,
        descripcion,
        materias: {
          create: (materias || []).map((m: any) => ({
            codigo: m.codigo,
            nombreCompleto: m.nombreCompleto || m.nombre, // Soporte retroactivo por si el frontend envía 'nombre'
            nombreCorto: m.nombreCorto || m.nombreCompleto || m.nombre,
            semestre: Number(m.semestre),
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