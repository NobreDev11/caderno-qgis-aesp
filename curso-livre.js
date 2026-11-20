"use strict";
/* Caderno livre (criado no app): monta a configuração do curso a partir de window.LIVRE (lida pelo livre.html antes do caderno.js).
   Dois formatos:
   - "curso": seções = disciplinas, aulas com dias e horários (como o caderno QGIS), presença opcional.
   - "trilha": seções = fases, itens na ordem de estudo com horas e link (como o caderno DIO; usa o dio.js).
   Tudo isso é editado na aba Configurar (livre.js) e guardado na tabela caderno_livre (linha caderno='_', id=<código>). */
const LV = window.LIVRE || {};
const LV_TIPO = LV.tipo === "trilha" ? "trilha" : "curso";
const LV_TRILHA = LV_TIPO === "trilha";
// Abas que cada formato pode ter (Hoje e Configurar ficam sempre)
const LV_ABAS = LV_TRILHA
  ? [["hoje","Hoje"],["trilha","Trilha"],["disciplinas","Fases"],["portfolio","Portfólio"],["materiais","Materiais"],["projetos","Projetos"],["estudar","Estudar"],["caderno","Caderno"],["tarefas","Tarefas"],["busca","Buscar"],["formatacao","Formatação"],["backup","Exportar"]]
  : [["hoje","Hoje"],["cronograma","Cronograma"],["disciplinas","Disciplinas"],["materiais","Materiais"],["projetos","Projetos"],["estudar","Estudar"],["caderno","Caderno"],["tarefas","Tarefas"],["busca","Buscar"],["formatacao","Formatação"],["backup","Exportar"]];
const LV_FIXAS = ["hoje"];
const lvAba = v => LV_FIXAS.includes(v) || !LV.abas || LV.abas[v] !== false;
const lvDesc = String(LV.desc||"").trim();

const CURSO = {
  id:"livre", caderno:LV.id, tabela:"caderno_livre", lsp:"caderno-livre:"+LV.id+":", lsp2:"caderno-livre:"+LV.id+":",
  convite:false, compartilharPratica:false, aulas:!LV_TRILHA, presenca:!LV_TRILHA && LV.presenca!==false,
  app:"caderno-livre-"+LV.id, arq:"caderno-"+String(LV.nome||"caderno").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40), termo:LV_TRILHA?"fase":"disciplina",
  views:[...LV_ABAS.filter(([v])=>lvAba(v)), ["configurar","Configurar"]],
  tituloMD:(LV.nome||"Caderno")+(LV.sub?"\n"+LV.sub:""),
  phDisc:LV_TRILHA?"Conceitos-chave, comandos, trechos, links…":"Conceitos-chave, passo a passo, links de material…",
  praticaModelo:"Prática",
  nomeCurso:'do caderno "'+(LV.nome||"Caderno")+'"'+(lvDesc?" ("+lvDesc.slice(0,300)+")":""),
  ctxIA:'Caderno de estudo "'+(LV.nome||"Caderno")+'"'+(LV.sub?" ("+LV.sub+")":"")+"."+(lvDesc?" "+lvDesc:""),
  curto:(LV.nome||"Caderno").slice(0,24), local:LV.local||"",
  subCaderno:"Notas livres: resumos, passo a passo, dúvidas para revisar.",
  exCaderno:"Crie a primeira: por exemplo, “Resumo da semana” ou “Dúvidas”.",
  exTarefa:"Ex.: revisar a aula 3 e fazer os exercícios",
  modeloProjeto:{ titulo:"Projeto do curso", prazo:"", objetivo:"", etapas:[] },
};
if(LV_TRILHA) Object.assign(CURSO,{ aulaDoc:"item", rotAulas:"item(ns) anotado(s)", unidadeH:"h", alias:{fases:"disciplinas"},
  rotAula:a=>"item "+a.nG+" · "+a.nome, abrirRot:LV.plat?"Abrir em "+LV.plat:"Abrir o curso",
  ritmoTxt:(LV.horasSemana||7)+" h por semana", portSub:"Onde ficam os seus projetos e entregas. Cole o link de cada um.",
  phRepo:"https://github.com/usuario/repositorio", phPerfil:"https://github.com/usuario" });
else CURSO.subCrono = LV.subCrono || "";

const PROMPTS_ESTUDO = {};
// A estrutura (DISC, AULAS, ITENS…) é montada pelo curso-base.js, carregado logo depois.

// Textos e listas que variam por curso
const RAP_DOM = new RegExp((LV.nome+" "+lvDesc+" "+(LV.secoes||[]).map(d=>d.nome||"").join(" ")).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").split(/[^a-z0-9]+/).filter(w=>w.length>=5).slice(0,40).map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,"")).join("|")||"estudo","i");
const PJ_CAMPOS=[
  ["objetivo","Objetivo","O que o projeto quer responder ou entregar."],
  ["problema","Problema e justificativa","Que situação motiva o projeto e por que ela importa."],
  ["area","Escopo e recorte","O que entra e o que fica de fora; público, local, período."],
  ["dados","Dados, fontes e materiais","De onde vêm as informações e os materiais usados."],
  ["metodo","Método e ferramentas","Passo a passo e ferramentas que serão usadas."],
  ["produtos","Produtos e resultados esperados","O que será entregue: relatório, apresentação, código, mapa…"],
];
const PASSOS_QGIS=["Preparar o ambiente e os materiais","Fazer em partes pequenas","Conferir o resultado","Registrar o que foi feito e o que aprendi"];

// Pedidos para a IA no contexto deste caderno
window.PROMPTS = window.PROMPTS_LIVRE ? PROMPTS_LIVRE.criar({curso:CURSO.ctxIA}) : window.PROMPTS;
