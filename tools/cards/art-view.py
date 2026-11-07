# Renders art modules big plus at phone size: python3 tools/cards/art-view.py out.png id id ...
import sys, json, subprocess
from PIL import Image, ImageDraw
PAL = ['#000000','#1d2b53','#7e2553','#008751','#ab5236','#5f574f','#c2c3c7','#fff1e8','#ff004d','#ffa300','#ffec27','#00e436','#29adff','#83769c','#ff77a8','#ffccaa']
BG = '#14203f'
out, ids = sys.argv[1], sys.argv[2:]
data = json.loads(subprocess.check_output(['node', 'tools/cards/art-grid.mjs', *ids]))
S = int(__import__('os').environ.get('S', 6)); PH = 180
tiles = []
for id in ids:
    g = data[id]; H, W = len(g), len(g[0])
    im = Image.new('RGB', (W, H), BG)
    for y, row in enumerate(g):
        for x, c in enumerate(row):
            if c >= 0: im.putpixel((x, y), tuple(int(PAL[c][i:i+2], 16) for i in (1, 3, 5)))
    big = im.resize((W * (S * 64 // W), H * (S * 64 // W)), Image.NEAREST)
    small = im.resize((PH, PH * H // W), Image.LANCZOS)
    t = Image.new('RGB', (big.width + PH + 30, big.height + 24), '#dddddd')
    t.paste(big, (0, 24)); t.paste(small, (big.width + 20, 24))
    ImageDraw.Draw(t).text((4, 6), id, fill='black')
    tiles.append(t)
cols = int(__import__('os').environ.get('C', 2))
tw = max(t.width for t in tiles); th = max(t.height for t in tiles)
rows = (len(tiles) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + 10), rows * (th + 10)), '#dddddd')
for i, t in enumerate(tiles): sheet.paste(t, ((i % cols) * (tw + 10), (i // cols) * (th + 10)))
sheet.save(out); print(out, sheet.size)
