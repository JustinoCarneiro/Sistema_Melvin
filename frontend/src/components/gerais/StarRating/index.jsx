import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import styles from './StarRating.module.scss';

const StarRating = ({ initialRating = 0, onRate }) => {
    const [rating, setRating] = useState(initialRating);
    const [hover, setHover] = useState(null);

    const handleClick = (newRating) => {
        setRating(newRating);
        if (onRate) {
            onRate(newRating);
        }
    };

    const handleMouseMove = (e, index) => {
        // Pega a posição do mouse dentro do container da estrela
        const { left, width } = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - left;
        // Se o mouse está na primeira metade, a nota é X.5, senão é X+1
        const newHover = mouseX < width / 2 ? index + 0.5 : index + 1;
        setHover(newHover);
    };

    return (
        <div className={styles.starContainer}>
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                const currentRating = hover || rating;

                return (
                    <div
                        key={index}
                        className={styles.starWrapper}
                        onMouseMove={(e) => handleMouseMove(e, index)}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => handleClick(hover)}
                    >
                        {currentRating >= ratingValue ? (
                            <FaStar color="#ffc107" size={25} />
                        ) : currentRating >= ratingValue - 0.5 ? (
                            <FaStarHalfAlt color="#ffc107" size={25} />
                        ) : (
                            <FaRegStar color="#e4e5e9" size={25} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default StarRating;