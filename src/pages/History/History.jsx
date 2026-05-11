import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../context/useAuthStore';

export default function History() {
  const { user } = useAuthStore();
  
  // Identificamos si es una vista personal (Estudiante/Docente)
  const isPersonalView = ['Estudiante', 'Docente'].includes(user?.rol);

  const [historialVehicular, setHistorialVehicular] = useState([]);
  const [historialLogins, setHistorialLogins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🪄 PAGINACIÓN CONFIGURADA A 10 REGISTROS
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchHistorial = async () => {
      setIsLoading(true);
      try {
        if (isPersonalView) {
          const resVehicular = await api.get('/historial/personal');
          setHistorialVehicular(resVehicular.data?.data || resVehicular.data || []);
        } else {
          const [resVehicular, resLogins] = await Promise.all([
            api.get('/historial/global'),
            api.get('/historial/logins')
          ]);

          setHistorialVehicular(resVehicular.data?.data || resVehicular.data || []);
          
          const loginsData = resLogins.data?.data || resLogins.data || [];
          loginsData.sort((a, b) => new Date(b.ultimo_login) - new Date(a.ultimo_login));
          setHistorialLogins(loginsData);
        }
      } catch (err) {
        console.error("Error al cargar historiales:", err);
        setError("Ocurrió un error al cargar el historial del sistema.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistorial();
  }, [isPersonalView]);

  // 🪄 FUNCIÓN MATEMÁTICA PARA CALCULAR EL TIEMPO ESTACIONADO
  const calcularDuracion = (ingreso, salida) => {
    if (!salida) return <span className="text-[10px] text-slate-400 italic">En curso...</span>;

    const diffMs = new Date(salida) - new Date(ingreso);
    const diffMins = Math.floor(diffMs / 1000 / 60);

    if (diffMins < 60) return <span className="font-semibold text-slate-700">{diffMins} min</span>;

    const diffHrs = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    if (diffHrs < 24) return <span className="font-semibold text-slate-700">{diffHrs}h {remainingMins}m</span>;

    const diffDays = Math.floor(diffHrs / 24);
    const remainingHrs = diffHrs % 24;
    if (diffDays < 7) return <span className="font-semibold text-slate-700">{diffDays}d {remainingHrs}h</span>;

    const diffWeeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;
    return <span className="font-semibold text-slate-700">{diffWeeks} sem {remainingDays}d</span>;
  };

  const totalPages = Math.ceil(historialVehicular.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVehiculos = historialVehicular.slice(startIndex, startIndex + itemsPerPage);

  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-primary gap-4">
        <Loader2 size={40} className="animate-spin text-accent" />
        <p className="font-medium text-slate-500">Cargando historiales...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-4 border border-red-200">
        <AlertCircle size={24} /> <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      
      {/* ================= TABLA 1: INGRESOS VEHICULARES ================= */}
      <div className="w-full bg-surface p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {isPersonalView ? 'Mis Ingresos Vehiculares' : 'Ingresos vehiculares'}
            </h2>
            <p className="text-[13px] text-slate-500 mt-0.5">
              {isPersonalView ? 'Historial de tus accesos a la universidad.' : 'Historial global de accesos a las distintas sedes y zonas.'}
            </p>
          </div>
          <div className="text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            Total registros: {historialVehicular.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b-2 border-slate-100 text-slate-400">
                <th className="pb-2 pt-1 font-bold text-[10px] uppercase tracking-wider">Vehículo</th>
                
                {/* 🪄 OCULTAMOS EL TIPO SI ES ESTUDIANTE/DOCENTE */}
                {!isPersonalView && (
                  <th className="pb-2 pt-1 font-bold text-[10px] uppercase tracking-wider">Tipo</th>
                )}
                
                <th className="pb-2 pt-1 font-bold text-[10px] uppercase tracking-wider">Sede</th>
                <th className="pb-2 pt-1 font-bold text-[10px] uppercase tracking-wider">Zona</th>
                <th className="pb-2 pt-1 font-bold text-[10px] uppercase tracking-wider">Guarda a cargo</th>
                <th className="pb-2 pt-1 font-bold text-[10px] uppercase tracking-wider">Fecha ingreso</th>
                <th className="pb-2 pt-1 font-bold text-[10px] uppercase tracking-wider">Fecha salida</th>
                
                {/* 🪄 NUEVA COLUMNA DE DURACIÓN */}
                <th className="pb-2 pt-1 font-bold text-[10px] uppercase tracking-wider">
                  <div className="flex items-center gap-1"><Clock size={12}/> Tiempo</div>
                </th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {currentVehiculos.length === 0 ? (
                <tr>
                  <td colSpan={isPersonalView ? "7" : "8"} className="py-6 text-center text-slate-400 text-sm">
                    No hay ingresos registrados.
                  </td>
                </tr>
              ) : (
                currentVehiculos.map((registro, index) => (
                  <tr key={registro.id || index} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-2 font-black text-slate-800 uppercase tracking-widest text-sm">{registro.vehiculo}</td>
                    
                    {/* 🪄 OCULTAMOS EL TIPO SI ES ESTUDIANTE/DOCENTE */}
                    {!isPersonalView && (
                      <td className="py-2">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${registro.tipo === 'Visitante' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                          {registro.tipo}
                        </span>
                      </td>
                    )}

                    <td className="py-2 text-slate-600 capitalize font-medium text-xs">{registro.sede || '---'}</td>
                    <td className="py-2 text-slate-600 capitalize text-xs">{registro.zona || '---'}</td>
                    <td className="py-2 text-slate-500 capitalize text-xs max-w-[150px] truncate" title={registro.guarda}>
                      {registro.guarda?.toLowerCase() || 'Sistema / Sin registro'}
                    </td>
                    <td className="py-2 text-slate-600 text-xs">
                      {new Date(registro.fecha_ingreso).toLocaleString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit' })}
                    </td>
                    <td className="py-2 font-medium text-xs">
                      {registro.fecha_salida ? (
                        <span className="text-slate-600">
                          {new Date(registro.fecha_salida).toLocaleString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit' })}
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">Activo</span>
                      )}
                    </td>
                    
                    {/* 🪄 CELDA DEL TIEMPO CALCULADO */}
                    <td className="py-2 text-xs">
                      {calcularDuracion(registro.fecha_ingreso, registro.fecha_salida)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* CONTROLES DE PAGINACIÓN */}
        {historialVehicular.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium">
              Mostrando {startIndex + 1} al {Math.min(startIndex + itemsPerPage, historialVehicular.length)} de {historialVehicular.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button onClick={prevPage} disabled={currentPage === 1} className="p-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-slate-700 px-2">{currentPage} / {totalPages}</span>
              <button onClick={nextPage} disabled={currentPage === totalPages} className="p-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= TABLA 2: INGRESOS A UNIPARK (SOLO ADMIN/GUARDA) ================= */}
      {!isPersonalView && (
        <div className="w-full bg-surface p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col mb-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-800">Ingresos a la plataforma (Logins)</h2>
            <p className="text-[13px] text-slate-500 mt-0.5">Últimos inicios de sesión en el sistema.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b-2 border-slate-100 text-slate-400">
                  <th className="pb-2 pt-1 font-bold text-[10px] uppercase tracking-wider">Correo Electrónico</th>
                  <th className="pb-2 pt-1 font-bold text-[10px] uppercase tracking-wider">Rol de Usuario</th>
                  <th className="pb-2 pt-1 font-bold text-[10px] uppercase tracking-wider text-right pr-4">Último Ingreso</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {historialLogins.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-6 text-center text-slate-400 text-sm">No hay inicios de sesión recientes.</td>
                  </tr>
                ) : (
                  historialLogins.slice(0, 50).map((login) => (
                    <tr key={login.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-2 font-bold text-slate-700 text-sm">{login.correo}</td>
                      <td className="py-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">
                          {login.rol}
                        </span>
                      </td>
                      <td className="py-2 text-right pr-4 font-bold text-accent text-sm">
                        {new Date(login.ultimo_login).toLocaleString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}