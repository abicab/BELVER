import React, { useState, useEffect } from "react";

const MAX_PDF_SIZE_MB = 5;
const MAX_IMG_SIZE_MB = 2;

const CATALOGO_ESTADOS_CURP = [
  "AS",
  "BC",
  "BS",
  "CC",
  "CL",
  "CM",
  "CS",
  "CH",
  "DF",
  "DG",
  "GT",
  "GR",
  "HG",
  "JC",
  "MC",
  "MN",
  "MS",
  "NT",
  "NL",
  "OC",
  "PL",
  "QT",
  "QR",
  "SP",
  "SL",
  "SR",
  "TC",
  "TS",
  "TL",
  "VZ",
  "YN",
  "ZS",
  "NE",
];

const traducirTipoDocumento = (tipo) => {
  const diccionario = {
    photo: "FOTOGRAFÍA INFANTIL",
    actaNacimiento: "ACTA DE NACIMIENTO",
    curpFile: "DOCUMENTO CURP (PDF)",
    studyCert: "CERTIFICADO DE SECUNDARIA",
    constanciaEstudios:
      "CONSTANCIA DE ESTUDIOS, CERTIFICADO INCOMPLETO O EQUIVALENCIA",
    ineDocument: "IDENTIFICACIÓN OFICIAL (INE / INE TUTOR)",
  };
  return diccionario[tipo] || tipo.toUpperCase();
};

const validarEstructuraCurp = (curp) => {
  if (!curp || curp.length !== 18) return false;
  const regexEstricta = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]{2}$/;
  if (!regexEstricta.test(curp)) return false;

  const anioDigito = parseInt(curp.substring(4, 6), 10);
  const mes = parseInt(curp.substring(6, 8), 10) - 1;
  const dia = parseInt(curp.substring(8, 10), 10);
  const anioCompleto = anioDigito > 26 ? 1900 + anioDigito : 2000 + anioDigito;

  const fechaNacimiento = new Date(anioCompleto, mes, dia);
  if (
    fechaNacimiento.getFullYear() !== anioCompleto ||
    fechaNacimiento.getMonth() !== mes ||
    fechaNacimiento.getDate() !== dia
  ) {
    return false;
  }

  const estadoClave = curp.substring(11, 13);
  if (!CATALOGO_ESTADOS_CURP.includes(estadoClave)) return false;

  return true;
};

const analizarCurpAutomatica = (curp) => {
  if (!curp || curp.length !== 18 || !validarEstructuraCurp(curp)) {
    return { fechaNacimiento: "", sexo: "" };
  }
  const anioDigito = parseInt(curp.substring(4, 6), 10);
  const mes = curp.substring(6, 8);
  const dia = curp.substring(8, 10);
  const anioCompleto =
    anioDigito > 26 ? `19${curp.substring(4, 6)}` : `20${curp.substring(4, 6)}`;
  const fechaNacimiento = `${anioCompleto}-${mes}-${dia}`;

  const letraSexo = curp.charAt(10).toUpperCase();
  const sexo = letraSexo === "H" ? "HOMBRE" : letraSexo === "M" ? "MUJER" : "";

  return { fechaNacimiento, sexo };
};

