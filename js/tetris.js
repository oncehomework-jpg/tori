/* 토리 테토리스 — 옛날 TV 리모컨 감성 미니게임 (v1.3.0)
   화면: 브라운관 TV(캔버스 320x240) + 리모컨. 시안 기록/시안-테트리스/index.html
   규칙: 7종 블록, 홀드·그림자·바로 떨어뜨리기 없음(확인 = 돌리기, 사용자 요청), 다음 1개, 10줄마다 레벨업. 시작 레벨은 숫자 버튼 1~9
   보상: mgRw(10줄 🌰1 · 25줄 🌰2, 하루 횟수는 다른 미니게임과 합산), 최고 점수 S.mg.bt
   소리: 앱 AC(mgAC, 소리 꺼짐이면 무음) · 음악은 코로베이니키(러시아 민요, 저작권 없음) 삑삑 소리 */
(()=>{
const W=320,H=240,COLS=10,ROWS=20,CS=10,BX=28,BY=20;
let C,X,PIC,raf=0,openNow=false;

const CSS=`
#mg.tt{background:#3f3027;background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 18px,transparent 18px 36px),radial-gradient(ellipse at 50% 20%,#5b4535,#2c211b 75%);
  font-family:'Galmuri11',sans-serif;color:#eee;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;display:block;--tvw:340px;--u:1}
#tt-room{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;padding:10px 10px calc(10px + env(safe-area-inset-bottom))}
#mg.land #tt-room{flex-direction:row}
#tt-tvw{display:flex;flex-direction:column;align-items:center}
#tt-tv{width:var(--tvw);background:linear-gradient(#e4ddcc,#b8b09f);border-radius:calc(var(--tvw)*.06);
  padding:calc(var(--tvw)*.045) calc(var(--tvw)*.045) 0;box-shadow:0 5px 0 #857d6d,0 16px 30px rgba(0,0,0,.55),inset 0 2px 0 rgba(255,255,255,.6)}
.tt-bezel{background:#2a2a2e;border-radius:calc(var(--tvw)*.05);padding:calc(var(--tvw)*.03);box-shadow:inset 0 0 0 2px #46464d,inset 0 3px 8px #000}
.tt-glass{position:relative;aspect-ratio:4/3;border-radius:9%/11%;overflow:hidden;background:#050506}
.tt-pic{position:absolute;inset:0;transform-origin:50% 50%}
#mg .tt-pic canvas{width:100%!important;height:100%!important;max-width:none!important;display:block;image-rendering:pixelated;image-rendering:crisp-edges;filter:saturate(1.15) contrast(1.06) brightness(1.04);animation:ttfl 4s infinite}
@keyframes ttfl{0%,100%{opacity:1}50%{opacity:.975}}
.tt-scan{position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(rgba(0,0,0,.28) 0 1px,transparent 1px 3px);background-size:100% calc(100% / 120);mix-blend-mode:multiply}
.tt-vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 58%,rgba(0,0,0,.6) 100%)}
.tt-glare{position:absolute;inset:0;pointer-events:none;background:linear-gradient(155deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,.03) 28%,transparent 42%)}
.tt-pic.on{animation:tton .55s ease-out}
@keyframes tton{0%{transform:scale(1,.006);filter:brightness(4)}35%{transform:scale(1,.006);filter:brightness(4)}70%{transform:scale(1,1.04);filter:brightness(1.6)}100%{transform:none;filter:none}}
.tt-pic.off{animation:ttoff .5s ease-in forwards}
@keyframes ttoff{0%{transform:none}45%{transform:scale(1,.006);filter:brightness(3)}80%{transform:scale(.03,.006);filter:brightness(5)}100%{transform:scale(0,0)}}
.tt-pic.shk{animation:ttshk .14s steps(2)}
@keyframes ttshk{0%{transform:translateY(1.5%)}50%{transform:translateY(-.8%)}100%{transform:none}}
.tt-strip{height:calc(var(--tvw)*.1);display:flex;align-items:center;justify-content:space-between;padding:0 3%}
.tt-brand{font-size:calc(var(--tvw)*.034);color:#6d6758;letter-spacing:.12em;font-weight:700;text-shadow:0 1px 0 rgba(255,255,255,.7)}
.tt-brand b{color:#9b2f2a;margin-left:.2em}
.tt-knobs{display:flex;gap:calc(var(--tvw)*.02);align-items:center}
.tt-knobs i{width:calc(var(--tvw)*.045);height:calc(var(--tvw)*.045);border-radius:50%;background:radial-gradient(circle at 35% 30%,#f4efe4,#8e8676);box-shadow:0 1px 2px rgba(0,0,0,.5)}
.tt-led{width:calc(var(--tvw)*.018);height:calc(var(--tvw)*.018);border-radius:50%;background:#c22;box-shadow:0 0 6px #f33}
.tt-led.g{background:#3e3;box-shadow:0 0 6px #5f5}
.tt-stand{width:calc(var(--tvw)*.62);height:calc(var(--tvw)*.035);margin-top:2px;background:linear-gradient(#7a5233,#4d321f);border-radius:3px 3px 6px 6px;box-shadow:0 6px 10px rgba(0,0,0,.4)}
#tt-rc{--s:calc(var(--u) * 1px);position:relative;background:linear-gradient(165deg,#43434b,#1f1f24 70%);border-radius:calc(var(--s)*42);
  padding:calc(var(--s)*16) calc(var(--s)*18) calc(var(--s)*16);box-shadow:0 10px 24px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.15),inset 0 -3px 0 rgba(0,0,0,.4);
  display:grid;grid-template-columns:calc(var(--s)*52) calc(var(--s)*160) calc(var(--s)*52);gap:calc(var(--s)*11) calc(var(--s)*12);
  grid-template-areas:"top top top" "ch pad vol" "col col col" "num num num" "help help help";touch-action:none;justify-items:center;align-items:center}
#mg.land #tt-rc{grid-template-columns:calc(var(--s)*52) calc(var(--s)*160) calc(var(--s)*52) calc(var(--s)*124);grid-template-areas:"top top top top" "ch pad vol num" "col col col col"}
#mg.land .tt-help{display:none}
.tt-b{font-family:'Galmuri11',sans-serif;border:0;padding:0;margin:0;color:#ececf2;background:linear-gradient(#6c6c76,#4b4b54);box-shadow:0 calc(var(--s)*3) 0 #232328,inset 0 1px 0 rgba(255,255,255,.2);
  border-radius:calc(var(--s)*8);cursor:pointer;display:flex;align-items:center;justify-content:center;touch-action:none;min-height:0;min-width:0}
.tt-b.dn{transform:translateY(calc(var(--s)*2));box-shadow:0 calc(var(--s)*1) 0 #232328,inset 0 1px 0 rgba(255,255,255,.1);filter:brightness(.88)}
.tt-b svg{width:45%;height:45%;fill:currentColor}
.tt-top{grid-area:top;width:100%;display:flex;align-items:center;justify-content:space-between}
.tt-pw{width:calc(var(--s)*36);height:calc(var(--s)*36);border-radius:50%;background:linear-gradient(#e85a50,#a72d27);box-shadow:0 calc(var(--s)*3) 0 #5e1612,inset 0 1px 0 rgba(255,255,255,.35)}
.tt-pw svg{width:52%;height:52%;fill:none;stroke:#fff;stroke-width:2.6;stroke-linecap:round}
.tt-mid{display:flex;flex-direction:column;align-items:center;gap:calc(var(--s)*3)}
.tt-ir{width:calc(var(--s)*18);height:calc(var(--s)*7);border-radius:4px;background:#3a0d10;box-shadow:inset 0 1px 2px #000}
.tt-ir.f{background:#ff4a4a;box-shadow:0 0 8px #f44}
.tt-logo{font-size:calc(var(--s)*12);font-weight:700;letter-spacing:.25em;color:#b9b9c4}
.tt-mu{height:calc(var(--s)*26);padding:0 calc(var(--s)*10);font-size:calc(var(--s)*11);border-radius:calc(var(--s)*13)}
.tt-rock{width:100%;height:calc(var(--s)*146);border-radius:calc(var(--s)*26);background:linear-gradient(#585862,#3c3c44);box-shadow:inset 0 1px 0 rgba(255,255,255,.15),0 2px 4px rgba(0,0,0,.5);
  display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:calc(var(--s)*5)}
.tt-rock .tt-b{width:100%;height:calc(var(--s)*52);border-radius:calc(var(--s)*22);font-size:calc(var(--s)*20)}
.tt-rock span{font-size:calc(var(--s)*11);color:#c9c9d2}
.tt-ch{grid-area:ch}.tt-vol{grid-area:vol}
.tt-pad{grid-area:pad;position:relative;width:calc(var(--s)*160);height:calc(var(--s)*160);border-radius:50%;background:linear-gradient(#5e5e68,#36363d);
  box-shadow:0 calc(var(--s)*4) 0 #1c1c20,0 4px 10px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.2)}
.tt-pad .tt-a{position:absolute;background:transparent;box-shadow:none;color:#e6e6ee;border-radius:calc(var(--s)*12)}
.tt-pad .tt-a.dn{background:rgba(0,0,0,.25);transform:none}
.tt-pad .tt-a svg{width:calc(var(--s)*18);height:calc(var(--s)*18)}
.tt-pad .tt-u{left:30%;right:30%;top:3%;height:28%}.tt-pad .tt-d{left:30%;right:30%;bottom:3%;height:28%}
.tt-pad .tt-l{top:30%;bottom:30%;left:3%;width:28%}.tt-pad .tt-r{top:30%;bottom:30%;right:3%;width:28%}
.tt-pad .tt-ok{position:absolute;left:50%;top:50%;width:calc(var(--s)*64);height:calc(var(--s)*64);margin:calc(var(--s)*-32) 0 0 calc(var(--s)*-32);border-radius:50%;
  font-size:calc(var(--s)*14);font-weight:700;background:linear-gradient(#7c7c87,#55555f);box-shadow:0 calc(var(--s)*3) 0 #232328,0 0 0 calc(var(--s)*3) #2c2c32,inset 0 1px 0 rgba(255,255,255,.3)}
.tt-col{grid-area:col;width:100%;display:flex;justify-content:space-between}
.tt-cb{display:flex;flex-direction:column;align-items:center;gap:calc(var(--s)*4);font-size:calc(var(--s)*10);color:#b4b4be}
.tt-cb .tt-b{width:calc(var(--s)*58);height:calc(var(--s)*20);border-radius:calc(var(--s)*10)}
#mg.land .tt-cb .tt-b{width:calc(var(--s)*48)}
.tt-c1{background:linear-gradient(#ee5a52,#b9302a)}.tt-c2{background:linear-gradient(#57c45f,#2f8a37)}.tt-c3{background:linear-gradient(#f3d457,#c39b22)}.tt-c4{background:linear-gradient(#5b86ea,#2f55b5)}
.tt-num{grid-area:num;width:100%;display:grid;grid-template-columns:repeat(3,1fr);gap:calc(var(--s)*8) calc(var(--s)*12)}
#mg.land .tt-num{gap:calc(var(--s)*8)}
.tt-num .tt-b{height:calc(var(--s)*26);font-family:'Galmuri14',sans-serif;font-size:calc(var(--s)*14);border-radius:calc(var(--s)*13)}
/* 작은 버튼은 모양은 그대로 두고 누르는 영역만 44px 높이로 넓힘 (v1.3.7 폴리싱 ④) */
.tt-cb .tt-b,.tt-num .tt-b,.tt-mu{position:relative}
.tt-cb .tt-b::after,.tt-num .tt-b::after,.tt-mu::after{content:'';position:absolute;left:-3px;right:-3px;top:50%;height:44px;margin-top:-22px}
.tt-help{grid-area:help;font-size:calc(var(--s)*10);color:#8f8f9a;text-align:center;line-height:1.5}
`;
const UP='<svg viewBox="0 0 10 10"><path d="M5 2 9 8H1z"/></svg>',DN='<svg viewBox="0 0 10 10"><path d="M5 8 9 2H1z"/></svg>';
const HTML=`<div id="tt-room">
 <div id="tt-tvw"><div id="tt-tv">
  <div class="tt-bezel"><div class="tt-glass"><div class="tt-pic" id="tt-pic"><canvas id="tt-scr" width="${W}" height="${H}"></canvas><div class="tt-scan"></div></div><div class="tt-vig"></div><div class="tt-glare"></div></div></div>
  <div class="tt-strip"><span class="tt-brand">TORI<b>VISION</b></span><span class="tt-knobs"><i></i><i></i><span class="tt-led" id="tt-led"></span></span></div>
 </div><div class="tt-stand"></div></div>
 <div id="tt-rc">
  <div class="tt-top"><button class="tt-b tt-pw" data-k="power" aria-label="전원"><svg viewBox="0 0 24 24"><path d="M12 3v8"/><path d="M6.3 7.2a8 8 0 1 0 11.4 0"/></svg></button>
   <div class="tt-mid"><span class="tt-ir" id="tt-ir"></span><span class="tt-logo">TORI</span></div><button class="tt-b tt-mu" data-k="mute">음소거</button></div>
  <div class="tt-rock tt-ch"><button class="tt-b" data-k="chu" aria-label="채널 올림">${UP}</button><span>CH</span><button class="tt-b" data-k="chd" aria-label="채널 내림">${DN}</button></div>
  <div class="tt-pad"><button class="tt-b tt-a tt-u" data-k="up" aria-label="위 돌리기">${UP}</button><button class="tt-b tt-a tt-d" data-k="down" aria-label="아래 내리기">${DN}</button>
   <button class="tt-b tt-a tt-l" data-k="left" aria-label="왼쪽"><svg viewBox="0 0 10 10"><path d="M2 5 8 1v8z"/></svg></button><button class="tt-b tt-a tt-r" data-k="right" aria-label="오른쪽"><svg viewBox="0 0 10 10"><path d="M8 5 2 1v8z"/></svg></button>
   <button class="tt-b tt-ok" data-k="ok">확인</button></div>
  <div class="tt-rock tt-vol"><button class="tt-b" data-k="volu" aria-label="소리 크게">+</button><span>음량</span><button class="tt-b" data-k="vold" aria-label="소리 작게">−</button></div>
  <div class="tt-col"><div class="tt-cb"><button class="tt-b tt-c1" data-k="red" aria-label="멈춤"></button>멈춤</div><div class="tt-cb"><button class="tt-b tt-c2" data-k="green" aria-label="처음부터"></button>처음부터</div>
   <div class="tt-cb"><button class="tt-b tt-c3" data-k="yellow" aria-label="블록 모양"></button>블록 모양</div><div class="tt-cb"><button class="tt-b tt-c4" data-k="blue" aria-label="나가기"></button>나가기</div></div>
  <div class="tt-num">${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="tt-b" data-k="n${n}">${n}</button>`).join('')}</div>
  <div class="tt-help">위 돌리기 · 좌우 옮기기 · 아래 내리기<br>확인도 돌리기 · 숫자는 시작 레벨</div>
 </div></div>`;

/* ---------- 블록 ---------- */
const PCOL={I:['#3fd0e8','#c0f6ff','#1a7a95'],O:['#f6d23a','#fff4a8','#a3801a'],T:['#b45adb','#e8bdf7','#6a2a8c'],
  S:['#5ccf4a','#c6f5b4','#2b7f22'],Z:['#ec4a4a','#ffb7ac','#8f1f22'],J:['#4472f0','#b9cbff','#1c3a99'],
  L:['#f08a2a','#ffd3a4','#9a4c10'],G:['#8a8a96','#cfcfd8','#4a4a55'],F:['#ffffff','#ffffff','#d8e4ff']};
const SH={I:[[0,1],[1,1],[2,1],[3,1]],O:[[0,0],[1,0],[0,1],[1,1]],T:[[0,1],[1,1],[2,1],[1,2]],
  S:[[1,1],[2,1],[0,2],[1,2]],Z:[[0,1],[1,1],[1,2],[2,2]],J:[[0,1],[1,1],[2,1],[2,2]],L:[[0,1],[1,1],[2,1],[0,2]]};
const SN={I:4,O:2,T:3,S:3,Z:3,J:3,L:3},KEYS='IOTSZJL';
function cell(x,y,k,s=CS){const c=PCOL[k];X.fillStyle=c[0];X.fillRect(x,y,s,s);X.fillStyle=c[1];X.fillRect(x,y,s,1);X.fillRect(x,y,1,s);
  X.fillStyle=c[2];X.fillRect(x,y+s-1,s,1);X.fillRect(x+s-1,y,1,s);if(s>=7){X.fillStyle=c[1];X.fillRect(x+2,y+2,2,1);X.fillRect(x+2,y+3,1,1);}}
const rot=p=>p.k==='O'?p.c:p.c.map(([x,y])=>[p.n-1-y,x]);
let lastK='';
/* 옛날 게임식 뽑기: 같은 블록이 연달아 나오면 한 번 다시 뽑음 */
function rnd(){let k=KEYS[Math.floor(Math.random()*7)];if(k===lastK)k=KEYS[Math.floor(Math.random()*7)];lastK=k;return k;}
function mk(k){return{k,c:SH[k].map(a=>a.slice()),n:SN[k],x:Math.floor((COLS-SN[k])/2),y:k==='O'?0:-1};}

/* ---------- 소리 (앱 AC 사용, 소리 꺼짐이면 mgAC가 null) ---------- */
let A=null,MGN=null,NB=null,vol=4,mute=false;
function au(){const a=mgAC();if(!a)return null;if(a!==A){A=a;MGN=a.createGain();MGN.connect(a.destination);
  NB=a.createBuffer(1,a.sampleRate,a.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}setVol();return A;}
function setVol(){if(MGN)MGN.gain.value=mute?0:(vol/6)*.8*mgV();}
function tone(f,t,d,ty='square',g=.1,to){if(!A)return;const o=A.createOscillator(),v=A.createGain();o.type=ty;o.frequency.setValueAtTime(f,t);
  if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);v.gain.setValueAtTime(g,t);v.gain.exponentialRampToValueAtTime(.0008,t+d);o.connect(v);v.connect(MGN);o.start(t);o.stop(t+d+.03);}
function noise(t,d,g=.1,hp=0){if(!A)return;const s=A.createBufferSource(),v=A.createGain();s.buffer=NB;v.gain.setValueAtTime(g,t);v.gain.exponentialRampToValueAtTime(.0008,t+d);
  let n=s;if(hp){const f=A.createBiquadFilter();f.type='highpass';f.frequency.value=hp;s.connect(f);n=f;}n.connect(v);v.connect(MGN);s.start(t);s.stop(t+d+.03);}
const NT={C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};
function fq(n){const m=n.match(/^([A-G]#?)(\d)$/);return 440*Math.pow(2,(NT[m[1]]+12*(+m[2]+1)-69)/12);}
function sfx(n){if(!A||A.state!=='running')return;const t=A.currentTime+.005;
  switch(n){
  case'move':tone(330,t,.035,'square',.045);break;
  case'rot':tone(560,t,.05,'square',.055,760);break;
  case'lock':tone(130,t,.08,'square',.08,70);break;
  case'line':['C6','E6','G6'].forEach((q,i)=>tone(fq(q),t+i*.055,.08,'square',.07));break;
  case'tetris':['C5','E5','G5','C6','G5','C6','E6'].forEach((q,i)=>tone(fq(q),t+i*.07,i===6?.35:.09,'square',.08));break;
  case'lvup':tone(400,t,.25,'square',.06,1200);break;
  case'over':['E5','D#5','D5','C#5','C5','B4','A#4','A4'].forEach((q,i)=>tone(fq(q),t+i*.11,.12,'square',.07));break;
  case'beep':tone(1050,t,.07,'sine',.09);break;
  case'nope':tone(220,t,.12,'square',.06);break;
  case'pon':noise(t,.45,.07);tone(55,t,.4,'sine',.15,110);break;
  case'poff':tone(500,t,.35,'sine',.1,40);break;
  case'pause':tone(fq('E6'),t,.06,'square',.06);tone(fq('C6'),t+.08,.08,'square',.06);break;}
}
/* 코로베이니키 8분음표 단위 */
const MEL='E5:2 B4:1 C5:1 D5:2 C5:1 B4:1 A4:2 A4:1 C5:1 E5:2 D5:1 C5:1 B4:3 C5:1 D5:2 E5:2 C5:2 A4:2 A4:4 '+
  'R:1 D5:2 F5:1 A5:2 G5:1 F5:1 E5:3 C5:1 E5:2 D5:1 C5:1 B4:2 B4:1 C5:1 D5:2 E5:2 C5:2 A4:2 A4:2 R:2';
const BASS=['E2','A2','G#2','A2','D2','C2','E2','A2'];
const STEPS=[];(()=>{let s=0;MEL.split(' ').forEach(tk=>{const[n,l]=tk.split(':');STEPS[s]=n==='R'?null:[n,+l];s+=+l;});STEPS.length=s;})();
let musOn=false,musS=0,musT=0,musIv=0,urgent=false;
function musStart(){if(!A)return;musOn=true;musS=0;musT=A.currentTime+.08;clearInterval(musIv);musIv=setInterval(musTick,25);}
function musStop(){musOn=false;clearInterval(musIv);musIv=0;}
function musTick(){if(!musOn||!A||A.state!=='running')return;const e=urgent?.118:.15;
  if(musT<A.currentTime)musT=A.currentTime+.02;
  while(musT<A.currentTime+.14){const st=STEPS[musS];if(st)tone(fq(st[0]),musT,e*st[1]*.9,'square',.05);
    tone(fq(BASS[Math.floor(musS/8)])*(musS%2?2:1),musT,e*.8,'triangle',.11);
    musT+=e;musS=(musS+1)%STEPS.length;}}

/* ---------- 상태 ---------- */
let st='off',tok=0,lv0=1,board=[],cur=null,nxt=null,score=0,lines=0,gAcc=0,clr=[],clrT=0,overN=0,overT=0,newBest=false,danger=false,rw=null,blueAsk=0;
let osd=null,msg=null,tbump=0,held={};
const deco=[0,1,2,3].map(i=>({k:KEYS[(i*3)%7],x:20+i*80,y:-40-i*70,v:8+i*3}));
const best=()=>S.mg.bt||0;
const level=()=>lv0+Math.floor(lines/10);
const gms=()=>Math.max(50,Math.round(800*Math.pow(.83,level()-1)));
const now=()=>performance.now();
function hit(c,x,y){for(const[a,b]of c){const cx=x+a,cy=y+b;if(cx<0||cx>=COLS||cy>=ROWS)return true;if(cy>=0&&board[cy][cx])return true;}return false;}
function say(t,ms=1600){msg={t,e:now()+ms};tbump=now()+220;}
function showOsd(a,b,ms=2600){osd={a,b,e:now()+ms};}
function anim(c,ms){if(!PIC)return;PIC.classList.remove('on','off','shk');void PIC.offsetWidth;PIC.classList.add(c);if(c!=='off')setTimeout(()=>PIC&&PIC.classList.remove(c),ms);}
function led(){const l=$('tt-led');if(l)l.classList.toggle('g',st!=='off');}
function vib(p){try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}}

function powerOn(){const t=++tok;st='noise';led();anim('on',560);sfx('pon');
  setTimeout(()=>{if(t!==tok)return;st='title';showOsd('CH 07','토리 게임천국',3000);},750);}
function powerOff(){++tok;musStop();st='off';led();anim('off');sfx('poff');held={};}
function start(){board=Array.from({length:ROWS},()=>Array(COLS).fill(0));score=0;lines=0;gAcc=0;clr=[];danger=false;urgent=false;newBest=false;rw=null;blueAsk=0;
  nxt=rnd();spawn();st='play';say('같이 해 봐요!');sfx('beep');musStart();}
function spawn(){cur=mk(nxt);nxt=rnd();if(hit(cur.c,cur.x,cur.y)){gameOver();return false;}return true;}
function move(dx){if(!hit(cur.c,cur.x+dx,cur.y)){cur.x+=dx;sfx('move');}}
function turn(){const c=rot(cur);for(const dx of[0,1,-1,2,-2])if(!hit(c,cur.x+dx,cur.y)){cur.c=c;cur.x+=dx;sfx('rot');return;}
  if(!hit(c,cur.x,cur.y-1)){cur.c=c;cur.y--;sfx('rot');}}
function soft(){if(!hit(cur.c,cur.x,cur.y+1)){cur.y++;score+=1;gAcc=0;}else lock();}
function lock(){let top=false;for(const[a,b]of cur.c){const cy=cur.y+b;if(cy<0)top=true;else board[cy][cur.x+a]=cur.k;}
  sfx('lock');if(top){gameOver();return;}
  clr=[];for(let y=0;y<ROWS;y++)if(board[y].every(v=>v))clr.push(y);
  if(clr.length){st='clear';clrT=0;cur=null;const n=clr.length;
    if(n===4){sfx('tetris');vib([40,30,70]);anim('shk',150);say('테토리스!!!',2000);}else{sfx('line');vib(30);say(['한 줄!','두 줄!','세 줄이나!!'][n-1]);}}
  else{gAcc=0;checkDanger();spawn();}}
function finishClear(){const n=clr.length,before=level();
  board=board.filter((r,y)=>!clr.includes(y));while(board.length<ROWS)board.unshift(Array(COLS).fill(0));
  lines+=n;score+=[0,40,100,300,1200][n]*level();clr=[];
  if(level()>before){setTimeout(()=>sfx('lvup'),250);showOsd('레벨 '+level(),'빨라져요!',1800);if(n<4)say('빨라져요!');}
  st='play';gAcc=0;checkDanger();spawn();}
function checkDanger(){const d=board.slice(0,5).some(r=>r.some(v=>v));if(d&&!danger)say('으앗 위험해요!');danger=d;urgent=d;}
/* 끝: 보상은 줄 수로(10줄 1개·25줄 2개), 기록은 점수로 */
function gameOver(){const t=++tok;st='over';overN=0;overT=0;cur=null;musStop();held={};sfx('over');vib([60,40,60]);say('아쉬워요 ㅠㅠ',3000);
  const r=lines>=25?2:lines>=10?1:0,before=S.acorns,[m,nb]=mgRw(r,'10줄이면 도토리 1개, 25줄이면 2개','bt',score);
  newBest=nb&&score>0;rw={r,got:S.acorns-before,full:/오늘 보상은 다/.test(m)};
  setTimeout(()=>{if(t!==tok)return;anim('off');sfx('poff');
    setTimeout(()=>{if(t!==tok)return;st='result';anim('on',560);},900);},1250);}
function doPause(){if(st!=='play')return;st='pause';musStop();sfx('pause');}
function resume(){st='play';blueAsk=0;sfx('pause');musStart();}
function toTitle(){++tok;musStop();st='title';held={};cur=null;sfx('beep');}
function setLv(n){lv0=Math.max(1,Math.min(9,n));sfx('beep');showOsd('레벨 '+lv0,'시작 레벨',1400);}
function yellow(){sfx('nope');showOsd('블록 모양','토리 블록은 곧 나와요',1800);}

/* ---------- 입력 ---------- */
const REP={left:[170,50],right:[170,50],down:[40,40]};
function press(k){au();irFlash();
  if(k==='power'){st==='off'?powerOn():powerOff();return;}
  if(st==='off'){if(k==='blue')tetClose();else powerOn();return;}
  if(k==='volu'||k==='vold'){vol=Math.max(0,Math.min(6,vol+(k==='volu'?1:-1)));mute=false;setVol();sfx('beep');osd={vol:1,e:now()+1800};return;}
  if(k==='mute'){mute=!mute;setVol();osd={vol:1,e:now()+1800};return;}
  if(st==='noise'||st==='over'||st==='clear')return;
  if(st==='title'){
    if(k==='ok')start();else if(k[0]==='n')setLv(+k.slice(1));
    else if(k==='chu'||k==='up'||k==='right')setLv(lv0+1);else if(k==='chd'||k==='down'||k==='left')setLv(lv0-1);
    else if(k==='yellow')yellow();else if(k==='blue')tetClose();
    return;}
  if(st==='result'){if(k==='ok')start();else if(k==='green')toTitle();else if(k==='blue')tetClose();return;}
  if(st==='pause'){if(k==='red'||k==='ok')resume();else if(k==='green')toTitle();else if(k==='blue')tetClose();return;}
  if(st!=='play')return;
  if(k==='left')move(-1);else if(k==='right')move(1);else if(k==='up'||k==='ok')turn();else if(k==='down')soft();
  else if(k==='red')doPause();else if(k==='green')toTitle();
  else if(k==='blue'){doPause();showOsd('나가기','한 번 더 누르면 나가요',2200);}
  else if(k==='yellow')yellow();
  else if(k==='chu'||k==='chd'){sfx('beep');showOsd('CH 07','다른 채널은 아직 준비 중',1800);}
  else if(k[0]==='n'){sfx('nope');showOsd('레벨 '+level(),'게임 중엔 못 바꿔요',1500);}
  if(REP[k])held[k]={t:0,f:true};
}
function release(k){delete held[k];}
function irFlash(){const i=$('tt-ir');if(!i)return;i.classList.add('f');clearTimeout(irFlash.t);irFlash.t=setTimeout(()=>i.classList.remove('f'),90);}
const KB={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',' ':'ok',Enter:'ok',p:'red',P:'red',Escape:'red',m:'mute','+':'volu','-':'vold'};
const keyOf=e=>KB[e.key]||(/^[1-9]$/.test(e.key)?'n'+e.key:null);
const btn=k=>document.querySelector('#tt-rc [data-k="'+k+'"]');
function onKey(e){const k=keyOf(e);if(!k)return;e.preventDefault();if(e.repeat)return;const b=btn(k);b&&b.classList.add('dn');press(k);}
function onKeyUp(e){const k=keyOf(e);if(!k)return;const b=btn(k);b&&b.classList.remove('dn');release(k);}
function onHide(){if(document.hidden&&openNow){doPause();held={};}}

/* ---------- 그림 ---------- */
const F11='11px Galmuri11',F14='14px Galmuri14';
function tx(s,x,y,col='#fff',al='left',f=F11,sh='#000'){X.font=f;X.textAlign=al;X.textBaseline='top';if(sh){X.fillStyle=sh;X.fillText(s,x+1,y+1);}X.fillStyle=col;X.fillText(s,x,y);}
function otx(s,x,y,col,al,f){X.font=f;X.textAlign=al;X.textBaseline='top';X.fillStyle='#000';for(const[a,b]of[[-1,0],[1,0],[0,-1],[0,1],[1,1]])X.fillText(s,x+a,y+b);X.fillStyle=col;X.fillText(s,x,y);}
let BG=null,TORI=null,NZ=null,NQ=null,NI=null;
function makeArt(){if(BG)return;BG=document.createElement('canvas');BG.width=W;BG.height=H;const q=BG.getContext('2d'),g=q.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#1d2f78');g.addColorStop(1,'#0a1240');q.fillStyle=g;q.fillRect(0,0,W,H);
  q.fillStyle='rgba(255,255,255,.05)';for(let y=0;y<H;y+=2)for(let x=(y/2)%2*2;x<W;x+=4)q.fillRect(x,y,1,1);
  q.fillStyle='rgba(120,150,255,.07)';for(let i=-H;i<W;i+=24){q.beginPath();q.moveTo(i,H);q.lineTo(i+H,0);q.lineTo(i+H+8,0);q.lineTo(i+8,H);q.fill();}
  NZ=document.createElement('canvas');NZ.width=160;NZ.height=120;NQ=NZ.getContext('2d');NI=NQ.createImageData(160,120);}
const ACORN=["..kkkk..",".kddddk.","kddddddk",".kbbbbk.",".kbbbbk.","..kbbk..","...kk..."],APAL={k:'#4a3423',d:'#9a6b3c',b:'#d9b98a'};
function acorn(x,y,s=2){ACORN.forEach((r,j)=>[...r].forEach((c,i)=>{if(c!=='.'){X.fillStyle=APAL[c];X.fillRect(x+i*s,y+j*s,s,s);}}));}
function box(x,y,w,h,fill='rgba(4,8,36,.62)',line='#6f7fe0'){X.fillStyle=fill;X.fillRect(x,y,w,h);X.fillStyle=line;X.fillRect(x,y,w,1);X.fillRect(x,y+h-1,w,1);X.fillRect(x,y,1,h);X.fillRect(x+w-1,y,1,h);}
function tri(x,y,dir,col){X.fillStyle=col;for(let i=0;i<4;i++){if(dir<0)X.fillRect(x+i,y+3-i,1,i*2+1);else X.fillRect(x+3-i,y+3-i,1,i*2+1);}}
function drawTori(t){if(!TORI||!TORI.complete||!TORI.naturalWidth)return;X.drawImage(TORI,264,194+(t<tbump?-2:0));
  if(msg&&t<msg.e){X.font=F11;const w=Math.ceil(X.measureText(msg.t).width)+12,x=258-w,y=200;
    X.fillStyle='#000';X.fillRect(x-1,y-1,w+2,18);X.fillStyle='#fffaf0';X.fillRect(x,y,w,16);
    X.fillStyle='#000';X.fillRect(x+w,y+6,3,1);X.fillRect(x+w,y+7,5,1);X.fillRect(x+w,y+8,3,1);X.fillStyle='#fffaf0';X.fillRect(x+w-1,y+7,3,1);
    tx(msg.t,x+6,y+3,'#3a2a20','left',F11,null);}}
function drawOsd(t){if(!osd||t>osd.e)return;
  if(osd.vol){otx(mute?'음소거':'음량',18,9,'#5dff5d','left',F14);
    for(let i=0;i<6;i++){X.fillStyle='#000';X.fillRect(17+i*13,27,11,13);X.fillStyle=(!mute&&i<vol)?'#5dff5d':'#1d4d1d';X.fillRect(18+i*13,28,9,11);}return;}
  otx(osd.a,18,9,'#5dff5d','left',F14);if(osd.b)otx(osd.b,20,26,'#5dff5d','left',F11);}
function drawBoard(){
  X.fillStyle='#c9cbe6';X.fillRect(BX-3,BY-3,COLS*CS+6,ROWS*CS+6);X.fillStyle='#4a4f8a';X.fillRect(BX-2,BY-2,COLS*CS+4,ROWS*CS+4);
  X.fillStyle='#05081a';X.fillRect(BX,BY,COLS*CS,ROWS*CS);
  X.fillStyle='rgba(255,255,255,.06)';for(let y=1;y<ROWS;y++)for(let x=1;x<COLS;x++)X.fillRect(BX+x*CS,BY+y*CS,1,1);
  const mx=BX+COLS*CS/2;
  if(st==='pause'){tx('일시정지',mx,BY+86,'#ffe66a','center',F14);tx('빨간 버튼',mx,BY+108,'#ccd','center');tx('누르면 계속',mx,BY+122,'#ccd','center');return;}
  const blink=Math.floor(clrT/70)%2===0;
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){let k=board[y][x];if(st==='over'&&y>=ROWS-overN)k='G';
    if(st==='clear'&&clr.includes(y)&&blink)k='F';if(k)cell(BX+x*CS,BY+y*CS,k);}
  if(cur&&st==='play')for(const[a,b]of cur.c){const cy=cur.y+b;if(cy>=0)cell(BX+(cur.x+a)*CS,BY+cy*CS,cur.k);}}
const pad6=n=>String(Math.min(n,999999)).padStart(6,'0');
function drawPanel(){box(144,16,168,140);
  tx('다음',152,22,'#ffe66a');box(150,36,60,44,'#05081a','#4a4f8a');
  if(nxt){const c=SH[nxt],xs=c.map(a=>a[0]),ys=c.map(a=>a[1]),x0=Math.min(...xs),y0=Math.min(...ys),w=(Math.max(...xs)-x0+1)*CS,h=(Math.max(...ys)-y0+1)*CS;
    for(const[a,b]of c)cell(Math.round(150+(60-w)/2+(a-x0)*CS),Math.round(36+(44-h)/2+(b-y0)*CS),nxt);}
  tx('레벨',222,22,'#ffe66a');tx(String(level()).padStart(2,'0'),222,36,'#fff','left',F14);
  tx('줄',222,58,'#ffe66a');tx(String(lines).padStart(3,'0'),222,68,'#fff','left',F14);
  tx('점수',152,90,'#ffe66a');tx(pad6(score),152,104,'#fff','left',F14);
  tx('최고',152,124,'#ffe66a');tx(pad6(Math.max(best(),score)),152,136,'#aab4ff','left',F14);}
const LOGO={O:['111','101','101','101','111'],T:['111','010','010','010','010'],E:['111','100','111','100','111'],R:['110','101','110','101','101'],I:['111','010','010','010','111'],S:['011','100','010','001','110']};
function drawTitle(t,dt){
  X.save();X.globalAlpha=.32;for(const d of deco){d.y+=d.v*dt/1000;if(d.y>H+10){d.y=-40;d.k=KEYS[Math.floor(Math.random()*7)];}
    for(const[a,b]of SH[d.k])cell(d.x+a*CS,Math.round(d.y)+b*CS,d.k);}X.restore();
  const ks='ZOTSIJL',x0=(W-(7*27-6))/2;
  [...'TETORIS'].forEach((ch,i)=>LOGO[ch].forEach((r,y)=>[...r].forEach((v,x)=>{if(v==='1')cell(x0+i*27+x*7,50+y*7,ks[i],7);})));
  box(104,100,112,40);tx('시작 레벨',160,104,'#ffe66a','center');tri(126,122,-1,'#fff');tri(190,122,1,'#fff');
  tx(String(lv0),160,119,'#fff','center',F14);
  tx('숫자 버튼 1~9로 골라요',160,148,'#8f98d8','center');
  if(Math.floor(t/520)%2===0)otx('확인 버튼을 누르세요',160,168,'#ffe66a','center',F11);
  tx('최고 기록  '+pad6(best()),160,190,'#aab4ff','center');
  tx('© TORI SOFT 2006',160,224,'rgba(255,255,255,.4)','center');}
function drawResult(t){
  X.font='28px Galmuri14';X.textAlign='center';X.textBaseline='top';X.fillStyle='#000';X.fillText('GAME OVER',162,24);X.fillStyle='#ff5a5a';X.fillText('GAME OVER',160,22);
  box(70,62,180,96);
  tx('점수',86,72,'#ffe66a');tx(pad6(score),234,70,'#fff','right',F14);
  tx('지운 줄',86,92,'#ffe66a');tx(String(lines),234,90,'#fff','right',F14);
  tx('레벨',86,112,'#ffe66a');tx(String(level()),234,110,'#fff','right',F14);
  if(newBest){if(Math.floor(t/400)%2===0)tx('최고 기록!',160,136,'#7dff7d','center');}else tx('최고 '+pad6(best()),160,136,'#aab4ff','center');
  if(rw&&rw.got){tx('도토리',138,170,'#fff','right');for(let i=0;i<rw.got;i++)acorn(144+i*20,168);tx(rw.got+'개 받았어요!',148+rw.got*20,170,'#fff');}
  else if(rw&&rw.r&&rw.full)tx('오늘 보상은 다 받았어요 (연습은 계속!)',160,170,'#ccd','center');
  else tx('10줄이면 1개, 25줄이면 2개 받아요',160,170,'#ccd','center');
  if(Math.floor(t/520)%2===0)tx('확인: 한 번 더',160,196,'#ffe66a','center');tx('파랑: 나가기',160,212,'#8f98d8','center');}
function drawNoise(){const d=NI.data;for(let i=0;i<d.length;i+=4){const v=Math.random()*255|0;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}NQ.putImageData(NI,0,0);X.drawImage(NZ,0,0,W,H);}

/* ---------- 돌리기 ---------- */
function tick(dt){
  if(st==='play'){for(const k in held){const h=held[k],r=REP[k];h.t+=dt;if(h.t>=(h.f?r[0]:r[1])){h.t=0;h.f=false;if(k==='left')move(-1);else if(k==='right')move(1);else soft();if(st!=='play')break;}}
    if(st==='play'&&!held.down){gAcc+=dt;if(gAcc>=gms()){gAcc=0;if(!hit(cur.c,cur.x,cur.y+1))cur.y++;else lock();}}}
  else if(st==='clear'){clrT+=dt;if(clrT>=380)finishClear();}
  else if(st==='over'){overT+=dt;while(overT>=40&&overN<ROWS){overT-=40;overN++;}}}
function draw(t,dt){
  if(st==='off'){X.fillStyle='#000';X.fillRect(0,0,W,H);return;}
  if(st==='noise'){drawNoise();return;}
  X.drawImage(BG,0,0);
  if(st==='title')drawTitle(t,dt);else if(st==='result')drawResult(t);else{drawBoard();drawPanel();}
  drawOsd(t);}
let last=0;
function frame(t){if(!openNow)return;const dt=Math.min(50,t-last);last=t;tick(dt);draw(t,dt);raf=requestAnimationFrame(frame);}

/* ---------- 화면 맞추기 ---------- */
function lay(){const o=$('mg');if(!o||!openNow)return;const w=innerWidth,h=innerHeight,land=w>h*1.05;o.classList.toggle('land',land);let tvw,u;
  if(!land){tvw=Math.min(w-24,560,h*.44/.88);u=Math.min((w-16)/330,(h-tvw*.88-40)/440,1.5);}
  else{tvw=Math.min(w*.55,(h-28)/.88,640);u=Math.min((w-tvw-44)/450,(h-20)/300,1.5);}
  o.style.setProperty('--tvw',tvw+'px');o.style.setProperty('--u',Math.max(.55,u));}

/* ---------- 열기·닫기 ---------- */
function tetOpen(){if($('mg'))return;
  if(!$('tt-css')){const s=document.createElement('style');s.id='tt-css';s.textContent=CSS;document.head.appendChild(s);}
  if(typeof bgStop==='function')bgStop();
  const o=document.createElement('div');o.id='mg';o.className='tt';o.style.cssText='position:fixed;inset:0;z-index:70;touch-action:none';o.innerHTML=HTML;document.body.appendChild(o);
  C=$('tt-scr');X=C.getContext('2d');X.imageSmoothingEnabled=false;PIC=$('tt-pic');makeArt();
  o.querySelectorAll('#tt-rc .tt-b').forEach(b=>{const k=b.dataset.k;
    b.addEventListener('pointerdown',e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){}b.classList.add('dn');vib(6);press(k);});
    const up=()=>{b.classList.remove('dn');release(k);};
    b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);
    b.addEventListener('contextmenu',e=>e.preventDefault());});
  /* v1.4.1: 꾹 누르면 나오는 iOS 돋보기(글자 선택 돋보기) 막기 — 창 자체에서 터치 기본동작을 끊고, 남아 있던 선택·입력 초점을 지워요 */
  ['touchstart','touchmove','touchend','selectstart','dragstart','gesturestart'].forEach(n=>o.addEventListener(n,e=>{if(e.cancelable)e.preventDefault();},{passive:false}));
  o.addEventListener('pointerdown',()=>{try{const a=document.activeElement;if(a&&a!==document.body&&a.blur)a.blur();const g=getSelection();if(g&&g.rangeCount)g.removeAllRanges();}catch(_){}},true);
  openNow=true;st='off';tok++;held={};osd=null;msg=null;cur=null;
  addEventListener('keydown',onKey);addEventListener('keyup',onKeyUp);addEventListener('resize',lay);document.addEventListener('visibilitychange',onHide);
  lay();au();powerOn();last=performance.now();raf=requestAnimationFrame(frame);}
function tetClose(){openNow=false;++tok;musStop();held={};cancelAnimationFrame(raf);raf=0;
  removeEventListener('keydown',onKey);removeEventListener('keyup',onKeyUp);removeEventListener('resize',lay);document.removeEventListener('visibilitychange',onHide);
  const o=$('mg');if(o&&typeof mgGone==='function')mgGone(o);else if(o)o.remove();C=X=PIC=null;st='off';render();if(typeof bgStart==='function')bgStart();}
window.tetOpen=tetOpen;window.tetClose=tetClose;
/* 검사용(tools/test_tetris.js) */
window.TET={press,release,tick,get st(){return st},get score(){return score},get lines(){return lines},get level(){return level()},get cur(){return cur},get board(){return board},set board(b){board=b},
  get rw(){return rw},spawnK(k){cur=mk(k);},hit:(c,x,y)=>hit(c,x,y),rot};
})();
