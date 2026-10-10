---
tipo: bug
data: 2026-10-10
severidade: Alta
status: Corrigido e publicado em produção em 10/10/2026
---

# Upload aceitava qualquer arquivo e o servia pelo mesmo domínio do sistema

## Sintoma
Achado em leitura de código na auditoria de 10/10/2026. Foto de embaixador e de aviso e diário de classe
aceitavam qualquer arquivo (HTML, SVG, script), com o nome que o navegador mandou, e o arquivo era servido por
`/app/docs/**` no mesmo domínio do sistema. Um HTML ou SVG com script enviado como "foto" rodaria no navegador de
quem abrisse o link, com acesso ao token de login (cookie legível por JavaScript). O nome do cliente ia para o
disco e para o cabeçalho de download sem tratamento.

## Causa raiz
Os serviços confiavam no `MultipartFile`: gravavam `UUID + "_" + getOriginalFilename()` e guardavam
`getContentType()` (o tipo que o navegador declara). Não havia lista de tipos nem conferência do conteúdo.

## Solução
- `UploadSeguro`: lista curta de extensões (JPG, PNG, GIF, WEBP e AVIF para fotos; PDF, DOC, DOCX, ODT, RTF, XLS,
  XLSX, ODS e imagens para o diário) e o conteúdo tem de começar com os bytes certos para a extensão. Em produção,
  na data, havia diários em docx, odt e pdf e imagens em avif: todos aceitos.
- O nome em disco é gerado pelo servidor (UUID + extensão); o do cliente vira só texto de exibição, sem caminho,
  sem caractere de controle e com no máximo 100 caracteres.
- Grava o arquivo novo antes de apagar o antigo.
- O download do diário usa o nome limpo e codificado e um tipo da lista (ou binário genérico), também para
  registros antigos.
- `/app/docs/**` responde com `Content-Security-Policy: default-src 'none'; sandbox` (o nosniff já vinha do Spring Security).
- Testes: `UploadSeguroTest` e `UploadsSegurosTest` (disco real em /tmp). Mutação conferida: sem a checagem de
  conteúdo ou sem o cabeçalho, 6 testes falham.

## Ligado a
- [[cadastros-publicos-confiavam-no-corpo-da-requisicao]]
