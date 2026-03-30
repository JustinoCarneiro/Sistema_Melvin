import { useState, useEffect, useMemo } from 'react';
import Cookies from "js-cookie";
import discenteService from '../services/discenteService';
import voluntarioService from '../services/voluntarioService';
import { usePermissions } from './usePermissions';

export function useAlunos() {
    const { hasPermission, isAdm, isCoor, isDire, isPsico, isAssist, loading: loadingPerms } = usePermissions();
    
    const [alunos, setAlunos] = useState([]);
    const [busca, setBusca] = useState('');
    const [aula, setAula] = useState('todos'); 
    const [filtroEspera, setFiltroEspera] = useState(false);
    const [turnoSelecionado, setTurnoSelecionado] = useState('todos');
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [salasDisponiveis, setSalasDisponiveis] = useState([]);

    // Flags Dinâmicas
    const podeCadastrarAluno = hasPermission('CADASTRAR_ALUNO');
    const podeGerenciarFrequencia = hasPermission('GERENCIAR_FREQUENCIA');
    const podeEditarRendimento = hasPermission('EDITAR_RENDIMENTO') || hasPermission('EDITAR_AVALIACAO_PSICO');

    useEffect(() => {
        if (loadingPerms) return;

        const carregarDadosIniciais = async () => {
            try {
                // Lógica de visualização de salas
                if (isAdm || isCoor || isDire || isPsico || isAssist) {
                    setSalasDisponiveis(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);
                } else {
                    const matricula = Cookies.get('login');
                    if(matricula){
                        const dadosVoluntario = await voluntarioService.get(matricula);
                        const { salaUm, salaDois, aulaExtra } = dadosVoluntario.data;
                        const salas = [];
                        if (salaUm) salas.push(salaUm.toString());
                        if (salaDois) salas.push(salaDois.toString());
                        if (aulaExtra) salas.push(aulaExtra.toString());
                        setSalasDisponiveis(salas);
                        if (salas.length > 0) setAula(salas[0]);
                    }
                }
            } catch (err) {
                console.error(err);
                setError(err.message || 'Falha ao carregar configurações.');
            }
        };
        carregarDadosIniciais();
    }, [loadingPerms, isAdm, isCoor, isDire, isPsico, isAssist]);

    // Busca de alunos
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(true);
            discenteService.list(busca)
                .then(response => {
                    setAlunos(response.data || []);
                })
                .catch(err => {
                    if (err.response && err.response.status === 403) {
                         setAlunos([]); 
                    } else {
                        setError(err.message || 'Falha ao buscar alunos.');
                    }
                })
                .finally(() => setLoading(false));
        }, 500);

        return () => clearTimeout(timer);
    }, [busca]);

    const alunosFiltrados = useMemo(() => {
        if (!alunos) return [];
        
        return alunos.filter((aluno) => {
            const statusCondicao = filtroEspera ? aluno.status === 'espera' : aluno.status === 'true';
            const turnoCondicao = turnoSelecionado === 'todos' || aluno.turno === turnoSelecionado;
            
            const aulaCondicao = (() => {
                if (aula === "todos") return true;
                if (!aula) return true; 

                if (parseInt(aula) <= 4) {
                    return aluno.sala === parseInt(aula, 10);
                }
                
                const mapeamento = {'5': 'ingles', '6': 'karate', '7': 'informatica', '8': 'teatro', '9': 'ballet', '10': 'musica', '11': 'futsal', '12': 'artesanato'};
                const chaveOficina = mapeamento[aula];
                return aluno[chaveOficina] === true || aluno[chaveOficina] === "true";
            })();
    
            return statusCondicao && turnoCondicao && aulaCondicao;
        });
    }, [alunos, aula, filtroEspera, turnoSelecionado]);

    return {
        busca, setBusca,
        aula, setAula,
        filtroEspera, setFiltroEspera,
        turnoSelecionado, setTurnoSelecionado,
        alunosFiltrados,
        loading: loading || loadingPerms, 
        error,
        isAdm, isCoor, isDire, isPsico, isAssist,
        hasPermission,
        podeCadastrarAluno, podeGerenciarFrequencia, podeEditarRendimento,
        salasDisponiveis
    };
}