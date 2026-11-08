// Temporizador de estudo dos cadernos: Pomodoro, 52/17, 50/10, 90/20, timer, cronômetro e personalizado.
// Uso: a página define window.TIMER_CFG = {ls, meta, alvo} e carrega este arquivo depois do script principal.
//  - ls: chave do localStorage para o estado do temporizador (por caderno)
//  - meta: minutos de estudo por dia (ou null)
//  - alvo(): {id, nome} do item/aula em estudo, para somar o tempo nele (ou null)
// O tempo de foco vai para docs "tempo-AAAA-MM-DD" {seg, sessoes, itens:{id:seg}} via salvarDoc (sincroniza e entra no backup).
// Continua contando com a aba em segundo plano e depois de recarregar (guarda a hora de término, não um contador).
(function(){
"use strict";
const CFG = window.TIMER_CFG || {};
const LS = CFG.ls || "caderno:timer";
const MODOS = {
  pomodoro:{nome:"Pomodoro", desc:"25 min de foco e 5 de pausa; a cada 4 focos, pausa longa de 15.", foco:25, pausa:5, longa:15, cada:4},
  p5217:{nome:"52/17", desc:"52 min de foco e 17 de pausa. Bom para blocos longos de leitura.", foco:52, pausa:17, longa:17, cada:0},
  p5010:{nome:"50/10", desc:"50 min de foco e 10 de pausa, como uma hora-aula.", foco:50, pausa:10, longa:10, cada:0},
  p9020:{nome:"90/20 (foco profundo)", desc:"90 min de foco e 20 de pausa. Para projetos e prática longa.", foco:90, pausa:20, longa:20, cada:0},
  timer:{nome:"Timer", desc:"Uma contagem regressiva única, do tempo que você escolher."},
  crono:{nome:"Cronômetro", desc:"Conta o tempo para cima, sem limite. Pause quando parar de estudar."},
  pers:{nome:"Personalizado", desc:"Você define o foco, as pausas e quantos focos até a pausa longa."},
};
const ROT = {foco:"Foco", pausa:"Pausa curta", longa:"Pausa longa"};
const PADRAO = {modo:"pomodoro", pers:{foco:30,pausa:5,longa:15,cada:4}, timerMin:60, fase:"foco", ciclo:1,
  rodando:false, fim:null, restante:null, cronoIni:null, cronoAcum:0, logDesde:null, auto:true, som:true, notif:false, aberto:false, min:false};
let T = {...PADRAO};
try{ const s=JSON.parse(localStorage.getItem(LS)||"{}"); T={...PADRAO,...s,pers:{...PADRAO.pers,...(s.pers||{})}}; }catch(e){}
const salvar = () => { try{ localStorage.setItem(LS, JSON.stringify(T)); }catch(e){} };
const escH = s => (typeof esc==="function"? esc(s) : String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])));
const aviso = t => { if(typeof toast==="function") toast(t); };
const ajuda = k => (typeof info==="function"? info(k) : "");
const cfgModo = () => T.modo==="pers" ? {...MODOS.pers, ...T.pers} : MODOS[T.modo];
const ehCiclo = () => !["timer","crono"].includes(T.modo);
function durFase(f){ const m=cfgModo(); if(T.modo==="timer") return Math.max(1,T.timerMin)*60; return Math.max(1, f==="foco"?m.foco:(f==="longa"?m.longa:m.pausa))*60; }
function hoje(){ return new Date(Date.now()-3*3600e3).toISOString().slice(0,10); }
function fmt(s){ s=Math.max(0,Math.round(s)); const h=Math.floor(s/3600), m=Math.floor(s%3600/60), ss=s%60; return (h?h+":"+String(m).padStart(2,"0"):String(m).padStart(2,"0"))+":"+String(ss).padStart(2,"0"); }
const fmtMin = s => { const m=Math.round(s/60); return m>=60? Math.floor(m/60)+" h "+String(m%60).padStart(2,"0")+" min" : m+" min"; };

