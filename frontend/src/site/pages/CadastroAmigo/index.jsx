import styles from "./CadastroAmigo.module.scss";

import { useState } from "react";

import post from '../../../services/requests/post';

function CadastroAmigo(){
    const [nome, setNome] = useState('');
    const [contato, setContato] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const amigoData = {
            nome,
            contato,
            email,
            formaPagamento: "",
            valorMensal: "",
            contatado: false,
            status: false
        };

        try {
            await post.amigosmelvin(amigoData);
            alert('Informações enviadas com sucesso!');
            
            setNome('');
            setContato('');
            setEmail('');
        } catch (error) {
            console.error("7005:Erro ao enviar as informações do amigo:", error);
            alert('Erro ao enviar as informações. Tente novamente.');
        }
    };
    return(
        <div className={styles.body}>
            <h2 className={styles.title}>Olá amigo!</h2>
            <h3 className={styles.texto}>Precisamos apenas de alguns dados para concluir seu cadastro.</h3>
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

export default CadastroAmigo;