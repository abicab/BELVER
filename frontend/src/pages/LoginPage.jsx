import React, { useState } from 'react';

// Credenciales registradas localmente para desarrollo y pruebas de UI
const MOCK_CREDENTIALS = {
  admin_sys: { roleCode: 'ADMIN', name: 'Administrador TI', pass: 'admin123' },
  control_esc: { roleCode: 'CONTROL_ESCOLAR', name: 'Coordinación Escolar', pass: 'control123' },
  cae_atencion: { roleCode: 'CAE', name: 'Atención CAE', pass: 'cae123' },
  '227000510': { roleCode: 'ALUMNO', name: 'Estudiante Portal', pass: 'alumno123' },
  '207000112': { roleCode: 'ALUMNO_UNICO', name: 'Estudiante Único', pass: 'alumno123' },
};

export default function LoginPage({ onLoginSuccess, onGoToAdmission }) {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');

  // Función directa para procesar inicio de sesión local
  const executeLogin = (userKey) => {
    const key = userKey.trim();
    const mockUser = MOCK_CREDENTIALS[key] || {
      roleCode: 'ADMIN',
      name: key || 'Usuario Demo',
    };

    if (onLoginSuccess) {
      onLoginSuccess({
        user: {
          name: mockUser.name,
          nombreCompleto: mockUser.name,
          roleCode: mockUser.roleCode,
          role: mockUser.roleCode,
        },
      });
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const userKey = usernameInput.trim();
    if (!userKey) {
      setError('Por favor ingresa un nombre de usuario o matrícula.');
      return;
    }

    if (MOCK_CREDENTIALS[userKey] && MOCK_CREDENTIALS[userKey].pass !== passwordInput) {
      setError('Contraseña incorrecta para el usuario ingresado.');
      return;
    }

    executeLogin(userKey);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <main className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-100">
        
        {/* Encabezado */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-900/50 border border-blue-500/30 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="font-extrabold text-blue-400 text-lg">BV</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">BELVER Web Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Bachillerato en Línea de Veracruz</p>
        </div>

        {/* Formulario de Login */}
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Usuario / Matrícula
            </label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-600 transition"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-600 transition"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 font-semibold bg-blue-900 hover:bg-blue-800 border border-blue-700/50 text-white py-2.5 px-4 rounded-xl transition cursor-pointer text-xs shadow-md"
          >
            Ingresar al Sistema
          </button>
        </form>

        {/* Enlace directo al Formulario de Admisión (Convocatoria) */}
        {onGoToAdmission && (
          <div className="mt-4 pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={onGoToAdmission}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition hover:underline inline-flex items-center gap-1"
            >
              <span>📋 ¿Eres aspirante nuevo? <strong>Ver convocatoria y registro ➔</strong></span>
            </button>
          </div>
        )}

        {/* Accesos Rápidos de prueba interactivos */}
        <div className="w-full text-[11px] text-slate-400 border-t border-slate-800 pt-4 mt-4">
          <p className="font-semibold text-slate-300 mb-2">Accesos Rápidos de Prueba (Clic directo):</p>
          <div className="grid grid-cols-1 gap-1.5 text-[10px]">
            <button
              type="button"
              onClick={() => executeLogin('admin_sys')}
              className="text-left px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 flex justify-between items-center transition"
            >
              <span>• <b>Admin:</b> admin_sys</span>
              <span className="text-[9px] bg-blue-950 text-blue-400 px-1.5 py-0.5 rounded border border-blue-800">Entrar ➔</span>
            </button>
            <button
              type="button"
              onClick={() => executeLogin('control_esc')}
              className="text-left px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 flex justify-between items-center transition"
            >
              <span>• <b>Control Escolar:</b> control_esc</span>
              <span className="text-[9px] bg-blue-950 text-blue-400 px-1.5 py-0.5 rounded border border-blue-800">Entrar ➔</span>
            </button>
            <button
              type="button"
              onClick={() => executeLogin('cae_atencion')}
              className="text-left px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 flex justify-between items-center transition"
            >
              <span>• <b>CAE:</b> cae_atencion</span>
              <span className="text-[9px] bg-blue-950 text-blue-400 px-1.5 py-0.5 rounded border border-blue-800">Entrar ➔</span>
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}