#!/usr/bin/env python3
"""Draw the lock-screen plate set: four diagrams from Sage's reading world.

Not illustration — vector-style technical plates, drawn here so line weight,
spacing and typography stay under control (and stay crisp on a 758px panel).

Plate language
  field      pure white, ink #141414
  headers    SAGE PAPER / title (60px SemiBold) / three-word footer
  strokes    1-2px hairlines, dots, hatch fill; no grey washes
"""
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
W, H = 1078, 1459
SS = 2                      # supersample, downscaled to 1078x1459
INK = 20
MUTED = 70

SERIF = "C:/Windows/Fonts/NotoSerifSC-VF.ttf"
MATH = "C:/Windows/Fonts/cambriai.ttf"


def px(v):
    return int(round(v * SS))


class Plate:
    def __init__(self):
        self.im = Image.new("L", (W * SS, H * SS), 255)
        self.d = ImageDraw.Draw(self.im)

    def line(self, a, b, w=1.6, fill=INK):
        self.d.line([px(a[0]), px(a[1]), px(b[0]), px(b[1])], fill=fill, width=max(1, px(w)))

    def dot(self, c, r, fill=INK):
        self.d.ellipse([px(c[0] - r), px(c[1] - r), px(c[0] + r), px(c[1] + r)], fill=fill)

    def ring(self, c, r, w=1.4, fill=INK):
        self.d.ellipse([px(c[0] - r), px(c[1] - r), px(c[0] + r), px(c[1] + r)],
                       outline=fill, width=max(1, px(w)))

    def box(self, b, w=1.6, fill=INK):
        self.d.rectangle([px(b[0]), px(b[1]), px(b[2]), px(b[3])], outline=fill, width=max(1, px(w)))

    def dashed_arc(self, c, r, dash=10, gap=9, w=1.3, fill=MUTED):
        box = [px(c[0] - r), px(c[1] - r), px(c[0] + r), px(c[1] + r)]
        step = (dash + gap) / r * 180 / math.pi
        a = 0.0
        while a < 360:
            self.d.arc(box, a, min(a + dash / r * 180 / math.pi, 360), fill=fill, width=max(1, px(w)))
            a += step

    def dashed_line(self, a, b, dash=8, gap=7, w=1.3, fill=MUTED):
        dx, dy = b[0] - a[0], b[1] - a[1]
        total = math.hypot(dx, dy)
        ux, uy = dx / total, dy / total
        t = 0.0
        while t < total:
            e = min(t + dash, total)
            self.line((a[0] + ux * t, a[1] + uy * t), (a[0] + ux * e, a[1] + uy * e), w, fill)
            t = e + gap

    def hatch(self, polygon, spacing=11, w=1.0, fill=MUTED, angle=45):
        """Diagonal hatch clipped to a polygon (list of points)."""
        mask = Image.new("L", self.im.size, 0)
        ImageDraw.Draw(mask).polygon([(px(x), px(y)) for x, y in polygon], fill=255)
        layer = Image.new("L", self.im.size, 255)
        ld = ImageDraw.Draw(layer)
        rad = math.radians(angle)
        dx, dy = math.cos(rad), math.sin(rad)
        span = W + H
        nx, ny = -dy, dx
        for i in range(int(-span / spacing), int(span / spacing)):
            ox = W / 2 + nx * i * spacing
            oy = H / 2 + ny * i * spacing
            ld.line([px(ox - dx * span), px(oy - dy * span),
                     px(ox + dx * span), px(oy + dy * span)],
                    fill=fill, width=max(1, px(w)))
        self.im.paste(layer, (0, 0), mask)

    def text(self, xy, s, size, font=SERIF, weight=None, fill=INK, tracking=0, italic=False):
        f = ImageFont.truetype(MATH if italic else font, px(size))
        if weight:
            try:
                f.set_variation_by_name(weight)
            except Exception:
                pass
        if tracking:
            x, y = xy
            for ch in s:
                self.d.text((px(x), px(y)), ch, font=f, fill=fill, anchor="ls")
                x += self.d.textlength(ch, font=f) / SS + tracking
            return
        self.d.text((px(xy[0]), px(xy[1])), s, font=f, fill=fill, anchor="ls")

    def text_width(self, s, size, italic=False, tracking=0.0):
        f = ImageFont.truetype(MATH if italic else SERIF, px(size))
        return sum(self.d.textlength(c, font=f) / SS for c in s) + tracking * max(0, len(s) - 1)

    def proportional(self, x, baseline, size=32):
        """Hand-drawn proportional sign (Cambria Italic has no U+221D here)."""
        r = size * 0.17
        c = (x + size * 0.30, baseline - size * 0.34)
        self.ring(c, r, 1.5, MUTED)
        self.line((c[0] - r * 1.95, c[1] + r * 1.95), (c[0] + r * 1.95, c[1] - r * 1.95), 1.5, MUTED)

    def save(self, name, title, words, note):
        # shared type block (same metrics as specimen-lock-v1)
        self.text((84, 86), "SAGE PAPER", 25, tracking=6.0, fill=INK)
        self.text((84, 175), title, 60, weight="SemiBold", tracking=30.0, fill=INK)
        f = ImageFont.truetype(SERIF, px(27))
        wsum = sum(self.d.textlength(c, font=f) / SS for c in words) + 9.0 * (len(words) - 1)
        self.text(((W - wsum) / 2.0, 1402), words, 27, tracking=9.0, fill=INK)

        out = ROOT / "wallpapers" / f"{name}.png"
        self.im.resize((W, H), Image.LANCZOS).save(out, optimize=True)
        (ROOT / "wallpapers" / f"{name}.provenance.json").write_text(
            "{\n"
            '  "tool": "tools/make-wallpapers.py (procedural drawing, no image model)",\n'
            f'  "title": "{title}",\n'
            f'  "words": "{words}",\n'
            f'  "note": "{note}",\n'
            '  "size": "1078x1459"\n'
            "}\n", encoding="utf-8")
        print("wrote", out.name, out.stat().st_size // 1024, "KB")


# ---------------------------------------------------------------- 01 熵与秩序
def plate_entropy():
    p = Plate()
    rnd = random.Random(1802)
    x0, x1, y0 = 104, 974, 340
    cols, rows = 22, 10
    for j in range(rows):
        drift = rnd.uniform(-6, 6)
        for i in range(cols):
            t = i / (cols - 1.0)
            amp = 3 + 78 * t ** 2.2
            if rnd.random() < 0.34 * t ** 1.3:
                continue
            bx = x0 + (x1 - x0) * t
            by = y0 + j * 92 + drift * t
            p.dot((bx + rnd.uniform(-0.45, 0.9) * amp, by + rnd.uniform(-1, 1) * amp), 2.7 + 1.5 * t)
    p.text((104, 1306), "S = k ln W", 34, italic=True, fill=MUTED)
    p.save("plate-entropy", "熵与秩序", "有序 · 无序 · 不可逆",
           "热力学第二定律：微观状态数 W 增长，体系向无序单向漂移。规则格子沿横轴散开、稀疏，回不到起点。")


# ---------------------------------------------------------------- 02 洞穴与光
def plate_cave():
    p = Plate()
    src = (204, 700)
    bar_x, bar_top, bar_bot = 522, 566, 834
    wall_x, wall_top, wall_bot = 902, 214, 1236
    p.dot(src, 15)
    p.ring(src, 27, 1.3, MUTED)

    def cast(a):
        dx, dy = math.cos(a), math.sin(a)
        hit = (wall_x - src[0]) / dx
        if dy > 0:
            hit = min(hit, (wall_bot - src[1]) / dy)
        elif dy < 0:
            hit = min(hit, (wall_top - src[1]) / dy)
        y_at_bar = src[1] + (bar_x - src[0]) * dy / dx
        if bar_top <= y_at_bar <= bar_bot:
            return (bar_x, y_at_bar)
        return (src[0] + dx * hit, src[1] + dy * hit)

    for k in range(37):
        a = math.radians(-36 + k * (72 / 36.0))
        p.line(src, cast(a), 0.9, MUTED)

    p.box((bar_x - 9, bar_top, bar_x + 9, bar_bot), 1.6)
    p.hatch([(bar_x - 9, bar_top), (bar_x + 9, bar_top), (bar_x + 9, bar_bot), (bar_x - 9, bar_bot)], 7, 0.9)

    top = cast(math.atan2(bar_top - src[1], bar_x - src[0]))[1]
    bot = cast(math.atan2(bar_bot - src[1], bar_x - src[0]))[1]
    p.d.rectangle([px(wall_x), px(wall_top), px(wall_x + 9), px(wall_bot)], fill=255, outline=INK, width=px(1.8))
    p.d.rectangle([px(wall_x), px(top), px(wall_x + 9), px(bot)], fill=INK)
    p.line((wall_x + 9, top), (wall_x + 40, top), 1.0, MUTED)
    p.line((wall_x + 9, bot), (wall_x + 40, bot), 1.0, MUTED)
    p.text((104, 1306), "umbra", 26, italic=True, fill=MUTED)
    p.save("plate-cave", "洞穴与光", "影像 · 真实 · 影子",
           "柏拉图洞穴的几何版本：点光源被墙体挡住，在远处的墙上留下本影。看得见的影子，是看不到的光被遮住的那一段。")


# ---------------------------------------------------------------- 03 注意的窄门
def plate_attention():
    p = Plate()
    rnd = random.Random(77)
    c = (539, 742)
    p.ring(c, 398, 1.2, MUTED)
    for k in range(84):
        a = math.radians(k * 360 / 84.0)
        r2 = 398 + (14 if k % 7 == 0 else 7)
        p.line((c[0] + math.cos(a) * 398, c[1] + math.sin(a) * 398),
               (c[0] + math.cos(a) * r2, c[1] + math.sin(a) * r2), 1.0, MUTED)
    p.dashed_arc(c, 322, 11, 10, 1.3)
    p.dashed_arc(c, 218, 11, 10, 1.3)
    for _ in range(58):
        a = rnd.uniform(0, 2 * math.pi)
        r = rnd.uniform(244, 382)
        p.ring((c[0] + math.cos(a) * r, c[1] + math.sin(a) * r), rnd.uniform(2.4, 3.8), 1.2, MUTED)
    for _ in range(18):
        a = rnd.uniform(0, 2 * math.pi)
        r = 174 * math.sqrt(rnd.random())
        p.dot((c[0] + math.cos(a) * r, c[1] + math.sin(a) * r), rnd.uniform(3.8, 6.0))
    p.line((c[0] - 24, c[1]), (c[0] - 8, c[1]), 1.4, MUTED)
    p.line((c[0] + 8, c[1]), (c[0] + 24, c[1]), 1.4, MUTED)
    p.line((c[0], c[1] - 24), (c[0], c[1] - 8), 1.4, MUTED)
    p.line((c[0], c[1] + 8), (c[0], c[1] + 24), 1.4, MUTED)
    p.text((104, 1306), "field of view", 26, italic=True, fill=MUTED)
    p.save("plate-attention", "注意的窄门", "聚焦 · 选择 · 盲区",
           "中央视野：实心点是被注意选中的少数，空心点仍在场却没有被加工。注意不是看得更多，是只让一部分通过。")


# ---------------------------------------------------------------- 04 误差与信念
def plate_belief():
    p = Plate()
    axis_y, x0, x1 = 1080, 128, 950

    def gauss(mu, sd, amp):
        pts = []
        for i in range(241):
            x = x0 + (x1 - x0) * i / 240.0
            pts.append((x, axis_y - amp * math.exp(-((x - mu) ** 2) / (2 * sd * sd))))
        return pts

    prior = gauss(492, 198, 352)
    post = gauss(642, 86, 462)
    p.hatch(post + [(x1, axis_y), (x0, axis_y)], 14, 0.9)
    for i in range(0, len(prior) - 1, 2):
        p.line(prior[i], prior[i + 1], 1.5, MUTED)
    for i in range(len(post) - 1):
        p.line(post[i], post[i + 1], 2.2, INK)
    p.line((x0, axis_y), (x1, axis_y), 1.6, INK)
    for i in range(10):
        x = x0 + (x1 - x0) * i / 9.0
        p.line((x, axis_y), (x, axis_y + (16 if i % 3 == 0 else 9)), 1.2, MUTED)
    p.dashed_line((642, axis_y), (642, 648), 7, 6, 1.2, MUTED)
    p.dot((642, axis_y), 5.4)

    x = 104
    first = "p(θ|D)"
    p.text((x, 1306), first, 32, italic=True, fill=MUTED)
    w1 = p.text_width(first, 32, italic=True)
    p.proportional(x + w1 + 6, 1306, 32)
    p.text((x + w1 + 40, 1306), "p(D|θ) p(θ)", 32, italic=True, fill=MUTED)
    p.save("plate-belief", "误差与信念", "先验 · 证据 · 更新",
           "一次观测之后：宽的先验（虚线）收紧成窄的后验（实线）。信念不是被推翻，是被证据重新加权。")


def main():
    plate_entropy()
    plate_cave()
    plate_attention()
    plate_belief()


if __name__ == "__main__":
    main()
