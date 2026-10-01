import type { ImageMetadata } from 'astro';
import encuadre from '../assets/productos/encuadre.json';

// Imágenes de producto (lienzo 4:3 común, sin fondo) y fotos de contexto. Astro genera AVIF y WebP en varios
// tamaños a partir de estos maestros. El nombre del archivo, en español y con guiones, se conserva.
const productos = import.meta.glob<ImageMetadata>('../assets/productos/*.{png,webp,jpg}', { eager: true, import: 'default' });
const fotos = import.meta.glob<ImageMetadata>('../assets/fotos/*.{png,webp,jpg}', { eager: true, import: 'default' });

const porNombre = new Map<string, ImageMetadata>();
for (const [ruta, meta] of Object.entries(productos)) porNombre.set(ruta.split('/').pop()!.replace(/\.\w+$/, ''), meta);
for (const [ruta, meta] of Object.entries(fotos)) porNombre.set(`fotos/${ruta.split('/').pop()!.replace(/\.\w+$/, '')}`, meta);

/** "ecografo-portatil-acclarix-ax8-edan" o "fotos/eco-wireless-vytamed-estuche" */
export function imagen(nombre: string): ImageMetadata {
  const m = porNombre.get(nombre);
  if (!m) throw new Error(`Imagen no encontrada: ${nombre}`);
  return m;
}

/** Anchos útiles sin ampliar nunca por encima del original */
export function anchos(meta: ImageMetadata, deseados: number[]): number[] {
  const out = deseados.filter((w) => w < meta.width);
  out.push(Math.min(meta.width, Math.max(...deseados)));
  return [...new Set(out)].sort((a, b) => a - b);
}

/** Ancho del equipo en su lienzo (0 a 1), medido por scripts/imagenes/encuadre.py */
export function anchoEquipo(nombre: string): number {
  return (encuadre as Record<string, { w: number }>)[nombre]?.w ?? 0.6;
}

/** Estilo del escenario de producto: la sombra de contacto toma el ancho del equipo */
export const escena = (nombre: string) => (nombre.startsWith('fotos/') ? undefined : `--sw:${anchoEquipo(nombre)}`);
