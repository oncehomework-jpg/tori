/* 보드게임 — 스도쿠·티츄와 놀이 화면(#bgo) */
/* ===== v7.8 보드게임: 홈 '🎳 보드게임' 카드 → 스도쿠·티츄 (전체 화면 #bgo, 앱 색 그대로라 밤 화면도 맞춰져요) =====
   상태: S.bdg = {su:진행 중 스도쿠, tc:진행 중 티츄, sw:[단계별 푼 횟수], tw:티츄 이긴 판, tl:진 판}
   보상: mgRw(미니게임과 하루 횟수 합산) · 최고 기록 S.mg.bs0~2(스도쿠 단계별 가장 빠른 초), S.mg.btw(티츄 이긴 판 수) */
function bgS(){if(!S.bdg||typeof S.bdg!=='object')S.bdg={};return S.bdg;}
const BGI={};
function bgIco(n,sz,cls){if(!BGI[n]){const{SP,PAL}=window.PXA,r=SP[n];if(!r)return'';let s='';r.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!=='.')s+=`<rect x='${x}' y='${y}' width='1' height='1' fill='${PAL[c]||PAL.k}'/>`;}));
  BGI[n]='url(&quot;data:image/svg+xml,'+encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' shape-rendering='crispEdges'>${s}</svg>`)+'&quot;)';}
  return `<i class="bgi${cls?' '+cls:''}" style="width:${sz}px;height:${sz}px;background-image:${BGI[n]}" aria-hidden="true"></i>`;}
const bgT=s=>{s=Math.max(0,s|0);return (s/60|0)+':'+String(s%60).padStart(2,'0');};
function osCard(){return `<div class="card"><div class="row sp"><h2 style="margin:0">♨ 토리네 온천</h2><button class="btn sm" onclick="osOpen()">쉬러 가기</button></div><p class="muted" style="margin-bottom:0">친구들과 느긋하게 온천욕해요.</p></div>`;}
function bdgCard(){const b=bgS(),su=b.su&&!b.su.done?b.su:null,tc=b.tc&&b.tc.ph!=='over'?b.tc:null,my=b.my&&!b.my.res?b.my:null;
 const games=[{icon:'q_sudoku',name:'스도쿠',brief:'빈칸을 1~9로 채우는 숫자 퍼즐',open:'suOpen()',saved:su?'하던 판 · '+SU_LV[su.lv]+' · '+bgT(su.t):'',rules:'가로줄·세로줄·굵은 네모 칸마다 1~9를 한 번씩 넣어요. 다 풀면 🌰1, 어려움은 🌰2.'},{icon:'q_tichu',name:'티츄',brief:'진우·토리 팀으로 200점에 도전',open:'tcOpen()',saved:tc?'하던 판 · 우리 '+tc.sc[0]+' : '+tc.sc[1]+' 상대':'',rules:'진우·토리 팀 대 타코·'+TC_NM[3]+' 팀. 손에 든 카드를 먼저 다 내면 좋아요. 200점을 먼저 넘긴 팀이 이기고, 이기면 🌰2.'},{icon:'q_lens',name:'사라진 도토리 사건',brief:'단서를 모아 범인·장소·물건 찾기',open:'myOpen()',saved:my?'하던 사건 · #'+my.n+' · '+my.v.length+'곳 조사':'',rules:'토리의 황금 도토리가 사라졌어요. 장소를 조사하고 누가·무엇으로·어디서 가져갔는지 맞혀요. 모두 맞히면 🌰1, 적게 조사하고 맞히면 🌰2.'}];
 return `<div class="card" id="bgcard"><div class="bg-compact-list">${games.map(g=>`<section class="bg-compact"><div class="bg-compact-head">${bgIco(g.icon,32)}<b>${g.name}</b><button class="btn sm" onclick="${g.open}">${g.saved?'이어하기':'시작'}</button></div><p class="bg-short">${g.brief}</p>${g.saved?`<p class="bg-save">${g.saved}</p>`:''}<details class="bg-rule"><summary>규칙·보상</summary><div>${g.rules}</div></details></section>`).join('')}</div><p class="bg-reward-note">보상은 하루 ${ECO.mgPlays}번까지 · 이후에도 자유롭게 연습</p></div>`;}
/* 전체 화면 틀: 위에 제목·닫기, 아래 본문 #bgb */
function bgShell(title,onClose){const had=!!$('bgo');bgClose(1);const o=document.createElement('div');o.id='bgo';if(had)o.className='bgre';o.innerHTML=`<div class="bgin"><div class="bgtop"><button class="btn ghost sm" id="bgx">◀ 나가기</button><h3>${title}</h3><span id="bgtm"></span></div><div id="bgb"></div></div>`;
  document.body.appendChild(o);$('bgx').onclick=()=>{if(onClose)onClose();bgClose();};document.documentElement.classList.add('bgon');return $('bgb');}
function bgClose(quiet){dfTakoClear();if(DF.observer){DF.observer.disconnect();DF.observer=null;}clearInterval(SU.tm);SU.tm=0;clearTimeout(TC.to);TC.to=0;const o=$('bgo');if(o){if(quiet)o.remove();else mgGone(o);}document.documentElement.classList.remove('bgon');if(!quiet){save();if(tab==='home')rHome();}}

/* ---------- 스도쿠 ---------- */
const SU_LV=['쉬움','보통','어려움'],SU_CL=[40,32,26],SU_RW=[1,1,2],SU={sel:-1,memo:0,tm:0,q:'',qn:0,idle:0};
/* 토리 응원(찍찍! + 해요체). SU.q=말, SU.qn=새 말이면 살짝 튀어나옴, SU.idle=가만히 있은 초 */
const SU_LN={new:['찍찍! 천천히 같이 풀어 봐요!','찍찍찍~ ♪ 토리가 옆에서 응원할게요!','찍찍! 쉬운 칸부터 하나씩 찾아봐요!'],back:['찍찍! 이어서 풀어요. 토리 기다렸어요!','찍찍! 아까 하던 판이에요!'],
 ok:['찍찍! 맞았어요!','찍찍찍~ ♪ 척척이에요!','찍찍! 진우 눈썰미 최고예요!','찍찍! 그 칸 딱 맞아요!'],bad:['찍찍… 괜찮아요, 다시 보면 돼요!','찍찍! 아깝다, 빨간 숫자 한 번 더 봐요!','찍찍… 토리도 자주 틀려요. 천천히요!'],
 hint:['찍찍! 토리가 살짝 알려 줄게요!','찍찍, 이 칸은 토리가 찾아 놨어요!'],half:['찍찍! 벌써 반이나 채웠어요!'],near:['찍찍찍! 이제 몇 칸 안 남았어요!'],
 idle:['찍찍… 막혔어요? 힌트 써도 괜찮아요!','찍찍! 숫자가 많이 채워진 줄부터 보면 쉬워요','찍찍~ 잠깐 쉬어도 돼요. 토리는 기다릴 수 있어요!','찍찍! 아래 숫자 버튼에 남은 개수가 적은 숫자를 찾아봐요'],
 done:['찍찍찍~ ♪ 다 풀었어요! 진우 천재예요!','찍찍! 다 풀었어요! 토리 볼이 빵빵해질 만큼 기뻐요!']};
function suQ(k,low){if(low&&Math.random()>.3)return;const a=SU_LN[k];SU.q=a[Math.random()*a.length|0];SU.qn=1;}
const suPc=m=>{let n=0;while(m){m&=m-1;n++;}return n;};
const suBx=i=>((i/27|0)*3+((i%9)/3|0));
function suShuf(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;}
/* 답의 개수 세기(lim개 찾으면 멈춤) — 빈칸 중 후보가 가장 적은 칸부터 */
function suCount(g,lim){const R=new Uint16Array(9),C=new Uint16Array(9),B=new Uint16Array(9);
  for(let i=0;i<81;i++){const v=g[i];if(v){const m=1<<v,r=i/9|0,c=i%9,b=suBx(i);if((R[r]|C[c]|B[b])&m)return 0;R[r]|=m;C[c]|=m;B[b]|=m;}}
  let n=0;const rec=()=>{let bi=-1,bm=0,bc=10;
    for(let i=0;i<81;i++)if(!g[i]){const m=~(R[i/9|0]|C[i%9]|B[suBx(i)])&0x3FE,k=suPc(m);if(k<bc){bc=k;bi=i;bm=m;if(k<2)break;}}
    if(bi<0){n++;return n>=lim;}if(!bc)return false;const r=bi/9|0,c=bi%9,b=suBx(bi);
    for(let v=1;v<=9;v++)if(bm&(1<<v)){const m=1<<v;g[bi]=v;R[r]|=m;C[c]|=m;B[b]|=m;const st=rec();g[bi]=0;R[r]&=~m;C[c]&=~m;B[b]&=~m;if(st)return true;}
    return false;};
  rec();return n;}
