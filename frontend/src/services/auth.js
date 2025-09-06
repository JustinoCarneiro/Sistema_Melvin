import http from './http';
import Cookies from 'js-cookie';

const auth = {
    async authentication(data) {
        const endpoint = "/auth/login";

        try {
            const response = await http.post(endpoint, data);
            
            const { token, role } = response.data;
            
            Cookies.set('token', token, { sameSite: 'Lax', secure: false });
            Cookies.set('role', role, { sameSite: 'Lax', secure: false });
            
            return response;
        } catch (error) {
            console.error('3001:Erro no serviço de autenticação:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data?.message || 'Matrícula ou senha inválida.';
            return Promise.reject(new Error(errorMessage));
        }
    },

    async registrar(dados){
        const endpoint = "/auth/register";

        try{
            console.log("response dados pré-post: ", dados);
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
            return Promise.reject(error);
        }
    }
};

export default auth;