import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { admissionSchema } from "../middlewares/admissionMiddleware.js";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const verificarDuplicado = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { curp } = req.query;
    if (!curp) {
      res.status(400).json({ ok: false, mensaje: "La CURP es obligatoria." });
      return;
    }
    const aspiranteExistente = await prisma.aspirante.findFirst({
      where: { curp: String(curp).toUpperCase() },
    });
    if (aspiranteExistente) {
      res.status(200).json({
        ok: true,
        existe: true,
        mensaje:
          "La CURP proporcionada ya se encuentra registrada en el sistema institucional de BELVER.",
      });
      return;
    }
    res.status(200).json({ ok: true, existe: false });
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error al verificar duplicados en el servidor.",
    });
  }
};

export const consultarEstatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { folio, curp } = req.query;
    if (!folio || !curp) {
      res
        .status(400)
        .json({ ok: false, mensaje: "El folio y la CURP son obligatorios." });
      return;
    }
    const aspirante = await prisma.aspirante.findFirst({
      where: {
        folio: String(folio).trim().toUpperCase(),
        curp: String(curp).trim().toUpperCase(),
      },
      include: {
        documentos: true,
        validacionExpedientes: true,
        discapacidades: { include: { discapacidad: true } },
      },
    });

    if (!aspirante) {
      res.status(404).json({
        ok: false,
        mensaje:
          "No se encontró ninguna solicitud con ese folio o la CURP no coincide.",
      });
      return;
    }

    const fechaVigenciaObj = aspirante.vigenciaFolio
      ? new Date(aspirante.vigenciaFolio)
      : new Date();
    const validacionActual = aspirante.validacionExpedientes || null;

    let fechaValidacionFormateada = null;
    if (validacionActual?.fechaValidacion) {
      fechaValidacionFormateada = new Date(
        validacionActual.fechaValidacion,
      ).toLocaleString("es-MX", {
        dateStyle: "medium" as any,
        timeStyle: "short",
      });
    }

    res.status(200).json({
      ok: true,
      data: {
        folio: aspirante.folio,
        aspirante:
          `${aspirante.apellidoPaterno} ${aspirante.apellidoMaterno || ""} ${aspirante.nombres}`.trim(),
        curp: aspirante.curp,
        modalidad:
          aspirante.tipoAdmision === "nuevo_ingreso"
            ? "NUEVO INGRESO (SECUNDARIA REGULAR)"
            : "REVALIDACIÓN / EQUIVALENCIA",
        fechaRegistro: aspirante.creadoEn.toISOString().split("T")[0],
        vigencia: fechaVigenciaObj.toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        estatus: validacionActual?.dictamenGeneral || "PENDIENTE",
        observaciones: validacionActual?.observaciones || null,
        fechaValidacion: fechaValidacionFormateada,
        matricula: aspirante.matricula || null,
        password: aspirante.password || null,
        discapacidades: aspirante.discapacidades.map(
          (d: any) => d.discapacidad.nombre,
        ),
        documentos: aspirante.documentos.map((doc: any) => ({
          id: doc.id,
          tipo: doc.tipoDoc,
          nombreArchivo: doc.nombreArchivo,
          estatusDoc: doc.estatusDoc,
          comentario: doc.comentario || null,
        })),
      },
    });
  } catch (error) {
    console.error("Error al consultar estatus:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error interno al procesar la consulta." });
  }
};

