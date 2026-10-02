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

## Ronda 4 (cambios pedidos tras la tercera entrega)
- [x] Hero del inicio rediseñado: escena 3D minimalista en CSS (ecógrafo delante con reflejo, diatermia detrás, suelo de rejilla en perspectiva), sin radar ni "de fisio a fisio"
- [x] Radar (barrido) fuera de todas las cabeceras y antetítulos de los H1 quitados ("4 equipos de diatermia", "15 ecógrafos", "53 equipos"...)
- [x] Cinta de datos de nuevo bajo el hero del inicio; marcas solo en Sobre nosotros, bajo su cabecera y sin título
- [x] Fuera "Quién está detrás" y las flechas del comparador "Lo habitual, y lo nuestro"
- [x] Foto de Javier completa en Sobre nosotros (marco con la proporción de la foto)
- [x] 20 px menos arriba y abajo en todas las secciones
- [x] Sobre nosotros reordenado: marcas, historia, forma de trabajar, quiénes somos, alcance y formulario
- [x] Cada sección con un fondo distinto del de sus vecinas (blanco, niebla, rejilla, puntos, turquesa, marino o foto) en todas las páginas, con 6 fotos de fondo de clínicas y salas de Unsplash y Pexels
- [x] Auditoría exhaustiva (SEO técnico, SEO de contenido, sentido de cada sección, visual y rendimiento, con verificación de cada hallazgo) y correcciones
- [x] Formulario conectado a la hoja de Google Sheets de la landing (mismo Apps Script) y probado con una fila de prueba
- [x] Dominio vytalgroup.com (canonical, sitemap, robots, JSON-LD) y noindex en vytalgroup.vercel.app; la landing queda en vsl.vytalgroup.com
- [x] Fuera el Instagram de la marca, que no existe (solo queda @fisioruiz_)

## Registro de la ronda 4
- Auditoría con cinco revisiones independientes (SEO técnico, SEO de contenido, sentido de las secciones, visual y rendimiento) y un verificador por revisión que intentó rebatir cada hallazgo antes de aplicarlo. Aplicado: H1 y títulos sin canibalizar (diatermia, láser, electrólisis), preguntas propias en todas las categorías con redacción natural ("¿Qué camillas tenéis?"), H1 de las fichas con qué es el equipo ("Ecógrafo U50", "Láser de diodo Epil Evo Smart"), JSON-LD con entidades enlazadas (organización, web, persona y autor de las guías), enlaces internos en el texto, anclas de las guías sin tildes, sitemap sin fechas falsas, 404 sin canonical, favicon.ico, alt descriptivos y metadatos del PDF sin notas internas.
- Visual: elipse de luz del hero sin rectángulo, reflejo solo en el equipo delantero, escena más baja en móvil, línea de tiempo que acaba en el último paso y centrada en tableta, títulos y tarjetas legibles sobre fondos oscuros y `sizes` ajustados al ancho real de cada tarjeta.
- Rendimiento: animaciones del hero solo con transform y en pausa fuera de pantalla, sin el pulso infinito de la cabecera, la foto de cada cabecera cuenta como LCP (entra solo con movimiento), prefetch de las páginas internas con reglas de especulación, fotos de fondo más ligeras, fuentes más pequeñas (sin hinting y con Latin-1), sprite sin 23 iconos sin uso y arranque del JS sin reflows encadenados.
- Pruebas de la ronda 4: SEO 1916/1916, HTML válido, Apps Script 18/18, formulario 60/60, interfaz 74/74, accesibilidad 156/156 y maquetación 180/180. Lighthouse móvil 100 · 100 · 100 · 100 en las 9 plantillas, CLS 0 y LCP entre 1,31 y 1,63 s.

## Ronda 5 (hero del inicio)
- [x] Hero del inicio rediseñado por completo, más limpio: fondo claro de estudio, titular centrado y tres equipos reales (Acclarix AX8 delante, Diatermia Multifunción y Shock Med detrás) sobre el mismo suelo con su sombra de contacto; sin rejilla, reflejos, brillos ni animaciones en bucle
- [x] Probadas dos composiciones (centrada y a dos columnas) en 320 a 1920 px; la centrada gana porque los equipos se apoyan en el suelo en lugar de flotar
- Pruebas de la ronda 5: SEO 1916/1916, HTML válido, Apps Script 18/18, formulario 60/60, interfaz 75/75 (con las del hero nuevo), accesibilidad 156/156 y maquetación 180/180. Lighthouse móvil del inicio 100 · 100 · 100 · 100, LCP 1,40 s y CLS 0 (el resto de plantillas, de 99 a 100).

