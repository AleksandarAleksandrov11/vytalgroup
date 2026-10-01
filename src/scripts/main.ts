// VytalGroup · JS común de la web (vanilla, sin librerías).
// Cabecera, desplegable, menú móvil, entradas al hacer scroll, titulares por líneas, parallax, halo,
// botones magnéticos, marquesina, acordeón, segmentados, carruseles, comparador, sección
// sticky de ecografía, línea temporal, mapa, maqueta del catálogo, galería, especificaciones,
// barra móvil, formulario (carga diferida), filtro del catálogo (carga diferida) y eventos del píxel.
// Solo se animan transform, opacity y variables CSS. Con prefers-reduced-motion quedan los fundidos.
import { captureAttribution } from './attribution';
import { initConsent } from './consent';
import { initAnalytics } from './analytics';
import { initTracking, catalogDownload, contact } from './tracking';

const html = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const desktop = matchMedia('(min-width: 900px)');
const $ = <T extends Element = HTMLElement>(s: string, c: ParentNode = document) => c.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, c: ParentNode = document) => [...c.querySelectorAll<T>(s)];
const hasIO = 'IntersectionObserver' in window;
const belowFold = (el: Element) => el.getBoundingClientRect().top > window.innerHeight;

captureAttribution();
initTracking();
initAnalytics();
initConsent();

