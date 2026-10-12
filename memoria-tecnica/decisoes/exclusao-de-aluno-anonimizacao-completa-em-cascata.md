---
tipo: decisao
data: 2026-10-12
status: Ativa
---

# Exclusão de aluno: anonimização completa e em cascata, mantendo a matrícula

## Contexto
A auditoria de produção de 08/10/2026 achou 190 frequências de 3 alunos excluídos ainda exibindo o nome. Investigando, o fluxo `DiscenteService.remover` só anonimizava contato, endereço, RG e saúde: deixava nome, nomes dos pais, e-mails e dados de trabalho/renda da família, e não propagava para `frequencia_discente` (que guarda uma cópia do nome), `ocorrencia` (texto livre) e `diario` (arquivo com o conteúdo do acompanhamento). Não existe nenhuma chave estrangeira para `discente`, então nada acontecia em cascata.

Em produção nenhum aluno havia passado pelo fluxo atual (nenhum com `doenca` e `rg` iguais a `Anonimizado`); os 52 alunos inativos são quem saiu ou se formou, sem pedido de apagamento. Só o risco para exclusões futuras era real.

## Decisão
`remover` passa a, numa única transação: apagar a identificação pessoal e os dados da família na ficha (`nome` vira "Aluno removido"; nomes dos pais, e-mails, trabalho, ocupação, renda, outro familiar e horário de medicamento ficam nulos; `cidade`, obrigatória, vira "Anonimizado"; a data de nascimento, obrigatória, mantém só o ano); trocar o nome por "Aluno removido" em todas as frequências do aluno; substituir a descrição das ocorrências por texto fixo; e apagar o diário (arquivo e registro) por último. Se o diário não puder ser apagado, lança `IllegalStateException` e a transação desfaz o restante.

**A matrícula é mantida.** `generateMatricula()` calcula a próxima com `COUNT(*) FROM discente WHERE matricula LIKE 'AAAA%'` (e há `findTopByOrderByMatriculaDesc()`): trocar a matrícula de um removido por um código aleatório faria o contador do ano cair, e o próximo aluno receberia uma matrícula já existente; um código `ANON-…` também ordenaria acima dos números. A troca de matrícula só foi feita nas 190 frequências já órfãs, onde não existe ficha.

Dois caminhos continuam separados: "Inativa" não apaga nada (aluno que saiu ou pode voltar) e "Deletar" é irreversível, só para pedido de eliminação de dados. A tela passou a avisar isso (`role=alert`) e a confirmação repete o aviso.

A descrição da ocorrência é atualizada pela entidade (e não por `UPDATE` em massa) porque a coluna usa `SensitiveDataConverter`: um `UPDATE` em massa poderia gravar texto puro numa coluna cifrada, que depois falharia ao ser lida.

## Consequências
- Aluno removido que volta é cadastro novo; o histórico individual antigo não volta (é o efeito de apagar). Quem pode voltar deve ser "Inativa".
- Permanecem na ficha, de propósito, matrícula, sala, turno, sexo, cor, nacionalidade, ano de nascimento e as notas de avaliação (estatística). Se o Instituto quiser apagar também a nota psicológica de removidos, é mudança pequena em `remover`.
- Os backups guardam os dados anteriores por até 30 dias; a eliminação só se completa quando saem dessa janela.
- Não há chave estrangeira entre as tabelas: qualquer tabela nova que referencie o aluno por matrícula ou copie dado pessoal precisa entrar em `remover` e nos testes.
- O front já chamava a exclusão do diário por conta própria; agora o servidor também apaga, então essa segunda chamada recebe "não encontrado", que o front já ignora.
- **Não remover `flushAutomatically = true` de `anonimizarNomePorMatricula`.** O `UPDATE` em massa usa `clearAutomatically`, que descarta alterações ainda não gravadas; sem o flush antes, a ficha do aluno (status, nome, e-mails…) se perde e a exclusão fica parcial, sem erro. `DiscenteRemocaoIntegracaoTest` cobre isso com repositórios reais e falha sem a opção (verificado em 12/10/2026).
- Mudança de código **não publicada em produção** (aguarda autorização de deploy). Sem migration.

## Ligado a
- [[backup-melvin-diario-criptografado]] (os backups guardam os dados anteriores por 30 dias)
