import { create } from 'zustand';
import { authService } from '../services/authService';

// Recuperar sesión previa si el usuario recarga la página
const storedUser = JSON.parse(localStorage.getItem('user_profile') || 'null');
const storedToken = localStorage.getItem('access_token');

const useAuthStore = create((set) => ({

  // Estado inicial
  user: storedUser,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,

  // Acción para iniciar sesión
  loginAction: async (correo, clave) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(correo, clave);
      
      // Adaptar según la estructura exacta de tu backend
      const accessToken = data.data.accessToken;
      const usuario = data.data.usuario; 

      // 1. Guardar en almacenamiento local (Persistencia)
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('user_profile', JSON.stringify(usuario));

      // 2. Actualizar la memoria de React
      set({ 
        user: usuario, 
        isAuthenticated: true, 
        isLoading: false 
      });

      return usuario; // Lo retornamos para decidir a qué ruta enviarlo
    } catch (error) {
      // Capturamos el error estandarizado del backend
      const message = error.response?.data?.message || 'Ocurrió un error al conectar con el servidor.';
      set({ error: message, isLoading: false, isAuthenticated: false });
      throw error; 
    }
  },

  // Acción para cerrar sesión
  logoutAction: async () => {
    try {
      await authService.logout(); // Destruye la cookie en el backend
    } catch (error) {
      console.error("Error al hacer logout en el servidor", error);
    } finally {
      // Limpieza local forzada (independientemente de la respuesta del backend)
      localStorage.clear()
      set({ user: null, isAuthenticated: false });
      window.location.href = '/login'; 
    }
  },
  
  // Limpiar errores (útil cuando el usuario empieza a escribir de nuevo)
  clearError: () => set({ error: null })
}));

export default useAuthStore;