/* ---- registro do tempo de foco ---- */
function docs(){ return (typeof S==="object"&&S&&S.docs)? S.docs : {}; }
function registrar(seg, fechouSessao){
  seg=Math.round(seg); if(seg<5 && !fechouSessao) return;
  const id="tempo-"+hoje(), d=docs()[id]||{tipo:"tempo",seg:0,sessoes:0,itens:{}};
  const a = CFG.alvo ? CFG.alvo() : null;
  const n={...d, tipo:"tempo", seg:(d.seg||0)+seg, sessoes:(d.sessoes||0)+(fechouSessao?1:0), itens:{...(d.itens||{})}};
  if(a&&a.id) n.itens[a.id]=(n.itens[a.id]||0)+seg;
  if(typeof salvarDoc==="function") salvarDoc(id, n, 800);
}
// Fecha o trecho de foco que está correndo (ao pausar, zerar, pular ou terminar).
function fecharTrecho(fechouSessao, ate){
  if(T.logDesde && T.fase==="foco"){ registrar(((ate||Date.now())-T.logDesde)/1000, fechouSessao); }
  else if(fechouSessao && T.fase==="foco") registrar(0,true);
  T.logDesde = null;
}
function tempoDia(data){ const d=docs()["tempo-"+data]; let s=d&&!d.apagado?(d.seg||0):0; if(data===hoje()&&T.logDesde&&T.fase==="foco") s+=(Date.now()-T.logDesde)/1000; return s; }
function sessoesHoje(){ const d=docs()["tempo-"+hoje()]; return d&&!d.apagado?(d.sessoes||0):0; }
function tempoSemana(){ let s=0; for(let i=0;i<7;i++){ const dt=new Date(Date.now()-3*3600e3-i*864e5).toISOString().slice(0,10); s+=tempoDia(dt); } return s; }
function tempoAlvo(id){ let s=0; for(const [k,d] of Object.entries(docs())) if(k.startsWith("tempo-")&&d&&!d.apagado&&d.itens&&d.itens[id]) s+=d.itens[id]; if(T.logDesde&&T.fase==="foco"){ const a=CFG.alvo&&CFG.alvo(); if(a&&a.id===id) s+=(Date.now()-T.logDesde)/1000; } return s; }

/* ---- relógio ---- */
function restante(){
  if(T.modo==="crono") return T.cronoAcum + (T.rodando&&T.cronoIni? (Date.now()-T.cronoIni)/1000 : 0);
  if(T.rodando&&T.fim) return (T.fim-Date.now())/1000;
  return T.restante!=null? T.restante : durFase(T.fase);
}
function iniciar(){
  if(T.rodando) return; desbloquearSom();
  if(T.modo==="crono"){ T.cronoIni=Date.now(); }
  else { const r=T.restante!=null?T.restante:durFase(T.fase); T.fim=Date.now()+r*1000; T.restante=null; }
  T.rodando=true; if(T.fase==="foco") T.logDesde=Date.now();
  salvar(); desenhar();
}
function pausar(){
  if(!T.rodando) return;
  if(T.modo==="crono"){ T.cronoAcum+= (Date.now()-T.cronoIni)/1000; T.cronoIni=null; }
  else { T.restante=Math.max(0,(T.fim-Date.now())/1000); T.fim=null; }
  T.rodando=false; fecharTrecho(false); salvar(); desenhar();
}
function zerar(){
  if(T.rodando) pausar(); else fecharTrecho(false);
  T.fase="foco"; T.ciclo=1; T.restante=null; T.fim=null; T.cronoAcum=0; T.cronoIni=null; T.rodando=false;
  salvar(); desenhar();
}
function proxima(automatico, ate){
  // termina a etapa atual e prepara a seguinte
  const eraFoco=T.fase==="foco";
  fecharTrecho(eraFoco && automatico, ate);
  if(T.modo==="timer"){ T.rodando=false; T.fim=null; T.restante=null; salvar(); desenhar(); return; }
  const m=cfgModo();
  if(eraFoco){ T.fase = (m.cada && T.ciclo % m.cada===0) ? "longa" : "pausa"; }
  else { T.fase="foco"; T.ciclo++; }
  T.restante=null; T.fim=null; T.rodando=false;
  salvar();
  if(automatico && T.auto) iniciar(); else desenhar();
}
function terminou(ate){
  const era=T.fase, foiTimer=T.modo==="timer";
  tocar(); notificar(foiTimer?"Tempo encerrado":(era==="foco"?"Fim do foco":"Fim da pausa"),
    foiTimer?"O timer chegou a zero.":(era==="foco"?"Hora de "+ROT[(cfgModo().cada&&T.ciclo%cfgModo().cada===0)?"longa":"pausa"].toLowerCase()+".":"Hora de voltar ao foco."));
  proxima(true, ate);
  aviso(foiTimer?"Tempo encerrado.":(era==="foco"?"Fim do foco. Faça a pausa.":"Fim da pausa. Bora voltar."));
}

