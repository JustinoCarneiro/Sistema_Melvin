import { useRef, useState } from 'react';
import styles from './SolicitarCesta.module.scss';

import { cestaService } from '@features/Cestas';

const NIVEIS = [
    { valor: 'CELULA', rotulo: 'Líder de Célula' },
    { valor: 'SETOR', rotulo: 'Supervisor de Setor' },
    { valor: 'AREA', rotulo: 'Líder de Área' },
    { valor: 'DISTRITO', rotulo: 'Líder de Distrito' },
    { valor: 'REDE', rotulo: 'Pastor de Rede' }
];

function SolicitarCesta() {
    const [form, setForm] = useState({
        nomeSolicitante: '',
        nivelSolicitante: '',
        nome: '',
        contato: '',
        lider_celula: '',
        rede: '',
        itens_doados: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Mesma trava de duplo-submit usada no cadastro de Amigos do Melvin
    // (ver incidente de cobrança em dobro, 06/06/2026).
    const submittingRef = useRef(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submittingRef.current) return;

        submittingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            await cestaService.solicitar(form);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Não foi possível enviar a solicitação. Tente novamente.');
        } finally {
            submittingRef.current = false;
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.body}>
                <div className={styles.wrapper}>
                    <div className={styles.successContainer}>
                        <h2>Solicitação enviada!</h2>
                        <p>A coordenação do Instituto Melvin recebeu seu pedido e vai avaliar em breve.</p>
                        <p>Quando a solicitação for aprovada, você será avisado com a data de retirada da cesta.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.body}>
            <div className={styles.wrapper}>
                <div className={styles.headerInfo}>
                    <h1 className={styles.title}>Solicitar Cesta Básica</h1>
                    <p className={styles.texto}>
                        Preencha os dados abaixo para solicitar uma cesta básica para um membro de célula.
                        A coordenação vai avaliar o pedido e definir a data de retirada.
                    </p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <label className={styles.label}>
                        Seu nome:
                        <input
                            className={styles.input}
                            type="text"
                            name="nomeSolicitante"
                            value={form.nomeSolicitante}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label className={styles.label}>
                        Sua liderança:
                        <select
                            className={styles.input}
                            name="nivelSolicitante"
                            value={form.nivelSolicitante}
                            onChange={handleChange}
                            required
                        >
                            <option value="" hidden>Selecione...</option>
                            {NIVEIS.map(nivel => (
                                <option key={nivel.valor} value={nivel.valor}>{nivel.rotulo}</option>
                            ))}
                        </select>
                    </label>

                    <label className={styles.label}>
                        Nome de quem vai receber a cesta:
                        <input
                            className={styles.input}
                            type="text"
                            name="nome"
                            value={form.nome}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label className={styles.label}>
                        Contato de quem vai receber:
                        <input
                            className={styles.input}
                            type="text"
                            name="contato"
                            value={form.contato}
                            onChange={handleChange}
                            placeholder="(00) 00000-0000"
                        />
                    </label>

                    <label className={styles.label}>
                        Líder da célula:
                        <input
                            className={styles.input}
                            type="text"
                            name="lider_celula"
                            value={form.lider_celula}
                            onChange={handleChange}
                        />
                    </label>

                    <label className={styles.label}>
                        Rede:
                        <input
                            className={styles.input}
                            type="text"
                            name="rede"
                            value={form.rede}
                            onChange={handleChange}
                        />
                    </label>

                    <label className={styles.label}>
                        Observações (opcional):
                        <input
                            className={styles.input}
                            type="text"
                            name="itens_doados"
                            value={form.itens_doados}
                            onChange={handleChange}
                            placeholder="Alguma informação que a coordenação precise saber"
                        />
                    </label>

                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <button className={styles.button} type="submit" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar Solicitação'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SolicitarCesta;
