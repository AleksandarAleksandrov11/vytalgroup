// sitemap.xml con las páginas indexables (sin legales ni 404). lastmod solo donde hay fecha real
// (las guías); una fecha de build cambiaría en cada despliegue y Google dejaría de fiarse de ella.
import type { APIRoute } from 'astro';
import { SITE_URL } from '../config';
import { rutasIndexables } from '../lib/rutas';

export const GET: APIRoute = async () => {
  const urls = (await rutasIndexables()).map((r) => `  <url><loc>${SITE_URL}${r.path === '/' ? '/' : r.path}</loc>${r.lastmod ? `<lastmod>${r.lastmod}</lastmod>` : ''}</url>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
