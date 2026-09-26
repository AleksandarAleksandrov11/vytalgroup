// Genera src/data/mapa.ts: mapa del mundo en puntos (Natural Earth 1:110m, paquete world-atlas)
// y la posición de los puntos de envío (Europa, Estados Unidos y Latinoamérica).
// Uso: node scripts/mapa/generar-mapa.mjs   (solo hace falta volver a ejecutarlo si cambia el diseño)
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { geoEquirectangular, geoContains } from 'd3-geo';

const topo = JSON.parse(readFileSync('node_modules/world-atlas/land-110m.json', 'utf8'));
const land = feature(topo, topo.objects.land);
const W = 1000;
const H = 470;
// Recorte de latitudes: fuera la Antártida y el extremo norte
const projection = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2 + 38]);
const STEP = 11;
const dots = [];
for (let y = STEP / 2; y < H; y += STEP) {
  for (let x = STEP / 2; x < W; x += STEP) {
    const ll = projection.invert([x, y]);
    if (ll[1] < -56 || ll[1] > 78) continue;
    if (geoContains(land, ll)) dots.push([Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
  }
}
// Un único path: cada punto es un trazo de longitud cero con extremos redondeados
const d = dots.map(([x, y]) => `M${x} ${y}h0`).join('');
const P = (lon, lat) => projection([lon, lat]).map((v) => Math.round(v * 10) / 10);
const puntos = [
  { zona: 'europa', nombre: 'España', xy: P(-3.7, 40.4) },
  { zona: 'europa', nombre: 'Luxemburgo', xy: P(6.13, 49.61) },
  { zona: 'europa', nombre: 'Italia', xy: P(12.5, 41.9) },
  { zona: 'europa', nombre: 'Alemania', xy: P(10.0, 51.2) },
  { zona: 'usa', nombre: 'Nueva York', xy: P(-74.0, 40.7) },
  { zona: 'usa', nombre: 'Miami', xy: P(-80.2, 25.8) },
  { zona: 'usa', nombre: 'Los Ángeles', xy: P(-118.2, 34.0) },
  { zona: 'latam', nombre: 'México', xy: P(-99.1, 19.4) },
  { zona: 'latam', nombre: 'Colombia', xy: P(-74.1, 4.7) },
  { zona: 'latam', nombre: 'Perú', xy: P(-77.0, -12.0) },
  { zona: 'latam', nombre: 'Chile', xy: P(-70.6, -33.4) },
  { zona: 'latam', nombre: 'Argentina', xy: P(-58.4, -34.6) },
];
// Detalle de Europa occidental para "La historia" (Huelva, Málaga y Luxemburgo)
const E = { lon0: -11, lon1: 15, lat0: 34.5, lat1: 55 };
const EW = 520;
const eproj = geoEquirectangular().fitWidth(EW, { type: 'MultiPoint', coordinates: [[E.lon0, E.lat0], [E.lon1, E.lat1]] });
const EH = Math.round(eproj([E.lon0, E.lat0])[1]);
const ES = 10;
const edots = [];
for (let y = ES / 2; y < EH; y += ES) {
  for (let x = ES / 2; x < EW; x += ES) {
    const ll = eproj.invert([x, y]);
    if (geoContains(land, ll)) edots.push([Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
  }
}
const EP = (lon, lat) => eproj([lon, lat]).map((v) => Math.round(v * 10) / 10);
const europa = {
  w: EW, h: EH,
  d: edots.map(([x, y]) => `M${x} ${y}h0`).join(''),
  huelva: EP(-6.95, 37.26), malaga: EP(-4.42, 36.72), luxemburgo: EP(6.13, 49.61),
};

const out = `// Generado por scripts/mapa/generar-mapa.mjs (Natural Earth 1:110m vía world-atlas). No editar a mano.
export const MAPA = { w: ${W}, h: ${H}, puntos: ${dots.length} } as const;
export const MAPA_PATH = ${JSON.stringify(d)};
export const DESTINOS = ${JSON.stringify(puntos)} as { zona: 'europa' | 'usa' | 'latam'; nombre: string; xy: [number, number] }[];
export const EUROPA = ${JSON.stringify(europa)} as { w: number; h: number; d: string; huelva: [number, number]; malaga: [number, number]; luxemburgo: [number, number] };
`;
writeFileSync('src/data/mapa.ts', out);
console.log(`${dots.length} puntos, ${(d.length / 1024).toFixed(1)} KB · Europa: ${edots.length} puntos, ${(europa.d.length / 1024).toFixed(1)} KB, ${EW}x${EH}`);
