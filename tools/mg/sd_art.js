/* v5.5 스타듀 느낌 그림 (나무는 v5.6) (11월부터 나오는 도토리 받기 · 타코 띄워 주기). 2px 한 칸으로 그려요 */
const SDR=s=>()=>(s=(s*9301+49297)%233280)/233280;
function sdCv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
/* 칸 그리드: 셀(u px)에 색을 칠하고, 마스크 테두리 그리기 */
function sdGrid(W,H){const a=new Array(W*H).fill(null);return{W,H,a,s(x,y,c){x|=0;y|=0;if(x>=0&&y>=0&&x<W&&y<H)a[y*W+x]=c;},g(x,y){return x>=0&&y>=0&&x<W&&y<H?a[y*W+x]:null;},
  draw(g,u,ox,oy){for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=a[y*W+x];if(c){g.fillStyle=c;g.fillRect(ox+x*u,oy+y*u,u,u);}}}};}
/* 덩어리(원 여러 개)를 3단 명암 + 테두리로 */
function sdBlobs(G,blobs,pal,rnd,tex){const W=G.W,H=G.H,m=new Int16Array(W*H).fill(-1);
  blobs.forEach((b,i)=>{for(let y=Math.floor(b[1]-b[2]);y<=b[1]+b[2];y++)for(let x=Math.floor(b[0]-b[2]);x<=b[0]+b[2];x++){if(x<0||y<0||x>=W||y>=H)continue;const dx=x+.5-b[0],dy=y+.5-b[1];if(dx*dx+dy*dy<=b[2]*b[2])m[y*W+x]=i;}});
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=m[y*W+x];if(i<0)continue;const b=blobs[i];
    const edge=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,c])=>{const xx=x+a,yy=y+c;return xx<0||yy<0||xx>=W||yy>=H||m[yy*W+xx]<0;});
    const ib=[[1,0],[0,1]].some(([a,c])=>{const xx=x+a,yy=y+c;return xx<W&&yy<H&&m[yy*W+xx]>=0&&m[yy*W+xx]>i;});
    if(edge){G.s(x,y,pal.o);continue;}
    const dx=(x+.5-b[0])/b[2],dy=(y+.5-b[1])/b[2],l=-dx*.6-dy*.8;
    let c=l>.45?pal.h:l>-.15?pal.m:pal.d;if(ib&&c!==pal.d)c=pal.d;
    if(tex&&rnd()<tex){c=c===pal.h?pal.m:c===pal.m?(rnd()<.5?pal.h:pal.d):pal.m;}
    G.s(x,y,c);}}
/* v5.6 나무 그리기 (잘 그린 도트 나무 요령: 동그란 잎 덩어리 쌓기 · 왼쪽 위 빛 · 위 덩어리가 아래에 그림자 · 밝은 곳은 노란빛, 그늘은 푸른빛 · 삐죽한 잎 가장자리 · 원통 줄기) */
const sdH=(x,y,k=0)=>{let h=Math.imul(x+k*31,374761393)+Math.imul(y,668265263);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;};
function sdCanopy(G,cl,P,k=0){const W=G.W,H=G.H,id=new Int16Array(W*H).fill(-1);let y0=H,y1=0;
  const at=(x,y)=>x<0||y<0||x>=W||y>=H?-1:id[y*W+x];
  cl.forEach(([cx,cy,r],i)=>{const n=Math.max(4,Math.round(r*.45)),ph=i*1.9+k;for(let y=Math.floor(cy-r-2);y<=cy+r+2;y++)for(let x=Math.floor(cx-r-2);x<=cx+r+2;x++){if(x<0||y<0||x>=W||y>=H)continue;
    const dx=x+.5-cx,dy=y+.5-cy,a=Math.atan2(dy,dx),rr=r*(1+.09*Math.sin(a*n+ph))+(sdH(x,y,k)<.12?.6:0);if(dx*dx+dy*dy<=rr*rr){id[y*W+x]=i;y0=Math.min(y0,y);y1=Math.max(y1,y);}}});
  const out=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=id[y*W+x];if(i<0)continue;const[cx,cy,r]=cl[i];
    if(at(x,y+1)<0||at(x+1,y)<0){G.s(x,y,P[0]);if(sdH(x,y,k+5)<.035)out.push([x+(at(x+1,y)<0?1:0),y+(at(x,y+1)<0?1:0),P[0]]);continue;}
    if(at(x,y-1)<0||at(x-1,y)<0){G.s(x,y,P[1]);if(sdH(x,y,k+5)<.05)out.push([x-(at(x-1,y)<0?1:0),y-(at(x,y-1)<0?1:0),P[1]]);continue;}
    const dx=(x+.5-cx)/r,dy=(y+.5-cy)/r,z=Math.sqrt(Math.max(0,1-dx*dx-dy*dy));
    let l=-dx*.55-dy*.75+z*.5-.05-((y-y0)/(y1-y0+1)-.4)*.4;
    const cy2=Math.floor(y/2);l+=(sdH(Math.floor((x+(cy2&1))/2),cy2,k+9)-.5)*.42;
    if(at(x-1,y-1)>i||at(x,y-2)>i||at(x-2,y)>i)l=-1;else if(at(x-2,y-3)>i||at(x-3,y-2)>i||at(x-1,y-4)>i)l=Math.min(l,-.1)-.2;
    G.s(x,y,l>.62?P[5]:l>.3?P[4]:l>-.05?P[3]:l>-.45?P[2]:P[1]);}
  out.forEach(([x,y,c])=>{if(at(x,y)<0)G.s(x,y,c);});return id;}
