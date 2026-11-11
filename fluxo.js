// Fluxogramas dentro das anotações (os dois cadernos).
// O fluxograma fica no texto da anotação como um bloco Mermaid, que o GitHub também desenha:
//   ```mermaid
//   %% fluxo {"dir":"TD","nos":[...],"ligs":[...]}   <- modelo do editor visual (para reabrir e editar)
//   flowchart TD
//     n1(["Início"]) --> n2["Etapa"]
//   ```
// A página define window.FLUXO_ALVO() => {get():texto, set(texto), ta():textarea|null} da anotação aberta.
// Botões: [data-fxnovo] (inserir/editar no cursor) e [data-fxeditar="i"] (editar o i-ésimo fluxograma).
// Desenho: a função md() da página troca o bloco por <div class="fx-svg" data-src="..."> e este arquivo desenha.
// Desde 09/11: nos cadernos, o fluxograma fica guardado num doc próprio (fx-<id>: {tipo:"fx", modelo, codigo})
// e o texto da anotação só leva uma linha curta: ![Fluxograma](fx:<id>). O desenho aparece logo abaixo da
// caixa de texto (formato.js) e no Visualizar. Blocos ```mermaid antigos são convertidos ao abrir a anotação.
// No Markdown exportado, a linha volta a ser o bloco ```mermaid (expandir()).
(function(){
"use strict";
const escH = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const aviso = t => { if(typeof toast==="function") toast(t); };
const FORMAS = {
  inicio:{nome:"Início / Fim", a:'(["', b:'"])'},
  etapa:{nome:"Etapa", a:'["', b:'"]'},
  decisao:{nome:"Decisão (pergunta)", a:'{"', b:'"}'},
  dado:{nome:"Entrada / Saída", a:'[/"', b:'"/]'},
  sub:{nome:"Subprocesso", a:'[["', b:'"]]'},
  nota:{nome:"Comando / Nota", a:'>"', b:'"]'},
};
const MODELOS = {
  vazio:{nome:"Em branco", m:{dir:"TD",nos:[{id:"n1",forma:"inicio",texto:"Início"}],ligs:[]}},
  passos:{nome:"Passo a passo", m:{dir:"TD",nos:[{id:"n1",forma:"inicio",texto:"Início"},{id:"n2",forma:"etapa",texto:"Etapa 1"},{id:"n3",forma:"etapa",texto:"Etapa 2"},{id:"n4",forma:"inicio",texto:"Fim"}],ligs:[{de:"n1",para:"n2",rot:""},{de:"n2",para:"n3",rot:""},{de:"n3",para:"n4",rot:""}]}},
  decisao:{nome:"Com decisão (sim/não)", m:{dir:"TD",nos:[{id:"n1",forma:"inicio",texto:"Início"},{id:"n2",forma:"etapa",texto:"Fazer algo"},{id:"n3",forma:"decisao",texto:"Deu certo?"},{id:"n4",forma:"etapa",texto:"Seguir"},{id:"n5",forma:"etapa",texto:"Corrigir"},{id:"n6",forma:"inicio",texto:"Fim"}],ligs:[{de:"n1",para:"n2",rot:""},{de:"n2",para:"n3",rot:""},{de:"n3",para:"n4",rot:"Sim"},{de:"n3",para:"n5",rot:"Não"},{de:"n5",para:"n2",rot:""},{de:"n4",para:"n6",rot:""}]}},
  ciclo:{nome:"Repetição (laço)", m:{dir:"TD",nos:[{id:"n1",forma:"inicio",texto:"Início"},{id:"n2",forma:"etapa",texto:"Repetir a tarefa"},{id:"n3",forma:"decisao",texto:"Terminou?"},{id:"n4",forma:"inicio",texto:"Fim"}],ligs:[{de:"n1",para:"n2",rot:""},{de:"n2",para:"n3",rot:""},{de:"n3",para:"n2",rot:"Não"},{de:"n3",para:"n4",rot:"Sim"}]}},
  git:{nome:"Exemplo: fluxo do Git", m:{dir:"LR",nos:[{id:"n1",forma:"inicio",texto:"Editar arquivos"},{id:"n2",forma:"nota",texto:"git add ."},{id:"n3",forma:"nota",texto:"git commit -m \"mensagem\""},{id:"n4",forma:"nota",texto:"git push"},{id:"n5",forma:"inicio",texto:"GitHub atualizado"}],ligs:[{de:"n1",para:"n2",rot:""},{de:"n2",para:"n3",rot:""},{de:"n3",para:"n4",rot:""},{de:"n4",para:"n5",rot:""}]}},
};
const limpa = t => String(t||"").replace(/"/g,"'").replace(/[\r\n]+/g," ").trim() || " ";
function paraMermaid(m){
  const l=["flowchart "+(m.dir==="LR"?"LR":"TD")];
  const comDesc=m.descNo!==false;
  for(const n of m.nos){ const f=FORMAS[n.forma]||FORMAS.etapa, dsc=comDesc&&String(n.desc||"").trim();
    l.push("  "+n.id+f.a+limpa(n.texto)+(dsc?"<br/><small>"+limpa(dsc).replace(/</g,"#lt;").replace(/>/g,"#gt;")+"</small>":"")+f.b); }
  const ids=new Set(m.nos.map(n=>n.id));
  for(const g of m.ligs){ if(!ids.has(g.de)||!ids.has(g.para)) continue; const r=String(g.rot||"").replace(/["|]/g,"").trim(); l.push("  "+g.de+(r?' -->|"'+r+'"| ':" --> ")+g.para); }
  return l.join("\n");
}
function bloco(m, codigo){ return "```mermaid\n"+(m?"%% fluxo "+JSON.stringify(m)+"\n":"")+(m?paraMermaid(m):codigo.trim())+"\n```"; }
// Encontra os fluxogramas no texto (blocos ```mermaid e linhas ![..](fx:id)): [{ini, fim, codigo, modelo, fx?}]
const RE_FX=/!\[([^\]\n]*)\]\(fx:([A-Za-z0-9_-]+)\)/g;
const temDocs = () => typeof S==="object" && S && S.docs && typeof salvarDoc==="function";
const docFx = id => { const d=temDocs()&&S.docs["fx-"+id]; return d&&!d.apagado?d:null; };
function blocos(txt){
  const r=[], re=/```mermaid[ \t]*\r?\n([\s\S]*?)\r?\n```/g; let m;
  while((m=re.exec(txt))){ const cod=m[1]; let modelo=null; const mm=cod.match(/^%% fluxo (\{.*\})\s*$/m); if(mm){ try{ modelo=JSON.parse(mm[1]); }catch(e){} }
    r.push({ini:m.index, fim:m.index+m[0].length, codigo:cod.replace(/^%% fluxo .*$\n?/m,"").trim(), modelo}); }
  RE_FX.lastIndex=0;
  while((m=RE_FX.exec(txt))){ const d=docFx(m[2]); r.push({ini:m.index, fim:m.index+m[0].length, fx:m[2], codigo:d?String(d.codigo||""):"", modelo:d&&d.modelo?d.modelo:null, titulo:d?d.titulo||"":"", desc:d?d.desc||"":"", falta:!d}); }
  return r.sort((a,b)=>a.ini-b.ini);
}
function novoFx(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function gravarFx(id, modelo, codigo, info){ const a=(S.docs["fx-"+id]&&!S.docs["fx-"+id].apagado)?S.docs["fx-"+id]:{}; salvarDoc("fx-"+id,{...a, tipo:"fx", modelo:modelo||null, codigo:String(codigo||""), ...(info?{titulo:String(info.titulo||"").trim().slice(0,80), desc:String(info.desc||"").trim()}:{})},50); }
// Título, descrição e (quando ficam fora do desenho) descrições das etapas, para mostrar junto do fluxograma.
function extras(d){
  if(!d||d.apagado) return {desc:"",lista:""}; const m=d.modelo||{}, desc=String(d.desc??m.desc??"").trim();
  const nos=(m.nos||[]).map((n,i)=>({n,i})).filter(x=>String(x.n.desc||"").trim());
  return { desc: desc?`<p class="fx-desc">${escH(desc).replace(/\n/g,"<br>")}</p>`:"",
    lista: nos.length&&m.descNo===false?`<details class="fx-det"><summary>Descrição das etapas (${nos.length})</summary><ol>${nos.map(x=>`<li value="${x.i+1}"><b>${escH(x.n.texto||"(sem texto)")}</b> <span class="fx-fm">${escH((FORMAS[x.n.forma]||FORMAS.etapa).nome)}</span><div>${escH(x.n.desc.trim()).replace(/\n/g,"<br>")}</div></li>`).join("")}</ol></details>`:"" };
}
const linhaFx = id => "![Fluxograma](fx:"+id+")";
// Troca os blocos ```mermaid do texto por linhas curtas, guardando cada fluxograma no seu doc.
function converter(txt){
  if(!temDocs()||!/```mermaid/.test(txt)) return txt;
  const bs=blocos(txt).filter(b=>!b.fx); let out=txt;
  for(let i=bs.length-1;i>=0;i--){ const b=bs[i], id=novoFx(); gravarFx(id, b.modelo, b.modelo?paraMermaid(b.modelo):b.codigo); out=out.slice(0,b.ini)+linhaFx(id)+out.slice(b.fim); }
  return out;
}
// Para exportar: as linhas ![..](fx:id) voltam a ser blocos ```mermaid (o GitHub desenha).
function expandir(txt){
  return String(txt||"").replace(RE_FX,(x,alt,id)=>{ const d=docFx(id); if(!d) return x; const m=d.modelo||{};
    const ds=(m.nos||[]).filter(n=>String(n.desc||"").trim()).map(n=>"- **"+(n.texto||"").trim()+"**: "+String(n.desc).trim().replace(/\n+/g," "));
    return (d.titulo?"**"+d.titulo+"**\n\n":"")+(d.desc?String(d.desc).trim()+"\n\n":"")+bloco(d.modelo, d.codigo)+(ds.length&&m.descNo===false?"\n\n"+ds.join("\n"):""); });
}

/* ---- Mermaid: carregado só quando há fluxograma na tela ---- */
let MP=null;
function carregar(){
  if(MP) return MP;
  MP=new Promise((ok,erro)=>{ const s=document.createElement("script"); s.src="/vendor/mermaid.min.js"; s.onload=()=>ok(window.mermaid); s.onerror=()=>{ MP=null; erro(new Error("Não foi possível carregar o desenhista de fluxogramas.")); }; document.head.appendChild(s); });
  return MP;
}
function escuro(){ const t=document.documentElement.dataset.theme; return t? t==="dark" : matchMedia("(prefers-color-scheme: dark)").matches; }
let seq=0, temaAtual=null;
async function desenharSVG(codigo){
  const mm=await carregar();
  const tema=escuro()?"dark":"default";
  if(tema!==temaAtual){ mm.initialize({startOnLoad:false, securityLevel:"strict", theme:tema, fontFamily:getComputedStyle(document.body).fontFamily, flowchart:{curve:"basis", useMaxWidth:true}}); temaAtual=tema; }
  const id="fx-"+(++seq);
  try{ const {svg}=await mm.render(id, codigo); return svg; }
  finally{ document.getElementById(id)?.remove(); document.getElementById("d"+id)?.remove(); }
}
async function renderizar(raiz){
  const els=[...(raiz||document).querySelectorAll(".fx-svg:not([data-ok])")];
  for(const el of els){
    el.dataset.ok="1";
    try{ el.innerHTML=await desenharSVG(decodeURIComponent(el.dataset.src||"")); }
    catch(e){ el.innerHTML=`<p class="fx-erro">Não consegui desenhar este fluxograma: ${escH((e&&e.message||"erro").split("\n")[0])}</p>`; }
  }
}
// Desenha sozinho quando um fluxograma aparece na página (painel, caderno, materiais…).
new MutationObserver(()=>{ if(document.querySelector(".fx-svg:not([data-ok])")) renderizar(); }).observe(document.body,{childList:true,subtree:true});

/* ---- editor ---- */
let ED=null; // {alvo, idx (bloco editado ou null), cursor, m (modelo) | null, codigo, modoCodigo, liga}
function abrir(alvo, idx, cursor){
  const txt=alvo.get(), bs=blocos(txt);
  if(idx==null && cursor!=null){ const b=bs.findIndex(b=>cursor>b.ini&&cursor<b.fim); if(b>=0) idx=b; }
  let m=null, codigo="";
  let titulo="", desc="";
  if(idx!=null&&bs[idx]){ m=bs[idx].modelo; codigo=bs[idx].codigo; if(m) m=JSON.parse(JSON.stringify(m)); titulo=bs[idx].titulo||(m&&m.titulo)||""; desc=bs[idx].desc||(m&&m.desc)||""; }
  else m=JSON.parse(JSON.stringify(MODELOS.passos.m));
  ED={alvo, idx: (idx!=null&&bs[idx])?idx:null, cursor, m, codigo: m?paraMermaid(m):codigo, modoCodigo: !m, liga:true, titulo, desc};
  desenharEditor(); prever();
}
function fechar(){ ED=null; document.getElementById("fxHost").innerHTML=""; }
function salvar(){
  const txt=ED.alvo.get(), bs=blocos(txt);
  if(temDocs()){
    const modelo=ED.modoCodigo?null:{...ED.m,titulo:ED.titulo.trim(),desc:ED.desc.trim()}, codigo=ED.modoCodigo?ED.codigo.trim():paraMermaid(ED.m), info={titulo:ED.titulo,desc:ED.desc};
    const b=ED.idx!=null?bs[ED.idx]:null;
    if(b&&b.fx){ gravarFx(b.fx, modelo, codigo, info); ED.alvo.set(txt); fechar(); document.dispatchEvent(new CustomEvent("caderno:fx",{detail:{id:b.fx}})); aviso("Fluxograma salvo."); return; }
    const id=novoFx(); gravarFx(id, modelo, codigo, info); window.__fxNovo=id;
    let out;
    if(b){ out=txt.slice(0,b.ini)+linhaFx(id)+txt.slice(b.fim); }
    else { const p = ED.cursor!=null ? Math.min(ED.cursor, txt.length) : txt.length, antes=txt.slice(0,p), depois=txt.slice(p);
      out = antes + (antes&&!antes.endsWith("\n")?"\n":"") + linhaFx(id) + (depois&&!depois.startsWith("\n")?"\n":(depois?"":"\n")) + depois; }
    ED.alvo.set(out); fechar(); aviso("Fluxograma inserido na anotação."); return;
  }
  const novo = ED.modoCodigo ? bloco(null, ED.codigo) : bloco({...ED.m,titulo:ED.titulo.trim(),desc:ED.desc.trim()});
  let out;
  if(ED.idx!=null && bs[ED.idx]){ const b=bs[ED.idx]; out=txt.slice(0,b.ini)+novo+txt.slice(b.fim); }
  else { const p = ED.cursor!=null ? Math.min(ED.cursor, txt.length) : txt.length;
    const antes=txt.slice(0,p), depois=txt.slice(p);
    out = antes + (antes&&!antes.endsWith("\n\n")?(antes.endsWith("\n")?"\n":"\n\n"):"") + novo + (depois&&!depois.startsWith("\n")?"\n\n":(depois?"\n":"")) + depois; }
  ED.alvo.set(out); fechar(); aviso("Fluxograma salvo na anotação.");
}
function apagarBloco(){
  if(ED.idx==null){ fechar(); return; }
  const txt=ED.alvo.get(), b=blocos(txt)[ED.idx]; if(!b){ fechar(); return; }
  if(b.fx&&temDocs()) salvarDoc("fx-"+b.fx,{tipo:"fx",apagado:true},50);
  ED.alvo.set((txt.slice(0,b.ini).replace(/\n+$/,"\n")+txt.slice(b.fim).replace(/^\n+/,"\n")).replace(/^\n/,"")); fechar(); aviso("Fluxograma apagado.");
}
function novoId(){ let i=1; const s=new Set(ED.m.nos.map(n=>n.id)); while(s.has("n"+i)) i++; return "n"+i; }
const optNos = sel => ED.m.nos.map((n,i)=>`<option value="${n.id}" ${n.id===sel?"selected":""}>${i+1}. ${escH(n.texto||"(sem texto)")}</option>`).join("");
function desenharEditor(){
  const m=ED.m;
  document.getElementById("fxHost").innerHTML=`<div class="fx-shade" data-fxfechar></div>
  <section class="fx-ed" role="dialog" aria-label="Editor de fluxograma">
    <header><h3>Fluxograma</h3>
      <div class="row">
        ${ED.modoCodigo?"":`<label class="fx-lb">Direção <select id="fx-dir"><option value="TD" ${m.dir!=="LR"?"selected":""}>De cima para baixo</option><option value="LR" ${m.dir==="LR"?"selected":""}>Da esquerda para a direita</option></select></label>
        <label class="fx-lb">Modelo <select id="fx-mod"><option value="">Escolher…</option>${Object.entries(MODELOS).map(([k,v])=>`<option value="${k}">${escH(v.nome)}</option>`).join("")}</select></label>`}
      </div>
      <div class="row">${ED.idx!=null?`<button class="btn sm danger" data-fxapagar>Apagar</button>`:""}<button class="btn sm" data-fxfechar>Cancelar</button><button class="btn sm pri" data-fxsalvar>Salvar na anotação</button></div>
    </header>
    <div class="fx-body">
      <div class="fx-col">
        <div class="fx-sec fx-info">
          <label class="fx-campo">Título <input type="text" id="fx-tit" maxlength="80" value="${escH(ED.titulo)}" placeholder="Ex.: Georreferenciar uma imagem"></label>
          <label class="fx-campo">Descrição do fluxograma <textarea id="fx-desc" rows="2" placeholder="Para que serve, quando usar, observações…">${escH(ED.desc)}</textarea></label>
        </div>
        ${ED.modoCodigo?`<p class="fx-dica">Modo código (Mermaid). <a href="https://mermaid.js.org/syntax/flowchart.html" target="_blank" rel="noopener">Guia da sintaxe</a>.${m?"":" Este fluxograma foi escrito à mão, por isso abre direto no código."}</p>
          <textarea id="fx-cod" spellcheck="false">${escH(ED.codigo)}</textarea>
          ${m?`<button class="btn sm" data-fxvisual>Voltar ao editor visual</button>`:""}`
        :`<div class="fx-sec"><div class="row" style="justify-content:space-between"><b>Etapas</b><span class="row" style="gap:12px"><label class="fx-ck" title="Desmarcado: as descrições aparecem numa lista abaixo do desenho"><input type="checkbox" id="fx-dno" ${m.descNo!==false?"checked":""}> descrição dentro das formas</label><label class="fx-ck"><input type="checkbox" id="fx-liga" ${ED.liga?"checked":""}> ligar a nova etapa à anterior</label></span></div>
          ${m.nos.map((n,i)=>`<div class="fx-no">
            <span class="fx-num">${i+1}</span>
            <select data-fxforma="${n.id}" aria-label="Forma da etapa ${i+1}">${Object.entries(FORMAS).map(([k,v])=>`<option value="${k}" ${n.forma===k?"selected":""}>${v.nome}</option>`).join("")}</select>
            <input type="text" data-fxtexto="${n.id}" value="${escH(n.texto)}" placeholder="Texto da etapa" aria-label="Texto da etapa ${i+1}">
            <button class="btn sm" data-fxsobe="${n.id}" ${i?"":"disabled"} aria-label="Subir">↑</button><button class="btn sm" data-fxdesce="${n.id}" ${i<m.nos.length-1?"":"disabled"} aria-label="Descer">↓</button><button class="btn sm danger" data-fxdelno="${n.id}" aria-label="Apagar etapa">✕</button>
            <textarea class="fx-nd" rows="1" data-fxdesc="${n.id}" placeholder="Descrição ${n.forma==="inicio"?"do início/fim":n.forma==="decisao"?"da decisão":"da etapa"} (opcional)" aria-label="Descrição da etapa ${i+1}">${escH(n.desc||"")}</textarea>
          </div>`).join("")}
          <div class="row"><button class="btn sm" data-fxaddno="etapa">+ Etapa</button><button class="btn sm" data-fxaddno="decisao">+ Decisão</button><button class="btn sm" data-fxaddno="nota">+ Comando</button><button class="btn sm" data-fxaddno="inicio">+ Início/Fim</button></div></div>
          <div class="fx-sec"><b>Ligações (setas)</b>
          ${m.ligs.length?m.ligs.map((g,i)=>`<div class="fx-lig">
            <select data-fxde="${i}" aria-label="De">${optNos(g.de)}</select><span>→</span>
            <select data-fxpara="${i}" aria-label="Para">${optNos(g.para)}</select>
            <input type="text" data-fxrot="${i}" value="${escH(g.rot)}" placeholder="rótulo (ex.: Sim)" aria-label="Rótulo da seta">
            <button class="btn sm danger" data-fxdellig="${i}" aria-label="Apagar ligação">✕</button></div>`).join(""):'<p class="fx-dica">Nenhuma seta ainda.</p>'}
          <div class="row"><button class="btn sm" data-fxaddlig ${m.nos.length<2?"disabled":""}>+ Ligação</button></div></div>
          <button class="btn sm" data-fxcodigo style="align-self:flex-start">Editar como código (avançado)</button>`}
      </div>
      <div class="fx-col fx-prev"><b class="fx-lb">Prévia</b><div id="fx-prev" class="fx-pv"><p class="fx-dica">Desenhando…</p></div></div>
    </div>
  </section>`;
}
let _pt=null;
function prever(){ clearTimeout(_pt); _pt=setTimeout(async()=>{ if(!ED) return; const el=document.getElementById("fx-prev"); if(!el) return;
  const cod = ED.modoCodigo? ED.codigo : paraMermaid(ED.m);
  try{ const svg=await desenharSVG(cod); if(ED&&el.isConnected) el.innerHTML=svg; }
  catch(e){ if(el.isConnected) el.innerHTML=`<p class="fx-erro">${escH((e&&e.message||"Não foi possível desenhar.").split("\n").slice(0,2).join(" "))}</p>`; } },250); }
function mudou(redesenhar){ if(!ED.modoCodigo) ED.codigo=paraMermaid(ED.m); if(redesenhar) desenharEditor(); prever(); }

document.addEventListener("click",e=>{
  const b=e.target.closest("[data-fxnovo],[data-fxeditar],[data-fxfechar],[data-fxsalvar],[data-fxapagar],[data-fxaddno],[data-fxdelno],[data-fxsobe],[data-fxdesce],[data-fxaddlig],[data-fxdellig],[data-fxcodigo],[data-fxvisual]");
  if(!b||b.disabled) return; const d=b.dataset;
  if(d.fxnovo!==undefined||d.fxeditar!==undefined){
    const alvo=typeof window.FLUXO_ALVO==="function"?window.FLUXO_ALVO():null;
    if(!alvo){ aviso("Abra uma anotação para inserir o fluxograma."); return; }
    const ta=alvo.ta&&alvo.ta();
    abrir(alvo, d.fxeditar!==undefined?parseInt(d.fxeditar,10):null, d.fxnovo!==undefined&&ta?(window.FORMATO&&FORMATO.cursorDe?FORMATO.cursorDe(ta):ta.selectionStart):null); return;
  }
  if(!ED) return;
  if(d.fxfechar!==undefined){ fechar(); return; }
  if(d.fxsalvar!==undefined){ salvar(); return; }
  if(d.fxapagar!==undefined){ if(b.dataset.conf){ apagarBloco(); } else { b.dataset.conf="1"; b.textContent="Confirmar"; } return; }
  if(d.fxcodigo!==undefined){ ED.codigo=paraMermaid(ED.m); ED.modoCodigo=true; desenharEditor(); prever(); return; }
  if(d.fxvisual!==undefined){ ED.modoCodigo=false; desenharEditor(); prever(); return; }
  const m=ED.m;
  if(d.fxaddno!==undefined){ const id=novoId(), ult=m.nos[m.nos.length-1]; m.nos.push({id,forma:d.fxaddno,texto:{etapa:"Nova etapa",decisao:"Pergunta?",nota:"comando",inicio:"Fim"}[d.fxaddno]||""});
    if(ED.liga&&ult) m.ligs.push({de:ult.id,para:id,rot:""}); mudou(true);
    setTimeout(()=>{ const i=document.querySelector(`[data-fxtexto="${id}"]`); if(i){ i.focus(); i.select(); } },0); return; }
  if(d.fxdelno!==undefined){ m.nos=m.nos.filter(n=>n.id!==d.fxdelno); m.ligs=m.ligs.filter(g=>g.de!==d.fxdelno&&g.para!==d.fxdelno); mudou(true); return; }
  if(d.fxsobe!==undefined||d.fxdesce!==undefined){ const id=d.fxsobe||d.fxdesce, i=m.nos.findIndex(n=>n.id===id), j=i+(d.fxsobe?-1:1); if(j<0||j>=m.nos.length) return; [m.nos[i],m.nos[j]]=[m.nos[j],m.nos[i]]; mudou(true); return; }
  if(d.fxaddlig!==undefined){ const n=m.nos; m.ligs.push({de:n[n.length-2].id,para:n[n.length-1].id,rot:""}); mudou(true); return; }
  if(d.fxdellig!==undefined){ m.ligs.splice(parseInt(d.fxdellig,10),1); mudou(true); return; }
});
document.addEventListener("input",e=>{
  if(!ED) return; const t=e.target, d=t.dataset;
  if(t.id==="fx-cod"){ ED.codigo=t.value; prever(); return; }
  if(t.id==="fx-tit"){ ED.titulo=t.value; return; }
  if(t.id==="fx-desc"){ ED.desc=t.value; return; }
  if(d.fxdesc!==undefined){ const n=ED.m.nos.find(n=>n.id===d.fxdesc); if(n){ n.desc=t.value; mudou(false); } return; }
  if(d.fxtexto!==undefined){ const n=ED.m.nos.find(n=>n.id===d.fxtexto); if(n){ n.texto=t.value; mudou(false);
    document.querySelectorAll(`option[value="${n.id}"]`).forEach(o=>{ if(o.closest(".fx-lig")){ const i=ED.m.nos.indexOf(n); o.textContent=(i+1)+". "+(t.value||"(sem texto)"); } }); } return; }
  if(d.fxrot!==undefined){ const g=ED.m.ligs[parseInt(d.fxrot,10)]; if(g){ g.rot=t.value; mudou(false); } return; }
});
document.addEventListener("change",e=>{
  if(!ED) return; const t=e.target, d=t.dataset;
  if(t.id==="fx-dir"){ ED.m.dir=t.value; mudou(false); return; }
  if(t.id==="fx-mod"&&t.value){ ED.m=JSON.parse(JSON.stringify(MODELOS[t.value].m)); mudou(true); return; }
  if(t.id==="fx-liga"){ ED.liga=t.checked; return; }
  if(t.id==="fx-dno"){ ED.m.descNo=t.checked?undefined:false; if(t.checked) delete ED.m.descNo; mudou(false); return; }
  if(d.fxforma!==undefined){ const n=ED.m.nos.find(n=>n.id===d.fxforma); if(n){ n.forma=t.value; mudou(false); } return; }
  if(d.fxde!==undefined){ ED.m.ligs[parseInt(d.fxde,10)].de=t.value; mudou(false); return; }
  if(d.fxpara!==undefined){ ED.m.ligs[parseInt(d.fxpara,10)].para=t.value; mudou(false); return; }
});
document.addEventListener("keydown",e=>{ if(ED&&e.key==="Escape"){ e.stopImmediatePropagation(); fechar(); } },true);

const css=`
.md pre{background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:10px 12px;overflow:auto;font:13px/1.5 var(--mono)}
.fx{margin:10px 0;border:1px solid var(--line);border-radius:10px;padding:10px;background:var(--surface)}
.fx-svg{overflow:auto;text-align:center}.fx-svg svg{max-width:100%;height:auto}
.fx .row{justify-content:flex-end;margin-top:6px}
.fx-erro{color:var(--bad);font-size:13px;margin:0}
.fx-shade{position:fixed;inset:0;background:rgb(0 0 0 / .35);z-index:59}
.fx-ed{position:fixed;inset:4vh 4vw;z-index:60;background:var(--surface);border:1px solid var(--line);border-radius:14px;box-shadow:0 20px 60px rgb(0 0 0 / .3);display:flex;flex-direction:column;overflow:hidden}
.fx-ed header{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:12px 16px;border-bottom:1px solid var(--line);background:var(--accent-soft)}
.fx-ed header h3{margin:0;font:800 18px var(--display)}
.fx-ed select,.fx-ed input[type=text]{background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:6px 8px;min-width:0}
.fx-lb{font-size:12.5px;color:var(--muted);display:flex;gap:6px;align-items:center}
.fx-body{flex:1;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);min-height:0}
.fx-col{padding:14px 16px;overflow:auto;display:flex;flex-direction:column;gap:12px;min-height:0}
.fx-prev{border-left:1px solid var(--line);background:var(--bg)}
.fx-pv{flex:1;display:flex;align-items:flex-start;justify-content:center;overflow:auto}.fx-pv svg{max-width:100%;height:auto}
.fx-sec{display:flex;flex-direction:column;gap:8px}
.fx-no{display:grid;grid-template-columns:22px 150px minmax(0,1fr) auto auto auto;gap:6px;align-items:center}
.fx-info{gap:8px;padding-bottom:10px;border-bottom:1px solid var(--line)}
.fx-campo{display:flex;flex-direction:column;gap:4px;font-size:12.5px;font-weight:600;color:var(--muted)}
.fx-campo input,.fx-campo textarea{font:inherit;font-size:14px;font-weight:400;color:var(--ink,inherit);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:6px 8px}
.fx-campo textarea{resize:vertical;min-height:2.6em;field-sizing:content;max-height:30vh}
.fx-nd{grid-column:3 / -1;font:inherit;font-size:13px;color:var(--ink,inherit);background:var(--bg);border:1px dashed var(--line);border-radius:7px;padding:4px 8px;resize:vertical;min-height:1.9em;field-sizing:content;max-height:30vh;margin-top:-2px}
.fx-nd:focus{border-style:solid}
.fx-desc{margin:2px 4px 4px;font-size:13px;color:var(--muted);line-height:1.45;text-align:left}
.fx-det{font-size:13px;margin:2px 4px;text-align:left}.fx-det summary{cursor:pointer;color:var(--muted);font-weight:600}
.fx-det ol{margin:6px 0 0;padding-left:22px}.fx-det li{margin:3px 0}.fx-det .fx-fm{font-size:11.5px;color:var(--muted);margin-left:4px}.fx-det li div{color:var(--ink,inherit)}
.fx-tit{margin:0 0 2px;font-size:14.5px;text-align:left}
.fx-num{font:500 12px var(--mono);color:var(--muted);text-align:right}
.fx-lig{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr) 120px auto;gap:6px;align-items:center}
.fx-ck{font-size:12.5px;color:var(--muted);display:flex;gap:6px;align-items:center;cursor:pointer}
.fx-dica{font-size:13px;color:var(--muted);margin:0}.fx-dica a{color:var(--accent)}
#fx-cod{min-height:260px;font:13px/1.5 var(--mono);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:10px;width:100%;flex:1}
@media (max-width:820px){
  .fx-ed{inset:0;border-radius:0}
  /* tela estreita (celular, janela por cima): prévia em cima com altura fixa, opções rolam embaixo */
  .fx-body{display:flex;flex-direction:column;min-height:0}
  .fx-prev{order:-1;flex:none;height:min(36vh,300px);border-left:0;border-bottom:1px solid var(--line);padding:8px 12px}
  .fx-col:not(.fx-prev){flex:1;min-height:0;overflow:auto}
  .fx-no{grid-template-columns:18px minmax(0,1fr) auto auto auto;}
  .fx-no select{grid-column:2 / -1}
  .fx-no input{grid-column:2 / 3}
  .fx-nd{grid-column:2 / -1}
  .fx-lig{grid-template-columns:1fr auto 1fr;}
  .fx-lig input{grid-column:1 / 3}
}`;
const st=document.createElement("style"); st.textContent=css; document.head.appendChild(st);
const host=document.createElement("div"); host.id="fxHost"; document.body.appendChild(host);
if(typeof AJUDA==="object") AJUDA.fluxograma={t:"Fluxograma na anotação",o:"Desenha um fluxograma dentro da anotação: etapas, decisões e setas.",c:"Clique em Fluxograma. Escolha um modelo ou adicione etapas (Etapa, Decisão, Comando, Início/Fim); com “ligar à anterior” marcado, cada nova etapa já ganha uma seta. Dê um título e uma descrição ao fluxograma, e, se quiser, uma descrição em cada etapa (aparece dentro da forma ou numa lista abaixo do desenho). Em Ligações, crie setas extras e escreva rótulos como Sim/Não. A prévia aparece ao lado. Salve: o fluxograma entra na anotação e aparece desenhado em Visualizar, onde também há o botão para editar. Exportado em Markdown, o GitHub desenha o mesmo fluxograma."};
window.FLUXO={renderizar, blocos, paraMermaid, abrir, converter, expandir, extras};
})();
