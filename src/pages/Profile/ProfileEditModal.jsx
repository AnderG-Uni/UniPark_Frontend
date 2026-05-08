import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2, User } from 'lucide-react';
import api from '../../services/api';

export default function ProfileEditModal({ perfil, isOpen, onClose, onUpdateSuccess }) {
  const [isSaving, setIsSaving] = useState(false);

  // Configuramos el formulario
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: perfil
  });

  // Magia para recargar los datos cada vez que se abre el modal
  useEffect(() => {
    if (isOpen && perfil) {
      reset(perfil);
    }
  }, [perfil, isOpen, reset]);

  // Función para enviar los datos al backend (Versión Arreglada)
  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      // 🪄 MAGIA AQUÍ: Creamos un "payload" limpio. 
      // Copiamos SÓLO los campos que están en el formulario de la UI.
      // Esto garantiza que NO enviamos institucion_id: null, igual que en Postman.
      const payload = {
        nombres_completos: data.nombres_completos,
        tipo_documento: data.tipo_documento,
        numero_documento: data.numero_documento,
        telefono: data.telefono,
        codigo_universitario: data.codigo_universitario,
        carrera_dependencia: data.carrera_dependencia
      };

      // Usamos el endpoint relacional que implementamos: PUT /api/v1/personas/:id
      // Y enviamos el payload filtrado.
      const response = await api.put(`/personas/${perfil.id}`, payload);
      
      // Obtenemos el mensaje de éxito directamente de la respuesta del backend
      const mensajeBackend = response.data?.message || "Datos personales actualizados";
      onUpdateSuccess(mensajeBackend); // Le pasamos el mensaje al Toast
      
      onClose();
    } catch (err) {
      console.error("Error al actualizar datos:", err);
      alert("No se pudieron guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };      

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Header del Modal */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 text-accent rounded-xl">
              <User size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary">Editar Mis Datos</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Actualiza tu información personal e institucional</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Contenido (Formulario) */}
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Nombres Completos */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Nombre Completo</label>
              <input 
                {...register('nombres_completos', { required: true })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-all capitalize" 
              />
            </div>

            {/* Documento */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Tipo Doc.</label>
                <select 
                  {...register('tipo_documento')} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-all"
                >
                  <option value="CC">CC</option>
                  <option value="TI">TI</option>
                  <option value="CE">CE</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Número de Documento</label>
                <input 
                  {...register('numero_documento', { required: true })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-accent transition-all" 
                />
              </div>
            </div>

            {/* Teléfono y Código Universitario */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Teléfono</label>
                <input 
                  {...register('telefono')} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-all" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Código Institucional</label>
                <input 
                  {...register('codigo_universitario')} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm uppercase outline-none focus:border-accent transition-all" 
                />
              </div>
            </div>

            {/* Carrera / Dependencia */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Programa / Dependencia</label>
              <input 
                {...register('carrera_dependencia')} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-all capitalize" 
              />
            </div>

            {/* Botón Guardar */}
            <button 
              disabled={isSaving} 
              className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-6 active:scale-95"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Guardar Cambios
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}