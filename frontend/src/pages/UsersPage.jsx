import React, { useState } from 'react';

const INITIAL_USERS = [
  // --- Usuarios originales preservados ---
  { id: 1, name: 'Administrador TI', username: 'admin_sys', roleCode: 'ADMIN', role: 'Super Administrador', estatus: 'Activo', email: 'admin_sys@belver.edu.mx', telefono: 'Sin registrar', fechaRegistro: '2026-01-01' },
  { id: 2, name: 'Coordinación Escolar', username: 'control_esc', roleCode: 'CONTROL_ESCOLAR', role: 'Control Escolar', estatus: 'Activo', email: 'control_esc@belver.edu.mx', telefono: 'Sin registrar', fechaRegistro: '2026-01-01' },
  { id: 3, name: 'Atención CAE', username: 'cae_atencion', roleCode: 'CAE', role: 'Personal CAE', estatus: 'Activo', email: 'cae_atencion@belver.edu.mx', telefono: 'Sin registrar', fechaRegistro: '2026-01-01' },
  { id: 4, name: 'Juan Pérez', username: '227000510', roleCode: 'ALUMNO', role: 'Alumno', estatus: 'Activo', email: 'juan.perez@belver.edu.mx', telefono: 'Sin registrar', fechaRegistro: '2026-01-01' },
  { id: 5, name: 'María Gómez', username: '207000112', roleCode: 'ALUMNO_UNICO', role: 'Alumno Único', estatus: 'Activo', email: 'maria.gomez@belver.edu.mx', telefono: 'Sin registrar', fechaRegistro: '2026-01-01' },
  
  // --- Usuarios adicionales para pruebas de funcionalidad ---
  { id: 6, name: 'Carlos Mendoza', username: '227000888', roleCode: 'ALUMNO', role: 'Alumno', estatus: 'Baja', email: 'carlos.mendoza@belver.edu.mx', telefono: '2281112233', fechaRegistro: '2026-02-10' },
  { id: 7, name: 'Ana Beatriz Ramos', username: 'control_esc2', roleCode: 'CONTROL_ESCOLAR', role: 'Control Escolar', estatus: 'Activo', email: 'ana.ramos@belver.edu.mx', telefono: '2284445566', fechaRegistro: '2026-03-01' },
  { id: 8, name: 'Luis Fernando Torres', username: '207000334', roleCode: 'ALUMNO_UNICO', role: 'Alumno Único', estatus: 'Baja', email: 'luis.torres@belver.edu.mx', telefono: '2287778899', fechaRegistro: '2026-03-15' },
];

const ROLES_MAP = {
  ADMIN: 'Super Administrador',
  CONTROL_ESCOLAR: 'Control Escolar',
  CAE: 'Personal CAE',
  ALUMNO: 'Alumno',
  ALUMNO_UNICO: 'Alumno Único',
};

