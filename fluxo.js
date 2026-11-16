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
// Descrição da etapa (Markdown simples da barra de formatação) → rótulo do Mermaid: negrito, itálico, destaque, listas e quebras de linha.
function mdRotulo(t){
  return String(t||"").split(/\r?\n/).map(l=>l.replace(/^\s*#{1,3}\s+/,"").replace(/^(\s*)[-*]\s+(?:\[[ xX]\]\s*)?/,(x,sp)=>(sp.length>=2?"&nbsp;&nbsp;":"")+"• ").replace(/^>\s?/,""))
    .filter(l=>l.trim()).map(l=>l.replace(/"/g,"'").replace(/!\[[^\]]*\]\([^)]*\)/g,"").replace(/\[([^\]]+)\]\([^)]*\)/g,"$1").replace(/</g,"#lt;").replace(/>/g,"#gt;")
      .replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>").replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\*)/g,"$1<i>$2</i>").replace(/==([^=]+)==/g,"<u>$1</u>").replace(/`([^`]+)`/g,"$1")
      .replace(/\{\{([^{}]+)\}\}|\(\(([^()]+)\)\)/g,(x,a,b)=>a||b).replace(/&lt;|&gt;/g,""))
    .join("<br/>");
}
// Setas: tipo (seta, pontilhada, grossa, dupla, linha, invisível), comprimento 1–3 e curva própria; no fluxograma, curva e espaçamento padrão.
const TIPOS_SETA={seta:"→ Seta",pont:"⇢ Pontilhada",grossa:"⇒ Grossa",dupla:"↔ Dupla",linha:"— Sem ponta",invis:"Invisível (só posiciona)"};
const CURVAS={basis:"Curvas suaves",linear:"Retas",step:"Em ângulo reto"};
const ESPACOS={compacto:"Compacto",normal:"Normal",amplo:"Amplo"};
function opSeta(g){ const n=Math.max(1,Math.min(3,parseInt(g.tam,10)||1)), x=k=>k.repeat(n-1);
  return {seta:"--"+x("-")+">", pont:"-."+x(".")+"->", grossa:"=="+x("=")+">", dupla:"<--"+x("-")+">", linha:"---"+x("-"), invis:"~~~"+x("~")}[g.tipo||"seta"]||"-->"; }
const grupoNorm=g=>String(g||"").replace(/["\[\]]/g,"").trim();
function gruposDe(m){ const v=[]; (m.nos||[]).forEach(n=>{ const g=grupoNorm(n.grupo); if(g&&!v.includes(g)) v.push(g); }); return v; }
function paraMermaid(m){
  const l=["flowchart "+(m.dir==="LR"?"LR":"TD")];
  const cfg={}; if(m.curva&&m.curva!=="basis") cfg.curve=m.curva;
  const E={compacto:[28,32],amplo:[85,95]}[m.esp]; if(E){ cfg.nodeSpacing=E[0]; cfg.rankSpacing=E[1]; }
  if(Object.keys(cfg).length) l.unshift('%%{init: {"flowchart": '+JSON.stringify(cfg)+'}}%%');
  const comDesc=m.descNo!==false;
  const def=n=>{ const f=FORMAS[n.forma]||FORMAS.etapa, dsc=comDesc&&String(n.desc||"").trim(); return n.id+f.a+limpa(n.texto)+(dsc?"<br/><small>"+mdRotulo(dsc)+"</small>":"")+f.b; };
  // Grupos: etapas com o mesmo grupo ficam juntas numa coluna/bloco (subgraph), com ou sem moldura
  const grupos=m.grInv?gruposDe(m).reverse():gruposDe(m), estilos=[];
  grupos.forEach((g,gi)=>{ const gid="G"+(gi+1); l.push("  subgraph "+gid+'["'+limpa(g)+'"]'); l.push("    direction "+(m.dir==="LR"?"LR":"TB"));
    m.nos.filter(n=>grupoNorm(n.grupo)===g).forEach(n=>l.push("    "+def(n))); l.push("  end");
    if(m.molduras===false) estilos.push("  style "+gid+" fill:transparent,stroke:transparent,color:transparent"); });
  for(const n of m.nos) if(!grupoNorm(n.grupo)) l.push("  "+def(n));
  const ids=new Set(m.nos.map(n=>n.id));
  const extra=[], topo=m.topo!==false&&m.nos[0]?m.nos[0].id:null;
  // 1ª etapa sempre no topo: ligações invisíveis dela para cada grupo e para as caixas soltas sem seta chegando
  if(topo){ grupos.forEach((g,gi)=>{ if(grupoNorm(m.nos[0].grupo)!==g) extra.push("  "+topo+" ~~~ G"+(gi+1)); });
    m.nos.slice(1).forEach(n=>{ if(!grupoNorm(n.grupo)&&!m.ligs.some(g=>g.para===n.id&&g.de!==n.id)) extra.push("  "+topo+" ~~~ "+n.id); }); }
  m.ligs.forEach((g,i)=>{ if(!ids.has(g.de)||!ids.has(g.para)) return; const r=g.tipo==="invis"?"":String(g.rot||"").replace(/["|]/g,"").trim(), op=opSeta(g);
    // "volta": a seta aparece de "de" para "para", mas o desenho a trata ao contrário — não puxa a caixa de destino para baixo
    const volta=(!!g.volta||(topo&&g.para===topo&&g.de!==topo))&&g.tipo!=="invis"&&g.tipo!=="dupla"&&g.tipo!=="linha", eid=(g.curva||volta)&&g.tipo!=="invis"?"e"+i+"@":"";
    l.push("  "+(volta?g.para:g.de)+" "+eid+op+(r?'|"'+r+'"|':"")+" "+(volta?g.de:g.para));
    if(g.curva&&eid) extra.push("  e"+i+"@{ curve: "+g.curva+" }"); if(volta) extra.push("  %% volta e"+i); });
  l.push(...extra,...estilos);
  if(m.livre&&m.pos) l.push("%% livre "+JSON.stringify(m));
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
  const mdh=t=>typeof md==="function"?md(t):escH(t).replace(/\n/g,"<br>");
  return { desc: desc?`<div class="fx-desc md">${mdh(desc)}</div>`:"",
    lista: nos.length&&m.descNo===false?`<details class="fx-det"><summary>Descrição das etapas (${nos.length})</summary><ol>${nos.map(x=>`<li value="${x.i+1}"><b>${escH(x.n.texto||"(sem texto)")}</b> <span class="fx-fm">${escH((FORMAS[x.n.forma]||FORMAS.etapa).nome)}</span><div class="md">${mdh(x.n.desc.trim())}</div></li>`).join("")}</ol></details>`:"" };
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

/* ---- Desenho livre: caixas posicionadas à mão (arrastar na prévia); setas se ajustam sozinhas ---- */
// m.livre=true e m.pos={id:{x,y}} (centro da caixa). Guardado também no código, numa linha "%% livre {...}" (o Mermaid ignora).
const _cv=document.createElement("canvas").getContext("2d");
function medir(t,px,peso){ _cv.font=(peso||400)+" "+px+"px "+(getComputedStyle(document.body).fontFamily||"sans-serif"); return _cv.measureText(t).width; }
function quebrar(t,px,max,peso){ const out=[]; String(t||"").split("\n").forEach(par=>{ let l=""; par.split(/\s+/).filter(Boolean).forEach(w=>{ const n=l?l+" "+w:w; if(l&&medir(n,px,peso)>max){ out.push(l); l=w; } else l=n; }); out.push(l); }); return out.filter((x,i,a)=>x||a.length===1); }
const semMd=t=>String(t||"").split(/\r?\n/).map(l=>l.replace(/^\s*#{1,3}\s+/,"").replace(/^(\s*)[-*]\s+(?:\[[ xX]\]\s*)?/,"• ").replace(/^>\s?/,"").replace(/!\[[^\]]*\]\([^)]*\)/g,"").replace(/\[([^\]]+)\]\([^)]*\)/g,"$1").replace(/\*\*|==|`/g,"").replace(/(^|\s)\*(\S)/g,"$1$2").replace(/(\S)\*(\s|$)/g,"$1$2").replace(/\{\{([^{}]+)\}\}|\(\(([^()]+)\)\)/g,(x,a,b)=>a||b)).filter(l=>l.trim()).join("\n");
function caixa(n,comDesc){
  const tl=quebrar(n.texto||" ",15,200), dl=comDesc&&String(n.desc||"").trim()?quebrar(semMd(n.desc),12.5,210):[];
  const w0=Math.max(...tl.map(l=>medir(l,15)),...dl.map(l=>medir(l,12.5)),40), h0=tl.length*19+(dl.length?dl.length*16+4:0);
  let w=Math.max(100,w0+34), h=Math.max(44,h0+24);
  if(n.forma==="decisao"){ w=w*1.45; h=h*1.55; } if(n.forma==="dado") w+=24; if(n.forma==="sub") w+=16; if(n.forma==="nota") w+=14; if(n.forma==="inicio") w+=14;
  return {w:Math.round(w),h:Math.round(h),tl,dl};
}
function formaSVG(f,w,h){ const x=-w/2,y=-h/2;
  if(f==="inicio") return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}"/>`;
  if(f==="decisao") return `<polygon points="0,${y} ${w/2},0 0,${h/2} ${x},0"/>`;
  if(f==="dado") return `<polygon points="${x+14},${y} ${w/2},${y} ${w/2-14},${h/2} ${x},${h/2}"/>`;
  if(f==="sub") return `<rect x="${x}" y="${y}" width="${w}" height="${h}"/><line x1="${x+8}" y1="${y}" x2="${x+8}" y2="${h/2}"/><line x1="${w/2-8}" y1="${y}" x2="${w/2-8}" y2="${h/2}"/>`;
  if(f==="nota") return `<polygon points="${x},${y} ${w/2},${y} ${w/2},${h/2} ${x},${h/2} ${x+12},0"/>`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`;
}
// Cores iguais às do desenho automático (Mermaid, tema claro/escuro)
function corLivre(){ return escuro()
  ? {no:"#1f2020",nb:"#cccccc",tx:"#cccccc",d:"#b8b8b8",s:"#d3d3d3",lb:"#585858",lt:"#e6e6e6",gf:"#474949",gb:"rgba(255,255,255,.25)",gt:"#f9fffe",dec:"#1f2020"}
  : {no:"#ECECFF",nb:"#9370DB",tx:"#333333",d:"#555555",s:"#333333",lb:"rgba(232,232,232,.92)",lt:"#333333",gf:"#ffffde",gb:"#aaaa33",gt:"#333333",dec:"#ECECFF"}; }
// Lados de saída/chegada de cada seta pela posição das caixas; várias setas no mesmo lado são espalhadas.
function ladosSeta(a,b){ const dx=b.x-a.x, dy=b.y-a.y;
  if(Math.abs(dy)>(a.h+b.h)/2+16||Math.abs(dy)>Math.abs(dx)*0.6) return dy>0?["b","t"]:["t","b"];
  return dx>0?["r","l"]:["l","r"]; }
const NORMAL={b:[0,1],t:[0,-1],l:[-1,0],r:[1,0]};
function porta(c,lado,f){ // f entre 0 e 1 ao longo do lado
  if(lado==="b"||lado==="t"){ const span=c.forma==="decisao"?0:c.w*0.7; return [c.x-span/2+span*f, c.y+(lado==="b"?c.h/2:-c.h/2)]; }
  const span=c.forma==="decisao"?0:c.h*0.6; return [c.x+(lado==="r"?c.w/2:-c.w/2), c.y-span/2+span*f]; }
// ponto na borda da caixa na direção (dx,dy)
function borda(c,dx,dy){ const hw=c.w/2, hh=c.h/2; if(!dx&&!dy) return [0,hh];
  if(c.forma==="decisao"){ const k=1/(Math.abs(dx)/hw+Math.abs(dy)/hh); return [dx*k,dy*k]; }
  const k=Math.min(dx?hw/Math.abs(dx):1e9, dy?hh/Math.abs(dy):1e9); return [dx*k,dy*k]; }
// mesma curva do desenho automático (d3 curveBasis)
function curvaBasis(P){ if(P.length<2) return ""; if(P.length===2) return `M${P[0][0]},${P[0][1]} L${P[1][0]},${P[1][1]}`;
  let d=`M${P[0][0]},${P[0][1]}`, [x0,y0]=P[0], [x1,y1]=P[0];
  const bz=(x,y)=>`C${(2*x0+x1)/3},${(2*y0+y1)/3} ${(x0+2*x1)/3},${(y0+2*y1)/3} ${(x0+4*x1+x)/6},${(y0+4*y1+y)/6}`;
  P.slice(1).forEach(([x,y],i)=>{ if(i===0){ x0=x1; y0=y1; x1=x; y1=y; return; } if(i===1) d+=` L${(5*x0+x1)/6},${(5*y0+y1)/6}`; d+=" "+bz(x,y); x0=x1; y0=y1; x1=x; y1=y; });
  d+=" "+bz(x1,y1)+` L${x1},${y1}`; return d; }
function cantos(pts,r){ // polilinha com cantos arredondados
  let d=`M${pts[0][0]},${pts[0][1]}`;
  for(let i=1;i<pts.length-1;i++){ const [x0,y0]=pts[i-1],[x1,y1]=pts[i],[x2,y2]=pts[i+1];
    const l1=Math.hypot(x1-x0,y1-y0), l2=Math.hypot(x2-x1,y2-y1), k=Math.min(r,l1/2,l2/2);
    if(!k){ d+=` L${x1},${y1}`; continue; }
    d+=` L${x1-(x1-x0)/l1*k},${y1-(y1-y0)/l1*k} Q${x1},${y1} ${x1+(x2-x1)/l2*k},${y1+(y2-y1)/l2*k}`; }
  const u=pts[pts.length-1]; return d+` L${u[0]},${u[1]}`; }
function svgLivre(m, vbFixo, alcas, guias){
  const comDesc=m.descNo!==false, pos=m.pos||{}, C={}, K=corLivre();
  m.nos.forEach((n,i)=>{ const c=caixa(n,comDesc), p=pos[n.id]||{x:120+(i%3)*240,y:60+Math.floor(i/3)*140}; C[n.id]={...c,x:p.x,y:p.y,forma:n.forma,n}; });
  const esc2=escH, G=[];
  gruposDe(m).forEach(g=>{ const ms=m.nos.filter(n=>grupoNorm(n.grupo)===g).map(n=>C[n.id]); if(!ms.length) return;
    G.push({g,x1:Math.min(...ms.map(c=>c.x-c.w/2))-20,x2:Math.max(...ms.map(c=>c.x+c.w/2))+20,y1:Math.min(...ms.map(c=>c.y-c.h/2))-34,y2:Math.max(...ms.map(c=>c.y+c.h/2))+20}); });
  // setas como no desenho automático: saem da borda na direção do caminho, passam por um ponto intermediário
  // (perto da caixa de destino) e entram de frente nela; desviam de caixas no caminho por um corredor lateral.
  const vis=m.ligs.map((g,i)=>({g,i,a:C[g.de],b:C[g.para]})).filter(e=>e.a&&e.b&&e.g.tipo!=="invis"&&e.a!==e.b);
  const par={}, usado={}; vis.forEach(({g})=>{ const k=[g.de,g.para].sort().join("|"); par[k]=(par[k]||0)+1; });
  const curvaP=m.curva||"basis", faixa={l:0,r:0}, rotulos=[];
  const bloqueia=(p,q,a,b)=>Object.values(C).filter(c=>{ if(c===a||c===b) return false; const L=c.x-c.w/2-10,R=c.x+c.w/2+10,T=c.y-c.h/2-10,B=c.y+c.h/2+10;
    for(let k=1;k<24;k++){ const t=k/24, x=p[0]+(q[0]-p[0])*t, y=p[1]+(q[1]-p[1])*t; if(x>L&&x<R&&y>T&&y<B) return true; } return false; });
  const setas=vis.map(e=>{ const g=e.g, a=e.a, b=e.b, cv=g.curva||curvaP, dx=b.x-a.x, dy=b.y-a.y;
    const k=[g.de,g.para].sort().join("|"), j=usado[k]=(usado[k]===undefined?0:usado[k]+1), off=(j-(par[k]-1)/2)*26*(g.de<g.para?1:-1);
    const vert=Math.abs(dy)>(a.h+b.h)/2+10||Math.abs(dy)>Math.abs(dx);
    let way;
    if(vert){ const ya=a.y+Math.sign(dy)*a.h/2, yb=b.y-Math.sign(dy)*b.h/2; way=[[a.x+dx*0.72+off,(ya+yb)/2]]; }
    else { const xa=a.x+Math.sign(dx)*a.w/2, xb=b.x-Math.sign(dx)*b.w/2; way=[[(xa+xb)/2,a.y+dy*0.72+off]]; }
    const via=g.via&&isFinite(g.via.x)&&isFinite(g.via.y)?[g.via.x,g.via.y]:null; if(via) way=[via];
    const bs=via?[]:bloqueia([a.x,a.y],way[0],a,b).concat(bloqueia(way[0],[b.x,b.y],a,b));
    if(bs.length){ const R=Math.max(...bs.map(c=>c.x+c.w/2),a.x,b.x)+30, L=Math.min(...bs.map(c=>c.x-c.w/2),a.x,b.x)-30, dir=Math.sign(dy)||1;
      const lado=(Math.abs(R-a.x)+Math.abs(R-b.x))<=(Math.abs(L-a.x)+Math.abs(L-b.x))?"r":"l", lane=lado==="r"?R+faixa.r++*16:L-faixa.l++*16;
      const yIni=a.y+dir*(a.h/2+18), yFim=b.y-dir*(b.h/2+18); way=[[lane,yIni],[lane,yFim]]; }
    // pontas: na direção do caminho, ou no ponto da borda escolhido arrastando (g.pIni / g.pFim, relativos ao centro)
    const ok=v=>v&&isFinite(v.dx)&&isFinite(v.dy)&&(v.dx||v.dy);
    const ini=ok(g.pIni)?borda(a,g.pIni.dx,g.pIni.dy):borda(a,way[0][0]-a.x,way[0][1]-a.y), fim=ok(g.pFim)?borda(b,g.pFim.dx,g.pFim.dy):borda(b,way[way.length-1][0]-b.x,way[way.length-1][1]-b.y);
    // a seta sai e entra de frente para o lado da caixa onde está a ponta (trecho curto perpendicular à borda)
    const nrm=(c,o)=>c.forma==="decisao"?(()=>{ const L=Math.hypot(o[0],o[1])||1; return [o[0]/L,o[1]/L]; })():(Math.abs(o[0])/(c.w/2)>=Math.abs(o[1])/(c.h/2)?[Math.sign(o[0])||1,0]:[0,Math.sign(o[1])||1]);
    const A=[a.x+ini[0],a.y+ini[1]], B=[b.x+fim[0],b.y+fim[1]], na=nrm(a,ini), nb=nrm(b,fim), LD=24, A1=[A[0]+na[0]*LD,A[1]+na[1]*LD], B1=[B[0]+nb[0]*LD,B[1]+nb[1]*LD];
    if(!via&&!bs.length&&(ok(g.pIni)||ok(g.pFim))) way=[[(A1[0]+B1[0])/2+(vert?dx*0.22:0),(A1[1]+B1[1])/2+(vert?0:dy*0.22)]];
    const P=cv==="linear"?[A,...way,B]:[A,A1,...way,B1,B];
    let d; if(cv==="linear") d="M"+P.map(p=>p.join(",")).join(" L");
    else if(cv==="step"){ const Q=[P[0]]; for(let i=1;i<P.length;i++){ const [px,py]=Q[Q.length-1], [x,y]=P[i]; if(px!==x&&py!==y) Q.push(vert?[px,y]:[x,py]); Q.push([x,y]); } d=cantos(Q,8); }
    else d=curvaBasis(P);
    // ponto do meio que fica EM CIMA da curva (B-spline passa por (P[k-1]+4P[k]+P[k+1])/6)
    const naCurva=(k)=>cv==="basis"?[(P[k-1][0]+4*P[k][0]+P[k+1][0])/6,(P[k-1][1]+4*P[k][1]+P[k+1][1])/6]:P[k];
    const kM=cv==="linear"?1:2, viz=cv==="basis"&&way.length===1?[P[kM-1],P[kM+1]]:null;
    let [lx,ly]=way.length>1?[(way[0][0]+way[1][0])/2,(way[0][1]+way[1][1])/2]:naCurva(kM);
    const t=g.tipo||"seta", w=t==="grossa"?3.5:2, dash=t==="pont"?' stroke-dasharray="3 4"':"";
    const mf=t==="linha"?"":' marker-end="url(#fxl-pt)"', mi=t==="dupla"?' marker-start="url(#fxl-pt)"':"";
    const rot=String(g.rot||"").trim(), rw=rot?medir(rot,13)+10:0;
    if(rot&&!via){ for(let n=0;n<6&&rotulos.some(r=>Math.abs(r[0]-lx)<(r[2]+rw)/2+4&&Math.abs(r[1]-ly)<22);n++) ly+=22; } if(rot) rotulos.push([lx,ly,rw]);
    const pontas=alcas?[["a",P[0],ok(g.pIni)],["b",P[P.length-1],ok(g.pFim)]].map(([q,pt,fx])=>`<rect class="fxl-ponta${fx?" fixa":""}" data-ponta="${e.i}:${q}" x="${pt[0]-5}" y="${pt[1]-5}" width="10" height="10" rx="2"><title>Arraste para mudar onde a seta ${q==="a"?"sai":"chega"}${fx?" · duplo clique volta ao automático":""}</title></rect>`).join(""):"";
    const alca=alcas&&!rot?`<circle class="fxl-alca${via?" fixa":""}" data-alca="${e.i}" ${viz?`data-viz="${viz.flat().map(Math.round).join(",")}"`:""} cx="${lx}" cy="${ly}" r="7"><title>Arraste para mudar o caminho da seta${via?" · duplo clique volta ao automático":""}</title></circle>`:"";
    return `<g class="fxl-lig" data-lig="${e.i}"><path d="${d}" fill="none" stroke="${K.s}" stroke-width="${w}"${dash}${mf}${mi}/>${rot?`<g${alcas?` class="fxl-alca-r${via?" fixa":""}" data-alca="${e.i}"${viz?` data-viz="${viz.flat().map(Math.round).join(",")}"`:""}`:""}><rect x="${lx-rw/2}" y="${ly-10}" width="${rw}" height="20" fill="${K.lb}"/><text x="${lx}" y="${ly+1}" fill="${K.lt}" font-size="13">${esc2(rot)}</text>${alcas?`<title>Arraste o rótulo para mudar o caminho da seta${via?" · duplo clique volta ao automático":""}</title>`:""}</g>`:""}${alca}${pontas}</g>`; }).join("");
  const caixas=m.nos.map(n=>{ const c=C[n.id], th=c.tl.length*19, dh=c.dl.length?c.dl.length*16+4:0, y0=-(th+dh)/2+10;
    return `<g class="fxl-no" data-n="${n.id}" transform="translate(${c.x},${c.y})" fill="${n.forma==="decisao"?K.dec:K.no}" stroke="${K.nb}" stroke-width="1">${formaSVG(n.forma,c.w,c.h)}
      ${c.tl.map((l,j)=>`<text stroke="none" fill="${K.tx}" font-size="15" y="${y0+j*19}">${esc2(l)}</text>`).join("")}${c.dl.map((l,j)=>`<text stroke="none" fill="${K.d}" font-size="12.5" y="${y0+th+5+j*16}">${esc2(l)}</text>`).join("")}</g>`; }).join("");
  const gs=m.molduras===false?"":G.map(g=>`<g class="fxl-gr" data-g="${esc2(g.g)}"><rect x="${g.x1}" y="${g.y1}" width="${g.x2-g.x1}" height="${g.y2-g.y1}" fill="${K.gf}" stroke="${K.gb}"/><text x="${(g.x1+g.x2)/2}" y="${g.y1+18}" fill="${K.gt}" font-size="14">${esc2(g.g)}</text></g>`).join("");
  const xs=[...Object.values(C).flatMap(c=>[c.x-c.w/2,c.x+c.w/2]),...G.flatMap(g=>[g.x1,g.x2])], ys=[...Object.values(C).flatMap(c=>[c.y-c.h/2,c.y+c.h/2]),...G.flatMap(g=>[g.y1,g.y2])];
  const vb=vbFixo||[Math.min(...xs)-40,Math.min(...ys)-30,Math.max(...xs)-Math.min(...xs)+80,Math.max(...ys)-Math.min(...ys)+60];
  return `<svg class="fxl" xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(v=>Math.round(v)).join(" ")}" width="${Math.round(vb[2])}" height="${Math.round(vb[3])}" role="img" aria-label="Fluxograma">
    <defs><marker id="fxl-pt" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${K.s}"/></marker></defs>
    ${gs}${setas}${caixas}${(guias||[]).map(g=>g.x!==undefined?`<line class="fxl-guia" x1="${g.x}" y1="${g.a}" x2="${g.x}" y2="${g.b}"/>`:`<line class="fxl-guia" x1="${g.a}" y1="${g.y}" x2="${g.b}" y2="${g.y}"/>`).join("")}</svg>`;
}
// "Salvar posições": alinha as caixas em linhas e colunas e abre espaço entre elas (desenho organizado)
function organizar(m){
  const comDesc=m.descNo!==false, P=m.pos||{}, cx=Object.fromEntries(m.nos.map(n=>[n.id,caixa(n,comDesc)]));
  const agrupar=(eixo,tol)=>{ const ids=m.nos.map(n=>n.id).filter(id=>P[id]).sort((a,b)=>P[a][eixo]-P[b][eixo]); const faixas=[];
    ids.forEach(id=>{ const f=faixas[faixas.length-1]; if(f&&Math.abs(P[id][eixo]-f.v)<=tol){ f.ids.push(id); f.v=f.ids.reduce((s,x)=>s+P[x][eixo],0)/f.ids.length; } else faixas.push({v:P[id][eixo],ids:[id]}); });
    return faixas; };
  // linhas (y): alinhadas e com espaço mínimo entre elas
  let y=null; agrupar("y",45).forEach(f=>{ const h=Math.max(...f.ids.map(id=>cx[id].h)); let v=Math.round(f.v/10)*10; if(y!==null) v=Math.max(v,y+h/2+70); f.ids.forEach(id=>P[id].y=v); y=v+h/2; });
  // colunas (x): alinha caixas quase na mesma vertical
  agrupar("x",60).forEach(f=>{ const v=Math.round(f.v/10)*10; f.ids.forEach(id=>P[id].x=v); });
  // na mesma linha, afasta caixas que se encostam
  agrupar("y",5).forEach(f=>{ const ids=f.ids.sort((a,b)=>P[a].x-P[b].x); for(let i=1;i<ids.length;i++){ const a=ids[i-1], b=ids[i], min=cx[a].w/2+cx[b].w/2+50; if(P[b].x-P[a].x<min) P[b].x=Math.round((P[a].x+min)/10)*10; } });
  m.pos=P; return m;
}
// lê do código: "%% livre {json}"
function livreDoCodigo(cod){ const x=String(cod||"").match(/^%% livre (\{.*\})\s*$/m); if(!x) return null; try{ const m=JSON.parse(x[1]); return m&&m.livre&&m.pos?m:null; }catch(e){ return null; } }
// posições iniciais a partir do desenho automático (Mermaid) que está na prévia
function posDoMermaid(sv,m){ const pos={}; if(!sv) return pos; const inv=sv.getScreenCTM()&&sv.getScreenCTM().inverse(); if(!inv) return pos;
  sv.querySelectorAll("g.node").forEach(g=>{ const mm=(g.id||"").match(/flowchart-(n\d+)-/); if(!mm) return; const r=g.getBoundingClientRect(), pt=sv.createSVGPoint(); pt.x=r.x+r.width/2; pt.y=r.y+r.height/2; const q=pt.matrixTransform(inv); pos[mm[1]]={x:Math.round(q.x*1.12/10)*10,y:Math.round(q.y*1.05/10)*10}; });
  m.nos.forEach((n,i)=>{ if(!pos[n.id]) pos[n.id]={x:120+(i%3)*240,y:60+Math.floor(i/3)*140}; }); return pos; }

/* ---- Mermaid: carregado só quando há fluxograma na tela ---- */
let MP=null;
function carregar(){
  if(MP) return MP;
  MP=new Promise((ok,erro)=>{ const s=document.createElement("script"); s.src="/vendor/mermaid.min.js"; s.onload=()=>ok(window.mermaid); s.onerror=()=>{ MP=null; erro(new Error("Não foi possível carregar o desenhista de fluxogramas.")); }; document.head.appendChild(s); });
  return MP;
}
function escuro(){ const t=document.documentElement.dataset.theme; return t? t==="dark" : matchMedia("(prefers-color-scheme: dark)").matches; }
let seq=0, temaAtual=null;
// Setas "de volta": desenhadas no sentido do layout, com a ponta trocada para o início
function virarVoltas(svg, codigo){
  const vs=[...String(codigo).matchAll(/%% volta (e\d+)/g)].map(x=>x[1]); if(!vs.length) return svg;
  const t=document.createElement("div"); t.innerHTML=svg;
  vs.forEach(eid=>{ const p=t.querySelector(`path[data-id="${eid}"]`); if(!p) return; const me=p.getAttribute("marker-end")||""; if(!me) return;
    p.setAttribute("marker-start",me.replace(/End\)/,"Start)").replace(/-pointEnd/,"-pointStart").replace(/-circleEnd/,"-circleStart").replace(/-crossEnd/,"-crossStart")); p.removeAttribute("marker-end"); });
  return t.innerHTML;
}
async function desenharSVG(codigo){
  const mm=await carregar();
  const tema=escuro()?"dark":"default";
  if(tema!==temaAtual){ mm.initialize({startOnLoad:false, securityLevel:"strict", theme:tema, fontFamily:getComputedStyle(document.body).fontFamily, flowchart:{curve:"basis", useMaxWidth:true}}); temaAtual=tema; }
  const id="fx-"+(++seq);
  try{ const {svg}=await mm.render(id, codigo); return virarVoltas(svg, codigo); }
  finally{ document.getElementById(id)?.remove(); document.getElementById("d"+id)?.remove(); }
}
async function renderizar(raiz){
  const els=[...(raiz||document).querySelectorAll(".fx-svg:not([data-ok])")];
  for(const el of els){
    el.dataset.ok="1";
    try{ const cod=decodeURIComponent(el.dataset.src||""), lv=livreDoCodigo(cod); el.innerHTML=lv?svgLivre(lv):await desenharSVG(cod); }
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
    if(ED.movendo&&ED.m&&ED.m.livre){ organizar(ED.m); ED.movendo=false; }
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
  const m=ED.m, host=document.getElementById("fxHost"), velho={col:host.querySelector(".fx-col:not(.fx-prev)")?.scrollTop||0, pv:host.querySelector("#fx-prev")?.innerHTML||"", pvs:[host.querySelector("#fx-prev")?.scrollTop||0,host.querySelector("#fx-prev")?.scrollLeft||0]};
  desenharEditorHTML(m);
  const c=host.querySelector(".fx-col:not(.fx-prev)"); if(c) c.scrollTop=velho.col;
  const pv=host.querySelector("#fx-prev"); if(pv&&velho.pv){ pv.innerHTML=velho.pv; pv.classList.toggle("fx-livre",!!(m&&m.livre)); pv.classList.toggle("fx-movendo",!!ED.movendo); pv.scrollTop=velho.pvs[0]; pv.scrollLeft=velho.pvs[1]; }
}
function desenharEditorHTML(m){
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
      <div class="fx-col" data-fmt-unica>
        <div class="fx-sec fx-info"><div class="fx-sh"><b>Sobre o fluxograma</b></div>
          <label class="fx-campo">Título <input type="text" id="fx-tit" maxlength="80" value="${escH(ED.titulo)}" placeholder="Ex.: Georreferenciar uma imagem"></label>
          <label class="fx-campo">Descrição do fluxograma <textarea id="fx-desc" rows="2" data-rich="1" data-sem-abas="1" data-barra="unica" data-leve="1" data-fmt-so="neg,ita,mar,lis,num,rev" aria-label="Descrição do fluxograma" placeholder="Para que serve, quando usar, observações…">${escH(ED.desc)}</textarea></label>
        </div>
        ${ED.modoCodigo?`<p class="fx-dica">Modo código (Mermaid). <a href="https://mermaid.js.org/syntax/flowchart.html" target="_blank" rel="noopener">Guia da sintaxe</a>.${m?"":" Este fluxograma foi escrito à mão, por isso abre direto no código."}</p>
          <textarea id="fx-cod" spellcheck="false">${escH(ED.codigo)}</textarea>
          ${m?`<button class="btn sm" data-fxvisual>Voltar ao editor visual</button>`:""}`
        :`<div class="fx-sec"><div class="fx-sh"><b>Etapas <span class="fx-qt">${m.nos.length}</span></b><span class="row" style="gap:12px"><label class="fx-ck" title="Desmarcado: as descrições aparecem numa lista abaixo do desenho"><input type="checkbox" id="fx-dno" ${m.descNo!==false?"checked":""}> descrição dentro das formas</label><label class="fx-ck"><input type="checkbox" id="fx-liga" ${ED.liga?"checked":""}> ligar a nova etapa à anterior</label><label class="fx-ck" title="A 1ª etapa (ex.: Início) fica acima de tudo no desenho automático"><input type="checkbox" id="fx-topo" ${m.topo!==false?"checked":""}> 1ª etapa no topo</label></span></div>
          ${m.nos.map((n,i)=>`<div class="fx-no" data-forma="${n.forma}">
            <span class="fx-num">${i+1}</span>
            <select data-fxforma="${n.id}" aria-label="Forma da etapa ${i+1}">${Object.entries(FORMAS).map(([k,v])=>`<option value="${k}" ${n.forma===k?"selected":""}>${v.nome}</option>`).join("")}</select>
            <input type="text" data-fxtexto="${n.id}" value="${escH(n.texto)}" placeholder="Texto da etapa" aria-label="Texto da etapa ${i+1}">
            <input type="text" class="fx-gr" data-fxgrupo="${n.id}" value="${escH(n.grupo||"")}" list="fx-grupos" placeholder="Grupo (opcional)" aria-label="Grupo da etapa ${i+1}" title="Etapas com o mesmo grupo ficam juntas no desenho (ex.: Desenvolvedor 1)">
            <span class="fx-acts"><button class="btn sm" data-fxsobe="${n.id}" ${i?"":"disabled"} aria-label="Subir" title="Subir">↑</button><button class="btn sm" data-fxdesce="${n.id}" ${i<m.nos.length-1?"":"disabled"} aria-label="Descer" title="Descer">↓</button><button class="btn sm danger" data-fxdelno="${n.id}" aria-label="Apagar etapa" title="Apagar etapa">✕</button></span>
            <textarea class="fx-nd" rows="1" data-rich="1" data-sem-abas="1" data-barra="unica" data-leve="1" data-fmt-so="neg,ita,mar,lis,num,rev" data-fxdesc="${n.id}" placeholder="Descrição ${n.forma==="inicio"?"do início/fim":n.forma==="decisao"?"da decisão":"da etapa"} (opcional)" aria-label="Descrição da etapa ${i+1}">${escH(n.desc||"")}</textarea>
          </div>`).join("")}
          <datalist id="fx-grupos">${gruposDe(m).map(g=>`<option value="${escH(g)}">`).join("")}</datalist>
          ${gruposDe(m).length?`<div class="fx-grl"><span>Grupos:</span>${gruposDe(m).map(g=>`<span class="fx-qt">${escH(g)} · ${m.nos.filter(n=>grupoNorm(n.grupo)===g).length}</span>`).join("")}<label class="fx-ck"><input type="checkbox" id="fx-mold" ${m.molduras!==false?"checked":""}> mostrar moldura e nome dos grupos</label>${gruposDe(m).length>1?`<label class="fx-ck" title="Troca a ordem em que os grupos aparecem (ex.: Desenvolvedor 1 à esquerda ou à direita)"><input type="checkbox" id="fx-grinv" ${m.grInv?"checked":""}> trocar a ordem dos grupos</label>`:""}</div>`:`<p class="fx-dica">Dica: dê o mesmo <b>Grupo</b> às etapas que devem ficar juntas (ex.: tudo do Desenvolvedor 1 numa coluna, do Desenvolvedor 2 em outra).</p>`}
          <div class="row fx-add"><button class="btn sm" data-fxaddno="etapa">+ Etapa</button><button class="btn sm" data-fxaddno="decisao">+ Decisão</button><button class="btn sm" data-fxaddno="nota">+ Comando</button><button class="btn sm" data-fxaddno="inicio">+ Início/Fim</button></div></div>
          <div class="fx-sec"><div class="fx-sh"><b>Ligações (setas) <span class="fx-qt">${m.ligs.length}</span></b>
            <span class="row" style="gap:8px"><label class="fx-lb">Setas <select id="fx-curva">${Object.entries(CURVAS).map(([k,v])=>`<option value="${k}" ${(m.curva||"basis")===k?"selected":""}>${v}</option>`).join("")}</select></label>
            <label class="fx-lb">Espaço <select id="fx-esp">${Object.entries(ESPACOS).map(([k,v])=>`<option value="${k}" ${(m.esp||"normal")===k?"selected":""}>${v}</option>`).join("")}</select></label></span></div>
          <p class="fx-dica">Para organizar o desenho: marque <b>volta</b> nas setas que retornam (ex.: git push ao servidor), dê o mesmo <b>Grupo</b> às etapas que devem ficar juntas, mude o <b>comprimento</b> da seta (empurra a caixa para baixo/longe), use uma seta <b>invisível</b> entre caixas que devem ficar alinhadas, troque a <b>curva</b> de uma seta ou a ordem das etapas.</p>
          ${m.ligs.length?m.ligs.map((g,i)=>`<div class="fx-lig">
            <select data-fxde="${i}" aria-label="De">${optNos(g.de)}</select><span class="fx-seta" aria-hidden="true">→</span>
            <select data-fxpara="${i}" aria-label="Para">${optNos(g.para)}</select>
            <input type="text" data-fxrot="${i}" value="${escH(g.rot)}" placeholder="rótulo (Sim/Não)" aria-label="Rótulo da seta">
            <button class="btn sm danger" data-fxdellig="${i}" aria-label="Apagar ligação">✕</button>
            <div class="fx-lig-op">
              <select data-fxltipo="${i}" aria-label="Tipo da seta">${Object.entries(TIPOS_SETA).map(([k,v])=>`<option value="${k}" ${(g.tipo||"seta")===k?"selected":""}>${v}</option>`).join("")}</select>
              <select data-fxltam="${i}" aria-label="Comprimento da seta" title="Seta mais longa afasta a caixa de destino">${[["1","Curta"],["2","Média"],["3","Longa"]].map(([k,v])=>`<option value="${k}" ${String(g.tam||1)===k?"selected":""}>${v}</option>`).join("")}</select>
              <select data-fxlcurva="${i}" aria-label="Curva desta seta" ${g.tipo==="invis"?"disabled":""}><option value="">Curva padrão</option>${Object.entries(CURVAS).map(([k,v])=>`<option value="${k}" ${g.curva===k?"selected":""}>${v}</option>`).join("")}</select>
              <label class="fx-ck" title="Para setas que voltam (ex.: git push de volta ao servidor): a seta continua apontando para o destino, mas não puxa a caixa de destino para baixo"><input type="checkbox" data-fxlvolta="${i}" ${g.volta?"checked":""} ${/^(invis|dupla|linha)$/.test(g.tipo||"")?"disabled":""}> volta</label>
              <button type="button" class="btn sm" data-fxlinv="${i}" title="Inverter o sentido (troca origem e destino)" aria-label="Inverter o sentido">⇄ Inverter</button>
            </div></div>`).join(""):'<p class="fx-dica">Nenhuma seta ainda.</p>'}
          <div class="row"><button class="btn sm" data-fxaddlig ${m.nos.length<2?"disabled":""}>+ Ligação</button></div></div>
          <button class="btn sm" data-fxcodigo style="align-self:flex-start">Editar como código (avançado)</button>`}
      </div>
      <div class="fx-col fx-prev"><div class="fx-pvh"><b class="fx-lb">Prévia ao vivo</b>${ED.modoCodigo?"":`<span class="row" style="gap:4px">${ED.movendo?`<button type="button" class="btn sm pri" data-fxposok title="Alinha as caixas e organiza as setas">✓ Salvar posições</button>`:`<button type="button" class="btn sm ${m.livre?"":"pri"}" data-fxlivre title="Arrastar as caixas para onde quiser; as setas acompanham">✋ Mover caixas</button>`}${m.livre?`<button type="button" class="btn sm" data-fxauto title="Volta ao desenho automático (as posições arrastadas são descartadas)">↺ Automático</button>`:""}</span>`}<span class="row" style="gap:4px"><button type="button" class="btn sm" data-fxzoom="-" aria-label="Diminuir" title="Diminuir">−</button><button type="button" class="btn sm" data-fxzoom="0" title="Ajustar ao espaço">Ajustar</button><button type="button" class="btn sm" data-fxzoom="+" aria-label="Aumentar" title="Aumentar">+</button></span></div><div id="fx-prev" class="fx-pv"><p class="fx-dica">Desenhando…</p></div></div>
    </div>
  </section>`;
}
let _pt=null;
function prever(){ clearTimeout(_pt); _pt=setTimeout(async()=>{ if(!ED) return; const el=document.getElementById("fx-prev"); if(!el) return;
  const cod = ED.modoCodigo? ED.codigo : paraMermaid(ED.m);
  if(!ED.modoCodigo&&ED.m.livre){ desenharLivreEd(); return; }
  try{ const svg=await desenharSVG(cod); if(ED&&el.isConnected){ const st=el.scrollTop, sl=el.scrollLeft; el.innerHTML=svg; ajustarPrevia(); el.scrollTop=st; el.scrollLeft=sl; } }
  catch(e){ if(el.isConnected) el.innerHTML=`<p class="fx-erro">${escH((e&&e.message||"Não foi possível desenhar.").split("\n").slice(0,2).join(" "))}</p>`; } },250); }
function desenharLivreEd(vb){ const el=document.getElementById("fx-prev"); if(!el||!ED) return; const st=el.scrollTop, sl=el.scrollLeft; el.innerHTML=svgLivre(ED.m,vb,!!ED.movendo); el.classList.add("fx-livre"); el.classList.toggle("fx-movendo",!!ED.movendo); ajustarPrevia(); el.scrollTop=st; el.scrollLeft=sl; }
// Guias de alinhamento: ao chegar perto do centro/borda de outra caixa, encaixa e mostra a linha
function caixasDe(m, menos){ const comDesc=m.descNo!==false; return m.nos.filter(n=>!menos.includes(n.id)&&m.pos[n.id]).map(n=>{ const c=caixa(n,comDesc), p=m.pos[n.id]; return {x:p.x,y:p.y,w:c.w,h:c.h}; }); }
function encaixar(px,py,w,h,outros,T){
  T=T||8; const g=[]; let bx=null, by=null;
  const cx=[["c",0],["l",-w/2],["r",w/2]], alvoX=o=>[o.x,o.x-o.w/2,o.x+o.w/2], cy=[["c",0],["t",-h/2],["b",h/2]], alvoY=o=>[o.y,o.y-o.h/2,o.y+o.h/2];
  outros.forEach(o=>{ cx.forEach(([k,d],i)=>{ const v=alvoX(o)[i], dist=Math.abs(px+d-v); if(dist<=T&&(!bx||dist<bx.d)) bx={d:dist,x:v-d,linha:v,o}; });
    cy.forEach(([k,d],i)=>{ const v=alvoY(o)[i], dist=Math.abs(py+d-v); if(dist<=T&&(!by||dist<by.d)) by={d:dist,y:v-d,linha:v,o}; }); });
  const x=bx?bx.x:Math.round(px/10)*10, y=by?by.y:Math.round(py/10)*10;
  if(bx){ const os=outros.filter(o=>alvoX(o).some(v=>Math.abs(v-bx.linha)<0.5)); g.push({x:bx.linha,a:Math.min(y-h/2,...os.map(o=>o.y-o.h/2))-16,b:Math.max(y+h/2,...os.map(o=>o.y+o.h/2))+16}); }
  if(by){ const os=outros.filter(o=>alvoY(o).some(v=>Math.abs(v-by.linha)<0.5)); g.push({y:by.linha,a:Math.min(x-w/2,...os.map(o=>o.x-o.w/2))-16,b:Math.max(x+w/2,...os.map(o=>o.x+o.w/2))+16}); }
  return {x,y,guias:g};
}
// Arrastar caixas (e grupos) na prévia
(function(){ let arr=null;
  const ponto=(sv,e)=>{ const pt=sv.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY; return pt.matrixTransform(sv.getScreenCTM().inverse()); };
  document.addEventListener("pointerdown",e=>{ if(!ED||!ED.m||!ED.m.livre||!ED.movendo) return; const el=document.getElementById("fx-prev"); if(!el||!el.contains(e.target)) return;
    const sv=el.querySelector("svg.fxl"); if(!sv) return;
    const pt=e.target.closest("[data-ponta]"); if(pt){ e.preventDefault(); const [i,q]=pt.dataset.ponta.split(":"); arr={sv,el,ponta:{i:+i,q},vb:sv.getAttribute("viewBox").split(" ").map(Number),moveu:false,ids:[]}; try{ el.setPointerCapture(e.pointerId); }catch(x){} el.classList.add("arrastando"); return; }
    const al=e.target.closest("[data-alca]"); if(al){ e.preventDefault(); const i=+al.dataset.alca; arr={sv,el,seta:i,viz:al.dataset.viz?al.dataset.viz.split(",").map(Number):null,vb:sv.getAttribute("viewBox").split(" ").map(Number),moveu:false,ids:[]}; try{ el.setPointerCapture(e.pointerId); }catch(x){} el.classList.add("arrastando"); return; }
    const no=e.target.closest("[data-n]"), gr=!no&&e.target.closest("[data-g]"); if(!no&&!gr) return;
    e.preventDefault(); const p=ponto(sv,e), ids=no?[no.dataset.n]:ED.m.nos.filter(n=>grupoNorm(n.grupo)===gr.dataset.g).map(n=>n.id);
    arr={sv,el,ids,p0:p,ini:ids.map(id=>({...ED.m.pos[id]})),vias:ED.m.ligs.map(g=>g.via?{...g.via}:null),vb:sv.getAttribute("viewBox").split(" ").map(Number),moveu:false}; try{ el.setPointerCapture(e.pointerId); }catch(x){} el.classList.add("arrastando"); });
  document.addEventListener("pointermove",e=>{ if(!arr) return; const p=ponto(arr.sv,e);
    if(arr.ponta){ arr.moveu=true; const g=ED.m.ligs[arr.ponta.i]; if(g){ const c=ED.m.pos[arr.ponta.q==="a"?g.de:g.para]; if(c){ const v={dx:Math.round(p.x-c.x),dy:Math.round(p.y-c.y)}; if(v.dx||v.dy){ if(arr.ponta.q==="a") g.pIni=v; else g.pFim=v; } } } }
    else if(arr.seta!==undefined){ arr.moveu=true; const g=ED.m.ligs[arr.seta]; if(g){ let x=p.x, y=p.y; const v=arr.viz; if(v){ x=(6*p.x-v[0]-v[2])/4; y=(6*p.y-v[1]-v[3])/4; } const r=encaixar(x,y,0,0,caixasDe(ED.m,[])); g.via={x:r.x,y:r.y}; arr.guias=r.guias; } }
    else { const dx=p.x-arr.p0.x, dy=p.y-arr.p0.y; if(Math.abs(dx)+Math.abs(dy)>2) arr.moveu=true;
    if(!arr.outros) arr.outros=caixasDe(ED.m,arr.ids);
    if(arr.ids.length===1){ const n=ED.m.nos.find(x=>x.id===arr.ids[0]), c=caixa(n,ED.m.descNo!==false), r=encaixar(arr.ini[0].x+dx,arr.ini[0].y+dy,c.w,c.h,arr.outros); ED.m.pos[arr.ids[0]]={x:r.x,y:r.y}; arr.guias=r.guias; }
    else { // grupo: alinha pelo centro do conjunto
      const xs=arr.ini.map(q=>q.x), ys=arr.ini.map(q=>q.y), mx=(Math.min(...xs)+Math.max(...xs))/2, my=(Math.min(...ys)+Math.max(...ys))/2, r=encaixar(mx+dx,my+dy,0,0,arr.outros);
      const ddx=r.x-mx, ddy=r.y-my; arr.ids.forEach((id,i)=>{ ED.m.pos[id]={x:Math.round(arr.ini[i].x+ddx),y:Math.round(arr.ini[i].y+ddy)}; }); arr.guias=r.guias; }
    // seta com caminho próprio acompanha a caixa (metade do movimento se só uma ponta se move)
    ED.m.ligs.forEach((g,i)=>{ const v=arr.vias[i]; if(!v) return; const k=(arr.ids.includes(g.de)?1:0)+(arr.ids.includes(g.para)?1:0); if(k) g.via={x:Math.round((v.x+dx*k/2)/10)*10,y:Math.round((v.y+dy*k/2)/10)*10}; }); }
    cancelAnimationFrame(arr.raf); arr.raf=requestAnimationFrame(()=>{ if(!arr) return; arr.el.innerHTML=svgLivre(ED.m,arr.vb,true,arr.guias); const s2=arr.el.querySelector("svg"); const z=parseFloat(arr.sv.style.width)/arr.vb[2]; if(s2&&z){ s2.style.maxWidth="none"; s2.style.width=Math.round(arr.vb[2]*z)+"px"; s2.style.height=Math.round(arr.vb[3]*z)+"px"; } arr.sv=s2||arr.sv; }); });
  const fim=()=>{ if(!arr) return; const a=arr; arr=null; a.el.classList.remove("arrastando"); if(a.moveu){ mudou(false); } };
  document.addEventListener("pointerup",fim); document.addEventListener("pointercancel",fim);
  document.addEventListener("dblclick",e=>{ const pt=ED&&ED.movendo&&e.target.closest&&e.target.closest("#fx-prev [data-ponta]"); if(pt){ const [i,q]=pt.dataset.ponta.split(":"), g=ED.m.ligs[+i]; if(g){ delete g[q==="a"?"pIni":"pFim"]; mudou(false); } return; }
    const al=ED&&ED.movendo&&e.target.closest&&e.target.closest("#fx-prev [data-alca]"); if(!al) return; const g=ED.m.ligs[+al.dataset.alca]; if(g&&g.via){ delete g.via; mudou(false); } });
})();
// Prévia: o desenho ocupa o espaço disponível (sem estourar), com zoom − / Ajustar / +
let FX_ZOOM=0;
function ajustarPrevia(){ const el=document.getElementById("fx-prev"), sv=el&&el.querySelector("svg"); if(!sv) return;
  const vb=(sv.getAttribute("viewBox")||"").split(/[\s,]+/).map(Number); const w=vb[2]||sv.getBBox().width, h=vb[3]||sv.getBBox().height; if(!w||!h) return;
  const W=el.clientWidth-24, H=el.clientHeight-24, fit=Math.max(.2,Math.min(W/w,H/h,1.3)), z=FX_ZOOM?Math.max(.3,Math.min(4,fit*Math.pow(1.25,FX_ZOOM))):fit;
  sv.style.maxWidth="none"; sv.style.width=Math.round(w*z)+"px"; sv.style.height=Math.round(h*z)+"px";
  el.classList.toggle("fx-grande",w*z>W+2||h*z>H+2); }
addEventListener("resize",()=>{ if(ED) ajustarPrevia(); });
document.addEventListener("click",e=>{ const b=e.target.closest&&e.target.closest("[data-fxzoom]"); if(!b) return; const v=b.dataset.fxzoom; FX_ZOOM=v==="0"?0:FX_ZOOM+(v==="+"?1:-1); ajustarPrevia(); });
function mudou(redesenhar){ if(!ED.modoCodigo) ED.codigo=paraMermaid(ED.m); if(redesenhar) desenharEditor(); prever(); }

document.addEventListener("click",e=>{
  const b=e.target.closest("[data-fxnovo],[data-fxeditar],[data-fxfechar],[data-fxsalvar],[data-fxapagar],[data-fxaddno],[data-fxdelno],[data-fxsobe],[data-fxdesce],[data-fxaddlig],[data-fxdellig],[data-fxlinv],[data-fxlivre],[data-fxauto],[data-fxposok],[data-fxcodigo],[data-fxvisual]");
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
  if(d.fxlivre!==undefined){ if(!m.livre){ const sv=document.querySelector("#fx-prev svg"); m.pos=posDoMermaid(sv,m); m.livre=true; } ED.movendo=true; mudou(true); aviso("Arraste as caixas, o nome de um grupo, o ponto ● ou rótulo de uma seta e as pontas ■ (onde a seta sai e chega). Depois clique em ✓ Salvar posições."); return; }
  if(d.fxposok!==undefined){ organizar(m); ED.movendo=false; mudou(true); aviso("Posições salvas e setas organizadas."); return; }
  if(d.fxauto!==undefined){ delete m.livre; delete m.pos; ED.movendo=false; document.getElementById("fx-prev")?.classList.remove("fx-livre"); mudou(true); return; }
  if(d.fxlinv!==undefined){ const g=m.ligs[parseInt(d.fxlinv,10)]; if(g){ [g.de,g.para]=[g.para,g.de]; mudou(true); } return; }
});
document.addEventListener("input",e=>{
  if(!ED) return; const t=e.target, d=t.dataset;
  if(t.id==="fx-cod"){ ED.codigo=t.value; prever(); return; }
  if(t.id==="fx-tit"){ ED.titulo=t.value; return; }
  if(t.id==="fx-desc"){ ED.desc=t.value; return; }
  if(d.fxdesc!==undefined){ const n=ED.m.nos.find(n=>n.id===d.fxdesc); if(n){ n.desc=t.value; mudou(false); } return; }
  if(d.fxgrupo!==undefined){ const n=ED.m.nos.find(n=>n.id===d.fxgrupo); if(n){ n.grupo=t.value.slice(0,40)||undefined; mudou(false); } return; }
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
  if(d.fxgrupo!==undefined){ const id=d.fxgrupo; mudou(true); setTimeout(()=>document.querySelector(`[data-fxdesc="${id}"]`)?.closest(".fx-no")?.querySelector(".fx-gr")?.blur(),0); return; }
  if(t.id==="fx-topo"){ ED.m.topo=t.checked?undefined:false; mudou(false); return; }
  if(t.id==="fx-grinv"){ ED.m.grInv=t.checked||undefined; mudou(false); return; }
  if(t.id==="fx-mold"){ ED.m.molduras=t.checked?undefined:false; mudou(false); return; }
  if(t.id==="fx-curva"){ ED.m.curva=t.value==="basis"?undefined:t.value; mudou(false); return; }
  if(t.id==="fx-esp"){ ED.m.esp=t.value==="normal"?undefined:t.value; mudou(false); return; }
  if(d.fxltipo!==undefined){ const g=ED.m.ligs[parseInt(d.fxltipo,10)]; if(g){ g.tipo=t.value==="seta"?undefined:t.value; mudou(true); } return; }
  if(d.fxltam!==undefined){ const g=ED.m.ligs[parseInt(d.fxltam,10)]; if(g){ g.tam=t.value==="1"?undefined:+t.value; mudou(false); } return; }
  if(d.fxlvolta!==undefined){ const g=ED.m.ligs[parseInt(d.fxlvolta,10)]; if(g){ g.volta=t.checked||undefined; mudou(false); } return; }
  if(d.fxlcurva!==undefined){ const g=ED.m.ligs[parseInt(d.fxlcurva,10)]; if(g){ g.curva=t.value||undefined; mudou(false); } return; }
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
.fx-col:not(.fx-prev){background:var(--bg)}
.fx-prev{border-left:1px solid var(--line);background:var(--surface);gap:8px}
.fx-pvh{display:flex;justify-content:space-between;align-items:center;gap:8px;flex:none}
.fx-pv{flex:1;display:flex;align-items:center;justify-content:center;overflow:auto;min-height:0;border:1px dashed var(--line);border-radius:12px;background:var(--bg);padding:12px}
.fx-pv.fx-grande{align-items:flex-start;justify-content:flex-start}
.fx-pv svg{flex:none}
.fx-pv.fx-movendo svg [data-n],.fx-pv.fx-movendo svg [data-g] text,.fx-pv.fx-movendo svg [data-g] rect{cursor:grab}
.fx-pv.fx-movendo.arrastando,.fx-pv.fx-movendo.arrastando *{cursor:grabbing!important;user-select:none}
.fx-pv.fx-movendo{touch-action:none;background-image:radial-gradient(var(--line) 1px,transparent 1px);background-size:20px 20px;outline:2px dashed var(--accent);outline-offset:-2px}
svg.fxl{font-family:inherit;overflow:visible}
svg.fxl .fxl-alca{fill:var(--surface,#fff);stroke:var(--accent,#5b3cc4);stroke-width:2;cursor:move;opacity:.85}
svg.fxl .fxl-alca:hover{opacity:1;r:9}svg.fxl .fxl-alca.fixa{fill:var(--accent,#5b3cc4)}
svg.fxl .fxl-guia{stroke:#e8459f;stroke-width:1.2;stroke-dasharray:5 4;pointer-events:none}
svg.fxl .fxl-ponta{fill:var(--surface,#fff);stroke:#d35400;stroke-width:2;cursor:crosshair;opacity:.9}svg.fxl .fxl-ponta.fixa{fill:#d35400}
svg.fxl .fxl-alca-r{cursor:move}svg.fxl .fxl-alca-r rect{stroke:var(--accent,#5b3cc4);stroke-width:1.5;stroke-dasharray:3 2}svg.fxl .fxl-alca-r.fixa rect{stroke-dasharray:none}
svg.fxl text{text-anchor:middle;dominant-baseline:middle}
.fx-sec{display:flex;flex-direction:column;gap:8px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px 14px}
.fx-sh{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding-bottom:6px;border-bottom:1px solid var(--line);margin-bottom:2px}
.fx-sh b{font:700 14.5px var(--display);display:flex;gap:6px;align-items:center}
.fx-qt{font:600 11.5px var(--mono);background:var(--accent-soft);color:var(--accent);border-radius:999px;padding:1px 8px}
.fx-no{display:grid;grid-template-columns:24px 150px minmax(0,1fr) auto;gap:6px 8px;align-items:center;padding:8px 8px 8px 6px;border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:10px;background:var(--bg)}
.fx-no[data-forma="inicio"]{border-left-color:#2f9e44}.fx-no[data-forma="decisao"]{border-left-color:#c9871a}.fx-no[data-forma="nota"]{border-left-color:#62607a}.fx-no[data-forma="dado"]{border-left-color:#1592a3}.fx-no[data-forma="sub"]{border-left-color:#8a5cd0}
.fx-acts{display:flex;gap:4px}.fx-acts .btn{padding:3px 8px}
.fx-seta{color:var(--muted);text-align:center}
.fx-add{gap:6px;flex-wrap:wrap}
.fx-info{gap:8px}
.fx-campo{display:flex;flex-direction:column;gap:4px;font-size:12.5px;font-weight:600;color:var(--muted)}
.fx-campo input,.fx-campo textarea{font:inherit;font-size:14px;font-weight:400;color:var(--ink,inherit);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:6px 8px}
.fx-campo textarea{resize:vertical;min-height:2.6em;field-sizing:content;max-height:30vh}
.fx-no>.fx-acts{grid-column:4;grid-row:1}.fx-no>.fx-gr{grid-row:2}.fx-no>.fx-nd,.fx-no>.wys{grid-row:2}
.fx-gr{grid-column:2;font-size:13px!important;padding:4px 8px!important;border-style:dashed!important}
.fx-grl{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:12.5px;color:var(--muted)}
.fx-nd{grid-column:3 / -1;font:inherit;font-size:13px;color:var(--ink,inherit);background:var(--bg);border:1px dashed var(--line);border-radius:7px;padding:4px 8px;resize:vertical;min-height:1.9em;field-sizing:content;max-height:30vh;margin-top:-2px}
.fx-nd:focus{border-style:solid}
.fx-no .wys{grid-column:3 / -1;min-height:1.9em;padding:4px 8px;font-size:13px;border:1px dashed var(--line);border-radius:7px;margin-top:0;max-height:30vh;overflow:auto;background:var(--surface)}
.fx-no .wys:focus{border-style:solid}
.fx-info .wys{min-height:2.6em;padding:6px 8px;font-size:14px;font-weight:400;max-height:30vh;overflow:auto}
.fx-col>.fmt-unica{margin:-4px 0 0;flex:none;border-radius:10px;top:-14px}
.fx-col>.fmt-unica .fmt-alvo::before{content:"Formatando: ";font-weight:400}
.fx-desc.md p{margin:0 0 4px}
.fx-desc{margin:2px 4px 4px;font-size:13px;color:var(--muted);line-height:1.45;text-align:left}
.fx-det{font-size:13px;margin:2px 4px;text-align:left}.fx-det summary{cursor:pointer;color:var(--muted);font-weight:600}
.fx-det ol{margin:6px 0 0;padding-left:22px}.fx-det li{margin:3px 0}.fx-det .fx-fm{font-size:11.5px;color:var(--muted);margin-left:4px}.fx-det li div{color:var(--ink,inherit)}
.fx-tit{margin:0 0 2px;font-size:14.5px;text-align:left}
.fx-num{font:600 12px var(--mono);color:var(--accent);background:var(--accent-soft);border-radius:999px;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center}
.fx-lig{display:grid;grid-template-columns:minmax(0,1fr) 16px minmax(0,1fr) minmax(80px,130px) auto;gap:6px;align-items:center;padding:8px;border:1px solid var(--line);border-radius:10px;background:var(--bg)}
.fx-lig-op{grid-column:1/-1;display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.fx-lig-op select{font-size:12.5px;padding:3px 6px!important;flex:1 1 120px}.fx-lig-op .btn{flex:none}
.fx-sh .fx-lb select{padding:3px 6px}
.fx-ck{font-size:12.5px;color:var(--muted);display:flex;gap:6px;align-items:center;cursor:pointer}
.fx-dica{font-size:13px;color:var(--muted);margin:0}.fx-dica a{color:var(--accent)}
#fx-cod{min-height:260px;font:13px/1.5 var(--mono);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:10px;width:100%;flex:1}
@media (max-width:820px){
  .fx-ed{inset:0;border-radius:0}
  .fx-ed header{gap:6px;padding:10px 12px}.fx-ed header>.row:first-of-type{display:grid;grid-template-columns:1fr 1fr;gap:6px;width:100%}.fx-ed header .fx-lb{flex-direction:column;align-items:stretch;gap:2px}
  /* tela estreita (celular, janela por cima): prévia em cima com altura fixa, opções rolam embaixo */
  .fx-body{display:flex;flex-direction:column;min-height:0}
  .fx-prev{order:-1;flex:none;height:min(36vh,300px);border-left:0;border-bottom:1px solid var(--line);padding:8px 12px}
  .fx-col:not(.fx-prev){flex:1;min-height:0;overflow:auto}
  .fx-no{grid-template-columns:24px minmax(0,1fr) auto;}
  .fx-no select{grid-column:2 / 3}
  .fx-no input{grid-column:2 / -1}
  .fx-no .fx-num{grid-row:1}.fx-no select{grid-row:1}.fx-no>.fx-acts{grid-column:3;grid-row:1}.fx-no>input[data-fxtexto]{grid-row:2}.fx-no>.fx-gr{grid-row:3}.fx-no>.fx-nd,.fx-no>.wys{grid-row:4}
  .fx-nd,.fx-no .wys,.fx-gr{grid-column:2 / -1}
  .fx-lig{grid-template-columns:minmax(0,1fr) 16px minmax(0,1fr);}
  .fx-lig input{grid-column:1 / 3}
  .fx-pv{border:0;padding:4px}
}`;
const st=document.createElement("style"); st.textContent=css; document.head.appendChild(st);
const host=document.createElement("div"); host.id="fxHost"; document.body.appendChild(host);
if(typeof AJUDA==="object") AJUDA.fluxograma={t:"Fluxograma na anotação",o:"Desenha um fluxograma dentro da anotação: etapas, decisões e setas.",c:"Clique em Fluxograma. Escolha um modelo ou adicione etapas (Etapa, Decisão, Comando, Início/Fim); com “ligar à anterior” marcado, cada nova etapa já ganha uma seta. Dê um título e uma descrição ao fluxograma, e, se quiser, uma descrição em cada etapa (aparece dentro da forma ou numa lista abaixo do desenho). Em Ligações, crie setas extras e escreva rótulos como Sim/Não. A prévia aparece ao lado. Salve: o fluxograma entra na anotação e aparece desenhado em Visualizar, onde também há o botão para editar. Exportado em Markdown, o GitHub desenha o mesmo fluxograma."};
window.FLUXO={renderizar, blocos, paraMermaid, abrir, converter, expandir, extras};
})();
