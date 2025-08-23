import http from '../http';

const del = {
    async discente(matricula){
        const endpoint = `/discente/${matricula}`;
        try{
            const response = await http.delete(endpoint);
            return response;
        }catch(error){
            console.error('1005:Erro ao deletar dados dos discentes:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async voluntario(matricula){
        const endpoint = `/voluntario/${matricula}`;
        try{
            const response = await http.delete(endpoint);
            return response;
        }catch(error){
            console.error('1006:Erro ao deletar dados dos voluntarios:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async diario(matricula){
        const endpoint = `/diarios/delete/${matricula}`;
        try{
            const response = await http.delete(endpoint);
            return response;
        }catch(error){
            console.error('1006:Erro ao deletar diario:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async frequenciadiscente(dados){
        const endpoint = `/frequenciadiscente/${dados.matricula}/${dados.data}`;
        try{
            const response = await http.delete(endpoint);
            return response;
        }catch(error){
            console.error('1007:Erro ao deletar dados das frequências dos discentes:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async frequenciavoluntario(dados){
        const endpoint = `/frequenciavoluntario/${dados.matricula}/${dados.data}`;
        try{
            const response = await http.delete(endpoint);
            return response;
        }catch(error){
            console.error('1008:Erro ao deletar dados das frequências dos voluntarios:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async cestas(dados){
        const endpoint = "/cestas";
        try {
            const response = await http.delete(endpoint, { data: dados });
            return response;
        } catch (error) {
            console.error('Erro ao deletar entrega de cesta:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    }
}

export default del;