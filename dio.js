"use strict";
/* Caderno da Trilha DIO: o que é só da DIO, por cima do app comum (caderno.js).
   - Telas próprias: Hoje (item atual, ritmo, prompt de estudo), Trilha e Portfólio.
   - Fases = tela Disciplinas do app (anotações com abas Perguntas/Prática/Projetos, materiais, pesquisa), com os itens no lugar da presença.
   - Cada item da trilha (doc item-<id>) tem status, prompt de estudo, link do repositório e anotações próprias. */

/* ============ ITENS DA TRILHA ============ */
// item-<id>: {st:""|"and"|"ok", ini, fim, nota, estrela, repo, prompt}. disc-<fase>: anotações da fase. port-geral: links do portfólio.
const itemD = id => S.docs["item-"+id] || {};
const feito = it => itemD(it.id).st==="ok";
function atual(){ return ITENS.find(i=>itemD(i.id).st==="and") || ITENS.find(i=>!feito(i)) || null; }
const horasFeitas = (k) => ITENS.filter(i=>(!k||i.k===k)&&feito(i)).reduce((s,i)=>s+i.h,0);
// Ritmo: compara o item atual com o que o plano (1 h/dia a partir de 09/11/2026) indica para hoje.
function ritmo(){
  const hoje=agoraFor().data, a=atual();
  if(!a) return {txt:"Trilha concluída", cls:"rt-ok"};
  if(hoje<INICIO) return {txt:"Começa em "+fmtData(INICIO), cls:"muted"};
  const devia=[...ITENS].reverse().find(i=>i.plano<=hoje) || ITENS[0];
  const d=devia.semana-a.semana;
  if(d<=0) return {txt: d<0?"Adiantado "+(-d)+" sem.":"No ritmo", cls:"rt-ok"};
  return {txt:"Atrasado "+d+" sem.", cls:"rt-mal"};
}
function promptPadrao(it){
  if(PROMPTS_ESTUDO[it.id]) return PROMPTS_ESTUDO[it.id];
  const f=DK[it.k], i=ITENS.indexOf(it), ant=ITENS[i-1], prox=ITENS[i+1];
  const doFase=ITENS.filter(x=>x.k===it.k&&!ehProjeto(x)).map(x=>"- "+x.nome+" ("+x.h+"h)").join("\n");
  const sessoes=Math.max(1,Math.ceil(it.h));
  const cab=[
    "Você é meu tutor e mentor de projetos. Vamos estudar juntos um item da minha trilha na DIO e transformar o que eu aprender em portfólio.",
    "","## Quem sou e meu objetivo",
    "- Sou o Antonio. Objetivo: virar especialista em agentes de IA e dados, estudando 1h por dia na DIO, do zero ao avançado, sem pular etapas.",
    "- Uso Windows. Meus projetos ficam em C:\\Projetos\\DIO e vão para o meu GitHub, no repositório da trilha (pasta "+f.pasta+").",
    "","## O que estou estudando agora",
    "- Trilha: "+f.nome+", item "+it.n+" de "+ITENS.length+".",
  ];
  if(ehProjeto(it) && it.tipo==="Projeto"){
    return cab.concat([
      "- Projeto da fase: \""+it.nome.replace(/^Projeto (da fase|final): /,"")+"\".",
      "- Itens que esta fase estudou:", doFase,
      "","## Como conduzir",
      "1. Me ajude a definir o escopo mínimo do projeto, usando só o que a fase ensinou.",
      "2. Monte um plano em passos de até 1h, com o que entregar em cada sessão.",
      "3. Me guie passo a passo, um comando ou trecho de código por vez, esperando eu colar a saída.",
      "4. Revise meu código como um colega mais experiente: o que melhorar e por quê.",
      "5. No fim: README do projeto (objetivo, como rodar, o que aprendi), commit e push no GitHub.",
      "","## Regras",
      "- Fale em português, simples e direto. Uma etapa por vez.",
      "- Nunca me peça senhas, tokens ou chaves no chat.",
      "- Respeite 1h por sessão e me diga exatamente de onde continuar.",
      "- No fim, me dê uma linha pronta: \"Item "+it.n+"/"+ITENS.length+" concluído em AAAA-MM-DD — repositório: <link>\".",
    ]).join("\n");
  }
  return cab.concat([
    "- "+it.tipo+" DIO: \""+it.nome+"\" ("+it.h+"h).",
    it.url? "- Página: "+it.url : "",
    ant? "- Item anterior: \""+ant.nome+"\"." : "", prox? "- Próximo item: \""+prox.nome+"\"." : "",
    "","## Conteúdo",
    "Ainda não tenho o resumo das aulas deste item aqui. Antes de começar, peça que eu cole o sumário das aulas da página da DIO (e os materiais, se houver) e monte o plano a partir dele. Use só o que o curso ensina; se mostrar algo além, avise que é extra.",
    "","## Como conduzir a sessão",
    "1. Diagnóstico: 3 perguntas rápidas para saber o que eu já sei. Ajuste o ritmo pela resposta.",
    "2. Teoria curta: explique cada bloco em poucas linhas, com um exemplo do dia a dia. Só avance quando eu confirmar que entendi.",
    "3. Prática guiada: um comando ou trecho de código por vez; espere eu colar a saída antes de seguir. Se der erro, me ajude a ler a mensagem.",
    "4. Checagem: ao fim de cada bloco, 2 perguntas para eu responder com minhas palavras.",
    "5. Mini-projeto de portfólio (abaixo).",
    "6. Fechamento: resumo do que aprendi, meus erros mais comuns e o que revisar.",
    "","## Mini-projeto de portfólio",
    "Proponha um mini-projeto pequeno que use o que este item ensina, salvo na pasta "+f.pasta+" do repositório da trilha, com README explicando o que fiz. Sempre que fizer sentido, ligue o exemplo ao meu objetivo final: agentes de IA que trabalham com dados.",
    "","## Regras",
    "- Fale em português, simples e direto. Uma etapa por vez.",
    "- Nunca me peça senhas, tokens ou chaves no chat.",
    "- Respeite 1h por sessão. Este item tem "+it.h+"h: divida em "+sessoes+" sessão(ões) e, ao parar, me diga exatamente de onde continuar.",
    "- No fim, me dê uma linha pronta: \"Item "+it.n+"/"+ITENS.length+" concluído em AAAA-MM-DD — repositório: <link>\".",
  ]).filter((l,i,a)=>!(l===""&&a[i-1]==="")).join("\n");
}
const promptDe = it => (itemD(it.id).prompt||"").trim() || promptPadrao(it);

