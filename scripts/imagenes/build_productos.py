"""Genera las imágenes maestras de producto de la web (src/assets/productos y src/assets/fotos).

Astro las convierte después a AVIF y WebP en varios tamaños (componente <Picture>).

Fuentes:
  * Catálogo ADC Global Tech | VytalGroup 2026 (imágenes extraídas con `pdfimages -all -p`).
  * Imágenes ya tratadas de la landing (misma familia visual): los seis productos destacados,
    las seis categorías, la foto de Javier y el fondo difuminado del hero.

Tratamiento homogéneo (el mismo de la landing): cada equipo se separa del fondo blanco, se coloca
sobre el mismo lienzo blanco 4:3 (640 × 480) con el mismo tamaño visual, la misma línea de apoyo y
la misma sombra de contacto suave. Nunca se amplía por encima de la resolución original.

Uso:
  pip install pillow numpy opencv-python-headless
  pdfimages -all -p catalogo.pdf <dir_pdf>/i
  python3 scripts/imagenes/build_productos.py <dir_pdf> <dir_landing_img>
"""
import os
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

PDF, LANDING = sys.argv[1], sys.argv[2]
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'src', 'assets', 'productos')
FOTOS = os.path.join(ROOT, 'src', 'assets', 'fotos')
os.makedirs(OUT, exist_ok=True)
os.makedirs(FOTOS, exist_ok=True)
CW, CH = 640, 480

pdf = lambda n: os.path.join(PDF, n)


def from_white(im, cut=None, fade=(), crop=None):
    """Producto sobre fondo claro → RGBA con alfa según la distancia al blanco.
    `cut` lleva a blanco puro los píxeles más claros que ese valor (fondos grises o crema)."""
    im = im.convert('RGB')
    if crop:
        im = im.crop(crop)
    a = np.asarray(im).astype(np.int16)
    if cut:
        light = a.min(axis=2) > cut
        a[light] = 255
    dist = (255 - a.min(axis=2)).clip(0, 255)
    alpha = np.clip((dist - 4) * 12, 0, 255).astype(np.float32)
    h, w = alpha.shape
    ramp = 36
    for side in fade:
        g = np.linspace(0, 1, ramp)
        if side == 'bottom':
            alpha[h - ramp:, :] *= g[::-1, None]
        elif side == 'top':
            alpha[:ramp, :] *= g[:, None]
        elif side == 'left':
            alpha[:, :ramp] *= g[None, :]
        elif side == 'right':
            alpha[:, w - ramp:] *= g[None, ::-1]
    # Cierra huecos pequeños dentro del objeto (reflejos blancos) sin tocar el contorno
    m = (alpha > 40).astype(np.uint8) * 255
    filled = m.copy()
    ff = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(filled, ff, (0, 0), 255)
    holes = cv2.bitwise_not(filled)
    small = np.zeros_like(holes)
    n, lab, st, _ = cv2.connectedComponentsWithStats(holes)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] < (h * w) * 0.02:
            small[lab == i] = 255
    alpha = np.maximum(alpha, small.astype(np.float32))
    rgba = np.dstack([a.clip(0, 255).astype(np.uint8), alpha.astype(np.uint8)])
    ys, xs = np.where(alpha > 10)
    return Image.fromarray(rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1], 'RGBA')


def from_color(im, key, tol=70, crop=None):
    """Producto sobre un fondo de color liso (p. ej. amarillo): alfa por distancia a ese color."""
    im = im.convert('RGB')
    if crop:
        im = im.crop(crop)
    a = np.asarray(im).astype(np.float32)
    d = np.sqrt(((a - np.array(key, np.float32)) ** 2).sum(axis=2))
    alpha = np.clip((d - tol * 0.55) / (tol * 0.45) * 255, 0, 255)
    m = (alpha > 128).astype(np.uint8) * 255
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])
    keep = cv2.dilate((lab == big).astype(np.uint8) * 255, np.ones((5, 5), np.uint8))
    alpha = np.where(keep > 0, alpha, 0)
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.8)
    # Quita el tinte del fondo en los bordes semitransparentes
    rgb = a.copy()
    t = (alpha / 255.0)[..., None]
    rgb = np.where(t > 0.02, (rgb - (1 - t) * np.array(key)) / np.maximum(t, 0.02), rgb)
    rgba = np.dstack([rgb.clip(0, 255).astype(np.uint8), alpha.astype(np.uint8)])
    ys, xs = np.where(alpha > 10)
    return Image.fromarray(rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1], 'RGBA')