function suFull(){const g=new Uint8Array(81),R=new Uint16Array(9),C=new Uint16Array(9),B=new Uint16Array(9);
  const rec=i=>{if(i===81)return true;const r=i/9|0,c=i%9,b=suBx(i);for(const v of suShuf([1,2,3,4,5,6,7,8,9])){const m=1<<v;if((R[r]|C[c]|B[b])&m)continue;g[i]=v;R[r]|=m;C[c]|=m;B[b]|=m;if(rec(i+1))return true;g[i]=0;R[r]&=~m;C[c]&=~m;B[b]&=~m;}return false;};
  rec(0);return g;}
/* 문제 만들기: 다 채운 판에서 마주 보는 두 칸씩 지우되, 답이 하나뿐일 때만 지워요 */
function suMake(lv){const s=suFull(),p=Uint8Array.from(s);let cl=81;
  for(const i of suShuf([...Array(41).keys()])){if(cl<=SU_CL[lv])break;const j=80-i,a=p[i],b=p[j];p[i]=0;p[j]=0;
    if(suCount(Uint8Array.from(p),2)!==1){p[i]=a;p[j]=b;}else cl-=i===j?1:2;}
  return{lv,p:p.join(''),s:s.join(''),u:'0'.repeat(81),n:Array(81).fill(0),t:0,mis:0,hn:0,h:[]};}
function suOpen(){const b=bgS();if(b.su&&!b.su.done)suPlay();else suPick();}
function suPick(){const b=bgS(),sw=b.sw||[0,0,0];const el=bgShell('🔢 스도쿠');
  el.innerHTML=`<div class="card"><h2>단계 고르기</h2>${SU_LV.map((n,i)=>`<button class="bglv" onclick="suNew(${i})"><b>${n}</b><span>${['처음 하는 사람도 술술','조금 생각해야 해요','머리를 꽤 써야 해요'][i]} · 다 풀면 🌰${SU_RW[i]}</span><span class="muted">${S.mg['bs'+i]?'최고 기록 '+bgT(S.mg['bs'+i])+' · ':''}푼 판 ${sw[i]||0}</span></button>`).join('')}</div>
  <div class="card"><h2>하는 법</h2><div class="bghelp">① 빈칸을 누르고 ② 아래 숫자를 눌러 넣어요.<br>· 가로줄, 세로줄, 굵은 선 네모(3×3) 안에 1~9가 한 번씩만 들어가요.<br>· 틀린 숫자는 빨갛게 보여요(실수 횟수만 세고 끝나지 않아요).<br>· ✏️ 메모를 켜면 작은 후보 숫자를 적어 둘 수 있어요.<br>· 중간에 나가도 그대로 저장돼요.</div></div>`;}
function suNew(lv){const el=$('bgb');if(el)el.innerHTML='<div class="card empty">문제를 만드는 중이에요…</div>';
  setTimeout(()=>{bgS().su=suMake(lv);SU.sel=-1;SU.memo=0;suQ('new');save();suPlay();},30);}
function suPlay(){const z=bgS().su;if(!z)return suPick();if(!SU.q)suQ('back');SU.idle=0;bgShell('🔢 스도쿠 · '+SU_LV[z.lv],()=>save());SU.sel=SU.sel>=0?SU.sel:-1;suDraw();
  clearInterval(SU.tm);SU.tm=setInterval(()=>{const q=bgS().su;if(!q||q.done||document.hidden||!$('bgo'))return;q.t++;const t=$('bgtm');if(t)t.textContent=bgT(q.t);if(q.t%15===0)save();
    if(++SU.idle===75||SU.idle===200){suQ('idle');suDraw();}},1000);}
function suDraw(){const z=bgS().su,el=$('bgb');if(!z||!el)return;const sel=SU.sel,sv=sel>=0?(z.p[sel]!=='0'?z.p[sel]:z.u[sel]):'0';
  const left=d=>9-[...Array(81).keys()].filter(i=>(z.p[i]===d)||(z.u[i]===d&&z.s[i]===d)).length;
  let g='';for(let bx=0;bx<9;bx++){g+='<div class="sub">';for(let k=0;k<9;k++){const i=((bx/3|0)*3+(k/3|0))*9+(bx%3)*3+k%3,gv=z.p[i]!=='0',v=gv?z.p[i]:z.u[i];
    let c='suc';if(gv)c+=' gv';else if(v!=='0')c+=z.s[i]===v?' me':' bad';
    if(i===sel)c+=' sel';else if(sel>=0&&(i/9|0)===(sel/9|0)||sel>=0&&i%9===sel%9||sel>=0&&suBx(i)===suBx(sel))c+=' hl';
    if(sv!=='0'&&v===sv&&i!==sel)c+=' same';
    const nt=v==='0'&&z.n[i]?`<span class="sunt">${[1,2,3,4,5,6,7,8,9].map(d=>`<i>${z.n[i]&(1<<d)?d:''}</i>`).join('')}</span>`:'';
    g+=`<button class="${c}" onclick="suTap(${i})" aria-label="${(i/9|0)+1}줄 ${i%9+1}칸 ${v!=='0'?v:'빈칸'}">${v!=='0'?v:nt}</button>`;}g+='</div>';}
  const qn=SU.qn;SU.qn=0;
  el.innerHTML=`${SU.q?`<div class="suq${qn?' new':''}">${bgIco('q_tori_f',28)}<div><b>토리</b> ${esc(SU.q)}</div></div>`:''}<div class="suinfo"><span>실수 <b>${z.mis}</b></span><span>힌트 <b>${z.hn}</b></span><span>남은 칸 <b>${[...z.u].filter((d,i)=>z.p[i]==='0'&&d!==z.s[i]).length}</b></span></div>
  <div class="sugrid">${g}</div>
  <div class="sutools"><button class="btn ghost sm" onclick="suUndo()" ${z.h.length?'':'disabled'}>↩ 되돌리기</button><button class="btn ghost sm" onclick="suErase()">지우기</button><button class="btn sm ${SU.memo?'':'ghost'}" onclick="SU.memo^=1;suDraw()">✏️ 메모 ${SU.memo?'켬':'끔'}</button><button class="btn ghost sm" onclick="suHint()">✨ 힌트</button></div>
  <div class="supad">${[1,2,3,4,5,6,7,8,9].map(d=>{const l=left(''+d);return `<button class="${l?'':'done'}${SU.memo?' memo':''}" onclick="suNum(${d})"><b>${d}</b><small>${l?l+'개':'✅'}</small></button>`;}).join('')}</div>
  <div class="muted" style="text-align:center;margin-top:8px">${sel<0?'빈칸을 먼저 눌러 주세요.':SU.memo?'메모 중: 숫자를 누르면 작은 후보가 적혀요.':'같은 숫자를 한 번 더 누르면 지워져요.'}</div>`;
  const t=$('bgtm');if(t)t.textContent=bgT(z.t);}
function suTap(i){SU.sel=SU.sel===i?-1:i;SU.idle=0;suDraw();}
function suPush(z){z.h.push([SU.sel,z.u,z.n.slice()]);if(z.h.length>60)z.h.shift();}
function suSet(z,i,d){z.u=z.u.slice(0,i)+d+z.u.slice(i+1);}
function suNum(d){const z=bgS().su,i=SU.sel;if(!z||z.done)return;if(i<0){toast('빈칸을 먼저 눌러 주세요');return;}if(z.p[i]!=='0'){toast('처음부터 있던 숫자는 바꿀 수 없어요');return;}
  const ds=''+d;suPush(z);SU.idle=0;
  if(SU.memo){if(z.u[i]!=='0'){z.h.pop();toast('숫자를 지우면 메모할 수 있어요');return;}z.n[i]^=1<<d;sfx('tick');}
  else if(z.u[i]===ds){suSet(z,i,'0');}
  else{suSet(z,i,ds);z.n[i]=0;if(z.s[i]!==ds){z.mis++;sfx('no');suQ('bad',z.mis>1);}else{sfx('coin');{const L=[...z.u].filter((x,j)=>z.p[j]==='0'&&x!==z.s[j]).length,tot=[...z.p].filter(x=>x==='0').length,dn=[...Array(81).keys()].filter(j=>z.p[j]===ds||z.u[j]===ds&&z.s[j]===ds).length;
      if(L===3)suQ('near');else if(L===Math.floor(tot/2))suQ('half');else if(dn===9&&L){SU.q='찍찍! 숫자 '+d+' 아홉 개를 다 찾았어요!';SU.qn=1;}else suQ('ok',1);}
    for(let j=0;j<81;j++)if((j/9|0)===(i/9|0)||j%9===i%9||suBx(j)===suBx(i))z.n[j]&=~(1<<d);}}
  save();suDraw();suChk();}
