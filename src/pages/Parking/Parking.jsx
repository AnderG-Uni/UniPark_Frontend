import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Loader2, AlertCircle, Eye, Edit, Trash2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../context/useAuthStore';
import ZoneAddModal from './ZoneAddModal';
import ZoneEditModal from './ZoneEditModal'; // 🪄 NUEVO

export default function Parking() {
  const { user } = useAuthStore();
  const [zonas, setZonas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [zoneToEdit, setZoneToEdit] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const isAdmin = user?.rol === 'Administrador';

  const fetchZonas = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/zonas');
      setZonas(response.data.data || response.data || []);
    } catch (err) {
      console.error("Error al cargar zonas:", err);
      setError("Ocurrió un error al intentar obtener los parqueaderos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchZonas();
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
        fetchZonas();
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err) {
        alert("Error al eliminar el parqueadero.");
      }
    }
  };

  // 🪄 CÁLCULO ACTUALIZADO CON LAS NUEVAS VARIABLES
  const totalBahias = zonas.reduce((acc, zona) => acc + (Number(zona.capacidad_total) || 0), 0);
  const bahiasOcupadas = zonas.reduce((acc, zona) => acc + (Number(zona.ocupadas) || 0), 0); 
  const bahiasDisponibles = totalBahias - bahiasOcupadas;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-primary gap-4">
        <Loader2 size={40} className="animate-spin text-accent" />
        <p className="font-medium text-slate-500">Cargando parqueaderos...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 h-full w-full relative">
      
      {/* Modal Agregar */}
      <ZoneAddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(mensaje) => {
          setIsAddModalOpen(false);
          fetchZonas(); 
          setToastMessage(mensaje);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* Modal Editar */}
      <ZoneEditModal 
        isOpen={isEditModalOpen} 
        zona={zoneToEdit}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={(mensaje) => {
          setIsEditModalOpen(false);
          fetchZonas(); 
          setToastMessage(mensaje);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-[150] bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="w-8 h-8 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center flex-shrink-0"><Check size={18} strokeWidth={3} /></div>
          <p className="font-semibold text-sm">{toastMessage}</p>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-primary">Parqueadero</h2>
          <p className="text-slate-500 text-sm mt-1">Administra los espacios disponibles, ocupados y zonas.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setIsAddModalOpen(true)} className="bg-accent hover:bg-accent-hover text-primary font-bold py-2.5 px-5 rounded-lg shadow-soft transition-all flex items-center gap-2">
            <Plus size={20} /> Agregar
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-200">
          <AlertCircle size={20} /> <p>{error}</p>
        </div>
      )}

      {/* Tarjetas Matemáticas */}
      {!error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><MapPin size={28} /></div>
            <div><p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Total de bahías</p><p className="text-3xl font-black text-primary">{totalBahias}</p></div>
          </div>
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 bg-accent/10 text-accent-hover rounded-xl"><MapPin size={28} /></div>
            <div><p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Bahías ocupadas</p><p className="text-3xl font-black text-primary">{bahiasOcupadas}</p></div>
          </div>
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><MapPin size={28} /></div>
            <div><p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Bahías disponibles</p><p className="text-3xl font-black text-primary">{bahiasDisponibles}</p></div>
          </div>
        </div>
      )}

      {/* Tabla */}
      {!error && (
        <div className="bg-surface rounded-2xl shadow-sm border border-slate-100 p-6 flex-1 flex flex-col min-h-[400px]">
          <h3 className="text-lg font-semibold text-primary mb-4">Listado de Parqueaderos</h3>

          {zonas.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12 border-2 border-dashed border-slate-100 rounded-xl">
              <MapPin size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">No hay zonas registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1 w-full max-h-[500px]">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="sticky top-0 z-10 bg-white shadow-sm">
                  <tr className="border-b border-slate-100 text-primary bg-slate-50/90 backdrop-blur-md">
                    <th className="p-4 font-semibold text-sm rounded-tl-lg">ID / Zona</th>
                    <th className="p-4 font-semibold text-sm">Sede</th>
                    <th className="p-4 font-semibold text-sm">Tipo</th>
                    <th className="p-4 font-semibold text-sm text-center">Capacidad</th>
                    <th className="p-4 font-semibold text-sm text-center">Ocupadas</th>
                    {isAdmin && <th className="p-4 font-semibold text-sm text-center rounded-tr-lg">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="text-slate-600 text-sm">
                  {zonas.map((zona) => (
                    <tr key={zona.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{zona.codigo_zona}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">ID: {zona.id}</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-500">Sede {zona.sede_id}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold uppercase">{zona.tipo_permitido}</span>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-700 text-lg">{zona.capacidad_total}</td>
                      <td className="p-4 text-center font-bold text-accent text-lg">{zona.ocupadas || 0}</td>
                      
                      {isAdmin && (
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            {/* 🪄 BOTÓN VER: Lleva a otra pestaña (/parking/ID) */}
                            <Link to={`/parking/${zona.id}`} className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100" title="Ver Detalles">
                              <Eye size={16} />
                            </Link>
                            
                            {/* 🪄 BOTÓN EDITAR: Abre el nuevo modal */}
                            <button onClick={() => handleEdit(zona)} className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors border border-slate-200" title="Editar">
                              <Edit size={16} />
                            </button>
                            
                            <button onClick={() => handleDelete(zona.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100" title="Eliminar">
                              <Trash2 size={16} />
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