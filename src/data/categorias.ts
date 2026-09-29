// Categorías del catálogo. Ecografía y diatermia tienen página pilar propia (/ecografos y
// /diatermias); el resto vive en /equipos/[slug]. Todas las páginas se generan desde aquí.

export type CategoriaId =
  | 'ecografia'
  | 'diatermia'
  | 'ondas-de-choque'
  | 'magnetoterapia'
  | 'laser'
  | 'electrolisis-percutanea'
  | 'electroterapia'
  | 'ultrasonidos'
  | 'presoterapia'
  | 'camillas'
  | 'diatermia-microondas'
  | 'estetica-medica';

/** Valor del paso 1 del formulario (igual que en la landing) */
export type EquipoForm = 'Ecógrafo' | 'Diatermia' | 'Presoterapia' | 'Ondas de choque' | 'Otro equipo';

export interface Faq { q: string; a: string }

export interface Categoria {
  id: CategoriaId;
  nombre: string;          // "Ondas de choque"
  corto: string;           // chip del catálogo: "Ondas de choque"
  ruta: string;            // "/equipos/ondas-de-choque"
  pilar: boolean;
  orden: number;
  /** Titular H1 con el acento en cursiva al final (se marca con *...*) */
  h1: string;
  apoyo: string;           // línea de apoyo bajo el H1
  descripcion: string;     // una línea (hover en rejillas y desplegable)
  queEs: string[];         // "Qué es y para qué se usa": 2 o 3 frases
  imagen: string;          // imagen representativa (src/assets/productos)
  formEquipo: EquipoForm;
  formOtro?: string;       // opción del desplegable "Otro equipo"
  seoTitle: string;
  seoDescription: string;
  faqs?: Faq[];
  /** Tema en minúsculas para "Dudas sobre …" y las preguntas, si `corto` no basta ("Microondas" suelto) */
  tema?: string;
  /** Cómo se nombran sus equipos cuando "equipo(s) de …" suena raro (camillas) */
  nombres?: { uno: string; varios: string; f?: boolean };
}

/** Tema y nombres de los equipos de una categoría para titulares y preguntas:
 *  "Los 15 equipos de *ecografía.*", "Las 6 *camillas.*", "¿Qué equipo de diatermia por microondas tenéis?" */
export function nombresCat(c: Pick<Categoria, 'corto' | 'tema' | 'nombres'>) {
  const tema = c.tema ?? c.corto.toLowerCase();
  return { tema, uno: c.nombres?.uno ?? `equipo de ${tema}`, varios: c.nombres?.varios ?? `equipos de ${tema}`, f: !!c.nombres?.f };
}

