import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, X, Download, Loader2, AlertCircle, Car as CarIcon, Check, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import api from '../../services/api';
import ProtectedImage from '../../components/common/ProtectedImage';
import VehicleEditModal from './VehicleEditModal';
import useAuthStore from '../../context/useAuthStore';
import VehicleAddModal from './VehicleAddModal';


export default function Vehicles() {
  const { user } = useAuthStore();
  const [vehiculos, setVehiculos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const context = useOutletContext();
  const setDynamicBreadcrumb = context?.setDynamicBreadcrumb;

  const isAdmin = user?.rol === 'Administrador';

  // Estados para el Modal del QR
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Estados para el Modal de Añadir Vehículo
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // ESTADOS PARA EL MODAL DE EDICIÓN
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // ESTADOS PARA PAGINACIÓN (SOLO ADMIN)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchVehiculos = async () => {
    try {
      setIsLoading(true);
      
      // El frontend decide qué ruta consumir basado en su rol
      const endpoint = isAdmin ? '/vehiculos' : '/vehiculos/mis-vehiculos';
      
      const response = await api.get(endpoint);
      setVehiculos(response.data.data || response.data || []);
    } catch (err) {
      console.error("Error al cargar vehículos:", err);
      setError("Ocurrió un error al intentar obtener los vehículos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehiculos();
    if (setDynamicBreadcrumb) setDynamicBreadcrumb(null);
  }, [setDynamicBreadcrumb]);

  // Funciones del QR
  const handleOpenQR = (vehiculo) => {
    setSelectedVehicle(vehiculo);
    setQrModalOpen(true);
  };

  const handleDownloadQR = async () => {
    if (!selectedVehicle?.url_qr) return;
    try {
      const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '');
      const path = selectedVehicle.url_qr;
      const fullUrl = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
      const token = localStorage.getItem('access_token');

      const response = await axios.get(fullUrl, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });

      const blobUrl = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${selectedVehicle.placa.toUpperCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error al descargar el QR:", error);
      alert("Hubo un problema al descargar el código QR.");
    }
  };

  const handleEdit = (vehiculo) => {
    setVehicleToEdit(vehiculo);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    console.log("Eliminar vehículo", id);
    // Pronto haremos la alerta de confirmación
  };

  // 🪄 LÓGICA DE PAGINACIÓN
  const totalPages = Math.ceil(vehiculos.length / itemsPerPage);
  
  const currentVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return vehiculos.slice(start, start + itemsPerPage);
  }, [vehiculos, currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-primary gap-4">
        <Loader2 size={40} className="animate-spin text-accent" />
        <p className="font-medium text-slate-500">Cargando vehículos...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 relative h-full w-full">
      
      {/* ================= MODAL DEL QR ================= */}
      {qrModalOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface p-8 rounded-2xl shadow-2xl max-w-sm w-full flex flex-col items-center relative border border-slate-100 animate-in zoom-in-95 duration-200">
            <button onClick={() => setQrModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold text-primary mb-1">Tu Código QR</h3>
            <p className="text-slate-500 text-sm mb-6 uppercase font-medium tracking-wider">
              {selectedVehicle.marca} • {selectedVehicle.placa}
            </p>
            <div className="w-56 h-56 bg-white border-2 border-slate-100 shadow-inner rounded-xl p-3 mb-8 flex items-center justify-center">
              <ProtectedImage src={selectedVehicle.url_qr} alt={`QR de ${selectedVehicle.placa}`} className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <button onClick={handleDownloadQR} className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3 rounded-xl shadow-soft hover:shadow-hover transition-all flex justify-center items-center gap-2">
              <Download size={20} /> Guardar Imagen
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL DE EDICIÓN ================= */}
      {vehicleToEdit && (
        <VehicleEditModal 
          vehiculo={vehicleToEdit} 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)}
          onUpdateSuccess={(mensajeDelBackend) => {
            setIsEditModalOpen(false);
            fetchVehiculos(); 
            setToastMessage(mensajeDelBackend);
            setTimeout(() => setToastMessage(null), 3000);
          }} 
        />
      )}

      {/* ================= MODAL DE CREACIÓN ================= */}
        <VehicleAddModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={(mensaje) => {
            setIsAddModalOpen(false);
            fetchVehiculos(); 
            setToastMessage(mensaje);
            setTimeout(() => setToastMessage(null), 3000);
          }}
        />

      {/* ================= TOAST NOTIFICATION  ================= */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-[150] bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-8 fade-in duration-300 border border-slate-700">
          <div className="w-8 h-8 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center flex-shrink-0">
            <Check size={18} strokeWidth={3} />
          </div>
          <p className="font-semibold text-sm">{toastMessage}</p>
        </div>
      )}

      {/* ENCABEZADO (Cambia el título según el rol) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-primary">
            {isAdmin ? 'Vehículos' : 'Mis Vehículos'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {isAdmin 
              ? 'Listado global de vehículos registrados en el sistema.' 
              : 'Vehículos de ingresos y transferencias de usuarios y administradores'}
          </p>
        </div>
        
        {/* Solo mostramos botón añadir a usuarios normales o si el Admin necesita crear uno (opcional) */}
        {!isAdmin && (
          <button onClick={() => setIsAddModalOpen(true)} className="bg-accent hover:bg-accent-hover text-primary font-bold py-2.5 px-5 rounded-lg shadow-soft hover:shadow-hover transition-all flex items-center gap-2 whitespace-nowrap">
            <Plus size={20} /> Añadir
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-200">
          <AlertCircle size={20} /> <p>{error}</p>
        </div>
      )}

      {!error && vehiculos.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-surface rounded-2xl border border-slate-100 border-dashed py-12">
          <CarIcon size={64} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">{isAdmin ? 'No hay vehículos en el sistema' : 'No tienes vehículos registrados'}</p>
          {!isAdmin && <p className="text-sm mt-1">Haz clic en "Añadir" para registrar tu primer vehículo.</p>}
        </div>
      )}

      {/* ================= VISTA CONDICIONAL: ADMIN VS USUARIO ================= */}
      {!error && vehiculos.length > 0 && (
        <>
          {isAdmin ? (
            /* 🪄 VISTA DE ADMINISTRADOR: TABLA CON PAGINACIÓN */
            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col w-full h-full min-h-[400px]">
              
              <div className="overflow-x-auto flex-1 w-full">
                
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead className="sticky top-0 z-10 bg-white shadow-sm">
                      <tr className="border-b border-slate-100 text-primary bg-slate-50/90 backdrop-blur-md">
                        <th className="p-4 font-semibold text-sm rounded-tl-lg">Placa</th>
                        <th className="p-4 font-semibold text-sm">Propietario / Responsable</th>
                        <th className="p-4 font-semibold text-sm">Tipo</th>
                        <th className="p-4 font-semibold text-sm">Marca</th>
                        <th className="p-4 font-semibold text-sm">Color</th>
                        {/* 🪄 NUEVA COLUMNA: Fecha Registro */}
                        <th className="p-4 font-semibold text-sm">Fecha Registro</th>
                        <th className="p-4 font-semibold text-sm text-center rounded-tr-lg">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600 text-sm">
                      {currentVehicles.map((v) => (
                        <tr key={v.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors">
                          <td className="p-4">
                            <span className="font-black text-accent uppercase text-base">{v.placa}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              {/* 🪄 CORRECCIÓN: Usamos nombres_completos */}
                              <span className="font-bold text-slate-700 capitalize">{v.nombres_completos || '---'}</span>
                              
                              {/* 🪄 CORRECCIÓN: Usamos numero_documento y codigo_universitario */}
                              <span className="text-[11px] text-slate-400 tracking-wide mt-0.5">
                                Doc: {v.numero_documento || '---'} 
                                {v.codigo_universitario && v.codigo_universitario !== 'N/A' && (
                                  <span className="ml-1 border-l border-slate-300 pl-1">Cód: {v.codigo_universitario}</span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 font-medium capitalize">{v.tipo}</td>
                          <td className="p-4 capitalize">{v.marca || '---'}</td>
                          <td className="p-4 capitalize">{v.color || '---'}</td>
                          
                          {/* 🪄 NUEVO DATO: Fecha de registro formateada */}
                          <td className="p-4 text-slate-500 font-medium">
                            {v.fecha_registro 
                              ? new Date(v.fecha_registro).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }) 
                              : '---'}
                          </td>
                          
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <Link to={`/vehicles/${v.id}`} className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100" title="Ver Detalles">
                                <Eye size={16} />
                              </Link>
                              <button onClick={() => handleDelete(v.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100" title="Eliminar">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

              </div>

              {/* PAGINACIÓN */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-4 mt-4 gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>Mostrar</span>
                  <select 
                    className="border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-accent text-slate-700"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Volver a la pág 1 al cambiar límite
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>registros</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500">
                    Página <span className="font-semibold text-slate-700">{currentPage}</span> de <span className="font-semibold text-slate-700">{totalPages}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>

            </div>

          ) : (
            /* 🪄 VISTA DE USUARIO NORMAL: TARJETAS CON IMAGEN Y QR */
            <div className="flex flex-col gap-4">
              {vehiculos.map((v) => (
                  <div key={v.id} className="bg-surface rounded-xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col xl:flex-row items-center gap-6">
                  
                  <Link to={`/vehicles/${v.id}`} className="w-full xl:w-40 h-32 xl:h-24 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden p-2 flex-shrink-0 border border-slate-100 hover:border-accent transition-all group">
                    <ProtectedImage src={v.url_foto} alt={v.tipo} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300" />
                  </Link>

                  {/* 🪄 CAMBIO VISUAL: flex-wrap para que los nuevos datos se acomoden bien si no hay espacio */}
                  <div className="flex-1 flex flex-wrap md:flex-nowrap justify-between items-center gap-4 lg:gap-6 w-full px-2">
                    
                    {/* CÓDIGO QR */}
                    <div className="flex flex-col items-center sm:items-start min-w-[60px]">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Código QR</span>
                      <div onClick={() => handleOpenQR(v)} className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center p-1 cursor-pointer hover:border-accent hover:border-2 hover:scale-105 transition-all shadow-sm">
                        {v.url_qr ? <ProtectedImage src={v.url_qr} className="w-full h-full object-contain mix-blend-multiply" /> : <span className="text-[10px] text-slate-400">N/A</span>}
                      </div>
                    </div>

                    <div className="flex flex-col min-w-[60px]">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Tipo</span>
                      <span className="font-semibold text-slate-700 capitalize">{v.tipo}</span>
                    </div>
                    
                    <div className="flex flex-col min-w-[70px]">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Marca</span>
                      <span className="font-semibold text-slate-700 capitalize">{v.marca || '---'}</span>
                    </div>

                    {/* 🪄 NUEVO: MODELO */}
                    <div className="flex flex-col min-w-[60px]">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Modelo</span>
                      <span className="font-semibold text-slate-700">{v.modelo || '---'}</span>
                    </div>

                    <div className="flex flex-col min-w-[80px]">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Placa</span>
                      <span className="font-black text-accent uppercase text-lg leading-none">{v.placa}</span>
                    </div>

                    <div className="flex flex-col min-w-[70px]">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Color</span>
                      <span className="font-semibold text-slate-700 capitalize">{v.color || '---'}</span>
                    </div>

                    {/* 🪄 NUEVO: FECHA DE REGISTRO */}
                    <div className="flex flex-col min-w-[80px]">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Registro</span>
                      <span className="font-medium text-slate-600 text-sm">
                        {v.fecha_registro 
                          ? new Date(v.fecha_registro).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }) 
                          : '---'}
                      </span>
                    </div>

                  </div>

                  {/* ACCIONES */}
                  <div className="flex xl:flex-col gap-2 flex-shrink-0 w-full xl:w-auto justify-end xl:justify-center border-t xl:border-t-0 xl:border-l border-slate-100 pt-4 xl:pt-0 xl:pl-6 mt-2 xl:mt-0">
                    <button onClick={() => handleEdit(v)} className="p-2.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-xl transition-colors border border-slate-200" title="Editar">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(v.id)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-100" title="Eliminar">
                      <Trash2 size={18} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}