# VytalGroup · Web corporativa

Web multipágina de VytalGroup: **equipos médicos de alta calidad, sin letra pequeña**. Astro con salida 100 % estática, JavaScript vanilla solo donde hace falta (formulario, filtros, menús, cookies y animaciones), mismo sistema de diseño que la landing de campañas (https://vsl-vytalgroup.vercel.app/) y preparada para publicarse en **https://vytalgroup.org**.

- 67 páginas HTML: inicio, 2 páginas pilar (ecógrafos y diatermias), índice de equipos, 10 páginas de categoría, 42 fichas de producto, catálogo navegable, sobre nosotros, contacto, índice de guías y 3 guías, 3 legales y 404.
- 53 productos en un único origen de datos (`src/data/productos/`): los 48 del catálogo 2026 y 5 modelos EDAN pendientes de confirmar. 42 tienen ficha propia.
- Formulario de 4 pasos idéntico al de la landing, conectado a la **misma hoja de Google Sheets** (columnas nuevas Origen y Página).
- Meta Pixel condicionado al consentimiento de cookies, con los eventos del brief.
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
  - `google-sheets.gs`: Apps Script de la hoja de leads (web y landing, misma hoja)
- `public/`: Favicon, iconos, manifest y el catálogo en PDF (assets/docs/)
- `scripts/`
  - `serve.mjs`: Servidor local que imita a Vercel (cabeceras, URLs limpias y 404 real)
  - `check-content.mjs`: Validador de los datos de producto y categorías
  - `imagenes/`: Recorte y limpieza de las fotos de producto desde el PDF (Python)
  - `mapa/`: Generador de los mapas de puntos (Natural Earth)
  - `fuentes/`: Subconjunto de la fuente serif
- `src/`
  - `config.ts`: SITE_URL, SHEETS_ENDPOINT y META_PIXEL_ID (lo único que hay que tocar para publicar)
  - `data/`: Único origen de datos: empresa, categorías, productos, FAQ, comparativas y mapas
  - `content/guias/`: Guías en Markdown (colección de contenido)
  - `assets/`: Fuentes woff2, fotos y fotos de producto maestras (Astro genera AVIF y WebP)
  - `components/`: Cabecera, pie, tarjetas, formulario, ficha de producto, comparador, mapa, etc.
  - `layouts/Base.astro`: SEO (title, description, canonical, OG, Twitter), JSON-LD, sprite y scripts
  - `lib/`: SEO y JSON-LD, textos, imágenes, rutas indexables e imágenes OG
  - `pages/`: Rutas (todas generadas desde src/data y src/content)
  - `scripts/`: JS vanilla: main (orquestador), formulario, catálogo, consentimiento, tracking
  - `styles/`: tokens.css (colores, tipografía, espacios, radios, sombras) y estilos por plantilla
- `tests/`: Pruebas automáticas (npm test)

### Rutas

| Ruta | Contenido |
| --- | --- |
| `/` | Inicio (13 secciones) |
| `/ecografos` y `/ecografos/[modelo]` | Pilar de ecografía y sus 10 fichas |
| `/diatermias` y `/diatermias/[modelo]` | Pilar de diatermia y sus 4 fichas |
| `/equipos` | Todas las categorías |
| `/equipos/[categoria]` y `/equipos/[categoria]/[modelo]` | 10 categorías y 28 fichas |
| `/catalogo` | Catálogo completo con filtros, buscador y orden, más el PDF |
| `/sobre-nosotros`, `/contacto` | Empresa y contacto |
| `/guias` y `/guias/[slug]` | Guías |
| `/aviso-legal`, `/privacidad`, `/cookies` | Legales (noindex) |
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
2. Añade la imagen en `src/assets/productos/` (PNG o WebP, fondo blanco, 640 × 480 como el resto). Para recortar desde el PDF del catálogo: `python3 scripts/imagenes/build_productos.py <carpeta de pdfimages> <carpeta de imágenes de la landing>`.
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

La web usa **la misma hoja que la landing**. El script `integrations/google-sheets.gs` sustituye al de la landing y sirve para las dos: la web envía `origen: "web"` y la página exacta; la landing no envía origen y se guarda como `landing`, con su URL de entrada como página.

Columnas (en una hoja nueva se crean en este orden; en la hoja de la landing, **Origen** y **Página** se añaden al final sin tocar las filas anteriores, y cada dato va a la columna que tiene su título):

Fecha · Origen · Página · Nombre · Teléfono · Email · Contactar por · WhatsApp · Equipo · Modelo · Perfil · Consentimiento · utm_source · utm_medium · utm_campaign · utm_content · utm_term · fbclid · fbc · fbp · Referrer · URL de entrada · Dispositivo · Idioma · event_id · Estado

### Pasos

1. Abre la hoja de leads de la landing (o crea una nueva, por ejemplo "Leads VytalGroup").
2. En la hoja: **Extensiones > Apps Script**. Borra lo que haya y pega entero `integrations/google-sheets.gs`.
3. Guarda. Elige la función **setup** y pulsa **Ejecutar**. Acepta los permisos (Revisar permisos > tu cuenta > Configuración avanzada > Ir a (proyecto) > Permitir). Se crea o actualiza la pestaña "Leads".
4. **Implementar > Nueva implementación**, tipo **Aplicación web**: Ejecutar como **Yo**; Quién tiene acceso **Cualquier usuario**. Copia la URL que termina en `/exec`.
   - Si la landing ya tenía una implementación, puedes usar **Gestionar implementaciones > editar > Versión: nueva**: la URL no cambia y la landing sigue funcionando.
5. Pega la URL en `src/config.ts`:
   ```ts
   export const SHEETS_ENDPOINT = 'https://script.google.com/macros/s/.../exec';
   ```
6. `npm run build` y publica. Para comprobarlo, abre la URL `/exec` en el navegador: responde `{"ok":true,...}`.

Con `SHEETS_ENDPOINT` vacío, el formulario muestra un error amable (con WhatsApp como alternativa, sin perder los datos) y avisa en la consola del navegador.

El script valida en el servidor, usa `LockService`, descarta duplicados por `event_id`, guarda la fecha en hora de Madrid, evita fórmulas en las celdas y envía un email por lead a `vytalkinetech@gmail.com` (`SEND_EMAIL_NOTIFICATION` para desactivarlo).

## 6. Meta Pixel

El ID va en `src/config.ts`:

```ts
export const META_PIXEL_ID = '123456789012345';
```

Sin ID no se carga nada. Con ID, el píxel **no se descarga hasta que el usuario acepta las cookies de marketing**. Eventos (módulo `src/scripts/tracking.ts`):

| Evento | Cuándo |
| --- | --- |
| `PageView` | En cada página |
| `ViewContent` | En fichas (`content_ids` con el slug, `content_type: "product"`, `content_category`) y páginas pilar |
| `Lead` | Solo tras un envío correcto, una vez, con `eventID` = `event_id` de la hoja y `content_name` con el modelo o equipo |
| `DescargaCatalogo` | `trackCustom` al descargar el PDF (no es un lead) |
| `Contact` | Al pulsar WhatsApp, teléfono o email |
| `Search` | Al buscar en el catálogo (con espera de 0,9 s) |

Los UTM y el `fbclid` se guardan en la primera visita (`sessionStorage`) y viajan entre páginas; si no existe la cookie `_fbc`, se construye desde el `fbclid`.

---

## 7. Despliegue en Vercel y dominio

1. Sube el repositorio a GitHub e impórtalo en Vercel (**Add New > Project**). Vercel detecta Astro; `vercel.json` ya fija `npm run build` y la carpeta `dist`.
2. Antes del primer despliegue, rellena `src/config.ts` (endpoint y píxel) o déjalos vacíos para una versión de prueba.
3. **Dominio vytalgroup.org:** en el proyecto de Vercel, **Settings > Domains > Add** `vytalgroup.org` y `www.vytalgroup.org` (redirige `www` al dominio principal). En el proveedor del dominio:
   - `vytalgroup.org`: registro **A** a `76.76.21.21`
   - `www`: registro **CNAME** a `cname.vercel-dns.com`

   (o cambia los DNS a los de Vercel). El certificado HTTPS se emite solo.
4. Si algún día cambia el dominio, cambia `SITE_URL` en `src/config.ts`: canonical, Open Graph, JSON-LD, sitemap y `llms.txt` salen de ahí.
5. En Google Search Console, añade la propiedad del dominio y envía `https://vytalgroup.org/sitemap.xml`.

`vercel.json` incluye la CSP (solo scripts propios y el de Meta; conexión a Apps Script y Meta), cabeceras de seguridad, caché inmutable para `/_astro` y `/assets`, el PDF como descarga y redirecciones de rutas antiguas o probables (`/nosotros`, `/tecarterapia`, `/equipos/ecografia`...).

---

## 8. Pendientes para el cliente

- [ ] **ID del Meta Pixel** en `src/config.ts` (`META_PIXEL_ID`).
- [ ] **URL del Apps Script** en `src/config.ts` (`SHEETS_ENDPOINT`), siguiendo el apartado 5.
- [ ] **Datos legales del titular** (razón social o nombre, NIF o CIF, domicilio y datos registrales) en `src/components/LegalTitular.astro`, y el **plazo de conservación de los leads** en `src/pages/privacidad.astro`. Ahora están vacíos y marcados en amarillo como "[Pendiente: ...]".
- [ ] **Revisión de las 3 guías por Javier** antes de publicar (`src/content/guias/`). Están escritas en su voz, con datos solo del catálogo y del brief, pero debe leerlas y aprobarlas.
- [ ] **Confirmar disponibilidad de los modelos que solo aparecen en el catálogo EDAN**: Nano, U60, U50, U2 y DUS60. Están solo en el catálogo navegable (sin ficha y con "Pregúntanos por su disponibilidad y configuración"), marcados con `confirmar: true` en `src/data/productos/ecografia.ts`.
- [ ] **Catálogo EDAN** ("ENG-2024-25 Product Catalogue"): no estaba en el material recibido. Con él se pueden completar las fichas EDAN y dar ficha a los modelos anteriores.
- [ ] **Fotos:** las fotos de producto salen del PDF comprimido del catálogo (entre 325 y 380 px de ancho en origen). Con fotos originales en alta resolución, y fotos de Javier en su contexto de trabajo, la web ganaría mucho. Basta con sustituir los archivos de `src/assets/` manteniendo el nombre.
- [ ] **Camillas:** el catálogo solo trae nombre, una línea y tres rasgos por modelo, así que no tienen ficha propia. Con su ficha técnica (medidas, peso admitido, secciones, motor), se les puede crear.

---

## 9. Pruebas

`npm test` levanta `dist/` con las cabeceras de `vercel.json` (CSP incluida) y un Apps Script simulado, y ejecuta:

| Prueba | Qué comprueba |
| --- | --- |
| `qa-seo` | Sin navegador: title de 50 a 60 y description de 140 a 160 caracteres, únicos; un H1 con acento; lang, canonical, Open Graph y Twitter con imagen existente; robots (noindex solo en legales y 404); JSON-LD válido, sin offers ni valoraciones y con los tipos de cada plantilla; sin rayas ni veterinaria en ningún archivo publicado; sin scripts en línea; alt en todas las imágenes; enlaces internos, anclas y recursos; sitemap, robots.txt y llms.txt |
| `qa-apps-script` | El Apps Script real contra una hoja simulada: hoja nueva, hoja de la landing (columnas por título), origen por defecto, duplicados, campo trampa y validaciones |
| `qa-form` | Formulario completo con UTM, preselección desde ficha y desde tarjeta sin ficha, validación, error del servidor, endpoint vacío, antispam (3 s y campo trampa), consentimiento y todos los eventos del píxel (Meta simulado, sin salir a internet) |
| `qa-ui` | Cabecera y menús (ratón y teclado), catálogo (filtros, búsqueda, orden, URL, sin JavaScript), segmentado, acordeón, galería, guías (índice y progreso), teclado, movimiento reducido, CSP sin violaciones, 404 real y caché |
| `qa-a11y` | axe-core (WCAG 2.2 AA y buenas prácticas) en las 67 páginas a 390 y 1440 px, más un cálculo de contraste propio donde axe no puede resolver el fondo (degradados y pseudoelementos) |
| `html-validate` | HTML válido en todas las páginas (reglas en `.htmlvalidate.json`) |
| `qa-layout` | 14 plantillas en los 12 anchos del brief (320 a 1920): sin scroll horizontal, sin elementos fuera de pantalla, sin textos cortados, botones en una línea, áreas táctiles de 44 px, H1 en la primera pantalla y sin errores de consola. Guarda capturas de página completa en `tests/output/screenshots/` |

Se puede lanzar una sola: `node tests/run.mjs qa-form`.

**Lighthouse móvil** (no entra en `npm test` porque necesita descargar Lighthouse): `npm install --no-save lighthouse@12 && npm run build && node tests/lighthouse.mjs`. Audita inicio, las dos páginas pilar, una ficha, una categoría, el catálogo, sobre nosotros, contacto y una guía con la configuración móvil por defecto (Moto G Power emulado, CPU ×4 y 4G lenta) y deja los informes en `tests/output/lighthouse/`.

---

## 10. Decisiones tomadas

- **Material de referencia.** No había carpeta `referencias/`: se usó el código fuente de la landing (repositorio `vsl-vytalgroup`) como `referencias/landing/`, con su catálogo PDF de 53 páginas, su foto de Javier y sus imágenes. El catálogo EDAN en inglés no estaba disponible, así que los datos de ecografía salen del catálogo ADC Global Tech | VytalGroup 2026 y del brief.
- **Color de acento.** El brief proponía `#00C9A7` "a confirmar"; el CSS de la landing usa el turquesa **`#48A0A8`** (y `#7FD3D6` sobre fondo oscuro), así que se mantiene el de la landing para ser coherentes al 100 %. Todo está en `docs/design-system.md` y `src/styles/tokens.css`.
- **Fuentes.** Geist (el mismo archivo de la landing) e Instrument Serif cursiva recortada a los caracteres del español y cifras (`scripts/fuentes/subset_fonts.sh`), autoalojadas en woff2; solo se precarga la del H1.
- **Imágenes.** Las fotos de producto del PDF se recortaron, se limpiaron de fondo y se colocaron en un lienzo común con sombra de contacto para que se vean como una familia. Nunca se amplían más de un 12 %. Astro genera AVIF y WebP en varios anchos.
- **Fichas.** Tienen ficha los 42 productos con nombre, descripción y varias especificaciones. Sin ficha: las 6 camillas (el catálogo solo da tres rasgos por modelo) y los 5 modelos EDAN que no están en el catálogo ADC (por confirmar). Sus tarjetas abren el formulario con el producto preseleccionado.
- **Precio.** Las fichas dicen "Precio según configuración. Pídenos una propuesta sin compromiso." y nunca muestran precios ni `offers` en JSON-LD.
- **Catálogo.** Todo el catálogo está en el HTML estático (rastreable y visible sin JS). En escritorio, la fila de categorías se desplaza con flechas; en móvil, las tarjetas pasan a filas compactas para no convertir 53 equipos en un scroll interminable. El estado del filtro va en la URL y el canonical sigue siendo `/catalogo`.
- **Contacto.** El formulario grande está arriba (es el protagonista de la página) y la página termina con las dudas y un botón que vuelve a él, en lugar de repetir un segundo formulario idéntico. Sin mapa ni dirección.
- **Legales y 404.** Sin CTA final ni formulario, como pide el brief; la barra móvil y la cabecera llevan a `/contacto#asesoramiento`.
- **Guías.** Tres guías de 950 a 1.100 palabras, firmadas por Javier, con fecha de publicación del día en que se escribieron (26 de septiembre de 2026). Solo usan datos del catálogo y afirmaciones generales prudentes (física básica de la ecografía y de la tecarterapia, normativa MDR), sin promesas clínicas.
- **Hoja de leads.** Se mantienen las columnas de la landing "Contactar por" y "WhatsApp" (enlace directo al lead) además de las del brief. El script localiza las columnas por su título para no romper la hoja que ya usa la landing.
- **URLs.** Sin barra final y sin `.html` (`cleanUrls`); las fichas de ecografía y diatermia cuelgan de su pilar (`/ecografos/acclarix-ax8`), y el resto de `/equipos/[categoria]/[modelo]`. Se añaden redirecciones para `/equipos/ecografia` y `/equipos/diatermia`.
- **Rendimiento.** CSS en línea por página (sin peticiones de estilos), JS dividido (el formulario y los filtros se cargan solo cuando hacen falta), imágenes con dimensiones fijas y una integración de Astro que borra del build las imágenes originales que no se usan.
- **Imágenes OG.** Se generan en el build con satori y resvg (marca, titular con acento y producto o foto) y se guardan en caché en `node_modules/.cache/vg-og` para que los siguientes builds sean rápidos.
- **Mapas.** Los mapas de puntos (mundo, península y Europa) se generan con Natural Earth (paquete `world-atlas`) en `scripts/mapa/generar-mapa.mjs`.
- **Instagram.** No se publica el número de seguidores de @fisioruiz_ porque cambia con el tiempo; se enlaza el perfil.
