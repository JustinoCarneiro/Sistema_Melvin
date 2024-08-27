import http from '../http';

const put = {
    async discente(dados){
        const endpoint = "/discente";

        try{
            const response = await http.put(endpoint, dados);
            return response;
        }catch(error){
            console.error('1018:Erro ao alterar dados dos discentes:', error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async voluntario(dados){
        const endpoint = "/voluntario";

        try{
            const response = await http.put(endpoint, dados);
            return response;
        }catch(error){
            console.error('1018:Erro ao alterar dados dos voluntarios:', error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async frequenciadiscente(dados){
        const endpoint = "/frequenciadiscente";

        try{
            const response = await http.put(endpoint, dados);
            return response;
        }catch(error){
            console.error('1018:Erro ao alterar dados das frequências dos discentes:', error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async frequenciavoluntario(dados){
        const endpoint = "/frequenciavoluntario";

        try{
            const response = await http.put(endpoint, dados);
            return response;
        }catch(error){
            console.error('1018:Erro ao alterar dados das frequências dos voluntarios:', error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async atualizarDiario(dados){
        console.log("dados diario:", dados);
        // Forma o endpoint usando a matrícula presente nos dados
        let endpoint = `/diarios/atualizar/${dados.matricula}`;

        // Cria um FormData para enviar o arquivo e outros dados
        const formData = new FormData();
        formData.append('file', dados.file);  // Adiciona o arquivo
        formData.append('matriculaAtrelada', dados.matricula);  // Adiciona a matrícula, se necessário para o backend


        try{
            const response = await http.put(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                console.log("dados diario:", dados);
                console.log("Diário atualizado ou carregado com sucesso:", response.data);
            } else {
                console.log("Diário não foi atualizado ou carregado, mas não é um erro crítico.");
            }
            
            return response;
        }catch(error){
            console.log("1018:Error ao atualizar diário:", error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async alterarsenha(matricula, nova_senha){
        let endpoint = `/auth/alterar_senha/${matricula}/${nova_senha}`;

        try{
            const response = await http.put(endpoint);
            return response;
        }catch(error){
            console.log("1018:Erro ao alterar senha do usuário:", error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async embaixadores(dados){
        const endpoint="/embaixador";

        try{
            const response = await http.put(endpoint, dados);
            console.log("response", response);
            return response;
        }catch(error){
            console.log("1018:Erro ao alterar dados do embaixador:", error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async amigosmelvin(dados){
        const endpoint="/amigomelvin";

        try{
            const response = await http.put(endpoint, dados);
            console.log("response", response);
            return response;
        }catch(error){
            console.log("1018:Erro ao alterar dados do embaixador:", error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async alterarRole(matricula, novaRole){
        let endpoint = `/auth/alterar_role/${matricula}/${novaRole}`;

        try{
            const response = await http.put(endpoint);
            return response;
        }catch(error){
            console.log("1018:Erro ao alterar role do usuário:", error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async imagem(id, tipo, dados){
        let endpoint = `/imagens/atualizar/${id}/${tipo}`;
        console.log("dados", dados);

        const formData = new FormData();
        formData.append('file', dados);
        
        try{ 
            const response = await http.put(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.status === 200) {
                console.log("Imagem atualizada com sucesso:", response.data);
            } else {
                console.log("A imagem não foi atualizada, mas não é um erro crítico.");
            }

            return response;

        }catch(error){
            console.log("1018:Erro ao atualizar imagem:", error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async aviso(dados){
        const endpoint="/aviso";

        try{
            const response = await http.put(endpoint, dados);
            return response;
        }catch(error){
            console.log("1018:Erro ao alterar dados do embaixador:", error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    },

    async aviso(dados){
        const endpoint="/cestas";

        try{
            const response = await http.put(endpoint, dados);
            return response;
        }catch(error){
            console.log("1018:Erro ao alterar dados da entrega da cesta:", error.response ? error.response.dados : error.message);
            return Promise.reject(error);
        }
    }
}

export default put;