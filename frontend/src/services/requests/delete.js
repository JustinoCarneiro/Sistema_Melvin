import http from '../http';

const del = {
    async discente(matricula){
        const endpoint = `/discente/${matricula}`;

        try{
            const response = await http.delete(endpoint);
            return response;
        }catch(error){
            console.error('1005:Erro ao deletar dados dos discentes:', error.response ? error.response.matricula : error.message);
        }
    },

    async voluntario(matricula){
        const endpoint = `/voluntario/${matricula}`;

        try{
            const response = await http.delete(endpoint);
            return response;
        }catch(error){
            console.error('1006:Erro ao deletar dados dos voluntarios:', error.response ? error.response.matricula : error.message);
        }
    },

    async frequenciadiscente(dados){
        const endpoint = `/frequenciadiscente/${dados.matricula}/${dados.data}`;

        try{
            const response = await http.delete(endpoint);
            return response;
        }catch(error){
            console.error('1007:Erro ao deletar dados das frequências dos discentes:', error.response ? error.response.dados : error.message);
        }
    },

    async frequenciavoluntario(dados){
        const endpoint = `/frequenciavoluntario/${dados.matricula}/${dados.data}`;

        try{
            const response = await http.delete(endpoint);
            return response;
        }catch(error){
            console.error('1008:Erro ao deletar dados das frequências dos voluntarios:', error.response ? error.response.dados : error.message);
        }
    }
}

export default del;