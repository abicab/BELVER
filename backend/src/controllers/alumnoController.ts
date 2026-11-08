import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const texto = (valor: unknown): string | null => {
  if (valor === null || valor === undefined) return null;
  const resultado = String(valor).trim();
  return resultado || null;
};

const fecha = (valor: Date | null | undefined): string | null => {
  if (!valor) return null;
  return new Date(valor).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const normalizarEstatus = (estatus: unknown, calificacion: number | null): string => {
  const valor = String(estatus || "").trim().toUpperCase();

  if (["ACREDITADA", "ACREDITADO", "APROBADA", "APROBADO"].includes(valor)) {
    return "ACREDITADA";
  }
  if (["REPROBADA", "REPROBADO"].includes(valor)) return "REPROBADA";
  if (["CURSANDO", "EN CURSO", "CURSANDO"].includes(valor)) return "CURSANDO";
  if (["PENDIENTE", "POR CURSAR", "NO CURSADA"].includes(valor)) return "PENDIENTE";

  if (calificacion !== null && calificacion !== undefined) {
    return calificacion >= 6 ? "ACREDITADA" : "REPROBADA";
  }
  return "PENDIENTE";
};

export const getPerfilAlumno = async (req: Request, res: Response): Promise<void> => {
  try {
    const alumnoId = Number(req.params.id);

    if (!Number.isInteger(alumnoId) || alumnoId <= 0) {
      res.status(400).json({ ok: false, error: "ID de alumno inválido." });
      return;
    }

    const alumno = await prisma.aspirante.findUnique({
      where: { id: alumnoId },
      include: {
        generoRel: true,
        identidadCultural: true,
        discapacidades: { include: { discapacidad: true } },
        tutorParentescoRel: true,
        subsistema: true,
        tipoEstudianteRel: true,
        semestreRel: true,
        validacionExpedientes: true,
        documentos: { orderBy: { creadoEn: "desc" } },
        historiales: {
          include: { materia: true, planEstudio: true },
          orderBy: { planEstudiosCapturado: "desc" },
        },
        materiasInscritas: {
          include: {
            materia: true,
            planEstudio: true,
            calificaciones: { orderBy: { creadoEn: "desc" } },
          },
        },
      },
    });

    if (!alumno) {
      res.status(404).json({ ok: false, error: "Alumno no encontrado." });
      return;
    }

    // El planEstudios guardado en Aspirante es la referencia principal.
    // Si no existe, se toma el plan relacionado con el historial más reciente.
    const historialMasReciente = alumno.historiales.find((h) => h.planEstudio) || null;
    const planClave = texto(alumno.planEstudios) || texto(historialMasReciente?.planEstudio?.clave);

    let plan = null;
    if (planClave) {
      plan = await prisma.planEstudio.findUnique({
        where: { clave: planClave },
        include: {
          materias: { orderBy: [{ semestre: "asc" }, { codigo: "asc" }] },
        },
      });
    }

    if (!plan && historialMasReciente?.planEstudio) {
      plan = await prisma.planEstudio.findUnique({
        where: { id: historialMasReciente.planEstudio.id },
        include: {
          materias: { orderBy: [{ semestre: "asc" }, { codigo: "asc" }] },
        },
      });
    }

    const historialPlan = plan
      ? alumno.historiales.filter((h) => h.planEstudioId === plan!.id)
      : [];
    const inscritasPlan = plan
      ? alumno.materiasInscritas.filter((m) => m.planEstudioId === plan!.id)
      : [];

    const historialPorMateria = new Map(historialPlan.map((h) => [h.materiaId, h]));
    const inscritaPorMateria = new Map(inscritasPlan.map((m) => [m.materiaId, m]));

    const materiasPlan = (plan?.materias || []).map((materia) => {
      const historial = historialPorMateria.get(materia.id);
      const inscrita = inscritaPorMateria.get(materia.id);
      const calificacionHistorial =
        historial?.calificacion !== null && historial?.calificacion !== undefined
          ? historial.calificacion
          : null;
      const calificacionInscrita = inscrita?.calificaciones?.[0]?.calificacion ?? null;
      const calificacion = calificacionHistorial ?? calificacionInscrita;
      const estatus = normalizarEstatus(
        historial?.estatus || inscrita?.estatus,
        calificacion,
      );

      return {
        id: materia.id,
        codigo: materia.codigo,
        nombre: materia.nombreCompleto,
        nombreCorto: materia.nombreCorto,
        semestre: materia.semestre,
        estatus,
        calificacion,
        tipoExamen: historial?.tipoExamen || null,
        fechaInicioEstudios: fecha(historial?.fechaInicioEstudios),
        claveFolioProcedencia: historial?.claveFolioProcedencia || null,
        areaSemestre: historial?.areaSemestre || null,
      };
    });

    const semestresMap = new Map<number, typeof materiasPlan>();
    materiasPlan.forEach((materia) => {
      const lista = semestresMap.get(materia.semestre) || [];
      lista.push(materia);
      semestresMap.set(materia.semestre, lista);
    });

    const kardexPlanCompleto = Array.from(semestresMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([numero, materias]) => ({
        numero,
        semestre: `${numero}° Semestre`,
        materias,
        total: materias.length,
        acreditadas: materias.filter((m) => m.estatus === "ACREDITADA").length,
        reprobadas: materias.filter((m) => m.estatus === "REPROBADA").length,
        cursando: materias.filter((m) => m.estatus === "CURSANDO").length,
        pendientes: materias.filter((m) => m.estatus === "PENDIENTE").length,
      }));

    const direccionPartes = [
      [alumno.calle, alumno.numeroExterior ? `No. ${alumno.numeroExterior}` : null,
        alumno.numeroInterior ? `Int. ${alumno.numeroInterior}` : null]
        .filter(Boolean).join(" "),
      alumno.colonia ? `Col. ${alumno.colonia}` : null,
      alumno.municipio,
      alumno.estado,
      alumno.pais,
      alumno.codigoPostal ? `C.P. ${alumno.codigoPostal}` : null,
    ].filter(Boolean);

    const nombreCompleto = [
      alumno.nombres,
      alumno.apellidoPaterno,
      alumno.apellidoMaterno,
    ].filter(Boolean).join(" ");

    const alumnoResponse = {
      id: alumno.id,
      nombre: alumno.nombres,
      apellidos: [alumno.apellidoPaterno, alumno.apellidoMaterno].filter(Boolean).join(" "),
      nombreCompleto,
      matricula: alumno.matricula,
      folio: alumno.folio,
      curp: alumno.curp,
      fechaNacimiento: fecha(alumno.fechaNacimiento),
      genero: alumno.generoRel?.nombre || null,
      identidadCultural: alumno.identidadCultural?.nombre || null,
      discapacidades: alumno.discapacidades.map((d) => d.discapacidad.nombre),
      correoElectronico1: alumno.correoElectronico1,
      correoElectronico2: alumno.correoElectronico2,
      telefonoCelular: alumno.telefonoCelular,
      telefonoParticular: alumno.telefonoParticular,
      pais: alumno.pais,
      codigoPostal: alumno.codigoPostal,
      estado: alumno.estado,
      municipio: alumno.municipio,
      colonia: alumno.colonia,
      calle: alumno.calle,
      numeroExterior: alumno.numeroExterior,
      numeroInterior: alumno.numeroInterior,
      direccion: direccionPartes.join(", "),
      tutor: {
        nombreCompleto: [alumno.tutorNombres, alumno.tutorApellidoPaterno, alumno.tutorApellidoMaterno]
          .filter(Boolean).join(" ") || null,
        parentesco: alumno.tutorParentescoRel?.nombre || null,
        telefono: alumno.tutorTelefono,
      },
      modalidadIngreso: alumno.tipoAdmision,
      esRevalidante: String(alumno.tipoAdmision || "").toLowerCase().includes("revalid"),
      subsistemaProcedencia: alumno.subsistema?.nombre || alumno.otroSistemaProcedencia || null,
      sistemaProcedenciaLetra: alumno.sistemaProcedenciaLetra,
      cctEscuelaProcedencia: alumno.cctEscuelaProcedencia,
      nombreEscuelaProcedencia: alumno.nombreEscuelaProcedencia,
      otroSistemaProcedencia: alumno.otroSistemaProcedencia,
      semestresSeleccionados: alumno.semestresSeleccionados,
      tipoEstudiante: alumno.tipoEstudianteRel?.nombre || null,
      semestreActual: alumno.semestreRel?.nombre || null,
      estatusAcademico: alumno.estatusAcademico,
      esMigrado: alumno.esMigrado,
      fechaRegistro: fecha(alumno.creadoEn),
      fechaActualizacion: fecha(alumno.updatedAt),
      planEstudiosClave: plan?.clave || alumno.planEstudios || null,
      planEstudiosNombre: plan?.nombre || null,
      planEstudiosDescripcion: plan?.descripcion || null,
      dictamenExpediente: alumno.validacionExpedientes?.dictamenGeneral || "PENDIENTE",
      observacionesExpediente: alumno.validacionExpedientes?.observaciones || null,
      fechaValidacionExpediente: fecha(alumno.validacionExpedientes?.fechaValidacion),
    };

    const documentosExpediente = alumno.documentos.map((doc) => {
      const extension = doc.nombreArchivo.split(".").pop()?.toUpperCase() || "ARCHIVO";
      return {
        id: doc.id,
        tipo: doc.tipoDoc,
        nombre: doc.nombreArchivo,
        estatus: doc.estatusDoc,
        observaciones: doc.comentario,
        fecha: fecha(doc.creadoEn),
        extension,
        disponible: Boolean(doc.archivoBlob && doc.archivoBlob.length > 0),
      };
    });

    const materiasCursando = materiasPlan
      .filter((materia) => materia.estatus === "CURSANDO")
      .map((materia) => ({
        ...materia,
        id: materia.id,
      }));

    res.status(200).json({
      ok: true,
      alumno: alumnoResponse,
      resumenAcademico: {
        totalMaterias: materiasPlan.length,
        acreditadas: materiasPlan.filter((m) => m.estatus === "ACREDITADA").length,
        reprobadas: materiasPlan.filter((m) => m.estatus === "REPROBADA").length,
        cursando: materiasPlan.filter((m) => m.estatus === "CURSANDO").length,
        pendientes: materiasPlan.filter((m) => m.estatus === "PENDIENTE").length,
      },
      materiasCursando,
      documentosExpediente,
      kardexPlanCompleto,
    });
  } catch (error: any) {
    console.error("Error al obtener perfil del alumno:", error);
    res.status(500).json({
      ok: false,
      error: error?.message || "Error al consultar el perfil del alumno.",
    });
  }
};

export const verDocumentoControl = async (req: Request, res: Response): Promise<void> => {
  try {
    const documentoId = Number(req.params.documentoId);

    if (!Number.isInteger(documentoId) || documentoId <= 0) {
      res.status(400).json({ ok: false, mensaje: "ID de documento inválido." });
      return;
    }

    const documento = await prisma.documento.findUnique({
      where: { id: documentoId },
      select: {
        nombreArchivo: true,
        archivoBlob: true,
      },
    });

    if (!documento?.archivoBlob || documento.archivoBlob.length === 0) {
      res.status(404).json({
        ok: false,
        mensaje: "El archivo no existe o no está almacenado en el sistema.",
      });
      return;
    }

    const nombreArchivo = documento.nombreArchivo || "documento";
    const extension = nombreArchivo.split(".").pop()?.toLowerCase();
    const tiposMime: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    };
    const archivo = Buffer.from(documento.archivoBlob);
    const contentType = tiposMime[extension || ""] || "application/octet-stream";
    const nombreSeguro = nombreArchivo.replace(/["\\\r\n]/g, "_");

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", archivo.length);
    res.setHeader("Content-Disposition", `inline; filename="${nombreSeguro}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.send(archivo);
  } catch (error) {
    console.error("Error al visualizar documento:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error al intentar abrir el archivo.",
    });
  }
};