const SD_LEAF=['#22402e','#2e5a36','#3d7a3c','#56963f','#78b84a','#a6d65e'],SD_BARK=['#33231a','#553419','#734a22','#93622f','#b98450'];
/* 나무 하나: 땅 그늘 → 줄기(원통 명암·나무껍질·뿌리) → 가지 → 잎 → 잎 아래 줄기 그늘 */
function sdTree(G,cx,top,base,tw,limbs,cl,k){const B=SD_BARK,tr=new Map();
  for(let x=Math.round(cx-tw*1.6);x<=cx+tw*1.6;x++)for(let y=base-3;y<=base+3;y++){const e=((x-cx)/(tw*1.6))**2+((y-base)/3.2)**2;if(e<=1&&G.g(x,y))G.s(x,y,e<.55?'#4a8a36':'#5a9a3e');}
  const bark=(x,y,u)=>{let t=u<.2?4:u<.45?3:u<.75?2:1;const sx=x+Math.round(Math.sin(y*.23+x)*.6);if(sdH(sx,0,k)<.32&&(y+Math.floor(sdH(sx,1,k)*20))%11<7)t=Math.max(1,t-1);return B[t];};
  const M=new Map(),put=(x,y,c)=>{if(x>=0&&y>=0&&x<G.W&&y<G.H)M.set(y*G.W+x,c);};
  for(let y=top;y<=base;y++){const t=(y-top)/(base-top),fl=y>base-12?((y-base+12)/12)**2*7:0,x0=Math.round(cx-tw/2*(.78+.22*t)-fl),x1=Math.round(cx+tw/2*(.78+.22*t)+fl*.8);
    for(let x=x0;x<=x1;x++)put(x,y,bark(x,y,(x-x0)/Math.max(1,x1-x0)));}
  limbs.forEach(([sy,ex,ey,w0])=>{const n=Math.ceil(Math.hypot(ex-cx,ey-sy))*2;for(let j=0;j<=n;j++){const p=j/n,x=Math.round(cx+(ex-cx)*p),y=sy+(ey-sy)*p-Math.sin(p*Math.PI)*3,w=Math.max(1,w0*(1-p*.6));
    for(let yy=Math.round(y-w);yy<=Math.round(y+w);yy++)if(!M.has(yy*G.W+x)||j>n*.25)put(x,yy,yy<y-w*.3?B[3]:B[2]);}});
  M.forEach((c,p)=>{const x=p%G.W,y=(p-x)/G.W,e=!M.has(p-1)||!M.has(p+1)||!M.has(p-G.W)||(y<base&&!M.has(p+G.W));G.s(x,y,e?B[0]:c);tr.set(p,1);});
  [[-.35,4],[.3,3]].forEach(([p,h])=>{const x=Math.round(cx+p*tw*1.3);for(let j=0;j<h;j++)G.s(x,base-j,B[0]);});
  const hy=top+Math.round((base-top)*.55),hx=Math.round(cx-tw*.1);[[0,0],[1,0],[0,1],[1,1],[-1,1],[2,1],[0,2],[1,2]].forEach(([a,b],j)=>G.s(hx+a,hy+b,j<2||j>5?B[1]:B[0]));G.s(hx-1,hy,B[2]);G.s(hx+2,hy,B[1]);
  const id=sdCanopy(G,cl,SD_LEAF,k);
  for(let x=0;x<G.W;x++){let run=-1;for(let y=0;y<=base;y++){if(id[y*G.W+x]>=0){run=0;continue;}if(run<0)continue;run++;if(tr.has(y*G.W+x)&&run<=9){const c=G.g(x,y),j=B.indexOf(c);if(j>1&&(run<6||(x+y)%2))G.s(x,y,B[Math.max(1,j-2)]);}}}}
