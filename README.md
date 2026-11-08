# Cadernos de Estudo

Cadernos pessoais de estudo num só site, sem build e sem variáveis de ambiente obrigatórias.

| Página | O que é |
|---|---|
| `/` (`index.html`) | Entrada: login (mesmo e-mail e senha do portal ADMIN CBMCE) e uma aba por curso. |
| `/qgis` (`qgis.html`) | Caderno do curso **Uso do QGIS como Estratégia de Segurança Pública** (AESP/CE, Turma 01/2026, Grupo 1, 09 a 18/11/2026). |
| `/dio` (`dio.html`) | Caderno da **trilha DIO: do zero aos agentes de IA para dados** (42 itens em 7 fases, 1 h por dia desde 09/11/2026). |

O login é compartilhado: entrou em `/`, já está logado nos dois cadernos. Os cadernos também funcionam sem login, salvando só no navegador.

## Caderno da trilha DIO (`/dio`)
- **Hoje:** item atual (ou o próximo), link da DIO, prompt de estudo, anotação rápida, "Comecei" e "Concluí".
- **Trilha:** os 42 itens na ordem, com a semana prevista no plano de 1 h por dia.
- **Fases:** progresso em horas, resumo da fase, notas e materiais.
- **Portfólio:** link do repositório de cada projeto e do repositório da trilha.
- **Prompt de estudo:** cada item tem um prompt para colar no Claude, que vira tutor daquele item. Prompts completos ficam em `PROMPTS_ESTUDO` (`dio.html`); os demais usam um modelo padrão. Um prompt editado no app fica salvo no item.
- **Materiais, Estudar, Caderno, Tarefas, Buscar, Exportar:** iguais aos do caderno QGIS, separados por fase. Pedidos da IA em `prompts-dio.js`.
- Dados: `localStorage` (`caderno-dio:v1`) e tabela `caderno_dio` no Supabase do Checklist (SQL em `supabase/caderno_dio.sql`). Arquivos no Storage `caderno`, em `<user_id>/dio-...`.

## Caderno QGIS AESP (`/qgis`)

Página estática única (`qgis.html`).

### Funções
- **Hoje:** aula atual ou próxima (horário de Fortaleza) com anotação rápida.
- **Cronograma:** 80 h/a do QTS (versão de 06/11/2026), presença, estrela e anotação por aula.
- **Disciplinas:** 9 disciplinas, instrutores, progresso, resumo e nome editável.
- **Materiais:** PDF, .txt/.md, fotos (até 8), link (site, PDF, Google Drive/Docs/Slides; YouTube só como link) ou texto colado. O texto do PDF é extraído no navegador (pdf.js 5.7.284 em `vendor/`). Arquivos vão para o Storage privado `caderno` (`<user_id>/...`).
- **Resumo e questões:** automático (`/api/ia`, API do Claude) quando a variável `ANTHROPIC_API_KEY` existe na Vercel; sempre há o modo **copiar pedido → colar no app do Claude → colar resposta**. Pedidos em `prompts.js`.
- **Estudar:** questões de múltipla escolha com gabarito comentado; guarda acertos/erros por disciplina; filtros "não respondidas" e "que errei".
- **Caderno / Tarefas / Buscar.**
- **Exportar:** caderno em Markdown, backup JSON e restauração.

### Onde ficam os dados
- Sempre há uma cópia no `localStorage` do navegador (chave `caderno-qgis-aesp:v1`), então o app funciona sem internet.
- Ao clicar em **Entrar** (mesmo e-mail e senha do portal ADMIN CBMCE), as notas sincronizam com a tabela `caderno_notas` do Supabase do Checklist. Cada usuário só vê as próprias linhas, e precisa ser admin (`is_admin()`). SQL em `supabase/caderno_notas.sql`.
- Apagar uma nota ou tarefa grava `apagado: true` (para o apagamento chegar aos outros aparelhos).
- Conflitos: vence a versão mais recente (`upd`).

## Funções de servidor (`api/`)
- `status.js`: diz se a geração automática está ligada.
- `ia.js`: gera resumo/questões (exige login admin). Com `curso: "dio"` usa os pedidos de `prompts-dio.js`; sem esse campo, os do QGIS. Variáveis: `ANTHROPIC_API_KEY` (obrigatória para o automático), `ANTHROPIC_MODEL` (opcional, padrão `claude-sonnet-5-5`).
- `link.js`: baixa o conteúdo de um link (exige login; bloqueia endereços internos; até 15 MB).

## Publicar na Vercel
1. New Project → importar este repositório.
2. Framework Preset: **Other**. Build e Output: deixar em branco.
3. Deploy.

## Rodar no computador
`npx serve .` (abrir os arquivos direto no navegador não funciona para o login e os caminhos `/qgis` e `/dio`).
