// Vercel Web Analytics, solo si el visitante acepta la analítica y solo en el dominio publicado.
// Vercel no usa cookies para esto (cuenta visitas con un identificador anónimo que caduca en 24 h),
// pero aun así se carga únicamente con consentimiento. Si se retira, deja de enviar datos en esa
// misma visita (beforeSend descarta los eventos). Script y envíos van al propio dominio
// (/_vercel/insights/...), así que no hace falta tocar la CSP.
import { consentState, type Consent } from './consent';

declare global {
  interface Window { va?: (...args: unknown[]) => void; vaq?: unknown[][] }
}

let allowed = false;
let loaded = false;
const local = () => location.protocol === 'file:' || /^(localhost|127\.|0\.0\.0\.0|\[::1\]|192\.168\.)/.test(location.hostname);

function load() {
  if (loaded || local() || document.documentElement.dataset.analytics !== '1') return;
  window.va = window.va || function (...args: unknown[]) { (window.vaq = window.vaq || []).push(args); };
  window.va('beforeSend', (event: unknown) => (allowed ? event : null));
  const s = document.createElement('script');
  s.defer = true;
  s.src = '/_vercel/insights/script.js';
  document.head.appendChild(s);
  loaded = true;
}

function apply(c: Consent | null) {
  allowed = !!(c && c.analytics);
  if (allowed) load();
}

export function initAnalytics() {
  apply(consentState());
  window.addEventListener('vg:consent', (e) => apply((e as CustomEvent<Consent>).detail));
}
