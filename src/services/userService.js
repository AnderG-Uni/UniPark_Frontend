import api from './api';

export const userService = {
  // Obtenemos los datos completos de la Persona usando su ID
  getPerfilCompleto: async (personaId) => {
    // Esto llama a GET /api/v1/personas/:id
    const response = await api.get(`/personas/${personaId}`);
    return response.data; // El backend debería responder con la info de la persona
  }
};