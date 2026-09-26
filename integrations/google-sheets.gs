/**
 * VytalGroup · Recepción de leads en Google Sheets (web y landing, misma hoja)
 * ---------------------------------------------------------------------------
 * Este script sustituye al de la landing: recibe los leads de la web (origen "web") y de la
 * landing (origen "landing", valor por defecto si el envío no lo indica) en la MISMA hoja.
 * Si la hoja ya existe, las columnas nuevas (Origen y Página) se añaden al final sin tocar
 * las filas anteriores: cada dato se escribe en la columna que tiene su título.
 *
 * Instalación (5 minutos):
 *  1. Abre la hoja de leads de la landing (o crea una nueva, por ejemplo "Leads VytalGroup").
 *  2. En la hoja: Extensiones > Apps Script. Borra lo que haya y pega este archivo entero.
 *  3. Guarda. Arriba, elige la función "setup" y pulsa Ejecutar. Google pedirá permisos:
 *     Revisar permisos > tu cuenta > Configuración avanzada > Ir a (proyecto) > Permitir.
 *     Se crea la pestaña "Leads" con sus columnas.
 *  4. Implementar > Nueva implementación > tipo "Aplicación web":
 *       · Ejecutar como: Yo
 *       · Quién tiene acceso: Cualquier usuario
 *     Implementar y copia la URL que termina en /exec.
 *  5. Pega esa URL en src/config.ts → SHEETS_ENDPOINT de la web (y en config.js de la landing,
 *     si cambia) y publica.
 *  Para comprobarlo, abre la URL /exec en el navegador: debe responder {"ok":true,...}.
 *  Si cambias este código, vuelve a Implementar > Gestionar implementaciones > editar >
 *  Versión: nueva. La URL no cambia.
 *
 * Qué hace:
 *  · Recibe el formulario de la web y de la landing (JSON como texto plano, sin preflight CORS).
 *  · Valida lo mínimo en el servidor (campos obligatorios y campo trampa vacío).
 *  · Escribe una fila por lead en la pestaña "Leads" (la crea si no existe, con
 *    cabeceras en negrita y la primera fila congelada). Las columnas se localizan por su
 *    título, así que puedes reordenarlas o añadir columnas propias (por ejemplo "Notas").
 *  · Guarda por dónde prefiere que le escribas (WhatsApp o correo) y añade un enlace directo
 *    a WhatsApp con su número.
 *  · Fecha y hora legibles en zona Europe/Madrid.
 *  · Usa LockService para que dos leads simultáneos no se pisen y descarta envíos repetidos.
 *  · Aviso por email con cada lead (se desactiva poniendo SEND_EMAIL_NOTIFICATION = false).
 *  · Responde { ok: true } o { ok: false, error: "..." }.
 */

// ------------------------------------------------------------------ ajustes
const SHEET_NAME = 'Leads';
const TIMEZONE = 'Europe/Madrid';
const SEND_EMAIL_NOTIFICATION = true;             // false para no recibir un email por lead
const NOTIFY_EMAIL = 'vytalkinetech@gmail.com';

