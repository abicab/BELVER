import React from 'react';

export default function Navbar({ activeModule, onSelectModule, branding, userProfile, onOpenConfig }) {
  const modules = [
    { id: 'AdmissionPage', label: 'Inscripción / Admisión' },
    { id: 'CaePage', label: 'Centro de Atención (CAE)' },
    { id: 'PagosPage', label: 'Caja y Pagos' },
    { id: 'BitacoraPage', label: 'Bitácora de Auditoría' },
  ];

  // Cálculo de iniciales del usuario si no hay foto
  const getInitials = (name) => {
    if (!name) return 'US';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <header
      style={{ backgroundColor: branding.headerColor }}
      className="text-white border-b border-black/10 shadow-md sticky top-0 z-40 transition-colors duration-300"
    >
      {/* Cintillo Institucional Superior con opacidad oscura suave */}
      <div className="bg-black/25 px-4 sm:px-8 py-1.5 flex justify-between items-center text-[10px] text-slate-200 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">SEV / ICC</span>
          <span>•</span>
          <span>Secretaría de Educación de Veracruz</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Sistema de Control Interno Activo</span>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Identidad Institucional Dinámica */}
        <div className="flex items-center gap-3">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt="Logo Institucional"
              className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-white/20 shadow-sm"
            />
          ) : (
            <div
              style={{ backgroundColor: branding.accentColor }}
              className="w-10 h-10 rounded-xl border border-white/30 flex items-center justify-center font-black text-sm tracking-wider text-white shadow-inner"
            >
              {branding.shortName || 'BV'}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wide text-white">
                {branding.institutionName}
              </span>
              <span className="text-[10px] bg-black/20 text-slate-200 border border-white/20 px-1.5 py-0.2 rounded font-mono">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-200/90 leading-tight">
              {branding.systemSubtitle}
            </p>
          </div>
        </div>

        {/* Navegación por módulos */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {modules.map((mod) => {
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => onSelectModule && onSelectModule(mod.id)}
                style={isActive ? { backgroundColor: branding.accentColor } : {}}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'text-white shadow-sm border border-white/30'
                    : 'text-slate-100 hover:bg-black/15 hover:text-white'
                }`}
              >
                {mod.label}
              </button>
            );
          })}
        </nav>

        {/* Perfil del Operador y Botón de Ajustes */}
        <div className="flex items-center gap-3 border-l border-white/15 pl-4 self-end md:self-auto">
          <button
            onClick={onOpenConfig}
            title="Personalizar Identidad Institucional y Perfil"
            className="px-2.5 py-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-slate-100 hover:text-white text-xs font-semibold border border-white/20 transition flex items-center gap-1.5"
          >
            Ajustes
          </button>

          <div className="flex items-center gap-2.5">
            <div className="hidden lg:block text-right">
              <span className="text-[10px] text-slate-300 block leading-none">{userProfile.role}</span>
              <span className="text-xs font-semibold text-white truncate max-w-[120px] block">
                {userProfile.name}
              </span>
            </div>

            {/* Foto de Perfil o Iniciales */}
            {userProfile.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt="Foto de Perfil"
                className="w-9 h-9 rounded-xl object-cover border border-white/40 shadow-sm"
              />
            ) : (
              <div
                style={{ backgroundColor: branding.accentColor }}
                className="w-9 h-9 rounded-xl border border-white/30 text-white flex items-center justify-center text-xs font-bold font-mono shadow-inner"
              >
                {getInitials(userProfile.name)}
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}