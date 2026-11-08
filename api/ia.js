// Gera resumo ou questões com a API do Claude. Exige login (admin) e a variável ANTHROPIC_API_KEY na Vercel.
const { verificar, lerCorpo, responder } = require("./_auth");
const PROMPTS_QGIS = require("./_prompts");
const PROMPTS_DIO = require("./_prompts_dio");

const MAX_TEXTO = 150000;

module.exports = async (req, res) => {
  if (req.method !== "POST") return responder(res, 405, { erro: "Use POST." });
  const chave = process.env.ANTHROPIC_API_KEY;
  if (!chave) return responder(res, 503, { erro: "Geração automática não configurada (falta ANTHROPIC_API_KEY na Vercel)." });
  try {
    await verificar(req);
    const b = await lerCorpo(req);
    // curso: "dio" usa os pedidos da trilha DIO; qualquer outro valor (ou nenhum) mantém os do caderno QGIS.
    const { pedidoResumo, pedidoQuestoes, lerQuestoes, SISTEMA } = b.curso === "dio" ? PROMPTS_DIO : PROMPTS_QGIS;
    const modo = b.modo === "questoes" ? "questoes" : "resumo";
    const texto = String(b.texto || "").slice(0, MAX_TEXTO);
    const imagens = Array.isArray(b.imagens) ? b.imagens.slice(0, 8) : [];
    if (texto.trim().length < 40 && !imagens.length) return responder(res, 400, { erro: "Material sem texto. Cole o conteúdo ou envie fotos legíveis." });
    const n = Math.min(20, Math.max(3, parseInt(b.n, 10) || 8));
    const meta = { titulo: String(b.titulo || "").slice(0, 200), disciplina: String(b.disciplina || "").slice(0, 200), n };
    const pedido = modo === "resumo" ? pedidoResumo(meta, texto, imagens.length) : pedidoQuestoes(meta, texto, imagens.length);

    const content = [];
    for (const img of imagens) {
      const m = /^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/.exec(String(img));
      if (m) content.push({ type: "image", source: { type: "base64", media_type: m[1], data: m[2] } });
    }
    content.push({ type: "text", text: pedido });

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": chave, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
        max_tokens: modo === "resumo" ? 4000 : 6000,
        system: SISTEMA,
        messages: [{ role: "user", content }],
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return responder(res, 502, { erro: "A IA recusou o pedido: " + (j.error && j.error.message ? j.error.message : "HTTP " + r.status) });
    const saida = (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n").trim();
    if (modo === "resumo") return responder(res, 200, { resumo: saida, cortado: (b.texto || "").length > MAX_TEXTO });
    const questoes = lerQuestoes(saida);
    if (!questoes.length) return responder(res, 502, { erro: "A IA não devolveu questões no formato esperado. Tente de novo." });
    return responder(res, 200, { questoes, cortado: (b.texto || "").length > MAX_TEXTO });
  } catch (e) {
    return responder(res, e.status || 500, { erro: e.message || "Erro inesperado." });
  }
};

module.exports.config = { maxDuration: 60 };
