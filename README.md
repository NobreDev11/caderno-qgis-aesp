# Caderno QGIS AESP

Caderno pessoal para acompanhar o curso **Uso do QGIS como Estratégia de Segurança Pública** (AESP/CE, Turma 01/2026, Grupo 1, 09 a 18/11/2026).

Página estática única (`index.html`), sem build e sem variáveis de ambiente.

## Funções
- **Hoje:** aula atual ou próxima (horário de Fortaleza) com anotação rápida.
- **Cronograma:** 80 h/a do QTS (versão de 06/11/2026), presença, estrela e anotação por aula.
- **Disciplinas:** 9 disciplinas, instrutores, progresso, resumo e nome editável.
- **Caderno / Tarefas / Buscar.**
- **Exportar:** caderno em Markdown, backup JSON e restauração.

## Onde ficam os dados
- Sempre há uma cópia no `localStorage` do navegador (chave `caderno-qgis-aesp:v1`), então o app funciona sem internet.
- Ao clicar em **Entrar** (mesmo e-mail e senha do portal ADMIN CBMCE), as notas sincronizam com a tabela `caderno_notas` do Supabase do Checklist. Cada usuário só vê as próprias linhas, e precisa ser admin (`is_admin()`). SQL em `supabase/caderno_notas.sql`.
- Apagar uma nota ou tarefa grava `apagado: true` (para o apagamento chegar aos outros aparelhos).
- Conflitos: vence a versão mais recente (`upd`).

## Publicar na Vercel
1. New Project → importar este repositório.
2. Framework Preset: **Other**. Build e Output: deixar em branco.
3. Deploy.

## Rodar no computador
Abrir `index.html` no navegador, ou `npx serve .`.
