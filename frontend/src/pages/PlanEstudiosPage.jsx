import React, { useState, useEffect } from 'react';

export default function PlanEstudiosPage({ userRole = 'ADMIN' }) {
  const [planes, setPlanes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [pasoModal, setPasoModal] = useState(1); // 1: Datos y Materias, 2: Seriación

  // Estado del formulario de nuevo plan
  const [formData, setFormData] = useState({
    clave: '',
    nombre: '',
    descripcion: ''
  });

  // Estado del formulario de materias
  const [materiasForm, setMateriasForm] = useState([
    { codigo: '', nombreCompleto: '', nombreCorto: '', semestre: 1 }
  ]);

  // Estado para la seriación interactiva (materia -> requiere código de otra materia)
  const [seriacionesForm, setSeriacionesForm] = useState([
    { codigoMateria: '', codigoPrerrequisito: '' }
  ]);

  const esAdministrador = userRole === 'ADMIN';

  const fetchPlanes = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/planes");
      if (!res.ok) throw new Error('Error al conectar con el servidor');
      const data = await res.json();
      setPlanes(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Error consultando la API:", err);
      setErrorMsg("No se pudieron cargar los planes de estudio. Revisa la conexión.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanes();
  }, []);

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

  // Gestión de Seriación en el Modal
  const handleAddSeriacionField = () => {
    setSeriacionesForm([...seriacionesForm, { codigoMateria: '', codigoPrerrequisito: '' }]);
  };

  const handleSeriacionChange = (index, field, value) => {
    const updated = [...seriacionesForm];
    updated[index][field] = value;
    setSeriacionesForm(updated);
  };

  const handleRemoveSeriacionField = (index) => {
    setSeriacionesForm(seriacionesForm.filter((_, i) => i !== index));
  };

  // Guardar nuevo plan con materias y seriación todo en uno (Solo se ejecuta al dar clic en el botón final)
  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const payload = {
        ...formData,
        materias: materiasForm,
        seriaciones: seriacionesForm.filter(s => s.codigoMateria && s.codigoPrerrequisito)
      };

      const res = await fetch("http://localhost:4000/api/planes", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al guardar el plan de estudios');
      }

      await fetchPlanes();
      setIsModalOpen(false);
      setPasoModal(1);
      setFormData({ clave: '', nombre: '', descripcion: '' });
      setMateriasForm([{ codigo: '', nombreCompleto: '', nombreCorto: '', semestre: 1 }]);
      setSeriacionesForm([{ codigoMateria: '', codigoPrerrequisito: '' }]);
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
              Malla curricular oficial con asignación y seriación integrada.
            </p>
          </div>

          {esAdministrador && (
            <button
              onClick={() => { setIsModalOpen(true); setPasoModal(1); }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-md self-start md:self-auto"
            >
              + Agregar Nuevo Plan (Todo en Uno)
            </button>
          )}
        </div>

        {errorMsg && !isModalOpen && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {/* Lista de Planes */}
        {loading ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center text-xs text-slate-500 font-semibold">
            Cargando planes de estudio...
          </div>
        ) : (
          <div className="space-y-6">
            {planes.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center text-xs text-slate-500">
                No hay planes de estudio registrados.
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {plan.activo ? 'Vigente' : 'Inactivo'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{plan.descripcion}</p>

                  <button
                    onClick={() => setPlanSeleccionado(planSeleccionado === plan.id ? null : plan.id)}
                    className="text-xs font-bold text-blue-950 hover:underline flex items-center gap-1 pt-2"
                  >
                    {planSeleccionado === plan.id ? '▲ Ocultar Malla' : `▼ Ver Materias (${plan.materias?.length || 0})`}
                  </button>

                  {planSeleccionado === plan.id && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                      <h3 className="text-xs font-bold text-slate-900 uppercase">Estructura Curricular</h3>
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
                            {plan.materias?.map((mat) => (
                              <tr key={mat.id || mat.codigo} className="hover:bg-slate-50">
                                <td className="p-2.5 font-mono font-bold text-slate-800">{mat.codigo}</td>
                                <td className="p-2.5 font-semibold text-slate-900">{mat.nombreCompleto}</td>
                                <td className="p-2.5 text-slate-600">{mat.nombreCorto}</td>
                                <td className="p-2.5 font-bold text-blue-950">{mat.semestre}° Sem.</td>
                              </tr>
                            ))}
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

        {/* Modal Interactivo Todo en Uno (Datos, Materias y Seriación) */}
        {isModalOpen && esAdministrador && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
              
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
                <h3 className="font-bold text-xs">Alta Integral de Plan de Estudios y Seriación</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
              </div>

              {/* Pestañas de Navegación del Modal */}
              <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setPasoModal(1)}
                  className={`pb-2 text-xs font-bold border-b-2 transition ${pasoModal === 1 ? 'border-blue-950 text-blue-950' : 'border-transparent text-slate-500'}`}
                >
                  1. Datos del Plan y Asignaturas
                </button>
                <button
                  type="button"
                  onClick={() => setPasoModal(2)}
                  className={`pb-2 text-xs font-bold border-b-2 transition ${pasoModal === 2 ? 'border-blue-950 text-blue-950' : 'border-transparent text-slate-500'}`}
                >
                  2. Seriación de Materias (Prerrequisitos)
                </button>
              </div>

              {/* Contenedor del Formulario con scroll independiente */}
              <form onSubmit={handleCreatePlan} className="p-6 space-y-5 text-xs text-slate-700 overflow-y-auto flex-1">
                {errorMsg && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 font-semibold rounded-lg">
                    {errorMsg}
                  </div>
                )}

                {pasoModal === 1 ? (
                  <div className="space-y-4">
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
                        <label className="font-semibold text-slate-800">Nombre Oficial</label>
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
                      <label className="font-semibold text-slate-800">Descripción</label>
                      <textarea
                        rows={2}
                        placeholder="Descripción del plan..."
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        className="px-3 py-2 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>

                    <div className="border-t border-slate-200 pt-4 space-y-3">
                      {/* Cabecera interna fija con el botón de agregar materia para evitar scrollear hasta arriba */}
                      <div className="sticky top-0 z-10 bg-white py-2 flex justify-between items-center border-b border-slate-100 shadow-xs">
                        <h4 className="font-bold text-slate-900 uppercase">Asignaturas del Plan</h4>
                        <button
                          type="button"
                          onClick={handleAddMateriaField}
                          className="px-3 py-1.5 bg-blue-950 text-white text-[11px] font-bold rounded-lg hover:bg-blue-900 transition shadow-xs"
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
                              <button type="button" onClick={() => handleRemoveMateriaField(index)} className="text-red-600 font-bold">✕</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="sticky top-0 z-10 bg-white py-2 flex justify-between items-center border-b border-slate-100 shadow-xs">
                      <div>
                        <h4 className="font-bold text-slate-900 uppercase">Configurar Seriación de Materias</h4>
                        <p className="text-[11px] text-slate-500">Selecciona o escribe los códigos de las materias que requieren un prerrequisito previo.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSeriacionField}
                        className="px-3 py-1.5 bg-blue-950 text-white text-[11px] font-bold rounded-lg hover:bg-blue-900 transition shadow-xs"
                      >
                        + Agregar Seriación
                      </button>
                    </div>

                    <div className="space-y-2 pt-1">
                      {seriacionesForm.map((ser, index) => (
                        <div key={index} className="grid grid-cols-12 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 items-center">
                          <div className="col-span-5 flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-600">Materia a Cursar</label>
                            <select
                              value={ser.codigoMateria}
                              onChange={(e) => handleSeriacionChange(index, 'codigoMateria', e.target.value)}
                              className="px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-[11px]"
                            >
                              <option value="">-- Seleccionar Materia --</option>
                              {materiasForm.filter(m => m.codigo).map(m => (
                                <option key={m.codigo} value={m.codigo}>{m.codigo} - {m.nombreCorto || m.nombreCompleto}</option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-2 text-center font-bold text-slate-400 pt-4">
                            REQUIERE ➔
                          </div>

                          <div className="col-span-4 flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-600">Materia Prerrequisito</label>
                            <select
                              value={ser.codigoPrerrequisito}
                              onChange={(e) => handleSeriacionChange(index, 'codigoPrerrequisito', e.target.value)}
                              className="px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-[11px]"
                            >
                              <option value="">-- Seleccionar Prerrequisito --</option>
                              {materiasForm.filter(m => m.codigo).map(m => (
                                <option key={m.codigo} value={m.codigo}>{m.codigo} - {m.nombreCorto || m.nombreCompleto}</option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-1 text-center pt-4">
                            <button type="button" onClick={() => handleRemoveSeriacionField(index)} className="text-red-600 font-bold">✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


<div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 -mx-6 -mb-6 mt-4 shrink-0">
  <button
    type="button"
    onClick={() => setIsModalOpen(false)}
    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs transition"
  >
    Cancelar
  </button>

  <button
    type="submit"
    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs transition shadow-md"
  >
    ✓ Guardar Plan, Materias y Seriación
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
