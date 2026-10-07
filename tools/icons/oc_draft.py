import json
W=16
def new():return [['.']*W for _ in range(W)]
def P(g,x,y,c):
    if 0<=x<W and 0<=y<W:g[y][x]=c
def ell(g,cx,cy,rx,ry,f):
    for y in range(W):
        for x in range(W):
            nx,ny=(x+.5-cx)/rx,(y+.5-cy)/ry
            if nx*nx+ny*ny<=1:P(g,x,y,f(nx,ny))
def outl(g):
    o=[]
    for y in range(W):
        for x in range(W):
            if g[y][x]=='.' and any(0<=x+a<W and 0<=y+b<W and g[y+b][x+a] not in '.k' for a,b in((1,0),(-1,0),(0,1),(0,-1))):o.append((x,y))
    for x,y in o:g[y][x]='k'
def over(a,b):
    for y in range(W):
        for x in range(W):
            if b[y][x]!='.':a[y][x]=b[y][x]
    return a
def owl(cap):
    g=new()
    # 몸(달걀형), 오른쪽을 봄
    ell(g,7.6,9.4,5.2,5.6,lambda nx,ny:'d' if nx+ny<-.7 else 'D')
    ell(g,9.6,10.6,2.6,3.6,lambda nx,ny:'t' if (int((ny+1)*3))%2 else 'b')      # 가슴 깃
    # 머리 앞 얼굴판
    ell(g,10.2,6.4,2.6,2.4,lambda nx,ny:'s')
    # 귀깃
    P(g,5,2,'D');P(g,4,1,'D');P(g,5,3,'D');P(g,6,3,'D')
    # 날개(접힘)
    ell(g,6.0,10.0,2.6,3.6,lambda nx,ny:'d' if ny<-.3 else 'D')
    for x,y in [(5,10),(6,11),(5,12)]:P(g,x,y,'b')
    # 발
    P(g,7,15,'o');P(g,9,15,'o');P(g,8,15,'o') if False else None
    P(g,2,13,'D');P(g,2,14,'D')   # 꼬리깃
    outl(g)
    # 눈+안경
    for x,y in [(9,5),(10,5),(11,5),(9,6),(11,6),(9,7),(10,7),(11,7)]:P(g,x,y,'Y')
    P(g,10,6,'k');P(g,12,6,'Y');P(g,13,6,'Y') if False else None
    # 부리
    P(g,13,7,'y');P(g,14,7,'k') if g[7][14]=='.' else P(g,13,8,'Y')
    P(g,13,8,'Y')
    if cap:
        for x in range(4,11):P(g,x,1,'m')
        for x in range(5,10):P(g,x,2,'m')
        P(g,11,1,'k');P(g,3,1,'k');P(g,7,0,'m');P(g,10,2,'y');P(g,10,3,'y')
        for x in range(3,12):
            if g[0][x]=='.':P(g,x,0,'k')
    return [''.join(r) for r in g]
def cat(col):
    body,lt,st=col
    t=new()
    for x,y in [(2,14),(1,13),(1,12),(1,11),(1,10),(2,9),(3,9)]:P(t,x,y,body)
    P(t,1,11,st);P(t,2,9,st)
    outl(t)
    g=new()
    ell(g,7.2,12.0,4.4,3.4,lambda nx,ny:lt if nx+ny<-.9 else body)   # 앉은 몸
    ell(g,10.8,5.8,3.8,3.2,lambda nx,ny:lt if nx+ny<-.8 else body)   # 머리
    for x,y in [(8,1),(8,2),(9,2),(13,1),(13,2),(12,2)]:P(g,x,y,body)  # 귀
    P(g,8,2,'p');P(g,13,2,'p')
    P(g,10,3,st);P(g,11,3,st)
    for x,y in [(13,6),(14,6),(12,7),(13,7),(11,11),(11,12),(10,12),(11,13)]:P(g,x,y,'h')   # 입·가슴
    for x,y in [(5,11),(6,13),(4,13),(7,11)]:P(g,x,y,st)               # 줄무늬
    P(g,11,15,body);P(g,12,15,body);P(g,9,15,body)                     # 앞발
    outl(g)
    P(g,12,5,'k');P(g,12,6,'k');P(g,11,5,'k');P(g,11,6,'g');P(g,15,6,'k') if g[6][15]=='.' else None
    P(g,14,6,'p')                                                      # 코
    for x in range(8,13):P(g,x,9,'r')                                  # 목걸이
    P(g,11,10,'y')
    return [''.join(r) for r in over(t,g)]
out={'owlA':owl(False),'owlB':owl(True),'catA':cat(('n','N','m')),'catB':cat(('O','Z','o'))}
json.dump(out,open('oc.json','w'))
for k,v in out.items():print(k);print('\n'.join(v))
