import React, { useState, useRef, useEffect } from "react";

export default function Navbar({
  activeModule,
  onSelectModule,
  branding,
  userProfile,
  onOpenConfig,
  onLogout,
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navRef = useRef(null);

  // Todos los módulos disponibles en el sistema con sus roles permitidos
  const ALL_MODULES = [
    {
      id: "ValidacionAspirantesPage",
      label: "Aspirantes",
      roles: ["ADMIN", "CONTROL_ESCOLAR"],
    },
    {
      id: "AlumnosCEPage",
      label: "Alumnos",
      roles: ["ADMIN", "CONTROL_ESCOLAR"],
    },
    {
      id: "HistorialAca",
      label: "Historial Académico",
      roles: ["ADMIN", "CONTROL_ESCOLAR"],
    },
    {
      id: "ReportesPage",
      label: "Reportes",
      roles: ["ADMIN", "CONTROL_ESCOLAR"],
    },
    {
      id: "PlanEstudiosPage",
      label: "Planes de Estudio",
      roles: ["ADMIN", "CONTROL_ESCOLAR"],
    },
    { id: "CaePage", label: "Panel CAE", roles: ["ADMIN", "CAE"] },
    {
      id: "PagosPage",
      label: "Caja y Pagos",
      roles: ["ADMIN", "FINANZAS", "CAE"],
    },
    { id: "CatalogosPage", label: "Catálogos", roles: ["ADMIN"] },
    { id: "CicloPage", label: "Ciclos Escolares", roles: ["ADMIN"] },
    { id: "UsersPage", label: "Gestión de Usuarios", roles: ["ADMIN"] },
    { id: "BitacoraPage", label: "Bitácora", roles: ["ADMIN"] },
    { id: "AlumnoPage", label: "Portal Alumno", roles: ["ADMIN", "ALUMNO"] },
    {
      id: "AlumnoUnicoPage",
      label: "Expediente Único",
      roles: ["ADMIN", "ALUMNO_UNICO"],
    },
  ];

  // Categorías exclusivas para el menú de ADMIN
  const ADMIN_CATEGORIES = [
    {
      key: "control_escolar",
      label: "Control Escolar",
      modules: [
        "ValidacionAspirantesPage",
        "AlumnosCEPage",
        "HistorialAca",
        "ReportesPage",
        "PlanEstudiosPage",
      ],
    },
    {
      key: "administracion",
      label: "Administración",
      modules: ["CaePage", "PagosPage"],
    },
  ];

  // Módulos independientes que el Administrador también ve fuera de las categorías principales
  const ADMIN_INDEPENDENT = [
    "CatalogosPage",
    "CicloPage",
    "UsersPage",
    "BitacoraPage",
    "AlumnoPage",
    "AlumnoUnicoPage",
  ];

  const currentRole = userProfile?.roleCode || "GUEST";
  const isAdmin = currentRole === "ADMIN";

  // Filtrar módulos permitidos para el rol actual
  const visibleModules = ALL_MODULES.filter((mod) =>
    isAdmin ? true : mod.roles.includes(currentRole),
  );

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdown(null);
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return "US";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const isGroupActive = (moduleIds) => {
    return moduleIds.includes(activeModule);
  };

  return (
    <header
      style={{ backgroundColor: branding?.headerColor || "#0f172a" }}
      className="text-white border-b border-white/10 shadow-md sticky top-0 z-50 transition-colors duration-300 select-none"
      ref={navRef}
    >
      {/* 1. Cintillo Institucional Superior */}
      <div className="bg-black/30 px-4 sm:px-8 py-1 flex justify-between items-center text-[10px] text-slate-300 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-wide">
            SEV / ICC
          </span>
          <span className="text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-300">
            Secretaría de Educación de Veracruz
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[10px] text-slate-300">
            Rol Activo:{" "}
            <strong className="text-white uppercase tracking-wider">
              {currentRole}
            </strong>
          </span>
        </div>
      </div>

      {/* 2. Barra Principal */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Identidad Institucional */}
        <div className="flex items-center gap-3 shrink-0">
          {branding?.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt="Logo"
              className="h-11 w-auto max-w-[140px] rounded-xl object-contain bg-white/10 p-1.5 border border-white/25 shadow-sm"
            />
          ) : (
            <div
              style={{ backgroundColor: branding?.accentColor || "#1e3a8a" }}
              className="w-10 h-10 rounded-2xl border border-white/30 flex items-center justify-center font-black text-xs tracking-wider text-white shadow-inner"
            >
              {branding?.shortName || "BV"}
            </div>
          )}

          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-wide text-white">
                {branding?.institutionName || "BELVER"}
              </span>
              <span className="text-[9px] bg-white/10 text-slate-200 border border-white/15 px-1 rounded font-mono">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-300/80 hidden xl:block">
              {branding?.systemSubtitle ||
                "Control Interno y Servicios Escolares"}
            </p>
          </div>
        </div>

        {/* Navegación Dinámica según el Rol */}
        <nav className="flex items-center gap-1.5 bg-black/20 p-1 rounded-xl border border-white/10 relative flex-wrap justify-center">
          {/* SI ES ADMIN: Renderizamos con categorías desplegables */}
          {isAdmin ? (
            <>
              {ADMIN_CATEGORIES.map((cat) => {
                const catModules = ALL_MODULES.filter((mod) =>
                  cat.modules.includes(mod.id),
                );
                const isOpen = openDropdown === cat.key;
                const activeCat = isGroupActive(cat.modules);

                return (
                  <div className="relative" key={cat.key}>
                    <button
                      onClick={() => setOpenDropdown(isOpen ? null : cat.key)}
                      style={
                        activeCat
                          ? {
                              backgroundColor:
                                branding?.accentColor || "#1e3a8a",
                            }
                          : {}
                      }
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                        activeCat
                          ? "text-white shadow-sm border border-white/30 font-bold"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`text-[8px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      >
                        ▼
                      </span>
                    </button>

                    {isOpen && (
                      <div className="absolute left-0 mt-2 w-56 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 py-2 z-50">
                        {catModules.map((mod) => {
                          const isModActive = activeModule === mod.id;
                          return (
                            <button
                              key={mod.id}
                              onClick={() => {
                                onSelectModule && onSelectModule(mod.id);
                                setOpenDropdown(null);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-between ${
                                isModActive
                                  ? "bg-blue-50 text-blue-900 font-bold border-l-4 border-blue-900"
                                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                              }`}
                            >
                              <span>{mod.label}</span>
                              {isModActive && (
                                <span className="text-[10px] text-blue-900">
                                  ●
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Botones independientes para el Administrador */}
              {ALL_MODULES.filter((mod) =>
                ADMIN_INDEPENDENT.includes(mod.id),
              ).map((mod) => {
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      onSelectModule && onSelectModule(mod.id);
                      setOpenDropdown(null);
                    }}
                    style={
                      isActive
                        ? {
                            backgroundColor: branding?.accentColor || "#1e3a8a",
                          }
                        : {}
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "text-white shadow-sm border border-white/30 font-bold"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {mod.label}
                  </button>
                );
              })}
            </>
          ) : (
            /* SI ES OTRO ROL (Ej. CONTROL_ESCOLAR): Todos los botones aparecen independientes y directos */
            visibleModules.map((mod) => {
              const isActive = activeModule === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => {
                    onSelectModule && onSelectModule(mod.id);
                    setOpenDropdown(null);
                  }}
                  style={
                    isActive
                      ? { backgroundColor: branding?.accentColor || "#1e3a8a" }
                      : {}
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-white shadow-sm border border-white/30 font-bold"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {mod.label}
                </button>
              );
            })
          )}
        </nav>

        {/* Botón de Perfil del Usuario */}
        <div className="relative shrink-0 border-l border-white/15 pl-3">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2.5 py-1 px-2.5 rounded-full hover:bg-white/10 border border-transparent hover:border-white/15 transition-all cursor-pointer focus:outline-none"
          >
            <div className="hidden sm:block text-right leading-tight">
              <span className="text-[11px] font-bold text-white truncate max-w-[130px] block">
                {userProfile?.name || "Usuario"}
              </span>
              <span className="text-[9px] text-slate-300 block uppercase tracking-wider font-semibold">
                {userProfile?.role || currentRole}
              </span>
            </div>

            <div className="w-9 h-9 rounded-full p-0.5 flex items-center justify-center shrink-0">
              {userProfile?.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover border border-white/40 shadow-sm"
                />
              ) : (
                <div
                  style={{
                    backgroundColor: branding?.accentColor || "#1e3a8a",
                  }}
                  className="w-full h-full rounded-full border border-white/40 text-white flex items-center justify-center text-xs font-bold font-mono shadow-inner"
                >
                  {getInitials(userProfile?.name)}
                </div>
              )}
            </div>

            <span
              className={`text-[9px] text-slate-300 transition-transform duration-200 ${isProfileDropdownOpen ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </button>

          {/* Menú Desplegable del Perfil */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 p-5 z-50">
              <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
                <div className="relative mb-3">
                  {userProfile?.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt="Avatar Grande"
                      className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 shadow-md"
                    />
                  ) : (
                    <div
                      style={{
                        backgroundColor: branding?.accentColor || "#1e3a8a",
                      }}
                      className="w-20 h-20 rounded-full text-white flex items-center justify-center text-2xl font-black font-mono shadow-md border-2 border-slate-200"
                    >
                      {getInitials(userProfile?.name)}
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-tight">
                  {userProfile?.name || "Usuario Activo"}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {userProfile?.email || "usuario@belver.edu.mx"}
                </span>

                <span className="mt-2 text-[10px] font-bold text-blue-900 bg-blue-50 border border-blue-200 px-3 py-0.5 rounded-full uppercase tracking-wider">
                  {userProfile?.role || currentRole}
                </span>
              </div>

              <div className="pt-3 space-y-2">
                {isAdmin && (
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      if (onOpenConfig) onOpenConfig();
                    }}
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>🎨</span>
                    <span>Personalizar Sistema</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    if (onLogout) onLogout();
                    else alert("Sesión finalizada.");
                  }}
                  className="w-full py-2 px-3 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>🚪</span>
                  <span>Cerrar sesión</span>
                </button>
              </div>

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
