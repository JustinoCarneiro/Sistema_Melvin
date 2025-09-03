import { useState, useEffect, useMemo } from 'react';
import Cookies from "js-cookie";
import get from '../services/requests/get';

export function useVoluntarios(tipo) {
    const [voluntarios, setVoluntarios] = useState([]);
    const [busca, setBusca] = useState('');
    const [filtroEspera, setFiltroEspera] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdm, setIsAdm] = useState(false);
    
    // AQUI ESTÁ A CORREÇÃO
    const { title, prox_rota } = useMemo(() => {
        const titulos = {
            coordenador: "Coordenadores", professor: "Professores", auxiliar: "Auxiliares",
            cozinheiro: "Cozinheiros", diretor: "Diretores", marketing: "Marketing",
            administrador: "Administradores", zelador: "Zeladores",
            psicologo: "Psicólogos" // Adicionado
        };
        const rotas = {
            coordenador: "coordenadores", professor: "professores", auxiliar: "auxiliares",
            cozinheiro: "cozinheiros", diretor: "diretores", marketing: "marketing",
            administrador: "administradores", zelador: "zeladores",
            psicologo: "psicologos" // Adicionado
        };
        return { title: titulos[tipo] || "Voluntários", prox_rota: rotas[tipo] || tipo };
    }, [tipo]);

    // O resto do hook permanece o mesmo
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
    }, []);

    useEffect(() => {
        if (busca === '') {
            // Recarrega a lista completa se a busca for limpa
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

    const voluntariosFiltrados = useMemo(() => {
        return voluntarios.filter((voluntario) => {
            if (voluntario.funcao !== tipo) {
                return false;
            }
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