def stage(obj, box=(0.74, 0.76), area=0.30, base=0.88, shadow=True):
    """Coloca el objeto en el lienzo 4:3 con tamaño visual homogéneo y sombra de contacto
    (mismos parámetros que la landing). No amplía más de un 12 % sobre el original."""
    w, h = obj.size
    s = min(box[0] * CW / w, box[1] * CH / h, (area * CW * CH / (w * h)) ** 0.5, 1.12)
    obj = obj.resize((round(w * s), round(h * s)), Image.LANCZOS)
    canvas = Image.new('RGBA', (CW, CH), (255, 255, 255, 255))
    x = (CW - obj.width) // 2
    y = round(CH * base) - obj.height
    if shadow:
        sh = Image.new('L', (CW, CH), 0)
        d = ImageDraw.Draw(sh)
        sw, shh = obj.width * 0.86, max(10, CH * 0.05)
        cx, cy = CW / 2, y + obj.height - shh * 0.18
        d.ellipse((cx - sw / 2, cy - shh / 2, cx + sw / 2, cy + shh / 2), fill=70)
        sh = sh.filter(ImageFilter.GaussianBlur(11))
        dark = Image.new('RGBA', (CW, CH), (11, 25, 41, 0))
        dark.putalpha(sh)
        canvas = Image.alpha_composite(canvas, dark)
    canvas.alpha_composite(obj, (x, y))
    out = canvas.convert('RGB')
    # Enfoque suave: las fotos del catálogo vienen algo blandas
    return out.filter(ImageFilter.UnsharpMask(radius=0.8, percent=35, threshold=2))


def grade(im, amount=0.08):
    """Etalonaje de marca suave para fotos de contexto: sombras hacia marino, altas hacia turquesa."""
    im = im.convert('RGB')
    g = im.convert('L')
    navy, teal = (11, 25, 41), (214, 240, 240)
    duo = Image.merge('RGB', [g.point(lambda v, a=navy[i], b=teal[i]: round(a + (b - a) * v / 255)) for i in range(3)])
    return ImageEnhance.Contrast(Image.blend(im, duo, amount)).enhance(1.04)


def save_png(im, name, folder=OUT):
    path = os.path.join(folder, f'{name}.png')
    im.save(path, optimize=True)
    print(name, im.size)


def save_webp(im, name, folder=OUT, q=90):
    path = os.path.join(folder, f'{name}.webp')
    im.save(path, quality=q, method=6)
    print(name, im.size)


def src(n):
    return Image.open(pdf(n))


# ---------------------------------------------------------------- 1. Imágenes ya tratadas en la landing
# (mismo lienzo y sombra; se copian con nombres descriptivos en español)
LANDING_MAP = {
    'p-eco-wireless-640.webp': 'ecografo-inalambrico-eco-wireless-vytamed',
    'p-ax8-640.webp': 'ecografo-portatil-acclarix-ax8-edan',
    'p-lx9-640.webp': 'ecografo-de-carro-acclarix-lx9-edan',
    'p-vytamed-640.webp': 'diatermia-multifuncion-vytamed',
    'p-reatherm-640.webp': 'diatermia-reatherm-i-tech',
    'p-hrtek-640.webp': 'diatermia-hr-tek-eme',
    'cat-presoterapia-480.webp': 'presoterapia-beauty-press',
    'cat-ondas-480.webp': 'ondas-de-choque-shock-med-eme',
    'cat-magnetoterapia-480.webp': 'magnetoterapia-superinductiva-clinica-vytamed',
    'cat-laser-480.webp': 'laser-terapeutico-alta-potencia',
    'cat-electrolisis-480.webp': 'electrolisis-percutanea-physio-invasiva-easytech',
    'cat-camillas-480.webp': 'camilla-electrica-estandar',
}
for f, name in LANDING_MAP.items():
    im = Image.open(os.path.join(LANDING, f)).convert('RGB')
    save_webp(im, name, q=100)

