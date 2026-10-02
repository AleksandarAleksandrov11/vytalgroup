// Ejecuta las pruebas automáticas contra la versión compilada (dist/), servida con las cabeceras de
// vercel.json (CSP incluida) y un Apps Script simulado en el puerto 8090:
//  · qa-seo        → estático: title y description (longitud y unicidad), un H1 con acento, canonical,
//                    Open Graph, robots, JSON-LD, rayas, veterinaria, scripts en línea, alt, enlaces
//                    internos y anclas, sitemap, robots.txt y llms.txt.
//  · html-validate → HTML válido en todas las páginas (reglas en .htmlvalidate.json).
//  · qa-apps-script→ el Apps Script real (integrations/google-sheets.gs, el de la landing) contra una hoja
//                    simulada: columnas, columna Modelo, duplicados, validación y los envíos de la web.
//  · qa-form       → formulario (preselección, validación, envío, error, servidor lento, sin endpoint,
//                    antispam), consentimiento, analítica de Vercel y que no se pida nada a Meta.
//  · qa-ui         → cabecera, menús, catálogo (filtros, búsqueda, orden y URL), acordeones, guías,
//                    teclado, movimiento reducido, CSP, 404 real y cabeceras de caché.
//  · qa-a11y       → axe-core (WCAG 2.2 AA y buenas prácticas) en todas las páginas a 390 y 1440, más
//                    un cálculo de contraste propio donde axe no puede resolver el fondo.
//  · qa-layout     → los 12 anchos del brief en todas las plantillas: sin scroll horizontal, sin
//                    elementos fuera de pantalla, sin errores en consola y capturas de página completa.
// Uso: npm run build && npm test     (CHROME_PATH=/ruta/a/chrome si Playwright no trae navegador)
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PORT = process.env.PORT || '8081';
const out = join('tests', 'output');
mkdirSync(join(out, 'screenshots'), { recursive: true });
const log = join(out, 'mock-log.jsonl');
writeFileSync(log, '');

// El puerto tiene que estar libre: otro servidor sin el Apps Script simulado en la CSP falsearía el resultado
const ocupado = await fetch(`http://localhost:${PORT}/`).then(() => true, () => false);
if (ocupado) { console.error(`El puerto ${PORT} ya está en uso. Ciérralo o usa PORT=otro npm test.`); process.exit(1); }

const bg = [
  spawn(process.execPath, ['scripts/serve.mjs', 'dist', PORT], { stdio: 'ignore', env: { ...process.env, CSP_CONNECT_EXTRA: 'http://localhost:8090' } }),
  spawn(process.execPath, ['tests/mock-apps-script.cjs', log, '8090'], { stdio: 'ignore' }),
];
const env = { ...process.env, PORT, BASE: `http://localhost:${PORT}` };
const run = (file, args = []) => new Promise((resolve) => {
  const p = spawn(process.execPath, [file, ...args], { stdio: 'inherit', env });
  p.on('exit', (code) => resolve(code));
});

await new Promise((r) => setTimeout(r, 800));
const solo = process.argv.slice(2);
let failed = 0;
for (const [file, args] of [
  ['tests/qa-seo.mjs', []],
  ['node_modules/html-validate/bin/html-validate.mjs', ['dist/**/*.html']],
  ['tests/qa-apps-script.cjs', []],
  ['tests/qa-form.cjs', [log]],
  ['tests/qa-ui.cjs', []],
  ['tests/qa-a11y.cjs', []],
  ['tests/qa-layout.cjs', [join(out, 'screenshots')]],
]) {
  if (solo.length && !solo.some((s) => file.includes(s))) continue;
  console.log(`\n▶ ${file}`);
  failed += (await run(file, args)) ? 1 : 0;
}
bg.forEach((p) => p.kill());
process.exit(failed ? 1 : 0);
