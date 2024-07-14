import styles from './Login.module.scss';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import auth from '../../services/auth';
import verificacaoAuth from "../../services/verificacaoAuth";

import logo from '../../docs/Instituto_Melvin.png';

function Login(){
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // Verifica autenticação e redireciona se necessário
    verificacaoAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await auth.authentication({ login, password });
            
            if (response.status === 200) {
                try{
                    const responseRole = await auth.receberRole(login);
                    if (responseRole.status === 200) {
                        const role = responseRole.data;
                        
                        Cookies.set('role', role, { 
                            sameSite: 'Lax',
                            secure: false
                        });

                        if (role === 'COOR') {
                            navigate('/app/coor'); 
                        } else if (role === 'PROF') {
                            navigate('/app/prof'); 
                        } else if (role === 'AUX') {
                            navigate('/app/aux');
                        } else if (role === 'COZI') {
                            navigate('/app/cozi'); 
                        } else if (role === 'DIRE') {
                            navigate('/app/dire'); 
                        } else if (role === 'MARK') {
                            navigate('/app/mark'); 
                        } else if (role === 'ADM') {
                            navigate('/app/adm'); 
                        } else if (role === 'ZELA') {
                            navigate('/app/zela'); 
                        }
                    }
                } catch(error){
                    console.error('3000:Erro ao obter role de usuário:', error.response ? error.response.data : error.message);
                    return { error: true, message: error.response ? error.response.data : error.message };
                }
            }
        } catch (error) {
            console.error("3001:Erro ao fazer login", error);
            alert('Erro ao fazer login');
        }
    };

    const [obs, setObs] = useState(false);

    const handleChange = () => {
        setObs(!obs);
    }

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <img src={logo} alt="logo" className={styles.logo}/>
                    <input
                        type="text" 
                        name="matricula" 
                        placeholder="matrícula"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        className={styles.input}
                    />
                    <input
                        type="password" 
                        name="senha" 
                        placeholder="senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                    />
                    <button type="submit" className={styles.button}>
                        <p className={styles.texto}>Entrar</p>
                    </button>
                </form>
                <button className={styles.esqu_senha} onClick={handleChange}>
                    <p>esqueci a minha senha</p>
                </button>
                {obs && <p className={styles.obs}>Recorra ao seu coordenador para gerar uma nova senha.</p>}
            </div>
        </div>
    )
}

export default Login;