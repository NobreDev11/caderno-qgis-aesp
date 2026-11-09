/* ============ BARRA DE FORMATAÇÃO RÁPIDA ============
   Aparece em cima das caixas de anotação (painel do item/aula, anotação rápida do Hoje,
   anotações de fase/disciplina, notas do caderno e bloco flutuante).
   Só escreve Markdown simples no texto; o "Visualizar" (md()) desenha o resultado.
   Atalhos: Ctrl+B negrito, Ctrl+I itálico, Ctrl+K link, Ctrl+Shift+X tarefa ☐,
   Enter continua a lista (Enter numa linha de lista vazia encerra a lista). */
(function(){
  const ALVOS='#qnota,#pnota,#ntxt,#fl-txt,textarea[data-dnota]';
  const BOTOES=[
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
.fmt{width:0;min-width:100%;box-sizing:border-box;display:flex;gap:2px;align-items:center;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;padding:3px;margin:0 0 4px;border:1px solid var(--line);border-radius:8px;background:var(--surface);flex:none}
.fmt::-webkit-scrollbar{display:none}
.fmt button{flex:none;min-width:30px;height:28px;padding:0 7px;border:0;border-radius:6px;background:transparent;color:var(--ink,inherit);cursor:pointer;font-size:13.5px;line-height:1}
.fmt button:hover{background:var(--accent-soft)}
.fmt button:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.fmt .fmt-sep{flex:none;width:1px;height:18px;background:var(--line);margin:0 3px}
.fmt [data-fmt=flx],.fmt [data-fmt=img]{display:inline-flex;align-items:center;gap:5px;color:var(--accent)}
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
    d.innerHTML=BOTOES.filter(([k])=>!(pip&&k==="flx")).map(([k,h,t],i)=>(i===3||i===7||k==="img"?'<span class="fmt-sep"></span>':"")+`<button type="button" data-fmt="${k}" title="${t}" aria-label="${t}">${h}</button>`).join("");
    return d;
  }
  function equipar(raiz){
    raiz.querySelectorAll(ALVOS).forEach(ta=>{
      if(ta.dataset.fmtOk) return; ta.dataset.fmtOk="1";
      const p=ta.previousElementSibling; if(p&&p.classList.contains("fmt")) return;
      ta.parentNode.insertBefore(barra(ta.ownerDocument),ta);
    });
  }

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
  function fluxograma(ta){
    if(!window.FLUXO||!window.FLUXO.abrir){ return; }
    const sel=ta.id?"#"+ta.id:ta.dataset.dnota?`textarea[data-dnota="${ta.dataset.dnota}"]`:null;
    const achar=()=>ta.isConnected?ta:(sel&&document.querySelector(sel));
    window.FLUXO.abrir({ ta:achar,
      get:()=>{ const t=achar(); return t?t.value:ta.value; },
      set:v=>{ const t=achar(); if(!t) return; t.value=v; t.dispatchEvent(new Event("input",{bubbles:true})); }
    }, null, ta.selectionStart);
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
      cod:()=>codigo(ta), lnk:()=>link(ta), div:()=>divisoria(ta), img:()=>escolherImagem(ta), flx:()=>fluxograma(ta)})[k]();
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
  function ligar(doc){
    if(doc.__fmt) return; doc.__fmt=true;
    // mousedown sem tirar o foco da caixa de texto
    doc.addEventListener("mousedown",e=>{ if(e.target.closest(".fmt button")) e.preventDefault(); });
    doc.addEventListener("click",e=>{
      const bt=e.target.closest(".fmt button[data-fmt]"); if(!bt) return;
      let ta=bt.closest(".fmt").nextElementSibling; if(!ta||ta.tagName!=="TEXTAREA") return;
      aplicar(ta,bt.dataset.fmt);
    });
    doc.addEventListener("keydown",e=>{
      const ta=e.target; if(!ta.matches||!ta.matches(ALVOS)) return;
      if(e.key==="Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && !e.isComposing){ enter(ta,e); return; }
      if(!(e.ctrlKey||e.metaKey) || e.altKey) return;
      const k=e.key.toLowerCase();
      const mapa=e.shiftKey?{x:"tar"}:{b:"neg",i:"ita",k:"lnk"};
      if(mapa[k]){ e.preventDefault(); aplicar(ta,mapa[k]); }
    });
    // colar (Ctrl+V) ou arrastar imagem para a caixa de texto
    doc.addEventListener("paste",e=>{
      const ta=e.target; if(!ta.matches||!ta.matches(ALVOS)) return;
      const fs=[...(e.clipboardData&&e.clipboardData.files||[])].filter(f=>/^image\//.test(f.type));
      if(fs.length){ e.preventDefault(); enviarImagens(ta,fs); }
    });
    doc.addEventListener("dragover",e=>{ const ta=e.target.closest&&e.target.closest(ALVOS); if(ta&&e.dataTransfer&&[...e.dataTransfer.types].includes("Files")){ e.preventDefault(); ta.classList.add("fmt-drop"); } });
    doc.addEventListener("dragleave",e=>{ const ta=e.target.closest&&e.target.closest(ALVOS); if(ta) ta.classList.remove("fmt-drop"); });
    doc.addEventListener("drop",e=>{
      const ta=e.target.closest&&e.target.closest(ALVOS); if(!ta) return; ta.classList.remove("fmt-drop");
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
  window.FORMATO={aplicar, equipar, ligar, enviarImagens, mostrarImagens};
})();