function marcarItem(id, st){
  const d=itemD(id), hoje=agoraFor().data, n={...d,tipo:"item",st};
  if(st==="and"&&!n.ini) n.ini=hoje;
  if(st==="ok"){ n.ini=n.ini||hoje; n.fim=hoje; }
  if(st!=="ok") delete n.fim;
  salvarDoc("item-"+id,n,50);
}

/* ============ O APP COMUM ADAPTADO À TRILHA ============ */
// "aula" do app = item da trilha: o estado vem do status do item, não do relógio.
function statusAula(a){ const s=itemD(a.id).st||""; return s==="ok"?"past":s==="and"?"cur":"fut"; }
function focoAula(){ const it=atual()||ITENS[ITENS.length-1]; return AK[it.id]; }
function discPadrao(){ const it=atual(); return it?it.k:""; }
function aulaAtualDe(k){ const its=ITENS.filter(i=>i.k===k); const it=its.find(i=>itemD(i.id).st==="and")||its.find(i=>!feito(i))||its[its.length-1]; return it?it.id:""; }
// Cartão da fase (tela Fases)
function discIntro(){ return `<h2>Fases ${info("disciplinas")}</h2><p class="sub">${DISC.length} fases, ${HORAS_TOTAL} horas de conteúdo. Cada fase tem anotações (com perguntas, prática e projeto), materiais, pesquisa e os itens da trilha.</p>`; }
function discLinhas(x){ const its=ITENS.filter(i=>i.k===x.k); return `<div class="muted" style="font-size:13.5px">${x.inst.map(esc).join(" · ")}</div>
        <div class="mono muted" style="font-size:12.5px">${x.ha} h · ${its.length} itens · pasta ${esc(x.pasta||"")}</div>`; }
function discPres(x){ const its=ITENS.filter(i=>i.k===x.k), ok=its.filter(feito).length;
  return `<details class="pres-pop" data-prespop="${x.k}" ${PRES_POP===x.k?"open":""}><summary class="btn sm" title="Itens da trilha nesta fase">Itens ${ok}/${its.length} <span aria-hidden="true">▾</span></summary>
    <div class="pres-cx"><div class="row" style="justify-content:space-between;gap:6px;margin-bottom:6px"><span class="lb" style="margin:0">Itens da fase (${ok} de ${its.length} concluídos)</span>${info("discaulas")}</div>
    <div class="pres-lista">${its.map(it=>{ const d=itemD(it.id); return `<button type="button" class="pres-l it-l" data-item="${it.id}" title="Abrir o item"><span class="mono">${String(it.n).padStart(2,"0")}</span><span class="it-n">${esc(it.nome)}</span><span class="mono muted">${d.st==="ok"?"✓":d.st==="and"?"…":""}${d.estrela?" ★":""}</span></button>`; }).join("")}</div>
    </div></details>`; }
function discBarra(x){ const hf=horasFeitas(x.k); return `<div class="row" style="gap:8px"><div class="bar" style="flex:1"><i style="width:${x.ha?hf/x.ha*100:0}%;background:${x.cor}"></i></div><span class="mono" style="font-size:12.5px">${hf}/${x.ha}h</span></div>`; }
// Barra lateral
function renderProg(){
  const el=document.getElementById("prog"); if(!el) return;
  const ok=ITENS.filter(feito).length, hf=horasFeitas(), r=ritmo(), a=atual();
  el.innerHTML=`
    <div class="row" style="justify-content:space-between"><span>Trilha</span><span class="mono">${ok}/${ITENS.length} itens</span></div>
    <div class="bar"><i style="width:${hf/HORAS_TOTAL*100}%"></i></div>
    <div class="row" style="justify-content:space-between"><span>Horas concluídas</span><span class="mono">${hf}/${HORAS_TOTAL}</span></div>
    <div class="row" style="justify-content:space-between"><span>Ritmo</span><span class="${r.cls}">${esc(r.txt)}</span></div>
    ${a?`<div class="muted" style="font-size:12px;line-height:1.35">Agora: item ${a.n} · ${esc(a.nome)}</div>`:""}`;
}
// Bloco por cima: escolhe o item (agrupado por fase); a anotação é a da fase
function flOpcoes(a){ return DISC.map(d=>`<optgroup label="${esc(nomeDisc(d.k))}">${AULAS.filter(x=>x.k===d.k).map(x=>`<option value="${x.id}" ${x.id===a.id?"selected":""}>${x.nG} · ${esc(x.nome.length>60?x.nome.slice(0,58)+"…":x.nome)}</option>`).join("")}</optgroup>`).join(""); }
function flRodape(a){ return `Item ${a.nG}/${ITENS.length} · anotações da fase`; }

