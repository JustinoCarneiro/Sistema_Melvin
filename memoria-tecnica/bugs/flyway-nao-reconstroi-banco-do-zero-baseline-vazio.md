---
tipo: bug
data: 2026-09-13
severidade: Média
status: Pendente
---

# Flyway não reconstrói o banco do zero: `V1__Baseline.sql` é vazio e assume schema já criado pelo Hibernate

## Sintoma
Achado durante o smoke test do Edu+ (`~/Applications/edu-plus`, derivado deste
sistema), ao tentar subir o backend contra um Postgres vazio pela primeira
vez: a migration V2 falhou com `relation "frequencia_discente" does not
exist`, e o mesmo padrão se repetiu em outras tabelas mais adiante na cadeia.
Não é um sintoma observado na produção deste sistema (o banco de produção já
existe e já tem o schema completo) — é um achado de leitura/teste de
infraestrutura: **o schema de produção deste sistema não pode ser recriado do
zero usando só `mvn flyway:migrate`/o boot normal da aplicação**, caso ele
precise ser reconstruído (recuperação de desastre, novo servidor, ambiente de
homologação limpo).

## Causa raiz
`V1__Baseline.sql` é um marcador vazio (`-- Baseline for the existing
schema`), pensado para `spring.flyway.baseline-on-migrate=true` marcar como
"versão 1" um banco que **já existia**, criado e evoluído ao longo do tempo
pelo Hibernate com `ddl-auto=update` (o `application.properties` deste
projeto já usa `validate` como padrão do código, mas isso só é seguro porque o
ambiente real provavelmente já roda/rodou com `update` via variável de
ambiente até o schema estabilizar). A partir daí, toda a cadeia de migrations
seguintes assume essa base pré-existente: várias fazem só `ALTER TABLE`/
`DROP TABLE` em tabelas (`discente`, `voluntario`, `users`, `aviso`, `diario`,
`imagem`, `frequencia_discente`, `frequenciavoluntario`, `amigomelvin`,
`cestas`, `permissao_regra`, entre outras) que nenhuma migration jamais
`CREATE`. Isso nunca é exercitado em produção porque o banco de produção nunca
"nasce" — só é migrado incrementalmente a partir do estado que já tinha antes
do Flyway existir no projeto.

## Solução
Ainda não corrigido — registrado aqui para avaliação e correção posterior.
Caminho sugerido (validado e já aplicado do lado do Edu+, que é
estruturalmente idêntico até a V18 e pode servir de referência direta):

- Adicionar uma ou mais migrations aditivas (versão decimal, ex.
  `V1_1__Bootstrap_Legacy_Baseline_Tables.sql`, que o Flyway ordena entre V1 e
  V2) que recriem, com o formato exato que o Hibernate hoje gera para as
  entidades JPA vivas (extrair via `ddl-auto=create` num banco descartável e
  `pg_dump --schema-only`, nunca "de memória" — evita erro sutil de tipo/
  coluna que só aparece no `ddl-auto=validate` do boot real), as tabelas que a
  cadeia assume pré-existentes.
- Não é urgente para a operação normal (o banco de produção já existe e
  continua migrando incrementalmente sem problema) — só importa no dia em que
  for preciso reconstruir o ambiente do zero. Vale avaliar se compensa
  resolver preventivamente ou só documentar o procedimento manual de
  contorno (restaurar de um backup real em vez de depender do Flyway puro)
  para esse cenário.

## Ligado a
- Mesmo achado, já corrigido, do lado do Edu+ (`~/Applications/edu-plus`,
  `memoria-tecnica/bugs/flyway-baseline-vazio-assume-schema-do-hibernate-ddl-update.md`)
  — lá a correção era obrigatória porque o produto nasce sempre de um banco
  vazio (proibido reaproveitar dado/deploy deste sistema), então o problema
  não é hipotético como é aqui.
