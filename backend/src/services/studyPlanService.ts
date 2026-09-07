import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CargaMateriaInput {
  aspiranteId: number;
  materiaIds: number[];
  semestre: number;
  modulo: number;
}

export class StudyPlanService {
  /**
   * Obtiene todos los planes de estudio junto con sus materias asociadas.
   */
  static async obtenerTodos() {
    return await prisma.planEstudio.findMany({
      include: {
        materias: {
          orderBy: [
            { semestre: 'asc' },
            { modulo: 'asc' },
          ],
        },
      },
    });
  }

  /**
   * Valida la inscripción de materias respetando el límite por módulo y la seriación.
   */
  static async validarEInscribirMaterias({
    aspiranteId,
    materiaIds,
    semestre,
    modulo,
  }: CargaMateriaInput) {
    // 1. Regla de Límite de materias por módulo
    const limitePermitido = semestre >= 4 ? 4 : 3;

    if (materiaIds.length > limitePermitido) {
      throw new Error(
        `Para el semestre ${semestre} (Módulo ${modulo}), el límite máximo es de ${limitePermitido} materias. Seleccionaste ${materiaIds.length}.`
      );
    }

    // 2. Verificar Prerrequisitos / Seriación de materias
    for (const materiaId of materiaIds) {
      const seriaciones = await prisma.seriacion.findMany({
        where: { materiaId },
        include: { prerrequisito: true },
      });

      for (const req of seriaciones) {
        const aprobado = await prisma.historialAcademico.findFirst({
          where: {
            aspiranteId,
            materiaId: req.prerrequisitoMateriaId,
            estatus: 'APROBADA',
          },
        });

        if (!aprobado) {
          throw new Error(
            `No se puede cursar la materia seleccionada. Es necesario haber aprobado previamente: ${req.prerrequisito.nombre} (${req.prerrequisito.codigo}).`
          );
        }
      }
    }

    // 3. Registrar en Historial Académico
    const inscripciones = await prisma.$transaction(
      materiaIds.map((materiaId) =>
        prisma.historialAcademico.upsert({
          where: {
            aspiranteId_materiaId: { aspiranteId, materiaId },
          },
          update: { estatus: 'CURSANDO' },
          create: {
            aspiranteId,
            materiaId,
            estatus: 'CURSANDO',
          },
        })
      )
    );

    return inscripciones;
  }
}