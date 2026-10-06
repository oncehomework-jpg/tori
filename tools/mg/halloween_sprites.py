"""v7.5 유령 잡기(mg5) 도트 그림 원본. python3로 실행하면 확인용 png와 index.html에 넣을 JSON(FXH)을 만든다.
규칙: 한 칸 = 화면 2px, 빛은 왼쪽 위, 테두리는 같은 색 계열 한 가지(k). 유령은 FX.P의 purp 같은 색바꿈과 글자(k,w,v,W,e,p)를 맞춰 둠."""
import json, sys
from PIL import Image
class Grid:
    def __init__(s,w,h): s.w,s.h=w,h; s.a=[['.']*w for _ in range(h)]
    def set(s,x,y,c):
        x,y=int(x),int(y)
        if 0<=x<s.w and 0<=y<s.h: s.a[y][x]=c
    def get(s,x,y): return s.a[y][x] if 0<=x<s.w and 0<=y<s.h else '.'
    def rows(s): return [''.join(r) for r in s.a]
    def outline(s,c):
        pts=[(x,y) for y in range(s.h) for x in range(s.w) if s.a[y][x]=='.' and any(s.get(x+dx,y+dy) not in ('.',c) for dx,dy in((1,0),(-1,0),(0,1),(0,-1)))]
        for x,y in pts: s.a[y][x]=c

# ---------- 유령 22x24 (3장: 둥실 2장 + 맞았을 때) ----------
def ghost(fr, hit=False):
    g=Grid(22,24); cx,cy,r=10.5,9.5,8.5
    for y in range(1,22):
        for x in range(1,21):
            dx,dy=x+.5-cx,y+.5-cy
            body=(dy<=0 and dx*dx+dy*dy<=r*r)or(dy>0 and abs(dx)<=r and y<=17)
            if not body: continue
            c='w'
            l=-dx*.6-dy*.55
            if dx>4.2 or (y>=14 and dx>2.2): c='v'
            if dx>6.2 and dy<2: c='v'
            if l>4.6 and dy<-2: c='W'
            g.set(x,y,c)
    # 물결 치맛자락
    for x in range(2,20):
        ph=(x-2+(3 if fr else 0))%6
        col='v' if x>12 else 'w'
        g.set(x,18,col)
        if ph in (1,2,3): g.set(x,19,col)
        if ph in (2,3): g.set(x,20,col)
        if ph==2 and x<19: g.set(x,21,col)
    # 팔 (양옆으로 살짝 들기)
    for (x,y) in [(1,12),(2,12),(1,13),(19,12),(20,12),(20,13)]: g.set(x,y,'w' if x<10 else 'v')
    if fr:
        for (x,y) in [(0,11),(1,11),(21,11),(20,11)]: g.set(x,y,'w' if x<10 else 'v')
    # 눈
    if hit:
        for ex in (6,13):
            for d in range(4): g.set(ex+d,7+d,'e'); g.set(ex+3-d,7+d,'e')
        for x in range(8,13): g.set(x,14,'e')
        g.set(8,13,'e'); g.set(12,13,'e')
    else:
        for ex in (6,13):
            for yy in range(7,12):
                g.set(ex,yy,'e'); g.set(ex+1,yy,'e')
            g.set(ex,7,'W'); g.set(ex+1,8,'e')
        # 입: 오 (놀란 입)
        for (x,y) in [(10,13),(11,13),(9,14),(12,14),(9,15),(12,15),(10,16),(11,16)]: g.set(x,y,'e')
        g.set(10,14,'e');g.set(11,14,'e');g.set(10,15,'e');g.set(11,15,'e')
    # 볼
    for (x,y) in [(4,12),(5,12),(4,13),(5,13),(16,12),(17,12),(16,13),(17,13)]: g.set(x,y,'p')
    g.outline('k'); return g.rows()

