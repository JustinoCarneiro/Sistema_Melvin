import http from './http';

const frequenciaService = {
    async listDiscente(data, matricula) {
        let endpoint = "/frequenciadiscente";
        if (data && matricula) {
            endpoint += `/${data}/${matricula}`;
        } else if (data) {
            endpoint += `/${data}`;
        }
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter frequências dos discentes:', error.response?.data || error.message);
            return Promise.reject(error);
        }
    },

    async listVoluntario(data, matricula) {
        let endpoint = "/frequenciavoluntario";
        if (data && matricula) {
            endpoint += `/${data}/${matricula}`;
        } else if (data) {
            endpoint += `/${data}`;
        }
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter frequências dos voluntários:', error.response?.data || error.message);
            return Promise.reject(error);
        }
    },

    async createDiscente(dados) {
        const endpoint = "/frequenciadiscente";
        try {
            const response = await http.post(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao cadastrar frequência de discente:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async createVoluntario(dados) {
        const endpoint = "/frequenciavoluntario";
        try {
            const response = await http.post(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao cadastrar frequência de voluntário:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async updateDiscente(dados) {
        const endpoint = "/frequenciadiscente";
        try {
            const response = await http.put(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao alterar frequência do discente:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async updateVoluntario(dados) {
        const endpoint = "/frequenciavoluntario";
        try {
            const response = await http.put(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao alterar frequência do voluntário:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async deleteDiscente(dados) {
        const endpoint = `/frequenciadiscente/${dados.matricula}/${dados.data}`;
        try {
            const response = await http.delete(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao deletar frequência do discente:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async deleteVoluntario(dados) {
        const endpoint = `/frequenciavoluntario/${dados.matricula}/${dados.data}`;
        try {
            const response = await http.delete(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao deletar frequência do voluntário:', error.response?.data || error.message);
            return Promise.reject(new Error(error.response?.data?.message || error.message));
        }
    },

    async exportDiscente(mes, ano, sala, turno, busca) {
        const mesBackend = parseInt(mes) + 1;
        let endpoint = `/frequenciadiscente/export?mes=${mesBackend}&ano=${ano}`;
        if (sala && sala !== 'todos') endpoint += `&sala=${sala}`;
        if (turno && turno !== 'todos') endpoint += `&turno=${turno}`;
        if (busca) endpoint += `&busca=${encodeURIComponent(busca)}`;

        try {
            const response = await http.get(endpoint, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Frequencia_${mesBackend}_${ano}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Erro ao exportar frequência:', error);
            return Promise.reject(new Error("Falha ao exportar frequência."));
        }
    }
};

export default frequenciaService;
