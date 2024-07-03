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
            console.error('1022:Erro ao obter dados dos discentes por matricula:', error.response ? error.response.data : error.message);
        }
    },
    async voluntario(){
        const endpoint = "/voluntario";
        
        try{
            const response = await http.get(endpoint);
            return response;
        }catch(error){
            console.error('1010:Erro ao obter dados dos voluntarios:', error.response ? error.response.data : error.message);
        }
    },
    async voluntarioByMatricula(matricula){
        const endpoint = `/voluntario/matricula/${matricula}`;

        try{
            const response = await http.get(endpoint);
            console.log('response:', response);
            return response;
        }catch{
            console.error('1023:Erro ao obter dados dos voluntarios por matricula:', error.response ? error.response.data : error.message);
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
            console.error('1011:Erro ao obter dados das frequências dos discente:', error.response ? error.response.data : error.message);
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
            console.error('1012:Erro ao obter dados das frequências dos voluntario:', error.response ? error.response.data : error.message);
        }
    },
    async diarioByMatricula(matricula){
        let endpoint =`/diarios/captura/${matricula}`;

        try{
            const response = await http.get(endpoint);
            return response;
        }catch(error){
            console.error('1028:Erro ao obter dados das frequências dos voluntario:', error.response ? error.response.data : error.message);
        }
    },
    async downloadFile(matricula, filename){
        console.log("filename", filename);
        const endpoint = `/diarios/download/${matricula}`;

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
    }
}

export default get;