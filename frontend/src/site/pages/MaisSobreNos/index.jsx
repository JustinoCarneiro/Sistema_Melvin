import styles from './MaisSobreNos.module.scss';

import { useState, useEffect} from "react";
import get from '../../../services/requests/get';

import objetivo1 from '../../../docs/objetivo1.png';
import objetivo3 from '../../../docs/objetivo3.png';
import objetivo4 from '../../../docs/objetivo4.png';
import objetivo16 from '../../../docs/objetivo16.png';

function MaisSobreNos(){

    const [voluntarios, setVoluntarios] = useState([]);
    
    useEffect(() => {
        const fetchVoluntarios = async () => {
            try {
                const response = await get.voluntarioNomesFuncoes();
                console.log("response", response);
                if (response.status === 200) {
                    setVoluntarios(response.data);
                    console.log("dados", response.data);
                }
            } catch (error) {
                console.error("Erro ao buscar dados dos funcionários:", error);
            }
        };

        fetchVoluntarios();
    }, []);

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    return(
        <div className={styles.body}>
            <div className={styles.faixa_instmelvin}>
                <div className={styles.conteudo}>
                    <h2 className={styles.title}>Instituto Melvin Huber</h2>
                    <p className={styles.paragrafo_acima}>
                        <p>O Instituto Melvin trabalha no espaço de contra turno escolar, criado para fortalecer os vínculos familiares e sociais, reforçar e garantir a aquisição do conhecimento formal, descobrir e ativar potenciais através de escolas/oficinas de arte, esporte, cursos profissionalizantes, palestras, rodas de conversa e terapias de grupo.</p>
                        <p>Objetiva prevenir a marginalidade de crianças e adolescentes, bem como, construir e reconstruir famílias através de um trabalho focado no ensino por princípios, com vistas à formação do caráter e do núcleo familiar.</p>
                        <p>O Instituto Melvin recebeu esse nome para homenagear e honrar o trabalho do missionário norte-americano Melvin Edward Huber (1920-2008). Nascido no estado americano de Indiana, casado com Catherine Von tobel, deixaram a vida confortável e promissora nos EUA e mudaram para o Brasil em 1956 onde serviram por 52 anos. Deixaram um legado de compaixão e intensa dedicação às pessoas.</p>
                    </p>
                </div>
                <div className={styles.imagens}>
                    <div className={styles.imagem_es}></div>
                    <div className={styles.imagem_ei}></div>
                    <div className={styles.imagem_ds}></div>
                    <div className={styles.imagem_di}></div>
                </div>
            </div>
            <div className={styles.faixa_objetivos}>
                <h3 className={styles.title_faixa_objetivo}>Objetivos</h3>
                <div className={styles.objetivos}>
                    <div className={styles.caixa_objetivo}>
                        <div className={styles.imagem_objetivo}>
                            <img src={objetivo1} alt="objetivo 1" className={styles.img}/>
                        </div>
                    </div>
                    <div className={styles.caixa_objetivo}>
                        <div className={styles.imagem_objetivo}>
                            <img src={objetivo3} alt="objetivo 3" className={styles.img}/>
                        </div>
                    </div>
                    <div className={styles.caixa_objetivo}>
                        <div className={styles.imagem_objetivo}>
                            <img src={objetivo4} alt="objetivo 4" className={styles.img}/>
                        </div>
                    </div>
                    <div className={styles.caixa_objetivo}>
                        <div className={styles.imagem_objetivo}>
                            <img src={objetivo16} alt="objetivo 16" className={styles.img}/>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.faixa_valores}>
                <div className={styles.caixa_valor}>
                    <h4 className={styles.title_valor}>Missão</h4>
                    <p className={styles.descricao_valor}>
                        Promover o desenvolvimento integral de crianças e adolescentes e
                        suas famílias com vista ao exercício de sua plena cidadania.
                    </p>
                </div>
                <div className={styles.caixa_valor}>
                    <h4 className={styles.title_valor}>Visão</h4>
                    <p className={styles.descricao_valor}>
                        Ser uma instituição que serve com responsabilidade e amor às
                        crianças buscando sempre proporcionar o desenvolvimento físico,
                        emocional e espiritual, fortalecendo os vínculos familiares.
                    </p>
                </div>
                <div className={styles.caixa_valor}>
                    <h4 className={styles.title_valor}>Valores</h4>
                    <p className={styles.descricao_valor}>
                        Ambiente de Amor, Solidariedade, Transparência, Misericórdia, Ética, Amizade, Compromisso, Obediência, Respeito ao Próximo, Serviço.
                    </p>
                </div>
            </div>
            <div className={styles.faixa_voluntarios}>
                <h4 className={styles.title_faixa_voluntarios}>Corpo de voluntários</h4>
                <div className={styles.grid_voluntarios}>
                    {voluntarios.slice(1).map((voluntario, index) => (
                        <div key={index} className={styles.linha}>
                            <p className={styles.funcao}>{capitalizeFirstLetter(voluntario.funcao)}</p>
                            <p className={styles.nome}>{voluntario.nome}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MaisSobreNos;