import React, { useState } from 'react';

const INITIAL_USERS = [
  { id: 1, name: 'Administrador TI', username: 'admin_sys', roleCode: 'ADMIN', role: 'Super Administrador' },
  { id: 2, name: 'Coordinación Escolar', username: 'control_esc', roleCode: 'CONTROL_ESCOLAR', role: 'Control Escolar' },
  { id: 3, name: 'Atención CAE', username: 'cae_atencion', roleCode: 'CAE', role: 'Personal CAE' },
  { id: 4, name: 'Juan Pérez', username: '227000510', roleCode: 'ALUMNO', role: 'Alumno' },
  { id: 5, name: 'María Gómez', username: '207000112', roleCode: 'ALUMNO_UNICO', role: 'Alumno Único' },
];

export default function UsersPage() {
  const [users, setUsers] = useState(INITIAL_USERS);

  const handleRoleChange = (userId, newRoleCode) => {
    const roleNames = {
      ADMIN: 'Super Administrador',
      CONTROL_ESCOLAR: 'Control Escolar',
      CAE: 'Personal CAE',
      ALUMNO: 'Alumno',
      ALUMNO_UNICO: 'Alumno Único',
    };

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, roleCode: newRoleCode, role: roleNames[newRoleCode] }
          : u
      )
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gestión de Usuarios y Accesos RBAC</h2>
          <p className="text-xs text-slate-500">Asigna y administra los roles de usuario para restringir las vistas del sistema.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="p-3">Usuario / Nombre</th>
              <th className="p-3">Matrícula / Username</th>
              <th className="p-3">Rol Asignado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition">
                <td className="p-3 font-semibold text-slate-800">{u.name}</td>
                <td className="p-3 font-mono text-slate-500">{u.username}</td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                    {u.roleCode}
                  </span>
                </td>
                <td className="p-3">
                  <select
                    value={u.roleCode}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="px-2 py-1 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-800"
                  >
                    <option value="ADMIN">ADMIN (Acceso Total)</option>
                    <option value="CONTROL_ESCOLAR">Control Escolar</option>
                    <option value="CAE">CAE</option>
                    <option value="ALUMNO">Alumno</option>
                    <option value="ALUMNO_UNICO">Alumno Único</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}