function suErase(){const z=bgS().su,i=SU.sel;if(!z||i<0||z.p[i]!=='0')return;if(z.u[i]==='0'&&!z.n[i])return;suPush(z);suSet(z,i,'0');z.n[i]=0;save();suDraw();}
function suUndo(){const z=bgS().su;if(!z||!z.h.length)return;const[s,u,n]=z.h.pop();z.u=u;z.n=n;SU.sel=s;save();suDraw();}
function suHint(){const z=bgS().su;if(!z||z.done)return;let i=SU.sel;
  if(i<0||z.p[i]!=='0'||z.u[i]===z.s[i]){const e=[...Array(81).keys()].filter(j=>z.p[j]==='0'&&z.u[j]!==z.s[j]);if(!e.length)return;i=e[Math.random()*e.length|0];}
  suPush(z);suSet(z,i,z.s[i]);z.n[i]=0;z.hn++;SU.sel=i;SU.idle=0;suQ('hint');sfx('coin');save();suDraw();suChk();}
function suChk(){const z=bgS().su;if(!z||z.done)return;for(let i=0;i<81;i++)if(z.p[i]==='0'&&z.u[i]!==z.s[i])return;
  z.done=1;clearInterval(SU.tm);SU.tm=0;const b=bgS();b.sw=b.sw||[0,0,0];b.sw[z.lv]=(b.sw[z.lv]||0)+1;
  const[m,nb]=mgRw(SU_RW[z.lv],'다 풀었어요!','bs'+z.lv,z.t,true);b.su=null;save();sfx('fan');suQ('done');const sq=document.querySelector('#bgb .suq div');if(sq)sq.innerHTML='<b>토리</b> '+esc(SU.q);SU.q='';
  const el=$('bgb');if(!el)return;SU.sel=-1;
  el.insertAdjacentHTML('afterbegin',`<div class="card legend bgdone"><h2>🎉 다 풀었어요!</h2><div>${SU_LV[z.lv]} · 걸린 시간 <b>${bgT(z.t)}</b>${nb?' · 🏆 최고 기록!':''}</div><div class="muted">실수 ${z.mis}번 · 힌트 ${z.hn}번</div><div style="margin:6px 0">${m}</div><div class="row"><button class="btn full" onclick="suPick()">한 판 더</button><button class="btn ghost full" onclick="bgClose()">닫기</button></div></div>`);
  el.querySelectorAll('.supad button,.sutools button,.suc').forEach(x=>x.disabled=true);window.scrollTo(0,0);$('bgo').scrollTop=0;}
addEventListener('keydown',e=>{const z=bgS().su;if(!$('bgo')||!z||z.done||!document.querySelector('#bgo .sugrid'))return;
  if(/^[1-9]$/.test(e.key)){suNum(+e.key);e.preventDefault();}
  else if(e.key==='Backspace'||e.key==='Delete'||e.key==='0'){suErase();e.preventDefault();}
  else if(e.key.startsWith('Arrow')){const d={ArrowLeft:-1,ArrowRight:1,ArrowUp:-9,ArrowDown:9}[e.key];SU.sel=SU.sel<0?40:(SU.sel+d+81)%81;suDraw();e.preventDefault();}});

/* ---------- 티츄 (거의 진짜 규칙) ----------
   자리: 0 진우(아래) → 1 타코(오른쪽) → 2 토리(위, 진우 팀) → 3 도치(왼쪽) 순서로 돌아요. 팀 = 자리%2 (0: 진우·토리, 1: 타코·도치)
   카드 번호: 0~51 보통 카드(무늬*13 + 숫자-2, 무늬 = 도토리·클로버·하트·물방울), 52 참새(1), 53 개, 54 봉황, 55 용
   간단히 한 것: 폭탄은 자기 차례에만 낼 수 있어요. 나머지(그랜드 티츄·티츄·카드 주고받기·참새 소원·개·봉황·용 주기·원투 200점)는 진짜 규칙 그대로 */
const TC_NM=['진우','타코','토리','도치'],TC_AV=['','q_octo','q_tori_f','q_dochi'],TC_GOAL=200,TC={to:0,sel:[],pk:[null,null,null],wish:0};
const TC_SU=['q_acorn','q_clover','q_heart','q_drop'],TC_SN=['도토리','클로버','하트','물방울'],TC_SC=['#8a5524','#3c7a2a','#c8392f','#2f69b8'];
const TC_SP={52:['q_sparrow','1','참새'],53:['q_puppy','개','개'],54:['q_phoenix','봉','봉황'],55:['q_tdragon','용','용']};
const tcR=id=>id<52?id%13+2:id===52?1:id===53?0:id===54?15:16;
const tcS=id=>id<52?id/13|0:-1;
const tcPt=id=>{if(id===55)return 25;if(id===54)return -25;if(id>51)return 0;const r=id%13+2;return r===5?5:r===10||r===13?10:0;};
const tcRN=r=>r===1?'1':r<=10?''+r:'JQKA'[r-11];
const tcSum=a=>a.reduce((s,id)=>s+tcPt(id),0);
const tcSort=a=>a.sort((x,y)=>tcR(x)-tcR(y)||x-y);
const tcCN={s:'한 장',p:'페어',t:'트리플',fh:'풀하우스',st:'스트레이트',pp:'연속 페어',b4:'폭탄(같은 숫자 4장)',sf:'폭탄(같은 무늬 스트레이트)',dog:'개'};
function tcLabel(c,k){if(c.t==='dog')return '개 → 우리 팀에게 차례';if(c.t==='s'){if(k&&k[0]>51)return TC_SP[k[0]][2];return tcRN(c.r);}
  return tcCN[c.t]+(c.t==='st'||c.t==='pp'||c.t==='sf'?' '+c.n+'장':'')+' · '+tcRN(c.r);}
/* 자리 말풍선용 짧은 이름 */
function tcShort(c,k){if(c.t==='dog')return '개';if(c.bomb)return '폭탄!';if(c.t==='s')return k[0]>51?TC_SP[k[0]][2]:tcRN(c.r);const r=tcRN(c.r);return {p:r+' 페어',t:r+' 트리플',fh:'풀하우스',st:'스트레이트',pp:'연속 페어'}[c.t];}
/* 숫자 묶음 판정(봉황은 nat=null로 들어옴: 폭탄이 될 수 없어요) */
function tcAna(rs,nat){rs=rs.slice().sort((a,b)=>a-b);const n=rs.length,cnt={};rs.forEach(r=>cnt[r]=(cnt[r]||0)+1);const ks=Object.keys(cnt).map(Number).sort((a,b)=>a-b),L=ks.length;
  const run=L===n&&ks[L-1]-ks[0]===n-1;
  if(rs[0]===1)return n>=5&&run?{t:'st',r:ks[L-1],n}:null;
  if(L===1){if(n===2)return{t:'p',r:rs[0],n};if(n===3)return{t:'t',r:rs[0],n};if(n===4&&nat)return{t:'b4',r:rs[0],n,bomb:1};return null;}
  if(n===5&&L===2&&(cnt[ks[0]]===3||cnt[ks[1]]===3))return{t:'fh',r:cnt[ks[0]]===3?ks[0]:ks[1],n};
  if(n>=5&&run){if(nat&&nat.every(id=>tcS(id)===tcS(nat[0])))return{t:'sf',r:ks[L-1],n,bomb:1};return{t:'st',r:ks[L-1],n};}
  if(n>=4&&n%2===0&&ks.every(k=>cnt[k]===2)&&ks[L-1]-ks[0]===L-1)return{t:'pp',r:ks[L-1],n};
  return null;}
