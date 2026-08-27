import React, { useState } from 'react';

// Pagos iniciales simulados (enfocados solo en constancias y credenciales)
const INITIAL_PAGOS = [
  {
    id: 1,
    matricula: 'B26000001',
    aspirante: 'María Fernanda Ruiz Morales',
    concepto: 'Emisión de Credencial Escolar',
    monto: 150.00,
    referenciaBancaria: 'REF98234190',
    fechaPago: '2026-08-24',
    metodo: 'Archivo Bancario (Layout)',
    estatus: 'CONCILIADO'
  },
  {
    id: 2,
    matricula: 'B26000002',
    aspirante: 'Carlos Eduardo Domínguez',
    concepto: 'Constancia de Estudios con Calificaciones',
    monto: 85.00,
    referenciaBancaria: 'REF77341200',
    fechaPago: '2026-08-25',
    metodo: 'Captura Manual (Ventanilla)',
    estatus: 'CONCILIADO'
  }
];

const CONCEPTOS_COBRO = [
  'Emisión de Credencial Escolar',
  'Constancia de Estudios',
  'Duplicado de Certificado',
  'Examen Extraordinario / Regularización'
];

export default function PagosPage() {
  const [pagos, setPagos] = useState(INITIAL_PAGOS);
  const [filtroConcepto, setFiltroConcepto] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');

  // Estado para el modal de Carga Masiva (Archivo del Banco)
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [archivoBanco, setArchivoBanco] = useState(null);
  const [logProcesamiento, setLogProcesamiento] = useState(null);

  // Estado para el modal de Captura Manual
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [formManual, setFormManual] = useState({
    matricula: '',
    aspirante: '',
    concepto: 'Emisión de Credencial Escolar',
    monto: '150.00',
    referenciaBancaria: '',
    fechaPago: new Date().toISOString().split('T')[0]
  });

  // Manejador para la subida y "traducción" del archivo del banco
  const handleProcesarLayout = (e) => {
    e.preventDefault();
    if (!archivoBanco) {
      alert('Por favor selecciona un archivo proporcionado por el banco (.txt o .csv).');
      return;
    }

    // Simulación de lectura y traducción del archivo bancario por el sistema
    // Aquí el backend lee los caracteres fijos o separados por comas del banco y genera los registros
    setTimeout(() => {
      const nuevosPagosSimulados = [
        {
          id: Date.now(),
          matricula: 'B26000005',
          aspirante: 'Diana Laura Pérez (Carga Bancaria)',
          concepto: 'Constancia de Estudios',
          monto: 85.00,
          referenciaBancaria: `BNK-${Math.floor(100000 + Math.random() * 900000)}`,
          fechaPago: new Date().toISOString().split('T')[0],
          metodo: 'Archivo Bancario (Layout)',
          estatus: 'CONCILIADO'
        }
      ];

      setPagos((prev) => [...nuevosPagosSimulados, ...prev]);
      setLogProcesamiento(`Archivo "${archivoBanco.name}" procesado con éxito. 1 pago traducido y conciliado automáticamente.`);
      setArchivoBanco(null);
    }, 600);
  };

  // Manejador para captura manual de pagos
  const handleGuardarManual = (e) => {
    e.preventDefault();
    if (!formManual.matricula || !formManual.aspirante || !formManual.referenciaBancaria) {
      alert('Completa todos los campos obligatorios para el registro manual.');
      return;
    }

    const nuevoPago = {
      id: Date.now(),
      matricula: formManual.matricula.trim().toUpperCase(),
      aspirante: formManual.aspirante.trim(),
      concepto: formManual.concepto,
      monto: parseFloat(formManual.monto),
      referenciaBancaria: formManual.referenciaBancaria.trim().toUpperCase(),
      fechaPago: formManual.fechaPago,
      metodo: 'Captura Manual (Ventanilla)',
      estatus: 'CONCILIADO'
    };

    setPagos((prev) => [nuevoPago, ...prev]);
    setIsManualOpen(false);
    setFormManual({
      matricula: '',
      aspirante: '',
      concepto: 'Emisión de Credencial Escolar',
      monto: '150.00',
      referenciaBancaria: '',
      fechaPago: new Date().toISOString().split('T')[0]
    });
    alert('Pago registrado y conciliado manualmente con éxito.');
  };

  // Filtrado de pagos
  const pagosFiltrados = pagos.filter((p) => {
    const matchText =
      p.aspirante.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.matricula.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.referenciaBancaria.toLowerCase().includes(busqueda.toLowerCase());

    const matchConcepto = filtroConcepto === 'TODOS' ? true : p.concepto === filtroConcepto;
    return matchText && matchConcepto;
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Encabezado */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-950 text-white px-2.5 py-1 rounded-md">
              Departamento de Finanzas y Servicios Escolares
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              Control de Pagos (Credenciales y Constancias)
            </h1>
            <p className="text-xs text-slate-500">
              Módulo exclusivo para trámites secundarios (sin cobro de inscripción por programa gratuito). Conciliación bancaria y captura manual.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setIsManualOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
            >
              ＋ Captura Manual
            </button>
            <button
              onClick={() => { setIsLayoutOpen(true); setLogProcesamiento(null); }}
              className="px-3.5 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-semibold transition shadow-sm flex items-center gap-1.5"
            >
              📂 Cargar Archivo Bancario (Layout)
            </button>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="relative w-full lg:w-96">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar por Matrícula, Alumno o Referencia..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs w-full lg:w-auto justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Concepto:</span>
            <select
              value={filtroConcepto}
              onChange={(e) => setFiltroConcepto(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold py-1 px-2.5 rounded-lg outline-none cursor-pointer"
            >
              <option value="TODOS">Todos los conceptos</option>
              {CONCEPTOS_COBRO.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla de Pagos Registrados */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Matrícula / Alumno</th>
                  <th className="p-4">Concepto de Cobro</th>
                  <th className="p-4">Referencia Bancaria</th>
                  <th className="p-4">Monto</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Método de Registro</th>
                  <th className="p-4 text-center">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400 text-xs">
                      No se encontraron registros de pagos.
                    </td>
                  </tr>
                ) : (
                  pagosFiltrados.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <span className="font-mono font-bold text-blue-950 block">{p.matricula}</span>
                        <span className="font-semibold text-slate-900">{p.aspirante}</span>
                      </td>
                      <td className="p-4 font-medium text-slate-800">{p.concepto}</td>
                      <td className="p-4 font-mono text-slate-600">{p.referenciaBancaria}</td>
                      <td className="p-4 font-mono font-bold text-emerald-700">${p.monto.toFixed(2)} MXN</td>
                      <td className="p-4 font-mono text-slate-500">{p.fechaPago}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.metodo.includes('Banco') ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {p.metodo}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.estatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL DE CARGA DE ARCHIVO BANCARIO (LAYOUT / TRADUCTOR) */}
        {isLayoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="font-bold text-xs">Traductor y Conciliador de Archivo Bancario (Layout)</h3>
                <button onClick={() => setIsLayoutOpen(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
              </div>

              <form onSubmit={handleProcesarLayout} className="p-6 space-y-4 text-xs">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 space-y-1">
                  <span className="font-bold block">💡 Instrucciones de Conciliación:</span>
                  <p>Sube el archivo de texto (.txt / .csv) enviado por la institución bancaria con los depósitos del día. El sistema traducirá automáticamente las referencias y liberará los trámites de constancias o credenciales.</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-700">Seleccionar Archivo del Banco</label>
                  <input
                    type="file"
                    accept=".txt,.csv"
                    onChange={(e) => setArchivoBanco(e.target.files[0])}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 border border-slate-300 rounded-lg p-1 bg-white"
                  />
                  {archivoBanco && <span className="text-[10px] text-slate-500 font-mono">Archivo listo: {archivoBanco.name}</span>}
                </div>

                {logProcesamiento && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold text-center">
                    {logProcesamiento}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsLayoutOpen(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md"
                  >
                    Procesar y Traducir Archivo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE CAPTURA MANUAL DE PAGO */}
        {isManualOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="font-bold text-xs">Registro Manual de Pago (Ventanilla)</h3>
                <button onClick={() => setIsManualOpen(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
              </div>

              <form onSubmit={handleGuardarManual} className="p-6 space-y-4 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Matrícula del Alumno</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. B26000001"
                    value={formManual.matricula}
                    onChange={(e) => setFormManual({ ...formManual, matricula: e.target.value })}
                    className="px-3 py-2 border rounded-lg uppercase font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Nombre Completo del Alumno</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre del alumno"
                    value={formManual.aspirante}
                    onChange={(e) => setFormManual({ ...formManual, aspirante: e.target.value })}
                    className="px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-700">Concepto</label>
                    <select
                      value={formManual.concepto}
                      onChange={(e) => setFormManual({ ...formManual, concepto: e.target.value })}
                      className="px-3 py-2 border rounded-lg bg-white"
                    >
                      {CONCEPTOS_COBRO.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-700">Monto ($ MXN)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formManual.monto}
                      onChange={(e) => setFormManual({ ...formManual, monto: e.target.value })}
                      className="px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Folio o Referencia Bancaria</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. REF12345678"
                    value={formManual.referenciaBancaria}
                    onChange={(e) => setFormManual({ ...formManual, referenciaBancaria: e.target.value })}
                    className="px-3 py-2 border rounded-lg uppercase font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsManualOpen(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md"
                  >
                    Guardar y Conciliar
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