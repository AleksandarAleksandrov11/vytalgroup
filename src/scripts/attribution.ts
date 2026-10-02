// Atribución de la visita: UTM, referrer y URL de entrada.
// Se guarda en sessionStorage en la primera visita (o cuando llega una campaña nueva con UTM)
// para que viaje entre páginas y llegue a la hoja con el formulario.

const KEY = 'vg_attr';
const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

export interface Atribucion {
  utm_source: string; utm_medium: string; utm_campaign: string; utm_content: string; utm_term: string;
  referrer: string; landing_url: string; first_seen: string;
}

function read(): Atribucion | null {
  try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { return null; }
}
function write(a: Atribucion) {
  try { sessionStorage.setItem(KEY, JSON.stringify(a)); } catch { /* modo privado o almacenamiento bloqueado */ }
}

export function captureAttribution(): Atribucion {
  const q = new URLSearchParams(location.search);
  const incoming = Object.fromEntries(PARAMS.map((k) => [k, (q.get(k) || '').slice(0, 300)])) as Record<(typeof PARAMS)[number], string>;
  const hasNew = PARAMS.some((k) => incoming[k]);
  let a = read();
  if (!a || hasNew) {
    a = {
      ...incoming,
      referrer: document.referrer || '',
      landing_url: location.href.slice(0, 1000),
      first_seen: new Date().toISOString(),
    };
    write(a);
  }
  return a;
}

export const getAttribution = (): Atribucion => read() || captureAttribution();