export const registrarAspirante = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const cicloActivo = await (prisma as any).cicloEscolar.findFirst({
      where: { activo: 1 },
    });

    if (!cicloActivo) {
      res.status(403).json({
        ok: false,
        mensaje:
          "No existe un ciclo escolar activo configurado en el sistema para permitir inscripciones.",
      });
      return;
    }

    const ahora = new Date();
    const fechaInicioCiclo = cicloActivo.inicia
      ? new Date(cicloActivo.inicia)
      : null;
    const fechaFinCiclo = cicloActivo.termina
      ? new Date(cicloActivo.termina)
      : null;

    if (
      (fechaInicioCiclo && ahora < fechaInicioCiclo) ||
      (fechaFinCiclo && ahora > fechaFinCiclo)
    ) {
      res.status(403).json({
        ok: false,
        mensaje:
          "El periodo de inscripción se encuentra cerrado o fuera de vigencia según el ciclo escolar actual.",
      });
      return;
    }

    // Determinamos la vigencia del folio extrayéndola directamente de la base de datos
    let fechaVigencia = new Date();
    const fechaBD =
      cicloActivo.fechaConformarExpediente ||
      cicloActivo.fecha_conformar_expediente ||
      cicloActivo.termina;

    if (fechaBD) {
      fechaVigencia = new Date(fechaBD);
    } else {
      fechaVigencia = new Date("2026-10-25T23:59:59");
    }

    const rawBody = { ...req.body };

    if (typeof rawBody.discapacidades === "string") {
      try {
        rawBody.discapacidades = JSON.parse(rawBody.discapacidades);
      } catch {
        rawBody.discapacidades = [];
      }
    }

    if (typeof rawBody.semestresSeleccionados === "string") {
      try {
        rawBody.semestresSeleccionados = JSON.parse(
          rawBody.semestresSeleccionados,
        );
      } catch {
        rawBody.semestresSeleccionados = [];
      }
    }

    const validationResult = admissionSchema.safeParse(rawBody);

    if (!validationResult.success) {
      res.status(400).json({
        ok: false,
        mensaje: "Errores de validación en el formulario",
        errores: validationResult.error.format(),
      });
      return;
    }

    const datosValidados = validationResult.data as any;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const randomFolio = `BEL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const fechaLimiteStr = fechaVigencia.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const parseId = (val: any) => {
      const num = Number(val);
      return isNaN(num) || num <= 0 ? null : num;
    };

    const gId = parseId(datosValidados.generoId || rawBody.generoId);
    const iId = parseId(
      datosValidados.identidadCulturalId || rawBody.identidadCulturalId,
    );
    const pId = parseId(
      datosValidados.parentescoTutorId || rawBody.parentescoTutorId,
    );

    const semestresRecibidos =
      datosValidados.semestresSeleccionados ||
      rawBody.semestresSeleccionados ||
      [];
    let semestreIdMaximo = null;

    if (Array.isArray(semestresRecibidos) && semestresRecibidos.length > 0) {
      const numerosSemestres = semestresRecibidos
        .map((s: any) => {
          const match = String(s).match(/\d+/);
          return match ? parseInt(match[0], 10) : Number(s);
        })
        .filter((n: number) => !isNaN(n));

      if (numerosSemestres.length > 0) {
        semestreIdMaximo = Math.max(...numerosSemestres);
      }
    }

    const nuevoAspirante = await prisma.$transaction(async (tx) => {
      const nombresDiscapacidades = datosValidados.discapacidades || [];
      const registrosDiscapacidades = await tx.discapacidad.findMany({
        where: { nombre: { in: nombresDiscapacidades } },
      });

      const tipoUsuarioAspiranteId = 2;

      let subsistemaIdFinal = parseId(
        datosValidados.subsistemaId || rawBody.subsistemaId,
      );
      let letraProcedencia = null;

      if (datosValidados.tipoAdmision === "nuevo_ingreso") {
        let subSecundaria = await tx.subsistema.findFirst({
          where: { nombre: { contains: "SECUNDARIA" } },
        });
        if (!subSecundaria) {
          subSecundaria = await tx.subsistema.findFirst({ where: { id: 1 } });
        }
        subsistemaIdFinal = subSecundaria ? subSecundaria.id : 1;
      }

      if (subsistemaIdFinal) {
        const subObj = await tx.subsistema.findUnique({
          where: { id: subsistemaIdFinal },
        });
        if (subObj && subObj.nombre) {
          letraProcedencia = subObj.nombre.charAt(0).toUpperCase();
        }
      }

      const aspirante = await tx.aspirante.create({
        data: {
          folio: randomFolio,
          vigenciaFolio: fechaVigencia,
          esMigrado: false,
          apellidoPaterno: datosValidados.apellidoPaterno,
          apellidoMaterno: datosValidados.apellidoMaterno || null,
          nombres: datosValidados.nombres,
          curp: datosValidados.curp,
          fechaNacimiento: datosValidados.fechaNacimiento
            ? new Date(datosValidados.fechaNacimiento)
            : null,

          tipoUsuarioRel: { connect: { id: tipoUsuarioAspiranteId } },

          ...(gId && { generoRel: { connect: { id: gId } } }),
          ...(iId && { identidadCultural: { connect: { id: iId } } }),
          ...(subsistemaIdFinal && {
            subsistema: { connect: { id: subsistemaIdFinal } },
          }),
          ...(pId && { tutorParentescoRel: { connect: { id: pId } } }),

          correoElectronico1: datosValidados.correoElectronico1,
          correoElectronico2: datosValidados.correoElectronico2 || null,
          telefonoCelular: datosValidados.telefonoCelular,
          telefonoParticular: datosValidados.telefonoParticular || null,

          pais: datosValidados.pais,
          codigoPostal: datosValidados.codigoPostal || null,
          estado: datosValidados.estado,
          municipio: datosValidados.municipio,
          colonia: datosValidados.colonia,
          calle: datosValidados.calle,
          numeroExterior: datosValidados.numeroExterior || null,
          numeroInterior: datosValidados.numeroInterior || null,

          tutorApellidoPaterno: datosValidados.tutorApellidoPaterno || null,
          tutorApellidoMaterno: datosValidados.tutorApellidoMaterno || null,
          tutorNombres: datosValidados.tutorNombres || null,
          tutorTelefono: datosValidados.tutorTelefono || null,

          tipoAdmision: datosValidados.tipoAdmision,
          cctEscuelaProcedencia: datosValidados.cctEscuelaProcedencia || null,
          nombreEscuelaProcedencia:
            datosValidados.nombreEscuelaProcedencia || null,
          sistemaProcedenciaLetra: letraProcedencia,
          otroSistemaProcedencia: datosValidados.otroSistemaProcedencia || null,

          semestresSeleccionados: semestresRecibidos,
          ...(semestreIdMaximo && {
            semestreRel: { connect: { id: semestreIdMaximo } },
          }),

          discapacidades: {
            create: registrosDiscapacidades.map((d: any) => ({
              discapacidad: { connect: { id: d.id } },
            })),
          },
        },
      });

      if (files) {
        for (const [fieldKey, fileList] of Object.entries(files)) {
          if (fileList && fileList.length > 0) {
            const file = fileList[0];
            const nombreSeguro =
              file.originalname.length > 250
                ? file.originalname.substring(0, 250)
                : file.originalname;

            await tx.documento.create({
              data: {
                aspiranteId: aspirante.id,
                tipoDoc: fieldKey,
                nombreArchivo: nombreSeguro,
                archivoBlob: file.buffer,
                estatusDoc: "PENDIENTE",
              },
            });
          }
        }
      }

      return aspirante;
    });

    const nombreCompleto =
      `${datosValidados.apellidoPaterno} ${datosValidados.apellidoMaterno || ""} ${datosValidados.nombres}`.trim();
    const linkConsulta = "http://localhost:5173";

    transporter
      .sendMail({
        from: `"Sistema BELVER" <${process.env.SMTP_USER}>`,
        to: datosValidados.correoElectronico1,
        subject: `Comprobante de Registro y Folio Oficial: ${nuevoAspirante.folio}BELVER`,
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f1f5f9; padding: 25px; color: #1e293b;">
          <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
            <div style="padding: 30px 24px; text-align: center;">
              <h2 style="margin: 0 0 5px 0; font-size: 18px; font-weight: bold; color: #0f172a;">¡Solicitud Registrada Exitosamente!</h2>
              <p style="margin: 0 0 20px 0; font-size: 11px; color: #64748b;">Comprobante de registro a BELVER</p>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: left;">
                <div style="margin-bottom: 12px;">
                  <span style="font-size: 9px; font-weight: bold; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 2px;">Nombre del estudiante</span>
                  <div style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase;">${nombreCompleto}</div>
                </div>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center;">
                  <span style="font-size: 9px; font-weight: bold; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">Folio de seguimiento oficial</span>
                  <div style="font-family: monospace; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: 1px;">${nuevoAspirante.folio}</div>
                </div>
              </div>
              <p style="font-size: 12px; color: #334155; line-height: 1.5; text-align: left;">
                En un plazo de 5 días hábiles deberás ingresar al apartado de inscripción dando clic en la opción <strong>“Folio de inscripción”</strong> para revisar el estatus de la documentación que enviaste.
              </p>
              <p style="font-size: 12px; color: #334155; line-height: 1.5; text-align: left;">
                En caso de presentar alguna observación, tendrás que realizar las modificaciones correspondientes para completar tu proceso de inscripción; en caso de no hacerlo dentro del periodo estipulado, tendrás que realizar tu proceso completo nuevamente.
              </p>
              <p style="font-size: 12px; font-weight: bold; color: #b91c1c; text-align: left; margin-top: 15px;">
                Fecha límite para modificaciones: ${fechaLimiteStr}
              </p>
              <div style="margin-top: 25px;">
                <a href="${linkConsulta}" target="_blank" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-size: 12px; font-weight: bold; text-decoration: none; display: inline-block;">Consultar Folio de Inscripción</a>
              </div>
            </div>
          </div>
        </div>
      `,
        text: `¡Solicitud Registrada Exitosamente! Nombre: ${nombreCompleto}, Folio: ${nuevoAspirante.folio}. En un plazo de 5 días hábiles revisa el estatus de tu documentación. Fecha límite para modificaciones: ${fechaLimiteStr}.`,
      })
      .catch((emailError) => {
        console.error(
          "Advertencia: No se pudo enviar el correo de registro:",
          emailError,
        );
      });

    res.status(201).json({
      ok: true,
      mensaje: "¡Registro de aspirante exitoso!",
      data: {
        folio: nuevoAspirante.folio,
        fechaLimite: fechaLimiteStr,
      },
    });
  } catch (error: any) {
    console.error("Error detallado al registrar aspirante:", error);
    if (error.code === "P2002") {
      res
        .status(400)
        .json({ ok: false, mensaje: "El registro ya existe en el sistema." });
      return;
    }
    res.status(500).json({
      ok: false,
      mensaje: "Error interno del servidor al procesar la inscripción.",
    });
  }
};

