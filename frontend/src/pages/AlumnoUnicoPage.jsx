import React from 'react';

const MATERIAS_ALUMNO_UNICO = [
  { id: 1, codigo: 'MAT-201', nombre: 'Matemáticas II', creditos: 8, calificacion: 9.5 },
  { id: 2, codigo: 'QUI-201', nombre: 'Química II', creditos: 8, calificacion: 8.8 },
  { id: 3, codigo: 'TLR-201', nombre: 'Taller de Lectura y Redacción II', creditos: 6, calificacion: 9.0 },
  { id: 4, codigo: 'ING-201', nombre: 'Inglés II', creditos: 6, calificacion: 10.0 },
];

export default function AlumnoUnicoPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Encabezado */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-950 text-white px-2.5 py-1 rounded-md">
            Vista Alumno Único
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">
            Control de Materias en Cursamiento
          </h1>
          <p className="text-xs text-slate-500">
            Consulta rápida del avance de asignaturas correspondientes al periodo lectivo vigente.
          </p>
        </div>

        {/* Vista de Materias */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MATERIAS_ALUMNO_UNICO.map((materia) => (
            <div key={materia.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  {materia.codigo}
                </span>
                <h3 className="text-base font-bold text-slate-900">{materia.nombre}</h3>
                <p className="text-xs text-slate-500">Valor curricular: <strong>{materia.creditos} Créditos</strong></p>
              </div>

              <div className="text-right border-l border-slate-100 pl-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Calificación</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{materia.calificacion.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}