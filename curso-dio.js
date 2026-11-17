"use strict";
/* Caderno da Trilha DIO: configuração e dados do curso, lidos pelo caderno.js (o mesmo app do caderno QGIS).
   Cada "disciplina" do app é uma fase da trilha; cada "aula" é um item da trilha (doc item-<id>). As telas próprias da DIO ficam em dio.js. */
const CURSO={ id:"dio", tabela:"caderno_dio", lsp:"caderno-dio:", lsp2:"caderno-dio:", convite:false, aulas:false, presenca:false, compartilharPratica:false,
  app:"caderno-dio", arq:"caderno-dio", termo:"fase", aulaDoc:"item", rotAulas:"item(ns) anotado(s)", unidadeH:"h",
  views:[["hoje","Hoje"],["trilha","Trilha"],["disciplinas","Fases"],["portfolio","Portfólio"],["materiais","Materiais"],["projetos","Projetos"],["estudar","Estudar"],["caderno","Caderno"],["tarefas","Tarefas"],["busca","Buscar"],["formatacao","Formatação"],["backup","Exportar"]],
  alias:{fases:"disciplinas"},
  tituloMD:"Trilha DIO: agentes de IA e dados\nDo zero ao avançado · 1 h por dia · desde 09/11/2026",
  phDisc:"Conceitos-chave, comandos, trechos de código, links de repositório…",
  praticaModelo:"Prática de código",
  nomeCurso:'da trilha da DIO "Do zero aos agentes de IA para dados" (Python, SQL/NoSQL, LLMs, agentes, engenharia de dados e RAG)', curto:"DIO",
  subCaderno:"Notas livres: resumos, comandos, trechos de código, dúvidas para revisar.", exCaderno:"Crie a primeira: por exemplo, “Comandos do Git” ou “Dúvidas da semana”.", exTarefa:"Ex.: instalar Python 3.12 e o VS Code",
  rotAula:a=>"item "+a.nG+" · "+a.nome,
  modeloProjeto:{ titulo:"Agente de IA para dados (projeto final do portfólio)", prazo:"",
    objetivo:"Construir um agente de IA que responde perguntas sobre dados (SQL e documentos), explica as fontes e roda numa API, publicado no GitHub com README.",
    etapas:[["Definir o problema, o público e os dados do projeto","f0"],["Organizar o repositório (Git, README, estrutura de pastas)","f0"],
      ["Ler, limpar e explorar os dados com Python (pandas)","f1"],["Modelar o banco e escrever as consultas de negócio (SQL)","f2"],
      ["Guardar documentos e respostas no NoSQL (MongoDB)","f2"],["Escrever e testar os prompts do agente","f3"],
      ["Montar o agente (pergunta → SQL → resposta resumida)","f4"],["Automatizar fluxos com CrewAI ou n8n","f4"],
      ["Pipeline de ETL e API com FastAPI em Docker","f5"],["RAG com os documentos e GraphRAG com Neo4j","f6"],
      ["Avaliar respostas, citar fontes e registrar limitações","f6"],["Publicar: README, demonstração e post no LinkedIn","f6"]] } };
