import http from './http';

const discenteService = {
    async list(searchTerm = '') {
        let endpoint = "/discente";
        if (searchTerm) {
            endpoint += `?search=${encodeURIComponent(searchTerm)}`;
        }
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter dados dos discentes:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async getByMatricula(matricula) {
        const endpoint = `/discente/matricula/${matricula}`;
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter dados do discente por matrícula:', error.response?.data || error.message);
            return Promise.reject(error);
        }
    },

    get(matricula) {
        return this.getByMatricula(matricula);
    },

    async create(dados) {
        const endpoint = "/discente";
        try {
            const response = await http.post(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao cadastrar discente:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async update(dados) {
        const endpoint = "/discente";
        try {
            const response = await http.put(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao alterar dados do discente:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async updateAvaliacoes(matricula, dados) {
        const endpoint = `/discente/${matricula}/avaliacoes`;
        try {
            const response = await http.put(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao salvar avaliações do discente:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async delete(matricula) {
        const endpoint = `/discente/${matricula}`;
        try {
            const response = await http.delete(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao deletar discente:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async export(searchTerm = '') {
        let endpoint = "/discente/export";
        if (searchTerm) {
            endpoint += `?search=${encodeURIComponent(searchTerm)}`;
        }
        try {
            const response = await http.get(endpoint, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'discentes.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Erro ao exportar discentes:', error);
            return Promise.reject(new Error("Falha ao exportar os dados."));
        }
    },

    async getAvaliacoes(matricula) {
        const endpoint = `/avaliacoes/aluno/${matricula}`;
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter avaliações:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async createAvaliacao(dados) {
        const endpoint = "/avaliacoes";
        try {
            const response = await http.post(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao registrar avaliação:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    }
};

export default discenteService;