/* ===== 도토리 받기 배경 (숲 가장자리 풀밭) ===== */
function sdForest(){const u=2,W=160,H=220,G=sdGrid(W,H),R=SDR(17);
  const sky=['#8fcbec','#a2d5f0','#b6def2','#cbe8f2','#dcefee'];
  for(let y=0;y<130;y++){const k=Math.min(4,Math.floor(y/26)),f=(y%26)/26;for(let x=0;x<W;x++){let c=sky[k];if(k<4&&f>.8&&(x+y)%2===0)c=sky[k+1];G.s(x,y,c);}}
  const cloud=(cx,cy,s)=>{const bl=[[cx,cy,6*s],[cx+7*s,cy-3*s,7*s],[cx+15*s,cy,6*s],[cx+7*s,cy+2*s,6*s]];for(let y=cy-12*s;y<=cy+8*s;y++)for(let x=cx-8*s;x<=cx+23*s;x++){if(!bl.some(b=>(x-b[0])**2+(y-b[1])**2<=b[2]*b[2]))continue;if(y>cy+3*s)continue;G.s(x,y,y>cy+1*s?'#dcebf3':y<cy-6*s&&x<cx+10*s?'#ffffff':'#f6fbfc');}};
  cloud(30,22,1);cloud(104,40,.8);cloud(132,12,.6);
  const hill=(base,amp,f1,f2,col,top)=>{for(let x=0;x<W;x++){const h=Math.round(base+amp*Math.sin(x*f1+1)+amp*.6*Math.sin(x*f2+2));for(let y=h;y<H;y++)G.s(x,y,y===h&&top?top:col);}};
  hill(118,5,.05,.13,'#a8cf8a','#bfe0a0');
  for(let i=0;i<11;i++){const x=Math.round(14+i*13+R()*5),y=Math.round(116+Math.sin(x*.05+1)*5);for(let j=0;j<4;j++){G.s(x,y+j,'#7a8a62');G.s(x+1,y+j,'#8a9a6e');}sdCanopy(G,[[x-2,y,3.2],[x+3,y,3.2],[x+.5,y-3,4.2+R()*1.2]],['#6c9a62','#78a668','#86b270','#94bd78','#a3c982','#b4d38e'],i*7);}
  hill(134,4,.07,.11,'#8ec46b','#a6d27e');
  for(let y=150;y<H;y++)for(let x=0;x<W;x++){const g0=y<200?'#7fbb56':'#6aa848';let c=g0;const n=R();if(n<.07)c=y<200?'#6aa848':'#5a943c';else if(n<.11)c=y<200?'#95cc66':'#7fbb56';G.s(x,y,c);}
  for(let i=0;i<70;i++){const x=Math.floor(R()*W),y=150+Math.floor(R()*68);const c=y<200?'#5e9a3f':'#4f8a34';G.s(x,y,c);G.s(x+1,y-1,c);G.s(x-1,y-1,c);G.s(x,y-2,y<200?'#9fd46d':'#7fbb56');}
  for(let x=0;x<W;x++){const t=Math.floor(R()*3);for(let k=0;k<=t;k++)G.s(x,199-k,k===t?'#8fc95e':'#5e9a3f');}
  [['#fffaf0','#f4c542'],['#f4a9c0','#fffaf0'],['#f4c542','#e0893c']].forEach((fc,j)=>{for(let i=0;i<7;i++){const x=6+Math.floor(R()*148),y=156+Math.floor(R()*40);if(x>40&&x<120&&y>160)continue;G.s(x,y,fc[1]);G.s(x-1,y,fc[0]);G.s(x+1,y,fc[0]);G.s(x,y-1,fc[0]);G.s(x,y+1,fc[0]);G.s(x,y+2,'#4f8a34');}});
  /* 나무 (v5.6): 양쪽 가장자리 참나무 두 그루. 아래 덩어리부터 쌓고 위 덩어리가 그림자를 드리워요 */
  sdTree(G,12,60,204,16,[[96,-6,68,3],[92,30,66,3],[98,20,56,2.5]],[[-8,68,12],[32,66,12],[12,56,14],[-4,50,16],[30,48,16],[12,42,17],[2,26,15],[24,24,14],[12,12,12]],3);
  sdTree(G,148,66,204,16,[[102,128,74,3],[98,168,72,3],[104,138,62,2.5]],[[128,74,12],[168,72,12],[148,62,14],[130,56,16],[166,58,16],[148,48,17],[138,32,15],[160,30,14],[150,18,12]],11);
  /* 덤불 · 버섯 */
  sdCanopy(G,[[30,201,7],[50,202,6],[40,197,9]],SD_LEAF,21);
  sdCanopy(G,[[118,201,6],[137,202,6],[128,197,9]],SD_LEAF,27);
  const mush=(x,y)=>{for(let k=0;k<3;k++){G.s(x,y-k,'#f3e6cf');G.s(x+1,y-k,'#d9c7a6');}for(let xx=-3;xx<=4;xx++)for(let yy=-6;yy<=-3;yy++){if((xx===-3||xx===4)&&yy===-6)continue;G.s(x+xx,y+yy,yy===-3?'#a8342c':'#d9483b');}G.s(x-1,y-5,'#fffaf0');G.s(x+2,y-4,'#fffaf0');};
  mush(58,206);mush(63,208);
  const c=sdCv(320,440),g=c.getContext('2d');G.draw(g,u,0,0);
  /* 나무에 매달린 도토리 */
  [[10,96],[40,70],[284,104],[262,128]].forEach(([x,y])=>{MGS.a2.forEach((row,j)=>[...row].forEach((ch,i)=>{if(ch!=='.'){g.fillStyle=MGP[ch];g.fillRect(x+i,y+j,1,1);}}));});
  g.globalAlpha=.08;g.fillStyle='#fffbe0';for(let k=0;k<3;k++){g.beginPath();g.moveTo(80+k*70,0);g.lineTo(120+k*70,0);g.lineTo(60+k*70,300);g.lineTo(30+k*70,300);g.fill();}g.globalAlpha=1;
  return c;}
