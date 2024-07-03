import styles from './Header.module.scss';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import { IoMenu } from "react-icons/io5";
import NavBar from "../NavBar";

function Header(){
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
    if(userRole === "COOR"){
        tipo = "Coordenação";
        caminho = "/coor";
    }else if(userRole === "PROF"){
        tipo = "Docência";
        caminho = "/prof";
    }else if(userRole === "AUX"){
        tipo = "Auxiliação";
        caminho = "/aux";
    }else if(userRole === "COZI"){
        tipo = "Cozinha";
        caminho = "/cozi";
    }else if(userRole === "DIRE"){
        tipo = "Diretoria";
        caminho = "/dire";
    }else if(userRole === "MARK"){
        tipo = "Marketing";
        caminho = "/mark";
    }else if(userRole === "ZELA"){
        tipo = "Zeladoria";
        caminho = "/zela";
    }else if(userRole === "ADM"){
        tipo = "Administração";
        caminho = "/adm";
    }

    return(
        <div className={styles.body}>
            <IoMenu className={styles.icon} onClick={handleNavBar}/>
            <h2 className={styles.title} onClick={() => navigate(caminho)}>SISTEMA MELVIN</h2>
            <p className={styles.usuario}>{tipo}</p>
            {navbar && <NavBar close={closeNavBar}/>}
            {navbar && <div className={styles.filtro} onClick={closeNavBar}/>}
        </div>
    )
}

export default Header;