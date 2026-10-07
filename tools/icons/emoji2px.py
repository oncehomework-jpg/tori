"""v8.1: 안드로이드(Noto Color Emoji) 이모지를 16x16 도트 아이콘으로 바꾸기 (앱 색표 PAL로 줄이고 테두리 k).
python3 emoji2px.py 🍊🧚… > out.json      (SP용 {"q_e<코드>": [16줄]} + AL용 {"이모지":"q_e<코드>"})
보기: SHEET=out.png python3 emoji2px.py 🍊🧚…"""
import sys, json, os
from PIL import Image, ImageDraw, ImageFont
PAL = {'k':'#4a3423','w':'#fffaf0','b':'#e8c48c','d':'#a26a37','r':'#d9574a','y':'#f4c542','g':'#6fa845','p':'#f6a8b8','u':'#6aa0dc','o':'#e9893c','s':'#efe0bf',
 'D':'#7a4a25','R':'#ef8b7b','P':'#e0788f','Y':'#d99a2b','U':'#a9ceef','n':'#8c8796','N':'#cdc9d4','m':'#5c5466','v':'#9a6cc8','V':'#cfb0ec','G':'#3f6e2e','l':'#a8d86a',
 'B':'#3e5e9c','h':'#ffffff','O':'#f7b56b','S':'#9c3b33','Z':'#fff0a6','j':'#43a89a','J':'#a6e3d6','q':'#fde2e8','t':'#f3d2a2','i':'#dff0fb','e':'#6b4a8a'}
RGB = {k: tuple(int(v[i:i+2], 16) for i in (1, 3, 5)) for k, v in PAL.items()}
FONT = '/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf'

def near(c):
    r, g, b = c
    return min((k for k in RGB if k != 'k'), key=lambda k: (RGB[k][0]-r)**2*.3 + (RGB[k][1]-g)**2*.59 + (RGB[k][2]-b)**2*.11)

def conv(ch, S=14):
    f = ImageFont.truetype(FONT, 109)
    im = Image.new('RGBA', (136, 128), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((0, 0), ch, font=f, embedded_color=True)
    bb = im.getbbox(); im = im.crop(bb)
    w, h = im.size; sc = S / max(w, h)
    sm = im.resize((max(1, round(w*sc)), max(1, round(h*sc))), Image.LANCZOS)
    g = [['.']*16 for _ in range(16)]
    ox, oy = (16 - sm.width)//2, (16 - sm.height)//2
    for y in range(sm.height):
        for x in range(sm.width):
            r, gg, b, a = sm.getpixel((x, y))
            if a < 110: continue
            # 어두운 칸은 테두리 색으로
            lum = .3*r + .59*gg + .11*b
            g[oy+y][ox+x] = 'k' if lum < 55 else near((r, gg, b))
    # 바깥 테두리 한 가지 색
    out = [row[:] for row in g]
    for y in range(16):
        for x in range(16):
            if g[y][x] == '.' and any(0 <= x+a < 16 and 0 <= y+b < 16 and g[y+b][x+a] not in '.' for a, b in ((1,0),(-1,0),(0,1),(0,-1))):
                out[y][x] = 'k'
    return [''.join(r) for r in out]

if __name__ == '__main__':
    chars = [c for c in sys.argv[1] if c not in '️ '] if len(sys.argv) > 1 else []
    sp, al = {}, {}
    for c in chars:
        k = 'q_e%x' % ord(c); sp[k] = conv(c); al[c] = k
    if os.environ.get('SHEET'):
        Z = 6; n = len(sp); cols = 10
        o = Image.new('RGB', (cols*(16*Z+8), ((n+cols-1)//cols)*(16*Z+8)), '#fff6e4')
        for i, rows in enumerate(sp.values()):
            for y, r in enumerate(rows):
                for x, ch in enumerate(r):
                    if ch != '.':
                        for a in range(Z):
                            for b in range(Z): o.putpixel(((i % cols)*(16*Z+8)+x*Z+a, (i//cols)*(16*Z+8)+y*Z+b), RGB[ch])
        o.save(os.environ['SHEET'])
    print(json.dumps({'SP': sp, 'AL': al}, ensure_ascii=False))