/* 바구니 (48x22) */
function sdBasket(){const G=sdGrid(24,11);for(let y=0;y<11;y++){const inset=Math.floor(y/3.5);for(let x=inset;x<24-inset;x++){let c=(Math.floor(x/2)+Math.floor(y/2))%2?'#c9944f':'#a8743a';if(y<2)c=y?'#e0b06a':'#8a5a2b';if(y===10||x===inset||x===23-inset)c='#3a2a20';G.s(x,y,c);}}for(let x=0;x<24;x++)G.s(x,0,'#3a2a20');
  for(let x=1;x<23;x++)G.s(x,1,x<6?'#f0c884':'#d9a560');const c=sdCv(48,22);G.draw(c.getContext('2d'),2,0,0);return c;}
/* ===== 타코 띄워 주기 배경 (바닷속) ===== */
function sdSea(){const u=2,W=160,H=220,R=SDR(23),G=sdGrid(W,H);
  const wc=['#63c8e6','#56bddf','#4bb1d7','#41a4cd','#3897c3','#308ab8','#297dac','#2370a0'];
  for(let y=20;y<H;y++){const k=Math.min(7,Math.floor((y-20)/25)),f=((y-20)%25)/25;for(let x=0;x<W;x++){let c=wc[k];if(k<7&&f>.84&&(x+y)%2===0)c=wc[k+1];G.s(x,y,c);}}
  for(let y=22;y<80;y++)for(let x=0;x<W;x++){const v=Math.sin(x*.22+Math.sin(y*.17)*2.6)+Math.sin(y*.3+Math.sin(x*.13)*2.8);if(v>1.82&&R()<1-(y-22)/60)G.s(x,y,y<50?'#7fd3ee':'#6cc9e8');}
  const rock=(cx,w,h,col,top)=>{for(let x=cx-w;x<=cx+w;x++){const hh=Math.round(h*Math.sqrt(Math.max(0,1-((x-cx)/w)**2))+Math.sin(x*.7)*1.5);for(let y=205-hh;y<H;y++)G.s(x,y,y===205-hh?top:col);}};
  rock(10,26,30,'#2b6690','#3a7aa2');rock(70,18,16,'#2b6690','#3a7aa2');rock(128,30,36,'#2b6690','#3a7aa2');rock(170,20,20,'#2b6690','#3a7aa2');
  for(let i=0;i<9;i++){const x=6+i*18+R()*8,h=26+R()*20;for(let y=0;y<h;y++){const xx=Math.round(x+Math.sin(y*.25+i)*2);G.s(xx,205-y,'#2a6a84');if(y%5===0)G.s(xx+(i%2?1:-1),205-y,'#2a6a84');}}
  const c=sdCv(320,440),g=c.getContext('2d');G.draw(g,u,0,0);
  g.globalAlpha=.07;g.fillStyle='#ffffff';for(let k=0;k<4;k++){g.beginPath();g.moveTo(40+k*80,40);g.lineTo(64+k*80,40);g.lineTo(20+k*80,330);g.lineTo(4+k*80,330);g.fill();}g.globalAlpha=1;
  /* 해초 · 산호 (느리게 흐르는 층, 640x120) */
  const FW=320,FH=60,F=sdGrid(FW,FH),Rf=SDR(41);
  const kelp=(x,h,ph)=>{for(let y=0;y<h;y++){const xx=Math.round(x+Math.sin(y*.18+ph)*2.5);F.s(xx-1,FH-1-y,'#24533a');F.s(xx,FH-1-y,'#3f8a5a');F.s(xx+1,FH-1-y,'#5fae6e');F.s(xx+2,FH-1-y,'#24533a');
    if(y>4&&y%6===0){const d=(y/6)%2?1:-1;for(let k=1;k<6;k++){const lx=xx+(d>0?2+k:-1-k),ly=FH-1-y+Math.floor(k/2);F.s(lx,ly,k===5?'#24533a':'#4f9e62');F.s(lx,ly-1,'#24533a');}}}};
  const branch=(x,col,hi,ol)=>{const arms=[[0,16],[-4,11],[4,12],[-7,7],[7,8]];arms.forEach(([dx,h])=>{for(let y=0;y<h;y++){const xx=x+Math.round(dx*y/h);F.s(xx-1,FH-1-y,ol);F.s(xx,FH-1-y,y%3?col:hi);F.s(xx+1,FH-1-y,col);F.s(xx+2,FH-1-y,ol);}F.s(x+dx,FH-1-h,ol);F.s(x+dx+1,FH-1-h,ol);});};
  const fan=(x,col,ol)=>{for(let y=0;y<14;y++){const w=Math.round(Math.sqrt(y)*3);for(let xx=-w;xx<=w;xx++){const e=Math.abs(xx)===w||y===13;F.s(x+xx,FH-1-y-2,e?ol:((xx+y)%3?col:'#c9b3ec'));}}for(let y=0;y<3;y++)F.s(x,FH-1-y,ol);};
  const brain=(x,col,ol)=>{for(let y=0;y<8;y++)for(let xx=-8;xx<=8;xx++){if(xx*xx/64+(y-8)*(y-8)/64>1)continue;const e=xx*xx/64+(y-8)*(y-8)/64>.75;F.s(x+xx,FH-1-8+y,e?ol:(Math.sin(xx*.9+y*.6)>.3?'#f0c070':col));}};
  for(let i=0;i<10;i++)kelp(10+i*31+Math.floor(Rf()*8),26+Math.floor(Rf()*22),i);
  [[40,'#e07a8a','#f3a3ad','#7a3443'],[200,'#e8946a','#f5bb92','#7a4428']].forEach(a=>branch(...a));
  fan(120,'#9a7ac8','#4b3570');fan(276,'#9a7ac8','#4b3570');brain(90,'#e0a050','#7a5520');brain(240,'#e0a050','#7a5520');brain(304,'#e0a050','#7a5520');
  const fc=sdCv(640,120),fg=fc.getContext('2d');F.draw(fg,2,0,0);fg.globalCompositeOperation='source-atop';fg.globalAlpha=.18;fg.fillStyle='#2370a0';fg.fillRect(0,0,640,120);
  /* 모래 바닥 (320x30, 같이 흘러감) */
  const S=sdGrid(160,15),Rs=SDR(9);for(let y=0;y<15;y++)for(let x=0;x<160;x++){let c='#e8d19a';const n=Rs();if(n<.12)c='#d9bd80';else if(n<.18)c='#f3e2b4';if(y===0)c='#f6e8c0';if(y===1&&x%2)c='#e8d19a';G;S.s(x,y,c);}
  for(let x=0;x<160;x++){const y=5+Math.round(Math.sin(x*.2)*1.5);if(x%9<6)S.s(x,y,'#f3e2b4');S.s(x,y+5,(x%11<5)?'#d9bd80':S.g(x,y+5));}
  const shell=(x,y)=>{for(let yy=0;yy<4;yy++)for(let xx=-yy;xx<=yy;xx++)S.s(x+xx,y+yy,(xx===-yy||xx===yy||yy===3)?'#a8566a':(xx%2?'#f4b8c4':'#ffd6de'));};
  const star=(x,y)=>{[[0,-2],[0,-1],[-2,0],[-1,0],[1,0],[2,0],[-1,1],[1,1],[-2,2],[2,2]].forEach(([a,b])=>S.s(x+a,y+b,'#e07a3c'));S.s(x,y,'#f5a65b');};
  shell(20,7);shell(98,9);star(60,8);star(140,6);[[40,10],[80,4],[120,11],[150,12]].forEach(([x,y])=>{S.s(x,y,'#9aa5b1');S.s(x+1,y,'#6c7783');});
  const sc=sdCv(320,30);S.draw(sc.getContext('2d'),2,0,0);
  return{w:c,f:fc,s:sc,c:[[40,14,30],[170,8,40],[290,18,26]]};}