export const aprobarExpediente = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { aspiranteId } = req.params;
    const { estatusDocumentos } = req.body;
    const anioDosDigitos = String(new Date().getFullYear()).slice(-2);
    const prefijo = `B${anioDosDigitos}`;
    const ultimoAlumno = await prisma.aspirante.findFirst({
      where: { matricula: { startsWith: prefijo } },
      orderBy: { matricula: "desc" },
      select: { matricula: true },
    });
    let siguienteConsecutivo = 1;
    if (ultimoAlumno && ultimoAlumno.matricula) {
      const numeroActual = parseInt(
        ultimoAlumno.matricula.replace(prefijo, ""),
        10,
      );
      if (!isNaN(numeroActual)) siguienteConsecutivo = numeroActual + 1;
    }
    const consecutivoFormateado = String(siguienteConsecutivo).padStart(6, "0");
    const matriculaGenerada = `${prefijo}${consecutivoFormateado}`;
    const passwordGenerada = Math.random().toString(36).slice(-8).toUpperCase();
    const tipoUsuarioAlumnoId = 5;

    const resultado = await prisma.$transaction(async (tx) => {
      const aspiranteActualizado = await tx.aspirante.update({
        where: { id: Number(aspiranteId) },
        data: {
          matricula: matriculaGenerada,
          password: passwordGenerada,
          tipoUsuarioId: tipoUsuarioAlumnoId,
          estatusAcademico: "ACTIVO_REGULAR",
        },
      });
      await tx.validacionExpediente.update({
        where: { aspiranteId: Number(aspiranteId) },
        data: {
          dictamenGeneral: "APROBADO",
          observaciones: null,
          fechaValidacion: new Date(),
        },
      });
      if (estatusDocumentos && Array.isArray(estatusDocumentos)) {
        for (const doc of estatusDocumentos) {
          await tx.documento.update({
            where: { id: doc.id },
            data: {
              estatusDoc: doc.estatusDoc,
              comentario: doc.comentario || null,
            },
          });
        }
      }
      return aspiranteActualizado;
    });

    res.status(200).json({
      ok: true,
      mensaje:
        "¡Expediente aprobado, matrícula y contraseña generadas con éxito!",
      data: { matricula: resultado.matricula, password: resultado.password },
    });
  } catch (error) {
    console.error("Error al aprobar expediente:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error interno al procesar la aprobación." });
  }
};

