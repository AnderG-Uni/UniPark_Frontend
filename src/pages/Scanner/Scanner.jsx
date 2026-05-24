import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, StopCircle, MapPin, CheckCircle, AlertCircle, UserPlus, QrCode, Loader2, Car, BadgeCheck, ShieldAlert, Building2 } from 'lucide-react';
import api from '../../services/api';

export default function Scanner() {
  const [activeTab, setActiveTab] = useState('qr');
  
  const [sedes, setSedes] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [sedeId, setSedeId] = useState('');
  const [zonaId, setZonaId] = useState('');
  
  const [observacion, setObservacion] = useState('');
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState({ type: '', message: '' }); 
  const [scanData, setScanData] = useState(null); 
  const scannerRef = useRef(null);
  
  // 🪄 NUEVO: Referencia para el auto-scroll en móviles
  const resultsRef = useRef(null);

  const [placaVisitante, setPlacaVisitante] = useState('');
  const [isVisitorLoading, setIsVisitorLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSedes, resZonas] = await Promise.all([
          api.get('/admin/sedes'),
          api.get('/zonas')
        ]);
        
        const sedesData = resSedes.data?.data || resSedes.data || [];
        const zonasData = resZonas.data?.data || resZonas.data || [];
        
        setSedes(sedesData);
        setZonas(zonasData);

        if (sedesData.length > 0) {
          const primeraSedeId = sedesData[0].id.toString();
          setSedeId(primeraSedeId);
          
          const zonasDeSede = zonasData.filter(z => z.sede_id?.toString() === primeraSedeId);
          if (zonasDeSede.length > 0) setZonaId(zonasDeSede[0].id.toString());
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };
    fetchData();

    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    if (sedeId && zonas.length > 0) {
      const zonasDeSede = zonas.filter(z => z.sede_id?.toString() === sedeId);
      if (zonasDeSede.length > 0) {
        setZonaId(zonasDeSede[0].id.toString());
      } else {
        setZonaId(''); 
      }
    }
  }, [sedeId, zonas]);

  // 🪄 NUEVO EFECTO: Auto-scroll en dispositivos móviles cuando hay un resultado
  useEffect(() => {
    if (scanStatus.type !== '' && window.innerWidth < 1024 && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100); // Pequeño retraso para dar tiempo a que el DOM se dibuje
    }
  }, [scanStatus]);

  const startScanner = async () => {
    if (!zonaId) {
      setScanStatus({ type: 'error', message: 'Selecciona una zona válida primero.' });
      return;
    }

    setScanStatus({ type: '', message: '' });
    setScanData(null);
    
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" }, 
        {
          fps: 10, 
          qrbox: { width: 280, height: 280 }, 
          aspectRatio: 1.0,
          formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ],
          experimentalFeatures: { useBarCodeDetectorIfSupported: true }
        },
        onScanSuccess,
        onScanFailure
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Error al iniciar cámara:", err);
      setScanStatus({ type: 'error', message: 'Cámara denegada o no disponible.' });
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error al detener cámara:", err);
      }
    }
    setIsScanning(false);
  };

  const onScanSuccess = async (decodedText) => {
    await stopScanner();
    setScanStatus({ type: 'loading', message: 'Verificando seguridad...' });

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(decodedText)) {
      setScanStatus({ type: 'error', message: 'QR inválido. No pertenece a UniPark.' });
      return;
    }

    try {
      const response = await api.post('/acceso/escanear', {
        qr_token: decodedText,
        zona_id: parseInt(zonaId),
        observacion: observacion.trim()
      });

      const datosBackend = response.data?.datos || response.data?.data?.datos || null;
      const accion = response.data?.accion || response.data?.data?.accion || 'REGISTRO';
      
      setScanData({ ...datosBackend, accion });
      setScanStatus({ type: 'success', message: response.data?.message || '¡Acceso registrado!' });
      
      const resZonas = await api.get('/zonas');
      setZonas(resZonas.data?.data || resZonas.data || []);
      
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al registrar el acceso.';
      setScanStatus({ type: 'error', message: msg });
    }
  };

  const onScanFailure = () => {};

  const handleTabSwitch = async (tab) => {
    if (activeTab === tab) return;
    if (isScanning) await stopScanner();
    setActiveTab(tab);
    setScanStatus({ type: '', message: '' });
    setScanData(null);
  };

  const handleVisitorSubmit = async (e) => {
    e.preventDefault();
    if (!zonaId || !placaVisitante) return;

    setIsVisitorLoading(true);
    setScanStatus({ type: '', message: '' });
    setScanData(null);

    try {
      const response = await api.post('/acceso/visitante', {
        placa: placaVisitante.trim().toUpperCase(),
        zona_id: parseInt(zonaId),
        observacion: observacion.trim()
      });

      setScanStatus({ type: 'success', message: response.data?.message || `Acceso registrado.` });
      setPlacaVisitante('');
      
      const resZonas = await api.get('/zonas');
      setZonas(resZonas.data?.data || resZonas.data || []);
      
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al registrar visitante.';
      setScanStatus({ type: 'error', message: msg });
    } finally {
      setIsVisitorLoading(false);
    }
  };

  const resetAndScanAgain = () => {
    setScanStatus({ type: '', message: '' });
    setScanData(null);
    if (activeTab === 'qr') startScanner();
    
    // Regresar la pantalla arriba en móviles al limpiar
    if (window.innerWidth < 1024) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const zonasFiltradas = zonas.filter(z => z.sede_id?.toString() === sedeId);

  const selectedZonaObj = zonas.find(z => z.id.toString() === zonaId);
  let capacidad = 0, ocupadas = 0, porcentaje = 0, colorBarra = 'bg-emerald-500';
  
  if (selectedZonaObj) {
    capacidad = Number(selectedZonaObj.capacidad_total) || 0;
    ocupadas = Number(selectedZonaObj.cupos_ocupados) || Number(selectedZonaObj.ocupadas) || 0;
    porcentaje = capacidad > 0 ? (ocupadas / capacidad) * 100 : 0;
    colorBarra = porcentaje > 90 ? 'bg-red-500' : porcentaje > 70 ? 'bg-orange-500' : 'bg-emerald-500';
  }

  return (
    // 🪄 CAMBIO CLAVE AQUÍ: Cambiamos 'h-full' por 'min-h-full'
    <div className="flex flex-col gap-4 animate-in fade-in duration-300 min-h-full w-full max-w-6xl mx-auto pb-6">
      
      <style>{`
        #qr-reader { width: 100% !important; border: none !important; }
        #qr-reader video { object-fit: cover !important; border-radius: 1rem !important; width: 100% !important; height: 100% !important; }
        #qr-reader__dashboard_section_csr { display: none !important; }
      `}</style>

      {/* ================= BARRA SUPERIOR CON DOS SELECTORES ================= */}
      <div className="flex flex-col md:flex-row items-center gap-4 w-full">
        
        <div className="bg-surface p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-4 w-full md:w-2/3">
          <div className="flex-1 w-full flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hidden sm:block"><Building2 size={20} /></div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 pl-1">Sede Actual</label>
              <select 
                value={sedeId} 
                onChange={(e) => setSedeId(e.target.value)}
                disabled={isScanning}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-semibold focus:border-accent outline-none disabled:opacity-50"
              >
                {sedes.length === 0 ? <option value="">Cargando sedes...</option> : null}
                {sedes.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden sm:block h-10 w-px bg-slate-200"></div>

          <div className="flex-1 w-full flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg hidden sm:block"><MapPin size={20} /></div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 pl-1">Punto de Control *</label>
              <select 
                value={zonaId} 
                onChange={(e) => setZonaId(e.target.value)}
                disabled={isScanning || zonasFiltradas.length === 0}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-semibold focus:border-accent outline-none disabled:opacity-50"
              >
                {zonasFiltradas.length === 0 ? (
                  <option value="">Sin zonas en esta sede</option>
                ) : (
                  zonasFiltradas.map(z => (
                    <option key={z.id} value={z.id}>
                      {z.nombre} ({z.codigo_zona}) • {z.tipo_permitido}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl w-full md:w-1/3 md:justify-end justify-center">
          <button onClick={() => handleTabSwitch('qr')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'qr' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <QrCode size={18} /> QR
          </button>
          <button onClick={() => handleTabSwitch('visitante')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'visitante' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <UserPlus size={18} /> Visitante
          </button>
        </div>

      </div>

      {/* ================= CONTENEDOR PRINCIPAL ================= */}
      <div className="bg-surface rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col lg:flex-row min-h-[420px]">
        
        {/* PESTAÑA ESCÁNER QR */}
        {activeTab === 'qr' && (
          <>
            <div className="w-full lg:w-1/2 px-4 py-4 lg:px-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/50">
              
              <div className="relative w-full max-w-[360px] aspect-square bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex flex-col items-center justify-center transition-all">
                
                <style>{`
                  #qr-reader__scan_region img,
                  #qr-reader__scan_region svg { display: none !important; }
                `}</style>

                {!isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-30 p-4 text-center bg-slate-900/95 backdrop-blur-sm">
                    <QrCode size={56} className="mb-4 opacity-30 text-white" />
                    <button onClick={startScanner} disabled={!zonaId} className="bg-accent hover:bg-accent-hover disabled:bg-slate-700 text-primary disabled:text-slate-500 font-bold py-2.5 px-6 rounded-lg shadow-lg transition-all flex items-center gap-2 text-base">
                      <Camera size={20} /> {scanStatus.type === 'success' ? 'Siguiente' : 'Activar Cámara'}
                    </button>
                  </div>
                )}
                
                <div id="qr-reader" className="w-full h-full"></div>
                
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="w-[280px] h-[280px] relative">
                      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_10px_2px_rgba(239,68,68,0.8)] animate-pulse"></div>
                    </div>
                  </div>
                )}
                
                {isScanning && (
                  <button onClick={stopScanner} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800/90 hover:bg-red-500 backdrop-blur text-white font-bold py-2 px-5 rounded-full shadow-lg transition-all flex items-center gap-2 z-30 text-sm border border-slate-600/50">
                    <StopCircle size={18} /> Detener
                  </button>
                )}
              </div>

              {selectedZonaObj && (
                <div className="w-full max-w-[360px] mt-4 flex flex-col px-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-bold text-slate-500 tracking-wide">
                      Capacidad: <span className="text-slate-800">{capacidad}</span>
                    </span>
                    <span className="text-sm font-bold text-slate-500 tracking-wide">
                      Ocupados: <span className="text-slate-800">{ocupadas}</span>
                    </span>
                    <span className="text-xs font-black text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                      {Math.round(porcentaje)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <div className={`h-full rounded-full transition-all duration-500 ${colorBarra}`} style={{ width: `${Math.min(porcentaje, 100)}%` }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* LADO DERECHO: RESULTADOS */}
            {/* 🪄 NUEVO: Le asignamos la referencia para el auto-scroll */}
            <div ref={resultsRef} className="w-full lg:w-1/2 p-4 lg:p-8 flex flex-col justify-center min-h-[300px]">
              {!scanStatus.type && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60 text-center py-10">
                  <BadgeCheck size={64} strokeWidth={1} className="mb-3 text-slate-300" />
                  <p className="text-lg font-medium text-slate-500">Esperando Escaneo</p>
                </div>
              )}
              {scanStatus.type === 'loading' && (
                <div className="flex flex-col items-center justify-center h-full text-blue-500 animate-pulse py-10">
                  <Loader2 size={48} className="animate-spin mb-3" />
                  <p className="font-bold text-sm">{scanStatus.message}</p>
                </div>
              )}
              {scanStatus.type === 'error' && (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <ShieldAlert size={56} className="text-red-400 mb-3" />
                  <h3 className="text-xl font-black text-slate-800 mb-2">Acceso Denegado</h3>
                  <p className="text-red-500 font-medium bg-red-50 px-4 py-2 rounded-lg border border-red-200 text-sm max-w-sm">{scanStatus.message}</p>
                </div>
              )}
              {scanStatus.type === 'success' && scanData && (
                <div className="flex flex-col items-center h-full animate-in zoom-in-95 duration-300 pt-2 pb-6">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-inner ${scanData.accion === 'INGRESO' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    <CheckCircle size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-1">
                    {scanData.accion === 'INGRESO' ? 'Ingreso Autorizado' : 'Salida Registrada'}
                  </h3>
                  <p className="text-slate-500 font-medium text-sm mb-5">{scanStatus.message}</p>
                  
                  <div className="bg-slate-50 border border-slate-200 w-full max-w-sm rounded-xl p-4 shadow-sm flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3 border-b border-slate-200 pb-3">
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Placa</span>
                        <span className="font-black text-accent text-xl uppercase tracking-widest leading-none">{scanData.vehiculo?.placa || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tipo y Marca</span>
                        <span className="font-bold text-slate-700 capitalize text-sm leading-none">{scanData.vehiculo?.tipo} • {scanData.vehiculo?.marca || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 pt-1 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Propietario</span>
                        <span className="font-bold text-slate-800 text-right truncate max-w-[150px]">{scanData.propietario?.nombre || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perfil (Rol)</span>
                        <span className="font-semibold text-slate-600 bg-slate-200/50 px-2 py-0.5 rounded text-xs">{scanData.propietario?.rol || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID Univ.</span>
                        <span className="font-medium text-slate-500 text-xs">{scanData.propietario?.codigo_universitario || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={resetAndScanAgain} className="mt-5 bg-accent hover:bg-accent-hover text-primary font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm w-full max-w-sm">
                    <QrCode size={16} /> Escanear otro vehículo
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* PESTAÑA VISITANTES MANUAL */}
        {activeTab === 'visitante' && (
          <div className="w-full p-4 lg:p-8 flex items-center justify-center bg-slate-50/50">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 max-w-sm w-full shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-orange-100 text-orange-600 rounded-lg"><Car size={20} /></div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Ingreso Visitante</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Registro manual por placa</p>
                </div>
              </div>

              {scanStatus.message && (
                <div className={`mb-5 p-3 rounded-lg flex items-center gap-2 text-xs font-bold ${scanStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                  {scanStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <p>{scanStatus.message}</p>
                </div>
              )}

              <form onSubmit={handleVisitorSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Placa del Vehículo *</label>
                  <input type="text" required value={placaVisitante} onChange={(e) => setPlacaVisitante(e.target.value)} placeholder="Ej: QWY52P" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-accent text-slate-800 outline-none transition-all uppercase font-black text-lg tracking-widest text-center" />
                </div>
                
                {selectedZonaObj && (
                  <div className="w-full mt-2 flex flex-col px-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-bold text-slate-500 tracking-wide">
                        Capacidad: <span className="text-slate-800">{capacidad}</span>
                      </span>
                      <span className="text-sm font-bold text-slate-500 tracking-wide">
                        Ocupados: <span className="text-slate-800">{ocupadas}</span>
                      </span>
                      <span className="text-xs font-black text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                        {Math.round(porcentaje)}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                      <div className={`h-full rounded-full transition-all duration-500 ${colorBarra}`} style={{ width: `${Math.min(porcentaje, 100)}%` }}></div>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={isVisitorLoading || !zonaId} className="mt-3 bg-primary hover:bg-slate-800 text-white font-bold py-3 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70 text-sm">
                  {isVisitorLoading ? <><Loader2 size={16} className="animate-spin" /> Registrando...</> : 'Registrar Visitante'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}