"""v8.1 보드게임 '사라진 도토리 사건' 그림 원본.
python3 tools/mg/mystery_art.py [보기폴더]  → index.html 의 MY_IMG 에 넣을 JSON(작은 PNG data URI) 출력,
보기폴더를 주면 8배로 키운 PNG도 저장해요(눈으로 확인용).
- 용의자 초상화 40x40: dochi(도치)·squi(다람이)·owl(부엉 박사)·cat(나비)  (타코는 앱의 TAKO 그림을 그대로 씀)
- 장소 배경 128x72: room(토리의 방)·wheel(챗바퀴 놀이터)·forest(도토리 숲)·sea(바닷가)·stage(무대)·kitchen(부엌)
- 물건 24x24: basket(바구니)·rod(낚싯대)·umb(우산)·pail(양동이)·mag(자석), 황금 도토리 gold
그리는 요령(사용자 요청: 잘 그린 도트): 같은 칸 크기, 색 묶음(ramp)으로 명암, 빛은 늘 왼쪽 위, 바깥 테두리는 한 가지 색."""
import base64, io, json, math, os, sys
from PIL import Image

OL = '#3b2417'          # 바깥 테두리(진한 밤색)
BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
LV = (-0.52, -0.62, 0.59)  # 왼쪽 위 앞에서 오는 빛


def hx(c):
    c = c.lstrip('#'); return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


class C:
    def __init__(s, W, H):
        s.W, s.H = W, H; s.a = [[None] * W for _ in range(H)]

    def px(s, x, y, c):
        x, y = int(x), int(y)
        if 0 <= x < s.W and 0 <= y < s.H: s.a[y][x] = c

    def get(s, x, y):
        return s.a[y][x] if 0 <= x < s.W and 0 <= y < s.H else None

    def rect(s, x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): s.px(x, y, c)

    def shade(s, ramp, l, x, y, dith=True):
        """빛 세기 l(0~1)을 색 묶음 칸으로. 경계는 4x4 바이어 무늬로 살짝 섞음"""
        n = len(ramp); v = max(0, min(.999, l)) * n
        i = int(v); f = v - i
        if dith and f > .78 and i < n - 1 and BAYER[y % 4][x % 4] < 5: i += 1
        return ramp[i]

    def ball(s, cx, cy, rx, ry, ramp, cut=None, gain=1.0, bias=0.0, dith=True):
        """동그란 덩어리: 공처럼 왼쪽 위가 밝게"""
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                nx, ny = (x + .5 - cx) / rx, (y + .5 - cy) / ry; d = nx * nx + ny * ny
                if d > 1 or (cut and cut(x, y)): continue
                nz = math.sqrt(1 - d); l = (nx * LV[0] + ny * LV[1] + nz * LV[2]) * gain + bias
                s.px(x, y, s.shade(ramp, l * .5 + .5, x, y, dith))

    def poly(s, pts, col, ramp=None, cx=None, cy=None, r=None):
        ys = [p[1] for p in pts]
        for y in range(int(min(ys)), int(max(ys)) + 1):
            xs = []; yy = y + .5
            for i in range(len(pts)):
                (x0, y0), (x1, y1) = pts[i], pts[(i + 1) % len(pts)]
                if (y0 <= yy < y1) or (y1 <= yy < y0): xs.append(x0 + (yy - y0) * (x1 - x0) / (y1 - y0))
            xs.sort()
            for k in range(0, len(xs) - 1, 2):
                for x in range(int(math.ceil(xs[k] - .5)), int(math.ceil(xs[k + 1] - .5))):
                    if ramp:
                        nx, ny = (x + .5 - cx) / r, (y + .5 - cy) / r; d = min(1, nx * nx + ny * ny)
                        l = nx * LV[0] + ny * LV[1] + math.sqrt(1 - d) * LV[2]
                        s.px(x, y, s.shade(ramp, l * .5 + .5, x, y))
                    else: s.px(x, y, col)

    def line(s, x0, y0, x1, y1, c, w=1):
        n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
        for i in range(n + 1):
            t = i / max(1, n); x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            for dx in range(w):
                for dy in range(w): s.px(round(x - .5) + dx, round(y - .5) + dy, c)

    def put(s, x0, y0, rows, pal):
        for j, row in enumerate(rows):
            for i, ch in enumerate(row):
                if ch != '.': s.px(x0 + i, y0 + j, pal[ch])

    def outline(s, c=OL, diag=False):
        pts = []
        nb = ((1, 0), (-1, 0), (0, 1), (0, -1)) + (((1, 1), (-1, 1), (1, -1), (-1, -1)) if diag else ())
        for y in range(s.H):
            for x in range(s.W):
                if s.a[y][x] is None and any(s.get(x + dx, y + dy) not in (None, c) for dx, dy in nb): pts.append((x, y))
        for x, y in pts: s.a[y][x] = c

    def under(s, other, ox=0, oy=0):
        """다른 그림을 아래에 깔기(빈칸만 채움)"""
        for y in range(other.H):
            for x in range(other.W):
                if other.a[y][x] and s.get(x + ox, y + oy) is None: s.px(x + ox, y + oy, other.a[y][x])

    def over(s, other, ox=0, oy=0):
        for y in range(other.H):
            for x in range(other.W):
                if other.a[y][x]: s.px(x + ox, y + oy, other.a[y][x])

    def img(s):
        im = Image.new('RGBA', (s.W, s.H), (0, 0, 0, 0))
        for y in range(s.H):
            for x in range(s.W):
                if s.a[y][x]: im.putpixel((x, y), hx(s.a[y][x]) + (255,))
        return im


