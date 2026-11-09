// Diz se um site deixa ser aberto dentro do mininavegador (iframe) e pega o título da página.
// Exige login do dono ou link pessoal de convidado.
const { verificarOuConvite, lerCorpo, responder } = require("./_auth");
const { urlPublica } = require("./_rede");

module.exports = async (req, res) => {
  if (req.method !== "POST") return responder(res, 405, { erro: "Use POST." });
  try {
    await verificarOuConvite(req);
    const b = await lerCorpo(req);
    const u = await urlPublica(b.url);
    const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 8000);
    const r = await fetch(u.href, { redirect: "follow", signal: ctl.signal, headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", Accept: "text/html,*/*" } });
    const xfo = (r.headers.get("x-frame-options") || "").toLowerCase();
    const csp = (r.headers.get("content-security-policy") || "").toLowerCase();
    let titulo = "";
    if ((r.headers.get("content-type") || "").includes("html")) {
      let txt = ""; for await (const c of r.body) { txt += Buffer.from(c).toString("utf8"); if (txt.length > 150000 || /<\/title>/i.test(txt)) break; }
      const t = txt.match(/<title[^>]*>([\s\S]*?)<\/title>/i); if (t) titulo = t[1].replace(/\s+/g, " ").trim().slice(0, 200);
    }
    try { ctl.abort(); } catch (e) {}
    clearTimeout(tm);
    const fa = (csp.match(/frame-ancestors([^;]*)/) || [])[1];
    const bloqueia = /deny|sameorigin/.test(xfo) || (fa !== undefined && !/\*/.test(fa));
    return responder(res, 200, { ok: !bloqueia, titulo, final: r.url || u.href });
  } catch (e) {
    return responder(res, e.status || 500, { erro: e.name === "AbortError" ? "O site demorou demais para responder." : e.message || "Erro inesperado." });
  }
};
