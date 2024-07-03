import styles from './Registro.module.scss';
import { useState } from 'react';

import auth from '../../services/auth';

function Registro(){
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('PROF');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (role === '') {
            alert('Por favor, selecione um papel.');
            return;
        }
        try {
            const response = await auth.registrar({login, password, role});
            if (response && response.status === 200) {
                alert('Usuário registrado com sucesso!');
            }
        } catch (error) {
            console.error("Erro ao registrar usuário!", error);
            alert('Erro ao registrar usuário!');
        }
    };

    return(
        <div className={styles.body}>
            <form className={styles.container} onSubmit={handleSubmit}>
                <h1>Registro</h1>
                <input 
                    type="text" 
                    placeholder="matricula"
                    name="matricula" 
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                />
                <input
                    type="password" 
                    placeholder="senha"
                    name="senha" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <select 
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="PROF">Professor</option>
                    <option value="ADMIN">Administrador</option>
                </select>
                <button type="submit">Entrar</button>
            </form>
        </div>
    )
}

export default Registro;