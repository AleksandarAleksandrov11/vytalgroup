// QA del formulario, el consentimiento y los eventos del píxel contra dist/ y el Apps Script simulado
// (puerto 8090). El script de Meta se sustituye por un doble que registra las llamadas a fbq (no sale
// a internet). El endpoint y el ID del píxel se inyectan reescribiendo <html data-sheets data-pixel>.
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = process.env.BASE || `http://localhost:${process.env.PORT || 8081}`;
const MOCK = 'http://localhost:8090';
const LOG = process.argv[2];
const results = [];
const ok = (cond, name, extra = '') => results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? `  · ${extra}` : ''}`);
const readLog = () => (fs.existsSync(LOG) ? fs.readFileSync(LOG, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);
const posts = () => readLog().filter((r) => r.method === 'POST');
const PIXEL_STUB = `(function(){var c=window.__fb=window.__fb||[];var f=window.fbq;function cm(){c.push(Array.prototype.slice.call(arguments).map(function(x){return JSON.parse(JSON.stringify(x))}))}f.callMethod=cm;(f.queue||[]).forEach(function(a){cm.apply(null,a)});f.queue=[];document.cookie='_fbp=fb.1.1700000000000.987654321; path=/';})();`;

async function open(b, path, { width = 1280, height = 900, mobile = false, endpoint = `${MOCK}/exec`, pixel = '1234567890', consent = null, rapido = false } = {}) {
  const ctx = await b.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, acceptDownloads: true });
  await ctx.addInitScript(({ consent, rapido }) => {
    try { if (consent !== null) localStorage.setItem('vg_consent', JSON.stringify({ v: 2, date: new Date().toISOString(), necessary: true, marketing: consent })); } catch (e) { /* */ }
    // Simula un bot que envía en menos de 3 s
    if (rapido) { const real = performance.now.bind(performance); performance.now = () => Math.min(real(), 1000); }
  }, { consent, rapido });
  await ctx.route((u) => u.origin === new URL(BASE).origin && !/\.[a-z0-9]+$/i.test(u.pathname.replace(/\/$/, '')) , async (r) => {
    if (r.request().resourceType() !== 'document') return r.continue();
    const res = await r.fetch();
    let body = await res.text();
    body = body.replace('data-sheets data-pixel', `data-sheets="${endpoint}" data-pixel="${pixel}"`);
    r.fulfill({ response: res, body });
  });
  const fbReq = [];
  await ctx.route(/facebook\.(net|com)/, (r) => { fbReq.push(r.request().url()); r.fulfill({ contentType: 'text/javascript', body: PIXEL_STUB }); });
  await ctx.route(/wa\.me/, (r) => r.fulfill({ contentType: 'text/html', body: '<p>wa</p>' }));
  const p = await ctx.newPage();
  const logs = [];
  p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(`${m.type()}: ${m.text()}`); });
  p.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
  await p.goto(BASE + path, { waitUntil: 'networkidle' });
  return { ctx, p, fbReq, logs };
}
const fb = (p) => p.evaluate(() => window.__fb || []);
const step = (p) => p.evaluate(() => document.querySelector('#qf .qf__step.is-active')?.dataset.step || null);
const toForm = async (p) => { await p.evaluate(() => document.querySelector('#qf').scrollIntoView({ block: 'center', behavior: 'instant' })); await p.waitForTimeout(600); };

async function fillToEnd(p, { name = 'Laura Gómez', tel = '612345678', perfil = 'Fisioterapeuta', equipo = 'Ecógrafo' } = {}) {
  if ((await step(p)) === '1') { await p.click(`.qf__step.is-active label.opt:has(input[value="${equipo}"])`); await p.waitForTimeout(700); }
  if ((await step(p)) === '2') { await p.click(`.qf__step.is-active label.opt:has(input[value="${perfil}"])`); await p.waitForTimeout(700); }
  if ((await step(p)) === '3') { await p.fill('#f-name', name); await p.press('#f-name', 'Enter'); await p.waitForTimeout(500); }
  await p.fill('#f-tel', tel);
  await p.check('input[name="consent"]');
}
async function block(name, fn) {
  try { await fn(); } catch (err) { ok(false, `${name}: error en la prueba`, String(err.message).split('\n')[0]); }
}

(async () => {
  // Chromium bloquea por defecto las peticiones de una página local a otro puerto local (Local Network
  // Access); el Apps Script simulado vive en otro puerto, así que se desactiva esa comprobación.
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--disable-features=LocalNetworkAccessChecks,PrivateNetworkAccessRespectPreflightResults,BlockInsecurePrivateNetworkRequests'] });

  await block('Contacto con UTM, envío correcto y Lead', async () => {
    const { ctx, p, logs } = await open(b, '/contacto?utm_source=facebook&utm_campaign=web-test&fbclid=abc123', { consent: true });
    const antes = posts().length;
    await toForm(p);
    ok((await step(p)) === '1', 'contacto: el formulario empieza en la pregunta 1');
    await p.waitForTimeout(3100);
    await fillToEnd(p);
    await p.click('[data-submit]');
    await p.waitForSelector('[data-done]:not([hidden])', { timeout: 8000 });
    const title = await p.textContent('[data-done-title]');
    ok(title.trim() === 'Gracias, Laura. Te escribimos muy pronto.', 'contacto: mensaje de éxito con el nombre', title);
    const nuevos = posts().slice(antes);
    ok(nuevos.length === 1, 'contacto: un único envío al Apps Script', `${nuevos.length}`);
    const post = nuevos[0] || {};
    ok(/^text\/plain/.test(post.ct || ''), 'contacto: Content-Type text/plain (sin preflight)', post.ct);
    const d = JSON.parse(post.body || '{}');
    ok(d.origen === 'web', 'payload: origen "web"', d.origen);
    ok(d.pagina === `${BASE}/contacto?utm_source=facebook&utm_campaign=web-test&fbclid=abc123`, 'payload: página exacta', d.pagina);
    ok(d.equipo === 'Ecógrafo' && d.perfil === 'Fisioterapeuta' && d.nombre === 'Laura Gómez', 'payload: equipo, perfil y nombre');
    ok(/612\s?345\s?678/.test(d.telefono) && d.telefono.startsWith('+34'), 'payload: teléfono con prefijo +34', d.telefono);
    ok(!!d.consentimiento && !!d.event_id, 'payload: consentimiento y event_id');
    ok(d.utm_source === 'facebook' && d.utm_campaign === 'web-test' && d.fbclid === 'abc123', 'payload: UTM y fbclid');
    ok(/^fb\.1\.\d+\.abc123$/.test(d.fbc || ''), 'payload: fbc construido desde fbclid', d.fbc);
    const ev = await fb(p);
    const leads = ev.filter((e) => e[0] === 'track' && e[1] === 'Lead');
    ok(leads.length === 1, 'píxel: Lead una sola vez', `${leads.length}`);
    ok(leads[0] && leads[0][3] && leads[0][3].eventID === d.event_id, 'píxel: eventID del Lead = event_id de la hoja');
    ok(leads[0] && leads[0][2] && leads[0][2].content_name === 'Ecógrafo', 'píxel: content_name con el equipo', JSON.stringify(leads[0] && leads[0][2]));
    // Doble clic o reenvío: no hay segundo envío
    ok(await p.isHidden('[data-submit]') || await p.isDisabled('[data-submit]'), 'contacto: no se puede reenviar tras el éxito');
    ok(!logs.some((l) => /pageerror|error:/.test(l)), 'contacto: sin errores en consola', logs.join(' | '));
    await ctx.close();
  });

  await block('Ficha con preselección', async () => {
    const { ctx, p } = await open(b, '/ecografos/acclarix-ax8', { consent: true });
    const antes = posts().length;
    await toForm(p);
    ok((await step(p)) === '2', 'ficha: la pregunta 1 llega respondida (empieza en la 2)');
    const picked = (await p.textContent('[data-picked-box]')).replace(/\s+/g, ' ').trim();
    ok(/Te interesa: Acclarix AX8/.test(picked) && /Cambiar/.test(picked), 'ficha: "Te interesa: Acclarix AX8 · Cambiar"', picked);
    const ev = await fb(p);
    const vc = ev.find((e) => e[0] === 'track' && e[1] === 'ViewContent');
    ok(vc && JSON.stringify(vc[2].content_ids) === '["acclarix-ax8"]' && vc[2].content_type === 'product', 'píxel: ViewContent de la ficha con su slug', JSON.stringify(vc && vc[2]));
    await p.waitForTimeout(3100);
    await fillToEnd(p, { name: 'Pedro', perfil: 'Clínica' });
    await p.click('[data-submit]');
    await p.waitForSelector('[data-done]:not([hidden])', { timeout: 8000 });
    const d = JSON.parse((posts().slice(antes)[0] || {}).body || '{}');
    ok(d.modelo === 'Acclarix AX8 (EDAN)' && d.equipo === 'Ecógrafo', 'ficha: payload con modelo y equipo', `${d.modelo} · ${d.equipo}`);
    ok(d.pagina === `${BASE}/ecografos/acclarix-ax8`, 'ficha: payload con la página', d.pagina);
    const lead = (await fb(p)).find((e) => e[1] === 'Lead');
    ok(lead && lead[2].content_name === 'Acclarix AX8', 'ficha: Lead con el modelo', JSON.stringify(lead && lead[2]));
    await ctx.close();
  });

  await block('Tarjeta sin ficha preselecciona el formulario', async () => {
    const { ctx, p } = await open(b, '/equipos/camillas', { consent: false });
    await p.click('.pc__cta[data-want]');
    await p.waitForTimeout(900);
    ok((await step(p)) === '2', 'sin ficha: el CTA salta al formulario con el equipo respondido');
    const picked = (await p.textContent('[data-picked-box]')).replace(/\s+/g, ' ').trim();
    ok(/Te interesa: Camilla/.test(picked), 'sin ficha: muestra el producto', picked);
    await ctx.close();
  });

  await block('Sin endpoint', async () => {
    const { ctx, p, logs } = await open(b, '/contacto', { endpoint: '', consent: false });
    const antes = posts().length;
    await toForm(p);
    await p.waitForTimeout(3100);
    await fillToEnd(p, { name: 'Ana' });
    await p.click('[data-submit]');
    await p.waitForSelector('[data-fail]:not([hidden])', { timeout: 8000 });
    ok(true, 'sin endpoint: muestra el error amable con reintento y WhatsApp');
    ok(logs.some((l) => /Falta SHEETS_ENDPOINT/.test(l)), 'sin endpoint: avisa en consola');
    ok(posts().length === antes, 'sin endpoint: no envía nada');
    await p.click('[data-retry]');
    await p.waitForTimeout(600);
    ok((await p.inputValue('#f-tel')).replace(/\D/g, '') === '612345678' && (await p.isChecked('input[name="consent"]')), 'sin endpoint: al reintentar, los datos siguen ahí');
    await ctx.close();
  });

  await block('Error del servidor', async () => {
    const { ctx, p } = await open(b, '/contacto', { endpoint: `${MOCK}/exec?mode=fail`, consent: true });
    await toForm(p);
    await p.waitForTimeout(3100);
    await fillToEnd(p);
    await p.click('[data-submit]');
    await p.waitForSelector('[data-fail]:not([hidden])', { timeout: 8000 });
    ok(true, 'error del servidor: muestra el error amable');
    ok(!(await fb(p)).some((e) => e[1] === 'Lead'), 'error del servidor: no se envía Lead');
    await ctx.close();
  });

  await block('Antispam', async () => {
    const { ctx, p } = await open(b, '/contacto', { consent: false, rapido: true });
    let antes = posts().length;
    await toForm(p);
    await fillToEnd(p, { name: 'Bot' });
    await p.click('[data-submit]');
    await p.waitForTimeout(1500);
    ok(posts().length === antes, 'antispam: un envío en menos de 3 s no llega a la hoja');
    await ctx.close();
    const o = await open(b, '/contacto', { consent: false });
    antes = posts().length;
    await toForm(o.p);
    await o.p.waitForTimeout(3100);
    await fillToEnd(o.p, { name: 'Bot' });
    await o.p.evaluate(() => { document.querySelector('input[name="website"]').value = 'spam'; });
    await o.p.click('[data-submit]');
    await o.p.waitForTimeout(1500);
    ok(posts().length === antes, 'antispam: con el campo trampa relleno no llega a la hoja');
    await o.ctx.close();
  });

  await block('Validación en línea', async () => {
    const { ctx, p } = await open(b, '/contacto', { consent: false });
    await toForm(p);
    await p.click('.qf__step.is-active [data-next]').catch(() => {});
    await p.waitForTimeout(300);
    ok((await step(p)) === '1', 'validación: no avanza sin elegir equipo');
    await p.click('label.opt:has(input[value="Diatermia"])');
    await p.waitForTimeout(700);
    await p.click('label.opt:has(input[value="Médico"])');
    await p.waitForTimeout(700);
    await p.press('#f-name', 'Enter');
    await p.waitForTimeout(300);
    ok((await step(p)) === '3' && ((await p.textContent('[data-error-name]')) || '').trim().length > 0, 'validación: el nombre es obligatorio y se explica');
    await p.fill('#f-name', 'Marta');
    await p.press('#f-name', 'Enter');
    await p.waitForTimeout(500);
    await p.fill('#f-tel', '12');
    await p.click('[data-submit]');
    await p.waitForTimeout(300);
    ok(((await p.textContent('[data-error-tel]')) || '').trim().length > 0, 'validación: teléfono no válido');
    await p.click('[data-back]');
    await p.waitForTimeout(500);
    ok((await step(p)) === '3', 'validación: botón atrás');
    await ctx.close();
  });

  await block('Consentimiento y píxel', async () => {
    const { ctx, p, fbReq } = await open(b, '/', { consent: null });
    ok(await p.waitForSelector('#cookie-banner', { state: 'visible', timeout: 5000 }).then(() => true, () => false), 'cookies: banner visible en la primera visita');
    ok(fbReq.length === 0, 'cookies: el píxel no se carga antes de aceptar');
    await p.click('#cookie-banner [data-cookie="accept"]');
    await p.waitForTimeout(600);
    ok(fbReq.length > 0, 'cookies: al aceptar se carga el píxel');
    ok((await fb(p)).some((e) => e[0] === 'track' && e[1] === 'PageView'), 'píxel: PageView');
    await ctx.close();
    const r = await open(b, '/', { consent: null });
    await r.p.click('#cookie-banner [data-cookie="reject"]');
    await r.p.goto(BASE + '/ecografos', { waitUntil: 'networkidle' });
    ok(r.fbReq.length === 0, 'cookies: al rechazar no se carga nada, tampoco al navegar');
    ok(!(await r.p.isVisible('#cookie-banner')), 'cookies: la elección se recuerda');
    await r.ctx.close();
  });

  await block('Eventos: pilar, contacto, catálogo y búsqueda', async () => {
    const { ctx, p } = await open(b, '/ecografos', { consent: true });
    const vc = (await fb(p)).find((e) => e[1] === 'ViewContent');
    ok(vc && vc[2].content_category, 'píxel: ViewContent en la página pilar', JSON.stringify(vc && vc[2]));
    await p.goto(BASE + '/contacto', { waitUntil: 'networkidle' });
    const [popup] = await Promise.all([ctx.waitForEvent('page'), p.click('.chan__card[href*="wa.me"]')]);
    await popup.close();
    const c = (await fb(p)).find((e) => e[1] === 'Contact');
    ok(c && c[2].content_name === 'WhatsApp', 'píxel: Contact al pulsar WhatsApp', JSON.stringify(c && c[2]));
    const wa = await p.getAttribute('.chan__card[href*="wa.me"]', 'href');
    ok(/text=Hola/.test(wa), 'contacto: WhatsApp con mensaje prellenado');
    await p.goto(BASE + '/catalogo', { waitUntil: 'networkidle' });
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('.phero [data-catalog]')]);
    ok(/catalogo-vytalgroup-2026\.pdf$/.test(dl.suggestedFilename()), 'catálogo: descarga directa del PDF sin formulario', dl.suggestedFilename());
    ok((await fb(p)).some((e) => e[0] === 'trackCustom' && e[1] === 'DescargaCatalogo'), 'píxel: DescargaCatalogo (trackCustom, no Lead)');
    ok(!(await fb(p)).some((e) => e[1] === 'Lead'), 'catálogo: la descarga no es un Lead');
    await p.fill('[data-search]', 'acclarix');
    await p.waitForTimeout(1400);
    const s = (await fb(p)).filter((e) => e[1] === 'Search');
    ok(s.length === 1 && s[0][2].search_string === 'acclarix', 'píxel: Search con debounce (una vez)', JSON.stringify(s.map((x) => x[2])));
    await ctx.close();
  });

  await b.close();
  console.log(results.join('\n'));
  const f = results.filter((r) => r.startsWith('FAIL')).length;
  console.log(`\nqa-form: ${results.length - f}/${results.length} comprobaciones correctas.`);
  process.exit(f ? 1 : 0);
})();