## Ronda 6 (lista para publicar)
- [x] `robots.txt` abierto a todos los bots y ninguna página con noindex (ni etiqueta ni cabecera `X-Robots-Tag`, tampoco en `vytalgroup.vercel.app`); las páginas legales entran en el sitemap
- [x] Hero del inicio nuevo: "Equipos médicos de alta calidad. *Sin letra pequeña.*", el subtítulo pedido y los mismos dos botones, sobre marino y con una foto real de una ecografía de hombro con sonda inalámbrica que se funde con el fondo (adiós al estudio claro con los tres equipos)
- [x] "Más equipos para tu consulta" con foto de fondo nueva (ultrasonido terapéutico en un tobillo)
- [x] Botón flotante de WhatsApp en todas las páginas, con el estilo de la web y el mensaje ya escrito según la página (general, categoría o equipo de la ficha); en móvil sube por encima de la barra de asesoramiento y del aviso de cookies
- [x] Alcance internacional con fondo nuevo: la Tierra de noche (NASA) con las rutas de envío desde España a la UE, USA y LATAM, que se dibujan al entrar en pantalla
- [x] Cabecera de Contacto: mosaico de cuatro equipos (diatermia, ecógrafo inalámbrico, magnetoterapia y sondas) en lugar de una foto de fisio o de recepción
- [x] Formulario: agradecimiento en torno a 1 s y sin el error falso (el lead llegaba pero la página decía "No se ha podido enviar"), "Enviar otra consulta", UTM de la web cuando la visita no trae los suyos (`utm_source = web`, medio según la procedencia y la página como campaña) y siempre empieza en la pregunta 1; probado de punta a punta con la hoja
- [x] Apps Script de la web igual al de la landing (el que tiene la hoja, con la columna Modelo) y sus pruebas, más los envíos tal y como los hace la web
- [x] Revisión de enlaces y botones: 266 enlaces internos con sus anclas, 176 enlaces de WhatsApp con mensaje, teléfono, correo y externos; todos los botones con su acción
- [x] Carga: fotos con calidad propia (hero, fondos y mapa) solo en WebP, que a esa calidad pesa menos que AVIF; equipos recortados en AVIF con WebP de respaldo (pesan en torno a un 40 % menos); `sizes` del hero según su recorte real. HTML del inicio de 37 KB comprimido con el CSS en línea y un único JS de 8 KB (el del formulario se carga al usarlo)
- [x] Vercel Web Analytics listo en el código (con consentimiento, sin cookies); falta activarlo en el panel de Vercel
- [x] Revisión legal para publicar: aviso legal, privacidad y cookies coherentes con lo que hace la web y aviso de cookies con aceptar, rechazar y configurar al mismo nivel. Faltan los datos del titular y el plazo de conservación de los leads (tampoco están en la landing); no se inventan

## Registro de la ronda 6
- Envío del formulario: Apps Script responde con una redirección a `script.googleusercontent.com` que algunos bloqueadores y Safari cortan; la web daba error aunque la fila ya estaba guardada, y esperaba hasta 20 s. Ahora no sigue la redirección (su llegada ya indica que el script terminó), da las gracias en cuanto responde Google o a 1 s, sigue en segundo plano con `keepalive` y un reintento, y solo muestra el aviso si falla de verdad. Los reintentos no duplican filas (mismo `event_id`).
- Prueba real contra la hoja del cliente: agradecimiento a 1,39 s, una sola petición y la fila con `web / directo / contacto`.
- Accesibilidad: el botón flotante de WhatsApp quedaba fuera de toda zona de referencia (axe, regla `region`, en las 156 combinaciones); va dentro de un `<aside>` con nombre.
- Pruebas de la ronda 6: SEO 1984/1984, HTML válido, Apps Script 27/27 (con los envíos de la web), formulario 65/65, interfaz 83/83 (hero, WhatsApp flotante y mapa nuevos), accesibilidad 156/156 y maquetación 180/180. Lighthouse móvil 100 · 100 · 100 · 100 en 8 de las 9 plantillas y 99 de rendimiento en el catálogo, LCP entre 1,38 y 1,64 s y CLS de 0,002 como máximo.

