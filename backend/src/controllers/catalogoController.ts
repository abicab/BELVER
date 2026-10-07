import { Request, Response } from "express";
import prisma from "../config/prisma.js";

export const obtenerCatalogos = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const [
      subsistemas,
      generos,
      identidadesCulturales,
      discapacidades,
      parentescos,
      tiposEstudiante,
      semestres,
    ] = await Promise.all([
      prisma.subsistema.findMany({
        where: { activo: true },
        select: { id: true, nombre: true },
        orderBy: { id: "asc" },
      }),
      prisma.genero.findMany({
        where: { activo: true },
        select: { id: true, nombre: true },
        orderBy: { id: "asc" },
      }),
      prisma.identidadCultural.findMany({
        where: { activo: true },
        select: { id: true, nombre: true },
        orderBy: { id: "asc" },
      }),
      prisma.discapacidad.findMany({
        where: { activo: true },
        select: { id: true, nombre: true },
        orderBy: { id: "asc" },
      }),
      prisma.parentesco.findMany({
        where: { activo: true },
        select: { id: true, nombre: true },
        orderBy: { id: "asc" },
      }),
      prisma.tipoEstudiante.findMany({
        where: { activo: true },
        select: { id: true, nombre: true },
        orderBy: { id: "asc" },
      }),
      prisma.semestre.findMany({
        where: { activo: true },
        select: { id: true, nombre: true },
        orderBy: { id: "asc" },
      }),
    ]);

    res.status(200).json({
      ok: true,
      data: {
        subsistema: subsistemas,
        genero: generos,
        identidadCultural: identidadesCulturales,
        discapacidad: discapacidades,
        parentesco: parentescos,
        tipoEstudiante: tiposEstudiante,
        semestre: semestres,
      },
    });
  } catch (error) {
    console.error("Error al obtener los catálogos:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error interno al cargar los catálogos." });
  }
};

export const obtenerCatalogoPorNombre = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { nombreTabla } = req.params;
    const modelosPermitidos: Record<string, any> = {
      subsistema: prisma.subsistema,
      genero: prisma.genero,
      identidadCultural: prisma.identidadCultural,
      discapacidad: prisma.discapacidad,
      parentesco: prisma.parentesco,
      tipoEstudiante: prisma.tipoEstudiante,
      semestre: prisma.semestre,
    };

    const modeloActual = modelosPermitidos[nombreTabla];
    if (!modeloActual) {
      res
        .status(400)
        .json({ ok: false, mensaje: "Modelo de catálogo no soportado." });
      return;
    }

    const registros = await modeloActual.findMany({
      where: { activo: true },
      select: { id: true, nombre: true },
      orderBy: { id: "asc" },
    });

    res.status(200).json({ ok: true, data: registros });
  } catch (error) {
    console.error("Error al obtener el catálogo individual:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error interno al procesar el catálogo." });
  }
};
