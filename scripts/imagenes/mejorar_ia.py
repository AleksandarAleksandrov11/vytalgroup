"""Ronda 2: mejora con IA de todas las fotos de la web y recorte del fondo de todos los equipos.

Producto (src/assets/productos, WebP con transparencia):
  1. Escalado ×4 con Real-ESRGAN x4plus sobre el original de mayor calidad disponible
     (catálogo ADC Global Tech | VytalGroup 2026, web oficial de EDAN o la landing, cuyas fotos salen de
     originales de más resolución). Al reducir, se mezcla un 25 % del original ampliado sin IA para que
     textos, pantallas y texturas no cambien.
  2. Máscara del equipo con BiRefNet (rembg, modelo birefnet-general). El color de los bordes
     semitransparentes se recalcula con pymatting para que no quede halo del fondo original.
  3. El equipo recortado se coloca en un lienzo transparente 4:3 de 1280 × 960 con el mismo encuadre
     para todos (caja, área visual y línea de apoyo comunes, los de la ronda 1). Siempre se reduce
     desde el ×4 (nunca se publica el ×4 tal cual), así el resultado gana nitidez sin inventar detalle.
  La sombra de contacto ya no va en la imagen: la pone el CSS, igual para todos los equipos.

Fotos (src/assets/fotos): realesr-general-x4v3 mezclado con su versión de reducción de ruido
(más conservador, no inventa texturas), a como mucho 2,5 veces el original; 3 veces en las que se ven
más grandes de lo que daba su original (ronda 9: la magnetoterapia Clínica de la cabecera de Equipos y
Javier), para que las pantallas retina y los móviles tengan los píxeles que piden. A Javier, además, se
le alisa la pared del fondo (el original de 384 px trae ondas de compresión alrededor de la cabeza) y se
recorta con birefnet-portrait.

Uso:
  pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
  pip install spandrel "rembg[cpu]" pymatting pillow numpy opencv-python-headless
  Pesos de Real-ESRGAN en <modelos>: RealESRGAN_x4plus.pth, realesr-general-x4v3.pth y
  realesr-general-wdn-x4v3.pth (github.com/xinntao/Real-ESRGAN/releases). BiRefNet lo descarga rembg.
  pdfimages -all -p catalogo.pdf <dir_pdf>/i
  python3 scripts/imagenes/mejorar_ia.py <dir_pdf> <dir_landing_img> <dir_edan> <modelos> [nombre ...]
"""
import os
import sys

import cv2
import numpy as np
import torch
from PIL import Image, ImageEnhance, ImageFilter
from spandrel import ModelLoader

PDF, LANDING, EDAN, MODELOS = sys.argv[1:5]
SOLO = set(sys.argv[5:])
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'src', 'assets', 'productos')
FOTOS = os.path.join(ROOT, 'src', 'assets', 'fotos')
CACHE = os.environ.get('IA_CACHE', os.path.join(ROOT, 'node_modules', '.cache', 'vg-ia'))
os.makedirs(CACHE, exist_ok=True)
CW, CH = 1280, 960
torch.set_num_threads(os.cpu_count() or 4)


# ---------------------------------------------------------------- modelos
_modelos = {}


def modelo(nombre, ruido=None):
    """Real-ESRGAN por nombre. `ruido` (0 a 1) mezcla general-x4v3 con su variante de reducción de ruido."""
    clave = (nombre, ruido)
    if clave not in _modelos:
        loader = ModelLoader()
        if ruido is None:
            m = loader.load_from_file(os.path.join(MODELOS, nombre))
        else:
            a = torch.load(os.path.join(MODELOS, 'realesr-general-x4v3.pth'), map_location='cpu')
            b = torch.load(os.path.join(MODELOS, 'realesr-general-wdn-x4v3.pth'), map_location='cpu')
            a, b = a.get('params', a), b.get('params', b)
            m = loader.load_from_state_dict({k: (1 - ruido) * a[k] + ruido * b[k] for k in a})
        m.model.eval()
        _modelos[clave] = m
    return _modelos[clave]


