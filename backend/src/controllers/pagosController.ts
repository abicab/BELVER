// backend/src/controllers/pagosController.ts
import { Request, Response } from "express";
import prisma from "../config/prisma.js";

// 1. Buscar estudiantes/aspirantes por matrícula o nombre
export const buscarEstudiantesPagos = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { q } = req.query;
    const query = q ? String(q).trim() : "";

    const aspirantes = await prisma.aspirante.findMany({
      where: {
        OR: [
          { matricula: { contains: query } },
          { nombres: { contains: query } },
          { apellidoPaterno: { contains: query } },
        ],
      },
      select: {
        id: true,
        matricula: true,
        nombres: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        curp: true,
      },
      take: 10,
    });

    // Mapeamos para que coincida limpiamente con el formato que espera el frontend
    const resultado = aspirantes.map((a) => ({
      id: a.id,
      matricula: a.matricula || "S/M",
      nombre:
        `${a.nombres} ${a.apellidoPaterno} ${a.apellidoMaterno || ""}`.trim(),
      curp: a.curp,
    }));

    res.status(200).json({ ok: true, data: resultado });
  } catch (error) {
    console.error("Error al buscar estudiantes para pagos:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error al buscar estudiantes." });
  }
};

// 2. Obtener los últimos 5 registros de pagos recientes con datos del aspirante
export const obtenerPagosRecientes = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const pagos = await prisma.pago.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        aspirante: {
          select: {
            matricula: true,
            nombres: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            curp: true,
          },
        },
      },
    });

    const pagosMapeados = pagos.map((p) => ({
      id: p.id,
      matricula: p.aspirante.matricula || "S/M",
      aspirante:
        `${p.aspirante.nombres} ${p.aspirante.apellidoPaterno} ${p.aspirante.apellidoMaterno || ""}`.trim(),
      curp: p.aspirante.curp,
      concepto: p.concepto,
      monto: p.monto,
      fechaPago: p.fechaPago,
      metodo: p.metodo,
      estatus: p.estatus,
    }));

    res.status(200).json({ ok: true, data: pagosMapeados });
  } catch (error) {
    console.error("Error al obtener el historial de pagos:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error al consultar los pagos." });
  }
};

// 3. Registrar pago (Manual o Layout) vinculado al aspiranteId
export const registrarPago = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { aspiranteId, concepto, monto, metodo } = req.body;

    if (!aspiranteId || !concepto || !monto || !metodo) {
      res
        .status(400)
        .json({
          ok: false,
          mensaje: "Faltan datos obligatorios para registrar el pago.",
        });
      return;
    }

    const fechaActual = new Date().toISOString().split("T")[0];

    const nuevoPago = await prisma.pago.create({
      data: {
        aspiranteId: Number(aspiranteId),
        concepto,
        monto: parseFloat(monto),
        fechaPago: fechaActual,
        metodo,
        estatus: "CONCILIADO",
      },
      include: {
        aspirante: {
          select: {
            matricula: true,
            nombres: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            curp: true,
          },
        },
      },
    });

    const pagoFormateado = {
      id: nuevoPago.id,
      matricula: nuevoPago.aspirante.matricula || "S/M",
      aspirante:
        `${nuevoPago.aspirante.nombres} ${nuevoPago.aspirante.apellidoPaterno} ${nuevoPago.aspirante.apellidoMaterno || ""}`.trim(),
      curp: nuevoPago.aspirante.curp,
      concepto: nuevoPago.concepto,
      monto: nuevoPago.monto,
      fechaPago: nuevoPago.fechaPago,
      metodo: nuevoPago.metodo,
      estatus: nuevoPago.estatus,
    };

    res.status(201).json({
      ok: true,
      mensaje: "Pago registrado y conciliado con éxito.",
      data: pagoFormateado,
    });
  } catch (error) {
    console.error("Error al registrar el pago:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error interno al registrar el pago." });
  }
};
