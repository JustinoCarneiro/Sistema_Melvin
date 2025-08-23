import { useState, useEffect } from 'react';
import get from '../services/requests/get';
import post from '../services/requests/post';

export function useRendimento(matricula) {
    // Dados do aluno
    const [aluno, setAluno] = useState(null);

    // Dados de Frequência
    const [frequencias, setFrequencias] = useState([]);
    const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
    const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());

    // Dados de Avaliação
    const [avaliacoes, setAvaliacoes] = useState({});

    // Controle de UI
    const [loading, setLoading] = useState(true);
    const [loadingFrequencias, setLoadingFrequencias] = useState(false);
    const [error, setError] = useState('');

    const aulasExtrasMap = {
        karate: 'Karatê', ballet: 'Ballet', informatica: 'Informática',
        musica: 'Música', artesanato: 'Artesanato', futsal: 'Futsal', ingles: 'Inglês', teatro: 'Teatro'
    };

    // Efeito inicial para carregar dados do aluno e avaliações
    useEffect(() => {
        const fetchData = async () => {
            if (!matricula) return;
            setLoading(true);
            setError('');
            try {
                const [alunoRes, avaliacoesRes] = await Promise.all([
                    get.discenteByMatricula(matricula),
                    get.avaliacoesPorMatricula(matricula)
                ]);

                setAluno(alunoRes.data);

                const avaliacoesPorAula = {};
                avaliacoesRes.data.forEach(av => {
                    avaliacoesPorAula[av.nomeAula] = av;
                });
                setAvaliacoes(avaliacoesPorAula);

            } catch (err) {
                setError(err.message || 'Erro ao carregar dados iniciais.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [matricula]);

    // Função para buscar as frequências sob demanda
    const fetchFrequencias = async () => {
        if (!mesSelecionado || !anoSelecionado) {
            setError('Por favor, selecione um mês e ano.');
            return;
        }
        setLoadingFrequencias(true);
        setError('');
        setFrequencias([]);

        try {
            const diasNoMes = new Date(anoSelecionado, mesSelecionado, 0).getDate();
            const promises = [];
            for (let dia = 1; dia <= diasNoMes; dia++) {
                const data = `${anoSelecionado}-${String(mesSelecionado).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                promises.push(get.frequenciadiscente(data, matricula));
            }
            const responses = await Promise.allSettled(promises);
            const todasFrequencias = responses
                .filter(res => res.status === 'fulfilled' && res.value.data)
                .flatMap(res => res.value.data);
            setFrequencias(todasFrequencias);
        } catch (err) {
            setError(err.message || 'Erro ao buscar frequências.');
        } finally {
            setLoadingFrequencias(false);
        }
    };

    // Função para salvar uma nova avaliação
    const handleRate = async (nomeAula, nota) => {
        setError('');
        try {
            const avaliacaoData = {
                discente: { matricula },
                nomeAula,
                nota,
                data: new Date().toISOString().split('T')[0],
            };
            const response = await post.avaliacao(avaliacaoData);
            setAvaliacoes(prev => ({ ...prev, [nomeAula]: response.data }));
            alert('Avaliação salva com sucesso!');
        } catch (err) {
            setError(err.message || 'Não foi possível salvar a avaliação.');
        }
    };

    return {
        aluno,
        frequencias,
        mesSelecionado,
        setMesSelecionado,
        anoSelecionado,
        setAnoSelecionado,
        avaliacoes,
        aulasExtrasMap,
        loading,
        loadingFrequencias,
        error,
        fetchFrequencias,
        handleRate
    };
}