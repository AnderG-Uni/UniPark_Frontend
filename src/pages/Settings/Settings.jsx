import React, { useState, useEffect } from 'react';
import { Building2, Map, Sliders, Plus, Edit, Trash2, Loader2, CheckCircle, AlertCircle, X, Save, MapPin, Globe } from 'lucide-react';
import api from '../../services/api';
import { useForm } from 'react-hook-form';
import useAuthStore from '../../context/useAuthStore'; // 🪄 IMPORTAMOS EL ESTADO DE AUTENTICACIÓN

export default function Settings() {
  const { user } = useAuthStore();
  const isAdmin = user?.rol === 'Administrador'; // 🪄 VERIFICAMOS SI ES ADMIN

  // Si no es admin, forzamos a que la pestaña por defecto sea 'general'
  const [activeTab, setActiveTab] = useState(isAdmin ? 'institucion' : 'general');
  
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [institucion, setInstitucion] = useState(null);
  const { register: registerInst, handleSubmit: handleSubmitInst, reset: resetInst } = useForm();

  const [sedes, setSedes] = useState([]);
  const [isSedeModalOpen, setIsSedeModalOpen] = useState(false);
  const [sedeToEdit, setSedeToEdit] = useState(null);
  const { register: registerSede, handleSubmit: handleSubmitSede, reset: resetSede } = useForm();

  useEffect(() => {
    // Solo cargamos datos de institución y sedes si es administrador
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resInst, resSedes] = await Promise.all([
        api.get('/admin/instituciones'),
        api.get('/admin/sedes')
      ]);
      
      const instData = resInst.data?.data?.[0] || resInst.data?.[0] || null;
      setInstitucion(instData);
      if (instData) {
        resetInst({ nombre: instData.nombre, nit: instData.nit, direccion: instData.direccion });
      }

      setSedes(resSedes.data?.data || resSedes.data || []);
    } catch (error) {
      console.error("Error al cargar configuraciones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const onUpdateInstitucion = async (data) => {
    setIsLoading(true);
    try {
      if (institucion?.id) {
        await api.put(`/admin/instituciones/${institucion.id}`, data);
        showToast('Datos actualizados.');
      } else {
        await api.post('/admin/instituciones', data);
        showToast('Institución registrada.');
      }
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al actualizar institución');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSedeModal = (sede = null) => {
    setSedeToEdit(sede);
    if (sede) {
      resetSede({ nombre: sede.nombre, ubicacion: sede.ubicacion });
    } else {
      resetSede({ nombre: '', ubicacion: '' });
    }
    setIsSedeModalOpen(true);
  };

  const onSubmitSede = async (data) => {
    setIsLoading(true);
    try {
      const payload = { ...data, institucion_id: institucion?.id || 1 };
      if (sedeToEdit) {
        await api.put(`/admin/sedes/${sedeToEdit.id}`, payload);
        showToast('Sede actualizada.');
      } else {
        await api.post('/admin/sedes', payload);
        showToast('Sede creada.');
      }
      setIsSedeModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar sede');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSede = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta sede?")) {
      try {
        await api.delete(`/admin/sedes/${id}`);
        showToast('Sede eliminada.');
        fetchData();
      } catch (error) {
        alert("Error al eliminar la sede.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300 h-full w-full max-w-4xl mx-auto">
      
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-[150] bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-8">
          <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center flex-shrink-0"><CheckCircle size={18} strokeWidth={3} /></div>
          <p className="font-semibold text-sm">{toastMessage}</p>
        </div>
      )}

      {/* MENÚ DE PESTAÑAS */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl w-full md:w-fit overflow-x-auto no-scrollbar flex-shrink-0">
        
        {/* 🪄 SOLO MOSTRAMOS ESTAS DOS PESTAÑAS SI ES ADMINISTRADOR */}
        {isAdmin && (
          <>
            <button onClick={() => setActiveTab('institucion')} className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'institucion' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Building2 size={16} /> Universidad
            </button>
            <button onClick={() => setActiveTab('sedes')} className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'sedes' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Map size={16} /> Sedes
            </button>
          </>
        )}

        <button onClick={() => setActiveTab('general')} className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'general' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <Sliders size={16} /> Ajustes Generales
        </button>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1">
        
        {/* PESTAÑA: INFORMACIÓN UNIVERSIDAD (SOLO ADMIN) */}
        {isAdmin && activeTab === 'institucion' && (
          <div className="p-5 sm:p-8 animate-in fade-in">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Building2 size={20} /></div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Datos de la Institución</h3>
                  <p className="text-xs text-slate-500">Información principal de la entidad educativa.</p>
                </div>
              </div>

              <form onSubmit={handleSubmitInst(onUpdateInstitucion)} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre de la Institución *</label>
                  <input {...registerInst('nombre', { required: true })} type="text" placeholder="Ej: Universidad Católica" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-accent text-slate-800 outline-none transition-all font-semibold text-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">NIT / Identificación *</label>
                    <input {...registerInst('nit', { required: true })} type="text" placeholder="Ej: 890.000.000-1" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-accent text-slate-700 outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Dirección Principal *</label>
                    <input {...registerInst('direccion', { required: true })} type="text" placeholder="Ej: Calle 1 #2-3" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-accent text-slate-700 outline-none transition-all text-sm" />
                  </div>
                </div>
                <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end">
                  <button type="submit" disabled={isLoading} className="bg-primary hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-lg shadow-soft transition-all flex items-center gap-2 text-sm disabled:opacity-70">
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PESTAÑA: SEDES (SOLO ADMIN) */}
        {isAdmin && activeTab === 'sedes' && (
          <div className="p-5 sm:p-8 flex flex-col h-full animate-in fade-in">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Map size={20} /></div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Gestión de Sedes</h3>
                  <p className="text-xs text-slate-500">Administra las diferentes ubicaciones físicas.</p>
                </div>
              </div>
              <button onClick={() => handleOpenSedeModal()} className="bg-accent hover:bg-accent-hover text-primary font-bold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center gap-2 whitespace-nowrap w-fit text-sm">
                <Plus size={16} /> Nueva Sede
              </button>
            </div>

            {sedes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl py-10 bg-slate-50/50">
                <Map size={40} className="mb-3 opacity-30" />
                <p className="text-base font-medium">No hay sedes registradas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sedes.map((sede) => (
                  <div key={sede.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative group">
                    <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center mb-3"><Building2 size={16} /></div>
                    <h4 className="font-bold text-slate-800 text-base">{sede.nombre}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1 flex items-start gap-1"><MapPin size={12} className="mt-0.5 flex-shrink-0" /> {sede.ubicacion}</p>
                    
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenSedeModal(sede)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"><Edit size={14} /></button>
                      <button onClick={() => handleDeleteSede(sede.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: AJUSTES GENERALES (PARA TODOS) */}
        {activeTab === 'general' && (
          <div className="p-5 sm:p-8 animate-in fade-in">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><Sliders size={20} /></div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Ajustes Generales</h3>
                  <p className="text-xs text-slate-500">Configuraciones de comportamiento de la aplicación.</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                
                {/* 🪄 SELECTOR DE IDIOMA (Solo visual, no hace nada) */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-400"><Globe size={18} /></div>
                    <div>
                      <h4 className="font-bold text-slate-700 text-sm">Idioma del Sistema</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Selecciona el idioma para toda la interfaz.</p>
                    </div>
                  </div>
                  <select 
                    defaultValue="es"
                    className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-semibold focus:border-accent outline-none shadow-sm cursor-pointer"
                  >
                    <option value="es">Español</option>
                    <option value="en">Inglés</option>
                  </select>
                </div>

                {isAdmin && (
                  <>
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl mt-4">
                      <div>
                        <h4 className="font-bold text-slate-700 text-sm">Notificaciones por Correo</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Recibir alertas diarias sobre vehículos en pernocta.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <div>
                        <h4 className="font-bold text-slate-700 text-sm">Modo Estricto de Zonas</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Bloquear acceso si el vehículo no coincide con la zona.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL PARA SEDES (SOLO ADMIN) */}
      {isAdmin && isSedeModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          {/* ... Mismo código del modal que ya tenías ... */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col relative animate-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">{sedeToEdit ? 'Editar Sede' : 'Nueva Sede'}</h3>
              <button onClick={() => setIsSedeModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-full"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmitSede(onSubmitSede)} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre de la Sede *</label>
                <input {...registerSede('nombre', { required: true })} type="text" placeholder="Ej: Sede Norte" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-accent text-slate-800 outline-none transition-all font-semibold text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Ubicación / Dirección *</label>
                <input {...registerSede('ubicacion', { required: true })} type="text" placeholder="Ej: Barrio Norte" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-accent text-slate-700 outline-none transition-all text-sm" />
              </div>
              <div className="mt-2 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsSedeModalOpen(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg text-sm">Cancelar</button>
                <button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent-hover text-primary font-bold py-2 px-5 rounded-lg shadow-soft transition-all flex items-center gap-2 text-sm">
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}