/* ---- som e notificação ---- */
let AC=null;
function desbloquearSom(){ try{ if(!AC) AC=new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==="suspended") AC.resume(); }catch(e){} }
function tocar(){
  if(!T.som) return;
  try{ desbloquearSom(); const t0=AC.currentTime;
    [0,0.35,0.7].forEach((d,i)=>{ const o=AC.createOscillator(), g=AC.createGain(); o.type="sine"; o.frequency.value=i===2?988:784; g.gain.setValueAtTime(0.0001,t0+d); g.gain.exponentialRampToValueAtTime(0.25,t0+d+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t0+d+0.28); o.connect(g).connect(AC.destination); o.start(t0+d); o.stop(t0+d+0.3); });
  }catch(e){}
}
function notificar(titulo, corpo){
  if(!T.notif || !("Notification" in window) || Notification.permission!=="granted") return;
  try{ new Notification(titulo,{body:corpo, icon:"/icons/icon-192.png", tag:"caderno-timer"}); }catch(e){}
}

/* ---- interface ---- */
const css=`
#tmini:empty{display:none}
.tm-pill{display:inline-flex;align-items:center;gap:6px;font:500 13px var(--mono);font-variant-numeric:tabular-nums}
.tm-pill .tm-dot{width:8px;height:8px;border-radius:50%;background:var(--muted)}
.tm-pill.on .tm-dot{background:var(--ok)}.tm-pill.pausa .tm-dot{background:var(--warn)}
.tmr{position:fixed;z-index:31;top:12px;right:12px;width:min(340px,calc(100vw - 16px));max-height:calc(100vh - 24px);overflow:auto;background:var(--surface);border:1px solid var(--line);border-radius:12px;box-shadow:0 14px 40px rgb(0 0 0 / .22)}
.tmr header{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--line);background:var(--accent-soft)}
.tmr header h3{font:700 15px var(--display);margin:0;display:flex;gap:6px;align-items:center}
.tmr .tb{padding:12px;display:flex;flex-direction:column;gap:10px}
.tmr select,.tmr input[type=number]{background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:6px 8px;width:100%}
.tm-desc{font-size:12.5px;color:var(--muted);margin:0}
.tm-rel{font:800 46px/1 var(--mono);font-variant-numeric:tabular-nums;text-align:center;letter-spacing:-.02em;margin:4px 0 0}
.tm-fase{text-align:center;font-size:13px;color:var(--muted)}
.tm-fase b{color:var(--ink)}
.tm-bar{height:6px;border-radius:99px;background:var(--line);overflow:hidden}.tm-bar>i{display:block;height:100%;background:var(--accent)}
.tm-bar.pausa>i{background:var(--warn)}
.tm-bts{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.tm-pers{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.tm-pers label,.tm-op label{font-size:11.5px;color:var(--muted);display:block;margin-bottom:2px}
.tm-op{display:flex;flex-direction:column;gap:4px;font-size:13px}
.tm-op label.ck{display:flex;gap:8px;align-items:center;font-size:13px;color:var(--ink);margin:0;cursor:pointer}
.tm-op input[type=checkbox]{width:16px;height:16px;accent-color:var(--accent)}
.tm-st{border-top:1px solid var(--line);padding-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;font-size:13px}
.tm-st b{font:700 15px var(--display);display:block;font-variant-numeric:tabular-nums}
.tm-st span{color:var(--muted);font-size:12px}
@media (max-width:820px){ .tmr{top:auto;bottom:8px;right:8px;left:8px;width:auto;max-height:70vh} }
`;
const st=document.createElement("style"); st.textContent=css; document.head.appendChild(st);
const host=document.createElement("div"); host.id="timerHost"; document.body.appendChild(host);
if(typeof AJUDA==="object") AJUDA.temporizador={t:"Temporizador de estudo",o:"Controla o tempo de foco e de pausa e registra quanto você estudou por dia"+(CFG.meta?" (meta: "+CFG.meta+" min)":"")+".",c:"Escolha o modo e clique em Iniciar. Pomodoro: 25 de foco, 5 de pausa e uma pausa longa a cada 4 focos. 52/17, 50/10 e 90/20 alternam foco e pausa nesses tempos. Timer: contagem regressiva única. Cronômetro: conta para cima. Personalizado: você define os tempos. Continua contando com a aba em segundo plano. Só o tempo de foco entra nas estatísticas."};

