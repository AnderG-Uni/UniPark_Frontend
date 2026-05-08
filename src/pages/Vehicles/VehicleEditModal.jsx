import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Upload, Loader2, Info, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';

export default function VehicleEditModal({ vehiculo, isOpen, onClose, onUpdateSuccess }) {
  const [activeTab, setActiveTab] = useState('datos'); 
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // 1. Extraemos "reset" para poder limpiar/recargar el formulario
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: vehiculo
  });

  // 🪄 MAGIA PARA RECARGAR DATOS: 
  // Cada vez que se abre el modal o cambia el vehículo, forzamos al formulario a tomar los nuevos datos
  useEffect(() => {
    if (isOpen && vehiculo) {
      reset(vehiculo);
      // Limpiamos la foto previa si existía
      setSelectedFile(null);
      setPreviewUrl(null);
      setActiveTab('datos'); // Volvemos a la pestaña principal
    }
  }, [vehiculo, isOpen, reset]);

  // 2. Función para actualizar Datos
  const onSubmitDatos = async (data) => {
    setIsSaving(true);
    try {
      const response = await api.put(`/vehiculos/${vehiculo.id}`, data);
      
      // Enviamos el mensaje del backend al padre
      const mensajeBackend = response.data.message || "Vehículo actualizado";
      onUpdateSuccess(mensajeBackend); 
      
      onClose();
    } catch (err) {
      console.error("Error al actualizar datos:", err);
      alert("No se pudieron guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Función para actualizar Foto
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmitFoto = async () => {
    if (!selectedFile) return;
    setIsSaving(true);
    const formData = new FormData();
    formData.append('foto', selectedFile);

    try {
      const response = await api.post(`/vehiculos/${vehiculo.id}/foto`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const mensajeBackend = response.data.message || "Foto actualizada";
      onUpdateSuccess(mensajeBackend);
      
      onClose();
    } catch (err) {
      console.error("Error al subir foto:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-primary">Editar Vehículo</h3>
            <p className="text-xs text-slate-500 uppercase font-semibold mt-1">Placa: {vehiculo.placa}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-slate-100 bg-white">
          <button onClick={() => setActiveTab('datos')} className={`flex-1 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'datos' ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-slate-400 hover:text-slate-600'}`}>
            <Info size={16} /> Información
          </button>
          <button onClick={() => setActiveTab('foto')} className={`flex-1 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'foto' ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-slate-400 hover:text-slate-600'}`}>
            <ImageIcon size={16} /> Fotografía
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'datos' && (
            <form onSubmit={handleSubmit(onSubmitDatos)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Tipo</label>
                  <select {...register('tipo')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-all">
                    <option value="Carro">Carro</option>
                    <option value="Moto">Moto</option>
                    <option value="Bicicleta">Bicicleta</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Placa</label>
                  <input {...register('placa', { required: true })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold uppercase outline-none focus:border-accent transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Marca</label>
                  <input {...register('marca')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Modelo (Año)</label>
                  <input {...register('modelo')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-all" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Color</label>
                <input {...register('color')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-all" />
              </div>

              <button disabled={isSaving} className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95">
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Guardar Cambios
              </button>
            </form>
          )}

          {activeTab === 'foto' && (
            <div className="flex flex-col items-center">
              <div className="w-full aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group cursor-pointer hover:border-accent transition-colors">
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <>
                    <Upload className="text-slate-300 group-hover:text-accent transition-colors" size={48} />
                    <p className="text-xs text-slate-400 mt-2 font-medium">Haz clic para seleccionar una foto</p>
                  </>
                )}
                <input type="file" onChange={handleFileSelect} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
              </div>

              <button onClick={onSubmitFoto} disabled={!selectedFile || isSaving} className="w-full bg-accent text-primary font-black py-3.5 rounded-2xl shadow-lg hover:shadow-accent/20 transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-50 disabled:grayscale">
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                Actualizar Imagen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}