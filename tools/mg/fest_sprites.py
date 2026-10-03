import math, json
from PIL import Image
class Grid:
    def __init__(s,w,h): s.w,s.h=w,h; s.a=[['.']*w for _ in range(h)]
    def set(s,x,y,c):
        x,y=int(x),int(y)
        if 0<=x<s.w and 0<=y<s.h: s.a[y][x]=c
    def get(s,x,y): return s.a[y][x] if 0<=x<s.w and 0<=y<s.h else '.'
    def rows(s): return [''.join(r) for r in s.a]
    def outline(s,c,skip=()):
        pts=[]
        for y in range(s.h):
            for x in range(s.w):
                if s.a[y][x]=='.' and any(s.get(x+dx,y+dy) not in ('.',c) and s.get(x+dx,y+dy) not in skip for dx,dy in((1,0),(-1,0),(0,1),(0,-1))): pts.append((x,y))
        for x,y in pts: s.a[y][x]=c
def from_rows(r):
    g=Grid(len(r[0]),len(r)); g.a=[list(x) for x in r]; return g
def mirror(rows): return [r[::-1] for r in rows]

# ---------- 유령 16x16 (2장) ----------
def ghost(fr):
    g=Grid(16,16)
    cx,cy,r=7.5,6.5,6.0
    for y in range(1,15):
        for x in range(1,15):
            dx,dy=x+.5-cx,y+.5-cy
            body = (dy<=0 and dx*dx+dy*dy<=r*r+1) or (dy>0 and abs(dx)<=r and y<=11)
            if not body: continue
            l=-dx*.55-dy*.6
            c='w'
            if dx>3.2 or (y>=10 and dx>1.5): c='v'
            if l>3.2 and dy<-1: c='W'
            g.set(x,y,c)
    # wavy bottom: 3 bumps, shift by frame
    for x in range(2,14):
        ph=(x-2+(2 if fr else 0))%4
        g.set(x,12,'v' if x>9 else 'w')
        if ph in (1,2): g.set(x,13,'v' if x>9 else 'w')
        if ph==1 and x<13: g.set(x,14,'v' if x>9 else 'w') if False else None
    # eyes (tall ovals) looking right a bit
    for (ex) in (6,10):
        g.set(ex,6,'e');g.set(ex,7,'e');g.set(ex+1,6,'e');g.set(ex+1,7,'e');g.set(ex,8,'e');g.set(ex+1,8,'e')
        g.set(ex,6,'W')
    g.set(4,9,'p');g.set(5,9,'p');g.set(12,9,'p')
    # mouth
    g.set(9,10,'e')
    g.outline('k')
    return g.rows()
GH_PAL={'k':'#3a2a52','w':'#f6f2ff','v':'#c9bce8','W':'#ffffff','e':'#2a1c40','p':'#f4a3bd'}
GH_MINT={'k':'#1f4a44','w':'#e3fbf1','v':'#9ad9c0','W':'#ffffff','e':'#173a35','p':'#f4a3bd'}
GH_SCARED={'k':'#1b2557','w':'#4a68d8','v':'#3449a8','W':'#7f98f0','e':'#fff3c8','p':'#4a68d8'}
GH_FLASH={'k':'#5a2a3a','w':'#fff3f6','v':'#e7c6d0','W':'#ffffff','e':'#d9483b','p':'#fff3f6'}

# ---------- 마녀 모자 토리 16x16 (오른쪽 보기, 2장) ----------
def tori(fr):
    g=Grid(16,16)
    # body (wide oval) rows 6-15
    cx,cy,rx,ry=7.5,10.8,6.6,4.9
    for y in range(4,16):
        for x in range(0,16):
            dx,dy=(x+.5-cx)/rx,(y+.5-cy)/ry
            if dx*dx+dy*dy<=1:
                c='o'
                if dx>.45 or dy>.55: c='O'
                if dx<-.3 and dy<-.4: c='L'
                g.set(x,y,c)
    # cream face/belly lower-front
    for y in range(9,16):
        for x in range(5,14):
            dx,dy=(x+.5-9.6)/3.9,(y+.5-12.4)/3.3
            if dx*dx+dy*dy<=1 and g.get(x,y)!='.': g.set(x,y,'c' if dy<.5 else 'C')
    # ear (back) pink
    for x,y,c in [(3,5,'o'),(3,4,'o'),(4,4,'p'),(4,5,'p')]: g.set(x,y,c)
    # eye + glint, nose, cheek
    g.set(10,9,'e');g.set(10,10,'e');g.set(11,9,'e');g.set(11,10,'e');g.set(10,9,'W')
    g.set(14,11,'p')
    g.set(12,12,'r');g.set(13,12,'r')
    # whisker
    # feet (walk anim)
    if fr==0: g.set(5,15,'P');g.set(10,15,'P')
    else: g.set(6,15,'P');g.set(11,15,'P')
    # witch hat: brim row 5 from x=2..12, cone up to tip at (4,0) bent back
    for x in range(2,13): g.set(x,5,'H' if x>9 else 'h')
    for x in range(3,12): g.set(x,4,'y' if 4<=x<=10 else 'h')
    cone=[(4,3,9),(4,2,8),(5,1,7),(4,0,5)]
    for y_,a,b in [(3,4,10),(2,5,9),(1,5,8),(0,4,6)]:
        for x in range(a,b+1): g.set(x,y_,'h' if x<b-1 else 'H')
    g.set(6,4,'Y')
    g.outline('k')
    return g.rows()