// ------------------------------------------------------------------ cabecera, progreso de lectura y parallax
const header = $('[data-header]')!;
const readBar = $('[data-read-progress]');
const plx = fine && desktop.matches && !reduced ? $$('[data-parallax]') : [];
const scrollHooks: ((y: number, vh: number) => void)[] = [];
let ticking = false;
function onScroll() {
  const y = window.scrollY;
  const vh = window.innerHeight;
  header.classList.toggle('is-scrolled', y > 8);
  if (readBar) {
    const art = $('[data-article]');
    const top = art ? art.getBoundingClientRect().top + y : 0;
    const len = art ? art.offsetHeight - vh * 0.6 : html.scrollHeight - vh;
    readBar.style.setProperty('--p', String(Math.max(0, Math.min(1, (y - top + vh * 0.2) / Math.max(1, len))).toFixed(4)));
  }
  // Parallax muy leve (6 % del recorrido, máx. 16 px), solo escritorio
  for (const img of plx) {
    const r = img.parentElement!.getBoundingClientRect();
    if (r.bottom < -80 || r.top > vh + 80) continue;
    const off = Math.max(-16, Math.min(16, -(r.top + r.height / 2 - vh / 2) * 0.06));
    img.style.setProperty('--py', `${off.toFixed(1)}px`);
  }
  scrollHooks.forEach((f) => f(y, vh));
  ticking = false;
}
window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
window.addEventListener('resize', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

// ------------------------------------------------------------------ relleno circular desde el cursor
// El círculo crece desde el punto por el que entra el puntero y se recoge hacia el punto por el que sale.
if (fine) {
  const fill = (e: PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--fx', `${(e.clientX - r.left).toFixed(0)}px`);
    el.style.setProperty('--fy', `${(e.clientY - r.top).toFixed(0)}px`);
  };
  $$('[data-fill], .btn--line').forEach((el) => { el.addEventListener('pointerenter', fill); el.addEventListener('pointerleave', fill); });
}

// ------------------------------------------------------------------ punto de la navegación
// Se coloca bajo la sección actual y viaja hasta el enlace señalado con el ratón o el teclado.
const navList = $('[data-nav]');
const dot = $('[data-nav-dot]');
if (navList && dot) {
  const links = $$<HTMLElement>('.hd__link', navList);
  const activo = $('.hd__item.is-active .hd__link', navList);
  const ir = (el: HTMLElement | null) => {
    if (!el || !desktop.matches) { dot.classList.remove('is-on'); return; }
    const base = navList.getBoundingClientRect().left;
    const r = el.getBoundingClientRect();
    dot.style.setProperty('--dx', `${(r.left - base + r.width / 2).toFixed(1)}px`);
    dot.classList.add('is-on');
  };
  links.forEach((l) => {
    l.addEventListener('pointerenter', () => ir(l));
    l.addEventListener('focus', () => ir(l));
  });
  navList.addEventListener('pointerleave', () => ir(activo));
  navList.addEventListener('focusout', (e) => { if (!navList.contains(e.relatedTarget as Node)) ir(activo); });
  const colocar = () => { dot.style.transition = 'none'; ir(activo); dot.getBoundingClientRect(); dot.style.transition = ''; };
  if (document.fonts?.ready) document.fonts.ready.then(colocar); else colocar();
  window.addEventListener('resize', colocar, { passive: true });
}

// ------------------------------------------------------------------ desplegable de Equipos
const ddBtn = $<HTMLButtonElement>('[data-dropdown-btn]');
const dd = $('[data-dropdown]');
if (ddBtn && dd) {
  let closeT = 0;
  let openT = 0;
  const isOpen = () => ddBtn.getAttribute('aria-expanded') === 'true';
  const open = (focusFirst = false) => {
    clearTimeout(closeT);
    if (isOpen()) return;
    dd.hidden = false;
    dd.classList.remove('is-closing');
    dd.classList.add('is-open');
    ddBtn.setAttribute('aria-expanded', 'true');
    header.classList.add('is-open');
    if (focusFirst) $<HTMLAnchorElement>('a', dd)?.focus();
  };
  const close = (focusBtn = false) => {
    if (!isOpen()) return;
    ddBtn.setAttribute('aria-expanded', 'false');
    header.classList.remove('is-open');
    dd.classList.remove('is-open');
    if (reduced) { dd.hidden = true; } else {
      dd.classList.add('is-closing');
      closeT = window.setTimeout(() => { dd.hidden = true; dd.classList.remove('is-closing'); }, 240);
    }
    if (focusBtn) ddBtn.focus();
  };
  ddBtn.addEventListener('click', () => (isOpen() ? close() : open()));
  ddBtn.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); open(true); } });
  dd.addEventListener('keydown', (e) => {
    const links = $$<HTMLAnchorElement>('a', dd);
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === 'Escape') { e.preventDefault(); close(true); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); links[(i + 1) % links.length].focus(); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) close(true); });
  document.addEventListener('pointerdown', (e) => { if (isOpen() && !(e.target as Element).closest('.hd__item')) close(); });
  ddBtn.parentElement!.addEventListener('focusout', (e) => {
    const next = e.relatedTarget as Node | null;
    if (next && !ddBtn.parentElement!.contains(next)) close();
  });
  if (fine) {
    const item = ddBtn.parentElement!;
    item.addEventListener('pointerenter', () => { clearTimeout(closeT); openT = window.setTimeout(() => open(), 120); });
    item.addEventListener('pointerleave', () => { clearTimeout(openT); closeT = window.setTimeout(() => close(), 220); });
  }
}

