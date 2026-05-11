import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Car, FileText, MapPin, Settings, 
  LogOut, User as UserIcon, ClipboardList, 
  Menu, QrCode, Users, X
} from 'lucide-react';
import useAuthStore from '../../context/useAuthStore';

// Diccionario de rutas a nombres amigables
const routeNames = {
  'dashboard': 'Inicio',
  'vehicles': 'Vehículos',
  'profile': 'Mis datos',
  'users': 'Usuarios',
  'history': 'Historial',
  'scanner': 'Escáner QR',
  'reports': 'Reportes',
  'parking': 'Parqueaderos',
  'settings': 'Ajustes'
};

const MainLayout = () => {
  const location = useLocation();
  const { user, logoutAction } = useAuthStore();
  const [dynamicBreadcrumb, setDynamicBreadcrumb] = useState(null);
  
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsCollapsed(true);
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { name: 'Inicio', path: '/dashboard', icon: LayoutDashboard, roles: ['Administrador', 'Guarda', 'Estudiante', 'Docente'] },
    { name: 'Mis vehículos', path: '/vehicles', icon: Car, roles: ['Estudiante', 'Docente', 'Administrador'] },
    { name: 'Mis datos', path: '/profile', icon: UserIcon, roles: ['Guarda', 'Estudiante', 'Docente'] },
    { name: 'Usuarios', path: '/users', icon: Users, roles: ['Administrador'] },
    { name: 'Historial', path: '/history', icon: ClipboardList, roles: ['Administrador', 'Guarda', 'Estudiante', 'Docente'] },
    { name: 'Escáner QR', path: '/scanner', icon: QrCode, roles: ['Guarda', 'Administrador'] },
    { name: 'Reportes', path: '/reports', icon: FileText, roles: ['Administrador'] },
    { name: 'Parqueaderos', path: '/parking', icon: MapPin, roles: ['Administrador'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.rol));

  const handleMobileNavClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  // 🪄 GENERADOR DINÁMICO DE MIGA DE PAN (BREADCRUMB)
  const generateBreadcrumb = () => {
    const paths = location.pathname.split('/').filter(p => p !== '');
    
    // Si estamos en /dashboard o en la raíz, solo mostramos Inicio
    if (paths.length === 0 || (paths.length === 1 && paths[0] === 'dashboard')) {
      return (
        <>
          <span className="text-accent mx-1.5 sm:mx-2 flex-shrink-0">/</span>
          <span className="cursor-default text-primary font-bold">Inicio</span>
        </>
      );
    }

    return (
      <>
        <span className="text-accent mx-1.5 sm:mx-2 flex-shrink-0">/</span>
        {/* Link principal al Dashboard */}
        <Link to="/dashboard" className="text-slate-500 hover:text-accent transition-colors flex-shrink-0 hidden sm:block">Inicio</Link>
        <Link to="/dashboard" className="text-slate-500 hover:text-accent transition-colors flex-shrink-0 sm:hidden">Ini</Link>
        
        {paths.map((path, index) => {
          // Si el "path" es un número (ID), lo traducimos como "Detalles"
          const isNumericId = !isNaN(path);
          let name = isNumericId ? 'Detalles' : (routeNames[path] || path);
          
          // Especial para /vehicles según el rol
          if (path === 'vehicles' && user?.rol !== 'Administrador') name = 'Mis vehículos';

          // Construimos la URL acumulada hasta este punto
          const routeTo = `/${paths.slice(0, index + 1).join('/')}`;
          
          // Si es el último elemento, es texto plano (estamos aquí)
          const isLast = index === paths.length - 1;

          return (
            <React.Fragment key={path}>
              <span className="text-accent mx-1.5 sm:mx-2 flex-shrink-0">/</span>
              {isLast ? (
                <span className="cursor-default text-primary font-bold capitalize truncate">
                  {name}
                </span>
              ) : (
                <Link to={routeTo} className="text-slate-500 hover:text-accent transition-colors capitalize whitespace-nowrap">
                  {name}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </>
    );
  };

  return (
    <div className="flex h-screen bg-background font-sans text-slate-800 overflow-hidden relative">
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 
        transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 
        transition-all duration-300 ease-in-out 
        ${isCollapsed ? 'md:w-20' : 'md:w-64'} 
        w-64 md:w-auto
        bg-primary text-white flex flex-col shadow-2xl md:shadow-xl
      `}>
        
        <div className="h-16 min-h-[4rem] flex items-center justify-between md:justify-start px-5 border-b border-slate-700/50 overflow-hidden whitespace-nowrap">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex min-w-8 w-8 h-8 rounded bg-accent hover:bg-accent-hover items-center justify-center transition-colors cursor-pointer"
            >
              <MapPin size={20} className="text-primary" />
            </button>
            <div className="md:hidden min-w-8 w-8 h-8 rounded bg-accent flex items-center justify-center">
              <MapPin size={20} className="text-primary" />
            </div>
            <Link to="/dashboard" className={`text-xl font-bold tracking-wide transition-opacity duration-300 ${isCollapsed ? 'md:opacity-0 md:hidden' : 'opacity-100'}`}>
              Uni<span className="text-accent">Park</span>
            </Link>
          </div>
          
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-300 hover:text-white p-1">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-1.5 overflow-y-auto no-scrollbar px-3">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path); // Mantiene activo el botón principal aunque estés en una sub-ruta
            const itemName = (item.path === '/vehicles' && user?.rol === 'Administrador') ? 'Vehículos' : item.name;

            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? itemName : ""}
                onClick={handleMobileNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary-light text-accent shadow-md' 
                    : 'text-slate-300 hover:bg-primary-light hover:text-white'
                } ${isCollapsed ? 'md:justify-center' : 'justify-start'}`}
              >
                <item.icon size={20} className="min-w-[20px]" />
                <span className={`font-medium text-sm whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'md:opacity-0 md:w-0 md:hidden' : 'opacity-100 w-auto'}`}>
                  {itemName}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-700/50 flex flex-col gap-1">
          <Link 
            to="/settings" 
            onClick={handleMobileNavClick}
            className={`flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-primary-light ${isCollapsed ? 'md:justify-center' : 'justify-start'}`}
          >
            <Settings size={18} className="min-w-[18px]" /> 
            <span className={`font-medium text-sm whitespace-nowrap ${isCollapsed ? 'md:hidden' : 'block'}`}>Ajustes</span>
          </Link>
          <button 
            onClick={logoutAction}
            className={`flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-400/10 ${isCollapsed ? 'md:justify-center' : 'justify-start'}`}
          >
            <LogOut size={18} className="min-w-[18px]" /> 
            <span className={`font-medium text-sm whitespace-nowrap ${isCollapsed ? 'md:hidden' : 'block'}`}>Salir</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">

        <header className="h-16 bg-surface shadow-sm flex items-center justify-between px-4 sm:px-8 z-10 flex-shrink-0 gap-4">
          
          <div className="flex items-center gap-3 overflow-hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 -ml-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            >
              <Menu size={26} />
            </button>

            {/* 🪄 AQUÍ RENDERIZAMOS EL BREADCRUMB INTELIGENTE */}
            <div className="flex items-center text-sm sm:text-base capitalize truncate">
              {dynamicBreadcrumb ? (
                dynamicBreadcrumb
              ) : (
                <div className="flex items-center truncate">
                  {generateBreadcrumb()}
                </div>
              )}
            </div>
          </div>
          
          <Link to="/profile" className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 sm:p-2 rounded-lg transition-colors text-right flex-shrink-0">
            <div className="hidden sm:block">
              <p className="font-bold text-primary text-sm leading-none">{user?.rol}</p>
              <p className="text-slate-500 text-[10px] mt-1">{user?.correo}</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-200 border-2 border-accent overflow-hidden shadow-sm flex-shrink-0">
              <img src={`https://ui-avatars.com/api/?name=${user?.correo}&background=0D8ABC&color=fff`} alt="User" />
            </div>
          </Link>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 no-scrollbar bg-background">
          <Outlet context={{ setDynamicBreadcrumb }} />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;