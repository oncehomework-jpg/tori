import json
M=lambda l:l+l[::-1]
owlL=["........","..kk....","..kDk...","..kDDkkk",".kDDDDDD",".kDdYYYD","kDdYshkY","kDdYskkY","kDDdYYYy","kdDDDDsY","kdDtbtbt","kdDbtbtb",".kdDtbtt",".kDDtttt","..kkkkkk",".....oo."]
owl=[M(r) for r in owlL]
catL=[".kk.....",".kpk....",".kppkkkk",".knnnnmn","knNnnnnn","knNngknn","knnnkknn","knnnnhhh",".knnnhhp","..kknhkh","...krrrr","...knnhy","..knNnhh","..knnnhh","..knnkhk","...kkkkk"]
cat=[list(M(r)) for r in catL]
for x,y in [(14,6),(14,7),(14,8),(13,9),(13,10),(13,11)]:cat[y][x]='n'
for x,y in [(14,5),(15,6),(15,7),(15,8),(14,9),(14,10),(14,11),(13,12) ,(13,5),(13,6),(13,7),(13,8),(12,9)]:
    if cat[y][x] in '.':cat[y][x]='k'
cat=[''.join(r) for r in cat]
def recol(rows,m):return [''.join(m.get(c,c) for c in r) for r in rows]
owlB=[r[:] for r in owl]
cap=["....kkkkkkkk....","..kmmmmmmmmmmk..","....kmmmmmmk.y..","..............y."]
owlB=[list(r) for r in owlB]
for y,row in enumerate(cap[:3]):
    for x,c in enumerate(row):
        if c!='.':owlB[y][x]=c
owlB[3][13]='y'
owlB=[''.join(r) for r in owlB]
catB=recol(cat,{'n':'O','N':'Z','m':'o'})
out={'owlA':owl,'owlB':owlB,'catA':cat,'catB':catB}
for k,v in out.items(): assert all(len(r)==16 for r in v) and len(v)==16,k
json.dump(out,open('ocf.json','w'))
for k,v in out.items():print(k);print('\n'.join(v))
