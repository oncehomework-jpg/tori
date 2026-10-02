"""타코 띄워 주기 깊은 바다 생물 (v5.1): 예전(v4.x) 귀여운 그림의 모양은 그대로 두고
2배로 촘촘하게 다듬어요 — 테두리 1칸으로 얇게, 계단 모서리 깎기, 위는 밝게/아래는 어둡게, 눈 반짝이.
python3 sea.py → JS, python3 sea.py png out.png → 예전/새 그림 나란히"""
import sys, json
OLD = {
 'cSh': ["k...1111..", ".k.111112.", "kok1111222", ".11111222.", "..1.1.2.2."],
 'cTt': ["....kkkkkk....", "...k3433434k..", "k5k.k3433434k.", "k5k5k3433434k.", ".k55kkkkkkkkk.", "...k5k.k5k.k5k", "...kk..kk..kk."],
 'cHr': ["k6.k6.......", "k6kk6k......", ".k6666kkkk..", "k66k6666677k", "k666666777k.", ".k6677777kk.", "..kkkkkkk..."],
 'cSl': ["...kkkk...........", "..k8888kkkkkk.....", ".k88k88888888kk...", "k99k888888888888kk", "kkkkAAAAAAAA88888k", ".k9kAAAAAAAAA888k.", "..kkkAAAAAAA88kk..", "....k99kkkkk99k...", ".....kk.....kk...."],
 'cSk': ["..............kk..........", ".............kBBk.........", ".........kkkkBBBBk......k.", "....kkkkkBBBBBBBBBkkk..kBk", "..kkBBBBBBBBBBBBBBBBBkkBBk", ".kBBkBBBBBBBBBBBBBBBBBBBk.", "kBBBBBBBBBBBBBBBBBBBBBkk..", "kkwkwkwkAAAAAAAAAAAAAkBBk.", ".kkkkkkkkAAAAAAAAAAkkkBBk.", ".........kkkkkkkkkk...kk.."]}
# 예전 색 + 밝은/어두운 단계 (밝게, 어둡게)
PAL = {'k': '#4a3423', 'w': '#fffaf0', '1': '#f08a5d', '2': '#c9583a', '3': '#7fae5a', '4': '#4e7a3a', '5': '#d9c27a',
       '6': '#9b7fb8', '7': '#6f5590', '8': '#9aa5b1', '9': '#6c7783', 'A': '#e8eef2', 'B': '#6f8aa3', 'C': '#4a6278',
       'E': '#ffb48c', 'F': '#a8452c', 'G': '#a6cf7e', 'H': '#3b6230', 'I': '#ecdca0', 'J': '#b39c58',
       'K': '#bba4d6', 'L': '#57427a', 'M': '#bcc5cf', 'N': '#4f5964', 'O': '#ffffff', 'P': '#c9d2db',
       'Q': '#93abc2', 'D': '#3a5068', 'T': '#f4a3b0'}
LIT = {'1': 'E', '2': '1', '3': 'G', '4': '3', '5': 'I', '6': 'K', '7': '6', '8': 'M', '9': '8', 'A': 'O', 'B': 'Q', 'C': 'B'}
DRK = {'1': '2', '2': 'F', '3': '4', '4': 'H', '5': 'J', '6': '7', '7': 'L', '8': '9', '9': 'N', 'A': 'P', 'B': 'C', 'C': 'D'}
EYE = {'cSh': [(1, 2)], 'cTt': [], 'cHr': [(3, 3)], 'cSl': [(4, 2)], 'cSk': [(4, 5)]}  # 예전 칸 좌표의 눈

