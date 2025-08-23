import http from '../http';

const post = {
    async discente(dados){
        const endpoint = "/discente";
        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1013:Erro ao cadastrar discente:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async voluntario(dados){
        const endpoint = "/voluntario";
        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1013:Erro ao cadastrar voluntario:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async frequenciadiscente(dados){
        const endpoint = "/frequenciadiscente";
        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1013:Erro ao cadastrar frequência de discente:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async frequenciavoluntario(dados){
        const endpoint = "/frequenciavoluntario";
        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1013:Erro ao cadastrar frequência de voluntario:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
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
            return response;
        }catch(error){
            console.error('1013:Erro ao fazer upload de diário:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async embaixadores(dados){
        const endpoint = "/embaixador";
        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1013:Erro ao registrar embaixador:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async amigosmelvin(dados){
        const endpoint = "/amigomelvin";
        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1013:Erro ao registrar amigo do melvin:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
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
            return response;
        }catch(error){
            console.error('1013:Erro ao fazer upload de imagem:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async aviso(dados){
        const endpoint = "/aviso";
        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1013:Erro ao registrar aviso:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async cestas(dados){
        const endpoint = "/cestas";
        try{
            const response = await http.post(endpoint, dados);
            return response;
        }catch(error){
            console.error('1013:Erro ao registrar entrega de cesta:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },
    async avaliacao(dados) {
        const endpoint = "/avaliacoes";
        try {
            const response = await http.post(endpoint, dados);
            return response;
        } catch (error) {
            console.error('Erro ao registrar avaliação:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    }
}

export default post;