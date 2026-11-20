"use strict";
/* Caderno QGIS (AESP/CE): configuração do curso, lida pelo caderno.js.
   LV_PADRAO = o curso como veio do QTS. Se você mudou algo na aba Configurar, vale a sua versão (doc cfg-caderno, cópia em localStorage).
   A estrutura (DISC, AULAS…) é montada pelo curso-base.js, carregado logo depois. */
const LV_PADRAO = { v:1, tipo:"curso", nome:"Uso do QGIS como Estratégia de Segurança Pública", sub:"AESP/CE · Turma 01/2026 · Grupo 1 · 09 a 18/11",
  desc:"Curso da Academia Estadual de Segurança Pública do Ceará (AESP/CE) sobre QGIS e geoprocessamento aplicados à segurança pública; o aluno é bombeiro militar (CBMCE).",
  cor:"#0f6b5c", presenca:true, local:"AESP/CE, Fortaleza", abas:{},
  secoes:[
    {k:"cart", nome:"Ambientação e Introdução à Cartografia", curto:"Cartografia", ha:4, inst:["José Eudázio Honório Sampaio","Daniel de Souza Rocha"], cor:"#3b7dd8"},
    {k:"sig",  nome:"Fundamentos de Geoprocessamento e SIG", curto:"SIG", ha:4, inst:["José Eudázio Honório Sampaio","José Dyego de Souza Santos"], cor:"#8a5cd0"},
    {k:"gmaps",nome:"Google Maps e Google My Maps Aplicados à Segurança Pública", curto:"Google Maps", ha:8, inst:["José Dyego de Souza Santos"], cor:"#d0453b"},
    {k:"qgis", nome:"Introdução ao QGIS", curto:"QGIS", ha:12, inst:["Flávio do Nascimento Moreira Júnior","José Eudázio Honório Sampaio"], cor:"#2f9e44"},
    {k:"edic", nome:"Edição e Manipulação de Dados", curto:"Edição de dados", ha:8, inst:["José Eudázio Honório Sampaio"], cor:"#c9871a"},
    {k:"bases",nome:"Bases de Dados Geográficas", curto:"Bases de dados", ha:8, inst:["José Dyego de Souza Santos"], cor:"#1592a3"},
    {k:"anal", nome:"Análises Espaciais Aplicadas à Segurança", curto:"Análises espaciais", ha:16, inst:["José Eudázio Honório Sampaio"], cor:"#b8407a"},
    {k:"prod", nome:"Elaboração de Produtos Cartográficos", curto:"Produtos cartográficos", ha:8, inst:["Flávio do Nascimento Moreira Júnior","Daniel de Souza Rocha"], cor:"#6c7a1f"},
    {k:"proj", nome:"Projeto Prático: Diagnóstico Territorial", curto:"Projeto Prático", ha:12, inst:["José Eudázio Honório Sampaio","Daniel de Souza Rocha"], cor:"#d2622a"},
  ],
  dias:["2026-11-09","2026-11-10","2026-11-11","2026-11-12","2026-11-13","2026-11-16","2026-11-17","2026-11-18"],
  diasRepo:["2026-11-14","2026-11-15"],
  horarios:[{ini:"07:30",fim:"08:20"},{ini:"08:20",fim:"09:10"},{ini:"09:10",fim:"10:00"},{int:"Intervalo",ini:"10:00",fim:"10:20"},{ini:"10:20",fim:"11:10"},{ini:"11:10",fim:"12:00"},
    {int:"Almoço",ini:"12:00",fim:"13:00"},{ini:"13:00",fim:"13:50"},{ini:"13:50",fim:"14:40"},{int:"Intervalo",ini:"14:40",fim:"15:00"},{ini:"15:00",fim:"15:50"},{ini:"15:50",fim:"16:40"},{ini:"16:40",fim:"17:30"}] };
