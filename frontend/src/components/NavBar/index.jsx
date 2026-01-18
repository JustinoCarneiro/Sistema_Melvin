import styles from './NavBar.module.scss';
import { useState, useEffect } from 'react';
import { IoClose, IoSettings, IoBasket } from 'react-icons/io5';
import { PiStudentBold, PiChalkboardTeacher } from "react-icons/pi";
import { GoAlertFill } from "react-icons/go";
import { LuHeartHandshake } from "react-icons/lu";
import { TbReportAnalytics, TbSocial } from "react-icons/tb";
import { Link, useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";

function NavBar({close}){
    const navigate = useNavigate();
    const closeNavBar = () => {close(false)}

    // Estados de Permissão
    const [isDire, setIsDire] = useState(false);
    const [isProf, setIsProf] = useState(false);
    const [isAdm, setIsAdm] = useState(false);
    const [isCoor, setIsCoor] = useState(false);
    const [isPsico, setIsPsico] = useState(false);
    const [isAssist, setIsAssist] = useState(false);

    useEffect(() => {
        const userRole = Cookies.get('role');
        setIsProf(userRole === 'PROF');
        setIsDire(userRole === 'DIRE');     
        setIsAdm(userRole === "ADM");
        setIsCoor(userRole === "COOR");
        setIsPsico(userRole === 'PSICO');
        setIsAssist(userRole === 'ASSIST');
    }, []);

    const handleRouteConfig = () => {
        navigate('/app/config');
    }

    return(
        <div className={styles.body}>
            <IoClose className={styles.close} onClick={closeNavBar}/>
            
            <ul className={styles.nav}>
                
                {/* --- ALUNOS --- */}
                {/* Visível para todos os perfis pedagógicos e administrativos */}
                {(isAdm || isProf || isDire || isCoor || isPsico || isAssist) && (
                    <li> 
                        <Link to="/app/alunos" className={styles.link}>
                            <PiStudentBold className={styles.icon}/> 
                            <p>Alunos</p>
                        </Link>
                    </li>
                )}
                
                {/* --- RELATÓRIOS --- */}
                {(isAdm || isProf || isDire || isCoor || isPsico || isAssist) && (
                    <li> 
                        <Link to="/app/relatorios" className={styles.link}>
                            <TbReportAnalytics className={styles.icon}/> 
                            <p>Relatórios</p>
                        </Link>
                    </li>
                )}

                {/* --- VOLUNTÁRIOS (Atualizado) --- */}
                {/* Agora é um link único, sem submenu */}
                {(isAdm || isDire || isCoor) && (
                    <li> 
                        <Link to="/app/voluntarios" className={styles.link}>
                            <PiChalkboardTeacher className={styles.icon}/> 
                            <p>Voluntários</p> 
                        </Link>
                    </li>
                )}

                {/* --- OUTROS --- */}
                {(isAdm || isDire) && (
                    <>
                        <li> 
                            <Link to="/app/embaixadores" className={styles.link}>
                                <TbSocial className={styles.icon}/> 
                                <p>Embaixadores</p>
                            </Link>
                        </li>
                        <li> 
                            <Link to="/app/amigosmelvin" className={styles.link}>
                                <LuHeartHandshake className={styles.icon}/> 
                                <p>Amigos Melvin</p>
                            </Link>
                        </li>
                        <li> 
                            <Link to="/app/cestas" className={styles.link}>
                                <IoBasket className={styles.icon}/> 
                                <p>Cestas Básicas</p>
                            </Link>
                        </li>
                    </>
                )}

                {isAdm && (
                    <li> 
                        <Link to="/app/avisos" className={styles.link}>
                            <GoAlertFill className={styles.icon}/> 
                            <p>Avisos</p>
                        </Link>
                    </li>
                )}
            </ul>

            <IoSettings className={styles.config} onClick={handleRouteConfig}/>
        </div>
    )
}

export default NavBar;