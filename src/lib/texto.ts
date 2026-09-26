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
