import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import auth from './auth';

const verificacaoAuth = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get('token');
        const login = Cookies.get('login');

        if (token && login) {
            // Lógica para determinar para onde redirecionar com base no role do usuário
            (async () => {
                try {
                    const responseRole = await auth.receberRole(login);

                    if (responseRole.status === 200) {
                        if (responseRole.data === 'ADMIN') {
                            navigate('/admin'); // Redirecione para a página de administração
                        } else if (responseRole.data === 'PROF') {
                            navigate('/prof'); // Redirecione para a página de professor
                        }
                    } else {
                        console.error('2000:Erro ao obter role de usuário:', responseRole.status);
                    }
                } catch (error) {
                    console.error('2001:Erro ao verificar role do usuário', error);
                }
            })();
        }
    }, [navigate]);
};

export default verificacaoAuth;