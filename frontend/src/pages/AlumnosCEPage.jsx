import React, { useState, useEffect } from "react";

export default function AlumnosCEPage() {
  const [alumnos, setAlumnos] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

  const cargarAlumnos = async () => {
    setCargando(true);
    try {
      const res = await fetch(
        `http://localhost:4000/api/controlescolar/aspirantes?estatus=APROBADO`,
      );
      const resultado = await res.json();
      if (res.ok && resultado.ok) {
        // Filtramos únicamente los registros que ya cuentan con matrícula asignada
        const soloAlumnos = (resultado.data || []).filter(
          (item) => item.matricula,
        );
        setAlumnos(soloAlumnos);
      }
    } catch (error) {
      console.error("Error al cargar la lista de alumnos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAlumnos();
  }, []);

  const alumnosFiltrados = alumnos.filter((alumn) => {
    const nombreCompleto =
      `${alumn.nombres} ${alumn.apellidoPaterno} ${alumn.apellidoMaterno || ""}`.toLowerCase();
    return (
      alumn.folio.toLowerCase().includes(busqueda.toLowerCase()) ||
      (alumn.matricula &&
        alumn.matricula.toLowerCase().includes(busqueda.toLowerCase())) ||
      nombreCompleto.includes(busqueda.toLowerCase()) ||
      alumn.curp.toLowerCase().includes(busqueda.toLowerCase())
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
              Padrón Oficial de Alumnos Activos
            </h1>
            <p className="text-xs text-slate-500">
              Gestión y supervisión de estudiantes con expediente validado,
              matrícula y contraseña institucional.
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
              placeholder="Buscar por Matrícula, Folio, CURP o Nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800"
            />
          </div>

          <button
            onClick={cargarAlumnos}
            className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
          >
            🔄 Actualizar
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Matrícula</th>
                  <th className="p-4">Alumno / CURP</th>
                  <th className="p-4">Modalidad</th>
                  <th className="p-4">Correo Electrónico</th>
                  <th className="p-4 text-center">Estatus</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cargando ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      Cargando padrón de alumnos...
                    </td>
                  </tr>
                ) : alumnosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      No se encontraron alumnos registrados con matrícula
                      activa.
                    </td>
                  </tr>
                ) : (
                  alumnosFiltrados.map((alumn) => (
                    <tr key={alumn.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-mono font-extrabold text-emerald-900 text-sm">
                        {alumn.matricula}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-900 block uppercase">{`${alumn.apellidoPaterno} ${alumn.apellidoMaterno || ""} ${alumn.nombres}`}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {alumn.curp}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-900">
                          {alumn.tipoAdmision}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {alumn.correoElectronico1}
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[10px] uppercase">
                          {alumn.estatusAcademico || "ACTIVO_REGULAR"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setAlumnoSeleccionado(alumn)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition shadow-sm"
                        >
                          Ver Expediente / Perfil
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Ficha Rápida del Alumno */}
        {alumnoSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
              <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-bold text-sm">
                    Ficha del Alumno: {alumnoSeleccionado.nombres}{" "}
                    {alumnoSeleccionado.apellidoPaterno}
                  </h3>
                  <span className="font-mono text-xs text-emerald-400">
                    Matrícula: {alumnoSeleccionado.matricula}
                  </span>
                </div>
                <button
                  onClick={() => setAlumnoSeleccionado(null)}
                  className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto text-xs bg-slate-50">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 border-b pb-1">
                    Datos Generales del Alumno
                  </h4>
                  <p>
                    <strong>CURP:</strong> {alumnoSeleccionado.curp}
                  </p>
                  <p>
                    <strong>Correo Electrónico:</strong>{" "}
                    {alumnoSeleccionado.correoElectronico1}
                  </p>
                  <p>
                    <strong>Teléfono Celular:</strong>{" "}
                    {alumnoSeleccionado.telefonoCelular}
                  </p>
                  <p>
                    <strong>Dirección:</strong> {alumnoSeleccionado.calle} #
                    {alumnoSeleccionado.numeroExterior || "S/N"}, Col.{" "}
                    {alumnoSeleccionado.colonia}, {alumnoSeleccionado.municipio}
                    , {alumnoSeleccionado.estado}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white border-t border-slate-200 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setAlumnoSeleccionado(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cerrar Ficha
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
