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

    useEffect(() => {
        const carregarVoluntarios = async () => {
            setLoading(true);
            setError(null);
            try {
                // Verificar permissões
                const userRole = Cookies.get('role');
                setIsAdm(userRole === "ADM");

                // Buscar todos os voluntários de uma vez
                const response = await get.voluntario();
                setVoluntarios(response.data || []);
            } catch (err) {
                console.error("Erro ao carregar voluntários:", err);
                setError(err.message || 'Falha ao carregar os dados.');
            } finally {
                setLoading(false);
            }
        };

        carregarVoluntarios();
    }, []);

    // Lógica de filtragem completa dentro do hook
    const voluntariosFiltrados = useMemo(() => {
        const termoBusca = busca.toLowerCase();
        
        return voluntarios.filter((voluntario) => {
            // Primeiro, o filtro mais importante: pelo tipo da página
            if (voluntario.funcao !== tipo) {
                return false;
            }

            const statusCondicao = filtroEspera ? voluntario.status === 'espera' : voluntario.status === 'true';
            
            const buscaCondicao = (
                voluntario.matricula.toString().includes(termoBusca) ||
                voluntario.nome.toLowerCase().includes(termoBusca) ||
                (voluntario.email || '').toLowerCase().includes(termoBusca)
            );

            return statusCondicao && buscaCondicao;
        });
    }, [voluntarios, busca, filtroEspera, tipo]);

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