"""Draws a simple, original cover image for each cafe in src/data/cafes.json (no stock photos)."""
import json
import pathlib
import random

from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
W, H, SCALE = 800, 500, 2

# Warm, muted pairs: wall colour and table colour.
PALETTE = [
    ("#E9DFD1", "#7A5230"), ("#D8E2DC", "#5B4636"), ("#F1E4C9", "#8C5A3C"), ("#D9D3E0", "#6B4E3D"),
    ("#E5D5C5", "#4E3A2C"), ("#DCE6EC", "#7A5230"), ("#EFE8DC", "#A0673C"), ("#E1D8C6", "#3F3127"),
]
CUPS = ["#F7F6F3", "#1F2A37", "#B5522B", "#2F7D4F", "#F7F6F3", "#2B5C8A"]


def cover(index: int, seed: str) -> Image.Image:
    rnd = random.Random(seed)
    wall, table = PALETTE[index % len(PALETTE)]
    img = Image.new("RGB", (W * SCALE, H * SCALE), wall)
    d = ImageDraw.Draw(img)
    s = SCALE

    # Window or shelf on the wall.
    if index % 2 == 0:
        x = rnd.randint(60, 420) * s
        d.rounded_rectangle((x, 60 * s, x + 260 * s, 250 * s), radius=18 * s, fill="#FFFFFF")
        d.line((x + 130 * s, 60 * s, x + 130 * s, 250 * s), fill=wall, width=8 * s)
        d.line((x, 155 * s, x + 260 * s, 155 * s), fill=wall, width=8 * s)
    else:
        y = rnd.randint(90, 160) * s
        d.rectangle((70 * s, y, 730 * s, y + 10 * s), fill=table)
        for i in range(rnd.randint(4, 7)):
            bx = (90 + i * 85 + rnd.randint(-10, 10)) * s
            bh = rnd.randint(40, 70) * s
            d.rounded_rectangle((bx, y - bh, bx + 34 * s, y), radius=6 * s, fill=rnd.choice(["#7A5230", "#2B5C8A", "#B5522B", "#3F6B5C", "#1F2A37"]))

    # Table top.
    d.rectangle((0, 360 * s, W * s, H * s), fill=table)
    d.rectangle((0, 352 * s, W * s, 362 * s), fill="#00000022")

    # Cup with saucer and steam.
    cx = rnd.randint(300, 500) * s
    cup = CUPS[index % len(CUPS)]
    d.ellipse((cx - 120 * s, 340 * s, cx + 120 * s, 380 * s), fill="#F7F6F3")
    d.rounded_rectangle((cx - 70 * s, 250 * s, cx + 70 * s, 360 * s), radius=26 * s, fill=cup)
    d.ellipse((cx + 50 * s, 270 * s, cx + 110 * s, 330 * s), outline=cup, width=14 * s)
    d.ellipse((cx - 66 * s, 244 * s, cx + 66 * s, 266 * s), fill="#5A3A22")
    for i in (-28, 0, 28):
        sx = cx + i * s
        d.arc((sx - 18 * s, 170 * s, sx + 18 * s, 215 * s), 270, 90, fill="#FFFFFF", width=6 * s)
        d.arc((sx - 18 * s, 205 * s, sx + 18 * s, 245 * s), 90, 270, fill="#FFFFFF", width=6 * s)

    return img.resize((W, H), Image.LANCZOS)


def main() -> None:
    cafes = json.loads((ROOT / "src" / "data" / "cafes.json").read_text(encoding="utf-8"))
    out = ROOT / "assets" / "cafes"
    out.mkdir(parents=True, exist_ok=True)
    for index, cafe in enumerate(cafes):
        cover(index, cafe["id"]).save(out / cafe["image"], "JPEG", quality=84, optimize=True, progressive=True)


if __name__ == "__main__":
    main()
