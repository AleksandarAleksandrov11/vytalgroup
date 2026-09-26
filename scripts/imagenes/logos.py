"""Logotipos de las marcas en SVG de un solo color (src/assets/marcas), para la cinta de marcas.

Fuentes (webs oficiales de cada marca, descargadas en septiembre de 2026):
  * EDAN: https://www.edan.com/dist/images/logo2.png
  * I-Tech Medical Division: https://itechmedicaldivision.com/wp-content/uploads/i-tech_new_white.png
  * EME: https://eme-srl.com/wp-content/uploads/2024/11/eme-logo.png
  * LiKAMED: https://likamed.de/wp-content/uploads/2025/01/LiKAMED-logo-rgb.png
  * EasyTech: logotipo de su página de empresa en LinkedIn (easytechitalia); su web no responde desde aquí.
VytaMeD no tiene logotipo publicado: en la cinta va su nombre en texto.

Cada logo se convierte en silueta (alfa o luminancia), se amplía (×4, hasta 1400 px de ancho), se vectoriza con potrace y se
guarda con fill="currentColor" y el viewBox ajustado al dibujo.

Uso: apt install potrace; python3 scripts/imagenes/logos.py <dir_con_los_png>
"""
import os
import re
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image

SRC = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'src', 'assets', 'marcas')
os.makedirs(OUT, exist_ok=True)


def silueta(path, modo):
    im = Image.open(os.path.join(SRC, path)).convert('RGBA')
    a = np.asarray(im).astype(np.float32)
    if modo == 'alfa':
        m = a[..., 3] / 255.
    elif modo == 'claro':           # letras claras sobre fondo oscuro (LinkedIn)
        lum = a[..., :3].mean(axis=2) / 255.
        m = np.clip((lum - .35) / .4, 0, 1)
    return m


def vectorizar(nombre, m, recorte=None):
    if recorte:
        x0, y0, x1, y1 = recorte
        m = m[y0:y1, x0:x1]
    ys, xs = np.where(m > .3)
    m = m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    k = min(4, 1400 / m.shape[1])
    im = Image.fromarray((m * 255).astype(np.uint8)).resize((round(m.shape[1] * k), round(m.shape[0] * k)), Image.LANCZOS)
    bw = Image.fromarray(np.where(np.asarray(im) > 127, 0, 255).astype(np.uint8)).convert('1')
    with tempfile.TemporaryDirectory() as d:
        pbm = os.path.join(d, 'l.pbm')
        svg = os.path.join(d, 'l.svg')
        bw.save(pbm)
        subprocess.run(['potrace', pbm, '-s', '-o', svg, '--turdsize', '8', '--alphamax', '1', '--opttolerance', '0.3', '--flat'], check=True)
        s = open(svg, encoding='utf8').read()
    w, h = bw.size
    paths = ''.join(re.findall(r'<path[^>]*/>', s))
    g = re.search(r'<g transform="([^"]+)"', s).group(1)
    out = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}"><g transform="{g}" fill="currentColor">{paths}</g></svg>\n'
    with open(os.path.join(OUT, f'{nombre}.svg'), 'w', encoding='utf8') as fh:
        fh.write(out)
    print(nombre, w, h, len(out) // 1024, 'KB')


vectorizar('edan', silueta('edan-logo2.png', 'alfa'))
vectorizar('i-tech', silueta('itech__i-tech_new_white.png', 'alfa'))
vectorizar('eme', silueta('eme__eme-logo.png', 'alfa'))
vectorizar('likamed', silueta('likamed__LiKAMED-logo-rgb.png', 'alfa'))
vectorizar('easytech', silueta('easytech__linkedin-200.png', 'claro'), recorte=(20, 40, 180, 160))
