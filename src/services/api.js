import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-4-mez9.onrender.com/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor para añadir el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔑 Token en localStorage:', token ? '✅ Existe' : '❌ No existe');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📤 Authorization header añadido');
    } else {
      console.warn('⚠️ No hay token disponible');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    console.log('📥 Respuesta recibida:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ Error en petición:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('🔒 Token expirado o inválido, redirigiendo a login...');
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;