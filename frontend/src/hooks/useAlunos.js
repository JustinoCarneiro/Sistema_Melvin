import { useState, useEffect, useMemo } from 'react';
import Cookies from "js-cookie";
import get from '../services/requests/get';

export function useAlunos() {
    const [alunos, setAlunos] = useState([]);
    const [busca, setBusca] = useState('');
    // Alterado: Inicia como 'todos' para ADM/Assistente ver tudo logo de cara
    const [aula, setAula] = useState('todos'); 
    const [filtroEspera, setFiltroEspera] = useState(false);
    const [turnoSelecionado, setTurnoSelecionado] = useState('todos'); // Melhor padrão 'todos'
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isAdm, setIsAdm] = useState(false);
    const [isCoor, setIsCoor] = useState(false);
    const [isDire, setIsDire] = useState(false);
    const [isPsico, setIsPsico] = useState(false);
    const [isAssist, setIsAssist] = useState(false);
    const [salasDisponiveis, setSalasDisponiveis] = useState([]);

    useEffect(() => {
        const carregarDadosIniciais = async () => {
            try {
                const userRole = Cookies.get('role');
                
                // Variáveis locais para verificação imediata
                const isUserAdm = userRole === 'ADM';
                const isUserCoor = userRole === 'COOR';
                const isUserDire = userRole === 'DIRE';
                const isUserPsico = userRole === 'PSICO';
                const isUserAssist = userRole === 'ASSIST';

                // Atualiza estados
                setIsAdm(isUserAdm);
                setIsCoor(isUserCoor);
                setIsDire(isUserDire);
                setIsPsico(isUserPsico);
                setIsAssist(isUserAssist);

                // Lógica de visualização de salas (CORRIGIDA)
                // Agora verificamos isUserAssist (variável local verdadeira)
                if (isUserAdm || isUserCoor || isUserDire || isUserPsico || isUserAssist) {
                    setSalasDisponiveis(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);
                    setAula('todos'); // Garante que comece vendo tudo
                } else {
                    const matricula = Cookies.get('login');
                    if(matricula){
                        const dadosVoluntario = await get.voluntarioByMatricula(matricula);
                        const { salaUm, salaDois, aulaExtra } = dadosVoluntario.data;
                        const salas = [];
                        if (salaUm) salas.push(salaUm.toString());
                        if (salaDois) salas.push(salaDois.toString());
                        if (aulaExtra) salas.push(aulaExtra.toString());
                        setSalasDisponiveis(salas);
                        setAula(salas[0] || '1');
                    }
                }
            } catch (err) {
                console.error(err);
                setError(err.message || 'Falha ao carregar configurações.');
            }
        };
        carregarDadosIniciais();
    }, []);

    // Busca de alunos (Mantida igual)
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(true);
            get.discente(busca)
                .then(response => {
                    setAlunos(response.data || []);
                })
                .catch(err => {
                    // Erro 403 (Proibido) não deve quebrar a tela, só mostrar vazio
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
            
            // Corrige filtro de turno (se for 'todos', aceita qualquer coisa)
            const turnoCondicao = turnoSelecionado === 'todos' || aluno.turno === turnoSelecionado;
            
            const aulaCondicao = (() => {
                if (aula === "todos") return true;
                if (!aula) return true; 

                // Lógica para salas numeradas (1-4) vs Oficinas (5-12)
                if (parseInt(aula) <= 4) {
                    return aluno.sala === parseInt(aula, 10);
                }
                
                const mapeamento = {'5': 'ingles', '6': 'karate', '7': 'informatica', '8': 'teatro', '9': 'ballet', '10': 'musica', '11': 'futsal', '12': 'artesanato'};
                const chaveOficina = mapeamento[aula];
                return aluno[chaveOficina] === true || aluno[chaveOficina] === "true"; // Verifica boolean ou string
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
        loading, error,
        isAdm, isCoor, isDire, isPsico, isAssist,
        salasDisponiveis
    };
}