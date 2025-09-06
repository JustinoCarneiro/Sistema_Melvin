import { useState, useEffect, useMemo } from 'react';
import Cookies from "js-cookie";
import get from '../services/requests/get';

export function useAlunos() {
    const [alunos, setAlunos] = useState([]);
    const [busca, setBusca] = useState('');
    const [aula, setAula] = useState('1');
    const [filtroEspera, setFiltroEspera] = useState(false);
    const [turnoSelecionado, setTurnoSelecionado] = useState('manha');
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // --- INÍCIO DAS ALTERAÇÕES ---
    const [isAdm, setIsAdm] = useState(false);
    const [isCoor, setIsCoor] = useState(false);
    const [isDire, setIsDire] = useState(false);
    const [isPsico, setIsPsico] = useState(false);
    const [salasDisponiveis, setSalasDisponiveis] = useState([]);

    // Efeito para buscar dados iniciais (permissões e salas)
    useEffect(() => {
        const carregarDadosIniciais = async () => {
            try {
                const userRole = Cookies.get('role');
                
                // Define os estados para cada perfil
                const isUserAdm = userRole === 'ADM';
                const isUserCoor = userRole === 'COOR';
                const isUserDire = userRole === 'DIRE';
                const isUserPsico = userRole === 'PSICO';

                setIsAdm(isUserAdm);
                setIsCoor(isUserCoor);
                setIsDire(isUserDire);
                setIsPsico(isUserPsico);

                // Lógica de visualização de salas
                if (isUserAdm || isUserCoor || isUserDire || isUserPsico) {
                    // Adm, Coor, Dire e Psico veem todas as salas
                    setSalasDisponiveis(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);
                } else {
                    // Outros perfis (como Professor) veem apenas suas salas
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
                setError(err.message || 'Falha ao carregar configurações.');
            }
        };
        carregarDadosIniciais();
    }, []);
    // --- FIM DAS ALTERAÇÕES ---


    // Efeito para BUSCAR os alunos no backend sempre que 'busca' mudar (com debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(true);
            get.discente(busca)
                .then(response => {
                    setAlunos(response.data || []);
                })
                .catch(err => {
                    setError(err.message || 'Falha ao buscar alunos.');
                })
                .finally(() => setLoading(false));
        }, 500); // Atraso de 500ms para evitar chamadas excessivas à API

        return () => clearTimeout(timer); // Limpa o timer se o usuário digitar novamente
    }, [busca]);

    const alunosFiltrados = useMemo(() => {
        return alunos.filter((aluno) => {
            const statusCondicao = filtroEspera ? aluno.status === 'espera' : aluno.status === 'true';
            const turnoCondicao = turnoSelecionado === 'todos' || aluno.turno === turnoSelecionado;
            const aulaCondicao = (() => {
                if (aula === "todos") return true;
                if (aula <= 4) return aluno.sala === parseInt(aula, 10);
                const mapeamento = {'5': 'ingles', '6': 'karate', '7': 'informatica', '8': 'teatro', '9': 'ballet', '10': 'musica', '11': 'futsal', '12': 'artesanato'};
                return aluno[mapeamento[aula]] || false;
            })();
    
            return statusCondicao && turnoCondicao && aulaCondicao;
        });
    }, [alunos, aula, filtroEspera, turnoSelecionado]);

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
        // --- INÍCIO DAS ALTERAÇÕES ---
        // Exporta os novos estados de perfil
        isAdm,
        isCoor,
        isDire,
        isPsico,
        // --- FIM DAS ALTERAÇÕES ---
        salasDisponiveis
    };
}