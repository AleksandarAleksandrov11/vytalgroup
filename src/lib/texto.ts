// Utilidades de texto para el patrón de marca: titulares con la frase de acento en cursiva.
// En los datos, el acento se marca entre asteriscos: "Diatermia y tecarterapia. *Sin letra pequeña.*"

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** HTML con el acento en <em> (para H2 y títulos que anima el JS por líneas) */
export function acento(texto: string): string {
  return esc(texto).replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

/** Texto plano sin marcas de acento (title, alt, JSON-LD) */
export const plano = (texto: string) => texto.replace(/\*/g, '');

/** HTML del H1: cada palabra en su máscara, con retraso escalonado; el acento, en cursiva */
export function h1Html(texto: string): string {
  let i = 0;
  const palabras = (s: string) =>
    s.trim().split(/\s+/).map((w) => `<span class="w" style="--i:${i++}"><span>${esc(w)}</span></span>`).join(' ');
  return texto
    .split(/(\*[^*]+\*)/)
    .filter((t) => t.trim())
    .map((t) => (t.startsWith('*') ? `<em>${palabras(t.slice(1, -1))}</em>` : palabras(t)))
    .join(' ');
}

/** Minutos de lectura (200 palabras por minuto) */
export const minutosLectura = (texto: string) => Math.max(1, Math.round(texto.trim().split(/\s+/).length / 200));

/** Fecha larga en español: "26 de septiembre de 2026" */
export const fechaLarga = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Madrid' });

/** Normaliza para búsquedas: sin tildes y en minúsculas */
export const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Espacio de no separación entre un número y su unidad ("2 h", "9,25 kg", "12 MHz") para que no se partan */
export const unidades = (s: string) => s.replace(/(\d) (?=(?:h|min|s|ms|kg|g|W|kW|mW|J|kHz|MHz|Hz|mA|V|GB|TB|mm|cm|m|nm|bar)\b)/g, '$1\u00A0');

/** Sin tildes ni diacríticos (ids de encabezados) */
export const sinTildes = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** Enlaces internos en textos de datos con la sintaxis [texto](/ruta): HTML escapado con sus <a> */
export const enlaces = (t: string) => esc(t).replace(/\[([^\]]+)\]\((\/[^)\s]*)\)/g, '<a href="$2">$1</a>');
/** El mismo texto sin la marca de enlace (JSON-LD, meta, WhatsApp) */
export const sinEnlaces = (t: string) => t.replace(/\[([^\]]+)\]\((\/[^)\s]*)\)/g, '$1');
