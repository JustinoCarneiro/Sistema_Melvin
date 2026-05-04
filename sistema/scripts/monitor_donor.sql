-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  monitor_donor.sql — Auditoria de doadores (Amigos do Melvin)  ║
-- ║  Uso: psql -U <user> -d sistemamelvin -f monitor_donor.sql     ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- 1. Visão geral de todos os doadores (ordenados pelo mais recente)
SELECT
    nome,
    email,
    status,
    meses_contribuindo,
    subscription_id,
    stripe_customer_id,
    valor_mensal,
    forma_pagamento,
    data_inicio
FROM
    amigomelvin
ORDER BY
    data_inicio DESC;

-- 2. Resumo por status
SELECT
    status,
    COUNT(*)            AS total_doadores,
    SUM(valor_mensal)   AS receita_mensal
FROM
    amigomelvin
GROUP BY
    status
ORDER BY
    total_doadores DESC;

-- 3. Doadores com possível duplicidade de eventos (meses_contribuindo > 1 mas criados hoje)
SELECT
    nome,
    subscription_id,
    meses_contribuindo,
    last_processed_invoice_id,
    data_inicio
FROM
    amigomelvin
WHERE
    meses_contribuindo > 1
    AND data_inicio >= CURRENT_DATE
ORDER BY
    data_inicio DESC;

-- 4. ANOMALIA: Doadores ACTIVE com meses_contribuindo = 0
--    Indica erro de lógica — o confirmarPagamento não incrementou os meses.
SELECT
    nome,
    email,
    status,
    meses_contribuindo,
    subscription_id,
    last_processed_invoice_id,
    data_inicio
FROM
    amigomelvin
WHERE
    status = 'ACTIVE'
    AND (meses_contribuindo = 0 OR meses_contribuindo IS NULL)
ORDER BY
    data_inicio DESC;

-- 5. ANOMALIA: Doadores PENDING há mais de 24h (pagamento nunca confirmado)
SELECT
    nome,
    email,
    status,
    subscription_id,
    data_inicio,
    EXTRACT(EPOCH FROM (NOW() - data_inicio)) / 3600 AS horas_pendente
FROM
    amigomelvin
WHERE
    status = 'PENDING'
    AND data_inicio < NOW() - INTERVAL '24 hours'
ORDER BY
    data_inicio ASC;
