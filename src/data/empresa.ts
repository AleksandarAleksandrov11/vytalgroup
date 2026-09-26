// Datos de la empresa: solo los que aparecen en el brief, la landing y el catálogo.

export const EMPRESA = {
  nombre: 'VytalGroup',
  socio: 'ADC Global Tech',
  marcaPropia: 'VytaMeD',
  telefono: '+34 616 372 644',
  telefonoHref: 'tel:+34616372644',
  /** Para mostrar en pantalla: con espacios de no separación, para que el número no se parta */
  telefonoTexto: '+34\u00A0616\u00A0372\u00A0644',
  whatsapp: '34616372644',
  email: 'vytalkinetech@gmail.com',
  instagramMarca: { usuario: 'vytalgroup', url: 'https://www.instagram.com/vytalgroup/' },
  instagramJavier: { usuario: 'fisioruiz_', url: 'https://www.instagram.com/fisioruiz_/' },
  fundador: 'Javier Ruiz',
  catalogoPdf: '/assets/docs/catalogo-vytalgroup-2026.pdf',
  catalogoPaginas: 53,
  catalogoNombre: 'Catálogo internacional de equipamiento médico 2026',
} as const;

/** Enlace de WhatsApp con mensaje prellenado */
export const wa = (texto = 'Hola, vengo de la web y quiero información.') =>
  `https://wa.me/${EMPRESA.whatsapp}?text=${encodeURIComponent(texto)}`;

/** Claims propios que se pueden usar (apartado 1.2 del brief) */
export const CLAIMS = {
  garantia: '2 años de garantía en piezas y mano de obra',
  mantenimiento: 'Mantenimiento claro, sin sorpresas',
  certificados: 'Equipos certificados CE / MDR',
  envios: 'Envío a UE, USA y LATAM con la aduana gestionada',
  asesoran: 'Te asesoran fisioterapeutas',
  todo: 'Todo tu equipamiento en un solo sitio',
} as const;

/** Cinta de confianza (idéntica a la landing) */
export const CINTA = [
  { icono: 'i-shield', fuerte: '2 años', resto: 'de garantía' },
  { icono: 'i-medal', fuerte: 'CE / MDR', resto: 'certificados' },
  { icono: 'i-globe', fuerte: 'UE, USA y LATAM', resto: 'envíos' },
  { icono: 'i-users', fuerte: 'Fisioterapeutas', resto: 'te asesoran' },
  { icono: 'i-tool', fuerte: '0 sorpresas', resto: 'en mantenimiento' },
  { icono: 'i-book', fuerte: '53 páginas', resto: 'de catálogo' },
] as const;

/** Comparador "Otras marcas frente a VytalGroup" (idéntico a la landing) */
export const COMPARADOR = [
  ['Te vende un comercial', 'Te asesoran fisioterapeutas'],
  ['Mantenimiento con sorpresas', 'Mantenimiento claro desde el día uno'],
  ['Garantía con letra pequeña', '2 años en piezas y mano de obra'],
  ['Envío y aduana por tu cuenta', 'Aduana gestionada en UE, USA y LATAM'],
  ['Un proveedor para cada equipo', 'Todo tu equipamiento en un solo sitio'],
] as const;

/** Servicios (catálogo, página 53) */
export const SERVICIOS = [
  'Asesoramiento en la selección y configuración del equipo',
  'Coordinación de importación y entrega internacional',
  'Instalación, formación y soporte según proyecto',
  'Opciones comerciales bajo presupuesto',
] as const;

/** Marcas con las que trabaja VytalGroup */
export const MARCAS = ['EDAN', 'I-Tech', 'EME', 'EasyTech', 'LiKAMED', 'VytaMeD'] as const;