// Columnas en el orden pedido. [clave del JSON, título de la columna]
// En una hoja nueva se crean en este orden; en la hoja de la landing, las que falten se añaden al final.
const COLUMNS = [
  ['fecha', 'Fecha'],
  // Origen: "web" (esta web) o "landing" (la landing de campañas).
  ['origen', 'Origen'],
  // Página: URL exacta desde la que se envió el formulario.
  ['pagina', 'Página'],
  ['nombre', 'Nombre'],
  ['telefono', 'Teléfono'],
  ['email', 'Email'],
  // Contactar por: WhatsApp o Correo (si eligió "Prefiero por correo" en el formulario).
  ['canal', 'Contactar por'],
  // Enlace directo a WhatsApp con su número.
  ['whatsapp', 'WhatsApp'],
  // Equipo: Ecógrafo, Diatermia, Presoterapia, Ondas de choque o, desde "Otro equipo", la categoría
  // elegida (Magnetoterapia, Láser, Electrólisis percutánea, Camillas...) u "Otro equipo".
  ['equipo', 'Equipo'],
  // Modelo: el de la ficha o tarjeta desde la que llega; vacío si no aplica.
  ['modelo', 'Modelo'],
  // Perfil: Clínica, Fisioterapeuta, Médico u Otro.
  ['perfil', 'Perfil'],
  ['consentimiento', 'Consentimiento'],
  ['utm_source', 'utm_source'],
  ['utm_medium', 'utm_medium'],
  ['utm_campaign', 'utm_campaign'],
  ['utm_content', 'utm_content'],
  ['utm_term', 'utm_term'],
  ['fbclid', 'fbclid'],
  ['fbc', 'fbc'],
  ['fbp', 'fbp'],
  ['referrer', 'Referrer'],
  ['landing_url', 'URL de entrada'],
  ['dispositivo', 'Dispositivo'],
  ['idioma', 'Idioma'],
  ['event_id', 'event_id'],
  ['estado', 'Estado'],
];
// El formulario pide 4 cosas: equipo, perfil, nombre y WhatsApp o correo (más el consentimiento).
const REQUIRED = ['nombre', 'perfil', 'equipo', 'consentimiento', 'event_id'];
const EMAIL_RE = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;

// ------------------------------------------------------------------ entrada
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const data = parseBody_(e);

    // Campo trampa: si viene relleno es un bot. Se responde ok para no darle pistas.
    if (data.website) return json_({ ok: true });

    const missing = REQUIRED.filter(function (k) { return !String(data[k] || '').trim(); });
    if (missing.length) return json_({ ok: false, error: 'Faltan campos: ' + missing.join(', ') });
    // WhatsApp o correo: al menos uno, y bien escrito
    const digits = String(data.telefono || '').replace(/\D/g, '');
    const email = String(data.email || '').replace(/\s+/g, '').toLowerCase();
    if (!digits && !email) return json_({ ok: false, error: 'Falta el teléfono o el correo' });
    if (digits && (digits.length < 8 || digits.length > 15)) return json_({ ok: false, error: 'Teléfono no válido' });
    if (email && (email.length > 254 || !EMAIL_RE.test(email))) return json_({ ok: false, error: 'Correo no válido' });
    data.email = email;
    data.canal = data.canal === 'Correo' || (email && !digits) ? 'Correo' : 'WhatsApp';
    // La landing no envía "origen" ni "página": se deducen para que la hoja quede completa
    data.origen = data.origen === 'web' ? 'web' : 'landing';
    if (!data.pagina) data.pagina = data.landing_url || '';

    lock.waitLock(20000);
    const sheet = getSheet_();

    // Evita duplicados si el mismo envío llega dos veces (mismo event_id)
    if (isDuplicate_(sheet, String(data.event_id))) return json_({ ok: true, duplicate: true });

    data.fecha = Utilities.formatDate(new Date(), TIMEZONE, 'dd/MM/yyyy HH:mm:ss');
    data.estado = 'Nuevo'; // Javier lo cambia a mano: Contactado, Presupuesto, Venta...
    data.whatsapp = digits ? 'https://wa.me/' + digits : '';
    // Cada dato va a la columna con su título (las columnas propias se quedan vacías)
    const keyByTitle = {};
    COLUMNS.forEach(function (c) { keyByTitle[c[1]] = c[0]; });
    const row = headers_(sheet).map(function (t) { return keyByTitle[t] ? clean_(data[keyByTitle[t]]) : ''; });
    sheet.appendRow(row);
    SpreadsheetApp.flush();

    if (SEND_EMAIL_NOTIFICATION) notify_(data);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    try { lock.releaseLock(); } catch (x) { /* el bloqueo puede no haberse obtenido */ }
  }
}

