"""Builds the app icon, adaptive icon layers, splash marks and favicon in assets/.

The mark is a map pin with a coffee cup inside: a place to find coffee.
"""
import pathlib

from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"

COFFEE = "#7A5230"
PAPER = "#F7F6F3"
NIGHT = "#141413"
SCALE = 4


def mark(size: int, pin: str, cup: str, background: str | None, coverage: float) -> Image.Image:
    """Pin of height `coverage * size`, centred, with a cup cut in the `cup` colour."""
    big = size * SCALE
    img = Image.new("RGBA", (big, big), background or (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    h = big * coverage
    r = h * 0.36  # head radius
    cx = big / 2
    top = (big - h) / 2
    cy = top + r
    tip = top + h
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=pin)
    # The point meets the circle at its tangents, so the outline has no step.
    cos_t = r / (tip - cy)
    sin_t = (1 - cos_t**2) ** 0.5
    d.polygon([(cx - r * sin_t, cy + r * cos_t), (cx + r * sin_t, cy + r * cos_t), (cx, tip)], fill=pin)

    # Cup: body and handle as strokes, steam as three short rounded lines.
    w = round(r * 0.14)
    bx0, bx1 = cx - r * 0.52, cx + r * 0.26
    by0, by1 = cy - r * 0.14, cy + r * 0.5
    d.rounded_rectangle((bx0, by0, bx1, by1), radius=r * 0.18, outline=cup, width=w)
    d.arc((bx1 - r * 0.14, by0 + r * 0.06, bx1 + r * 0.38, by0 + r * 0.46), 270, 90, fill=cup, width=w)
    for x in (-0.34, -0.13, 0.08):
        sx = cx + r * x
        y0, y1 = cy - r * 0.66, cy - r * 0.44
        d.line((sx, y0, sx, y1), fill=cup, width=w)
        for y in (y0, y1):
            d.ellipse((sx - w / 2, y - w / 2, sx + w / 2, y + w / 2), fill=cup)
    return img.resize((size, size), Image.LANCZOS)


def save(img: Image.Image, name: str, rgb: bool = False) -> None:
    (img.convert("RGB") if rgb else img).save(ASSETS / name, optimize=True)


def main() -> None:
    save(mark(1024, PAPER, COFFEE, COFFEE, 0.62), "icon.png", rgb=True)
    save(mark(1024, PAPER, COFFEE, None, 0.44), "android-icon-foreground.png")
    save(Image.new("RGBA", (1024, 1024), COFFEE), "android-icon-background.png")
    save(mark(1024, "#FFFFFF", (0, 0, 0, 0), None, 0.44), "android-icon-monochrome.png")
    save(mark(1024, COFFEE, PAPER, None, 0.9), "splash-icon.png")
    save(mark(1024, PAPER, NIGHT, None, 0.9), "splash-icon-dark.png")
    save(mark(48, PAPER, COFFEE, COFFEE, 0.8), "favicon.png")


if __name__ == "__main__":
    main()
