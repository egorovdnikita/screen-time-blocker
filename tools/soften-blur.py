#!/usr/bin/env python3
"""Заменяет впечённые в картинки прямоугольники блюра (с жёсткими краями) на плавный блюр.

В выгрузках карточек статей и шаблонов под текстом лежит размытие, вшитое прямо в PNG
прямоугольником. На устройстве его край выглядит резко. Скрипт размывает низ картинки
по плавной маске (smoothstep) и смягчает пятно под тегом в левом верхнем углу.

    python3 tools/soften-blur.py <in.png> <out.png> <y0> <y1> [pill_w pill_h]

y0..y1 — пиксели (@3x), где начинается и заканчивается переход к полному блюру.
Уже обработаны: article-attention, article-delete (250 445), template-deep-work (200 365),
template-deep-work-first (170 320), template-me-time (160 300). Исходники — в выгрузках макетов.
Нужен Pillow.
"""

import sys

from PIL import Image, ImageDraw, ImageFilter

RADIUS = 42  # сила основного блюра, px @3x
EDGE = 24  # рамка экспорта (белые углы, тёмная обводка) — не даём ей затекать в блюр


def ramp_mask(size, y0, y1):
    w, h = size
    m = Image.new("L", size, 0)
    px = m.load()
    for y in range(h):
        t = 0 if y <= y0 else 1 if y >= y1 else (y - y0) / (y1 - y0)
        v = int(255 * t * t * (3 - 2 * t))
        for x in range(w):
            px[x, y] = v
    return m


def box_mask(size, box, feather=40):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rounded_rectangle(box, radius=feather, fill=255)
    return m.filter(ImageFilter.GaussianBlur(feather / 2))


def main():
    if len(sys.argv) < 5:
        sys.exit(__doc__)
    src, dst, y0, y1 = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
    pill = (0, 0, int(sys.argv[5]), int(sys.argv[6])) if len(sys.argv) > 6 else (0, 0, 280, 140)
    im = Image.open(src).convert("RGB")
    w, h = im.size
    # Источник для размытия: края заменены растянутой серединой.
    core = im.crop((EDGE, EDGE, w - EDGE, h - EDGE))
    base = core.resize((w, h), Image.LANCZOS)
    base.paste(core, (EDGE, EDGE))
    heavy = base.filter(ImageFilter.GaussianBlur(RADIUS))
    soft = base.filter(ImageFilter.GaussianBlur(RADIUS * 0.6))
    # Резкая часть остаётся исходной.
    out = Image.composite(heavy, im, ramp_mask((w, h), y0, y1))
    out = Image.composite(soft, out, box_mask((w, h), pill))
    out.save(dst, optimize=True)


if __name__ == "__main__":
    main()