function pill(){
  const el=document.getElementById("tmini"); if(!el) return;
  const ativo = T.rodando || T.restante!=null || (T.modo==="crono"&&T.cronoAcum>0);
  const r=restante();
  el.innerHTML=`<button type="button" class="btn sm tm-pill ${T.rodando?(T.fase==="foco"?"on":"pausa"):""}" data-tmabrir title="Temporizador de estudo" aria-label="Abrir temporizador"><span class="tm-dot"></span>⏱ ${ativo?fmt(r)+(ehCiclo()&&T.fase!=="foco"?" · pausa":""):"Temporizador"}</button>`;
}
function painel(){
  const m=cfgModo(), r=restante(), crono=T.modo==="crono";
  const total = crono? 0 : durFase(T.fase), pct = crono? 0 : Math.min(100,Math.max(0,(1-r/total)*100));
  const meta=CFG.meta, hj=tempoDia(hoje()), a=CFG.alvo?CFG.alvo():null;
  const faseTxt = crono? "Cronômetro" : (T.modo==="timer"? "Timer de "+T.timerMin+" min" : `<b>${ROT[T.fase]}</b>${T.fase==="foco"?" · ciclo "+T.ciclo+(m.cada?" (pausa longa a cada "+m.cada+")":""):""}`);
  return `<div class="tmr" role="dialog" aria-label="Temporizador de estudo">
    <header><h3>⏱ Temporizador ${ajuda("temporizador")}</h3><div class="row" style="gap:6px"><button type="button" class="btn sm" data-tmfechar aria-label="Esconder temporizador" title="Esconde o painel; o tempo continua correndo">Esconder</button></div></header>
    <div class="tb">
      <div><select id="tm-modo" aria-label="Modo do temporizador" ${T.rodando?"disabled":""}>${Object.entries(MODOS).map(([k,v])=>`<option value="${k}" ${T.modo===k?"selected":""}>${escH(v.nome)}</option>`).join("")}</select>
        <p class="tm-desc" style="margin-top:6px">${escH(MODOS[T.modo].desc)}</p></div>
      ${T.modo==="pers"?`<div class="tm-pers">
        <div><label for="tm-pf">Foco (min)</label><input type="number" id="tm-pf" min="1" max="240" value="${T.pers.foco}" ${T.rodando?"disabled":""}></div>
        <div><label for="tm-pp">Pausa</label><input type="number" id="tm-pp" min="1" max="120" value="${T.pers.pausa}" ${T.rodando?"disabled":""}></div>
        <div><label for="tm-pl">Pausa longa</label><input type="number" id="tm-pl" min="1" max="120" value="${T.pers.longa}" ${T.rodando?"disabled":""}></div>
        <div><label for="tm-pc">Longa a cada</label><input type="number" id="tm-pc" min="0" max="12" value="${T.pers.cada}" ${T.rodando?"disabled":""} title="0 = sem pausa longa"></div>
      </div>`:""}
      ${T.modo==="timer"?`<div><label class="tm-desc" for="tm-tm" style="display:block;margin-bottom:2px">Minutos</label><input type="number" id="tm-tm" min="1" max="600" value="${T.timerMin}" ${T.rodando?"disabled":""}></div>`:""}
      <div class="tm-rel" id="tm-rel" aria-live="off">${fmt(r)}</div>
      <div class="tm-fase">${faseTxt}</div>
      ${crono?"":`<div class="tm-bar ${T.fase!=="foco"?"pausa":""}"><i id="tm-bar" style="width:${pct}%"></i></div>`}
      <div class="tm-bts">
        ${T.rodando?`<button type="button" class="btn pri" data-tmpausar>Pausar</button>`:`<button type="button" class="btn pri" data-tminiciar>${(T.restante!=null||T.cronoAcum>0)?"Continuar":"Iniciar"}</button>`}
        ${ehCiclo()?`<button type="button" class="btn" data-tmpular title="Encerra esta etapa e vai para a próxima">Pular etapa</button>`:""}
        <button type="button" class="btn" data-tmzerar>Zerar</button>
      </div>
      <div class="tm-op">
        ${ehCiclo()?`<label class="ck"><input type="checkbox" id="tm-auto" ${T.auto?"checked":""}> Começar a próxima etapa sozinho</label>`:""}
        <label class="ck"><input type="checkbox" id="tm-som" ${T.som?"checked":""}> Tocar som ao terminar</label>
        ${"Notification" in window?`<label class="ck"><input type="checkbox" id="tm-notif" ${T.notif&&Notification.permission==="granted"?"checked":""}> Avisar com notificação do sistema</label>`:""}
      </div>
      <div class="tm-st">
        <div><b id="tm-hoje">${fmtMin(hj)}${meta?" / "+meta+" min":""}</b><span>estudado hoje</span>${meta?`<div class="tm-bar" style="margin-top:4px"><i style="width:${Math.min(100,hj/60/meta*100)}%"></i></div>`:""}</div>
        <div><b>${fmtMin(tempoSemana())}</b><span>últimos 7 dias</span></div>
        <div><b>${sessoesHoje()}</b><span>focos completos hoje</span></div>
        ${a?`<div><b>${fmtMin(tempoAlvo(a.id))}</b><span title="${escH(a.nome)}">em ${escH(a.rot||"item atual")}</span></div>`:""}
      </div>
    </div></div>`;
}
let _desenhando=false;
function desenhar(){
  if(_desenhando) return; _desenhando=true;
  try{ desenhar2(); } finally { _desenhando=false; }
}
function desenhar2(){
  pill();
  host.innerHTML = T.aberto ? painel() : "";
  titulo();
}
function titulo(){
  const base=document.title.replace(/^[▶⏸] [\d:]+ · /,"");
  document.title = T.rodando ? "▶ "+fmt(restante())+" · "+base : base;
}
function tick(){
  if(T.rodando && T.modo!=="crono" && T.fim && Date.now()>=T.fim){ terminou(T.fim); return; }
  pill(); titulo();
  if(T.aberto){ const r=document.getElementById("tm-rel"); if(r) r.textContent=fmt(restante());
    const b=document.getElementById("tm-bar"); if(b&&T.modo!=="crono"){ b.style.width=Math.min(100,Math.max(0,(1-restante()/durFase(T.fase))*100))+"%"; }
    const h=document.getElementById("tm-hoje"); if(h) h.textContent=fmtMin(tempoDia(hoje()))+(CFG.meta?" / "+CFG.meta+" min":""); }
}
setInterval(tick, 500);
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible") tick(); });

