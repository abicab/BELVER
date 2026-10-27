import React, { useState, useEffect } from 'react';

export default function AlumnoPage({ alumno: alumnoProp }) {
  const [activeTab, setActiveTab] = useState('inicio');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [documentoAbriendo, setDocumentoAbriendo] = useState(null);

  // Datos dinámicos cargados del backend
  const [alumnoData, setAlumnoData] = useState(null);
  const [materiasCursando, setMateriasCursando] = useState([]);
  const [documentosExpediente, setDocumentosExpediente] = useState([]);
  const [kardexPlanCompleto, setKardexPlanCompleto] = useState([]);

  // Estado para controlar qué semestres están desplegados
  const [openSemestres, setOpenSemestres] = useState({ 1: true, 2: true });

  const toggleSemestre = (index) => {
    setOpenSemestres((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // El ID debe venir del alumno seleccionado; no usar un ID fijo como respaldo.
  const alumnoId = alumnoProp?.rawId ?? alumnoProp?.id ?? null;

  useEffect(() => {
    const fetchAlumnoData = async () => {
      if (!alumnoId || !Number.isInteger(Number(alumnoId)) || Number(alumnoId) <= 0) {
        setErrorMsg('No se recibió un ID válido del alumno.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMsg('');
        const res = await fetch(`http://localhost:4000/api/alumno/${alumnoId}`);
        if (!res.ok) throw new Error('No se pudo cargar la información del alumno.');
        
        const data = await res.json();
        if (data.ok) {
          setAlumnoData(data.alumno);
          setMateriasCursando(data.materiasCursando);
          setDocumentosExpediente(data.documentosExpediente);
          setKardexPlanCompleto(data.kardexPlanCompleto);
        } else {
          throw new Error(data.error || 'Error al obtener datos.');
        }
      } catch (err) {
        console.error('Error al conectar con la API de alumno:', err);
        setErrorMsg('Error al sincronizar los datos del estudiante con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlumnoData();
  }, [alumnoId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-600 animate-pulse">Cargando portal del estudiante...</p>
      </div>
    );
  }

  if (errorMsg || !alumnoData) {
    return (
      <div className="min-h-screen bg-slate-100 p-8 flex items-center justify-center">
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm text-center space-y-2">
          <p className="text-xs font-bold text-rose-600">{errorMsg || 'No se encontró información del alumno.'}</p>
        </div>
      </div>
    );
  }

  const handleVisualizarDocumento = async (docId, nombreDoc) => {
    // Abrir la pestaña durante el clic para evitar que el navegador bloquee la ventana.
    const nuevaVentana = window.open('', '_blank');

    if (!nuevaVentana) {
      alert('Permite las ventanas emergentes para visualizar el documento.');
      return;
    }

    nuevaVentana.document.title = `Cargando: ${nombreDoc}`;
    nuevaVentana.document.body.innerHTML =
      '<p style="font-family: sans-serif; padding: 20px">Cargando documento...</p>';
    setDocumentoAbriendo(String(docId));

    try {
      const response = await fetch(
        `http://localhost:4000/api/alumno/documento/${encodeURIComponent(docId)}`
      );

      if (!response.ok) {
        let mensaje = 'No se pudo cargar el archivo desde el servidor.';
        try {
          const data = await response.json();
          mensaje = data.mensaje || data.error || mensaje;
        } catch {
          // La respuesta puede no ser JSON.
        }
        throw new Error(mensaje);
      }

      const blob = await response.blob();
      if (!blob.size) throw new Error('El documento está vacío.');

      const url = window.URL.createObjectURL(blob);
      nuevaVentana.location.href = url;
      window.setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (error) {
      console.error('Error al abrir el documento:', error);
      nuevaVentana.close();
      alert(error.message || 'No se pudo visualizar el documento. Intenta de nuevo.');
    } finally {
      setDocumentoAbriendo(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Encabezado Principal */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-950 text-white px-2.5 py-1 rounded-md">
              Portal Oficial del Estudiante - BELVER
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              {alumnoData.nombre} {alumnoData.apellidos}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Matrícula: <strong className="text-slate-900">{alumnoData.matricula}</strong> | Modalidad: {alumnoData.modalidadIngreso}
            </p>
          </div>

          {/* Menú de Navegación */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {[
              { id: 'inicio', label: ' Inicio' },
              { id: 'datos', label: ' Datos' },
              { id: 'expediente', label: ' Expediente' },
              { id: 'kardex', label: ' Kárdex ' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1. VISTA DE INICIO */}
        {activeTab === 'inicio' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Materias Activas en Cursamiento</h2>
                <p className="text-xs text-slate-500">Carga académica actual registrada en sistema.</p>
              </div>
              <span className="text-xs font-bold text-blue-950 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {materiasCursando.length} Materias Registradas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {materiasCursando.length === 0 ? (
                <div className="col-span-3 bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                  No hay materias activas en cursamiento actualmente.
                </div>
              ) : (
                materiasCursando.map((materia) => (
                  <div key={materia.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {materia.codigo}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{materia.nombre}</h3>
                      <p className="text-xs text-slate-500">Créditos: <strong>{materia.creditos} SATCA</strong></p>
                    </div>
                    <div className="text-right border-l border-slate-100 pl-4">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Calificación</span>
                      <span className="text-2xl font-black text-slate-900 font-mono">{materia.calificacion > 0 ? materia.calificacion.toFixed(1) : '-'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 2. DATOS GENERALES */}
        {activeTab === 'datos' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2">
              Ficha de Información del Estudiante
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Nombre Completo</span>
                <span className="font-bold text-slate-900 text-sm">{alumnoData.nombre} {alumnoData.apellidos}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">CURP</span>
                <span className="font-mono font-bold text-slate-800">{alumnoData.curp}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Matrícula BELVER</span>
                <span className="font-mono font-bold text-blue-950">{alumnoData.matricula}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Estatus de Ingreso</span>
                <span className="font-semibold text-amber-900">{alumnoData.modalidadIngreso}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 lg:col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Domicilio Particular</span>
                <span className="font-semibold text-slate-800">{alumnoData.direccion}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. EXPEDIENTE DIGITAL */}
        {activeTab === 'expediente' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Expediente Único Digital (BELVER)
              </h2>
              <p className="text-xs text-slate-500">Documentación de ingreso resguardada en el sistema.</p>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {documentosExpediente.map((doc) => {
                const esBoletaNoAplica = doc.esRevalidacion && !alumnoData.esRevalidante;

                return (
                  <div key={doc.id} className="p-4 bg-white hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{esBoletaNoAplica ? '⚪' : '📄'}</span>
                      <div>
                        <span className="font-bold text-slate-900 block">{doc.nombre}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {esBoletaNoAplica ? 'No requiere equivalencia' : `Formato: ${doc.formato} • Subido el: ${doc.fecha}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {esBoletaNoAplica ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          Sin Requerir
                        </span>
                      ) : (
                        <>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Registrado y Resguardado
                          </span>
                          <button
                            type="button"
                            onClick={() => handleVisualizarDocumento(doc.id, doc.nombre)}
                            disabled={documentoAbriendo === String(doc.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-wait text-slate-800 font-bold rounded-lg transition"
                          >
                            {documentoAbriendo === String(doc.id) ? 'Abriendo...' : 'Visualizar'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. KÁRDEX CON PLAN COMPLETO (Sin botón de descarga) */}
        {activeTab === 'kardex' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">Historial Académico (Kárdex Plan Completo)</h2>
                <p className="text-xs text-slate-500">{alumnoData.planEstudiosNombre}</p>
              </div>
            </div>

            <div className="space-y-3">
              {kardexPlanCompleto.map((bloque, idx) => {
                const isOpen = !!openSemestres[idx];

                return (
                  <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <button
                      onClick={() => toggleSemestre(idx)}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 transition text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          {bloque.semestre}
                        </span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                          {bloque.materias.length} materias
                        </span>
                      </div>
                      <span className="text-slate-500 font-bold text-xs">
                        {isOpen ? '▲ Ocultar' : '▼ Desplegar'}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="p-3 bg-white border-t border-slate-200">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border border-slate-100 rounded-lg overflow-hidden">
                            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                              <tr>
                                <th className="p-2.5">Código</th>
                                <th className="p-2.5">Materia</th>
                                <th className="p-2.5">Créditos</th>
                                <th className="p-2.5">Estatus</th>
                                <th className="p-2.5 text-right">Calificación Final</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {bloque.materias.map((m, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                  <td className="p-2.5 font-mono font-bold text-slate-800">{m.codigo}</td>
                                  <td className="p-2.5 font-semibold text-slate-900">{m.nombre}</td>
                                  <td className="p-2.5">{m.creditos}</td>
                                  <td className="p-2.5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                      m.estatus.includes('Acreditada')
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : m.estatus === 'Cursando'
                                        ? 'bg-blue-50 text-blue-950 border-blue-200'
                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                    }`}>
                                      {m.estatus}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                                    {m.calificacion > 0 ? m.calificacion.toFixed(1) : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}