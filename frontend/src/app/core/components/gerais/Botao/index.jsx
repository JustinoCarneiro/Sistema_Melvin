import styles from './Botao.module.scss';

function Botao({nome, corFundo, corBorda, comp, onClick, type, disabled, children}){
    return(
        <button className={styles.button}
                style={{backgroundColor: corFundo, borderColor: corBorda, width: comp}}
                onClick={onClick}
                type={type}
                disabled={disabled}
        >
            {nome}
            {children}
        </button>
    )
}

export default Botao;