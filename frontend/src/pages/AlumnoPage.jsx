import React, { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:4000/api/alumno";

const mostrar = (valor) => {
  if (valor === null || valor === undefined || valor === "") return "No registrado";
  if (Array.isArray(valor)) return valor.length ? valor.join(", ") : "Ninguno registrado";
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  return String(valor);
};

const Campo = ({ etiqueta, valor, className = "" }) => (
  <div className={`rounded-xl border border-slate-200 bg-slate-50 p-3 ${className}`}>
    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
      {etiqueta}
    </span>
    <span className="break-words text-sm font-semibold text-slate-800">
      {mostrar(valor)}
    </span>
  </div>
);

const SeccionDatos = ({ titulo, children }) => (
  <section className="space-y-3">
    <h3 className="border-b border-slate-200 pb-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
      {titulo}
    </h3>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  </section>
);

const normalizarEstatus = (estatus) => String(estatus || "").toUpperCase();

const estiloEstatus = (estatus) => {
  const valor = normalizarEstatus(estatus);
  if (["APROBADO", "ACREDITADA", "ACREDITADO", "VALIDADO", "ACEPTADO"].includes(valor)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (["REPROBADA", "REPROBADO", "RECHAZADO", "NO_APROBADO", "OBSERVADO"].includes(valor)) {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }
  if (["CURSANDO", "EN CURSO"].includes(valor)) {
    return "border-blue-200 bg-blue-50 text-blue-800";
  }
  return "border-amber-200 bg-amber-50 text-amber-800";
};

const etiquetaEstatus = (estatus) => {
  const valor = normalizarEstatus(estatus);
  const etiquetas = {
    ACREDITADA: "Acreditada",
    ACREDITADO: "Acreditada",
    REPROBADA: "Reprobada",
    REPROBADO: "Reprobada",
    CURSANDO: "Cursando",
    PENDIENTE: "Pendiente",
    APROBADO: "Aprobado",
    RECHAZADO: "Rechazado",
    OBSERVADO: "Observado",
    VALIDADO: "Validado",
    ACEPTADO: "Aceptado",
  };
  return etiquetas[valor] || estatus || "Pendiente";
};

export default function AlumnoPage({ alumno: alumnoProp }) {
  const [activeTab, setActiveTab] = useState("inicio");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [documentoAbriendo, setDocumentoAbriendo] = useState(null);
  const [alumnoData, setAlumnoData] = useState(null);
  const [materiasCursando, setMateriasCursando] = useState([]);
  const [documentosExpediente, setDocumentosExpediente] = useState([]);
  const [kardexPlanCompleto, setKardexPlanCompleto] = useState([]);
  const [resumenAcademico, setResumenAcademico] = useState(null);
  const [openSemestres, setOpenSemestres] = useState({});

  const alumnoId = alumnoProp?.rawId ?? alumnoProp?.id ?? null;

  useEffect(() => {
    let cancelado = false;

    const cargarPerfil = async () => {
      if (!alumnoId || !Number.isInteger(Number(alumnoId)) || Number(alumnoId) <= 0) {
        setErrorMsg("No se recibió un identificador válido del alumno.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMsg("");
        const response = await fetch(`${API_URL}/${encodeURIComponent(alumnoId)}`);
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error || "No se pudo cargar la información del alumno.");
        }

        if (cancelado) return;
        setAlumnoData(data.alumno);
        setMateriasCursando(data.materiasCursando || []);
        setDocumentosExpediente(data.documentosExpediente || []);
        setKardexPlanCompleto(data.kardexPlanCompleto || []);
        setResumenAcademico(data.resumenAcademico || null);
        setOpenSemestres(
          Object.fromEntries((data.kardexPlanCompleto || []).map((bloque, index) => [index, index === 0]))
        );
      } catch (error) {
        if (!cancelado) {
          console.error("Error al cargar el perfil del alumno:", error);
          setErrorMsg(error.message || "Error al sincronizar los datos con el servidor.");
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    cargarPerfil();
    return () => {
      cancelado = true;
    };
  }, [alumnoId]);

  const documentosAgrupados = useMemo(() => {
    return documentosExpediente.reduce((grupos, documento) => {
      const categoria = documento.tipo || "Otros documentos";
      if (!grupos[categoria]) grupos[categoria] = [];
      grupos[categoria].push(documento);
      return grupos;
    }, {});
  }, [documentosExpediente]);

  const toggleSemestre = (index) => {
    setOpenSemestres((actual) => ({ ...actual, [index]: !actual[index] }));
  };

  const handleVisualizarDocumento = async (docId, nombreDoc) => {
    const ventana = window.open("", "_blank");
    if (!ventana) {
      alert("Permite las ventanas emergentes para visualizar el documento.");
      return;
    }

    ventana.document.title = `Cargando: ${nombreDoc}`;
    ventana.document.body.innerHTML =
      '<p style="font-family:Arial,sans-serif;padding:24px;color:#334155">Cargando documento...</p>';
    setDocumentoAbriendo(String(docId));

    try {
      const response = await fetch(`${API_URL}/documento/${encodeURIComponent(docId)}`);
      if (!response.ok) {
        let mensaje = "No se pudo recuperar el documento.";
        try {
          const data = await response.json();
          mensaje = data.mensaje || data.error || mensaje;
        } catch {
          // La respuesta no contenía JSON.
        }
        throw new Error(mensaje);
      }

      const blob = await response.blob();
      if (!blob.size) throw new Error("El documento está vacío.");

      const url = window.URL.createObjectURL(blob);
      ventana.location.href = url;
      window.setTimeout(() => window.URL.revokeObjectURL(url), 120000);
    } catch (error) {
      ventana.close();
      alert(error.message || "No fue posible visualizar el documento.");
    } finally {
      setDocumentoAbriendo(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="animate-pulse text-sm font-semibold text-slate-600">
          Cargando información del alumno...
        </p>
      </div>
    );
  }

  if (errorMsg || !alumnoData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="max-w-lg rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-bold text-rose-700">
            {errorMsg || "No se encontró información del alumno."}
          </p>
        </div>
      </div>
    );
  }

  const nombreCompleto = alumnoData.nombreCompleto || `${alumnoData.nombre || ""} ${alumnoData.apellidos || ""}`.trim();

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-7">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
          <div>
            <span className="rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Portal del estudiante · BELVER
            </span>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-900">{nombreCompleto}</h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>Matrícula: <strong className="font-mono text-slate-900">{mostrar(alumnoData.matricula)}</strong></span>
              <span>Modalidad: <strong className="text-slate-800">{mostrar(alumnoData.modalidadIngreso)}</strong></span>
              <span>Folio: <strong className="font-mono text-slate-800">{mostrar(alumnoData.folio)}</strong></span>
            </div>
          </div>

          <nav className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1.5">
            {[
              ["inicio", "Inicio"],
              ["datos", "Datos"],
              ["expediente", "Expediente"],
              ["kardex", "Kárdex"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                  activeTab === id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </header>

        {activeTab === "inicio" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Materias del plan", resumenAcademico?.totalMaterias ?? 0],
                ["Acreditadas", resumenAcademico?.acreditadas ?? 0],
                ["Cursando", resumenAcademico?.cursando ?? 0],
                ["Pendientes", resumenAcademico?.pendientes ?? 0],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
                </div>
              ))}
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">Materias en cursamiento</h2>
                  <p className="mt-1 text-xs text-slate-500">Materias que aparecen actualmente como cursando en el historial.</p>
                </div>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
                  {materiasCursando.length} registradas
                </span>
              </div>

              {materiasCursando.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                  No hay materias registradas como cursando.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {materiasCursando.map((materia) => (
                    <article key={materia.id} className="rounded-xl border border-slate-200 p-4">
                      <span className="font-mono text-[10px] font-bold text-slate-500">{materia.codigo}</span>
                      <h3 className="mt-1 text-sm font-bold text-slate-900">{materia.nombre}</h3>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-800">Cursando</span>
                        <span className="text-xs text-slate-500">
                          Calificación: <strong className="text-slate-800">{materia.calificacion ?? "Sin calificación"}</strong>
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-extrabold text-slate-900">Situación del alumno</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${estiloEstatus(alumnoData.estatusAcademico)}`}>
                  {etiquetaEstatus(alumnoData.estatusAcademico)}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${estiloEstatus(alumnoData.dictamenExpediente)}`}>
                  Expediente: {etiquetaEstatus(alumnoData.dictamenExpediente)}
                </span>
              </div>
              {alumnoData.planEstudiosNombre && (
                <p className="mt-3 text-xs text-slate-600">
                  Plan asignado: <strong className="text-slate-900">{alumnoData.planEstudiosNombre}</strong>
                  {alumnoData.planEstudiosClave ? ` (${alumnoData.planEstudiosClave})` : ""}
                </p>
              )}
            </section>
          </div>
        )}

        {activeTab === "datos" && (
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Datos generales del alumno</h2>
              <p className="mt-1 text-xs text-slate-500">Información registrada durante el proceso de ingreso y en el control escolar.</p>
            </div>

            <SeccionDatos titulo="Identificación personal">
              <Campo etiqueta="Nombre completo" valor={nombreCompleto} />
              <Campo etiqueta="Matrícula" valor={alumnoData.matricula} />
              <Campo etiqueta="Folio de registro" valor={alumnoData.folio} />
              <Campo etiqueta="CURP" valor={alumnoData.curp} />
              <Campo etiqueta="Fecha de nacimiento" valor={alumnoData.fechaNacimiento} />
              <Campo etiqueta="Género" valor={alumnoData.genero} />
              <Campo etiqueta="Identidad cultural" valor={alumnoData.identidadCultural} />
              <Campo etiqueta="Discapacidad(es)" valor={alumnoData.discapacidades} className="sm:col-span-2" />
            </SeccionDatos>

            <SeccionDatos titulo="Información de contacto">
              <Campo etiqueta="Correo electrónico principal" valor={alumnoData.correoElectronico1} />
              <Campo etiqueta="Correo electrónico alternativo" valor={alumnoData.correoElectronico2} />
              <Campo etiqueta="Teléfono celular" valor={alumnoData.telefonoCelular} />
              <Campo etiqueta="Teléfono particular" valor={alumnoData.telefonoParticular} />
            </SeccionDatos>

            <SeccionDatos titulo="Domicilio particular">
              <Campo etiqueta="País" valor={alumnoData.pais} />
              <Campo etiqueta="Estado" valor={alumnoData.estado} />
              <Campo etiqueta="Municipio" valor={alumnoData.municipio} />
              <Campo etiqueta="Colonia" valor={alumnoData.colonia} />
              <Campo etiqueta="Calle" valor={alumnoData.calle} />
              <Campo etiqueta="Número exterior" valor={alumnoData.numeroExterior} />
              <Campo etiqueta="Número interior" valor={alumnoData.numeroInterior} />
              <Campo etiqueta="Código postal" valor={alumnoData.codigoPostal} />
              <Campo etiqueta="Domicilio completo" valor={alumnoData.direccion} className="sm:col-span-2" />
            </SeccionDatos>

            <SeccionDatos titulo="Tutor o responsable">
              <Campo etiqueta="Nombre del tutor" valor={alumnoData.tutor?.nombreCompleto} />
              <Campo etiqueta="Parentesco" valor={alumnoData.tutor?.parentesco} />
              <Campo etiqueta="Teléfono del tutor" valor={alumnoData.tutor?.telefono} />
            </SeccionDatos>

            <SeccionDatos titulo="Procedencia escolar e ingreso">
              <Campo etiqueta="Modalidad de ingreso" valor={alumnoData.modalidadIngreso} />
              <Campo etiqueta="Subsistema de procedencia" valor={alumnoData.subsistemaProcedencia} />
              <Campo etiqueta="Nombre de la escuela" valor={alumnoData.nombreEscuelaProcedencia} />
              <Campo etiqueta="CCT de procedencia" valor={alumnoData.cctEscuelaProcedencia} />
              <Campo etiqueta="Sistema de procedencia" valor={alumnoData.otroSistemaProcedencia || alumnoData.sistemaProcedenciaLetra} />
              <Campo etiqueta="Tipo de estudiante" valor={alumnoData.tipoEstudiante} />
              <Campo etiqueta="Semestre registrado" valor={alumnoData.semestreActual} />
              <Campo etiqueta="Semestres seleccionados" valor={alumnoData.semestresSeleccionados} className="sm:col-span-2" />
            </SeccionDatos>

            <SeccionDatos titulo="Información académica y administrativa">
              <Campo etiqueta="Estatus académico" valor={etiquetaEstatus(alumnoData.estatusAcademico)} />
              <Campo etiqueta="Plan de estudios" valor={alumnoData.planEstudiosNombre} />
              <Campo etiqueta="Clave del plan" valor={alumnoData.planEstudiosClave} />
              <Campo etiqueta="Alumno migrado" valor={alumnoData.esMigrado ? "Sí" : "No"} />
              <Campo etiqueta="Fecha de registro" valor={alumnoData.fechaRegistro} />
              <Campo etiqueta="Última actualización" valor={alumnoData.fechaActualizacion} />
            </SeccionDatos>
          </div>
        )}

        {activeTab === "expediente" && (
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Expediente digital</h2>
                <p className="mt-1 text-xs text-slate-500">Documentos cargados y estado de revisión registrado por control escolar.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs">
                <span className="text-slate-500">Dictamen general: </span>
                <strong className="text-slate-900">{etiquetaEstatus(alumnoData.dictamenExpediente)}</strong>
              </div>
            </div>

            {alumnoData.observacionesExpediente && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-amber-800">Observaciones generales</p>
                <p className="mt-1 whitespace-pre-wrap text-xs text-amber-900">{alumnoData.observacionesExpediente}</p>
                {alumnoData.fechaValidacionExpediente && (
                  <p className="mt-2 text-[10px] text-amber-700">Última validación: {alumnoData.fechaValidacionExpediente}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-400">Documentos registrados</p>
                <p className="mt-1 text-xl font-black text-slate-900">{documentosExpediente.length}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-400">Archivos disponibles</p>
                <p className="mt-1 text-xl font-black text-slate-900">{documentosExpediente.filter((doc) => doc.disponible).length}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-400">Con observaciones</p>
                <p className="mt-1 text-xl font-black text-slate-900">{documentosExpediente.filter((doc) => doc.observaciones).length}</p>
              </div>
            </div>

            {documentosExpediente.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-sm font-bold text-slate-700">No hay documentos registrados</p>
                <p className="mt-1 text-xs text-slate-500">Los archivos del expediente aparecerán aquí cuando sean cargados.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(documentosAgrupados).map(([categoria, documentos]) => (
                  <section key={categoria} className="overflow-hidden rounded-xl border border-slate-200">
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                      <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-700">{categoria}</h3>
                      <p className="mt-0.5 text-[10px] text-slate-500">{documentos.length} archivo(s)</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {documentos.map((doc) => (
                        <article key={doc.id} className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
                          <div className="min-w-0">
                            <p className="break-words text-sm font-bold text-slate-900">{doc.nombre}</p>
                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
                              <span>Formato: {doc.extension}</span>
                              <span>Registrado: {mostrar(doc.fecha)}</span>
                              <span>{doc.disponible ? "Archivo almacenado" : "Sin archivo almacenado"}</span>
                            </div>
                            {doc.observaciones && (
                              <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50 p-2 text-xs text-amber-900">
                                <strong>Observación:</strong> {doc.observaciones}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${estiloEstatus(doc.estatus)}`}>
                              {etiquetaEstatus(doc.estatus)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleVisualizarDocumento(doc.id, doc.nombre)}
                              disabled={!doc.disponible || documentoAbriendo === String(doc.id)}
                              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {documentoAbriendo === String(doc.id) ? "Abriendo..." : "Visualizar"}
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "kardex" && (
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-base font-extrabold text-slate-900">Kárdex académico</h2>
              <p className="mt-1 text-xs text-slate-500">
                {alumnoData.planEstudiosNombre
                  ? `${alumnoData.planEstudiosNombre}${alumnoData.planEstudiosClave ? ` · ${alumnoData.planEstudiosClave}` : ""}`
                  : "El alumno todavía no tiene un plan de estudios asignado."}
              </p>
            </div>

            {!alumnoData.planEstudiosNombre || kardexPlanCompleto.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-sm font-bold text-slate-700">No hay un plan de estudios para mostrar</p>
                <p className="mt-1 text-xs text-slate-500">
                  Cuando se asigne un plan al alumno, aquí aparecerán todas sus materias organizadas por semestre.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                  {[
                    ["ACREDITADA", "Acreditada"],
                    ["CURSANDO", "Cursando"],
                    ["REPROBADA", "Reprobada"],
                    ["PENDIENTE", "Pendiente"],
                  ].map(([estatus, label]) => (
                    <span key={estatus} className={`rounded-full border px-2.5 py-1 ${estiloEstatus(estatus)}`}>{label}</span>
                  ))}
                </div>

                <div className="space-y-3">
                  {kardexPlanCompleto.map((bloque, index) => (
                    <section key={bloque.numero} className="overflow-hidden rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => toggleSemestre(index)}
                        className="flex w-full flex-col justify-between gap-2 bg-slate-50 p-4 text-left transition hover:bg-slate-100 sm:flex-row sm:items-center"
                      >
                        <div>
                          <span className="text-xs font-extrabold uppercase tracking-wide text-slate-800">{bloque.semestre}</span>
                          <span className="ml-2 text-[10px] text-slate-500">{bloque.total} materias</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                          <span className="text-emerald-700">{bloque.acreditadas} acreditadas</span>
                          <span className="text-blue-700">{bloque.cursando} cursando</span>
                          <span className="text-rose-700">{bloque.reprobadas} reprobadas</span>
                          <span className="text-amber-700">{bloque.pendientes} pendientes</span>
                          <span className="ml-1 text-slate-500">{openSemestres[index] ? "▲ Ocultar" : "▼ Ver materias"}</span>
                        </div>
                      </button>

                      {openSemestres[index] && (
                        <div className="overflow-x-auto border-t border-slate-200">
                          <table className="w-full min-w-[650px] text-left text-xs">
                            <thead className="bg-white text-[10px] uppercase tracking-wide text-slate-500">
                              <tr>
                                <th className="p-3">Clave</th>
                                <th className="p-3">Materia</th>
                                <th className="p-3">Área</th>
                                <th className="p-3">Estatus</th>
                                <th className="p-3 text-right">Calificación</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {bloque.materias.map((materia) => (
                                <tr key={materia.id} className="hover:bg-slate-50">
                                  <td className="p-3 font-mono font-bold text-slate-700">{materia.codigo}</td>
                                  <td className="p-3 font-semibold text-slate-900">{materia.nombre}</td>
                                  <td className="p-3 text-slate-600">{mostrar(materia.areaSemestre)}</td>
                                  <td className="p-3">
                                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${estiloEstatus(materia.estatus)}`}>
                                      {etiquetaEstatus(materia.estatus)}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                                    {materia.calificacion ?? "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </section>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
