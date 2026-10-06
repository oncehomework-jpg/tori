"""v6.8 '도망가는 루돌프를 잡아라!' 그림 원본 (그림 한 칸 = 화면 2px).
python3 tools/mg/xmas_chase_sprites.py  → index.html FX 에 넣을 JSON 출력
- tos0/tos1: 산타 모자 토리 (마녀 모자 토리 to0/to1 의 몸 + 새 모자)
- carrot: 당근 (눈사람 타코·나무·배경은 index.html의 chSnowman·chTree·chBack이 그림)"""
import json, re, os, sys
HAT=["................",
     "......kkkk......",
     ".kk..khhhHk.....",
     "kWWk.khhhhHk....",
     "kWWkkhhhhhhHk...",
     ".kkhhhhhhhhHHk..",
     ".kyYyyyyyyyyyk.."]
SANTA_PAL={'h':'#d63a32','H':'#9e2620','y':'#eef0f8','Y':'#ffffff','W':'#ffffff'}
CARROT=["...g.g..",
        "..kgGgk.",
        "..kGgGk.",
        ".kLoooOk",
        ".kLoooOk",
        "..kLooOk",
        "..kLoOk.",
        "...koOk.",
        "...kOk..",
        "....k..."]
CARROT_PAL={'k':'#5a2a10','o':'#f08a2a','O':'#c25a14','L':'#ffb866','g':'#6fb84a','G':'#3f7a2e'}
def snowtk():
    W,H=20,27;a=[['.']*W for _ in range(H)]
    def S(x,y,c):
        if 0<=x<W and 0<=y<H:a[y][x]=c
    # 타코 머리 (분홍 문어)
    for y in range(1,11):
        for x in range(3,17):
            dx,dy=(x+.5-10)/6.3,(y+.5-7)/5.8
            if dx*dx+dy*dy<=1 and y<=10:
                l=-dx*.6-dy*.7;S(x,y,'L' if l>.55 else 'P' if (dx>.45 or dy>.6) else 'p')
    for x,y in [(7,6),(7,7),(12,6),(12,7)]:S(x,y,'e')
    S(7,6,'W');S(12,6,'W');S(5,8,'c');S(14,8,'c');S(9,9,'e');S(10,9,'e')
    # 목도리
    for x in range(4,16):S(x,11,'r');S(x,12,'R' if x>11 else 'r')
    for y in range(13,17):S(14,y,'r');S(15,y,'R')
    # 눈덩이 몸
    for y in range(12,27):
        for x in range(1,19):
            if a[y][x]!='.':continue
            dx,dy=(x+.5-10)/8.2,(y+.5-19.5)/7.2
            if dx*dx+dy*dy<=1:
                l=-dx*.6-dy*.7;S(x,y,'W' if l>.6 else 'v' if (dx>.4 or dy>.5) else 'w')
    for y in (16,19,22):S(10,y,'e')
    # 나뭇가지 팔
    for x,y in [(0,13),(1,14),(2,15),(19,13),(18,14),(17,15),(0,12)]:S(x,y,'b')
    # 테두리 한 가지 색
    pts=[]
    for y in range(H):
        for x in range(W):
            if a[y][x]=='.' and any(0<=x+dx<W and 0<=y+dy<H and a[y+dy][x+dx] not in '.kb' for dx,dy in((1,0),(-1,0),(0,1),(0,-1))):pts.append((x,y))
    for x,y in pts:a[y][x]='k'
    return [''.join(r) for r in a]
SNOWTK_PAL={'k':'#2a3050','p':'#f29bb0','P':'#d06f8c','L':'#ffc6d4','e':'#2a1c30','W':'#ffffff','c':'#ff7f9a','r':'#d63a32','R':'#9e2620','w':'#eef3fb','v':'#bccbe6','b':'#6a4428'}
# 산타 16x20 (오른쪽 보기, 2장: 다리) — 시안
SANTA_TOP=["................",
           "...kkkkk........",
           "..krrrrrkk......",
           ".krrrrrrrRk.....",
           "kWkrrrrrrRRk....",
           "kWkwwwwwwwwwk...",
           ".kkfffffffffk...",
           "..kfffffefpfk...",
           "..kwwffwwwwfk...",
           ".kwwwwwwwwwwk...",
           ".kWwwwwwwwwWk...",
           "..kWwwwwwwWk....",
           ".kRrkWWWWkrrk...",
           "kRrrrkkkkrrrrk..",
           "kfkbbbbybbbkfk..",
           ".kkRrrrrrrRkk...",
           "..kwwwwwwwwk...."]
SANTA_LEG=[["..kRRk..kRRk....",".kBBBk..kBBBk...",".kkkk....kkkk..."],
           ["...kRRkkRRk.....","..kBBBkkBBBk....","..kkkkkkkkkk...."]]
SANTA_PAL={'k':'#2a1410','r':'#d63a32','R':'#9e2620','w':'#ffffff','W':'#dfe3ee','f':'#f6c7a0','e':'#2a1410','p':'#f08a8a','b':'#2a1c20','y':'#f4c542','B':'#3a2a2a'}
def build(fx):
    out={}
    for n in ('to0','to1'):
        rows,pal=fx['S'][n];out['tos'+n[-1]]=[HAT+rows[6:],{**pal,**SANTA_PAL}]  # 모자 7줄 + 머리부터 아래
    out['carrot']=[CARROT,CARROT_PAL]
    for i in (0,1): out['san%d'%i]=[SANTA_TOP+SANTA_LEG[i],SANTA_PAL]
    return out
if __name__=='__main__':
    s=open(os.path.join(os.path.dirname(__file__),'..','..','index.html'),encoding='utf-8').read()
    fx=json.loads(re.search(r'const FX=(\{.*?\});\n',s,re.S).group(1))
    o=build(fx)
    for k,(r,_) in o.items():print(k,len(r[0]),'x',len(r),file=sys.stderr);print('\n'.join(r),file=sys.stderr)
    print(json.dumps(o,ensure_ascii=False,separators=(',',':')))
