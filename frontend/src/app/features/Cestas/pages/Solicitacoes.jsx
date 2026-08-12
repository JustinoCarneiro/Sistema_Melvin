import styles from './Solicitacoes.module.scss';

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from 'react-icons/io';

import cestaService from '../api/cestaService';
import Botao from '@core/components/gerais/Botao';
import { usePermissions } from '@core/hooks/usePermissions';

const ROTULO_NIVEL = {
    CELULA: 'Líder de Célula',
    SETOR: 'Supervisor de Setor',
    AREA: 'Líder de Área',
    DISTRITO: 'Líder de Distrito',
    REDE: 'Pastor de Rede'
};

const formatarData = (data) => data ? new Date(data + 'T00:00:00').toLocaleDateString('pt-BR') : '-';

function SolicitacoesCestas() {
    const navigate = useNavigate();
    const { hasPermission, loading: loadingPerms } = usePermissions();
    const podeGerenciar = hasPermission('GERENCIAR_CESTAS');

    const [solicitacoes, setSolicitacoes] = useState([]);
    const [agendadas, setAgendadas] = useState([]);
    const [datasRetirada, setDatasRetirada] = useState({});
    const [mensagem, setMensagem] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchTudo = useCallback(async () => {
        setLoading(true);
        try {
            const [respSolicitadas, respAgendadas] = await Promise.all([
                cestaService.listarSolicitacoes(),
                cestaService.listarAgendadas()
            ]);
            // Guarda de tipo (mesmo padrão das outras listagens): resposta que não
            // seja array derrubaria a tela inteira no .map da tabela.
            setSolicitacoes(Array.isArray(respSolicitadas.data) ? respSolicitadas.data : []);
            setAgendadas(Array.isArray(respAgendadas.data) ? respAgendadas.data : []);
        } catch (error) {
            setMensagem({ tipo: 'erro', texto: 'Não foi possível carregar as solicitações.' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTudo();
    }, [fetchTudo]);

    const handleValidar = async (id) => {
        const dataRetirada = datasRetirada[id];
        if (!dataRetirada) {
            setMensagem({ tipo: 'erro', texto: 'Informe a data de retirada antes de validar.' });
            return;
        }

        setMensagem(null);
        try {
            await cestaService.validar(id, dataRetirada);
            setMensagem({ tipo: 'sucesso', texto: 'Solicitação agendada. Já aparece na lista de aguardando retirada.' });
            await fetchTudo();
        } catch (error) {
            setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao validar solicitação.' });
        }
    };

    const handleConfirmarEntrega = async (id, nomeBeneficiario) => {
        setMensagem(null);
        try {
            await cestaService.confirmarEntrega(id);
            setMensagem({ tipo: 'sucesso', texto: `Entrega confirmada para ${nomeBeneficiario}.` });
            await fetchTudo();
        } catch (error) {
            setMensagem({ tipo: 'erro', texto: error.message || 'Não foi possível confirmar a entrega.' });
        }
    };

    if (loadingPerms) return <div className={styles.body}>Carregando permissões...</div>;
    if (!podeGerenciar) return <div className={styles.body}>Você não tem permissão para acessar esta página.</div>;

    return (
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)} />
                    <h2 className={styles.title}>Solicitações de Cestas</h2>
                </div>

                {mensagem && (
                    <div className={`${styles.mensagem} ${mensagem.tipo === 'sucesso' ? styles.sucesso : styles.erro}`}>
                        {mensagem.texto}
                    </div>
                )}

                <div className={styles.secao}>
                    <h3 className={styles.subtitulo}>Pendentes de validação</h3>

                    {loading ? (
                        <p className={styles.vazio}>Carregando...</p>
                    ) : solicitacoes.length === 0 ? (
                        <p className={styles.vazio}>Nenhuma solicitação pendente.</p>
                    ) : (
                        <div className={styles.tableResponsive}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Solicitante</th>
                                        <th>Liderança</th>
                                        <th>Beneficiário</th>
                                        <th>Célula / Rede</th>
                                        <th>Data de retirada</th>
                                        <th>Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {solicitacoes.map((s) => (
                                        <tr key={s.id} className={styles.tr_body}>
                                            <td data-label="Solicitante">{s.nomeSolicitante}</td>
                                            <td data-label="Liderança">{ROTULO_NIVEL[s.nivelSolicitante] || s.nivelSolicitante}</td>
                                            <td data-label="Beneficiário">{s.nome}</td>
                                            <td data-label="Célula / Rede">{[s.lider_celula, s.rede].filter(Boolean).join(' / ')}</td>
                                            <td data-label="Data de retirada">
                                                <input
                                                    className={styles.input}
                                                    type="date"
                                                    value={datasRetirada[s.id] || ''}
                                                    onChange={(e) => setDatasRetirada(prev => ({ ...prev, [s.id]: e.target.value }))}
                                                />
                                            </td>
                                            <td data-label="Ação">
                                                <Botao
                                                    nome="Validar"
                                                    corFundo="#F29F05"
                                                    corBorda="#8A6F3E"
                                                    onClick={() => handleValidar(s.id)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className={styles.secao}>
                    <h3 className={styles.subtitulo}>Aguardando retirada</h3>

                    {loading ? (
                        <p className={styles.vazio}>Carregando...</p>
                    ) : agendadas.length === 0 ? (
                        <p className={styles.vazio}>Nenhuma cesta agendada aguardando retirada.</p>
                    ) : (
                        <div className={styles.tableResponsive}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Beneficiário</th>
                                        <th>Célula / Rede</th>
                                        <th>Solicitante</th>
                                        <th>Data de retirada</th>
                                        <th>Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {agendadas.map((s) => (
                                        <tr key={s.id} className={styles.tr_body}>
                                            <td data-label="Beneficiário">{s.nome}</td>
                                            <td data-label="Célula / Rede">{[s.lider_celula, s.rede].filter(Boolean).join(' / ')}</td>
                                            <td data-label="Solicitante">{s.nomeSolicitante}</td>
                                            <td data-label="Data de retirada">{formatarData(s.dataRetirada)}</td>
                                            <td data-label="Ação">
                                                <Botao
                                                    nome="Confirmar Entrega"
                                                    corFundo="#207556"
                                                    corBorda="#155c42"
                                                    onClick={() => handleConfirmarEntrega(s.id, s.nome)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SolicitacoesCestas;
