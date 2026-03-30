import { useState, useEffect, useMemo } from 'react';
import voluntarioService from '../services/voluntarioService';
import { usePermissions } from './usePermissions';

export function useVoluntarios() {
    const { hasPermission, isAdm, loading: loadingPerms } = usePermissions();

    const [voluntarios, setVoluntarios] = useState([]);
    const [busca, setBusca] = useState('');
    const [filtroEspera, setFiltroEspera] = useState(false);
    const [filtroFuncao, setFiltroFuncao] = useState('todos'); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Flag Dinâmica
    const podeGerenciarVoluntarios = hasPermission('GERENCIAR_VOLUNTARIOS');

    useEffect(() => {
        if (loadingPerms) return;
        setLoading(true);

        voluntarioService.list()
            .then(response => {
                setVoluntarios(response.data || []);
            })
            .catch(err => {
                setError(err.message || 'Falha ao carregar voluntários.');
            })
            .finally(() => setLoading(false));
    }, [loadingPerms]);

    // Lógica de busca por nome (Debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(true);
            voluntarioService.list(busca)
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

    // Filtragem Inteligente
    const voluntariosFiltrados = useMemo(() => {
        return voluntarios.filter((voluntario) => {
            if (filtroFuncao !== 'todos' && voluntario.funcao !== filtroFuncao) {
                return false;
            }
            const statusCondicao = filtroEspera ? voluntario.status === 'espera' : voluntario.status === 'true';
            return statusCondicao;
        });
    }, [voluntarios, filtroEspera, filtroFuncao]);

    return {
        busca, setBusca,
        filtroEspera, setFiltroEspera,
        filtroFuncao, setFiltroFuncao,
        voluntariosFiltrados,
        loading: loading || loadingPerms,
        error, 
        isAdm,
        hasPermission,
        podeGerenciarVoluntarios
    };
}