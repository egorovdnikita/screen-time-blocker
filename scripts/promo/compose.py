"""Монтаж промо Block: кадры record.mjs → зацикленный WebP 1600 × 880, 30 кадров/с.

Телефон в центре холста GitHub Dark, внешняя обводка #3d444d со скруглением 20 pt.
Курсора нет: касания показаны матовыми кольцами (кривая как в промо Agent Pulse).
Камера плавно приближает место действия и возвращается к общему плану.
Последние 0,3 с экран сводится к первому кадру — петля бесшовная, первый и последний кадр совпадают.

Использование: python compose.py ПАПКА_ЗАПИСИ ВЫХОД.webp [--keys] [--lossy --quality 90]
"""
import argparse
import json
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, _webp

OUT_W, OUT_H = 1600, 880
K = 1.25                      # px на pt внешней рамки, как у Agent Pulse (1600 px ↔ 1280 pt)
BG = "#0d1117"
OUTLINE = "#3d444d"
CENTER = (OUT_W / 2, OUT_H / 2)
S = 0.88                      # px холста на pt экрана при общем плане
BEZEL = 11.0                  # рамка телефона, px общего плана
SCREEN_R = 55.0               # скругление экрана, pt
RING = 24.0                   # радиус кольца касания, pt экрана
LOOP_BLEND = 0.3              # с, сведение к первому кадру


def cubic_in_out(t):
    t = min(max(t, 0.0), 1.0)
    return 4 * t ** 3 if t < .5 else 1 - (-2 * t + 2) ** 3 / 2


def cubic_out(t):
    t = min(max(t, 0.0), 1.0)
    return 1 - (1 - t) ** 3


def camera_progress(elapsed, duration=.75):
    """Камера Agent Pulse: основной ход ~0,4 с, лёгкий перелёт, покой к 0,75 с."""
    if elapsed <= 0:
        return 0.0
    if elapsed >= duration:
        return 1.0
    t = elapsed / duration * .75
    value = 1 - math.exp(-11 * t) * (math.cos(8 * t) + (11 / 8) * math.sin(8 * t))
    blend = cubic_in_out((t - .60) / .15)
    return value * (1 - blend) + blend


def tap_state(rel):
    """Кольцо касания Agent Pulse: доля радиуса, прозрачность, отверстие."""
    hole = .58
    if rel < -.37 or rel > .28:
        return 0.0, 0.0, hole
    if rel < -.17:
        p = (rel + .37) / .20
        return .45 + .55 * cubic_out(p), cubic_in_out(p / .6), hole
    if rel < 0:
        p = (rel + .17) / .17
        return 1 - .5 * cubic_in_out(p), 1.0, hole
    p = rel / .28
    return .5 + .24 * cubic_out(p), 1 - cubic_in_out(p), hole + .2 * cubic_in_out(p)


def camera_plan(clicks):
    """Позы камеры (время, приближение, точка фокуса по вертикали в pt экрана), привязанные к касаниям."""
    by = {}
    for c in clicks:
        by.setdefault(c["label"], []).append(c["t"])
    wide = (1.0, 426.0)
    plan = [(0.0, wide)]
    # Меню периода у верхнего края: крупно верх экрана.
    plan.append((by["Период"][0] - .55, (1.32, 150.0)))
    plan.append((by["Сегодня"][0] + .35, wide))
    # Подтверждение удаления: крупно диалог.
    plan.append((by["Удалить сессию"][0] - .1, (1.24, 560.0)))
    plan.append((by["Удалить"][0] + .55, wide))
    return plan


def camera_at(plan, t):
    current = plan[0][1]
    for start, pose in plan[1:]:
        if t < start:
            break
        p = camera_progress(t - start)
        current = tuple(a + (b - a) * p for a, b in zip(current, pose))
    return current


def rounded_mask(size, radius, sup=3):
    w, h = size
    m = Image.new("L", (w * sup, h * sup), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w * sup - 1, h * sup - 1), radius=radius * sup, fill=255)
    return m.resize(size, Image.LANCZOS)


class Stage:
    def __init__(self, meta):
        self.w, self.h = meta["width"], meta["height"]

    def place(self, pose):
        """Масштаб px/pt и левый верхний угол экрана на холсте для позы камеры."""
        z, fy = pose
        k = S * z
        # Точка фокуса остаётся на своём месте общего плана: приближение «вокруг» неё.
        fy_canvas = CENTER[1] + (fy - self.h / 2) * S
        x0 = CENTER[0] - self.w / 2 * k
        y0 = fy_canvas - fy * k
        return k, x0, y0


