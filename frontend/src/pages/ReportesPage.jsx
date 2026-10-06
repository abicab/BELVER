import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function ReportesPage() {
  const [datosReporte, setDatosReporte] = useState([]);
  const [modalidadFiltro, setModalidadFiltro] = useState("TODOS");
  const [estatusFiltro, setEstatusFiltro] = useState("TODOS");
  const [cargando, setCargando] = useState(false);

  const cargarDatosReporte = async () => {
    setCargando(true);
    try {
      const res = await fetch(
        `http://localhost:4000/api/controlescolar/aspirantes?estatus=TODOS`,
      );
      const resultado = await res.json();
      if (res.ok && resultado.ok) {
        setDatosReporte(resultado.data || []);
      }
    } catch (error) {
      console.error("Error al cargar datos para reporte:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosReporte();
  }, []);

  // Filtrado de datos para el reporte
  const datosFiltrados = datosReporte.filter((item) => {
    const cumpleModalidad =
      modalidadFiltro === "TODOS" || item.tipoAdmision === modalidadFiltro;
    const cumpleEstatus =
      estatusFiltro === "TODOS" ||
      (estatusFiltro === "ALUMNOS" && item.matricula) ||
      (estatusFiltro === "ASPIRANTES" && !item.matricula);
    return cumpleModalidad && cumpleEstatus;
  });

  // Función para exportar a Excel
  const exportarAExcel = () => {
    if (datosFiltrados.length === 0) {
      alert("No hay datos para exportar con los filtros seleccionados.");
      return;
    }

    const datosExcel = datosFiltrados.map((item, index) => ({
      "No.": index + 1,
      Folio: item.folio,
      Matrícula: item.matricula || "PENDIENTE",
      "Apellido Paterno": item.apellidoPaterno,
      "Apellido Materno": item.apellidoMaterno || "",
      Nombres: item.nombres,
      CURP: item.curp,
      Modalidad: item.tipoAdmision.toUpperCase(),
      "Correo Electrónico": item.correoElectronico1,
      "Teléfono Celular": item.telefonoCelular,
      "Escuela Procedencia": item.nombreEscuelaProcedencia || "N/A",
      "Fecha de Registro": new Date(item.creadoEn).toLocaleDateString(),
    }));

    const hojaTrabajo = XLSX.utils.json_to_sheet(datosExcel);
    const libroTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroTrabajo, hojaTrabajo, "Reporte_BELVER");

    XLSX.writeFile(
      libroTrabajo,
      `Reporte_Institucional_BELVER_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-950 text-white px-2.5 py-1 rounded-md">
              Módulo de Inteligencia y Reportes
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              Generación y Descarga de Reportes Institucionales
            </h1>
            <p className="text-xs text-slate-500">
              Filtra el padrón de aspirantes y alumnos para exportar la
              información directamente a formato Excel.
            </p>
          </div>
          <button
            onClick={exportarAExcel}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2"
          >
            📊 Descargar Reporte en Excel
          </button>
        </div>

        {/* Filtros de Reporte */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase">
              Filtrar por Modalidad
            </label>
            <select
              value={modalidadFiltro}
              onChange={(e) => setModalidadFiltro(e.target.value)}
              className="p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold"
            >
              <option value="TODOS">Todas las modalidades</option>
              <option value="nuevo_ingreso">Nuevo Ingreso</option>
              <option value="revalidacion">Revalidación</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 uppercase">
              Filtrar por Estatus de Padrón
            </label>
            <select
              value={estatusFiltro}
              onChange={(e) => setEstatusFiltro(e.target.value)}
              className="p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold"
            >
              <option value="TODOS">Todos (Aspirantes y Alumnos)</option>
              <option value="ASPIRANTES">
                Solo Aspirantes (Sin Matrícula)
              </option>
              <option value="ALUMNOS">
                Solo Alumnos Activos (Con Matrícula)
              </option>
            </select>
          </div>
        </div>

        {/* Vista previa de la tabla de reporte */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
            <span>
              Vista Previa de Registros ({datosFiltrados.length} encontrados)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Folio</th>
                  <th className="p-3">Matrícula</th>
                  <th className="p-3">Nombre Completo</th>
                  <th className="p-3">CURP</th>
                  <th className="p-3">Modalidad</th>
                  <th className="p-3">Correo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cargando ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-400">
                      Cargando datos para el reporte...
                    </td>
                  </tr>
                ) : datosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-400">
                      No hay registros que coincidan con los filtros
                      seleccionados.
                    </td>
                  </tr>
                ) : (
                  datosFiltrados.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-950">
                        {item.folio}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-800">
                        {item.matricula || "—"}
                      </td>
                      <td className="p-3 font-semibold">{`${item.apellidoPaterno} ${item.apellidoMaterno || ""} ${item.nombres}`}</td>
                      <td className="p-3 font-mono text-slate-500">
                        {item.curp}
                      </td>
                      <td className="p-3 uppercase text-[10px] font-bold">
                        {item.tipoAdmision}
                      </td>
                      <td className="p-3 text-slate-600">
                        {item.correoElectronico1}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
