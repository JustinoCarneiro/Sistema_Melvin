import http from './http';

const dashboardService = {
    async getPresentes() {
        const endpoint = "/dashboard/presentes";
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter presentes do dia:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || "Erro ao buscar presentes."));
        }
    },

    async getRanking(sortBy = 'media') {
        const endpoint = `/dashboard/ranking?sortBy=${sortBy}`;
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter ranking de alunos:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || "Erro ao buscar ranking."));
        }
    },

    async getAvisos() {
        const endpoint = "/dashboard/avisos";
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter avisos do dashboard:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || "Erro ao buscar avisos."));
        }
    }
};

export default dashboardService;