TORI_PAL={'k':'#3b2a1e','o':'#e9a85c','O':'#c47f3c','L':'#f6c98a','c':'#fff3dc','C':'#ecd3a9','p':'#f4a3ad','e':'#2a1c12','W':'#ffffff','r':'#f08a8a','P':'#f4a3ad','h':'#7b55b5','H':'#4e3480','y':'#f4c542','Y':'#fff0a6'}

# ---------- 사탕옥수수 7x8 ----------
CANDY=[
"...k...",
"..kwk..",
"..kwk..",
".koook.",
".kooOk.",
"kyyyyYk",
"kyyyyYk",
".kkkkk.",
]
CANDY_PAL={'k':'#4a2a1a','w':'#fffaf0','o':'#f39a3a','O':'#cf6f22','y':'#f6d04d','Y':'#d9a72a'}

# ---------- 호박 등불 14x13 (2장: 불빛 깜빡) ----------
def lantern(fr):
    g=Grid(14,13)
    for y in range(2,13):
        for x in range(0,14):
            dx,dy=(x+.5-7)/6.6,(y+.5-7.5)/5.2
            if dx*dx+dy*dy<=1:
                c='o'
                # ribs
                if x in (3,10): c='O'
                if x in (6,7) and y>3: c='O' if y>9 else 'o'
                if dx<-.4 and dy<-.2: c='L'
                if dx>.55 or dy>.6: c='O'
                g.set(x,y,c)
    # stem
    g.set(6,1,'g');g.set(7,1,'G');g.set(7,0,'G');g.set(6,2,'g');g.set(7,2,'G')
    # face (glow)
    gl='f' if fr==0 else 'F'
    for x,y in [(3,5),(4,5),(4,4),(9,5),(10,5),(9,4),(6,7),(7,7)]: g.set(x,y,gl)
    for x in range(3,11): g.set(x,9,gl)
    g.set(4,10,gl);g.set(6,10,gl);g.set(8,10,gl);g.set(10,10,gl)
    g.set(5,8,gl);g.set(9,8,gl)
    g.outline('k')
    return g.rows()
LANT_PAL={'k':'#4a2412','o':'#f08a2c','O':'#c9601c','L':'#ffb45e','g':'#5f9a3e','G':'#3f6e2e','f':'#fff3a0','F':'#ffd04a'}

# ---------- 하트 7x6 ----------
HEART=[".kk.kk.","krrkrrk","krRrrrk",".krrrk.","..krk..","...k..."]
HEART_PAL={'k':'#4a1a22','r':'#e84a5f','R':'#ffb3c0'}

# ---------- 선물 9x9 ----------
def gift(col):
    r=["..k...k..",
       ".kyk.kyk.",
       "kkkkykkkk",
       "kbbbybbBk",
       "kyyyyyyyk",
       "kbbbybbBk",
       "kbbbybbBk",
       "kBBBYBBBk",
       "kkkkkkkkk"]
    return r
GIFT_PALS=[{'k':'#3b1a1a','b':'#e0483c','B':'#a8302a','y':'#ffd84a','Y':'#d9a72a'},
           {'k':'#173a22','b':'#4fae5a','B':'#2f7a3c','y':'#ff6b6b','Y':'#c94a4a'},
           {'k':'#1a2a4a','b':'#5f9ae8','B':'#3c6ab8','y':'#fffaf0','Y':'#d8d0c0'},
           {'k':'#3a2a52','b':'#a77be0','B':'#7650b0','y':'#ffd84a','Y':'#d9a72a'}]

