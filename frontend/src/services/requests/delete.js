import http from '../http';

const del = {
    async discente(matricula){
        let endpoint = `/discente/${matricula}`;

        try{
            const response = await http.delete(endpoint);
            return response;
        }catch(error){
            console.error('1005:Erro ao deletar dados dos discentes:', error.response ? error.response.matricula : error.message);
            return Promise.reject(error);
        }
    },

    async voluntario(matricula){
        let endpoint = `/voluntario/${matricula}`;

        try{
            const response = await http.delete(endpoint);
            return response;
        }catch(error){
            console.error('1006:Erro ao deletar dados dos voluntarios:', error.response ? error.response.matricula : error.message);
            return Promise.reject(error);
        }
    },

    async diario(matricula){
        let endpoint = `/diarios/delete/${matricula}`;

        try{
            const response = await http.delete(endpoint);
            return response;
        }catch(error){
            console.error('1006:Erro ao deletar ddiario:', error.response ? error.response.matricula : error.message);
            return Promise.reject(error);
        }
    },

    async frequenciadiscente(dados){
        let endpoint = `/frequenciadiscente/${dados.matricula}/${dados.data}`;

        try{
            const response = await http.delete(endpoint);
            return response;
        }catch(error){
            console.error('1007:Erro ao deletar dados das frequências dos discentes:', error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async frequenciavoluntario(dados){
        let endpoint = `/frequenciavoluntario/${dados.matricula}/${dados.data}`;

        try{
            const response = await http.delete(endpoint);
            return response;
        }catch(error){
            console.error('1008:Erro ao deletar dados das frequências dos voluntarios:', error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async cestas(dados){
        const endpoint = "/cestas";
    
        try {
            const response = await http.delete(endpoint, { data: dados });
            return response;
        } catch (error) {
            console.error('Erro ao deletar entrega de cesta:', error.response ? error.response.data : error.message);
            return Promise.reject(error);
        }
    }
    
}

export default del;