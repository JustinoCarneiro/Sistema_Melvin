import styles from './FooterSite.module.scss';

import { MdPlace, MdOutlineEmail} from "react-icons/md";
import { FaBookmark, FaWhatsapp, FaInstagram} from "react-icons/fa";
import { BsFilePerson } from "react-icons/bs";

import { useNavigate } from 'react-router-dom';

function FooterSite(){
    const navigate = useNavigate();

    const handleEnterApp = () => {
        navigate('/login');
    };

    return(
        <div className={styles.body}>
            <div className={styles.contato}>
                <h3 className={styles.title}>Contato</h3>
                <div className={styles.contato_container}>
                    <MdPlace/>
                    <p>Av. Recreio, 840</p>
                </div>
                <div className={styles.contato_container}>
                    <FaBookmark/>
                    <p>CNPJ 13.285.292/0001-06</p>
                </div>
                <div className={styles.contato_container}>
                    <FaWhatsapp/>
                    <p>(85) 998203980</p>
                </div>
                <div className={styles.contato_container}>
                    <FaInstagram/>
                    <p>@institutomelvin</p>
                </div>
                <div className={styles.contato_container}>
                    <MdOutlineEmail/>
                    <p>imeh@igrejadapaz.com.br</p>
                </div>
            </div>
            <div className={styles.container_mapa}>
                <h3 className={styles.title}>Instituto Melvin Huber</h3>
                <div className={styles.mapa}>
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3980.9869589739665!2d-38.45222052582052!3d-3.812896696160908!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7c7451b1375cb55%3A0xb286c02bfb84ce9c!2sAv.%20Recreio%2C%20840%20-%20Lagoa%20Redonda%2C%20Fortaleza%20-%20CE%2C%2060831-600!5e0!3m2!1spt-BR!2sbr!4v1720466467007!5m2!1spt-BR!2sbr" 
                        width="100%" 
                        height="100%"
                        style={{ border: 0 }}
                        allowfullscreen="" 
                        loading="lazy" 
                        referrerpolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </div>
            <div className={styles.direita}>
                <div className={styles.direita_container} onClick={handleEnterApp}>
                    <BsFilePerson/>
                    <p>Acesso do voluntário</p>
                </div>
            </div>
        </div>
    )
}

export default FooterSite;