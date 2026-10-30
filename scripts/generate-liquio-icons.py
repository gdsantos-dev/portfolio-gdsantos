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

# Make the small browser tab icon focus on the hood and eyes rather than
# shrinking the entire body into an illegible 16px silhouette.
head = source.crop((18, 12, 56, 51))
def favicon(size):
    background = Image.new("RGBA", (size, size), "#0d0d0f")
    inner = head.resize((int(size * 0.9), int(size * 0.9)), Image.Resampling.NEAREST)
    background.alpha_composite(inner, ((size - inner.width)//2, (size - inner.height)//2))
    return background.convert("RGB")

favicon(32).save(assets / "favicon-32.png", optimize=True)
favicon(64).save(root / "public" / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
print("PNG/iOS/Android favicons and ICO generated")
