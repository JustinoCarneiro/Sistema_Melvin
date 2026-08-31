import http from '@core/services/http';

const ocorrenciaTecnicaService = {
    async list() {
        const endpoint = "/ocorrencias-tecnicas";
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter lista de ocorrências técnicas:', error.response?.data || error.message);
            return Promise.reject(error);
        }
    },

    async create(dados) {
        const endpoint = "/ocorrencias-tecnicas";
        try {
            const response = await http.post(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao registrar ocorrência técnica:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async alternarResolvido(id) {
        const endpoint = `/ocorrencias-tecnicas/${id}/alternar-resolvido`;
        try {
            const response = await http.put(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao alternar status da ocorrência técnica:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    }
};

export default ocorrenciaTecnicaService;