// Painel do item (no lugar do painel da aula)
const ROT_ST2={"":"A fazer", and:"Estudando", ok:"Concluído"};
function renderPaneAula(host){
  const a=IK[PANE.id]; if(!a){ PANE=null; host.innerHTML=""; return; }
  const d=itemD(a.id), x=DK[a.k], i=ITENS.indexOf(a), pr=(d.prompt||"").trim();
  host.innerHTML=`<div class="shade" data-fechar></div><section class="pane" role="dialog" aria-label="Item da trilha">
    <header style="border-top:5px solid ${x.cor}"><div style="min-width:0"><div class="mono muted" style="font-size:12.5px">Item ${a.n} de ${ITENS.length} · ${esc(a.tipo)}${a.h?" · "+a.h+" h":""} · plano: semana ${a.semana} (${fmtData(a.plano)})</div>
      <h3 style="margin-top:4px">${esc(a.nome)} ${info("item")}</h3><div class="muted" style="font-size:13px">${esc(nomeDisc(a.k))}</div>
      ${a.url?`<div class="row" style="margin-top:8px"><a class="btn sm pri" href="${esc(a.url)}" target="_blank" rel="noopener">Abrir na DIO</a></div>`:""}</div>
      <button class="btn sm" data-fechar aria-label="Fechar">✕</button></header>
    <div class="body">
      <div class="row">
        ${["","and","ok"].map(s=>`<button class="btn sm ${(d.st||"")===s?"on":""}" data-ist="${s}">${ROT_ST2[s]}</button>`).join("")}
        <button class="btn sm ${d.estrela?"on":""}" data-iestrela>★ Importante</button>
      </div>
      ${d.ini||d.fim?`<p class="mono muted" style="margin:0;font-size:12.5px">${d.ini?"Começou em "+fmtData(d.ini):""}${d.ini&&d.fim?" · ":""}${d.fim?"Concluiu em "+fmtData(d.fim):""}</p>`:""}
      <div class="card" style="padding:12px">
        <div class="row" style="justify-content:space-between"><h3 style="font-size:15px">Prompt de estudo ${info("prompt")}</h3>
          <div class="row"><button class="btn sm pri" data-pcopiar="${a.id}">Copiar prompt</button><button class="btn sm" data-peditar>${PANE.editP?"Fechar edição":"Ver / editar"}</button></div></div>
        <p class="muted" style="margin:6px 0 0;font-size:13px">${pr?"Prompt personalizado salvo para este item.":(PROMPTS_ESTUDO[a.id]?"Prompt completo, feito a partir do conteúdo do curso.":"Prompt padrão: pede que você cole o sumário das aulas antes de começar.")} Cole num chat novo do Claude para estudar com tutor.</p>
        ${PANE.editP?`<textarea id="pprompt" style="min-height:260px;margin-top:8px;font:13px/1.5 var(--mono)">${esc(promptDe(a))}</textarea><div class="row" style="margin-top:6px"><button class="btn sm" data-preset>Voltar ao prompt padrão</button></div>`:""}
      </div>
      <div><label class="lb" for="prepo">Link do repositório ou da entrega (opcional) ${info("portfolio")}</label><input type="text" id="prepo" inputmode="url" placeholder="https://github.com/…" value="${esc(d.repo||"")}"></div>
      <div class="row" style="justify-content:space-between"><div class="row" style="gap:6px"><span class="lb" style="margin:0">Anotações do item</span>${info("markdown")}</div>
        <div class="row"><button class="btn sm" data-flabrir="${a.id}" title="Abre as anotações da fase num bloco que fica por cima das outras telas">Destacar</button><button class="btn sm" data-go="disciplinas" data-disc="${a.k}" title="Anotações, perguntas, prática e projeto da fase">Fase</button><button class="btn sm" data-prev>${PANE.prev?"Editar":"Visualizar"}</button></div></div>
      ${PANE.prev? `<div class="md">${md(d.nota||"")}</div>` : `<textarea id="inota" data-sem-abas="1" data-sem-dest="1" aria-label="Anotações do item" placeholder="O que aprendi, comandos, trechos de código, dúvidas…">${esc(d.nota||"")}</textarea>${acoesItemHTML(a.id)}${notaMatsHTML(a.k,"p:"+a.k)}${navSecHTML(a.k,"p")}`}
      <div class="row" style="justify-content:space-between">
        <button class="btn sm" ${i>0?`data-item="${ITENS[i-1].id}"`:"disabled"}>← Item anterior</button>
        <button class="btn sm" ${i<ITENS.length-1?`data-item="${ITENS[i+1].id}"`:"disabled"}>Próximo item →</button>
      </div>
    </div></section>`;
}

