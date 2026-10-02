# v5.0: 남은 아이콘 다듬기 (16x16, 색은 index.html PAL) — 젓가락·폭죽·박·원숭이 등
import math as _m
from pxdraw import G
N = {}

g = G()  # 🥢 (나란히 놓인 나무젓가락, 손잡이 쪽 빨간 띠)
g.line(14.2, 1.2, 2.6, 12.8, 'b', .62)
g.line(15.0, 4.2, 5.4, 14.6, 'b', .62)
g.line(14.2, 1.2, 12.0, 3.4, 'r', .62)
g.line(15.0, 4.2, 13.2, 6.0, 'r', .62)
g.halo('k', diag=False)
for y in range(16):
    for x in range(16):
        if g.a[y][x] == 'b' and g.get(x + 1, y) == 'k' and g.get(x, y + 1) == 'k': g.a[y][x] = 'd'
N['chopstk'] = g.rows()

g = G()  # 🎆 (밤하늘에 터진 불꽃)
g.disc(8, 8, 7.6, 'B', 7.6); g.rect(1, 1, 14, 14, 'B'); g.outline('k')
for x, y in [(1, 1), (14, 1), (1, 14), (14, 14)]: g.px(x, y, 'k')
for i in range(8):
    a = _m.radians(i * 45 + 22.5); c, s_ = _m.cos(a), _m.sin(a)
    g.line(7.5 + 2.0 * c, 7.5 + 2.0 * s_, 7.5 + 4.6 * c, 7.5 + 4.6 * s_, 'y' if i % 2 else 'r', .5)
    g.px(int(7.5 + 5.8 * c), int(7.5 + 5.8 * s_), 'Z' if i % 2 else 'p')
g.rect(7, 7, 8, 8, 'h')
for x, y in [(3, 12), (12, 3), (2, 3)]: g.px(x, y, 'U')
N['fireworks'] = g.rows()

g = G()  # 🎊 (박: 반으로 갈라진 공에서 색 띠와 종이가 쏟아짐)
g.disc(8, 7.5, 6.5, 'y')
for y in range(16):
    for x in range(16):
        if y >= 7: g.a[y][x] = '.'
