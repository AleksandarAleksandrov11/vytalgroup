// Consentimiento de cookies: aviso, panel de configuración y almacenamiento (12 meses).
// Solo hay una categoría opcional: marketing (píxel de Meta). Las necesarias siempre están activas.
// Emite `vg:consent` con { necessary, marketing } cuando cambia.

const KEY = 'vg_consent';
const MAX_AGE = 365 * 24 * 60 * 60 * 1000;

export interface Consent { v: number; date: string; necessary: true; marketing: boolean }

export function getConsent(): Consent | null {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!c || !c.date || Date.now() - Date.parse(c.date) > MAX_AGE) return null;
    return c;
  } catch {
    return null;
  }
}

let current: Consent | null = null;
export const consentState = () => current || getConsent();

function save(marketing: boolean) {
  const c: Consent = { v: 2, date: new Date().toISOString(), necessary: true, marketing: !!marketing };
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* sin almacenamiento: vale para esta visita */ }
  current = c;
  window.dispatchEvent(new CustomEvent('vg:consent', { detail: c }));
  return c;
}

export function initConsent({ delay = 900 } = {}) {
  current = getConsent();
  const banner = document.getElementById('cookie-banner');
  const panel = document.getElementById('cookie-panel') as HTMLDialogElement | null;
  if (!banner || !panel) return;
  const html = document.documentElement;
  const toggle = panel.querySelector<HTMLInputElement>('[data-consent="marketing"]')!;

  function showBanner() {
    banner!.hidden = false;
    html.classList.add('has-cookie-banner');
    requestAnimationFrame(() => requestAnimationFrame(() => banner!.classList.add('is-visible')));
  }
  function hideBanner() {
    if (banner!.hidden) return;
    banner!.classList.remove('is-visible');
    html.classList.remove('has-cookie-banner');
    setTimeout(() => { banner!.hidden = true; }, 600);
  }
  let closing = 0;
  function openPanel() {
    if (panel!.open) return;
    clearTimeout(closing);
    panel!.classList.remove('is-closing');
    const c = consentState();
    toggle.checked = !!(c && c.marketing);
    if (typeof panel!.showModal === 'function') panel!.showModal();
    else panel!.setAttribute('open', '');
    toggle.focus({ preventScroll: true });
  }
  function closePanel() {
    if (!panel!.open || panel!.classList.contains('is-closing')) return;
    const box = panel!.querySelector('.cp__in')!;
    const done = () => {
      clearTimeout(closing);
      box.removeEventListener('animationend', done);
      panel!.classList.remove('is-closing');
      if (typeof panel!.close === 'function') panel!.close();
      else panel!.removeAttribute('open');
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { done(); return; }
    panel!.classList.add('is-closing');
    box.addEventListener('animationend', done);
    closing = window.setTimeout(done, 400);
  }
  panel.addEventListener('cancel', (e) => { e.preventDefault(); closePanel(); });
  function decide(marketing: boolean) {
    save(marketing);
    closePanel();
    hideBanner();
  }
  document.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-cookie], [data-cookie-settings], [data-cpanel-close]');
    if (!b) return;
    if (b.hasAttribute('data-cookie-settings')) { openPanel(); return; }
    if (b.hasAttribute('data-cpanel-close')) { closePanel(); return; }
    switch (b.dataset.cookie) {
      case 'accept': decide(true); break;
      case 'reject': decide(false); break;
      case 'config': openPanel(); break;
      case 'save': decide(toggle.checked); break;
    }
  });
  panel.addEventListener('click', (e) => { if (e.target === panel) closePanel(); });
  if (!current) setTimeout(showBanner, delay);
}
