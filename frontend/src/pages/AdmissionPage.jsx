import React, { useState, useEffect } from "react";

const MAX_PDF_SIZE_MB = 5;
const MAX_IMG_SIZE_MB = 2;

// Diccionario institucional para traducir las claves técnicas de los archivos
const traducirTipoDocumento = (tipo) => {
  const diccionario = {
    photo: "FOTOGRAFÍA INFANTIL",
    actaNacimiento: "ACTA DE NACIMIENTO",
    curpFile: "DOCUMENTO CURP (PDF)",
    studyCert: "CERTIFICADO DE SECUNDARIA",
    constanciaEstudios: "CONSTANCIA DE ESTUDIOS",
  };
  return diccionario[tipo] || tipo.toUpperCase();
};

export default function AdmissionPage() {
  const [step, setStep] = useState(1);
  const [submittedData, setSubmittedData] = useState(null);
  const [isConsultaOpen, setIsConsultaOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado de carga para el envío final

  // Estados para los catálogos dinámicos cargados desde la Base de Datos
  const [tiposSecundarias, setTiposSecundarias] = useState([]);
  const [subsistemasPrepa, setSubsistemasPrepa] = useState([]);
  const [mediosEnterado, setMediosEnterado] = useState([]);
  const [generosIdentidad, setGenerosIdentidad] = useState([]);
  const [identidadesCulturales, setIdentidadesCulturales] = useState([]);
  const [situacionesLaborales, setSituacionesLaborales] = useState([]);
  const [discapacidadesDisponibles, setDiscapacidadesDisponibles] = useState(
    [],
  ); // 🌟 Nuevo estado dinámico

  // Estado para la vista previa de la fotografía
  const [photoPreview, setPhotoPreview] = useState(null);

  // Cargar catálogos institucionales al montar el componente desde la API
  useEffect(() => {
    const cargarCatalogosDesdeBD = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/admission/catalogos",
        );
        const resultado = await response.json();
        if (response.ok && resultado.ok) {
          setTiposSecundarias(resultado.data.tiposSecundaria || []);
          setSubsistemasPrepa(resultado.data.subsistemasBachillerato || []);
          setMediosEnterado(resultado.data.mediosEnterado || []);
          setGenerosIdentidad(resultado.data.generoIdentidad || []);
          setIdentidadesCulturales(resultado.data.identidadCultural || []);
          setSituacionesLaborales(resultado.data.situacionLaboral || []);
          setDiscapacidadesDisponibles(resultado.data.discapacidades || []); // 🌟 Captura el catálogo de discapacidades
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
    correoElectronico1: "",
    correoElectronicoConfirmacion: "",
    correoElectronico2: "",
    telefonoCelular: "",
    telefonoParticular: "",
    generoIdentidad: "",
    identidadCultural: "",
    tieneDiscapacidad: "NO",
    apoyoEducativo: "NO",
    situacionLaboral: "",
    cuentaComputadora: "SÍ",
    cuentaInternet: "SÍ",
    medioEnterado: "",
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
    tutorTelefono: "", // 👈 Unificado 100% en español con el backend
    tipoAdmision: "nuevo_ingreso",
    tipoSecundaria: "",
    cctEscuelaProcedencia: "",
    nombreEscuelaProcedencia: "",
    estadoEscuelaProcedencia: "",
    promedioSecundaria: "",
    sistemaBachilleratoPrevio: "A. SECUNDARIA",
    otroSistemaProcedencia: "",
    previousSchoolCct: "",
    previousHighSchoolName: "",
    previousSchoolState: "",
    tipoEstudiante: "REGULAR",
    currentSemester: "2",
    studyPlan: "",
    photo: null,
    studyCert: null,
    constanciaEstudios: null,
    curpFile: null,
    actaNacimiento: null,
  });

  const mostrarAlerta = (mensaje, titulo = "Atención") => {
    setModalAlerta({ isOpen: true, mensaje, titulo });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
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
    } else if (["cctEscuelaProcedencia", "previousSchoolCct"].includes(name)) {
      processedValue = value
        .replace(/[^A-Za-z0-9]/g, "")
        .toUpperCase()
        .slice(0, 10);
    } else if (
      [
        "apellidoPaterno",
        "apellidoMaterno",
        "nombres",
        "tutorApellidoPaterno",
        "tutorApellidoMaterno",
        "tutorNombres",
        "estado",
        "municipio",
        "estadoEscuelaProcedencia",
        "previousSchoolState",
      ].includes(name)
    ) {
      processedValue = value
        .replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ\s]/g, "")
        .toUpperCase();
    } else if (name === "curp") {
      processedValue = value
        .replace(/[^A-Za-z0-9]/g, "")
        .toUpperCase()
        .slice(0, 18);
    } else if (name === "promedioSecundaria") {
      processedValue = value.replace(/[^0-9.]/g, "").slice(0, 4);
    } else {
      processedValue = value.toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleAdmissionTypeChange = (e) => {
    const tipo = e.target.value;
    setFormData((prev) => ({
      ...prev,
      tipoAdmision: tipo,
      sistemaBachilleratoPrevio:
        tipo === "nuevo_ingreso" ? "A. SECUNDARIA" : "",
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
          `El archivo PDF excede el límite de ${MAX_PDF_SIZE_MB} MB permitidos.`,
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
        !formData.codigoPostal ||
        !formData.municipio ||
        !formData.calle
      ) {
        mostrarAlerta(
          "Por favor complete todos los campos obligatorios marcados con (*).",
          "Campos Incompletos",
        );
        return;
      }

      if (
        formData.correoElectronico1 !== formData.correoElectronicoConfirmacion
      ) {
        mostrarAlerta(
          "Los correos electrónicos ingresados no coinciden. Por favor verifíquelos.",
          "Correo Electrónico Divergente",
        );
        return;
      }

      if (formData.curp.length < 18) {
        mostrarAlerta(
          "La CURP debe tener exactamente 18 caracteres.",
          "CURP Incompleta",
        );
        return;
      }

      if (formData.telefonoCelular.length < 10) {
        mostrarAlerta(
          "El teléfono celular debe tener exactamente 10 dígitos.",
          "Teléfono Incompleto",
        );
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:4000/api/admission/verificar-duplicado?curp=${formData.curp.trim()}&email=${formData.correoElectronico1.trim()}`,
        );
        const data = await res.json();

        if (data.existe) {
          mostrarAlerta(data.mensaje, "Registro Duplicado");
          return;
        }
      } catch (error) {
        console.error("Error al verificar duplicados en servidor:", error);
        mostrarAlerta(
          "No fue posible establecer conexión con el sistema en este momento. Por favor, inténtelo más tarde.",
          "Error de Comunicación",
        );
        return;
      }
    }

    if (step === 2) {
      if (
        formData.tipoAdmision === "nuevo_ingreso" &&
        (!formData.tipoSecundaria ||
          !formData.cctEscuelaProcedencia ||
          !formData.nombreEscuelaProcedencia ||
          !formData.estadoEscuelaProcedencia ||
          !formData.promedioSecundaria)
      ) {
        mostrarAlerta(
          "Por favor complete todos los campos obligatorios de la escuela de procedencia.",
          "Antecedentes Incompletos",
        );
        return;
      }
      if (
        formData.tipoAdmision === "revalidacion" &&
        (!formData.sistemaBachilleratoPrevio ||
          !formData.tipoEstudiante ||
          !formData.previousSchoolCct ||
          !formData.previousHighSchoolName ||
          !formData.previousSchoolState ||
          !formData.currentSemester ||
          !formData.studyPlan)
      ) {
        mostrarAlerta(
          "Por favor complete todos los campos obligatorios del historial de bachillerato.",
          "Antecedentes Incompletos",
        );
        return;
      }
    }

    if (step === 3) {
      if (!formData.photo) {
        mostrarAlerta(
          "Es obligatorio adjuntar la Fotografía del Aspirante.",
          "Documento Faltante",
        );
        return;
      }
      if (!formData.actaNacimiento) {
        mostrarAlerta(
          "Es obligatorio adjuntar el Acta de Nacimiento.",
          "Documento Faltante",
        );
        return;
      }
      if (!formData.curpFile) {
        mostrarAlerta(
          "Es obligatorio adjuntar el archivo CURP en formato PDF.",
          "Documento Faltante",
        );
        return;
      }
      if (formData.tipoAdmision === "nuevo_ingreso" && !formData.studyCert) {
        mostrarAlerta(
          "Es obligatorio adjuntar el Certificado de Secundaria.",
          "Documento Faltante",
        );
        return;
      }
      if (
        formData.tipoAdmision === "revalidacion" &&
        !formData.constanciaEstudios
      ) {
        mostrarAlerta(
          "Es obligatorio adjuntar la Constancia de Estudios o Historial Académico.",
          "Documento Faltante",
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
      Object.keys(formData).forEach((key) => {
        if (
          key !== "correoElectronicoConfirmacion" &&
          formData[key] !== null &&
          formData[key] !== undefined
        ) {
          dataToSend.append(key, formData[key]);
        }
      });

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
          resultado.mensaje ||
            "Verifica los datos proporcionados en el sistema.",
          "Error de Registro",
        );
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      mostrarAlerta(
        "No fue posible establecer conexión con el sistema en este momento. Por favor, inténtelo más tarde o verifique su red.",
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
        setConsultaError(
          resultado.mensaje ||
            "No se encontró información con los datos proporcionados.",
        );
      }
    } catch (error) {
      console.error("Error de conexión al consultar:", error);
      setConsultaError(
        "No se pudo conectar con el servidor para realizar la consulta.",
      );
    } finally {
      setCargandoConsulta(false);
    }
  };

  if (submittedData) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              ¡Solicitud Registrada Exitosamente!
            </h2>
            <p className="text-xs text-slate-600 mt-2">
              Hemos enviado un comprobante con tu folio al correo electrónico
              registrado.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-1">
            <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase block">
              Folio de Seguimiento
            </span>
            <div className="text-2xl font-mono font-extrabold text-blue-950 tracking-wider">
              {submittedData.folio}
            </div>
            <div className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 py-1 px-3 rounded-lg inline-block mt-2">
              ⚠️ Vigencia del folio hasta:{" "}
              <strong>{submittedData.vigencia}</strong>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => window.print()}
              className="w-full py-2.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition shadow-sm"
            >
              📥 Descargar / Imprimir Comprobante PDF
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-md"
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
                1. Datos Personales, Inclusión, Domicilio y Tutor
              </h2>

              <div className="space-y-3">
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
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none uppercase"
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
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none uppercase"
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
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none uppercase"
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
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none uppercase font-mono"
                    />
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
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="correoElectronico1"
                      type="email"
                      required
                      value={formData.correoElectronico1}
                      onChange={handleChange}
                      placeholder="aspirante@ejemplo.com"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none lowercase"
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
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none lowercase"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Correo Electrónico Alternativo (Opcional)
                    </label>
                    <input
                      name="correoElectronico2"
                      type="email"
                      value={formData.correoElectronico2}
                      onChange={handleChange}
                      placeholder="alternativo@ejemplo.com"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none lowercase"
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN DE INCLUSIÓN */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block border-b border-slate-200 pb-1">
                  Identidad, Diversidad Sexual, Capacidades Especiales e
                  Identidad Cultural
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
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none"
                    >
                      <option value="">SELECCIONE UNA OPCIÓN...</option>
                      {generosIdentidad.map((g) => (
                        <option key={g} value={g}>
                          {g}
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
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none"
                    >
                      <option value="">SELECCIONE UNA OPCIÓN...</option>
                      {identidadesCulturales.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      ¿Presenta alguna discapacidad o capacidad especial?
                    </label>
                    <select
                      name="tieneDiscapacidad"
                      value={formData.tieneDiscapacidad}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none uppercase"
                    >
                      <option value="NO">NINGUNA</option>
                      {discapacidadesDisponibles.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      ¿Requiere apoyo educativo especial?
                    </label>
                    <select
                      name="apoyoEducativo"
                      value={formData.apoyoEducativo}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none"
                    >
                      <option value="NO">NO</option>
                      <option value="SÍ">SÍ</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* DOMICILIO */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    Domicilio Exacto (Catálogo SEPOMEX México)
                  </span>
                  {cargandoCp && (
                    <span className="text-[10px] text-blue-600 animate-pulse font-semibold">
                      Buscando código postal...
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Estado <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="estado"
                      type="text"
                      readOnly
                      value={formData.estado}
                      placeholder="Automático por C.P."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-100 text-slate-600 font-medium uppercase"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Municipio / Alcaldía{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="municipio"
                      type="text"
                      readOnly
                      required
                      value={formData.municipio}
                      placeholder="Automático por C.P."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-100 text-slate-600 font-medium uppercase"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Colonia / Asentamiento{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    {coloniasDisponibles.length > 0 ? (
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
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none uppercase"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
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
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none uppercase"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
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
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none uppercase"
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
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* TUTOR */}
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
                        className="w-full px-2 py-1.5 text-xs border border-amber-300 rounded-lg bg-white outline-none uppercase"
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
                        <option value="MAMÁ">MAMÁ</option>
                        <option value="PAPÁ">PAPÁ</option>
                        <option value="SOY YO">SOY YO</option>
                        <option value="OTRO">OTRO</option>
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
                      Opción 2: Trae Historial
                      <br />
                      <span className="text-slate-500 text-[10px]">
                        Revalidación / Equivalencia
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {formData.tipoAdmision === "nuevo_ingreso" ? (
                <div className="space-y-3 pt-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block">
                    Datos de la Escuela de Procedencia (Secundaria Regular)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Tipo de Secundaria{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="tipoSecundaria"
                        value={formData.tipoSecundaria}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none"
                      >
                        <option value="">SELECCIONE UNA OPCIÓN...</option>
                        {tiposSecundarias.map((ts) => (
                          <option key={ts} value={ts}>
                            {ts}
                          </option>
                        ))}
                      </select>
                    </div>
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
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Entidad de la Secundaria{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="estadoEscuelaProcedencia"
                        type="text"
                        required
                        value={formData.estadoEscuelaProcedencia}
                        onChange={handleChange}
                        placeholder="EJ. VERACRUZ"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white uppercase"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Promedio (6-10) <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="promedioSecundaria"
                        type="text"
                        required
                        maxLength={4}
                        value={formData.promedioSecundaria}
                        onChange={handleChange}
                        placeholder="Ej. 9.1"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-amber-50/70 border border-amber-200 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                    Información de Bachillerato Anterior (Revalidación /
                    Equivalencia)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-amber-950">
                        Sistema de Procedencia{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="sistemaBachilleratoPrevio"
                        value={formData.sistemaBachilleratoPrevio}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white outline-none"
                      >
                        <option value="">SELECCIONE UNA OPCIÓN...</option>
                        {subsistemasPrepa.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.sistemaBachilleratoPrevio === "F. OTRO" && (
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-amber-950">
                          Especifique cuál subsistema u otro:{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="otroSistemaProcedencia"
                          type="text"
                          required
                          value={formData.otroSistemaProcedencia}
                          onChange={handleChange}
                          placeholder="ESCRIBA EL SUBSISTEMA"
                          className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white uppercase outline-none"
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-amber-950">
                        Tipo de Alumno <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="tipoEstudiante"
                        value={formData.tipoEstudiante}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white outline-none uppercase"
                      >
                        <option value="REGULAR">REGULAR</option>
                        <option value="REPETIDOR">REPETIDOR</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-amber-950">
                        Clave de la Escuela (CCT){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="previousSchoolCct"
                        type="text"
                        maxLength={10}
                        required
                        value={formData.previousSchoolCct}
                        onChange={handleChange}
                        placeholder="EJ. 30EBH0100Y"
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white outline-none uppercase font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-amber-950">
                        Nombre del Plantel / Escuela{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="previousHighSchoolName"
                        type="text"
                        required
                        value={formData.previousHighSchoolName}
                        onChange={handleChange}
                        placeholder="EJ. CBTIS 13 / COBAEV 35"
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white outline-none uppercase"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-amber-950">
                        Entidad del Bachillerato{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="previousSchoolState"
                        type="text"
                        required
                        value={formData.previousSchoolState}
                        onChange={handleChange}
                        placeholder="EJ. VERACRUZ"
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white outline-none uppercase"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-amber-950">
                        ¿Hasta qué semestre cursaste?{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="currentSemester"
                        value={formData.currentSemester}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white outline-none"
                      >
                        <option value="">SELECCIONE UNA OPCIÓN...</option>
                        <option value="2">2° Semestre</option>
                        <option value="3">3° Semestre</option>
                        <option value="4">4° Semestre</option>
                        <option value="5">5° Semestre</option>
                        <option value="6">6° Semestre</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-amber-950">
                        Plan de Estudios Cursado{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="studyPlan"
                        type="text"
                        required
                        value={formData.studyPlan}
                        onChange={handleChange}
                        placeholder="EJ. BACHILLERATO GENERAL / TÉCNICO"
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white outline-none uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Perfil Tecnológico */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                  Perfil Tecnológico y Estadística Institucional
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Situación Laboral
                    </label>
                    <select
                      name="situacionLaboral"
                      value={formData.situacionLaboral}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none uppercase"
                    >
                      <option value="">SELECCIONE...</option>
                      {situacionesLaborales.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      ¿Cuenta con computadora e internet?
                    </label>
                    <select
                      name="cuentaComputadora"
                      value={formData.cuentaComputadora}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none uppercase"
                    >
                      <option value="SÍ">SÍ</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      ¿Cómo se enteró de BELVER?
                    </label>
                    <select
                      name="medioEnterado"
                      value={formData.medioEnterado}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none uppercase"
                    >
                      <option value="">SELECCIONE...</option>
                      {mediosEnterado.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
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
              {formData.tipoAdmision === "nuevo_ingreso" ? (
                <div className="flex flex-col gap-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="text-xs font-semibold text-slate-800 flex justify-between">
                    <span>
                      Certificado de Secundaria Original y Completo (PDF){" "}
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
              ) : (
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

          {/* PASO 4: REVISIÓN DETALLADA */}
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
                        Correo Electrónico
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
                      {formData.calle}, Núm. Ext:{" "}
                      {formData.numeroExterior || "S/N"}, Col.{" "}
                      {formData.colonia}, C.P. {formData.codigoPostal},{" "}
                      {formData.municipio}, {formData.estado}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-blue-900 uppercase block mb-1">
                    Antecedentes Escolares (
                    {formData.tipoAdmision === "nuevo_ingreso"
                      ? "Secundaria"
                      : "Revalidación"}
                    )
                  </span>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                    {formData.tipoAdmision === "nuevo_ingreso" ? (
                      <>
                        <div>
                          <span className="font-semibold">Escuela:</span>{" "}
                          {formData.nombreEscuelaProcedencia} (CCT:{" "}
                          {formData.cctEscuelaProcedencia})
                        </div>
                        <div>
                          <span className="font-semibold">Entidad:</span>{" "}
                          {formData.estadoEscuelaProcedencia} |{" "}
                          <span className="font-semibold">Promedio:</span>{" "}
                          {formData.promedioSecundaria}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="font-semibold">
                            Plantel Anterior:
                          </span>{" "}
                          {formData.previousHighSchoolName} (CCT:{" "}
                          {formData.previousSchoolCct})
                        </div>
                        <div>
                          <span className="font-semibold">
                            Semestre Cursado:
                          </span>{" "}
                          {formData.currentSemester}° |{" "}
                          <span className="font-semibold">Plan:</span>{" "}
                          {formData.studyPlan}
                        </div>
                      </>
                    )}
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
                      ✓ Certificado / Constancia
                    </span>
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

        {/* MODAL DE ALERTAS PERSONALIZADO */}
        {modalAlerta.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                ⚠️
              </div>
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

        {/* MODAL DE CONSULTA FORMAL E INSTITUCIONAL */}
        {isConsultaOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 transform transition-all">
              <div className="px-6 py-4 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-sm">
                    📋
                  </div>
                  <div>
                    <h2 className="text-xs font-bold tracking-widest uppercase text-slate-200">
                      Sistema Institucional BELVER
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Consulta Pública de Solicitud y Estatus Académico
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsConsultaOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition shadow-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto text-xs bg-slate-50/50">
                <form
                  onSubmit={handleConsultar}
                  className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm"
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
                        className="px-3.5 py-2.5 border border-slate-300 rounded-xl uppercase font-mono text-xs bg-slate-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-950 transition"
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
                        className="px-3.5 py-2.5 border border-slate-300 rounded-xl uppercase font-mono text-xs bg-slate-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-950 transition"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={cargandoConsulta}
                    className="w-full py-3 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs tracking-wider uppercase"
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
                      "Consultar Estatus en Tiempo Real"
                    )}
                  </button>
                </form>

                {consultaError && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-center font-medium shadow-xs flex items-center justify-center gap-2">
                    <span>⚠️</span> {consultaError}
                  </div>
                )}

                {consultaResult && (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-5 shadow-sm animate-fadeIn">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase block mb-0.5">
                          Aspirante Registrado
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm tracking-wide">
                          {consultaResult.aspirante}
                        </h3>
                      </div>
                      <span className="px-3.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 font-extrabold rounded-xl text-[10px] tracking-wider uppercase shadow-2xs">
                        {consultaResult.estatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] bg-slate-50/70 p-4 rounded-xl border border-slate-100">
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
                      <div className="flex flex-col">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">
                          Modalidad de Ingreso:
                        </span>
                        <span className="text-slate-700 font-semibold mt-0.5">
                          {consultaResult.modalidad}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">
                          Vigencia de Trámite:
                        </span>
                        <span className="text-amber-800 font-bold mt-0.5">
                          {consultaResult.vigencia}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-widest">
                          Expediente Digital y Documentación
                        </span>
                        <span className="text-[9px] text-blue-900 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md font-medium">
                          💡 Archivos sujetos a validación escolar
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {consultaResult.documentos.map((doc, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50/50 hover:bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 shadow-2xs gap-3 transition"
                          >
                            <div className="flex items-start gap-2.5 overflow-hidden">
                              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs shrink-0 shadow-2xs">
                                📄
                              </div>
                              <div className="flex flex-col overflow-hidden">
                                <span className="font-bold text-slate-900 uppercase text-[11px] tracking-tight">
                                  {traducirTipoDocumento(doc.tipo)}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono truncate max-w-[210px] sm:max-w-[260px]">
                                  {doc.nombreArchivo}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                              <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">
                                {doc.estatusDoc}
                              </span>

                              <label className="cursor-pointer px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-semibold transition shadow-xs flex items-center gap-1.5 shrink-0">
                                🔄 Actualizar
                                <input
                                  type="file"
                                  accept={
                                    doc.tipo === "photo" ? "image/*" : ".pdf"
                                  }
                                  className="hidden"
                                  onChange={async (e) => {
                                    const nuevoArchivo = e.target.files[0];
                                    if (!nuevoArchivo) return;

                                    const formDataUpdate = new FormData();
                                    formDataUpdate.append(
                                      "folio",
                                      consultaResult.folio,
                                    );
                                    formDataUpdate.append(
                                      "curp",
                                      consultaResult.curp,
                                    );
                                    formDataUpdate.append("tipoDoc", doc.tipo);
                                    formDataUpdate.append(
                                      doc.tipo,
                                      nuevoArchivo,
                                    );

                                    try {
                                      const res = await fetch(
                                        "http://localhost:4000/api/admission/actualizar-documento",
                                        {
                                          method: "PUT",
                                          body: formDataUpdate,
                                        },
                                      );
                                      const data = await res.json();
                                      if (res.ok && data.ok) {
                                        mostrarAlerta(
                                          "¡El archivo digital se ha actualizado con éxito en el sistema!",
                                          "Actualización Exitosa",
                                        );
                                        handleConsultar();
                                      } else {
                                        mostrarAlerta(
                                          data.mensaje ||
                                            "No se pudo actualizar el archivo.",
                                          "Error",
                                        );
                                      }
                                    } catch (err) {
                                      console.error(
                                        "Error al actualizar archivo:",
                                        err,
                                      );
                                      mostrarAlerta(
                                        "Error de conexión al intentar actualizar el documento.",
                                        "Error de Red",
                                      );
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        ))}
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
                  Cerrar Ventana
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