def draw_phone(canvas, screen, k, x0, y0, z):
    sw, sh = round(STAGE.w * k), round(STAGE.h * k)
    bezel = BEZEL * z
    # Мягкая тень корпуса
    ox, oy, ow, oh = x0 - bezel, y0 - bezel, sw + 2 * bezel, sh + 2 * bezel
    outer_r = SCREEN_R * k + bezel
    pad = 60
    shadow = Image.new("L", (int(ow) + 2 * pad, int(oh) + 2 * pad), 0)
    ImageDraw.Draw(shadow).rounded_rectangle((pad, pad + 14 * z, pad + ow, pad + oh + 14 * z), radius=outer_r, fill=150)
    shadow = shadow.filter(ImageFilter.GaussianBlur(26 * z))
    black = Image.new("RGBA", shadow.size, (0, 0, 0, 255))
    black.putalpha(shadow)
    canvas.alpha_composite(black, (round(ox - pad), round(oy - pad)))
    # Корпус: тёмная рамка с тонкой светлой гранью
    sup = 3
    body = Image.new("RGBA", (round(ow) * sup, round(oh) * sup))
    d = ImageDraw.Draw(body)
    d.rounded_rectangle((0, 0, round(ow) * sup - 1, round(oh) * sup - 1), radius=outer_r * sup, fill="#05070a", outline=OUTLINE, width=round(1.5 * z * sup))
    body = body.resize((round(ow), round(oh)), Image.LANCZOS)
    canvas.alpha_composite(body, (round(ox), round(oy)))
    # Экран
    img = screen.resize((sw, sh), Image.LANCZOS).convert("RGBA")
    img.putalpha(rounded_mask((sw, sh), SCREEN_R * k))
    canvas.alpha_composite(img, (round(x0), round(y0)))


def draw_ring(canvas, cx, cy, rel, radius):
    share, alpha, hole = tap_state(rel)
    if alpha <= 0.01:
        return
    r = radius * share
    pad = int(r + 12)
    box = (int(cx - pad), int(cy - pad), int(cx + pad), int(cy + pad))
    sample = canvas.crop(box).filter(ImageFilter.GaussianBlur(max(2, r * .16)))
    light = sample.convert("L").resize((1, 1), Image.BOX).getpixel((0, 0)) > 170
    tint = Image.new("RGBA", sample.size, (120, 126, 140, 255) if light else (234, 241, 250, 255))
    glass = Image.blend(sample, tint, .45 if light else .28)
    size, sup = sample.size, 4
    mask = Image.new("L", (size[0] * sup, size[1] * sup), 0)
    d = ImageDraw.Draw(mask)
    ox, oy = (cx - box[0]) * sup, (cy - box[1]) * sup
    d.ellipse((ox - r * sup, oy - r * sup, ox + r * sup, oy + r * sup), fill=int(235 * alpha))
    ri = r * hole
    d.ellipse((ox - ri * sup, oy - ri * sup, ox + ri * sup, oy + ri * sup), fill=0)
    mask = mask.resize(size, Image.LANCZOS)
    shadow = Image.new("RGBA", size, (0, 0, 0, 0))
    shadow.putalpha(mask.filter(ImageFilter.GaussianBlur(r * .12 + 2)).point(lambda v: int(v * .3)))
    canvas.alpha_composite(shadow, (box[0], box[1] + max(1, int(r * .05))))
    glass.putalpha(mask)
    canvas.alpha_composite(glass, (box[0], box[1]))


def outer_frame():
    sup = 3
    border = Image.new("RGBA", (OUT_W * sup, OUT_H * sup))
    ImageDraw.Draw(border).rounded_rectangle((sup / 2, sup / 2, OUT_W * sup - sup / 2, OUT_H * sup - sup / 2),
                                             radius=20 * K * sup, outline=OUTLINE, width=round(K * sup))
    border = border.resize((OUT_W, OUT_H), Image.LANCZOS)
    mask = rounded_mask((OUT_W, OUT_H), 20 * K)
    return border, mask


