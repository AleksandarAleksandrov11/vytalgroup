// Ejecuta el Apps Script real (integrations/google-sheets.gs) contra una hoja de cálculo simulada:
// hoja nueva (columnas en el orden del brief), hoja de la landing (Origen y Página se añaden al final
// y cada dato va a la columna con su título), origen por defecto "landing", duplicados, campo trampa
// y validaciones.
const fs = require('fs');
const code = fs.readFileSync('integrations/google-sheets.gs', 'utf8');
const results = [];
const ok = (cond, name, extra = '') => results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? `  · ${extra}` : ''}`);

function mkSheet(rows) {
  const s = { rows, maxCols: 26, mails: [] };
  const rng = (r, c, nr, nc) => {
    const o = {
      getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => (s.rows[r - 1 + i] || [])[c - 1 + j] ?? '')),
      setValues: (v) => { v.forEach((row, i) => { s.rows[r - 1 + i] = s.rows[r - 1 + i] || []; row.forEach((x, j) => { s.rows[r - 1 + i][c - 1 + j] = x; }); }); return o; },
      setFontWeight: () => o, setBackground: () => o, setFontColor: () => o, setNumberFormat: () => o,
    };
    return o;
  };
  const api = {
    getLastColumn: () => Math.max(0, ...s.rows.map((r) => { let n = r.length; while (n && (r[n - 1] === '' || r[n - 1] === undefined)) n--; return n; })),
    getLastRow: () => s.rows.length,
    getMaxColumns: () => s.maxCols,
    insertColumnsAfter: (a, n) => { s.maxCols += n; },
    getRange: (r, c, nr = 1, nc = 1) => (typeof r === 'string' ? rng(1, 1, 1, 1) : rng(r, c, nr, nc)),
    insertRowBefore: () => s.rows.unshift([]),
    setFrozenRows() {}, setColumnWidths() {},
    appendRow: (row) => s.rows.push(row),
  };
  return { s, api };
}
function run(initialRows, payload) {
  const { s, api } = mkSheet(initialRows);
  const g = {
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: () => api, insertSheet: () => api }), flush() {} },
    Utilities: { formatDate: () => '26/09/2026 10:00:00' },
    MailApp: { sendEmail: (m) => s.mails.push(m), getRemainingDailyQuota() {} },
    ContentService: { createTextOutput: (t) => ({ setMimeType: () => t }), MimeType: { JSON: 'json' } },
    console: { error() {}, log() {} },
  };
  const doPost = new Function(...Object.keys(g), `${code}\nreturn doPost;`)(...Object.values(g));
  const out = JSON.parse(doPost({ postData: { contents: JSON.stringify(payload) } }));
  const head = s.rows[0] || [];
  const last = s.rows[s.rows.length - 1] || [];
  const col = (t) => last[head.indexOf(t)];
  return { out, rows: s.rows, head, col, mails: s.mails };
}

const base = { nombre: 'Ana López', perfil: 'Clínica', equipo: 'Ecógrafo', modelo: 'Acclarix AX8 (EDAN)', consentimiento: 'Sí', event_id: 'e1', telefono: '+34 612 345 678', utm_source: 'facebook', landing_url: 'https://vsl-vytalgroup.vercel.app/?utm_source=ig' };
const ORDEN = ['Fecha', 'Origen', 'Página', 'Nombre', 'Teléfono', 'Email', 'Contactar por', 'WhatsApp', 'Equipo', 'Modelo', 'Perfil', 'Consentimiento', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'fbc', 'fbp', 'Referrer', 'URL de entrada', 'Dispositivo', 'Idioma', 'event_id', 'Estado'];

// 1) Hoja nueva, lead de la web
let r = run([], { ...base, origen: 'web', pagina: 'https://vytalgroup.com/ecografos/acclarix-ax8' });
ok(r.out.ok === true, 'hoja nueva: responde ok');
ok(JSON.stringify(r.head) === JSON.stringify(ORDEN), 'hoja nueva: columnas en el orden del brief', r.head.join(', '));
ok(r.col('Origen') === 'web' && r.col('Página') === 'https://vytalgroup.com/ecografos/acclarix-ax8', 'hoja nueva: Origen y Página');
ok(r.col('Modelo') === 'Acclarix AX8 (EDAN)' && r.col('Equipo') === 'Ecógrafo', 'hoja nueva: equipo y modelo');
ok(r.col('WhatsApp') === 'https://wa.me/34612345678' && r.col('Contactar por') === 'WhatsApp', 'hoja nueva: enlace de WhatsApp');
ok(r.col('Teléfono') === "'+34 612 345 678", 'hoja nueva: el teléfono no se interpreta como fórmula', r.col('Teléfono'));
ok(r.col('Fecha') === '26/09/2026 10:00:00' && r.col('Estado') === 'Nuevo', 'hoja nueva: fecha y estado');
ok(r.mails.length === 1 && /Página: https:\/\/vytalgroup\.com/.test(r.mails[0].body), 'hoja nueva: aviso por email con la página');

// 2) Hoja de la landing (cabeceras antiguas y una columna propia), lead de la landing sin origen
const LANDING = ['Fecha', 'Nombre', 'Contactar por', 'Teléfono', 'WhatsApp', 'Email', 'Perfil', 'Equipo', 'Modelo', 'Consentimiento', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'fbc', 'fbp', 'Referrer', 'URL de entrada', 'Dispositivo', 'Idioma', 'event_id', 'Estado', 'Notas'];
const antigua = ['01/09/2026', 'Luis', 'WhatsApp', '+34 600', 'https://wa.me/34600', '', 'Médico', 'Diatermia', '', 'Sí', '', '', '', '', '', '', '', '', '', '', 'móvil', 'es', 'e0', 'Contactado', 'llamar'];
r = run([LANDING.slice(), antigua.slice()], { ...base, event_id: 'e2' });
ok(r.out.ok === true, 'hoja de la landing: responde ok');
ok(JSON.stringify(r.head.slice(0, LANDING.length)) === JSON.stringify(LANDING) && r.head.slice(LANDING.length).join() === 'Origen,Página', 'hoja de la landing: Origen y Página se añaden al final', r.head.slice(-3).join(', '));
ok(JSON.stringify(r.rows[1]) === JSON.stringify(antigua), 'hoja de la landing: las filas anteriores no se tocan');
ok(r.col('Origen') === 'landing' && r.col('Página') === base.landing_url, 'hoja de la landing: origen "landing" y página por defecto');
ok(r.col('Nombre') === 'Ana López' && r.col('Perfil') === 'Clínica' && r.col('Notas') === '', 'hoja de la landing: cada dato en su columna por título');

// 3) Duplicado, campo trampa y validaciones
r = run([LANDING.slice(), antigua.slice()], { ...base, event_id: 'e0' });
ok(r.out.duplicate === true && r.rows.length === 2, 'duplicado: mismo event_id no se escribe dos veces');
r = run([], { ...base, website: 'spam' });
ok(r.out.ok === true && r.rows.length === 0, 'campo trampa: responde ok sin escribir');
r = run([], { ...base, nombre: '' });
ok(r.out.ok === false && /nombre/.test(r.out.error), 'validación: nombre obligatorio');
r = run([], { ...base, telefono: '', email: 'mal@correo' });
ok(r.out.ok === false, 'validación: correo no válido');
r = run([], { ...base, telefono: '', email: 'ana@clinica.es', canal: 'Correo' });
ok(r.out.ok === true && r.col('Contactar por') === 'Correo' && r.col('WhatsApp') === '', 'correo: guarda el canal y no crea enlace de WhatsApp');

console.log(results.join('\n'));
const f = results.filter((x) => x.startsWith('FAIL')).length;
console.log(`\nqa-apps-script: ${results.length - f}/${results.length} comprobaciones correctas.`);
process.exit(f ? 1 : 0);
