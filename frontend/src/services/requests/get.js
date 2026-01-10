import http from '../http';

const get = {
    async discente(searchTerm = '') {
        let endpoint = "/discente";
        
        if (searchTerm) {
            endpoint += `?search=${encodeURIComponent(searchTerm)}`;
        }
        
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('1009:Erro ao obter dados dos discentes:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },
    async discenteByMatricula(matricula){
        let endpoint = `/discente/matricula/${matricula}`;
        try{
            const response = await http.get(endpoint);
            return response;
        }catch(error){
            console.error('1009:Erro ao obter dados dos discentes por matricula:', error.response ? error.response.data : error.message);
            return Promise.reject(error);
        }
    },
    async voluntario(searchTerm = '') {
        let endpoint = "/voluntario";
        if (searchTerm) {
            endpoint += `?search=${encodeURIComponent(searchTerm)}`;
        }
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('1010:Erro ao obter dados dos voluntários:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },
    async voluntarioNomesFuncoes(){
        const endpoint = "/voluntario/nomesfuncoes";
        
        try{
            const response = await http.get(endpoint);
            return response;
        }catch(error){
            console.error('1009:Erro ao obter nomes e funções dos voluntarios:', error.response ? error.response.data : error.message);
            return Promise.reject(error);
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
            return Promise.reject(error);
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
            return Promise.reject(error);
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
            return Promise.reject(error);
        }
    },
    async diarioByMatricula(matricula){
        let endpoint =`/diarios/captura/${matricula}`;

        try{
            const response = await http.get(endpoint);
            return response;
        }catch(error){
            console.error('1009:Erro ao obter dados das frequências dos voluntario:', error.response ? error.response.data : error.message);
            return Promise.reject(error);
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
            return Promise.reject(error);
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
            return Promise.reject(error);
        }
    },
    async amigosmelvin(){
        const endpoint = "/amigomelvin";

        try{
            const response = await http.get(endpoint);
            return response;
        }catch(error){
            console.error('1009:Erro ao obter dados dos amigos do melvin:', error.response ? error.response.data : error.message);
            return Promise.reject(error);
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
            return Promise.reject(error);
        }
    },
    async imagemlista(){
        const endpoint = "/imagens/lista";

        try{
            const response = await http.get(endpoint);
            return response;
        }catch(error){
            console.error('1009:Erro ao obter lista de imagens:', error.response ? error.response.data : error.message);
            return Promise.reject(error);
        }
    },
    async aviso(){
        const endpoint = "/aviso";

        try{
            const response = await http.get(endpoint);
            return response;
        }catch(error){
            console.error('1009:Erro ao obter lista de avisos:', error.response ? error.response.data : error.message);
            return Promise.reject(error);
        }
    },
    async cestas(){
        const endpoint = "/cestas";

        try{
            const response = await http.get(endpoint);
            return response;
        }catch(error){
            console.error('1009:Erro ao obter lista de cestas entregas:', error.response ? error.response.data : error.message);
            return Promise.reject(error);
        }
    },
    async avaliacoesPorMatricula(matricula) {
        const endpoint = `/avaliacoes/aluno/${matricula}`;
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter avaliações:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || error.message;
            return Promise.reject(new Error(errorMessage));
        }
    },
    async exportarDiscentes(searchTerm = '') {
        let endpoint = "/discente/export";
        if (searchTerm) {
            endpoint += `?search=${encodeURIComponent(searchTerm)}`;
        }
        try {
            const response = await http.get(endpoint, {
                responseType: 'blob', // Importante: informa ao axios para esperar um arquivo
            });
            
            // Cria um link temporário para iniciar o download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'discentes.xlsx'); // Nome do arquivo
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            // Retorna uma promessa rejeitada para o componente poder tratar o erro
            return Promise.reject(new Error("Falha ao exportar os dados."));
        }
    },
    async dashboardPresentes() {
        const endpoint = "/dashboard/presentes";
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter presentes do dia:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || "Erro ao buscar presentes.";
            return Promise.reject(new Error(errorMessage));
        }
    },
    async dashboardRanking(sortBy = 'media') {
        const endpoint = `/dashboard/ranking?sortBy=${sortBy}`;
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter ranking de alunos:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || "Erro ao buscar ranking.";
            return Promise.reject(new Error(errorMessage));
        }
    },
    async dashboardAvisos() {
        const endpoint = "/dashboard/avisos";
        try {
            const response = await http.get(endpoint);
            return response;
        } catch (error) {
            console.error('Erro ao obter avisos:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data || "Erro ao buscar avisos.";
            return Promise.reject(new Error(errorMessage));
        }
    },
    async exportarFrequencia(mes, ano, sala, turno, busca) {
        // Ajuste: O backend espera Mês de 1 a 12, mas o JS usa 0 a 11. Vamos somar 1.
        const mesBackend = parseInt(mes) + 1;
        
        let endpoint = `/frequenciadiscente/export?mes=${mesBackend}&ano=${ano}`;
        
        if (sala && sala !== 'todos') endpoint += `&sala=${sala}`;
        if (turno && turno !== 'todos') endpoint += `&turno=${turno}`;
        if (busca) endpoint += `&busca=${encodeURIComponent(busca)}`;

        try {
            const response = await http.get(endpoint, {
                responseType: 'blob',
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Frequencia_${mesBackend}_${ano}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Erro ao exportar frequência:', error);
            return Promise.reject(new Error("Falha ao exportar frequência."));
        }
    }
}

export default get;