const LV_CFG_KEY = "caderno-qgis-aesp:cfg";
const LV = (()=>{ try{ const c=JSON.parse(localStorage.getItem(LV_CFG_KEY)||"null"); if(c&&!c.padrao&&!c.oculto&&Array.isArray(c.secoes)&&c.secoes.length) return {...c,tipo:"curso"}; }catch(e){} return LV_PADRAO; })();
const LV_TRILHA = false;
const LV_ABAS = [["hoje","Hoje"],["cronograma","Cronograma"],["disciplinas","Disciplinas"],["materiais","Materiais"],["projetos","Projetos"],["estudar","Estudar"],["caderno","Caderno"],["tarefas","Tarefas"],["busca","Buscar"],["formatacao","Formatação"],["backup","Exportar"]];
const LV_FIXAS = ["hoje"];
const lvAba = v => LV_FIXAS.includes(v) || !LV.abas || LV.abas[v] !== false;
const lvDesc = String(LV.desc||"").trim();
const CURSO={ id:"qgis", tabela:"caderno_notas", lsp:"caderno-qgis-aesp:", lsp2:"caderno-qgis:", convite:true, aulas:true, compartilharPratica:true,
  editado:LV!==LV_PADRAO, presenca:LV.presenca!==false, local:LV.local||"", views:[...LV_ABAS.filter(([v])=>lvAba(v)),["configurar","Configurar"]],
  app:"caderno-qgis-aesp", arq:"caderno-qgis", termo:"disciplina",
  tituloMD: LV===LV_PADRAO ? "Uso do QGIS como Estratégia de Segurança Pública\nAESP/CE · Turma 01/2026 · Grupo 1 · 09 a 18/11/2026" : LV.nome+(LV.sub?"\n"+LV.sub:""),
  praticaModelo:"Prática no QGIS",
  modeloProjeto:{ titulo:"Diagnóstico Territorial", prazo:"2026-11-18",
    objetivo:"Produzir um diagnóstico territorial da criminalidade numa área de estudo, usando o QGIS, para apoiar o planejamento operacional.",
  etapas:[["Definir a pergunta, a área de estudo e o recorte de tempo","proj"],["Escolher escala, projeção (SRC) e elementos do mapa","cart"],["Estruturar o SIG: vetor x raster, camadas e atributos","sig"],
      ["Levantar bases cartográficas (limites, bairros, setores censitários)","bases"],["Obter e organizar os dados de ocorrências","bases"],["Geocodificar e conferir pontos no Google Maps / My Maps","gmaps"],
      ["Montar o projeto no QGIS com as camadas de base","qgis"],["Tratar dados: tabela de atributos, junções, correções","edic"],["Análises espaciais: densidade (kernel), hotspots, buffers","anal"],
      ["Elaborar mapas temáticos e o layout de impressão","prod"],["Interpretar resultados e propor ações","proj"],["Preparar a apresentação final","proj"]]
  } };
// Textos e listas que variam por curso
const RAP_DOM=/cartogra|geod[eé]s|geogr[aá]f|mapa|georrefer|coordenad|proje[cç][aã]o|\bsig\b|geoprocess|sat[eé]lit|sensoriament|vetor|raster|camada|software|seguran[cç]a|crim|pol[ií]cia|estat[ií]stic|dados|topogra|gps|altitude|latitude|longitude/i;

const PJ_CAMPOS=[
  ["objetivo","Objetivo","O que o projeto quer responder ou entregar. Ex.: identificar as áreas com maior concentração de CVLI no bairro X em 2025."],
  ["problema","Problema e justificativa","Qual situação de segurança pública motiva o projeto e por que ela importa."],
  ["area","Área de estudo e recorte","Município, bairros ou AIS; período analisado; escala do mapa."],
  ["dados","Dados e fontes","Camadas e bases (IBGE, SSPDS, OpenStreetMap, ocorrências), formato e sistema de coordenadas (SRC)."],
  ["metodo","Metodologia e ferramentas","Passo a passo no QGIS: geocodificação, junções, kernel, buffers, consultas espaciais…"],
  ["produtos","Produtos e resultados esperados","Mapas, tabelas, relatório, apresentação."],
];


const PASSOS_QGIS=["Criar o projeto no QGIS e conferir o SRC","Carregar as camadas e conferir os atributos","Executar a ferramenta / análise","Conferir o resultado (simbologia, tabela, mapa)","Salvar o projeto e exportar o resultado"];
