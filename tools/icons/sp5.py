# v7.8: 보드게임 아이콘 (16x16, 색은 index.html PAL) — 보드게임 카드·스도쿠·티츄
# 보기: python3 sp5.py > new.json  (앱에는 Object.assign(SP,{...})로 넣음)
import json, math
from pxdraw import G
N = {}

# ♟ 보드게임: 네 색 놀이판(루도) — 모서리 집 4개(빨강·초록·파랑·노랑) 안에 하얀 자리와 말, 가운데 십자 길과 네 색 삼각 골인
g = G()
g.rect(0, 0, 15, 15, 'k')
g.rect(1, 1, 14, 14, 'c')
for (x0, y0, c, s) in [(1, 1, 'r', 'S'), (10, 1, 'g', 'G'), (1, 10, 'u', 'B'), (10, 10, 'y', 'Y')]:
    g.rect(x0, y0, x0 + 4, y0 + 4, c)
    g.rect(x0 + 1, y0 + 1, x0 + 3, y0 + 3, 'h')      # 하얀 집 마당
    g.px(x0 + 2, y0 + 2, s)                          # 말 하나
    g.px(x0 + 4, y0 + 4, s); g.px(x0 + 4, y0, s if False else c)
# 집으로 가는 색 길 (두 칸 굵기, 가장자리에서 가운데로)
g.rect(7, 1, 8, 5, 'g'); g.rect(10, 7, 14, 8, 'y'); g.rect(7, 10, 8, 14, 'u'); g.rect(1, 7, 5, 8, 'r')
for x, y in [(7, 1), (14, 7), (8, 14), (1, 8)]: g.px(x, y, 'c')   # 출발 칸
# 가운데 골인: 네 색 삼각
for y in range(6, 10):
    for x in range(6, 10):
        dx, dy = x - 7.5, y - 7.5
        g.px(x, y, ('r' if dx < 0 else 'y') if abs(dx) > abs(dy) else ('g' if dy < 0 else 'u'))
g.rect(7, 7, 8, 8, 'Z')
g.rect(0, 0, 15, 0, 'k'); g.rect(0, 15, 15, 15, 'k')
for y in range(16): g.px(0, y, 'k'); g.px(15, y, 'k')
for x in range(1, 15): g.px(x, 14, 'd' if g.get(x, 14) == 'c' else g.get(x, 14))  # 아래 나무 두께
N['bgame'] = g.rows()

# 🔢 스도쿠: 굵은 줄로 나눈 네 칸을 크게 확대 — 주어진 숫자 5·3·7은 진한 갈색, 진우가 방금 넣은 9는 파랑, 고른 칸은 노랑 바탕
D = {'5': ["kkk", "k__", "kkk", "__k", "kkk"], '3': ["kkk", "__k", "_kk", "__k", "kkk"],
     '7': ["kkk", "__k", "_k_", "_k_", "_k_"], '9': ["kkk", "k_k", "kkk", "__k", "kkk"]}
g = G()
g.rect(0, 0, 15, 15, 'k'); g.rect(1, 1, 14, 14, 'c')
g.rect(7, 1, 8, 14, 'd'); g.rect(1, 7, 14, 8, 'd')
g.rect(9, 9, 14, 14, 'Z')
for (x0, y0, d, col) in [(1, 1, '5', 'k'), (9, 1, '3', 'k'), (1, 9, '7', 'k'), (9, 9, '9', 'B')]:
    g.put(x0 + 2 if x0 == 1 else x0 + 1, y0 + 0 + 1 if y0 == 1 else y0 + 0, [r.replace('k', col) for r in D[d]])
g.px(1, 1, 'h'); g.px(2, 1, 'h'); g.px(1, 2, 'h')   # 종이 윗왼쪽 빛
N['sudoku'] = g.rows()

# 🃏 티츄: 손에 쥔 카드 세 장 — 뒤 파랑 무늬 뒷면, 가운데 옥색 카드, 앞 크림 카드에 빨간 용 머리(뿔·눈·벌린 입) · 금빛 모서리
g = G()
def card(x0, y0, x1, y1, fill):
    g.rect(x0, y0, x1, y1, 'k'); g.rect(x0 + 1, y0 + 1, x1 - 1, y1 - 1, fill)
    for x, y in [(x0, y0), (x1, y0), (x0, y1), (x1, y1)]: g.px(x, y, '.')
card(0, 0, 9, 11, 'B')
for y in range(1, 11):
    for x in range(1, 9):
        if (x + y) % 2 == 0: g.px(x, y, 'u')
card(2, 1, 11, 13, 'j'); g.rect(3, 2, 3, 12, 'J')
card(4, 2, 15, 15, 'c'); g.rect(5, 3, 5, 14, 'h')
art = ["y.........",
       ".....S.S..",
       "....rrrr..",
       "...rrkrrr.",
       "..rRrrrrr.",
       ".rr..rrSr.",
       ".rR.rrS...",
       "...rrS....",
       "..rrS.....",
       "..rS......",
       ".........y"]
for j, row in enumerate(art):
    for i, ch in enumerate(row):
        if ch != '.': g.px(5 + i, 3 + j, ch)
