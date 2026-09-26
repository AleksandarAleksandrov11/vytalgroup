// robots.txt: todo el sitio es rastreable (las legales llevan noindex en la propia página) y enlaza al sitemap.
import type { APIRoute } from 'astro';
import { SITE_URL } from '../config';

export const GET: APIRoute = () => new Response(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
