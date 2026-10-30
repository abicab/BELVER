import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { StudyPlanService } from '../services/studyPlanService';

const prisma = new PrismaClient();

// Obtener todos los planes con sus materias y seriaciones
export const getPlanes = async (_req: Request, res: Response) => {
  try {
    const planes = await StudyPlanService.obtenerTodos();
    res.json(planes);
  } catch (error) {
    console.error('Error al obtener planes:', error);
    res.status(500).json({ error: 'Error al obtener los planes de estudio' });
  }
};

// Crear Plan de Estudios con Materias y Seriación integrada
export const createPlanEstudio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clave, nombre, descripcion, materias, seriaciones } = req.body;
    if (!clave?.trim() || !nombre?.trim() || !Array.isArray(materias) || materias.length === 0) {
      res.status(400).json({ error: 'La clave, el nombre y al menos una materia son obligatorios.' });
      return;
    }

    const nuevoPlan = await prisma.$transaction(async (tx) => {
      const plan = await tx.planEstudio.create({
        data: {
          clave: clave.trim(),
          nombre: nombre.trim(),
          descripcion: descripcion || null,
          materias: {
            create: materias.map((m: any) => ({
              codigo: m.codigo.trim(),
              nombreCompleto: (m.nombreCompleto || m.nombre || '').trim(),
              nombreCorto: (m.nombreCorto || m.nombreCompleto || m.nombre || '').trim(),
              semestre: Number(m.semestre),
            })),
          },
        },
        include: { materias: true },
      });

      for (const s of (Array.isArray(seriaciones) ? seriaciones : [])) {
        if (!s.codigoMateria || !s.codigoPrerrequisito) continue;
        if (s.codigoMateria === s.codigoPrerrequisito) {
          throw new Error('Una materia no puede ser su propio prerrequisito.');
        }
        const actual = plan.materias.find((m) => m.codigo === s.codigoMateria);
        const requisito = plan.materias.find((m) => m.codigo === s.codigoPrerrequisito);
        if (!actual || !requisito) throw new Error('Una seriación contiene códigos de materias que no existen en este plan.');
        await tx.seriacion.create({
          data: { materiaId: actual.id, prerrequisitoMateriaId: requisito.id },
        });
      }
      return plan;
    });

    res.status(201).json(nuevoPlan);
  } catch (error: any) {
    console.error('Error al crear plan:', error);
    res.status(400).json({ error: error.message || 'Error al crear el plan de estudio' });
  }
};

