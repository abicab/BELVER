import React, { useState } from 'react';

// Solicitudes simuladas actualizadas con los nuevos campos del formulario de admisión
const INITIAL_SOLICITUDES = [
  {
    id: 1,
    folio: 'BEL-2026-1001',
    fechaSolicitud: '2026-08-20',
    vigencia: '2026-09-04',
    aspirante: 'María Fernanda Ruiz Morales',
    curp: 'RUAM050819MVERRL02',
    email: 'maria.ruiz@gmail.com',
    telefono: '2281456789',
    genderIdentity: 'Femenino',
    lgbtqMember: 'No',
    hasDisability: 'No',
    educationalSupport: 'No',
    employmentStatus: 'No trabaja',
    hasComputer: 'Sí',
    hasInternet: 'Sí',
    domicilio: 'Calle Xalapa #12, Col. Centro, Xalapa, Ver.',
    tutorName: 'Roberto Ruiz Pérez',
    tutorPhone: '2281112233',
    emergencyContactName: 'Carmen Morales',
    emergencyPhone: '2289998877',
    modalidad: 'nuevo_ingreso',
    escuelaProcedencia: 'Secundaria Técnica No. 3 (Xalapa)',
    estatus: 'PENDIENTE',
    matriculaAsignada: null,
    passwordUnica: null,
    observaciones: '',
    documentos: [
      { id: 'foto', nombre: 'Fotografía Oficial', archivo: 'foto_aspirante.jpg', peso: '450 KB', estatus: 'PENDIENTE' },
      { id: 'acta', nombre: 'Acta de Nacimiento', archivo: 'acta_nacimiento.pdf', peso: '1.8 MB', estatus: 'PENDIENTE' },
      { id: 'curp', nombre: 'CURP Actualizada', archivo: 'curp_oficial.pdf', peso: '320 KB', estatus: 'PENDIENTE' },
      { id: 'cert', nombre: 'Certificado de Secundaria', archivo: 'certificado_secundaria.pdf', peso: '1.4 MB', estatus: 'PENDIENTE' },
    ],
    materiasAcreditadas: []
  },
  {
    id: 2,
    folio: 'BEL-2026-1002',
    fechaSolicitud: '2026-08-22',
    vigencia: '2026-09-06',
    aspirante: 'Carlos Eduardo Domínguez Solís',
    curp: 'DOEC040112HDFRNR09',
    email: 'carlos.dominguez@outlook.com',
    telefono: '2288901234',
    genderIdentity: 'Masculino',
    lgbtqMember: 'No',
    hasDisability: 'No',
    educationalSupport: 'No',
    employmentStatus: 'Medio tiempo',
    hasComputer: 'Sí',
    hasInternet: 'Sí',
    domicilio: 'Av. Veracruz #45, Col. Progreso, Xalapa, Ver.',
    tutorName: 'Sofía Solís Ramos',
    tutorPhone: '2285554433',
    emergencyContactName: 'Javier Domínguez',
    emergencyPhone: '2287776655',
    modalidad: 'revalidacion',
    escuelaProcedencia: 'COBAEV Plantel 35 Xalapa',
    estatus: 'EN_REVISION',
    matriculaAsignada: null,
    passwordUnica: null,
    observaciones: 'En proceso de cotejo de materias acreditadas.',
    documentos: [
      { id: 'foto', nombre: 'Fotografía Oficial', archivo: 'foto_carlos.jpg', peso: '510 KB', estatus: 'VALIDADO' },
      { id: 'acta', nombre: 'Acta de Nacimiento', archivo: 'acta_doec.pdf', peso: '1.8 MB', estatus: 'VALIDADO' },
      { id: 'curp', nombre: 'CURP Actualizada', archivo: 'curp_doec.pdf', peso: '320 KB', estatus: 'VALIDADO' },
      { id: 'constancia', nombre: 'Constancia de Estudios', archivo: 'constancia_incompleta.pdf', peso: '2.1 MB', estatus: 'RECHAZADO' },
    ],
    materiasAcreditadas: [
      { id: 101, materia: 'Matemáticas I', semestre: '1', calificacion: '8.5' },
      { id: 102, materia: 'Química I', semestre: '1', calificacion: '9.0' }
    ]
  }
];

