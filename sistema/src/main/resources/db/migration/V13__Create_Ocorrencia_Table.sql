-- US-3.7: histórico de observações comportamentais/pedagógicas por aluno.
-- Descrição cifrada (AES-256-GCM, SensitiveDataConverter) por conter observação
-- comportamental de menor -- mesmo tratamento LGPD dos demais campos sensíveis
-- do Discente (doenca, medicacao, contato_pai etc). Nunca exposta em listagens
-- resumidas (DiscenteListagemDTO), só via /ocorrencias/discente/{matricula}.
CREATE TABLE IF NOT EXISTS ocorrencia (
    id UUID PRIMARY KEY,
    matricula_discente VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    descricao TEXT NOT NULL,
    autor_login VARCHAR(255) NOT NULL,
    data_ocorrencia DATE NOT NULL,
    criado_em TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ocorrencia_matricula_discente ON ocorrencia (matricula_discente);
