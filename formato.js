/* ============ BARRA DE FORMATAÇÃO RÁPIDA ============
   Aparece em cima das caixas de anotação (painel do item/aula, anotação rápida do Hoje,
   anotações de fase/disciplina, notas do caderno e bloco flutuante).
   Só escreve Markdown simples no texto; o "Visualizar" (md()) desenha o resultado.
   Atalhos: Ctrl+B negrito, Ctrl+I itálico, Ctrl+K link, Ctrl+Shift+X tarefa ☐,
   Enter continua a lista (Enter numa linha de lista vazia encerra a lista). */
(function(){
  const ALVOS='#qnota,#pnota,#ntxt,#fl-txt,textarea[data-dnota]';
  const BOTOES=[
    ["cheia",'<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 7.5V3h4.5M12.5 3H17v4.5M17 12.5V17h-4.5M7.5 17H3v-4.5"/></svg><span class="fmt-tx">Tela cheia</span>',"Escrever em tela cheia (Esc para sair)"],
    ["neg","<b>N</b>","Negrito (Ctrl+B)"],
    ["ita","<i>I</i>","Itálico (Ctrl+I)"],
    ["mar",'<span class="fmt-mk">M</span>',"Marca-texto"],
    ["tit","T","Título (clique de novo para trocar o tamanho)"],
    ["lis","•","Lista"],
    ["num","1.","Lista numerada"],
    ["tar","☐","Tarefa / checklist (Ctrl+Shift+X); clique de novo para marcar ☑"],
    ["cit","❝","Citação ou destaque"],
    ["cod","&lt;/&gt;","Código (trecho ou bloco)"],
    ["lnk","🔗","Link (Ctrl+K)"],
    ["div","―","Linha divisória"],
    ["img",'<svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="2" y="3.5" width="16" height="13" rx="2"/><circle cx="7" cy="8" r="1.6"/><path d="M2.5 15l4.5-4.5 3.5 3.5 2.5-2.5 4.5 4.5"/></svg><span class="fmt-tx">Imagem</span>',"Inserir imagem neste ponto do texto (também dá para colar com Ctrl+V ou arrastar a imagem para a caixa)"],
    ["flx",'<svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="6" y="1.5" width="8" height="4.5" rx="1"/><path d="M10 6v3"/><path d="M10 9l3.5 3.2L10 15.4 6.5 12.2z"/><path d="M6.5 12.2H3v4.3h4"/><path d="M13.5 12.2H17v4.3h-4"/></svg><span class="fmt-tx">Fluxograma</span>',"Inserir fluxograma neste ponto do texto (com o cursor dentro de um fluxograma, edita ele)"],
  ];
  const CSS=`
.fmt{width:0;min-width:100%;box-sizing:border-box;display:flex;gap:2px;align-items:center;flex-wrap:wrap;overflow-x:auto;scrollbar-width:none;padding:3px;margin:0 0 4px;border:1px solid var(--line);border-radius:8px;background:var(--surface);flex:none}
.fmt::-webkit-scrollbar{display:none}
.fmt button{flex:none;min-width:30px;height:28px;padding:0 7px;border:0;border-radius:6px;background:transparent;color:var(--ink,inherit);cursor:pointer;font-size:13.5px;line-height:1}
.fmt button:hover{background:var(--accent-soft)}
.fmt button:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.fmt .fmt-sep{flex:none;width:1px;height:18px;background:var(--line);margin:0 3px}
.fmt [data-fmt=flx],.fmt [data-fmt=img],.fmt [data-fmt=cheia]{display:inline-flex;align-items:center;gap:5px;color:var(--accent)}
.fmt[hidden],.fmt-cheia textarea[hidden],.fc-prev[hidden]{display:none!important}
.fx-comp{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:8px;background:var(--bg);padding:4px 0;min-height:140px;max-height:min(60vh,560px);overflow-y:auto;overflow-x:hidden;cursor:text}
.fx-comp>*{flex-shrink:0}
.fx-comp:focus-within{outline:2px solid var(--accent);outline-offset:-1px}
textarea.fx-seg{display:block;width:100%;box-sizing:border-box;border:0!important;outline:0!important;background:transparent!important;resize:none!important;min-height:1.9em!important;height:auto;overflow:hidden;padding:4px 12px!important;margin:0;flex:none!important;font:inherit;line-height:1.55;color:inherit}
textarea.fx-seg:last-child{flex:1 0 auto!important;min-height:3.2em!important}
.fx-bloco{margin:6px 12px;border:1px solid var(--line);border-radius:10px;background:var(--surface);padding:8px;display:flex;flex-direction:column;gap:6px;cursor:default}
.fx-bloco .fx-svg{display:flex;justify-content:center;overflow:auto}
.fx-bloco .fx-svg svg{max-width:100%;max-height:340px;height:auto}
.fx-bloco-b{display:flex;align-items:center;justify-content:flex-end;gap:6px;font-size:12.5px;color:var(--muted)}
.fx-bloco-b span{margin-right:auto}
.fx-bloco-b button{border:1px solid var(--line);background:var(--surface);color:var(--accent);border-radius:7px;padding:3px 10px;cursor:pointer;font:inherit;font-size:12.5px}
.fx-bloco-b button.fx-rm{color:var(--bad,#b3261e)}
.fx-comp[hidden]{display:none!important}
.fmt-cheia .fx-comp{flex:1;min-height:0;max-height:none;overflow-y:auto;overflow-x:hidden;display:block}
.fmt-cheia .fx-comp>*{flex:none!important}
.fmt-cheia .fx-bloco .fx-svg svg{max-height:60vh}
.fmt-cheia textarea.fx-seg{font-size:16.5px;line-height:1.7;padding:6px 16px!important}
.fmt-cheia{position:fixed;inset:0;z-index:38;background:var(--bg);display:flex;flex-direction:column}
.fmt-cheia header{display:flex;align-items:center;gap:10px;padding:10px max(16px,calc((100% - 900px)/2));border-bottom:1px solid var(--line);background:var(--surface);flex:none}
.fmt-cheia header .fc-t{flex:1;min-width:0;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fmt-cheia header .fc-n{font:12.5px var(--mono,monospace);color:var(--muted);white-space:nowrap}
.fmt-cheia header button{border:1px solid var(--line);background:var(--surface);color:var(--ink,inherit);border-radius:8px;padding:5px 12px;cursor:pointer;font:inherit;font-size:14px}
.fmt-cheia header button:hover{border-color:var(--accent)}
.fmt-cheia .fc-b{flex:1;min-height:0;display:flex;flex-direction:column;width:100%;max-width:900px;margin:0 auto;padding:12px 16px 16px;box-sizing:border-box}
.fmt-cheia .fc-b textarea:not(.fx-seg){flex:1;min-height:0!important;height:auto!important;resize:none;font-size:16.5px;line-height:1.7;padding:14px 16px}
.fmt-cheia .fc-prev{flex:1;min-height:0;overflow:auto;padding:4px 2px;max-width:none}
@media (max-width:820px){.fmt-cheia header .fc-n{display:none}}
.fmt .fmt-tx{font-size:12.5px;font-weight:600}
@media (max-width:820px){.fmt .fmt-tx{display:none}.fmt{flex-wrap:wrap}}
.fmt .fmt-mk{background:#fde68a;color:#3b2f00;padding:0 3px;border-radius:3px}
.flut .fmt{margin:0;border:0;border-bottom:1px solid var(--line);border-radius:0;padding:3px 6px}
.md mark{background:#fde68a;color:#3b2f00;padding:0 2px;border-radius:3px}
.md blockquote{margin:.5em 0;padding:4px 12px;border-left:3px solid var(--accent);background:var(--accent-soft);border-radius:0 6px 6px 0}
.md blockquote p{margin:.2em 0}
.md hr{border:0;border-top:1px solid var(--line);margin:1em 0}
.md ol{margin:.3em 0;padding-left:1.5em}
.md li.tk{list-style:none;margin-left:-1.1em}
.md li.tk.ok{color:var(--muted);text-decoration:line-through}
.md pre{background:var(--accent-soft);padding:8px 10px;border-radius:8px;overflow-x:auto}
.md pre code{background:none;padding:0}
.md img.md-img{display:block;max-width:100%;height:auto;margin:8px 0;border-radius:8px;border:1px solid var(--line);cursor:zoom-in;background:var(--accent-soft)}
.md img.md-img:not([src]){min-height:80px;min-width:160px}
.md .md-img-x{display:inline-block;padding:6px 10px;border:1px dashed var(--line);border-radius:8px;color:var(--muted);font-size:13px}
textarea.fmt-drop{outline:2px dashed var(--accent);outline-offset:-4px}`;
  const st=document.createElement("style"); st.id="fmt-css"; st.textContent=CSS; document.head.appendChild(st);

  function barra(doc){
    const pip=doc!==document;
    const d=doc.createElement("div"); d.className="fmt"; d.setAttribute("role","toolbar"); d.setAttribute("aria-label","Formatação rápida");
    d.innerHTML=BOTOES.filter(([k])=>!(pip&&(k==="flx"||k==="cheia"))).map(([k,h,t],i)=>((k==="neg"&&!pip)||k==="tit"||k==="cit"||k==="img"?'<span class="fmt-sep"></span>':"")+`<button type="button" data-fmt="${k}" title="${t}" aria-label="${t}">${h}</button>`).join("");
    return d;
  }
  function equipar(raiz){
    raiz.querySelectorAll(ALVOS).forEach(ta=>{
      if(ta.dataset.fmtOk) return; ta.dataset.fmtOk="1";
      const p=ta.previousElementSibling; if(p&&p.classList.contains("fmt")) return;
      ta.parentNode.insertBefore(barra(ta.ownerDocument),ta);
      if(ta.ownerDocument===document){
        // blocos ```mermaid antigos viram linha curta + doc (o desenho aparece no lugar)
        if(window.FLUXO&&FLUXO.converter&&/```mermaid/.test(ta.value)){ const nv=FLUXO.converter(ta.value); if(nv!==ta.value){ ta.value=nv; ta.dispatchEvent(new Event("input",{bubbles:true})); } }
        montar(ta);
      }
    });
  }
  /* ---- Editor em blocos: quando a anotação tem fluxograma, o texto vira trechos editáveis e o
     fluxograma aparece DESENHADO no ponto onde foi inserido. A caixa original continua sendo a fonte
     (fica escondida) e recebe o texto completo a cada digitação, então o salvamento do app não muda. */
  const RE_LFX=/^\s*!\[[^\]\n]*\]\(fx:([A-Za-z0-9_-]+)\)\s*$/;
  const temFx = v => /!\[[^\]\n]*\]\(fx:[A-Za-z0-9_-]+\)/.test(v);
  function partes(v){
    const out=[]; let buf=[];
    for(const l of String(v).split("\n")){ const m=l.match(RE_LFX); if(m){ out.push({t:"txt",v:buf.join("\n")}); buf=[]; out.push({t:"fx",id:m[1],linha:l.trim()}); } else buf.push(l); }
    out.push({t:"txt",v:buf.join("\n")}); return out;
  }
  function serializar(comp){
    const ps=[]; for(const el of comp.children){ if(el.classList.contains("fx-seg")){ if(el.value!=="") ps.push(el.value); } else if(el.dataset.linha) ps.push(el.dataset.linha); }
    return ps.join("\n");
  }
  function ajustar(seg){ seg.style.height="auto"; seg.style.height=seg.scrollHeight+"px"; }
  function reajustar(ta){ const c=ta&&ta._comp; if(!c) return; const f=()=>c.querySelectorAll(".fx-seg").forEach(ajustar); f(); requestAnimationFrame(f); }
  addEventListener("resize",()=>document.querySelectorAll(".fx-comp").forEach(c=>c._ta&&reajustar(c._ta)));
  function montar(ta){
    const velho=ta._comp;
    if(!temFx(ta.value)){ if(velho){ velho.remove(); ta._comp=null; ta.hidden=false; } return; }
    const comp=document.createElement("div"); comp.className="fx-comp"; comp._ta=ta;
    const bs=window.FLUXO?FLUXO.blocos(ta.value):[]; let nfx=0;
    for(const p of partes(ta.value)){
      if(p.t==="txt"){ const seg=document.createElement("textarea"); seg.className="fx-seg"; seg.rows=1; seg.value=p.v; seg.setAttribute("aria-label","Texto da anotação"); seg.placeholder=comp.children.length?"":(ta.placeholder||""); comp.appendChild(seg); }
      else { const b=bs.filter(x=>x.fx)[nfx], idx=bs.indexOf(b); nfx++;
        const d=document.createElement("div"); d.className="fx-bloco"; d.dataset.linha=p.linha; d.dataset.idx=idx;
        d.innerHTML=(b&&!b.falta?`<div class="fx-svg" data-src="${encodeURIComponent(b.codigo)}"><p class="muted" style="margin:0;font-size:13px">Desenhando fluxograma…</p></div>`:'<p class="muted" style="margin:0;font-size:13px">Fluxograma ainda não chegou neste aparelho (sincronizando).</p>')+
          `<div class="fx-bloco-b"><span>Fluxograma</span><button type="button" data-fxb="editar">Editar</button><button type="button" class="fx-rm" data-fxb="tirar">Remover</button></div>`;
        comp.appendChild(d); }
    }
    if(velho) velho.replaceWith(comp); else ta.after(comp);
    ta._comp=comp; ta.hidden=true; comp.hidden=!!(CHEIA&&CHEIA.ta===ta&&CHEIA.prev&&!CHEIA.prev.hidden);
    comp.querySelectorAll(".fx-seg").forEach(ajustar); requestAnimationFrame(()=>comp.querySelectorAll(".fx-seg").forEach(ajustar));
  }
  // Posição do cursor no texto completo (para inserir fluxograma onde o cursor está).
  function cursorDe(ta){
    const comp=ta._comp; if(!comp) return ta.selectionStart;
    const seg=comp._seg&&comp._seg.isConnected?comp._seg:[...comp.querySelectorAll(".fx-seg")].pop();
    const ps=[]; for(const el of comp.children){ if(el===seg){ const pre=ps.join("\n"); return pre.length+(ps.length?1:0)+seg.selectionStart; }
      if(el.classList.contains("fx-seg")){ if(el.value!=="") ps.push(el.value); } else ps.push(el.dataset.linha); }
    return ta.value.length;
  }
  function alvoDe(el){ const comp=el.closest&&el.closest(".fx-comp"); return comp?comp._ta:el; }
  function segAtivo(ta){ const c=ta._comp; if(!c) return ta; return c._seg&&c._seg.isConnected?c._seg:[...c.querySelectorAll(".fx-seg")].pop(); }
  document.addEventListener("focusin",e=>{ const t=e.target; if(t.classList&&t.classList.contains("fx-seg")) t.parentNode._seg=t; });
  document.addEventListener("input",e=>{
    const seg=e.target; if(!seg.classList||!seg.classList.contains("fx-seg")) return;
    ajustar(seg); const comp=seg.parentNode, ta=comp._ta; if(!ta) return;
    const v=serializar(comp); if(v!==ta.value){ ta.value=v; ta.dispatchEvent(new Event("input",{bubbles:true})); }
  });
  document.addEventListener("mousedown",e=>{ const c=e.target.classList&&e.target.classList.contains("fx-comp")?e.target:null; if(c){ e.preventDefault(); const s=[...c.querySelectorAll(".fx-seg")].pop(); s.focus(); s.selectionStart=s.value.length; } });
  document.addEventListener("click",e=>{
    const b=e.target.closest&&e.target.closest("[data-fxb]"); if(!b) return;
    const bloco=b.closest(".fx-bloco"), comp=bloco.parentNode, ta=comp._ta; if(!ta) return;
    if(b.dataset.fxb==="editar"){ fluxograma(ta, parseInt(bloco.dataset.idx,10)); return; }
    if(!b.dataset.conf){ b.dataset.conf="1"; b.textContent="Confirmar"; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.conf; b.textContent="Remover"; } },3000); return; }
    const m=bloco.dataset.linha.match(/\(fx:([A-Za-z0-9_-]+)\)/); bloco.remove();
    if(m&&typeof salvarDoc==="function") salvarDoc("fx-"+m[1],{tipo:"fx",apagado:true},50);
    ta.value=serializar(comp); ta.dispatchEvent(new Event("input",{bubbles:true})); montar(ta);
  });

  // Troca o trecho [a,b) por txt mantendo o "desfazer" (Ctrl+Z) e disparando o salvamento.
  function trocar(ta,a,b,txt,selA,selB){
    const doc=ta.ownerDocument, v=ta.value; ta.focus(); ta.setSelectionRange(a,b);
    if(!txt && a===b) return;
    let ok=false;
    try{ ok = txt ? doc.execCommand("insertText",false,txt) : doc.execCommand("delete"); }catch(e){}
    if(!ok){ ta.value=v.slice(0,a)+txt+v.slice(b); ta.dispatchEvent(new Event("input",{bubbles:true})); }
    ta.setSelectionRange(selA??a+txt.length, selB??selA??a+txt.length);
  }
  function envolver(ta,ini,fim,exemplo){
    const v=ta.value, a=ta.selectionStart, b=ta.selectionEnd, sel=v.slice(a,b);
    // já envolvido? tira
    if(v.slice(a-ini.length,a)===ini && v.slice(b,b+fim.length)===fim){ trocar(ta,a-ini.length,b+fim.length,sel,a-ini.length,b-ini.length); return; }
    if(sel.startsWith(ini)&&sel.endsWith(fim)&&sel.length>=ini.length+fim.length){ const s=sel.slice(ini.length,sel.length-fim.length); trocar(ta,a,b,s,a,a+s.length); return; }
    const s=sel||exemplo, t=ini+s+fim; trocar(ta,a,b,t,a+ini.length,a+ini.length+s.length);
  }
  // Linhas inteiras cobertas pela seleção
  function linhas(ta){
    const v=ta.value; let a=ta.selectionStart, b=ta.selectionEnd;
    a=v.lastIndexOf("\n",a-1)+1; if(b>a&&v[b-1]==="\n") b--; let e=v.indexOf("\n",b); if(e<0) e=v.length;
    return {a,b:e,ls:v.slice(a,e).split("\n")};
  }
  const RE_LISTA=/^(\s*)(- \[[ xX]\] |[-*] |\d+[.)] |> )/;
  function prefixar(ta,tipo){
    const {a,b,ls}=linhas(ta);
    const tem={lis:/^\s*[-*] (?!\[[ xX]\] )/, num:/^\s*\d+[.)] /, tar:/^\s*- \[[ xX]\] /, cit:/^> ?/}[tipo];
    const cheias=ls.filter(l=>l.trim());
    let novo;
    if(tipo==="tar" && cheias.length && cheias.every(l=>tem.test(l))){
      // alterna ☐ ↔ ☑
      const todas=cheias.every(l=>/^\s*- \[[xX]\] /.test(l));
      novo=ls.map(l=>l.replace(/^(\s*- \[)[ xX](\] )/,"$1"+(todas?" ":"x")+"$2"));
    } else if(cheias.length && cheias.every(l=>tem.test(l))){
      novo=ls.map(l=>l.replace(RE_LISTA,"$1"));            // tira
    } else {
      let n=0;
      novo=ls.map(l=>{ if(!l.trim()&&ls.length>1) return l; const m=l.match(/^(\s*)/)[1], r=l.slice(m.length).replace(RE_LISTA,"");
        const pre=tipo==="lis"?"- ":tipo==="num"?(++n)+". ":tipo==="tar"?"- [ ] ":"> ";
        return (tipo==="cit"?"":m)+pre+r; });
    }
    const t=novo.join("\n");
    if(ls.length===1) trocar(ta,a,b,t); else trocar(ta,a,b,t,a,a+t.length);
  }
  function titulo(ta){
    const {a,b,ls}=linhas(ta), l=ls[0], m=l.match(/^(#{1,3}) /);
    const n=m?m[1].length:0, r=l.replace(/^#{1,3} /,"");
    const t=(n===0?"# ":n===1?"## ":n===2?"### ":"")+r;
    trocar(ta,a,a+l.length,t,a+t.length);
  }
  function codigo(ta){
    const v=ta.value, a=ta.selectionStart, b=ta.selectionEnd, sel=v.slice(a,b);
    if(sel.includes("\n") || (!sel && (v.slice(v.lastIndexOf("\n",a-1)+1, (v.indexOf("\n",a)+1||v.length+1)-1).trim()===""))){
      const antes=a>0&&v[a-1]!=="\n"?"\n":"", s=sel||"código aqui", t=antes+"```\n"+s+"\n```\n";
      trocar(ta,a,b,t,a+antes.length+4,a+antes.length+4+s.length); return;
    }
    envolver(ta,"`","`","código");
  }
  function link(ta){
    const v=ta.value, a=ta.selectionStart, b=ta.selectionEnd, sel=v.slice(a,b).trim();
    if(/^https?:\/\/\S+$/.test(sel)){ const t=`[texto](${sel})`; trocar(ta,a,b,t,a+1,a+6); return; }
    // com texto selecionado: o cursor vai para o endereço; sem seleção: para o nome do link
    if(sel){ const t=`[${sel}](https://)`; trocar(ta,a,b,t,a+sel.length+3,a+sel.length+11); return; }
    trocar(ta,a,b,"[texto](https://)",a+1,a+6);
  }
  function divisoria(ta){
    const v=ta.value, a=ta.selectionStart, antes=a>0&&v[a-1]!=="\n"?"\n":"";
    trocar(ta,a,ta.selectionEnd,antes+"\n---\n\n");
  }
  // Abre o editor de fluxograma (fluxo.js) ligado a esta caixa de texto.
  function fluxograma(ta, idx){
    if(!window.FLUXO||!window.FLUXO.abrir){ return; }
    const sel=ta.id?"#"+ta.id:ta.dataset.dnota?`textarea[data-dnota="${ta.dataset.dnota}"]`:null;
    const achar=()=>ta.isConnected?ta:(sel&&document.querySelector(sel));
    window.FLUXO.abrir({ ta:achar,
      get:()=>{ const t=achar(); return t?t.value:ta.value; },
      set:v=>{ const t=achar(); if(!t) return; t.value=v; t.dispatchEvent(new Event("input",{bubbles:true})); montar(t); }
    }, idx==null?null:idx, idx==null?cursorDe(ta):null);
  }
  /* ---------- Imagens ----------
     A imagem é reduzida (lado maior até 1600 px) e enviada para a pasta privada "caderno"
     do Supabase Storage (a mesma dos Materiais). No texto fica só ![nome](sb:caminho);
     o Visualizar troca por um link temporário assinado. */
  const CURSO=(location.pathname.replace(/^\/+|\.html$/g,"").split("/")[0])||"caderno";
  const achador=ta=>{ const sel=ta.id?"#"+ta.id:ta.dataset.dnota?`textarea[data-dnota="${ta.dataset.dnota}"]`:null;
    return ()=>ta.isConnected?ta:(sel&&ta.ownerDocument.querySelector(sel)); };
  const aviso=t=>{ if(typeof toast==="function") toast(t); };
  const temConta=()=>typeof S==="object"&&S&&S.sb&&S.uid;
  async function prepararImagem(f){
    const bmp=await createImageBitmap(f), k=Math.min(1,1600/Math.max(bmp.width,bmp.height));
    const c=document.createElement("canvas"); c.width=Math.max(1,Math.round(bmp.width*k)); c.height=Math.max(1,Math.round(bmp.height*k));
    const g=c.getContext("2d"); g.fillStyle="#fff"; g.fillRect(0,0,c.width,c.height); g.drawImage(bmp,0,0,c.width,c.height);
    let b=await new Promise(r=>c.toBlob(r,"image/webp",0.85));
    if(!b||b.type!=="image/webp") b=await new Promise(r=>c.toBlob(r,"image/jpeg",0.85));
    return b;
  }
  async function enviarImagens(ta,files){
    const imgs=[...files].filter(f=>/^image\//.test(f.type));
    if(!imgs.length){ aviso("Escolha um arquivo de imagem (JPG, PNG, WebP…)."); return; }
    if(!navigator.onLine){ aviso("Sem internet: imagens só podem ser inseridas quando a conexão voltar. O texto continua salvando normalmente."); return; }
    if(!temConta()){ aviso(typeof CONVITE!=="undefined"&&CONVITE?"No link pessoal não dá para inserir imagens nas anotações. Use Materiais → Fotos.":"Entre na sua conta (botão Entrar) para inserir imagens: elas ficam guardadas na sua pasta privada."); return; }
    const achar=achador(ta), a=ta.selectionStart, b=ta.selectionEnd, partes=[];
    aviso(imgs.length>1?`Enviando ${imgs.length} imagens…`:"Enviando imagem…");
    for(const f of imgs){
      try{
        const blob=await prepararImagem(f), ext=blob.type==="image/webp"?"webp":"jpg";
        const path=S.uid+"/img-"+CURSO+"-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)+"."+ext;
        const {error}=await S.sb.storage.from("caderno").upload(path,blob,{contentType:blob.type,upsert:false});
        if(error) throw new Error(/bucket|not found/i.test(error.message)?"a pasta de arquivos não existe no Supabase":error.message);
        let nome=(f.name||"").replace(/\.[^.]+$/,"").replace(/[\[\]()]/g," ").trim().slice(0,60);
        if(!nome||/^image$/i.test(nome)) nome="imagem";
        partes.push(`![${nome}](sb:${path})`);
      }catch(e){ aviso("Não consegui enviar a imagem: "+(e.message||e)); }
    }
    if(!partes.length) return;
    const t=achar(); if(!t){ aviso("A anotação foi fechada antes do envio terminar."); return; }
    const v=t.value, ia=Math.min(a,v.length), ib=Math.min(Math.max(b,ia),v.length);
    const antes=ia>0&&v[ia-1]!=="\n"?"\n":"", depois=ib<v.length&&v[ib]==="\n"?"":"\n";
    trocar(t,ia,ib,antes+partes.join("\n")+depois);
    aviso(partes.length>1?"Imagens inseridas. Clique em Visualizar para ver.":"Imagem inserida. Clique em Visualizar para ver.");
  }
  function escolherImagem(ta){
    const inp=ta.ownerDocument.createElement("input"); inp.type="file"; inp.accept="image/*"; inp.multiple=true;
    inp.onchange=()=>{ if(inp.files.length) enviarImagens(ta,inp.files); }; inp.click();
  }
  // Mostra as imagens do Visualizar (links assinados válidos por 1 h, guardados por 50 min).
  const URLS=new Map();
  async function urlAssinada(path){
    const c=URLS.get(path); if(c&&c.ate>Date.now()) return c.url;
    const {data,error}=await S.sb.storage.from("caderno").createSignedUrl(path,3600); if(error) throw error;
    URLS.set(path,{url:data.signedUrl,ate:Date.now()+50*60e3}); return data.signedUrl;
  }
  function mostrarImagens(raiz){
    raiz.querySelectorAll("img[data-sb]:not([data-ok])").forEach(img=>{
      img.dataset.ok="1";
      const falhou=msg=>{ const s=img.ownerDocument.createElement("span"); s.className="md-img-x"; s.textContent="🖼 "+(img.alt||"imagem")+" · "+msg; img.replaceWith(s); };
      if(!temConta()){ falhou("entre na conta para ver"); return; }
      urlAssinada(img.dataset.sb).then(u=>{ img.src=u; }).catch(()=>falhou("não encontrada"));
    });
  }
  function aplicar(ta,k){
    ({neg:()=>envolver(ta,"**","**","negrito"), ita:()=>envolver(ta,"*","*","itálico"), mar:()=>envolver(ta,"==","==","destaque"),
      tit:()=>titulo(ta), lis:()=>prefixar(ta,"lis"), num:()=>prefixar(ta,"num"), tar:()=>prefixar(ta,"tar"), cit:()=>prefixar(ta,"cit"),
      cod:()=>codigo(ta), lnk:()=>link(ta), div:()=>divisoria(ta), img:()=>escolherImagem(ta), flx:()=>fluxograma(ta), cheia:()=>telaCheia(ta)})[k]();
  }
  // Enter continua a lista; Enter numa linha de lista vazia encerra a lista.
  function enter(ta,e){
    if(ta.selectionStart!==ta.selectionEnd) return;
    const v=ta.value, c=ta.selectionStart, ini=v.lastIndexOf("\n",c-1)+1, l=v.slice(ini,c);
    const m=l.match(/^(\s*)(- \[[ xX]\] |[-*] |(\d+)([.)]) |> )/); if(!m) return;
    e.preventDefault();
    if(l.trim()===m[0].trim() && v.slice(c,(v.indexOf("\n",c)+1||v.length+1)-1).trim()===""){ trocar(ta,ini,c,""); return; }
    const pre=m[3]?m[1]+(+m[3]+1)+m[4]+" ":m[2].startsWith("- [")?m[1]+"- [ ] ":m[1]+m[2];
    trocar(ta,c,c,"\n"+pre);
  }
  // ---- Tela cheia: leva a barra e a caixa de texto para uma tela só delas; ao sair, devolvem ao lugar. ----
  let CHEIA=null;
  function tituloDe(ta){
    const lb=ta.id&&ta.ownerDocument.querySelector(`label[for="${ta.id}"]`);
    const pane=ta.closest(".pane"), h=pane&&pane.querySelector("header h3");
    const nome=ta.id==="ntxt"?(ta.ownerDocument.getElementById("ntit")||{}).value:"";
    const txt=el=>{ if(!el) return ""; const c=el.cloneNode(true); c.querySelectorAll("button").forEach(x=>x.remove()); return c.textContent; };
    return (nome||txt(h)||txt(lb)||"Anotação").replace(/\s+/g," ").trim();
  }
  function contar(){ if(!CHEIA) return; const v=CHEIA.ta.value; const p=(v.match(/\S+/g)||[]).length; CHEIA.n.textContent=p+" palavra"+(p===1?"":"s"); }
  function telaCheia(ta){
    if(CHEIA){ sairCheia(); return; }
    const doc=ta.ownerDocument, bar=ta.previousElementSibling&&ta.previousElementSibling.classList.contains("fmt")?ta.previousElementSibling:null;
    const marca=doc.createComment("tela-cheia"); (bar||ta).before(marca);
    const ov=doc.createElement("div"); ov.className="fmt-cheia"; ov.setAttribute("role","dialog"); ov.setAttribute("aria-label","Anotação em tela cheia");
    ov.innerHTML=`<header><span class="fc-t"></span><span class="fc-n"></span><button type="button" data-fc="ver">Visualizar</button><button type="button" data-fc="sair">Sair da tela cheia</button></header><div class="fc-b"></div>`;
    ov.querySelector(".fc-t").textContent=tituloDe(ta);
    const corpo=ov.querySelector(".fc-b"); if(bar) corpo.appendChild(bar); corpo.appendChild(ta); if(ta._comp) corpo.appendChild(ta._comp);
    const prev=doc.createElement("div"); prev.className="md fc-prev"; prev.hidden=true; corpo.appendChild(prev);
    doc.body.appendChild(ov); doc.body.style.overflow="hidden";
    CHEIA={ta,bar,marca,ov,prev,n:ov.querySelector(".fc-n"),fs:false};
    const btc=bar&&bar.querySelector('[data-fmt=cheia] .fmt-tx'); if(btc) btc.textContent="Sair";
    contar(); reajustar(ta); segAtivo(ta).focus();
    const de=doc.documentElement;
    if(de.requestFullscreen && !doc.fullscreenElement && matchMedia("(min-width:821px)").matches){ de.requestFullscreen().then(()=>{ if(CHEIA) CHEIA.fs=true; }).catch(()=>{}); }
  }
  function sairCheia(){
    if(!CHEIA) return; const {ta,bar,marca,ov,fs}=CHEIA, doc=ov.ownerDocument; CHEIA=null;
    const btc=bar&&bar.querySelector('[data-fmt=cheia] .fmt-tx'); if(btc) btc.textContent="Tela cheia";
    ta.hidden=!!ta._comp; if(ta._comp) ta._comp.hidden=false; if(bar) bar.hidden=false;
    if(marca.isConnected){ if(bar) marca.before(bar); marca.before(ta); if(ta._comp) ta.after(ta._comp); marca.remove(); ov.remove(); reajustar(ta); segAtivo(ta).focus(); }
    else { ov.remove(); if(typeof render==="function") try{ render(); }catch(e){} if(typeof renderPane==="function"&&typeof PANE!=="undefined"&&PANE) try{ renderPane(); }catch(e){} }
    doc.body.style.overflow="";
    if(fs && doc.fullscreenElement && doc.exitFullscreen) doc.exitFullscreen().catch(()=>{});
  }
  function verCheia(){
    if(!CHEIA) return; const {ta,bar,prev,ov}=CHEIA, b=ov.querySelector('[data-fc="ver"]');
    const mostrar=prev.hidden;
    if(mostrar){ prev.innerHTML= typeof md==="function"? md(ta.value) : ""; if(!prev.innerHTML) prev.textContent=ta.value; mostrarImagens(ov.ownerDocument); }
    prev.hidden=!mostrar; if(ta._comp){ ta.hidden=true; ta._comp.hidden=mostrar; } else ta.hidden=mostrar; if(bar) bar.hidden=mostrar; b.textContent=mostrar?"Editar":"Visualizar";
    if(!mostrar){ reajustar(ta); segAtivo(ta).focus(); }
  }
  document.addEventListener("click",e=>{ const b=e.target.closest&&e.target.closest(".fmt-cheia [data-fc]"); if(!b) return; if(b.dataset.fc==="sair") sairCheia(); else verCheia(); });
  document.addEventListener("input",e=>{ if(CHEIA&&e.target===CHEIA.ta) contar(); });
  document.addEventListener("keydown",e=>{ if(CHEIA&&e.key==="Escape"&&!document.querySelector(".fx-ed,.pop")){ e.preventDefault(); e.stopImmediatePropagation(); sairCheia(); } },true);
  document.addEventListener("fullscreenchange",()=>{ if(CHEIA&&CHEIA.fs&&!document.fullscreenElement){ CHEIA.fs=false; sairCheia(); } });

  function ligar(doc){
    if(doc.__fmt) return; doc.__fmt=true;
    // mousedown sem tirar o foco da caixa de texto
    doc.addEventListener("mousedown",e=>{ if(e.target.closest(".fmt button")) e.preventDefault(); });
    doc.addEventListener("click",e=>{
      const bt=e.target.closest(".fmt button[data-fmt]"); if(!bt) return;
      let ta=bt.closest(".fmt").nextElementSibling; if(!ta||ta.tagName!=="TEXTAREA") return;
      const k=bt.dataset.fmt;
      aplicar(k==="flx"||k==="cheia"?ta:segAtivo(ta),k);
    });
    doc.addEventListener("keydown",e=>{
      const ta=e.target; if(!ta.matches||!ta.matches(ALVOS+",textarea.fx-seg")) return;
      if(e.key==="Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && !e.isComposing){ enter(ta,e); return; }
      if(!(e.ctrlKey||e.metaKey) || e.altKey) return;
      const k=e.key.toLowerCase();
      const mapa=e.shiftKey?{x:"tar"}:{b:"neg",i:"ita",k:"lnk"};
      if(mapa[k]){ e.preventDefault(); aplicar(ta,mapa[k]); }
    });
    // colar (Ctrl+V) ou arrastar imagem para a caixa de texto
    doc.addEventListener("paste",e=>{
      const ta=e.target; if(!ta.matches||!ta.matches(ALVOS+",textarea.fx-seg")) return;
      const fs=[...(e.clipboardData&&e.clipboardData.files||[])].filter(f=>/^image\//.test(f.type));
      if(fs.length){ e.preventDefault(); enviarImagens(ta,fs); }
    });
    doc.addEventListener("dragover",e=>{ const ta=e.target.closest&&e.target.closest(ALVOS+",textarea.fx-seg"); if(ta&&e.dataTransfer&&[...e.dataTransfer.types].includes("Files")){ e.preventDefault(); ta.classList.add("fmt-drop"); } });
    doc.addEventListener("dragleave",e=>{ const ta=e.target.closest&&e.target.closest(ALVOS+",textarea.fx-seg"); if(ta) ta.classList.remove("fmt-drop"); });
    doc.addEventListener("drop",e=>{
      const ta=e.target.closest&&e.target.closest(ALVOS+",textarea.fx-seg"); if(!ta) return; ta.classList.remove("fmt-drop");
      const fs=[...(e.dataTransfer&&e.dataTransfer.files||[])].filter(f=>/^image\//.test(f.type));
      if(fs.length){ e.preventDefault(); ta.focus(); enviarImagens(ta,fs); }
    });
    doc.addEventListener("click",e=>{ const im=e.target.closest&&e.target.closest("img.md-img[src]"); if(im) window.open(im.src,"_blank","noopener"); });
    equipar(doc); mostrarImagens(doc);
    new MutationObserver(()=>{ equipar(doc); mostrarImagens(doc); }).observe(doc.body,{childList:true,subtree:true});
  }
  ligar(document);
  // Janela "por cima de outras janelas" do bloco flutuante (Picture-in-Picture)
  if(typeof window.ligarFlutuante==="function"){
    const orig=window.ligarFlutuante;
    window.ligarFlutuante=function(doc){ orig(doc); if(doc!==document){ const s=doc.createElement("style"); s.textContent=CSS; doc.head.appendChild(s); ligar(doc); } };
  }
  window.FORMATO={aplicar, equipar, ligar, enviarImagens, mostrarImagens, telaCheia, sairCheia, montar, cursorDe};
})();
