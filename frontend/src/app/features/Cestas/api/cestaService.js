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

    // --- US-7.4: Solicitação com agendamento e check-in por QR Code ---

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

    async checkin(qrCodeToken) {
        const endpoint = `/cestas/checkin/${qrCodeToken}`;
        try {
            const response = await http.post(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao fazer check-in da cesta:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data || error.message));
        }
    },

    // Busca o PNG do QR Code autenticado e devolve como object URL (o <img> não
    // consegue mandar o header Authorization sozinho).
    async getQrCodeUrl(qrCodeToken) {
        const endpoint = `/cestas/qrcode/${qrCodeToken}`;
        try {
            const response = await http.get(endpoint, { responseType: 'blob' });
            return window.URL.createObjectURL(response.data);
        } catch (error) {
            console.error('Erro ao gerar QR Code:', error.response?.data || error.message);
            return Promise.reject(new Error('Falha ao gerar QR Code.'));
        }
    }
};

export default cestaService;