def escalar(im, m, tile=256, pad=16):
    """×4 por teselas (memoria acotada en CPU)."""
    x = torch.from_numpy(np.asarray(im.convert('RGB')).astype(np.float32) / 255.).permute(2, 0, 1)[None]
    _, _, h, w = x.shape
    s = m.scale
    out = torch.zeros(1, 3, h * s, w * s)
    with torch.inference_mode():
        for y0 in range(0, h, tile):
            for x0 in range(0, w, tile):
                y1, x1 = min(y0 + tile, h), min(x0 + tile, w)
                ya, xa, yb, xb = max(y0 - pad, 0), max(x0 - pad, 0), min(y1 + pad, h), min(x1 + pad, w)
                o = m.model(x[:, :, ya:yb, xa:xb])
                out[:, :, y0 * s:y1 * s, x0 * s:x1 * s] = o[:, :, (y0 - ya) * s:(y1 - ya) * s, (x0 - xa) * s:(x1 - xa) * s]
    return Image.fromarray((out[0].clamp(0, 1).permute(1, 2, 0).numpy() * 255 + .5).astype(np.uint8))


_sesiones = {}


def mascara(im, modelo_rembg='birefnet-general'):
    """BiRefNet trabaja a 1024 × 1024 y necesita unos 8 GB: sin la arena de memoria de ONNX Runtime
    (que no la devuelve entre inferencias) el consumo se mantiene estable."""
    import onnxruntime as ort
    from rembg import new_session, remove
    if modelo_rembg not in _sesiones:
        so = ort.SessionOptions()
        so.enable_cpu_mem_arena = False
        so.enable_mem_pattern = False
        _sesiones[modelo_rembg] = new_session(modelo_rembg, sess_opts=so)
    return remove(im.convert('RGB'), session=_sesiones[modelo_rembg], only_mask=True)


def cache(nombre, fn):
    p = os.path.join(CACHE, nombre)
    if os.path.exists(p):
        return Image.open(p)
    im = fn()
    im.save(p)
    return im


# ---------------------------------------------------------------- fuentes
def pdf(n, crop=None):
    im = Image.open(os.path.join(PDF, n)).convert('RGB')
    return im.crop(crop) if crop else im


def landing(n, crop=None):
    im = Image.open(os.path.join(LANDING, n))
    if im.mode == 'RGBA':
        bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
        bg.alpha_composite(im)
        im = bg
    im = im.convert('RGB')
    return im.crop(crop) if crop else im


def landing_rgba(n):
    """Recorte de la landing con su propio canal alfa (para usarlo como máscara en vez de BiRefNet)."""
    return Image.open(os.path.join(LANDING, n)).convert('RGBA')


def edan(n, crop=None):
    im = Image.open(os.path.join(EDAN, n)).convert('RGB')
    return im.crop(crop) if crop else im


# ---------------------------------------------------------------- producto
def limpiar_mascara(m, umbral=0.5):
    """Borde firme pero suave (BiRefNet devuelve la máscara algo difusa al reescalarla) y sin motas sueltas."""
    a = np.asarray(m.convert('L')).astype(np.float32) / 255.
    lo, hi = umbral - 0.35, umbral + 0.35
    a = np.clip((a - lo) / (hi - lo), 0, 1)
    b = (a > 0.5).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(b)
    if n > 2:
        grande = st[1:, cv2.CC_STAT_AREA].max()
        for i in range(1, n):
            if st[i, cv2.CC_STAT_AREA] < grande * 0.002:
                a[lab == i] = 0
    return a


