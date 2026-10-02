// Accesibilidad con axe-core (reglas WCAG 2.2 A y AA y buenas prácticas) en TODAS las páginas de dist/,
// en móvil (390) y escritorio (1440), después de recorrer la página para que las entradas animadas
// estén en su estado final. Incluye el contraste de color de cada texto.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || `http://localhost:${process.env.PORT || 8081}`;
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const walk = (d) => fs.readdirSync(d).flatMap((f) => { const p = path.join(d, f); return fs.statSync(p).isDirectory() ? walk(p) : [p]; });
const rutas = walk('dist').filter((f) => f.endsWith('.html')).map((f) => { const r = '/' + f.slice(5).replace(/\.html$/, ''); return r === '/index' ? '/' : r; }).sort();
const SOLO = process.argv[2] ? process.argv[2].split(',') : null;

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
  const rows = [];
  let fails = 0;
  for (const [w, h, movil] of [[390, 844, true], [1440, 900, false]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: movil, hasTouch: movil, reducedMotion: 'reduce', bypassCSP: true });
    await ctx.addInitScript(() => { try { localStorage.setItem('vg_consent', JSON.stringify({ v: 3, date: new Date().toISOString(), necessary: true, analytics: false })); localStorage.setItem('vg_intro', '1'); } catch (e) { /* */ } });
    const p = await ctx.newPage();
    for (const r of rutas) {
      if (SOLO && !SOLO.includes(r)) continue;
      await p.goto(BASE + r, { waitUntil: 'networkidle' });
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((res) => setTimeout(res, 30)); } window.scrollTo({ top: 0, behavior: 'instant' }); });
      await p.waitForTimeout(400);
      await p.addScriptTag({ content: AXE });
      const res = await p.evaluate(async () => {
        // eslint-disable-next-line no-undef
        const out = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }, resultTypes: ['violations'] });
        return out.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, ej: v.nodes.slice(0, 2).map((x) => `${x.target.join(' ')} ${(x.any[0] && x.any[0].message) || ''}`.slice(0, 180)) }));
      });
      // Contraste propio: axe no resuelve el fondo cuando hay pseudoelementos decorativos o degradados.
      // Aquí se toma el primer color de fondo opaco de los antecesores (los degradados de las secciones
      // son veladuras casi transparentes sobre ese color); los textos sobre foto se revisan a ojo.
      const bajos = await p.evaluate(() => {
        const rgb = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r, g, b, a }; };
        const lum = ({ r, g, b }) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
        const mix = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
        const fondo = (el) => {
          const capas = [];
          for (let n = el; n; n = n.parentElement) {
            const cs = getComputedStyle(n);
            if (/url\(/.test(cs.backgroundImage) || n.tagName === 'PICTURE' || n.querySelector(':scope > picture, :scope > img, :scope > video')) {
              if (n !== el && n.matches('.hx, .hx *, .gal, .gal *')) return null;
            }
            const c = rgb(cs.backgroundColor);
            if (c && c.a > 0) { capas.push(c); if (c.a >= 0.99) break; }
          }
          let bg = { r: 255, g: 255, b: 255, a: 1 };
          for (const c of capas.reverse()) bg = mix(c, bg);
          return bg;
        };
        const out = [];
        const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const vistos = new Set();
        while (tw.nextNode()) {
          const t = tw.currentNode;
          if (!t.textContent.trim()) continue;
          const el = t.parentElement;
          if (vistos.has(el) || el.closest('.hd, [hidden], .sr-only, [inert], svg, .hp, .skip, [aria-hidden="true"], .mm, .dd, .cp, .ck, .sel__panel, .ft__word, del, s')) continue;
          vistos.add(el);
          if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
          const cs = getComputedStyle(el);
          const fg = rgb(cs.color);
          const bg = fondo(el);
          if (!fg || !bg) continue;
          let op = 1;
          for (let n = el; n; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity);
          const f = mix({ ...fg, a: fg.a * op }, bg);
          const L1 = lum(f); const L2 = lum(bg);
          const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
          const size = parseFloat(cs.fontSize); const bold = parseInt(cs.fontWeight, 10) >= 600;
          const min = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
          if (ratio < min - 0.05) out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} "${t.textContent.trim().slice(0, 30)}" ${ratio.toFixed(2)}`);
        }
        return [...new Set(out)].slice(0, 6);
      });
      if (bajos.length) res.push({ id: 'contraste-propio', impact: 'serious', n: bajos.length, ej: bajos });
      const ok = res.length === 0;
      if (!ok) fails++;
      rows.push(`${ok ? 'PASS' : 'FAIL'}  ${w} ${r}${ok ? '' : '  ' + res.map((v) => `${v.id} (${v.impact}, ${v.n}): ${v.ej.join(' | ')}`).join(' ;; ')}`);
    }
    await ctx.close();
  }
  await b.close();
  console.log(rows.filter((x) => x.startsWith('FAIL')).join('\n'));
  console.log(`\nqa-a11y: ${rows.length - fails}/${rows.length} páginas sin incidencias de axe (390 y 1440).`);
  process.exit(fails ? 1 : 0);
})();
