"""Apply the portfolio's Black & Crimson palette to the existing CV PDF.

Keeps the original color scheme and places each skill next to its category.
Text, fonts and hyperlinks remain unchanged.
"""
from pathlib import Path
import os
import tempfile
import fitz

CV = Path(__file__).resolve().parents[1] / 'public/data/curriculos/guilherme-dos-santos-curriculo-pt.pdf'
COLORS = {
    b'0.156862745 0.1294117647 0.1803921568': b'0.0509803922 0.0509803922 0.0588235294',
    b'0.8784313725 0.7647058823 0.6352941176': b'1 0.3294117647 0.4156862745',
    b'0.4431372549 0.2352941176 0.3411764705': b'0.6901960784 0.0901960784 0.1725490196',
    b'0.3843137254 0.3647058823 0.4039215686': b'0.3607843137 0.3607843137 0.3843137255',
    b'0.156862745 0.1450980392 0.1764705882': b'0.1176470588 0.1176470588 0.1294117647',
    b'0.8470588235 0.7882352941 0.8392156862': b'0.8588235294 0.7843137255 0.7960784314',
    b'0.5098039215 0.4862745098 0.525490196': b'0.4901960784 0.4901960784 0.5098039216',
}

with fitz.open(CV) as doc:
    assert len(doc) == 1, 'Expected the existing one-page curriculum.'
    changed = 0
    aligned = 0
    for page in doc:
        for xref in page.get_contents():
            stream = doc.xref_stream(xref)
            updated = stream
            for old, new in COLORS.items():
                changed += updated.count(old)
                updated = updated.replace(old, new)
            # Consistent 13 pt gap after each category, without wide empty columns.
            skill_positions = {
                b'347.239': b'77.61',   # Web
                b'324.239': b'136.54',  # Back-end e dados
                b'301.239': b'158.60',  # Ferramentas e práticas
            }
            for y, target in skill_positions.items():
                matching = [
                    x for x in (b'151.95', b'183.95', target)
                    if updated.count(x + b' ' + y + b' Td') == 1
                ]
                if len(matching) != 1:
                    raise RuntimeError(f'Unexpected skills row at {y!r}: {matching}.')
                current = matching[0]
                if current != target:
                    updated = updated.replace(
                        current + b' ' + y + b' Td',
                        target + b' ' + y + b' Td',
                    )
                    aligned += 1
            if updated != stream:
                doc.update_stream(xref, updated, compress=True)
    if changed or aligned:
        with tempfile.NamedTemporaryFile(suffix='.pdf', dir=CV.parent, delete=False) as temp:
            tmp = Path(temp.name)
        try:
            doc.save(tmp, garbage=4, deflate=True)
            os.replace(tmp, CV)
        finally:
            tmp.unlink(missing_ok=True)
print(f'Updated {changed} color and {aligned} alignment instructions in {CV}')
