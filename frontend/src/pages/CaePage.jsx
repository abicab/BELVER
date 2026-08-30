import React, { useState } from "react";

// Catálogo de alumnos matriculados activos en el sistema BELVER (con datos demográficos completos)
const INITIAL_STUDENTS = [
  {
    id: 1,
    matricula: "B26000001",
    curp: "RUAM050819MVERRL02",
    nombre: "María Fernanda",
    apellidos: "Ruiz Morales",
    email: "maria.ruiz@gmail.com",
    telefono: "2281456789",
    genderIdentity: "Femenino",
    hasDisability: "No",
    employmentStatus: "No trabaja",
    hasComputer: "Sí",
    hasInternet: "Sí",
    emergenciaContacto: "Roberto Ruiz (Padre)",
    emergenciaTelefono: "2289876543",
    direccion: {
      calle: "Av. Xalapa #123",
      colonia: "Progreso",
      municipio: "Xalapa",
      estado: "Veracruz",
      cp: "91000",
    },
    modalidadIngreso: "Nuevo Ingreso",
    semestreActual: 1,
    estatusAcademico: "ACTIVO_REGULAR", // 'ACTIVO_REGULAR' | 'RECURSAMIENTO' | 'BAJA_TEMPORAL'
    materiasInscritas: [
      { codigo: "MAT-101", nombre: "Matemáticas I", estatus: "Cursando" },
      { codigo: "QUI-101", nombre: "Química I", estatus: "Cursando" },
      { codigo: "ETI-101", nombre: "Ética y Valores I", estatus: "Cursando" },
    ],
    historialCalificaciones: [],
  },
  {
    id: 2,
    matricula: "B26000002",
    curp: "DOEC040112HDFRNR09",
    nombre: "Carlos Eduardo",
    apellidos: "Domínguez Solís",
    email: "carlos.dominguez@outlook.com",
    telefono: "2288901234",
    genderIdentity: "Masculino",
    hasDisability: "No",
    employmentStatus: "Medio tiempo",
    hasComputer: "Sí",
    hasInternet: "Sí",
    emergenciaContacto: "Elena Solís (Madre)",
    emergenciaTelefono: "2283344556",
    direccion: {
      calle: "C. Juárez #45",
      colonia: "Centro",
      municipio: "Coatepec",
      estado: "Veracruz",
      cp: "91500",
    },
    modalidadIngreso: "Revalidación / Equivalencia",
    semestreActual: 2,
    estatusAcademico: "ACTIVO_REGULAR",
    materiasInscritas: [
      { codigo: "MAT-201", nombre: "Matemáticas II", estatus: "Cursando" },
      { codigo: "QUI-201", nombre: "Química II", estatus: "Cursando" },
      {
        codigo: "TLR-201",
        nombre: "Taller de Lectura y Redacción II",
        estatus: "Cursando",
      },
    ],
    historialCalificaciones: [
      {
        materia: "Matemáticas I",
        calificacion: 8.5,
        origen: "Revalidada (COBAEV 35)",
      },
      {
        materia: "Química I",
        calificacion: 9.0,
        origen: "Revalidada (COBAEV 35)",
      },
      {
        materia: "Ética y Valores I",
        calificacion: 10.0,
        origen: "Revalidada (COBAEV 35)",
      },
    ],
  },
  {
    id: 3,
    matricula: "B25000140",
    curp: "HERA020411MVERND03",
    nombre: "Alejandro",
    apellidos: "Hernández Rivas",
    email: "alejandro.hr@gmail.com",
    telefono: "2299887766",
    genderIdentity: "Masculino",
    hasDisability: "No",
    employmentStatus: "No trabaja",
    hasComputer: "Sí",
    hasInternet: "Sí",
    emergenciaContacto: "Martha Rivas (Madre)",
    emergenciaTelefono: "2291234567",
    direccion: {
      calle: "Av. Díaz Mirón #789",
      colonia: "Moderno",
      municipio: "Veracruz",
      estado: "Veracruz",
      cp: "91910",
    },
    modalidadIngreso: "Nuevo Ingreso",
    semestreActual: 3,
    estatusAcademico: "RECURSAMIENTO",
    materiasInscritas: [
      {
        codigo: "FIS-101",
        nombre: "Física I (Recurse)",
        estatus: "Recursando",
      },
      {
        codigo: "HIS-301",
        nombre: "Historia de México I",
        estatus: "Cursando",
      },
      { codigo: "LIT-301", nombre: "Literatura I", estatus: "Cursando" },
    ],
    historialCalificaciones: [
      { materia: "Matemáticas I", calificacion: 7.0, origen: "BELVER" },
      { materia: "Matemáticas II", calificacion: 8.0, origen: "BELVER" },
      {
        materia: "Física I",
        calificacion: 5.0,
        origen: "BELVER (No Acreditada)",
      },
    ],
  },
];

