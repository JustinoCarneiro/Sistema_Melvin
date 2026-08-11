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

function SolicitacoesCestas() {
    const navigate = useNavigate();
    const { hasPermission, loading: loadingPerms } = usePermissions();
    const podeGerenciar = hasPermission('GERENCIAR_CESTAS');

    const [solicitacoes, setSolicitacoes] = useState([]);
    const [datasRetirada, setDatasRetirada] = useState({});
    const [qrCodes, setQrCodes] = useState({});
    const [tokenCheckin, setTokenCheckin] = useState('');
    const [mensagem, setMensagem] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSolicitacoes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await cestaService.listarSolicitacoes();
            setSolicitacoes(response.data || []);
        } catch (error) {
            setMensagem({ tipo: 'erro', texto: 'Não foi possível carregar as solicitações.' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSolicitacoes();
    }, [fetchSolicitacoes]);

    const handleValidar = async (id) => {
        const dataRetirada = datasRetirada[id];
        if (!dataRetirada) {
            setMensagem({ tipo: 'erro', texto: 'Informe a data de retirada antes de validar.' });
            return;
        }

        setMensagem(null);
        try {
            const response = await cestaService.validar(id, dataRetirada);
            const token = response.data.qrCodeToken;
            const url = await cestaService.getQrCodeUrl(token);
            setQrCodes(prev => ({ ...prev, [id]: { url, token } }));
            setMensagem({ tipo: 'sucesso', texto: 'Solicitação agendada. QR Code gerado abaixo.' });
            await fetchSolicitacoes();
        } catch (error) {
            setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao validar solicitação.' });
        }
    };

    const handleCheckin = async (e) => {
        e.preventDefault();
        setMensagem(null);
        try {
            const response = await cestaService.checkin(tokenCheckin.trim());
            setMensagem({
                tipo: 'sucesso',
                texto: `Entrega confirmada para ${response.data.nome || 'beneficiário'}.`
            });
            setTokenCheckin('');
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
                    <h3 className={styles.subtitulo}>Confirmar entrega (check-in)</h3>
                    <form className={styles.checkinBox} onSubmit={handleCheckin}>
                        <input
                            className={styles.input}
                            type="text"
                            value={tokenCheckin}
                            onChange={(e) => setTokenCheckin(e.target.value)}
                            placeholder="Escaneie o QR Code ou cole o código aqui"
                        />
                        <Botao nome="Confirmar Entrega" corFundo="#207556" corBorda="#155c42" type="submit" />
                    </form>
                </div>

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
                                        <tr key={s.id}>
                                            <td>{s.nomeSolicitante}</td>
                                            <td>{ROTULO_NIVEL[s.nivelSolicitante] || s.nivelSolicitante}</td>
                                            <td>{s.nome}</td>
                                            <td>{[s.lider_celula, s.rede].filter(Boolean).join(' / ')}</td>
                                            <td>
                                                <input
                                                    className={styles.input}
                                                    type="date"
                                                    value={datasRetirada[s.id] || ''}
                                                    onChange={(e) => setDatasRetirada(prev => ({ ...prev, [s.id]: e.target.value }))}
                                                />
                                            </td>
                                            <td>
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

                {Object.entries(qrCodes).map(([id, qr]) => (
                    <div key={id} className={styles.qrCodeArea}>
                        <h3 className={styles.subtitulo}>QR Code da retirada</h3>
                        <img src={qr.url} alt="QR Code da solicitação" />
                        <p>Código: {qr.token}</p>
                        <p className={styles.vazio}>Imprima ou envie para o beneficiário apresentar na retirada.</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SolicitacoesCestas;
