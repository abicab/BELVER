import { Request, Response } from "express";
import prisma from "../config/prisma.js";

// Obtener todos los ciclos escolares
export const obtenerCiclos = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const ciclos = await (prisma as any).cicloEscolar.findMany({
      orderBy: { creadoEn: "desc" },
    });
    res.status(200).json({ ok: true, data: ciclos });
  } catch (error) {
    console.error("Error al obtener ciclos escolares:", error);
    res
      .status(500)
      .json({
        ok: false,
        mensaje: "Error interno al obtener los ciclos escolares.",
      });
  }
};

// Crear un nuevo ciclo escolar
export const crearCiclo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      clave,
      claveIntersemestral,
      inicia,
      iniciaIntersemestral,
      termina,
      terminaIntersemestral,
      activo,
      fechaConformarExpediente,
      fechaConformarExpEdInter,
      ultimoFolio,
      ultimoFolioInter,
      inicioCurso,
      inicioCursoInter,
      fechaTaller,
      fechaTallerInter,
    } = req.body;

    if (!clave) {
      res
        .status(400)
        .json({
          ok: false,
          mensaje: "La clave del ciclo escolar es obligatoria.",
        });
      return;
    }

    if (activo === 1 || activo === "1") {
      await (prisma as any).cicloEscolar.updateMany({
        where: { activo: 1 },
        data: { activo: 0 },
      });
    }

    const nuevoCiclo = await (prisma as any).cicloEscolar.create({
      data: {
        clave: String(clave).trim().toUpperCase(),
        claveIntersemestral: claveIntersemestral
          ? String(claveIntersemestral).trim().toUpperCase()
          : null,
        inicia: inicia ? new Date(inicia) : null,
        iniciaIntersemestral: iniciaIntersemestral
          ? new Date(iniciaIntersemestral)
          : null,
        termina: termina ? new Date(termina) : null,
        terminaIntersemestral: terminaIntersemestral
          ? new Date(terminaIntersemestral)
          : null,
        activo: Number(activo) || 0,
        fechaConformarExpediente: fechaConformarExpediente
          ? new Date(fechaConformarExpediente)
          : null,
        fechaConformarExpEdInter: fechaConformarExpEdInter
          ? new Date(fechaConformarExpEdInter)
          : null,
        ultimoFolio: ultimoFolio || null,
        ultimoFolioInter: ultimoFolioInter || null,
        inicioCurso: inicioCurso ? new Date(inicioCurso) : null,
        inicioCursoInter: inicioCursoInter ? new Date(inicioCursoInter) : null,
        fechaTaller: fechaTaller ? new Date(fechaTaller) : null,
        fechaTallerInter: fechaTallerInter ? new Date(fechaTallerInter) : null,
      },
    });

    res
      .status(201)
      .json({
        ok: true,
        mensaje: "Ciclo escolar creado exitosamente.",
        data: nuevoCiclo,
      });
  } catch (error: any) {
    console.error("Error al crear ciclo escolar:", error);
    if (error.code === "P2002") {
      res
        .status(400)
        .json({ ok: false, mensaje: "La clave del ciclo escolar ya existe." });
      return;
    }
    res
      .status(500)
      .json({ ok: false, mensaje: "Error interno al crear el ciclo escolar." });
  }
};

// Actualizar un ciclo escolar existente
export const actualizarCiclo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      clave,
      claveIntersemestral,
      inicia,
      iniciaIntersemestral,
      termina,
      terminaIntersemestral,
      activo,
      fechaConformarExpediente,
      fechaConformarExpEdInter,
      ultimoFolio,
      ultimoFolioInter,
      inicioCurso,
      inicioCursoInter,
      fechaTaller,
      fechaTallerInter,
    } = req.body;

    if (activo === 1 || activo === "1") {
      await (prisma as any).cicloEscolar.updateMany({
        where: { id: { not: Number(id) } },
        data: { activo: 0 },
      });
    }

    const cicloActualizado = await (prisma as any).cicloEscolar.update({
      where: { id: Number(id) },
      data: {
        clave: clave ? String(clave).trim().toUpperCase() : undefined,
        claveIntersemestral:
          claveIntersemestral !== undefined
            ? claveIntersemestral
              ? String(claveIntersemestral).toUpperCase()
              : null
            : undefined,
        inicia:
          inicia !== undefined ? (inicia ? new Date(inicia) : null) : undefined,
        iniciaIntersemestral:
          iniciaIntersemestral !== undefined
            ? iniciaIntersemestral
              ? new Date(iniciaIntersemestral)
              : null
            : undefined,
        termina:
          termina !== undefined
            ? termina
              ? new Date(termina)
              : null
            : undefined,
        terminaIntersemestral:
          terminaIntersemestral !== undefined
            ? terminaIntersemestral
              ? new Date(terminaIntersemestral)
              : null
            : undefined,
        activo: activo !== undefined ? Number(activo) : undefined,
        fechaConformarExpediente:
          fechaConformarExpediente !== undefined
            ? fechaConformarExpediente
              ? new Date(fechaConformarExpediente)
              : null
            : undefined,
        fechaConformarExpEdInter:
          fechaConformarExpEdInter !== undefined
            ? fechaConformarExpEdInter
              ? new Date(fechaConformarExpEdInter)
              : null
            : undefined,
        ultimoFolio: ultimoFolio !== undefined ? ultimoFolio : undefined,
        ultimoFolioInter:
          ultimoFolioInter !== undefined ? ultimoFolioInter : undefined,
        inicioCurso:
          inicioCurso !== undefined
            ? inicioCurso
              ? new Date(inicioCurso)
              : null
            : undefined,
        inicioCursoInter:
          inicioCursoInter !== undefined
            ? inicioCursoInter
              ? new Date(inicioCursoInter)
              : null
            : undefined,
        fechaTaller:
          fechaTaller !== undefined
            ? fechaTaller
              ? new Date(fechaTaller)
              : null
            : undefined,
        fechaTallerInter:
          fechaTallerInter !== undefined
            ? fechaTallerInter
              ? new Date(fechaTallerInter)
              : null
            : undefined,
      },
    });

    res
      .status(200)
      .json({
        ok: true,
        mensaje: "Ciclo escolar actualizado exitosamente.",
        data: cicloActualizado,
      });
  } catch (error) {
    console.error("Error al actualizar ciclo escolar:", error);
    res
      .status(500)
      .json({
        ok: false,
        mensaje: "Error interno al actualizar el ciclo escolar.",
      });
  }
};

// Eliminar un ciclo escolar
export const eliminarCiclo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    await (prisma as any).cicloEscolar.delete({
      where: { id: Number(id) },
    });
    res
      .status(200)
      .json({ ok: true, mensaje: "Ciclo escolar eliminado exitosamente." });
  } catch (error) {
    console.error("Error al eliminar ciclo escolar:", error);
    res
      .status(500)
      .json({
        ok: false,
        mensaje: "Error interno al eliminar el ciclo escolar.",
      });
  }
};
