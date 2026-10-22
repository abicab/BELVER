import { Request, Response } from "express";
import prisma from "../config/prisma.js";

// Mapeo seguro de los nombres de catálogos enviados desde el frontend hacia los modelos de Prisma
const getModelByCatalogName = (catalogo: string) => {
  switch (catalogo) {
    case "subsistema":
      return (prisma as any).subsistema;
    case "genero":
      return (prisma as any).genero;
    case "identidadCultural":
      return (prisma as any).identidadCultural;
    case "discapacidad":
      return (prisma as any).discapacidad;
    case "parentesco":
      return (prisma as any).parentesco;
    case "tipoEstudiante":
      return (prisma as any).tipoEstudiante;
    case "semestre":
      return (prisma as any).semestre;
    case "tipoUsuario":
      return (prisma as any).tipoUsuario;
    default:
      return null;
  }
};

// 1. Obtener todos los catálogos juntos (Ideal para formularios de aspirantes/alumnos)
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
      tiposUsuario,
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
      (prisma as any).tipoUsuario.findMany({
        where: { activo: true },
        select: { id: true, tipoUsuario: true },
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
        tipoUsuario: tiposUsuario,
      },
    });
  } catch (error) {
    console.error("Error al obtener los catálogos:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error interno al cargar los catálogos." });
  }
};

// 2. Obtener un catálogo individual por nombre (Modificado para el CRUD del Admin: muestra activos e inactivos)
export const obtenerCatalogoPorNombre = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { nombreTabla } = req.params;
    const modeloActual = getModelByCatalogName(nombreTabla);

    if (!modeloActual) {
      res
        .status(400)
        .json({ ok: false, mensaje: "Modelo de catálogo no soportado." });
      return;
    }

    // Para el panel del Admin traemos todos los registros (para poder gestionar bajas lógicas)
    const registros = await modeloActual.findMany({
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

// 3. Crear un nuevo registro en el catálogo seleccionado (Para el CRUD del Administrador)
export const crearRegistroCatalogo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { nombreTabla } = req.params;
    const { nombre, activo } = req.body;
    const modeloActual = getModelByCatalogName(nombreTabla);

    if (!modeloActual) {
      res
        .status(400)
        .json({ ok: false, mensaje: "Modelo de catálogo no soportado." });
      return;
    }

    if (!nombre || !nombre.trim()) {
      res
        .status(400)
        .json({
          ok: false,
          mensaje: "El nombre o descripción es obligatorio.",
        });
      return;
    }

    // Estructura de datos adaptada si el modelo es tipoUsuario o usa la propiedad 'nombre'
    const dataToCreate =
      nombreTabla === "tipoUsuario"
        ? { tipoUsuario: String(nombre).trim(), activo: activo ?? true }
        : { nombre: String(nombre).trim(), activo: activo ?? true };

    const nuevoRegistro = await modeloActual.create({
      data: dataToCreate,
    });

    res.status(201).json({
      ok: true,
      mensaje: "Registro creado exitosamente.",
      data: nuevoRegistro,
    });
  } catch (error: any) {
    console.error("Error al crear registro en catálogo:", error);
    if (error.code === "P2002") {
      res
        .status(400)
        .json({ ok: false, mensaje: "Ya existe un registro con este nombre." });
      return;
    }
    res
      .status(500)
      .json({ ok: false, mensaje: "Error interno al crear el registro." });
  }
};

// 4. Actualizar o realizar baja lógica de un registro (Para el CRUD del Administrador)
export const actualizarRegistroCatalogo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { nombreTabla, id } = req.params;
    const { nombre, activo } = req.body;
    const modeloActual = getModelByCatalogName(nombreTabla);

    if (!modeloActual) {
      res
        .status(400)
        .json({ ok: false, mensaje: "Modelo de catálogo no soportado." });
      return;
    }

    const dataToUpdate: any = {};
    if (nombre !== undefined) {
      if (nombreTabla === "tipoUsuario") {
        dataToUpdate.tipoUsuario = String(nombre).trim();
      } else {
        dataToUpdate.nombre = String(nombre).trim();
      }
    }
    if (activo !== undefined) {
      dataToUpdate.activo = Boolean(activo);
    }

    const registroActualizado = await modeloActual.update({
      where: { id: Number(id) },
      data: dataToUpdate,
    });

    res.status(200).json({
      ok: true,
      mensaje: "Registro actualizado exitosamente.",
      data: registroActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar el registro del catálogo:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error interno al actualizar el registro." });
  }
};