// ------------------------------------------------------------------ menú móvil (panel de color)
// Se revela en círculo desde el botón; "Ecógrafos", "Diatermias" y "Equipos" son desplegables propios.
const menuBtn = $<HTMLButtonElement>('[data-menu-btn]');
const menu = $('[data-menu]');
if (menuBtn && menu) {
  let endT = 0;
  const accs = $$<HTMLButtonElement>('[data-mm-acc]', menu);
  const setAcc = (btn: HTMLButtonElement, open: boolean) => {
    const sub = document.getElementById(btn.getAttribute('aria-controls')!)!;
    btn.setAttribute('aria-expanded', String(open));
    sub.classList.toggle('is-open', open);
    sub.toggleAttribute('inert', !open);
  };
  accs.forEach((b) => b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') !== 'true';
    accs.forEach((o) => { if (o !== b) setAcc(o, false); });
    setAcc(b, open);
  }));
  const focusables = () => [menuBtn, ...$$<HTMLElement>('a, button', menu).filter((el) => !el.closest('[inert]'))];
  const origen = () => {
    const r = menuBtn.getBoundingClientRect();
    menu.style.setProperty('--ox', `${(r.left + r.width / 2).toFixed(0)}px`);
    menu.style.setProperty('--oy', `${(r.top + r.height / 2 - header.offsetHeight).toFixed(0)}px`);
  };
  const open = () => {
    clearTimeout(endT);
    origen();
    menu.hidden = false;
    menu.classList.remove('is-closing');
    menu.classList.add('is-open');
    menu.scrollTop = 0;
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Cerrar el menú');
    html.classList.add('menu-open');
    header.classList.add('is-open');
    setTimeout(() => $<HTMLElement>('.mm__link', menu)?.focus({ preventScroll: true }), 80);
  };
  const close = (focus = true) => {
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Abrir el menú');
    html.classList.remove('menu-open');
    header.classList.remove('is-open');
    const end = () => { menu.hidden = true; menu.classList.remove('is-open', 'is-closing'); accs.forEach((b) => setAcc(b, false)); };
    if (reduced) end(); else { origen(); menu.classList.add('is-closing'); endT = window.setTimeout(end, 430); }
    if (focus) menuBtn.focus({ preventScroll: true });
  };
  menuBtn.addEventListener('click', () => (menu.hidden || menu.classList.contains('is-closing') ? open() : close()));
  menu.addEventListener('click', (e) => { if ((e.target as Element).closest('a')) close(false); });
  document.addEventListener('keydown', (e) => {
    if (menu.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    const f = focusables();
    const i = f.indexOf(document.activeElement as HTMLElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  });
  matchMedia('(min-width: 1180px)').addEventListener('change', (e) => { if (e.matches && !menu.hidden) close(false); });
}

// ------------------------------------------------------------------ entradas al hacer scroll
// Solo se preparan los elementos por debajo de la primera pantalla: nada parpadea al cargar.
const reveal = hasIO ? new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    reveal!.unobserve(e.target);
  });
}, { rootMargin: '0px 0px -8% 0px' }) : null;

// Titulares de sección: se parten en palabras y cada línea sube dentro de su máscara
function splitWords(el: HTMLElement) {
  const walk = (node: Node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 1) { walk(n); return; }
      if (n.nodeType !== 3 || !n.textContent!.trim()) return;
      const frag = document.createDocumentFragment();
      n.textContent!.split(/(\s+)/).forEach((t) => {
        if (!t) return;
        if (!t.trim()) { frag.appendChild(document.createTextNode(t)); return; }
        const w = document.createElement('span');
        const inner = document.createElement('span');
        w.className = 'w';
        inner.textContent = t;
        w.appendChild(inner);
        frag.appendChild(w);
      });
      (n as ChildNode).replaceWith(frag);
    });
  };
  walk(el);
  el.classList.add('is-split');
}
// Número de línea de cada palabra: se miden todas las palabras de todos los titulares de una vez y
// después se escribe, para forzar un solo cálculo de layout
function numberLines(els: HTMLElement[]) {
  const words = els.map((el) => $$('.w', el));
  const tops = words.map((ws) => ws.map((w) => w.getBoundingClientRect().top));
  words.forEach((ws, k) => {
    let line = -1;
    let top: number | null = null;
    ws.forEach((w, j) => {
      const t = tops[k][j];
      if (top === null || Math.abs(t - top) > 6) { line++; top = t; }
      w.style.setProperty('--i', String(line));
    });
  });
}