/* ============ TELAS DA DIO ============ */
const ROT_ST={"":"A fazer", and:"Estudando", ok:"Concluído"};
function stChip(id){ const s=itemD(id).st||""; return s==="ok"?'<span class="rt-ok">concluído</span>':(s==="and"?'<span class="chip">estudando</span>':""); }
function itemRow(it){
  const d=itemD(it.id), a=atual();
  const flags=[];
  if(d.estrela) flags.push('<span title="Importante">★</span>');
  if((d.nota||"").trim()) flags.push('<span class="chip">nota</span>');
  if(d.repo) flags.push('<span class="chip">repo</span>');
  const s=stChip(it.id); if(s) flags.push(s);
  const cls= d.st==="ok"?"past":(a&&a.id===it.id?"cur":"fut");
  return `<button class="slot ${cls}" data-item="${it.id}"><span class="mono">${String(it.n).padStart(2,"0")} · sem ${it.semana}</span><span class="nm">${sw(it.k)}<span>${esc(it.nome)}</span><span class="mono muted" style="flex:none">${esc(it.tipo)}${it.h?" · "+it.h+"h":""}</span></span><span class="flags">${flags.join("")}</span></button>`;
}
function faseCard(k){
  const f=DK[k], its=ITENS.filter(i=>i.k===k), ok=its.filter(feito).length, hf=horasFeitas(k);
  const ini=its[0].plano, fim=addDias(ITENS.filter(i=>i.k===k).slice(-1)[0].plano,6);
  return `<div class="card day" style="border-left:6px solid ${f.cor}"><div class="dayh"><h3>${esc(nomeDisc(k))}</h3><div class="row"><span class="chip">semanas ${its[0].semana}–${Math.max(...its.map(i=>i.semana))}</span><span class="chip">${fmtData(ini)} a ${fmtData(fim)}</span><span class="mono muted" style="font-size:12.5px">${ok}/${its.length} · ${hf}/${f.ha}h</span></div></div>${its.map(itemRow).join("")}</div>`;
}

function vHoje(){
  const hoje=agoraFor().data, a=atual();
  const ok=ITENS.filter(feito).length, hf=horasFeitas(), r=ritmo(), tp=tarefas().filter(x=>!x.feito);
  let titulo, sub;
  if(!a){ titulo="Trilha concluída"; sub="Os 42 itens estão marcados como concluídos. Use o caderno para revisar."; }
  else if(hoje<INICIO){ const dias=Math.ceil((msDe(INICIO,"00:00")-msDe(hoje,"00:00"))/864e5); titulo="A trilha começa "+(dias<=1?"amanhã":"em "+dias+" dias"); sub=fmtData(INICIO,true)+" · 1 hora por dia"; }
  else { titulo= itemD(a.id).st==="and"?"Estudando agora":"Próximo item"; sub=fmtData(hoje,true); }
  const d=a?itemD(a.id):{};
  const hero = a? `
    <div class="card hero" style="--c:${DK[a.k].cor}">
      <div class="t">ITEM ${a.n} DE ${ITENS.length} · ${esc(a.tipo.toUpperCase())}${a.h?" · "+a.h+" H":""} · PLANO: SEMANA ${a.semana} (${fmtData(a.plano)})</div>
      <div class="d">${esc(a.nome)}</div>
      <div class="muted">${esc(nomeDisc(a.k))}</div>
      <div class="row" style="margin-top:10px">
        ${a.url?`<a class="btn sm pri" href="${esc(a.url)}" target="_blank" rel="noopener">Abrir na DIO</a>`:""}
        <button class="btn sm" data-pcopiar="${a.id}">Copiar prompt de estudo</button> ${info("prompt")}
      </div>
      <div style="margin-top:12px"><div class="row" style="gap:6px"><label class="lb" for="qnota" style="margin:0">Anotação rápida deste item</label>${info("rapida")}</div>
      <textarea id="qnota" data-qitem="${a.id}" data-sem-abas="1" data-sem-dest="1" placeholder="Digite enquanto estuda. Salva sozinho.">${esc(d.nota||"")}</textarea>${acoesItemHTML(a.id)}${notaMatsHTML(a.k,"q:"+a.k)}${navSecHTML(a.k,"q")}</div>
      <div class="row" style="margin-top:8px">
        ${d.st!=="and"?`<button class="btn sm" data-hst="and" data-hid="${a.id}">Comecei</button>`:""}
        <button class="btn sm pri" data-hst="ok" data-hid="${a.id}">Concluí este item</button>
        <button class="btn sm" data-item="${a.id}">Abrir item</button>
        <button class="btn sm" data-flabrir="${a.id}" title="Anotações da fase num bloco por cima das outras telas">Bloco flutuante</button> ${info("flutuante")}
        <button class="btn sm" data-tmabrir>⏱ Temporizador</button>
      </div>
    </div>` : `<div class="card"><p class="muted" style="margin:0">Nada pela frente. Parabéns!</p></div>`;
  const prox = a? ITENS.slice(ITENS.indexOf(a)+1).filter(i=>!feito(i)).slice(0,5) : [];
  return `
    <div><h2>${titulo} ${info("hoje")}</h2><p class="sub">${sub}</p></div>
    <div class="kpis">
      <div class="card kpi"><b>${ok}<span class="mono" style="font-size:15px">/${ITENS.length}</span></b><span>itens concluídos ${info("kpiitens")}</span></div>
      <div class="card kpi"><b>${hf}<span class="mono" style="font-size:15px">/${HORAS_TOTAL}</span></b><span>horas concluídas ${info("kpihoras")}</span></div>
      <div class="card kpi"><b class="${r.cls}" style="font-size:20px">${esc(r.txt)}</b><span>ritmo do plano ${info("kpiritmo")}</span></div>
      <div class="card kpi"><b>${tp.length}</b><span>tarefas pendentes ${info("kpitar")}</span></div>
    </div>
    <div class="now">
      ${hero}
      <div class="card"><div class="row" style="justify-content:space-between;margin-bottom:8px"><h3>Tarefas ${info("tarefas")}</h3><button class="btn sm" data-go="tarefas">Todas</button></div>
        ${tp.length? tp.slice(0,6).map(tarefaHTML).join("") : '<p class="empty">Nada pendente. Anote o que instalar, revisar ou entregar.</p>'}
      </div>
    </div>
    ${prox.length?`<div class="card day"><div class="dayh"><h3>Próximos itens</h3><button class="btn sm" data-go="trilha">Ver a trilha</button></div>${prox.map(itemRow).join("")}</div>`:""}
  `;
}

