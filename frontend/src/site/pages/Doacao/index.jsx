import styles from './Doacao.module.scss';

import foto_principal from "../../../docs/imagem_doacao.jpg";
import qrcode from '../../../docs/qrcode.jpeg';

function Doacao(){
    return (
        <div className={styles.body}>
            <div className={styles.conteudo}>
                <h2 className={styles.title}>Aqui você pode contribuir</h2>
                <p className={styles.texto}>
                    <p>Pix email: imeh@igrejadapaz.com.br</p>
                    <img src={qrcode} alt="qrcode pix" className={styles.qrcode}/>
                </p>
                <p className={styles.texto}>
                    <p>Chave CNPJ 13285292000106</p>
                    <p>BRADESCO</p>
                    <p>Agencia: 2572</p>
                    <p>Conta Corrente: 0160996-3</p>
                </p>
            </div>
            <div className={styles.imagens}>
                <div className={styles.imagem_front}>
                    <img src={foto_principal} alt="foto_principal" className={styles.img}/>
                </div>
                <div className={styles.imagem_back}></div>
            </div>
        </div>
    )
}

export default Doacao;