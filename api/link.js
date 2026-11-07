// Busca o conteúdo de um link (página, PDF, Google Docs/Drive) para o caderno extrair o texto.
// Exige login (admin). Só http/https públicos; até 15 MB; 15 s.
const { verificar, lerCorpo, responder } = require("./_auth");
const dns = require("dns").promises;
const net = require("net");

const MAX = 15 * 1024 * 1024;

function privado(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const s = ip.toLowerCase();
  return s === "::1" || s === "::" || s.startsWith("fc") || s.startsWith("fd") || s.startsWith("fe80") || s.startsWith("::ffff:");
}

function ajustar(u) {
  // Google Drive (arquivo), Docs, Slides, Sheets → versão para download/texto
  let m = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/) || u.match(/drive\.google\.com\/open\?id=([\w-]+)/);
  if (m) return "https://drive.google.com/uc?export=download&id=" + m[1];
  m = u.match(/docs\.google\.com\/document\/d\/([\w-]+)/);
  if (m) return "https://docs.google.com/document/d/" + m[1] + "/export?format=txt";
  m = u.match(/docs\.google\.com\/presentation\/d\/([\w-]+)/);
  if (m) return "https://docs.google.com/presentation/d/" + m[1] + "/export/pdf";
  m = u.match(/docs\.google\.com\/spreadsheets\/d\/([\w-]+)/);
  if (m) return "https://docs.google.com/spreadsheets/d/" + m[1] + "/export?format=csv";
  return u;
}

function entidades(s) {
  const mapa = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ordm: "º", ordf: "ª", ccedil: "ç", atilde: "ã", otilde: "õ", aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", acirc: "â", ecirc: "ê", ocirc: "ô", agrave: "à" };
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (t, n) => (mapa[n.toLowerCase()] !== undefined ? mapa[n.toLowerCase()] : t));
}

function htmlParaTexto(html) {
  const tit = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "";
  let s = html
    .replace(/<(head|script|style|noscript|svg|nav|footer|header|form|iframe)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const art = s.match(/<(article|main)[\s\S]*?<\/\1>/i);
  if (art && art[0].length > 800) s = art[0];
  s = s
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/section)[^>]*>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<h([1-6])[^>]*>/gi, (_, n) => "\n" + "#".repeat(Math.min(3, +n)) + " ")
    .replace(/<[^>]+>/g, " ");
  s = entidades(s).replace(/[ \t\f\v]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return { titulo: entidades(tit).replace(/\s+/g, " ").trim(), texto: s.slice(0, 200000) };
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return responder(res, 405, { erro: "Use POST." });
  try {
    await verificar(req);
    const b = await lerCorpo(req);
    let url;
    try { url = new URL(String(b.url || "").trim()); } catch (e) { return responder(res, 400, { erro: "Link inválido." }); }
    if (!/^https?:$/.test(url.protocol)) return responder(res, 400, { erro: "Só links http ou https." });
    if (/(^|\.)(youtube\.com|youtu\.be)$/i.test(url.hostname)) return responder(res, 200, { tipo: "video", titulo: "", texto: "" });
    const alvo = new URL(ajustar(url.href));
    const ips = await dns.lookup(alvo.hostname, { all: true }).catch(() => []);
    if (!ips.length || ips.some((x) => privado(x.address))) return responder(res, 400, { erro: "Endereço não permitido." });

    const ctl = new AbortController();
    const tm = setTimeout(() => ctl.abort(), 15000);
    const r = await fetch(alvo.href, { redirect: "follow", signal: ctl.signal, headers: { "User-Agent": "Mozilla/5.0 (CadernoQGIS)", Accept: "text/html,application/pdf,text/plain,*/*" } });
    if (!r.ok) { clearTimeout(tm); return responder(res, 502, { erro: "O site respondeu " + r.status + ". Se for Google Drive, deixe o arquivo como \"Qualquer pessoa com o link\"." }); }
    const tipo = (r.headers.get("content-type") || "").toLowerCase();
    const partes = []; let tam = 0;
    for await (const c of r.body) { tam += c.length; if (tam > MAX) { ctl.abort(); clearTimeout(tm); return responder(res, 413, { erro: "Arquivo maior que 15 MB. Baixe e envie como arquivo." }); } partes.push(c); }
    clearTimeout(tm);
    const buf = Buffer.concat(partes);
    const ehPdf = tipo.includes("pdf") || buf.slice(0, 5).toString() === "%PDF-";
    if (ehPdf) {
      if (buf.length > 3.2 * 1024 * 1024) return responder(res, 413, { erro: "PDF maior que 3 MB por link. Baixe e envie como arquivo (aceita até 25 MB)." });
      return responder(res, 200, { tipo: "pdf", base64: buf.toString("base64") });
    }
    const txt = buf.toString("utf8");
    if (tipo.includes("html") || /<html|<body/i.test(txt.slice(0, 2000))) {
      if (/accounts\.google\.com|ServiceLogin/.test(txt.slice(0, 5000))) return responder(res, 403, { erro: "O arquivo do Google é privado. Compartilhe como \"Qualquer pessoa com o link\"." });
      const h = htmlParaTexto(txt);
      return responder(res, 200, { tipo: "html", titulo: h.titulo, texto: h.texto });
    }
    return responder(res, 200, { tipo: "texto", titulo: "", texto: txt.slice(0, 200000) });
  } catch (e) {
    const msg = e.name === "AbortError" ? "O site demorou demais para responder." : e.message || "Erro inesperado.";
    return responder(res, e.status || 500, { erro: msg });
  }
};

module.exports.config = { maxDuration: 30 };
