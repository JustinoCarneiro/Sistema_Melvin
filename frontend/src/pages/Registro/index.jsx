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
                setLogin('');
                setPassword('');
                setRole('PROF');
            }
        } catch (error) {
            console.error("Erro ao registrar usuário!", error);
            alert('Erro ao registrar usuário! Verifique se a matrícula já existe.');
        }
    };

    return(
        <div className={styles.body}>
            <form className={styles.container} onSubmit={handleSubmit}>
                <h1>Registro Manual</h1>
                <input 
                    type="text" 
                    placeholder="Matrícula / Login"
                    name="matricula" 
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    required
                />
                <input
                    type="password" 
                    placeholder="Senha"
                    name="senha" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                
                {/* O value das opções deve ser IDÊNTICO ao nome do Enum no Java */}
                <select 
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={styles.select} // Adicione classe se tiver estilo
                >
                    <option value="PROF">Professor</option>
                    <option value="ADM">Administrador</option>
                    <option value="COOR">Coordenador</option>
                    <option value="DIRE">Diretor</option>
                    <option value="PSICO">Psicólogo</option>
                    <option value="ASSIST">Assistente Social</option>
                    <option value="AUX">Auxiliar</option>
                    <option value="COZI">Cozinheiro</option>
                    <option value="MARK">Marketing</option>
                    <option value="ZELA">Zelador</option>
                </select>
                
                <button type="submit">Registrar</button>
            </form>
        </div>
    )
}

export default Registro;