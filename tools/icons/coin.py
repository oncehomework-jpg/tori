"""도토리 코인 아이콘 q_coin (16x16). python3 coin.py 로 실행하면 줄 목록(JSON)과 확대 png(/tmp/coin.png)를 만든다."""
import json
W=16;c=7.5
g=[['.']*W for _ in range(W)]
for y in range(W):
    for x in range(W):
        dx,dy=x-c,y-c;d=(dx*dx+dy*dy)**.5
        if d>7.9: continue
        l=-(dx+dy)           # 왼쪽 위가 밝음
        if d>7.0: ch='k'
        elif d>5.9: ch='t' if l>5 else 'b' if l>-1 else 'd' if l>-6 else 'D'
        else: ch='d'
        g[y][x]=ch
AC=["...DD...",".ttttbb.","ttttbbbb","bbbbbbbb",".DDDDDD.",".tbbbbd.",".tbbbbd.","..bbbd..","...bd..."]
for j,row in enumerate(AC):      # 그림자(오른쪽 아래 한 칸) 먼저
    for i,ch in enumerate(row):
        x,y=4+i+1,3+j+1
        if ch!='.' and 0<=x<W and 0<=y<W and g[y][x]=='d': g[y][x]='D'
for j,row in enumerate(AC):
    for i,ch in enumerate(row):
        if ch!='.': g[3+j][4+i]=ch
g[1][5]='h';g[2][4]='h'
rows=[''.join(r) for r in g]
print(json.dumps(rows))
try:
    from PIL import Image
    PAL={'k':'#4a3423','D':'#7a4a25','d':'#a26a37','b':'#e8c48c','t':'#f3d2a2','h':'#ffffff'}
    z=20;im=Image.new('RGB',(W*z,W*z),'#efe2c6')
    for j,r in enumerate(rows):
        for i,ch in enumerate(r):
            if ch!='.':
                col=PAL[ch];rgb=tuple(int(col[k:k+2],16) for k in (1,3,5))
                for a in range(z):
                    for b in range(z): im.putpixel((i*z+a,j*z+b),rgb)
    im.save('/tmp/claude-0/s/coin.png')
except Exception as e: print(e)
