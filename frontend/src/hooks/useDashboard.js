import { useState, useEffect } from 'react';
import get from '../services/requests/get';

export function useDashboard() {
    // Estados para cada card do dashboard
    const [frequenciaPorSala, setFrequenciaPorSala] = useState({});
    const [rankingMelhores, setRankingMelhores] = useState([]);
    const [rankingPiores, setRankingPiores] = useState([]);
    const [avisos, setAvisos] = useState([]);

    // Estados de controle da UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Realiza todas as chamadas de API em paralelo
                const [frequenciaRes, avisosRes, rankingRes] = await Promise.all([
                    get.frequenciadiscente(new Date().toISOString().split('T')[0]),
                    get.aviso(),
                    get.dashboardRanking()
                ]);

                // 1. Processa dados de Frequência
                const freqPorSala = { manha: {}, tarde: {} };
                ['1', '2', '3', '4'].forEach(sala => {
                    freqPorSala.manha[sala] = frequenciaRes.data.filter(f => f.sala === parseInt(sala) && f.presenca_manha === 'P').length;
                    freqPorSala.tarde[sala] = frequenciaRes.data.filter(f => f.sala === parseInt(sala) && f.presenca_tarde === 'P').length;
                });
                freqPorSala.manha.total = Object.values(freqPorSala.manha).reduce((a, b) => a + b, 0);
                freqPorSala.tarde.total = Object.values(freqPorSala.tarde).reduce((a, b) => a + b, 0);
                setFrequenciaPorSala(freqPorSala);

                // 2. Processa dados de Avisos (com imagem)
                const avisosAtivos = avisosRes.data.filter(aviso => aviso.status);
                const imagemResponse = await get.imagemlista();
                const avisosComImagem = avisosAtivos.map(aviso => {
                    const imagemParaAviso = imagemResponse.data.find(img => img.idAtrelado === aviso.id && img.tipo === 'aviso');
                    return {
                        ...aviso,
                        imageUrl: imagemParaAviso ? `${import.meta.env.VITE_REACT_APP_FETCH_URL}${imagemParaAviso.filePath}` : null
                    };
                });
                setAvisos(avisosComImagem);

                // 3. Processa dados de Ranking
                const ranking = rankingRes.data || [];
                setRankingMelhores(ranking); // O backend já retorna os melhores
                setRankingPiores([...ranking].reverse()); // Para os piores, apenas invertemos a lista

            } catch (err) {
                console.error("Erro ao carregar dados do dashboard:", err);
                setError(err.message || 'Falha ao carregar o dashboard.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return { loading, error, frequenciaPorSala, avisos, rankingMelhores, rankingPiores };
}