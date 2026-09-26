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
  { q: '¿Inalámbrico, portátil o de carro?', a: 'Si te mueves entre domicilios o trabajas en campo, la sonda inalámbrica Eco Wireless. Para ecoguiados en consulta, un portátil como el AX8 o el AX3; y para una consulta fija con varias especialidades, un carro como el LX9.' },
  { q: '¿El Eco Wireless funciona con mi móvil?', a: 'Sí: se conecta por Wi-Fi 5 GHz o USB-C con iOS, Android, Windows y macOS. Las imágenes se guardan en tu dispositivo y es compatible DICOM.' },
  { q: '¿Cuántas sondas puedo conectar?', a: 'Depende del modelo: la AX2 tiene 1 puerto activo, la AX3 tiene 2, la LX25 tiene 3 y la LX3, la LX9 y la LX85 tienen 5. El Eco Wireless es una sonda lineal o convexa según el modelo.' },
  { q: '¿Qué garantía y mantenimiento tienen?', a: '2 años de garantía en piezas y mano de obra. Y sabes qué incluye el mantenimiento desde el primer día, sin sorpresas.' },
  { q: '¿Están certificados?', a: 'El Eco Wireless es un dispositivo médico Clase IIa con marcado CE conforme al MDR (UE) 2017/745. Con los EDAN Acclarix recibes la documentación técnica y regulatoria aplicable a tu operación.' },
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
