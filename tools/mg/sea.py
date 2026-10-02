"""타코 띄워 주기 깊은 바다 생물 (v5.1). 모두 왼쪽을 봐요(타코 쪽으로 헤엄쳐 옴).
python3 sea.py → JS 한 줄 출력, python3 sea.py png out.png → 확대 그림"""
import sys, math
sys.path.insert(0, '../icons')
from pxdraw import G
# 글자 = 색 (index.html의 MGP에 같은 글자로 추가)
PAL = {'k': '#3a2a20', 'w': '#fffaf0',
       'E': '#ffb08a', 'F': '#f07a4a', 'H': '#c4502e', 'I': '#ffe3d2',   # 새우
       'J': '#9cc46a', 'K': '#6f9a45', 'L': '#4a7030', 'M': '#c9b27a', 'N': '#e6d6a6',  # 자라
       'O': '#ffffff', 'P': '#e9eef2', 'Q': '#c7d0d8', 'S': '#2b2b33', 'T': '#f6c66a',  # 바다토끼
       'U': '#b9c3cc', 'W': '#8e9aa6', 'X': '#66727e', 'Z': '#dde3e8', 'a': '#f2b8c0',  # 물범
       'c': '#7f9cb8', 'e': '#5b7a98', 'f': '#3f5a76', 'g': '#eef3f6', 'm': '#c94a4a'}  # 상어
N = {}

g = G(24, 13)  # 새우: 굽은 몸, 부채꼬리, 긴 더듬이
for i, (x, y, r) in enumerate([(6.5, 5.5, 3.3), (9.5, 5.2, 3.2), (12.4, 5.4, 3.0), (15.0, 6.2, 2.7), (17.2, 7.4, 2.4), (18.8, 8.9, 2.0)]):
    g.disc(x, y, r, 'F' if i % 2 else 'E', r * .92)
