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
                        setIsAuthorized(false);
                    }
                } catch (error) {
                    console.error('1022:Erro ao verificar role do usuário', error);
                    setIsAuthorized(false);
                }
            } else {
                setIsAuthorized(false);
            }
        };

        checkAuthorization();
    }, [role]);

    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    return isAuthorized ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default PrivateRoute;