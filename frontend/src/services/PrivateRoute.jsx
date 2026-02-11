import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import auth from './auth';

const PrivateRoute = ({ element: Component, role, ...rest }) => {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        const checkAuthorization = async () => {
            const token = Cookies.get('token');
            const login = Cookies.get('login');
            
            if (token && login) {
                try {
                    const responseRole = await auth.receberRole(login);
                    if (responseRole.status === 200 && responseRole.data === role) {
                        setIsAuthorized(true);
                    } else {
                        // TOKEN INVÁLIDO OU ROLE ERRADO: Limpa a sujeira!
                        Cookies.remove('token');
                        Cookies.remove('login');
                        Cookies.remove('role');
                        setIsAuthorized(false);
                    }
                } catch (error) {
                    console.error('1022:Erro ao verificar role do usuário', error);
                    // ERRO NA API (Token expirado): Limpa a sujeira!
                    Cookies.remove('token');
                    Cookies.remove('login');
                    Cookies.remove('role');
                    setIsAuthorized(false);
                }
            } else {
                // Faltam dados na sessão: garante que está tudo limpo
                Cookies.remove('token');
                Cookies.remove('login');
                Cookies.remove('role');
                setIsAuthorized(false);
            }
        };

        checkAuthorization();
    }, [role]);

    if (isAuthorized === null) {
        return <div style={{display: 'flex', justifyContent: 'center', marginTop: '20vh'}}>Carregando sistema...</div>;
    }

    return isAuthorized ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default PrivateRoute;