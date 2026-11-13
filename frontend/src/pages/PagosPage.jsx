import React, { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:4000/api/pagos"; // Ajusta tu URL base si es necesario

const CONCEPTOS_COBRO = [
  "Emisión de Credencial Escolar",
  "Constancia de Estudios",
];

export default function PagosPage() {
  const [pagos, setPagos] = useState([]);
  const [busquedaEstudiante, setBusquedaEstudiante] = useState("");
  const [estudiantesFiltrados, setEstudiantesFiltrados] = useState([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [filtroConcepto, setFiltroConcepto] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");

  // Estados para modales
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [archivoBanco, setArchivoBanco] = useState(null);
  const [logProcesamiento, setLogProcesamiento] = useState(null);

  const [isManualOpen, setIsManualOpen] = useState(false);
  const [formManual, setFormManual] = useState({
    concepto: "Emisión de Credencial Escolar",
    monto: "150.00",
  });

  // 1. Cargar pagos recientes desde la base de datos al iniciar
  useEffect(() => {
    cargarPagosRecientes();
  }, []);

  const cargarPagosRecientes = async () => {
    try {
      const res = await fetch(API_BASE_URL);
      const data = await res.json();
      if (data.ok) {
        setPagos(data.data);
      }
    } catch (error) {
      console.error("Error al cargar historial de pagos:", error);
    }
  };

  // 2. Búsqueda de estudiantes en tiempo real contra la BD
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (busquedaEstudiante.trim() === "") {
        setEstudiantesFiltrados([]);
        return;
      }
      try {
        const res = await fetch(
          `${API_BASE_URL}/estudiantes?q=${encodeURIComponent(busquedaEstudiante)}`,
        );
        const data = await res.json();
        if (data.ok) {
          setEstudiantesFiltrados(data.data);
        }
      } catch (error) {
        console.error("Error al buscar estudiantes:", error);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [busquedaEstudiante]);

  // 3. Guardar pago manual en la BD
  const handleGuardarManual = async (e) => {
    e.preventDefault();
    if (!estudianteSeleccionado) {
      alert("Debe seleccionar un estudiante previamente.");
      return;
    }

    try {
      const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aspiranteId: estudianteSeleccionado.id,
          concepto: formManual.concepto,
          monto: parseFloat(formManual.monto),
          metodo: "Captura Manual (Ventanilla)",
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setPagos((prev) => [data.data, ...prev].slice(0, 5));
        setIsManualOpen(false);
        setFormManual({
          concepto: "Emisión de Credencial Escolar",
          monto: "150.00",
        });
        alert("Pago registrado y conciliado con éxito.");
      } else {
        alert(data.mensaje || "Error al registrar el pago.");
      }
    } catch (error) {
      console.error("Error en petición de pago manual:", error);
      alert("Error de conexión con el servidor.");
    }
  };

  // 4. Procesar Layout Bancario en la BD
  const handleProcesarLayout = async (e) => {
    e.preventDefault();
    if (!archivoBanco || !estudianteSeleccionado) {
      alert(
        "Seleccione un estudiante y un archivo bancario válido (.txt o .csv).",
      );
      return;
    }

    try {
      const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aspiranteId: estudianteSeleccionado.id,
          concepto: formManual.concepto,
          monto: parseFloat(formManual.monto) || 150.0,
          metodo: "Archivo Bancario (Layout)",
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setPagos((prev) => [data.data, ...prev].slice(0, 5));
        setLogProcesamiento(
          `Archivo "${archivoBanco.name}" procesado y vinculado correctamente.`,
        );
        setArchivoBanco(null);
      } else {
        alert(data.mensaje || "Error al procesar el layout.");
      }
    } catch (error) {
      console.error("Error en procesamiento de layout:", error);
      alert("Error de conexión con el servidor.");
    }
  };

  const pagosFiltrados = pagos.filter((p) => {
    const matchText =
      p.aspirante.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.matricula.toLowerCase().includes(busqueda.toLowerCase());
    const matchConcepto =
      filtroConcepto === "TODOS" ? true : p.concepto === filtroConcepto;
    return matchText && matchConcepto;
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Encabezado Principal */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-900 text-blue-50 px-3 py-1 rounded-md">
              Control Escolar - Finanzas
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1.5">
              Control de Pagos (Credenciales y Constancias)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestión de trámites secundarios con base de datos en tiempo real.
            </p>
          </div>
        </div>

        {/* SELECCIÓN Y ACCIONES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                1. Selección de Estudiante
              </h3>
              {estudianteSeleccionado && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  Alumno Activo
                </span>
              )}
            </div>

            {!estudianteSeleccionado ? (
              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    🔍
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar por Matrícula o Nombre en la Base de Datos..."
                    value={busquedaEstudiante}
                    onChange={(e) => setBusquedaEstudiante(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
                  />
                </div>

                {busquedaEstudiante.trim() !== "" && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 max-h-48 overflow-y-auto space-y-1">
                    {estudiantesFiltrados.length === 0 ? (
                      <p className="text-xs text-slate-400 p-3 text-center">
                        No se encontraron estudiantes en la base de datos.
                      </p>
                    ) : (
                      estudiantesFiltrados.map((est) => (
                        <div
                          key={est.id}
                          onClick={() => {
                            setEstudianteSeleccionado(est);
                            setBusquedaEstudiante("");
                            setEstudiantesFiltrados([]);
                          }}
                          className="p-3 hover:bg-white rounded-xl cursor-pointer flex justify-between items-center text-xs transition border border-transparent hover:border-slate-200 shadow-2xs"
                        >
                          <span className="font-mono font-bold text-blue-950">
                            {est.matricula}
                          </span>
                          <span className="font-semibold text-slate-800 uppercase">
                            {est.nombre}
                          </span>
                          <span className="text-[10px] bg-slate-900 text-white px-3 py-1 rounded-lg font-bold">
                            Seleccionar
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Alumno Vinculado
                  </span>
                  <span className="font-mono font-bold text-blue-950 text-sm">
                    {estudianteSeleccionado.matricula}
                  </span>
                  <p className="font-bold text-slate-800 text-xs uppercase">
                    {estudianteSeleccionado.nombre}
                  </p>
                </div>
                <button
                  onClick={() => setEstudianteSeleccionado(null)}
                  className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cambiar Alumno
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                2. Acciones de Cobro
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Se habilitan al seleccionar alumno.
              </p>
            </div>

            <div
              className={`space-y-2.5 transition-all ${!estudianteSeleccionado ? "opacity-40 pointer-events-none" : ""}`}
            >
              <button
                onClick={() => setIsManualOpen(true)}
                disabled={!estudianteSeleccionado}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>＋</span> Captura Manual (Ventanilla)
              </button>
              <button
                onClick={() => {
                  setIsLayoutOpen(true);
                  setLogProcesamiento(null);
                }}
                disabled={!estudianteSeleccionado}
                className="w-full py-3 bg-blue-950 hover:bg-blue-900 text-white rounded-2xl text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>📂</span> Cargar Archivo Bancario
              </button>
            </div>
          </div>
        </div>

        {/* TABLA E HISTORIAL */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Historial Reciente (Últimos 5 Registros)
              </h3>
              <p className="text-xs text-slate-500">
                Transacciones persistidas en MySQL.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Filtrar registros..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900"
              />

              <select
                value={filtroConcepto}
                onChange={(e) => setFiltroConcepto(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold py-2 px-3 rounded-xl outline-none cursor-pointer w-full sm:w-auto"
              >
                <option value="TODOS">Todos los conceptos</option>
                {CONCEPTOS_COBRO.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Matrícula / Alumno</th>
                  <th className="p-4">Concepto Oficial</th>
                  <th className="p-4">Monto</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Método</th>
                  <th className="p-4 text-center">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pagosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      No hay registros recientes de pagos.
                    </td>
                  </tr>
                ) : (
                  pagosFiltrados.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-900 block">
                          {p.matricula}
                        </span>
                        <span className="text-slate-500 uppercase">
                          {p.aspirante}
                        </span>
                      </td>
                      <td className="p-4 text-slate-800">{p.concepto}</td>
                      <td className="p-4 font-mono font-bold text-emerald-700">
                        ${p.monto.toFixed(2)} MXN
                      </td>
                      <td className="p-4 font-mono text-slate-500">
                        {p.fechaPago}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            p.metodo.includes("Banco")
                              ? "bg-indigo-50 text-indigo-800 border border-indigo-100"
                              : "bg-amber-50 text-amber-800 border border-amber-100"
                          }`}
                        >
                          {p.metodo}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
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

        {/* MODAL LAYOUT */}
        {isLayoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800 shrink-0">
                <div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    Conciliación Bancaria
                  </span>
                  <h3 className="text-sm font-black uppercase tracking-wider mt-0.5">
                    Carga de Layout
                  </h3>
                </div>
                <button
                  onClick={() => setIsLayoutOpen(false)}
                  className="w-8 h-8 bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleProcesarLayout}
                className="p-6 overflow-y-auto space-y-5 text-xs"
              >
                <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Estudiante Vinculado
                    </span>
                    <span className="font-mono font-bold text-blue-300 text-sm bg-slate-800 px-2.5 py-1 rounded-lg inline-block">
                      {estudianteSeleccionado?.matricula}
                    </span>
                    <p className="font-bold text-base uppercase tracking-wide mt-1">
                      {estudianteSeleccionado?.nombre}
                    </p>
                  </div>
                  <div className="w-2 h-12 bg-blue-500 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-700 uppercase text-[10px]">
                      Concepto Oficial
                    </label>
                    <select
                      value={formManual.concepto}
                      onChange={(e) =>
                        setFormManual({
                          ...formManual,
                          concepto: e.target.value,
                        })
                      }
                      className="px-3.5 py-3 border border-slate-300 rounded-xl bg-white font-semibold"
                    >
                      {CONCEPTOS_COBRO.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-700 uppercase text-[10px]">
                      Cantidad ($ MXN)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formManual.monto}
                      onChange={(e) =>
                        setFormManual({ ...formManual, monto: e.target.value })
                      }
                      className="px-3.5 py-3 border border-slate-300 rounded-xl font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 uppercase text-[10px]">
                    Seleccionar Archivo del Banco (.txt / .csv)
                  </label>
                  <input
                    type="file"
                    accept=".txt,.csv"
                    onChange={(e) => setArchivoBanco(e.target.files[0])}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:font-bold file:bg-slate-900 file:text-white border border-slate-300 rounded-xl p-1.5 bg-slate-50 cursor-pointer"
                  />
                  {archivoBanco && (
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                      Archivo seleccionado: {archivoBanco.name}
                    </span>
                  )}
                </div>

                {logProcesamiento && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-bold text-center">
                    {logProcesamiento}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsLayoutOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Procesar Layout
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL MANUAL */}
        {isManualOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800 shrink-0">
                <div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    Caja Escolar
                  </span>
                  <h3 className="text-sm font-black uppercase tracking-wider mt-0.5">
                    Registro Manual
                  </h3>
                </div>
                <button
                  onClick={() => setIsManualOpen(false)}
                  className="w-8 h-8 bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleGuardarManual}
                className="p-6 overflow-y-auto space-y-5 text-xs"
              >
                <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Estudiante Seleccionado
                    </span>
                    <span className="font-mono font-bold text-blue-300 text-sm bg-slate-800 px-2.5 py-1 rounded-lg inline-block">
                      {estudianteSeleccionado?.matricula}
                    </span>
                    <p className="font-bold text-base uppercase tracking-wide mt-1">
                      {estudianteSeleccionado?.nombre}
                    </p>
                  </div>
                  <div className="w-2 h-12 bg-blue-500 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-700 uppercase text-[10px]">
                      Concepto Oficial
                    </label>
                    <select
                      value={formManual.concepto}
                      onChange={(e) =>
                        setFormManual({
                          ...formManual,
                          concepto: e.target.value,
                        })
                      }
                      className="px-3.5 py-3 border border-slate-300 rounded-xl bg-white font-semibold"
                    >
                      {CONCEPTOS_COBRO.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-700 uppercase text-[10px]">
                      Monto ($ MXN)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formManual.monto}
                      onChange={(e) =>
                        setFormManual({ ...formManual, monto: e.target.value })
                      }
                      className="px-3.5 py-3 border border-slate-300 rounded-xl font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-[11px] flex justify-between items-center">
                  <span>Fecha de registro:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {new Date().toISOString().split("T")[0]} (Automática)
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsManualOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Guardar Pago
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