/* 바위 (z 9·12·15 → 8z x 6z), 해파리 (48x48, 2장) */
const SDROCK={};function sdRock(z){if(SDROCK[z])return SDROCK[z];const u=3,W=Math.round(8*z/u),H=Math.round(5*z/u),G=sdGrid(W,H),R=SDR(z*7);
  const cx=W/2,rx=W/2-.5,ry=H-.5;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=(x+.5-cx)/rx,dy=(y+.5-H)/ry;if(dx*dx+dy*dy>1)continue;const l=-dx*.5-dy*.9;G.s(x,y,l>.75?'#c2b8ab':l>.35?'#9a8f86':'#6f655e');}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!G.g(x,y))continue;if([[1,0],[-1,0],[0,-1]].some(([a,b])=>!G.g(x+a,y+b)))G.s(x,y,'#3a2a20');}
  for(let i=0;i<W*.6;i++){const x=Math.floor(R()*W),y=Math.floor(R()*H*.5);for(let yy=y;yy<H;yy++)if(G.g(x,yy)&&G.g(x,yy)!=='#3a2a20'){G.s(x,yy,R()<.5?'#6fa845':'#8fbf5a');if(R()<.6)G.s(x,yy+1,'#4f8a34');break;}}
  for(let i=0;i<2;i++){const x=Math.floor(W*(.3+i*.35)),y=Math.floor(H*.45);for(let k=0;k<3;k++)if(G.g(x+k,y+k)&&G.g(x+k,y+k)!=='#3a2a20')G.s(x+k,y+k,'#5a514b');}
  const c=sdCv(W*u,H*u);G.draw(c.getContext('2d'),u,0,0);return SDROCK[z]=c;}
