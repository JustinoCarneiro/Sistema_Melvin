import http from '../http';

const post = {
    async discente(dados){
        const endpoint = "/discente";
        
        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1013:Erro ao cadastrar discente:', error.response ? error.response.dados : error.message);
        }
    },

    async voluntario(dados){
        const endpoint = "/voluntario";

        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1014:Erro ao cadastrar voluntario:', error.response ? error.response.dados : error.message);
        }
    },

    async voluntario(dados){
        const endpoint = "/voluntario";

        try{
            console.log("dados:", dados);
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1015:Erro ao cadastrar voluntario:', error.response ? error.response.dados : error.message);
        }
    },

    async frequenciadiscente(dados){
        const endpoint = "/frequenciadiscente";

        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1016:Erro ao cadastrar frequência de discente:', error.response ? error.response.dados : error.message);
        }
    },

    async frequenciavoluntario(dados){
        const endpoint = "/frequenciavoluntario";

        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1017:Erro ao cadastrar frequência de voluntario:', error.response ? error.response.dados : error.message);
        }
    },

    async uploadDiario(dados){
        const endpoint = "/diarios/upload";

        const formData = new FormData();
        formData.append('file', dados.file);
        formData.append('matriculaAtrelada', dados.matricula); 
         
        try{
            const response = await http.post(endpoint, formData,{
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                console.log("Diário atualizado ou carregado com sucesso:", response.data);
            } else {
                console.log("Diário não foi atualizado ou carregado, mas não é um erro crítico.");
            }
            
            return response;
        }catch(error){
            console.error('1027:Erro ao fazer upload de diário:', error.response ? error.response.dados : error.message);
        }
    },

    async registrarvoluntario(dados){
        const endpoint = "/auth/register";

        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1025:Erro ao registrar voluntario:', error.response ? error.response.dados : error.message);
        }
    }
}

export default post;