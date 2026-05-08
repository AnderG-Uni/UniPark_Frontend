import React, { useState } from 'react';
import { X, Upload, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';

export default function ZoneAddModal({ isOpen, onClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { sede_id: "1", tipo_permitido: "Carro" }
  });

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setImagePreview(null);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      // 🪄 PAYLOAD ACTUALIZADO: Ahora enviamos 'nombre' y 'codigo_zona' por separado
      const payload = {
        sede_id: parseInt(data.sede_id),
        nombre: data.nombre.trim(),
        codigo_zona: data.codigo_zona.trim().toUpperCase(),
        tipo_permitido: data.tipo_permitido,
        capacidad_total: parseInt(data.capacidad_total),
        descripcion: data.descripcion?.trim() || ""
      };

      const responseZona = await api.post('/zonas', payload);
      const nuevaZonaId = responseZona.data?.data?.id || responseZona.data?.id;

      if (selectedFile && nuevaZonaId) {
        const formData = new FormData();
        formData.append('foto', selectedFile); 
        await api.post(`/zonas/${nuevaZonaId}/foto`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      reset();
      setImagePreview(null);
      setSelectedFile(null);
      onSuccess('Parqueadero registrado exitosamente.');

    } catch (err) {
      console.error("Error al crear zona:", err);
      let msg = "Ocurrió un error al intentar registrar el parqueadero.";
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
          <h3 className="text-xl font-bold text-primary">Agregar Parqueadero</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-200 text-sm font-medium">
              <AlertCircle size={18} className="flex-shrink-0" /> <p>{typeof error === 'string' ? error : JSON.stringify(error)}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="flex flex-col items-center mb-2">
              <label className="w-full h-40 border-2 border-dashed border-slate-200 hover:border-accent hover:bg-slate-50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group">
                <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleImageChange} />
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><p className="text-white font-semibold flex items-center gap-2"><Upload size={18} /> Cambiar foto</p></div>
                  </>
                ) : (
                  <div className="text-slate-400 flex flex-col items-center">
                    <ImageIcon size={32} className="mb-2 opacity-50" />
                    <span className="text-sm font-medium">Foto de la zona / mapa</span>
                    <span className="text-[10px] uppercase tracking-wide mt-1 opacity-70">Opcional (PNG, JPG)</span>
                  </div>
                )}
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* 🪄 NUEVO CAMPO: Nombre completo (ocupa ambas columnas) */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre de la Zona *</label>
                <input {...register('nombre', { required: true })} type="text" placeholder="Ej: Parqueadero Principal Múltiple" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-slate-700" />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Código Único *</label>
                <input {...register('codigo_zona', { required: true })} type="text" placeholder="Ej: P2-MC" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-slate-700 uppercase" />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sede *</label>
                <select {...register('sede_id', { required: true })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-slate-700">
                  <option value="1">Sede Principal</option>
                  <option value="2">Sede Norte</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tipo *</label>
                <select {...register('tipo_permitido', { required: true })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-slate-700">
                  <option value="Carro">Carro</option>
                  <option value="Moto">Moto</option>
                  <option value="Bicicleta">Bicicleta</option>
                  <option value="Mixto">Mixto</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Capacidad Máxima *</label>
                <input {...register('capacidad_total', { required: true, min: 1 })} type="number" placeholder="Ej: 156" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-slate-700" />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Descripción</label>
                <textarea {...register('descripcion')} rows="2" placeholder="Detalles de ubicación..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none resize-none text-slate-700"></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
              <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-500 font-semibold hover:bg-slate-100 rounded-xl">Cancelar</button>
              <button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent-hover text-primary font-bold py-2.5 px-6 rounded-xl shadow-soft flex items-center gap-2 disabled:opacity-70">
                {isLoading ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : 'Crear Parqueadero'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}