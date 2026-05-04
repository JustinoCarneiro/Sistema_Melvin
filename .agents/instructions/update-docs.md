# Regra de Atualização de Documentação — Sistema Melvin

> **INSTRUÇÃO OBRIGATÓRIA PARA AGENTES DE IA**
> Este arquivo deve ser lido e seguido antes de qualquer alteração de código neste projeto.

---

## Regra Principal

**Sempre que qualquer funcionalidade for adicionada, alterada ou removida no Sistema Melvin, os três documentos abaixo DEVEM ser atualizados no mesmo "turno" de trabalho, antes de encerrar a tarefa:**

| Arquivo | Audiência | O que atualizar |
|---|---|---|
| `README.md` | Desenvolvedores externos / GitHub | Stack, estrutura, como rodar, scripts, troubleshooting |
| `docs/DOCUMENTACAO_TECNICA.md` | Equipe técnica interna | Entidades, endpoints, fluxos técnicos, segurança, infra |
| `docs/APRESENTACAO_PARA_O_INSTITUTO.md` | Diretoria e clientes | Funcionalidades em linguagem acessível, benefícios |

---

## Checklist por Tipo de Mudança

### ➕ Nova Funcionalidade (novo módulo, nova tela, nova regra)
- [ ] `DOCUMENTACAO_TECNICA.md`: Adicionar seção do novo módulo (Modelo, Regra de Negócio, Endpoints, Fluxo)
- [ ] `APRESENTACAO_PARA_O_INSTITUTO.md`: Adicionar seção explicando o benefício da funcionalidade em linguagem simples
- [ ] `README.md`: Atualizar estrutura de pastas se necessário, e a seção de testes se novos testes foram escritos

### 🔧 Alteração em Funcionalidade Existente
- [ ] `DOCUMENTACAO_TECNICA.md`: Atualizar a seção correspondente ao módulo alterado
- [ ] `APRESENTACAO_PARA_O_INSTITUTO.md`: Atualizar se a mudança impacta a experiência do usuário final
- [ ] `README.md`: Atualizar se mudou algum comando, script, porta ou variável de ambiente

### 🗑️ Remoção de Funcionalidade
- [ ] Remover ou marcar como depreciada a seção correspondente em todos os três documentos
- [ ] Atualizar tabela de endpoints se alguma rota foi removida

### 🔐 Mudanças de Segurança / Infraestrutura
- [ ] `DOCUMENTACAO_TECNICA.md`: Seções 5 (Segurança) e 6 (Infraestrutura)
- [ ] `README.md`: Seção de Segurança e Notas Técnicas
- [ ] `APRESENTACAO_PARA_O_INSTITUTO.md`: Seção 2 (Segurança) se a mudança for relevante para o cliente

### 🗄️ Mudanças no Banco de Dados (nova entidade, novo campo, nova constraint)
- [ ] `DOCUMENTACAO_TECNICA.md`: Seção 3 (Modelos de Dados)
- [ ] `APRESENTACAO_PARA_O_INSTITUTO.md`: Apenas se o campo novo corresponde a uma funcionalidade visível ao usuário

### ⚙️ Novos Scripts / Variáveis de Ambiente
- [ ] `DOCUMENTACAO_TECNICA.md`: Seção 7 (Infraestrutura e Deploy) — tabela de scripts e tabela de variáveis
- [ ] `README.md`: Seção de Scripts de Automação e Configuração Inicial

---

## Documentos de Referência

- **Documentação Técnica:** `docs/DOCUMENTACAO_TECNICA.md`
- **Apresentação para o Instituto:** `docs/APRESENTACAO_PARA_O_INSTITUTO.md`
- **README principal:** `README.md`
- **Documentação original (referência histórica):** `docs/Documentação do Sistema Melvin.pdf`

---

## Regra de Linguagem

- `DOCUMENTACAO_TECNICA.md`: Use termos técnicos precisos. Seja direto. Tabelas e código são bem-vindos.
- `APRESENTACAO_PARA_O_INSTITUTO.md`: **Proibido** usar jargões técnicos (ex: JWT, Docker, Argon2, Webhook, REST). Substitua sempre por linguagem de benefício. Exemplo: "Stripe" → "processadora de pagamentos global". "JWT" → "sessão segura com senha pessoal".
- `README.md`: Nível intermediário — pode usar nomes de tecnologias, mas explique o propósito de cada uma.