g.poly([(18.5, 9), (22.6, 9.5), (22.2, 12.6), (19.4, 12.4)], 'E')
g.poly([(3.6, 4.0), (6, 3.2), (6, 8.2), (3.4, 7.2)], 'E')
g.outline('k')
for x in (9, 12, 15): g.rect(x, 3, x, 6, 'k') if False else None
for x, y in [(8, 3), (11, 3), (14, 4), (16, 5)]: g.px(x, y, 'I'); g.px(x + 1, y, 'I')
for x, y in [(8, 7), (11, 7), (14, 7)]: g.px(x, y, 'H'); g.px(x, y + 1, 'H')
g.px(20, 10, 'F'); g.px(21, 11, 'F')
g.px(5, 4, 'k'); g.px(4, 4, 'k'); g.px(5, 3, 'w')
for i in range(5): g.px(3 - i // 2, 3 - i, 'H') if 3 - i >= 0 else None
for i in range(4): g.px(2 - i // 2, 5 - i // 3, 'H') if False else None
g.line(3.5, 3.5, 0.5, 0.5, 'H', .45); g.line(3.5, 5.5, 0.5, 4.5, 'H', .45)
for x in (8, 10, 12, 14): g.px(x, 9, 'H'); g.px(x - 1, 10, 'H')
N['cSh'] = g.rows()

g = G(30, 15)  # 자라: 등딱지 무늬, 머리, 네 지느러미발
g.ell(18, 7.2, 9.6, 5.2, 0, 'K')
g.ell(4.4, 7.0, 3.6, 2.8, 0, 'J')
g.ell(11.5, 2.6, 4.2, 1.6, -25, 'J'); g.ell(11.5, 12.2, 4.2, 1.6, 25, 'J')
g.ell(26.5, 3.4, 2.6, 1.3, 20, 'J'); g.ell(26.5, 11.2, 2.6, 1.3, -20, 'J')
g.outline('k')
for y in range(15):
    for x in range(30):
        if g.a[y][x] == 'K':
            if (x - 18) ** 2 / 72 + (y - 7.2) ** 2 / 16 > 1: g.a[y][x] = 'L'
            elif (x - 10) % 5 in (1, 2, 3) and (y - 3) % 4 in (1, 2): g.a[y][x] = 'J'
for x in range(10, 27): 
    if g.a[12][x] == 'L' or g.a[12][x] == 'K': g.a[12][x] = 'M'
g.px(3, 6, 'k'); g.px(3, 5, 'w'); g.px(1, 8, 'L'); g.px(2, 8, 'L')
N['cTt'] = g.rows()

g = G(26, 15)  # 바다토끼: 하얀 솜털 몸, 검은 토끼 귀, 등 위 꽃모양 아가미
g.ell(13, 9.0, 11.6, 5.6, 0, 'P')
g.ell(6.5, 3.6, 1.5, 3.0, -15, 'S'); g.ell(11, 3.2, 1.5, 3.0, 12, 'S')
g.disc(20, 4.6, 2.0, 'T', 1.6)
g.outline('k')
for y in range(15):
    for x in range(26):
        c = g.a[y][x]
        if c == 'P':
            if y <= 6: g.a[y][x] = 'O'
            elif y >= 12: g.a[y][x] = 'Q'
            if (x * 7 + y * 5) % 13 == 0 and 3 < x < 24 and y < 13: g.a[y][x] = 'S'
g.px(5, 9, 'k'); g.px(5, 8, 'k'); g.px(9, 9, 'k'); g.px(9, 8, 'k')
g.px(7, 11, 'a'); g.px(3, 10, 'a'); g.px(11, 10, 'a')
g.px(6, 2, 'W'); g.px(11, 1, 'W'); g.px(20, 4, 'O'); g.px(19, 5, 'O')
N['cHr'] = g.rows()

g = G(32, 16)  # 물범: 동글한 머리, 큰 눈, 수염, 점박이, 뒷지느러미
g.ell(15, 9.0, 12.5, 5.6, 0, 'U')
g.disc(6.2, 7.4, 5.2, 'U', 5.0)
g.poly([(26, 7.5), (31.6, 4.6), (31.2, 8.6), (27, 9.6), (31.4, 11.4), (31, 14.2), (25.5, 11.5)], 'W')
g.ell(13.5, 13.5, 3.4, 1.5, 25, 'W')
g.outline('k')
for y in range(16):
    for x in range(32):
        if g.a[y][x] == 'U':
            if y >= 11: g.a[y][x] = 'Z'
            elif y <= 4: g.a[y][x] = 'U'
            if (x * 3 + y * 7) % 13 == 0 and x > 10 and y < 11: g.a[y][x] = 'X'
g.rect(3, 6, 4, 7, 'k'); g.px(3, 6, 'w'); g.rect(8, 6, 9, 7, 'k'); g.px(8, 6, 'w')
g.px(5, 9, 'k'); g.px(6, 9, 'k'); g.px(5, 10, 'k')
g.px(2, 9, 'a'); g.px(10, 9, 'a')
g.px(0, 9, 'X'); g.px(1, 10, 'X') ; g.px(11, 10, 'X'); g.px(12, 9, 'X')
N['cSl'] = g.rows()

g = G(44, 17)  # 상어: 위는 푸른 회색, 배는 흰색, 등지느러미, 꼬리, 아가미, 이빨
g.ell(20, 9.6, 17.5, 5.0, 0, 'c')
g.poly([(3, 9), (8, 6), (8, 12)], 'c')
g.poly([(16, 6), (22, 0.4), (25, 5.5)], 'c')
g.poly([(35, 8.5), (43.6, 1.0), (40.5, 9.4), (43.6, 16.4), (35, 11.5)], 'c')
g.poly([(17, 13), (22, 16.6), (23, 13)], 'e')
g.outline('k')
for y in range(17):
    for x in range(44):
        if g.a[y][x] == 'c':
            if y >= 10 and x < 36: g.a[y][x] = 'g'
            elif y <= 6 or x >= 37: g.a[y][x] = 'e'
for x in range(4, 11): g.a[10][x] = 'k' if g.a[10][x] != '.' else '.'
for x in (5, 7, 9): g.px(x, 11, 'w') if g.a[11][x] == 'g' else None
g.px(4, 10, 'm')
g.rect(8, 7, 9, 7, 'k'); g.px(9, 7, 'w') ; g.px(8, 6, 'f')
for x in (13, 15, 17): g.px(x, 8, 'f'); g.px(x, 9, 'f')
N['cSk'] = g.rows()

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'png':
        from PIL import Image, ImageDraw
        Z = 10; W = sum(len(v[0]) + 3 for v in N.values()) * Z
        img = Image.new('RGB', (W, 18 * Z), '#3aa2cd'); d = ImageDraw.Draw(img); ox = 10
        for v in N.values():
            for y, r in enumerate(v):
                for x, c in enumerate(r):
                    if c != '.': d.rectangle([ox + x * Z, y * Z + 5, ox + x * Z + Z - 1, y * Z + 5 + Z - 1], fill=PAL[c])
            ox += (len(v[0]) + 3) * Z
        img.save(sys.argv[2])
    else:
        import json
        print('Object.assign(MGP,' + json.dumps({k: v for k, v in PAL.items() if k not in 'kw'}) + ');')
        print('Object.assign(MGS,' + json.dumps(N) + ');')
