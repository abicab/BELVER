import { Request, Response } from "express";
import prisma from "../config/prisma.js";

export const obtenerCatalogos = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const configuracionCatalogos = await prisma.catalogo.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
    });

    const catalogosData: Record<string, { id: number; nombre: string }[]> = {};

    for (const cat of configuracionCatalogos) {
      let registros: { id: number; nombre: string }[] = [];

      switch (cat.nombreTabla) {
        case "subsistema":
          registros = await prisma.subsistema.findMany({
            where: { activo: true },
            select: { id: true, nombre: true },
            orderBy: { id: "asc" },
          });
          break;
        case "genero":
          registros = await prisma.genero.findMany({
            where: { activo: true },
            select: { id: true, nombre: true },
            orderBy: { id: "asc" },
          });
          break;
        case "identidadCultural":
          registros = await prisma.identidadCultural.findMany({
            where: { activo: true },
            select: { id: true, nombre: true },
            orderBy: { id: "asc" },
          });
          break;
        case "discapacidad":
          registros = await prisma.discapacidad.findMany({
            where: { activo: true },
            select: { id: true, nombre: true },
            orderBy: { id: "asc" },
          });
          break;
        case "parentesco":
          registros = await prisma.parentesco.findMany({
            where: { activo: true },
            select: { id: true, nombre: true },
            orderBy: { id: "asc" },
          });
          break;
        case "tipoEstudiante":
          registros = await prisma.tipoEstudiante.findMany({
            where: { activo: true },
            select: { id: true, nombre: true },
            orderBy: { id: "asc" },
          });
          break;
        case "semestre":
          registros = await prisma.semestre.findMany({
            where: { activo: true },
            select: { id: true, nombre: true },
            orderBy: { id: "asc" },
          });
          break;
      }

      if (registros.length > 0) {
        catalogosData[cat.nombreTabla] = registros;
      }
    }

    res.status(200).json({ ok: true, data: catalogosData });
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

    // Validación directa en BD para asegurar que el catálogo existe y está activo
    const catalogoConfig = await prisma.catalogo.findUnique({
      where: { nombreTabla },
    });

    if (!catalogoConfig || !catalogoConfig.activo) {
      res.status(404).json({
        ok: false,
        mensaje: `El catálogo '${nombreTabla}' no existe o no está activo.`,
      });
      return;
    }

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
