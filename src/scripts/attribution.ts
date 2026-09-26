// Atribución de la visita: UTM, fbclid, referrer y URL de entrada.
// Se guarda en sessionStorage en la primera visita (o cuando llega un clic de anuncio nuevo)
// para que viaje entre páginas y llegue a la hoja con el formulario.

const KEY = 'vg_attr';
const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'] as const;

export interface Atribucion {
  utm_source: string; utm_medium: string; utm_campaign: string; utm_content: string; utm_term: string; fbclid: string;
  fbclid_ts: number; referrer: string; landing_url: string; first_seen: string;
  fbc?: string; fbp?: string;
}

function read(): Atribucion | null {
  try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { return null; }
}
function write(a: Atribucion) {
  try { sessionStorage.setItem(KEY, JSON.stringify(a)); } catch { /* modo privado o almacenamiento bloqueado */ }
}
function cookie(name: string) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : '';
}

export function captureAttribution(): Atribucion {
  const q = new URLSearchParams(location.search);
  const incoming = Object.fromEntries(PARAMS.map((k) => [k, (q.get(k) || '').slice(0, 300)])) as Record<(typeof PARAMS)[number], string>;
  const hasNew = PARAMS.some((k) => incoming[k]);
  let a = read();
  if (!a || hasNew) {
    a = {
      ...incoming,
      fbclid_ts: incoming.fbclid ? Date.now() : 0,
      referrer: document.referrer || '',
      landing_url: location.href.slice(0, 1000),
      first_seen: new Date().toISOString(),
    };
    write(a);
  }
  return a;
}

export function getAttribution(): Atribucion {
  const a = read() || captureAttribution();
  // fbc: cookie _fbc del píxel o, si no existe, construida desde el fbclid (formato de Meta)
  const fbc = cookie('_fbc') || (a.fbclid ? `fb.1.${a.fbclid_ts || Date.now()}.${a.fbclid}` : '');
  const fbp = cookie('_fbp') || '';
  return { ...a, fbc, fbp };
}
