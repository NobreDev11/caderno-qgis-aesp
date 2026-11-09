// Bloqueia endereços internos (proteção ao buscar links a pedido do usuário).
const dns = require("dns").promises;
const net = require("net");
function privado(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const s = ip.toLowerCase();
  return s === "::1" || s === "::" || s.startsWith("fc") || s.startsWith("fd") || s.startsWith("fe80") || s.startsWith("::ffff:");
}
async function urlPublica(txt) {
  let u; try { u = new URL(String(txt || "").trim()); } catch (e) { throw Object.assign(new Error("Link inválido."), { status: 400 }); }
  if (!/^https?:$/.test(u.protocol)) throw Object.assign(new Error("Só links http ou https."), { status: 400 });
  const ips = await dns.lookup(u.hostname, { all: true }).catch(() => []);
  if (!ips.length || ips.some((x) => privado(x.address))) throw Object.assign(new Error("Endereço não permitido."), { status: 400 });
  return u;
}
module.exports = { privado, urlPublica };
