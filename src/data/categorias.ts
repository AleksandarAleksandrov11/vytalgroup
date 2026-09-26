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
}

export const CATEGORIAS: Categoria[] = [
  {
    id: 'ecografia',
    nombre: 'Ecografía',
    corto: 'Ecografía',
    ruta: '/ecografos',
    pilar: true,
    orden: 1,
    h1: 'Ecógrafos para fisioterapia. *Elegidos por fisios.*',
    apoyo: 'Inalámbricos, portátiles y de carro. Te ayudamos a elegir el que encaja con tu forma de trabajar.',
    descripcion: 'Sonda inalámbrica, portátiles y carros de consulta EDAN Acclarix.',
    queEs: [
      'La ecografía permite ver en tiempo real músculos, tendones y partes blandas. En fisioterapia se usa para explorar y para guiar procedimientos.',
    ],
    imagen: 'ecografo-portatil-acclarix-ax8-edan',
    formEquipo: 'Ecógrafo',
    seoTitle: 'Ecógrafo para fisioterapia: inalámbrico, portátil o de carro',
    seoDescription: 'Ecógrafos para fisioterapia y medicina: sonda inalámbrica Eco Wireless y gama EDAN Acclarix. 2 años de garantía y te asesoran fisioterapeutas.',
  },
  {
    id: 'diatermia',
    nombre: 'Diatermia y tecarterapia',
    corto: 'Diatermia',
    ruta: '/diatermias',
    pilar: true,
    orden: 2,
    h1: 'Diatermia y tecarterapia. *Sin letra pequeña.*',
    apoyo: 'Capacitiva, resistiva y bipolar. Cuatro equipos, cada uno con su sitio en la consulta.',
    descripcion: 'Diatermia capacitiva y resistiva de VytaMeD, I-Tech y EME.',
    queEs: [
      'La diatermia capacitiva y resistiva (tecarterapia) usa energía de radiofrecuencia para generar calor dentro de los tejidos.',
    ],
    imagen: 'diatermia-multifuncion-vytamed',
    formEquipo: 'Diatermia',
    seoTitle: 'Diatermia para fisioterapia y tecarterapia | VytalGroup',
    seoDescription: 'Equipos de diatermia capacitiva y resistiva para fisioterapia: VytaMeD, Reatherm, Reacare y HR Tek. Te asesoran fisioterapeutas, sin letra pequeña.',
  },
  {
    id: 'ondas-de-choque',
    nombre: 'Ondas de choque',
    corto: 'Ondas de choque',
    ruta: '/equipos/ondas-de-choque',
    pilar: false,
    orden: 3,
    h1: 'Ondas de choque para fisioterapia. *Sin letra pequeña.*',
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
    h1: 'Magnetoterapia profesional. *Sin letra pequeña.*',
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
    h1: 'Láser de alta potencia para fisioterapia. *Sin letra pequeña.*',
    apoyo: 'Láser de diodo y Nd:YAG, de contacto y de barrido, con longitudes de onda de 808 a 1064 nm.',
    descripcion: 'Láser de alta potencia, de barrido y de baja potencia para consulta.',
    queEs: [
      'El láser terapéutico emite luz de una longitud de onda concreta, en modo continuo o pulsado, sobre la zona de tratamiento.',
      'Cada longitud de onda tiene un uso distinto según el fabricante: 808 nm para bioestimulación, 980 nm con efecto térmico y 1064 nm para mayor profundidad.',
    ],
    imagen: 'laser-terapeutico-alta-potencia',
    formEquipo: 'Otro equipo',
    formOtro: 'Láser terapéutico',
    seoTitle: 'Láser de alta potencia para fisioterapia | VytalGroup',
    seoDescription: 'Láser terapéutico para fisioterapia: alta potencia 808 y 980 nm, Crystal YAG y Bipower Lux de EME, láser de barrido PR999 y Lasermed de baja potencia.',
  },
  {
    id: 'electrolisis-percutanea',
    nombre: 'Electrólisis percutánea',
    corto: 'Electrólisis',
    ruta: '/equipos/electrolisis-percutanea',
    pilar: false,
    orden: 6,
    h1: 'Electrólisis percutánea ecoguiada. *Sin letra pequeña.*',
    apoyo: 'Physio Invasiva 2.0 de EasyTech: electrólisis, PES, microcorrientes y TENS en un equipo compacto.',
    descripcion: 'Physio Invasiva 2.0: electrólisis ecoguiada, PES y TENS en un equipo.',
    queEs: [
      'La electrólisis percutánea ecoguiada (USGET) aplica corriente galvánica a través de una aguja, con la ecografía como guía.',
      'El fabricante la indica para tendinopatías, epicondilitis, fascitis plantar, bursitis y síndrome miofascial.',
    ],
    imagen: 'electrolisis-percutanea-physio-invasiva-easytech',
    formEquipo: 'Otro equipo',
    formOtro: 'Electrólisis percutánea',
    seoTitle: 'Electrólisis percutánea ecoguiada: Physio Invasiva 2.0',
    seoDescription: 'Equipo de electrólisis percutánea ecoguiada para fisioterapia: Physio Invasiva 2.0 de EasyTech, con PES, microcorrientes y TENS. Te asesoran fisioterapeutas.',
    faqs: [
      { q: '¿Necesito un ecógrafo para la electrólisis percutánea?', a: 'La técnica USGET se hace con guía ecográfica. Por eso solemos plantear Physio Invasiva 2.0 junto a un ecógrafo portátil o inalámbrico.' },
    ],
  },
  {
    id: 'electroterapia',
    nombre: 'Electroterapia y terapia combinada',
    corto: 'Electroterapia',
    ruta: '/equipos/electroterapia',
    pilar: false,
    orden: 7,
    h1: 'Electroterapia profesional. *Sin letra pequeña.*',
    apoyo: 'Electroestimulación, corrientes para consulta y equipos que combinan varias terapias en uno.',
    descripcion: 'TENS, EMS e interferenciales, y equipos combinados de EME e I-Tech.',
    queEs: [
      'La electroterapia aplica corrientes eléctricas a través de electrodos: TENS, estimulación neuromuscular (EMS o NEMS), interferenciales o diadinámicas, según el equipo.',
      'Los equipos combinados suman en una sola plataforma ultrasonidos, láser o magnetoterapia.',
    ],
    imagen: 'electroterapia-therapic-eme',
    formEquipo: 'Otro equipo',
    formOtro: 'Electroterapia',
    seoTitle: 'Electroterapia profesional y terapia combinada | VytalGroup',
    seoDescription: 'Electroterapia para fisioterapia: T-One Coach de I-Tech, Therapic, Combimed y Polyter Evo de EME. Canales, corrientes y programas, explicados sin letra pequeña.',
  },
  {
    id: 'ultrasonidos',
    nombre: 'Ultrasonidos terapéuticos',
    corto: 'Ultrasonidos',
    ruta: '/equipos/ultrasonidos',
    pilar: false,
    orden: 8,
    h1: 'Ultrasonidos terapéuticos. *Sin letra pequeña.*',
    apoyo: 'Equipos de ultrasonidos de 1 y 3 MHz de I-Tech y EME, con uno o dos cabezales.',
    descripcion: 'Ultrasonidos de 1 y 3 MHz con uno o dos cabezales.',
    queEs: [
      'Los ultrasonidos terapéuticos aplican ondas sonoras de alta frecuencia, de 1 o 3 MHz, con un cabezal en contacto con la piel.',
      'No son ecografía: tratan, no dan imagen.',
    ],
    imagen: 'ultrasonidos-ut2-i-tech',
    formEquipo: 'Otro equipo',
    formOtro: 'Ultrasonidos terapéuticos',
    seoTitle: 'Ultrasonidos terapéuticos para fisioterapia | VytalGroup',
    seoDescription: 'Equipos de ultrasonidos terapéuticos para fisioterapia: I-Tech UT2 con doble manípulo y Ultrasonic 1300 y 1500 de EME, de 1 y 3 MHz. Asesoramiento honesto.',
  },
  {
    id: 'presoterapia',
    nombre: 'Presoterapia',
    corto: 'Presoterapia',
    ruta: '/equipos/presoterapia',
    pilar: false,
    orden: 9,
    h1: 'Presoterapia profesional. *Sin letra pequeña.*',
    apoyo: 'Compresión neumática secuencial para consulta, con prendas para piernas, brazos y abdomen.',
    descripcion: 'Compresión neumática secuencial para piernas, brazos y abdomen.',
    queEs: [
      'La presoterapia aplica compresión neumática secuencial con prendas de varias cámaras que se inflan por tramos.',
      'El catálogo del fabricante la indica para edemas y linfedemas, insuficiencia venosa y recuperación muscular postesfuerzo.',
    ],
    imagen: 'presoterapia-beauty-press',
    formEquipo: 'Presoterapia',
    seoTitle: 'Presoterapia profesional para clínicas | VytalGroup',
    seoDescription: 'Equipos de presoterapia profesional: I-Press de I-Tech y Beauty Press, con compresión neumática secuencial. Datos claros del catálogo y te asesoran fisios.',
  },
  {
    id: 'camillas',
    nombre: 'Camillas de fisioterapia',
    corto: 'Camillas',
    ruta: '/equipos/camillas',
    pilar: false,
    orden: 10,
    h1: 'Camillas de fisioterapia. *Sin letra pequeña.*',
    apoyo: 'Seis modelos eléctricos e hidráulicos, con certificación CE y garantía mínima de 2 años.',
    descripcion: '6 modelos eléctricos e hidráulicos, con certificación CE.',
    queEs: [
      'La camilla marca el ritmo de la consulta: altura, secciones y accesos cambian según trates, explores o masajees.',
      'Hay seis modelos, desde la eléctrica estándar hasta la premium con control multisección y mando a pedal.',
    ],
    imagen: 'camilla-electrica-estandar',
    formEquipo: 'Otro equipo',
    formOtro: 'Camillas de fisioterapia',
    seoTitle: 'Camillas de fisioterapia, eléctricas o hidráulicas',
    seoDescription: 'Camillas de fisioterapia y exploración: 6 modelos eléctricos e hidráulicos con certificación CE y garantía mínima de 2 años. Te ayudamos a elegir la tuya.',
  },
  {
    id: 'diatermia-microondas',
    nombre: 'Diatermia por microondas',
    corto: 'Microondas',
    ruta: '/equipos/diatermia-microondas',
    pilar: false,
    orden: 11,
    h1: 'Diatermia por microondas. *Sin letra pequeña.*',
    apoyo: 'Radarmed 2500 CP de EME: calentamiento profundo con brazo articulado de tres articulaciones.',
    descripcion: 'Radarmed 2500 CP de EME, a 2450 MHz con brazo articulado.',
    queEs: [
      'La diatermia por microondas induce calor en el interior de los tejidos mediante una antena montada en un brazo articulado.',
      'Es una tecnología distinta de la tecarterapia: trabaja a una frecuencia de 2450 MHz.',
    ],
    imagen: 'diatermia-microondas-radarmed-2500-cp-eme',
    formEquipo: 'Otro equipo',
    formOtro: 'Diatermia por microondas',
    seoTitle: 'Diatermia por microondas para fisioterapia | VytalGroup',
    seoDescription: 'Diatermia por microondas para fisioterapia: Radarmed 2500 CP de EME, 250 W en continuo a 2450 MHz y brazo de 3 articulaciones. Pide asesoramiento.',
  },
  {
    id: 'estetica-medica',
    nombre: 'Estética médica',
    corto: 'Estética',
    ruta: '/equipos/estetica-medica',
    pilar: false,
    orden: 12,
    h1: 'Equipos de estética médica. *Sin letra pequeña.*',
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
  },
];

export const CAT = Object.fromEntries(CATEGORIAS.map((c) => [c.id, c])) as Record<CategoriaId, Categoria>;

/** Opciones del desplegable "Otro equipo" del formulario (paso 1) */
export const OTROS_EQUIPOS = [
  ...CATEGORIAS.filter((c) => c.formOtro).map((c) => c.formOtro as string),
  'Otro',
];
