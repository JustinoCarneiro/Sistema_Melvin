import http from './http';

const embaixadorService = {
    async list() {
        const endpoint = "/embaixador";
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter dados dos embaixadores:', error.response?.data || error.message);
            return Promise.reject(error);
        }
    },

    async create(dados) {
        const endpoint = "/embaixador";
        try {
            const response = await http.post(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao registrar embaixador:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async update(dados) {
        const endpoint = "/embaixador";
        try {
            const response = await http.put(endpoint, dados);
            return response;
        } catch (error) {
            console.error("Erro ao alterar dados do embaixador:", error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    }
};

export default embaixadorService;