export const verDocumento = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const documento = await prisma.documento.findUnique({
      where: { id: Number(id) },
    });
    if (!documento || !documento.archivoBlob) {
      res.status(404).json({ ok: false, mensaje: "Documento no encontrado." });
      return;
    }
    const nombreArchivo = documento.nombreArchivo.toLowerCase();
    let contentType = "application/octet-stream";
    if (nombreArchivo.endsWith(".pdf")) contentType = "application/pdf";
    else if (nombreArchivo.endsWith(".png")) contentType = "image/png";
    else if (nombreArchivo.endsWith(".jpg") || nombreArchivo.endsWith(".jpeg"))
      contentType = "image/jpeg";

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${documento.nombreArchivo}"`,
    );
    res.send(documento.archivoBlob);
  } catch (error) {
    console.error("Error al visualizar documento:", error);
    res
      .status(500)
      .json({
        ok: false,
        mensaje: "Error interno al visualizar el documento.",
      });
  }
};

export const modificarDocumento = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) {
      res
        .status(400)
        .json({ ok: false, mensaje: "No se proporcionó ningún archivo." });
      return;
    }
    const documentoExistente = await prisma.documento.findUnique({
      where: { id: Number(id) },
    });
    if (!documentoExistente) {
      res.status(404).json({ ok: false, mensaje: "Documento no encontrado." });
      return;
    }
    const nombreSeguro =
      file.originalname.length > 250
        ? file.originalname.substring(0, 250)
        : file.originalname;
    await prisma.documento.update({
      where: { id: Number(id) },
      data: {
        nombreArchivo: nombreSeguro,
        archivoBlob: file.buffer,
        estatusDoc: "PENDIENTE",
        comentario: null,
      },
    });
    res
      .status(200)
      .json({
        ok: true,
        mensaje: "Documento modificado y enviado a revisión exitosamente.",
      });
  } catch (error) {
    console.error("Error al modificar el documento:", error);
    res
      .status(500)
      .json({
        ok: false,
        mensaje: "Error interno al procesar la modificación del documento.",
      });
  }
};

