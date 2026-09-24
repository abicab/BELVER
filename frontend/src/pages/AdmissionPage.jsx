import React, { useState, useEffect } from "react";

const MAX_PDF_SIZE_MB = 5;
const MAX_IMG_SIZE_MB = 2;

// Listado oficial de discapacidades para selección múltiple con casillas
const LISTA_DISCAPACIDADES = [
  "DISCAPACIDAD MOTRIZ",
  "DISCAPACIDAD VISUAL",
  "DISCAPACIDAD AUDITIVA",
  "DISCAPACIDAD INTELECTUAL",
  "DISCAPACIDAD DEL ESPECTRO AUTISTA",
  "TRASTORNO POR DÉFICIT DE ATENCIÓN E HIPERACTIVIDAD",
  "DIFICULTAD SEVERA DE APRENDIZAJE",
  "DIFICULTAD SEVERA DE CONDUCTA",
  "DIFICULTAD SEVERA DE COMUNICACIÓN",
  "NINGUNA",
];

// Mapeo institucional para equivalencias (excluyendo secundaria)
const OPCIONES_PROCEDENCIA_EQUIVALENCIA = [
  { letra: "C", label: "DGB" },
  { letra: "D", label: "DGB / TEBAEV" },
  { letra: "E", label: "TEBACOM" },
  { letra: "F", label: "OTRO" },
];

// Diccionario institucional para traducir las claves técnicas de los archivos
const traducirTipoDocumento = (tipo) => {
  const diccionario = {
    photo: "FOTOGRAFÍA INFANTIL",
    actaNacimiento: "ACTA DE NACIMIENTO",
    curpFile: "DOCUMENTO CURP (PDF)",
    studyCert: "CERTIFICADO DE ESTUDIOS",
    constanciaEstudios: "CONSTANCIA DE ESTUDIOS / HISTORIAL",
    ineDocument: "IDENTIFICACIÓN OFICIAL (INE / INE TUTOR)",
  };
  return diccionario[tipo] || tipo.toUpperCase();
};

// Expresión regular oficial para validar el formato institucional de la CURP en México
const validarEstructuraCurp = (curp) => {
  const regexCurp = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]{2}$/;
  return regexCurp.test(curp);
};

// Función profesional para extraer fecha de nacimiento y sexo desde la CURP
const analizarCurpAutomatica = (curp) => {
  if (!curp || curp.length !== 18 || !validarEstructuraCurp(curp)) {
    return { fechaNacimiento: "", genero: "" };
  }
  const anioDigito = parseInt(curp.substring(4, 6), 10);
  const mes = curp.substring(6, 8);
  const dia = curp.substring(8, 10);

  const anioCompleto =
    anioDigito > 26 ? `19${curp.substring(4, 6)}` : `20${curp.substring(4, 6)}`;
  const fechaNacimiento = `${anioCompleto}-${mes}-${dia}`;

  const letraGenero = curp.charAt(10).toUpperCase();
  const genero =
    letraGenero === "H" ? "MASCULINO" : letraGenero === "M" ? "FEMENINO" : "";

  return { fechaNacimiento, genero };
};

