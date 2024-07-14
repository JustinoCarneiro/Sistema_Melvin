import styles from './SubNav.module.scss';
import { Link } from 'react-router-dom';

function SubNav({tipo}){
    const renderFields = () => {
        switch (tipo){
            case 'voluntários':
                return (
                    <ul className={styles.body}>
                        <li><Link to="/app/voluntario/diretoria" className={styles.link}>Diretoria</Link></li>
                        <li><Link to="/app/voluntario/coordenadores" className={styles.link}>Coordenação</Link></li>
                        <li><Link to="/app/voluntario/professores" className={styles.link}>Professores</Link></li>
                        <li><Link to="/app/voluntario/auxiliares" className={styles.link}>Auxiliares de professor</Link></li>
                        <li><Link to="/app/voluntario/administracao" className={styles.link}>Administração</Link></li>
                        <li><Link to="/app/voluntario/cozinheiros" className={styles.link}>Cozinha</Link></li>
                        <li><Link to="/app/voluntario/marketing" className={styles.link}>Marketing</Link></li>
                        <li><Link to="/app/voluntario/zeladoria" className={styles.link}>Zeladoria</Link></li>
                    </ul>
                );
            case 'atividades':
                return(
                    <ul className={styles.body}>
                        <li>Sala 1</li>
                        <li>Sala 2</li>
                        <li>Sala 3</li>
                    </ul>
                );
            default:
                return null;
        }
    };

    return(
        <>
            {renderFields()}
        </>
    )
}

export default SubNav;