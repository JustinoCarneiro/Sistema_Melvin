---
tipo: bug
data: 2026-10-10
severidade: Crítica
status: Corrigido e publicado em produção em 10/10/2026
---

# Spring Data REST publicava os repositórios como API para qualquer cargo logado

## Sintoma
Achado na auditoria de segurança de 10/10/2026, por teste, sem exploração observada. Com o token de um COZI
(o cargo mais baixo):
- `GET /users` devolvia todos os usuários com o hash da senha e o cargo;
- `GET /discentes`, `/voluntarios`, `/amigoMelvins`, `/embaixadors`, `/imagems`, `/permissaoRegras` devolviam
  as entidades inteiras (com os campos cifrados já decifrados), com escrita (POST, PUT, PATCH, DELETE);
- `POST /users` com `"role":"ADM"` respondia 201, ou seja, qualquer logado podia criar um administrador ou trocar
  o hash de senha de outro usuário.

Nos logs do nginx disponíveis na hora (desde 26/09/2026) não havia nenhuma chamada a essas rotas. A dependência
existia desde o commit inicial (03/07/2024), então não dá para afirmar nada sobre o período anterior aos logs.

## Causa raiz
Três coisas juntas:
1. `spring-boot-starter-data-rest` estava no `pom.xml` desde o início, sem nenhum uso. Com ele no classpath, o
   Spring publica sozinho cada interface de repositório JPA como API REST (`/users`, `/discentes`...).
2. Essas rotas são registradas por um mapeamento próprio (`RepositoryRestHandlerMapping`), fora do mapeamento dos
   controllers. Por isso não aparecem quando se lê os controllers nem quando se percorre o
   `RequestMappingHandlerMapping` (a primeira versão da `MatrizDeAcessoTest` também não as via).
3. A regra padrão da segurança era `anyRequest().authenticated()`: tudo o que não tinha regra própria ficava
   aberto a qualquer cargo logado.

## Solução
- A dependência saiu do `pom.xml` (levou junto spring-data-rest e spring-hateoas, que tinham alertas abertos).
- A regra padrão virou `anyRequest().denyAll()`: rota que não está na `SecurityConfiguration` é negada para
  todos, até para o ADM. As rotas comuns a qualquer logado foram declaradas uma a uma.
- `RotasForaDoInventarioTest`: confere que o Spring Data REST não está no classpath, que as rotas de repositório
  respondem 403/404 para COZI, ADM e TECH sem vazar hash, que `POST /users` não cria usuário e que uma rota
  inventada é negada a todos.

## Como não repetir
- Dependência sem uso é superfície de ataque: starters que publicam rotas sozinhos (data-rest, actuator,
  devtools) precisam de motivo para estar no projeto.
- O inventário de rotas tem de olhar o tráfego real além do código: a verificação que pegou isto foi chamar
  `/`, `/profile` e `/users` com um token de cargo baixo.
- Toda rota nova precisa de regra explícita e de linha na `MatrizDeAcessoTest`; o padrão negar garante que
  esquecer a regra fecha a rota em vez de abri-la.

## Ligado a
- [[regra-de-seguranca-com-caminho-errado-abria-rota-para-qualquer-logado]]: a mesma regra padrão permissiva.
- [[rotas-internas-abertas-sem-login-expoem-dados-pessoais]]: os lotes anteriores da mesma revisão.
