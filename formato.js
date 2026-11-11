/* ============ BARRA DE FORMATAÇÃO RÁPIDA ============
   Aparece em cima das caixas de anotação (painel do item/aula, anotação rápida do Hoje,
   anotações de fase/disciplina, notas do caderno e bloco flutuante).
   Só escreve Markdown simples no texto; o "Visualizar" (md()) desenha o resultado.
   Atalhos: Ctrl+B negrito, Ctrl+I itálico, Ctrl+K link, Ctrl+Shift+X tarefa ☐,
   Enter continua a lista (Enter numa linha de lista vazia encerra a lista). */
(function(){
  const ALVOS='#qnota,#pnota,#ntxt,#fl-txt,textarea[data-dnota],textarea[data-rich]';
  const BOTOES=[
    ["cheia",'<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 7.5V3h4.5M12.5 3H17v4.5M17 12.5V17h-4.5M7.5 17H3v-4.5"/></svg><span class="fmt-tx">Tela cheia</span>',"Escrever em tela cheia (Esc para sair)"],
    ["dest",'<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="2.5" y="4" width="11" height="9" rx="1.5"/><rect x="8.5" y="9" width="9" height="7" rx="1.5" fill="var(--surface,#fff)"/></svg><span class="fmt-tx">Destacar</span>',"Destacar: abre esta anotação num bloco por cima da tela (no bloco, ⧉ deixa por cima de outras janelas)"],
    ["neg","<b>N</b>","Negrito (Ctrl+B)"],
    ["ita","<i>I</i>","Itálico (Ctrl+I)"],
    ["mar",'<span class="fmt-mk">M</span>',"Marca-texto"],
    ["tit","T","Título (clique de novo para trocar o tamanho)"],
    ["lis","•","Lista"],
    ["num","1.","Lista numerada"],
    ["sub","⇥","Sublista: o item entra um nível (Tab). Em lista numerada vira 1.1, 1.2…"],
    ["sob","⇤","Volta o item um nível (Shift+Tab)"],
    ["tar","☐","Tarefa / checklist (Ctrl+Shift+X); clique de novo para marcar ☑"],
    ["cit","❝","Citação ou destaque"],
    ["cod","&lt;/&gt;","Código (trecho ou bloco)"],
    ["lnk","🔗","Link (Ctrl+K)"],
    ["pq",'<span class="fmt-cd">&lt;&gt;</span>',"Pesquisa: o trecho selecionado vira <termo> pesquisável. Com o cursor num termo, edita ele"],
    ["mrc",'<span class="fmt-cd">{{}}</span>',"Flashcard {{pergunta}}: o trecho selecionado vira pergunta de flashcard. Com o cursor num marcador, edita ele"],
    ["exp",'<span class="fmt-cd">(( ))</span>',"Explicação ((termo)): o trecho selecionado vira termo com explicação (escrita por você, pela IA ou pesquisada). Com o cursor num termo, abre a explicação"],
    ["div","―","Linha divisória"],
    ["img",'<svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="2" y="3.5" width="16" height="13" rx="2"/><circle cx="7" cy="8" r="1.6"/><path d="M2.5 15l4.5-4.5 3.5 3.5 2.5-2.5 4.5 4.5"/></svg><span class="fmt-tx">Imagem</span>',"Inserir imagem neste ponto do texto (também dá para colar com Ctrl+V ou arrastar a imagem para a caixa)"],
    ["flx",'<svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="6" y="1.5" width="8" height="4.5" rx="1"/><path d="M10 6v3"/><path d="M10 9l3.5 3.2L10 15.4 6.5 12.2z"/><path d="M6.5 12.2H3v4.3h4"/><path d="M13.5 12.2H17v4.3h-4"/></svg><span class="fmt-tx">Fluxograma</span>',"Inserir fluxograma neste ponto do texto (com o cursor dentro de um fluxograma, edita ele)"],
    ["tab",'<svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="2" y="3" width="16" height="14" rx="1.5"/><path d="M2 7.5h16M2 12h16M8 3v14M13 3v14"/></svg><span class="fmt-tx">Tabela</span>',"Inserir tabela neste ponto (com o cursor numa tabela: adicionar/remover linhas e colunas). Tab passa para a próxima célula."],
    ["fla",'<svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="5.5" y="2.5" width="12" height="9" rx="1.5"/><rect x="2.5" y="7.5" width="12" height="9" rx="1.5" fill="var(--surface,#fff)"/><path d="M6 12h5"/></svg><span class="fmt-tx">Flashcard</span>',"Flashcard: o trecho selecionado vira um cartão de revisão (\"termo: explicação\" já separa frente e verso)"],
    ["rev",'<span class="fmt-rev">Aa✓</span>',"Revisão: correção ortográfica (automática ou não) e sugestão de palavras por Tab"],
  ];
  const CSS=`
.fmt{width:0;min-width:100%;box-sizing:border-box;display:flex;gap:2px;align-items:center;flex-wrap:wrap;overflow-x:auto;scrollbar-width:none;padding:3px;margin:0 0 4px;border:1px solid var(--line);border-radius:8px;background:var(--surface);flex:none}
.fmt::-webkit-scrollbar{display:none}
.fmt button{flex:none;min-width:30px;height:28px;padding:0 7px;border:0;border-radius:6px;background:transparent;color:var(--ink,inherit);cursor:pointer;font-size:13.5px;line-height:1}
.fmt button:hover{background:var(--accent-soft)}
.fmt button:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.fmt .fmt-cd{font:600 12px ui-monospace,Menlo,Consolas,monospace;letter-spacing:-.5px}
.mrc-pop{position:fixed;z-index:2147483000;width:min(330px,calc(100vw - 16px));box-sizing:border-box;background:var(--surface,#fff);color:var(--ink,#222);border:1px solid var(--line,#ccc);border-radius:10px;box-shadow:0 12px 32px rgb(0 0 0 / .22);padding:8px 10px;font:13px var(--body,system-ui,sans-serif)}
.mrc-pop .mrc-l{font-size:11.5px;font-weight:600;color:var(--muted,#777);margin-bottom:5px;display:flex;justify-content:space-between;gap:6px}
.mrc-pop input{width:100%;box-sizing:border-box;font:inherit;font-size:14px;padding:6px 8px;border:1px solid var(--line,#ccc);border-radius:7px;background:var(--bg,#fff);color:inherit}
.mrc-pop input:focus{outline:2px solid var(--accent,#2a7);outline-offset:-1px}
.mrc-pop .mrc-b{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}
.mrc-pop button{border:1px solid var(--line,#ccc);background:transparent;color:inherit;border-radius:7px;padding:4px 9px;font:inherit;font-size:12.5px;cursor:pointer}
.mrc-pop button:hover{background:var(--accent-soft,#eef)}
.mrc-pop button.pri{background:var(--accent,#2a7);border-color:var(--accent,#2a7);color:#fff}
.mrc-pop button[hidden]{display:none}
.mrc-mv{display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin-top:8px;padding-top:7px;border-top:1px dashed var(--line,#ccc)}
.mrc-mv span{font-size:11.5px;font-weight:600;color:var(--muted,#777);margin-right:2px}
.mrc-mv button{border:1px solid var(--line,#ccc);background:transparent;color:inherit;border-radius:7px;padding:3px 8px;font:inherit;font-size:12px;cursor:pointer}
.mrc-mv button:hover{background:var(--accent-soft,#eef)}.mrc-mv button:disabled{opacity:.45;cursor:not-allowed}
.fmt .fmt-sep{flex:none;width:1px;height:18px;background:var(--line);margin:0 3px}
.fmt [data-fmt=flx],.fmt [data-fmt=tab],.fmt [data-fmt=img],.fmt [data-fmt=cheia],.fmt [data-fmt=dest],.fmt [data-fmt=fla]{display:inline-flex;align-items:center;gap:5px;color:var(--accent)}
.fmt[hidden],.fmt-cheia textarea[hidden],.fc-prev[hidden]{display:none!important}
.fmt-abas{display:flex;gap:2px;margin:0 0 -1px;position:relative;z-index:1}
.fmt-abas button{border:1px solid var(--line);border-bottom:0;background:transparent;color:var(--muted);border-radius:8px 8px 0 0;padding:5px 14px;font:inherit;font-size:13px;font-weight:600;cursor:pointer}
.fmt-abas button.on{background:var(--surface);color:var(--ink,inherit)}
.fmt-abas button:hover{color:var(--accent)}
.fmt-abas .fa-n{font:500 11.5px var(--mono,monospace);color:var(--accent);margin-left:4px}
.fmt-abas+.fmt{border-top-left-radius:0}
.pergs{display:flex;flex-direction:column;gap:8px;border:1px solid var(--line);border-radius:0 8px 8px 8px;background:var(--bg);padding:10px;max-height:min(60vh,560px);overflow-y:auto}
.pergs[hidden]{display:none}
.projs{border:1px solid var(--line);border-radius:0 8px 8px 8px;background:var(--bg);padding:10px;max-height:min(70vh,720px);overflow-y:auto}
.projs[hidden]{display:none}
.fmt-abas .fa-r{font:500 11.5px var(--mono,monospace);color:var(--accent);margin-left:4px}
.fmt-abas .fa-j{font:500 11.5px var(--mono,monospace);color:var(--accent);margin-left:4px}
.pg-topo{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.pg-f{font-size:12.5px;color:var(--muted);display:flex;gap:6px;align-items:center;cursor:pointer}
.pg-it{border:1px solid var(--line);border-left:4px solid var(--warn,#a86400);border-radius:8px;background:var(--surface);padding:6px 8px;display:flex;flex-direction:column;gap:4px}
.pg-it.ok{border-left-color:var(--ok,#2f7d32)}
.pg-it[hidden]{display:none}
.pg-l{display:flex;gap:8px;align-items:flex-start}
.pg-tag{flex:none;width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font:700 12px var(--mono,monospace);background:color-mix(in srgb,var(--warn,#a86400) 18%,transparent);color:var(--warn,#a86400);margin-top:4px}
.pg-tag.r{background:color-mix(in srgb,var(--ok,#2f7d32) 18%,transparent);color:var(--ok,#2f7d32)}
.pergs textarea{flex:1;min-height:0!important;resize:none;overflow:hidden;border:0!important;background:transparent!important;padding:4px 2px!important;font:inherit;line-height:1.5;color:inherit;outline:none}
.pergs textarea.pg-p{font-weight:600}
.pg-x{flex:none;border:0;background:transparent;color:var(--muted);cursor:pointer;font-size:12px;padding:4px}
.pg-x:hover{color:var(--bad,#b3261e)}
.pg-vazio{margin:4px 0;color:var(--muted);font-size:13.5px}
.fmt-cheia .pergs,.fmt-cheia .projs{flex:1;max-height:none}
.pesq{display:inline;border:0;margin:0;background:color-mix(in srgb,var(--accent) 13%,transparent);color:var(--accent);border-radius:4px;padding:0 4px;font:inherit;cursor:pointer;text-decoration:underline dotted;text-underline-offset:3px;white-space:normal;user-select:all}
.pesq::after{content:"↗";font-size:.72em;margin-left:2px;vertical-align:.25em;text-decoration:none;display:inline-block}
.fcm{display:inline;background:color-mix(in srgb,#8e44ad 12%,transparent);color:#8e44ad;border-radius:4px;padding:0 4px;cursor:pointer;font:inherit;border:0;text-decoration:underline dotted;text-underline-offset:3px}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .fcm{color:#c39bd3}}
:root[data-theme="dark"] .fcm{color:#c39bd3}
.fcm::before{content:"";display:inline-block;width:.8em;height:.58em;border:1.5px solid currentColor;border-radius:2px;margin-right:4px;vertical-align:.02em;box-shadow:2px -2px 0 -0.5px var(--surface,#fff),2px -2px 0 1px currentColor}
.exm{display:inline;background:color-mix(in srgb,#b7791f 13%,transparent);color:#9a6512;border-radius:4px;padding:0 4px;cursor:help;font:inherit;border:0;text-decoration:underline dotted;text-underline-offset:3px}
.exm::after{content:"?";display:inline-block;font-size:.66em;font-weight:700;margin-left:2px;vertical-align:.45em;text-decoration:none}
.exm:hover{background:color-mix(in srgb,#b7791f 24%,transparent)}
:root[data-theme="dark"] .exm{color:#e0b062}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .exm{color:#e0b062}}
.fcm:hover{background:color-mix(in srgb,#8e44ad 22%,transparent)}
.img-lb{position:fixed;inset:0;z-index:95;background:rgb(0 0 0 / .84);display:grid;place-items:center;cursor:zoom-out}
.img-lb img{max-width:94vw;max-height:90vh;border-radius:8px;box-shadow:0 10px 40px rgb(0 0 0 / .5);background:#fff}
.img-lb button{position:fixed;top:14px;right:16px;border:0;border-radius:50%;width:36px;height:36px;background:rgb(255 255 255 / .92);color:#222;font-size:16px;cursor:pointer}
.md img.md-img,.pr-im img{cursor:zoom-in}
label.dz{display:flex;align-items:center;gap:10px;border:2px dashed var(--line);border-radius:12px;padding:16px 14px;cursor:pointer;color:var(--muted);background:var(--bg);transition:border-color .15s,background .15s;font-size:14px;position:relative}
label.dz:hover,label.dz.dz-on,[data-dz-para].dz-on{border-color:var(--accent);background:var(--accent-soft);color:var(--ink)}
label.dz .dz-ic{font-size:22px;line-height:1;color:var(--accent)}
label.dz .dz-inp{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
label.dz:focus-within{outline:2px solid var(--accent);outline-offset:2px}
.pesq:hover{background:color-mix(in srgb,var(--accent) 22%,transparent)}
.wys{position:relative;display:block;background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:8px 12px;min-height:120px;max-height:min(60vh,560px);overflow-y:auto;overflow-x:hidden;resize:vertical;line-height:1.6;outline:none;cursor:text;overflow-wrap:anywhere;max-width:none;color:var(--ink,inherit)}
.wys:focus{outline:2px solid var(--accent);outline-offset:-1px}
.wys.vazio::before{content:attr(data-ph);position:absolute;left:12px;top:8px;right:12px;color:var(--muted);pointer-events:none}
.wys>div,.wys>p{margin:0;min-height:1.6em}
.wys h1{font-size:1.45em;margin:.35em 0 .2em}.wys h2{font-size:1.25em;margin:.35em 0 .2em}.wys h3{font-size:1.1em;margin:.3em 0 .15em}
.wys ul,.wys ol{margin:.2em 0;padding-left:1.6em}
.wys ul.tk{list-style:none;padding-left:.2em}
.wys ul.tk>li{position:relative;padding-left:1.7em}
.wys ul.tk>li::before{content:"☐";position:absolute;left:0;top:0;cursor:pointer;font-size:1.05em}
.wys ul.tk>li[data-tk="1"]::before{content:"☑";color:var(--accent)}
.wys ul.tk>li[data-tk="1"]{color:var(--muted);text-decoration:line-through}
.wys li[data-ind]{margin-left:1.2em}
.wys table,.md table{border-collapse:collapse;margin:.5em 0;display:block;max-width:100%;overflow-x:auto;font-size:.95em}
.wys th,.wys td,.md th,.md td{border:1px solid var(--line);padding:5px 9px;min-width:60px;vertical-align:top;text-align:left}
.wys th,.md th{background:var(--accent-soft);font-weight:700}
.wys td:focus-within,.wys th:focus-within{outline:2px solid var(--accent);outline-offset:-2px}
.tb-pop{position:fixed;z-index:9999;background:var(--surface,#fff);color:var(--ink,inherit);border:1px solid var(--line);border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,.25);padding:10px;display:flex;flex-direction:column;gap:8px;min-width:200px;font-size:13.5px}
.tb-pop .tb-l{display:flex;gap:8px;align-items:center}
.tb-pop label{display:flex;flex-direction:column;gap:2px;font-size:12px;color:var(--muted)}
.tb-pop input{width:64px;padding:4px 6px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:inherit;font:inherit}
.tb-pop button{border:1px solid var(--line);background:transparent;color:inherit;border-radius:7px;padding:5px 10px;font:inherit;cursor:pointer;text-align:left}
.tb-pop button:hover{background:var(--accent-soft)}
.tb-pop .tb-pri{background:var(--accent);color:#fff;border-color:var(--accent);text-align:center}
.tb-pop .tb-rm{color:#c0392b}
.tb-pop .tb-t{font-weight:700;font-size:12.5px}
.fmt .fmt-rev{font-weight:700;font-size:12px;letter-spacing:-.02em}
.rev-pop{max-width:320px}
.tb-pop label.rev-op{display:flex;flex-direction:row;gap:8px;align-items:flex-start;cursor:pointer;padding:4px 2px;color:inherit;font-size:13.5px}
.tb-pop .rev-op input{width:auto;padding:0}
.rev-op input{margin-top:3px;flex:none}.rev-op span{display:flex;flex-direction:column;gap:2px}.rev-op small{color:var(--muted);font-size:12px;line-height:1.35}
.fmt-sug{position:fixed;pointer-events:none;color:var(--muted);opacity:.75;z-index:10002;white-space:pre}
.tb-ctl>div{position:fixed;z-index:10001;display:none;gap:2px}
.tb-ctl .tb-cc{flex-direction:column}
.tb-ctl.on>div{display:flex}
.tb-ctl button{width:18px;height:18px;padding:0;border:1px solid var(--line);border-radius:5px;background:var(--surface,#fff);color:var(--muted);font:600 13px/1 system-ui,sans-serif;cursor:pointer;opacity:.45;transition:opacity .15s,color .15s,background .15s}
.tb-ctl button:hover{opacity:1;color:var(--accent);background:var(--accent-soft)}
.tb-ctl button[data-tc^="-"]:hover{color:#c0392b}
.tb-ctl button:disabled{opacity:.15;cursor:default}
.tb-ctl [data-tc=x]{font-size:11px}
.tb-ctl [data-tc=x]:hover,.tb-ctl [data-tc=x].conf{color:#c0392b;background:rgba(192,57,43,.1);border-color:#c0392b}
.tb-ctl [data-tc=x].conf{width:auto;padding:0 6px;opacity:1;font-size:11.5px}
.wys ol,.md ol.sn{list-style:none;counter-reset:sn;padding-left:1.9em}
.wys ol>li,.md ol.sn>li{counter-increment:sn;position:relative}
.wys ol>li::before,.md ol.sn>li::before{content:counters(sn,".") ".";position:absolute;right:100%;margin-right:.4em;white-space:nowrap;font-variant-numeric:tabular-nums;color:var(--muted)}
.wys li>ul,.wys li>ol,.md li>ul,.md li>ol{margin:.1em 0}.wys li>ol,.md li>ol.sn{padding-left:2.4em}
.md ul ul{list-style:circle}.md ul ul ul{list-style:square}
.wys ul ul{list-style:circle}.wys ul ul ul{list-style:square}
.wys blockquote{margin:.4em 0;padding:4px 12px;border-left:3px solid var(--accent);background:var(--accent-soft);border-radius:0 6px 6px 0}
.wys pre{background:var(--accent-soft);padding:8px 10px;border-radius:8px;font:13px/1.5 var(--mono,monospace);white-space:pre-wrap;margin:.4em 0}
.wys code{font-family:var(--mono,monospace);background:var(--accent-soft);padding:0 4px;border-radius:4px}
.wys mark{background:#fde68a;color:#3b2f00;padding:0 2px;border-radius:3px}
.wys hr{border:0;border-top:1px solid var(--line);margin:.8em 0}
.wys a{color:var(--accent);text-decoration:underline}
.wys img.md-img{display:block;max-width:100%;height:auto;margin:6px 0;border-radius:8px;border:1px solid var(--line);background:var(--accent-soft);min-height:40px}
.wys img.md-img-falha{min-width:160px;min-height:60px;opacity:.6}
.wys .fx-bloco{margin:12px 0 10px}
.wys>div[data-aux]{min-height:1.7em}
.fx-bloco-h{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--muted)}
.fx-bloco-h button{border:1px solid var(--line);background:var(--surface);color:var(--accent);border-radius:7px;padding:3px 10px;cursor:pointer;font:inherit;font-size:12.5px}
.fx-bloco-h .fx-rm{color:var(--bad,#b3261e)}
.fx-bloco-h .fx-sp{flex:1}
.fx-bloco-h .fx-tema{border:0;background:transparent;color:var(--ink,inherit);font-weight:600;font-size:13.5px;padding:2px 4px;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%}
.fx-bloco-h .fx-tema:hover{text-decoration:underline dotted}
.fx-bloco-h .fx-tema::before{content:"⬡ ";color:var(--accent)}
.fx-dobra{border:0!important;background:transparent!important;padding:4px!important;display:inline-flex}
.fx-dobra .chev{width:7px;height:7px;border-right:2px solid var(--muted);border-bottom:2px solid var(--muted);transform:rotate(45deg);transition:transform .15s;display:inline-block}
.fx-bloco.recolhido .fx-dobra .chev{transform:rotate(-45deg)}
.fx-bloco.recolhido{padding:4px 8px}
.fx-bloco.recolhido>:not(.fx-bloco-h){display:none!important}
.wys.fmt-drop{outline:2px dashed var(--accent);outline-offset:-4px}
.wys[hidden]{display:none!important}
.fmt-cheia .wys{flex:1;min-height:0;max-height:none;resize:none;font-size:16.5px;line-height:1.7;padding:14px 18px}
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

  function barra(doc,ta){
    const pip=doc!==document, semDest=pip||!window.FORMATO_DESTACAR||!ta||ta.id==="fl-txt"||ta.dataset.rich;
    const d=doc.createElement("div"); d.className="fmt"; d.setAttribute("role","toolbar"); d.setAttribute("aria-label","Formatação rápida");
    d.innerHTML=BOTOES.filter(([k])=>!(pip&&(k==="flx"||k==="cheia"||k==="rev"))&&!(k==="dest"&&semDest)&&!(k==="fla"&&(pip||!window.FORMATO_FLASH||(ta&&ta.dataset.rich)))&&!(k==="mrc"&&!window.FORMATO_FLASH_MARCA)&&!(k==="exp"&&!window.FORMATO_EXPLICA)&&!(ta&&ta.dataset.leve&&/^(flx|cheia|dest|fla|mrc|exp)$/.test(k))).map(([k,h,t],i)=>((k==="neg"&&!pip)||k==="tit"||k==="cit"||k==="img"||k==="rev"?'<span class="fmt-sep"></span>':"")+`<button type="button" data-fmt="${k}" title="${t}" aria-label="${t}">${h}</button>`).join("");
    return d;
  }
  function equipar(raiz){
    if(typeof aplicarRev==="function") aplicarRev(raiz);
    equiparZonas(raiz); ligarZonas(raiz.ownerDocument||raiz);
    raiz.querySelectorAll(ALVOS).forEach(ta=>{
      if(ta.dataset.fmtOk) return; ta.dataset.fmtOk="1";
      const p=ta.previousElementSibling; if(p&&p.classList.contains("fmt")) return;
      ta.parentNode.insertBefore(barra(ta.ownerDocument,ta),ta);
      if(ta.ownerDocument===document){
        // blocos ```mermaid antigos viram linha curta + doc (o desenho aparece no lugar)
        if(window.FLUXO&&FLUXO.converter&&/```mermaid/.test(ta.value)){ const nv=FLUXO.converter(ta.value); if(nv!==ta.value){ ta.value=nv; ta.dispatchEvent(new Event("input",{bubbles:true})); } }
        montar(ta);
      }
    });
  }
  /* ---- Editor visual (estilo Word) ----
     A caixa de texto original continua sendo a fonte (fica escondida, guarda o texto em Markdown e dispara
     "input" para o app salvar). Por cima dela fica um editor "contenteditable" que mostra a formatação
     pronta: negrito, itálico, marca-texto, títulos, listas, tarefas, citação, código, links, imagens e
     fluxogramas desenhados no ponto onde foram inseridos. */
  const RE_LFX=/^\s*!\[[^\]\n]*\]\(fx:([A-Za-z0-9_-]+)\)\s*$/;
  // <termo> vira um termo pesquisável (abre no mininavegador de pesquisa)
  const RE_PESQ=/<([^\s<>](?:[^<>\n]{0,78}[^\s<>])?)>/g;
  // {{pergunta}} vira marcador de flashcard (o texto envolvido é a frente do cartão)
  const RE_FCM=/\{\{([^{}\n]{1,200}?)\}\}/g;
  const RE_EXM=/\(\(([^()\n]{1,120}?)\)\)/g;
  const dicaExp=t=>{ let d=""; try{ d=window.FORMATO_EXPLICA&&FORMATO_EXPLICA.dica?FORMATO_EXPLICA.dica(t):""; }catch(e){} return d?d+" · clique para abrir":"Explicação: clique para ver ou escrever"; };
  const escH=t=>String(t??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  function inlineHtml(t){
    const codigos=[]; let s=String(t).replace(/`([^`]+)`/g,(x,c)=>{ codigos.push(c); return ""+(codigos.length-1)+""; });
    const termos=[]; s=s.replace(RE_PESQ,(x,q)=>{ termos.push(q); return "\uE003"+(termos.length-1)+"\uE004"; });
    const cards=[]; if(window.FORMATO_FLASH_MARCA) s=s.replace(RE_FCM,(x,q)=>{ cards.push(q.trim()); return "\uE005"+(cards.length-1)+"\uE006"; });
    const exps=[]; if(window.FORMATO_EXPLICA) s=s.replace(RE_EXM,(x,q)=>{ exps.push(q.trim()); return "\uE007"+(exps.length-1)+"\uE008"; });
    s=escH(s)
      .replace(/!\[([^\]]*)\]\((sb:[^)\s]+|https?:\/\/[^)\s]+)\)/g,(x,alt,u)=>u.startsWith("sb:")?`<img class="md-img" data-sb="${u.slice(3)}" alt="${alt||"imagem"}">`:`<img class="md-img" src="${u}" alt="${alt||"imagem"}">`)
      .replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>")
      .replace(/(^|[^*])\*([^*\s][^*]*)\*/g,"$1<i>$2</i>")
      .replace(/==([^=]+)==/g,"<mark>$1</mark>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,'<a href="$2">$1</a>');
    return s.replace(/(\d+)/g,(x,i)=>"<code>"+escH(codigos[+i])+"</code>").replace(/\uE003(\d+)\uE004/g,(x,i)=>`<span class="pesq" contenteditable="false" data-q="${escH(termos[+i])}" title="Pesquisar “${escH(termos[+i])}”">${escH(termos[+i])}</span>`)
      .replace(/\uE005(\d+)\uE006/g,(x,i)=>`<span class="fcm" contenteditable="false" data-fc="${escH(cards[+i])}" title="Flashcard: clique para ver ou editar">${escH(cards[+i])}</span>`)
      .replace(/\uE007(\d+)\uE008/g,(x,i)=>`<span class="exm" contenteditable="false" data-ex="${escH(exps[+i])}" title="${escH(dicaExp(exps[+i]))}">${escH(exps[+i])}</span>`);
  }
  // Tema do fluxograma: o nome dado pelo usuário ou o primeiro passo que não seja Início/Fim.
  function temaFx(d){ if(!d) return "Fluxograma"; if(d.titulo) return d.titulo; const n=((d.modelo&&d.modelo.nos)||[]).map(x=>x.texto).find(t=>t&&!/^(in[ií]cio|fim)$/i.test(t.trim())); return n||"Fluxograma"; }
  function fxHtml(id, linha){
    const d=typeof S==="object"&&S&&S.docs?S.docs["fx-"+id]:null, ok=d&&!d.apagado, rec=ok&&d.recolhido;
    return `<div class="fx-bloco${rec?" recolhido":""}" contenteditable="false" data-linha="${escH(linha)}" data-fxid="${id}">`+
      `<div class="fx-bloco-h"><button type="button" class="fx-dobra" data-fxb="dobrar" aria-expanded="${!rec}" title="${rec?"Mostrar":"Recolher"} fluxograma"><span class="chev"></span></button><button type="button" class="fx-tema" data-fxb="nome" title="Renomear o tema do fluxograma">${escH(temaFx(d))}</button><span class="fx-sp"></span><button type="button" data-fxb="editar">Editar</button><button type="button" class="fx-rm" data-fxb="tirar">Remover</button></div>`+
      (ok?(window.FLUXO&&FLUXO.extras?FLUXO.extras(d).desc:"")+`<div class="fx-svg" data-src="${encodeURIComponent(d.codigo||"")}"><p class="muted" style="margin:0;font-size:13px">Desenhando fluxograma…</p></div>`+(window.FLUXO&&FLUXO.extras?FLUXO.extras(d).lista:""):'<p class="muted" style="margin:0;font-size:13px">Fluxograma ainda não chegou neste aparelho (sincronizando).</p>')+
      `</div>`;
  }
  // Linhas de lista (com recuo) → listas aninhadas. wys=true: editor; false: Visualizar (inl = conversor da página).
  const RE_ITEM=/^(\s*)(?:([-*])\s+\[([ xX])\]\s?|([-*])\s+|(\d+)[.)]\s+)(.*)$/;
  function ehItem(l){ return RE_ITEM.test(l); }
  function listaHtml(ls, wys, inl){
    let o="", st=[];
    for(const l of ls){ const m=l.match(RE_ITEM); const ind=m[1].replace(/\t/g,"  ").length, tk=!!m[2], tag=m[5]?"ol":"ul", txt=m[6];
      while(st.length&&ind<st[st.length-1].ind&&!(st.length>1&&ind>st[st.length-2].ind)){ o+=`</li></${st.pop().tag}>`; }
      const top=st[st.length-1];
      const abrir=()=>{ o+=`<${tag}${tk?' class="tk"':!wys&&tag==="ol"?' class="sn"':""}>`; st.push({ind,tag,tk}); };
      if(top&&ind<=top.ind){ if(top.tag===tag&&top.tk===tk) o+="</li>"; else { o+=`</li></${st.pop().tag}>`; abrir(); } }
      else abrir();
      const ok=tk&&m[3]!==" ";
      o+= wys ? `<li${tk?` data-tk="${ok?1:0}"`:""}>${inlineHtml(txt)||"<br>"}` : `<li${tk?` class="tk${ok?" ok":""}"`:""}>${tk?(ok?"☑ ":"☐ "):""}${inl(txt)}`;
    }
    while(st.length) o+=`</li></${st.pop().tag}>`;
    return o;
  }
  // Tabelas Markdown (| a | b | + | --- | --- |)
  const RE_SEPTB=/^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
  function ehTabela(ls,i){ return /^\s*\|/.test(ls[i]||"")&&RE_SEPTB.test(ls[i+1]||"")&&(ls[i+1]||"").includes("-"); }
  function celulas(l){ let t=l.trim(); if(t.startsWith("|")) t=t.slice(1); if(t.endsWith("|")&&!t.endsWith("\\|")) t=t.slice(0,-1); return t.split(/(?<!\\)\|/).map(c=>c.trim().replace(/\\\|/g,"|")); }
  // devolve [html, última linha usada]
  function tabelaHtml(ls,i,cel){ const cab=celulas(ls[i]); const n=cab.length; let j=i+2; const linhas=[];
    while(j<ls.length&&/^\s*\|/.test(ls[j])){ const c=celulas(ls[j]); while(c.length<n) c.push(""); linhas.push(c.slice(0,n)); j++; }
    const h=`<table><thead><tr>${cab.map(c=>`<th>${cel(c)}</th>`).join("")}</tr></thead><tbody>${linhas.map(r=>`<tr>${r.map(c=>`<td>${cel(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    return [h,j-1]; }
  function mdParaHtml(v){
    const ls=String(v||"").split("\n"); let o="", lista=null, ultFx=false; const AUX='<div data-aux="1"><br></div>';
    const fecha=()=>{ if(lista){ o+=`</${lista.tag}>`; lista=null; } };
    const abre=(tag,tk)=>{ if(!lista||lista.tag!==tag||lista.tk!==tk){ fecha(); o+=`<${tag}${tk?' class="tk"':""}>`; lista={tag,tk}; } };
    for(let i=0;i<ls.length;i++){ const l=ls[i]; const eraFx=ultFx; ultFx=false;
      if(/^```/.test(l)){ fecha(); let j=i+1; const c=[]; while(j<ls.length&&!/^```\s*$/.test(ls[j])){ c.push(ls[j]); j++; } o+=`<pre>${escH(c.join("\n"))||"<br>"}</pre>`; i=j; continue; }
      let m=l.match(RE_LFX); if(m){ fecha(); if(eraFx||!o) o+=AUX; o+=fxHtml(m[1], l.trim()); ultFx=true; continue; }
      if(/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(l)){ fecha(); o+="<hr>"; continue; }
      m=l.match(/^(#{1,3})\s+(.*)$/); if(m){ fecha(); o+=`<h${m[1].length}>${inlineHtml(m[2])||"<br>"}</h${m[1].length}>`; continue; }
      if(ehTabela(ls,i)){ fecha(); const [h,f]=tabelaHtml(ls,i,c=>inlineHtml(c)||"<br>"); o+=h; i=f; if(i===ls.length-1) o+='<div><br></div>'; continue; }
      if(ehItem(l)){ fecha(); const b=[l]; while(i+1<ls.length&&ehItem(ls[i+1])){ i++; b.push(ls[i]); } o+=listaHtml(b,true); continue; }
      if(/^>/.test(l)){ fecha(); const q=[l]; while(i+1<ls.length&&/^>/.test(ls[i+1])){ i++; q.push(ls[i]); } o+="<blockquote>"+q.map(x=>`<div>${inlineHtml(x.replace(/^>\s?/,""))||"<br>"}</div>`).join("")+"</blockquote>"; continue; }
      fecha(); o+=`<div>${inlineHtml(l)||"<br>"}</div>`;
    }
    fecha(); if(ultFx) o+=AUX; return o||"<div><br></div>";
  }
  // HTML do editor → Markdown
  const BLOCO=/^(DIV|P|H1|H2|H3|H4|H5|H6|UL|OL|LI|BLOCKQUOTE|PRE|HR|TABLE|SECTION|ARTICLE|HEADER|FOOTER)$/;
  function envolve(x,m){ const k=x.match(/^(\s*)([\s\S]*?)(\s*)$/); return k[2]?k[1]+m+k[2]+m+k[3]:x; }
  function inl(node){
    let o=""; for(const n of node.childNodes){
      if(n.nodeType===3){ o+=n.nodeValue.replace(/ /g," ").replace(/[​﻿]/g,""); continue; }
      if(n.nodeType!==1) continue; const t=n.tagName;
      if(t==="BR"){ o+="\n"; continue; }
      if(BLOCO.test(t)){ const x=linhasDe(n).join("\n"); o+=(o&&!o.endsWith("\n")?"\n":"")+x; continue; }
      if(t==="B"||t==="STRONG"){ o+=envolve(inl(n),"**"); continue; }
      if(t==="I"||t==="EM"){ o+=envolve(inl(n),"*"); continue; }
      if(t==="MARK"){ o+=envolve(inl(n),"=="); continue; }
      if(t==="CODE"){ o+=n.textContent?"`"+n.textContent+"`":""; continue; }
      if(t==="A"){ const h=n.getAttribute("href")||""; const x=inl(n); o+=/^https?:/.test(h)?`[${x||h}](${h})`:x; continue; }
      if(t==="IMG"){ const alt=(n.getAttribute("alt")||"imagem").replace(/[\[\]]/g,""); if(n.dataset.sb) o+=`![${alt}](sb:${n.dataset.sb})`; else if(/^https?:/.test(n.getAttribute("src")||"")) o+=`![${alt}](${n.getAttribute("src")})`; continue; }
      if(t==="SPAN"&&n.classList.contains("pesq")){ o+="<"+(n.dataset.q||n.textContent).trim()+">"; continue; }
      if(t==="SPAN"&&n.classList.contains("fcm")){ o+="{{"+(n.dataset.fc||n.textContent).trim()+"}}"; continue; }
      if(t==="SPAN"&&n.classList.contains("exm")){ o+="(("+(n.dataset.ex||n.textContent).trim()+"))"; continue; }
      if(t==="SPAN"||t==="FONT"){ let x=inl(n); const st=n.style||{}; if(/bold|[6-9]00/.test(st.fontWeight||"")) x=envolve(x,"**"); if(st.fontStyle==="italic") x=envolve(x,"*"); o+=x; continue; }
      o+=inl(n);
    }
    return o;
  }
  function itens(lista, prof, out){
    let n=0; const tk=lista.classList.contains("tk");
    for(const li of lista.children){ if(li.tagName!=="LI"){ if(/^(UL|OL)$/.test(li.tagName)) itens(li,prof+1,out); continue; }
      const sub=[...li.children].filter(c=>/^(UL|OL)$/.test(c.tagName)); const cl=li.cloneNode(true); cl.querySelectorAll(":scope > ul, :scope > ol").forEach(x=>x.remove());
      const ind=" ".repeat(prof*2||+(li.dataset.ind||0)), txt=inl(cl).replace(/\n+$/,"").replace(/\n/g," ");
      const pre= tk||li.dataset.tk!==undefined ? `- [${li.dataset.tk==="1"?"x":" "}] ` : lista.tagName==="OL" ? (++n)+". " : "- ";
      out.push(ind+pre+txt); sub.forEach(s=>itens(s,prof+1,out));
    }
  }
  function linhasDe(el){
    const out=[]; let buf=null;
    const flush=()=>{ if(buf){ const x=inl(buf).replace(/\n$/,""); out.push(...x.split("\n")); buf=null; } };
    for(const n of el.childNodes){
      const t=n.nodeType===1?n.tagName:"";
      if(n.nodeType===3||(n.nodeType===1&&!BLOCO.test(t)&&!(n.classList&&n.classList.contains("fx-bloco")))){ if(n.nodeType===3&&!n.nodeValue.trim()&&!buf) continue; if(!buf) buf=document.createElement("div"); buf.appendChild(n.cloneNode(true)); continue; }
      flush(); if(n.nodeType!==1) continue;
      if(n.classList.contains("fx-bloco")){ out.push(n.dataset.linha); continue; }
      if(n.dataset&&n.dataset.aux&&!n.textContent.replace(/[\u200b\u00a0\s]/g,"")&&!n.querySelector("img,.pesq,.fcm,.exm,.fx-bloco")) continue;
      if(/^H[1-6]$/.test(t)){ out.push("#".repeat(Math.min(3,+t[1]))+" "+inl(n).replace(/\n/g," ").trim()); continue; }
      if(t==="UL"||t==="OL"){ itens(n,0,out); continue; }
      if(t==="BLOCKQUOTE"){ linhasDe(n).forEach(x=>out.push("> "+x)); continue; }
      if(t==="PRE"){ out.push("```", ...n.textContent.replace(/\n$/,"").split("\n"), "```"); continue; }
      if(t==="HR"){ out.push("---"); continue; }
      if(t==="TABLE"){ const trs=[...n.querySelectorAll("tr")]; if(!trs.length) continue;
        const cel=c=>inl(c).replace(/\n+/g," ").replace(/[\u200b]/g,"").trim().replace(/\|/g,"\\|")||" ";
        const rows=trs.map(tr=>[...tr.children].map(cel)); const nc=Math.max(...rows.map(r=>r.length));
        rows.forEach(r=>{ while(r.length<nc) r.push(" "); });
        out.push("| "+rows[0].join(" | ")+" |", "|"+" --- |".repeat(nc), ...rows.slice(1).map(r=>"| "+r.join(" | ")+" |")); continue; }
      if([...n.children].some(c=>BLOCO.test(c.tagName)||c.classList.contains("fx-bloco"))){ out.push(...linhasDe(n)); continue; }
      const x=inl(n).replace(/\n$/,""); out.push(...x.split("\n"));
    }
    flush(); return out;
  }
  function htmlParaMd(ed){ const ls=linhasDe(ed); while(ls.length&&ls[ls.length-1].trim()==="") ls.pop(); return ls.join("\n"); }

  const descV=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,"value");
  function escrever(ta,v){ ta._sync=true; ta.value=v; ta._sync=false; ta.dispatchEvent(new Event("input",{bubbles:true})); }
  /* ---- Perguntas e respostas: ficam no fim da mesma anotação, numa seção "## Perguntas e respostas"
     com pares "**P:** …" / "**R:** …". A aba Anotações edita só o texto de cima; a aba Perguntas, só a seção. */
  const MARCA_P="## Perguntas e respostas";
  function separar(v){ v=String(v||""); const m=v.match(/^## Perguntas e respostas[ \t]*$/m); if(!m) return {notas:v,pergs:""}; return {notas:v.slice(0,m.index).replace(/\s+$/,""), pergs:v.slice(m.index+m[0].length).replace(/^\s*\n/,"").replace(/\s+$/,"")}; }
  function juntar(notas,pergs){ notas=String(notas||""); return pergs&&pergs.trim()? (notas.trim()?notas.replace(/\s+$/,"")+"\n\n":"")+MARCA_P+"\n"+pergs.trim() : notas; }
  function lerPergs(txt){
    const out=[]; let cur=null;
    for(const l of String(txt||"").split("\n")){
      let m=l.match(/^\*\*P:\*\*\s?(.*)$/); if(m){ cur={p:m[1],r:"",modo:"p"}; out.push(cur); continue; }
      m=l.match(/^\*\*R:\*\*\s?(.*)$/); if(m&&cur){ cur.r=m[1]; cur.modo="r"; continue; }
      if(!cur){ if(l.trim()) { cur={p:l.trim(),r:"",modo:"p"}; out.push(cur); } continue; }
      if(cur.modo==="r") cur.r+="\n"+l; else if(l.trim()) cur.p+=" "+l.trim();
    }
    return out.map(x=>({p:x.p.trim(), r:x.r.replace(/\s+$/,"").replace(/^\s*\n/,"")}));
  }
  const pergsMd = l => l.filter(x=>x.p.trim()||x.r.trim()).map(x=>`**P:** ${x.p.replace(/\s*\n\s*/g," ").trim()}\n**R:** ${x.r.replace(/\n{2,}/g,"\n").trim()}`).join("\n\n");
  function sincronizar(ed){ const ta=ed._ta, n=htmlParaMd(ed), v=juntar(n, separar(ta.value).pergs); ed.classList.toggle("vazio",!n.trim()&&!ed.querySelector("img,hr,.fx-bloco,li")); if(v!==ta.value) escrever(ta,v); }
  // fluxograma editado: redesenha os blocos dele (título, descrição e desenho)
  document.addEventListener("caderno:fx",e=>{ const id=e.detail&&e.detail.id; if(!id) return; const docs=[document]; try{ if(typeof PIP!=="undefined"&&PIP&&!PIP.closed) docs.push(PIP.document); }catch(x){}
    docs.forEach(dc=>dc.querySelectorAll(`.fx-bloco[data-fxid="${id}"]`).forEach(b=>{ const t=dc.createElement("div"); t.innerHTML=fxHtml(id,b.dataset.linha||""); const n=t.firstElementChild; if(n) b.replaceWith(n); })); });
  function focarNovo(ed){ const id=window.__fxNovo; if(!id) return; if(!ed.querySelector(`.fx-bloco[data-fxid="${id}"]`)) return; window.__fxNovo=null;
    setTimeout(()=>{ const b=ed.querySelector(`.fx-bloco[data-fxid="${id}"]`); if(!b) return;
      let n=b.nextElementSibling; if(!n||n.classList.contains("fx-bloco")){ n=document.createElement("div"); n.dataset.aux="1"; n.innerHTML="<br>"; b.after(n); }
      ed.focus(); const r=document.createRange(); r.setStart(n,0); r.collapse(true); const s=getSelection(); s.removeAllRanges(); s.addRange(r); n.scrollIntoView({block:"nearest"}); },60); }
  function desenhar(ta){ const ed=ta._ed; if(!ed) return; const {notas}=separar(ta.value); if(htmlParaMd(ed)!==notas.replace(/\s+$/,"")){ ed.innerHTML=mdParaHtml(notas); ed.classList.toggle("vazio",!notas.trim()); } focarNovo(ed); if(ta._pg&&ta._aba==="p"&&!ta._pg.contains(document.activeElement)) desenharPergs(ta); contarPergs(ta); }
  function contarPergs(ta){ if(!ta._abas) return; const l=lerPergs(separar(ta.value).pergs), sem=l.filter(x=>!x.r.trim()).length; ta._abas.querySelector(".fa-n").textContent=l.length?(sem?`${l.length} · ${sem} sem resposta`:String(l.length)):""; }
  function desenharPergs(ta){
    const l=lerPergs(separar(ta.value).pergs), pg=ta._pg;
    pg.innerHTML=`<div class="pg-topo"><button type="button" class="btn sm pri" data-pg="nova">+ Nova pergunta</button><label class="pg-f"><input type="checkbox" data-pg="filtro" ${ta._pgFiltro?"checked":""}> só sem resposta</label></div>`+
      (l.length? l.map((x,i)=>`<div class="pg-it${x.r.trim()?" ok":""}" data-i="${i}" ${ta._pgFiltro&&x.r.trim()?"hidden":""}><div class="pg-l"><span class="pg-tag">P</span><textarea class="pg-p" rows="1" placeholder="Escreva a pergunta…">${escH(x.p)}</textarea><button type="button" class="pg-x" data-pg="tirar" title="Apagar pergunta" aria-label="Apagar pergunta">✕</button></div><div class="pg-l"><span class="pg-tag r">R</span><textarea class="pg-r" rows="1" placeholder="Resposta (do instrutor, do material ou sua)…">${escH(x.r)}</textarea></div></div>`).join("")
        : '<p class="pg-vazio">Nenhuma pergunta ainda. Anote dúvidas da aula para perguntar ao instrutor e registre a resposta depois.</p>');
    pg.querySelectorAll("textarea").forEach(ajustarPg);
  }
  function ajustarPg(t){ t.style.height="auto"; t.style.height=t.scrollHeight+"px"; }
  function salvarPergs(ta){
    const l=[...ta._pg.querySelectorAll(".pg-it")].map(it=>({p:it.querySelector(".pg-p").value, r:it.querySelector(".pg-r").value}));
    const v=juntar(separar(ta.value).notas, pergsMd(l)); if(v!==ta.value) escrever(ta,v); contarPergs(ta);
  }
  // aba aberta por caixa (Anotações / Perguntas / Projetos) sobrevive ao redesenho da tela
  const ABA_MEM={}; const chaveAba=ta=>ta.id||(ta.dataset.dnota?"d:"+ta.dataset.dnota:"");
  function trocarAba(ta,aba,semFoco){
    if((aba==="j"&&!ta._pj)||(aba==="r"&&!ta._pr)) aba="n";
    ta._aba=aba; const ab=ta._abas, bar=ab.nextElementSibling&&ab.nextElementSibling.classList.contains("fmt")?ab.nextElementSibling:null;
    const ch=chaveAba(ta); if(ch) ABA_MEM[ch]=aba;
    if(ab.parentNode&&ab.parentNode.setAttribute) ab.parentNode.setAttribute("data-aba-atual",aba);
    ab.querySelectorAll("[data-faba]").forEach(b=>{ const on=b.dataset.faba===aba; b.classList.toggle("on",on); b.setAttribute("aria-selected",String(on)); });
    if(bar) bar.hidden=aba!=="n"; if(ta._ed) ta._ed.hidden=aba!=="n"; ta._pg.hidden=aba!=="p"; if(ta._pj) ta._pj.hidden=aba!=="j"; if(ta._pr) ta._pr.hidden=aba!=="r";
    if(aba==="r"){ if(window.FORMATO_PRAT) FORMATO_PRAT.desenhar(ta._pr, ta._pjk, ta); return; }
    if(aba==="j"){ if(window.FORMATO_PROJ) FORMATO_PROJ.desenhar(ta._pj, ta._pjk, ta); return; }
    if(semFoco){ if(aba==="p") desenharPergs(ta); return; }
    if(aba==="p"){ desenharPergs(ta); const t=ta._pg.querySelector(".pg-p"); if(!t) ta._pg.querySelector('[data-pg="nova"]').focus(); } else if(ta._ed) ta._ed.focus();
  }
  document.addEventListener("click",e=>{
    const a=e.target.closest&&e.target.closest("[data-faba]"); if(a){ const ta=a.closest(".fmt-abas")._ta; if(ta) trocarAba(ta,a.dataset.faba); return; }
    const b=e.target.closest&&e.target.closest(".pergs [data-pg]"); if(!b||b.tagName==="INPUT") return; const pg=b.closest(".pergs"), ta=pg._ta;
    if(b.dataset.pg==="nova"){ const l=lerPergs(separar(ta.value).pergs); l.push({p:"",r:""}); ta._pgNova=true; ta._pgFiltro=false;
      // pergunta vazia só vai para o texto quando tiver conteúdo; aqui só desenha
      desenharPergs(ta); const it=document.createElement("div"); it.className="pg-it"; it.dataset.i="novo";
      it.innerHTML=`<div class="pg-l"><span class="pg-tag">P</span><textarea class="pg-p" rows="1" placeholder="Escreva a pergunta…"></textarea><button type="button" class="pg-x" data-pg="tirar" aria-label="Apagar pergunta">✕</button></div><div class="pg-l"><span class="pg-tag r">R</span><textarea class="pg-r" rows="1" placeholder="Resposta (do instrutor, do material ou sua)…"></textarea></div>`;
      const vz=pg.querySelector(".pg-vazio"); if(vz) vz.remove(); pg.appendChild(it); it.querySelector(".pg-p").focus(); return; }
    if(b.dataset.pg==="tirar"){ const it=b.closest(".pg-it"); if(!b.dataset.conf&&(it.querySelector(".pg-p").value.trim()||it.querySelector(".pg-r").value.trim())){ b.dataset.conf="1"; b.textContent="Apagar?"; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.conf; b.textContent="✕"; } },3000); return; }
      it.remove(); salvarPergs(ta); if(!pg.querySelector(".pg-it")) desenharPergs(ta); }
  });
  document.addEventListener("change",e=>{ const t=e.target; if(t.dataset&&t.dataset.pg==="filtro"){ const ta=t.closest(".pergs")._ta; ta._pgFiltro=t.checked; salvarPergs(ta); desenharPergs(ta); } });
  document.addEventListener("input",e=>{ const t=e.target; if(!t.classList||!(t.classList.contains("pg-p")||t.classList.contains("pg-r"))) return; ajustarPg(t); const it=t.closest(".pg-it"); it.classList.toggle("ok",!!it.querySelector(".pg-r").value.trim()); salvarPergs(t.closest(".pergs")._ta); });
  document.addEventListener("keydown",e=>{ const t=e.target; if(t.classList&&t.classList.contains("pg-p")&&e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); const r=t.closest(".pg-it").querySelector(".pg-r"); r.focus(); } });
  function montarAbas(ta){
    if(ta.dataset.semAbas) return;
    const bar=ta.previousElementSibling; if(!bar||!bar.classList.contains("fmt")) return;
    const pk=window.FORMATO_PROJ&&FORMATO_PROJ.disc ? FORMATO_PROJ.disc(ta) : null;
    const ab=document.createElement("div"); ab.className="fmt-abas"; ab.setAttribute("role","tablist"); ab._ta=ta;
    ab.innerHTML=`<button type="button" role="tab" class="on" aria-selected="true" data-faba="n">Anotações</button><button type="button" role="tab" aria-selected="false" data-faba="p">Perguntas <span class="fa-n"></span></button>`+
      (pk&&window.FORMATO_PRAT?`<button type="button" role="tab" aria-selected="false" data-faba="r" title="Práticas desta disciplina: mini projetos com objetivo, passos e anotações">Prática <span class="fa-r"></span></button>`:"")+
      (pk?`<button type="button" role="tab" aria-selected="false" data-faba="j" title="Parte desta disciplina no projeto e ligação com outras disciplinas">Projetos <span class="fa-j"></span></button>`:"");
    bar.before(ab); ta._abas=ab;
    const pg=document.createElement("div"); pg.className="pergs"; pg.hidden=true; pg._ta=ta; (ta._ed||ta).after(pg); ta._pg=pg; ta._aba="n";
    if(pk){ const pj=document.createElement("div"); pj.className="projs"; pj.hidden=true; pj._ta=ta; pg.after(pj); ta._pj=pj; ta._pjk=pk;
      const n=FORMATO_PROJ.rotulo&&FORMATO_PROJ.rotulo(pk); ab.querySelector(".fa-j").textContent=n||"";
      if(window.FORMATO_PRAT){ const pr=document.createElement("div"); pr.className="projs prats"; pr.hidden=true; pr._ta=ta; pg.after(pr); ta._pr=pr; const r=FORMATO_PRAT.rotulo&&FORMATO_PRAT.rotulo(pk); ab.querySelector(".fa-r").textContent=r||""; } }
    contarPergs(ta);
    const mem=ABA_MEM[chaveAba(ta)]; if(mem&&mem!=="n") trocarAba(ta,mem,true);
  }
  function montar(ta){
    if(ta._ed){ desenhar(ta); return; }
    const ed=document.createElement("div"); ed.className="wys md"; ed.contentEditable="true"; ed.setAttribute("role","textbox"); ed.setAttribute("aria-multiline","true");
    ed.setAttribute("aria-label",ta.getAttribute("aria-label")||"Anotação"); ed.dataset.ph=ta.placeholder||""; ed.spellcheck=!!REV.sub; ed.setAttribute("lang","pt-BR"); ed._ta=ta;
    const h=ta.offsetHeight; if(h>40) ed.style.minHeight=Math.min(h,420)+"px";
    const {notas}=separar(ta.value); ed.innerHTML=mdParaHtml(notas); ed.classList.toggle("vazio",!notas.trim());
    ta.after(ed); ta._ed=ed; ta.hidden=true; montarAbas(ta); focarNovo(ed);
    Object.defineProperty(ta,"value",{configurable:true,get(){ return descV.get.call(this); },set(v){ descV.set.call(this,v); if(!this._sync&&this._ed) requestAnimationFrame(()=>desenhar(this)); }});
    const lab=ta.id&&document.querySelector(`label[for="${ta.id}"]`); if(lab) lab.addEventListener("click",()=>ed.focus());
  }
  function blocoAtual(ed){ const s=getSelection(); if(!s.rangeCount) return null; let n=s.anchorNode; if(n&&n.nodeType===3) n=n.parentNode; while(n&&n!==ed&&!(n.nodeType===1&&/^(DIV|P|H1|H2|H3|LI|PRE|BLOCKQUOTE)$/.test(n.tagName))) n=n.parentNode; return n&&n!==ed?n:null; }
  function dentroDe(ed,tag){ const s=getSelection(); if(!s.rangeCount) return null; let n=s.anchorNode; while(n&&n!==ed){ if(n.nodeType===1&&n.tagName===tag) return n; n=n.parentNode; } return null; }
  function restaurar(ed){ ed.focus(); if(ed._range&&ed.contains(ed._range.startContainer)){ const s=getSelection(); s.removeAllRanges(); s.addRange(ed._range); } }
  document.addEventListener("selectionchange",()=>{ const s=getSelection(); if(!s.rangeCount) return; const n=s.anchorNode, ed=n&&(n.nodeType===1?n:n.parentNode).closest&&(n.nodeType===1?n:n.parentNode).closest(".wys"); if(ed) ed._range=s.getRangeAt(0).cloneRange(); });
  function cmd(c,v){ try{ document.execCommand(c,false,v); }catch(e){} }
  function envolverEd(ed,tag,exemplo){
    const atual=dentroDe(ed,tag.toUpperCase());
    if(atual){ const f=document.createDocumentFragment(); while(atual.firstChild) f.appendChild(atual.firstChild); atual.replaceWith(f); sincronizar(ed); return; }
    const s=getSelection(), txt=s.toString();
    cmd("insertHTML",`<${tag}>${escH(txt||exemplo)}</${tag}>&#8203;`);
  }
  function tarefa(ed){
    const li=dentroDe(ed,"LI"), ul=li&&li.parentNode;
    if(li&&ul.classList.contains("tk")){ li.dataset.tk=li.dataset.tk==="1"?"0":"1"; sincronizar(ed); return; }
    if(!li||ul.tagName!=="UL") cmd("insertUnorderedList");
    const l2=dentroDe(ed,"LI"); if(l2){ l2.parentNode.classList.add("tk"); [...l2.parentNode.children].forEach(x=>{ if(x.dataset.tk===undefined) x.dataset.tk="0"; }); }
    sincronizar(ed);
  }
  // Sublista (Tab) e voltar nível (Shift+Tab) sem execCommand: a sublista fica dentro do item de cima,
  // o que dá a numeração 1.1, 1.2… e o Markdown com recuo de 2 espaços.
  function guardaSel(){ const s=getSelection(); if(!s.rangeCount) return null; const r=s.getRangeAt(0); return [r.startContainer,r.startOffset,r.endContainer,r.endOffset]; }
  function voltaSel(x){ if(!x) return; try{ const r=document.createRange(); r.setStart(x[0],x[1]); r.setEnd(x[2],x[3]); const s=getSelection(); s.removeAllRanges(); s.addRange(r); }catch(e){} }
  function itensSel(ed){ const s=getSelection(); if(!s.rangeCount) return []; const r=s.getRangeAt(0);
    const li0=dentroDe(ed,"LI"); if(r.collapsed) return li0?[li0]:[];
    // itens cujo texto próprio (fora das sublistas) está na seleção
    return [...ed.querySelectorAll("li")].filter(li=>[...li.childNodes].some(c=>!/^(UL|OL)$/.test(c.tagName||"")&&r.intersectsNode(c))); }
  function recuar(ed){
    const lis=itensSel(ed); if(!lis.length) return false; const sel=guardaSel();
    for(const li of lis){ const pai=li.parentNode, ant=li.previousElementSibling; if(!ant||ant.tagName!=="LI") continue;
      let sub=[...ant.children].reverse().find(c=>/^(UL|OL)$/.test(c.tagName));
      if(!sub||sub.tagName!==pai.tagName){ sub=document.createElement(pai.tagName); if(pai.classList.contains("tk")) sub.className="tk"; ant.appendChild(sub); }
      sub.appendChild(li);
      const filhos=[...li.children].filter(c=>/^(UL|OL)$/.test(c.tagName)); // sublistas do item sobem para irmãs dele
      filhos.forEach(f=>{ while(f.firstElementChild) sub.appendChild(f.firstElementChild); f.remove(); });
    }
    voltaSel(sel); sincronizar(ed); return true;
  }
  function desrecuar(ed){
    const lis=itensSel(ed); if(!lis.length) return false; const sel=guardaSel(); let algum=false;
    for(const li of lis.slice().reverse()){ const pai=li.parentNode, avo=pai.parentNode; if(!avo||avo.tagName!=="LI") continue; algum=true;
      const depois=[]; let n=li.nextElementSibling; while(n){ depois.push(n); n=n.nextElementSibling; }
      if(depois.length){ const nl=document.createElement(pai.tagName); nl.className=pai.className; depois.forEach(x=>nl.appendChild(x)); li.appendChild(nl); }
      avo.after(li); if(!pai.children.length) pai.remove();
    }
    if(!algum){ cmd("outdent"); sincronizar(ed); return true; }
    voltaSel(sel); sincronizar(ed); return true;
  }
  /* ---------- Revisão: correção ortográfica e sugestão por Tab ----------
     Opções guardadas neste aparelho (valem para os dois cadernos):
     sub = sublinhar erros (corretor do navegador, em português), auto = corrigir sozinho palavras comuns
     sem acento/erro de digitação, tab = sugerir o fim da palavra (aceita com Tab). */
  const REV_LS="cadernos:revisao";
  let REV={sub:true,auto:true,tab:true};
  try{ Object.assign(REV, JSON.parse(localStorage.getItem(REV_LS)||"{}")); }catch(e){}
  function salvarRev(){ try{ localStorage.setItem(REV_LS, JSON.stringify(REV)); }catch(e){} aplicarRev(document); }
  const ALVO_REV=".wys, "+ALVOS+", .pergs textarea, .projs textarea, textarea.pj-auto, textarea.fx-seg";
  function aplicarRev(raiz){ raiz.querySelectorAll(ALVO_REV).forEach(el=>{ el.spellcheck=!!REV.sub; el.setAttribute("lang","pt-BR"); }); }
  // palavras comuns escritas sem acento ou com erro de digitação → forma certa
  const AUTO=Object.create(null);
  ("nao:não entao:então tambem:também voce:você voces:vocês ate:até ja:já sera:será serao:serão estao:estão sao:são mao:mão alem:além porem:porém atraves:através apos:após "+
   "ninguem:ninguém alguem:alguém tres:três mes:mês ultimo:último ultima:última ultimos:últimos ultimas:últimas pagina:página paginas:páginas numero:número numeros:números "+
   "area:área areas:áreas possivel:possível possiveis:possíveis disponivel:disponível disponiveis:disponíveis facil:fácil faceis:fáceis dificil:difícil "+
   "util:útil uteis:úteis varios:vários varias:várias proximo:próximo proxima:próxima proximos:próximos proximas:próximas "+
   "seguranca:segurança geografico:geográfico geografica:geográfica geograficos:geográficos geograficas:geográficas cartografico:cartográfico cartografica:cartográfica "+
   "cartograficos:cartográficos cartograficas:cartográficas tematico:temático tematica:temática tematicos:temáticos tematicas:temáticas metodo:método metodos:métodos "+
   "periodo:período periodos:períodos codigo:código codigos:códigos logica:lógica logico:lógico grafico:gráfico graficos:gráficos "+
   "tecnica:técnica tecnicas:técnicas tecnico:técnico tecnicos:técnicos teorico:teórico teorica:teórica basico:básico basica:básica "+
   "unico:único unica:única historico:histórico historica:histórica estatistica:estatística estatisticas:estatísticas "+
   "indice:índice indices:índices criterio:critério criterios:critérios relatorio:relatório relatorios:relatórios territorio:território territorios:territórios "+
   "municipio:município municipios:municípios regiao:região regioes:regiões ocorrencia:ocorrência ocorrencias:ocorrências violencia:violência frequencia:frequência "+
   "sequencia:sequência referencia:referência referencias:referências distancia:distância distancias:distâncias importancia:importância necessario:necessário "+
   "necessaria:necessária necessarios:necessários obrigatorio:obrigatório obrigatoria:obrigatória conteudo:conteúdo conteudos:conteúdos "+
   "exercicio:exercício exercicios:exercícios satelite:satélite satelites:satélites imovel:imóvel imoveis:imóveis policia:polícia homicidio:homicídio "+
   "homicidios:homicídios agua:água rapido:rápido rapida:rápida poligono:polígono poligonos:polígonos vertice:vértice vertices:vértices "+
   "rotulos:rótulos hemisferio:hemisfério topografico:topográfico topografica:topográfica nivel:nível niveis:níveis maximo:máximo maxima:máxima minimo:mínimo minima:mínima "+
   "medio:médio simbolo:símbolo simbolos:símbolos veiculo:veículo veiculos:veículos funcionario:funcionário horario:horário horarios:horários "+
   "calculos:cálculos calendario:calendário cenario:cenário cenarios:cenários diagnostico:diagnóstico diagnosticos:diagnósticos espaco:espaço espacos:espaços "+
   "endereco:endereço enderecos:endereços servico:serviço servicos:serviços comeco:começo voo:voo raster:raster tambem:também "+
   "qeu:que uqe:que nãoo:não ocm:com cmo:com praa:para apra:para pra:pra pq:pq").split(" ").forEach(p=>{ const i=p.indexOf(":"); const a=p.slice(0,i), b=p.slice(i+1); if(a!==b) AUTO[a]=b; });
  // palavras que você desfez (Ctrl+Z) não são mais corrigidas neste aparelho
  const IGN_LS="cadernos:revisao-ignorar"; const IGNORAR=new Set();
  try{ JSON.parse(localStorage.getItem(IGN_LS)||"[]").forEach(w=>IGNORAR.add(w)); }catch(e){}
  function ignorar(w){ IGNORAR.add(w); try{ localStorage.setItem(IGN_LS, JSON.stringify([...IGNORAR].slice(-500))); }catch(e){} }
  /* Dicionário pt-BR (50 mil palavras mais usadas, em ordem de frequência) para corrigir qualquer palavra
     desconhecida que esteja a 1 letra de distância de uma conhecida (trocada, faltando, sobrando, invertida)
     ou que só difira nos acentos. Carregado na primeira vez que você digita numa caixa. */
  let DIC=null, DESAC=null, DIC_P=null;
  const desac = w => w.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  function carregarDic(){
    if(DIC||DIC_P) return DIC_P;
    DIC_P=fetch("/vendor/palavras-pt-br.txt").then(r=>r.ok?r.text():Promise.reject()).then(t=>{
      const m=new Map(), d=new Map(); let i=0;
      for(const l of t.split("\n")){ if(!l||l[0]==="#") continue; m.set(l,i); const k=desac(l); if(!d.has(k)) d.set(k,l); i++; }
      DIC=m; DESAC=d; }).catch(()=>{ DIC_P=null; });
    return DIC_P;
  }
  const ALFA="abcdefghijklmnopqrstuvwxyzáàâãéêíóôõúüç";
  function edicoes(w){ const out=new Set();
    for(let i=0;i<=w.length;i++){ const a=w.slice(0,i), b=w.slice(i);
      if(b) out.add(a+b.slice(1));
      if(b.length>1) out.add(a+b[1]+b[0]+b.slice(2));
      for(const c of ALFA){ if(b) out.add(a+c+b.slice(1)); out.add(a+c+b); } }
    out.delete(w); return out; }
  // termos do curso + palavras das suas anotações (≥3 vezes), indexados sem acento
  let DOM=null, DOM_T=0;
  function dominio(){ if(DOM&&Date.now()-DOM_T<60000) return DOM; vocabulario(); const m=new Map();
    BASE_L.forEach(w=>{ const k=desac(w); if(!m.has(k)) m.set(k,w); }); VOC_L.forEach((n,w)=>{ if(n>=3){ const k=desac(w); if(!m.has(k)) m.set(k,w); } });
    DOM=m; DOM_T=Date.now(); return m; }
  function conhecida(lw){ if(BASE_L.has(lw)) return true; vocabulario(); return (VOC_L.get(lw)||0)>=3; }
  function pelaLista(lw){
    if(!DIC||lw.length<3||/[^a-zà-öø-ÿ]/.test(lw)||conhecida(lw)) return null;
    const rw=DIC.get(lw);
    if(rw!==undefined){ // palavra existe; só troca se for a versão sem acento, rara, de uma palavra bem mais usada (otima → ótima)
      if(rw<8000||desac(lw)!==lw) return null; const a=DESAC.get(lw), ra=a!==undefined&&a!==lw?DIC.get(a):undefined;
      return ra!==undefined&&ra*8<rw ? a : null; }
    const dom=dominio(); const so=dom.get(desac(lw))||DESAC.get(desac(lw)); if(so&&so!==lw) return so; // só faltou/sobrou acento
    if(lw.length<5) return null; // palavras curtas desconhecidas costumam ser siglas
    // a 1 letra de distância: primeiro termos do curso e das suas anotações, depois as palavras mais usadas
    let best=null, br=Infinity;
    for(const c of edicoes(lw)){
      const dw=dom.get(desac(c)); if(dw){ const r=-1-(VOC_L.get(dw)||0); if(r<br){ br=r; best=dw; } continue; }
      let w2=c, r=DIC.get(c); if(r===undefined){ const a=DESAC.get(desac(c)); if(a!==undefined){ w2=a; r=DIC.get(a); } } if(r!==undefined&&r<br){ br=r; best=w2; } }
    return best;
  }
  function corrigida(w, inicio){
    const lw=w.toLowerCase(); if(IGNORAR.has(lw)) return null;
    let r=AUTO[lw];
    if(!r&&lw.length>=5){ let m=lw.match(/^(.*[aeiou])cao$/); if(m) r=m[1]+"ção"; else if((m=lw.match(/^(.*[aeiou])coes$/))) r=m[1]+"ções"; }
    // nomes próprios (maiúscula no meio da frase) e siglas ficam como estão
    const nome=/[A-ZÀ-Ö]/.test(w[0])&&!inicio, sigla=w.length>1&&w===w.toUpperCase();
    if(!r&&!nome&&!sigla&&!/[A-ZÀ-Ö]/.test(w.slice(1))) r=pelaLista(lw);
    if(!r||r===lw) return null;
    if(w===w.toUpperCase()&&w.length>1) return r.toUpperCase();
    if(w[0]===w[0].toUpperCase()) return r[0].toUpperCase()+r.slice(1);
    return r;
  }
  const LETRA=/[A-Za-zÀ-ÖØ-öø-ÿ]/, FIMPAL=/[\s.,;:!?)\]}"'”»]/;
  let ULT_AUTO=null; // {de, para}
  function autoEd(ed,ch){
    const s=getSelection(); if(!s.rangeCount||!s.isCollapsed) return; const n=s.anchorNode, o=s.anchorOffset; if(!n||n.nodeType!==3||o<2) return;
    if(n.parentNode.closest&&n.parentNode.closest("code,pre,a,.pesq,.fcm,.exm")) return;
    const antes=n.nodeValue.slice(0,o-ch.length), m=antes.match(/([A-Za-zÀ-ÖØ-öø-ÿ]+)$/); if(!m) return;
    const ini=antes.length-m[1].length, prev=antes.slice(0,ini);
    const r=corrigida(m[1], !prev.trim()&&!n.previousSibling || /[.!?]\s*$/.test(prev)); if(!r) return;
    const rg=document.createRange(); rg.setStart(n,ini); rg.setEnd(n,antes.length); s.removeAllRanges(); s.addRange(rg);
    let ok=false; try{ ok=document.execCommand("insertText",false,r); }catch(e){}
    if(!ok){ n.nodeValue=n.nodeValue.slice(0,ini)+r+n.nodeValue.slice(antes.length); const c=document.createRange(); c.setStart(n,ini+r.length); c.collapse(true); s.removeAllRanges(); s.addRange(c); }
    try{ s.modify("move","forward","character"); }catch(e){}
    ULT_AUTO={de:m[1],para:r};
  }
  function autoTa(ta,ch){
    const v=ta.value, c=ta.selectionStart; if(c!==ta.selectionEnd) return;
    const antes=v.slice(0,c-ch.length), m=antes.match(/([A-Za-zÀ-ÖØ-öø-ÿ]+)$/); if(!m) return;
    const ini=antes.length-m[1].length, prev=antes.slice(0,ini);
    const r=corrigida(m[1], !prev.trim()||/[.!?\n]\s*$/.test(prev)); if(!r) return;
    ta.setSelectionRange(ini,antes.length); let ok=false; try{ ok=ta.ownerDocument.execCommand("insertText",false,r); }catch(e){}
    if(!ok){ ta.setRangeText(r,ini,antes.length,"end"); ta.dispatchEvent(new Event("input",{bubbles:true})); }
    const p=ini+r.length+ch.length; ta.setSelectionRange(p,p); ULT_AUTO={de:m[1],para:r};
  }
  function revInput(e){
    const t=e.target, IE=(t.ownerDocument&&t.ownerDocument.defaultView||window).InputEvent; if(IE&&!(e instanceof IE)) return; // eventos de sincronização da caixa escondida
    if(e.inputType==="historyUndo"&&ULT_AUTO){ ignorar(ULT_AUTO.de.toLowerCase()); ULT_AUTO=null; return; } // desfez a correção: não corrige mais essa palavra
    if(e.inputType!=="insertText"||!e.data) { if(e.inputType!=="insertText") esconderSug(); return; }
    if(!t.matches||!t.matches(ALVO_REV)) return;
    if(FIMPAL.test(e.data)){ ULT_AUTO=null; esconderSug(); if(REV.auto){ if(t.classList.contains("wys")) autoEd(t,e.data); else if(t.tagName==="TEXTAREA") autoTa(t,e.data); } return; }
    if(REV.tab&&t.classList.contains("wys")&&LETRA.test(e.data)) sugerir(t); else esconderSug();
  }
  document.addEventListener("input",revInput,true);
  // janela "por cima de outras janelas" (PiP): mesma correção automática na caixa de texto de lá
  function ligarRev(doc){ if(doc===document||doc._rev) return; doc._rev=1; doc.addEventListener("input",revInput,true);
    doc.addEventListener("focusin",e=>{ if(REV.auto&&e.target.matches&&e.target.matches(ALVO_REV)) carregarDic(); }); }

  document.addEventListener("focusin",e=>{ if(REV.auto&&e.target.matches&&e.target.matches(ALVO_REV)) carregarDic(); });
  // ---- sugestão por Tab (vocabulário: suas anotações + termos do curso) ----
  const BASE=("georreferenciamento geoprocessamento geocodificação geográfico geográfica cartografia cartográfico cartográfica coordenadas coordenada latitude longitude "+
    "projeção projeções sistema referência SIRGAS shapefile geopackage vetorial matricial raster polígono polígonos pontos linhas camada camadas atributos atributo tabela "+
    "simbologia legenda rótulos layout impressão escala resolução satélite imagens ortofoto altimetria topográfico hidrografia município municípios bairros setores "+
    "censitários IBGE OpenStreetMap QGIS complemento complementos ferramenta ferramentas processamento análise análises espacial espaciais densidade kernel mapa mapas "+
    "calor hotspot hotspots buffer buffers interseção união recorte dissolver junção junções consulta consultas seleção selecionar filtro expressão calculadora campo campos "+
    "ocorrências ocorrência criminalidade segurança pública policiamento patrulhamento homicídio homicídios violência roubos furtos território territorial diagnóstico "+
    "planejamento operacional estratégico estatística estatísticas indicadores indicador taxa população habitantes período temporal tendência distribuição concentração "+
    "metodologia objetivo justificativa resultados conclusão conclusões apresentação relatório produto produtos importante exemplo exemplos informação informações "+
    "cvli cvp cvi ais sspds ibge shp dbf shx prj csv kml kmz osm wms wfs wmts wcs utm datum epsg sirgas wgs gps gnss geojson gpkg tif tiff mde mdt dem crs src gdal postgis arcgis "+
    "ciops cbmce aesp pmce pcce tco plugin plugins online offline link links email zoom heatmap raster rasters vetor vetores "+
    "também porque quando então através definição principalmente necessário possível diferença diferentes utilizado utilizada utilizar trabalho trabalhos atividade atividades").split(" ");
  const BASE_L=new Set(BASE.map(w=>w.toLowerCase()));
  let VOC=null, VOC_T=0, VOC_L=new Map();
  function vocabulario(){
    if(VOC&&Date.now()-VOC_T<60000) return VOC;
    const f=new Map(); const add=(w,n)=>{ if(w.length<5) return; f.set(w,(f.get(w)||0)+n); };
    BASE.forEach(w=>add(w,2));
    try{ if(typeof S==="object"&&S&&S.docs) for(const d of Object.values(S.docs)){ if(!d||d.apagado||d.tipo==="mtx") continue;
      for(const v of Object.values(d)){ if(typeof v!=="string"||v.length<5) continue; const ws=v.match(/[A-Za-zÀ-ÖØ-öø-ÿ]{5,}/g); if(ws) ws.forEach(w=>add(w,3)); } } }catch(e){}
    VOC=[...f.entries()].sort((a,b)=>b[1]-a[1]); VOC_T=Date.now();
    VOC_L=new Map(); for(const [w,n] of f) VOC_L.set(w.toLowerCase(),(VOC_L.get(w.toLowerCase())||0)+Math.floor(n/3)); return VOC;
  }
  let SUG=null; // {ed, resto, el}
  function esconderSug(){ if(SUG&&SUG.el) SUG.el.remove(); SUG=null; }
  function sugerir(ed){
    const s=getSelection(); if(!s.rangeCount||!s.isCollapsed){ esconderSug(); return; }
    const n=s.anchorNode, o=s.anchorOffset; if(!n||n.nodeType!==3){ esconderSug(); return; }
    if(n.parentNode.closest&&n.parentNode.closest("code,pre,a")){ esconderSug(); return; }
    const depois=n.nodeValue.slice(o,o+1); if(depois&&LETRA.test(depois)){ esconderSug(); return; }
    const m=n.nodeValue.slice(0,o).match(/([A-Za-zÀ-ÖØ-öø-ÿ]{3,})$/); if(!m){ esconderSug(); return; }
    const pre=m[1], lp=pre.toLowerCase();
    const achou=vocabulario().find(([w])=>w.length>=pre.length+2&&w.toLowerCase().startsWith(lp)&&w.toLowerCase()!==lp);
    if(!achou){ esconderSug(); return; }
    let resto=achou[0].slice(pre.length); if(pre===pre.toUpperCase()&&pre.length>1) resto=resto.toUpperCase();
    const rg=document.createRange(); rg.setStart(n,o-1); rg.setEnd(n,o); const r=rg.getBoundingClientRect(); if(!r||!r.height){ esconderSug(); return; }
    let el=SUG&&SUG.el; if(!el){ el=document.createElement("span"); el.className="fmt-sug"; el.setAttribute("aria-hidden","true"); document.body.appendChild(el); }
    const cs=getComputedStyle(n.parentNode); el.style.font=cs.font; el.style.lineHeight=r.height+"px";
    el.textContent=resto; el.style.left=r.right+"px"; el.style.top=r.top+"px";
    SUG={ed,resto,el,n,o};
  }
  document.addEventListener("keydown",e=>{
    if(!SUG) return;
    if(e.key==="Tab"&&!e.shiftKey&&!e.ctrlKey&&!e.altKey&&e.target===SUG.ed){ e.preventDefault(); e.stopImmediatePropagation(); const t=SUG.resto; esconderSug(); try{ document.execCommand("insertText",false,t); }catch(x){} return; }
    if(e.key==="Escape"){ e.stopImmediatePropagation(); esconderSug(); return; }
    if(e.key.length>1&&e.key!=="Shift") esconderSug();
  },true);
  document.addEventListener("selectionchange",()=>{ if(!SUG) return; const s=getSelection(); if(!s.rangeCount||s.anchorNode!==SUG.n||s.anchorOffset!==SUG.o) esconderSug(); });
  document.addEventListener("focusout",()=>esconderSug());
  addEventListener("scroll",()=>esconderSug(),true);

  // ---- botão "Revisão" na barra ----
  function popRev(bt){
    const doc=bt.ownerDocument; doc.querySelectorAll(".tb-pop").forEach(x=>x.remove());
    const p=doc.createElement("div"); p.className="tb-pop rev-pop";
    const op=(k,t,d)=>`<label class="rev-op"><input type="checkbox" data-rev="${k}" ${REV[k]?"checked":""}><span><b>${t}</b><small>${d}</small></span></label>`;
    p.innerHTML=`<div class="tb-t">Revisão do texto</div>`+
      op("sub","Sublinhar erros de ortografia","Corretor do navegador em português. Clique com o botão direito na palavra para ver as sugestões.")+
      op("auto","Correção automática","Ao terminar a palavra, corrige erros comuns (nao → não, informacao → informação). Ctrl+Z desfaz e a palavra deixa de ser corrigida.")+
      op("tab","Sugestão por Tab","Mostra o fim da palavra em cinza, com base nas suas anotações e nos termos do curso. Tab aceita, Esc ignora.");
    doc.body.appendChild(p);
    const r=bt.getBoundingClientRect(), W=doc.documentElement.clientWidth; p.style.left=Math.max(6,Math.min(r.left,W-p.offsetWidth-6))+"px"; p.style.top=(r.bottom+4)+"px";
    const fechar=()=>{ p.remove(); doc.removeEventListener("mousedown",fora,true); doc.removeEventListener("keydown",esc,true); };
    const fora=e=>{ if(!p.contains(e.target)&&!bt.contains(e.target)) fechar(); };
    const esc=e=>{ if(e.key==="Escape"){ e.stopPropagation(); fechar(); } };
    doc.addEventListener("mousedown",fora,true); doc.addEventListener("keydown",esc,true);
    p.addEventListener("change",e=>{ const k=e.target.dataset.rev; if(!k) return; REV[k]=e.target.checked; salvarRev(); if(!REV.tab) esconderSug(); });
  }
  let BT_ULT=null;
  function celAtual(ed){ return dentroDe(ed,"TD")||dentroDe(ed,"TH"); }
  function focarCel(c){ if(!c) return; const r=document.createRange(); r.selectNodeContents(c); r.collapse(false); const s=getSelection(); s.removeAllRanges(); s.addRange(r); }
  function novaTabela(ed,nl,nc){
    const th=Array.from({length:nc},(_,i)=>`<th>Coluna ${i+1}</th>`).join(""), td=`<tr>${"<td><br></td>".repeat(nc)}</tr>`;
    cmd("insertHTML",`<table><thead><tr>${th}</tr></thead><tbody>${td.repeat(Math.max(1,nl-1))}</tbody></table><div><br></div>`);
    const b=blocoAtual(ed), tb=b&&b.previousElementSibling; if(tb&&tb.tagName==="TABLE"){ focarCel(tb.rows[0].cells[0]); requestAnimationFrame(()=>posTabela(tb)); }
    sincronizar(ed);
  }
  function opTabela(ed,op){
    const c=celAtual(ed); if(!c) return; const tr=c.parentNode, tb=c.closest("table"), col=[...tr.children].indexOf(c);
    if(op==="linha"){ const n=document.createElement("tr"); n.innerHTML="<td><br></td>".repeat(tr.children.length); if(tr.parentNode.tagName==="THEAD"){ let b=tb.tBodies[0]; if(!b){ b=document.createElement("tbody"); tb.appendChild(b); } b.prepend(n); } else tr.after(n); focarCel(n.children[Math.max(0,col)]); }
    else if(op==="coluna"){ [...tb.rows].forEach(r=>{ const ref=r.children[col]; const x=document.createElement(r.parentNode.tagName==="THEAD"?"th":"td"); x.innerHTML=r.parentNode.tagName==="THEAD"?"Coluna "+(r.children.length+1):"<br>"; ref?ref.after(x):r.appendChild(x); }); focarCel(tr.children[col+1]); }
    else if(op==="-linha"){ if(tr.parentNode.tagName==="THEAD") return; const viz=tr.nextElementSibling||tr.previousElementSibling||tb.rows[0]; tr.remove(); focarCel(viz&&viz.children[Math.min(col,viz.children.length-1)]); }
    else if(op==="-coluna"){ if(tr.children.length<2) return; [...tb.rows].forEach(r=>{ if(r.children[col]) r.children[col].remove(); }); focarCel(tr.children[Math.min(col,tr.children.length-1)]); }
    else if(op==="tirar"){ const d=document.createElement("div"); d.innerHTML="<br>"; tb.replaceWith(d); cursorEm(d); }
    sincronizar(ed);
  }
  // Controles sutis + / − ao lado da última coluna e abaixo da última linha.
  let TBC=null, TBA=null, TBH=null;
  function ctlTabela(doc){
    if(TBC&&TBC.ownerDocument===doc&&TBC.isConnected) return TBC;
    TBC=doc.createElement("div"); TBC.className="tb-ctl";
    TBC.innerHTML='<div class="tb-cc"><button type="button" data-tc="+c" title="Adicionar coluna">+</button><button type="button" data-tc="-c" title="Apagar a última coluna">−</button></div><div class="tb-cl"><button type="button" data-tc="+l" title="Adicionar linha">+</button><button type="button" data-tc="-l" title="Apagar a última linha">−</button></div><div class="tb-cx"><button type="button" data-tc="x" title="Apagar a tabela">✕</button></div>';
    doc.body.appendChild(TBC);
    TBC.addEventListener("mousedown",e=>e.preventDefault());
    TBC.addEventListener("click",e=>{ const b=e.target.closest("[data-tc]"); if(!b||!TBA||!TBA.isConnected) return; const tb=TBA, ed=tb.closest(".wys"); if(!ed) return;
      if(b.dataset.tc==="x"){
        if(!b.classList.contains("conf")){ b.classList.add("conf"); b.textContent="Apagar tabela?"; clearTimeout(b._t); b._t=setTimeout(()=>{ b.classList.remove("conf"); b.textContent="✕"; },3000); return; }
        clearTimeout(b._t); b.classList.remove("conf"); b.textContent="✕";
        const d=doc.createElement("div"); d.innerHTML="<br>"; tb.replaceWith(d); cursorEm(d); TBH=null; posTabela(null); sincronizar(ed); return; }
      const op=b.dataset.tc, rows=[...tb.rows], nc=Math.max(...rows.map(r=>r.children.length)), corpo=rows.filter(r=>r.parentNode.tagName!=="THEAD");
      if(op==="+c") rows.forEach(r=>{ const h=r.parentNode.tagName==="THEAD", x=doc.createElement(h?"th":"td"); x.innerHTML=h?"Coluna "+(r.children.length+1):"<br>"; r.appendChild(x); });
      else if(op==="-c"){ if(nc<2) return; rows.forEach(r=>{ if(r.lastElementChild) r.lastElementChild.remove(); }); }
      else if(op==="+l"){ let bd=tb.tBodies[0]; if(!bd){ bd=doc.createElement("tbody"); tb.appendChild(bd); } const tr=doc.createElement("tr"); tr.innerHTML="<td><br></td>".repeat(nc); bd.appendChild(tr); }
      else if(op==="-l"){ if(corpo.length<2) return; corpo[corpo.length-1].remove(); }
      const sel=getSelection(); if(sel.rangeCount&&!tb.contains(sel.anchorNode)){} else if(sel.rangeCount&&!sel.anchorNode.isConnected) focarCel(tb.rows[tb.rows.length-1].children[0]);
      sincronizar(ed); posTabela(tb); });
    return TBC;
  }
  function posTabela(tb){
    const doc=(tb||TBA||{}).ownerDocument||document;
    if(!tb||!tb.isConnected){ if(TBC) TBC.classList.remove("on"); TBA=null; return; }
    const c=ctlTabela(doc); TBA=tb;
    const r=tb.getBoundingClientRect(), er=(tb.closest(".wys")||tb).getBoundingClientRect();
    c.classList.toggle("on", !(r.bottom<er.top||r.top>er.bottom));
    const cc=c.querySelector(".tb-cc"), cl=c.querySelector(".tb-cl");
    const ult=tb.rows[0]&&tb.rows[0].lastElementChild, dir=Math.min(r.right, ult?ult.getBoundingClientRect().right:r.right), larg=dir-r.left;
    cc.style.left=(r.left+larg+4)+"px"; cc.style.top=(r.top+r.height/2-19)+"px";
    cl.style.left=(r.left+larg/2-19)+"px"; cl.style.top=(r.bottom+3)+"px";
    const cx=c.querySelector(".tb-cx"); cx.style.left=(r.left+larg+4)+"px"; cx.style.top=(r.bottom+3)+"px";
    if(tb!==c._tb){ const bx=cx.firstElementChild; clearTimeout(bx._t); bx.classList.remove("conf"); bx.textContent="✕"; c._tb=tb; }
    const nc=Math.max(...[...tb.rows].map(x=>x.children.length)), nb=[...tb.rows].filter(x=>x.parentNode.tagName!=="THEAD").length;
    cc.querySelector('[data-tc="-c"]').disabled=nc<2; cl.querySelector('[data-tc="-l"]').disabled=nb<2;
  }
  function tabelaDaSel(){ const s=getSelection(); if(!s.rangeCount) return null; let n=s.anchorNode; n=n&&(n.nodeType===1?n:n.parentNode); return n&&n.closest?n.closest(".wys table"):null; }
  function revisarTabela(alvo){ const tb=alvo||TBH||tabelaDaSel(); posTabela(tb); }
  document.addEventListener("mousemove",e=>{ const t=e.target; if(!t.closest) return; if(t.closest(".tb-ctl")) return;
    let tb=t.closest(".wys table");
    if(!tb&&TBA&&TBA.isConnected){ const r=TBA.getBoundingClientRect(); const u=TBA.rows[0]&&TBA.rows[0].lastElementChild, d=Math.min(r.right,u?u.getBoundingClientRect().right:r.right); if(e.clientX>=r.left-6&&e.clientX<=d+34&&e.clientY>=r.top-6&&e.clientY<=r.bottom+30) tb=TBA; }
    if(tb===TBH) { if(tb) posTabela(tb); return; } TBH=tb; revisarTabela(); },{passive:true});
  document.addEventListener("selectionchange",()=>{ if(!TBH) revisarTabela(); });
  document.addEventListener("input",e=>{ if(TBA&&e.target.classList&&e.target.classList.contains("wys")) requestAnimationFrame(()=>posTabela(TBA.isConnected?TBA:tabelaDaSel())); });
  addEventListener("scroll",()=>{ if(TBA) posTabela(TBA); },true);
  addEventListener("resize",()=>{ if(TBA) posTabela(TBA); });
  function popTabela(ed,bt){
    const doc=ed.ownerDocument; doc.querySelectorAll(".tb-pop").forEach(x=>x.remove());
    const em=!!celAtual(ed), p=doc.createElement("div"); p.className="tb-pop";
    p.innerHTML= em ? `<div class="tb-t">Tabela</div><button data-tb="linha">+ Linha abaixo</button><button data-tb="coluna">+ Coluna à direita</button><button data-tb="-linha">− Remover linha</button><button data-tb="-coluna">− Remover coluna</button><button data-tb="tirar" class="tb-rm">Remover tabela</button>`
      : `<div class="tb-t">Nova tabela</div><div class="tb-l"><label>Linhas<input type="number" min="2" max="40" value="3" class="tb-nl"></label><label>Colunas<input type="number" min="1" max="12" value="3" class="tb-nc"></label></div><button class="tb-pri" data-tb="criar">Inserir tabela</button><span style="font-size:11.5px;color:var(--muted)">A 1ª linha é o cabeçalho.</span>`;
    doc.body.appendChild(p);
    const r=(bt||ed).getBoundingClientRect(), w=p.offsetWidth, W=doc.documentElement.clientWidth;
    p.style.left=Math.max(6,Math.min(r.left,W-w-6))+"px"; p.style.top=(r.bottom+4)+"px";
    const fechar=()=>{ p.remove(); doc.removeEventListener("mousedown",fora,true); doc.removeEventListener("keydown",esc,true); };
    const fora=e=>{ if(!p.contains(e.target)&&e.target!==bt&&!(bt&&bt.contains(e.target))) fechar(); };
    const esc=e=>{ if(e.key==="Escape"){ e.stopPropagation(); fechar(); restaurar(ed); } };
    doc.addEventListener("mousedown",fora,true); doc.addEventListener("keydown",esc,true);
    p.addEventListener("mousedown",e=>{ if(e.target.tagName==="BUTTON") e.preventDefault(); });
    p.addEventListener("click",e=>{ const b=e.target.closest("[data-tb]"); if(!b) return; const op=b.dataset.tb;
      const nl=Math.min(40,Math.max(2,+p.querySelector(".tb-nl")?.value||3)), nc=Math.min(12,Math.max(1,+p.querySelector(".tb-nc")?.value||3));
      fechar(); restaurar(ed); if(op==="criar") novaTabela(ed,nl,nc); else opTabela(ed,op); });
    p.addEventListener("keydown",e=>{ if(e.key==="Enter"&&e.target.tagName==="INPUT"){ e.preventDefault(); p.querySelector(".tb-pri").click(); } });
    const inp=p.querySelector("input"); if(inp) inp.select(); else p.querySelector("button").focus();
  }
  function aplicarEd(ed,k){
    const ta=ed._ta;
    if(k==="cheia") return telaCheia(ta);
    if(k==="flx") return fluxograma(ta);
    restaurar(ed);
    if(k==="img") return escolherImagem(ta);
    if(k==="tab") return popTabela(ed,BT_ULT);
    if(k==="rev") return popRev(BT_ULT);
    if(k==="fla"){ const s=getSelection(); let t=""; if(s.rangeCount&&ed.contains(s.anchorNode)) t=s.toString(); else if(ed._range&&ed.contains(ed._range.startContainer)) t=ed._range.toString(); if(window.FORMATO_FLASH) window.FORMATO_FLASH(ta,t); return; }
    if(k==="pq"||k==="mrc"||k==="exp") return marcaPelaBarra(ed,k);
    if(k==="dest"){ if(document.querySelector(".fmt-cheia")) sairCheia(); if(window.FORMATO_DESTACAR) window.FORMATO_DESTACAR(ta); return; }
    if(k==="sub"){ if(!dentroDe(ed,"LI")){ cmd("insertUnorderedList"); sincronizar(ed); return; } return recuar(ed); }
    if(k==="sob") return desrecuar(ed);
    if(/^(lis|num|tar|cit)$/.test(k)){ const bl=blocoAtual(ed); if(bl&&/^H[1-6]$/.test(bl.tagName)) cmd("formatBlock","div"); }
    if(k==="neg") cmd("bold"); else if(k==="ita") cmd("italic");
    else if(k==="mar") envolverEd(ed,"mark","destaque");
    else if(k==="tit"){ const b=blocoAtual(ed), t=b?b.tagName:"DIV"; cmd("formatBlock", t==="H1"?"h2":t==="H2"?"h3":t==="H3"?"div":"h1"); }
    else if(k==="lis"){ const li=dentroDe(ed,"LI"); if(li&&li.parentNode.classList.contains("tk")){ li.parentNode.classList.remove("tk"); [...li.parentNode.children].forEach(x=>delete x.dataset.tk); sincronizar(ed); } else cmd("insertUnorderedList"); }
    else if(k==="num") cmd("insertOrderedList");
    else if(k==="tar") tarefa(ed);
    else if(k==="cit") cmd("formatBlock", dentroDe(ed,"BLOCKQUOTE")?"div":"blockquote");
    else if(k==="cod"){ const s=getSelection(), t=s.toString(), b=blocoAtual(ed); if(t.includes("\n")||(!t&&b&&!b.textContent.trim())) cmd("insertHTML",`<pre>${escH(t||"código aqui")}</pre><div><br></div>`); else envolverEd(ed,"code","código"); }
    else if(k==="lnk"){ const u=prompt("Endereço do link (começando com https://):","https://"); if(!u||!/^https?:\/\/\S+$/.test(u.trim())) return; const s=getSelection(); if(s.toString()) cmd("createLink",u.trim()); else cmd("insertHTML",`<a href="${escH(u.trim())}">${escH(u.trim())}</a>&#8203;`); }
    else if(k==="div"){ cmd("insertHorizontalRule"); }
    sincronizar(ed);
  }
  // Texto logo antes do cursor (no bloco atual, mesmo que esteja partido em vários pedaços pelo navegador,
  // pela correção ou pela sugestão por Tab) que termina com o padrão: devolve o trecho como Range.
  function trechoAntes(ed,re){
    const s=getSelection(); if(!s.rangeCount||!s.isCollapsed) return null; const c=s.getRangeAt(0);
    if(!ed.contains(c.endContainer)) return null;
    const bl=blocoAtual(ed)||ed, r=document.createRange(); try{ r.setStart(bl,0); r.setEnd(c.endContainer,c.endOffset); }catch(e){ return null; }
    const txt=r.toString(), m=txt.match(re); if(!m) return null;
    let alvo=txt.length-m[0].length, ac=0, ini=null; const w=document.createTreeWalker(bl,NodeFilter.SHOW_TEXT); let n;
    while((n=w.nextNode())){ if(!r.intersectsNode(n)) continue; const a=n===r.startContainer?r.startOffset:0, b=n===c.endContainer?c.endOffset:n.nodeValue.length, len=Math.max(0,b-a);
      if(ini==null&&alvo<=ac+len&&(alvo<ac+len||n===c.endContainer)){ ini={n,o:a+(alvo-ac)}; break; } ac+=len; if(n===c.endContainer) break; }
    if(!ini) return null; const x=document.createRange(); x.setStart(ini.n,ini.o); x.setEnd(c.endContainer,c.endOffset);
    const f=x.cloneContents(); if(f.querySelector&&f.querySelector(".pesq,.fcm,.exm,img,.fx-bloco,br,div,li")) return null;
    const el=ini.n.parentNode; if(el.closest&&el.closest("code,pre,a,.pesq,.fcm,.exm")) return null;
    return {r:x, m};
  }
  function porMarca(ed,sp){ const s=getSelection(); const z=document.createTextNode("\u200b"); return {z,poe(r){ r.deleteContents(); r.insertNode(z); r.insertNode(sp); const c=document.createRange(); c.setStart(z,1); c.collapse(true); s.removeAllRanges(); s.addRange(c); }}; }
  // <palavra> digitado vira termo pesquisável na hora
  function termoDigitado(ed){
    const t=trechoAntes(ed,/<([^\s<>](?:[^<>\n]{0,78}[^\s<>])?)>$/); if(!t) return;
    const q=t.m[1]; const sp=document.createElement("span"); sp.className="pesq"; sp.contentEditable="false"; sp.dataset.q=q; sp.title="Pesquisar “"+q+"” · clique para editar"; sp.textContent=q;
    porMarca(ed,sp).poe(t.r);
  }
  // {{pergunta}} digitado vira marcador e abre a janelinha do flashcard (a página cuida do cartão)
  function flashDigitado(ed){
    if(!window.FORMATO_FLASH_MARCA) return;
    const t=trechoAntes(ed,/\{\{([^{}\n]{1,200}?)\}\}$/); if(!t||!t.m[1].trim()) return;
    const q=t.m[1].replace(/\u200b/g,"").trim(); const sp=document.createElement("span"); sp.className="fcm"; sp.contentEditable="false"; sp.dataset.fc=q; sp.title="Flashcard: clique para ver ou editar"; sp.textContent=q;
    porMarca(ed,sp).poe(t.r);
    sincronizar(ed); abrirMarca(ed,sp,true);
  }
  // ((termo)) digitado vira termo com explicação e abre a janelinha (a página cuida da explicação)
  function explicaDigitado(ed){
    if(!window.FORMATO_EXPLICA) return;
    const t=trechoAntes(ed,/\(\(([^()\n]{1,120}?)\)\)$/); if(!t||!t.m[1].replace(/\u200b/g,"").trim()) return;
    const q=t.m[1].replace(/\u200b/g,"").trim(), sp=novaMarca("exp",q);
    porMarca(ed,sp).poe(t.r); sincronizar(ed); abrirExp(ed,sp,true);
  }
  function blocoTexto(el){ let b=el; while(b&&b.parentNode&&!(b.nodeType===1&&/^(DIV|P|LI|H1|H2|H3|BLOCKQUOTE|TD|TH)$/.test(b.tagName)&&b!==el)) b=b.parentNode; return ((b&&b.textContent)||"").replace(/\u200b/g,"").trim().slice(0,600); }
  function abrirExp(ed,sp,novo){
    if(!window.FORMATO_EXPLICA) return;
    const doc=sp.ownerDocument, win=doc.defaultView||window, s=win.getSelection(), rg=s.rangeCount&&ed.contains(s.anchorNode)?s.getRangeAt(0).cloneRange():null;
    const voltar=()=>{ try{ ed.focus(); if(rg){ const x=win.getSelection(); x.removeAllRanges(); x.addRange(rg); } }catch(e){} };
    window.FORMATO_EXPLICA.abrir({termo:sp.dataset.ex, el:sp, ta:ed._ta, novo, contexto:blocoTexto(sp), voltar,
      mudouTermo:t=>{ if(!sp.isConnected||!t) return; sp.dataset.ex=t; sp.textContent=t; sincronizar(ed); },
      tirar:()=>{ if(!sp.isConnected) return; const tx=doc.createTextNode(sp.textContent); sp.replaceWith(tx); sincronizar(ed); },
      apagar:()=>{ if(!sp.isConnected) return; const z=sp.nextSibling; if(z&&z.nodeType===3&&z.nodeValue==="\u200b") z.remove(); sp.remove(); sincronizar(ed); },
      atualizar:()=>{ if(sp.isConnected) sp.title=dicaExp(sp.dataset.ex); },
      converter:tp=>{ if(sp.isConnected) converterMarca(sp,tp); }, mudarHTML:()=>mudarHTML("exp",sp.dataset.ex) });
  }
  document.addEventListener("click",e=>{
    const t=e.target.closest&&e.target.closest(".exm[data-ex]"); if(!t||!window.FORMATO_EXPLICA) return; e.preventDefault(); e.stopPropagation();
    const ed=t.closest(".wys"); if(ed) return abrirExp(ed,t,false);
    window.FORMATO_EXPLICA.abrir({termo:t.dataset.ex, el:t, contexto:blocoTexto(t)});
  },true);
  function abrirMarca(ed,sp,novo){
    const s=getSelection(), rg=s.rangeCount&&ed.contains(s.anchorNode)?s.getRangeAt(0).cloneRange():null;
    const voltar=()=>{ try{ ed.focus(); if(rg){ const x=getSelection(); x.removeAllRanges(); x.addRange(rg); } }catch(e){} };
    const mudou=t=>{ if(!sp.isConnected||!t) return; sp.dataset.fc=t; sp.textContent=t; sincronizar(ed); };
    window.FORMATO_FLASH_MARCA({texto:sp.dataset.fc, ta:ed._ta, el:sp, novo, voltar, mudou, converter:tp=>{ if(sp.isConnected) converterMarca(sp,tp); }, mudarHTML:()=>mudarHTML("mrc",sp.dataset.fc)});
  }
  document.addEventListener("click",e=>{
    const t=e.target.closest&&e.target.closest(".wys .fcm[data-fc]"); if(!t||!window.FORMATO_FLASH_MARCA) return; e.preventDefault(); e.stopPropagation();
    editarMarca(t);
  },true);
  // Clique num termo pesquisável: a página decide onde pesquisar; sem isso, abre o Google numa aba nova.
  document.addEventListener("click",e=>{
    const t=e.target.closest&&e.target.closest(".pesq[data-q]"); if(!t) return; e.preventDefault(); e.stopPropagation();
    if(t.closest(".wys")) return editarMarca(t);
    pesquisarTermo(t);
  },true);
  function pesquisarTermo(t){
    const ev=new CustomEvent("caderno:pesquisar",{detail:{q:t.dataset.q, el:t}, cancelable:true});
    if(document.dispatchEvent(ev)) window.open("https://www.google.com/search?q="+encodeURIComponent(t.dataset.q),"_blank","noopener");
  }
  /* Editar <termo> e {{pergunta}}: clique no marcador (ou botão da barra com o cursor nele) abre esta janelinha */
  function novaMarca(tp,t){ if(tp===true) tp="mrc"; else if(tp===false) tp="pq";
    const sp=document.createElement("span"); sp.className=tp==="mrc"?"fcm":tp==="exp"?"exm":"pesq"; sp.contentEditable="false";
    if(tp==="mrc"){ sp.dataset.fc=t; sp.title="Flashcard: clique para ver ou editar"; } else if(tp==="exp"){ sp.dataset.ex=t; sp.title=dicaExp(t); } else { sp.dataset.q=t; sp.title="Pesquisar “"+t+"” · clique para editar"; } sp.textContent=t; return sp; }
  function marcaPelaBarra(ed,tp){
    const s=getSelection(); if(!s.rangeCount||!ed.contains(s.anchorNode)) return;
    const fc=tp==="mrc", ex=tp==="exp", r=s.getRangeAt(0), cls=fc?".fcm":ex?".exm":".pesq", el=n=>n&&(n.nodeType===1?n:n.parentNode);
    let sp=el(r.startContainer)&&el(r.startContainer).closest(cls);
    if(!sp&&r.startContainer.nodeType===1) sp=[r.startContainer.childNodes[r.startOffset-1],r.startContainer.childNodes[r.startOffset]].find(x=>x&&x.nodeType===1&&x.matches(cls));
    if(!sp&&r.startContainer.nodeType===3){ const tx=r.startContainer; if(r.startOffset<=1&&tx.previousSibling&&tx.previousSibling.nodeType===1&&tx.previousSibling.matches(cls)&&/^\u200b?$/.test(tx.nodeValue.slice(0,r.startOffset))) sp=tx.previousSibling; }
    if(!sp&&!r.collapsed){ const f=r.cloneContents(); if(f.querySelector&&f.querySelector(cls)&&!r.toString().replace(/\u200b/g,"").trim().replace(/^\S+$/,"")) sp=[...ed.querySelectorAll(cls)].find(x=>r.intersectsNode(x)); }
    if(sp) return ex?abrirExp(ed,sp,false):editarMarca(sp);
    const lim=fc?200:ex?120:80;
    let t=r.toString().replace(/\u200b/g,"").replace(/\s+/g," ").trim().replace(fc?/[{}]/g:ex?/[()]/g:/[<>]/g,"");
    if(t.length>lim) t=t.slice(0,lim).trim();
    if(dentroDe(ed,"CODE")||dentroDe(ed,"PRE")||dentroDe(ed,"A")) return;
    const novo=novaMarca(tp,t||(fc?"pergunta":"termo")); r.deleteContents(); const z=document.createTextNode("\u200b"); r.insertNode(z); r.insertNode(novo);
    const c=document.createRange(); c.setStart(z,1); c.collapse(true); s.removeAllRanges(); s.addRange(c); sincronizar(ed);
    if(!t) return editarMarca(novo,true);
    if(fc) abrirMarca(ed,novo,true); else if(ex) abrirExp(ed,novo,true);
  }
  // Trocar o tipo do marcador (pesquisa ⇄ flashcard ⇄ explicação), mantendo o texto.
  const TIPOS_M={pq:{n:"&lt; &gt; Pesquisa",lim:80},mrc:{n:"{{ }} Flashcard",lim:200},exp:{n:"(( )) Explicação",lim:120}};
  function mudarHTML(atual,txt){
    const ok=k=>k!==atual&&(k==="pq"||(k==="mrc"&&window.FORMATO_FLASH_MARCA)||(k==="exp"&&window.FORMATO_EXPLICA));
    const bs=Object.keys(TIPOS_M).filter(ok).map(k=>{ const longo=String(txt||"").length>TIPOS_M[k].lim; return `<button type="button" data-m="para-${k}" ${longo?`disabled title="Texto longo demais para ${k==="pq"?"pesquisa":"explicação"} (máx. ${TIPOS_M[k].lim} letras)"`:`title="Transformar em ${k==="pq"?"termo de pesquisa":k==="mrc"?"pergunta de flashcard":"termo com explicação"}"`}>${TIPOS_M[k].n}</button>`; });
    return bs.length?`<div class="mrc-mv"><span>Mudar para</span>${bs.join("")}</div>`:"";
  }
  function converterMarca(sp,tp){
    const ed=sp.closest(".wys"); if(!ed||!TIPOS_M[tp]) return;
    let t=String(sp.dataset.fc||sp.dataset.ex||sp.dataset.q||sp.textContent).replace(/\u200b/g,"").replace(/\s+/g," ").trim();
    t=t.replace(tp==="mrc"?/[{}]/g:tp==="exp"?/[()]/g:/[<>]/g,"").trim().slice(0,TIPOS_M[tp].lim).trim(); if(!t) return;
    const n=novaMarca(tp,t); sp.replaceWith(n); sincronizar(ed);
    if(tp==="mrc") abrirMarca(ed,n,true); else if(tp==="exp") abrirExp(ed,n,true); else editarMarca(n);
  }
  function editarMarca(sp,vazio){
    const ed=sp.closest(".wys"); if(!ed) return; const doc=sp.ownerDocument, win=doc.defaultView||window, fc=sp.classList.contains("fcm"), ex=sp.classList.contains("exm");
    doc.querySelectorAll(".mrc-pop").forEach(x=>x._fechar?x._fechar():x.remove());
    let atual=fc?sp.dataset.fc:ex?sp.dataset.ex:sp.dataset.q;
    const p=doc.createElement("div"); p.className="mrc-pop"; p.setAttribute("role","dialog"); p.setAttribute("aria-label",fc?"Editar marcador de flashcard":"Editar termo de pesquisa");
    p.innerHTML=`<div class="mrc-l"><span>${fc?"{{ }} Pergunta do flashcard":ex?"(( )) Termo a explicar":"&lt; &gt; Termo de pesquisa"}</span><span>Enter ${vazio?"confirma":"salva"} · Esc fecha</span></div>
      <input type="text" maxlength="${fc?200:ex?120:80}" value="${escH(vazio?"":atual)}" placeholder="${fc?"Escreva a pergunta":ex?"Palavra, termo ou frase":"Escreva o termo"}" aria-label="${fc?"Pergunta":"Termo"}">
      <div class="mrc-b"><button type="button" class="pri" data-m="ir">${fc?(vazio?"Criar flashcard":"Ver flashcard"):ex?"Explicação":"↗ Pesquisar"}</button><button type="button" data-m="ok" hidden>Salvar</button>${!fc&&!ex&&window.FORMATO_RAPIDO?`<button type="button" data-m="rapido" title="Mostra aqui um trecho conceitual (Wikipédia), sem sair da anotação">⚡ Rápida</button>`:""}${vazio?"":`<button type="button" data-m="tirar" title="Mantém o texto e tira a marcação">Tirar marcação</button>`}<button type="button" data-m="apagar" title="Apagar o marcador e o texto">Apagar</button></div>
      ${vazio?"":mudarHTML(fc?"mrc":ex?"exp":"pq",atual)}`;
    doc.body.appendChild(p);
    const R=sp.getBoundingClientRect(), W=p.offsetWidth, H=p.offsetHeight;
    p.style.left=Math.max(8,Math.min(R.left,win.innerWidth-W-8))+"px";
    p.style.top=(R.bottom+6+H>win.innerHeight-8&&R.top-6-H>8?R.top-6-H:Math.min(R.bottom+6,win.innerHeight-H-8))+"px";
    const inp=p.querySelector("input"), ok=p.querySelector('[data-m="ok"]');
    const limpo=()=>inp.value.replace(/\s+/g," ").trim().replace(fc?/[{}]/g:ex?/[()]/g:/[<>]/g,"").slice(0,fc?200:ex?120:80);
    inp.addEventListener("input",()=>{ ok.hidden=vazio||!limpo()||limpo()===atual; });
    const fora=e=>{ if(!p.contains(e.target)) fechar(false); };
    const tecla=e=>{ if(e.key==="Escape"){ e.preventDefault(); e.stopPropagation(); fechar(true); } };
    function fechar(volta){ if(!p.isConnected) return; p.remove(); doc.removeEventListener("mousedown",fora,true); doc.removeEventListener("keydown",tecla,true);
      if(vazio&&sp.isConnected&&!sp.dataset.ok){ sp.remove(); sincronizar(ed); }
      if(volta&&sp.isConnected){ try{ ed.focus(); const z=sp.nextSibling, c=doc.createRange(); if(z&&z.nodeType===3) c.setStart(z,Math.min(1,z.nodeValue.length)); else c.setStartAfter(sp); c.collapse(true); const x=win.getSelection(); x.removeAllRanges(); x.addRange(c); }catch(e){} }
      else if(volta) try{ ed.focus(); }catch(e){} }
    p._fechar=()=>fechar(false);
    function salvar(){ const t=limpo(); if(!t) return false; sp.dataset.ok="1"; if(t===atual&&!vazio) return true;
      if(fc){ if(!vazio&&window.FORMATO_FLASH_RENOMEAR) try{ window.FORMATO_FLASH_RENOMEAR(atual,t,ed._ta); }catch(e){} sp.dataset.fc=t; }
      else if(ex){ sp.dataset.ex=t; sp.title=dicaExp(t); }
      else { sp.dataset.q=t; sp.title="Pesquisar “"+t+"” · clique para editar"; }
      sp.textContent=t; atual=t; sincronizar(ed); return true; }
    function acao(m){
      if(m==="ok"){ if(salvar()) fechar(true); else inp.focus(); return; }
      if(m==="rapido"){ if(!salvar()){ inp.focus(); return; } fechar(false); const win2=doc.defaultView||window, s2=win2.getSelection(), rg2=null;
        window.FORMATO_RAPIDO({termo:sp.dataset.q, el:sp, voltar:()=>{ try{ ed.focus(); const c=doc.createRange(); c.setStartAfter(sp); c.collapse(true); s2.removeAllRanges(); s2.addRange(c); }catch(e){} void rg2; }, paraExp:()=>{ if(sp.isConnected) converterMarca(sp,"exp"); }}); return; }
      if(m==="ir"){ if(!salvar()){ inp.focus(); return; } fechar(!fc&&!ex); if(fc) abrirMarca(ed,sp,!!vazio); else if(ex) abrirExp(ed,sp,!!vazio); else pesquisarTermo(sp); return; }
      if(m==="tirar"){ const tx=doc.createTextNode(sp.textContent); sp.replaceWith(tx); sincronizar(ed); p.remove(); doc.removeEventListener("mousedown",fora,true); doc.removeEventListener("keydown",tecla,true); try{ ed.focus(); const c=doc.createRange(); c.setStart(tx,tx.nodeValue.length); c.collapse(true); const x=win.getSelection(); x.removeAllRanges(); x.addRange(c); }catch(e){} return; }
      if(m==="apagar"){ const z=sp.nextSibling; if(z&&z.nodeType===3&&z.nodeValue==="\u200b") z.remove(); sp.remove(); sincronizar(ed); p.remove(); doc.removeEventListener("mousedown",fora,true); doc.removeEventListener("keydown",tecla,true); try{ ed.focus(); }catch(e){} }
    }
    p.addEventListener("click",e=>{ const b=e.target.closest("button[data-m]"); if(!b||b.disabled) return;
      if(b.dataset.m.startsWith("para-")){ salvar(); p.remove(); doc.removeEventListener("mousedown",fora,true); doc.removeEventListener("keydown",tecla,true); converterMarca(sp,b.dataset.m.slice(5)); return; }
      acao(b.dataset.m); });
    inp.addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); acao(vazio||limpo()===atual?"ir":"ok"); } });
    setTimeout(()=>{ doc.addEventListener("mousedown",fora,true); doc.addEventListener("keydown",tecla,true); },0);
    inp.focus(); inp.select();
  }
  // Atalhos de digitação: "- ", "1. ", "# ", "> ", "[] " numa linha vazia viram formatação.
  function cursorEm(el){ const r=document.createRange(); r.setStart(el,0); r.collapse(true); const s=getSelection(); s.removeAllRanges(); s.addRange(r); }
  function atalhoDigitado(ed){
    const b=blocoAtual(ed); if(!b||!/^(DIV|P)$/.test(b.tagName)||b.parentNode!==ed) return;
    const t=b.textContent.replace(/\u00a0/g," "); let m, novo=null, alvo=null;
    const lista=(tag,tk)=>{ const l=document.createElement(tag); if(tk) l.className="tk"; const li=document.createElement("li"); if(tk) li.dataset.tk="0"; li.innerHTML="<br>"; l.appendChild(li); novo=l; alvo=li; };
    if(/^[-*] $/.test(t)) lista("ul");
    else if(/^\d+[.)] $/.test(t)) lista("ol");
    else if(/^\[ ?\] $/.test(t)) lista("ul",true);
    else if((m=t.match(/^(#{1,3}) $/))){ novo=document.createElement("h"+m[1].length); novo.innerHTML="<br>"; alvo=novo; }
    else if(/^> $/.test(t)){ novo=document.createElement("blockquote"); const d=document.createElement("div"); d.innerHTML="<br>"; novo.appendChild(d); alvo=d; }
    if(!novo) return;
    b.replaceWith(novo); cursorEm(alvo);
  }
  document.addEventListener("compositionend",e=>{ const ed=e.target&&e.target.closest&&e.target.closest(".wys"); if(!ed) return; const dd=e.data||"";
    if(/[>})]\s*$/.test(dd)) setTimeout(()=>{ if(/>\s*$/.test(dd)) termoDigitado(ed); if(/\}\s*$/.test(dd)) flashDigitado(ed); if(/\)\s*$/.test(dd)) explicaDigitado(ed); sincronizar(ed); },0); });
  document.addEventListener("input",e=>{
    const ed=e.target; if(!ed.classList||!ed.classList.contains("wys")) return;
    if(e.inputType==="insertText"&&e.data===" ") atalhoDigitado(ed);
    // ">" e "}" digitados (teclado comum, teclado do celular/IME ou correção do navegador que troca a palavra)
    const dd=e.data||"", digitou=/^insert(Text|ReplacementText)$/.test(e.inputType)||(e.inputType==="insertCompositionText"&&!e.isComposing);
    if(digitou&&/>\s*$/.test(dd)) termoDigitado(ed);
    if(digitou&&/\}\s*$/.test(dd)) flashDigitado(ed);
    if(digitou&&/\)\s*$/.test(dd)) explicaDigitado(ed);
    if(e.inputType==="insertParagraph"){ const li=dentroDe(ed,"LI"); if(li&&li.parentNode.classList.contains("tk")&&!li.textContent.trim()) li.dataset.tk="0"; }
    sincronizar(ed);
  });
  document.addEventListener("keydown",e=>{
    const ed=e.target; if(!ed.classList||!ed.classList.contains("wys")) return;
    if(e.key==="Tab"&&celAtual(ed)){ e.preventDefault(); const c=celAtual(ed), cs=[...c.closest("table").querySelectorAll("th,td")], i=cs.indexOf(c);
      if(e.shiftKey){ focarCel(cs[i-1]||c); return; } if(i===cs.length-1){ opTabela(ed,"linha"); focarCel(c.closest("table").rows[c.closest("table").rows.length-1].children[0]); return; } focarCel(cs[i+1]); return; }
    if(e.key==="Tab"&&dentroDe(ed,"LI")){ e.preventDefault(); if(e.shiftKey) desrecuar(ed); else recuar(ed); return; }
    // Enter num item vazio de sublista: volta um nível (como no Word)
    if(e.key==="Enter"&&!e.shiftKey){ const li=dentroDe(ed,"LI"); if(li&&!li.textContent.replace(/[\u200b\s]/g,"")&&!li.querySelector("img")&&li.parentNode.parentNode.tagName==="LI"){ e.preventDefault(); desrecuar(ed); return; } }
    if(!(e.ctrlKey||e.metaKey)||e.altKey) return; const k=e.key.toLowerCase();
    if(k==="k"){ e.preventDefault(); aplicarEd(ed,"lnk"); } else if(e.shiftKey&&k==="x"){ e.preventDefault(); aplicarEd(ed,"tar"); }
  });
  document.addEventListener("mousedown",e=>{ const li=e.target.closest&&e.target.closest(".wys ul.tk > li"); if(!li||e.target!==li) return; const r=li.getBoundingClientRect(); if(e.clientX-r.left<26){ e.preventDefault(); li.dataset.tk=li.dataset.tk==="1"?"0":"1"; sincronizar(li.closest(".wys")); } });
  document.addEventListener("click",e=>{ const a=e.target.closest&&e.target.closest(".wys a[href]"); if(a&&(e.ctrlKey||e.metaKey)){ e.preventDefault(); window.open(a.href,"_blank","noopener"); } });
  // Colar: imagem → envia; texto com Markdown (ex.: resposta do Claude) → entra formatado; texto simples → sem estilos de outros sites.
  document.addEventListener("paste",e=>{
    const ed=e.target.closest&&e.target.closest(".wys"); if(!ed) return;
    const fs=[...(e.clipboardData&&e.clipboardData.files||[])].filter(f=>/^image\//.test(f.type));
    e.preventDefault();
    if(fs.length){ enviarImagens(ed._ta,fs); return; }
    const t=(e.clipboardData&&e.clipboardData.getData("text/plain"))||""; if(!t) return;
    if(/\n|\*\*|^#{1,3} |^[-*] |^\d+\. |==|`/m.test(t)) cmd("insertHTML",mdParaHtml(t)); else cmd("insertText",t);
    sincronizar(ed);
  });
  document.addEventListener("dragover",e=>{ const ed=e.target.closest&&e.target.closest(".wys"); if(ed&&e.dataTransfer&&[...e.dataTransfer.types].includes("Files")){ e.preventDefault(); ed.classList.add("fmt-drop"); } });
  document.addEventListener("dragleave",e=>{ const ed=e.target.closest&&e.target.closest(".wys"); if(ed) ed.classList.remove("fmt-drop"); });
  document.addEventListener("drop",e=>{ const ed=e.target.closest&&e.target.closest(".wys"); if(!ed) return; ed.classList.remove("fmt-drop");
    const fs=[...(e.dataTransfer&&e.dataTransfer.files||[])].filter(f=>/^image\//.test(f.type)); if(fs.length){ e.preventDefault(); enviarImagens(ed._ta,fs); } });
  // Posição do cursor no texto (Markdown), para inserir fluxograma onde o cursor está.
  function cursorDe(ta){
    const ed=ta._ed; if(!ed) return ta.selectionStart;
    const r=ed._range&&ed.contains(ed._range.startContainer)?ed._range.cloneRange():null; if(!r) return ta.value.length;
    r.collapse(false); const mk=document.createTextNode(""); r.insertNode(mk);
    const v=htmlParaMd(ed), p=v.indexOf(""); const pai=mk.parentNode; mk.remove(); if(pai) pai.normalize();
    return p<0?ta.value.length:p;
  }
  function segAtivo(ta){ return ta._ed||ta; }
  function reajustar(){}
  document.addEventListener("click",e=>{
    const b=e.target.closest&&e.target.closest("[data-fxb]"); if(!b) return;
    const bloco=b.closest(".fx-bloco"), ed=bloco.closest(".wys"), ta=ed&&ed._ta; if(!ta) return;
    const id=bloco.dataset.fxid;
    if(b.dataset.fxb==="editar"){ const bs=window.FLUXO?FLUXO.blocos(ta.value):[]; const i=bs.findIndex(x=>x.fx===id); fluxograma(ta, i<0?null:i); return; }
    const d=S.docs["fx-"+id];
    if(b.dataset.fxb==="dobrar"){ const rec=!bloco.classList.contains("recolhido"); bloco.classList.toggle("recolhido",rec); b.setAttribute("aria-expanded",String(!rec)); b.title=(rec?"Mostrar":"Recolher")+" fluxograma";
      if(d&&!d.apagado) salvarDoc("fx-"+id,{...d,recolhido:rec},300); return; }
    if(b.dataset.fxb==="nome"){ const n=prompt("Tema do fluxograma:", temaFx(d)); if(n==null) return; const t=n.trim().slice(0,80);
      if(d&&!d.apagado) salvarDoc("fx-"+id,{...d,titulo:t,...(d.modelo?{modelo:{...d.modelo,titulo:t}}:{})},50); b.textContent=t||temaFx({...d,titulo:""}); return; }
    if(!b.dataset.conf){ b.dataset.conf="1"; b.textContent="Confirmar"; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.conf; b.textContent="Remover"; } },3000); return; }
    bloco.remove(); if(id&&typeof salvarDoc==="function") salvarDoc("fx-"+id,{tipo:"fx",apagado:true},50);
    sincronizar(ed);
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
    const ed=ta._ed, rng=ed&&ed._range&&ed.contains(ed._range.startContainer)?ed._range.cloneRange():null;
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
    if(t._ed&&t._ed.isConnected){ const e2=t._ed; e2.focus(); if(rng&&e2.contains(rng.startContainer)){ const sl=getSelection(); sl.removeAllRanges(); sl.addRange(rng); }
      cmd("insertHTML", partes.map(p=>`<div>${inlineHtml(p)}</div>`).join("")+"<div><br></div>"); sincronizar(e2); mostrarImagens(document); aviso(partes.length>1?"Imagens inseridas.":"Imagem inserida."); return; }
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
      const falhou=msg=>{ if(img.closest(".wys")){ img.title=(img.alt||"imagem")+" · "+msg; img.classList.add("md-img-falha"); return; } const s=img.ownerDocument.createElement("span"); s.className="md-img-x"; s.textContent="🖼 "+(img.alt||"imagem")+" · "+msg; img.replaceWith(s); };
      if(!temConta()){ falhou("entre na conta para ver"); return; }
      urlAssinada(img.dataset.sb).then(u=>{ img.src=u; }).catch(()=>falhou("não encontrada"));
    });
  }
  /* Áreas de arrastar e soltar: todo <input type=file> visível vira uma zona "arraste aqui ou clique";
     elementos com [data-dz-para] repassam o que for solto para os inputs indicados (ex.: anexos, que têm inputs escondidos). */
  function aceita(inp,f){ const ac=(inp.accept||"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean); if(!ac.length) return true;
    const n=(f.name||"").toLowerCase(), t=(f.type||"").toLowerCase();
    return ac.some(a=>a.startsWith(".")?n.endsWith(a):a.endsWith("/*")?t.startsWith(a.slice(0,-1)):t===a); }
  function entregar(inp,files){ let fs=[...files].filter(f=>aceita(inp,f)); if(!fs.length) return 0; if(!inp.multiple) fs=fs.slice(0,1);
    try{ const dt=new DataTransfer(); fs.forEach(f=>dt.items.add(f)); inp.files=dt.files; inp.dispatchEvent(new Event("change",{bubbles:true})); return fs.length; }catch(e){ return 0; } }
  function zonaTexto(inp){ const n=inp.files&&inp.files.length, pasta=inp.hasAttribute("webkitdirectory");
    if(n) return (n===1?"📎 "+inp.files[0].name:"📎 "+n+" arquivos"+(pasta?" na pasta":" escolhidos"))+" · clique ou arraste para trocar";
    return pasta?"Arraste e solte uma pasta aqui ou clique para escolher":inp.multiple?"Arraste e solte arquivos ou uma pasta aqui, ou clique para escolher":"Arraste e solte o arquivo aqui ou clique para escolher"; }
  function equiparZonas(raiz){
    raiz.querySelectorAll('input[type=file]:not([hidden]):not([data-dz])').forEach(inp=>{
      inp.dataset.dz="1"; const z=inp.ownerDocument.createElement("label"); z.className="dz"; if(inp.id) z.htmlFor=inp.id;
      z.innerHTML=`<span class="dz-ic" aria-hidden="true">⤓</span><span class="dz-tx"></span>`; z.querySelector(".dz-tx").textContent=zonaTexto(inp);
      inp.before(z); z.appendChild(inp); inp.classList.add("dz-inp");
      inp.addEventListener("change",()=>{ z.querySelector(".dz-tx").textContent=zonaTexto(inp); });
    });
  }
  // pastas soltas: percorre as subpastas e devolve todos os arquivos (com o caminho em f.caminho)
  async function arquivosSoltos(dt){
    const its=[...(dt.items||[])].filter(i=>i.kind==="file"), entradas=its.map(i=>i.webkitGetAsEntry&&i.webkitGetAsEntry()).filter(Boolean);
    if(!entradas.some(x=>x.isDirectory)) return [...dt.files];
    const out=[];
    const ler=async(en,pre)=>{ if(en.isFile){ const f=await new Promise((ok,er)=>en.file(ok,er)).catch(()=>null); if(f){ try{ Object.defineProperty(f,"caminho",{value:pre+f.name}); }catch(e){} out.push(f); } return; }
      if(en.isDirectory){ const r=en.createReader(); let lote; do{ lote=await new Promise(ok=>r.readEntries(ok,()=>ok([]))); for(const x of lote) await ler(x,pre+en.name+"/"); }while(lote.length); } };
    for(const en of entradas) await ler(en,"");
    return out.filter(f=>!/^\./.test(f.name)).sort((a,b)=>(a.caminho||a.name).localeCompare(b.caminho||b.name,"pt-BR",{numeric:true}));
  }
  function ligarZonas(doc){
    if(doc._dz) return; doc._dz=1;
    const alvo=e=>e.target.closest&&(e.target.closest("label.dz")||e.target.closest("[data-dz-para]"));
    const temArq=e=>e.dataTransfer&&[...e.dataTransfer.types].includes("Files");
    doc.addEventListener("dragover",e=>{ const z=alvo(e); if(!z||!temArq(e)) return; e.preventDefault(); e.dataTransfer.dropEffect="copy"; z.classList.add("dz-on"); });
    doc.addEventListener("dragleave",e=>{ const z=alvo(e); if(z&&!z.contains(e.relatedTarget)) z.classList.remove("dz-on"); });
    doc.addEventListener("drop",async e=>{ const z=alvo(e); if(!z||!temArq(e)) return; e.preventDefault(); e.stopPropagation(); z.classList.remove("dz-on");
      const fs=await arquivosSoltos(e.dataTransfer); let n=0;
      if(z.matches("label.dz")){ const inp=z.querySelector("input[type=file]"); n=entregar(inp,fs); }
      else { const box=z.closest(z.dataset.dzEscopo||"body")||doc.body; for(const sel of z.dataset.dzPara.split(",")){ const inp=box.querySelector(sel.trim()); if(inp) n+=entregar(inp,fs); } }
      if(!n){ const t=z.querySelector(".dz-tx")||z; const v=t.textContent; t.textContent="Tipo de arquivo não aceito aqui."; setTimeout(()=>{ t.textContent=v; },2200); }
    },true);
  }
  function ampliar(img){
    const doc=img.ownerDocument; doc.querySelector(".img-lb")?.remove();
    const d=doc.createElement("div"); d.className="img-lb"; d.setAttribute("role","dialog"); d.setAttribute("aria-label","Imagem ampliada");
    d.innerHTML=`<img src="${escH(img.currentSrc||img.src)}" alt="${escH(img.alt||"")}"><button type="button" aria-label="Fechar">✕</button>`;
    doc.body.appendChild(d);
    const k=e=>{ if(e.key==="Escape"){ e.stopPropagation(); e.preventDefault(); fechar(); } }, fechar=()=>{ d.remove(); doc.removeEventListener("keydown",k,true); };
    d.addEventListener("click",fechar); doc.addEventListener("keydown",k,true);
  }
  function recuoTa(ta,mais){ const {a,b,ls}=linhas(ta); const n=ls.map(l=>!l.trim()?l:mais?"  "+l:l.replace(/^ {1,2}|^\t/,"")); const t=n.join("\n"); trocar(ta,a,b,t,a,a+t.length); }
  function aplicar(ta,k){
    ({rev:()=>{}, fla:()=>{ if(window.FORMATO_FLASH) window.FORMATO_FLASH(ta, ta.value.slice(ta.selectionStart,ta.selectionEnd)); }, dest:()=>{ if(window.FORMATO_DESTACAR) window.FORMATO_DESTACAR(ta); },
      pq:()=>envolver(ta,"<",">","termo"), mrc:()=>envolver(ta,"{{","}}","pergunta"), exp:()=>envolver(ta,"((","))","termo"),
      tab:()=>{ const v=ta.value, a=ta.selectionStart, antes=a>0&&v[a-1]!=="\n"?"\n":""; trocar(ta,a,ta.selectionEnd,antes+"| Coluna 1 | Coluna 2 | Coluna 3 |\n| --- | --- | --- |\n|  |  |  |\n|  |  |  |\n"); },
      sub:()=>recuoTa(ta,true), sob:()=>recuoTa(ta,false), neg:()=>envolver(ta,"**","**","negrito"), ita:()=>envolver(ta,"*","*","itálico"), mar:()=>envolver(ta,"==","==","destaque"),
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
    const marca=doc.createComment("tela-cheia"); (ta._abas||bar||ta).before(marca);
    const ov=doc.createElement("div"); ov.className="fmt-cheia"; ov.setAttribute("role","dialog"); ov.setAttribute("aria-label","Anotação em tela cheia");
    ov.innerHTML=`<header><span class="fc-t"></span><span class="fc-n"></span><button type="button" data-fc="ver">Visualizar</button><button type="button" data-fc="sair">Sair da tela cheia</button></header><div class="fc-b"></div>`;
    ov.querySelector(".fc-t").textContent=tituloDe(ta);
    const corpo=ov.querySelector(".fc-b"); if(ta._abas) corpo.appendChild(ta._abas); if(bar) corpo.appendChild(bar); corpo.appendChild(ta); if(ta._ed) corpo.appendChild(ta._ed); if(ta._pg) corpo.appendChild(ta._pg); if(ta._pr) corpo.appendChild(ta._pr); if(ta._pj) corpo.appendChild(ta._pj);
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
    ta.hidden=!!ta._ed; if(ta._ed) ta._ed.hidden=false; if(bar) bar.hidden=false;
    if(marca.isConnected){ if(ta._abas) marca.before(ta._abas); if(bar) marca.before(bar); marca.before(ta); if(ta._ed) ta.after(ta._ed); if(ta._pg) (ta._ed||ta).after(ta._pg); if(ta._pr) ta._pg.after(ta._pr); if(ta._pj) (ta._pr||ta._pg).after(ta._pj); marca.remove(); ov.remove(); reajustar(ta); segAtivo(ta).focus(); }
    else { ov.remove(); if(typeof render==="function") try{ render(); }catch(e){} if(typeof renderPane==="function"&&typeof PANE!=="undefined"&&PANE) try{ renderPane(); }catch(e){} }
    doc.body.style.overflow="";
    if(fs && doc.fullscreenElement && doc.exitFullscreen) doc.exitFullscreen().catch(()=>{});
  }
  function verCheia(){
    if(!CHEIA) return; const {ta,bar,prev,ov}=CHEIA, b=ov.querySelector('[data-fc="ver"]');
    const mostrar=prev.hidden;
    if(mostrar){ prev.innerHTML= typeof md==="function"? md(ta.value) : ""; if(!prev.innerHTML) prev.textContent=ta.value; mostrarImagens(ov.ownerDocument); }
    prev.hidden=!mostrar; if(ta._ed){ ta.hidden=true; ta._ed.hidden=mostrar; } else ta.hidden=mostrar; if(bar) bar.hidden=mostrar; b.textContent=mostrar?"Editar":"Visualizar";
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
      BT_ULT=bt; if(ta._ed) aplicarEd(ta._ed,k); else aplicar(ta,k);
    });
    doc.addEventListener("keydown",e=>{
      const ta=e.target; if(!ta.matches||!ta.matches(ALVOS+",textarea.fx-seg")) return;
      if(e.key==="Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && !e.isComposing){ enter(ta,e); return; }
      if(e.key==="Tab" && !e.ctrlKey && !e.altKey){ const v=ta.value, i=v.lastIndexOf("\n",ta.selectionStart-1)+1; if(RE_LISTA.test(v.slice(i))&&!/^>/.test(v.slice(i).trim())){ e.preventDefault(); recuoTa(ta,!e.shiftKey); return; } }
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
    // imagem ampliada dentro do próprio caderno (não abre outra aba do navegador); no editor, duplo clique
    doc.addEventListener("click",e=>{ const im=e.target.closest&&e.target.closest("img.md-img[src]"); if(im&&!im.closest(".wys")){ e.preventDefault(); ampliar(im); } });
    doc.addEventListener("dblclick",e=>{ const im=e.target.closest&&e.target.closest(".wys img.md-img[src]"); if(im){ e.preventDefault(); ampliar(im); } });
    equipar(doc); mostrarImagens(doc);
    new MutationObserver(()=>{ equipar(doc); mostrarImagens(doc); }).observe(doc.body,{childList:true,subtree:true});
  }
  ligar(document);
  // Janela "por cima de outras janelas" do bloco flutuante (Picture-in-Picture)
  if(typeof window.ligarFlutuante==="function"){
    const orig=window.ligarFlutuante;
    // Na janela por cima, carrega o mesmo editor (formato.js + fluxo.js) dentro dela: fica igual às anotações
    // da página (visual, fluxograma, tabela, revisão). Dados e funções de salvar são os da página principal.
    window.ligarFlutuante=function(doc){ orig(doc); if(doc!==document) editorNaJanela(doc); };
  }
  function editorNaJanela(doc){
    const w=doc.defaultView; if(!w||w.FORMATO) return;
    const def=(nome,val)=>{ try{ Object.defineProperty(w,nome,{get:val,configurable:true}); }catch(e){} };
    if(typeof S==="object") def("S",()=>S);
    if(typeof CONVITE!=="undefined") def("CONVITE",()=>CONVITE);
    ["salvarDoc","apagarDoc","logado"].forEach(n=>{ try{ const f=(0,eval)(n); if(typeof f==="function") w[n]=f; }catch(e){} });
    ["FORMATO_FLASH","FORMATO_FLASH_MARCA","FORMATO_FLASH_RENOMEAR","FORMATO_EXPLICA","FORMATO_RAPIDO","FORMATO_PROJ","FORMATO_PRAT"].forEach(n=>{ if(window[n]) w[n]=window[n]; });
    if(typeof window.ligarAbaProj==="function") window.ligarAbaProj(doc);
    if(typeof window.ligarAbaPrat==="function") window.ligarAbaPrat(doc);
    w.toast=t=>{ try{ const d=doc.createElement("div"); d.className="toast"; d.textContent=t; doc.body.appendChild(d); setTimeout(()=>d.remove(),3500); }catch(e){} };
    const carregar=src=>new Promise(ok=>{ const sc=doc.createElement("script"); sc.src=src; sc.onload=sc.onerror=()=>ok(); doc.head.appendChild(sc); });
    carregar("/fluxo.js").then(()=>carregar("/formato.js")).then(()=>{ if(!w.FORMATO){ // sem script na janela: volta à caixa simples
      const s=doc.createElement("style"); s.textContent=CSS; doc.head.appendChild(s); ligar(doc); ligarRev(doc); } });
  }
  window.FORMATO={ampliar, lerPergs, listaHtml, ehItem, ehTabela, tabelaHtml, aplicar, equipar, ligar, enviarImagens, mostrarImagens, telaCheia, sairCheia, montar, cursorDe, mdParaHtml, htmlParaMd, separar, juntar};
})();
