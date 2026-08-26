import React, { useState } from 'react';

const TIPOS_SECUNDARIAS = [
  'Secundaria General', 'Secundaria Técnica', 'Telesecundaria',
  'Secundaria para Trabajadores', 'Secundaria Particular / Privada', 'Otra institución'
];

const SUBSISTEMAS_PREPA = [
  'Colegio de Bachilleres del Estado de Veracruz (COBAEV)',
  'Telebachillerato de Veracruz (TEBAEV)',
  'DGETI (CBTIS / CETIS)',
  'DGETAyCM (CBTA / CETMAR)',
  'Colegio de Educación Profesional Técnica (CONALEP)',
  'CECyTEV / CECyTE',
  'Dirección General de Bachillerato (DGB)',
  'Preparatoria Abierta',
  'Bachillerato General Particular / Privado',
  'Otro subsistema / Escuela Foránea'
];

const MAX_PDF_SIZE_MB = 5;
const MAX_IMG_SIZE_MB = 2;

// Simulación de base de datos de trámites en Control Escolar (editable localmente para pruebas)
const MOCK_TRAMITES_INICIALES = {
  'BEL-2026-1001': {
    folio: 'BEL-2026-1001',
    aspirante: 'María Fernanda Ruiz Morales',
    curp: 'RUAM050819MVERRL02',
    modalidad: 'Nuevo Ingreso',
    fechaRegistro: '2026-08-20',
    vigencia: '2026-09-04',
    estatus: 'APROBADO',
    observaciones: '¡Felicidades! Expediente digital cotejado y aprobado exitosamente.',
    matriculaAsignada: 'B26000001',
    passwordUnica: 'BV-982341-X', // Contraseña única no modificable
    documentos: [
      { id: 'foto', nombre: 'Fotografía Oficial', estatus: 'Validado', archivo: 'foto_aspirante.jpg' },
      { id: 'acta', nombre: 'Acta de Nacimiento', estatus: 'Validado', archivo: 'acta_nacimiento.pdf' },
      { id: 'curp', nombre: 'CURP Actualizada', estatus: 'Validado', archivo: 'curp_oficial.pdf' },
      { id: 'cert', nombre: 'Certificado de Secundaria', estatus: 'Validado', archivo: 'certificado_secundaria.pdf' },
    ]
  },
  'BEL-2026-1002': {
    folio: 'BEL-2026-1002',
    aspirante: 'Carlos Eduardo Domínguez',
    curp: 'DOEC040112HDFRNR09',
    modalidad: 'Revalidación / Equivalencia',
    fechaRegistro: '2026-08-22',
    vigencia: '2026-09-06',
    estatus: 'CON_OBSERVACIONES',
    observaciones: '⚠️ Hay correcciones pendientes: La constancia de estudios carece del sello oficial de la institución anterior.',
    matriculaAsignada: null,
    passwordUnica: null,
    documentos: [
      { id: 'foto', nombre: 'Fotografía Oficial', estatus: 'Validado', archivo: 'foto_carlos.jpg' },
      { id: 'acta', nombre: 'Acta de Nacimiento', estatus: 'Validado', archivo: 'acta.pdf' },
      { id: 'curp', nombre: 'CURP Actualizada', estatus: 'Validado', archivo: 'curp.pdf' },
      { id: 'constancia', nombre: 'Constancia de Estudios', estatus: 'Rechazado - Corregir', archivo: 'constancia_incompleta.pdf' },
    ]
  }
};

