// Maquetación en los 12 anchos del brief (320 a 1920) y en todas las plantillas: capturas de página
// completa y comprobación por código de scroll horizontal, elementos fuera de pantalla, textos cortados
// o partidos, botones en dos líneas, áreas táctiles (44 px en pantallas táctiles), cabecera que tapa el
// titular y errores de consola.
// Uso: node tests/qa-layout.cjs <carpeta de capturas> [plantilla,plantilla]   (dentro de npm test)
const { chromium } = require('playwright');

const BASE = process.env.BASE || `http://localhost:${process.env.PORT || 8081}`;
const OUT = process.argv[2];
const SOLO = (process.argv[3] || '').split(',').filter(Boolean);
const SIZES = [[320, 640], [360, 780], [375, 667], [390, 844], [414, 896], [430, 932], [768, 1024], [820, 1180], [1024, 768], [1280, 800], [1440, 900], [1920, 1080]];
const PAGES = [
  ['/', 'inicio'],
  ['/ecografos', 'pilar-ecografos'],
  ['/diatermias', 'pilar-diatermias'],
  ['/ecografos/acclarix-ax8', 'ficha'],
  ['/equipos/camillas', 'categoria-sin-fichas'],
  ['/equipos/ondas-de-choque', 'categoria'],
  ['/equipos', 'equipos'],
  ['/catalogo', 'catalogo'],
  ['/sobre-nosotros', 'sobre-nosotros'],
  ['/contacto', 'contacto'],
  ['/guias', 'guias'],
  ['/guias/diatermia-capacitiva-y-resistiva', 'guia'],
  ['/privacidad', 'legal'],
  ['/no-existe', '404'],
];

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
  const rows = [];
  let fails = 0;
  for (const [url, name] of PAGES) {
    if (SOLO.length && !SOLO.includes(name)) continue;
    for (const [w, h] of SIZES) {
      const touch = w < 1024;
      const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: touch, hasTouch: touch });
      await ctx.addInitScript(() => { try { localStorage.setItem('vg_consent', JSON.stringify({ v: 2, date: new Date().toISOString(), necessary: true, marketing: false })); } catch (e) { /* */ } });
      const p = await ctx.newPage();
      const errs = [];
      p.on('pageerror', (e) => errs.push(e.message));
      p.on('console', (m) => { if (['error', 'warning'].includes(m.type()) && !/status of 404/.test(m.text())) errs.push(m.text()); });
      await p.goto(BASE + url, { waitUntil: 'networkidle' });
      const H = await p.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < H; y += Math.round(h * 0.7)) { await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y); await p.waitForTimeout(60); }
      await p.waitForTimeout(900);
      const res = await p.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const clipped = (el) => { for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) { const s = getComputedStyle(n); if (['auto', 'scroll', 'hidden', 'clip'].includes(s.overflowX)) return true; } return false; };
        const shown = (el) => el.checkVisibility({ visibilityProperty: true, opacityProperty: false }) && !el.closest('[hidden], .sr-only, .hp, .sprite, [inert], .mm, .dd, .cp, .ck');
        const name = (el) => `${el.tagName.toLowerCase()}.${String(el.className.baseVal ?? el.className).split(' ')[0]}`;
        const bad = [];
        document.querySelectorAll('body *').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (!r.width || getComputedStyle(el).position === 'fixed' || !shown(el) || el.closest('svg, .sel__panel')) return;
          if ((r.right > vw + 1 || r.left < -1) && !clipped(el)) bad.push(`${name(el)} [${Math.round(r.left)},${Math.round(r.right)}]`);
        });
        const cut = [];
        document.querySelectorAll('h1,h2,h3,p,a,button,li,dd,dt,label,th,td').forEach((el) => {
          if (!shown(el) || el.closest('.cf__chips, .legal__table-wrap, .prose table, .bc')) return;
          const cs = getComputedStyle(el);
          if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0 && cs.overflowX !== 'visible' && cs.textOverflow !== 'ellipsis' && !cs.webkitLineClamp?.match(/\d/)) cut.push(name(el));
        });
        const wide = [];
        document.querySelectorAll('h1, h2, h3, .btn, .pc__data dd, .hd__bar, .seg, .chip, .chan__v, .fp__data dd').forEach((el) => {
          if (!shown(el)) return;
          const box = el.getBoundingClientRect();
          const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          while (tw.nextNode()) {
            const range = document.createRange();
            range.selectNodeContents(tw.currentNode);
            for (const t of range.getClientRects()) {
              if (t.width && (t.right > box.right + 2 || t.left < box.left - 2)) { wide.push(name(el)); return; }
            }
          }
        });
        // Botones en una sola línea (sin partirse)
        document.querySelectorAll('.btn, .seg__btn, .chip, .sel__btn, .hd__logo').forEach((el) => {
          if (!shown(el)) return;
          const tops = new Set();
          const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          while (tw.nextNode()) {
            if (!tw.currentNode.textContent.trim()) continue;
            const range = document.createRange();
            range.selectNodeContents(tw.currentNode);
            for (const r of range.getClientRects()) if (r.width) tops.add(Math.round(r.top / 4));
          }
          if (tops.size > 1) wide.push(`${name(el)} (partido: "${el.textContent.trim().slice(0, 24)}")`);
        });
        // Control segmentado: el indicador tiene el mismo ancho que la opción activa
        document.querySelectorAll('.seg').forEach((seg) => {
          const ind = seg.querySelector('.seg__ind'); const act = seg.querySelector('[aria-selected="true"]');
          if (ind && act && shown(seg) && Math.abs(ind.getBoundingClientRect().width - act.getBoundingClientRect().width) > 3) wide.push(`seg (indicador ${Math.round(ind.getBoundingClientRect().width)} y opción ${Math.round(act.getBoundingClientRect().width)})`);
        });
        const small = [];
        if (matchMedia('(pointer: coarse)').matches) {
          document.querySelectorAll('a, button, input, select, [role="tab"]').forEach((el) => {
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height || !shown(el)) return;
            if (el.matches('.opt input, .check input, .switch input, .hp input, .skip, .gc__title a, .pc__name a')) return;
            if (el.tagName === 'A' && el.closest('p, li, dd, td, figcaption, .bc, .ft') && !el.matches('.btn') && getComputedStyle(el).display === 'inline') return;
            if (r.height < 43.5 && r.width < 43.5 || r.height < 36) small.push(`${name(el) || el.textContent.trim().slice(0, 18)} ${Math.round(r.width)}x${Math.round(r.height)}`);
          });
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
        const hd = document.querySelector('.hd');
        const h1 = document.querySelector('h1');
        const overlap = hd && h1 && hd.getBoundingClientRect().bottom > h1.getBoundingClientRect().top + 1;
        const h1Fold = h1 && h1.getBoundingClientRect().top < innerHeight;
        return { sw: document.documentElement.scrollWidth, vw, bad: bad.slice(0, 6), cut: [...new Set(cut)].slice(0, 6), wide: [...new Set(wide)].slice(0, 6), small: [...new Set(small)].slice(0, 8), overlap, h1Fold };
      });
      await p.waitForTimeout(300);
      await p.addStyleTag({ content: '.hd{position:absolute!important}.mbar{display:none!important}.read-progress{display:none!important}' });
      if (OUT) await p.screenshot({ path: `${OUT}/${name}-${w}.png`, fullPage: true });
      const pass = res.sw <= res.vw && !res.bad.length && !res.cut.length && !res.wide.length && !res.small.length && !res.overlap && res.h1Fold && !errs.length;
      if (!pass) fails++;
      rows.push(`${pass ? 'PASS' : 'FAIL'}  ${name} ${w}x${h}${res.sw > res.vw ? `  scroll horizontal ${res.sw}>${res.vw}` : ''}${res.bad.length ? `  desbordan: ${res.bad.join('; ')}` : ''}${res.cut.length ? `  cortados: ${res.cut.join('; ')}` : ''}${res.wide.length ? `  se salen: ${res.wide.join('; ')}` : ''}${res.small.length ? `  táctil<44: ${res.small.join('; ')}` : ''}${res.overlap ? '  la cabecera tapa el titular' : ''}${res.h1Fold ? '' : '  H1 fuera de la primera pantalla'}${errs.length ? `  consola: ${errs.join(' / ')}` : ''}`);
      await ctx.close();
    }
  }
  await b.close();
  console.log(rows.join('\n'));
  console.log(`\nqa-layout: ${rows.length - fails}/${rows.length} combinaciones de página y ancho correctas.`);
  process.exit(fails ? 1 : 0);
})();
