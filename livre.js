"use strict";
/* Caderno livre: aba Configurar (tudo editável: nome, cor, abas, seções, itens ou dias e horários), textos genéricos
   e ajustes por cima do app comum (caderno.js) e, no formato trilha, do dio.js. */

const LV_LIVRE = CURSO.id==="livre";              // criado no app (tabela caderno_livre)
const LV_KEY = LV_LIVRE ? "caderno-livre:cfg:"+LV.id : CURSO.lsp+"cfg";   // cópia local da configuração
const LV_GEN = LV_LIVRE || !!CURSO.editado;         // textos genéricos (o QGIS/DIO original mantém os seus)
const lvId = p => p+Math.random().toString(36).slice(2,7)+Date.now().toString(36).slice(-3);
const lvClone = o => JSON.parse(JSON.stringify(o||{}));
const LV_TERMO = LV_TRILHA ? {um:"fase", uns:"fases", Um:"Fase", Uns:"Fases"} : {um:"disciplina", uns:"disciplinas", Um:"Disciplina", Uns:"Disciplinas"};

/* ============ textos genéricos (no lugar dos do QGIS/DIO) ============ */
if(LV_GEN) Object.assign(AJUDA,{
  hoje: LV_TRILHA
    ? {t:"Hoje",o:"O item em que você está (ou o próximo), seu progresso e as tarefas pendentes.",c:"Abra o item, copie o prompt de estudo se quiser estudar com o Claude e anote enquanto estuda. Marque “Estudando” e “Concluído” para acompanhar o ritmo."}
    : {t:"Hoje",o:"A aula em andamento (ou a próxima), o progresso do curso e as tarefas pendentes.",c:"Durante a aula, digite na “Anotação rápida”: salva sozinho. “Abrir aula” mostra presença, destaque e a anotação da disciplina."},
  cronograma:{t:"Cronograma",o:"As aulas do curso, dia a dia, nos horários definidos em Configurar.",c:"Escolha o dia nos botões ou “Todos”. Clique numa aula para anotar, marcar presença ou destaque. Dias, horários e disciplinas mudam em Configurar."},
  kpiha:{t:"Aulas cumpridas",o:"Aulas cujo horário já passou, do total do curso.",c:"Só acompanha o calendário; marcar presença é na própria aula."},
  kpidisc:{t:"Disciplinas concluídas",o:"Disciplinas cuja última aula já terminou."},
  disciplinas: LV_TRILHA
    ? {t:"Fases",o:"As fases do caderno com horas, itens, progresso, anotações e materiais.",c:"Os números são os itens da fase: clique para abrir. Fases e itens mudam em Configurar."}
    : {t:"Disciplinas",o:"As disciplinas do curso com instrutores, carga, dias e progresso.",c:"Os números são as aulas: clique para abrir. Disciplinas, cargas e cores mudam em Configurar."},
  kpiitens:{t:"Itens concluídos",o:"Quantos itens você marcou como concluídos."},
  kpihoras:{t:"Horas concluídas",o:"Soma das horas dos itens concluídos.",c:"Itens com 0 h (projetos próprios, por exemplo) não contam aqui."},
  kpiritmo:{t:"Ritmo do plano",o:"Compara o item em que você está com o que o plano (início e horas por semana, em Configurar) previa para hoje.",c:"“No ritmo” ou “Adiantado”: tudo certo. “Atrasado”: reveja o plano ou aumente o tempo de estudo."},
  trilha:{t:"Trilha",o:"Os itens na ordem de estudo, separados por fase, com a semana prevista no plano.",c:"Filtre pela fase nos botões. Clique num item para abrir: status, prompt de estudo, link e anotações."},
  prompt:{t:"Prompt de estudo",o:"Texto pronto para colar num chat novo do Claude: ele vira seu tutor daquele item.",c:"“Copiar prompt” e cole no Claude. Edite para ajustar ao seu jeito; “Restaurar” volta ao padrão."},
  portfolio:{t:"Portfólio",o:"Os links dos seus projetos e entregas.",c:"Cole o link de cada projeto (itens do tipo Projeto). Os outros itens com link aparecem embaixo."},
  materiais:{t:"Materiais",o:"Biblioteca do caderno: PDFs, slides, fotos, links e textos, separados por "+LV_TERMO.um+".",c:"“Adicionar material” → escolha o tipo → Salvar. Abra o material para gerar resumo, questões e flashcards."},
  busca:{t:"Buscar",o:"Procura em tudo o que você escreveu, nos materiais"+(LV_TRILHA?" e nos itens":"")+".",c:"Digite 2 letras ou mais. Clique no resultado para abrir."},
  sql:{t:"Configuração pendente",o:"A tabela dos cadernos criados no app ainda não existe no Supabase do Checklist.",c:"No Supabase do Checklist: SQL Editor → cole o conteúdo de supabase/caderno_livre.sql (do repositório caderno-qgis-aesp) → Run. Depois recarregue a página."},
});
Object.assign(AJUDA,{
  configurar:{t:"Configurar",o:"Tudo do caderno: nome, descrição, cor, abas, "+LV_TERMO.uns+(LV_TRILHA?", itens e plano de estudo.":", dias e horários das aulas."),c:"Mude o que quiser e clique em “Salvar alterações”. Suas anotações, materiais e tarefas ficam guardados: apagar uma "+LV_TERMO.um+" só a tira do caderno."},
  cfabas:{t:"Abas",o:"Quais abas aparecem no menu.",c:"Hoje e Configurar ficam sempre. Esconder uma aba não apaga nada do que está nela."},
  cfdesc:{t:"Descrição",o:"Sobre o que é o curso e o seu objetivo.",c:"A IA usa este texto para fazer resumos, questões, flashcards e explicações no contexto certo. Ex.: “Curso de Excel avançado para análise de dados de RH; objetivo: montar painéis”."},
});
if(LV_TRILHA) AJUDA.fases=AJUDA.disciplinas;
ICONES.configurar='<circle cx="10" cy="10" r="2.6"/><path d="M10 2.5v2.2M10 15.3v2.2M2.5 10h2.2M15.3 10h2.2M4.7 4.7l1.6 1.6M13.7 13.7l1.6 1.6M4.7 15.3l1.6-1.6M13.7 6.3l1.6-1.6"/>';

