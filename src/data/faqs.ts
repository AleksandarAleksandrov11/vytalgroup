import type { Producto } from './tipos';
import { nombresCat, type Categoria, type Faq } from './categorias';

// Respuestas de 2 frases como máximo, solo con información de las fuentes y del apartado 1.2.

/** Las 6 de la landing (Inicio y Sobre nosotros) */
export const FAQ_GENERAL: Faq[] = [
  { q: '¿Qué equipo me conviene?', a: 'Depende de cómo trabajas. Nos lo cuentas y te recomendamos uno, sin venderte lo que no necesitas. Si dudas entre modelos, mira las guías para [elegir ecógrafo](/guias/como-elegir-un-ecografo-para-fisioterapia) o [diatermia](/guias/diatermia-capacitiva-y-resistiva).' },
  { q: '¿Qué garantía tienen?', a: '2 años en piezas y mano de obra.' },
  { q: '¿Y el mantenimiento?', a: 'Está asegurado, y sabes lo que incluye desde el principio. Sin sorpresas.' },
  { q: '¿Los equipos tienen marcado CE?', a: 'Sí. Cada equipo tiene su normativa, MDR (UE) 2017/745 o Directiva 93/42/CEE, que viene en su ficha o te confirmamos, y recibes su documentación con la propuesta.' },
  { q: '¿Enviáis fuera de España?', a: 'Sí, a la UE, USA y LATAM, con la aduana gestionada.' },
  { q: '¿Qué pasa cuando envío el formulario?', a: 'Te escribimos por WhatsApp o por correo, como elijas en el formulario. Nos cuentas cómo trabajas y te recomendamos el equipo que encaja contigo.' },
];

export const FAQ_ECOGRAFIA: Faq[] = [
  { q: '¿De bolsillo, portátil o de carro?', a: 'Si te mueves entre domicilios o trabajas en campo, una sonda de bolsillo: la Eco Wireless o la Nano de EDAN. Para ecoguiados en consulta, un portátil como el AX8 o el AX3; y para una consulta fija con varias especialidades, un carro como el LX9.' },
  { q: '¿El Eco Wireless funciona con mi móvil?', a: 'Sí: se conecta por Wi-Fi 5 GHz o USB-C con iOS, Android, Windows y macOS. Las imágenes se guardan en tu dispositivo y es compatible DICOM.' },
  { q: '¿Cuántas sondas puedo conectar?', a: 'Depende del modelo: la AX2 tiene 1 puerto activo; la AX3, el U60, el U50 y el DUS60, 2; la LX25, 3; el U2, 4, y la LX3, la LX9 y la LX85, 5. La Eco Wireless y la Nano son sondas lineales o convexas según el modelo.' },
  { q: '¿Qué garantía y mantenimiento tienen?', a: '2 años de garantía en piezas y mano de obra. Y sabes qué incluye el mantenimiento desde el primer día, sin sorpresas.' },
  { q: '¿Están certificados?', a: 'El Eco Wireless es un dispositivo médico Clase IIa con marcado CE conforme al MDR (UE) 2017/745. Con los EDAN recibes la documentación técnica y regulatoria aplicable a tu operación.' },
  { q: '¿Qué ecógrafo necesito para la electrólisis ecoguiada?', a: 'La técnica USGET se hace con guía ecográfica: [Physio Invasiva 2.0](/equipos/electrolisis-percutanea) trabaja junto a un portátil como el Acclarix AX8 o a la sonda inalámbrica Eco Wireless.' },
  { q: '¿Cuánto cuesta un ecógrafo para fisioterapia?', a: 'No publicamos precios: cada propuesta se prepara según el equipo, las sondas, la configuración y el país de entrega. Cuéntanos cómo trabajas y te la preparamos sin compromiso.' },
];