export default function CaePage() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstatus, setFilterEstatus] = useState("TODOS");
  const [filterSemestre, setFilterSemestre] = useState("TODOS");

  // Modales
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  // Filtrado reactivo de estudiantes
  const filteredStudents = students.filter((st) => {
    const fullName = `${st.nombre} ${st.apellidos}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      st.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.curp.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEstatus =
      filterEstatus === "TODOS" || st.estatusAcademico === filterEstatus;
    const matchesSemestre =
      filterSemestre === "TODOS" ||
      st.semestreActual.toString() === filterSemestre;

    return matchesSearch && matchesEstatus && matchesSemestre;
  });

  // Abrir vista detallada de expediente
  const handleViewExpediente = (student) => {
    setSelectedStudent(student);
    setIsEditing(false);
  };

  // Iniciar edición de información personal
  const handleStartEdit = (student) => {
    setEditFormData({
      id: student.id,
      nombre: student.nombre,
      apellidos: student.apellidos,
      email: student.email,
      telefono: student.telefono,
      emergenciaContacto: student.emergenciaContacto,
      emergenciaTelefono: student.emergenciaTelefono,
      calle: student.direccion.calle,
      colonia: student.direccion.colonia,
      municipio: student.direccion.municipio,
      estado: student.direccion.estado,
      cp: student.direccion.cp,
    });
    setIsEditing(true);
  };

  // Guardar cambios en el expediente
  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updatedList = students.map((st) => {
      if (st.id === editFormData.id) {
        return {
          ...st,
          nombre: editFormData.nombre,
          apellidos: editFormData.apellidos,
          email: editFormData.email,
          telefono: editFormData.telefono,
          emergenciaContacto: editFormData.emergenciaContacto,
          emergenciaTelefono: editFormData.emergenciaTelefono,
          direccion: {
            calle: editFormData.calle,
            colonia: editFormData.colonia,
            municipio: editFormData.municipio,
            estado: editFormData.estado,
            cp: editFormData.cp,
          },
        };
      }
      return st;
    });

    setStudents(updatedList);

    if (selectedStudent && selectedStudent.id === editFormData.id) {
      setSelectedStudent(updatedList.find((s) => s.id === editFormData.id));
    }

    alert(
      "Información personal del estudiante actualizada exitosamente en el CAE.",
    );
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Encabezado del Módulo CAE */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-950 text-white px-2.5 py-1 rounded-md">
              Centro de Atención Estudiantil (CAE)
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              Consultas y Seguimiento de Expedientes de Alumnos
            </h1>
            <p className="text-xs text-slate-500">
              Módulo de soporte interno para consulta de trayectoria académica y
              actualización de datos personales.
            </p>
          </div>

          <div className="flex items-center gap-4 self-start md:self-auto bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                Matrícula Activa Total
              </span>
              <span className="text-lg font-black text-slate-900">
                {students.length} Estudiantes
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Buscador */}
          <div className="relative w-full lg:w-96">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por Matrícula, CURP o Nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition"
            />
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto justify-end">
            {/* Filtro Estatus Académico */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs w-full sm:w-auto">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-2">
                Situación:
              </span>
              <select
                value={filterEstatus}
                onChange={(e) => setFilterEstatus(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold py-1 px-2.5 rounded-lg outline-none cursor-pointer focus:ring-1 focus:ring-slate-800"
              >
                <option value="TODOS">Todos</option>
                <option value="ACTIVO_REGULAR">Regular</option>
                <option value="RECURSAMIENTO">Recursamiento</option>
                <option value="BAJA_TEMPORAL">Baja Temporal</option>
              </select>
            </div>

            {/* Filtro Semestre */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs w-full sm:w-auto">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-2">
                Semestre:
              </span>
              <select
                value={filterSemestre}
                onChange={(e) => setFilterSemestre(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold py-1 px-2.5 rounded-lg outline-none cursor-pointer focus:ring-1 focus:ring-slate-800"
              >
                <option value="TODOS">Todos los Semestres</option>
                <option value="1">1° Semestre</option>
                <option value="2">2° Semestre</option>
                <option value="3">3° Semestre</option>
                <option value="4">4° Semestre</option>
                <option value="5">5° Semestre</option>
                <option value="6">6° Semestre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de Alumnos */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Matrícula / CURP</th>
                  <th className="p-4">Nombre del Estudiante</th>
                  <th className="p-4">Semestre / Modalidad</th>
                  <th className="p-4">Contacto Directo</th>
                  <th className="p-4 text-center">Situación Escolar</th>
                  <th className="p-4 text-right">Acciones CAE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-8 text-center text-slate-400 text-xs"
                    >
                      No se encontraron estudiantes con los criterios de
                      búsqueda especificados.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <span className="font-mono font-bold text-blue-950 block">
                          {st.matricula}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {st.curp}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">
                          {st.nombre} {st.apellidos}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {st.direccion.municipio}, {st.direccion.estado}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800 block">
                          {st.semestreActual}° Semestre
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase">
                          {st.modalidadIngreso}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-800 block">{st.email}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {st.telefono}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            st.estatusAcademico === "ACTIVO_REGULAR"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : st.estatusAcademico === "RECURSAMIENTO"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {st.estatusAcademico === "ACTIVO_REGULAR"
                            ? "Regular"
                            : st.estatusAcademico === "RECURSAMIENTO"
                              ? "En Recursamiento"
                              : "Baja Temporal"}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleViewExpediente(st)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
                        >
                          👁️ Expediente
                        </button>
                        <button
                          onClick={() => handleStartEdit(st)}
                          className="px-2.5 py-1.5 bg-blue-950 hover:bg-blue-900 text-white font-semibold rounded-lg text-xs transition shadow-xs"
                        >
                          ✏️ Modificar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL 1: CONSULTA DETALLADA DE EXPEDIENTE (DISEÑO ESTILIZADO 3 TARJETAS) */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
              {/* Cabecera Estilizada Idéntica */}
              <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex justify-between items-center shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 font-bold text-base shadow-inner">
                    📂
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-extrabold text-base tracking-tight text-white">
                        Expediente Escolar CAE
                      </h3>
                      <span className="font-mono text-xs bg-blue-900/90 text-blue-200 px-2.5 py-0.5 rounded-md border border-blue-600/60 font-bold shadow-xs">
                        {selectedStudent.matricula}
                      </span>
                    </div>
                    <div className="text-xs text-slate-200 mt-1 flex items-center gap-2 font-semibold">
                      <span className="text-white text-sm tracking-wide">
                        👤 {selectedStudent.nombre} {selectedStudent.apellidos}
                      </span>
                      <span className="text-blue-400">•</span>
                      <span className="font-mono text-cyan-300 tracking-wider">
                        CURP: {selectedStudent.curp}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudent(null)}
                  className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700 shadow-sm"
                  title="Cerrar ventana"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-700">
                {/* Perfil Demográfico, Inclusión y Tecnológico (3 Tarjetas Estilizadas) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Tarjeta 1: Identidad e Inclusión */}
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-blue-950 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200/60 pb-1.5">
                      <span>🧬</span> Identidad e Inclusión
                    </div>
                    <div className="space-y-1 text-slate-700">
                      <p className="flex justify-between">
                        <span className="text-slate-500 font-medium">
                          Género:
                        </span>
                        <span className="font-semibold text-slate-900">
                          {selectedStudent.genderIdentity || "No especificado"}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-500 font-medium">
                          Discapacidad:
                        </span>
                        <span
                          className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${selectedStudent.hasDisability !== "No" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-700"}`}
                        >
                          {selectedStudent.hasDisability}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Tarjeta 2: Perfil En Línea */}
                  <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-indigo-950 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200/60 pb-1.5">
                      <span>💻</span> Perfil En Línea
                    </div>
                    <div className="space-y-1 text-slate-700">
                      <p className="flex justify-between">
                        <span className="text-slate-500 font-medium">
                          Laboral:
                        </span>
                        <span className="font-semibold text-slate-900">
                          {selectedStudent.employmentStatus}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-500 font-medium">
                          PC / Internet:
                        </span>
                        <span className="font-semibold text-indigo-950 font-mono">
                          {selectedStudent.hasComputer} /{" "}
                          {selectedStudent.hasInternet}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Tarjeta 3: Contacto y Emergencia */}
                  <div className="bg-gradient-to-br from-slate-50 to-amber-50/40 p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-950 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200/60 pb-1.5">
                      <span>🛡️</span> Contacto Directo
                    </div>
                    <div className="space-y-1 text-slate-700">
                      <p className="flex justify-between">
                        <span className="text-slate-500 font-medium">
                          Móvil:
                        </span>
                        <span className="font-semibold text-slate-900 font-mono">
                          {selectedStudent.telefono}
                        </span>
                      </p>
                      <p className="truncate">
                        <span className="text-slate-500 font-medium block">
                          Emergencia:
                        </span>
                        <span className="font-semibold text-slate-900 truncate block">
                          {selectedStudent.emergenciaContacto} (
                          {selectedStudent.emergenciaTelefono})
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Domicilio Registrado */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Domicilio Registrado
                  </span>
                  <span className="text-slate-800 font-medium text-xs">
                    {selectedStudent.direccion.calle}, Col.{" "}
                    {selectedStudent.direccion.colonia},{" "}
                    {selectedStudent.direccion.municipio},{" "}
                    {selectedStudent.direccion.estado} (
                    <span className="font-mono">
                      C.P. {selectedStudent.direccion.cp}
                    </span>
                    )
                  </span>
                </div>

                {/* Materias Cursando Actualmente */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">
                    Materias Activas del Mes (Semestre{" "}
                    {selectedStudent.semestreActual})
                  </span>
                  <div className="space-y-2">
                    {selectedStudent.materiasInscritas.map((m, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded-lg border border-slate-200">
                            {m.codigo}
                          </span>
                          <span className="font-semibold text-slate-800 text-xs">
                            {m.nombre}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-900 font-bold text-[10px] rounded-lg border border-blue-200">
                          {m.estatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Historial / Antecedentes */}
                {selectedStudent.historialCalificaciones.length > 0 && (
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">
                      Historial y Acreditaciones Previas
                    </span>
                    <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
                      {selectedStudent.historialCalificaciones.map((h, i) => (
                        <div
                          key={i}
                          className="p-3 flex justify-between items-center hover:bg-slate-50 transition"
                        >
                          <div>
                            <span className="font-semibold text-slate-800 block">
                              {h.materia}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {h.origen}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            {h.calificacion.toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pie del Modal con botones corporativos */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    handleStartEdit(selectedStudent);
                    setSelectedStudent(null);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
                >
                  <span>✏️</span> Editar Datos Personales
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: EDICIÓN DE INFORMACIÓN PERSONAL (CAE) */}
        {isEditing && editFormData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
                <h3 className="font-bold text-xs">
                  Modificar Información del Alumno (CAE)
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleSaveEdit}
                className="p-6 space-y-4 text-xs text-slate-700 overflow-y-auto"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">
                      Nombre(s)
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.nombre}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          nombre: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">
                      Apellidos
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.apellidos}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          apellidos: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      required
                      value={editFormData.email}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          email: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">
                      Teléfono Móvil
                    </label>
                    <input
                      type="tel"
                      required
                      value={editFormData.telefono}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          telefono: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                    />
                  </div>
                </div>

                {/* Contacto de Emergencia */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">
                      Contacto de Emergencia
                    </label>
                    <input
                      type="text"
                      value={editFormData.emergenciaContacto}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          emergenciaContacto: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800 bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">
                      Teléfono de Emergencia
                    </label>
                    <input
                      type="tel"
                      value={editFormData.emergenciaTelefono}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          emergenciaTelefono: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800 bg-white"
                    />
                  </div>
                </div>

                {/* Domicilio */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                    Actualización de Domicilio
                  </span>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="font-semibold text-slate-800">
                        Calle y Número
                      </label>
                      <input
                        type="text"
                        value={editFormData.calle}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            calle: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-slate-800">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        value={editFormData.cp}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            cp: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-slate-800">
                        Colonia
                      </label>
                      <input
                        type="text"
                        value={editFormData.colonia}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            colonia: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-slate-800">
                        Municipio
                      </label>
                      <input
                        type="text"
                        value={editFormData.municipio}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            municipio: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-slate-800">
                        Estado
                      </label>
                      <input
                        type="text"
                        value={editFormData.estado}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            estado: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0 -mx-6 -mb-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition shadow-md"
                  >
                    Guardar Cambios
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
