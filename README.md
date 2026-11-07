# Caderno QGIS AESP

Caderno pessoal para acompanhar o curso **Uso do QGIS como Estratégia de Segurança Pública** (AESP/CE, Turma 01/2026, Grupo 1, 09 a 18/11/2026).

Página estática única (`index.html`), sem build e sem variáveis de ambiente.

## Funções
- **Hoje:** aula atual ou próxima (horário de Fortaleza) com anotação rápida.
- **Cronograma:** 80 h/a do QTS (versão de 06/11/2026), presença, estrela e anotação por aula.
- **Disciplinas:** 9 disciplinas, instrutores, progresso, resumo e nome editável.
- **Materiais:** PDF, .txt/.md, fotos (até 8), link (site, PDF, Google Drive/Docs/Slides; YouTube só como link) ou texto colado. O texto do PDF é extraído no navegador (pdf.js 5.7.284 em `vendor/`). Arquivos vão para o Storage privado `caderno` (`<user_id>/...`).
- **Resumo e questões:** automático (`/api/ia`, API do Claude) quando a variável `ANTHROPIC_API_KEY` existe na Vercel; sempre há o modo **copiar pedido → colar no app do Claude → colar resposta**. Pedidos em `prompts.js`.
- **Estudar:** questões de múltipla escolha com gabarito comentado; guarda acertos/erros por disciplina; filtros "não respondidas" e "que errei".
- **Caderno / Tarefas / Buscar.**
- **Exportar:** caderno em Markdown, backup JSON e restauração.

## Onde ficam os dados
- Sempre há uma cópia no `localStorage` do navegador (chave `caderno-qgis-aesp:v1`), então o app funciona sem internet.
- Ao clicar em **Entrar** (mesmo e-mail e senha do portal ADMIN CBMCE), as notas sincronizam com a tabela `caderno_notas` do Supabase do Checklist. Cada usuário só vê as próprias linhas, e precisa ser admin (`is_admin()`). SQL em `supabase/caderno_notas.sql`.
- Apagar uma nota ou tarefa grava `apagado: true` (para o apagamento chegar aos outros aparelhos).
- Conflitos: vence a versão mais recente (`upd`).

## Funções de servidor (`api/`)
- `status.js`: diz se a geração automática está ligada.
- `ia.js`: gera resumo/questões (exige login admin). Variáveis: `ANTHROPIC_API_KEY` (obrigatória para o automático), `ANTHROPIC_MODEL` (opcional, padrão `claude-sonnet-5-5`).
- `link.js`: baixa o conteúdo de um link (exige login; bloqueia endereços internos; até 15 MB).

## Publicar na Vercel
1. New Project → importar este repositório.
2. Framework Preset: **Other**. Build e Output: deixar em branco.
3. Deploy.

## Rodar no computador
Abrir `index.html` no navegador, ou `npx serve .`.
