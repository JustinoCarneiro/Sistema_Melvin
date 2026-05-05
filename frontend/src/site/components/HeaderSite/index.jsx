import styles from './HeaderSite.module.scss';

import { useNavigate } from 'react-router-dom';
import { FaHeart } from "react-icons/fa";
import { FaFileInvoiceDollar } from "react-icons/fa";

import logo from "../../../docs/logo_institutomelvin_horizontal.png";

function HeaderSite() {
    const navigate = useNavigate();

    const handlePageHome = () => {
        navigate('/');
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.logo} onClick={handlePageHome}>
                    <img src={logo} alt="Logo Instituto Melvin" className={styles.logoImg} />
                </div>

                <input type="checkbox" id="menu-toggle" className={styles.menuToggle} />
                <label htmlFor="menu-toggle" className={styles.hamburger}>
                    <span></span>
                    <span></span>
                    <span></span>
                </label>

                <nav className={styles.nav}>
                    <ul className={styles.navList}>
                        <li><button className={styles.navLink} onClick={() => navigate("/maissobrenos")}>Sobre nós</button></li>
                        <li><button className={styles.navLink} onClick={() => navigate("/embaixadores")}>Embaixadores</button></li>
                        <li><button className={styles.navLink} onClick={() => navigate("/amigos-do-melvin")}>Amigos do Melvin</button></li>
                        <li>
                            <button className={styles.navLinkNota} onClick={() => navigate("/notatemvalor")}>
                                <FaFileInvoiceDollar />
                                <span>Sua nota tem valor</span>
                            </button>
                        </li>
                        <li>
                            <button className={styles.btnDoacao} onClick={() => navigate("/doacoes")}>
                                <FaHeart />
                                <span>Fazer Doação</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default HeaderSite;