import React, { useState } from 'react';

const ESTADOS_MEXICO = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
  'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

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

// Simulación de base de datos de trámites en Control Escolar para consulta
const MOCK_TRAMITES = {
  'BEL-2026-1001': {
    folio: 'BEL-2026-1001',
    aspirante: 'María Fernanda Ruiz Morales',
    curp: 'RUAM050819MVERRL02',
    modalidad: 'Nuevo Ingreso',
    fechaRegistro: '2026-08-20',
    vigencia: '2026-09-04',
    estatus: 'APROBADO',
    observaciones: 'Expediente digital cotejado exitosamente contra el original.',
    matriculaAsignada: 'B26000001',
    documentos: [
      { nombre: 'Certificado de Secundaria', estatus: 'Validado' },
      { nombre: 'Fotografía Oficial', estatus: 'Validado' },
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
    observaciones: 'La constancia de estudios carece del desglose oficial de calificaciones.',
    matriculaAsignada: null,
    documentos: [
      { nombre: 'Constancia de Bachillerato', estatus: 'Rechazado - Incompleto' },
      { nombre: 'CURP', estatus: 'Validado' },
      { nombre: 'Acta de Nacimiento', estatus: 'Validado' },
      { nombre: 'Fotografía Oficial', estatus: 'Validado' },
    ]
  }
};

export default function AdmissionPage() {
  const [step, setStep] = useState(1);
  const [submittedData, setSubmittedData] = useState(null);
  const [isConsultaOpen, setIsConsultaOpen] = useState(false);

  // Estados para la consulta por folio
  const [folioInput, setFolioInput] = useState('');
  const [curpInput, setCurpInput] = useState('');
  const [consultaResult, setConsultaResult] = useState(null);
  const [consultaError, setConsultaError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    curp: '',
    email: '',
    phone: '',
    emergencyContactName: '',
    emergencyPhone: '',
    country: 'México',
    state: 'Veracruz',
    municipality: '',
    colony: '',
    street: '',
    postalCode: '',
    admissionType: 'nuevo_ingreso',
    secondaryType: 'Secundaria General',
    originSchool: '',
    gradYear: '',
    previousHighSchoolSystem: 'Colegio de Bachilleres del Estado de Veracruz (COBAEV)',
    previousHighSchoolName: '',
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

  const nextStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.curp || !formData.email || !formData.phone || !formData.municipality) {
        alert('Por favor completa todos los campos personales y de residencia.');
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
      if (!formData.photo) {
        alert('Es obligatorio adjuntar la fotografía del aspirante.');
        return;
      }
      if (formData.admissionType === 'nuevo_ingreso' && !formData.studyCert) {
        alert('Es obligatorio adjuntar el Certificado de Secundaria en PDF.');
        return;
      }
      if (formData.admissionType === 'revalidacion') {
        if (!formData.constanciaEstudios || !formData.curpFile || !formData.actaNacimiento) {
          alert('Para revalidación debes adjuntar: Constancia de Estudios, CURP y Acta de Nacimiento (PDFs).');
          return;
        }
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

    const tramite = MOCK_TRAMITES[folioInput.trim().toUpperCase()];

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
              Tu expediente digital ha sido enviado a <strong>Control Escolar</strong> para su revisión.
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

          <div className="text-left bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-950 space-y-1">
            <p><strong>Aspirante:</strong> {formData.fullName}</p>
            <p><strong>CURP:</strong> <span className="font-mono">{formData.curp.toUpperCase()}</span></p>
            <p><strong>Modalidad:</strong> {formData.admissionType === 'revalidacion' ? 'Revalidación / Equivalencia' : 'Nuevo Ingreso'}</p>
            <p><strong>Correo receptor:</strong> {formData.email}</p>
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
              Bachillerato en Línea de Veracruz
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
            { s: 1, label: 'Datos Personales' },
            { s: 2, label: 'Antecedentes' },
            { s: 3, label: 'Documentación' },
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
              <span className="text-[10px] text-slate-500 font-semibold mt-1 hidden sm:block">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          
          {/* PASO 1: DATOS PERSONALES */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
                1. Datos del Aspirante, Domicilio y Contacto
              </h2>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Nombre Completo</label>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* Domicilio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">País</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-slate-800"
                  >
                    <option value="México">México</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Estado</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-slate-800"
                  >
                    {ESTADOS_MEXICO.map((est) => (
                      <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Municipio o Alcaldía</label>
                  <input
                    name="municipality"
                    type="text"
                    required
                    value={formData.municipality}
                    onChange={handleChange}
                    placeholder="Ej. Xalapa, Veracruz, Córdoba..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Colonia / Localidad</label>
                  <input
                    name="colony"
                    type="text"
                    value={formData.colony}
                    onChange={handleChange}
                    placeholder="Ej. Centro, Las Ánimas..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: MODALIDAD Y ANTECEDENTES */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
                2. Modalidad de Ingreso y Antecedentes
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
                    <span>Nuevo Ingreso <br/><span className="text-slate-500 text-[10px]">Egresado de Secundaria (Inicia desde 1er semestre)</span></span>
                  </label>

                  <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer text-xs font-medium transition ${formData.admissionType === 'revalidacion' ? 'border-slate-900 bg-slate-50' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="admissionType"
                      value="revalidacion"
                      checked={formData.admissionType === 'revalidacion'}
                      onChange={handleChange}
                    />
                    <span>Revalidación / Equivalencia <br/><span className="text-slate-500 text-[10px]">Cuento con materias aprobadas de otro bachillerato</span></span>
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
                    <label className="text-xs font-semibold text-slate-700">Nombre de la Secundaria</label>
                    <input
                      name="originSchool"
                      type="text"
                      required
                      value={formData.originSchool}
                      onChange={handleChange}
                      placeholder="Ej. Secundaria Técnica No. 3"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800 bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-amber-50/70 border border-amber-200 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                    Información de la Preparatoria Anterior
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-amber-950">Subsistema de Procedencia</label>
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

                  <p className="text-[11px] text-amber-800 italic pt-1">
                    * El personal de Control Escolar cotejará y capturará tus materias acreditadas directamente desde tu constancia.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PASO 3: DOCUMENTACIÓN DIGITAL */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  3. Carga de Expediente y Fotografía
                </h2>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-semibold">
                  PDFs máx {MAX_PDF_SIZE_MB} MB • Foto máx {MAX_IMG_SIZE_MB} MB
                </span>
              </div>

              {/* Fotografía obligatoria */}
              <div className="flex flex-col gap-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-xs font-semibold text-slate-800 flex justify-between">
                  <span>Fotografía del Aspirante (Tipo credencial / Infantil) <span className="text-red-500">*</span></span>
                  {formData.photo && <span className="text-[10px] text-emerald-700 font-mono">✓ Imagen cargada</span>}
                </label>
                <input
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleFileChange(e, 'image')}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 border border-slate-300 rounded-lg p-1 bg-white"
                />
                {errors.photo && <span className="text-xs text-red-600 font-semibold">{errors.photo}</span>}
              </div>

              {formData.admissionType === 'nuevo_ingreso' ? (
                <div className="flex flex-col gap-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="text-xs font-semibold text-slate-800 flex justify-between">
                    <span>Certificado de Secundaria (PDF) <span className="text-red-500">*</span></span>
                    {formData.studyCert && <span className="text-[10px] text-emerald-700 font-mono">✓ {(formData.studyCert.size / 1024).toFixed(1)} KB</span>}
                  </label>
                  <input
                    name="studyCert"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'pdf')}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 border border-slate-300 rounded-lg p-1 bg-white"
                  />
                  {errors.studyCert && <span className="text-xs text-red-600 font-semibold">{errors.studyCert}</span>}
                </div>
              ) : (
                <div className="space-y-3 bg-amber-50/60 border border-amber-200 p-3.5 rounded-xl">
                  <span className="text-[11px] font-bold text-amber-900 block">
                    Documentos Oficiales para Revalidación (Únicamente PDF)
                  </span>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-amber-950 flex justify-between">
                      <span>Constancia de Estudios / Historial de Prepa con Calificaciones (PDF) <span className="text-red-500">*</span></span>
                      {formData.constanciaEstudios && <span className="text-[10px] text-emerald-800 font-mono">✓ Cargado</span>}
                    </label>
                    <input
                      name="constanciaEstudios"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, 'pdf')}
                      className="w-full text-xs text-amber-900 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-200 file:text-amber-900 hover:file:bg-amber-300 border border-amber-300 rounded-lg p-1 bg-white"
                    />
                    {errors.constanciaEstudios && <span className="text-xs text-red-600">{errors.constanciaEstudios}</span>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-amber-950 flex justify-between">
                      <span>CURP Actualizada (PDF) <span className="text-red-500">*</span></span>
                      {formData.curpFile && <span className="text-[10px] text-emerald-800 font-mono">✓ Cargado</span>}
                    </label>
                    <input
                      name="curpFile"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, 'pdf')}
                      className="w-full text-xs text-amber-900 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-200 file:text-amber-900 hover:file:bg-amber-300 border border-amber-300 rounded-lg p-1 bg-white"
                    />
                    {errors.curpFile && <span className="text-xs text-red-600">{errors.curpFile}</span>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-amber-950 flex justify-between">
                      <span>Acta de Nacimiento (PDF) <span className="text-red-500">*</span></span>
                      {formData.actaNacimiento && <span className="text-[10px] text-emerald-800 font-mono">✓ Cargado</span>}
                    </label>
                    <input
                      name="actaNacimiento"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, 'pdf')}
                      className="w-full text-xs text-amber-900 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-200 file:text-amber-900 hover:file:bg-amber-300 border border-amber-300 rounded-lg p-1 bg-white"
                    />
                    {errors.actaNacimiento && <span className="text-xs text-red-600">{errors.actaNacimiento}</span>}
                  </div>
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
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Modalidad</span>
                    <span className="font-semibold text-blue-900">
                      {formData.admissionType === 'revalidacion' ? 'Revalidación / Equivalencia' : 'Nuevo Ingreso'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Archivos Adjuntos</span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Fotografía del Aspirante: <strong>{formData.photo?.name}</strong></span>
                    </div>

                    {formData.admissionType === 'nuevo_ingreso' ? (
                      <div className="flex items-center gap-2 text-slate-700">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>Certificado de Secundaria: <strong>{formData.studyCert?.name}</strong></span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-slate-700">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>Constancia / Historial Prepa: <strong>{formData.constanciaEstudios?.name}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>CURP Oficial: <strong>{formData.curpFile?.name}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>Acta de Nacimiento: <strong>{formData.actaNacimiento?.name}</strong></span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                Al presionar "Registrar Solicitud Oficial", tu expediente digital será enviado a Control Escolar para su dictamen.
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs">Consulta Pública de Solicitud</span>
                  <span className="text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded font-mono">BELVER</span>
                </div>
                <button onClick={() => setIsConsultaOpen(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
              </div>

              <div className="p-6 space-y-5">
                <form onSubmit={handleConsultar} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">Folio Institucional</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. BEL-2026-1001"
                        value={folioInput}
                        onChange={(e) => setFolioInput(e.target.value)}
                        className="px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800 uppercase font-mono"
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
                        className="px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800 uppercase font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-sm"
                  >
                    Consultar Estatus de Cotejo
                  </button>
                </form>

                {consultaError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium text-center">
                    {consultaError}
                  </div>
                )}

                {consultaResult && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Aspirante</span>
                        <span className="font-bold text-slate-900">{consultaResult.aspirante}</span>
                      </div>

                      <div>
                        {consultaResult.estatus === 'APROBADO' && (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-full text-[11px]">
                            ✓ Dictamen Favorable
                          </span>
                        )}
                        {consultaResult.estatus === 'CON_OBSERVACIONES' && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded-full text-[11px]">
                            ⚠️ Observaciones Pendientes
                          </span>
                        )}
                      </div>
                    </div>

                    {consultaResult.matriculaAsignada && (
                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Matrícula Oficial Asignada</span>
                          <span className="font-mono text-base font-extrabold text-emerald-950">{consultaResult.matriculaAsignada}</span>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-semibold">Listo para inscripción</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Dictamen de Control Escolar</span>
                      <p className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-[11px]">
                        {consultaResult.observaciones}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Cotejo de Documentos</span>
                      <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
                        {consultaResult.documentos.map((doc, i) => (
                          <div key={i} className="flex justify-between items-center text-[11px] border-b border-slate-100 last:border-none py-1">
                            <span className="text-slate-700">{doc.nombre}</span>
                            <span className={`font-semibold ${doc.estatus.includes('Validado') ? 'text-emerald-700' : 'text-red-600'}`}>
                              {doc.estatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 text-right">
                      Vigencia del trámite hasta: <strong className="text-slate-600">{consultaResult.vigencia}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
                <button
                  type="button"
                  onClick={() => setIsConsultaOpen(false)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
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