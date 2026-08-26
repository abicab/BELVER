import React, { useState } from 'react';

// Ejemplo de datos provenientes del perfil del alumno en backend
const DEFAULT_STUDENT = {
  matricula: 'B26000002',
  curp: 'DOEC040112HDFRNR09',
  nombre: 'Carlos Eduardo',
  apellidos: 'Domínguez Solís',
  direccion: 'C. Juárez #45, Col. Centro, Coatepec, Veracruz. C.P. 91500',
  modalidadIngreso: 'Revalidación / Equivalencia', // O 'Ingreso Regular (Desde cero)'
  esRevalidante: true,
  planEstudiosNombre: 'Plan de Estudios Bachillerato General SEP (Acuerdo 442)',
};

const MATERIAS_CURSANDO = [
  { id: 1, codigo: 'MAT-201', nombre: 'Matemáticas II', creditos: 8, calificacion: 9.5 },
  { id: 2, codigo: 'QUI-201', nombre: 'Química II', creditos: 8, calificacion: 8.8 },
  { id: 3, codigo: 'TLR-201', nombre: 'Taller de Lectura y Redacción II', creditos: 6, calificacion: 9.0 },
];

const DOCUMENTOS_EXPEDIENTE = [
  { id: 'doc1', nombre: 'Acta de nacimiento certificada en original', subido: true, fecha: '2026-08-15', formato: 'PDF' },
  { id: 'doc2', nombre: 'Certificado de secundaria original y completo', subido: true, fecha: '2026-08-15', formato: 'PDF' },
  { id: 'doc3', nombre: 'CURP actualizada original', subido: true, fecha: '2026-08-16', formato: 'PDF' },
  { id: 'doc4', nombre: 'Credencial de elector (INE)', subido: true, fecha: '2026-08-16', formato: 'PDF' },
  { id: 'doc5', nombre: 'Boleta de equivalencia / revalidación de materias institucionales', subido: true, fecha: '2026-08-22', formato: 'PDF', esRevalidacion: true },
];

const KARDEX_PLAN_COMPLETO = [
  {
    semestre: '1° Semestre',
    materias: [
      { codigo: 'MAT-101', nombre: 'Matemáticas I', creditos: 8, calificacion: 8.5, estatus: 'Acreditada (Revalidación)' },
      { codigo: 'QUI-101', nombre: 'Química I', creditos: 8, calificacion: 9.0, estatus: 'Acreditada (Revalidación)' },
      { codigo: 'ETI-101', nombre: 'Ética y Valores I', creditos: 6, calificacion: 10.0, estatus: 'Acreditada (Revalidación)' },
    ],
  },
  {
    semestre: '2° Semestre (En Cursamiento)',
    materias: [
      { codigo: 'MAT-201', nombre: 'Matemáticas II', creditos: 8, calificacion: 9.5, estatus: 'Cursando' },
      { codigo: 'QUI-201', nombre: 'Química II', creditos: 8, calificacion: 8.8, estatus: 'Cursando' },
      { codigo: 'TLR-201', nombre: 'Taller de Lectura y Redacción II', creditos: 6, calificacion: 9.0, estatus: 'Cursando' },
    ],
  },
  {
    semestre: '3° Semestre (Pendiente por Cursar)',
    materias: [
      { codigo: 'HIS-301', nombre: 'Historia de México I', creditos: 6, calificacion: 0, estatus: 'Por Cursar' },
      { codigo: 'FIS-301', nombre: 'Física I', creditos: 8, calificacion: 0, estatus: 'Por Cursar' },
      { codigo: 'BIO-301', nombre: 'Biología I', creditos: 8, calificacion: 0, estatus: 'Por Cursar' },
    ],
  },
  {
    semestre: '4° Semestre (Permite hasta 4 materias)',
    materias: [
      { codigo: 'LIT-401', nombre: 'Literatura I', creditos: 6, calificacion: 0, estatus: 'Por Cursar' },
      { codigo: 'MAT-401', nombre: 'Matemáticas IV', creditos: 8, calificacion: 0, estatus: 'Por Cursar' },
      { codigo: 'SOC-401', nombre: 'Sociología I', creditos: 6, calificacion: 0, estatus: 'Por Cursar' },
      { codigo: 'INF-401', nombre: 'Informática Aplicada', creditos: 6, calificacion: 0, estatus: 'Por Cursar' },
    ],
  },
];

export default function AlumnoPage({ alumno = DEFAULT_STUDENT }) {
  const [activeTab, setActiveTab] = useState('inicio');

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Encabezado sin botón redundante */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-950 text-white px-2.5 py-1 rounded-md">
              Portal Oficial del Estudiante - BELVER
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              {alumno.nombre} {alumno.apellidos}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Matrícula: <strong className="text-slate-900">{alumno.matricula}</strong> | Modalidad: {alumno.modalidadIngreso}
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
                <p className="text-xs text-slate-500">Carga académica de 3 materias simultáneas.</p>
              </div>
              <span className="text-xs font-bold text-blue-950 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {MATERIAS_CURSANDO.length} Materias Registradas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MATERIAS_CURSANDO.map((materia) => (
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
                    <span className="text-2xl font-black text-slate-900 font-mono">{materia.calificacion.toFixed(1)}</span>
                  </div>
                </div>
              ))}
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
                <span className="font-bold text-slate-900 text-sm">{alumno.nombre} {alumno.apellidos}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">CURP</span>
                <span className="font-mono font-bold text-slate-800">{alumno.curp}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Matrícula BELVER</span>
                <span className="font-mono font-bold text-blue-950">{alumno.matricula}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Estatus de Ingreso</span>
                <span className="font-semibold text-amber-900">{alumno.modalidadIngreso}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 lg:col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Domicilio Particular</span>
                <span className="font-semibold text-slate-800">{alumno.direccion}</span>
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
              <p className="text-xs text-slate-500">Documentación de ingreso resguardada.</p>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {DOCUMENTOS_EXPEDIENTE.map((doc) => {
                const esBoletaNoAplica = doc.esRevalidacion && !alumno.esRevalidante;

                return (
                  <div key={doc.id} className="p-4 bg-white hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{esBoletaNoAplica ? '⚪' : '📄'}</span>
                      <div>
                        <span className="font-bold text-slate-900 block">{doc.nombre}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {esBoletaNoAplica ? 'No requiere equivalencia (Ingreso Regular desde cero)' : `Formato: ${doc.formato} • Subido el: ${doc.fecha}`}
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
                            onClick={() => alert(`Visualizando: ${doc.nombre}`)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition"
                          >
                            Visualizar
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

        {/* 4. KÁRDEX CON PLAN COMPLETO */}
        {activeTab === 'kardex' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">Historial Académico (Kárdex Plan Completo)</h2>
                <p className="text-xs text-slate-500">{alumno.planEstudiosNombre}</p>
              </div>
              <button
                onClick={() => alert('Descargando Kárdex en PDF...')}
                className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition shadow-xs self-start"
              >
                📥 Descargar Kárdex Oficial PDF
              </button>
            </div>

            <div className="space-y-6">
              {KARDEX_PLAN_COMPLETO.map((bloque, idx) => (
                <div key={idx} className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    {bloque.semestre}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
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
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}