const SDJ=[];function sdJelly(f){if(SDJ[f])return SDJ[f];const G=sdGrid(16,16);
  for(let y=0;y<8;y++)for(let x=0;x<16;x++){const dx=(x+.5-8)/7.2,dy=(y+.5-8)/7.5;if(dx*dx+dy*dy>1)continue;const l=-dx*.5-dy*.8;G.s(x,y,l>.8?'#f2e4fb':l>.3?'#d9b8f0':'#b08ad8');}
  for(let y=0;y<8;y++)for(let x=0;x<16;x++){if(!G.g(x,y))continue;if([[1,0],[-1,0],[0,-1],[0,1]].some(([a,b])=>!G.g(x+a,y+b)&&!(b===1&&y===7)))G.s(x,y,'#4a3423');}
  for(let x=1;x<15;x++)G.s(x,7,x%2?'#9a74c4':'#4a3423');G.s(5,4,'#fffaf0');G.s(4,5,'#fffaf0');G.s(7,5,'#f2a9b6');G.s(8,5,'#f2a9b6');G.s(9,5,'#e0788f');
  [2,5,8,11,13].forEach((x,i)=>{for(let y=8;y<16-(i%2)*2;y++){const xx=x+((Math.floor(y/2)+i+f)%2?1:0);G.s(xx,y,y%3?'#c9a3e6':'#9a74c4');}});
  const c=sdCv(48,48);c.getContext('2d').globalAlpha=1;G.draw(c.getContext('2d'),3,0,0);return SDJ[f]=c;}