def main():
    global STAGE
    ap = argparse.ArgumentParser()
    ap.add_argument("folder")
    ap.add_argument("out")
    ap.add_argument("--quality", type=int, default=90, help="качество 0–100 (без потерь — сила сжатия)")
    ap.add_argument("--lossy", action="store_true", help="с потерями: меньше файл, но стык петли совпадает только до шума сжатия")
    ap.add_argument("--mixed", action="store_true", help="с --lossy: смешивать кадры с потерями и без")
    ap.add_argument("--method", type=int, default=4, help="метод сжатия 0–6")
    ap.add_argument("--keys", action="store_true", help="сохранить контрольные кадры каждые 0,5 с и стык петли")
    args = ap.parse_args()
    args.lossless = not args.lossy
    folder = Path(args.folder)
    meta = json.loads((folder / "record.json").read_text())
    fps, n = meta["fps"], meta["frames"]
    STAGE = Stage(meta)
    plan = camera_plan(meta["clicks"])
    border, mask = outer_frame()
    first_screen = Image.open(folder / "frames" / "00000.png").convert("RGB")
    keys_dir = folder / "keys"
    keys_dir.mkdir(exist_ok=True)
    key_frames = {round(i * fps / 2) for i in range(int(n / fps * 2) + 1)} | {0, 1, n - 2, n - 1}

    # Кодировщик libwebp из Pillow напрямую: кадры подаются потоком, метки времени точные.
    enc = _webp.WebPAnimEncoder((OUT_W, OUT_H), 0, 0, False, 3, 5, args.mixed, False) if not args.lossless \
        else _webp.WebPAnimEncoder((OUT_W, OUT_H), 0, 0, False, 9, 17, False, False)
    stamp = lambda i: round(i * 1000 / fps)
    blend_from = n - 1 - round(LOOP_BLEND * fps)
    first = last = None
    for i in range(n):
        t = i / fps
        screen = Image.open(folder / "frames" / f"{i:05d}.png").convert("RGB")
        if i > blend_from:
            screen = Image.blend(screen, first_screen, cubic_in_out((i - blend_from) / (n - 1 - blend_from)))
        pose = camera_at(plan, t)
        k, x0, y0 = STAGE.place(pose)
        canvas = Image.new("RGBA", (OUT_W, OUT_H), BG)
        draw_phone(canvas, screen, k, x0, y0, pose[0])
        for c in meta["clicks"]:
            draw_ring(canvas, x0 + c["x"] * k, y0 + c["y"] * k, t - c["t"], RING * k)
        canvas.putalpha(mask)
        canvas.alpha_composite(border)
        enc.add(canvas.getim(), stamp(i), args.lossless, args.quality, 100, args.method)
        if i == 0:
            first = canvas.copy()
        last = canvas
        if args.keys and i in key_frames:
            canvas.save(keys_dir / f"key-{t:05.2f}.png")
        if i % (fps * 5) == 0:
            print(f"Монтаж: {t:.0f}/{n / fps:.0f} с", flush=True)
    enc.add(None, stamp(n), args.lossless, args.quality, 100, 0)
    data = enc.assemble(b"", b"", b"")
    if data is None:
        raise RuntimeError("Не удалось записать WebP")
    Path(args.out).write_bytes(data)
    same = ImageChops.difference(first, last).getbbox() is None
    print(f"Готово: {args.out}, {n} кадров, {n / fps:.2f} с, первый и последний кадр совпадают: {same}")
    if not same:
        raise SystemExit("Стык петли не совпадает")
    verify_webp(Path(args.out), n, fps)


def verify_webp(path, n, fps):
    """Проверить готовый файл: длительность и петля — по чанкам ANMF/ANIM (итератор Pillow
    неверно отдаёт длительность объединённых кадров), первый и последний кадр — декодированием."""
    import struct
    data = path.read_bytes()
    i, count, total, loop = 12, 0, 0, None
    while i < len(data):
        tag, size = data[i:i + 4], struct.unpack("<I", data[i + 4:i + 8])[0]
        body = data[i + 8:i + 8 + size]
        if tag == b"ANIM":
            loop = struct.unpack("<H", body[4:6])[0]
        elif tag == b"ANMF":
            count += 1
            total += int.from_bytes(body[12:15], "little")
        i += 8 + size + (size & 1)
    im = Image.open(path)
    first = im.convert("RGB").copy()
    im.seek(im.n_frames - 1)
    peak = max(hi for lo, hi in ImageChops.difference(first, im.convert("RGB")).getextrema())
    print(f"Проверка WebP: {count} сохранённых кадров, {total} мс (ожидалось {round(n * 1000 / fps)}), "
          f"петля {loop} (0 = бесконечно), {len(data) / 1e6:.1f} МБ, "
          f"макс. разница декодированных первого и последнего кадра {peak}")
    if total != round(n * 1000 / fps) or loop != 0:
        raise SystemExit("Неверная длительность или петля WebP")


if __name__ == "__main__":
    main()