if (reveal && !reduced) {
  // Primero se lee dónde está cada elemento y después se escribe (clases y variables)
  const rv = $$('[data-rv]');
  const lines = $$<HTMLElement>('[data-lines]');
  const rvi = $$('[data-rvi]');
  const bajo = new Set([...rv, ...lines, ...rvi].filter(belowFold));
  const groups = new Map<Element, number>();
  rv.forEach((el) => {
    if (!bajo.has(el)) return;
    const parent = el.closest('section') || document.body;
    const i = groups.get(parent) || 0;
    groups.set(parent, i + 1);
    if (!el.style.getPropertyValue('--rd')) el.style.setProperty('--rd', `${Math.min(i, 4) * 70}ms`);
    el.classList.add('rv');
    reveal.observe(el);
  });
  const partir = lines.filter((el) => bajo.has(el));
  partir.forEach(splitWords);
  numberLines(partir);
  partir.forEach((el) => reveal.observe(el));
  // Imágenes de tarjeta: fundido y escala de 0,96 a 1, escalonadas dentro de su rejilla
  rvi.forEach((el) => {
    if (!bajo.has(el)) return;
    const li = el.closest('li');
    const i = li ? [...li.parentElement!.children].indexOf(li) : 0;
    el.style.setProperty('--rd', `${(i % 3) * 90 + 100}ms`);
    el.classList.add('rvi');
    reveal.observe(el);
  });
}

// ------------------------------------------------------------------ tarjetas de producto: toda la tarjeta es clicable
document.addEventListener('click', (e) => {
  const t = e.target as Element;
  const card = t.closest<HTMLElement>('.pc');
  if (!card || t.closest('a, button, input, select, textarea, summary') || (e as MouseEvent).button !== 0) return;
  if (getSelection()?.toString()) return;
  const cta = $<HTMLAnchorElement>('.pc__cta', card);
  if (!cta) return;
  if ((e as MouseEvent).metaKey || (e as MouseEvent).ctrlKey) window.open(cta.href, '_blank', 'noopener');
  else cta.click();
});

// ------------------------------------------------------------------ halo de luz y tarjetas en 3D (escritorio)
// [data-halo]: un brillo sigue al cursor. [data-tilt]: además la tarjeta se inclina hacia el cursor
// (máx. 7°) y vuelve suave a su sitio al salir.
if (fine && !reduced) {
  let raf = 0;
  let last: HTMLElement | null = null;
  const reset = (c: HTMLElement) => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); c.classList.remove('is-tilt'); };
  document.addEventListener('pointermove', (e) => {
    const card = (e.target as Element).closest<HTMLElement>('[data-halo], [data-tilt]');
    if (last && last !== card && last.hasAttribute('data-tilt')) reset(last);
    last = card;
    if (!card) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      card.style.setProperty('--hx', `${Math.round(x)}px`);
      card.style.setProperty('--hy', `${Math.round(y)}px`);
      if (card.hasAttribute('data-tilt')) {
        card.classList.add('is-tilt');
        card.style.setProperty('--rx', `${((0.5 - y / r.height) * 7).toFixed(2)}deg`);
        card.style.setProperty('--ry', `${((x / r.width - 0.5) * 9).toFixed(2)}deg`);
      }
    });
  }, { passive: true });
  document.addEventListener('pointerleave', () => { if (last?.hasAttribute('data-tilt')) reset(last); last = null; });
}

// ------------------------------------------------------------------ botones magnéticos (escritorio)
if (fine && !reduced) {
  $$('[data-magnetic]').forEach((btn) => {
    const zone = btn.parentElement!;
    const reset = () => { btn.style.removeProperty('--mx'); btn.style.removeProperty('--my'); };
    zone.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) > 140) { reset(); return; }
      btn.style.setProperty('--mx', `${(dx * 0.12).toFixed(1)}px`);
      btn.style.setProperty('--my', `${(dy * 0.18).toFixed(1)}px`);
    }, { passive: true });
    zone.addEventListener('pointerleave', reset);
  });
}

// ------------------------------------------------------------------ marquesinas: en pausa fuera de pantalla
if (hasIO) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle('is-paused', !e.isIntersecting));
  });
  $$('[data-marquee]').forEach((el) => io.observe(el));
}

