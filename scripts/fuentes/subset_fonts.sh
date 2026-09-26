#!/usr/bin/env bash
# Subconjunto de las fuentes autoalojadas (woff2) de la web.
#  · Geist (variable, sans): es el mismo archivo de la landing (src/assets/fonts/geist.woff2), ya con
#    subconjunto latino. No hace falta regenerarlo.
#  · Instrument Serif cursiva: solo se usa en los acentos de los titulares, así que se recorta a los
#    caracteres del español, cifras, puntuación básica y la doble prima (″) de los tamaños de pantalla.
# Requisitos: pip install fonttools brotli   ·   npm install (para @fontsource/instrument-serif)
# Uso: bash scripts/fuentes/subset_fonts.sh   (desde la raíz del proyecto)
set -euo pipefail
US="U+0020-0022,U+0027-0029,U+002B-003B,U+003F,U+0041-005A,U+0061-007A,U+00A1,U+00BF,U+00C1,U+00C9,U+00CD,U+00D1,U+00D3,U+00DA,U+00DC,U+00E1,U+00E9,U+00ED,U+00F1,U+00F3,U+00FA,U+00FC,U+2019,U+2033"
pyftsubset node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2 \
  --unicodes="$US" \
  --layout-features="kern,liga,calt,ccmp,locl,mark,mkmk" \
  --flavor=woff2 \
  --output-file=src/assets/fonts/instrument-serif-italic.woff2
ls -la src/assets/fonts/
