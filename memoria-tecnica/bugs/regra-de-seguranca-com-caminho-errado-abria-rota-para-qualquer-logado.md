---
tipo: bug
data: 2026-10-10
severidade: Alta
status: Corrigido e publicado em produção em 10/10/2026
---

# Regra de segurança com o caminho errado deixava a rota aberta a qualquer cargo logado

## Sintoma
Achado na auditoria de 10/10/2026 chamando cada rota mapeada com um COZI real (token JWT). Qualquer cargo logado
conseguia:
- apagar voluntário, aluno, frequência de aluno e frequência de voluntário;
- cancelar a assinatura de um doador (cancela no Stripe) e usar o cadastro manual legado de Amigo, que ainda era público;
- baixar a planilha com os dados de todos os alunos e a de frequência;
- criar e apagar dias não letivos (tela exclusiva de ADM e TECH);
- registrar ou alterar o ponto de outro voluntário.
Além disso, `GET /imagens/lista` e qualquer `POST /embaixador/**` eram públicos.

## Causa raiz
As regras existiam, mas para o caminho errado: `DELETE /voluntario` não cobre `DELETE /voluntario/{matricula}`
(o caminho real da rota). A rota caía na regra padrão `anyRequest().authenticated()` e passava para qualquer
cargo. Outras rotas simplesmente não tinham regra. A interface escondia os botões pelas permissões certas, o que
dava a falsa impressão de que o backend também barrava. O ponto aceitava qualquer matrícula no corpo.

## Solução
- Regras com o caminho real e as mesmas permissões que a interface exige (`GERENCIAR_VOLUNTARIOS`,
  `CADASTRAR_ALUNO`, `GERENCIAR_FREQUENCIA`, `GERENCIAR_AMIGOS`, `VISUALIZAR_ALUNOS`, `VISUALIZAR_RELATORIOS`,
  ADM e TECH no calendário).
- Ponto: o próprio voluntário, ou ADM, TECH, DIRE e COOR, que têm tela de frequência da equipe
  (`PontoVoluntarioAcesso`).
- Lista de imagens só para logados; a página pública de embaixadores passou a receber a foto na própria lista
  pública (`fotoPath`), em vez de baixar todas as imagens uma vez por embaixador.
- `MatrizDeAcessoTest`: classifica TODAS as rotas mapeadas em pública, logado ou restrita, chamando cada uma
  sem login e com um COZI real. Falha o build se aparecer rota sem classificação ou se uma rota ficar mais aberta.
  Mutação conferida: voltar a regra do DELETE de voluntário ao caminho sem matrícula derruba o teste.
- Depois veio o padrão negar ([[spring-data-rest-publicava-repositorios-para-qualquer-logado]]), que fecha a
  rota esquecida em vez de abri-la.

## Como não repetir
Escrever a regra com o caminho que o controller declara (`/voluntario/{matricula}`) e conferir pela matriz, não
pela leitura. Antes de restringir uma rota, procurar quem a chama também no site público (a lista de imagens era
usada pela página de embaixadores).

## Ligado a
- [[rotas-internas-abertas-sem-login-expoem-dados-pessoais]]
- [[spring-data-rest-publicava-repositorios-para-qualquer-logado]]