def eye(c, x, y, big=True, col='#24160f', hl='#ffffff'):
    """큰 눈 3x4(빛 두 점)"""
    if big:
        c.put(x, y, [".kk.", "kwkk", "kkkk", "kkhk", ".kk."], {'k': col, 'w': hl, 'h': '#5a4a6a'})
    else:
        c.put(x, y, ["kk", "wk", "kk"], {'k': col, 'w': hl})


# ───────────── 용의자 ─────────────
def squirrel():
    """다람이: 주황 다람쥐. 뒤로 크게 말린 꼬리, 귀 끝 털, 크림 볼·배, 큰 앞니 하나"""
    F = ['#6e3218', '#9c4a24', '#c86a32', '#e48d48', '#f5b56c']
    TL = ['#8a4a20', '#c0702e', '#e69444', '#f6b860', '#ffdc96']
    CR = ['#c79a6c', '#e6c79a', '#fbe8c6']
    c = C(40, 40)
    # 꼬리(뒤): 큰 S자 털 덩어리를 공 여러 개로 쌓음
    t = C(40, 40)
    for (x, y, r) in [(31, 34, 7), (33, 27, 7), (33, 19, 7.5), (31, 11, 7), (26, 6.5, 5.2)]:
        t.ball(x, y, r, r, TL, bias=.05)
    for (x, y) in [(36, 23), (37, 16), (35, 31), (33, 9), (29, 5)]:   # 꼬리 털결(짙은 선 + 밝은 결)
        t.line(x - 3, y - 2, x, y + 1, TL[1]); t.line(x - 5, y - 4, x - 3, y - 2, TL[4])
    t.outline()
    # 몸(어깨)
    c.ball(19, 40, 13, 10, F)
    c.ball(19, 41, 7, 8, CR, bias=.1)               # 크림 배
    # 귀(머리 뒤)
    for sx in (-1, 1):
        ex = 19 + sx * 8
        c.poly([(ex - 3, 11), (ex + sx * 1, 2), (ex + 3, 11)], None, F, ex, 7, 5)
        c.line(ex + sx * 1, 2, ex + sx * 1, 1, F[1])  # 귀 끝 털
        c.px(ex + sx * 2, 1, F[1]); c.px(ex, 1, F[1])
        c.poly([(ex - 1, 10), (ex + sx * .5, 4), (ex + 1.5, 10)], '#e99a8e')
    # 머리
    c.ball(19, 18, 12, 10.5, F)
    # 얼굴 크림(볼·입)
    c.ball(12.5, 22.5, 5, 4.2, CR, bias=.15)
    c.ball(25.5, 22.5, 5, 4.2, CR, bias=.15)
    c.ball(19, 24, 4.5, 3.5, CR, bias=.2)
    # 이마 줄무늬
    c.line(19, 9, 19, 13, F[1]); c.line(17, 10, 17, 12, F[1]); c.line(21, 10, 21, 12, F[1])
    eye(c, 11, 15); eye(c, 24, 15)
    c.put(10, 14, ["kk"], {'k': F[0]}); c.put(27, 14, ["kk"], {'k': F[0]})   # 눈썹 끝
    c.put(18, 21, ["kkk", ".k."], {'k': '#3a2016'})                             # 코
    c.put(17, 23, ["k...k", ".kkk."], {'k': '#3a2016'})                         # 입
    c.put(18, 24, ["ww"], {'w': '#ffffff'})                                      # 앞니
    for x, y in [(8, 22), (9, 22), (28, 22), (29, 22), (8, 23), (29, 23)]: c.px(x, y, '#f39a8c')
    # 작은 손에 도토리 껍데기? → 배 앞 두 손
    c.ball(14, 33, 2.6, 2, F, bias=.2); c.ball(24, 33, 2.6, 2, F, bias=.2)
    c.outline()
    c.under(t)
    return c


