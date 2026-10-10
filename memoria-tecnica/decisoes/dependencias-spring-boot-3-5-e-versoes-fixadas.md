---
tipo: decisao
data: 2026-10-10
status: Ativa
---

# Spring Boot 3.5.16, versões de segurança fixadas por propriedade e como validar uma atualização

## Contexto
Em 10/10/2026 o backend estava no Spring Boot 3.3.4 (linha fora de suporte) e a consulta à base OSV com as
dependências resolvidas apontava 27 pacotes com vulnerabilidades conhecidas, várias críticas (Tomcat, Spring
Security, driver do PostgreSQL fixado em 42.6.0, Spring Framework, Jackson, logback). Os testes rodam em H2 sem
Flyway, então não exercitam a parte mais arriscada de uma atualização: o Flyway e o Hibernate contra o banco real.

## Decisão
- Spring Boot 3.5.16 (última da linha 3.x), driver do PostgreSQL 42.7.14, java-jwt 4.6.1, poi-ooxml 5.5.1,
  `bcprov-jdk18on` 1.86 no lugar de `bcpkix-jdk15on` 1.70 (o Argon2 só usa o bcprov), Gson declarado (o webhook o
  usa diretamente).
- Correções acima do que o Spring Boot traz ficam fixadas por propriedade no `pom.xml`, na mesma linha de versão:
  `tomcat.version`, `jackson-bom.version`, `commons-lang3.version`, `log4j2.version`. **Ao atualizar o Spring
  Boot, conferir se ainda são necessárias** (podem ficar mais velhas que as do próprio Boot).
- Sobram dois avisos do Spring MVC que só a versão 7 (Spring Boot 4) corrige, sobre SSE e XsltView, recursos que o
  sistema não usa.
- Migrar para o Spring Boot 4 fica para um trabalho próprio.

## Como validar uma atualização de dependência
1. `./mvnw clean test` (o editor também compila em `target/`; sem `clean` o Maven pode achar classes pela metade).
2. Consultar a base OSV com `mvnw dependency:list -DincludeScope=runtime` (só coordenadas de bibliotecas).
3. Subir a aplicação contra uma cópia **só da estrutura** do banco de produção: `pg_dump --schema-only` e os dados
   de `flyway_schema_history` (sem nenhum dado pessoal), num PostgreSQL da mesma versão de produção (14.24).
   Sem Docker, um teste temporário com `io.zonky.test:embedded-postgres` resolve. Em 10/10/2026: 17 migrations
   validadas, nenhuma pendente, o Hibernate com `ddl-auto=update` não alterou nenhuma coluna nem restrição.
   O banco não pode ser recriado do zero pelas migrations ([[flyway-nao-reconstroi-banco-do-zero-baseline-vazio]]).

## Consequências
- Flyway 11 e Hibernate 6.6 em produção desde 10/10/2026 (deploy sem erro, 0 ERROR no log de subida).
- Frontend: `npm audit fix` levou as vulnerabilidades de produção de 15 para 2 moderadas, no React Router 6,
  que só a versão 7 corrige (migração pendente).
