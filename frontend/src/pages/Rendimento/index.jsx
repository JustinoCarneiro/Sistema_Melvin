import styles from './Rendimento.module.scss';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

import get from '../../services/requests/get';

function Rendimento(){
    const {matricula} = useParams();
    const [formDado, setFormDado] = useState({
        nome: '',
        sala: '',
    });
    const [frequencias, setFrequencias] = useState([]);
    const [mesSelecionado, setMesSelecionado] = useState('');
    const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(false);

    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    useEffect(() => {
        const fetchAluno = async () => {
            try{
                const response = await get.discenteByMatricula(matricula);
                console.log("reponse:", response);

                if(response.data){
                    setFormDado({
                        nome: response.data.nome || '',
                        sala: response.data.sala || '',
                    })
                } else {
                    console.log('Aluno não encontrado');
                }
            }catch (error) {
                console.error('5002:Erro ao obter dados do aluno!', error);

                // Verificar se o erro tem uma resposta e pegar o texto ou JSON
                if (error.response) {
                    const errorMessage = error.response.data ? JSON.stringify(error.response.data) : error.response.statusText;
                    console.error(`Erro ao obter dados do aluno: ${errorMessage}`);
                    alert(`Erro ao obter dados do aluno: ${errorMessage}`);
                } else {
                    alert('Erro ao obter dados do aluno!');
                }
            }
        };

        fetchAluno();
    }, [matricula]);

    const fetchFrequencias = async () => {
        if (!mesSelecionado || !anoSelecionado) {
          alert('Por favor, selecione um mês e ano.');
          return;
        }
    
        setIsLoading(true);
        setFrequencias([]); // Resetar o estado enquanto carrega
    
        try {
          const diasNoMes = new Date(anoSelecionado, mesSelecionado, 0).getDate();
          const promises = [];
    
          for (let dia = 1; dia <= diasNoMes; dia++) {
            const data = `${anoSelecionado}-${String(mesSelecionado).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            promises.push(get.frequenciadiscente(data, matricula));
          }
    
          const responses = await Promise.allSettled(promises);
    
          // Processar as respostas (sucesso e erros)
          const todasFrequencias = responses
            .filter((res) => res.status === 'fulfilled' && res.value.data) // Apenas respostas bem-sucedidas com dados
            .flatMap((res) => res.value.data); // Extrair dados das respostas
    
          setFrequencias(todasFrequencias);
        } catch (error) {
          console.error('Erro ao obter frequências!', error);
          alert('Erro ao obter frequências!');
        } finally {
          setIsLoading(false);
        }
    };

    return (
        <div className={styles.body}>
          <div>
            <h2>Nome: {formDado.nome}</h2>
            <h2>Sala: {formDado.sala}</h2>
            <h2>Matricula: {matricula}</h2>
          </div>
          <div>
            <label>
              Selecione o mês:
              <select value={mesSelecionado} onChange={(e) => setMesSelecionado(Number(e.target.value))}>
                <option value="">Selecione</option>
                {meses.map((mes, index) => (
                  <option key={index} value={index + 1}>
                    {mes}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Selecione o ano:
              <input
                type="number"
                value={anoSelecionado}
                onChange={(e) => setAnoSelecionado(e.target.value)}
                min="2000"
                max={new Date().getFullYear()}
              />
            </label>
            <button onClick={fetchFrequencias} disabled={isLoading}>
              {isLoading ? 'Carregando...' : 'Buscar Frequências'}
            </button>
          </div>
          <div>
            <h3>Frequências do mês selecionado:</h3>
            {frequencias.length > 0 ? (
              <ul>
                {frequencias.map((frequencia, index) => (
                  <li key={index}>
                    Data: {frequencia.data} - Presença Manhã: {frequencia.presenca_manha ? 'Sim' : 'Não'} - 
                    Presença Tarde: {frequencia.presenca_tarde ? 'Sim' : 'Não'}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhuma frequência encontrada para este mês.</p>
            )}
          </div>
        </div>
    );
}

export default Rendimento;