// ------------------------------------------------------------------ acordeones (FLIP: solo transform)
$$('[data-acc]').forEach((acc) => {
  const after = (item: Element) => {
    const list: HTMLElement[] = [];
    let n = item.nextElementSibling;
    while (n) { list.push(n as HTMLElement); n = n.nextElementSibling; }
    let sec = acc.nextElementSibling;
    while (sec) { list.push(sec as HTMLElement); sec = sec.nextElementSibling; }
    let s = acc.closest('section')?.nextElementSibling;
    while (s) { list.push(s as HTMLElement); s = s.nextElementSibling; }
    const ft = $('.ft');
    if (ft) list.push(ft);
    return list;
  };
  const slide = (els: HTMLElement[], dy: number) => {
    if (reduced || !dy) return;
    els.forEach((el) => { el.style.transition = 'none'; el.style.transform = `translateY(${dy}px)`; });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      els.forEach((el) => { el.style.transition = 'transform .5s cubic-bezier(.22, 1, .36, 1)'; el.style.transform = ''; });
    }));
    setTimeout(() => els.forEach((el) => { el.style.transition = ''; }), 650);
  };
  acc.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('.acc__btn');
    if (!btn) return;
    const item = btn.closest('.acc__item')!;
    const panel = document.getElementById(btn.getAttribute('aria-controls')!)!;
    const open = btn.getAttribute('aria-expanded') !== 'true';
    const els = after(item);
    const before = item.getBoundingClientRect().height;
    btn.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    panel.classList.toggle('is-opening', open);
    slide(els, before - item.getBoundingClientRect().height);
  });
});

// ------------------------------------------------------------------ controles segmentados (pestañas)
$$('[data-seg]').forEach((seg) => {
  const tabs = $$<HTMLButtonElement>('[role="tab"]', seg);
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')!)!);
  let current = Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
  const select = (i: number, focus = false) => {
    if (i !== current) {
      const dir = i > current ? 1 : -1;
      const next = panels[i];
      next.classList.add('no-anim');
      next.style.setProperty('--off', `${dir * 28}px`);
      void next.offsetWidth;
      next.classList.remove('no-anim');
      panels[current].style.setProperty('--off', `${-dir * 28}px`);
    }
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[j].classList.toggle('is-active', on);
      panels[j].toggleAttribute('inert', !on);
    });
    seg.style.setProperty('--seg-i', String(i));
    seg.dataset.active = String(i);
    current = i;
    const rail = $('[data-rail]', panels[i]);
    if (rail) rail.scrollLeft = 0;
    if (focus) tabs[i].focus();
  };
  // Enlace directo a una pestaña (/ecografos#gama-portatil)
  const porHash = () => { const k = tabs.findIndex((t) => `#${t.id}` === location.hash); if (k >= 0) select(k); };
  porHash();
  window.addEventListener('hashchange', porHash);
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', (e) => {
      const k = ({ ArrowRight: 1, ArrowLeft: -1, Home: -99, End: 99 } as Record<string, number>)[e.key];
      if (k === undefined) return;
      e.preventDefault();
      const n = k === -99 ? 0 : k === 99 ? tabs.length - 1 : (i + k + tabs.length) % tabs.length;
      select(n, true);
    });
  });
});

// ------------------------------------------------------------------ carruseles con scroll-snap: puntos
$$('[data-rail]').forEach((track) => {
  const items = [...track.children] as HTMLElement[];
  const dots = $$('.dots span', track.closest('[role="tabpanel"]') || track.parentElement!);
  if (!dots.length) return;
  const mid = (el: Element) => { const r = el.getBoundingClientRect(); return r.left + r.width / 2; };
  let raf = 0;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const c = mid(track);
      let best = 0;
      items.forEach((it, i) => { if (Math.abs(mid(it) - c) < Math.abs(mid(items[best]) - c)) best = i; });
      dots.forEach((d, i) => d.classList.toggle('is-on', i === best));
    });
  }, { passive: true });
});

