import styles from './HeaderSite.module.scss';

import { useNavigate } from 'react-router-dom';

import logo from "../../../docs/logo_institutomelvin_horizontal.png";

function HeaderSite(){
    const navigate = useNavigate();

    const handlePageHome = () => {
        navigate('/');
    };

    return(
        <div className={styles.body}>
            <div className={styles.logo} onClick={handlePageHome}>
                <img src={logo} alt="Logo Instituto Melvin" className={styles.img}/>
            </div>
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