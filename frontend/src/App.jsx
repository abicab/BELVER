import React, { useState } from 'react';
import Navbar from './components/Navbar';

// Módulos bajo responsabilidad de Abi
import AdmissionPage from './pages/AdmissionPage';
import ControlEscolarPage from './pages/ControlEscolarPage';
import CaePage from './pages/CaePage';
import PagosPage from './pages/PagosPage';

// Bitácora bajo la responsabilidad de ambos 
import BitacoraPage from './pages/BitacoraPage';

// Módulos bajo responsabilidad de Rentería
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import PlanEstudiosPage from './pages/PlanEstudiosPage';
import AlumnoPage from './pages/AlumnoPage';
import AlumnoUnicoPage from './pages/AlumnoUnicoPage';

// Valores iniciales / por defecto del sistema
const DEFAULT_BRANDING = {
  institutionName: 'BELVER',
  shortName: 'BV',
  systemSubtitle: 'Control Interno y Servicios Escolares',
  headerColor: '#0f172a',
  accentColor: '#1e3a8a',
  logoUrl: '',
};

const DEFAULT_USER_PROFILE = {
  name: 'Administrador TI',
  role: 'Super Administrador',
  roleCode: 'ADMIN',
  avatarUrl: '',
};

const ROLE_MAPPING = {
  ADMIN: { name: 'Administrador TI', role: 'Super Administrador', defaultModule: 'ControlEscolarPage' },
  CONTROL_ESCOLAR: { name: 'Coordinación Escolar', role: 'Control Escolar', defaultModule: 'ControlEscolarPage' },
  CAE: { name: 'Atención CAE', role: 'Personal CAE', defaultModule: 'CaePage' },
  ALUMNO: { name: 'Alumno Portal', role: 'Estudiante', defaultModule: 'AlumnoPage' },
  ALUMNO_UNICO: { name: 'Alumno Único', role: 'Estudiante Único', defaultModule: 'AlumnoUnicoPage' },
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentModule, setCurrentModule] = useState('LoginPage');
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [userProfile, setUserProfile] = useState(DEFAULT_USER_PROFILE);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [formConfig, setFormConfig] = useState({ ...DEFAULT_BRANDING, ...DEFAULT_USER_PROFILE });

  // Estado para guardar la información del alumno que el administrador decide visualizar
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Manejador para redirigir desde UsersPage al portal del alumno seleccionado
  const handleNavigateToPortal = (targetModule, studentData) => {
    setSelectedStudent(studentData);
    
    // Mapeo flexible de módulos según el rol del estudiante seleccionado
    if (targetModule === 'portal-alumno') {
      const moduleName = studentData?.roleCode === 'ALUMNO_UNICO' ? 'AlumnoUnicoPage' : 'AlumnoPage';
      setCurrentModule(moduleName);
    } else {
      setCurrentModule(targetModule);
    }
  };

  // Manejador del Login con tolerancias a la respuesta del backend
  const handleLoginSuccess = (data) => {
    const rawRole = data?.user?.roleCode || data?.user?.role || data?.role || 'ADMIN';
    const roleCode = String(rawRole).toUpperCase();
    const roleInfo = ROLE_MAPPING[roleCode] || ROLE_MAPPING['ADMIN'];

    const activeUser = {
      name: data?.user?.nombreCompleto || data?.user?.name || roleInfo.name,
      role: roleInfo.role,
      roleCode: roleCode,
      avatarUrl: data?.user?.avatarUrl || '',
    };

    setUserProfile(activeUser);
    setIsAuthenticated(true);
    setCurrentModule(roleInfo.defaultModule);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserProfile(DEFAULT_USER_PROFILE);
    setSelectedStudent(null);
    setCurrentModule('LoginPage');
  };

  const handleOpenConfig = () => {
    setFormConfig({ ...branding, ...userProfile });
    setIsConfigOpen(true);
  };

  const handleImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'image/png' && !file.name.toLowerCase().endsWith('.png')) {
      alert('El archivo seleccionado debe ser exclusivamente una imagen en formato PNG (.png).');
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no debe superar los 2 MB de tamaño.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormConfig((prev) => ({ ...prev, [fieldName]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefaults = () => {
    if (confirm('¿Deseas restablecer todos los colores, logotipos y ajustes a sus valores originales de fábrica?')) {
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

  const isPublicPage = currentModule === 'AdmissionPage';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      
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
            <span className="font-extrabold tracking-wider bg-blue-950 px-2 py-0.5 rounded border border-blue-800">BELVER</span>
            <span className="text-slate-300">Bachillerato en Línea de Veracruz • Portal de Registro</span>
          </div>
          <button
            onClick={() => setCurrentModule('LoginPage')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition font-semibold text-[11px] border border-slate-700"
          >
            🔒 Acceso Personal Interno
          </button>
        </header>
      )}

      {/* Vistas de los módulos */}
      <main className="flex-1">
        {/* Muestra Login si no está autenticado ni está en página pública */}
        {!isAuthenticated && !isPublicPage && (
          <LoginPage 
            onLoginSuccess={handleLoginSuccess} 
            onGoToAdmission={() => setCurrentModule('AdmissionPage')}
          />
        )}

        {/* Módulos accesibles */}
        {currentModule === 'AdmissionPage' && <AdmissionPage />}

        {isAuthenticated && (
          <>
            {currentModule === 'ControlEscolarPage' && <ControlEscolarPage />}
            {currentModule === 'CaePage' && <CaePage />}
            {currentModule === 'PagosPage' && <PagosPage />}
            {currentModule === 'BitacoraPage' && <BitacoraPage />}
            
            {/* Se pasa la función de navegación/suplantación a UsersPage */}
            {currentModule === 'UsersPage' && (
              <UsersPage onNavigateToPortal={handleNavigateToPortal} />
            )}

            {currentModule === 'PlanEstudiosPage' && <PlanEstudiosPage />}
            
            {/* Se envían los datos del alumno seleccionado al Portal Alumno / Expediente Único */}
            {currentModule === 'AlumnoPage' && (
              <AlumnoPage alumno={selectedStudent || undefined} />
            )}
            {currentModule === 'AlumnoUnicoPage' && (
              <AlumnoUnicoPage alumno={selectedStudent || undefined} />
            )}
          </>
        )}
      </main>

      {/* Modal de personalización */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
            
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm">🎨</span>
                <h3 className="font-bold text-xs">Personalización del Sistema y Perfil</h3>
              </div>
              <button onClick={() => setIsConfigOpen(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleSaveConfig} className="p-6 space-y-4 text-xs text-slate-700 overflow-y-auto max-h-[75vh]">
              
              {/* Sección 1: Identidad Institucional */}
              <div className="space-y-3">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block border-b pb-1">
                  1. Identidad Institucional (Navbar)
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-700">Nombre Institución</label>
                    <input
                      type="text"
                      value={formConfig.institutionName}
                      onChange={(e) => setFormConfig({ ...formConfig, institutionName: e.target.value })}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-700">Siglas / Acrónimo</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={formConfig.shortName}
                      onChange={(e) => setFormConfig({ ...formConfig, shortName: e.target.value })}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800 font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Subtítulo del Sistema</label>
                  <input
                    type="text"
                    value={formConfig.systemSubtitle}
                    onChange={(e) => setFormConfig({ ...formConfig, systemSubtitle: e.target.value })}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-700">Color Barra Superior</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formConfig.headerColor}
                        onChange={(e) => setFormConfig({ ...formConfig, headerColor: e.target.value })}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-slate-500">{formConfig.headerColor}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-700">Color de Acento</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formConfig.accentColor}
                        onChange={(e) => setFormConfig({ ...formConfig, accentColor: e.target.value })}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-slate-500">{formConfig.accentColor}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="font-semibold text-slate-800 flex justify-between items-center">
                    <span>Logotipo Institucional (Exclusivo PNG)</span>
                    {formConfig.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormConfig({ ...formConfig, logoUrl: '' })}
                        className="text-[10px] text-red-600 hover:underline font-bold"
                      >
                        Quitar Logo
                      </button>
                    )}
                  </label>
                  <input
                    type="file"
                    accept=".png,image/png"
                    onChange={(e) => handleImageUpload(e, 'logoUrl')}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 border border-slate-300 rounded-lg p-1 bg-white"
                  />
                  {formConfig.logoUrl && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-slate-400">Vista previa:</span>
                      <img src={formConfig.logoUrl} alt="Logo Preview" className="w-7 h-7 object-contain bg-white rounded border border-slate-300 p-0.5" />
                    </div>
                  )}
                </div>
              </div>

              {/* Sección 2: Perfil de Usuario */}
              <div className="space-y-3 pt-2">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block border-b pb-1">
                  2. Perfil de Usuario y Rol RBAC
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-700">Nombre de Usuario</label>
                    <input
                      type="text"
                      value={formConfig.name}
                      onChange={(e) => setFormConfig({ ...formConfig, name: e.target.value })}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-700">Rol Activo</label>
                    <select
                      value={formConfig.roleCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        const roleNames = {
                          ADMIN: 'Super Administrador',
                          CONTROL_ESCOLAR: 'Control Escolar',
                          CAE: 'Atención Estudiantil',
                          FINANZAS: 'Caja y Cobranza',
                        };
                        setFormConfig({
                          ...formConfig,
                          roleCode: code,
                          role: roleNames[code] || code,
                        });
                      }}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-slate-800 font-semibold"
                    >
                      <option value="ADMIN">Super Administrador (Todos los módulos)</option>
                      <option value="CONTROL_ESCOLAR">Control Escolar</option>
                      <option value="CAE">Personal CAE</option>
                      <option value="FINANZAS">Caja y Finanzas</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="font-semibold text-slate-800 flex justify-between items-center">
                    <span>Fotografía de Avatar (Exclusivo PNG)</span>
                    {formConfig.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setFormConfig({ ...formConfig, avatarUrl: '' })}
                        className="text-[10px] text-red-600 hover:underline font-bold"
                      >
                        Quitar Avatar
                      </button>
                    )}
                  </label>
                  <input
                    type="file"
                    accept=".png,image/png"
                    onChange={(e) => handleImageUpload(e, 'avatarUrl')}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 border border-slate-300 rounded-lg p-1 bg-white"
                  />
                  {formConfig.avatarUrl && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-slate-400">Vista previa:</span>
                      <img src={formConfig.avatarUrl} alt="Avatar Preview" className="w-7 h-7 object-cover rounded-lg border border-slate-300" />
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center -mx-6 -mb-4 mt-4">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition"
                >
                  ↺ Restablecer Valores
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConfigOpen(false)}
                    className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition shadow-md"
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