function vTrilha(){
  const bts=[["todas","Todas"],...DISC.map(d=>[d.k,d.nome.split(" · ")[0]])].map(([v,l])=>`<button class="btn sm ${FASE_SEL===v?"on":""}" data-fase="${v}">${l}</button>`).join("");
  const ks = FASE_SEL==="todas"?DISC.map(d=>d.k):[FASE_SEL];
  return `<div><h2>Trilha ${info("trilha")}</h2><p class="sub">Os ${ITENS.length} itens na ordem de estudo, com a semana prevista no plano de 1 hora por dia. Clique num item para estudar, anotar e marcar como concluído.</p></div>
    <div class="daysel">${bts}</div>
    ${ks.map(faseCard).join("")}`;
}

function vPortfolio(){
  const pg=S.docs["port-geral"]||{};
  const projs=ITENS.filter(ehProjeto);
  const comRepo=ITENS.filter(i=>itemD(i.id).repo);
  return `<div><h2>Portfólio ${info("portfolio")}</h2><p class="sub">Onde ficam os seus projetos no GitHub. Cada fase termina com um projeto seu, e alguns itens têm projeto da DIO.</p></div>
    <div class="card grid2">
      <div><label class="lb" for="pg-repo">Repositório da trilha (todos os estudos)</label><input type="text" id="pg-repo" inputmode="url" placeholder="https://github.com/NobreDev11/trilha-agentes-ia-dados" value="${esc(pg.repo||"")}"></div>
      <div><label class="lb" for="pg-perfil">Perfil no GitHub</label><input type="text" id="pg-perfil" inputmode="url" placeholder="https://github.com/NobreDev11" value="${esc(pg.perfil||"")}"></div>
    </div>
    <div class="card">${projs.map(it=>{ const d=itemD(it.id); return `<div class="task" style="flex-wrap:wrap">
        <span style="flex:1;min-width:220px">${sw(it.k)} <button class="btn sm" data-item="${it.id}" style="text-align:left">${String(it.n).padStart(2,"0")} · ${esc(it.nome)}</button> <span class="chip">${esc(it.tipo)}</span> ${stChip(it.id)}</span>
        <input type="text" data-repo="${it.id}" inputmode="url" placeholder="Link do repositório ou da entrega" value="${esc(d.repo||"")}" style="flex:1;min-width:220px">
        ${d.repo?`<a class="btn sm" href="${esc(d.repo)}" target="_blank" rel="noopener">Abrir</a>`:""}
      </div>`; }).join("")}</div>
    ${comRepo.filter(i=>!ehProjeto(i)).length?`<div class="card"><h3 style="margin-bottom:6px">Outros itens com link</h3>${comRepo.filter(i=>!ehProjeto(i)).map(i=>`<div class="task"><span style="flex:1">${esc(i.nome)}</span><a class="btn sm" href="${esc(itemD(i.id).repo)}" target="_blank" rel="noopener">Abrir</a></div>`).join("")}</div>`:""}`;
}


