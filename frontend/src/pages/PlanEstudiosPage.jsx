import React, { useState, useEffect } from 'react';

export default function PlanEstudiosPage({ userRole = 'ADMIN' }) {
  const [planes, setPlanes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Estado del formulario de nuevo plan (actualizado sin acuerdoSep ni totalCreditos)
  const [formData, setFormData] = useState({
    clave: '',
    nombre: '',
    descripcion: ''
  });

  // Estado del formulario de materias con los campos correctos de la BD
  const [materiasForm, setMateriasForm] = useState([
    { codigo: '', nombreCompleto: '', nombreCorto: '', semestre: 1 }
  ]);

  const esAdministrador = userRole === 'ADMIN';

  // 1. Cargar planes de estudio desde la API
  const fetchPlanes = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/planes");
      if (!res.ok) throw new Error('Error al conectar con el servidor');
      const data = await res.json();
      
      console.log("Respuesta recibida del backend:", data);

      setPlanes(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Error consultando la API:", err);
      setErrorMsg("No se pudieron cargar los planes de estudio. Revisa la conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanes();
  }, []);

  // Funciones de gestión dinámica de materias en el modal
  const handleAddMateriaField = () => {
    setMateriasForm([...materiasForm, { codigo: '', nombreCompleto: '', nombreCorto: '', semestre: 1 }]);
  };

  const handleMateriaChange = (index, field, value) => {
    const updated = [...materiasForm];
    updated[index][field] = field === 'semestre' ? Number(value) : value;
    setMateriasForm(updated);
  };

  const handleRemoveMateriaField = (index) => {
    if (materiasForm.length === 1) return;
    setMateriasForm(materiasForm.filter((_, i) => i !== index));
  };

  // Guardar nuevo plan en backend
  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await fetch("http://localhost:4000/api/planes", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, materias: materiasForm })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al guardar el plan de estudios');
      }

      await fetchPlanes();
      setIsModalOpen(false);
      setFormData({ clave: '', nombre: '', descripcion: '' });
      setMateriasForm([{ codigo: '', nombreCompleto: '', nombreCorto: '', semestre: 1 }]);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Encabezado Principal */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-950 text-white px-2.5 py-1 rounded-md">
              Gestión Curricular Institucional (BELVER)
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              Planes de Estudio
            </h1>
            <p className="text-xs text-slate-500">
              Malla curricular oficial incorporada a la Secretaría de Educación de Veracruz y SEP.
            </p>
          </div>

          {/* Botón exclusivo para administradores */}
          {esAdministrador && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-md self-start md:self-auto"
            >
              + Agregar Nuevo Plan
            </button>
          )}
        </div>

        {/* Mensaje de error general si falla la API */}
        {errorMsg && !isModalOpen && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {/* Estado de carga */}
        {loading ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center text-xs text-slate-500 font-semibold">
            Cargando planes de estudio desde el servidor...
          </div>
        ) : (
          /* Lista de Planes de Estudio */
          <div className="space-y-6">
            {planes.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center text-xs text-slate-500">
                No hay planes de estudio registrados en la base de datos.
              </div>
            ) : (
              planes.map((plan) => (
                <div key={plan.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <span className="font-mono font-bold text-xs text-blue-950 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        {plan.clave}
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 mt-1">{plan.nombre}</h2>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                        {plan.activo ? 'Vigente' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">{plan.descripcion}</p>

                  <div className="pt-2">
                    <button
                      onClick={() => setPlanSeleccionado(planSeleccionado === plan.id ? null : plan.id)}
                      className="text-xs font-bold text-blue-950 hover:underline flex items-center gap-1"
                    >
                      {planSeleccionado === plan.id
                        ? '▲ Ocultar Malla Curricular'
                        : `▼ Ver Materias del Plan (${plan.materias?.length || 0})`}
                    </button>
                  </div>

                  {/* Tabla del Plan de Estudios */}
                  {planSeleccionado === plan.id && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                      <h3 className="text-xs font-bold text-slate-900 uppercase">Estructura Curricular por Semestre</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-2.5">Código</th>
                              <th className="p-2.5">Nombre Completo</th>
                              <th className="p-2.5">Nombre Corto</th>
                              <th className="p-2.5">Semestre</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {plan.materias && plan.materias.length > 0 ? (
                              plan.materias.map((mat) => (
                                <tr key={mat.id || mat.codigo} className="hover:bg-slate-50">
                                  <td className="p-2.5 font-mono font-bold text-slate-800">{mat.codigo}</td>
                                  <td className="p-2.5 font-semibold text-slate-900">{mat.nombreCompleto}</td>
                                  <td className="p-2.5 text-slate-600">{mat.nombreCorto}</td>
                                  <td className="p-2.5 font-bold text-blue-950">{mat.semestre}° Semestre</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="p-4 text-center text-slate-400">
                                  No hay materias registradas para este plan.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal Completo de Alta de Plan */}
        {isModalOpen && esAdministrador && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="font-bold text-xs">Alta de Nuevo Plan de Estudios</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
              </div>

              <form onSubmit={handleCreatePlan} className="p-6 space-y-5 text-xs text-slate-700 overflow-y-auto">
                {errorMsg && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 font-semibold rounded-lg">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">Clave del Plan</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. BG-BELVER-2026"
                      value={formData.clave}
                      onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">Nombre Oficial del Plan</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Bachillerato General Mixto Especializado"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-800">Descripción / Enfoque Curricular</label>
                  <textarea
                    rows={2}
                    placeholder="Descripción del modelo educativo..."
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                {/* Sub-apartado de Materias Dinámicas */}
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <div className="sticky top-0 z-10 bg-white py-2 flex justify-between items-center border-b border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-900 uppercase">Asignaturas Integrantes del Plan</h4>
                    <button
                      type="button"
                      onClick={handleAddMateriaField}
                      className="px-3 py-1.5 bg-blue-950 text-white text-[11px] font-bold rounded-lg hover:bg-blue-900 transition shadow-sm"
                    >
                      + Agregar Materia
                    </button>
                  </div>

                  <div className="space-y-2 pt-1">
                    {materiasForm.map((mat, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 items-center">
                        <div className="col-span-2">
                          <input
                            type="text"
                            required
                            placeholder="Código"
                            value={mat.codigo}
                            onChange={(e) => handleMateriaChange(index, 'codigo', e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg font-mono text-[11px]"
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="text"
                            required
                            placeholder="Nombre Completo"
                            value={mat.nombreCompleto}
                            onChange={(e) => handleMateriaChange(index, 'nombreCompleto', e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-[11px]"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            required
                            placeholder="Nombre Corto"
                            value={mat.nombreCorto}
                            onChange={(e) => handleMateriaChange(index, 'nombreCorto', e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-[11px]"
                          />
                        </div>
                        <div className="col-span-2">
                          <select
                            value={mat.semestre}
                            onChange={(e) => handleMateriaChange(index, 'semestre', e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-[11px]"
                          >
                            {[1, 2, 3, 4, 5, 6].map((s) => (
                              <option key={s} value={s}>{s}° Sem.</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveMateriaField(index)}
                            className="text-red-600 font-bold hover:text-red-800"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 -mx-6 -mb-6 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition shadow-md"
                  >
                    Guardar Plan y Materias
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}