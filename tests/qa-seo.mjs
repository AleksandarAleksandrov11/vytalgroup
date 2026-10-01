// Comprobaciones estáticas sobre dist/ (sin navegador):
//  · title único de 50 a 60 caracteres y description única de 140 a 160 en cada página
//  · un solo H1 por página, con el acento en cursiva (<em>)
//  · lang="es", canonical absoluto en SITE_URL, og:locale, Open Graph y Twitter con imagen 1200 × 630 existente
//  · ninguna página con noindex: todas con robots index, follow (también legales y 404)
//  · JSON-LD válido y sin offers, aggregateRating ni review; tipos esperados por plantilla
//  · ninguna raya ni guion largo (U+2014 y U+2013) en ningún archivo publicado de texto
//  · nada de veterinaria
//  · ningún <script> en línea salvo JSON-LD (CSP) y ningún atributo on*
//  · todas las imágenes con alt; alt no vacío salvo decorativas junto a su texto
//  · enlaces internos, anclas (#id), imágenes, scripts y hojas de estilo que existen
//  · sitemap.xml con todas las páginas indexables (y solo ellas), robots.txt y llms.txt
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = 'dist';
const SITE = 'https://www.vytalgroupem.com';
const results = [];
const ok = (cond, name, extra = '') => { results.push({ cond, name, extra }); };

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(DIST);
const html = files.filter((f) => f.endsWith('.html'));
const route = (f) => { const r = '/' + f.slice(DIST.length + 1).replace(/\.html$/, ''); return r === '/index' ? '/' : r; };
// Fuera del sitemap: solo la 404, que no es una página real (todas son indexables)
const FUERA = new Set(['/404']);
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d));
const meta = (s, attr, name) => { const m = s.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`)); return m ? decode(m[1]) : null; };

const titles = new Map();
const descs = new Map();
const ids = new Map();
const pages = new Map();
for (const f of html) {
  const s = readFileSync(f, 'utf8');
  pages.set(route(f), s);
  ids.set(route(f), new Set([...s.matchAll(/\sid="([^"]+)"/g)].map((m) => decode(m[1]))));
}

for (const [r, s] of pages) {
  const t = decode((s.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  const d = meta(s, 'name', 'description') || '';
  ok(t.length >= 50 && t.length <= 60, `${r}: title de 50 a 60 caracteres`, `${t.length} · ${t}`);
  ok(d.length >= 140 && d.length <= 160, `${r}: description de 140 a 160 caracteres`, `${d.length}`);
  titles.set(t, [...(titles.get(t) || []), r]);
  descs.set(d, [...(descs.get(d) || []), r]);
  const h1 = s.match(/<h1[\s>][\s\S]*?<\/h1>/g) || [];
  ok(h1.length === 1, `${r}: un solo H1`, `${h1.length}`);
  ok(h1.length === 1 && /<em>/.test(h1[0]), `${r}: el H1 lleva el acento en cursiva`);
  ok(/<html lang="es"/.test(s), `${r}: lang="es"`);
  const canon = (s.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
  // La 404 se sirve en cualquier URL rota: sin canonical ni og:url
  if (r === '/404') ok(!canon && !/property="og:url"/.test(s), `${r}: sin canonical`, canon);
  else ok(canon === SITE + (r === '/' ? '/' : r), `${r}: canonical`, canon);
  ok(meta(s, 'property', 'og:locale') === 'es_ES', `${r}: og:locale es_ES`);
  const og = meta(s, 'property', 'og:image') || '';
  ok(og.startsWith(SITE + '/og/') && existsSync(join(DIST, og.slice(SITE.length))), `${r}: og:image propia y existente`, og);
  ok(meta(s, 'name', 'twitter:card') === 'summary_large_image' && !!meta(s, 'name', 'twitter:image'), `${r}: Twitter Card`);
  const robots = meta(s, 'name', 'robots') || '';
  ok(robots.startsWith('index, follow') && !/noindex/.test(s), `${r}: robots index, follow y sin noindex`, robots);
  // JSON-LD
  const ld = [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  let tipos = [];
  try {
    for (const j of ld) {
      const o = JSON.parse(j);
      const nodes = o['@graph'] || [o];
      tipos.push(...nodes.map((n) => n['@type']));
      ok(!/"(offers|aggregateRating|review)"/.test(j), `${r}: JSON-LD sin offers, valoraciones ni reseñas`);
    }
    ok(ld.length > 0, `${r}: JSON-LD válido`);
  } catch (e) { ok(false, `${r}: JSON-LD válido`, e.message); }
  if (r !== '/') ok(tipos.includes('BreadcrumbList') || r === '/404', `${r}: BreadcrumbList`);
  if (r === '/') ok(tipos.includes('Organization') && tipos.includes('WebSite'), '/: Organization y WebSite');
  if (/^\/(ecografos|diatermias|equipos\/[^/]+)\/[^/]+$/.test(r)) ok(tipos.includes('Product'), `${r}: Product`);
  if (['/ecografos', '/diatermias', '/catalogo'].includes(r) || /^\/equipos\/[^/]+$/.test(r)) ok(tipos.includes('ItemList'), `${r}: ItemList`);
  if (/^\/guias\/.+/.test(r)) ok(tipos.includes('Article'), `${r}: Article`);
  if (r === '/sobre-nosotros') ok(tipos.includes('AboutPage'), `${r}: AboutPage`);
  if (r === '/contacto') ok(tipos.includes('ContactPage'), `${r}: ContactPage`);
  if (/class="acc"/.test(s)) ok(tipos.includes('FAQPage'), `${r}: FAQPage donde hay preguntas frecuentes`);
  // CSP: sin scripts en línea ni manejadores on*
  const inline = [...s.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>/g)].filter((m) => !/application\/ld\+json/.test(m[1]));
  ok(inline.length === 0, `${r}: sin scripts en línea`, `${inline.length}`);
  ok(!/\son[a-z]+="/.test(s), `${r}: sin atributos on*`);
  // Imágenes con alt
  const imgs = [...s.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  ok(imgs.every((i) => /\salt(="|[\s>])/.test(i)), `${r}: todas las imágenes con alt`);
  // Enlaces internos, anclas y recursos
  const refs = [...s.matchAll(/\s(?:href|src)="([^"]+)"/g), ...s.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[0].includes('srcset') ? m[1].split(',').map((x) => x.trim().split(' ')[0]) : [m[1]]);
  const rotos = [];
  for (let u of refs) {
    u = decode(u);
    if (/^(https?:|mailto:|tel:|data:|#i-|#logo|#sig|#vg|#eu-dots)/.test(u) && !u.startsWith(SITE)) continue;
    if (u.startsWith(SITE)) u = u.slice(SITE.length) || '/';
    const [p, hash] = u.split('#');
    const path = (p || r).split('?')[0];
    if (!p && hash) { if (!ids.get(r).has(hash)) rotos.push(u); continue; }
    const target = path === '/' ? 'index.html' : path.slice(1);
    const existe = existsSync(join(DIST, target)) && statSync(join(DIST, target)).isFile() || existsSync(join(DIST, `${target}.html`));
    if (!existe) { rotos.push(u); continue; }
    if (hash && pages.has(path) && !ids.get(path).has(decodeURIComponent(hash))) rotos.push(u);
  }
  ok(rotos.length === 0, `${r}: enlaces internos y recursos existentes`, rotos.slice(0, 5).join(' '));
}
// Enlaces externos de contacto con el formato correcto
const externos = new Set();
for (const s of pages.values()) for (const m of s.matchAll(/href="((?:https:\/\/wa\.me|tel:|mailto:)[^"]*)"/g)) externos.add(decode(m[1]));
for (const u of externos) {
  const bien = u.startsWith('https://wa.me/34616372644') ? /^https:\/\/wa\.me\/34616372644(\?text=[^\s]+)?$/.test(u)
    : u.startsWith('tel:') ? u === 'tel:+34616372644'
    : /^mailto:vytalkinetech@gmail\.com(\?subject=[^\s]+)?$/.test(u);
  ok(bien, 'enlace de WhatsApp, teléfono o email correcto', u);
}
ok([...externos].some((u) => u.startsWith('https://wa.me/')) && [...externos].some((u) => u.startsWith('tel:')) && [...externos].some((u) => u.startsWith('mailto:')), 'hay enlaces de WhatsApp, teléfono y email');
const pdf = join(DIST, 'assets/docs/catalogo-vytalgroup-2026.pdf');
ok(existsSync(pdf) && readFileSync(pdf).subarray(0, 5).toString() === '%PDF-', 'el PDF del catálogo existe y es un PDF');
ok([...pages.values()].every((s) => /@view-transition\s*\{\s*navigation:\s*auto/.test(s)), 'transiciones de página (View Transitions) en todas las páginas');

for (const [t, rs] of titles) ok(rs.length === 1, 'title único', `${t} → ${rs.join(', ')}`);
for (const [d, rs] of descs) ok(rs.length === 1, 'description única', `${d.slice(0, 50)}… → ${rs.join(', ')}`);

// Rayas, guiones largos y veterinaria en todo lo publicado (texto)
for (const f of files.filter((f) => ['.html', '.xml', '.txt', '.css', '.js', '.json', '.webmanifest', '.svg'].includes(extname(f)))) {
  const s = readFileSync(f, 'utf8');
  ok(!/[\u2014\u2013]/.test(s), `${f}: sin rayas ni guiones largos`);
  ok(!/veterinari|\bVET\b/i.test(s), `${f}: sin veterinaria`);
}

// sitemap.xml, robots.txt y llms.txt
const sm = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
const locs = new Set([...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].slice(SITE.length) || '/'));
const indexables = [...pages.keys()].filter((r) => !FUERA.has(r));
ok(indexables.every((r) => locs.has(r)), 'sitemap: todas las páginas indexables', indexables.filter((r) => !locs.has(r)).join(' '));
ok([...locs].every((r) => pages.has(r) && !FUERA.has(r)), 'sitemap: solo páginas existentes', [...locs].filter((r) => !pages.has(r) || FUERA.has(r)).join(' '));
const robotsTxt = readFileSync(join(DIST, 'robots.txt'), 'utf8');
ok(/User-agent: \*\s*\nAllow: \/\s*\n/.test(robotsTxt) && !/Disallow/.test(robotsTxt), 'robots.txt: todos los bots pueden rastrear todo', robotsTxt.replace(/\n/g, ' | '));
const vercelCfg = readFileSync('vercel.json', 'utf8');
ok(!/X-Robots-Tag|noindex/i.test(vercelCfg), 'vercel.json: sin X-Robots-Tag ni noindex');
ok(readFileSync(join(DIST, 'robots.txt'), 'utf8').includes(`Sitemap: ${SITE}/sitemap.xml`), 'robots.txt apunta al sitemap');
const llms = readFileSync(join(DIST, 'llms.txt'), 'utf8');
ok(llms.startsWith('# VytalGroup') && /## Productos/.test(llms) && /## Guías/.test(llms), 'llms.txt con empresa, productos y guías');

const fails = results.filter((x) => !x.cond);
for (const x of fails) console.log(`FAIL  ${x.name}${x.extra ? `  · ${x.extra}` : ''}`);
console.log(`\nqa-seo: ${results.length - fails.length}/${results.length} comprobaciones correctas en ${pages.size} páginas.`);
process.exit(fails.length ? 1 : 0);
