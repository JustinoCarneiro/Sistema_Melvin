import { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import styles from './ScrollToTop.module.scss';

function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setVisible(window.scrollY > 300);
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <button
            className={`${styles.btn} ${visible ? styles.visible : ''}`}
            onClick={scrollToTop}
            aria-label="Voltar ao topo"
        >
            <FaArrowUp />
        </button>
    );
}

export default ScrollToTop;
