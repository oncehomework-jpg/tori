/* 사라진 도토리 사건 — 추리 보드게임 */
/* ===== v8.1 보드게임: 사라진 도토리 사건 (추리) — 누가(용의자 5)·무엇으로(물건 5)·어디서(장소 6) =====
   그림: MY_IMG(tools/mg/mystery_art.py·mystery_bg.py가 만든 작은 PNG) · 타코 q_octo · 도치 q_dochi · 호두 q_squi(tools/icons/sp6.py) · 토리 q_tori_f
   상태 S.bdg.my = {lv, sol:[범인,물건,장소], st:시작 단서, pl:[{f:증거, t:증언}×6], v:[조사한 장소 순서], mk:{키:1 X/2 O}, m:가장 적은 조사 수, cur, res}
   단서: {k:'a', a:MY_A 번호, g:1이면 '아니다' 쪽} 증거(늘 사실) / {k:'t', d:0 누가·1 무엇·2 어디, v:아니라고 하는 것, b:말한 사람(0~4 용의자, -2 토리)}
   어려움: 범인의 증언만 거짓말. 문제는 답이 딱 하나이고, 3~5곳만 조사해도 풀리게 만들어요(myGen).
   보상 mgRw(맞히면 🌰1, 가장 적은 수+1곳 이하로 맞히면 🌰2), 최고 기록 S.mg.bm(적게 조사한 곳 수), S.bdg.mc 푼 사건·mx 놓친 사건 */
