---
tipo: bug
data: 2026-10-15
severidade: Alta
status: Corrigido e publicado em produção em 15/10/2026 (commit 4dab670); sem validação humana com login real ainda
---

# Voluntário desligado continuava entrando no sistema

## Sintoma
Achado em 14/10/2026, registrado pela revisão de segurança do módulo 32 e confirmado em leitura de
código e de dados. Remover um voluntário (`VoluntarioService.remover`) só marcava `status = "false"`
no cadastro. O usuário de login da pessoa (`users`, login igual à matrícula) não era tocado:
`User.isEnabled()` devolvia sempre `true`, então a senha antiga seguia valendo e a pessoa continuava
com o cargo antigo em todas as rotas por cargo, inclusive na leitura de dados de alunos. Em produção
havia contas de pessoas já desligadas, algumas de coordenação, com o acesso ainda ativo. Não foi
verificado se alguma delas voltou a entrar depois do desligamento.

## Causa raiz
O `User` não tem ligação com o `Voluntario`; o vínculo é só "login = matrícula". Nenhum ponto do
caminho de autenticação (`AuthorizationService.loadUserByUsername`, o `DaoAuthenticationProvider` e o
`SecurityFilter`) consultava o status do voluntário, e o `isEnabled()` fixo em `true` nunca os
alertava. Havia ainda um segundo desvio no mesmo arquivo: o último `else` de `User.getAuthorities()`
devolvia `ROLE_DIRE`, então cargo ausente ou esquecido no mapa ganhava privilégio alto.

## Correção
- `ContaDeEquipeAtiva.ativa(login)`: voluntário de mesma matrícula com status diferente de `"true"`
  (nulo também) torna a conta inativa; sem voluntário, a conta segue ativa (contas administrativas e
  técnicas). O status do voluntário é a única fonte: reativar reabre o acesso.
- `AuthorizationService`: conta inativa lança `UsernameNotFoundException`, e o login responde o mesmo
  401 "Matrícula ou senha inválida" da senha errada, sem revelar que a conta existe.
- `SecurityFilter`: a conta é conferida a cada requisição, então um token emitido antes do desligamento
  deixa de autenticar na hora (a rota responde 403), sem esperar o token expirar.
- `User.getAuthorities()`: `ROLE_DIRE` virou um ramo explícito, e cargo ausente fica sem nenhuma autoridade.
- Testes (backend 357/357): `ContaDeEquipeAtivaTest` (4), `VoluntarioDesligadoSecurityTest` (5, com
  token real e H2: ativo entra, desligado leva 401 com a mesma mensagem, token antigo cai, reativar
  reabre, conta sem voluntário segue), `AuthorizationServiceTest` e `UserTest`.

## Antes de publicar
Um status errado passaria a bloquear quem trabalha, então a lista de voluntários desligados que ainda
tinham login foi conferida. Em 15/10/2026 o dono do projeto confirmou que as 10 contas (2 de
coordenação, 5 de professor, 1 de auxiliar, 1 de marketing e 1 de assistência) são de pessoas que
realmente saíram; o bloqueio não atinge quem trabalha. Depois da publicação, conferir com um desses
logins que o 401 aparece e que a conta de um voluntário ativo e a de um administrador seguem entrando.

## Lições
- Um vínculo só por convenção ("login = matrícula") precisa de um ponto único que o aplique; aqui
  nenhum lugar o aplicava.
- `isEnabled()` fixo em `true` é um alerta: a conta nunca pode ser desligada por esse caminho.
- Fallback silencioso para um cargo privilegiado é pior que negar: o padrão do mapa de cargos deve
  ser "sem acesso".

## Ligado a
- [[decisoes-14-10-2026-area-da-familia-transparencia-e-nota-psicologica]] (item 10)
- [[rotas-internas-abertas-sem-login-expoem-dados-pessoais]]
- [[conteudos-trabalhados-por-sala-e-periodo]]