/* ============ TRILHA (guia "do zero aos agentes de IA para dados", versão de 04/11/2026) ============ */
// 7 fases e 42 itens, na ordem de estudo. h = horas informadas pela DIO (projetos próprios contam 0 h: são prática).
// O nome DISC vem do caderno QGIS: aqui cada "disciplina" é uma fase (materiais, notas, tarefas e questões usam a fase).
const INICIO = "2026-11-09", HORAS_SEMANA = 7;
const DISC = [
  {k:"f0", nome:"Fase 0 · Fundamentos", ha:45, inst:["Lógica de programação, Git e GitHub"], cor:"#3b7dd8", pasta:"fase-0-fundamentos"},
  {k:"f1", nome:"Fase 1 · Python", ha:34, inst:["Python do básico à análise de dados"], cor:"#2f9e44", pasta:"fase-1-python"},
  {k:"f2", nome:"Fase 2 · Dados: SQL e NoSQL", ha:80, inst:["Bancos relacionais, SQL, MongoDB e Python com bancos"], cor:"#c9871a", pasta:"fase-2-dados"},
  {k:"f3", nome:"Fase 3 · IA e LLMs", ha:47, inst:["Fundamentos de IA, LLMs e primeiro agente"], cor:"#8a5cd0", pasta:"fase-3-ia-llms"},
  {k:"f4", nome:"Fase 4 · Agentes", ha:75, inst:["Agentes de IA, CrewAI e n8n"], cor:"#d0453b", pasta:"fase-4-agentes"},
  {k:"f5", nome:"Fase 5 · Engenharia de dados", ha:72, inst:["ETL, APIs com FastAPI, Docker e Kafka"], cor:"#1592a3", pasta:"fase-5-engenharia-de-dados"},
  {k:"f6", nome:"Fase 6 · Avançado: RAG e grafos", ha:31, inst:["RAG, Neo4j e GraphRAG"], cor:"#b8407a", pasta:"fase-6-avancado"},
];
const DK = Object.fromEntries(DISC.map(d=>[d.k,d]));
const DC="https://www.dio.me/courses/", DT="https://web.dio.me/track/", DP="https://web.dio.me/play?section_type=lab_projects";
const ITENS_SRC = [
  ["f0","Git e GitHub: Primeiros Passos e Configuração do Ambiente","Curso",2,DC+"versionamento-de-codigo-com-git-e-github"],
  ["f0","Git e GitHub Focado em PullRequest","Curso",1,DC+"git-e-github-focado-em-pullrequest"],
  ["f0","Desafios de Projetos: Crie Um Portfólio Vencedor","Curso",1,DC+"desafios-de-projetos-crie-um-portfolio-vencedor"],
  ["f0","Formação Lógica de Programação","Formação",41,DT+"formacao-logica-de-programacao"],
  ["f0","Projeto da fase: desafios de lógica publicados no GitHub","Projeto",0,""],
  ["f1","Formação Python Fundamentals","Formação",26,DT+"formacao-python-fundamentals"],
  ["f1","Formação Python for Data Analytics","Formação",8,DT+"formacao-python-for-data-analytics"],
  ["f1","Projeto da fase: script que lê, limpa e resume um CSV","Projeto",0,""],
  ["f2","Formação SQL Database Specialist","Formação",72,DT+"formacao-sql-db-specialist"],
  ["f2","Integrando Python com Banco de Dados Relacionais Utilizando SQLAlchemy","Curso",3,DC+"integrando-python-com-banco-de-dados-relacionais-utilizando-sqlalchemy"],
  ["f2","Introdução a Banco de Dados NoSQL","Curso",3,DC+"introducao-a-banco-de-dados-nosql"],
  ["f2","Integrando Python com MongoDB Utilizando Pymongo","Curso",2,DC+"integrando-python-com-mongodb-utilizando-pymongo"],
  ["f2","Projeto da fase: banco de vendas com 10 consultas de negócio","Projeto",0,""],
  ["f3","Formação Fundamentos de Inteligência Artificial","Formação",10,DT+"formacao-fundamentos-de-inteligencia-artificial"],
  ["f3","Arquiteturas e Estruturas de LLMs","Curso",1,DC+"arquiteturas-e-estruturas-de-llms"],
  ["f3","Processos de Treinamento de LLMs","Curso",1,DC+"processos-de-treinamento-de-llms"],
  ["f3","Aplicações Práticas de LLMs","Curso",1,DC+"aplicacoes-praticas-de-llms"],
  ["f3","DXC – IA do Zero ao Primeiro Agente","Bootcamp",34,DT+"dxc-ia-do-zero-ao-primeiro-agente"],
  ["f3","Projeto da fase: biblioteca de prompts para tarefas de dados","Projeto",0,""],
  ["f4","Visão Geral do Ecossistema de Agentes","Curso",1,DC+"visao-geral-do-ecossistema-de-agentes"],
  ["f4","Fundamentos de Agentes Autônomos","Curso",1,DC+"fundamentos-de-agentes-autonomos"],
  ["f4","Instalação e Configuração do Ambiente de Agentes","Curso",1,DC+"instalacao-e-configuracao-do-ambiente-de-agentes"],
  ["f4","Primeiros Passos Para Criar Agentes","Curso",2,DC+"primeiros-passos-para-criar-agentes"],
  ["f4","Bradesco – Agentes de IA do Zero à Prática","Bootcamp",55,DT+"bradesco-agentes-de-ia-do-zero-a-pratica"],
  ["f4","CrewAI Fundamentals","Formação",5,DT+"crew-ai-fundalmentals"],
  ["f4","AI Automation com N8N","Formação",9,DT+"ai-automation-com-n8n"],
  ["f4","Agente de IA para Consultas SQL","Projeto DIO",1,"https://www.dio.me/projects/agente-de-ia-para-consultas-sql"],
  ["f4","Projeto da fase: agente que transforma pergunta em SQL e responde com resumo","Projeto",0,""],
  ["f5","Introdução a Engenharia de Dados","Curso",2,DC+"introducao-a-engenharia-de-dados"],
  ["f5","Fundamentos de ETL com Python","Curso",3,DC+"fundamentos-de-etl-extract-transform-load-com-python"],
  ["f5","Formação Python Backend Developer","Formação",35,DT+"formacao-python-backend-developer"],
  ["f5","Formação Docker Fundamentals","Formação",15,DT+"formacao-docker-fundamentals"],
  ["f5","IBM Confluent – Dados em tempo real para agentes de IA","Bootcamp",15,DT+"ibm-confluent-dados-em-tempo-real-para-agentes-de-ia"],
  ["f5","Explorando IA Generativa em um Pipeline de ETL com Python","Projeto DIO",2,DP],
  ["f5","Projeto da fase: agente atrás de uma API FastAPI, em Docker","Projeto",0,""],
  ["f6","Otimizar Através do Retrieval Augmented Generation (RAG)","Curso",1,DC+"otimizar-atraves-retrieval-augmented-generation-rag"],
  ["f6","Construindo Soluções com RAG e Azure OpenAI","Curso",1,DC+"implementar-a-geracao-aumentada-de-recuperacao-rag-com-o-servico-openai-do-azure"],
  ["f6","Criando um Chatbot Baseado em Conteúdo de PDFs","Projeto DIO",1,DP],
  ["f6","Neo4j – Certification","Bootcamp",26,DT+"neo4j-certification"],
  ["f6","GraphRAG com Python e a Biblioteca neo4j-graphrag","Curso",1,DT+"formacao-neo4j-analise-de-dado-com-grafos"],
  ["f6","Conectando Grafos de Conhecimento com IA Generativa","Curso",1,DT+"formacao-neo4j-analise-de-dado-com-grafos"],
  ["f6","Projeto final: agente com RAG e GraphRAG que explica suas fontes","Projeto",0,""],
];
const WD = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
function addDias(data,n){ const d=new Date(data+"T12:00:00-03:00"); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); }
// ITENS: {id, k (fase), n (posição 1..42), nome, tipo, h, url, semana, plano (data prevista de início)}
const ITENS = [];
(function(){ let cum=0; ITENS_SRC.forEach((x,i)=>{ const sem=Math.floor(cum/HORAS_SEMANA); ITENS.push({id:"i"+String(i+1).padStart(2,"0"), k:x[0], n:i+1, nome:x[1], tipo:x[2], h:x[3], url:x[4], semana:sem+1, plano:addDias(INICIO,sem*7)}); cum+=x[3]; }); })();
const IK = Object.fromEntries(ITENS.map(i=>[i.id,i]));
const HORAS_TOTAL = ITENS.reduce((s,i)=>s+i.h,0);
const ehProjeto = it => it.tipo.startsWith("Projeto");