/* Salvar nota do item em Materiais (igual ao QGIS): 1ª linha = título, o texto vira material da fase ligado ao item e a nota fica limpa */
function acoesItemHTML(id){ return `<div class="nota-acoes" data-nitem="${id}"><button type="button" class="btn sm pri" data-nai="salvar" title="Move o texto desta nota para Materiais (1ª linha = título) e limpa a nota">Salvar nota em Materiais</button>${info("micro")}</div>`; }
function salvarItemEmMateriais(id){
  const it=AK[id]; if(!it) return false; const notas=String(itemD(id).nota||"").replace(/^\s+|\s+$/g,"");
  if(!notas){ toast("A nota está vazia: escreva algo antes de salvar."); return false; }
  const ls=notas.split("\n"); let i=ls.findIndex(l=>l.trim()&&!/^!\[[^\]]*\]\(fx:/.test(l)); if(i<0) i=0;
  const titulo=(limparMd(ls[i])||"Nota").slice(0,100), corpo=ls.filter((l,n)=>n!==i).join("\n").replace(/^\s+|\s+$/g,""), texto=corpo||ls[i], x=novoId();
  salvarDoc("mtx-"+x,{tipo:"mtx",texto,imgs:[]},50);
  salvarDoc("mat-"+x,{tipo:"mat",titulo,disc:it.k,origem:"nota",criado:Date.now(),arquivos:[],questoes:[],resp:{},chars:texto.length,aula:id},80);
  salvarDoc("item-"+id,{...itemD(id),tipo:"item",nota:""},50);
  document.querySelectorAll(`textarea[data-qitem="${id}"]`).forEach(t=>{ t.value=""; });
  const pn=document.getElementById("inota"); if(pn&&PANE&&PANE.id===id) pn.value="";
  atualizarMatSec(it.k); document.querySelectorAll(`[data-nmk="${it.k}"]`).forEach(el=>{ const n=el.querySelector(".nm-tog .mono"); if(n) n.textContent=mats().filter(m=>m.disc===it.k).length; });
  renderNav(); toast("Nota salva em Materiais: “"+titulo+"”. A nota do item ficou limpa.");
  return true;
}
document.addEventListener("click",e=>{
  const b=e.target.closest&&e.target.closest("[data-nai]"); if(!b) return; const id=b.closest(".nota-acoes").dataset.nitem;
  if(!b.dataset.conf){ if(!String(itemD(id).nota||"").trim()){ toast("A nota está vazia: escreva algo antes de salvar."); return; }
    b.dataset.conf="1"; const o=b.textContent; b.textContent="Confirmar: mover para Materiais e limpar"; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.conf; b.textContent=o; } },4000); return; }
  delete b.dataset.conf; b.textContent="Salvar nota em Materiais"; flushTudo(); salvarItemEmMateriais(id);
});
window.TELAS_EXTRA={trilha:vTrilha, portfolio:vPortfolio};
let FASE_SEL="todas";
Object.assign(ICONES,{
  trilha:'<path d="M4 16.5c2-1 3-3 6-3s4 2 6 1"/><circle cx="4" cy="16.5" r="1.6"/><circle cx="16" cy="14.5" r="1.6"/><path d="M10 13.5V4.5l5 2-5 2"/>',
  portfolio:'<rect x="2.5" y="6" width="15" height="10.5" rx="1.5"/><path d="M7 6V4.5A1.5 1.5 0 0 1 8.5 3h3A1.5 1.5 0 0 1 13 4.5V6M2.5 10.5h15"/>',
});

/* ============ EVENTOS DA DIO ============ */
document.addEventListener("click",async e=>{
  const b=e.target.closest("[data-item],[data-ist],[data-hst],[data-iestrela],[data-fase],[data-pcopiar],[data-peditar],[data-preset]");
  if(!b||b.disabled) return;
  const ds=b.dataset;
  if(ds.item!==undefined){ flushTudo(); document.querySelectorAll("details.pres-pop[open]").forEach(d=>d.open=false); PANE={tipo:"aula",id:ds.item,prev:false,editP:false}; renderPane(); return; }
  if(ds.ist!==undefined){ marcarItem(PANE.id, ds.ist); renderPane(); render(); if(ds.ist==="ok") toast("Item concluído. Bom trabalho!"); return; }
  if(ds.hst!==undefined){ marcarItem(ds.hid, ds.hst); render(); toast(ds.hst==="ok"?"Item concluído. A trilha avançou.":"Bom estudo!"); return; }
  if(ds.iestrela!==undefined){ const id=PANE.id, d=itemD(id); salvarDoc("item-"+id,{...d,tipo:"item",estrela:!d.estrela},50); renderPane(); return; }
  if(ds.fase!==undefined){ FASE_SEL=ds.fase; render(); return; }
  if(ds.pcopiar!==undefined){ const it=IK[ds.pcopiar]; const ta=document.getElementById("pprompt"); await copiar(ta&&PANE&&PANE.id===it.id?ta.value:promptDe(it),"Prompt copiado. Cole num chat novo do Claude."); return; }
  if(ds.peditar!==undefined){ PANE.editP=!PANE.editP; renderPane(); return; }
  if(ds.preset!==undefined){ const id=PANE.id; const d={...itemD(id),tipo:"item"}; delete d.prompt; salvarDoc("item-"+id,d,50); renderPane(); toast("Prompt padrão restaurado."); return; }
});
document.addEventListener("input",e=>{
  const t=e.target;
  if(t.id==="inota"&&PANE){ const id=PANE.id; salvarDoc("item-"+id,{...itemD(id),tipo:"item",nota:t.value}); return; }
  if(t.id==="prepo"&&PANE){ const id=PANE.id; salvarDoc("item-"+id,{...itemD(id),tipo:"item",repo:t.value.trim()}); return; }
  if(t.id==="pprompt"&&PANE){ const id=PANE.id; const it=IK[id]; const v=t.value; const d={...itemD(id),tipo:"item"}; if(v.trim()&&v.trim()!==promptPadrao(it).trim()) d.prompt=v; else delete d.prompt; salvarDoc("item-"+id,d); return; }
  if(t.dataset&&t.dataset.qitem){ const id=t.dataset.qitem; salvarDoc("item-"+id,{...itemD(id),tipo:"item",nota:t.value}); return; }
  if(t.dataset&&t.dataset.repo){ const id=t.dataset.repo; salvarDoc("item-"+id,{...itemD(id),tipo:"item",repo:t.value.trim()}); return; }
  if(t.id==="pg-repo"||t.id==="pg-perfil"){ const g=S.docs["port-geral"]||{tipo:"port"}; salvarDoc("port-geral",{...g,tipo:"port",[t.id==="pg-repo"?"repo":"perfil"]:t.value.trim()}); return; }
});

