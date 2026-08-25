import React from 'react';

export default function Navbar({ activeModule, onSelectModule, branding, userProfile, onOpenConfig, onLogout }) {
  const ALL_MODULES = [
    { id: 'ControlEscolarPage', label: 'Control Escolar', roles: ['ADMIN', 'CONTROL_ESCOLAR'] },
    { id: 'CaePage', label: 'Panel CAE', roles: ['ADMIN', 'CAE'] },
    { id: 'PagosPage', label: 'Caja y Pagos', roles: ['ADMIN', 'FINANZAS', 'CAE'] },
    { id: 'BitacoraPage', label: 'Bitácora', roles: ['ADMIN'] },
    { id: 'UsersPage', label: 'Gestión de Usuarios', roles: ['ADMIN'] },
    { id: 'PlanEstudiosPage', label: 'Planes de Estudio', roles: ['ADMIN', 'CONTROL_ESCOLAR'] },
    { id: 'AlumnoPage', label: 'Portal Alumno', roles: ['ADMIN', 'ALUMNO'] },
    { id: 'AlumnoUnicoPage', label: 'Expediente Único', roles: ['ADMIN', 'ALUMNO_UNICO'] },
  ];

  const currentRole = userProfile?.roleCode || 'GUEST';

  const visibleModules = ALL_MODULES.filter((mod) =>
    currentRole === 'ADMIN' ? true : mod.roles.includes(currentRole)
  );

  const getInitials = (name) => {
    if (!name) return 'US';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <header
      style={{ backgroundColor: branding?.headerColor || '#0f172a' }}
      className="text-white border-b border-white/10 shadow-md sticky top-0 z-40 transition-colors duration-300 select-none"
    >
      <div className="bg-black/30 px-4 sm:px-8 py-1 flex justify-between items-center text-[10px] text-slate-300 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-wide">SEV / ICC</span>
          <span className="text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-300">Secretaría de Educación de Veracruz</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[10px] text-slate-300">
            Rol Activo: <strong className="text-white uppercase">{currentRole}</strong>
          </span>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 shrink-0">
          {branding?.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt="Logo"
              className="w-9 h-9 rounded-lg object-contain bg-white p-0.5 border border-white/20 shadow-sm"
            />
          ) : (
            <div
              style={{ backgroundColor: branding?.accentColor || '#1e3a8a' }}
              className="w-9 h-9 rounded-lg border border-white/30 flex items-center justify-center font-black text-xs tracking-wider text-white shadow-inner"
            >
              {branding?.shortName || 'BV'}
            </div>
          )}

          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-wide text-white">
                {branding?.institutionName || 'BELVER'}
              </span>
              <span className="text-[9px] bg-white/10 text-slate-200 border border-white/15 px-1 rounded font-mono">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-300/80 hidden xl:block">
              {branding?.systemSubtitle || 'Control Interno y Servicios Escolares'}
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/10 overflow-x-auto max-w-full">
          {visibleModules.map((mod) => {
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => onSelectModule && onSelectModule(mod.id)}
                style={isActive ? { backgroundColor: branding?.accentColor || '#1e3a8a' } : {}}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'text-white shadow-sm border border-white/30 font-bold'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {mod.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5 shrink-0 border-l border-white/15 pl-3">
          {currentRole === 'ADMIN' && (
            <button
              onClick={onOpenConfig}
              title="Personalizar Identidad Institucional"
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-semibold border border-white/15 transition flex items-center gap-1"
            >
              <span>⚙️</span>
              <span className="hidden sm:inline text-[11px]">Ajustes</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="hidden lg:block text-right leading-tight">
              <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">
                {userProfile?.role || 'Usuario'}
              </span>
              <span className="text-xs font-semibold text-white truncate max-w-[130px] block">
                {userProfile?.name || 'Usuario'}
              </span>
            </div>

            {userProfile?.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt="Avatar"
                className="w-8 h-8 rounded-lg object-cover border border-white/40 shadow-sm"
              />
            ) : (
              <div
                style={{ backgroundColor: branding?.accentColor || '#1e3a8a' }}
                className="w-8 h-8 rounded-lg border border-white/30 text-white flex items-center justify-center text-[11px] font-bold font-mono shadow-inner"
              >
                {getInitials(userProfile?.name)}
              </div>
            )}

            <button
              onClick={onLogout}
              title="Cerrar Sesión"
              className="ml-1 px-2 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-800 text-red-200 text-xs font-semibold border border-red-500/30 transition"
            >
              🚪
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}