import http from '../http';

const get = {
    async discente(sala){
        let endpoint = "/discente";

        if(sala){
            endpoint += `/sala/${sala}`;
        }
        
        try{
            const response = await http.get(endpoint);
            return response;
        }catch(error){
            console.error('1009:Erro ao obter dados dos discentes:', error.response ? error.response.data : error.message);
        }
    },
    async discenteByMatricula(matricula){
        let endpoint = `/discente/matricula/${matricula}`;
        try{
            const response = await http.get(endpoint);
            return response;
        }catch(error){
            console.error('1009:Erro ao obter dados dos discentes por matricula:', error.response ? error.response.data : error.message);
        }
    },
    async voluntario(){
        const endpoint = "/voluntario";
        
        try{
            const response = await http.get(endpoint);
            return response;
        }catch(error){
            console.error('1009:Erro ao obter dados dos voluntarios:', error.response ? error.response.data : error.message);
        }
    },
    async voluntarioNomesFuncoes(){
        const endpoint = "/voluntario/nomesfuncoes";
        
        try{
            const response = await http.get(endpoint);
            return response;
        }catch(error){
            console.error('1009:Erro ao obter nomes e funções dos voluntarios:', error.response ? error.response.data : error.message);
        }
    },
    async voluntarioByMatricula(matricula){
        const endpoint = `/voluntario/matricula/${matricula}`;

        try{
            const response = await http.get(endpoint);
            console.log('response:', response);
            return response;
        }catch{
            console.error('1009:Erro ao obter dados dos voluntarios por matricula:', error.response ? error.response.data : error.message);
        }
    },
    async frequenciavoluntario(data, matricula){
        let endpoint = "/frequenciavoluntario";

        if(data && matricula){
            endpoint+=`/${data}/${matricula}`;
        } else if (data){
            endpoint+=`/${data}`;
        }
        
        try{
            console.log("endpoint:", endpoint)
            const response = await http.get(endpoint);
            console.log("resposta get:", response);
            return response;
        }catch(error){
            console.error('1009:Erro ao obter dados das frequências dos discente:', error.response ? error.response.data : error.message);
        }
    },
    async frequenciadiscente(data, matricula){
        let endpoint = "/frequenciadiscente";
        
        if(data && matricula){
            endpoint+=`/${data}/${matricula}`;
        } else if (data){
            endpoint+=`/${data}`;
        }

        try{
            const response = await http.get(endpoint);
            return response;
        }catch(error){
            console.error('1009:Erro ao obter dados das frequências dos voluntario:', error.response ? error.response.data : error.message);
        }
    },
    async diarioByMatricula(matricula){
        let endpoint =`/diarios/captura/${matricula}`;

        try{
            const response = await http.get(endpoint);
            return response;
        }catch(error){
            console.error('1009:Erro ao obter dados das frequências dos voluntario:', error.response ? error.response.data : error.message);
        }
    },
    async downloadFile(matricula, filename){
        console.log("filename", filename);
        let endpoint = `/diarios/download/${matricula}`;

        // Nome padrão do arquivo se não for fornecido ou extraído
        if (filename == null) {
            filename = 'documento.pdf';
        }

        try{
            const response = await http.get(endpoint, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename; // Nome do arquivo a ser baixado
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        }catch(error){
            console.error('Erro ao baixar o arquivo:', error.response ? error.response.data : error.message);
        }
    },
    async embaixadores(){
        const endpoint = "/embaixador";

        try{
            const response = await http.get(endpoint);
            console.log("response embaixadores:", response);
            return response;
        }catch(error){
            console.error('1009:Erro ao obter dados dos embaixadores:', error.response ? error.response.data : error.message);
        }
    },
    async amigosmelvin(){
        const endpoint = "/amigomelvin";

        try{
            const response = await http.get(endpoint);
            return response;
        }catch(error){
            console.error('1009:Erro ao obter dados dos amigos do melvin:', error.response ? error.response.data : error.message);
        }
    },
    async imagemPorId(id, tipo){
        let endpoint = `/imagens/captura/${id}/${tipo}`;

        try{
            console.log("id:", id);
            console.log("tipo:", tipo);
            const response = await http.get(endpoint);
            console.log("response get:", response);
            return response;
        }catch(error){
            console.error('1009:Erro ao obter dados da imagem:', error.response ? error.response.data : error.message);
        }
    },
    async imagemlista(){
        const endpoint = "/imagens/lista";

        try{
            const response = await http.get(endpoint);
            return response;
        }catch(error){
            console.error('1009:Erro ao obter lista de imagens:', error.response ? error.response.data : error.message);
        }
    },
    async aviso(){
        const endpoint = "/aviso";

        try{
            const response = await http.get(endpoint);
            return response;
        }catch(error){
            console.error('1009:Erro ao obter lista de avisos:', error.response ? error.response.data : error.message);
        }
    }
}

export default get;