# PLAN · Web multipágina VytalGroup

Trabajo en solitario y secuencial, sin subagentes ni tareas en paralelo. Cada tarea se marca al terminarla.
Referencias: brief completo, landing publicada (https://vsl-vytalgroup.vercel.app/) y su código fuente
(repositorio `vsl-vytalgroup`, usado como `referencias/landing/`), y el catálogo ADC Global Tech | VytalGroup 2026 (53 páginas).

## 0. Estudio y preparación
- [x] Leer el brief entero
- [x] Localizar el proyecto de la landing y leer su código (CSS, JS, HTML, Apps Script, legales, pruebas)
- [x] Leer el catálogo PDF entero (`pdftotext -layout`) y revisar sus 53 páginas en miniatura
- [x] Extraer las imágenes del PDF (`pdfimages -all -p`)
- [x] Capturas de la landing en 375 y 1440 px (referencia visual)
- [x] `docs/design-system.md` con los tokens extraídos de la landing
- [x] Inventario de productos y páginas del PDF

## 1. Base del proyecto
- [x] Astro 7 con salida estática, `astro.config.ts`, `src/config.ts` (SITE_URL, SHEETS_ENDPOINT "", META_PIXEL_ID "")
- [x] Fuentes Geist e Instrument Serif autoalojadas (woff2, subset latino, con hash)
- [x] Tokens CSS en un único archivo (`src/styles/tokens.css`)
- [x] Estilos base, tipografía, botones y utilidades
- [x] `vercel.json`, `robots.txt`, `llms.txt`, manifest, favicon e iconos

## 2. Datos (un único origen)
- [x] `src/data/categorias.ts`
- [x] `src/data/productos.ts` (todos los productos del catálogo, sin veterinaria)
- [x] `src/data/faqs.ts`
- [x] `src/content/guias/` (colección de contenido)
- [x] Imágenes de producto: recorte, lienzo común, luz igualada; AVIF y WebP en varios tamaños

## 3. Componentes compartidos
- [x] Layout Base (head, SEO, OG, JSON-LD, sprite, skip link)
- [x] Header (escritorio con desplegable de Equipos, móvil a pantalla completa, scroll, página activa)
- [x] Barra CTA fija en móvil
- [x] Footer ampliado
- [x] Migas de pan (visibles y con BreadcrumbList)
- [x] Tarjeta de producto
- [x] Tarjeta de categoría
- [x] Control segmentado
- [x] Acordeón (FAQ)
- [x] Carrusel con scroll-snap
- [x] Galería de producto
- [x] Tabla de especificaciones
- [x] Comparador "Otras marcas frente a VytalGroup"
- [x] Bloque CTA final + formulario de 4 pasos
- [x] Banner y panel de cookies
- [x] Cinta de confianza (marquee)
- [x] Mapa internacional (SVG animado)
- [x] Mockup 3D del catálogo
- [x] Línea temporal "Así trabajamos"
- [x] Barrido de ecografía (SVG)
- [x] Imagen OG por página pilar y por producto (generada en el build, 1200 × 630)

## 4. Scripts (JS vanilla por islas)
- [x] Atribución (UTM, fbclid, fbc) en sessionStorage
- [x] Consentimiento (12 meses) y tracking centralizado (PageView, ViewContent, Lead, DescargaCatalogo, Contact, Search)
- [x] Formulario (4 pasos, preselección, validación, honeypot, 3 s, doble envío, éxito y error)
- [x] Desplegable propio (prefijo y "Otro equipo")
- [x] Animaciones (entradas, titulares por líneas, parallax, halo, magnetismo, conteo, sticky, mapa, mockup, línea temporal)
- [x] Filtro del catálogo (chips, buscador, orden, URL, FLIP)
- [x] `integrations/google-sheets.gs` con las columnas nuevas (Origen y Página)

## 5. Páginas
- [x] `/` Inicio (13 secciones)
- [x] `/ecografos` pilar
- [x] `/ecografos/[modelo]` fichas (10)
- [x] `/diatermias` pilar
- [x] `/diatermias/[modelo]` fichas (4)
- [x] `/equipos` índice de categorías
- [x] `/equipos/[categoria]` páginas de categoría
- [x] `/equipos/[categoria]/[modelo]` fichas
- [x] `/catalogo` catálogo navegable + descarga
- [x] `/sobre-nosotros`
- [x] `/contacto`
- [x] `/guias` índice
- [x] `/guias/[slug]` (3 guías de 900 a 1.400 palabras)
- [x] `/aviso-legal`, `/privacidad`, `/cookies`
- [x] `/404`
- [x] `sitemap.xml`

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
