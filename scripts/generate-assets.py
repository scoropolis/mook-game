from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parents[1] / "assets"
OUT.mkdir(parents=True, exist_ok=True)
DARK = "#070a0d"
GREEN = "#39e071"
INK = "#071109"


def font(size: int):
    candidates = [
        "/System/Library/Fonts/SFNSRounded.ttf",
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            pass
    return ImageFont.load_default()


def centered(draw, box, text, text_font, fill):
    bounds = draw.textbbox((0, 0), text, font=text_font)
    width, height = bounds[2] - bounds[0], bounds[3] - bounds[1]
    x = box[0] + (box[2] - box[0] - width) / 2
    y = box[1] + (box[3] - box[1] - height) / 2 - bounds[1]
    draw.text((x, y), text, font=text_font, fill=fill)


icon = Image.new("RGB", (1024, 1024), GREEN)
d = ImageDraw.Draw(icon)
d.rounded_rectangle((154, 154, 870, 870), radius=190, fill="#46ea7c")
centered(d, (154, 132, 870, 870), "M", font(530), INK)
icon.save(OUT / "icon-only.png", quality=100)

for name, background in (("splash.png", DARK), ("splash-dark.png", DARK)):
    image = Image.new("RGB", (2732, 2732), background)
    draw = ImageDraw.Draw(image)
    box = (966, 906, 1766, 1706)
    draw.rounded_rectangle(box, radius=220, fill=GREEN)
    centered(draw, (966, 865, 1766, 1706), "M", font(570), INK)
    centered(draw, (600, 1770, 2132, 1970), "MOOK", font(150), "#f5f7f4")
    image.save(OUT / name, quality=100)

print(f"Generated assets in {OUT}")