def producto(nombre, fuente, box=(0.74, 0.76), area=0.30, base=0.88, fade=(), neutro=False, alfa=False):
    """Original → (×4 si hace falta) → máscara BiRefNet → equipo en el lienzo común transparente.
    El tamaño final se decide con el encuadre común (caja, área y línea de apoyo, los de la ronda 1):
    si el original ya tiene resolución de sobra (banners de EDAN) no se escala; si no, Real-ESRGAN ×4 y
    se reduce hasta el tamaño final. Los bordes se limpian con pymatting ya a tamaño final.
    `neutro`: equipo blanco fotografiado con dominante de color (fondo cian): se neutraliza con la
    mediana de sus zonas claras, como en la landing.
    `alfa`: la fuente ya es un recorte limpio con transparencia (la Diatermia Multifunción de la
    landing): su alfa hace de máscara y la sombra horneada (alfa menor de 0,36) se descarta."""
    from pymatting import estimate_foreground_ml
    src = fuente()
    if alfa:
        a_src = np.asarray(src)[..., 3].astype(np.float32) / 255.
        a_src = np.clip((a_src - 0.36) / 0.64, 0, 1)
        blanco = Image.new('RGBA', src.size, (255, 255, 255, 255))
        blanco.alpha_composite(src)
        src = blanco.convert('RGB')
        img = cache(f'{nombre}-x4.png', lambda: escalar(src, modelo('RealESRGAN_x4plus.pth')))
        a = np.asarray(Image.fromarray((a_src * 255).astype(np.uint8)).resize(img.size, Image.LANCZOS)).astype(np.float32) / 255.
        ys, xs = np.where(a > 0.03)
        w0, h0 = (xs.max() - xs.min() + 1) / 4, (ys.max() - ys.min() + 1) / 4
        f = min(box[0] * CW / w0, box[1] * CH / h0, (area * CW * CH / (w0 * h0)) ** 0.5, 4.0)
        return _componer(nombre, src, img, a, 4, f, base, fade, neutro)

    def encuadre(a):
        ys, xs = np.where(a > 0.03)
        w0, h0 = xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
        return min(box[0] * CW / w0, box[1] * CH / h0, (area * CW * CH / (w0 * h0)) ** 0.5)

    # Original grande (banners de EDAN): máscara directa y, si basta con ampliar un 30 % como mucho, sin escalar
    if max(src.size) >= 900:
        a = limpiar_mascara(cache(f'{nombre}-mask.png', lambda: mascara(src)))
        f = encuadre(a)
        img, k = src, 1
        if f > 1.3:
            img, k = cache(f'{nombre}-x4.png', lambda: escalar(src, modelo('RealESRGAN_x4plus.pth'))), 4
            a = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).resize(img.size, Image.LANCZOS)).astype(np.float32) / 255.
    else:
        img, k = cache(f'{nombre}-x4.png', lambda: escalar(src, modelo('RealESRGAN_x4plus.pth'))), 4
        a = limpiar_mascara(cache(f'{nombre}-mask.png', lambda: mascara(img)))
        f = encuadre(a) * 4
    if f > 4:
        print(f'  aviso: {nombre} necesitaría ×{f:.2f}; se queda en ×4 (algo más pequeño)')
        f = 4.0
    return _componer(nombre, src, img, a, k, f, base, fade, neutro)


