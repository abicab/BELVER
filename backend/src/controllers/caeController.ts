import { Request, Response } from "express";
import prisma from "../config/prisma.js";

// Obtener expedientes para el CAE
export const obtenerExpedientesCAE = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const aspirantes = await prisma.aspirantes.findMany({
      orderBy: { created_at: "desc" },
      include: {
        documentos_aspirante: true,
      },
    });

    res.status(200).json({
      ok: true,
      data: aspirantes,
    });
  } catch (error) {
    console.error("Error al consultar expedientes en el CAE:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error interno al obtener los expedientes de la base de datos.",
    });
  }
};

// Actualizar estatus del expediente
export const actualizarEstatusExpediente = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { estatus_expediente, matricula_asignada, password_unica } = req.body;

    const aspiranteActualizado = await prisma.aspirantes.update({
      where: { id: Number(id) },
      data: {
        estatus_expediente,
        ...(matricula_asignada && { matricula_asignada }),
        ...(password_unica && { password_unica }),
      },
    });

    res.status(200).json({
      ok: true,
      mensaje: "Expediente actualizado correctamente en la base de datos.",
      data: aspiranteActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar el expediente:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error al actualizar el estatus en la base de datos.",
    });
  }
};
