import React, { useState, useEffect } from "react";

export default function CatalogosPage({ branding }) {
  const [catalogosDisponibles, setCatalogosDisponibles] = useState([
    { key: "subsistema", label: "Subsistemas", endpoint: "subsistema" },
    { key: "genero", label: "Géneros", endpoint: "genero" },
    { key: "identidad_cultural", label: "Identidad Cultural", endpoint: "identidadCultural" },
    { key: "discapacidad", label: "Discapacidades", endpoint: "discapacidad" },
    { key: "parentesco", label: "Parentescos", endpoint: "parentesco" },
    { key: "tipo_estudiante", label: "Tipos de Estudiante", endpoint: "tipoEstudiante" },
    { key: "semestre", label: "Semestres", endpoint: "semestre" },
    { key: "tipo_usuario", label: "Tipos de Usuario", endpoint: "tipoUsuario" },
  ]);

  const [catalogoActivo, setCatalogoActivo] = useState(catalogosDisponibles[0]);
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalNuevoCatalogoOpen, setIsModalNuevoCatalogoOpen] = useState(false);

  const [modoEdicion, setModoEdicion] = useState(false);
  const [idSeleccionado, setIdSeleccionado] = useState(null);

  const [formData, setFormData] = useState({ nombre: "", activo: true });
  const [nuevoCatalogoData, setNuevoCatalogoData] = useState({ label: "", endpoint: "" });

  const [modalAlerta, setModalAlerta] = useState({
    isOpen: false,
    mensaje: "",
    titulo: "Atención",
  });

  const mostrarAlerta = (mensaje, titulo = "Aviso") => {
    setModalAlerta({ isOpen: true, mensaje, titulo });
  };

  const obtenerRegistros = async (catalogo) => {
    setCargando(true);
    try {
      const response = await fetch(`http://localhost:4000/api/catalogo/${catalogo.endpoint}`);
      const resultado = await response.json();
      if (response.ok && resultado.ok) {
        setRegistros(resultado.data || []);
      } else {
        setRegistros([]);
        mostrarAlerta(resultado.mensaje || "No se pudieron cargar los registros.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setRegistros([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (catalogoActivo) {
      obtenerRegistros(catalogoActivo);
    }
  }, [catalogoActivo]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNuevoCatalogoChange = (e) => {
    const { name, value } = e.target;
    setNuevoCatalogoData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "label" && {
        endpoint: value.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, ""),
      }),
    }));
  };

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setIdSeleccionado(null);
    setFormData({ nombre: "", activo: true });
    setIsModalOpen(true);
  };

  const abrirModalEditar = (item) => {
    setModoEdicion(true);
    setIdSeleccionado(item.id);
    setFormData({
      nombre: item.nombre || item.tipoUsuario || "",
      activo: item.activo ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      mostrarAlerta("El campo nombre/descripción es obligatorio.");
      return;
    }

    try {
      const url = modoEdicion
        ? `http://localhost:4000/api/catalogo/${catalogoActivo.endpoint}/${idSeleccionado}`
        : `http://localhost:4000/api/catalogo/${catalogoActivo.endpoint}`;
      const method = modoEdicion ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resultado = await response.json();
      if (response.ok && resultado.ok) {
        mostrarAlerta(modoEdicion ? "Registro actualizado con éxito." : "Registro creado con éxito.", "Operación Exitosa");
        setIsModalOpen(false);
        obtenerRegistros(catalogoActivo);
      } else {
        mostrarAlerta(resultado.mensaje || "Error al guardar el registro.");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      mostrarAlerta("Error de conexión con el servidor.");
    }
  };

  const handleCrearNuevoCatalogo = async (e) => {
    e.preventDefault();
    if (!nuevoCatalogoData.label.trim() || !nuevoCatalogoData.endpoint.trim()) {
      mostrarAlerta("Todos los campos del catálogo son obligatorios.");
      return;
    }

    const nuevaClave = nuevoCatalogoData.endpoint;
    if (catalogosDisponibles.some((c) => c.endpoint === nuevaClave)) {
      mostrarAlerta("Ya existe un catálogo registrado con este identificador.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/catalogo/definicion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: nuevoCatalogoData.label.trim(),
          endpoint: nuevaClave,
        }),
      });

      const resultado = await response.json();

      if (response.ok && resultado.ok) {
        const nuevoCat = {
          key: nuevaClave,
          label: resultado.data.nombre,
          endpoint: resultado.data.endpoint,
        };

        setCatalogosDisponibles((prev) => [...prev, nuevoCat]);
        setCatalogoActivo(nuevoCat);
        setRegistros([]);
        setIsModalNuevoCatalogoOpen(false);
        setNuevoCatalogoData({ label: "", endpoint: "" });
        mostrarAlerta(`Catálogo "${nuevoCat.label}" creado exitosamente en la base de datos.`, "Nuevo Catálogo");
      } else {
        mostrarAlerta(resultado.mensaje || "No se pudo crear la definición del catálogo.");
      }
    } catch (error) {
      console.error("Error al crear catálogo global:", error);
      mostrarAlerta("Error de conexión al registrar el catálogo.");
    }
  };

  const toggleEstatus = async (item) => {
    const nuevoEstatus = !item.activo;
    try {
      const nombreItem = item.nombre || item.tipoUsuario;
      const response = await fetch(
        `http://localhost:4000/api/catalogo/${catalogoActivo.endpoint}/${item.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: nombreItem, activo: nuevoEstatus }),
        }
      );
      const resultado = await response.json();
      if (response.ok && resultado.ok) {
        obtenerRegistros(catalogoActivo);
      } else {
        mostrarAlerta("No se pudo actualizar el estatus.");
      }
    } catch (error) {
      console.error("Error al cambiar estatus:", error);
      mostrarAlerta("Error de conexión al actualizar estatus.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
              Configuración & Parámetros del Sistema
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Administración de Catálogos
            </h1>
            <p className="text-xs text-slate-500">
              Gestión centralizada de parámetros y opciones de selección.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => setIsModalNuevoCatalogoOpen(true)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <span>📁</span> Crear Nuevo Catálogo
            </button>

            <button
              onClick={abrirModalCrear}
              style={{ backgroundColor: branding?.accentColor || "#0f172a" }}
              className="px-5 py-2.5 text-white text-xs font-bold rounded-xl transition shadow-md hover:opacity-95 flex items-center gap-2 cursor-pointer"
            >
              <span>➕</span> Nuevo en {catalogoActivo?.label}
            </button>
          </div>
        </div>

        {/* Pestañas de catálogos */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {catalogosDisponibles.map((cat) => {
            const isSelected = catalogoActivo?.key === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setCatalogoActivo(cat)}
                style={isSelected ? { backgroundColor: branding?.accentColor || "#1e3a8a" } : {}}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shadow-2xs ${
                  isSelected
                    ? "text-white shadow-md border border-white/20"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Mostrando registros de: <span className="text-blue-900">{catalogoActivo?.label}</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Total: {registros.length} elementos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-bold">
                  <th className="p-4 w-16 text-center">ID</th>
                  <th className="p-4">Descripción / Nombre</th>
                  <th className="p-4 w-40">Estatus</th>
                  <th className="p-4 text-center w-40">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {cargando ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-400">
                      Cargando registros...
                    </td>
                  </tr>
                ) : registros.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-400">
                      No hay registros en este catálogo.
                    </td>
                  </tr>
                ) : (
                  registros.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 text-center font-mono text-slate-500 font-bold">
                        #{item.id}
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        {item.nombre || item.tipoUsuario || "Sin descripción"}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleEstatus(item)}
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border transition cursor-pointer ${
                            item.activo
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200"
                              : "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
                          }`}
                        >
                          {item.activo ? "● Activo" : "○ Inactivo"}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => abrirModalEditar(item)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-900 hover:bg-blue-100 rounded-lg font-bold transition text-[11px] cursor-pointer"
                        >
                          ✏️ Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal CRUD Registro */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800">
                <h3 className="text-sm font-black uppercase tracking-wider">
                  {modoEdicion ? `Editar en ${catalogoActivo?.label}` : `Nuevo en ${catalogoActivo?.label}`}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Nombre o Descripción *</label>
                  <input
                    name="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej. Opción..."
                    className="px-4 py-3 border border-slate-300 rounded-xl font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
                  />
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
                    style={{ backgroundColor: branding?.accentColor || "#0f172a" }}
                    className="px-6 py-3 text-white font-bold rounded-xl transition shadow-md hover:opacity-95 cursor-pointer"
                  >
                    {modoEdicion ? "Guardar Cambios" : "Crear Registro"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Crear Nuevo Catálogo Global */}
        {isModalNuevoCatalogoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800">
                <h3 className="text-sm font-black uppercase tracking-wider">Crear Nuevo Catálogo Global</h3>
                <button
                  onClick={() => setIsModalNuevoCatalogoOpen(false)}
                  className="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCrearNuevoCatalogo} className="p-6 sm:p-8 space-y-5 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Nombre del Catálogo *</label>
                  <input
                    name="label"
                    type="text"
                    required
                    value={nuevoCatalogoData.label}
                    onChange={handleNuevoCatalogoChange}
                    placeholder="Ej. Actas o Modalidad"
                    className="px-4 py-3 border border-slate-300 rounded-xl font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Identificador de Endpoint *</label>
                  <input
                    name="endpoint"
                    type="text"
                    required
                    value={nuevoCatalogoData.endpoint}
                    onChange={handleNuevoCatalogoChange}
                    placeholder="Ej. actas"
                    className="px-4 py-3 border border-slate-300 rounded-xl font-mono text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalNuevoCatalogoOpen(false)}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{ backgroundColor: branding?.accentColor || "#0f172a" }}
                    className="px-6 py-3 text-white font-bold rounded-xl transition shadow-md hover:opacity-95 cursor-pointer"
                  >
                    Registrar Catálogo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Alertas */}
        {modalAlerta.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 text-center space-y-4">
              <h3 className="text-base font-bold text-slate-900">{modalAlerta.titulo}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{modalAlerta.mensaje}</p>
              <button
                onClick={() => setModalAlerta({ isOpen: false, mensaje: "", titulo: "" })}
                className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-md cursor-pointer"
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
