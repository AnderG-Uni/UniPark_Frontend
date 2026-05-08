import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { Edit, Trash2, Calendar, Hash, Palette, Box, Loader2 } from 'lucide-react';
import api from '../../services/api';
import ProtectedImage from '../../components/common/ProtectedImage';
import VehicleEditModal from './VehicleEditModal'; // <-- Importamos el Modal

export default function VehicleDetail() {
  const { id } = useParams();
  const context = useOutletContext();
  const setDynamicBreadcrumb = context?.setDynamicBreadcrumb;
  
  const [vehiculo, setVehiculo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para controlar si el Modal está abierto o cerrado
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 1. Efecto para buscar los datos
  useEffect(() => {
    const fetchVehiculo = async () => {
      try {
        const response = await api.get(`/vehiculos/${id}`);
        setVehiculo(response.data.data || response.data);
      } catch (err) {
        console.error("Error al cargar detalle:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehiculo();
  }, [id]);

  // 2. Efecto para la barra superior
  useEffect(() => {
    if (vehiculo && setDynamicBreadcrumb) {
      setDynamicBreadcrumb(
        <div className="flex items-center">
          <span className="text-accent mx-2">/</span>
          <Link to="/dashboard" className="hover:text-accent transition-colors">Inicio</Link>
          <span className="text-accent mx-2">/</span>
          <Link to="/vehicles" className="hover:text-accent transition-colors">Vehículos</Link>
          <span className="text-accent mx-2">/</span>
          <span className="text-primary cursor-default font-bold">
            Detalles [{vehiculo.placa.toUpperCase()}]
          </span>
        </div>
      );
    }
    return () => {
      if (setDynamicBreadcrumb) setDynamicBreadcrumb(null);
    };
  }, [vehiculo, setDynamicBreadcrumb]);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-accent" size={40} /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="w-full bg-surface rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row mt-2">
        
        {/* LADO IZQUIERDO: Imagen */}
        <div className="md:w-2/5 bg-slate-50 p-6 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-100">
           <div className="absolute inset-0 bg-accent/5 blur-2xl rounded-full"></div>
           <ProtectedImage 
              src={vehiculo?.url_foto} 
              alt={vehiculo?.placa} 
              className="w-full max-w-[180px] md:max-w-full object-contain mix-blend-multiply relative z-10 transition-transform hover:scale-105 duration-300" 
           />
        </div>

        {/* LADO DERECHO: Info */}
        <div className="md:w-3/5 p-8 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <span className="bg-accent/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
              {vehiculo?.tipo}
            </span>
            <div className="flex gap-2">
              
              {/* BOTÓN EDITAR: Abre el Modal */}
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                <Edit size={16} />
              </button>
              
              <button className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <h1 className="text-4xl font-black text-primary mb-1 tracking-tighter uppercase">
            {vehiculo?.placa}
          </h1>
          <p className="text-lg text-slate-400 font-medium mb-6 capitalize italic">
            {vehiculo?.marca} {vehiculo?.modelo || ''}
          </p>

          <div className="grid grid-cols-2 gap-y-5 gap-x-4">
            <DetailItem icon={<Palette size={16}/>} label="Color" value={vehiculo?.color} />
            <DetailItem icon={<Box size={16}/>} label="Modelo" value={vehiculo?.modelo} />
            <DetailItem icon={<Calendar size={16}/>} label="Registro" value={vehiculo?.fecha_registro ? new Date(vehiculo.fecha_registro).toLocaleDateString() : 'N/A'} />
            <DetailItem icon={<Hash size={16}/>} label="Propietario" value={vehiculo?.propietario_nombre || vehiculo.nombres_completos?.split(' ')[0]} />
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4">
             <div className="w-14 h-14 bg-white border border-slate-200 p-1 rounded-xl shadow-inner flex-shrink-0">
                <ProtectedImage src={vehiculo?.url_qr} className="w-full h-full object-contain mix-blend-multiply" />
             </div>
             <div>
               <p className="font-bold text-xs text-primary">Identificador Digital</p>
               <p className="text-[10px] text-slate-400 uppercase tracking-tight">QR de acceso verificado</p>
             </div>
          </div>
        </div>
      </div>

      {/* MODAL DE EDICIÓN (Colocado correctamente dentro del componente) */}
      {vehiculo && (
        <VehicleEditModal 
          vehiculo={vehiculo} 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)}
          onUpdateSuccess={() => {
            setIsEditModalOpen(false);
            window.location.reload(); // Recarga para ver los cambios
          }} 
        />
      )}

    </div>
  );
}

// Subcomponente para limpiar el código
function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-50 rounded-lg text-accent">{icon}</div>
      <div>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{label}</p>
        <p className="font-bold text-sm text-primary capitalize">{value || 'N/A'}</p>
      </div>
    </div>
  );
}