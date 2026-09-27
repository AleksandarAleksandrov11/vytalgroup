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
- [x] Coherencia con la landing (capturas lado a lado)
- [x] Capturas de página completa de cada plantilla en 12 anchos, revisadas una a una
- [x] Desbordes, solapes y scroll horizontal comprobados por código
- [x] Rastreo de enlaces (internos, anclas, PDF, WhatsApp, tel y mailto)
- [x] Catálogo: todos los productos, filtros, buscador, orden, URL, sin JS, descarga del PDF
- [x] Formulario y tracking con endpoint vacío y simulado, UTM entre páginas, doble clic, consentimiento, eventos
- [x] SEO: title y description únicos, un H1, canonical, OG, sitemap, robots, JSON-LD, noindex, alt, llms.txt
- [x] Contenido: sin rayas, sin veterinaria, sin datos inventados, ortografía, sin relleno
- [x] Lighthouse móvil ≥ 95 en las 4 categorías en todas las plantillas, CLS 0
- [x] Consola y CSP limpias, HTML válido, teclado, movimiento reducido, sin archivos muertos
- [x] Recorrido como fisioterapeuta que busca su primer ecógrafo

## 7. Entrega
- [x] README (estructura, local, productos y guías, Google Sheets, píxel, despliegue, dominio, pendientes y decisiones)
- [x] Commit y push a `claude/eloquent-turing-1arlub`
- [x] Resumen final con Lighthouse por plantilla y lista de páginas

## Registro de la revisión final
- Capturas de página completa de las 14 plantillas en los 12 anchos (320 a 1920), revisadas una a una.
- Corregido en la revisión: enlaces claros sobre fondo oscuro (hero y "Sin timos"), maqueta del catálogo que se salía en 1024, texto de CTA en la ficha, control segmentado de 3 opciones a 320, tarjetas huérfanas en categorías de 4 equipos y en el índice de equipos, ancho de lectura de legales y guías, email partido en contacto a 320, nombres del pie en móvil, foto con restos de texto del catálogo, cabecera de la tabla comparativa por debajo de AA, área táctil de la comparativa, clases duplicadas (.ct) entre contacto y la tabla comparativa.
- Pruebas: SEO estático, HTML válido, Apps Script, formulario y píxel, interfaz y animaciones, accesibilidad (axe y contraste propio) y maquetación en 12 anchos. Lighthouse móvil 99 a 100 en todas las plantillas.
- Lighthouse móvil final (Rendimiento · Accesibilidad · Buenas prácticas · SEO): inicio 100 · 100 · 100 · 100; pilar ecógrafos 100 · 100 · 100 · 100; pilar diatermias 100 · 100 · 100 · 100; ficha 99 · 100 · 100 · 100; categoría 100 · 100 · 100 · 100; catálogo 98 · 100 · 100 · 100; sobre nosotros 100 · 100 · 100 · 100; contacto 100 · 100 · 100 · 100; guía 100 · 100 · 100 · 100. CLS 0 y LCP entre 1,35 y 1,72 s en todas.


## Ronda 2 (cambios pedidos tras la primera entrega)
- [x] Fotos: escalado con IA (Real-ESRGAN) sin alterar el contenido y fondo quitado (BiRefNet) en todos los productos; fotos de contexto, catálogo y Javier mejoradas
- [x] EDAN: Nano (L12 EXP y C5 EXP), U60, U50 PE, U2 PE y DUS60 con datos oficiales, fotos y ficha completa
- [x] Cabecera con fondo sólido y animaciones circulares; Guías en el menú
- [x] Móvil: cabecera fija, hamburguesa de 3 líneas y menú nuevo con color, tipografía animada y desplegables propios
- [x] Hero del inicio rediseñado por completo, con animación de entrada
- [x] Inicio: sección de Javier y tabla comparativa rediseñadas (sin copiar la landing)
- [x] Ecógrafos: "Toda la gama" rediseñada sin huecos, y en móvil cada equipo centrado con un poco del siguiente
- [x] Quitar la nota "Consultar" de la tabla comparativa
- [x] Todas las fichas con la misma estructura ordenada y una sección de preguntas frecuentes (3 o más)
- [x] Tarjetas de producto idénticas en estilo, tamaño y alineación de botones (categorías, catálogo, guías y fichas)
- [x] Sobre nosotros: las 3 tarjetas de "Nuestra forma de trabajar" iguales; marcas con logos reales en cinta infinita
- [x] 10 px menos de espacio arriba y abajo en cada sección
- [x] Más animaciones: tarjetas en 3D, hovers y entradas
- [x] Aviso de cookies real con analítica (Vercel Web Analytics tras el consentimiento) y marketing
- [x] Revisión en todos los anchos y dispositivos, pruebas, Lighthouse ≥ 95, README, commit y push

