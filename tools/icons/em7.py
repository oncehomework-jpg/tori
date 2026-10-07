# v8.4: emoji2px.py로 자동 변환했을 때 흐릿했던 이모지 7개를 손으로 다시 그림. python3 em7.py → em7sp.json (index.html의 q_e<코드>를 바꿈)
import json
def O(rows):
    g=[list(r.ljust(16,'.')[:16]) for r in rows]+[['.']*16 for _ in range(16-len(rows))]
    o=[r[:] for r in g]
    for y in range(16):
        for x in range(16):
            if g[y][x]=='.' and any(0<=x+a<16 and 0<=y+b<16 and g[y+b][x+a] not in '.k' for a,b in((1,0),(-1,0),(0,1),(0,-1))):o[y][x]='k'
    return [''.join(r) for r in o]
E={}
# 💇 머리 손질: 긴 밤색 머리 소녀 + 오른쪽 위 빗
E['💇']=O(["",
"......DDDD....nn",
".....DdDDDD..nNn",
"....DdDDDDDD.nn.",
"....DDbbbbDD.n..",
"...DDbbbbbbDD...",
"...DDbkbbkbDD...",
"...DDbbbbbbDD...",
"...DDpbbbbpDD...",
"...DDDbbrbDDD...",
"...DDDDbbDDDD...",
"..DDDDuuuuDDDD..",
"..DDDuuuuuuDDD..",
"..DDuuUuuuuuDD..",
"...uuuuuuuuuu..."])
# 👸 공주: 금관 + 금발 + 분홍 드레스
E['👸']=O(["",
"....y..yy..y....",
"....yyyRRyyy....",
"....yyyyyyyy....",
"...YYYYYYYYYY...",
"..yYbbbbbbbbYy..",
"..yYbkbbbbkbYy..",
"..yYbbbbbbbbYy..",
"..yYpbbrrbbpYy..",
"..yyYbbbbbbYyy..",
"..yyyybbbbyyyy..",
".yyyPPPPPPPPyyy.",
"..yPPpPPPPpPPy..",
"..PPPPPPPPPPPP..",
"..PPPPPPPPPPPP.."])
# 🦗 귀뚜라미: 초록 몸, 긴 더듬이, 접힌 날개, 뒷다리
E['🦗']=O(["",
".........d......",
"..........d.....",
"...........d..d.",
"............dd..",
"...........ggg..",
"...lllllllggkgg.",
"..lllllllgggggg.",
"..GGGGGGGGgggg..",
"...GGGGGGGGg....",
"....d.d...d.d...",
"...d..d..d...d..",
"..d....d.d....d."])
# 🎎 히나 인형: 왼쪽 남자(남색 옷·검은 모자), 오른쪽 여자(빨간 옷·금관)
E['🎎']=O(["",
"..mm.......yy...",
"..mm......yyyy..",
".mmmm.....mmmm..",
".mttm.....mttm..",
".mttm.....mttm..",
"..tt.......tt...",
".BBBBB...rrrrr..",
"BBuBuBB.rrOrOrr.",
"BBBuBBB.rrrOrrr.",
"BBBBBBB.rrrrrrr.",
"BBBBBBB.rRRRRRr.",
"BBBBBBB.rrrrrrr.",
"yyyyyyyyyyyyyyyy"])
# 📱 휴대폰: 진한 몸 + 파란 화면 + 아래 단추
E['📱']=O(["",
"....mmmmmmmm....",
"....mmmnnmmm....",
"....mUUUUUUm....",
"....mUhhUUUm....",
"....mUhUUUUm....",
"....mUUUUUUm....",
"....mUUUUUUm....",
"....mUUUUUUm....",
"....mUUUUUUm....",
"....mUUUUUUm....",
"....mmmmmmmm....",
"....mmmNNmmm....",
"....mmmmmmmm...."])
# 🏘 집 두 채: 뒤 파란 지붕 큰 집, 앞 빨간 지붕 작은 집
E['🏘']=O(["",
"",
"....uu..........",
"...uuuu.........",
"..uuuuuu........",
".uuuuuuuu.rr....",
"..ssssss.rrrr...",
"..sUsUss.rrrrrr.",
"..ssssssrrrrrrrr",
"..sUsUss.wwwwww.",
"..sssDss.wUwwUw.",
"..sssDss.wwddww.",
"..sssDss.wwddww.",
"ggggggggggggggggg"])
# 🧣 목도리: 빨강 몸 + 흰 줄무늬, 늘어진 끝에 술
E['🧣']=O(["",
"....rrrrrrrr....",
"...rrRRRRRRrr...",
"..rrR......Rrr..",
"..rrR......Rrr..",
"...rrrrrrrrrr...",
"....rrhhrrrr....",
".........rhr....",
".........rrr....",
".........hhh....",
".........rrr....",
".........rrr....",
".........hhh....",
".........r.r....",
".........r.r...."])
json.dump(E,open('em7.json','w'),ensure_ascii=False)
json.dump({'q_e%x'%ord(k):v for k,v in E.items()},open('em7sp.json','w'))
