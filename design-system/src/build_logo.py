"""Build the TuinZorg DP logo SVGs: the hand-and-sprout mark (redrawn from the client's logo)
plus the wordmark set in Bricolage Grotesque 750 and the tagline in Figtree 550, converted to paths.

    python src/build_logo.py   -> assets/logo/*.svg

Interim lockup. Replace with the client's original vector artwork when it is available.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent


def text_path(font_file, axes, text, size, x0, baseline, tracking=0.0):
    f = instantiateVariableFont(TTFont(ROOT / font_file), axes)
    gs, cmap, hmtx = f.getGlyphSet(), f.getBestCmap(), f["hmtx"]
    upm = f["head"].unitsPerEm
    s = size / upm
    pen = SVGPathPen(gs)
    x = x0
    for ch in text:
        g = cmap[ord(ch)]
        tp = TransformPen(pen, (s, 0, 0, -s, x, baseline))
        gs[g].draw(tp)
        x += hmtx[g][0] * s + tracking * size
    return pen.getCommands(), x


# The mark on a 64 x 64 grid: an open hand holding a sprout in a mound of soil.
MARK = """
<g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.2">
  <path class="sprout" d="M32 37V21"/>
  <path class="sprout" d="M32 28c-6.5 0-10.5-4.2-10.5-10.5 6.5 0 10.5 4.2 10.5 10.5z"/>
  <path class="sprout" d="M32 23.5c0-7 4.5-11.5 11.5-11.5 0 7-4.5 11.5-11.5 11.5z"/>
  <path class="hand" d="M22.5 39.5c2.2-3.2 5.8-4.8 9.5-4.8s7.3 1.6 9.5 4.8"/>
  <path class="hand" d="M6 43h6.5v13H6z"/>
  <path class="hand" d="M12.5 45h7.8l6.2 2.2h8.3c1.9 0 3 1.2 3 2.6s-1.1 2.6-3 2.6H25.5"/>
  <path class="hand" d="M12.5 54.5h18.8c2.6 0 5-.8 7.1-2.3l12.8-9.3c1.4-1 1.6-2.9.5-4.1-1-1-2.6-1.2-3.8-.4L38.6 44.6"/>
</g>"""

FILES = [
    ("tz-logo.svg", "#224620", "#3d9141", "#224620", "#4d5a4f", "Primary, on Light and Sand: forest-800 hand and words, leaf-600 sprout."),
    ("tz-logo-on-dark.svg", "#f4f7f4", "#6cc570", "#f4f7f4", "#c8d8c4", "On Forest grounds and dark photos: sage-50 hand and words, leaf-400 sprout."),
    ("tz-logo-mono-forest.svg", "#224620", "#224620", "#224620", "#224620", "One colour, forest-800: print, stamps, invoices."),
    ("tz-logo-mono-white.svg", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "One colour, white: workwear, van lettering, photo overlays."),
]


def build():
    out = ROOT / "assets" / "logo"
    out.mkdir(parents=True, exist_ok=True)
    word, wx = text_path("fonts/BricolageGrotesque-Variable.woff2", {"wght": 750, "wdth": 92, "opsz": 48}, "TuinZorg DP", 40, 76, 36, -0.02)
    tag, tx = text_path("fonts/Figtree-Variable.woff2", {"wght": 550}, "Tuinonderhoud met passie", 14.5, 77, 57, 0.01)
    w = round(max(wx, tx) + 4)
    for name, hand, sprout, ink, soft, _ in FILES:
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} 64" width="{w}" height="64" role="img" aria-label="TuinZorg DP, tuinonderhoud met passie">'
               f'<style>.hand{{stroke:{hand}}}.sprout{{stroke:{sprout}}}</style>{MARK}'
               f'<path fill="{ink}" d="{word}"/><path fill="{soft}" d="{tag}"/></svg>\n')
        (out / name).write_text(svg, encoding="utf8")
    # The mark alone: a forest-700 rounded square, as on the current logo tile. Favicons, avatars, social.
    mark = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="TuinZorg DP">'
            '<rect width="64" height="64" rx="14" fill="#2d5a27"/><style>.hand{stroke:#f4f7f4}.sprout{stroke:#a6e07a}</style>'
            f'<g transform="translate(4.5 1) scale(.86)">{MARK}</g></svg>\n')
    (out / "tz-mark.svg").write_text(mark, encoding="utf8")
    print("logo width", w)


if __name__ == "__main__":
    build()
