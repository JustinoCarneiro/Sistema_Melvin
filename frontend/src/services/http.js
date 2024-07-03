import axios from "axios";
import Cookies from 'js-cookie';

const http = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_FETCH_URL,
    header: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para adicionar o token no header de cada requisição
http.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token && !config.url.includes('/auth/login')) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    }, 
    (error) => {
        return Promise.reject(error);
    }
);

export default http;