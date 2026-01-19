import styles from './AlunosDesativados.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { MdOutlineModeEdit } from "react-icons/md";
import { IoMdSearch, IoMdArrowRoundBack } from "react-icons/io";

import get from '../../../services/requests/get';

function AlunosDesativados(){
    const [busca, setBusca] = useState('');
    const [alunos, setAlunos] = useState([]);
    const [loading, setLoading] = useState(true); // Novo estado
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAlunos = async () => {
            setLoading(true);
            try {
                const response = await get.discente();
                const objetoDados = response.data;

                if (Array.isArray(objetoDados)) {
                    // Filtra apenas os desativados (status string 'false' ou booleano false)
                    const alunosDesativados = objetoDados.filter(aluno => 
                        String(aluno.status) === 'false'
                    );
                    setAlunos(alunosDesativados);
                } else {
                    console.error("5003:Formato inesperado:", response);
                    setError("Erro ao carregar dados.");
                }
            } catch (error) {
                console.error("5004:Erro na requisição:", error);
                setError("Não foi possível buscar os alunos.");
            } finally {
                setLoading(false);
            }
        };

        fetchAlunos();
    }, []);

    const handleEditClick = (matricula) => {
        navigate(`/app/aluno/editar/${matricula}`);
    };

    const handleBuscaChange = (e) => {
        setBusca(e.target.value);
    };

    const alunosFiltrados = alunos.filter((aluno) => {
        const termoBusca = busca.toLowerCase();
        return (
            aluno.matricula.toString().includes(termoBusca) ||
            aluno.nome.toLowerCase().includes(termoBusca)   ||
            (aluno.nome_pai || '').toLowerCase().includes(termoBusca) ||
            (aluno.nome_mae || '').toLowerCase().includes(termoBusca)
        );
    });

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)}/>
                        <h2 className={styles.title}>Alunos Desativados</h2>
                    </div>
                    
                    <div className={styles.filters}>
                        <div className={styles.container_busca}>
                            <IoMdSearch className={styles.icon_busca}/>
                            <input 
                                className={styles.busca} 
                                type='text'
                                placeholder='Buscar por nome ou matrícula...'
                                name='busca'
                                value={busca}
                                onChange={handleBuscaChange}
                            />
                        </div>
                    </div>
                </div>

                {error && <div style={{color: '#C70039', textAlign: 'center', padding: '0.5rem'}}>{error}</div>}

                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr className={styles.tr_head}>
                                <th>Matrícula</th>
                                <th>Nome</th>
                                <th>Responsável</th>
                                <th className={styles.edicao}>Edição</th>
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className={styles.empty}>Carregando...</td>
                                </tr>
                            ) : (
                                alunosFiltrados.length > 0 ? (
                                    alunosFiltrados.map((aluno) => (
                                        <tr key={aluno.matricula} className={styles.tr_body}>
                                            <td data-label="Matrícula">{aluno.matricula}</td>
                                            <td data-label="Nome">{aluno.nome}</td>
                                            <td data-label="Responsável">{aluno.nome_pai || aluno.nome_mae || '-'}</td>
                                            <td className={styles.edicao} data-label="Ações">
                                                <MdOutlineModeEdit 
                                                    className={styles.icon_editar}
                                                    onClick={()=>handleEditClick(aluno.matricula)}
                                                    title="Editar Aluno"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className={styles.empty}>Nenhum aluno desativado encontrado.</td>
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

export default AlunosDesativados;