// ------------------------------------------------------------------ carruseles con flechas (toda la gama)
$$('[data-carousel]').forEach((box) => {
  const track = $('[data-rail]', box)!;
  const prev = $<HTMLButtonElement>('[data-prev]', box);
  const next = $<HTMLButtonElement>('[data-next]', box);
  if (!prev || !next) return;
  const paso = () => { const li = track.firstElementChild as HTMLElement; return li ? li.getBoundingClientRect().width + 20 : track.clientWidth; };
  const estado = () => {
    const max = track.scrollWidth - track.clientWidth - 4;
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft >= max;
    track.toggleAttribute('data-at-end', track.scrollLeft >= max);
    const img = $('.pc__media', track);
    if (img) box.style.setProperty('--w-img', `${(img.getBoundingClientRect().height / 2 + 18).toFixed(0)}px`);
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -paso(), behavior: reduced ? 'auto' : 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: paso(), behavior: reduced ? 'auto' : 'smooth' }));
  track.addEventListener('scroll', () => requestAnimationFrame(estado), { passive: true });
  window.addEventListener('resize', estado, { passive: true });
  estado();
});

// ------------------------------------------------------------------ comparador: filas una a una y checks que se dibujan
$$('[data-cmp]').forEach((cmp) => {
  if (!hasIO || reduced || !belowFold(cmp)) return;
  cmp.classList.add('is-armed');
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    cmp.classList.add('is-in');
  }, { threshold: 0.35 });
  io.observe(cmp);
});

// ------------------------------------------------------------------ ecografía en profundidad (sticky)
// El producto queda fijo mientras cambian los tres mensajes; la imagen cambia con un fundido.
const sticky = $('[data-sticky-eco]');
if (sticky && hasIO) {
  const steps = $$('[data-step]', sticky);
  const shots = $$('[data-shot]', sticky);
  const bars = $$('[data-bar]', sticky);
  const setActive = (i: number) => {
    steps.forEach((s, j) => s.classList.toggle('is-active', j === i));
    shots.forEach((s, j) => s.classList.toggle('is-active', j === i));
    bars.forEach((s, j) => s.classList.toggle('is-active', j === i));
    sticky.style.setProperty('--step', String(i));
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setActive(steps.indexOf(e.target as HTMLElement)); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach((s) => io.observe(s));
}

// ------------------------------------------------------------------ línea temporal que se dibuja con el scroll
$$('[data-timeline]').forEach((tl) => {
  const steps = $$('[data-tl-step]', tl);
  if (reduced) { tl.style.setProperty('--tl', '1'); steps.forEach((s) => s.classList.add('is-on')); return; }
  scrollHooks.push((_y, vh) => {
    const r = tl.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const p = Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height * 0.9)));
    tl.style.setProperty('--tl', p.toFixed(3));
    steps.forEach((s, i) => s.classList.toggle('is-on', p >= (i / Math.max(1, steps.length - 1)) * 0.92));
  });
});

// ------------------------------------------------------------------ mapa: puntos que se encienden en secuencia
$$('[data-map]').forEach((map) => {
  if (!hasIO || reduced) { map.classList.add('is-on'); return; }
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); map.classList.add('is-on'); } }, { threshold: 0.3 });
  io.observe(map);
});

