/* v5.5 스타듀 느낌 그림 (11월부터 나오는 도토리 받기 · 타코 띄워 주기). 2px 한 칸으로 그려요 */
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
/* ===== 도토리 받기 배경 (숲 가장자리 풀밭) ===== */
function sdForest(){const u=2,W=160,H=220,G=sdGrid(W,H),R=SDR(17);
  const sky=['#8fcbec','#a2d5f0','#b6def2','#cbe8f2','#dcefee'];
  for(let y=0;y<130;y++){const k=Math.min(4,Math.floor(y/26)),f=(y%26)/26;for(let x=0;x<W;x++){let c=sky[k];if(k<4&&f>.8&&(x+y)%2===0)c=sky[k+1];G.s(x,y,c);}}
  const cloud=(cx,cy,s)=>{const bl=[[cx,cy,6*s],[cx+7*s,cy-3*s,7*s],[cx+15*s,cy,6*s],[cx+7*s,cy+2*s,6*s]];for(let y=cy-12*s;y<=cy+8*s;y++)for(let x=cx-8*s;x<=cx+23*s;x++){if(!bl.some(b=>(x-b[0])**2+(y-b[1])**2<=b[2]*b[2]))continue;if(y>cy+3*s)continue;G.s(x,y,y>cy+1*s?'#dcebf3':y<cy-6*s&&x<cx+10*s?'#ffffff':'#f6fbfc');}};
  cloud(30,22,1);cloud(104,40,.8);cloud(132,12,.6);
  const hill=(base,amp,f1,f2,col,top)=>{for(let x=0;x<W;x++){const h=Math.round(base+amp*Math.sin(x*f1+1)+amp*.6*Math.sin(x*f2+2));for(let y=h;y<H;y++)G.s(x,y,y===h&&top?top:col);}};
  hill(118,5,.05,.13,'#a8cf8a','#bfe0a0');
  for(let i=0;i<12;i++){const x=10+i*13+R()*6,y=112+Math.sin(x*.05+1)*5;const r=4+R()*3;for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++)if(xx*xx+yy*yy<=r*r)G.s(x+xx,y+yy-r*.4,yy<-r*.3&&xx<0?'#93c272':'#7fb562');}
  hill(134,4,.07,.11,'#8ec46b','#a6d27e');
  for(let y=150;y<H;y++)for(let x=0;x<W;x++){const g0=y<200?'#7fbb56':'#6aa848';let c=g0;const n=R();if(n<.07)c=y<200?'#6aa848':'#5a943c';else if(n<.11)c=y<200?'#95cc66':'#7fbb56';G.s(x,y,c);}
  for(let i=0;i<70;i++){const x=Math.floor(R()*W),y=150+Math.floor(R()*68);const c=y<200?'#5e9a3f':'#4f8a34';G.s(x,y,c);G.s(x+1,y-1,c);G.s(x-1,y-1,c);G.s(x,y-2,y<200?'#9fd46d':'#7fbb56');}
  for(let x=0;x<W;x++){const t=Math.floor(R()*3);for(let k=0;k<=t;k++)G.s(x,199-k,k===t?'#8fc95e':'#5e9a3f');}
  [['#fffaf0','#f4c542'],['#f4a9c0','#fffaf0'],['#f4c542','#e0893c']].forEach((fc,j)=>{for(let i=0;i<7;i++){const x=6+Math.floor(R()*148),y=156+Math.floor(R()*40);if(x>40&&x<120&&y>160)continue;G.s(x,y,fc[1]);G.s(x-1,y,fc[0]);G.s(x+1,y,fc[0]);G.s(x,y-1,fc[0]);G.s(x,y+1,fc[0]);G.s(x,y+2,'#4f8a34');}});
  /* 나무 */
  const tree=(tx,tw,top,canopy)=>{for(let y=top;y<204;y++){const flare=y>190?Math.floor((y-190)/3):0;for(let x=tx-flare;x<tx+tw+flare;x++){const e=x===tx-flare||x===tx+tw+flare-1;let c='#8a5a2b';if(x<tx+3)c='#b07a42';else if(x>tx+tw-4)c='#5e3a1c';if(e)c='#3a2a20';G.s(x,y,c);}}
    for(let i=0;i<14;i++){const x=tx+2+Math.floor(R()*(tw-4)),y=top+5+Math.floor(R()*95);for(let k=0;k<4+R()*6;k++)G.s(x,y+k,'#6a4322');}
    const hy=top+40;G.s(tx+tw/2,hy,'#3a2a20');G.s(tx+tw/2+1,hy,'#3a2a20');G.s(tx+tw/2,hy+1,'#2a1c12');G.s(tx+tw/2+1,hy+1,'#2a1c12');G.s(tx+tw/2-1,hy+1,'#5e3a1c');
    sdBlobs(G,canopy,{o:'#2f5a26',d:'#4a8032',m:'#5f9a3e',h:'#7fbf55'},R,.12);};
  tree(6,14,70,[[-6,30,26],[14,14,18],[28,32,16],[8,48,20],[-4,60,14],[30,54,12]]);
  tree(142,14,80,[[166,34,26],[146,18,18],[132,38,16],[152,54,20],[164,64,14],[130,58,12]]);
  /* 덤불 · 버섯 */
  sdBlobs(G,[[30,200,8],[40,198,9],[50,201,7]],{o:'#2f5a26',d:'#4a8032',m:'#5f9a3e',h:'#7fbf55'},R,.1);
  sdBlobs(G,[[118,200,7],[128,197,9],[137,201,6]],{o:'#2f5a26',d:'#4a8032',m:'#5f9a3e',h:'#7fbf55'},R,.1);
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
