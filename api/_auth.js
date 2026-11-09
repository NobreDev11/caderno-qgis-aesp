// Confere o login do Supabase (mesmo do Checklist) e exige is_admin().
const SUPA_URL = "https://ytionrwdwdmcxbdgqnkt.supabase.co";
const SUPA_KEY = "sb_publishable_MFrDp-4qr0yA2vyX1UJWOw_7RN7rdMX"; // chave publicável

async function verificar(req) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) throw Object.assign(new Error("Entre no caderno para usar esta função."), { status: 401 });
  const u = await fetch(SUPA_URL + "/auth/v1/user", { headers: { apikey: SUPA_KEY, Authorization: "Bearer " + token } });
  if (!u.ok) throw Object.assign(new Error("Sessão expirada. Saia e entre de novo."), { status: 401 });
  const user = await u.json();
  const a = await fetch(SUPA_URL + "/rest/v1/rpc/is_admin", {
    method: "POST",
    headers: { apikey: SUPA_KEY, Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: "{}",
  });
  const ok = a.ok ? await a.json() : false;
  if (ok !== true) throw Object.assign(new Error("Conta sem permissão."), { status: 403 });
  return user;
}

// Aceita o dono (login admin) ou um link pessoal de convidado válido (cabeçalho X-Convite).
async function verificarOuConvite(req) {
  const c = String(req.headers["x-convite"] || "");
  if (/^[A-Za-z0-9]{20,64}$/.test(c)) {
    const r = await fetch(SUPA_URL + "/rest/v1/rpc/caderno_conv_info", {
      method: "POST",
      headers: { apikey: SUPA_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ p_token: c }),
    });
    const nome = r.ok ? await r.json() : null;
    if (nome) return { convite: true };
    throw Object.assign(new Error("Link pessoal inválido ou desativado."), { status: 403 });
  }
  return verificar(req);
}

function lerCorpo(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  if (typeof req.body === "string") return Promise.resolve(JSON.parse(req.body || "{}"));
  return new Promise((ok, err) => {
    let d = "";
    req.on("data", (c) => { d += c; if (d.length > 4.4e6) { err(Object.assign(new Error("Envio grande demais."), { status: 413 })); req.destroy(); } });
    req.on("end", () => { try { ok(JSON.parse(d || "{}")); } catch (e) { err(Object.assign(new Error("JSON inválido."), { status: 400 })); } });
    req.on("error", err);
  });
}

function responder(res, status, obj) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(obj));
}

module.exports = { verificar, verificarOuConvite, lerCorpo, responder };