/* 낸 카드로 될 수 있는 모든 뜻(봉황을 어느 숫자로 볼지) */
function tcCombos(k,cur){const n=k.length;if(!n)return[];
  if(n===1){const id=k[0];if(id===53)return[{t:'dog',r:0,n:1}];if(id===55)return[{t:'s',r:25,n:1}];
    if(id===54){if(cur&&cur.t==='s'&&cur.r>=25)return[];return[{t:'s',r:(cur&&cur.t==='s'?cur.r:1)+.5,n:1}];}
    return[{t:'s',r:tcR(id),n:1}];}
  if(k.includes(53)||k.includes(55))return[];
  const ph=k.includes(54),nat=k.filter(id=>id!==54),out=[];
  for(const pr of ph?[2,3,4,5,6,7,8,9,10,11,12,13,14]:[0]){const rs=nat.map(tcR);if(pr)rs.push(pr);const c=tcAna(rs,ph?null:nat);if(c&&!out.some(o=>o.t===c.t&&o.r===c.r))out.push(c);}
  return out;}
function tcBeat(c,cur){if(!cur)return true;if(c.t==='dog')return false;
  if(c.bomb){if(!cur.bomb)return true;if(c.t!==cur.t)return c.t==='sf';if(c.t==='sf'&&c.n!==cur.n)return c.n>cur.n;return c.r>cur.r;}
  if(cur.bomb)return false;return c.t===cur.t&&c.n===cur.n&&c.r>cur.r;}
/* 이 카드들로 지금 낼 수 있는 가장 센 뜻 */
function tcBest(k,cur){let b=null;for(const c of tcCombos(k,cur))if(tcBeat(c,cur)&&(!b||c.r>b.r))b=c;return b;}
/* 손패에서 지금 낼 수 있는 모든 수 (컴퓨터·소원 검사·추천에 씀) */
function tcGen(h,cur){const out=[],seen=new Set(),by={},P=h.includes(54);
  const add=k=>{const key=k.slice().sort((a,b)=>a-b).join(',');if(seen.has(key))return;seen.add(key);const c=tcBest(k,cur);if(c)out.push({k,c});};
  h.forEach(id=>{if(id<=52){const r=tcR(id);(by[r]=by[r]||[]).push(id);}});
  const want=t=>!cur||cur.t===t,R=[2,3,4,5,6,7,8,9,10,11,12,13,14],g=r=>by[r]||[];
  if(want('s'))h.forEach(id=>{if(id!==53)add([id]);});
  if(!cur&&h.includes(53))add([53]);
  R.forEach(r=>{const a=g(r);
    if(want('p')){if(a.length>=2)add(a.slice(0,2));else if(a.length===1&&P)add([a[0],54]);}
    if(want('t')){if(a.length>=3)add(a.slice(0,3));else if(a.length===2&&P)add([...a,54]);}});
  if(want('fh'))R.forEach(t=>R.forEach(p=>{if(p===t)return;const A=g(t),B=g(p);
    if(A.length>=3&&B.length>=2)add([...A.slice(0,3),...B.slice(0,2)]);else if(P&&A.length>=3&&B.length===1)add([...A.slice(0,3),B[0],54]);else if(P&&A.length===2&&B.length>=2)add([...A,54,...B.slice(0,2)]);}));
  if(want('st'))for(const L of cur?[cur.n]:[5,6,7,8,9,10,11,12,13,14])for(let top=L;top<=14;top++){const s0=top-L+1,k=[];let miss=0,m1=0;
    for(let r=s0;r<=top;r++){const a=r===1?(h.includes(52)?[52]:[]):g(r);if(a.length)k.push(a[0]);else{miss++;if(r===1)m1=1;}}
    if(!miss)add(k);else if(miss===1&&P&&!m1)add([...k,54]);}
  if(want('pp'))for(const m of cur?[cur.n/2]:[2,3,4,5,6,7])for(let top=m+1;top<=14;top++){const k=[];let miss=0;
    for(let r=top-m+1;r<=top;r++){const a=g(r);if(a.length>=2)k.push(a[0],a[1]);else if(a.length===1){k.push(a[0]);miss++;}else miss+=2;}
    if(!miss)add(k);else if(miss===1&&P)add([...k,54]);}
  R.forEach(r=>{const a=g(r).filter(id=>id<52);if(a.length===4)add(a);});
  for(let s=0;s<4;s++){const has=r=>h.includes(s*13+r-2);for(let L=5;L<=13;L++)for(let top=L+1;top<=14;top++){let ok=1;for(let r=top-L+1;r<=top;r++)if(!has(r)){ok=0;break;}if(ok){const k=[];for(let r=top-L+1;r<=top;r++)k.push(s*13+r-2);add(k);}}}
  return out;}
const tcAct=T=>[0,1,2,3].filter(i=>T.h[i].length);
const tcNx=(T,p)=>{for(let j=1;j<=4;j++){const q=(p+j)%4;if(T.h[q].length)return q;}return p;};
/* 소원: 지금 낼 수 있는 수 중 소원 숫자를 품은 것 */
function tcWishOpts(T,p){if(!T.wish)return[];return tcGen(T.h[p],T.cur?T.cur.c:null).filter(o=>o.k.some(id=>id<52&&tcR(id)===T.wish));}

/* --- 판 시작 --- */
function tcOpen(){const b=bgS();if(!b.tc||b.tc.ph==='over'){b.tc={sc:[0,0],rn:0};tcRound();}tcShow();}
function tcRound(){const T=bgS().tc,d=suShuf([...Array(56).keys()]);T.rn=(T.rn||0)+1;
  T.h=[0,1,2,3].map(p=>tcSort(d.slice(p*8,p*8+8)));T.rest=[0,1,2,3].map(p=>d.slice(32+p*6,38+p*6));
  T.calls=[0,0,0,0];T.won=[[],[],[],[]];T.out=[];T.cur=null;T.tr=[];T.wish=0;T.last=['','','',''];T.passed=[];T.played=[0,0,0,0];T.recv=null;T.ph='gt';T.turn=0;T.log=[];T.rd=null;T.q=null;T.qs=null;T.na=0;T.teamPlan='auto';T.teamReply='찍찍! 이번 판도 같이해요. 진우가 원하는 작전을 알려 주세요!';
  for(let p=1;p<4;p++)if(tcStr(T.h[p])>=10)T.calls[p]=2;{const g=[1,2,3].find(p=>T.calls[p]===2);if(g)tcQ('grand',g);}TC.sel=[];TC.pk=[null,null,null];save();}
/* 손패 힘(컴퓨터가 티츄를 부를지 정할 때) */
function tcStr(h){let s=0;const by={};h.forEach(id=>{const r=tcR(id);by[r]=(by[r]||0)+1;});
  h.forEach(id=>{if(id===55)s+=3.5;else if(id===54)s+=3;else if(id<52){const r=id%13+2;if(r===14)s+=2;else if(r===13)s+=.8;}});
  Object.entries(by).forEach(([r,n])=>{if(n===4&&+r<15)s+=5;});if(h.includes(53))s-=1;return s;}
function tcGrand(yes){const T=bgS().tc;if(T.ph!=='gt')return;T.calls[0]=yes?2:0;if(yes){sfx('fan');tcQ('jTichu',2);}
  for(let p=0;p<4;p++)T.h[p]=tcSort(T.h[p].concat(T.rest[p]));T.rest=null;T.ph='pass';TC.pk=[null,null,null];TC.sel=[];save();tcDraw();}
/* 컴퓨터가 줄 카드 [오른쪽(다음 사람), 짝꿍, 왼쪽] — 짝꿍에겐 좋은 카드, 상대에겐 낮은 카드(개는 상대에게) */
function tcAIGive(h){const s=tcSort(h.slice()),hi=s.filter(id=>id!==54&&id!==52).reverse(),bomb=new Set();const by={};s.forEach(id=>{if(id<52){const r=tcR(id);(by[r]=by[r]||[]).push(id);}});Object.values(by).forEach(a=>{if(a.length===4)a.forEach(id=>bomb.add(id));});
  const mate=hi.find(id=>!bomb.has(id))??hi[0];const lows=s.filter(id=>id!==mate&&id!==52&&id!==54&&id!==55&&!bomb.has(id));
  const dog=lows.includes(53)?53:null,rest=lows.filter(id=>id!==53);const a=dog!=null?dog:rest[0],b=dog!=null?rest[0]:rest[1];
  return[a??s.find(id=>id!==mate),mate,b??s.find(id=>id!==mate&&id!==a)];}
