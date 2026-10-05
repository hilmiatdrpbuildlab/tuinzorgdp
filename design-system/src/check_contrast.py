"""Check every text and mark pair the token usage notes promise, in every theme.

    python src/check_contrast.py        -> prints a table, exits 1 if a pair misses its floor
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
T = json.loads((ROOT / "tokens.json").read_text(encoding="utf8"))
THEMES = [t["id"] for t in T["color"]["themes"]]
TOK = {t["name"]: t["value"] for t in T["color"]["tokens"]}


def resolve(name, theme):
    v = TOK[name]
    if isinstance(v, dict):
        v = v.get(theme, v.get(THEMES[0]))
    m = re.fullmatch(r"\{(.+)\}", v)
    return resolve(m.group(1), theme) if m else v


def rgba(s):
    if s.startswith("#"):
        h = s[1:]
        return [int(h[i:i + 2], 16) for i in (0, 2, 4)] + [1.0]
    n = [float(x) for x in re.findall(r"[\d.]+", s)]
    return n[:3] + [n[3] if len(n) > 3 else 1.0]


def flat(fg, bg):
    f, b = rgba(fg), rgba(bg)
    a = f[3]
    return [f[i] * a + b[i] * (1 - a) for i in range(3)]


def lum(c):
    c = [x / 255 for x in c]
    c = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def ratio(fg, bg, theme):
    bgc = flat(resolve(bg, theme), resolve("bg", theme))
    fgc = flat(resolve(fg, theme), "#%02x%02x%02x" % tuple(round(x) for x in bgc))
    a, b = sorted([lum(fgc), lum(bgc)], reverse=True)
    return (a + 0.05) / (b + 0.05)


GROUNDS = ["bg", "surface", "surface-sunken"]
# (foreground, grounds, floor, themes or None for all)
PAIRS = [
    ("heading", GROUNDS, 4.5, None),
    ("ink", GROUNDS + ["tint"], 4.5, None),
    ("ink-soft", GROUNDS, 4.5, None),
    ("ink-faint", GROUNDS, 4.5, None),
    ("accent-word", ["bg", "surface"], 4.5, None),
    ("link", ["bg", "surface"], 4.5, None),
    ("line-strong", GROUNDS, 3.0, None),
    ("highlight", GROUNDS + ["tint"], 3.0, None),
    ("focus", GROUNDS, 3.0, None),
    ("accent", ["bg", "surface"], 3.0, None),
    ("on-accent", ["accent", "accent-hover", "accent-press"], 4.5, None),
    ("ink-inverse", ["surface-inverse"], 4.5, None),
    ("success", ["bg", "surface", "success-bg"], 4.5, None),
    ("warning", ["bg", "surface", "warning-bg"], 4.5, None),
    ("danger", ["bg", "surface", "danger-bg"], 4.5, None),
    ("info", ["bg", "surface", "info-bg"], 4.5, None),
    ("ink", ["success-bg", "warning-bg", "danger-bg", "info-bg"], 4.5, None),
]

fails = 0
for fg, grounds, floor, themes in PAIRS:
    for th in themes or THEMES:
        cells = []
        for g in grounds:
            r = ratio(fg, g, th)
            ok = r >= floor
            fails += not ok
            cells.append(f"{g} {r:5.2f}{'' if ok else ' FAIL'}")
        print(f"{th:6} {fg:12} >= {floor}: " + " | ".join(cells))

# The hero: white text over the overlay's darkest stop on a mid-green photo pixel.
print("\nfailing pairs:", fails)
sys.exit(1 if fails else 0)
