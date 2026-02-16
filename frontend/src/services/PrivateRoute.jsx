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
                    const userRole = responseRole.data; // O papel que vem do Banco (ex: 'AUX')

                    // --- LÓGICA NOVA PARA MÚLTIPLOS PERFIS ---
                    let autorizado = false;

                    if (Array.isArray(role)) {
                        // Se a rota aceita vários (ex: ['ADM', 'AUX']), verifica se o user está na lista
                        autorizado = role.includes(userRole);
                    } else {
                        // Se a rota só aceita um (ex: 'ADM'), compara direto
                        autorizado = userRole === role;
                    }

                    if (responseRole.status === 200 && autorizado) {
                        setIsAuthorized(true);
                    } else {
                        // TOKEN VÁLIDO MAS SEM PERMISSÃO (ou token inválido)
                        Cookies.remove('token');
                        Cookies.remove('login');
                        Cookies.remove('role');
                        setIsAuthorized(false);
                    }
                } catch (error) {
                    console.error('1022:Erro ao verificar role do usuário', error);
                    Cookies.remove('token');
                    Cookies.remove('login');
                    Cookies.remove('role');
                    setIsAuthorized(false);
                }
            } else {
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