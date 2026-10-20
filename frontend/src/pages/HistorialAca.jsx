import React, { useState, useEffect } from 'react';

const API_HISTORIAL_URL = "http://localhost:4000/api/historial";

export default function HistorialAca() {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Submenú: 'revalidacion' primero o 'todos'
  const [pestanaActiva, setPestanaActiva] = useState('revalidacion');

  // Filtro de búsqueda
  const [busqueda, setBusqueda] = useState('');

  // Estados del Modal y Asignación
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [planes, setPlanes] = useState([]);
  const [planSeleccionado, setPlanSeleccionado] = useState('');
  const [materiasDelPlan, setMateriasDelPlan] = useState([]);

  const [guardando, setGuardando] = useState(false);
  const [modalError, setModalError] = useState('');

  // Estructura: { [materiaId]: { seleccionada: boolean, calificacion: string|number, tipoExamen: string } }
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState({});

  // 1. Cargar alumnos desde el servidor según la pestaña activa
  const fetchAlumnos = async (tipo = 'revalidacion') => {
    try {
      setLoading(true);
      setErrorMsg('');
      const url = tipo === 'revalidacion' 
        ? `${API_HISTORIAL_URL}/alumnos?tipo=revalidacion` 
        : `${API_HISTORIAL_URL}/alumnos`;
      
      const res = await fetch(url);
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
    fetchAlumnos(pestanaActiva);
    fetchPlanes();
  }, [pestanaActiva]);

  // 3. Abrir modal validando si cuenta con matrícula
  const handleOpenAssignModal = async (alumno) => {
    // REGLA: Los alumnos de nuevo ingreso sin matrícula no pueden recibir planes de estudio
    if (!alumno.matricula) {
      setErrorMsg(`El alumno ${alumno.nombres} es de nuevo ingreso y aún no cuenta con matrícula generada. No se le puede asignar historial.`);
      return;
    }

    setSelectedAlumno(alumno);
    setModalError('');
    setPlanSeleccionado('');
    setMateriasDelPlan([]);
    setMateriasSeleccionadas({});

    try {
      const res = await fetch(`${API_HISTORIAL_URL}/alumno/${alumno.id}`);
      const historial = res.ok ? await res.json() : [];

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

      const seleccionInicial = {};
      planObj.materias.forEach((m) => {
        const reg = historial.find((h) => h.materiaId === m.id);
        if (reg) {
          seleccionInicial[m.id] = {
            seleccionada: true,
            calificacion: reg.calificacion ?? '',
            tipoExamen: reg.tipoExamen || 'F',
          };
        }
      });
      setMateriasSeleccionadas(seleccionInicial);
    } else {
      setMateriasDelPlan([]);
    }
  };

  // 5. Manejar casillas, notas enteras (5-10) y tipo de examen
  const handleToggleMateria = (materiaId) => {
    setMateriasSeleccionadas((prev) => {
      const actual = prev[materiaId] || { seleccionada: false, calificacion: '', tipoExamen: 'F' };
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
    let num = val === '' ? '' : Math.max(5, Math.min(10, parseInt(val, 10) || 5));
    setMateriasSeleccionadas((prev) => {
      const actual = prev[materiaId] || { seleccionada: true, calificacion: '', tipoExamen: 'F' };
      return {
        ...prev,
        [materiaId]: {
          ...actual,
          calificacion: num,
          seleccionada: true,
        },
      };
    });
  };

  const handleTipoExamenChange = (materiaId, val) => {
    setMateriasSeleccionadas((prev) => {
      const actual = prev[materiaId] || { seleccionada: true, calificacion: '', tipoExamen: 'F' };
      return {
        ...prev,
        [materiaId]: {
          ...actual,
          tipoExamen: val,
          seleccionada: true,
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
        tipoExamen: item.tipoExamen || 'F',
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
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Error al guardar el historial académico');
      }

      setSelectedAlumno(null);
      await fetchAlumnos(pestanaActiva);
    } catch (err) {
      console.error('Error al guardar asignación:', err);
      setModalError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  // Filtro de búsqueda y limitación estricta a los primeros 20 registros
  const alumnosFiltrados = alumnos.filter((a) => {
    const query = busqueda.toLowerCase();
    const nombreCompleto = `${a.nombres} ${a.apellidoPaterno} ${a.apellidoMaterno || ''}`.toLowerCase();
    const mat = (a.matricula || '').toLowerCase();
    const fol = (a.folio || '').toLowerCase();
    return nombreCompleto.includes(query) || mat.includes(query) || fol.includes(query);
  }).slice(0, 20);

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
              Gestión de Historial Académico
            </h1>
            <p className="text-xs text-slate-500">
              Asignación de planes de estudio, carga de materias y registro de calificaciones oficiales (enteros de 5 a 10).
            </p>
          </div>

          {/* Submenú de pestañas con Revalidación primero */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-2xs self-start md:self-auto">
            {[
              { id: 'revalidacion', label: 'Alumnos Revalidación' },
              { id: 'todos', label: 'Todos los Alumnos' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPestanaActiva(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  pestanaActiva === tab.id
                    ? 'bg-[#0f172a] text-white shadow-sm scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex justify-between items-center">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="font-bold text-red-900 ml-2">✕</button>
          </div>
        )}

        {/* Barra de Búsqueda */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="relative w-full lg:w-96">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por Nombre, Matrícula o Folio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAlumnos(pestanaActiva)}
              className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>

        {/* Tabla de Alumnos */}
        {loading ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center text-xs text-slate-500 font-semibold">
            Cargando registros (primeros 20)...
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Matrícula / Folio</th>
                    <th className="p-4">Nombre del Alumno</th>
                    <th className="p-4">Tipo Admisión</th>
                    <th className="p-4">Plan Asignado</th>
                    <th className="p-4 text-center">Estatus</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {alumnosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400 text-xs">
                        No se encontraron alumnos registrados en esta categoría.
                      </td>
                    </tr>
                  ) : (
                    alumnosFiltrados.map((al) => {
                      const tieneMatricula = Boolean(al.matricula);

                      return (
                        <tr key={al.id} className="hover:bg-slate-50 transition">
                          <td className="p-4 font-mono font-bold text-blue-950">
                            {al.matricula || <span className="text-amber-600 font-sans text-[10px] font-semibold">Sin matrícula ({al.folio})</span>}
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-slate-900 block">
                              {`${al.nombres} ${al.apellidoPaterno} ${al.apellidoMaterno || ''}`}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 font-medium uppercase">
                            {al.tipoAdmision}
                          </td>
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
                            {tieneMatricula ? (
                              <button
                                onClick={() => handleOpenAssignModal(al)}
                                className="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-white rounded-lg font-semibold text-xs transition inline-block shadow-2xs"
                              >
                                📝 Asignar / Historial
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic bg-slate-100 px-2 py-1 rounded border border-slate-200" title="Requiere matrícula para cargar materias">
                                🔒 Requiere Matrícula
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: Asignación y Calificaciones */}
        {selectedAlumno && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col my-8">
              
              <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex justify-between items-center shrink-0 border-b border-slate-800">
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-white">
                    Asignación de Historial Académico
                  </h3>
                  <p className="text-xs text-slate-200 mt-1">
                    Alumno: <span className="font-bold text-white">{selectedAlumno.nombres} {selectedAlumno.apellidoPaterno}</span> ({selectedAlumno.matricula})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAlumno(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5 text-xs overflow-y-auto flex-1 bg-slate-50/50">
                {modalError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 font-semibold rounded-lg">
                    {modalError}
                  </div>
                )}

                {/* Configuración de Plan (Fecha automática en BD) */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-800 uppercase text-[10px]">
                      1. Selecciona el Plan de Estudios
                    </label>
                    <select
                      value={planSeleccionado}
                      onChange={(e) => handleSelectPlan(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-semibold text-slate-800"
                    >
                      <option value="">-- Selecciona un plan --</option>
                      {planes.map((p) => (
                        <option key={p.id} value={p.clave}>
                          {p.nombre} ({p.clave})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selección de Materias, Calificaciones (5-10) y Tipo de Examen */}
                {planSeleccionado && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 uppercase text-[11px] border-b pb-1">
                      2. Selecciona materias, tipo de examen y calificación (Enteros de 5 a 10):
                    </h4>

                    {materiasDelPlan.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 border border-dashed rounded-xl bg-white">
                        Este plan no tiene materias configuradas.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6].map((sem) => {
                          const materiasSem = materiasDelPlan.filter((m) => m.semestre === sem);
                          if (materiasSem.length === 0) return null;

                          return (
                            <div key={sem} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                              <div className="bg-slate-900 text-white px-4 py-2 font-bold text-[10px] uppercase tracking-wider">
                                {sem}° Semestre
                              </div>
                              <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                {materiasSem.map((mat) => {
                                  const infoSel = materiasSeleccionadas[mat.id] || {
                                    seleccionada: false,
                                    calificacion: '',
                                    tipoExamen: 'F',
                                  };

                                  return (
                                    <div
                                      key={mat.id}
                                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                                        infoSel.seleccionada
                                          ? 'bg-blue-50/60 border-blue-300'
                                          : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
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

                                      {/* Controles de Calificación y Tipo de Examen */}
                                      <div className="flex items-center gap-2 shrink-0">
                                        <select
                                          value={infoSel.tipoExamen}
                                          onChange={(e) => handleTipoExamenChange(mat.id, e.target.value)}
                                          className="px-1.5 py-1 border border-slate-300 rounded-lg bg-white text-[11px] font-bold text-slate-700 outline-none shadow-2xs"
                                          title="Tipo de Examen"
                                        >
                                          <option value="F">Ord (F)</option>
                                          <option value="R">Reg (R)</option>
                                          <option value="E">Ext (E)</option>
                                          <option value="EQ">Equiv (EQ)</option>
                                        </select>

                                        <input
                                          type="number"
                                          min="5"
                                          max="10"
                                          step="1"
                                          placeholder="5-10"
                                          value={infoSel.calificacion}
                                          onChange={(e) => handleCalificacionChange(mat.id, e.target.value)}
                                          className="w-16 text-center px-2 py-1 border border-slate-300 rounded-lg bg-white font-mono font-bold text-slate-900 outline-none shadow-2xs"
                                          title="Calificación entera de 5 a 10 (5 es reprobatoria)"
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

              <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedAlumno(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition shadow-2xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveHistorial}
                  disabled={guardando || !planSeleccionado}
                  className={`px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-bold transition shadow-md ${
                    guardando || !planSeleccionado
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-emerald-800'
                  }`}
                >
                  {guardando ? 'Guardando...' : '✓ Confirmar Asignación'}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}