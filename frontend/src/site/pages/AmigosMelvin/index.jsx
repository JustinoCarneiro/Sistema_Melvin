import styles from './AmigosMelvin.module.scss';

import { useNavigate } from "react-router-dom";

function AmigosMelvin(){
    const navigate = useNavigate();

    return(
        <div className={styles.body}>
                <div className={styles.imagens}>
                    <div className={styles.imagem_front}></div>
                    <div className={styles.imagem_back}></div>
                </div>
                <div className={styles.conteudo}>
                    <h2 className={styles.title}>Amigos do Melvin</h2>
                    <p className={styles.texto}>Lorem Ipsum é simplesmente uma simulação de texto da  indústria tipográfica e de impressos, e vem sendo utilizado desde o  século XVI, quando um impressor desconhecido pegou uma bandeja de tipmax-width: $size-bos e  os embaralhou para fazer um livro de modelos de tipos. Lorem Ipsum  sobreviveu não só a cinco séculos, como também ao salto para a  editoração eletrônica, permanecendo essencialmente inalterado. Se  popularizou na década de 60, quando a Letraset lançou decalques contendo  passagens de Lorem Ipsum, e mais recentemente quando passou a ser  integrado a softwares de editoração eletrônica como Aldus PageMaker.</p>
                    <button className={styles.button} onClick={() => navigate("/cadastroamigo")}>Quero ser um amigo!</button>
                </div>
        </div>
    )
}

export default AmigosMelvin;