export default function AdmissionPage() {
  const [step, setStep] = useState(1);
  const [submittedData, setSubmittedData] = useState(null);
  const [isConsultaOpen, setIsConsultaOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [generos, setGeneros] = useState([]);
  const [identidadesCulturales, setIdentidadesCulturales] = useState([]);
  const [parentescosDisponibles, setParentescosDisponibles] = useState([]);
  const [subsistemasDisponibles, setSubsistemasDisponibles] = useState([]);
  const [semestresDisponibles, setSemestresDisponibles] = useState([]);
  const [discapacidadesDisponibles, setDiscapacidadesDisponibles] = useState(
    [],
  );

  const [photoPreview, setPhotoPreview] = useState(null);

  const [modalAlerta, setModalAlerta] = useState({
    isOpen: false,
    mensaje: "",
    titulo: "Atención",
  });

  const mostrarAlerta = (mensaje, titulo = "Aviso Importante") => {
    setModalAlerta({ isOpen: true, mensaje, titulo });
  };

  useEffect(() => {
    const cargarCatalogosDesdeBD = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/catalogo");
        const resultado = await response.json();
        if (response.ok && resultado.ok) {
          setGeneros(resultado.data.genero || []);
          setIdentidadesCulturales(resultado.data.identidadCultural || []);
          setParentescosDisponibles(resultado.data.parentesco || []);

          const subsFiltrados = (resultado.data.subsistema || []).filter(
            (sub) => !sub.nombre.toUpperCase().includes("SECUNDARIA"),
          );
          setSubsistemasDisponibles(subsFiltrados);

          setSemestresDisponibles(resultado.data.semestre || []);
          setDiscapacidadesDisponibles(resultado.data.discapacidad || []);
        }
      } catch (error) {
        console.error("Error al cargar catálogos:", error);
      }
    };
    cargarCatalogosDesdeBD();
  }, []);

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
    sexo: "",
    generoId: "",
    correoElectronico1: "",
    correoElectronicoConfirmacion: "",
    correoElectronico2: "",
    telefonoCelular: "",
    telefonoParticular: "",
    identidadCulturalId: "",
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
    parentescoTutorId: "",
    tutorTelefono: "",
    tipoAdmision: "nuevo_ingreso",
    subsistemaId: "",
    otroSistemaProcedencia: "",
    semestresSeleccionados: [],
    cctEscuelaProcedencia: "",
    nombreEscuelaProcedencia: "",
    photo: null,
    studyCert: null,
    constanciaEstudios: null,
    curpFile: null,
    actaNacimiento: null,
    ineDocument: null,
  });

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

    if (name === "semestresSeleccionados") {
      let nuevosSemestres = [...formData.semestresSeleccionados];
      if (checked) {
        nuevosSemestres.push(value);
      } else {
        nuevosSemestres = nuevosSemestres.filter((s) => s !== value);
      }
      setFormData((prev) => ({
        ...prev,
        semestresSeleccionados: nuevosSemestres,
      }));
      return;
    }

    let processedValue = value;

    if (name.includes("correoElectronico")) {
      processedValue = value.trim();
    } else if (
      ["telefonoCelular", "telefonoParticular", "tutorTelefono"].includes(name)
    ) {
      processedValue = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "codigoPostal" && formData.pais === "MÉXICO") {
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
          sexo: datosCurp.sexo,
        }));
        return;
      } else if (processedValue.length === 0) {
        setFormData((prev) => ({
          ...prev,
          curp: "",
          fechaNacimiento: "",
          sexo: "",
        }));
        return;
      }
    } else {
      processedValue = value.toUpperCase();
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
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
    setColoniasDisponibles([]);
  };

  const handleAdmissionTypeChange = (e) => {
    const tipo = e.target.value;
    setFormData((prev) => ({
      ...prev,
      tipoAdmision: tipo,
      subsistemaId: "",
      otroSistemaProcedencia: "",
      cctEscuelaProcedencia: "",
      nombreEscuelaProcedencia: "",
    }));
  };

  const handleCodigoPostalChange = async (e) => {
    const cp = e.target.value;
    if (formData.pais === "MÉXICO") {
      const cpLimpio = cp.replace(/\D/g, "").slice(0, 5);
      setFormData((prev) => ({ ...prev, codigoPostal: cpLimpio }));

      if (cpLimpio.length === 5) {
        setCargandoCp(true);
        try {
          const response = await fetch(
            `https://cp.terio.dev/v1/codigos-postales/${cpLimpio}`,
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
          console.error("Error al consultar CP:", error);
        } finally {
          setCargandoCp(false);
        }
      } else {
        setColoniasDisponibles([]);
      }
    } else {
      setFormData((prev) => ({ ...prev, codigoPostal: cp.toUpperCase() }));
    }
  };

  const handleFileChange = (e, fileType) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;

    if (fileType === "pdf") {
      if (file.type !== "application/pdf") {
        mostrarAlerta(
          "El documento seleccionado debe estar en formato PDF.",
          "Formato Inválido",
        );
        return;
      }
      if (file.size > MAX_PDF_SIZE_MB * 1024 * 1024) {
        mostrarAlerta(
          `El archivo excede el tamaño máximo permitido de ${MAX_PDF_SIZE_MB} MB.`,
          "Archivo Excedido",
        );
        return;
      }
    }

    if (fileType === "image") {
      if (!file.type.startsWith("image/")) {
        mostrarAlerta(
          "La fotografía debe ser una imagen válida en formato JPG o PNG.",
          "Formato Inválido",
        );
        return;
      }
      if (file.size > MAX_IMG_SIZE_MB * 1024 * 1024) {
        mostrarAlerta(
          `La fotografía excede el límite permitido de ${MAX_IMG_SIZE_MB} MB.`,
          "Imagen Demasiado Pesada",
        );
        return;
      }
      setPhotoPreview(URL.createObjectURL(file));
    }

    setFormData((prev) => ({ ...prev, [name]: file }));
  };

  const abrirArchivoVisualizador = (e, file) => {
    e.preventDefault();
    e.stopPropagation();
    if (!file) return;
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, "_blank");
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
      console.error("Error al consultar:", error);
      setConsultaError("No se pudo conectar con el servidor de consulta.");
    } finally {
      setCargandoConsulta(false);
    }
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
        (formData.pais === "MÉXICO" &&
          (!formData.codigoPostal || formData.codigoPostal.length !== 5)) ||
        !formData.municipio ||
        !formData.calle ||
        !formData.estado
      ) {
        mostrarAlerta(
          "Por favor completa todos los campos obligatorios en tus datos personales y domicilio.",
          "Datos Incompletos o Inválidos",
        );
        return;
      }

      if (!validarEstructuraCurp(formData.curp.trim())) {
        mostrarAlerta(
          "La CURP ingresada no es válida. Revisa que tenga 18 caracteres exactos y una estructura real.",
          "CURP Incorrecta",
        );
        return;
      }

      if (
        formData.correoElectronico1 !== formData.correoElectronicoConfirmacion
      ) {
        mostrarAlerta(
          "Los dos correos electrónicos que ingresaste no coinciden.",
          "Correos Desiguales",
        );
        return;
      }

      if (
        !formData.tutorApellidoPaterno ||
        !formData.tutorNombres ||
        !formData.parentescoTutorId ||
        !formData.tutorTelefono
      ) {
        mostrarAlerta(
          "Los datos del padre, madre o tutor (Apellidos, Nombre, Parentesco y Teléfono) son obligatorios.",
          "Tutor Incompleto",
        );
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:4000/api/admission/verificar-duplicado?curp=${formData.curp.trim()}`,
        );
        const data = await res.json();
        if (data.existe) {
          mostrarAlerta(
            "La CURP proporcionada ya cuenta con una solicitud activa en el sistema.",
            "Registro Duplicado",
          );
          return;
        }
      } catch (error) {
        console.error("Error al verificar duplicado:", error);
      }
    }

    if (step === 2) {
      if (formData.semestresSeleccionados.length === 0) {
        mostrarAlerta(
          "Por favor selecciona al menos un semestre que vas a cursar en BELVER.",
          "Semestre Faltante",
        );
        return;
      }
      if (
        formData.tipoAdmision === "nuevo_ingreso" &&
        (!formData.cctEscuelaProcedencia || !formData.nombreEscuelaProcedencia)
      ) {
        mostrarAlerta(
          "Debes proporcionar la Clave CCT y el Nombre de tu escuela secundaria de procedencia.",
          "Antecedentes Incompletos",
        );
        return;
      }
      if (
        formData.tipoAdmision === "revalidacion" &&
        (!formData.subsistemaId ||
          (subsistemasDisponibles
            .find((s) => String(s.id) === String(formData.subsistemaId))
            ?.nombre.toUpperCase()
            .includes("OTRO") &&
            !formData.otroSistemaProcedencia) ||
          !formData.cctEscuelaProcedencia ||
          !formData.nombreEscuelaProcedencia)
      ) {
        mostrarAlerta(
          "Por favor completa el subsistema, especifica cuál si seleccionaste 'OTRO', la clave CCT y el nombre de la escuela de procedencia.",
          "Historial Académico Incompleto",
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
          "Es obligatorio adjuntar Fotografía, Acta de Nacimiento, CURP, INE y el Certificado de Estudios.",
          "Documentos Faltantes",
        );
        return;
      }
    }

    setStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsSubmitting(true);
    try {
      const dataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "discapacidades" || key === "semestresSeleccionados") {
          dataToSend.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== null) {
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
        const nombreCompleto =
          `${formData.apellidoPaterno} ${formData.apellidoMaterno || ""} ${formData.nombres}`.trim();
        setSubmittedData({
          folio: resultado.data.folio,
          aspirante: nombreCompleto,
        });
      } else {
        mostrarAlerta(
          resultado.mensaje || "Ocurrió un error al procesar tu solicitud.",
          "Error de Registro",
        );
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      mostrarAlerta(
        "No fue posible comunicarse con el servidor.",
        "Error de Conexión",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedData) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl p-6 text-center space-y-4">
          <div className="flex justify-between items-center px-4 border-b pb-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase">
              [ Logo Institucional ]
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">
              [ Logo BELVER ]
            </div>
          </div>

          <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mx-auto text-lg font-bold">
            ✓
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            ¡Solicitud Registrada Exitosamente!
          </h2>
          <p className="text-[11px] text-slate-500">
            Comprobante oficial de registro institucional - BELVER
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-3 space-y-2 text-left">
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase block">
                Nombre del Estudiante
              </span>
              <div className="text-sm font-extrabold text-slate-900">
                {submittedData.aspirante}
              </div>
            </div>
            <div className="border-t pt-2 text-center">
              <span className="text-[9px] text-slate-500 font-bold uppercase block">
                Folio de Seguimiento Oficial
              </span>
              <div className="text-xl font-mono font-extrabold text-blue-950 tracking-wider mt-0.5">
                {submittedData.folio}
              </div>
            </div>
          </div>

          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 text-left space-y-2 text-[11px] text-blue-950">
            <p>
              El comprobante y tu folio de seguimiento han sido enviados a tu
              correo electrónico registrado.
            </p>
            <p>
              En un plazo de 5 días hábiles, deberás ingresar nuevamente a la
              plataforma para revisar el estatus de la documentación que
              enviaste.
            </p>
            <p>
              En caso de que se presente alguna observación, deberás realizar
              las modificaciones correspondientes para que el documento pueda
              ser aceptado.
            </p>
          </div>

          <p className="text-[10px] text-slate-400 italic">
            Nota: Los registros no validados serán eliminados automáticamente al
            finalizar el periodo de inscripciones.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-md"
          >
            Finalizar y Volver al Inicio
          </button>
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
              Portal de Aspirantes
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Inscripción a BELVER
            </h1>
            <p className="text-xs text-slate-500">
              Bachillerato en Línea de Veracruz
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsConsultaOpen(true)}
            className="px-3.5 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-semibold transition shadow-sm"
          >
            Consultar Estatus de Folio
          </button>
        </div>

        {/* Stepper */}
        <div className="flex justify-between items-center relative py-2">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-0"></div>
          {[
            { s: 1, label: "Datos, Domicilio y Tutor" },
            { s: 2, label: "Historial y Semestre" },
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
              <span className="text-[10px] text-slate-500 font-semibold mt-1 hidden sm:block text-center">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          {/* PASO 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200 space-y-3">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1">
                  1. Datos Personales y de Contacto
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Apellido Paterno *
                    </label>
                    <input
                      name="apellidoPaterno"
                      type="text"
                      value={formData.apellidoPaterno}
                      onChange={handleChange}
                      placeholder="PRIMER APELLIDO"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase bg-white"
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
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Nombre(s) *
                    </label>
                    <input
                      name="nombres"
                      type="text"
                      value={formData.nombres}
                      onChange={handleChange}
                      placeholder="NOMBRE(S)"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      CURP (18 Caracteres) *
                    </label>
                    <input
                      name="curp"
                      type="text"
                      maxLength={18}
                      value={formData.curp}
                      onChange={handleChange}
                      placeholder="CURP OFICIAL"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase font-mono bg-white"
                    />
                    {formData.curp.length === 18 &&
                      validarEstructuraCurp(formData.curp) && (
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          ✓ CURP correcta y verificada.
                        </span>
                      )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Teléfono Celular *
                    </label>
                    <input
                      name="telefonoCelular"
                      type="tel"
                      maxLength={10}
                      value={formData.telefonoCelular}
                      onChange={handleChange}
                      placeholder="10 DÍGITOS"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
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
                      value={formData.sexo}
                      placeholder="Se llenará al ingresar la CURP"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 bg-slate-100 rounded-lg font-medium uppercase text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Correo Electrónico 1 *
                    </label>
                    <input
                      name="correoElectronico1"
                      type="email"
                      value={formData.correoElectronico1}
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg lowercase bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Confirmar Correo Electrónico *
                    </label>
                    <input
                      name="correoElectronicoConfirmacion"
                      type="email"
                      value={formData.correoElectronicoConfirmacion}
                      onChange={handleChange}
                      placeholder="Repita su correo electrónico"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg lowercase bg-white"
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
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg lowercase bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Teléfono Particular / Casa
                    </label>
                    <input
                      name="telefonoParticular"
                      type="tel"
                      maxLength={10}
                      value={formData.telefonoParticular}
                      onChange={handleChange}
                      placeholder="10 DÍGITOS"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Datos de Domicilio */}
              <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    2. Datos de Domicilio
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
                      País *
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

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      {formData.pais === "MÉXICO"
                        ? "Código Postal (5 dígitos) *"
                        : "Código Postal / ZIP *"}
                    </label>
                    <input
                      name="codigoPostal"
                      type="text"
                      maxLength={formData.pais === "MÉXICO" ? 5 : 12}
                      value={formData.codigoPostal}
                      onChange={handleCodigoPostalChange}
                      placeholder={
                        formData.pais === "MÉXICO"
                          ? "Ej. 91000"
                          : "Código Postal"
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none font-mono bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Estado / Provincia *
                    </label>
                    <input
                      name="estado"
                      type="text"
                      readOnly={formData.pais === "MÉXICO"}
                      required
                      value={formData.estado}
                      onChange={handleChange}
                      placeholder={
                        formData.pais === "MÉXICO"
                          ? "Automático por C.P."
                          : "Escriba el estado"
                      }
                      className={`w-full px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase ${formData.pais === "MÉXICO" ? "bg-slate-100 text-slate-600 font-medium" : "bg-white"}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Municipio / Alcaldía *
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

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Colonia / Asentamiento *
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

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Calle *
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

              {/* 3. Datos Adicionales */}
              <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block border-b pb-1">
                  3. Datos Adicionales
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Género con el que se identifica
                    </label>
                    <select
                      name="generoId"
                      value={formData.generoId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white uppercase"
                    >
                      <option value="">SELECCIONE GÉNERO...</option>
                      {generos.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Identidad Cultural
                    </label>
                    <select
                      name="identidadCulturalId"
                      value={formData.identidadCulturalId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white uppercase"
                    >
                      <option value="">SELECCIONE UNA OPCIÓN...</option>
                      {identidadesCulturales.map((ic) => (
                        <option key={ic.id} value={ic.id}>
                          {ic.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1 pt-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Capacidades especiales
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-slate-200">
                    {discapacidadesDisponibles.map((disc) => (
                      <label
                        key={disc.id}
                        className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          name="discapacidades"
                          value={disc.nombre}
                          checked={formData.discapacidades.includes(
                            disc.nombre,
                          )}
                          onChange={handleChange}
                          className="rounded border-slate-300 text-slate-900"
                        />
                        {disc.nombre}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Datos del Tutor */}
              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-3">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block border-b pb-1">
                  4. Datos del Padre, Madre o Tutor
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-amber-950">
                      Ap. Paterno *
                    </label>
                    <input
                      name="tutorApellidoPaterno"
                      type="text"
                      value={formData.tutorApellidoPaterno}
                      onChange={handleChange}
                      placeholder="PRIMER APELLIDO"
                      className="w-full px-2 py-1.5 text-xs border border-amber-300 rounded-lg uppercase bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-amber-950">
                      Ap. Materno
                    </label>
                    <input
                      name="tutorApellidoMaterno"
                      type="text"
                      value={formData.tutorApellidoMaterno}
                      onChange={handleChange}
                      placeholder="SEGUNDO APELLIDO"
                      className="w-full px-2 py-1.5 text-xs border border-amber-300 rounded-lg uppercase bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-amber-950">
                      Nombre(s) *
                    </label>
                    <input
                      name="tutorNombres"
                      type="text"
                      value={formData.tutorNombres}
                      onChange={handleChange}
                      placeholder="NOMBRE(S)"
                      className="w-full px-2 py-1.5 text-xs border border-amber-300 rounded-lg uppercase bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-amber-950">
                      Parentesco *
                    </label>
                    <select
                      name="parentescoTutorId"
                      value={formData.parentescoTutorId}
                      onChange={handleChange}
                      className="w-full px-2 py-1.5 text-xs border border-amber-300 rounded-lg uppercase bg-white"
                    >
                      <option value="">SELECCIONE PARENTESCO...</option>
                      {parentescosDisponibles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-amber-950">
                      Teléfono *
                    </label>
                    <input
                      name="tutorTelefono"
                      type="tel"
                      maxLength={10}
                      value={formData.tutorTelefono}
                      onChange={handleChange}
                      placeholder="10 Dígitos"
                      className="w-full px-2 py-1.5 text-xs border border-amber-300 rounded-lg bg-white"
                    />
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
                  Modalidad de Registro *
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
                      <strong>Opción 1:</strong> Viene de Secundaria (Regular)
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
                      <strong>Opción 2:</strong> Trae Historial (Equivalencia /
                      Irregular)
                      <br />
                      <span className="text-slate-500 text-[10px]">
                        Estudios previos
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {formData.tipoAdmision === "nuevo_ingreso" ? (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Subsistema de Procedencia
                      </label>
                      <input
                        type="text"
                        readOnly
                        value="SECUNDARIA"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-100 font-semibold uppercase text-slate-700"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Clave de la Escuela (CCT) *
                      </label>
                      <input
                        name="cctEscuelaProcedencia"
                        type="text"
                        maxLength={10}
                        value={formData.cctEscuelaProcedencia}
                        onChange={handleChange}
                        placeholder="EJ. 30DST0001X"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase font-mono bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Nombre de la Escuela *
                      </label>
                      <input
                        name="nombreEscuelaProcedencia"
                        type="text"
                        value={formData.nombreEscuelaProcedencia}
                        onChange={handleChange}
                        placeholder="EJ. ESC. SEC. TÉCNICA NO. 3"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase bg-white"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-amber-950">
                        Subsistema de Procedencia *
                      </label>
                      <select
                        name="subsistemaId"
                        value={formData.subsistemaId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white uppercase"
                      >
                        <option value="">SELECCIONE SUBSISTEMA...</option>
                        {subsistemasDisponibles.map((sub) => {
                          const nombreLimpio = sub.nombre.replace(
                            /^[A-Z]\.\s*/,
                            "",
                          );
                          return (
                            <option key={sub.id} value={sub.id}>
                              {nombreLimpio}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {subsistemasDisponibles
                      .find(
                        (s) => String(s.id) === String(formData.subsistemaId),
                      )
                      ?.nombre.toUpperCase()
                      .includes("OTRO") && (
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-amber-950">
                          Especifique el Subsistema u Otro *
                        </label>
                        <input
                          name="otroSistemaProcedencia"
                          type="text"
                          value={formData.otroSistemaProcedencia}
                          onChange={handleChange}
                          placeholder="ESCRIBA EL NOMBRE DEL SUBSISTEMA"
                          className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg uppercase bg-white"
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-amber-950">
                        Clave de la Escuela (CCT) *
                      </label>
                      <input
                        name="cctEscuelaProcedencia"
                        type="text"
                        maxLength={10}
                        value={formData.cctEscuelaProcedencia}
                        onChange={handleChange}
                        placeholder="EJ. 30EBH0100Y"
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg uppercase font-mono bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-amber-950">
                        Nombre del Plantel / Escuela *
                      </label>
                      <input
                        name="nombreEscuelaProcedencia"
                        type="text"
                        value={formData.nombreEscuelaProcedencia}
                        onChange={handleChange}
                        placeholder="EJ. CBTIS 13 / COBAEV 35"
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg uppercase bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-2">
                <label className="text-xs font-bold text-blue-950 uppercase tracking-wider block">
                  ¿Qué semestre(s) vas a cursar en BELVER? *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white p-3 rounded-lg border border-blue-200">
                  {semestresDisponibles.map((sem) => (
                    <label
                      key={sem.id}
                      className="flex items-center gap-2 text-xs text-blue-950 font-medium cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        name="semestresSeleccionados"
                        value={sem.id}
                        checked={formData.semestresSeleccionados.includes(
                          String(sem.id),
                        )}
                        onChange={handleChange}
                        className="rounded border-blue-300 text-blue-900"
                      />
                      {sem.nombre}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PASO 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  3. CARGA DE EXPEDIENTE DIGITAL
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
                    <span>Fotografía del Aspirante (JPG/PNG) *</span>
                    {formData.photo && (
                      <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-2">
                        ✓ Cargada
                        <button
                          type="button"
                          onClick={(e) =>
                            abrirArchivoVisualizador(e, formData.photo)
                          }
                          className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded hover:bg-blue-200 transition font-sans text-[10px]"
                        >
                          Ver
                        </button>
                      </span>
                    )}
                  </label>
                  <label className="w-full flex items-center px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white cursor-pointer hover:bg-slate-50 transition shadow-2xs">
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 font-semibold rounded-md border border-slate-300 mr-3 text-[11px]">
                      Elegir archivo
                    </span>
                    <span className="text-slate-500 truncate">
                      {formData.photo
                        ? formData.photo.name
                        : "No se ha seleccionado ningún archivo"}
                    </span>
                    <input
                      name="photo"
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => handleFileChange(e, "image")}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Formato infantil o credencial en fondo blanco o claro.
                  </span>
                </div>
              </div>

              {[
                {
                  key: "actaNacimiento",
                  label: "Acta de Nacimiento Certificada en Original (PDF)",
                },
                { key: "curpFile", label: "CURP Actualizada (PDF)" },
                {
                  key: "ineDocument",
                  label:
                    "INE (Si es menor de edad, colocar el INE del tutor) (PDF)",
                },
                {
                  key: "studyCert",
                  label:
                    formData.tipoAdmision === "nuevo_ingreso"
                      ? "Certificado de Secundaria (De Ambos Lados PDF)"
                      : "Certificado de Secundaria (De Ambos Lados PDF)",
                },
              ].map((doc) => (
                <div
                  key={doc.key}
                  className="flex flex-col gap-1.5 p-4 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <label className="text-xs font-semibold text-slate-800 flex justify-between items-center">
                    <span>{doc.label} *</span>
                    {formData[doc.key] && (
                      <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-2">
                        ✓ Cargado
                        <button
                          type="button"
                          onClick={(e) =>
                            abrirArchivoVisualizador(e, formData[doc.key])
                          }
                          className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded hover:bg-blue-200 transition font-sans text-[10px]"
                        >
                          Ver
                        </button>
                      </span>
                    )}
                  </label>
                  <label className="w-full flex items-center px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white cursor-pointer hover:bg-slate-50 transition shadow-2xs">
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 font-semibold rounded-md border border-slate-300 mr-3 text-[11px]">
                      Elegir archivo
                    </span>
                    <span className="text-slate-500 truncate">
                      {formData[doc.key]
                        ? formData[doc.key].name
                        : "No se ha seleccionado ningún archivo"}
                    </span>
                    <input
                      name={doc.key}
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, "pdf")}
                      className="hidden"
                    />
                  </label>
                </div>
              ))}

              {formData.tipoAdmision === "revalidacion" && (
                <div className="flex flex-col gap-1.5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <label className="text-xs font-semibold text-amber-950 flex justify-between items-center">
                    <span>
                      Constancia de Estudios / Certificado incompleto o
                      Equivalencia (PDF) *
                    </span>
                    {formData.constanciaEstudios && (
                      <span className="text-[10px] text-emerald-800 font-mono font-bold flex items-center gap-2">
                        ✓ Cargado
                        <button
                          type="button"
                          onClick={(e) =>
                            abrirArchivoVisualizador(
                              e,
                              formData.constanciaEstudios,
                            )
                          }
                          className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded hover:bg-amber-300 transition font-sans text-[10px]"
                        >
                          Ver
                        </button>
                      </span>
                    )}
                  </label>
                  <label className="w-full flex items-center px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white cursor-pointer hover:bg-slate-50 transition shadow-2xs">
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 font-semibold rounded-md border border-slate-300 mr-3 text-[11px]">
                      Elegir archivo
                    </span>
                    <span className="text-slate-500 truncate">
                      {formData.constanciaEstudios
                        ? formData.constanciaEstudios.name
                        : "No se ha seleccionado ningún archivo"}
                    </span>
                    <input
                      name="constanciaEstudios"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, "pdf")}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {/* PASO 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
                4. REVISIÓN GENERAL DE DATOS ANTES DE ENVIAR
              </h2>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Datos Personales y Contacto
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">
                        Aspirante
                      </span>
                      <span className="font-bold text-slate-900">{`${formData.apellidoPaterno} ${formData.apellidoMaterno || ""} ${formData.nombres}`}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">
                        CURP
                      </span>
                      <span className="font-mono font-semibold text-slate-800">
                        {formData.curp.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">
                        Correo Electrónico 1
                      </span>
                      <span className="text-slate-800">
                        {formData.correoElectronico1}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">
                        Teléfono Celular
                      </span>
                      <span className="text-slate-800">
                        {formData.telefonoCelular}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
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
                  <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Antecedentes Escolares
                  </span>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="font-semibold">Plantel / Escuela:</span>{" "}
                      {formData.nombreEscuelaProcedencia || "N/A"} (CCT:{" "}
                      {formData.cctEscuelaProcedencia || "N/A"})
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Expediente Digital Adjunto
                  </span>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap gap-2">
                    {formData.photo && (
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                        ✓ Fotografía
                      </span>
                    )}
                    {formData.actaNacimiento && (
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                        ✓ Acta de Nacimiento
                      </span>
                    )}
                    {formData.curpFile && (
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                        ✓ CURP PDF
                      </span>
                    )}
                    {formData.ineDocument && (
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                        ✓ INE / INE Tutor
                      </span>
                    )}
                    {formData.studyCert && (
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                        ✓ Certificado de Estudios
                      </span>
                    )}
                    {formData.constanciaEstudios && (
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                        ✓ Constancia / Historial
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de Navegación */}
          <div className="flex justify-between items-center pt-4 border-t">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
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
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition shadow-md"
              >
                {isSubmitting
                  ? "Enviando Solicitud..."
                  : "Registrar Solicitud Oficial"}
              </button>
            )}
          </div>
        </form>

        {/* MODAL DE CONSULTA ESTILIZADO CON VISUALIZADOR SEGURO */}
        {isConsultaOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 transform transition-all">
              <div className="px-6 py-4 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-xs font-bold text-blue-200">
                    🔍
                  </div>
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
                  type="button"
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
                        Folio de Seguimiento *
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
                        CURP del Aspirante *
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
                      "Consultar Estado y Expediente"
                    )}
                  </button>
                </form>

                {consultaError && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-center font-medium shadow-2xs">
                    {consultaError}
                  </div>
                )}

                {consultaResult && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-2xs animate-fadeIn">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                          Aspirante
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm uppercase">
                          {consultaResult.aspirante}
                        </h3>
                      </div>
                      <span
                        className={`px-3 py-1.5 font-extrabold rounded-xl text-[10px] tracking-wider uppercase shadow-2xs ${
                          consultaResult.estatus === "APROBADO"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-amber-100 text-amber-900 border border-amber-300"
                        }`}
                      >
                        {consultaResult.estatus || "EN REVISIÓN"}
                      </span>
                    </div>

                    {/* SECCIÓN DE MATRÍCULA Y CONTRASEÑA ÚNICA (SOLO SI ESTÁ APROBADO) */}
                    {consultaResult.estatus === "APROBADO" &&
                      consultaResult.matricula && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                          <h4 className="font-bold text-xs uppercase tracking-wide text-emerald-950 flex items-center gap-1.5">
                            🎉 ¡Expediente Aprobado con Éxito! Credenciales
                            Institucionales:
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-emerald-200 text-xs font-mono">
                            <div>
                              <span className="text-slate-400 font-bold text-[9px] uppercase block">
                                Matrícula Asignada:
                              </span>
                              <span className="text-emerald-900 font-extrabold text-sm">
                                {consultaResult.matricula}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-bold text-[9px] uppercase block">
                                Contraseña Única:
                              </span>
                              <span className="text-emerald-900 font-extrabold text-sm">
                                {consultaResult.password}
                              </span>
                            </div>
                          </div>
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

                    {/* BLOQUE DE OBSERVACIONES DE CONTROL ESCOLAR (SOLO SE MUESTRA SI NO ESTÁ APROBADO) */}
                    {consultaResult.estatus !== "APROBADO" &&
                      consultaResult.observaciones && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                          <h4 className="font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 text-amber-950">
                            ⚠️ Observaciones de Control Escolar:
                          </h4>
                          <p className="text-xs leading-relaxed text-amber-900 whitespace-pre-wrap">
                            {consultaResult.observaciones}
                          </p>
                        </div>
                      )}

                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                          Expediente de Documentos Oficiales
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
                                  <span className="text-[10px] text-slate-500 font-mono truncate max-w-[190px] sm:max-w-[220px]">
                                    Archivo: {doc.nombreArchivo}
                                  </span>

                                  {doc.estatusDoc === "APROBADO" ? (
                                    <span className="text-[10px] font-extrabold text-emerald-700 mt-1 uppercase">
                                      APROBADO
                                    </span>
                                  ) : doc.estatusDoc === "RECHAZADO" ? (
                                    <span className="text-[10px] font-extrabold text-red-600 mt-1 uppercase">
                                      RECHAZADO{" "}
                                      {doc.comentario
                                        ? `- Motivo: ${doc.comentario}`
                                        : ""}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-extrabold text-amber-600 mt-1 uppercase">
                                      PENDIENTE DE REVISIÓN
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const urlDoc = `http://localhost:4000/api/controlescolar/documentos/${doc.id}/ver`;
                                    window.open(urlDoc, "_blank");
                                  }}
                                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-[10px] font-bold transition shadow-2xs"
                                >
                                  👁️ Ver
                                </button>

                                {doc.estatusDoc === "RECHAZADO" && (
                                  <label className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition cursor-pointer shadow-2xs">
                                    ✏️ Modificar
                                    <input
                                      type="file"
                                      accept=".pdf,image/jpeg,image/png"
                                      className="hidden"
                                      onChange={(e) => {
                                        e.preventDefault();
                                        console.log(
                                          "Modificando documento:",
                                          doc.tipo,
                                          e.target.files[0],
                                        );
                                      }}
                                    />
                                  </label>
                                )}
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

        {/* Modal de Confirmación */}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                ?
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Confirmar Datos Correctos
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                ¿Estás seguro de que toda la información y los documentos
                adjuntos son correctos? Una vez enviada tu solicitud, no podrás
                modificarlos libremente antes de la revisión escolar.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="w-1/2 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Revisar Nuevamente
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-1/2 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition shadow-md"
                >
                  Sí, Enviar Solicitud
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Alertas */}
        {modalAlerta.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 text-center space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                {modalAlerta.titulo}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {modalAlerta.mensaje}
              </p>
              <button
                type="button"
                onClick={() =>
                  setModalAlerta({ isOpen: false, mensaje: "", titulo: "" })
                }
                className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-md"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
