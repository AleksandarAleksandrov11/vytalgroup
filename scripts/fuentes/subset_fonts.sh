#!/usr/bin/env bash
# Subconjunto de las fuentes autoalojadas (woff2) de la web.
#  · Geist (variable, sans): parte del archivo de la landing (subconjunto Latin-1) y se recorta a las
#    letras de Latin-1 (también las que un usuario puede escribir en el formulario: à, è, ã, ê...),
#    los signos que usa la web, € y las comillas tipográficas. Se regenera desde el geist.woff2 de la
#    landing (vsl-vytalgroup/assets/fonts/geist.woff2), que se pasa como GEIST_SRC.
#  · Instrument Serif cursiva: solo se usa en los acentos de los titulares, así que se recorta a los
#    caracteres del español, cifras, puntuación básica y la doble prima (″) de los tamaños de pantalla.
# Requisitos: pip install fonttools brotli   ·   npm install (para @fontsource/instrument-serif)
# Uso: bash scripts/fuentes/subset_fonts.sh   (desde la raíz del proyecto)
set -euo pipefail
US="U+0020-0022,U+0027-0029,U+002B-003B,U+003F,U+0041-005A,U+0061-007A,U+00A1,U+00BF,U+00C1,U+00C9,U+00CD,U+00D1,U+00D3,U+00DA,U+00DC,U+00E1,U+00E9,U+00ED,U+00F1,U+00F3,U+00FA,U+00FC,U+2019,U+2033"
pyftsubset node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2 \
  --unicodes="$US" \
  --layout-features="kern,liga,calt,ccmp,locl,mark,mkmk" \
  --no-hinting \
  --flavor=woff2 \
  --output-file=src/assets/fonts/instrument-serif-italic.woff2
GEIST_SRC="${GEIST_SRC:-../vsl-vytalgroup/assets/fonts/geist.woff2}"
GU="U+0020-007E,U+00A0-00A1,U+00A9-00AB,U+00B0-00B3,U+00B5,U+00B7,U+00BA-00BB,U+00BF,U+00C0-00FF,U+2018-2019,U+201C-201D,U+2022,U+2026,U+2032-2033,U+20AC"
pyftsubset "$GEIST_SRC" \
  --unicodes="$GU" \
  --layout-features="kern,liga,ccmp,locl,tnum" \
  --flavor=woff2 \
  --output-file=src/assets/fonts/geist.woff2
ls -la src/assets/fonts/
