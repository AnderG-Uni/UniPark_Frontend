import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../context/useAuthStore'; 

export default function Historial() {
  const { user } = useAuthStore();
  const [historialVehiculos, setHistorialVehiculos] = useState([]);
  const [historialLogins, setHistorialLogins] = useState([]); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🪄 Variable de control para saber si es personal administrativo/seguridad
  const isAdminOrGuard = user?.rol === 'Administrador' || user?.rol === 'Guarda';

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        setIsLoading(true);
        
        const endpointVehiculos = isAdminOrGuard ? '/historial/global' : '/historial/personal';

        const resVehiculos = await api.get(endpointVehiculos);
        setHistorialVehiculos(resVehiculos.data.data || resVehiculos.data || []);

        if (user?.rol === 'Administrador') {
          const resLogins = await api.get('/historial/logins');
          setHistorialLogins(resLogins.data.data || resLogins.data || []);
        }

      } catch (err) {
        console.error("Error al cargar el historial:", err);
        setError("No se pudo cargar el historial de accesos.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchHistorial();
    }
  }, [user, isAdminOrGuard]);

  // Formateador de Fechas
  const formatFecha = (fechaString) => {
    if (!fechaString) return 'En parqueadero';
    const d = new Date(fechaString);
    const dia = d.getDate().toString().padStart(2, '0');
    const mes = (d.getMonth() + 1).toString().padStart(2, '0');
    const anio = d.getFullYear();
    const hora = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    return `${dia}/${mes}/${anio} ${hora}:${min}`;
  };

  // 🪄 NUEVA FUNCIÓN: Calculadora de tiempo transcurrido
  const calcularTiempo = (ingreso, salida) => {
    if (!salida) {
      return (
        <span className="flex items-center gap-1.5 text-emerald-500 font-semibold text-xs">
          <Clock size={14} className="animate-pulse" /> En curso
        </span>
      );
    }
    
    const diffMs = new Date(salida) - new Date(ingreso);
    if (diffMs < 0) return '---'; 
    
    const diffMins = Math.floor(diffMs / 60000);
    const horas = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (horas > 0) {
      return `${horas}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const gridLayout = user?.rol === 'Administrador' 
    ? 'grid-cols-1 xl:grid-cols-2' 
    : 'grid-cols-1 max-w-full w-full';

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 h-full w-full">
      
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          Historial
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Visualiza el historial de accesos vehiculares y conexiones al sistema.
        </p>
      </div>

      <div className={`grid gap-6 items-start w-full ${gridLayout}`}>
        
        {/* ================= TABLA 1: Ingresos Vehiculares (PARA TODOS) ================= */}
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col min-h-[400px] w-full">
          <h3 className="text-lg font-semibold text-primary mb-1">Ingresos vehiculares</h3>
          <p className="text-xs text-slate-500 mb-6">
            {isAdminOrGuard ? 'Historial de ingresos a las distintas sedes (Global).' : 'Tu historial de ingresos a las distintas sedes.'}
          </p>

          <div className="overflow-x-auto flex-1 w-full">
            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-accent" /></div>
            ) : error ? (
              <div className="text-red-500 text-sm py-4 flex items-center gap-2"><AlertCircle size={16}/> {error}</div>
            ) : historialVehiculos.length === 0 ? (
              <div className="text-slate-400 text-sm py-10 text-center border-2 border-dashed border-slate-100 rounded-xl">No hay registros de ingresos.</div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 text-primary sticky top-0 bg-white">
                    <th className="pb-3 pr-4 font-semibold text-sm">Vehículo</th>
                    
                    {/* 🪄 CONDICIÓN: Mostrar 'Tipo' solo a los Administrativos/Guardas */}
                    {isAdminOrGuard && <th className="pb-3 px-4 font-semibold text-sm">Tipo</th>}
                    
                    <th className="pb-3 px-4 font-semibold text-sm">Sede</th>
                    <th className="pb-3 px-4 font-semibold text-sm">Fecha ingreso</th>
                    <th className="pb-3 px-4 font-semibold text-sm">Fecha salida</th>
                    
                    {/* 🪄 CONDICIÓN: Mostrar 'Tiempo' solo a los usuarios normales (Estudiantes, Docentes, etc.) */}
                    {!isAdminOrGuard && <th className="pb-3 pl-4 font-semibold text-sm">Tiempo</th>}
                  </tr>
                </thead>
                <tbody className="text-slate-600 text-sm">
                  {historialVehiculos.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pr-4 font-bold text-slate-700 uppercase">
                        {item.vehiculo}
                      </td>
                      
                      {/* 🪄 CELDA TIPO CONDICIONAL */}
                      {isAdminOrGuard && (
                        <td className="py-4 px-4 font-medium">
                          {item.tipo === 'Visitante' 
                            ? <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded text-xs">Visitante</span> 
                            : <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded text-xs">Usuario</span>}
                        </td>
                      )}

                      <td className="py-4 px-4">{item.sede}</td>
                      <td className="py-4 px-4">{formatFecha(item.fecha_ingreso)}</td>
                      <td className="py-4 px-4 font-medium text-slate-500">
                        {item.fecha_salida ? formatFecha(item.fecha_salida) : <span className="text-emerald-500 bg-emerald-50 px-2 py-1 rounded">Activo</span>}
                      </td>

                      {/* 🪄 CELDA TIEMPO CONDICIONAL */}
                      {!isAdminOrGuard && (
                        <td className="py-4 pl-4 font-bold text-slate-700">
                          {calcularTiempo(item.fecha_ingreso, item.fecha_salida)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ================= TABLA 2: Ingresos a UniPark (SOLO ADMINISTRADOR) ================= */}
        {user?.rol === 'Administrador' && (
          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col min-h-[400px]">
            <h3 className="text-lg font-semibold text-primary mb-1">Ingresos a UniPark</h3>
            <p className="text-xs text-slate-500 mb-6">Últimos 50 inicios de sesión en la plataforma.</p>
            
            <div className="overflow-x-auto flex-1">
              {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-accent" /></div>
              ) : historialLogins.length === 0 ? (
                <div className="text-slate-400 text-sm py-10 text-center border-2 border-dashed border-slate-100 rounded-xl">No hay registros de conexión.</div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[400px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-primary sticky top-0 bg-white">
                      <th className="pb-3 pr-4 font-semibold text-sm">Correo Electrónico</th>
                      <th className="pb-3 px-4 font-semibold text-sm">Rol</th> 
                      <th className="pb-3 pl-4 font-semibold text-sm">Último Ingreso</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 text-sm">
                    {historialLogins.map((item) => (
                      <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pr-4 font-medium text-slate-700">{item.correo}</td>
                        <td className="py-4 px-4 text-xs font-bold text-slate-500 uppercase">{item.rol}</td>
                        <td className="py-4 pl-4 font-semibold text-accent">{formatFecha(item.ultimo_login)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}