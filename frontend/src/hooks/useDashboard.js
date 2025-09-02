import { useState, useEffect } from 'react';
import get from '../services/requests/get';

export function useDashboard() {
    const [frequenciaPorSala, setFrequenciaPorSala] = useState({ manha: {}, tarde: {} });
    const [rankingMelhores, setRankingMelhores] = useState([]);
    const [rankingPiores, setRankingPiores] = useState([]);
    const [avisos, setAvisos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Realiza todas as chamadas de API em paralelo para mais eficiência
                const [frequenciaRes, avisosRes, rankingRes] = await Promise.all([
                    get.frequenciadiscente(new Date().toISOString().split('T')[0]),
                    get.dashboardAvisos(),
                    get.dashboardRanking()
                ]);

                // 1. Processa dados de Frequência por Sala
                const freqData = frequenciaRes.data || [];
                const freqPorSala = { manha: {}, tarde: {} };
                ['1', '2', '3', '4'].forEach(sala => {
                    freqPorSala.manha[sala] = freqData.filter(f => f.sala === parseInt(sala) && f.presenca_manha === 'P').length;
                    freqPorSala.tarde[sala] = freqData.filter(f => f.sala === parseInt(sala) && f.presenca_tarde === 'P').length;
                });
                freqPorSala.manha.total = Object.values(freqPorSala.manha).reduce((a, b) => a + b, 0);
                freqPorSala.tarde.total = Object.values(freqPorSala.tarde).reduce((a, b) => a + b, 0);
                setFrequenciaPorSala(freqPorSala);

                // 2. Processa dados de Avisos
                setAvisos(avisosRes.data || []);

                // 3. Processa dados de Ranking
                const ranking = rankingRes.data || [];
                setRankingMelhores(ranking); // O backend já retorna os melhores
                // Cria uma cópia e inverte para os piores
                setRankingPiores([...ranking].sort((a, b) => a.mediaGeral - b.mediaGeral));

            } catch (err) {
                console.error("Erro ao carregar dados do dashboard:", err);
                setError(err.message || 'Falha ao carregar o dashboard.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []); // Roda apenas uma vez

    return { loading, error, frequenciaPorSala, avisos, rankingMelhores, rankingPiores };
}