document.addEventListener("click",e=>{
  const b=e.target.closest("[data-tmabrir],[data-tmfechar],[data-tminiciar],[data-tmpausar],[data-tmpular],[data-tmzerar]"); if(!b) return;
  const d=b.dataset;
  if(d.tmabrir!==undefined){ T.aberto=!T.aberto; salvar(); desenhar(); return; }
  if(d.tmfechar!==undefined){ T.aberto=false; salvar(); desenhar(); return; }
  if(d.tminiciar!==undefined){ iniciar(); return; }
  if(d.tmpausar!==undefined){ pausar(); return; }
  if(d.tmpular!==undefined){ const ia=T.rodando; proxima(false); if(ia) iniciar(); return; }
  if(d.tmzerar!==undefined){ zerar(); return; }
});
document.addEventListener("change",async e=>{
  const t=e.target; if(!t.id||!t.id.startsWith("tm-")) return;
  if(t.id==="tm-modo"){ fecharTrecho(false); T.modo=t.value; T.fase="foco"; T.ciclo=1; T.restante=null; T.fim=null; T.cronoAcum=0; T.cronoIni=null; }
  else if(t.id==="tm-tm"){ T.timerMin=Math.min(600,Math.max(1,parseInt(t.value,10)||1)); T.restante=null; }
  else if(["tm-pf","tm-pp","tm-pl","tm-pc"].includes(t.id)){ const k={"tm-pf":"foco","tm-pp":"pausa","tm-pl":"longa","tm-pc":"cada"}[t.id]; const v=parseInt(t.value,10); T.pers[k]= k==="cada"? Math.min(12,Math.max(0,v||0)) : Math.min(240,Math.max(1,v||1)); T.restante=null; }
  else if(t.id==="tm-auto"){ T.auto=t.checked; }
  else if(t.id==="tm-som"){ T.som=t.checked; if(t.checked){ desbloquearSom(); tocar(); } }
  else if(t.id==="tm-notif"){
    if(t.checked){ let p=Notification.permission; if(p==="default"){ try{ p=await Notification.requestPermission(); }catch(x){} }
      T.notif = p==="granted"; if(!T.notif) aviso("O navegador não permitiu notificações. Libere nas configurações do site."); }
    else T.notif=false;
  }
  // redesenha depois do evento: trocar o painel durante o change/blur do campo gera erro no navegador
  salvar(); setTimeout(desenhar,0);
});

// Ao abrir a página: se uma etapa terminou enquanto o caderno estava fechado, registra até o término e pausa na etapa seguinte.
if(T.rodando && T.modo!=="crono" && T.fim && Date.now()>=T.fim){ const aut=T.auto; T.auto=false; proxima(true, T.fim); T.auto=aut; salvar(); }
desenhar();
window.TEMPORIZADOR = { abrir(){ T.aberto=true; salvar(); desenhar(); }, estado:()=>({...T}), tempoDia, tempoAlvo };
})();
