import { useState, useEffect } from 'react';
import get from '../services/requests/get';

export function useDashboard() {
    const [frequenciaPorSala, setFrequenciaPorSala] = useState({ manha: {}, tarde: {} });
    const [rankingMelhores, setRankingMelhores] = useState([]);
    const [rankingPiores, setRankingPiores] = useState([]);
    const [avisos, setAvisos] = useState([]);
    const [rankingSortBy, setRankingSortBy] = useState('media');
    
    const [loading, setLoading] = useState(true); // Loading principal da página
    const [isRankingLoading, setIsRankingLoading] = useState(false); // 1. NOVO loading para o ranking
    const [error, setError] = useState(null);

    // Efeito para a carga inicial de TUDO
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [frequenciaRes, avisosRes, rankingRes] = await Promise.all([
                    get.frequenciadiscente(new Date().toISOString().split('T')[0]),
                    get.dashboardAvisos(),
                    get.dashboardRanking(rankingSortBy)
                ]);

                // ... (Processamento de Frequência, Avisos e Ranking)
                // (a lógica aqui dentro é a mesma de antes)
                const freqData = frequenciaRes.data || [];
                const freqPorSala = { manha: {}, tarde: {} };
                ['1', '2', '3', '4'].forEach(sala => {
                    freqPorSala.manha[sala] = freqData.filter(f => f.sala === parseInt(sala) && f.presenca_manha === 'P').length;
                    freqPorSala.tarde[sala] = freqData.filter(f => f.sala === parseInt(sala) && f.presenca_tarde === 'P').length;
                });
                freqPorSala.manha.total = Object.values(freqPorSala.manha).reduce((a, b) => a + b, 0);
                freqPorSala.tarde.total = Object.values(freqPorSala.tarde).reduce((a, b) => a + b, 0);
                setFrequenciaPorSala(freqPorSala);
                setAvisos(avisosRes.data || []);
                const ranking = rankingRes.data || [];
                setRankingMelhores(ranking);
                setRankingPiores([...ranking].sort((a, b) => a.mediaGeral - b.mediaGeral));

            } catch (err) {
                setError(err.message || 'Falha ao carregar o dashboard.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []); // Roda apenas uma vez

    // Efeito SEPARADO apenas para ATUALIZAR o ranking
    useEffect(() => {
        // Não roda na carga inicial
        if (loading) return; 

        const fetchRankingData = async () => {
            setIsRankingLoading(true); // 2. Ativa o loading SÓ do ranking
            setError(null);
            try {
                const rankingRes = await get.dashboardRanking(rankingSortBy);
                const ranking = rankingRes.data || [];
                setRankingMelhores(ranking);
                setRankingPiores([...ranking].sort((a, b) => a.mediaGeral - b.mediaGeral));
            } catch (err) {
                setError(err.message || 'Falha ao atualizar ranking.');
            } finally {
                setIsRankingLoading(false); // 3. Desativa o loading SÓ do ranking
            }
        };

        fetchRankingData();
    }, [rankingSortBy]); // Roda apenas quando o filtro do ranking muda

    return { 
        loading, 
        isRankingLoading,
        error, 
        frequenciaPorSala, 
        avisos, 
        rankingMelhores, 
        rankingPiores,
        rankingSortBy,
        setRankingSortBy
    };
}