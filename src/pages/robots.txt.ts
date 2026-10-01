// robots.txt: todo el sitio es rastreable por cualquier bot (buscadores e IA), sin noindex en ninguna página,
// y enlaza al sitemap.
import type { APIRoute } from 'astro';
import { SITE_URL } from '../config';

export const GET: APIRoute = () => new Response(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
