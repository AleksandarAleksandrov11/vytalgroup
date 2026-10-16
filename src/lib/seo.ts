// Datos estructurados (JSON-LD). Solo datos reales: sin offers, aggregateRating ni review.
import { SITE_URL } from '../config';
import { sinEnlaces } from './texto';
import { EMPRESA } from '../data/empresa';
import type { Faq } from '../data/categorias';
import { CAT } from '../data/categorias';
import type { Producto } from '../data/tipos';
import { urlFicha, seoDescription } from '../data/productos';

/** URL absoluta desde SITE_URL: la raíz con barra y el resto sin barra final */
export const absUrl = (path: string) => (path.startsWith('http') ? path : path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`);

const ORG_ID = `${SITE_URL}/#organizacion`;
const WEB_ID = `${SITE_URL}/#web`;
const PERSONA_ID = `${SITE_URL}/sobre-nosotros#javier-ruiz`;

/** Javier Ruiz: una sola entidad (fundador, autor de las guías y protagonista de Sobre nosotros) */
export const persona = () => ({ '@type': 'Person', '@id': PERSONA_ID, name: EMPRESA.fundador, jobTitle: 'Fisioterapeuta', url: absUrl('/sobre-nosotros'), worksFor: { '@id': ORG_ID }, sameAs: [EMPRESA.instagramJavier.url] });

export const organization = () => ({
  '@type': 'Organization',
  '@id': ORG_ID,
  name: EMPRESA.nombre,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/icon-512.png`,
  email: EMPRESA.email,
  telephone: EMPRESA.telefono,
  description: 'Equipos médicos de alta calidad para profesionales sanitarios: ecógrafos, diatermias y todo el equipamiento de fisioterapia y rehabilitación. Te asesoran fisioterapeutas.',
  founder: { '@id': PERSONA_ID },
  brand: { '@type': 'Brand', name: EMPRESA.marcaPropia },
  areaServed: ['Unión Europea', 'Estados Unidos', 'Latinoamérica'],
  contactPoint: [{ '@type': 'ContactPoint', telephone: EMPRESA.telefono, email: EMPRESA.email, contactType: 'customer service', availableLanguage: ['es'] }],
});

export const website = () => ({
  '@type': 'WebSite',
  '@id': WEB_ID,
  url: `${SITE_URL}/`,
  name: EMPRESA.nombre,
  inLanguage: 'es-ES',
  publisher: { '@id': ORG_ID },
});

export interface Miga { name: string; href: string }

export const breadcrumbList = (migas: Miga[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: migas.map((m, i) => ({ '@type': 'ListItem', position: i + 1, name: m.name, item: absUrl(m.href) })),
});

export const faqPage = (faqs: Faq[]) => ({
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: sinEnlaces(f.a) } })),
});

export const itemList = (nombre: string, productos: Producto[]) => ({
  '@type': 'ItemList',
  name: nombre,
  numberOfItems: productos.length,
  itemListElement: productos.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: `${p.nombre} (${p.marca})`,
    ...(urlFicha(p) ? { url: absUrl(urlFicha(p)!) } : {}),
  })),
});

// Ficha de equipo como ItemPage y no como Product: Google exige a todo Product un precio (offers) o valoraciones
// (review, aggregateRating) y la web no publica ninguno de los dos (el precio va según configuración). Sin ellos,
// Search Console marcaba cada ficha como "problema crítico" de fragmentos de productos sin ganar nada a cambio.
export const itemPage = (p: Producto, imagenes: string[]) => ({
  '@type': 'ItemPage',
  '@id': `${absUrl(urlFicha(p)!)}#pagina`,
  url: absUrl(urlFicha(p)!),
  name: `${p.nombre} de ${p.marca}`,
  description: p.descripcion || seoDescription(p),
  image: imagenes,
  primaryImageOfPage: { '@type': 'ImageObject', url: imagenes[0] },
  about: CAT[p.categoria].nombre,
  inLanguage: 'es-ES',
  isPartOf: { '@id': WEB_ID },
  publisher: { '@id': ORG_ID },
});

export const article = (o: { titulo: string; descripcion: string; url: string; imagen: string; fecha: string; actualizada?: string }) => ({
  '@type': 'Article',
  headline: o.titulo,
  description: o.descripcion,
  image: [o.imagen],
  datePublished: o.fecha,
  dateModified: o.actualizada || o.fecha,
  inLanguage: 'es-ES',
  mainEntityOfPage: absUrl(o.url),
  author: { '@id': PERSONA_ID },
  publisher: { '@id': ORG_ID, '@type': 'Organization', name: EMPRESA.nombre, logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` } },
});

export const aboutPage = (url: string) => ({ '@type': 'AboutPage', url: absUrl(url), name: 'Sobre VytalGroup', about: { '@id': ORG_ID }, inLanguage: 'es-ES' });
export const contactPage = (url: string) => ({ '@type': 'ContactPage', url: absUrl(url), name: 'Contacto', about: { '@id': ORG_ID }, inLanguage: 'es-ES' });
export const collectionPage = (url: string, name: string) => ({ '@type': 'CollectionPage', url: absUrl(url), name, inLanguage: 'es-ES', isPartOf: { '@id': WEB_ID } });

/** Grafo único por página */
export const graph = (nodes: object[]) => JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
