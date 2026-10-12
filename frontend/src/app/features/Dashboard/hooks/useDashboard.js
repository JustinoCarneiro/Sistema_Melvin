import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import dashboardService from '../api/dashboardService';
import frequenciaService from '@core/services/frequenciaService';
import { usePermissions } from '@core/hooks/usePermissions';

export function useDashboard() {
    const { hasPermission, loading: loadingPermissoes } = usePermissions();
    // Psicologia e Coordenação veem tudo, inclusive a nota psicológica; os demais cargos com
    // "Visualizar Relatórios" veem o ranking pedagógico (o servidor aplica a mesma regra).
    const canViewPsychRanking = ['PSICO', 'COOR'].includes(Cookies.get('role'));
    const canViewRanking = canViewPsychRanking || hasPermission('VISUALIZAR_RELATORIOS');
    // A frequência de alunos é lida só por quem gerencia a frequência (docentes, coordenação e diretoria por
    // padrão); o servidor nega aos demais cargos, então o painel nem a consulta nem a exibe para eles.
    const canViewFrequencia = hasPermission('GERENCIAR_FREQUENCIA');
    const [frequenciaPorSala, setFrequenciaPorSala] = useState({ manha: {}, tarde: {} });
    const [rankingMelhores, setRankingMelhores] = useState([]);
    const [rankingPiores, setRankingPiores] = useState([]);
    const [avisos, setAvisos] = useState([]);
    const [rankingSortBy, setRankingSortBy] = useState('media');
    const [alertasFaltas, setAlertasFaltas] = useState([]);
    
    const [loading, setLoading] = useState(true); // Loading principal da página
    const [isRankingLoading, setIsRankingLoading] = useState(false); // 1. NOVO loading para o ranking
    const [error, setError] = useState(null);

    // Efeito para a carga inicial de TUDO. Espera as permissões chegarem, porque delas depende o que se consulta.
    useEffect(() => {
        if (loadingPermissoes) return;
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                const now = new Date();
                const semDados = { data: [] };
                // Frequência e faltas são opcionais: se faltarem (sem permissão, ou negadas pelo servidor), o
                // painel carrega do mesmo jeito, só sem esses dois cartões.
                const [frequenciaRes, avisosRes, alertasRes] = await Promise.all([
                    canViewFrequencia
                        ? frequenciaService.listDiscente(new Date().toISOString().split('T')[0]).catch(() => semDados)
                        : semDados,
                    dashboardService.getAvisos(),
                    canViewFrequencia
                        ? frequenciaService.getAlertasFaltas(now.getMonth() + 1, now.getFullYear()).catch(() => semDados)
                        : semDados
                ]);

                // ... (Processamento de Frequência, Avisos e Ranking)
                // (a lógica aqui dentro é a mesma de antes)
                // Guarda de tipo: resposta que não seja lista (ex.: página inicial devolvida por proxy) derrubaria a renderização.
                const lista = (res) => (Array.isArray(res?.data) ? res.data : []);
                const freqData = lista(frequenciaRes);
                const freqPorSala = { manha: {}, tarde: {} };
                ['1', '2', '3', '4'].forEach(sala => {
                    freqPorSala.manha[sala] = freqData.filter(f => f.sala === parseInt(sala) && f.presenca_manha === 'P').length;
                    freqPorSala.tarde[sala] = freqData.filter(f => f.sala === parseInt(sala) && f.presenca_tarde === 'P').length;
                });
                freqPorSala.manha.total = Object.values(freqPorSala.manha).reduce((a, b) => a + b, 0);
                freqPorSala.tarde.total = Object.values(freqPorSala.tarde).reduce((a, b) => a + b, 0);
                setFrequenciaPorSala(freqPorSala);
                setAvisos(lista(avisosRes));

                setAlertasFaltas(lista(alertasRes));

            } catch (err) {
                setError(err.message || 'Falha ao carregar o dashboard.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [loadingPermissoes, canViewFrequencia]); // Roda quando as permissões ficam prontas

    // Efeito SEPARADO para CARREGAR e ATUALIZAR o ranking. Espera o painel terminar de carregar e as
    // permissões chegarem, porque o perfil que habilita o ranking só é conhecido depois delas.
    useEffect(() => {
        if (loading || loadingPermissoes || !canViewRanking) return;

        const fetchRankingData = async () => {
            setIsRankingLoading(true); // 2. Ativa o loading SÓ do ranking
            setError(null);
            try {
                const rankingRes = await dashboardService.getRanking(rankingSortBy);
                // Guarda de tipo: resposta que não seja lista derrubaria o painel inteiro na renderização.
                const ranking = Array.isArray(rankingRes.data) ? rankingRes.data : [];
                setRankingMelhores(ranking);
                setRankingPiores([...ranking].sort((a, b) => a.mediaGeral - b.mediaGeral));
            } catch (err) {
                setError(err.message || 'Falha ao atualizar ranking.');
            } finally {
                setIsRankingLoading(false); // 3. Desativa o loading SÓ do ranking
            }
        };

        fetchRankingData();
    }, [rankingSortBy, canViewRanking, loading, loadingPermissoes]); // Roda quando o filtro muda ou o perfil habilita o ranking

    return { 
        loading, 
        isRankingLoading,
        error, 
        frequenciaPorSala, 
        avisos, 
        rankingMelhores, 
        rankingPiores,
        canViewRanking,
        canViewPsychRanking,
        canViewFrequencia,
        rankingSortBy,
        setRankingSortBy,
        alertasFaltas
    };
}
