// backend/src/controllers/catalogController.ts
import { Request, Response } from "express";
import prisma from "../config/prisma.js";

export const obtenerCatalogos = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const [
      tiposSecundaria,
      subsistemasBachillerato,
      mediosEnterado,
      generoIdentidad,
      identidadCultural,
      situacionLaboral,
      discapacidades, // 🌟 1. Añadimos el nuevo catálogo de discapacidades
    ] = await Promise.all([
      prisma.tipoSecundariaCatalog.findMany({ orderBy: { nombre: "asc" } }),
      prisma.subsistemaBachilleratoCatalog.findMany({
        orderBy: { nombre: "asc" },
      }),
      prisma.medioEnteradoCatalog.findMany({ orderBy: { nombre: "asc" } }),
      prisma.generoIdentidadCatalog.findMany({ orderBy: { nombre: "asc" } }),
      prisma.identidadCulturalCatalog.findMany({ orderBy: { nombre: "asc" } }),
      prisma.situacionLaboralCatalog.findMany({ orderBy: { nombre: "asc" } }),
      prisma.discapacidadCatalog.findMany({ orderBy: { nombre: "asc" } }), // 🌟 2. Consultamos la base de datos
    ]);

    res.status(200).json({
      ok: true,
      data: {
        tiposSecundaria: tiposSecundaria.map((t) => t.nombre),
        subsistemasBachillerato: subsistemasBachillerato.map((s) => s.nombre),
        mediosEnterado: mediosEnterado.map((m) => m.nombre),
        generoIdentidad: generoIdentidad.map((g) => g.nombre),
        identidadCultural: identidadCultural.map((i) => i.nombre),
        situacionLaboral: situacionLaboral.map((l) => l.nombre),
        discapacidades: discapacidades.map((d) => d.nombre), // 🌟 3. Lo incluimos en la respuesta JSON
      },
    });
  } catch (error) {
    console.error("Error al obtener los catálogos institucionales:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error interno al consultar los catálogos.",
    });
  }
};
