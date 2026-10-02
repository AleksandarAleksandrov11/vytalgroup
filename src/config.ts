/*
 * Configuración de la web de VytalGroup (un único archivo).
 *
 * Cada valor se puede cambiar sin tocar el código con una variable de entorno de Vercel con el mismo nombre
 * (Settings > Environment Variables, entorno Production) y volviendo a desplegar. Si la variable no existe,
 * vale lo que pone aquí.
 *
 *  · SITE_URL: dirección de la web publicada, sin barra final: https://www.vytalgroupem.com (vytalgroupem.com
 *    sin www redirige ahí). De aquí salen todas las URL absolutas: canonical, Open Graph, JSON-LD,
 *    sitemap.xml, robots.txt y llms.txt. Ninguna página lleva noindex; vytalgroup.vercel.app redirige al
 *    dominio (vercel.json) y las vistas previas de Vercel llevan su propio noindex.
 *  · SHEETS_ENDPOINT: URL de la aplicación web de Google Apps Script que guarda los leads (termina en /exec).
 *    Es la misma que usa la landing: los leads de las dos caen en la misma hoja.
 *  · META_PIXEL_ID: identificador numérico del píxel de Meta (Administrador de eventos). Vacío: no se carga.
 *  · VERCEL_ANALYTICS: Vercel Web Analytics ("false" para apagarla). Hay que activarla también en el panel
 *    de Vercel (Analytics). Solo se carga si el visitante acepta la analítica en el aviso de cookies.
 *  · GOOGLE_SITE_VERIFICATION y META_DOMAIN_VERIFICATION: códigos de verificación del dominio para Google
 *    Search Console y para Meta (solo el código del atributo content de la etiqueta que te dan). Vacíos: no
 *    se pone la etiqueta (se puede verificar también con un registro TXT en el DNS).
 *
 * Con SHEETS_ENDPOINT vacío, el formulario falla con elegancia (mensaje amable, reintento y WhatsApp) y avisa
 * en la consola. Después de cambiar un valor hay que volver a desplegar.
 */
const env: Record<string, string | undefined> = (typeof process !== 'undefined' && process.env) || {};
const leer = (clave: string) => String(env[clave] || '').trim();

export const SITE_URL = (leer('SITE_URL') || 'https://www.vytalgroupem.com').replace(/\/+$/, '');
export const SHEETS_ENDPOINT = leer('SHEETS_ENDPOINT') || 'https://script.google.com/macros/s/AKfycbxZLgstW_bvifa4PX18Jx_UQwx2GqhAqRhq7EH9qUtFlGqI0-qrwkRDNVtIq0i0L7yu/exec';
// Solo cifras: un valor mal pegado (con espacios, comillas o el nombre del píxel) no rompe la web, se ignora
const pixel = leer('META_PIXEL_ID') || '';
export const META_PIXEL_ID = /^\d{6,20}$/.test(pixel) ? pixel : '';
if (pixel && !META_PIXEL_ID) console.warn(`[config] META_PIXEL_ID no es un número válido ("${pixel}"): el píxel no se cargará.`);
export const VERCEL_ANALYTICS = leer('VERCEL_ANALYTICS').toLowerCase() !== 'false';
export const GOOGLE_SITE_VERIFICATION = leer('GOOGLE_SITE_VERIFICATION');
export const META_DOMAIN_VERIFICATION = leer('META_DOMAIN_VERIFICATION');
