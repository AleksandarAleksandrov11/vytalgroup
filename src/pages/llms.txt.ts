// llms.txt: resumen de la empresa, páginas principales, productos y guías para buscadores de IA.
// Se genera desde los mismos datos que la web, así que nunca se desincroniza.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_URL } from '../config';
import { EMPRESA, MARCAS } from '../data/empresa';
import { CATEGORIAS } from '../data/categorias';
import { PRODUCTOS, urlFicha } from '../data/productos';

export const GET: APIRoute = async () => {
  const u = (p: string) => `${SITE_URL}${p}`;
  const guias = (await getCollection('guias')).sort((a, b) => a.data.orden - b.data.orden);
  const l: string[] = [];
  l.push(`# ${EMPRESA.nombre}`, '');
  l.push(`> Equipos médicos de alta calidad para fisioterapeutas, clínicas y médicos. Ecógrafos y diatermias como especialidad, y el resto del equipamiento de fisioterapia y rehabilitación en un solo sitio. De fisio a fisio.`, '');
  l.push(
    `${EMPRESA.nombre} la fundó ${EMPRESA.fundador}, fisioterapeuta, para que a otros profesionales no les engañen con los equipos, el mantenimiento ni los productos. Trabaja junto a ${EMPRESA.socio}, con quien comparte el ${EMPRESA.catalogoNombre}, y tiene marca propia, ${EMPRESA.marcaPropia}, con equipos desarrollados bajo el Reglamento Europeo de Productos Sanitarios MDR (UE) 2017/745 y soporte técnico local en España.`,
    '',
    '- 2 años de garantía en piezas y mano de obra.',
    '- Mantenimiento claro, sin sorpresas.',
    '- Equipos certificados CE / MDR.',
    '- Envío a la UE, USA y LATAM con la aduana gestionada.',
    '- Te asesoran fisioterapeutas, no comerciales.',
    '- Todo tu equipamiento en un solo sitio.',
    `- Marcas: ${MARCAS.join(', ')}.`,
    '- Servicios: asesoramiento en la selección y configuración del equipo, coordinación de importación y entrega internacional, instalación, formación y soporte según el proyecto.',
    '- La web no publica precios: cada propuesta se prepara según el equipo, la configuración y el país.',
    `- Contacto: teléfono y WhatsApp ${EMPRESA.telefono}, email ${EMPRESA.email}. Instagram @${EMPRESA.instagramMarca.usuario} y @${EMPRESA.instagramJavier.usuario}.`,
    '',
  );
  l.push('## Páginas principales', '');
  l.push(
    `- [Inicio](${u('/')}): qué hacemos, los equipos más pedidos y cómo trabajamos.`,
    `- [Ecógrafos para fisioterapia](${u('/ecografos')}): sonda inalámbrica Eco Wireless y gama EDAN (Nano, Acclarix, U60, U50, DUS60 y U2), con comparador.`,
    `- [Diatermia y tecarterapia](${u('/diatermias')}): diatermia capacitiva y resistiva de VytaMeD, I-Tech y EME, con comparador.`,
    `- [Equipos por categoría](${u('/equipos')}): las ${CATEGORIAS.length} categorías del catálogo.`,
    `- [Catálogo completo](${u('/catalogo')}): todos los equipos con filtros y el PDF de ${EMPRESA.catalogoPaginas} páginas, sin formularios.`,
    `- [Catálogo en PDF](${u(EMPRESA.catalogoPdf)}): ${EMPRESA.catalogoNombre}, sin precios.`,
    `- [Sobre nosotros](${u('/sobre-nosotros')}): la historia de ${EMPRESA.fundador} y la forma de trabajar.`,
    `- [Contacto](${u('/contacto')}): formulario de asesoramiento, WhatsApp, teléfono y email.`,
    `- [Guías](${u('/guias')}): contenido para elegir equipo con criterio.`,
    '',
  );
  l.push('## Categorías', '');
  for (const c of CATEGORIAS) l.push(`- [${c.nombre}](${u(c.ruta)}): ${c.descripcion}`);
  l.push('');
  l.push('## Productos', '');
  for (const c of CATEGORIAS) {
    const ps = PRODUCTOS.filter((p) => p.categoria === c.id);
    if (!ps.length) continue;
    l.push(`### ${c.nombre}`, '');
    for (const p of ps) {
      const url = urlFicha(p);
      const nombre = `${p.nombre} (${p.marca})`;
      l.push(url ? `- [${nombre}](${u(url)}): ${p.resumen}` : `- ${nombre}: ${p.resumen} Consulta en ${u('/contacto')}.`);
    }
    l.push('');
  }
  l.push('## Guías', '');
  for (const g of guias) l.push(`- [${g.data.corto}](${u(`/guias/${g.id}`)}): ${g.data.resumen}`);
  l.push('');
  const txt = l.join('\n').replace(/[\u2013\u2014]/g, ':');
  return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
