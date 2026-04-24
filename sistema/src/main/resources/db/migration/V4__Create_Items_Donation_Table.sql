CREATE TABLE doacao_item (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(255) NOT NULL,
    tipo_item VARCHAR(255) NOT NULL,
    observacao TEXT,
    data_criacao TIMESTAMP NOT NULL
);
