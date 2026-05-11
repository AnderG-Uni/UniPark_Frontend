import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Loader2, AlertCircle, Eye, Edit, Trash2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../context/useAuthStore';
import ZoneAddModal from './ZoneAddModal';
import ZoneEditModal from './ZoneEditModal';

export default function Parking() {
  const { user } = useAuthStore();
  const [zonas, setZonas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [zoneToEdit, setZoneToEdit] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const isAdmin = user?.rol === 'Administrador';

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [resZonas, resSedes] = await Promise.all([
        api.get('/zonas'),
        api.get('/admin/sedes')
      ]);
      setZonas(resZonas.data?.data || resZonas.data || []);
      setSedes(resSedes.data?.data || resSedes.data || []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("Ocurrió un error al intentar obtener los datos del parqueadero.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (zona) => {
    setZoneToEdit(zona);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este parqueadero?")) {
      try {
        await api.delete(`/zonas/${id}`);
        setToastMessage("Parqueadero eliminado.");
        fetchData();
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err) {
        alert("Error al eliminar el parqueadero.");
      }
    }
  };

  // 🪄 CÁLCULOS CORREGIDOS: Leyendo 'cupos_ocupados' tal como viene del backend
  const totalBahias = zonas.reduce((acc, zona) => acc + (Number(zona.capacidad_total) || 0), 0);
  const bahiasOcupadas = zonas.reduce((acc, zona) => acc + (Number(zona.cupos_ocupados) || Number(zona.ocupadas) || 0), 0); 
  const bahiasDisponibles = totalBahias - bahiasOcupadas;

  const getNombreSede = (sedeId) => {
    const sede = sedes.find(s => s.id === sedeId);
    return sede ? sede.nombre : `Sede ${sedeId}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-primary gap-4">
        <Loader2 size={40} className="animate-spin text-accent" />
        <p className="font-medium text-slate-500">Cargando parqueaderos...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300 h-full w-full relative">
      
      {/* Modales */}
      <ZoneAddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        sedes={sedes}
        onSuccess={(mensaje) => {
          setIsAddModalOpen(false);
          fetchData(); 
          setToastMessage(mensaje);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      <ZoneEditModal 
        isOpen={isEditModalOpen} 
        zona={zoneToEdit}
        sedes={sedes}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={(mensaje) => {
          setIsEditModalOpen(false);
          fetchData(); 
          setToastMessage(mensaje);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-[150] bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="w-6 h-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center flex-shrink-0"><Check size={14} strokeWidth={3} /></div>
          <p className="font-semibold text-sm">{toastMessage}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-200">
          <AlertCircle size={20} /> <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Tarjetas Matemáticas */}
      {!error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><MapPin size={24} /></div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Total de bahías</p>
              <p className="text-2xl font-black text-primary leading-none">{totalBahias}</p>
            </div>
          </div>
          <div className="bg-surface p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-accent/10 text-accent-hover rounded-lg"><MapPin size={24} /></div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Bahías ocupadas</p>
              <p className="text-2xl font-black text-primary leading-none">{bahiasOcupadas}</p>
            </div>
          </div>
          <div className="bg-surface p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><MapPin size={24} /></div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Bahías disponibles</p>
              <p className="text-2xl font-black text-primary leading-none">{bahiasDisponibles}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      {!error && (
        <div className="bg-surface rounded-xl shadow-sm border border-slate-100 p-5 flex-1 flex flex-col min-h-[400px]">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-bold text-slate-800">Listado de Parqueaderos</h3>
            {isAdmin && (
              <button onClick={() => setIsAddModalOpen(true)} className="bg-accent hover:bg-accent-hover text-primary font-bold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center gap-2 text-sm">
                <Plus size={16} /> Agregar Zona
              </button>
            )}
          </div>

          {zonas.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
              <MapPin size={40} className="mb-3 opacity-20" />
              <p className="text-base font-medium">No hay zonas registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1 w-full max-h-[550px] pr-1">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead className="sticky top-0 z-10 bg-white shadow-sm">
                  <tr className="border-b border-slate-100 text-slate-500 bg-slate-50/90 backdrop-blur-md">
                    {/* 🪄 NUEVAS COLUMNAS (Código primero, Ocupación cambiada) */}
                    <th className="px-3 py-2 font-bold text-[10px] uppercase tracking-wider rounded-tl-lg w-24">Código</th>
                    <th className="px-3 py-2 font-bold text-[10px] uppercase tracking-wider">Zona</th>
                    <th className="px-3 py-2 font-bold text-[10px] uppercase tracking-wider">Sede</th>
                    <th className="px-3 py-2 font-bold text-[10px] uppercase tracking-wider">Tipo</th>
                    <th className="px-3 py-2 font-bold text-[10px] uppercase tracking-wider text-center">Capacidad</th>
                    <th className="px-3 py-2 font-bold text-[10px] uppercase tracking-wider text-center">Ocupación</th>
                    {isAdmin && <th className="px-3 py-2 font-bold text-[10px] uppercase tracking-wider text-center rounded-tr-lg">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  {zonas.map((zona) => (
                    <tr key={zona.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                      {/* 🪄 CÓDIGO */}
                      <td className="px-3 py-2">
                        <span className="font-black text-slate-800 text-sm tracking-widest">{zona.codigo_zona}</span>
                      </td>
                      
                      {/* 🪄 ZONA (Sin el ID ni el código) */}
                      <td className="px-3 py-2">
                        <span className="font-bold text-slate-700 text-sm leading-tight">{zona.nombre || 'Parqueadero'}</span>
                      </td>
                      
                      {/* SEDE */}
                      <td className="px-3 py-2 font-bold text-slate-600 uppercase text-[10px] tracking-wider">
                        {getNombreSede(zona.sede_id)}
                      </td>
                      
                      {/* TIPO */}
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase border border-slate-200/50">
                          {zona.tipo_permitido}
                        </span>
                      </td>
                      
                      {/* CAPACIDAD */}
                      <td className="px-3 py-2 text-center font-bold text-slate-700 text-base">{zona.capacidad_total}</td>
                      
                      {/* 🪄 OCUPACIÓN (Corregida la variable) */}
                      <td className="px-3 py-2 text-center font-bold text-accent text-base">
                        {zona.cupos_ocupados || zona.ocupadas || 0}
                      </td>
                      
                      {/* ACCIONES */}
                      {isAdmin && (
                        <td className="px-3 py-2">
                          <div className="flex justify-center gap-1.5">
                            <Link to={`/parking/${zona.id}`} className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors border border-transparent hover:border-blue-100" title="Ver Detalles">
                              <Eye size={14} />
                            </Link>
                            <button onClick={() => handleEdit(zona)} className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded transition-colors border border-transparent hover:border-slate-200" title="Editar">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDelete(zona.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors border border-transparent hover:border-red-100" title="Eliminar">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}