import styles from "./Deslogar.module.scss";
import { useNavigate } from 'react-router-dom';

import auth from '../../services/auth';

function Deslogar(){
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await auth.deslogar(); // Chama a função de logout no serviço de auth
            // Redirecionar para a página de login
            navigate('/');
        } catch (error) {
            console.error("5005:Erro ao deslogar", error);
            alert('Erro ao deslogar');
        }
    };
    return(
        <button className={styles.button} onClick={handleLogout}>Deslogar</button>
    )
}

export default Deslogar;