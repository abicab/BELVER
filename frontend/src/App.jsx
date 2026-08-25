import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AdmissionPage from './pages/AdmissionPage';
import BitacoraPage from './pages/BitacoraPage';
import CaePage from './pages/CaePage';
import PagosPage from './pages/PagosPage';

const DEFAULT_BRANDING = {
  institutionName: 'BELVER',
  shortName: 'BV',
  systemSubtitle: 'Bachillerato en Línea de Veracruz • Control Interno',
  headerColor: '#0f172a', // Fondo principal de la barra (ej. Slate 900)
  accentColor: '#1e3a8a', // Color de botones activos y destacados (Azul institucional)
  logoUrl: null,
};

const DEFAULT_USER = {
  name: 'Administrador TI',
  role: 'Control y Auditoría',
  avatarUrl: null,
};

export default function App() {
  const [currentModule, setCurrentModule] = useState('AdmissionPage');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Estados persistentes en LocalStorage
  const [branding, setBranding] = useState(() => {
    const saved = localStorage.getItem('belver_branding_config');
    return saved ? JSON.parse(saved) : DEFAULT_BRANDING;
  });

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('belver_user_profile');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [formConfig, setFormConfig] = useState({ ...branding, ...userProfile });

  useEffect(() => {
    localStorage.setItem('belver_branding_config', JSON.stringify(branding));
  }, [branding]);

  useEffect(() => {
    localStorage.setItem('belver_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Carga de logotipo
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('El logotipo no debe superar los 2 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormConfig((prev) => ({ ...prev, logoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Carga de foto de perfil
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('La fotografía no debe superar los 2 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormConfig((prev) => ({ ...prev, avatarUrl: reader.result }));
      };
      reader.readAsDataURL(file);
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
      avatarUrl: formConfig.avatarUrl,
    });
    setIsConfigOpen(false);
  };

  const handleResetDefault = () => {
    setFormConfig({ ...DEFAULT_BRANDING, ...DEFAULT_USER });
    setBranding(DEFAULT_BRANDING);
    setUserProfile(DEFAULT_USER);
    setIsConfigOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      
      {/* Barra superior parametrizable */}
      <Navbar
        activeModule={currentModule}
        onSelectModule={(modId) => setCurrentModule(modId)}
        branding={branding}
        userProfile={userProfile}
        onOpenConfig={() => {
          setFormConfig({ ...branding, ...userProfile });
          setIsConfigOpen(true);
        }}
      />

      {/* Vistas del sistema */}
      <main className="flex-1">
        {currentModule === 'AdmissionPage' && <AdmissionPage />}
        {currentModule === 'CaePage' && <CaePage />}
        {currentModule === 'PagosPage' && <PagosPage />}
        {currentModule === 'BitacoraPage' && <BitacoraPage />}
      </main>

      {/* MODAL DE AJUSTES VISUALES Y DE PERFIL */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-xs">Personalización de Barra, Colores y Perfil</h3>
              <button onClick={() => setIsConfigOpen(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveConfig} className="p-6 space-y-5 text-xs text-slate-700 overflow-y-auto">
              
              {/* Sección 1: Colores de la Barra */}
              <div className="space-y-3 border-b pb-4">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  1. Colores de la Barra Superior
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">Color de Fondo de la Barra</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formConfig.headerColor}
                        onChange={(e) => setFormConfig({ ...formConfig, headerColor: e.target.value })}
                        className="w-10 h-9 p-1 border border-slate-300 rounded-lg cursor-pointer bg-white"
                      />
                      <span className="font-mono text-xs text-slate-600 uppercase">{formConfig.headerColor}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">Color de Botones y Acento</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formConfig.accentColor}
                        onChange={(e) => setFormConfig({ ...formConfig, accentColor: e.target.value })}
                        className="w-10 h-9 p-1 border border-slate-300 rounded-lg cursor-pointer bg-white"
                      />
                      <span className="font-mono text-xs text-slate-600 uppercase">{formConfig.accentColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 2: Identidad Institucional y Logo */}
              <div className="space-y-3 border-b pb-4">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  2. Nombre y Logotipo Institucional
                </h4>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">Nombre Institucional</label>
                    <input
                      type="text"
                      required
                      value={formConfig.institutionName}
                      onChange={(e) => setFormConfig({ ...formConfig, institutionName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">Siglas (Logo)</label>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      value={formConfig.shortName}
                      onChange={(e) => setFormConfig({ ...formConfig, shortName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800 uppercase"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-800">Subtítulo del Sistema</label>
                  <input
                    type="text"
                    required
                    value={formConfig.systemSubtitle}
                    onChange={(e) => setFormConfig({ ...formConfig, systemSubtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="font-semibold text-slate-800">Imagen de Logotipo (PNG / JPG / SVG)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 border border-slate-300 rounded-lg p-1 bg-white"
                  />
                  {formConfig.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormConfig({ ...formConfig, logoUrl: null })}
                      className="text-[11px] text-red-600 hover:underline font-semibold self-start pt-1"
                    >
                      Quitar imagen de logotipo y usar siglas
                    </button>
                  )}
                </div>
              </div>

              {/* Sección 3: Perfil de Usuario y Foto */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  3. Perfil de Usuario en Sesión
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">Nombre del Usuario</label>
                    <input
                      type="text"
                      required
                      value={formConfig.name}
                      onChange={(e) => setFormConfig({ ...formConfig, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-800">Rol / Cargo</label>
                    <input
                      type="text"
                      required
                      value={formConfig.role}
                      onChange={(e) => setFormConfig({ ...formConfig, role: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="font-semibold text-slate-800">Fotografía de Perfil (Avatar)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 border border-slate-300 rounded-lg p-1 bg-white"
                  />
                  {formConfig.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setFormConfig({ ...formConfig, avatarUrl: null })}
                      className="text-[11px] text-red-600 hover:underline font-semibold self-start pt-1"
                    >
                      Quitar fotografía y mostrar iniciales del nombre
                    </button>
                  )}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Restablecer valores originales
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConfigOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow"
                  >
                    Guardar Cambios
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