// Actualizar datos, materias y seriaciones sin recrear las materias existentes.
export const updatePlanEstudio = async (req: Request, res: Response): Promise<void> => {
  const planId = Number(req.params.id);
  try {
    const { clave, nombre, descripcion, materias, seriaciones } = req.body;
    if (!Number.isInteger(planId) || planId <= 0) {
      res.status(400).json({ error: 'Identificador de plan inválido.' });
      return;
    }
    if (!clave?.trim() || !nombre?.trim() || !Array.isArray(materias) || materias.length === 0) {
      res.status(400).json({ error: 'La clave, el nombre y al menos una materia son obligatorios.' });
      return;
    }

    const actualizado = await prisma.$transaction(async (tx) => {
      const existente = await tx.planEstudio.findUnique({
        where: { id: planId },
        include: { materias: true },
      });
      if (!existente) throw new Error('No se encontró el plan de estudios.');

      const codigos = materias.map((m: any) => String(m.codigo || '').trim());
      if (codigos.some((c: string) => !c) || new Set(codigos).size !== codigos.length) {
        throw new Error('Todas las materias deben tener código y no puede haber códigos repetidos.');
      }

      await tx.planEstudio.update({
        where: { id: planId },
        data: { clave: clave.trim(), nombre: nombre.trim(), descripcion: descripcion || null },
      });

      const idsEnviados: number[] = [];
      const materiasActualizadas: any[] = [];
      for (const m of materias) {
        const datos = {
          codigo: String(m.codigo).trim(),
          nombreCompleto: String(m.nombreCompleto || m.nombre || '').trim(),
          nombreCorto: String(m.nombreCorto || m.nombreCompleto || m.nombre || '').trim(),
          semestre: Number(m.semestre),
        };
        if (!datos.nombreCompleto || !datos.nombreCorto || !Number.isInteger(datos.semestre) || datos.semestre < 1 || datos.semestre > 6) {
          throw new Error(`Revisa los datos de la materia ${datos.codigo}.`);
        }
        if (m.id) {
          const materiaExistente = existente.materias.find((item) => item.id === Number(m.id));
          if (!materiaExistente) throw new Error('Se recibió una materia que no pertenece a este plan.');
          const guardada = await tx.materia.update({ where: { id: materiaExistente.id }, data: datos });
          idsEnviados.push(guardada.id);
          materiasActualizadas.push(guardada);
        } else {
          const creada = await tx.materia.create({ data: { ...datos, planEstudioId: planId } });
          idsEnviados.push(creada.id);
          materiasActualizadas.push(creada);
        }
      }

      const eliminadas = existente.materias.filter((m) => !idsEnviados.includes(m.id));
      for (const materia of eliminadas) {
        const [historial, inscrita, calificacion] = await Promise.all([
          tx.historialAcademico.count({ where: { materiaId: materia.id } }),
          tx.materiaInscrita.count({ where: { materiaId: materia.id } }),
          tx.calificacion.count({ where: { materiaId: materia.id } }),
        ]);
        if (historial || inscrita || calificacion) {
          throw new Error(`No se puede eliminar la materia ${materia.codigo} porque ya tiene registros académicos asociados. Puedes conservarla o corregir sus datos.`);
        }
        await tx.materia.delete({ where: { id: materia.id } });
      }

      // Reemplazar únicamente las relaciones de seriación de las materias de este plan.
      const idsPlan = [...existente.materias.map((m) => m.id), ...materiasActualizadas.filter((m) => !existente.materias.some((old) => old.id === m.id)).map((m) => m.id)];
      await tx.seriacion.deleteMany({ where: { OR: [{ materiaId: { in: idsPlan } }, { prerrequisitoMateriaId: { in: idsPlan } }] } });

      const porCodigo = new Map(materiasActualizadas.map((m) => [m.codigo, m]));
      const pares = new Set<string>();
      for (const s of (Array.isArray(seriaciones) ? seriaciones : [])) {
        if (!s.codigoMateria || !s.codigoPrerrequisito) continue;
        if (s.codigoMateria === s.codigoPrerrequisito) throw new Error('Una materia no puede ser su propio prerrequisito.');
        const actual = porCodigo.get(s.codigoMateria);
        const requisito = porCodigo.get(s.codigoPrerrequisito);
        if (!actual || !requisito) throw new Error('Una seriación contiene códigos de materias que no existen en este plan.');
        const llave = `${actual.id}-${requisito.id}`;
        if (pares.has(llave)) continue;
        pares.add(llave);
        await tx.seriacion.create({ data: { materiaId: actual.id, prerrequisitoMateriaId: requisito.id } });
      }

      return await tx.planEstudio.findUnique({
        where: { id: planId },
        include: { materias: { orderBy: { semestre: 'asc' }, include: { prerrequisitos: true } } },
      });
    });

    res.json(actualizado);
  } catch (error: any) {
    console.error('Error al actualizar plan:', error);
    res.status(400).json({ error: error.message || 'Error al actualizar el plan de estudio' });
  }
};

// Inscribir materias a un alumno (Validando reglas)
export const inscribirMateriasModulo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { aspiranteId, materiaIds, semestre, modulo } = req.body;
    const resultado = await StudyPlanService.validarEInscribirMaterias({
      aspiranteId: Number(aspiranteId), materiaIds, semestre: Number(semestre), modulo: Number(modulo),
    });
    res.json({ mensaje: 'Inscripción realizada con éxito', resultado });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
