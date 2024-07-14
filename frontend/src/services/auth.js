import http from './http';
import Cookies from 'js-cookie';

const auth = {
    async authentication(data) {
        const endpoint = "/auth/login";

        try{
            const response = await http.post(endpoint, data);
            if (response.data && response.data.token) {
                Cookies.set('token', response.data.token, { 
                    expires: 0.5, 
                    sameSite: 'Lax',
                    secure: false
                });
                Cookies.set('login', data.login, { 
                    expires: 0.5, 
                    sameSite: 'Lax',
                    secure: false
                });
            }
            return response;
        } catch(error){
            console.error('1000:Erro ao fazer login:', error.response ? error.response.data : error.message);
            return { error: true, message: error.response ? (error.response.data || error.response.statusText) : error.message };
        }
    },

    async registrar(dados){
        const endpoint = "/auth/register";

        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1001:Erro ao registrar usuário:', error.response ? error.response.dados : error.message);
            return { error: true, message: error.response ? error.response.dados : error.message };
        }
    }, 

    async receberRole(matricula){
        const endpoint = `/auth/role_${matricula}`;
        const token = Cookies.get('token');

        if (!token) {
            console.error('1002:Token não encontrado');
            return { error: true, message: 'Token não encontrado' };
        }

        try{
            const response = await http.get(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response;
        } catch(error){
            console.error('1003:Erro ao obter role de usuário:', error.response ? error.response.data : error.message);
            return { error: true, message: error.response ? error.response.data : error.message };
        }
    },

    async deslogar(){
        try {
            Cookies.remove('token');
            Cookies.remove('login');
        } catch (error) {
            console.error('1004:Erro ao deslogar:', error);
        }
    }
};

export default auth;