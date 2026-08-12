import http from '@core/services/http';

const cestaService = {
    async list() {
        const endpoint = "/cestas";
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter lista de cestas entregas:', error.response?.data || error.message);
            return Promise.reject(error);
        }
    },

    async create(dados) {
        const endpoint = "/cestas";
        try {
            const response = await http.post(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao registrar entrega de cesta:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async update(dados) {
        const endpoint = "/cestas";
        try {
            const response = await http.put(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao alterar dados da entrega da cesta:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async delete(id) {
        const endpoint = `/cestas/${id}`;
        try {
            const response = await http.delete(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao deletar entrega de cesta:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    // --- US-7.4: Solicitação com agendamento e confirmação manual de entrega ---

    // Endpoint público — usado pelo link que o líder recebe, sem autenticação.
    async solicitar(dados) {
        const endpoint = "/cestas/solicitacao";
        try {
            const response = await http.post(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao enviar solicitação de cesta:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async listarSolicitacoes() {
        const endpoint = "/cestas/solicitacoes";
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter solicitações de cesta:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async validar(id, dataRetirada) {
        const endpoint = `/cestas/solicitacao/${id}/validar`;
        try {
            const response = await http.put(endpoint, { dataRetirada });
            return response;
        } catch (error) {
            console.error('Erro ao validar solicitação:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async listarAgendadas() {
        const endpoint = "/cestas/solicitacoes/agendadas";
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter cestas agendadas:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async confirmarEntrega(id) {
        const endpoint = `/cestas/solicitacao/${id}/confirmar-entrega`;
        try {
            const response = await http.post(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao confirmar entrega da cesta:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data || error.message));
        }
    }
};

export default cestaService;