function tcPassGo(){const T=bgS().tc;if(T.ph!=='pass')return;if(TC.pk.some(x=>x==null)){toast('세 장을 모두 골라 주세요');return;}
  const give=[[TC.pk[1],TC.pk[0],TC.pk[2]]];/* 진우: [오른쪽 타코, 짝꿍 토리, 왼쪽 도치] */
  for(let p=1;p<4;p++)give[p]=tcAIGive(T.h[p]);
  const got=[[],[],[],[]];for(let p=0;p<4;p++){give[p].forEach((id,j)=>{const to=(p+1+j)%4;got[to].push([p,id]);});T.h[p]=T.h[p].filter(id=>!give[p].includes(id));}
  for(let p=0;p<4;p++)T.h[p]=tcSort(T.h[p].concat(got[p].map(x=>x[1])));T.recv=got[0];
  let tq=0;for(let p=1;p<4;p++)if(!T.calls[p]&&!T.calls[(p+2)%4]&&tcStr(T.h[p])>=8.5){T.calls[p]=1;tq=p;}
  if(tq)tcQ('tichu',tq);else if(!T.q||T.calls.every(x=>x!==2))tcQ('start');
  T.ph='play';T.turn=[0,1,2,3].find(p=>T.h[p].includes(52));T.log=[TC_NM[T.turn]+'(이)가 참새를 가져서 먼저 시작해요'];TC.sel=[];save();tcDraw();tcNext();}
function tcTichu(){const T=bgS().tc;if(T.played[0]||T.calls[0])return;askOk('티츄! 를 부를까요? 진우가 1등으로 카드를 다 내면 +100점, 못 하면 -100점이에요.',()=>{T.calls[0]=1;sfx('fan');tcSay(0,'티츄!');tcQ('jTichu',Math.random()<.6?2:Math.random()<.5?3:1);save();tcDraw();});}
function tcSay(p,t){const T=bgS().tc;T.last[p]=t;}
/* 캐릭터 대사(자리 1 타코 '~다코', 2 토리 '찍찍!'+해요체, 3 도치 허세 승부사 '가시 대장'). T.q=[자리,말,그때 행동 수] → 표 아래 말 칸 .tcq */
const TC_LN={
 start:{1:['오늘은 지지 않는다코~!','카드 냄새가 좋다코!','타코 팀이 이긴다코!'],2:['찍찍! 진우, 우리 팀 화이팅이에요!','찍찍찍~ ♪ 같이 이겨요!','찍찍! 토리가 진우 뒤를 지킬게요!'],3:['이 판은 내가 접수한다치!','가시 대장 등장이다치! 다들 긴장해라치!','후후, 오늘 카드 좋다치!']},
 tichu:{1:['티츄다코! 다 내 버릴 거다코!'],2:['찍찍! 티츄! 토리가 1등 할게요!'],3:['티츄다치! 1등은 당연히 이 몸이다치!','티츄다치! 가시 대장은 도망 안 간다치!']},
 grand:{1:['그랜드 티츄다코~! 다리가 떨린다코…'],2:['찍찍! 그랜드 티츄! 볼주머니에 용기 가득이에요!'],3:['그랜드 티츄다치! 이 패면 눈 감고도 이긴다치!']},
 bomb:{1:['폭탄이다코! 쾅!'],2:['찍찍! 폭탄이에요! 비켜 주세요~'],3:['봤냐치! 가시 폭탄이다치!']},
 dragon:{1:['용이다코! 아무도 못 이긴다코~'],2:['찍찍! 용이에요! 토리 볼이 빵빵해졌어요'],3:['용은 원래 대장 거다치!']},
 phoenix:{1:['봉황이다코~ 훨훨!'],2:['찍찍! 봉황 날아가요~'],3:['봉황도 대장 편이다치!']},
 dog:{1:['도치한테 넘긴다코~'],2:['찍찍! 진우 차례로 넘겨요!'],3:['타코, 맡긴다치! 실수하지 마라치!']},
 wish:{1:['소원 빌었다코~ 꼭 내라코!'],2:['찍찍! 소원 빌었어요!'],3:['소원이다치! 이 숫자 내 봐라치!']},
 play:{1:['자, 간다코!','쭉쭉 나간다코~','이 정도는 쉽다코!','받아 보라코!'],2:['찍찍! 이거 어때요?','찍찍찍~ ♪ 토리도 낼게요!','찍찍! 진우, 토리 잘했어요?'],3:['어때, 놀랐냐치?','이 정도는 기본이다치!','후후, 아직 반도 안 보여 줬다치!']},
 pass:{1:['패스다코~','음… 이번엔 쉰다코'],2:['찍찍… 패스할게요','찍찍, 진우가 해 줄 거죠?'],3:['흥, 일부러 봐준 거다치','대장은 기다릴 줄도 안다치!']},
 take:{1:['점수 냠냠이다코~'],2:['찍찍! 점수 볼주머니에 쏙!'],3:['점수는 대장이 챙긴다치!']},
 out1:{1:['다 냈다코~! 1등이다코!'],2:['찍찍! 토리가 1등이에요! 진우 봤어요?'],3:['봐라치, 이 몸이 1등이다치!']},
 jTichu:{2:['찍찍! 진우 티츄! 토리가 도와줄게요!'],3:['흥, 과연 성공하냐치?'],1:['진우가 티츄다코?! 긴장된다코…']},
 jBomb:{2:['찍찍! 진우 최고예요!!'],1:['으악, 폭탄이다코!'],3:['뭐, 뭐냐치! 가시가 떨린다치…']},
 jDragon:{2:['찍찍! 용이다! 진우 멋져요!'],3:['칫, 용이 거기 있었냐치…'],1:['용이었다코…?!']},
 jOut1:{2:['찍찍찍~ ♪ 진우가 1등이에요!'],3:['오늘은 가시 컨디션이 안 좋다치…'],1:['진우 빠르다코…']},
 rWin:{2:['찍찍! 이번 판은 우리 팀이 앞섰어요!'],3:['다음 판은 다르다치! 진짜다치!']},
 rLose:{2:['찍찍… 괜찮아요, 다음 판이 있어요!'],3:['봤냐치! 가시 대장 실력이다치!']},
 r12us:{2:['찍찍찍! 원투예요! 진우랑 토리 최고 팀!']},r12op:{3:['원투다치! 대장님이라 불러라치!']},
 gWin:{2:['찍찍찍~ ♪ 우리가 이겼어요! 진우 최고!'],3:['오늘은 가시 컨디션이 안 좋다치… 다음엔 진짜 안 봐준다치!'],1:['졌다코… 그래도 재밌었다코~']},
 gLose:{2:['찍찍… 아쉬워요. 그래도 진우랑 해서 즐거웠어요!'],3:['역시 가시 대장이다치! 언제든 덤벼라치!'],1:['이겼다코~! 또 하자코!']}};
const tcLn=(ev,p)=>{const a=(TC_LN[ev]||{})[p];return a?a[Math.random()*a.length|0]:'';};
/* ev 대사를 p가 말해요(p 없으면 대사가 있는 사람 중 아무나). low=1이면 가끔(pr 확률)만, 방금 한 말은 덮지 않아요 */
function tcQ(ev,p,low,pr){const T=bgS().tc;T.na=(T.na||0)+1;if(low&&(Math.random()>(pr||.25)||T.q&&T.na-T.q[2]<3))return;
  const ps=Object.keys(TC_LN[ev]||{}).map(Number);if(p==null){if(!ps.length)return;p=ps[Math.random()*ps.length|0];}const t=tcLn(ev,p);if(t)T.q=[p,t,T.na];}

/* --- 차례 진행 --- */
function tcNext(){clearTimeout(TC.to);const T=bgS().tc;if(!T||T.ph!=='play'||!$('bgo'))return;if(T.turn!==0)TC.to=setTimeout(tcAITurn,820);}
function tcAITurn(){const T=bgS().tc;if(!T||T.ph!=='play'||T.turn===0)return;const p=T.turn;let o=tcAI(T,p);if(!o&&!T.cur){const k=[tcSort(T.h[p].slice()).find(id=>id!==53)??T.h[p][0]];o={k};}
  if(p===2)tcTeamExplain(T,o);if(o){let w=0;if(o.k.includes(52))w=tcAIWish(T,p);tcPlay(p,o.k,w);}else tcPass(p);}
