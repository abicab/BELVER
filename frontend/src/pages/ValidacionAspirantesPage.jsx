import React, { useState, useEffect } from "react";

const traducirTipoDocumento = (tipo) => {
  const diccionario = {
    photo: "FOTOGRAFÍA",
    actaNacimiento: "ACTA DE NACIMIENTO",
    curpFile: "CURP (PDF)",
    studyCert: "CERTIFICADO DE SECUNDARIA",
    constanciaEstudios: "CONSTANCIA DE ESTUDIOS",
    ineDocument: "IDENTIFICACIÓN OFICIAL (INE / TUTOR)",
  };
  return diccionario[tipo] || tipo.toUpperCase();
};

export default function ValidacionAspirantesPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [filtroEstatus, setFiltroEstatus] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

  const [textoObservaciones, setTextoObservaciones] = useState("");

  const cargarAspirantes = async () => {
    setCargando(true);
    try {
      const res = await fetch(
        `http://localhost:4000/api/controlescolar/aspirantes?estatus=${filtroEstatus}`,
      );
      const resultado = await res.json();
      if (res.ok && resultado.ok) {
        setSolicitudes(resultado.data || []);
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAspirantes();
  }, [filtroEstatus]);

  const handleOpenDictamen = (solicitud) => {
    setSelectedSolicitud({
      ...solicitud,
      documentosTemp: (solicitud.documentos || []).map((d) => ({ ...d })),
    });
    setTextoObservaciones(solicitud.validacionExpedientes?.observaciones || "");
  };

  const handleDocStatusChange = async (documentoId, nuevoEstatus) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/controlescolar/documentos/${documentoId}/estatus`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estatusDoc: nuevoEstatus }),
        },
      );
      const data = await res.json();
      if (res.ok && data.ok) {
        setSelectedSolicitud((prev) => ({
          ...prev,
          documentosTemp: prev.documentosTemp.map((d) =>
            d.id === documentoId ? { ...d, estatusDoc: nuevoEstatus } : d,
          ),
        }));
      }
    } catch (error) {
      console.error("Error al actualizar estatus de documento:", error);
    }
  };

  const handleEnviarObservaciones = async () => {
    if (!textoObservaciones.trim()) {
      alert(
        "Por favor, escribe las correcciones necesarias antes de marcar como pendiente.",
      );
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:4000/api/controlescolar/aspirantes/${selectedSolicitud.id}/observaciones`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ observaciones: textoObservaciones }),
        },
      );
      const resultado = await res.json();

      if (res.ok && resultado.ok) {
        alert(
          "Se han enviado las observaciones y requerido correcciones al aspirante con éxito.",
        );
        setSelectedSolicitud(null);
        cargarAspirantes();
      } else {
        alert(resultado.mensaje || "Error al guardar las observaciones.");
      }
    } catch (error) {
      console.error("Error al enviar observaciones:", error);
      alert("Error de conexión al enviar las observaciones.");
    }
  };

  const handleAprobarExpediente = async () => {
    const documentosPendientesORechazados =
      selectedSolicitud.documentosTemp.some((d) => d.estatusDoc !== "APROBADO");

    if (documentosPendientesORechazados) {
      alert(
        'Acción no permitida: Todos los documentos del expediente deben estar explícitamente marcados como "Aprobado" antes de aprobar al alumno.',
      );
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:4000/api/controlescolar/aspirantes/${selectedSolicitud.id}/aprobar`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            observaciones: textoObservaciones,
          }),
        },
      );
      const resultado = await res.json();

      if (res.ok && resultado.ok) {
        alert(
          `¡Expediente aprobado con éxito!\n\nEl tipo de usuario ha cambiado a Alumno.\nMatrícula Asignada: ${resultado.data.matricula}\nContraseña Única: ${resultado.data.password}`,
        );
        setSelectedSolicitud(null);
        cargarAspirantes();
      } else {
        alert(resultado.mensaje || "Error al aprobar el expediente.");
      }
    } catch (error) {
      console.error("Error en aprobación:", error);
      alert("Error de conexión al procesar la aprobación.");
    }
  };

  const solicitudesFiltradas = solicitudes.filter((sol) => {
    const nombreCompleto =
      `${sol.nombres} ${sol.apellidoPaterno} ${sol.apellidoMaterno || ""}`.toLowerCase();
    return (
      sol.folio.toLowerCase().includes(busqueda.toLowerCase()) ||
      nombreCompleto.includes(busqueda.toLowerCase()) ||
      sol.curp.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-950 text-white px-2.5 py-1 rounded-md">
              Departamento de Control Escolar
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              Validación de Expedientes y Dictamen de Admisión
            </h1>
            <p className="text-xs text-slate-500">
              Cotejo documental, perfil sociodemográfico, asignación de
              matrícula y credenciales institucionales.
            </p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="relative w-full lg:w-96">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por Folio, CURP o Nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filtroEstatus}
              onChange={(e) => setFiltroEstatus(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold py-1.5 px-3 rounded-xl outline-none cursor-pointer"
            >
              <option value="TODOS">Todos</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="APROBADO">Aprobados (Alumnos)</option>
              <option value="RECHAZADO">Rechazados</option>
            </select>
            <button
              onClick={cargarAspirantes}
              className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Folio / Fecha</th>
                  <th className="p-4">Aspirante / CURP</th>
                  <th className="p-4">Modalidad</th>
                  <th className="p-4">Procedencia</th>
                  <th className="p-4 py-2 text-center text-xs font-semibold text-slate-600 uppercase">
                    Matrícula
                  </th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cargando ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      Cargando registros...
                    </td>
                  </tr>
                ) : solicitudesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      No se encontraron solicitudes.
                    </td>
                  </tr>
                ) : (
                  solicitudesFiltradas.map((sol) => (
                    <tr key={sol.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <span className="font-mono font-bold text-blue-950 block">
                          {sol.folio}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(sol.creadoEn).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-900 block">{`${sol.apellidoPaterno} ${sol.apellidoMaterno || ""} ${sol.nombres}`}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {sol.curp}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            sol.tipoAdmision === "revalidacion"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-blue-100 text-blue-900"
                          }`}
                        >
                          {sol.tipoAdmision}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">
                        {sol.nombreEscuelaProcedencia || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-center text-xs text-slate-700 font-mono font-bold">
                        {sol.matricula || "—"}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenDictamen(sol)}
                          className="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-white rounded-lg font-semibold text-xs transition"
                        >
                          Cotejar y Dictaminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedSolicitud && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[92vh]">
              <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex justify-between items-center shrink-0 border-b border-slate-800">
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-white">
                    Inspección Integral de Expediente: {selectedSolicitud.folio}
                  </h3>
                  <div className="text-xs text-slate-200 mt-1 flex items-center gap-3 font-semibold">
                    <span className="text-white text-sm">
                      👤{" "}
                      {`${selectedSolicitud.apellidoPaterno} ${selectedSolicitud.apellidoMaterno || ""} ${selectedSolicitud.nombres}`}
                    </span>
                    <span className="font-mono text-cyan-300">
                      CURP: {selectedSolicitud.curp}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSolicitud(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-700 bg-slate-50/50">
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">
                    1. Información General y Sociodemográfica del Aspirante
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                      <span className="font-extrabold text-blue-950 uppercase tracking-wider block border-b pb-1 text-[10px]">
                        📍 Domicilio y Contacto
                      </span>
                      <p>
                        <strong className="text-slate-500">Celular:</strong>{" "}
                        {selectedSolicitud.telefonoCelular}
                      </p>
                      <p>
                        <strong className="text-slate-500">
                          Tel. Particular:
                        </strong>{" "}
                        {selectedSolicitud.telefonoParticular || "N/A"}
                      </p>
                      <p>
                        <strong className="text-slate-500">
                          Correo Principal:
                        </strong>{" "}
                        {selectedSolicitud.correoElectronico1}
                      </p>
                      <p>
                        <strong className="text-slate-500">
                          Correo Alternativo:
                        </strong>{" "}
                        {selectedSolicitud.correoElectronico2 || "N/A"}
                      </p>
                      <p className="pt-1">
                        <strong className="text-slate-500">Dirección:</strong>{" "}
                        {selectedSolicitud.calle} #
                        {selectedSolicitud.numeroExterior || "S/N"}{" "}
                        {selectedSolicitud.numeroInterior
                          ? `Int. ${selectedSolicitud.numeroInterior}`
                          : ""}
                        , Col. {selectedSolicitud.colonia}, C.P.{" "}
                        {selectedSolicitud.codigoPostal},{" "}
                        {selectedSolicitud.municipio},{" "}
                        {selectedSolicitud.estado}, {selectedSolicitud.pais}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                      <span className="font-extrabold text-blue-950 uppercase tracking-wider block border-b pb-1 text-[10px]">
                        🧬 Perfil e Inclusión
                      </span>
                      <p>
                        <strong className="text-slate-500">
                          F. Nacimiento:
                        </strong>{" "}
                        {selectedSolicitud.fechaNacimiento
                          ? new Date(
                              selectedSolicitud.fechaNacimiento,
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                      <p>
                        <strong className="text-slate-500">Género:</strong>{" "}
                        {selectedSolicitud.generoRel?.nombre ||
                          "No especificado"}
                      </p>
                      <p>
                        <strong className="text-slate-500">
                          Identidad Cultural:
                        </strong>{" "}
                        {selectedSolicitud.identidadCulturalTexto || "NINGUNO"}
                      </p>
                      <p>
                        <strong className="text-slate-500">
                          Discapacidades:
                        </strong>{" "}
                        {selectedSolicitud.discapacidadesTexto || "Ninguna"}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                      <span className="font-extrabold text-blue-950 uppercase tracking-wider block border-b pb-1 text-[10px]">
                        🎓 Académico y Tutor
                      </span>
                      <p>
                        <strong className="text-slate-500">Modalidad:</strong>{" "}
                        <span className="font-bold uppercase text-blue-900">
                          {selectedSolicitud.tipoAdmision}
                        </span>
                      </p>
                      <p>
                        <strong className="text-slate-500">
                          Escuela Procedencia:
                        </strong>{" "}
                        {selectedSolicitud.nombreEscuelaProcedencia || "N/A"}{" "}
                        (CCT: {selectedSolicitud.cctEscuelaProcedencia || "N/A"}
                        )
                      </p>
                      <p>
                        <strong className="text-slate-500">
                          Semestres a Cursar:
                        </strong>{" "}
                        {selectedSolicitud.semestresSeleccionados
                          ? JSON.parse(
                              JSON.stringify(
                                selectedSolicitud.semestresSeleccionados,
                              ),
                            ).join(", ")
                          : "N/A"}
                      </p>
                      <p className="pt-1">
                        <strong className="text-slate-500">Tutor:</strong>{" "}
                        {selectedSolicitud.tutorNombres
                          ? `${selectedSolicitud.tutorApellidoPaterno || ""} ${selectedSolicitud.tutorNombres} (${selectedSolicitud.tutorTelefono})`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">
                    2. Validación de Documentación Digital y Expediente
                  </h4>
                  <div className="space-y-2">
                    {selectedSolicitud.documentosTemp.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block uppercase">
                            {traducirTipoDocumento(doc.tipoDoc)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Archivo: {doc.nombreArchivo}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`http://localhost:4000/api/controlescolar/documentos/${doc.id}/ver`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                          >
                            👁️ Ver Archivo
                          </a>

                          <select
                            value={doc.estatusDoc}
                            onChange={(e) =>
                              handleDocStatusChange(doc.id, e.target.value)
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold outline-none border shadow-2xs ${
                              doc.estatusDoc === "APROBADO"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : doc.estatusDoc === "RECHAZADO"
                                  ? "bg-red-50 text-red-800 border-red-300"
                                  : "bg-amber-50 text-amber-800 border-amber-300"
                            }`}
                          >
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="APROBADO">Aprobado ✓</option>
                            <option value="RECHAZADO">Rechazado ✕</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 bg-amber-50/70 p-4 rounded-xl border border-amber-200 shadow-2xs">
                  <label className="font-bold text-amber-950 uppercase tracking-wider text-[11px] block">
                    3. Observaciones y Correcciones Requeridas para el Aspirante
                  </label>
                  <p className="text-[10px] text-amber-800">
                    Escribe los motivos de rechazo u observaciones. Al dar clic
                    en requerir correcciones, este mensaje se reflejará en el
                    portal de consulta del aspirante.
                  </p>
                  <textarea
                    rows={3}
                    value={textoObservaciones}
                    onChange={(e) => setTextoObservaciones(e.target.value)}
                    placeholder="Ej. Favor de re-subir el Acta de Nacimiento con mayor claridad..."
                    className="w-full p-3 text-xs bg-white border border-amber-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 uppercase font-medium"
                  />
                </div>
              </div>

              <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap justify-between items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedSolicitud(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition shadow-2xs"
                >
                  Cerrar
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleEnviarObservaciones}
                    className="px-4 py-2.5 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-400 rounded-xl transition shadow-2xs"
                  >
                    ⚠️ Marcar Pendiente / Requerir Correcciones
                  </button>

                  <button
                    type="button"
                    onClick={handleAprobarExpediente}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-md"
                  >
                    ✓ Aprobar, Generar Matrícula y Contraseña Única
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