# Foto de Javier y fondo difuminado del hero (tratados en la landing)
save_webp(Image.open(os.path.join(LANDING, 'javier-384.webp')).convert('RGB'), 'javier-ruiz-fisioterapeuta', FOTOS, q=100)
save_webp(Image.open(os.path.join(LANDING, 'hero-fondo-1600.webp')).convert('RGB'), 'clinica-fondo-hero', FOTOS, q=100)
save_webp(Image.open(os.path.join(LANDING, 'hero-fondo-m-600.webp')).convert('RGB'), 'clinica-fondo-hero-movil', FOTOS, q=100)

# ---------------------------------------------------------------- 2. Productos nuevos desde el catálogo
NEW = {
    # Ecografía EDAN Acclarix
    'ecografo-portatil-acclarix-ax2-edan': (from_white(src('i-020-123.jpg'), cut=246), dict(box=(0.78, 0.74), area=0.34)),
    'ecografo-portatil-acclarix-ax3-edan': (from_white(src('i-021-130.jpg'), cut=246), dict(box=(0.8, 0.74), area=0.34)),
    'ecografo-portatil-acclarix-ax9-edan': (from_white(src('i-023-144.jpg'), cut=246), dict(box=(0.78, 0.76), area=0.34)),
    'ecografo-de-carro-acclarix-lx3-edan': (from_white(src('i-025-158.jpg'), cut=246), dict(box=(0.6, 0.8))),
    'ecografo-de-carro-acclarix-lx25-edan': (from_white(src('i-018-109.jpg'), cut=246), dict(box=(0.6, 0.8))),
    'ecografo-de-carro-acclarix-lx85-edan': (from_white(src('i-019-116.jpg'), cut=246), dict(box=(0.6, 0.8))),
    'ecografo-de-carro-acclarix-gx9-edan': (from_white(src('i-024-151.jpg'), cut=246), dict(box=(0.6, 0.8))),
    # Diatermia
    'diatermia-reacare-i-tech': (from_white(src('i-027-172.jpg'), cut=244, fade=('bottom',)), dict(box=(0.84, 0.76), area=0.36, shadow=False)),
    # I-Tech
    'magnetoterapia-lamagneto-i-tech': (from_white(src('i-028-179.jpg'), cut=244), dict(box=(0.5, 0.78), area=0.26)),
    'ultrasonidos-ut2-i-tech': (from_white(src('i-029-186.jpg'), cut=244), dict(box=(0.84, 0.72), area=0.34)),
    'electroterapia-t-one-coach-i-tech': (from_white(src('i-030-193.jpg'), cut=244), dict(box=(0.5, 0.78), area=0.26)),
    'presoterapia-i-press-i-tech': (from_color(src('i-030-194.jpg'), (246, 196, 45), tol=90), dict(box=(0.7, 0.78), area=0.3)),
    # EME
    'laser-alta-potencia-crystal-yag-bipower-lux-eme': (from_white(src('i-034-221.jpg'), cut=244), dict(box=(0.84, 0.74), area=0.36)),
    'multiterapia-polyter-evo-eme': (from_white(src('i-035-228.jpg'), cut=244), dict(box=(0.5, 0.8), area=0.26)),
    'electroterapia-therapic-eme': (from_white(src('i-036-235.jpg'), cut=244), dict(box=(0.84, 0.74), area=0.36)),
    'ultrasonidos-ultrasonic-eme': (from_white(src('i-036-236.jpg'), cut=244), dict(box=(0.84, 0.74), area=0.36)),
    'terapia-combinada-combimed-eme': (from_white(src('i-037-243.jpg'), cut=244), dict(box=(0.84, 0.74), area=0.36)),
    'laser-baja-potencia-lasermed-2200-eme': (from_white(src('i-038-250.jpg'), cut=244), dict(box=(0.84, 0.74), area=0.36)),
    'magnetoterapia-magnetomed-eme': (from_white(src('i-038-251.jpg'), cut=244), dict(box=(0.84, 0.74), area=0.36)),
    'diatermia-microondas-radarmed-2500-cp-eme': (from_white(src('i-039-258.jpg'), cut=244), dict(box=(0.6, 0.82))),
    'laser-de-barrido-pr999-eme': (from_white(src('i-040-265.jpg'), cut=244), dict(box=(0.6, 0.82))),
    # ADC Global Tech
    'laser-ondas-de-choque-intelect': (from_white(src('i-010-052.jpg'), cut=232), dict(box=(0.84, 0.74), area=0.36)),
    'camilla-electrica-premium': (from_white(src('i-012-065.jpg'), cut=236, crop=(64, 74, 470, 300)), dict(box=(0.86, 0.72), area=0.36)),
    'camilla-hidraulica-pro': (from_white(src('i-012-066.jpg'), cut=236, crop=(64, 74, 470, 300)), dict(box=(0.86, 0.72), area=0.36)),
    'camilla-hidraulica-clinica': (from_white(src('i-013-073.jpg'), cut=236, crop=(64, 74, 470, 300)), dict(box=(0.86, 0.72), area=0.36)),
    'camilla-hidraulica-compacta': (from_white(src('i-013-074.jpg'), cut=236, crop=(64, 74, 470, 300)), dict(box=(0.86, 0.72), area=0.36)),
    'camilla-electrica-multiposicion': (from_white(src('i-014-081.jpg'), cut=236, crop=(64, 38, 430, 242)), dict(box=(0.86, 0.72), area=0.36)),
    # Estética médica
    'estetica-rigenera-3-pro-age': (from_white(src('i-043-285.jpg'), cut=244), dict(box=(0.5, 0.82), area=0.26)),
    'estetica-epil-evo-smart': (from_white(src('i-044-291.jpg'), cut=244), dict(box=(0.5, 0.82), area=0.26)),
    'estetica-reshape-plus': (from_white(src('i-045-297.jpg'), cut=244), dict(box=(0.8, 0.74), area=0.36)),
    'estetica-biorev-tech': (from_white(src('i-046-303.jpg'), cut=244), dict(box=(0.8, 0.74), area=0.34)),
    'estetica-echos': (from_white(src('i-047-309.jpg'), cut=244), dict(box=(0.8, 0.7), area=0.3)),
    'estetica-ageless': (from_white(src('i-049-321.jpg'), cut=244), dict(box=(0.56, 0.82), area=0.3)),
    # LiKAMED
    'ondas-de-choque-likawave-vario-3i-likamed': (from_white(src('i-051-335.jpg'), cut=244), dict(box=(0.6, 0.82))),
    'ondas-de-choque-likawave-vario-2i-likamed': (from_white(src('i-052-340.jpg'), cut=244), dict(box=(0.8, 0.74), area=0.34)),
}
for name, (obj, opt) in NEW.items():
    save_png(stage(obj, **opt), name)