function tcAIWish(T,p){const mine=new Set(T.h[p].map(tcR));const c=[14,13,12,11,10].filter(r=>!mine.has(r));return c.length?c[Math.random()*c.length|0]:0;}
function tcAI(T,p){const h=T.h[p],cur=T.cur?T.cur.c:null,mate=(p+2)%4;let opts=tcGen(h,cur);
  const wo=tcWishOpts(T,p);if(wo.length)opts=wo;if(!opts.length)return null;
  const fin=opts.find(o=>o.k.length===h.length);const team=p===2,plan=team?tcPlanOf(T):'auto',support=team&&(plan==='lead'||plan==='feed');if(fin&&!(support&&T.h[0].length&&!wo.length&&T.cur))return fin;
  const by={};h.forEach(id=>{if(id<52){const r=tcR(id);(by[r]=by[r]||[]).push(id);}});const bomb=new Set();Object.values(by).forEach(a=>{if(a.length===4)a.forEach(id=>bomb.add(id));});
  const cost=o=>{let x=o.c.r;if(o.c.bomb)x+=40;if(o.k.includes(54))x+=12;if(o.k.includes(55))x+=10;if(!o.c.bomb&&o.k.some(id=>bomb.has(id)))x+=20;if(o.c.t==='s'&&o.k[0]<52&&(by[tcR(o.k[0])]||[]).length>1)x+=4;return x;};
  if(!cur){if(wo.length)return wo.sort((a,b)=>cost(a)-cost(b))[0];
    if(h.includes(53)&&T.h[mate].length&&(T.calls[mate]||T.h[mate].length<h.length-2||support))return{k:[53],c:{t:'dog',r:0,n:1}};
    const L=opts.filter(o=>!o.c.bomb&&o.c.t!=='dog');if(!L.length)return opts[0];
    const feed=team&&support&&T.h[0].length;const pref=feed?T.h[0].length<=2?'s':null:null;return L.map(o=>[o,o.k.length*(plan==='mate'?4:2.4)-cost(o)*.9+(pref&&o.c.t===pref?20:0)]).sort((a,b)=>b[1]-a[1])[0][0];}
  const hold=T.cur.by;if(hold===mate&&!wo.length)return null;
  const tp=tcSum(T.tr),urg=team&&plan==='block'&&hold%2===1||T.calls[hold]||T.h[hold].length<=3||tp>=20||T.calls[(hold+2)%4]&&T.h[(hold+2)%4].length<=4;
  let cand=opts.filter(o=>!o.c.bomb&&!(o.k.includes(54)&&!urg)&&!(o.k.includes(55)&&!urg&&h.length>4));
  if(!cand.length&&(urg||wo.length))cand=opts;if(!cand.length)return null;
  cand.sort((a,b)=>cost(a)-cost(b));const o=cand[0];
  if(!wo.length&&!urg&&o.c.r>=14&&h.length>7&&tp<10&&Math.random()<.5)return null;
  return o;}
function tcPlay(p,k,w){const T=bgS().tc,c=tcBest(k,T.cur?T.cur.c:null);if(!c)return;
  T.h[p]=T.h[p].filter(id=>!k.includes(id));T.tr.push(...k);T.played[p]=1;
  if(T.wish&&k.some(id=>id<52&&tcR(id)===T.wish)){T.wish=0;T.log.unshift('소원이 이루어졌어요!');}
  if(k.includes(52)&&w){T.wish=w;T.log.unshift(TC_NM[p]+'의 소원: '+tcRN(w)+' (가진 사람은 낼 수 있으면 꼭 내야 해요)');}
  if(c.t!=='dog'){T.cur={c,by:p,k:tcSort(k.slice())};T.passed=[];}
  T.last=T.last.map((x,i)=>i===p?tcShort(c,k):x==='패스'?'':x);
  T.log.unshift(TC_NM[p]+': '+tcLabel(c,k));T.log=T.log.slice(0,6);
  sfx(c.bomb?'fan':'coin');
  if(p){const ev=c.bomb?'bomb':c.t==='dog'?'dog':c.t==='s'&&k[0]===55?'dragon':k.includes(52)&&w?'wish':c.t==='s'&&k[0]===54?'phoenix':'';if(ev)tcQ(ev,p);else tcQ('play',p,1);}
  else if(c.bomb)tcQ('jBomb');else if(c.t==='s'&&k[0]===55)tcQ('jDragon');
  if(!T.h[p].length){T.out.push(p);if(T.out.length===1)tcQ(p?'out1':'jOut1',p||null);T.log.unshift(TC_NM[p]+(T.out.length===1?'(이)가 1등으로 다 냈어요!':'(이)가 다 냈어요'));if(tcEndChk(T))return;}
  if(c.t==='dog'){T.won[p].push(...T.tr);T.cur=null;T.tr=[];T.passed=[];T.last=['','','',''];const m=(p+2)%4;T.turn=T.h[m].length?m:tcNx(T,m);}
  else T.turn=tcNx(T,p);
  save();tcDraw();tcNext();}
function tcPass(p){const T=bgS().tc;T.passed.push(p);T.last[p]='패스';if(p)tcQ('pass',p,1,.2);
  const act=tcAct(T),need=act.filter(i=>i!==T.cur.by);
  if(need.every(i=>T.passed.includes(i))){tcTake(T);return;}
  T.turn=tcNx(T,p);save();tcDraw();tcNext();}
/* 한 바퀴 끝: 마지막에 낸 사람이 가져가요. 용으로 이긴 판은 상대에게 줘야 해요 */
function tcTake(T,quiet){const w=T.cur.by;
  if(T.cur.c.t==='s'&&T.cur.k[0]===55){
    if(w===0&&!quiet){T.ph='dragon';save();tcDraw();return;}
    const to=tcDragonTo(T,w);T.won[to].push(...T.tr);T.log.unshift(TC_NM[w]+'(이)가 용으로 이긴 카드를 '+TC_NM[to]+'에게 줬어요');}
  else{if(w&&!quiet&&tcSum(T.tr)>=20)tcQ('take',w,1,.6);T.won[w].push(...T.tr);T.log.unshift(TC_NM[w]+'(이)가 이번 판 카드를 가져가요'+(tcSum(T.tr)?' ('+tcSum(T.tr)+'점)':''));}
  T.tr=[];T.cur=null;T.passed=[];T.last=['','','',''];if(quiet)return;
  T.turn=T.h[w].length?w:tcNx(T,w);save();tcDraw();tcNext();}
function tcDragonTo(T,w){const a=(w+1)%4,b=(w+3)%4;return T.h[a].length>=T.h[b].length?a:b;}
function tcDragonGive(to){const T=bgS().tc;if(T.ph!=='dragon')return;T.won[to].push(...T.tr);T.log.unshift('진우가 용으로 이긴 카드를 '+TC_NM[to]+'에게 줬어요');
  T.tr=[];T.cur=null;T.passed=[];T.last=['','','',''];T.ph='play';T.turn=T.h[0].length?0:tcNx(T,0);save();tcDraw();tcNext();}
/* 판 끝: 원투(같은 팀 1·2등) 또는 한 명만 남았을 때 */
function tcEndChk(T){const act=tcAct(T),dbl=T.out.length===2&&T.out[0]%2===T.out[1]%2;if(!dbl&&act.length>1)return false;
  if(T.tr.length&&T.cur)tcTake(T,1);
  const pts=[0,0],det=[];
  if(dbl){pts[T.out[0]%2]+=200;det.push((T.out[0]%2?'상대 팀':'우리 팀')+' 원투! +200');}
  else{const last=act[0];const hp=tcSum(T.h[last]);pts[(last+1)%2]+=hp;T.won[T.out[0]].push(...T.won[last]);T.won[last]=[];
    for(let p=0;p<4;p++)pts[p%2]+=tcSum(T.won[p]);det.push('카드 점수: 우리 '+(pts[0])+' · 상대 '+(pts[1]));if(hp)det.push(TC_NM[last]+'의 남은 카드 '+hp+'점은 '+(last%2?'우리 팀':'상대 팀')+'에게');}
  for(let p=0;p<4;p++)if(T.calls[p]){const v=T.calls[p]===2?200:100,ok=T.out[0]===p;pts[p%2]+=ok?v:-v;det.push(TC_NM[p]+' '+(T.calls[p]===2?'그랜드 티츄':'티츄')+(ok?' 성공 +':' 실패 -')+v);}
  T.sc[0]+=pts[0];T.sc[1]+=pts[1];T.rd={pts,det,out:T.out.slice()};T.ph='end';
  const fin=(T.sc[0]>=TC_GOAL||T.sc[1]>=TC_GOAL)&&T.sc[0]!==T.sc[1];
  {const ev=fin?(T.sc[0]>T.sc[1]?'gWin':'gLose'):dbl?(T.out[0]%2?'r12op':'r12us'):pts[0]>=pts[1]?'rWin':'rLose';T.qs=[2,3,1].map(p=>[p,tcLn(ev,p)]).filter(x=>x[1]);}
  if(fin){T.ph='over';const b=bgS(),win=T.sc[0]>T.sc[1];if(win)b.tw=(b.tw||0)+1;else b.tl=(b.tl||0)+1;
    const[m]=win?mgRw(2,'','btw',b.tw):['아쉬워요! 다음엔 꼭 이겨요'];T.rw=m;sfx(win?'fan':'no');}
  else sfx('fan');
  save();tcDraw();return true;}