## Ronda 7 (dominio, alcance, fotos, animaciones y publicación)
- [x] Dominio `https://www.vytalgroupem.com` (el principal en Vercel; `vytalgroupem.com` redirige a él): canonical, Open Graph, JSON-LD, sitemap, `robots.txt`, `llms.txt` y pie de las imágenes para compartir. `vytalgroup.vercel.app` redirige al dominio
- [x] Variables de entorno de Vercel para todo lo configurable (`META_PIXEL_ID`, `SHEETS_ENDPOINT`, `SITE_URL`, `VERCEL_ANALYTICS`) y para verificar el dominio en Google y en Meta con etiqueta (`GOOGLE_SITE_VERIFICATION`, `META_DOMAIN_VERIFICATION`), sin tocar código
- [x] Alcance internacional rehecho y limpio: mapa en vectores de América y Europa, un punto en cada país de Latinoamérica (20), seis estados de EE. UU. (California, Texas, Florida, Nueva York, Pensilvania e Illinois) y ocho países de la UE, España como origen, ocho rutas de referencia y leyenda; fuera la foto nocturna de la NASA
- [x] Fotos de fondo de sección sin la veladura que las apagaba (del 66 al 86 % de marino a entre el 24 y el 62 %, más densa solo donde hay texto), con más calidad (62 en vez de 32) y, en móvil y tableta, como banda superior que se funde con el marino
- [x] Animación inicial al abrir la web: intro de marca dentro del hero (símbolo, nombre y línea de carga, y el panel sube como un telón), una vez por sesión, sin bloquear clics y con salto inmediato a cualquier gesto
- [x] Hero con entrada "wow": cortina marina con filo de luz turquesa que descubre la foto con zoom, titular por palabras, brillo turquesa en movimiento detrás del texto y foto que sigue al cursor en escritorio
- [x] Apps Script: un email de aviso que falla ya no convierte en error un lead guardado (lo notaba la landing)
- [x] Guía para publicar paso a paso en el README (apartado 8): fusionar en `main`, Vercel Analytics, datos legales, Apps Script, Meta Pixel, Search Console y comprobación final

## Registro de la ronda 7
- Dominio comprobado desde fuera: `https://www.vytalgroupem.com` responde con HTTPS y `vytalgroupem.com` y `http://` redirigen a él (308). El Apps Script desplegado responde `{"ok":true}` y la hoja solo conserva una fila de prueba.
- Intro medida con Lighthouse (perfil limpio, así que la intro se ve): el inicio sigue en 100 de rendimiento (LCP 1,6 s, Speed Index 2,3 s, CLS 0,001). La intro no retrasa el LCP porque la foto se pinta debajo desde el principio.
- Pruebas de la ronda 7: SEO 1986/1986, HTML válido, Apps Script 28/28 (con el email que falla), formulario 65/65, interfaz 90/90 (intro, mapa y fotos nuevas), accesibilidad 156/156 y maquetación 180/180. Lighthouse móvil 100 · 100 · 100 · 100 en 8 de las 9 plantillas y 99 de rendimiento en el catálogo; LCP entre 1,43 y 1,72 s. Enlaces: 266 internos con sus anclas, 176 de WhatsApp, teléfono, correo y externos, sin ninguno roto.