# ---------------------------------------------------------------- 3. Superinductiva (foto en consulta): recorte con GrabCut
def superinductiva():
    """Equipo blanco sobre pared blanca: el contorno se dibuja a mano (cuerpo, asa, pantalla, brazo,
    cabezal y cable) y GrabCut solo ajusta el borde dentro de una banda estrecha alrededor."""
    img = cv2.cvtColor(np.asarray(src('i-005-017.jpg').convert('RGB')), cv2.COLOR_RGB2BGR)
    h, w = img.shape[:2]
    shape = np.zeros((h, w), np.uint8)
    cv2.rectangle(shape, (289, 306), (455, 684), 255, -1)                      # cuerpo
    cv2.rectangle(shape, (268, 382), (480, 424), 255, -1)                      # asa
    for pts, t in (([(104, 146), (146, 146), (236, 238), (362, 270), (366, 312)], 17),  # brazo
                   ([(166, 212), (214, 214), (246, 250), (268, 312), (286, 352)], 13),  # cable
                   ([(104, 150), (104, 214)], 26)):                             # soporte del cabezal
        cv2.polylines(shape, [np.array(pts, np.int32)], False, 255, t)
    cv2.ellipse(shape, (114, 256), (52, 14), 0, 0, 360, 255, -1)              # cabezal
    cv2.ellipse(shape, (116, 244), (34, 20), 0, 180, 360, 255, -1)
    mask = np.full((h, w), cv2.GC_BGD, np.uint8)
    mask[cv2.dilate(shape, np.ones((11, 11), np.uint8)) > 0] = cv2.GC_PR_BGD
    mask[shape > 0] = cv2.GC_PR_FGD
    mask[cv2.erode(shape, np.ones((9, 9), np.uint8)) > 0] = cv2.GC_FGD
    bgd, fgd = np.zeros((1, 65)), np.zeros((1, 65))
    cv2.grabCut(img, mask, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
    m = np.where((mask == 1) | (mask == 3), 255, 0).astype(np.uint8)
    # Nada fuera del contorno dibujado (suelo, pared y puertas quedan fuera)
    m = cv2.bitwise_and(m, cv2.dilate(shape, np.ones((3, 3), np.uint8)))
    # El cuerpo es blanco neutro: fuera los tonos beis del suelo que asoman por su derecha
    b, g, r = [img[..., i].astype(int) for i in range(3)]
    beige = (r - b > 10) & (np.arange(w)[None, :] > 400) & (np.arange(h)[:, None] > 424)
    m[beige] = 0
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])
    m = np.where(lab == big, 255, 0).astype(np.uint8)
    alpha = cv2.GaussianBlur(m, (0, 0), 0.9)
    rgba = cv2.cvtColor(img, cv2.COLOR_BGR2RGBA)
    # Igualar el blanco del cuerpo al del resto de fotos (la de consulta es algo gris)
    rgb = rgba[..., :3].astype(np.float32) * 1.08
    rgba[..., :3] = rgb.clip(0, 255).astype(np.uint8)
    rgba[..., 3] = alpha
    ys, xs = np.where(alpha > 8)
    return Image.fromarray(rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1])


