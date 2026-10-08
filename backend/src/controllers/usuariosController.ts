import { Request, Response } from "express";
import prisma from "../config/prisma.js";

// Mapeo inverso para IDs de TipoUsuario
const ROLE_CODE_TO_ID: Record<string, number> = {
  ADMIN: 1,
  ASPIRANTE: 2,
  CONTROL_ESCOLAR: 3,
  CAE: 4,
  ALUMNO: 5,
  ALUMNO_UNICO: 6,
};

// 1. OBTENER LISTA UNIFICADA DE TODOS LOS USUARIOS
export const obtenerTodosLosUsuarios = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // A. Obtener personal administrativo/interno
    const administrativos = await prisma.usuario.findMany({
      include: { tipoUsuario: true },
      orderBy: { creadoEn: "desc" },
    });

    // B. Obtener estudiantes y aspirantes
    const aspirantesYAlumnos = await prisma.aspirante.findMany({
      include: {
        tipoUsuarioRel: true,
        validacionExpedientes: true,
      },
      orderBy: { creadoEn: "desc" },
    });

    // C. Normalizar registros a una estructura unificada
    const usuariosFormateados = [
      ...administrativos.map((u) => {
        const roleCode =
          u.tipoUsuario.tipoUsuario.toUpperCase().replace(/\s+/g, "_");
        return {
          id: `ADM-${u.id}`,
          rawId: u.id,
          tipoTabla: "USUARIO" as const,
          name: `${u.nombres} ${u.apellidoPaterno} ${u.apellidoMaterno || ""}`.trim(),
          username: u.correo.split("@")[0],
          roleCode: roleCode,
          role: u.tipoUsuario.tipoUsuario,
          estatus: u.activo ? "Activo" : "Baja",
          email: u.correo,
          telefono: "Sin registrar",
          fechaRegistro: u.creadoEn.toISOString().split("T")[0],
        };
      }),
      ...aspirantesYAlumnos.map((a) => {
        let roleCode = "ASPIRANTE";
        if (a.tipoUsuarioId === 5) roleCode = "ALUMNO";
        if (a.tipoUsuarioId === 6) roleCode = "ALUMNO_UNICO";
        if (a.tipoUsuarioRel?.tipoUsuario) {
          roleCode = a.tipoUsuarioRel.tipoUsuario
            .toUpperCase()
            .replace(/\s+/g, "_");
        }

        return {
          id: `ASP-${a.id}`,
          rawId: a.id,
          tipoTabla: "ASPIRANTE" as const,
          name: `${a.nombres} ${a.apellidoPaterno} ${a.apellidoMaterno || ""}`.trim(),
          username: a.matricula || a.folio,
          roleCode: roleCode,
          role: a.tipoUsuarioRel?.tipoUsuario || "Aspirante",
          estatus: a.estatusAcademico === "BAJA" ? "Baja" : "Activo",
          email: a.correoElectronico1,
          telefono: a.telefonoCelular || "Sin registrar",
          fechaRegistro: a.creadoEn.toISOString().split("T")[0],
          curp: a.curp,
          matricula: a.matricula,
          folio: a.folio,
        };
      }),
    ];

    res.status(200).json({ ok: true, data: usuariosFormateados });
  } catch (error) {
    console.error("Error al obtener lista de usuarios unificada:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error interno al consultar la lista de usuarios.",
    });
  }
};

// 2. ACTUALIZAR ROL / TIPO DE USUARIO
export const cambiarRolUsuario = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tipoTabla, id } = req.params;
    const { roleCode } = req.body;

    const tipoUsuarioId = ROLE_CODE_TO_ID[roleCode];
    if (!tipoUsuarioId) {
      res.status(400).json({ ok: false, mensaje: "Rol no válido." });
      return;
    }

    if (tipoTabla === "USUARIO") {
      await prisma.usuario.update({
        where: { id: Number(id) },
        data: { id_tipoUsuario: tipoUsuarioId },
      });
    } else if (tipoTabla === "ASPIRANTE") {
      await prisma.aspirante.update({
        where: { id: Number(id) },
        data: { tipoUsuarioId: tipoUsuarioId },
      });
    } else {
      res.status(400).json({ ok: false, mensaje: "Origen de usuario no válido." });
      return;
    }

    res.status(200).json({
      ok: true,
      mensaje: "Rol actualizado correctamente en la base de datos.",
    });
  } catch (error) {
    console.error("Error al cambiar rol:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno al actualizar el rol." });
  }
};

// 3. CAMBIAR ESTATUS (ACTIVO / BAJA)
export const cambiarEstatusUsuario = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tipoTabla, id } = req.params;
    const { estatus } = req.body; // "Activo" | "Baja"

    if (tipoTabla === "USUARIO") {
      await prisma.usuario.update({
        where: { id: Number(id) },
        data: { activo: estatus === "Activo" },
      });
    } else if (tipoTabla === "ASPIRANTE") {
      await prisma.aspirante.update({
        where: { id: Number(id) },
        data: {
          estatusAcademico: estatus === "Activo" ? "ACTIVO_REGULAR" : "BAJA",
        },
      });
    } else {
      res.status(400).json({ ok: false, mensaje: "Origen de usuario no válido." });
      return;
    }

    res.status(200).json({
      ok: true,
      mensaje: "Estatus actualizado correctamente.",
    });
  } catch (error) {
    console.error("Error al cambiar estatus:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno al cambiar el estatus." });
  }
};

// 4. CREAR NUEVO USUARIO ADMINISTRATIVO O ALUMNO MANUAL
export const crearUsuarioManual = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, username, roleCode, email, telefono, estatus } = req.body;

    const tipoUsuarioId = ROLE_CODE_TO_ID[roleCode] || 1;
    const esEstudiante = roleCode === "ALUMNO" || roleCode === "ALUMNO_UNICO";

    const partesNombre = name.trim().split(" ");
    const nombres = partesNombre[0] || name;
    const apellidoPaterno = partesNombre[1] || "Sin Apellido";
    const apellidoMaterno = partesNombre.slice(2).join(" ") || null;

    if (esEstudiante) {
      const nuevoAlumno = await prisma.aspirante.create({
        data: {
          folio: `BEL-MANUAL-${Date.now()}`,
          matricula: username,
          password: "PasswordInicial123!",
          tipoUsuarioId: tipoUsuarioId,
          nombres,
          apellidoPaterno,
          apellidoMaterno,
          curp: `CURP${Date.now()}`,
          correoElectronico1: email,
          telefonoCelular: telefono || "2280000000",
          tipoAdmision: "nuevo_ingreso",
          estado: "Veracruz",
          municipio: "Xalapa",
          colonia: "Centro",
          calle: "Conocida",
          estatusAcademico: estatus === "Activo" ? "ACTIVO_REGULAR" : "BAJA",
        },
      });
      res.status(201).json({ ok: true, data: nuevoAlumno });
    } else {
      const nuevoUsuario = await prisma.usuario.create({
        data: {
          id_tipoUsuario: tipoUsuarioId,
          correo: email,
          contrasena: "PasswordInicial123!",
          nombres,
          apellidoPaterno,
          apellidoMaterno,
          activo: estatus === "Activo",
        },
      });
      res.status(201).json({ ok: true, data: nuevoUsuario });
    }
  } catch (error) {
    console.error("Error al crear usuario manualmente:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno al crear el usuario." });
  }
};