export default function AdmissionPage() {
  const [step, setStep] = useState(1);
  const [submittedData, setSubmittedData] = useState(null);
  const [isConsultaOpen, setIsConsultaOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados unificados para los catálogos dinámicos cargados desde el backend
  const [generos, setGeneros] = useState([]);
  const [identidadesCulturales, setIdentidadesCulturales] = useState([]);
  const [parentescosDisponibles, setParentescosDisponibles] = useState([]);

  // Estado para la vista previa de la fotografía
  const [photoPreview, setPhotoPreview] = useState(null);

  // Cargar catálogos institucionales al montar el componente
  useEffect(() => {
    const cargarCatalogosDesdeBD = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/catalogo");
        const resultado = await response.json();
        if (response.ok && resultado.ok) {
          setGeneros(resultado.data.genero || []);
          setIdentidadesCulturales(resultado.data.identidadCultural || []);
          setParentescosDisponibles(resultado.data.parentesco || []);
        }
      } catch (error) {
        console.error(
          "Error al conectar con el servidor para cargar catálogos:",
          error,
        );
      }
    };
    cargarCatalogosDesdeBD();
  }, []);

  // Ventana modal personalizada para alertas institucionales
  const [modalAlerta, setModalAlerta] = useState({
    isOpen: false,
    mensaje: "",
    titulo: "Aviso Importante",
  });

  const [folioInput, setFolioInput] = useState("");
  const [curpInput, setCurpInput] = useState("");
  const [consultaResult, setConsultaResult] = useState(null);
  const [consultaError, setConsultaError] = useState("");
  const [cargandoConsulta, setCargandoConsulta] = useState(false);

  const [coloniasDisponibles, setColoniasDisponibles] = useState([]);
  const [cargandoCp, setCargandoCp] = useState(false);

  const [formData, setFormData] = useState({
    apellidoPaterno: "",
    apellidoMaterno: "",
    nombres: "",
    curp: "",
    fechaNacimiento: "",
    genero: "",
    correoElectronico1: "",
    correoElectronicoConfirmacion: "",
    correoElectronico2: "",
    telefonoCelular: "",
    telefonoParticular: "",
    generoIdentidad: "",
    identidadCultural: "",
    discapacidades: [],
    pais: "MÉXICO",
    codigoPostal: "",
    estado: "",
    municipio: "",
    colonia: "",
    calle: "",
    numeroExterior: "",
    numeroInterior: "",
    tutorApellidoPaterno: "",
    tutorApellidoMaterno: "",
    tutorNombres: "",
    tutorParentesco: "",
    tutorTelefono: "",
    tipoAdmision: "nuevo_ingreso",
    cctEscuelaProcedencia: "",
    nombreEscuelaProcedencia: "",
    sistemaProcedenciaLetra: "",
    otroSistemaProcedencia: "",
    photo: null,
    studyCert: null,
    constanciaEstudios: null,
    curpFile: null,
    actaNacimiento: null,
    ineDocument: null,
  });

  const mostrarAlerta = (mensaje, titulo = "Atención") => {
    setModalAlerta({ isOpen: true, mensaje, titulo });
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === "discapacidades") {
      let nuevasDiscapacidades = [...formData.discapacidades];
      if (checked) {
        if (value === "NINGUNA") {
          nuevasDiscapacidades = ["NINGUNA"];
        } else {
          nuevasDiscapacidades = nuevasDiscapacidades.filter(
            (d) => d !== "NINGUNA",
          );
          nuevasDiscapacidades.push(value);
        }
      } else {
        nuevasDiscapacidades = nuevasDiscapacidades.filter((d) => d !== value);
      }
      setFormData((prev) => ({
        ...prev,
        discapacidades: nuevasDiscapacidades,
      }));
      return;
    }

    let processedValue = value;

    if (
      name === "correoElectronico1" ||
      name === "correoElectronicoConfirmacion" ||
      name === "correoElectronico2"
    ) {
      processedValue = value.trim();
    } else if (
      ["telefonoCelular", "telefonoParticular", "tutorTelefono"].includes(name)
    ) {
      processedValue = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "codigoPostal") {
      processedValue = value.replace(/\D/g, "").slice(0, 5);
    } else if (name === "cctEscuelaProcedencia") {
      processedValue = value
        .replace(/[^A-Za-z0-9]/g, "")
        .toUpperCase()
        .slice(0, 10);
    } else if (name === "curp") {
      processedValue = value
        .replace(/[^A-Za-z0-9]/g, "")
        .toUpperCase()
        .slice(0, 18);

      if (
        processedValue.length === 18 &&
        validarEstructuraCurp(processedValue)
      ) {
        const datosCurp = analizarCurpAutomatica(processedValue);
        setFormData((prev) => ({
          ...prev,
          curp: processedValue,
          fechaNacimiento: datosCurp.fechaNacimiento,
          genero: datosCurp.genero,
        }));
        return;
      } else if (processedValue.length === 0) {
        setFormData((prev) => ({
          ...prev,
          curp: "",
          fechaNacimiento: "",
          genero: "",
        }));
        return;
      }
    } else {
      processedValue = value.toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handlePaisChange = (e) => {
    const paisVal = e.target.value.toUpperCase();
    setFormData((prev) => ({
      ...prev,
      pais: paisVal,
      ...(paisVal !== "MÉXICO"
        ? { codigoPostal: "", estado: "", municipio: "", colonia: "" }
        : {}),
    }));
  };

  const handleAdmissionTypeChange = (e) => {
    const tipo = e.target.value;
    setFormData((prev) => ({
      ...prev,
      tipoAdmision: tipo,
      sistemaProcedenciaLetra: "",
      cctEscuelaProcedencia: "",
      nombreEscuelaProcedencia: "",
    }));
  };

  const handleCodigoPostalChange = async (e) => {
    const cp = e.target.value.replace(/\D/g, "").slice(0, 5);
    setFormData((prev) => ({ ...prev, codigoPostal: cp }));

    if (cp.length === 5) {
      setCargandoCp(true);
      try {
        const response = await fetch(
          `https://cp.terio.dev/v1/codigos-postales/${cp}`,
        );
        const data = await response.json();

        if (response.ok && data.datos && data.datos.length > 0) {
          const primerRegistro = data.datos[0];
          const listaAsentamientos = data.datos.map((item) =>
            item.asentamiento.toUpperCase(),
          );

          setFormData((prev) => ({
            ...prev,
            estado: primerRegistro.estado.toUpperCase(),
            municipio: primerRegistro.municipio.toUpperCase(),
            colonia: listaAsentamientos[0] || "",
          }));
          setColoniasDisponibles(listaAsentamientos);
        } else {
          setColoniasDisponibles([]);
        }
      } catch (error) {
        console.error("Error al consultar códigos postales:", error);
      } finally {
        setCargandoCp(false);
      }
    } else {
      setColoniasDisponibles([]);
    }
  };

  const handleFileChange = (e, fileType) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;

    if (fileType === "pdf") {
      if (file.type !== "application/pdf") {
        mostrarAlerta(
          "El archivo debe ser un documento en formato PDF.",
          "Formato Inválido",
        );
        return;
      }
      if (file.size > MAX_PDF_SIZE_MB * 1024 * 1024) {
        mostrarAlerta(
          `El archivo PDF excede el límite de ${MAX_PDF_SIZE_MB} MB.`,
          "Archivo Demasiado Grande",
        );
        return;
      }
    }

    if (fileType === "image") {
      if (!file.type.startsWith("image/")) {
        mostrarAlerta(
          "La fotografía debe ser un archivo de imagen válido (JPG o PNG).",
          "Formato Inválido",
        );
        return;
      }
      if (file.size > MAX_IMG_SIZE_MB * 1024 * 1024) {
        mostrarAlerta(
          `La fotografía no debe superar los ${MAX_IMG_SIZE_MB} MB.`,
          "Imagen Demasiado Grande",
        );
        return;
      }
      setPhotoPreview(URL.createObjectURL(file));
    }

    setFormData((prev) => ({ ...prev, [name]: file }));
  };

  const nextStep = async () => {
    if (step === 1) {
      if (
        !formData.apellidoPaterno ||
        !formData.nombres ||
        !formData.curp ||
        !formData.correoElectronico1 ||
        !formData.correoElectronicoConfirmacion ||
        !formData.telefonoCelular ||
        (formData.pais === "MÉXICO" && !formData.codigoPostal) ||
        !formData.municipio ||
        !formData.calle
      ) {
        mostrarAlerta(
          "Por favor complete todos los campos obligatorios marcados con (*).",
          "Campos Incompletos",
        );
        return;
      }

      if (!validarEstructuraCurp(formData.curp.trim())) {
        mostrarAlerta(
          "La estructura de la CURP não es válida. Verifique el formato oficial.",
          "CURP Inválida",
        );
        return;
      }

      if (
        formData.correoElectronico1 !== formData.correoElectronicoConfirmacion
      ) {
        mostrarAlerta(
          "Los correos electrónicos ingresados no coinciden.",
          "Correo Incorrecto",
        );
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:4000/api/admission/verificar-duplicado?curp=${formData.curp.trim()}`,
        );
        const data = await res.json();

        if (data.existe) {
          mostrarAlerta(data.mensaje, "Registro Duplicado");
          return;
        }
      } catch (error) {
        console.error("Error al verificar duplicados en servidor:", error);
      }
    }

    if (step === 2) {
      if (
        formData.tipoAdmision === "nuevo_ingreso" &&
        (!formData.cctEscuelaProcedencia || !formData.nombreEscuelaProcedencia)
      ) {
        mostrarAlerta(
          "Por favor complete la Clave CCT y el Nombre de la secundaria.",
          "Antecedentes Incompletos",
        );
        return;
      }
      if (
        formData.tipoAdmision === "revalidacion" &&
        (!formData.sistemaProcedenciaLetra ||
          !formData.cctEscuelaProcedencia ||
          !formData.nombreEscuelaProcedencia ||
          (formData.sistemaProcedenciaLetra === "F" &&
            !formData.otroSistemaProcedencia))
      ) {
        mostrarAlerta(
          "Por favor complete todos los campos obligatorios del historial previo.",
          "Antecedentes Incompletos",
        );
        return;
      }
    }

    if (step === 3) {
      if (
        !formData.photo ||
        !formData.actaNacimiento ||
        !formData.curpFile ||
        !formData.ineDocument ||
        !formData.studyCert
      ) {
        mostrarAlerta(
          "Es obligatorio adjuntar Fotografía, Acta, CURP, INE y el Certificado de Estudios.",
          "Documentos Faltantes",
        );
        return;
      }
    }

    setStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const dataToSend = new FormData();

      dataToSend.append("apellidoPaterno", formData.apellidoPaterno || "");
      dataToSend.append("apellidoMaterno", formData.apellidoMaterno || "");
      dataToSend.append("nombres", formData.nombres || "");
      dataToSend.append("curp", formData.curp || "");
      dataToSend.append("fechaNacimiento", formData.fechaNacimiento || "");
      dataToSend.append("genero", formData.genero || "");
      dataToSend.append(
        "correoElectronico1",
        formData.correoElectronico1 || "",
      );
      dataToSend.append(
        "correoElectronico2",
        formData.correoElectronico2 || "",
      );
      dataToSend.append("telefonoCelular", formData.telefonoCelular || "");
      dataToSend.append(
        "telefonoParticular",
        formData.telefonoParticular || "",
      );

      dataToSend.append("generoIdentidad", formData.generoIdentidad || "");
      dataToSend.append("identidadCultural", formData.identidadCultural || "");
      dataToSend.append(
        "discapacidades",
        JSON.stringify(formData.discapacidades || []),
      );

      dataToSend.append("pais", formData.pais || "MÉXICO");
      dataToSend.append("codigoPostal", formData.codigoPostal || "");
      dataToSend.append("estado", formData.estado || "");
      dataToSend.append("municipio", formData.municipio || "");
      dataToSend.append("colonia", formData.colonia || "");
      dataToSend.append("calle", formData.calle || "");
      dataToSend.append("numeroExterior", formData.numeroExterior || "");
      dataToSend.append("numeroInterior", formData.numeroInterior || "");

      dataToSend.append(
        "tutorApellidoPaterno",
        formData.tutorApellidoPaterno || "",
      );
      dataToSend.append(
        "tutorApellidoMaterno",
        formData.tutorApellidoMaterno || "",
      );
      dataToSend.append("tutorNombres", formData.tutorNombres || "");
      dataToSend.append("tutorParentesco", formData.tutorParentesco || "");
      dataToSend.append("tutorTelefono", formData.tutorTelefono || "");

      dataToSend.append(
        "tipoAdmision",
        formData.tipoAdmision || "nuevo_ingreso",
      );
      dataToSend.append(
        "cctEscuelaProcedencia",
        formData.cctEscuelaProcedencia || "",
      );
      dataToSend.append(
        "nombreEscuelaProcedencia",
        formData.nombreEscuelaProcedencia || "",
      );
      dataToSend.append(
        "sistemaProcedenciaLetra",
        formData.sistemaProcedenciaLetra || "",
      );
      dataToSend.append(
        "otroSistemaProcedencia",
        formData.otroSistemaProcedencia || "",
      );

      if (formData.photo) dataToSend.append("photo", formData.photo);
      if (formData.actaNacimiento)
        dataToSend.append("actaNacimiento", formData.actaNacimiento);
      if (formData.curpFile) dataToSend.append("curpFile", formData.curpFile);
      if (formData.ineDocument)
        dataToSend.append("ineDocument", formData.ineDocument);
      if (formData.studyCert)
        dataToSend.append("studyCert", formData.studyCert);
      if (formData.constanciaEstudios)
        dataToSend.append("constanciaEstudios", formData.constanciaEstudios);

      const response = await fetch(
        "http://localhost:4000/api/admission/registro",
        {
          method: "POST",
          body: dataToSend,
        },
      );

      const resultado = await response.json();

      if (response.ok && resultado.ok) {
        const fechaVigencia = new Date();
        fechaVigencia.setDate(fechaVigencia.getDate() + 15);

        const nombreCompleto =
          `${formData.apellidoPaterno} ${formData.apellidoMaterno || ""} ${formData.nombres}`.trim();

        const nuevoTramite = {
          folio: resultado.data.folio,
          aspirante: nombreCompleto,
          curp: formData.curp.toUpperCase(),
          vigencia: fechaVigencia.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
        };

        setSubmittedData(nuevoTramite);
      } else {
        mostrarAlerta(
          resultado.mensaje || "Verifica los datos proporcionados.",
          "Error de Registro",
        );
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      mostrarAlerta(
        "No fue posible establecer conexión con el sistema.",
        "Error de Comunicación",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConsultar = async (e) => {
    if (e) e.preventDefault();
    setConsultaError("");
    setConsultaResult(null);

    const claveFolio = folioInput.trim().toUpperCase();
    const curpVal = curpInput.trim().toUpperCase();

    if (!claveFolio || !curpVal) {
      setConsultaError("Por favor ingrese el folio y la CURP de consulta.");
      return;
    }

    setCargandoConsulta(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/admission/consulta?folio=${claveFolio}&curp=${curpVal}`,
      );
      const resultado = await response.json();

      if (response.ok && resultado.ok) {
        setConsultaResult(resultado.data);
      } else {
        setConsultaError(resultado.mensaje || "No se encontró información.");
      }
    } catch (error) {
      console.error("Error al consultar:", error);
      setConsultaError("No se pudo conectar con el servidor.");
    } finally {
      setCargandoConsulta(false);
    }
  };

  if (submittedData) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div
          id="comprobante-impresion"
          className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 text-center space-y-4 print:border-none print:shadow-none print:p-0 print:m-0"
        >
          <div className="w-12 h-12 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-3">
            ✓
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">
              ¡Solicitud Registrada Exitosamente!
            </h2>
            <p className="text-[11px] text-slate-600">
              Comprobante oficial de registro institucional - BELVER.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center space-y-1 my-4">
            <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase block">
              Folio de Seguimiento Oficial
            </span>
            <div className="text-xl font-mono font-extrabold text-blue-950 tracking-wider">
              {submittedData.folio}
            </div>
            <div className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 py-1 px-2 rounded-lg inline-block mt-1">
              ⚠️ Vigencia del trámite: <strong>{submittedData.vigencia}</strong>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 px-2">
            Conserva este documento. Control escolar validará los documentos
            adjuntos en el plazo establecido.
          </p>

          <div className="flex flex-col gap-2 pt-2 print:hidden">
            <button
              onClick={() => window.print()}
              className="w-full py-2 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition shadow-sm"
            >
              📥 Imprimir / Guardar Comprobante PDF
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-md"
            >
              Finalizar y Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
              Portal Externo de Inscripción
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Solicitud de Inscripción a BELVER
            </h1>
            <p className="text-xs text-slate-500">
              Bachillerato en Línea de Veracruz (Programa Gratuito)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsConsultaOpen(true)}
            className="px-3.5 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-semibold transition shadow-sm flex items-center gap-1.5"
          >
            🔍 Consultar Estatus de Folio
          </button>
        </div>

        {/* Stepper */}
        <div className="flex justify-between items-center relative py-2">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-0"></div>
          {[
            { s: 1, label: "Datos, Domicilio e Inclusión" },
            { s: 2, label: "Antecedentes Escolares" },
            { s: 3, label: "Documentación Oficial" },
            { s: 4, label: "Revisión y Envío" },
          ].map((item) => (
            <div
              key={item.s}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${step >= item.s ? "bg-slate-900 text-white shadow" : "bg-slate-200 text-slate-500"}`}
              >
                {item.s}
              </div>
              <span className="text-[10px] text-slate-500 font-semibold mt-1 hidden sm:block text-center max-w-[100px]">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          {/* PASO 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
                1. Datos Personales del Aspirante
              </h2>

              <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block border-b border-slate-200 pb-1">
                  Datos Personales
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Apellido Paterno <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="apellidoPaterno"
                      type="text"
                      required
                      value={formData.apellidoPaterno}
                      onChange={handleChange}
                      placeholder="PRIMER APELLIDO"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none uppercase bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Apellido Materno
                    </label>
                    <input
                      name="apellidoMaterno"
                      type="text"
                      value={formData.apellidoMaterno}
                      onChange={handleChange}
                      placeholder="SEGUNDO APELLIDO"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none uppercase bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Nombre(s) <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="nombres"
                      type="text"
                      required
                      value={formData.nombres}
                      onChange={handleChange}
                      placeholder="NOMBRE(S)"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none uppercase bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      CURP (18 caracteres){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="curp"
                      type="text"
                      required
                      maxLength={18}
                      value={formData.curp}
                      onChange={handleChange}
                      placeholder="CLAVE ÚNICA DE REGISTRO"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none uppercase font-mono bg-white"
                    />
                    {formData.curp.length > 0 && formData.curp.length < 18 && (
                      <span className="text-[10px] text-amber-600 font-medium">
                        Faltan {18 - formData.curp.length} caracteres...
                      </span>
                    )}
                    {formData.curp.length === 18 &&
                      !validarEstructuraCurp(formData.curp) && (
                        <span className="text-[10px] text-red-600 font-medium">
                          Estructura de CURP incorrecta según formato oficial.
                        </span>
                      )}
                    {formData.curp.length === 18 &&
                      validarEstructuraCurp(formData.curp) && (
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          ✓ Estructura de CURP válida.
                        </span>
                      )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Teléfono Celular <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="telefonoCelular"
                      type="tel"
                      required
                      maxLength={10}
                      value={formData.telefonoCelular}
                      onChange={handleChange}
                      placeholder="10 dígitos"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-slate-600">
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.fechaNacimiento}
                      placeholder="Se llenará al ingresar la CURP"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 bg-slate-100 rounded-lg font-mono text-slate-700"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-slate-600">
                      Sexo
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.genero}
                      placeholder="Se llenará al ingresar la CURP"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 bg-slate-100 rounded-lg font-medium uppercase text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Correo Electrónico 1{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="correoElectronico1"
                      type="email"
                      required
                      value={formData.correoElectronico1}
                      onChange={handleChange}
                      placeholder="aspirante@ejemplo.com"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none lowercase bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Confirmar Correo Electrónico{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="correoElectronicoConfirmacion"
                      type="email"
                      required
                      value={formData.correoElectronicoConfirmacion}
                      onChange={handleChange}
                      placeholder="Repita su correo electrónico"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none lowercase bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Correo Electrónico 2
                    </label>
                    <input
                      name="correoElectronico2"
                      type="email"
                      value={formData.correoElectronico2}
                      onChange={handleChange}
                      placeholder="alternativo@ejemplo.com"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none lowercase bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Teléfono Particular
                    </label>
                    <input
                      name="telefonoParticular"
                      type="tel"
                      maxLength={10}
                      value={formData.telefonoParticular}
                      onChange={handleChange}
                      placeholder="10 dígitos (opcional)"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Domicilio */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    Datos de Domicilio
                  </span>
                  {cargandoCp && (
                    <span className="text-[10px] text-blue-600 animate-pulse font-semibold">
                      Buscando código postal...
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      País <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="pais"
                      type="text"
                      required
                      value={formData.pais}
                      onChange={handlePaisChange}
                      placeholder="MÉXICO"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none uppercase bg-white font-semibold"
                    />
                  </div>

                  {formData.pais === "MÉXICO" ? (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Código Postal (5 dígitos){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="codigoPostal"
                        type="text"
                        maxLength={5}
                        value={formData.codigoPostal}
                        onChange={handleCodigoPostalChange}
                        placeholder="Ej. 91000"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none font-mono bg-white"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Estado / Provincia{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="estado"
                        type="text"
                        value={formData.estado}
                        onChange={handleChange}
                        placeholder="Escriba el estado"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none uppercase bg-white"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Municipio / Alcaldía{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="municipio"
                      type="text"
                      readOnly={formData.pais === "MÉXICO"}
                      required
                      value={formData.municipio}
                      onChange={handleChange}
                      placeholder={
                        formData.pais === "MÉXICO"
                          ? "Automático por C.P."
                          : "Escriba el municipio"
                      }
                      className={`w-full px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase ${formData.pais === "MÉXICO" ? "bg-slate-100 text-slate-600 font-medium" : "bg-white"}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Colonia / Asentamiento{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    {formData.pais === "MÉXICO" &&
                    coloniasDisponibles.length > 0 ? (
                      <select
                        name="colonia"
                        value={formData.colonia}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none uppercase"
                      >
                        {coloniasDisponibles.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name="colonia"
                        type="text"
                        required
                        value={formData.colonia}
                        onChange={handleChange}
                        placeholder="Escribe tu colonia..."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none uppercase bg-white"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Calle <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="calle"
                      type="text"
                      required
                      value={formData.calle}
                      onChange={handleChange}
                      placeholder="Nombre de la calle"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none uppercase bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:col-span-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Núm. Exterior
                      </label>
                      <input
                        name="numeroExterior"
                        type="text"
                        value={formData.numeroExterior}
                        onChange={handleChange}
                        placeholder="Ej. S/N"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none uppercase bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Núm. Interior
                      </label>
                      <input
                        name="numeroInterior"
                        type="text"
                        value={formData.numeroInterior}
                        onChange={handleChange}
                        placeholder="Ej. INT 4"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none uppercase bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Inclusión */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block border-b border-slate-200 pb-1">
                  Datos de Inclusión
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Género con el que se identifica
                    </label>
                    <select
                      name="generoIdentidad"
                      value={formData.generoIdentidad}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none uppercase"
                    >
                      <option value="" key="default-genero">
                        SELECCIONE UNA OPCIÓN...
                      </option>
                      {generos.map((item) => (
                        <option key={item.id} value={item.nombre}>
                          {item.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Identidad Cultural
                    </label>
                    <select
                      name="identidadCultural"
                      value={formData.identidadCultural}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none uppercase"
                    >
                      <option value="" key="default-identidad">
                        SELECCIONE UNA OPCIÓN...
                      </option>
                      {identidadesCulturales.map((item) => (
                        <option key={item.id} value={item.nombre}>
                          {item.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Capacidades especiales (Seleccione una o varias opciones):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-slate-200">
                    {LISTA_DISCAPACIDADES.map((item) => (
                      <label
                        key={item}
                        className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          name="discapacidades"
                          value={item}
                          checked={formData.discapacidades.includes(item)}
                          onChange={handleChange}
                          className="rounded border-slate-300 text-slate-900 focus:ring-0"
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tutor */}
              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-3">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block border-b border-amber-200 pb-1">
                  Datos del Padre, Madre o Tutor
                </span>
                <div className="flex flex-col gap-2.5">
                  <div className="grid grid-cols-3 gap-1">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] font-semibold text-amber-950">
                        Ap. Paterno
                      </label>
                      <input
                        name="tutorApellidoPaterno"
                        type="text"
                        value={formData.tutorApellidoPaterno}
                        onChange={handleChange}
                        placeholder="PRIMER AP."
                        className="w-full px-2 py-1.5 text-xs border border-amber-300 rounded-lg bg-white outline-none uppercase"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] font-semibold text-amber-950">
                        Ap. Materno
                      </label>
                      <input
                        name="tutorApellidoMaterno"
                        type="text"
                        value={formData.tutorApellidoMaterno}
                        onChange={handleChange}
                        placeholder="SEGUNDO AP."
                        className="w-full px-2 py-1.5 text-xs border border-amber-300 rounded-lg bg-white outline-none uppercase"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] font-semibold text-amber-950">
                        Nombre(s)
                      </label>
                      <input
                        name="tutorNombres"
                        type="text"
                        value={formData.tutorNombres}
                        onChange={handleChange}
                        placeholder="NOMBRE(S)"
                        className="w-full px-2 py-2 text-xs border border-amber-300 rounded-lg bg-white outline-none uppercase"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-amber-950">
                        Parentesco
                      </label>
                      <select
                        name="tutorParentesco"
                        value={formData.tutorParentesco}
                        onChange={handleChange}
                        className="w-full px-2 py-2 text-xs border border-amber-300 rounded-lg bg-white outline-none uppercase"
                      >
                        <option value="">SELECCIONE UNA OPCIÓN...</option>
                        {parentescosDisponibles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-amber-950">
                        Teléfono
                      </label>
                      <input
                        name="tutorTelefono"
                        type="tel"
                        maxLength={10}
                        value={formData.tutorTelefono}
                        onChange={handleChange}
                        placeholder="10 dígitos"
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
                2. Modalidad de Ingreso y Antecedentes Escolares
              </h2>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700">
                  Modalidad de Registro <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer text-xs font-medium transition ${formData.tipoAdmision === "nuevo_ingreso" ? "border-slate-900 bg-slate-50" : "border-slate-200"}`}
                  >
                    <input
                      type="radio"
                      name="tipoAdmision"
                      value="nuevo_ingreso"
                      checked={formData.tipoAdmision === "nuevo_ingreso"}
                      onChange={handleAdmissionTypeChange}
                    />
                    <span>
                      Opción 1: Viene de Secundaria (Regular)
                      <br />
                      <span className="text-slate-500 text-[10px]">
                        Egresado de secundaria
                      </span>
                    </span>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer text-xs font-medium transition ${formData.tipoAdmision === "revalidacion" ? "border-slate-900 bg-slate-50" : "border-slate-200"}`}
                  >
                    <input
                      type="radio"
                      name="tipoAdmision"
                      value="revalidacion"
                      checked={formData.tipoAdmision === "revalidacion"}
                      onChange={handleAdmissionTypeChange}
                    />
                    <span>
                      Opción 2: Trae Historial (Equivalencia / Irregular)
                      <br />
                      <span className="text-slate-500 text-[10px]">
                        Opciones sin secundaria
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {formData.tipoAdmision === "nuevo_ingreso" ? (
                <div className="space-y-3 pt-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                      Escuela de Procedencia (Secundaria - Llenado Manual)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Clave de la Escuela (CCT){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="cctEscuelaProcedencia"
                        type="text"
                        maxLength={10}
                        required
                        value={formData.cctEscuelaProcedencia}
                        onChange={handleChange}
                        placeholder="EJ. 30DST0001X"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white uppercase font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Nombre de la Escuela{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="nombreEscuelaProcedencia"
                        type="text"
                        required
                        value={formData.nombreEscuelaProcedencia}
                        onChange={handleChange}
                        placeholder="EJ. ESC. SEC. TÉCNICA NO. 3"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white uppercase"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-amber-50/70 border border-amber-200 p-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                      Escuela de Procedencia (Equivalencia / Historial Previo -
                      Llenado Manual)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-amber-950">
                        Sistema de Procedencia{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="sistemaProcedenciaLetra"
                        value={formData.sistemaProcedenciaLetra}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white outline-none uppercase font-semibold"
                      >
                        <option value="">SELECCIONE UNA OPCIÓN...</option>
                        {OPCIONES_PROCEDENCIA_EQUIVALENCIA.map((op) => (
                          <option key={op.letra} value={op.letra}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.sistemaProcedenciaLetra === "F" && (
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-amber-950">
                          Especifique cuál (Otro sistema):{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="otroSistemaProcedencia"
                          type="text"
                          required
                          value={formData.otroSistemaProcedencia}
                          onChange={handleChange}
                          placeholder="ESCRIBA EL SUBSISTEMA U OTRO"
                          className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white uppercase outline-none"
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-amber-950">
                        Clave de la Escuela (CCT){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="cctEscuelaProcedencia"
                        type="text"
                        maxLength={10}
                        required
                        value={formData.cctEscuelaProcedencia}
                        onChange={handleChange}
                        placeholder="EJ. 30EBH0100Y"
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white outline-none uppercase font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-amber-950">
                        Nombre del Plantel / Escuela{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="nombreEscuelaProcedencia"
                        type="text"
                        required
                        value={formData.nombreEscuelaProcedencia}
                        onChange={handleChange}
                        placeholder="EJ. CBTIS 13 / COBAEV 35"
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PASO 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  3. Carga de Expediente Digital (Programa Gratuito BELVER)
                </h2>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-semibold">
                  PDFs máx {MAX_PDF_SIZE_MB} MB • Foto máx {MAX_IMG_SIZE_MB} MB
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                {photoPreview ? (
                  <div className="w-20 h-24 rounded-lg overflow-hidden border border-slate-300 bg-white shadow-xs shrink-0">
                    <img
                      src={photoPreview}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-24 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-[10px] text-slate-400 text-center p-1 shrink-0">
                    Sin foto
                  </div>
                )}
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-xs font-semibold text-slate-800 flex justify-between">
                    <span>
                      Fotografía del Aspirante (JPG/PNG){" "}
                      <span className="text-red-500">*</span>
                    </span>
                    {formData.photo && (
                      <span className="text-[10px] text-emerald-700 font-mono">
                        ✓ Cargada
                      </span>
                    )}
                  </label>
                  <input
                    name="photo"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => handleFileChange(e, "image")}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 border border-slate-300 rounded-lg p-1 bg-white"
                  />
                  <span className="text-[10px] text-slate-500">
                    Formato infantil o credencial en fondo blanco o claro.
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-xs font-semibold text-slate-800 flex justify-between">
                  <span>
                    Acta de Nacimiento Certificada en Original (PDF){" "}
                    <span className="text-red-500">*</span>
                  </span>
                  {formData.actaNacimiento && (
                    <span className="text-[10px] text-emerald-700 font-mono">
                      ✓ Cargado
                    </span>
                  )}
                </label>
                <input
                  name="actaNacimiento"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, "pdf")}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 border border-slate-300 rounded-lg p-1 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-xs font-semibold text-slate-800 flex justify-between">
                  <span>
                    CURP Actualizada (PDF){" "}
                    <span className="text-red-500">*</span>
                  </span>
                  {formData.curpFile && (
                    <span className="text-[10px] text-emerald-700 font-mono">
                      ✓ Cargado
                    </span>
                  )}
                </label>
                <input
                  name="curpFile"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, "pdf")}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 border border-slate-300 rounded-lg p-1 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-xs font-semibold text-slate-800 flex justify-between">
                  <span>
                    INE (Si es menor de edad, colocar el INE del tutor) (PDF){" "}
                    <span className="text-red-500">*</span>
                  </span>
                  {formData.ineDocument && (
                    <span className="text-[10px] text-emerald-700 font-mono">
                      ✓ Cargado
                    </span>
                  )}
                </label>
                <input
                  name="ineDocument"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, "pdf")}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 border border-slate-300 rounded-lg p-1 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-xs font-semibold text-slate-800 flex justify-between">
                  <span>
                    Certificado de Estudios Original y Completo (PDF){" "}
                    <span className="text-red-500">*</span>
                  </span>
                  {formData.studyCert && (
                    <span className="text-[10px] text-emerald-700 font-mono">
                      ✓ Cargado
                    </span>
                  )}
                </label>
                <input
                  name="studyCert"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, "pdf")}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 border border-slate-300 rounded-lg p-1 bg-white"
                />
              </div>

              {formData.tipoAdmision === "revalidacion" && (
                <div className="flex flex-col gap-1 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <label className="text-xs font-semibold text-amber-950 flex justify-between">
                    <span>
                      Constancia de Estudios / Historial con Calificaciones
                      (PDF) <span className="text-red-500">*</span>
                    </span>
                    {formData.constanciaEstudios && (
                      <span className="text-[10px] text-emerald-800 font-mono">
                        ✓ Cargado
                      </span>
                    )}
                  </label>
                  <input
                    name="constanciaEstudios"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, "pdf")}
                    className="w-full text-xs text-amber-900 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-200 file:text-amber-900 hover:file:bg-amber-300 border border-slate-300 rounded-lg p-1 bg-white"
                  />
                </div>
              )}
            </div>
          )}

          {/* PASO 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
                4. Revisión General de Datos antes de Enviar
              </h2>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-blue-900 uppercase block mb-1">
                    Datos Personales y Contacto
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Aspirante
                      </span>
                      <span className="font-bold text-slate-900">{`${formData.apellidoPaterno} ${formData.apellidoMaterno || ""} ${formData.nombres}`}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        CURP
                      </span>
                      <span className="font-mono font-semibold text-slate-800">
                        {formData.curp.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Correo Electrónico 1
                      </span>
                      <span className="text-slate-800">
                        {formData.correoElectronico1}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Teléfono Celular
                      </span>
                      <span className="text-slate-800">
                        {formData.telefonoCelular}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-blue-900 uppercase block mb-1">
                    Domicilio
                  </span>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-800">
                      País: {formData.pais}, {formData.calle}, Núm. Ext:{" "}
                      {formData.numeroExterior || "S/N"}, Col.{" "}
                      {formData.colonia}, C.P. {formData.codigoPostal || "N/A"},{" "}
                      {formData.municipio}, {formData.estado}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-blue-900 uppercase block mb-1">
                    Antecedentes Escolares (
                    {formData.tipoAdmision === "nuevo_ingreso"
                      ? "Secundaria"
                      : "Equivalencia"}
                    )
                  </span>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                    <div>
                      <span className="font-semibold">Plantel / Escuela:</span>{" "}
                      {formData.nombreEscuelaProcedencia || "N/A"} (CCT:{" "}
                      {formData.cctEscuelaProcedencia || "N/A"})
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-blue-900 uppercase block mb-1">
                    Expediente Digital Adjunto
                  </span>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                      ✓ Fotografía
                    </span>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                      ✓ Acta de Nacimiento
                    </span>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                      ✓ CURP PDF
                    </span>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                      ✓ INE / INE Tutor
                    </span>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                      ✓ Certificado de Estudios
                    </span>
                    {formData.tipoAdmision === "revalidacion" && (
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                        ✓ Constancia / Historial
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Anterior
              </button>
            ) : (
              <div />
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                    Procesando Registro y Expediente...
                  </>
                ) : (
                  "Registrar Solicitud Oficial"
                )}
              </button>
            )}
          </div>
        </form>

        {/* Modal de Alertas */}
        {modalAlerta.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto text-xl font-bold"></div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {modalAlerta.titulo}
                </h3>
                <p className="text-xs text-slate-600 mt-2">
                  {modalAlerta.mensaje}
                </p>
              </div>
              <button
                onClick={() =>
                  setModalAlerta({ isOpen: false, mensaje: "", titulo: "" })
                }
                className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-md"
              >
                Aceptar y Continuar
              </button>
            </div>
          </div>
        )}

        {/* Modal de Consulta */}
        {isConsultaOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 transform transition-all">
              <div className="px-6 py-4 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-sm shadow-inner"></div>
                  <div>
                    <h2 className="text-xs font-bold tracking-widest uppercase text-slate-100 flex items-center gap-2">
                      Consulta Pública de Solicitud y Estatus
                      <span className="text-[9px] bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded font-mono font-normal">
                        BELVER
                      </span>
                    </h2>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Sistema institucional de control de expedientes de
                      admisión
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsConsultaOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition shadow-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto text-xs bg-slate-50/60">
                <form
                  onSubmit={handleConsultar}
                  className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        Folio de Seguimiento{" "}
                        <span className="text-blue-900">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. BEL-2026-XXXX"
                        value={folioInput}
                        onChange={(e) => setFolioInput(e.target.value)}
                        className="px-3.5 py-2.5 border border-slate-300 rounded-xl uppercase font-mono text-xs bg-slate-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-slate-900 transition"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        CURP del Aspirante{" "}
                        <span className="text-blue-900">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={18}
                        placeholder="18 caracteres oficiales"
                        value={curpInput}
                        onChange={(e) => setCurpInput(e.target.value)}
                        className="px-3.5 py-2.5 border border-slate-300 rounded-xl uppercase font-mono text-xs bg-slate-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-slate-900 transition"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={cargandoConsulta}
                    className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs tracking-wider uppercase disabled:opacity-50"
                  >
                    {cargandoConsulta ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          ></path>
                        </svg>
                        Verificando en Base de Datos...
                      </span>
                    ) : (
                      "Consultar Estatus y Expediente"
                    )}
                  </button>
                </form>

                {consultaError && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-center font-medium shadow-2xs flex items-center justify-center gap-2">
                    <span></span> {consultaError}
                  </div>
                )}

                {consultaResult && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-2xs animate-fadeIn">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                          Aspirante
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm">
                          {consultaResult.aspirante}
                        </h3>
                      </div>
                      <span className="px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 font-extrabold rounded-xl text-[10px] tracking-wider uppercase flex items-center gap-1.5 shadow-2xs">
                        {consultaResult.estatus}
                      </span>
                    </div>

                    {consultaResult.estatus === "APROBADO" && (
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2 text-center my-3">
                        <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
                          🎉 ¡Expediente Aprobado con Éxito!
                        </span>
                        <p className="text-xs text-emerald-800">
                          Tus credenciales institucionales definitivas son:
                        </p>
                        <div className="bg-white border border-emerald-300 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-around gap-2 font-mono text-xs">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase block font-sans font-bold">
                              Matrícula Oficial
                            </span>
                            <strong className="text-blue-950 text-sm">
                              {consultaResult.matricula || "N/A"}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase block font-sans font-bold">
                              Contraseña Permanente
                            </span>
                            <strong className="text-slate-900 text-sm">
                              {consultaResult.password || "N/A"}
                            </strong>
                          </div>
                        </div>
                      </div>
                    )}

                    {consultaResult.observaciones &&
                      consultaResult.estatus !== "APROBADO" && (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                              Observaciones y Correcciones Requeridas
                            </span>
                            {consultaResult.fechaValidacion && (
                              <span className="text-[10px] font-mono text-amber-700 font-semibold">
                                {consultaResult.fechaValidacion}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-amber-950 font-medium">
                            {consultaResult.observaciones}
                          </p>
                        </div>
                      )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">
                          Folio Oficial:
                        </span>
                        <span className="font-mono font-bold text-slate-800 text-xs mt-0.5">
                          {consultaResult.folio}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">
                          CURP:
                        </span>
                        <span className="font-mono font-bold text-slate-800 text-xs mt-0.5">
                          {consultaResult.curp}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                          Expediente de Documentos
                        </span>
                      </div>
                      <div className="space-y-2.5">
                        {consultaResult.documentos &&
                        consultaResult.documentos.length > 0 ? (
                          consultaResult.documentos.map((doc, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white hover:bg-slate-50/50 p-3.5 rounded-xl border border-slate-200 shadow-2xs gap-3 transition"
                            >
                              <div className="flex items-start gap-2.5 overflow-hidden">
                                <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs shrink-0 shadow-2xs">
                                  📄
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                  <span className="font-bold text-slate-900 uppercase text-[11px] tracking-tight">
                                    {traducirTipoDocumento(doc.tipo)}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono truncate max-w-[210px] sm:max-w-[250px]">
                                    Archivo: {doc.nombreArchivo}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            No se encontraron documentos adjuntos para este
                            registro.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsConsultaOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition shadow-2xs"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
