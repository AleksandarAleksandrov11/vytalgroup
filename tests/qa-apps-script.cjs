// Ejecuta integrations/google-sheets.gs (el Apps Script real: el de la landing más una mejora, un email que falla
// no convierte en error un lead ya guardado) contra una hoja de Google simulada: columnas, WhatsApp o correo,
// aviso por email, duplicados, campo trampa, validaciones, fórmulas, la columna Modelo añadida a una pestaña ya
// en uso, el paso de una pestaña muy antigua a una nueva y los envíos tal y como los hace la web.
const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync(require('path').join(__dirname, '..', 'integrations', 'google-sheets.gs'), 'utf8');
function makeEnv({ mailFalla = false } = {}) {
  const sheets = {};
  const mails = [];
  const mkSheet = (name) => {
    const rows = [];
    const sh = {
      name, rows, frozen: 0, hidden: [],
      setName: (n) => { delete sheets[sh.name]; sh.name = n; sheets[n] = sh; },
      hideColumns: (c) => { sh.hidden.push(c); },
      insertColumnAfter: (c) => {
        rows.forEach((r) => { while (r.length < c) r.push(''); r.splice(c, 0, ''); });
        sh.hidden = sh.hidden.map((h) => (h > c ? h + 1 : h));
        return sh;
      },
      setColumnWidth: () => sh,
      getLastRow: () => rows.length,
      insertRowBefore: (i) => rows.splice(i - 1, 0, []),
      appendRow: (r) => rows.push(r.slice()),
      setFrozenRows: (n) => { sh.frozen = n; },
      setColumnWidths: () => sh,
      getRange: (a, c, nr, nc) => {
        if (typeof a === 'string') return { setNumberFormat: () => {} };
        const api = {
          getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => ((rows[a - 1 + i] || [])[c - 1 + j] ?? ''))),
          setValues: (v) => { v.forEach((row, i) => { rows[a - 1 + i] = rows[a - 1 + i] || []; row.forEach((x, j) => { rows[a - 1 + i][c - 1 + j] = x; }); }); return api; },
          setValue: (x) => api.setValues([[x]]),
          setFontWeight: () => api, setBackground: () => api, setFontColor: () => api,
        };
        return api;
      },
    };
    return sh;
  };
  const quiet = { ...console, error: () => {}, log: () => {} };
  const ctx = {
    console: quiet,
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: (n) => sheets[n] || null, insertSheet: (n) => (sheets[n] = mkSheet(n)) }), __sheets: sheets, flush: () => {} },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    Utilities: { formatDate: () => '24/09/2026 12:00' },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (t) => ({ setMimeType: () => ({ body: JSON.parse(t) }) }) },
    MailApp: { sendEmail: (m) => { if (mailFalla) throw new Error('Service invoked too many times for one day: email.'); mails.push(m); }, getRemainingDailyQuota: () => 100 },
  };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return { ctx, sheets, mails };
}
const post = (ctx, obj) => ctx.doPost({ postData: { contents: typeof obj === 'string' ? obj : JSON.stringify(obj) } }).body;
const base = { nombre: 'Laura Gómez', telefono: '+34 612 345 678', email: '', perfil: 'Fisioterapeuta', equipo: 'Ecógrafo', modelo: 'Acclarix AX8 (EDAN)', consentimiento: 'Sí · 2026-09-24T10:00:00Z', utm_source: 'facebook', utm_medium: 'paid', utm_campaign: 'otono', utm_content: 'video-1', utm_term: '', event_id: '11111111-1111-4111-8111-111111111111', website: '' };
const HEAD = 'Fecha|Nombre|Teléfono|Email|Perfil|Equipo de interés|Modelo|utm_source|utm_medium|utm_campaign|utm_content|utm_term|event_id';
const PREV = HEAD.replace('|Modelo', '').split('|');
const res = [];
const ok = (c, n, x = '') => res.push(`${c ? 'PASS' : 'FAIL'}  ${n}${x ? '  · ' + x : ''}`);

