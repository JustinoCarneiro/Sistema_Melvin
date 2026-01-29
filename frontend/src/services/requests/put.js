import http from '../http';

const put = {
    async discente(dados){
        const endpoint = "/discente";
        try{
            const response = await http.put(endpoint, dados);
            return response;
        }catch(error){
            console.error('1018:Erro ao alterar dados dos discentes:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    // NOVO MÉTODO PARA ATUALIZAR AS AVALIAÇÕES
    async discenteAvaliacoes(matricula, dados) {
        const endpoint = `/discente/${matricula}/avaliacoes`;
        try {
            const response = await http.put(endpoint, dados);
            return response;
        } catch(error) {
            console.error('Erro ao salvar avaliações do discente:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async voluntario(dados){
        const endpoint = "/voluntario";
        try{
            const response = await http.put(endpoint, dados);
            return response;
        }catch(error){
            console.error('1018:Erro ao alterar dados dos voluntarios:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async frequenciadiscente(dados){
        const endpoint = "/frequenciadiscente";
        try{
            const response = await http.put(endpoint, dados);
            return response;
        }catch(error){
            console.error('1018:Erro ao alterar dados das frequências dos discentes:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async frequenciavoluntario(dados){
        const endpoint = "/frequenciavoluntario";
        try{
            const response = await http.put(endpoint, dados);
            return response;
        }catch(error){
            console.error('1018:Erro ao alterar dados das frequências dos voluntarios:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async atualizarDiario(dados){
        const endpoint = `/diarios/atualizar/${dados.matricula}`;
        const formData = new FormData();
        formData.append('file', dados.file);
        formData.append('matriculaAtrelada', dados.matricula);

        try{
            const response = await http.put(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response;
        }catch(error){
            console.error("1018:Error ao atualizar diário:", error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async alterarsenha(matricula, nova_senha){
        const endpoint = `/auth/alterar_senha/${matricula}/${nova_senha}`;
        try{
            const response = await http.put(endpoint);
            return response;
        }catch(error){
            console.error("1018:Erro ao alterar senha do usuário:", error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async embaixadores(dados){
        const endpoint="/embaixador";
        try{
            const response = await http.put(endpoint, dados);
            return response;
        }catch(error){
            console.error("1018:Erro ao alterar dados do embaixador:", error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async amigosmelvin(dados){
        const endpoint="/amigomelvin";
        try{
            const response = await http.put(endpoint, dados);
            return response;
        }catch(error){
            console.error("1018:Erro ao alterar dados do amigo melvin:", error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async alterarRole(matricula, novaRole){
        const endpoint = `/auth/alterar_role/${matricula}/${novaRole}`;
        try{
            const response = await http.put(endpoint);
            return response;
        }catch(error){
            console.error("1018:Erro ao alterar role do usuário:", error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async imagem(id, tipo, dados){
        const endpoint = `/imagens/atualizar/${id}/${tipo}`;
        const formData = new FormData();
        formData.append('file', dados);
        
        try{ 
            const response = await http.put(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response;
        }catch(error){
            console.error("1018:Erro ao atualizar imagem:", error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    // --- CORREÇÃO AQUI ---
    async aviso(dados){
        // Agora o endpoint inclui o ID que vem dentro do objeto 'dados'
        const endpoint = `/aviso/${dados.id}`;
        
        try{
            // Enviamos 'dados' no corpo (o backend vai ignorar o ID repetido no corpo ou usar apenas o da URL)
            const response = await http.put(endpoint, dados);
            return response;
        }catch(error){
            console.error("1018:Erro ao alterar dados do aviso:", error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },

    async cestas(dados){
        const endpoint="/cestas";
        try{
            const response = await http.put(endpoint, dados);
            return response;
        }catch(error){
            console.error("1018:Erro ao alterar dados da entrega da cesta:", error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    }
}

export default put;