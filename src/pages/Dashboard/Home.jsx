import React, { useState, useEffect } from 'react';
import { Filter, Loader2, AlertCircle, Car as CarIcon, X, Download } from 'lucide-react';
import axios from 'axios';
import api from '../../services/api';
import ProtectedImage from '../../components/common/ProtectedImage';

export default function Home() {
  const [vehiculos, setVehiculos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorVehiculos, setErrorVehiculos] = useState(null);

  // Estados para la Modal del QR
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      try {
        const resVehiculos = await api.get('/vehiculos');
        setVehiculos(resVehiculos.data.data || resVehiculos.data || []);
      } catch (err) {
        console.error("Error al cargar vehículos:", err);
        setErrorVehiculos("No pudimos cargar tu lista de vehículos.");
      }

      try {
        const resHistorial = await api.get('/acceso/mi-historial'); 
        setHistorial(resHistorial.data.data || resHistorial.data || []);
      } catch (err) {
        console.warn("⚠️ Endpoint de historial aún no implementado en el backend.");
      }

      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  // Función para abrir la Modal
  const handleOpenQR = (vehiculo) => {
    setSelectedVehicle(vehiculo);
    setQrModalOpen(true);
  };

  // Función para descargar el QR de forma segura (con Token)
  const handleDownloadQR = async () => {
    if (!selectedVehicle?.url_qr) return;

    try {
      const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '');
      const path = selectedVehicle.url_qr;
      const fullUrl = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
      const token = localStorage.getItem('access_token');

      // Descargamos el binario de la imagen enviando el token
      const response = await axios.get(fullUrl, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });

      // Forzamos la descarga en el navegador
      const blobUrl = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `QR_UniPark_${selectedVehicle.placa.toUpperCase()}.png`; // Nombre de la IMG
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

    } catch (error) {
      console.error("Error al descargar el QR:", error);
      alert("Hubo un problema al descargar el código QR.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-primary gap-4">
        <Loader2 size={40} className="animate-spin text-accent" />
        <p className="font-medium text-slate-500">Cargando tu información...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6 relative">
      
      {/* ================= MODAL DEL QR ================= */}
      {qrModalOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface p-8 rounded-2xl shadow-2xl max-w-sm w-full flex flex-col items-center relative border border-slate-100 animate-in zoom-in-95 duration-200">
            
            {/* Botón Cerrar */}
            <button 
              onClick={() => setQrModalOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-bold text-primary mb-1">Tu Código QR</h3>
            <p className="text-slate-500 text-sm mb-6 uppercase font-medium tracking-wider">
              {selectedVehicle.marca} • {selectedVehicle.placa}
            </p>

            {/* Contenedor del QR Ampliado */}
            <div className="w-56 h-56 bg-white border-2 border-slate-100 shadow-inner rounded-xl p-3 mb-8 flex items-center justify-center">
              <ProtectedImage 
                src={selectedVehicle.url_qr} 
                alt={`QR de ${selectedVehicle.placa}`} 
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>

            {/* Botón Descargar */}
            <button 
              onClick={handleDownloadQR} 
              className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3 rounded-xl shadow-soft hover:shadow-hover transition-all flex justify-center items-center gap-2"
            >
              <Download size={20} />
              Guardar Imagen
            </button>
          </div>
        </div>
      )}
      {/* ================= FIN MODAL ================= */}

      {/* COLUMNA IZQUIERDA (Vehículos) */}
      <div className="w-full xl:w-2/3 flex flex-col gap-6">
        
        {/* Mis vehículos (Tarjetas Visuales) */}
        <div className="bg-surface rounded-xl p-6 shadow-soft border border-slate-100">
          <h3 className="text-lg font-semibold text-primary mb-6">Mis vehículos</h3>
          
          {errorVehiculos ? (
             <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-200">
               <AlertCircle size={20} />
               <p className="text-sm">{errorVehiculos}</p>
             </div>
          ) : vehiculos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <CarIcon size={48} className="mb-3 opacity-20" />
              <p>No tienes vehículos registrados aún.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vehiculos.slice(0, 3).map((v) => (
                <div key={v.id} className="flex flex-col items-center p-4 border border-slate-100 rounded-xl hover:shadow-hover transition-all cursor-pointer">
                  <div className="h-24 w-full flex items-center justify-center mb-2 bg-slate-50 rounded-lg overflow-hidden p-2">
                     <ProtectedImage 
                       src={v.url_foto} 
                       alt={v.tipo} 
                       className="h-full object-contain mix-blend-multiply" 
                     />
                  </div>
                  <p className="text-accent font-bold uppercase">{v.placa}</p>
                  <p className="text-slate-500 text-sm">{v.marca}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabla Mis Vehículos Registrados */}
        <div className="bg-surface rounded-xl p-6 shadow-soft border border-slate-100">
          <h3 className="text-lg font-semibold text-primary mb-4">Mis vehículos registrados</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b-2 border-slate-100 text-primary">
                  <th className="py-3 font-semibold text-sm">QR</th>
                  <th className="py-3 font-semibold text-sm">Tipo</th>
                  <th className="py-3 font-semibold text-sm">Marca</th>
                  <th className="py-3 font-semibold text-sm">Matrícula</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 text-sm">
                {vehiculos.length === 0 && !errorVehiculos ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-400">Sin datos para mostrar</td>
                  </tr>
                ) : (
                  vehiculos.map((v) => (
                    <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3">
                        {/* AÑADIDO: Hover y cursor-pointer para que el usuario sepa que es clickeable */}
                        <div 
                          onClick={() => handleOpenQR(v)}
                          className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center overflow-hidden p-1 border border-slate-200 cursor-pointer hover:border-accent hover:scale-105 transition-all shadow-sm"
                          title="Ver QR ampliado"
                        >
                          {v.url_qr ? (
                            <ProtectedImage 
                              src={v.url_qr} 
                              alt={`QR de ${v.placa}`} 
                              className="w-full h-full object-contain mix-blend-multiply"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 capitalize">{v.tipo}</td>
                      <td className="py-3 capitalize">{v.marca}</td>
                      <td className="py-3 uppercase font-medium">{v.placa}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* COLUMNA DERECHA (Ingresos recientes) */}
      <div className="w-full xl:w-1/3 bg-surface rounded-xl p-6 shadow-soft border border-slate-100 flex flex-col h-[600px]">
        <h3 className="text-lg font-semibold text-primary">Ingresos a la universidad</h3>
        <p className="text-accent text-sm mb-6">Historial reciente de tus accesos</p>
        
        <button className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-lg text-slate-600 text-sm mb-6 hover:bg-slate-50 w-max transition-colors">
          <Filter size={16} /> Filtrar por fecha
        </button>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-primary sticky top-0 bg-surface z-10">
                <th className="py-2 font-semibold">Vehículo</th>
                <th className="py-2 font-semibold">Sede</th>
                <th className="py-2 font-semibold">F. Ingreso</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {historial.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-slate-400">
                    <p>No hay accesos recientes.</p>
                  </td>
                </tr>
              ) : (
                historial.map((registro) => (
                  <tr key={registro.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-medium uppercase">{registro.vehiculo_placa}</td>
                    <td className="py-3 capitalize">{registro.sede_nombre}</td>
                    <td className="py-3 text-xs">
                      {new Date(registro.fecha_ingreso).toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}