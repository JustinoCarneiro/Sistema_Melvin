import styles from './HomeApp.module.scss';

import Cookies from 'js-cookie';
import get from '../../services/requests/get';
import { useEffect, useState } from 'react';

function Home(){
    const userRole = Cookies.get('role');
    const [frequenciaManhaSala1, setFrequenciaManhaSala1] = useState(0);
    const [frequenciaManhaSala2, setFrequenciaManhaSala2] = useState(0);
    const [frequenciaManhaSala3, setFrequenciaManhaSala3] = useState(0);
    const [frequenciaManhaSala4, setFrequenciaManhaSala4] = useState(0);
    const [frequenciaTardeSala1, setFrequenciaTardeSala1] = useState(0);
    const [frequenciaTardeSala2, setFrequenciaTardeSala2] = useState(0);
    const [frequenciaTardeSala3, setFrequenciaTardeSala3] = useState(0);
    const [frequenciaTardeSala4, setFrequenciaTardeSala4] = useState(0);
    const [totalManha, setTotalManha] = useState(0);
    const [totalTarde, setTotalTarde] = useState(0);

    const [avisos, setAvisos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            const dataDeHoje = new Date().toISOString().split('T')[0];

            try {
                const response = await get.frequenciadiscente(dataDeHoje);

                if (response && response.data) {
                    const sala1ManhaCount = response.data.filter(freq => freq.sala === 1 && freq.presenca_manha === 'P').length;
                    const sala2ManhaCount = response.data.filter(freq => freq.sala === 2 && freq.presenca_manha === 'P').length;
                    const sala3ManhaCount = response.data.filter(freq => freq.sala === 3 && freq.presenca_manha === 'P').length;
                    const sala4ManhaCount = response.data.filter(freq => freq.sala === 4 && freq.presenca_manha === 'P').length;

                    const sala1TardeCount = response.data.filter(freq => freq.sala === 1 && freq.presenca_tarde === 'P').length;
                    const sala2TardeCount = response.data.filter(freq => freq.sala === 2 && freq.presenca_tarde === 'P').length;
                    const sala3TardeCount = response.data.filter(freq => freq.sala === 3 && freq.presenca_tarde === 'P').length;
                    const sala4TardeCount = response.data.filter(freq => freq.sala === 4 && freq.presenca_tarde === 'P').length;

                    setFrequenciaManhaSala1(sala1ManhaCount);
                    setFrequenciaManhaSala2(sala2ManhaCount);
                    setFrequenciaManhaSala3(sala3ManhaCount);
                    setFrequenciaManhaSala4(sala4ManhaCount);

                    setFrequenciaTardeSala1(sala1TardeCount);
                    setFrequenciaTardeSala2(sala2TardeCount);
                    setFrequenciaTardeSala3(sala3TardeCount);
                    setFrequenciaTardeSala4(sala4TardeCount);

                    setTotalManha(sala1ManhaCount + sala2ManhaCount + sala3ManhaCount + sala4ManhaCount);
                    setTotalTarde(sala1TardeCount + sala2TardeCount + sala3TardeCount + sala4TardeCount);
                }
            } catch (error) {
                console.error('5100: Erro ao obter dados da frequência dos alunos!', error);
            }
        }

        fetch();
    }, []);

    useEffect(() => {
        const fetch = async () => {
            try{
                const response = await get.aviso();
                console.log("response", response);
                const avisosData = await Promise.all(response.data
                    .filter(aviso => {
                        return aviso.status;
                    })
                    .map(async aviso => {
                        try{
                            const imagemResponse = await get.imagemlista();
                            const imagemParaAviso = imagemResponse.data.find(imagem => imagem.idAtrelado === aviso.id && imagem.tipo === 'aviso');
                            if(imagemParaAviso){
                                const imageUrl = `${import.meta.env.VITE_REACT_APP_FETCH_URL}${imagemParaAviso.filePath}`;
                                return {
                                    ...aviso,
                                    imageUrl: imageUrl,
                                };
                            }else {
                                console.warn(`Não foi encontrada imagem para aviso ${aviso.id}`);
                                return {
                                    ...aviso,
                                    imageUrl: null,
                                };
                            }
                        } catch (imageError) {
                            console.error(`Erro ao obter imagem para aviso ${aviso.id}:`, imageError.response ? imageError.response.data : imageError.message);
                            return {
                                ...aviso,
                                imageUrl: null,
                            };
                        }
                    })
                );

                setAvisos(avisosData);
                setLoading(false);

            }catch (error) {
                setError(error);
                setLoading(false);
            }
        }
        fetch();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

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
            <div className={styles.linha}>
                <div className={styles.qtd_alunos}>
                    <h3 className={styles.title}>Quantidade de alunos presentes no dia:</h3>
                    <div className={styles.turnos}>
                        <div>
                            <h4 className={styles.subtitle}>Manhã</h4>
                            <div className={styles.salas}>
                                <div>
                                    Sala 1: 
                                    <p>{frequenciaManhaSala1}</p>
                                </div>
                                <div>
                                    Sala 2: 
                                    <p>{frequenciaManhaSala2}</p>
                                </div>
                                <div>
                                    Sala 3: 
                                    <p>{frequenciaManhaSala3}</p>
                                </div>
                                <div>
                                    Sala 4: 
                                    <p>{frequenciaManhaSala4}</p>
                                </div>
                                <div>
                                    Total manhã:
                                    <p>{totalManha}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className={styles.subtitle}>Tarde</h4>
                            <div className={styles.salas}>
                                <div>
                                    Sala 1: 
                                    <p>{frequenciaTardeSala1}</p>
                                </div>
                                <div>
                                    Sala 2: 
                                    <p>{frequenciaTardeSala2}</p>
                                </div>
                                <div>
                                    Sala 3: 
                                    <p>{frequenciaTardeSala3}</p>
                                </div>
                                <div>
                                    Sala 4: 
                                    <p>{frequenciaTardeSala4}</p>
                                </div>
                                <div>
                                    Total tarde: 
                                    <p>{totalTarde}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {avisos.length > 0 && (
                    <div className={styles.aviso}>
                        <div className={styles.aviso_texto}>
                            <h3 className={styles.title_aviso}>{avisos[0]?.titulo}</h3>
                            <p className={styles.texto}>{avisos[0]?.corpo}</p>
                        </div>
                        <div className={styles.imagem}>
                            {avisos[0]?.imageUrl && <img src={avisos[0].imageUrl} alt={`Aviso ${avisos[0].id}`} className={styles.img} />}
                        </div>
                    </div>
                )}
            </div>
            {avisos.slice(1).map((aviso, index) => (
                <div key={index} className={styles.linha}>
                    <div className={styles.aviso}>
                        <div className={styles.aviso_texto}>
                            <h3 className={styles.title_aviso}>{aviso.titulo}</h3>
                            <p className={styles.texto}>{aviso.corpo}</p>
                        </div>
                        <div className={styles.imagem}>
                            {aviso.imageUrl && <img src={aviso.imageUrl} alt={`Aviso ${aviso.id}`} className={styles.img}/>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Home;