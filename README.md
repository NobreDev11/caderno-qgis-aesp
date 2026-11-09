# Cadernos de Estudo

Cadernos pessoais de estudo num só site, sem build e sem variáveis de ambiente obrigatórias.

| Página | O que é |
|---|---|
| `/` (`index.html`) | Entrada: login (mesmo e-mail e senha do portal ADMIN CBMCE) e uma aba por curso. |
| `/qgis` (`qgis.html`) | Caderno do curso **Uso do QGIS como Estratégia de Segurança Pública** (AESP/CE, Turma 01/2026, Grupo 1, 09 a 18/11/2026). |
| `/dio` (`dio.html`) | Caderno da **trilha DIO: do zero aos agentes de IA para dados** (42 itens em 7 fases, 1 h por dia desde 09/11/2026). |

## Recursos comuns aos cadernos
- **Bloco flutuante de anotações:** fica por cima das telas, continua aberto ao trocar de aba; ⧉ solta numa janela por cima de outros apps (Chrome/Edge no computador).
- **Temporizador (`timer.js`):** Pomodoro (25/5, pausa longa de 15 a cada 4), 52/17, 50/10, 90/20, timer, cronômetro e personalizado. Som, notificação, início automático da próxima etapa. Registra o tempo de foco por dia em docs `tempo-AAAA-MM-DD` (sincronizam e entram no backup); no DIO, meta de 60 min/dia e tempo por item.
- **Fluxograma (`fluxo.js` + `vendor/mermaid.min.js`, Mermaid 11.12.0, MIT):** botão "Fluxograma" nas anotações dos itens/aulas e nas notas do caderno. Editor visual (etapas, decisões, comandos, ligações com rótulo, modelos prontos, direção) ou código Mermaid. Grava na própria anotação como bloco ```mermaid (com linha `%% fluxo` para reabrir no editor); o Visualizar desenha o diagrama com botão "Editar fluxograma".
- **Formatação rápida (`formato.js`):** barra em cima das caixas de anotação (painel, anotação rápida, fases/disciplinas, notas e bloco flutuante): negrito, itálico, marca-texto (`==x==`), título (T alterna #/##/###), lista, lista numerada, tarefa ☐/☑, citação, código, link, divisória e **Fluxograma** (abre o editor de fluxograma ligado àquela caixa; com o cursor dentro de um fluxograma, edita ele). Atalhos Ctrl+B, Ctrl+I, Ctrl+K, Ctrl+Shift+X; Enter continua a lista. Grava Markdown simples; o Visualizar desenha.
- **Fluxograma como desenho (09/11):** o fluxograma fica num doc próprio (`fx-<id>`: `{tipo:"fx", modelo, codigo}`) e a anotação guarda só a linha `![Fluxograma](fx:<id>)`; o desenho aparece **dentro do texto, no ponto onde foi inserido** (editor em blocos do `formato.js`: com fluxograma, a anotação vira trechos de texto editáveis com o desenho entre eles, botões Editar/Remover; a caixa original fica escondida e recebe o texto completo, então o salvamento não muda) e no Visualizar. Blocos ```mermaid antigos são convertidos ao abrir a anotação. No Markdown exportado a linha volta a ser o bloco ```mermaid. Docs `fx-` entram no backup e sincronizam (inclusive no link de convidado).
- **Editor visual estilo Word (`formato.js`, 09/11):** as anotações (anotação rápida, painel da aula/item, anotações da disciplina/fase, notas, bloco flutuante na página) mostram a formatação pronta: negrito, itálico, marca-texto, títulos, listas, tarefas com caixinha clicável, citação, código, links, imagens e fluxogramas no ponto onde foram inseridos. Por baixo continua Markdown: a caixa original fica escondida, recebe o texto convertido (`htmlParaMd`) e dispara `input`, então salvamento, sincronização, busca e exportação não mudaram. Atalhos ao digitar numa linha vazia: `- `, `1. `, `# `/`## `/`### `, `> `, `[] `; Ctrl+B/I/K, Ctrl+Shift+X, Tab/Shift+Tab em listas. Colar texto com Markdown (ex.: resposta do Claude) entra formatado. Mudanças externas no texto (fluxograma, sincronização) redesenham o editor (setter de `value` da caixa). A janela PiP continua com caixa de texto simples.
- **Sublistas e subnúmeros (`formato.js`, 09/11):** botões ⇥ (Sublista, Tab) e ⇤ (Voltar nível, Shift+Tab) na barra. A sublista fica dentro do item de cima (sem `execCommand indent`); listas numeradas mostram 1., 1.1., 1.1.1. (contadores CSS `sn`). Enter num item vazio de sublista volta um nível. Markdown: 2 espaços por nível, numeração reinicia em cada nível; o Visualizar (`md()` nos dois cadernos) usa `FORMATO.listaHtml` e mostra a mesma hierarquia. Na caixa simples (PiP), Tab/Shift+Tab e os botões recuam a linha da lista.
- **Tela cheia (`formato.js`):** botão "Tela cheia" no início da barra de formatação de todas as anotações: leva a barra e a caixa para uma tela só delas (no computador também ativa a tela cheia do navegador), com contador de palavras e Visualizar. Esc ou "Sair da tela cheia" devolve ao lugar.
- **Imagens nas anotações (`formato.js`):** botão Imagem na barra, Ctrl+V ou arrastar. A imagem é reduzida (até 1600 px, WebP/JPEG) e enviada para a pasta privada `caderno` do Supabase Storage (`<uid>/img-<curso>-<id>`); no texto fica `![nome](sb:caminho)` e o Visualizar mostra por link assinado. Precisa estar logado. As imagens não entram no backup .json nem funcionam no Markdown exportado. `![x](https://…)` com imagem pública também é aceito.

