import styles from './NavBar.module.scss';
import { useState, useEffect } from 'react'
import {IoClose, IoChevronDown, IoChevronUp,IoSettings} from 'react-icons/io5';
import { PiStudentBold, PiChalkboardTeacher, PiNotebook } from "react-icons/pi";
import { Link, useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";

import SubNav from '../SubNav';

function NavBar({close}){
    const navigate = useNavigate();

    const closeNavBar = () => {close(false)}

    const [subnavvol, setSubNavVol] = useState(false);
    const [subnavatv, setSubNavAtv] = useState(false);
    const [isAdminOrDire, setIsAdminOrDire] = useState(false);

    useEffect(() => {
        const userRole = Cookies.get('role');
        setIsAdminOrDire(userRole === 'COOR' || userRole === 'DIRE');     
    }, []);

    const handleVol = () =>{
        setSubNavVol(!subnavvol);
    }
    const handleAtv = () =>{
        setSubNavAtv(!subnavatv);
    }

    const handleRouteConfig = () => {
        navigate('/config');
    }

    return(
        <div className={styles.body}>
            <IoClose className={styles.close} onClick={closeNavBar}/>
            <ul className={styles.nav}>
                <li> 
                    <Link to="/alunos" className={styles.link}>
                        <PiStudentBold className={styles.icon}/> 
                        <p>Alunos</p>
                    </Link>
                </li>
                {isAdminOrDire && (
                    <>
                        <li onClick={handleVol} className={styles.link}> 
                            <PiChalkboardTeacher className={styles.icon}/> 
                            <p>Voluntários</p> 
                            {subnavvol ? <IoChevronUp className={styles.seta}/> : <IoChevronDown className={styles.seta}/>}
                        </li>
                        {subnavvol && <SubNav tipo="voluntários"/>}
                        {/* 
                        <li onClick={handleAtv} className={styles.link}> 
                            <PiNotebook className={styles.icon}/> 
                            <p>Atividades</p> 
                            {subnavatv ? <IoChevronUp className={styles.seta}/> : <IoChevronDown className={styles.seta}/>}
                        </li>
                        {subnavatv && <SubNav tipo="atividades"/>}
                        */}
                    </>
                )}
            </ul>
            <IoSettings className={styles.config} onClick={handleRouteConfig}/>
        </div>
    )
}

export default NavBar;