export const CATEGORIAS: Categoria[] = [
  {
    id: 'ecografia',
    nombre: 'Ecografía',
    corto: 'Ecografía',
    ruta: '/ecografos',
    pilar: true,
    orden: 1,
    h1: 'Ecógrafos para *fisioterapia.*',
    apoyo: 'Inalámbricos, portátiles y de carro. Te ayudamos a elegir el que encaja con tu forma de trabajar.',
    descripcion: 'Sonda inalámbrica y ecógrafos EDAN de bolsillo, portátiles y de carro.',
    queEs: [
      'La ecografía permite ver en tiempo real músculos, tendones y partes blandas. En fisioterapia se usa para explorar y para guiar procedimientos.',
    ],
    imagen: 'ecografo-portatil-acclarix-ax8-edan',
    formEquipo: 'Ecógrafo',
    seoTitle: 'Ecógrafo para fisioterapia: inalámbrico, portátil o de carro',
    seoDescription: 'Ecógrafos para fisioterapia y medicina: sonda inalámbrica Eco Wireless y gama EDAN de bolsillo, portátil y de carro. 2 años de garantía y asesoría experta.',
  },
  {
    id: 'diatermia',
    nombre: 'Diatermia y tecarterapia',
    corto: 'Diatermia',
    ruta: '/diatermias',
    pilar: true,
    orden: 2,
    h1: 'Diatermia y *tecarterapia.*',
    apoyo: 'Capacitiva, resistiva y bipolar. Cuatro equipos, cada uno con su sitio en la consulta.',
    descripcion: 'Diatermia capacitiva y resistiva de VytaMeD, I-Tech y EME.',
    queEs: [
      'La diatermia capacitiva y resistiva (tecarterapia) usa energía de radiofrecuencia para generar calor dentro de los tejidos.',
    ],
    imagen: 'diatermia-multifuncion-vytamed',
    formEquipo: 'Diatermia',
    seoTitle: 'Diatermia capacitiva y resistiva (tecarterapia) | VytalGroup',
    seoDescription: 'Equipos de diatermia capacitiva y resistiva para fisioterapia: VytaMeD, Reatherm, Reacare y HR Tek. Te asesoran fisioterapeutas, con 2 años de garantía.',
  },
  {
    id: 'ondas-de-choque',
    nombre: 'Ondas de choque',
    corto: 'Ondas de choque',
    ruta: '/equipos/ondas-de-choque',
    pilar: false,
    orden: 3,
    h1: 'Ondas de choque para *fisioterapia.*',
    apoyo: 'Equipos de ondas de choque radiales de EME y LiKAMED, y una plataforma que las combina con láser.',
    descripcion: 'Ondas de choque radiales de EME y LiKAWAVE para consulta y deporte.',
    queEs: [
      'La terapia extracorpórea por ondas de choque (ESWT) transmite impulsos mecánicos a los tejidos a través de un aplicador.',
      'Los fabricantes la orientan a tendinopatías crónicas y calcificaciones, epicondilitis, fascitis plantar y rehabilitación ortopédica y deportiva, siempre según el criterio del profesional.',
    ],
    imagen: 'ondas-de-choque-shock-med-eme',
    formEquipo: 'Ondas de choque',
    seoTitle: 'Ondas de choque para fisioterapia: equipos y modelos',
    seoDescription: 'Equipos de ondas de choque para fisioterapia: Shock Med de EME, LiKAWAVE VARIO de LiKAMED e Intelect. Especificaciones claras y 2 años de garantía.',
    faqs: [
      { q: '¿Qué diferencia hay entre Shock Med y Shock Med SP?', a: 'Shock Med llega a 5 bar, de 1 a 20 Hz y 23 MPa de presión máxima. Shock Med SP llega a 4 bar, de 1 a 15 Hz y 19 MPa.' },
      { q: '¿Y entre LiKAWAVE VARIO 3i y VARIO 2i?', a: 'El VARIO 3i tiene pantalla táctil de 10,1 pulgadas y hasta 25 Hz. El VARIO 2i, más compacto, pantalla de 7 pulgadas y hasta 15 Hz; los dos con compresor de hasta 6,5 bar.' },
    ],
  },
  {
    id: 'magnetoterapia',
    nombre: 'Magnetoterapia y superinductiva',
    corto: 'Magnetoterapia',
    ruta: '/equipos/magnetoterapia',
    pilar: false,
    orden: 4,
    h1: 'Magnetoterapia *profesional.*',
    apoyo: 'Superinducción de alta intensidad VytaMeD y magnetoterapia de baja frecuencia de I-Tech y EME.',
    descripcion: 'Superinductiva VytaMeD y campos magnéticos pulsados de I-Tech y EME.',
    queEs: [
      'La magnetoterapia aplica campos magnéticos pulsados sobre la zona de tratamiento.',
      'Hay dos familias: la de baja frecuencia (CEMP), con fajas o solenoides, y la de alta intensidad o superinducción (HILT-Mag), con un aplicador en brazo articulado.',
    ],
    imagen: 'magnetoterapia-superinductiva-clinica-vytamed',
    formEquipo: 'Otro equipo',
    formOtro: 'Magnetoterapia',
    seoTitle: 'Magnetoterapia profesional y superinductiva | VytalGroup',
    seoDescription: 'Magnetoterapia profesional: Superinductiva VytaMeD de alta intensidad, Lamagneto de I-Tech y Magnetomed de EME. Datos del catálogo y asesoramiento.',
    faqs: [
      { q: '¿Qué diferencia hay entre superinducción y magnetoterapia CEMP?', a: 'La Superinductiva genera campos pulsados de alta intensidad (hasta 3.000 W pico) con un aplicador en brazo articulado. Lamagneto y Magnetomed trabajan con campos de baja frecuencia, de hasta 150 y 100 gauss.' },
    ],
  },
  {
    id: 'laser',
    nombre: 'Láser terapéutico',
    corto: 'Láser',
    ruta: '/equipos/laser',
    pilar: false,
    orden: 5,
    h1: 'Láser terapéutico para *fisioterapia.*',
    apoyo: 'Láser de diodo y Nd:YAG, de contacto y de barrido, con longitudes de onda de 808 a 1064 nm.',
    descripcion: 'Láser de alta potencia, de barrido y de baja potencia para consulta.',
    queEs: [
      'El láser terapéutico emite luz de una longitud de onda concreta, en modo continuo o pulsado, sobre la zona de tratamiento.',
      'Cada longitud de onda tiene un uso distinto según el fabricante: 808 nm para bioestimulación, 980 nm con efecto térmico y 1064 nm para mayor profundidad.',
    ],
    imagen: 'laser-terapeutico-alta-potencia',
    formEquipo: 'Otro equipo',
    formOtro: 'Láser terapéutico',
    seoTitle: 'Láser terapéutico y de alta potencia para fisioterapia',
    seoDescription: 'Láser terapéutico para fisioterapia: alta potencia 808 y 980 nm, Crystal YAG y Bipower Lux de EME, láser de barrido PR999 y Lasermed de baja potencia.',
    faqs: [
      { q: '¿Qué diferencia hay entre el láser de alta y el de baja potencia?', a: 'El Lasermed 2200 de EME es de baja potencia, 905 nm, para fotobioestimulación. El Láser terapéutico (808 y 980 nm, hasta 10 W en continua) y el Crystal YAG / Bipower Lux (de 9 a 18 W según modelo) son de alta potencia.' },
      { q: '¿Qué longitud de onda necesito?', a: 'Según el fabricante, 808 nm para bioestimulación, 980 nm con efecto térmico y 1064 nm para mayor profundidad.' },
      { q: '¿Qué es un láser de barrido?', a: 'El PR999 de EME barre la zona de forma automática, con una amplitud de 1 a 20 cm, para tratar superficies amplias sin intervención manual.' },
    ],
  },
  {
    id: 'electrolisis-percutanea',
    nombre: 'Electrólisis percutánea',
    corto: 'Electrólisis',
    ruta: '/equipos/electrolisis-percutanea',
    pilar: false,
    orden: 6,
    h1: 'Electrólisis percutánea *ecoguiada.*',
    apoyo: 'Physio Invasiva 2.0 de EasyTech: electrólisis, PES, microcorrientes y TENS en un equipo compacto.',
    descripcion: 'Physio Invasiva 2.0: electrólisis ecoguiada, PES y TENS en un equipo.',
    queEs: [
      'La electrólisis percutánea ecoguiada (USGET) aplica corriente galvánica a través de una aguja, con la [ecografía](/ecografos) como guía.',
      'El fabricante la indica para tendinopatías, epicondilitis, fascitis plantar, bursitis y síndrome miofascial.',
    ],
    imagen: 'electrolisis-percutanea-physio-invasiva-easytech',
    formEquipo: 'Otro equipo',
    formOtro: 'Electrólisis percutánea',
    seoTitle: 'Equipos de electrólisis percutánea ecoguiada | VytalGroup',
    seoDescription: 'Equipo de electrólisis percutánea ecoguiada para fisioterapia: Physio Invasiva 2.0 de EasyTech, con PES, microcorrientes y TENS. Te asesoran fisioterapeutas.',
    faqs: [
      { q: '¿Necesito un ecógrafo para la electrólisis percutánea?', a: 'La técnica USGET se hace con guía ecográfica. Por eso solemos plantear Physio Invasiva 2.0 junto a un [ecógrafo portátil o inalámbrico](/ecografos).' },
    ],
  },
  {
    id: 'electroterapia',
    nombre: 'Electroterapia y terapia combinada',
    corto: 'Electroterapia',
    ruta: '/equipos/electroterapia',
    pilar: false,
    orden: 7,
    h1: 'Electroterapia *profesional.*',
    apoyo: 'Electroestimulación, corrientes para consulta y equipos que combinan varias terapias en uno.',
    descripcion: 'TENS, EMS e interferenciales, y equipos combinados de EME e I-Tech.',
    queEs: [
      'La electroterapia aplica corrientes eléctricas a través de electrodos: TENS, estimulación neuromuscular (EMS o NEMS), interferenciales o diadinámicas, según el equipo.',
      'Los equipos combinados suman en una sola plataforma [ultrasonidos](/equipos/ultrasonidos), [láser](/equipos/laser) o [magnetoterapia](/equipos/magnetoterapia).',
    ],
    imagen: 'electroterapia-therapic-eme',
    formEquipo: 'Otro equipo',
    formOtro: 'Electroterapia',
    seoTitle: 'Electroterapia profesional y terapia combinada | VytalGroup',
    seoDescription: 'Electroterapia para fisioterapia: T-One Coach de I-Tech, Therapic, Combimed y Polyter Evo de EME. Canales, corrientes y programas, explicados con claridad.',
    faqs: [
      { q: '¿Qué corrientes tienen los equipos de electroterapia?', a: 'Según el equipo, TENS, EMS, diadinámicas, Kotz o interferenciales. El Therapic de EME llega a 25 formas de onda, en 2 o 4 canales.' },
      { q: '¿Qué es un equipo de terapia combinada?', a: 'Una sola plataforma con varias terapias: Combimed suma electroterapia y ultrasonidos (el 4000, también láser de baja potencia de 905 nm) y Polyter Evo combina hasta cuatro tecnologías en un equipo con batería.' },
    ],
  },
  {
    id: 'ultrasonidos',
    nombre: 'Ultrasonidos terapéuticos',
    corto: 'Ultrasonidos',
    ruta: '/equipos/ultrasonidos',
    pilar: false,
    orden: 8,
    h1: 'Ultrasonidos *terapéuticos.*',
    apoyo: 'Equipos de ultrasonidos de 1 y 3 MHz de I-Tech y EME, con uno o dos cabezales.',
    descripcion: 'Ultrasonidos de 1 y 3 MHz con uno o dos cabezales.',
    queEs: [
      'Los ultrasonidos terapéuticos aplican ondas sonoras de alta frecuencia, de 1 o 3 MHz, con un cabezal en contacto con la piel.',
      'No son [ecografía](/ecografos): tratan, no dan imagen.',
    ],
    imagen: 'ultrasonidos-ut2-i-tech',
    formEquipo: 'Otro equipo',
    formOtro: 'Ultrasonidos terapéuticos',
    seoTitle: 'Ultrasonidos terapéuticos para fisioterapia | VytalGroup',
    seoDescription: 'Equipos de ultrasonidos terapéuticos para fisioterapia: I-Tech UT2 con doble manípulo y Ultrasonic 1300 y 1500 de EME, de 1 y 3 MHz. Asesoramiento honesto.',
    faqs: [
      { q: '¿Los ultrasonidos terapéuticos son lo mismo que la ecografía?', a: 'No. Los ultrasonidos terapéuticos tratan con un cabezal de 1 o 3 MHz y no dan imagen. Para ver músculos y tendones necesitas un [ecógrafo](/ecografos).' },
      { q: '¿Qué diferencia hay entre UT2 y Ultrasonic?', a: 'UT2 de I-Tech tiene doble manípulo, de 5 y 1 cm², y sirve para uso externo e inmersión. Ultrasonic de EME tiene dos versiones: 1300, con un canal, y 1500, con dos canales independientes.' },
    ],
  },
  {
    id: 'presoterapia',
    nombre: 'Presoterapia',
    corto: 'Presoterapia',
    ruta: '/equipos/presoterapia',
    pilar: false,
    orden: 9,
    h1: 'Presoterapia *profesional.*',
    apoyo: 'Compresión neumática secuencial para consulta, con prendas para piernas, brazos y abdomen.',
    descripcion: 'Compresión neumática secuencial para piernas, brazos y abdomen.',
    queEs: [
      'La presoterapia aplica compresión neumática secuencial con prendas de varias cámaras que se inflan por tramos.',
      'El catálogo del fabricante la indica para edemas y linfedemas, insuficiencia venosa y recuperación muscular postesfuerzo.',
    ],
    imagen: 'presoterapia-beauty-press',
    formEquipo: 'Presoterapia',
    seoTitle: 'Presoterapia profesional para clínicas | VytalGroup',
    seoDescription: 'Equipos de presoterapia profesional: I-Press de I-Tech y Beauty Press, con compresión neumática secuencial. Te asesoran fisioterapeutas, sin compromiso.',
    faqs: [
      { q: '¿Para qué se usa la presoterapia?', a: 'El fabricante de I-Press la indica para edemas y linfedemas, úlceras venosas e insuficiencia venosa, y recuperación muscular postesfuerzo.' },
      { q: '¿Qué diferencia hay entre I-Press y Beauty Press?', a: 'I-Press de I-Tech está pensado para patologías circulatorias y puede usarlo el propio paciente de forma autónoma. Beauty Press tiene nueve salidas y programas de masaje peristáltico y drenaje linfático.' },
    ],
  },
  {
    id: 'camillas',
    nombre: 'Camillas de fisioterapia',
    corto: 'Camillas',
    ruta: '/equipos/camillas',
    pilar: false,
    orden: 10,
    h1: 'Camillas de *fisioterapia.*',
    apoyo: 'Seis modelos eléctricos e hidráulicos, con certificación CE y garantía mínima de 2 años.',
    descripcion: '6 modelos eléctricos e hidráulicos, con certificación CE.',
    queEs: [
      'La camilla marca el ritmo de la consulta: altura, secciones y accesos cambian según trates, explores o masajees.',
      'Hay seis modelos, desde la eléctrica estándar hasta la premium con control multisección y mando a pedal.',
    ],
    imagen: 'camilla-electrica-estandar',
    formEquipo: 'Otro equipo',
    formOtro: 'Camillas de fisioterapia',
    nombres: { uno: 'camilla', varios: 'camillas', f: true },
    seoTitle: 'Camillas de fisioterapia, eléctricas o hidráulicas',
    seoDescription: 'Camillas de fisioterapia y exploración: 6 modelos eléctricos e hidráulicos con certificación CE y garantía mínima de 2 años. Te ayudamos a elegir la tuya.',
    faqs: [
      { q: '¿Camilla eléctrica o hidráulica?', a: 'Las eléctricas (Estándar, Multiposición y Premium) ajustan la altura con motor; la Premium, también la posición, con mando a pedal. Las hidráulicas (Compacta, Clínica y Pro) se regulan por sistema hidráulico; la Pro es silenciosa y pensada para sesiones largas.' },
    ],
  },
  {
    id: 'diatermia-microondas',
    nombre: 'Diatermia por microondas',
    corto: 'Microondas',
    ruta: '/equipos/diatermia-microondas',
    pilar: false,
    orden: 11,
    h1: 'Diatermia por *microondas.*',
    apoyo: 'Radarmed 2500 CP de EME: calentamiento profundo con brazo articulado de tres articulaciones.',
    descripcion: 'Radarmed 2500 CP de EME, a 2450 MHz con brazo articulado.',
    queEs: [
      'La diatermia por microondas induce calor en el interior de los tejidos mediante una antena montada en un brazo articulado.',
      'Es una tecnología distinta de la [tecarterapia](/diatermias): trabaja a una frecuencia de 2450 MHz.',
    ],
    imagen: 'diatermia-microondas-radarmed-2500-cp-eme',
    formEquipo: 'Otro equipo',
    formOtro: 'Diatermia por microondas',
    tema: 'diatermia por microondas',
    seoTitle: 'Diatermia por microondas para fisioterapia | VytalGroup',
    seoDescription: 'Diatermia por microondas para fisioterapia: Radarmed 2500 CP de EME, 250 W en continuo a 2450 MHz y brazo de 3 articulaciones. Pide asesoramiento.',
    faqs: [
      { q: '¿En qué se diferencia de la tecarterapia?', a: 'El Radarmed 2500 CP trabaja a 2450 MHz con una antena en brazo articulado. Las diatermias de [tecarterapia](/diatermias) (Reatherm, Reacare y HR Tek) trabajan en radiofrecuencia, entre 300 y 1200 kHz.' },
    ],
  },
  {
    id: 'estetica-medica',
    nombre: 'Estética médica',
    corto: 'Estética',
    ruta: '/equipos/estetica-medica',
    pilar: false,
    orden: 12,
    h1: 'Equipos de estética *médica.*',
    apoyo: 'Tecnologías para tratamientos faciales, corporales y depilación en clínicas y centros especializados.',
    descripcion: 'Radiofrecuencia, láser de diodo, ondas acústicas y más para cabina.',
    queEs: [
      'La línea de estética reúne equipos para tratamientos faciales, corporales, remodelación y depilación.',
      'La configuración y los accesorios de cada equipo se ajustan a una propuesta técnica personalizada.',
    ],
    imagen: 'estetica-reshape-plus',
    formEquipo: 'Otro equipo',
    formOtro: 'Estética médica',
    seoTitle: 'Equipos de estética médica profesional | VytalGroup',
    seoDescription: 'Equipos de estética médica para clínicas: radiofrecuencia, láser de diodo 808 nm, ondas acústicas, electroporación y presoterapia. Propuesta clara.',
    faqs: [
      { q: '¿Qué tecnologías incluye la línea de estética?', a: 'Radiofrecuencia multipolar (Rigenera 3 Pro Age), láser de diodo de 808 nm (Epil Evo Smart), ondas acústicas de 1 a 5 bar (Reshape Plus), electroporación (BioRev-Tech), un sistema electrocéutico multicanal (Echos) y oxígeno (Ageless).' },
    ],
  },
];

export const CAT = Object.fromEntries(CATEGORIAS.map((c) => [c.id, c])) as Record<CategoriaId, Categoria>;

/** Opciones del desplegable "Otro equipo" del formulario (paso 1) */
export const OTROS_EQUIPOS = [
  ...CATEGORIAS.filter((c) => c.formOtro).map((c) => c.formOtro as string),
  'Otro',
];
