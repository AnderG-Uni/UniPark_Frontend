import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, CreditCard, GraduationCap, Building, BadgeCheck, Loader2, ShieldCheck, Edit, Check } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../context/useAuthStore';
import ProfileEditModal from './ProfileEditModal'; // <-- IMPORTAMOS EL MODAL

export default function Profile() {
  const { user } = useAuthStore();
  
  const [perfil, setPerfil] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el Modal y el Toast
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchDatosPersonales = async () => {
    if (!user?.persona_id) {
      setError("No se encontró el ID de la persona en la sesión.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get(`/personas/${user.persona_id}`);
      setPerfil(response.data.data || response.data);
    } catch (err) {
      console.error("Error al cargar los datos personales:", err);
      setError("Ocurrió un error al intentar obtener tus datos personales.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatosPersonales();
  }, [user]);

  if (isLoading && !perfil) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-primary gap-4">
        <Loader2 size={40} className="animate-spin text-accent" />
        <p className="font-medium text-slate-500">Cargando tu perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
          <p className="font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-in fade-in duration-300 relative">
      
      {/* ================= TOAST NOTIFICATION ================= */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-[150] bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-8 fade-in duration-300 border border-slate-700">
          <div className="w-8 h-8 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center flex-shrink-0">
            <Check size={18} strokeWidth={3} />
          </div>
          <p className="font-semibold text-sm">{toastMessage}</p>
        </div>
      )}

      {/* ================= MODAL DE EDICIÓN ================= */}
      {perfil && (
        <ProfileEditModal 
          perfil={perfil} 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)}
          onUpdateSuccess={(mensajeDelBackend) => {
            setIsEditModalOpen(false);
            fetchDatosPersonales(); // Recargamos datos sin F5
            
            setToastMessage(mensajeDelBackend);
            setTimeout(() => setToastMessage(null), 3000);
          }} 
        />
      )}

      {/* CABECERA DEL PERFIL */}
      <div className="bg-surface rounded-2xl p-8 shadow-soft border border-slate-100 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 w-full">
          {/* Avatar dinámico */}
          <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-md overflow-hidden flex-shrink-0">
            <img 
              src={`https://ui-avatars.com/api/?name=${perfil?.nombres_completos || user?.correo}&background=0D8ABC&color=fff&size=256`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-primary mb-1 capitalize">
                  {perfil?.nombres_completos || 'Usuario sin nombre'}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-3 mt-4">

                  <div className="flex flex-wrap items-center gap-4 mt-4">
  
                    {/* Píldoras de Rol y Correo */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="bg-primary/5 text-primary px-3 py-1 rounded-full font-bold flex items-center gap-1.5 border border-primary/10 whitespace-nowrap">
                        <ShieldCheck size={16} className="text-accent" />
                        Rol: {user?.rol || '---'}
                      </span>
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium px-2 whitespace-nowrap">
                        <Mail size={16} className="text-slate-400" />
                        {user?.correo || '---'}
                      </span>
                    </div>
                    
                    {/* 🪄 Insignia de Último Acceso (Diseño en línea y compacto) */}
                    <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4 flex flex-col justify-center w-full sm:w-auto mt-2 sm:mt-0">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Último Acceso</p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[13px] font-bold text-emerald-500 leading-none whitespace-nowrap">
                          Sesión Actual
                        </p>
                        {/* whitespace-nowrap es la magia para que no se parta el 'a. m.' */}
                        <p className="text-[11px] font-semibold text-slate-400 leading-none whitespace-nowrap">
                          ({user?.ultimo_login 
                            ? new Date(user.ultimo_login).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) 
                            : new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })})
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* BOTÓN EDITAR */}
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="bg-accent text-primary font-bold hover:bg-accent-hover px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 self-center sm:self-start active:scale-95"
              >
                <Edit size={18} />
                <span>Editar Datos</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TARJETAS DE INFORMACIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Bloque 1: Información Personal */}
        <div className="bg-surface rounded-2xl p-6 shadow-soft border border-slate-100 relative group transition-all hover:border-accent/30">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <User className="text-accent" size={20} />
            <h3 className="text-lg font-semibold text-primary">Información Personal</h3>
          </div>
          
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                <BadgeCheck size={16} /> Nombre Completo
              </p>
              <p className="text-slate-800 font-semibold capitalize">
                {perfil?.nombres_completos || '---'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                  <CreditCard size={16} /> Documento ({perfil?.tipo_documento || 'ID'})
                </p>
                <p className="text-slate-800 font-semibold">
                  {perfil?.numero_documento || '---'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                  <Phone size={16} /> Teléfono
                </p>
                <p className="text-slate-800 font-semibold">
                  {perfil?.telefono || '---'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bloque 2: Información Institucional */}
        <div className="bg-surface rounded-2xl p-6 shadow-soft border border-slate-100 relative group transition-all hover:border-accent/30">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <Building className="text-accent" size={20} />
            <h3 className="text-lg font-semibold text-primary">Información Institucional</h3>
          </div>
          
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                <GraduationCap size={16} /> Programa / Dependencia
              </p>
              <p className="text-slate-800 font-semibold capitalize">
                {perfil?.carrera_dependencia || '---'}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                <CreditCard size={16} /> Código Institucional
              </p>
              <p className="text-slate-800 font-semibold uppercase tracking-wider">
                {perfil?.codigo_universitario || '---'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}