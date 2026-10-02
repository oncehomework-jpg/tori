# v4.4: 퀄리티가 아쉬웠던 아이콘 다시 그리기 (16x16, 색은 index.html PAL)
from pxdraw import G
N = {}
_B = [  # 🎸 일렉기타 바탕 (몸통 r, 목 b)
 "............Nkk.",
 "............kbbk",
 "...........kbbkN",
 "...........kbk..",
 "..........kbk...",
 ".........kbk....",
 "...kk...kbk.....",
 "..krk..kbk..kk..",
 "..krrkkbkk.krk..",
 ".krrrrbrrkkrrk..",
 ".krrrrrrrrrrk...",
 "krrrrrrrrrrk....",
 "krrrrrrrrrk.....",
 "krrrrrrrrrk.....",
 ".krrrrrrrk......",
 "..kkkkkkk......."]
_g = [list(r) for r in _B]
for y in range(16):
    for x in range(16):
        if _g[y][x] != 'r': continue
        d, sm = x - y, x + y
        if d in (-5, -9) and 13 <= sm <= 17:
            _g[y][x] = 'w'
        elif _B[y][x + 1] == 'k' or _B[y + 1][x] == 'k':
            _g[y][x] = 'S'
for x, y in [(3, 7), (3, 8), (2, 9), (2, 10)]: _g[y][x] = 'R'
for x, y in [(7, 12)]: _g[y][x] = 'y'
for x, y in [(10, 5), (12, 3)]: _g[y][x] = 'd'
_g[0][13] = 'k'; _g[1][14] = 't'
N['guitar'] = [''.join(r) for r in _g]
N['shooting'] = [  # 🌠
 "...........k....",
 "..........kyk...",
 "..........kyk...",
 ".......kkkyZykkk",
 "........kyyZyyk.",
 ".........kyyyk..",
 ".......V.kyyyk..",
 "......VVkyykyyk.",
 ".....VUVkYk.kYk.",
 "....VUV..k...k..",
 "...VUV..........",
 "..VUV...........",
 ".VUV............",
 ".UV.............",
 ".V..............",
 "................"]
from sprites import S
from sp2a import face

N['hug'] = [  # 🤗 (웃는 눈, 벌린 입, 앞으로 내민 두 손)
 ".....kkkkkk.....",
 "...kkyyyyyykk...",
 "..kyyyyyyyyyyk..",
 ".kyyyyyyyyyyyyk.",
 ".kyyyyyyyyyyyyk.",
 "kyyykyyyyyykyyyk",
 "kyykykyyyykykyyk",
 "kyyyyyyyyyyyyyyk",
 "kppyykkkkkkyyppk",
 "kyyyyykrrkyyyyyk",
 "kkkkyyykkyyykkkk",
 "kOOOkyyyyyykOOOk",
 "kOOOOkyyyykOOOOk",
 "kYOOOkyyyykOOOYk",
 ".kYYkYYYYYYkYYk.",
 "..kk.kkkkkk.kk.."]

N['shush'] = [
 ".....kkkkkk.....",
 "...kkyyyyyykk...",
 "..kyyyyyyyyyyk..",
 ".kyyyyyyyyyyyyk.",
 ".kyyykkyyyykkyk.",
 "kyyyyyyyyyyyyyyk",
 "kyyykkyyyykkyyyk",
 "kyyykkyyyykkyyyk",
 "kppyyyykkyyyyppk",
 "kyyyyykyykyyyyyk",
 "kyyyykkyykkyyyyk",
 ".kyyyykyykyyyyk.",
 ".kYykkyyyykkyYk.",
 "..kkyykyykyykk..",
 "..kYyyyyyyyyYk..",
 "...kkkkkkkkkk..."]

PAW = ["..kk.kk..", "..kk.kk..", ".........", "kk.....kk", "kk.kkk.kk", "..kkkkk..", ".kkkkkkk.", "..kkkkk.."]
g = G()  # 🐾 발자국 두 개
g.put(7, 0, [r.replace('.', '_') for r in PAW]); g.put(0, 8, [r.replace('.', '_') for r in PAW])
N['paws'] = g.rows()

N['palmdown'] = [  # 🫳 (손바닥이 아래로, 손가락은 오른쪽)
 "................",
 "................",
 "................",
 "......kkkk......",
 ".kkkkkyyyykkk...",
 "kuukyyyyyyyyykk.",
 "kuukyyyyyyyyyyyk",
 "kuukyyyyyykkkkkk",
 "kuukyyyyyyyyyyyk",
 "kuukyyyyyykkkkk.",
 "kuukyyyyyyyyyyk.",
 ".kkkYyyyykkkkk..",
 "....kYYYYyyyk...",
 ".....kkkkkkk....",
 "................",
 "................"]

N['swim'] = [  # 🏊 (자유형: 팔을 머리 위로 뻗어 물에 넣음)
 "................",
 "........kkk.....",
 ".......kttk.....",
 ".....kktkktk....",
 "...kkttk..ktk...",
 "..ktttk....ktk..",
 ".U.kkk.....ktk..",
 "U.U.kkkkk..ktk..",
 ".U.kRRrrrk.ktk..",
 "..krrrrrrrkktkU.",
 "..kNNkkkkkkvvvkU",
 "UUktttttkvvvvvkU",
 "UuUuuUuuuuUuuUuU",
 "uuuUuuuuuuuuuuuu",
 "uuuuuuuuuUuuuuuu",
 "uuuuuuUuuuuuuUuu"]

N['nope'] = [  # 🙅 (두 팔로 X)
 "....kkkkkkkk....",
 "...kDDDDDDDDk...",
 "..kDDDDDDDDDDk..",
 "..kDtttDDtttDk..",
 "..kDttttttttDk..",
 "..kDtkttttktDk..",
 "..kDpttttttpDk..",
 "...ktttkktttk...",
 "....kkttttkk....",
 ".kttkuuuuuukttk.",
 "..kttkuuuukttk..",
 ".kukttkuukttkuk.",
 ".kuukttttttkuuk.",
 ".kukttkuukttkuk.",
 "..kttkuuuukttk..",
 ".kttkuuuuuukttk."]

N['oden'] = [  # 🍢 (곤약 세모, 동그란 어묵, 네모 어묵 꼬치)
 ".......kk.......",
 "......kNNk......",
 ".....kNnNnk.....",
 "....kNNNNNNk....",
 "...kkkkddkkkk...",
 ".....kkddkk.....",
 "....kOOOOOOk....",
 "....kOZOOOOk....",
 "....kOOOOOok....",
 ".....kkddkk.....",
 "...kkkkddkkkk...",
 "...kwwwwwwwwk...",
 "...kwwpppwwwk...",
 "...kwwwwwwwwk...",
 "...kkkkddkkkk...",
 ".......kk......."]

g = G()  # 💫 (별과 빙글 꼬리, 크게)
g.star(10.5, 6.6, 5.3, 'y', 2.4)
g.halo('k', diag=False)
g.put(9, 4, ["_Z", "_Z", "Z"])
for y in range(16):
    for x in range(16):
        dx, dy = (x + .5 - 7.8) / 7.5, (y + .5 - 10.6) / 4.9
        if .86 <= (dx * dx + dy * dy) ** .5 <= 1.06 and g.a[y][x] == '.' and not (x > 10 and y < 10): g.a[y][x] = 'Y'
N['dizzystar'] = g.rows()
