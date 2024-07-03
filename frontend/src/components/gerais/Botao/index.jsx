import styles from './Botao.module.scss';

function Botao({nome, corFundo, corBorda, comp, onClick, type}){
    return(
        <button className={styles.button} 
                style={{backgroundColor: corFundo, borderColor: corBorda, width: comp}} 
                onClick={onClick}
                type={type}
        >
            {nome}
        </button>
    )
}

export default Botao;