import http from './http';

const amigoMelvinService = {
    async list() {
        const endpoint = "/amigomelvin";
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter dados dos amigos do melvin:', error.response?.data || error.message);
            return Promise.reject(error);
        }
    },

    async create(dados) {
        const endpoint = "/amigomelvin";
        try {
            const response = await http.post(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao registrar amigo do melvin:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async update(dados) {
        const endpoint = "/amigomelvin";
        try {
            const response = await http.put(endpoint, dados);
            return response;
        } catch (error) {
            console.error("Erro ao alterar dados do amigo melvin:", error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async subscribe(dados) {
        try {
            return await http.post("/amigomelvin/subscribe", dados);
        } catch (error) {
            console.error("Erro ao processar assinatura:", error.response?.data || error.message);
            return Promise.reject(error);
        }
    },

    async oneTimeDonation(dados) {
        try {
            return await http.post("/amigomelvin/one-time", dados);
        } catch (error) {
            console.error("Erro ao processar doação única:", error.response?.data || error.message);
            return Promise.reject(error);
        }
    },

    async sendItemDonation(dados) {
        try {
            return await http.post("/amigomelvin/items", dados);
        } catch (error) {
            console.error("Erro ao processar doação de itens:", error.response?.data || error.message);
            return Promise.reject(error);
        }
    },

    async getStats() {
        try {
            const response = await http.get("/amigomelvin/stats");
            return response.data;
        } catch (error) {
            console.error("Erro ao obter estatísticas dos amigos do melvin:", error.response?.data || error.message);
            return Promise.reject(error);
        }
    }
};

export default amigoMelvinService;
