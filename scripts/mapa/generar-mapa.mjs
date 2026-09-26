// Genera src/data/mapa.ts: mapa del mundo en puntos (Natural Earth 1:110m, paquete world-atlas)
// y la posición de los puntos de envío (Europa, Estados Unidos y Latinoamérica).
// Uso: node scripts/mapa/generar-mapa.mjs   (solo hace falta volver a ejecutarlo si cambia el diseño)
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { geoEquirectangular, geoMercator, geoContains } from 'd3-geo';

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
// Mapas regionales para "La historia" (Huelva, Málaga y Luxemburgo), en Mercator y con más detalle (1:50m)
const topo50 = JSON.parse(readFileSync('node_modules/world-atlas/land-50m.json', 'utf8'));
const land50 = feature(topo50, topo50.objects.land);
const RW = 520;
const RH = 420;
const RS = 10;
function region([[lon0, lat0], [lon1, lat1]], lugares) {
  const proj = geoMercator().fitExtent([[0, 0], [RW, RH]], { type: 'MultiPoint', coordinates: [[lon0, lat0], [lon1, lat1]] });
  const pts = [];
  for (let y = RS / 2; y < RH; y += RS) {
    for (let x = RS / 2; x < RW; x += RS) {
      if (geoContains(land50, proj.invert([x, y]))) pts.push(`M${x} ${y}h0`);
    }
  }
  const r = { w: RW, h: RH, d: pts.join('') };
  for (const [k, [lon, lat]] of Object.entries(lugares)) r[k] = proj([lon, lat]).map((v) => Math.round(v * 10) / 10);
  return r;
}
const HUELVA = [-6.95, 37.26];
const MALAGA = [-4.42, 36.72];
const LUXEMBURGO = [6.13, 49.61];
const iberia = region([[-9.9, 35.6], [3.6, 44.1]], { huelva: HUELVA, malaga: MALAGA });
const europa = region([[-10.5, 35.2], [16, 53.2]], { malaga: MALAGA, luxemburgo: LUXEMBURGO });
const edots = europa.d.match(/M/g);
const idots = iberia.d.match(/M/g);

const out = `// Generado por scripts/mapa/generar-mapa.mjs (Natural Earth 1:110m y 1:50m vía world-atlas). No editar a mano.
export const MAPA = { w: ${W}, h: ${H}, puntos: ${dots.length} } as const;
export const MAPA_PATH = ${JSON.stringify(d)};
export const DESTINOS = ${JSON.stringify(puntos)} as { zona: 'europa' | 'usa' | 'latam'; nombre: string; xy: [number, number] }[];
export const IBERIA = ${JSON.stringify(iberia)} as { w: number; h: number; d: string; huelva: [number, number]; malaga: [number, number] };
export const EUROPA = ${JSON.stringify(europa)} as { w: number; h: number; d: string; malaga: [number, number]; luxemburgo: [number, number] };
`;
writeFileSync('src/data/mapa.ts', out);
console.log(`${dots.length} puntos, ${(d.length / 1024).toFixed(1)} KB · Península: ${idots.length} puntos, ${(iberia.d.length / 1024).toFixed(1)} KB · Europa: ${edots.length} puntos, ${(europa.d.length / 1024).toFixed(1)} KB`);
