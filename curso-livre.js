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
const lvSlug = s => String(s||"caderno").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40) || "caderno";
const lvDesc = String(LV.desc||"").trim();

const CURSO = {
  id:"livre", caderno:LV.id, tabela:"caderno_livre", lsp:"caderno-livre:"+LV.id+":", lsp2:"caderno-livre:"+LV.id+":",
  convite:false, compartilharPratica:false, aulas:!LV_TRILHA, presenca:!LV_TRILHA && LV.presenca!==false,
  app:"caderno-livre-"+LV.id, arq:"caderno-"+lvSlug(LV.nome), termo:LV_TRILHA?"fase":"disciplina",
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

// Seções (disciplinas ou fases)
const LV_CORES = ["#3b7dd8","#2f9e44","#c9871a","#8a5cd0","#d0453b","#1592a3","#b8407a","#6c7a1f","#d2622a","#5b3cc4"];
const DISC = (Array.isArray(LV.secoes)&&LV.secoes.length?LV.secoes:[{k:"s1",nome:LV_TRILHA?"Fase 1":"Disciplina 1",ha:4}]).map((x,i)=>({
  k:String(x.k||"s"+(i+1)), nome:String(x.nome||(LV_TRILHA?"Fase ":"Disciplina ")+(i+1)), ha:Math.max(0,Number(x.ha)||0),
  inst:(Array.isArray(x.inst)?x.inst:String(x.inst||"").split(",")).map(s=>String(s).trim()).filter(Boolean),
  cor:/^#[0-9a-f]{6}$/i.test(x.cor||"")?x.cor:LV_CORES[i%LV_CORES.length], pasta:x.pasta||lvSlug(x.nome) }));
const DK = Object.fromEntries(DISC.map(d=>[d.k,d]));
const CURTO = Object.fromEntries(DISC.map((d,i)=>[d.k,(LV.secoes&&LV.secoes[i]&&LV.secoes[i].curto)||d.nome]));
const WD = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
function addDias(data,n){ const d=new Date(data+"T12:00:00-03:00"); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); }
const LV_HOJE = (()=>{ const d=new Date(Date.now()-3*36e5); return d.toISOString().slice(0,10); })();

let SLOTS=[], DIAS_REPO=[], AULAS=[], ITENS=[], INICIO=LV.inicio||LV_HOJE, HORAS_SEMANA=Math.max(1,Number(LV.horasSemana)||7);
const PROMPTS_ESTUDO = {};
if(LV_TRILHA){
  // Itens na ordem de estudo; a semana prevista sai das horas acumuladas e das horas por semana
  let cum=0;
  ITENS = (LV.itens||[]).filter(x=>DK[x.k]).map((x,i)=>{ const h=Math.max(0,Number(x.h)||0), sem=Math.floor(cum/HORAS_SEMANA); cum+=h;
    return {id:String(x.id||"i"+(i+1)), k:x.k, n:i+1, nome:String(x.nome||"Item "+(i+1)), tipo:String(x.tipo||"Curso"), h, url:String(x.url||""), semana:sem+1, plano:addDias(INICIO,sem*7)}; });
  if(!ITENS.length) ITENS=[{id:"i1",k:DISC[0].k,n:1,nome:"Primeiro item (edite em Configurar)",tipo:"Curso",h:1,url:"",semana:1,plano:INICIO}];
  AULAS = ITENS.map(it=>{ const da=ITENS.filter(x=>x.k===it.k); return {id:it.id, data:it.plano, ini:"00:00", fim:"23:59", k:it.k, n:da.indexOf(it)+1, tot:da.length, nG:it.n, nome:it.nome}; });
} else {
  // Horários do dia (aulas e intervalos) e dias de aula; as aulas seguem a ordem das disciplinas e a carga de cada uma
  SLOTS = (Array.isArray(LV.horarios)&&LV.horarios.length?LV.horarios:[{ini:"08:00",fim:"08:50"}]).map(h=>h.int?{int:String(h.int),ini:h.ini||"",fim:h.fim||""}:[String(h.ini||"08:00"),String(h.fim||"08:50")]);
  const dias = [...new Set((LV.dias||[]).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)))].sort();
  const seq=[]; DISC.forEach(d=>{ for(let i=1;i<=d.ha;i++) seq.push([d.k,i,d.ha]); });
  let p=0;
  for(const dia of dias){ for(const s of SLOTS){ if(!Array.isArray(s)) continue; if(p>=seq.length) break; const [k,n,tot]=seq[p++];
    AULAS.push({id:dia.replace(/-/g,"")+"-"+s[0].replace(":",""), data:dia, ini:s[0], fim:s[1], k, n, tot}); } }
  if(!AULAS.length) AULAS=[{id:LV_HOJE.replace(/-/g,"")+"-0800", data:LV_HOJE, ini:"08:00", fim:"08:50", k:DISC[0].k, n:1, tot:1}];
  window.LV_SEM_HORARIO = Math.max(0, seq.length-p);
}
const AK = Object.fromEntries(AULAS.map(a=>[a.id,a]));
const IK = Object.fromEntries(ITENS.map(i=>[i.id,i]));
const HORAS_TOTAL = ITENS.reduce((s,i)=>s+i.h,0);
const ehProjeto = it => /^projeto/i.test(it.tipo||"");
const DIAS_AULA = [...new Set(AULAS.map(a=>a.data))];
const TODOS_DIAS = DIAS_AULA;

// Textos e listas que variam por curso
const RAP_DOM = new RegExp((LV.nome+" "+lvDesc+" "+DISC.map(d=>d.nome).join(" ")).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").split(/[^a-z0-9]+/).filter(w=>w.length>=5).slice(0,40).map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,"")).join("|")||"estudo","i");
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
