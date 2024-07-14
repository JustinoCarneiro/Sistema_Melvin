import styles from "./SerEmbaixador.module.scss";

import { useState } from "react";

import post from '../../../services/requests/post';

function SerEmbaixador(){
    const [nome, setNome] = useState('');
    const [contato, setContato] = useState('');
    const [instagram, setInstagram] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const embaixadorData = {
            nome,
            contato,
            instagram,
            email,
            contatado: false,
            status: false
        };

        try {
            await post.embaixadores(embaixadorData);
            alert('Informações enviadas com sucesso!');
            
            setNome('');
            setContato('');
            setInstagram('');
            setEmail('');
        } catch (error) {
            console.error("6005:Erro ao enviar as informações do embaixador:", error);
            alert('Erro ao enviar as informações. Tente novamente.');
        }
    };


    return(
        <div className={styles.body}>
            <h2 className={styles.title}>Você está perto de ser um embaixador(a)!</h2>
            <h3 className={styles.texto}>Precisamos apenas de alguns dados para entrar em contato.</h3>
            <form onSubmit={handleSubmit}>
                <label className={styles.label}>
                    Nome:
                    <input 
                        className={styles.input}
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />
                </label>
                <label className={styles.label}>
                    Contato:
                    <input
                        className={styles.input} 
                        type="text"
                        value={contato}
                        onChange={(e) => setContato(e.target.value)}
                    />
                </label>
                <label className={styles.label}>
                    Instagram:
                    <input
                        className={styles.input} 
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                    />
                </label>
                <label className={styles.label}>
                    Email:
                    <input 
                        className={styles.input}
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>
                <button className={styles.button} type="submit">Enviar</button>
            </form>
            <h3 className={styles.texto}>Iremos entrar em contato!</h3>
        </div>
    )
}

export default SerEmbaixador;