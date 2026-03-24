/* eslint-disable react/prop-types */
import styles from './Login.module.scss';
import { useState, useEffect } from 'react'; 
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';

import authService from '../../services/authService';
import logo from '../../docs/Instituto_Melvin.png';

function Login(){
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get('token');
        const role = Cookies.get('role');
        
        if (token && role) {
            navigate(`/app/${role.toLowerCase()}`);
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            const response = await authService.login({ login, password });
            
            if (response.status === 200) {
                const role = response.data.role; 
                Cookies.set('login', login, { sameSite: 'Lax', secure: false, path: '/' });
                Cookies.set('role', role, { sameSite: 'Lax', secure: false, path: '/' }); 

                navigate(`/app/${role.toLowerCase()}`);
            }
        } catch (error) {
            console.error("Erro ao fazer login", error);
            setErrorMessage(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
        }
    };

    const [obs, setObs] = useState(false);

    return(
        <div className={styles.body}>
            <motion.div 
                className={styles.container}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <form className={styles.form} onSubmit={handleSubmit}>
                    <Link to="/">
                        <motion.img 
                            src={logo} 
                            alt="logo" 
                            className={styles.logo}
                            whileHover={{ scale: 1.05 }}
                        />
                    </Link>
                    
                    <div className={styles.inputGroup}>
                        <input
                            type="text" 
                            name="matricula" 
                            placeholder="matrícula"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            className={styles.input}
                            required
                        />
                        <input
                            type="password" 
                            name="senha" 
                            placeholder="senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>

                    {errorMessage && (
                        <motion.p 
                            className={styles.errorMessage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {errorMessage}
                        </motion.p>
                    )}

                    <motion.button 
                        type="submit" 
                        className={styles.button}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Entrar
                    </motion.button>
                </form>

                <button className={styles.esqu_senha} onClick={() => setObs(!obs)}>
                    esqueci a minha senha
                </button>

                <AnimatePresence>
                    {obs && (
                        <motion.p 
                            className={styles.obs}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            Recorra ao seu coordenador para gerar uma nova senha.
                        </motion.p>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}

export default Login;