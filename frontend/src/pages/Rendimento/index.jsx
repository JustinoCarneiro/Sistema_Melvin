import styles from './Rendimento.module.scss';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

import get from '../../services/requests/get';
import put from '../../services/requests/put'; // Importe o put
import StarRating from '../../components/gerais/StarRating';
import Botao from '../../components/gerais/Botao';
import { IoMdArrowRoundBack } from "react-icons/io";

function Rendimento() {
    const { matricula } = useParams();
    const navigate = useNavigate();
    const [aluno, setAluno] = useState(null);
    const [avaliacoes, setAvaliacoes] = useState({});
    const [userRole, setUserRole] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const podeAvaliarGeral = ['ADM', 'DIRE', 'COOR'].includes(userRole);
    const podeAvaliarPsico = userRole === 'PSICO';

    useEffect(() => {
        setUserRole(Cookies.get('role'));
        const fetchData = async () => {
            setLoading(true);
            try {
                const alunoRes = await get.discenteByMatricula(matricula);
                setAluno(alunoRes.data);
                setAvaliacoes({
                    avaliacaoPresenca: alunoRes.data.avaliacaoPresenca,
                    avaliacaoParticipacao: alunoRes.data.avaliacaoParticipacao,
                    avaliacaoComportamento: alunoRes.data.avaliacaoComportamento,
                    avaliacaoRendimento: alunoRes.data.avaliacaoRendimento,
                    avaliacaoPsicologico: alunoRes.data.avaliacaoPsicologico,
                });
            } catch (err) {
                setError(err.message || 'Erro ao carregar dados.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [matricula]);

    const handleRate = (categoria, nota) => {
        setAvaliacoes(prev => ({ ...prev, [categoria]: nota }));
    };

    const handleSave = async () => {
        setError('');
        try {
            await put.discenteAvaliacoes(matricula, avaliacoes);
            alert('Avaliações salvas com sucesso!');
        } catch(err) {
            setError(err.message || 'Erro ao salvar avaliações.');
        }
    };

    if (loading) return <div>Carregando...</div>;
    if (error) return <div>{error}</div>;

    const categorias = [
        { id: 'avaliacaoPresenca', nome: 'Presença', editavel: podeAvaliarGeral },
        { id: 'avaliacaoParticipacao', nome: 'Participação', editavel: podeAvaliarGeral },
        { id: 'avaliacaoComportamento', nome: 'Comportamento', editavel: podeAvaliarGeral },
        { id: 'avaliacaoRendimento', nome: 'Rendimento', editavel: podeAvaliarGeral },
        { id: 'avaliacaoPsicologico', nome: 'Psicológico', editavel: podeAvaliarPsico },
    ];

    return (
        <div className={styles.body}>
            <div className={styles.linha_voltar}>
                <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)} />
            </div>
            <div className={styles.header}>
                <h2>Rendimento do Aluno</h2>
                <p><strong>Nome:</strong> {aluno?.nome}</p>
            </div>

            <div className={styles.avaliacoesContainer}>
                {categorias.map(cat => (
                    <div key={cat.id} className={`${styles.aulaItem} ${!cat.editavel ? styles.disabled : ''}`}>
                        <h4>{cat.nome}</h4>
                        <StarRating 
                            initialRating={avaliacoes[cat.id] || 0}
                            onRate={(nota) => cat.editavel && handleRate(cat.id, nota)} 
                        />
                    </div>
                ))}
            </div>
            
            {(podeAvaliarGeral || podeAvaliarPsico) && (
                 <div className={styles.saveButtonContainer}>
                    <Botao nome="Salvar Avaliações" onClick={handleSave} corFundo="#F29F05"/>
                </div>
            )}
        </div>
    );
}

export default Rendimento;