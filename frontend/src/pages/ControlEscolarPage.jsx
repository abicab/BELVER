import React, { useState } from 'react';

// Solicitudes simuladas recibidas desde AdmissionPage
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
    modalidad: 'nuevo_ingreso',
    escuelaProcedencia: 'Secundaria Técnica No. 3 (Xalapa)',
    promedioSecundaria: '9.2',
    estatus: 'PENDIENTE', // 'PENDIENTE' | 'EN_REVISION' | 'APROBADO' | 'CON_OBSERVACIONES' | 'RECHAZADO'
    matriculaAsignada: null,
    observaciones: '',
    documentos: [
      { id: 'doc1', nombre: 'Certificado de Secundaria', archivo: 'Certificado_Secundaria_RUAM.pdf', peso: '1.4 MB', estatus: 'PENDIENTE' },
      { id: 'doc2', nombre: 'Fotografía Oficial', archivo: 'Foto_Infantil_RUAM.jpg', peso: '450 KB', estatus: 'PENDIENTE' },
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
    modalidad: 'revalidacion',
    escuelaProcedencia: 'COBAEV Plantel 35 Xalapa',
    subsistemaPrepa: 'Colegio de Bachilleres del Estado de Veracruz (COBAEV)',
    promedioSecundaria: '',
    estatus: 'EN_REVISION',
    matriculaAsignada: null,
    observaciones: 'En proceso de cotejo de materias acreditadas del 1° y 2° semestre.',
    documentos: [
      { id: 'doc1', nombre: 'Constancia / Historial de Bachillerato', archivo: 'Historial_COBAEV35.pdf', peso: '2.1 MB', estatus: 'VALIDADO' },
      { id: 'doc2', nombre: 'CURP Actualizada', archivo: 'CURP_DOEC.pdf', peso: '320 KB', estatus: 'VALIDADO' },
      { id: 'doc3', nombre: 'Acta de Nacimiento', archivo: 'Acta_DOEC.pdf', peso: '1.8 MB', estatus: 'VALIDADO' },
      { id: 'doc4', nombre: 'Fotografía Oficial', archivo: 'Foto_DOEC.jpg', peso: '510 KB', estatus: 'VALIDADO' },
    ],
    materiasAcreditadas: [
      { id: 101, materia: 'Matemáticas I', semestre: '1', calificacion: '8.5' },
      { id: 102, materia: 'Química I', semestre: '1', calificacion: '9.0' },
      { id: 103, materia: 'Ética y Valores I', semestre: '1', calificacion: '10.0' },
      { id: 104, materia: 'Taller de Lectura y Redacción I', semestre: '1', calificacion: '8.0' },
      { id: 105, materia: 'Lengua Adicional al Español I (Inglés)', semestre: '1', calificacion: '9.0' }
    ]
  },
  {
    id: 3,
    folio: 'BEL-2026-1003',
    fechaSolicitud: '2026-08-19',
    vigencia: '2026-09-03',
    aspirante: 'Andrea Paola Aguilar Méndez',
    curp: 'AUMA031120MVERNG01',
    email: 'andrea.aguilar@gmail.com',
    telefono: '2283459876',
    modalidad: 'nuevo_ingreso',
    escuelaProcedencia: 'Telesecundaria Benito Juárez',
    promedioSecundaria: '8.7',
    estatus: 'APROBADO',
    matriculaAsignada: 'B26000001',
    observaciones: 'Expediente digital validado correctamente.',
    documentos: [
      { id: 'doc1', nombre: 'Certificado de Secundaria', archivo: 'Certificado_AUMA.pdf', peso: '1.1 MB', estatus: 'VALIDADO' },
      { id: 'doc2', nombre: 'Fotografía Oficial', archivo: 'Foto_AUMA.png', peso: '620 KB', estatus: 'VALIDADO' },
    ],
    materiasAcreditadas: []
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

  // Consecutivo para generación de matrícula oficial (B + 26 + 6 dígitos)
  const [consecutivoMatricula, setConsecutivoMatricula] = useState(2);

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

  // Gestión de materias de revalidación por Control Escolar
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

  // Algoritmo oficial de generación de matrícula BELVER: B + 26 + Consecutivo (6 dígitos)
  const generarMatriculaOficial = () => {
    const anio = new Date().getFullYear().toString().slice(-2); // '26'
    const padding = String(consecutivoMatricula).padStart(6, '0');
    return `B${anio}${padding}`;
  };

  // Emitir Dictamen Favorable / Aprobado
  const handleAprobarExpediente = () => {
    const algunDocRechazado = tempDocumentos.some((d) => d.estatus === 'RECHAZADO');
    if (algunDocRechazado) {
      alert('No puedes aprobar un expediente que contiene documentos marcados como Rechazados.');
      return;
    }

    if (selectedSolicitud.modalidad === 'revalidacion' && tempMaterias.length === 0) {
      if (!confirm('No has capturado materias acreditadas para esta revalidación. ¿Deseas aprobarlo como alumno de 1er semestre?')) {
        return;
      }
    }

    let matricula = selectedSolicitud.matriculaAsignada;
    if (!matricula) {
      matricula = generarMatriculaOficial();
      setConsecutivoMatricula((prev) => prev + 1);
    }

    const updatedSolicitudes = solicitudes.map((s) => {
      if (s.id === selectedSolicitud.id) {
        return {
          ...s,
          estatus: 'APROBADO',
          matriculaAsignada: matricula,
          observaciones: tempObservaciones || 'Expediente cotejado y aprobado por Control Escolar.',
          documentos: tempDocumentos,
          materiasAcreditadas: tempMaterias
        };
      }
      return s;
    });

    setSolicitudes(updatedSolicitudes);
    alert(`Expediente aprobado exitosamente. Matrícula oficial asignada: ${matricula}`);
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
    alert('Expediente marcado con observaciones. El aspirante podrá consultar el dictamen con su Folio.');
    setSelectedSolicitud(null);
  };

  // Filtros de tabla
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

        {/* Encabezado Principal */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-950 text-white px-2.5 py-1 rounded-md">
              Departamento de Control Escolar
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              Validación de Expedientes y Dictamen de Revalidación
            </h1>
            <p className="text-xs text-slate-500">
              Bandeja oficial para cotejo de certificados, captura de materias acreditadas y matriculación.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Solicitudes Pendientes</span>
              <span className="text-lg font-black text-slate-900">
                {solicitudes.filter((s) => s.estatus === 'PENDIENTE' || s.estatus === 'EN_REVISION').length}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Búsqueda y Filtros Optimizada */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Input de Búsqueda con Icono */}
          <div className="relative w-full lg:w-96">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar por Folio, CURP o Nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition"
            />
          </div>

          {/* Controles de Filtrado Agrupados */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto justify-end">
            
            {/* Filtro Estatus */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Estatus:</span>
              <select
                value={filtroEstatus}
                onChange={(e) => setFiltroEstatus(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold py-1 px-2.5 rounded-lg outline-none cursor-pointer focus:ring-1 focus:ring-slate-800"
              >
                <option value="TODOS">Todos</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_REVISION">En Revisión</option>
                <option value="APROBADO">Aprobado</option>
                <option value="CON_OBSERVACIONES">Con Observaciones</option>
              </select>
            </div>

            {/* Filtro Modalidad */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Modalidad:</span>
              <div className="flex items-center gap-1">
                {[
                  { id: 'TODOS', label: 'Todas' },
                  { id: 'nuevo_ingreso', label: 'Nuevo Ingreso' },
                  { id: 'revalidacion', label: 'Revalidación' }
                ].map((m) => {
                  const isActive = filtroModalidad === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setFiltroModalidad(m.id)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Tabla de Solicitudes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Folio / Fecha</th>
                  <th className="p-4">Aspirante / CURP</th>
                  <th className="p-4">Modalidad</th>
                  <th className="p-4">Escuela Procedencia</th>
                  <th className="p-4 text-center">Estatus</th>
                  <th className="p-4">Matrícula</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {solicitudesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400 text-xs">
                      No se encontraron solicitudes con los filtros aplicados.
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
                      <td className="p-4 text-slate-600">
                        {sol.escuelaProcedencia}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          sol.estatus === 'APROBADO' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          sol.estatus === 'CON_OBSERVACIONES' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          sol.estatus === 'EN_REVISION' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
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

        {/* MODAL DE COTEJO Y DICTAMEN DE EXPEDIENTE */}
        {selectedSolicitud && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
              
              {/* Header Modal */}
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-bold text-xs">Inspección de Expediente: {selectedSolicitud.folio}</h3>
                  <p className="text-[10px] text-slate-300">{selectedSolicitud.aspirante} • CURP: {selectedSolicitud.curp}</p>
                </div>
                <button onClick={() => setSelectedSolicitud(null)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
              </div>

              {/* Contenido con Scroll */}
              <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-700">
                
                {/* Bloque 1: Resumen del Aspirante */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Modalidad</span>
                    <span className="font-bold text-slate-900 uppercase">
                      {selectedSolicitud.modalidad === 'revalidacion' ? 'Revalidación / Equivalencia' : 'Nuevo Ingreso'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Procedencia</span>
                    <span className="font-semibold text-slate-800">{selectedSolicitud.escuelaProcedencia}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Contacto</span>
                    <span className="text-slate-800">{selectedSolicitud.email} • {selectedSolicitud.telefono}</span>
                  </div>
                </div>

                {/* Bloque 2: Cotejo Documental */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    1. Validación y Cotejo de Documentación Digital
                  </h4>
                  <div className="space-y-2">
                    {tempDocumentos.map((doc) => (
                      <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">📄</span>
                          <div>
                            <span className="font-bold text-slate-800 block">{doc.nombre}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{doc.archivo} ({doc.peso})</span>
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

                {/* Bloque 3: Captura Oficial de Materias Acreditadas (Exclusivo Revalidación) */}
                {selectedSolicitud.modalidad === 'revalidacion' && (
                  <div className="space-y-3 bg-amber-50/70 border border-amber-200 p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">
                          2. Captura de Materias Acreditadas (Dictamen Oficial)
                        </h4>
                        <p className="text-[10px] text-amber-800">
                          Control Escolar transcribe y aprueba las materias acreditadas según la constancia oficial.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddMateria}
                        className="px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold shadow-sm"
                      >
                        + Agregar Materia
                      </button>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {tempMaterias.length === 0 ? (
                        <p className="text-center py-4 text-slate-400 text-xs italic">
                          No hay materias acreditadas capturadas aún.
                        </p>
                      ) : (
                        tempMaterias.map((mat, index) => (
                          <div key={mat.id} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-amber-200">
                            <span className="text-[10px] font-bold text-slate-400 w-5 text-center">{index + 1}.</span>
                            <input
                              type="text"
                              placeholder="Nombre de la Materia Oficial"
                              value={mat.materia}
                              onChange={(e) => handleMateriaFieldChange(mat.id, 'materia', e.target.value)}
                              className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-amber-800"
                            />
                            <select
                              value={mat.semestre}
                              onChange={(e) => handleMateriaFieldChange(mat.id, 'semestre', e.target.value)}
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
                              onChange={(e) => handleMateriaFieldChange(mat.id, 'calificacion', e.target.value)}
                              className="w-16 px-2 py-1 text-xs border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-amber-800"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveMateria(mat.id)}
                              className="text-red-500 hover:text-red-700 font-bold px-1 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Bloque 4: Observaciones del Dictamen */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
                    Observaciones y Retroalimentación de Control Escolar
                  </label>
                  <textarea
                    rows={3}
                    value={tempObservaciones}
                    onChange={(e) => setTempObservaciones(e.target.value)}
                    placeholder="Escribe comentarios para el dictamen o las observaciones que el aspirante debe corregir..."
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 bg-white"
                  />
                </div>

              </div>

              {/* Footer Modal: Acciones de Dictamen */}
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
                    Emitir Observaciones / Corrección
                  </button>

                  <button
                    type="button"
                    onClick={handleAprobarExpediente}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-md"
                  >
                    ✓ Aprobar y Generar Matrícula
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