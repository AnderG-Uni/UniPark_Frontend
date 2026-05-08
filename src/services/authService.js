import api from './api';

export const authService = {
  login: async (correo, clave) => {
    // Usamos nuestra instancia 'api' que ya tiene configurado el baseURL y CORS
    const response = await api.post('/auth/login', { correo, clave });
    return response.data;
  },
  
  registro: async (datosEstudiante) => {
    const response = await api.post('/auth/registro', datosEstudiante);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};