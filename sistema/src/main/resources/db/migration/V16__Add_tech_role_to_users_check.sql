-- US-1.5 (novo cargo TECH): o enum UserRole ganhou um valor novo (TECH, ordinal 10),
-- armazenado como smallint por JPA ordinal (sem @Enumerated explícito). O check constraint
-- gerado pelo Hibernate ddl-auto=update na criação original da tabela travou o intervalo em
-- 0-9 (os 10 cargos existentes até aqui) e não é ajustado automaticamente por ddl-auto=update
-- quando um enum ganha um valor novo — precisa de migration explícita.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role >= 0 AND role <= 10);
