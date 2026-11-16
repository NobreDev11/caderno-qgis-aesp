"use strict";
/* Caderno QGIS (AESP/CE): configuração do curso, lida pelo caderno.js. */
const CURSO={ id:"qgis", tabela:"caderno_notas", lsp:"caderno-qgis-aesp:", lsp2:"caderno-qgis:", convite:true, aulas:true, compartilharPratica:true,
  app:"caderno-qgis-aesp", arq:"caderno-qgis", termo:"disciplina",
  tituloMD:"Uso do QGIS como Estratégia de Segurança Pública\nAESP/CE · Turma 01/2026 · Grupo 1 · 09 a 18/11/2026",
  praticaModelo:"Prática no QGIS",
  modeloProjeto:{ titulo:"Diagnóstico Territorial", prazo:"2026-11-18",
    objetivo:"Produzir um diagnóstico territorial da criminalidade numa área de estudo, usando o QGIS, para apoiar o planejamento operacional.",
  etapas:[["Definir a pergunta, a área de estudo e o recorte de tempo","proj"],["Escolher escala, projeção (SRC) e elementos do mapa","cart"],["Estruturar o SIG: vetor x raster, camadas e atributos","sig"],
      ["Levantar bases cartográficas (limites, bairros, setores censitários)","bases"],["Obter e organizar os dados de ocorrências","bases"],["Geocodificar e conferir pontos no Google Maps / My Maps","gmaps"],
      ["Montar o projeto no QGIS com as camadas de base","qgis"],["Tratar dados: tabela de atributos, junções, correções","edic"],["Análises espaciais: densidade (kernel), hotspots, buffers","anal"],
      ["Elaborar mapas temáticos e o layout de impressão","prod"],["Interpretar resultados e propor ações","proj"],["Preparar a apresentação final","proj"]]
  } };
/* ============ DADOS DO QTS (AESP, versão de 06/11/2026) ============ */
const DISC = [
  {k:"cart", nome:"Ambientação e Introdução à Cartografia", ha:4,  inst:["José Eudázio Honório Sampaio","Daniel de Souza Rocha"], cor:"#3b7dd8"},
  {k:"sig",  nome:"Fundamentos de Geoprocessamento e SIG",  ha:4,  inst:["José Eudázio Honório Sampaio","José Dyego de Souza Santos"], cor:"#8a5cd0"},
  {k:"gmaps",nome:"Google Maps e Google My Maps Aplicados à Segurança Pública", ha:8, inst:["José Dyego de Souza Santos"], cor:"#d0453b"},
  {k:"qgis", nome:"Introdução ao QGIS", ha:12, inst:["Flávio do Nascimento Moreira Júnior","José Eudázio Honório Sampaio"], cor:"#2f9e44"},
  {k:"edic", nome:"Edição e Manipulação de Dados", ha:8, inst:["José Eudázio Honório Sampaio"], cor:"#c9871a"},
  {k:"bases",nome:"Bases de Dados Geográficas", ha:8, inst:["José Dyego de Souza Santos"], cor:"#1592a3"},
  {k:"anal", nome:"Análises Espaciais Aplicadas à Segurança", ha:16, inst:["José Eudázio Honório Sampaio"], cor:"#b8407a"},
  {k:"prod", nome:"Elaboração de Produtos Cartográficos", ha:8, inst:["Flávio do Nascimento Moreira Júnior","Daniel de Souza Rocha"], cor:"#6c7a1f"},
  {k:"proj", nome:"Projeto Prático: Diagnóstico Territorial", ha:12, inst:["José Eudázio Honório Sampaio","Daniel de Souza Rocha"], cor:"#d2622a"},
];
const DK = Object.fromEntries(DISC.map(d=>[d.k,d]));
const SLOTS = [["07:30","08:20"],["08:20","09:10"],["09:10","10:00"],"INT1",["10:20","11:10"],["11:10","12:00"],["13:00","13:50"],["13:50","14:40"],"INT2",["15:00","15:50"],["15:50","16:40"],["16:40","17:30"]];
const DIAS_AULA = ["2026-11-09","2026-11-10","2026-11-11","2026-11-12","2026-11-13","2026-11-16","2026-11-17","2026-11-18"];
const DIAS_REPO = ["2026-11-14","2026-11-15"];
const WD = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];

const AULAS = []; // {id, data, ini, fim, k, n, tot}
(function gerar(){
  const seq=[]; DISC.forEach(d=>{for(let i=1;i<=d.ha;i++)seq.push([d.k,i,d.ha])});
  let p=0;
  for(const dia of DIAS_AULA){
    for(const s of SLOTS){ if(typeof s==="string")continue;
      const [k,n,tot]=seq[p++];
      AULAS.push({id:dia.replace(/-/g,"")+"-"+s[0].replace(":",""), data:dia, ini:s[0], fim:s[1], k, n, tot});
    }
  }
})();
const AK = Object.fromEntries(AULAS.map(a=>[a.id,a]));
const TODOS_DIAS = [...DIAS_AULA.slice(0,5),...DIAS_REPO,...DIAS_AULA.slice(5)];

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

const CURTO={cart:"Cartografia",sig:"SIG",gmaps:"Google Maps",qgis:"QGIS",edic:"Edição de dados",bases:"Bases de dados",anal:"Análises espaciais",prod:"Produtos cartográficos",proj:"Projeto Prático"};

const PASSOS_QGIS=["Criar o projeto no QGIS e conferir o SRC","Carregar as camadas e conferir os atributos","Executar a ferramenta / análise","Conferir o resultado (simbologia, tabela, mapa)","Salvar o projeto e exportar o resultado"];
