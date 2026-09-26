# PLAN · Web multipágina VytalGroup

Trabajo en solitario y secuencial, sin subagentes ni tareas en paralelo. Cada tarea se marca al terminarla.
Referencias: brief completo, landing publicada (https://vsl-vytalgroup.vercel.app/) y su código fuente
(repositorio `vsl-vytalgroup`, usado como `referencias/landing/`), y el catálogo ADC Global Tech | VytalGroup 2026 (53 páginas).

## 0. Estudio y preparación
- [x] Leer el brief entero
- [x] Localizar el proyecto de la landing y leer su código (CSS, JS, HTML, Apps Script, legales, pruebas)
- [x] Leer el catálogo PDF entero (`pdftotext -layout`) y revisar sus 53 páginas en miniatura
- [x] Extraer las imágenes del PDF (`pdfimages -all -p`)
- [ ] Capturas de la landing en 375 y 1440 px (referencia visual)
- [ ] `docs/design-system.md` con los tokens extraídos de la landing
- [ ] Inventario de productos y páginas del PDF

## 1. Base del proyecto
- [ ] Astro 7 con salida estática, `astro.config.ts`, `src/config.ts` (SITE_URL, SHEETS_ENDPOINT "", META_PIXEL_ID "")
- [ ] Fuentes Geist e Instrument Serif autoalojadas (woff2, subset latino, con hash)
- [ ] Tokens CSS en un único archivo (`src/styles/tokens.css`)
- [ ] Estilos base, tipografía, botones y utilidades
- [ ] `vercel.json`, `robots.txt`, `llms.txt`, manifest, favicon e iconos

## 2. Datos (un único origen)
- [ ] `src/data/categorias.ts`
- [ ] `src/data/productos.ts` (todos los productos del catálogo, sin veterinaria)
- [ ] `src/data/faqs.ts`
- [ ] `src/content/guias/` (colección de contenido)
- [ ] Imágenes de producto: recorte, lienzo común, luz igualada; AVIF y WebP en varios tamaños

## 3. Componentes compartidos
- [ ] Layout Base (head, SEO, OG, JSON-LD, sprite, skip link)
- [ ] Header (escritorio con desplegable de Equipos, móvil a pantalla completa, scroll, página activa)
- [ ] Barra CTA fija en móvil
- [ ] Footer ampliado
- [ ] Migas de pan (visibles y con BreadcrumbList)
- [ ] Tarjeta de producto
- [ ] Tarjeta de categoría
- [ ] Control segmentado
- [ ] Acordeón (FAQ)
- [ ] Carrusel con scroll-snap
- [ ] Galería de producto
- [ ] Tabla de especificaciones
- [ ] Comparador "Otras marcas frente a VytalGroup"
- [ ] Bloque CTA final + formulario de 4 pasos
- [ ] Banner y panel de cookies
- [ ] Cinta de confianza (marquee)
- [ ] Mapa internacional (SVG animado)
- [ ] Mockup 3D del catálogo
- [ ] Línea temporal "Así trabajamos"
- [ ] Barrido de ecografía (SVG)
- [ ] Imagen OG por página pilar y por producto (generada en el build, 1200 × 630)

## 4. Scripts (JS vanilla por islas)
- [ ] Atribución (UTM, fbclid, fbc) en sessionStorage
- [ ] Consentimiento (12 meses) y tracking centralizado (PageView, ViewContent, Lead, DescargaCatalogo, Contact, Search)
- [ ] Formulario (4 pasos, preselección, validación, honeypot, 3 s, doble envío, éxito y error)
- [ ] Desplegable propio (prefijo y "Otro equipo")
- [ ] Animaciones (entradas, titulares por líneas, parallax, halo, magnetismo, conteo, sticky, mapa, mockup, línea temporal)
- [ ] Filtro del catálogo (chips, buscador, orden, URL, FLIP)
- [ ] `integrations/google-sheets.gs` con las columnas nuevas (Origen y Página)

## 5. Páginas
- [ ] `/` Inicio (13 secciones)
- [ ] `/ecografos` pilar
- [ ] `/ecografos/[modelo]` fichas (10)
- [ ] `/diatermias` pilar
- [ ] `/diatermias/[modelo]` fichas (4)
- [ ] `/equipos` índice de categorías
- [ ] `/equipos/[categoria]` páginas de categoría
- [ ] `/equipos/[categoria]/[modelo]` fichas
- [ ] `/catalogo` catálogo navegable + descarga
- [ ] `/sobre-nosotros`
- [ ] `/contacto`
- [ ] `/guias` índice
- [ ] `/guias/[slug]` (3 guías de 900 a 1.400 palabras)
- [ ] `/aviso-legal`, `/privacidad`, `/cookies`
- [ ] `/404`
- [ ] `sitemap.xml`

## 6. Revisión final (sección 16 del brief)
- [ ] Coherencia con la landing (capturas lado a lado)
- [ ] Capturas de página completa de cada plantilla en 12 anchos, revisadas una a una
- [ ] Desbordes, solapes y scroll horizontal comprobados por código
- [ ] Rastreo de enlaces (internos, anclas, PDF, WhatsApp, tel y mailto)
- [ ] Catálogo: todos los productos, filtros, buscador, orden, URL, sin JS, descarga del PDF
- [ ] Formulario y tracking con endpoint vacío y simulado, UTM entre páginas, doble clic, consentimiento, eventos
- [ ] SEO: title y description únicos, un H1, canonical, OG, sitemap, robots, JSON-LD, noindex, alt, llms.txt
- [ ] Contenido: sin rayas, sin veterinaria, sin datos inventados, ortografía, sin relleno
- [ ] Lighthouse móvil ≥ 95 en las 4 categorías en todas las plantillas, CLS 0
- [ ] Consola y CSP limpias, HTML válido, teclado, movimiento reducido, sin archivos muertos
- [ ] Recorrido como fisioterapeuta que busca su primer ecógrafo

## 7. Entrega
- [ ] README (estructura, local, productos y guías, Google Sheets, píxel, despliegue, dominio, pendientes y decisiones)
- [ ] Commit y push a `claude/eloquent-turing-1arlub`
- [ ] Resumen final con Lighthouse por plantilla y lista de páginas
