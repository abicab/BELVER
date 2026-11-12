import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import prisma from "../config/prisma.js";

// Mapeo seguro y dinámico de los nombres de catálogos fijos del sistema
const getModelByCatalogName = (catalogo: string) => {
  const modelosConocidos: Record<string, string> = {
    subsistema: "subsistema",
    genero: "genero",
    identidadCultural: "identidadCultural",
    discapacidad: "discapacidad",
    parentesco: "parentesco",
    tipoEstudiante: "tipoEstudiante",
    semestre: "semestre",
    tipoUsuario: "tipoUsuario",
  };

  const nombreModelo = modelosConocidos[catalogo] || catalogo;
  return (prisma as any)[nombreModelo] || null;
};

// 1. Obtener todos los catálogos fijos disponibles en el sistema
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

// 2. Obtener un catálogo individual por nombre (Soporta tablas fijas y tablas dinámicas por SQL)
export const obtenerCatalogoPorNombre = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { nombreTabla } = req.params;
    const modeloActual = getModelByCatalogName(nombreTabla);

    if (modeloActual) {
      const registros = await modeloActual.findMany({ orderBy: { id: "asc" } });
      res.status(200).json({ ok: true, data: registros });
      return;
    }

    const nombreLimpio = nombreTabla.toLowerCase().replace(/[^a-z0-9_]/g, "");
    const registrosDinamicos = await prisma.$queryRawUnsafe(
      `SELECT * FROM \`${nombreLimpio}\` ORDER BY id ASC`,
    );

    res.status(200).json({ ok: true, data: registrosDinamicos });
  } catch (error) {
    console.error("Error al obtener el catálogo individual:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error interno al procesar el catálogo." });
  }
};

// 3. Crear un nuevo registro en el catálogo seleccionado
export const crearRegistroCatalogo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { nombreTabla } = req.params;
    const { nombre, activo } = req.body;
    const modeloActual = getModelByCatalogName(nombreTabla);

    if (!nombre || !nombre.trim()) {
      res
        .status(400)
        .json({
          ok: false,
          mensaje: "El nombre o descripción es obligatorio.",
        });
      return;
    }

    if (modeloActual) {
      const dataToCreate =
        nombreTabla === "tipoUsuario"
          ? { tipoUsuario: String(nombre).trim(), activo: activo ?? true }
          : { nombre: String(nombre).trim(), activo: activo ?? true };

      const nuevoRegistro = await modeloActual.create({ data: dataToCreate });
      res
        .status(201)
        .json({
          ok: true,
          mensaje: "Registro creado exitosamente.",
          data: nuevoRegistro,
        });
      return;
    }

    const nombreLimpio = nombreTabla.toLowerCase().replace(/[^a-z0-9_]/g, "");
    const estatusValido = activo !== undefined ? (activo ? 1 : 0) : 1;

    await prisma.$executeRawUnsafe(
      `INSERT INTO \`${nombreLimpio}\` (nombre, activo) VALUES (?, ?)`,
      String(nombre).trim(),
      estatusValido,
    );

    res.status(201).json({
      ok: true,
      mensaje: "Registro creado exitosamente.",
      data: { nombre: String(nombre).trim(), activo: Boolean(estatusValido) },
    });
  } catch (error: any) {
    console.error("Error al crear registro en catálogo:", error);
    if (error.code === "ER_DUP_ENTRY") {
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

// 4. Actualizar o realizar baja lógica de un registro
export const actualizarRegistroCatalogo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { nombreTabla, id } = req.params;
    const { nombre, activo } = req.body;
    const modeloActual = getModelByCatalogName(nombreTabla);

    if (modeloActual) {
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

      res
        .status(200)
        .json({
          ok: true,
          mensaje: "Registro actualizado exitosamente.",
          data: registroActualizado,
        });
      return;
    }

    const nombreLimpio = nombreTabla.toLowerCase().replace(/[^a-z0-9_]/g, "");
    const nuevoNombre = nombre !== undefined ? String(nombre).trim() : null;
    const nuevoActivo = activo !== undefined ? (activo ? 1 : 0) : null;

    if (nuevoNombre !== null && nuevoActivo !== null) {
      await prisma.$executeRawUnsafe(
        `UPDATE \`${nombreLimpio}\` SET nombre = ?, activo = ? WHERE id = ?`,
        nuevoNombre,
        nuevoActivo,
        Number(id),
      );
    } else if (nuevoNombre !== null) {
      await prisma.$executeRawUnsafe(
        `UPDATE \`${nombreLimpio}\` SET nombre = ? WHERE id = ?`,
        nuevoNombre,
        Number(id),
      );
    } else if (nuevoActivo !== null) {
      await prisma.$executeRawUnsafe(
        `UPDATE \`${nombreLimpio}\` SET activo = ? WHERE id = ?`,
        nuevoActivo,
        Number(id),
      );
    }

    res.status(200).json({
      ok: true,
      mensaje: "Registro actualizado exitosamente.",
      data: { id: Number(id), nombre: nuevoNombre, activo: nuevoActivo },
    });
  } catch (error) {
    console.error("Error al actualizar el registro del catálogo:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error interno al actualizar el registro." });
  }
};

// 5. ENFOQUE HÍBRIDO: Crea la tabla física en MySQL por SQL y registra el modelo en el schema.prisma
export const crearDefinicionCatalogo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { label, endpoint } = req.body;

    if (!label || !endpoint) {
      res
        .status(400)
        .json({
          ok: false,
          mensaje: "El nombre y el endpoint son obligatorios.",
        });
      return;
    }

    const nombreTablaDb = endpoint.toLowerCase().replace(/[^a-z0-9_]/g, "");
    const nombreModeloPrisma =
      nombreTablaDb.charAt(0).toUpperCase() + nombreTablaDb.slice(1);

    if (!nombreTablaDb) {
      res
        .status(400)
        .json({
          ok: false,
          mensaje: "El identificador de endpoint no es válido.",
        });
      return;
    }

    // A. Crear la tabla físicamente en MySQL al instante sin depender de la CLI de Prisma
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`${nombreTablaDb}\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL UNIQUE,
        activo BOOLEAN DEFAULT TRUE,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // B. Registrar de manera limpia el modelo correspondiente al final del archivo schema.prisma
    const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
    const schemaContent = fs.readFileSync(schemaPath, "utf8");

    if (!schemaContent.includes(`model ${nombreModeloPrisma}`)) {
      const nuevoModeloPrisma = `

model ${nombreModeloPrisma} {
  id     Int     @id @default(autoincrement())
  nombre String  @unique @db.VarChar(150)
  activo Boolean @default(true)

  @@map("${nombreTablaDb}")
}
`;
      fs.appendFileSync(schemaPath, nuevoModeloPrisma, "utf8");
    }

    res.status(201).json({
      ok: true,
      mensaje: `Catálogo "${label}" creado, tabla física generada en MySQL y registrado en el esquema exitosamente.`,
      data: {
        nombre: label.trim(),
        endpoint: nombreTablaDb,
      },
    });
  } catch (error: any) {
    console.error("Error al registrar el catálogo y su tabla física:", error);
    res.status(500).json({
      ok: false,
      mensaje:
        error.message || "Error interno al procesar la creación del catálogo.",
    });
  }
};
