// Validación de los datos de producto y categorías (se ejecuta con: npm run check:content).
// Comprueba slugs únicos, relacionados existentes, imágenes, longitudes SEO, rayas prohibidas
// (U+2014 y U+2013), menciones veterinarias y que cada ficha tenga lo mínimo para su plantilla.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { PRODUCTOS, seoTitle, seoDescription, urlFicha, deCategoria } from '../src/data/productos/index.ts';
import { CATEGORIAS } from '../src/data/categorias.ts';
import { faqsFicha, faqsCategoria, FAQ_GENERAL, FAQ_ECOGRAFIA, FAQ_DIATERMIA, FAQ_CONTACTO } from '../src/data/faqs.ts';

const errors = [];
const warn = [];
const img = (n) => n.startsWith('fotos/')
  ? ['webp', 'png', 'jpg'].some((e) => existsSync(join('src/assets', `${n}.${e}`)))
  : ['webp', 'png', 'jpg'].some((e) => existsSync(join('src/assets/productos', `${n}.${e}`)));

const slugs = new Set();
for (const p of PRODUCTOS) {
  if (slugs.has(p.slug)) errors.push(`Slug repetido: ${p.slug}`);
  slugs.add(p.slug);
}
const titles = new Map();
const descs = new Map();
for (const p of PRODUCTOS) {
  for (const r of p.relacionados) if (!slugs.has(r)) errors.push(`${p.slug}: relacionado inexistente ${r}`);
  for (const i of p.imagenes) if (!img(i)) errors.push(`${p.slug}: falta la imagen ${i}`);
  if (!p.imagenes.length) errors.push(`${p.slug}: sin imagen`);
  if (!p.ficha) continue;
  const t = seoTitle(p);
  const d = seoDescription(p);
  if (t.length < 50 || t.length > 60) errors.push(`${p.slug}: title de ${t.length} caracteres: "${t}"`);
  if (d.length < 140 || d.length > 160) errors.push(`${p.slug}: description de ${d.length} caracteres: "${d}"`);
  if (titles.has(t)) errors.push(`Title repetido: ${t}`);
  if (descs.has(d)) errors.push(`Description repetida: ${d}`);
  titles.set(t, p.slug); descs.set(d, p.slug);
  if (p.datosClave.length < 2 || p.datosClave.length > 4) errors.push(`${p.slug}: datosClave debe tener de 2 a 4`);
  if (p.paraQuien.length !== 3) errors.push(`${p.slug}: paraQuien debe tener 3`);
  if (p.especificaciones.length < 3) errors.push(`${p.slug}: pocas especificaciones para ficha`);
  if (!urlFicha(p)) errors.push(`${p.slug}: sin URL`);
  if (faqsFicha(p).length < 3) errors.push(`${p.slug}: menos de 3 preguntas frecuentes`);
  if (p.caracteristicas.some((c) => !c.texto)) errors.push(`${p.slug}: característica sin texto`);
  if (!p.paginaCatalogo && !p.fuente) warn.push(`${p.slug}: sin página de catálogo ni fuente`);
}
for (const c of CATEGORIAS) {
  if (c.seoTitle.length < 50 || c.seoTitle.length > 60) errors.push(`Categoría ${c.id}: title de ${c.seoTitle.length}: "${c.seoTitle}"`);
  if (c.seoDescription.length < 140 || c.seoDescription.length > 160) errors.push(`Categoría ${c.id}: description de ${c.seoDescription.length}: "${c.seoDescription}"`);
  if (!img(c.imagen)) errors.push(`Categoría ${c.id}: falta la imagen ${c.imagen}`);
  if (!c.pilar && faqsCategoria(c, deCategoria(c.id)).length < 3) errors.push(`Categoría ${c.id}: menos de 3 preguntas frecuentes`);
}
// Cada página con preguntas frecuentes, al menos 3
for (const [k, v] of Object.entries({ FAQ_GENERAL, FAQ_ECOGRAFIA, FAQ_DIATERMIA, FAQ_CONTACTO })) if (v.length < 3) errors.push(`${k}: menos de 3 preguntas frecuentes`);

// Texto prohibido en todos los datos y contenidos
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);
for (const f of walk('src').filter((f) => /\.(ts|astro|md|mdx|css|js|json)$/.test(f))) {
  const s = readFileSync(f, 'utf8');
  s.split('\n').forEach((line, i) => {
    if (/[\u2014\u2013]/.test(line)) errors.push(`${f}:${i + 1}: raya prohibida`);
    if (/veterinari|\bvet\b/i.test(line)) errors.push(`${f}:${i + 1}: mención veterinaria`);
  });
}

warn.forEach((w) => console.log(`AVISO  ${w}`));
if (errors.length) {
  errors.forEach((e) => console.log(`ERROR  ${e}`));
  console.log(`\n${errors.length} errores`);
  process.exit(1);
}
console.log(`OK: ${PRODUCTOS.length} productos (${PRODUCTOS.filter((p) => p.ficha).length} con ficha), ${CATEGORIAS.length} categorías.`);
