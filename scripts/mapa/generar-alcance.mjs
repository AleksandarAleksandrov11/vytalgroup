// Genera el mapa de "Alcance internacional" (Sobre nosotros):
//  · src/assets/mapa/alcance-tierra.svg: los países de Natural Earth 1:110m (paquete world-atlas) en proyección
//    Natural Earth centrada en el Atlántico, recortados a América y Europa. Los países con envío van algo más
//    claros y las fronteras son el propio trazo de cada país. Se sirve como imagen aparte (en caché).
//  · src/data/alcance.ts: tamaño del lienzo y la posición de los puntos en ese mismo lienzo: España (origen),
//    países de la UE, seis estados de Estados Unidos y cada país de Latinoamérica, en su centro aproximado.
// Uso: node scripts/mapa/generar-alcance.mjs   (solo hace falta volver a ejecutarlo si cambian los puntos)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { feature } from 'topojson-client';
import { geoNaturalEarth1, geoPath } from 'd3-geo';

const topo = JSON.parse(readFileSync('node_modules/world-atlas/countries-110m.json', 'utf8'));
const paises = feature(topo, topo.objects.countries);

// Puntos: [nombre, longitud, latitud]
const ORIGEN = ['España', -3.7, 40.2];
const UE = [
  ['Portugal', -8.1, 39.6], ['Francia', 2.4, 46.6], ['Países Bajos', 5.6, 52.2], ['Luxemburgo', 6.1, 49.8],
  ['Alemania', 10.4, 51.1], ['Italia', 12.6, 42.6], ['Austria', 14.6, 47.6], ['Polonia', 19.4, 52.0],
];
const USA = [
  ['California', -119.5, 37.2], ['Texas', -99.3, 31.3], ['Illinois', -89.2, 40.0],
  ['Florida', -81.6, 28.1], ['Pensilvania', -77.6, 40.9], ['Nueva York', -75.3, 42.9],
];
const LATAM = [
  ['México', -102.5, 23.6], ['Guatemala', -90.3, 15.6], ['El Salvador', -88.9, 13.7], ['Honduras', -86.6, 14.8],
  ['Nicaragua', -85.0, 12.8], ['Costa Rica', -84.1, 9.9], ['Panamá', -80.1, 8.5], ['Cuba', -79.3, 21.9],
  ['Haití', -72.6, 18.9], ['República Dominicana', -70.4, 18.8], ['Colombia', -73.4, 4.2], ['Venezuela', -66.3, 7.3],
  ['Ecuador', -78.4, -1.5], ['Perú', -75.0, -9.5], ['Bolivia', -64.7, -16.7], ['Brasil', -51.9, -10.8],
  ['Paraguay', -58.2, -23.3], ['Uruguay', -56.0, -32.8], ['Argentina', -64.6, -35.4], ['Chile', -70.7, -33.4],
];
// Países que se resaltan (nombres de Natural Earth)
const SERVIDOS = new Set([
  'Spain', 'Portugal', 'France', 'Netherlands', 'Luxembourg', 'Germany', 'Italy', 'Austria', 'Poland',
  'United States of America', 'Mexico', 'Guatemala', 'El Salvador', 'Honduras', 'Nicaragua', 'Costa Rica', 'Panama',
  'Cuba', 'Haiti', 'Dominican Rep.', 'Colombia', 'Venezuela', 'Ecuador', 'Peru', 'Bolivia', 'Brazil', 'Paraguay',
  'Uruguay', 'Argentina', 'Chile',
]);
// Colores (marino de la marca): tierra, países con envío y fronteras (color del fondo de la sección)
const C = { tierra: '#13283C', servidos: '#1B4152', fronteras: '#0B1929' };

// Encuadre: de la costa del Pacífico de EE. UU. a Polonia y del sur de Canadá a la Patagonia
const W = 1200;
const encuadre = { type: 'MultiPoint', coordinates: [[-126, 52], [-126, 22], [-82, -56], [-66, -56], [26, 56], [27, 36], [-12, 58]] };
const projection = geoNaturalEarth1().rotate([48, 0]).fitWidth(W, encuadre);
const [[, y0], [, y1]] = geoPath(projection).bounds(encuadre);
const PAD = 12;
projection.translate([projection.translate()[0], projection.translate()[1] - y0 + PAD]);
const H = Math.round(y1 - y0 + PAD * 2);
projection.clipExtent([[0, 0], [W, H]]);
const path = geoPath(projection).digits(0);

const d = (servido) => paises.features.filter((f) => SERVIDOS.has(f.properties.name) === servido).map((f) => path(f) || '').join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`
  + `<g stroke="${C.fronteras}" stroke-width="1.2" stroke-linejoin="round">`
  + `<path fill="${C.tierra}" d="${d(false)}"/><path fill="${C.servidos}" d="${d(true)}"/></g></svg>\n`;
mkdirSync('src/assets/mapa', { recursive: true });
writeFileSync('src/assets/mapa/alcance-tierra.svg', svg);

const P = ([nombre, lon, lat]) => ({ nombre, xy: projection([lon, lat]).map((v) => Math.round(v * 10) / 10) });
const out = `// Generado por scripts/mapa/generar-alcance.mjs (Natural Earth 1:110m vía world-atlas). No editar a mano.
// Puntos en el lienzo de src/assets/mapa/alcance-tierra.svg (${W} × ${H}).
export const ALCANCE = { w: ${W}, h: ${H} } as const;
type Punto = { nombre: string; xy: [number, number] };
export const ORIGEN: Punto = ${JSON.stringify(P(ORIGEN))};
export const UE: Punto[] = ${JSON.stringify(UE.map(P))};
export const USA: Punto[] = ${JSON.stringify(USA.map(P))};
export const LATAM: Punto[] = ${JSON.stringify(LATAM.map(P))};
`;
writeFileSync('src/data/alcance.ts', out);
console.log(`${W} × ${H} · mapa ${(svg.length / 1024).toFixed(1)} KB · ${UE.length} UE, ${USA.length} estados, ${LATAM.length} LATAM`);
