import React, { useState } from 'react';

// 1. Datos de prueba: Solicitudes de Aspirantes
const INITIAL_APPLICATIONS = [
  {
    id: 1,
    folio: 'BEL-2026-1045',
    fullName: 'María Fernanda Ruiz Morales',
    curp: 'RUMF050312HDFRRN01',
    email: 'mfernanda.ruiz@gmail.com',
    phone: '2281458920',
    admissionType: 'nuevo_ingreso',
    originSchool: 'Secundaria General No. 5',
    gradYear: 2024,
    average: '9.4',
    studyCertName: 'Certificado_Secundaria_Ruiz.pdf',
    status: 'Pendiente',
    registrationDate: '2026-08-18',
    assignedMatricula: null,
  },
  {
    id: 2,
    folio: 'BEL-2026-2180',
    fullName: 'Carlos Alberto Domínguez Vera',
    curp: 'DOVC041120HDFRRN09',
    email: 'carlos.dominguez@hotmail.com',
    phone: '2299874123',
    admissionType: 'equivalencia',
    originSchool: 'Telesecundaria Benito Juárez',
    previousHighSchool: 'COBAEV Plantel 35',
    gradYear: 2023,
    average: '8.1',
    studyCertName: 'Certificado_Secundaria_Carlos.pdf',
    partialCertName: 'Historial_COBAEV_Oficial.pdf',
    status: 'Pendiente',
    registrationDate: '2026-08-18',
    assignedMatricula: null,
  }
];

// 2. Datos de prueba: Directorio de Alumnos Activos
const INITIAL_STUDENTS = [
  {
    id: 101,
    matricula: 'BEL2401089',
    fullName: 'Alejandro Morales Mendoza',
    curp: 'MOMA040215HDFRRN08',
    email: 'alejandro.morales@estudiante.belver.edu.mx',
    phone: '2288334455',
    status: 'Activo / Regular',
    currentSemester: '4to Semestre',
    admissionType: 'Nuevo Ingreso',
    originSchool: 'Secundaria Técnica No. 12',
    address: 'Calle Juárez #45, Col. Centro, Xalapa, Ver.',
    emergencyContact: 'Rosa Mendoza (Madre) - 2288990011',
    pendingPayments: 0,
    documentsValidated: true,
  },
  {
    id: 102,
    matricula: 'BEL2502014',
    fullName: 'Sofía Valenzuela Herrera',
    curp: 'VAHS050619MDFRRN03',
    email: 'sofia.valenzuela@estudiante.belver.edu.mx',
    phone: '2291238899',
    status: 'Baja Temporal',
    currentSemester: '2do Semestre',
    admissionType: 'Equivalencia (COBAEV)',
    originSchool: 'Secundaria Federal 1',
    address: 'Av. Las Palmas #102, Veracruz, Ver.',
    emergencyContact: 'Jorge Valenzuela (Padre) - 2297654321',
    pendingPayments: 1,
    documentsValidated: true,
  }
];