export default function UsersPage({ onNavigateToPortal }) {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('TODOS');
  const [filtroRol, setFiltroRol] = useState('TODOS');

  // Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  // Formulario Nuevo Usuario
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    roleCode: 'ALUMNO',
    email: '',
    telefono: '',
    estatus: 'Activo',
  });

  const handleRoleChange = (userId, newRoleCode) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, roleCode: newRoleCode, role: ROLES_MAP[newRoleCode] }
          : u
      )
    );
  };

  const handleToggleEstatus = (userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, estatus: u.estatus === 'Activo' ? 'Baja' : 'Activo' }
          : u
      )
    );
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    const createdUser = {
      id: Date.now(),
      name: newUser.name,
      username: newUser.username,
      roleCode: newUser.roleCode,
      role: ROLES_MAP[newUser.roleCode],
      email: newUser.email,
      telefono: newUser.telefono || 'Sin registrar',
      estatus: newUser.estatus,
      fechaRegistro: new Date().toISOString().split('T')[0],
    };

    setUsers([createdUser, ...users]);
    setIsAddModalOpen(false);
    setNewUser({ name: '', username: '', roleCode: 'ALUMNO', email: '', telefono: '', estatus: 'Activo' });
  };

  const handleGoToStudentPortal = (user) => {
    if (onNavigateToPortal) {
      onNavigateToPortal('portal-alumno', user);
    } else {
      alert(`Redirigiendo al Portal Alumno para: ${user.name} (${user.username})`);
    }
  };

  const usuariosFiltrados = users.filter((u) => {
    const query = busqueda.toLowerCase();
    const coincideBusqueda =
      u.name.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query) ||
      u.roleCode.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query);

    const coincideEstatus =
      filtroEstatus === 'TODOS' || u.estatus === filtroEstatus;

    const coincideRol =
      filtroRol === 'TODOS' || u.roleCode === filtroRol;

    return coincideBusqueda && coincideEstatus && coincideRol;
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Encabezado Principal */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-900 text-white px-2.5 py-1 rounded-md">
              Panel Exclusivo del Administrador
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              Gestión de Usuarios y Accesos RBAC
            </h1>
            <p className="text-xs text-slate-500">
              Administra cuentas, estatus de baja/activo, consulta expedientes y accede al Portal Alumno como administrador.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-md self-start md:self-auto"
          >
            + Registrar Nuevo Usuario
          </button>
        </div>

        {/* Filtros de Búsqueda, Rol y Estatus */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por Nombre, Matrícula, Email o Rol..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full md:w-80 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 shadow-sm"
          />

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Filtro por Rol */}
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 font-semibold text-slate-700 shadow-sm"
            >
              <option value="TODOS">Todos los Roles</option>
              {Object.entries(ROLES_MAP).map(([code, name]) => (
                <option key={code} value={code}>
                  {name} ({code})
                </option>
              ))}
            </select>

            {/* Filtro por Estatus */}
            <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
              {['TODOS', 'Activo', 'Baja'].map((est) => (
                <button
                  key={est}
                  onClick={() => setFiltroEstatus(est)}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    filtroEstatus === est
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {est}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla de Usuarios */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Usuario / Nombre</th>
                  <th className="p-4">Matrícula / Username</th>
                  <th className="p-4">Rol Asignado</th>
                  <th className="p-4 text-center">Estatus</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400 text-xs">
                      No se encontraron usuarios registrados.
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u) => {
                    const esEstudiante = u.roleCode === 'ALUMNO' || u.roleCode === 'ALUMNO_UNICO';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition">
                        <td className="p-4">
                          <span className="font-semibold text-slate-900 block">{u.name}</span>
                          <span className="text-[10px] text-slate-400">{u.email}</span>
                        </td>
                        <td className="p-4 font-mono font-bold text-blue-950">{u.username}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {u.roleCode}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleEstatus(u.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                              u.estatus === 'Activo'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            {u.estatus === 'Activo' ? '● Activo' : '○ Dado de Baja'}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {esEstudiante && (
                              <button
                                onClick={() => handleGoToStudentPortal(u)}
                                title="Ver Portal del Alumno"
                                className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 text-white font-bold text-[11px] rounded-lg transition shadow-xs flex items-center gap-1"
                              >
                                🎓 Portal
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedUserDetail(u)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg transition"
                            >
                              👁 Detalle
                            </button>

                            <select
                              value={u.roleCode}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="px-2.5 py-1 border border-slate-300 rounded-lg text-[11px] bg-white focus:outline-none font-semibold shadow-xs"
                            >
                              <option value="ADMIN">ADMIN</option>
                              <option value="CONTROL_ESCOLAR">Control Escolar</option>
                              <option value="CAE">CAE</option>
                              <option value="ALUMNO">Alumno</option>
                              <option value="ALUMNO_UNICO">Alumno Único</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL: Registrar Nuevo Usuario */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="font-bold text-xs">Alta de Nuevo Usuario del Sistema</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Roberto Gómez"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">Matrícula / Username</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. 227000999"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      placeholder="usuario@dominio.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">Teléfono</label>
                    <input
                      type="text"
                      placeholder="2281234567"
                      value={newUser.telefono}
                      onChange={(e) => setNewUser({ ...newUser, telefono: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">Rol Inicial</label>
                    <select
                      value={newUser.roleCode}
                      onChange={(e) => setNewUser({ ...newUser, roleCode: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg outline-none font-semibold"
                    >
                      <option value="ADMIN">Super Administrador</option>
                      <option value="CONTROL_ESCOLAR">Control Escolar</option>
                      <option value="CAE">Personal CAE</option>
                      <option value="ALUMNO">Alumno</option>
                      <option value="ALUMNO_UNICO">Alumno Único</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">Estatus Inicial</label>
                    <select
                      value={newUser.estatus}
                      onChange={(e) => setNewUser({ ...newUser, estatus: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg outline-none font-semibold"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Baja">Dado de Baja</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 -mx-6 -mb-6 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold transition shadow-md"
                  >
                    Guardar Usuario
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Visualizar Expediente/Detalle del Usuario */}
        {selectedUserDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="font-bold text-xs">Ficha General del Usuario</h3>
                <button onClick={() => setSelectedUserDetail(null)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="flex justify-between items-start border-b pb-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{selectedUserDetail.name}</h4>
                    <span className="font-mono text-blue-950 font-bold">{selectedUserDetail.username}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    selectedUserDetail.estatus === 'Activo'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {selectedUserDetail.estatus}
                  </span>
                </div>

                <div className="space-y-2 text-slate-700">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-semibold text-slate-400">Rol del Sistema:</span>
                    <span className="font-bold text-slate-900">{selectedUserDetail.role} ({selectedUserDetail.roleCode})</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-semibold text-slate-400">Correo Electrónico:</span>
                    <span className="font-bold text-slate-900">{selectedUserDetail.email}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-semibold text-slate-400">Teléfono Contacto:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedUserDetail.telefono}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-semibold text-slate-400">Fecha de Registro:</span>
                    <span className="font-mono text-slate-800">{selectedUserDetail.fechaRegistro}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-between gap-2">
                  {(selectedUserDetail.roleCode === 'ALUMNO' || selectedUserDetail.roleCode === 'ALUMNO_UNICO') && (
                    <button
                      onClick={() => {
                        const targetUser = selectedUserDetail;
                        setSelectedUserDetail(null);
                        handleGoToStudentPortal(targetUser);
                      }}
                      className="px-3 py-2 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-xl text-xs transition"
                    >
                      🎓 Ver Portal de este Alumno
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedUserDetail(null)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs ml-auto transition"
                  >
                    Cerrar
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