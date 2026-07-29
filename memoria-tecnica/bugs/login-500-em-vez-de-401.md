---
tipo: bug
data: 2026-07-15
severidade: Média
status: Resolvido
---

# Login com matrícula inexistente retornava 500 em vez de 401

## Sintoma
US-1.1 documenta que matrícula/senha inválida deve retornar 401 com mensagem "Matrícula ou senha inválida". Na prática, matrícula inexistente causava 500.

## Causa raiz
`AuthorizationService.loadUserByUsername` repassava `null` quando `findByLogin` não encontrava o usuário, violando o contrato de `UserDetailsService` (que exige lançar exceção, nunca retornar null).

## Solução
Método agora lança `UsernameNotFoundException` quando o login não é encontrado, restaurando o 401 documentado.

## Ligado a
- [[webhook-500-stacktrace-sem-body]]
