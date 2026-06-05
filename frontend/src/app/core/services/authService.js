import http from './http';
import Cookies from 'js-cookie';

const authService = {
    async login(data) {
        const endpoint = "/auth/login";
        try {
            const response = await http.post(endpoint, data);
            const { token, role } = response.data;
            Cookies.set('token', token, { sameSite: 'Lax', secure: false, path: '/' });
            Cookies.set('role', role, { sameSite: 'Lax', secure: false, path: '/' });
            return response;
        } catch (error) {
            console.error('Erro no serviço de autenticação:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || 'Matrícula ou senha inválida.';
            return Promise.reject(new Error(errorMessage));
        }
    },

    async register(dados) {
        const endpoint = "/auth/register";
        try {
            const response = await http.post(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao registrar usuário:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data || error.message));
        }
    },

    async getRole(matricula) {
        const endpoint = `/auth/role_${matricula}`;
        const token = Cookies.get('token');
        if (!token) return Promise.reject(new Error('Token não encontrado'));

        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter role de usuário:', error.response?.data || error.message);
            return Promise.reject(error);
        }
    },

    async updatePassword(matricula, newPassword) {
        const endpoint = `/auth/alterar_senha`;
        try {
            const response = await http.put(endpoint, { login: matricula, newPassword });
            return response;
        } catch (error) {
            console.error('Erro ao alterar senha:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async updateRole(matricula, novaRole) {
        const endpoint = `/auth/alterar_role/${matricula}/${novaRole}`;
        try {
            const response = await http.put(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao alterar role:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async logout() {
        try {
            const cookiesToClear = ['token', 'role', 'login'];
            cookiesToClear.forEach(cookieName => {
                Cookies.remove(cookieName, { path: '/' });
                Cookies.remove(cookieName);
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;
            });
        } catch (error) {
            console.error('Erro ao deslogar:', error);
            return Promise.reject(error);
        }
    }
};

export default authService;
