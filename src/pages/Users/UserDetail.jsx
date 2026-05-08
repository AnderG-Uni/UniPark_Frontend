import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useOutletContext, Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, CreditCard, GraduationCap, Building, BadgeCheck, ShieldCheck, Car, Edit, Trash2, Loader2 } from 'lucide-react';
import api from '../../services/api';
import ProtectedImage from '../../components/common/ProtectedImage'; // <-- Importamos ProtectedImage

export default function UserDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const context = useOutletContext();
  const setDynamicBreadcrumb = context?.setDynamicBreadcrumb;
  
  // Extraemos los datos de memoria
  const userData = location.state?.usuarioData;

  // 🪄 NUEVOS ESTADOS PARA VEHÍCULOS
  const [vehiculos, setVehiculos] = useState([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

  // Efecto para el Breadcrumb y validación
  useEffect(() => {
    if (!userData) {
      navigate('/users');
      return;
    }

    if (setDynamicBreadcrumb) {
      const nombrePila = userData.persona?.nombres_completos?.split(' ')[0] || 'ID: ' + id;
      setDynamicBreadcrumb(
        <div className="flex items-center">
          <span className="text-accent mx-2">/</span>
          <Link to="/dashboard" className="hover:text-accent transition-colors">Inicio</Link>
          <span className="text-accent mx-2">/</span>
          <Link to="/users" className="hover:text-accent transition-colors">Usuarios</Link>
          <span className="text-accent mx-2">/</span>
          <span className="text-primary cursor-default font-bold">
            Perfil [{nombrePila}]
          </span>
        </div>
      );
    }
    return () => { if (setDynamicBreadcrumb) setDynamicBreadcrumb(null); };
  }, [id, userData, setDynamicBreadcrumb, navigate]);

  // 🪄 NUEVO EFECTO: Buscar los vehículos de esta persona
  useEffect(() => {
    const fetchUserVehicles = async () => {
      if (!userData?.persona?.id) {
        setIsLoadingVehicles(false);
        return;
      }
      try {
        setIsLoadingVehicles(true);
        const response = await api.get('/vehiculos');
        const todosVehiculos = response.data.data || response.data || [];
        
        // Filtramos solo los vehículos cuyo persona_id coincida con el usuario actual
        const userVehs = todosVehiculos.filter(v => Number(v.persona_id) === Number(userData.persona.id));
        setVehiculos(userVehs);
      } catch (error) {
        console.error("Error al cargar los vehículos del usuario:", error);
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    if (userData) {
      fetchUserVehicles();
    }
  }, [userData]);

  if (!userData) return null;

  const perfil = userData.persona || {};

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-2 pb-10">
      
      {/* ================= 1. CABECERA DEL PERFIL ================= */}
      <div className="bg-surface rounded-2xl p-8 shadow-soft border border-slate-100 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 w-full">
          <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-md overflow-hidden flex-shrink-0">
            <img 
              src={`https://ui-avatars.com/api/?name=${perfil.nombres_completos || userData.correo}&background=0D8ABC&color=fff&size=256`} 
              alt="Avatar" className="w-full h-full object-cover"
            />
          </div>
          
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-3xl font-bold text-primary mb-2 capitalize tracking-tight">
              {perfil.nombres_completos || 'Usuario sin nombre'}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-3 mt-3">
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="bg-primary/5 text-primary px-3 py-1 rounded-full font-bold flex items-center gap-1.5 border border-primary/10">
                  <ShieldCheck size={16} className="text-accent" />
                  Rol: {userData.rol}
                </span>
                <span className="text-slate-500 flex items-center gap-1.5 font-medium px-2">
                  <Mail size={16} className="text-slate-400" />
                  {userData.correo}
                </span>
              </div>
              
              {/* Último Login */}
              <div className="sm:ml-auto border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4 text-left sm:text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Último Acceso</p>
                <p className="text-sm font-semibold text-slate-700">
                  {userData.ultimo_login 
                    ? new Date(userData.ultimo_login).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) 
                    : <span className="text-orange-500 italic">Sin datos, no ha iniciado sesión</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. TARJETAS DE INFORMACIÓN ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface rounded-2xl p-6 shadow-soft border border-slate-100 hover:border-accent/30 transition-all">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <User className="text-accent" size={20} />
            <h3 className="text-lg font-semibold text-primary">Información Personal</h3>
          </div>
          <div className="space-y-5">
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-2"><BadgeCheck size={14} /> Nombre Completo</p>
              <p className="text-slate-800 font-semibold capitalize">{perfil.nombres_completos || '---'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-2"><CreditCard size={14} /> Documento ({perfil.tipo_documento || 'ID'})</p>
                <p className="text-slate-800 font-semibold">{perfil.numero_documento || '---'}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-2"><Phone size={14} /> Teléfono</p>
                <p className="text-slate-800 font-semibold">{perfil.telefono || '---'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-6 shadow-soft border border-slate-100 hover:border-accent/30 transition-all">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <Building className="text-accent" size={20} />
            <h3 className="text-lg font-semibold text-primary">Información Institucional</h3>
          </div>
          <div className="space-y-5">
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-2"><GraduationCap size={14} /> Programa / Dependencia</p>
              <p className="text-slate-800 font-semibold capitalize">{perfil.carrera_dependencia || '---'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-2"><CreditCard size={14} /> Código Inst.</p>
                <p className="text-slate-800 font-semibold uppercase">{perfil.codigo_universitario || '---'}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-2"><ShieldCheck size={14} /> Estado</p>
                <p className="text-slate-800 font-semibold uppercase">{perfil.estado || '---'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. SECCIÓN DE VEHÍCULOS (NUEVO) ================= */}
      <div className="mt-4">
        <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
          <Car className="text-accent" /> Vehículos Registrados
        </h3>

        {isLoadingVehicles ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
            <Loader2 className="animate-spin text-accent" size={32} />
            <p className="text-sm">Buscando vehículos...</p>
          </div>
        ) : vehiculos.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-slate-100 border-dashed p-10 flex flex-col items-center justify-center text-slate-400">
             <Car size={48} className="opacity-20 mb-3" />
             <p className="font-medium">Este usuario no tiene vehículos registrados.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {vehiculos.map((v) => (
              <div key={v.id} className="bg-surface rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col md:flex-row items-center gap-6">
                
                {/* 1. Imagen del Vehículo */}
                <div className="w-full md:w-32 h-24 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden p-2 flex-shrink-0 border border-slate-100">
                  <ProtectedImage src={v.url_foto} alt={v.placa} className="w-full h-full object-contain mix-blend-multiply" />
                </div>

                {/* 2. Grid de Datos */}
                <div className="flex-1 flex flex-wrap sm:flex-nowrap justify-between items-center gap-6 w-full px-2">
                  <div className="flex flex-col min-w-[60px]">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Código QR</span>
                    <div className="w-10 h-10 bg-slate-100 rounded-lg p-1 border border-slate-200 shadow-sm flex items-center justify-center">
                      {v.url_qr ? <ProtectedImage src={v.url_qr} className="w-full h-full object-contain mix-blend-multiply" /> : <span className="text-[10px] text-slate-400">N/A</span>}
                    </div>
                  </div>
                  <div className="flex flex-col min-w-[70px]">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Tipo</span>
                    <span className="font-semibold text-slate-700 capitalize">{v.tipo}</span>
                  </div>
                  <div className="flex flex-col min-w-[70px]">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Marca</span>
                    <span className="font-semibold text-slate-700 capitalize">{v.marca || '---'}</span>
                  </div>
                  <div className="flex flex-col min-w-[70px]">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Placa</span>
                    <span className="font-black text-accent uppercase text-lg leading-none">{v.placa}</span>
                  </div>
                  <div className="flex flex-col min-w-[70px]">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Color</span>
                    <span className="font-semibold text-slate-700 capitalize">{v.color || '---'}</span>
                  </div>
                </div>

                {/* 3. Acciones (Decorativas por ahora para mantener diseño) */}
                <div className="flex md:flex-col gap-2 flex-shrink-0 w-full md:w-auto justify-end md:justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4 mt-2 md:mt-0">
                  <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors border border-slate-200" title="Editar Vehículo">
                    <Edit size={16} />
                  </button>
                  <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100" title="Eliminar Vehículo">
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}