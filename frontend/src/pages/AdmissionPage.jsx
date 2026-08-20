import React, { useState } from 'react';

// Catálogo geográfico en cascada
const LOCATION_DATA = {
  México: {
    Veracruz: {
      Xalapa: ['Centro', 'Ánimas', 'Progreso', 'Revolución', 'Coapexpan'],
      Veracruz: ['Centro Histórico', 'Reforma', 'Playa Linda', 'Costa Verde'],
      Coatepec: ['Centro', 'Los Carriles', 'Campo Viejo'],
      Córdoba: ['Centro', 'San José', 'Alameda'],
      Orizaba: ['Centro', 'Rincón Grande', 'Cerritos']
    },
    Puebla: {
      Puebla: ['Centro', 'Angelópolis', 'La Paz', 'El Carmen'],
      Tehuacán: ['Centro', 'Aquiles Serdán', 'Arcadia']
    },
    'Ciudad de México': {
      Cuauhtémoc: ['Centro', 'Roma Norte', 'Condesa', 'Juárez'],
      Coyoacán: ['Del Carmen', 'Villa Coyoacán', 'Copilco']
    }
  },
  'Estados Unidos': {
    California: {
      'Los Ángeles': ['Downtown', 'Hollywood', 'Koreatown'],
    },
    Texas: {
      Houston: ['Midtown', 'Downtown', 'Heights'],
    }
  }
};

