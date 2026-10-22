import React, { useState, useEffect } from "react";

export default function CicloPage({ branding }) {
  const [ciclos, setCiclos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idSeleccionado, setIdSeleccionado] = useState(null);

  const [formData, setFormData] = useState({
    clave: "",
    claveIntersemestral: "",
    inicia: "",
    iniciaIntersemestral: "",
    termina: "",
    terminaIntersemestral: "",
    activo: 1,
    fechaConformarExpediente: "",
    fechaConformarExpEdInter: "",
    ultimoFolio: "",
    ultimoFolioInter: "",
    inicioCurso: "",
    inicioCursoInter: "",
    fechaTaller: "",
    fechaTallerInter: "",
  });

  const [modalAlerta, setModalAlerta] = useState({
    isOpen: false,
    mensaje: "",
    titulo: "Atención",
  });

  const mostrarAlerta = (mensaje, titulo = "Aviso") => {
    setModalAlerta({ isOpen: true, mensaje, titulo });
  };

  const obtenerCiclos = async () => {
    setCargando(true);
    try {
      const response = await fetch("http://localhost:4000/api/ciclos");
      const resultado = await response.json();
      if (response.ok && resultado.ok) {
        setCiclos(resultado.data || []);
      }
    } catch (error) {
      console.error("Error al obtener ciclos escolares:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerCiclos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setIdSeleccionado(null);
    setFormData({
      clave: "",
      claveIntersemestral: "",
      inicia: "",
      iniciaIntersemestral: "",
      termina: "",
      terminaIntersemestral: "",
      activo: 1,
      fechaConformarExpediente: "",
      fechaConformarExpEdInter: "",
      ultimoFolio: "",
      ultimoFolioInter: "",
      inicioCurso: "",
      inicioCursoInter: "",
      fechaTaller: "",
      fechaTallerInter: "",
    });
    setIsModalOpen(true);
  };

  const abrirModalEditar = (ciclo) => {
    setModoEdicion(true);
    setIdSeleccionado(ciclo.id);
    setFormData({
      clave: ciclo.clave || "",
      claveIntersemestral: ciclo.claveIntersemestral || "",
      inicia: ciclo.inicia ? ciclo.inicia.split("T")[0] : "",
      iniciaIntersemestral: ciclo.iniciaIntersemestral
        ? ciclo.iniciaIntersemestral.split("T")[0]
        : "",
      termina: ciclo.termina ? ciclo.termina.split("T")[0] : "",
      terminaIntersemestral: ciclo.terminaIntersemestral
        ? ciclo.terminaIntersemestral.split("T")[0]
        : "",
      activo: ciclo.activo ?? 1,
      fechaConformarExpediente: ciclo.fechaConformarExpediente
        ? ciclo.fechaConformarExpediente.split("T")[0]
        : "",
      fechaConformarExpEdInter: ciclo.fechaConformarExpEdInter
        ? ciclo.fechaConformarExpEdInter.split("T")[0]
        : "",
      ultimoFolio: ciclo.ultimoFolio || "",
      ultimoFolioInter: ciclo.ultimoFolioInter || "",
      inicioCurso: ciclo.inicioCurso ? ciclo.inicioCurso.split("T")[0] : "",
      inicioCursoInter: ciclo.inicioCursoInter
        ? ciclo.inicioCursoInter.split("T")[0]
        : "",
      fechaTaller: ciclo.fechaTaller ? ciclo.fechaTaller.split("T")[0] : "",
      fechaTallerInter: ciclo.fechaTallerInter
        ? ciclo.fechaTallerInter.split("T")[0]
        : "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clave) {
      mostrarAlerta("La clave del ciclo escolar es obligatoria.");
      return;
    }

    try {
      const url = modoEdicion
        ? `http://localhost:4000/api/ciclos/${idSeleccionado}`
        : "http://localhost:4000/api/ciclos";
      const method = modoEdicion ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resultado = await response.json();
      if (response.ok && resultado.ok) {
        mostrarAlerta(
          modoEdicion
            ? "Ciclo escolar actualizado con éxito."
            : "Ciclo escolar creado con éxito.",
          "Operación Exitosa",
        );
        setIsModalOpen(false);
        obtenerCiclos();
      } else {
        mostrarAlerta(
          resultado.mensaje || "Ocurrió un error al guardar el registro.",
        );
      }
    } catch (error) {
      console.error("Error al guardar ciclo:", error);
      mostrarAlerta("Error de conexión con el servidor.");
    }
  };

  const eliminarCiclo = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este ciclo escolar?"))
      return;
    try {
      const response = await fetch(`http://localhost:4000/api/ciclos/${id}`, {
        method: "DELETE",
      });
      const resultado = await response.json();
      if (response.ok && resultado.ok) {
        mostrarAlerta("Ciclo escolar eliminado correctamente.");
        obtenerCiclos();
      } else {
        mostrarAlerta(resultado.mensaje || "No se pudo eliminar el ciclo.");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      mostrarAlerta("Error de conexión al eliminar.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
              Control Escolar & Configuración
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Gestión de Ciclos Escolares
            </h1>
            <p className="text-xs text-slate-500">
              Administración de fechas límite, periodos semestrales e
              intersemestrales del sistema.
            </p>
          </div>
          <button
            onClick={abrirModalCrear}
            style={{ backgroundColor: branding?.accentColor || "#0f172a" }}
            className="px-5 py-2.5 text-white text-xs font-bold rounded-xl transition shadow-md hover:opacity-95 flex items-center gap-2 cursor-pointer"
          >
            <span>➕</span> Nuevo Ciclo Escolar
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-bold">
                  <th className="p-4">Clave</th>
                  <th className="p-4">Estatus</th>
                  <th className="p-4">Periodo Regular (Inicia / Termina)</th>
                  <th className="p-4">Límite Expediente</th>
                  <th className="p-4">Inicio Cursos</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {cargando ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      Cargando ciclos escolares...
                    </td>
                  </tr>
                ) : ciclos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      No hay ciclos escolares registrados en el sistema.
                    </td>
                  </tr>
                ) : (
                  ciclos.map((ciclo) => (
                    <tr
                      key={ciclo.id}
                      className="hover:bg-slate-50/80 transition"
                    >
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {ciclo.clave}
                        {ciclo.claveIntersemestral && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Inter: {ciclo.claveIntersemestral}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {ciclo.activo === 1 ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold uppercase tracking-wide border border-emerald-200">
                            ● Activo (Vigente)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wide">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-600 font-mono">
                        {ciclo.inicia ? ciclo.inicia.split("T")[0] : "N/A"} ➔{" "}
                        {ciclo.termina ? ciclo.termina.split("T")[0] : "N/A"}
                      </td>
                      <td className="p-4 font-mono text-red-600 font-bold">
                        {ciclo.fechaConformarExpediente
                          ? ciclo.fechaConformarExpediente.split("T")[0]
                          : "N/A"}
                      </td>
                      <td className="p-4 font-mono text-slate-700">
                        {ciclo.inicioCurso
                          ? ciclo.inicioCurso.split("T")[0]
                          : "N/A"}
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <button
                          onClick={() => abrirModalEditar(ciclo)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-900 hover:bg-blue-100 rounded-lg font-bold transition text-[11px]"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => eliminarCiclo(ciclo.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-bold transition text-[11px]"
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
              <div className="px-6 py-4 bg-slate-950 text-white flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  {modoEdicion
                    ? "Editar Ciclo Escolar"
                    : "Registrar Nuevo Ciclo Escolar"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6 sm:p-8 space-y-4 max-h-[75vh] overflow-y-auto text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700 uppercase text-[10px]">
                      Clave del Ciclo (Ej. 2026-A) *
                    </label>
                    <input
                      name="clave"
                      type="text"
                      required
                      value={formData.clave}
                      onChange={handleInputChange}
                      placeholder="2026-A"
                      className="px-3 py-2 border border-slate-300 rounded-xl uppercase font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700 uppercase text-[10px]">
                      Clave Intersemestral
                    </label>
                    <input
                      name="claveIntersemestral"
                      type="text"
                      value={formData.claveIntersemestral}
                      onChange={handleInputChange}
                      placeholder="2026-INT"
                      className="px-3 py-2 border border-slate-300 rounded-xl uppercase font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700 uppercase text-[10px]">
                      Fecha de Inicio (Ciclo)
                    </label>
                    <input
                      name="inicia"
                      type="date"
                      value={formData.inicia}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700 uppercase text-[10px]">
                      Fecha de Término (Ciclo)
                    </label>
                    <input
                      name="termina"
                      type="date"
                      value={formData.termina}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-red-700 uppercase text-[10px]">
                      Fecha Límite Expedientes (Candado Inscripción)
                    </label>
                    <input
                      name="fechaConformarExpediente"
                      type="date"
                      value={formData.fechaConformarExpediente}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-red-300 rounded-xl font-mono bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700 uppercase text-[10px]">
                      Inicio de Cursos Oficial
                    </label>
                    <input
                      name="inicioCurso"
                      type="date"
                      value={formData.inicioCurso}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-slate-300 rounded-xl font-mono bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700 uppercase text-[10px]">
                      Fecha de Taller de Inducción
                    </label>
                    <input
                      name="fechaTaller"
                      type="date"
                      value={formData.fechaTaller}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700 uppercase text-[10px]">
                      Estatus Activo (Interruptor General)
                    </label>
                    <select
                      name="activo"
                      value={formData.activo}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                    >
                      <option value={1}>
                        ACTIVO (Ciclo Vigente en Sistema)
                      </option>
                      <option value={0}>INACTIVO (Cerrado)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition shadow-md"
                  >
                    {modoEdicion ? "Guardar Cambios" : "Crear Ciclo Escolar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modalAlerta.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 text-center space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                {modalAlerta.titulo}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {modalAlerta.mensaje}
              </p>
              <button
                onClick={() =>
                  setModalAlerta({ isOpen: false, mensaje: "", titulo: "" })
                }
                className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-md"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