// Prompt de estudo padrão de um item (trilha), sem dados pessoais
if(LV_LIVRE&&LV_TRILHA) promptPadrao = function(it){
  const f=DK[it.k], i=ITENS.indexOf(it), ant=ITENS[i-1], prox=ITENS[i+1], sess=Math.max(1,Math.ceil(it.h||1));
  return [
    "Você é meu tutor. Vamos estudar juntos um item do meu caderno de estudos \""+(LV.nome||"Caderno")+"\".",
    lvDesc?"\n## Sobre o curso e meu objetivo\n"+lvDesc:"",
    "\n## O que estou estudando agora",
    "- "+f.nome+", item "+it.n+" de "+ITENS.length+": "+it.tipo+" \""+it.nome+"\""+(it.h?" ("+it.h+"h)":"")+".",
    it.url?"- Página: "+it.url:"", ant?"- Item anterior: \""+ant.nome+"\".":"", prox?"- Próximo item: \""+prox.nome+"\".":"",
    "\n## Como conduzir",
    "1. Pergunte o que eu já sei e, se precisar, peça que eu cole o sumário ou o material do item.",
    "2. Explique em blocos curtos, com exemplos, e só avance quando eu confirmar que entendi.",
    "3. Proponha prática guiada, um passo por vez, esperando a minha resposta.",
    "4. Ao fim de cada bloco, 2 perguntas para eu responder com minhas palavras.",
    "5. Feche com um resumo, meus erros mais comuns e o que revisar.",
    "\n## Regras",
    "- Fale em português, simples e direto. Uma etapa por vez.",
    "- Nunca me peça senhas, tokens ou chaves no chat.",
    "- Este item tem "+(it.h||1)+"h: divida em "+sess+" sessão(ões) e, ao parar, me diga de onde continuar.",
  ].filter(Boolean).join("\n");
};

/* ============ temporizador e fluxogramas (por formato; QGIS e DIO definem os seus no HTML) ============ */
if(!LV_LIVRE){}
else if(LV_TRILHA){
  window.TIMER_CFG={ls:CURSO.lsp+"timer", meta:null, alvo:()=>{ const a=atual(); return a?{id:a.id, nome:a.n+". "+a.nome, rot:"item "+a.n}:null; }};
  window.FLUXO_ALVO=()=>{
    if(!PANE) return null;
    if(PANE.tipo==="aula"){ const id=PANE.id; return {ta:()=>document.getElementById("inota"),
      get:()=>{ const ta=document.getElementById("inota"); return ta?ta.value:(itemD(id).nota||""); },
      set:v=>{ salvarDoc("item-"+id,{...itemD(id),tipo:"item",nota:v},50); renderPane(); sincronizarFlutuante(); }}; }
    return lvAlvoNota();
  };
} else {
  window.TIMER_CFG={ls:CURSO.lsp+"timer", meta:null, alvo:()=>{ const a=focoAula(); return a?{id:a.k, nome:nomeDisc(a.k), rot:"disciplina atual"}:null; }};
  window.FLUXO_ALVO=()=>{
    if(!PANE) return null;
    if(PANE.tipo==="aula"){ const id=PANE.id; return {ta:()=>document.getElementById("pnota"),
      get:()=>{ const ta=document.getElementById("pnota"); return ta?ta.value:notaDaAula(id); },
      set:v=>{ salvarNotaAula(id,v); renderPane(); sincronizarFlutuante(); }}; }
    return lvAlvoNota();
  };
}
function lvAlvoNota(){
  if(!PANE||PANE.tipo!=="nota") return null; const id=PANE.id;
  return {ta:()=>document.getElementById("ntxt"),
    get:()=>{ const ta=document.getElementById("ntxt"); return ta?ta.value:((S.docs[id]||{}).texto||""); },
    set:v=>{ const ta=document.getElementById("ntxt"); if(ta){ ta.value=v; salvarNotaDoForm(); } else salvarDoc(id,{...(S.docs[id]||{tipo:"nota",criado:Date.now()}),tipo:"nota",texto:v},50); renderPane(); }};
}

/* ============ ABA CONFIGURAR ============ */
let CF=null, CF_SUJO=false, CF_SALVANDO=false, CF_CONF={};
function cfIni(){ if(!CF){ CF=lvClone(LV); CF.secoes=(CF.secoes||[]).map(x=>({...x})); CF.itens=CF.itens||[]; CF.dias=CF.dias||[]; CF.horarios=CF.horarios||[]; CF.abas=CF.abas||{}; } }
function cfSujo(){ if(!CF_SUJO){ CF_SUJO=true; const b=document.getElementById("cf-barra"); if(b) b.classList.add("sujo"); } cfResumo(); }
// não redesenha a tela sozinho enquanto você configura
{ const _ed=editando; editando=function(){ return _ed() || VIEW==="configurar"; }; }
window.addEventListener("beforeunload",e=>{ if(CF_SUJO&&!CF_SALVANDO){ e.preventDefault(); e.returnValue=""; } });

const cfCampo=(id,rot,val,o={})=>`<div${o.cls?` class="${o.cls}"`:""}><label class="lb" for="${id}">${rot}${o.info?" "+info(o.info):""}</label>${o.area
  ? `<textarea id="${id}" data-cf="${o.k}" rows="${o.rows||3}" placeholder="${esc(o.ph||"")}" maxlength="${o.max||1200}">${esc(val||"")}</textarea>`
  : `<input type="${o.tipo||"text"}" id="${id}" data-cf="${o.k}" value="${esc(val??"")}" placeholder="${esc(o.ph||"")}"${o.max?` maxlength="${o.max}"`:""}${o.min!=null?` min="${o.min}"`:""}${o.step?` step="${o.step}"`:""}${o.req?" required":""}>`}${o.dica?`<div class="cf-dica">${o.dica}</div>`:""}</div>`;
