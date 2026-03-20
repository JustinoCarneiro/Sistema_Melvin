import http from './http';

const diarioService = {
    async getByMatricula(matricula) {
        const endpoint = `/diarios/captura/${matricula}`;
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter diário por matrícula:', error.response?.data || error.message);
            return Promise.reject(error);
        }
    },

    get(matricula) {
        return this.getByMatricula(matricula);
    },

    async upload(file, matricula) {
        const endpoint = "/diarios/upload";
        const formData = new FormData();
        formData.append('file', file);
        formData.append('matriculaAtrelada', matricula);
        try {
            const response = await http.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response;
        } catch (error) {
            console.error('Erro ao fazer upload de diário:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async update(file, matricula) {
        const endpoint = `/diarios/atualizar/${matricula}`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('matriculaAtrelada', matricula);
        try {
            const response = await http.put(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response;
        } catch (error) {
            console.error("Erro ao atualizar diário:", error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async delete(matricula) {
        const endpoint = `/diarios/delete/${matricula}`;
        try {
            const response = await http.delete(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao deletar diário:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async download(matricula, filename = 'documento.pdf') {
        const endpoint = `/diarios/download/${matricula}`;
        try {
            const response = await http.get(endpoint, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao baixar o arquivo:', error.response?.data || error.message);
            return Promise.reject(error);
        }
    }
};

export default diarioService;
