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

    const catalogosData: Record<string, string[]> = {};

    for (const cat of configuracionCatalogos) {
      let registros: { nombre: string }[] = [];

      switch (cat.nombreTabla) {
        case "tipoSecundaria":
          registros = await prisma.tipoSecundaria.findMany({
            select: { nombre: true },
          });
          break;
        case "subsistema":
          registros = await prisma.subsistema.findMany({
            select: { nombre: true },
          });
          break;
        case "medioEnterado":
          registros = await prisma.medioEnterado.findMany({
            select: { nombre: true },
          });
          break;
        case "genero":
          registros = await prisma.genero.findMany({
            select: { nombre: true },
          });
          break;
        case "identidadCultural":
          registros = await prisma.identidadCultural.findMany({
            select: { nombre: true },
          });
          break;
        case "situacionLaboral":
          registros = await prisma.situacionLaboral.findMany({
            select: { nombre: true },
          });
          break;
        case "discapacidad":
          registros = await prisma.discapacidad.findMany({
            select: { nombre: true },
          });
          break;
        case "parentesco":
          registros = await prisma.parentesco.findMany({
            select: { nombre: true },
          });
          break;
        case "tipoEstudiante":
          registros = await prisma.tipoEstudiante.findMany({
            select: { nombre: true },
          });
          break;
        case "semestre":
          registros = await prisma.semestre.findMany({
            select: { nombre: true },
          });
          break;
      }

      catalogosData[cat.nombreTabla] = registros.map((r) => r.nombre);
    }

    res.status(200).json({
      ok: true,
      data: catalogosData,
    });
  } catch (error) {
    console.error("Error al obtener los catálogos:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error interno al cargar los catálogos.",
    });
  }
};