# ---------- 호박 28x24 (캄캄한 얼굴 / 불 켜진 얼굴) ----------
PK_PAL={'k':'#3a1408','d':'#8f3a12','o':'#c4561a','O':'#f08a1f','L':'#ffb347','H':'#ffd98a','g':'#4d7a2a','G':'#2f5a1e','l':'#7fae3a','e':'#2b0f06','y':'#ffd96a','Y':'#f4a42a'}
def pumpkin(lit):
    g=Grid(28,24)
    lobes=[(14,14,6.4,8.6),(8.8,14.5,5.6,7.6),(19.2,14.5,5.6,7.6),(5,15.5,3.9,5.8),(23,15.5,3.9,5.8)]
    def inside(x,y,L):
        cx,cy,rx,ry=L; return ((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2<=1
    order=[3,4,1,2,0]
    for i in order:
        L=lobes[i]
        for y in range(24):
            for x in range(28):
                if not inside(x,y,L): continue
                cx,cy,rx,ry=L; dx,dy=(x+.5-cx)/rx,(y+.5-cy)/ry
                c='O'
                if dx>.35 or dy>.5: c='o'
                if dx>.7 or dy>.82: c='d'
                if dx<-.35 and dy<-.2: c='L'
                if dx<-.55 and dy<-.45: c='H'
                g.set(x,y,c)
        # 골 (lobe 사이 어두운 줄)
        if i in(1,2,0):
            pass
    # 줄기
    for (x,y,c) in [(13,4,'G'),(14,4,'G'),(15,4,'g'),(12,5,'G'),(13,5,'g'),(14,5,'g'),(15,5,'g'),(16,5,'G'),(13,6,'g'),(14,6,'g'),(15,6,'G'),(13,7,'G'),(14,7,'g'),(15,7,'G'),(16,3,'g'),(17,2,'g'),(17,3,'G')]: g.set(x,y,c)
    g.set(13,5,'l');g.set(13,6,'l')
    # 앞으로 옆 줄 골 선
    for y in range(9,23):
        for xx in (9,19):
            if g.get(xx,y) in 'OLHo': g.set(xx,y,'o' if y<18 else 'd')
    # 얼굴(조각) : 삼각 눈, 톱니 입
    face='e' if not lit else 'y'
    for x,y in [(9,12),(10,12),(11,12),(10,11),(10,13),(11,13),(9,13)]: pass
    eyeL=[(9,13),(10,12),(10,13),(11,11),(11,12),(11,13),(12,13),(8,13),(9,12)]
    for (dx) in (0,):
        for (x,y) in [(9,12),(10,12),(11,12),(12,12),(8,13),(9,13),(10,13),(11,13),(12,13),(13,13),(10,11),(11,11),(11,10)]:
            g.set(x-1+0,y,face)
        for (x,y) in [(9,12),(10,12),(11,12),(12,12),(8,13),(9,13),(10,13),(11,13),(12,13),(13,13),(10,11),(11,11),(11,10)]:
            g.set(28-1-(x-1),y,face)
    for y in range(17,21):
        for x in range(7,21): g.set(x,y,face)
    for x in range(8,20):
        g.set(x,16,face) if x%4 in (0,1) else None
    for x in range(8,20):
        if x%4 in (2,3): g.set(x,20,'.' if False else 'o') ; g.set(x,19,'o') if False else None
    for x in range(7,21):
        if (x-7)%4>=2: g.set(x,17,'O' if g.get(x,17)=='.' else 'O')
    if lit:
        for y in range(17,21):
            for x in range(8,20): g.set(x,y,'y' if (x+y)%5 else 'Y')
        for x in range(8,20):
            if x%4 in (2,3): g.set(x,17,'O'); g.set(x,20,'o')
    g.outline('k')
    return g.rows()

# ---------- 박쥐 24x14 (날개 올림 / 내림) ----------
BT_PAL={'k':'#1a0f2e','m':'#4a3a6e','M':'#6a5694','n':'#2e2250','r':'#ff5a5a','w':'#fffaf0','p':'#e89ab6'}
def bat(fr):
    g=Grid(24,14)
    # 몸통
    for y in range(4,12):
        for x in range(9,15):
            dx,dy=(x+.5-12)/3.3,(y+.5-8)/4.2
            if dx*dx+dy*dy<=1: g.set(x,y,'m' if dx<.2 else 'n')
    # 귀
    for (x,y) in [(9,2),(9,3),(10,3),(14,2),(14,3),(13,3),(10,4),(13,4)]: g.set(x,y,'m')
    g.set(10,3,'p');g.set(13,3,'p')
    # 날개
    for side in (0,1):
        for i in range(9):
            x=8-i if side==0 else 15+i
            top=(2-i//3) if fr==0 else (8+i//4)
            bot=(7+i//3) if fr==0 else (12+0)
            if fr==0: top=max(0,3-i//2); bot=7+i//2
            else: top=7+i//4; bot=10+i//2
            for y in range(top,min(13,bot+1)):
                g.set(x,y,'M' if y==top else 'm' if (y-top)<2 else 'n')
        # 날개 끝 갈래(물결)
        for i in range(1,9,2):
            x=8-i if side==0 else 15+i
            yy=(7+i//2+1) if fr==0 else (10+i//2+1)
            g.set(x,min(13,yy),'.')
    # 눈, 송곳니
    g.set(10,7,'r');g.set(13,7,'r');g.set(11,10,'w');g.set(12,10,'w')
    g.outline('k'); return g.rows()

SPR={'ghA':(ghost(0),{'k':'#3a2a52','w':'#f6f2ff','v':'#c9bce8','W':'#ffffff','e':'#2a1c40','p':'#f4a3bd'}),
     'ghB':(ghost(1),{'k':'#3a2a52','w':'#f6f2ff','v':'#c9bce8','W':'#ffffff','e':'#2a1c40','p':'#f4a3bd'}),
     'ghX':(ghost(0,True),{'k':'#3a2a52','w':'#f6f2ff','v':'#c9bce8','W':'#ffffff','e':'#2a1c40','p':'#f4a3bd'}),
     'pk0':(pumpkin(False),PK_PAL),'pk1':(pumpkin(True),PK_PAL),
     'bt0':(bat(0),BT_PAL),'bt1':(bat(1),BT_PAL)}
def render(path,z=8):
    items=list(SPR.items());W=sum(len(r[0])*z+16 for _,(r,_) in items)+8;H=max(len(r)*z for _,(r,_) in items)+16
    im=Image.new('RGB',(W,H),'#2b2440');x=8
    for n,(rows,pal) in items:
        for j,row in enumerate(rows):
            for i,ch in enumerate(row):
                if ch!='.':
                    col=pal.get(ch,'#ff00ff');c=tuple(int(col[k:k+2],16) for k in (1,3,5))
                    for yy in range(z):
                        for xx in range(z): im.putpixel((x+i*z+xx,8+j*z+yy),c)
        x+=len(rows[0])*z+16
    im.save(path)
if __name__=='__main__':
    out=sys.argv[1] if len(sys.argv)>1 else 'halloween.png'
    render(out,6)
    print(json.dumps({n:[r,p] for n,(r,p) in SPR.items()},ensure_ascii=False,separators=(',',':')))
