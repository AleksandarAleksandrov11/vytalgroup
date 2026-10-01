// /og/<slug>.jpg: imagen Open Graph de cada página, categoría, ficha y guía (generada en el build).
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { ogJpg, type OgDatos } from '../../lib/og';
import { CATEGORIAS, CAT } from '../../data/categorias';
import { PRODUCTOS } from '../../data/productos';

export const getStaticPaths = (async () => {
  const eco = CAT.ecografia;
  const dia = CAT.diatermia;
  const paginas: [string, OgDatos][] = [
    ['inicio', { kicker: 'VytalGroup', titulo: 'Equipos médicos de alta calidad. *Sin letra pequeña.*', sub: 'Ecógrafos, diatermias y todo lo que tu clínica necesita. Te asesoran fisioterapeutas.', imagen: 'ecografo-portatil-acclarix-ax8-edan' }],
    ['ecografos', { kicker: 'Ecografía', titulo: eco.h1, sub: 'Inalámbricos, portátiles y de carro. 2 años de garantía.', imagen: eco.imagen }],
    ['diatermias', { kicker: 'Diatermia y tecarterapia', titulo: dia.h1, sub: 'Capacitiva, resistiva y bipolar. 2 años de garantía.', imagen: dia.imagen }],
    ['equipos', { kicker: 'Equipos', titulo: 'Equipos de fisioterapia *por categoría.*', sub: `${CATEGORIAS.length} categorías y ${PRODUCTOS.length} equipos del catálogo 2026, en un solo sitio.` }],
    ['catalogo', { kicker: 'Catálogo 2026', titulo: 'Catálogo de equipos *de fisioterapia.*', sub: 'En la web y en PDF, con descarga directa.', imagen: 'fotos/catalogo-portada', foto: true }],
    ['sobre-nosotros', { kicker: 'Sobre nosotros', titulo: 'Sobre *VytalGroup.*', sub: 'Javier Ruiz, fisioterapeuta y fundador de VytalGroup.', imagen: 'fotos/javier-ruiz-fisioterapeuta', foto: true }],
    ['contacto', { kicker: 'Contacto', titulo: 'Contacto y *asesoramiento.*', sub: 'WhatsApp y teléfono +34 616 372 644 · vytalkinetech@gmail.com' }],
    ['guias', { kicker: 'Guías', titulo: 'Guías para elegir *equipo de fisioterapia.*', sub: 'Guías de Javier Ruiz, fisioterapeuta, para elegir equipo con criterio.' }],
  ];
  const categorias: [string, OgDatos][] = CATEGORIAS.map((c) => [c.id, { kicker: 'Equipos', titulo: c.h1, sub: c.descripcion, imagen: c.imagen }]);
  const fichas: [string, OgDatos][] = PRODUCTOS.filter((p) => p.ficha && p.imagenes.length).map((p) => {
    const corte = p.nombre.lastIndexOf(' ');
    const titulo = corte > 0 ? `${p.nombre.slice(0, corte)} *${p.nombre.slice(corte + 1)}*` : `*${p.nombre}*`;
    return [p.slug, { kicker: `${p.marca} · ${CAT[p.categoria].corto}`, titulo, sub: p.resumen, imagen: p.imagenes[0] }];
  });
  const guias: [string, OgDatos][] = (await getCollection('guias')).map((g) => [g.id, { kicker: 'Guía', titulo: g.data.titulo, sub: 'Javier Ruiz, fisioterapeuta', imagen: g.data.imagen, foto: true }]);
  const todas = [...paginas, ...categorias, ...fichas, ...guias];
  const vistos = new Set<string>();
  for (const [slug] of todas) {
    if (vistos.has(slug)) throw new Error(`OG duplicada: ${slug}`);
    vistos.add(slug);
  }
  return todas.map(([slug, datos]) => ({ params: { slug }, props: { datos } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const jpg = await ogJpg((props as { datos: OgDatos }).datos);
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } });
};
