import http from "./http";

const permissaoService = {
    listarTodas: async () => {
        return await http.get("/api/permissoes");
    },

    atualizarRegra: async (nomeRegra, roles) => {
        return await http.put(`/api/permissoes/${nomeRegra}`, roles);
    },

    listarMinhas: async () => {
        return await http.get("/api/permissoes/minhas");
    },

    hasPermission: async (permissaoDesejada) => {
        try {
            const resp = await permissaoService.listarMinhas();
            const permissoes = resp.data || [];
            return permissoes.includes(permissaoDesejada);
        } catch (error) {
            console.error("Erro ao verificar permissão", error);
            return false;
        }
    }
};

export default permissaoService;