- **Uso offline (`sw.js`):** depois de abrir o site uma vez com internet, `/`, `/qgis` e `/dio` abrem sem conexão (service worker guarda páginas, scripts, pdf.js, mermaid, ícones e fontes; `/api` e Supabase nunca são guardados). Anotações ficam no `localStorage` e sobem sozinhas quando a internet volta (evento `online` + leitura inicial que se repete até dar certo, que envia tudo o que ficou mais novo no aparelho). Sessão vencida sem internet: continua como logado e reconecta ao voltar. Sem internet não funcionam: IA, importar link, guardar PDF/fotos na nuvem (o texto do PDF é salvo; fotos ficam no aparelho) e inserir imagens nas anotações. Ao mudar arquivos do app, aumentar `VERSAO` em `sw.js` só se precisar forçar limpeza do cache (páginas já vêm da rede primeiro).

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
- **Cronograma:** 80 h/a do QTS (versão de 06/11/2026), presença e estrela por aula.
- **Progresso pelo relógio (09/11):** barra "Curso" (lateral), "Linha do curso" (Hoje) e barra de cada disciplina são feitas de marcos: um risquinho por aula de 50 min, na cor da disciplina, com espaço maior entre dias; a aula em andamento enche aos poucos (atualiza a cada 30 s) e o texto mostra "Agora: …" ou a próxima aula (sem contagem regressiva). h/a com uma casa decimal.
- **Disciplinas (09/11):** Presença, Materiais e Pesquisa são seções recolhíveis (lembradas em `caderno-qgis:secoes`). **Pesquisa** = mininavegador: Google em modo que permite abrir dentro de página (`igu=1`) ou um link; Salvar link (vira material do tipo link da disciplina; o endereço de páginas abertas por clique dentro do quadro não pode ser lido, então o formulário deixa colar), Expandir (tela toda, Esc volta), Abrir no navegador, Sobrepor (janela Picture-in-Picture por cima das outras, Chrome/Edge). `/api/quadro` (dono ou convidado) avisa quando o site não permite ser aberto dentro de outra página; nesse caso o mininavegador mostra o **Modo leitura** (texto da página via `/api/link`, que agora também aceita convidado; PDF abre no visualizador). YouTube, Google Drive/Docs e buscas do Google são trocados pela versão que pode ser incorporada (`urlEmbutivel`). A tela de Disciplinas não é mais redesenhada a cada minuto (o elemento do mininavegador é guardado e recolocado).
- **Aviso ao fim da aula (09/11, `/qgis`):** a cada marco (fim de uma aula de hoje sem presença marcada) aparece uma janelinha no canto: Presente / Falta / Depois; na última aula da disciplina, oferece marcar a disciplina como concluída (`disc.concluida`). Cada aula é perguntada uma vez (`<LS>:marcos`).
- **Disciplinas recolhíveis (09/11):** seta em cada cartão, "Recolher todas"/"Expandir todas"; estado lembrado.
- **Salvar nota em Materiais (09/11, `/qgis`):** abaixo da nota principal (cartão da disciplina, painel da aula, Hoje) há "Salvar nota em Materiais" (pede confirmação): o texto da aba Anotações vira um material `origem:"nota"` (micro-nota) da disciplina — 1ª linha = título, resto = conteúdo — e a nota principal fica limpa (a seção de Perguntas permanece). O detalhe do material mostra a nota formatada. Depois de salva, dentro do material há **Anexos para estudo**: + Link (`m.links`), + PDF/arquivo (texto vai para o material; arquivo para a nuvem com login) e + Fotos (nuvem com login; sem login ficam no aparelho), cada um removível.
- **Lista de Materiais (09/11, `/qgis`):** materiais em ordem de criação, **mais antigos no topo** (também nas seções de Materiais das disciplinas). Filtros na aba Materiais: Buscar (título, resumo e texto), Disciplina, Tipo (nota salva, PDF/arquivo, link, fotos, texto), Situação (com/sem resumo, com questões, questões a fazer) e Ordem (antigos/recentes primeiro); "Limpar" volta ao padrão. Cada item mostra a data de criação.
- **Fluxograma no editor (09/11):** depois de inserir, o cursor vai para uma linha logo abaixo do desenho (linhas auxiliares `data-aux` antes/depois/entre fluxogramas, ignoradas ao salvar). Cada fluxograma tem cabeçalho com seta para recolher (fica só o tema), o **tema** (clique para renomear; padrão = primeiro passo que não é Início/Fim), Editar e Remover. `titulo` e `recolhido` ficam no doc `fx-<id>` (editar o desenho preserva os dois).
- **Termos pesquisáveis (09/11):** nas anotações, `<termo>` (ex.: `<buffer qgis>`) vira um atalho destacado (no editor visual, ao digitar o `>`; no Visualizar, botão). Clicar abre a pesquisa no mininavegador da disciplina daquela anotação (`/qgis`: no cartão se estiver na tela de Disciplinas; senão por cima da tela, Esc fecha). Sem mininavegador (ex.: `/dio`), abre o Google numa aba nova (evento `caderno:pesquisar`). O texto salvo continua `<termo>`.
- **Aba Perguntas (`formato.js`, 09/11):** em cima da barra de formatação de cada anotação há as abas Anotações | Perguntas. Perguntas guarda pares pergunta/resposta no fim da própria anotação, na seção `## Perguntas e respostas` (`**P:** …` / `**R:** …`), então sincroniza, exporta e aparece no Visualizar. A aba mostra quantas estão sem resposta.
- **Menu lateral recolhível (09/11):** botão ☰ no topo; recolhido mostra só os ícones (computador) ou esconde o menu (celular). Estado lembrado no aparelho (`caderno-qgis:menu`).
- **Uma anotação por tema (09/11):** a anotação é da disciplina (`disc-<k>.nota`), não de cada aula de 50 min: anotação rápida, painel da aula, bloco flutuante e "Anotações da disciplina" editam o mesmo texto. Notas antigas por aula são juntadas na anotação da disciplina (com o título "### Aula n/N · data hora") depois da 1ª leitura da nuvem (ou após 4 s sem conta) e apagadas da aula; não duplica se rodar de novo.
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

### Link pessoal de convidado (`/qgis?c=CODIGO`)
- Caderno QGIS separado para um colega, sem conta no Supabase do CBMCE. Sincroniza pelo código do link via funções `caderno_conv_info/ler/salvar` (SQL em `supabase/caderno_convites.sql`; tabelas sem acesso direto, só o hash sha256 do código fica no banco).
- O código fica guardado no aparelho do colega (`/` e `/qgis` abrem direto no caderno dele). Num aparelho com login do dono, o link guardado é ignorado se a URL não tiver `?c=`. `?c=0` esquece o link no aparelho.
- No convidado não há: IA automática (usa copiar pedido/colar resposta), importar link, imagens nas anotações, PDF guardado na nuvem (o texto é salvo). Fotos de material sincronizam dentro da nota.
- Novo convite: gerar código (20+ letras/números), inserir o sha256 em `caderno_convites`. Desativar: `ativo = false`.

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
