import styles from './NavBar.module.scss';
import { useState, useEffect } from 'react'
import {IoClose, IoChevronDown, IoChevronUp,IoSettings} from 'react-icons/io5';
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
    const [isAdmOrDire, setIsAdmOrDire] = useState(false);

    useEffect(() => {
        const userRole = Cookies.get('role');
        setIsAdmOrDire(userRole === 'ADM' || userRole === 'DIRE');     
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
                <li> 
                    <Link to="/app/alunos" className={styles.link}>
                        <PiStudentBold className={styles.icon}/> 
                        <p>Alunos</p>
                    </Link>
                </li>
                {isAdmOrDire && (
                    <>
                        <li onClick={handleVol} className={styles.link}> 
                            <PiChalkboardTeacher className={styles.icon}/> 
                            <p>Voluntários</p> 
                            {subnavvol ? <IoChevronUp className={styles.seta}/> : <IoChevronDown className={styles.seta}/>}
                        </li>
                        {subnavvol && <SubNav tipo="voluntários"/>}
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
                            <Link to="/app/avisos" className={styles.link}>
                                <GoAlertFill className={styles.icon}/> 
                                <p>Avisos</p>
                            </Link>
                        </li>
                    </>
                )}
            </ul>
            <IoSettings className={styles.config} onClick={handleRouteConfig}/>
        </div>
    )
}

export default NavBar;