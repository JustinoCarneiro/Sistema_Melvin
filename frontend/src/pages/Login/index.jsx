import styles from './Login.module.scss';
import { useState, useEffect } from 'react'; 
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';

import auth from '../../services/auth';

import logo from '../../docs/Instituto_Melvin.png';

function Login(){
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get('token');
        const role = Cookies.get('role');
        
        // Só redireciona se tiver os dois (token e role). Se não tiver role, o cookie tá quebrado.
        if (token && role) {
            navigate(`/app/${role.toLowerCase()}`);
        } else if (token && !role) {
             Cookies.remove('token');
             Cookies.remove('login');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            const response = await auth.authentication({ login, password });
            
            if (response.status === 200) {
                const role = response.data.role; 
                
                // Salva o login e o role no cookie para o PrivateRoute e o useEffect lerem
                Cookies.set('login', login, { sameSite: 'Lax', secure: false });
                Cookies.set('role', role, { sameSite: 'Lax', secure: false }); 

                const path = `/app/${role.toLowerCase()}`;
                navigate(path);
            }
        } catch (error) {
            console.error("3001:Erro ao fazer login", error);
            setErrorMessage(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
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
                    <Link to="/">
                        <img src={logo} alt="logo" className={styles.logo}/>
                    </Link>
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
                    {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
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