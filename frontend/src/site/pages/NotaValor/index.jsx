import styles from './NotaValor.module.scss';

import foto_principal from "../../../docs/suanotatemvalor.png";
import foto_segunda_faixa from "../../../docs/premiado.png";
import foto_terceira_faixa from "../../../docs/money.jpg";

function NotaValor(){
    const openNewTab = () => {
        window.open('https://suanotatemvalor.sefaz.ce.gov.br/app/#/services/usuario/cadastro', '_blank');
    };

    return(
        <div className={styles.body}>
            <div className={styles.faixa_um}>
                <div className={styles.conteudo}>
                    <h2 className={styles.title}>Sua nota tem valor!</h2>
                    <p className={styles.texto}>
                        <p>Você imagina o que tem por trás da sua nota fiscal? Tem saúde, segurança e oportunidades de crescimento para quem mais precisa. Você pode ajudar o Instituto Melvin com a sua Nota fiscal e ainda você concorre a prêmios todo mês, veja como funciona e se cadastre!</p>
                    </p>
                </div>
                <img src={foto_principal} alt="foto_principal" className={styles.img}/>
            </div>
            <div className={styles.faixa_dois}>
                <img src={foto_segunda_faixa} alt="foto_segunda_faixa" className={styles.img}/>
                <div className={styles.conteudo}>
                    <h2 className={styles.title}>Premiações!</h2>
                    <p className={styles.texto}>
                        <p>O programa premia cidadãos, por meio de sorteios realizados mensalmente e ainda oferece a oportunidade de obter até 5% de desconto no IPVA.</p> 
                        <p>Além disso, o participante tem um papel social de grande importância, pois, no momento do cadastro, deverá adotar uma instituição sem fins lucrativos credenciada, que concorrerá juntamente com ele aos sorteios.</p>
                    </p>
                </div>
            </div>
            <div className={styles.faixa_tres}>
                <div className={styles.conteudo}>
                    <p className={styles.texto}>
                        <p>Os sorteios são realizados por meio de sistema informatizado, com base na extração da Loteria Federal. Esse valor pode ser o somatório de várias notas do participante no período de apuração. Por exemplo: o cidadão realizou uma compra com seu CPF no valor de R$ 20,00 e outra no valor de R$ 40,00 totalizando R$ 60,00. Esse valor é suficiente para gerar um ponto, sobrando ainda R$ 10,00 que poderão ser somados a outras compras realizadas no mesmo mês e gerar mais pontos.</p>
                    </p>
                    <button className={styles.button} onClick={openNewTab}>Acesse aqui!</button>
                </div>
                <img src={foto_terceira_faixa} alt="foto_terceira_faixa" className={styles.img}/>
            </div>
        </div>
    )
}

export default NotaValor;