/* --- 진우 차례 --- */
function tcTap(id){const T=bgS().tc;if(T.ph==='pass'){const j=TC.pk.indexOf(id);if(j>=0)TC.pk[j]=null;else{const e=TC.pk.indexOf(null);if(e<0){toast('세 장을 다 골랐어요. 바꾸려면 위 칸을 눌러요');return;}TC.pk[e]=id;}tcDraw();return;}
  const i=TC.sel.indexOf(id);if(i>=0)TC.sel.splice(i,1);else TC.sel.push(id);tcDraw();}
function tcGo(){const T=bgS().tc;if(T.ph!=='play'||T.turn!==0)return;const k=TC.sel.slice();if(!k.length){toast('낼 카드를 눌러 골라 주세요');return;}
  const cur=T.cur?T.cur.c:null,c=tcBest(k,cur);
  if(!c){toast(tcCombos(k,cur).length?'지금 테이블보다 세야 해요':'함께 낼 수 없는 카드예요');return;}
  const wo=tcWishOpts(T,0);if(wo.length&&!k.some(id=>id<52&&tcR(id)===T.wish)){toast('소원 숫자 '+tcRN(T.wish)+'를 꼭 내야 해요!');return;}
  TC.sel=[];if(k.includes(52)){tcWishAsk(k);return;}tcPlay(0,k,0);}
function tcWishAsk(k){TC.wk=k;const el=$('tcwish');if(!el)return;el.innerHTML=`<div class="card"><h2>참새의 소원</h2><div class="muted">다른 사람이 꼭 내야 할 숫자를 골라요.</div><div class="tcwr">${[2,3,4,5,6,7,8,9,10,11,12,13,14].map(r=>`<button class="btn sm" onclick="tcWishPick(${r})">${tcRN(r)}</button>`).join('')}</div><button class="btn ghost full" onclick="tcWishPick(0)">소원 없이 내기</button></div>`;el.scrollIntoView({block:'center'});}
function tcWishPick(r){const k=TC.wk;TC.wk=null;if(k)tcPlay(0,k,r);}
function tcPassMe(){const T=bgS().tc;if(T.ph!=='play'||T.turn!==0)return;if(!T.cur){toast('내가 시작할 차례라 패스할 수 없어요');return;}
  if(tcWishOpts(T,0).length){toast('소원 숫자 '+tcRN(T.wish)+'를 낼 수 있어서 꼭 내야 해요!');return;}TC.sel=[];tcPass(0);}
function tcHint(){const T=bgS().tc;if(T.ph==='pass'){const g=tcAIGive(T.h[0]);TC.pk=[g[1],g[0],g[2]];tcDraw();return;}if(T.turn!==0)return;const o=tcAI(T,0);if(!o){toast(T.cur?'패스해도 괜찮아 보여요':'');TC.sel=[];}else TC.sel=o.k.slice();tcDraw();}

/* --- 그리기 --- */
function tcCard(id,cls,on){const sp=TC_SP[id],c=sp?'#4a3423':TC_SC[tcS(id)];
  return `<button class="tcd ${cls||''}${sp?' sp':''}" ${on?`onclick="${on}"`:'tabindex="-1"'} aria-label="${sp?sp[2]:TC_SN[tcS(id)]+' '+tcRN(tcR(id))}"><span class="rk" style="color:${c}">${sp?sp[1]:tcRN(tcR(id))}</span>${cls&&cls.includes('sm')?'':bgIco(sp?sp[0]:TC_SU[tcS(id)],12,'mini')}${bgIco(sp?sp[0]:TC_SU[tcS(id)],cls&&cls.includes('sm')?16:24)}</button>`;}
function tcShow(){bgShell('🎴 티츄',()=>save());tcDraw();if(bgS().tc.ph==='play')tcNext();}
function tcSeat(T,p){const n=T.h[p].length,cl=T.calls[p],tn=T.ph==='play'&&T.turn===p,o=T.out.indexOf(p);
  return `<div class="tcp${tn?' turn':''}${p%2?' op':' my'}">${p?bgIco(TC_AV[p],30):''}<div><b>${TC_NM[p]}</b>${cl?`<span class="tcb">${cl===2?'그랜드 티츄':'티츄'}</span>`:''}<div class="muted">${o>=0?(o+1)+'등!':n+'장'}</div></div>${T.last[p]?`<div class="tcsay">${esc(T.last[p])}</div>`:''}</div>`;}
function tcDraw(){const T=bgS().tc,el=$('bgb');if(!T||!el)return;const my=T.h[0];
  const head=`<div class="tcsc"><span>우리 팀 <b>${T.sc[0]}</b></span><span class="muted">${T.rn}판째<br>목표 ${TC_GOAL}점</span><span>상대 팀 <b>${T.sc[1]}</b></span></div>`;
  if(T.ph==='end'||T.ph==='over'){const r=T.rd,win=T.sc[0]>T.sc[1];
    el.innerHTML=head+`<div class="card${T.ph==='over'&&win?' legend':''}"><h2>${T.ph==='over'?(win?'🏆 우리 팀이 이겼어요!':'타코 팀이 이겼어요'):'🎴 '+T.rn+'번째 판 끝'}</h2>
    <div>이번 판: 우리 팀 <b>${r.pts[0]>=0?'+':''}${r.pts[0]}</b> · 상대 팀 <b>${r.pts[1]>=0?'+':''}${r.pts[1]}</b></div><div class="muted">나간 순서: ${r.out.map((p,i)=>(i+1)+'. '+TC_NM[p]).join(' · ')}</div>
    <ul class="tcdet">${r.det.map(d=>`<li>${esc(d)}</li>`).join('')}</ul>
    ${(T.qs||[]).map(([p,t])=>`<div class="tcq${p%2?' op':' my'}">${bgIco(TC_AV[p],28)}<div><b>${TC_NM[p]}</b> ${esc(t)}</div></div>`).join('')}
    ${T.ph==='over'?`<div style="margin:6px 0">${T.rw||''}</div><div class="row"><button class="btn full" onclick="bgS().tc=null;tcOpen()">새 게임</button><button class="btn ghost full" onclick="bgClose()">닫기</button></div>`:`<button class="btn full" onclick="tcRound();tcDraw()">다음 판</button>`}</div>`;return;}
  const seats=`<div class="tct"><div class="tcl">${tcSeat(T,3)}</div><div class="tcm">${tcSeat(T,2)}
    <div class="tctab">${T.cur?`<div class="tcby">${TC_NM[T.cur.by]}: ${esc(tcLabel(T.cur.c,T.cur.k))}</div><div class="tccur">${T.cur.k.map(id=>tcCard(id,'sm')).join('')}</div>`:`<div class="tcby">${T.ph==='play'?(T.turn===0?'진우가 시작할 차례예요':TC_NM[T.turn]+'(이)가 시작해요'):T.ph==='gt'?'카드 8장을 받았어요':'카드 주고받기'}</div>`}
    ${T.wish?`<div class="tcwish">참새의 소원: <b>${tcRN(T.wish)}</b></div>`:''}${T.tr.length?`<div class="muted">이번 바퀴 점수 ${tcSum(T.tr)}</div>`:''}</div></div>
    <div class="tcr">${tcSeat(T,1)}</div></div>`;
  const q=T.q,qn=q&&q[2]!==TC.qn;if(q)TC.qn=q[2];const qb=q?`<div class="tcq${q[0]%2?' op':' my'}${qn?' new':''}">${bgIco(TC_AV[q[0]],28)}<div><b>${TC_NM[q[0]]}</b> ${esc(q[1])}</div></div>`:'';
  let ctl='',info='';
  if(T.ph==='gt'){ctl=`<div class="card"><h2>그랜드 티츄?</h2><div class="muted">8장만 보고 '내가 1등으로 다 낸다'에 걸어요. 성공 +200, 실패 -200. 보통은 안 불러요.</div><div class="row" style="margin-top:6px"><button class="btn ghost full" onclick="tcGrand(0)">안 불러요 (6장 더 받기)</button><button class="btn pink full" onclick="tcGrand(1)">그랜드 티츄!</button></div></div>`;}
  else if(T.ph==='pass'){const nm=['토리(우리 팀)','타코','도치'];ctl=`<div class="card"><h2>카드 주고받기</h2><div class="muted">세 사람에게 한 장씩 줘요. 카드를 누르면 차례로 들어가요. 토리에겐 좋은 카드, 상대에겐 낮은 카드!</div>
    <div class="tcpk">${TC.pk.map((id,j)=>`<div><div class="muted">${nm[j]}</div>${id!=null?tcCard(id,'',`tcTap(${id})`):'<div class="tcd empty"></div>'}</div>`).join('')}</div>
    <div class="row"><button class="btn ghost full" onclick="tcHint()">추천</button><button class="btn full" onclick="tcPassGo()">주기</button></div></div>`;}
  else if(T.ph==='dragon'){ctl=`<div class="card legend"><h2>용으로 이겼어요!</h2><div>용으로 이긴 카드(${tcSum(T.tr)}점)는 상대 팀 한 명에게 줘야 해요.</div><div class="row" style="margin-top:6px"><button class="btn full" onclick="tcDragonGive(1)">타코에게 (${T.h[1].length}장)</button><button class="btn full" onclick="tcDragonGive(3)">도치에게 (${T.h[3].length}장)</button></div></div>`;}
  else if(T.ph==='play'){const mine=T.turn===0&&my.length;const c=TC.sel.length?tcBest(TC.sel,T.cur?T.cur.c:null):null;
    info=mine?(TC.sel.length?(c?'낼 수 있어요: '+tcLabel(c,TC.sel):'이 카드로는 낼 수 없어요'):T.cur?'더 센 카드를 고르거나 패스해요':'아무 조합이나 내서 시작해요'):!my.length?'진우는 다 냈어요! 기다리는 중…':TC_NM[T.turn]+' 생각 중…';
    ctl=`<div class="tcinfo${mine?' on':''}">${esc(info)}</div><div class="row tcbtn"><button class="btn ghost sm" onclick="tcPassMe()" ${mine&&T.cur?'':'disabled'}>패스</button><button class="btn ghost sm" onclick="tcHint()" ${mine?'':'disabled'}>추천</button><button class="btn sm" onclick="tcGo()" ${mine&&c?'':'disabled'}>내기</button>${!T.played[0]&&!T.calls[0]?'<button class="btn pink sm" onclick="tcTichu()">티츄!</button>':''}</div>`;}
  const n=my.length,ov=n>1?Math.min(0,Math.floor((Math.min((matchMedia('(orientation:landscape) and (max-height:520px)').matches?innerWidth*.52:innerWidth)-28,456)-48)/(n-1))-48):0;
  const hand=`<div class="tchand" style="--ov:${ov}px">${my.map(id=>tcCard(id,(TC.sel.includes(id)?'on':'')+(TC.pk.includes(id)&&T.ph==='pass'?' gone':''),T.ph==='pass'||T.ph==='play'?`tcTap(${id})`:'')).join('')}</div>`;
  const recv=T.recv&&!T.played[0]&&T.ph==='play'?`<div class="muted" style="text-align:center">받은 카드: ${T.recv.map(([f,id])=>TC_NM[f]+'→'+(TC_SP[id]?TC_SP[id][2]:tcRN(tcR(id)))).join(' · ')}</div>`:'';
  el.innerHTML=`<div class="tcL">`+head+seats+qb+`</div><div class="tcR"><div id="tcwish"></div>`+hand+recv+ctl+`<div class="tclog">${T.log.slice(0,3).map(x=>`<div>${esc(x)}</div>`).join('')}</div>${tcTeamHtml(T)}<div style="text-align:center;margin-top:8px"><button class="btn ghost sm" onclick="tcRules()">규칙 보기</button></div></div>`;}
