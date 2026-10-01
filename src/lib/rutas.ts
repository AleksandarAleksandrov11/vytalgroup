// Rutas indexables del sitio, calculadas a partir de los datos (sitemap.xml y llms.txt).
// Todas las páginas son indexables; la 404 no se incluye porque no es una página real.
import { getCollection } from 'astro:content';
import { CATEGORIAS } from '../data/categorias';
import { PRODUCTOS, urlFicha } from '../data/productos';

export interface Ruta { path: string; prioridad: number; cambio: 'weekly' | 'monthly'; lastmod?: string }

export async function rutasIndexables(): Promise<Ruta[]> {
  const guias = await getCollection('guias');
  const r: Ruta[] = [
    { path: '/', prioridad: 1, cambio: 'weekly' },
    { path: '/ecografos', prioridad: 0.9, cambio: 'weekly' },
    { path: '/diatermias', prioridad: 0.9, cambio: 'weekly' },
    { path: '/equipos', prioridad: 0.8, cambio: 'weekly' },
    { path: '/catalogo', prioridad: 0.8, cambio: 'weekly' },
    ...CATEGORIAS.filter((c) => !c.pilar).map((c) => ({ path: c.ruta, prioridad: 0.7, cambio: 'monthly' as const })),
    ...PRODUCTOS.filter((p) => p.ficha).map((p) => ({ path: urlFicha(p)!, prioridad: ['ecografia', 'diatermia'].includes(p.categoria) ? 0.8 : 0.6, cambio: 'monthly' as const })),
    { path: '/sobre-nosotros', prioridad: 0.6, cambio: 'monthly' },
    { path: '/contacto', prioridad: 0.6, cambio: 'monthly' },
    { path: '/guias', prioridad: 0.6, cambio: 'weekly' },
    ...guias.map((g) => ({ path: `/guias/${g.id}`, prioridad: 0.6, cambio: 'monthly' as const, lastmod: g.data.actualizada || g.data.fecha })),
    { path: '/aviso-legal', prioridad: 0.2, cambio: 'monthly' },
    { path: '/privacidad', prioridad: 0.2, cambio: 'monthly' },
    { path: '/cookies', prioridad: 0.2, cambio: 'monthly' },
  ];
  return r;
}
