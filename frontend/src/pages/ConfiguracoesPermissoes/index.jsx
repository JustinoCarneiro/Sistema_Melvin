import React, { useState, useEffect } from 'react';
import styles from './ConfiguracoesPermissoes.module.scss';
import permissaoService from '../../services/permissaoService';
import { FaShieldAlt, FaSave, FaCheck, FaTimes } from 'react-icons/fa';

const ROLES = [
    { id: 'ADM', label: 'ADM' },
    { id: 'DIRE', label: 'Diretoria' },
    { id: 'COOR', label: 'Coordenação' },
    { id: 'PROF', label: 'Professor' },
    { id: 'AUX', label: 'Auxiliar' },
    { id: 'PSICO', label: 'Psicólogo' },
    { id: 'ASSIST', label: 'Assistente' },
    { id: 'COZI', label: 'Cozinha' },
    { id: 'MARK', label: 'Marketing' },
    { id: 'ZELA', label: 'Zeladoria' },
];

const RULE_LABELS = {
    'EDITAR_RENDIMENTO': 'Editar Rendimento/Notas',
    'GERENCIAR_FREQUENCIA': 'Gerenciar Frequência',
    'CADASTRAR_ALUNO': 'Cadastrar/Editar Alunos',
    'EDITAR_AVALIACAO_PSICO': 'Editar Relatórios Psico',
    'GERENCIAR_CESTAS': 'Gerenciar Cestas Básicas',
    'GERENCIAR_VOLUNTARIOS': 'Gerenciar Voluntários',
    'VISUALIZAR_ALUNOS': 'Visualizar Alunos',
    'VISUALIZAR_RELATORIOS': 'Visualizar Relatórios',
    'GERENCIAR_EMBAIXADORES': 'Gerenciar Embaixadores',
    'GERENCIAR_AMIGOS': 'Gerenciar Amigos do Melvin',
    'GERENCIAR_AVISOS': 'Gerenciar Avisos'
};

function ConfiguracoesPermissoes() {
    const [permissoes, setPermissoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        carregarPermissoes();
    }, []);

    const carregarPermissoes = async () => {
        try {
            setLoading(true);
            const response = await permissaoService.listarTodas();
            
            // Ordem sugerida para agrupar por objeto/módulo
            const ORDEM_PREFERENCIAL = [
                // Alunos / Acadêmico
                'VISUALIZAR_ALUNOS',
                'CADASTRAR_ALUNO',
                'GERENCIAR_FREQUENCIA',
                'EDITAR_RENDIMENTO',
                'EDITAR_AVALIACAO_PSICO',
                // Gestão de Equipe
                'GERENCIAR_VOLUNTARIOS',
                // Módulos Administrativos
                'GERENCIAR_CESTAS',
                'GERENCIAR_EMBAIXADORES',
                'GERENCIAR_AMIGOS',
                'GERENCIAR_AVISOS',
                // Geral
                'VISUALIZAR_RELATORIOS'
            ];

            const dadosOrdenados = [...response.data].sort((a, b) => {
                const idxA = ORDEM_PREFERENCIAL.indexOf(a.nomeRegra);
                const idxB = ORDEM_PREFERENCIAL.indexOf(b.nomeRegra);
                
                // Se não estiver na lista (permissão nova), mantém no final por ordem alfebética
                if (idxA === -1 && idxB === -1) return a.nomeRegra.localeCompare(b.nomeRegra);
                if (idxA === -1) return 1;
                if (idxB === -1) return -1;
                
                return idxA - idxB;
            });

            setPermissoes(dadosOrdenados);
        } catch (error) {
            console.error("Erro ao carregar permissões", error);
            setMessage({ type: 'error', text: 'Erro ao carregar permissões do servidor.' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleRole = (regraIndex, roleId) => {
        const novasPermissoes = [...permissoes];
        const regra = novasPermissoes[regraIndex];
        
        if (regra.rolesPermitidas.includes(roleId)) {
            regra.rolesPermitidas = regra.rolesPermitidas.filter(r => r !== roleId);
        } else {
            regra.rolesPermitidas.push(roleId);
        }
        
        setPermissoes(novasPermissoes);
    };

    const handleSalvar = async () => {
        try {
            setSaving(true);
            setMessage({ type: '', text: '' });
            
            // Salva cada regra que foi alterada
            // Para simplificar, vamos salvar todas em sequência
            for (const permissao of permissoes) {
                await permissaoService.atualizarRegra(permissao.nomeRegra, permissao.rolesPermitidas);
            }
            
            setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
            
            // Limpa mensagem após 5 segundos
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            console.error("Erro ao salvar permissões", error);
            setMessage({ type: 'error', text: 'Erro ao salvar algumas configurações.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.body}>
                <div className={styles.loading}>Carregando configurações de segurança...</div>
            </div>
        );
    }

    return (
        <div className={styles.body}>
            <div className={styles.mainContent}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}><FaShieldAlt /> Configurações de Permissões</h1>
                    <p className={styles.pageSubtitle}>Defina quais cargos podem acessar cada funcionalidade do sistema.</p>
                </div>

                {message.text && (
                    <div className={`${styles.alert} ${message.type === 'success' ? styles.success : styles.error}`}>
                        {message.type === 'success' ? <FaCheck /> : <FaTimes />}
                        {message.text}
                    </div>
                )}

                <div className={styles.card}>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Funcionalidade</th>
                                    {ROLES.map(role => (
                                        <th key={role.id}>{role.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {permissoes.map((p, pIdx) => (
                                    <tr key={p.nomeRegra}>
                                        <td className={styles.regraName}>
                                            {RULE_LABELS[p.nomeRegra] || p.nomeRegra}
                                        </td>
                                        {ROLES.map(role => (
                                            <td key={role.id}>
                                                <input 
                                                    type="checkbox" 
                                                    className={styles.checkbox}
                                                    checked={p.rolesPermitidas.includes(role.id)}
                                                    onChange={() => handleToggleRole(pIdx, role.id)}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.mobileCardsContainer}>
                        {permissoes.map((p, pIdx) => (
                            <div key={p.nomeRegra} className={styles.regraCard}>
                                <div className={styles.regraCardHeader}>
                                    {RULE_LABELS[p.nomeRegra] || p.nomeRegra}
                                </div>
                                <div className={styles.rolesGrid}>
                                    {ROLES.map(role => {
                                        const isActive = p.rolesPermitidas.includes(role.id);
                                        return (
                                            <div 
                                                key={role.id} 
                                                className={`${styles.roleItem} ${isActive ? styles.active : ''}`}
                                                onClick={() => handleToggleRole(pIdx, role.id)}
                                            >
                                                <input 
                                                    type="checkbox" 
                                                    className={styles.checkbox}
                                                    checked={isActive}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleRole(pIdx, role.id);
                                                    }}
                                                />
                                                <span className={styles.roleLabel}>{role.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.actions}>
                        <button 
                            className={styles.saveButton} 
                            onClick={handleSalvar}
                            disabled={saving}
                        >
                            <FaSave /> {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfiguracoesPermissoes;