// Ejecútala una vez desde el editor: pide los permisos y crea la pestaña "Leads" con sus columnas
function setup() {
  getSheet_();
  if (SEND_EMAIL_NOTIFICATION) MailApp.getRemainingDailyQuota(); // para que Google pida también el permiso de email
  console.log('Listo: pestaña "' + SHEET_NAME + '" preparada. Ahora Implementar > Nueva implementación > Aplicación web.');
}

// Permite comprobar en el navegador que el despliegue responde
function doGet() {
  return json_({ ok: true, service: 'VytalGroup leads', time: Utilities.formatDate(new Date(), TIMEZONE, 'dd/MM/yyyy HH:mm:ss') });
}

// ------------------------------------------------------------------ utilidades
function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) throw new Error('Petición vacía');
  try {
    return JSON.parse(e.postData.contents);
  } catch (err) {
    throw new Error('El cuerpo no es un JSON válido');
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  const titles = COLUMNS.map(function (c) { return c[1]; });
  const current = headers_(sheet);
  if (!current.length) {
    // Hoja nueva: cabeceras en el orden pedido
    if (sheet.getLastRow() > 0) sheet.insertRowBefore(1);
    styleHeaders_(sheet.getRange(1, 1, 1, titles.length).setValues([titles]));
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('@');
    sheet.setColumnWidths(1, titles.length, 160);
    return sheet;
  }
  // Hoja existente (por ejemplo, la de la landing): añade al final las columnas que falten
  const missing = titles.filter(function (t) { return current.indexOf(t) === -1; });
  if (missing.length) {
    const start = current.length + 1;
    if (sheet.getMaxColumns() < start + missing.length - 1) sheet.insertColumnsAfter(sheet.getMaxColumns(), start + missing.length - 1 - sheet.getMaxColumns());
    styleHeaders_(sheet.getRange(1, start, 1, missing.length).setValues([missing]));
    sheet.setColumnWidths(start, missing.length, 160);
  }
  return sheet;
}

// Títulos de la fila 1 (hasta la última columna con título)
function headers_(sheet) {
  const lastCol = sheet.getLastColumn();
  if (!lastCol) return [];
  const row = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (v) { return String(v).trim(); });
  while (row.length && !row[row.length - 1]) row.pop();
  return row;
}

function styleHeaders_(range) {
  return range.setFontWeight('bold').setBackground('#0B1929').setFontColor('#FFFFFF');
}

function isDuplicate_(sheet, eventId) {
  const col = headers_(sheet).indexOf('event_id') + 1;
  const last = sheet.getLastRow();
  if (!col || last < 2 || !eventId) return false;
  const from = Math.max(2, last - 200); // revisa los últimos 200 leads
  const ids = sheet.getRange(from, col, last - from + 1, 1).getValues();
  return ids.some(function (r) { return String(r[0]) === eventId; });
}

// Evita que un texto que empiece por = + - @ se interprete como fórmula
function clean_(v) {
  let s = v === undefined || v === null ? '' : String(v);
  s = s.slice(0, 1000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function notify_(d) {
  const lines = [
    'Nuevo lead de VytalGroup (' + d.origen + ')',
    '',
    'Página: ' + d.pagina,
    'Nombre: ' + d.nombre,
    'Contactar por: ' + d.canal,
    d.telefono ? 'Teléfono: ' + d.telefono : 'Correo: ' + d.email,
    d.whatsapp ? 'WhatsApp: ' + d.whatsapp : '',
    'Perfil: ' + d.perfil,
    'Equipo: ' + d.equipo,
    'Modelo: ' + (d.modelo || 'No aplica'),
    'Campaña: ' + [d.utm_source, d.utm_medium, d.utm_campaign].filter(String).join(' / '),
    'Fecha: ' + d.fecha,
  ];
  const mail = {
    to: NOTIFY_EMAIL,
    subject: 'Nuevo lead: ' + d.nombre + ' (' + (d.modelo || d.equipo) + ')',
    body: lines.filter(function (l, i) { return l !== '' || i === 1; }).join('\n'),
  };
  if (d.email) mail.replyTo = d.email; // "Responder" en el email contesta directamente al lead
  MailApp.sendEmail(mail);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