const cfMover=(tipo,i,n)=>`<span class="cf-acoes"><button type="button" class="btn sm" data-cfm="${tipo}:${i}:-1" ${i===0?"disabled":""} aria-label="Subir" title="Subir">↑</button><button type="button" class="btn sm" data-cfm="${tipo}:${i}:1" ${i===n-1?"disabled":""} aria-label="Descer" title="Descer">↓</button><button type="button" class="btn sm cf-x${CF_CONF[tipo+":"+i]?" conf":""}" data-cfx="${tipo}:${i}" aria-label="Apagar" title="Apagar">${CF_CONF[tipo+":"+i]?"Apagar?":"✕"}</button></span>`;

function vConfigurar(){
  cfIni(); setTimeout(cfResumo,0);
  const c=CF, T=LV_TERMO, cores=LV_CORES.concat(["#0f6b5c","#475569"]);
  const secs=c.secoes.map((x,i)=>{ const nIt=LV_TRILHA?c.itens.filter(t=>t.k===x.k).length:0, hIt=LV_TRILHA?c.itens.filter(t=>t.k===x.k).reduce((s,t)=>s+(Number(t.h)||0),0):0;
    return `<div class="cf-sec" data-i="${i}">
      <input type="color" class="cf-cor" data-cfs="${i}:cor" value="${esc(x.cor||LV_CORES[i%LV_CORES.length])}" aria-label="Cor da ${T.um} ${i+1}" title="Cor">
      <input type="text" data-cfs="${i}:nome" value="${esc(x.nome||"")}" placeholder="Nome da ${T.um}" aria-label="Nome da ${T.um} ${i+1}" maxlength="120" class="cf-nm">
      <input type="text" data-cfs="${i}:curto" value="${esc(x.curto||"")}" placeholder="Nome curto" aria-label="Nome curto" maxlength="30" class="cf-curto">
      ${LV_TRILHA?`<span class="cf-meta mono" title="Itens e horas desta fase">${nIt} ${nIt===1?"item":"itens"} · ${hIt} h</span>`:`<label class="cf-ha"><input type="number" min="0" max="400" data-cfs="${i}:ha" value="${Number(x.ha)||0}" aria-label="Aulas da ${T.um} ${i+1}"><span>aulas</span></label>`}
      <input type="text" data-cfs="${i}:inst" value="${esc(Array.isArray(x.inst)?x.inst.join(", "):(x.inst||""))}" placeholder="${LV_TRILHA?"Descrição curta (opcional)":"Instrutor(es), separados por vírgula"}" aria-label="${LV_TRILHA?"Descrição":"Instrutores"}" maxlength="300" class="cf-inst">
      ${cfMover("sec",i,c.secoes.length)}</div>`; }).join("");
  const abas=LV_ABAS.map(([v,r])=>{ const fixa=LV_FIXAS.includes(v), on=fixa||c.abas[v]!==false; return `<label class="cf-aba${on?" on":""}"><input type="checkbox" data-cfaba="${v}" ${on?"checked":""} ${fixa?"disabled":""}> ${esc(r)}</label>`; }).join("");
  let blocoTipo="";
  if(LV_TRILHA){
    const opts=k=>c.secoes.map(x=>`<option value="${esc(x.k)}" ${x.k===k?"selected":""}>${esc(x.curto||x.nome)}</option>`).join("");
    const its=c.itens.map((t,i)=>`<div class="cf-it" data-i="${i}">
        <span class="mono cf-n">${String(i+1).padStart(2,"0")}</span>
        <select data-cfi="${i}:k" aria-label="Fase do item ${i+1}">${opts(t.k)}</select>
        <input type="text" data-cfi="${i}:nome" value="${esc(t.nome||"")}" placeholder="Nome do item (curso, livro, vídeo, projeto…)" aria-label="Nome do item ${i+1}" maxlength="200" class="cf-nm">
        <input type="text" data-cfi="${i}:tipo" value="${esc(t.tipo||"")}" list="cf-tipos" placeholder="Tipo" aria-label="Tipo" maxlength="30" class="cf-tipo">
        <label class="cf-ha"><input type="number" min="0" max="999" step="0.5" data-cfi="${i}:h" value="${Number(t.h)||0}" aria-label="Horas do item ${i+1}"><span>h</span></label>
        <input type="url" data-cfi="${i}:url" value="${esc(t.url||"")}" placeholder="Link (opcional)" aria-label="Link do item ${i+1}" maxlength="500" class="cf-url">
        ${cfMover("it",i,c.itens.length)}</div>`).join("");
    blocoTipo=`
    <section class="card cf-card"><h3>Plano de estudo</h3>
      <div class="grid2">${cfCampo("cf-ini","Início",c.inicio||LV_HOJE,{k:"inicio",tipo:"date"})}${cfCampo("cf-hs","Horas de estudo por semana",c.horasSemana||7,{k:"horasSemana",tipo:"number",min:1,step:0.5,dica:"Com as horas de cada item, define a semana prevista e o “ritmo” em Hoje."})}</div>
    </section>
    <section class="card cf-card"><div class="row" style="justify-content:space-between"><h3>Itens <span class="muted" style="font-weight:500;font-size:14px">(${c.itens.length}, na ordem de estudo)</span></h3>
        <span class="row" style="gap:6px"><button type="button" class="btn sm" data-cfadd="it">+ Item</button><button type="button" class="btn sm" data-cfcolar>Colar vários</button></span></div>
      <p class="muted cf-dica" style="margin:4px 0 10px">Tipos começando com “Projeto” aparecem no Portfólio. Mudar a ordem não perde as anotações do item.</p>
      <div class="cf-lista">${its||`<p class="empty">Nenhum item. Clique em “+ Item”.</p>`}</div>
      <div class="cf-colar" id="cf-colar" hidden>
        <label class="lb" for="cf-colar-tx">Um item por linha: <span class="mono">Nome ; horas ; link</span> (horas e link opcionais)</label>
        <textarea id="cf-colar-tx" rows="5" placeholder="Introdução ao Excel ; 3 ; https://…&#10;Fórmulas e funções ; 5&#10;Projeto: painel de RH"></textarea>
        <div class="row" style="gap:8px;margin-top:6px"><label class="lb" for="cf-colar-k" style="margin:0">Na fase</label><select id="cf-colar-k">${opts(c.secoes[c.secoes.length-1]&&c.secoes[c.secoes.length-1].k)}</select><button type="button" class="btn sm pri" data-cfcolarok>Adicionar itens</button></div>
      </div>
      <datalist id="cf-tipos"><option>Curso</option><option>Formação</option><option>Módulo</option><option>Vídeo</option><option>Livro</option><option>Leitura</option><option>Exercício</option><option>Projeto</option><option>Prova</option></datalist>
    </section>`;
  } else {
    const dias=[...c.dias].sort();
    const hs=c.horarios.map((h,i)=>`<div class="cf-h" data-i="${i}">
        <select data-cfh="${i}:tipo" aria-label="Tipo do horário ${i+1}"><option value="aula" ${h.int?"":"selected"}>Aula</option><option value="int" ${h.int?"selected":""}>Intervalo</option></select>
        <input type="time" data-cfh="${i}:ini" value="${esc(h.ini||"")}" aria-label="Início"><span class="muted">às</span><input type="time" data-cfh="${i}:fim" value="${esc(h.fim||"")}" aria-label="Fim">
        ${h.int?`<input type="text" data-cfh="${i}:int" value="${esc(h.int)}" placeholder="Intervalo, Almoço…" aria-label="Nome do intervalo" maxlength="30" class="cf-int">`:`<span class="cf-int muted">aula ${c.horarios.slice(0,i+1).filter(x=>!x.int).length}</span>`}
        ${cfMover("h",i,c.horarios.length)}</div>`).join("");
    blocoTipo=`
    <section class="card cf-card"><div class="row" style="justify-content:space-between"><h3>Dias de aula <span class="muted" style="font-weight:500;font-size:14px">(${dias.length})</span></h3></div>
      <div class="cf-dias">${dias.map(d=>`<span class="chip cf-dia">${esc(fmtData(d))} <span class="muted">${esc(WD[new Date(d+"T12:00:00").getDay()].slice(0,3))}</span><button type="button" data-cfdia="${d}" aria-label="Tirar ${esc(fmtData(d))}" title="Tirar">✕</button></span>`).join("")||`<p class="empty">Nenhum dia. Adicione abaixo.</p>`}</div>
      <div class="cf-linha"><input type="date" id="cf-dia-n" aria-label="Novo dia de aula"><button type="button" class="btn sm" data-cfdiaadd>Adicionar dia</button></div>
      <details class="cf-gerar"><summary>Gerar vários dias</summary>
        <div class="cf-linha"><label>A partir de <input type="date" id="cf-g-ini" value="${esc(dias[0]||LV_HOJE)}"></label><label><input type="number" id="cf-g-n" min="1" max="200" value="${Math.max(1,dias.length||5)}" style="width:72px"> dias de aula</label>
          <label><input type="checkbox" id="cf-g-sab"> incluir sábado</label><label><input type="checkbox" id="cf-g-sub" checked> substituir os atuais</label><button type="button" class="btn sm" data-cfgerar>Gerar</button></div>
      </details>
    </section>
    <section class="card cf-card"><div class="row" style="justify-content:space-between"><h3>Horários do dia</h3><span class="row" style="gap:6px"><button type="button" class="btn sm" data-cfadd="h">+ Aula</button><button type="button" class="btn sm" data-cfadd="hi">+ Intervalo</button></span></div>
      <div class="cf-lista">${hs||`<p class="empty">Nenhum horário.</p>`}</div>
      <details class="cf-gerar"><summary>Gerar horários</summary>
        <div class="cf-linha"><label>Começa <input type="time" id="cf-q-ini" value="${esc((c.horarios.find(x=>!x.int)||{}).ini||"08:00")}"></label><label><input type="number" id="cf-q-n" min="1" max="16" value="${c.horarios.filter(x=>!x.int).length||4}" style="width:64px"> aulas de</label><label><input type="number" id="cf-q-d" min="10" max="240" value="50" style="width:64px"> min</label>
          <label>intervalo de <input type="number" id="cf-q-id" min="0" max="120" value="20" style="width:64px"> min depois da <input type="number" id="cf-q-ia" min="0" max="16" value="2" style="width:56px">ª aula</label><button type="button" class="btn sm" data-cfgerarh>Gerar</button></div>
      </details>
      <div class="grid2" style="margin-top:10px">
        <label class="cf-chk"><input type="checkbox" data-cf="presenca" ${c.presenca!==false?"checked":""}> Controlar presença nas aulas (lembrete ao começar)</label>
        ${cfCampo("cf-local","Local (aparece antes do início)",c.local,{k:"local",ph:"Ex.: Sala 2, AESP · Fortaleza",max:120})}
      </div>
    </section>`;
  }
  return `<div class="row" style="justify-content:space-between;align-items:flex-start"><div><h2>Configurar ${info("configurar")}</h2><p class="sub">Tudo deste caderno é editável. Ao salvar, a página recarrega com as mudanças; suas anotações e materiais continuam.</p></div></div>
    <div id="cf-resumo" class="cf-resumo" role="status"></div>
    <section class="card cf-card"><h3>Identidade</h3>
      <div class="grid2">${cfCampo("cf-nome","Nome do caderno",c.nome,{k:"nome",max:80,req:true,ph:"Ex.: Excel avançado"})}${cfCampo("cf-sub","Subtítulo",c.sub,{k:"sub",max:120,ph:"Ex.: Turma 2026 · 40 h · noite"})}</div>
      ${cfCampo("cf-desc","Descrição e objetivo",c.desc,{k:"desc",area:true,rows:3,max:700,info:"cfdesc",ph:"Sobre o que é o curso e o que você quer alcançar. A IA usa isso para resumos, questões e explicações."})}
      ${LV_TRILHA?`<div class="grid2">${cfCampo("cf-plat","Onde fica o curso",c.plat,{k:"plat",max:40,ph:"Ex.: DIO, Alura, Udemy, YouTube",dica:"Usado no botão “Abrir em …” dos itens com link."})}<div></div></div>`:""}
      <div><span class="lb">Cor</span><div class="cf-cores">${cores.map(x=>`<button type="button" class="cf-sw${(c.cor||"").toLowerCase()===x?" on":""}" style="background:${x}" data-cfcor="${x}" aria-label="Cor ${x}" title="${x}"></button>`).join("")}<label class="cf-sw cf-sw-livre" title="Outra cor"><input type="color" data-cf="cor" value="${esc(c.cor||"#0f6b5c")}" aria-label="Outra cor"></label></div></div>
      <p class="muted cf-dica" style="margin:8px 0 0">Formato: <b>${LV_TRILHA?"Trilha de estudo (fases e itens)":"Curso com aulas e datas (disciplinas, dias e horários)"}</b>. Para o outro formato, crie um caderno novo na página inicial.</p>
      ${LV_LIVRE?"":`<div class="row" style="gap:8px;margin-top:8px"><button type="button" class="btn sm" data-cforig>Voltar à configuração original</button><span class="muted cf-dica" style="margin:0">Carrega no formulário ${CURSO.id==="qgis"?"o curso como veio do QTS":"a trilha original"}; nada muda até salvar.</span></div>`}
    </section>
    <section class="card cf-card"><h3>Abas ${info("cfabas")}</h3><div class="cf-abas">${abas}</div></section>
    <section class="card cf-card"><div class="row" style="justify-content:space-between"><h3>${T.Uns} <span class="muted" style="font-weight:500;font-size:14px">(${c.secoes.length})</span></h3><button type="button" class="btn sm" data-cfadd="sec">+ ${T.Um}</button></div>
      <p class="muted cf-dica" style="margin:4px 0 10px">${LV_TRILHA?"Cada fase agrupa itens e tem anotações, materiais e projeto próprios.":"A ordem das disciplinas e o número de aulas de cada uma definem o cronograma, nos dias e horários abaixo."}</p>
      <div class="cf-lista">${secs}</div></section>
    ${blocoTipo}
    ${typeof CONVITE!=="undefined"&&CONVITE?"":`<section class="card cf-card cf-perigo"><h3>Apagar caderno</h3><p class="muted" style="margin:0 0 8px">Apaga o caderno e tudo o que está nele (anotações, materiais, tarefas), em todos os aparelhos. Não dá para desfazer; baixe antes um backup em Exportar.</p>
      <div class="cf-linha"><input type="text" id="cf-apagar-nome" placeholder="Digite o nome do caderno para confirmar" aria-label="Nome do caderno para confirmar"><button type="button" class="btn sm cf-x" data-cfapagar>Apagar caderno</button></div>${LV_LIVRE?"":`<p class="muted cf-dica" style="margin:8px 0 0">Ele some da página inicial; dá para trazê-lo de volta, vazio, em “+ Novo caderno”.</p>`}</section>`}
    <div class="cf-barra${CF_SUJO?" sujo":""}" id="cf-barra"><span class="cf-st">${CF_SUJO?"Alterações não salvas":"Tudo salvo"}</span><span class="row" style="gap:8px"><button type="button" class="btn" data-cfdesfazer ${CF_SUJO?"":"disabled"}>Descartar</button><button type="button" class="btn pri" data-cfsalvar>Salvar alterações</button></span></div>`;
}
window.TELAS_EXTRA=Object.assign(window.TELAS_EXTRA||{}, {configurar:vConfigurar});

