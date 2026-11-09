/* Cadernos de Estudo: funciona sem internet.
   - Páginas (/, /qgis, /dio): tenta a rede (até 4 s) e, sem conexão, usa a cópia guardada.
   - Scripts do app (prompts, timer, fluxo, formato): rede primeiro (3 s), cópia se não houver conexão.
   - vendor/, ícones: usa a cópia e atualiza em segundo plano.
   - Fontes do Google: cópia guardada.
   - /api e Supabase: nunca guardados (sempre rede). As anotações em si ficam no localStorage e sobem ao voltar a internet. */
const VERSAO = "cadernos-v2";
const PAGINAS = ["/", "/qgis", "/dio"];
const ARQUIVOS = [
  "/prompts.js", "/prompts-dio.js", "/timer.js", "/fluxo.js", "/formato.js",
  "/vendor/supabase.js", "/vendor/pdf.min.mjs", "/vendor/pdf.worker.min.mjs", "/vendor/mermaid.min.js",
  "/manifest.webmanifest", "/icons/icon.svg", "/icons/favicon-32.png", "/icons/apple-touch-icon.png",
  "/icons/icon-192.png", "/icons/icon-512.png", "/icons/icon-maskable-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSAO);
    await Promise.all([...PAGINAS, ...ARQUIVOS].map((u) => c.add(new Request(u, { cache: "reload" })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSAO) await caches.delete(k);
    await self.clients.claim();
  })());
});

function chavePagina(url) {
  let p = url.pathname.replace(/\.html$/, "").replace(/\/+$/, "") || "/";
  if (p === "/index") p = "/";
  return p;
}

async function pagina(req) {
  const c = await caches.open(VERSAO);
  const chave = chavePagina(new URL(req.url));
  try {
    const rede = await Promise.race([
      fetch(req),
      new Promise((_, rej) => setTimeout(() => rej(new Error("lento")), 4000)),
    ]);
    if (rede.ok && !rede.redirected && PAGINAS.includes(chave)) c.put(chave, rede.clone());
    return rede;
  } catch (e) {
    return (await c.match(chave)) || (await c.match("/")) || new Response("Sem internet e sem cópia guardada. Abra o site uma vez com internet.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}

// Scripts do próprio app (não os de vendor/): rede primeiro (3 s), para atualizações chegarem na hora.
async function script(req) {
  const c = await caches.open(VERSAO);
  try {
    const r = await Promise.race([fetch(req), new Promise((_, rej) => setTimeout(() => rej(new Error("lento")), 3000))]);
    if (r.ok) c.put(req, r.clone());
    return r;
  } catch (e) {
    return (await c.match(req, { ignoreSearch: true })) || new Response("", { status: 504 });
  }
}

async function arquivo(req) {
  const c = await caches.open(VERSAO);
  const guardado = await c.match(req, { ignoreSearch: true });
  const rede = fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => null);
  return guardado || (await rede) || new Response("", { status: 504 });
}

async function fonte(req) {
  const c = await caches.open(VERSAO);
  const g = await c.match(req);
  if (g) return g;
  try { const r = await fetch(req); if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }
  catch (e) { return new Response("", { status: 504 }); }
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (url.pathname.startsWith("/api/") || url.pathname === "/sw.js") return;
    if (req.mode === "navigate") return e.respondWith(pagina(req));
    if (/\.m?js$/.test(url.pathname) && !url.pathname.startsWith("/vendor/")) return e.respondWith(script(req));
    return e.respondWith(arquivo(req));
  }
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") return e.respondWith(fonte(req));
});
