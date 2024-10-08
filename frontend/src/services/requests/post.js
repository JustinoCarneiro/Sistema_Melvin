import http from '../http';

const post = {
    async discente(dados){
        const endpoint = "/discente";
        
        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1013:Erro ao cadastrar discente:', error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async voluntario(dados){
        const endpoint = "/voluntario";

        try{
            console.log("dados:", dados);
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1013:Erro ao cadastrar voluntario:', error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async frequenciadiscente(dados){
        const endpoint = "/frequenciadiscente";

        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1013:Erro ao cadastrar frequência de discente:', error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async frequenciavoluntario(dados){
        const endpoint = "/frequenciavoluntario";

        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1013:Erro ao cadastrar frequência de voluntario:', error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async uploadDiario(dados){
        const endpoint = "/diarios/upload";

        console.log("dados diario:", dados);
        
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
            console.error('1013:Erro ao fazer upload de diário:', error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async embaixadores(dados){
        const endpoint = "/embaixador";

        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1013:Erro ao registrar embaixador:', error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async amigosmelvin(dados){
        const endpoint = "/amigomelvin";

        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1013:Erro ao registrar amigo do melvin:', error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async imagem(id, tipo, dados){
        const endpoint = `/imagens/upload/${id}/${tipo}`;

        const formData = new FormData();
        formData.append('file', dados);
        
        try{
            const response = await http.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.status === 200) {
                console.log("Upload de imagem com sucesso:", response.data);
            } else {
                console.log("Upload da imagem falhou, mas não é um erro crítico.");
            }

            return response;
        }catch(error){
            console.error('1013:Erro ao fazer upload de imagem:', error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async aviso(dados){
        const endpoint = "/aviso";

        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1013:Erro ao registrar aviso:', error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async cestas(dados){
        const endpoint = "/cestas";

        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1013:Erro ao registrar entrega de cesta:', error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    }
}

export default post;