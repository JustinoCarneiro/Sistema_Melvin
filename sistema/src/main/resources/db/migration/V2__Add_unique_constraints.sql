-- Adicionar constraints únicas para evitar duplicatas de frequência

CREATE UNIQUE INDEX IF NOT EXISTS idx_frequencia_discente_matricula_data 
ON frequencia_discente(matricula, data);

CREATE UNIQUE INDEX IF NOT EXISTS idx_frequenciavoluntario_matricula_data 
ON frequenciavoluntario(matricula, data);
