// historialController.ts

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Normaliza acentos y mayúsculas para reconocer cualquier variante de revalidación.
const esTipoRevalidacion = (tipo: string | null | undefined): boolean => {
  return String(tipo || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .includes("revalidacion");
};

export const getAlumnosHistorial = async (req: Request, res: Response) => {
  try {
    const tipo = String(req.query.tipo || "").toLowerCase();

    // 'revalid' permite encontrar Revalidación y Revalidacion en MySQL
    // cuando la columna utiliza una intercalación habitual case-insensitive.
    const whereCondition = tipo === "revalidacion"
      ? { tipoAdmision: { contains: "revalid" } }
      : {};

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

export const getPlanesEstudioConMaterias = async (_req: Request, res: Response) => {
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

export const getHistorialPorAlumno = async (req: Request, res: Response) => {
  try {
    const aspiranteId = Number(req.params.aspiranteId);

    if (!Number.isInteger(aspiranteId) || aspiranteId <= 0) {
      return res.status(400).json({ error: "El identificador del alumno no es válido." });
    }

    const historial = await prisma.historialAcademico.findMany({
      where: { aspiranteId },
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

export const asignarMateriasHistorial = async (req: Request, res: Response) => {
  try {
    const { aspiranteId, planEstudioClave, materiasAsignadas } = req.body;

    const idAlumno = Number(aspiranteId);

    if (
      !Number.isInteger(idAlumno) ||
      idAlumno <= 0 ||
      typeof planEstudioClave !== "string" ||
      !planEstudioClave.trim() ||
      !Array.isArray(materiasAsignadas) ||
      materiasAsignadas.length === 0
    ) {
      return res.status(400).json({ error: "Datos incompletos para realizar la asignación." });
    }

    const alumnoVerif = await prisma.aspirante.findUnique({
      where: { id: idAlumno },
      select: { matricula: true, tipoAdmision: true },
    });

    if (!alumnoVerif) {
      return res.status(404).json({ error: "No se encontró el alumno seleccionado." });
    }

    // Los alumnos regulares/de nuevo ingreso necesitan matrícula.
    // Los revalidantes pueden capturarse con su folio de aspirante.
    if (!alumnoVerif.matricula && !esTipoRevalidacion(alumnoVerif.tipoAdmision)) {
      return res.status(400).json({
        error: "El alumno necesita matrícula para asignar su historial. La excepción aplica únicamente para alumnos de revalidación.",
      });
    }

    const planObj = await prisma.planEstudio.findUnique({
      where: { clave: planEstudioClave.trim() },
    });

    if (!planObj) {
      return res.status(404).json({ error: "El plan de estudios seleccionado no existe." });
    }

    const materiasIds = materiasAsignadas.map((item: any) => Number(item?.materiaId));
    if (materiasIds.some((id: number) => !Number.isInteger(id) || id <= 0)) {
      return res.status(400).json({ error: "Una o más materias tienen un identificador inválido." });
    }
    if (new Set(materiasIds).size !== materiasIds.length) {
      return res.status(400).json({ error: "No debes enviar una materia más de una vez." });
    }

    // Verifica que todas las materias pertenezcan al plan seleccionado.
    const materiasValidas = await prisma.materia.findMany({
      where: {
        id: { in: materiasIds },
        planEstudioId: planObj.id,
      },
      select: { id: true, semestre: true },
    });

    if (materiasValidas.length !== materiasIds.length) {
      return res.status(400).json({
        error: "Una o más materias no pertenecen al plan de estudios seleccionado.",
      });
    }

    const semestrePorMateria = new Map(materiasValidas.map((materia) => [materia.id, materia.semestre]));
    const fechaCapturaAutomatica = new Date();
    const periodoPeriodoLectivo = fechaCapturaAutomatica.toISOString().split("T")[0];
    const tiposExamenValidos = ["R1", "R2", "R3", "F", "RE", "TS", "AR", "AE"];

    // Normaliza y valida antes de abrir la transacción.
    const materiasNormalizadas = materiasAsignadas.map((item: any) => {
      const materiaId = Number(item.materiaId);
      const semestre = semestrePorMateria.get(materiaId);
      const calificacionVacia = item.calificacion === undefined || item.calificacion === null || item.calificacion === "";
      let notaFinal: number | null = null;

      if (!calificacionVacia) {
        const nota = Number(item.calificacion);
        if (!Number.isInteger(nota) || nota < 5 || nota > 10) {
          throw new Error(`Calificación inválida (${item.calificacion}). Solo se permiten enteros del 5 al 10.`);
        }
        notaFinal = nota;
      }

      const tipoExamen = String(item.tipoExamen || "F").toUpperCase();
      if (!tiposExamenValidos.includes(tipoExamen)) {
        throw new Error(`Tipo de examen inválido (${tipoExamen}).`);
      }

      const claveFolio = item.claveFolioProcedencia == null
        ? null
        : String(item.claveFolioProcedencia).trim();

      if (claveFolio && claveFolio.length > 50) {
        throw new Error("La clave/folio de procedencia no puede superar los 50 caracteres.");
      }

      let fechaInicio: Date | null = null;
      if (item.fechaInicioEstudios) {
        const fecha = new Date(item.fechaInicioEstudios);
        if (Number.isNaN(fecha.getTime())) {
          throw new Error("La fecha de inicio de estudios no es válida.");
        }
        fechaInicio = fecha;
      }

      const area = item.areaSemestre == null ? null : String(item.areaSemestre).trim();

      return {
        materiaId,
        semestre,
        notaFinal,
        tipoExamen,
        fechaInicio,
        claveFolio: claveFolio || null,
        area: area || null,
        estatus: notaFinal !== null && notaFinal >= 6
          ? "ACREDITADA"
          : notaFinal === 5
            ? "REPROBADA"
            : "CURSANDO",
      };
    });

    await prisma.$transaction(async (tx) => {
      await tx.aspirante.update({
        where: { id: idAlumno },
        data: { planEstudios: planObj.clave },
      });

      for (const item of materiasNormalizadas) {
        await tx.historialAcademico.upsert({
          where: {
            aspiranteId_materiaId: {
              aspiranteId: idAlumno,
              materiaId: item.materiaId,
            },
          },
          update: {
            planEstudioId: planObj.id,
            calificacion: item.notaFinal,
            tipoExamen: item.tipoExamen,
            estatus: item.estatus,
            fechaInicioEstudios: item.fechaInicio,
            claveFolioProcedencia: item.claveFolio,
            areaSemestre: item.area,
            planEstudiosCapturado: fechaCapturaAutomatica,
          },
          create: {
            aspiranteId: idAlumno,
            materiaId: item.materiaId,
            planEstudioId: planObj.id,
            calificacion: item.notaFinal,
            tipoExamen: item.tipoExamen,
            estatus: item.estatus,
            fechaInicioEstudios: item.fechaInicio,
            claveFolioProcedencia: item.claveFolio,
            areaSemestre: item.area,
            planEstudiosCapturado: fechaCapturaAutomatica,
          },
        });

        const materiaInscritaReg = await tx.materiaInscrita.upsert({
          where: {
            aspiranteId_materiaId: {
              aspiranteId: idAlumno,
              materiaId: item.materiaId,
            },
          },
          update: {
            planEstudioId: planObj.id,
            estatus: item.estatus,
          },
          create: {
            aspiranteId: idAlumno,
            materiaId: item.materiaId,
            planEstudioId: planObj.id,
            estatus: item.estatus,
          },
        });

        if (item.notaFinal !== null) {
          await tx.calificacion.upsert({
            where: {
              aspiranteId_materiaId_parcial_periodo: {
                aspiranteId: idAlumno,
                materiaId: item.materiaId,
                parcial: 1,
                periodo: periodoPeriodoLectivo,
              },
            },
            update: {
              planEstudioId: planObj.id,
              calificacion: item.notaFinal,
              materiaInscritaId: materiaInscritaReg.id,
            },
            create: {
              aspiranteId: idAlumno,
              materiaId: item.materiaId,
              planEstudioId: planObj.id,
              materiaInscritaId: materiaInscritaReg.id,
              parcial: 1,
              calificacion: item.notaFinal,
              periodo: periodoPeriodoLectivo,
            },
          });
        }
      }
    });

    return res.json({ message: "Historial académico actualizado correctamente." });
  } catch (error: any) {
    console.error("Error al asignar materias e historial:", error);
    return res.status(400).json({
      error: error?.message || "Ocurrió un error al guardar los cambios en el historial.",
    });
  }
};
