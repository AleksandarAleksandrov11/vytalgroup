// Único origen de datos de producto: todas las páginas, tarjetas, sitemap, llms.txt y JSON-LD
// salen de aquí. Para añadir un equipo, añádelo a su archivo (ecografia.ts, diatermia.ts,
// fisioterapia.ts o camillas-estetica.ts) con su imagen en src/assets/productos.
import type { Producto } from '../tipos';
import { CAT, type CategoriaId } from '../categorias';
import { ECOGRAFIA, ECOGRAFIA_EDAN } from './ecografia';
import { DIATERMIA } from './diatermia';
import { FISIOTERAPIA } from './fisioterapia';
import { CAMILLAS, ESTETICA } from './camillas-estetica';

export type { Producto };

export const PRODUCTOS: Producto[] = [
  ...ECOGRAFIA,
  ...DIATERMIA,
  ...FISIOTERAPIA,
  ...CAMILLAS,
  ...ESTETICA,
  ...ECOGRAFIA_EDAN,
].sort((a, b) => a.orden - b.orden);

const POR_SLUG = new Map(PRODUCTOS.map((p) => [p.slug, p]));
export const producto = (slug: string) => {
  const p = POR_SLUG.get(slug);
  if (!p) throw new Error(`Producto desconocido: ${slug}`);
  return p;
};

/** URL de la ficha: /ecografos/x, /diatermias/x o /equipos/[categoria]/x */
export function urlFicha(p: Producto): string | null {
  return p.ficha ? `${CAT[p.categoria].ruta}/${p.slug}` : null;
}

/** Productos de una categoría (incluye los que "también" aparecen en ella) */
export const deCategoria = (id: CategoriaId) =>
  PRODUCTOS.filter((p) => p.categoria === id || p.tambienEn?.includes(id));

/** Relacionados: los indicados y, si faltan, de la misma categoría */
export function relacionados(p: Producto, n = 3): Producto[] {
  const out = p.relacionados.map(producto).filter((r) => r.ficha);
  for (const r of deCategoria(p.categoria)) {
    if (out.length >= n) break;
    if (r.slug !== p.slug && r.ficha && !out.includes(r)) out.push(r);
  }
  return out.slice(0, n);
}

/** Texto para el formulario y WhatsApp: "Acclarix AX8 (EDAN)" */
export const etiquetaModelo = (p: Producto) => `${p.nombre} (${p.marca})`;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Alt descriptivo con modelo y tipo de equipo, sin relleno */
export const altProducto = (p: Producto, extra = '') => {
  // Si el nombre ya empieza por el tipo ("Camilla Eléctrica Estándar"), no se repite
  const nucleo = p.tipo.split(' ')[0].toLowerCase();
  const base = p.nombre.toLowerCase().startsWith(nucleo) ? `${p.nombre} de ${p.marca}` : `${cap(p.tipo)} ${p.nombre} de ${p.marca}`;
  return `${base}${extra ? `, ${extra}` : ''}`;
};

/** Título SEO (50 a 60 caracteres): el del dato o una plantilla cuidada */
export function seoTitle(p: Producto): string {
  if (p.seoTitle) return p.seoTitle;
  const opciones = [
    `${p.nombre} de ${p.marca}, ${p.tipo} | VytalGroup`,
    `${p.nombre} de ${p.marca}: ${p.tipo} para tu clínica`,
    `${p.nombre}, ${p.tipo} de ${p.marca} | VytalGroup`,
    `${p.nombre} de ${p.marca} | ${cap(p.tipo)}`,
  ];
  return opciones.find((t) => t.length >= 50 && t.length <= 60) ?? opciones[0];
}

/** Descripción SEO (140 a 160 caracteres) */
export function seoDescription(p: Producto): string {
  if (p.seoDescription) return p.seoDescription;
  const resumen = p.resumen.replace(/\.$/, '');
  // Minúscula inicial salvo nombres propios y siglas (Doppler, EDAN, TENS...)
  const r0 = /^([A-ZÁÉÍÓÚ]{2,}|Doppler)\b/.test(resumen) ? resumen : resumen.charAt(0).toLowerCase() + resumen.slice(1);
  const base = `${p.nombre} de ${p.marca}: ${r0}.`;
  const dato = p.datosClave[0] ? ` ${p.datosClave[0].valor} de ${p.datosClave[0].etiqueta.toLowerCase()}.` : '';
  const opciones = [
    `${base} Te asesoran fisioterapeutas, con 2 años de garantía.`,
    `${base} 2 años de garantía y te asesoran fisioterapeutas.`,
    `${base} Te asesoran fisioterapeutas, sin compromiso.`,
    `${base} Te asesoran fisioterapeutas.`,
    `${base}${dato} Te asesoran fisioterapeutas.`,
    `${base} Con 2 años de garantía.`,
  ];
  return opciones.find((t) => t.length >= 140 && t.length <= 160) ?? opciones.sort((a, b) => Math.abs(150 - a.length) - Math.abs(150 - b.length))[0];
}
