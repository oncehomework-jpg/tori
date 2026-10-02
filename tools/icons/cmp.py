"""옛 아이콘과 새 아이콘 나란히 PNG로: python3 cmp.py icons.json out.png [이름...]"""
import json, sys
from PIL import Image, ImageDraw
import importlib, os; N = importlib.import_module(os.environ.get("MOD", "sp3")).N
d = json.load(open(sys.argv[1])); PAL, SP = d['PAL'], d['SP']
names = sys.argv[3:] or list(N)
import os; Z = int(os.environ.get("Z", 8)); W = 16 * Z
def draw(img, rows, ox, oy):
    dr = ImageDraw.Draw(img)
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            col = PAL.get(c, PAL['k']) if c != '.' else ('#efe6d4' if (x + y) % 2 else '#f7f1e6')
            dr.rectangle([ox + x * Z, oy + y * Z, ox + x * Z + Z - 1, oy + y * Z + Z - 1], fill=col)
cols = 3; cw = W * 2 + 30; ch = W + 26
img = Image.new('RGB', (cols * cw, ((len(names) + cols - 1) // cols) * ch), 'white')
dr = ImageDraw.Draw(img)
for i, n in enumerate(names):
    ox, oy = (i % cols) * cw, (i // cols) * ch
    dr.text((ox + 4, oy + 4), n, fill='black')
    draw(img, SP['q_' + n], ox + 4, oy + 18); draw(img, N[n], ox + W + 14, oy + 18)
img.save(sys.argv[2])
