import styles from './HomeApp.module.scss';

import Cookies from 'js-cookie';

function Home(){
    const userRole = Cookies.get('role');

    let tipo;
    if(userRole === "COOR"){
        tipo = "Coordenação";
    }else if(userRole === "PROF"){
        tipo = "Docência";
    }else if(userRole === "AUX"){
        tipo = "Auxiliação";
    }else if(userRole === "COZI"){
        tipo = "Cozinha";
    }else if(userRole === "DIRE"){
        tipo = "Diretoria";
    }else if(userRole === "MARK"){
        tipo = "Marketing";
    }else if(userRole === "ZELA"){
        tipo = "Zeladoria";
    }else if(userRole === "ADM"){
        tipo = "Administração";
    }

    return(
        <div className={styles.body}>
            {tipo}
        </div>
    )
}

export default Home;