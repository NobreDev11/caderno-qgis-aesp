// Pedidos para a IA (usados pelo servidor e pelo modo "copiar e colar" do navegador).
(function (raiz, fab) {
  if (typeof module === "object" && module.exports) module.exports = fab();
  else raiz.PROMPTS = fab();
})(typeof self !== "undefined" ? self : this, function () {
  const CURSO =
    'Curso "Uso do QGIS como Estratégia de Segurança Pública" (Academia Estadual de Segurança Pública do Ceará - AESP/CE). ' +
    "O aluno é bombeiro militar (CBMCE) e quer aplicar geoprocessamento a ocorrências, áreas de risco e planejamento operacional.";

  const SISTEMA =
    "Você é um tutor de geoprocessamento e cartografia aplicada à segurança pública. " +
    "Responda sempre em português do Brasil, com precisão técnica, sem inventar conteúdo que não esteja no material. " +
    "Quando o material citar ferramentas do QGIS, use os nomes dos menus em português como aparecem no QGIS em pt-BR.";

  function cab(meta) {
    return (
      CURSO + "\n" +
      (meta.disciplina ? "Disciplina: " + meta.disciplina + "\n" : "") +
      (meta.titulo ? "Material: " + meta.titulo + "\n" : "")
    );
  }
  function corpo(texto, nImg) {
    let s = "";
    if (nImg) s += "\n(O material também inclui " + nImg + " imagem(ns) anexada(s): leia o conteúdo delas.)\n";
    if (texto && texto.trim()) s += "\n<material>\n" + texto.trim() + "\n</material>\n";
    return s;
  }

  function pedidoResumo(meta, texto, nImg) {
    return (
      cab(meta) +
      "\nFaça um resumo de estudo do material abaixo, em Markdown, com estas seções:\n" +
      "## Ideia central (2 a 4 frases)\n" +
      "## Pontos principais (lista)\n" +
      "## Passo a passo no QGIS (só se o material tiver procedimentos; numerado, com menus e ferramentas)\n" +
      "## Aplicação em segurança pública / bombeiros (exemplos concretos ligados ao material)\n" +
      "## Termos para lembrar (glossário curto: termo - definição)\n" +
      "Use só o que está no material; se algo estiver incompleto, diga. Não use tabelas." +
      corpo(texto, nImg)
    );
  }

  function pedidoQuestoes(meta, texto, nImg) {
    const n = meta.n || 8;
    return (
      cab(meta) +
      "\nCrie " + n + " questões de múltipla escolha sobre o material abaixo, para revisão e prova.\n" +
      "Regras: 4 alternativas por questão, só uma correta, distratores plausíveis, misture fácil/média/difícil, " +
      "inclua questões práticas de QGIS quando o material permitir, e varie a posição da alternativa correta.\n" +
      "Responda SOMENTE com um JSON válido, sem texto antes ou depois, neste formato:\n" +
      '[{"pergunta":"...","alternativas":["...","...","...","..."],"correta":0,"explicacao":"por que a correta está certa"}]\n' +
      '"correta" é o índice (0 a 3) da alternativa certa.' +
      corpo(texto, nImg)
    );
  }

  function pedidoFlashcards(meta, texto, nImg) {
    const n = meta.n || 12;
    return (
      cab(meta) +
      "\nCrie " + n + " flashcards (cartões de memorização) sobre o material abaixo, para revisão espaçada.\n" +
      "Regras: um conceito por cartão; frente curta (pergunta direta, termo ou situação prática); verso com a resposta " +
      "em até 2 frases, sem repetir a pergunta; cubra definições, passos no QGIS, siglas e aplicações em segurança pública; " +
      "não invente nada que não esteja no material.\n" +
      "Responda SOMENTE com um JSON válido, sem texto antes ou depois, neste formato:\n" +
      '[{"frente":"...","verso":"..."}]' +
      corpo(texto, nImg)
    );
  }
  // Aceita JSON [{frente,verso}] ou linhas "Frente: … / Verso: …" (também "P: … / R: …").
  function lerFlashcards(txt) {
    const s = String(txt || "");
    const ini = s.indexOf("["), fim = s.lastIndexOf("]");
    if (ini >= 0 && fim > ini) {
      try {
        const arr = JSON.parse(s.slice(ini, fim + 1));
        if (Array.isArray(arr)) {
          const out = arr.map((c) => ({ frente: String((c && (c.frente || c.f || c.pergunta || c.front)) || "").trim(), verso: String((c && (c.verso || c.v || c.resposta || c.back)) || "").trim() })).filter((c) => c.frente && c.verso);
          if (out.length) return out;
        }
      } catch (e) {}
    }
    const out = []; let cur = null;
    for (const l of s.split("\n")) {
      let m = l.match(/^\s*(?:\d+[.)]\s*)?(?:\*\*)?(?:frente|f|p|pergunta)\s*:(?:\*\*)?\s*(.+)$/i);
      if (m) { cur = { frente: m[1].trim(), verso: "" }; out.push(cur); continue; }
      m = l.match(/^\s*(?:\*\*)?(?:verso|v|r|resposta)\s*:(?:\*\*)?\s*(.*)$/i);
      if (m && cur) { cur.verso = m[1].trim(); continue; }
      if (cur && cur.verso && l.trim()) cur.verso += " " + l.trim();
    }
    return out.filter((c) => c.frente && c.verso);
  }

  // Aceita a resposta da IA (com ou sem ```json) e devolve questões válidas.
  function lerQuestoes(txt) {
    let s = String(txt || "");
    const ini = s.indexOf("["), fim = s.lastIndexOf("]");
    if (ini < 0 || fim <= ini) return [];
    let arr;
    try { arr = JSON.parse(s.slice(ini, fim + 1)); } catch (e) { return []; }
    if (!Array.isArray(arr)) return [];
    return arr
      .map((q) => ({
        pergunta: String((q && (q.pergunta || q.p)) || "").trim(),
        alternativas: Array.isArray(q && (q.alternativas || q.alts)) ? (q.alternativas || q.alts).map((a) => String(a).trim()).slice(0, 6) : [],
        correta: Number.isInteger(q && q.correta) ? q.correta : parseInt(q && q.correta, 10),
        explicacao: String((q && (q.explicacao || q.exp)) || "").trim(),
      }))
      .filter((q) => q.pergunta && q.alternativas.length >= 2 && q.correta >= 0 && q.correta < q.alternativas.length);
  }

  return { SISTEMA, pedidoResumo, pedidoQuestoes, lerQuestoes, pedidoFlashcards, lerFlashcards };
});
