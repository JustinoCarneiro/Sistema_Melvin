import { useState, useEffect, useMemo } from 'react';
import Cookies from "js-cookie";
import get from '../services/requests/get';

export function useVoluntarios() {
    const [voluntarios, setVoluntarios] = useState([]);
    const [busca, setBusca] = useState('');
    const [filtroEspera, setFiltroEspera] = useState(false);
    
    // NOVO: Estado para controlar qual função estamos vendo (padrão: todos)
    const [filtroFuncao, setFiltroFuncao] = useState('todos'); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdm, setIsAdm] = useState(false);

    useEffect(() => {
        setLoading(true);
        const userRole = Cookies.get('role');
        setIsAdm(userRole === "ADM");

        // Busca TODOS os voluntários sem filtro de tipo na API
        get.voluntario()
            .then(response => {
                setVoluntarios(response.data || []);
            })
            .catch(err => {
                setError(err.message || 'Falha ao carregar voluntários.');
            })
            .finally(() => setLoading(false));
    }, []);

    // Lógica de busca por nome (Debounce)
    useEffect(() => {
        if (busca === '') {
            setLoading(true);
            get.voluntario().then(res => setVoluntarios(res.data || [])).finally(() => setLoading(false));
            return;
        }
        const timer = setTimeout(() => {
            setLoading(true);
            get.voluntario(busca)
                .then(response => {
                    setVoluntarios(response.data || []);
                })
                .catch(err => {
                    setError(err.message || 'Falha ao buscar voluntários.');
                })
                .finally(() => setLoading(false));
        }, 500);

        return () => clearTimeout(timer);
    }, [busca]);

    // Filtragem Inteligente (Função + Status)
    const voluntariosFiltrados = useMemo(() => {
        return voluntarios.filter((voluntario) => {
            // 1. Filtro do Dropdown
            if (filtroFuncao !== 'todos' && voluntario.funcao !== filtroFuncao) {
                return false;
            }
            
            // 2. Filtro de Status (Pendente/Ativo)
            const statusCondicao = filtroEspera ? voluntario.status === 'espera' : voluntario.status === 'true';
            return statusCondicao;
        });
    }, [voluntarios, filtroEspera, filtroFuncao]);

    return {
        busca, setBusca,
        filtroEspera, setFiltroEspera,
        filtroFuncao, setFiltroFuncao, // Exporta o controle do dropdown
        voluntariosFiltrados,
        loading, error, isAdm
    };
}