// ------------------------------------------------------------------ maqueta 3D del catálogo: abanico e inclinación
$$('[data-mockup]').forEach((m) => {
  if (!hasIO || reduced) { m.classList.add('is-open'); return; }
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); m.classList.add('is-open'); } }, { threshold: 0.35 });
  io.observe(m);
  if (!fine) return;
  let raf = 0;
  const zone = m.closest('section') || m;
  zone.addEventListener('pointermove', (e) => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = m.getBoundingClientRect();
      const x = ((e as PointerEvent).clientX - (r.left + r.width / 2)) / r.width;
      const y = ((e as PointerEvent).clientY - (r.top + r.height / 2)) / r.height;
      m.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`);
      m.style.setProperty('--ry', `${(x * 12).toFixed(2)}deg`);
    });
  }, { passive: true });
  zone.addEventListener('pointerleave', () => { m.style.removeProperty('--rx'); m.style.removeProperty('--ry'); });
});

// ------------------------------------------------------------------ galería de producto: miniaturas y zoom
$$('[data-gallery]').forEach((g) => {
  const slides = $$('[data-slide]', g);
  const thumbs = $$<HTMLButtonElement>('[data-thumb]', g);
  const dialog = $<HTMLDialogElement>('[data-zoom]', g);
  let current = 0;
  const show = (i: number) => {
    current = i;
    slides.forEach((s, j) => { s.classList.toggle('is-active', j === i); s.toggleAttribute('inert', j !== i); });
    thumbs.forEach((t, j) => t.setAttribute('aria-pressed', String(j === i)));
  };
  thumbs.forEach((t, i) => t.addEventListener('click', () => show(i)));
  // Lupa en escritorio: la imagen se amplía donde está el cursor
  if (fine && !reduced) {
    slides.forEach((s) => {
      const img = $<HTMLImageElement>('img', s);
      if (!img) return;
      s.addEventListener('pointermove', (e) => {
        const r = s.getBoundingClientRect();
        img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
      }, { passive: true });
    });
  }
  if (dialog) {
    const zimg = $<HTMLImageElement>('img', dialog)!;
    g.addEventListener('click', (e) => {
      const open = (e.target as Element).closest('[data-zoom-open]');
      if (!open) return;
      const img = $<HTMLImageElement>('img', slides[current])!;
      zimg.src = img.currentSrc || img.src;
      zimg.alt = img.alt;
      dialog.showModal();
    });
    dialog.addEventListener('click', () => dialog.close());
  }
});

// ------------------------------------------------------------------ especificaciones: "Ver todas"
$$('[data-specs]').forEach((box) => {
  const btn = $<HTMLButtonElement>('[data-specs-btn]', box);
  if (!btn) return;
  box.classList.add('is-collapsed');
  btn.hidden = false;
  btn.addEventListener('click', () => {
    const open = box.classList.toggle('is-collapsed') === false;
    btn.setAttribute('aria-expanded', String(open));
    btn.firstChild!.textContent = open ? 'Ver menos' : 'Ver todas';
  });
});

// ------------------------------------------------------------------ formulario (carga diferida)
let formMod: Promise<typeof import('./form')> | null = null;
const loadForm = () => {
  if (!formMod) formMod = import('./form').then((m) => { m.initForm(); return m; });
  return formMod;
};
const formSec = $('#asesoramiento');
if (formSec) {
  if (hasIO) {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); loadForm(); } }, { rootMargin: '900px 0px' });
    io.observe(formSec);
  } else loadForm();
  ['pointerdown', 'focusin'].forEach((ev) => formSec.addEventListener(ev, loadForm, { once: true }));
}

// Enlaces internos: desplazamiento suave solo en saltos cortos; en los largos (de una tarjeta al
// formulario) se va directo, porque un scroll suave de miles de píxeles en un móvil modesto tarda.
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
  if (!a || e.defaultPrevented || a.getAttribute('href')!.length < 2) return;
  const target = document.getElementById(a.getAttribute('href')!.slice(1));
  if (!target) return;
  e.preventDefault();
  const dist = Math.abs(target.getBoundingClientRect().top);
  target.scrollIntoView({ behavior: reduced || dist > window.innerHeight * 1.5 ? 'instant' as ScrollBehavior : 'smooth', block: 'start' });
  history.replaceState(null, '', a.getAttribute('href'));
  // El foco acompaña al salto (teclado y lectores de pantalla); el formulario gestiona el suyo
  if (target !== formSec) {
    if (!target.matches('a[href], button, input, select, textarea, [tabindex]')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
});
function afterScroll(fn: () => void) {
  let done = false;
  const go = () => { if (!done) { done = true; fn(); } };
  if ('onscrollend' in window) window.addEventListener('scrollend', go, { once: true });
  setTimeout(go, 900);
}
document.addEventListener('click', (e) => {
  const t = e.target as Element;
  const want = t.closest<HTMLElement>('[data-want]');
  const cta = t.closest('[data-cta], [data-want], a[href="#asesoramiento"]');
  if (!cta || !formSec) return;
  const mod = loadForm();
  if (want) mod.then((m) => m.preselect(want.dataset.want || '', want.dataset.equipo || '', want.dataset.otro || ''));
  afterScroll(() => mod.then((m) => m.focusForm()));
});
// Llegada con #asesoramiento en la URL (desde otra página)
if (formSec && location.hash === '#asesoramiento') loadForm();

// ------------------------------------------------------------------ barra fija en móvil
// Aparece al pasar el hero (o la primera pantalla) y se oculta con el formulario en pantalla.
const bar = $('[data-mbar]');
if (bar) {
  const hero = $('[data-hero]');
  const vis = { hero: true, form: false, wa: false };
  const paint = () => {
    const on = !vis.hero && !vis.form;
    bar.classList.toggle('is-on', on);
    // El botón flotante de WhatsApp sube encima de la barra mientras se ve
    document.documentElement.classList.toggle('mbar-on', on && matchMedia('(max-width: 899px)').matches);
    bar.inert = !on;
  };
  if (hasIO) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.target === hero) vis.hero = e.isIntersecting;
        else if (e.target === formSec) vis.form = e.isIntersecting;
      });
      paint();
    }, { rootMargin: '0px 0px -12% 0px' });
    if (hero) io.observe(hero); else scrollHooks.push((y, vh) => { const h = y < vh * 0.5; if (h !== vis.hero) { vis.hero = h; paint(); } });
    if (formSec) io.observe(formSec);
  }
}

// ------------------------------------------------------------------ catálogo: filtros (carga diferida)
if ($('[data-catalogo]')) import('./catalogo').then((m) => m.initCatalogo());

// ------------------------------------------------------------------ guías: índice abierto en escritorio y sección activa
const toc = $('[data-toc]');
if (toc) {
  const det = toc.querySelector('details');
  const desk = matchMedia('(min-width: 1100px)');
  const sync = () => { if (det) det.open = desk.matches; };
  sync();
  desk.addEventListener('change', sync);
  const links = [...toc.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  const pares = links.map((a) => ({ a, h: document.getElementById(decodeURIComponent(a.hash.slice(1))) })).filter((x): x is { a: HTMLAnchorElement; h: HTMLElement } => !!x.h);
  const secs = pares.map((x) => x.h);
  if (hasIO && secs.length) {
    const visibles = new Set<Element>();
    const marcar = () => {
      const activo = secs.find((s) => visibles.has(s)) || secs.filter((s) => s.getBoundingClientRect().top < 0).pop();
      pares.forEach(({ a, h }) => { if (h === activo) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    };
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? visibles.add(e.target) : visibles.delete(e.target)));
      marcar();
    }, { rootMargin: '-15% 0px -70% 0px' });
    secs.forEach((s) => io.observe(s));
  }
  // En móvil, al elegir un apartado el índice se cierra
  links.forEach((a) => a.addEventListener('click', () => { if (det && !desk.matches) det.open = false; }));
}

// ------------------------------------------------------------------ nombre animado del pie
const word = $('[data-word]');
if (word && hasIO && !reduced && word.getBoundingClientRect().top >= window.innerHeight) {
  word.classList.add('is-armed');
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); word.classList.add('is-in'); } }, { threshold: 0.35 });
  io.observe(word);
}

// ------------------------------------------------------------------ eventos del píxel
document.addEventListener('click', (e) => {
  const t = e.target as Element;
  const cat = t.closest<HTMLElement>('[data-catalog]');
  if (cat) catalogDownload(cat.dataset.origen || location.pathname);
  const a = t.closest<HTMLAnchorElement>('a[href^="https://wa.me"], a[href^="tel:"], a[href^="mailto:"]');
  if (a) {
    const href = a.getAttribute('href')!;
    const canal = href.startsWith('tel:') ? 'Teléfono' : href.startsWith('mailto:') ? 'Email' : 'WhatsApp';
    contact(canal, a.dataset.origen || location.pathname);
  }
});

html.classList.add('js');
requestAnimationFrame(onScroll);
