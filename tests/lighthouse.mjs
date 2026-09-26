// Lighthouse móvil (configuración por defecto: Moto G Power emulado, CPU ×4 y red 4G lenta simulada)
// sobre cada plantilla del brief, servida desde dist/ con las cabeceras y la compresión de Vercel.
// Uso: npm run build && node tests/lighthouse.mjs   (necesita red la primera vez para "npx lighthouse";
//      CHROME_PATH=/ruta/a/chrome si no se encuentra Chrome). Informes en tests/output/lighthouse/.
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PORT = process.env.PORT || '8083';
const BASE = `http://localhost:${PORT}`;
const OUT = join('tests', 'output', 'lighthouse');
mkdirSync(OUT, { recursive: true });
const RUNS = Number(process.env.RUNS || 1);
const PLANTILLAS = [
  ['inicio', '/'],
  ['pilar', '/ecografos'],
  ['pilar-diatermias', '/diatermias'],
  ['ficha', '/ecografos/acclarix-ax8'],
  ['categoria', '/equipos/ondas-de-choque'],
  ['catalogo', '/catalogo'],
  ['sobre-nosotros', '/sobre-nosotros'],
  ['contacto', '/contacto'],
  ['guia', '/guias/como-elegir-un-ecografo-para-fisioterapia'],
];
const LH = process.env.LIGHTHOUSE_BIN || 'lighthouse';

const server = spawn(process.execPath, ['scripts/serve.mjs', 'dist', PORT], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));
const filas = [];
let fallos = 0;
try {
  for (const [nombre, ruta] of PLANTILLAS) {
    let mejor = null;
    for (let i = 0; i < RUNS; i++) {
      const file = join(OUT, `${nombre}.json`);
      execFileSync(LH, [BASE + ruta, '--quiet', '--output=json', `--output-path=${file}`, '--only-categories=performance,accessibility,best-practices,seo',
        '--chrome-flags=--headless=new --no-sandbox', '--form-factor=mobile'], { stdio: 'inherit', env: process.env });
      const r = JSON.parse(readFileSync(file, 'utf8'));
      const s = Object.fromEntries(Object.entries(r.categories).map(([k, v]) => [k, Math.round(v.score * 100)]));
      const m = { ...s, lcp: r.audits['largest-contentful-paint'].numericValue, cls: r.audits['cumulative-layout-shift'].numericValue, tbt: r.audits['total-blocking-time'].numericValue };
      if (!mejor || m.performance > mejor.performance) mejor = m;
    }
    const okAll = ['performance', 'accessibility', 'best-practices', 'seo'].every((k) => mejor[k] >= 95);
    if (!okAll) fallos++;
    filas.push(`${okAll ? 'PASS' : 'FAIL'}  ${nombre.padEnd(16)} Rend ${mejor.performance} · Acc ${mejor.accessibility} · BP ${mejor['best-practices']} · SEO ${mejor.seo} · LCP ${(mejor.lcp / 1000).toFixed(2)} s · CLS ${mejor.cls.toFixed(3)} · TBT ${Math.round(mejor.tbt)} ms`);
    console.log(filas[filas.length - 1]);
  }
} finally {
  server.kill();
}
console.log(`\n${filas.join('\n')}\n\nlighthouse: ${filas.length - fallos}/${filas.length} plantillas con 95 o más en las 4 categorías.`);
process.exit(fallos ? 1 : 0);
