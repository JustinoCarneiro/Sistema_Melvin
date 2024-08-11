import styles from './Embaixadores.module.scss';

import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import get from '../../../services/requests/get';

import foto_principal from "../../../docs/imagem_embaixadores.jpeg";

function Embaixadores(){
    const navigate = useNavigate();
    const [embaixadores, setEmbaixadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmbaixadores = async () => {
            try{
                const response = await get.embaixadores();
                const embaixadoresData = await Promise.all(response.data
                    .filter(embaixador => {
                        return embaixador.status;
                    })
                    .map(async embaixador => {
                        try {
                            const imagemResponse = await get.imagemlista();
                            const imagemParaEmbaixador = imagemResponse.data.find(imagem => imagem.idAtrelado === embaixador.id && imagem.tipo === 'embaixador');

                            if (imagemParaEmbaixador) {
                                const imageUrl = `${import.meta.env.VITE_REACT_APP_FETCH_URL}${imagemParaEmbaixador.filePath}`;
                                return {
                                    ...embaixador,
                                    imageUrl: imageUrl,
                                };
                            } else {
                                console.warn(`Não foi encontrada imagem para embaixador ${embaixador.id}`);
                                return {
                                    ...embaixador,
                                    imageUrl: null,
                                };
                            }
                        } catch (imageError) {
                            console.error(`Erro ao obter imagem para embaixador ${embaixador.id}:`, imageError.response ? imageError.response.data : imageError.message);
                            return {
                                ...embaixador,
                                imageUrl: null,
                            };
                        }
                    })
                );

                setEmbaixadores(embaixadoresData);
                setLoading(false);
            }catch (error) {
                setError(error);
                setLoading(false);
            }
        }
        fetchEmbaixadores();
    },[]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return(
        <div className={styles.body}>
            {embaixadores.length > 0 && (
                <div className={styles.faixa_embaixadores}>
                    <h2 className={styles.title_faixa_embaixadores}>Embaixadores</h2>
                    <div className={styles.container_embaixadores}>
                        {embaixadores.map(embaixador => (
                            <div key={embaixador.id} className={styles.embaixador}>
                                <div className={styles.foto}>
                                    <img
                                        src={embaixador.imageUrl}
                                        alt={`Foto de ${embaixador.nome}`}
                                        className={styles.imagem}
                                    />
                                </div>
                                <div className={styles.nome}>{embaixador.nome}</div>
                                <div className={styles.descricao}>{embaixador.descricao}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className={styles.faixa_embaixadores_explicacao}>
                <div className={styles.conteudo}>
                    <h2 className={styles.title}>Embaixador do Melvin</h2>
                    <p className={styles.texto}>
                        <p>
                            Seja um embaixador do Instituto Melvin e use sua influência para fazer a diferença! Como embaixador, 
                            você ajudará a divulgar nossas ações e campanhas, utilizando suas redes sociais para arrecadar doações de alimentos, 
                            materiais escolares, esportivos e muito mais. Sua voz pode impactar vidas e trazer recursos essenciais para nossos projetos.
                        </p>
                        <p>
                            Se você deseja contribuir de forma significativa e ampliar nosso alcance, solicite abaixo para se tornar um embaixador do 
                            Instituto Melvin. Juntos, podemos transformar realidades e fazer o bem!
                        </p>
                    </p>
                    <button className={styles.button} onClick={() => navigate("/serembaixador")}>Quero ser um embaixador!</button>
                </div>
                <div className={styles.imagens}>
                    <div className={styles.imagem_front}>
                        <img src={foto_principal} alt="foto_principal" className={styles.img}/>
                    </div>
                    <div className={styles.imagem_back}></div>
                </div>
            </div>
        </div>
    )
}

export default Embaixadores;