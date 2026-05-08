import React, { useState } from 'react';
import { X, Upload, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';

export default function VehicleAddModal({ isOpen, onClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      tipo: 'Moto'
    }
  });

  if (!isOpen) return null;

  // Manejar la selección de la imagen y crear una previsualización
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
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
      // PASO 1: Crear el vehículo (JSON)
      const payload = {
        placa: data.placa.trim().toUpperCase(),
        tipo: data.tipo,
        marca: data.marca.trim(),
        modelo: data.modelo.trim(),
        color: data.color.trim()
      };

      const responseVehiculo = await api.post('/vehiculos', payload);
      const nuevoVehiculoId = responseVehiculo.data?.data?.id || responseVehiculo.data?.id;

      // PASO 2: Si hay imagen, la subimos al endpoint de la foto
      if (selectedFile && nuevoVehiculoId) {
        const formData = new FormData();
        // Asegúrate de que tu backend espera el campo con el nombre 'foto' o 'archivo'
        formData.append('foto', selectedFile); 

        await api.post(`/vehiculos/${nuevoVehiculoId}/foto`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // Limpiamos el formulario y cerramos
      reset();
      setImagePreview(null);
      setSelectedFile(null);
      onSuccess('Vehículo registrado exitosamente.');

    } catch (err) {
      console.error("Error al crear vehículo:", err);
      const backendMessage = err.response?.data?.message || "Ocurrió un error al intentar registrar el vehículo.";
      setError(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg flex flex-col relative border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold text-primary">Añadir Nuevo Vehículo</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-200 text-sm font-medium">
              <AlertCircle size={18} className="flex-shrink-0" /> <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            
            {/* Foto del vehículo (Preview interactivo) */}
            <div className="flex flex-col items-center mb-2">
              <label className="w-full h-40 border-2 border-dashed border-slate-200 hover:border-accent hover:bg-slate-50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group">
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain mix-blend-multiply p-2" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <p className="text-white font-semibold flex items-center gap-2"><Upload size={18} /> Cambiar foto</p>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-400 flex flex-col items-center">
                    <ImageIcon size={32} className="mb-2 opacity-50" />
                    <span className="text-sm font-medium">Sube una foto del vehículo</span>
                    <span className="text-[10px] uppercase tracking-wide mt-1 opacity-70">Opcional (PNG, JPG)</span>
                  </div>
                )}
              </label>
            </div>

            {/* Grid de campos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Placa *</label>
                <input 
                  {...register('placa', { required: true, minLength: 5, maxLength: 6 })}
                  type="text" 
                  placeholder="Ej: ABC123"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all uppercase font-bold text-slate-700"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tipo *</label>
                <select 
                  {...register('tipo', { required: true })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-slate-700"
                >
                  <option value="Moto">Moto</option>
                  <option value="Carro">Carro</option>
                  <option value="Bicicleta">Bicicleta</option>
                  <option value="Patineta">Patineta Eléctrica</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Marca</label>
                <input 
                  {...register('marca', { required: true })}
                  type="text" 
                  placeholder="Ej: Yamaha"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all capitalize"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Modelo (Año)</label>
                <input 
                  {...register('modelo', { required: true })}
                  type="text" 
                  placeholder="Ej: 2024"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Color</label>
                <input 
                  {...register('color', { required: true })}
                  type="text" 
                  placeholder="Ej: Negro Mate"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all capitalize"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={onClose}
                className="px-5 py-2.5 text-slate-500 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-accent hover:bg-accent-hover text-primary font-bold py-2.5 px-6 rounded-xl shadow-soft hover:shadow-hover transition-all flex items-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
              >
                {isLoading ? <><Loader2 size={18} className="animate-spin" /> Registrando...</> : 'Guardar Vehículo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}