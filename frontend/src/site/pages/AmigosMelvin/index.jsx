import styles from './AmigosMelvin.module.scss';

import { useNavigate } from "react-router-dom";

import foto_principal from "../../../docs/imagem_amigomelvin.jpeg";

function AmigosMelvin(){
    const navigate = useNavigate();

    return(
        <div className={styles.body}>
                <div className={styles.imagens}>
                    <div className={styles.imagem_front}>
                        <img src={foto_principal} alt="foto_principal" className={styles.img}/>
                    </div>
                    <div className={styles.imagem_back}></div>
                </div>
                <div className={styles.conteudo}>
                    <h2 className={styles.title}>Amigos do Melvin</h2>
                    <p className={styles.texto}>
                        <p>
                            Faça a diferença na vida de nossas crianças ao apoiar o Instituto Melvin! Com sua doação mensal, você contribui 
                            diretamente para a alimentação de nossos alunos e para a distribuição de cestas básicas para suas famílias.
                        </p>
                        <p>
                            Hoje, contamos com a parceria de pessoas incríveis que fazem parte do projeto Amigos do Melvin.
                        </p>
                        <p>
                            Junte-se a nós e faça parte dessa corrente do bem!
                        </p>
                        <p>
                            Sua contribuição é fundamental para transformar vidas. Inscreva-se agora e seja um agente de mudança!
                        </p>
                          
                    </p>
                    <button className={styles.button} onClick={() => navigate("/cadastroamigo")}>Quero ser um amigo!</button>
                </div>
        </div>
    )
}

export default AmigosMelvin;