import styles from './Header.module.scss';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';

import { IoMenu } from "react-icons/io5";
import NavBar from "../NavBar";

function Header() {
    const [navbar, setNavbar] = useState(false);
    const navigate = useNavigate();

    const handleNavBar = () => {
        setNavbar(!navbar);
    }

    const closeNavBar = () => {
        setNavbar(false);
    };

    const userRole = Cookies.get('role');

    let tipo;
    let caminho;
    const roles = {
        "COOR": ["Coordenação", "/app/coor"],
        "PROF": ["Professor", "/app/prof"],
        "AUX": ["Auxiliar", "/app/aux"],
        "COZI": ["Cozinha", "/app/cozi"],
        "DIRE": ["Diretoria", "/app/dire"],
        "MARK": ["Marketing", "/app/mark"],
        "ZELA": ["Zeladoria", "/app/zela"],
        "ADM": ["Administração", "/app/adm"],
        "PSICO": ["Psicólogo", "/app/psico"]
    };

    if (roles[userRole]) {
        [tipo, caminho] = roles[userRole];
    }

    return (
        <header className={styles.body}>
            <IoMenu 
                className={styles.menuIcon} 
                onClick={handleNavBar}
            />
            
            <h2 className={styles.title} onClick={() => navigate(caminho)}>
                SISTEMA MELVIN
            </h2>
            
            <div className={styles.usuario}>{tipo}</div>

            <AnimatePresence>
                {navbar && (
                    <>
                        <NavBar close={closeNavBar} />
                        <motion.div 
                            className={styles.filtro} 
                            onClick={closeNavBar}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                    </>
                )}
            </AnimatePresence>
        </header>
    )
}

export default Header;