"use strict";
/* Estrutura do caderno a partir da configuração LV (QGIS, DIO e cadernos livres usam o mesmo cálculo).
   Antes deste arquivo, o curso-<id>.js define LV (configuração em vigor), LV_TRILHA e CURSO.
   - "curso": seções = disciplinas; aulas distribuídas nos dias e horários, na ordem das disciplinas e na carga de cada uma.
   - "trilha": seções = fases; itens na ordem de estudo; a semana prevista sai das horas acumuladas e das horas por semana. */
const LV_CORES = ["#3b7dd8","#2f9e44","#c9871a","#8a5cd0","#d0453b","#1592a3","#b8407a","#6c7a1f","#d2622a","#5b3cc4"];
const lvSlug = s => String(s||"caderno").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40) || "caderno";
const WD = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
function addDias(data,n){ const d=new Date(data+"T12:00:00-03:00"); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); }
const LV_HOJE = (()=>{ const d=new Date(Date.now()-3*36e5); return d.toISOString().slice(0,10); })();

const DISC = (Array.isArray(LV.secoes)&&LV.secoes.length?LV.secoes:[{k:"s1",nome:LV_TRILHA?"Fase 1":"Disciplina 1",ha:4}]).map((x,i)=>({
  k:String(x.k||"s"+(i+1)), nome:String(x.nome||(LV_TRILHA?"Fase ":"Disciplina ")+(i+1)), ha:Math.max(0,Number(x.ha)||0),
  inst:(Array.isArray(x.inst)?x.inst:String(x.inst||"").split(",")).map(s=>String(s).trim()).filter(Boolean),
  cor:/^#[0-9a-f]{6}$/i.test(x.cor||"")?x.cor:LV_CORES[i%LV_CORES.length], pasta:x.pasta||lvSlug(x.nome) }));
const DK = Object.fromEntries(DISC.map(d=>[d.k,d]));
const CURTO = Object.fromEntries(DISC.map((d,i)=>[d.k,(LV.secoes&&LV.secoes[i]&&String(LV.secoes[i].curto||"").trim())||d.nome]));

let SLOTS=[], DIAS_REPO=[], AULAS=[], ITENS=[], INICIO=LV.inicio||LV_HOJE, HORAS_SEMANA=Math.max(1,Number(LV.horasSemana)||7);
if(LV_TRILHA){
  let cum=0;
  ITENS = (LV.itens||[]).filter(x=>DK[x.k]).map((x,i)=>{ const h=Math.max(0,Number(x.h)||0), sem=Math.floor(cum/HORAS_SEMANA); cum+=h;
    return {id:String(x.id||"i"+(i+1)), k:x.k, n:i+1, nome:String(x.nome||"Item "+(i+1)), tipo:String(x.tipo||"Curso"), h, url:String(x.url||""), semana:sem+1, plano:addDias(INICIO,sem*7)}; });
  if(!ITENS.length) ITENS=[{id:"i1",k:DISC[0].k,n:1,nome:"Primeiro item (edite em Configurar)",tipo:"Curso",h:1,url:"",semana:1,plano:INICIO}];
  AULAS = ITENS.map(it=>{ const da=ITENS.filter(x=>x.k===it.k); return {id:it.id, data:it.plano, ini:"00:00", fim:"23:59", k:it.k, n:da.indexOf(it)+1, tot:da.length, nG:it.n, nome:it.nome}; });
} else {
  SLOTS = (Array.isArray(LV.horarios)&&LV.horarios.length?LV.horarios:[{ini:"08:00",fim:"08:50"}]).map(h=>h.int?{int:String(h.int),ini:h.ini||"",fim:h.fim||""}:[String(h.ini||"08:00"),String(h.fim||"08:50")]);
  const dias = [...new Set((LV.dias||[]).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)))].sort();
  DIAS_REPO = [...new Set((LV.diasRepo||[]).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&!dias.includes(d)))].sort();
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
const TODOS_DIAS = [...new Set([...DIAS_AULA,...DIAS_REPO])].sort();
// Etapas do modelo de projeto só com seções que ainda existem
if(CURSO.modeloProjeto&&Array.isArray(CURSO.modeloProjeto.etapas)) CURSO.modeloProjeto.etapas=CURSO.modeloProjeto.etapas.filter(e=>!e[1]||DK[e[1]]);