## Ronda 8 (intro, fotos de fondo, WebP, legales y sin Meta)
- [x] Intro de marca a pantalla completa (también sobre la cabecera) y solo la primera vez que se abre la web en un navegador (`localStorage`); se decide antes de pintar con un script externo diminuto, así en las visitas siguientes no hay parpadeo. Fuera la intro dentro del hero
- [x] Hero sin animaciones continuas: fuera el brillo que se movía todo el rato y el paralaje con el cursor; queda solo la entrada única al cargar
- [x] Fotos de fondo de sección (Más equipos, Por qué comprar tu ecógrafo y tu diatermia, Y el resto de tu consulta) más suaves: desenfocadas, con menos opacidad y un toque azul; además pesan de 17 a 29 KB a 1600 px
- [x] Todas las imágenes en WebP (sin AVIF), con el codificador ajustado (esfuerzo máximo, calidad 74, transparencia con pérdida ligera y submuestreo inteligente)
- [x] Datos legales del titular: Javier Ruiz Vides, DNI 49115639J, Rue des Champs 61a, Bertrange (Luxemburgo), vytalkinetech@gmail.com y teléfono; plazo de conservación por criterios y reclamación ante la autoridad del país de residencia (AEPD en España, CNPD en Luxemburgo)
- [x] Fuera el píxel de Meta: módulo, eventos, `fbclid`/`fbc`/`fbp` del formulario, categoría de marketing del aviso de cookies, dominios de Meta en la CSP y menciones en los textos legales
- [x] Apps Script: avisos por email a `vytalkinetech@gmail.com` (hay que pegar el script en la hoja)

## Registro de la ronda 8
- La intro dejó la página en blanco en la primera prueba: la regla `.intro { display: none }` también se aplicaba a `<html class="intro">`. La clase de `<html>` pasó a ser `con-intro` y la intro tiene su prueba (aparece la primera vez en cualquier página, ocupa toda la pantalla por encima de la cabecera, no recibe clics, no se repite al navegar ni al volver a abrir la web, se salta con un gesto y no existe con movimiento reducido).
- Prueba real contra la hoja con datos realistas: "Laura Martín (prueba)", teléfono de VytalGroup, Fisioterapeuta y Diatermia; agradecimiento a 1,40 s y la fila con `web / directo / contacto`, sin datos de Meta.
- Pruebas de la ronda 8: SEO 1988/1988, HTML válido, Apps Script 28/28, formulario 55/55 (ahora comprueba que no se pide nada a Meta), interfaz 91/91, accesibilidad 156/156 y maquetación 180/180. Lighthouse móvil 100 · 100 · 100 · 100 en 7 de las 9 plantillas y 99 de rendimiento en el catálogo y en Ecógrafos; LCP entre 1,30 y 1,88 s y CLS 0. El inicio pesa 106 KB en la primera carga. Enlaces: 266 internos con sus anclas, 176 de WhatsApp, teléfono, correo y externos, sin ninguno roto.

## Ronda 9 (calidad de las fotos)
- [x] Auditoría de nitidez con Playwright en 10 páginas y 5 pantallas (escritorio, retina, tableta y dos móviles de 3x): para cada imagen, los píxeles que descarga frente a los que pide la pantalla. Antes, 39 imágenes se veían ampliadas (blandas) en retina y móvil: los equipos llegaban como mucho a 640 px aunque la pantalla pedía unos 1.100
- [x] Anchos del srcset hasta lo que pide cada pantalla sin pasar del original: equipos hasta 1280 px (su lienzo), fotos hasta su original y los `sizes` de siempre, así cada pantalla baja solo lo suyo (un móvil normal no descarga la versión de retina)
- [x] Más calidad de compresión, elegida midiendo peso y fidelidad (SSIM) en fotos reales de la web: 85 en los equipos con la transparencia sin pérdida (bordes limpios), 88 en las fotos (piel, pelo, texturas; el hero pasa de 70 a 88) y 80 en las fotos de fondo
- [x] Javier y la magnetoterapia Clínica (los dos originales más pequeños) ampliados ×3 con el mismo Real-ESRGAN, y a Javier se le alisa la pared del fondo, que traía ondas de compresión alrededor de la cabeza y un halo blanco en los hombros
- [x] Fotos de fondo rehechas desde los originales con un desenfoque más ligero (radio 4,5 a 2000 px) y calidad alta: siguen suaves y con el toque azul, pero sin los bloques que formaba la compresión fuerte (`scripts/imagenes/fondos.py`)

## Registro de la ronda 9
- Después de los cambios, 0 imágenes por debajo de lo necesario en escritorio, retina y móvil; quedan solo las fotos de fondo (desenfocadas a propósito, una ampliación no se nota) y, en tableta, los equipos a pantalla completa al 83 % (su lienzo original es de 1280 px).
- Peso: el inicio pasa de 106 a 130 KB en la primera carga de Lighthouse móvil (59 KB de imágenes, con la foto del hero a más calidad) y el catálogo pesa 177 KB; las versiones grandes solo las descargan las pantallas que las piden.
