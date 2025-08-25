import { useState, useEffect, useMemo } from 'react';
import Cookies from "js-cookie";
import get from '../services/requests/get';

// O hook recebe o 'tipo' de voluntário como argumento
export function useVoluntarios(tipo) {
    // Estados de dados e filtros
    const [voluntarios, setVoluntarios] = useState([]);
    const [busca, setBusca] = useState('');
    const [filtroEspera, setFiltroEspera] = useState(false);

    // Estados de controle da UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdm, setIsAdm] = useState(false);
    
    // Título e rota derivados do tipo
    const { title, prox_rota } = useMemo(() => {
        const titulos = {
            coordenador: "Coordenadores", professor: "Professores", auxiliar: "Auxiliares",
            cozinheiro: "Cozinheiros", diretor: "Diretores", marketing: "Marketing",
            administrador: "Administradores", zelador: "Zeladores"
        };
        const rotas = {
            coordenador: "coordenadores", professor: "professores", auxiliar: "auxiliares",
            cozinheiro: "cozinheiros", diretor: "diretores", marketing: "marketing",
            administrador: "administradores", zelador: "zeladores"
        };
        return { title: titulos[tipo] || "Voluntários", prox_rota: rotas[tipo] || tipo };
    }, [tipo]);

    // Efeito para buscar os dados iniciais (todos os voluntários e permissões)
    useEffect(() => {
        setLoading(true);
        const userRole = Cookies.get('role');
        setIsAdm(userRole === "ADM");

        get.voluntario()
            .then(response => {
                setVoluntarios(response.data || []);
            })
            .catch(err => {
                setError(err.message || 'Falha ao carregar voluntários.');
            })
            .finally(() => setLoading(false));
    }, []); // Roda apenas uma vez na montagem do componente

    // EFEITO DE BUSCA NO BACKEND (com debounce refinado)
    useEffect(() => {

        const timer = setTimeout(() => {
            setLoading(true); // Mostra "Carregando" apenas após o atraso
            get.voluntario(busca)
                .then(response => {
                    setVoluntarios(response.data || []);
                })
                .catch(err => {
                    setError(err.message || 'Falha ao buscar voluntários.');
                })
                .finally(() => setLoading(false));
        }, 500); // Atraso de 500ms antes de enviar a requisição

        return () => clearTimeout(timer); // Limpa o timer se o usuário digitar novamente
    }, [busca]);

    // A filtragem por busca (nome, etc.) agora é feita no backend.
    // O useMemo aplica apenas os filtros LOCAIS (por tipo de voluntário e status de espera).
    const voluntariosFiltrados = useMemo(() => {
        return voluntarios.filter((voluntario) => {
            // Filtro principal pelo tipo da página
            if (voluntario.funcao !== tipo) {
                return false;
            }

            // Filtro pelo status (ativo ou em espera)
            const statusCondicao = filtroEspera ? voluntario.status === 'espera' : voluntario.status === 'true';
            
            return statusCondicao;
        });
    }, [voluntarios, filtroEspera, tipo]);

    return {
        busca,
        setBusca,
        filtroEspera,
        setFiltroEspera,
        voluntariosFiltrados,
        loading,
        error,
        isAdm,
        title,
        prox_rota
    };
}