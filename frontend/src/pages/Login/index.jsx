/* eslint-disable react/prop-types */
import styles from './Login.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { LuUser, LuLock, LuEye, LuEyeOff, LuLogIn, LuArrowLeft } from 'react-icons/lu';

import authService from '../../services/authService';
import logo from '../../docs/Instituto_Melvin.png';

function Login() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
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
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const [obs, setObs] = useState(false);

    return (
        <div className={styles.body}>
            <motion.div
                className={styles.container}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                <form className={styles.form} onSubmit={handleSubmit}>
                    <Link to="/">
                        <motion.img
                            src={logo}
                            alt="Instituto Melvin"
                            className={styles.logo}
                            whileHover={{ scale: 1.05 }}
                        />
                    </Link>

                    <h2 className={styles.title}>Área do voluntário</h2>
                    <p className={styles.subtitle}>Acesse com sua matrícula e senha</p>

                    <div className={styles.inputGroup}>
                        <div className={styles.inputWrapper}>
                            <LuUser className={styles.inputIcon} />
                            <input
                                type="text"
                                name="matricula"
                                placeholder="Matrícula"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                className={styles.input}
                                required
                                autoComplete="username"
                            />
                        </div>
                        <div className={styles.inputWrapper}>
                            <LuLock className={styles.inputIcon} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="senha"
                                placeholder="Senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className={styles.togglePassword}
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                            >
                                {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {errorMessage && (
                            <motion.p
                                className={styles.errorMessage}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                            >
                                {errorMessage}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <motion.button
                        type="submit"
                        className={styles.button}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading || !login || !password}
                    >
                        {loading ? 'Entrando...' : (
                            <>
                                <LuLogIn size={20} />
                                Entrar
                            </>
                        )}
                    </motion.button>
                </form>

                <div className={styles.divider}>
                    <span>ou</span>
                </div>

                <div className={styles.footer}>
                    <button className={styles.esqu_senha} onClick={() => setObs(!obs)}>
                        Esqueci minha senha
                    </button>
                    <span style={{ color: '#e2e8f0' }}>|</span>
                    <button className={styles.backLink} onClick={() => navigate('/')}>
                        <LuArrowLeft size={14} />
                        Voltar ao site
                    </button>
                </div>

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