# ---------- 루돌프 26x18 (2장: 다리) ----------
def reindeer(fr):
    g=Grid(30,22);oy=3
    S=lambda x,y,c:g.set(x,y+oy,c)
    for y in range(6,15):
        for x in range(4,21):
            dx,dy=(x+.5-12.5)/8.0,(y+.5-10.5)/3.9
            if dx*dx+dy*dy<=1:
                c='b'
                if dy>.35: c='B'
                if dy<-.45 and dx<.3: c='l'
                if dy>.55 and -.6<dx<.5: c='c'
                S(x,y,c)
    # neck
    for y in range(3,9):
        for x in range(17,22):
            if (x-17)>=(8-y)*0.6-1 and (x-17)<=(8-y)*0.6+3: S(x,y,'b' if x<21 else 'B')
    # head
    for y in range(0,6):
        for x in range(19,28):
            dx,dy=(x+.5-23.0)/3.9,(y+.5-2.8)/2.5
            if dx*dx+dy*dy<=1: S(x,y,'b' if dy<.35 else 'B')
    for x,y in [(26,3),(26,4),(25,4),(27,3)]: S(x,y,'c')
    S(28,2,'n');S(28,3,'n');S(27,2,'n');S(29,3,'N');S(29,2,'n');S(28,1,'N')
    S(23,1,'e');S(23,2,'e')
    S(20,0,'B');S(19,0,'B')  # ear
    # antlers (branching)
    for x,y in [(21,-1),(21,-2),(20,-3),(22,-3),(19,-3),(23,-2),(23,-3),(24,-1),(24,-2),(25,-3)]: S(x,y,'a')
    S(20,-2,'A');S(22,-2,'A')
    S(4,8,'l');S(3,8,'l');S(3,7,'c')
    if fr==0:
        legs=[[(6,14),(5,15),(4,16),(3,16)],[(9,14),(9,15),(8,16),(8,17)],[(16,14),(17,15),(18,16),(19,16)],[(19,13),(20,14),(21,15),(22,15)]]
    else:
        legs=[[(6,14),(6,15),(6,16),(5,17)],[(9,14),(8,15),(7,16),(6,16)],[(16,14),(16,15),(16,16),(17,17)],[(19,13),(19,14),(20,15),(20,16)]]
    for L in legs:
        for i,(x,y) in enumerate(L): S(x,y,'h' if i==len(L)-1 else 'B')
    for y in range(7,13): S(17,y,'r')
    S(17,9,'y');S(17,10,'y')
    g.outline('k',skip=('a','A'))
    return g.rows()
DEER_PAL={'k':'#2e1d12','b':'#a8693a','B':'#7a4a26','l':'#c98b55','c':'#ead2a8','n':'#ff3030','N':'#ff9a8a','e':'#1a100a','a':'#d8b27a','A':'#a8844f','h':'#3b2a1e','r':'#d23a32','y':'#f4c542'}