save_png(stage(superinductiva(), box=(0.62, 0.84), area=0.3), 'magnetoterapia-superinductiva-vytamed')


# ---------------------------------------------------------------- 4. Fotos de contexto (galería), con etalonaje suave
def photo(name, im, crop=None, size=(960, 720)):
    im = im.convert('RGB')
    if crop:
        im = im.crop(crop)
    # Encaje 4:3 sin ampliar: se recorta al centro y se reduce solo si sobra resolución
    tw, th = size
    r = min(im.width / tw, im.height / th)
    if r < 1:
        tw, th = round(tw * r), round(th * r)
    scale = max(tw / im.width, th / im.height)
    im2 = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    x = (im2.width - tw) // 2
    y = (im2.height - th) // 2
    out = grade(im2.crop((x, y, x + tw, y + th)))
    save_webp(out, name, FOTOS, q=92)


photo('diatermia-multifuncion-vytamed-en-consulta', src('i-004-016.jpg'))
photo('diatermia-multifuncion-vytamed-pantalla', src('i-008-038.jpg'))
photo('eco-wireless-vytamed-estuche', src('i-006-024.jpg'))
photo('superinductiva-vytamed-en-consulta', src('i-005-017.jpg'), crop=(0, 100, 540, 505))
photo('superinductiva-clinica-vytamed-en-consulta', src('i-007-031.jpg'), crop=(190, 0, 554, 369))

# Portada e interiores del catálogo para la maqueta 3D (renderizados con pdftoppm -r 110)
for n, name in ((1, 'catalogo-portada'), (22, 'catalogo-interior-ecografia'), (8, 'catalogo-interior-diatermia')):
    p = os.path.join(PDF, '..', 'render', f'r-{n:02d}.png')
    if os.path.exists(p):
        im = Image.open(p).convert('RGB')
        im = im.resize((560, round(im.height * 560 / im.width)), Image.LANCZOS)
        save_webp(im, name, FOTOS, q=86)
