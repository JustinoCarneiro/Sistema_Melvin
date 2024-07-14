import styles from './HeaderSite.module.scss';

import { useState } from 'react';
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

import { useNavigate, Link } from 'react-router-dom';

function HeaderSite(){
    const navigate = useNavigate();

    const handlePageHome = () => {
        navigate('/');
    };

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return(
        <div className={styles.body}>
            <div className={styles.logo} onClick={handlePageHome}>Logo do instituto Melvin</div>
            <div className={styles.menu}>
                <div className={styles.caixa_botao}>
                    <button className={styles.button} onClick={() => navigate("/maissobrenos")}>Sobre nós</button>
                </div>
                <div className={styles.linha_vertical}></div>
                <div className={styles.caixa_botao}>
                    <button className={styles.button} onClick={() => navigate("/embaixadores")}>Embaixadores</button>
                </div>
                <div className={styles.linha_vertical}></div>
                <div className={styles.caixa_botao}>
                    <button className={styles.button} onClick={() => navigate("/amigosmelvin")}>Amigos do Melvin</button>
                </div>
            </div>
        </div>
    )
}

export default HeaderSite;