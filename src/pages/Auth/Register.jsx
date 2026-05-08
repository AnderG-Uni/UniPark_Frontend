import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, AlertCircle } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import api from '../../services/api'; 
// Nota: Si el archivo api.js bloquea peticiones sin token, podrías necesitar importar 'axios' directamente aquí.

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm({
    defaultValues: {
      tipo_documento: 'CC',
      rol: 'Estudiante'
    }
  });

  const currentRole = watch('rol');

  // 🪄 MAGIA DINÁMICA: Igual que en el panel de administrador
  useEffect(() => {
    if (currentRole === 'Docente') {
      setValue('carrera_dependencia', 'Docente Instructor');
    } else if (currentRole === 'Guarda') {
      setValue('carrera_dependencia', 'Guarda de Seguridad');
    } else if (currentRole === 'Administrativo') {
      setValue('carrera_dependencia', 'N/A');
      setValue('codigo_universitario', 'N/A');
    } else if (currentRole === 'Estudiante') {
      const currentDep = getValues('carrera_dependencia');
      if (['Docente Instructor', 'Guarda de Seguridad', 'N/A'].includes(currentDep)) {
        setValue('carrera_dependencia', '');
      }
    }
  }, [currentRole, setValue, getValues]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Crear la Persona
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

      // 2. Crear el Usuario asociado
      const usuarioPayload = {
        correo: data.correo,
        clave: data.clave,
        rol: data.rol,
        persona_id: nuevaPersonaId
      };
      await api.post('/usuarios', usuarioPayload);

      // Si todo sale bien, redirigimos al login con un mensaje (opcional a través de state)
      navigate('/login', { state: { message: '¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.' } });
      
    } catch (err) {
      console.error("Error al registrar:", err);
      // Extraemos el mensaje de error del backend si existe (ej. "El correo ya está registrado")
      const backendMessage = err.response?.data?.message || "Ocurrió un error al intentar crear tu cuenta. Intenta de nuevo.";
      setError(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full flex flex-col justify-center pb-2">
        
        {/* 🪄 TÍTULOS: Márgenes reducidos y tamaño de UniPark más pequeño */}
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold text-primary mb-0.5">
            Crea tu cuenta en
          </h2>
          {/* Cambiamos text-4xl a text-3xl */}
          <h3 className="text-2xl font-black text-accent">UniPark</h3>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-3 border border-red-200 text-xs font-medium animate-in fade-in">
            <AlertCircle size={16} className="flex-shrink-0" /> <p>{error}</p>
          </div>
        )}

        {/* Redujimos el gap de 5 a 4 para compactar */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          
          {/* Nombres Completos */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nombres Completos</label>
            <input 
              {...register('nombres_completos', { required: true })}
              type="text" 
              placeholder="Ej: Juan Pérez"
              // Redujimos el py-3 a py-2.5
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all capitalize text-sm"
            />
          </div>

          {/* Documento (Grid 2 columnas) */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tipo</label>
              <select 
                {...register('tipo_documento')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-sm"
              >
                <option value="CC">CC</option>
                <option value="TI">TI</option>
                <option value="CE">CE</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Núm. Documento</label>
              <input 
                {...register('numero_documento', { required: true })}
                type="text" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Teléfono y Rol (Grid 2 columnas) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Teléfono</label>
              <input 
                {...register('telefono', { required: true })}
                type="text" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-accent">Rol Institucional</label>
              <select 
                {...register('rol')}
                className="w-full px-4 py-2.5 rounded-xl border border-accent bg-accent/5 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all font-bold text-primary text-sm"
              >
                <option value="Estudiante">Estudiante</option>
                <option value="Docente">Docente</option>
                <option value="Administrativo">Administrativo</option>
                <option value="Guarda">Guarda</option>
              </select>
            </div>
          </div>

          {/* CAMPOS DINÁMICOS: Institucional */}
          {currentRole !== 'Administrativo' && (
            <div className="grid grid-cols-2 gap-4 pt-1 border-t border-slate-50">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {currentRole === 'Docente' ? 'Código Docente' : currentRole === 'Guarda' ? 'Código Guarda' : 'Cód. Universitario'}
                </label>
                <input 
                  {...register('codigo_universitario')} 
                  type="text"
                  placeholder="Ej: 100200"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {currentRole === 'Estudiante' ? 'Programa / Carrera' : 'Dependencia'}
                </label>
                <input 
                  {...register('carrera_dependencia')} 
                  readOnly={currentRole !== 'Estudiante'}
                  placeholder="Ej: Ing. Sistemas"
                  className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none transition-all text-sm ${
                    currentRole !== 'Estudiante' 
                      ? 'bg-slate-100 text-slate-500 font-medium select-none pointer-events-none' 
                      : 'bg-white focus:border-accent focus:ring-2 focus:ring-accent/20'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Credenciales de Acceso */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Correo electrónico</label>
            <input 
              {...register('correo', { required: true })}
              type="email" 
              placeholder="ejemplo@unicatolica.edu.co"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all mb-3 text-sm"
            />

            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contraseña Segura</label>
            <input 
              {...register('clave', { required: true, minLength: 6 })}
              type="password" 
              placeholder="••••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-sm"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-accent hover:bg-accent-hover text-primary font-black py-3 rounded-xl shadow-soft hover:shadow-hover transition-all flex justify-center items-center gap-2 mt-1 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Completar Registro'}
          </button>

          <p className="text-center text-slate-600 text-xs mt-1">
            ¿Ya tienes cuenta? <Link to="/login" className="text-accent font-black hover:underline">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
