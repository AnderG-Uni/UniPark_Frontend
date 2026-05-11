import React, { useState, useEffect } from 'react';
import useAuthStore from '../../context/useAuthStore';
import api from '../../services/api';
import { MapPin, Loader2, AlertCircle, LayoutDashboard, CheckCircle, Car as CarIcon, X, Download, QrCode, UserCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import ProtectedImage from '../../components/common/ProtectedImage';

export default function Home() {
  const { user } = useAuthStore();
  const isAdmin = user?.rol === 'Administrador';
  
  const [isLoading, setIsLoading] = useState(true);

  // ================= ESTADOS DEL ADMINISTRADOR =================
  const [vehiculos, setVehiculos] = useState([]);
  const [logins, setLogins] = useState([]); 
  const [errorVehiculos, setErrorVehiculos] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // ================= ESTADOS DEL ESTUDIANTE/DOCENTE/GUARDA =================
  const [ocupacion, setOcupacion] = useState([]);
  const [sedes, setSedes] = useState([]); 
  const [errorOcupacion, setErrorOcupacion] = useState(null);
  const [selectedSede, setSelectedSede] = useState('ALL'); 

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      if (isAdmin) {
        // CARGA PARA ADMINISTRADORES
        try {
          const resVehiculos = await api.get('/vehiculos');
          let vehiculosData = resVehiculos.data.data || resVehiculos.data || [];
          // Ordenamos por fecha de registro descendente (los más nuevos primero)
          vehiculosData.sort((a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro));
          setVehiculos(vehiculosData);
        } catch (err) {
          setErrorVehiculos("No pudimos cargar la lista de vehículos.");
        }
        
        try {
          const resLogins = await api.get('/historial/logins'); 
          let loginsData = resLogins.data.data || resLogins.data || [];
          // Ordenamos por último login
          loginsData.sort((a, b) => new Date(b.ultimo_login) - new Date(a.ultimo_login));
          setLogins(loginsData);
        } catch (err) {
          console.warn("Historial de accesos no disponible.");
        }
      } else {
        // CARGA PARA NO-ADMINS
        try {
          const [resOcupacion, resSedes] = await Promise.all([
            api.get('/reportes/ocupacion'),
            api.get('/admin/sedes')
          ]);
          setOcupacion(resOcupacion.data?.data || resOcupacion.data || []);
          setSedes(resSedes.data?.data || resSedes.data || []);
        } catch (err) {
          setErrorOcupacion("No se pudo conectar con el sistema de disponibilidad.");
        }
      }

      setIsLoading(false);
    };

    fetchDashboardData();
  }, [isAdmin]);

  const handleOpenQR = (v) => { setSelectedVehicle(v); setQrModalOpen(true); };
  const handleDownloadQR = async () => {
    if (!selectedVehicle?.url_qr) return;
    try {
      const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '');
      const path = selectedVehicle.url_qr;
      const fullUrl = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
      const token = localStorage.getItem('access_token');
      const response = await axios.get(fullUrl, { responseType: 'blob', headers: { Authorization: `Bearer ${token}` } });
      const blobUrl = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `QR_UniPark_${selectedVehicle.placa.toUpperCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      alert("Hubo un problema al descargar el código QR.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-primary gap-4">
        <Loader2 size={40} className="animate-spin text-accent" />
        <p className="font-medium text-slate-500">Sincronizando con UniPark...</p>
      </div>
    );
  }

  // ================= VISTA ADMINISTRADOR =================
  if (isAdmin) {
    return (
       <div className="flex flex-col xl:flex-row gap-4 relative animate-in fade-in duration-300 h-full">
         
         {/* MODAL DEL QR */}
         {qrModalOpen && selectedVehicle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-surface p-8 rounded-3xl shadow-2xl max-w-sm w-full flex flex-col items-center relative border border-slate-100 animate-in zoom-in-95 duration-200">
              <button onClick={() => setQrModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"><X size={20} /></button>
              
              <h3 className="text-2xl font-black text-primary mb-1">Código QR</h3>
              <p className="text-slate-500 text-sm mb-6 uppercase font-bold tracking-widest">{selectedVehicle.placa}</p>
              
              {/* TAMAÑO DEL QR (w-64 h-64 = 256px) */}
              <div className="w-64 h-64 bg-white border border-slate-200 shadow-sm rounded-2xl p-3 mb-6 flex items-center justify-center">
                <ProtectedImage src={selectedVehicle.url_qr} alt={`QR`} className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              
              <button onClick={handleDownloadQR} className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3 rounded-xl shadow-soft transition-all flex justify-center items-center gap-2 text-base">
                <Download size={18} /> Guardar QR
              </button>
            </div>
          </div>
         )}

         {/* COLUMNA IZQUIERDA: RESUMEN DE VEHÍCULOS */}
         <div className="w-full xl:w-2/3 flex flex-col gap-4">
           
           <div className="bg-surface p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><LayoutDashboard size={24} /></div>
             <div>
               <h2 className="text-xl font-black text-slate-800 leading-tight">Panel Administrativo</h2>
               <p className="text-slate-500 text-xs mt-0.5">Resumen de la actividad reciente en el sistema.</p>
             </div>
           </div>

           <div className="bg-surface rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col flex-1 overflow-hidden">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-base font-bold text-primary flex items-center gap-2">
                 <CarIcon className="text-accent" size={18} /> Últimos 5 vehículos registrados
               </h3>
             </div>

             <div className="overflow-x-auto overflow-y-hidden flex-1">
               <table className="w-full text-left border-collapse min-w-[700px]">
                 <thead>
                   <tr className="border-b border-slate-100 text-slate-400">
                     {/* 🪄 NUEVOS ENCABEZADOS DE LA TABLA */}
                     <th className="pb-2 font-bold text-[10px] uppercase tracking-wider pl-1">QR / Placa</th>
                     <th className="pb-2 font-bold text-[10px] uppercase tracking-wider">ID / Propietario</th>
                     <th className="pb-2 font-bold text-[10px] uppercase tracking-wider">Tipo</th>
                     <th className="pb-2 font-bold text-[10px] uppercase tracking-wider">Marca / Modelo</th>
                     <th className="pb-2 font-bold text-[10px] uppercase tracking-wider text-right pr-1">Fecha Registro</th>
                   </tr>
                 </thead>
                 <tbody className="text-slate-700 text-xs">
                   {errorVehiculos ? (
                     <tr><td colSpan="5" className="py-4 text-center text-red-500">{errorVehiculos}</td></tr>
                   ) : vehiculos.length === 0 ? (
                     <tr><td colSpan="5" className="py-6 text-center text-slate-400">No hay vehículos registrados.</td></tr>
                   ) : (
                     vehiculos.slice(0, 5).map((v) => (
                       <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                         
                         {/* 1. QR / PLACA */}
                         <td className="py-2.5 pl-1 w-32">
                           <div className="flex items-center gap-2">
                             <button 
                               onClick={() => handleOpenQR(v)} 
                               className="w-8 h-8 bg-slate-50 text-slate-400 rounded-md flex items-center justify-center border border-slate-100 hover:border-accent hover:text-accent hover:bg-white transition-colors shadow-sm"
                               title="Ver QR"
                             >
                               <QrCode size={14} />
                             </button>
                             <span className="font-black text-slate-800 uppercase tracking-widest">{v.placa}</span>
                           </div>
                         </td>
                         
                         {/* 2. ID / PROPIETARIO */}
                         <td className="py-2.5">
                           <div className="flex flex-col leading-tight">
                             <span className="font-bold text-slate-700 capitalize truncate max-w-[150px]" title={v.nombres_completos}>
                               {v.nombres_completos?.toLowerCase() || 'Sin propietario'}
                             </span>
                             <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">
                               {v.numero_documento || '---'}
                             </span>
                           </div>
                         </td>
                         
                         {/* 3. TIPO */}
                         <td className="py-2.5">
                           <span className="font-bold text-slate-600 capitalize bg-slate-100 px-2 py-0.5 rounded text-[10px] border border-slate-200/50">
                             {v.tipo}
                           </span>
                         </td>

                         {/* 4. MARCA / MODELO */}
                         <td className="py-2.5">
                           <div className="flex flex-col leading-tight">
                             <span className="font-bold text-slate-700 capitalize">{v.marca || '---'}</span>
                             <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">
                               Modelo: {v.modelo || '---'}
                             </span>
                           </div>
                         </td>
                         
                         {/* 5. FECHA REGISTRO */}
                         <td className="py-2.5 text-right pr-1 font-medium text-slate-500">
                           {v.fecha_registro ? new Date(v.fecha_registro).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }) : '---'}
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
           </div>
         </div>

         {/* COLUMNA DERECHA: ÚLTIMOS ACCESOS AL SISTEMA (LOGINS) */}
         <div className="w-full xl:w-1/3 bg-surface rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-auto max-h-[500px] overflow-hidden">
           <div className="mb-4">
             <h3 className="text-base font-bold text-primary flex items-center gap-2 mb-0.5">
               <UserCircle className="text-blue-500" size={18} /> Últimos Inicios de Sesión
             </h3>
             <p className="text-slate-500 text-[10px]">Registro de los últimos 5 usuarios que ingresaron.</p>
           </div>
           
           <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
             <div className="flex flex-col gap-2.5">
               {logins.length === 0 ? (
                 <div className="py-6 text-center text-slate-400 text-xs">No hay accesos recientes.</div>
               ) : (
                 logins.slice(0, 5).map((login) => {
                   const fecha = new Date(login.ultimo_login);
                   const fechaCorta = fecha.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
                   const hora = fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

                   return (
                     <div key={login.id} className="flex justify-between items-center p-2.5 border border-slate-100 rounded-lg bg-slate-50 hover:border-slate-200 transition-colors shadow-sm">
                       <div className="flex flex-col overflow-hidden pr-2">
                         <span className="font-bold text-slate-700 text-xs truncate" title={login.correo}>{login.correo}</span>
                         <span className="text-[9px] text-slate-500 font-bold tracking-wider mt-0.5 uppercase bg-slate-200/50 w-fit px-1.5 py-0.5 rounded border border-slate-200/50">
                           {login.rol}
                         </span>
                       </div>
                       <div className="text-right flex flex-col items-end flex-shrink-0">
                         <span className="text-[10px] font-bold text-slate-500 uppercase">{fechaCorta}</span>
                         <span className="text-xs font-black text-blue-500 leading-tight">{hora}</span>
                       </div>
                     </div>
                   );
                 })
               )}
             </div>
           </div>
         </div>
       </div>
    );
  }

  // ================= VISTA ESTUDIANTES / DOCENTES =================
  const ocupacionFiltrada = selectedSede === 'ALL' 
    ? ocupacion 
    : ocupacion.filter(item => item.sede_id?.toString() === selectedSede);

  const chartDataOcupacion = ocupacionFiltrada.map(item => ({
    nombre: item.zona?.replace('Parqueadero ', '') || 'Zona',
    ocupados: Number(item.cupos_ocupados) || 0,
    libres: (Number(item.capacidad_total) || 0) - (Number(item.cupos_ocupados) || 0)
  }));

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      
      {/* BARRA DE FILTRO SUPERIOR */}
      <div className="bg-surface p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MapPin size={20} /></div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">Estado de Parqueaderos</h2>
            <p className="text-xs text-slate-500 mt-0.5">Disponibilidad en tiempo real por sede.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto bg-slate-50 p-2 rounded-xl border border-slate-100">
           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap pl-2">Seleccionar Sede:</label>
           <select
             value={selectedSede}
             onChange={(e) => setSelectedSede(e.target.value)}
             className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-semibold focus:border-accent outline-none w-full sm:w-auto min-w-[180px] shadow-sm cursor-pointer"
           >
             <option value="ALL">Ver todas las sedes</option>
             {sedes.map((sede) => (
               <option key={sede.id} value={sede.id.toString()}>{sede.nombre}</option>
             ))}
           </select>
        </div>
      </div>

      {errorOcupacion ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 border border-red-200">
          <AlertCircle size={20} /> <p className="font-medium text-sm">{errorOcupacion}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* GRÁFICO COMPACTO */}
          <div className="lg:col-span-2 bg-surface p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
              <MapPin className="text-blue-500" size={18} /> Gráfica de Ocupación
            </h3>
            
            <div className="w-full" style={{ height: '260px' }}>
              {chartDataOcupacion.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDataOcupacion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="nombre" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="ocupados" stackId="a" fill="#0ea5e9" name="Ocupados" />
                    <Bar dataKey="libres" stackId="a" fill="#e2e8f0" name="Libres" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50 text-sm">
                  <p>Sin datos para la sede seleccionada.</p>
                </div>
              )}
            </div>
          </div>

          {/* LISTA DE DISPONIBLES */}
          <div className="bg-surface p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
              <CheckCircle className="text-emerald-500" size={18} /> Cupos Disponibles
            </h3>
            
            <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar pr-1 flex-1">
              {ocupacionFiltrada.length > 0 ? ocupacionFiltrada.map((zona, index) => {
                const libres = (Number(zona.capacidad_total) || 0) - (Number(zona.cupos_ocupados) || 0);
                const porcentaje = Number(zona.porcentaje_ocupacion) || 0;
                
                const colorCupos = libres > 5 ? 'text-emerald-500' : libres > 0 ? 'text-orange-500' : 'text-red-500';
                const colorBarra = porcentaje > 90 ? 'bg-red-500' : porcentaje > 70 ? 'bg-orange-500' : 'bg-emerald-500';

                return (
                  <div key={index} className="flex justify-between items-stretch p-4 border border-slate-100 rounded-xl bg-slate-50 hover:border-slate-200 transition-colors gap-4 shadow-sm">
                    <div className="flex flex-col flex-1 justify-between">
                      <div className="mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm leading-snug">{zona.zona || 'Parqueadero'}</span>
                          <span className="bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border border-slate-200/50">
                            {zona.tipo_permitido}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-slate-500">Capacidad: <span className="text-slate-800">{zona.capacidad_total || 0}</span></span>
                          <span className="text-slate-500">Ocupados: <span className="text-slate-800">{zona.cupos_ocupados || 0}</span></span>
                          <span className="text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-sm">{porcentaje}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${colorBarra}`} style={{ width: `${Math.min(porcentaje, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-w-[72px]">
                      <span className={`block text-3xl font-black leading-none ${colorCupos}`}>{libres}</span>
                      <span className="text-[9px] uppercase font-bold text-slate-400 mt-1">Libres</span>
                    </div>
                  </div>
                )
              }) : (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <MapPin size={24} className="mb-2 opacity-30" />
                  <p className="text-center text-xs px-4">No se encontró información de parqueo para el filtro seleccionado.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}