export default function AdmissionPage() {
  const [step, setStep] = useState(1);
  const [submittedFolio, setSubmittedFolio] = useState(null);

  const [formData, setFormData] = useState({
    // Paso 1: Personales y Ubicación
    fullName: '',
    curp: '',
    email: '',
    phone: '',
    country: 'México',
    state: 'Veracruz',
    municipality: 'Xalapa',
    colony: 'Centro',

    // Paso 2: Modalidad y Antecedentes
    admissionType: 'nuevo_ingreso', // 'nuevo_ingreso' | 'equivalencia'
    originSchool: '',
    gradYear: '',
    average: '',
    previousHighSchool: '',

    // Paso 3: Documentos (Secundaria solo certificado; Equivalencia agrega parcial)
    studyCert: null,
    partialHighSchoolCert: null,
  });

  const [errors, setErrors] = useState({});

  // Manejador de texto y selects en cascada
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === 'country') {
        const firstState = Object.keys(LOCATION_DATA[value] || {})[0] || '';
        const firstMun = firstState ? Object.keys(LOCATION_DATA[value][firstState] || {})[0] || '' : '';
        const firstCol = (firstState && firstMun) ? LOCATION_DATA[value][firstState][firstMun][0] || '' : '';
        updated.state = firstState;
        updated.municipality = firstMun;
        updated.colony = firstCol;
      }

      if (name === 'state') {
        const firstMun = Object.keys(LOCATION_DATA[prev.country]?.[value] || {})[0] || '';
        const firstCol = firstMun ? LOCATION_DATA[prev.country][value][firstMun][0] || '' : '';
        updated.municipality = firstMun;
        updated.colony = firstCol;
      }

      if (name === 'municipality') {
        const firstCol = LOCATION_DATA[prev.country]?.[prev.state]?.[value]?.[0] || '';
        updated.colony = firstCol;
      }

      return updated;
    });
  };

  // Manejador de archivos PDF
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file && file.type !== 'application/pdf') {
      setErrors((prev) => ({ ...prev, [name]: 'El archivo debe estar en formato PDF.' }));
      return;
    }
    setErrors((prev) => ({ ...prev, [name]: null }));
    setFormData((prev) => ({ ...prev, [name]: file }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    const randomFolio = `BEL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedFolio(randomFolio);
  };

  // Pantalla de Confirmación con Folio
  if (submittedFolio) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-lg p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">¡Solicitud Registrada!</h2>
            <p className="text-sm text-slate-600 mt-2">
              Tu trámite fue enviado al Centro de Atención Estudiantil (CAE) para su validación documental.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Folio de Seguimiento</span>
            <div className="text-2xl font-mono font-extrabold text-blue-950 mt-1 tracking-wider">
              {submittedFolio}
            </div>
            <p className="text-xs text-slate-500 mt-1">Guarda este folio para cualquier aclaración de tu registro.</p>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Al ser aprobado tu expediente por el CAE, recibirás en tu correo (<strong>{formData.email}</strong>) tu matrícula institucional y contraseña de primer acceso.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition"
          >
            Aceptar y Finalizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
        
        {/* Encabezado */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">
            Solicitud de Admisión e Inscripción
          </h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Bachillerato en Línea de Veracruz (BELVER)
          </p>
        </div>

        {/* Indicador de Pasos */}
        <div className="flex justify-between items-center relative py-2">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-0"></div>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                step >= s ? 'bg-slate-900 text-white shadow' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {s}
            </div>
          ))}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          
          {/* PASO 1: DATOS PERSONALES Y GEOGRÁFICOS */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
                1. Datos Personales y Residencia
              </h2>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Nombre Completo</label>
                <input
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nombre(s) y Apellidos"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">CURP</label>
                  <input
                    name="curp"
                    type="text"
                    value={formData.curp}
                    onChange={handleChange}
                    placeholder="18 caracteres"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none uppercase"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Teléfono</label>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10 dígitos"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Correo Electrónico (Receptor de credenciales)</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="aspirante@correo.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none"
                />
              </div>

              {/* Cascada Geográfica */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">País</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-800 outline-none"
                  >
                    {Object.keys(LOCATION_DATA).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Estado</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-800 outline-none"
                  >
                    {Object.keys(LOCATION_DATA[formData.country] || {}).map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Municipio / Alcaldía</label>
                  <select
                    name="municipality"
                    value={formData.municipality}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-800 outline-none"
                  >
                    {Object.keys(LOCATION_DATA[formData.country]?.[formData.state] || {}).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Colonia</label>
                  <select
                    name="colony"
                    value={formData.colony}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-800 outline-none"
                  >
                    {(LOCATION_DATA[formData.country]?.[formData.state]?.[formData.municipality] || []).map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: MODALIDAD Y ANTECEDENTES */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
                2. Modalidad y Antecedentes Académicos
              </h2>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700">Tipo de Ingreso</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer text-xs font-medium transition ${formData.admissionType === 'nuevo_ingreso' ? 'border-slate-900 bg-slate-50' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="admissionType"
                      value="nuevo_ingreso"
                      checked={formData.admissionType === 'nuevo_ingreso'}
                      onChange={handleChange}
                    />
                    <span>Nuevo Ingreso <br/><span className="text-slate-500 text-[10px]">Egresado de Secundaria</span></span>
                  </label>

                  <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer text-xs font-medium transition ${formData.admissionType === 'equivalencia' ? 'border-slate-900 bg-slate-50' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="admissionType"
                      value="equivalencia"
                      checked={formData.admissionType === 'equivalencia'}
                      onChange={handleChange}
                    />
                    <span>Equivalencia / Portabilidad <br/><span className="text-slate-500 text-[10px]">Vengo de otra Preparatoria</span></span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Secundaria de Procedencia</label>
                <input
                  name="originSchool"
                  type="text"
                  value={formData.originSchool}
                  onChange={handleChange}
                  placeholder="Nombre oficial de la escuela secundaria"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Año de Egreso</label>
                  <input
                    name="gradYear"
                    type="number"
                    value={formData.gradYear}
                    onChange={handleChange}
                    placeholder="2024"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Promedio General</label>
                  <input
                    name="average"
                    type="number"
                    step="0.1"
                    value={formData.average}
                    onChange={handleChange}
                    placeholder="8.5"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Si viene de otra preparatoria */}
              {formData.admissionType === 'equivalencia' && (
                <div className="flex flex-col gap-1 bg-amber-50 border border-amber-200 p-3 rounded-xl">
                  <label className="text-xs font-semibold text-amber-900">Preparatoria o Bachillerato Anterior</label>
                  <input
                    name="previousHighSchool"
                    type="text"
                    value={formData.previousHighSchool}
                    onChange={handleChange}
                    placeholder="Ej. COBAEV, CBTIS, Telebachillerato..."
                    className="w-full px-3 py-2 text-sm border border-amber-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-800 outline-none mt-1"
                  />
                </div>
              )}
            </div>
          )}

          {/* PASO 3: EXPEDIENTE DIGITAL EXCLUSIVO */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
                3. Expediente Digital (Solo Formato PDF)
              </h2>

              {/* REQUISITO OBLIGATORIO PARA AMBOS */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">
                  Certificado de Secundaria (PDF) <span className="text-red-500">*</span>
                </label>
                <input
                  name="studyCert"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-300 rounded-lg p-1"
                />
                {errors.studyCert && <span className="text-xs text-red-500">{errors.studyCert}</span>}
              </div>

              {/* REQUISITO ADICIONAL EXCLUSIVO PARA EQUIVALENCIA */}
              {formData.admissionType === 'equivalencia' && (
                <div className="flex flex-col gap-1 bg-amber-50 border border-amber-200 p-3.5 rounded-xl space-y-1">
                  <label className="text-xs font-semibold text-amber-900">
                    Certificado Parcial de Bachillerato o Historial Académico Legalizado (PDF) <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-amber-700">
                    Requerido para que el CAE determine las materias y créditos a revalidar en BELVER.
                  </p>
                  <input
                    name="partialHighSchoolCert"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="w-full text-xs text-amber-900 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 border border-amber-300 rounded-lg p-1 bg-white"
                  />
                  {errors.partialHighSchoolCert && <span className="text-xs text-red-500">{errors.partialHighSchoolCert}</span>}
                </div>
              )}
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

            {step < 3 ? (
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
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition shadow-md"
              >
                Registrar Solicitud
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}