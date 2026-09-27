"""Mide cada equipo en su lienzo transparente (src/assets/productos) y guarda su caja en
src/assets/productos/encuadre.json: ancho (w), alto (h), izquierda (x) y arriba (y), en fracción del
lienzo. El CSS lo usa para dar a cada equipo una sombra de contacto de su mismo ancho (--sw).

Uso: python3 scripts/imagenes/encuadre.py
"""
import json
import os

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DIR = os.path.join(ROOT, 'src', 'assets', 'productos')
out = {}
for f in sorted(os.listdir(DIR)):
    if not f.endswith(('.webp', '.png')):
        continue
    im = Image.open(os.path.join(DIR, f))
    if im.mode != 'RGBA':
        continue
    a = np.asarray(im)[..., 3]
    ys, xs = np.where(a > 24)
    if not len(xs):
        continue
    W, H = im.size
    out[f.rsplit('.', 1)[0]] = {'w': round((xs.max() - xs.min() + 1) / W, 3), 'h': round((ys.max() - ys.min() + 1) / H, 3), 'x': round(xs.min() / W, 3), 'y': round(ys.min() / H, 3)}
with open(os.path.join(DIR, 'encuadre.json'), 'w', encoding='utf8') as fh:
    json.dump(out, fh, indent=1, ensure_ascii=False)
    fh.write('\n')
print(len(out), 'equipos medidos')
