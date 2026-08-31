import styles from './List.module.scss';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import { IoMdSearch } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";

import Botao from '@core/components/gerais/Botao';

import ocorrenciaTecnicaService from "../api/ocorrenciaTecnicaService";

const CATEGORIA_LABELS = {
    BUG: 'Bug',
    INCIDENTE: 'Incidente',
    MANUTENCAO: 'Manutenção',
    DECISAO_TECNICA: 'Decisão Técnica',
    SEGURANCA: 'Segurança'
};

const SEVERIDADE_LABELS = {
    BAIXA: 'Baixa',
    MEDIA: 'Média',
    ALTA: 'Alta'
};

function OcorrenciasTecnicas(){
    const [busca, setBusca] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('todos');
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [ocorrencias, setOcorrencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchOcorrencias = async () => {
        setLoading(true);
        setError(null);
        try{
            const response = await ocorrenciaTecnicaService.list();
            const dados = response.data;

            if(Array.isArray(dados)){
                setOcorrencias(dados);
            } else {
                console.error("Formato inesperado no response:", response);
                setError("Erro ao carregar dados.");
            }
        } catch(error){
            console.error("Erro ao obter ocorrências técnicas!", error);
            setError("Não foi possível obter a lista de ocorrências técnicas.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchOcorrencias();
    }, []);

    const handleAlternarResolvido = async (id) => {
        try {
            await ocorrenciaTecnicaService.alternarResolvido(id);
            fetchOcorrencias();
        } catch (error) {
            console.error('Erro ao alternar status da ocorrência técnica!', error);
            alert('Não foi possível atualizar o status.');
        }
    };

    const ocorrenciasFiltradas = ocorrencias.filter((o) => {
        const termoBusca = busca.toLowerCase();
        const combinaBusca = (o.titulo || '').toLowerCase().includes(termoBusca)
            || (o.descricao || '').toLowerCase().includes(termoBusca);
        const combinaCategoria = filtroCategoria === 'todos' || o.categoria === filtroCategoria;
        const combinaStatus = filtroStatus === 'todos'
            || (filtroStatus === 'resolvido' && o.resolvido)
            || (filtroStatus === 'pendente' && !o.resolvido);
        return combinaBusca && combinaCategoria && combinaStatus;
    });

    return (
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Ocorrências Técnicas</h2>

                    <div className={styles.filters}>
                        <div className={styles.container_busca}>
                            <IoMdSearch className={styles.icon_busca}/>
                            <input
                                className={styles.busca}
                                type='text'
                                placeholder='Buscar por título ou descrição...'
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />
                        </div>

                        <select className={styles.select} value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                            <option value="todos">Todas Categorias</option>
                            {Object.entries(CATEGORIA_LABELS).map(([valor, rotulo]) => (
                                <option key={valor} value={valor}>{rotulo}</option>
                            ))}
                        </select>

                        <select className={styles.select} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                            <option value="todos">Todos os Status</option>
                            <option value="pendente">Pendente</option>
                            <option value="resolvido">Resolvido</option>
                        </select>

                        <div className={styles.botoes}>
                            <Botao
                                nome="Nova Ocorrência"
                                corFundo="#1A4D80"
                                corBorda="#12365B"
                                type="button"
                                onClick={() => navigate(`/app/ocorrencias-tecnicas/criar`)}
                            >
                                <FaPlus />
                            </Botao>
                        </div>
                    </div>
                </div>

                {error && <div style={{color: '#C70039', textAlign: 'center', padding: '0.5rem'}}>{error}</div>}

                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr className={styles.tr_head}>
                                <th>Título</th>
                                <th>Categoria</th>
                                <th>Severidade</th>
                                <th>Data</th>
                                <th>Autor</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className={styles.empty}>Carregando...</td>
                                </tr>
                            ) : (
                                ocorrenciasFiltradas.length > 0 ? (
                                    ocorrenciasFiltradas.map((o) => (
                                        <tr key={o.id} className={styles.tr_body}>
                                            <td data-label="Título">{o.titulo}</td>
                                            <td data-label="Categoria">{CATEGORIA_LABELS[o.categoria] || o.categoria}</td>
                                            <td data-label="Severidade">
                                                <span className={`${styles.badgeSeveridade} ${styles[o.severidade]}`}>
                                                    {SEVERIDADE_LABELS[o.severidade] || o.severidade}
                                                </span>
                                            </td>
                                            <td data-label="Data">{o.dataOcorrencia}</td>
                                            <td data-label="Autor">{o.autorLogin}</td>
                                            <td data-label="Status">
                                                <span
                                                    className={`${styles.badgeStatus} ${o.resolvido ? styles.resolvido : styles.pendente}`}
                                                    onClick={() => handleAlternarResolvido(o.id)}
                                                    title="Clique para alternar o status"
                                                >
                                                    {o.resolvido ? 'Resolvido' : 'Pendente'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className={styles.empty}>
                                            Nenhuma ocorrência técnica encontrada.
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default OcorrenciasTecnicas;
