import React, { useState } from "react";
import Navbar from "./components/Navbar";

// Módulos bajo responsabilidad de Abi
import AdmissionPage from "./pages/AdmissionPage";
import ControlEscolarPage from "./pages/ControlEscolarPage";
import CaePage from "./pages/CaePage";
import PagosPage from "./pages/PagosPage";

// Bitácora bajo la responsabilidad de ambos
import BitacoraPage from "./pages/BitacoraPage";

// Módulos bajo responsabilidad de Rentería
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import PlanEstudiosPage from "./pages/PlanEstudiosPage";
import AlumnoPage from "./pages/AlumnoPage";
import AlumnoUnicoPage from "./pages/AlumnoUnicoPage";

// Valores iniciales / por defecto del sistema
const DEFAULT_BRANDING = {
  institutionName: "BELVER",
  shortName: "BV",
  systemSubtitle: "Control Interno y Servicios Escolares",
  headerColor: "#0f172a",
  accentColor: "#1e3a8a",
  logoUrl: "",
};

const DEFAULT_USER_PROFILE = {
  name: "Administrador TI",
  role: "Super Administrador",
  roleCode: "ADMIN",
  avatarUrl: "",
};

const ROLE_MAPPING = {
  ADMIN: {
    name: "Administrador TI",
    role: "Super Administrador",
    defaultModule: "ControlEscolarPage",
  },
  CONTROL_ESCOLAR: {
    name: "Coordinación Escolar",
    role: "Control Escolar",
    defaultModule: "ControlEscolarPage",
  },
  CAE: { name: "Atención CAE", role: "Personal CAE", defaultModule: "CaePage" },
  ALUMNO: {
    name: "Alumno Portal",
    role: "Estudiante",
    defaultModule: "AlumnoPage",
  },
  ALUMNO_UNICO: {
    name: "Alumno Único",
    role: "Estudiante Único",
    defaultModule: "AlumnoUnicoPage",
  },
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentModule, setCurrentModule] = useState("LoginPage");
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [userProfile, setUserProfile] = useState(DEFAULT_USER_PROFILE);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [formConfig, setFormConfig] = useState({
    ...DEFAULT_BRANDING,
    ...DEFAULT_USER_PROFILE,
  });

  // Estado para guardar la información del alumno que el administrador decide visualizar
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Manejador para redirigir desde UsersPage al portal del alumno seleccionado
  const handleNavigateToPortal = (targetModule, studentData) => {
    setSelectedStudent(studentData);

    if (targetModule === "portal-alumno") {
      const moduleName =
        studentData?.roleCode === "ALUMNO_UNICO"
          ? "AlumnoUnicoPage"
          : "AlumnoPage";
      setCurrentModule(moduleName);
    } else {
      setCurrentModule(targetModule);
    }
  };

  // Manejador del Login con tolerancias a la respuesta del backend
  const handleLoginSuccess = (data) => {
    const rawRole =
      data?.user?.roleCode || data?.user?.role || data?.role || "ADMIN";
    const roleCode = String(rawRole).toUpperCase();
    const roleInfo = ROLE_MAPPING[roleCode] || ROLE_MAPPING["ADMIN"];

    const activeUser = {
      name: data?.user?.nombreCompleto || data?.user?.name || roleInfo.name,
      role: roleInfo.role,
      roleCode: roleCode,
      avatarUrl: data?.user?.avatarUrl || "",
    };

    setUserProfile(activeUser);
    setIsAuthenticated(true);
    setCurrentModule(roleInfo.defaultModule);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserProfile(DEFAULT_USER_PROFILE);
    setSelectedStudent(null);
    setCurrentModule("LoginPage");
  };

  const handleOpenConfig = () => {
    setFormConfig({ ...branding, ...userProfile });
    setIsConfigOpen(true);
  };

  const handleImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    if (
      file.type !== "image/png" &&
      !file.name.toLowerCase().endsWith(".png")
    ) {
      alert(
        "El archivo seleccionado debe ser exclusivamente una imagen en formato PNG (.png).",
      );
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen no debe superar los 2 MB de tamaño.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormConfig((prev) => ({ ...prev, [fieldName]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefaults = () => {
    if (
      confirm(
        "¿Deseas restablecer todos los colores, logotipos y ajustes a sus valores originales de fábrica?",
      )
    ) {
      setFormConfig({
        ...DEFAULT_BRANDING,
        ...DEFAULT_USER_PROFILE,
      });
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setBranding({
      institutionName: formConfig.institutionName,
      shortName: formConfig.shortName,
      systemSubtitle: formConfig.systemSubtitle,
      headerColor: formConfig.headerColor,
      accentColor: formConfig.accentColor,
      logoUrl: formConfig.logoUrl,
    });

    setUserProfile({
      name: formConfig.name,
      role: formConfig.role,
      roleCode: formConfig.roleCode,
      avatarUrl: formConfig.avatarUrl,
    });

    setIsConfigOpen(false);
  };

  const isPublicPage = currentModule === "AdmissionPage";

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-950 bg-slate-100">
      {/* Navbar visible únicamente cuando hay autenticación y no es portal público */}
      {isAuthenticated && !isPublicPage && (
        <Navbar
          activeModule={currentModule}
          onSelectModule={(modId) => setCurrentModule(modId)}
          branding={branding}
          userProfile={userProfile}
          onOpenConfig={handleOpenConfig}
          onLogout={handleLogout}
        />
      )}

      {/* Cabecera aislada en portal público */}
      {isPublicPage && (
        <header className="w-full bg-slate-900 text-white py-2.5 px-4 sm:px-8 flex justify-between items-center text-xs shadow-md">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
              BELVER
            </span>
            <span className="text-slate-300">
              Bachillerato en Línea de Veracruz • Portal de Registro
            </span>
          </div>
          <button
            onClick={() => setCurrentModule("LoginPage")}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition font-semibold text-[11px] border border-slate-700"
          >
            🔒 Acceso Personal Interno
          </button>
        </header>
      )}

      {/* Vistas de los módulos */}
      <main className="flex-1">
        {!isAuthenticated && !isPublicPage && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onGoToAdmission={() => setCurrentModule("AdmissionPage")}
          />
        )}

        {currentModule === "AdmissionPage" && <AdmissionPage />}

        {isAuthenticated && (
          <>
            {currentModule === "ControlEscolarPage" && <ControlEscolarPage />}
            {currentModule === "CaePage" && <CaePage />}
            {currentModule === "PagosPage" && <PagosPage />}
            {currentModule === "BitacoraPage" && <BitacoraPage />}

            {currentModule === "UsersPage" && (
              <UsersPage onNavigateToPortal={handleNavigateToPortal} />
            )}

            {currentModule === "PlanEstudiosPage" && <PlanEstudiosPage />}

            {currentModule === "AlumnoPage" && (
              <AlumnoPage alumno={selectedStudent || undefined} />
            )}
            {currentModule === "AlumnoUnicoPage" && (
              <AlumnoUnicoPage alumno={selectedStudent || undefined} />
            )}
          </>
        )}
      </main>

      {/* Modal de personalización con diseño estilizado BELVER */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Cabecera estilizada del modal */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-base">🎨</span>
                <h3 className="font-bold text-xs tracking-wide uppercase text-slate-100">
                  Personalización del Sistema y Perfil
                </h3>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-sm w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSaveConfig}
              className="p-6 space-y-5 text-xs text-slate-700 overflow-y-auto max-h-[75vh]"
            >
              {/* Sección 1: Identidad Institucional */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-900"></span>
                  <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                    1. Identidad Institucional (Navbar)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-700 text-[11px]">
                      Nombre Institución
                    </label>
                    <input
                      type="text"
                      value={formConfig.institutionName}
                      onChange={(e) =>
                        setFormConfig({
                          ...formConfig,
                          institutionName: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900 transition shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-700 text-[11px]">
                      Siglas / Acrónimo
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={formConfig.shortName}
                      onChange={(e) =>
                        setFormConfig({
                          ...formConfig,
                          shortName: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900 transition shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 text-[11px]">
                    Subtítulo del Sistema
                  </label>
                  <input
                    type="text"
                    value={formConfig.systemSubtitle}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        systemSubtitle: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900 transition shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-700 text-[11px]">
                      Color Barra Superior
                    </label>
                    <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-300 rounded-xl p-2 shadow-sm">
                      <input
                        type="color"
                        value={formConfig.headerColor}
                        onChange={(e) =>
                          setFormConfig({
                            ...formConfig,
                            headerColor: e.target.value,
                          })
                        }
                        className="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer bg-transparent"
                      />
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {formConfig.headerColor}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-700 text-[11px]">
                      Color de Acento
                    </label>
                    <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-300 rounded-xl p-2 shadow-sm">
                      <input
                        type="color"
                        value={formConfig.accentColor}
                        onChange={(e) =>
                          setFormConfig({
                            ...formConfig,
                            accentColor: e.target.value,
                          })
                        }
                        className="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer bg-transparent"
                      />
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {formConfig.accentColor}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Caja de Logotipo */}
                <div className="flex flex-col gap-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-800 text-[11px]">
                      Logotipo Institucional (Exclusivo PNG)
                    </label>
                    {formConfig.logoUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormConfig({ ...formConfig, logoUrl: "" })
                        }
                        className="text-[10px] text-red-600 hover:text-red-800 hover:underline font-bold transition"
                      >
                        Quitar Logo
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".png,image/png"
                    onChange={(e) => handleImageUpload(e, "logoUrl")}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-950 file:text-white hover:file:bg-blue-900 border border-slate-300 rounded-xl p-1.5 bg-white cursor-pointer shadow-sm transition"
                  />
                  {formConfig.logoUrl && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200 mt-1">
                      <span className="text-[10px] font-semibold text-slate-500">
                        Vista previa:
                      </span>
                      <img
                        src={formConfig.logoUrl}
                        alt="Logo Preview"
                        className="w-8 h-8 object-contain bg-white rounded-lg border border-slate-300 p-1 shadow-inner"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Sección 2: Perfil de Usuario */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-900"></span>
                  <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                    2. Perfil de Usuario y Rol RBAC
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-700 text-[11px]">
                      Nombre de Usuario
                    </label>
                    <input
                      type="text"
                      value={formConfig.name}
                      onChange={(e) =>
                        setFormConfig({ ...formConfig, name: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900 transition shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-700 text-[11px]">
                      Rol Activo
                    </label>
                    <select
                      value={formConfig.roleCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        const roleNames = {
                          ADMIN: "Super Administrador",
                          CONTROL_ESCOLAR: "Control Escolar",
                          CAE: "Atención Estudiantil",
                          FINANZAS: "Caja y Cobranza",
                        };
                        setFormConfig({
                          ...formConfig,
                          roleCode: code,
                          role: roleNames[code] || code,
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900 transition cursor-pointer shadow-sm"
                    >
                      <option value="ADMIN">Super Administrador</option>
                      <option value="CONTROL_ESCOLAR">Control Escolar</option>
                      <option value="CAE">Personal CAE</option>
                      <option value="FINANZAS">Caja y Finanzas</option>
                    </select>
                  </div>
                </div>

                {/* Caja de Avatar */}
                <div className="flex flex-col gap-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-800 text-[11px]">
                      Fotografía de Avatar (Exclusivo PNG)
                    </label>
                    {formConfig.avatarUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormConfig({ ...formConfig, avatarUrl: "" })
                        }
                        className="text-[10px] text-red-600 hover:text-red-800 hover:underline font-bold transition"
                      >
                        Quitar Avatar
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".png,image/png"
                    onChange={(e) => handleImageUpload(e, "avatarUrl")}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-950 file:text-white hover:file:bg-blue-900 border border-slate-300 rounded-xl p-1.5 bg-white cursor-pointer shadow-sm transition"
                  />
                  {formConfig.avatarUrl && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200 mt-1">
                      <span className="text-[10px] font-semibold text-slate-500">
                        Vista previa:
                      </span>
                      <img
                        src={formConfig.avatarUrl}
                        alt="Avatar Preview"
                        className="w-8 h-8 object-cover rounded-xl border border-slate-300 shadow-inner"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Acción Estilizados */}
              <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center -mx-6 -mb-6 mt-6 rounded-b-2xl">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition shadow-sm"
                >
                  ↺ Restablecer Valores
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConfigOpen(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition shadow-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-xl font-bold text-xs transition shadow-md"
                  >
                    Aplicar Cambios
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
