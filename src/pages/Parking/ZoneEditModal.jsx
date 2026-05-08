import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';

export default function ZoneEditModal({ isOpen, onClose, onSuccess, zona }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register, handleSubmit, reset } = useForm();

  // Precargar datos cuando se abre el modal
  useEffect(() => {
    if (zona && isOpen) {
      reset({
        sede_id: zona.sede_id?.toString() || "1",
        nombre: zona.nombre || '',
        codigo_zona: zona.codigo_zona || '',
        tipo_permitido: zona.tipo_permitido || 'Carro',
        capacidad_total: zona.capacidad_total || '',
        descripcion: zona.descripcion || ''
      });
    }
  }, [zona, isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        sede_id: parseInt(data.sede_id),
        nombre: data.nombre.trim(),
        codigo_zona: data.codigo_zona.trim().toUpperCase(),
        tipo_permitido: data.tipo_permitido,
        capacidad_total: parseInt(data.capacidad_total),
        descripcion: data.descripcion?.trim() || ""
      };

      await api.put(`/zonas/${zona.id}`, payload);
      
      onSuccess('Parqueadero actualizado exitosamente.');
    } catch (err) {
      console.error("Error al editar zona:", err);
      let msg = "Ocurrió un error al intentar actualizar.";
      if (err.response?.data?.message) msg = err.response.data.message;
      if (err.response?.data?.errors) msg = err.response.data.errors[0] || msg;
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg flex flex-col relative border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold text-primary">Editar Parqueadero</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-full"><X size={20} /></button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-200 text-sm">
              <AlertCircle size={18} className="flex-shrink-0" /> <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre de la Zona *</label>
                <input {...register('nombre', { required: true })} type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent text-slate-700" />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Código Único *</label>
                <input {...register('codigo_zona', { required: true })} type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent text-slate-700 uppercase" />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sede *</label>
                <select {...register('sede_id', { required: true })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent text-slate-700">
                  <option value="1">Sede Principal</option>
                  <option value="2">Sede Norte</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tipo *</label>
                <select {...register('tipo_permitido', { required: true })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent text-slate-700">
                  <option value="Carro">Carro</option>
                  <option value="Moto">Moto</option>
                  <option value="Bicicleta">Bicicleta</option>
                  <option value="Mixto">Mixto</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Capacidad Máxima *</label>
                <input {...register('capacidad_total', { required: true, min: 1 })} type="number" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent text-slate-700" />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Descripción</label>
                <textarea {...register('descripcion')} rows="2" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent resize-none text-slate-700"></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
              <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-500 font-semibold hover:bg-slate-100 rounded-xl">Cancelar</button>
              <button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent-hover text-primary font-bold py-2.5 px-6 rounded-xl shadow-soft flex items-center gap-2">
                {isLoading ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : 'Actualizar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}