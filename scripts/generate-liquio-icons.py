"""Generate static portfolio icons from the approved Liquio icon source.

The approved composition is stored as a compact indexed PNG in the repository.
Outputs are deterministic and committed, so Railway deploys need no Python/Pillow.
"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
assets = root / "public" / "assets"
source = Image.open(assets / "liquio" / "icon-source.png").convert("RGBA")

for size, name in (
    (180, "apple-touch-icon.png"),
    (192, "icon-192.png"),
    (512, "icon-512.png"),
):
    output = assets / name
    source.resize((size, size), Image.Resampling.NEAREST).save(output, optimize=True)
    print(f"{output.relative_to(root)}: {size}x{size}")

# Browser favicons retain the original G identity; mobile homescreen icons stay Liquio.
from io import BytesIO
import cairosvg

svg = (assets / "favicon.svg").read_bytes()
g = Image.open(BytesIO(cairosvg.svg2png(bytestring=svg, output_width=192, output_height=192))).convert("RGBA")
g.resize((32, 32), Image.Resampling.LANCZOS).save(assets / "favicon-32.png", optimize=True)
g.save(root / "public" / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
print("Crimson G browser favicons + Liquio iOS/Android icons generated")
