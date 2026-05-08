import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Car, FileText, MapPin, Settings, 
  LogOut, HelpCircle, User as UserIcon, ClipboardList, 
  Menu, QrCode, Users
} from 'lucide-react';
import useAuthStore from '../../context/useAuthStore';

const MainLayout = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logoutAction } = useAuthStore();
  const [dynamicBreadcrumb, setDynamicBreadcrumb] = useState(null);
  const YellowSlash = () => <span className="text-accent mx-1">/</span>;

  // 1. Definimos los items con sus roles permitidos
  const navItems = [
    { 
      name: 'Inicio', 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      roles: ['Administrador', 'Guarda', 'Estudiante', 'Docente'] 
    },
    { 
      name: 'Mis vehículos', 
      path: '/vehicles', 
      icon: Car, 
      roles: ['Estudiante', 'Docente', 'Administrador'] 
    },
    { 
      name: 'Mis datos', 
      path: '/profile', 
      icon: UserIcon, 
      roles: ['Guarda', 'Estudiante', 'Docente'] 
    },
    { 
      name: 'Usuarios', 
      path: '/users', 
      icon: Users, 
      roles: ['Administrador'] 
    },
    { 
      name: 'Historial', 
      path: '/history', 
      icon: ClipboardList, 
      roles: ['Administrador', 'Guarda', 'Estudiante', 'Docente'] 
    },
    { 
      name: 'Escáner QR', 
      path: '/scanner', 
      icon: QrCode, 
      roles: ['Guarda', 'Administrador'] 
    },
    { 
      name: 'Reportes', 
      path: '/reports', 
      icon: FileText, 
      roles: ['Administrador'] 
    },
    { 
      name: 'Parqueaderos', 
      path: '/parking', 
      icon: MapPin, 
      roles: ['Administrador'] 
    },
  ];

  // 2. Filtramos los items según el rol del usuario autenticado
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.rol)
  );

  return (
    <div className="flex h-screen bg-background font-sans text-slate-800 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-primary text-white flex flex-col shadow-xl z-20 transition-all duration-300 ease-in-out`}>
        
        <div className="h-16 min-h-[4rem] flex items-center px-5 border-b border-slate-700/50 overflow-hidden whitespace-nowrap">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="min-w-8 w-8 h-8 rounded bg-accent hover:bg-accent-hover flex items-center justify-center transition-colors cursor-pointer"
            >
              <MapPin size={20} className="text-primary" />
            </button>
            <Link to="/dashboard" className={`text-xl font-bold tracking-wide transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
              Uni<span className="text-accent">Park</span>
            </Link>
          </div>
        </div>

        {/* Renderizamos solo los items filtrados */}
        <nav className="flex-1 py-4 flex flex-col gap-1.5 overflow-y-auto no-scrollbar px-3">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;

            // Título dinámico para vehículos si es administrador o no
            const itemName = (item.path === '/vehicles' && user?.rol === 'Administrador') 
              ? 'Vehículos' 
              : item.name;

            return (
              <Link
                key={item.path} // Mejor usar path como key
                to={item.path}
                title={isCollapsed ? itemName : ""}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary-light text-accent shadow-md' 
                    : 'text-slate-300 hover:bg-primary-light hover:text-white'
                } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
              >
                <item.icon size={20} className="min-w-[20px]" />
                <span className={`font-medium text-sm whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
                  {itemName}
                </span>
              </Link>
            );
            
          })}
        </nav>

        <div className="p-3 border-t border-slate-700/50 flex flex-col gap-1">
          <button className={`flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-primary-light ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
            <Settings size={18} className="min-w-[18px]" /> 
            <span className={`font-medium text-sm whitespace-nowrap ${isCollapsed ? 'hidden' : 'block'}`}>Ajustes</span>
          </button>
          <button 
            onClick={logoutAction}
            className={`flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-400/10 ${isCollapsed ? 'justify-center' : 'justify-start'}`}
          >
            <LogOut size={18} className="min-w-[18px]" /> 
            <span className={`font-medium text-sm whitespace-nowrap ${isCollapsed ? 'hidden' : 'block'}`}>Salir</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">

        <header className="h-16 bg-surface shadow-sm flex items-center justify-between px-8 z-10 flex-shrink-0">

          <div className="flex items-center text-primary font-semibold text-lg capitalize">
            {/* Si la vista detalle manda un título, lo mostramos. Si no, armamos el normal */}
            {dynamicBreadcrumb ? (
              dynamicBreadcrumb
            ) : (
              <div className="flex items-center">
                <span className="text-accent mx-2">/</span>
                <Link to="/dashboard" className="hover:text-accent transition-colors">Inicio</Link>
                
                {/* Si NO estamos en el dashboard, mostramos la página actual */}
                {location.pathname !== '/dashboard' && location.pathname !== '/' && (
                  <>
                    <span className="text-accent mx-2">/</span>
                    <span className="cursor-default">
                      {location.pathname.includes('vehicles') ? 'Vehículos' : 
                       location.pathname.includes('profile') ? 'Mis datos' : 
                       location.pathname.includes('history') ? 'Historial' :
                       location.pathname.includes('scanner') ? 'Escáner QR' :
                       location.pathname.includes('reports') ? 'Reportes' :
                       location.pathname.includes('parking') ? 'Parqueaderos' :
                       location.pathname.replace('/', '')}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
          
          <Link to="/profile" className="flex items-center gap-4 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors text-right">
            <div className="hidden sm:block">
              <p className="font-bold text-primary text-sm leading-none">{user?.rol}</p>
              <p className="text-slate-500 text-[10px] mt-1">{user?.correo}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-accent overflow-hidden shadow-sm">
              <img src={`https://ui-avatars.com/api/?name=${user?.correo}&background=0D8ABC&color=fff`} alt="User" />
            </div>
          </Link>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8 no-scrollbar bg-background">
          {/* ESTA ES LA LÍNEA CLAVE. Asegúrate de pasar el context */}
          <Outlet context={{ setDynamicBreadcrumb }} />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;