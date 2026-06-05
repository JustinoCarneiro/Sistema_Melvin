import { useState, useEffect } from 'react';
import Cookies from "js-cookie";
import permissaoService from '../services/permissaoService';

export function usePermissions() {
    const [permissoes, setPermissoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const userRole = Cookies.get('role');
        setRole(userRole);

        const fetchPermissoes = async () => {
            try {
                const response = await permissaoService.listarMinhas();
                setPermissoes(response.data || []);
            } catch (error) {
                console.error("Erro ao carregar permissões:", error);
                setPermissoes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPermissoes();
    }, []);

    const hasPermission = (permissao) => {
        // ADM sempre tem permissão total (ou podemos restringir se quisermos ser puristas)
        if (role === 'ADM') return true;
        return permissoes.includes(permissao);
    };

    return {
        permissoes,
        role,
        isAdm: role === 'ADM',
        isDire: role === 'DIRE',
        isCoor: role === 'COOR',
        isProf: role === 'PROF',
        isPsico: role === 'PSICO',
        isAssist: role === 'ASSIST',
        isAux: role === 'AUX',
        hasPermission,
        loading
    };
}