for i, (x0, n) in enumerate([(4, 13), (8, 15), (11, 12)]):
    for y in range(7, n):
        g.px(x0 + ((y + i) // 2) % 2, y, 'rug'[i])
g.halo('k', diag=False)
g.put(7, 0, ['kk'])
for y in range(7):
    if g.a[y][7] in 'yY': g.a[y][7] = 'k'
for x, y in [(4, 3), (5, 2), (10, 2)]: g.px(x, y, 'Z')
for y in range(16):
    for x in range(16):
        if g.a[y][x] == 'y' and y == 6: g.a[y][x] = 'Y'
for x, y, c in [(1, 9, 'p'), (2, 12, 'y'), (14, 9, 'p'), (14, 13, 'u'), (6, 14, 'p'), (10, 14, 'y'), (1, 15, 'g')]:
    if g.a[y][x] == '.': g.px(x, y, c)
N['confetti'] = g.rows()

g = G()  # 🙈 (두 손으로 눈 가린 원숭이)
g.disc(8, 8.5, 6.6, 'd', 6.8)
g.disc(1.8, 8.5, 1.9, 'd'); g.disc(14.2, 8.5, 1.9, 'd')
g.disc(8, 11.6, 4.4, 't', 3.2)
g.halo('k', diag=False)
g.px(1, 8, 'p'); g.px(1, 9, 'p'); g.px(14, 8, 'p'); g.px(14, 9, 'p')
g.put(2, 4, ["_kkkkk__kkkkk", "kbtbtbkkbtbtbk", "kbtbtbkkbtbtbk", "kbbbbbkkbbbbbk", "kbbbbbbkbbbbbbk"[:14], "_kbbbbk__kbbbbk"[:14], "__kkkk____kkkk"])
g.put(6, 11, ["_k_k"])
g.put(6, 13, ["kkkk"]); g.put(7, 14, ["rr"])
N['monkey'] = g.rows()

N['pray'] = [  # 🙏 (손바닥을 마주 댄 두 손, 앞에 엄지, 소매)
 "......kkkk......",
 "..k..kyyYyk..k..",
 "...k.kyyYyk.k...",
 ".....kyyYyk.....",
 "....kyyyYyyk....",
 "....kyyyYyyk....",
 "....kyyyYyyk....",
 "....kyykkyyk....",
 "...kyykyykyyk...",
 "...kyykyYkyyk...",
 "...kyykyYkyyk...",
 "...kyyykkyyyk...",
 "..kkkkkkkkkkkk..",
 "..kuuuuukuuuuk..",
 "..kUUUUUkUUUUk..",
 "..kkkkkkkkkkkk.."]

N['puzzle'] = [  # 🧩 (위·오른쪽 볼록, 왼쪽 오목한 퍼즐 조각)
 "................",
 "......kkkk......",
 ".....kllggk.....",
 ".....klgggk.....",
 ".kkkkkkggGkkkkk.",
 ".kllllgggggggGk.",
 ".klhggggggggggk.",
 ".klgggggggggggkk",
 "..kkgggggggggggk",
 "...kgggggggggggk",
 "..kkggggggggGGGk",
 ".klgggggggggGkkk",
 ".klggggggggggGk.",
 ".kGGGGGGGGGGGGk.",
 ".kkkkkkkkkkkkkk.",
 "................"]

N['ear'] = [  # 👂 (둥근 귓바퀴, 안쪽 주름, 왼쪽 아래 귓불)
 "................",
 ".....kkkkkk.....",
 "...kkyyyyyykk...",
 "..kyyyyyyyyyyk..",
 "..kyyYYYYYYyyyk.",
 ".kyyYOOOOOOYyyk.",
 ".kyyYOyyyyOOYyk.",
 ".kyyYOyYYYyOYyk.",
 "..kyyyyYOYyOYyk.",
 "..kkyyyYOOOOYyk.",
 "...kkkyyYYYYyk..",
 "......kyyyyyk...",
 "....kkyyyyyk....",
 "...kyyyyYkk.....",
 "...kYYYkk.......",
 "....kkk........."]

g = G()  # 💢 (가운데 십자 틈을 두고 꺾인 네 조각)
for sx in (1, -1):
    for sy in (1, -1):
        X = lambda v: 7.5 + sx * v; Y = lambda v: 7.5 + sy * v
        g.line(X(1.9), Y(1.9), X(2.6), Y(5.8), 'r', .75)
        g.line(X(1.9), Y(1.9), X(5.8), Y(2.6), 'r', .75)
g.halo('k', diag=False)
for y in range(16):
    for x in range(16):
        if g.a[y][x] == 'r' and (abs(x - 7.5) < 3 and abs(y - 7.5) < 3): g.a[y][x] = 'R'
N['anger'] = g.rows()

g = G()  # ♨ (온천: 김 세 줄과 물 담긴 탕)
g.disc(8, 12.4, 6.6, 'u', 2.6)
g.halo('k', diag=False)
for y in range(16):
    for x in range(16):
        if g.a[y][x] == 'u' and g.get(x, y - 1) == 'k': g.a[y][x] = 'U'
for x0 in (4, 8, 12):
    for y in range(1, 9):
        g.px(x0 + [0, 0, 1, 1, 0, 0, -1, -1][(y - 1) % 8] - 1, y, 'r')
        g.px(x0 + [0, 0, 1, 1, 0, 0, -1, -1][(y - 1) % 8], y, 'R' if y < 3 else 'r')
N['onsen'] = g.rows()

N['pinch'] = [  # 🤏 (엄지와 검지 끝을 살짝 벌린 손, 옆모습)
 "................",
 "................",
 "..........kkkk..",
 ".....kkkkkyyyyk.",
 "....kyyyyyyyyyyk",
 ".....kkkkkyyyyyk",
 "..........kYyyyk",
 "..........kyyyyk",
 ".....kkkkkkYyyyk",
 "....kyyyyyyyyyyk",
 ".....kkkkkkyyyyk",
 "..........kYyyk.",
 "..........kyyyk.",
 "...........kkk..",
 "................",
 "................"]

for k, v in N.items():
    assert len(v) == 16 and all(len(r) == 16 for r in v), k
