import React, { useState } from 'react';
import { MateriasPDF } from '../utils/MateriasPDF';

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

export default function AdmissionPage() {
  const [step, setStep] = useState(1);
  const [submittedFolio, setSubmittedFolio] = useState(null);

  const [formData, setFormData] = useState({
    // Paso 1: Personales
    fullName: '',
    curp: '',
    email: '',
    phone: '',
    country: 'México',
    state: 'Veracruz',
    municipality: '',
    colony: '',

    // Paso 2: Antecedentes
    admissionType: 'nuevo_ingreso', // 'nuevo_ingreso' | 'revalidacion'
    secondaryType: 'Secundaria General',
    originSchool: '',
    gradYear: '',
    previousHighSchoolSystem: 'Colegio de Bachilleres del Estado de Veracruz (COBAEV)',
    previousHighSchoolName: '',

    // Paso 3: Documentos
    photo: null, // Ambos
    studyCert: null, // Solo Nuevo Ingreso
    constanciaEstudios: null, // Solo Revalidación
    curpFile: null, // Solo Revalidación
    actaNacimiento: null, // Solo Revalidación
  });

  // Lista dinámica de materias acreditadas para Revalidación
  const [materiasAcreditadas, setMateriasAcreditadas] = useState([
    { id: 1, materia: '', semestre: '1', calificacion: '' }
  ]);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejo de carga de archivos con validación de peso y formato
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
        setErrors((prev) => ({ ...prev, [name]: 'La fotografía debe estar en formato de imagen (JPG, PNG).' }));
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

  // Gestión de materias acreditadas (Revalidación)
  const addMateria = () => {
    setMateriasAcreditadas((prev) => [
      ...prev,
      { id: Date.now(), materia: '', semestre: '1', calificacion: '' }
    ]);
  };

  const removeMateria = (id) => {
    if (materiasAcreditadas.length === 1) return;
    setMateriasAcreditadas((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMateriaChange = (id, field, value) => {
    setMateriasAcreditadas((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.curp || !formData.email || !formData.phone || !formData.municipality) {
        alert('Por favor completa todos los campos personales y de residencia.');
        return;
      }
      if (formData.curp.length < 18) {
        alert('La CURP debe contar con 18 caracteres.');
        return;
      }
    }

    if (step === 2) {
      if (formData.admissionType === 'nuevo_ingreso' && !formData.originSchool) {
        alert('Ingresa el nombre de la secundaria de egreso.');
        return;
      }
      if (formData.admissionType === 'revalidacion') {
        if (!formData.previousHighSchoolName) {
          alert('Ingresa el nombre del plantel de bachillerato de procedencia.');
          return;
        }
        const materiasVacias = materiasAcreditadas.some((m) => !m.materia || !m.calificacion);
        if (materiasVacias) {
          alert('Por favor completa el nombre y calificación de todas las materias acreditadas agregadas.');
          return;
        }
      }
    }

    if (step === 3) {
      if (!formData.photo) {
        alert('Es obligatorio adjuntar la Fotografía del aspirante.');
        return;
      }
      if (formData.admissionType === 'nuevo_ingreso' && !formData.studyCert) {
        alert('Es obligatorio adjuntar el Certificado de Secundaria (PDF).');
        return;
      }
      if (formData.admissionType === 'revalidacion') {
        if (!formData.constanciaEstudios || !formData.curpFile || !formData.actaNacimiento) {
          alert('Para revalidación es obligatorio adjuntar: Constancia de Estudios, CURP y Acta de Nacimiento (PDFs).');
          return;
        }
      }
    }

    setStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    const randomFolio = `BEL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedFolio(randomFolio);
  };

  // Pantalla final con folio
  if (submittedFolio) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">¡Registro de Admisión Recibido!</h2>
            <p className="text-xs text-slate-600 mt-2">
              Tu expediente y documentación han sido remitidos al Centro de Atención Estudiantil (CAE) de BELVER.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Folio de Seguimiento</span>
            <div className="text-2xl font-mono font-extrabold text-blue-950 mt-1 tracking-wider">
              {submittedFolio}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Conserva este folio para consultar el dictamen de tu trámite.</p>
          </div>

          <div className="text-left bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-950 space-y-1">
            <p><strong>Aspirante:</strong> {formData.fullName}</p>
            <p><strong>Modalidad:</strong> {formData.admissionType === 'revalidacion' ? 'Revalidación / Equivalencia' : 'Nuevo Ingreso (Secundaria)'}</p>
            {formData.admissionType === 'revalidacion' && (
              <p><strong>Materias Acreditadas declaradas:</strong> {materiasAcreditadas.length}</p>
            )}
            <p><strong>Correo receptor:</strong> {formData.email}</p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-md"
          >
            Aceptar y Finalizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
        
        {/* Encabezado */}
        <div className="text-center space-y-1">
          <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
            Proceso de Inscripción Oficial
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Solicitud de Admisión a BELVER
          </h1>
          <p className="text-xs text-slate-500">
            Bachillerato en Línea de Veracruz
          </p>
        </div>

        {/* Stepper */}
        <div className="flex justify-between items-center relative py-2">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-0"></div>
          {[
            { s: 1, label: 'Personales' },
            { s: 2, label: 'Antecedentes' },
            { s: 3, label: 'Documentación' },
            { s: 4, label: 'Revisión' }
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
                1. Datos del Aspirante y Residencia
              </h2>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Nombre Completo</label>
                <input
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nombre(s) y Apellidos tal como figuran en acta"
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
                <label className="text-xs font-semibold text-slate-700">Correo Electrónico (Receptor de Notificaciones)</label>
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
                    placeholder="Ej. Xalapa, Veracruz, Poza Rica..."
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
                    placeholder="Ej. Centro, El Mirador..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: MODALIDAD Y MATERIAS ACREDITADAS */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
                2. Modalidad de Ingreso y Antecedentes
              </h2>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700">Tipo de Trámite</label>
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
                    <span>Revalidación / Equivalencia <br/><span className="text-slate-500 text-[10px]">Vengo de otra prepa con materias aprobadas</span></span>
                  </label>
                </div>
              </div>

              {/* Si es NUEVO INGRESO */}
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
                /* Si es REVALIDACIÓN */
                <div className="space-y-4 bg-amber-50/70 border border-amber-200 p-4 rounded-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-amber-950">Subsistema de Prepa Anterior</label>
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
                      <label className="text-xs font-semibold text-amber-950">Plantel / Escuela de Procedencia</label>
                      <input
                        name="previousHighSchoolName"
                        type="text"
                        required
                        value={formData.previousHighSchoolName}
                        onChange={handleChange}
                        placeholder="Ej. COBAEV 35 Xalapa / CBTIS 13"
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-amber-800"
                      />
                    </div>
                  </div>

                  {/* Tabla de Materias Acreditadas */}
                  <div className="pt-2 border-t border-amber-200/80">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="text-xs font-bold text-amber-900 block">
                          Materias Acreditadas en Preparatoria Anterior
                        </span>
                        <span className="text-[10px] text-amber-700">
                          Captura únicamente las asignaturas que aprobaste según tu constancia/historial.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={addMateria}
                        className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-lg shadow-sm"
                      >
                        + Agregar Materia
                      </button>
                      {/* Botón para generar PDF preliminar */}
                      <button
                         type="button"
                         onClick={() => MateriasPDF(formData, materiasAcreditadas)}
                         className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1"
                      >
                       📄 Descargar Cédula PDF
                     </button>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {materiasAcreditadas.map((mat, index) => (
                        <div key={mat.id} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-amber-200">
                          <span className="text-[10px] font-bold text-slate-400 w-5 text-center">{index + 1}.</span>
                          <input
                            type="text"
                            placeholder="Nombre de la Materia (ej. Matemáticas I)"
                            value={mat.materia}
                            onChange={(e) => handleMateriaChange(mat.id, 'materia', e.target.value)}
                            className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-amber-800"
                          />
                          <select
                            value={mat.semestre}
                            onChange={(e) => handleMateriaChange(mat.id, 'semestre', e.target.value)}
                            className="w-24 px-2 py-1 text-xs border border-slate-300 rounded-md bg-white outline-none focus:ring-1 focus:ring-amber-800"
                          >
                            <option value="1">1° Sem</option>
                            <option value="2">2° Sem</option>
                            <option value="3">3° Sem</option>
                            <option value="4">4° Sem</option>
                            <option value="5">5° Sem</option>
                            <option value="6">6° Sem</option>
                          </select>
                          <input
                            type="number"
                            step="0.1"
                            min="6"
                            max="10"
                            placeholder="Calif"
                            value={mat.calificacion}
                            onChange={(e) => handleMateriaChange(mat.id, 'calificacion', e.target.value)}
                            className="w-16 px-2 py-1 text-xs border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-amber-800"
                          />
                          {materiasAcreditadas.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMateria(mat.id)}
                              className="text-red-500 hover:text-red-700 font-bold px-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PASO 3: DOCUMENTACIÓN SEGÚN MODALIDAD */}
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

              {/* Fotografía Infantil / Credencial (Obligatoria para ambos) */}
              <div className="flex flex-col gap-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-xs font-semibold text-slate-800 flex items-between justify-between">
                  <span>Fotografía del Aspirante (Tipo credencial / Infantil) <span className="text-red-500">*</span></span>
                  {formData.photo && <span className="text-[10px] text-emerald-700 font-mono">✓ Imagen cargada</span>}
                </label>
                <p className="text-[10px] text-slate-500">Formato JPG o PNG. Rostro visible, fondo claro y de frente.</p>
                <input
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleFileChange(e, 'image')}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 border border-slate-300 rounded-lg p-1 bg-white"
                />
                {errors.photo && <span className="text-xs text-red-600 font-semibold">{errors.photo}</span>}
              </div>

              {/* DOCUMENTOS PARA NUEVO INGRESO */}
              {formData.admissionType === 'nuevo_ingreso' ? (
                <div className="flex flex-col gap-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="text-xs font-semibold text-slate-800 flex items-between justify-between">
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
                /* DOCUMENTOS PARA REVALIDACIÓN */
                <div className="space-y-3 bg-amber-50/60 border border-amber-200 p-3.5 rounded-xl">
                  <span className="text-[11px] font-bold text-amber-900 block">
                    Documentos Oficiales para Revalidación (Únicamente PDF)
                  </span>

                  {/* Constancia / Historial de Prepa */}
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

                  {/* CURP en PDF */}
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

                  {/* Acta de Nacimiento en PDF */}
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

          {/* PASO 4: CONFIRMACIÓN Y RESUMEN */}
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
                    <span className="font-mono font-semibold text-slate-800">{formData.curp}</span>
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

                {/* Resumen de documentos adjuntos */}
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
                        <div className="pt-2 text-[11px] text-amber-900">
                          <strong>{materiasAcreditadas.length}</strong> materia(s) acreditada(s) declarada(s) para dictamen del CAE.
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                Al hacer clic en "Registrar Solicitud Oficial", confirmas que los datos ingresados y la documentación adjunta son verídicos.
              </p>
            </div>
          )}

          {/* Botones de Navegación */}
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
      </div>
    </div>
  );
}