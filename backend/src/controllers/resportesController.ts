import { Request, Response } from "express";
import prisma from "../config/prisma.js";

// Obtener datos globales y filtrados exclusivamente para el módulo de reportes institucionales
export const obtenerDatosReportes = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { estatus, modalidad } = req.query;

    const whereClause: any = {};

    // Filtro por modalidad (nuevo_ingreso / revalidacion)
    if (modalidad && modalidad !== "TODOS") {
      whereClause.tipoAdmision = String(modalidad);
    }

    const registrosCrudos = await prisma.aspirante.findMany({
      where: whereClause,
      include: {
        validacionExpedientes: true,
      },
      orderBy: { creadoEn: "desc" },
    });

    // Consultamos el ciclo escolar activo para la regla de los 5 días de prórroga en pendientes
    const cicloActivo = await (prisma as any).cicloEscolar.findFirst({
      where: { activo: 1 },
    });

    let fechaLimiteConProrroga: Date | null = null;
    if (cicloActivo?.fechaConformarExpediente) {
      fechaLimiteConProrroga = new Date(cicloActivo.fechaConformarExpediente);
      fechaLimiteConProrroga.setDate(fechaLimiteConProrroga.getDate() + 5); // Se agregan 5 días de gracia por prórroga
    }

    // Filtrado inteligente por estatus institucional (Alumnos Validados vs Aspirantes con Prórroga)
    const registrosFiltrados = registrosCrudos.filter((item: any) => {
      const tieneMatricula = Boolean(item.matricula);
      const fechaRegistro = new Date(item.creadoEn);

      if (estatus === "ALUMNOS") {
        return tieneMatricula; // Alumnos nuevos validados (con matrícula oficial)
      }

      if (estatus === "ASPIRANTES") {
        // Aspirantes no validados (sin matrícula)
        // Se incluyen si aún están dentro del plazo o si cayeron en la ventana de los 5 días de prórroga
        if (!tieneMatricula) {
          if (fechaLimiteConProrroga) {
            return fechaRegistro <= fechaLimiteConProrroga;
          }
          return true;
        }
        return false;
      }

      return true; // Si es 'TODOS'
    });

    res.status(200).json({
      ok: true,
      data: registrosFiltrados,
    });
  } catch (error) {
    console.error("Error al generar reporte institucional:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error interno al procesar el reporte institucional.",
    });
  }
};
