"""v8.1 '사라진 도토리 사건' 장소 배경 128x72 (그림 원본, mystery_art.py가 불러 씀).
빛은 왼쪽 위, 색 묶음 안에서만 명암, 경계는 바이어 무늬로 살짝 섞음."""
import math, random
from mystery_art import C, BAYER, OL

W, H = 128, 72


def grad(c, y0, y1, cols, x0=0, x1=W - 1):
    """세로 그라데이션(색 칸 사이를 바이어 무늬로 섞음)"""
    n = len(cols) - 1
    for y in range(y0, y1 + 1):
        t = (y - y0) / max(1, y1 - y0) * n
        i = min(n - 1, int(t)); f = t - i
        for x in range(x0, x1 + 1):
            c.px(x, y, cols[i + 1] if f * 16 > BAYER[y % 4][x % 4] else cols[i])


def dith(c, x0, y0, x1, y1, a, b, amt):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            c.px(x, y, b if BAYER[y % 4][x % 4] < amt else a)


def ellf(c, cx, cy, rx, ry, col):
    for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
        for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
            if ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1: c.px(x, y, col)


def box(c, x0, y0, x1, y1, fill, hi, lo, ol=OL):
    """테두리 있는 상자: 왼쪽·위 밝게, 오른쪽·아래 어둡게"""
    c.rect(x0, y0, x1, y1, ol); c.rect(x0 + 1, y0 + 1, x1 - 1, y1 - 1, fill)
    c.rect(x0 + 1, y0 + 1, x1 - 1, y0 + 1, hi); c.rect(x0 + 1, y0 + 1, x0 + 1, y1 - 1, hi)
    c.rect(x0 + 1, y1 - 1, x1 - 1, y1 - 1, lo); c.rect(x1 - 1, y0 + 2, x1 - 1, y1 - 1, lo)


def acorn(c, x, y, s=1):
    c.put(x, y, [".kk.", "kddk", "kbbk", ".kk."] if s == 1 else ["..k..", ".kkk.", "kdddk", "kDDDk", "kbbbk", "kbwbk", ".kbk."],
          {'k': '#4a2c18', 'd': '#8e5a2c', 'D': '#6a4020', 'b': '#c8853e', 'w': '#f0b870'})


def planks(c, y0, y1, cols, seam, rnd, wid=16):
    """나무 바닥: 아래로 갈수록 넓어지는 판자 + 이음매"""
    for y in range(y0, y1 + 1):
        t = (y - y0) / max(1, y1 - y0)
        row = (y - y0) // 4
        for x in range(W):
            c.px(x, y, cols[(row % 2) + (0 if t < .5 else 1)])
        if (y - y0) % 4 == 3:
            for x in range(W): c.px(x, y, seam)
        else:
            off = (row * 7) % wid
            for x in range(off, W, wid + row % 3 * 4): c.px(x, y, seam)
    for _ in range(40):
        x, y = rnd.randrange(W), rnd.randrange(y0, y1)
        if c.get(x, y) != seam: c.px(x, y, cols[0])


