import type { Producto } from './tipos';
import type { Faq } from './categorias';

// Respuestas de 2 frases como máximo, solo con información de las fuentes y del apartado 1.2.

/** Las 6 de la landing (Inicio y Sobre nosotros) */
export const FAQ_GENERAL: Faq[] = [
  { q: '¿Cuál me conviene?', a: 'Depende de cómo trabajas. Nos lo cuentas y te recomendamos uno, sin venderte lo que no necesitas.' },
  { q: '¿Qué garantía tienen?', a: '2 años en piezas y mano de obra, sin letra pequeña.' },
  { q: '¿Y el mantenimiento?', a: 'Está asegurado, y sabes lo que incluye desde el principio. Sin sorpresas.' },
  { q: '¿Están certificados?', a: 'Sí. Son productos sanitarios con marcado CE / MDR y su documentación.' },
  { q: '¿Enviáis fuera de España?', a: 'Sí, a la UE, USA y LATAM, con la aduana gestionada.' },
  { q: '¿Qué pasa cuando envío el formulario?', a: 'Te escribimos por WhatsApp, nos cuentas cómo trabajas y te recomendamos el equipo que encaja contigo.' },
];

export const FAQ_ECOGRAFIA: Faq[] = [
  { q: '¿De bolsillo, portátil o de carro?', a: 'Si te mueves entre domicilios o trabajas en campo, una sonda de bolsillo: la Eco Wireless o la Nano de EDAN. Para ecoguiados en consulta, un portátil como el AX8 o el AX3; y para una consulta fija con varias especialidades, un carro como el LX9.' },
  { q: '¿El Eco Wireless funciona con mi móvil?', a: 'Sí: se conecta por Wi-Fi 5 GHz o USB-C con iOS, Android, Windows y macOS. Las imágenes se guardan en tu dispositivo y es compatible DICOM.' },
  { q: '¿Cuántas sondas puedo conectar?', a: 'Depende del modelo: la AX2 tiene 1 puerto activo; la AX3, el U60, el U50 y el DUS60, 2; la LX25, 3; el U2, 4, y la LX3, la LX9 y la LX85, 5. La Eco Wireless y la Nano son sondas lineales o convexas según el modelo.' },
  { q: '¿Qué garantía y mantenimiento tienen?', a: '2 años de garantía en piezas y mano de obra. Y sabes qué incluye el mantenimiento desde el primer día, sin sorpresas.' },
  { q: '¿Están certificados?', a: 'El Eco Wireless es un dispositivo médico Clase IIa con marcado CE conforme al MDR (UE) 2017/745. Con los EDAN recibes la documentación técnica y regulatoria aplicable a tu operación.' },
];

export const FAQ_DIATERMIA: Faq[] = [
  { q: '¿Capacitiva o resistiva?', a: 'Según el fabricante del HR Tek, el modo capacitivo trabaja sobre tejidos blandos y el resistivo sobre articulaciones, tendones y huesos. Todos nuestros equipos incluyen los dos modos.' },
  { q: '¿Qué diferencia hay entre Reatherm y Reacare?', a: 'Reatherm tiene 200 W, de 300 a 700 kHz, manípulo bipolar y curso online. Reacare tiene 160 W, de 400 a 600 kHz, y manípulo resistivo y capacitivo.' },
  { q: '¿Qué aporta el cabezal bipolar?', a: 'En el HR Tek, más comodidad y especificidad, sin placa de retorno. El Reatherm también incluye manípulo bipolar.' },
  { q: '¿Puedo combinar diatermia y electroterapia?', a: 'Sí. La Diatermia Multifunción VytaMeD integra RET/CET y TENS/IFC en un solo equipo, con 4 canales independientes.' },
  { q: '¿Qué garantía tienen?', a: '2 años en piezas y mano de obra, con el mantenimiento claro desde el día uno.' },
];

export const FAQ_CONTACTO: Faq[] = [
  { q: '¿Qué pasa cuando envío el formulario?', a: 'Te escribimos por WhatsApp, nos cuentas cómo trabajas y te recomendamos el equipo que encaja contigo.' },
  { q: '¿Tengo que dejar mis datos para ver el catálogo?', a: 'No. El catálogo se ve entero en la web y el PDF se descarga directamente, sin formularios.' },
  { q: '¿Enviáis fuera de España?', a: 'Sí, a la UE, USA y LATAM, con la aduana gestionada.' },
];

// ---------------------------------------------------------------- Fichas de producto
// Cada ficha lleva sus preguntas propias (si las tiene) y las que salen de sus datos, más las comunes
// de la empresa (garantía y mantenimiento, precio y envío). Siempre 4 o más, sin datos inventados.

const lista = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}` : xs[0] ?? '');
/** Minúscula inicial salvo siglas (FAST, PW, MSK...) */
const minus = (s: string) => (/^[A-ZÁÉÍÓÚ][a-záéíóúñ]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const mayus = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "el ecógrafo Acclarix AX8", "la diatermia Reatherm", "la Camilla Eléctrica Premium" */
export function sujeto(p: Producto): string {
  const nucleo = p.tipo.split(' ')[0];
  const art = /^(diatermia|camilla)$/.test(nucleo) ? 'la' : 'el';
  return p.nombre.toLowerCase().startsWith(nucleo.toLowerCase()) ? `${art} ${p.nombre}` : `${art} ${nucleo} ${p.nombre}`;
}

/** "del ecógrafo Acclarix AX8", "de la Camilla Eléctrica Premium" */
export const deSujeto = (p: Producto) => { const s = sujeto(p); return s.startsWith('el ') ? `del ${s.slice(3)}` : `de ${s}`; };

export function faqsFicha(p: Producto): Faq[] {
  const s = sujeto(p);
  const out: Faq[] = [...(p.faqs ?? [])];
  if (p.usos.length) out.push({ q: `¿Para qué se usa ${s}?`, a: `${mayus(lista(p.usos.slice(0, 6).map(minus)))}${p.usos.length > 6 ? ', entre otras aplicaciones' : ''}. Te ayudamos a ver si encaja con tu forma de trabajar.` });
  if (p.incluye.length) out.push({ q: `¿Qué incluye ${s}?`, a: `${lista(p.incluye)}.` });
  else if (p.modelos?.length && !p.faqs?.length) out.push({ q: `¿Qué versiones tiene ${s}?`, a: p.modelos.map((m) => `${m.nombre}: ${minus(m.detalle)}`).join(' ') });
  out.push({ q: `¿Qué garantía y mantenimiento tiene ${s}?`, a: '2 años de garantía en piezas y mano de obra, y sabes qué incluye el mantenimiento desde el primer día, sin sorpresas.' });
  out.push({ q: `¿Cuánto cuesta ${s}?`, a: 'No publicamos precios: cada propuesta se prepara según el equipo, la configuración y el país de entrega. Cuéntanos cómo trabajas y te la preparamos sin compromiso.' });
  out.push({ q: '¿Lo enviáis fuera de España?', a: 'Sí, a la UE, USA y LATAM, con la aduana gestionada.' });
  return out.slice(0, 7);
}
