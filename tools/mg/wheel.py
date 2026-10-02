"""토리의 챗바퀴 (v5.1): 달리는 토리 옆모습 2장. 오른쪽을 봐요.
python3 wheel.py → JS, python3 wheel.py png out.png → 확대 그림"""
import sys
sys.path.insert(0, '../icons')
from pxdraw import G
PAL = {'k': '#3a2a20', 'w': '#fffaf0', 'h': '#e9a25a', 'i': '#c97a36', 'j': '#fbe6c4', 'l': '#f2a9b6', 'n': '#e0788f'}
_TOP = [
 "........................",
 "...............kk.......",
 "..............kllk......",
 "........kkkkkkkllk......",
 "......kkiiiiiiikkk......",
 "....kkiiihhhhhhhhhkk....",
 "...kihhhhhhhhhhhhhhhk...",
 "..kihhhhhhhhhhhhhkkhhk..",
 "..khhhhhhhhhhhhhhkwkhhk.",
 ".kkhhhhhhhhhhhhhhkkkhjk.",
 ".khkhhhhhhhhhhhhhhhhjjnk",
 "..khhhhhhhhhhhjjjjlljjjk",
 "..khhhjjjjjjjjjjjjjjjjk.",
 "...kjjjjjjjjjjjjjjjkkk..",
 "...kkkjjjjjjjjjjkkk....."]
_LEG = [["..kllkk.........kkllk...", ".kllk.............kllk.."],   # 다리 쭉
        [".....kllk....kllk.......", ".....kkk.....kkk........"]]   # 다리 모음
def ham(f):
    r = _TOP + _LEG[f]
    assert all(len(x) == 24 for x in r)
    return r
N = {'hr0': ham(0), 'hr1': ham(1)}
if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'png':
        from PIL import Image, ImageDraw
        Z = 12; img = Image.new('RGB', (2 * 27 * Z, 18 * Z), '#f6e7c1'); d = ImageDraw.Draw(img)
        for n, v in enumerate(N.values()):
            for y, r in enumerate(v):
                for x, c in enumerate(r):
                    if c != '.': d.rectangle([n * 27 * Z + x * Z, y * Z, n * 27 * Z + x * Z + Z - 1, y * Z + Z - 1], fill=PAL[c])
        img.save(sys.argv[2])
    else:
        import json
        print('Object.assign(MGP,' + json.dumps({k: v for k, v in PAL.items() if k not in 'kw'}) + ');')
        print('Object.assign(MGS,' + json.dumps(N) + ');')