export default function CaePage() {
  const [currentTab, setCurrentTab] = useState('solicitudes'); // 'solicitudes' | 'alumnos' | 'metricas'
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
  const [students, setStudents] = useState(INITIAL_STUDENTS);

  // Estados para modales y filtros
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [rejectReason, setRejectReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);

  // Dictamen de Aspirantes
  const handleApprove = (app) => {
    const nextMatricula = `BEL${new Date().getFullYear().toString().slice(-2)}${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Actualizar Solicitud
    setApplications((prev) =>
      prev.map((item) =>
        item.id === app.id ? { ...item, status: 'Aprobado', assignedMatricula: nextMatricula } : item
      )
    );

    // Integrar de inmediato al Directorio de Alumnos Activos
    const newStudent = {
      id: Date.now(),
      matricula: nextMatricula,
      fullName: app.fullName,
      curp: app.curp,
      email: app.email,
      phone: app.phone,
      status: 'Activo / Regular',
      currentSemester: '1er Semestre',
      admissionType: app.admissionType === 'equivalencia' ? 'Equivalencia' : 'Nuevo Ingreso',
      originSchool: app.originSchool,
      address: 'Registrado en formulario de admisión',
      emergencyContact: 'Por capturar en primer acceso',
      pendingPayments: 0,
      documentsValidated: true
    };
    setStudents((prev) => [newStudent, ...prev]);

    setActionSuccess(`¡Aprobado con éxito! Se asignó la matrícula ${nextMatricula} y se integró al directorio de alumnos.`);
    setSelectedApp(null);
    setTimeout(() => setActionSuccess(null), 6000);
  };

  const handleReject = (id) => {
    if (!rejectReason.trim()) {
      alert('Ingresa las observaciones del rechazo para notificar al aspirante.');
      return;
    }
    setApplications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Rechazado' } : item))
    );
    setActionSuccess('Solicitud rechazada. Se enviaron las observaciones por correo.');
    setRejectReason('');
    setSelectedApp(null);
    setTimeout(() => setActionSuccess(null), 6000);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Encabezado Principal */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-900 px-2.5 py-1 rounded-md">
              Módulo de Control Escolar Interno
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Centro de Atención Estudiantil (CAE)
            </h1>
            <p className="text-xs text-slate-500">
              Sistema integral de validación de nuevo ingreso, gestión de expedientes y consulta de alumnos BELVER.
            </p>
          </div>
        </div>

        {/* Mensaje de Alerta */}
        {actionSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex justify-between items-center shadow-sm">
            <span>✓ {actionSuccess}</span>
            <button onClick={() => setActionSuccess(null)} className="font-bold ml-2">✕</button>
          </div>
        )}

        {/* Barra de Pestañas de Navegación */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => { setCurrentTab('solicitudes'); setSearchTerm(''); }}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              currentTab === 'solicitudes'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>📥 Validación de Aspirantes</span>
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px]">
              {applications.filter(a => a.status === 'Pendiente').length}
            </span>
          </button>

          <button
            onClick={() => { setCurrentTab('alumnos'); setSearchTerm(''); }}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              currentTab === 'alumnos'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>👥 Directorio de Alumnos</span>
            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px]">
              {students.length}
            </span>
          </button>
        </div>

        {/* ---------------- PESTAÑA 1: VALIDACIÓN DE ASPIRANTES ---------------- */}
        {currentTab === 'solicitudes' && (
          <div className="space-y-4">
            
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <input
                type="text"
                placeholder="Buscar por Folio, Nombre o CURP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-80 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-slate-800"
              />

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-slate-500">Estatus:</span>
                {['Todos', 'Pendiente', 'Aprobado', 'Rechazado'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                      filterStatus === st
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabla Aspirantes */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Folio</th>
                      <th className="p-4">Aspirante</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4 text-center">Estatus</th>
                      <th className="p-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-mono font-bold text-blue-950">{app.folio}</td>
                        <td className="p-4 font-medium text-slate-900">
                          {app.fullName}
                          <div className="text-[11px] text-slate-400">{app.curp}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {app.admissionType === 'equivalencia' ? 'Equivalencia' : 'Nuevo Ingreso'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            app.status === 'Pendiente' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            app.status === 'Aprobado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 text-xs transition"
                          >
                            Revisar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- PESTAÑA 2: DIRECTORIO DE ALUMNOS ---------------- */}
        {currentTab === 'alumnos' && (
          <div className="space-y-4">
            
            {/* Buscador de Alumnos */}
            <div className="flex justify-between items-center gap-3">
              <input
                type="text"
                placeholder="Buscar por Matrícula, Nombre o Semestre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-96 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>

            {/* Tabla Alumnos */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Matrícula</th>
                      <th className="p-4">Nombre del Alumno</th>
                      <th className="p-4">Semestre</th>
                      <th className="p-4">Estatus Escolar</th>
                      <th className="p-4 text-right">Ficha Técnica</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students
                      .filter(st => 
                        st.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        st.matricula.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50 transition">
                          <td className="p-4 font-mono font-bold text-blue-950">{st.matricula}</td>
                          <td className="p-4 font-medium text-slate-900">
                            {st.fullName}
                            <div className="text-[11px] text-slate-400">{st.email}</div>
                          </td>
                          <td className="p-4 font-semibold text-slate-700">{st.currentSemester}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              st.status.includes('Activo') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {st.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedStudent(st)}
                              className="px-3 py-1.5 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 text-xs transition"
                            >
                              Ver Perfil
                            </button>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- MODAL DE PERFIL DEL ALUMNO (CAE) ---------------- */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
              
              <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm">
                    {selectedStudent.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{selectedStudent.fullName}</h3>
                    <p className="text-xs text-slate-300 font-mono">Matrícula: {selectedStudent.matricula}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <div className="p-6 space-y-5 text-xs text-slate-700 overflow-y-auto max-h-[75vh]">
                
                {/* Estatus Rápido */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Estatus</span>
                    <span className="font-bold text-emerald-700">{selectedStudent.status}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Grado Actual</span>
                    <span className="font-bold text-slate-900">{selectedStudent.currentSemester}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Modalidad</span>
                    <span className="font-bold text-blue-900">{selectedStudent.admissionType}</span>
                  </div>
                </div>

                {/* Información Personal y Contacto */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b pb-1">
                    Datos Generales y Contacto
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><strong>CURP:</strong> <span className="font-mono">{selectedStudent.curp}</span></div>
                    <div><strong>Teléfono:</strong> {selectedStudent.phone}</div>
                    <div className="sm:col-span-2"><strong>Correo Institucional:</strong> {selectedStudent.email}</div>
                    <div className="sm:col-span-2"><strong>Domicilio:</strong> {selectedStudent.address}</div>
                    <div className="sm:col-span-2 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900">
                      <strong>Contacto de Emergencia:</strong> {selectedStudent.emergencyContact}
                    </div>
                  </div>
                </div>

                {/* Antecedentes Escolares */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b pb-1">
                    Antecedentes Académicos
                  </h4>
                  <p><strong>Escuela de Procedencia:</strong> {selectedStudent.originSchool}</p>
                  <p><strong>Expediente Digital:</strong> Cotejado y resguardado en base institucional ✓</p>
                </div>

              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
                >
                  Cerrar Perfil
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ---------------- MODAL DE DICTAMEN DE ASPIRANTE ---------------- */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
              
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="font-bold text-xs">Revisión de Aspirante: {selectedApp.folio}</h3>
                <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <div className="p-5 space-y-4 text-xs text-slate-700">
                <div>
                  <p className="text-sm font-bold text-slate-900">{selectedApp.fullName}</p>
                  <p className="text-slate-500 font-mono">{selectedApp.curp}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div><strong>Secundaria:</strong> {selectedApp.originSchool} (Promedio: {selectedApp.average})</div>
                  {selectedApp.admissionType === 'equivalencia' && (
                    <div className="text-amber-800"><strong>Bachillerato Anterior:</strong> {selectedApp.previousHighSchool}</div>
                  )}
                  <div><strong>Documento Cargado:</strong> {selectedApp.studyCertName} (PDF)</div>
                </div>

                {selectedApp.status === 'Pendiente' && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 text-[11px] uppercase">
                      Motivo de Rechazo (Opcional):
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Escribe la observación si el certificado es ilegible..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-slate-800"
                    />
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <button onClick={() => setSelectedApp(null)} className="px-3 py-1.5 text-slate-600 text-xs font-semibold">
                  Cerrar
                </button>

                {selectedApp.status === 'Pendiente' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(selectedApp.id)}
                      className="px-3 py-1.5 text-red-700 bg-red-50 border border-red-200 rounded-lg font-semibold text-xs hover:bg-red-100"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => handleApprove(selectedApp)}
                      className="px-4 py-1.5 text-white bg-blue-900 rounded-lg font-bold text-xs hover:bg-blue-800 shadow"
                    >
                      Aprobar y Emitir Matrícula
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}