def owl():
    """부엉 박사: 밤색 부엉이. 하트 모양 얼굴판, 귀깃, 동그란 금테 안경, 노란 부리, 가슴 깃 무늬, 작은 나비넥타이"""
    B = ['#4a2c1c', '#6e4428', '#93623a', '#b8854e', '#d8ac70']
    FD = ['#c9a678', '#e4c89a', '#f6e4c0']
    c = C(40, 40)
    c.ball(20, 39, 15, 12, B)                          # 몸
    c.ball(20, 41, 8.5, 9, FD, bias=.05)                # 가슴
    for y in range(32, 40, 3):                          # 가슴 깃 V무늬
        for x in range(14 + (y // 3) % 2 * 2, 27, 4): c.put(x, y, ["k.k", ".k."], {'k': '#a77d4e'})
    c.ball(20, 19, 14, 12, B)                           # 머리
    for sx in (-1, 1):                                  # 귀깃
        ex = 20 + sx * 10
        c.poly([(ex - 3.5, 12), (ex + sx * 3, 2), (ex + 3.5, 11)], None, B, ex, 6, 5)
        c.line(ex + sx * 2, 4, ex + sx * 1, 8, B[1])
    # 얼굴판(두 동그라미가 맞붙은 하트)
    c.ball(14, 20, 6.5, 6.8, FD, bias=.1); c.ball(26, 20, 6.5, 6.8, FD, bias=.1)
    c.line(20, 12, 20, 16, B[2])
    # 안경(금테 원 두 개 + 다리)
    G = '#e0a830'; GD = '#a8741c'
    for ex in (14, 26):
        for a in range(0, 360, 6):
            r = 5.2; x = ex + r * math.cos(math.radians(a)); y = 20 + r * math.sin(math.radians(a))
            c.px(round(x - .5), round(y - .5), G if (a > 170 and a < 330) else GD)
    c.rect(19, 19, 21, 19, G)
    # 눈(크고 동그란 주황 눈동자)
    for ex in (12, 24):
        c.put(ex - 1, 17, [".ooo.", "owkko", "okkko", "okkko", ".ooo."], {'o': '#f09a28', 'w': '#ffffff', 'k': '#24160f'})
    c.put(18, 23, ["kyyk", ".yY.", ".kk."], {'k': '#7a4a10', 'y': '#f4c040', 'Y': '#d89820'})  # 부리
    # 나비넥타이
    c.put(16, 29, ["rr...rr", "rRrkrRr", "rrRkRrr", "rr...rr"], {'r': '#3f7ac2', 'R': '#6aa0e0', 'k': '#24508a'})
    # 날개 끝(양옆 어깨)
    c.poly([(5, 30), (9, 27), (10, 40), (4, 40)], None, B, 7, 32, 6)
    c.poly([(35, 30), (31, 27), (30, 40), (36, 40)], None, B, 33, 32, 6)
    c.outline()
    return c


def cat():
    """나비: 회색 줄무늬 고양이. 흰 입·가슴, 초록 눈, 분홍 코, 수염, 이마 M 무늬, 빨간 방울 목걸이"""
    G = ['#3e4252', '#5a6074', '#7d8498', '#a3aabb', '#c8cdd8']
    W = ['#bfc4d0', '#e2e5ec', '#ffffff']
    S = '#40444f'
    c = C(40, 40)
    c.ball(20, 39, 13, 10, G)
    c.ball(20, 40, 7, 8, W, bias=.1)
    for sx in (-1, 1):                                  # 뾰족 귀
        ex = 20 + sx * 8.5
        c.poly([(ex - 4.5, 13), (ex + sx * 2, 1), (ex + 4.5, 12)], None, G, ex, 7, 6)
        c.poly([(ex - 2, 12), (ex + sx * 1.5, 5), (ex + 2.5, 12)], '#f2a6b4')
    c.ball(20, 19, 13, 11, G)
    # 이마 M 줄무늬, 볼 줄무늬
    c.put(15, 9, ["k.k.k.k.k", "k.k.k.k.k", "..k...k.."], {'k': S})
    for y in (19, 22):
        c.line(7, y, 10, y + 1, S); c.line(30, y + 1, 33, y, S)
    # 흰 입 주변
    c.ball(16.5, 24.5, 4.6, 3.6, W, bias=.2); c.ball(23.5, 24.5, 4.6, 3.6, W, bias=.2)
    c.ball(20, 27, 3.5, 2, W, bias=.2)
    # 초록 눈(세로 동공)
    for ex in (11, 24):
        c.put(ex, 16, [".kkk.", "kgwgk", "kGkgk", "kGkGk", ".kkk."], {'k': '#24160f', 'g': '#7cc85a', 'G': '#4c9a3c', 'w': '#ffffff'})
    c.put(18, 22, ["kppk", ".kk."], {'k': '#a04a5a', 'p': '#f48aa0'})       # 코
    c.put(17, 24, ["..k..", "kk.kk"], {'k': '#4a3036'})                      # 입 ω
    for x, y in [(9, 22), (10, 22), (30, 22), (31, 22)]: c.px(x, y, '#f39aa8')
    # 빨간 목걸이 + 금 방울
    c.rect(10, 30, 30, 31, '#d64a42'); c.rect(10, 31, 30, 31, '#a8302c')
    c.ball(20, 33.5, 2.6, 2.6, ['#a8741c', '#e0a830', '#ffe070'])
    c.px(20, 35, '#6a4a10')
    c.outline()
    for y, d in ((23, -1), (25, 1)):                                        # 수염(테두리 뒤에 그림)
        for x in range(1, 10):
            yy = round(y + d * (9 - x) / 8)
            c.px(x, yy, '#ffffff' if c.get(x, yy) not in (None, OL) and x > 6 else '#7d8498')
        for x in range(30, 39):
            yy = round(y + d * (x - 30) / 8)
            c.px(x, yy, '#ffffff' if c.get(x, yy) not in (None, OL) and x < 33 else '#7d8498')
    return c


def dochi():
    """도치: 허세 승부사 고슴도치 '가시 대장'. 뒤로 누운 톱니 가시(밝은 끝)로 된 머리, 아래로 갈수록 좁아지는 크림 얼굴과 뾰족한 주둥이, 작은 귀, 한쪽 눈썹 올린 씩 웃음"""
    Q = ['#24170f', '#3e2a1b', '#5c3f2a', '#7c5a40', '#a8835f']
    QT = ['#d9c09a', '#f2e2c4']
    FC = ['#c49a70', '#e2c094', '#f8e4c2']
    c = C(40, 40)
    q = C(40, 40)
    cx, cy, rx, ry = 20, 20, 12, 10.5
    # 큰 가시 11개: 동그란 머리 둘레에서 바깥으로 뻗고, 위 가시는 살짝 바깥쪽으로 기움. 아래쪽(어깨) 가시부터 그려 위 가시가 앞에 오게
    ang = [158, 182, 204, 224, 243, 261, 279, 297, 316, 336, 0, 22]
    order = sorted(range(len(ang)), key=lambda i: -math.sin(math.radians(ang[i])))
    for i in order:
        a = math.radians(ang[i]); side = math.cos(a)
        lean = .22 * side
        w = .3
        b0 = (cx + rx * math.cos(a - w), cy + ry * math.sin(a - w))
        b1 = (cx + rx * math.cos(a + w), cy + ry * math.sin(a + w))
        L = 7 if math.sin(a) < -.3 else 7.5
        tp = (cx + (rx + L) * math.cos(a + lean), cy + (ry + L) * math.sin(a + lean))
        mid = ((b0[0] + b1[0]) / 2, (b0[1] + b1[1]) / 2)
        sp = C(40, 40); sp.poly([b0, tp, b1], Q[2])
        ax, ay = tp[0] - mid[0], tp[1] - mid[1]; al = math.hypot(ax, ay)
        for y in range(40):
            for x in range(40):
                if sp.a[y][x] is None: continue
                vx, vy = x + .5 - mid[0], y + .5 - mid[1]
                along = (vx * ax + vy * ay) / al / al
                cross = (vx * ay - vy * ax) / al            # 축 왼쪽(-)/오른쪽(+)
                lit = -cross * .5 + (-ax * .02 - ay * .02)
                col = Q[3] if lit > .6 else Q[2] if lit > -.6 else Q[1]
                if along > .62: col = QT[1] if along > .8 else QT[0]
                sp.a[y][x] = col
        sp.outline(Q[0])
        q.over(sp)
    q.ball(cx, cy, rx + .5, ry + .5, [Q[1], Q[2], Q[2], Q[3]], gain=.9)
    q.outline()
    # 몸
    c.ball(20, 40, 12.5, 9, Q[1:])
    c.ball(20, 39.5, 8.5, 8, FC, bias=.15)
    for x in (13, 26): c.ball(x, 35, 2.4, 2, ['#9a7048', '#c89a6c', '#e4bc8c'], bias=.2)   # 작은 손
    # 얼굴: 눈 쪽은 넓고, 앞으로 쏙 나온 주둥이
    face = C(40, 40)
    face.ball(20, 21.5, 8, 6.5, FC, bias=.1)
    face.ball(20, 27, 4.6, 3.6, FC, bias=.25)
    c.over(face)
    for sx in (-1, 1):                                     # 작은 귀(가시 사이로 쏙)
        c.ball(20 + sx * 8.5, 15.5, 2.6, 2.4, ['#9a7048', '#c89a6c', '#e4bc8c'])
        c.px(20 + sx * 8.5 - .5, 16, '#e9988a')
    eye(c, 13, 19); eye(c, 23, 19)
    c.put(12, 17, ["kkk"], {'k': '#2a1c14'}); c.put(23, 16, [".kkk", "k..."], {'k': '#2a1c14'})   # 한쪽 눈썹 올림
    c.put(18, 24, [".kkk.", "kkwkk", ".kkk."], {'k': '#1a100c', 'w': '#8a7a7a'})     # 까만 코
    c.put(19, 28, ["k...", ".kkk", "....k"], {'k': '#3a2016'})                         # 씩 웃는 입
    c.put(20, 29, ["w"], {'w': '#ffffff'})
    for x, y in [(11, 24), (12, 24), (27, 24), (28, 24)]: c.px(x, y, '#f39a8c')
    c.outline()
    c.under(q)
    return c


# ───────────── 물건 24x24 ─────────────
def basket():
    c = C(24, 24); WB = ['#7a4a22', '#a86a34', '#cf9050', '#e8b470']
    for a in range(0, 181, 4):                       # 손잡이
        x = 12 + 8 * math.cos(math.radians(a)); y = 11 - 8 * math.sin(math.radians(a))
        c.px(round(x - .5), round(y - .5), WB[2] if a > 90 else WB[1]); c.px(round(x - .5), round(y + .5), WB[0])
    c.poly([(2, 11), (22, 11), (19, 22), (5, 22)], WB[2])
    for y in range(11, 23):                          # 엮은 무늬
        for x in range(2, 23):
            if c.get(x, y):
                k = ((x // 3) + (y // 2)) % 2
                c.px(x, y, WB[3] if k and (x + y) % 3 else WB[1] if not k else WB[2])
    c.rect(2, 11, 21, 12, WB[3]); c.rect(3, 12, 21, 12, WB[1])
    c.put(5, 7, ["rr", "rR"], {'r': '#d84a40', 'R': '#a83030'})   # 빨간 천 끝
    c.outline(); return c


def rod():
    c = C(24, 24)
    c.line(3, 22, 19, 3, '#9a6a3a'); c.line(4, 22, 20, 3, '#c89458'); c.line(5, 22, 20, 4, '#7a4a22')
    c.rect(2, 19, 5, 22, '#3f6ab0'); c.px(2, 19, '#6a9ad8'); c.px(3, 19, '#6a9ad8')   # 손잡이
    c.ball(8, 17, 2.6, 2.6, ['#888c98', '#c0c4cc', '#f0f2f6'])                       # 릴
    for t in range(0, 18):                                                        # 줄
        c.px(20 + t // 6, 4 + t, '#e8ecf4')
    c.put(21, 18, [".r.", "rwr", ".r."], {'r': '#e04a40', 'w': '#ffffff'})        # 찌
    c.outline(); return c


def umb():
    c = C(24, 24); R = ['#8a2a2a', '#c23e3a', '#e8605a', '#f8908a']
    c.ball(12, 12, 10.5, 9, R, cut=lambda x, y: y > 11, bias=-.12)
    for x in range(1, 23):
        if c.get(x, 11): c.px(x, 11, R[0] if (x - 1) % 7 < 5 else None)
    for x0 in (1, 8, 15):                            # 아래 물결
        for i in range(7):
            if c.get(x0 + i, 10) and i in (0, 6): c.px(x0 + i, 11, None)
    for x in (8, 15): c.line(12, 3, x, 10, R[1])
    c.rect(11, 1, 12, 2, '#3b2417')
    c.line(12, 11, 12, 20, '#5a4a40'); c.line(13, 11, 13, 20, '#8a7a70')
    c.put(9, 19, ["k...", "k...", ".kkk"], {'k': '#5a3a24'}); c.put(12, 20, ["k", "."], {'k': '#5a3a24'})
    c.outline(); return c


def pail():
    c = C(24, 24); B = ['#2a5a9a', '#3f7ac2', '#6aa0e0', '#a0c8f0']
    for a in range(0, 181, 4):
        x = 12 + 8.5 * math.cos(math.radians(a)); y = 9 - 6 * math.sin(math.radians(a))
        c.px(round(x - .5), round(y - .5), '#8a8e98')
    c.poly([(3, 9), (21, 9), (18, 22), (6, 22)], None, B, 9, 13, 11)
    c.rect(3, 8, 20, 9, B[3]); c.rect(4, 9, 20, 9, B[1])
    c.ball(12, 8.5, 7.5, 1.4, ['#3a8ab8', '#6ac0e0'])   # 물
    c.rect(6, 15, 17, 16, '#f0d050'); c.rect(6, 16, 17, 16, '#c8a030')   # 노란 띠
    c.put(9, 17, ["w", "ww"], {'w': '#e8f4ff'})
    c.outline(); return c


def mag():
    c = C(24, 24)
    for a in range(0, 181, 2):   # 말굽(빨강)
        for r in range(4, 9):
            x = 12 + r * math.cos(math.radians(a)); y = 11 - r * math.sin(math.radians(a))
            l = -math.cos(math.radians(a)) * .5 + (8 - r) * .08
            c.px(round(x - .5), round(y - .5), '#f0807a' if l > .45 else '#d84a40' if l > -.2 else '#a83030')
    c.rect(4, 11, 8, 16, '#d84a40'); c.rect(16, 11, 20, 16, '#a83030'); c.rect(4, 11, 5, 16, '#f0807a')
    c.rect(4, 17, 8, 21, '#c8ccd6'); c.rect(16, 17, 20, 21, '#a0a6b4'); c.rect(4, 17, 5, 21, '#f0f2f8')
    c.outline()
    for x, y in [(1, 23), (2, 22), (0, 21), (23, 23), (22, 22), (23, 21)]: c.px(x, y, '#f0c030')
    return c


def gold():
    """황금 도토리"""
    c = C(24, 24)
    c.ball(12, 15, 7, 7.5, ['#a86a10', '#d89a20', '#f4c840', '#fff0a0'], bias=.05)
    c.ball(12, 8.5, 8.5, 4, ['#6a4020', '#8e5a2c', '#b07a40', '#d0a060'], cut=lambda x, y: y > 10)
    for x in range(5, 20, 2): c.px(x, 8, '#6a4020'); c.px(x + 1, 6, '#6a4020')
    c.rect(11, 2, 12, 4, '#6a4020'); c.px(12, 2, '#8e5a2c')
    c.put(8, 13, ["w.", "ww"], {'w': '#ffffff'})
    c.outline(); return c


SUS = {}   # v8.3: 부엉박사·냐옹이도 전신 이모지(q_owl·q_cat, tools/icons/sp6.py)로 바꿈. owl()·cat() 얼굴 그림은 남겨 둠   # v8.1: 도치는 앱의 전신 이모지 q_dochi, 다람쥐 호두는 전신 이모지 q_squi(tools/icons/sp6.py)로 바꿈(사용자 요청). dochi()·squirrel() 그림은 남겨 둠
ITEMS = {'basket': basket, 'rod': rod, 'umb': umb, 'pail': pail, 'mag': mag, 'gold': gold}


def uri(im):
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()


def build(only=None):
    out = {}
    import mystery_bg
    for d in (SUS, ITEMS, mystery_bg.BG):
        for k, f in d.items():
            if only and k not in only: continue
            r = f(); out[k] = r if isinstance(r, Image.Image) else r.img()
    return out


if __name__ == '__main__':
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    only = os.environ.get('ONLY', '').split(',') if os.environ.get('ONLY') else None
    ims = build(only)
    if len(sys.argv) > 1:
        os.makedirs(sys.argv[1], exist_ok=True)
        for k, im in ims.items():
            z = 8 if im.width <= 40 else 4
            bg = Image.new('RGBA', im.size, (255, 246, 228, 255)); bg.alpha_composite(im)
            bg.resize((im.width * z, im.height * z), Image.NEAREST).save(os.path.join(sys.argv[1], k + '.png'))
    else:
        print(json.dumps({k: uri(im) for k, im in ims.items()}, separators=(',', ':')))
