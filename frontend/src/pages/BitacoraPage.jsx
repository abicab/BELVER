import React, { useState } from 'react';

// Registros de auditoría simulados en tiempo real
const INITIAL_LOGS = [
  {
    id: 1,
    eventoId: 'EVT-9041',
    timestamp: '2026-08-19 18:42:10',
    usuario: 'operador_cae_01',
    rol: 'Control Escolar (CAE)',
    modulo: 'CAE / Dictamen',
    accion: 'Aprobación de Expediente',
    detalle: 'Se validó expediente de María Fernanda Ruiz. Matrícula asignada: BEL2601001',
    ip: '192.168.10.45',
    nivel: 'Informativo',
  },
  {
    id: 2,
    eventoId: 'EVT-9040',
    timestamp: '2026-08-19 17:15:33',
    usuario: 'caja_finanzas',
    rol: 'Caja / Finanzas',
    modulo: 'Pagos',
    accion: 'Validación de Pago',
    detalle: 'Cotejo aprobado de comprobante REF-98421034 ($500.00) para alumno BEL2401089',
    ip: '192.168.10.12',
    nivel: 'Informativo',
  },
  {
    id: 3,
    eventoId: 'EVT-9039',
    timestamp: '2026-08-19 16:02:18',
    usuario: 'sistema_aspirante',
    rol: 'Público / Aspirante',
    modulo: 'Admisión',
    accion: 'Registro de Solicitud',
    detalle: 'Nuevo registro generado con folio BEL-2026-2180 (Modalidad: Equivalencia)',
    ip: '187.141.67.89',
    nivel: 'Informativo',
  },
  {
    id: 4,
    eventoId: 'EVT-9038',
    timestamp: '2026-08-19 14:30:05',
    usuario: 'operador_cae_02',
    rol: 'Control Escolar (CAE)',
    modulo: 'CAE / Dictamen',
    accion: 'Rechazo con Observación',
    detalle: 'Expediente FOL-1029 rechazado: "Certificado de secundaria ilegible".',
    ip: '192.168.10.48',
    nivel: 'Alerta',
  },
  {
    id: 5,
    eventoId: 'EVT-9037',
    timestamp: '2026-08-19 09:11:40',
    usuario: 'admin_general',
    rol: 'Administrador',
    modulo: 'Seguridad / Auth',
    accion: 'Intento de Acceso Fallido',
    detalle: '3 intentos fallidos de contraseña para usuario admin_general',
    ip: '201.120.45.19',
    nivel: 'Crítico',
  },
];

export default function BitacoraPage() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [filtroModulo, setFiltroModulo] = useState('Todos');
  const [filtroNivel, setFiltroNivel] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  // Filtrado de eventos
  const logsFiltrados = logs.filter((log) => {
    const coincideBusqueda =
      log.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.accion.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.detalle.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.eventoId.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.ip.includes(busqueda);

    const coincideModulo =
      filtroModulo === 'Todos' ? true : log.modulo.includes(filtroModulo);

    const coincideNivel =
      filtroNivel === 'Todos' ? true : log.nivel === filtroNivel;

    return coincideBusqueda && coincideModulo && coincideNivel;
  });

  const handleExportPDF = () => {
    alert('Generando reporte institucional de auditoría en formato PDF...');
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Encabezado Principal */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-900 text-white px-2.5 py-1 rounded-md">
              Panel Exclusivo del Administrador
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              Bitácora de Auditoría y Trazabilidad
            </h1>
            <p className="text-xs text-slate-500">
              Registro inmutable de operaciones, dictámenes y transacciones ejecutadas en el sistema BELVER.
            </p>
          </div>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-semibold transition self-start md:self-auto shadow-sm"
          >
            Exportar Reporte PDF
          </button>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por Evento, Usuario, Acción, IP o Detalle..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full md:w-96 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 shadow-sm"
          />

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-500">Módulo:</span>
            {['Todos', 'Admisión', 'CAE', 'Pagos', 'Seguridad'].map((mod) => (
              <button
                key={mod}
                onClick={() => setFiltroModulo(mod)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  filtroModulo === mod
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {mod}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block"></div>

            <span className="text-xs font-semibold text-slate-500">Nivel:</span>
            {['Todos', 'Informativo', 'Alerta', 'Crítico'].map((niv) => (
              <button
                key={niv}
                onClick={() => setFiltroNivel(niv)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  filtroNivel === niv
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {niv}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla de Eventos */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-4">ID Evento</th>
                  <th className="p-4">Fecha y Hora</th>
                  <th className="p-4">Usuario / Rol</th>
                  <th className="p-4">Módulo</th>
                  <th className="p-4">Acción Realizada</th>
                  <th className="p-4 text-center">Nivel</th>
                  <th className="p-4 text-right">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400 text-xs">
                      No se encontraron registros de auditoría con los criterios seleccionados.
                    </td>
                  </tr>
                ) : (
                  logsFiltrados.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-mono font-bold text-blue-950">{log.eventoId}</td>
                      <td className="p-4 font-mono text-slate-500">{log.timestamp}</td>
                      <td className="p-4">
                        <span className="font-medium text-slate-900">{log.usuario}</span>
                        <div className="text-[10px] text-slate-400">{log.rol}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {log.modulo}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-800">{log.accion}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          log.nivel === 'Informativo' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          log.nivel === 'Alerta' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {log.nivel}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-3 py-1 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 text-xs transition"
                        >
                          Ver Traza
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Detalle Técnico del Evento */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="font-bold text-xs">Inspección de Traza: {selectedLog.eventoId}</h3>
                <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <div className="p-6 space-y-4 text-xs text-slate-700">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Usuario</span>
                    <span className="font-bold text-slate-900">{selectedLog.usuario}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Rol</span>
                    <span className="font-semibold text-slate-800">{selectedLog.rol}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Módulo</span>
                    <span className="font-semibold text-slate-800">{selectedLog.modulo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Dirección IP</span>
                    <span className="font-mono font-bold text-slate-900">{selectedLog.ip}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Estampa de Tiempo</span>
                    <span className="font-mono text-slate-700">{selectedLog.timestamp}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                    Descripción Técnica del Evento
                  </h4>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-mono text-[11px]">
                    {selectedLog.detalle}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
                >
                  Cerrar
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}