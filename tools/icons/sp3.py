# v4.4: 퀄리티가 아쉬웠던 아이콘 다시 그리기 (16x16, 색은 index.html PAL)
from pxdraw import G
N = {}
N['guitar'] = [  # 🎸 (대각선 일렉기타: 빨간 몸통·뿔 두 개·흰 판·픽업)
 "............Nkk.",
 "............kbbk",
 "...........kbbkN",
 "...........kbk..",
 "..........kbk...",
 ".........kbk....",
 "...kk...kbk.....",
 "..krk..kbk..kk..",
 "..kRrkkbkk.krk..",
 ".krrwrbrrkkrrk..",
 ".krrrwrrrrrrk...",
 "krwrrrwrrrrk....",
 "krrwrrrrrrk.....",
 "krrrwrrrrrk.....",
 ".krrrrrrrk......",
 "..kkkkkkk......."]
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

g = G()  # 💫 (별이 빙글 돌며 남긴 동그란 꼬리: 별 쪽은 굵고 끝은 가늘게)
import math as _m
CX, CY, R, A0, SPAN = 7.4, 8.9, 5.2, -40, 310
for y in range(16):
    for x in range(16):
        dx, dy = x + .5 - CX, y + .5 - CY
        a = (A0 - _m.degrees(_m.atan2(dy, dx))) % 360   # 별에서 거꾸로 돈 각도
        if a > SPAN: continue
        t = a / SPAN; w = 1.6 * (1 - t) ** 1.3 + .2
        d = abs(_m.hypot(dx, dy) - R)
        if d <= w: g.a[y][x] = 'y' if (t < .35 and d <= w - .6) else 'Y'
st = G(); st.star(CX + R * _m.cos(_m.radians(A0)), CY + R * _m.sin(_m.radians(A0)), 4.3, 'y', 2.0); st.halo('k', diag=False)
st.put(int(CX + R * _m.cos(_m.radians(A0))) - 1, int(CY + R * _m.sin(_m.radians(A0))) - 2, ["_Z", "Z"])
for y in range(16):
    for x in range(16):
        if st.a[y][x] != '.': g.a[y][x] = st.a[y][x]
N['dizzystar'] = g.rows()
