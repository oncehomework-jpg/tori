# 별 반짝이 워터마크 지우기 (v8.0 사진 추가용).
# 별은 오목한 네 꼭짓점 별(수식 |x/a|^.667+|y/a|^.667<=1)이고 위치가 늘 같다(우하단 모서리 기준).
#  1536폭: 큰 별(중심 W-194,H-194, a=52, 일부 그림엔 없음) + 작은 별(중심 W-113,H-113, a=26)
#  768폭: 작은 별(중심 W-97,H-97, a=26)
# 별이 있는지는 가장자리 단차(안쪽이 더 밝음)로 확인하고, 있으면 역알파 블렌딩 + 가장자리만 살짝 메움.
import cv2,numpy as np
P=.667
def mask(h,w,cy,cx,a,ss=3):
    ys,xs=np.mgrid[:h*ss,:w*ss]
    y=(ys+.5)/ss-cy;x=(xs+.5)/ss-cx
    m=((np.abs(x/a)**P+np.abs(y/a)**P)<=1).astype(np.float32)
    return cv2.resize(m,(w,h),interpolation=cv2.INTER_AREA)
def _bands(m):
    mb=(m>.5).astype(np.uint8)
    inn=(mb-cv2.erode(mb,np.ones((5,5),np.uint8)))>0
    out=(cv2.dilate(mb,np.ones((9,9),np.uint8))-cv2.dilate(mb,np.ones((3,3),np.uint8)))>0
    return inn,out
def step(g,m):
    inn,out=_bands(m)
    a=np.median(g[inn]);b=np.median(g[out])
    return (a-b)/max(255-b,20)
def one(im,cx,cy,a,dx=0,dy=0):
    H,W=im.shape[:2];r=int(a+14)
    x0=int(cx-r);y0=int(cy-r);x1=int(cx+r);y1=int(cy+r)
    sub=im[y0:y1,x0:x1];g=cv2.cvtColor(sub,cv2.COLOR_BGR2GRAY).astype(np.float32)
    best=None
    for ox in (-1,0,1):
        for oy in (-1,0,1):
            m=mask(y1-y0,x1-x0,cy-y0+oy+.5,cx-x0+ox+.5,a)
            s=step(g,m)
            if best is None or s>best[0]:best=(s,ox,oy,m)
    return best,(x0,y0,x1,y1)
def clean(im):
    H,W=im.shape[:2];out=im.copy();log=[]
    stars=[(W-97,H-97,26,'s')] if W==768 else [(W-194,H-194,52,'B'),(W-113,H-113,26,'s')]
    for cx,cy,a,kind in stars:
        (s,ox,oy,m),(x0,y0,x1,y1)=one(out,cx,cy,a)
        # 없는 별 구분: 같은 모양을 옆(±(a*1.7))으로 옮긴 곳의 단차와 비교
        nul=[]
        for sx,sy in ((-1,0),(0,-1),(-1,-1),(-1,1)):
            cx2=cx+sx*a*1.7;cy2=cy+sy*a*1.7
            if cx2-a-14<0 or cy2-a-14<0 or cx2+a+14>W or cy2+a+14>H:continue
            (s2,*_),_=one(out,cx2,cy2,a);nul.append(s2)
        thr=max(.12,(max(nul) if nul else 0)+.06)
        ok=(.12<=s<=.45 and (s>=.25 or s>=thr)) if kind=='B' else s>=.08
        log.append((kind,round(float(s),2),bool(ok)))
        if not ok:continue
        al=float(np.clip(s,.26,.34)) if kind=='B' else float(np.clip(s,.2,.55))
        sub=out[y0:y1,x0:x1].astype(np.float32)
        fixd=np.clip((sub-al*255*m[...,None])/(1-al*m[...,None]),0,255).astype(np.uint8)
        edge=((cv2.dilate((m>.04).astype(np.uint8),np.ones((3,3),np.uint8))-cv2.erode((m>.96).astype(np.uint8),np.ones((3,3),np.uint8)))>0).astype(np.uint8)
        fixd=cv2.inpaint(fixd,edge*255,2,cv2.INPAINT_TELEA)
        # 색이 있는 배경 등에서 안쪽이 바깥과 어긋나면(어둡게 파임) 별 전체를 메워서 지운다
        core=cv2.erode((m>.9).astype(np.uint8),np.ones((5,5),np.uint8))>0
        _,ring=_bands(m)
        g=cv2.cvtColor(fixd,cv2.COLOR_BGR2GRAY).astype(np.float32)
        if abs(np.median(g[core])-np.median(g[ring]))>5:
            full=(cv2.dilate((m>.04).astype(np.uint8),np.ones((5,5),np.uint8))>0).astype(np.uint8)
            fixd=cv2.inpaint(sub.astype(np.uint8),full*255,4,cv2.INPAINT_TELEA)
            log[-1]=log[-1]+('inpaint',)
        out[y0:y1,x0:x1]=fixd
    return out,log
