import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Loader2, AlertCircle, MapPin, Maximize, Car, 
  CheckCircle, AlignLeft, Edit, Trash2 // 🪄 AÑADIDOS LOS ÍCONOS
} from 'lucide-react';
import api from '../../services/api';
import ProtectedImage from '../../components/common/ProtectedImage';
import ZoneEditModal from './ZoneEditModal'; // 🪄 IMPORTAMOS EL MODAL

export default function ParkingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const context = useOutletContext();
  const setDynamicBreadcrumb = context?.setDynamicBreadcrumb;

  const [zona, setZona] = useState(null);
  const [sedeInfo, setSedeInfo] = useState(null); 
  const [sedesList, setSedesList] = useState([]); // 🪄 Para pasar al modal de edición
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🪄 ESTADOS PARA EL MODAL DE EDICIÓN
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0); // Para recargar los datos tras editar

  useEffect(() => {
    const fetchZonaDetails = async () => {
      try {
        setIsLoading(true);
        const responseZona = await api.get(`/zonas/${id}`);
        const dataZona = responseZona.data.data || responseZona.data;
        setZona(dataZona);

        if (dataZona.sede_id) {
            try {
                const responseSedes = await api.get('/admin/sedes');
                const sedes = responseSedes.data?.data || responseSedes.data || [];
                setSedesList(sedes); // Guardamos todas las sedes para el modal
                
                const sedeEncontrada = sedes.find(s => s.id === dataZona.sede_id);
                if (sedeEncontrada) setSedeInfo(sedeEncontrada);
            } catch (e) {
                console.warn("No se pudo cargar la información de la sede específica");
            }
        }

        if (setDynamicBreadcrumb) {
          setDynamicBreadcrumb(
            <div className="flex items-center">
              <span className="text-accent mx-2 flex-shrink-0">/</span>
              <button onClick={() => navigate('/parking')} className="hover:text-accent transition-colors font-medium">Parqueaderos</button>
              <span className="text-accent mx-2 flex-shrink-0">/</span>
              <span className="cursor-default text-primary font-bold">{dataZona.codigo_zona}</span>
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

    fetchZonaDetails();

    return () => {
      if (setDynamicBreadcrumb) setDynamicBreadcrumb(null);
    };
  }, [id, navigate, setDynamicBreadcrumb, refreshCount]);

  // 🪄 LÓGICA DE ELIMINACIÓN
  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este parqueadero? Todos los registros asociados podrían verse afectados.")) {
      try {
        await api.delete(`/zonas/${id}`);
        navigate('/parking'); // Volvemos a la lista tras eliminar
      } catch (err) {
        alert(err.response?.data?.message || "Error al eliminar el parqueadero.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-primary gap-4">
        <Loader2 size={40} className="animate-spin text-accent" />
        <p className="font-medium text-slate-500">Cargando detalles...</p>
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
  
// Cálculos matemáticos para capacidad, ocupadas y disponibles
  const capacidad = Number(zona.capacidad_total) || 0;
  const ocupadas = Number(zona.cupos_ocupados) || Number(zona.ocupadas) || 0; 
  const disponibles = Math.max(0, capacidad - ocupadas); 
  
  // Porcentaje de ocupación para UI
  const porcentajeOcupacion = capacidad > 0 ? (ocupadas / capacidad) * 100 : 0;
  const colorBarra = porcentajeOcupacion > 90 ? 'bg-red-500' : porcentajeOcupacion > 70 ? 'bg-orange-500' : 'bg-emerald-500';

  return (
    <div className="animate-in fade-in duration-300 h-full w-full max-w-5xl mx-auto flex flex-col justify-start pt-4 sm:pt-8 relative">
      
      {/* 🪄 MODAL DE EDICIÓN INCRUSTADO */}
      <ZoneEditModal 
        isOpen={isEditModalOpen} 
        zona={zona}
        sedes={sedesList}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false);
          setRefreshCount(prev => prev + 1); // Recarga los datos del componente
        }}
      />

      <div className="bg-surface rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-8 flex flex-col lg:flex-row gap-8 items-stretch">
        
        {/* LADO IZQUIERDO: Imagen */}
        <div className="w-full lg:w-[45%] flex flex-col bg-slate-50 border border-slate-100 rounded-xl overflow-hidden relative flex-shrink-0">
          <div className="aspect-[4/3] w-full relative">
            {zona.url_foto ? (
              <ProtectedImage 
                src={zona.url_foto} 
                alt={zona.nombre} 
                className="absolute inset-0 w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-slate-400 opacity-50 bg-slate-100">
                <MapPin size={48} className="mb-2" />
                <p className="font-semibold tracking-wide text-[10px] uppercase">Sin Imagen</p>
              </div>
            )}
            <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-800 rounded shadow-sm text-[10px] font-black uppercase tracking-widest border border-slate-200">
              {zona.tipo_permitido}
            </div>
          </div>
          
          <div className="bg-white p-4 border-t border-slate-100">
            <div className="flex justify-between items-center mb-1.5">
               <span className="text-xs font-bold text-slate-600">Ocupación Actual</span>
               <span className="text-xs font-black text-slate-800">{Math.round(porcentajeOcupacion)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
               <div className={`h-full rounded-full transition-all duration-500 ${colorBarra}`} style={{ width: `${Math.min(porcentajeOcupacion, 100)}%` }}></div>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: Detalles */}
        <div className="w-full lg:w-[55%] flex flex-col justify-between">
          
          {/* 🪄 TÍTULO Y BOTONES DE ACCIÓN */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-1">
                {zona.codigo_zona}
              </h1>
              <p className="text-base text-slate-500 font-medium">
                {zona.nombre}
              </p>
            </div>
            
            {/* 🪄 BOTONES EDITAR Y ELIMINAR */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button 
                onClick={() => setIsEditModalOpen(true)} 
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 rounded-lg transition-colors border border-slate-200" 
                title="Editar Parqueadero"
              >
                <Edit size={18} />
              </button>
              <button 
                onClick={handleDelete} 
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-lg transition-colors border border-slate-200" 
                title="Eliminar Parqueadero"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Maximize size={18} />
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Capacidad</p>
                <p className="font-black text-slate-700 leading-none text-lg">{capacidad}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-accent/20 text-accent-hover flex items-center justify-center flex-shrink-0 shadow-sm">
                <Car size={18} />
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Ocupadas</p>
                <p className="font-black text-accent-hover leading-none text-lg">{ocupadas}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <CheckCircle size={18} />
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Disponibles</p>
                <p className="font-black text-emerald-600 leading-none text-lg">{disponibles}</p>
              </div>
            </div>

            {/* 🪄 SEDE: SE REMOVIÓ EL TRUNCATE Y SE PERMITIÓ ENVOLVER EL TEXTO */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <MapPin size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Sede</p>
                <p className="font-bold text-slate-700 leading-tight text-xs">
                  {sedeInfo ? sedeInfo.nombre : `Sede ${zona.sede_id}`}
                </p>
              </div>
            </div>

          </div>

          <div className="bg-slate-50 p-4 rounded-xl flex gap-3 items-start border border-slate-100 mt-auto">
            <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 flex-shrink-0 mt-0.5">
              <AlignLeft size={20} className="text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 mb-1">Descripción</p>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {zona.descripcion || "No hay detalles adicionales registrados para este punto de control."}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}