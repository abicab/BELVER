import React, { useState, useEffect } from "react";

export default function CatalogosPage({ branding }) {
  // Catálogos alineados exactamente con los nombres de modelos y rutas del backend
  const CATALOGOS_DISPONIBLES = [
    { key: "subsistema", label: "Subsistemas", endpoint: "subsistema" },
    { key: "genero", label: "Géneros", endpoint: "genero" },
    {
      key: "identidad_cultural",
      label: "Identidad Cultural",
      endpoint: "identidadCultural",
    },
    { key: "discapacidad", label: "Discapacidades", endpoint: "discapacidad" },
    { key: "parentesco", label: "Parentescos", endpoint: "parentesco" },
    {
      key: "tipo_estudiante",
      label: "Tipos de Estudiante",
      endpoint: "tipoEstudiante",
    },
    { key: "semestre", label: "Semestres", endpoint: "semestre" },
    { key: "tipo_usuario", label: "Tipos de Usuario", endpoint: "tipoUsuario" },
  ];

  const [catalogoActivo, setCatalogoActivo] = useState(
    CATALOGOS_DISPONIBLES[0],
  );
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idSeleccionado, setIdSeleccionado] = useState(null);

  // Estado del formulario genérico para catálogos
  const [formData, setFormData] = useState({
    nombre: "",
    activo: true,
  });

  const [modalAlerta, setModalAlerta] = useState({
    isOpen: false,
    mensaje: "",
    titulo: "Atención",
  });

  const mostrarAlerta = (mensaje, titulo = "Aviso") => {
    setModalAlerta({ isOpen: true, mensaje, titulo });
  };

  // Cargar registros del catálogo activo desde el backend
  const obtenerRegistros = async (endpoint) => {
    setCargando(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/catalogos/${endpoint}`,
      );
      const textResponse = await response.text();

      // Validación preventiva por si el servidor responde con HTML de error (404/500) en lugar de JSON
      try {
        const resultado = JSON.parse(textResponse);
        if (response.ok && resultado.ok) {
          setRegistros(resultado.data || []);
        } else {
          setRegistros([]);
          mostrarAlerta(
            resultado.mensaje || "No se pudieron cargar los registros.",
          );
        }
      } catch (jsonError) {
        console.error(
          "La respuesta del servidor no es un JSON válido:",
          textResponse,
        );
        setRegistros([]);
      }
    } catch (error) {
      console.error("Error de conexión al obtener el catálogo:", error);
      setRegistros([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerRegistros(catalogoActivo.endpoint);
  }, [catalogoActivo]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
        ? `http://localhost:4000/api/catalogos/${catalogoActivo.endpoint}/${idSeleccionado}`
        : `http://localhost:4000/api/catalogos/${catalogoActivo.endpoint}`;
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
            ? "Registro actualizado con éxito."
            : "Registro creado con éxito.",
          "Operación Exitosa",
        );
        setIsModalOpen(false);
        obtenerRegistros(catalogoActivo.endpoint);
      } else {
        mostrarAlerta(
          resultado.mensaje || "Ocurrió un error al guardar el registro.",
        );
      }
    } catch (error) {
      console.error("Error al guardar en catálogo:", error);
      mostrarAlerta("Error de conexión con el servidor.");
    }
  };

  // Cambio de estatus rápido (Baja lógica / Activación)
  const toggleEstatus = async (item) => {
    try {
      const nuevoEstatus = !item.activo;
      const response = await fetch(
        `http://localhost:4000/api/catalogos/${catalogoActivo.endpoint}/${item.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: item.nombre || item.tipoUsuario,
            activo: nuevoEstatus,
          }),
        },
      );
      const resultado = await response.json();
      if (response.ok && resultado.ok) {
        obtenerRegistros(catalogoActivo.endpoint);
      } else {
        mostrarAlerta("No se pudo actualizar el estatus.");
      }
    } catch (error) {
      console.error("Error al cambiar estatus:", error);
      mostrarAlerta("Error de conexión al cambiar estatus.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Cabecera del Módulo */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
              Configuración & Parámetros del Sistema
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Administración de Catálogos Independientes
            </h1>
            <p className="text-xs text-slate-500">
              Gestión centralizada de parámetros, catálogos base y opciones de
              selección para aspirantes y alumnos.
            </p>
          </div>
          <button
            onClick={abrirModalCrear}
            style={{ backgroundColor: branding?.accentColor || "#0f172a" }}
            className="px-5 py-2.5 text-white text-xs font-bold rounded-xl transition shadow-md hover:opacity-95 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>➕</span> Nuevo Registro en {catalogoActivo.label}
          </button>
        </div>

        {/* Barra Selector de Catálogos (Pestañas horizontales limpias) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 bg-transparent">
          {CATALOGOS_DISPONIBLES.map((cat) => {
            const isSelected = catalogoActivo.key === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setCatalogoActivo(cat)}
                style={
                  isSelected
                    ? { backgroundColor: branding?.accentColor || "#1e3a8a" }
                    : {}
                }
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

        {/* Tabla de Registros del Catálogo Seleccionado */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Mostrando registros de:{" "}
              <span className="text-blue-900">{catalogoActivo.label}</span>
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
                  <th className="p-4 w-36">Estatus (Baja Lógica)</th>
                  <th className="p-4 text-center w-40">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {cargando ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-400">
                      Cargando registros del catálogo...
                    </td>
                  </tr>
                ) : registros.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-400">
                      No hay registros en este catálogo. Utiliza el botón
                      superior para agregar el primero.
                    </td>
                  </tr>
                ) : (
                  registros.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition"
                    >
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
                      <td className="p-4 text-center space-x-2">
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

        {/* Modal CRUD (Crear / Editar Registro de Catálogo) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-950 text-white flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  {modoEdicion
                    ? `Editar en ${catalogoActivo.label}`
                    : `Nuevo en ${catalogoActivo.label}`}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6 sm:p-8 space-y-4 text-xs"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 uppercase text-[10px]">
                    Nombre o Descripción *
                  </label>
                  <input
                    name="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej. Opción de catálogo..."
                    className="px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-700 uppercase text-[10px]">
                    Estatus de Disponibilidad
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={formData.activo}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition shadow-md cursor-pointer"
                  >
                    {modoEdicion ? "Guardar Cambios" : "Crear Registro"}
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