# ─────────────── 토리의 방 ───────────────
def room():
    r = random.Random(1); c = C(W, H)
    # 벽지: 크림 + 작은 도토리 무늬, 아래 나무 벽판
    grad(c, 0, 44, ['#f6e3c4', '#f1d9b4', '#e9cc9f'])
    for y in range(4, 40, 9):
        for x in range((y // 9) % 2 * 6 + 3, W, 12):
            c.px(x, y, '#e2bf8c'); c.px(x, y + 1, '#d8ae74')
    c.rect(0, 38, W - 1, 46, '#b9824a'); c.rect(0, 38, W - 1, 38, '#dca468'); c.rect(0, 46, W - 1, 46, '#7a4a25')
    for x in range(6, W, 12): c.rect(x, 39, x, 45, '#9a6534')
    # 창문(왼쪽): 하늘·구름·나무 창틀·분홍 커튼
    box(c, 10, 6, 44, 32, '#8ec8ee', '#c48a50', '#7a4a25')
    grad(c, 8, 30, ['#7cbcea', '#a6d6f4', '#d4ecfa'], 12, 42)
    for cx, cy, rx in [(20, 14, 5), (25, 13, 4), (36, 22, 4), (39, 21, 3)]: ellf(c, cx, cy, rx, 2.2, '#ffffff')
    c.rect(18, 15, 30, 16, '#ffffff'); c.rect(32, 23, 42, 24, '#eaf6ff')
    ellf(c, 22, 30, 9, 3, '#7ab85a'); ellf(c, 37, 31, 7, 2.5, '#5f9a48')
    c.rect(27, 8, 27, 30, '#c48a50'); c.rect(12, 19, 42, 19, '#c48a50')
    for side, x0 in ((0, 5), (1, 40)):
        for y in range(4, 36):
            w = 6 + (y > 26) * (y - 26) // 3
            for x in range(x0 if not side else x0 + 9 - w, (x0 + w) if not side else x0 + 9):
                k = (x - x0) % 3
                c.px(x, y, '#f6a8b8' if k == 0 else '#e98aa0' if k == 1 else '#fbc6d0')
        c.rect(x0 if not side else x0 - 1, 4, x0 + 9, 5, '#c84868')
    c.rect(3, 3, 51, 4, '#7a4a25'); c.rect(3, 3, 51, 3, '#a8703c')
    # 선반 + 책 + 화분 + 도토리 단지(오른쪽 위)
    c.rect(78, 18, 122, 20, '#7a4a25'); c.rect(78, 18, 122, 18, '#c48a50')
    bx = 80
    for w, h, col in [(3, 11, '#d9574a'), (4, 9, '#6aa0dc'), (3, 12, '#6fa845'), (3, 8, '#f4c542'), (4, 10, '#9a6cc8')]:
        box(c, bx, 18 - h, bx + w, 18, col, '#ffffff' if False else col, '#4a3423'); c.px(bx + 1, 18 - h + 2, '#fffaf0'); bx += w + 1
    # 단지(빈 받침대 = 황금 도토리가 있던 자리)
    box(c, 104, 8, 114, 18, '#c8e6f4', '#ffffff', '#86b2cc'); c.rect(103, 6, 115, 8, '#d9574a'); c.rect(103, 6, 115, 6, '#f08a7a')
    acorn(c, 106, 13); acorn(c, 109, 14)
    ellf(c, 92, 32 - 22, 0.1, 0.1, '#000000') if False else None
    # 화분
    c.put(116, 4, ["..g.g..", ".gGgGg.", "gGgggGg", ".gGgGg.", "..kkk..", ".kdddk.", ".kdDdk.", "..kkk.."],
          {'g': '#6fa845', 'G': '#3f6e2e', 'k': OL, 'd': '#c86a3a', 'D': '#a04a24'})
    # 벽 액자(토리와 해바라기씨) + 동그란 시계
    box(c, 56, 8, 72, 30, '#fff6e0', '#e8b878', '#7a4a25')
    c.rect(58, 10, 70, 28, '#bfe4f4'); ellf(c, 64, 24, 6, 4, '#e8c48c'); ellf(c, 64, 20, 4.5, 4, '#e8c48c')
    c.put(61, 18, ["k...k", ".....", "..p.."], {'k': OL, 'p': '#f6a8b8'}); c.put(60, 15, ["p.......p"[:9]], {'p': '#f6a8b8'})
    ellf(c, 90, 30, 0.1, 0.1, '#000') if False else None
    c.ball(122, 30, 0.1, 0.1, ['#000']) if False else None
    # 바닥
    planks(c, 47, 71, ['#c8935a', '#b98450', '#a87442', '#9a683a'], '#7a4a25', r)
    # 둥근 러그
    for y in range(52, 70):
        for x in range(30, 98):
            d = ((x + .5 - 64) / 33) ** 2 + ((y + .5 - 61) / 8.5) ** 2
            if d <= 1: c.px(x, y, '#d96a6a' if d > .72 else '#f6d07a' if d > .55 else '#f2a6a0' if (x // 3 + y // 2) % 2 else '#f6b4ac')
    # 햄스터 침대(바구니) 오른쪽 아래
    for y in range(44, 60):
        for x in range(96, 126):
            d = ((x + .5 - 111) / 14.5) ** 2 + ((y + .5 - 55) / 6) ** 2
            if d <= 1 and y >= 49: c.px(x, y, '#a86a34' if (x + y // 2) % 3 else '#cf9050')
    ellf(c, 111, 50, 12, 3, '#f6e0c0'); ellf(c, 108, 49.5, 6, 1.6, '#fff4e0')
    c.rect(100, 49, 122, 49, '#e8c48c')
    # 창에서 들어온 빛(바닥에 밝은 평행사변형)
    for y in range(48, 66):
        for x in range(10 + (y - 48), 32 + (y - 48)):
            if (x + y) % 2 == 0 and c.get(x, y) not in ('#7a4a25',): pass
    return c


# ─────────────── 챗바퀴 놀이터 ───────────────
def wheel():
    r = random.Random(2); c = C(W, H)
    grad(c, 0, 46, ['#cdeee0', '#b6e2d0', '#9fd2bf'])
    for y in range(3, 44, 6):                        # 철망 무늬
        for x in range((y // 6) % 2 * 3, W, 6): c.px(x, y, '#e4f6ee')
    c.rect(0, 0, W - 1, 1, '#7aa898')
    # 톱밥 바닥
    grad(c, 47, 71, ['#f0d8a4', '#e6c88e', '#d8b478'])
    for _ in range(260):
        x, y = r.randrange(W), r.randrange(48, 72)
        c.px(x, y, r.choice(['#fff0c8', '#c89a5a', '#f8e2b0', '#d6aa6a']))
        if r.random() < .3: c.px(x + 1, y, '#fff0c8')
    c.rect(0, 46, W - 1, 46, '#b08a58')
    # 큰 챗바퀴(가운데 오른쪽): 받침대 + 바퀴 테 + 살 + 발판 줄
    cx, cy, R = 82, 30, 22
    c.poly([(cx - 3, cy), (cx + 3, cy), (cx + 14, 64), (cx + 8, 64)], '#7a8494')
    c.poly([(cx - 3, cy), (cx + 3, cy), (cx - 8, 64), (cx - 14, 64)], '#a2acbc')
    c.rect(cx - 18, 63, cx + 18, 66, '#5a6474'); c.rect(cx - 18, 63, cx + 18, 63, '#c8d0dc')
    for y in range(cy - R - 1, cy + R + 2):
        for x in range(cx - R - 1, cx + R + 2):
            d = math.hypot(x + .5 - cx, y + .5 - cy)
            if R - 3 <= d <= R:
                a = math.atan2(y + .5 - cy, x + .5 - cx)
                l = -math.cos(a + .8)
                c.px(x, y, '#f6c0c8' if l > .5 else '#e88a9a' if l > -.3 else '#b85a6c')
            elif d < R - 3 and int(d) % 4 == 0 and d > 4:
                c.px(x, y, '#d8dce6')
    for k in range(8):
        a = k * math.pi / 4
        c.line(cx, cy, cx + (R - 3) * math.cos(a), cy + (R - 3) * math.sin(a), '#c8ccd6')
    ellf(c, cx, cy, 3, 3, '#5a6474'); c.px(cx - 1, cy - 1, '#c8d0dc')
    # 물병(왼쪽 위 벽)
    box(c, 14, 4, 24, 28, '#a6dcf4', '#e8f8ff', '#6ab0d0'); c.rect(15, 5, 23, 10, '#e8f8ff')
    c.rect(13, 3, 25, 5, '#3f7ac2'); c.rect(18, 29, 20, 34, '#a0a6b4'); c.px(19, 35, '#7ac8f0')
    c.put(16, 14, ["w.", "ww", "w."], {'w': '#ffffff'})
    # 터널 관(왼쪽 아래)
    for y in range(46, 64):
        for x in range(2, 42):
            d = ((y + .5 - 55) / 8.5)
            if abs(d) <= 1:
                c.px(x, y, '#ffe07a' if d < -.55 else '#f4c542' if d < .35 else '#c8961e')
    ellf(c, 41, 55, 4, 8.5, '#8a5a10'); ellf(c, 41, 55, 2.6, 6.5, '#3a2410')
    for x in range(6, 40, 8): c.rect(x, 47, x, 63, '#d8a82a')
    # 나무 사다리(오른쪽)
    c.rect(112, 14, 113, 62, '#a8703c'); c.rect(122, 14, 123, 62, '#7a4a25')
    for y in range(18, 62, 8): c.rect(112, y, 123, y + 1, '#c48a50'); c.rect(112, y + 1, 123, y + 1, '#8a5a2c')
    # 밥그릇
    ellf(c, 56, 62, 9, 3, '#6aa0dc'); ellf(c, 56, 60.5, 8, 2, '#3e5e9c')
    for x, y in [(52, 60), (55, 59), (58, 60), (60, 59)]: acorn(c, x - 1, y - 2) if False else c.px(x, y, '#c8853e')
    c.rect(48, 62, 64, 64, '#4a78bc'); c.rect(48, 62, 64, 62, '#8ab8ec')
    return c


# ─────────────── 도토리 숲 ───────────────
def tree(c, cx, base, h, rad, leaf, bark, rnd):
    c.rect(cx - 3, base - h, cx + 3, base, bark[1]); c.rect(cx - 3, base - h, cx - 2, base, bark[2]); c.rect(cx + 2, base - h, cx + 3, base, bark[0])
    for y in range(base - h, base, 5): c.px(cx, y, bark[0]); c.px(cx - 1, y + 2, bark[0])
    blobs = [(cx, base - h - rad * .3, rad), (cx - rad * .7, base - h + rad * .2, rad * .75), (cx + rad * .7, base - h + rad * .25, rad * .75)]
    for bx, by, br in sorted(blobs, key=lambda b: b[1]):
        for y in range(int(by - br) - 1, int(by + br) + 2):
            for x in range(int(bx - br) - 1, int(bx + br) + 2):
                nx, ny = (x + .5 - bx) / br, (y + .5 - by) / br; d = nx * nx + ny * ny
                if d > 1: continue
                l = -nx * .55 - ny * .65 + math.sqrt(1 - d) * .5
                i = 3 if l > .62 else 2 if l > .2 else 1 if l > -.25 else 0
                if 0 < i < 3 and abs(l - [-.25, .2, .62][i]) < .08 and BAYER[y % 4][x % 4] < 6: i -= 1
                c.px(x, y, leaf[i])
    for _ in range(int(rad * .45)):
        x = int(cx + rnd.uniform(-rad, rad)); y = int(base - h + rnd.uniform(-rad * .3, rad * .7))
        if c.get(x, y) in leaf[1:3] and c.get(x + 1, y + 2) in leaf[:3]:
            c.put(x, y, ["kk", "bb"], {'k': '#5a3418', 'b': '#b0682a'})


def forest():
    r = random.Random(3); c = C(W, H)
    grad(c, 0, 40, ['#f8d8a0', '#fbe6be', '#fdf2dc'])                # 노을 하늘
    ellf(c, 100, 14, 8, 8, '#fff6d0'); ellf(c, 100, 14, 6, 6, '#fffbe8')
    for x in range(W):                                               # 먼 언덕 두 겹
        h1 = 30 + 4 * math.sin(x / 14) + 2 * math.sin(x / 5.3)
        h2 = 38 + 3 * math.sin(x / 9 + 1)
        for y in range(int(h1), 48): c.px(x, y, '#d8b07a' if (x + y) % 7 else '#cba06a')
        for y in range(int(h2), 48): c.px(x, y, '#c08a4c')
    # 먼 나무(작고 흐린)
    for i, x in enumerate(range(-4, W, 9)):
        hh = 4 + (i * 5) % 3
        ellf(c, x + 6, 38 - hh * .3, 5.5, hh, '#b88a4e' if i % 2 else '#c49a5a')
        ellf(c, x + 4.5, 37 - hh * .5, 3, hh * .5, '#d2aa6a')
    # 풀밭 + 길
    grad(c, 44, 71, ['#a8c060', '#93ae4c', '#7d9a3e'])
    for y in range(44, 72):
        w = 6 + (y - 44) * 1.1; x0 = 64 - w + (y - 44) * .3
        for x in range(int(x0), int(x0 + 2 * w)): c.px(x, y, '#e6cc96' if (x * 3 + y) % 11 else '#d4b47a')
    for _ in range(220):
        x, y = r.randrange(W), r.randrange(46, 72)
        if c.get(x, y) in ('#a8c060', '#93ae4c', '#7d9a3e'):
            c.px(x, y, '#c6dc7a'); c.px(x, y - 1, '#6a8a34')
    # 큰 참나무(가을 주황·노랑) 양옆
    LF = ['#9a4a1c', '#c8682a', '#e8963e', '#f8c460']; BK = ['#4a2c18', '#7a4a25', '#a8703c']
    tree(c, 18, 60, 22, 17, LF, BK, r)
    tree(c, 110, 62, 24, 18, ['#8a5a14', '#c08a20', '#e4b438', '#f8dc70'], BK, r)
    # 바닥의 낙엽·도토리·버섯
    for _ in range(30):
        x, y = r.randrange(W), r.randrange(52, 71)
        c.put(x, y, ["ab", "b."], {'a': r.choice(LF[1:]), 'b': r.choice(LF[:3])})
    for x, y in [(36, 64), (88, 66), (50, 69), (74, 60)]: acorn(c, x, y, 2)
    c.put(96, 56, [".rrr.", "rwrwr", "rrrrr", "..w..", "..w.."], {'r': '#d9574a', 'w': '#fff0dc'})
    # 떨어지는 잎
    for x, y in [(44, 12), (70, 22), (58, 8), (84, 30)]: c.put(x, y, ["o.", "oO"], {'o': '#e8963e', 'O': '#c8682a'})
    return c


# ─────────────── 바닷가 ───────────────
def sea():
    r = random.Random(4); c = C(W, H)
    grad(c, 0, 30, ['#6cb8ec', '#92ccf2', '#c2e4f8', '#e6f4fc'])
    for cx, cy, rx in [(24, 9, 7), (31, 8, 5), (88, 14, 6), (95, 13, 4)]: ellf(c, cx, cy, rx, 2.6, '#ffffff')
    c.rect(18, 10, 36, 11, '#ffffff'); c.rect(84, 15, 100, 16, '#f2f8fc')
    ellf(c, 112, 8, 5, 5, '#fff2b0'); ellf(c, 112, 8, 3.5, 3.5, '#fffce8')
    # 바다(먼 곳 짙게 → 가까이 밝게) + 반짝이
    grad(c, 30, 48, ['#2a72b8', '#3a8ccc', '#4aa4dc', '#62bce4'])
    for _ in range(70):
        x, y = r.randrange(W), r.randrange(31, 48)
        c.px(x, y, '#ffffff' if r.random() < .3 else '#a8dcf4'); c.px(x + 1, y, '#a8dcf4')
    c.rect(0, 30, W - 1, 30, '#a8dcf4')
    # 돛단배
    c.put(70, 22, ["...k....", "...kw...", "...kww..", "...kwww.", "...kwwww", "...k....", "kkkkkkkk", ".kSSSSk."], {'k': OL, 'w': '#ffffff', 'S': '#d9574a'})
    # 물결 거품 + 젖은 모래 + 마른 모래
    for x in range(W):
        y = int(48 + 2.2 * math.sin(x / 7.0) + 1.2 * math.sin(x / 2.9))
        for yy in range(y - 1, y + 2): c.px(x, yy, '#ffffff' if yy < y + 1 else '#d6f0fa')
        for yy in range(y + 2, y + 6): c.px(x, yy, '#d8b880' if (x + yy) % 5 else '#ccaa70')
        for yy in range(y + 6, H): c.px(x, yy, '#f4dca8')
    grad(c, 58, 71, ['#f4dca8', '#f0d49a', '#e8c88a'])
    for _ in range(150):
        x, y = r.randrange(W), r.randrange(56, 72)
        if c.get(x, y) in ('#f4dca8', '#f0d49a', '#e8c88a'): c.px(x, y, r.choice(['#fff0cc', '#d8b47a']))
    # 바위(왼쪽) — 덩어리 명암
    c.ball(14, 52, 13, 9, ['#4a5262', '#6a7486', '#8a96a8', '#b4bece'], cut=lambda x, y: y > 58)
    c.ball(27, 56, 7, 5, ['#4a5262', '#6a7486', '#8a96a8', '#b4bece'], cut=lambda x, y: y > 59)
    for x in range(1, 34): c.px(x, 59, '#3a4252') if c.get(x, 58) in ('#4a5262', '#6a7486', '#8a96a8', '#b4bece') else None
    c.put(8, 44, ["g.g", "ggg", ".g."], {'g': '#5aa05a'})
    # 불가사리·조개·파라솔
    c.put(52, 62, ["..o..", ".ooo.", "ooOoo", ".o.o.", "o...o"], {'o': '#f08a5a', 'O': '#ffc89a'})
    c.put(84, 66, [".ppp.", "pPpPp", "ppppp"], {'p': '#f6a8b8', 'P': '#ffffff'})
    c.line(104, 34, 108, 64, '#7a4a25'); c.line(105, 34, 109, 64, '#a8703c')
    for y in range(26, 37):
        for x in range(86, 126):
            dx = (x + .5 - 106) / 20; dy = (y + .5 - 36) / 10
            if dx * dx + dy * dy <= 1 and y < 36: c.px(x, y, '#d9574a' if int((x - 86) / 6.7) % 2 == 0 else '#fffaf0')
    for x in range(86, 126, 7): c.px(x + 3, 36, '#a83030')
    ellf(c, 106, 65, 10, 2, '#e0c088')     # 파라솔 그늘
    return c


# ─────────────── 무대 ───────────────
def stage():
    r = random.Random(5); c = C(W, H)
    grad(c, 0, 50, ['#2a1c3c', '#3a2850', '#4a3460'])                 # 어두운 무대 뒤
    for _ in range(40): c.px(r.randrange(20, 108), r.randrange(4, 40), r.choice(['#fff0a6', '#cfb0ec', '#ffffff']))
    # 핀 조명 원뿔(가운데)
    for y in range(4, 60):
        w = 4 + (y - 4) * .42
        for x in range(int(64 - w), int(64 + w)):
            if BAYER[y % 4][x % 4] < 7 or abs(x - 64) < w * .55:
                col = c.get(x, y)
                c.px(x, y, '#6a5280' if col in ('#2a1c3c',) else '#7a6290' if col == '#3a2850' else '#8a74a0')
    # 무대 바닥(나무)
    planks(c, 50, 71, ['#c48a50', '#b07a44', '#9a683a', '#8a5a30'], '#5a3a20', r, 20)
    c.rect(0, 50, W - 1, 51, '#e8b878'); c.rect(0, 52, W - 1, 52, '#7a4a25')
    ellf(c, 64, 62, 22, 5, '#e6c08a'); ellf(c, 64, 62, 15, 3.4, '#f2d4a0')   # 조명 받은 바닥
    # 빨간 커튼(양옆 + 위 주름 띠)
    CU = ['#6a1420', '#9a2230', '#c83a44', '#e86a6a']
    for side in (0, 1):
        for y in range(0, 60):
            w = 26 - (y > 30) * min(14, (y - 30) * .55)
            for xi in range(int(w)):
                x = xi if side == 0 else W - 1 - xi
                k = (xi + (y // 20)) % 6
                c.px(x, y, CU[3] if k == 1 else CU[2] if k in (0, 2) else CU[1] if k == 3 else CU[0])
        c.put(18 if side == 0 else 104, 34, ["yyyyyy", "yYYYYy", "..yy.."], {'y': '#f4c542', 'Y': '#d99a2b'})
    for x in range(W):
        y1 = 9 + int(3 * abs(math.sin(x * math.pi / 16)))
        for y in range(0, y1): c.px(x, y, CU[(x // 2 + y // 3) % 3 + (1 if y < 3 else 0)] if y < y1 - 1 else CU[0])
        c.px(x, y1, '#f4c542')
    # 마이크 스탠드 + 작은 북 + 별 장식
    c.rect(63, 30, 64, 58, '#5c5466'); c.rect(58, 58, 69, 59, '#3a3442')
    c.put(61, 25, [".kkk.", "knNnk", "kNnNk", "knNnk", ".kkk."], {'k': '#2a2430', 'n': '#8c8796', 'N': '#cdc9d4'})
    box(c, 84, 50, 98, 62, '#3a3442', '#5c5466', '#2a2430')          # 스피커
    ellf(c, 91, 57, 4, 4, '#2a2430'); ellf(c, 91, 57, 2, 2, '#8c8796'); ellf(c, 91, 52.5, 1.5, 1.2, '#8c8796')
    for x, y in [(40, 18), (88, 14), (30, 30), (98, 28)]:
        c.put(x - 2, y - 2, ["..y..", ".yYy.", "yYYYy", ".yYy.", "..y.."], {'y': '#f4c542', 'Y': '#fff0a6'})
    return c


# ─────────────── 부엌 ───────────────
def kitchen():
    r = random.Random(6); c = C(W, H)
    # 하늘색 타일 벽
    c.rect(0, 0, W - 1, 44, '#d6eef4')
    for y in range(0, 44):
        for x in range(W):
            if y % 8 == 7 or x % 8 == 7: c.px(x, y, '#b0d4e0')
            elif y % 8 == 0 or x % 8 == 0: c.px(x, y, '#eef8fb')
    for y in range(3, 40, 16):
        for x in range(3 + (y // 16) % 2 * 8, W, 16): c.put(x, y, [".r.", "rgr", ".r."], {'r': '#f2a6b4', 'g': '#f4c542'})
    # 창문(가운데 위)
    box(c, 48, 4, 80, 24, '#a6d6f4', '#ffffff', '#86b2cc')
    grad(c, 6, 22, ['#8ec8ee', '#c2e4f8'], 50, 78)
    ellf(c, 58, 20, 7, 3, '#7ab85a'); ellf(c, 72, 21, 6, 2.5, '#5f9a48'); c.rect(64, 6, 64, 22, '#ffffff'); c.rect(50, 14, 78, 14, '#ffffff')
    c.rect(46, 24, 82, 26, '#c48a50'); c.rect(46, 24, 82, 24, '#e8b878')
    c.put(52, 18, [".g.", "gGg", "kkk", "kdk"], {'g': '#6fa845', 'G': '#3f6e2e', 'k': OL, 'd': '#c86a3a'})
    # 위 선반 + 병들
    c.rect(4, 14, 40, 16, '#a8703c'); c.rect(4, 14, 40, 14, '#d8a068')
    for i, (col, cap) in enumerate([('#f4c542', '#d9574a'), ('#f2a6b4', '#6aa0dc'), ('#a8d86a', '#d9574a'), ('#f7b56b', '#6fa845')]):
        x = 6 + i * 9
        box(c, x, 5, x + 6, 14, col, '#ffffff', '#4a3423'); c.rect(x, 4, x + 6, 5, cap); c.px(x + 2, 7, '#ffffff')
    c.rect(88, 14, 124, 16, '#a8703c'); c.rect(88, 14, 124, 14, '#d8a068')
    for i, col in enumerate(['#f6a8b8', '#a9ceef', '#fff0a6']):     # 그릇 쌓기
        for j in range(3 - (i == 1)):
            y = 12 - j * 3; x = 92 + i * 11
            c.rect(x, y, x + 8, y + 1, col); c.rect(x + 1, y + 2, x + 7, y + 2, col); c.rect(x, y, x + 8, y, '#ffffff'); c.px(x + 8, y + 1, '#4a3423')
    # 조리대 + 화덕 + 냄비(김)
    box(c, 0, 36, W - 1, 56, '#e8d0a8', '#fff0d0', '#b89a70')
    c.rect(0, 36, W - 1, 38, '#f6f0e6'); c.rect(0, 38, W - 1, 38, '#c8c0b0')
    for x in range(8, W, 30):
        box(c, x, 42, x + 22, 54, '#d8b88a', '#f0d4a8', '#a8885c'); c.rect(x + 9, 47, x + 13, 48, '#7a5a3a')
    ellf(c, 32, 32, 10, 5, '#5c5466'); c.rect(22, 27, 42, 33, '#6a6478'); c.rect(22, 27, 42, 27, '#9a94a8')
    c.rect(24, 28, 26, 32, '#8a849a'); ellf(c, 32, 26.5, 10, 1.6, '#3a3442'); c.rect(18, 28, 21, 29, '#3a3442'); c.rect(43, 28, 46, 29, '#3a3442')
    for k, x in enumerate((28, 33, 38)):
        for y in range(10, 25):
            c.px(x + int(1.5 * math.sin(y / 2.2 + k)), y, '#ffffff' if (y + k) % 3 else '#eaf6fb')
    # 도마 위 당근·빵
    c.rect(78, 32, 104, 35, '#c48a50'); c.rect(78, 32, 104, 32, '#e8b878')
    c.put(82, 28, ["..g.", "oooo", ".ooo"], {'g': '#6fa845', 'o': '#f08a2a'})
    c.ball(97, 30, 5, 3, ['#a86a2a', '#d89a4a', '#f4c47a'])
    # 바닥: 체크무늬
    for y in range(57, 72):
        for x in range(W):
            sz = 6 + (y - 57) // 4
            c.px(x, y, '#f6f0e6' if ((x // sz) + ((y - 57) // 4)) % 2 else '#e0a8a0')
    c.rect(0, 56, W - 1, 56, '#8a6a4a')
    return c


BG = {'room': room, 'wheel': wheel, 'forest': forest, 'sea': sea, 'stage': stage, 'kitchen': kitchen}