function tcRules(){modal(`<h3>🎴 티츄 규칙 (짧게)</h3><div class="bghelp">· 진우·토리가 한 팀, 타코·도치가 한 팀. 손에 든 카드를 먼저 다 내는 게 목표예요.<br>
· 앞사람보다 <b>같은 모양으로 더 센</b> 카드를 내요: 한 장, 페어, 트리플, 풀하우스(3+2), 스트레이트(5장 이상 이어진 숫자), 연속 페어(이어진 페어 2쌍 이상). 못 내거나 안 내면 패스.<br>
· 모두 패스하면 마지막에 낸 사람이 카드를 가져가고 새로 시작해요.<br>
· 점수: 5는 5점, 10·K는 10점, 용 25점, 봉황 -25점.<br>
· <b>참새(1)</b>: 가진 사람이 먼저 시작. 낼 때 소원 숫자를 부르면, 그 숫자를 낼 수 있는 사람은 꼭 내야 해요.<br>
· <b>개</b>: 처음에만 낼 수 있고, 차례를 짝꿍에게 넘겨요.<br>
· <b>봉황</b>: 아무 숫자 대신 쓸 수 있어요. 한 장으로 내면 앞 카드보다 0.5 높아요(용은 못 이겨요).<br>
· <b>용</b>: 가장 센 한 장. 용으로 이긴 카드는 상대 한 명에게 줘야 해요.<br>
· <b>폭탄</b>(같은 숫자 4장, 같은 무늬 스트레이트): 무엇이든 이겨요. 이 앱에선 자기 차례에만 낼 수 있어요.<br>
· <b>티츄!</b> 첫 카드를 내기 전에 부르면 1등일 때 +100, 아니면 -100. 8장만 보고 부르는 <b>그랜드 티츄</b>는 ±200.<br>
· <b>팀 작전</b>: 이 앱의 협력 기능이에요. 진우가 작전을 고르면 토리가 가능한 카드 안에서 실제 플레이에 반영해요. 참새 소원은 반드시 따르고, 낼 수 있는 카드가 없으면 요청을 실행할 수 없어요. 손패 내용은 보여 주지 않아요.<br>
· 같은 팀이 1·2등으로 다 내면 <b>원투</b>! 카드 점수 대신 +200.<br>
· 꼴찌의 남은 카드 점수는 상대 팀에게, 꼴찌가 가져간 카드는 1등에게 가요. ${TC_GOAL}점을 먼저 넘긴 팀이 이겨요.</div><button class="btn full" onclick="closeM()">알겠어요</button>`);}

/* ---------- v7.8 편리하게: 긴 탭(햄스터·설정) 위 바로 가기 칩, 맨 위로 버튼 ---------- */
const SEC_TABS={pet:1,set:1};
const secCards=()=>[...($('s-'+tab)||document).querySelectorAll(':scope>.card')].filter(c=>c.querySelector('h2'));
const secName=c=>c.querySelector('h2').textContent.replace(/\s*\d+\s*\/\s*\d+\s*$/,'').trim();
function secNav(){const el=$('secnav');if(!el)return;const h=document.querySelector('header');if(h)document.documentElement.style.setProperty('--hh',(h.offsetHeight+4)+'px');
  if(!SEC_TABS[tab]){el.hidden=true;el.innerHTML='';return;}
  el.hidden=false;el.innerHTML=secCards().map((c,i)=>`<button class="chip" onclick="secGo(${i})">${esc(secName(c))}</button>`).join('');secOn();}
function secGo(i){const c=secCards()[i];if(!c)return;const off=($('secnav').offsetHeight||0)+(document.querySelector('header').offsetHeight||0)+12;
  window.scrollTo({top:c.getBoundingClientRect().top+scrollY-off,behavior:S.noAnim?'auto':'smooth'});}
function secOn(){const el=$('secnav');if(!el||el.hidden)return;const off=(el.offsetHeight||0)+(document.querySelector('header').offsetHeight||0)+24,cs=secCards();let k=0;
  cs.forEach((c,i)=>{if(c.getBoundingClientRect().top<=off)k=i;});[...el.children].forEach((b,i)=>b.classList.toggle('on',i===k&&scrollY>40));
  const b=el.children[k];if(b&&scrollY>40){const r=b.getBoundingClientRect(),er=el.getBoundingClientRect();if(r.left<er.left||r.right>er.right)el.scrollLeft+=r.left-er.left-20;}}
let secT=0;addEventListener('scroll',()=>{if(secT)return;secT=requestAnimationFrame(()=>{secT=0;secOn();const t=$('totop');if(t)t.classList.toggle('on',scrollY>innerHeight*1.2);});},{passive:true});
(()=>{const t=document.createElement('button');t.id='totop';t.setAttribute('aria-label','맨 위로');t.innerHTML='▲<br>위로';t.onclick=()=>window.scrollTo({top:0,behavior:S.noAnim?'auto':'smooth'});document.body.appendChild(t);
  const r0=render;render=function(){r0.apply(this,arguments);secNav();};secNav();})();

if(typeof tab!=='undefined'&&tab==='home')render();
