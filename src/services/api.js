import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true, // Importante para enviar cookies de sessão/JWT
});

// Interceptador para lidar com erros globais (ex: 401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Se der 401, removemos os dados de usuário do localStorage/contexto
            // O próprio AuthContext lidará com redirecionamento dependendo da implementação
        }
        return Promise.reject(error);
    }
);

export default api;