const MY_IMG={"basket":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABN0lEQVR42mNgGOqAkZACaxXx//jkj955idcMFkKGT8mxRBG7eesJurL/+CxhwedqmOGrd13C6YhcN1kGBgaG/7h8w4LP1TCDD976ijcYoZZg9Q3OIFq96xLcYPzhjD+OmLC5nnPXB4Y4BjmiIvHonZeMMIfkusliJAqcPrjw7APRSRHiCOw+wWpB8q3rRLmeGMCCL70TygP4UhXMcYwwg9ZOiKRqDg4uWM5w9M5LRpQgOrDtCO2KCmRfPL/zACXHOnjZkCQ+eddjePzh9IGDlw3D8zsPGCRVFEgWn7xrOfZ8gAxgiikVp3oQIQcPig+O3nnJGFywnGoux5nRbt56wnDz1hMGdTUZuEZYWBMjjhz+eOMAZsjzOw9IEidYo8HigpwUhR7+eH1AjfDHWSeTUwZRq3AkGQAAc+XqBlQLWiAAAAAASUVORK5CYII=","rod":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABZUlEQVR42mNgGCrAWkX8PzINA0zUMjzeTZnBWkX8f2+BI4olTNT0RW+BI0PxhP0MR++8ZKSaBTDX62nJMWzadoph7Ym71PMBuuEHb33FUMNES8PJtgBm+MJdd+GGI4c71VJRb4EjQTVM1AgaXK4nK2hmZVn9PzEl4n+Vl9J/9EwFU/PizRe4HBOtXc5CaqTaP3hBUrAwETIYORiIiVSifWCtIv5/67n7DAwMDAyrKlyoG6nWKuL/P3z6hoJxRSqhSCbK8ANHzvw/cOQMURagW0J0Kjpx4gxZocGCXmEwMDAweBspMmw9d5/hwqVrcIWbZ9STFPY/4nwYGBgYGBhhhuuXHWRgYGBguHrhBgMDAwNDp9YKhgM/HEg23FpF/P9SNU0G+a37GR56OyIsYHGbiarwQRG8hCQ11cAsib51HXcypTQ5cizawsBgoUzdKhMGjt55yRhsocxw9M5LRkZskUxOsOACAPpD7vLtk6M7AAAAAElFTkSuQmCC","umb":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABLElEQVR42mNgGEzAWkX8v7WK+H9S9DASazA28aN3XhLUz0KMoXtzihkYGBgYTq3bwMDAwMBgFhTA8OHCBYZghr3/CVnGgstwmKEwcGrdBgazoAC4JQIGBgxrkeSDGfb+x2YJEzGGIwN0S2BgrY0z1qBkIsVwbICQJUzEGA4LHnTw4cIFhg8XLqCItUspo1jCSK7hp9ZtYFBTUsCq59a9BwyVz+4yHL3zkpGJ2nnl1r0H+COZEJj06hlGsCADdF/Bg8ifTRhFYuOvt3A2ilyAG8PGVcuxyyHpgyVZFjhHheE/zlyKJOePLo9PH3JGw5ftYXLY0jmh4oKJ1gXkqAXUsYDUSoao+gDZcHkxXgYGBob/dAmiCwe2UNcH0HQO8wXJgJFYhcjxQExdTDcAAAu0iR36VDeWAAAAAElFTkSuQmCC","pail":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABh0lEQVR42mNgGOqAEZ+ktYr4f2IMOXrnJU5zWPAZ7J/VSJwzp9X/x2URIzbDkQ3eOK0er9noatEtYcRlOMxgfN7H5lt0S7AGEUyRtYr4f2Li4eidl4wM0+r/YwtSRnTXIweJ/pyTREXBxRRzlCBD9gWKD8SsIhj0jTxIToowh1w4dYNBzMqCgQHJkRhBdHXXIzhb200Ow7ALp24wGJhpMFw4dQMuxvqBC0IzcDHM33QJfzJN9NPD61ozOwuGUzc+MBiIaSB5Heq4W48w1DMhR9TsGHWCwXHqxges4jDD/6wKRUlFTKSE9akbHxjMNARwGo4NMJFiOC4faKvJUWYBLpcT4wMWXBIBHAkItgEqjQEMGBj8VxVhhD+GBUfvvGRkiFH/r19zkkGD4QFVimusPjDTEGBYdGMDnF8XIs/QtOYh3mB5/eAGgyCxcYAtIutC5IkKc6LjABnAXI/L4NcPbhCfio7eecl4scWc6FQCM1zwVC3Wop2F2KSHLcwpqpOJrY+JqZdpCgAHaLTzUFEf5AAAAABJRU5ErkJggg==","mag":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAA+ElEQVR42mNgGGzAWkX8PynqWUg1cK6aJkMyAwNc7Oidl4z49DMSMniumiZOzReefWCY/OU5XosYcRmOz2B0SxgYGBgmf3mO1RImSgxHBrk8kljjB2ccSJhZofBfnDqGVZ2BlADcFwSDyFpF/P/WmGScirFZgm44elCxEBsE3kvmMqCnJmJ8wEKs4egRmMzA8H+umiZew7FGMqUAPbJZSAlvZHD0zkvGZAaG/7k8kvT1wagFg88CzFRUVMfAwMDA8OHWPYRYhCNOA36UtWAK1iWPxgEJFnw4YPCfVoZ/OGDwnxGZI+BwgRFbpYGv3sWlHmYe3HBa+QAA4LltX5mkMEIAAAAASUVORK5CYII=","gold":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABUElEQVR42mNgGEzAWkX8v7WK+H9S9LCQYri+DCeDihQPAwMDw/+jd14yEqOPiVRf3Hn2hYEqPiAUFOjyuHzEgkvz1BpPolz44NYDCGMVJNisVcRRgo8Jl+GzFhxgYGBgIEjvOgaxQF+GEx5PyL5jJNflKK6HgnsP3jCsPfWaAasPkA0n1fUw+s6zLwzBZqLk+QDdtejg3oM3DAwMDBg+YMQWB6VhmkQFEcxQGEA3HKsFMEuOnOkkypKvNxYwMDAwMLjHXMeaVJmoYTgDAwPD3DJOrHmHcE7mj6eo/CKuqKDAEsKF3ceFeIOGgYGB4cmlB9Qr7KjvAxyuRnf9hQsfGBgY2An74Oidl4w2JuUohhIynIGBgWHyLnbikim6i4kxHOJ6EuLg6J2XjO4x13FqQo9UXK7HmZPRK5WdSzSxppTkru94KxuCFhCq3Yitl2kKAIlAvi1emRBjAAAAAElFTkSuQmCC","room":"images/scenes/place-room-v102.webp","wheel":"images/scenes/place-wheel-v102.webp","forest":"images/scenes/place-forest-v102.webp","sea":"images/scenes/place-sea-v102.webp","stage":"images/scenes/place-stage-v102.webp","kitchen":"images/scenes/place-kitchen-v102.webp"};
const MY_S=[{n:'타코',ic:'q_octo'},{n:'도치',ic:'q_dochi'},{n:'호두',ic:'q_squi'},{n:'부엉박사',ic:'q_owl'},{n:'냐옹이',ic:'q_cat'}];
const MY_I=[{n:'바구니',im:'basket'},{n:'낚싯대',im:'rod'},{n:'우산',im:'umb'},{n:'양동이',im:'pail'},{n:'자석',im:'mag'}];
const MY_P=[{n:'토리의 방',im:'room'},{n:'챗바퀴 놀이터',im:'wheel'},{n:'도토리 숲',im:'forest'},{n:'바닷가',im:'sea'},{n:'무대',im:'stage'},{n:'부엌',im:'kitchen'}];
const MY_D=[MY_S,MY_I,MY_P],MY_DN=['범인','쓴 물건','범행 장소'],MY_LV=['쉬움','어려움'];
/* 증거: s에 든 것이면 p, 아니면 q(→ 그것들은 아니에요) */
const MY_A=[
 {d:0,s:[2,4],p:'부드러운 털 한 가닥이 떨어져 있어요',q:'털은 한 가닥도 없어요'},
 {d:0,s:[2,3,4],p:'높은 선반 위까지 올라간 자국이 있어요',q:'높은 곳에는 손도 안 댔어요'},
 {d:0,s:[0,1,2],p:'아주 좁은 틈으로 드나든 흔적이 있어요',q:'좁은 틈에는 먼지가 그대로 쌓여 있어요'},
 {d:0,s:[1,3],p:'캄캄한 밤에 움직인 흔적이에요',q:'환한 낮에 일어난 일이에요'},
 {d:0,s:[0,3,4],p:'발자국이 꽤 커요',q:'발자국이 아주 작아요'},
 {d:1,s:[1,2],p:'긴 막대 같은 걸로 멀리서 끌어당긴 자국이 있어요',q:'가까이 와서 직접 가져간 것 같아요'},
 {d:1,s:[1,2,3],p:'물방울이 뚝뚝 떨어진 자국이 있어요',q:'주변이 바싹 말라 있어요'},
 {d:1,s:[0,2,3],p:'동그란 손잡이 자국이 남아 있어요',q:'손잡이 자국은 없어요'},
 {d:1,s:[3,4],p:'쇠붙이 냄새가 나요',q:'쇠붙이 냄새는 안 나요'},
 {d:1,s:[0,3],p:'무언가에 담아서 들고 간 것 같아요',q:'담아 간 건 아닌 것 같아요'},
 {d:2,s:[2,3],p:'황금 도토리 부스러기에 바깥 흙이 묻어 있어요',q:'황금 도토리 부스러기가 아주 깨끗해요'},
 {d:2,s:[1,3],p:'황금 도토리 부스러기에 고운 가루(모래나 톱밥)가 묻어 있어요',q:'황금 도토리 부스러기에 가루는 하나도 없어요'},
 {d:2,s:[2,5],p:'황금 도토리 부스러기에서 고소한 냄새가 나요',q:'황금 도토리 부스러기에서 아무 냄새도 안 나요'},
 {d:2,s:[0,4],p:'황금 도토리 부스러기에 나무 바닥 결이 찍혀 있어요',q:'황금 도토리 부스러기에 나무 바닥 자국은 없어요'},
 {d:2,s:[1,3,5],p:'황금 도토리 부스러기가 살짝 젖어 있어요',q:'황금 도토리 부스러기가 바싹 말라 있어요'}];
/* 받침(은/는·이/가·을/를·로/으로) */
function myJo(w,a,b){const c=w.charCodeAt(w.length-1)-0xAC00,bt=c>=0&&c<11172?c%28:0;return w+(a==='로'?(bt===0||bt===8?'로':'으로'):(bt?a:b));}
const myNm=(d,a)=>a.map(i=>MY_D[d][i].n).join('·');
function myTrue(c,h){return c.k==='a'?(MY_A[c.a].s.includes(h[MY_A[c.a].d])!==!!c.g):h[c.d]!==c.v;}
function myOk(h,cl,lv){return cl.every(c=>(lv&&c.k==='t'&&c.b>=0)?myTrue(c,h)===(c.b!==h[0]):myTrue(c,h));}
function myCount(cl,lv,stop){let n=0,last=null;for(let s=0;s<5;s++)for(let i=0;i<5;i++)for(let p=0;p<6;p++)if(myOk([s,i,p],cl,lv)){n++;last=[s,i,p];if(stop&&n>1)return[n,null];}return[n,last];}
const myClues=(z,vs)=>[z.st,...vs.flatMap(i=>[z.pl[i].f,z.pl[i].t])];
function myMin(z){for(let k=0;k<=6;k++){const rec=(st,a)=>{if(a.length===k)return myCount(myClues(z,a),z.lv,1)[0]===1;for(let i=st;i<6;i++)if(rec(i+1,[...a,i]))return true;return false;};if(rec(0,[]))return k;}return 7;}
const myR=n=>Math.random()*n|0;
function myGen(lv){let z=null;
  for(let t=0;t<600;t++){const sol=[myR(5),myR(5),myR(6)];
    /* 증거 7개(시작 1 + 장소 6): 누가·무엇·어디가 고르게 섞이게 */
    const byD=[0,1,2].map(d=>suShuf(MY_A.map((a,i)=>i).filter(i=>MY_A[i].d===d)));const ev=[];
    for(let k=0;ev.length<7;k++){const a=byD[k%3].pop();if(a!=null)ev.push({k:'a',a,g:MY_A[a].s.includes(sol[MY_A[a].d])?0:1});}
    suShuf(ev);const sp=suShuf([0,1,2,3,4,-2]),pl=[];
    for(let i=0;i<6;i++){const b=sp[i];let tt;
      if(lv&&b===sol[0]){const o=[{d:0,v:b},{d:1,v:sol[1]},{d:2,v:sol[2]}];tt=o[myR(3)];}
      else{const d=myR(3),n=d<2?5:6;let v;do v=myR(n);while(v===sol[d]);tt={d,v};}
      pl.push({f:ev[i+1],t:{k:'t',d:tt.d,v:tt.v,b}});}
    const c={lv,sol,st:ev[0],pl,v:[],mk:{},cur:-1};
    const[n,h]=myCount(myClues(c,[0,1,2,3,4,5]),lv);if(n!==1||h.join()!==sol.join())continue;
    const m=myMin(c);if(m<3||m>(lv?5:4))continue;c.m=m;z=c;break;}
  return z;}
/* 말투: 증언은 '…다'로 끝나는 문장을 사람마다 바꿔요 */
function mySay(c){const b=c.b,me=b>=0?MY_S[b].n:'토리',D=MY_D[c.d][c.v].n;let t;
  if(c.d===0)t=c.v===b?'나는 그때 토리랑 같이 있었다. 나는 범인이 아니다':myJo(D,'은','는')+' 그때 나랑 같이 있었다. '+myJo(D,'은','는')+' 범인이 아니다';
  else if(c.d===1)t=myJo(D,'은','는')+' 하루 종일 내가 갖고 있었다. '+myJo(D,'로')+'는 못 가져갔다';
  else t='아까 '+D+'에 갔었는데 아무 일도 없었다. '+myJo(D,'은','는')+' 아니다';
  const ss=t.split('. ');
  if(b===0)return ss.map(x=>x+'코').join('. ')+'!';
  if(b===1)return '흥! '+ss.map(x=>x+'치').join('. ')+'! 이 가시 대장 말을 믿어라치.';
  if(b===2)return ss.map(x=>x+'람').join('. ')+'!';
  if(b===3)return '흠흠. '+ss.map(x=>x.replace(/아니다$/,'아니라').replace(/다$/,'다')+'네').join('. ')+'.';
  if(b===4)return ss.map(x=>x+'냥').join('. ')+'~';
  return '찍찍! '+t.replace(/나랑/g,'토리랑').replace(/내가/g,'토리가').replace(/었다/g,'었어요').replace(/갔다/g,'갔어요').replace(/아니다/g,'아니에요')+'.';}
/* 증거 문장 + 결론(초록) */
function myEv(c){const a=MY_A[c.a];if(!c.g)return[a.p,MY_DN[a.d]+(a.d===2?'는 ':'은 ')+myNm(a.d,a.s)+' 중 하나예요'];
  const no=MY_D[a.d].map((x,i)=>i).filter(i=>!a.s.includes(i));return[a.q,MY_DN[a.d]+(a.d===2?'는 ':'은 ')+myNm(a.d,no)+' 중 하나예요'];}
function myAv(b,big){return bgIco(b===-2?'q_tori_f':MY_S[b].ic,big?64:32);}
function myIco(d,i,sz){if(d===0)return myAv(i,sz>40);const o=MY_D[d][i];return `<img class="myim" src="${MY_IMG[o.im]}" alt="" style="width:${sz}px;height:${d===2?Math.round(sz*.5625):sz}px">`;}
const MY_CF=['들켰다코… 황금 도토리가 너무 반짝여서 바닷속 보물인 줄 알았다코! 바로 돌려줄게다코.','흥… 이 가시 대장이 들키다니! 황금 도토리로 가시를 꾸미고 싶었을 뿐이다치. 미안하다치, 토리.',
 '헤헤… 겨울에 먹으려고 땅에 묻어 두려고 했다람… 토리 거였구나, 미안하다람!','흠흠… 이렇게 귀한 도토리는 처음 봐서 연구해 보고 싶었다네. 미안하네, 토리 양.','냥… 반짝반짝 굴러가길래 그만 앞발로 톡톡 굴리면서 가져갔다냥. 미안하다냥!'];
const MY={acc:[-1,-1,-1]};
function myOpen(){const b=bgS();if(b.my&&!b.my.res)myPlay();else myPick();}
function myPick(){const b=bgS();const el=bgShell('🔍 사라진 도토리 사건');
  el.innerHTML=`<div class="card"><h2>단계 고르기</h2>${MY_LV.map((n,i)=>`<button class="bglv" onclick="myNew(${i})"><b>${n}</b><span>${['모두 사실만 말해요. 단서를 모으면 술술 풀려요','범인은 거짓말을 해요! 증거와 안 맞는 말을 찾아요'][i]}</span><span class="muted">맞히면 🌰1 · 적게 조사하고 맞히면 🌰2</span></button>`).join('')}
  <div class="muted">${S.mg.bm?'최고 기록: '+S.mg.bm+'곳만 조사하고 해결 · ':''}해결한 사건 ${b.mc||0} · 놓친 사건 ${b.mx||0}</div></div>
  <div class="card"><h2>하는 법</h2><div class="bghelp">토리의 <b>황금 도토리</b>가 사라졌어요! 진우가 탐정이 돼서 <b>누가 · 무엇으로 · 어디서</b> 가져갔는지 맞혀요.<br>① 장소를 골라 조사하면 증거와 그곳에 있던 친구의 말을 들을 수 있어요.<br>② 탐정 수첩의 칸을 눌러 아닌 건 ✕, 맞는 것 같은 건 ○로 표시해요.<br>③ 다 알 것 같으면 <b>범인 지목하기</b>! 기회는 한 번이에요.<br>· 증거는 늘 사실이에요. 어려움에서는 <b>범인만</b> 거짓말을 해요.<br>· 적은 곳만 조사하고 맞힐수록 보상이 커요. 중간에 나가도 그대로 저장돼요.</div></div>`;}
function myNew(lv){const el=$('bgb');if(el)el.innerHTML='<div class="card empty">사건 파일을 만드는 중이에요…</div>';
  setTimeout(()=>{const b=bgS(),z=myGen(lv);if(!z){myPick();return;}z.n=(b.mc||0)+(b.mx||0)+1;b.my=z;save();myPlay();},30);}
function myPlay(){if(!bgS().my)return myPick();bgShell('🔍 사라진 도토리 사건',()=>save());myDraw();}
function myEvHtml(c,tag){const[t,cc]=myEv(c);return `<div class="myev">${bgIco('q_lens',28)}<div>${tag?`<span class="mytg">${tag}</span> `:''}${esc(t)}<div class="cc">→ ${esc(cc)}</div></div></div>`;}
function mySayHtml(c,tag){const nm=c.b===-2?'토리':MY_S[c.b].n;return `<div class="mysay"><div class="myav">${myAv(c.b,1)}</div><div>${tag?`<span class="mytg">${tag}</span> `:''}<b>${esc(nm)}</b><br>${esc(mySay(c))}</div></div>`;}
function myDraw(){const z=bgS().my,el=$('bgb');if(!z||!el)return;const done=!!z.res,cur=z.cur>=0?z.cur:-1;
  const scn=cur>=0?`<div class="myscn"><img src="${MY_IMG[MY_P[cur].im]}" alt=""><span class="nm">${esc(MY_P[cur].n)}</span></div>${myEvHtml(z.pl[cur].f)}${mySayHtml(z.pl[cur].t)}`
   :`<div class="myscn"><img src="${MY_IMG.room}" alt=""><img class="mygold" src="${MY_IMG.gold}" alt=""><span class="nm">사건 #${z.n} · ${MY_LV[z.lv]}</span></div>
     <div class="mysay"><div class="myav">${bgIco('q_tori_f',64)}</div><div><b>토리</b><br>찍찍… 진우! 토리의 황금 도토리가 사라졌어요! 누가, 무엇으로, 어디서 가져갔는지 찾아 주세요.${z.lv?' 조심해요, 범인은 거짓말을 할 거예요!':''}</div></div>${myEvHtml(z.st,'처음 단서')}`;
  const pl=MY_P.map((p,i)=>`<button class="${z.v.includes(i)?'vi':''}${i===cur?' on':''}" style="background-image:url(${MY_IMG[p.im]})" onclick="myVisit(${i})"${done?' disabled':''}><span>${esc(p.n)}</span></button>`).join('');
  const nb=[0,1,2].map(d=>`<div class="mynbh">${['누가?','무엇으로?','어디서?'][d]}</div><div class="mynb${d===2?' p':''}">${MY_D[d].map((o,i)=>{const k=d+''+i,m=z.mk[k]||0;return `<button class="${m===1?'x':m===2?'o':''}" onclick="myMark('${k}')"${done?' disabled':''}><span class="ic">${myIco(d,i,d===2?44:32)}</span>${esc(o.n)}</button>`;}).join('')}</div>`).join('');
  const cl=[myEvHtml(z.st,'처음')].concat(z.v.map(i=>myEvHtml(z.pl[i].f,MY_P[i].n)+mySayHtml(z.pl[i].t,MY_P[i].n))).join('');
  if(done){el.innerHTML=myResHtml(z).replace(/<\/div>$/,`<div class="row" style="margin-top:12px"><button class="btn full" onclick="myPick()">새 사건</button><button class="btn ghost full" onclick="bgClose()">닫기</button></div></div>`);return;}
  el.innerHTML=`<div class="card" id="myscn">${scn}</div>
  <div class="card"><h2>조사할 곳 <span class="muted" style="font-size:14px">${z.v.length}곳 조사함</span></h2><div class="mypl">${pl}</div>
   ${done?`<div class="row" style="margin-top:12px"><button class="btn full" onclick="myPick()">새 사건</button><button class="btn ghost full" onclick="bgClose()">닫기</button></div>`:`<button class="btn wood full" style="margin-top:12px" onclick="myAsk()">범인 지목하기</button>`}</div>
  <div class="card"><h2>탐정 수첩 <span class="muted" style="font-size:14px">누르면 ✕ → ○ → 빈칸</span></h2>${nb}</div>
  <div class="card"><h2>모은 단서</h2><div class="mycl">${cl}</div></div>`;}
function myVisit(i){const z=bgS().my;if(!z||z.res)return;if(!z.v.includes(i))z.v.push(i);z.cur=i;sfx('tick');save();myDraw();const s=$('myscn');if(s)s.scrollIntoView({block:'start',behavior:S.noAnim?'auto':'smooth'});}
function myMark(k){const z=bgS().my;if(!z||z.res)return;z.mk[k]=((z.mk[k]||0)+1)%3;if(!z.mk[k])delete z.mk[k];save();myDraw();}
/* 범인 지목: 수첩에서 ○ 한 게 있으면 미리 골라 둠 */
function myAsk(){const z=bgS().my;if(!z||z.res)return;MY.acc=[0,1,2].map(d=>{const o=MY_D[d].map((x,i)=>i).filter(i=>z.mk[d+''+i]===2);return o.length===1?o[0]:-1;});myAskDraw();}
function myAskDraw(){const a=MY.acc,ok=a.every(x=>x>=0);
  modal(`<h3>범인 지목하기</h3><div class="muted">기회는 한 번! ${bgS().my.v.length}곳 조사했어요.</div>${[0,1,2].map(d=>`<div class="mynbh">${['누가?','무엇으로?','어디서?'][d]}</div><div class="mynb${d===2?' p':''}">${MY_D[d].map((o,i)=>`<button class="${a[d]===i?'sel':''}" onclick="MY.acc[${d}]=${i};myAskDraw()"><span class="ic">${myIco(d,i,d===2?44:32)}</span>${esc(o.n)}</button>`).join('')}</div>`).join('')}
  <div class="row" style="margin-top:10px"><button class="btn full" onclick="myJudge()"${ok?'':' disabled'}>${ok?esc(MY_S[a[0]].n)+'! 너로 정했다':'셋 다 골라요'}</button><button class="btn ghost full" onclick="closeM()">조금 더 조사</button></div>`);}
function myJudge(){const b=bgS(),z=b.my,a=MY.acc;if(!z||z.res||!a.every(x=>x>=0))return;closeM();
  const win=a.join()===z.sol.join(),vn=z.v.length;let m='',nb=false;
  if(win){b.mc=(b.mc||0)+1;[m,nb]=mgRw(vn<=z.m+1?2:1,'사건 해결!','bm',vn,true);sfx('fan');}else{b.mx=(b.mx||0)+1;sfx('no');}
  z.res={a:a.slice(),win,m,nb};z.cur=-1;save();myDraw();window.scrollTo(0,0);const o=$('bgo');if(o)o.scrollTop=0;}
function myResHtml(z){const r=z.res,[s,i,p]=z.sol,caught=r.a[0]===s,lie=z.lv?z.pl.map(x=>x.t).find(t=>t.b===s):null;
  return `<div class="card ${r.win?'legend':''} bgdone"><h2>${r.win?'🎉 사건 해결!':caught?'범인은 찾았어요!':'범인을 놓쳤어요…'}</h2>
  <div class="mysay"><div class="myav">${myAv(s,1)}</div><div><b>${esc(MY_S[s].n)}</b><br>${esc(MY_CF[s])}</div></div>
  <div class="myans"><b>정답</b> ${myJo(MY_S[s].n,'이','가')} <b>${esc(myJo(MY_I[i].n,'로'))}</b> <b>${esc(MY_P[p].n)}</b>에서 가져갔어요.<span class="myimgs">${myIco(1,i,32)}${myIco(2,p,44)}</span></div>
  ${r.win?'':`<div class="muted">진우가 고른 답: ${esc(MY_S[r.a[0]].n)} · ${esc(MY_I[r.a[1]].n)} · ${esc(MY_P[r.a[2]].n)}</div>`}
  ${lie?`<div class="muted">거짓말: ${esc(MY_S[s].n)}의 "${esc(mySay(lie))}"</div>`:''}
  <div style="margin:6px 0">${r.win?`${z.v.length}곳 조사 · 가장 적게는 ${z.m}곳이면 풀 수 있었어요${r.nb?' · 🏆 최고 기록!':''}<br>${r.m}`:`${caught?'범인은 맞혔지만 '+[r.a[1]!==i?'물건':'',r.a[2]!==p?'장소':''].filter(Boolean).join('·')+' 추리가 달랐어요. 완전 해결 보상은 세 가지를 모두 맞혀야 받아요.':'범인이 달랐어요. 다음 사건에서 단서를 다시 연결해 봐요.'} 가장 적게는 ${z.m}곳이면 풀 수 있었어요.`}</div>
  <div class="mysay"><div class="myav">${bgIco('q_tori_f',64)}</div><div><b>토리</b><br>${r.win?'찍찍찍~ ♪ 황금 도토리를 찾았어요! 진우 명탐정이에요!':caught?'찍찍! 범인은 찾았어요! 다음엔 물건과 장소까지 이어서 밝혀 봐요.':'찍찍… 괜찮아요. 다음 사건에서 단서를 다시 살펴봐요!'}</div></div></div>`;}
/* Team coordination is a local house feature: no hidden cards are exposed. */
const TC_PLANS={auto:'상황 보고 같이',lead:'내가 먼저 나갈게',mate:'토리 먼저 나가',feed:'나한테 차례 줘',block:'상대부터 막아 줘'};
function tcPlanOf(T){if(!T.h[0].length)return 'mate';if(!T.h[2].length)return 'auto';if(T.calls[0]&&!T.out.includes(0))return 'lead';if(T.calls[2]&&!T.out.includes(2))return 'mate';return T.teamPlan||'auto';}
function tcTeamSet(plan){const T=bgS().tc;if(!T||T.ph!=='play'||!TC_PLANS[plan]||!T.h[2].length)return;T.teamPlan=plan;const effective=tcPlanOf(T),override=effective!==plan&&effective!=='auto';const reply={auto:'찍찍! 차례와 남은 카드 수를 보면서 같이 움직일게요.',lead:'찍찍! 진우가 먼저 나가요. 진우가 이기고 있으면 패스하고, 개가 있으면 차례를 넘길게요.',mate:'찍찍! 토리가 먼저 줄여 볼게요. 진우도 토리가 이기고 있으면 무리해서 덮지 않아도 돼요.',feed:'찍찍! 시작할 차례에 개가 있으면 진우에게 넘길게요. 없으면 낮은 수로 길을 열어 볼게요.',block:'찍찍! 상대가 이기고 있으면 강한 카드도 아끼지 않고 막아 볼게요. 낼 수 있는 수가 없으면 패스해야 해요.'};T.teamReply=override?(effective==='lead'?'찍찍! 진우가 티츄를 불렀으니 진우의 1등을 먼저 도울게요!':'찍찍! 토리가 티츄를 불렀으니 토리의 1등을 먼저 노릴게요!'):reply[effective];T.log.unshift('팀 작전: '+TC_PLANS[effective]);T.log=T.log.slice(0,40);save();tcDraw();}
function tcTeamExplain(T,o){const plan=tcPlanOf(T),own=T.cur&&T.cur.by===0,hasWish=tcWishOpts(T,2).length>0;T.teamReply=hasWish?'찍찍! 작전보다 참새의 소원이 먼저라서, 소원 숫자를 포함한 수를 낼게요.':!o?own?'찍찍! 진우가 지금 이기고 있으니 토리는 덮지 않고 패스할게요.':'찍찍… 지금 이길 수 있는 수가 없거나 강한 카드를 아낄 때라 패스할게요.':o.k.includes(53)?'찍찍! 개로 진우에게 시작 차례를 넘겨요. 준비한 조합을 내 봐요!':o.k.length===T.h[2].length?'찍찍! 이 수로 토리 손패를 전부 낼 수 있어요. 먼저 나갈게요!':plan==='block'&&T.cur&&T.cur.by%2===1?'찍찍! 부탁한 대로 상대의 수를 넘어가 볼게요. 이후에 진우 차례를 열어 봐요.':plan==='lead'||plan==='feed'?'찍찍! 진우가 먼저 나갈 수 있도록 차례를 이어 볼게요. 진우가 이기면 토리는 패스해요.':'찍찍! 낼 수 있는 조합으로 토리 카드를 줄일게요. 우리 팀 차례를 같이 지켜요.';}
function tcTeamHtml(T){if(T.ph!=='play'&&T.ph!=='dragon')return '';const plan=tcPlanOf(T);return `<section class="tc-team"><h3>토리와 팀 작전</h3><div class="team-reply" aria-live="polite">${esc(T.teamReply||'찍찍! 진우, 원하는 작전을 알려 주세요.')}</div><div class="tc-team-options">${Object.entries(TC_PLANS).map(([key,label])=>`<button class="btn ${plan===key?'wood':'ghost'}" aria-pressed="${plan===key}" onclick="tcTeamSet('${key}')" ${T.ph!=='play'||!T.h[2].length?'disabled':''}>${esc(label)}</button>`).join('')}</div><small>${T.calls[0]||T.calls[2]?'티츄를 부른 팀원의 1등을 우선해요.':'팀원 차례를 돕는 작전이에요.'} 카드와 참새 소원에 따라 요청을 실행하지 못할 수도 있어요.</small></section>`;}
/* Paint canvas text only after the bundled fonts are ready. */
let mgFontReady=false,mgOpenPending=false;
const mgFontsLoaded=(document.fonts?Promise.all([document.fonts.load('400 16px Galmuri11','토리 타코 시작 점수'),document.fonts.load('700 16px Galmuri11','토리 타코 시작 점수'),document.fonts.load('400 14px Galmuri14','시간 점수')]):Promise.resolve()).then(()=>{mgFontReady=true;}).catch(()=>{mgFontReady=true;});
function mgReadyOpen(fn){return function(){const args=arguments;if(mgFontReady)return fn.apply(this,args);if(mgOpenPending)return;mgOpenPending=true;toast('게임 글꼴을 준비하고 있어요');mgFontsLoaded.then(()=>{mgOpenPending=false;fn.apply(this,args);});};}
mgOpen=mgReadyOpen(mgOpen);mg2Open=mgReadyOpen(mg2Open);mg3Open=mgReadyOpen(mg3Open);mg4Open=mgReadyOpen(mg4Open);mg5Open=mgReadyOpen(mg5Open);mg6Open=mgReadyOpen(mg6Open);mg7Open=mgReadyOpen(mg7Open);mg8Open=mgReadyOpen(mg8Open);mg9Open=mgReadyOpen(mg9Open);