// Resumo e avisos (atualiza sem redesenhar)
function cfProblemas(c){
  const p=[], av=[];
  if(!String(c.nome||"").trim()) p.push("Dê um nome ao caderno.");
  if(!c.secoes.length) p.push("Crie pelo menos uma "+LV_TERMO.um+".");
  if(c.secoes.some(x=>!String(x.nome||"").trim())) p.push("Há "+LV_TERMO.um+" sem nome.");
  if(LV_TRILHA){
    if(!c.itens.length) p.push("Crie pelo menos um item.");
    if(c.itens.some(t=>!String(t.nome||"").trim())) p.push("Há item sem nome.");
    const vazias=c.secoes.filter(x=>!c.itens.some(t=>t.k===x.k)); if(vazias.length) av.push(vazias.length+" fase(s) sem itens.");
  } else {
    const aulasH=c.horarios.filter(h=>!h.int), vagas=aulasH.length*c.dias.length, pede=c.secoes.reduce((s,x)=>s+(Number(x.ha)||0),0);
    if(!c.dias.length) p.push("Adicione pelo menos um dia de aula.");
    if(!aulasH.length) p.push("Adicione pelo menos um horário de aula.");
    if(c.horarios.some(h=>!/^\d{2}:\d{2}$/.test(h.ini||"")||!/^\d{2}:\d{2}$/.test(h.fim||"")||h.ini>=h.fim)) p.push("Confira os horários: cada um precisa de início antes do fim.");
    if(!pede) p.push("Defina quantas aulas tem cada disciplina.");
    if(vagas&&pede&&pede>vagas) av.push("As disciplinas somam "+pede+" aulas, mas há só "+vagas+" horários ("+aulasH.length+" por dia × "+c.dias.length+" dias). "+(pede-vagas)+" aula(s) ficariam fora do cronograma.");
    if(vagas&&pede&&pede<vagas) av.push("Sobram "+(vagas-pede)+" horários vazios no fim do cronograma.");
  }
  return {p,av};
}
function cfResumo(){
  const el=document.getElementById("cf-resumo"); if(!el||!CF) return;
  const c=CF, {p,av}=cfProblemas(c);
  const info1 = LV_TRILHA
    ? `${c.secoes.length} fase(s) · ${c.itens.length} itens · ${c.itens.reduce((s,t)=>s+(Number(t.h)||0),0)} h · ${c.horasSemana||7} h/semana ≈ ${Math.max(1,Math.ceil(c.itens.reduce((s,t)=>s+(Number(t.h)||0),0)/(Number(c.horasSemana)||7)))} semana(s)`
    : `${c.secoes.length} disciplina(s) · ${c.secoes.reduce((s,x)=>s+(Number(x.ha)||0),0)} aulas · ${c.dias.length} dia(s) × ${c.horarios.filter(h=>!h.int).length} horário(s)`;
  el.innerHTML=`<span class="mono">${esc(info1)}</span>${p.map(x=>`<div class="cf-erro">⚠ ${esc(x)}</div>`).join("")}${av.map(x=>`<div class="cf-aviso">${esc(x)}</div>`).join("")}`;
  const b=document.getElementById("cf-barra"); if(b){ b.querySelector(".cf-st").textContent=CF_SUJO?"Alterações não salvas":"Tudo salvo"; const d=b.querySelector("[data-cfdesfazer]"); if(d) d.disabled=!CF_SUJO; }
}
const cfRedesenhar=()=>{ const m=document.querySelector("main"), y=m?m.scrollTop:0; render(); if(m) m.scrollTop=y; cfResumo(); };

