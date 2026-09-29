# Sistema de diseño VytalGroup

Extraído del CSS de la landing publicada (https://vsl-vytalgroup.vercel.app/, archivos `assets/css/base.css` y `assets/css/landing.css` de su repositorio) y ampliado para la web multipágina. Es la fuente de verdad: todos los valores viven como variables CSS en `src/styles/tokens.css`.

Capturas de referencia de la landing: `docs/referencia-landing/landing-375.webp` y `docs/referencia-landing/landing-1440.webp`.

## 1. Color

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#FAFBFC` | Fondo general (blanco roto) |
| `--card` | `#FFFFFF` | Tarjetas, formulario, franja de garantías |
| `--soft` | `#F1F4F7` | Fondos suaves (segmentado, buscadores, hover) |
| `--mist` | `#EEF2F5` | Sección de categorías con rejilla fina |
| `--ink` | `#0B1929` | Texto principal y secciones oscuras (azul marino) |
| `--ink-2` | `#3E4C5C` | Texto secundario |
| `--ink-3` | `#5E6C7B` | Texto terciario, etiquetas |
| `--line` | `rgba(11, 25, 41, .09)` | Bordes finos |
| `--line-2` | `rgba(11, 25, 41, .16)` | Bordes de controles |
| `--teal` | `#48A0A8` | Acento de marca (el turquesa del logo): CTA, indicadores, progreso |
| `--teal-ink` | `#24707A` | Turquesa oscuro para iconos y texto sobre claro |
| `--teal-soft` | `rgba(72, 160, 168, .12)` | Fondos de iconos |
| `--teal-light` | `#8FDCDC` | Acento en cursiva sobre fondo marino |
| `--teal-on-dark` | `#7FD3D6` | Títulos e iconos del pie sobre marino |
| `--logo-dark-b` | `#5CC8C8` | "Group" del logo sobre marino |
| `--navy` | `#0B1929` | Secciones oscuras |
| `--navy-2` | `#13263A` | Superficies sobre marino |
| `--vs-a` / `--vs-b` | `#E3F2F2` / `#D2EBEB` | Degradado turquesa claro del comparador |
| `--error` | `#B42318` | Errores del formulario |

Nota: el brief daba `#00C9A7` como turquesa "a confirmar". El CSS de la landing usa `#48A0A8` (el del logo), así que ese es el valor de la web.

Contraste: texto `--ink` sobre `--teal` 5,7:1; `--ink-2` sobre `--bg` 9,2:1; `--ink-3` sobre `--bg` 5,3:1; blanco al 78 % sobre marino por encima de 10:1. Todo AA.

## 2. Tipografía

- **Geist** (variable, pesos 400 a 600), subset latino, woff2 autoalojado. Titulares y texto.
- **Instrument Serif** cursiva, subset latino (solo letras y puntuación básica), woff2 autoalojado. Solo para la palabra o frase de acento al final de cada H1 y H2.
- Respaldos con métricas ajustadas (`size-adjust`, `ascent-override`...) para que el cambio de fuente no mueva nada (CLS 0).

| Estilo | Tamaño | Interlineado | Tracking | Peso |
|---|---|---|---|---|
| H1 (`.h1`) | `clamp(2.625rem, 1.9rem + 3.6vw, 5.5rem)` | 1.02 | -0.04em | 560 |
| H2 (`.h2`) | `clamp(2.125rem, 1.6rem + 2.4vw, 3.75rem)` | 1.04 | -0.035em | 560 |
| H3 (`.h3`) | `clamp(1.375rem, 1.2rem + .7vw, 1.75rem)` | 1.15 | -0.025em | 560 |
| Acento (`em` en H1/H2) | 1.08em, Instrument Serif cursiva | 0.9 | -0.012em | 400 |
| Entradilla (`.lead`) | `clamp(1.0625rem, 1rem + .45vw, 1.375rem)` | 1.45 | -0.01em | 400 |
| Texto | 1rem | 1.55 | normal | 400 |
| Pequeño | .875 a .9375rem | 1.45 | normal | 400 a 500 |
| Etiqueta mayúsculas | .75 a .8125rem | 1.3 | .1 a .12em | 560 a 600 |

Patrón de marca: todos los H1 y H2 terminan con una palabra o frase en cursiva: "Equipos médicos de alta calidad. *Sin letra pequeña.*"

## 3. Espacio, anchuras y radios

- Margen lateral `--g`: 16 px (móvil), 24 px (desde 640), 32 px (desde 1024).
- Altura de cabecera `--hd`: 64 px, 72 px desde 1024.
- Ritmo vertical de sección `--sec`: `clamp(50px, 3rem + 6vw - 30px, 122px)` (30 px menos arriba y abajo que la landing: 10 px en la ronda 2 y 20 px más en la ronda 4).
- Escala de espaciado (múltiplos de 4): 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96.
- Anchura máxima de contenido: 1200 px + márgenes (`.wrap`). Estrecha: 760 px (FAQ, legales). Formulario: 600 px. Lectura de guías: 68ch.
- Radios: píldora 999 px (botones, segmentado, chips), 28 px (tarjeta del formulario), 24 px (tarjetas de producto y paneles), 20 px (categorías, aviso de cookies), 16 px (imágenes dentro de tarjetas, campos, opciones), 12 px y 8 px (detalles).

## 4. Sombras

- `--shadow`: `0 1px 2px rgba(11,25,41,.04), 0 12px 32px -18px rgba(11,25,41,.16)` (tarjetas en reposo).
- `--shadow-hover`: `0 1px 2px rgba(11,25,41,.04), 0 28px 48px -24px rgba(11,25,41,.24)`.
- `--shadow-cta`: `inset 0 0 0 1px rgba(11,25,41,.06), 0 1px 2px rgba(11,25,41,.08), 0 8px 20px -10px rgba(72,160,168,.75)`.
- `--shadow-pop`: `0 0 0 1px var(--line), 0 24px 60px -20px rgba(11,25,41,.35)` (desplegables).
- `--shadow-form`: `inset 0 0 0 1px var(--line), 0 30px 70px -40px rgba(11,25,41,.3)`.

## 5. Movimiento

- Easing: `--ease: cubic-bezier(.22, 1, .36, 1)`.
- Duraciones: `--t-micro: 200ms` (microinteracciones, entre 150 y 250), `--t-in: 600ms` y `--t-in-long: 700ms` (entradas, entre 400 y 700).
- Solo `transform`, `opacity` y variables CSS. Scroll y cursor con `requestAnimationFrame` y listeners pasivos.
- `prefers-reduced-motion`: sin parallax, sticky animado, marquesina, ni inclinación; solo fundidos.

## 6. Componentes

| Componente | Descripción |
|---|---|
| Botón | Píldora, 48 px (sm 44, lg 56). Primario turquesa con texto marino, brillo que recorre y hundimiento al pulsar; línea (borde fino que se rellena de marino al pasar); oscuro (marino con icono turquesa, para descargas). Magnetismo leve en el CTA principal en escritorio. |
| Enlace | Subrayado de 1 px desplazado 5 px, que se intensifica al pasar. |
| Cabecera | Fija y con fondo blanco sólido en todas las páginas y anchos (también en móvil, sin ocultarse). Animaciones circulares: punto turquesa que viaja bajo el enlace activo o señalado, relleno que crece en círculo desde el cursor y desplegable de Equipos que se abre en círculo, con miniaturas redondas. En móvil, hamburguesa de 3 líneas en un círculo que se convierte en aspa y panel marino con brillos de color que se revela en círculo desde el botón: enlaces grandes numerados en cursiva, desplegables propios (Ecógrafos, Diatermias y Equipos) y contacto directo. |
| Tarjeta de producto | La misma en toda la web: blanca, radio 24, escenario 4:3 con el equipo sin fondo, marca y categoría, nombre (2 líneas máx.), línea (3 máx.), 2 datos clave y "Ver ficha". En rejillas y carruseles las filas se alinean con subgrid. Inclinación 3D hacia el cursor, halo de luz, el equipo flota y su sombra se recoge. |
| Tarjeta de categoría | Escenario 4:3 y nombre; al pasar, una línea de descripción. Inclinación 3D. |
| Hero del inicio | Estudio claro: pared blanca que se funde con un suelo gris perla, titular centrado con el acento en `--teal-ink`, apoyo y botones centrados, y tres equipos sobre el mismo suelo (el central más grande y delante; los laterales al 66 %, algo más altos y solapados detrás). Sombra de contacto por equipo, halo turquesa muy tenue detrás del grupo, entrada con transform (el central sin opacidad, es el LCP) y paralaje de hasta 9 px con el ratón. Sin rejillas, reflejos ni animaciones en bucle. |
| Cabecera de página (`PageHero`) | La misma en todas las páginas internas: fondo marino, migas, H1 con acento, apoyo y acciones a la izquierda y un visual 4:3 a la derecha (foto a sangre, equipo sobre escenario o retrato completo). Sin antetítulos ni animaciones de radar. |
| Fondos de sección | Dos secciones seguidas nunca comparten fondo: `sec--white`, `sec--mist`, `sec--grid` (rejilla fina), `sec--dots` (puntos), `sec--teal` (turquesa suave), `sec--dark` (marino con brillo) y `sec--photo` (foto a sangre con capa marina; la imagen va en `.sec__photo`). Con `on-dark`, títulos, textos y enlaces pasan a blanco. |
| Rejillas de tarjetas | Las tarjetas de una misma fila alinean sus partes con subgrid (producto, características de la ficha, razones, "Cómo elegir", "Quiénes estamos" y "Nuestra forma de trabajar"), así títulos de una o dos líneas no descuadran textos ni botones. Una última fila incompleta va centrada (3, 5 o 7 tarjetas; y la tarjeta sola en rejillas de 2 columnas). |
| Datos con unidades | Número y unidad nunca se separan ("2 h", "9,25 kg", "12 MHz"): `unidades()` de `src/lib/texto.ts` en tarjetas, fichas y comparativas. |
| Escenario de producto (`.stage`) | Las fotos de equipo no tienen fondo: degradado radial suave y sombra de contacto del ancho real del equipo (`--sw`, de `encuadre.json`) en la línea del 88 %. |
| Control segmentado | Píldora gris con indicador turquesa que se desliza. |
| Acordeón | Filas con borde inferior, icono "+" en círculo que gira a "×" y se rellena de marino. |
| Comparador | Dos columnas, "Lo habitual" y "Con VytalGroup": lo habitual se tacha solo al aparecer y lo nuestro lleva su check que se dibuja. Sin flechas. |
| Formulario | Tarjeta blanca radio 28, barra de progreso turquesa de 3 px, una pregunta por pantalla, opciones de 60 px con radio personalizado, desplegables propios (hoja inferior en móvil), consentimiento con casilla propia. |
| Cookies | Aviso flotante con tres botones de igual peso y panel en diálogo con interruptores propios. |
| Pie | Marino, logo, claim con acento, columnas con título pequeño en mayúsculas turquesa, y "VytalGroup" a todo el ancho con las letras que suben una a una. |
| Cinta de confianza | Marquesina infinita con icono en círculo turquesa suave, se pausa al pasar el ratón. |
| Migas de pan | Texto pequeño `--ink-3`, separador "/" y página actual en `--ink`. |
| Tabla de especificaciones | Filas con borde fino, clave en `--ink-3` y valor en `--ink`; "Ver todas" si es larga. |

## 7. Iconos

Trazo de 1,7 px, extremos redondeados, 24 × 24, heredan `currentColor`. Mismo sprite que la landing (flecha, descarga, escudo, sello, globo, personas, llave, libro, check, cierre, búsqueda, teléfono, correo, Instagram, WhatsApp) más los nuevos de la web.
