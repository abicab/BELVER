import React, { useState } from 'react';

const INITIAL_PLANES_SEP = [
  {
    id: 1,
    clave: 'BG-SEP-2024',
    nombre: 'Plan de Estudios Bachillerato General SEP (Acuerdo 442)',
    acuerdoSep: 'Acuerdo Secretarial 442 / DGB 2024',
    vigencia: 'Vigente (2024 - 2028)',
    totalCreditos: 180,
    descripcion: 'Marco Curricular Común de la Educación Media Superior (MCCEMS) adaptado a la modalidad virtual de BELVER.',
    materias: [
      { codigo: 'MAT-101', nombre: 'Matemáticas I', semestre: 1, creditos: 8 },
      { codigo: 'QUI-101', nombre: 'Química I', semestre: 1, creditos: 8 },
      { codigo: 'ETI-101', nombre: 'Ética y Valores I', semestre: 1, creditos: 6 },
      { codigo: 'MAT-201', nombre: 'Matemáticas II', semestre: 2, creditos: 8 },
      { codigo: 'QUI-201', nombre: 'Química II', semestre: 2, creditos: 8 },
      { codigo: 'TLR-201', nombre: 'Taller de Lectura y Redacción II', semestre: 2, creditos: 6 },
      { codigo: 'ING-201', nombre: 'Inglés II', semestre: 2, creditos: 6 },
      { codigo: 'HIS-301', nombre: 'Historia de México I', semestre: 3, creditos: 6 },
      { codigo: 'FIS-301', nombre: 'Física I', semestre: 3, creditos: 8 },
      { codigo: 'BIO-301', nombre: 'Biología I', semestre: 3, creditos: 8 },
      { codigo: 'LIT-401', nombre: 'Literatura I', semestre: 4, creditos: 6 },
      { codigo: 'MAT-401', nombre: 'Matemáticas IV', semestre: 4, creditos: 8 },
      { codigo: 'SOC-401', nombre: 'Sociología I', semestre: 4, creditos: 6 },
      { codigo: 'INF-401', nombre: 'Informática Aplicada', semestre: 4, creditos: 6 },
    ]
  }
];

export default function PlanEstudiosPage({ userRole = 'CONTROL_ESCOLAR' }) {
  const [planes, setPlanes] = useState(INITIAL_PLANES_SEP);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);

  // Formulario de nuevo plan
  const [formData, setFormData] = useState({
    clave: '',
    nombre: '',
    acuerdoSep: '',
    totalCreditos: '',
    descripcion: ''
  });

  const [materiasForm, setMateriasForm] = useState([
    { codigo: '', nombre: '', semestre: 1, creditos: 6 }
  ]);

  // Solo el rol ADMIN puede crear planes de estudio
  const esAdministrador = userRole === 'ADMIN';

  const handleAddMateriaField = () => {
    setMateriasForm([...materiasForm, { codigo: '', nombre: '', semestre: 1, creditos: 6 }]);
  };

  const handleMateriaChange = (index, field, value) => {
    const updated = [...materiasForm];
    updated[index][field] = field === 'semestre' || field === 'creditos' ? Number(value) : value;
    setMateriasForm(updated);
  };

  const handleRemoveMateriaField = (index) => {
    if (materiasForm.length === 1) return;
    setMateriasForm(materiasForm.filter((_, i) => i !== index));
  };

  const handleCreatePlan = (e) => {
    e.preventDefault();
    const newPlan = {
      id: Date.now(),
      clave: formData.clave,
      nombre: formData.nombre,
      acuerdoSep: formData.acuerdoSep,
      vigencia: 'Vigente (Reciente)',
      totalCreditos: Number(formData.totalCreditos),
      descripcion: formData.descripcion,
      materias: materiasForm
    };

    setPlanes([newPlan, ...planes]);
    setIsModalOpen(false);
    setFormData({ clave: '', nombre: '', acuerdoSep: '', totalCreditos: '', descripcion: '' });
    setMateriasForm([{ codigo: '', nombre: '', semestre: 1, creditos: 6 }]);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Encabezado */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-950 text-white px-2.5 py-1 rounded-md">
              Gestión Curricular Institucional (BELVER)
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              Planes de Estudio SEP
            </h1>
            <p className="text-xs text-slate-500">
              Malla curricular oficial incorporada a la Secretaría de Educación de Veracruz y SEP.
            </p>
          </div>

          {/* Acción condicional visible únicamente para administradores */}
          {esAdministrador && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-md self-start md:self-auto"
            >
              + Agregar Nuevo Plan
            </button>
          )}
        </div>

        {/* Lista de Planes de Estudio */}
        <div className="space-y-6">
          {planes.map((plan) => (
            <div key={plan.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="font-mono font-bold text-xs text-blue-950 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    {plan.clave}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">{plan.nombre}</h2>
                  <p className="text-xs text-slate-400 font-semibold">{plan.acuerdoSep}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                    {plan.vigencia}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Total: <strong>{plan.totalCreditos} Créditos SATCA</strong></p>
                </div>
              </div>

              <p className="text-xs text-slate-600">{plan.descripcion}</p>

              <div className="pt-2">
                <button
                  onClick={() => setPlanSeleccionado(planSeleccionado === plan.id ? null : plan.id)}
                  className="text-xs font-bold text-blue-950 hover:underline flex items-center gap-1"
                >
                  {planSeleccionado === plan.id ? '▲ Ocultar Malla Curricular' : `▼ Ver Materias del Plan (${plan.materias.length})`}
                </button>
              </div>

              {planSeleccionado === plan.id && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase">Estructura Curricular por Semestre</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Código</th>
                          <th className="p-2.5">Asignatura</th>
                          <th className="p-2.5">Semestre Sugerido</th>
                          <th className="p-2.5 text-right">Créditos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {plan.materias.map((mat, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono font-bold text-slate-800">{mat.codigo}</td>
                            <td className="p-2.5 font-semibold text-slate-900">{mat.nombre}</td>
                            <td className="p-2.5">{mat.semestre}° Semestre</td>
                            <td className="p-2.5 text-right font-mono font-bold text-slate-800">{mat.creditos}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal de Alta de Plan */}
        {isModalOpen && esAdministrador && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="font-bold text-xs">Alta de Nuevo Plan de Estudios</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
              </div>

              <form onSubmit={handleCreatePlan} className="p-6 space-y-5 text-xs text-slate-700 overflow-y-auto">
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
                    <label className="font-semibold text-slate-800">Acuerdo / RVOE SEP</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Acuerdo SEV-2026"
                      value={formData.acuerdoSep}
                      onChange={(e) => setFormData({ ...formData, acuerdoSep: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 flex flex-col gap-1">
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
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">Total Créditos</label>
                    <input
                      type="number"
                      required
                      placeholder="180"
                      value={formData.totalCreditos}
                      onChange={(e) => setFormData({ ...formData, totalCreditos: e.target.value })}
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

                {/* Sub-apartado de Materias */}
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  {/* Encabezado pegajoso (sticky) al hacer scroll dentro del modal */}
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
                        <div className="col-span-5">
                          <input
                            type="text"
                            required
                            placeholder="Nombre de la Materia"
                            value={mat.nombre}
                            onChange={(e) => handleMateriaChange(index, 'nombre', e.target.value)}
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
                        <div className="col-span-2">
                          <input
                            type="number"
                            required
                            placeholder="Créditos"
                            value={mat.creditos}
                            onChange={(e) => handleMateriaChange(index, 'creditos', e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-[11px]"
                          />
                        </div>
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveMateriaField(index)}
                            className="text-red-600 font-bold"
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