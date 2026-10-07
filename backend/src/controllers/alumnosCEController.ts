import { Request, Response } from "express";
import prisma from "../config/prisma.js";

// Obtener la lista oficial de alumnos activos (aquellos que ya tienen matrícula asignada)
export const obtenerAlumnosActivos = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const alumnosCrudos = await prisma.aspirante.findMany({
      where: {
        matricula: { not: null },
      },
      include: {
        documentos: true,
        generoRel: true,
        subsistema: true,
        validacionExpedientes: true,
        tutorParentescoRel: true,
        discapacidades: {
          include: {
            discapacidad: true,
          },
        },
      },
      orderBy: { creadoEn: "desc" }, // Usamos creadoEn que es el campo estándar existente
    });

    // Mapeo seguro para inyectar textos formateados legibles para la interfaz
    const alumnos = alumnosCrudos.map((alumno: any) => {
      const listaDiscapacidades =
        alumno.discapacidades?.map((d: any) => d.discapacidad?.nombre) || [];

      return {
        ...alumno,
        identidadCulturalTexto: alumno.identidadCulturalId
          ? "REGISTRADA"
          : "NINGUNO",
        discapacidadesTexto:
          listaDiscapacidades.length > 0
            ? listaDiscapacidades.join(", ")
            : "Ninguna",
      };
    });

    res.status(200).json({
      ok: true,
      data: alumnos,
    });
  } catch (error) {
    console.error("Error al obtener el padrón de alumnos:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error interno al consultar el padrón de alumnos.",
    });
  }
};