export default function ControlEscolarPage() {
  const [solicitudes, setSolicitudes] = useState(INITIAL_SOLICITUDES);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [filtroEstatus, setFiltroEstatus] = useState('TODOS');
  const [filtroModalidad, setFiltroModalidad] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');

  // Estados temporales del modal de dictamen
  const [tempMaterias, setTempMaterias] = useState([]);
  const [tempObservaciones, setTempObservaciones] = useState('');
  const [tempDocumentos, setTempDocumentos] = useState([]);

  // Consecutivo para generación de matrícula oficial
  const [consecutivoMatricula, setConsecutivoMatricula] = useState(3);

  // Apertura de modal de cotejo
  const handleOpenDictamen = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setTempMaterias([...solicitud.materiasAcreditadas]);
    setTempObservaciones(solicitud.observaciones || '');
    setTempDocumentos(solicitud.documentos.map((d) => ({ ...d })));
  };

  // Cambio de estatus por documento individual
  const handleDocStatusChange = (docId, nuevoEstatus) => {
    setTempDocumentos((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, estatus: nuevoEstatus } : d))
    );
  };

  const handleAddMateria = () => {
    setTempMaterias((prev) => [
      ...prev,
      { id: Date.now(), materia: '', semestre: '1', calificacion: '' }
    ]);
  };

  const handleRemoveMateria = (id) => {
    setTempMaterias((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMateriaFieldChange = (id, field, value) => {
    setTempMaterias((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // Generación de Matrícula Oficial y Contraseña Única Inalterable
  const generarMatriculaOficial = () => {
    const anio = new Date().getFullYear().toString().slice(-2);
    const padding = String(consecutivoMatricula).padStart(6, '0');
    return `B${anio}${padding}`;
  };

  const generarPasswordUnica = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `BV-${randomNum}-X`;
  };

  // Emitir Dictamen Favorable / Aprobado
  const handleAprobarExpediente = () => {
    const algunDocRechazado = tempDocumentos.some((d) => d.estatus === 'RECHAZADO');
    if (algunDocRechazado) {
      alert('No puedes aprobar un expediente que contiene documentos marcados como Rechazados.');
      return;
    }

    let matricula = selectedSolicitud.matriculaAsignada;
    let password = selectedSolicitud.passwordUnica;

    if (!matricula) {
      matricula = generarMatriculaOficial();
      password = generarPasswordUnica();
      setConsecutivoMatricula((prev) => prev + 1);
    }

    const updatedSolicitudes = solicitudes.map((s) => {
      if (s.id === selectedSolicitud.id) {
        return {
          ...s,
          estatus: 'APROBADO',
          matriculaAsignada: matricula,
          passwordUnica: password,
          observaciones: '¡Felicidades! Expediente digital cotejado y aprobado exitosamente bajo el programa de inscripción gratuita.',
          documentos: tempDocumentos,
          materiasAcreditadas: tempMaterias
        };
      }
      return s;
    });

    setSolicitudes(updatedSolicitudes);
    alert(`Expediente aprobado exitosamente.\nMatrícula Asignada: ${matricula}\nContraseña Única: ${password}`);
    setSelectedSolicitud(null);
  };

  // Emitir Dictamen con Observaciones / Corrección
  const handleRechazarConObservaciones = () => {
    if (!tempObservaciones.trim()) {
      alert('Es obligatorio ingresar las observaciones detalladas para que el aspirante corrija su expediente.');
      return;
    }

    const updatedSolicitudes = solicitudes.map((s) => {
      if (s.id === selectedSolicitud.id) {
        return {
          ...s,
          estatus: 'CON_OBSERVACIONES',
          observaciones: tempObservaciones,
          documentos: tempDocumentos,
          materiasAcreditadas: tempMaterias
        };
      }
      return s;
    });

    setSolicitudes(updatedSolicitudes);
    alert('Expediente marcado con correcciones requeridas. El aspirante podrá consultarlo y reemplazar sus archivos.');
    setSelectedSolicitud(null);
  };

  const solicitudesFiltradas = solicitudes.filter((sol) => {
    const matchBusqueda =
      sol.folio.toLowerCase().includes(busqueda.toLowerCase()) ||
      sol.aspirante.toLowerCase().includes(busqueda.toLowerCase()) ||
      sol.curp.toLowerCase().includes(busqueda.toLowerCase());

    const matchEstatus = filtroEstatus === 'TODOS' ? true : sol.estatus === filtroEstatus;
    const matchModalidad = filtroModalidad === 'TODOS' ? true : sol.modalidad === filtroModalidad;

    return matchBusqueda && matchEstatus && matchModalidad;
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Encabezado */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-950 text-white px-2.5 py-1 rounded-md">
              Departamento de Control Escolar
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              Validación de Expedientes y Dictamen de Admisión (Gratuito)
            </h1>
            <p className="text-xs text-slate-500">
              Cotejo documental, perfil socio-demográfico/inclusión, asignación de matrícula y credenciales inalterables.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Solicitudes Pendientes</span>
              <span className="text-lg font-black text-slate-900">
                {solicitudes.filter((s) => s.estatus === 'PENDIENTE' || s.estatus === 'EN_REVISION' || s.estatus === 'CON_OBSERVACIONES').length}
              </span>
            </div>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="relative w-full lg:w-96">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar por Folio, CURP o Nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto justify-end">
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Estatus:</span>
              <select
                value={filtroEstatus}
                onChange={(e) => setFiltroEstatus(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold py-1 px-2.5 rounded-lg outline-none cursor-pointer"
              >
                <option value="TODOS">Todos</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_REVISION">En Revisión</option>
                <option value="APROBADO">Aprobado</option>
                <option value="CON_OBSERVACIONES">Con Observaciones</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Folio / Fecha</th>
                  <th className="p-4">Aspirante / CURP</th>
                  <th className="p-4">Modalidad</th>
                  <th className="p-4">Procedencia</th>
                  <th className="p-4 text-center">Estatus</th>
                  <th className="p-4">Matrícula</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {solicitudesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400 text-xs">
                      No se encontraron solicitudes.
                    </td>
                  </tr>
                ) : (
                  solicitudesFiltradas.map((sol) => (
                    <tr key={sol.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <span className="font-mono font-bold text-blue-950 block">{sol.folio}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{sol.fechaSolicitud}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-900 block">{sol.aspirante}</span>
                        <span className="text-[10px] font-mono text-slate-500">{sol.curp}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          sol.modalidad === 'revalidacion' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                        }`}>
                          {sol.modalidad === 'revalidacion' ? 'Revalidación' : 'Nuevo Ingreso'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{sol.escuelaProcedencia}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          sol.estatus === 'APROBADO' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          sol.estatus === 'CON_OBSERVACIONES' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {sol.estatus}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {sol.matriculaAsignada || '—'}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenDictamen(sol)}
                          className="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-white rounded-lg font-semibold text-xs transition"
                        >
                          Cotejar y Dictaminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Cotejo y Dictamen Integral */}
        {selectedSolicitud && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
              
              {/* Header Modal Estilizado (Con Fuente Más Grande y Contraste Alto) */}
              <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex justify-between items-center shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 font-bold text-base shadow-inner">
                    📋
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-extrabold text-base tracking-tight text-white">Inspección de Expediente</h3>
                      <span className="font-mono text-xs bg-blue-900/90 text-blue-200 px-2.5 py-0.5 rounded-md border border-blue-600/60 font-bold shadow-xs">
                        {selectedSolicitud.folio}
                      </span>
                    </div>
                    <div className="text-xs text-slate-200 mt-1 flex items-center gap-2 font-semibold">
                      <span className="text-white text-sm tracking-wide">👤 {selectedSolicitud.aspirante}</span>
                      <span className="text-blue-400">•</span>
                      <span className="font-mono text-cyan-300 tracking-wider">CURP: {selectedSolicitud.curp}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedSolicitud(null)} 
                  className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700 shadow-sm"
                  title="Cerrar ventana"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-700">
                
                {/* Perfil Demográfico, Inclusión y Tecnológico */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* Tarjeta 1: Identidad e Inclusión */}
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-blue-950 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200/60 pb-1.5">
                      <span>🧬</span> Identidad e Inclusión
                    </div>
                    <div className="space-y-1 text-slate-700">
                      <p className="flex justify-between">
                        <span className="text-slate-500 font-medium">Género:</span> 
                        <span className="font-semibold text-slate-900">{selectedSolicitud.genderIdentity || 'No especificado'}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-500 font-medium">Discapacidad:</span> 
                        <span className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${selectedSolicitud.hasDisability !== 'No' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'}`}>
                          {selectedSolicitud.hasDisability}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Tarjeta 2: Perfil En Línea */}
                  <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-indigo-950 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200/60 pb-1.5">
                      <span>💻</span> Perfil En Línea
                    </div>
                    <div className="space-y-1 text-slate-700">
                      <p className="flex justify-between">
                        <span className="text-slate-500 font-medium">Laboral:</span> 
                        <span className="font-semibold text-slate-900">{selectedSolicitud.employmentStatus}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-500 font-medium">PC / Internet:</span> 
                        <span className="font-semibold text-indigo-950 font-mono">{selectedSolicitud.hasComputer} / {selectedSolicitud.hasInternet}</span>
                      </p>
                    </div>
                  </div>

                  {/* Tarjeta 3: Contacto y Tutor */}
                  <div className="bg-gradient-to-br from-slate-50 to-amber-50/40 p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-950 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200/60 pb-1.5">
                      <span>🛡️</span> Contacto y Tutor
                    </div>
                    <div className="space-y-1 text-slate-700">
                      <p className="flex justify-between">
                        <span className="text-slate-500 font-medium">Móvil:</span> 
                        <span className="font-semibold text-slate-900 font-mono">{selectedSolicitud.telefono}</span>
                      </p>
                      <p className="truncate">
                        <span className="text-slate-500 font-medium block">Tutor:</span> 
                        <span className="font-semibold text-slate-900 truncate block">{selectedSolicitud.tutorName || 'N/A'}</span>
                      </p>
                    </div>
                  </div>

                </div>

                {/* Cotejo Documental */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    1. Validación y Cotejo de Documentación Digital (Sin Pago - Gratuito)
                  </h4>
                  <div className="space-y-2">
                    {tempDocumentos.map((doc) => (
                      <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">📄</span>
                          <div>
                            <span className="font-bold text-slate-800 block">{doc.nombre}</span>
                            <span className="text-[10px] text-slate-400 font-mono">Archivo: {doc.archivo} ({doc.peso})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => alert(`Visualizando ${doc.archivo}...`)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                          >
                            Ver Archivo
                          </button>

                          <select
                            value={doc.estatus}
                            onChange={(e) => handleDocStatusChange(doc.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold outline-none border ${
                              doc.estatus === 'VALIDADO' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                              doc.estatus === 'RECHAZADO' ? 'bg-red-50 text-red-800 border-red-300' :
                              'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="VALIDADO">Validado ✓</option>
                            <option value="RECHAZADO">Rechazado ✕</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Observaciones */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
                    Observaciones y Retroalimentación para el Aspirante
                  </label>
                  <textarea
                    rows={3}
                    value={tempObservaciones}
                    onChange={(e) => setTempObservaciones(e.target.value)}
                    placeholder="Escribe las correcciones necesarias que el aspirante verá al consultar su folio..."
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 bg-white"
                  />
                </div>

              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedSolicitud(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-xl transition"
                >
                  Cancelar
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRechazarConObservaciones}
                    className="px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition"
                  >
                    Emitir Correcciones Requeridas
                  </button>

                  <button
                    type="button"
                    onClick={handleAprobarExpediente}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-md"
                  >
                    ✓ Aprobar, Generar Matrícula y Contraseña Única
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}