/* ============ AJUDA (textos da trilha) ============ */
Object.assign(AJUDA,{
  hoje:{t:"Hoje",o:"O item da trilha em que você está (ou o próximo), seu progresso e as tarefas pendentes.",c:"Abra o curso na DIO, copie o prompt de estudo para estudar com o Claude e anote no campo “Anotação rápida”. Ao terminar, clique em “Concluí este item”: a trilha avança sozinha."},
  kpiitens:{t:"Itens concluídos",o:"Quantos dos 42 itens da trilha você marcou como concluídos."},
  kpihoras:{t:"Horas concluídas",o:"Soma das horas (informadas pela DIO) dos itens concluídos, das 384 do essencial.",c:"Projetos próprios contam 0 h aqui: são prática, fora da carga da DIO."},
  kpiritmo:{t:"Ritmo do plano",o:"Compara o item em que você está com o que o plano (1 h por dia desde 09/11/2026) previa para hoje.",c:"“No ritmo” ou “Adiantado”: tudo certo. “Atrasado X sem.”: você está X semanas atrás do plano; não precisa correr, só manter a constância."},
  kpitar:{t:"Tarefas pendentes",o:"Tarefas ainda não marcadas como feitas.",c:"Crie na aba Tarefas, com fase e prazo."},
  rapida:{t:"Anotação rápida",o:"Campo para escrever enquanto estuda. Fica salvo no item atual.",c:"Escreva livremente. Aceita # título, - lista e **negrito**. Salva sozinho a cada pausa na digitação.",ex:"# Git\n- git init cria o repositório\n- **git status** mostra o que mudou"},
  trilha:{t:"Trilha",o:"Os 42 itens na ordem de estudo, separados por fase, com a semana prevista no plano.",c:"Filtre pela fase nos botões. Clique num item para abrir: status, prompt de estudo, link da DIO, repositório e anotações. Marcas na linha: ★ importante, “nota” tem anotação, “repo” tem link, estudando/concluído."},
  item:{t:"Item da trilha",o:"Tudo de um item: status, prompt de estudo, repositório e anotações.",c:"A fazer / Estudando / Concluído: marca o progresso e guarda as datas. ★ Importante: destaca para revisar. As setas passam para o item anterior/seguinte."},
  prompt:{t:"Prompt de estudo",o:"Texto pronto para colar num chat novo do Claude: ele vira seu tutor daquele item e te guia num mini-projeto de portfólio.",c:"“Copiar prompt” e cole no Claude. Itens com conteúdo levantado já vêm completos; os outros pedem que você cole o sumário das aulas da DIO. “Ver / editar” permite colar um prompt novo, que fica salvo neste item."},
  flutuante:{t:"Bloco flutuante",o:"As anotações da fase numa janela pequena que fica por cima das outras telas do caderno e continua aberta quando você troca de aba.",c:"Arraste pela barra de cima para mover e pelo canto de baixo para mudar o tamanho. Troque o item na lista. – minimiza. ⧉ (Chrome e Edge no computador) solta o bloco numa janela que fica por cima de qualquer outra, como a aula da DIO. O texto é o mesmo da anotação do item e salva sozinho."},
  disciplinas:{t:"Fases",o:"As 7 fases da trilha com horas, itens, progresso, resumo, notas e materiais.",c:"Os números são os itens da fase (✓ concluído, … estudando): clique para abrir. “Resumo da fase” é o seu resumo geral."},
  discres:{t:"Resumo da fase",o:"Seu resumo geral da fase, separado das anotações de cada item.",c:"Junte conceitos-chave, comandos e links. Salva sozinho."},
  discaulas:{t:"Itens da fase",o:"Cada número é um item da trilha nesta fase.",c:"Destacado = concluído. ✓ concluído, … estudando, ★ importante. Clique para abrir."},
  portfolio:{t:"Portfólio",o:"Os links do GitHub (ou da entrega na DIO) de cada projeto da trilha.",c:"Cole o link do repositório em cada projeto. O “Repositório da trilha” é o repositório-mãe criado no item 1, onde ficam todos os estudos."},
  materiais:{t:"Materiais",o:"Biblioteca da trilha: PDFs, slides, fotos, links e textos, separados por fase.",c:"“Adicionar material” → escolha o tipo → Salvar. Abra o material para gerar resumo e questões, ou para corrigir o texto extraído."},
  addmat:{t:"Novo material",o:"Formas de trazer conteúdo para o caderno.",c:"Arquivo: PDF ou texto (o app lê o texto do PDF). Fotos: até 8 prints de aulas ou slides. Link: site, PDF, Google Drive/Docs/Slides, repositório do GitHub; YouTube fica só como link. Colar texto: transcrição ou conteúdo copiado da DIO."},
  matres:{t:"Resumo do material",o:"Resumo de estudo feito por IA a partir do material: ideia central, pontos principais, comandos e código, aplicação em agentes de IA e dados, termos.",c:"Gerar resumo: automático (só aparece com a chave da IA configurada). Sem chave: “Copiar pedido p/ Claude” → cole no app do Claude → copie a resposta → “Colar resposta” → Salvar."},
  matq:{t:"Questões",o:"Questões de múltipla escolha geradas do material, com gabarito e explicação.",c:"Escolha a quantidade e clique em Gerar (automático) ou use Copiar pedido / Colar resposta. “Gerar mais” acrescenta sem repetir. Use “Estudar estas questões” para treinar."},
  mattx:{t:"Texto do material",o:"O texto que o app extraiu do PDF, link ou que você colou. É ele que vai para a IA.",c:"Corrija erros, apague partes irrelevantes ou cole conteúdo extra, como a transcrição de uma aula."},
  estudar:{t:"Estudar",o:"Treino com as questões de todos os materiais.",c:"Escolha filtros e clique em Começar. Verde é a correta, vermelho a sua se errou, e aparece a explicação. Cada resposta fica guardada."},
  desemp:{t:"Desempenho",o:"Acertos sobre questões respondidas em cada fase, e o total de questões disponíveis.",c:"Considera a última resposta de cada questão. Use “Que errei” para revisar os pontos fracos."},
  efiltro:{t:"Filtros do estudo",o:"Define quais questões entram na rodada.",c:"Fase e Material restringem o conteúdo. Quais: Todas, Não respondidas ou Que errei. Clique em Começar/Recomeçar para aplicar; a ordem é embaralhada."},
  caderno:{t:"Caderno",o:"Notas livres que não pertencem a um item específico.",c:"Nova nota → título, fase (opcional) e texto. Salva sozinho. Ideias: comandos, trechos de código, dúvidas, ideias de projeto."},
  tarefas:{t:"Tarefas",o:"Lista de pendências da trilha.",c:"Escreva a tarefa, escolha fase e prazo (opcionais) e clique em Adicionar. Marque a caixa quando concluir; ✕ apaga."},
  busca:{t:"Buscar",o:"Procura nos itens, no que você escreveu e nos materiais.",c:"Digite 2 letras ou mais. Clique no resultado para abrir.",ex:"git · join · CrewAI"},
  backup:{t:"Cópia de segurança",o:"Um arquivo com todo o caderno: status dos itens, anotações, notas, tarefas, resumos, questões e links.",c:"Com login, o caderno já está na nuvem: o backup é uma garantia extra. PDFs e fotos não entram no arquivo (ficam na nuvem)."},
  restaurar:{t:"Restaurar backup",o:"Traz de volta o conteúdo de um arquivo de backup.",c:"Escolha o arquivo .json baixado antes. O app mostra o que tem nele e só restaura quando você confirmar. Não apaga nada: junta e mantém a versão mais nova de cada item."},
  exportmd:{t:"Exportar para ler",o:"Todo o caderno em Markdown, organizado por fase.",c:"Baixe o .md para o README do repositório da trilha, ou cole no Word, Docs, Obsidian ou Notion."},
  sql:{t:"Configuração pendente",o:"A tabela do caderno DIO ainda não existe no Supabase do Checklist.",c:"No Supabase do Checklist: SQL Editor → cole o conteúdo de supabase/caderno_dio.sql (do repositório caderno-qgis-aesp) → Run. Depois recarregue esta página."},
});
AJUDA.fases=AJUDA.disciplinas;

