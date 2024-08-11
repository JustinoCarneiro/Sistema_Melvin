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
                        if (responseRole.data === 'COOR') {
                            navigate('/app/coor'); 
                        } else if (responseRole.data === 'PROF') {
                            navigate('/app/prof'); 
                        } else if (responseRole.data === 'ADM') {
                            navigate('/app/adm'); 
                        } else if (responseRole.data === 'AUX') {
                            navigate('/app/aux'); 
                        } else if (responseRole.data === 'COZI') {
                            navigate('/app/cozi'); 
                        } else if (responseRole.data === 'DIRE') {
                            navigate('/app/dire'); 
                        } else if (responseRole.data === 'MARK') {
                            navigate('/app/mark'); 
                        } else if (responseRole.data === 'ZELA') {
                            navigate('/app/zela'); 
                        }
                    } else {
                        console.error('2000:Erro ao obter role de usuário:', responseRole.status);
                    }
                } catch (error) {
                    console.error('2001:Erro ao verificar role do usuário', error);
                    return Promise.reject(error);
                }
            })();
        }
    }, [navigate]);
};

export default verificacaoAuth;