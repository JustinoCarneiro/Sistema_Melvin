/* eslint-disable react/prop-types */
import styles from './NavBar.module.scss';
import { useState, useEffect } from 'react';
import { IoClose, IoSettings, IoBasket } from 'react-icons/io5';
import { PiStudentBold, PiChalkboardTeacher } from "react-icons/pi";
import { GoAlertFill } from "react-icons/go";
import { LuHeartHandshake } from "react-icons/lu";
import { TbReportAnalytics, TbSocial } from "react-icons/tb";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Cookies from "js-cookie";
import { motion } from 'framer-motion';

function NavBar({ close }) {
    const navigate = useNavigate();
    const location = useLocation();
    const closeNavBar = () => { close(false) }

    const [roles, setRoles] = useState({
        isDire: false,
        isProf: false,
        isAdm: false,
        isCoor: false,
        isPsico: false,
        isAssist: false,
        isAux: false
    });

    useEffect(() => {
        const userRole = Cookies.get('role');
        setRoles({
            isProf: userRole === 'PROF',
            isDire: userRole === 'DIRE',
            isAdm: userRole === "ADM",
            isCoor: userRole === "COOR",
            isPsico: userRole === 'PSICO',
            isAssist: userRole === 'ASSIST',
            isAux: userRole === 'AUX'
        });
    }, []);

    const { isAdm, isProf, isDire, isCoor, isPsico, isAssist, isAux } = roles;

    const navItems = [
        { show: (isAdm || isProf || isDire || isCoor || isPsico || isAssist), to: "/app/alunos", icon: <PiStudentBold />, label: "Alunos" },
        { show: (isAdm || isProf || isDire || isCoor || isPsico || isAssist), to: "/app/relatorios", icon: <TbReportAnalytics />, label: "Relatórios" },
        { show: (isAdm || isDire || isCoor), to: "/app/voluntarios", icon: <PiChalkboardTeacher />, label: "Voluntários" },
        { show: isAdm || isDire, to: "/app/embaixadores", icon: <TbSocial />, label: "Embaixadores" },
        { show: isAdm || isDire, to: "/app/amigosmelvin", icon: <LuHeartHandshake />, label: "Amigos Melvin" },
        { show: (isAdm || isDire || isAux), to: "/app/cestas", icon: <IoBasket />, label: "Doações" },
        { show: isAdm, to: "/app/avisos", icon: <GoAlertFill />, label: "Avisos" },
    ];

    const containerVariants = {
        hidden: { x: '-100%' },
        visible: { 
            x: 0,
            transition: { 
                type: 'spring', 
                stiffness: 300, 
                damping: 30,
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        },
        exit: { 
            x: '-100%',
            transition: { ease: 'easeInOut' }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <motion.div 
            className={styles.body}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <IoClose className={styles.close} onClick={closeNavBar} />

            <ul className={styles.nav}>
                {navItems.map((item, index) => item.show && (
                    <motion.li key={index} variants={itemVariants}>
                        <Link 
                            to={item.to} 
                            className={`${styles.link} ${location.pathname === item.to ? styles.active : ''}`}
                            onClick={closeNavBar}
                        >
                            <span className={styles.icon}>{item.icon}</span>
                            <p>{item.label}</p>
                        </Link>
                    </motion.li>
                ))}
            </ul>

            <div className={styles.configWrapper}>
                <div 
                    className={`${styles.link} ${location.pathname === '/app/config' ? styles.active : ''}`}
                    onClick={() => { navigate('/app/config'); closeNavBar(); }}
                    style={{ cursor: 'pointer' }}
                >
                    <span className={styles.icon}><IoSettings /></span>
                    <p>Configurações</p>
                </div>
            </div>
        </motion.div>
    )
}

export default NavBar;