document.addEventListener("input",e=>{
  if(VIEW!=="configurar"||!CF) return; const t=e.target, d=t.dataset; if(!d) return;
  if(d.cf||d.cfs||d.cfi||d.cfh||d.cfaba) delete CF._padrao;
  const num=v=>v===""?0:Number(v);
  if(d.cf){ const k=d.cf; CF[k]= t.type==="checkbox"?t.checked : t.type==="number"?num(t.value) : t.value; if(k==="cor") document.querySelectorAll(".cf-sw.on").forEach(x=>x.classList.remove("on")); cfSujo(); return; }
  if(d.cfs){ const [i,k]=d.cfs.split(":"), x=CF.secoes[+i]; if(!x) return; x[k]= k==="ha"?num(t.value) : k==="inst"?t.value.split(",").map(s=>s.trim()).filter(Boolean) : t.value; cfSujo(); return; }
  if(d.cfi){ const [i,k]=d.cfi.split(":"), x=CF.itens[+i]; if(!x) return; x[k]= k==="h"?num(t.value):t.value; cfSujo(); if(k==="k"||k==="h") cfRedesenhar(); return; }
  if(d.cfh){ const [i,k]=d.cfh.split(":"), x=CF.horarios[+i]; if(!x) return;
    if(k==="tipo"){ if(t.value==="int") x.int=x.int||"Intervalo"; else delete x.int; cfSujo(); cfRedesenhar(); return; }
    x[k]=t.value; cfSujo(); return; }
  if(d.cfaba){ CF.abas[d.cfaba]=t.checked; t.closest(".cf-aba").classList.toggle("on",t.checked); cfSujo(); return; }
});
document.addEventListener("change",e=>{ const t=e.target; if(VIEW!=="configurar"||!CF||!t.dataset) return; if(t.dataset.cfi&&/:k$/.test(t.dataset.cfi)){ CF.itens[+t.dataset.cfi.split(":")[0]].k=t.value; cfSujo(); cfRedesenhar(); } });

