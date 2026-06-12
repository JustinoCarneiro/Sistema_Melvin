CREATE TABLE dia_nao_letivo (
    id UUID PRIMARY KEY,
    data DATE NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    CONSTRAINT idx_dia_nao_letivo_data UNIQUE (data)
);