export default function AdmissionPage() {
  const [step, setStep] = useState(1);
  const [submittedData, setSubmittedData] = useState(null);
  const [isConsultaOpen, setIsConsultaOpen] = useState(false);

  // Base de trámites interactiva en memoria
  const [tramitesDb, setTramitesDb] = useState(MOCK_TRAMITES_INICIALES);

  // Estados para la consulta por folio
  const [folioInput, setFolioInput] = useState('');
  const [curpInput, setCurpInput] = useState('');
  const [consultaResult, setConsultaResult] = useState(null);
  const [consultaError, setConsultaError] = useState('');

  // Estados para el catálogo de México por Código Postal
  const [coloniasDisponibles, setColoniasDisponibles] = useState([]);
  const [cargandoCp, setCargandoCp] = useState(false);

  const [formData, setFormData] = useState({
    // Datos Personales
    fullName: '',
    curp: '',
    email: '',
    phone: '',
    
    // Inclusión y Diversidad
    genderIdentity: '',
    lgbtqMember: '',
    hasDisability: 'No',
    disabilityType: '',
    educationalSupport: 'No',

    // Perfil Laboral y Tecnológico
    employmentStatus: 'No trabaja',
    hasComputer: 'Sí',
    hasInternet: 'Sí',

    // Domicilio (API de CP)
    country: 'México',
    postalCode: '',
    state: '',
    municipality: '',
    colony: '',
    street: '',
    externalNumber: '',

    // Tutor y Emergencia
    tutorName: '',
    tutorPhone: '',
    tutorRelation: 'Padre / Madre',
    emergencyContactName: '',
    emergencyPhone: '',

    // Antecedentes académicos
    admissionType: 'nuevo_ingreso',
    secondaryType: 'Secundaria General',
    originSchool: '',
    gradYear: '',
    previousHighSchoolSystem: 'Colegio de Bachilleres del Estado de Veracruz (COBAEV)',
    previousHighSchoolName: '',

    // Archivos (Sin cuota de recuperación)
    photo: null,
    studyCert: null,
    constanciaEstudios: null,
    curpFile: null,
    actaNacimiento: null,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCodigoPostalChange = async (e) => {
    const cp = e.target.value.replace(/\D/g, '').slice(0, 5);
    setFormData((prev) => ({ ...prev, postalCode: cp }));

    if (cp.length === 5) {
      setCargandoCp(true);
      try {
        const response = await fetch(`https://cp.terio.dev/v1/codigos-postales/${cp}`);
        const data = await response.json();

        if (response.ok && data.datos && data.datos.length > 0) {
          const primerRegistro = data.datos[0];
          const listaAsentamientos = data.datos.map((item) => item.asentamiento);

          setFormData((prev) => ({
            ...prev,
            state: primerRegistro.estado,
            municipality: primerRegistro.municipio,
            colony: listaAsentamientos[0] || '',
          }));
          setColoniasDisponibles(listaAsentamientos);
        } else {
          setColoniasDisponibles([]);
          alert('Código postal no encontrado en el catálogo oficial.');
        }
      } catch (error) {
        console.error('Error al consultar el servicio de códigos postales:', error);
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

    if (fileType === 'pdf') {
      if (file.type !== 'application/pdf') {
        setErrors((prev) => ({ ...prev, [name]: 'El archivo debe ser un documento PDF.' }));
        return;
      }
      if (file.size > MAX_PDF_SIZE_MB * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, [name]: `El PDF excede los ${MAX_PDF_SIZE_MB} MB permitidos.` }));
        return;
      }
    }

    if (fileType === 'image') {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, [name]: 'La fotografía debe ser formato JPG o PNG.' }));
        return;
      }
      if (file.size > MAX_IMG_SIZE_MB * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, [name]: `La fotografía no debe superar ${MAX_IMG_SIZE_MB} MB.` }));
        return;
      }
    }

    setErrors((prev) => ({ ...prev, [name]: null }));
    setFormData((prev) => ({ ...prev, [name]: file }));
  };

  // Función para reemplazar documento rechazado
  const handleReemplazarDocumento = (docId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const folioKey = consultaResult.folio;
    const tramiteActual = tramitesDb[folioKey];

    const documentosActualizados = tramiteActual.documentos.map((doc) => {
      if (doc.id === docId) {
        return {
          ...doc,
          archivo: file.name,
          estatus: 'En revisión (Corregido)',
        };
      }
      return doc;
    });

    const tramiteModificado = {
      ...tramiteActual,
      estatus: 'EN_REVISION',
      observaciones: '🔄 Documento corregido y enviado nuevamente. Esperando validación de Control Escolar.',
      documentos: documentosActualizados,
    };

    setTramitesDb((prev) => ({ ...prev, [folioKey]: tramiteModificado }));
    setConsultaResult(tramiteModificado);
    alert(`Se ha subido exitosamente el archivo "${file.name}". El estatus ha pasado a revisión.`);
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.curp || !formData.email || !formData.phone || !formData.postalCode || !formData.municipality || !formData.street) {
        alert('Por favor completa todos los campos obligatorios de datos personales y domicilio.');
        return;
      }
      if (formData.curp.trim().length !== 18) {
        alert('La CURP debe contar exactamente con 18 caracteres.');
        return;
      }
    }

    if (step === 2) {
      if (formData.admissionType === 'nuevo_ingreso' && !formData.originSchool) {
        alert('Ingresa el nombre de la secundaria de procedencia.');
        return;
      }
      if (formData.admissionType === 'revalidacion' && !formData.previousHighSchoolName) {
        alert('Ingresa el nombre del plantel de bachillerato anterior.');
        return;
      }
    }

    if (step === 3) {
      if (!formData.photo || !formData.actaNacimiento || !formData.curpFile) {
        alert('Es obligatorio adjuntar: Fotografía, Acta de Nacimiento y CURP.');
        return;
      }
      if (formData.admissionType === 'nuevo_ingreso' && !formData.studyCert) {
        alert('Es obligatorio adjuntar el Certificado de Secundaria en PDF.');
        return;
      }
      if (formData.admissionType === 'revalidacion' && !formData.constanciaEstudios) {
        alert('Para revalidación debes adjuntar la Constancia de Estudios con calificaciones.');
        return;
      }
    }

    setStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    const randomFolio = `BEL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fechaVigencia = new Date();
    fechaVigencia.setDate(fechaVigencia.getDate() + 15);

    setSubmittedData({
      folio: randomFolio,
      vigencia: fechaVigencia.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    });
  };

  const handleConsultar = (e) => {
    e.preventDefault();
    setConsultaError('');
    setConsultaResult(null);

    const claveFolio = folioInput.trim().toUpperCase();
    const tramite = tramitesDb[claveFolio];

    if (!tramite) {
      setConsultaError('No se encontró ninguna solicitud con el folio proporcionado.');
      return;
    }

    if (curpInput.trim().toUpperCase() && tramite.curp !== curpInput.trim().toUpperCase()) {
      setConsultaError('La CURP no coincide con el titular del folio consultado.');
      return;
    }

    setConsultaResult(tramite);
  };

  if (submittedData) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">¡Solicitud de Admisión Registrada!</h2>
            <p className="text-xs text-slate-600 mt-2">
              Tu expediente digital ha sido enviado a <strong>Control Escolar</strong> bajo el programa de Inscripción Gratuita.
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
              ⚠️ Vigencia del folio hasta: <strong>{submittedData.vigencia}</strong>
            </div>
          </div>

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
        
        {/* Encabezado y Botón de Consulta Pública */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
              Portal Externo de Admisión
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
            className="px-3.5 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-semibold transition self-start sm:self-auto shadow-sm flex items-center gap-1.5"
          >
            🔍 Consultar Estatus de Folio
          </button>
        </div>

        {/* Stepper */}
        <div className="flex justify-between items-center relative py-2">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-0"></div>
          {[
            { s: 1, label: 'Datos, Domicilio e Inclusión' },
            { s: 2, label: 'Antecedentes Escolares' },
            { s: 3, label: 'Documentación Oficial' },
            { s: 4, label: 'Revisión y Envío' }
          ].map((item) => (
            <div key={item.s} className="relative z-10 flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  step >= item.s ? 'bg-slate-900 text-white shadow' : 'bg-slate-200 text-slate-500'
                }`}
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
          
          {/* PASO 1: DATOS PERSONALES, DOMICILIO, TUTOR, INCLUSIÓN Y PERFIL TECNOLÓGICO */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
                1. Datos Personales, Inclusión, Domicilio, Tutor y Perfil En Línea
              </h2>

              {/* Datos Personales */}
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Nombre Completo del Aspirante</label>
                  <input
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nombre(s) y Apellidos tal como aparecen en el acta"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">CURP (18 caracteres)</label>
                    <input
                      name="curp"
                      type="text"
                      required
                      maxLength={18}
                      value={formData.curp}
                      onChange={handleChange}
                      placeholder="Clave Única de Registro"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800 uppercase font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Teléfono Móvil</label>
                    <input
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10 dígitos"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Correo Electrónico Oficial</label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="aspirante@ejemplo.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>
              </div>

              {/* Identidad e Inclusión */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                  Identidad, Diversidad e Inclusión
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Género con el que se identifica</label>
                    <select
                      name="genderIdentity"
                      value={formData.genderIdentity}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-slate-800"
                    >
                      <option value="">Selecciona una opción...</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="No binarie">No binarie</option>
                      <option value="Otro / Prefiero no decirlo">Otro / Prefiero no decirlo</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">¿Pertenece a la comunidad LGBTIQ+?</label>
                    <select
                      name="lgbtqMember"
                      value={formData.lgbtqMember}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-slate-800"
                    >
                      <option value="">Selecciona una opción...</option>
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                      <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">¿Presenta alguna discapacidad?</label>
                    <select
                      name="hasDisability"
                      value={formData.hasDisability}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-slate-800"
                    >
                      <option value="No">No</option>
                      <option value="Motriz">Motriz</option>
                      <option value="Visual">Visual</option>
                      <option value="Auditiva">Auditiva</option>
                      <option value="Intelectual">Intelectual</option>
                      <option value="Otra">Otra</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">¿Requiere apoyo educativo especial?</label>
                    <select
                      name="educationalSupport"
                      value={formData.educationalSupport}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-slate-800"
                    >
                      <option value="No">No</option>
                      <option value="Sí">Sí</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Perfil Tecnológico y Laboral */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                  Perfil Laboral y Tecnológico (Modalidad En Línea)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Situación Laboral</label>
                    <select
                      name="employmentStatus"
                      value={formData.employmentStatus}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-slate-800"
                    >
                      <option value="No trabaja">No trabaja / Estudiante</option>
                      <option value="Medio tiempo">Trabaja medio tiempo</option>
                      <option value="Tiempo completo">Trabaja tiempo completo</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">¿Cuenta con computadora?</label>
                    <select
                      name="hasComputer"
                      value={formData.hasComputer}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-slate-800"
                    >
                      <option value="Sí">Sí (Personal / Familiar)</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">¿Tiene Internet en casa?</label>
                    <select
                      name="hasInternet"
                      value={formData.hasInternet}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-slate-800"
                    >
                      <option value="Sí">Sí</option>
                      <option value="No">No (Acceso externo/datos)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Domicilio (API de C.P.) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    Domicilio Exacto (Catálogo SEPOMEX México)
                  </span>
                  {cargandoCp && <span className="text-[10px] text-blue-600 animate-pulse font-semibold">Buscando código postal...</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Código Postal (5 dígitos)</label>
                    <input
                      name="postalCode"
                      type="text"
                      maxLength={5}
                      value={formData.postalCode}
                      onChange={handleCodigoPostalChange}
                      placeholder="Ej. 91000"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800 font-mono bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Estado</label>
                    <input
                      name="state"
                      type="text"
                      readOnly
                      value={formData.state}
                      placeholder="Automático por C.P."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-100 text-slate-600 font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Municipio / Alcaldía</label>
                    <input
                      name="municipality"
                      type="text"
                      readOnly
                      required
                      value={formData.municipality}
                      placeholder="Automático por C.P."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-100 text-slate-600 font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Colonia / Asentamiento</label>
                    {coloniasDisponibles.length > 0 ? (
                      <select
                        name="colony"
                        value={formData.colony}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-slate-800"
                      >
                        {coloniasDisponibles.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name="colony"
                        type="text"
                        required
                        value={formData.colony}
                        onChange={handleChange}
                        placeholder="Escribe tu colonia..."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Calle</label>
                    <input
                      name="street"
                      type="text"
                      required
                      value={formData.street}
                      onChange={handleChange}
                      placeholder="Nombre de la calle"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Número Exterior / Interior</label>
                    <input
                      name="externalNumber"
                      type="text"
                      value={formData.externalNumber}
                      onChange={handleChange}
                      placeholder="Ej. S/N, Int. 4"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Datos del Tutor y Emergencia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-3">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                    Datos del Tutor (Menores de edad)
                  </span>
                  <div className="flex flex-col gap-2">
                    <input
                      name="tutorName"
                      type="text"
                      value={formData.tutorName}
                      onChange={handleChange}
                      placeholder="Nombre completo del tutor"
                      className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white outline-none"
                    />
                    <input
                      name="tutorPhone"
                      type="tel"
                      value={formData.tutorPhone}
                      onChange={handleChange}
                      placeholder="Teléfono del tutor (10 dígitos)"
                      className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white outline-none"
                    />
                  </div>
                </div>

                <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-3">
                  <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                    Contacto de Emergencia
                  </span>
                  <div className="flex flex-col gap-2">
                    <input
                      name="emergencyContactName"
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      placeholder="Nombre del contacto"
                      className="w-full px-3 py-2 text-xs border border-blue-300 rounded-lg bg-white outline-none"
                    />
                    <input
                      name="emergencyPhone"
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      placeholder="Teléfono de emergencia (10 dígitos)"
                      className="w-full px-3 py-2 text-xs border border-blue-300 rounded-lg bg-white outline-none"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* PASO 2: MODALIDAD Y ANTECEDENTES */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
                2. Modalidad de Ingreso y Antecedentes Escolares
              </h2>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700">Modalidad de Registro</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer text-xs font-medium transition ${formData.admissionType === 'nuevo_ingreso' ? 'border-slate-900 bg-slate-50' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="admissionType"
                      value="nuevo_ingreso"
                      checked={formData.admissionType === 'nuevo_ingreso'}
                      onChange={handleChange}
                    />
                    <span>Nuevo Ingreso <br/><span className="text-slate-500 text-[10px]">Egresado de Secundaria (1er semestre)</span></span>
                  </label>

                  <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer text-xs font-medium transition ${formData.admissionType === 'revalidacion' ? 'border-slate-900 bg-slate-50' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="admissionType"
                      value="revalidacion"
                      checked={formData.admissionType === 'revalidacion'}
                      onChange={handleChange}
                    />
                    <span>Revalidación / Equivalencia <br/><span className="text-slate-500 text-[10px]">Materias aprobadas de otro bachillerato</span></span>
                  </label>
                </div>
              </div>

              {formData.admissionType === 'nuevo_ingreso' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Tipo de Secundaria</label>
                    <select
                      name="secondaryType"
                      value={formData.secondaryType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-slate-800"
                    >
                      {TIPOS_SECUNDARIAS.map((ts) => (
                        <option key={ts} value={ts}>{ts}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Nombre de la Secundaria <span className="text-[10px] text-blue-800 font-normal">({formData.municipality ? `Zona: ${formData.municipality}` : 'General'})</span>
                    </label>
                    <input
                      name="originSchool"
                      type="text"
                      required
                      value={formData.originSchool}
                      onChange={handleChange}
                      placeholder="Ej. Esc. Sec. Técnica No. 3"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800 bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-amber-50/70 border border-amber-200 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                    Información de la Preparatoria Anterior ({formData.municipality ? formData.municipality : 'Foránea'})
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-amber-950">Subsistema</label>
                      <select
                        name="previousHighSchoolSystem"
                        value={formData.previousHighSchoolSystem}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-amber-800"
                      >
                        {SUBSISTEMAS_PREPA.map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-amber-950">Plantel / Escuela de Origen</label>
                      <input
                        name="previousHighSchoolName"
                        type="text"
                        required
                        value={formData.previousHighSchoolName}
                        onChange={handleChange}
                        placeholder="Ej. CBTIS 13 / COBAEV 35"
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-amber-800"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PASO 3: DOCUMENTACIÓN DIGITAL OFICIAL (Sin Comprobante de Pago) */}
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

              {/* Fotografía obligatoria */}
              <div className="flex flex-col gap-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-xs font-semibold text-slate-800 flex justify-between">
                  <span>Fotografía del Aspirante (Tipo credencial / Infantil - JPG/PNG) <span className="text-red-500">*</span></span>
                  {formData.photo && <span className="text-[10px] text-emerald-700 font-mono">✓ Cargada</span>}
                </label>
                <input
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleFileChange(e, 'image')}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 border border-slate-300 rounded-lg p-1 bg-white"
                />
              </div>

              {/* Acta de Nacimiento PDF */}
              <div className="flex flex-col gap-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-xs font-semibold text-slate-800 flex justify-between">
                  <span>Acta de Nacimiento Certificada en Original (PDF) <span className="text-red-500">*</span></span>
                  {formData.actaNacimiento && <span className="text-[10px] text-emerald-700 font-mono">✓ Cargado</span>}
                </label>
                <input
                  name="actaNacimiento"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, 'pdf')}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 border border-slate-300 rounded-lg p-1 bg-white"
                />
              </div>

              {/* CURP PDF */}
              <div className="flex flex-col gap-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-xs font-semibold text-slate-800 flex justify-between">
                  <span>CURP Actualizada (Descargada de gob.mx - PDF) <span className="text-red-500">*</span></span>
                  {formData.curpFile && <span className="text-[10px] text-emerald-700 font-mono">✓ Cargado</span>}
                </label>
                <input
                  name="curpFile"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, 'pdf')}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 border border-slate-300 rounded-lg p-1 bg-white"
                />
              </div>

              {/* Certificado o Constancia según modalidad */}
              {formData.admissionType === 'nuevo_ingreso' ? (
                <div className="flex flex-col gap-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="text-xs font-semibold text-slate-800 flex justify-between">
                    <span>Certificado de Secundaria Original y Completo (PDF) <span className="text-red-500">*</span></span>
                    {formData.studyCert && <span className="text-[10px] text-emerald-700 font-mono">✓ Cargado</span>}
                  </label>
                  <input
                    name="studyCert"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'pdf')}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 border border-slate-300 rounded-lg p-1 bg-white"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <label className="text-xs font-semibold text-amber-950 flex justify-between">
                    <span>Constancia de Estudios / Historial con Calificaciones (PDF) <span className="text-red-500">*</span></span>
                    {formData.constanciaEstudios && <span className="text-[10px] text-emerald-800 font-mono">✓ Cargado</span>}
                  </label>
                  <input
                    name="constanciaEstudios"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'pdf')}
                    className="w-full text-xs text-amber-900 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-200 file:text-amber-900 hover:file:bg-amber-300 border border-amber-300 rounded-lg p-1 bg-white"
                  />
                </div>
              )}
            </div>
          )}

          {/* PASO 4: CONFIRMACIÓN Y REVISIÓN */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
                4. Confirmación de Solicitud de Admisión
              </h2>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Aspirante</span>
                    <span className="font-bold text-slate-900">{formData.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">CURP</span>
                    <span className="font-mono font-semibold text-slate-800">{formData.curp.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Contacto</span>
                    <span className="text-slate-800">{formData.email} • {formData.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Domicilio</span>
                    <span className="text-slate-800">{formData.municipality}, {formData.state} (C.P. {formData.postalCode})</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Archivos Adjuntos en PDF / Imagen</span>
                  <div className="space-y-1 text-slate-700">
                    <div>✓ Fotografía: <strong>{formData.photo?.name}</strong></div>
                    <div>✓ Acta de Nacimiento: <strong>{formData.actaNacimiento?.name}</strong></div>
                    <div>✓ CURP Oficial: <strong>{formData.curpFile?.name}</strong></div>
                    {formData.admissionType === 'nuevo_ingreso' ? (
                      <div>✓ Certificado de Secundaria: <strong>{formData.studyCert?.name}</strong></div>
                    ) : (
                      <div>✓ Constancia de Estudios: <strong>{formData.constanciaEstudios?.name}</strong></div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                Al presionar "Registrar Solicitud Oficial", tu expediente digital será enviado a Control Escolar para su dictamen bajo el esquema de gratuidad.
              </p>
            </div>
          )}

          {/* Navegación */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Anterior
              </button>
            ) : <div />}

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
                className="px-6 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition shadow-md"
              >
                Registrar Solicitud Oficial
              </button>
            )}
          </div>

        </form>

        {/* MODAL DE CONSULTA DE ESTATUS POR FOLIO */}
        {isConsultaOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
              
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs">Consulta Pública de Solicitud y Estatus</span>
                  <span className="text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded font-mono">BELVER</span>
                </div>
                <button onClick={() => setIsConsultaOpen(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
              </div>

              <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
                <form onSubmit={handleConsultar} className="space-y-3 bg-slate-50 p-3 rounded-xl border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">Folio Institucional</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. BEL-2026-1001"
                        value={folioInput}
                        onChange={(e) => setFolioInput(e.target.value)}
                        className="px-3 py-2 border rounded-lg uppercase font-mono bg-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">CURP del Aspirante</label>
                      <input
                        type="text"
                        required
                        maxLength={18}
                        placeholder="18 caracteres"
                        value={curpInput}
                        onChange={(e) => setCurpInput(e.target.value)}
                        className="px-3 py-2 border rounded-lg uppercase font-mono bg-white"
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm">
                    Consultar Estatus y Expediente
                  </button>
                </form>

                {consultaError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center font-medium">
                    {consultaError}
                  </div>
                )}

                {consultaResult && (
                  <div className="space-y-4">
                    
                    {/* Tarjeta de Estatus */}
                    <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-50">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Aspirante</span>
                        <span className="font-bold text-slate-900">{consultaResult.aspirante}</span>
                      </div>
                      <div>
                        {consultaResult.estatus === 'APROBADO' && (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border font-bold rounded-full">✓ Aprobado</span>
                        )}
                        {consultaResult.estatus === 'CON_OBSERVACIONES' && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-800 border font-bold rounded-full">⚠️ Correcciones Requeridas</span>
                        )}
                        {consultaResult.estatus === 'EN_REVISION' && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 border font-bold rounded-full">🔄 En Revisión</span>
                        )}
                      </div>
                    </div>

                    {/* Notificación con Observaciones */}
                    <div className={`p-3 rounded-xl border text-xs font-medium ${consultaResult.estatus === 'APROBADO' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                      <span className="font-bold uppercase block mb-1">📢 Notificación del Sistema:</span>
                      <p>{consultaResult.observaciones}</p>
                    </div>

                    {/* Credenciales si ya está Aprobado (Contraseña única inalterable) */}
                    {consultaResult.estatus === 'APROBADO' && consultaResult.matriculaAsignada && (
                      <div className="bg-emerald-950 text-emerald-100 p-4 rounded-xl space-y-2 border border-emerald-800 shadow-md">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">Credenciales Oficiales de Acceso</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-emerald-300 block text-[10px]">Matrícula Oficial:</span>
                            <span className="font-mono font-bold text-sm text-white">{consultaResult.matriculaAsignada}</span>
                          </div>
                          <div>
                            <span className="text-emerald-300 block text-[10px]">Contraseña Única:</span>
                            <span className="font-mono font-bold text-sm text-white">{consultaResult.passwordUnica}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-emerald-300/80 pt-1 border-t border-emerald-900">
                          🔒 Esta contraseña es única del sistema y no se puede modificar. Úsala para ingresar al portal de alumnos.
                        </p>
                      </div>
                    )}

                    {/* Gestión de Archivos (Descargar y Subir si no está aprobado) */}
                    <div className="space-y-2 bg-white border p-3 rounded-xl">
                      <span className="font-bold text-slate-800 uppercase text-[10px] block">Expediente de Documentos</span>
                      <div className="space-y-2">
                        {consultaResult.documentos.map((doc) => {
                          const estaAprobado = consultaResult.estatus === 'APROBADO';
                          return (
                            <div key={doc.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2 bg-slate-50 border rounded-lg">
                              <div>
                                <span className="font-semibold text-slate-800">{doc.nombre}</span>
                                <span className="block text-[10px] text-slate-500 font-mono">Archivo: {doc.archivo} ({doc.estatus})</span>
                              </div>

                              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                {/* Botón Descargar */}
                                <button
                                  type="button"
                                  onClick={() => alert(`Descargando archivo: ${doc.archivo}`)}
                                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] font-semibold"
                                >
                                  📥 Descargar
                                </button>

                                {/* Botón Reemplazar si NO está aprobado */}
                                {!estaAprobado ? (
                                  <label className="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded text-[11px] font-semibold cursor-pointer shadow-sm">
                                    🔄 Reemplazar
                                    <input
                                      type="file"
                                      accept=".pdf,image/*"
                                      onChange={(e) => handleReemplazarDocumento(doc.id, e)}
                                      className="hidden"
                                    />
                                  </label>
                                ) : (
                                  <span className="text-[10px] text-emerald-600 font-semibold px-2">Bloqueado (Aprobado)</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 border-t text-right">
                <button type="button" onClick={() => setIsConsultaOpen(false)} className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg">
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