function cfGerarDias(ini,n,sab){ const out=[]; let d=ini, g=0; while(out.length<n&&g<1000){ const w=new Date(d+"T12:00:00").getDay(); if(w!==0&&(w!==6||sab)) out.push(d); d=addDias(d,1); g++; } return out; }
const hm=m=>String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0"), mh=s=>{ const [h,m]=String(s||"0:0").split(":").map(Number); return h*60+(m||0); };

document.addEventListener("click",async e=>{
  if(VIEW!=="configurar"||!CF) return;
  const b=e.target.closest("button,[data-cfcor]"); if(!b) return; const d=b.dataset;
  if(d.cfcor){ CF.cor=d.cfcor; document.querySelectorAll(".cf-sw.on").forEach(x=>x.classList.remove("on")); b.classList.add("on"); const ci=document.querySelector('[data-cf="cor"]'); if(ci) ci.value=d.cfcor; cfSujo(); return; }
  if(d.cfadd){
    if(d.cfadd==="sec"){ const i=CF.secoes.length; CF.secoes.push({k:lvId("s"),nome:LV_TERMO.Um+" "+(i+1),curto:"",ha:LV_TRILHA?0:4,inst:[],cor:LV_CORES[i%LV_CORES.length]}); }
    if(d.cfadd==="it"){ const k=(CF.itens.length?CF.itens[CF.itens.length-1].k:(CF.secoes[0]||{}).k); if(!k){ toast("Crie uma fase antes."); return; } CF.itens.push({id:lvId("i"),k,nome:"",tipo:"Curso",h:1,url:""}); }
    if(d.cfadd==="h"){ const ult=[...CF.horarios].reverse().find(()=>true), ini=ult?ult.fim:"08:00"; CF.horarios.push({ini, fim:hm(mh(ini)+50)}); }
    if(d.cfadd==="hi"){ const ult=CF.horarios[CF.horarios.length-1], ini=ult?ult.fim:"10:00"; CF.horarios.push({int:"Intervalo",ini,fim:hm(mh(ini)+20)}); }
    cfSujo(); cfRedesenhar();
    const sel=d.cfadd==="sec"?".cf-sec:last-child .cf-nm":d.cfadd==="it"?".cf-it:last-child .cf-nm":null; if(sel){ const el=document.querySelector(sel); if(el){ el.focus(); el.select&&el.select(); } }
    return; }
  if(d.cfm){ const [tp,i,dir]=d.cfm.split(":"), arr=tp==="sec"?CF.secoes:tp==="it"?CF.itens:CF.horarios, a=+i, z=a+(+dir); if(z<0||z>=arr.length) return; [arr[a],arr[z]]=[arr[z],arr[a]]; CF_CONF={}; cfSujo(); cfRedesenhar(); const nb=document.querySelector(`[data-cfm="${tp}:${z}:${dir}"]`)||document.querySelector(`[data-cfm="${tp}:${z}:${-dir}"]`); if(nb) nb.focus(); return; }
  if(d.cfx){ const [tp,i]=d.cfx.split(":"), a=+i;
    if(!CF_CONF[d.cfx]){ CF_CONF={[d.cfx]:1}; b.classList.add("conf"); b.textContent="Apagar?";
      if(tp==="sec"&&LV_TRILHA){ const n=CF.itens.filter(t=>t.k===CF.secoes[a].k).length; if(n) toast("Esta fase tem "+n+" item(ns): eles saem junto. Clique de novo para confirmar."); }
      setTimeout(()=>{ if(CF_CONF[d.cfx]){ delete CF_CONF[d.cfx]; if(b.isConnected){ b.classList.remove("conf"); b.textContent="✕"; } } },4000); return; }
    CF_CONF={};
    if(tp==="sec"){ const k=CF.secoes[a].k; CF.secoes.splice(a,1); CF.itens=CF.itens.filter(t=>t.k!==k); }
    else if(tp==="it") CF.itens.splice(a,1); else CF.horarios.splice(a,1);
    cfSujo(); cfRedesenhar(); return; }
  if(d.cfdia!==undefined){ CF.dias=CF.dias.filter(x=>x!==d.cfdia); cfSujo(); cfRedesenhar(); return; }
  if(d.cfdiaadd!==undefined){ const v=(document.getElementById("cf-dia-n")||{}).value; if(!v){ toast("Escolha a data."); return; } if(!CF.dias.includes(v)) CF.dias.push(v); CF.dias.sort(); cfSujo(); cfRedesenhar(); return; }
  if(d.cfgerar!==undefined){ const ini=document.getElementById("cf-g-ini").value, n=Math.min(200,Math.max(1,+document.getElementById("cf-g-n").value||1)); if(!ini){ toast("Escolha a data de início."); return; }
    const novos=cfGerarDias(ini,n,document.getElementById("cf-g-sab").checked); CF.dias=document.getElementById("cf-g-sub").checked?novos:[...new Set([...CF.dias,...novos])].sort(); cfSujo(); cfRedesenhar(); toast(novos.length+" dias de aula."); return; }
  if(d.cfgerarh!==undefined){ let t=mh(document.getElementById("cf-q-ini").value||"08:00"); const n=Math.min(16,Math.max(1,+document.getElementById("cf-q-n").value||1)), du=Math.max(10,+document.getElementById("cf-q-d").value||50), id=Math.max(0,+document.getElementById("cf-q-id").value||0), ia=+document.getElementById("cf-q-ia").value||0;
    const hs=[]; for(let i=1;i<=n;i++){ hs.push({ini:hm(t),fim:hm(t+du)}); t+=du; if(id&&i===ia&&i<n){ hs.push({int:"Intervalo",ini:hm(t),fim:hm(t+id)}); t+=id; } }
    if(t>=24*60){ toast("Os horários passam da meia-noite. Diminua as aulas ou a duração."); return; }
    CF.horarios=hs; cfSujo(); cfRedesenhar(); return; }
  if(d.cfcolar!==undefined){ const x=document.getElementById("cf-colar"); x.hidden=!x.hidden; if(!x.hidden) document.getElementById("cf-colar-tx").focus(); return; }
  if(d.cfcolarok!==undefined){ const k=document.getElementById("cf-colar-k").value, ls=document.getElementById("cf-colar-tx").value.split("\n").map(l=>l.trim()).filter(Boolean);
    if(!ls.length){ toast("Cole pelo menos uma linha."); return; }
    ls.forEach(l=>{ const p=l.split(/\s*[;|\t]\s*/), nome=p[0].replace(/^\d+[.)-]\s*/,""), h=parseFloat(String(p[1]||"").replace(",",".")), url=(p.find(x=>/^https?:\/\//i.test(x))||"");
      CF.itens.push({id:lvId("i"),k,nome:nome.slice(0,200),tipo:/^projeto/i.test(nome)?"Projeto":"Curso",h:isFinite(h)?h:1,url}); });
    cfSujo(); cfRedesenhar(); toast(ls.length+" item(ns) adicionado(s)."); return; }
  if(d.cforig!==undefined){ CF=lvClone(LV_PADRAO); CF.secoes=CF.secoes.map(x=>({...x})); CF.itens=CF.itens||[]; CF.dias=CF.dias||[]; CF.horarios=CF.horarios||[]; CF.abas=CF.abas||{}; CF_SUJO=false; cfSujo(); CF._padrao=true; cfRedesenhar(); toast("Configuração original carregada. Clique em “Salvar alterações” para aplicar."); return; }
  if(d.cfdesfazer!==undefined){ CF=null; CF_SUJO=false; CF_CONF={}; cfRedesenhar(); toast("Alterações descartadas."); return; }
  if(d.cfsalvar!==undefined){ await cfSalvar(b); return; }
  if(d.cfapagar!==undefined){ await cfApagar(b); return; }
});

async function cfSalvar(bt){
  const {p}=cfProblemas(CF); if(p.length){ toast(p[0]); cfResumo(); return; }
  const c=lvClone(CF);
  c.nome=c.nome.trim(); c.secoes=c.secoes.map(x=>({...x,nome:String(x.nome).trim(),curto:String(x.curto||"").trim(),inst:Array.isArray(x.inst)?x.inst:String(x.inst||"").split(",").map(s=>s.trim()).filter(Boolean)}));
  if(LV_TRILHA){ c.itens=c.itens.map(t=>({...t,nome:String(t.nome).trim(),url:String(t.url||"").trim()})); c.secoes.forEach(x=>{ x.ha=c.itens.filter(t=>t.k===x.k).reduce((s,t)=>s+(Number(t.h)||0),0); }); }
  else c.dias=[...new Set(c.dias)].sort();
  c.upd=Date.now();
  CF_SALVANDO=true; if(bt){ bt.disabled=true; bt.textContent="Salvando…"; }
  if(!LV_LIVRE){ // QGIS/DIO: a configuração é um doc do próprio caderno (sincroniza como as anotações)
    const body = CF._padrao ? {tipo:"cfg",padrao:true} : {...c,tipo:"cfg"}; delete body._padrao;
    salvarDoc("cfg-caderno",body,0); try{ localStorage.setItem(LV_KEY,JSON.stringify(S.docs["cfg-caderno"])); }catch(e){}
    const ok=await lvEsperarEnvio(); CF_SUJO=false;
    toast(ok?"Configuração salva. Recarregando…":"Salvo neste aparelho; vai para a nuvem quando a conexão voltar. Recarregando…"); setTimeout(()=>location.reload(),600); return;
  }
  try{ localStorage.setItem(LV_KEY,JSON.stringify(c)); }catch(e){}
  if(S.sb&&S.uid){
    try{ const {error}=await S.sb.from("caderno_livre").upsert({user_id:S.uid,caderno:"_",id:LV.id,body:c,upd:c.upd},{onConflict:"user_id,caderno,id"}); if(error) throw error; }
    catch(e){ CF_SALVANDO=false; if(bt){ bt.disabled=false; bt.textContent="Salvar alterações"; } toast("Salvo só neste aparelho: a nuvem não respondeu ("+(e.message||"erro")+"). Tente de novo."); return; }
  }
  CF_SUJO=false; toast("Configuração salva. Recarregando…"); setTimeout(()=>location.reload(),500);
}
// espera os envios pendentes (até 6 s)
async function lvEsperarEnvio(){ flushTudo(); for(let i=0;i<30;i++){ if(!Object.keys(pend).length&&!Object.values(writing).some(Boolean)) return !S.erro; await new Promise(r=>setTimeout(r,200)); } return false; }
async function cfApagar(bt){
  const v=(document.getElementById("cf-apagar-nome")||{}).value||"";
  if(v.trim().toLowerCase()!==String(LV.nome||"").trim().toLowerCase()){ toast("Digite o nome exato do caderno para confirmar."); return; }
  if(!bt.dataset.conf){ bt.dataset.conf="1"; bt.textContent="Confirmar: apagar tudo"; setTimeout(()=>{ if(bt.isConnected){ delete bt.dataset.conf; bt.textContent="Apagar caderno"; } },5000); return; }
  bt.disabled=true; bt.textContent="Apagando…";
  if(!LV_LIVRE){ // QGIS/DIO: apaga todos os dados do caderno e o esconde da página inicial
    Object.keys(pend).forEach(k=>{ clearTimeout(timers[k]); delete pend[k]; });
    const oculto={tipo:"cfg",oculto:true,upd:Date.now()};
    if(S.sb&&S.uid){
      try{
        const paths=Object.values(S.docs).flatMap(m=>(m&&m.tipo==="mat"&&Array.isArray(m.arquivos))?m.arquivos.map(a=>a.path).filter(Boolean):[]);
        if(paths.length) await S.sb.storage.from("caderno").remove(paths).catch(()=>{});
        let r=await S.sb.from(CURSO.tabela).delete().eq("user_id",S.uid); if(r.error) throw r.error;
        r=await S.sb.from(CURSO.tabela).upsert({user_id:S.uid,id:"cfg-caderno",body:oculto,upd:oculto.upd},{onConflict:"user_id,id"}); if(r.error) throw r.error;
      }catch(e){ bt.disabled=false; bt.textContent="Apagar caderno"; toast("Não consegui apagar na nuvem: "+(e.message||"erro")); return; }
    }
    S.push=null; S.pull=null; S.docs={};
    try{ Object.keys(localStorage).filter(k=>k.startsWith(CURSO.lsp)||k.startsWith(CURSO.lsp2)).forEach(k=>localStorage.removeItem(k)); localStorage.setItem(LV_KEY,JSON.stringify(oculto)); }catch(e){}
    CF_SALVANDO=true; location.href="/"; return;
  }
  if(S.sb&&S.uid){
    try{
      const paths=Object.values(S.docs).flatMap(m=>(m&&m.tipo==="mat"&&Array.isArray(m.arquivos))?m.arquivos.map(a=>a.path).filter(Boolean):[]);
      if(paths.length) await S.sb.storage.from("caderno").remove(paths).catch(()=>{});
      let r=await S.sb.from("caderno_livre").delete().eq("caderno",LV.id); if(r.error) throw r.error;
      r=await S.sb.from("caderno_livre").delete().eq("caderno","_").eq("id",LV.id); if(r.error) throw r.error;
    }catch(e){ bt.disabled=false; bt.textContent="Apagar caderno"; toast("Não consegui apagar na nuvem: "+(e.message||"erro")); return; }
  }
  try{ Object.keys(localStorage).filter(k=>k.startsWith(CURSO.lsp)||k===LV_KEY).forEach(k=>localStorage.removeItem(k)); }catch(e){}
  CF_SALVANDO=true; location.href="/";
}

/* ============ cor e título do caderno ============ */
(function(){
  if(!LV_LIVRE){ const h=document.querySelector(".brand h1"), p=document.querySelector(".brand h1+p"); if(h) h.textContent=LV.nome||h.textContent; if(p) p.textContent=LV.sub||""; if(LV===LV_PADRAO||(LV.cor||"").toLowerCase()===(LV_PADRAO.cor||"").toLowerCase()) return; }
  const cor=/^#[0-9a-f]{6}$/i.test(LV.cor||"")?LV.cor:"#0f6b5c", st=document.createElement("style");
  st.textContent=`:root{--accent:${cor};--accent-soft:color-mix(in srgb,${cor} 14%,#fff)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--accent:color-mix(in srgb,${cor} 62%,#fff);--accent-ink:#111;--accent-soft:color-mix(in srgb,${cor} 24%,#151a19)}}
:root[data-theme="dark"]{--accent:color-mix(in srgb,${cor} 62%,#fff);--accent-ink:#111;--accent-soft:color-mix(in srgb,${cor} 24%,#151a19)}`;
  document.head.appendChild(st);
  const m=document.querySelector('meta[name="theme-color"]'); if(m) m.content=cor;
})();

/* ============ QGIS/DIO: configuração vinda de outro aparelho ============ */
if(!LV_LIVRE){
  const _mesclar=mesclar;
  mesclar=function(r,i){ _mesclar(r,i); lvConferirCfg(); };
  function lvConferirCfg(){
    const d=S.docs["cfg-caderno"]; if(!d) return; let l=null; try{ l=JSON.parse(localStorage.getItem(LV_KEY)||"null"); }catch(e){}
    if(l&&(d.upd||0)<=(l.upd||0)) return;
    try{ localStorage.setItem(LV_KEY,JSON.stringify(d)); }catch(e){}
    const vale = c => c&&!c.padrao&&!c.oculto&&Array.isArray(c.secoes)&&c.secoes.length;
    if(!vale(d)&&LV===LV_PADRAO) return;           // nada muda na tela
    if(CF_SUJO){ toast("A configuração mudou em outro aparelho. Salve ou descarte para ver a nova."); return; }
    toast("A configuração do caderno mudou em outro aparelho. Recarregando…"); setTimeout(()=>location.reload(),1500);
  }
}
