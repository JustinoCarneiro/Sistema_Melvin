import React, { useState } from 'react';
import styles from './AmigosMelvin.module.scss';
import { useNavigate } from "react-router-dom";
import foto_principal from "../../../docs/imagem_amigomelvin.png";

function AmigosMelvin() {
    const navigate = useNavigate();
    const [donationType, setDonationType] = useState('monthly');
    const [selectedPlan, setSelectedPlan] = useState(50);
    const [customValue, setCustomValue] = useState('');

    const handleCustomValueChange = (e) => {
        const val = e.target.value;
        if (!val || /^\d+$/.test(val)) {
            setCustomValue(val);
            if (val) {
                setSelectedPlan('custom');
            }
        }
    };

    const handlePlanSelect = (val) => {
        setSelectedPlan(val);
        setCustomValue('');
    };

    const handleProceed = () => {
        const finalValue = selectedPlan === 'custom' ? customValue : selectedPlan;
        console.log("Proceeding with type:", donationType, "value:", finalValue);
        navigate("/cadastroamigo", { state: { type: donationType, value: finalValue } });
    };

    return (
        <div className={styles.body}>
            <div className={styles.heroSection}>
                <h1 className={styles.title}>Faça a diferença!</h1>
                <p className={styles.subtitle}>
                    Sua contribuição é fundamental para transformar a vida de nossas crianças. 
                    Junte-se a nós e faça parte dessa corrente do bem!
                </p>
            </div>

            <div className={styles.donationContainer}>
                <div className={styles.toggleGroup}>
                    <button 
                        className={`${styles.toggleBtn} ${donationType === 'monthly' ? styles.active : ''}`}
                        onClick={() => setDonationType('monthly')}
                    >
                        Assinatura Mensal
                    </button>
                    <button 
                        className={`${styles.toggleBtn} ${donationType === 'one-time' ? styles.active : ''}`}
                        onClick={() => setDonationType('one-time')}
                    >
                        Doação Única
                    </button>
                </div>

                <div className={styles.plansGrid}>
                    {[20, 50, 100].map(val => (
                        <div 
                            key={val}
                            className={`${styles.planCard} ${selectedPlan === val ? styles.selected : ''}`}
                            onClick={() => handlePlanSelect(val)}
                        >
                            R$ {val}
                        </div>
                    ))}
                    <div className={`${styles.planCard} ${selectedPlan === 'custom' ? styles.selected : ''} ${styles.customInputCard}`}>
                        <span>R$</span>
                        <input 
                            type="number" 
                            min="1"
                            placeholder="Outro"
                            className={styles.customInput}
                            value={customValue}
                            onChange={handleCustomValueChange}
                            onClick={() => setSelectedPlan('custom')}
                        />
                    </div>
                </div>

                <button className={styles.ctaButton} onClick={handleProceed}>
                    [ Quero ser um amigo ]
                </button>
            </div>
        </div>
    );
}

export default AmigosMelvin;