"""Fotos de fondo de sección (src/assets/fotos/fondo-*.webp): se guardan ya desenfocadas, así se ven suaves detrás
del texto y pesan poco. Desenfoque gaussiano ligero (radio 4,5 a 2000 px de ancho, ronda 9): la foto se reconoce
pero no compite con el contenido. Se guardan con calidad alta para que Astro no recomprima sobre bloques (las bandas
y los bloques se notan mucho en un desenfoque); la opacidad y el velo azul los pone el CSS (.sec--photo).

Los originales (2000 o 2400 px, ver docs/fotos-licencias.md) están en el historial de git:
  git show 4a096ef:src/assets/fotos/fondo-sala-rehabilitacion.webp > <dir>/fondo-sala-rehabilitacion.webp

Uso: python3 scripts/imagenes/fondos.py <dir_con_los_originales>
"""
import os
import sys

from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FOTOS = os.path.join(ROOT, 'src', 'assets', 'fotos')
ANCHO, RADIO = 2000, 4.5

for f in sorted(os.listdir(sys.argv[1])):
    if not (f.startswith('fondo-') and f.endswith('.webp')):
        continue
    im = Image.open(os.path.join(sys.argv[1], f)).convert('RGB')
    if im.width != ANCHO:
        im = im.resize((ANCHO, round(im.height * ANCHO / im.width)), Image.LANCZOS)
    im = im.filter(ImageFilter.GaussianBlur(RADIO))
    p = os.path.join(FOTOS, f)
    im.save(p, quality=92, method=6)
    print(f, im.size, os.path.getsize(p) // 1024, 'KB')
