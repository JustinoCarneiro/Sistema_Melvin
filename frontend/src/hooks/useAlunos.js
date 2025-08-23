import { useState, useEffect, useMemo } from 'react';
import Cookies from "js-cookie";
import get from '../services/requests/get';

export function useAlunos() {
    // Estados relacionados aos dados e filtros
    const [alunos, setAlunos] = useState([]);
    const [busca, setBusca] = useState('');
    const [aula, setAula] = useState('1');
    const [filtroEspera, setFiltroEspera] = useState(false);
    const [turnoSelecionado, setTurnoSelecionado] = useState('manha');
    
    // Estados de controle da UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdm, setIsAdm] = useState(false);
    const [salasDisponiveis, setSalasDisponiveis] = useState([]);

    // Efeito para buscar dados iniciais
    useEffect(() => {
        const carregarDadosIniciais = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Verificar permissões
                const userRole = Cookies.get('role');
                const isUserAdm = userRole === 'ADM' || userRole === 'DIRE' || userRole === 'COOR';
                setIsAdm(isUserAdm);

                // 2. Buscar lista de alunos
                const responseAlunos = await get.discente();
                setAlunos(responseAlunos.data || []);

                // 3. Buscar salas disponíveis com base na permissão
                if (isUserAdm) {
                    setSalasDisponiveis(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);
                } else {
                    const matricula = Cookies.get('login');
                    const dadosVoluntario = await get.voluntarioByMatricula(matricula);
                    const { salaUm, salaDois, aulaExtra } = dadosVoluntario.data;
                    const salas = [];
                    if (salaUm) salas.push(salaUm.toString());
                    if (salaDois) salas.push(salaDois.toString());
                    if (aulaExtra) salas.push(aulaExtra.toString());
                    setSalasDisponiveis(salas);
                    setAula(salas[0] || '1');
                }
            } catch (err) {
                console.error("Erro ao carregar dados da página de alunos:", err);
                setError(err.message || 'Falha ao carregar dados.');
            } finally {
                setLoading(false);
            }
        };

        carregarDadosIniciais();
    }, []);

    // Lógica de filtragem, agora dentro do hook e otimizada com useMemo
    const alunosFiltrados = useMemo(() => {
        const termoBusca = busca.toLowerCase();
        
        return alunos.filter((aluno) => {
            const statusCondicao = filtroEspera ? aluno.status === 'espera' : aluno.status === 'true';
            const turnoCondicao = turnoSelecionado === 'todos' || aluno.turno === turnoSelecionado;
            const aulaCondicao = (() => {
                if (aula === "todos") return true;
                if (aula <= 4) return aluno.sala === parseInt(aula, 10);
                const mapeamento = {'5': 'ingles', '6': 'karate', '7': 'informatica', '8': 'teatro', '9': 'ballet', '10': 'musica', '11': 'futsal', '12': 'artesanato'};
                return aluno[mapeamento[aula]] || false;
            })();
    
            const buscaCondicao = (
                aluno.matricula.toString().includes(termoBusca) ||
                aluno.nome.toLowerCase().includes(termoBusca) ||
                (aluno.nome_pai || '').toLowerCase().includes(termoBusca) ||
                (aluno.nome_mae || '').toLowerCase().includes(termoBusca)
            );

            return statusCondicao && turnoCondicao && aulaCondicao && buscaCondicao;
        });
    }, [alunos, busca, aula, filtroEspera, turnoSelecionado]);

    // Retorna apenas o que o componente precisa para renderizar e interagir
    return {
        busca,
        setBusca,
        aula,
        setAula,
        filtroEspera,
        setFiltroEspera,
        turnoSelecionado,
        setTurnoSelecionado,
        alunosFiltrados,
        loading,
        error,
        isAdm,
        salasDisponiveis
    };
}