import styles from './SubNav.module.scss';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Cookies from "js-cookie";

function SubNav({ tipo }) {
    const [isDire, setIsDire] = useState(false);
    const [isAdm, setIsAdm] = useState(false);
    const [isCoor, setIsCoor] = useState(false);
    const [isPsico, setIsPsico] = useState(false); // 1. Adicione o estado para o psicólogo

    useEffect(() => {
        const userRole = Cookies.get('role');
        setIsDire(userRole === 'DIRE');
        setIsAdm(userRole === "ADM");
        setIsCoor(userRole === "COOR");
        setIsPsico(userRole === "PSICO"); // 2. Verifique o perfil de psicólogo
    }, []);

    const renderFields = () => {
        switch (tipo) {
            case 'voluntários':
                return (
                    <ul className={styles.body}>
                        {(isAdm || isDire || isCoor) && (
                            <li><Link to="/app/voluntario/professores" className={styles.link}>Professores</Link></li>
                        )}
                        {(isAdm || isDire) && (
                            <>
                                <li><Link to="/app/voluntario/diretoria" className={styles.link}>Diretoria</Link></li>
                                <li><Link to="/app/voluntario/coordenadores" className={styles.link}>Coordenação</Link></li>
                                <li><Link to="/app/voluntario/auxiliares" className={styles.link}>Auxiliares de professor</Link></li>
                                <li><Link to="/app/voluntario/administracao" className={styles.link}>Administração</Link></li>
                                <li><Link to="/app/voluntario/cozinheiros" className={styles.link}>Cozinha</Link></li>
                                <li><Link to="/app/voluntario/marketing" className={styles.link}>Marketing</Link></li>
                                <li><Link to="/app/voluntario/zeladoria" className={styles.link}>Zeladoria</Link></li>
                                <li><Link to="/app/voluntario/psicologos" className={styles.link}>Psicólogos</Link></li>
                                <li><Link to="/app/voluntario/assistentes" className={styles.link}>Assistentes Sociais</Link></li>
                            </>
                        )}
                    </ul>
                );
            case 'atividades':
                return (
                    <ul className={styles.body}>
                        <li>Sala 1</li>
                        <li>Sala 2</li>
                        <li>Sala 3</li>
                    </ul>
                );
            default:
                return null;
        }
    };

    return (
        <>
            {renderFields()}
        </>
    )
}

export default SubNav;