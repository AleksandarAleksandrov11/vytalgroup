// Filtro del catálogo: chips de categoría, buscador instantáneo y orden (Destacados, A a Z, Marca).
// El estado va en la URL (?categoria=ecografia&q=sonda&orden=az) para poder compartir enlaces;
// el canonical de la página sigue siendo /catalogo sin parámetros.
// Reordenación animada con FLIP (solo transform y opacity). Sin JS, el catálogo se ve completo.
import { createSelect } from './select.js';
import { search as trackSearch } from './tracking';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const ORDENES = [
  { value: 'destacados', label: 'Destacados' },
  { value: 'az', label: 'A a Z' },
  { value: 'marca', label: 'Marca' },
];

export function initCatalogo() {
  const root = document.querySelector<HTMLElement>('[data-catalogo]');
  if (!root) return;
  const list = root.querySelector<HTMLElement>('[data-list]')!;
  const items = [...list.querySelectorAll<HTMLElement>('[data-item]')];
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-chips] .chip')];
  const input = root.querySelector<HTMLInputElement>('[data-search]')!;
  const count = root.querySelector<HTMLElement>('[data-count-result]')!;
  const empty = root.querySelector<HTMLElement>('[data-empty]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const validas = new Set(chips.map((c) => c.dataset.cat));

  const params = new URLSearchParams(location.search);
  const state = {
    cat: validas.has(params.get('categoria') || '') ? params.get('categoria') || '' : '',
    q: (params.get('q') || '').slice(0, 80),
    orden: ORDENES.some((o) => o.value === params.get('orden')) ? params.get('orden')! : 'destacados',
  };
  input.value = state.q;

  const sort = createSelect(root.querySelector('[data-sort]')!, {
    id: 'orden',
    title: 'Ordenar',
    options: ORDENES,
    value: state.orden,
    button: (x: { label: string }) => `<svg class="icon" aria-hidden="true"><use href="#i-sort"/></svg><span>${x.label}</span>`,
    buttonLabel: (x: { label: string }) => `Ordenar por: ${x.label}. Cambiar`,
    onChange: (x: { value: string }) => { state.orden = x.value; apply(); },
  });
  void sort;

  function syncUrl() {
    const u = new URL(location.href);
    ['categoria', 'q', 'orden'].forEach((k) => u.searchParams.delete(k));
    if (state.cat) u.searchParams.set('categoria', state.cat);
    if (state.q) u.searchParams.set('q', state.q);
    if (state.orden !== 'destacados') u.searchParams.set('orden', state.orden);
    history.replaceState(history.state, '', `${u.pathname}${u.search}${u.hash}`);
  }

  function matches(el: HTMLElement) {
    const cats = [el.dataset.cat, ...(el.dataset.tambien || '').split(' ').filter(Boolean)];
    if (state.cat && !cats.includes(state.cat)) return false;
    if (!state.q) return true;
    const texto = el.dataset.texto || '';
    return norm(state.q).split(/\s+/).every((t) => texto.includes(t));
  }

  function ordered() {
    const arr = [...items];
    const es = (a: string, b: string) => a.localeCompare(b, 'es', { sensitivity: 'base' });
    if (state.orden === 'az') arr.sort((a, b) => es(a.dataset.nombre!, b.dataset.nombre!));
    else if (state.orden === 'marca') arr.sort((a, b) => es(a.dataset.marca!, b.dataset.marca!) || es(a.dataset.nombre!, b.dataset.nombre!));
    else arr.sort((a, b) => Number(a.dataset.orden) - Number(b.dataset.orden));
    return arr;
  }

  let first = true;
  function apply() {
    // FLIP: posiciones antes del cambio
    const before = new Map<HTMLElement, DOMRect>();
    if (!first && !reduced) items.forEach((el) => { if (!el.hidden) before.set(el, el.getBoundingClientRect()); });
    let visibles = 0;
    ordered().forEach((el) => {
      list.appendChild(el);
      const on = matches(el);
      el.hidden = !on;
      if (on) visibles++;
    });
    chips.forEach((c) => c.setAttribute('aria-pressed', String((c.dataset.cat || '') === state.cat)));
    count.textContent = visibles === 1 ? '1 equipo' : `${visibles} equipos`;
    empty.hidden = visibles > 0;
    if (!first) syncUrl();
    if (!first && !reduced) {
      items.forEach((el) => {
        if (el.hidden) return;
        const a = before.get(el);
        const b = el.getBoundingClientRect();
        if (a) {
          const dx = a.left - b.left;
          const dy = a.top - b.top;
          if (!dx && !dy) return;
          el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.22, 1, .36, 1)' });
        } else {
          el.animate([{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.22, 1, .36, 1)' });
        }
      });
    }
    first = false;
  }

  chips.forEach((c) => c.addEventListener('click', () => {
    state.cat = c.dataset.cat || '';
    apply();
  }));
  let t = 0;
  input.addEventListener('input', () => {
    clearTimeout(t);
    t = window.setTimeout(() => {
      state.q = input.value.trim().slice(0, 80);
      apply();
      trackSearch(state.q);
    }, 120);
  });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });

  apply();

  // Fila de chips: máscara de desvanecido y flechas solo hacia donde queda contenido por ver
  const rail = root.querySelector<HTMLElement>('[data-rail]');
  const fila = root.querySelector<HTMLElement>('[data-chips]');
  if (rail && fila) {
    let raf = 0;
    const edges = () => {
      raf = 0;
      const max = fila.scrollWidth - fila.clientWidth;
      rail.toggleAttribute('data-at-start', fila.scrollLeft <= 2);
      rail.toggleAttribute('data-at-end', fila.scrollLeft >= max - 2);
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(edges); };
    fila.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    const step = (dir: number) => fila.scrollBy({ left: dir * fila.clientWidth * 0.7, behavior: reduced ? 'auto' : 'smooth' });
    rail.querySelector('[data-rail-prev]')?.addEventListener('click', () => step(-1));
    rail.querySelector('[data-rail-next]')?.addEventListener('click', () => step(1));
    // El chip activo, a la vista (solo desplazamiento horizontal de la fila de chips)
    const activo = fila.querySelector<HTMLElement>('.chip[aria-pressed="true"]');
    if (activo && state.cat) fila.scrollLeft = activo.offsetLeft - fila.clientWidth / 2 + activo.offsetWidth / 2;
    edges();
  }
}
