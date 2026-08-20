import React, { useState } from 'react';

const INITIAL_PAGOS = [
  {
    id: 1,
    folioPago: 'PAG-2026-001',
    matricula: 'BEL2401089',
    alumno: 'Alejandro Morales Mendoza',
    concepto: 'Cuota de Recuperación / Semestre',
    monto: '$500.00',
    referenciaBancaria: 'REF-98421034',
    fecha: '2026-08-18',
    estatus: 'Validado',
    comprobanteArchivo: 'comprobante_morales.pdf'
  },
  {
    id: 2,
    folioPago: 'PAG-2026-002',
    matricula: 'BEL2601001',
    alumno: 'Ana Karen López García',
    concepto: 'Inscripción Nuevo Ingreso',
    monto: '$650.00',
    referenciaBancaria: 'REF-11209384',
    fecha: '2026-08-18',
    estatus: 'Pendiente',
    comprobanteArchivo: 'ficha_deposito_karen.pdf'
  },
  {
    id: 3,
    folioPago: 'PAG-2026-003',
    matricula: 'BEL2502014',
    alumno: 'Sofía Valenzuela Herrera',
    concepto: 'Examen Extraordinario',
    monto: '$200.00',
    referenciaBancaria: 'REF-55443322',
    fecha: '2026-08-17',
    estatus: 'Pendiente',
    comprobanteArchivo: 'transferencia_sofia.pdf'
  }
];

