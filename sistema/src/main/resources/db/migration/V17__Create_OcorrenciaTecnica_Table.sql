-- Ocorrências Técnicas: registro de achados técnicos do próprio sistema (bugs, incidentes,
-- decisões técnicas, manutenção, segurança), exclusivo do cargo TECH (US-1.5). Sem cifragem:
-- dado técnico interno, não é dado pessoal sujeito à LGPD (diferente da tabela `ocorrencia`,
-- que é sobre alunos).
CREATE TABLE ocorrencia_tecnica (
    id UUID PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    categoria VARCHAR(30) NOT NULL CHECK (categoria IN ('BUG', 'INCIDENTE', 'MANUTENCAO', 'DECISAO_TECNICA', 'SEGURANCA')),
    severidade VARCHAR(10) NOT NULL CHECK (severidade IN ('BAIXA', 'MEDIA', 'ALTA')),
    descricao TEXT NOT NULL,
    resolvido BOOLEAN NOT NULL DEFAULT FALSE,
    autor_login VARCHAR(255) NOT NULL,
    data_ocorrencia DATE NOT NULL,
    criado_em TIMESTAMP NOT NULL
);
