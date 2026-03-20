import http from './http';

const imagemService = {
    async getById(id, tipo) {
        const endpoint = `/imagens/captura/${id}/${tipo}`;
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter dados da imagem:', error.response?.data || error.message);
            return Promise.reject(error);
        }
    },

    async list() {
        const endpoint = "/imagens/lista";
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter lista de imagens:', error.response?.data || error.message);
            return Promise.reject(error);
        }
    },

    async upload(id, tipo, file) {
        const endpoint = `/imagens/upload/${id}/${tipo}`;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await http.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response;
        } catch (error) {
            console.error('Erro ao fazer upload de imagem:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async update(id, tipo, file) {
        const endpoint = `/imagens/atualizar/${id}/${tipo}`;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await http.put(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response;
        } catch (error) {
            console.error("Erro ao atualizar imagem:", error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    }
};

export default imagemService;