export const descargarComprobantePDF = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { folio } = req.params;
    const aspirante = await prisma.aspirante.findUnique({
      where: { folio: String(folio).trim().toUpperCase() },
    });
    if (!aspirante) {
      res.status(404).json({ ok: false, mensaje: "Solicitud no encontrada." });
      return;
    }
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const result = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Comprobante_Registro_${aspirante.folio}.pdf"`,
      );
      res.send(result);
    });

    const nombreCompleto =
      `${aspirante.apellidoPaterno} ${aspirante.apellidoMaterno || ""} ${aspirante.nombres}`.toUpperCase();
    const fechaVigenciaStr = aspirante.vigenciaFolio
      ? new Date(aspirante.vigenciaFolio).toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "N/A";

    doc.rect(40, 40, 515, 36).strokeColor("#cbd5e1").lineWidth(1).stroke();
    doc.fontSize(8).font("Helvetica-Bold").fillColor("#64748b");
    doc.text("[ LOGO INSTITUCIONAL ]", 50, 54, { width: 230, align: "left" });
    doc.text("[ LOGO BELVER ]", 275, 54, { width: 230, align: "right" });

    doc.y = 95;
    doc.x = 40;
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#0f172a")
      .text("¡Solicitud Registrada Exitosamente!", 40, doc.y, {
        align: "left",
      });
    doc.moveDown(0.3);
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#64748b")
      .text(
        "Comprobante oficial de registro institucional - BELVER",
        40,
        doc.y,
        { align: "left" },
      );
    doc.moveDown(1.5);

    const boxTop = doc.y;
    const boxWidth = 430;
    const boxLeft = (515 - boxWidth) / 2 + 40;
    doc
      .roundedRect(boxLeft, boxTop, boxWidth, 110, 10)
      .fillAndStroke("#f8fafc", "#e2e8f0");
    doc
      .fontSize(8)
      .font("Helvetica-Bold")
      .fillColor("#94a3b8")
      .text("NOMBRE DEL ESTUDIANTE", boxLeft, boxTop + 15, {
        align: "center",
        width: boxWidth,
      });
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#0f172a")
      .text(nombreCompleto, boxLeft + 20, boxTop + 28, {
        align: "center",
        width: boxWidth - 40,
      });
    doc
      .moveTo(boxLeft + 30, boxTop + 55)
      .lineTo(boxLeft + boxWidth - 30, boxTop + 55)
      .strokeColor("#e2e8f0")
      .lineWidth(1)
      .stroke();
    doc
      .fontSize(8)
      .font("Helvetica-Bold")
      .fillColor("#64748b")
      .text("FOLIO DE SEGUIMIENTO OFICIAL", boxLeft, boxTop + 65, {
        align: "center",
        width: boxWidth,
      });
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor("#0f172a")
      .text(aspirante.folio, boxLeft, boxTop + 78, {
        align: "center",
        width: boxWidth,
      });

    doc.y = boxTop + 130;
    doc.moveDown(1);
    doc.fontSize(9.5).font("Helvetica").fillColor("#334155");
    doc.text(
      "En un plazo de 5 días hábiles deberás ingresar al apartado de inscripción dando clic en la opción “Folio de inscripción” para revisar el estatus de la documentación que enviaste.",
      40,
      doc.y,
      { align: "justify", lineGap: 4, width: 515 },
    );
    doc.moveDown(0.8);
    doc.text(
      "En caso de presentar alguna observación, tendrás que realizar las modificaciones correspondientes para completar tu proceso de inscripción; en caso de no hacerlo dentro del periodo estipulado, tendrás que realizar tu proceso completo nuevamente.",
      40,
      doc.y,
      { align: "justify", lineGap: 4, width: 515 },
    );
    doc.moveDown(1);
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#64748b")
      .text("Nota: El Folio será enviado a tu correo electrónico.", 40, doc.y, {
        align: "justify",
        width: 515,
      });
    doc.moveDown(0.6);
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#dc2626")
      .text(
        `Fecha límite para modificaciones: ${fechaVigenciaStr}`,
        40,
        doc.y,
        { align: "center", width: 515 },
      );

    doc.end();
  } catch (error) {
    console.error("Error al generar comprobante PDF:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error interno al generar el PDF." });
  }
};
