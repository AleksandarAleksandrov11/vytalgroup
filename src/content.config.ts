// Colección de guías (contenido SEO). Cada guía es un Markdown en src/content/guias/.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const guias = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guias' }),
  schema: z.object({
    /** Titular con el acento en cursiva entre asteriscos */
    titulo: z.string(),
    /** Título de la tarjeta y de las migas, sin acento */
    corto: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string(),
    resumen: z.string(),
    fecha: z.string(),
    actualizada: z.string().optional(),
    /** Imagen de cabecera (nombre en src/assets/productos o fotos/...) */
    imagen: z.string(),
    imagenAlt: z.string(),
    /** Fichas y categorías relacionadas (slugs de producto) */
    relacionados: z.array(z.string()).default([]),
    orden: z.number().default(0),
  }),
});

export const collections = { guias };
