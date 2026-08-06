import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import auth from './auth';

const PrivateRoute = ({ element: Component, role, ...rest }) => {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [redirecionarPara, setRedirecionarPara] = useState('/login');

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
                    } else if (responseRole.status === 401 || responseRole.status === 403) {
                        // SESSÃO REALMENTE INVÁLIDA/EXPIRADA (backend não reconheceu o token)
                        Cookies.remove('token', { path: '/' });
                        Cookies.remove('login', { path: '/' });
                        Cookies.remove('role', { path: '/' });
                        setIsAuthorized(false);
                    } else if (responseRole.status === 200) {
                        // TOKEN VÁLIDO, só sem permissão nesta rota específica.
                        // Mantém a sessão e manda pro dashboard do próprio cargo, em vez de deslogar.
                        setRedirecionarPara(userRole ? `/app/${userRole.toLowerCase()}` : '/login');
                        setIsAuthorized(false);
                    } else {
                        // Falha transitória (rede/timeout/servidor fora do ar): não mexe na sessão
                        console.error('1022:Falha ao verificar sessão, mantendo cookies:', responseRole.message);
                        setIsAuthorized(false);
                    }
                } catch (error) {
                    console.error('1022:Erro inesperado ao verificar sessão', error);
                    setIsAuthorized(false);
                }
            } else {
                Cookies.remove('token', { path: '/' });
                Cookies.remove('login', { path: '/' });
                Cookies.remove('role', { path: '/' });
                setIsAuthorized(false);
            }
        };

        checkAuthorization();
    }, [role]);

    if (isAuthorized === null) {
        return <div style={{display: 'flex', justifyContent: 'center', marginTop: '20vh'}}>Carregando sistema...</div>;
    }

    return isAuthorized ? <Component {...rest} /> : <Navigate to={redirecionarPara} />;
};

export default PrivateRoute;