import styles from './Cestas.module.scss';

import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import { IoMdSearch } from "react-icons/io";
import { MdOutlineModeEdit } from "react-icons/md";
import { FaPlus, FaFileExcel, FaBoxOpen, FaWeightHanging, FaHandHoldingHeart } from "react-icons/fa6"; 

import get from '../../../services/requests/get';
import Botao from '../../../components/gerais/Botao'; 

// REMOVIDO PROPS DE MODO DESATIVADO
function Cestas(){
    const [busca, setBusca] = useState('');
    const [cestas, setCestas] = useState([]);
    const navigate = useNavigate();
    
    // Filtros
    const [modoData, setModoData] = useState("todos");
    const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
    const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);
    const [filtroTipo, setFiltroTipo] = useState("todos");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCestas = async () => {
        setLoading(true);
        setError(null);
        try{
            const response = await get.cestas();
            const dados = response.data;

            if(Array.isArray(dados)){
                // REMOVIDO FILTRO DE STATUS - Agora mostra tudo
                setCestas(dados);
            }else{
                console.error("6003:Formato inesperado:", response);
                setError("Erro ao carregar dados.");
            }

        } catch(error){
            console.error("6003:Erro ao obter doações!", error);   
            setError("Não foi possível buscar os registros.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCestas();
    }, []);

    const handleBuscaChange = (e) => {
        setBusca(e.target.value);
    };

    // --- LÓGICA DE FILTRAGEM ---
    const dadosFiltrados = cestas.filter((cesta) => {
        const termoBusca = busca.toLowerCase();
        
        let dataItem = '';
        if (cesta.dataEntrega) {
            dataItem = new Date(cesta.dataEntrega).toISOString().split('T')[0];
        }

        // 1. Texto
        const matchTexto = (cesta.contato?.includes(termoBusca) || cesta.nome?.toLowerCase().includes(termoBusca));
        
        // 2. Tipo
        const matchTipo = (filtroTipo === "todos" || cesta.tipo === filtroTipo);

        // 3. Data
        let matchData = true;
        if (modoData === "especifica") {
            matchData = (dataItem === dataInicio);
        } else if (modoData === "intervalo") {
            matchData = (dataItem >= dataInicio && dataItem <= dataFim);
        }

        return matchTexto && matchTipo && matchData;
    });

    const totalEntregas = dadosFiltrados.length;
    const totalPeso = dadosFiltrados.reduce((acc, item) => acc + (parseFloat(item.peso) || 0), 0);
    const totalVoluntarios = dadosFiltrados.filter(item => item.voluntario === true).length;

    // --- EXPORTAÇÃO (Status removido) ---
    const handleExportar = () => {
        if (dadosFiltrados.length === 0) {
            alert("Não há dados para exportar com os filtros atuais.");
            return;
        }
        // Removido cabeçalho Status
        const header = ["Nome;CPF;Contato;Voluntário;Rede;Lider;Pastor;Tipo;Peso(kg);Descricao;Frequencia;Data Entrega;Responsavel"];

        const rows = dadosFiltrados.map(item => {
            const dataFormatada = item.dataEntrega ? new Date(item.dataEntrega + "T00:00:00").toLocaleDateString('pt-BR') : '-';
            const voluntarioLabel = item.voluntario ? 'Sim' : 'Não';
            const limparTexto = (txt) => txt ? String(txt).replace(/;/g, " - ") : "";

            return [
                limparTexto(item.nome),
                limparTexto(item.cpf),
                limparTexto(item.contato),
                voluntarioLabel,
                limparTexto(item.rede),
                limparTexto(item.lider_celula),
                limparTexto(item.pastor_rede),
                limparTexto(item.tipo),
                item.peso || '',
                limparTexto(item.itens_doados),
                limparTexto(item.frequencia),
                dataFormatada,
                limparTexto(item.responsavel)
                // Removido statusLabel
            ].join(";"); 
        });

        const csvContent = [header, ...rows].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Doacoes_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleEditClick = (id) => {
        navigate(`/app/cestas/editar/${id}`);
    };

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2 className={styles.title}>Controle de Doações</h2>
                    </div>
                    
                    <div className={styles.filters}>
                        <div className={styles.container_busca}>
                            <IoMdSearch className={styles.icon_busca}/>
                            <input 
                                className={styles.busca} 
                                type='text'
                                placeholder='Buscar por nome...'
                                value={busca}
                                onChange={handleBuscaChange}
                            />
                        </div>
                        
                        <div className={styles.botoes}>
                            <select
                                className={styles.select_sala}
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                            >
                                <option value="todos">Todos Tipos</option>
                                <option value="ALIMENTO">Alimentos</option>
                                <option value="VESTUARIO">Roupas</option>
                                <option value="HIGIENE">Higiene</option>
                                <option value="MOVEIS">Móveis</option>
                                <option value="BRINQUEDOS">Brinquedos</option>
                                <option value="OUTROS">Outros</option>
                            </select>

                            <select
                                className={styles.select_sala}
                                value={modoData}
                                onChange={(e) => setModoData(e.target.value)}
                            >
                                <option value="todos">Todas as Datas</option>
                                <option value="especifica">Data Específica</option>
                                <option value="intervalo">Intervalo</option>
                            </select>
                            
                            {modoData === "especifica" && (
                                <input
                                    className={styles.select_sala}
                                    type="date"
                                    value={dataInicio}
                                    onChange={(e) => setDataInicio(e.target.value)}
                                />
                            )}

                            {modoData === "intervalo" && (
                                <div className={styles.intervaloContainer}>
                                    <input
                                        className={styles.select_sala}
                                        type="date"
                                        value={dataInicio}
                                        onChange={(e) => setDataInicio(e.target.value)}
                                    />
                                    <span className={styles.ate}>até</span>
                                    <input
                                        className={styles.select_sala}
                                        type="date"
                                        value={dataFim}
                                        onChange={(e) => setDataFim(e.target.value)}
                                    />
                                </div>
                            )}

                            <Botao 
                                nome="Exportar"
                                corFundo="#217346" 
                                corBorda="#107C41"
                                type="button"
                                onClick={handleExportar}
                            >
                                <FaFileExcel />
                            </Botao>
                        </div>
                    </div>
                </div>

                {!loading && !error && (
                    <div className={styles.dashboard}>
                        <div className={styles.card}>
                            <div className={`${styles.iconContainer} ${styles.blue}`}>
                                <FaBoxOpen />
                            </div>
                            <div className={styles.cardInfo}>
                                <span>Total de Entregas</span>
                                <h3>{totalEntregas}</h3>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <div className={`${styles.iconContainer} ${styles.green}`}>
                                <FaWeightHanging />
                            </div>
                            <div className={styles.cardInfo}>
                                <span>Peso Total (Kg)</span>
                                <h3>{totalPeso.toFixed(1)} kg</h3>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <div className={`${styles.iconContainer} ${styles.orange}`}>
                                <FaHandHoldingHeart />
                            </div>
                            <div className={styles.cardInfo}>
                                <span>Voluntários</span>
                                <h3>{totalVoluntarios}</h3>
                            </div>
                        </div>
                    </div>
                )}

                {error && <div style={{color: '#C70039', textAlign: 'center', padding: '0.5rem'}}>{error}</div>}

                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr className={styles.tr_head}>
                                <th>Nome</th>
                                <th>Rede</th>
                                <th>Tipo</th>
                                <th>Responsável</th>
                                <th>Data</th>
                                <th className={styles.edicao}>Ação</th>
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {loading ? (
                                <tr><td colSpan="6" className={styles.empty}>Carregando...</td></tr>
                            ) : (
                                dadosFiltrados.length > 0 ? (
                                    dadosFiltrados.map((item) => (
                                        <tr key={item.id} className={styles.tr_body}>
                                            <td data-label="Nome">{item.nome}</td>
                                            <td data-label="Rede">{item.rede || '-'}</td>
                                            <td data-label="Tipo">
                                                <span className={`${styles.badge} ${styles[item.tipo]}`}>
                                                    {item.tipo || 'OUTROS'}
                                                </span>
                                            </td>
                                            <td data-label="Responsável">{item.responsavel || '-'}</td>
                                            <td data-label="Data">
                                                {item.dataEntrega 
                                                    ? new Date(item.dataEntrega + "T00:00:00").toLocaleDateString('pt-BR') 
                                                    : '-'}
                                            </td>
                                            <td className={styles.edicao} data-label="Ações">
                                                <MdOutlineModeEdit 
                                                    className={styles.icon_editar}
                                                    onClick={()=>handleEditClick(item.id)}
                                                    title="Editar"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className={styles.empty}>
                                            Nenhum registro encontrado.
                                        </td>
                                    </tr>
                                )
                            )}

                            {!loading && (
                                <tr className={styles.plus} onClick={()=>navigate("/app/cestas/criar")}>
                                    <td colSpan="6"><FaPlus className={styles.icon_plus}/> Nova Doação</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Cestas;