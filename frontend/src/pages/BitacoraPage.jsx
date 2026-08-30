import React, { useState } from "react";

const INITIAL_LOGS = [
  {
    id: 1,
    eventoId: "LOG-8012",
    timestamp: "2026-08-26 08:30:15",
    usuario: "operador_cae_01",
    rol: "Control Escolar (CAE)",
    modulo: "Seguridad / Auth",
    accion: "Inicio de Sesión Exitoso",
    detalle:
      "El usuario inició sesión correctamente desde la interfaz administrativa.",
    ip: "192.168.10.45",
    nivel: "Informativo",
  },
  {
    id: 2,
    eventoId: "LOG-8011",
    timestamp: "2026-08-25 14:22:10",
    usuario: "operador_cae_01",
    rol: "Control Escolar (CAE)",
    modulo: "Control Escolar",
    accion: "Cambio de Estatus (Aprobado)",
    detalle:
      "Se aprobó el expediente BEL-2026-1001 de María Fernanda Ruiz y se generó matrícula oficial B26000001.",
    ip: "192.168.10.45",
    nivel: "Informativo",
  },
  {
    id: 3,
    eventoId: "LOG-8010",
    timestamp: "2026-08-25 11:05:40",
    usuario: "caja_finanzas",
    rol: "Caja / Finanzas",
    modulo: "Seguridad / Auth",
    accion: "Inicio de Sesión Exitoso",
    detalle:
      "El usuario inició sesión correctamente desde la interfaz administrativa.",
    ip: "192.168.10.12",
    nivel: "Informativo",
  },
  {
    id: 4,
    eventoId: "LOG-8009",
    timestamp: "2026-08-25 11:15:20",
    usuario: "caja_finanzas",
    rol: "Caja / Finanzas",
    modulo: "Pagos",
    accion: "Modificación / Registro de Pago",
    detalle:
      "Conciliación manual registrada por concepto de Constancia de Estudios ($85.00) para alumno B26000002.",
    ip: "192.168.10.12",
    nivel: "Informativo",
  },
  {
    id: 5,
    eventoId: "LOG-8008",
    timestamp: "2026-08-24 09:00:00",
    usuario: "admin_general",
    rol: "Administrador",
    modulo: "Seguridad / Auth",
    accion: "Intento de Acceso Fallido",
    detalle:
      "Fallo de autenticación: Contraseña incorrecta ingresada para la cuenta admin_general.",
    ip: "201.120.45.19",
    nivel: "Crítico",
  },
];

export default function BitacoraPage() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [filtroModulo, setFiltroModulo] = useState("Todos");
  const [filtroNivel, setFiltroNivel] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  const logsFiltrados = logs.filter((log) => {
    const coincideBusqueda =
      log.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.accion.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.detalle.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.eventoId.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.ip.includes(busqueda);

    const coincideModulo =
      filtroModulo === "Todos" ? true : log.modulo.includes(filtroModulo);

    const coincideNivel =
      filtroNivel === "Todos" ? true : log.nivel === filtroNivel;

    return coincideBusqueda && coincideModulo && coincideNivel;
  });

  const handleExportPDF = () => {
    alert(
      "Generando reporte institucional de auditoría (Inicios de sesión y cambios) en formato PDF...",
    );
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
              Bitácora de Inicios de Sesión y Cambios del Sistema
            </h1>
            <p className="text-xs text-slate-500">
              Registro inmutable enfocado estrictamente a auditoría de accesos
              (logins) y modificaciones operativas en BELVER.
            </p>
          </div>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition shadow-sm self-start md:self-auto"
          >
            Exportar Reporte PDF
          </button>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="relative w-full lg:w-96">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por Evento, Usuario, Acción, IP o Detalle..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto justify-end">
            {/* Filtro Desplegable de Módulo */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs w-full sm:w-auto justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-2">
                Módulo:
              </span>
              <select
                value={filtroModulo}
                onChange={(e) => setFiltroModulo(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold py-1 px-2.5 rounded-lg outline-none cursor-pointer"
              >
                <option value="Todos">Todos</option>
                <option value="Seguridad">Seguridad</option>
                <option value="Control Escolar">Control Escolar</option>
                <option value="Pagos">Pagos</option>
              </select>
            </div>

            {/* Filtro Desplegable de Nivel */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs w-full sm:w-auto justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-2">
                Nivel:
              </span>
              <select
                value={filtroNivel}
                onChange={(e) => setFiltroNivel(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold py-1 px-2.5 rounded-lg outline-none cursor-pointer"
              >
                <option value="Todos">Todos</option>
                <option value="Informativo">Informativo</option>
                <option value="Alerta">Alerta</option>
                <option value="Crítico">Crítico</option>
              </select>
            </div>
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
                    <td
                      colSpan="7"
                      className="p-8 text-center text-slate-400 text-xs"
                    >
                      No se encontraron registros de auditoría con los criterios
                      seleccionados.
                    </td>
                  </tr>
                ) : (
                  logsFiltrados.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-mono font-bold text-blue-950">
                        {log.eventoId}
                      </td>
                      <td className="p-4 font-mono text-slate-500">
                        {log.timestamp}
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-slate-900">
                          {log.usuario}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {log.rol}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {log.modulo}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-800">
                        {log.accion}
                      </td>

                      {/* Insignia de Nivel estática tradicional */}
                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            log.nivel === "Informativo"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : log.nivel === "Alerta"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {log.nivel}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center text-xs font-bold">
                <h3>Inspección de Traza: {selectedLog.eventoId}</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-slate-300 hover:text-white font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs text-slate-700">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Usuario
                    </span>
                    <span className="font-bold text-slate-900">
                      {selectedLog.usuario}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Rol
                    </span>
                    <span className="font-semibold text-slate-800">
                      {selectedLog.rol}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Módulo
                    </span>
                    <span className="font-semibold text-slate-800">
                      {selectedLog.modulo}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Dirección IP
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {selectedLog.ip}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Estampa de Tiempo
                    </span>
                    <span className="font-mono text-slate-700">
                      {selectedLog.timestamp}
                    </span>
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
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition"
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
