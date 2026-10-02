import { defineConfig, type AstroIntegration } from 'astro/config';
import { readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL } from './src/config';

// Astro emite el original de toda imagen importada aunque la página solo use sus versiones WebP.
// Al terminar, se borra de dist/_astro todo lo que ningún HTML, CSS o JS referencia.
const sinArchivosMuertos = (): AstroIntegration => ({
  name: 'vg-sin-archivos-muertos',
  hooks: {
    'astro:build:done': ({ dir, logger }) => {
      const root = fileURLToPath(dir);
      const walk = (d: string): string[] => readdirSync(d).flatMap((f) => {
        const p = join(d, f);
        return statSync(p).isDirectory() ? walk(p) : [p];
      });
      const files = walk(root);
      const texto = files.filter((f) => /\.(html|css|js|xml|txt|json|webmanifest|svg)$/.test(f)).map((f) => readFileSync(f, 'utf8')).join('\n');
      let n = 0;
      let bytes = 0;
      for (const f of files.filter((f) => f.includes(`${join(root, '_astro')}`))) {
        const name = f.split('/').pop()!;
        if (!texto.includes(name)) { bytes += statSync(f).size; rmSync(f); n++; }
      }
      logger.info(`${n} archivos sin referencias eliminados (${(bytes / 1024).toFixed(0)} KB)`);
      // Ids de los encabezados de las guías sin tildes (#inalambrico-portatil-o-de-carro): así los enlaces
      // "Saltar a" y los compartidos no llevan %C3%B3. El índice de [slug].astro ya enlaza sin tildes.
      const sinTildes = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      for (const f of files.filter((f) => f.includes(`${join(root, 'guias')}`) && f.endsWith('.html'))) {
        const html = readFileSync(f, 'utf8');
        const limpio = html.replace(/(<h[1-6][^>]*\sid=")([^"]+)"/g, (_m, a, id) => `${a}${sinTildes(id)}"`);
        if (limpio !== html) writeFileSync(f, limpio);
      }
    },
  },
});

// Salida 100 % estática para Vercel (dist/). URLs limpias sin barra final.
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'never',
  compressHTML: true,
  build: {
    format: 'file',
    assets: '_astro',
    // CSS en línea: la página pinta sin esperar a ninguna hoja de estilos (LCP en móvil)
    inlineStylesheets: 'always',
  },
  // Imágenes: todas en WebP. Codificador ajustado para que pesen poco sin perder calidad visible: esfuerzo máximo,
  // submuestreo de color inteligente, transparencia con pérdida ligera (equipos recortados) y calidad 74 por defecto
  // (cada imagen puede pedir la suya: el hero y las fotos de fondo).
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: { webp: { quality: 74, alphaQuality: 82, effort: 6, smartSubsample: true } },
    },
  },
  devToolbar: { enabled: false },
  prefetch: false,
  integrations: [sinArchivosMuertos()],
  vite: {
    build: {
      // Sin scripts ni recursos en línea: la CSP no permite scripts inline
      assetsInlineLimit: 0,
    },
  },
});