## Registro de la ronda 2
- Fotos: 54 imágenes de producto rehechas con Real-ESRGAN x4plus y BiRefNet, en lienzo transparente común de 1280 × 960 (escenario y sombra por CSS, con el ancho real de cada equipo). Fuentes de más calidad: banners oficiales de EDAN (AX2, AX3, U60, U50, DUS60, Nano) y fotos de la landing (AX8, LX9, Reatherm, HR Tek). Sin inventar: nunca se publica el ×4 tal cual y se mezcla un 25 % del original ampliado sin IA. Fotos de contexto y Javier con el modelo general, más conservador; recorte de Javier con birefnet-portrait. Portada e interiores del catálogo re-renderizados del PDF a 200 ppp.
- Revisión en los 12 anchos: anillo giratorio de Javier que desbordaba en móviles estrechos (ahora gira el círculo, no la caja); lista de garantías del hero quitada porque repetía la cinta de justo debajo; tarjetas alineadas por filas con subgrid (características de la ficha, razones, "Cómo elegir", "Quiénes estamos"); última fila incompleta centrada (guías, relacionados, láser, ultrasonidos, estética y características en tableta); pie con nombres cortos de categoría entre 1024 y 1279 para que no se partan; número y unidad sin separarse en tarjetas, fichas y comparativas.
- Pruebas de la ronda 2: SEO 1906/1906 en 78 páginas, HTML válido, Apps Script 18/18, formulario y píxel 60/60 (con la analítica de Vercel solo tras aceptarla), interfaz 72/72, accesibilidad 156/156 (axe a 390 y 1440) y maquetación en los 12 anchos sin fallos.
- Lighthouse móvil de la ronda 2 (Rendimiento · Accesibilidad · Buenas prácticas · SEO): inicio 100 · 100 · 100 · 100; pilar ecógrafos 99 · 100 · 100 · 100; pilar diatermias 100 · 100 · 100 · 100; ficha 100 · 100 · 100 · 100; categoría 100 · 100 · 100 · 100; catálogo 100 · 100 · 100 · 100; sobre nosotros 100 · 100 · 100 · 100; contacto 100 · 100 · 100 · 100; guía 100 · 100 · 100 · 100. CLS 0 y LCP entre 1,30 y 1,59 s en todas.

## Ronda 3 (cambios pedidos tras la segunda entrega)
- [x] Hero del inicio nuevo y más sencillo: foto de consulta a sangre con capa marina, barrido de ecografía, haz de luz y zoom de entrada; sin etiquetas ni escaparate
- [x] "Un ecógrafo para cada forma de trabajar" como estaba (la foto salía dos veces en escritorio)
- [x] Javier: solo su foto, sin disco ni animación, y la frase con la firma
- [x] Comparador "Lo habitual, y lo nuestro" como sección propia con fondo turquesa
- [x] Marcas con fondo propio justo debajo del hero (inicio y Sobre nosotros); fuera la cinta de confianza, que repetía textos
- [x] Todas las cabeceras con la misma estructura: fondo marino, antetítulo, H1, apoyo y acciones a la izquierda y visual 4:3 a la derecha (pilares, categorías, equipos, catálogo, guías, guía, contacto, sobre nosotros, fichas, legales y 404)
- [x] Preguntas frecuentes: al menos 3 en cada página (categorías con 5, comprobado en check-content)
- [x] Limpieza: "Sin letra pequeña" solo en el pie; menos botones repetidos de asesoramiento; fuera el mapa del inicio (ya está en Sobre nosotros)
- [x] SEO del audit: canonical al dominio de producción de Vercel, alt descriptivo en todas las imágenes, sin negritas repetidas, menos encabezados (pie, tarjetas de categoría, pasos), anclas "Ver ficha" únicas, H1 del inicio con las palabras del title
- [x] Rendimiento: miniaturas de menú en un solo WebP pequeño, imágenes diferidas salvo la del hero, animaciones solo con transform y opacity

- Pruebas de la ronda 3: SEO 1914/1914, HTML válido, Apps Script 18/18, formulario 60/60, interfaz 71/71, accesibilidad 156/156 y maquetación 180/180. Lighthouse móvil 100 · 100 · 100 · 100 en las 9 plantillas, CLS 0 y LCP entre 1,28 y 1,72 s.
