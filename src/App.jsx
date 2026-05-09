import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout.jsx';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import Home from './pages/Dashboard/Home.jsx';
import Users from './pages/Users/Users.jsx';
import UserDetail from './pages/Users/UserDetail.jsx';
import Vehicles from './pages/Vehicles/Vehicles.jsx';
import Reports from './pages/Reports/Reports.jsx';
import Parking from './pages/Parking/Parking.jsx';
import ParkingDetail from './pages/Parking/ParkingDetail.jsx';
import Profile from './pages/Profile/Profile.jsx';
import History from './pages/History/History.jsx';
import Scanner from './pages/Scanner/Scanner.jsx';
import VehicleDetail from './pages/Vehicles/VehicleDetail.jsx';
import Settings from './pages/Settings/Settings';


// Importamos el Guardián y el Estado Global
import ProtectedRoute from './components/security/ProtectedRoute';
import useAuthStore from './context/useAuthStore';

function App() {
  // Obtenemos el estado de autenticación del usuario desde el store global
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

        {/* TODAS LAS RUTAS PRIVADAS VAN DENTRO DE UN SOLO MAINLAYOUT */}
        <Route element={<MainLayout />}>
          
          {/* RUTAS GENERALES (Cualquier usuario logueado, sin importar el rol) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<History />} />
          </Route>

          {/* RUTAS DE VEHÍCULOS (Todos excepto el Guarda) */}
          <Route element={<ProtectedRoute allowedRoles={['Administrador', 'Estudiante', 'Docente']} />}>
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/vehicles/:id" element={<VehicleDetail />} />
          </Route>

          {/* RUTAS DEL ESCÁNER (Solo Guardas y Administradores) */}
          <Route element={<ProtectedRoute allowedRoles={['Administrador', 'Guarda']} />}>
            <Route path="/scanner" element={<Scanner />} />
          </Route>

          {/* RUTAS DE ADMINISTRACIÓN (Solo Administradores) */}
          <Route element={<ProtectedRoute allowedRoles={['Administrador']} />}>
            <Route path="/reports" element={<Reports />} />
            <Route path="/parking" element={<Parking />} />
            <Route path="/parking/:id" element={<ParkingDetail />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:id" element={<UserDetail />} />
          </Route>

        </Route>

        {/* 404 Fallback: Si se solicita una ruta que no existe */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;