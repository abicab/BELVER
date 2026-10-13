import React, { useState, useEffect } from 'react';

const API_HISTORIAL_URL = "http://localhost:4000/api/historial";

export default function HistorialAca() {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtros de búsqueda
  const [busqueda, setBusqueda] = useState('');

  // Estados del Modal y Asignación
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [planes, setPlanes] = useState([]);
  const [planSeleccionado, setPlanSeleccionado] = useState('');
  const [materiasDelPlan, setMateriasDelPlan] = useState([]);
  const [periodo, setPeriodo] = useState('2024-2025');
  const [guardando, setGuardando] = useState(false);
  const [modalError, setModalError] = useState('');

  // Estructura: { [materiaId]: { seleccionada: boolean, calificacion: string|number } }
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState({});

  // 1. Cargar alumnos desde el servidor
  const fetchAlumnos = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch(`${API_HISTORIAL_URL}/alumnos`);
      if (!res.ok) throw new Error('Error al conectar con el servidor para obtener alumnos');
      const data = await res.json();
      setAlumnos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar alumnos:', err);
      setErrorMsg('No se pudo conectar con el servidor de historial en http://localhost:4000.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Cargar planes de estudio activos
  const fetchPlanes = async () => {
    try {
      const res = await fetch(`${API_HISTORIAL_URL}/planes`);
      if (!res.ok) throw new Error('Error al obtener planes de estudio');
      const data = await res.json();
      setPlanes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar planes de estudio:', err);
    }
  };

  useEffect(() => {
    fetchAlumnos();
    fetchPlanes();
  }, []);

  // 3. Abrir modal y cargar historial previo del alumno
  const handleOpenAssignModal = async (alumno) => {
    setSelectedAlumno(alumno);
    setModalError('');
    setPlanSeleccionado('');
    setMateriasDelPlan([]);
    setMateriasSeleccionadas({});

    try {
      const res = await fetch(`${API_HISTORIAL_URL}/alumno/${alumno.id}`);
      const historial = res.ok ? await res.json() : [];

      // Si el alumno ya tiene un plan registrado, lo pre-seleccionamos
      if (alumno.planEstudios) {
        const planExistente = planes.find((p) => p.clave === alumno.planEstudios);
        if (planExistente) {
          handleSelectPlan(planExistente.clave, historial);
        }
      }
    } catch (err) {
      console.error('Error al obtener historial previo:', err);
    }
  };

  // 4. Seleccionar plan de estudios y poblar materias
  const handleSelectPlan = (clavePlan, historial = []) => {
    setPlanSeleccionado(clavePlan);
    const planObj = planes.find((p) => p.clave === clavePlan);

    if (planObj && planObj.materias) {
      setMateriasDelPlan(planObj.materias);

      // Mapear materias que ya tenían registro en historial
      const seleccionInicial = {};
      planObj.materias.forEach((m) => {
        const reg = historial.find((h) => h.materiaId === m.id);
        if (reg) {
          seleccionInicial[m.id] = {
            seleccionada: true,
            calificacion: reg.calificacion ?? '',
          };
        }
      });
      setMateriasSeleccionadas(seleccionInicial);
    } else {
      setMateriasDelPlan([]);
    }
  };

  // 5. Manejar casillas y notas por materia
  const handleToggleMateria = (materiaId) => {
    setMateriasSeleccionadas((prev) => {
      const actual = prev[materiaId] || { seleccionada: false, calificacion: '' };
      return {
        ...prev,
        [materiaId]: {
          ...actual,
          seleccionada: !actual.seleccionada,
        },
      };
    });
  };

  const handleCalificacionChange = (materiaId, val) => {
    setMateriasSeleccionadas((prev) => {
      const actual = prev[materiaId] || { seleccionada: true, calificacion: '' };
      return {
        ...prev,
        [materiaId]: {
          ...actual,
          calificacion: val,
          seleccionada: true, // Se marca automáticamente si ingresa una calificación
        },
      };
    });
  };

  // 6. Confirmar y guardar asignación
  const handleSaveHistorial = async () => {
    if (!selectedAlumno) return;

    const materiasAEnviar = Object.entries(materiasSeleccionadas)
      .filter(([_, item]) => item.seleccionada)
      .map(([materiaId, item]) => ({
        materiaId: Number(materiaId),
        calificacion: item.calificacion !== '' ? Number(item.calificacion) : null,
        tipoExamen: 'F',
      }));

    if (materiasAEnviar.length === 0) {
      setModalError('Debes seleccionar al menos una materia para asignar.');
      return;
    }

    try {
      setGuardando(true);
      setModalError('');

      const res = await fetch(`${API_HISTORIAL_URL}/asignar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aspiranteId: selectedAlumno.id,
          planEstudioClave: planSeleccionado,
          materiasAsignadas: materiasAEnviar,
          periodo,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Error al guardar el historial académico');
      }

      setSelectedAlumno(null);
      await fetchAlumnos();
    } catch (err) {
      console.error('Error al guardar asignación:', err);
      setModalError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  // Filtro dinámico de la lista
  const alumnosFiltrados = alumnos.filter((a) => {
    const query = busqueda.toLowerCase();
    const nombreCompleto = `${a.nombres} ${a.apellidoPaterno} ${a.apellidoMaterno || ''}`.toLowerCase();
    const mat = (a.matricula || '').toLowerCase();
    const fol = (a.folio || '').toLowerCase();
    return nombreCompleto.includes(query) || mat.includes(query) || fol.includes(query);
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Encabezado Principal */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-900 text-white px-2.5 py-1 rounded-md">
              Control Escolar / Calificaciones
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              Gestión de Historial Académico
            </h1>
            <p className="text-xs text-slate-500">
              Asigna planes de estudio, carga materias por semestre y registra las calificaciones oficiales de los alumnos.
            </p>
          </div>
        </div>

        {/* Mensaje de Error General */}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {/* Filtro de Búsqueda */}
        <div className="flex justify-between items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por Nombre, Matrícula o Folio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full md:w-80 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 shadow-sm"
          />
        </div>

        {/* Tabla de Alumnos / Estado de Carga */}
        {loading ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center text-xs text-slate-500 font-semibold">
            Cargando expediente de alumnos...
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Matrícula / Folio</th>
                    <th className="p-4">Nombre del Alumno</th>
                    <th className="p-4">CURP</th>
                    <th className="p-4">Plan Asignado</th>
                    <th className="p-4 text-center">Estatus</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {alumnosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400 text-xs">
                        No se encontraron alumnos registrados.
                      </td>
                    </tr>
                  ) : (
                    alumnosFiltrados.map((al) => (
                      <tr key={al.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-mono font-bold text-blue-950">
                          {al.matricula || al.folio}
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-900 block">
                            {`${al.nombres} ${al.apellidoPaterno} ${al.apellidoMaterno || ''}`}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-500">{al.curp}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {al.planEstudios || 'Sin Asignar'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ● {al.estatusAcademico || 'Activo'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleOpenAssignModal(al)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-lg transition shadow-xs"
                          >
                            📝 Asignar / Historial
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: Asignar Plan, Materias y Calificaciones */}
        {selectedAlumno && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
              
              {/* Header Modal */}
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-xs">Asignación de Materias y Calificaciones</h3>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    Alumno: <span className="font-bold text-white">{selectedAlumno.nombres} {selectedAlumno.apellidoPaterno}</span> ({selectedAlumno.matricula || selectedAlumno.folio})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAlumno(null)}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Contenido Modal */}
              <div className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
                {modalError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 font-semibold rounded-lg">
                    {modalError}
                  </div>
                )}

                {/* Paso 1: Selección de Plan y Periodo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-800 uppercase text-[10px]">
                      1. Seleccionar Plan de Estudios
                    </label>
                    <select
                      value={planSeleccionado}
                      onChange={(e) => handleSelectPlan(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none font-semibold text-slate-800"
                    >
                      <option value="">-- Selecciona un plan de estudios --</option>
                      {planes.map((p) => (
                        <option key={p.id} value={p.clave}>
                          {p.nombre} ({p.clave})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-800 uppercase text-[10px]">
                      Periodo Lectivo
                    </label>
                    <input
                      type="text"
                      value={periodo}
                      onChange={(e) => setPeriodo(e.target.value)}
                      placeholder="Ej. 2024-2025"
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Paso 2: Selección de Materias y Captura de Notas */}
                {planSeleccionado && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-800 uppercase text-[10px]">
                      2. Selecciona las materias a asignar e ingresa su calificación:
                    </h4>

                    {materiasDelPlan.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 border border-dashed rounded-xl">
                        Este plan de estudios no tiene materias configuradas.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6].map((sem) => {
                          const materiasSem = materiasDelPlan.filter((m) => m.semestre === sem);
                          if (materiasSem.length === 0) return null;

                          return (
                            <div key={sem} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                              <div className="bg-slate-900 text-white px-4 py-2 font-bold text-[10px] uppercase tracking-wider">
                                {sem}° Semestre
                              </div>
                              <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/50">
                                {materiasSem.map((mat) => {
                                  const infoSel = materiasSeleccionadas[mat.id] || {
                                    seleccionada: false,
                                    calificacion: '',
                                  };

                                  return (
                                    <div
                                      key={mat.id}
                                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                                        infoSel.seleccionada
                                          ? 'bg-blue-50/60 border-blue-300'
                                          : 'bg-white border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 overflow-hidden">
                                        <input
                                          type="checkbox"
                                          checked={infoSel.seleccionada}
                                          onChange={() => handleToggleMateria(mat.id)}
                                          className="h-4 w-4 text-slate-900 rounded border-slate-300 focus:ring-slate-800 cursor-pointer"
                                        />
                                        <div className="truncate">
                                          <p className="font-bold text-slate-900 text-xs truncate">
                                            {mat.nombreCompleto}
                                          </p>
                                          <p className="text-[10px] text-slate-400 font-mono">
                                            Cód: {mat.codigo}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Entrada de Calificación */}
                                      <div className="w-24 shrink-0">
                                        <input
                                          type="number"
                                          min="0"
                                          max="10"
                                          step="0.1"
                                          placeholder="Calif (0-10)"
                                          value={infoSel.calificacion}
                                          onChange={(e) => handleCalificacionChange(mat.id, e.target.value)}
                                          className="w-full text-center px-2 py-1 border border-slate-300 rounded-lg bg-white font-mono font-bold text-slate-900 focus:ring-2 focus:ring-slate-800 outline-none"
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pie del Modal */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAlumno(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveHistorial}
                  disabled={guardando || !planSeleccionado}
                  className={`px-5 py-2 bg-slate-900 text-white rounded-xl font-bold transition shadow-md ${
                    guardando || !planSeleccionado
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-slate-800'
                  }`}
                >
                  {guardando ? 'Guardando...' : 'Confirmar Asignación'}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}