{ const { ctx, sheets } = makeEnv(); ctx.setup(); const sh = sheets.Leads; ok(sh && sh.rows[0].join('|') === HEAD && sh.frozen === 1 && sh.hidden.join() === '13', 'setup(): crea "Leads" solo con Fecha, Nombre, Teléfono, Email, Perfil, Equipo de interés, Modelo y UTM (event_id oculto)', sh && sh.rows[0].join(', ')); }
{ const { ctx } = makeEnv(); const r = ctx.doGet().body; ok(r.ok === true && r.service, 'doGet(): responde ok para comprobar el despliegue'); }
{
  const { ctx, sheets, mails } = makeEnv();
  const r = post(ctx, base);
  const sh = sheets.Leads; const h = sh.rows[0]; const row = sh.rows[1]; const col = (n) => row[h.indexOf(n)];
  ok(r.ok === true && sh.rows.length === 2 && row.length === 13, 'doPost(): guarda una fila de 13 columnas y responde { ok: true }', JSON.stringify(r));
  ok(col('Fecha') === '24/09/2026 12:00' && col('Nombre') === 'Laura Gómez' && col('Teléfono') === "'+34 612 345 678" && col('Email') === '' && col('Perfil') === 'Fisioterapeuta' && col('Equipo de interés') === 'Ecógrafo' && col('Modelo') === 'Acclarix AX8 (EDAN)' && col('utm_source') === 'facebook' && col('utm_campaign') === 'otono' && col('utm_content') === 'video-1' && col('event_id') === base.event_id, 'doPost(): cada dato en su columna; el modelo elegido va en su propia columna', row.slice(0, 7).join(' | '));
  const m = mails[0];
  ok(mails.length === 1 && m.to === 'aaswebmarketing@gmail.com' && m.subject === 'Nuevo lead: Laura Gómez · Acclarix AX8 (EDAN)' && /Teléfono: \+34 612 345 678 {2}\(WhatsApp: https:\/\/wa\.me\/34612345678\)/.test(m.body) && /Perfil: Fisioterapeuta/.test(m.body) && /Equipo de interés: Ecógrafo\nModelo: Acclarix AX8 \(EDAN\)/.test(m.body) && /Campaña: facebook \/ paid \/ otono/.test(m.body) && !/Email:/.test(m.body), 'Email: asunto con nombre y modelo, teléfono con enlace de WhatsApp, perfil, equipo, modelo y campaña', m && m.subject);
  const r2 = post(ctx, base);
  ok(r2.ok === true && r2.duplicate === true && sh.rows.length === 2 && mails.length === 1, 'doPost(): el mismo event_id no se duplica');
  ok(post(ctx, { ...base, event_id: '2', website: 'http://spam' }).ok === true && sh.rows.length === 2, 'doPost(): el campo trampa se descarta sin dar pistas');
  const r4 = post(ctx, { ...base, event_id: '3', perfil: '' });
  ok(r4.ok === false && /perfil/.test(r4.error) && sh.rows.length === 2, 'doPost(): sin perfil responde error y no guarda', r4.error);
  const r5 = post(ctx, { ...base, event_id: '4', telefono: '12' });
  ok(r5.ok === false && /Teléfono/.test(r5.error), 'doPost(): teléfono imposible responde error', r5.error);
  const r6 = post(ctx, { ...base, event_id: '5', nombre: '=HYPERLINK("http://x")' });
  ok(r6.ok === true && sh.rows[2][1].startsWith("'="), 'doPost(): un texto que empieza por = no se ejecuta como fórmula', sh.rows[2][1]);
  const r7 = post(ctx, 'no es json');
  ok(r7.ok === false && /JSON/.test(r7.error), 'doPost(): cuerpo que no es JSON responde error', r7.error);
  ok(ctx.doPost({}).body.ok === false, 'doPost(): petición vacía responde error');
  const n = sh.rows.length; const m0 = mails.length;
  const r9 = post(ctx, { ...base, event_id: '6', telefono: '', email: ' Laura.Gomez@Gmail.com ', equipo: 'Diatermia', modelo: 'Sin decidir' });
  const erow = sh.rows[n];
  ok(r9.ok === true && erow && erow[2] === '' && erow[3] === 'laura.gomez@gmail.com' && erow[5] === 'Diatermia' && erow[6] === '', 'Correo: guarda el correo limpio, sin teléfono; "Sin decidir" deja el modelo vacío', erow && erow.slice(1, 7).join(' | '));
  const mail = mails[m0];
  ok(mail && mail.replyTo === 'laura.gomez@gmail.com' && /Email: laura\.gomez@gmail\.com/.test(mail.body) && !/Teléfono:/.test(mail.body) && !/Modelo:/.test(mail.body) && mail.subject === 'Nuevo lead: Laura Gómez · Diatermia', 'Correo: el aviso se puede responder directamente al lead; sin modelo, el asunto lleva el equipo', mail && mail.subject);
  post(ctx, { ...base, event_id: '9', equipo: 'Láser de alta potencia', modelo: '' });
  ok(sh.rows[sh.rows.length - 1][5] === 'Láser de alta potencia' && sh.rows[sh.rows.length - 1][6] === '', 'Equipo sin modelos: la columna Modelo queda vacía');
  const r10 = post(ctx, { ...base, event_id: '7', telefono: '', email: 'laura@gmail' });
  ok(r10.ok === false && /Correo no válido/.test(r10.error), 'Correo: formato no válido responde error', r10.error);
  const r11 = post(ctx, { ...base, event_id: '8', telefono: '', email: '' });
  ok(r11.ok === false && /teléfono o el correo/.test(r11.error), 'doPost(): sin teléfono ni correo responde error', r11.error);
}
{
  // Pestaña "Leads" en uso con las columnas de antes (sin Modelo): se añade la columna sin mover de pestaña
  const { ctx, sheets, mails } = makeEnv();
  const sh = ctx.SpreadsheetApp.getActiveSpreadsheet().insertSheet('Leads');
  sh.rows.push(PREV.concat('Estado'));
  sh.rows.push(['27/09/2026 10:30', 'Lucía Martín Ortega', "'+34 611 222 333", '', 'Fisioterapeuta', 'Ecógrafo · Acclarix AX8 (EDAN)', 'facebook', 'paid', 'ecografos-otono', '', '', 'evt-1', 'Llamada']);
  sh.rows.push(['27/09/2026 10:35', 'Marta Ruiz Gil', '', 'marta.ruiz@example.com', 'Clínica', 'Láser de alta potencia', 'instagram', 'paid', 'catalogo-2026', '', '', 'evt-2', '']);
  sh.rows.push(['27/09/2026 10:40', 'Nombre raro', '', 'x@example.com', 'Otro', '=1+1', '', '', '', '', '', 'evt-3', '']);
  sh.hidden.push(12);
  const r = post(ctx, { ...base, event_id: 'evt-4' });
  const rows = sh.rows;
  ok(r.ok === true && Object.keys(sheets).join() === 'Leads' && rows[0].join('|') === HEAD + '|Estado' && rows.length === 5, 'Columna Modelo: se añade a la pestaña "Leads" en uso, sin crear otra y sin tocar tus columnas propias', rows[0].join(', '));
  ok(rows[1][5] === 'Ecógrafo' && rows[1][6] === 'Acclarix AX8 (EDAN)' && rows[1][12] === 'evt-1' && rows[1][13] === 'Llamada' && rows[2][5] === 'Láser de alta potencia' && rows[2][6] === '' && rows[3][5] === "'=1+1", 'Columna Modelo: las filas que ya había separan equipo y modelo', rows[1].slice(5, 7).join(' | '));
  ok(rows[4][5] === 'Ecógrafo' && rows[4][6] === 'Acclarix AX8 (EDAN)' && rows[4][12] === 'evt-4' && sh.hidden.includes(13) && !sh.hidden.includes(12) && mails.length === 1, 'Columna Modelo: el lead nuevo entra con su modelo y event_id sigue oculto', rows[4].slice(5, 7).join(' | '));
  const dup = post(ctx, { ...base, event_id: 'evt-1' });
  post(ctx, { ...base, event_id: 'evt-5' });
  ok(dup.duplicate === true && rows.length === 6 && rows[0].join('|') === HEAD + '|Estado', 'Columna Modelo: los duplicados se siguen detectando y la columna se añade una sola vez');
}
{
  // Hoja con la pestaña "Leads" de la versión anterior (24 columnas): se aparta y se crea una nueva
  const { ctx, sheets } = makeEnv();
  ctx.setup();
  const old = sheets.Leads;
  old.rows[0] = ['Fecha', 'Nombre', 'Contactar por', 'Teléfono', 'WhatsApp', 'Email', 'Perfil', 'Equipo', 'Modelo'];
  old.rows.push(['27/09/2026 10:30:00', 'Prueba antigua', 'WhatsApp']);
  const r = post(ctx, { ...base, event_id: '99' });
  const names = Object.keys(sheets);
  const moved = names.find((x) => x.startsWith('Leads anterior '));
  ok(r.ok === true && moved && sheets[moved].rows.length === 2 && sheets.Leads.rows[0].join('|') === HEAD && sheets.Leads.rows.length === 2, 'Columnas antiguas: la pestaña vieja se guarda aparte ("Leads anterior …") y el lead entra en una "Leads" nueva', names.join(', '));
  sheets.Leads.rows[0].push('Estado');
  post(ctx, { ...base, event_id: '100' });
  ok(Object.keys(sheets).length === 2 && sheets.Leads.rows.length === 3, 'Añadir columnas propias a la derecha (p. ej. "Estado") no cambia de pestaña');
}
{
  // Envíos de la web: el mismo JSON que arma src/scripts/form.js (lleva campos de más, que la hoja ignora).
  // Sin UTM en la visita, la web pone utm_source "web", el medio según la procedencia y la página como campaña.
  const { ctx, sheets, mails } = makeEnv();
  const web = {
    origen: 'web', pagina: 'https://www.vytalgroupem.com/ecografos/acclarix-ax8', nombre: 'Pablo Sanz', canal: 'WhatsApp',
    telefono: '+34 600 111 222', email: '', perfil: 'Clínica', equipo: 'Ecógrafo', modelo: 'Acclarix AX8 (EDAN)',
    consentimiento: 'Sí · 2026-10-01T10:00:00Z', utm_source: 'web', utm_medium: 'organico', utm_campaign: 'ecografos/acclarix-ax8',
    utm_content: 'google.com', utm_term: '', fbclid: '', fbc: '', fbp: '', referrer: 'https://www.google.com/', landing_url: 'https://www.vytalgroupem.com/ecografos/acclarix-ax8',
    dispositivo: 'iOS · móvil', idioma: 'es-ES', event_id: 'web-1', website: '',
  };
  const r = post(ctx, web);
  const sh = sheets.Leads; const h = sh.rows[0]; const row = sh.rows[1]; const col = (n) => row[h.indexOf(n)];
  ok(r.ok === true && row.length === 13 && col('Nombre') === 'Pablo Sanz' && col('Equipo de interés') === 'Ecógrafo' && col('Modelo') === 'Acclarix AX8 (EDAN)' && col('utm_source') === 'web' && col('utm_medium') === 'organico' && col('utm_campaign') === 'ecografos/acclarix-ax8' && col('utm_content') === 'google.com' && col('event_id') === 'web-1', 'Web: el lead entra con utm_source "web", su medio, la página como campaña y el modelo en su columna', row.slice(5, 11).join(' | '));
  ok(mails.length === 1 && /Campaña: web \/ organico \/ ecografos\/acclarix-ax8/.test(mails[0].body), 'Web: el aviso por email muestra que el lead viene de la web', mails[0] && mails[0].subject);
  const r2 = post(ctx, { ...web, event_id: 'web-2', canal: 'Correo', telefono: '', email: 'pablo@clinica.es', equipo: 'Diatermia', modelo: 'Sin decidir', utm_medium: 'directo', utm_campaign: 'contacto', utm_content: '' });
  const row2 = sh.rows[2];
  ok(r2.ok === true && row2[2] === '' && row2[3] === 'pablo@clinica.es' && row2[5] === 'Diatermia' && row2[6] === '' && row2[7] === 'web' && row2[8] === 'directo' && row2[9] === 'contacto', 'Web: por correo y sin modelo decidido (Contacto, visita directa)', row2.slice(2, 10).join(' | '));
  const r3 = post(ctx, { ...web, event_id: 'web-1' });
  ok(r3.ok === true && r3.duplicate === true && sh.rows.length === 3, 'Web: el reintento del mismo envío no duplica la fila');
}
{
  // Si el aviso por email falla (cuota diaria agotada, permisos...), el lead ya está guardado: responde ok
  const { ctx, sheets } = makeEnv({ mailFalla: true });
  const r = post(ctx, { ...base, event_id: 'mail-ko' });
  ok(r.ok === true && sheets.Leads.rows.length === 2 && sheets.Leads.rows[1][12] === 'mail-ko', 'Email que falla: el lead se guarda y la respuesta sigue siendo { ok: true }', JSON.stringify(r));
}
console.log(res.join('\n'));
const fails = res.filter((x) => x.startsWith('FAIL')).length;
console.log(`\n${res.length - fails}/${res.length} OK`);
process.exit(fails ? 1 : 0);
