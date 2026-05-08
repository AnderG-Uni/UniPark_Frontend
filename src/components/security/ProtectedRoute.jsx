import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../context/useAuthStore';

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // 1. Si no está autenticado, lo pateamos al Login, 
  // pero guardamos la ruta a la que intentaba ir (state) para ser amables luego.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. PBAC (Control de Acceso Basado en Atributos/Roles)
  // Si le pasamos roles específicos a esta ruta y el usuario no los tiene, lo bloqueamos.
  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    // Si es un Estudiante intentando entrar a /reports, lo mandamos a su home
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Si todo está en orden, lo dejamos pasar a la página solicitada (<Outlet />)
  return <Outlet />;
}