"""Draws the Android map pins (Google Maps needs bitmap markers): coffee for normal, ink for selected."""
import pathlib

from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
W, H, SCALE = 96, 120, 4


def pin(fill: str) -> Image.Image:
    s = SCALE
    img = Image.new("RGBA", (W * s, H * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy, r = 48 * s, 46 * s, 40 * s
    # White outline, then the body: a circle with a point at the bottom.
    for grow, colour in ((6 * s, "#FFFFFF"), (0, fill)):
        d.ellipse((cx - r - grow, cy - r - grow, cx + r + grow, cy + r + grow), fill=colour)
        d.polygon([(cx - 26 * s - grow, cy + 30 * s), (cx + 26 * s + grow, cy + 30 * s), (cx, 116 * s + grow // 2)], fill=colour)
    # Cup.
    w = 5 * s
    d.rounded_rectangle((cx - 20 * s, cy - 10 * s, cx + 12 * s, cy + 20 * s), radius=8 * s, outline="#FFFFFF", width=w)
    d.arc((cx + 2 * s, cy - 6 * s, cx + 26 * s, cy + 14 * s), 270, 90, fill="#FFFFFF", width=w)
    for x in (-12, -4, 4):
        d.line((cx + x * s, cy - 26 * s, cx + x * s, cy - 18 * s), fill="#FFFFFF", width=w)
    return img.resize((W, H), Image.LANCZOS)


def main() -> None:
    out = ROOT / "assets" / "pins"
    out.mkdir(parents=True, exist_ok=True)
    pin("#7A5230").save(out / "pin.png")
    pin("#1F2A37").save(out / "pin-selected.png")


if __name__ == "__main__":
    main()
