import React, { useState, useEffect } from "react";

export default function CicloPage({ branding }) {
  const [ciclos, setCiclos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null); // "regular" o "intersemestral"
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
    setTipoSeleccionado(null);
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
    const esInter = Boolean(
      ciclo.claveIntersemestral || ciclo.iniciaIntersemestral,
    );
    setTipoSeleccionado(esInter ? "intersemestral" : "regular");

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

  // Función para alternar estatus directamente desde la tabla (Baja / Alta lógica)
  const toggleEstatus = async (ciclo) => {
    try {
      const nuevoEstatus = ciclo.activo === 1 ? 0 : 1;
      const response = await fetch(
        `http://localhost:4000/api/ciclos/${ciclo.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...ciclo, activo: nuevoEstatus }),
        },
      );
      const resultado = await response.json();
      if (response.ok && resultado.ok) {
        obtenerCiclos();
      } else {
        mostrarAlerta("No se pudo actualizar el estatus del ciclo.");
      }
    } catch (error) {
      console.error("Error al cambiar estatus:", error);
      mostrarAlerta("Error de conexión al cambiar estatus.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tipoSeleccionado === "regular" && !formData.clave) {
      mostrarAlerta("La clave del ciclo regular es obligatoria.");
      return;
    }
    if (
      tipoSeleccionado === "intersemestral" &&
      !formData.claveIntersemestral
    ) {
      mostrarAlerta("La clave intersemestral es obligatoria.");
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
        {/* Cabecera del Módulo */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
              Control Escolar & Configuración
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Gestión de Ciclos Escolares
            </h1>
            <p className="text-xs text-slate-500">
              Administración de periodos regulares e intersemestrales
              centralizados en el sistema.
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

        {/* Tabla Principal */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-bold">
                  <th className="p-4">Clave del Ciclo</th>
                  <th className="p-4">Estatus</th>
                  <th className="p-4">Periodo (Inicia / Termina)</th>
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
                  ciclos.map((ciclo) => {
                    const esInter = Boolean(ciclo.claveIntersemestral);
                    return (
                      <tr
                        key={ciclo.id}
                        className="hover:bg-slate-50/80 transition"
                      >
                        <td className="p-4 font-mono font-bold text-slate-900">
                          {esInter ? ciclo.claveIntersemestral : ciclo.clave}
                          <span
                            className={`block text-[9px] px-2 py-0.5 mt-1 rounded-md w-max font-bold ${
                              esInter
                                ? "bg-blue-100 text-blue-900"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {esInter ? "Intersemestral" : "Regular"}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleEstatus(ciclo)}
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border transition cursor-pointer ${
                              ciclo.activo === 1
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200"
                                : "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
                            }`}
                          >
                            {ciclo.activo === 1 ? "● Activo" : "○ Inactivo"}
                          </button>
                        </td>
                        <td className="p-4 text-slate-600 font-mono">
                          {esInter
                            ? `${ciclo.iniciaIntersemestral ? ciclo.iniciaIntersemestral.split("T")[0] : "N/A"} ➔ ${ciclo.terminaIntersemestral ? ciclo.terminaIntersemestral.split("T")[0] : "N/A"}`
                            : `${ciclo.inicia ? ciclo.inicia.split("T")[0] : "N/A"} ➔ ${ciclo.termina ? ciclo.termina.split("T")[0] : "N/A"}`}
                        </td>
                        <td className="p-4 font-mono text-red-600 font-bold">
                          {esInter
                            ? ciclo.fechaConformarExpEdInter
                              ? ciclo.fechaConformarExpEdInter.split("T")[0]
                              : "N/A"
                            : ciclo.fechaConformarExpediente
                              ? ciclo.fechaConformarExpediente.split("T")[0]
                              : "N/A"}
                        </td>
                        <td className="p-4 font-mono text-slate-700">
                          {esInter
                            ? ciclo.inicioCursoInter
                              ? ciclo.inicioCursoInter.split("T")[0]
                              : "N/A"
                            : ciclo.inicioCurso
                              ? ciclo.inicioCurso.split("T")[0]
                              : "N/A"}
                        </td>
                        <td className="p-4 text-center space-x-2">
                          <button
                            onClick={() => abrirModalEditar(ciclo)}
                            className="px-3 py-1.5 bg-blue-50 text-blue-900 hover:bg-blue-100 rounded-lg font-bold transition text-[11px] cursor-pointer"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => eliminarCiclo(ciclo.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-bold transition text-[11px] cursor-pointer"
                          >
                            🗑️ Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Interactivo con Dos Vistas Diferentes (Sin Emojis) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
              <div className="px-6 py-5 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    Configuración de Temporalidad
                  </span>
                  <h3 className="text-sm font-black uppercase tracking-wider mt-0.5">
                    {modoEdicion
                      ? `Editando Ciclo (${tipoSeleccionado?.toUpperCase()})`
                      : "Nuevo Ciclo Escolar"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* PASO 1: Selector Visual de Tipo de Ciclo (Sin Emojis) */}
              {!tipoSeleccionado && !modoEdicion ? (
                <div className="p-8 text-center space-y-6">
                  <div className="space-y-2 max-w-md mx-auto">
                    <h4 className="text-sm font-black text-slate-900 uppercase">
                      Selecciona el tipo de periodo a configurar
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Elige si vas a dar de alta un ciclo escolar regular o un
                      periodo intersemestral especial. Ambos se almacenarán
                      ordenadamente en la base de datos.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 max-w-lg mx-auto">
                    <button
                      type="button"
                      onClick={() => setTipoSeleccionado("regular")}
                      className="p-6 bg-slate-50 hover:bg-slate-900 hover:text-white border-2 border-slate-200 hover:border-slate-900 rounded-2xl transition-all duration-200 group flex flex-col items-center text-center gap-3 cursor-pointer shadow-sm hover:shadow-lg"
                    >
                      <div>
                        <h5 className="font-extrabold text-xs uppercase tracking-wider">
                          Ciclo Regular
                        </h5>
                        <p className="text-[11px] text-slate-400 group-hover:text-slate-300 mt-1">
                          Periodo escolar ordinario (Ej. 2026-A)
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoSeleccionado("intersemestral")}
                      className="p-6 bg-blue-50/40 hover:bg-blue-950 hover:text-white border-2 border-blue-100 hover:border-blue-950 rounded-2xl transition-all duration-200 group flex flex-col items-center text-center gap-3 cursor-pointer shadow-sm hover:shadow-lg"
                    >
                      <div>
                        <h5 className="font-extrabold text-xs uppercase tracking-wider text-blue-900 group-hover:text-white">
                          Intersemestral
                        </h5>
                        <p className="text-[11px] text-blue-700/70 group-hover:text-blue-200 mt-1">
                          Periodo intensivo (Ej. 2026-INT)
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                /* PASO 2: Formulario Específico Rediseñado con Estética Moderna */
                <form
                  onSubmit={handleSubmit}
                  className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto text-xs"
                >
                  <div className="flex justify-between items-center bg-slate-100 px-4 py-3 rounded-2xl border border-slate-200">
                    <span className="font-bold text-slate-700 text-[11px] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-900"></span>
                      Configurando:{" "}
                      <span className="text-blue-900 uppercase font-black">
                        {tipoSeleccionado}
                      </span>
                    </span>
                    {!modoEdicion && (
                      <button
                        type="button"
                        onClick={() => setTipoSeleccionado(null)}
                        className="text-[11px] text-blue-900 hover:underline font-bold bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs cursor-pointer"
                      >
                        ← Volver a elegir
                      </button>
                    )}
                  </div>

                  {/* CAMPOS CICLO REGULAR */}
                  {tipoSeleccionado === "regular" && (
                    <div className="space-y-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="border-b border-slate-100 pb-3">
                        <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wide">
                          Datos Generales del Ciclo Regular
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Complete los campos obligatorios para el periodo
                          ordinario.
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                          Clave del Ciclo Regular *
                        </label>
                        <input
                          name="clave"
                          type="text"
                          required
                          value={formData.clave}
                          onChange={handleInputChange}
                          placeholder="Ej. 2026-A"
                          className="px-4 py-3 border border-slate-300 rounded-xl uppercase font-mono bg-slate-50/50 font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                            Fecha de Inicio
                          </label>
                          <input
                            name="inicia"
                            type="date"
                            value={formData.inicia}
                            onChange={handleInputChange}
                            className="px-4 py-3 border border-slate-300 rounded-xl font-mono bg-slate-50/50 font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                            Fecha de Término
                          </label>
                          <input
                            name="termina"
                            type="date"
                            value={formData.termina}
                            onChange={handleInputChange}
                            className="px-4 py-3 border border-slate-300 rounded-xl font-mono bg-slate-50/50 font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-red-700 uppercase text-[10px] tracking-wider">
                            Límite Expedientes
                          </label>
                          <input
                            name="fechaConformarExpediente"
                            type="date"
                            value={formData.fechaConformarExpediente}
                            onChange={handleInputChange}
                            className="px-4 py-3 border border-red-300 rounded-xl font-mono bg-red-50/20 font-semibold text-red-700 focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-none transition"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                            Inicio de Cursos Oficial
                          </label>
                          <input
                            name="inicioCurso"
                            type="date"
                            value={formData.inicioCurso}
                            onChange={handleInputChange}
                            className="px-4 py-3 border border-slate-300 rounded-xl font-mono bg-slate-50/50 font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                            Último Folio (Al Cierre)
                          </label>
                          <input
                            name="ultimoFolio"
                            type="text"
                            maxLength={9}
                            value={formData.ultimoFolio}
                            onChange={handleInputChange}
                            placeholder="Ej. 00150"
                            className="px-4 py-3 border border-slate-300 rounded-xl font-mono uppercase bg-slate-50/50 font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                            Fecha Taller de Inducción
                          </label>
                          <input
                            name="fechaTaller"
                            type="date"
                            value={formData.fechaTaller}
                            onChange={handleInputChange}
                            className="px-4 py-3 border border-slate-300 rounded-xl font-mono bg-slate-50/50 font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CAMPOS PERIODO INTERSEMESTRAL */}
                  {tipoSeleccionado === "intersemestral" && (
                    <div className="space-y-5 bg-blue-50/20 p-6 rounded-2xl border border-blue-100 shadow-xs">
                      <div className="border-b border-blue-100 pb-3">
                        <h4 className="font-black text-blue-950 uppercase text-[11px] tracking-wide">
                          Datos Generales del Periodo Intersemestral
                        </h4>
                        <p className="text-[11px] text-blue-700/70">
                          Complete la información correspondiente al periodo
                          intensivo.
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-blue-900 uppercase text-[10px] tracking-wider">
                          Clave Intersemestral *
                        </label>
                        <input
                          name="claveIntersemestral"
                          type="text"
                          required
                          value={formData.claveIntersemestral}
                          onChange={handleInputChange}
                          placeholder="Ej. 2026-INT"
                          className="px-4 py-3 border border-blue-200 rounded-xl uppercase font-mono bg-white font-bold text-blue-950 focus:ring-2 focus:ring-blue-900 focus:outline-none transition"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-blue-900 uppercase text-[10px] tracking-wider">
                            Inicio Intersemestral
                          </label>
                          <input
                            name="iniciaIntersemestral"
                            type="date"
                            value={formData.iniciaIntersemestral}
                            onChange={handleInputChange}
                            className="px-4 py-3 border border-blue-200 rounded-xl font-mono bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-blue-900 focus:outline-none transition"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-blue-900 uppercase text-[10px] tracking-wider">
                            Término Intersemestral
                          </label>
                          <input
                            name="terminaIntersemestral"
                            type="date"
                            value={formData.terminaIntersemestral}
                            onChange={handleInputChange}
                            className="px-4 py-3 border border-blue-200 rounded-xl font-mono bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-blue-900 focus:outline-none transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-red-800 uppercase text-[10px] tracking-wider">
                            Límite Expedientes Inter.
                          </label>
                          <input
                            name="fechaConformarExpEdInter"
                            type="date"
                            value={formData.fechaConformarExpEdInter}
                            onChange={handleInputChange}
                            className="px-4 py-3 border border-red-200 rounded-xl font-mono bg-red-50/20 font-semibold text-red-700 focus:ring-2 focus:ring-red-600 focus:outline-none transition"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-blue-900 uppercase text-[10px] tracking-wider">
                            Inicio Cursos Inter.
                          </label>
                          <input
                            name="inicioCursoInter"
                            type="date"
                            value={formData.inicioCursoInter}
                            onChange={handleInputChange}
                            className="px-4 py-3 border border-blue-200 rounded-xl font-mono bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-blue-900 focus:outline-none transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-blue-900 uppercase text-[10px] tracking-wider">
                            Últ. Folio Inter.
                          </label>
                          <input
                            name="ultimoFolioInter"
                            type="text"
                            maxLength={9}
                            value={formData.ultimoFolioInter}
                            onChange={handleInputChange}
                            placeholder="000"
                            className="px-4 py-3 border border-blue-200 rounded-xl font-mono uppercase bg-white font-bold text-blue-950 focus:ring-2 focus:ring-blue-900 focus:outline-none transition"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-blue-900 uppercase text-[10px] tracking-wider">
                            Taller Inter.
                          </label>
                          <input
                            name="fechaTallerInter"
                            type="date"
                            value={formData.fechaTallerInter}
                            onChange={handleInputChange}
                            className="px-4 py-3 border border-blue-200 rounded-xl font-mono bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-blue-900 focus:outline-none transition"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interruptor de Estatus */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs">
                    <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                      Estatus Activo (Vigencia Sistema)
                    </span>
                    <select
                      name="activo"
                      value={formData.activo}
                      onChange={handleInputChange}
                      className="px-4 py-2.5 border border-slate-300 rounded-xl font-bold bg-white text-xs cursor-pointer shadow-2xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    >
                      <option value={1}>ACTIVO</option>
                      <option value={0}>INACTIVO</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      style={{
                        backgroundColor: branding?.accentColor || "#0f172a",
                      }}
                      className="px-6 py-3 text-white font-bold rounded-xl transition shadow-md hover:opacity-95 cursor-pointer"
                    >
                      {modoEdicion ? "Guardar Cambios" : "Guardar en Sistema"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Modal de Alertas */}
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
                  setModalAlerta((prev) => ({ ...prev, isOpen: false }))
                }
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
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
