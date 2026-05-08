import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2, ShieldAlert, AlertTriangle, UserPlus, ShieldCheck, User as UserIcon } from 'lucide-react';
import api from '../../services/api';

export default function UserModal({ isOpen, onClose, mode, userData, onUpdateSuccess }) {
  const [isSaving, setIsSaving] = useState(false);
  
  // 🪄 Extraemos watch y setValue para la lógica dinámica
  const { register, handleSubmit, reset, watch, setValue, getValues, formState: { errors } } = useForm();

  // Observamos el rol en tiempo real (si está en modo edición, toma el del userData)
  const currentRole = watch('rol');

  // Limpieza inicial del formulario
  useEffect(() => {
    if (isOpen && userData && mode !== 'create') {
      const infoPersona = userData.persona || {};
      reset({
        id: userData.id,
        correo: userData.correo,
        rol: userData.rol,
        persona_id: userData.persona_id,
        nombres_completos: infoPersona.nombres_completos || '',
        tipo_documento: infoPersona.tipo_documento || 'CC',
        numero_documento: infoPersona.numero_documento || '',
        telefono: infoPersona.telefono || '',
        codigo_universitario: infoPersona.codigo_universitario || '',
        carrera_dependencia: infoPersona.carrera_dependencia || ''
      });
    } else if (isOpen && mode === 'create') {
      reset({
        nombres_completos: '',
        tipo_documento: 'CC',
        numero_documento: '',
        telefono: '',
        codigo_universitario: '',
        carrera_dependencia: '',
        correo: '',
        clave: '',
        rol: 'Estudiante' // Estudiante por defecto
      });
    }
  }, [isOpen, userData, mode, reset]);

  // 🪄 MAGIA DINÁMICA: Cambiamos los valores dependiendo del rol seleccionado
  useEffect(() => {
    if (isOpen && (mode === 'create' || mode === 'edit')) {
      if (currentRole === 'Docente') {
        setValue('carrera_dependencia', 'Docente Instructor');
      } else if (currentRole === 'Guarda') {
        setValue('carrera_dependencia', 'Guarda de Seguridad');
      } else if (currentRole === 'Administrador' || currentRole === 'Administrativo') {
        setValue('carrera_dependencia', 'N/A');
        setValue('codigo_universitario', 'N/A');
      } else if (currentRole === 'Estudiante') {
        // Si el usuario cambia de Docente a Estudiante mientras crea, limpiamos la dependencia
        const currentDep = getValues('carrera_dependencia');
        if (['Docente Instructor', 'Guarda de Seguridad', 'N/A'].includes(currentDep)) {
          setValue('carrera_dependencia', '');
        }
      }
    }
  }, [currentRole, mode, isOpen, setValue, getValues]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      let mensaje = "";

      if (mode === 'create') {
        const personaPayload = {
          nombres_completos: data.nombres_completos,
          tipo_documento: data.tipo_documento,
          numero_documento: data.numero_documento,
          telefono: data.telefono,
          codigo_universitario: data.codigo_universitario || "N/A",
          carrera_dependencia: data.carrera_dependencia || "N/A"
        };
        const resPersona = await api.post('/personas', personaPayload);
        const nuevaPersonaId = resPersona.data?.data?.id || resPersona.data?.id;

        const usuarioPayload = {
          correo: data.correo,
          clave: data.clave,
          rol: data.rol,
          persona_id: nuevaPersonaId
        };
        await api.post('/usuarios', usuarioPayload);
        mensaje = "Usuario creado exitosamente";
      }
      else if (mode === 'edit') {
        const payload = {
          nombres_completos: data.nombres_completos,
          tipo_documento: data.tipo_documento,
          numero_documento: data.numero_documento,
          telefono: data.telefono,
          codigo_universitario: data.codigo_universitario || "N/A",
          carrera_dependencia: data.carrera_dependencia || "N/A"
        };
        const idTarget = userData.persona_id || userData.persona?.id || userData.id;
        await api.put(`/personas/${idTarget}`, payload);
        mensaje = "Datos del usuario actualizados";
      }
      else if (mode === 'role') {
        // Ahora enviamos correo, rol y clave (el backend decidirá si hashear la clave)
        const payload = { 
            correo: data.correo,
            rol: data.rol,
            clave: data.clave 
        };
        await api.put(`/usuarios/${userData.id}`, payload); 
        mensaje = "Credenciales actualizadas correctamente";
      }
      else if (mode === 'delete') {
        // A. Primero eliminamos el Usuario (Credenciales/Hijo)
        await api.delete(`/usuarios/${userData.id}`);
        
        // B. Luego eliminamos la Persona (Datos biográficos/Padre)
        const idPersona = userData.persona_id || userData.persona?.id;
        if (idPersona) {
          await api.delete(`/personas/${idPersona}`);
        }
        
        mensaje = "Usuario y datos eliminados permanentemente";
      }

      onUpdateSuccess(mensaje);
      onClose();
    } catch (err) {
      console.error("Error en la operación de usuario:", err);
      alert("Ocurrió un error al procesar la solicitud.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const config = {
    create: { title: 'Nuevo Usuario', icon: <UserPlus className="text-accent" />, btnText: 'Crear Usuario', btnColor: 'bg-primary' },
    edit: { title: 'Editar Datos', icon: <UserIcon className="text-accent" />, btnText: 'Guardar Cambios', btnColor: 'bg-primary' },
    role: { title: 'Actualizar Usuario', icon: <ShieldCheck className="text-accent" />, btnText: 'Actualizar datos usuario', btnColor: 'bg-primary' },
    delete: { title: 'Eliminar Usuario', icon: <AlertTriangle className="text-red-500" />, btnText: 'Sí, Eliminar Definitivamente', btnColor: 'bg-red-500 hover:bg-red-600' }
  };

  const current = config[mode];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${mode === 'delete' ? 'bg-red-100' : 'bg-accent/10'}`}>
              {current.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary">{current.title}</h3>
              {userData && mode !== 'create' && (
                <p className="text-xs text-slate-500 font-medium mt-0.5">{userData.correo || userData.nombres_completos}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 max-h-[75vh] overflow-y-auto no-scrollbar">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {(mode === 'create' || mode === 'role') && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Correo Electrónico</label>
                        <input 
                        type="email" 
                        {...register('correo', { required: true })} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" 
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">
                        {mode === 'role' ? 'Nueva Clave (Opcional)' : 'Contraseña'}
                        </label>
                        <input 
                        type="text" 
                        {...register('clave', { required: mode === 'create' })} 
                        placeholder={mode === 'role' ? 'Dejar en blanco para mantener' : ''}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" 
                        />
                    </div>
                    </div>

                    <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Rol en el Sistema</label>
                    <select {...register('rol', { required: true })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent font-bold text-primary">
                        <option value="Estudiante">Estudiante</option>
                        <option value="Docente">Docente</option>
                        <option value="Guarda">Guarda</option>
                        <option value="Administrador">Administrador</option>
                    </select>
                    </div>
                </div>
            )}

            {(mode === 'create' || mode === 'edit') && (
              <>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Nombre Completo</label>
                  <input {...register('nombres_completos', { required: true })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent capitalize" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Tipo Doc.</label>
                    <select {...register('tipo_documento')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent">
                      <option value="CC">CC</option><option value="TI">TI</option><option value="CE">CE</option><option value="Pasaporte">Pasaporte</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Núm. Documento</label>
                    <input {...register('numero_documento', { required: true })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" />
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Teléfono</label>
                  <input {...register('telefono')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" />
                </div>

                {/* 🪄 SECCIÓN DINÁMICA: Institucional */}
                {currentRole !== 'Administrador' && currentRole !== 'Administrativo' && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                    <div>
                      {/* Etiqueta dinámica según el rol */}
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">
                        {currentRole === 'Docente' ? 'Código Docente' : currentRole === 'Guarda' ? 'Código Guarda' : 'Cód. Universitario'}
                      </label>
                      <input 
                        {...register('codigo_universitario')} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" 
                        placeholder="Ej: 100200"
                      />
                    </div>
                    <div>
                      {/* Etiqueta dinámica según el rol */}
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">
                        {currentRole === 'Estudiante' ? 'Programa / Carrera' : 'Dependencia'}
                      </label>
                      <input 
                        {...register('carrera_dependencia')} 
                        // Se bloquea el campo y cambia el color si no es estudiante
                        readOnly={currentRole !== 'Estudiante'}
                        className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                          currentRole !== 'Estudiante' 
                            ? 'bg-slate-100 text-slate-500 font-medium select-none pointer-events-none' 
                            : 'bg-slate-50 focus:border-accent'
                        }`} 
                        placeholder="Ej: Ing. Sistemas"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {mode === 'create' && (
              <div className="pt-4 border-t border-slate-100 mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Correo Electrónico</label>
                    <input type="email" {...register('correo', { required: true })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Contraseña Temporal</label>
                    <input type="text" {...register('clave', { required: true })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" />
                  </div>
                </div>
              </div>
            )}

            {mode === 'delete' && (
              <div className="text-center py-4">
                <ShieldAlert size={48} className="text-red-400 mx-auto mb-4 opacity-50" />
                <p className="text-slate-600 font-medium">¿Estás seguro de que deseas eliminar permanentemente a este usuario?</p>
                <p className="text-xs text-red-500 mt-2 font-bold">Esta acción no se puede deshacer y borrará sus vehículos asociados.</p>
              </div>
            )}

            <button 
              disabled={isSaving} 
              className={`w-full text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 mt-6 active:scale-95 ${current.btnColor}`}
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {current.btnText}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}