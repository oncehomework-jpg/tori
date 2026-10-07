# v8.1: 보드게임 '사라진 도토리 사건' 아이콘 (16x16, 색은 index.html PAL)
# 🐿 호두(다람쥐): 도치(q_dochi)처럼 오른쪽을 보는 옆모습 전신 — 등 뒤로 솟아 끝이 앞으로 말린 큰 꼬리(밝은 주황 O + 털결 d),
#   주황 몸·크림 배, 귀 끝 털(D), 까만 눈, 볼터치, 앞발·뒷발. 꼬리를 먼저 그리고 테두리를 따로 둘러 몸과 갈라 보이게 함.
# 보기: python3 sp6.py > new.json  (앱에는 Object.assign(SP,{...})로 넣음)
import json
N = {}
N['squi'] = [
 "...kkk....kDk...",
 "..kOOOk..koDk...",
 "..kOOook.kook...",
 ".kOOoookkOOook..",
 "kOOoodkkOOookok.",
 "kOOOookkOoookook",
 "kOOdookkoooootkk",
 "kOooookkkoooptk.",
 "kOOOookkOOokkk..",
 "kOOodokOOootook.",
 ".kOookOOootttk..",
 ".kOOokooootttk..",
 "..koookooootok..",
 "...kkk.kooooook.",
 "........kkkkkk..",
 "................",
]
# 🦉 부엉박사: 앞모습 전신 — 학사모(술 노랑) + 금테 안경, 귀깃, 가슴 깃 무늬, 주황 발 (사용자가 B안 고름 2026.10.07)
N['owl'] = [
 "....kkkkkkkk....",
 "..kmmmmmmmmmmk..",
 "..kDkmmmmmmkDy..",
 "..kDDkkkkkkDDy..",
 ".kDDDDDDDDDDDDk.",
 ".kDdYYYDDYYYdDk.",
 "kDdYshkYYkhsYdDk",
 "kDdYskkYYkksYdDk",
 "kDDdYYYyyYYYdDDk",
 "kdDDDDsYYsDDDDdk",
 "kdDtbtbttbtbtDdk",
 "kdDbtbtbbtbtbDdk",
 ".kdDtbttttbtDdk.",
 ".kDDttttttttDDk.",
 "..kkkkkkkkkkkk..",
 ".....oo..oo....."
]
# 🐱 냐옹이: 앞모습 전신 치즈 고양이 — 분홍 귀, 초록 눈, 흰 입·가슴, 빨간 목걸이 금방울, 오른쪽 꼬리 (B안)
N['cat'] = [
 ".kk..........kk.",
 ".kpk........kpk.",
 ".kppkkkkkkkkppk.",
 ".kOOOOoOOoOOOOk.",
 "kOZOOOOOOOOOOZOk",
 "kOZOgkOOOOkgOZOk",
 "kOOOkkOOOOkkOOOk",
 "kOOOOhhhhhhOOOOk",
 ".kOOOhhpphhOOOOk",
 "..kkOhkhhkhOkOk.",
 "...krrrrrrrrkOk.",
 "...kOOhyyhOOkOk.",
 "..kOZOhhhhOZOk..",
 "..kOOOhhhhOOOk..",
 "..kOOkhkkhkOOk..",
 "...kkkkkkkkkk..."
]

for k, v in N.items():
    assert len(v) == 16 and all(len(r) == 16 for r in v), (k, [len(r) for r in v])
print(json.dumps({'q_' + k: v for k, v in N.items()}))