def _componer(nombre, src, img, a, k, f, base, fade, neutro):
    """Recorta a la caja del equipo, reduce al tamaño final (con el 25 % sin IA si hubo ×4), limpia
    los bordes con pymatting y lo apoya en el lienzo común."""
    from pymatting import estimate_foreground_ml
    h, w = a.shape
    ramp = 36 * k
    for side in fade:
        g = np.linspace(0, 1, ramp)
        if side == 'bottom':
            a[h - ramp:, :] *= g[::-1, None]
        elif side == 'left':
            a[:, :ramp] *= g[None, :]
        elif side == 'right':
            a[:, w - ramp:] *= g[None, ::-1]
    ys, xs = np.where(a > 0.03)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    rgb = Image.fromarray(np.asarray(img.convert('RGB'))[y0:y1, x0:x1])
    al = Image.fromarray((a[y0:y1, x0:x1] * 255 + .5).astype(np.uint8))
    tw, th = round((x1 - x0) * f / k), round((y1 - y0) * f / k)
    rgb = rgb.resize((tw, th), Image.LANCZOS)
    if k == 4:
        # 25 % del original ampliado sin IA: conserva textos y texturas tal cual (nada inventado)
        fiel = src.crop((x0 / 4, y0 / 4, x1 / 4, y1 / 4)).resize((tw, th), Image.LANCZOS)
        rgb = Image.blend(rgb, fiel, 0.25)
    rgb = np.asarray(rgb).astype(np.float64) / 255.
    al = np.asarray(al.resize((tw, th), Image.LANCZOS)).astype(np.float64) / 255.
    if neutro:
        dentro = rgb[(al > 0.95) & (rgb.mean(axis=2) > 0.55)]
        rgb = np.clip(rgb * (0.933 / np.median(dentro, axis=0)), 0, 1)
    fg = estimate_foreground_ml(rgb, al)
    obj = Image.fromarray(np.dstack([(np.clip(fg, 0, 1) * 255 + .5).astype(np.uint8), (al * 255 + .5).astype(np.uint8)]), 'RGBA')
    canvas = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
    canvas.alpha_composite(obj, ((CW - tw) // 2, round(CH * base) - th))
    return canvas, round(f, 2)


def guardar(im, nombre, carpeta=OUT, q=94):
    for ext in ('png', 'webp', 'jpg'):
        viejo = os.path.join(carpeta, f'{nombre}.{ext}')
        if os.path.exists(viejo):
            os.remove(viejo)
    p = os.path.join(carpeta, f'{nombre}.webp')
    im.save(p, quality=q, alpha_quality=100, method=6, exact=False)
    return p


PRODUCTOS = {
    # Ecografía
    'ecografo-inalambrico-eco-wireless-vytamed': (lambda: pdf('i-006-024.jpg', (520, 80, 740, 470)), dict(box=(0.5, 0.74), area=0.2), {}),
    'ecografo-portatil-acclarix-ax2-edan': (lambda: edan('AX2/20251210052053_736028.png', (0, 0, 960, 820)), dict(box=(0.78, 0.74), area=0.34), {}),
    'ecografo-portatil-acclarix-ax3-edan': (lambda: edan('AX3/20251210051957_063179.png', (0, 0, 960, 820)), dict(box=(0.8, 0.74), area=0.34), {}),
    'ecografo-portatil-acclarix-ax8-edan': (lambda: landing('p-ax8-640.webp'), dict(box=(0.8, 0.76), area=0.36), {}),
    'ecografo-portatil-acclarix-ax9-edan': (lambda: pdf('i-023-144.jpg'), dict(box=(0.78, 0.76), area=0.34), {}),
    'ecografo-de-carro-acclarix-lx3-edan': (lambda: pdf('i-025-158.jpg'), dict(box=(0.6, 0.8)), {}),
    'ecografo-de-carro-acclarix-lx9-edan': (lambda: landing('p-lx9-640.webp'), dict(box=(0.6, 0.8)), {}),
    'ecografo-de-carro-acclarix-lx25-edan': (lambda: pdf('i-018-109.jpg'), dict(box=(0.6, 0.8)), {}),
    'ecografo-de-carro-acclarix-lx85-edan': (lambda: pdf('i-019-116.jpg'), dict(box=(0.6, 0.8)), {}),
    'ecografo-de-carro-acclarix-gx9-edan': (lambda: pdf('i-024-151.jpg'), dict(box=(0.6, 0.8)), {}),
    'ecografo-de-carro-u2-edan': (lambda: edan('extra/20191105044557_007018.jpg', (100, 0, 280, 240)), dict(box=(0.6, 0.8)), {}),
    'ecografo-portatil-dus60-edan': (lambda: edan('DUS60/20251210052534_481141.png', (0, 0, 960, 820)), dict(box=(0.8, 0.76), area=0.36), {}),
    'ecografo-portatil-u50-edan': (lambda: edan('U50PE/20251210052315_626647.png', (0, 0, 960, 820)), dict(box=(0.8, 0.76), area=0.36), {}),
    'ecografo-portatil-u60-edan': (lambda: edan('U60/20251210052157_676453.png', (0, 0, 960, 820)), dict(box=(0.8, 0.76), area=0.36), {}),
    'ecografo-de-bolsillo-nano-l12-exp-edan': (lambda: edan('NanoL12/20260428014023_588661.png', (0, 0, 900, 820)), dict(box=(0.62, 0.8), area=0.3), {}),
    'ecografo-de-bolsillo-nano-c5-exp-edan': (lambda: edan('NanoC5/20251211115659_269228.png', (0, 0, 900, 820)), dict(box=(0.62, 0.8), area=0.3), {}),
    # Diatermia
    'diatermia-multifuncion-vytamed': (lambda: landing_rgba('hero-vytamed-760.webp'), {}, dict(alfa=True)),
    'diatermia-reatherm-i-tech': (lambda: landing('p-reatherm-640.webp'), dict(box=(0.84, 0.76), area=0.36), {}),
    'diatermia-hr-tek-eme': (lambda: landing('p-hrtek-640.webp'), dict(box=(0.82, 0.76), area=0.34), {}),
    'diatermia-reacare-i-tech': (lambda: pdf('i-027-172.jpg'), dict(box=(0.84, 0.76), area=0.36), dict(fade=('bottom',))),
    'diatermia-microondas-radarmed-2500-cp-eme': (lambda: pdf('i-039-258.jpg'), dict(box=(0.6, 0.82)), {}),
    # Fisioterapia y rehabilitación
    'presoterapia-beauty-press': (lambda: pdf('i-048-315.jpg'), dict(box=(0.66, 0.66), area=0.26), {}),
    'presoterapia-i-press-i-tech': (lambda: pdf('i-030-194.jpg'), dict(box=(0.7, 0.78), area=0.3), {}),
    'ondas-de-choque-shock-med-eme': (lambda: pdf('i-032-207.jpg'), dict(box=(0.72, 0.76), area=0.3), {}),
    'ondas-de-choque-likawave-vario-3i-likamed': (lambda: pdf('i-051-335.jpg'), dict(box=(0.6, 0.82)), {}),
    'ondas-de-choque-likawave-vario-2i-likamed': (lambda: pdf('i-052-340.jpg'), dict(box=(0.8, 0.74), area=0.34), {}),
    'magnetoterapia-superinductiva-clinica-vytamed': (lambda: landing('cat-magnetoterapia-480.webp'), dict(box=(0.8, 0.76), area=0.34), {}),
    'magnetoterapia-superinductiva-vytamed': (lambda: pdf('i-005-017.jpg', (40, 110, 520, 721)), dict(box=(0.62, 0.84), area=0.3), {}),
    'magnetoterapia-lamagneto-i-tech': (lambda: pdf('i-028-179.jpg'), dict(box=(0.5, 0.78), area=0.26), {}),
    'magnetoterapia-magnetomed-eme': (lambda: pdf('i-038-251.jpg'), dict(box=(0.84, 0.74), area=0.36), {}),
    'laser-terapeutico-alta-potencia': (lambda: pdf('i-009-045.jpg'), dict(box=(0.84, 0.7), area=0.36), {}),
    'laser-alta-potencia-crystal-yag-bipower-lux-eme': (lambda: pdf('i-034-221.jpg'), dict(box=(0.84, 0.74), area=0.36), {}),
    'laser-baja-potencia-lasermed-2200-eme': (lambda: pdf('i-038-250.jpg'), dict(box=(0.84, 0.74), area=0.36), {}),
    'laser-de-barrido-pr999-eme': (lambda: pdf('i-040-265.jpg'), dict(box=(0.6, 0.82)), {}),
    'laser-ondas-de-choque-intelect': (lambda: pdf('i-010-052.jpg'), dict(box=(0.84, 0.74), area=0.36), {}),
    'electrolisis-percutanea-physio-invasiva-easytech': (lambda: pdf('i-015-089.jpg'), dict(box=(0.8, 0.72), area=0.32), dict(neutro=True)),
    'ultrasonidos-ut2-i-tech': (lambda: pdf('i-029-186.jpg'), dict(box=(0.84, 0.72), area=0.34), {}),
    'ultrasonidos-ultrasonic-eme': (lambda: pdf('i-036-236.jpg'), dict(box=(0.84, 0.74), area=0.36), {}),
    'electroterapia-t-one-coach-i-tech': (lambda: pdf('i-030-193.jpg'), dict(box=(0.5, 0.78), area=0.26), {}),
    'electroterapia-therapic-eme': (lambda: pdf('i-036-235.jpg'), dict(box=(0.84, 0.74), area=0.36), {}),
    'terapia-combinada-combimed-eme': (lambda: pdf('i-037-243.jpg'), dict(box=(0.84, 0.74), area=0.36), {}),
    'multiterapia-polyter-evo-eme': (lambda: pdf('i-035-228.jpg'), dict(box=(0.5, 0.8), area=0.26), {}),
    # Camillas
    'camilla-electrica-estandar': (lambda: pdf('i-014-082.jpg', (88, 36, 388, 238)), dict(box=(0.86, 0.72), area=0.36), {}),
    'camilla-electrica-premium': (lambda: pdf('i-012-065.jpg', (64, 74, 470, 300)), dict(box=(0.86, 0.72), area=0.36), {}),
    'camilla-hidraulica-pro': (lambda: pdf('i-012-066.jpg', (64, 74, 470, 300)), dict(box=(0.86, 0.72), area=0.36), {}),
    'camilla-hidraulica-clinica': (lambda: pdf('i-013-073.jpg', (64, 74, 470, 300)), dict(box=(0.86, 0.72), area=0.36), {}),
    'camilla-hidraulica-compacta': (lambda: pdf('i-013-074.jpg', (64, 74, 470, 300)), dict(box=(0.86, 0.72), area=0.36), {}),
    'camilla-electrica-multiposicion': (lambda: pdf('i-014-081.jpg', (64, 38, 430, 242)), dict(box=(0.86, 0.72), area=0.36), {}),
    # Estética médica
    'estetica-rigenera-3-pro-age': (lambda: pdf('i-043-285.jpg'), dict(box=(0.5, 0.82), area=0.26), {}),
    'estetica-epil-evo-smart': (lambda: pdf('i-044-291.jpg'), dict(box=(0.5, 0.82), area=0.26), {}),
    'estetica-reshape-plus': (lambda: pdf('i-045-297.jpg'), dict(box=(0.8, 0.74), area=0.36), {}),
    'estetica-biorev-tech': (lambda: pdf('i-046-303.jpg'), dict(box=(0.8, 0.74), area=0.34), {}),
    'estetica-echos': (lambda: pdf('i-047-309.jpg'), dict(box=(0.8, 0.7), area=0.3), {}),
    'estetica-ageless': (lambda: pdf('i-049-321.jpg'), dict(box=(0.56, 0.82), area=0.3), {}),
}


# ---------------------------------------------------------------- fotos
def grade(im, amount=0.06):
    """Etalonaje de marca suave: sombras hacia marino, altas hacia turquesa (el de la ronda 1, más ligero)."""
    im = im.convert('RGB')
    g = im.convert('L')
    navy, teal = (11, 25, 41), (214, 240, 240)
    duo = Image.merge('RGB', [g.point(lambda v, a=navy[i], b=teal[i]: round(a + (b - a) * v / 255)) for i in range(3)])
    return ImageEnhance.Contrast(Image.blend(im, duo, amount)).enhance(1.03)


def foto(nombre, src, size=(1440, 1080), limpiar=(), ruido=0.35, max_factor=2.5):
    im = src.convert('RGB')
    if limpiar:
        arr = np.array(im)
        mk = np.zeros(arr.shape[:2], np.uint8)
        for (x0, y0, x1, y1) in limpiar:
            mk[y0:y1, x0:x1] = 255
        im = Image.fromarray(cv2.inpaint(arr, mk, 6, cv2.INPAINT_TELEA))
    tw, th = size
    # Recorte 4:3 centrado sobre el original y destino a como mucho 2,5 veces su resolución
    r = min(im.width / tw, im.height / th)
    cw, chh = round(tw * r), round(th * r)
    x, y = (im.width - cw) // 2, (im.height - chh) // 2
    im = im.crop((x, y, x + cw, y + chh))
    f = min(tw / cw, max_factor)
    tw, th = round(cw * f), round(chh * f)
    sr = cache(f'foto-{nombre}-x4.png', lambda: escalar(im, modelo('realesr-general-x4v3.pth', ruido)))
    out = grade(sr.resize((tw, th), Image.LANCZOS))
    p = guardar(out, nombre, FOTOS, q=90)
    print('foto', nombre, out.size, f'×{f:.2f}', os.path.getsize(p) // 1024, 'KB')


def javier():
    """Foto de Javier: escalado conservador ×3 (sin restauración facial, que inventa rasgos), pared del fondo
    alisada y recorte."""
    from pymatting import estimate_foreground_ml
    src = landing('javier-384.webp')
    sr = cache('javier-x4.png', lambda: escalar(src, modelo('realesr-general-x4v3.pth', 0.3)))
    w, h = src.width * 3, src.height * 3
    base = sr.resize((w, h), Image.LANCZOS)
    # 20 % del original ampliado: conserva la textura natural de la piel
    out = grade(Image.blend(base, src.resize((w, h), Image.LANCZOS), 0.2), 0.04)
    m = cache('javier-mask.png', lambda: mascara(sr, 'birefnet-portrait')).resize((w, h), Image.LANCZOS)
    a = np.clip((np.asarray(m.convert('L')).astype(np.float32) / 255. - 0.1) / 0.8, 0, 1)
    rgb = np.asarray(out).astype(np.float64) / 255.
    fg = estimate_foreground_ml(rgb, a.astype(np.float64))
    # Pared: media local de los píxeles de fondo (convolución normalizada, sin la silueta). Conserva la luz
    # y la sombra de la pared y quita las ondas de compresión del original. Javier se compone encima.
    peso = (1 - a).astype(np.float64)
    num = cv2.GaussianBlur(rgb * peso[..., None], (0, 0), 18)
    den = cv2.GaussianBlur(peso, (0, 0), 18)[..., None]
    pared = num / np.maximum(den, 1e-3)
    final = np.clip(fg * a[..., None] + pared * (1 - a[..., None]), 0, 1)
    p = guardar(Image.fromarray((final * 255 + .5).astype(np.uint8)), 'javier-ruiz-fisioterapeuta', FOTOS, q=90)
    print('foto javier', (w, h), os.path.getsize(p) // 1024, 'KB')
    rgba = np.dstack([(np.clip(fg, 0, 1) * 255 + .5).astype(np.uint8), (a * 255 + .5).astype(np.uint8)])
    p = guardar(Image.fromarray(rgba, 'RGBA'), 'javier-ruiz-fisioterapeuta-recorte', FOTOS, q=90)
    print('recorte javier', os.path.getsize(p) // 1024, 'KB')


def catalogo():
    """Portada e interiores del catálogo para la maqueta 3D: se renderizan del PDF a 200 ppp (texto
    nítido, sin IA) y se guardan a 1120 px de ancho."""
    import subprocess
    import tempfile
    pdf_cat = os.path.join(ROOT, 'public', 'assets', 'docs', 'catalogo-vytalgroup-2026.pdf')
    with tempfile.TemporaryDirectory() as d:
        for n, nombre in ((1, 'catalogo-portada'), (22, 'catalogo-interior-ecografia'), (8, 'catalogo-interior-diatermia')):
            subprocess.run(['pdftoppm', '-f', str(n), '-l', str(n), '-r', '200', '-png', pdf_cat, os.path.join(d, 'p')], check=True)
            png = [f for f in os.listdir(d) if f.startswith('p')][0]
            im = Image.open(os.path.join(d, png)).convert('RGB')
            os.remove(os.path.join(d, png))
            im = im.resize((1120, round(im.height * 1120 / im.width)), Image.LANCZOS)
            p = guardar(im, nombre, FOTOS, q=88)
            print('catálogo', nombre, im.size, os.path.getsize(p) // 1024, 'KB')


if __name__ == '__main__':
    for nombre, (fuente, encuadre, opciones) in PRODUCTOS.items():
        if SOLO and nombre not in SOLO:
            continue
        lienzo, factor = producto(nombre, fuente, **encuadre, **opciones)
        p = guardar(lienzo, nombre)
        print(nombre, f'×{factor}', os.path.getsize(p) // 1024, 'KB', flush=True)

    # Fotos: todas con "fotos" o cada una por su nombre
    FOTOS_IA = {
        'diatermia-multifuncion-vytamed-en-consulta': (lambda: pdf('i-004-016.jpg'), {}),
        'diatermia-multifuncion-vytamed-pantalla': (lambda: pdf('i-008-038.jpg'), {}),
        'eco-wireless-vytamed-estuche': (lambda: pdf('i-006-024.jpg'), {}),
        'superinductiva-vytamed-en-consulta': (lambda: pdf('i-005-017.jpg', (0, 100, 540, 505)), {}),
        'superinductiva-clinica-vytamed-en-consulta': (lambda: pdf('i-007-031.jpg', (190, 0, 554, 369)), dict(limpiar=[(0, 44, 58, 90), (0, 92, 14, 116)], max_factor=3)),
    }
    for nombre, (fuente, opciones) in FOTOS_IA.items():
        if not SOLO or 'fotos' in SOLO or nombre in SOLO:
            foto(nombre, fuente(), **opciones)
    if not SOLO or 'javier' in SOLO:
        javier()
    if not SOLO or 'catalogo' in SOLO:
        catalogo()
