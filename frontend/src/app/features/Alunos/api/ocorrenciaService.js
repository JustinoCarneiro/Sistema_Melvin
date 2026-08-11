import http from '@core/services/http';

const ocorrenciaService = {
    async listarPorDiscente(matricula) {
        const endpoint = `/ocorrencias/discente/${matricula}`;
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter ocorrências do discente:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async create(dados) {
        const endpoint = "/ocorrencias";
        try {
            const response = await http.post(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao registrar ocorrência:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    }
};

export default ocorrenciaService;