export default function PagosPage() {
  const [pagos, setPagos] = useState(INITIAL_PAGOS);
  const [filtroEstatus, setFiltroEstatus] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [mensajeExito, setMensajeExito] = useState(null);

  // Formulario para nuevo registro manual
  const [showModalRegistro, setShowModalRegistro] = useState(false);
  const [nuevoPago, setNuevoPago] = useState({
    matricula: '',
    alumno: '',
    concepto: 'Inscripción Nuevo Ingreso',
    monto: '',
    referenciaBancaria: '',
  });

  // Filtrado
  const pagosFiltrados = pagos.filter((p) => {
    const coincideBusqueda =
      p.matricula.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.alumno.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.folioPago.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.referenciaBancaria.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstatus =
      filtroEstatus === 'Todos' ? true : p.estatus === filtroEstatus;

    return coincideBusqueda && coincideEstatus;
  });

  // Validar Pago
  const handleValidarPago = (id) => {
    setPagos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, estatus: 'Validado' } : item
      )
    );
    setMensajeExito('Pago validado y cotejado correctamente.');
    setTimeout(() => setMensajeExito(null), 4000);
  };

  // Rechazar Pago
  const handleRechazarPago = (id) => {
    setPagos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, estatus: 'Rechazado' } : item
      )
    );
    setMensajeExito('Pago marcado como Rechazado para aclaración con el alumno.');
    setTimeout(() => setMensajeExito(null), 4000);
  };

  // Registrar nuevo pago
  const handleGuardarNuevoPago = (e) => {
    e.preventDefault();
    if (!nuevoPago.matricula || !nuevoPago.alumno || !nuevoPago.monto) {
      alert('Por favor completa los campos requeridos.');
      return;
    }

    const nuevoRegistro = {
      id: Date.now(),
      folioPago: `PAG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      matricula: nuevoPago.matricula.toUpperCase(),
      alumno: nuevoPago.alumno,
      concepto: nuevoPago.concepto,
      monto: `$${nuevoPago.monto}`,
      referenciaBancaria: nuevoPago.referenciaBancaria || 'N/A',
      fecha: new Date().toISOString().split('T')[0],
      estatus: 'Validado',
      comprobanteArchivo: 'registro_manual.pdf'
    };

    setPagos([nuevoRegistro, ...pagos]);
    setShowModalRegistro(false);
    setNuevoPago({ matricula: '', alumno: '', concepto: 'Inscripción Nuevo Ingreso', monto: '', referenciaBancaria: '' });
    setMensajeExito('Pago registrado y validado en el sistema.');
    setTimeout(() => setMensajeExito(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Encabezado */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-900 px-2.5 py-1 rounded-md">
              Módulo de Finanzas y Control
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Registro y Cotejo de Pagos
            </h1>
            <p className="text-xs text-slate-500">
              Validación interna de comprobantes de pago por trámites y cuotas de recuperación.
            </p>
          </div>

          <button
            onClick={() => setShowModalRegistro(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition self-start md:self-auto"
          >
            + Registrar Pago Manual
          </button>
        </div>

        {/* Mensaje de Éxito */}
        {mensajeExito && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex justify-between items-center shadow-sm">
            <span>✓ {mensajeExito}</span>
            <button onClick={() => setMensajeExito(null)} className="font-bold ml-2">✕</button>
          </div>
        )}

        {/* Barra de Filtros y Búsqueda */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por Matrícula, Alumno, Folio o Referencia..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full sm:w-96 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-slate-800"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500">Estatus:</span>
            {['Todos', 'Pendiente', 'Validado', 'Rechazado'].map((st) => (
              <button
                key={st}
                onClick={() => setFiltroEstatus(st)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  filtroEstatus === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla de Pagos */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Folio Pago</th>
                  <th className="p-4">Matrícula / Alumno</th>
                  <th className="p-4">Concepto</th>
                  <th className="p-4">Referencia</th>
                  <th className="p-4">Monto</th>
                  <th className="p-4 text-center">Estatus</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400 text-xs">
                      No se encontraron registros de pago.
                    </td>
                  </tr>
                ) : (
                  pagosFiltrados.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-mono font-bold text-blue-950">{item.folioPago}</td>
                      <td className="p-4 font-medium text-slate-900">
                        {item.alumno}
                        <div className="text-[11px] text-slate-400 font-mono">{item.matricula}</div>
                      </td>
                      <td className="p-4 text-slate-700">{item.concepto}</td>
                      <td className="p-4 font-mono text-slate-500">{item.referenciaBancaria}</td>
                      <td className="p-4 font-bold text-slate-900">{item.monto}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.estatus === 'Pendiente' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          item.estatus === 'Validado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {item.estatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {item.estatus === 'Pendiente' ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleRechazarPago(item.id)}
                              className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold transition"
                            >
                              Rechazar
                            </button>
                            <button
                              onClick={() => handleValidarPago(item.id)}
                              className="px-3 py-1 bg-blue-900 text-white hover:bg-blue-800 rounded-lg text-xs font-semibold transition"
                            >
                              Validar
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Procesado</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal para Registro Manual de Pago */}
        {showModalRegistro && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="font-bold text-xs">Captura Manual de Comprobante</h3>
                <button onClick={() => setShowModalRegistro(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <form onSubmit={handleGuardarNuevoPago} className="p-6 space-y-4 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Matrícula del Alumno</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. BEL2401089"
                    value={nuevoPago.matricula}
                    onChange={(e) => setNuevoPago({ ...nuevoPago, matricula: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800 uppercase"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Nombre del Alumno</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre completo"
                    value={nuevoPago.alumno}
                    onChange={(e) => setNuevoPago({ ...nuevoPago, alumno: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-700">Concepto</label>
                    <select
                      value={nuevoPago.concepto}
                      onChange={(e) => setNuevoPago({ ...nuevoPago, concepto: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-slate-800"
                    >
                      <option value="Inscripción Nuevo Ingreso">Inscripción Nuevo Ingreso</option>
                      <option value="Cuota Semestral">Cuota Semestral</option>
                      <option value="Examen Extraordinario">Examen Extraordinario</option>
                      <option value="Constancia de Estudios">Constancia de Estudios</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-700">Monto ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="500.00"
                      value={nuevoPago.monto}
                      onChange={(e) => setNuevoPago({ ...nuevoPago, monto: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Referencia Bancaria / Folio</label>
                  <input
                    type="text"
                    placeholder="Ej. REF-998877"
                    value={nuevoPago.referenciaBancaria}
                    onChange={(e) => setNuevoPago({ ...nuevoPago, referenciaBancaria: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModalRegistro(false)}
                    className="px-4 py-2 text-slate-600 text-xs font-semibold hover:bg-slate-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 rounded-lg"
                  >
                    Guardar y Validar
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