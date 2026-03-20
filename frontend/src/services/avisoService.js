import http from './http';

const avisoService = {
    async list() {
        const endpoint = "/aviso";
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter lista de avisos:', error.response?.data || error.message);
            return Promise.reject(error);
        }
    },

    async create(dados) {
        const endpoint = "/aviso";
        try {
            const response = await http.post(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao registrar aviso:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async update(dados) {
        const endpoint = `/aviso/${dados.id}`;
        try {
            const response = await http.put(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao alterar dados do aviso:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    }
};

export default avisoService;
