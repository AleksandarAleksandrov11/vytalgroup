// Tablas comparativas de las páginas pilar. Solo datos de las fuentes (catálogo ADC | VytalGroup
// 2026 y brief). Donde la fuente no da el dato, "Consultar": te lo confirmamos, no lo inventamos.

export const COMPARATIVA_ECOGRAFOS = {
  columnas: ['Formato y peso', 'Monitor', 'Puertos de sonda', 'Batería', 'Ideal para'],
  filas: [
    { slug: 'eco-wireless', valores: ['Sonda inalámbrica', 'El de tu móvil, tablet u ordenador', 'Sonda lineal o convexa', 'Hasta 60 min de uso continuo', 'Domicilio y trabajo de campo'] },
    { slug: 'acclarix-ax2', valores: ['Portátil, 4,5 kg', '15,6″ y táctil de 10,1″', '1', 'Doble, más de 2 h', 'Punto de atención'] },
    { slug: 'acclarix-ax3', valores: ['Portátil, 4,5 kg', '15,6″ y táctil de 10,1″', '2', 'Doble, más de 2 h', 'Consulta con varias sondas'] },
    { slug: 'acclarix-ax8', valores: ['Portátil, 9,25 kg', '15″ HD y doble táctil', 'Consultar', 'Extraíble, aprox. 60 min', 'Ecoguiados, dolor y deporte'] },
    { slug: 'acclarix-ax9', valores: ['Portátil, 4,8 kg', '15,6″ y táctil de 12,3″', 'Consultar', 'Consultar', 'Cardiología y vascular'] },
    { slug: 'acclarix-lx3', valores: ['Carro', '21,5″ y táctil de 14″', '5', 'Doble', 'Primer servicio de ecografía'] },
    { slug: 'acclarix-lx9', valores: ['Carro', '21,5″ en brazo y táctil de 14″', '5', 'Doble, integrada', 'Consulta integral'] },
    { slug: 'acclarix-lx25', valores: ['Carro 3D/4D', '21,5″ y táctil de 14″', '3', 'Consultar', 'Obstetricia, abdomen y vascular'] },
    { slug: 'acclarix-lx85', valores: ['Carro', '21,5″ LED y táctil de 14″', '5', 'Doble, integrada', 'Diagnóstico experto'] },
    { slug: 'acclarix-gx9', valores: ['Carro compacto', 'Táctil de gran formato', 'Consultar', 'Consultar', 'Salud de la mujer'] },
  ],
};

export const COMPARATIVA_DIATERMIAS = {
  columnas: ['Potencia', 'Frecuencias', 'Programas', 'Modos y cabezales', 'Para quién es'],
  filas: [
    { slug: 'diatermia-multifuncion', valores: ['Consultar', 'Consultar', 'Protocolos por zona en mapa corporal', 'RET, CET, TENS e IFC; 4 canales', 'Diatermia y electroterapia en la misma sesión'] },
    { slug: 'reatherm', valores: ['200 W', '400, de 300 a 700 kHz', '50 programas y 10 memorias libres', 'Resistivo, capacitivo y bipolar', 'Rehabilitación, deporte y estética'] },
    { slug: 'reacare', valores: ['160 W', '400 a 600 kHz', '34 programas, personalizado y 10 memorias', 'Resistivo y capacitivo', 'Rehabilitación y deporte'] },
    { slug: 'hr-tek', valores: ['250 W', '445, 900 y 1200 kHz (SP: 445 kHz)', '47 predefinidos y 200 memorizables', 'Resistivo, capacitivo y bipolar; 2 canales', 'Atermia, homeotermia e hipertermia'] },
  ],
};
