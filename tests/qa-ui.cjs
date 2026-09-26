// QA de interfaz contra dist/: cabecera y menús, catálogo (filtros, búsqueda, orden, URL y sin JS),
// acordeones, control segmentado, galería, guías (índice y progreso), teclado, movimiento reducido,
// CSP sin violaciones, 404 real y cabeceras de caché.
const { chromium } = require('playwright');

const BASE = process.env.BASE || `http://localhost:${process.env.PORT || 8081}`;
const results = [];
const ok = (cond, name, extra = '') => results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? `  · ${extra}` : ''}`);
const CONSENT = () => { try { localStorage.setItem('vg_consent', JSON.stringify({ v: 2, date: new Date().toISOString(), necessary: true, marketing: false })); } catch (e) { /* */ } };

async function open(b, path, { width = 1280, height = 900, mobile = false, reduced = false, js = true } = {}) {
  const ctx = await b.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, reducedMotion: reduced ? 'reduce' : 'no-preference', javaScriptEnabled: js });
  await ctx.addInitScript(CONSENT);
  const p = await ctx.newPage();
  const logs = [];
  p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(m.text()); });
  p.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
  const res = await p.goto(BASE + path, { waitUntil: 'networkidle' });
  return { ctx, p, logs, res };
}
async function block(name, fn) {
  try { await fn(); } catch (err) { ok(false, `${name}: error en la prueba`, String(err.message).split('\n')[0]); }
}
const visibles = (p) => p.$$eval('[data-list] [data-item]', (els) => els.filter((e) => !e.hidden).map((e) => e.dataset.nombre));

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });

  await block('Cabecera en escritorio', async () => {
    const { ctx, p } = await open(b, '/ecografos');
    ok(await p.getAttribute('.hd__nav a[href="/ecografos"]', 'aria-current') === 'page', 'cabecera: marca la página activa');
    ok(!(await p.isVisible('.hd__menu')), 'cabecera: sin hamburguesa en escritorio');
    await p.click('[data-dropdown-btn]');
    await p.waitForTimeout(400);
    ok(await p.getAttribute('[data-dropdown-btn]', 'aria-expanded') === 'true' && await p.isVisible('#menu-equipos'), 'desplegable Equipos: se abre');
    ok((await p.$$('#menu-equipos .dd__cat')).length === 12, 'desplegable Equipos: 12 categorías con miniatura');
    await p.keyboard.press('Escape');
    await p.waitForTimeout(400);
    ok(await p.getAttribute('[data-dropdown-btn]', 'aria-expanded') === 'false', 'desplegable Equipos: Escape lo cierra');
    await p.focus('[data-dropdown-btn]');
    await p.keyboard.press('Enter');
    await p.waitForTimeout(400);
    ok(await p.getAttribute('[data-dropdown-btn]', 'aria-expanded') === 'true', 'desplegable Equipos: se abre con teclado');
    await ctx.close();
  });

  await block('Cabecera en móvil', async () => {
    const { ctx, p } = await open(b, '/', { width: 390, height: 844, mobile: true });
    await p.tap('[data-menu-btn]');
    await p.waitForTimeout(600);
    ok(await p.getAttribute('[data-menu-btn]', 'aria-expanded') === 'true' && await p.isVisible('#menu-movil'), 'menú móvil: se abre');
    ok(await p.evaluate(() => getComputedStyle(document.documentElement).overflow === 'hidden' || getComputedStyle(document.body).overflow === 'hidden' || document.documentElement.classList.contains('menu-open') || document.body.classList.contains('menu-open')), 'menú móvil: bloquea el scroll de fondo');
    await p.keyboard.press('Escape');
    await p.waitForTimeout(600);
    ok(await p.getAttribute('[data-menu-btn]', 'aria-expanded') === 'false', 'menú móvil: Escape lo cierra');
    await p.evaluate(() => window.scrollTo({ top: 1400, behavior: 'instant' }));
    await p.waitForTimeout(500);
    await p.evaluate(() => window.scrollTo({ top: 1800, behavior: 'instant' }));
    await p.waitForTimeout(500);
    ok(await p.evaluate(() => document.querySelector('.hd').classList.contains('is-hidden')), 'cabecera móvil: se oculta al bajar');
    await p.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }));
    await p.waitForTimeout(500);
    ok(await p.evaluate(() => !document.querySelector('.hd').classList.contains('is-hidden')), 'cabecera móvil: reaparece al subir');
    ok(await p.evaluate(() => !document.querySelector('[data-mbar]').inert), 'barra móvil: visible tras el hero');
    await ctx.close();
  });

  await block('Catálogo', async () => {
    const { ctx, p } = await open(b, '/catalogo');
    const total = (await visibles(p)).length;
    ok(total === 53, 'catálogo: 53 equipos', `${total}`);
    await p.click('.chip[data-cat="diatermia"]');
    await p.waitForTimeout(700);
    const dia = await visibles(p);
    ok(dia.length === 4 && p.url().includes('categoria=diatermia'), 'catálogo: chip Diatermia filtra y va a la URL', `${dia.join(', ')} · ${p.url()}`);
    ok(await p.getAttribute('.chip[data-cat="diatermia"]', 'aria-pressed') === 'true', 'catálogo: chip activo con aria-pressed');
    await p.click('.chip[data-cat=""]');
    await p.fill('[data-search]', 'acclarix lx');
    await p.waitForTimeout(500);
    const lx = await visibles(p);
    ok(lx.length === 4 && lx.every((n) => /LX/.test(n)), 'catálogo: búsqueda instantánea (varias palabras)', lx.join(', '));
    ok(/q=acclarix\+lx|q=acclarix%20lx/.test(p.url()), 'catálogo: la búsqueda va a la URL', p.url());
    await p.fill('[data-search]', 'zzzz');
    await p.waitForTimeout(500);
    ok(await p.isVisible('[data-empty]') && /Pregúntanos y te decimos si lo tenemos/.test(await p.textContent('[data-empty]')), 'catálogo: estado vacío cuidado con CTA');
    await p.fill('[data-search]', '');
    await p.waitForTimeout(400);
    await p.click('[data-sort] button');
    await p.waitForTimeout(300);
    await p.click('text=A a Z');
    await p.waitForTimeout(700);
    const az = await visibles(p);
    const sorted = [...az].sort((a, b2) => a.localeCompare(b2, 'es', { sensitivity: 'base' }));
    ok(JSON.stringify(az) === JSON.stringify(sorted) && p.url().includes('orden=az'), 'catálogo: orden A a Z (y en la URL)');
    ok(await p.$eval('link[rel="canonical"]', (l) => l.href) === 'https://vytalgroup.org/catalogo', 'catálogo: canonical sin parámetros');
    await ctx.close();
    const r = await open(b, '/catalogo?categoria=ecografia&q=acclarix');
    const eco = await visibles(r.p);
    ok(eco.length === 9 && await r.p.inputValue('[data-search]') === 'acclarix' && await r.p.getAttribute('.chip[data-cat="ecografia"]', 'aria-pressed') === 'true', 'catálogo: un enlace con filtros restaura el estado', `${eco.length}`);
    await r.ctx.close();
    const n = await open(b, '/catalogo', { js: false });
    ok((await n.p.$$('[data-list] [data-item]')).length === 53 && !(await n.p.isVisible('.cf')), 'catálogo sin JavaScript: todo visible y sin filtros');
    await n.ctx.close();
  });

  await block('Inicio: segmentado, acordeón y marquesina', async () => {
    const { ctx, p } = await open(b, '/');
    const tab = await p.$('[role="tab"][aria-selected="false"]');
    const id = await tab.getAttribute('aria-controls');
    await tab.click();
    await p.waitForTimeout(600);
    ok(await tab.getAttribute('aria-selected') === 'true' && await p.$eval(`#${id}`, (e) => !e.inert), 'segmentado: cambia de panel');
    await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(300);
    ok(await p.evaluate(() => document.activeElement.getAttribute('role') === 'tab' && document.activeElement.getAttribute('aria-selected') === 'true'), 'segmentado: flechas del teclado');
    const btn = await p.$('.acc__btn');
    await btn.click();
    await p.waitForTimeout(600);
    ok(await btn.getAttribute('aria-expanded') === 'true' && await p.isVisible(`#${await btn.getAttribute('aria-controls')}`), 'acordeón: se abre');
    await btn.click();
    await p.waitForTimeout(700);
    ok(await btn.getAttribute('aria-expanded') === 'false', 'acordeón: se cierra');
    await ctx.close();
  });

  await block('Ficha: galería', async () => {
    const { ctx, p } = await open(b, '/ecografos/acclarix-ax8');
    await p.click('[data-zoom-open]');
    await p.waitForTimeout(500);
    ok(await p.$eval('[data-zoom]', (d) => d.open), 'ficha: la imagen se amplía');
    await p.keyboard.press('Escape');
    await p.waitForTimeout(500);
    ok(await p.$eval('[data-zoom]', (d) => !d.open), 'ficha: Escape cierra la ampliación');
    ok(/p-acclarix-ax8/.test(await p.$eval('.gal img', (i) => i.style.viewTransitionName || getComputedStyle(i).viewTransitionName)), 'ficha: la imagen tiene view-transition-name propio');
    await ctx.close();
  });

  await block('Guía', async () => {
    const { ctx, p } = await open(b, '/guias/como-elegir-un-ecografo-para-fisioterapia');
    ok(await p.$eval('[data-toc] details', (d) => d.open), 'guía: índice abierto en escritorio');
    const n = (await p.$$('[data-toc] a')).length;
    ok(n >= 5, 'guía: índice con los apartados', `${n}`);
    const p0 = await p.$eval('[data-read-progress]', (e) => getComputedStyle(e).getPropertyValue('--p'));
    await p.evaluate(() => { const h = document.querySelectorAll('.prose h2')[3]; window.scrollTo({ top: h.getBoundingClientRect().top + scrollY - 100, behavior: 'instant' }); });
    await p.waitForTimeout(600);
    const p1 = await p.$eval('[data-read-progress]', (e) => getComputedStyle(e).getPropertyValue('--p'));
    ok(Number(p1) > Number(p0 || 0) && Number(p1) < 1, 'guía: la barra de progreso avanza', `${p0} → ${p1}`);
    ok(await p.$$eval('[data-toc] a[aria-current="true"]', (a) => a.length === 1), 'guía: el índice marca el apartado actual');
    ok(await p.$eval('.prose', (e) => { const cs = getComputedStyle(e); const ch = parseFloat(cs.fontSize) * 0.5; return e.clientWidth / ch; }) < 80, 'guía: medida de línea cómoda');
    await ctx.close();
    const m = await open(b, '/guias/como-elegir-un-ecografo-para-fisioterapia', { width: 390, height: 844, mobile: true });
    ok(await m.p.$eval('[data-toc] details', (d) => !d.open), 'guía: índice plegado en móvil');
    await m.ctx.close();
  });

  await block('Teclado y accesibilidad básica', async () => {
    const { ctx, p } = await open(b, '/');
    await p.keyboard.press('Tab');
    ok(await p.evaluate(() => document.activeElement.classList.contains('skip') && getComputedStyle(document.activeElement).opacity !== '0'), 'teclado: el primer Tab muestra "Saltar al contenido"');
    await p.keyboard.press('Enter');
    await p.waitForTimeout(300);
    ok(await p.evaluate(() => document.activeElement.id === 'main'), 'teclado: el salto lleva al contenido');
    await p.keyboard.press('Tab');
    const outline = await p.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle !== 'none' || s.boxShadow !== 'none'; });
    ok(outline, 'teclado: foco visible');
    await ctx.close();
  });

  await block('Movimiento reducido', async () => {
    const { ctx, p } = await open(b, '/', { reduced: true });
    const hidden = await p.$$eval('[data-rv], .rv', (els) => els.filter((e) => e.checkVisibility() && parseFloat(getComputedStyle(e).opacity) < 0.99).length);
    ok(hidden === 0, 'movimiento reducido: todo el contenido visible sin animaciones de entrada', `${hidden}`);
    const marquee = await p.$eval('.ticker__track', (e) => getComputedStyle(e).animationName);
    ok(marquee === 'none', 'movimiento reducido: la cinta no se mueve', marquee);
    ok(await p.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior !== 'smooth'), 'movimiento reducido: sin scroll suave');
    await ctx.close();
  });

  await block('CSP, 404 y caché', async () => {
    const csp = [];
    for (const path of ['/', '/ecografos', '/ecografos/eco-wireless', '/catalogo', '/contacto', '/guias/diatermia-capacitiva-y-resistiva', '/sobre-nosotros', '/privacidad']) {
      const { ctx, logs } = await open(b, path);
      csp.push(...logs.filter((l) => /Content Security Policy|Refused to/.test(l)).map((l) => `${path}: ${l}`));
      await ctx.close();
    }
    ok(csp.length === 0, 'CSP: ninguna violación en las plantillas', csp.slice(0, 3).join(' | '));
    const { ctx, p, res } = await open(b, '/esta-pagina-no-existe');
    ok(res.status() === 404 && /no hay/.test(await p.textContent('h1')), '404: estado 404 real y página propia');
    ok(await p.$eval('meta[name="robots"]', (m) => m.content) === 'noindex, follow', '404: noindex');
    await ctx.close();
    const get = (u) => fetch(BASE + u, { redirect: 'manual' });
    const html = await get('/ecografos');
    ok(/max-age=0/.test(html.headers.get('cache-control') || ''), 'caché: HTML sin caché larga');
    const css = (await (await get('/')).text()).match(/src="(\/_astro\/[^"]+\.js)"/);
    const js = css ? await get(css[1]) : null;
    ok(js && /immutable/.test(js.headers.get('cache-control') || ''), 'caché: JS con hash inmutable');
    const pdf = await get('/assets/docs/catalogo-vytalgroup-2026.pdf');
    ok(pdf.status === 200 && /attachment/.test(pdf.headers.get('content-disposition') || ''), 'caché: el PDF se descarga');
    const red = await get('/ecografos.html');
    ok([301, 308].includes(red.status) && red.headers.get('location') === '/ecografos', 'URLs limpias: .html redirige');
    ok(/Content-Security-Policy/i.test([...html.headers.keys()].join(' ')), 'cabeceras: CSP presente');
  });

  await b.close();
  console.log(results.join('\n'));
  const f = results.filter((r) => r.startsWith('FAIL')).length;
  console.log(`\nqa-ui: ${results.length - f}/${results.length} comprobaciones correctas.`);
  process.exit(f ? 1 : 0);
})();
