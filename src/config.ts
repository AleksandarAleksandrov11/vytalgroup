/*
 * Configuración de la web de VytalGroup (un único archivo).
 *
 *  · SITE_URL: dominio de producción, sin barra final. Todas las URL absolutas salen de aquí
 *    (canonical, Open Graph, JSON-LD, sitemap.xml, robots.txt y llms.txt). En Vercel se toma solo
 *    el dominio de producción del proyecto (VERCEL_PROJECT_PRODUCTION_URL): mientras la web viva en
 *    vytalgroup.vercel.app el canonical apunta ahí, y cuando se conecte vytalgroup.org como dominio
 *    de producción, a vytalgroup.org, sin tocar nada. La variable SITE_URL lo fuerza si hace falta.
 *  · SHEETS_ENDPOINT: URL de la aplicación web de Google Apps Script que guarda los leads
 *    (termina en /exec). Instrucciones en el README, apartado "Google Sheets".
 *  · META_PIXEL_ID: identificador numérico del píxel de Meta (Administrador de eventos).
 *  · VERCEL_ANALYTICS: Vercel Web Analytics (activarlo también en el panel de Vercel, pestaña
 *    Analytics). Solo se carga si el visitante acepta la analítica en el aviso de cookies.
 *
 * Con SHEETS_ENDPOINT vacío, el formulario falla con elegancia (mensaje amable, reintento y
 * WhatsApp) y avisa en la consola. Con META_PIXEL_ID vacío, el píxel no se carga nunca.
 * Después de cambiar un valor hay que volver a desplegar (npm run build).
 */
const env: Record<string, string | undefined> = (typeof process !== 'undefined' && process.env) || {};
export const SITE_URL = (env.SITE_URL || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://vytalgroup.org')).replace(/\/$/, '');
export const SHEETS_ENDPOINT = '';
export const META_PIXEL_ID = '';
export const VERCEL_ANALYTICS = true;
