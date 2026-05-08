import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import useAuthStore from '../../context/useAuthStore';

// 1. Esquema de Validación (Igual que en el Backend)
const loginSchema = z.object({
  correo: z.string().email('Ingresa un correo institucional válido.'),
  clave: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.')
});

export default function Login() {
  const navigate = useNavigate();
  
  // 2. Extraer acciones y estados de Zustand
  const { loginAction, isLoading, error, clearError } = useAuthStore();

  // 3. Configurar React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  // 4. Función de envío
  const onSubmit = async (data) => {
    try {
      // Ejecutamos la acción global
      const usuario = await loginAction(data.correo, data.clave);
      
      // SMART ROUTING: Redirigir según el rol del JWT
      if (usuario.rol === 'Guarda') {
        navigate('/scanner'); // Pantalla móvil del guarda (futura)
      } else if (usuario.rol === 'Administrador') {
        navigate('/reports'); // Directo a la inteligencia de negocios
      } else {
        navigate('/dashboard'); // Vista normal de Estudiantes/Personal
      }
    } catch (err) {
      // El error ya se guardó en el store de Zustand, no necesitamos hacer nada aquí
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary mb-2">
          Hola, Bienvenido a
        </h1>
        <h2 className="text-4xl font-bold text-accent">UniPark</h2>
      </div>

      {/* Alerta de Error del Backend */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r text-sm">
          {error}
        </div>
      )}

      {/* 5. Conectar onSubmit al formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
          <input 
            type="email" 
            placeholder="example@example.com"
            {...register('correo', { onChange: clearError })}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 outline-none transition-all ${
              errors.correo ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-accent focus:ring-accent/20'
            }`}
          />
          {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Clave</label>
          <input 
            type="password" 
            placeholder="••••••••••"
            {...register('clave', { onChange: clearError })}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 outline-none transition-all ${
              errors.clave ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-accent focus:ring-accent/20'
            }`}
          />
          {errors.clave && <p className="text-red-500 text-xs mt-1">{errors.clave.message}</p>}
        </div>

        {/* Botón dinámico según estado de carga */}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 bg-accent hover:bg-accent-hover text-primary font-bold py-3 rounded-lg shadow-soft hover:shadow-hover transition-all mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Ingresando...
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </button>

        <div className="text-right">
          <Link to="/forgot-password" className="text-accent hover:text-accent-hover text-sm font-medium">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <p className="text-center text-slate-600 text-sm mt-6">
          ¿Aún no tienes una cuenta? <Link to="/register" className="text-accent font-bold hover:underline">Regístrate aquí</Link>
        </p>
      </form>
    </AuthLayout>
  );
}