N['tichu'] = g.rows()

# ── 티츄 특수 카드 4장 (한 칸씩 손으로 그림) ──
# 🐦 참새(숫자 1, 첫 차례): 왼쪽을 보는 동그란 참새 — 밤색 머리, 크림 볼에 검은 눈, 검은 턱받이, 노란 부리, 줄무늬 날개, 위로 든 꼬리
N['sparrow'] = [
 "................",
 "................",
 "....kkkk........",
 "...kDDDDk.......",
 "..kDDDDDDk......",
 "..kcckDDDDk...kk",
 "kkkcccDDdddkkkDk",
 "kYYkkccddddddkDk",
 ".kkkkcdddDdDdDDk",
 "...kbbdddDdDdDk.",
 "...kbbbbddDdDDk.",
 "...kbbbbbbddDk..",
 "....kbbbbbbbk...",
 ".....kkkkkkk....",
 "......o..o......",
 ".....oo.oo......",
]
# 🐶 강아지(개): 앞모습 — 축 늘어진 갈색 귀, 베이지 얼굴, 크림 주둥이, 검은 코, 분홍 볼·혀
N['puppy'] = [
 "................",
 "................",
 "....kkkkkkkk....",
 ".kkkbbddddbbkkk.",
 "kdddkbbbbbbkdddk",
 "kdddkbbbbbbkdddk",
 "kddkbbkbbkbbkddk",
 "kddkbbkbbkbbkddk",
 "kddkbbbbbbbbkddk",
 ".kkkbpccccpbkkk.",
 "...kbcckkccbk...",
 "...kbckcckcbk...",
 "....kbcrrcbk....",
 ".....kkkkkk.....",
 "................",
 "................",
]
# 🔥 봉황: 왼쪽을 보며 나는 불새 — 금빛 볏, 주황 몸, 위로 편 빨강·살구 날개, 아래로 말린 긴 꼬리깃(끝은 금빛)
N['phoenix'] = [
 "...y.y..........",
 "...kyk.....kk...",
 "..koook...krrk..",
 ".kookook.krOrk..",
 "kyykoooookrOOrk.",
 ".kkkooooorOOOrk.",
 "...koooorrOOrk..",
 "...kooooooOrk...",
 "....kooooooook..",
 ".....kkooorrrrk.",
 ".......krrkyyyrk",
 "......krrk.krryk",
 ".....kyrk...krrk",
 ".....kyk.....kyk",
 "......k.......k.",
 "................",
]
# 🐉 용(가장 센 카드): 빨간 용 머리 옆모습 — 금빛 뿔, 큰 눈, 벌린 입(이빨), 금빛 수염, 주황 갈기
g = G()
art = ["................",
       "....y....y......",
       "....yy...yy.....",
       ".....yy.yy......",
       "....rrrrrrr.....",
       "...rrrrrrrrr....",
       "..rrhkrrrrrrr...",
       ".rrrkkrrrrSrr...",
       "rrrrrrrrrrSrrO..",
       "rrrrrrrrrSSrrrO.",
       "hShShSSrrSrrSrO.",
       "rrrrrrrrrrSrrO..",
       ".rrrrrrrrSrr....",
       "..y....rrrr..O..",
       ".y.....rrr..O...",
       "........rr.O....",]
g.put(0, 0, [r.replace('.', '_') for r in art])
g.halo('k', diag=False)
N['tdragon'] = g.rows()

# 보드게임 말 칸 얼굴(v7.8 대사): 토리는 타코(q_octo)처럼 앞모습·큰 눈·볼터치. 왼쪽 반만 적고 좌우 대칭
M = lambda l: l + l[::-1]
S = lambda *r: [x if len(x) == 16 else M(x) for x in r]
N['tori_f'] = S("........",".kkk....","kpPpk.kk","kpppkkbb",".kbbbbbb","kbbbbbbb","kbbbbbbb","kbbkkbbb","kbbkhbbb","kbbkkbbb","kbppbbwk","kbppbwww",".kbbbwww",".kbbbbww","..kkbbbb","....kkkk")
# 도치: 옆모습 전신, 도트 고슴도치 요령대로 — 뒤로 누운 톱니 가시(밝은 가시 끝 s), 위·등 쪽 가시 결, 작은 귀, 크림 얼굴, 앞으로 뾰족한 코 끝 까만 코, 볼터치, 발 두 개
N['dochi'] = [
 "................",
 "..k..k..k.......",
 "..kskkskksk.....",
 ".kkDDdDDdDDk....",
 "ksDDdDDdDDDkk...",
 ".kDdDDdDDDktbk..",
 "ksDDdDDdDkttttk.",
 ".kDdDDdDDktkttk.",
 "ksDDdDDdDttktttk",
 ".kDDdDDDDtpttkk.",
 "..kDDDDDkbbtk...",
 "...kkkkkkkkk....",
 "....kk...kk.....",
 "................",
 "................",
 "................",
]

for k, v in N.items():
    assert len(v) == 16 and all(len(r) == 16 for r in v), (k, [len(r) for r in v])
print(json.dumps({'q_' + k: v for k, v in N.items()}))
