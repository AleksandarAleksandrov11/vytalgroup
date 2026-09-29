/*
 * Configuración de la web de VytalGroup (un único archivo).
 *
 *  · SITE_URL: dominio de producción, https://vytalgroup.com, sin barra final. Todas las URL absolutas
 *    salen de aquí (canonical, Open Graph, JSON-LD, sitemap.xml, robots.txt y llms.txt). La variable de
 *    entorno SITE_URL lo cambia si hiciera falta. Mientras la web se vea en vytalgroup.vercel.app, esa
 *    dirección va con noindex (vercel.json) para que Google solo indexe vytalgroup.com. La landing de
 *    venta vive en vsl.vytalgroup.com.
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
export const SITE_URL = (env.SITE_URL || 'https://vytalgroup.com').replace(/\/$/, '');
// Misma aplicación web de Apps Script que la landing (vsl.vytalgroup.com): los leads caen en la misma hoja
export const SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxZLgstW_bvifa4PX18Jx_UQwx2GqhAqRhq7EH9qUtFlGqI0-qrwkRDNVtIq0i0L7yu/exec';
export const META_PIXEL_ID = '';
export const VERCEL_ANALYTICS = true;