def refine(name):
    o = [r.replace('o', 'k') for r in OLD[name]]
    h, w = len(o), len(o[0])
    a = [[o[y // 2][x // 2] for x in range(w * 2)] for y in range(h * 2)]
    H, W = h * 2, w * 2
    g = lambda x, y: a[y][x] if 0 <= x < W and 0 <= y < H else '.'
    eyes = {(ex * 2 + i, ey * 2 + j) for ex, ey in EYE[name] for i in (0, 1) for j in (0, 1)}
    # 1) 테두리 얇게: 투명칸에 닿지 않은 테두리(눈 제외)는 옆 색으로
    for _ in range(1):
        b = [r[:] for r in a]
        for y in range(H):
            for x in range(W):
                if a[y][x] != 'k' or (x, y) in eyes: continue
                if any(g(x + dx, y + dy) == '.' for dx in (-1, 0, 1) for dy in (-1, 0, 1)): continue
                for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                    c = g(x + dx, y + dy)
                    if c not in '.k': b[y][x] = c; break
        a = b
    # 1-2) 테두리가 빠진 곳(예전 그림에서 색이 바로 바깥에 닿던 곳)에 바깥 테두리 1칸
    a = [['.'] + r + ['.'] for r in a]; a = [['.'] * (W + 2)] + a + [['.'] * (W + 2)]; H += 2; W += 2
    eyes = {(x + 1, y + 1) for x, y in eyes}
    b = [r[:] for r in a]
    for y in range(H):
        for x in range(W):
            if a[y][x] == '.' and any(g(x + dx, y + dy) not in '.k' for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0))): b[y][x] = 'k'
    a = b
    # 2) 계단 모서리 깎기: 바깥 두 면이 비고 안쪽 두 면이 테두리면 지워요
    b = [r[:] for r in a]
    for y in range(H):
        for x in range(W):
            if a[y][x] != 'k': continue
            for dx, dy in ((1, 1), (1, -1), (-1, 1), (-1, -1)):
                if g(x - dx, y) == '.' and g(x, y - dy) == '.' and g(x + dx, y) != '.' and g(x, y + dy) != '.' and g(x + dx, y + dy) not in '.k':
                    b[y][x] = '.'
    a = b
    # 2-2) 깎은 뒤에도 색이 바깥에 바로 닿는 곳은 다시 테두리
    b = [r[:] for r in a]
    for y in range(H):
        for x in range(W):
            if a[y][x] == '.' and any(g(x + dx, y + dy) not in '.k' for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0))): b[y][x] = 'k'
    a = b
    # 3) 위쪽은 밝게, 아래쪽은 어둡게
    b = [r[:] for r in a]
    for y in range(H):
        for x in range(W):
            c = a[y][x]
            if c not in LIT: continue
            if g(x, y - 1) == 'k' and g(x, y - 2) in '.k': b[y][x] = LIT[c]
            elif g(x, y + 1) == 'k' and g(x, y + 2) in '.k': b[y][x] = DRK[c]
    a = b
    # 4) 눈 반짝이
    for ex, ey in EYE[name]: a[ey * 2 + 1][ex * 2 + 1] = 'w'
    # 빈 가장자리 줄 정리
    while all(c == '.' for c in a[0]): a.pop(0)
    while all(c == '.' for c in a[-1]): a.pop()
    while all(r[0] == '.' for r in a): a = [r[1:] for r in a]
    while all(r[-1] == '.' for r in a): a = [r[:-1] for r in a]
    return a

N = {k: refine(k) for k in OLD}
# 손으로 조금 더 (2배 그림 좌표)
for k in N: N[k] = [''.join(r) for r in N[k]]
N['cSh'] = [  # 새우: 마디 줄, 더듬이, 큰 눈, 꼬리 쪽은 진하게
 "........kkkkkkkk.....",
 ".k.....kEEEEEEEEk....",
 "..k...kE11121121Ekk..",
 "...k.kE1112112112Ek..",
 "..kkkE11112112112122k",
 ".kwkk111111211211222k",
 ".kkkE11111121122222Fk",
 "..kE1111111122222FFk.",
 "..k2211221122FF22Fk..",
 "...kk11kk11kk22kFFk..",
 "....k22k.k22k.kFk....",
 ".....kk...kk...k....."]
N['cSh'] = [''.join('1' if (c == '2' and x < 12 and 2 <= y <= 7) else c for x, c in enumerate(r)) for y, r in enumerate(N['cSh'])]
def edit(n, y, x, t):
    r = N[n][y]; N[n][y] = r[:x] + t + r[x + len(t):]
edit('cTt', 3, 0, '....'); edit('cTt', 4, 0, '.kkk.'); edit('cTt', 5, 0, 'kI55I'); edit('cTt', 6, 0, 'k5kw5'); edit('cTt', 7, 0, 'k5kk5'); edit('cTt', 8, 0, '.kJ5')
edit('cSl', 6, 8, '88'); edit('cSl', 7, 10, 'TT'); edit('cSl', 8, 12, 'A')
edit('cSk', 9, 8, 'BBBBBBB')
for y in (10, 11, 12): edit('cSk', y, 13, 'C'); edit('cSk', y, 15, 'C'); edit('cSk', y, 17, 'C')

Z = {'cSh': 2, 'cTt': 2, 'cHr': 2, 'cSl': 2.5, 'cSk': 2.5}

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'png':
        from PIL import Image, ImageDraw
        S = 6; img = Image.new('RGB', (sum(len(v[0]) * 2 + 8 for v in OLD.values()) * S, 44 * S), '#3aa2cd'); d = ImageDraw.Draw(img); ox = 6
        for k in OLD:
            for rows, z, oy in ((OLD[k], 2, 2), (N[k], 1, 22)):
                for y, r in enumerate(rows):
                    for x, c in enumerate(r):
                        if c != '.': d.rectangle([ox + x * z * S, (oy + y * z) * S, ox + (x + 1) * z * S - 1, (oy + (y + 1) * z) * S - 1], fill=PAL.get(c, PAL['k']))
            ox += (len(OLD[k][0]) * 2 + 8) * S
        img.save(sys.argv[2])
    else:
        print('Object.assign(MGP,' + json.dumps({k: v for k, v in PAL.items() if k not in 'kw123456789ABC'}) + ');')
        print('Object.assign(MGS,' + json.dumps(N) + ');')
