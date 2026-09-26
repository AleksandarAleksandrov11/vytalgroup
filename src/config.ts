/*
 * Configuración de la web de VytalGroup (un único archivo).
 *
 *  · SITE_URL: dominio definitivo, sin barra final. Todas las URL absolutas salen de aquí
 *    (canonical, Open Graph, JSON-LD, sitemap.xml, robots.txt y llms.txt).
 *  · SHEETS_ENDPOINT: URL de la aplicación web de Google Apps Script que guarda los leads
 *    (termina en /exec). Instrucciones en el README, apartado "Google Sheets".
 *  · META_PIXEL_ID: identificador numérico del píxel de Meta (Administrador de eventos).
 *
 * Con SHEETS_ENDPOINT vacío, el formulario falla con elegancia (mensaje amable, reintento y
 * WhatsApp) y avisa en la consola. Con META_PIXEL_ID vacío, el píxel no se carga nunca.
 * Después de cambiar un valor hay que volver a desplegar (npm run build).
 */
export const SITE_URL = 'https://vytalgroup.org';
export const SHEETS_ENDPOINT = '';
export const META_PIXEL_ID = '';
