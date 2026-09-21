import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma.js";

export async function validarCatalogoExistente(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { nombreTabla } = req.params;
    const cat = await prisma.catalogo.findUnique({ where: { nombreTabla } });

    if (!cat || !cat.activo) {
      return res
        .status(404)
        .json({ ok: false, mensaje: "Catálogo no válido o inactivo" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: "Error de validación" });
  }
}
