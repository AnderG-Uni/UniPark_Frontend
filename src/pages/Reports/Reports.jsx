import React, { useState, useEffect } from 'react';
import { Car, Bike, Activity, AlertTriangle, Loader2, AlertCircle, Clock, CheckCircle, MapPin } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import api from '../../services/api';

export default function Reports() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [ocupacion, setOcupacion] = useState([]);
  const [horasPico, setHorasPico] = useState([]);
  const [pernoctas, setPernoctas] = useState([]);

  useEffect(() => {
    const fetchReportes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [resOcupacion, resHorasPico, resPernoctas] = await Promise.all([
          api.get('/reportes/ocupacion'),
          api.get('/reportes/horas-pico'),
          api.get('/reportes/pernoctas')
        ]);

        setOcupacion(resOcupacion.data?.data || resOcupacion.data || []);
        setHorasPico(resHorasPico.data?.data || resHorasPico.data || []);
        setPernoctas(resPernoctas.data?.data || resPernoctas.data || []);

      } catch (err) {
        console.error("Error al cargar reportes:", err);
        setError("Hubo un problema al cargar la analítica. Intenta de nuevo.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportes();
  }, []);

  // 🪄 NUEVA LÓGICA: Ahora SUMA todos los parqueaderos del mismo tipo
  const getCantidadOcupacion = (tipoBuscado) => {
    if (!Array.isArray(ocupacion)) return 0;
    return ocupacion
      .filter(d => (d.tipo_permitido || d.tipo || d.zona)?.toLowerCase().includes(tipoBuscado.toLowerCase()))
      .reduce((total, d) => total + (Number(d.cupos_ocupados) || Number(d.cantidad) || 0), 0);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-primary gap-4 min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-accent" />
        <p className="font-medium text-slate-500">Analizando datos en tiempo real...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex flex-col items-center gap-4 border border-red-200 max-w-md mx-auto mt-10">
        <AlertCircle size={40} /> 
        <p className="text-center font-medium">{error}</p>
      </div>
    );
  }

  // Cálculos para las tarjetas superiores
  const totalCarros = getCantidadOcupacion('carro');
  const totalMotos = getCantidadOcupacion('moto');
  const totalBicis = getCantidadOcupacion('bici');

  // 🪄 MAPEO PARA GRÁFICO 1: Ocupación por Parqueadero (Barras Apiladas)
  const chartDataOcupacion = Array.isArray(ocupacion) ? ocupacion.map(item => ({
    nombre: item.zona?.replace('Parqueadero ', '') || 'Zona', // Acortamos el nombre para que quepa mejor
    ocupados: Number(item.cupos_ocupados) || 0,
    libres: (Number(item.capacidad_total) || 0) - (Number(item.cupos_ocupados) || 0),
    porcentaje: item.porcentaje_ocupacion
  })) : [];

  // 🪄 MAPEO PARA GRÁFICO 2: Horas Pico (Convirtiendo "0" en "00:00")
  const chartDataHoras = Array.isArray(horasPico) ? horasPico.map(item => {
    const horaFormateada = item.hora_del_dia != null 
      ? `${item.hora_del_dia.toString().padStart(2, '0')}:00` 
      : 'N/A';
    return {
      hora: horaFormateada,
      ingresos: Number(item.total_ingresos) || 0
    };
  }) : [];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* ================= TARJETAS DE OCUPACIÓN ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Car size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-1">Carros</span>
            <span className="text-3xl font-black text-slate-800 leading-none">{totalCarros}</span>
          </div>
        </div>
        
        <div className="bg-surface p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Activity size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-1">Motos</span>
            <span className="text-3xl font-black text-slate-800 leading-none">{totalMotos}</span>
          </div>
        </div>
        
        <div className="bg-surface p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Bike size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-1">Bicicletas</span>
            <span className="text-3xl font-black text-slate-800 leading-none">{totalBicis}</span>
          </div>
        </div>
      </div>

      {/* ================= NUEVO GRÁFICO: OCUPACIÓN POR ZONA (Ancho Completo) ================= */}
      <div className="bg-surface p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="text-blue-500" size={20} />
          <h3 className="text-lg font-bold text-primary">Estado actual de los parqueaderos</h3>
        </div>
        
        <div className="w-full" style={{ height: '280px' }}>
          {chartDataOcupacion.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataOcupacion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="nombre" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                {/* Barras Apiladas: Muestran ocupados vs libres */}
                <Bar dataKey="ocupados" stackId="a" fill="#0ea5e9" name="Cupos Ocupados" />
                <Bar dataKey="libres" stackId="a" fill="#e2e8f0" name="Cupos Libres" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50">
              <p>No hay datos de zonas de parqueo</p>
            </div>
          )}
        </div>
      </div>

      {/* ================= SECCIÓN 2 COLUMNAS: HORAS PICO Y PERNOCTAS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICO: Horas Pico */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="text-accent" size={20} />
            <h3 className="text-lg font-bold text-primary">Flujo por Horas (Horas Pico)</h3>
          </div>
          
          <div className="w-full" style={{ height: '300px' }}>
            {chartDataHoras.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataHoras} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="hora" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="ingresos" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Total Ingresos" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50">
                <p>No hay datos de flujo para hoy</p>
              </div>
            )}
          </div>
        </div>

        {/* LISTA: Vehículos Olvidados */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} />
              <h3 className="text-lg font-bold text-primary">Vehículos olvidados</h3>
            </div>
            <span className="bg-red-50 text-red-600 py-1 px-3 rounded-full text-xs font-bold border border-red-100">
              {pernoctas.length} Alertas
            </span>
          </div>
          
          <div className="w-full h-[300px] overflow-y-auto no-scrollbar pr-2">
            {pernoctas.length > 0 ? (
              <div className="flex flex-col gap-3">
                {pernoctas.map((vehiculo, index) => {
                  
                  let fechaFormateada = '---';
                  let horaFormateada = '---';
                  if (vehiculo.fecha_entrada) {
                    const dateObj = new Date(vehiculo.fecha_entrada);
                    fechaFormateada = dateObj.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
                    horaFormateada = dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute:'2-digit' });
                  }

                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-red-200 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 uppercase text-lg leading-none">{vehiculo.placa || 'N/A'}</span>
                        <span className="text-xs font-semibold text-slate-500 mt-1.5 capitalize">{vehiculo.tipo || 'Vehículo'} • {vehiculo.propietario || 'Propietario N/A'}</span>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ingreso</span>
                        <span className="text-xs font-bold text-slate-600">
                          {fechaFormateada}
                        </span>
                        <span className="text-sm font-black text-red-500 leading-none mt-0.5">
                          {horaFormateada}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                <CheckCircle size={32} className="mb-2 opacity-50 text-emerald-500" />
                <p>No hay vehículos olvidados</p>
                <p className="text-xs mt-1">El parqueadero está limpio</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}