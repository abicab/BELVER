import React, { useState, useRef, useEffect } from 'react';

export default function Navbar({ activeModule, onSelectModule, branding, userProfile, onOpenConfig, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
  const isAdmin = currentRole === 'ADMIN';

  // Filtrado de módulos según el rol activo
  const visibleModules = ALL_MODULES.filter((mod) =>
    currentRole === 'ADMIN' ? true : mod.roles.includes(currentRole)
  );

  // Cerrar menú al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      {/* 1. Cintillo Institucional Superior */}
      <div className="bg-black/30 px-4 sm:px-8 py-1 flex justify-between items-center text-[10px] text-slate-300 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-wide">SEV / ICC</span>
          <span className="text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-300">Secretaría de Educación de Veracruz</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[10px] text-slate-300">
            Rol Activo: <strong className="text-white uppercase tracking-wider">{currentRole}</strong>
          </span>
        </div>
      </div>

      {/* 2. Barra Principal: Logo (Izq), Módulos (Centro), Botón Perfil con Nombre (Der) */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
        
        {/* Identidad Institucional */}
        <div className="flex items-center gap-2.5 shrink-0">
          {branding?.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt="Logo"
              className="w-9 h-9 rounded-xl object-contain bg-white p-0.5 border border-white/20 shadow-sm"
            />
          ) : (
            <div
              style={{ backgroundColor: branding?.accentColor || '#1e3a8a' }}
              className="w-9 h-9 rounded-xl border border-white/30 flex items-center justify-center font-black text-xs tracking-wider text-white shadow-inner"
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

        {/* Pestañas de Módulos */}
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

        {/* Botón de Perfil con Nombre y Avatar Estilo Google */}
        <div className="relative shrink-0 border-l border-white/15 pl-3" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 py-1 px-2.5 rounded-full hover:bg-white/10 border border-transparent hover:border-white/15 transition-all cursor-pointer focus:outline-none"
          >
            <div className="hidden sm:block text-right leading-tight">
              <span className="text-[11px] font-bold text-white truncate max-w-[130px] block">
                {userProfile?.name || 'Usuario'}
              </span>
              <span className="text-[9px] text-slate-300 block uppercase tracking-wider font-semibold">
                {userProfile?.role || currentRole}
              </span>
            </div>

            {/* Círculo con Avatar / Iniciales */}
            <div className="w-9 h-9 rounded-full p-0.5 flex items-center justify-center shrink-0">
              {userProfile?.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover border border-white/40 shadow-sm"
                />
              ) : (
                <div
                  style={{ backgroundColor: branding?.accentColor || '#1e3a8a' }}
                  className="w-full h-full rounded-full border border-white/40 text-white flex items-center justify-center text-xs font-bold font-mono shadow-inner"
                >
                  {getInitials(userProfile?.name)}
                </div>
              )}
            </div>

            <span className={`text-[9px] text-slate-300 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {/* Menú Desplegable Estilo Tarjeta de Cuenta Google */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* Sección Central de la Cuenta */}
              <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
                
                {/* Avatar Grande Central */}
                <div className="relative mb-3">
                  {userProfile?.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt="Avatar Grande"
                      className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 shadow-md"
                    />
                  ) : (
                    <div
                      style={{ backgroundColor: branding?.accentColor || '#1e3a8a' }}
                      className="w-20 h-20 rounded-full text-white flex items-center justify-center text-2xl font-black font-mono shadow-md border-2 border-slate-200"
                    >
                      {getInitials(userProfile?.name)}
                    </div>
                  )}
                </div>

                {/* Nombre y Rol */}
                <h3 className="font-bold text-sm text-slate-900 leading-tight">
                  {userProfile?.name || 'Usuario Activo'}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {userProfile?.email || 'usuario@belver.edu.mx'}
                </span>

                <span className="mt-2 text-[10px] font-bold text-blue-900 bg-blue-50 border border-blue-200 px-3 py-0.5 rounded-full uppercase tracking-wider">
                  {userProfile?.role || currentRole}
                </span>
              </div>

              {/* Acciones de la Cuenta */}
              <div className="pt-3 space-y-2">
                
                {/* Opción Personalizar: Exclusiva de ADMIN */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      if (onOpenConfig) onOpenConfig();
                    }}
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center gap-2 transition shadow-2xs"
                  >
                    <span>🎨</span>
                    <span>Personalizar Sistema</span>
                  </button>
                )}

                {/* Botón Cerrar Sesión Estilo Google */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    if (onLogout) onLogout();
                    else alert('Sesión finalizada.');
                  }}
                  className="w-full py-2 px-3 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center gap-2 transition"
                >
                  <span>🚪</span>
                  <span>Cerrar sesión</span>
                </button>
              </div>

              {/* Pie de Tarjeta Institucional */}
              <div className="mt-4 pt-2 text-center text-[10px] text-slate-400 border-t border-slate-100 flex justify-center gap-2">
                <span>BELVER</span>
                <span>•</span>
                <span>Control Interno</span>
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}