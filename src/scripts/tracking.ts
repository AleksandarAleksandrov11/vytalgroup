// Meta Pixel centralizado y condicionado al consentimiento de marketing.
// · Sin META_PIXEL_ID (src/config.ts) no se carga nada.
// · El script de Meta no se descarga hasta aceptar "Marketing"; si se acepta más tarde, se carga
//   en ese momento; si se retira, deja de enviar eventos y se borran _fbp y _fbc.
// · Eventos: PageView (cada página), ViewContent (fichas y páginas pilar), Lead (una sola vez y solo
//   tras un envío correcto, eventID = event_id de la hoja), DescargaCatalogo (personalizado, no es un
//   lead), Contact (WhatsApp, teléfono o email) y Search (buscador del catálogo, con debounce).
import { consentState, type Consent } from './consent';

declare global {
  interface Window { fbq?: any; _fbq?: any }
}

let allowed = false;
let loaded = false;
const pixelId = () => (document.documentElement.dataset.pixel || '').trim();

function ss(key: string, val?: string) {
  try {
    if (val === undefined) return sessionStorage.getItem(key);
    sessionStorage.setItem(key, val);
  } catch { /* almacenamiento no disponible */ }
  return null;
}

function loadPixel(id: string) {
  const w = window as any;
  if (!w.fbq) {
    const n: any = function (...args: unknown[]) { n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args); };
    w.fbq = n;
    if (!w._fbq) w._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    const t = document.createElement('script');
    t.async = true;
    t.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(t);
  }
  w.fbq('set', 'autoConfig', false, id);
  w.fbq('init', id);
  w.fbq('track', 'PageView');
  loaded = true;
  flushViewContent();
}

function clearMetaCookies() {
  const host = location.hostname;
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`];
  ['_fbp', '_fbc'].forEach((name) => domains.forEach((d) => {
    document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ''}`;
  }));
}

function apply(c: Consent | null) {
  const id = pixelId();
  const want = !!(c && c.marketing);
  if (!id) { allowed = false; return; }
  if (want) {
    allowed = true;
    if (!loaded) loadPixel(id);
    else window.fbq('consent', 'grant');
  } else {
    allowed = false;
    if (loaded) {
      window.fbq('consent', 'revoke');
      clearMetaCookies();
    }
  }
}

function send(kind: 'track' | 'trackCustom', name: string, params: Record<string, unknown> = {}, eventID?: string) {
  if (!allowed || !loaded || typeof window.fbq !== 'function') return false;
  if (eventID) window.fbq(kind, name, params, { eventID });
  else window.fbq(kind, name, params);
  return true;
}

export const track = (name: string, params?: Record<string, unknown>, eventID?: string) => send('track', name, params, eventID);
export const trackCustom = (name: string, params?: Record<string, unknown>, eventID?: string) => send('trackCustom', name, params, eventID);

// ViewContent de la página (fichas y pilares): datos en <body data-vc>. Se envía una vez por página,
// en cuanto hay consentimiento y píxel.
let vcSent = false;
function flushViewContent() {
  if (vcSent) return;
  const raw = document.body.dataset.vc;
  if (!raw) return;
  try {
    const vc = JSON.parse(raw);
    const params: Record<string, unknown> = { content_type: vc.type, content_category: vc.category, content_name: vc.name };
    if (vc.ids?.length) params.content_ids = vc.ids;
    vcSent = track('ViewContent', params);
  } catch { /* datos no válidos */ }
}

export function initTracking() {
  window.addEventListener('vg:consent', (e) => apply((e as CustomEvent<Consent>).detail));
  apply(consentState());
}

const leads = new Set<string>();
export function lead(eventId: string, contentName: string, category: string) {
  if (!eventId || leads.has(eventId) || ss(`vg_lead_${eventId}`)) return;
  leads.add(eventId);
  ss(`vg_lead_${eventId}`, '1');
  track('Lead', { content_name: contentName, content_category: category }, eventId);
}

export const catalogDownload = (origen: string) => trackCustom('DescargaCatalogo', { content_name: 'Catálogo VytalGroup 2026', content_category: origen });
export const contact = (canal: string, origen: string) => track('Contact', { content_name: canal, content_category: origen || 'web' });

let searchTimer = 0;
let lastSearch = '';
export function search(q: string) {
  clearTimeout(searchTimer);
  const term = q.trim();
  if (term.length < 2) return;
  searchTimer = window.setTimeout(() => {
    if (term === lastSearch) return;
    lastSearch = term;
    track('Search', { search_string: term, content_category: 'Catálogo' });
  }, 900);
}