/* ============ PROMPTS DE ESTUDO (completos, feitos a partir do conteúdo do curso) ============ */
// Os itens sem prompt aqui usam o prompt padrão (promptPadrao). Um prompt editado no app fica salvo no item.
const PROMPTS_ESTUDO = {
  i01: "Você é meu tutor e mentor de projetos. Vamos estudar juntos o primeiro item da minha trilha na DIO e transformar o que eu aprender em portfólio.\n\n## Quem sou e meu objetivo\n- Sou o Antonio. Objetivo: virar especialista em agentes de IA e dados, estudando 1h por dia na DIO, do zero ao avançado, sem pular etapas.\n- Uso Windows. Meus projetos ficam em C:\\Projetos\\DIO.\n- Tudo o que eu fizer deve virar algo publicado no meu GitHub.\n\n## O que estou estudando agora\n- Trilha: Fase 0 (Fundamentos), item 1 de 42.\n- Curso DIO: \"Git e GitHub: Primeiros Passos e Configuração do Ambiente\" (2h, básico).\n- Página: https://www.dio.me/courses/versionamento-de-codigo-com-git-e-github\n- Próximo item da trilha: \"Git e GitHub Focado em PullRequest\".\n\n## Conteúdo do curso (material oficial da instrutora Elidiana Andrade)\n1. Visão geral\n   - Versionamento de código: registrar alterações sem copiar arquivos, voltar atrás, saber quem mudou o quê e por quê.\n   - Sistemas de controle de versão: centralizado (CVCS: CVS, Subversion) x distribuído (DVCS: Git, Mercurial).\n   - Git: sistema de controle de versão distribuído. GitHub: plataforma de hospedagem de código com Git e colaboração.\n   - Versionamento semântico (SemVer): MAJOR.MINOR.PATCH (ex.: 2.1.3 → 2.2.0 com recurso novo compatível → 2.2.1 com correção).\n2. Instalação, configuração e autenticação\n   - Instalar o Git (Windows: git-scm.com, deixando marcados \"Git Bash Here\" e \"Git GUI Here\") e conferir com `git --version`.\n   - Níveis de configuração: `--local` (.git/config), `--global` (%USERPROFILE%\\.gitconfig), `--system`.\n   - `git config --list` e `git config --list --show-origin`\n   - `git config --global user.name \"Nome Sobrenome\"`\n   - `git config --global user.email seuemail@email.com`\n   - `git config --global init.defaultBranch main`\n   - Autenticação no GitHub: autenticação em dois fatores (2FA) e token de acesso pessoal no lugar de senha nas operações do Git.\n3. Primeiros passos com Git e GitHub\n   - Duas formas de ter um repositório: transformar uma pasta local com `git init` ou clonar um existente (`git clone`).\n   - Conectar ao remoto: `git remote add origin https://github.com/usuario/repositorio.git`\n   - Commit (um \"salvamento\" do projeto, com mensagem descritiva) e `git status` (o que mudou, o que está em staging).\n   - Corrigir o último commit: `git commit --amend` e `git commit --amend -m \"nova mensagem\"`.\n   - Desfazer commit: `git reset --soft`, `--mixed` e `--hard` (entender a diferença antes de usar o --hard).\n4. Dicas e materiais de apoio\n   - Aliases: `git config --global alias.st status` (e remover com `git config --global --unset alias.st`).\n   - Leituras: livro Pro Git (git-scm.com/book), gerador de .gitignore (toptal.com/developers/gitignore), Markdown no GitHub, GitHub Desktop e GitHub Pages.\n\n## Como conduzir a sessão\n1. Diagnóstico: me faça 3 perguntas rápidas para saber o que já sei (Git instalado? tenho conta no GitHub? já usei terminal?). Ajuste o ritmo pela resposta.\n2. Teoria curta: explique cada bloco acima em poucas linhas, com um exemplo do dia a dia. Não avance para o próximo bloco antes de eu confirmar que entendi.\n3. Prática guiada no Git Bash, um comando por vez: me diga o comando, o que ele faz, e espere eu colar a saída antes de seguir. Se der erro, me ajude a ler a mensagem.\n4. Checagem: ao fim de cada bloco, 2 perguntas rápidas para eu responder com minhas palavras.\n5. Mini-projeto de portfólio (abaixo).\n6. Fechamento: resumo do que aprendi, meus erros mais comuns e o que revisar.\n\n## Mini-projeto de portfólio: o repositório-mãe da minha trilha\nCrie comigo, passo a passo, usando só o que o curso ensina:\n1. Pasta C:\\Projetos\\DIO\\trilha-agentes-ia-dados com `git init` (branch main).\n2. README.md em Markdown com: meu objetivo, as 7 fases da trilha, e uma tabela \"Progresso\" com este item marcado como concluído e o link da página da DIO.\n3. Pastas `fase-0-fundamentos/` até `fase-6-avancado/`, cada uma com um README curto (o Git não versiona pasta vazia; explique isso).\n4. Um .gitignore gerado para Python e Windows.\n5. CHANGELOG.md usando SemVer: começar em v0.1.0 (\"estrutura inicial da trilha\").\n6. Um alias útil (ex.: `git st`) e um arquivo `fase-0-fundamentos/git-cola.md` com os comandos que aprendi, nas minhas palavras.\n7. Commits pequenos com mensagens claras, criar o repositório no GitHub, conectar com `git remote add origin` e enviar com `git push -u origin main`.\n8. Bônus: README de perfil do GitHub (repositório com o mesmo nome do meu usuário) apontando para o repositório da trilha.\n\n## Regras\n- Fale em português, simples e direto. Uma etapa por vez.\n- Nunca me peça senha, token ou código de 2FA no chat. Eu crio e uso o token direto no navegador e na janela de login do Git.\n- Respeite 1h por sessão. O curso tem 2h: divida em 2 sessões e, ao parar, me diga exatamente de onde continuar.\n- Use os comandos e nomes do curso. Se mostrar algo além do curso, avise que é extra.\n- No fim, me dê uma linha pronta para eu registrar o progresso: \"Item 1/42 concluído em AAAA-MM-DD — repositório: <link>\".",
};
// O app trata cada item como uma "aula" (mesmas telas de anotações, materiais e bloco por cima): AULAS/AK apontam para os itens.
const SLOTS=[], DIAS_REPO=[];
const AULAS = ITENS.map(it=>{ const da=ITENS.filter(x=>x.k===it.k); return {id:it.id, data:it.plano, ini:"00:00", fim:"23:59", k:it.k, n:da.indexOf(it)+1, tot:da.length, nG:it.n, nome:it.nome}; });
const AK = Object.fromEntries(AULAS.map(a=>[a.id,a]));
const DIAS_AULA = [...new Set(AULAS.map(a=>a.data))];
const TODOS_DIAS = DIAS_AULA;

