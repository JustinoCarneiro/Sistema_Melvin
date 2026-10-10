---
tipo: bug
data: 2026-10-10
severidade: Alta
status: Corrigido e publicado em produção em 10/10/2026
---

# Login sem limite de tentativas e verificação de senha sem teto de memória

## Sintoma
Achado em leitura de código na auditoria de 10/10/2026:
- `POST /auth/login` aceitava tentativas sem limite (as matrículas são sequenciais, fáceis de adivinhar);
- cada verificação de senha (Argon2 com 64 MB de memória) aloca 64 MB de heap, e o heap do backend é de 512 MB:
  algumas dezenas de logins simultâneos, mesmo com senha errada, esgotariam a memória;
- a matrícula digitada ia para o log sem tratamento (quebra de linha forjaria linhas de log).
Na mesma área: o ADM conseguia criar acesso TECH, promover alguém a TECH e redefinir a senha de um TECH (a
separação do suporte técnico só valia na tela), não havia regra mínima de senha, e um cadastro sem cargo virava
ROLE_DIRE (`User.getAuthorities()` cai em DIRE para cargo desconhecido, inclusive nulo).

## Solução
- `LoginAttemptService`: no máximo 10 falhas por matrícula e 20 por IP numa janela de 15 minutos (depois, 429 até
  a janela acabar, mesmo com a senha certa); login bem-sucedido zera a contagem da matrícula; no máximo 2
  verificações de senha ao mesmo tempo (o excedente espera até 5 s ou recebe 503). Estado em memória, com teto de
  chaves. Compromisso conhecido: quem sabe uma matrícula pode travá-la por 15 minutos.
- Matrícula e senha com tamanho máximo (não se gasta Argon2 com entrada gigante); `LogSanitizer` no log.
- Só o TECH cria, promove ou redefine a senha de um TECH; cargo obrigatório no cadastro; `PoliticaDeSenha`
  (8 a 128 caracteres, não pode ser a matrícula nem senha comum); as telas mostram a mensagem do servidor.
- O segredo do JWT precisa ter 32 caracteres ou mais (o sistema não sobe com segredo curto); a chave de
  criptografia não tem mais valor padrão no repositório (em produção os dois já estavam corretos, conferido sem
  imprimir os valores).
- Testes: `LoginAttemptServiceTest` (relógio simulado), `LoginProtecaoTest` (Argon2 de verdade),
  `AuthenticationControllerAdminTest`, `PoliticaDeSenhaTest`, `TokenServiceTest` (token forjado, alg none, expirado).

## Ligado a
- [[heap-exhaustion-504-cronico]]: por que memória sem teto é risco real aqui.
- [[rate-limit-burlavel-por-x-forwarded-for-forjado]]: a chave de IP (`ClientIp`).
