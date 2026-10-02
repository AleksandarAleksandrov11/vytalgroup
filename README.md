# VytalGroup · Web corporativa

Web multipágina de VytalGroup: **equipos médicos de alta calidad**. Astro con salida 100 % estática, JavaScript vanilla solo donde hace falta (formulario, filtros, menús, cookies y animaciones), mismo sistema de diseño que la landing de venta (https://vsl-vytalgroup.vercel.app/) y publicada en **https://www.vytalgroupem.com**.

- 78 páginas HTML: inicio, 2 páginas pilar (ecógrafos y diatermias), índice de equipos, 10 páginas de categoría, 53 fichas de producto, catálogo navegable, sobre nosotros, contacto, índice de guías y 3 guías, 3 legales y 404.
- 53 productos en un único origen de datos (`src/data/productos/`): los 48 del catálogo 2026 y 5 modelos EDAN (Nano, U60, U50, DUS60 y U2) con los datos de la web oficial de EDAN. Todos tienen ficha propia con la misma estructura y sus preguntas frecuentes.
- Fotos de producto mejoradas con IA (Real-ESRGAN) y sin fondo (BiRefNet), sin cambiar el contenido de las fotos.
- Formulario de 4 pasos idéntico al de la landing, conectado a la **misma hoja de Google Sheets**. Los leads de la web llegan con `utm_source = web` (si la visita no trae UTM propios).
- Aviso de cookies con dos categorías (necesarias y analítica): Vercel Web Analytics solo se carga con consentimiento. Sin píxel de Meta ni cookies de publicidad.
- Botón flotante de WhatsApp en todas las páginas, con el mensaje ya escrito según la página (general, categoría o equipo).
- Intro de marca a pantalla completa solo la primera vez que se abre la web (sin bloquear nada) y entrada del hero con cortina de luz y zoom, una sola vez: después, quieto.
- Todas las imágenes en WebP y nítidas también en pantallas retina y móviles: cada pantalla recibe los píxeles que necesita para el tamaño al que se ve (codificador ajustado en `astro.config.ts`).
- Imágenes OG de 1200 × 630 generadas en el build para cada página, categoría, ficha y guía.

---

## 1. Estructura

- `astro.config.ts`: Configuración de Astro (estático, URLs limpias, CSS en línea, limpieza de archivos sin uso)
- `vercel.json`: Cabeceras (CSP, seguridad, caché), URLs limpias y redirecciones
- `PLAN.md`: Plan de trabajo con las tareas marcadas
- `docs/`
  - `design-system.md`: Tokens y componentes extraídos de la landing (fuente de verdad del diseño)
  - `referencia-landing/`: Capturas de la landing a 375 y 1440 px
- `integrations/`
  - `google-sheets.gs`: Apps Script de la hoja de leads (copia exacta del de la landing: web y landing, misma hoja)
- `public/`: Favicon, iconos, manifest y el catálogo en PDF (assets/docs/)
- `scripts/`
  - `serve.mjs`: Servidor local que imita a Vercel (cabeceras, URLs limpias y 404 real)
  - `check-content.mjs`: Validador de los datos de producto y categorías
  - `imagenes/`: Fotos con IA (`mejorar_ia.py`: Real-ESRGAN y BiRefNet), medida de cada equipo para su sombra (`encuadre.py`) y logotipos de marcas en SVG (`logos.py`), en Python
  - `mapa/`: Generadores de los mapas (Natural Earth): `generar-alcance.mjs` (mapa de Alcance internacional: países y puntos de envío) y `generar-mapa.mjs` (mapas de puntos de "La historia")
  - `fuentes/`: Subconjunto de la fuente serif
- `src/`
  - `config.ts`: SITE_URL, SHEETS_ENDPOINT, VERCEL_ANALYTICS y GOOGLE_SITE_VERIFICATION (también como variables de entorno de Vercel)
  - `data/`: Único origen de datos: empresa, categorías, productos, FAQ, comparativas y mapas
  - `content/guias/`: Guías en Markdown (colección de contenido)
  - `assets/`: Fuentes woff2, fotos, fotos de producto maestras sin fondo con su `encuadre.json` (Astro genera WebP) y logotipos de marcas (`marcas/`)
  - `components/`: Cabecera, pie, tarjetas, formulario, ficha de producto, comparador, mapa, etc.
  - `layouts/Base.astro`: SEO (title, description, canonical, OG, Twitter), JSON-LD, sprite y scripts
  - `lib/`: SEO y JSON-LD, textos, imágenes, rutas indexables e imágenes OG
  - `pages/`: Rutas (todas generadas desde src/data y src/content)
  - `scripts/`: JS vanilla: main (orquestador), formulario, catálogo, consentimiento, analítica (Vercel) e `intro-head.js` (decide la intro antes de pintar)
  - `styles/`: tokens.css (colores, tipografía, espacios, radios, sombras) y estilos por plantilla
- `tests/`: Pruebas automáticas (npm test)

### Rutas

| Ruta | Contenido |
| --- | --- |
| `/` | Inicio (13 secciones) |
| `/ecografos` y `/ecografos/[modelo]` | Pilar de ecografía y sus 15 fichas |
| `/diatermias` y `/diatermias/[modelo]` | Pilar de diatermia y sus 4 fichas |
| `/equipos` | Todas las categorías |
| `/equipos/[categoria]` y `/equipos/[categoria]/[modelo]` | 10 categorías y 34 fichas |
| `/catalogo` | Catálogo completo con filtros, buscador y orden, más el PDF |
| `/sobre-nosotros`, `/contacto` | Empresa y contacto |
| `/guias` y `/guias/[slug]` | Guías |
| `/aviso-legal`, `/privacidad`, `/cookies` | Legales |
| `/404` | Error con estado 404 real |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt` | Generados desde los datos |
| `/og/[slug].jpg` | Imágenes para compartir en redes |

---

## 2. Ejecutar en local

Requisitos: Node 22.12 o superior.

```bash
npm install
npm run dev          # desarrollo en http://localhost:4321
npm run build        # compila a dist/ (la primera vez tarda unos 35 s por las imágenes OG; después, unos 4 s)
npm run preview      # sirve dist/ en http://localhost:8080 con las cabeceras de vercel.json
npm run check:content  # valida los datos de producto (slugs, relacionados, imágenes, longitudes SEO, rayas)
npm test             # pruebas automáticas contra dist/ (ver apartado 9)
```

---

## 3. Añadir o editar productos

Todos los productos están en `src/data/productos/` (un archivo por grupo: `ecografia.ts`, `diatermia.ts`, `fisioterapia.ts`, `camillas-estetica.ts`). **Nunca se escribe una ficha a mano**: la ficha, la tarjeta, el catálogo, el sitemap, el `llms.txt`, el JSON-LD y la imagen OG salen de estos datos.

1. Copia un producto parecido y cambia sus campos. Los importantes:
   - `slug`: en minúsculas y con guiones (será la URL).
   - `categoria`: el `id` de `src/data/categorias.ts`.
   - `ficha: true` si hay información suficiente (nombre, descripción y varias especificaciones); con `false` solo aparece en su categoría y en el catálogo, con el botón "Quiero asesoramiento".
   - `datosClave` (2 a 4), `caracteristicas`, `especificaciones` (3 o más), `usos`, `paraQuien` (3), `incluye`, `normativa`, `codigos` y `paginaCatalogo`.
   - `imagenes`: nombres de archivo de `src/assets/productos/` (sin extensión).
   - `relacionados`: slugs de otros productos.
   - `seoTitle` y `seoDescription` solo si la plantilla automática no encaja (50 a 60 y 140 a 160 caracteres).
2. Añade la imagen en `src/assets/productos/`: WebP (o PNG) **con fondo transparente**, lienzo 4:3 de 1280 × 960 con el equipo centrado y apoyado en la línea del 88 % de la altura, como el resto. El fondo suave y la sombra de contacto los pone el CSS. Para prepararla desde una foto con fondo, añádela a la tabla `PRODUCTOS` de `scripts/imagenes/mejorar_ia.py` y ejecuta `python3 scripts/imagenes/mejorar_ia.py <pdfimages> <imágenes de la landing> <imágenes de EDAN> <pesos de Real-ESRGAN> <nombre>` (escalado con Real-ESRGAN, recorte con BiRefNet y encuadre común) y después `python3 scripts/imagenes/encuadre.py` (mide el ancho del equipo para su sombra).
3. Ejecuta `npm run check:content` y `npm run build`.

**No inventes datos:** ni precios, ni plazos, ni certificaciones que no estén en el catálogo o en la documentación del fabricante.

## 4. Añadir guías

Crea un Markdown en `src/content/guias/` con esta cabecera:

```yaml
---
titulo: "Titular con el acento *en cursiva.*"
corto: "Título para tarjetas y migas"
seoTitle: "De 50 a 60 caracteres"
seoDescription: "De 140 a 160 caracteres"
resumen: "Una o dos frases para la tarjeta y la entradilla"
fecha: "2026-09-26"
imagen: "fotos/nombre-de-la-foto"        # o el nombre de una foto de producto
imagenAlt: "Descripción de la imagen"
relacionados: ["slug-producto-1", "slug-producto-2"]
orden: 4
---
```

Los `##` forman el índice. Para el CTA a mitad de la guía, pega este bloque donde quieras que aparezca:

```html
<div class="g-cta">
<p class="g-cta__t">¿Te ayudo a elegir?</p>
<p class="g-cta__d">Una frase breve.</p>
<a class="btn btn--primary" href="#asesoramiento" data-cta>Quiero asesoramiento</a>
</div>
```

El índice, el tiempo de lectura, la fecha, el autor, el CTA final, el JSON-LD `Article`, la imagen OG, el sitemap y el `llms.txt` se generan solos. **Sin rayas ni guiones largos** en el texto: el test los detecta.

---

## 5. Google Sheets (leads del formulario)

**Ya está conectado y probado.** `SHEETS_ENDPOINT` (en `src/config.ts`) apunta a la misma aplicación web de Apps Script que usa la landing, así que los leads de la web y de la landing caen en la misma hoja, pestaña **Leads**: Fecha, Nombre, Teléfono, Email, Perfil, Equipo de interés, Modelo, utm_source, utm_medium, utm_campaign, utm_content, utm_term y event_id (oculta). La URL `/exec` abierta en el navegador responde `{"ok":true,"service":"VytalGroup leads",...}`.

`integrations/google-sheets.gs` es el script de la landing (el que tiene la hoja) con una mejora: si el email de aviso falla (por ejemplo, por la cuota diaria de Gmail), el lead ya guardado no se responde como error. Para la web no hace falta, pero la landing sí muestra ese error; conviene pegarlo en la hoja (apartado 8, paso 6) y copiarlo también al repositorio de la landing.

**Cómo se distinguen los leads de la web.** Si la visita trae UTM propios (por ejemplo, de un anuncio), se guardan tal cual. Si no, la web los rellena así:

| Columna | Valor |
| --- | --- |
| `utm_source` | `web` |
| `utm_medium` | `directo` (sin procedencia o desde la propia web), `organico` (buscadores), `redes` (Instagram, Facebook, WhatsApp, LinkedIn, TikTok, YouTube...) o `referencia` (otra web) |
| `utm_campaign` | La página desde la que se envía: `inicio`, `contacto`, `ecografos/acclarix-ax8`... |
| `utm_content` | El dominio de procedencia, si viene de fuera |

**Envío rápido y sin errores falsos.** El formulario manda el lead y muestra el agradecimiento en cuanto Google responde (normalmente en menos de 1,5 s). La respuesta de Apps Script es una redirección a `script.googleusercontent.com`: la web no la sigue (`redirect: "manual"`), porque esa redirección solo llega cuando el script ya ha terminado de ejecutarse. Así no depende de un segundo dominio que algunos bloqueadores o Safari cortan, que era lo que mostraba "No se ha podido enviar" aunque el lead llegaba. A cambio, la web no lee el `{ok:false}` de una validación del servidor; por eso el formulario comprueba lo mismo antes de enviar (nombre, perfil, equipo, consentimiento y teléfono o correo válidos). Si Google tarda más de 1 s, se da las gracias igualmente y el envío sigue en segundo plano (con `keepalive` y un reintento); solo si falla de verdad aparece el aviso con Reintentar y WhatsApp, con los datos intactos. Los reintentos no duplican filas: el script descarta el mismo `event_id`. Tras enviar, "Enviar otra consulta" deja el formulario vacío en la pregunta 1.

El script valida en el servidor, usa `LockService`, descarta duplicados por `event_id`, guarda la fecha en hora de Madrid, evita fórmulas en las celdas y envía un email por lead a `NOTIFY_EMAIL` (`vytalkinetech@gmail.com` en el script de este repositorio; la hoja usa el que tenga pegado hasta que se actualice, ver abajo; `SEND_EMAIL_NOTIFICATION = false` lo apaga).

### Cambiar el script de la hoja (sin cambiar la URL)

1. Abre la hoja de leads: **Extensiones > Apps Script**.
2. Borra todo el código y pega entero `integrations/google-sheets.gs` (cambia antes `NOTIFY_EMAIL` si los avisos deben ir a otro correo). Guarda.
3. **Implementar > Gestionar implementaciones** > el lápiz de la implementación activa > **Versión: Nueva versión** > **Implementar**. La URL `/exec` no cambia: la web y la landing siguen funcionando sin tocar nada.

### Si algún día hay que montar la hoja de cero

1. Crea una hoja (por ejemplo "Leads VytalGroup") y pega el script como arriba.
2. Elige la función **setup** y pulsa **Ejecutar**. Acepta los permisos (Revisar permisos > tu cuenta > Configuración avanzada > Ir a (proyecto) > Permitir). Se crea la pestaña "Leads".
3. **Implementar > Nueva implementación**, tipo **Aplicación web**: Ejecutar como **Yo**; Quién tiene acceso **Cualquier usuario**. Copia la URL que termina en `/exec`.
4. Ponla en la variable `SHEETS_ENDPOINT` de Vercel (apartado 7) o en `src/config.ts`, y en `config.js` de la landing. Vuelve a desplegar.

Con `SHEETS_ENDPOINT` vacío, el formulario muestra un error amable (con WhatsApp como alternativa, sin perder los datos) y avisa en la consola del navegador.

## 6. Sin píxel de Meta

La web no lleva el píxel de Meta ni ninguna otra herramienta o cookie de publicidad: ni script, ni eventos, ni `fbclid`, `_fbp` o `_fbc` en el formulario, y la CSP de `vercel.json` no permite dominios de Meta (`qa-form` comprueba que no se pide nada a Meta). Lo que sí viaja con cada lead son los UTM de la visita, para saber de dónde llega (apartado 5).

## 6 bis. Analítica (Vercel Web Analytics)

La web cuenta visitas con **Vercel Web Analytics** (`src/scripts/analytics.ts`). No usa cookies (Vercel calcula un identificador anónimo que caduca a las 24 horas), pero aun así **solo se carga si el visitante acepta la categoría "Analítica"** del aviso de cookies; si la retira, deja de enviar datos en esa misma visita. El script y los envíos van al propio dominio (`/_vercel/insights/...`), así que la CSP no cambia. En local (`localhost`) nunca se carga. Para apagarla sin tocar código: variable `VERCEL_ANALYTICS` = `false`.

---

## 7. Despliegue en Vercel, dominio y variables de entorno

- **Producción sale de la rama `main`.** Cada cambio se trabaja en una rama y se fusiona en `main`; Vercel publica en uno o dos minutos. Las vistas previas de otras ramas llevan su propio `noindex` (lo pone Vercel) y no afectan a Google.
- **Dominio: `https://www.vytalgroupem.com`** (comprobado el 1 de octubre de 2026: responde con HTTPS; `vytalgroupem.com` y `http://` redirigen a él con 308). `SITE_URL` ya vale eso por defecto: de ahí salen canonical, Open Graph, JSON-LD, sitemap, `robots.txt` y `llms.txt`. `vercel.json` redirige `vytalgroup.vercel.app` al dominio para que solo exista una dirección. Si algún día el principal pasa a ser el dominio sin `www`, define `SITE_URL` en Vercel.
- **Ninguna página lleva noindex** y `robots.txt` deja pasar a todos los bots.
- `vercel.json` incluye la CSP (solo scripts propios; conexión al Apps Script), cabeceras de seguridad, caché inmutable para `/_astro` y `/assets`, el PDF como descarga y redirecciones de rutas antiguas o probables (`/nosotros`, `/tecarterapia`, `/equipos/ecografia`...).

**Variables de entorno** (Vercel > el proyecto > **Settings > Environment Variables**, entorno **Production**). Ninguna es obligatoria: sin ellas la web usa los valores de `src/config.ts`. Después de crear o cambiar una: **Deployments** > el último > menú **⋯** > **Redeploy**.

| Variable | Valor | Para qué |
| --- | --- | --- |
| `GOOGLE_SITE_VERIFICATION` | El código de la etiqueta de Google (solo lo de `content="..."`) | Verificar Search Console con etiqueta HTML (si no se hace por DNS) |
| `SHEETS_ENDPOINT` | URL `/exec` del Apps Script | Solo si se crea otra implementación del script |
| `SITE_URL` | `https://www.vytalgroupem.com` | Ya es el valor por defecto; solo si cambia el dominio principal |
| `VERCEL_ANALYTICS` | `false` | Solo para apagar la analítica |

---

## 8. Guía para publicar, paso a paso

En este orden. Lo que ya está hecho va marcado.

1. [x] **Dominio conectado:** `https://www.vytalgroupem.com` sirve la web con HTTPS y `vytalgroupem.com` redirige a él.
2. [x] **Formulario y hoja:** funcionan y están probados de punta a punta (apartado 5).
3. [x] **Datos legales del titular:** Javier Ruiz Vides, DNI, domicilio en Bertrange (Luxemburgo), correo y teléfono, en `src/components/LegalTitular.astro` (aviso legal y privacidad). El plazo de conservación de los leads se explica por criterios (mientras dure la relación o el tiempo necesario para atender la solicitud). Si hay un plazo concreto, se pone en `src/pages/privacidad.astro`.
4. [x] **Sin píxel de Meta:** retirado del código, del aviso de cookies, de la CSP y de los textos legales.
5. [ ] **Fusionar en `main`** la rama de la última ronda (en GitHub: **Pull requests > New pull request**, base `main` y la rama `claude/eloquent-turing-1arlub`, **Create** y **Merge**). Hasta entonces el dominio sigue mostrando la versión anterior.
6. [ ] **Apps Script:** pegar en la hoja el script de `integrations/google-sheets.gs` con el método del apartado 5 (la URL no cambia). Lleva los avisos a `vytalkinetech@gmail.com` y no da error si el aviso por email falla. Después, borrar las filas de prueba.
7. [ ] **Activar Vercel Web Analytics:** Vercel > el proyecto > **Analytics** > **Enable**. Después, **Redeploy** del último despliegue. Comprobación: `https://www.vytalgroupem.com/_vercel/insights/script.js` deja de dar 404 y, tras aceptar la analítica en el aviso de cookies, la visita aparece en el panel a los pocos minutos.
8. [ ] **Google Search Console:** [search.google.com/search-console](https://search.google.com/search-console) > **Añadir propiedad** > **Dominio** `vytalgroupem.com` > añade el registro **TXT** que te da en el DNS del dominio y verifica (alternativa: propiedad de **Prefijo de URL** `https://www.vytalgroupem.com` con etiqueta HTML y la variable `GOOGLE_SITE_VERIFICATION`). Después: **Sitemaps** > envía `https://www.vytalgroupem.com/sitemap.xml` e **Inspección de URLs** de la portada > **Solicitar indexación**.
9. [ ] **Comprobación final en el dominio** (tras el paso 5):
   - En una ventana de incógnito, la web abre con la intro (solo esa primera vez) y el hero nuevo; en "Ver código fuente" aparece `<link rel="canonical" href="https://www.vytalgroupem.com/">`.
   - `https://www.vytalgroupem.com/robots.txt` dice `Allow: /` y apunta a `https://www.vytalgroupem.com/sitemap.xml`.
   - `https://vytalgroup.vercel.app` redirige a `https://www.vytalgroupem.com`.
   - Un envío de prueba del formulario llega a la hoja y al correo; el WhatsApp flotante abre el chat con el mensaje escrito; el teléfono, el correo y la descarga del catálogo funcionan.

**Contenido pendiente (no impide publicar):**

- [ ] **Revisión de las 3 guías por Javier** (`src/content/guias/`). Están escritas en su voz, con datos solo del catálogo y del brief, pero debe leerlas y aprobarlas.
- [ ] **Revisar los 5 EDAN de la web oficial** (Nano, U60, U50, DUS60 y U2): confirmar que se ofrecen en España y con qué configuración; el catálogo EDAN ("ENG-2024-25 Product Catalogue") no estaba en el material recibido.
- [ ] **Fotos originales:** con las fotos de producto en alta resolución (y fotos de Javier en su contexto de trabajo) la web ganaría aún más. Basta con procesarlas con `scripts/imagenes/mejorar_ia.py` manteniendo el nombre.
- [ ] **Camillas:** con su ficha técnica (medidas, peso admitido, motor) se pueden completar.
- [ ] **Logotipo de VytaMeD:** basta con añadir su SVG en `src/assets/marcas/`.

**Landing (`vsl-vytalgroup`, repositorio aparte):** lleva todavía el envío antiguo del formulario (sigue la redirección de Google y espera hasta 20 s, lo que daba "No se ha podido enviar" aunque el lead llegaba): conviene llevar allí la forma de enviar de `src/scripts/form.js`. Además: copiar el `integrations/google-sheets.gs` de aquí, poner su `SITE_URL` en el dominio que vaya a tener (por ejemplo `https://vsl.vytalgroupem.com`) y sustituir su PDF del catálogo por el de esta web (el suyo lleva una nota interna en los metadatos).

---

## 9. Pruebas

`npm test` levanta `dist/` con las cabeceras de `vercel.json` (CSP incluida) y un Apps Script simulado, y ejecuta:

| Prueba | Qué comprueba |
| --- | --- |
| `qa-seo` | Sin navegador: title de 50 a 60 y description de 140 a 160 caracteres, únicos; un H1 con acento; lang, canonical, Open Graph y Twitter con imagen existente; robots `index, follow` en todas (ninguna con noindex, tampoco en `vercel.json`); JSON-LD válido, sin offers ni valoraciones y con los tipos de cada plantilla; sin rayas ni veterinaria en ningún archivo publicado; sin scripts en línea; alt en todas las imágenes; enlaces internos, anclas y recursos; sitemap, robots.txt y llms.txt |
| `qa-apps-script` | El Apps Script real (el de la landing) contra una hoja simulada: columnas, columna Modelo, aviso por email, duplicados, campo trampa, validaciones y los envíos tal y como los hace la web (`utm_source = web`) |
| `qa-form` | Sin píxel de Meta (ni script, ni peticiones, ni cookies). Formulario completo con UTM y con los UTM de la web, preselección desde ficha y desde tarjeta sin ficha (siempre desde la pregunta 1), validación, error del servidor, servidor lento (agradecimiento en menos de 1,5 s), "Enviar otra consulta", endpoint vacío, antispam (3 s y campo trampa), consentimiento, analítica de Vercel, WhatsApp y descarga del catálogo |
| `qa-ui` | Cabecera y menús (ratón y teclado), hero del inicio (textos, foto prioritaria, escritorio y móvil), WhatsApp flotante (mensaje por página y posición sobre la barra móvil), mapa de alcance, catálogo (filtros, búsqueda, orden, URL, sin JavaScript), segmentado, acordeón, galería, guías (índice y progreso), teclado, movimiento reducido, CSP sin violaciones, 404 real y caché |
| `qa-a11y` | axe-core (WCAG 2.2 AA y buenas prácticas) en las 78 páginas a 390 y 1440 px, más un cálculo de contraste propio donde axe no puede resolver el fondo (degradados y pseudoelementos) |
| `html-validate` | HTML válido en todas las páginas (reglas en `.htmlvalidate.json`) |
| `qa-layout` | 15 páginas (todas las plantillas, más una categoría con fila impar) en los 12 anchos del brief (320 a 1920): sin scroll horizontal, sin elementos fuera de pantalla, sin textos cortados, botones en una línea, áreas táctiles de 44 px, H1 en la primera pantalla y sin errores de consola. Guarda capturas de página completa en `tests/output/screenshots/` |

Se puede lanzar una sola: `node tests/run.mjs qa-form`.

**Lighthouse móvil** (no entra en `npm test` porque necesita descargar Lighthouse): `npm install --no-save lighthouse@12 && npm run build && node tests/lighthouse.mjs`. Audita inicio, las dos páginas pilar, una ficha, una categoría, el catálogo, sobre nosotros, contacto y una guía con la configuración móvil por defecto (Moto G Power emulado, CPU ×4 y 4G lenta) y deja los informes en `tests/output/lighthouse/`.

---

## 10. Decisiones tomadas

- **Material de referencia.** No había carpeta `referencias/`: se usó el código fuente de la landing (repositorio `vsl-vytalgroup`) como `referencias/landing/`, con su catálogo PDF de 53 páginas, su foto de Javier y sus imágenes. El catálogo EDAN en inglés no estaba disponible, así que los datos de ecografía salen del catálogo ADC Global Tech | VytalGroup 2026 y del brief.
- **Color de acento.** El brief proponía `#00C9A7` "a confirmar"; el CSS de la landing usa el turquesa **`#48A0A8`** (y `#7FD3D6` sobre fondo oscuro), así que se mantiene el de la landing para ser coherentes al 100 %. Todo está en `docs/design-system.md` y `src/styles/tokens.css`.
- **Fuentes.** Geist (el archivo de la landing recortado a las letras de Latin-1 y los signos que usa la web) e Instrument Serif cursiva recortada a los caracteres del español y cifras, sin hinting (`scripts/fuentes/subset_fonts.sh`), autoalojadas en woff2; solo se precarga la del H1.
- **Imágenes.** Cada foto de producto parte del original de más calidad disponible (catálogo, web de EDAN o landing), se escala ×4 con Real-ESRGAN x4plus, se recorta con BiRefNet y se coloca en un lienzo transparente común de 1280 × 960 con el mismo encuadre para todas. Para no inventar nada: nunca se publica el ×4 tal cual (se reduce al tamaño final) y se mezcla un 25 % del original ampliado sin IA, así textos, pantallas y logotipos no cambian; en las fotos de contexto y de Javier se usa el modelo general, más conservador, sin restauración facial. La foto de Javier (su original es de 384 px) y la de la magnetoterapia Clínica se amplían ×3 para que se vean nítidas en pantallas retina y móviles, y a la de Javier se le alisa la pared del fondo, que traía ondas de compresión. El fondo suave y la sombra de contacto de cada equipo los pone el CSS (`.stage`), con el ancho real del equipo medido en `src/assets/productos/encuadre.json`. Astro genera los WebP en varios anchos, hasta lo que pide una pantalla retina (2x) o un móvil (3x) para el tamaño al que se ve cada imagen y sin pasar del original: calidad 85 en los equipos, con la transparencia sin pérdida (bordes limpios), 88 en las fotos y 80 en las fotos de fondo desenfocadas.
- **Fichas.** Los 53 productos tienen ficha con la misma estructura y orden: galería y datos clave, lo que importa (con la descripción de para quién es como entradilla), especificaciones con aplicaciones, qué incluye y normativa, garantía y servicio, preguntas frecuentes (4 a 7 por equipo, generadas desde sus datos y las condiciones de la empresa, con su FAQPage), relacionados y formulario. Las camillas solo usan lo que da el catálogo; los EDAN de la web oficial lo indican en su nota de fuente.
- **Tarjetas.** Una única tarjeta de producto en toda la web (categorías, catálogo, gama, guías y fichas). En rejillas y carruseles sus filas son las de la rejilla (CSS subgrid), así nombres, textos, datos y botones quedan alineados aunque cada equipo tenga un texto distinto; los textos están acotados a 2 y 3 líneas. En escritorio se inclinan en 3D hacia el cursor.
- **Marcas.** Logotipos oficiales de cada web (EDAN, I-Tech, EME y LiKAMED) y de la página de empresa de EasyTech, vectorizados en un solo color (`scripts/imagenes/logos.py`); VytaMeD, sin logotipo publicado, va en texto.
- **Precio.** Las fichas dicen "Precio según configuración. Pídenos una propuesta sin compromiso." y nunca muestran precios ni `offers` en JSON-LD.
- **Catálogo.** Todo el catálogo está en el HTML estático (rastreable y visible sin JS). En escritorio, la fila de categorías se desplaza con flechas; en móvil, las tarjetas pasan a filas compactas para no convertir 53 equipos en un scroll interminable. El estado del filtro va en la URL y el canonical sigue siendo `/catalogo`.
- **Contacto.** El formulario grande está arriba (es el protagonista de la página) y la página termina con las dudas y un botón que vuelve a él, en lugar de repetir un segundo formulario idéntico. Sin mapa ni dirección.
- **Legales y 404.** Sin CTA final ni formulario, como pide el brief; la barra móvil y la cabecera llevan a `/contacto#asesoramiento`.
- **Guías.** Tres guías de 950 a 1.100 palabras, firmadas por Javier, con fecha de publicación del día en que se escribieron (26 de septiembre de 2026). Solo usan datos del catálogo y afirmaciones generales prudentes (física básica de la ecografía y de la tecarterapia, normativa MDR), sin promesas clínicas.
- **Hoja de leads.** La web usa la hoja y el script de la landing tal cual (13 columnas, con Modelo). En lugar de columnas propias de origen, los leads de la web se reconocen por `utm_source = web` y la página en `utm_campaign`.
- **URLs.** Sin barra final y sin `.html` (`cleanUrls`); las fichas de ecografía y diatermia cuelgan de su pilar (`/ecografos/acclarix-ax8`), y el resto de `/equipos/[categoria]/[modelo]`. Se añaden redirecciones para `/equipos/ecografia` y `/equipos/diatermia`.
- **Rendimiento.** CSS en línea por página (sin peticiones de estilos), JS dividido (el formulario y los filtros se cargan solo cuando hacen falta), todas las imágenes en WebP con dimensiones fijas y carga diferida, un único script en el `<head>` de unos 300 bytes (la intro) y una integración de Astro que borra del build las imágenes originales que no se usan.
- **Intro de marca.** A pantalla completa y solo la primera vez que se abre la web en un navegador (`localStorage`). Se decide antes de pintar con un script externo diminuto (`src/scripts/intro-head.js`, compatible con la CSP), así en las visitas siguientes no hay ni un parpadeo. No recibe clics y cualquier gesto la adelanta.
- **Imágenes OG.** Se generan en el build con satori y resvg (marca, titular con acento y producto o foto) y se guardan en caché en `node_modules/.cache/vg-og` para que los siguientes builds sean rápidos.
- **Mapas.** Se generan con Natural Earth (paquete `world-atlas`): el de Alcance internacional en `scripts/mapa/generar-alcance.mjs` (países en vectores y puntos de envío) y los de puntos de "La historia" (península y Europa) en `scripts/mapa/generar-mapa.mjs`.
- **Instagram.** Solo se enlaza el perfil de Javier (@fisioruiz_), sin su número de seguidores porque cambia con el tiempo. La marca no tiene cuenta propia, así que no se enlaza ninguna.
- **Hero del inicio.** Marino, con el titular corto a la izquierda y una foto real de una ecografía de hombro con sonda inalámbrica que se funde con el fondo (debajo del texto en móvil). Entra una sola vez al cargar (cortina de luz turquesa y zoom de la foto, titular por palabras) y después queda quieto: sin animaciones continuas ni paralaje.
- **Fondos de sección.** Cada sección tiene un fondo distinto del de sus vecinas: blanco, niebla (`sec--mist`), rejilla (`sec--grid`), puntos (`sec--dots`), turquesa (`sec--teal`), marino (`sec--dark`) o foto con capa marina (`sec--photo`). Las utilidades están en `src/styles/base.css`.
- **Fotos de fondo.** Seis fotos de clínicas y salas de fisioterapia de Unsplash y Pexels, con licencia libre para uso comercial y sin atribución obligatoria (fuentes y licencias en `docs/fotos-licencias.md`). Van con un desenfoque ligero (radio 4,5 a 2000 px, `scripts/imagenes/fondos.py`), con poca opacidad sobre el marino y un velo con toque azul, y con un alt genérico que no nombra marcas ni modelos. Se guardan y se sirven con calidad alta para que el desenfoque no forme bloques ni bandas.
- **Catálogo PDF.** Reescrito con Ghostscript para limpiar sus metadatos (el asunto tenía una nota interna sobre códigos CRM y el autor ponía "Vytal Group"). Las páginas son idénticas. La copia de la landing (`assets/docs/`) conserva los metadatos antiguos hasta que se sustituya por esta.
