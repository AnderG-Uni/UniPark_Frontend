import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Loader2, AlertCircle, MapPin, Maximize, Car, 
  CheckCircle, AlignLeft
} from 'lucide-react';
import api from '../../services/api';
import ProtectedImage from '../../components/common/ProtectedImage';

export default function ParkingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const context = useOutletContext();
  const setDynamicBreadcrumb = context?.setDynamicBreadcrumb;

  const [zona, setZona] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchZona = async () => {
      try {
        setIsLoading(true);
        // Si tu endpoint se llama distinto, ajusta aquí (ej: /parqueaderos)
        const response = await api.get(`/zonas/${id}`);
        const data = response.data.data || response.data;
        setZona(data);

        // Actualizamos el Breadcrumb superior (la barrita de navegación)
        if (setDynamicBreadcrumb) {
          setDynamicBreadcrumb(
            <div className="flex items-center">
              <span className="text-accent mx-2">/</span>
              <button onClick={() => navigate('/parking')} className="hover:text-accent transition-colors font-medium">Parqueaderos</button>
              <span className="text-accent mx-2">/</span>
              <span className="cursor-default text-primary">{data.codigo_zona}</span>
            </div>
          );
        }
      } catch (err) {
        console.error("Error al cargar detalles de la zona:", err);
        setError("No se pudo cargar la información del parqueadero.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchZona();

    // Limpiamos el breadcrumb al salir
    return () => {
      if (setDynamicBreadcrumb) setDynamicBreadcrumb(null);
    };
  }, [id, navigate, setDynamicBreadcrumb]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-primary gap-4">
        <Loader2 size={40} className="animate-spin text-accent" />
        <p className="font-medium text-slate-500">Cargando detalles de la zona...</p>
      </div>
    );
  }

  if (error || !zona) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex flex-col items-center gap-4 border border-red-200 max-w-md mx-auto mt-10">
        <AlertCircle size={40} /> 
        <p className="text-center font-medium">{error || "Parqueadero no encontrado."}</p>
        <button onClick={() => navigate('/parking')} className="mt-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-red-100 hover:bg-red-50 transition-colors">Volver a parqueaderos</button>
      </div>
    );
  }

  // Cálculos matemáticos
  const capacidad = Number(zona.capacidad_total) || 0;
  const ocupadas = Number(zona.ocupadas) || 0;
  const disponibles = capacidad - ocupadas;

  return (
    <div className="animate-in fade-in duration-300 h-full w-full max-w-6xl mx-auto flex flex-col justify-center py-5">
      
      {/* 🪄 CORRECCIÓN 1: Se eliminó el botón 'Volver al listado' que estaba aquí arriba */}

      {/* TARJETA PRINCIPAL */}
      <div className="bg-surface rounded-[2rem] shadow-lg border border-slate-100 p-6 sm:p-10 flex flex-col lg:flex-row gap-10 items-stretch">
        
        {/* LADO IZQUIERDO: Imagen (CORREGIDO PARA ADAPTARSE) */}
        {/* 🪄 CORRECCIÓN 2: Se estableció un alto máximo fijo (lg:h-[500px]) y uso de object-cover */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-100/50 border border-slate-100 rounded-3xl overflow-hidden p-3 relative flex-shrink-0 aspect-[1/1] lg:aspect-auto lg:h-[500px]">
          {zona.url_foto ? (
            <ProtectedImage 
              src={zona.url_foto} 
              alt={zona.nombre} 
              className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-inner" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-10 text-slate-400 opacity-50 bg-slate-100 rounded-2xl">
              <MapPin size={80} className="mb-4" />
              <p className="font-semibold tracking-wide text-xs">SIN IMAGEN</p>
            </div>
          )}
        </div>

        {/* LADO DERECHO: Detalles */}
        <div className="w-full lg:w-1/2 flex flex-col pt-5 lg:pt-0">
          
          {/* Insignia Tipo */}
          <div className="flex justify-between items-start mb-6">
            <span className="px-4 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold uppercase tracking-wider shadow-inner">
              {zona.tipo_permitido}
            </span>
          </div>

          {/* Título Principal */}
          <h1 className="text-5xl lg:text-6xl font-black text-slate-800 tracking-tighter mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
            {zona.codigo_zona}
          </h1>
          <p className="text-xl text-slate-400 font-medium italic mb-10 leading-snug">
            {zona.nombre}
          </p>

          {/* Grid de Stats 2x2 */}
          <div className="grid grid-cols-2 gap-y-10 gap-x-5 mb-12">
            
            {/* Dato 1 */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-200">
                <Maximize size={24} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Capacidad</p>
                <p className="font-black text-slate-700 leading-none text-2xl">{capacidad}</p>
              </div>
            </div>

            {/* Dato 2 */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/20 text-accent-hover flex items-center justify-center flex-shrink-0 shadow-sm border border-accent/20">
                <Car size={24} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Ocupadas</p>
                <p className="font-black text-accent-hover leading-none text-2xl">{ocupadas}</p>
              </div>
            </div>

            {/* Dato 3 */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-emerald-200">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Disponibles</p>
                <p className="font-black text-emerald-600 leading-none text-2xl">{disponibles}</p>
              </div>
            </div>

            {/* Dato 4 */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-purple-200">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Ubicación</p>
                <p className="font-extrabold text-slate-700 leading-none">Sede {zona.sede_id}</p>
              </div>
            </div>

          </div>

          {/* Tarjeta inferior: Descripción */}
          <div className="bg-slate-50/50 p-5 rounded-3xl flex gap-4 items-start border border-slate-100 shadow-inner mt-auto">
            <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-100 flex-shrink-0">
              <AlignLeft size={28} className="text-slate-400" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-700 mb-1.5">Descripción de la zona</p>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {zona.descripcion || "No hay una descripción adicional para este parqueadero."}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}