/* ============ BUSCA: também nos nomes dos itens ============ */
{ const base=window.resultados; window.resultados=function(){
  const q=BUSCA.trim().toLowerCase(), r=base();
  if(q.length<2) return r;
  const its=ITENS.filter(i=>i.nome.toLowerCase().includes(q)).map(i=>`<button class="ni" data-item="${i.id}"><strong>Item ${i.n} · ${esc(i.nome)}</strong> <span class="mono muted" style="font-size:12px">${esc(nomeDisc(i.k))} · ${esc(i.tipo)}</span></button>`).join("");
  return its? its+(r.includes('class="empty"')?"":r) : r; }; }

/* ============ "Disciplina" → "Fase" nos textos da tela ============ */
// O app comum fala em "disciplina"; aqui troca só nos rótulos da interface (nunca no que você escreve).
const TERMO_FORA=".wys,[contenteditable='true'],textarea,input,.md,.fc-tx,.ex-tx,.rp-tx,pre,code,.ni .ex,.mat-ver,.fx-svg,.pr-n,.nt-tx";
const trocaTermo=t=>t.replace(/\b([Dd])isciplina(s?)\b/g,(x,d,s)=>(d==="D"?"Fase":"fase")+s).replace(/\bDISCIPLINA(S?)\b/g,"FASE$1").replace(/\bh\/a\b/g,"h");
function trocarTermos(raiz){
  if(!raiz||!raiz.querySelectorAll) return;
  const w=document.createTreeWalker(raiz,NodeFilter.SHOW_TEXT); let n; const ns=[];
  while((n=w.nextNode())) if(/isciplina|ISCIPLINA|h\/a/.test(n.nodeValue)) ns.push(n);
  ns.forEach(n=>{ const p=n.parentElement; if(!p||p.closest(TERMO_FORA)) return; const v=trocaTermo(n.nodeValue); if(v!==n.nodeValue) n.nodeValue=v; });
  raiz.querySelectorAll("[title],[placeholder],[aria-label]").forEach(el=>{ if(el.closest(".wys,[contenteditable='true']")) return; ["title","placeholder","aria-label"].forEach(a=>{ const v=el.getAttribute(a); if(v&&/isciplina|h\/a/.test(v)){ const nv=trocaTermo(v); if(nv!==v) el.setAttribute(a,nv); } }); });
}
let _termoT=0; new MutationObserver(()=>{ cancelAnimationFrame(_termoT); _termoT=requestAnimationFrame(()=>trocarTermos(document.body)); }).observe(document.documentElement,{childList:true,subtree:true});
