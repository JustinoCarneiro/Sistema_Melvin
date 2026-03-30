import http from './http';

const voluntarioService = {
    async list(searchTerm = '') {
        let endpoint = "/voluntario";
        if (searchTerm) {
            endpoint += `?search=${encodeURIComponent(searchTerm)}`;
        }
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter dados dos voluntários:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async listNomesFuncoes() {
        const endpoint = "/voluntario/nomesfuncoes";
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter nomes e funções dos voluntários:', error.response?.data || error.message);
            return Promise.reject(error);
        }
    },

    async getByMatricula(matricula) {
        const endpoint = `/voluntario/matricula/${matricula}`;
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter dados do voluntário por matrícula:', error.response?.data || error.message);
            return Promise.reject(error);
        }
    },

    // Alias para manter consistência com outros serviços e componentes de formulário
    async get(matricula) {
        return this.getByMatricula(matricula);
    },

    async create(dados) {
        const endpoint = "/voluntario";
        try {
            const response = await http.post(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao cadastrar voluntário:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async update(dados) {
        const endpoint = "/voluntario";
        try {
            const response = await http.put(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao alterar dados do voluntário:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async delete(matricula) {
        const endpoint = `/voluntario/${matricula}`;
        try {
            const response = await http.delete(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao deletar voluntário:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    }
};

export default voluntarioService;
