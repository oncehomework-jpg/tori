import sys,json,cv2,numpy as np,os
sys.argv=[sys.argv[0]]
sys.path.insert(0,'/tmp/photo')
import unstar as U, unstar2 as V
A=0.31
def best_scale(L,scales,cy,cx,ry,rx):
    best=None
    for s in scales:
        a,y,x=V.find2(L,s,cy,cx,ry,rx)
        if best is None or a>best[3]:best=(s,y,x,a)
    return best
def locate(im):
    H,W=im.shape[:2];L=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY).astype(np.float32);st=[]
    if W==768:
        st.append(best_scale(L,[.95,.975,1.0,1.025,1.05,1.075],H-105,W-98,3,3))
    else:
        st.append(best_scale(L,[1.9,1.95,2.0,2.05,2.1,2.15,2.2,2.3],H-210,W-196,24,24))
        st.append(best_scale(L,[.95,.975,1.0,1.025,1.05,1.075],H-115,W-114,16,16))
    return st
def apply(im,st):
    H,W=im.shape[:2];out=im.copy();log=[];union=np.zeros((H,W),np.uint8)
    for s in st:
        H_,W_=im.shape[:2]
        if W_>768 and s[0]>1.5:
            ok=s[3]>=0.12 and abs(s[1]-(H_-210))<=6 and abs(s[2]-(W_-196))<=6
        elif W_==768:
            ok=True
        else:
            ok=s[3]>=0.17
        log.append((round(s[0],3),round(s[1]),round(s[2]),round(s[3],2),bool(ok)))
        if not ok: continue
        a_use=A
        if im.shape[1]==768:
            H_,W_=im.shape[:2];mk0=U.place((H_,W_),U.scaled(s[0]),s[1],s[2])
            core=cv2.erode((mk0>.9).astype(np.uint8),np.ones((3,3),np.uint8))>0
            t=max(3,int(7*s[0]));ring=(cv2.dilate((mk0>.1).astype(np.uint8),cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*t+1,2*t+1)))>0)&(cv2.dilate((mk0>.1).astype(np.uint8),np.ones((5,5),np.uint8))==0)
            f=out.astype(np.float32);ests=[]
            for c in range(3):
                Mi=f[...,c][core].mean();R=np.median(f[...,c][ring])
                if 255-R>25:ests.append((Mi-R)/(255-R))
            if ests:a_use=float(np.clip(np.mean(ests),.28,.62))
        log[-1]=log[-1]+(round(a_use,2),)
        out,mk=V.invert_one(out,s,a_use)
        union|=((mk>.12).astype(np.uint8))
        hard=(mk>.85).astype(np.uint8)
        band=(cv2.dilate((mk>.12).astype(np.uint8),np.ones((3,3),np.uint8))-cv2.erode(hard,np.ones((3,3),np.uint8)))
        out=cv2.inpaint(out,band*255,2,cv2.INPAINT_TELEA)
    return out,log
def go(i):
    im=U.load(i);out,log=apply(im,locate(im));cv2.imwrite(f'/tmp/photo/newclean4/{i:02d}.png',out);return i,log
if __name__=='__main__':
    from multiprocessing import Pool
    os.makedirs('/tmp/photo/newclean4',exist_ok=True)
    with Pool(8) as p: r=p.map(go,range(len(U.FS)))
    rep={str(i):l for i,l in r};json.dump(rep,open('/tmp/photo/unstar4_rep.json','w'))
    print('not applied:',[(i,l) for i,l in rep.items() if not all(x[4] for x in l)])
    tiles=[]
    for i in range(len(U.FS)):
        im=U.load(i);out=cv2.imread(f'/tmp/photo/newclean4/{i:02d}.png');H,W=im.shape[:2]
        s=lambda x:cv2.resize(x[H-330:H-30,W-380:W-30] if W>768 else x[H-300:H-30,W-340:W-30],(150,150))
        t=np.hstack([s(im),s(out)]);cv2.putText(t,str(i),(3,14),cv2.FONT_HERSHEY_SIMPLEX,.5,(0,0,255),1);tiles.append(t)
    for k in range(4):
        rows=[np.hstack(tiles[k*24+r*3:k*24+r*3+3]) for r in range(8)]
        cv2.imwrite(f'/tmp/newph/c4_{k}.png',np.vstack(rows))