export const FAQ_DIATERMIA: Faq[] = [
  { q: '¿Capacitiva o resistiva?', a: 'Según el fabricante del HR Tek, el modo capacitivo trabaja sobre tejidos blandos y el resistivo sobre articulaciones, tendones y huesos. Todos nuestros equipos incluyen los dos modos.' },
  { q: '¿Qué diferencia hay entre Reatherm y Reacare?', a: 'Reatherm tiene 200 W, de 300 a 700 kHz, manípulo bipolar y curso online. Reacare tiene 160 W, de 400 a 600 kHz, y manípulo resistivo y capacitivo.' },
  { q: '¿Qué aporta el cabezal bipolar?', a: 'En el HR Tek, más comodidad y especificidad, sin placa de retorno. El Reatherm también incluye manípulo bipolar.' },
  { q: '¿Puedo combinar diatermia y electroterapia?', a: 'Sí. La Diatermia Multifunción VytaMeD integra RET/CET y TENS/IFC en un solo equipo, con 4 canales independientes.' },
  { q: '¿Qué es la tecarterapia?', a: 'Es el nombre con el que se conoce la diatermia capacitiva y resistiva: usa energía de radiofrecuencia para generar calor dentro de los tejidos.' },
  { q: '¿En qué se diferencia de la diatermia por microondas?', a: 'El [Radarmed 2500 CP](/equipos/diatermia-microondas) de EME trabaja a 2450 MHz con una antena en brazo articulado. Reatherm, Reacare y HR Tek trabajan en radiofrecuencia, entre 300 y 1200 kHz.' },
];

export const FAQ_CONTACTO: Faq[] = [
  { q: '¿Puedo escribiros directamente por WhatsApp?', a: 'Sí, al +34 616 372 644. Te contesta un fisioterapeuta.' },
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
  // "equipo de ..." dice la tecnología: "el equipo de ondas de choque Shock Med" (sin calificativos finales)
  if (p.tipo.startsWith('equipo de ')) return `el ${p.tipo.replace(/ (radiales|compacto|de alta intensidad|percutánea ecoguiada|terapéuticos|portátil|estética|facial y corporal)$/, '')} ${p.nombre}`;
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

/** Preguntas de cada página de categoría: las propias de la categoría y, hasta tener al menos 5, las
 *  comunes construidas con sus equipos (qué modelos hay, cuál elegir, garantía, precio y envíos). */
export function faqsCategoria(c: Pick<Categoria, 'corto' | 'tema' | 'nombres' | 'faqs'>, productos: Producto[]): Faq[] {
  const n = productos.length;
  const { uno, varios, f } = nombresCat(c);
  const pl = n === 1 ? '' : 'n';
  const modelos = lista(productos.map((p) => `${p.nombre} de ${p.marca}`));
  const comunes: Faq[] = [
    { q: `¿Qué ${n === 1 ? uno : varios} tenéis?`, a: n === 1 ? `${modelos}. En su ficha tienes sus datos, qué incluye y para qué se usa.` : `${n} modelos: ${modelos}. En cada ficha tienes sus datos, qué incluye y para qué se usa.` },
    ...(n > 1 ? [{ q: `¿Qué ${uno} me conviene?`, a: `Depende de lo que tratas, de cuántos pacientes ves y de dónde trabajas. Cuéntanoslo en el formulario y un fisioterapeuta te recomienda ${f ? 'la' : 'el'} que encaja, sin venderte lo que no necesitas.` }] : []),
    { q: `¿Qué garantía y mantenimiento tiene${pl}?`, a: '2 años de garantía en piezas y mano de obra, y sabes qué incluye el mantenimiento desde el primer día.' },
    { q: `¿Cuánto cuesta${pl}?`, a: 'No publicamos precios: cada propuesta se prepara según el equipo, la configuración y el país de entrega. Te la enviamos sin compromiso.' },
    { q: `¿${n === 1 ? 'Lo' : 'Los'} enviáis fuera de España?`, a: 'Sí, a la UE, USA y LATAM, con la aduana gestionada.' },
  ];
  const propias = c.faqs ?? [];
  return [...propias, ...comunes].slice(0, Math.max(5, propias.length));
}