# ---------- 산타 썰매 36x24 ----------
def sleigh(fr):
    g=Grid(38,26)
    # sack (behind santa) - brown bag with gifts
    for y in range(4,15):
        for x in range(2,13):
            dx,dy=(x+.5-7.5)/5.2,(y+.5-10)/5.4
            if dx*dx+dy*dy<=1: g.set(x,y,'s' if dx<.3 else 'S')
    g.set(6,4,'g');g.set(7,4,'g');g.set(7,3,'G');g.set(9,4,'q');g.set(10,4,'q');g.set(9,3,'Q');g.set(4,5,'Q');g.set(5,5,'q')
    for x in range(5,10): g.set(x,6,'S')
    # santa body (red coat) center x~19
    for y in range(6,16):
        for x in range(13,25):
            dx,dy=(x+.5-19)/5.6,(y+.5-12)/5.2
            if dx*dx+dy*dy<=1: g.set(x,y,'r' if dx<.35 else 'R')
    # arm reaching forward with reins
    for x,y in [(23,10),(24,10),(25,10),(26,10),(25,11),(24,11)]: g.set(x,y,'r')
    g.set(27,10,'m');g.set(27,11,'m')  # mitten
    # head: face, beard, hat
    for y in range(1,9):
        for x in range(16,24):
            dx,dy=(x+.5-20)/3.8,(y+.5-5)/3.6
            if dx*dx+dy*dy<=1: g.set(x,y,'f')
    for x,y in [(17,6),(18,6),(19,6),(20,6),(21,6),(22,6),(23,6),(17,7),(18,7),(19,7),(20,7),(21,7),(22,7),(18,8),(19,8),(20,8),(21,8),(22,8),(19,9),(20,9),(21,9),(20,10),(21,10)]: g.set(x,y,'w')
    g.set(22,5,'W');g.set(21,5,'W')  # mustache
    g.set(21,4,'e')   # eye
    g.set(23,5,'p')   # nose/cheek
    # hat
    for x in range(16,24): g.set(x,2,'w')
    for x,y in [(17,1),(18,1),(19,1),(20,1),(21,1),(22,1),(18,0),(19,0),(20,0),(21,0),(16,1),(15,1),(14,2)]: g.set(x,y,'r')
    g.set(14,3,'w');g.set(13,3,'w');g.set(13,2,'w')
    # belt
    for x in range(14,24): g.set(x,13,'k2')
    # sleigh body: red tub rows 12-21 x 6..32, front curl up at right
    for y in range(12,21):
        for x in range(4,33):
            top=12 if x<28 else 12-(x-28)
            if y<top: continue
            if x>30 and y>17: continue
            c='d' if y<14 else 'D'
            if y==12 or (x>=28 and y==top): c='t'
            if y==18: c='t'
            g.set(x,y,c)
    for x in range(28,34):
        top=int(round(12-(x-27)*1.1))
        for y in range(top,13): g.set(x,y,'d' if x<32 else 'D')
        g.set(x,top,'t')
    for x,y in [(34,5),(35,5),(36,6),(36,7),(35,8),(34,7)]: g.set(x,y,'t')
    # gold scroll ornament
    for x,y in [(10,15),(11,15),(12,16),(11,17),(10,16),(20,15),(21,15),(22,16),(21,17),(20,16)]: g.set(x,y,'t')
    # runners
    for x in range(4,35): g.set(x,23,'u')
    for x,y in [(35,22),(36,21),(36,20),(35,19),(8,21),(8,22),(16,21),(16,22),(24,21),(24,22),(30,21),(30,22)]: g.set(x,y,'u')
    g.set(3,22,'u');g.set(3,21,'u')
    g.outline('k')
    return [r.replace('k2','k') for r in g.rows()]
SLEIGH_PAL={'k':'#2a1410','s':'#b07a46','S':'#87582e','g':'#4fae5a','G':'#2f7a3c','q':'#5f9ae8','Q':'#ffd84a','r':'#e0453a','R':'#a82e28','m':'#3f6e2e','f':'#f6c7a0','w':'#ffffff','W':'#e8e4ee','e':'#2a1410','p':'#f08a8a','d':'#d63a32','D':'#9e2620','t':'#f4c542','u':'#d9a72a'}

SPR={
 'gh0':(ghost(0),GH_PAL),'gh1':(ghost(1),GH_PAL),
 'to0':(tori(0),TORI_PAL),'to1':(tori(1),TORI_PAL),
 'candy':(CANDY,CANDY_PAL),'lan0':(lantern(0),LANT_PAL),'lan1':(lantern(1),LANT_PAL),
 'heart':(HEART,HEART_PAL),'gift':(gift(0),GIFT_PALS[0]),
 'deer0':(reindeer(0),DEER_PAL),'deer1':(reindeer(1),DEER_PAL),
 'sleigh':(sleigh(0),SLEIGH_PAL),
}
def render(name_list,path,z=8,extra=None):
    items=[(n,)+SPR[n] for n in name_list]
    if extra: items+=extra
    W=sum(len(r[0])*z+16 for _,r,_ in items)+8;H=max(len(r)*z for _,r,_ in items)+16
    im=Image.new('RGB',(W,H),'#2b2440');x=8
    for n,rows,pal in items:
        for j,row in enumerate(rows):
            for i,ch in enumerate(row):
                if ch!='.':
                    col=pal.get(ch,'#ff00ff');c=tuple(int(col[k:k+2],16) for k in (1,3,5))
                    for yy in range(z):
                        for xx in range(z): im.putpixel((x+i*z+xx,8+j*z+yy),c)
        x+=len(rows[0])*z+16
    im.save(path)
if __name__=='__main__':
    import sys
    D='/tmp/claude-0/-home-user-tori/a377aa4e-db4b-5b89-8725-d41c288e456e/scratchpad/sp/'
    render(['gh0','gh1','to0','to1','candy','lan0','heart','gift'],D+'a.png',8,
           [('scared',ghost(0),GH_SCARED),('mint',ghost(1),GH_MINT)])
    render(['deer0','deer1','sleigh'],D+'b.png',8)
