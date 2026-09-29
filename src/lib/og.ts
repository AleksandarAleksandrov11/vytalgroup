// Imágenes Open Graph (1200 × 630, JPG) generadas en el build con satori y resvg.
// Mismo ADN que la web: fondo marino, titular en Geist con el acento en Instrument Serif cursiva
// y, a la derecha, el producto sobre una tarjeta blanca o una foto.
import { readFileSync, existsSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const ROOT = process.cwd();
const nm = (p: string) => readFileSync(join(ROOT, 'node_modules', p));
const FONTS = [
  { name: 'Geist', data: nm('@fontsource/geist/files/geist-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Geist', data: nm('@fontsource/geist/files/geist-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
  { name: 'Geist', data: nm('@fontsource/geist/files/geist-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
  { name: 'Serif', data: nm('@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff'), weight: 400 as const, style: 'italic' as const },
];

type Nodo = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Nodo => ({ type, props: { style, children, ...extra } });

// Logotipo en versión para fondo oscuro, rasterizado una vez desde el sprite de la web
let logoCache = '';
function logo() {
  if (logoCache) return logoCache;
  const sprite = readFileSync(join(ROOT, 'src/components/Sprite.astro'), 'utf8');
  const sym = sprite.match(/<symbol id="logo" viewBox="0 0 1117 171">([\s\S]*?)<\/symbol>/)![1]
    .replace('class="lg-m"', 'fill="url(#g)"').replace(/class="lg-a"/g, 'fill="#FFFFFF"').replace(/class="lg-b"/g, 'fill="#5CC8C8"');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1117 171" width="1117" height="171"><defs><linearGradient id="g" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#2F7BD0"/><stop offset=".55" stop-color="#3FA8C8"/><stop offset="1" stop-color="#5CC8C8"/></linearGradient></defs>${sym}</svg>`;
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 480 } }).render().asPng();
  logoCache = `data:image/png;base64,${Buffer.from(png).toString('base64')}`;
  return logoCache;
}

function archivo(nombre: string) {
  if (nombre.startsWith('fotos/')) return join(ROOT, 'src/assets', `${nombre}.webp`);
  for (const ext of ['png', 'webp', 'jpg']) {
    const f = join(ROOT, 'src/assets/productos', `${nombre}.${ext}`);
    if (existsSync(f)) return f;
  }
  throw new Error(`OG: no encuentro la imagen ${nombre}`);
}

async function dataUri(nombre: string, w: number, hh: number, fit: 'contain' | 'cover') {
  const buf = await sharp(archivo(nombre)).resize({ width: w, height: hh, fit, background: '#FFFFFF', position: 'attention' }).flatten({ background: '#FFFFFF' }).png().toBuffer();
  return `data:image/png;base64,${buf.toString('base64')}`;
}

/** Titular con acento: "Texto *acento.*" → palabras (el acento en cursiva turquesa) */
function titular(texto: string, size: number) {
  const partes = texto.split(/(\*[^*]+\*)/).filter(Boolean);
  const palabras: Nodo[] = [];
  for (const p of partes) {
    const acento = p.startsWith('*');
    for (const w of p.replace(/\*/g, '').split(/\s+/).filter(Boolean)) {
      palabras.push(h('span', acento
        ? { fontFamily: 'Serif', fontStyle: 'italic', fontWeight: 400, fontSize: size * 1.1, color: '#7FD3D6', letterSpacing: '-0.01em', lineHeight: 1 }
        : { fontFamily: 'Geist', fontWeight: 600, fontSize: size, color: '#FFFFFF', letterSpacing: '-0.035em', lineHeight: 1 }, w));
    }
  }
  return h('div', { display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: size * 0.26, rowGap: size * 0.12 }, palabras);
}

export interface OgDatos { kicker: string; titulo: string; sub?: string; imagen?: string; foto?: boolean }

// Caché en disco: si no cambian los datos, la imagen ni este archivo, se reutiliza la JPG ya generada
const CACHE = join(ROOT, 'node_modules/.cache/vg-og');
function clave(d: OgDatos) {
  const h = createHash('sha1').update(JSON.stringify(d)).update(readFileSync(join(ROOT, 'src/lib/og.ts')));
  if (d.imagen) h.update(String(statSync(archivo(d.imagen)).mtimeMs));
  return h.digest('hex');
}

export async function ogJpg(d: OgDatos) {
  const k = clave(d);
  const f = join(CACHE, `${k}.jpg`);
  if (existsSync(f)) return readFileSync(f);
  const jpg = await generar(d);
  try { mkdirSync(CACHE, { recursive: true }); writeFileSync(f, jpg); } catch { /* sin caché, no pasa nada */ }
  return jpg;
}

async function generar(d: OgDatos) {
  const con = !!d.imagen;
  const plano = d.titulo.replace(/\*/g, '');
  const size = plano.length <= 22 ? 72 : plano.length <= 40 ? 62 : 52;
  const izq = h('div', { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, height: '100%', paddingRight: con ? 48 : 0 }, [
    h('img', { width: 236, height: 36 }, undefined, { src: logo(), width: 236, height: 36 }),
    h('div', { display: 'flex', flexDirection: 'column', gap: 22 }, [
      h('div', { display: 'flex', fontFamily: 'Geist', fontWeight: 500, fontSize: 20, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7FD3D6' }, d.kicker),
      titular(d.titulo, size),
      d.sub ? h('div', { display: 'flex', fontFamily: 'Geist', fontWeight: 400, fontSize: 26, lineHeight: 1.4, color: 'rgba(255,255,255,0.74)', maxWidth: con ? 560 : 900 }, d.sub) : null,
    ].filter(Boolean)),
    h('div', { display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'Geist', fontWeight: 500, fontSize: 20, color: 'rgba(255,255,255,0.6)' }, [
      h('div', { display: 'flex', width: 10, height: 10, borderRadius: 10, backgroundColor: '#48A0A8' }),
      h('div', { display: 'flex' }, 'vytalgroup.com · Te asesoran fisioterapeutas'),
    ]),
  ]);
  const hijos: Nodo[] = [izq];
  if (d.imagen) {
    const src = await dataUri(d.imagen, 880, 944, d.foto ? 'cover' : 'contain');
    hijos.push(h('div', { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 440, height: 472, borderRadius: 32, overflow: 'hidden', backgroundColor: '#FFFFFF', padding: d.foto ? 0 : 8 }, [
      h('img', { width: d.foto ? 440 : 424, height: d.foto ? 472 : 456, objectFit: d.foto ? 'cover' : 'contain' }, undefined, { src, width: d.foto ? 440 : 424, height: d.foto ? 472 : 456 }),
    ]));
  }
  const root = h('div', {
    display: 'flex', width: 1200, height: 630, padding: '72px 72px 64px', alignItems: 'center',
    backgroundColor: '#0B1929',
    backgroundImage: 'radial-gradient(circle at 78% 30%, rgba(72,160,168,0.28), rgba(11,25,41,0) 55%), radial-gradient(circle at 0% 100%, rgba(47,123,208,0.18), rgba(11,25,41,0) 50%)',
  }, hijos);
  const svg = await satori(root as never, { width: 1200, height: 630, fonts: FONTS });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return sharp(png).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
}