// Textos e listas que variam por curso
const RAP_DOM=/python|\bsql\b|banco de dados|dados|program|algoritm|software|\bgit|intelig[eê]ncia artificial|aprendizado|modelo de linguagem|\bllm|\bapi\b|docker|kafka|grafo|neo4j|\betl\b|nosql|mongo|agente|prompt|vetor|embedding/i;
const PJ_CAMPOS=[
  ["objetivo","Objetivo","O que o projeto resolve ou entrega. Ex.: um agente que responde perguntas de vendas consultando o banco em SQL."],
  ["problema","Problema e motivação","Que dor ou pergunta de negócio motiva o projeto e por que ele vale para o portfólio."],
  ["area","Escopo e público","Quem usa, o que entra e o que fica de fora; tamanho mínimo que dá para entregar."],
  ["dados","Dados e fontes","Bases, APIs, CSVs, documentos; formato, volume e cuidados (dados pessoais, chaves, licenças)."],
  ["metodo","Stack e arquitetura","Linguagens, bibliotecas e serviços (Python, SQL, MongoDB, LLM, CrewAI/n8n, FastAPI, Docker, Neo4j…) e como se ligam."],
  ["produtos","Entregáveis","Repositório no GitHub, README, demonstração (vídeo/print), API, post no LinkedIn."],
];
const CURTO={f0:"Fundamentos",f1:"Python",f2:"Dados (SQL/NoSQL)",f3:"IA e LLMs",f4:"Agentes",f5:"Eng. de dados",f6:"RAG e grafos"};
const PASSOS_QGIS=["Preparar o ambiente (pasta, venv e dependências)","Escrever o código em partes pequenas","Rodar, testar e conferir a saída","Registrar no README e fazer commit e push"];
