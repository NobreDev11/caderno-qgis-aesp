// Pedidos para a IA dos cadernos criados no app (cadernos livres). Mesmo formato de prompts.js,
// mas o curso e a área vêm da configuração do caderno (nome, descrição e foco).
// Navegador: window.PROMPTS_LIVRE.criar({curso, area}). Servidor (api/ia.js): require("./_prompts_livre").criar(...).
(function (raiz, fab) {
  if (typeof module === "object" && module.exports) module.exports = fab();
  else raiz.PROMPTS_LIVRE = fab();
})(typeof self !== "undefined" ? self : this, function () {
  const limpa = (s, n) => String(s || "").replace(/[\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, n);

  function criar(o) {
    o = o || {};
    const CURSO = limpa(o.curso, 700) || "Curso de estudo pessoal.";
    const AREA = limpa(o.area, 160);
    const SISTEMA =
      "Você é um tutor" + (AREA ? " de " + AREA : "") + ", paciente e preciso. " +
      "Responda sempre em português do Brasil, com precisão técnica, sem inventar conteúdo que não esteja no material. " +
      "Quando o material citar ferramentas, comandos ou menus, use os nomes como aparecem nelas.";

    function cab(meta) {
      return CURSO + "\n" + (meta.disciplina ? "Seção: " + meta.disciplina + "\n" : "") + (meta.titulo ? "Material: " + meta.titulo + "\n" : "");
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
        "## Passo a passo (só se o material tiver procedimentos, comandos ou código; numerado)\n" +
        "## Aplicação prática (exemplos concretos ligados ao material e ao objetivo do curso)\n" +
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
        "inclua questões práticas quando o material permitir, e varie a posição da alternativa correta.\n" +
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
        "em até 2 frases, sem repetir a pergunta; cubra definições, procedimentos, siglas e aplicações; " +
        "não invente nada que não esteja no material.\n" +
        "Responda SOMENTE com um JSON válido, sem texto antes ou depois, neste formato:\n" +
        '[{"frente":"...","verso":"..."}]' +
        corpo(texto, nImg)
      );
    }
    function pedidoExplica(termo, disciplina, contexto) {
      return (
        "Explique de forma curta e didática, em português do Brasil, o termo abaixo, no contexto deste curso: " + CURSO +
        (disciplina ? " Seção: \"" + limpa(disciplina, 200) + "\"." : "") +
        "\nResponda em 3 a 6 frases: o que é, para que serve e um exemplo prático. Sem título, sem listas longas." +
        (contexto ? "\n\nTrecho das anotações onde o termo aparece:\n" + limpa(contexto, 1200) : "") +
        "\n\nTermo: " + limpa(termo, 200)
      );
    }
    return { CURSO, SISTEMA, pedidoResumo, pedidoQuestoes, pedidoFlashcards, pedidoExplica, lerQuestoes, lerFlashcards };
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
    const s = String(txt || "");
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
  return { criar, lerQuestoes, lerFlashcards };
});
