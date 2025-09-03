import styles from './NavBar.module.scss';
import { useState, useEffect } from 'react';
import {IoClose, IoChevronDown, IoChevronUp, IoSettings, IoBasket} from 'react-icons/io5';
import { PiStudentBold, PiChalkboardTeacher } from "react-icons/pi";
import { GoAlertFill } from "react-icons/go";
import { LuHeartHandshake } from "react-icons/lu";
import { Link, useNavigate } from 'react-router-dom';
import { TbSocial } from "react-icons/tb";

import Cookies from "js-cookie";

import SubNav from '../SubNav';

function NavBar({close}){
    const navigate = useNavigate();

    const closeNavBar = () => {close(false)}

    const [subnavvol, setSubNavVol] = useState(false);
    const [isDire, setIsDire] = useState(false);
    const [isProf, setIsProf] = useState(false);
    const [isAdm, setIsAdm] = useState(false);
    const [isCoor, setIsCoor] = useState(false);
    const [isPsico, setIsPsico] = useState(false); // 1. Adicione o estado para o psicólogo

    useEffect(() => {
        const userRole = Cookies.get('role');
        setIsProf(userRole === 'PROF');
        setIsDire(userRole === 'DIRE');     
        setIsAdm(userRole === "ADM");
        setIsCoor(userRole === "COOR");
        setIsPsico(userRole === 'PSICO'); // 2. Verifique o perfil de psicólogo
    }, []);

    const handleVol = () =>{
        setSubNavVol(!subnavvol);
    }

    const handleRouteConfig = () => {
        navigate('/app/config');
    }

    return(
        <div className={styles.body}>
            <IoClose className={styles.close} onClick={closeNavBar}/>
            <ul className={styles.nav}>
                {(isAdm || isProf || isDire || isCoor || isPsico) && ( // 3. Adicione isPsico para ver Alunos
                    <li> 
                        <Link to="/app/alunos" className={styles.link}>
                            <PiStudentBold className={styles.icon}/> 
                            <p>Alunos</p>
                        </Link>
                    </li>
                )}
                {(isAdm || isDire || isCoor || isPsico) && ( // 4. Adicione isPsico para ver Voluntários
                    <>
                        <li onClick={handleVol} className={styles.link}> 
                            <PiChalkboardTeacher className={styles.icon}/> 
                            <p>Voluntários</p> 
                            {subnavvol ? <IoChevronUp className={styles.seta}/> : <IoChevronDown className={styles.seta}/>}
                        </li>
                        {subnavvol && <SubNav tipo="voluntários"/>}
                    </>
                )}
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