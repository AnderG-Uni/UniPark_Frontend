import axios from 'axios';

// 1. Instancia Base
const api = axios.create({
  // Idealmente esto vendría de un archivo .env (import.meta.env.VITE_API_URL)
  baseURL: import.meta.env.VITE_API_URL,
  
  // CRÍTICO: Permite que el navegador envíe y guarde la Cookie HttpOnly del Refresh Token
  withCredentials: true, 
  
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor de Peticiones (Request)
// Antes de que cualquier petición salga al backend, Axios pasa por aquí.
api.interceptors.request.use(
  (config) => {
    // Buscamos el Access Token en el almacenamiento local
    const token = localStorage.getItem('access_token');
    
    // Si existe, lo inyectamos en la cabecera Authorization (Estándar Bearer)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Interceptor de Respuestas (Response)
// Evalúa la respuesta del backend antes de entregarla a tus componentes (Páginas).
api.interceptors.response.use(
  (response) => {
    // Si todo salió bien (Status 2xx), entregamos la respuesta intacta
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // LÓGICA DE RENOVACIÓN DE TOKEN (Refresh Token)
    // Si el backend dice 401 (Token Expirado/Inválido) y no hemos reintentado ya...
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/refresh'
    ) {
      originalRequest._retry = true; // Marcamos para no entrar en un bucle infinito

      try {
        // Intentamos renovar el token en silencio. 
        // La cookie con el Refresh Token viaja automáticamente gracias a withCredentials: true
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {}, 
          { withCredentials: true }
        );
        
        // Si el backend nos da un nuevo token, lo actualizamos en el almacenamiento
        const newAccessToken = refreshResponse.data.data.accessToken; 
        localStorage.setItem('access_token', newAccessToken);

        // Actualizamos la cabecera de la petición original que había fallado y la reintentamos
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest); // Repetimos la petición como si nada hubiera pasado

      } catch (refreshError) {
        // Si el refresh también falla (ej. el Refresh Token expiró o fue revocado),
        // destruimos la sesión local y expulsamos al usuario al Login.
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_profile');
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }

    // Si es otro tipo de error (400, 403 Forbidden por PBAC, 404, 500), 
    // lo pasamos al componente para que muestre un mensaje en pantalla.
    return Promise.reject(error);
  }
);

export default api;