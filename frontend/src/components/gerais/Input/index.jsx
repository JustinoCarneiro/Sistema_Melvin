import React from 'react';
import styles from './Input.module.scss';

function Input({label, placeholder, type, name, value, onChange, comp, prioridade}){
    let comprimentoClass;

    if(comp === "grande"){
        comprimentoClass = styles.grande;
    } else{
        comprimentoClass = styles.pequeno;
    }

    return(
        <label className={styles.label}>
            <div className={styles.container}>
                {label}{prioridade === 'true' && <p className={styles.prioridade}>*</p>}
            </div>
            <input
                className={`${styles.input} ${comprimentoClass}`}
                type={type}
                placeholder={placeholder}
                name={name}
                value={value}
                onChange={onChange}
            />
        </label>
    )
}

export default Input;