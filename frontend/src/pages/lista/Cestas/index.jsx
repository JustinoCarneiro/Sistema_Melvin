import styles from './Cestas.module.scss';

import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import { IoMdSearch } from "react-icons/io";
import { MdOutlineModeEdit } from "react-icons/md";
import { FaPlus, FaFileExcel, FaBoxOpen, FaWeightHanging, FaHandHoldingHeart } from "react-icons/fa6"; 

import get from '../../../services/requests/get';
import Botao from '../../../components/gerais/Botao'; 

function Cestas(){
    const [busca, setBusca] = useState('');
    const [cestas, setCestas] = useState([]);
    const navigate = useNavigate();
    
    // Filtros
    const [modoData, setModoData] = useState("todos");
    const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
    const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);
    const [filtroTipo, setFiltroTipo] = useState("todos");
    const [filtroOperacao, setFiltroOperacao] = useState("todas");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCestas = async () => {
        setLoading(true);
        setError(null);
        try{
            const response = await get.cestas();
            const dados = response.data;

            if(Array.isArray(dados)){
                const dadosTratados = dados.map(c => ({
                    ...c,
                    operacao: c.operacao || 'SAIDA' 
                }));
                setCestas(dadosTratados);
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

        // 1. Texto (Busca por nome, contato ou rede)
        const matchTexto = (
            cesta.contato?.includes(termoBusca) || 
            cesta.nome?.toLowerCase().includes(termoBusca) ||
            cesta.rede?.toLowerCase().includes(termoBusca) // Adicionado busca por rede, útil para entradas
        );
        
        // 2. Tipo
        const matchTipo = (filtroTipo === "todos" || cesta.tipo === filtroTipo);

        // 3. Operação (Entrada/Saída)
        const matchOperacao = (filtroOperacao === "todas" || cesta.operacao === filtroOperacao);

        // 4. Data
        let matchData = true;
        if (modoData === "especifica") {
            matchData = (dataItem === dataInicio);
        } else if (modoData === "intervalo") {
            matchData = (dataItem >= dataInicio && dataItem <= dataFim);
        }

        return matchTexto && matchTipo && matchOperacao && matchData;
    });

    // --- CÁLCULOS DE ESTOQUE (DASHBOARD) ---
    const totalEntradas = dadosFiltrados
        .filter(item => item.operacao === 'ENTRADA')
        .reduce((acc, item) => acc + (parseFloat(item.peso) || 0), 0);
        
    const totalSaidas = dadosFiltrados
        .filter(item => item.operacao === 'SAIDA')
        .reduce((acc, item) => acc + (parseFloat(item.peso) || 0), 0);
        
    const saldoEstoque = totalEntradas - totalSaidas;

    // --- EXPORTAÇÃO ---
    const handleExportar = () => {
        if (dadosFiltrados.length === 0) {
            alert("Não há dados para exportar com os filtros atuais.");
            return;
        }
        
        const header = ["Operacao;Nome/Origem;CPF;Contato;Voluntário;Rede;Lider;Pastor;Tipo;Peso(kg);Descricao;Frequencia;Data;Staff"];

        const rows = dadosFiltrados.map(item => {
            const dataFormatada = item.dataEntrega ? new Date(item.dataEntrega + "T00:00:00").toLocaleDateString('pt-BR') : '-';
            const voluntarioLabel = item.voluntario ? 'Sim' : 'Não';
            const limparTexto = (txt) => txt ? String(txt).replace(/;/g, " - ") : "";
            
            // Tratamento para nome vazio (Entradas)
            let nomeExport = limparTexto(item.nome);
            if (!nomeExport && item.operacao === 'ENTRADA') nomeExport = `Doação (${limparTexto(item.rede)})`;

            return [
                item.operacao,
                nomeExport,
                limparTexto(item.cpf),
                limparTexto(item.contato),
                voluntarioLabel,
                limparTexto(item.rede),
                limparTexto(item.lider_celula),
                limparTexto(item.pastor_rede),
                limparTexto(item.tipo),
                item.peso || '0',
                limparTexto(item.itens_doados),
                limparTexto(item.frequencia),
                dataFormatada,
                limparTexto(item.responsavel)
            ].join(";"); 
        });

        const csvContent = [header, ...rows].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Fluxo_Doacoes_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`);
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
                        <h2 className={styles.title}>Fluxo de Doações</h2>
                    </div>
                    
                    <div className={styles.filters}>
                        <div className={styles.container_busca}>
                            <IoMdSearch className={styles.icon_busca}/>
                            <input 
                                className={styles.busca} 
                                type='text'
                                placeholder='Buscar pessoa ou rede...'
                                value={busca}
                                onChange={handleBuscaChange}
                            />
                        </div>
                        
                        <div className={styles.botoes}>
                            {/* --- FILTRO DE OPERAÇÃO --- */}
                            <select
                                className={styles.select_sala}
                                value={filtroOperacao}
                                onChange={(e) => setFiltroOperacao(e.target.value)}
                            >
                                <option value="todas">🔄 Entradas e Saídas</option>
                                <option value="ENTRADA">📥 Apenas Entradas</option>
                                <option value="SAIDA">📤 Apenas Saídas</option>
                            </select>

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
                                <span>Total Arrecadado (Entradas)</span>
                                <h3>{totalEntradas.toFixed(1)} kg</h3>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <div className={`${styles.iconContainer} ${styles.orange}`}>
                                <FaHandHoldingHeart />
                            </div>
                            <div className={styles.cardInfo}>
                                <span>Total Entregue (Saídas)</span>
                                <h3>{totalSaidas.toFixed(1)} kg</h3>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <div className={`${styles.iconContainer} ${styles.green}`}>
                                <FaWeightHanging />
                            </div>
                            <div className={styles.cardInfo}>
                                <span>Saldo em Estoque</span>
                                <h3 style={{color: saldoEstoque < 0 ? '#c62828' : 'inherit'}}>
                                    {saldoEstoque.toFixed(1)} kg
                                </h3>
                            </div>
                        </div>
                    </div>
                )}

                {error && <div style={{color: '#C70039', textAlign: 'center', padding: '0.5rem'}}>{error}</div>}

                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr className={styles.tr_head}>
                                <th style={{width: '5%', textAlign: 'center'}}>Op.</th>
                                <th>Pessoa / Origem</th>
                                <th>Rede</th>
                                <th>Tipo</th>
                                <th>Responsável</th>
                                <th>Data</th>
                                <th className={styles.edicao}>Ação</th>
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {loading ? (
                                <tr><td colSpan="7" className={styles.empty}>Carregando...</td></tr>
                            ) : (
                                dadosFiltrados.length > 0 ? (
                                    dadosFiltrados.map((item) => (
                                        <tr key={item.id} className={styles.tr_body}>
                                            <td data-label="Operação" style={{textAlign: 'center'}}>
                                                {item.operacao === 'ENTRADA' ? 
                                                    <span title="Entrada" style={{fontSize: '1.2rem'}}>📥</span> : 
                                                    <span title="Saída" style={{fontSize: '1.2rem'}}>📤</span>
                                                }
                                            </td>
                                            <td data-label="Pessoa/Origem">
                                                {/* Se tem nome, mostra o nome. Se não tem (Entrada), mostra a Rede */}
                                                {item.nome ? item.nome : <span style={{color: '#888', fontStyle: 'italic'}}>Doação ({item.rede || 'Anônima'})</span>}
                                            </td>
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
                                        <td colSpan="7" className={styles.empty}>
                                            Nenhum registro encontrado.
                                        </td>
                                    </tr>
                                )
                            )}

                            {!loading && (
                                <tr className={styles.plus} onClick={()=>navigate("/app/cestas/criar")}>
                                    <td colSpan="7"><FaPlus className={styles.icon_plus}/> Novo Registro</td>
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