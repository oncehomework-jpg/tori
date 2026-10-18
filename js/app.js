/* JW Diary 본체 — 화면(홈·퀘스트·펫·도감·설정)과 저장 코드. 사진·보상 목록은 data/photos.js, 색·글꼴·간격은 css/variables.css */
const KEY='jw_diary_v1';   /* 저장 키 (바꾸면 기존 기록이 안 보여요) */
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const kst=()=>new Date(Date.now()+9*36e5);
const DY_FROM=18; /* 하루 마무리 한 줄이 나타나는 시각(한국 시간, 시) */
const todayStr=()=>kst().toISOString().slice(0,10);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const safeUrl=u=>/^https?:\/\//i.test(u||'')?u:'';
const TABS=[['pet','🐹','햄스터'],['coupon','🎒','보상'],['home','🏠','홈'],['place','📍','도감'],['set','⚙','설정']];   /* v8.1: 홈을 가운데로 (사용자 요청) */
const GRADES=['일반','희귀','전설'], PTYPES=['식당','카페','놀거리','기타'];
/* 배경 무늬 (설정 > 배경 꾸미기). 새 무늬는 여기와 CSS(--bgi-*, html[data-bgp])에 같이 추가 */
const BGP=[['acorn','도토리'],['hamster','햄스터'],['tako','타코'],['star','별']];
const BGX=[['mj','마작패'],['gt','기타'],['dc','주사위']];   /* 도토리 상점에서 사는 배경 무늬 (S.bgOwn에 얻은 것만 저장) */
function bgApply(){document.documentElement.dataset.bgp=S.bgPat||'acorn';}
function bgSet(v){S.bgPat=v;save();bgApply();rSet();}
function bgCard(){const p=S.bgPat||'acorn';
  return `<div class="card"><h2>🎨 배경 꾸미기</h2><div class="bgg">${BGP.concat(BGX.filter(x=>S.bgOwn.includes(x[0]))).map(([k,n])=>`<button class="bgo ${p===k?'on':''}" onclick="bgSet('${k}')"><span class="bgpv" style="background-image:var(--bgi-${k})"></span>${n}</button>`).join('')}</div></div>`;}

/* 도토리 수입 설정 (3단계): 숫자만 바꾸면 전체 수입이 같이 바뀌어요 */
const ECO={att:1,qCap:5,clear:1,actCap:2,mgPlays:2,pat:1,lucky:1,luckyP:.1,song:1,dex:1,wkCap:6};
function defaults(){
  return {v:2,mig3:1,mig4:1,streak:{last:todayStr(),n:1},acorns:0,fed:0,claimed:[],qdone:{d:'',ids:[]},bday:0,hname:'토리',firstSeen:todayStr(),lastBackup:'',
    coupons:[],used:[],places:[],wish:[],
    ddays:[]};
}
let S,loadErr=false,fresh=false,hold=false,AWAY=0,ACW='';
try{const r=localStorage.getItem(KEY);S=r?JSON.parse(r):(fresh=true,defaults());}catch(e){S=defaults();loadErr=true;}
fix();
const hn=()=>S.hname||'토리';
function fix(){if(!S.born)S.born=Date.now();if(!Array.isArray(S.album))S.album=[];if(!Array.isArray(S.titles))S.titles=[];if(!Array.isArray(S.bgOwn))S.bgOwn=[];if(!S.bless||typeof S.bless!=='object'||Array.isArray(S.bless))S.bless={};S.boost=Math.max(0,+S.boost||0);if(typeof S.titleOn!=='string')S.titleOn='';if(!Array.isArray(S.acLog))S.acLog=[];if(!Array.isArray(S.diary))S.diary=[];['coupons','used','places','wish','ddays','claimed'].forEach(k=>{if(!Array.isArray(S[k]))S[k]=[];});
  S.acorns=Math.max(0,+S.acorns||0);if(typeof S.acL!=='number')S.acL=S.acorns;
  if(!Array.isArray(S.pend))S.pend=[];
  if(!S.streak||typeof S.streak!=='object')S.streak={last:'',n:0};
  const mk=p=>({id:p[0],e:p[1],n:p[2],r:1});
  if(!Array.isArray(S.quests))S.quests=[['d1','💧','물 충분히 마시기'],['d3','🍚','끼니 잘 챙기기'],['d4','😴','일찍 잠자리에 들기']].map(mk);
  if(!Array.isArray(S.qp)){const mv=[];S.quests=S.quests.filter(q=>{const m=(q.id==='d0'&&q.n==='기타 연습하기')||(q.id==='d2'&&q.n==='운동·산책하기');if(m)mv.push(q);return !m;});
    S.qp=mv.concat([['d0','🎸','기타 연습하기'],['d2','🏃','운동·산책하기'],['p2','🤸','스트레칭 5분'],['p3','🎉','즐거운 시간 보내기'],['p8','😊','착한 말 한 마디 하기']].filter(p=>!mv.some(m=>m.id===p[0])).map(mk));}
  if(S.qv!==2){S.qv=2;const rn={p5:['남에게 친절하기','남에게 친절한 말 한마디 하기'],p6:['약자에게 양보하기','약자에게 양보해주기'],p7:['두려울 때 용기 내기','두려워도 용기 내기']};
    S.qp=S.qp.filter(x=>!(x.id==='p1'&&x.n==='집 밖으로 5분 나가기'));
    S.qp.forEach(x=>{const r=rn[x.id];if(r&&x.n===r[0])x.n=r[1];});
    if(S.qpick&&Array.isArray(S.qpick.ids)&&S.qpick.ids.includes('p1'))S.qpick=null;}
  if(S.qv3!==1){S.qv3=1;const dn=['나 자신에게 솔직하기','약자에게 양보해주기','약자에게 양보하기','두려워도 용기 내기','두려울 때 용기 내기','남에게 친절한 말 한마디 하기','남에게 친절하기'];
    S.qp=S.qp.filter(x=>!(['p4','p5','p6','p7'].includes(x.id)||dn.includes(x.n)));
    if(!S.qp.some(x=>x.n==='착한 말 한 마디 하기'))S.qp.push(mk([S.qp.some(x=>x.id==='p8')?'p8'+Date.now().toString(36):'p8','😊','착한 말 한 마디 하기']));
    if(S.qpick&&Array.isArray(S.qpick.ids)&&S.qpick.ids.some(id=>!S.qp.some(x=>x.id===id)&&!S.quests.some(x=>x.id===id)))S.qpick=null;}
  if(typeof S.qn!=='number')S.qn=2;if(S.autoFile===undefined)S.autoFile=0;if(typeof S.autoBk!=='string')S.autoBk='';
  if(!Array.isArray(S.wq))S.wq=[{id:'w0',e:'🏃',n:'이번 주 운동 3번',g:3,r:3}];
  if(!S.wp||typeof S.wp!=='object')S.wp={w:'',c:{},d:{},done:[]};
  if(!S.deco||typeof S.deco!=='object')S.deco={own:[],on:[]};if(!S.deco.pos||typeof S.deco.pos!=='object'||Array.isArray(S.deco.pos))S.deco.pos={};
  if(!S.act||typeof S.act!=='object')S.act={};['mj','bg','band','ex'].forEach(k=>{if(!Array.isArray(S.act[k]))S.act[k]=[];});if(!S.actRw||typeof S.actRw!=='object')S.actRw={d:'',done:{}};if(!S.actNext||typeof S.actNext!=='object')S.actNext={};if(!Array.isArray(S.songs))S.songs=[];if(!S.freeze)S.freeze=0;if(!S.mg||typeof S.mg!=='object')S.mg={d:'',n:0,best:0};if(!Array.isArray(S.bgames))S.bgames=[];if(!S.actBadge||typeof S.actBadge!=='object')S.actBadge={};
  if(S.bgmOn===undefined)S.bgmOn=1;if(S.vol===undefined)S.vol=30;if(S.bgm===undefined)S.bgm=0;if(S.bold===undefined)S.bold=0;if(S.bv!==2){S.bv=2;S.bold=0;}if(S.snd===undefined)S.snd=1;if(S.sv===undefined)S.sv=35;if(!S.svm){S.svm=1;if(S.sv===50)S.sv=35;}if(!S.lastFeed)S.lastFeed=0;if(!S.lastVisit)S.lastVisit=todayStr();S.fed=Math.max(0,+S.fed||0);if(!S.qdone||typeof S.qdone!=='object')S.qdone={d:'',ids:[]};if(typeof S.luckyD!=='string')S.luckyD='';if(typeof S.freeD!=='string')S.freeD='';if(!S.dexD||typeof S.dexD!=='object')S.dexD={d:'',n:0};
  if(!Array.isArray(S.exRest))S.exRest=[];if(!S.exStart)S.exStart=todayStr();if(!S.ach||typeof S.ach!=='object')S.ach={};
  if(!S.v){S.v=2;}if(!BGP.some(x=>x[0]===S.bgPat)&&!(BGX.some(x=>x[0]===S.bgPat)&&S.bgOwn.includes(S.bgPat)))S.bgPat='acorn';delete S.bgCol;
  if(!S.holOff||typeof S.holOff!=='object'||Array.isArray(S.holOff))S.holOff={};if(!Array.isArray(S.sched))S.sched=[];if(!Array.isArray(S.myHol))S.myHol=[];
  delete S.letters;delete S.bd;delete S.mkey;delete S.pin;}   /* 예전 버전의 미사용 필드 정리 */
function save(){acLog();try{const j=JSON.stringify(S);localStorage.setItem(KEY,j);idbPut(j);$('warn').style.display='none';return true;}catch(e){$('warn').style.display='block';return false;}}
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2200);}
function modal(h){$('box').innerHTML=h;$('ov').classList.add('on');}
function closeM(){$('ov').classList.remove('on');window.cpG=0;window.qG=0;}
function askOk(msg,cb){modal(`<h3>확인해 주세요</h3><p>${esc(msg)}</p><div class="row"><button class="btn ghost full" onclick="closeM()">아니요</button><button class="btn full" id="okb">네</button></div>`);$('okb').onclick=()=>{closeM();cb();};}
let tab='home',dMv=null;
function go(t){dMv=null;tab=t;render();window.scrollTo(0,0);}
function thm(){return S.theme==='light'||S.theme==='dark'?S.theme:'ask';}
function isNight(){const h=kst().getUTCHours();return h>=21||h<6;}
function nightKey(){const k=kst();return new Date(k.getTime()-(k.getUTCHours()<6?864e5:0)).toISOString().slice(0,10);}
function isDark(){const t=thm();if(t==='dark')return true;if(t==='light')return false;return isNight()&&!!S.nightA&&S.nightA.k===nightKey()&&S.nightA.v===1;}
function nightAns(v){S.nightA={k:nightKey(),v:v};save();render();toast(v?'화면을 어둡게 했어요 🌙':'그대로 밝게 둘게요');}
function nightAsk(){if(!S.tutDone||thm()!=='ask'||!isNight())return;if(S.nightA&&S.nightA.k===nightKey())return;if(tkQ.some(q=>q.o))return;
  tako('=밤이 깊었다코… 화면을 어둡게 해 줄까코? 🌙','',12000,0,[['어둡게 해줘',1],['괜찮아',0]]);}
function render(){dMv=null;msSync();bgApply();document.documentElement.classList.toggle('bold',!!S.bold);document.documentElement.classList.toggle('noanim',!!S.noAnim);document.documentElement.dataset.fs=[0,1,2].includes(+S.fs)?+S.fs:0;document.documentElement.classList.toggle('dk',isDark());
  $('nav').innerHTML=TABS.map(([k,i,l])=>`<button class="${tab===k?'on':''}" onclick="go('${k}')">${l}</button>`).join('');
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id==='s-'+tab));
  ({home:rHome,pet:rPet,coupon:rCoupon,place:rPlace,set:rSet})[tab]();dSetChk();msIntro();mdDayChk();S.lastSt=tState().st;achChk();
}
/* ---------- 홈 ---------- */
function ddLabel(d){const n=Math.round((Date.parse(d+'T00:00:00Z')-Date.parse(todayStr()+'T00:00:00Z'))/864e5);return n===0?'D-DAY':n>0?'D-'+n:'D+'+(-n);}
function bkDays(){const lb=Date.parse(S.lastBackup||''),base=isNaN(lb)?(S.firstSeen||todayStr()):new Date(lb+9*36e5).toISOString().slice(0,10);return dAgo(base,todayStr());}
/* 백업 알림 (v8.1, 사용자 요청): 홈 카드 대신 타코가 15일째부터 하루 한 번 물어봐요. '나중에 할게' → 그날부터 15일 뒤 다시 (S.bkSnz) */
const BK_DAYS=15;
function bkDue(){return bkDays()>=BK_DAYS&&!(S.bkSnz&&todayStr()<S.bkSnz);}
function bkAsk(){const t=todayStr();if(!S.tk||S.tk.d!==t)S.tk={d:t};if(S.tk.bk||!bkDue())return;S.tk.bk=1;save();const d=bkDays();
  tako('='+(S.lastBackup?'진우, 백업한 지 '+d+'일이 지났다코! 카톡 나에게 보내 두라코 💾':'진우, 아직 백업을 한 번도 안 했다코! 카톡 나에게 보내 두라코 💾'),'',15000,1,[['백업 보내기',900],['나중에 할게',901]]);}
function bkLater(){const d=new Date(Date.parse(todayStr()+'T00:00:00Z')+BK_DAYS*864e5).toISOString().slice(0,10);S.bkSnz=d;save();toast(BK_DAYS+'일 뒤에 다시 알려 줄게요');}
/* v8.2 정리: 접는 묶음(열림 상태는 S.gOpen에 기억) · 놀이 카드(미니게임/보드게임 탭) */
function grp(k,title,inner,cls){const o=S.gOpen&&S.gOpen[k];return inner?`<details class="card grp${cls?' '+cls:''}" ${o?'open':''} ontoggle="gTog('${k}',this.open)"><summary><h2>${title}</h2></summary><div class="grpin">${inner}</div></details>`:'';}
function gTog(k,v){if(!S.gOpen||typeof S.gOpen!=='object')S.gOpen={};if(!!S.gOpen[k]===v)return;if(v)S.gOpen[k]=1;else delete S.gOpen[k];save();}
function playCard(){const t=['mg','bg','mj','diff'].includes(S.playT)?S.playT:'mg';return `<div class="card playc"><h2>🎮 놀이</h2><div class="playtabs" role="tablist" aria-label="놀이 종류">${[['mg','미니게임'],['bg','보드게임'],['mj','마작'],['diff','틀린 그림 찾기']].map(([k,n])=>`<button class="btn playtab ${t===k?'chosen':''}" role="tab" aria-selected="${t===k}" onclick="playT('${k}')">${n}</button>`).join('')}</div><div class="playin" role="tabpanel">${t==='mg'?mgList():t==='bg'?(typeof bdgCard==='function'?bdgCard():''):t==='mj'?`<div class="gameintro"><img src="images/scenes/mahjong-room-v92.webp" alt="친구들이 함께하는 따뜻한 토리네 마작방" width="1400" height="1045" style="display:block;width:100%;height:auto;border:3px solid #765334;margin-bottom:14px"><h3>토리네 마작방</h3><p>동풍전 · 네 친구와 한 판</p><button class="btn wood" onclick="mjRoomOpen()">마작방 들어가기</button></div>`:`<div class="gameintro"><h3>토리의 틀린 그림 찾기</h3><p>두 그림을 비교해 다른 곳 7개를 찾아요.<br>도트 마을·로판 궁정·사천당가까지 그림 ${DF_SCENES.length}장이 기다려요.</p><button class="btn wood" onclick="dfOpen()">그림 고르기</button></div>`}</div></div>`;}
function playT(t){S.playT=t;save();const c=document.querySelector('.playc');if(c)c.outerHTML=playCard();}
function rHome(){
  const left=S.coupons.reduce((a,c)=>a+(+c.qty||0),0),y=+todayStr().slice(0,4),nb=nextBday();
  const dds=[...S.ddays].sort((a,b)=>{const x=ddEff(a),y=ddEff(b);return x<y?-1:x>y?1:0;});
  const bd=isBday()?(S.bday===y?`<div class="card legend">🎂 <b>HAPPY BIRTHDAY, 진우!</b><div class="muted">오늘의 선물은 이미 받았어요. 좋은 하루 보내요!</div></div>`:`<div class="card legend"><h2>🎂 생일 축하해, 진우!</h2><div>${esc(hn())}가 선물 상자를 들고 기다리고 있어요!</div><button class="btn wood full" style="margin-top:8px" onclick="claimBday()">🎁 선물 받기</button></div>`):'';
  $('s-home').innerHTML=`${loadErr?'<div class="card" style="background:#7a1f3d">저장된 데이터를 읽지 못했어요. 설정에서 백업 코드로 복원해 보세요.</div>':''}<div class="card hero s-${tState().st}${heroFlag(heroKey())}" onclick="dHero(event)"><img class="timg${heroDim(heroKey())}" src="${toriSrc(heroKey())}" alt="햄스터" onclick="pat()">${decoHtml(1)}${liveHtml(heroKey())}${decoHtml()}${['normal','full','hungry'].includes(heroKey())?stHtml():''}<div class="accs">${accHtml()}</div><div class="bubble">${esc(greet())}</div><button class="chatb" onclick="event.stopPropagation();chatOpen()" aria-label="토리와 대화">💬</button></div>
  ${bd}${expCard()}${questCard()}
  <div class="card"><h2>🌰 도토리 속 편지</h2><div id="letter" class="muted" style="font-size:15px;color:var(--tx);min-height:24px">${S.letter&&S.letter.d===todayStr()?letterHtml(S.letter.t):esc(hn())+'가 보낸 편지가 도토리 속에 들어 있어요.'}</div>
  <button id="lbtn" class="btn wood full" style="margin-top:8px${S.letter&&S.letter.d===todayStr()?';opacity:.5':''}" ${S.letter&&S.letter.d===todayStr()?'disabled':''} onclick="openLetter()">${S.letter&&S.letter.d===todayStr()?'내일 또 열 수 있어요':'🌰 도토리 열어보기'}</button></div>
  ${quickCard()}${dyCard()}
  <div class="card"><h2>🎒 현재 상태</h2><div class="stg"><div class="stt"><span>🌰 도토리</span><b class="qty">${S.acorns}개</b><button class="btn ghost sm" onclick="acHist()">내역</button></div><div class="stt"><span>🎟️ 보상</span><b class="qty">${left}장</b><button class="btn sm" onclick="go('coupon')">보상 가기</button></div></div>
</div>
  <div class="card"><div class="row sp"><h2>📅 D-day</h2><button class="btn sm card-add" onclick="ddForm()">+ 추가</button></div>
  <div class="q"><span>🎂 진우 생일 · ${+bdv().slice(0,2)}월 ${+bdv().slice(3)}일<div class="muted">${nb}</div></span><span class="dd">${ddLabel(nb)}</span></div>
  ${dds.map(d=>{const e=ddEff(d),n=d.rep?+e.slice(0,4)-+d.date.slice(0,4):0;return `<div class="q"><span>${esc(d.name)}<div class="muted">${esc(e)}${d.rep?' · 매년'+(n>0?' · '+n+'주년':''):''}</div></span><span class="row"><span class="dd">${ddLabel(e)}</span><button class="btn ghost sm" onclick="ddForm('${d.id}')">✏️</button></span></div>`;}).join('')}</div>${holCard()}${playCard()}${osCard()}
  ${grp('hmore','📂 더 보기',actCard()+streakCard()+dyMemCard()+balCard()+reportCard()+(+todayStr().slice(5,7)===12?yearCard():'')+memCard())}`;
}
const LETTERS=["찍찍! 진우야, 오늘도 수고했어. 네가 곁에 있어서 {n}의 볼주머니가 든든해.", "밥 잘 챙겨 먹고 물도 한 잔 마셔! {n}가 볼주머니에 응원을 담아 보낼게.", "기타 치는 진우가 제일 멋있다는 거, {n}는 다 알고 있지.", "힘든 날엔 도토리 하나 까먹고 쉬어가자. {n}가 옆에 있을게.", "내일의 진우도 오늘만큼 잘할 거야. {n}가 보증해!", "오늘 하루 어땠어? 좋은 일이 없었대도 괜찮아. 무사히 돌아온 게 제일 큰 일이야.", "{n}는 오늘 해바라기씨를 세 개나 먹었어. 진우도 맛있는 거 먹었으면 좋겠다!", "진우가 웃으면 {n}의 수염이 간질간질해. 오늘도 한 번만 웃어 줘!", "잠깐 눈 감고 숨을 크게 쉬어 봐. 후— 그리고 어깨 힘 빼기! {n}도 같이 할게.", "실수해도 괜찮아. {n}는 도토리를 자주 떨어뜨리지만 매번 다시 주워서 먹는걸.", "오늘 기타 줄 한 번 튕겨 봤어? 소리 하나만 내도 {n}는 신나서 쳇바퀴를 돌릴 거야.", "네가 열심히 하는 거, {n}가 다 보고 있어. 티가 안 나도 다 보고 있어!", "비 오는 날엔 굴속에서 도토리 까먹기 딱 좋아. 진우도 따뜻하게 있어.", "밤늦게까지 깨어 있진 않았지? {n}는 벌써 하품이 나와. 오늘은 일찍 자자.", "너무 애쓰지 않아도 돼. 오늘은 60점만 해도 {n}는 박수를 백 번 칠 거야.", "마작 모임 다녀오는 길이라면, 이겼든 졌든 재밌었던 얘기만 들려줘!", "진우야, 지금 이 순간에도 {n}는 네 편이야. 언제나, 어디서나.", "배고플 땐 뭐든 먹고 싶지? {n}도 그래. 오늘 하루 잘 버틴 진우는 맛있는 거 먹을 자격 충분해.", "오늘의 진우에게 별 하나를 붙여 줄게. 반짝반짝!", "걷다가 하늘 한 번 올려다봐. {n}가 구름 사이에서 손 흔들고 있을지도 몰라.", "혼자 끙끙 앓지 마. 힘들 땐 {n}한테 다 털어놔도 돼. 볼주머니는 넓으니까.", "노래 한 곡만 흥얼거려 봐. 기분이 조금 가벼워질 거야. {n}는 박자 맞춰서 달릴게!", "진우는 생각보다 훨씬 멋진 사람이야. {n}가 매일 가까이서 보고 있으니 믿어도 돼.", "도토리를 모으듯이 작은 하루가 쌓이면, 긴 겨울도 든든하게 날 수 있어.", "오늘 운동했다면 대단해! 안 했다면… 내일 조금만 움직여 볼까?", "{n}의 쳇바퀴는 오늘도 백 바퀴! 진우의 하루도 힘차게 굴러가고 있어.", "좋아하는 걸 하는 시간은 낭비가 아니야. 그 시간이 진우를 반짝이게 해.", "잘 자, 진우야. 내일 아침엔 {n}가 도토리 하나 먼저 까먹고 기다릴게.", "기분이 무거운 날엔 창문을 열어 봐. 바람이 {n}의 응원을 실어다 줄 거야.", "밥은 먹었어? 국물도 좀 마시고 채소도 한 입! {n}의 부탁이야.", "진우가 밴드 연습하는 소리, 굴속까지 들려. {n}는 그 소리가 제일 좋아.", "{n}가 오늘 발견한 비밀: 진우 옆에 있으면 볼주머니가 저절로 따뜻해져.", "오늘 못 한 일은 내일의 진우에게 살짝 맡겨 두자. 내일도 진우는 잘할 거야.", "힘내라는 말이 부담될 땐 그냥 쉬어. {n}는 말없이 옆에 앉아 있을게.", "방금 {n}가 도토리 껍질을 예쁘게 깠어. 진우에게 보여 주려고 몰래 숨겨 놨지!", "친구들 만나서 웃었다면 그걸로 오늘은 대성공이야. {n}도 기뻐!", "{n}는 작아서 큰 도움은 못 되지만, 응원만큼은 온 세상에서 제일 커.", "지치면 잠깐 멈춰도 돼. 도토리도 쉬엄쉬엄 먹어야 맛있는 법이야.", "진우야, 오늘 스스로에게 \"수고했어\" 한 번 말해 줘. 그게 제일 좋은 선물이야.", "게임 한 판 하고 싶은 날이지? 스트레스가 풀린다면 {n}는 대찬성! 대신 물도 마셔.", "어제보다 아주 조금만 나아지면 충분해. 딱 도토리 한 알만큼만!", "{n}가 꿈에서 진우를 만났어. 기타 치면서 활짝 웃고 있더라. 그 꿈, 곧 이뤄질 거야.", "몸은 마음의 집이래. 오늘은 따뜻하게 입고 푹 쉬어 줘. {n}가 지켜볼게.", "오늘 하루가 별로였어도 괜찮아. 이 편지를 열어 본 것만으로 벌써 한 걸음 나아간 거야.", "먹고 싶은 게 있다면 오늘은 조금 즐겨도 돼. {n}가 살짝 눈감아 줄게. 쉿!", "진우의 하루 끝엔 언제나 {n}가 있어. 문을 열면 찍찍 하고 반겨 줄 거야.", "마음이 복잡한 날엔 도토리를 세어 봐. 하나, 둘, 셋… 어느새 마음이 잔잔해질 거야.", "좋은 사람 곁엔 좋은 사람이 모인대. 진우 곁에 좋은 사람이 많은 건 다 이유가 있어.", "오늘도 여기까지 온 진우, 정말 대단해. {n}가 볼주머니 한가득 박수를 보낼게.", "내일도 모레도 {n}는 여기서 기다릴게. 편지는 매일 하나씩, 도토리 속에 넣어 둘게."];
const LM=[["새해 첫 도토리는 진우한테 줄게! {n}가 올해도 곁에 있을게.","눈 오는 날엔 굴속에서 도토리 까먹기 딱이야. 따뜻하게 입고 다녀!"],["추운 날엔 기타 소리가 더 포근해. 오늘 한 곡 쳐 볼래?","{n}는 겨울잠 자고 싶지만, 진우가 궁금해서 눈을 떴어!"],["봄이 왔어! 굴 앞에 새싹이 쏙 올라왔더라. 진우도 쑥쑥 자라는 중이야.","3월엔 진우 생일이 있지! {n}가 벌써부터 선물 고르고 있어."],["벚꽃 잎 하나 주워 왔어. 진우 책상에 몰래 놓아둘게.","봄바람 맞으며 산책하면 기분이 좋아져. 오늘 5분만 나가 볼까?"],["5월 햇살은 도토리도 노릇노릇하게 만들어. 진우도 햇볕 좀 쬐자!","초록이 진해지는 달이야. {n}의 볼주머니도 초록 응원으로 가득해."],["장마 오기 전에 산책 한 번 더! {n}가 우산 들고 따라갈게.","벌써 올해의 절반이 다가와. 여기까지 온 진우, 정말 잘했어."],["더워서 쳇바퀴가 녹겠어… 진우, 물 많이 마셔!","비 오는 날엔 굴속에서 기타 소리 듣는 게 최고야."],["한여름엔 무리하지 마. 쉬는 것도 실력이야, {n}가 보증해!","수박씨 세 개 모아 뒀어. 진우 몫도 있어!"],["아침저녁으로 선선해졌어. 운동하기 딱 좋은 계절이야!","추석 지나면 도토리가 제일 맛있어져. {n}는 벌써 기대돼!"],["도토리가 후두둑 떨어지는 달이야! 진우 몫도 챙겨 뒀지.","단풍이 예뻐서 굴 앞에서 한참 구경했어. 진우한테도 보여 주고 싶다."],["빼빼로 나눠 먹을 사람 생각나? {n}는 진우 생각났어.","찬바람이 불어도 진우 마음은 따뜻하길. {n}가 볼로 데워 줄게!"],["한 해가 끝나 가. 올해 진우가 해낸 일, {n}는 다 기억해!","보상 아껴 두다 못 쓰면 아까워! 연말엔 꼭 하나 써 보자."]];
const LETTER_CHEER=["찍찍! 오늘의 작전은 작은 성공 하나 만들기! {n}는 응원 깃발부터 들었어.", "진우, 기타 한 소절만 들려줘! {n}의 꼬마 공연장 첫 줄은 벌써 매진이야.", "오늘도 출발! 물 한 잔 마시고 어깨 쫙 펴자. {n}는 볼주머니 엔진 켰다!", "진우의 좋은 점을 세다가 해바라기씨를 다 먹었어. 숫자보다 간식이 먼저 떨어졌네!", "하나, 둘, 찍찍! 오늘의 진우에게 힘찬 응원 세 번 보낸다!", "오늘 할 일 하나 끝내면 승리 포즈 해 줘! {n}도 앞발을 번쩍 들게.", "진우야, 오늘은 어떤 재미를 발견할까? {n}는 탐험대 간식 담당이야!", "좋아하는 노래로 하루의 첫 박자를 정해 보자. {n}는 이미 발을 구르고 있어!", "도토리처럼 단단한 자신감 하나 챙겨! 진우의 주머니에 쏙 넣어 줄게.", "찍찍! 오늘의 숨은 보물은 진우의 아이디어! 떠오른 것 하나만 적어 볼까?", "밴드 연습 시작하면 {n}도 리허설이야. 응원 구호는 언제나 진우 최고!", "산책 나가면 새로운 간판 하나 찾아봐! {n} 탐험 노트에도 기록해 둘게.", "진우가 웃을 때마다 굴속 조명이 켜지는 기분이야. 오늘도 반짝 켜 줘!", "작은 목표 하나 골라서 도전! 성공하면 {n}가 앞발 하이파이브 해 줄게.", "오늘의 진우는 어떤 멋진 일을 할까? {n}는 기대돼서 수염이 씰룩거려!", "손끝으로 기타 줄을 톡! 오늘의 멜로디를 시작해 보자. {n}도 박수 톡톡!", "밥 먹고 물 마시고 즐겁게 출발! 든든한 진우와 빵빵한 {n}, 준비 완료!", "좋은 일이 생기면 바로 알려 줘! {n}는 축하 도토리를 꼭 쥐고 기다려.", "오늘 새로운 것 하나 배워 보자. {n}도 도토리 까는 신기술을 연구 중이야!", "진우의 첫걸음에 박수! 두 번째 걸음엔 더 큰 박수! {n} 앞발이 바빠진다!", "햇빛이 창문에 들어왔어. 오늘도 진우의 무대가 환하게 열렸다는 신호야!", "찍찍! 재미있는 계획 하나 세워 볼까? {n}는 간식 가져갈 준비 끝났어.", "진우의 하루에 신나는 후렴구 하나! 좋아하는 노래를 크게 흥얼거려 보자.", "작은 약속 하나 지킨 진우에게 엄지 척! {n}는 작은 앞발이라 두 개 다 들었어.", "오늘의 기운을 도토리에 꾹꾹 담았어. 열자마자 씩씩한 찍찍 소리가 날 거야!", "마작이든 연습이든 오늘도 즐겁게 한 판! {n}는 진우 응원석에 앉았어.", "진우의 좋은 아이디어는 반짝이는 씨앗이야. 오늘 하나 심어 볼까?", "찍찍! 기지개 쭉 펴고 시작하자. {n}도 앞발을 뻗다가 뒤로 굴렀어!", "오늘 만든 작은 성과, 그냥 넘기지 말고 자랑해 줘. {n}는 환호 담당이야!", "진우야, 오늘은 어떤 맛있는 걸 먹을까? 메뉴 정하는 순간부터 모험이야!", "연습한 만큼 손끝에 실력이 쌓이고 있어! {n}는 진우의 다음 연주가 기대돼.", "오늘도 진우의 편에 한 표! {n}의 볼주머니 투표함은 응원으로 꽉 찼어.", "새로운 길을 걷다 좋은 풍경 만나면 눈에 담아 줘. {n}에게도 이야기해 줘!", "오늘 한 가지 해냈다면 가슴 쫙 펴기! 꼬마 응원대장 {n}가 축하 경례한다!", "진우의 웃음 한 번에 {n}의 쳇바퀴가 두 바퀴! 이거 완전 웃음 발전소잖아!", "찍찍! 오늘의 미션은 좋아하는 일 십 분! 재미를 충전해서 씩씩하게 가자.", "진우가 도전하면 {n}도 용기가 나! 오늘은 둘 다 신기록에 도전해 볼까?", "잘한 일을 하나 발견해서 스스로 칭찬해 줘. {n}는 축하 나팔을 불게. 찍찍!", "오늘 하루에 즐거운 장면 하나 만들자! 작은 농담 하나도 훌륭한 시작이야.", "진우, 준비됐어? 오늘도 우리의 하루가 시작된다! {n}는 볼주머니에 신남 가득!"];
const LX=()=>LETTERS.concat(LM[+todayStr().slice(5,7)-1]||[],LETTER_CHEER);
const HB={hal:'해피 할로윈! 트릭 오어 트릿? 볼주머니에 사탕 가득 챙겨 뒀어 🎃',nyd:'새해 복 많이 받아! 올해도 같이 도토리 모으자 ☀',seol:'설날이야! 떡국 먹었어? 새해 복 많이 받아 🍚',chu:'추석이야! 보름달 보러 나가 볼까? 🌙',xev:'오늘은 크리스마스 이브의 이브! 내일이 이브라니, 벌써부터 설레서 볼주머니가 콩닥콩닥해 🎁',xms:'메리 크리스마스! 도토리 트리 세워 뒀어 🎄',val:'밸런타인데이야! 토리는 해바라기씨 초콜릿을 준비했어 ❤',chi:'어린이날이야! 오늘은 진우도 마음껏 놀아도 돼 🎁'};
function letterHtml(l){return '💌 '+esc(l.split('{n}').join(hn()))+'<div class="muted" style="margin-top:6px">— from. '+esc(hn())+'</div>';}
function openLetter(){const t=todayStr();if(S.letter&&S.letter.d===t){toast('오늘의 편지는 이미 열었어요. 내일 또 와요!');return;}
  if(!Array.isArray(S.lh))S.lh=[];let pool=LX().map((_,i)=>i).filter(i=>!S.lh.includes(i));if(!pool.length){S.lh=[];pool=LX().map((_,i)=>i);}
  const i=pool[Math.floor(Math.random()*pool.length)];S.lh=[...S.lh,i].slice(-30);S.letter={d:t,t:LX()[i]};save();sfx('coin');$('letter').innerHTML=letterHtml(S.letter.t);
  const b=$('lbtn');if(b){b.disabled=true;b.style.opacity='.5';b.textContent='내일 또 열 수 있어요';}}
const LUNAR={"seol":["2026-02-17","2027-02-07","2028-01-27","2029-02-13","2030-02-03","2031-01-23","2032-02-11","2033-01-31","2034-02-19","2035-02-08","2036-01-28","2037-02-15","2038-02-04","2039-01-24","2040-02-12","2041-02-01","2042-01-22","2043-02-10","2044-01-30","2045-02-17"],"chu":["2026-09-25","2027-09-15","2028-10-03","2029-09-22","2030-09-12","2031-10-01","2032-09-19","2033-09-08","2034-09-27","2035-09-16","2036-10-04","2037-09-24","2038-09-13","2039-10-02","2040-09-21","2041-09-10","2042-09-28","2043-09-17","2044-10-05","2045-09-25"],"bud":["2026-05-24","2027-05-13","2028-05-02","2029-05-20","2030-05-09","2031-05-28","2032-05-16","2033-05-06","2034-05-25","2035-05-15","2036-05-03","2037-05-22","2038-05-11","2039-04-30","2040-05-18","2041-05-07","2042-05-26","2043-05-16","2044-05-05","2045-05-24"]};
/* [id, 이모지, 이름, 월|'L', 일|음력키, 그룹] — 'L'은 음력 명절(LUNAR 표 사용, 2026~2045) */
const HOL=[['val','❤','밸런타인데이',2,14,'cp'],['whi','🍰','화이트데이',3,14,'cp'],['hal','🎃','할로윈',10,31,'cp'],['pep','🍪','빼빼로데이',11,11,'cp'],['xev','🎁','크리스마스 이브의 이브',12,23,'cp'],['xms','🎄','크리스마스',12,25,'cp'],
['nyd','☀','새해 첫날',1,1,'md'],['seol','🍚','설날','L','seol','md'],['chu','🌙','추석','L','chu','md'],
['mar','⭐','삼일절',3,1,'nat'],['chi','🎁','어린이날',5,5,'nat'],['bud','🌸','부처님오신날','L','bud','nat'],['mem','🌷','현충일',6,6,'nat'],['con','📜','제헌절',7,17,'nat'],['lib','🎉','광복절',8,15,'nat'],['gae','🏰','개천절',10,3,'nat'],['han','✏','한글날',10,9,'nat']];
const HG={cp:'기념일',md:'명절',nat:'국경일 · 공휴일'},WD='일월화수목금토';
const p2=n=>String(n).padStart(2,'0'),isLeap=y=>y%4===0&&(y%100!==0||y%400===0);
function holNext(h){const t=todayStr();if(h[3]==='L')return (LUNAR[h[4]]||[]).find(d=>d>=t)||'';const y=+t.slice(0,4);
  for(const yy of [y,y+1]){const d=yy+'-'+p2(h[3])+'-'+p2(h[4]);if(d>=t)return d;}return '';}
function wdOf(d){return WD[new Date(d+'T00:00:00Z').getUTCDay()];}
/* v4.7 일정 · 내 기념일: 일정 S.sched=[{id,name,date,time,memo}] (한 번), 내 기념일 S.myHol=[{id,e,name,md}] (매년 MM-DD) */
const MYE=['🎉','❤','🎂','💌','⭐','🌸','🎁','🍰'];
function allHol(){const off=S.holOff||{};return HOL.filter(h=>!off[h[0]]).concat((S.myHol||[]).map(x=>['my'+x.id,x.e||'🎉',x.name,+x.md.slice(0,2),+x.md.slice(3),'my']));}
function upList(n){const t=todayStr(),L=allHol().map(h=>({e:h[1],nm:h[2],d:holNext(h),k:'h'})).filter(x=>x.d)
  .concat((S.sched||[]).filter(s=>s.date>=t).map(s=>({e:'🗓',nm:s.name,d:s.date,tm:s.time,k:'s',id:s.id})));
  return L.sort((a,b)=>(a.d+(a.tm||''))<(b.d+(b.tm||''))?-1:1).slice(0,n);}
function holCard(){const l=upList(5);
  return `<div class="card"><div class="row sp"><h2>🎉 기념일</h2><button class="btn sm card-add" onclick="schForm()">+ 일정</button></div>${l.map(x=>`<div class="q"${x.k==='s'?` onclick="schForm('${x.id}')" style="cursor:pointer"`:''}><span>${x.e} ${esc(x.nm)}<div class="muted">${esc(x.d)} (${wdOf(x.d)})${x.tm?' · '+esc(x.tm):''}</div></span><span class="dd">${ddLabel(x.d)}</span></div>`).join('')||'<div class="empty">다가오는 일정이 없어요. + 일정으로 넣어 보세요.</div>'}</div>`;}
function schForm(id){const s=(S.sched||[]).find(x=>x.id===id)||{name:'',date:todayStr(),time:'',memo:''};
  modal(`<h3>🗓 일정 ${id?'고치기':'추가'}</h3><label>이름</label><input id="sn" maxlength="30" placeholder="예: 합주 공연, 병원" value="${esc(s.name)}"><label>날짜</label><input id="sd" type="date" value="${esc(s.date)}"><label>시간 (선택)</label><input id="st" type="time" value="${esc(s.time||'')}"><label>메모 (선택)</label><input id="sm" maxlength="60" value="${esc(s.memo||'')}"><div class="row">${id?`<button class="btn ghost" onclick="schDel('${id}')">삭제</button>`:''}<button class="btn ghost full" onclick="closeM()">취소</button><button class="btn full" onclick="schSave('${id||''}')">저장</button></div>`);}
function schSave(id){const n=$('sn').value.trim(),d=$('sd').value;if(!n||!d){toast('이름과 날짜를 넣어 주세요');return;}const v={name:n,date:d,time:$('st').value,memo:$('sm').value.trim()},o=id&&S.sched.find(x=>x.id===id);
  if(o)Object.assign(o,v);else S.sched.push({id:uid(),...v});S.sched.sort((a,b)=>(a.date+(a.time||''))<(b.date+(b.time||''))?-1:1);save();closeM();render();toast(d<todayStr()?'저장했어요. 이미 지난 날짜라 목록엔 안 보여요':'일정을 저장했어요');}
function schDel(id){askOk('이 일정을 지울까요?',()=>{S.sched=S.sched.filter(x=>x.id!==id);save();render();toast('지웠어요');});}
function mhForm(id){const x=(S.myHol||[]).find(v=>v.id===id)||{name:'',md:todayStr().slice(5),e:'🎉'};
  modal(`<h3>🎉 내 기념일 ${id?'고치기':'추가'}</h3><div class="muted">매년 같은 날에 홈 화면에 나와요.</div><label>이름</label><input id="hn2" maxlength="20" placeholder="예: 처음 만난 날" value="${esc(x.name)}"><label>날짜 (해마다 같은 월·일)</label><div class="row mdp"><select id="hm2" onchange="mhDays()">${[...Array(12)].map((_,i)=>`<option value="${i+1}" ${i+1===+x.md.slice(0,2)?'selected':''}>${i+1}월</option>`).join('')}</select><select id="hd2" data-v="${+x.md.slice(3)}"></select></div><label>아이콘</label><select id="he2">${MYE.map(e=>`<option ${e===x.e?'selected':''}>${e}</option>`).join('')}</select><div class="row">${id?`<button class="btn ghost" onclick="mhDel('${id}')">삭제</button>`:''}<button class="btn ghost full" onclick="closeM()">취소</button><button class="btn full" onclick="mhSave('${id||''}')">저장</button></div>`);mhDays();}
/* v8.1: 내 기념일은 연도 없이 월·일만 고름 (2월은 29일까지) */
function mhDays(){const m=+$('hm2').value,d=$('hd2'),v=+(d.value||d.dataset.v||1),n=[31,29,31,30,31,30,31,31,30,31,30,31][m-1];d.innerHTML=[...Array(n)].map((_,i)=>`<option value="${i+1}" ${i+1===Math.min(v,n)?'selected':''}>${i+1}일</option>`).join('');}
function mhSave(id){const n=$('hn2').value.trim(),d=String($('hm2').value).padStart(2,'0')+'-'+String($('hd2').value).padStart(2,'0');if(!n){toast('이름을 넣어 주세요');return;}const v={name:n,md:d,e:$('he2').value},o=id&&S.myHol.find(x=>x.id===id);
  if(o)Object.assign(o,v);else S.myHol.push({id:uid(),...v});save();closeM();render();toast('기념일을 저장했어요');}
function mhDel(id){askOk('이 기념일을 지울까요?',()=>{S.myHol=S.myHol.filter(x=>x.id!==id);save();render();toast('지웠어요');});}
function schCard(){const t=todayStr(),up=(S.sched||[]).filter(s=>s.date>=t),past=(S.sched||[]).filter(s=>s.date<t).slice(-5).reverse();
  const row=(s,dim)=>`<div class="q ${dim?'dim':''}"><span>🗓 ${esc(s.name)}<div class="muted">${esc(s.date)} (${wdOf(s.date)})${s.time?' · '+esc(s.time):''}${s.memo?' · '+esc(s.memo):''}</div></span><span class="row"><button class="btn ghost sm" onclick="schForm('${s.id}')">✏️</button><button class="btn ghost sm" onclick="schDel('${s.id}')">✕</button></span></div>`;
  return `<div class="card"><h2>📅 일정 · 기념일</h2><div class="muted" style="margin-bottom:6px">가까운 일정과 기념일 5개를 홈 화면에 보여줘요.</div>
  <div class="row sp" style="margin-top:8px;margin-bottom:10px"><b>🗓 일정</b><button class="btn sm card-add" onclick="schForm()">+ 일정 추가</button></div>${up.map(s=>row(s)).join('')||'<div class="muted">다가오는 일정이 없어요.</div>'}${past.length?'<div class="muted" style="margin-top:6px">지난 일정</div>'+past.map(s=>row(s,1)).join(''):''}
  <div class="row sp" style="margin-top:14px;margin-bottom:10px"><b>🎉 내 기념일 (매년)</b><button class="btn sm" onclick="mhForm()">+ 기념일 추가</button></div>${(S.myHol||[]).map(x=>`<div class="q"><span>${x.e} ${esc(x.name)}<div class="muted">매년 ${+x.md.slice(0,2)}월 ${+x.md.slice(3)}일</div></span><span class="row"><button class="btn ghost sm" onclick="mhForm('${x.id}')">✏️</button><button class="btn ghost sm" onclick="mhDel('${x.id}')">✕</button></span></div>`).join('')||'<div class="muted">아직 없어요. 처음 만난 날 같은 날을 넣어 보세요.</div>'}
  <div style="margin-top:14px"><b>📌 기본 기념일</b><div class="muted">눌러서 켜고 끌 수 있어요 (꺼 두면 홈에 안 나와요).</div></div>${Object.keys(HG).map(g=>`<div class="muted" style="margin:10px 0 4px">${HG[g]}</div><div class="row wrap" style="gap:6px">${HOL.filter(h=>h[5]===g).map(h=>`<button class="chip ${(S.holOff||{})[h[0]]?'':'on'}" onclick="holTog('${h[0]}')">${h[1]} ${esc(h[2])}</button>`).join('')}</div>`).join('')}</div>`;}
function holTog(id){if(!S.holOff)S.holOff={};if(S.holOff[id])delete S.holOff[id];else S.holOff[id]=1;save();rSet();}
/* 매년 반복 D-day: 오늘 이후(오늘 포함) 가장 가까운 기념일 */
function ddEff(d){const t=todayStr();if(!d.rep||d.date>=t)return d.date;const md=d.date.slice(5),y=+t.slice(0,4);
  const mk=yy=>md==='02-29'&&!isLeap(yy)?yy+'-02-28':yy+'-'+md;const n=mk(y);return n>=t?n:mk(y+1);}
function ddForm(id){const x=S.ddays.find(v=>v.id===id)||{name:'',date:todayStr(),rep:0};
  modal(`<h3>D-day ${id?'수정':'추가'}</h3><label>이름</label><input id="dn" maxlength="30" placeholder="예: 모비딕 공연" value="${esc(x.name)}"><label>날짜</label><input id="dd" type="date" value="${esc(x.date)}"><label>반복</label><select id="dr"><option value="0" ${x.rep?'':'selected'}>한 번만</option><option value="1" ${x.rep?'selected':''}>매년 반복 (기념일 · 생일)</option></select><div class="row">${id?`<button class="btn ghost" onclick="ddDel('${id}')">삭제</button>`:''}<button class="btn ghost full" onclick="closeM()">취소</button><button class="btn full" onclick="ddSave('${id||''}')">저장</button></div>`);}
function ddSave(id){const n=$('dn').value.trim(),d=$('dd').value,r=$('dr').value==='1'?1:0;if(!n||!d){toast('이름과 날짜를 넣어 주세요');return;}
  const o=id&&S.ddays.find(v=>v.id===id);if(o){o.name=n;o.date=d;o.rep=r;}else S.ddays.push({id:uid(),name:n,date:d,rep:r});save();closeM();rHome();}
function ddDel(id){askOk('이 D-day를 지울까요?',()=>{S.ddays=S.ddays.filter(x=>x.id!==id);save();rHome();});}
/* ---------- 보상 ---------- */
function expired(c){return c.expire&&c.expire<todayStr();}
const MEV=[["🀄","마작 한 판 하기",5],["🀄","마작 모임 다녀오기",7],["🀄","마작 연습 1시간",4],["🎲","보드게임 한 판 하기",5],["🎲","보드게임 모임 나가기",7],["🎸","기타 한 곡 마음껏 치기",4],["🎸","새 곡 하나 카피해 보기",5],["🎸","기타 소품 하나 사기 (피크 · 줄 등)",8],["😴","운동 하루 쉬기",5],["⭐","지금부터 1시간, 하고 싶은 것만 하기",8],["💧","맛있는 음료 마시기",3],["💆","스스로 머리 쓰담쓰담 5회",3]],MSE=[[["🌸","벚꽃 산책 같이",6],["🍰","딸기 케이크 타임",7],["🎒","봄 소풍 도시락 싸기",8]],[["☔","장마철 집콕 영화 데이",6],["🍰","아이스크림 하나 골라 먹기",4],["🎲","여름밤 보드게임",5]],[["🍁","단풍 구경 데이트",7],["🎟","가을 전시 · 영화 데이트",9],["🍰","따뜻한 카페라떼 데이트",6]],[["🎉","연말 소원 하나 들어주기",12],["🍚","뜨끈한 국밥 먹으러 가기",6],["🎮","이불 속 게임 시간",5]]],MSP=[[["🎁","새해 복 보상: 소원 하나",12],["🍚","새해 맛집에서 떡국 한 그릇",6]],[["🍪","나에게 초콜릿 하나 사 주기",6],["🤐","평화로운 하루 보내기",8]],[["🎂","진우 생일 축하 파티권",18],["🌸","봄 첫 꽃놀이",7]],[["🌸","벚꽃 엔딩 데이트",9],["💐","봄맞이 작은 화분 하나 들이기",7]],[["☀","햇살 산책 30분",6],["🎮","어린이날 하루 동심 데이",8]],[["🍉","초여름 수박 파티",6],["🌙","괴담 유튜브 보기",9]],[["🎲","얼최몇(얼음 최대 몇 개?) 게임",12],["☀","한여름 빙수 무제한 데이",10]],[["🏰","여름휴가 하루 진우 마음대로",18],["⭐","별똥별 보러 가기",9]],[["🍚","추석 송편 같이 빚기",6],["🍁","첫 단풍 산책",5]],[["🎉","할로윈 코스튬 파티",9],["🍁","단풍 절정 데이",8]],[["🍪","빼빼로 한 통 혼자 다 먹기",5],["🍗","겨울 준비 따뜻한 국물 데이",6]],[["🎁","크리스마스 데이트",15],["🎉","연말 파티 소원권",20]]],SEAS=['봄','여름','가을','겨울'];
function seasonOf(m){m=m||+todayStr().slice(5,7);return m>=3&&m<=5?0:m>=6&&m<=8?1:m>=9&&m<=11?2:3;}
function monthList(){const m=+todayStr().slice(5,7),ym=todayStr().slice(0,7),s=seasonOf(m),ix=(m-3+12)%3;
  const pick=(a,n,o)=>Array.from({length:Math.min(n,a.length)},(_,i)=>a[(o+i)%a.length]);
  const seen=new Set(MSP[m-1].map(x=>x[1])),rest=[...pick(MSE[s],12,ix*5),...pick(MEV,MEV.length,(m*7)%MEV.length)].filter(x=>!seen.has(x[1])&&seen.add(x[1])).slice(0,40-MSP[m-1].length).sort((a,b)=>a[2]-b[2]);
  return [...MSP[m-1],...rest].map((x,i)=>({id:ym+':'+x[1],e:x[0],n:x[1],p:x[2],g:x[2]<=4?'일반':x[2]<=9?'희귀':'전설'}));}
function mcState(){const ym=todayStr().slice(0,7);if(!S.mc||S.mc.m!==ym)S.mc={m:ym,got:[]};return S.mc;}
let cTab='mine',mPage=0;
function cpTabs(){return `<div class="row" style="margin-bottom:12px"><button class="btn full ${cTab==='mine'?'':'ghost'}" onclick="cTab='mine';rCoupon()">내 보상</button><button class="btn full ${cTab==='month'?'':'ghost'}" onclick="cTab='month';mPage=0;rCoupon()">${+todayStr().slice(5,7)}월의 보상</button></div>`;}
function mPg(d){mPage+=d;rCoupon();window.scrollTo(0,0);}
function rMonth(){const L=monthList().filter(c=>mCat==='전체'||catOf(c.n)===mCat),st=mcState(),pg=Math.max(1,Math.ceil(L.length/10)),m=+todayStr().slice(5,7),sn=SEAS[seasonOf(m)];mPage=((mPage%pg)+pg)%pg;
  const items=L.slice(mPage*10,mPage*10+10).map(c=>{const got=st.got.includes(c.id);return `<div class="card ${c.g==='전설'?'legend':''} ${got?'dim':''}"><div class="cp"><div class="em">${esc(c.e)}</div><div style="flex:1"><div class="nm">${esc(c.n)}<span class="badge g-${c.g}">${c.g}</span></div><div class="ds">${m}월 ${sn} 보상</div><div class="row sp" style="margin-top:6px"><span class="qty">🌰 ${c.p}개</span><button class="btn sm ${got?'ghost':'wood'}" ${got?'disabled':''} onclick="mBuy('${c.id}')">${got?'교환 완료':'교환하기'}</button></div></div></div></div>`;}).join('');
  $('s-coupon').innerHTML=`<div class="card" style="background:var(--pink-l)"><h2>🐹 ${m}월의 보상</h2><div>${esc(hn())}가 ${sn}에 어울리는 보상 ${monthList().length}장을 준비했어요! 도토리로 교환하면 내 보상에 들어와요. 매달 1일에 새로 바뀌어요.</div><div style="margin-top:6px">보유 🌰 <b class="qty">${S.acorns}개</b></div></div>${cpTabs()}${gachaCard()}${catChips()}${items||'<div class="empty">이 종류는 이번 달 목록에 없어요.</div>'}
  <div class="row sp" style="margin-bottom:22px"><button class="btn sm" onclick="mPg(-1)">◀ 이전</button><span class="muted">${mPage+1} / ${pg}</span><button class="btn sm" onclick="mPg(1)">다음 ▶</button></div>`;}
function mBuy(id){const c=monthList().find(x=>x.id===id),st=mcState();if(!c||st.got.includes(id))return;if(S.acorns<c.p){toast('도토리가 부족해요. 퀘스트로 모아 보세요');sfx('no');return;}
  askOk(`「${c.n}」 보상을 도토리 ${c.p}개로 교환할까요?`,()=>{if(S.acorns<c.p||st.got.includes(id))return;S.acorns-=c.p;st.got.push(id);S.coupons.push({id:uid(),emoji:c.e,name:c.n,desc:+todayStr().slice(5,7)+'월 '+SEAS[seasonOf()]+' 보상',grade:c.g,qty:1,expire:''});save();sfx('fan');toast('보상에 넣었어요!');rCoupon();});}
function rCoupon(){if(cTab==='month')return rMonth();
  const cl=[...S.coupons].sort((a,b)=>(cDead(a)?1:0)-(cDead(b)?1:0)),cpg=Math.max(1,Math.ceil(cl.length/10));cPage=((cPage%cpg)+cpg)%cpg;const list=cl.slice(cPage*10,cPage*10+10).map(c=>{const dead=(+c.qty||0)<=0||expired(c);
    return `<div class="card ${c.grade==='전설'?'legend':''} ${dead?'dim':''}"><div class="cp"><div class="em">${esc(c.emoji||'🎟️')}</div><div style="flex:1"><div class="nm">${esc(c.name)}<span class="badge g-${esc(c.grade)}">${esc(c.grade)}</span></div><div class="ds">${esc(c.desc)}</div>
    <div class="muted">${c.expire?'유효기간 ~ '+esc(c.expire)+(expired(c)?' (만료)':''):'유효기간 없음'}</div>
    <div class="row sp" style="margin-top:6px"><span class="qty">${(+c.qty||0)>0?'남은 '+(+c.qty)+'장':'모두 사용했어요'}</span><span class="row"><button class="btn sm" ${dead?'disabled style="opacity:.4"':''} onclick="cpUse('${c.id}')">사용하기</button></span></div></div></div></div>`;}).join('');
  const used=[...S.used].reverse().slice(0,20).map(u=>`<div class="row sp" style="padding:5px 0;border-top:2px dashed var(--in)"><span>${esc(u.emoji)} ${esc(u.name)}</span><span class="muted">${esc(u.date)}</span></div>`).join('');
  $('s-coupon').innerHTML=`<div class="card" style="background:var(--pink-l)"><h2>🐹 쓰담쓰담 보상</h2><div>${esc(hn())}가 오늘도 애쓴 진우를 쓰담쓰담~ 볼주머니에 아껴 둔 보답을 보상으로 준비했어요!</div></div>
  ${cpTabs()}${list||'<div class="empty">아직 보상이 없어요.</div>'}${cpg>1?`<div class="row sp" style="margin-bottom:22px"><button class="btn sm" onclick="cPg(-1)">◀ 이전</button><span class="muted">${cPage+1} / ${cpg}</span><button class="btn sm" onclick="cPg(1)">다음 ▶</button></div>`:''}
  <div class="card"><h2>📜 사용 내역</h2>${used||'<div class="empty">아직 사용한 보상이 없어요.</div>'}</div>`;
}
function cpForm(){const id='',c={emoji:'🎟️',name:'',desc:'',grade:'일반',qty:1,expire:''};   /* 이미 있는 보상은 고칠 수 없어요 (새 보상 넣기 전용) */
  modal(`<h3>${id?'보상 수정':'새 보상'}</h3>${cpTkMsg(id)}<label>이모지</label><input id="ce" maxlength="4" value="${esc(c.emoji)}" onfocus="cpHint('emo')"><label>이름</label><input id="cn" maxlength="40" value="${esc(c.name)}" onfocus="cpHint('name')"><label>설명</label><textarea id="cd" rows="2" maxlength="120" onfocus="cpHint('desc')">${esc(c.desc)}</textarea>
  <label>등급</label><select id="cg" onfocus="cpHint('grade')">${GRADES.map(g=>`<option ${g===c.grade?'selected':''}>${g}</option>`).join('')}</select><label>수량(장)</label><input id="cq" type="number" min="0" max="99" inputmode="numeric" onfocus="cpHint('qty')" value="${+c.qty||0}">
  <label>유효기간 (선택)</label><input id="cx" type="date" value="${esc(c.expire)}" onfocus="cpHint('exp')"><div class="row"><button class="btn ghost full" onclick="closeM()">취소</button><button class="btn full" onclick="cpSave()">저장</button></div>`);}
function cpSave(){const n=$('cn').value.trim();if(!n){toast('보상 이름을 넣어 주세요');cpHint('empty');return;}
  const o={emoji:$('ce').value.trim()||'🎟️',name:n,desc:$('cd').value.trim(),grade:$('cg').value,qty:Math.max(0,Math.min(99,parseInt($('cq').value)||0)),expire:$('cx').value};
  S.coupons.push({id:uid(),...o});
  save();closeM();rCoupon();toast('저장했어요');cpHint('saved');}
function cpUse(id){const c=S.coupons.find(x=>x.id===id);if(!c)return;
  if((+c.qty||0)<=0||expired(c)){toast('사용할 수 없는 보상이에요');return;}
  {const bad=c.fx?fxBad(c.fx):'';if(bad){toast(bad);sfx('no');return;}}
  askOk(`「${c.name}」 보상을 사용할까요? 1장이 차감돼요.`,()=>{
    const k=S.coupons.find(x=>x.id===id);if(!k||(+k.qty||0)<=0||expired(k))return;
    {const bad=k.fx?fxBad(k.fx):'';if(bad){toast(bad);return;}}
    k.qty=(+k.qty)-1;const fxm=k.fx?fxRun(k.fx):'';if(/운동 하루 쉬기/.test(k.name))S.exRest.push(todayStr());window.lastCp={name:k.name,date:todayStr(),left:k.qty};const u={id:uid(),emoji:k.emoji,name:k.name,date:todayStr(),left:k.qty};S.used.push(u);save();rCoupon();sfx('fan');fx('star',12);
    modal(`<div class="big">${esc(k.emoji)}</div><h3 style="text-align:center">사용 완료! 🎉</h3><div class="card" style="text-align:center"><div class="nm">${esc(k.name)}</div><div class="muted">${esc(u.date)} · 남은 ${k.qty}장</div></div>${fxm?`<div class="card" style="text-align:left">🐙 ${esc(fxm)}</div>`:''}<button class="btn wood full" style="margin-bottom:8px" onclick="cpShare()">📤 사용했다고 알리기</button><button class="btn full" onclick="closeM()">닫기</button>`);});}
/* ---------- 장소 도감 ---------- */
let pView='dex',pType='전체',pQ='',pPage=0;const PL_PAGE_SIZE=5;
function stars(n){return '★'.repeat(n)+'☆'.repeat(5-n);}
const ACT={mj:['마작','🀄','예: 반장전 3판, 2등 했어요','마작 모임'],bg:['보드게임','🎲','예: 카탄 4인, 처음 해 봤어요','보드게임 모임'],band:['밴드','🎸','예: 합주 2시간, 곡 파트 맞춰 봤어요','밴드 합주'],ex:['운동','💪','예: 러닝 30분, 헬스 상체','운동']},ACT_R=1;
let dSub='place';
function rPlace(){const T=[['place','장소'],['mj','마작'],['bg','보드게임'],['band','밴드'],['ex','운동'],['cal','달력'],['diary','일기'],['ach','업적']];
  $('s-place').innerHTML=`<div class="chips">${T.map(([k,l])=>`<button class="chip ${dSub===k?'on':''}" onclick="dSub='${k}';rPlace()">${l}</button>`).join('')}</div><div id="dbody"></div>`;
  if(dSub==='place')rPlaceDex();else if(dSub==='cal')rCal();else if(dSub==='diary')rDiary();else if(dSub==='ach')rAch();else rAct(dSub);}
const BADGE=[[3,'새싹',3],[10,'단골',7],[30,'프로',15]];
function actNext(k,clear){const v=clear?'':$('an').value;S.actNext[k]=v;save();toast(v?'일정을 저장했어요':'일정을 지웠어요');rPlace();}
function badgeChk(k){const c=S.act[k].length,g=S.actBadge[k]||(S.actBadge[k]=[]);let add=0,nm=[];BADGE.forEach(([n,b,r])=>{if(c>=n&&!g.includes(n)){g.push(n);add+=r;nm.push(b);}});if(!add)return'';S.acorns+=add;return ACT[k][0]+' '+nm.join('·')+' 뱃지 획득! 🌰+'+add;}
function actCard(){const t=todayStr(),ks=Object.keys(ACT),up=ks.filter(k=>S.actNext[k]&&S.actNext[k]>=t).sort((a,b)=>S.actNext[a]<S.actNext[b]?-1:1),ym=t.slice(0,7),cn=ks.map(k=>[ACT[k][0],S.act[k].filter(e=>e.date.slice(0,7)===ym).length]);
  if(!up.length&&!cn.some(x=>x[1]))return'';
  return `<div class="card"><h2>🎸 동호회 활동</h2>${up.map(k=>`<div class="q"><span>${ACT[k][1]} ${ACT[k][3]}<div class="muted">${S.actNext[k]}</div></span><span class="dd" style="font-size:calc(16px*var(--fs,1))!important;min-width:0">${ddLabel(S.actNext[k])}</span></div>`).join('')}<div class="muted" style="margin-top:6px">이번 달 ${cn.map(x=>x[0]+' '+x[1]+'회').join(' · ')}</div></div>`;}
function actFormX(k,e){
  if(k==='ex')return `<label>종류</label><select id="xt">${EXT.map(t=>`<option ${t===e.t?'selected':''}>${t}</option>`).join('')}</select><label>운동 시간 (분, 선택)</label><input id="xm" type="number" inputmode="numeric" min="0" max="1440" value="${e.min||''}">`;
  if(k==='mj')return `<label>순위</label><select id="xr"><option value="">기록 안 함</option>${[1,2,3,4].map(n=>`<option value="${n}" ${+e.rank===n?'selected':''}>${n}등</option>`).join('')}</select><label>점수 (선택)</label><input id="xs" type="number" inputmode="numeric" value="${e.score==null?'':e.score}">`;
  if(k==='bg')return `<label>게임 이름</label><input id="xg" maxlength="30" list="gl" value="${esc(e.game||'')}"><datalist id="gl">${S.bgames.map(g=>`<option value="${esc(g.name)}">`).join('')}</datalist>`;
  return `<label>연습 시간 (분, 선택)</label><input id="xm" type="number" inputmode="numeric" min="0" max="1440" value="${e.min||''}">`;}
function actGetX(k){if(k==='ex')return {t:$('xt').value,min:Math.max(0,Math.min(1440,parseInt($('xm').value)||0))};if(k==='mj'){const r=parseInt($('xr').value);return {rank:r>=1&&r<=4?r:0,score:$('xs').value===''?null:+$('xs').value};}
  if(k==='bg')return {game:$('xg').value.trim()};return {min:Math.max(0,Math.min(1440,parseInt($('xm').value)||0))};}
function actTag(k,e){let s='';if(k==='ex')s=esc(e.t||'')+(e.min?' · '+e.min+'분':'');else if(k==='mj'&&e.rank)s=e.rank+'등'+(e.score!=null?' · '+e.score+'점':'');else if(k==='bg'&&e.game)s='🎲 '+esc(e.game)+(e.nw?' · 신규!':'');else if(k==='band'&&e.min)s='연습 '+e.min+'분';if(e.q||e.what==='오늘 '+ACT[k][0]+' 했어요')s+=(s?' · ':'')+'⚡ 빠른 기록 (✏️로 내용을 채워 보세요)';return s?`<div class="muted">${s}</div>`:'';}
const HM=[[600,'연습 10시간',3],[1800,'연습 30시간',7],[6000,'연습 100시간',15]],SST=['연습 시작','합주 중','완성'];
function bandMin(){return S.act.band.reduce((a,e)=>a+(+e.min||0),0);}
function hourChk(){const t=bandMin(),g=S.actBadge.hm||(S.actBadge.hm=[]);let add=0,nm=[];HM.forEach(([n,b,r])=>{if(t>=n&&!g.includes(n)){g.push(n);add+=r;nm.push(b);}});if(!add)return'';S.acorns+=add;return nm.join('·')+' 달성! 🌰+'+add;}
function actExtra(k,L){
  if(k==='ex')return exExtra(L);
  if(k==='mj'){const r=L.filter(e=>e.rank),n=r.length,avg=n?(r.reduce((a,e)=>a+e.rank,0)/n).toFixed(2):'-',w=r.filter(e=>e.rank===1).length;
    return `<div class="card"><h2>마작 통계</h2><div class="row sp"><span>판수 <b class="qty">${n}</b></span><span>평균 순위 <b class="qty">${avg}</b></span><span>1등 <b class="qty">${w}회</b></span></div><div class="muted" style="margin-top:6px">최근 5판: ${r.slice(0,5).map(e=>e.rank+'등').join(' · ')||'아직 없어요'}</div></div>`;}
  if(k==='bg'){const pl=new Set(L.filter(e=>e.game).map(e=>e.game.toLowerCase())).size;
    return `<div class="card"><h2>보드게임 컬렉션</h2><div class="row sp"><span>보유 <b class="qty">${S.bgames.filter(g=>g.own).length}개</b></span><span>해 본 게임 <b class="qty">${pl}종</b></span><span>위시 <b class="qty">${S.bgames.filter(g=>!g.own).length}개</b></span></div><button class="btn full" style="margin:8px 0" onclick="bgForm()">+ 게임 추가</button>${S.bgames.map(g=>`<div class="q"><span>${g.own?'🎲':'⭐'} ${esc(g.name)}<div class="muted">${esc(g.pl||'?')}인 · ${esc(g.tm||'?')}분 · 난이도 ${'★'.repeat(g.df||1)}</div></span><button class="btn ghost sm" onclick="bgForm('${g.id}')">✏️</button></div>`).join('')}</div>`;}
  const t=bandMin(),nx=HM.find(h=>t<h[0]);
  return `<div class="card"><h2>연습 시간</h2><div>누적 <b class="qty">${Math.floor(t/60)}시간 ${t%60}분</b></div><div class="muted">${nx?'다음 목표 '+nx[1]+'까지 '+Math.ceil((nx[0]-t)/60)+'시간':'모든 연습 마일스톤 달성!'}</div></div>`+songCard();}
function bgForm(id){const g=S.bgames.find(x=>x.id===id)||{name:'',own:1,pl:'',tm:'',df:2};
  modal(`<h3>보드게임 ${id?'수정':'추가'}</h3><label>이름</label><input id="bn" maxlength="30" value="${esc(g.name)}"><label>구분</label><select id="bo"><option value="1" ${g.own?'selected':''}>보유</option><option value="0" ${g.own?'':'selected'}>사고 싶어요 (위시)</option></select><label>인원 (예: 2~4)</label><input id="bp" maxlength="8" value="${esc(g.pl)}"><label>플레이 시간 (분)</label><input id="bgt" type="number" inputmode="numeric" value="${esc(g.tm)}"><label>난이도</label><select id="bf">${[1,2,3,4,5].map(n=>`<option value="${n}" ${+g.df===n?'selected':''}>${'★'.repeat(n)}</option>`).join('')}</select><div class="row">${id?`<button class="btn ghost" onclick="bgDel('${id}')">삭제</button>`:''}<button class="btn ghost full" onclick="closeM()">취소</button><button class="btn full" onclick="bgSave('${id||''}')">저장</button></div>`);}
function bgSave(id){const n=$('bn').value.trim();if(!n){toast('이름을 적어 주세요');return;}const v={name:n,own:+$('bo').value,pl:$('bp').value.trim(),tm:$('bgt').value.trim(),df:+$('bf').value},g=S.bgames.find(x=>x.id===id);if(g)Object.assign(g,v);else S.bgames.push({id:uid(),...v});save();closeM();toast('저장했어요');rPlace();}
function bgDel(id){askOk('이 게임을 삭제할까요?',()=>{S.bgames=S.bgames.filter(x=>x.id!==id);save();rPlace();});}
function songCard(){const c=S.songs.filter(s=>s.st===2).length;
  return `<div class="card"><h2>곡 목록</h2><div class="muted">완성한 곡 ${c} / ${S.songs.length}</div><button class="btn full" style="margin:8px 0" onclick="songForm()">+ 곡 추가</button>${S.songs.map(s=>`<div class="q"><span>${s.st===2?'⭐':'🎸'} ${esc(s.name)}<div class="muted">${SST[s.st]}</div></span><span class="row"><button class="btn ghost sm" onclick="songForm('${s.id}')">✏️</button>${s.st<2?`<button class="btn sm" onclick="songUp('${s.id}')">${s.st?'완성!':'합주 중'}</button>`:''}</span></div>`).join('')||'<div class="empty">연습 중인 곡을 추가해 보세요.</div>'}</div>`;}
function songUp(id){const s=S.songs.find(x=>x.id===id);if(!s||s.st>=2)return;s.st++;let m='합주 단계로 올라갔어요';sfx('coin');
  if(s.st===2){const td=todayStr();if(S.actRw.d!==td)S.actRw={d:td,done:{}};m='곡 하나 완성! 멋져요';if(!S.actRw.done.song){S.actRw.done.song=1;S.acorns+=ECO.song;m='🌰 +'+ECO.song+' 곡 완성! 토리가 기립박수';}sfx('fan');fx('star',14);}
  save();toast(m);rPlace();}
function songForm(id){const s=S.songs.find(x=>x.id===id)||{name:'',st:0};modal(`<h3>곡 ${id?'수정':'추가'}</h3><label>곡 이름</label><input id="sn" maxlength="40" value="${esc(s.name)}"><label>단계</label><select id="ss">${SST.map((t,i)=>`<option value="${i}" ${s.st===i?'selected':''}>${t}</option>`).join('')}</select><div class="row">${id?`<button class="btn ghost" onclick="songDel('${id}')">삭제</button>`:''}<button class="btn ghost full" onclick="closeM()">취소</button><button class="btn full" onclick="songSave('${id||''}')">저장</button></div>`);}
function songSave(id){const n=$('sn').value.trim();if(!n){toast('곡 이름을 적어 주세요');return;}const st=+$('ss').value,o=S.songs.find(x=>x.id===id);const pv=o?o.st:-1;if(o){o.name=n;o.st=st;}else S.songs.push({id:uid(),name:n,st});save();closeM();toast('저장했어요');rPlace();takoSongRec(pv,n,st);}
function songDel(id){askOk('이 곡을 삭제할까요?',()=>{S.songs=S.songs.filter(x=>x.id!==id);save();rPlace();});}
function lucky(){const td=todayStr();if(S.luckyD===td||Math.random()>=ECO.luckyP)return;S.luckyD=td;S.acorns+=ECO.lucky;setTimeout(()=>{toast('🍀 럭키 도토리! 🌰 +'+ECO.lucky+' 보너스');sfx('fan');fx('star',12);},900);}
function quickAct(k){if(actGot(k)){toast('오늘은 이미 기록했어요. 도감에서 내용을 채워 보세요');return;}
  const td=todayStr();if(S.actRw.d!==td)S.actRw={d:td,done:{}};const r=actPay(k);S.actRw.done[k]=1;S.act[k].push({id:uid(),date:td,what:'오늘 '+ACT[k][0]+' 했어요',pride:'',q:1});starChk(k,td);
  S.acorns+=r;if(r)lucky();const bd=[badgeChk(k),exHook(k)].filter(Boolean).join(' / ');save();sfx('fan');fx('star',10);toast(r?'🌰 +'+r+' 기록 완료! 토리가 박수 짝짝짝':'기록 완료! 오늘 활동 도토리는 다 받았어요');render();
  if(bd)setTimeout(()=>modal(`<div class="big">⭐</div><h3 style="text-align:center">뱃지 획득!</h3><div class="card" style="text-align:center">${esc(bd)}</div><button class="btn full" onclick="closeM()">야호!</button>`),800);}
function quickCard(){return `<div class="card"><h2>오늘 빠른 기록</h2><div class="row" style="flex-wrap:wrap">${Object.keys(ACT).map(k=>`<button class="btn sm ${actGot(k)?'ghost':''}" style="flex:1 1 0;min-width:max-content" onclick="quickAct('${k}')">${actGot(k)?'✔ ':''}${ACT[k][0]}</button>`).join('')}</div><div class="muted" style="margin-top:6px">한 번 누르면 기록 + 도토리! 자세한 건 도감에서 채워요.</div></div>`;}
function reportCard(){const t=todayStr(),d=+t.slice(8,10);if(d>7)return'';const y=+t.slice(0,4),m=+t.slice(5,7),pm=m===1?(y-1)+'-12':y+'-'+String(m-1).padStart(2,'0');
  const cn=Object.keys(ACT).map(k=>[ACT[k][0],S.act[k].filter(e=>e.date.slice(0,7)===pm).length]),tot=cn.reduce((a,x)=>a+x[1],0);if(!tot)return'';
  const mn=S.act.band.filter(e=>e.date.slice(0,7)===pm).reduce((a,e)=>a+(+e.min||0),0);
  return `<div class="card legend"><h2>📅 ${+pm.slice(5)}월 리포트</h2>${cn.map(x=>`<div class="row sp"><span>${x[0]}</span><span class="qty">${x[1]}회</span></div>`).join('')}${mn?`<div class="row sp"><span>밴드 연습</span><span class="qty">${Math.floor(mn/60)}시간 ${mn%60}분</span></div>`:''}<div style="margin-top:6px">${esc(hn())}: 지난달 총 ${tot}번이나 해냈어! 진우 정말 멋져 ⭐</div></div>`;}
function memCard(){const a=[];Object.keys(ACT).forEach(k=>S.act[k].forEach(e=>{if(e.pride)a.push(e);}));if(!a.length)return'';const d=Math.floor(Date.parse(todayStr()+'T00:00:00Z')/864e5),e=a[d%a.length];
  return `<div class="card"><h2>⭐ 오늘의 뿌듯한 줄</h2><div>⭐ ${esc(e.pride)}</div><div class="muted">${esc(e.date)}의 진우</div></div>`;}
function toriStyle(){const ym=todayStr().slice(0,7),c=Object.keys(ACT).map(k=>[k,S.act[k].filter(e=>e.date.slice(0,7)===ym).length]).sort((a,b)=>b[1]-a[1])[0];return c&&c[1]>0?{e:ACT[c[0]][1],t:ACT[c[0]][0]+' 토리'}:null;}
function toriLine(){const s=toriStyle();return s?`<div class="muted">이번 달 스타일: ${s.e} ${s.t}</div>`:'';}
const PATS=['찍찍~ 기분 좋아!','볼이 말랑말랑해요','도토리 하나만 더…','쓰담쓰담 좋아요 🐹','꾹꾹, 마사지 최고!','헤헤, 간지러워!','진우 손은 따뜻해서 좋아','거기, 거기가 시원해요','오늘도 곁에 있어 줘서 고마워','더 해 주세요… 조금만 더!','토리는 진우가 제일 좋아 ⭐','앗, 수염은 살살!','뒹굴뒹굴~ 행복해요','찍! 오늘 기분 최고!','쓰다듬어 주니까 기운이 나요','꼬물꼬물… 기분 좋다','볼을 살짝 눌러 주세요!','헤헤, 진우 손 최고!','오늘도 잘하고 있어요, 진우!','쓰담쓰담 받으면 힘이 나요','진우가 있어서 든든해요','도토리 냄새가 나요… 킁킁','해바라기씨 하나만 더 주세요','배부르면 낮잠 자고 싶어요 😴','기타 소리 들으면서 쓰담쓰담 받고 싶어요 🎸','마작 이기고 오면 두 배로 쓰다듬어 줘요!','앗, 방금 수염 스쳤어요! 간지러워요','더 쓰다듬으면 쳇바퀴 백 바퀴 돌 거예요'];
function pat(){if(dMv!=null)return;const td=todayStr();if(!S.patD||S.patD.d!==td)S.patD={d:td,n:0,got:0,rare:0};const P=S.patD;P.n++;const md=mood()[1];let m;
  if(md==='sleep')m='쿨쿨… 자면서도 배시시 웃어요';
  else if(md==='hungry'&&Math.random()<.4)m='배고파요… 도토리 주세요!';
  else if(P.n%5===0)m='간지러워요! 헤헤헤헤';
  else if(!P.rare&&!P.got&&Math.random()<.08){P.rare=1;P.got=1;S.acorns+=ECO.pat;m='토리가 도토리를 슬쩍 건네줬어요! 🌰 +'+ECO.pat;fx('acorn',2);}
  else m=PATS[Math.floor(Math.random()*PATS.length)];
  if(P.n===10&&!P.got){P.got=1;S.acorns+=ECO.pat;m+=' · 쓰담쓰담 10번 보너스 🌰 +'+ECO.pat;sfx('fan');}else sfx('coin');
  if(md!=='sleep'){const nw=Date.now();patS=nw-patS.t>900?{n:1,t:nw}:{n:patS.n+1,t:nw};const c=patS.n;
    if(c>=6&&!/🌰/.test(m)){if(c>=16){m='그만!! 진짜 화났어요! 💢';rx('angry');}else if(c>=11){m='흥! 삐졌어요… 그만 만져요 😒';rx('sulk');}else{m='아야! 너무 세게 만지면 슬퍼요… 😢';rx('sad2');}}else rx('pat');}
  save();toast('🐹 '+hn()+': '+m);fx('star',4);const hc=document.querySelector('.card.hero'),im=hc&&hc.querySelector('.timg');if(hc&&im){hc.style.setProperty('--pto','50% '+Math.round(im.offsetHeight/2)+'px');hc.classList.remove('pt');void hc.offsetWidth;hc.classList.add('pt');}}
async function icsDl(){const h=$('rh').value,t=todayStr().replace(/-/g,''),ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//JWDiary//KR','BEGIN:VEVENT','UID:jwdiary-remind@local','DTSTAMP:'+t+'T000000Z','DTSTART:'+t+'T'+h+'0000','DTEND:'+t+'T'+h+'1000','RRULE:FREQ=DAILY','SUMMARY:토리가 기다려요! 오늘 기록 남기기','DESCRIPTION:JW Diary 열어서 도토리 받기','BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:토리가 기다려요','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n')+'\r\n';
  const nm='jw-diary-reminder.ics';
  if(/iP(hone|ad|od)/.test(navigator.userAgent)){try{const f=new File([ics],nm,{type:'text/calendar'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'JW Diary 알림'});toast('캘린더 앱으로 열어 추가해 주세요');return;}}catch(e){if(e&&e.name==='AbortError')return;}}
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar;charset=utf-8'}));a.download=nm;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);toast('내려받은 파일을 열어 캘린더에 추가해 주세요');}
const MGS={a:["..kkkk..",".kddddk.","kddddddk",".kbbbbk.",".kbbbbk.","..kbbk..","...kk...","........"],g:["..kkkk..",".kYYYYk.","kYYYYYYk",".kyyyyk.",".kyyyyk.","..kyyk..","...kk...","........"],r:["........","..kkkk..",".kssssk.","kssttssk","kssssssk",".kkkkkk.","........","........"],h:[".k....k.","kpk..kpk","kbbbbbbk","kbkbbkbk","kbbppbbk",".kwwwwk.","..kkkk..","........"]};
const MGP={k:'#4a3423',d:'#9a6b3c',b:'#d9b98a',Y:'#d99a2b',y:'#f4c542',s:'#b5b5b5',t:'#8a8a8a',p:'#f2a9b6',w:'#fffaf0'};
function mgList(){const G=[['🌰','도토리 받기','떨어지는 도토리를 바구니로 받아요. 돌은 피하세요!','mgOpen()'],['🐙','타코 띄워 주기','화면을 꾹 눌러 타코를 띄워 주세요. 바위와 해파리는 피해 헤엄치고, 수면에 5초 붙어 있으면 지쳐요!','mg2Open()'],['🎸','기타리스트','음표가 노란 선에 닿을 때 그 줄을 탭해요. 토리와 타코가 응원해요!','mg3Open()'],['🐹','토리의 챗바퀴','박자에 맞춰 탭하면 토리가 빨리 달려요. 30초 동안 몇 바퀴 도는지 겨뤄요!','mg4Open()'],['📺','테토리스','옛날 TV 리모컨으로 블록을 쌓아요. 가로 한 줄을 꽉 채우면 사라져요! 10줄이면 도토리 1개, 25줄이면 2개.','tetOpen()']].concat(halWeek()?[['👻','유령 잡기 · 할로윈 주간','호박 등불에서 튀어나오는 유령을 탭해서 잡아요! 보라 유령은 3점, 박쥐를 누르면 -2점. 10월 25~31일에만 열려요.','mg5Open()'],['🎃','토리의 사탕 미로 · 할로윈 주간','마녀 모자를 쓴 토리를 손가락으로 밀어 움직여 사탕을 모아요. 호박 등불을 먹으면 유령이 겁먹어서 잡을 수 있어요! 10월 25~31일에만 열려요.','mg6Open()']]:[]).concat(mjWeek()?[['🀄','마작패 짝 맞추기 · 11월 마지막 주','진짜 마작패 20장을 두 장씩 뒤집어 같은 패를 찾아요. 시도가 적을수록 별이 많아요. 11월 24~30일에만 열려요.','mg7Open()']]:[]).concat(xmWeek()?[['🎅','루돌프 썰매 배달 · 크리스마스 주간','탭하면 썰매에서 선물이 떨어져요. 굴뚝에 쏙 넣어 주세요! 루돌프 코가 반짝일 때 넣으면 2배. 12월 18~25일에만 열려요.','mg8Open()'],['🎄','도망가는 루돌프를 잡아라! · 크리스마스 주간','손가락을 끌면 산타 모자 토리가 그쪽으로 달려요. 도망가는 루돌프를 잡으면 선물이 떨어져요! 눈더미에선 느려지고 얼음판은 미끄러워요. 당근을 주우면 루돌프가 3초 느려져요. 45초 동안 3마리면 도토리 1개, 6마리면 2개. 12월 18~25일에만 열려요.','mg9Open()']]:[]);
  return `<div class="mg-grid">${G.map(g=>`<button class="mg-square" onclick="${g[3]}" aria-label="${g[1]}. ${g[2]}"><span class="mg-square-icon">${g[0]}</span><b>${g[1].split(' · ')[0]}</b><small>${g[1].includes(' · ')?g[1].split(' · ')[1]:'탭해서 시작'}</small></button>`).join('')}</div>`;}


let mjLoadTimer=0,mjOverflow='';
// Each scene preserves its aspect ratio and owns five localized comparison patches.
const DF={stage:0,page:0,found:[],hint:-1,zoom:false,observer:null,takoTimer:null,scale:1};
const DF_SCENES=[
 {id:'strawberry-teaparty',name:'냐옹이와 도치의 딸기 티파티',original:'images/scenes/df-teaparty-v92.webp',edited:'images/scenes/df-teaparty-changes-v92.webp',spots:[
  {x:129,y:146,r:23,n:'바구니 리본',box:[111,123,35,47]},
  {x:17,y:216,r:18,n:'꽃병 리본',box:[3,201,30,30]},
  {x:170,y:162,r:9,n:'도치 코의 크림',box:[164,157,12,9]},
  {x:76,y:251,r:15,n:'탁자 위 딸기',box:[63,241,25,20]},
  {x:147,y:71,r:10,n:'하늘의 꽃잎',box:[140,67,14,9]}]},
 {id:'acorn-cookie-workshop',name:'토리와 타코의 도토리 쿠키 공방',original:'images/scenes/df-kitchen-v92.webp',edited:'images/scenes/df-kitchen-changes-v92.webp',spots:[
  {x:201,y:22,r:14,n:'시계 바늘',box:[193,13,18,13]},
  {x:159,y:82,r:12,n:'벽에 걸린 숟가락',box:[153,75,13,14]},
  {x:12,y:161,r:18,n:'쿠키 병 리본',box:[0,147,25,30]},
  {x:186,y:111,r:11,n:'타코 모자의 장식',box:[179,105,14,13]},
  {x:42,y:284,r:18,n:'작은 다람쥐 장식',box:[24,267,36,33]}]},
 {"id":"starlight-library","name":"부엉박사와 냐옹이의 별빛 도서관","width":1122,"height":838,"original":"images/scenes/df-library-v97.webp","edited":"images/scenes/df-library-changes-v97.webp","spots":[{"x":19.679,"y":46.845,"r":15.294,"n":"매달린 달 장식","box":[6.84492,32.94118,25.66845,27.80749]},{"x":222.032,"y":79.037,"r":8.235,"n":"등불의 리본","box":[214.54545,71.65775,14.97326,14.75936]},{"x":196.364,"y":136.257,"r":10.824,"n":"모래시계의 모래","box":[189.51872,126.41711,13.68984,19.67914]},{"x":30.374,"y":174.759,"r":7.059,"n":"책의 책갈피","box":[23.95722,170.26738,12.83422,8.98396]},{"x":215.294,"y":159.893,"r":15.647,"n":"쿠션의 별 자수","box":[201.06952,149.94652,28.4492,19.89305]}]},
 {"id":"glass-garden","name":"토리·타코·도치의 유리 온실 정원","width":1122,"height":838,"original":"images/scenes/df-garden-v97.webp","edited":"images/scenes/df-garden-changes-v97.webp","spots":[{"x":46.631,"y":31.979,"r":14.941,"n":"매달린 종","box":[34.0107,18.39572,25.24064,27.16578]},{"x":207.807,"y":28.77,"r":18.706,"n":"나비의 날개","box":[191.01604,11.76471,33.58289,34.0107]},{"x":18.503,"y":100.107,"r":17.647,"n":"기둥의 리본","box":[4.70588,84.06417,27.59358,32.08556]},{"x":208.128,"y":131.658,"r":10.471,"n":"화분의 꽃잎","box":[198.71658,122.13904,18.82353,19.03743]},{"x":45.455,"y":166.631,"r":13.294,"n":"바닥의 장갑","box":[33.36898,158.93048,24.17112,15.40107]}]}
].map(s=>typeof DF_HARD!=='undefined'&&DF_HARD[s.id]?{...s,...DF_HARD[s.id]}:s).concat(typeof DF_MORE==='undefined'?[]:DF_MORE);// 추가 장면 30개·예전 장면의 어려운 그림(DF_HARD)은 data/difference.js
const DF_ART=new Map();
function dfRatio(){const s=DF_SCENES[DF.stage];return (s.width||1122)/(s.height||1402);}
function dfHeight(){return 240/dfRatio();}
function dfSpots(){return DF_SCENES[DF.stage].spots;}
function dfArtLoad(){const scene=DF_SCENES[DF.stage],id=scene.id;if(DF_ART.has(id))return DF_ART.get(id);const art={ready:false,error:false};DF_ART.set(id,art);Promise.all([scene.original,scene.edited].map(src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src;}))).then(imgs=>{art.imgs=imgs;art.ready=true;if(DF_ART.get(id)===art&&$('df-c0')&&DF_SCENES[DF.stage].id===id)dfPaint();}).catch(()=>{art.error=true;if(DF_ART.get(id)===art&&$('df-note')&&DF_SCENES[DF.stage].id===id){$('df-note').textContent='그림을 불러오지 못했어요. 아래 다시 불러오기를 눌러 주세요.';$('df-retry').hidden=false;}});return art;}
function dfRetry(){DF_ART.delete(DF_SCENES[DF.stage].id);$('df-retry').hidden=true;$('df-note').textContent='그림을 다시 불러오는 중…';dfPaint();}
// Keep full images and native-resolution backing pixels; CSS size never sets game coordinates.
function dfOrientationNote(){return dfRatio()<1?'타코: 위아래로 내려 보면서 찾아보자코!':'타코: 작은 소품도 함께 살펴보자코!';}
function dfFit(){const pair=document.querySelector('#bgo .df-pair');if(!pair)return;const r=pair.getBoundingClientRect(),ratio=dfRatio(),width=Math.max(1,r.width*(DF.zoom?DF.scale:1));pair.style.gridTemplateColumns='1fr';pair.style.gridTemplateRows=width/ratio+'px '+width/ratio+'px';pair.style.alignContent='start';pair.style.justifyContent='start';[0,1].forEach(i=>{const c=$('df-c'+i);c.style.width=width+'px';c.style.height=(width/ratio)+'px';const scene=DF_SCENES[DF.stage],nw=scene.width||1122,nh=scene.height||1402;if(c.width!==nw||c.height!==nh){c.width=nw;c.height=nh;dfPaint();}});}
function dfZoom(){if(!DF.zoom&&!dfArtLoad().ready){$('df-note').textContent='그림을 다 불러오면 크게볼 수 있어요.';return;}DF.zoom=!DF.zoom;DF.scale=1;if(DF.zoom){dfTakoClear();DF.hint=-1;}$('bgo').classList.toggle('df-focus',DF.zoom);$('df-return').hidden=!DF.zoom;dfPaint();dfFit();}
// Pinch and drag change only the view; taps still use the original picture coordinates.
function dfBindGestures(pair){const points=new Map();let pinch=null,drag=null,moved=false;
 const distance=()=>{const a=Array.from(points.values());return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);};
 pair.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(points.size===1){moved=false;drag={x:e.clientX,y:e.clientY,left:pair.scrollLeft||0,top:pair.scrollTop||0,target:e.target};}if(DF.zoom){pair.setPointerCapture(e.pointerId);if(points.size===2){const a=Array.from(points.values()),r=pair.getBoundingClientRect(),x=(a[0].x+a[1].x)/2-r.left,y=(a[0].y+a[1].y)/2-r.top;pinch={distance:distance(),scale:DF.scale,x:(pair.scrollLeft+x)/DF.scale,y:(pair.scrollTop+y)/DF.scale};moved=true;}}});
 pair.addEventListener('pointermove',e=>{if(!points.has(e.pointerId))return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(drag&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6)moved=true;if(!DF.zoom)return;e.preventDefault();if(pinch&&points.size>=2){const a=Array.from(points.values()),r=pair.getBoundingClientRect();DF.scale=Math.max(1,Math.min(4,pinch.scale*distance()/Math.max(1,pinch.distance)));dfFit();pair.scrollLeft=pinch.x*DF.scale-((a[0].x+a[1].x)/2-r.left);pair.scrollTop=pinch.y*DF.scale-((a[0].y+a[1].y)/2-r.top);}else if(drag&&points.size===1){pair.scrollLeft=drag.left+drag.x-e.clientX;pair.scrollTop=drag.top+drag.y-e.clientY;}});
 const end=e=>{const target=drag&&drag.target;if(e.type==='pointerup'&&!moved&&points.size===1&&target&&target.classList.contains('df-image')){const r=target.getBoundingClientRect();dfTap((e.clientX-r.left)/r.width*240,(e.clientY-r.top)/r.height*dfHeight());}points.delete(e.pointerId);pinch=null;if(!points.size){drag=null;moved=false;}else{const a=Array.from(points.values())[0];drag={x:a.x,y:a.y,left:pair.scrollLeft,top:pair.scrollTop,target:null};moved=true;}};
 pair.addEventListener('pointerup',end);pair.addEventListener('pointercancel',end);
}
// Only completion lives in S: no reward or other game fields are changed.
function dfDone(id){return !!(S.dfCompleted&&S.dfCompleted[id]===true);}
function dfOrder(){return DF_SCENES.map((scene,stage)=>({scene,stage})).filter(v=>!dfDone(v.scene.id)).concat(DF_SCENES.map((scene,stage)=>({scene,stage})).filter(v=>dfDone(v.scene.id)));}
function dfOpen(){bgStop();DF.page=0;DF.zoom=false;dfSelect();}
function dfPickerFit(){const slot=document.querySelector('.df-cover-slot'),cover=document.querySelector('.df-cover');if(!slot||!cover)return;const scene=dfOrder()[DF.page].scene,r=slot.getBoundingClientRect(),ratio=(scene.width||1122)/(scene.height||1402);cover.style.width=Math.max(0,Math.min(r.width,Math.max(0,r.height-4)*ratio+4))+'px';}
/* v1.2.5: 고르는 화면에서 이 그림의 바뀐 그림과 다음 그림을 미리 받아 두면 시작·넘기기가 바로 떠요 */
const DF_WARM=new Set();function dfWarm(a){a.forEach(src=>{if(!src||DF_WARM.has(src))return;DF_WARM.add(src);const i=new Image();i.decoding='async';i.src=src;});}
function dfSelect(id){dfTakoClear();if(DF.observer){DF.observer.disconnect();DF.observer=null;}const order=dfOrder();if(id){const page=order.findIndex(v=>v.scene.id===id);if(page>=0)DF.page=page;}DF.page=Math.max(0,Math.min(DF.page,order.length-1));const {scene,stage}=order[DF.page],done=dfDone(scene.id),body=bgShell('그림 선택',()=>bgStart());$('bgo').classList.add('df-selecting');body.innerHTML=`<section class="df-picker" aria-label="그림 선택"><h4>${scene.name}</h4><p class="df-status ${done?'done':''}" aria-live="polite">${done?'완료 · '+scene.spots.length+'곳을 모두 찾았어요':'미완료 · 다른 곳 '+scene.spots.length+'개를 찾아봐요'}</p><p id="df-select-note" class="df-select-note" aria-live="polite">그림을 누르거나 아래 시작 버튼을 눌러요.</p><p class="muted">${DF.page+1} / ${order.length} · 완료한 그림은 뒤에서 다시 즐길 수 있어요.</p><div class="df-cover-slot"><button class="df-cover" onclick="dfStart(${stage})" aria-label="${scene.name} ${done?'다시 플레이':'시작'}"><img id="df-cover" src="${scene.original}" width="${scene.width||1122}" height="${scene.height||1402}" alt="${scene.name}" decoding="async"></button></div><nav class="df-pages" aria-label="그림 페이지"><button class="btn ghost sm" onclick="dfPage(-1)" aria-label="이전 그림">◀</button><span class="df-page-numbers">${order.map((v,i)=>({v,i})).slice(Math.floor(DF.page/5)*5,Math.floor(DF.page/5)*5+5).map(({v,i})=>`<button class="btn ghost sm ${i===DF.page?'df-current':''}" onclick="dfPageTo(${i})" ${i===DF.page?'aria-current="page"':''} aria-label="${i+1}페이지 · ${v.scene.name}">${i+1}</button>`).join('')}</span><button class="btn ghost sm" onclick="dfPage(1)" aria-label="다음 그림">▶</button></nav><button id="df-cover-retry" class="btn ghost sm" onclick="dfSelect()" hidden>그림 다시 불러오기</button><button class="btn wood full df-start" onclick="dfStart(${stage})">${done?'이 그림 다시 하기':'이 그림 시작'}</button></section>`;const img=$('df-cover');dfPickerFit();img.onload=()=>{dfPickerFit();dfWarm([scene.edited,order[(DF.page+1)%order.length].scene.original]);};if(typeof ResizeObserver!=='undefined'){DF.observer=new ResizeObserver(dfPickerFit);DF.observer.observe(document.querySelector('.df-cover-slot'));}img.onerror=()=>{if($('df-cover')!==img)return;$('df-select-note').textContent='그림을 불러오지 못했어요. 다시 불러오기를 눌러 주세요.';$('df-cover-retry').hidden=false;};}
function dfPage(delta){DF.page=(DF.page+delta+DF_SCENES.length)%DF_SCENES.length;dfSelect();}
function dfPageTo(page){DF.page=page;dfSelect();}
function dfStart(stage){if(!DF_SCENES[stage])return;DF.stage=stage;DF.zoom=false;dfShow();}
function dfShow(){dfTakoClear();if(DF.observer){DF.observer.disconnect();DF.observer=null;}DF.found=[];DF.hint=-1;const body=bgShell('틀린 그림 찾기',()=>bgStart());$('bgx').textContent='◀ 그림 선택';$('bgx').onclick=()=>dfSelect(DF_SCENES[DF.stage].id);$('bgo').classList.add('df-playing');body.innerHTML=`<div class="df-play"><button id="df-return" class="df-return" onclick="dfZoom()" aria-label="게임으로 돌아가기" hidden>↩</button><div class="df-score" id="df-score"></div><div class="df-pair" style="grid-template-columns:1fr 1fr">${[0,1].map(i=>`<div><canvas width="${DF_SCENES[DF.stage].width||1122}" height="${DF_SCENES[DF.stage].height||1402}" style="aspect-ratio:${dfRatio()};image-rendering:auto" class="df-image" id="df-c${i}" role="img" aria-label="${i?'다른 곳을 찾을 비교':'기준'} 그림"></canvas></div>`).join('')}</div><p class="df-note" id="df-note" aria-live="polite">두 그림에서 다른 곳을 눌러요. 어느 쪽 그림을 눌러도 돼요!</p><button class="btn ghost sm" id="df-retry" onclick="dfRetry()" hidden>다시 불러오기</button><div class="df-controls"><button class="btn ghost" id="df-zoom" onclick="dfZoom()">크게보기</button><button class="btn ghost" id="df-tako" onclick="dfTako()">타코에게<br>물어보기</button><button class="btn wood" id="df-next" onclick="dfNext()">그림 선택</button></div></div>`;dfBindGestures(document.querySelector('#bgo .df-pair'));$('df-note').textContent=dfOrientationNote()+' 크게보기에서 두 손가락으로 확대할 수 있어요.';dfPaint();dfFit();if(typeof ResizeObserver!=='undefined'){DF.observer=new ResizeObserver(dfFit);DF.observer.observe(document.querySelector('#bgo .df-pair'));}}
function dfPaint(){const scene=DF_SCENES[DF.stage],art=dfArtLoad();$('df-score').textContent=scene.name+' · '+DF.found.length+' / '+scene.spots.length;if(art.error){$('df-retry').hidden=false;$('df-note').textContent='그림을 불러오지 못했어요. 아래 다시 불러오기를 눌러 주세요.';}[0,1].forEach(side=>{const c=$('df-c'+side),x=c.getContext('2d'),h=dfHeight();x.setTransform(c.width/240,0,0,c.height/h,0,0);x.clearRect(0,0,240,h);x.fillStyle='#faeedb';x.fillRect(0,0,240,h);if(!art.ready){x.fillStyle='#654733';x.font='12px Galmuri11';x.textAlign='center';x.fillText(art.error?'다시 불러오기를 눌러 주세요':'그림을 불러오는 중…',120,h/2);return;}x.drawImage(art.imgs[0],0,0,240,h);if(side){for(const {box:[bx,by,bw,bh]} of scene.spots){x.save();x.beginPath();x.rect(bx,by,bw,bh);x.clip();x.drawImage(art.imgs[1],0,0,240,h);x.restore();}}for(const i of DF.found){const p=scene.spots[i];x.strokeStyle='#3c7656';x.lineWidth=2;x.beginPath();x.arc(p.x,p.y,p.r,0,Math.PI*2);x.stroke();}if(DF.hint>=0){const p=scene.spots[DF.hint];x.strokeStyle='#a76a18';x.lineWidth=2;x.setLineDash([4,3]);x.strokeRect(p.x-p.r,p.y-p.r,p.r*2,p.r*2);x.setLineDash([]);}});}
function dfTap(x,y){if(!dfArtLoad().ready)return;const i=dfHit(x,y);if(i<0){$('df-note').textContent='그곳은 같아요. 작은 소품도 살펴봐요.';return;}if(DF.found.includes(i)){$('df-note').textContent='이미 찾은 곳이에요! 다른 곳도 찾아볼까요?';return;}DF.found.push(i);if(DF.hint===i)DF.hint=-1;dfPaint();$('df-note').textContent=DF.found.length===dfSpots().length?'다 찾았어요! 친구들도 함께 기뻐해요.':'찾았다! '+dfSpots()[i].n+dfJosa(dfSpots()[i].n)+' 달라요.';if(DF.found.length===dfSpots().length){S.dfCompleted=S.dfCompleted&&typeof S.dfCompleted==='object'&&!Array.isArray(S.dfCompleted)?S.dfCompleted:{};S.dfCompleted[DF_SCENES[DF.stage].id]=true;const saved=save();$('df-next').disabled=false;$('df-next').textContent='다른 그림 고르기';if(!saved)$('df-note').textContent='다 찾았어요! 완료 기록을 저장하지 못했어요. 설정의 저장 공간 안내를 확인해 주세요.';}}
// 정답 원이 겹치면 아직 못 찾은 곳 → 중심에 가까운 곳 순으로 고름
function dfHit(x,y){let best=-1,bk=Infinity;dfSpots().forEach((p,i)=>{const d=Math.hypot(x-p.x,y-p.y);if(d>p.r)return;const k=(DF.found.includes(i)?1e6:0)+d/p.r;if(k<bk){bk=k;best=i;}});return best;}
// 받침이 있으면 '이', 없으면 '가' (예: 모자가, 리본이)
function dfJosa(w){const c=w.charCodeAt(w.length-1)-0xac00;return c>=0&&c<11172&&c%28?'이':'가';}
function dfTakoClear(){if(DF.takoTimer!==null){clearTimeout(DF.takoTimer);DF.takoTimer=null;}}
function dfTako(){if(DF.zoom)dfZoom();if(!dfArtLoad().ready){$('df-note').textContent='타코: 그림을 불러오면 같이 찾아보자코!';return;}const i=dfSpots().findIndex((p,j)=>!DF.found.includes(j));if(i<0){$('df-note').textContent='타코: 이미 다 찾았네! 다른 그림도 함께 해보자코!';return;}dfTakoClear();DF.hint=i;const p=dfSpots()[i],vertical=p.y<dfHeight()/3?'위쪽':p.y<dfHeight()*2/3?'가운데':'아래쪽',horizontal=p.x<80?'왼쪽':p.x<160?'중앙':'오른쪽';$('df-note').textContent='타코: '+vertical+' '+horizontal+'의 '+p.n+'! 점선 안을 눌러보자코!';dfPaint();DF.takoTimer=setTimeout(()=>{DF.takoTimer=null;if(DF.hint===i){DF.hint=-1;if($('df-c0'))dfPaint();}},6000);}
function dfNext(){if(DF.found.length===dfSpots().length){DF.page=0;dfSelect();}else dfSelect(DF_SCENES[DF.stage].id);}

function mjRoomOpen(){if($('mjroom'))return;bgStop();mjOverflow=document.body.style.overflow;const o=document.createElement('div');o.id='mjroom';o.style.cssText='position:fixed;inset:0;z-index:75;background:#f3ead7;display:flex;flex-direction:column;padding-top:env(safe-area-inset-top,0px)';o.innerHTML='<div style="padding:6px 10px;flex:none"><button class="btn ghost sm mj-room-exit" onclick="mjRoomClose()">◀ 마작방 나가기</button></div><div id="mjload" style="padding:12px;text-align:center">마작방을 열고 있어요…</div><iframe title="토리네 마작방" style="width:100%;flex:1;border:0;min-height:0" allow="autoplay"></iframe>';document.body.appendChild(o);document.body.style.overflow='hidden';mjRoomLoad();}
function mjRoomLoad(){clearTimeout(mjLoadTimer);const o=$('mjroom');if(!o)return;const f=o.querySelector('iframe'),q=new URLSearchParams({sound:S.snd?'1':'0',music:S.bgmOn?'1':'0',sv:String((S.sv??50)/100),mv:String((S.vol??35)/100)});$('mjload').hidden=false;$('mjload').textContent='마작방을 열고 있어요…';f.src='games/tori-mahjong/tori-mahjong-game.html#'+q.toString();mjLoadTimer=setTimeout(()=>{if($('mjroom')===o){$('mjload').innerHTML='마작방을 열지 못했어요. 연결을 확인한 뒤 다시 눌러 주세요.<br><button class="btn sm" onclick="mjRoomLoad()">다시 열기</button>';}},12000);}
window.addEventListener('message',e=>{const f=$('mjroom')?.querySelector('iframe');if(f&&e.source===f.contentWindow&&e.data?.type==='tori-mahjong-ready'){clearTimeout(mjLoadTimer);$('mjload').hidden=true;}});
function mjRoomClose(){clearTimeout(mjLoadTimer);const o=$('mjroom');if(o){o.querySelector('iframe').src='about:blank';o.remove();}document.body.style.overflow=mjOverflow;bgStart();}

function mgOpen(){if($('mg'))return;const o=document.createElement('div');o.id='mg';o.style.cssText='position:fixed;inset:0;z-index:70;background:#3a2a1e;display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:none;color:#fffaf0';
  o.innerHTML='<div id="mgh" style="margin-bottom:8px;text-align:center"></div><canvas id="mgc" width="320" height="440" style="max-width:100%;max-height:74vh;image-rendering:pixelated;border:4px solid #fffaf0;background:#f6e7c1;touch-action:none"></canvas><div class="row" style="margin-top:10px;width:min(320px,90%)"><button class="btn ghost full" onclick="mgClose()">닫기</button><button class="btn full" id="mgr" style="display:none" onclick="mgStart()">한 번 더</button></div>';
  document.body.appendChild(o);const c=$('mgc');mgBindDrag(c);mgStart();}
// Drag by displacement, never by the initial tap location. Capture keeps a drag continuous.
function mgBindDrag(c){let drag=null;c.addEventListener('pointerdown',e=>{if(drag||e.isPrimary===false)return;if(e.pointerType==='mouse'&&e.button!==0)return;drag={id:e.pointerId,start:e.clientX,x:MG.x};c.setPointerCapture(e.pointerId);});c.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id||!MG.raf)return;const r=c.getBoundingClientRect();MG.x=Math.max(24,Math.min(296,drag.x+(e.clientX-drag.start)/r.width*320));});const end=e=>{if(drag&&e.pointerId===drag.id)drag=null;};['pointerup','pointercancel','lostpointercapture'].forEach(t=>c.addEventListener(t,end));}
/* v5.1: 도토리 받기 · 기타리스트 새 그림 (16칸 도토리·금도토리·돌, 바구니, 숲/무대 배경) */
Object.assign(MGP,{D:'#7a4a25',G:'#b07a12',u:'#e0a21f',x:'#d6d6d6',e:'#a0703a'});
Object.assign(MGS,{
a2:["......kkk.......",".......kDk......","...kkkkkDkkkk...","..kDdDdDdDdDDk..",".kDdDdDdDdDdDdk.",".kdDdDdDdDdDdDk.",".kDDDDDDDDDDDDk.","..kkkkkkkkkkkk..","..kbwbbbbbbbYk..","..kbwbbbbbbbYk..","..kbbbbbbbbYYk..","...kbbbbbbbYk...","...kbbbbbbYYk...","....kbbbbYYk....",".....kkbYkk.....",".......kk......."],
g2:["w.....kkk......w",".......kGk......","...kkkkkGkkkk...","..kGuGuGuGuGGk..",".kGuGuGuGuGuGGk.",".kuGuGuGuGuGuGk.",".kGGGGGGGGGGGGk.","..kkkkkkkkkkkk..","..kywyyyyyyyYk..","..kywyyyyyyyYk..","w.kyyyyyyyyYYk..","...kyyyyyyyYk..w","...kyyyyyyYYk...","....kyyyyYYk....",".....kkyYkk.....",".......kk......."],
r2:["................","................","................",".....kkkkkk.....","...kkxxssssk....","..kxxsssssssk...","..kxssssssssstk.",".kxsssssssssstk.",".ksssssssssssttk",".kssssssstssstk.","kssssssssssssttk","ksssstsssssstttk",".ktsssssssssttk.","..kttttsssttttk.","...kkkkkkkkkkk..","................"],
bk:["kkkkkkkkkkkkkkkkkkkkkk","kdeedeedeedeedeedeedek","kebbebbebbebbebbebbebk",".kbebbebbebbebbebbebk.",".kebbebbebbebbebbebbk.","..kbebbebbebbebbebk..","..keeeeeeeeeeeeeeeek..","...kkkkkkkkkkkkkkkk..."]});
let MGB1=null,SDB=null;function mgBack1(){return MGB1||(MGB1=sdForest());}
let MGB3=null;function mgBack3(){if(MGB3)return MGB3;const c=document.createElement('canvas');c.width=320;c.height=440;const g=c.getContext('2d'),F=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  F(0,0,320,440,'#22172b');for(let y=0;y<440;y+=8)for(let x=(y/8%2)*8;x<320;x+=16)F(x,y,4,4,'#2a1d35');
  g.globalAlpha=.12;[[20,'#ffe14d'],[300,'#e79aa8']].forEach(([x,col])=>{for(let y=0;y<400;y+=4){const w=Math.round(8+y*.22);F(x-w/2,y,w,4,col);}});g.globalAlpha=1;
  F(10,0,24,10,'#3a2a20');F(14,10,16,6,'#ffe14d');F(286,0,24,10,'#3a2a20');F(290,10,16,6,'#e79aa8');
  F(0,396,320,44,'#5a3a22');for(let x=0;x<320;x+=40)F(x,396,4,44,'#3f2816');F(0,396,320,4,'#7a5232');
  F(44,0,232,440,'#3a2a20');F(48,0,224,440,'#5b3a24');for(let x=48;x<272;x+=8)F(x,0,4,440,'#62402a');
  return MGB3=c;}
/* tools/mg/sd_art.js 내용 (고치면 여기에도 다시 넣어요) */
/* v5.5 스타듀 느낌 그림 (나무는 v5.6) (11월부터 나오는 도토리 받기 · 타코 띄워 주기). 2px 한 칸으로 그려요 */
const SDR=s=>()=>(s=(s*9301+49297)%233280)/233280;
function sdCv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
/* 칸 그리드: 셀(u px)에 색을 칠하고, 마스크 테두리 그리기 */
function sdGrid(W,H){const a=new Array(W*H).fill(null);return{W,H,a,s(x,y,c){x|=0;y|=0;if(x>=0&&y>=0&&x<W&&y<H)a[y*W+x]=c;},g(x,y){return x>=0&&y>=0&&x<W&&y<H?a[y*W+x]:null;},
  draw(g,u,ox,oy){for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=a[y*W+x];if(c){g.fillStyle=c;g.fillRect(ox+x*u,oy+y*u,u,u);}}}};}
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
let MG={};
/* v5.4: 도토리 받기 · 타코 띄워 주기 · 기타리스트는 10월엔 처음의 단순한 화면, 11월 1일부터 v5.2 화면(숲·바다·무대). 게임을 시작할 때 정해요 */
const MG_NEW='2026-11-01',mgOld=()=>todayStr()<MG_NEW;
/* ===== v5.3 미니게임 공통 연출 (MX) =====
   처음 열 때 시작 화면 → 3·2·1 → 게임 → 별점 결과 카드. 반짝이(파티클)·글자 튀기·화면 흔들림·번쩍임·점수판도 여기서 그려요.
   게임 loop: dt=MX.step(dt)(시작 전·카운트다운 동안 0) → MX.pre(g) → 게임 그림 → MX.post(g) → 점수판 → MX.over(g). 점수·보상 규칙은 각 게임 그대로 */
Object.assign(MGP,{Z:'#fff0a6'});
Object.assign(MGS,{"st1": ["......k......", ".....kyk.....", ".....kyk.....", "....kyZyk....", "kkkkkyZyykkkk", "kyyyyZZyyyyyk", ".kyyyyyyyyYk.", "..kyyyyyyYk..", "...kyyyyYk...", "..kyyykyyYk..", "..kyyk.kyYk..", ".kyk.....kYk.", ".kk.......kk."], "st0": ["......k......", ".....kxk.....", ".....kxk.....", "....kxwxk....", "kkkkkxwxxkkkk", "kxxxxwwxxxxxk", ".kxxxxxxxxsk.", "..kxxxxxxsk..", "...kxxxxsk...", "..kxxxkxxsk..", "..kxxk.kxsk..", ".kxk.....ksk.", ".kk.......kk."], "ht": ["..kk...kk..", ".kRRk.kRRk.", "kRwRRkRRRRk", "kRwRRRRRRRk", "kRRRRRRRRRk", ".kRRRRRRRk.", "..kRRRRRk..", "...kRRRk...", "....kRk....", ".....k....."]});
const MX={p:[],t:[],sh:0,fl:0,fc:'#fff',st:'play',cd:0,ct:0,raf:0,first:0,info:null,
 reset(info){cancelAnimationFrame(this.raf);this.raf=0;this.p=[];this.t=[];this.sh=0;this.fl=0;this.ct=0;this.info=info;this.st=this.first?'ready':'cd';this.cd=this.first?0:2.4;if(!this.first)sfx('tick');},
 go(){if(this.st!=='ready')return false;this.first=0;this.st='cd';this.cd=2.4;sfx('tick');return true;},
 step(dt){this.ct+=dt;
  this.p=this.p.filter(p=>{p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.g||0)*dt;return p.l>0;});
  this.t=this.t.filter(t=>{t.l-=dt;t.y-=(t.v==null?30:t.v)*dt;return t.l>0;});
  if(this.sh>0)this.sh=Math.max(0,this.sh-40*dt);if(this.fl>0)this.fl=Math.max(0,this.fl-2*dt);
  if(this.st==='ready')return 0;
  if(this.st==='cd'){const a=Math.ceil(this.cd/.8);this.cd-=dt;const b=Math.ceil(this.cd/.8);if(this.cd<=0){this.st='play';sfx('coin');this.pop(160,210,'시작!','#ffe14d',2,.8);}else if(b!==a)sfx('tick');return 0;}
  return dt;},
 burst(x,y,cols,n,sp,gr,sz){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=sp*(.35+Math.random()*.65);this.p.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(gr?sp*.5:0),g:gr||0,l:.45+Math.random()*.4,L:.85,c:cols[i%cols.length],z:sz||4});}},
 confetti(n){const C=['#e79aa8','#f4c542','#8fbf5a','#7fc8e0','#c9a3e6','#fffaf0'];for(let i=0;i<n;i++)this.p.push({x:Math.random()*320,y:-10-Math.random()*60,vx:(Math.random()-.5)*60,vy:60+Math.random()*80,g:40,l:2.2,L:2.2,c:C[i%C.length],z:4,cf:1});},
 ring(x,y,col,r){this.p.push({x,y,vx:0,vy:0,l:.35,L:.35,c:col,ring:r||24});},
 pop(x,y,s,col,big,life,v){this.t.push({x,y,s,c:col||'#fffaf0',b:big||1,l:life||.7,L:life||.7,v});},
 shake(a){this.sh=Math.max(this.sh,a);},flash(c,a){this.fc=c;this.fl=Math.max(this.fl,a||.4);},
 tx(g,s,x,y,sz,col,al,plain){g.save();g.font='700 '+sz+'px Galmuri11,monospace';g.textAlign=al||'center';g.textBaseline='middle';x=Math.round(x);y=Math.round(y);
  if(!plain){const o=sz>=32?3:2;g.fillStyle='#3a2a20';for(const [a,b] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,-o],[-o,o],[o,o]])g.fillText(s,x+a,y+b);}
  g.fillStyle=col;g.fillText(s,x,y);g.restore();},
 icon(g,k,x,y,z){z=z||1;MGS[k].forEach((row,j)=>[...row].forEach((ch,i)=>{if(ch!=='.'){g.fillStyle=MGP[ch];g.fillRect(Math.round(x+i*z),Math.round(y+j*z),z,z);}}));},
 panel(g,x,y,w,h,f){g.fillStyle='#3a2a20';g.fillRect(x+2,y,w-4,h);g.fillRect(x,y+2,w,h-4);g.fillStyle=f||'#fffaf0';g.fillRect(x+2,y+2,w-4,h-4);if(!f){g.fillStyle='#e8d9b8';g.fillRect(x+2,y+h-5,w-4,3);}},
 bar(g,x,y,w,fr){this.panel(g,x,y,w,18,'#5a3d24');fr=Math.max(0,Math.min(1,fr));const c=fr>.5?'#8fbf5a':fr>.2?'#f4c542':'#e0524d';if(fr>.17||Math.floor(this.ct*6)%2){g.fillStyle=c;g.fillRect(x+4,y+4,Math.round((w-8)*fr),10);g.fillStyle='rgba(255,255,255,.4)';g.fillRect(x+4,y+4,Math.round((w-8)*fr),3);}},
 chip(g,x,y,w,s,ic){this.panel(g,x,y,w,28);if(ic)this.icon(g,ic,x+6,y+6);this.tx(g,s,x+w-8,y+15,16,'#3a2a20','right',1);},
 pre(g){g.save();if(this.sh>0)g.translate(Math.round((Math.random()-.5)*this.sh),Math.round((Math.random()-.5)*this.sh));},
 post(g){this.p.forEach(p=>{g.globalAlpha=p.cf?1:Math.min(1,p.l/p.L*1.8);g.fillStyle=p.c;
   if(p.ring){const r=p.ring*(1.6-p.l/p.L*.8),n=Math.round(r*.9);for(let k=0;k<n;k++){const a=k/n*6.283;g.fillRect(Math.round(p.x+r*Math.cos(a))-2,Math.round(p.y+r*Math.sin(a))-2,4,4);}}
   else if(p.cf)g.fillRect(Math.round(p.x),Math.round(p.y),Math.floor(p.l*6)%3?4:2,4);else g.fillRect(Math.round(p.x-p.z/2),Math.round(p.y-p.z/2),p.z,p.z);});
  g.globalAlpha=1;this.t.forEach(t=>{g.globalAlpha=Math.min(1,t.l/t.L*3);this.tx(g,t.s,t.x,t.y,16*t.b,t.c);});g.globalAlpha=1;g.restore();},
 over(g){if(this.fl>0){g.globalAlpha=Math.min(.55,this.fl);g.fillStyle=this.fc;g.fillRect(0,0,320,440);g.globalAlpha=1;}
  if(this.st==='cd'){const n=Math.ceil(this.cd/.8);g.fillStyle='rgba(30,20,12,.35)';g.fillRect(0,0,320,440);if(n>0){const f=this.cd%.8>.6;this.tx(g,String(n),160,200,f?64:48,'#ffe14d');}this.tx(g,'준비!',160,256,16,'#fffaf0');}
  if(this.st==='ready')this.title(g);},
 title(g){const I=this.info||{};g.fillStyle='rgba(30,20,12,.55)';g.fillRect(0,0,320,440);this.panel(g,24,52,272,320);
  g.fillStyle='#f6ead0';g.fillRect(28,56,264,112);if(I.art){g.save();g.beginPath();g.rect(28,56,264,112);g.clip();I.art(g);g.restore();}
  this.tx(g,I.name||'',160,194,32,'#f4c542');(I.lines||[]).forEach((l,i)=>this.tx(g,l,160,234+i*22,16,'#4a3423','center',1));
  if(I.best)this.tx(g,I.best,160,240+(I.lines||[]).length*22+10,16,'#a8641a','center',1);
  if(Math.floor(this.ct*2.5)%2===0)this.tx(g,'화면을 탭하면 시작!',160,404,16,'#ffe14d');},
 end(r){const c=$('mgc');if(!c)return;const snap=document.createElement('canvas');snap.width=320;snap.height=440;snap.getContext('2d').drawImage(c,0,0);
  const g=c.getContext('2d');this.st='end';let l=0,et=0,got=0,bestOn=0;
  const loop=ts=>{if(!$('mg')||this.st!=='end')return;const dt=l?Math.min(.05,(ts-l)/1000):0;l=ts;et+=dt;this.step(dt);
   g.drawImage(snap,0,0);g.fillStyle='rgba(30,20,12,.62)';g.fillRect(0,0,320,440);
   const oy=Math.round(Math.max(0,(.28-et)/.28)*360/4)*4;g.save();g.translate(0,oy);
   this.panel(g,30,66,260,300);this.tx(g,r.title||'끝!',160,100,32,'#a8641a');
   this.tx(g,r.big,160,158,48,'#f4c542');if(r.extra)this.tx(g,r.extra,160,204,16,'#4a3423','center',1);
   for(let i=0;i<3;i++){const on=i<r.stars,show=et>.45+i*.28,x=160+(i-1)*52-20;
    if(show&&got<=i){got=i+1;if(on){sfx('coin');this.burst(x+20,252,['#f4c542','#fff0a6','#fffaf0'],10,130,0);}else sfx('tick');}
    if(show){const b=et<.45+i*.28+.12?2:0;this.icon(g,on?'st1':'st0',x-b,232-b,3);}else this.icon(g,'st0',x,232,3);}
   if(et>1.3){if(r.rw>0){this.icon(g,'a2',112,286,2);this.tx(g,'+'+r.rw,176,302,32,'#8fbf5a');}else this.tx(g,r.note||'',160,302,16,'#66502f','center',1);}
   g.restore();
   if(r.best&&et>1.6){if(!bestOn){bestOn=1;sfx('fan');this.confetti(40);}this.panel(g,92,34+oy,136,30,'#e0524d');this.tx(g,'최고 기록!',160,50+oy,16,'#fffaf0');}
   this.post(g);this.raf=requestAnimationFrame(loop);};
  cancelAnimationFrame(this.raf);this.raf=requestAnimationFrame(loop);}};

/* 창이 닫힐 때 툭 사라지지 않게: 진짜 창은 바로 지우고, 같은 색 막이 서서히 사라져요 (공통 지침서 4장) */
function mgGone(o){try{const g=document.createElement('div');g.id='mgx';g.style.background=getComputedStyle(o).backgroundColor;document.body.appendChild(g);setTimeout(()=>g.remove(),300);}catch(e){}o.remove();}
function mgClose(){mgStop();if(MG.raf)cancelAnimationFrame(MG.raf);MG.raf=0;cancelAnimationFrame(MX.raf);MX.st='play';const o=$('mg');if(o)mgGone(o);render();}
function mgStart(){if(MG.raf)cancelAnimationFrame(MG.raf);MG={x:160,t:30,s:0,it:[],sp:0,e:0,l:0,raf:0,old:mgOld()};$('mgr').style.display='none';const c=$('mgc'),g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const dr=(k,x,y,z)=>MGS[k].forEach((row,j)=>[...row].forEach((ch,i)=>{if(ch!=='.'){g.fillStyle=MGP[ch];const X=Math.round(x+i*z),Y=Math.round(y+j*z);g.fillRect(X,Y,Math.round(x+(i+1)*z)-X,Math.round(y+(j+1)*z)-Y);}}));
  const loop=ts=>{if(!$('mg'))return;if(!MG.l)MG.l=ts;const dt=Math.min(.05,(ts-MG.l)/1000);MG.l=ts;MG.t-=dt;MG.e+=dt;MG.sp-=dt;
    if(MG.sp<=0){MG.sp=Math.max(.32,.8-MG.e*.016);const r=Math.random();MG.it.push({x:20+Math.random()*280,y:-30,k:r<.08?'g':r<.28?'r':'a'});}
    if(MG.old){g.fillStyle='#f6e7c1';g.fillRect(0,0,320,440);g.fillStyle='#8fbf5a';g.fillRect(0,400,320,40);}else g.drawImage(mgBack1(),0,0);
    const v=130+MG.e*5;MG.it=MG.it.filter(it=>{it.y+=v*dt;if(MG.old)dr(it.k,it.x-16,it.y-16,4);else dr(it.k+'2',it.x-16,it.y-16,2);
      if(it.y>350&&it.y<410&&Math.abs(it.x-MG.x)<30){if(it.k==='r'){MG.s=Math.max(0,MG.s-2);sfx('no');}else{MG.s+=it.k==='g'?3:1;sfx('coin');}return false;}return it.y<450;});
    if(MG.old)dr('h',MG.x-24,360,6);else{if(TORI_FACE.complete&&TORI_FACE.naturalWidth)g.drawImage(TORI_FACE,Math.round(MG.x-24),334,48,48);else dr('h',MG.x-24,344,6);g.drawImage(SDB||(SDB=sdBasket()),Math.round(MG.x-24),364);}$('mgh').textContent='시간 '+Math.max(0,Math.ceil(MG.t))+'  점수 '+MG.s;
    if(MG.t<=0){mgEnd();return;}MG.raf=requestAnimationFrame(loop);};MG.raf=requestAnimationFrame(loop);}
function mgEnd(){MG.raf=0;const sc=MG.s,td=todayStr();if(S.mg.d!==td)S.mg={...S.mg,d:td,n:0};let m;
  if(S.mg.n<ECO.mgPlays){const r=sc>=20?2:sc>=10?1:0;if(r)S.mg.n++;S.acorns+=r;m=r?'🌰 +'+r+' 받았어요!':'10점부터 도토리를 받아요 (보상 기회는 아직 남았어요)';}else m='오늘 보상은 다 받았어요 (연습은 계속 가능!)';
  const nb=sc>(S.mg.best||0);if(nb)S.mg.best=sc;save();sfx('fan');$('mgh').innerHTML='끝! 점수 '+sc+(nb?' · 최고 기록!':'')+'<br>'+m;$('mgr').style.display='';}
/* ===== 🏊 타코 띄워 주기 (꾹 눌러 헤엄치기) · 보상 횟수는 다른 미니게임과 합산 ===== */
Object.assign(MGP,{R:'#d9483b',v:'#c9a3e6',V:'#8a63b8'});
Object.assign(MGS,{j:["..kkkk..",".kvvvvk.","kvwvvvvk","kvvvvvvk","kkkkkkkk",".kVkVkV.","..k.k.k.",".k.k.k.."],hp:[".kk..kk.","kRRkkRRk","kRRRRRRk","kRRRRRRk",".kRRRRk.","..kRRk..","...kk...","........"]});
/* ===== 🌊 깊은 바다 (1000m~): 새우 → 자라 → 바다토끼 → 물범 → 상어, 갈수록 커져요 ===== */
/* 새우 눈(o)에 색이 없어서 직전에 칠한 색이 묻어나 반짝거렸어요 → v5.3에 흰색으로 정함 */
Object.assign(MGP,{o:'#fffaf0',1:'#f08a5d',2:'#c9583a',3:'#7fae5a',4:'#4e7a3a',5:'#d9c27a',6:'#9b7fb8',7:'#6f5590',8:'#9aa5b1',9:'#6c7783',A:'#e8eef2',B:'#6f8aa3',C:'#4a6278'});
Object.assign(MGS,{
cSh:["k...1111..",".k.111112.","kok1111222",".11111222.","..1.1.2.2."],
cTt:["....kkkkkk....","...k3433434k..","k5k.k3433434k.","k5k5k3433434k.",".k55kkkkkkkkk.","...k5k.k5k.k5k","...kk..kk..kk."],
cHr:["k6.k6.......","k6kk6k......",".k6666kkkk..","k66k6666677k","k666666777k.",".k6677777kk.","..kkkkkkk..."],
cSl:["...kkkk...........","..k8888kkkkkk.....",".k88k88888888kk...","k99k888888888888kk","kkkkAAAAAAAA88888k",".k9kAAAAAAAAA888k.","..kkkAAAAAAA88kk..","....k99kkkkk99k...",".....kk.....kk...."],
cSk:["..............kk..........",".............kBBk.........",".........kkkkBBBBk......k.","....kkkkkBBBBBBBBBkkk..kBk","..kkBBBBBBBBBBBBBBBBBkkBBk",".kBBkBBBBBBBBBBBBBBBBBBBk.","kBBBBBBBBBBBBBBBBBBBBBkk..","kkwkwkwkAAAAAAAAAAAAAkBBk.",".kkkkkkkkAAAAAAAAAAkkkBBk.",".........kkkkkkkkkk...kk.."]});
const CR=[{s:'cSh',name:'새우',at:1000,z:4,ex:75,a:35,f:4.5},
{s:'cTt',name:'자라',at:1300,z:4,ex:-45,a:0,f:0},
{s:'cHr',name:'바다토끼',at:1600,z:4,ex:0,a:30,f:1.5},
{s:'cSl',name:'물범',at:2000,z:5,ex:40,a:55,f:2},
{s:'cSk',name:'상어',at:2500,z:5,ex:95,a:0,f:0,sk:1}];
CR.forEach(c=>{c.h=MGS[c.s].length*c.z;c.w=Math.max(...MGS[c.s].map(r=>r.length))*c.z;});
function crSpawn(){const m=MG.d/10,u=CR.filter(c=>m>=c.at),c=u[Math.random()<.4?u.length-1:Math.floor(Math.random()*u.length)];
  const b=c.sk?Math.max(52,Math.min(398-c.h,MG.y-c.h/2)):60+Math.random()*(330-c.h);
  MG.ob.push({k:'c',s:c.s,z:c.z,x:c.sk?430:340,y:b,b,w:c.w,h:c.h,ex:c.ex,a:c.a,f:c.f,ph:Math.random()*6.28});
  }
/* 타코 띄워 주기 배경 (v5.2): 물빛 층 · 햇살 · 먼 바위(고정), 해초·산호 실루엣(느리게 흘러감), 모래 바닥(같이 흘러감). 장애물과 헷갈리지 않게 테두리 없이 흐리게 */
let MGB2=null;function mgBack2(){if(MGB2)return MGB2;const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};let r=5;const R=()=>(r=(r*9301+49297)%233280)/233280;
  const W=mk(320,440),g=W.getContext('2d'),F=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  const BAND=['#55bce0','#4eb4da','#47abd3','#41a1cc','#3a97c4','#348dbc','#2e83b3','#2979aa'];
  BAND.forEach((col,i)=>{const y=40+i*46;F(0,y,320,46,col);if(i)for(let x=(i%2)*4;x<320;x+=8)F(x,y,4,4,BAND[i-1]);});
  const D=(gg,cx,cy,rx,ry,col)=>{gg.fillStyle=col;for(let y=-ry;y<=ry;y+=4)for(let x=-rx;x<=rx;x+=4)if((x*x)/(rx*rx)+(y*y)/(ry*ry)<=1)gg.fillRect(Math.round((cx+x)/4)*4,Math.round((cy+y)/4)*4,4,4);};
  [[20,410,60,40],[110,418,50,26],[230,412,70,44],[310,418,40,28]].forEach(([x,y,a,b])=>D(g,x,y,a,b,'#2a6c9a'));
  const Fc=mk(640,110),f=Fc.getContext('2d');
  for(let i=0;i<14;i++){const x=20+i*46+Math.floor(R()*12)*2,h=40+Math.floor(R()*10)*6,col=i%2?'#3a8c86':'#33807a';for(let y=0;y<h;y+=4){const sw=Math.round(Math.sin(y*.12+i)*2)*2;f.fillStyle=col;f.fillRect(x+sw,110-y,6,4);if(y%12===0&&y>8){f.fillRect(x+sw+(i%2?6:-6),110-y,6,4);}}}
  for(let i=0;i<6;i++){const x=50+i*104,c=['#b8828f','#c49a6a','#9b84b0'][i%3];f.fillStyle=c;for(let k=0;k<5;k++){const bx=x+(k-2)*8,h=14+((k*7+i*3)%4)*6;f.fillRect(bx,110-h,4,h);f.fillRect(bx-4,110-h,4,4);f.fillRect(bx+4,110-h+4,4,4);}f.fillRect(x-18,104,40,6);}
  const Sc=mk(320,30),sg=Sc.getContext('2d');sg.fillStyle='#e3cc94';sg.fillRect(0,0,320,30);sg.fillStyle='#f0dcae';sg.fillRect(0,0,320,4);
  for(let i=0;i<46;i++){sg.fillStyle=['#cfb37a','#f2e0b4','#c7a86c'][i%3];sg.fillRect(Math.floor(R()*80)*4,6+Math.floor(R()*6)*4,4,4);}
  [[40,'#f4b8c4'],[150,'#fffaf0'],[250,'#f4b8c4']].forEach(([x,c])=>{sg.fillStyle='#8a6b3f';sg.fillRect(x,14,12,8);sg.fillStyle=c;sg.fillRect(x+2,14,8,6);sg.fillRect(x+4,12,4,2);});
  return MGB2={w:W,f:Fc,s:Sc,c:[[40,14,30],[170,8,40],[290,18,26]]};}
let TKI=null;
function mg2Open(){if($('mg'))return;const o=document.createElement('div');o.id='mg';o.style.cssText='position:fixed;inset:0;z-index:70;background:#3a2a1e;display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:none;color:#fffaf0';
  o.innerHTML='<div id="mgh" style="margin-bottom:8px;text-align:center"></div><canvas id="mgc" width="320" height="440" style="max-width:100%;max-height:74vh;image-rendering:pixelated;border:4px solid #fffaf0;background:#4fb3d9;touch-action:none"></canvas><div class="row" style="margin-top:10px;width:min(320px,90%)"><button class="btn ghost full" onclick="mgClose()">닫기</button><button class="btn full" id="mgr" style="display:none" onclick="mg2Start()">한 번 더</button></div>';
  document.body.appendChild(o);const cv=$('mgc');cv.addEventListener('pointerdown',e=>{e.preventDefault();try{cv.setPointerCapture(e.pointerId);}catch(_){}MG.h=1;});['pointerup','pointercancel'].forEach(t=>cv.addEventListener(t,()=>{MG.h=0;}));cv.addEventListener('contextmenu',e=>e.preventDefault());mg2Start();}
function mg2Start(){if(MG.raf)cancelAnimationFrame(MG.raf);MG={e:0,l:0,raf:0,y:200,vy:0,h:0,d:0,lv:3,iv:0,ob:[],nx:150,ms:'헤엄친다코~!',mt:2,bb:[],bt:0,mk:0,top:0,tr:0,tw:0,old:mgOld()};$('mgr').style.display='none';
  const c=$('mgc'),g=c.getContext('2d');g.imageSmoothingEnabled=false;if(!TKI){TKI=new Image();TKI.src=TAKO;}
  const H=mgH(g),TX=90;
  const loop=ts=>{if(!$('mg'))return;if(!MG.l)MG.l=ts;const dt=Math.min(.05,(ts-MG.l)/1000);MG.l=ts;MG.e+=dt;if(MG.iv>0)MG.iv-=dt;if(MG.mt>0)MG.mt-=dt;
    const v=Math.min(190,110+MG.d*.03);MG.d+=v*dt;
    if(MG.tr>0)MG.tr-=dt;const up=MG.h&&MG.tr<=0;
    MG.vy=Math.max(-190,Math.min(230,MG.vy+(up?-560:400)*dt));MG.y+=MG.vy*dt;
    if(MG.y<52){MG.y=52;MG.vy=Math.max(MG.vy,0);}if(MG.y>398){MG.y=398;MG.vy=Math.min(MG.vy,0);}
    if(MG.tr>0&&MG.y>=140)MG.tr=0; /* 어느 정도 내려오면 다시 헤엄칠 수 있어요 */
    /* 수면(맨 위)에 5초 넘게 붙어 있으면 지쳐서 잠깐 아래로 내려가요 */
    if(MG.y<=58){MG.top+=dt;if(MG.top>=3.2&&!MG.tw&&MG.mt<=0){MG.tw=1;MG.ms='점점 힘들다코…';MG.mt=1.2;}
      if(MG.top>=5){MG.top=0;MG.tw=0;MG.tr=1;MG.vy=Math.max(MG.vy,140);MG.ms='힘들다코… 잠깐 쉰다코!';MG.mt=1.2;sfx('tick');}}
    else if(MG.y>66){MG.top=0;MG.tw=0;}
    MG.nx-=v*dt;if(MG.nx<=0){MG.nx=Math.max(170,260-MG.d*.04)+Math.random()*60;if(MG.d>=10000&&Math.random()<.45)crSpawn();else if(Math.random()<.5)MG.ob.push({k:'r',x:330,z:[9,12,15][Math.floor(Math.random()*3)]});else MG.ob.push({k:'j',x:330,b:90+Math.random()*200,ph:Math.random()*6.28,y:150});}
    MG.bt-=dt;if(MG.h&&MG.tr<=0&&MG.bt<=0){MG.bt=.1;MG.bb.push({x:TX-16,y:MG.y+8,l:.8});}
    MG.bb=MG.bb.filter(b=>{b.l-=dt;b.x-=v*dt;b.y-=30*dt;return b.l>0;});
    let hit=false;
    MG.ob=MG.ob.filter(o=>{o.x-=(v+(o.ex||0))*dt;if(o.k==='j')o.y=o.b+18*Math.sin(MG.e*2.2+o.ph);else if(o.k==='c')o.y=Math.max(46,Math.min(404-o.h,o.b+o.a*Math.sin(MG.e*o.f+o.ph)));if(o.x<-130)return false;
      let x1,x2,y1,y2;if(o.k==='r'){x1=o.x+o.z*.6;x2=o.x+o.z*7.4;y1=410-5*o.z;y2=410;}else if(o.k==='c'){x1=o.x+o.w*.12;x2=o.x+o.w*.88;y1=o.y+o.h*.2;y2=o.y+o.h*.85;}else{x1=o.x+8;x2=o.x+40;y1=o.y+6;y2=o.y+38;}
      if(TX+14>x1&&TX-14<x2&&MG.y+12>y1&&MG.y-12<y2)hit=true;return true;});
    if(hit&&MG.iv<=0){MG.lv--;MG.iv=1.3;MG.vy=-120;MG.ms='아야코!';MG.mt=1;sfx('no');}
    if(Math.floor(MG.d/1000)>MG.mk){MG.mk++;MG.ms=MG.mk*100+'m코~!';MG.mt=1.2;sfx('coin');}
    if(MG.old){g.fillStyle='#bfe8f5';g.fillRect(0,0,320,440);
    for(let x=0;x<320;x+=8){const w=Math.round(4*Math.sin(x*.06+MG.e*2.2));g.fillStyle='#4fb3d9';g.fillRect(x,44+w,8,400);g.fillStyle='#8fdcf0';g.fillRect(x,44+w,8,4);}
    g.fillStyle='#3aa2cd';g.fillRect(0,250,320,190);g.fillStyle='#d9b98a';g.fillRect(0,410,320,30);g.fillStyle='#b8965f';for(let i=0;i<8;i++)g.fillRect(((i*40-MG.d)%320+320)%320,422,8,4);}
    else {const B=mgBack2();g.drawImage(B.w,0,0);const px=Math.round(MG.d*.35/4)*4%640,sx=Math.round(MG.d/4)*4%320;g.drawImage(B.f,-px,300);g.drawImage(B.f,640-px,300);g.drawImage(B.s,-sx,410);g.drawImage(B.s,320-sx,410);
    for(let x=0;x<320;x+=8){const w=Math.round(4*Math.sin(x*.06+MG.e*2.2));g.fillStyle='#bfe8f5';g.fillRect(x,0,8,44+w);g.fillStyle='#8fdcf0';g.fillRect(x,44+w,8,4);}
    /* 햇살 빛줄기: 천천히 흔들리고 밝기가 일렁여요 (v5.6) */
    for(let k=0;k<4;k++){const sw=Math.sin(MG.e*.6+k*1.7)*10,al=.045+.035*(.5+.5*Math.sin(MG.e*1.3+k*2.1));g.globalAlpha=al;g.fillStyle='#ffffff';for(let y=44;y<340;y+=4){const w=10+((y-44)/300)*18,x=30+k*80+(y-44)*.35+sw*(y-44)/300;g.fillRect(Math.round(x/4)*4,y,Math.round(w/4)*4,4);}}g.globalAlpha=1;
    g.fillStyle='rgba(255,255,255,.55)';B.c.forEach(c=>{const x=((c[0]-MG.e*6)%360+360)%360-30;g.fillRect(Math.round(x),c[1],c[2],6);g.fillRect(Math.round(x)+6,c[1]-4,c[2]-12,4);});
    if(!MG.ab)MG.ab=Array.from({length:7},(_,i)=>({x:20+i*44,y:120+Math.random()*280,v:18+Math.random()*16}));g.fillStyle='rgba(230,247,255,.6)';MG.ab.forEach(b=>{b.y-=b.v*dt;b.x-=v*.35*dt;if(b.y<56||b.x<-6){b.y=380+Math.random()*30;b.x=40+Math.random()*290;}const z=b.v>26?4:2;g.fillRect(Math.round(b.x),Math.round(b.y),z,z);});}
    if(MG.d>10000){g.fillStyle='rgba(15,40,100,'+Math.min(.4,(MG.d-10000)/60000).toFixed(2)+')';g.fillRect(0,44,320,396);}
    g.fillStyle='#e6f7ff';MG.bb.forEach(b=>g.fillRect(Math.round(b.x),Math.round(b.y),4,4));
    MG.ob.forEach(o=>{if(o.k==='r')H.dr('r',o.x,410-6*o.z,o.z);else if(o.k==='c'){H.dr(o.s,o.x,o.y,o.z);}else H.dr('j',o.x,o.y,6);});
    if(MG.iv<=0||Math.floor(MG.e*12)%2)H.tk(TX,MG.y);
    if(MG.top>1){g.fillStyle='#4a3423';g.fillRect(TX-18,MG.y+24,36,6);g.fillStyle=MG.top>3.5?'#4f9caa':'#a6cfcb';g.fillRect(TX-16,MG.y+26,Math.round(32*Math.min(1,MG.top/5)),2);}
    if(MG.mt>0)H.tx(MG.ms,TX+30,MG.y-46);
    for(let i=0;i<MG.lv;i++)H.dr('hp',6+i*26,6,3);
    if(MG.e<2.5)H.tx('꾹 누르면 떠오르고, 떼면 가라앉아요!',160,200);
    $('mgh').textContent='거리 '+Math.floor(MG.d/10)+'m';
    if(MG.lv<=0){mg2End();return;}MG.raf=requestAnimationFrame(loop);};MG.raf=requestAnimationFrame(loop);}
function mg2End(){MG.raf=0;MG.h=0;const m=Math.floor(MG.d/10),td=todayStr();if(S.mg.d!==td)S.mg={...S.mg,d:td,n:0};let ms;
  if(S.mg.n<ECO.mgPlays){const r=m>=400?2:m>=200?1:0;if(r)S.mg.n++;S.acorns+=r;ms=r?'🌰 +'+r+' 받았어요!':'200m부터 도토리를 받아요 (보상 기회는 아직 남았어요)';}else ms='오늘 보상은 다 받았어요 (연습은 계속 가능!)';
  const nb=m>(S.mg.b2||0);if(nb)S.mg.b2=m;save();sfx('fan');$('mgh').innerHTML='헤엄친 거리 '+m+'m'+(nb?' · 최고 기록!':'')+'<br>'+ms+(m>=1000?'<br>🌊 '+CR.filter(c=>m>=c.at).pop().name+' 구간까지 갔어요!':'');$('mgr').style.display='';
  if(m>=200)setTimeout(()=>tako('=멀리 헤엄쳤다코~! 🫧','',3000,0),500);}
/* ===== 🎸 기타리스트 (리듬) · 보상 횟수는 다른 미니게임과 합산 ===== */
const GT={A:'0.12.1.32.1.03.2.12.30.21.3.2.1',C:['#e79aa8','#f4c542','#8fbf5a','#7fc8e0'],F:[196,247,294,392]};
function gtChart(){const n=[];for(let s=0;s<62;s++){const ch=GT.A[s%31];if(ch==='.')continue;let l=+ch;if(s>=31)l=3-l;n.push({T:3+s*.4,l,h:0});}return n;}
function gtSnd(l){if(!S.snd||S.sv===0)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();const o=AC.createOscillator(),v=AC.createGain(),t=AC.currentTime;o.type='triangle';o.frequency.value=GT.F[l];v.gain.setValueAtTime(.154*S.sv/100,t);v.gain.exponentialRampToValueAtTime(.001,t+.4);o.connect(v);v.connect(AC.destination);o.start(t);o.stop(t+.42);}catch(e){}}
const TORI_FACE=new Image();TORI_FACE.src='images/icons/tori-icon-b.png';
function mgH(g){return {dr:(k,x,y,z)=>MGS[k].forEach((row,j)=>[...row].forEach((ch,i)=>{if(ch!=='.'){g.fillStyle=MGP[ch];const X=Math.round(x+i*z),Y=Math.round(y+j*z);g.fillRect(X,Y,Math.round(x+(i+1)*z)-X,Math.round(y+(j+1)*z)-Y);}})),
  tk:(x,y)=>{if(TKI.complete&&TKI.naturalWidth)g.drawImage(TKI,Math.round(x-24),Math.round(y-24),48,48);else{g.fillStyle='#e79aa8';g.fillRect(x-16,y-16,32,32);}},
  tx:(t,x,y)=>{g.font=fxF(14);g.textBaseline='middle';const w=Math.ceil(g.measureText(t).width)+12,bx=Math.max(2,Math.min(318-w,Math.round(x-w/2))),by=Math.max(4,Math.round(y));g.fillStyle='#4a3423';g.fillRect(bx-2,by-2,w+4,24);g.fillStyle='#fffaf0';g.fillRect(bx,by,w,20);g.fillStyle='#4a3423';g.fillText(t,bx+6,by+10);}};}
/* 기타리스트 음표: 동그란 보석 (m=0 음표, 1 받는 자리 테두리, 2 받는 자리 반짝) */
const GEM=["....kkkk....","..kkcccckk..",".kchhccccck.",".kchcccccck.","kcccccccccsk","kcccccccccsk","kcccccccccsk","kccccccccssk",".kccccccssk.",".kcccccsssk.","..kksssskk..","....kkkk...."];
function gtGem(g,cx,cy,col,m){const z=2,x0=Math.round(cx-12),y0=Math.round(cy-12);GEM.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='.')return;
  if(m===1&&ch!=='k'&&!(i<2||i>9||j<2||j>9))return;
  g.fillStyle=ch==='k'?(m?col:'#3a2a20'):ch==='h'?'#fffaf0':col;if(m===1&&ch!=='k')g.globalAlpha=.4;g.fillRect(x0+i*z,y0+j*z,z,z);
  if(ch==='s'){g.fillStyle='rgba(40,20,10,.28)';g.fillRect(x0+i*z,y0+j*z,z,z);}if(m===1)g.globalAlpha=1;}));}
function mg3Open(){if($('mg'))return;const o=document.createElement('div');o.id='mg';o.style.cssText='position:fixed;inset:0;z-index:70;background:#3a2a1e;display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:none;color:#fffaf0';
  o.innerHTML='<div id="mgh" style="margin-bottom:8px;text-align:center"></div><canvas id="mgc" width="320" height="440" style="max-width:100%;max-height:74vh;image-rendering:pixelated;border:4px solid #fffaf0;background:#2a1d33;touch-action:none"></canvas><div class="row" style="margin-top:10px;width:min(320px,90%)"><button class="btn ghost full" onclick="mgClose()">닫기</button><button class="btn full" id="mgr" style="display:none" onclick="mg3Start()">한 번 더</button></div>';
  document.body.appendChild(o);$('mgc').addEventListener('pointerdown',e=>{e.preventDefault();mg3Tap(e);});mg3Start();}
function mg3Tap(ev){if(!MG.raf)return;const r=$('mgc').getBoundingClientRect(),l=Math.max(0,Math.min(3,Math.floor(((ev.clientX-r.left)/r.width*320-48)/56)));MG.fl2[l]=.12;
  let b=null;MG.N.forEach(n=>{if(!n.h&&n.l===l&&Math.abs(n.T-MG.e)<=.22&&(!b||n.T<b.T))b=n;});
  if(!b){MG.c=0;sfx('no');return;}
  const pf=Math.abs(b.T-MG.e)<=.1;b.h=pf?2:1;MG.s+=b.h;MG.c++;MG.bc=Math.max(MG.bc,MG.c);MG.jt=.45;MG.jm=pf?'PERFECT!':'GOOD';MG.bn=.5;gtSnd(l);
  if(MG.c%10===0){MG.cm=1.4;MG.ct=MG.c;}}
function mg3Start(){if(MG.raf)cancelAnimationFrame(MG.raf);MG={e:0,l:0,raf:0,s:0,c:0,bc:0,N:gtChart(),fl2:[0,0,0,0],jt:0,jm:'',bn:0,cm:0,ct:0,sd:0,old:mgOld()};$('mgr').style.display='none';
  const c=$('mgc'),g=c.getContext('2d');g.imageSmoothingEnabled=false;if(!TKI){TKI=new Image();TKI.src=TAKO;}
  const H=mgH(g),Y=360,SPD=376/1.3;
  const loop=ts=>{if(!$('mg'))return;if(!MG.l)MG.l=ts;const dt=Math.min(.05,(ts-MG.l)/1000);MG.l=ts;MG.e+=dt;['jt','bn','cm','sd'].forEach(k=>{if(MG[k]>0)MG[k]-=dt;});MG.fl2=MG.fl2.map(v=>v>0?v-dt:0);
    MG.N.forEach(n=>{if(!n.h&&MG.e>n.T+.22){n.h=-1;if(MG.c>=5)MG.sd=1.3;MG.c=0;}});
    if(MG.old){
    g.fillStyle='#2a1d33';g.fillRect(0,0,320,440);
    for(let l=0;l<4;l++){const x=48+l*56;g.fillStyle=l%2?'#3a2947':'#33243f';g.fillRect(x,0,56,440);if(MG.fl2[l]>0){g.globalAlpha=.35;g.fillStyle=GT.C[l];g.fillRect(x,0,56,440);g.globalAlpha=1;}g.fillStyle='#d9d2c0';g.fillRect(x+27,0,2,440);}
    g.fillStyle='#ffe14d';g.fillRect(48,Y-2,224,4);
    MG.N.forEach(n=>{if(n.h>0)return;const y=Y-(n.T-MG.e)*SPD;if(y<-20||y>450)return;g.globalAlpha=n.h<0?.35:1;g.fillStyle='#3b2a1e';g.fillRect(54+n.l*56,y-10,44,20);g.fillStyle=GT.C[n.l];g.fillRect(57+n.l*56,y-7,38,14);g.globalAlpha=1;});
    }else{
    g.drawImage(mgBack3(),0,0);const fo=(MG.e*SPD)%64;
    for(let y=fo-64;y<440;y+=64){g.fillStyle='#3a2a20';g.fillRect(48,Math.round(y),224,4);g.fillStyle='#d8c39a';g.fillRect(48,Math.round(y)+1,224,2);g.fillStyle='#f3ead8';g.fillRect(156,Math.round(y)+28,8,8);}
    for(let l=0;l<4;l++){const x=48+l*56;if(MG.fl2[l]>0){g.globalAlpha=.3;g.fillStyle=GT.C[l];g.fillRect(x,0,56,440);g.globalAlpha=1;}g.fillStyle='#e8e2d0';g.fillRect(x+27,0,2+(l>1?1:0),440);g.fillStyle='#8f8672';g.fillRect(x+29+(l>1?1:0),0,1,440);}
    g.fillStyle='#3a2a20';g.fillRect(44,Y-4,232,8);g.fillStyle='#ffe14d';g.fillRect(44,Y-2,232,4);
    for(let l=0;l<4;l++)gtGem(g,76+l*56,Y,GT.C[l],MG.fl2[l]>0?2:1);
    MG.N.forEach(n=>{if(n.h>0)return;const y=Y-(n.T-MG.e)*SPD;if(y<-20||y>450)return;g.globalAlpha=n.h<0?.35:1;gtGem(g,76+n.l*56,y,GT.C[n.l],0);g.globalAlpha=1;});
    }
    const bo=MG.bn>0?Math.round(Math.abs(Math.sin(MG.e*18))*8):Math.round(Math.abs(Math.sin(MG.e*3))*3);
    if(TORI_FACE.complete&&TORI_FACE.naturalWidth)g.drawImage(TORI_FACE,2,322-bo,44,44);else H.dr('h',4,324-bo,5);H.tk(296,346-bo);
    if(MG.cm>0){H.tx('찍찍!',26,290);H.tx(MG.ct+'콤보코!',290,290);}else if(MG.sd>0)H.tx('괜찮아코~',290,290);
    if(MG.jt>0)H.tx(MG.jm,160,300);if(MG.c>=2)H.tx(MG.c+' COMBO',160,20);
    if(MG.e<3)H.tx('노란 선에 닿을 때 줄을 탭!',160,180);
    $('mgh').textContent='남은 시간 '+Math.max(0,Math.ceil(29.5-MG.e))+'  점수 '+MG.s+'  콤보 '+MG.c;
    if(MG.e>=29.5){mg3End();return;}MG.raf=requestAnimationFrame(loop);};MG.raf=requestAnimationFrame(loop);}
function mg3End(){MG.raf=0;const pct=Math.round(MG.s/(2*MG.N.length)*100),td=todayStr();if(S.mg.d!==td)S.mg={...S.mg,d:td,n:0};let m;
  if(S.mg.n<ECO.mgPlays){const r=pct>=75?2:pct>=50?1:0;if(r)S.mg.n++;S.acorns+=r;m=r?'🌰 +'+r+' 받았어요!':'완성도 50%부터 도토리를 받아요 (보상 기회는 아직 남았어요)';}else m='오늘 보상은 다 받았어요 (연습은 계속 가능!)';
  const nb=pct>(S.mg.b3||0);if(nb)S.mg.b3=pct;save();sfx('fan');$('mgh').innerHTML='연주 끝! 완성도 '+pct+'% · 최대 콤보 '+MG.bc+(nb?' · 최고 기록!':'')+'<br>'+m;$('mgr').style.display='';
  if(pct>=50)setTimeout(()=>tako('=멋진 연주였다코~! 🎸','',3000,0),500);}
/* ===== 🎡 토리의 챗바퀴 (원버튼 리듬) · 보상 횟수는 다른 미니게임과 합산 ===== */
function wcSnd(f,len,vol){if(!S.snd||S.sv===0)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();const o=AC.createOscillator(),v=AC.createGain(),t=AC.currentTime;o.type='square';o.frequency.value=f;v.gain.setValueAtTime(.7*vol*S.sv/100,t);v.gain.exponentialRampToValueAtTime(.001,t+len);o.connect(v);v.connect(AC.destination);o.start(t);o.stop(t+len+.02);}catch(e){}}
function mg4Open(){if($('mg'))return;const o=document.createElement('div');o.id='mg';o.style.cssText='position:fixed;inset:0;z-index:70;background:#3a2a1e;display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:none;color:#fffaf0';
  o.innerHTML='<div id="mgh" style="margin-bottom:8px;text-align:center"></div><canvas id="mgc" width="320" height="440" style="max-width:100%;max-height:74vh;image-rendering:pixelated;border:4px solid #fffaf0;background:#f6e7c1;touch-action:none"></canvas><div class="row" style="margin-top:10px;width:min(320px,90%)"><button class="btn ghost full" onclick="mgClose()">닫기</button><button class="btn full" id="mgr" style="display:none" onclick="mg4Start()">한 번 더</button></div>';
  document.body.appendChild(o);$('mgc').addEventListener('pointerdown',e=>{e.preventDefault();mg4Tap();});mg4Start();}
function mg4Tap(){if(!MG.raf)return;let b=null;MG.B.forEach(n=>{if(!n.h&&Math.abs(n.T-MG.e)<=.14&&(!b||Math.abs(n.T-MG.e)<Math.abs(b.T-MG.e)))b=n;});MG.pk=.15;
  if(!b){MG.sp*=.7;MG.c=0;MG.jm='삐끗!';MG.jt=.5;sfx('no');return;}
  const pf=Math.abs(b.T-MG.e)<=.07;b.h=pf?2:1;MG.sp=Math.min(2.2,MG.sp+(pf?.25:.12));MG.c++;MG.bc=Math.max(MG.bc,MG.c);MG.jm=pf?'PERFECT!':'GOOD';MG.jt=.45;if(pf)sfx('coin');}
function mg4Start(){if(MG.raf)cancelAnimationFrame(MG.raf);const B=[];for(let k=0;1.5+k*.5<=29.5;k++)B.push({T:1.5+k*.5,h:0});
  MG={e:0,l:0,raf:0,rot:0,sp:0,c:0,bc:0,B,tb:0,jt:0,jm:'',mt:2,ms:'달려라 토리코~!',mk:0,pk:0};$('mgr').style.display='none';
  const c=$('mgc'),g=c.getContext('2d');g.imageSmoothingEnabled=false;if(!TKI){TKI=new Image();TKI.src=TAKO;}
  const H=mgH(g),cx=160,cy=200,R=100;
  const ring=(x,y,r,col,n)=>{g.fillStyle=col;for(let k=0;k<n;k++){const a=k/n*6.283;g.fillRect(Math.round(x+r*Math.cos(a))-2,Math.round(y+r*Math.sin(a))-2,4,4);}};
  const loop=ts=>{if(!$('mg'))return;if(!MG.l)MG.l=ts;const dt=Math.min(.05,(ts-MG.l)/1000);MG.l=ts;MG.e+=dt;['jt','mt','pk'].forEach(k=>{if(MG[k]>0)MG[k]-=dt;});
    MG.sp=Math.max(0,Math.min(2.2,MG.sp-.2*dt));MG.rot+=MG.sp*dt;
    MG.B.forEach(n=>{if(!n.h&&MG.e>n.T+.14){n.h=-1;MG.c=0;}});
    if(MG.tb<MG.B.length&&MG.e>=MG.B[MG.tb].T){wcSnd(MG.tb%4?660:880,.06,.09);MG.tb++;}
    if(Math.floor(MG.rot/10)>MG.mk){MG.mk++;MG.ms=MG.mk*10+'바퀴타코~!';MG.mt=1.3;}
    g.fillStyle='#f6e7c1';g.fillRect(0,0,320,440);g.fillStyle='#e0c48f';g.fillRect(0,300,320,140);
    const th=MG.rot*6.283;g.fillStyle='#a8641a';g.fillRect(cx-4,cy,8,112);g.fillRect(cx-40,cy+108,80,6);
    ring(cx,cy,R-8,'#b89a6a',44);
    g.fillStyle='#8a6b3f';for(let k=0;k<36;k++){const a=k/36*6.283+th;g.fillRect(Math.round(cx+R*Math.cos(a))-4,Math.round(cy+R*Math.sin(a))-4,8,8);}
    g.fillStyle='#b89a6a';for(let s=0;s<4;s++){const a=s*1.5708+th;for(let i=1;i<9;i++)g.fillRect(Math.round(cx+i*11*Math.cos(a))-2,Math.round(cy+i*11*Math.sin(a))-2,4,4);}
    g.fillStyle='#5a3d24';g.fillRect(cx-6,cy-6,12,12);
    const hop=MG.sp>.05?Math.round(Math.abs(Math.sin(MG.rot*12.566))*6):0;H.dr('h',cx-32,236-hop,8);
    ring(cx,380,28,MG.pk>0?'#ffe14d':'#8a6b3f',20);g.fillStyle='#8a6b3f';g.fillRect(cx-4,376,8,8);
    MG.B.forEach(n=>{const d=n.T-MG.e;if(n.h||d<0||d>.8)return;const r=28+d*110;ring(cx,380,r,d<.14?'#e0a800':'#e79aa8',Math.max(16,Math.round(r*.7)));});
    H.tk(288,36);if(MG.mt>0)H.tx(MG.ms,236,58);
    if(MG.jt>0)H.tx(MG.jm,cx,322);if(MG.c>=3)H.tx(MG.c+' COMBO',cx,8);
    if(MG.e<3)H.tx('링이 가운데 원에 겹칠 때 탭!',cx,340);
    $('mgh').textContent='시간 '+Math.max(0,Math.ceil(30-MG.e))+'  바퀴 '+Math.floor(MG.rot);
    if(MG.e>=30){mg4End();return;}MG.raf=requestAnimationFrame(loop);};MG.raf=requestAnimationFrame(loop);}
function mg4End(){MG.raf=0;const lp=Math.floor(MG.rot),td=todayStr();if(S.mg.d!==td)S.mg={...S.mg,d:td,n:0};let ms;
  if(S.mg.n<ECO.mgPlays){const r=lp>=40?2:lp>=20?1:0;if(r)S.mg.n++;S.acorns+=r;ms=r?'🌰 +'+r+' 받았어요!':'20바퀴부터 도토리를 받아요 (보상 기회는 아직 남았어요)';}else ms='오늘 보상은 다 받았어요 (연습은 계속 가능!)';
  const nb=lp>(S.mg.b4||0);if(nb)S.mg.b4=lp;save();sfx('fan');$('mgh').innerHTML='끝! '+lp+'바퀴 · 최대 콤보 '+MG.bc+(nb?' · 최고 기록!':'')+'<br>'+ms;$('mgr').style.display='';
  if(lp>=20)setTimeout(()=>tako('=토리가 신나게 달렸다코~! 🎡','',3000,0),500);}
/* ===== 👻 유령 잡기 (할로윈 주간 10/25~31) · 호박 등불에서 튀어나오는 유령을 탭! 박쥐는 피하기 · 보상 횟수는 다른 미니게임과 합산 ===== */
const halWeek=()=>{const md=todayStr().slice(5);return md>='10-25'&&md<='10-31';};
const GH_P=[[64,206],[160,206],[256,206],[64,300],[160,300],[256,300],[64,394],[160,394],[256,394]];   /* 호박 9개 (가운데 x, 밑동 y) */
function mg5Open(){if($('mg'))return;const o=document.createElement('div');o.id='mg';o.style.cssText='position:fixed;inset:0;z-index:70;background:#1f1630;display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:none;color:#fffaf0';
  o.innerHTML='<div id="mgh" style="margin-bottom:8px;text-align:center"></div><canvas id="mgc" width="320" height="440" style="max-width:100%;max-height:74vh;image-rendering:pixelated;border:4px solid #fffaf0;background:#261b3a;touch-action:none"></canvas><div class="row" style="margin-top:10px;width:min(320px,90%)"><button class="btn ghost full" onclick="mgClose()">닫기</button><button class="btn full" id="mgr" style="display:none" onclick="mg5Start()">한 번 더</button></div>';
  document.body.appendChild(o);$('mgc').addEventListener('pointerdown',e=>{e.preventDefault();const r=e.target.getBoundingClientRect();mg5Tap((e.clientX-r.left)*320/r.width,(e.clientY-r.top)*440/r.height);});mg5Start();}
function mg5Tap(x,y){if(!MG.raf)return;let b=null;MG.U.forEach(u=>{if(u.hit)return;const P=GH_P[u.p],top=P[1]-46-u.h;if(Math.abs(x-P[0])<=30&&y>=top-6&&y<=P[1]-8&&(!b||u.k==='b'))b=u;});
  if(!b){MG.miss=.25;return;}b.hit=1;b.t=Math.min(b.t,.2);const P=GH_P[b.p];
  if(b.k==='b'){MG.s=Math.max(0,MG.s-2);MG.c=0;MG.sh=.3;fxSnd('gh_bat');MG.fx.push({x:P[0],y:P[1]-60,t:.6,m:'-2',bad:1});return;}
  const v=b.k==='g'?3:1;MG.s+=v;MG.c++;MG.bc=Math.max(MG.bc,MG.c);fxSnd(b.k==='g'?'gh_purple':'gh_catch');MG.fx.push({x:P[0],y:P[1]-60,t:.6,m:'+'+v,pf:1});}
function mg5Start(){if(MG.raf)cancelAnimationFrame(MG.raf);MG={e:0,l:0,raf:0,s:0,c:0,bc:0,U:[],sp:.6,fx:[],miss:0,mt:2.2,ms:'유령이 나온다코! 박쥐는 누르지 마라코!'};$('mgr').style.display='none';mgPlay('gh');
  const c=$('mgc'),g=c.getContext('2d');g.imageSmoothingEnabled=false;if(!TKI){TKI=new Image();TKI.src=TAKO;}const H=mgH(g);
  const loop=ts=>{if(!$('mg'))return;if(!MG.l)MG.l=ts;const dt=Math.min(.05,(ts-MG.l)/1000);MG.l=ts;MG.e+=dt;MG.sp-=dt;if(MG.mt>0)MG.mt-=dt;if(MG.miss>0)MG.miss-=dt;
    if(MG.sp<=0&&MG.e<29.3){const free=GH_P.map((p,i)=>i).filter(i=>!MG.U.some(u=>u.p===i));if(free.length){const r=Math.random(),life=Math.max(.62,1.15-MG.e*.018);
      MG.U.push({p:free[Math.floor(Math.random()*free.length)],k:r<.07?'g':r<.27?'b':'w',t:life,L:life,h:0,hit:0});}MG.sp=Math.max(.32,.62-MG.e*.01)*(.75+Math.random()*.5);}
    g.save();if(MG.sh>0){MG.sh-=dt;g.translate(Math.round(Math.sin(MG.e*90)*3/2)*2,0);}
    g.drawImage(ghBack(),0,0);
    MG.U=MG.U.filter(u=>{u.t-=dt;const a=u.t/u.L,up=Math.min(1,(1-a)*5,a*5);u.h=Math.round(up*34/2)*2;
      if(u.t<=0){if(!u.hit&&u.k!=='b')MG.c=0;return false;}return true;});
    GH_P.forEach((P,i)=>{const u=MG.U.find(v=>v.p===i),lit=u&&!u.hit;
      fxShadow(g,P[0],P[1]+4,64);
      if(lit)g.drawImage(fxGlow(u.k==='g'?'#c58cf0':u.k==='b'?'#ff5a5a':'#ffb347',44),P[0]-44,P[1]-46-8);
      else g.drawImage(fxGlow('#ff8a2a',32),P[0]-32,P[1]-46+4);
      if(u){const y=P[1]-46-u.h,x=P[0]-22;if(u.hit&&u.k!=='b')g.globalAlpha=Math.max(0,u.t/.2);
        if(u.k==='b'){const fl=Math.floor(MG.e*8)%2;g.drawImage(fxS('bt'+fl),P[0]-24,y+(fl?4:0)+8);}
        else{if(u.k==='g'&&!u.hit)g.drawImage(fxGlow('#c58cf0',34),P[0]-34,y-8);g.drawImage(fxS(u.hit?'ghX':'gh'+(Math.floor(MG.e*4+i)%2?'A':'B'),u.k==='g'?'purp':null),x,y+(u.hit?0:Math.round(Math.sin(MG.e*6+i))*2));}g.globalAlpha=1;}
      g.drawImage(fxS(lit?'pk1':'pk0'),P[0]-28,P[1]-46);});
    MG.fx=MG.fx.filter(f=>{f.t-=dt;f.y-=30*dt;if(f.pf){g.fillStyle='#fff0a6';for(let k=0;k<8;k++){const a=k*.785,r=(1-f.t/.6)*26;g.fillRect(Math.round((f.x+Math.cos(a)*r)/2)*2-2,Math.round((f.y+20+Math.sin(a)*r)/2)*2-2,4,4);}}fxTx(g,f.m,f.x,f.y,16,f.bad?'#ff7a7a':'#fff0a6');return f.t>0;});
    g.restore();
    /* 점수판 (주황 나무 창) */
    fxPanel(g,2,2,316,32);fxTd(g,'시간 '+Math.max(0,Math.ceil(30-MG.e)),52,19,15);fxTd(g,'점수 '+MG.s,268,19,15);if(MG.c>=3)fxTd(g,MG.c+' COMBO',160,19,15,'#c2481a');else g.drawImage(fxS('gh'+(Math.floor(MG.e*3)%2?'A':'B')),148,6,24,26);
    H.tk(288,66);if(MG.mt>0)fxMsg(g,MG.ms,106);if(MG.miss>0)fxTx(g,'놓쳤다코!',160,130,16,'#ff9a9a');
    $('mgh').textContent='👻 유령 잡기';
    if(MG.e>=30){mg5End();return;}MG.raf=requestAnimationFrame(loop);};MG.raf=requestAnimationFrame(loop);}
function mg5End(){MG.raf=0;const sc=MG.s,td=todayStr();if(S.mg.d!==td)S.mg={...S.mg,d:td,n:0};let m;
  if(S.mg.n<ECO.mgPlays){const r=sc>=24?2:sc>=12?1:0;if(r)S.mg.n++;S.acorns+=r;m=r?'🌰 +'+r+' 받았어요!':'12점부터 도토리를 받아요 (보상 기회는 아직 남았어요)';}else m='오늘 보상은 다 받았어요 (연습은 계속 가능!)';
  const nb=sc>(S.mg.b5||0);if(nb)S.mg.b5=sc;save();mgStop();fxSnd('gh_end');$('mgh').innerHTML=m;$('mgr').style.display='';{const g=$('mgc').getContext('2d');fxCard(g,'유령 잡기 끝!',[sc+'점 · 최대 콤보 '+MG.bc,nb?'최고 기록!':'최고 '+(S.mg.b5||0)+'점'],null);}
  if(sc>=12)setTimeout(()=>tako('=유령 사냥 대성공이다코~! 🎃','',3000,0),500);}
/* ===== v6.4 명절 미니게임 공통 · 도트 그림 원본은 tools/mg/fest_sprites.py (python3로 실행하면 그림 확인용 png) =====
   그림 한 칸 = 화면 2px로 통일, 빛은 왼쪽 위, 테두리는 진한 같은 색 계열 */
const FX={"S":{"gh0":[["....kkkkkkk.....","...kWWWwwwwk....","..kWWWwwwwwvk...",".kWWWwwwwwwvvk..",".kWWwwwwwwwvvk..","kwwwwwwwwwwvvvk.","kwwwwwWewwWevvk.","kwwwwweewweevvk.","kwwwwweewweevvk.","kwwwppwwwwwvpvk.","kwwwwwwwwevvvvk.","kwwwwwwwwvvvvvk.",".kwwwwwwwwvvvvk.","..kwwkkwwkkvvk..","...kk..kk..kk...","................"],{"k":"#3a2a52","w":"#f6f2ff","v":"#c9bce8","W":"#ffffff","e":"#2a1c40","p":"#f4a3bd"}],"gh1":[["....kkkkkkk.....","...kWWWwwwwk....","..kWWWwwwwwvk...",".kWWWwwwwwwvvk..",".kWWwwwwwwwvvk..","kwwwwwwwwwwvvvk.","kwwwwwWewwWevvk.","kwwwwweewweevvk.","kwwwwweewweevvk.","kwwwppwwwwwvpvk.","kwwwwwwwwevvvvk.","kwwwwwwwwvvvvvk.",".kwwwwwwwwvvvvk.",".kwkkwwkkwvkkvk.","..k..kk..kk..k..","................"],{"k":"#3a2a52","w":"#f6f2ff","v":"#c9bce8","W":"#ffffff","e":"#2a1c40","p":"#f4a3bd"}],"to0":[["...khHHkk.......","....khhHHk......","....khhhHHk.....","...khhhhhHHk....","..khyyYyyyyhk...",".khhhhhhhhHHHk..","..kkLLooooOkk...","..kLLLooooOOk...",".kLLLLooooOOOk..","koooooooccWeOOk.","kooooocccceecOk.","kooooocccccccOpk","koooooccccccrrk.",".kOOOOccccccck..","..kOOOOCCCCCk...","...kkPOOCkPk...."],{"k":"#3b2a1e","o":"#e9a85c","O":"#c47f3c","L":"#f6c98a","c":"#fff3dc","C":"#ecd3a9","p":"#f4a3ad","e":"#2a1c12","W":"#ffffff","r":"#f08a8a","P":"#f4a3ad","h":"#7b55b5","H":"#4e3480","y":"#f4c542","Y":"#fff0a6"}],"to1":[["...khHHkk.......","....khhHHk......","....khhhHHk.....","...khhhhhHHk....","..khyyYyyyyhk...",".khhhhhhhhHHHk..","..kkLLooooOkk...","..kLLLooooOOk...",".kLLLLooooOOOk..","koooooooccWeOOk.","kooooocccceecOk.","kooooocccccccOpk","koooooccccccrrk.",".kOOOOccccccck..","..kOOOOCCCCCk...","...kkkPOCkkPk..."],{"k":"#3b2a1e","o":"#e9a85c","O":"#c47f3c","L":"#f6c98a","c":"#fff3dc","C":"#ecd3a9","p":"#f4a3ad","e":"#2a1c12","W":"#ffffff","r":"#f08a8a","P":"#f4a3ad","h":"#7b55b5","H":"#4e3480","y":"#f4c542","Y":"#fff0a6"}],"candy":[["...k...","..kwk..","..kwk..",".koook.",".kooOk.","kyyyyYk","kyyyyYk",".kkkkk."],{"k":"#4a2a1a","w":"#fffaf0","o":"#f39a3a","O":"#cf6f22","y":"#f6d04d","Y":"#d9a72a"}],"lan0":[["......kGk.....",".....kgGk.....","...kkogGokk...","..kLooooooOk..",".kLLfoooofOOk.","kLLffooooffOOk","kooOooooooOOOk","oooOooffooOOOO","kooOofooofOOOk","kooffffffffOOk",".koOfofOfofOk.","..kOOOOOOOOk..","...kkOOOOkk..."],{"k":"#4a2412","o":"#f08a2c","O":"#c9601c","L":"#ffb45e","g":"#5f9a3e","G":"#3f6e2e","f":"#fff3a0","F":"#ffd04a"}],"lan1":[["......kGk.....",".....kgGk.....","...kkogGokk...","..kLooooooOk..",".kLLFooooFOOk.","kLLFFooooFFOOk","kooOooooooOOOk","oooOooFFooOOOO","kooOoFoooFOOOk","kooFFFFFFFFOOk",".koOFoFOFoFOk.","..kOOOOOOOOk..","...kkOOOOkk..."],{"k":"#4a2412","o":"#f08a2c","O":"#c9601c","L":"#ffb45e","g":"#5f9a3e","G":"#3f6e2e","f":"#fff3a0","F":"#ffd04a"}],"heart":[[".kk.kk.","krrkrrk","krRrrrk",".krrrk.","..krk..","...k..."],{"k":"#4a1a22","r":"#e84a5f","R":"#ffb3c0"}],"gift":[["..k...k..",".kyk.kyk.","kkkkykkkk","kbbbybbBk","kyyyyyyyk","kbbbybbBk","kbbbybbBk","kBBBYBBBk","kkkkkkkkk"],{"k":"#3b1a1a","b":"#e0483c","B":"#a8302a","y":"#ffd84a","Y":"#d9a72a"}],"deer0":[["...................aa.aa.a....","....................AaAaa.....","...................kkakka.....","..................kBBbbbbk..k.","...................kbbbebbkkNk","..................kbbbbebbbnnn","..................kbbbbbbbccnN","..................kbBBBBBcckkk",".................kbbbBkkkkk...","...k...kkkkkkkkkkkbbbBk.......","..kck.kllllllllbbrbbbk........","..kllklllllllllbbrbbbk........","...kkbbbbbbbbbbbbybbk.........","...kbbbbbbbbbbbbbybbbk........","....kbbbbbbbbbbbbrbbk.........",".....kBBBBBBBBBBBrBk..........","......kBccccccccBBkBk.........",".....kBkkBkkkkkkBk.kBkk.......","...kkBk.kBk.....kBkkkBhk......","..khBk.kBk.......kBhkkk.......","...kk..khk........kk..........","........k....................."],{"k":"#2e1d12","b":"#a8693a","B":"#7a4a26","l":"#c98b55","c":"#ead2a8","n":"#ff3030","N":"#ff9a8a","e":"#1a100a","a":"#d8b27a","A":"#a8844f","h":"#3b2a1e","r":"#d23a32","y":"#f4c542"}],"deer1":[["...................aa.aa.a....","....................AaAaa.....","...................kkakka.....","..................kBBbbbbk..k.","...................kbbbebbkkNk","..................kbbbbebbbnnn","..................kbbbbbbbccnN","..................kbBBBBBcckkk",".................kbbbBkkkkk...","...k...kkkkkkkkkkkbbbBk.......","..kck.kllllllllbbrbbbk........","..kllklllllllllbbrbbbk........","...kkbbbbbbbbbbbbybbk.........","...kbbbbbbbbbbbbbybbbk........","....kbbbbbbbbbbbbrbbk.........",".....kBBBBBBBBBBBrBk..........","......kBccccccccBBkBk.........",".....kBkkBkkkkkkBkkBk.........",".....kBkBk.....kBk.kBk........",".....khBk......kBk.khk........","....khkk........khk.k.........",".....k...........k............"],{"k":"#2e1d12","b":"#a8693a","B":"#7a4a26","l":"#c98b55","c":"#ead2a8","n":"#ff3030","N":"#ff9a8a","e":"#1a100a","a":"#d8b27a","A":"#a8844f","h":"#3b2a1e","r":"#d23a32","y":"#f4c542"}],"sleigh":[["...............kkkrrrrk...............",".............kkrrrrrrrrk..............",".......k.k..kwrkwwwwwwwwk.............","......kGkQk.kwwkkffffffk..............","....kkggkqqk.kkkfffffeffk........kkk..","...kQqsssSk....kfffffWWpk.......ktttk.","...ksSSSSSSk....kwwwwwwwk......ktDkktk","..kssssssSSSk..krwwwwwwk.......kDDtktk","..kssssssSSSk.krrrwwwwwk......ktDDktk.",".ksssssssSSSSkrrrrrwwwRRkkkk.ktdDDkk..",".ksssssssSSSSkrrrrrrwwRrrrrmktddDDk...","..kssssssSSSkrrrrrrrrRRRrrkmtdddDDk...","..ksttttttttttttttttttttttttddddDDk...","...kdddddddddddddddddddddddddddddk....","...kDDDDDDDDDDDDDDDDDDDDDDDDDDDDDk....","...kDDDDDDttDDDDDDDDttDDDDDDDDDDDk....","...kDDDDDDtDtDDDDDDDtDtDDDDDDDDDDk....","...kDDDDDDDtDDDDDDDDDtDDDDDDDDDDDk....","...ktttttttttttttttttttttttttttkk..k..","...kDDDDDDDDDDDDDDDDDDDDDDDDDDDk..kuk.","...kDDDDDDDDDDDDDDDDDDDDDDDDDDDk...kuk","..kukkkkukkkkkkkukkkkkkkukkkkkuk...kuk","..kukkkkukkkkkkkukkkkkkkukkkkkukkkkuk.","...kuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuk..","....kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk...","......................................"],{"k":"#2a1410","s":"#b07a46","S":"#87582e","g":"#4fae5a","G":"#2f7a3c","q":"#5f9ae8","Q":"#ffd84a","r":"#e0453a","R":"#a82e28","m":"#3f6e2e","f":"#f6c7a0","w":"#ffffff","W":"#e8e4ee","e":"#2a1410","p":"#f08a8a","d":"#d63a32","D":"#9e2620","t":"#f4c542","u":"#d9a72a"}],"star":[[".....k.....","....kyk....","....kyk....","kkkkyyykkkk","kyyyyyyyYYk",".kyyyyyyYk.","..kyyyyYk..",".kyyykyyYk.",".kyYk.kYYk.",".kkk...kkk."],{"k":"#8a5a10","y":"#ffd84a","Y":"#e8a82a"}]},"P":{"purp":{"k":"#2a1646","w":"#9a6ed8","v":"#7448b4","W":"#c7a8f2","e":"#1c0f33","p":"#f2a3c8"},"purp2":{"k":"#2e1240","w":"#b66ad0","v":"#8a46a8","W":"#dca6ee","e":"#1f0b2c","p":"#f8b0d0"},"mint":{"k":"#1f4a44","w":"#e3fbf1","v":"#9ad9c0","W":"#ffffff","e":"#173a35","p":"#f4a3bd"},"scared":{"k":"#1b2557","w":"#4a68d8","v":"#3449a8","W":"#7f98f0","e":"#fff3c8","p":"#4a68d8"},"flash":{"k":"#5a2a3a","w":"#fff3f6","v":"#e7c6d0","W":"#ffffff","e":"#d9483b","p":"#fff3f6"},"g0":{"k":"#3b1a1a","b":"#e0483c","B":"#a8302a","y":"#ffd84a","Y":"#d9a72a"},"g1":{"k":"#173a22","b":"#4fae5a","B":"#2f7a3c","y":"#ff6b6b","Y":"#c94a4a"},"g2":{"k":"#1a2a4a","b":"#5f9ae8","B":"#3c6ab8","y":"#fffaf0","Y":"#d8d0c0"},"g3":{"k":"#3a2a52","b":"#a77be0","B":"#7650b0","y":"#ffd84a","Y":"#d9a72a"}}};
const fxC={};
function fxS(n,pk,fl){const k=n+'|'+(pk||'')+'|'+(fl?1:0);if(fxC[k])return fxC[k];const r=FX.S[n][0],p=pk?{...FX.S[n][1],...FX.P[pk]}:FX.S[n][1],c=document.createElement('canvas');c.width=r[0].length*2;c.height=r.length*2;const g=c.getContext('2d');
  r.forEach((row,j)=>[...row].forEach((ch,i)=>{if(ch!=='.'&&p[ch]){g.fillStyle=p[ch];g.fillRect((fl?row.length-1-i:i)*2,j*2,2,2);}}));return fxC[k]=c;}
function fxCv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;return[c,g];}
/* v7.5 유령 잡기 그림: 도트 한 칸=2px, 빛은 왼쪽 위, 그림 원본 tools/mg/halloween_sprites.py (ghA·ghB·ghX 유령, pk0·pk1 호박, bt0·bt1 박쥐) */
Object.assign(FX.S,{"ghA":[["........kkkkk.........","......kkWWwwwkk.......","....kkWWWwwwwwwkk.....","...kWWWWwwwwwwwvvk....","...kWWWwwwwwwwwvvk....","..kWWWwwwwwwwwwvvvk...","..kWWWwwwwwwwwwvvvk...",".kwwwwWewwwwwWevvvvk..",".kwwwweewwwwweevvvvk..",".kwwwweewwwwweevvvvk..",".kwwwweewwwwweevvvvk..",".kwwwweewwwwweevvvvkk.","kwwwppwwwwwwwwwvppvvvk","kwwwppwwwweewwwvppvkvk",".kwwwwwwweeeevvvvvvkk.",".kwwwwwwweeeevvvvvvk..",".kwwwwwwwweewvvvvvvk..",".kwwwwwwwwwwwvvvvvvk..",".kwwwwwwwwwwwvvvvvvvk.","..kwwwkkkwwwkkkvvvkk..","...kwwk..kwwk..kvvk...","...kwk...kwk...kvk....","....k.....k.....k.....","......................"],{"k":"#3a2a52","w":"#f6f2ff","v":"#c9bce8","W":"#ffffff","e":"#2a1c40","p":"#f4a3bd"}],"ghB":[["........kkkkk.........","......kkWWwwwkk.......","....kkWWWwwwwwwkk.....","...kWWWWwwwwwwwvvk....","...kWWWwwwwwwwwvvk....","..kWWWwwwwwwwwwvvvk...","..kWWWwwwwwwwwwvvvk...",".kwwwwWewwwwwWevvvvk..",".kwwwweewwwwweevvvvk..",".kwwwweewwwwweevvvvk..","kkwwwweewwwwweevvvvkkk","wwwwwweewwwwweevvvvkvv","kwwwppwwwwwwwwwvppvvvk","kwwwppwwwweewwwvppvkvk",".kwwwwwwweeeevvvvvvkk.",".kwwwwwwweeeevvvvvvk..",".kwwwwwwwweewvvvvvvk..",".kwwwwwwwwwwwvvvvvvk..",".kwwwwwwwwwwwvvvvvvvk.",".kwkkkwwwkkkwvvkkkvvk.",".kwk..kwwk..kvvk..kvk.","..k...kwk...kvk....k..",".......k.....k........","......................"],{"k":"#3a2a52","w":"#f6f2ff","v":"#c9bce8","W":"#ffffff","e":"#2a1c40","p":"#f4a3bd"}],"ghX":[["........kkkkk.........","......kkWWwwwkk.......","....kkWWWwwwwwwkk.....","...kWWWWwwwwwwwvvk....","...kWWWwwwwwwwwvvk....","..kWWWwwwwwwwwwvvvk...","..kWWWwwwwwwwwwvvvk...",".kwwwwewwewwwewvevvk..",".kwwwwweewwwwweevvvk..",".kwwwwweewwwwweevvvk..",".kwwwwewwewwwewvevvk..",".kwwwwwwwwwwwwwvvvvkk.","kwwwppwwwwwwwwwvppvvvk","kwwwppwwewwwewwvppvkvk",".kwwwwwweeeeevvvvvvkk.",".kwwwwwwwwwwwvvvvvvk..",".kwwwwwwwwwwwvvvvvvk..",".kwwwwwwwwwwwvvvvvvk..",".kwwwwwwwwwwwvvvvvvvk.","..kwwwkkkwwwkkkvvvkk..","...kwwk..kwwk..kvvk...","...kwk...kwk...kvk....","....k.....k.....k.....","......................"],{"k":"#3a2a52","w":"#f6f2ff","v":"#c9bce8","W":"#ffffff","e":"#2a1c40","p":"#f4a3bd"}],"pk0":[["............................",".................k..........","................kgk.........",".............kkkgGk.........","............kGGgkk..........","...........kGlggGk..........",".......kkkkLOlgGokkkk.......",".....kkOOOLLOGgGooOOOkk.....","....kHLOOHLLOOOOoodOOook....","...kkHLOOoLLOOOOoodoOookk...","..kLHHLOLoeLOOOOoeddOoodok..",".kHLLLLOLeeLOOOOoeedOoodook.",".kHLLLLOeeeeOOOOeeeeOooddok.","kLLOOOOeeeeeeOOeeeeeeooddodk","kOOOOOOOOoOOOOOOooddOooddodk","kOOOOOOOOoOOOOOOooddOooddodk","kOOOOOOOeeOOeeOOeeddOooddodk","kOOOOOOeeOOeeOOeeOOeeoodoodk",".koooooeeeeeeeeeeeeeeoodook.",".koooooeeeeeeeeeeeeeeoooook.","..kddooeeeooeeooeeooeooddk..","...kkkkddddddddddddddkkkk...",".......kkkkkkddkkkkkk.......",".............kk............."],{"k":"#3a1408","d":"#8f3a12","o":"#c4561a","O":"#f08a1f","L":"#ffb347","H":"#ffd98a","g":"#4d7a2a","G":"#2f5a1e","l":"#7fae3a","e":"#2b0f06","y":"#ffd96a","Y":"#f4a42a"}],"pk1":[["............................",".................k..........","................kgk.........",".............kkkgGk.........","............kGGgkk..........","...........kGlggGk..........",".......kkkkLOlgGokkkk.......",".....kkOOOLLOGgGooOOOkk.....","....kHLOOHLLOOOOoodOOook....","...kkHLOOoLLOOOOoodoOookk...","..kLHHLOLoyLOOOOoyddOoodok..",".kHLLLLOLyyLOOOOoyydOoodook.",".kHLLLLOyyyyOOOOyyyyOooddok.","kLLOOOOyyyyyyOOyyyyyyooddodk","kOOOOOOOOoOOOOOOooddOooddodk","kOOOOOOOOoOOOOOOooddOooddodk","kOOOOOOOyyOOyyOOyyddOooddodk","kOOOOOOyYyOOyYOOyyOOyoodoodk",".koooooyyyyyYyyyyYyyyoodook.",".koooooyyyyYyyyyYyyyyoooook.","..kddooyyyooyyooyyooyooddk..","...kkkkddddddddddddddkkkk...",".......kkkkkkddkkkkkk.......",".............kk............."],{"k":"#3a1408","d":"#8f3a12","o":"#c4561a","O":"#f08a1f","L":"#ffb347","H":"#ffd98a","g":"#4d7a2a","G":"#2f5a1e","l":"#7fae3a","e":"#2b0f06","y":"#ffd96a","Y":"#f4a42a"}],"bt0":[["MMMkk..............kkMMM","mmmMMkk..k....k..kkMMmmm","nnnmmMMkkmk..kmkkMMmmnnn","nnnnnmmMMmpkkpmMMmmnnnnn","nnnnnnnmmkmmmmkmmnnnnnnn","nnnnnnnnnmmmmnnnnnnnnnnn","nnnnnnnnnmmmmnnnnnnnnnnn","nnnnnnnnnmrmmrnnnnnnnnnn","nnnnnnnkkmmmmnnkknnnnnnn","nnnnnkk.kmmmmnnk.kknnnnn","nnnkk...kmmwwnnk...kknnn","nkk......kmmmnk......kkn","k.........kkkk.........k","........................"],{"k":"#1a0f2e","m":"#4a3a6e","M":"#6a5694","n":"#2e2250","r":"#ff5a5a","w":"#fffaf0","p":"#e89ab6"}],"bt1":[["........................",".........k....k.........","........kmk..kmk........","........kmpkkpmk........",".........kmmmmk.........","........kmmmmnnk........",".....kkkkmmmmnnkkkk.....",".kkkkMMMMmrmmrnMMMMkkkk.","kMMMMmmmmmmmmnnmmmmMMMMk","MmmmmnnnnmmmmnnnnnnmmmmM","mnnnnnnnnmmwwnnnnnnnnnnm","nnnnnnnkkkmmmnkkknnnnnnn","nnnnnkk...kkkk...kknnnnn","kkkkk..............kkkkk"],{"k":"#1a0f2e","m":"#4a3a6e","M":"#6a5694","n":"#2e2250","r":"#ff5a5a","w":"#fffaf0","p":"#e89ab6"}]});
let GHB=null;function ghBack(){if(GHB)return GHB;const[c,g]=fxCv(320,440),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);},H=(x,y,k)=>sdH(x>>1,y>>1,k);
  /* 하늘: 띠 8개 사이를 바둑 디더로 부드럽게 */
  const SK=['#0d0820','#130c2a','#1a1136','#231845','#2d1d55','#3c2663','#52306d','#74407a'],BH=16;
  for(let b=0;b<8;b++){P(0,b*BH,320,BH,SK[b]);if(b<7)for(let y=0;y<6;y+=2)for(let x=0;x<320;x+=2)if(((x+y)/2)%2===(y/2)%2&&y<4+((x>>1)%2)*2)P(x,b*BH+BH+y-6,2,2,SK[b+1]);}
  /* 별 */
  for(let i=0;i<46;i++){const x=Math.floor(H(i,1,5)*158)*2,y=Math.floor(H(i,2,5)*54)*2;const big=i%9===0;P(x,y,2,2,i%4?'#cfc4e6':'#fff0a6');if(big){P(x-2,y,2,2,'#8e84b8');P(x+2,y,2,2,'#8e84b8');P(x,y-2,2,2,'#8e84b8');P(x,y+2,2,2,'#8e84b8');}}
  /* 달 (왼쪽 위): 빛무리 → 둥근 달 → 분화구 */
  const mx=84,my=60,mr=26;
  for(const[r,a]of[[50,.07],[42,.1],[34,.14]]){g.globalAlpha=a;for(let y=-r;y<=r;y+=2)for(let x=-r;x<=r;x+=2)if(x*x+y*y<=r*r)P(mx+x,my+y,2,2,'#fff0a6');}g.globalAlpha=1;
  for(let y=-mr;y<mr;y+=2)for(let x=-mr;x<mr;x+=2){const dx=x+1,dy=y+1;if(dx*dx+dy*dy>mr*mr)continue;const l=-dx*.7-dy*.7;P(mx+x,my+y,2,2,l>16?'#fffbe0':l>-4?'#f8edb4':l>-20?'#e6d48c':'#cdb874');}
  [[-8,-6,5],[8,4,6],[-4,12,4],[10,-10,3]].forEach(([x,y,r])=>{for(let j=-r;j<=r;j+=2)for(let i=-r;i<=r;i+=2)if(i*i+j*j<=r*r)P(mx+x+i,my+y+j,2,2,i<0&&j<0?'#b9a35e':'#d4bf7c');});
  /* 구름: 위는 어둡고 달 쪽 아랫변만 밝게 */
  [[150,40,70,6],[200,84,90,8],[20,96,60,6],[250,26,50,4]].forEach(([x,y,w,h],k)=>{for(let j=0;j<h;j++){const ww=Math.round(w*(1-Math.abs(j-h/2)/(h*1.3)));for(let i=0;i<ww;i+=2)P(x+i+j*2,y+j*2,2,2,j>=h-2&&i<ww*.6?'#6a4a8e':'#2a1d4a');}});
  /* 먼 언덕 + 유령의 집 + 죽은 나무 */
  for(let x=0;x<320;x+=2){const h=Math.round((118-6*Math.sin(x*.025)-4*Math.sin(x*.07+1))/2)*2;P(x,h,2,134-h,'#190f2c');if(x>0&&H(x,h)>.8)P(x,h-2,2,2,'#190f2c');}
  const HC='#120a22',HL='#2c1d4a';
  P(214,84,52,40,HC);P(214,84,2,40,HL);P(224,66,16,18,HC);P(224,66,2,18,HL);P(250,74,14,10,HC);
  for(let i=0;i<14;i+=2){P(214+i*2+2,76-i,52-i*4-4>0?52-i*4-4:2,2,HC);}
  for(let i=0;i<8;i+=2){P(224+i,58+(8-i)-6+2,16-i*2,2,HC);}P(231,52,2,8,HC);
  [[220,92],[236,92],[252,92],[228,106],[244,106],[230,72]].forEach(([x,y],k)=>{P(x,y,6,8,k===3?'#ffb347':'#ffd96a');P(x,y,2,2,'#fff0a6');P(x+2,y+2,2,6,'#a8741a');});
  P(238,112,8,12,'#2e1e44');
  P(14,92,4,34,HC);P(10,84,4,10,HC);P(18,78,4,16,HC);P(6,76,4,10,HC);P(22,70,4,10,HC);P(2,92,12,2,HC);P(18,98,12,2,HC);P(26,90,4,10,HC);
  /* 묘지: 비석 · 십자가 · 쇠 울타리 */
  const TB=(x,y,w,h,kind)=>{const L='#9a94b8',M='#76709a',D='#4e4872';for(let j=0;j<h;j+=2)for(let i=0;i<w;i+=2){const r=Math.min(i,w-2-i);if(kind===0&&j<6&&r<6-j)continue;P(x+i,y+j,2,2,i<2?L:i>=w-4?D:M);}
    P(x,y+h,w,2,'#2a2542');if(kind===0)P(x+w/2-2,y+8,4,2,D);if(kind===1){P(x+w/2-2,y,4,h,M);P(x+w/2-8,y+8,16,4,M);P(x+w/2-8,y+8,16,2,L);}};
  [[22,118,16,22,0],[56,124,14,18,0],[92,114,18,26,0],[132,122,10,18,1],[176,116,16,22,0],[268,120,14,20,0],[300,124,12,16,0]].forEach(([x,y,w,h,k])=>{k===1?TB(x,y,16,h,1):TB(x,y,w,h,k);});
  P(0,142,320,2,'#0b0716');P(0,150,320,2,'#0b0716');for(let x=2;x<320;x+=12){P(x,134,2,18,'#0b0716');P(x-2,132,6,2,'#0b0716');P(x,130,2,2,'#0b0716');}
  /* 땅: 어두운 풀밭 + 점 무늬 + 안개 */
  for(let y=152;y<440;y+=2)for(let x=0;x<320;x+=2){const t=(y-152)/288,base=t<.12?'#243420':t<.5?'#2a3c24':'#223220';P(x,y,2,2,base);const r=H(x,y,9);if(r<.1)P(x,y,2,2,'#35502a');else if(r<.16)P(x,y,2,2,'#1c2a1a');}
  g.globalAlpha=.16;for(let y=146;y<176;y+=2)for(let x=0;x<320;x+=2)if(((x+y)>>1)%2===0&&H(x,y,3)<1-(y-146)/30)P(x,y,2,2,'#b9a6e0');g.globalAlpha=1;
  /* 풀 뭉치 · 낙엽 · 작은 버섯 */
  for(let i=0;i<46;i++){const x=Math.floor(H(i,4,11)*156)*2,y=156+Math.floor(H(i,6,11)*140)*2;if(y>430)continue;P(x,y,2,4,'#4a7a35');P(x-2,y+2,2,2,'#3c6a2c');P(x+2,y+2,2,2,'#3c6a2c');P(x,y,2,2,'#6aa04a');}
  for(let i=0;i<16;i++){const x=Math.floor(H(i,8,13)*156)*2,y=160+Math.floor(H(i,9,13)*136)*2;P(x,y,4,2,i%2?'#c4561a':'#a86a24');P(x+2,y+2,2,2,i%2?'#8f3a12':'#7a4a18');}
  [[30,250],[290,330],[40,410]].forEach(([x,y])=>{P(x,y,6,2,'#e8dcc8');P(x-2,y+2,10,2,'#d9483b');P(x,y+4,2,4,'#e8dcc8');P(x+4,y+4,2,2,'#e8dcc8');P(x+2,y+2,2,2,'#fffaf0');});
  /* 호박 아래 흙 둔덕 + 덩굴 */
  GH_P.forEach(([x,y])=>{for(let j=0;j<10;j+=2)for(let i=-40;i<=40;i+=2){const d=Math.hypot(i/40,(j-4)/6);if(d<=1){const lit=d>.62;P(x+i,y-4+j,2,2,j<4&&i<0?'#4d3a28':lit?'#2e2018':'#3a2a1e');}}});
  g.strokeStyle='#3a6a2a';g.lineWidth=2;[206,300,394].forEach(y=>{g.beginPath();for(let x=0;x<=320;x+=4)g.lineTo(x,Math.round((y+2+Math.sin(x*.07+y)*4)/2)*2);g.stroke();});
  for(let k=0;k<9;k++){const x=16+k*34,y=[206,300,394][k%3]+2;P(x,y-4,4,2,'#6aa04a');P(x+2,y-6,2,2,'#6aa04a');P(x,y-2,2,2,'#4a7a35');}
  /* 가장자리 어둡게 */
  for(let i=0;i<5;i++){g.globalAlpha=.12;P(0,i*2,320,2,'#000');P(0,440-i*2-2,320,2,'#000');}g.globalAlpha=1;
  return GHB=c;}
/* 도트식 둥근 빛 (2px 칸, 3단 밝기) */
function fxGlow(col,r){const k='glow'+col+r;if(fxC[k])return fxC[k];const[c,g]=fxCv(r*2,r*2);g.fillStyle=col;for(let y=0;y<r*2;y+=2)for(let x=0;x<r*2;x+=2){const d=Math.hypot(x+1-r,y+1-r)/r;if(d>1)continue;g.globalAlpha=d<.45?.38:d<.75?.22:.1;g.fillRect(x,y,2,2);}return fxC[k]=c;}
/* 도트 글꼴은 원래 크기에서만 또렷해요: 작은 글씨는 갈무리14(14px), 큰 글씨는 둥근모(16px). 그림자는 1칸만 (v6.7) */
const fxF=sz=>(sz||16)<=15?"14px Galmuri14,Galmuri11,monospace":"16px Galmuri11,monospace";
function fxTx(g,t,x,y,sz,col,al){g.font=fxF(sz);g.textAlign=al||'center';g.textBaseline='middle';g.fillStyle='rgba(20,12,30,.7)';g.fillText(t,Math.round(x)+1,Math.round(y)+1);g.fillStyle=col||'#fffaf0';g.fillText(t,Math.round(x),Math.round(y));}
function mgShell(bg,again){if($('mg'))return null;const o=document.createElement('div');o.id='mg';o.style.cssText='position:fixed;inset:0;z-index:70;background:'+bg+';display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:none;color:#fffaf0';
  o.innerHTML='<div id="mgh" style="margin-bottom:8px;text-align:center"></div><canvas id="mgc" width="320" height="440" style="max-width:100%;max-height:74vh;image-rendering:pixelated;border:4px solid #fffaf0;background:'+bg+';touch-action:none"></canvas><div class="row" style="margin-top:10px;width:min(320px,90%)"><button class="btn ghost full" onclick="mgClose()">닫기</button><button class="btn full" id="mgr" style="display:none" onclick="'+again+'">한 번 더</button></div>';
  document.body.appendChild(o);const c=$('mgc');c.getContext('2d').imageSmoothingEnabled=false;return c;}
const mgXY=(e,c)=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*320/r.width,(e.clientY-r.top)*440/r.height];};
/* 보상: r개(0~2) 주기 · 하루 횟수는 다른 미니게임과 합산 · low=true면 기록은 작을수록 좋음 */
function mgRw(r,fail,bk,rec,low){const td=todayStr();if(S.mg.d!==td)S.mg={...S.mg,d:td,n:0};let m;
  if(S.mg.n<ECO.mgPlays){if(r)S.mg.n++;S.acorns+=r;m=r?'🌰 +'+r+' 받았어요!':fail+' (보상 기회는 아직 남았어요)';}else m='오늘 보상은 다 받았어요 (연습은 계속 가능!)';
  const o=S.mg[bk]||0,nb=low?(!o||rec<o):rec>o;if(nb)S.mg[bk]=rec;save();return[m,nb];}
/* 결과 카드 (게임 화면 안) */
/* 요즘 도트 게임식 창: 주황 나무 테두리(왼쪽 위 밝게·오른쪽 아래 어둡게) + 크림색 종이 */
function fxPanel(g,x,y,w,h){const k='pn'+w+'x'+h;if(!fxC[k]){const[c,q]=fxCv(w,h),W=w/2,H=h/2,P=(a,b,col)=>{q.fillStyle=col;q.fillRect(a*2,b*2,2,2);};
    for(let b=0;b<H;b++)for(let a=0;a<W;a++){const e=Math.min(a,b,W-1-a,H-1-b),cor=(a<2||a>W-3)&&(b<2||b>H-3);if(cor&&((a===0||a===W-1)||(b===0||b===H-1)))continue;
      let col;if(e===0)col='#5b2b14';else if(e===1)col=(a===1||b===1)?'#ec9a45':'#c2621f';else if(e===2)col=(a===W-3||b===H-3)?'#8a3f12':'#d07a2c';else if(e===3)col='#7a3a14';else col=(a+b)%2&&sdH(a,b,71)<.25?'#f1cf90':'#f8dca2';P(a,b,col);}
    fxC[k]=c;}g.drawImage(fxC[k],Math.round(x/2)*2,Math.round(y/2)*2);}
function fxTd(g,t,x,y,sz,col,al){g.font=fxF(sz);g.textAlign=al||'center';g.textBaseline='middle';g.fillStyle=col||'#5b2b14';g.fillText(t,Math.round(x),Math.round(y));}
function fxMsg(g,t,y){g.font=fxF(14);const w=Math.ceil(g.measureText(t).width/2)*2+28;fxPanel(g,160-w/2,y-15,w,30);fxTd(g,t,160,y+1,14);}
function fxShadow(g,cx,cy,w){const k='sh'+w;if(!fxC[k]){const hh=Math.max(4,Math.round(w/3/2)*2),[c,q]=fxCv(w,hh);q.fillStyle='#0a0614';for(let y=0;y<hh;y+=2)for(let x=0;x<w;x+=2){const d=Math.hypot((x+1-w/2)/(w/2),(y+1-hh/2)/(hh/2));if(d<=1){q.globalAlpha=d<.6?.42:.26;q.fillRect(x,y,2,2);}}fxC[k]=c;}const c=fxC[k];g.drawImage(c,Math.round((cx-w/2)/2)*2,Math.round((cy-c.height/2)/2)*2);}
function fxCard(g,title,lines,stars){g.fillStyle='rgba(10,6,20,.5)';g.fillRect(0,0,320,440);fxPanel(g,32,128,256,stars!=null?184:160);
  fxTd(g,title,160,160,20,'#a8461a');
  if(stars!=null)for(let k=0;k<3;k++){g.globalAlpha=k<stars?1:.25;g.drawImage(fxS('star'),118+k*30-11,182);}g.globalAlpha=1;
  lines.forEach((l,i)=>fxTd(g,l,160,(stars!=null?232:198)+i*26,15));}
const mjWeek=()=>{const md=todayStr().slice(5);return md>='11-24'&&md<='11-30';};
const xmWeek=()=>{const md=todayStr().slice(5);return md>='12-18'&&md<='12-25';};
/* ===== v6.5 명절 미니게임 소리: 게임마다 전용 배경음악(칩튠 반복) + 효과음. 설정의 소리 켜기·크기를 따르고, 다른 미니게임처럼 70% 크기 ===== */
const MGA={tm:0,song:null,step:0,next:0,bus:null,nz:null};
function mgAC(){if(!S.snd||S.sv===0)return null;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC;}catch(e){return null;}}
const mgV=()=>.7*S.sv/100;
function mgN(t){const m=/^([A-G])([#b]?)(\d)$/.exec(t);if(!m)return 0;const n={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)+(+m[3]+1)*12;return 440*Math.pow(2,(n-69)/12);}
function mgOsc(f,t,len,type,vol,bus,f2){const A=AC,o=A.createOscillator(),v=A.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+len);
  v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(vol,t+.006);v.gain.exponentialRampToValueAtTime(.0001,t+len);o.connect(v);v.connect(bus||A.destination);o.start(t);o.stop(t+len+.03);}
function mgNz(t,len,vol,hp,bus,lp){const A=AC;if(!MGA.nz){const b=A.createBuffer(1,A.sampleRate*.6|0,A.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;MGA.nz=b;}
  const s=A.createBufferSource(),f=A.createBiquadFilter(),v=A.createGain();s.buffer=MGA.nz;f.type=lp?'lowpass':'highpass';f.frequency.value=hp;v.gain.setValueAtTime(vol,t);v.gain.exponentialRampToValueAtTime(.0001,t+len);s.connect(f);f.connect(v);v.connect(bus||A.destination);s.start(t,Math.random()*.3);s.stop(t+len+.02);}
/* 종: 맑은 금속 배음(1·2·2.76·4.07·5.4배)이 길게 울리다 사라짐 */
function mgBell(f,t,len,vol,bus){[[1,1,1],[2,.45,.7],[2.76,.32,.5],[4.07,.18,.35],[5.4,.1,.25]].forEach(([m,a,d])=>mgOsc(f*m,t,len*d,'sine',vol*a,bus));}
/* 징: 채로 치는 '쾅' (짧은 잡음) + 서로 어긋난 배음 여러 개가 맥놀이하며 길게 울림, 폰 스피커에서도 들리게 중음역을 두텁게 */
function mgGong(t,vol){const A=AC,bus=A.createGain();bus.gain.value=vol;bus.connect(A.destination);mgNz(t,.09,.5,180,bus,1);mgNz(t,.05,.25,900,bus,1);
  [[147,1,3.2],[149.5,.7,3.2],[221,.75,2.8],[312,.9,2.6],[316,.55,2.6],[418,.6,2.2],[533,.5,2],[701,.32,1.6],[889,.22,1.3],[1180,.12,1]].forEach(([f,a,d])=>{const o=A.createOscillator(),v=A.createGain();o.type='sine';o.frequency.setValueAtTime(f*1.012,t);o.frequency.exponentialRampToValueAtTime(f,t+.4);
    v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(a*.35,t+.012);v.gain.exponentialRampToValueAtTime(a*.22,t+.25);v.gain.linearRampToValueAtTime(a*.26,t+.6);v.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(v);v.connect(bus);o.start(t);o.stop(t+d+.05);});}
/* 악보: 한 칸 = 16분음표, '.' 쉼, '-' 앞 음 늘이기. 칸 문자열을 마디(|)로 나눠 적음 */
const mgTr=(s,p)=>({n:s.replace(/\|/g,' ').trim().split(/\s+/),p});
const P_LEAD=(v,g=.9,ty='square')=>(f,t,l,b)=>f&&mgOsc(f,t,Math.max(.05,l*g),ty,v,b);
const P_BASS=(v,ty='triangle')=>(f,t,l,b)=>f&&mgOsc(f,t,Math.max(.08,l*.85),ty,v,b);
const P_PLUCK=v=>(f,t,l,b)=>{if(!f)return;mgOsc(f,t,.45,'triangle',v,b);mgOsc(f*2,t,.12,'sine',v*.35,b);};
const P_BELL=v=>(f,t,l,b)=>f&&mgBell(f,t,1.6,v,b);
const P_DRUM=v=>(f,t,l,b,k)=>{if(k==='K'){mgOsc(140,t,.12,'sine',v*1.6,b,45);}else if(k==='S')mgNz(t,.09,v*.8,1500,b);else if(k==='H')mgNz(t,.03,v*.5,7000,b);else if(k==='J'){mgNz(t,.07,v*.6,6500,b);mgNz(t+.035,.05,v*.4,8000,b);}else if(k==='W'){mgOsc(900,t,.04,'sine',v*.9,b,700);mgNz(t,.02,v*.4,2500,b);}};
const MG_SONG={
  /* 유령 잡기: 통통 튀는 으스스한 E단조 */
  gh:{bpm:138,vol:.55,tr:[mgTr('E5 . . G5 . . B5 . A#5 . A5 . G5 . . .|E5 . . G5 . . B5 . C6 . B5 . A5 . . .|F#5 . . A5 . . C6 . B5 . A5 . G5 . F#5 .|E5 . B4 . E5 . G5 . F#5 - - - . . . .',P_LEAD(.07,.55)),
    mgTr('E3 . . . B2 . . . E3 . . . B2 . . .|E3 . . . B2 . . . A2 . . . B2 . . .|D3 . . . A2 . . . D3 . . . A2 . . .|E3 . . . B2 . . . E3 . B2 . E2 . . .',P_BASS(.16)),
    mgTr('K . H . . . H . K . H . . . H .|K . H . . . H . K . H . . . H .|K . H . . . H . K . H . . . H .|K . H . . . H . K . K . H . H .',P_DRUM(.12))]},
  /* 사탕 미로: 쫓고 쫓기는 A단조 아르페지오 */
  mz:{bpm:152,vol:.5,tr:[mgTr('A4 . C5 . E5 . A5 . G5 . E5 . C5 . E5 .|F4 . A4 . C5 . F5 . E5 . C5 . A4 . C5 .|G4 . B4 . D5 . G5 . F5 . D5 . B4 . D5 .|E4 . G#4 . B4 . E5 . D5 . B4 . G#4 . B4 .',P_LEAD(.05,.6)),
    mgTr('A2 . . . A3 . . . A2 . . . A3 . . .|F2 . . . F3 . . . F2 . . . F3 . . .|G2 . . . G3 . . . G2 . . . G3 . . .|E2 . . . E3 . . . E2 . . . G#2 . . .',P_BASS(.15)),
    mgTr('K . H . S . H . K . H . S . H H',P_DRUM(.1))]},
  /* 사탕 미로: 유령이 겁먹었을 때 빙글빙글 */
  mzp:{bpm:184,vol:.45,tr:[mgTr('B5 C6 D6 C6 B5 C6 D6 C6 A5 B5 C6 B5 A5 B5 C6 B5',P_LEAD(.045,.8)),mgTr('B2 . B3 . B2 . B3 . A2 . A3 . A2 . A3 .',P_BASS(.13)),mgTr('K . H H S . H H',P_DRUM(.09))]},
  /* 마작: 느긋한 5음계, 목탁 소리 */
  mj:{bpm:84,vol:.6,tr:[mgTr('E5 . . . G5 . A5 . . . G5 . E5 . . .|D5 . . . E5 . G5 - - - . . . . . .|A5 . . . G5 . E5 . D5 . . . C5 . . .|D5 . . . E5 - - - . . . . G4 . A4 .',P_PLUCK(.13)),
    mgTr('C3 - - - - - - - G2 - - - - - - -|A2 - - - - - - - E2 - - - - - - -|F2 - - - - - - - C3 - - - - - - -|G2 - - - - - - - G2 - - - - - - -',P_BASS(.12,'sine')),
    mgTr('W . . . . . . . W . . . W . . .',P_DRUM(.12))]},
  /* 썰매 배달: 징글벨(옛 민요, 저작권 끝남) + 방울 소리 */
  sn:{bpm:168,vol:.5,tr:[mgTr('E5 . . . E5 . . . E5 - - - - - . .|E5 . . . E5 . . . E5 - - - - - . .|E5 . . . G5 . . . C5 - - . . . D5 .|E5 - - - - - - - - - - - . . . .|F5 . . . F5 . . . F5 - - . . . F5 .|F5 . . . E5 . . . E5 . . . E5 . E5 .|E5 . . . D5 . . . D5 . . . E5 . . .|D5 - - - - - . . G5 - - - - - . .',P_LEAD(.06,.75)),
    mgTr('C3 . . . G2 . . . C3 . . . G2 . . .|C3 . . . G2 . . . C3 . . . G2 . . .|C3 . . . G2 . . . C3 . . . G2 . . .|C3 . . . G2 . . . C3 . . . E3 . . .|F2 . . . C3 . . . F2 . . . C3 . . .|C3 . . . G2 . . . C3 . . . G2 . . .|G2 . . . D3 . . . G2 . . . D3 . . .|G2 . . . D3 . . . G2 . . . B2 . . .',P_BASS(.15)),
    mgTr('J . H . J . H . J . H . J . H H',P_DRUM(.1)),
    mgTr('C6 '+'. '.repeat(31)+'G5 '+'. '.repeat(31)+'A5 '+'. '.repeat(31)+'G5 '+'. '.repeat(31),P_BELL(.07))]},
  /* 루돌프 잡기: 징글벨 앞부분(Dashing through the snow) + 후렴, 조금 빠르게 (옛 민요, 저작권 끝남) */
  ch:{bpm:176,vol:.5,tr:[mgTr('G4 . . . E5 . . . D5 . . . C5 . . .|G4 - - - - - - - - - . . G4 . G4 .|G4 . . . E5 . . . D5 . . . C5 . . .|A4 - - - - - - - - - - - . . . .|A4 . . . F5 . . . E5 . . . D5 . . .|B4 - - - - - - - - - - - . . . .|G5 . . . G5 . . . F5 . . . D5 . . .|E5 - - - - - - - - - - - . . . .|E5 . . . E5 . . . E5 - - - - - . .|E5 . . . E5 . . . E5 - - - - - . .|E5 . . . G5 . . . C5 - - . . . D5 .|E5 - - - - - - - - - - - . . . .|F5 . . . F5 . . . F5 - - . . . F5 .|F5 . . . E5 . . . E5 . . . E5 . E5 .|G5 . . . G5 . . . F5 . . . D5 . . .|C5 - - - - - - - - - - - . . . .',P_LEAD(.06,.75)),
    mgTr('C3 . . . G2 . . . C3 . . . G2 . . .|C3 . . . G2 . . . C3 . . . G2 . . .|C3 . . . G2 . . . C3 . . . G2 . . .|F2 . . . C3 . . . F2 . . . C3 . . .|D3 . . . A2 . . . D3 . . . A2 . . .|G2 . . . D3 . . . G2 . . . D3 . . .|G2 . . . D3 . . . G2 . . . D3 . . .|C3 . . . G2 . . . C3 . . . E3 . . .|C3 . . . G2 . . . C3 . . . G2 . . .|C3 . . . G2 . . . C3 . . . G2 . . .|C3 . . . G2 . . . C3 . . . G2 . . .|C3 . . . G2 . . . C3 . . . E3 . . .|F2 . . . C3 . . . F2 . . . C3 . . .|C3 . . . G2 . . . C3 . . . G2 . . .|G2 . . . D3 . . . G2 . . . B2 . . .|C3 . . . G2 . . . C3 . . . . . . .',P_BASS(.15)),
    mgTr('K . J . S . J . K . J . S . J J',P_DRUM(.1)),
    mgTr('C6 '+'. '.repeat(31)+'G5 '+'. '.repeat(31),P_BELL(.06))]}};
function mgPlay(k){if(MGA.song===MG_SONG[k])return;mgStop();const A=mgAC();if(!A)return;const s=MG_SONG[k],bus=A.createGain();bus.gain.value=mgV()*s.vol*1.8;bus.connect(A.destination);
  Object.assign(MGA,{bus,song:s,step:0,next:A.currentTime+.08});MGA.tm=setInterval(mgSched,50);mgSched();}
function mgSched(){const A=AC,s=MGA.song;if(!s||!A)return;if(!$('mg')){mgStop();return;}const sp=60/s.bpm/4;
  while(MGA.next<A.currentTime+.22){s.tr.forEach(tr=>{const L=tr.n.length,tok=tr.n[MGA.step%L];if(tok!=='.'&&tok!=='-'){let k=1;while(k<16&&tr.n[(MGA.step+k)%L]==='-')k++;tr.p(mgN(tok),MGA.next,sp*k,MGA.bus,tok);}});MGA.step++;MGA.next+=sp;}}
function mgStop(){clearInterval(MGA.tm);MGA.tm=0;MGA.song=null;if(MGA.bus){const b=MGA.bus;MGA.bus=null;try{b.gain.setTargetAtTime(0,AC.currentTime,.04);setTimeout(()=>b.disconnect(),300);}catch(e){}}}
/* 효과음 */
function fxSnd(k){const A=mgAC();if(!A)return;const t=A.currentTime,V=mgV(),O=(f,dt,l,ty,v,f2)=>mgOsc(f,t+dt,l,ty,v*V,null,f2),Z=(dt,l,v,hp,lp)=>mgNz(t+dt,l,v*V,hp,null,lp),arp=(fs,step,l,ty,v)=>fs.forEach((f,i)=>O(f,i*step,l,ty,v));
  ({gh_catch:()=>{Z(0,.12,.25,1200);O(660,0,.09,'square',.08,1320);},
    gh_purple:()=>{Z(0,.1,.2,1500);arp([880,1175,1568,2093],.045,.12,'triangle',.16);},
    gh_bat:()=>{O(240,0,.22,'square',.09,90);Z(0,.15,.12,300,1);},
    gh_end:()=>{arp([330,392,494,659],.11,.22,'square',.07);O(165,.44,.6,'triangle',.18);},
    mz_eat:()=>{MGA.wk=!MGA.wk;O(MGA.wk?520:700,0,.05,'triangle',.14,MGA.wk?700:520);},
    mz_pow:()=>{arp([523,659,784,1047,1319],.04,.12,'square',.06);Z(0,.25,.12,4000);},
    mz_ghost:()=>{O(1200,0,.25,'square',.06,300);arp([1568,2093],.12,.18,'triangle',.14);},
    mz_hit:()=>{O(660,0,.55,'square',.08,110);Z(.05,.3,.15,600,1);},
    mz_end:()=>{arp([440,523,659,880],.1,.2,'square',.06);O(220,.4,.5,'triangle',.18);},
    mz_clear:()=>{arp([523,659,784,1047,784,1047,1319],.08,.18,'square',.07);O(262,.56,.7,'triangle',.2);},
    mj_flip:()=>{Z(0,.035,.25,900);O(320,0,.05,'triangle',.18,260);},
    mj_pon:()=>{O(1047,0,.32,'triangle',.18);O(1568,.07,.36,'triangle',.15);Z(0,.04,.12,3000);},
    mj_miss:()=>{O(196,0,.14,'triangle',.18,150);},
    mj_win:()=>{mgGong(t,.9*V);arp([659,784,880,1047,1175,1319],.09,.3,'triangle',.08);},
    sn_drop:()=>{Z(0,.12,.15,3000);mgBell(2637,t,.35,.06*V);},
    sn_hit:()=>{Z(0,.08,.2,250,1);mgBell(1568,t+.02,1.1,.16*V);mgBell(2093,t+.1,.9,.1*V);Z(.02,.15,.15,7000);},
    sn_hit2:()=>{Z(0,.08,.2,250,1);[1568,1976,2349,3136].forEach((f,i)=>mgBell(f,t+.02+i*.06,1.2,.14*V));Z(.02,.3,.18,7500);Z(.15,.3,.12,8000);},
    sn_miss:()=>{Z(0,.18,.18,500,1);},
    sn_nose:()=>{mgBell(2637,t,.5,.08*V);mgBell(3136,t+.08,.5,.06*V);},
    sn_end:()=>{arp([523,659,784,1047],.1,.25,'square',.06);Z(.1,.5,.15,7000);mgBell(523,t+.4,2.4,.2*V);mgBell(784,t+.4,2,.12*V);mgBell(1047,t+.55,1.8,.1*V);},
    sn_start:()=>{mgBell(1047,t,1.4,.14*V);mgBell(1319,t+.15,1.2,.1*V);mgBell(1568,t+.3,1.4,.12*V);},
    /* 루돌프 잡기: 뽀득뽀득 눈 밟는 소리(낮은 잡음 + 사각 소리), 얼음은 슥, 깊은 눈은 푹 */
    ch_step:()=>{MGA.wk=!MGA.wk;Z(0,.06,.22,MGA.wk?1300:1000,1);Z(.012,.045,.07,MGA.wk?4200:3600);},
    ch_deep:()=>{Z(0,.1,.26,600,1);Z(.02,.06,.05,2500);},
    ch_ice:()=>{Z(0,.14,.05,6000);},
    ch_jump:()=>{O(420,0,.14,'triangle',.1,980);[0,.05,.1].forEach((d,i)=>{Z(d,.05,.12,7500);mgBell([2637,3136,2349][i],t+d,.35,.05*V);});},   /* 루돌프 목 방울이 짤랑 */
    ch_pop:()=>{mgBell(2093,t,.4,.06*V);O(660,0,.08,'triangle',.08,990);},
    ch_carrot:()=>{[0,.09,.18].forEach(d=>Z(d,.05,.2,900,1));[1568,1976,2349].forEach((f,i)=>mgBell(f,t+.06+i*.07,.8,.1*V));Z(.06,.25,.1,7500);},   /* 아삭 + 종소리 */
    ch_catch:()=>{Z(0,.08,.2,250,1);[1568,1976,2349,3136].forEach((f,i)=>mgBell(f,t+.02+i*.06,1.2,.14*V));Z(.02,.3,.18,7500);},
    ch_start:()=>{mgBell(1047,t,1.4,.14*V);mgBell(1319,t+.15,1.2,.1*V);mgBell(1568,t+.3,1.4,.12*V);},
    ch_end:()=>{arp([523,659,784,1047],.1,.25,'square',.06);Z(.1,.5,.15,7000);mgBell(523,t+.4,2.4,.2*V);mgBell(784,t+.4,2,.12*V);mgBell(1047,t+.55,1.8,.1*V);}})[k]?.();}
/* ===== 🍬 토리의 사탕 미로 (할로윈 주간 10/25~31) · 밀어서 토리를 움직여 사탕을 모아요. 호박 등불을 먹으면 유령이 겁먹어요 ===== */
const MZ=["#############","#o.........o#","#.##.###.##.#","#...........#","#.#.##-##.#.#","#.#.#GGG#.#.#","#...#####...#","###.......###","#...##.##...#","#.#.......#.#","#.#.##.##.#.#","#o...#.#...o#","#.##.....##.#","#.....T.....#","#############"];
const MZT=24,MZX=4,MZY=46,MZD=[[1,0],[0,1],[-1,0],[0,-1]];
const mzW=(c,r)=>{const ch=(MZ[r]||'')[c];return ch!==undefined&&ch!=='#'&&ch!=='G'&&ch!=='-';};
const mzPx=en=>{const d=en.d>=0?MZD[en.d]:[0,0];return[MZX+(en.c+d[0]*en.t)*MZT+MZT/2,MZY+(en.r+d[1]*en.t)*MZT+MZT/2];};
let MZB=null;
/* 배경: 달빛 아래 산울타리 미로 (위에서 본 3/4 시점: 울타리 윗면 + 앞면, 바닥은 보라 돌길 + 낙엽) */
function mzBack(){if(MZB)return MZB;const[c,g]=fxCv(320,440),P=(x,y,col)=>{g.fillStyle=col;g.fillRect(x*2,y*2,2,2);},R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x*2,y*2,w*2,h*2);},H=(x,y,k)=>sdH(x,y,k);
  R(0,0,160,220,'#130d22');
  /* 위 점수판: 짙은 보라 나무판 */

  const wall=(cc,r)=>r<0||r>14||cc<0||cc>12||MZ[r][cc]==='#';
  /* 바닥: 둥근 자갈 (왼쪽 위 밝은 테, 오른쪽 아래 그늘, 모서리 둥글게) */
  const floor=(gx,gy,dark)=>{const row=Math.floor(gy/6),off=row%2?3:0,lx=(gx+off)%6,ly=gy%6,st=Math.floor((gx+off)/6),h=H(st,row,5);let col;
    const pal=dark?['#1a1429','#221b34','#272040','#1e1830','#2c2448']:[ '#1b1530',h<.33?'#372e52':h<.66?'#33294c':'#3c3258','#4a3f69','#2a2242','#55497a'];
    if(lx===0||ly===0||((lx===1||lx===5)&&(ly===1||ly===5)))col=pal[0];else if((lx===1&&ly<4)||(ly===1&&lx<4))col=pal[2];else if(lx===5||ly===5)col=pal[3];else col=pal[1];
    if(!dark&&lx===2&&ly===2&&h<.4)col=pal[4];if(!dark&&col===pal[1]&&H(gx,gy,8)<.04)col='#3f5a3a';P(gx,gy,col);};
  for(let r=0;r<15;r++)for(let cc=0;cc<13;cc++){const ox=2+cc*12,oy=23+r*12,ch=MZ[r][cc];
    if(ch!=='#'){for(let y=0;y<12;y++)for(let x=0;x<12;x++)floor(ox+x,oy+y,ch==='G'||ch==='-');
      if(wall(cc,r-1))for(let x=0;x<12;x++){P(ox+x,oy,'#120c20');P(ox+x,oy+1,'#18112a');}             /* 울타리 그림자 */
      if(wall(cc-1,r))for(let y=0;y<12;y++)P(ox,oy+y,'#18112a');
      /* 낙엽 몇 장 (가운데는 사탕 자리라 비워 둠) */
      if(ch==='.'&&H(cc,r,31)<.14){const lx=ox+(H(cc,r,32)<.5?1:8),ly=oy+(H(cc,r,33)<.5?2:8),lc=H(cc,r,34)<.5?['#7a3a2a','#9a4e30']:['#5e3a2a','#7a4a30'];P(lx,ly,lc[0]);P(lx+1,ly,lc[1]);P(lx+1,ly+1,lc[0]);P(lx+2,ly+1,lc[0]);}
      if(ch==='-'){for(let x=1;x<11;x++){P(ox+x,oy+5,'#f2a9b6');P(ox+x,oy+6,'#c97a8a');}for(let x of[1,5,10]){for(let y=3;y<9;y++)P(ox+x,oy+y,y===3?'#ffd2da':'#8a4a5a');}}
      continue;}
    const sF=!wall(cc,r+1),nF=!wall(cc,r-1),wF=!wall(cc-1,r),eF=!wall(cc+1,r),top=sF?8:11;
    for(let y=0;y<12;y++)for(let x=0;x<12;x++){const gx=ox+x,gy=oy+y;
      if((nF&&wF&&x===0&&y===0)||(nF&&eF&&x===11&&y===0)||(sF&&wF&&x===0&&y===11)||(sF&&eF&&x===11&&y===11)){floor(gx,gy,0);continue;}
      if(y<=top){/* 윗면: 4칸 잎 뭉치를 엇갈려 쌓기 (뭉치마다 왼쪽 위 밝고 오른쪽 아래 어둡게) */
        const cr=Math.floor(gy/5),sh=(cr%2)*3+Math.floor(H(0,cr,15)*2),cl=Math.floor((gx+sh)/6),lx=(gx+sh)%6,ly=gy%5,hv=H(cl,cr,12);
        const dd=((lx-2.5)/3.1)**2+((ly-2)/2.7)**2,sv=(lx-2.5)+(ly-2)*1.2;let col=dd>1?'#2a5a38':sv<-1.6?'#4f9152':sv>1.8?'#356e42':'#3c7a48';if(hv<.3&&col==='#3c7a48')col='#41804a';if(lx===1&&ly===1&&hv>.55)col='#78b866';
        if(nF&&y===0&&(gx%4===0||gx%4===3)){floor(gx,gy,0);continue;}if(nF&&y<=1&&col!=='#2a5a38')col='#4f9152';
        if(wF&&x===0)col=col==='#2a5a38'?'#336a40':'#438248';if(eF&&x===11)col='#21472e';if(sF&&y===top)col='#21472e';P(gx,gy,col);}
      else{/* 앞면: 잎 뭉치 아랫부분 그늘 */const lx=gx%4;let col=y===top+1?(lx===0||lx===3?'#1a3824':'#244a30'):lx===0?'#1a3824':'#1f4129';if(y===11)col='#11241a';P(gx,gy,col);}}
    /* 열매 */if(H(cc,r,44)<.18&&r>0&&r<14&&cc>0&&cc<12){const bx=ox+2+Math.floor(H(cc,r,45)*7),by=oy+2+Math.floor(H(cc,r,46)*4);P(bx,by,'#d6382f');P(bx+1,by,'#a8281f');P(bx,by-1,'#ff9a8a');}
    /* 울타리 위 작은 장식: 호박 · 촛불 */
    if(sF&&r>0&&r<14&&H(cc,r,40)<.16){const px=ox+3+Math.floor(H(cc,r,41)*5),py=oy+3;[[1,0,'#3f6e2e'],[2,0,'#2c5638'],[0,1,'#4a2412'],[1,1,'#f4a043'],[2,1,'#e08a2c'],[3,1,'#4a2412'],[0,2,'#c9601c'],[1,2,'#ffd04a'],[2,2,'#e08a2c'],[3,2,'#a84e18'],[1,3,'#a84e18'],[2,3,'#a84e18']].forEach(([a,b,cl])=>P(px+a,py+b,cl));}}
  return MZB=c;}
function mg6Open(){const c=mgShell('#130d22','mg6Start()');if(!c)return;let sx=0,sy=0,mv=0,dn=0;const dOf=(dx,dy)=>Math.abs(dx)>Math.abs(dy)?(dx>0?0:2):(dy>0?1:3);
  c.addEventListener('pointerdown',e=>{e.preventDefault();[sx,sy]=mgXY(e,c);mv=0;dn=1;});
  c.addEventListener('pointermove',e=>{if(!dn)return;const[x,y]=mgXY(e,c);if(Math.hypot(x-sx,y-sy)>14){mzWant(dOf(x-sx,y-sy));sx=x;sy=y;mv=1;}});
  c.addEventListener('pointerup',e=>{if(!dn)return;dn=0;if(mv||!MG.P)return;const[x,y]=mgXY(e,c),p=mzPx(MG.P);mzWant(dOf(x-p[0],y-p[1]));});
  mg6Start();}
addEventListener('keydown',e=>{if(!$('mg')||MG.k!=='mz')return;const d={ArrowRight:0,ArrowDown:1,ArrowLeft:2,ArrowUp:3}[e.key];if(d!=null){e.preventDefault();mzWant(d);}});
function mzWant(d){const P=MG.P;if(!P)return;P.w=d;if(d===0)P.fl=0;if(d===2)P.fl=1;if(P.d>=0&&d===(P.d+2)%4&&P.t>0){P.c+=MZD[P.d][0];P.r+=MZD[P.d][1];P.t=1-P.t;P.d=d;}}
function mzStep(en,sp,dt,dec){let rem=sp*dt,n=0;while(rem>1e-6&&n++<8){if(en.d<0){const nd=dec(en);if(nd<0)return;en.d=nd;en.t=0;}const st=Math.min(rem,1-en.t);en.t+=st;rem-=st;
  if(en.t>=1-1e-6){en.c+=MZD[en.d][0];en.r+=MZD[en.d][1];en.t=0;if(en.arr)en.arr(en);en.d=dec(en);if(en.d<0)return;}}}
const mzToriDec=en=>{const op=d=>d>=0&&mzW(en.c+MZD[d][0],en.r+MZD[d][1]);return op(en.w)?en.w:op(en.d)?en.d:-1;};
function mzGhDec(gh){if(gh.lv){if(gh.r>3)return gh.c!==6?(gh.c<6?0:2):3;gh.lv=0;}
  const P=MG.P,opts=[0,1,2,3].filter(d=>d!==(gh.d+2)%4&&mzW(gh.c+MZD[d][0],gh.r+MZD[d][1]));if(!opts.length)return(gh.d+2)%4;
  if(gh.fr>0||Math.random()<.22)return opts[Math.floor(Math.random()*opts.length)];
  let tx=P.c,ty=P.r;if(gh.i===1&&P.d>=0){tx+=MZD[P.d][0]*3;ty+=MZD[P.d][1]*3;}
  return opts.reduce((b,d)=>{const q=Math.hypot(gh.c+MZD[d][0]-tx,gh.r+MZD[d][1]-ty);return q<b[1]?[d,q]:b;},[opts[0],1e9])[0];}
function mzHome(gh,delay){Object.assign(gh,{st:'h',c:gh.i?7:5,r:5,d:-1,t:0,lv:0,fr:0,rel:MG.e+delay});}
function mzReset(){MG.P={c:6,r:13,d:-1,t:0,w:-1,fl:0,arr:mzEat};MG.G.forEach((gh,i)=>mzHome(gh,1+i*2.5));MG.inv=1.5;}
function mzEat(P){const k=P.r*13+P.c;if(MG.cd.delete(k)){MG.s+=1;fxSnd('mz_eat');}
  if(MG.pw.delete(k)){MG.s+=2;fxSnd('mz_pow');MG.G.forEach(gh=>{if(gh.st==='o'){gh.fr=6;if(gh.d>=0&&gh.t>0){gh.c+=MZD[gh.d][0];gh.r+=MZD[gh.d][1];gh.t=1-gh.t;gh.d=(gh.d+2)%4;}}});MG.msg='유령들이 겁먹었다코! 지금 잡아라코!';MG.mt=2;}
  if(!MG.cd.size&&!MG.pw.size){MG.s+=10;mg6End(1);}}
function mg6Start(){if(MG.raf)cancelAnimationFrame(MG.raf);const cd=new Set(),pw=new Set();MZ.forEach((row,r)=>[...row].forEach((ch,c)=>{if(ch==='.')cd.add(r*13+c);if(ch==='o')pw.add(r*13+c);}));
  MG={k:'mz',e:0,l:0,raf:0,s:0,lv:3,cd,pw,G:[{i:0},{i:1}],ht:0,inv:0,msg:'손가락으로 밀어서 토리를 움직여라코!',mt:2.5,fx:[]};mzReset();$('mgr').style.display='none';mgPlay('mz');
  const c=$('mgc'),g=c.getContext('2d');g.imageSmoothingEnabled=false;const cand=fxS('candy');
  const loop=ts=>{if(!$('mg'))return;if(!MG.l)MG.l=ts;const dt=Math.min(.05,(ts-MG.l)/1000);MG.l=ts;MG.e+=dt;if(MG.mt>0)MG.mt-=dt;if(MG.inv>0)MG.inv-=dt;
    if(MG.ht>0){MG.ht-=dt;if(MG.ht<=0){if(MG.lv<=0){mg6End(0);return;}mzReset();}}
    else{mzStep(MG.P,5.2,dt,mzToriDec);
      MG.G.forEach(gh=>{if(gh.fr>0)gh.fr-=dt;if(gh.st==='h'){if(MG.e>=gh.rel){gh.st='o';gh.lv=1;gh.d=-1;gh.t=0;}return;}
        mzStep(gh,gh.fr>0?2.6:gh.lv?3:Math.min(4.9,3.8+MG.e*.02),dt,mzGhDec);
        const a=mzPx(gh),b=mzPx(MG.P);if(Math.hypot(a[0]-b[0],a[1]-b[1])<16){
          if(gh.fr>0){MG.s+=5;fxSnd('mz_ghost');MG.fx.push({x:a[0],y:a[1],t:.6,m:'+5'});mzHome(gh,3);}
          else if(MG.inv<=0&&MG.ht<=0){MG.lv--;MG.ht=1.1;fxSnd('mz_hit');MG.msg=MG.lv>0?'앗! 유령한테 잡혔다코!':'토리가 잡혀 버렸다코…';MG.mt=1.1;}}});}
    if(MG.over)return;
    mgPlay(MG.G.some(gh=>gh.fr>0)?'mzp':'mz');
    /* 그리기 */
    g.drawImage(mzBack(),0,0);
    MG.cd.forEach(k=>{const cc=k%13,r=(k-cc)/13;fxShadow(g,MZX+cc*MZT+12,MZY+r*MZT+20,12);g.drawImage(cand,MZX+cc*MZT+5,MZY+r*MZT+4+((cc+r+Math.floor(MG.e*2))%4===0?-2:0));});
    const lf=Math.floor(MG.e*5)%2;MG.pw.forEach(k=>{const cc=k%13,r=(k-cc)/13,x=MZX+cc*MZT+12,y=MZY+r*MZT+12;g.drawImage(fxGlow('#ffb347',lf?26:22),x-(lf?26:22),y-(lf?26:22));fxShadow(g,x,y+12,26);g.drawImage(fxS('lan'+lf),x-14,y-14);});
    MG.G.forEach(gh=>{let x,y;if(gh.st==='h'){x=MZX+gh.c*MZT+12;y=MZY+gh.r*MZT+12+Math.round(Math.sin(MG.e*4+gh.i*2)*2)*2;}else[x,y]=mzPx(gh);
      fxShadow(g,x,y+11,22);const fr=Math.floor(MG.e*4+gh.i)%2,pk=gh.fr>0?(gh.fr<2&&Math.floor(MG.e*8)%2?'flash':'scared'):(gh.i?'purp2':'purp');g.globalAlpha=.55;g.drawImage(fxS('gh'+fr,pk,gh.d===2),Math.round(x-16),Math.round(y-18));g.globalAlpha=1;});
    {const[x,y]=mzPx(MG.P),mv=MG.P.d>=0&&MG.ht<=0;fxShadow(g,x,y+10,26);if(!(MG.inv>0&&Math.floor(MG.e*10)%2)){g.drawImage(fxS(mv&&Math.floor(MG.e*8)%2?'to1':'to0',null,MG.P.fl),Math.round(x-16),Math.round(y-20));}}
    MG.fx=MG.fx.filter(f=>{f.t-=dt;f.y-=24*dt;fxTx(g,f.m,f.x,f.y,16,'#fff0a6');return f.t>0;});
    /* 점수판 */
    fxPanel(g,2,2,316,40);for(let i=0;i<3;i++){g.globalAlpha=i<MG.lv?1:.25;g.drawImage(fxS('heart'),16+i*18,16);}g.globalAlpha=1;
    g.drawImage(cand,128,13);fxTd(g,''+MG.s,150,23,18,'#5b2b14','left');fxTd(g,Math.max(0,Math.ceil(60-MG.e))+'초',302,23,16,'#5b2b14','right');
    if(MG.mt>0)fxMsg(g,MG.msg,424);
    $('mgh').textContent='토리의 사탕 미로 · 점수 '+MG.s;
    if(MG.e>=60){mg6End(0);return;}MG.raf=requestAnimationFrame(loop);};MG.raf=requestAnimationFrame(loop);}
function mg6End(win){if(MG.over)return;MG.over=1;cancelAnimationFrame(MG.raf);MG.raf=0;const sc=MG.s,r=sc>=80?2:sc>=40?1:0,[m,nb]=mgRw(r,'40점부터 도토리를 받아요','b6',sc);mgStop();fxSnd(win?'mz_clear':'mz_end');
  const g=$('mgc').getContext('2d');fxCard(g,win?'사탕을 다 모았어요!':'끝!',['점수 '+sc+(nb?' · 최고 기록!':''),'남은 사탕 '+MG.cd.size+'개'],null);
  $('mgh').innerHTML=m;$('mgr').style.display='';if(sc>=40)setTimeout(()=>tako('=사탕 부자 토리다코~! 🎃','',3000,0),500);}
/* ===== 🀄 마작패 짝 맞추기 (11월 마지막 주 11/24~30) · 진짜 마작패(통수·삭수·만수·자패) 20장, 같은 패 두 장을 찾아요 ===== */
const MJ_POOL=['p1','p2','p3','p5','p9','s2','s3','s4','s5','s6','m1','m5','m9','E','S','W','N','C','F','P'];
const MJ_TW=54,MJ_TH=68,MJ_X=40,MJ_Y=52,MJ_G=[8,4];
const MJK={E:'東',S:'南',W:'西',N:'北',C:'中',F:'發'},MJN='一二三四五六七八九';
let MJB=null;const MJF={};
/* 패 바탕 (한 칸 2px, 27x34칸): 앞면은 상아색, 아래·오른쪽으로 두께, 맨 아래는 초록 등판 */
function mjBase(down){const[c,g]=fxCv(MJ_TW,MJ_TH),P=(x,y,col)=>{g.fillStyle=col;g.fillRect(x*2,y*2,2,2);};
  for(let y=0;y<34;y++)for(let x=0;x<27;x++){if((x===0||x===26)&&(y===0||y===33))continue;if((x===0||x===26||y===0||y===33)){P(x,y,'#3d3022');continue;}
    let col;if(y<=26&&x<=24){if(down){col=y===1?'#6fd096':x===1?'#4fb57a':y===26||x===24?'#1f6a40':'#2f8f58';if(y>3&&y<23&&x>3&&x<21&&(x+y)%6===0)col='#38a065';}
      else col=y===1?'#ffffff':x===1?'#fffdf6':y===26||x===24?'#e6d9bb':'#fbf5e4';}
    else if(x===25&&y<=26)col=down?'#185a36':'#d6c8a6';
    else if(y===27)col=down?'#185a36':'#b8a684';
    else if(y<=29)col=down?'#2a7a4c':'#e2d4b2';else col=y===30?'#2f8f58':y===31?'#267a4b':'#1f6a40';P(x,y,col);}
  if(down){/* 등판 가운데 작은 도토리 무늬 */[[11,11,'#fffaf0'],[12,11,'#fffaf0'],[13,11,'#fffaf0'],[10,12,'#e8dcc0'],[11,12,'#fffaf0'],[12,12,'#fffaf0'],[13,12,'#fffaf0'],[14,12,'#e8dcc0'],[11,13,'#e8dcc0'],[12,13,'#fffaf0'],[13,13,'#e8dcc0'],[12,14,'#e8dcc0']].forEach(([x,y,cl])=>P(x,y,cl));}
  return c;}
/* 도트 글꼴(Galmuri11, 11px 원래 크기) 한자를 한 점 = z px로 찍기 */
function mjGlyph(g,ch,cx,cy,col,z){const[c2,g2]=fxCv(30,30);g2.font='11px Galmuri11';g2.textBaseline='top';g2.textAlign='left';g2.fillStyle='#000';g2.fillText(ch,2,2);
  const d=g2.getImageData(0,0,30,30).data;let x0=99,x1=-1,y0=99,y1=-1;const on=(x,y)=>d[(y*30+x)*4+3]>110;
  for(let y=0;y<30;y++)for(let x=0;x<30;x++)if(on(x,y)){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}if(x1<0)return;
  const w=(x1-x0+1)*z,h=(y1-y0+1)*z,ox=Math.round((cx-w/2)/2)*2,oy=Math.round((cy-h/2)/2)*2;g.fillStyle=col;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(on(x,y))g.fillRect(ox+(x-x0)*z,oy+(y-y0)*z,z,z);}
function mjFace(id){if(MJF[id])return MJF[id];const c=document.createElement('canvas');c.width=MJ_TW;c.height=MJ_TH;const g=c.getContext('2d');g.drawImage(mjBase(0),0,0);
  const P=(x,y,col)=>{g.fillStyle=col;g.fillRect(4+x*2,4+y*2,2,2);};   /* 그림 칸 22x24 (화면 4px부터) */
  const CL={b:['#2f6fd0','#1b4590','#9cc2f5'],g:['#2f9a52','#1d6a38','#a8e0a0'],r:['#d6382f','#94221c','#f7a79c']};
  const dot=(cx,cy,k,rd)=>{const[m,dk,lt]=CL[k];for(let y=Math.floor(cy-rd);y<=cy+rd;y++)for(let x=Math.floor(cx-rd);x<=cx+rd;x++){const q=Math.hypot(x+.5-cx,y+.5-cy);if(q>rd)continue;P(x,y,q>rd-1?dk:q>rd-1.9?'#fbf5e4':q<1.1&&x+.5<cx&&y+.5<cy?lt:m);}};
  const stick=(x,y,red)=>{const[m,dk,lt]=red?CL.r:CL.g;for(let j=0;j<10;j++){if(j===0||j===9){for(let i=0;i<4;i++)P(x+i,y+j,dk);continue;}if(j===4||j===5){P(x,y+j,dk);P(x+1,y+j,lt);P(x+2,y+j,lt);P(x+3,y+j,dk);continue;}P(x,y+j,dk);P(x+1,y+j,lt);P(x+2,y+j,m);P(x+3,y+j,dk);}};
  const k=id[0],n=+id.slice(1);
  if(k==='p'){if(n===1){const cx=11,cy=12;for(let y=2;y<23;y++)for(let x=0;x<22;x++){const q=Math.hypot(x+.5-cx,y+.5-cy),a=Math.atan2(y+.5-cy,x+.5-cx);let col=null;
        if(q<=9.6)col=q>8.7?'#1d6a38':q>7.6?'#2f9a52':q>6.7?'#fbf5e4':q>4.8?(Math.floor((a+Math.PI)*8/Math.PI)%2?'#d6382f':'#fbf5e4'):q>3.8?'#1b4590':q>2.8?'#2f6fd0':q>1.7?'#fbf5e4':'#d6382f';if(col)P(x,y,col);}}
    else ({2:[[11,6,'g'],[11,18,'b']],3:[[5,5,'b'],[11,12,'r'],[17,19,'g']],5:[[5.5,5.5,'b'],[16.5,5.5,'g'],[11,12,'r'],[5.5,18.5,'g'],[16.5,18.5,'b']],9:[[4,4.5,'b'],[11,4.5,'b'],[18,4.5,'b'],[4,12,'r'],[11,12,'r'],[18,12,'r'],[4,19.5,'g'],[11,19.5,'g'],[18,19.5,'g']]})[n].forEach(([x,y,c])=>dot(x,y,c,n===9?3.4:n===5?3.9:4.6));}
  else if(k==='s')({2:[[9,1],[9,13]],3:[[9,1],[4,13],[14,13]],4:[[4,1],[14,1],[4,13],[14,13]],5:[[3,1],[15,1],[9,7,1],[3,13],[15,13]],6:[[2,1],[9,1],[16,1],[2,13],[9,13],[16,13]]})[n].forEach(([x,y,r])=>stick(x,y,r));
  else if(k==='m'){mjGlyph(g,MJN[n-1],27,17,'#1a1612',2);mjGlyph(g,'萬',27,40,'#c8282a',2);}
  else if(k==='P'){for(let y=3;y<21;y++)for(let x=5;x<17;x++){const e=x<7||x>14||y<5||y>18;if(e)P(x,y,(x===5||x===16||y===3||y===20)?'#1b4590':'#2f6fd0');}}
  else mjGlyph(g,MJK[k],27,28,k==='C'?'#c8282a':k==='F'?'#1f8a4a':'#1a1612',2);
  return MJF[id]=c;}
/* 테이블: 초록 펠트 + 나무 테두리 */
function mjBack(){if(MJB)return MJB;const[c,g]=fxCv(320,440),P=(x,y,col)=>{g.fillStyle=col;g.fillRect(x*2,y*2,2,2);};
  for(let y=0;y<220;y++)for(let x=0;x<160;x++){const v=Math.hypot((x-80)/80,(y-120)/110),h=sdH(x,y,21);let col=v>1.05?'#155236':v>.85?'#185c3c':'#1c6a44';if(h<.1)col=v>.85?'#164f34':'#1a6240';else if(h>.93)col='#227a4e';P(x,y,col);}
  for(let y=0;y<22;y++)for(let x=0;x<160;x++){let col=y===21?'#2a1a0e':y===0?'#8a5f3a':y%5===4?'#4a3220':'#5e3f26';if(y%5!==4&&sdH(Math.floor(x/7),y,22)<.15)col='#6e4b2e';P(x,y,col);}
  for(let y=214;y<220;y++)for(let x=0;x<160;x++)P(x,y,y===214?'#2a1a0e':y===215?'#8a5f3a':'#5e3f26');
  /* 리치봉 장식 */for(let x=104;x<154;x++){P(x,8,'#fffaf0');P(x,9,'#e0d6c0');}P(128,8,'#d6382f');P(129,8,'#d6382f');P(128,9,'#94221c');P(129,9,'#94221c');
  return MJB=c;}
const mjPos=t=>[MJ_X+t.c*(MJ_TW+MJ_G[0]),MJ_Y+t.r*(MJ_TH+MJ_G[1])];
function mg7Open(){const c=mgShell('#123d28','mg7Start()');if(!c)return;c.addEventListener('pointerdown',e=>{e.preventDefault();const[x,y]=mgXY(e,c);mg7Tap(x,y);});mg7Start();}
function mg7Start(){if(MG.raf)cancelAnimationFrame(MG.raf);$('mgr').style.display='none';
  const ids=MJ_POOL.slice().sort(()=>Math.random()-.5).slice(0,10),d=[...ids,...ids].sort(()=>Math.random()-.5);
  MG={k:'mj',e:0,l:0,raf:0,T:d.map((id,i)=>({id,c:i%4,r:Math.floor(i/4),f:0,ft:0,done:0,dt:0,sh:0})),open:[],wait:0,tries:0,cb:0,bc:0,fx:[],msg:'같은 패 두 장을 찾아라코!',mt:2.5,over:0};mgPlay('mj');
  const c=$('mgc'),g=c.getContext('2d');g.imageSmoothingEnabled=false;const back=mjBase(1);let ready=0;
  Promise.race([document.fonts.load('11px Galmuri11','一二三四五六七八九萬東南西北中發'),new Promise(r=>setTimeout(r,1500))]).catch(()=>{}).then(()=>{ids.forEach(mjFace);ready=1;});
  const loop=ts=>{if(!$('mg'))return;if(!MG.l)MG.l=ts;const dt=Math.min(.05,(ts-MG.l)/1000);MG.l=ts;if(!MG.over&&ready)MG.e+=dt;if(MG.mt>0)MG.mt-=dt;
    g.drawImage(mjBack(),0,0);fxPanel(g,2,2,316,40);fxTd(g,'시도 '+MG.tries,18,23,16,'#a8461a','left');fxTd(g,Math.floor(MG.e)+'초',110,23,16,'#5b2b14','left');g.drawImage(fxS('star'),286,12);
    MG.T.forEach(t=>{const[x,y]=mjPos(t);if(t.done){t.dt+=dt;if(t.dt>.45)return;g.globalAlpha=1-t.dt/.45;}
      t.ft+=((t.f?1:0)-t.ft)*Math.min(1,dt*16);const sx=Math.abs(t.ft*2-1),w=Math.max(2,Math.round(MJ_TW*sx/2)*2),ox=x+(MJ_TW-w)/2+(t.sh>0?Math.round(Math.sin(t.sh*40)*2):0);if(t.sh>0)t.sh-=dt;
      g.fillStyle='rgba(8,30,18,.45)';g.fillRect(ox+4,y+6,w,MJ_TH-2);
      g.drawImage(t.ft>.5&&ready?mjFace(t.id):back,ox,y,w,MJ_TH);g.globalAlpha=1;});
    MG.fx=MG.fx.filter(f=>{f.t-=dt;g.fillStyle='#ffe14d';for(let k=0;k<8;k++){const a=k*.785,r=(1-f.t/.5)*34;g.fillRect(Math.round(f.x+Math.cos(a)*r)-2,Math.round(f.y+Math.sin(a)*r)-2,4,4);}if(f.m)fxTx(g,f.m,f.x,f.y-30+f.t*20,18,'#fff0a6');return f.t>0;});
    if(MG.mt>0&&!MG.over)fxMsg(g,MG.msg,418);else if(MG.cb>=2&&!MG.over)fxMsg(g,MG.cb+' 연속 퐁!',418);
    if(MG.over)MG.card(g);
    if(!MG.over)$('mgh').textContent='마작패 짝 맞추기 · 시도 '+MG.tries;MG.raf=requestAnimationFrame(loop);};MG.raf=requestAnimationFrame(loop);}
function mg7Tap(x,y){if(MG.over||MG.wait>0)return;const t=MG.T.find(t=>{const[tx,ty]=mjPos(t);return!t.done&&!t.f&&x>=tx&&x<=tx+MJ_TW&&y>=ty&&y<=ty+MJ_TH;});if(!t)return;
  t.f=1;fxSnd('mj_flip');MG.open.push(t);if(MG.open.length<2)return;MG.tries++;const[a,b]=MG.open;MG.wait=1;
  if(a.id===b.id){MG.cb++;MG.bc=Math.max(MG.bc,MG.cb);setTimeout(()=>{if(MG.k!=='mj')return;a.done=b.done=1;[a,b].forEach((t,i)=>{const[x,y]=mjPos(t);MG.fx.push({x:x+MJ_TW/2,y:y+MJ_TH/2,t:.5,m:i?'':'퐁!'});});fxSnd('mj_pon');MG.open=[];MG.wait=0;if(MG.T.every(t=>t.done))setTimeout(mg7End,500);},380);}
  else{MG.cb=0;setTimeout(()=>{if(MG.k!=='mj')return;a.sh=b.sh=.25;fxSnd('mj_miss');setTimeout(()=>{a.f=b.f=0;MG.open=[];MG.wait=0;},250);},650);}}
function mg7End(){if(MG.over||MG.k!=='mj')return;MG.over=1;const tr=MG.tries,st=tr<=14?3:tr<=20?2:1,r=st===3?2:st===2?1:0,[m,nb]=mgRw(r,'별 2개부터 도토리를 받아요','b7',tr,1);mgStop();fxSnd('mj_win');
  MG.card=g=>fxCard(g,'화료! 다 맞췄어요',['시도 '+tr+'번 · '+Math.floor(MG.e)+'초','최대 '+MG.bc+'연속'+(nb?' · 최고 기록!':'')],st);
  $('mgh').innerHTML='화료! 시도 '+tr+'번'+(nb?' · 최고 기록!':'')+'<br>'+m;$('mgr').style.display='';if(st>=2)setTimeout(()=>tako('=마작 고수다코~! 🀄','',3000,0),500);}
/* ===== 🎅 루돌프 썰매 배달 (크리스마스 주간 12/18~25) · 탭하면 썰매에서 선물이 떨어져요. 굴뚝에 쏙! 루돌프 코가 반짝일 때 넣으면 2배 ===== */
const SN_G=404;let SNB=null,SNF=null,SNM=null,SNH=null;
const snBay=(x,y)=>[[0,.5],[.75,.25]][y&1][x&1];
const snTri=u=>{u-=Math.floor(u);return 1-Math.abs(u*2-1);};
/* 밤하늘(9단 + 바둑판 섞기) · 오로라 · 별 · 달 · 눈밭 */
function snSky(){if(SNB)return SNB;const[c,g]=fxCv(320,440),P=(x,y,col)=>{g.fillStyle=col;g.fillRect(x*2,y*2,2,2);};
  const st=['#090d22','#0c122c','#101836','#141e40','#19244b','#1f2a56','#263161','#2e376c','#373d77'];
  for(let y=0;y<202;y++){const t=y/202*(st.length-1),k=Math.floor(t),f=t-k;for(let x=0;x<160;x++)P(x,y,f>snBay(x,y)&&k<st.length-1?st[k+1]:st[k]);}
  /* 오로라: 부드러운 두 줄기 (아래쪽 가장자리가 가장 밝고, 위로 갈수록 하늘에 녹아듦) */
  [[40,['#16304f','#1c4a62','#227070','#36a88e'],0],[54,['#1d2052','#2a2a70','#3b3690','#6a5cc8'],1.7]].forEach(([y0,T,ph])=>{for(let x=0;x<160;x++){const cy=y0+Math.sin(x*.045+ph)*6+Math.sin(x*.12+ph)*2,s=Math.max(0,Math.sin(x*.07+ph*2)*.6+.5);if(s<.15)continue;const L=Math.round(6+12*s);
    for(let j=0;j<=L;j++){const y=Math.round(cy)-j,t=(1-j/L)*s*3.2-(x%4===0?.35:0);if(t<=0)continue;const k=Math.min(3,Math.floor(t)),f=t-k;P(x,y,f>snBay(x,y)&&k<3?T[k+1]:T[k]);}}});
  for(let i=0;i<90;i++){const x=Math.floor(sdH(i,1,51)*160),y=Math.floor(sdH(i,2,51)*150),b=sdH(i,3,51);P(x,y,b<.15?'#fff3c8':b<.6?'#c8d4f0':'#7f8cc0');if(b<.08){P(x+1,y,'#6a78b0');P(x-1,y,'#6a78b0');P(x,y+1,'#6a78b0');P(x,y-1,'#6a78b0');}}
  const mx=136,my=50,mr=11;for(let y=-mr-8;y<=mr+8;y++)for(let x=-mr-8;x<=mr+8;x++){const q=Math.hypot(x+.5,y+.5);if(q>mr+8)continue;if(q>mr){const a=q<mr+3?.75:q<mr+6?.5:.25;if(snBay(x+mx,y+my)<a*.6)P(mx+x,my+y,q<mr+3?'#3a4a86':'#2c3a72');continue;}
    let col=x>4&&q>mr-4?'#e6d79a':'#fff4c8';if(Math.hypot(x+3,y+2)<2.2||Math.hypot(x-3,y-4)<1.6||Math.hypot(x+4,y-5)<1.2)col='#ecdfa8';if(x<-5&&y<-3&&q>mr-2)col='#ffffff';P(mx+x,my+y,col);}
  /* 눈밭: 완만한 눈 언덕 그늘 + 반짝이 */
  for(let y=202;y<220;y++)for(let x=0;x<160;x++){const d=Math.sin(x*.11)*2+Math.sin(x*.29+1)*1.2,yy=y-202;let col=yy===0?'#ffffff':'#eaf1fb';if(yy>3+d&&yy<6+d)col='#d4e0f3';if(yy>10+d*.6&&yy<12+d*.6)col='#dbe5f6';if(sdH(x,y,52)<.05)col='#ffffff';if(sdH(x,y,53)<.04&&yy>1)col='#c4d2ec';P(x,y,col);}
  return SNB=c;}
/* 먼 산 두 겹 (640 폭, 이음매 없이 반복): 왼쪽 위 빛, 오른쪽 그늘, 눈 덮인 봉우리 */
function snFar(){if(SNF)return SNF;const[c,g]=fxCv(640,440),P=(x,y,col)=>{g.fillStyle=col;g.fillRect(x*2,y*2,2,2);};
  const layer=(hf,cl,snowTop)=>{for(let x=0;x<320;x++){const h=Math.round(hf(x)),lit=hf(x+1)<hf(x)-.05,depth=Math.max(0,(snowTop-h))*.55+2+Math.round(sdH(x,7,58)*2);
    for(let y=h;y<204;y++){const k=y-h;let col;if(h<snowTop&&k<depth)col=k===0?'#ffffff':lit?cl.s:cl.ss;else if(h<snowTop&&k<depth+2&&sdH(x,y,59)<.5)col=lit?cl.s:cl.ss;else col=lit?cl.l:cl.d;if(col===cl.l&&sdH(x,y,57)<.07)col=cl.d;P(x,y,col);}}};
  layer(x=>134-24*snTri(x*4/320+.12)-11*snTri(x*9/320+.37),{l:'#33407a',d:'#28336a',s:'#d6e0f5',ss:'#9fb0d8'},126);
  for(let x=0;x<320;x++)for(let y=150;y<160;y++)if(snBay(x,y)<(y-150)/14)P(x,y,'#3a4580');   /* 산 사이 옅은 안개 */
  layer(x=>156-15*snTri(x*5/320+.6)-7*snTri(x*12/320+.21),{l:'#232c5a',d:'#1a2249',s:'#e6eefa',ss:'#aab8dc'},150);
  return SNF=c;}
/* 가운데 마을 (640 폭): 꽉 찬 집 · 눈 지붕 · 창 불빛 · 눈 전나무 · 교회 */
function snMid(){if(SNM)return SNM;const[c,g]=fxCv(640,440),P=(x,y,col)=>{g.fillStyle=col;g.fillRect(x*2,y*2,2,2);};const B='#121834',BD='#0d1229',SN='#9fb0d6',SL='#c4d0ec',GY=202;
  const pine=(x0,hh)=>{for(let j=0;j<hh;j++){const w=Math.floor(j*.45)+1;for(let a=-w;a<=w;a++){let col=(j%4===0||(j%4===1&&Math.abs(a)===w))?SN:a>0?'#0b1a2e':'#10233a';P(x0+a,GY-hh+j,col);}}P(x0,GY,'#1a1020');};
  let x=0,i=0;while(x<300){const R=k=>sdH(i,k,55),kind=R(1);
    if(kind<.28){const hh=7+Math.floor(R(2)*7);pine(x+4,hh);x+=8+Math.floor(R(3)*3);i++;continue;}
    const w=10+Math.floor(R(2)*8),bh=8+Math.floor(R(4)*9),church=kind>.93,top=GY-bh;
    for(let y=top;y<GY;y++)for(let xx=x;xx<x+w;xx++)P(xx,y,xx>x+w-3?BD:B);
    const rh=Math.ceil(w/2);for(let k=0;k<rh;k++)for(let xx=x+k;xx<x+w-k;xx++)P(xx,top-k,k===rh-1||xx===x+k||xx===x+w-k-1?SL:SN);
    for(let wy=top+2;wy<GY-2;wy+=4)for(let wx=x+2;wx<x+w-2;wx+=3)if(sdH(wx,wy,56)<.5){P(wx,wy,sdH(wx,wy,60)<.5?'#f6d36b':'#d9a84a');}
    if(church){const sx=x+Math.floor(w/2);for(let k=0;k<14;k++){const ww=Math.max(0,Math.floor((14-k)/5));for(let a=-ww;a<=ww;a++)P(sx+a,top-rh-k+1,k>11?'#d9a84a':SN);}P(sx,top-rh-15,'#d9a84a');P(sx-1,top-rh-14,'#d9a84a');P(sx+1,top-rh-14,'#d9a84a');P(sx,top+3,'#ffe08a');}
    x+=w+1+Math.floor(R(3)*4);i++;}
  /* 마을 앞 낮은 눈 둔덕 */for(let x2=0;x2<320;x2++){const hh=Math.round(2+Math.sin(x2*.09)*1.5);for(let y=GY-hh;y<GY+1;y++)P(x2,y,y===GY-hh?'#c4d0ec':'#8a9ac6');}
  return SNM=c;}
/* 앞 집 6가지: 기와 결 지붕 + 두툼한 눈 · 고드름 · 판자벽 · 창틀 눈 · 현관등 · 리스 · 전구 줄 · 벽돌 굴뚝 · 집 앞 눈 더미와 덤불 */
function snHouses(){if(SNH)return SNH;SNH=[];const walls=[['#8a4b3c','#6e3a2e','#a35d4b'],['#56688c','#435272','#6b7fa6'],['#6b5a8a','#54466e','#8270a6'],['#4a7a6a','#3a6054','#5f9682'],['#8a6a3c','#6e532e','#a6824d'],['#7a4a5a','#5e3846','#965c70']];
  const roofs=[['#4a3048','#3a2438'],['#3a3450','#2c2840'],['#5a2e2e','#462222'],['#2e4048','#22323a'],['#4a3a2e','#3a2c22'],['#3a2e48','#2c2238']];
  for(let v=0;v<6;v++){const R=k=>sdH(v,k,60),w=42+Math.floor(R(1)*12),wh=26+Math.floor(R(2)*8),rh=Math.floor(w/2)-3,chx=Math.floor(w*(R(3)<.5?.3:.68)),chH=7+Math.floor(R(4)*5),W=w+4;
    const apex=chH+3,base=apex+rh,H=base+wh,[c,g]=fxCv(W*2,H*2),P=(x,y,col)=>{g.fillStyle=col;g.fillRect(x*2,y*2,2,2);},[wc,wd,wl]=walls[v],[r1,r2]=roofs[v];
    /* 벽: 판자 + 왼쪽 빛 + 모서리 흰 몰딩 */
    for(let y=base;y<H;y++)for(let x=2;x<w+2;x++){let col=(y-base)%4===3?wd:wc;if(x===3)col=wl;if(x>=w-1)col=wd;if(x===2||x===w+1)col='#e6dccb';if(y===H-1)col='#1a1222';P(x,y,col);}
    /* 창: 크림색 창틀 · 따뜻한 유리 · 십자 창살 · 창턱 눈 */
    const win=(x0,y0)=>{for(let y=-1;y<9;y++)for(let x=-1;x<8;x++){let col;if(y===-1||y===8||x===-1||x===7)col='#e6dccb';else if(x===0||x===6||y===0||y===7)col='#3a2418';else if(x===3||y===4)col='#6a4428';else col=(x<3&&y<4)?'#fff3b0':(x>3&&y>4)?'#e8a84a':'#ffd25e';P(x0+x,y0+y,col);}for(let x=-2;x<9;x++){P(x0+x,y0+9,'#f4f8ff');if(x>-2&&x<8)P(x0+x,y0+10,'#b8c8e8');}};
    const dl=R(5)<.5,dx=dl?6:w-8;win(dl?w-11:6,base+5);win(dl?w-21:16,base+5);if(wh>29)win(dl?w-11:6,base+17);
    /* 문 · 계단 · 현관등 · 리스 */for(let y=H-12;y<H-1;y++)for(let x=dx;x<dx+7;x++)P(x,y,(x===dx||x===dx+6||y===H-12)?'#2a1810':x===dx+1?'#9a5e34':'#7a4a28');P(dx+5,H-6,'#f4c542');
    for(let x=dx-1;x<dx+8;x++)P(x,H-1,'#c8d0e0');P(dx-2,H-11,'#ffd25e');P(dx-2,H-10,'#a8641a');
    [[2,-2],[3,-2],[1,-1],[4,-1],[1,0],[4,0],[2,1],[3,1]].forEach(([a,b])=>P(dx+1+a,H-8+b,'#2f8f58'));P(dx+2,H-6,'#d6382f');P(dx+3,H-6,'#d6382f');
    /* 지붕: 기와 줄 + 위쪽은 두툼한 눈 */
    for(let y=apex;y<=base;y++){const k=y-apex,x0=Math.floor(W/2)-k-1,x1=Math.ceil(W/2)+k;for(let x=Math.max(0,x0);x<=Math.min(W-1,x1);x++){const sd=2+(sdH(x,y,62)<.35?1:0);
      let col=k<4||(x-x0)<sd||(x1-x)<sd?'#eef4ff':((x+(k%2)*2)%4===0?r2:r1);if(col===r1&&k%2===1)col=sdH(x,y,63)<.5?r1:r2;
      if(col!=='#eef4ff'&&(k<5||(x-x0)<sd+1||(x1-x)<sd+1))col='#b8c8e8';if(x===x0||x===x1)col='#9fb2d8';if(y===base)col='#8a9ac0';P(x,y,col);}}
    for(let x=1;x<W-1;x++){P(x,base+1,'#1a1222');if(sdH(x,1,64)<.45){const L=1+Math.floor(sdH(x,2,64)*3);for(let j=0;j<L;j++)P(x,base+2+j,j===L-1?'#a8c8f0':'#d8ecff');}}
    for(let x=2;x<W-2;x+=2)P(x,base+1,['#ff5a5a','#5ad06a','#ffd84a','#6aa8ff'][(x/2)%4]);
    /* 굴뚝: 벽돌 + 눈 모자 + 검은 입구 */const cx0=chx-1,roofY=x=>apex+Math.abs(x-W/2);
    for(let x=cx0;x<cx0+7;x++)for(let y=2;y<roofY(x)+1;y++){let col=(y%3===1)?'#6e2a22':((x+(Math.floor(y/3)%2)*2)%4===0?'#6e2a22':'#9a3a2e');if(x===cx0)col='#b84a3a';if(x===cx0+6)col='#5a2018';P(x,y,col);}
    for(let x=cx0-1;x<cx0+8;x++){P(x,0,x===cx0-1||x===cx0+7?'#9fb2d8':x>cx0&&x<cx0+6?'#140c1a':'#eef4ff');P(x,1,x===cx0-1||x===cx0+7?'#b8c8e8':'#eef4ff');}P(cx0+2,0,'#2a1620');
    /* 집 앞 눈 더미 · 덤불 */for(let x=0;x<W;x++){const hh=Math.round(1.5+Math.sin(x*.5+v)*1+(x<3||x>W-4?1:0));for(let j=0;j<hh;j++)if(x<dx-1||x>dx+7)P(x,H-1-j,j===hh-1?'#ffffff':'#e2eaf8');}
    const bx=dl?w-4:4;for(let y=-4;y<=0;y++)for(let x=-3;x<=3;x++)if(x*x+y*y*1.6<=10)P(bx+x,H-2+y,y<-2?'#f4f8ff':x>1?'#1f5a3a':'#2f7a4c');
    SNH.push({cv:c,w:W*2,h:H*2,cx:(cx0+3.5)*2,cy:0,cw:14,roof:x=>{const gx=x/2;return(gx>=1&&gx<=W-1)?Math.min(H*2,(apex+Math.abs(gx-W/2))*2):H*2;},wall:[4,(w+2)*2]});}
  return SNH;}
function mg8Open(){const c=mgShell('#0d1430','mg8Start()');if(!c)return;c.addEventListener('pointerdown',e=>{e.preventDefault();mg8Tap();});mg8Start();}
addEventListener('keydown',e=>{if($('mg')&&MG.k==='sn'&&(e.key===' '||e.key==='Enter')){e.preventDefault();mg8Tap();}});
function mg8Tap(){if(MG.k!=='sn'||MG.over||MG.left<=0||MG.cd>0)return;MG.cd=.4;MG.left--;const y=MG.sy+22;MG.pr.push({x:MG.sx+16,y,vx:42,vy:-50,pk:'g'+Math.floor(Math.random()*4),x2:MG.nz>0});fxSnd('sn_drop');}
function mg8Start(){if(MG.raf)cancelAnimationFrame(MG.raf);$('mgr').style.display='none';const HS=snHouses();
  MG={k:'sn',e:0,l:0,raf:0,s:0,left:20,cd:0,pr:[],H:[],pf:[],fx:[],dist:0,sx:22,sy:96,nz:0,nzN:3.5,cb:0,msg:'굴뚝에 선물을 쏙 넣어라코! 탭!',mt:2.5,over:0};mgPlay('sn');fxSnd('sn_start');
  let hx=200;while(hx<520){const v=Math.floor(Math.random()*6);MG.H.push({v,x:hx,pt:Math.random()});hx+=HS[v].w+60+Math.random()*60;}
  const c=$('mgc'),g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const snow=[];for(let i=0;i<60;i++)snow.push([Math.random()*320,Math.random()*440,.5+Math.random()]);
  const loop=ts=>{if(!$('mg'))return;if(!MG.l)MG.l=ts;const dt=Math.min(.05,(ts-MG.l)/1000);MG.l=ts;MG.e+=dt;if(MG.mt>0)MG.mt-=dt;if(MG.cd>0)MG.cd-=dt;
    const v=MG.over?0:95+MG.e*1.6;MG.dist+=v*dt;MG.sy=96+Math.round(Math.sin(MG.e*2.6)*3)*2;
    if(MG.nz>0)MG.nz-=dt;else if(MG.e>=MG.nzN&&!MG.over){MG.nz=1.3;fxSnd('sn_nose');MG.nzN=MG.e+1.3+2.8+Math.random()*2.2;}
    MG.H.forEach(h=>h.x-=v*dt);MG.H=MG.H.filter(h=>h.x+HS[h.v].w>-20);{const L=MG.H[MG.H.length-1];if(!L||L.x+HS[L.v].w<320+40){const nv=Math.floor(Math.random()*6);MG.H.push({v:nv,x:(L?L.x+HS[L.v].w:320)+55+Math.random()*70,pt:0});}}
    /* 굴뚝 연기 */MG.H.forEach(h=>{h.pt-=dt;if(h.pt<=0){h.pt=.45;const S=HS[h.v];MG.pf.push({x:h.x+S.cx,y:SN_G-S.h-2,t:1.6,r:3});}});
    MG.pf=MG.pf.filter(p=>{p.t-=dt;p.y-=18*dt;p.x-=(v*.15+8)*dt;p.r+=3*dt;return p.t>0;});
    /* 선물 떨어뜨리기 */
    MG.pr=MG.pr.filter(p=>{if(p.land!=null){p.land-=dt;p.x-=v*dt;return p.land>0;}const b0=p.y+18;p.vy+=560*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const b1=p.y+18,cxp=p.x+9;
      for(const h of MG.H){const S=HS[h.v],top=SN_G-S.h+S.cy,ccx=h.x+S.cx;if(b0<=top+2&&b1>top+2&&Math.abs(cxp-ccx)<=S.cw/2+3){const pts=p.x2?2:1;MG.s+=pts;MG.cb++;fxSnd(p.x2?'sn_hit2':'sn_hit');MG.fx.push({x:ccx,y:top,t:.6,m:'+'+pts,c:p.x2?'#ff7a6a':'#fff0a6'});MG.msg=p.x2?'반짝 배달! 2배다코!':MG.cb>=3?MG.cb+'연속 배달이다코!':'배달 완료다코!';MG.mt=.9;return false;}
        const ry=SN_G-S.h+S.roof(cxp-h.x);if(cxp>h.x&&cxp<h.x+S.w&&b1>=ry){p.y=ry-18;p.land=.6;MG.cb=0;fxSnd('sn_miss');return true;}}
      if(b1>=SN_G+6){p.y=SN_G-12;p.land=.6;MG.cb=0;fxSnd('sn_miss');return true;}return p.y<460;});
    /* 그리기 */
    g.drawImage(snSky(),0,0);
    for(let i=0;i<14;i++){if(Math.sin(MG.e*3+i*7)>.7){const x=Math.floor(sdH(i,1,51)*160)*2,y=Math.floor(sdH(i,2,51)*130)*2;g.fillStyle='#ffffff';g.fillRect(x,y,2,2);}}
    const fo=Math.round(MG.dist*.12/2)*2%640,mo=Math.round(MG.dist*.4/2)*2%640;g.drawImage(snFar(),-fo,0);g.drawImage(snFar(),640-fo,0);g.drawImage(snMid(),-mo,0);g.drawImage(snMid(),640-mo,0);
    g.drawImage(snSky(),0,SN_G,320,36,0,SN_G,320,36);
    MG.H.forEach(h=>{const S=HS[h.v],x=Math.round(h.x/2)*2;g.drawImage(fxGlow('#ffd25e',30),x+S.w/2-30,SN_G-S.h/2-26);g.drawImage(S.cv,x,SN_G-S.h);});
    g.fillStyle='#d8e0f0';MG.pf.forEach(p=>{g.globalAlpha=Math.min(.55,p.t*.4);const r=Math.round(p.r/2)*2;g.fillRect(Math.round(p.x/2)*2-r,Math.round(p.y/2)*2-r/2,r*2,r);g.fillRect(Math.round(p.x/2)*2-r/2,Math.round(p.y/2)*2-r,r,r*2);});g.globalAlpha=1;
    MG.pr.forEach(p=>{if(p.land!=null)g.globalAlpha=Math.max(0,p.land/.6);if(p.x2&&p.land==null)g.drawImage(fxGlow('#ff6a5a',14),Math.round(p.x)-5,Math.round(p.y)-5);g.drawImage(fxS('gift',p.pk),Math.round(p.x/2)*2,Math.round(p.y/2)*2);g.globalAlpha=1;});
    /* 썰매 + 루돌프 */
    const sx=MG.sx,sy=MG.sy,dx=sx+86,dy=sy-8,fr=Math.floor(MG.e*7)%2;
    g.fillStyle='#8a5a2b';for(let k=0;k<=12;k++){const t=k/12,x=sx+56+(dx+30-sx-56)*t,y=sy+22+(dy+24-sy-22)*t+Math.sin(t*Math.PI)*4;g.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,2,2);}
    g.drawImage(fxS('deer'+fr),dx,dy);g.drawImage(fxS('sleigh'),sx,sy);
    if(MG.nz>0){const f=Math.floor(MG.e*10)%2;g.drawImage(fxGlow('#ff4a3a',f?16:12),dx+57-(f?16:12),dy+15-(f?16:12));g.fillStyle='#ffd0c8';g.fillRect(dx+56,dy+12,2,2);}
    for(const s of snow){s[1]+=s[2]*34*dt;s[0]+=Math.sin(MG.e+s[1]*.04)*.4-v*.05*dt*s[2];if(s[1]>440){s[1]=-4;s[0]=Math.random()*340;}if(s[0]<-4)s[0]+=330;g.fillStyle='#f4f8ff';const z=s[2]>1.1?4:2;g.fillRect(Math.round(s[0]/2)*2,Math.round(s[1]/2)*2,z,z);}
    MG.fx=MG.fx.filter(f=>{f.t-=dt;g.fillStyle=f.c;for(let k=0;k<8;k++){const a=k*.785,r=(1-f.t/.6)*26;g.fillRect(Math.round(f.x+Math.cos(a)*r)-2,Math.round(f.y-6+Math.sin(a)*r*.6)-2,4,4);}fxTx(g,f.m,f.x,f.y-30+f.t*20,18,f.c);return f.t>0;});
    /* 점수판 */
    fxPanel(g,2,2,316,40);g.drawImage(fxS('gift','g0'),16,12);fxTd(g,'×'+MG.left,38,23,16,'#5b2b14','left');fxTd(g,'배달 '+MG.s,160,23,18,'#a8461a');fxTd(g,Math.max(0,Math.ceil(30-MG.e))+'초',302,23,16,'#5b2b14','right');
    if(MG.nz>0&&!MG.over)fxTx(g,'루돌프 코가 반짝! 지금이 2배!',160,196,14,'#ff9a8a');
    if(MG.mt>0&&!MG.over)fxMsg(g,MG.msg,424);
    if(!MG.over)$('mgh').textContent='루돌프 썰매 배달 · '+MG.s+'점';
    if(!MG.over&&(MG.e>=30||(MG.left<=0&&!MG.pr.some(p=>p.land==null))))mg8End();
    if(MG.over)MG.card(g);MG.raf=requestAnimationFrame(loop);};MG.raf=requestAnimationFrame(loop);}
function mg8End(){if(MG.over)return;MG.over=1;const sc=MG.s,r=sc>=16?2:sc>=8?1:0,[m,nb]=mgRw(r,'8점부터 도토리를 받아요','b8',sc);mgStop();fxSnd('sn_end');
  MG.card=g=>fxCard(g,'메리 크리스마스!',['선물 배달 '+sc+'점'+(nb?' · 최고 기록!':''),'남은 선물 '+MG.left+'개'],null);
  $('mgh').innerHTML='배달 끝! '+sc+'점'+(nb?' · 최고 기록!':'')+'<br>'+m;$('mgr').style.display='';if(sc>=8)setTimeout(()=>tako('=산타 조수 토리다코~! 🎄','',3000,0),500);}
/* ===== 🦌 도망가는 루돌프를 잡아라! (크리스마스 주간 12/18~25, v6.8) · 손가락을 끌면 산타 모자 토리가 그쪽으로 달려요 ===== */
/* 그림 원본: tools/mg/xmas_chase_sprites.py (tos0·tos1 빨간 산타 모자 토리, carrot 당근) · 배경·나무·눈사람 타코는 아래 chBack·chTree·chSnowman이 칸 단위로 그림 */
Object.assign(FX.S,{"tos0":[["................","......kkkk......",".kk..khhhHk.....","kWWk.khhhhHk....","kWWkkhhhhhhHk...",".kkhhhhhhhhHHk..",".kyYyyyyyyyyyk..","..kkLLooooOkk...","..kLLLooooOOk...",".kLLLLooooOOOk..","koooooooccWeOOk.","kooooocccceecOk.","kooooocccccccOpk","koooooccccccrrk.",".kOOOOccccccck..","..kOOOOCCCCCk...","...kkPOOCkPk...."],{"k":"#3b2a1e","o":"#e9a85c","O":"#c47f3c","L":"#f6c98a","c":"#fff3dc","C":"#ecd3a9","p":"#f4a3ad","e":"#2a1c12","W":"#ffffff","r":"#f08a8a","P":"#f4a3ad","h":"#d63a32","H":"#9e2620","y":"#eef0f8","Y":"#ffffff"}],"tos1":[["................","......kkkk......",".kk..khhhHk.....","kWWk.khhhhHk....","kWWkkhhhhhhHk...",".kkhhhhhhhhHHk..",".kyYyyyyyyyyyk..","..kkLLooooOkk...","..kLLLooooOOk...",".kLLLLooooOOOk..","koooooooccWeOOk.","kooooocccceecOk.","kooooocccccccOpk","koooooccccccrrk.",".kOOOOccccccck..","..kOOOOCCCCCk...","...kkkPOCkkPk..."],{"k":"#3b2a1e","o":"#e9a85c","O":"#c47f3c","L":"#f6c98a","c":"#fff3dc","C":"#ecd3a9","p":"#f4a3ad","e":"#2a1c12","W":"#ffffff","r":"#f08a8a","P":"#f4a3ad","h":"#d63a32","H":"#9e2620","y":"#eef0f8","Y":"#ffffff"}],"carrot":[["...g.g..","..kgGgk.","..kGgGk.",".kLoooOk",".kLoooOk","..kLooOk","..kLoOk.","...koOk.","...kOk..","....k..."],{"k":"#5a2a10","o":"#f08a2a","O":"#c25a14","L":"#ffb866","g":"#6fb84a","G":"#3f7a2e"}]});
const CH={x0:12,x1:308,y0:66,y1:432,
  tree:[{x:58,y:196},{x:262,y:300},{x:128,y:424}],
  ice:[{x:204,y:172,rx:58,ry:24},{x:84,y:318,rx:48,ry:22}],
  pile:[{x:156,y:262,rx:32,ry:15},{x:270,y:414,rx:34,ry:15},{x:56,y:110,rx:28,ry:13}],
  tk:{x:290,y:122},
  hint:['구석으로 몰면 옆으로 튄다코!','얼음판은 미끄럽다코! 조심하라코!','눈더미에 들어가면 느려진다코!','나무 뒤에 숨으면 코만 반짝인다코!','당근을 주우면 루돌프가 느려진다코!']};
const chIn=(L,x,y)=>L.some(o=>((x-o.x)/o.rx)**2+((y-o.y)/o.ry)**2<1);
let CHB=null;
/* ---- v7.2 그림 (스타듀 느낌 겨울 숲): 칸 하나 = 2px, 왼쪽 위에서 빛, 그림마다 테두리 한 가지 색 ---- */
const CHC={s0:'#ffffff',s1:'#f1f5fc',s2:'#e2e9f6',s3:'#cad6ec',s4:'#a9b9dc',s5:'#8293c2',
  i0:'#f2fbff',i1:'#cdeefa',i2:'#a8dcf2',i3:'#84c6e8',i4:'#5ea6d6',i5:'#4283bd',
  g0:'#173229',g1:'#1f4a3d',g2:'#2b6650',g3:'#3c8462',g4:'#58a571',g5:'#86c47e',b0:'#3a2216',b1:'#5c3a22',b2:'#80542f',ol:'#1a2a3a'};
const CH_BY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const chDi=(x,y,t)=>t*16>CH_BY[(y&3)*4+(x&3)];
const chVN=(x,y,sc,k)=>{const X=x/sc,Y=y/sc,x0=Math.floor(X),y0=Math.floor(Y),fx=X-x0,fy=Y-y0,s=t=>t*t*(3-2*t),a=sdH(x0,y0,k),b=sdH(x0+1,y0,k),c=sdH(x0,y0+1,k),d=sdH(x0+1,y0+1,k);return a+(b-a)*s(fx)+(c-a)*s(fy)+(a-b-c+d)*s(fx)*s(fy);};
/* 칸 그림판: s(x,y,색) · 빈 칸 옆에 테두리 · 캔버스로 */
function chGrid(W,H){const a=[];for(let y=0;y<H;y++)a.push(new Array(W).fill(null));
  return{W,H,a,s(x,y,c){x|=0;y|=0;if(x>=0&&y>=0&&x<W&&y<H)a[y][x]=c;},g(x,y){return x>=0&&y>=0&&x<W&&y<H?a[y][x]:null;},
    outline(col){const p=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(!a[y][x]&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>{const v=this.g(x+dx,y+dy);return v&&v!==col;}))p.push([x,y]);p.forEach(([x,y])=>a[y][x]=col);},
    cv(){const[c,g]=fxCv(W*2,H*2);for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(a[y][x]){g.fillStyle=a[y][x];g.fillRect(x*2,y*2,2,2);}return c;}};}
/* 동그란 덩어리 칠하기: 빛 방향(왼쪽 위)으로 밝기 단계 */
function chBall(G,cx,cy,rx,ry,ramp,cut){for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){const nx=(x+.5-cx)/rx,ny=(y+.5-cy)/ry,d=nx*nx+ny*ny;if(d>1||(cut&&cut(x,y)))continue;
  const nz=Math.sqrt(1-d),l=-nx*.55-ny*.65+nz*.5,i=l>.78?0:l>.52?1:l>.22?2:l>-.12?3:4;G.s(x,y,ramp[Math.min(ramp.length-1,i)]);}}
/* 배경: 울타리 너머 숲 · 바람에 쌓인 눈결 · 발자국 길 · 얼음 연못 · 눈더미 · 풀·돌 */
function chBack(){if(CHB)return CHB;const W=160,H=220,G=chGrid(W,H),C=CHC;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const n=chVN(x,y,22,3)*.7+chVN(x,y,7,4)*.3;let c=n>.62?(chDi(x,y,(n-.62)*5)?C.s2:C.s1):n<.32?(chDi(x,y,(.32-n)*5)?C.s0:C.s1):C.s1;G.s(x,y,c);}
  /* 눈결(바람에 쌓인 언덕): 볕 드는 등성이 + 아래쪽 푸른 그늘 */
  for(let k=0;k<9;k++){const y0=40+k*21+sdH(k,1,7)*8,A=2+sdH(k,2,7)*3,f=.05+sdH(k,3,7)*.05,ph=sdH(k,4,7)*6,x0=sdH(k,5,7)*W*.6,x1=x0+40+sdH(k,6,7)*70;
    for(let x=Math.floor(x0);x<x1&&x<W;x++){const yy=Math.round(y0+A*Math.sin(x*f+ph)),e=Math.min(x-x0,x1-x)/14;if(e<.15)continue;G.s(x,yy-1,C.s0);G.s(x,yy,C.s0);
      for(let j=1;j<5;j++){const t=Math.min(1,e)*(1-j/5);if(chDi(x,yy+j,t*1.2))G.s(x,yy+j,j<2?C.s3:C.s2);}}}
  /* 발자국 난 길 (아래 → 위로 구불구불) */
  const px=y=>80+26*Math.sin(y/26)+8*Math.sin(y/9);
  for(let y=26;y<H;y++){const cx=px(y),w=7+Math.sin(y/13)*1.5;for(let x=Math.floor(cx-w);x<=cx+w;x++){const e=(x-cx)/w;let c=Math.abs(e)>.82?(e<0?C.s3:C.s0):chDi(x,y,.35+.3*Math.sin(y*.7))?C.s3:C.s2;G.s(x,y,c);}
    if(y%7===0){const s=(y/7)%2?-1:1,fx=Math.round(cx+s*3);G.s(fx,y,C.s4);G.s(fx,y+1,C.s4);G.s(fx+1,y,C.s4);G.s(fx,y+2,C.s3);}}
  /* 위쪽: 어두운 숲 그림자 + 눈 쌓인 나무 울타리 */
  for(let x=0;x<W;x++){const t=20+Math.round(3*Math.sin(x*.21)+2*Math.sin(x*.53));for(let y=22;y<t+8;y++)G.s(x,y,y<t?C.g1:chDi(x,y,(t+8-y)/8)?C.s3:G.g(x,y));
    for(let k=0;k<6;k++){const tx=(k*29+11)%W;if(Math.abs(x-tx)<5-((t)%3))G.s(x,t-1-(4-Math.abs(x-tx)),C.g0);}}
  for(let x=0;x<W;x++){[[27,2],[31,2]].forEach(([ry,h])=>{for(let j=0;j<h;j++)G.s(x,ry+j,j?C.b1:C.b2);G.s(x,ry-1,(x+ry)%5?C.s1:C.s0);});
    if(x%12===4)for(let y=23;y<36;y++)G.s(x,y,y<25?C.s0:x%2?C.b2:C.b1),G.s(x+1,y,y<25?C.s1:C.b1),G.s(x+2,y,y<25?C.s2:C.b0);}
  for(let x=0;x<W;x++)for(let j=0;j<3;j++)if(chDi(x,36+j,(3-j)/4))G.s(x,36+j,C.s3);
  /* 얼음 연못: 눈 둑(테두리) · 둑 그늘 · 깊어질수록 진한 파랑 · 빛줄기 · 금 · 얼음 위 눈 */
  CH.ice.forEach((o,oi)=>{const cx=o.x/2,cy=o.y/2,rx=o.rx/2,ry=o.ry/2;
    for(let y=Math.floor(cy-ry-3);y<=cy+ry+3;y++)for(let x=Math.floor(cx-rx-3);x<=cx+rx+3;x++){const nx=(x+.5-cx)/rx,ny=(y+.5-cy)/ry,d=Math.sqrt(nx*nx+ny*ny);
      if(d>1.22)continue;if(d>1){const lit=nx+ny<0;G.s(x,y,d>1.14?(lit?C.s1:C.s3):lit?C.s0:C.s2);continue;}
      let c=ny<-.45&&d>.62?C.i4:d>.9?C.i3:ny>.25?C.i2:chDi(x,y,(ny+.75))?C.i2:C.i1;if(d>.93&&ny<-.2)c=C.i5;
      const st=(x-cx)*.8-(y-cy)*2;if(Math.abs(st+rx*.35)<1.2||Math.abs(st+rx*.35+5)<.6)c=d<.85?C.i0:c;G.s(x,y,c);}
    /* 금 */let x=cx+rx*.15,y=cy-ry*.1,a=oi?2.3:.6;for(let k=0;k<22;k++){const nx=(x+.5-cx)/rx,ny=(y+.5-cy)/ry;if(nx*nx+ny*ny>.75)break;G.s(x,y,C.i0);G.s(x,y+1,C.i4);x+=Math.cos(a);y+=Math.sin(a)*.6;a+=(sdH(k,oi,9)-.5)*1.4;if(k===9){let bx=x,by=y;for(let j=0;j<6;j++){bx+=.9;by-=.5;G.s(bx,by,C.i0);}}}
    for(let k=0;k<3;k++){const sx=Math.round(cx+rx*(sdH(k,oi,8)-.5)*1.2),sy=Math.round(cy+ry*(sdH(k,oi,6)-.3)*.8);G.s(sx,sy,C.s1);G.s(sx+1,sy,C.s2);G.s(sx,sy-1,C.s0);}});
  /* 눈더미: 혹 셋이 겹친 무더기 + 오른쪽 아래 그림자 + 꽂힌 나뭇가지 */
  CH.pile.forEach((o,oi)=>{const cx=o.x/2,cy=o.y/2,rx=o.rx/2,ry=o.ry/2;
    for(let y=Math.floor(cy);y<cy+ry*.9+2;y++)for(let x=Math.floor(cx-rx*.6);x<cx+rx*1.25;x++){const nx=(x+.5-cx-rx*.25)/(rx*.95),ny=(y+.5-cy-ry*.45)/(ry*.5);if(nx*nx+ny*ny<1)G.s(x,y,chDi(x,y,.6)?C.s4:C.s3);}
    const P=chGrid(W,H),bumps=[[-.45,.15,.55,.75],[.4,.2,.6,.7],[0,-.15,.62,1]];bumps.forEach(([bx,by,sx,sy])=>chBall(P,cx+bx*rx,cy+by*ry,rx*sx,ry*sy*1.1,[C.s0,C.s1,C.s2,C.s3,C.s4],(x,y)=>y>cy+ry*.55));
    P.outline(C.s5);for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(P.a[y][x])G.s(x,y,P.a[y][x]);
    for(let k=0;k<4;k++){G.s(cx+rx*.5+k*.6,cy-ry*.9-k,C.b1);}G.s(cx+rx*.5+2,cy-ry*.9-4,C.b2);G.s(cx+rx*.5+3,cy-ry*.9-3,C.b1);
    for(let k=0;k<3;k++)G.s(cx-rx*.3+k*3,cy-ry*.55+k%2,C.s0);});
  /* 풀 · 돌 · 솔방울 */
  [[20,70],[146,140],[18,200],[110,90],[64,214],[150,60]].forEach(([x,y],i)=>{if(i%2){G.s(x,y,C.g3);G.s(x+1,y-1,C.g4);G.s(x+2,y,C.g3);G.s(x+1,y,C.g2);G.s(x-1,y+1,C.s3);G.s(x+3,y+1,C.s3);}
    else{chBall(G,x,y,3,2,['#c7c2d6','#a49fb8','#7f7b96','#5f5b78','#4a4660']);for(let k=-2;k<=2;k++)G.s(x+k,y-2+(Math.abs(k)>1?1:0),k<1?C.s0:C.s1);}});
  /* 반짝이 */
  for(let k=0;k<26;k++){const x=Math.floor(sdH(k,3,99)*W),y=40+Math.floor(sdH(k,4,99)*(H-40));if(G.g(x,y)===C.s1||G.g(x,y)===C.s2){G.s(x,y,C.s0);if(k%3===0){G.s(x-1,y,C.s0);G.s(x+1,y,C.s0);G.s(x,y-1,C.s0);G.s(x,y+1,C.s0);}}}
  return CHB=G.cv();}
/* 눈 쌓인 전나무 44x56칸 · 첫 번째는 별·전구 단 크리스마스 트리 */
const CHT={};
function chTree(dec){if(CHT[dec])return CHT[dec];const W=44,H=56,G=chGrid(W,H),C=CHC,cx=21.5;
  for(let y=46;y<53;y++)for(let x=19;x<25;x++)G.s(x,y,x<20?C.b2:x>22?C.b0:C.b1);
  const T=[[3,15,6],[10,24,10],[17,33,14],[25,42,18],[33,49,21]];
  for(let i=T.length-1;i>=0;i--){const[y0,y1,hw]=T[i];for(let y=y0;y<=y1+2;y++)for(let x=0;x<W;x++){const dx=x+.5-cx,t=(y-y0)/(y1-y0),half=hw*Math.min(1,t)+1,tipY=y1-1.6*Math.abs(Math.sin(dx/2.6))+(Math.abs(dx)/hw)*1.5;
      if(Math.abs(dx)>half||y>tipY+1)continue;const r=dx/half;
      let c=r<-.5?C.g4:r<-.1?C.g3:r<.45?C.g2:C.g1;if(y>tipY-1)c=r<0?C.g3:C.g1;if(y<y0+2+t*1&&i>0)c=C.g0;
      if(y<tipY-1&&((x+y*2+i)%6===0||(x+y*2+i)%6===1)&&(y-y0)%3===1)c=r<-.45?C.g5:r<.1?C.g4:r<.5?C.g3:C.g2;
      /* 잎 위에 쌓인 눈 */const top=y-y0-Math.abs(dx)/hw*(y1-y0);if(top<2.2&&top>-1){c=r<-.2?C.s0:r<.35?C.s1:C.s3;if(top>1.3)c=r<.35?C.s2:C.s4;}
      if(y>tipY-.5&&Math.abs(Math.sin(dx/2.6))<.35&&r<.7)c=r<0?C.s1:C.s3;G.s(x,y,c);}}
  if(dec){const L=['#ff5a4a','#ffd84a','#5ab8ff','#ff8ad0'];T.slice(1).forEach(([y0,y1,hw],i)=>{for(let k=0;k<7;k++){const t=(k+.5)/7,x=Math.round(cx-hw*.85+t*hw*1.7),y=Math.round(y0+(y1-y0)*.62+Math.sin(t*Math.PI)*2.5-(1-Math.abs(t-.5)*2)*0);if(G.g(x,y)){G.s(x,y,L[(k+i)%4]);G.s(x+1,y,L[(k+i)%4]);G.s(x,y-1,'#fff6d0');}}});
    [[21,0],[22,0],[20,1],[21,1],[22,1],[23,1],[19,2],[20,2],[21,2],[22,2],[23,2],[24,2],[20,3],[21,3],[22,3],[23,3],[20,4],[23,4]].forEach(([x,y])=>G.s(x,y,y<2&&x<22?'#fff6b0':'#f4c542'));}
  G.outline(C.ol);return CHT[dec]=G.cv();}
/* 눈사람 타코 42x44칸(칸 하나=1px로 만들고 1.25배로 찍음 → 타코가 예전보다 작게): 눈덩이 몸통 위에 앱의 진짜 타코 그림(20x22칸)이 올라가 앉고, 얼굴과 다리 사이에 초록·크림 줄무늬 목도리, 원래 세일러 모자 대신 작고 깜찍한 빨간 산타 모자(하얀 털 테두리·방울) */
let CHS=null,CH_TK=null;const CH_SM=1.25,CH_TS=1.25;/* 눈사람 타코 1.25배(눈덩이 몸통은 크게·타코는 작게), 쫓는 토리 1.25배(v7.2 사용자 요청: 타코 작게·토리 조금 크게) */
function chSnowman(){if(CHS)return CHS;if(!CH_TK){CH_TK=new Image();CH_TK.src=TAKO;}if(!(CH_TK.complete&&CH_TK.naturalWidth))return null;const W=42,H=44,G=chGrid(W,H),C=CHC,OX=11,OY=4;let px;
  try{const[c,g]=fxCv(CH_TK.naturalWidth,CH_TK.naturalHeight);g.drawImage(CH_TK,0,0);px=g.getImageData(0,0,c.width,c.height).data;}catch(e){return null;}
  const tw=CH_TK.naturalWidth/8|0,th=CH_TK.naturalHeight/8|0,hx=(r,g,b)=>'#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join(''),snow=[];
  /* 눈덩이 몸통 (타코 다리가 위에 걸터앉음) + 나뭇가지 팔 + 석탄 단추 */
  const BY=32.5;chBall(G,21,BY,13,10.5,[C.s0,C.s1,C.s2,C.s3,C.s4]);for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(G.a[y][x])snow.push([x,y]);
  /* 나뭇가지 팔(도트 눈사람 요령): 몸통 옆에서 비스듬히 위로 뻗은 줄기(위 칸 밝은 갈색 + 아래 칸 진한 갈색 = 두 칸 굵기), 중간에 작은 곁가지, 끝은 Y자 손가락. 가지끼리 빈칸을 두어 뭉개지지 않게 (왼쪽 그리고 좌우 뒤집기) */
  const ARM=[[7,25,C.b2],[6,24,C.b2],[5,23,C.b2],[4,22,C.b2],[3,21,C.b2],[2,20,C.b2],[1,19,C.b1],[7,26,C.b0],[6,25,C.b0],[5,24,C.b0],[4,23,C.b0],[3,22,C.b0],[2,21,C.b0],
    [5,21,C.b1],[5,20,C.b0],[0,18,C.b0],[2,18,C.b1],[3,17,C.b0]];
  ARM.forEach(([x,y,c])=>{x+=1;y+=5;G.s(x,y,c);G.s(W-1-x,y,c);});
  for(let x=0;x<tw;x++)for(let y=0;y<th;y++){const i=((y*8+4)*CH_TK.naturalWidth+x*8+4)*4;if(px[i+3]>128)G.s(OX+x,OY+y,hx(px[i],px[i+1],px[i+2]));}
  [[20,34],[21,34],[20,38],[21,38]].forEach(([x,y])=>G.s(x,y,'#2a2a3a'));G.s(20,34,'#4a4a5e');G.s(20,38,'#4a4a5e');
  /* 목도리: 타코 14~15째 줄(얼굴 아래, 다리 위)을 감싸고 오른쪽으로 끝자락이 내려옴 */
  const SG=['#58a571','#3c8462','#2b6650'],SC=['#fff3dc','#ecd3a9','#c9ae86'],sc=(x,y,sh)=>{const st=((x+y)>>1)%2?SC:SG;return st[sh];};
  for(let x=OX+1;x<=OX+18;x++){G.s(x,OY+14,sc(x,0,x>OX+13?1:0));G.s(x,OY+15,sc(x,0,x>OX+13?2:1));}
  G.s(OX+1,OY+14,'#1a1a24');G.s(OX+18,OY+14,'#1a1a24');G.s(OX+1,OY+15,'#1a1a24');G.s(OX+18,OY+15,'#1a1a24');
  for(let x=OX+2;x<=OX+17;x++)G.s(x,OY+16,'#1a1a24');
  for(let y=OY+16;y<=OY+20;y++){G.s(OX+13,y,'#1a1a24');G.s(OX+14,y,sc(0,y,0));G.s(OX+15,y,sc(0,y,1));G.s(OX+16,y,'#1a1a24');}
  G.s(OX+14,OY+21,SC[0]);G.s(OX+15,OY+21,SC[1]);G.s(OX+13,OY+21,'#1a1a24');G.s(OX+16,OY+21,'#1a1a24');G.s(OX+14,OY+22,'#1a1a24');G.s(OX+15,OY+22,'#1a1a24');
  /* 산타 모자 (v7.3): 타코 머리는 동그래야 해요. 원래 그림은 세일러 모자 때문에 머리 오른쪽 위가 비어 있어서,
     (1) 세일러 모자 칸을 지우고 머리 윗부분(타코 칸 0~4줄)의 오른쪽을 왼쪽과 똑같이(좌우 대칭) 다시 그려 둥근 머리를 만든 뒤
     (2) 모자는 그 둥근 머리 꼭대기 위에 얹어요. 털 테두리가 머리 윗선만 살짝 덮어야 머리가 모자 속으로 들어가 보이지 않아요 */
  for(let y=0;y<=4;y++)for(let x=11;x<20;x++)G.s(OX+x,OY+y,null);
  const rimR=G.g(OX+15,OY+5),hl=c=>{const v=parseInt(c.slice(1),16);return (v>>16&255)>234&&(v>>8&255)>120;};
  for(let y=2;y<=4;y++)for(let x=10;x<20;x++){const c=G.g(OX+19-x,OY+y);if(!c)continue;const dk=parseInt(c.slice(1),16)===0;
    G.s(OX+x,OY+y,dk?c:(G.g(OX+19-x-1,OY+y)&&parseInt(G.g(OX+19-x-1,OY+y).slice(1),16)===0?rimR:hl(c)?G.g(OX+10,OY+5):c));}
  const HR=['#ef6a5e','#d63a32','#9e2620'],hat=[],hs=(x,y,c)=>{G.s(OX+x,OY+y,c);hat.push([OX+x,OY+y]);};
  /* 모자 칸 그림(타코 칸 x6~15, y-3~2): 방울(오른쪽 위) · 고깔(끝이 오른쪽으로) · 털 테두리 두 줄 */
  const HAT=["........wW",
             "......rRWW",
             "....rrrRR.",
             "..rrrrrRR.",
             ".rrrrrrrRR",
             ".wwwwwwwwW",
             "WWWWWWWWWW"];
  HAT.forEach((row,j)=>{const first=row.search(/[rR]/);[...row].forEach((ch,i)=>{if(ch==='.')return;let c=ch==='w'?'#ffffff':ch==='W'?'#dfe3ee':ch==='R'?HR[2]:HR[1];if(ch==='r'&&(i===first||j===1))c=HR[0];hs(5+i,j-3,c);});});
  for(const[x,y]of hat)for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])if(!G.g(x+dx,y+dy)&&y+dy>=0&&x+dx>=0&&x+dx<W)G.s(x+dx,y+dy,'#1a1a24');
  /* v7.4 사용자 요청: 모자 털 테두리 아래·목도리 위에도 검은 경계선 (머리 빨강과 바로 붙어 경계가 안 보였음) */
  for(let x=5;x<=14;x++)if(G.g(OX+x,OY+4))G.s(OX+x,OY+4,'#1a1a24');
  for(let x=OX+1;x<=OX+18;x++)G.s(x,OY+13,'#1a1a24');
  const SN=new Set([C.s0,C.s1,C.s2,C.s3,C.s4]);for(const[x,y]of snow)if(SN.has(G.a[y][x]))for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])if(!G.g(x+dx,y+dy)&&y+dy>=0&&y+dy<H&&x+dx>=0&&x+dx<W)G.s(x+dx,y+dy,'#2b3354');
  const[c,g]=fxCv(W,H);for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(G.a[y][x]){g.fillStyle=G.a[y][x];g.fillRect(x,y,1,1);}return CHS=c;}
function mg9Open(){const c=mgShell('#16203f','mg9Start()');if(!c)return;
  const pd=e=>{if(MG.k!=='ch')return;e.preventDefault();MG.tp=mgXY(e,c);};
  c.addEventListener('pointerdown',e=>{try{c.setPointerCapture(e.pointerId);}catch(_){}pd(e);});c.addEventListener('pointermove',e=>{if(MG.tp)pd(e);});
  ['pointerup','pointercancel'].forEach(n=>c.addEventListener(n,()=>{if(MG.k==='ch')MG.tp=null;}));mg9Start();}
const CH_KEY={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
addEventListener('keydown',e=>{if($('mg')&&MG.k==='ch'&&CH_KEY[e.key]){e.preventDefault();MG.keys[e.key]=1;}});
addEventListener('keyup',e=>{if(MG.k==='ch'&&CH_KEY[e.key])delete MG.keys[e.key];});
function chSpot(tx,ty){let b=null,bd=-1;for(let i=0;i<10;i++){const x=CH.x0+30+Math.random()*(CH.x1-CH.x0-60),y=CH.y0+40+Math.random()*(CH.y1-CH.y0-60),d=Math.hypot(x-tx,y-ty);if(d>bd&&!(Math.abs(x-CH.tk.x)<30&&Math.abs(y-CH.tk.y)<40)){bd=d;b=[x,y];}}return b;}
function chSay(t,s){MG.say=t;MG.st=s||2.6;}
function mg9Start(){if(MG.raf)cancelAnimationFrame(MG.raf);$('mgr').style.display='none';
  MG={k:'ch',e:0,l:0,raf:0,s:0,over:0,keys:{},tp:null,
    t:{x:200,y:372,vx:0,vy:0,f:1,st:0},d:{x:150,y:150,vx:0,vy:0,f:-1,jt:0,jc:0,wt:0,wx:150,wy:150,gone:0,inv:0,hid:0},
    cr:null,crN:7,slow:0,gifts:[],fx:[],say:'',st:0,hN:6,hI:0,stepT:0};
  chSay('루돌프를 잡아라코! 손가락으로 끌어 달려라코!',3.2);mgPlay('ch');fxSnd('ch_start');
  const c=$('mgc'),g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const snow=[];for(let i=0;i<70;i++)snow.push([Math.random()*320,Math.random()*440,.5+Math.random()]);
  const mv=(o,dx,dy,sp,dt)=>{const ice=chIn(CH.ice,o.x,o.y),k=ice?1.5:12,m=chIn(CH.pile,o.x,o.y)?.5:1;o.vx+=(dx*sp*m-o.vx)*Math.min(1,k*dt);o.vy+=(dy*sp*m-o.vy)*Math.min(1,k*dt);
    o.x+=o.vx*dt;o.y+=o.vy*dt;if(o.x<CH.x0){o.x=CH.x0;o.vx=Math.abs(o.vx)*.3;}if(o.x>CH.x1){o.x=CH.x1;o.vx=-Math.abs(o.vx)*.3;}if(o.y<CH.y0){o.y=CH.y0;o.vy=Math.abs(o.vy)*.3;}if(o.y>CH.y1){o.y=CH.y1;o.vy=-Math.abs(o.vy)*.3;}
    if(Math.abs(o.vx)>8)o.f=o.vx>0?1:-1;return ice;};
  const loop=ts=>{if(!$('mg'))return;if(!MG.l)MG.l=ts;const dt=Math.min(.05,(ts-MG.l)/1000);MG.l=ts;const T=MG.t,D=MG.d;
    if(!MG.over){MG.e+=dt;if(MG.st>0)MG.st-=dt;if(MG.slow>0)MG.slow-=dt;
      /* 토리: 손가락 쪽으로 (방향키도) */
      let dx=0,dy=0;Object.keys(MG.keys).forEach(k=>{dx+=CH_KEY[k][0];dy+=CH_KEY[k][1];});
      if(MG.tp){dx=MG.tp[0]-T.x;dy=MG.tp[1]+8-T.y;if(Math.hypot(dx,dy)<6){dx=0;dy=0;}}
      {const l=Math.hypot(dx,dy);if(l){dx/=l;dy/=l;}}const ice=mv(T,dx,dy,124,dt),spd=Math.hypot(T.vx,T.vy);
      if(spd>30){T.st+=dt*spd/14;MG.stepT-=dt;if(MG.stepT<=0){MG.stepT=ice?.34:.24;fxSnd(ice?'ch_ice':chIn(CH.pile,T.x,T.y)?'ch_deep':'ch_step');}}
      /* 루돌프 */
      if(D.gone>0){D.gone-=dt;if(D.gone<=0){const p=chSpot(T.x,T.y);D.x=p[0];D.y=p[1];D.vx=D.vy=0;D.inv=.6;D.wt=0;MG.fx.push({x:D.x,y:D.y-20,t:.6,m:'',c:'#fff0a6'});fxSnd('ch_pop');}}
      else{if(D.inv>0)D.inv-=dt;if(D.jc>0)D.jc-=dt;
        const base=Math.min(150,74+MG.s*9)*(MG.slow>0?.5:1),ex=D.x-T.x,ey=D.y-T.y,dist=Math.hypot(ex,ey);let fx=0,fy=0,sp=base;
        if(D.jt>0){D.jt-=dt;D.x+=D.vx*dt;D.y+=D.vy*dt;D.x=Math.max(CH.x0,Math.min(CH.x1,D.x));D.y=Math.max(CH.y0,Math.min(CH.y1,D.y));}
        else{if(dist<135){fx=ex/dist;fy=ey/dist;
            /* 벽에서 밀어내기 */const wl=(D.x-CH.x0<40)+(CH.x1-D.x<40)+(D.y-CH.y0<40)+(CH.y1-D.y<40);
            if(D.x-CH.x0<40)fx+=(40-(D.x-CH.x0))/40;if(CH.x1-D.x<40)fx-=(40-(CH.x1-D.x))/40;if(D.y-CH.y0<40)fy+=(40-(D.y-CH.y0))/40;if(CH.y1-D.y<40)fy-=(40-(CH.y1-D.y))/40;
            /* 구석에 몰리면 옆으로 휙! */
            if(wl&&dist<62&&D.jc<=0){let px=-ey/dist,py=ex/dist;const cx=(CH.x0+CH.x1)/2,cy=(CH.y0+CH.y1)/2;if(px*(cx-D.x)+py*(cy-D.y)<0){px=-px;py=-py;}
              D.vx=(px*.85+(cx-D.x)/300)*base*2.6;D.vy=(py*.85+(cy-D.y)/300)*base*2.6;D.jt=.38;D.jc=1.3;D.f=D.vx>0?1:-1;fxSnd('ch_jump');if(Math.random()<.5)chSay(CH.hint[0],2);}}
          else{D.wt-=dt;if(D.wt<=0){D.wt=1.6+Math.random()*1.6;if(Math.random()<.4){const tr=CH.tree[Math.floor(Math.random()*CH.tree.length)];D.wx=tr.x+(Math.random()-.5)*16;D.wy=tr.y-30;}else{D.wx=CH.x0+30+Math.random()*(CH.x1-CH.x0-60);D.wy=CH.y0+30+Math.random()*(CH.y1-CH.y0-60);}}
            fx=D.wx-D.x;fy=D.wy-D.y;const l=Math.hypot(fx,fy);if(l<6){fx=fy=0;}else{fx/=l;fy/=l;}sp=base*.45;}
          const l=Math.hypot(fx,fy);if(l>1){fx/=l;fy/=l;}mv(D,fx,fy,sp,dt);}
        D.hid=CH.tree.some(tr=>Math.abs(D.x-tr.x)<26&&D.y<tr.y-6&&D.y>tr.y-64);if(D.hid&&MG.hI!==3&&dist>110&&Math.random()<dt*.15){MG.hI=3;chSay(CH.hint[3],2.4);}
        /* 잡았다! */
        if(D.inv<=0&&Math.hypot(T.x-D.x,T.y-6-(D.y-10))<28){MG.s++;D.gone=.7;D.jt=0;fxSnd('ch_catch');
          MG.gifts.push({x:D.x,y:D.y,t:0,pk:'g'+(MG.s%4)});MG.fx.push({x:D.x,y:D.y-20,t:.6,m:'+1',c:'#fff0a6'});chSay(MG.s>=6?'벌써 '+MG.s+'마리다코! 대단하다코!':'잡았다코! '+MG.s+'마리째다코!',1.6);}}
      /* 당근 */
      if(!MG.cr&&MG.e>=MG.crN){const p=chSpot(D.x,D.y);MG.cr={x:p[0],y:p[1],t:7};chSay('당근이다코! 주우면 루돌프가 느려진다코!',2.4);fxSnd('ch_pop');}
      if(MG.cr){MG.cr.t-=dt;if(Math.hypot(T.x-MG.cr.x,T.y-MG.cr.y)<20){MG.slow=3;MG.cr=null;MG.crN=MG.e+8+Math.random()*4;fxSnd('ch_carrot');chSay('루돌프가 당근에 정신 팔렸다코! 3초!',2);}else if(MG.cr.t<=0){MG.cr=null;MG.crN=MG.e+5+Math.random()*4;}}
      if(MG.e>=MG.hN){MG.hN=MG.e+7+Math.random()*3;if(MG.st<=0){MG.hI=(MG.hI+1)%CH.hint.length;chSay(CH.hint[MG.hI]);}}
      $('mgh').textContent='도망가는 루돌프를 잡아라! · '+MG.s+'마리';if(MG.e>=45)mg9End();}
    /* ---- 그리기 ---- */
    g.drawImage(chBack(),0,0);
    const ents=[];CH.tree.forEach((tr,i)=>ents.push([tr.y,()=>{fxShadow(g,tr.x+4,tr.y,72);g.drawImage(chTree(i===0),Math.round((tr.x-44)/2)*2,tr.y-106);}]));
    ents.push([CH.tk.y,()=>{const sm=chSnowman();fxShadow(g,CH.tk.x+2,CH.tk.y,32);if(sm)g.drawImage(sm,Math.round(CH.tk.x-42*CH_SM/2),Math.round(CH.tk.y-43*CH_SM),Math.round(42*CH_SM),Math.round(44*CH_SM));}]);
    MG.gifts.forEach(p=>ents.push([p.y,()=>{const h=Math.max(0,Math.round(Math.sin(Math.min(1,p.t/.5)*Math.PI)*16/2)*2);fxShadow(g,p.x,p.y,16);g.drawImage(fxS('gift',p.pk),Math.round((p.x-9)/2)*2,Math.round((p.y-18-h)/2)*2);}]));
    if(MG.cr){const cr=MG.cr;ents.push([cr.y,()=>{if(cr.t<2&&Math.floor(cr.t*8)%2)return;const b=Math.round(Math.sin(MG.e*5))*2;g.drawImage(fxGlow('#ffb866',14),cr.x-14,cr.y-24);fxShadow(g,cr.x,cr.y,14);g.drawImage(fxS('carrot'),Math.round((cr.x-8)/2)*2,cr.y-22+b);}]);}
    const sink=(o,w)=>{if(chIn(CH.pile,o.x,o.y)){g.fillStyle='#ffffff';g.fillRect(Math.round((o.x-w/2)/2)*2,Math.round(o.y/2)*2-6,w,4);g.fillStyle='#eef3fb';g.fillRect(Math.round((o.x-w/2)/2)*2+2,Math.round(o.y/2)*2-2,w-4,2);}};
    ents.push([T.y,()=>{const fr=Math.floor(T.st)%2,hp=Math.hypot(T.vx,T.vy)>30&&fr?2:0;fxShadow(g,T.x,T.y,32);const ps=fxS('tos'+fr,'',T.f<0),w=Math.round(ps.width*CH_TS),h=Math.round(ps.height*CH_TS);g.drawImage(ps,Math.round(T.x-w/2),Math.round(T.y-h+2-hp),w,h);sink(T,30);}]);
    if(D.gone<=0)ents.push([D.y,()=>{const fr=Math.floor(MG.e*(Math.hypot(D.vx,D.vy)>40?9:3))%2,up=D.jt>0?Math.round(Math.sin((.38-D.jt)/.38*Math.PI)*14/2)*2:0;
      if(D.inv>0&&Math.floor(D.inv*12)%2)return;fxShadow(g,D.x,D.y,40);g.drawImage(fxS('deer'+fr,'',D.f<0),Math.round((D.x-30)/2)*2,Math.round((D.y-42-up)/2)*2);if(!up)sink(D,40);
      if(MG.slow>0)g.drawImage(fxS('carrot'),Math.round((D.x-8+D.f*20)/2)*2,D.y-56);}]);
    ents.sort((a,b)=>a[0]-b[0]).forEach(e=>e[1]());
    /* 나무 뒤 루돌프: 코만 반짝 */
    if(D.gone<=0&&D.hid){const f=Math.floor(MG.e*6)%2,nx=D.x+D.f*26,ny=D.y-33;g.drawImage(fxGlow('#ff4a3a',f?14:10),nx-(f?14:10),ny-(f?14:10));g.fillStyle='#ff3030';g.fillRect(Math.round(nx/2)*2-2,Math.round(ny/2)*2-2,4,4);g.fillStyle='#ffd0c8';g.fillRect(Math.round(nx/2)*2-2,Math.round(ny/2)*2-2,2,2);}
    MG.gifts.forEach(p=>p.t+=dt);
    for(const s of snow){s[1]+=s[2]*30*dt;s[0]+=Math.sin(MG.e+s[1]*.04)*.35;if(s[1]>440){s[1]=-4;s[0]=Math.random()*320;}g.fillStyle='#ffffff';g.globalAlpha=.85;const z=s[2]>1.1?4:2;g.fillRect(Math.round(s[0]/2)*2,Math.round(s[1]/2)*2,z,z);}g.globalAlpha=1;
    MG.fx=MG.fx.filter(f=>{f.t-=dt;g.fillStyle=f.c;for(let k=0;k<8;k++){const a=k*.785,r=(1-f.t/.6)*26;g.fillRect(Math.round(f.x+Math.cos(a)*r)-2,Math.round(f.y+Math.sin(a)*r*.6)-2,4,4);}if(f.m)fxTx(g,f.m,f.x,f.y-24+f.t*20,18,f.c);return f.t>0;});
    /* 타코 말풍선 */
    if(MG.st>0&&!MG.over&&MG.say){g.font=fxF(14);let L=[MG.say];const mx=CH.tk.x-24-12-24;if(g.measureText(MG.say).width>mx){const ws=MG.say.split(' ');let k=1,bd=1e9;for(let i=1;i<ws.length;i++){const d=Math.abs(g.measureText(ws.slice(0,i).join(' ')).width-g.measureText(ws.slice(i).join(' ')).width);if(d<bd){bd=d;k=i;}}L=[ws.slice(0,k).join(' '),ws.slice(k).join(' ')];}
      const w=Math.ceil(Math.max(...L.map(t=>g.measureText(t).width))/2)*2+24,h=L.length*18+12,x=CH.tk.x-24-w,y=CH.tk.y-50;fxPanel(g,x,y,w,h);
      g.fillStyle='#5b2b14';g.fillRect(x+w-2,y+12,4,4);g.fillRect(x+w+2,y+16,4,4);L.forEach((t,i)=>fxTd(g,t,x+w/2,y+15+i*18,14));}
    /* 점수판 */
    fxPanel(g,2,2,316,40);g.drawImage(fxS('gift','g0'),16,12);fxTd(g,'×'+MG.s,38,23,16,'#5b2b14','left');fxTd(g,'루돌프 '+MG.s+'마리',160,23,18,'#a8461a');fxTd(g,Math.max(0,Math.ceil(45-MG.e))+'초',302,23,16,'#5b2b14','right');
    if(MG.slow>0&&!MG.over){fxMsg(g,'당근 효과! 루돌프가 느릿느릿 '+Math.ceil(MG.slow)+'초',418);}
    if(MG.over)MG.card(g);MG.raf=requestAnimationFrame(loop);};MG.raf=requestAnimationFrame(loop);}
function mg9End(){if(MG.over)return;MG.over=1;MG.tp=null;const sc=MG.s,r=sc>=6?2:sc>=3?1:0,[m,nb]=mgRw(r,'3마리부터 도토리를 받아요','b9',sc);mgStop();fxSnd('ch_end');
  MG.card=g=>fxCard(g,'메리 크리스마스!',['루돌프 '+sc+'마리 잡았어요'+(nb?' · 최고 기록!':''),'최고 기록 '+(S.mg.b9||0)+'마리'],null);
  $('mgh').innerHTML='끝! 루돌프 '+sc+'마리'+(nb?' · 최고 기록!':'')+'<br>'+m;$('mgr').style.display='';if(sc>=3)setTimeout(()=>tako('=루돌프 잡기 선수 토리다코~! 🎄','',3000,0),500);}
function actGot(k){return S.actRw.d===todayStr()&&S.actRw.done[k];}
function actPay(k){const td=todayStr();if(S.actRw.d!==td)S.actRw={d:td,done:{}};return k==='ex'||Object.keys(S.actRw.done).filter(x=>x!=='song'&&x!=='ex').length<ECO.actCap?ACT_R:0;}
function rAct(k){const [nm,em]=ACT[k],ym=todayStr().slice(0,7),t=todayStr(),L=[...S.act[k]].sort((a,b)=>(b.date+b.id)<(a.date+a.id)?-1:1),mc=L.filter(e=>e.date.slice(0,7)===ym).length,nx=S.actNext[k]||'',gb=S.actBadge[k]||[];
  $('dbody').innerHTML=`<div class="card"><h2>${em} ${nm} 활동 기록</h2><div class="row sp"><span>이번 달 <b class="qty">${L.filter(e=>e.date.slice(0,7)===ym).length}회</b></span><span>누적 <b class="qty">${L.length}회</b></span></div>
  <div style="margin-top:4px">${'⭐'.repeat(Math.min(mc,10))}${mc>10?' +'+(mc-10):''}</div><div class="muted" style="margin-top:6px">${actGot(k)?'오늘 도토리는 이미 받았어요 (하루 1번)':actPay()?'오늘 기록하면 도토리 🌰'+ACT_R+'개! (활동 도토리는 하루 최대 '+ECO.actCap+'번)':'오늘 활동 도토리는 '+ECO.actCap+'번 다 받았어요'}</div>${blLine(k)}<button class="btn full" style="margin-top:8px" onclick="actForm('${k}')">+ 활동 기록하기</button></div>
  <div class="card"><h2>다음 ${ACT[k][3]} 일정</h2>${nx&&nx>=t?`<div class="q"><span>${nx}</span><span class="dd" style="font-size:calc(16px*var(--fs,1))!important;min-width:0">${ddLabel(nx)}</span></div>`:''}<input id="an" type="date" value="${esc(nx)}"><div class="row"><button class="btn full" onclick="actNext('${k}')">일정 저장</button>${nx?`<button class="btn ghost" onclick="actNext('${k}',1)">지우기</button>`:''}</div><div class="muted" style="margin-top:6px">홈 화면에 D-day로 보여요.</div></div>
  <div class="card"><h2>${nm} 뱃지</h2>${BADGE.map(([n,b,r])=>{const on=gb.includes(n);return `<div class="q ${on?'':'dim'}"><span>${on?'⭐':'🔒'} ${b}<div class="muted">누적 ${n}회 · 🌰${r}</div></span><span class="muted">${on?'획득 ✔':Math.min(L.length,n)+'/'+n}</span></div>`;}).join('')}</div>
  ${actExtra(k,L)}${L.slice(0,30).map(e=>`<div class="card"><div class="row sp"><div class="nm">${esc(e.date)}</div><button class="btn ghost sm" onclick="actForm('${k}','${e.id}')">✏️</button></div><div>${esc(e.what)}</div>${actTag(k,e)}${e.pride?`<div class="muted">⭐ ${esc(e.pride)}</div>`:''}</div>`).join('')||'<div class="empty">첫 활동을 기록해 보세요. 토리가 기다리고 있어요!</div>'}`;}
function actForm(k,id){const [nm,em,ph]=ACT[k],e=S.act[k].find(x=>x.id===id)||{date:todayStr(),what:'',pride:''};
  modal(`<h3>${nm} 활동 ${id?'수정':'기록'}</h3><label>날짜</label><input id="ad" type="date" value="${esc(e.date)}"><label>한 일</label><input id="aw" maxlength="60" placeholder="${esc(ph)}" value="${esc(e.what)}">${actFormX(k,e)}<label>뿌듯했던 점 한 줄</label><input id="ap" maxlength="60" placeholder="오늘 나, 좀 멋졌던 점" value="${esc(e.pride)}"><div class="row">${id?`<button class="btn ghost" onclick="actDel('${k}','${id}')">삭제</button>`:''}<button class="btn ghost full" onclick="closeM()">취소</button><button class="btn full" onclick="actSave('${k}','${id||''}')">저장</button></div>`);}
function actSave(k,id){const w=$('aw').value.trim(),d=$('ad').value,p=$('ap').value.trim();if(!d||!w){toast('날짜와 한 일을 적어 주세요');return;}
  const ex=actGetX(k),o=id&&S.act[k].find(x=>x.id===id);let m='기록했어요!';
  if(o){o.date=d;o.what=w;o.pride=p;delete o.q;Object.assign(o,ex);}else{if(k==='bg'&&ex.game)ex.nw=!S.act.bg.some(y=>y.game&&y.game.toLowerCase()===ex.game.toLowerCase());S.act[k].push({id:uid(),date:d,what:w,pride:p,...ex});starChk(k,d);
    if(d===todayStr()){if(S.actRw.d!==d)S.actRw={d:d,done:{}};if(!S.actRw.done[k]){const r=actPay(k);S.actRw.done[k]=1;S.acorns+=r;if(r)lucky();m=r?'🌰 +'+r+' 활동 기록 완료! 토리가 박수 짝짝짝':'활동 기록 완료! 오늘 활동 도토리는 다 받았어요';sfx('fan');fx('star',10);}}}
  if(!o&&(k==='mj'||k==='band'))mdAct(k);
  if(!o){const bm=blessRes(k,d,ex);if(bm){m+=' · '+bm.t;setTimeout(()=>tako('='+bm.s,'',9000),1800);}}
  const bd=[(!o)?badgeChk(k):'',k==='band'?hourChk():'',(!o&&d===todayStr())?exHook(k):''].filter(Boolean).join(' / ');save();closeM();toast(m);rPlace();takoActRec(k,!!o,d,p,ex);
  if(bd){sfx('fan');fx('star',18);setTimeout(()=>modal(`<div class="big">⭐</div><h3 style="text-align:center">뱃지 획득!</h3><div class="card" style="text-align:center">${esc(bd)}</div><button class="btn full" onclick="closeM()">야호!</button>`),700);}}
function actDel(k,id){askOk('이 기록을 삭제할까요?',()=>{S.act[k]=S.act[k].filter(x=>x.id!==id);save();rPlace();});}
function rPlaceDex(){
  $('dbody').innerHTML=`<div class="chips"><button class="chip ${pView==='dex'?'on':''}" onclick="pView='dex';pPage=0;rPlace()">도감 (${S.places.length})</button><button class="chip ${pView==='wish'?'on':''}" onclick="pView='wish';pPage=0;rPlace()">가고 싶은 곳 (${S.wish.length})</button></div>
  <div class="row" style="margin-bottom:10px"><button class="btn full" onclick="plForm('${pView}')">+ ${pView==='dex'?'다녀온 곳 기록':'가고 싶은 곳 담기'}</button>${pView==='wish'?'<button class="btn wood" onclick="roulette()">🎲 룰렛</button>':''}</div>
  <div class="chips">${['전체',...PTYPES].map(t=>`<button class="chip ${pType===t?'on':''}" onclick="pType='${t}';pPage=0;rPlace()">${t}</button>`).join('')}</div>
  <input id="pq" placeholder="🔍 이름·한 줄 평 검색" value="${esc(pQ)}" oninput="pQ=this.value;pPage=0;plList()"><div id="plist"></div>`;plList();}
function plList(){const q=pQ.trim().toLowerCase();
  const src=(pView==='dex'?S.places:S.wish).filter(p=>(pType==='전체'||p.type===pType)&&(!q||(p.name+' '+(p.comment||'')+' '+(p.memo||'')).toLowerCase().includes(q)));
  const items=pView==='dex'?src.sort((a,b)=>(b.date||'')<(a.date||'')?-1:1):src;
  const pages=Math.max(1,Math.ceil(items.length/PL_PAGE_SIZE));pPage=Math.max(0,Math.min(pPage,pages-1));const group=Math.floor(pPage/5)*5;
  $('plist').innerHTML=items.length?items.slice(pPage*PL_PAGE_SIZE,(pPage+1)*PL_PAGE_SIZE).map(p=>{const u=safeUrl(p.url);
    return pView==='dex'?`<div class="card"><div class="row sp"><div class="nm jua" style="font-size:17px">${esc(p.name)}<span class="badge pty">${esc(p.type)}</span></div><button class="btn ghost sm" onclick="plForm('dex','${p.id}')">✏️</button></div>
    <div class="star">${stars(p.stars||0)}</div><div class="muted">${esc(p.date)}${p.with?' · 👥 '+esc(p.with):''}</div>${p.comment?`<div>${esc(p.comment)}</div>`:''}${u?`<a href="${esc(u)}" target="_blank" rel="noopener">🗺️ 지도 보기</a>`:''}</div>`
    :`<div class="card"><div class="row sp"><div class="nm jua" style="font-size:17px">${esc(p.name)}<span class="badge pty">${esc(p.type)}</span></div><button class="btn ghost sm" onclick="plForm('wish','${p.id}')">✏️</button></div>${p.memo?`<div>${esc(p.memo)}</div>`:''}${u?`<a href="${esc(u)}" target="_blank" rel="noopener">🗺️ 지도 보기</a><br>`:''}<button class="btn sm" style="margin-top:6px" onclick="plGone('${p.id}')">✅ 다녀왔어요</button></div>`;}).join(''):'<div class="empty">'+(pView==='dex'?'다녀온 곳을 기록해 보세요.':'가고 싶은 곳을 담아 보세요.')+'</div>';if(items.length)$('plist').innerHTML+=`<nav class="place-pages" aria-label="장소 페이지"><button class="btn ghost sm" onclick="plPage(-1)" aria-label="이전 페이지">◀</button>${Array.from({length:Math.min(5,pages-group)},(_,j)=>{const n=group+j;return `<button class="btn ghost sm" onclick="plPageTo(${n})" ${n===pPage?'aria-current="page"':''}>${n+1}</button>`;}).join('')}<button class="btn ghost sm" onclick="plPage(1)" aria-label="다음 페이지">▶</button></nav><p class="muted" style="text-align:center">${pPage+1} / ${pages} 페이지 · ${items.length}곳</p>`;}
function plPage(delta){const q=pQ.trim().toLowerCase(),src=pView==='dex'?S.places:S.wish,n=src.filter(p=>(pType==='전체'||p.type===pType)&&(!q||(p.name+' '+(p.comment||'')+' '+(p.memo||'')).toLowerCase().includes(q))).length;const pages=Math.max(1,Math.ceil(n/PL_PAGE_SIZE));pPage=(pPage+delta+pages)%pages;plList();}
function plPageTo(page){pPage=page;plList();}
function plForm(view,id,pre){const isDex=view==='dex';const p=(isDex?S.places:S.wish).find(x=>x.id===id)||pre||{name:'',type:'식당',date:todayStr(),stars:4,comment:'',with:'',memo:'',url:''};
  modal(`<h3>${isDex?'다녀온 곳':'가고 싶은 곳'}</h3><label>이름</label><input id="pn" maxlength="40" value="${esc(p.name)}"><label>종류</label><select id="pt">${PTYPES.map(t=>`<option ${t===p.type?'selected':''}>${t}</option>`).join('')}</select>
  ${isDex?`<label>다녀온 날짜</label><input id="pd" type="date" value="${esc(p.date)}"><label>별점</label><select id="ps">${[5,4,3,2,1].map(n=>`<option value="${n}" ${n===p.stars?'selected':''}>${stars(n)}</option>`).join('')}</select><label>한 줄 평</label><input id="pc" maxlength="80" value="${esc(p.comment)}"><label>같이 간 사람</label><input id="pw" maxlength="30" value="${esc(p.with)}">`:`<label>메모</label><input id="pm" maxlength="80" value="${esc(p.memo)}">`}
  <label>지도 링크 (선택)</label><input id="pu" type="url" inputmode="url" placeholder="https://" value="${esc(p.url)}"><div class="row"><button class="btn ghost full" onclick="closeM()">취소</button><button class="btn full" onclick="plSave('${view}','${id||''}','${pre&&pre.fromWish||''}')">저장</button></div>${id?`<button class="btn pink full" style="margin-top:8px" onclick="plDel('${view}','${id}')">삭제</button>`:''}`);}
function plSave(view,id,fromWish){const n=$('pn').value.trim();if(!n){toast('이름을 넣어 주세요');return;}
  const url=$('pu').value.trim();if(url&&!safeUrl(url)){toast('링크는 http로 시작해야 해요');return;}
  const isDex=view==='dex';const o={name:n,type:$('pt').value,url};
  if(isDex)Object.assign(o,{date:$('pd').value||todayStr(),stars:+$('ps').value,comment:$('pc').value.trim(),with:$('pw').value.trim()});else o.memo=$('pm').value.trim();
  const arr=isDex?S.places:S.wish;if(id)Object.assign(arr.find(x=>x.id===id),o);else{arr.push({id:uid(),...o});if(isDex){const td=todayStr();if(S.dexD.d!==td)S.dexD={d:td,n:0};if(S.dexD.n<1){S.dexD.n++;S.acorns+=ECO.dex;window.acNote=' · 🌰+'+ECO.dex;}}}
  if(fromWish)S.wish=S.wish.filter(x=>x.id!==fromWish);
  save();closeM();rPlace();toast((fromWish?'도감으로 옮겼어요 🎉':'저장했어요')+(window.acNote||''));window.acNote='';takoPlRec(isDex,!!id,fromWish,o);}
function plDel(view,id){askOk('삭제할까요?',()=>{if(view==='dex')S.places=S.places.filter(x=>x.id!==id);else S.wish=S.wish.filter(x=>x.id!==id);save();closeM();rPlace();});}
function plGone(id){const w=S.wish.find(x=>x.id===id);if(w)plForm('dex','',{name:w.name,type:w.type,url:w.url,date:todayStr(),stars:4,comment:'',with:'',fromWish:id});}
function roulette(){const pool=S.wish.filter(p=>pType==='전체'||p.type===pType);if(!pool.length){toast('가고 싶은 곳을 먼저 담아 주세요');return;}
  modal(`<h3>🎲 오늘 뭐 먹지?</h3><div class="big" id="rl" style="font-size:26px;min-height:70px"></div><button class="btn full" onclick="closeM()">닫기</button>`);
  let n=0;const t=setInterval(()=>{const p=pool[Math.floor(Math.random()*pool.length)];$('rl').textContent=p.name;if(++n>14){clearInterval(t);$('rl').textContent='🎉 '+p.name;}},90);}
/* ---------- 설정 ---------- */
/* 버전 정보: 세 자리 표기: 작은 수정 +1, 큰 변화 +5 (마지막 자리 올림 포함). sw.js의 CACHE 이름(jw-diary-v숫자)도 같은 숫자로 맞춰요 */
const APP_VER={v:'v1.3.8',d:'2026.10.18',log:["티츄가 가로 화면에서 손패와 내기 버튼이 스크롤 없이 한눈에 보여요", "사라진 도토리 사건 결과 화면에 옛 사건 내용이 남지 않아요", "가로 온천에서 안내 줄이 위쪽으로 옮겨가 친구를 안 가려요", "바로 가기 칩·장식 구매 버튼을 누르기 쉬운 크기로 키웠고, 백업 파일 저장 버튼은 한 줄로 나와요", "타코 말풍선이 아래 카드를 가리지 않아요", "집 꾸미기는 「토리의 방」, 리본·왕관은 「토리 꾸미기」로 이름을 바꿨고, 햄스터 카드엔 보유 도토리와 코인만 크게 나와요"]};
/* 버전 기록: 맨 앞이 최신. 새 버전을 낼 때 맨 앞에 한 줄 추가하고 APP_VER도 맞춰요 */
const VER_HIST=[
 {v:'v1.3.8',d:'2026.10.18',log:["티츄가 가로 화면에서 손패와 내기 버튼이 스크롤 없이 한눈에 보여요", "사라진 도토리 사건 결과 화면에 옛 사건 내용이 남지 않아요", "가로 온천에서 안내 줄이 위쪽으로 옮겨가 친구를 안 가려요", "바로 가기 칩·장식 구매 버튼을 누르기 쉬운 크기로 키웠고, 백업 파일 저장 버튼은 한 줄로 나와요", "타코 말풍선이 아래 카드를 가리지 않아요", "집 꾸미기는 「토리의 방」, 리본·왕관은 「토리 꾸미기」로 이름을 바꿨고, 햄스터 카드엔 보유 도토리와 코인만 크게 나와요"]},
 {v:'v1.3.7',d:'2026.10.18',log:["미니게임·보드게임·틀린그림·온천 창이 부드럽게 열리고 닫혀요", "티츄 팀 작전 카드를 아래로 옮겨서 폰 세로 화면에서도 손패와 내기 버튼이 보여요", "스도쿠가 가로 화면에서 판과 버튼이 나란히 놓여요", "작은 버튼들을 누르기 쉬운 크기로 키웠어요", "장식을 살 때 한 번 물어보고, 상점 쪽수가 끝에서 처음으로 이어져요", "백업 버튼과 설명 문구 이름을 맞췄어요"]},
 {v:'v1.3.6',d:'2026.10.18',log:["폰을 가로로 돌려도 미니게임 판과 닫기 단추가 화면 안에 다 보여요", "유령 잡기·사탕 미로 끝 화면에서 글자가 겹치던 것을 고쳤어요", "앱을 켜 둔 채 자정이 지나면 홈이 새 날로 바뀌어요", "가로 화면에서 토리 사진이 화면 안에 들어오고, 홈 버튼이 누르기 쉬운 크기가 됐어요", "밤 타코 말풍선이 더 빨리 사라지고, 홈 카드 제목·문구를 다듬었어요"]},
 {v:'v1.3.1',d:'2026.10.18',log:["TV 테트리스 이름이 「테토리스」로 바뀌었어요", "TV 화면이 잘려 보이던 문제를 고쳐서 화면이 TV에 꽉 차게 나와요", "TV 화면 오른쪽 아래 토리 응원 그림은 뺐어요"]},
 {v:'v1.3.0',d:'2026.10.18',log:["놀이 미니게임에 「TV 테트리스」가 들어왔어요. 옛날 TV를 리모컨으로 켜서 블록을 쌓아요", "방향키로 옮기고, 위·확인 버튼으로 돌리고, 아래를 꾹 누르면 빨리 내려와요. 숫자 버튼으로 시작 레벨을 골라요", "10줄을 지우면 도토리 1개, 25줄이면 2개를 받아요(다른 미니게임과 하루 횟수를 함께 써요)"]},
 {v:'v1.2.5',d:'2026.10.18',log:["틀린 그림 찾기 34장이 모두 어려워졌어요. 다른 곳이 7곳이고, 살짝 바뀐 색이나 사라진 작은 소품도 찾아야 해요(완료 기록은 새로 시작해요)", "온천 화면이 꽉 차고, 구름이 둥둥 흘러가고 물결이 반짝이며 움직여요", "앨범 사진을 크게 볼 때 「홈 토리 사진으로 쓰기」를 누를 수 있어요", "사진이 작은 그림부터 먼저 떠서 빨리 보여요", "홈 토리가 숨 쉴 때 도토리가 늘어나 보이던 것, 앱을 닫을 때 띵 소리가 나던 것을 고쳤어요"]},
 {v:'v1.2.4',d:'2026.10.17',log:["틀린 그림 찾기에 새 그림 30장이 들어왔어요(도트 15장·로판 12장·사천당가 3장)", "그림 번호는 5개씩 보이고, ◀▶로 넘기면 끝과 처음이 이어져요", "겹쳐 있는 정답도 누른 곳에서 가장 가까운 곳으로 찾아져요"]},
 {v:'v1.1.9',d:'2026.10.12',log:["파일을 역할별 폴더(css, js, data, images 등)로 정리했어요", "화면과 동작은 그대로예요"]},
 {v:'v1.1.8',d:'2026.10.12',log:["시시오도시를 새 도트 원화로 다시 그려 짧은 윗관이 아랫통의 열린 입구에 물을 흘려요", "물받기·기울임·온천에 쏟기·복귀·돌 치기를 한 동작으로 맞췄어요", "세로와 가로에서 온천 배경 전체가 보이고 물결은 바위를 움직이지 않아요", "별은 각자 반짝이고 달빛·창문빛·아래쪽 햇빛이 잔잔히 일렁여요", "도감의 장소·일기 페이지 버튼이 실제로 넘겨지도록 고쳤어요", "밥·도토리 반응 그림이 부드럽게 사라지고 기본 터치 메뉴와 바다 생물 등장 알림을 막았어요", "대나무 톡 소리는 실제 시시오도시 녹음으로 바꾸고 새는 자연스러운 곡선으로 함께 날아요"]},
 {v:'v1.1.3',d:'2026.10.12',log:["온천 버튼을 시간대에 맞는 반투명 색으로 바꾸고 아래 제목을 지웠어요", "계절별 온천 대사 48개와 새 주간 만담 12편을 추가했어요", "온천 물결·달·별·조명과 대나무 물줄기를 자연스럽게 다듬었어요", "시간대가 바뀌면 온천 풍경과 버튼 색이 조용히 바뀌어요", "도감의 일기를 페이지로 넘기고 일기 고치기에 토리 아이콘을 사용해요", "길게 누르기·복사·브라우저 확대와 타코 게임의 빨간 알림을 막았어요", "버전 표기를 세 자리로 바꾸고 온천에서 쓰는 그림과 캐시를 정리했어요"]},
 {v:'v1.0.8',d:'2026.10.11',log:['온천의 밤을 청록빛으로 바꾸고 친구 위치와 물 흐름을 다듬었어요','틀린그림찾기에 세로 스크롤·두 손가락 확대·돌아가기 버튼을 추가했어요','그림 선택 페이지 위치와 타코 말투, 마작방 나가기 크기를 다듬었어요']},
 {v:'v1.0.7',d:'2026.10.11',log:["온천에 들어가면 음악과 물소리가 바로 시작돼요. 오른쪽 위에서 소리 크기를 조절해요", "온천은 실제 시간에 맞춰 바뀌고 작은 화살표로 나가요", "대나무에 물이 차고 기울어지는 도트 동작과 톡 소리를 추가했어요", "구름·빛·물결이 도트처럼 움직이고 가끔 새가 지나가요", "온천 친구들의 대사 48개와 일주일 간격의 토리·타코 수다 12편을 추가했어요"]},
 {v:'v1.0.2',d:'2026.10.11',log:["토리네 온천에서 화면 방향에 맞는 배경과 새 목욕 도트 친구들을 만나요", "시간대별 온천과 느긋한 전용 도트게임 음악을 추가했어요", "토리에게 도토리를 주고 사진이 바뀔 때 부드럽게 사라져요", "그림 선택 시작 버튼과 페이지 버튼을 겹치지 않게 정리했어요", "틀린그림찾기 힌트를 타코에게 물어보기로 통일했어요", "새 그림 화질과 한 화면 비교·크게보기를 개선했어요", "미니게임 버튼·드래그 조작·도감 페이지·도치 말투·명랑한 편지를 개선했어요", "앱을 열 때 배경음악 팝업을 표시하지 않아요", "도토리 찾기 장소 여섯 곳을 따뜻한 도트 그림으로 바꿨어요"]},
 {v:'v0.9.7',d:'2026.10.10',log:["틀린 그림 찾기에서 그림을 한 장씩 넘겨 보고 골라 시작해요", "완료한 그림은 뒤로 이동하고 완료 기록은 앱을 다시 열어도 남아요", "기존 두 장을 유지하고 별빛 도서관과 유리 온실 정원 그림을 추가했어요", "화면에 맞춰 두 그림 전체를 스크롤 없이 함께 보여줘요", "모르겠을 때 타코에게 물어보면 못 찾은 곳을 잠깐 알려줘요", "새 그림을 가로 비율 그대로 최적화하고 다섯 정답 밖은 원본과 같게 맞췄어요"]},
 {v:'v0.9.2',d:'2026.10.10',log:["틀린 그림 찾기를 딸기 티파티와 도토리 쿠키 공방 그림으로 교체했어요", "두 그림을 같은 세로 규격으로 맞추고 각각 다른 곳 다섯 개를 찾아요", "그림 크게 보기와 이미지 다시 불러오기를 넣었어요", "마작방 입구에 친구들이 함께하는 새 사진을 넣었어요", "새 그림 용량을 줄이고 오프라인에서도 볼 수 있게 했어요", "그림 정답·터치·화면 비율과 게임·기록 보존을 점검하고 코드를 정리했어요"]},
 {v:'v0.9.1',d:'2026.10.10',log:["보드게임 목록을 간결하게 정리하고 하던 판 정보는 바로 볼 수 있게 했어요", "D-day 숫자를 이전 크기의 70%로 줄였어요", "마작방 음악을 잔잔한 현악 음색과 패 소리로 바꾸고 소리 시작 동작을 다듬었어요", "마작방 글꼴을 앱과 통일하고 뒷면 패는 5% 작게, 앞면 패는 10% 크게 조정했어요", "마작 좌석을 내 자리 기준 반시계 방향 동·남·서·북으로 배치했어요", "화료한 패를 머리·몸통·치·퐁·깡으로 나누고 패가 세로로 늘어나는 문제를 고쳤어요", "손패를 선택하면 같은 버림패와 장수를 확인할 수 있어요", "울어서 가져간 버림패는 작은 화살표로 표시해요", "마작 대화와 음악 데이터를 분리하고 재입장·오프라인·기록 보존을 검사했어요"]},
 {v:'v0.9.0',d:'2026.10.09',log:["사진 상점은 한 페이지에 7개씩, 페이지 번호 5개 묶음으로 둘러봐요", "도토리·밥을 줄 때 토리 사진이 1.5초 동안 나와요", "사라진 도토리 사건에서 범인만 맞히면 부분 정답으로 안내해요", "글꼴을 앱에 넣고 미니게임 화면과 목록의 가독성을 다듬었어요", "티츄에서 진우가 팀 작전을 고르면 토리가 답하고 작전에 맞춰 플레이해요", "타코의 시작 인사는 하루 첫 실행에만 나와요", "토리네 마작방이 별도 탭으로 들어왔어요: 리치·론·깡·역·점수를 지원해요", "마작패 그림과 뒷면, 색 대비, 손패와 선언 버튼, 결과 화면을 다듬었어요", "마작방 전용 음악과 패·선언 효과음을 만들었어요", "냐옹이와 도치가 상황별 훈수와 네 친구에 대한 평, 둘만의 만담을 나눠요", "냐옹이 이름 위에 여백을 넣고 수다 버튼과 선언 연습 화면은 정리했어요", "놀이 탭을 작은 연갈색 버튼으로, 미니게임 목록을 정사각형 카드로 바꿨어요", "마작과 틀린 그림 찾기는 가로 한 줄의 별도 탭이에요", "마작은 동4국까지 점수를 이어 가고 친 화료·텐파이 유국이면 연장해요", "마작 결과에서 다음 국으로 넘어가고 동풍전 최종 순위를 확인해요", "마작패를 작게 줄여 네 사람의 패와 버림패를 함께 살펴봐요", "마작방 재입장·오프라인 연결을 다듬고 다시 열기 안내를 넣었어요", "틀린 그림 찾기 6개 풍경과 힌트·정답 표시가 들어왔어요"]},
 {v:'v0.8.9',d:'2026.10.09',log:["사진 상점은 한 페이지에 7개씩, 페이지 번호 5개 묶음으로 둘러봐요", "도토리·밥을 줄 때 토리 사진이 1.5초 동안 나와요", "사라진 도토리 사건에서 범인만 맞히면 부분 정답으로 안내해요", "글꼴을 앱에 넣고 미니게임 화면과 목록의 가독성을 다듬었어요", "티츄에서 진우가 팀 작전을 고르면 토리가 답하고 작전에 맞춰 플레이해요", "타코의 시작 인사는 하루 첫 실행에만 나와요", "미니게임에 토리네 마작방이 들어왔어요: 리치·론·깡·역·점수를 지원해요", "마작패 그림과 뒷면, 색 대비, 손패와 선언 버튼, 결과 화면을 다듬었어요", "마작방 전용 음악과 패·선언 효과음을 만들었어요", "냐옹이와 도치가 상황별 훈수와 네 친구에 대한 평, 둘만의 만담을 나눠요", "냐옹이 이름 위에 여백을 넣고 수다 버튼과 선언 연습 화면은 정리했어요"]},
 {v:'v0.8.4',d:'2026.10.07',log:['조금 흐릿하던 이모지 7개(머리 손질 · 공주 · 귀뚜라미 · 히나 인형 · 휴대폰 · 집 · 목도리)를 손으로 또렷하게 다시 그렸어요']},
 {v:'v0.8.3',d:'2026.10.07',log:['사라진 도토리 사건: 부엉박사(학사모 · 안경)와 냐옹이(치즈 고양이)가 도치 · 호두처럼 전신 도트 그림으로 바뀌었어요']},
 {v:'v0.8.2',d:'2026.10.07',log:['홈이 짧아졌어요: 토리 사진 → 오늘의 퀘스트(주간 퀘스트 포함) → 도토리 속 편지 → 빠른 기록 · 일기 → 현재 상태 → D-day · 기념일 → 놀이','활동 · 출석 · 일기 모아 보기 · 리포트 같은 카드는 홈 맨 아래 "더 보기"를 누르면 펼쳐져요','미니게임과 보드게임이 홈의 "놀이" 카드 하나에 모였어요 (위 버튼으로 바꿔 봐요)','햄스터 탭은 밥 주기 · 도토리 상점 · 장식 · 꾸미기 · 칭호 · 앨범 순서예요','설정은 백업 · 알림 · 화면과 소리 · 일정과 기념일 · 도움말 다섯 묶음으로 접고 펼쳐요']},
 {v:'v0.8.1',d:'2026.10.07',log:['보드게임에 새 추리 게임 "사라진 도토리 사건"이 들어왔어요','장소 6곳(토리의 방 · 챗바퀴 놀이터 · 도토리 숲 · 바닷가 · 무대 · 부엌)을 조사하고 증거와 친구들 말로 누가 · 무엇으로 · 어디서 가져갔는지 맞혀요','어려움에서는 범인이 거짓말을 해요. 맞히면 🌰1, 적게 조사하고 맞히면 🌰2','새 친구: 다람쥐 호두 · 부엉박사 · 고양이 냐옹이','홈이 아래 탭 가운데로 오고, 홈을 열면 토리 사진이 맨 위에 바로 보여요','백업 알림: 15일 동안 백업을 안 하면 타코가 알려 줘요. "나중에 할게"를 누르면 15일 뒤에 다시 알려 줘요','도토리 상점이 한 페이지에 5개씩 나오고, 첫 페이지와 마지막 페이지가 이어져요','내 기념일은 연도 없이 월 · 일만 골라요','새 사진들의 이모지도 도트 그림으로 바꿨어요','장식을 눌렀을 때 타코 말풍선이 짧아지고 버튼 4개가 한 줄로 나와요']},
 {v:'v0.8.0',d:'2026.10.07',log:['도토리 상점에 새 사진 150장이 들어왔어요 (일반 20코인, 전설 16장은 40코인)','새 테마: 조선·신라·고려·한복, 고대 그리스·이집트, 헤이안·겐지모노가타리, 상어·펭귄·타조, 수영장·목욕, 우주·심해 등 — 앨범에서 모아 볼 수 있어요','이미 산 사진과 코인은 그대로예요']},
 {v:'v0.7.9',d:'2026.10.07',log:['보물상자가 도토리 상점으로 바뀌었어요: 토리에게 도토리를 주면 준 만큼 도토리 코인이 생기고, 코인으로 원하는 쿠폰·사진·타코 축복·꾸미기·편의 아이템을 골라 살 수 있어요 (한 번만 살 수 있어요)','이미 연 상자는 전부 보유로 남아 있고, 레벨과 준 도토리는 그대로예요','햄스터 탭에는 코인과 지금 살 만한 것 3개만 보이고, 상점 전체 보기에서 탭(쿠폰·사진·타코 축복·꾸미기·편의)과 살 수 있는 것만 보기로 싼 순으로 볼 수 있어요']},
 {v:'v0.7.8',d:'2026.10.06',log:['홈에 새 "🎳 보드게임" 칸: 스도쿠(쉬움·보통·어려움, 메모·힌트·되돌리기, 중간에 나가도 저장)와 티츄(진우·토리 팀 대 타코·도치 팀, 컴퓨터 3명, 200점 먼저 넘기면 승리)','보상: 스도쿠 다 풀면 🌰1(어려움 🌰2), 티츄 이기면 🌰2 — 미니게임과 합쳐 하루 2번','보드게임 아이콘과 티츄 특수 카드(참새·강아지·봉황·용)를 새로 그렸어요','보드게임 대사: 티츄에서 토리(찍찍!)·타코(~다코)·도치(허세 많은 "가시 대장")가 카드 낼 때·패스·티츄·폭탄·용·판 끝에 한마디, 스도쿠에선 토리가 옆에서 응원','햄스터·설정 탭 위에 바로 가기 칸, 많이 내려가면 "맨 위로" 버튼, 한글이 단어 중간에서 끊기지 않게','눈사람 타코 모자 아래·목도리 위에 검은 테두리','설정 백업 칸: "파일 저장"과 "파일에서 복원" 버튼을 한 줄에 나란히']},
 {v:'v0.7.5',d:'2026.10.06',log:['12월 23일에 이름이 생겼어요: 크리스마스 이브의 이브 (기념일 카드·달력·토리 말풍선)','유령 잡기를 새로 그렸어요: 보름달 밤하늘·유령의 집·묘지 울타리·불 켜지는 호박·박쥐, 점수판도 나무 창으로 (규칙·보상은 그대로)','사탕 미로의 보라 유령이 겁먹었을 때도 반투명하게 보여요']},
 {v:'v0.7.4',d:'2026.10.06',log:['레벨 올리는 데 필요한 도토리가 점점 늘어나요: Lv.2~10은 5개, 11~30은 10개, 31~60은 25개, 61~100은 50개씩이고 Lv.100이 최고예요','칭호가 10단계로 늘었어요 (견습 햄스터 · 견습 모험가 · 모험가 · 기사 · 마법사 · 대마법사 · 도토리 귀족 · 도토리 왕 · 도토리 황제 · 전설의 용사)','레벨 기준이 바뀌었다는 안내창을 한 번 보여 줘요. 먹인 도토리와 보물상자는 그대로예요']},
 {v:'v0.7.3',d:'2026.10.06',log:['루돌프 잡기: 눈사람 타코의 산타 모자를 작고 깜찍하게 줄였어요','루돌프가 펄쩍 뛸 때 목 방울이 짤랑, 당근을 주우면 종소리가 울려요']},
 {v:'v0.7.2',d:'2026.10.06',log:['크리스마스 주간(12/18~25) 새 미니게임 "도망가는 루돌프를 잡아라!": 손가락을 끌면 빨간 산타 모자를 쓴 토리가 달려가요. 루돌프를 잡을 때마다 선물이 떨어지고, 잡을수록 루돌프가 빨라져요','눈더미에선 느려지고 얼음판은 미끄러워요. 나무 뒤에 숨은 루돌프는 코만 반짝! 당근을 주우면 3초 동안 루돌프가 느려지고, 산타 모자를 쓰고 목도리를 두른 채 눈덩이 위에 앉은 눈사람 타코가 힌트를 알려 줘요','45초 동안 3마리면 도토리 1개, 6마리면 2개 (보상 횟수는 다른 미니게임과 합산). 루돌프 썰매 배달도 그대로 있어요','"백업 보내기" 버튼: 공유 창에서 카톡 나에게 보내기·드라이브·메일로 백업 파일을 보내요 (설정 · 홈 백업 카드)','백업한 지 7일이 지나면 홈 백업 카드가 콩콩 뛰고 토리와 타코가 말로 알려 줘요']},
 {v:'v0.6.9',d:'2026.10.06',log:['도감·가고 싶은 곳에서 장소 종류(식당·카페·놀거리·기타) 글씨가 흰색이라 안 보이던 것을 진한 갈색으로 고쳤어요']},
 {v:'v0.6.8',d:'2026.10.06',log:['아이폰(사파리)에서 홈 화면에 추가할 때 쓰는 토리 아이콘을 넣었어요','토리가 기지개를 켤 때 머리 위 물병과 겹쳐 보이던 것을 줄였어요']},
 {v:'v0.6.7',d:'2026.10.05',log:['토리를 쓰다듬을 때 사진만 출렁이고 얼굴은 가만히 있던 것을 고쳤어요 (슬퍼할 때 · 밤에도)','토리가 숨 쉴 때 도토리 쥔 손이 늘어나 보이던 것을 고쳤어요','미니게임 글자를 얇고 또렷하게 바꿨어요','타코 띄워 주기에서 바다 생물이 나오기 전 흰 상자 대신 작은 빨간 느낌표가 깜빡여요','도감 장소 종류 글씨가 안 보이던 것 · 일정 입력칸이 화면 밖으로 나가던 것 · 내 기념일 버튼 간격을 고쳤어요','보상 탭의 "새 보상 넣기"를 뺐어요 (이미 있는 보상은 그대로예요)']},
 {v:'v0.6.6',d:'2026.10.03',log:['마작패 짝 맞추기: 다 맞췄을 때 "쾅—" 하고 크게 울리는 진짜 징 소리로 바꿨어요']},
 {v:'v0.6.5',d:'2026.10.03',log:['유령 잡기 · 토리의 사탕 미로 · 마작패 짝 맞추기 · 루돌프 썰매 배달에 게임마다 전용 배경음악과 효과음을 넣었어요','사탕 미로에서 유령이 겁먹으면 음악이 빨라져요','루돌프 썰매 배달: 시작·배달·끝에 맑은 종소리가 울리고, 배경음악에도 종이 울려요']},
 {v:'v0.6.4',d:'2026.10.03',log:['할로윈 주간(10/25~31) 새 미니게임 "토리의 사탕 미로": 마녀 모자 토리를 밀어서 움직여 사탕을 모아요. 호박 등불을 먹으면 유령을 잡을 수 있어요','11월 마지막 주(11/24~30) 새 미니게임 "마작패 짝 맞추기": 진짜 마작패 20장으로 하는 짝 맞추기','크리스마스 주간(12/18~25) 새 미니게임 "루돌프 썰매 배달": 굴뚝에 선물을 쏙! 루돌프 코가 반짝일 때 2배']},
 {v:'v0.5.9',d:'2026.10.03',log:['유령 잡기의 3점짜리 금빛 유령을 보라 유령으로 바꿨어요']},
 {v:'v0.5.8',d:'2026.10.03',log:['할로윈(10월 31일)을 기념일에 넣었어요. 홈 기념일 카드에 D-day가 나오고, 그날엔 토리가 할로윈 인사를 해요','할로윈 날엔 홈 토리의 방에 박쥐가 날아다니고 유령이 둥실 떠 있어요','할로윈 주간(10월 25~31일)에만 열리는 미니게임 "유령 잡기"가 생겼어요. 호박 등불에서 튀어나오는 유령을 탭! 금빛 유령은 3점, 박쥐는 -2점']},
 {v:'v0.5.7',d:'2026.10.03',log:['홈 "다가오는 일정 · 기념일" 이름을 "기념일"로 바꾸고, 맨 아래 설명 두 줄을 뺐어요','도토리 속 편지 끝 "from. 토리" 옆 햄스터 그림을 뺐어요','홈 "현재 상태"를 도토리 · 보상 두 칸으로 깔끔하게 정리했어요','토리 집 꾸미기의 "자리 초기화" 버튼을 오른쪽으로 옮겼어요','토리의 챗바퀴를 처음 화면으로 되돌렸어요']},
 {v:'v0.5.6',d:'2026.10.02',log:['11월 도토리 받기: 잘 그린 도트 나무처럼 다시 그렸어요 (동그란 잎 덩어리 · 빛과 그림자 · 가지 · 뿌리 · 땅 그늘)','11월 타코 띄워 주기: 예전 바다 화면으로 돌아가고, 햇살 빛줄기가 천천히 일렁여요']},
 {v:'v0.5.5',d:'2026.10.02',log:['11월부터 나오는 도토리 받기 · 타코 띄워 주기 그림을 더 촘촘하고 따뜻하게 다시 그렸어요 (숲 · 나무 · 풀꽃 · 바구니 / 바닷속 · 해초 · 산호 · 바위 · 해파리)']},
 {v:'v0.5.4',d:'2026.10.02',log:['도토리 받기 · 타코 띄워 주기 · 기타리스트는 10월 동안 처음의 단순한 화면으로 즐겨요. 11월 1일부터 숲 · 바다 · 무대 화면으로 저절로 바뀌어요']},
 {v:'v0.5.3',d:'2026.10.02',log:['토리의 챗바퀴: 시작 화면 · 3·2·1 · 화면 안 시간/바퀴 표시 · 하트 박자 · 속도계 · 별점 결과 카드','타코 띄워 주기에서 새우가 반짝반짝 깜빡이던 것을 고쳤어요 (눈 칸에 색이 빠져 있었어요)']},
 {v:'v0.5.2',d:'2026.10.02',log:['설정의 알림 칸을 하나로 합쳤어요 (토리 알림 + 캘린더 매일 알림)','타코 띄워 주기 배경을 꾸몄어요: 햇살 비치는 바다, 흔들리는 해초와 산호, 조개가 있는 모래 바닥, 떠오르는 물방울']},
 {v:'v0.5.1',d:'2026.10.02',log:['좁은 화면이나 큰 글씨에서 "내역" · "자리 초기화" 같은 버튼 글자가 세로로 꺾이던 걸 고쳤어요','미니게임 효과음을 조금 작게 했어요 (예전의 70%)','홈 "내역 · 퀘스트 하러 가기" 버튼이 늘 한 줄로 나란히 보여요','토리의 챗바퀴: 달리는 토리, 바퀴, 물병 · 밥그릇 · 톱밥 바닥을 새로 그렸어요','도토리 받기: 숲 배경 · 바구니 든 토리 · 새 도토리와 금도토리 · 돌','기타리스트: 무대 조명과 기타 지판, 동그란 보석 음표','토리 알림: 설정에서 켜면 밥을 안 줬거나 오래 안 들어올 때 토리가 알림을 보내요 (안드로이드 홈 화면 앱)','월 보상의 "해주는" 항목 7개를 진우가 스스로 누리는 보상으로 바꿨어요']},
 {v:'v0.5.0',d:'2026.10.02',log:['아이콘 10개를 더 알아보기 쉽게 다시 그렸어요 (젓가락 · 폭죽 · 박 · 원숭이 · 기도 · 퍼즐 · 귀 · 화남 · 온천 · 집기)']},
 {v:'v0.4.9',d:'2026.10.02',log:['장식 · 보물상자 · 보상 · 앨범 페이지도 끝에서 넘기면 처음으로, 처음에서 뒤로 넘기면 끝으로 이어져요']},
 {v:'v0.4.8',d:'2026.10.02',log:['◀ ▶ 화살표를 앱과 어울리는 픽셀 그림으로 바꿨어요','버전 기록이 끝에서 더 넘기면 처음으로, 처음에서 뒤로 넘기면 끝으로 이어져요']},
 {v:'v0.4.7',d:'2026.10.02',log:['일정을 넣고 고치고 지울 수 있어요 (홈 · 설정 · 달력)','내 기념일(매년)을 추가 · 삭제할 수 있어요','버전 기록을 한 장씩 넘겨 지난 업데이트를 모두 볼 수 있어요']},
 {v:'v0.4.6',d:'2026.10.02',log:['토리가 기록을 기억해요: 어제 마작·합주·운동·다녀온 곳·일기를 보고 먼저 말을 걸어요','토리가 움직일 때 볼이 어색해 보이던 것을 원인부터 고쳤어요','안 쓰는 코드와 옛 아이콘을 정리했어요']},
 {v:'v0.4.5',d:'2026.10.02',log:['토리의 방 꾸미기: 벽 장식·바닥 장식 구분, 크기 3단계, 토리 앞/뒤에 놓기','장식 세트 7가지: 다 모으면 도토리와 칭호를 받아요','토리가 움직일 때 볼 쪽 테두리가 두 줄로 보이던 것 고침']},
 {v:'v0.4.4',d:'2026.10.02',log:['아이콘 10개를 더 또렷하게 다시 그렸어요 (일렉기타·발자국·수영·안아 줘·쉿·빙글 별 등)']},
 {v:'v0.4.3',d:'2026.10.02',log:['살아 있는 토리가 도트 게임처럼 한 칸씩 툭툭 움직여요','토리가 움직일 때 주변 배경이 일렁이지 않아요(토리만 오려서 움직여요)']},
 {v:'v0.4.2',d:'2026.10.02',log:['토리가 살아 있어요: 숨 쉬고, 눈을 깜빡이고, 가끔 기지개를 켜요','토리가 다른 자세인 그림(누움·잠·운동 등)과 움직임 줄이기 설정에서는 가만히 있어요']},
 {v:'v0.3.7',d:'',log:['앱에 쓰인 이모지를 모두 16×16 픽셀 아이콘으로 통일했어요']},
 {v:'v0.3.2',d:'',log:['장식 · 아래 탭 · 도토리를 16×16 픽셀 아이콘으로 바꿨어요']},
 {v:'v3',d:'',log:['픽셀 제목 · 픽셀 글꼴 · 귀여운 배경 무늬가 생겼어요']}];
let verI=0;
function verOpen(i){const n=VER_HIST.length;verI=(((i||0)%n)+n)%n;const V=VER_HIST[verI];
  modal(`<div id="verbox"><h3>📜 JW Diary ${esc(V.v)}${verI?'':' <span class="badge g-희귀">최신</span>'}</h3><div class="muted">${V.d?esc(V.d)+' 업데이트':'날짜 기록 없음'} · ${verI+1} / ${n}</div><div class="card" style="margin-top:8px">${V.log.map(l=>'· '+esc(l)).join('<br>')}</div>
  <div class="row sp"><button class="btn sm" onclick="verOpen(${verI-1})" aria-label="새 버전 쪽">◀</button><span class="muted">밀어서 넘겨요</span><button class="btn sm" onclick="verOpen(${verI+1})" aria-label="옛 버전 쪽">▶</button></div>
  <button class="btn ghost full" style="margin-top:8px" onclick="closeM()">닫기</button></div>`);
  const b=$('verbox');let sx=null;b.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;},{passive:true});
  b.addEventListener('touchend',e=>{if(sx==null)return;const dx=e.changedTouches[0].clientX-sx;sx=null;if(dx<-50)verOpen(verI+1);else if(dx>50)verOpen(verI-1);});}
/* ===== 🔔 토리 알림 (v5.1) — 안드로이드 홈 화면 앱에서만. 서버가 없어서 폰이 하루 몇 번 깨워 줄 때(periodicSync) sw.js가 확인해요 =====
   앱 → sw.js 전달: 캐시 'tori-state'의 tori-state.json {on,last(마지막으로 본 시각),freeD(밥 준 날),name,notiD(sw가 알림 보낸 날)} */
const NOTI_C='tori-state',NOTI_U='tori-state.json';
const swReady=()=>'serviceWorker' in navigator?Promise.race([navigator.serviceWorker.ready,new Promise(r=>setTimeout(()=>r(null),3000))]):Promise.resolve(null);
async function notiSync(){try{if(!('caches' in window))return;const c=await caches.open(NOTI_C),o=await c.match(NOTI_U).then(r=>r?r.json():{}).catch(()=>({}));
  await c.put(NOTI_U,new Response(JSON.stringify({on:S.noti?1:0,last:Date.now(),freeD:S.freeD||'',name:hn(),notiD:o.notiD||''}),{headers:{'Content-Type':'application/json'}}));}catch(e){}}
async function notiReg(){try{const r=await swReady();if(!r||!r.periodicSync)return false;const st=await navigator.permissions.query({name:'periodic-background-sync'});if(st.state!=='granted')return false;await r.periodicSync.register('tori',{minInterval:4*36e5});return true;}catch(e){return false;}}
async function notiToggle(){
  if(S.noti){S.noti=0;save();try{const r=await swReady();if(r&&r.periodicSync)await r.periodicSync.unregister('tori');}catch(e){}notiSync();rSet();toast('토리 알림을 껐어요');return;}
  if(!('Notification' in window)){toast('이 폰에선 알림을 보낼 수 없어요');return;}
  let p=Notification.permission;if(p==='default')try{p=await Notification.requestPermission();}catch(e){}
  if(p!=='granted'){rSet();toast('알림을 "허용"해야 켤 수 있어요');return;}
  S.noti=1;S.notiBg=await notiReg()?1:0;save();notiSync();rSet();toast(S.notiBg?'토리 알림을 켰어요! 🔔':'켰어요. 다만 이 폰에선 앱을 닫았을 때 알림이 늦거나 안 올 수 있어요');}
async function notiTest(){try{const o={body:'찍찍! 알림 잘 와요? 토리예요 🐹',icon:'icon-192.png',tag:'tori-test'},r=await swReady();if(r)await r.showNotification(hn(),o);else new Notification(hn(),o);toast('시험 알림을 보냈어요');}catch(e){toast('알림을 보내지 못했어요');}}
function notiCard(){const ok='Notification' in window,p=ok?Notification.permission:'denied';
  return `<div class="card"><h2>🔔 토리 알림</h2><div class="row sp"><span>알림 받기</span><button class="btn sm ${S.noti?'':'ghost'}" onclick="notiToggle()">${S.noti?'켜짐':'꺼짐'}</button></div>
  <div class="muted" style="margin-top:6px">밥을 아직 안 줬거나 오래 안 들어오면 ${esc(hn())}가 하루 한 번 알림을 보내요 (아침 9시 ~ 밤 10시).</div>
  <div class="muted" style="margin-top:4px">${!ok?'이 폰(브라우저)에선 알림을 보낼 수 없어요.':p==='denied'?'폰 설정에서 이 앱의 알림이 꺼져 있어요. 폰 설정 → 앱 → 알림에서 켜 주세요.':S.noti&&!S.notiBg?'앱을 닫았을 때 알림은 안드로이드 홈 화면에 깐 앱에서만 와요. 시간은 폰이 정해서 조금 늦을 수 있어요.':'안드로이드 홈 화면에 깐 앱에서 잘 와요. 보내는 시간은 폰이 정해서 조금 늦을 수 있어요.'}</div>
  ${S.noti?`<button class="btn ghost full" style="margin-top:8px" onclick="notiTest()">🔔 알림 시험해 보기</button>`:''}
  <div style="margin-top:14px"><b>📅 캘린더로 매일 알림</b></div><div class="muted">정해진 시간에 꼭 받고 싶으면 폰 캘린더에 매일 알림을 넣어 두세요. 시간을 고르고 파일을 열어 캘린더에 추가하면 돼요.</div><label>알림 시간</label><select id="rh">${['08','09','10','12','18','20','21','22'].map(h=>`<option value="${h}" ${h==='21'?'selected':''}>${h}:00</option>`).join('')}</select><button class="btn full" onclick="icsDl()">매일 알림 파일 받기 (.ics)</button></div>`;}
addEventListener('load',()=>{notiSync();if(S.noti)notiReg().then(b=>{if(S.notiBg!==(b?1:0)){S.notiBg=b?1:0;save();}});});
document.addEventListener('visibilitychange',()=>{if(document.hidden)notiSync();});
function rSet(){const t=S.lastBackup?new Date(S.lastBackup).toLocaleString('ko-KR'):'';
  $('s-set').innerHTML=`<div class="card"><h2>📖 사용법</h2><div class="muted" style="margin-bottom:8px">타코가 앱 쓰는 법을 다시 알려 줘요.</div><button class="btn wood full" onclick="tut(0)">🐙 타코의 사용법 보기</button></div><div class="card"><h2>기본 설정</h2><div class="row sp" style="margin-top:12px"><span>화면 테마</span><button class="btn sm" onclick="S.theme=({ask:'light',light:'dark',dark:'ask'})[thm()];save();render()">${{ask:'밤엔 타코가 물어봐요',light:'항상 밝게',dark:'항상 어둡게'}[thm()]}</button></div><div class="row sp" style="margin-top:12px"><span>굵은 글씨</span><button class="btn sm ${S.bold?'':'ghost'}" onclick="S.bold=S.bold?0:1;save();render()">${S.bold?'켜짐':'꺼짐'}</button></div><div class="row sp" style="margin-top:12px"><span>배경 움직임</span><button class="btn sm ${S.noAnim?'ghost':''}" onclick="S.noAnim=S.noAnim?0:1;save();render()">${S.noAnim?'꺼짐':'켜짐'}</button></div><div class="muted">끄면 배터리를 조금 아낄 수 있어요.</div><div class="row sp" style="margin-top:12px"><span>글자 크기</span><button class="btn sm" onclick="S.fs=((+S.fs||0)+1)%3;save();render()">${['보통','크게','아주 크게'][+S.fs||0]}</button></div><div class="row sp" style="margin-top:12px"><span>타코 기록 반응</span><button class="btn sm ${S.tkRec===0?'ghost':''}" onclick="S.tkRec=S.tkRec===0?1:0;save();render()">${S.tkRec===0?'꺼짐':'켜짐'}</button></div><div class="muted">도감에 기록할 때 타코가 한마디 해요.</div>
  <button class="btn pink full" style="margin-top:12px" onclick="resetAll()">모든 기록 초기화</button></div>
  ${notiCard()}${bgCard()}<div class="card"><h2>배경음악</h2><div class="muted">오늘의 곡: ${BGM[bgIdx()].n}</div>
  <div class="row sp" style="margin-top:8px"><span>BGM</span><button class="btn sm ${S.bgmOn?'':'ghost'}" onclick="bgToggle()">${S.bgmOn?'켜짐':'꺼짐'}</button></div>
  <label>곡 선택</label><select onchange="S.bgm=+this.value;save();bgSwitch();rSet()"><option value="0" ${S.bgm===0?'selected':''}>매일 자동 교체</option>${BGM.map((t,i)=>`<option value="${i+1}" ${S.bgm===i+1?'selected':''}>${t.n}</option>`).join('')}</select>
  <label>볼륨</label><input type="range" min="0" max="100" value="${S.vol}" oninput="S.vol=+this.value;bgVol()" onchange="save()"></div>
  <div class="card"><h2>⚙️ 효과음</h2><div class="row sp"><span>8비트 효과음</span><button class="btn sm ${S.snd?'':'ghost'}" onclick="S.snd=S.snd?0:1;save();sfx('coin');rSet()">${S.snd?'켜짐':'꺼짐'}</button></div>
  <label>볼륨</label><input type="range" min="0" max="100" value="${S.sv==null?35:S.sv}" oninput="S.sv=+this.value" onchange="save();sfx('coin')"></div>
  <div class="card"><h2>🐹 햄스터 이름</h2><input id="hn" maxlength="8" value="${esc(hn())}"><button class="btn full" onclick="hnSave()">이름 저장</button></div>
  <div class="card"><h2>💾 백업 · 복원</h2><div class="muted" style="margin-bottom:8px">${t?'마지막 백업: '+esc(t):'아직 백업한 적이 없어요.'}</div>
  <button class="btn wood full" style="margin-bottom:6px" onclick="backupSend()">💾 백업 보내기 (카톡·드라이브·메일)</button><div class="muted" style="margin-bottom:8px">공유 창이 뜨면 카톡 '나에게 보내기'나 드라이브·메일을 고르세요. '백업 파일 저장'은 폰에 백업 파일(.json)을 저장해요. 복원할 땐 받은 파일을 저장한 뒤 '파일에서 복원'으로 골라요.</div><div class="bkpair"><button class="btn ghost" onclick="exportFile().then(rSet)">💾 백업 파일 저장</button><label class="btn ghost">📂 파일에서 복원<input type="file" accept=".json,application/json" style="display:none" onchange="importFile(this.files[0])"></label></div><button class="btn full" onclick="exportBackup()">백업 코드 만들기</button><textarea id="bt" rows="4" style="margin-top:8px" placeholder="여기에 백업 코드가 나타나요. 복원할 땐 이 칸에 붙여넣으세요."></textarea>
  <div class="row"><button class="btn ghost full" onclick="copyBackup()">복사</button><button class="btn wood full" onclick="importBackup()">이 코드로 복원</button></div>
  <div class="muted" style="margin-top:8px">복사한 코드는 메모 앱이나 카카오톡 '나에게 보내기'에 보관하세요. 복원하면 현재 기록이 코드 내용으로 덮어써져요.</div>
  <div class="muted" style="margin-top:12px">${snapMeta()?'직전 상태 보관 중 · '+esc(new Date(snapMeta()).toLocaleString('ko-KR')):'복원·초기화 직전 상태를 1개 보관해요.'}</div><button class="btn ghost full" style="margin-top:6px" onclick="snapUndo()">↩ 직전 상태로 되돌리기</button></div>
  <div class="card"><h2>🤖 자동 백업</h2><div class="muted" style="margin-bottom:8px">3일에 한 번, 앱을 열 때 타코가 자동으로 저장해요. 최근 5개까지 보관해요.</div><div id="abl"></div>
  <div class="row sp" style="margin-top:10px"><span>백업할 때 파일도 저장</span><button class="btn sm ${S.autoFile?'':'ghost'}" onclick="S.autoFile=S.autoFile?0:1;save();rSet()">${S.autoFile?'켜짐':'꺼짐'}</button></div>
  <button class="btn wood full" style="margin-top:8px" onclick="autoBackup(true)">지금 자동 백업하기</button>
  <div class="muted" style="margin-top:8px">자동 백업은 이 기기의 브라우저 안에 저장돼요. 앱 데이터를 지우면 함께 사라지니, 가끔 위의 '백업 파일 저장'도 해 주세요. '파일도 저장'을 켜면 백업할 때 파일이 다운로드 폴더에도 저장돼요(폰 설정에 따라 막힐 수 있어요).</div></div>
  ${schCard()}
  <div class="card"><h2>🏠 홈 화면에 추가하기</h2><div>갤럭시에서는 <b>삼성 인터넷</b>이나 <b>크롬</b>으로 열어 주세요.<br>· 삼성 인터넷: 아래 메뉴(≡) → <b>현재 페이지 추가</b> → <b>홈 화면</b><br>· 크롬: 오른쪽 위 ⋮ → <b>홈 화면에 추가</b> (또는 앱 설치)<br>그러면 앱처럼 바로 열려요.</div></div>
   <div class="vinfo"><button type="button" class="vbtn" onclick="verOpen(0)">JW Diary ${APP_VER.v}</button></div>`;setGroup();abFill();}
/* v8.2 정리: 설정 카드를 다섯 묶음으로 접기 (카드 제목으로 찾아서 옮김, 버전 표시는 맨 아래 그대로) */
const SET_G=[['sbk','💾 백업',['💾 백업 · 복원','🤖 자동 백업']],['snt','🔔 알림',['🔔 토리 알림']],['sui','🎨 화면 · 소리 · 이름',['기본 설정','🎨 배경 꾸미기','배경음악','⚙️ 효과음','🐹 햄스터 이름']],['sch','📅 일정 · 기념일',['📅 일정 · 기념일']],['shp','📖 도움말',['📖 사용법','🏠 홈 화면에 추가하기']]];
function setGroup(){const el=$('s-set');if(!el)return;const vi=el.querySelector('.vinfo');if(vi)el.appendChild(vi);
  const D=[],cards=[...el.querySelectorAll(':scope>.card')],tl=c=>{const h=c.querySelector('h2');return h?h.textContent.trim():'';};
  SET_G.forEach(([k,t,names])=>{const m=cards.filter(c=>names.some(n=>tl(c)===n.replace(/\uFE0F/g,'')||tl(c)===n));if(!m.length)return;
    const w=document.createElement('div');w.innerHTML=grp(k,t,' ');const d=w.firstElementChild,inn=d.querySelector('.grpin');inn.innerHTML='';m[0].before(d);m.forEach(c=>inn.appendChild(c));D.push(d);});
  D.forEach(d=>el.appendChild(d));if(vi)el.appendChild(vi);}
function chkBackup(d){
  const isO=x=>x&&typeof x==='object'&&!Array.isArray(x);
  if(!isO(d)||!Array.isArray(d.coupons))return null;
  for(const k of ['coupons','used','places','wish','ddays','diary','songs','bgames','quests','qp','wq','acLog','sched','myHol']){
    if(d[k]===undefined)continue;if(!Array.isArray(d[k]))return null;d[k]=d[k].filter(isO);}
  for(const k of ['claimed','exRest']){
    if(d[k]===undefined)continue;if(!Array.isArray(d[k]))return null;d[k]=d[k].filter(x=>typeof x==='string'||typeof x==='number');}
  if(d.act!==undefined){if(!isO(d.act))return null;
    for(const k of Object.keys(d.act)){if(!Array.isArray(d.act[k]))return null;d.act[k]=d.act[k].filter(e=>isO(e)&&typeof e.date==='string');}}
  for(const k of ['acorns','fed']){if(d[k]!==undefined&&!isFinite(+d[k]))return null;}
  if(d.diary)d.diary=d.diary.filter(e=>typeof e.d==='string'&&typeof e.t==='string');
  d.coupons.forEach(c=>{if(!c.id)c.id=uid();});
  return d;}
/* 백업 코드(v1.1.9): JW2 = 기록을 압축(deflate)한 뒤 base64url로 바꿔 예전(JW1)보다 훨씬 짧아요. 압축을 못 하는 폰은 JW1로 만들어요.
   붙여넣을 때는 줄바꿈·띄어쓰기·보이지 않는 글자·앞뒤에 붙은 다른 글이 있어도 JW1/JW2 코드만 찾아 읽어요. */
const b64u=u=>{let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');};
const unb64u=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u;};
const zipTxt=async t=>new Uint8Array(await new Response(new Blob([t]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
const unzipTxt=async u=>await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
async function exportBackup(){S.lastBackup=new Date().toISOString();save();const j=JSON.stringify(S);let code;
  try{code='JW2:'+b64u(await zipTxt(j));}catch(e){code='JW1:'+btoa(unescape(encodeURIComponent(j)));}
  $('bt').value=code;toast('백업 코드를 만들었어요 ('+code.length.toLocaleString()+'자). 복사해서 보관하세요');}
async function copyBackup(){const v=$('bt').value;if(!v){toast('먼저 백업 코드를 만들어 주세요');return;}
  try{await navigator.clipboard.writeText(v);toast('복사했어요');}catch(e){$('bt').select();toast('길게 눌러 복사해 주세요');}}
async function importBackup(){const raw=$('bt').value.replace(/[\r\n\t\u200B-\u200D\u2060\uFEFF]/g,''),m=raw.match(/JW([12]):([A-Za-z0-9+\/_= -]+)/);
  if(!m){alert('올바른 백업 코드가 아니에요. JW로 시작하는 코드를 통째로 붙여넣어 주세요.');return;}
  let d;try{const p=m[1]==='2'?m[2].replace(/[ =]/g,''):m[2].replace(/ /g,'+');
    const txt=m[1]==='2'?await unzipTxt(unb64u(p)):decodeURIComponent(escape(atob(p.replace(/-/g,'+').replace(/_/g,'/'))));
    d=chkBackup(JSON.parse(txt));if(!d)throw 0;}catch(e){alert('백업 코드를 읽을 수 없어요. 코드를 통째로 붙여넣었는지 확인해 주세요.');return;}
  askOk('현재 기록이 백업 코드 내용으로 덮어써져요. (직전 상태는 설정에서 되돌릴 수 있어요) 복원할까요?',()=>{snapSave();S=d;S.mig4=1;fix();save();toast('복원했어요');go('home');});}
/* ---------- 생일 · 도토리 · 햄스터 ---------- */
function bdv(){return '03-08';}const isBday=()=>todayStr().slice(5)===bdv();
function nextBday(){const t=todayStr();let y=+t.slice(0,4);if(y+'-'+bdv()<t)y++;return y+'-'+bdv();}
function claimBday(){const y=+todayStr().slice(0,4);if(S.bday===y)return;S.bday=y;S.acorns+=10;
  S.coupons.push({id:uid(),emoji:'🎂',name:'생일 특별 보상: 오늘은 진우 마음대로 하루권',desc:'생일 주인공의 하루 소원 (소소한 범위 내에서!)',grade:'전설',qty:1,expire:y+'-03-31'});save();rHome();
  modal(`<div class="big">🎂</div><h3 style="text-align:center">생일 축하해, 진우!</h3><div class="card" style="text-align:center">${esc(hn())}: 찍찍! 도토리 10개와 특별 보상을 보상에 넣어 뒀어!</div><button class="btn full" onclick="closeM()">고마워!</button>`);}
/* 도토리 보상 목록(MS)은 data/photos.js 로 옮겼어요 */
/* ===== v7.6 도토리 상점: 준 도토리(S.fed)는 그대로 쌓이고, 코인 = 준 도토리 − 쓴 코인(S.coinSpent). 한 번만 살 수 있어요(S.claimed에 번호 보관) ===== */
/* 전설 사진 번호(SH_LEG_N)와 가격(SH_PH_LEG)은 data/photos.js 로 옮겼어요 */
const msCat=m=>{const f=m.fx||'';return f.startsWith('photo:')?'사진':/^(title|bgp|deco):/.test(f)?'꾸미기':/^(qpass|freeze|mgplus|gacha|luck3)/.test(f)?'편의':/^(bl-|cheer|nap|fo-)/.test(f)?'타코 축복':'쿠폰';};
const msPrice=m=>{const c=m.c;if(c==='사진')return SH_LEG_N.has(m.n)?SH_PH_LEG:(typeof SH_PH_RARE!=='undefined'?SH_PH_RARE:10);/* 업데이트 직후 옛 photos.js가 남아 있어도 멈추지 않게 */if(c==='꾸미기')return 25;return m.t==='일반'?12:m.t==='희귀'?25:50;};
MS.forEach(m=>{m.c=msCat(m);if(m.c==='사진'&&SH_LEG_N.has(m.n))m.t='전설';m.p=msPrice(m);});
const coinOf=()=>Math.max(0,(+S.fed||0)-(+S.coinSpent||0));
/* 처음 한 번: 이미 연 물건의 새 가격 합만큼 쓴 것으로 치고, 모자라면 코인 0부터 */
function coinMig(){if(S.coinInit||hold||loadErr||fresh)return 0;const sum=MS.filter(m=>S.claimed.includes(m.n)).reduce((a,m)=>a+m.p,0);S.coinSpent=Math.min(+S.fed||0,sum);S.coinInit=1;return 1;}
function shopNotice(){if(S.shopNote||hold||loadErr||fresh||!S.coinInit)return;S.shopNote=1;save();
  modal(`<h3 style="text-align:center">보물상자가 도토리 상점이 됐어요</h3><div class="card" style="text-align:center">이제 토리에게 도토리를 주면 준 만큼 <b>도토리 코인</b>이 생겨요. 코인으로 상점에서 갖고 싶은 걸 골라 살 수 있어요.<br><b>지금 쓸 수 있는 코인 ${coinOf()}개</b><div class="muted" style="margin-top:6px">이미 연 상자는 전부 '보유'로 남아 있고, 레벨과 준 도토리는 그대로예요.</div></div><button class="btn full" onclick="closeM()">알겠어요</button>`);}
function msIntro(){if(tab!=='pet'||S.shopInfo)return;S.shopInfo=1;save();setTimeout(()=>tako('=도토리를 주면 도토리 코인이 생긴다코! 상점에서 갖고 싶은 걸 사라코 🪙','',9000),700);}
/* 보물상자 보상은 항상 최신 MS 목록의 이름·설명으로 맞춰요 (옛 이름으로 받은 것도 함께 갱신) */
const MS_OLD={'야식 허락권':[60,'밤에 먹어도 잔소리 없음'],'늦잠 허락권':[80,'알람 없이 푹 자기'],'뭐든 들어주기권':[300,'부탁 하나, 진지하게 들어주기'],'깜짝 선물권':[150,'갖고 싶던 작은 선물 하나 받기']};
function msSync(){let ch=coinMig();
  S.coupons.forEach(c=>{if(c.ms==null){const o=MS_OLD[c.name];if(o&&c.desc===o[1]){c.ms=o[0];ch=1;}}
    const m=c.ms!=null&&MS.find(x=>x.n===c.ms);if(m&&(c.name!==m.name||c.desc!==m.d||c.emoji!==m.e||c.grade!==m.t||(c.fx||'')!==(m.fx||''))){c.name=m.name;c.desc=m.d;c.emoji=m.e;c.grade=m.t;if(m.fx)c.fx=m.fx;else delete c.fx;ch=1;}});
  S.used.forEach(u=>{const o=MS_OLD[u.name];if(o){const m=MS.find(x=>x.n===o[0]);if(m){u.name=m.name;ch=1;}}});
  if(ch)save();}
/* ===== 특별 보상: 보상을 '사용하기' 하면(또는 열자마자) 앱 안에서 실제로 일어나는 효과 ===== */
const BL={'bl-mj-1':{k:'mj',w:3,a:1,d:3},'bl-mj-2':{k:'mj',w:5,a:2,d:3},'bl-mj-3':{k:'mj',w:10,a:3,d:5},
 'bl-band-1':{k:'band',w:2,a:2,d:3},'bl-band-2':{k:'band',w:4,a:4,d:3},'bl-band-3':{k:'band',w:8,a:8,d:5},
 'bl-bg-1':{k:'bg',w:2,a:2,d:3},'bl-bg-2':{k:'bg',w:4,a:4,d:3},'bl-bg-3':{k:'bg',w:8,a:8,d:5}};   /* w: 성공(마작 1등)·기록 보너스, a: 아쉬울 때 위로, d: 유효 일수 */
const BLN={mj:['마작','🀄'],band:['합주','🎸'],bg:['보드게임','🎲']};
const CHEER={'cheer-1':1,'cheer-2':3,'cheer-3':8},NAPS={'nap-1':1,'nap-2':5};
const TITLES={mj:['🀄','마작의 신'],band:['🎸','합주실의 별'],bg:['🎲','보드게임 승부사'],wh:['🥃','위스키 감별사'],bk:['🛋️','방콕 마스터']};
const fxPick=a=>a[Math.floor(Math.random()*a.length)];
const FO={mj:{n:'마작',l:'패',c:['홍중(中)','발(發)','백(白)','동(東)','남(南)','서(西)','북(北)','1통','9만','7삭'],t:['앞 순서 패가 술술 붙는 날이다코! 🀄','서두르지 말고 버티면 후반에 운이 돈다코 🌙','방어가 힘이 되는 날이다코. 무리한 리치는 조심이다코 🛡️','상대 표정을 잘 읽으면 이기는 날이다코 👀','첫 패부터 좋은 예감이 온다코! ✨']},
 band:{n:'연주',l:'코드',c:['C','G','Am','E','D','Em'],t:['손가락이 가볍게 풀리는 날이다코! 🎸','천천히 치면 오히려 빨라지는 날이다코 🐢','새 곡의 첫 마디부터 도전해 보라코! 🎵','합주에선 남의 소리를 먼저 들으라코 👂','오늘은 리듬이 잘 맞는 날이다코! 🥁']},
 bg:{n:'보드게임',l:'게임',c:['전략 게임','파티 게임','협력 게임','카드 게임','주사위 게임'],t:['초반 선택이 중요한 날이다코 🎲','상대 방해보다 내 길 가꾸기가 좋은 날이다코 🌱','주사위 운이 은근히 좋은 날이다코! ✨','협상 잘하는 사람이 웃는 날이다코 🤝','새로운 게임에 도전하면 재밌는 날이다코! 📦']}};
const FW={s:['부드러운 블렌디드','달콤한 버번','향긋한 싱글몰트','스모키한 피트 위스키','깔끔한 라이 위스키'],a:['다크 초콜릿','견과류','치즈','육포','과일']};
const FB=['스릴러 시리즈','로맨틱 코미디','다큐멘터리','액션 영화','애니메이션','먹방 영상','기타 연주 영상','보드게임 리뷰 영상','마작 대국 영상','잔잔한 ASMR'];
function fortune(k){const g=fxPick(['대길','길','길','중길','소길']);
  if(k==='wh')return '오늘의 한 잔 운세는 「'+g+'」다코! '+fxPick(FW.s)+' 한 잔에 '+fxPick(FW.a)+' 조합이 어울린다코 🥃 과음은 타코가 싫어한다코, 적당히다코!';
  if(k==='bk'){const a=fxPick(FB),b=fxPick(FB.filter(x=>x!==a));return '오늘의 볼거리 운세는 「'+g+'」다코! 「'+a+'」와(과) 「'+b+'」를 골라 봤다코 🍿 이불 덮고 즐기라코!';}
  const F=FO[k];return '오늘의 '+F.n+' 운세는 「'+g+'」다코! 럭키 '+F.l+': '+fxPick(F.c)+'. '+fxPick(F.t);}
/* 사용 전에 쓸 수 없는 상황이면 이유를 돌려줘요 (그러면 장수도 줄지 않아요) */
function fxBad(f){
  if(f==='qpass'){const ids=qToday();return qList().every(q=>ids.includes(q.id))?'오늘 퀘스트를 이미 다 끝냈어요':'';}
  if(f==='freeze')return (S.freeze||0)>=2?'휴식권이 이미 가득해요 (최대 2장)':'';
  if(f==='mgplus')return S.mg.d===todayStr()&&S.mg.n>=ECO.mgPlays?'':'오늘 미니게임 보상 기회가 아직 남아 있어요';
  if(f==='gacha'){const st=mcState();return monthList().every(c=>st.got.includes(c.id))?'이번 달 보상을 다 모았어요':'';}
  return '';}
function napFx(long){const o=document.createElement('div');o.style.cssText='position:fixed;inset:0;background:#0d0906;opacity:0;transition:opacity .9s;z-index:150;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;color:#f1e3c8;font-size:22px;text-align:center;padding:24px;pointer-events:none';
  o.innerHTML='<div style="font-size:56px">😴</div><div>zZ… 타코가 자장가를 부른다코</div>';document.body.appendChild(o);requestAnimationFrame(()=>{o.style.opacity=.93;});setTimeout(()=>{o.style.opacity=0;setTimeout(()=>o.remove(),1000);},long?5200:3200);}
function qPass(){const ids=qToday(),Q=S.qdone,L=qList();L.forEach(q=>{if(!ids.includes(q.id))ids.push(q.id);});if(L.length>1&&!Q.clr){Q.clr=1;S.acorns+=ECO.clear;}}
/* 보상을 사용할 때 실행: 화면에 보여 줄 타코의 말을 돌려줘요 */
function fxRun(f){const td=todayStr();
  if(BL[f]){const b=BL[f],n=BLN[b.k];S.bless[b.k]={id:f,from:td,until:addD(td,b.d)};fx('star',20);return '타코가 '+n[0]+' 축복을 내린다코! 🙏'+n[1]+' '+addD(td,b.d)+'까지 다음 '+n[0]+' 기록에서 '+(b.k==='mj'?'1등이면 도토리 +'+b.w+', 아니어도 +'+b.a:'도토리 +'+b.w)+'이다코!';}
  if(f.startsWith('fo-'))return fortune(f.slice(3)==='mj'?'mj':f.slice(3)==='band'?'band':f.slice(3)==='bg'?'bg':f.slice(3)==='wh'?'wh':'bk');
  if(CHEER[f]){S.acorns+=CHEER[f];fx('star',CHEER[f]>3?26:14);return fxPick(['짠! 오늘도 고생했다코! 🥃','건배다코! 타코의 촉수도 잔을 든다코 🐙🥃','한 잔의 여유, 타코가 함께한다코 🫧🥃'])+' 도토리 +'+CHEER[f]+' (적당히 마셔야 한다코!)';}
  if(NAPS[f]){S.acorns+=NAPS[f];napFx(NAPS[f]>1);return '푹 자고 개운하게 일어나라코… 🌙 도토리 +'+NAPS[f];}
  if(f==='luck3'){S.boost=(S.boost||0)+3;return '앞으로 퀘스트를 완료할 때 도토리가 +1 더 나온다코! (남은 '+S.boost+'번) 🍀';}
  if(f==='qpass'){qPass();return '오늘 퀘스트는 타코가 전부 도장 찍어 줬다코! 🐙✅';}
  if(f==='freeze'){S.freeze=Math.min(2,(S.freeze||0)+1);return '출석 휴식권이 늘었다코! (지금 '+S.freeze+'장) 🎫';}
  if(f==='mgplus'){S.mg.n=Math.max(0,S.mg.n-1);return '미니게임 보상 기회가 한 번 더 생겼다코! 🎮';}
  if(f==='gacha'){setTimeout(()=>gachaGo(true),1500);return '무료 뽑기를 돌린다코! 🎰';}
  return '';}
/* 열자마자 적용되는 수집형 보상: 칭호 · 배경 무늬 · 집 장식 */
function fxAuto(f){const [t,k]=f.split(':');
  if(t==='title'){if(!S.titles.includes(k))S.titles.push(k);if(!S.titleOn)S.titleOn=k;return TITLES[k][0]+' 칭호 「'+TITLES[k][1]+'」을(를) 얻었어요';}
  if(t==='bgp'){if(!S.bgOwn.includes(k))S.bgOwn.push(k);S.bgPat=k;bgApply();return '배경 무늬 「'+(BGX.find(x=>x[0]===k)||[0,k])[1]+'」이(가) 열려서 바로 적용했어요';}
  if(t==='deco'){const i=DECO.findIndex(d=>d[4]===k);if(i>=0){if(!S.deco.own.includes(i))S.deco.own.push(i);if(!S.deco.on.includes(i))S.deco.on.push(i);return DECO[i][0]+' '+DECO[i][1]+'을(를) 토리의 방에 놓았어요';}}
  if(t==='photo'&&PH[k]){if(!S.album.includes(k))S.album.push(k);return '📷 앨범에 「'+PH[k][1]+'」 사진이 들어왔어요';}
  return '';}
/* 축복: 다음 활동 기록을 남길 때 발동 */
function blessRes(k,d,ex){const b=S.bless&&S.bless[k];if(!b)return null;const B=BL[b.id];if(!B||todayStr()>b.until){delete S.bless[k];return null;}if(d<b.from)return null;
  delete S.bless[k];const win=k==='mj'?ex.rank===1:true,g=win?B.w:B.a;S.acorns+=g;const n=BLN[k];
  return {t:'🙏 축복 도토리 +'+g,s:win?(k==='mj'?'축복이 통했다코!! 1등 축하다코 🙌🀄 도토리 +'+g+'!':'타코의 '+n[0]+' 축복이 함께했다코! ✨ 도토리 +'+g):'이번엔 아쉬웠지만 타코의 축복은 계속 함께한다코! 위로 도토리 +'+g+' 🫧'};}
function blLine(k){const b=S.bless&&S.bless[k];if(!b||todayStr()>b.until||!BL[b.id])return '';const B=BL[b.id];
  return `<div class="muted" style="margin-top:6px">🙏 타코의 축복이 걸려 있어요 (~${esc(b.until)}) · ${k==='mj'?'1등이면 🌰+'+B.w+', 아니어도 +'+B.a:'다음 기록에서 🌰+'+B.w}</div>`;}
/* 칭호 */
function titleLine(){const t=S.titleOn&&TITLES[S.titleOn];return t?`<div class="muted">🏷️ ${t[0]} ${esc(t[1])}</div>`:'';}
function titleSet(k){S.titleOn=S.titleOn===k?'':k;save();rPet();}
function titleCard(){if(!S.titles.length)return '';
  return `<div class="card"><h2>🏷️ 칭호</h2>${S.titles.filter(k=>TITLES[k]).map(k=>`<div class="q"><span>${TITLES[k][0]} ${esc(TITLES[k][1])}</span><button class="btn sm ${S.titleOn===k?'':'ghost'}" onclick="titleSet('${k}')">${S.titleOn===k?'착용 중':'착용'}</button></div>`).join('')}</div>`;}
const LV_T=[[1,'견습 햄스터'],[5,'견습 모험가'],[10,'모험가'],[20,'기사'],[30,'마법사'],[40,'대마법사'],[50,'도토리 귀족'],[60,'도토리 왕'],[80,'도토리 황제'],[100,'전설의 용사']],lvName=l=>LV_T.filter(t=>l>=t[0]).pop()[1],SAY=['냠냠! 도토리 최고!','볼이 빵빵해졌어 🐹','찍찍! 고마워, 진우!','행복해!'];
function qToday(){if(S.qdone.d!==todayStr())S.qdone={d:todayStr(),ids:[],p:0,clr:0};return S.qdone.ids;}
function wkKey(){const d=kst();return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())-((d.getUTCDay()+6)%7)*864e5).toISOString().slice(0,10);}
function wkChk(){if(S.wp.w!==wkKey())S.wp={w:wkKey(),c:{},d:{},done:[]};return S.wp;}
function qList(){const t=todayStr();if(!S.qpick||S.qpick.d!==t){const a=S.qp.map(x=>x.id);for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}S.qpick={d:t,ids:a.slice(0,Math.max(0,+S.qn||0))};save();}return S.quests.concat(S.qp.filter(x=>S.qpick.ids.includes(x.id)));}
function qDone(id){const ids=qToday(),q=qList().find(x=>x.id===id);if(!q||ids.includes(id))return;ids.push(id);
  const Q=S.qdone,all=qList().length>1&&qList().every(x=>ids.includes(x.id)),base=Math.max(0,Math.min(+q.r||1,ECO.qCap-(Q.p||0))),bonus=all&&!Q.clr?ECO.clear:0;Q.p=(Q.p||0)+base;if(bonus)Q.clr=1;let g=base+bonus;if(g>0&&(S.boost||0)>0){S.boost--;g++;}S.acorns+=g;if(g)lucky();save();sfx('coin');toast(g?'🌰 +'+g+(bonus?' 올클리어 보너스!':' 퀘스트 완료!'):'퀘스트 완료! 오늘 퀘스트 도토리는 다 받았어요');render();}
function wDone(id){const q=S.wq.find(x=>x.id===id),w=wkChk();if(!q||w.d[id]===todayStr()||w.done.includes(id))return;
  w.d[id]=todayStr();w.c[id]=(w.c[id]||0)+1;let m='이번 주 '+w.c[id]+'/'+q.g+' 진행!';
  if(w.c[id]>=q.g){w.done.push(id);const r=Math.max(0,Math.min(+q.r||1,ECO.wkCap-(w.p||0)));w.p=(w.p||0)+r;S.acorns+=r;m=r?'🌰 +'+r+' 주간 퀘스트 완료!':'주간 퀘스트 완료! 이번 주 도토리는 다 받았어요';sfx('fan');fx('star',14);}else sfx('coin');
  save();toast(m);render();}
function qEdit(){modal(`<h3>퀘스트 편집</h3>${qTkMsg()}<div class="muted" style="margin-bottom:8px">이름에 "운동"이 들어간 퀘스트는 운동을 기록하면 자동으로 체크돼요.</div><div class="muted">매일 고정</div>${S.quests.map(q=>`<div class="q"><span>${esc(q.e)} ${esc(q.n)} <span class="muted">🌰${q.r}</span></span><button class="btn ghost sm" onclick="qDel('d','${q.id}')">✕</button></div>`).join('')}<div class="muted" style="margin-top:8px">주간 퀘스트</div>${S.wq.map(q=>`<div class="q"><span>${esc(q.e)} ${esc(q.n)} <span class="muted">주 ${q.g}회·🌰${q.r}</span></span><button class="btn ghost sm" onclick="qDel('w','${q.id}')">✕</button></div>`).join('')}
  <div class="muted" style="margin-top:8px">랜덤 후보 (오늘 하루 ${S.qn}개를 뽑아요)</div>${S.qp.map(q=>`<div class="q"><span>${esc(q.e)} ${esc(q.n)} <span class="muted">🌰${q.r}</span></span><button class="btn ghost sm" onclick="qDel('p','${q.id}')">✕</button></div>`).join('')}
  <label>하루에 뽑을 랜덤 퀘스트 개수</label><select onchange="S.qn=+this.value;S.qpick=null;window.qTkM='오늘 랜덤 퀘스트는 '+S.qn+'개로 다시 뽑는다코! 🎲';save();qEdit()">${[0,1,2,3,4].map(n=>`<option value="${n}" ${S.qn===n?'selected':''}>${n}개</option>`).join('')}</select>
  <label>새 퀘스트 (이모지 · 이름)</label><input id="qe" maxlength="4" value="⭐" onfocus="qHint('emo')"><input id="qn" maxlength="20" placeholder="예: 스트레칭 하기" onfocus="qHint('name')"><label>종류</label><select id="qt" onchange="qHint(this.value)"><option value="d">매일 고정</option><option value="p">랜덤 후보</option><option value="w">주간</option></select><label>주간 목표 횟수 (주간만)</label><input id="qg" type="number" min="1" max="7" value="3" onfocus="qHint('g')"><label>보상 도토리</label><input id="qr" type="number" min="1" max="10" value="1" onfocus="qHint('rw')"><div class="row"><button class="btn ghost full" onclick="closeM();rPet()">닫기</button><button class="btn full" onclick="qAdd()">추가</button></div>`);}
function qAdd(){const n=$('qn').value.trim();if(!n){toast('이름을 넣어 주세요');qHint('empty');return;}const o={id:uid(),e:$('qe').value.trim()||'⭐',n,r:Math.max(1,Math.min(10,parseInt($('qr').value)||1))};
  if($('qt').value==='w'){o.g=Math.max(1,Math.min(7,parseInt($('qg').value)||3));S.wq.push(o);}else if($('qt').value==='p')S.qp.push(o);else S.quests.push(o);window.qTkM='"'+n+'" 추가했다코! 잘 해낼 거라 믿는다코 ⭐';save();qEdit();}
function qDel(t,id){askOk('이 퀘스트를 지울까요?',()=>{if(t==='d')S.quests=S.quests.filter(x=>x.id!==id);else if(t==='p')S.qp=S.qp.filter(x=>x.id!==id);else S.wq=S.wq.filter(x=>x.id!==id);window.qTkM=QTK.del;save();qEdit();});}

/* ===== 타코가 퀘스트 편집을 도와줘요 (편집 창 맨 위 말풍선) ===== */
/* ===== 타코가 보상 만들기를 도와줘요 (새 보상 창 맨 위 말풍선) ===== */
const RTK={hi:['새 보상 만들기다코! 입력칸을 누르면 타코가 설명해 준다코 🎟️','진우에게 줄 선물을 만드는 거다코! 타코가 옆에서 도와준다코 🎁'],
 hiEdit:['보상을 고치는 중이다코! 입력칸을 누르면 타코가 알려 준다코 ✏️'],
 emo:'보상의 얼굴이 될 이모지다코! 하나만 골라 보라코 😊',
 name:'진우가 받으면 기분 좋을 이름을 적어 보라코! 예: 치킨 먹기 🍗 (이름에 "운동 하루 쉬기"가 들어가면 쓴 날은 취미 횟수에서 빠져서 토리가 쓰러지지 않는다코 😴)',
 desc:'언제 어떻게 쓸 수 있는지 적어 두면 좋다코! 최대 120자코 📝',
 grade:'등급은 일반·희귀·전설이다코. 전설은 반짝이는 금빛 카드가 된다코 ✨',
 qty:'수량은 0~99장이다코. 사용할 때마다 1장씩 줄어든다코 🎟️',
 exp:'유효기간을 넣으면 그 날이 지나면 만료된다코. 비워 두면 언제까지나 쓸 수 있다코 ⏳',
 empty:'보상 이름을 먼저 적어 달라코! ✏️',
 saved:'새 보상이 들어왔다코! 진우, 마음껏 누리라코 🎁',
 edited:'보상을 고쳐 놨다코! 잘 했다코 ✨',
 del:'보상을 지웠다코. 언제든 다시 만들면 된다코 🫧'};
function cpTkMsg(id){S.tkG=S.tkG||{};if(S.tkG.c)return '';S.tkG.c=1;window.cpG=1;save(); /* 타코 안내는 처음 한 번만 */
  const a=id?RTK.hiEdit:RTK.hi;setTimeout(()=>tako('='+a[Math.floor(Math.random()*a.length)],'',4500,1),350);return '';}
function cpHint(k){if(!window.cpG)return;if(RTK[k])tako('='+RTK[k],'',k==='name'?7000:4200,1);}
const QTK={hi:['퀘스트 편집이다코! 타코가 옆에서 도와준다코 🐙','입력칸을 누르면 타코가 설명해 준다코! ✏️'],
 emo:'맨 앞 이모지는 퀘스트의 얼굴이다코! 하나만 골라 보라코 😊',
 name:'이름에 "운동"을 넣으면 운동을 기록할 때 자동으로 체크된다코! 🏃',
 d:'매일 고정은 오늘 화면에 항상 나온다코. 꼭 하고 싶은 습관에 딱이다코 📌',
 p:'랜덤 후보는 하루에 정한 개수만큼 뽑혀서 나온다코 🎲',
 w:'주간 퀘스트는 일주일에 몇 번 할지 정한다코. 아래 횟수를 정해 보라코 📅',
 g:'일주일에 몇 번이 좋을지 정한다코. 너무 빡빡하지 않게 하라코 💪',
 rw:'보상은 1~10개다코. 퀘스트 도토리는 하루에 최대 '+ECO.qCap+'개까지만 받는다코 🌰',
 empty:'이름을 먼저 적어 달라코! ✏️',
 del:'퀘스트를 지웠다코. 언제든 다시 추가하면 된다코 🫧'};
function qTkMsg(){S.tkG=S.tkG||{};const first=!S.tkG.q;if(first){S.tkG.q=1;window.qG=1;save();} /* 타코 안내는 처음 한 번만 */
  const m=window.qTkM;window.qTkM='';const t=m||(first?QTK.hi[Math.floor(Math.random()*QTK.hi.length)]:'');if(t)setTimeout(()=>tako('='+t,'',4500,1),350);return '';}
function qHint(k){if(!window.qG)return;if(QTK[k])tako('='+QTK[k],'',4200,1);}
/* 레벨(v7.1): Lv.2~10은 5개, 11~30은 10개, 31~60은 25개, 61~100은 50개씩 — Lv.100이 최고 (누적 약 2995개) */
const LV_MAX=100,lvCost=n=>n<=10?5:n<=30?10:n<=60?25:50;
function lvInfo(f){let lv=1,cum=0;while(lv<LV_MAX){const c=lvCost(lv+1);if(f<cum+c)return{lv,cur:f-cum,need:c,max:false};cum+=c;lv++;}return{lv:LV_MAX,cur:0,need:0,max:true};}
const lvOf=f=>lvInfo(f).lv;
/* 레벨별 장식: [필요 레벨, 이모지, 이름, 클래스] — 레벨이 오르면 하나씩 늘어나요 */
const ACC=[[2,'🎀','리본','ribbon'],[4,'🎸','기타','guitar'],[7,'👑','왕관','crown']];
/* 레벨이 올라 얻은 장식은 햄스터 탭에서 하나씩 끄고 켤 수 있어요 (S.accOff에 꺼 둔 장식 이름을 저장) */
function accTog(k){const o=Array.isArray(S.accOff)?S.accOff:[];S.accOff=o.includes(k)?o.filter(x=>x!==k):o.concat(k);save();rPet();}
function accCard(){const lv=lvOf(S.fed),own=ACC.filter(a=>lv>=a[0]),off=Array.isArray(S.accOff)?S.accOff:[];if(!own.length)return '';
  return `<div class="card"><h2>🎀 토리 꾸미기</h2>${own.map(a=>{const on=!off.includes(a[3]);return `<div class="q"><span>${a[1]} ${a[2]}</span><button class="btn sm ${on?'':'ghost'}" onclick="accTog('${a[3]}')">${on?'착용 중':'벗는 중'}</button></div>`;}).join('')}</div>`;}
function accHtml(f,cls){const lv=lvOf(f==null?S.fed:f),off=Array.isArray(S.accOff)?S.accOff:[];return ACC.filter(a=>lv>=a[0]&&!off.includes(a[3])).map(a=>`<span class="ac ${a[3]}">${a[1]}</span>`).join('');}
function mood(){const h=kst().getUTCHours();if(h>=23||h<6)return['쿨쿨 자는 중… zZ','sleep'];const t=(Date.now()-(S.lastFeed||S.born||Date.now()))/36e5;
  if(t>30)return['배가 출출해요… 도토리 주세요!','hungry'];if(S.lastFeed&&t<1/60)return['볼이 빵빵! 행복해요','full'];return['기분 좋아요','ok'];}
function fx(k,c){const set=k==='acorn'?['🌰']:['⭐','🎉','🎁','🌰'];c=c||16;for(let i=0;i<c;i++){const s=document.createElement('span');s.className='fx '+(k==='acorn'?'up':'fall');s.textContent=set[i%set.length];s.style.left=(k==='acorn'?35+Math.random()*30:Math.random()*92)+'%';s.style.animationDelay=(i*70)+'ms';s.dataset.t=Date.now();s.addEventListener('animationend',()=>s.remove());document.body.appendChild(s);setTimeout(()=>s.remove(),2600+i*70);}}
function fxSweep(f){document.querySelectorAll('.fx').forEach(e=>{if(f||Date.now()-(+e.dataset.t||0)>4500)e.remove();});}
setInterval(fxSweep,1500);document.addEventListener('visibilitychange',()=>{if(!document.hidden)fxSweep();});window.addEventListener('pageshow',()=>fxSweep(1));

function eat(n){const a=$('pav');if(a){a.classList.remove('eat');void a.offsetWidth;a.classList.add('eat');}fx('acorn',Math.min(n,5));}
function feed(n){if(S.acorns<n){toast('도토리가 부족해요. 퀘스트로 모아 보세요');sfx('no');return;}
  const l0=lvOf(S.fed);S.acorns-=n;S.fed+=n;S.lastFeed=Date.now();save();const lu=lvOf(S.fed)>l0,nac=ACC.filter(a=>a[0]>l0&&a[0]<=lvOf(S.fed)).pop();
  toast('🪙 코인 +'+n+' · 🐹 '+hn()+': '+SAY[Math.floor(Math.random()*SAY.length)]);rPet();eat(n);rx('acorn',1500);sfx(lu?'fan':'eat');
  if(lu){fx('star',18);setTimeout(()=>modal(`<img class="rxm" src="${TORI_IMG.joy}" alt=""><h3 style="text-align:center">LEVEL UP!</h3><div class="card" style="text-align:center">${esc(hn())}: Lv.${lvOf(S.fed)} 달성! 🎉${lvName(lvOf(S.fed))!==lvName(l0)?`<div style="margin-top:6px">새 칭호: <b>${lvName(lvOf(S.fed))}</b></div>`:''}${lvInfo(S.fed).max?'<div class="muted" style="margin-top:6px">최고 레벨이에요! 👑</div>':''}${nac?`<div class="muted" style="margin-top:6px">${nac[1]} ${nac[2]}을(를) 얻었어요! 토리가 착용했어요</div>`:''}</div><button class="btn full" onclick="closeM()">야호!</button>`),800);}}
function lvNotice(){if(S.lvNote||hold||loadErr||fresh)return;S.lvNote=1;save();const f=+S.fed||0,o=1+Math.floor(f/5),n=lvOf(f);if(o===n)return;
  modal(`<h3 style="text-align:center">레벨 기준이 바뀌었어요</h3><div class="card" style="text-align:center">앞으로는 레벨이 오를수록 조금씩 더 많은 도토리가 필요해요. 최고 레벨은 Lv.100이에요.<br><b>Lv.${o} → Lv.${n}</b><div class="muted" style="margin-top:6px">먹인 도토리 ${f}개와 보물상자는 그대로예요. 칭호도 10단계로 늘었어요.</div></div><button class="btn full" onclick="closeM()">알겠어요</button>`);}
function freeFeed(){const td=todayStr();if(S.freeD===td){toast('오늘 밥은 이미 줬어요');sfx('no');return;}
  if(mood()[1]==='sleep'){toast(hn()+'는 쿨쿨 자는 중이에요. 아침에 밥 주세요');sfx('no');return;}
  S.freeD=td;S.lastFeed=Date.now();save();notiSync();toast('🐹 '+hn()+': 밥 냠냠! 든든해요');rPet();eat(1);rx('acorn',1500);sfx('eat');}
function shAsk(n){const m=MS.find(x=>x.n===n);if(!m||S.claimed.includes(n))return;if(coinOf()<m.p){toast('코인이 부족해요');sfx('no');return;}
  modal(`<div class="big" style="text-align:center">${m.e}</div><h3 style="text-align:center">${esc(m.name)}</h3><div class="card" style="text-align:center"><div class="muted">${m.c} · ${m.t}</div><div style="margin:6px 0">${esc(m.d)}</div>🪙 <b>${m.p}</b>코인을 써요 (남는 코인 <b>${coinOf()-m.p}</b>개)<div class="muted" style="margin-top:4px">한 번 사면 다시 살 수 없어요</div></div><div class="row"><button class="btn ghost full" onclick="closeM()">그만두기</button><button class="btn full" onclick="shBuy(${n})">살래요!</button></div>`);}
function shBuy(n){const m=MS.find(x=>x.n===n);if(!m||S.claimed.includes(n)||coinOf()<m.p)return;S.claimed.push(n);S.coinSpent=(+S.coinSpent||0)+m.p;
  const auto=/^(title|bgp|deco|photo):/.test(m.fx||'');let note='보상에 넣어 뒀어요';
  if(auto)note=fxAuto(m.fx);else S.coupons.push({id:uid(),emoji:m.e,name:m.name,desc:m.d,grade:m.t,qty:1,expire:'',ms:n,...(m.fx?{fx:m.fx}:{})});
  save();rPet();shDraw();sfx('fan');fx('star',18);
  const phk=(m.fx||'').startsWith('photo:')&&PH[m.fx.slice(6)];
  modal(`<img class="rxm${phk?' rxp':''}" src="${phk?phk[2]:TORI_IMG.joy}"${phk?` style="background-image:url('${phk[3]}')"`:''} alt="${phk?esc(phk[1]):''}">${phk?'':`<div class="big">${m.e}</div>`}<h3 style="text-align:center">구매 완료!</h3><div class="card" style="text-align:center"><div class="nm">${esc(m.name)}</div><div class="muted">${esc(note)}</div></div><button class="btn full" onclick="closeM()">확인</button>`);}
const DECO=[['🍪','쿠키 접시',3],['💐','꽃다발',5],['🌙','달 조명',6],['⭐','별 장식',8],['🎸','미니 기타',12],['🎁','선물 상자',10],['🎲','주사위 장난감',7],['👑','왕관',30],
['🍚','밥그릇',4],['💧','물방울 분수',4],['💌','편지함',5],['🍗','고기 간식',6],['🎒','도토리 배낭',7],['🎉','파티 폭죽',8],['🀄','마작패',9],['🎤','미니 마이크',9],
['🍰','생일 케이크',10],['🗺','보물 지도',11],['🎮','게임기',14],['🤗','토리 인형',15],['🎟','황금 티켓',18],['📍','깃발',20],['🏠','미니 하우스',25],['🏰','도토리 성',40],
['🏮','마작방 홍등',8],
['🍵','마작 찻잔',7],
['🧧','점수 봉투',9],
['🐉','삼원패 용',12],
['🌸','꽃패',6],
['♟️','체스 말',8],
['🧩','퍼즐 조각',7],
['🃏','조커 카드',6],
['⏳','모래시계',6],
['🧱','젠가 블록',7],
['🎸','일렉 기타',15],
['🔊','기타 앰프',12],
['🥁','드럼 세트',12],
['🎛️','이펙터 페달',9],
['🎹','밴드 키보드',10],
['🐣','병아리 친구',4],
['🐰','토끼 인형',5],
['🧸','곰돌이 인형',6],
['🌈','무지개',6],
['☁️','뭉게구름',4],
['🍓','딸기',4],
['🍡','달콤 꼬치',5],
['🐱','아기 고양이',6],
['🦋','나비',5],
['🍄','버섯 집',5],
['🛏️','포근한 침대',12],
['🛋️','작은 소파',14],
['📚','책 더미',8],
['🖼️','액자',9],
['🕯️','촛불',6],
['🥃','위스키 잔',0,'r','whisky'],
['📺','미니 TV',0,'r','tv']];
/* 장식 배치: 토리 몸통(가운데)·대화 버튼(오른쪽 위)·말풍선(아래)을 피해 위쪽 벽 · 아래쪽 바닥 줄에 놓아요. 한 줄에 8칸 */
const SLOTS=(()=>{const a=[];[3,10,17,24,31,77,84].forEach((y,r)=>{for(let c=0;c<8;c++){const x=3+c*11.6+(r%2)*4;if(x>80&&y<14)continue;a.push([x,y]);}});
  [38,45,52,59,66].forEach(y=>[0,7].forEach(c=>a.push([3+c*11.6,y])));return a;})();
let dPage=0;const DPP=5;
/* v4.5 토리의 방: 벽 장식은 위쪽 벽에만, 바닥 장식은 아래쪽 바닥에만. 크기 3단계, 토리 앞/뒤, 세트 모으기 */
const DWALL=new Set(['🌙','⭐','🗺','🏮','🌈','☁️','🦋','🖼️','💌']);
const dWall=i=>!!DECO[i]&&DWALL.has(DECO[i][0]);
const DZ={w:[2,30],f:[56,88]},DMID=[18,70],DMIDY=78,DSZ=[.7,1,1.45],DSZN=['작게','보통','크게'];
const dSz=i=>{const v=S.deco.sz&&S.deco.sz[i];return v===0||v===2?v:1;};
const dBk=i=>Array.isArray(S.deco.bk)&&S.deco.bk.includes(i);
/* [키, 이모지, 세트 이름, 장식 이름들, 완성 도토리, 칭호] */
const DSET=[['mj','🀄','마작 세트',['마작패','마작방 홍등','마작 찻잔','점수 봉투','삼원패 용','꽃패'],15,'마작방 주인'],
['band','🎸','밴드 세트',['일렉 기타','기타 앰프','드럼 세트','이펙터 페달','밴드 키보드','미니 마이크'],20,'밴드 리더'],
['doll','🧸','인형 세트',['토리 인형','토끼 인형','곰돌이 인형','병아리 친구','아기 고양이'],12,'인형 수집가'],
['sweet','🍰','디저트 세트',['쿠키 접시','생일 케이크','딸기','달콤 꼬치'],10,'디저트 요정'],
['cozy','🛋️','아늑한 방 세트',['포근한 침대','작은 소파','책 더미','액자','촛불'],15,'아늑한 집주인'],
['sky','🌈','하늘 세트',['달 조명','별 장식','무지개','뭉게구름','나비'],10,'하늘 정원사'],
['board','🎲','보드게임 세트',['체스 말','퍼즐 조각','조커 카드','모래시계','젠가 블록','주사위 장난감'],12,'보드게임 수집가']];
DSET.forEach(s=>{TITLES['set_'+s[0]]=[s[1],s[5]];});
const dSetIds=s=>s[3].map(n=>DECO.findIndex(d=>d[1]===n)).filter(i=>i>=0);
/* 예전에 놓아 둔 장식은 그 자리 그대로(처음 한 번 지금 자리를 기억해 둬요) */
function dMig(){if(!Array.isArray(S.deco.bk))S.deco.bk=[];if(!S.deco.sz||typeof S.deco.sz!=='object'||Array.isArray(S.deco.sz))S.deco.sz={};if(!Array.isArray(S.deco.sets))S.deco.sets=[];
  if(S.deco.v5)return;S.deco.v5=1;S.deco.on.forEach(i=>{if(!S.deco.pos[i]&&SLOTS[i])S.deco.pos[i]=SLOTS[i].slice();});}
/* 새로 놓는 장식: 종류(벽/바닥)에 맞는 빈자리 */
function dSlot(i){const w=dWall(i),a=[];(w?[3,10,17,24]:[80,87]).forEach((y,r)=>{for(let c=0;c<8;c++){const x=3+c*11.6+(r%2)*4;if(x>80&&y<14)continue;a.push([Math.round(x*10)/10,y]);}});
  if(!w)[58,66,74].forEach(y=>[3,84].forEach(x=>a.push([x,y])));
  const used=S.deco.on.filter(j=>j!==i&&S.deco.pos[j]).map(j=>S.deco.pos[j]);
  return (a.find(p=>!used.some(q=>Math.abs(q[0]-p[0])<6&&Math.abs(q[1]-p[1])<5))||a[0]).slice();}
function decoHtml(bk){dMig();const lv=liveOk(heroKey());
  const L=S.deco.on.filter(i=>DECO[i]&&(bk?(lv&&dBk(i)):!(lv&&dBk(i))));
  const it=L.map(i=>{if(!S.deco.pos[i])S.deco.pos[i]=dSlot(i);const P=S.deco.pos[i];return `<span class="dc dm" data-i="${i}" onclick="dTap(event,${i})" style="left:${P[0]}%;top:${P[1]}%;--ds:${DSZ[dSz(i)]}">${DECO[i][0]}</span>`;}).join('');
  if(bk)return `<div class="deco bk">${it}</div>`;
  return `<div class="deco">${it}${mood()[1]==='sleep'?'<span class="zz">zZ</span>':''}${heroKey()==='h_hal'?'<span class="hal hb1">🦇</span><span class="hal hb2">🦇</span><span class="hal hg">👻</span>':''}${(()=>{const s=toriStyle();return s?`<span class="dc" style="right:5%;top:auto;bottom:3%;left:auto">${s.e}</span>`:'';})()}</div>`;}
function decoCard(){const L=DECO.map((d,i)=>i).filter(i=>DECO[i][3]!=='r'||S.deco.own.includes(i)),pg=Math.ceil(L.length/DPP);dPage=((dPage%pg)+pg)%pg;const s=dPage*DPP;
  return `<div class="card"><h2>🏠 토리의 방</h2>${L.slice(s,s+DPP).map(i=>{const d=DECO[i],o=S.deco.own.includes(i),on=S.deco.on.includes(i);return `<div class="q"><span>${d[0]} ${esc(d[1])}<div class="muted">${dWall(i)?'벽':'바닥'} 장식 · ${o?(on?'배치 중':'보관 중'):'🌰 '+d[2]}</div></span>${o?`<button class="btn sm ${on?'ghost':''}" onclick="dToggle(${i})">${on?'치우기':'놓기'}</button>`:`<button class="btn sm wood" onclick="dAsk(${i})">구매</button>`}</div>`;}).join('')}
  <div class="row sp" style="margin-top:10px"><button class="btn sm" onclick="dPg(-1)">◀ 이전</button><span class="muted">${dPage+1} / ${pg}</span><button class="btn sm" onclick="dPg(1)">다음 ▶</button></div>
  <div class="row sp" style="margin-top:6px"><span class="muted">산 장식은 홈 화면 토리의 방에 놓여요. 홈에서 장식을 탭하면 옮기기 · 크기 · 토리 앞/뒤를 바꿀 수 있어요.</span><button class="btn ghost sm" style="margin-left:auto" onclick="dReset()">자리 초기화</button></div></div>${dSetCard()}`;}
function dSetCard(){dMig();return `<div class="card"><h2>🧩 장식 세트</h2><div class="muted" style="margin-bottom:4px">세트를 다 모으면 도토리와 칭호를 받아요.</div>${DSET.map(s=>{const ids=dSetIds(s),n=ids.filter(i=>S.deco.own.includes(i)).length,ok=S.deco.sets.includes(s[0]);return `<div class="q"><span>${s[1]} ${esc(s[2])} <b class="qty">${n}/${ids.length}</b><div>${ids.map(i=>`<span class="${S.deco.own.includes(i)?'':'dim'}" title="${esc(DECO[i][1])}">${DECO[i][0]}</span>`).join(' ')}</div></span><span class="muted" style="text-align:right">${ok?'✅ 완성':'🌰 '+s[4]+'<br>+ 칭호'}</span></div>`;}).join('')}</div>`;}
function dSetChk(){dMig();const got=[];DSET.forEach(s=>{if(S.deco.sets.includes(s[0]))return;const ids=dSetIds(s);if(ids.length&&ids.every(i=>S.deco.own.includes(i))){S.deco.sets.push(s[0]);S.acorns+=s[4];if(!S.titles.includes('set_'+s[0]))S.titles.push('set_'+s[0]);got.push(s);}});
  if(!got.length)return;const o=ACW;ACW='장식 세트 완성';save();ACW=o;sfx('fan');fx('star',14);got.forEach(s=>tako('='+s[1]+' '+s[2]+' 완성이다코!! 🎉','도토리 +'+s[4]+' · 칭호 「'+s[5]+'」',8000,0));}
function dPg(d){dPage+=d;rPet();}
/* 장식 옮기기: 홈 화면에서 장식 탭 → 타코 안내 → '옮기기' → 놓을 자리 탭 */
function dTap(e,i){if(dMv!=null)return;e.stopPropagation();const d=DECO[i];if(!d)return;
  tako('='+d[0]+' '+d[1]+', 어떻게 해 줄까코?','',9000,1,[['옮기기',100+i],['크기',300+i],[dBk(i)?'앞으로':'뒤로',400+i],['괜찮아',-1]]);}
function dSize(i){if(!S.deco.on.includes(i))return;const n=[2,0,1][dSz(i)];S.deco.sz[i]=n;save();document.querySelectorAll('#s-home .dc[data-i="'+i+'"]').forEach(el=>el.style.setProperty('--ds',DSZ[n]));sfx('coin');toast(DECO[i][1]+' 크기: '+DSZN[n]);}
function dLayer(i){if(!S.deco.on.includes(i))return;const b=!dBk(i);S.deco.bk=b?[...S.deco.bk,i]:S.deco.bk.filter(x=>x!==i);save();if(tab==='home')rHome();sfx('coin');toast(b?(liveOk(heroKey())?DECO[i][1]+'을(를) 토리 뒤로 보냈어요':'토리 뒤로 정해 뒀어요 (지금 그림에선 앞에 보여요)'):DECO[i][1]+'을(를) 토리 앞으로 꺼냈어요');}
function dMoveStart(i){if(!S.deco.on.includes(i))return;dMv=i;const h=document.querySelector('#s-home .hero');
  if(h){h.classList.add('dmv');const el=h.querySelector('.dc[data-i="'+i+'"]');if(el)el.classList.add('sel');}
  tako('=옮길 자리를 탭해 달라코! 👆',dWall(i)?'벽 장식은 위쪽 벽에만 놓여요':'바닥 장식은 아래쪽 바닥에만 놓여요',60000,1,[['취소',200]]);}
function dMoveCancel(){dMv=null;const h=document.querySelector('#s-home .hero');if(h){h.classList.remove('dmv');h.querySelectorAll('.dc.sel').forEach(x=>x.classList.remove('sel'));}}
function dHero(e){if(dMv==null)return;const h=e.currentTarget,d=h.querySelector('.deco');if(!d)return;const r=d.getBoundingClientRect();if(!r.width||!r.height)return;
  const sz=34*DSZ[dSz(dMv)],z=dWall(dMv)?DZ.w:DZ.f;let x=(e.clientX-r.left-sz/2)/r.width*100,y=(e.clientY-r.top-sz/2)/r.height*100;
  x=Math.round(Math.max(0,Math.min(100-sz/r.width*100,x))*10)/10;if(!dWall(dMv)&&x+sz/r.width*50>DMID[0]&&x+sz/r.width*50<DMID[1])y=Math.max(y,DMIDY);y=Math.round(Math.max(z[0],Math.min(Math.min(z[1],100-sz/r.height*100),y))*10)/10;
  S.deco.pos[dMv]=[x,y];save();const el=h.querySelector('.dc[data-i="'+dMv+'"]');if(el){el.style.left=x+'%';el.style.top=y+'%';}
  dMoveCancel();sfx('coin');tako('=여기가 딱이다코! 📍','',2500,1);}
function dReset(){askOk('놓아 둔 장식 자리를 모두 처음 자리로 되돌릴까요?',()=>{S.deco.pos={};save();rPet();toast('장식 자리를 처음으로 되돌렸어요');});}
function dAsk(i){const d=DECO[i];if(!d||S.deco.own.includes(i))return;if(S.acorns<d[2]){toast('도토리가 부족해요');sfx('no');return;}
  modal(`<div class="big" style="text-align:center">${d[0]}</div><h3 style="text-align:center">${esc(d[1])}</h3><div class="card" style="text-align:center"><div class="muted">${dWall(i)?'벽':'바닥'} 장식</div>🌰 <b>${d[2]}</b>개를 써요 (남는 도토리 <b>${S.acorns-d[2]}</b>개)<div class="muted" style="margin-top:4px">한 번 사면 다시 살 수 없어요</div></div><div class="row"><button class="btn ghost full" onclick="closeM()">그만두기</button><button class="btn full" onclick="dBuy(${i})">살래요!</button></div>`);}
function dBuy(i){closeM();if(S.deco.own.includes(i))return;if(S.acorns<DECO[i][2]){toast('도토리가 부족해요');sfx('no');return;}S.acorns-=DECO[i][2];S.deco.own.push(i);S.deco.on.push(i);dMig();S.deco.pos[i]=dSlot(i);save();sfx('fan');toast(DECO[i][1]+' 구매! 토리의 방'+(dWall(i)?' 벽':' 바닥')+'에 놓았어요');rPet();dSetChk();if(!S.deco.tip){S.deco.tip=1;save();tako('=홈 화면에서 장식을 탭하면 옮기기 · 크기 · 토리 앞뒤를 바꿀 수 있다코! 👆','',8000,0);}}
function dToggle(i){S.deco.on=S.deco.on.includes(i)?S.deco.on.filter(x=>x!==i):[...S.deco.on,i];save();rPet();}
function dAgo(a,b){return Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/864e5);}
function checkIn(){const t=todayStr(),s=S.streak;AWAY=S.lastVisit?dAgo(S.lastVisit,t):0;S.lastVisit=t;if(s.last===t)return;
  const gp=s.last?dAgo(s.last,t):0;let fz=0;if(gp===1)s.n++;else if(gp===2&&S.freeze>0){S.freeze--;s.n++;fz=1;}else s.n=1;s.last=t;const b=ECO.att;S.acorns+=b;let m='🌰 +'+b+' 출석 체크! '+s.n+'일째';if(fz)m+=' · 휴식권으로 이어졌어요';
  if(s.n%7===0){S.freeze=Math.min(2,(S.freeze||0)+1);S.coupons.push({id:uid(),emoji:'🍪',name:'7일 연속 출석 보상: 간식 골라 먹기권',desc:'일주일 연속 출석 축하!',grade:'희귀',qty:1,expire:''});m='🎁 '+s.n+'일 연속! 보상이 도착했어요';}
  save();setTimeout(()=>{toast(m);sfx('fan');},600);}
function streakCard(){const n=S.streak.n;return `<div class="card" style="padding:8px 12px"><div class="row sp"><span>📅 연속 출석 <b class="qty">${n}일</b></span><span class="muted">휴식권 ${S.freeze||0}장 · ${7-n%7}일 뒤 보상</span></div></div>`;}
function expCard(){const t=todayStr(),l=S.coupons.filter(c=>c.expire&&(+c.qty||0)>0&&c.expire>=t&&dAgo(t,c.expire)<=7);
  return l.length?`<div class="card" style="background:var(--pink-l)"><h2>📅 만료 임박 보상 (${l.length})</h2>${l.slice(0,5).map(c=>`<div class="q"><span>${esc(c.emoji)} ${esc(c.name)}</span><span class="dd" style="font-size:calc(16px*var(--fs,1))!important;min-width:0">${ddLabel(c.expire)}</span></div>`).join('')}</div>`:'';}
let AC;function sfx(k){if(!S.snd||S.sv===0)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();
  const seq={coin:[[988,.07],[1319,.14]],eat:[[330,.05],[262,.05],[330,.05],[262,.05]],fan:[[523,.1],[659,.1],[784,.1],[1047,.25]],no:[[196,.12],[147,.2]],tick:[[660,.03]]}[k]||[];let t=AC.currentTime;const vg=($('mg')?.035:.025)*(S.sv==null?50:+S.sv)/50;
  seq.forEach(([f,d])=>{const o=AC.createOscillator(),g=AC.createGain();o.type='square';o.frequency.value=f;g.gain.setValueAtTime(vg,t);g.gain.setValueAtTime(0,t+d*.95);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d);t+=d;});}catch(e){}}
document.addEventListener('click',e=>{if(e.target.closest('.btn,.chip,nav button'))sfx('tick');});
let _db=null,_dbq=null;
function idb(cb){if(_db){cb(_db);return;}
  try{if(!_dbq){_dbq=[];const q=indexedDB.open('jwd',1);q.onupgradeneeded=()=>q.result.createObjectStore('k');
    q.onsuccess=()=>{_db=q.result;const rs=()=>{_db=null;_dbq=null;};_db.onclose=rs;_db.onversionchange=()=>{try{_db.close();}catch(e){}rs();};const w=_dbq;_dbq=null;w.forEach(f=>{try{f(_db);}catch(e){}});};
    q.onerror=q.onblocked=()=>{_dbq=null;};}
  _dbq.push(cb);}catch(e){_dbq=null;}}
let _ip=null,_it=0;
function idbFlush(){clearTimeout(_it);_it=0;if(_ip==null)return;const j=_ip;_ip=null;idb(d=>{try{d.transaction('k','readwrite').objectStore('k').put(j,'s');}catch(e){}});}
function idbPut(j){if(hold)return;_ip=j;clearTimeout(_it);_it=setTimeout(idbFlush,600);}
document.addEventListener('visibilitychange',()=>{if(document.hidden)idbFlush();});addEventListener('pagehide',idbFlush);
function idbRestore(){idb(d=>{try{const g=d.transaction('k').objectStore('k').get('s');g.onsuccess=()=>{hold=false;try{const x=JSON.parse(g.result);if(x&&chkBackup(x)){S=x;S.mig4=1;loadErr=false;fix();save();render();toast('저장소에서 기록을 복구했어요');return;}}catch(e){}save();};g.onerror=()=>{hold=false;};}catch(e){hold=false;}});}
/* 복원·초기화 직전 상태 1개를 따로 보관해요 (설정에서 되돌리기) */
const SNAPK=KEY+'_prev';
function snapSave(){let j;try{j=JSON.stringify({t:new Date().toISOString(),d:S});}catch(e){return;}
  try{localStorage.setItem(SNAPK,j);}catch(e){}
  idb(d=>{try{d.transaction('k','readwrite').objectStore('k').put(j,'prev');}catch(e){}});}
function snapMeta(){try{const r=localStorage.getItem(SNAPK);return r?JSON.parse(r).t:'';}catch(e){return '';}}
function snapRead(cb){let done=0;const fin=x=>{if(!done){done=1;cb(x);}};
  try{const r=localStorage.getItem(SNAPK);if(r){fin(JSON.parse(r));return;}}catch(e){}
  idb(d=>{try{const g=d.transaction('k').objectStore('k').get('prev');g.onsuccess=()=>{try{fin(g.result?JSON.parse(g.result):null);}catch(e){fin(null);}};g.onerror=()=>fin(null);}catch(e){fin(null);}});
  setTimeout(()=>fin(null),1500);}
function snapUndo(){snapRead(x=>{if(!x||!x.d||!chkBackup(x.d)){toast('되돌릴 직전 상태가 없어요');return;}
  const tm=x.t?new Date(x.t).toLocaleString('ko-KR'):'';
  askOk((tm?tm+' ':'')+'직전 상태로 되돌릴까요? 지금 기록은 다시 되돌릴 수 있게 따로 보관해요.',()=>{snapSave();S=x.d;S.mig4=1;fix();save();toast('직전 상태로 되돌렸어요');go('home');});});}
/* 자동 백업: 3일에 한 번, 앱을 열 때 최근 5개까지 이 기기(IndexedDB)에 보관하고 타코가 알려 줘요 */
function abRead(cb){let done=0;const fin=a=>{if(!done){done=1;cb(a);}};
  idb(d=>{try{const g=d.transaction('k').objectStore('k').get('auto');g.onsuccess=()=>{let a=[];try{a=JSON.parse(g.result||'[]');}catch(e){}fin(Array.isArray(a)?a:[]);};g.onerror=()=>fin([]);}catch(e){fin([]);}});
  setTimeout(()=>fin([]),1500);}
function autoBackup(force){if(!force&&(hold||loadErr||fresh))return;if(!S||!Array.isArray(S.coupons))return;
  const t=todayStr();if(!force&&S.autoBk&&dAgo(S.autoBk,t)<3)return;
  let j;try{j=JSON.stringify(S);}catch(e){return;}
  idb(d=>{try{const tx=d.transaction('k','readwrite'),st=tx.objectStore('k'),g=st.get('auto');
    g.onsuccess=()=>{let a=[];try{a=JSON.parse(g.result||'[]');}catch(e){}if(!Array.isArray(a))a=[];a.unshift({t:new Date().toISOString(),d:j});st.put(JSON.stringify(a.slice(0,5)),'auto');};
    tx.oncomplete=()=>{S.autoBk=t;if(S.autoFile)abFile(j);save();tako('=백업했다코! 💾','',3500,0);if(tab==='set')rSet();};
    tx.onerror=tx.onabort=()=>{if(force)toast('자동 백업에 실패했어요');};}catch(e){if(force)toast('자동 백업에 실패했어요');}});}
function abFile(j){try{const u=URL.createObjectURL(new Blob([j],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download='jw-diary-auto-'+todayStr()+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);S.lastBackup=new Date().toISOString();}catch(e){}}
function abFill(){if(!$('abl'))return;abRead(a=>{const e=$('abl');if(!e)return;
  e.innerHTML=a.length?a.map((x,i)=>`<div class="row sp" style="padding:5px 0;border-top:2px dashed var(--in)"><span class="muted">${esc(new Date(x.t).toLocaleString('ko-KR'))}</span><button class="btn ghost sm" onclick="abRestore(${i})">복원</button></div>`).join(''):'<div class="muted">아직 자동 백업이 없어요.</div>';});}
function abRestore(i){abRead(a=>{const x=a[i];if(!x)return;let d;try{d=chkBackup(JSON.parse(x.d));if(!d)throw 0;}catch(e){toast('이 백업은 읽을 수 없어요');return;}
  askOk(new Date(x.t).toLocaleString('ko-KR')+' 자동 백업으로 복원할까요? 지금 기록은 설정에서 되돌릴 수 있게 따로 보관해요.',()=>{snapSave();S=d;S.mig4=1;fix();save();toast('복원했어요');go('home');});});}
async function exportFile(){const txt=JSON.stringify(S),name='jw-diary-'+todayStr()+'.json',ok=()=>{S.lastBackup=new Date().toISOString();save();};
  try{const f=new File([txt],name,{type:'application/json'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'JW Diary 백업'});ok();toast('백업했어요');return;}}catch(e){if(e&&e.name==='AbortError')return;}
  bkDl(txt,name);ok();toast('백업 파일을 저장했어요');}
function bkDl(txt,name){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();a.remove();}
/* 백업 보내기 (v6.8): 공유 창에 백업 파일(.json)을 띄워 카톡 나에게 보내기·드라이브·메일로 보냄. 공유가 안 되는 브라우저는 파일 저장으로. 보낸 뒤에만 마지막 백업 시간이 바뀜 */
function bkRe(){if(tab==='home')rHome();else if(tab==='set')rSet();}
async function backupSend(){const txt=JSON.stringify(S),name='jw-diary-'+todayStr()+'.json';let f=null;try{f=new File([txt],name,{type:'application/json'});}catch(e){}
  if(f&&navigator.share&&navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title:'JW Diary 백업'});S.lastBackup=new Date().toISOString();save();toast('백업을 보냈어요 💾');tako('=백업 완료다코! 보낸 파일은 지우지 말고 두라코 💾','',3500,0);}
    catch(e){if(e&&e.name==='AbortError')toast('보내기를 그만뒀어요');else toast('보내지 못했어요. 파일로 저장해 볼게요');if(!e||e.name!=='AbortError'){bkDl(txt,name);S.lastBackup=new Date().toISOString();save();}}bkRe();return;}
  bkDl(txt,name);S.lastBackup=new Date().toISOString();save();toast('이 브라우저는 보내기가 안 돼서 파일로 저장했어요');bkRe();}
function importFile(f){if(!f)return;const r=new FileReader();r.onload=()=>{let d;try{d=chkBackup(JSON.parse(r.result));if(!d)throw 0;}catch(e){alert('올바른 백업 파일이 아니에요.');return;}
  askOk('현재 기록이 파일 내용으로 덮어써져요. (직전 상태는 설정에서 되돌릴 수 있어요) 복원할까요?',()=>{snapSave();S=d;S.mig4=1;fix();save();toast('복원했어요');go('home');});};r.readAsText(f);}
const SH_TABS=['쿠폰','사진','타코 축복','꾸미기','편의'],SH_TIP={'쿠폰':'진우에게 쓰는 소원 쿠폰이에요. 사면 보상 탭에 들어가요.','사진':'사면 토리 앨범에 바로 들어가요.','타코 축복':'타코가 특별한 힘으로 진우를 도와줘요.','꾸미기':'칭호, 배경 무늬, 토리의 방 장식이에요.','편의':'앱을 쓰기 편하게 해 주는 아이템이에요: 퀘스트 패스권, 출석 휴식권, 미니게임 한 번 더, 무료 뽑기권 등.'};
const SHV={tab:'쿠폰',can:0,pg:0},SH_PG=5;
const shPageSize=()=>SHV.tab==='사진'?7:SH_PG;
function shGo(p){const n=Math.max(1,Math.ceil(shList().length/shPageSize()));SHV.pg=Math.max(0,Math.min(n-1,p));shDraw();const o=$('shopov');if(o)o.scrollTop=0;}
function shGroup(d){const n=Math.max(1,Math.ceil(shList().length/shPageSize())),G=Math.ceil(n/5),g=((Math.floor(SHV.pg/5)+d)%G+G)%G;shGo(g*5);}   /* 폴리싱 ③: 5쪽 묶음도 끝↔처음 이어짐 */
function shNav(n){if(n<2)return '';const start=Math.floor(SHV.pg/5)*5,end=Math.min(n,start+5);return `<nav class="shop-pages" aria-label="상점 페이지"><button class="btn sm ghost" aria-label="이전 5페이지" onclick="shGroup(-1)" ${n<=5?'disabled':''}>◀</button>${Array.from({length:end-start},(_,i)=>{const p=start+i;return `<button class="btn sm ${p===SHV.pg?'wood':'ghost'}" aria-label="${p+1}페이지" ${p===SHV.pg?'aria-current="page"':''} onclick="shGo(${p})">${p+1}</button>`;}).join('')}<button class="btn sm ghost" aria-label="다음 5페이지" onclick="shGroup(1)" ${n<=5?'disabled':''}>▶</button></nav>`;}
const shOwn=m=>S.claimed.includes(m.n);
function shSet(k,v){SHV[k]=v;if(k!=='pg')SHV.pg=0;shDraw();}
/* v8.1: 5개씩 페이지, 첫↔마지막 이어짐 */
function shPg(d){const n=Math.max(1,Math.ceil(shList().length/shPageSize()));SHV.pg=((SHV.pg+d)%n+n)%n;shDraw();const o=$('shopov');if(o)o.scrollTop=0;}
/* 햄스터 탭 카드: 코인 + 지금 살 만한 것 3개 + 전체 보기 버튼 */
function shopHtml(){const c=coinOf(),left=MS.filter(m=>!shOwn(m)).sort((a,b)=>a.p-b.p||a.n-b.n),ok=left.filter(m=>m.p<=c),pick=(ok.length?ok:left).slice(0,3);
  return `<div>쓸 수 있는 코인 <b class="qty">🪙 ${c}개</b></div><div class="muted">도토리를 주면 준 만큼 코인이 생겨요. 한 번만 살 수 있어요.</div>`+
  (pick.length?`<div class="muted" style="margin-top:8px">${ok.length?'지금 살 수 있는 것 (싼 순)':'가장 싼 것 (코인을 더 모아 봐요)'}</div>`+pick.map(m=>`<div class="q ${m.p<=c?'':'dim'}"><span>${m.e} ${esc(m.name)}<div class="muted">${m.t} · ${m.c}</div></span><button class="btn sm ${m.p<=c?'wood':'ghost'}" ${m.p<=c?'':'disabled'} onclick="shAsk(${m.n})">🪙 ${m.p}</button></div>`).join(''):'<div class="empty">모든 물건을 샀어요! 👑</div>')+
  `<button class="btn full" style="margin-top:8px" onclick="shFull()">상점 전체 보기</button>`;}
/* 전체 보기: 새 화면. 탭 5개 + '살 수 있는 것만' 하나, 싼 순, 산 것은 맨 뒤 */
function shFull(){if($('shopov'))return;const o=document.createElement('div');o.id='shopov';o.style.cssText='position:fixed;inset:0;z-index:15;background:var(--bg,#fff7e6);overflow:auto;padding:12px 14px calc(24px + env(safe-area-inset-bottom,0px))';document.body.appendChild(o);document.body.style.overflow='hidden';shDraw();}
function shClose(){const o=$('shopov');if(o)o.remove();document.body.style.overflow='';}
function shList(){const c=coinOf();let a=MS.filter(m=>m.c===SHV.tab);if(SHV.can)a=a.filter(m=>!shOwn(m)&&m.p<=c);return a.sort((x,y)=>shOwn(x)-shOwn(y)||x.p-y.p||x.n-y.n);}
function shFullHtml(){const a=shList(),c=coinOf(),per=shPageSize(),on=v=>v?'wood':'ghost';if(SHV.pg*per>=a.length)SHV.pg=0;
  return `<div class="row sp"><button class="btn sm ghost" onclick="shClose()">◀ 닫기</button><b class="qty">🪙 ${c}개</b></div><h2 style="margin:10px 0 6px">🪙 도토리 상점</h2>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px">${SH_TABS.map(t=>`<button class="btn sm ${on(SHV.tab===t)}" style="padding:6px 0;font-size:12px;white-space:nowrap;min-width:0" onclick="shSet('tab','${t}')">${t==='타코 축복'?'축복':t}</button>`).join('')}</div>
  <div class="muted" style="margin:6px 0">ℹ️ ${SH_TIP[SHV.tab]}</div>
  <button class="btn sm ${on(SHV.can)}" style="margin-bottom:6px" onclick="shSet('can',${SHV.can?0:1})">${SHV.can?'✔ ':''}살 수 있는 것만 보기</button>`+
  (a.slice(SHV.pg*per,SHV.pg*per+per).map(m=>{const o=shOwn(m),ok=c>=m.p;return `<div class="q ${o||!ok?'dim':''}"><span>${m.e} ${esc(m.name)}<div class="muted">${m.t}${m.c==='사진'?'':' · '+esc(m.d)}</div></span>${o?'<span class="muted">보유 ✔</span>':`<button class="btn sm ${ok?'wood':'ghost'}" ${ok?'':'disabled'} onclick="shAsk(${m.n})">🪙 ${m.p}</button>`}</div>`;}).join('')||'<div class="empty">보여 줄 물건이 없어요</div>')+
  shNav(Math.ceil(a.length/per));}
function shDraw(){const e=$('shop');if(e)e.innerHTML=shopHtml();const o=$('shopov');if(o){const t=o.scrollTop;o.innerHTML=shFullHtml();o.scrollTop=t;}}
/* v8.1 정리: 퀘스트는 홈으로 (오늘 + 주간 한 카드) */
function questCard(){const ids=qToday(),w=wkChk();return `<div class="card"><div class="row sp"><h2>📜 오늘의 퀘스트</h2><button class="btn ghost sm" onclick="qEdit()">✏️ 편집</button></div>${qList().map(q=>{const d=ids.includes(q.id);return `<div class="q ${d?'dim':''}"><span>${esc(q.e)} ${esc(q.n)}</span><button class="btn sm" ${d?'disabled':''} onclick="qDone('${q.id}')">${d?'완료':'+🌰'+q.r}</button></div>`;}).join('')||'<div class="empty">퀘스트를 추가해 보세요.</div>'}<div class="muted" style="margin-top:6px">모두 클리어하면 보너스 🌰${ECO.clear}! 퀘스트 도토리는 하루 최대 ${ECO.qCap}개예요. 도감에 새 장소를 기록하면 하루 한 번 🌰${ECO.dex}개를 얻어요.</div><h3 class="qh3">📅 주간 퀘스트</h3>${S.wq.map(q=>{const c=w.c[q.id]||0,dn=w.done.includes(q.id),td=w.d[q.id]===todayStr();return `<div class="q ${dn?'dim':''}"><span>${esc(q.e)} ${esc(q.n)}<div class="muted">${c}/${q.g}회 · 🌰${q.r}</div></span><button class="btn sm" ${dn||td?'disabled':''} onclick="wDone('${q.id}')">${dn?'완료':td?'오늘 함':'+1'}</button></div>`;}).join('')||'<div class="empty">✏️ 편집에서 주간 퀘스트를 추가해 보세요.</div>'}</div>`;}
function rPet(){const f=S.fed,LI=lvInfo(f),lv=LI.lv,ids=qToday(),w=wkChk(),md=mood();
  $('s-pet').innerHTML=`<div class="card"><div class="row"><span class="pavw"><img id="pav" class="${md[1]==='sleep'?'night':''} ${avCls()}" src="${AVATAR}" alt="" style="width:72px;height:72px;border:3px solid var(--ol);image-rendering:pixelated">${accHtml()}</span><div style="flex:1"><h2 style="margin:0">${esc(hn())}</h2><div>Lv.${lv} ${lvName(lv)}</div>${titleLine()}<div class="muted">${LI.max?'EXP MAX · 최고 레벨!':'EXP '+LI.cur+'/'+LI.need} · 준 도토리 ${f}개</div><div class="bar"><i style="width:${LI.max?100:Math.round(LI.cur/LI.need*100)}%"></i></div></div></div>
  <div class="muted" style="margin-top:8px">💬 ${esc(hn())}: ${md[0]}</div>${toriLine()}${stLine()}
  <div class="row sp" style="margin-top:8px"><span>🌰 보유 <b class="qty">${S.acorns}개</b></span><span>🪙 코인 <b class="qty">${coinOf()}개</b></span></div>
  <div class="row" style="margin-top:8px"><button class="btn full" onclick="feed(1)">🌰 1개 주기</button><button class="btn wood full" onclick="feed(5)">🌰 5개 주기</button></div>
  <button class="btn ghost full" style="margin-top:8px" ${S.freeD===todayStr()?'disabled':''} onclick="freeFeed()">${S.freeD===todayStr()?'🍚 오늘 밥은 먹었어요':'🍚 밥 주기 (무료 · 하루 1번)'}</button>
  <div class="muted" style="margin-top:4px">밥은 배고픔만 채워 줘요. 도토리를 주면 레벨이 오르고 도토리 코인이 생겨요.</div>
  <div class="muted" style="margin-top:8px">🪙 코인은 아래 상점에서 써요</div></div>
  <div class="card"><h2>🪙 도토리 상점</h2><div id="shop">${shopHtml()}</div></div>${decoCard()}${accCard()}${titleCard()}${albumCard()}`;}
/* ---------- 토리 앨범 (보물상자에서 얻은 사진) ---------- */
let albPg=0;
function albGo(p){albPg=p;const e=document.getElementById('albc');if(e)e.outerHTML=albumCard();}
function albumCard(){const own=S.album||[],ks=MS.map(m=>m.fx||'').filter(f=>f.startsWith('photo:')).map(f=>f.slice(6)).filter(k=>PH[k]),got=ks.filter(k=>own.includes(k));
  const per=4,NP=Math.max(1,Math.ceil(got.length/per)),pg=((albPg%NP)+NP)%NP,vs=got.slice(pg*per,(pg+1)*per);
  setTimeout(()=>vs.forEach(phWarm),400);   /* v1.2.5: 보이는 4장의 원본을 미리 받아 두면 눌렀을 때 바로 떠요 */
  const cells=vs.map(k=>`<button class="ph" onclick="phOpen('${k}')"><img loading="lazy" src="${PH[k][3]}" alt="${esc(PH[k][1])}"></button>`).concat(got.length?[]:Array.from({length:per},()=>'<div class="ph lock">?</div>'));
  const nav=NP>1?`<div class="albnav"><button class="btn ghost" onclick="albGo(${(pg-1+NP)%NP})">◀</button><span class="albpg">${pg+1} / ${NP}</span><button class="btn ghost" onclick="albGo(${(pg+1)%NP})">▶</button></div>`:'';
  return `<div class="card" id="albc"><h2>📷 토리 앨범 <span class="muted" style="font-size:13px">${got.length}/${ks.length}</span></h2>${nav}<div class="alb">${cells.join('')}</div><div class="muted" style="margin-top:6px;text-align:center">${got.length?'':'아직 사진이 없어요. '}도토리 상점에서 사진을 사면 채워져요.</div></div>`;}
const PH_WARM=new Set();function phWarm(k){const p=PH[k];if(!p||PH_WARM.has(k))return;PH_WARM.add(k);const i=new Image();i.decoding='async';i.src=p[2];}
/* 원본 사진은 처음 볼 때 받아요. 받는 동안 빈칸 대신 이미 저장된 작은 사진(썸네일)을 깔아 둬요 (v1.2.5) */
function phOpen(k){const p=PH[k];if(!p||!(S.album||[]).includes(k))return;modal(`<h3>${p[0]} ${esc(p[1])}</h3><div class="phwrap"><img class="phbig" src="${p[2]}" style="background-image:url('${p[3]}')" alt="${esc(p[1])}"><div class="phbtn"><div class="row" style="margin-top:8px"><a class="btn wood full" style="text-align:center;text-decoration:none" href="${p[2]}" download="토리-${esc(p[1])}.webp">📥 저장</a><button class="btn ghost full" onclick="closeM()">닫기</button></div><button class="btn full" style="margin-top:6px" onclick="phHero('${k}')">${S.heroPh===k?'🏠 홈 사진에서 빼기':'🏠 홈 토리 사진으로 쓰기'}</button></div></div>`);}
/* 홈 맨 위 토리 사진으로 쓰기: 다시 누르면 원래(기분에 따라 바뀌는) 그림으로 돌아가요 */
function phHero(k){if(!PH[k]||!(S.album||[]).includes(k))return;S.heroPh=S.heroPh===k?'':k;save();closeM();sfx('coin');toast(S.heroPh?'홈 토리 사진을 「'+PH[k][1]+'」(으)로 바꿨어요':'홈 사진을 원래 토리 그림으로 되돌렸어요');if(tab==='home')render();}
/* ---------- 토리와 대화 (선택지 · 하루 한 번 질문 · 만담) : 인터넷/API 없이 동작해요 ---------- */
function dayTag(){const t=todayStr(),md=t.slice(5);if(isBday())return 'bday';if(md==='12-24'||md==='12-25')return 'xmas';if(md==='12-31')return 'nye';if(md==='10-31')return 'hal';if(md>='04-01'&&md<='04-07')return 'sak';const h=allHol().find(x=>holNext(x)===t);return h?'hol:'+h[0]:'';}
const dayName=g=>g==='bday'?'진우 생일':g==='xmas'?'크리스마스':g==='nye'?'새해 전날':g==='hal'?'할로윈':g==='sak'?'벚꽃 철':(allHol().find(x=>'hol:'+x[0]===g)||[0,0,'특별한 날'])[2];
const pk=a=>a[Math.floor(Math.random()*a.length)];
function chCtx(){const h=kst().getUTCHours(),t=todayStr();return{tm:h>=23||h<6?'ng':h<11?'am':h<17?'pm':'ev',hun:mood()[1]==='hungry',ex:(S.act.ex||[]).some(x=>x.date===t),st:S.streak.n||0,tag:dayTag()};}
/* 대화: [질문, [[버튼, 답], ...]]  (답이 배열이면 그중 하나를 무작위로) */
const CH_GEN=[
['찍찍! 오늘 기분은 어때요?',[['좋아!','찍찍! 토리도 덩달아 기분 좋아요! 🎵'],['그럭저럭','찍찍… 그럴 땐 도토리 하나가 최고예요 🌰'],['피곤해','찍찍, 오늘은 토리 옆에서 잠깐 쉬어요 🛋️']]],
['찍찍! 좋아하는 간식이 뭐예요?',[['달달한 거','찍찍! 토리는 도토리가 제일 달아요 🌰'],['짭짤한 거','찍찍~ 짭짤한 것도 좋죠! 볼주머니에 넣고 싶어요'],['다 좋아!','찍찍! 먹보 팀 결성이에요 🐹']]],
['찍찍! 나 보고 싶었어요?',[['엄청!','찍찍! 토리도 엄청요! 볼이 빵빵해질 만큼요 💕'],['조금?','찍찍… 조금이라도 좋아요! 오늘은 오래 있어 줘요'],['맨날 보잖아~','찍찍! 매일 봐도 매일 반가워요!']]],
['찍찍! 오늘 제일 하고 싶은 건?',[['맛있는 밥','찍찍! 메뉴는 뭐예요? 토리는 냄새만 맡아도 행복해요'],['게임 한 판','찍찍! 토리는 응원단장 할게요 📣'],['아무것도 안 하기','찍찍~ 그것도 훌륭한 계획이에요 🛋️']]],
['찍찍! 어젯밤에 꿈꿨어요? 토리는 도토리 산에서 굴렀어요!',[['나도 꿨어','찍찍! 어땠어요? 다음에 꼭 들려줘요'],['기억 안 나','찍찍~ 꿈은 도망가는 걸 좋아하죠'],['토리 꿈 부럽다','찍찍! 오늘 밤엔 같이 굴러요 🌰']]],
['찍찍! 오늘 날씨 어때요?',[['맑아','찍찍! 볼주머니에 햇살을 담고 싶어요 ☀️'],['흐려','찍찍… 흐린 날엔 이불이 최고예요'],['비 와','찍찍! 빗소리 듣기 좋은 날이에요 ☔']]],
['찍찍! 노래 하나 불러 줄래요?',[['라라라~','찍찍! 짝짝짝! 앙코르! 👏'],['부끄러워','찍찍~ 토리만 듣고 있어요, 괜찮아요 🙈'],['너부터 불러','찍찍찍~ ♪ (토리는 노래가 짧아요)']]],
['찍찍! 오늘 제일 잘한 일은 뭐예요?',[['열심히 일했어','찍찍! 대단해요! 도토리 열 개 드릴게요! (마음만요)'],['밥 잘 챙겨 먹음','찍찍! 잘 먹는 건 중요한 일이에요 🍚'],['숨 쉬었어','찍찍! 그것도 대단한 일이에요, 진짜로요 💛']]]];
const CH_HUN=['찍찍… 배가 너무 고파요… 도토리 있어요?',[['지금 줄게!','찍찍!! 기다릴게요! 볼주머니 준비 완료예요 🌰'],['조금만 기다려','찍찍… 알겠어요… 그래도 빨리 와 주세요…'],['밥부터 먹자','찍찍! 밥 주기 버튼이 반짝반짝 보여요 🍚']]];
const CH_EXN=['찍찍! 오늘 운동했어요?',[['했지!','찍찍! 멋져요! 토리도 쳇바퀴 돌 힘이 나요 🏃'],['아직…','찍찍~ 5분만이라도 어때요? 토리가 옆에서 응원할게요 📣'],['지금 하러 갈게','찍찍! 다녀와요! 돌아오면 박수 짝짝짝 👏']]];
const CH_EXY=['찍찍! 오늘 운동 기록 봤어요! 진짜 멋져요!',[['뿌듯해','찍찍! 뿌듯한 건 크게 자랑해도 돼요 💪'],['힘들었어','찍찍… 고생했어요. 오늘은 푹 쉬어요 🛋️'],['내일도 할 거야','찍찍! 토리도 내일 같이 할래요!']]];
const CH_ST=n=>['찍찍! 연속 출석 '+n+'일째예요! 알고 있었어요?',[['알고 있었지','찍찍! 역시 꾸준한 사람이에요 📅'],['벌써 그렇게 됐네','찍찍~ 시간이 도토리처럼 굴러가요'],['다 토리 덕분이지','찍찍! 맞아요! 토리 덕분이에요! (헤헤)']]];
const CH_NG=['찍찍… 쿨쿨… 아직 안 자요…?',[['곧 잘게','찍찍… 내일 만나요… 쿨…'],['잠이 안 와','찍찍… 토리 숨소리 세어 봐요… 쿨쿨…'],['잘 자~','찍찍… 잘 자요… 쿨…']]];
const CH_AM=['찍찍! 좋은 아침이에요! 오늘 뭐 할 거예요?',[['열심히 일해야지','찍찍! 오늘도 화이팅이에요! 📣'],['아침부터 배고파','찍찍! 토리도요! 아침 도토리 먹어요 🌰'],['더 자고 싶어','찍찍~ 이불 밖은 위험해요… 5분만이요 🛏️']]];
const CH_HOL=g=>['찍찍! 오늘 '+dayName(g)+'이에요! 뭐 하고 싶어요?',[['맛있는 거 먹기','찍찍! 특별한 날엔 특별한 간식이죠! 🍰'],['푹 쉬기','찍찍~ 오늘은 쉬는 게 정답이에요 🛋️'],['같이 놀기','찍찍! 토리는 언제든 준비됐어요! 🎉']]];
const CH_SP={bday:['찍찍!! 오늘은 진우 생일이에요! 소원 빌었어요?',[['빌었지!','찍찍! 이루어질 거예요, 토리가 보증해요 🎂'],['비밀이야','찍찍~ 비밀은 볼주머니에 넣어 둘게요 🤫'],['토리도 축하해 줘','찍찍!! 생일 축하해요! 세상에서 제일 크게요! 🎉']]],
 xmas:['찍찍! 크리스마스예요! 산타가 올까요?',[['올 거야','찍찍! 도토리 양말 걸어 놓을래요 🧦'],['난 이미 어른…','찍찍~ 어른도 선물은 좋아하잖아요 🎁'],['토리가 산타야','찍찍! 그럼 토리가 도토리를 나눠 줘요! 🎅']]],
 nye:['찍찍! 오늘이 올해 마지막 날이에요! 어땠어요?',[['좋은 한 해였어','찍찍! 내년엔 더 좋을 거예요 🎆'],['정신없었어','찍찍… 그래도 잘 버텼어요, 정말요'],['벌써 끝이라니','찍찍~ 내년에도 같이 있어 줘요 💛']]],
 hal:['찍찍! 오늘은 할로윈! 트릭 오어 트릿?',[['트릿!','찍찍! 도토리 사탕 받아요! 🎃'],['트릭!','찍찍!! 볼주머니 폭탄이에요! (귀엽게 봐줘요)'],['난 집에 있을래','찍찍~ 토리랑 이불 속 파티해요 👻']]],
 sak:['찍찍! 벚꽃이 피었어요! 꽃구경 갈래요?',[['가고 싶다','찍찍! 도시락 싸 가요! 볼주머니에 넣어서요 🌸'],['사람 많아서 싫어','찍찍~ 그럼 토리랑 창밖 벚꽃 구경해요'],['꽃잎 먹을 수 있어?','찍찍! 안 돼요! 토리도 물어봤는데 혼났어요 🙅']]]};
function chPick(){const c=chCtx();if(c.tag){const g=c.tag;return g.startsWith('hol:')?CH_HOL(g):CH_SP[g];}
  if(c.tm==='ng')return CH_NG;{const m=memPick();if(m&&Math.random()<.6)return memChat(m);}if(c.hun&&Math.random()<.7)return CH_HUN;if(c.st>=7&&c.st%7===0&&Math.random()<.6)return CH_ST(c.st);
  const r=Math.random();if(c.tm==='ev'&&r<.4)return c.ex?CH_EXY:CH_EXN;if(c.tm==='am'&&r<.35)return CH_AM;if(r<.25&&c.st>=3)return CH_ST(c.st);return pk(CH_GEN);}
let chQ=null;
function chatOpen(q){chQ=q||chPick();modal(`<h3>${toriDiaryIcon()} ${esc(hn())}와 대화</h3><div class="chb">${esc(chQ[0])}</div><div id="cho">${chQ[1].map((o,i)=>`<button class="btn full" style="margin-top:6px" onclick="chatPick(${i})">${esc(o[0])}</button>`).join('')}</div><div class="row" style="margin-top:10px;gap:6px"><input id="chi" maxlength="60" placeholder="토리에게 한마디" style="flex:1;min-width:0" onkeydown="if(event.key==='Enter')chatSay()"><button class="btn wood" onclick="chatSay()">보내기</button></div><div class="row" style="margin-top:10px;align-items:stretch"><button class="btn ghost full" onclick="tqOpen()">${S.tq&&S.tq.d===todayStr()?'📝 오늘의 질문 (완료)':'📝 오늘의 질문 (🌰+1)'}</button><button class="btn ghost full" onclick="closeM()">닫기</button></div>`);}
/* ---------- 키워드 반응 (직접 입력한 말에 토리·타코가 상황에 맞게 답해요) ---------- */
const KW_TAG=[['no',/안 ?(했|해|갔|가|마|먹|하|쳤|칠|나|나가|할래)|못 ?(했|해|갔|가|마|먹|하|쳤)|싫|귀찮|끊(었|으려|을래|기로)|그만|쉬었|쉬는|건너뛰|빼먹|패스|취소/],
 ['neg',/힘들|피곤|지쳤|지친|우울|슬프|속상|짜증|외로|아프|아파|망했|망쳤|최악|괴로|토할|죽겠|스트레스|화나|열받|빡|지겹|답답|불안|졌|패배|깨졌|끊어졌|끊겼|싸웠|싸움|다퉜|서운|헤어|숙취|머리 ?아/],
 ['q',/\?|뭐|무슨|어때|어떻|언제|어디|누구|왜|할까|갈까|볼까|해줘|알려|추천|몇/],
 ['plan',/내일|이따|이따가|오늘 ?(밤|저녁)|할거|할 거|갈거|갈 거|가려|하려|할래|할까|예정|있어서|있대|있다|잡혔|주말|다음 ?주|곧|저녁에|밤에/],
 ['past',/했|갔|왔|마셨|먹었|쳤|다녀|끝났|끝냈|돌아|하고 ?왔|치고|연습했|뛰었|만났|질렀/],
 ['miss',/보고 ?싶|보고픈|그리|생각나|생각 ?나|궁금/],
 ['pos',/좋|재밌|재미|신나|최고|맛있|뿌듯|행복|성공|이겼|이김|대박|짱|굿|완벽|기뻐|설레|사랑|예뻐|멋/]];
function kwTags(v){return KW_TAG.filter(t=>t[1].test(v)).map(t=>t[0]);}
let kwLast='';
function kwPick(a){let r;for(let i=0;i<5;i++){r=a[Math.floor(Math.random()*a.length)];if(r!==kwLast)break;}kwLast=r;return r;}
/* [단어 정규식, {태그:[답...]}, 화자(t=토리,k=타코)] — 위에서부터 먼저 걸리는 것이 우선 */
const KW=[
[/마작|패 ?(받|버|쪼|돌)|쯔모|론|리치|동풍|유국|삥/,{
 no:['찍찍… 오늘은 패를 쉬는 날이구나. 쉬는 것도 실력이야, 패는 어디 안 가!','마작 안 해도 괜찮아. 토리가 패 모양 도토리 쌓기하면서 기다릴게 🌰','쉬엄쉬엄 가자. 다음 판엔 더 좋은 패가 들어올 거야!'],
 neg:['찍… 패가 안 따라 준 날이구나. 마작은 원래 운이 한 판 삐끗하는 게임이야. 토리가 다음 판 패 기도해 줄게!','졌어도 괜찮아. 진우가 즐겁게 쳤으면 그걸로 이긴 거야! 찍찍','아쉬운 판이었네… 도토리 하나 까먹고 다음 판에 복수하자 🌰'],
 q:['찍찍! 마작 얘기라면 토리도 귀 쫑긋이야. 오늘은 몇 판 칠 거야?','패 보는 눈은 진우가 최고잖아! 토리는 옆에서 도토리 칩 세고 있을게','어떤 룰이든 토리는 응원 담당! 같이 갈 사람은 정해졌어?'],
 plan:['오, 마작 약속이 있구나! 좋은 패 들어오라고 토리가 볼주머니에 행운 담아 둘게 🍀','찍찍! 오늘 밤 마작이라니 기대돼! 끝나고 결과 꼭 알려 줘','판 벌이러 가는구나! 몸 풀고 손목 스트레칭하고 가!'],
 past:['찍찍! 마작하고 왔구나! 오늘 패는 어땠어? 리치 한 번 걸었어?','다녀왔구나, 수고했어! 결과가 어땠든 재밌었으면 됐지 😊','밤새 패 만졌으려나? 손목이랑 눈 좀 쉬게 해 줘!'],
 pos:['와, 이겼어?! 토리가 도토리 열 개로 축하 패 만들어 줄게! 짝짝짝!','마작이 잘 풀린 날이구나! 오늘은 진우가 패의 신이야 🀄','찍찍! 신나는 소리가 여기까지 들려. 다음 판도 이 기세로!'],
 kk:['타코도 마작패 문어 모양으로 만들고 싶다코 🐙','리치 걸 때 타코도 긴장된다코!','타코는 패를 못 쥐어도 응원은 여덟 배다코!'],
 d:['마작 이야기구나! 패 소리만 들어도 토리 볼이 두근두근해 🀄','찍찍, 마작이라니! 토리는 규칙은 몰라도 응원은 자신 있어!','진우의 마작 사랑은 알아줘야 해. 오늘도 좋은 패 들어오길!','패 한 장 한 장에 이야기가 있지. 토리는 그 이야기가 좋아!']}],
[/보드 ?게임|보게|카탄|할리갈리|젠가|루미큐브|우노|체스|카드 ?게임|모노폴리|달무티/,{
 no:['오늘은 보드게임 쉬는 날이구나. 판은 접어 두고 푹 쉬어!','다음에 모이면 그때 하자. 토리는 말판 닦으면서 기다릴게 🎲','괜찮아, 게임은 도망 안 가!'],
 neg:['찍… 졌구나. 보드게임은 한 판 더가 정답이야! 토리가 다음 판 주사위 굴려 줄게 🎲','아쉬운 판이었네. 그래도 같이 놀았잖아, 그게 이긴 거야!','룰이 어려웠나 봐. 다음엔 토리가 규칙서 읽어 줄게… 읽을 수 있다면!'],
 q:['보드게임 뭐 할지 고민이야? 토리는 짧고 웃긴 게임이 좋아!','같이 할 사람 모였어? 인원수 맞춰서 고르면 돼 🎲','추천하자면… 토리는 도토리 모으기 게임이 있으면 좋겠어!'],
 plan:['보드게임 약속이 있구나! 오늘은 누가 이길까, 토리는 진우 응원이야 🎲','찍찍! 판 벌일 생각하니 신나지? 즐겁게 놀다 와!','주사위 운이 따라 주길 빌게!'],
 past:['보드게임 하고 왔구나! 누가 이겼어? 토리는 결과가 궁금해 🎲','재밌게 놀았어? 웃었으면 그걸로 대성공이야!','수고했어! 머리 쓰느라 배고프겠다, 간식 챙겨!'],
 pos:['이겼어?! 토리가 도토리 왕관 씌워 줄게 👑','와, 신나게 논 소리가 들려! 다음에도 한 판 더!','보드게임 잘 풀린 날, 최고야! 찍찍!'],
 kk:['타코도 끼워 달라코! 주사위는 다리로 굴린다코 🎲','타코는 룰북 읽는 담당이다코!','이기든 지든 재밌으면 된다코!'],
 d:['보드게임! 말판 위에서 벌어지는 작은 전쟁이지 🎲 토리는 구경만 해도 재밌어!','찍찍, 주사위 굴러가는 소리 좋아해! 같이 놀 사람이 있다는 건 행운이야.','보드게임은 이기든 지든 웃음이 남는 게임이라 좋아!']}],
[/밴드|합주|공연|무대|보컬|드럼|베이스|멤버|라이브|리허설|세션/,{
 no:['오늘은 합주 쉬는 날이구나. 쉬는 시간도 연주의 일부야 🎸','밴드 일정은 쉬어 가도 괜찮아. 토리는 응원봉 닦으며 기다릴게!','컨디션 먼저야. 다음 합주 때 더 잘 맞을 거야!'],
 neg:['찍… 합주가 잘 안 맞은 날이었나 봐. 처음엔 다 삐걱거리는 거야, 쌓이면 소리가 돼!','실수해도 괜찮아. 무대 위 진우는 언제나 멋있으니까! 토리가 앵콜 외칠게','속상한 날은 도토리 까먹고 푹 자자. 다음엔 더 잘 맞을 거야 🌰'],
 q:['밴드 얘기다! 곡은 정했어? 토리는 신나는 곡이 좋아 🎸','공연 날짜 잡혔어? 잡히면 토리가 제일 앞줄 맡을게!','멤버들이랑 사이좋게 지내고 있지? 소리는 마음이 맞아야 맞더라!'],
 plan:['곧 합주야? 손가락 풀고 가! 토리는 객석 맨 앞자리 예약했어 🎶','공연이 있다니! 떨리겠다. 연습한 만큼 나올 거야, 찍찍!','리허설 잘하고 와! 토리가 행운 담아 둘게 🍀'],
 past:['합주하고 왔구나! 오늘 소리는 어땠어? 토리도 듣고 싶다 🎶','수고했어! 귀도 손도 피곤하겠다, 푹 쉬어!','무대 서고 왔어? 박수 짝짝짝! 오늘 하루 제일 멋진 사람은 진우야!'],
 pos:['합주 잘 맞았어?! 토리 볼이 빵빵해질 만큼 기뻐!','밴드가 잘 풀린 날! 오늘 소리는 분명 최고였을 거야 🎸','와, 찍찍! 그 기분 계속 가져가자!'],
 kk:['타코는 드럼 여덟 개 동시에 칠 수 있다코 🥁','공연 때 맨 앞줄은 타코 자리다코!','진우네 밴드 응원봉 타코가 흔들겠다코!'],
 d:['밴드 이야기라니! 토리는 진우네 밴드 1호 팬이야 🎶','합주실 소리를 상상하면 토리 귀가 쫑긋해져! 찍찍','같이 소리를 만든다는 건 멋진 일이야. 계속 응원할게!','밴드는 사람들이 모여서 하나의 소리를 내는 마법 같아!']}],
[/기타|통기타|일렉|기타줄|줄 ?(갈|끊)|코드|스트로크|솔로|리프|이펙터|앰프|피크|튜닝|연습/,{
 no:['오늘은 기타 쉬는 날이구나. 손가락도 쉬어야 늘어, 괜찮아 🎸','안 쳐도 돼. 마음 내킬 때 한 줄만 튕겨 봐!','연습은 도망 안 가. 토리는 기타 옆에서 기다릴게!'],
 neg:['찍… 연습이 뜻대로 안 된 날이구나. 안 되는 날이 있어야 되는 날이 와, 토리 말 믿어!','줄이 끊어졌어? 아깝다… 새 줄 갈면 소리도 새로워져 🎸','어려운 구간에서 막혔구나. 천천히 쪼개서 치면 꼭 넘어갈 거야!'],
 q:['기타 질문이다! 토리는 소리는 몰라도 듣는 건 자신 있어 🎸','어떤 곡 연습 중이야? 토리한테도 들려줘, 귀 쫑긋하고 들을게!','연습은 짧게 자주가 최고래! 토리는 10분씩 쳇바퀴 도는 느낌이야'],
 plan:['기타 칠 거야? 손가락 스트레칭 먼저! 토리가 관객 해 줄게 🎶','오늘 연습 목표는 뭐야? 한 가지만 정하면 훨씬 재밌어!','새 곡 도전이야? 응원할게, 찍찍!'],
 past:['기타 연습했구나! 손가락 아프지? 오늘도 한 걸음 늘었어 🎸','수고했어! 오늘 친 소리는 토리 마음속에 저장해 뒀어','연습한 만큼 소리가 쌓일 거야. 박수 짝짝짝!'],
 pos:['기타가 잘 풀린 날이구나! 토리 앵콜 요청이야 🎸','오, 새 곡이 손에 붙었어? 대단하다!','신나게 쳤다니 토리도 행복해! 찍찍!'],
 kk:['타코는 줄이 여덟 개면 좋겠다코 🎸','연습하는 소리 바다 속까지 들린다코!','타코도 박자 맞춰서 다리 흔든다코!'],
 d:['기타 이야기! 줄 튕기는 소리를 상상하면 토리 볼이 간질간질해 🎸','진우 기타 소리는 토리 자장가야. 오늘도 한 곡 어때?','기타는 매일 조금씩, 그게 제일 빨라! 찍찍','손끝에 굳은살 생기는 거, 멋진 훈장이야!']}],
[/회식|술자리|2차|3차|뒤풀이|송년회|환영회|팀 ?저녁|회사 ?사람|상사/,{
 no:['회식 가기 싫구나… 피곤하면 빠져도 괜찮아. 진우 마음이 먼저야, 찍찍','안 가도 돼. 토리는 집에서 같이 도토리 먹으면 되지 🌰','오늘은 쉬는 날로 해! 에너지는 소중하니까.'],
 neg:['회식은 즐거워도 지치는 자리지… 고생했어. 얼른 집에 와서 쉬자 🐹','상사 눈치 보느라 힘들었구나. 오늘은 토리 품에서 푹 쉬어!','수고했어, 진우. 사회생활하느라 너무 애썼어. 물 한 잔 마시자!'],
 q:['회식 어디서 해? 맛있는 거 나오면 토리 몫도 생각해 줘 🍖','회식 몇 시에 끝나? 늦어지면 집에 조심히 와야 해!','회식 메뉴가 뭐야? 토리는 고기가 좋아!'],
 plan:['오늘 회식이구나! 맛있게 먹고 즐겁게 다녀와. 토리는 집 지키고 있을게 🏠','회식 가는구나! 너무 무리하지 말고 즐겁게 놀다 와!','돌아오면 이야기 들려줘, 토리는 궁금해!'],
 past:['회식 다녀왔구나! 고생했어. 오늘 뭐가 제일 맛있었어? 🍖','수고했어! 이제 얼른 씻고 쉬자. 물 한 잔 꼭 마셔!','오늘 하루 사람들 속에서 애썼어. 토리가 볼 쓰다듬어 줄게'],
 pos:['회식이 즐거웠어?! 사람들이랑 잘 어울렸네, 멋져! 찍찍','맛있게 먹고 웃고 왔구나! 오늘 하루 꽉 찼다!','좋은 사람들이랑 즐거웠다니 토리도 기뻐 💛'],
 kk:['타코는 문어 요리만 안 나오면 괜찮다코… 🐙','회식 끝나면 집에서 타코가 기다린다코!','너무 늦지 말라코!'],
 d:['회식 이야기구나! 사람들 속에서 하루 보내느라 수고 많아 🍻','찍찍, 회식은 먹는 게 반이지! 맛있는 거 많이 먹었어?','토리는 회식이 뭔지 몰라도, 진우가 즐겁다면 응원이야!']}],
[/술|맥주|소주|위스키|와인|막걸리|하이볼|칵테일|안주|건배|취했|취해|숙취|해장|한 ?잔/,{
 no:['술 안 마시는 날이구나. 맑은 정신으로 보내는 하루도 좋아! 토리는 물이 제일 좋아 💧','안 마셔도 좋아. 오늘은 간 쉬는 날로 하자!','오늘은 술 대신 달달한 음료 어때? 토리는 찬성이야 🥤'],
 neg:['숙취구나… 얼른 물 많이 마시고 푹 쉬어. 해장은 따뜻한 국물이 최고야 🍲','속이 안 좋겠다… 오늘은 무리하지 말고 천천히 보내자, 토리가 옆에 있을게','어제 달렸나 보네. 몸이 보내는 신호야, 오늘은 푹 자자 🛌'],
 q:['술 얘기구나! 뭐 마실 거야? 위스키? 토리는 향만 맡아도 취할 것 같아 🥃','안주는 정했어? 안주가 반이지, 찍찍!','한 잔 하고 싶은 날이구나. 천천히 즐겨!'],
 plan:['오늘 한 잔 하러 가? 즐겁게 마시고 와! 마신 뒤엔 물 한 잔도 잊지 마 💧','술자리 있구나! 좋은 사람들이랑 좋은 시간 보내고 와 🍻','돌아오는 길 조심하고! 토리가 불 켜 두고 기다릴게 🏠'],
 past:['한 잔 하고 왔구나! 맛있었어? 물 한 잔 마시고 푹 자자 💧','수고했어! 기분 좋게 마셨으면 됐지. 토리는 이불 덮어 줄게','마시고 왔다니 얼른 씻고 누워. 내일 아침이 편해질 거야!'],
 pos:['기분 좋게 마셨구나! 좋은 술이 좋은 하루를 만들어 줬네 🥃','찍찍! 오늘 술맛이 좋았나 보다. 즐거웠다니 토리도 기뻐!','한 잔의 여유, 진우한테 딱 어울려!'],
 kk:['타코는 술 대신 바닷물이다코! 🌊','한 잔 하고 물도 마시라코!','타코는 취한 진우도 응원한다코!'],
 d:['술 이야기구나! 토리는 마실 순 없지만 진우의 한 잔은 늘 응원해 🥃','위스키 향 좋아하는 진우, 멋있어. 천천히 즐기자!','한 잔 하는 시간도 하루의 쉼표야. 찍찍','마시더라도 물 한 잔 같이! 토리와의 약속이다 💧']}],
[/운동|헬스|러닝|달리기|조깅|런닝|스쿼트|푸시업|풋살|등산|스트레칭|요가|자전거|수영|근육|유산소|땀/,{
 no:['오늘은 운동 쉬는 날이구나. 회복도 운동의 절반이야, 괜찮아 🌿','못 한 날도 있는 거지 뭐. 스트레칭 한 번이면 충분해!','내일 하면 돼. 토리는 쳇바퀴 옆에서 같이 기다릴게!'],
 neg:['운동하고 너무 힘들었구나… 오늘은 푹 쉬자. 몸이 쑥쑥 크는 중이야 💪','근육통이 왔나 봐. 따뜻한 물로 씻고 일찍 자자!','힘든 만큼 몸이 기억할 거야. 수고했어, 진우!'],
 q:['운동 얘기다! 오늘은 어떤 걸 할 거야? 토리는 쳇바퀴 열 바퀴 가능해 🐹','무리하지 않는 게 제일 중요해. 가볍게라도 꾸준히!','같이 뛰자! 토리도 쳇바퀴에서 응원할게!'],
 plan:['운동 갈 거야? 준비운동 꼭 하고! 토리가 응원 담당이야 💪','오늘 운동 목표는 뭐야? 가볍게 시작하는 게 좋아!','다녀와서 이야기 들려줘, 찍찍!'],
 past:['운동하고 왔구나! 대단해, 박수 짝짝짝! 샤워하고 물 마시자 💧','오늘도 몸을 움직였구나, 멋져! 토리도 쳇바퀴 열 바퀴 뛸게!','수고했어! 오늘 하루 자신에게 칭찬 한마디 해 줘 💪'],
 pos:['운동하고 기분 좋아졌구나! 땀 흘린 만큼 개운하지? 찍찍','몸이 가벼운 날이네! 오늘은 진우가 반짝반짝해 ✨','이 기세 좋아! 토리도 같이 뛰고 싶어!'],
 kk:['타코는 다리 여덟 개로 스쿼트한다코 💪','타코가 수건 던져 주겠다코!','수영은 타코가 선생님이다코!'],
 d:['운동 이야기구나! 꾸준히 하는 진우 멋있어 💪','토리는 쳇바퀴 매일 뛰는 운동 선수야. 같이 힘내자!','한 번이라도 움직였다면 그걸로 충분해, 찍찍','몸을 아끼는 마음이 제일 좋은 운동이야 🌿']}],
[/식단|다이어트|닭가슴살|샐러드|칼로리|단백질|탄수|치팅|야식|간식|굶|절식|체중|살 ?(쪘|빠|뺄)|배고|배불|밥/,{
 no:['오늘은 식단 쉬는 날이구나. 하루쯤은 괜찮아, 내일 다시 하면 돼 🍚','안 지켜도 괜찮아. 자책하지 말고 맛있게 먹은 걸로 하자!','치팅데이도 식단의 일부야, 찍찍!'],
 neg:['식단이 뜻대로 안 된 날이구나… 괜찮아, 하루가 전부는 아니야. 내일 다시 하면 돼 🍪','참느라 힘들었지. 너무 몰아붙이지 말고 건강하게 챙겨 먹자!','스트레스 받지 마. 몸도 마음도 소중해, 토리 말이야!','한 끼 망쳐도 괜찮아. 다음 끼니부터 가볍게 다시 시작하자 🥗'],
 q:['식단 얘기다! 오늘 뭐 먹을 거야? 토리는 도토리와 해바라기씨 🌰','단백질 챙기고 있어? 토리는 땅콩 한 알이면 충분해!','뭐 먹을지 고민이야? 토리는 따뜻한 밥이 제일 좋더라 🍚'],
 plan:['오늘 식단은 뭐야? 맛있고 든든하게 챙겨 먹자! 토리도 응원할게 🥗','한 끼 한 끼 잘 챙기는 것도 멋진 습관이야!','맛있는 거 먹을 땐 천천히 즐기자 🍚'],
 past:['밥 먹었구나! 맛있었어? 잘 챙겨 먹는 게 제일 중요해 🍚','식단 잘 지켰구나, 대단해! 오늘도 한 끼 성공!','먹고 나면 가볍게 걸어 보는 것도 좋아. 찍찍!'],
 pos:['맛있게 먹었다니 토리도 행복해! 볼이 빵빵해지는 기분이야 🍚','식단이 잘 풀리는 날이구나, 훌륭해! ✨','좋은 음식은 기분도 좋게 해 줘. 찍찍!'],
 kk:['타코는 새우만 먹는다코 🦐','건강하게 챙겨 먹으라코!','너무 참지 말라코!'],
 d:['식단 이야기구나! 몸 챙기는 진우 멋있어. 무리는 하지 말자 🥗','잘 먹고 잘 쉬는 게 제일 좋은 식단이야, 찍찍','밥은 든든히! 토리는 해바라기씨 한 알도 소중히 먹어 🌻','먹는 즐거움도 잊지 말자!']}],
[/안 ?자고 ?싶|안 ?잘래|안 ?자(?:도 ?돼|면 ?안|고 ?(?:놀|있|버티))|자기 ?(?:싫|아까|아쉬)|잠 ?자기 ?싫|자고 ?싶지 ?않|자기 ?가 ?싫|더 ?놀고 ?싶|더 ?깨어 ?있|잠이 ?아까|밤새 ?(?:놀|볼|하|있)/,{
 d:['찍찍! 아직 자기 아쉬운 밤이구나? 그럼 토리랑 조금만 더 놀자 🌙','안 자고 싶은 날도 있지! 대신 졸리면 바로 말해 줘. 토리가 이불 펴 둘게 🛌','오늘 하루가 끝나는 게 아쉬워? 토리도 진우랑 더 이야기하고 싶었어!','좋아, 그럼 토리가 옆에서 같이 깨어 있을게. 쳇바퀴 한 바퀴 더 돌까? 🐹','아직 놀고 싶구나! 따뜻한 물 한 잔 옆에 두고 천천히 놀자 💧','찍… 토리는 벌써 하품이 나오는데 진우는 쌩쌩하네! 오늘은 진우가 이겼다 😊'],
 late:['벌써 이렇게 늦었는데… 내일의 진우가 피곤할까 봐 토리는 걱정돼. 10분만 더 놀고 눕자 🌙','안 자고 싶은 마음 알아. 그래도 눈은 쉬게 해 주자. 토리가 옆에서 도토리 세어 줄게 🌰','찍찍… 토리는 진우가 푹 자는 게 제일 좋아. 폰은 내려놓고 같이 눈 감아 볼까?','오늘 하루를 놓아주기 싫구나. 괜찮아, 내일도 토리가 여기서 기다리고 있을게 💛','누워서 눈만 감고 있어도 몸은 쉬어. 토리가 자장가 불러 줄게, 찍~ 찍~ 🎵'],
 neg:['피곤한데 잠이 안 오는구나… 오늘 마음이 바빴나 봐. 토리가 옆에서 천천히 이야기 들어 줄게','자기 싫을 만큼 마음이 복잡해? 하나만 토리한테 털어놔 봐. 가벼워지면 잠도 올 거야 🌙','힘든 날엔 하루를 끝내기가 아쉽지. 따뜻한 물 마시고 조명을 낮춰 보자 💧'],
 q:['왜 자야 하냐고? 자는 동안 진우 몸이 오늘 쓴 힘을 다시 채우거든! 그래서 토리는 낮잠 대장이야 🐹','몇 시까지 놀 거야? 시간을 정해 두면 토리가 그때 살짝 알려 줄게!','음… 그럼 자기 전에 오늘 제일 좋았던 일 하나만 말해 줄래? 🌙'],
 pos:['오늘 너무 즐거워서 자기 아깝구나! 그 기분 그대로 꿈까지 가져가자 ✨','신나는 하루였나 보다! 토리도 덩달아 잠이 안 와, 찍찍!'],
 kk:['타코도 아직 안 졸리다코! 대신 내일 아침 알람은 타코가 맡는다코 🐙','늦게 자면 타코 다리가 꼬인다코… 조금만 더 놀라코!'],
 tk:['타코도 같이 안 잔다코! 근데 진우 눈이 반쯤 감겼다코 🐙','타코는 밤바다처럼 조용히 옆에 있겠다코. 졸리면 말하라코!']}],
[/졸려|졸리|잘래|잘게|자러|잠 ?(온|와|들|잘)|피곤해서 ?자|굿나잇|굿밤|꿈|침대|이불|낮잠|늦잠|일찍 ?자|누울|눕/,{
 no:['잠이 안 와? 눈 감고 토리가 숫자 세 줄게. 도토리 하나, 도토리 둘… 🌰','못 자겠구나… 따뜻한 물 한 잔 마시고 조명을 낮춰 보자.','뒤척여도 괜찮아. 누워만 있어도 몸은 쉬고 있어!'],
 neg:['많이 피곤했구나… 얼른 씻고 누워. 토리가 이불 끝까지 덮어 줄게 🛌','오늘 정말 수고했어. 자고 나면 한결 나아질 거야. 푹 자자 🌙','졸린 눈으로 폰 보지 말고 일찍 쉬자, 찍찍.'],
 q:['몇 시에 자려고? 일찍 자면 내일 아침이 편해! 토리는 벌써 볼주머니에 이불 넣었어 🛌','졸려? 토리도 하품 나온다… 같이 눈 감자!','어떤 꿈 꾸고 싶어? 토리는 도토리 산에서 뒹구는 꿈이야 🌰'],
 plan:['이제 자러 가는구나! 이불 꼭 덮고, 좋은 꿈 꿔 🌙','잘 자, 진우. 내일도 토리가 기다릴게!','불 끄고 눈 감아 봐. 오늘 하루 정말 수고했어!'],
 past:['잘 잤어? 꿈에 토리 나왔어? 찍찍 🌞','낮잠 잤구나! 개운해졌겠다. 이제 힘내서 하루 보내자!','푹 잤다니 다행이야. 좋은 아침이야!'],
 pos:['좋은 꿈 꿨구나! 토리도 도토리 먹는 꿈 꿨어 🌰','잘 쉬어서 개운하구나! 찍찍!','푹 자는 것도 능력이야. 오늘도 힘차게!'],
 kk:['타코는 눈 뜨고도 잔다코… 🐙','푹 자라코!','잘 자라코, 내일 만나자코!'],
 tk:['타코도 졸리다코… 같이 자자코 🐙','잘 자라코. 타코가 꿈속에서 파도 소리 들려주겠다코','이불은 타코가 덮어 주겠다코! 다리가 여덟 개라 포근하다코'],
 d:['졸려? 하품 나오는 건 몸이 보내는 신호야. 푹 자자 🌙','잘 자, 진우. 토리가 볼로 이불 덮어 줄게 🛌','찍… 토리도 졸려진다. 같이 눈 감을까?','오늘도 수고했어. 푹 자고 내일 만나!']}],
[/뭐 ?해|뭐하|뭐 ?하고|뭐 ?하는|뭐 ?할|뭐해|심심|놀아|놀자|같이 ?있|뭐 ?하니/,{
 d:['토리는 지금 도토리 정리하고 있어! 진우는 뭐 해? 🌰','방금까지 쳇바퀴 돌고 왔어. 숨이 차네… 찍찍 🐹','진우 기다리는 중이야! 심심했는데 말 걸어 줘서 좋아','볼주머니에 간식 넣다가 깜빡 졸 뻔했어. 진우는?'],
 q:['토리는 지금 도토리 정리하고 있어! 진우는 뭐 해? 🌰','방금까지 쳇바퀴 돌고 왔어. 숨이 차네… 찍찍 🐹','진우 기다리는 중이야! 말 걸어 줘서 좋아','볼주머니에 간식 넣다가 깜빡 졸 뻔했어. 진우는?'],
 tk:['타코는 지금 수조 청소 중이다코! 진우는 뭐 하냐코? 🐙','다리 여덟 개로 토리 쳇바퀴 밀어 주고 있다코!','타코는 진우 기다리고 있었다코. 말 걸어 줘서 좋다코!'],
 pos:['심심했는데 진우가 와 줬네! 같이 놀자 🎲','토리도 놀고 싶었어! 뭐 하고 놀까? 찍찍','진우랑 있으면 심심할 틈이 없어 💛']}],
[/혜진|혜진이|우리 ?여친|여자친구|여친|애인|그 ?사람|연애/,{
 no:['혜진이랑 못 만나서 아쉽구나… 그래도 마음은 닿아 있을 거야 💛','오늘은 못 봐도 괜찮아. 토리는 혜진이가 진우 생각하는 거 알아!','연락 한 번 해 보는 건 어때? 토리가 응원할게!'],
 neg:['혜진이랑 무슨 일 있었어? 토리가 옆에 있을게. 천천히 이야기해 봐 💛','속상한 마음 다 알아. 토리는 두 사람 편이야!','서로 마음이 있으면 풀릴 거야. 깊이 숨 한 번 쉬고 💛'],
 q:['혜진이 얘기구나! 토리는 혜진이가 진우한테 얼마나 소중한 사람인지 알아 💛','혜진이는 지금 뭐 하고 있을까? 진우가 궁금한 만큼 혜진이도 궁금해할 거야!','연락해 보는 건 어때? 토리가 행운 담아 줄게 🍀'],
 plan:['혜진이랑 약속 있구나! 좋은 시간 보내고 와 💛','데이트야? 토리는 집에서 기다릴게. 즐겁게 다녀와!','혜진이한테 맛있는 거 사 주고 와, 찍찍!'],
 past:['혜진이 만나고 왔구나! 오늘 어땠어? 토리는 궁금해 💛','즐거웠어? 함께한 시간이 쌓이면 보물이 돼!','수고했어! 혜진이도 오늘 하루 행복했을 거야.'],
 pos:['혜진이랑 있으면 늘 기분이 좋지? 토리도 덩달아 행복해 💛','두 사람이 웃는 모습, 토리 마음속에 쏙 들어왔어 ✨','사랑이 가득한 하루네! 찍찍!'],
 miss:['혜진이가 보고 싶구나… 토리도 혜진이 보고 싶어! 연락 한 번 해 봐, 분명 기뻐할 거야 💛','보고 싶은 마음은 소중한 거야. 목소리라도 들어 보는 건 어때?','혜진이도 지금 진우 생각하고 있을지 몰라. 먼저 한마디 보내 봐 💌'],
 d:['혜진이는 진우를 정말 아끼는 사람이야. 토리도 알고 있어 💛','진우 곁에 혜진이가 있어서 다행이야. 토리는 두 사람이 좋아!','혜진이 얘기만 해도 진우 목소리가 따뜻해져. 찍찍','혜진이 생각이 나면 연락 한 번 해 봐. 분명 기뻐할 거야!']}],
[/타코|문어|다코|발이 ?여덟|빨판/,{
 no:['타코는 오늘 쉬는 날이라고 했다코. 대신 응원은 24시간 한다코!','타코 안 불러도 늘 곁에 있다코 🐙','필요하면 언제든 부르라코!'],
 neg:['타코가 있다코! 힘든 일 있으면 다리 여덟 개로 꼭 안아 주겠다코 🐙','괜찮다코. 타코랑 토리가 옆에 있다코!','기운 내라코! 타코가 맛있는 거 그려 줄게코!'],
 q:['타코 불렀다코? 뭐든 물어보라코 🐙','타코는 바다에서 왔다코. 지금은 진우 곁이 제일 좋다코!','타코는 여덟 다리로 열심히 응원 중이다코!'],
 plan:['타코가 같이 가 주겠다코! 마음속에서라도 따라간다코 🐙','잘 다녀오라코! 타코는 토리랑 같이 집 지키고 있겠다코!','어디든 즐겁게 다녀오라코. 타코가 기다리겠다코!'],
 past:['오늘도 수고했다코! 타코가 토닥토닥 해 주겠다코 🐙','잘했다코! 타코가 박수 여덟 번 쳐 주겠다코','이야기 들려 달라코, 궁금하다코!'],
 pos:['타코도 기쁘다코! 다리 여덟 개가 춤춘다코 🐙','좋은 일이다코! 축하 폭죽 터뜨리자코!','오늘은 타코랑 축제다코!'],
 d:['타코 불렀다코? 여기 있다코 🐙','진우가 타코 이야기 해 주니 기쁘다코!','타코는 오늘도 진우를 응원한다코. 다리 여덟 개 다!','불러 줘서 고맙다코! 같이 놀자코!']}],
[/토리|햄스터|토리야|꾹꾹|볼주머니|쳇바퀴|도토리/,{
 no:['토리는 괜찮아! 진우 마음 편한 게 제일이야, 찍찍 🐹','안 와도 토리는 기다리고 있어. 천천히 와!','토리는 항상 여기 있을게.'],
 neg:['찍… 진우 힘들었구나. 토리가 볼로 꼭 안아 줄게 🐹','괜찮아, 토리는 진우 편이야. 도토리 하나 까먹고 푹 쉬자 🌰','토리가 옆에 있어. 천천히 이야기해 줘.'],
 q:['토리 불렀어? 찍찍! 뭐든 물어봐 🐹','토리는 지금 볼주머니에 간식 가득이야. 진우는?','토리는 진우가 오는 시간을 제일 좋아해!'],
 plan:['토리 놀자고? 좋아! 오늘은 뭐 하고 놀까? 🐹','나중에 또 와 줘. 토리는 도토리 정리하고 있을게!','약속이다, 찍찍!'],
 past:['토리랑 놀았구나! 찍찍, 토리도 즐거웠어 🐹','고마워, 진우! 토리는 오늘도 행복해!','오늘도 와 줘서 토리 볼이 빵빵해졌어!'],
 pos:['토리도 진우 좋아해! 찍찍찍! 🐹','진우가 웃으면 토리도 웃어! 💛','우리 오늘도 사이좋게 지내자, 찍찍!'],
 d:['찍찍! 토리 부른 거야? 여기 있어 🐹','토리는 늘 진우 곁에 있어. 불러 줘서 고마워!','볼주머니에 도토리 가득, 마음에는 진우 가득이야 🌰','찍찍! 진우랑 이야기하는 시간이 제일 좋아!']}]
];
function kwReply(v){
  const tg=kwTags(v);
  for(const [re,sets] of KW){
    if(!re.test(v))continue;
    if(sets.tk&&/타코/.test(v))return [{w:'k',t:kwPick(sets.tk)}];
    let key='d';for(const t of ['no','neg','miss','q','plan','past','pos'])if(tg.includes(t)&&sets[t]){key=t;break;}
    if((key==='d'||key==='pos')&&sets.late&&kst().getUTCHours()<5)key='late';
    const out=[{w:re.source.indexOf('타코')===0?'k':'t',t:kwPick(sets[key]||sets.d)}];
    if(sets.kk&&key!=='late'&&Math.random()<.45)out.push({w:'k',t:kwPick(sets.kk)});
    return out;
  }
  return null;
}
function kwHtml(v){const r=kwReply(v);if(!r)return `<div class="chb">${esc(dyReact(v))}</div>`;return r.map(x=>x.w==='k'?`<div class="chb">🐙 ${esc(x.t)}</div>`:`<div class="chb">${esc(x.t)}</div>`).join('');}
function chatSay(){const el=$('chi'),v=el&&el.value.trim();if(!v){toast('한마디를 적어 주세요');return;}sfx('coin');$('cho').innerHTML=`<div class="chb me">나: ${esc(v)}</div>${kwHtml(v)}<div class="row" style="margin-top:8px"><button class="btn full" onclick="chatOpen()">다른 이야기 ▶</button></div>`;el.value='';}
function chatPick(i){if(chQ[2])memSeen(chQ[2]);const o=chQ[1][i],r=Array.isArray(o[1])?pk(o[1]):o[1];sfx('coin');$('cho').innerHTML=`<div class="chb me">나: ${esc(o[0])}</div><div class="chb">${esc(r)}</div><div class="row" style="margin-top:8px"><button class="btn full" onclick="chatOpen()">다른 이야기 ▶</button></div>`;}
/* 하루 한 번 토리의 질문 */
const TQ=[
['오늘 제일 재밌었던 건?',['먹은 것','한 일','만난 사람','딱히 없음']],['오늘 기분을 색으로 말하면?',['노랑','파랑','분홍','회색']],['지금 제일 먹고 싶은 건?',['고기','면','달달한 것','도토리']],['오늘 가장 힘들었던 순간은?',['아침','일하는 중','사람 상대','없었어']],
['요즘 제일 빠져 있는 건?',['음악','게임','영상','잠']],['오늘 하늘 봤어요?',['봤어','못 봤어','흐렸어','예뻤어']],['주말에 뭐 하고 싶어요?',['나가서 놀기','집콕','친구 만나기','푹 자기']],['오늘 물 마셨어요?',['많이','조금','거의 안','커피만']],
['요즘 자주 듣는 소리는?',['음악','빗소리','유튜브','조용함']],['오늘 웃은 적 있어요?',['많이','한 번','피식','아직']],['지금 몸 상태는?',['쌩쌩','보통','조금 피곤','녹초']],['하루 중 제일 좋은 시간은?',['아침','점심','저녁','밤']],
['토리한테 하고 싶은 말은?',['고마워','귀여워','배고파?','보고싶어']],['오늘 밥 맛있었어요?',['최고','보통','대충','건너뜀']],['가장 가고 싶은 곳은?',['바다','산','카페','집']],['오늘 제일 잘한 선택은?',['일찍 일어남','밥 챙김','쉬는 시간','참은 것']],
['요즘 잠은 잘 자요?',['꿀잠','보통','뒤척임','부족해']],['오늘 스트레스 점수는?',['0~2','3~5','6~8','9~10']],['좋아하는 계절은?',['봄','여름','가을','겨울']],['오늘 한 가지만 한다면?',['운동','정리','휴식','취미']],
['지금 옆에 있으면 좋겠는 건?',['간식','이불','친구','음악']],['오늘 기억에 남는 소리는?',['웃음소리','빗소리','기타 소리','정적']],['최근에 제일 웃긴 일은?',['영상 봄','친구 얘기','내 실수','없음']],['내일은 어떤 하루면 좋겠어요?',['여유롭게','알차게','신나게','조용하게']],
['오늘 고마운 사람이 있어요?',['있어','토리?','나 자신','아직']],['오늘 하루 점수는?',['90점 이상','70점대','50점대','내일 만회']],['지금 제일 필요한 건?',['잠','간식','칭찬','휴가']],['좋아하는 밤 풍경은?',['별','달','도시 불빛','이불 속']],
['이번 주 목표 하나만 꼽으면?',['운동','정리','연습','휴식']],['오늘의 나에게 한마디!',['수고했어','잘했어','괜찮아','고마워']]];
const TQR=[['찍찍! 그렇구나~ 토리도 좋아요!','찍찍! 좋은 대답이에요! 볼이 빵빵해졌어요 🐹','찍찍! 오늘도 하나 알게 됐어요 💛'],['찍찍~ 재밌는 대답이에요! 다음에 또 물어볼게요','찍찍! 토리 마음에 쏙 들어요 ✨'],['찍찍! 오, 그런 거였어요? 이야기 들려줘서 고마워요','찍찍! 토리는 그런 이야기 좋아해요 🌰'],['찍찍… 그래도 괜찮아요. 내일은 더 좋은 날이에요 🌙','찍찍~ 그런 날도 있어요. 토리가 옆에 있을게요 🛋️']];
function tqOpen(){const t=todayStr(),i=dayNo()%TQ.length,q=TQ[i],done=S.tq&&S.tq.d===t;
  if(done){modal(`<h3>📝 오늘의 질문</h3><div class="chb">${esc(q[0])}</div><div class="chb me">나: ${esc(S.tq.x||q[1][S.tq.a])}</div><div class="muted" style="margin-top:6px">오늘은 답을 했어요. 내일 또 새 질문이 와요!</div>${S.tq.dy?'':`<button class="btn wood full" style="margin-top:8px" onclick="tqDiary()">📖 일기에 한 줄 남기기</button>`}<button class="btn ghost full" style="margin-top:8px" onclick="chatOpen()">◀ 대화로</button>`);return;}
  modal(`<h3>📝 오늘의 질문</h3><div class="chb">${esc(q[0])}</div>${q[1].map((o,k)=>`<button class="btn full" style="margin-top:6px" onclick="tqPick(${k})">${esc(o)}</button>`).join('')}<div class="row" style="margin-top:8px;gap:6px"><input id="tqi" maxlength="60" placeholder="직접 대답해도 돼요" style="flex:1;min-width:0" onkeydown="if(event.key==='Enter')tqSay()"><button class="btn wood" onclick="tqSay()">답하기</button></div><div class="muted" style="margin-top:8px">답하면 🌰 1개를 받아요 (하루 한 번)</div><button class="btn ghost full" style="margin-top:8px" onclick="chatOpen()">◀ 대화로</button>`);}
function tqPick(k){const t=todayStr();if(S.tq&&S.tq.d===t)return;S.tq={d:t,a:k,dy:0};S.acorns+=1;save();sfx('fan');fx('acorn',6);const q=TQ[dayNo()%TQ.length];
  modal(`<h3>📝 오늘의 질문</h3><div class="chb">${esc(q[0])}</div><div class="chb me">나: ${esc(q[1][k])}</div><div class="chb">${esc(pk(TQR[k>=3?3:k]))}</div><div class="muted" style="margin-top:6px">🌰 +1 받았어요!</div><button class="btn wood full" style="margin-top:8px" onclick="tqDiary()">📖 일기에 한 줄 남기기</button><button class="btn ghost full" style="margin-top:8px" onclick="closeM()">닫기</button>`);render();}
function tqSay(){const t=todayStr();if(S.tq&&S.tq.d===t)return;const el=$('tqi'),v=el&&el.value.trim();if(!v){toast('대답을 적어 주세요');return;}S.tq={d:t,a:0,x:v,dy:0};S.acorns+=1;save();sfx('fan');fx('acorn',6);const q=TQ[dayNo()%TQ.length];
  modal(`<h3>📝 오늘의 질문</h3><div class="chb">${esc(q[0])}</div><div class="chb me">나: ${esc(v)}</div>${kwHtml(v)}<div class="muted" style="margin-top:6px">🌰 +1 받았어요!</div><button class="btn wood full" style="margin-top:8px" onclick="tqDiary()">📖 일기에 한 줄 남기기</button><button class="btn ghost full" style="margin-top:8px" onclick="closeM()">닫기</button>`);render();}
function tqDiary(){const t=todayStr();if(!S.tq||S.tq.d!==t||S.tq.dy)return;const q=TQ[dayNo()%TQ.length],line='🐹 「'+q[0]+'」 → '+(S.tq.x||q[1][S.tq.a]);const e=(S.diary||[]).find(x=>x.d===t);
  if(e){e.t=(e.t+' / '+line).slice(0,300);}else{S.diary=(S.diary||[]);S.diary.unshift({d:t,t:line,r:dyReact(line)});S.diary.sort((a,b)=>a.d<b.d?1:a.d>b.d?-1:0);S.diary=S.diary.slice(0,1500);}
  S.tq.dy=1;save();toast('📖 일기에 한 줄 남겼어요');closeM();render();}
/* 토리와 타코의 만담: 토리 '찍찍', 타코 '~다코' */
const MD={
mj:[[['타','마작 기록이 올라왔다코! 오늘은 어떤 판이었냐코?'],['토','찍찍! 패 소리가 딸깍딸깍 들렸어요!'],['타','토리는 패를 볼주머니에 넣으면 안 된다코.'],['토','찍찍… 그럼 만지기만 할게요.'],['타','그것도 안 된다코! 다음 판도 기대한다코 🀄']],
 [['토','찍찍! 타코, 마작은 어떻게 이기는 거예요?'],['타','패를 잘 읽고, 마음을 다스리는 거다코.'],['토','찍찍! 저는 먹는 것부터 다스릴게요!'],['타','…그건 마작이랑 상관없다코. 그래도 응원한다코! 🐙']]],
band:[[['타','합주 기록이 올라왔다코! 오늘도 쿵짝쿵짝 했냐코?'],['토','찍찍! 기타 소리는 도토리 소리 다음으로 좋아요!'],['타','도토리 소리는 없다코.'],['토','찍찍! 토독 하고 떨어지면 나잖아요!'],['타','…듣고 보니 맞는 것 같다코 🎸']],
 [['토','찍찍! 타코, 우리도 밴드 하면 안 돼요?'],['타','토리는 무슨 악기를 맡을 거냐코?'],['토','찍찍! 볼주머니 드럼이요! 볼을 두드려요!'],['타','…그건 아프다코. 대신 관객 하겠다코 🎤']]],
bday:[[['타','오늘은 진우 생일이다코!! 🎂'],['토','찍찍!! 생일 축하해요!! 도토리 백 개 드릴게요!'],['타','토리가 가진 건 열두 개 아니냐코?'],['토','찍찍… 마음만 백 개예요.'],['타','그 마음이 제일 크다코. 생일 축하한다코 🎉']]],
xmas:[[['타','메리 크리스마스다코! 🎄'],['토','찍찍! 산타가 도토리를 두고 갔을까요?'],['타','산타는 굴뚝으로 오는데 토리 집엔 굴뚝이 없다코.'],['토','찍찍! 그럼 문 앞에 양말 걸어 둘게요!'],['타','좋은 생각이다코. 따뜻한 하루 보내라코 🎁']]],
nye:[[['타','올해의 마지막 날이다코! 🎆'],['토','찍찍! 올해 도토리 많이 먹었어요!'],['타','내년에도 같이 있을 거다코. 약속이다코.'],['토','찍찍! 손도장 찍을게요! (발도장)'],['타','귀엽다코… 내년에도 잘 부탁한다코 ✨']]],
hal:[[['토','찍찍! 트릭 오어 트릿!'],['타','트릿 줄 테니 볼주머니 비워라코.'],['토','찍찍!! 방금 비웠는데 벌써 가득 찼어요!'],['타','…역시 토리다코 🎃']]],
sak:[[['토','찍찍! 창밖에 분홍색이 날려요!'],['타','벚꽃이다코! 봄이 왔다코 🌸'],['토','찍찍! 먹어도 돼요?'],['타','안 된다코! 눈으로 먹어라코.']]],
hol:[[['타','오늘은 특별한 날이다코!'],['토','찍찍! 특별한 날엔 간식이 특별해져요!'],['타','토리는 매일 특별한 날 아니냐코?'],['토','찍찍! 그래서 매일 행복해요 🐹']]]};
let mdL=null,mdI=0;
function mandam(k){if($('ov').classList.contains('on'))return;const a=MD[k];if(!a)return;mdL=pk(a);mdI=0;mdShow();}
function mdShow(){const L=mdL.slice(0,mdI+1),last=mdI>=mdL.length-1;modal(`<h3>🐹🐙 토리와 타코의 수다</h3>${L.map(x=>`<div class="chb ${x[0]==='타'?'tk':''}">${x[0]==='토'?'🐹 '+esc(hn()):'🐙 타코'}: ${esc(x[1])}</div>`).join('')}<button class="btn ${last?'ghost':'wood'} full" style="margin-top:8px" onclick="${last?'closeM()':'mdI++;mdShow()'}">${last?'닫기':'다음 ▶'}</button>`);}
function mdAct(k){if(Math.random()>=.5)return;const t=todayStr();if(!S.mdA||S.mdA.d!==t)S.mdA={d:t};if(S.mdA[k])return;S.mdA[k]=1;save();setTimeout(()=>mandam(k),3400);}
const MD_WEEKLY=[
 [['토','찍찍! 타코는 손이 많아서 온천 수건도 많이 필요한가요?'],['타','머리에 하나면 된다코.'],['토','찍찍! 그럼 나머지 손들은 휴가네요!'],['타','맞다코. 오늘은 여덟 손 모두 쉬는 날이다코.']],
 [['타','오늘은 아무 일도 안 하기로 했다코.'],['토','찍찍! 저는 쉬는 일을 하고 있어요!'],['타','그건 일을 안 하는 거다코.'],['토','찍찍! 그럼 아주 잘하고 있네요!'],['타','…반박할 수 없다코.']],
 [['토','찍찍! 구름이 도토리처럼 생겼어요.'],['타','토리는 모든 걸 도토리로 보는 거냐코?'],['토','찍찍! 저 구름은 타코처럼 생겼어요.'],['타','이제야 제대로 본다코.'],['토','찍찍! 도토리 안고 있는 타코요!']],
 [['타','이번 주에 제일 잘한 일이 뭐냐코?'],['토','찍찍! 밥 먹고, 자고, 또 일어난 거요.'],['타','생각보다 중요한 일이다코.'],['토','찍찍! 내일도 잘할 수 있어요!'],['타','타코도 같이 하겠다코.']],
 [['토','찍찍! 물에 비친 제 얼굴은 볼이 더 커요.'],['타','물결 때문에 그런 거다코.'],['토','찍찍! 그럼 물결 안에 도토리가 있나 봐요.'],['타','…물은 먹는 걸 비추기만 한다코.']],
 [['타','토리, 조용히 별을 세어 보자코.'],['토','찍찍! 하나, 둘, 도토리…'],['타','세 번째는 셋이다코.'],['토','찍찍! 가장 반짝이는 건 도토리 같았어요.'],['타','오늘은 이름을 붙여도 좋겠다코.']],
 [['토','찍찍! 타코는 양말을 몇 켤레 신어요?'],['타','타코는 양말을 안 신는다코.'],['토','찍찍! 빨래가 적어서 좋겠어요.'],['타','대신 수건은 토리보다 오래 말린다코.']],
 [['타','책을 펴 놨는데 한 줄도 못 읽었다코.'],['토','찍찍! 저는 책 옆에서 아주 잘 잤어요.'],['타','그럼 이 책은 베개였냐코?'],['토','찍찍! 좋은 책이었어요.'],['타','평가 기준이 독특하다코.']],
 [['토','찍찍! 바람이 문을 톡톡 두드려요.'],['타','손님인 척하는 바람이다코.'],['토','찍찍! 간식도 줘야 하나요?'],['타','바람은 냄새만 맡고 간다코.']],
 [['타','오늘은 천천히 걸어 보자코.'],['토','찍찍! 저는 이미 천천히 걷고 있어요.'],['타','왜 멈췄냐코?'],['토','찍찍! 여기 햇빛이 따뜻해서요.'],['타','그건 멈출 만한 이유다코.']],
 [['토','찍찍! 이번 주가 벌써 지나갔어요.'],['타','재밌는 건 조금 모아 뒀냐코?'],['토','찍찍! 타코랑 얘기한 것도 모았어요.'],['타','타코도 그걸 모았다코.']],
 [['타','대나무 소리가 들리면 잠깐 쉬어라코.'],['토','찍찍! 톡! 이제 쉬어도 돼요?'],['타','그건 토리가 낸 소리다코.'],['토','찍찍! 쉬는 시간은 제가 만들었어요!'],['타','좋은 발명이다코.']],
 [['토','찍찍! 온천 수건을 접었는데 도토리만큼 작아졌어요.'],['타','그건 너무 많이 접었다코.'],['토','찍찍! 주머니에 쏙 들어가요!'],['타','머리에 올리려고 접은 거 아니냐코?'],['토','찍찍… 머리까지 가는 길에 보관 중이에요.']],
 [['타','도치가 제일 따뜻한 돌을 찾았다코.'],['토','찍찍! 어떻게 찾았대요?'],['타','돌마다 잠깐 앉아 봤다코.'],['토','찍찍! 저도 연구할래요!'],['타','방금 연구원이 한 명 더 잠들었다코.']],
 [['토','찍찍! 호두가 나중에 먹을 도토리를 숨겨 뒀대요.'],['타','어디냐코?'],['토','찍찍! 잊어버리려고 온천에 왔대요.'],['타','위치를 잊으면 곤란하다코.'],['토','찍찍! 걱정만 잊고 위치는 기억한대요.']],
 [['타','부엉박사가 물결을 세고 있다코.'],['토','찍찍! 몇 개래요?'],['타','하나 세면 다음 물결이 와서 처음부터 다시라코.'],['토','찍찍! 끝이 없는 숙제네요!'],['타','그래서 숙제가 아니라 구경으로 바꿨다코.']],
 [['토','찍찍! 대나무가 물을 마시고 고개를 숙여요.'],['타','물을 다 모으면 기울어지는 거다코.'],['토','찍찍! 고맙다고 인사하는 줄 알았어요.'],['타','그렇게 봐도 좋다코.'],['토','찍찍! 저도 물 마시고 인사할게요.']],
 [['타','이번 주에 산책은 했냐코?'],['토','찍찍! 따뜻한 자리에서 그늘까지 갔어요.'],['타','거리가 얼마나 되냐코?'],['토','찍찍! 꼬리 하나 반이요.'],['타','작아도 출발은 출발이다코.']],
 [['토','찍찍! 오늘은 별이 물에서도 반짝여요.'],['타','같은 별이 비친 거다코.'],['토','찍찍! 그럼 별은 온천을 두 번 보는 거예요?'],['타','하늘에서 한 번, 물에서 한 번이다코.'],['토','찍찍! 좋은 자리를 두 개나 잡았네요.']],
 [['타','수건이 왜 젖었냐코?'],['토','찍찍! 물결이랑 인사하다가요.'],['타','수건은 물 밖에서 쉬게 해 줘라코.'],['토','찍찍! 수건도 휴가가 필요하군요.'],['타','말리는 동안은 일 안 시킬 거다코.']],
 [['토','찍찍! 책갈피 대신 나뭇잎을 넣었어요.'],['타','책을 어디까지 읽었냐코?'],['토','찍찍! 나뭇잎 모양이 예쁜 데까지요.'],['타','그건 페이지가 아니라 잎을 읽은 거다코.'],['토','찍찍! 오늘은 숲 이야기를 읽었어요.']],
 [['타','쉬고 나면 뭘 할 거냐코?'],['토','찍찍! 시원한 물을 마실 거예요.'],['타','그다음은 뭐냐코?'],['토','찍찍! 수건을 말릴 거예요.'],['타','작은 순서가 있으니 든든하다코.']],
 [['토','찍찍! 구름이 아주 천천히 가요.'],['타','오늘은 바람이 조용하다코.'],['토','찍찍! 구름도 지각해도 괜찮나요?'],['타','구름한테는 출근 시간이 없다코.'],['토','찍찍! 구름이랑 같이 천천히 갈래요.']],
 [['타','이번 주 이야기도 하나 남겨 두자코.'],['토','찍찍! 대단한 일이 없어도 되나요?'],['타','같이 쉬었던 것도 이야기다코.'],['토','찍찍! 그럼 오늘은 따뜻한 물 이야기예요.'],['타','다음 주에도 이어서 듣겠다코.']]
];
MD.weekly=MD_WEEKLY;
let mdPending=null;
function mdDayChk(){
 if(!S.tutDone||tab!=='home'||S.mdDay===todayStr()||mdPending!==null)return;
 const d=todayStr(),g=dayTag(),last=S.mdWeeklyDay,elapsed=last?Math.floor((Date.parse(d+'T12:00:00Z')-Date.parse(last+'T12:00:00Z'))/86400000):7;
 if(!g&&elapsed<7)return;
 mdPending=setTimeout(()=>{mdPending=null;if(tab!=='home'||$('ov').classList.contains('on')||$('bgo')||$('splash')||$('tut')||S.mdDay!==undefined&&S.mdDay===todayStr())return;
 const now=todayStr();if(now!==d)return;
 S.mdDay=now;if(!g){const count=Number.isInteger(S.mdWeeklyCount)?S.mdWeeklyCount:0;mdL=MD_WEEKLY[count%MD_WEEKLY.length];mdI=0;S.mdWeeklyDay=now;S.mdWeeklyCount=count+1;save();mdShow();}else{save();mandam(g.startsWith('hol:')?'hol':g);}
 },1600);
}

function hnSave(){const v=$('hn').value.trim();if(!v){toast('이름을 넣어 주세요');return;}S.hname=v.slice(0,8);save();toast('이름을 저장했어요');}

const BGM=[
{n:'도토리 숲',b:108,r:60,w:'square',ch:[-24,-19,-17,-24],m:[[0,4,7,4,7,12,7,4],[5,9,12,9,17,12,9,5],[7,11,14,11,7,11,14,11],[12,7,4,7,0,4,7,-99]]},
{n:'달빛 굴',b:84,r:57,w:'triangle',ch:[-24,-28,-21,-26],m:[[0,3,7,3,7,12,7,3],[3,0,-4,0,3,7,3,0],[3,7,10,7,3,7,10,7],[5,2,-2,2,5,2,-2,-99]]},
{n:'햄스터 휠',b:132,r:55,w:'square',ch:[-24,-27,-19,-17],m:[[0,4,7,12,7,4,7,4],[7,4,0,4,7,4,0,-3],[5,9,12,9,5,9,12,9],[7,11,14,11,7,11,14,-99]]}];
let bgRun=0,bgTimer,bgG,bgTr,bgStep=0,bgNext=0;
function bgIdx(){return S.bgm>0?S.bgm-1:Math.floor(Date.parse(todayStr()+'T00:00:00Z')/864e5)%BGM.length;}
function bgVol(){if(bgG)bgG.gain.value=(S.vol||0)/100*1.0;}
function bgTone(n,t,d,w,v){const o=AC.createOscillator(),g=AC.createGain();o.type=w;o.frequency.value=440*Math.pow(2,(n-69)/12);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.12*v,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(bgG);o.start(t);o.stop(t+d+.02);}
function bgSched(){while(bgNext<AC.currentTime+.3){if(bgStep%32===0)bgTr=BGM[bgIdx()];const T=bgTr,e=60/T.b/2,i=bgStep%32,bar=i>>3,m=T.m[bar][i%8];
  if(m>-90)bgTone(T.r+m,bgNext,e*.9,T.w,.5);
  if(i%2===0)bgTone(T.r+T.ch[bar]+12+((i/2)%2?7:0),bgNext,e*1.8,'triangle',.9);
  bgNext+=e;bgStep++;}}
function bgStart(){if(!S.bgmOn||bgRun||$('mg')||$('mjroom')||document.querySelector('#bgo.onsen-playing'))return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();}catch(e){return;}
  if(!bgG){bgG=AC.createGain();bgG.connect(AC.destination);}bgVol();bgRun=1;bgStep=0;bgNext=AC.currentTime+.1;bgTimer=setInterval(bgSched,100);}
function bgStop(){bgRun=0;clearInterval(bgTimer);}
function bgSwitch(){if(bgRun)bgStep=0;}
function bgToggle(){S.bgmOn=S.bgmOn?0:1;save();if(S.bgmOn)bgStart();else bgStop();rSet();}
/* 미니게임 중에는 배경음악을 멈추고, 게임을 닫으면 다시 이어서 틀어요 */
['mgOpen','mg2Open','mg3Open','mg4Open','mg5Open','mg6Open','mg7Open','mg8Open','mg9Open'].forEach(n=>{const f=window[n];if(typeof f!=='function')return;window[n]=function(){const r=f.apply(this,arguments);if($('mg')){bgStop();if(bgG)bgG.gain.value=0;try{getSelection().removeAllRanges();}catch(e){}}return r;};});
/* 모든 화면: 기본 복사·선택·이미지 메뉴와 확대 제스처 억제. 입력과 스크롤은 유지. */
const _ed=t=>{const el=t&&(t.nodeType===1?t:t.parentElement);return !!(el&&el.closest&&el.closest('input,textarea,select,[contenteditable]'));};
document.addEventListener('contextmenu',e=>e.preventDefault(),{capture:true,passive:false});
document.addEventListener('dragstart',e=>{if(!_ed(e.target))e.preventDefault();});
document.addEventListener('selectstart',e=>e.preventDefault(),{capture:true,passive:false});
document.addEventListener('copy',e=>e.preventDefault(),{capture:true,passive:false});
['gesturestart','gesturechange','gestureend'].forEach(n=>document.addEventListener(n,e=>e.preventDefault(),{capture:true,passive:false}));
// iOS treats native touch defaults separately from pointer events. Games use pointer input.
['touchstart','touchend'].forEach(n=>document.addEventListener(n,e=>{if(e.target.closest&&e.target.closest('#mg canvas'))e.preventDefault();},{capture:true,passive:false}));
document.addEventListener('touchstart',e=>{if(e.touches&&e.touches.length>1)e.preventDefault();if(!_ed(e.target)){const selection=window.getSelection();if(selection&&!selection.isCollapsed)selection.removeAllRanges();}},{capture:true,passive:false});
document.addEventListener('touchmove',e=>{if(e.touches&&e.touches.length>1)e.preventDefault();},{passive:false});
document.addEventListener('dblclick',e=>e.preventDefault());
document.addEventListener('wheel',e=>{if(e.ctrlKey)e.preventDefault();},{passive:false});
(function(){const f=window.mgClose;if(typeof f!=='function')return;window.mgClose=function(){const r=f.apply(this,arguments);bgStart();return r;};})();
document.addEventListener('click',bgStart);
/* v1.2.5: 앱을 위로 밀어 끌 때 '띵' 소리 — 배경음악은 0.3초 앞의 음까지 미리 예약해 둬서, 일시정지(suspend)만 하면
   예약된 음이 남아 있다가 앱이 꺼지는 순간 새어 나왔어요. 숨겨질 때 소리를 바로 0으로 하고 예약된 음을 끊어요 */
function acHush(){bgStop();if(!AC)return;try{if(bgG){bgG.gain.cancelScheduledValues(0);bgG.gain.setValueAtTime(0,AC.currentTime);bgG.disconnect();bgG=null;}}catch(e){}try{AC.suspend();}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(!AC)return;if(document.hidden)acHush();else{AC.resume();bgStart();}});addEventListener('pagehide',acHush);
function resetAll(){askOk('모든 기록이 지워져요. 초기화할까요?',()=>askOk('정말 정말이에요? 직전 상태 한 번은 설정에서 되돌릴 수 있어요.',()=>{snapSave();S=defaults();fix();save();toast('초기화했어요');go('home');}));}
let cPage=0;const cDead=c=>(+c.qty||0)<=0||expired(c);
function cPg(d){cPage+=d;rCoupon();window.scrollTo(0,0);}
const GM=["좋은 아침! 물부터 한 잔 어때? 💧","찍찍! 오늘도 진우가 제일 먼저 생각났어 🌰","일어났어? 도토리 향기 나는 아침이야 🐹","기지개 쭈욱~ 진우도 같이 해 볼래?","오늘 아침 해바라기씨가 유난히 고소해!","아침 먹었어? 토리는 도토리 한 알 먹었지롱 🌰","오늘도 진우의 하루를 응원하러 왔어!","쳇바퀴 열 바퀴 뛰고 왔더니 상쾌해! 진우는 어때?","잘 잤어? 토리는 꿈에서 도토리 산을 봤어 ⭐","오늘은 어떤 좋은 일이 생길까? 토리는 두근두근!","아직 졸려도 괜찮아. 토리도 하품 중이야 😴","볼주머니에 아침 응원을 가득 담아 왔어!","오늘 기타 한 곡 어때? 토리가 관객 할게 🎸","오늘의 퀘스트를 확인해 볼까? 📜"];
const GD=["볼주머니에 도토리 가득! 🐹","냠냠, 도토리 최고야! 진우는 간식 먹었어? 🌰","점심은 잘 챙겨 먹었어? 토리는 해바라기씨 냠냠","오후엔 살짝 졸리지? 토리랑 기지개 켜자!","쳇바퀴 돌리다가 진우 생각났어 🐹","도토리 껍질 까는 소리, 들려? 사각사각!","오늘 하루 절반 왔어! 진우 정말 잘하고 있어 ⭐","잠깐 쉬어 가도 괜찮아. 토리가 옆에서 지켜볼게","토리 볼이 빵빵한 건 진우 응원이 가득해서야!","물 마셨어? 안 마셨으면 지금 한 모금! 💧","기타 소리가 듣고 싶은 오후야 🎸","햇살 좋은 날엔 굴 밖에서 도토리 굴리기가 제일이야","간식 시간! 토리는 도토리, 진우는 뭐 먹어? 🍪","토리는 진우 편이야. 오늘도, 내일도!"];
const GE=["오늘도 수고했어! 토리가 쓰담쓰담 해 줄게 🐹","저녁 맛있게 먹었어? 토리는 도토리 저녁 🌰","하루가 길었지? 이제 편하게 쉬어도 돼","달이 떴어. 토리랑 별 구경할래? 🌙","밤엔 잔잔한 기타 연주가 좋아 🎸","토리는 굴속에서 도토리 세는 중… 하나, 둘, 셋…","오늘 진우가 한 일, 토리는 다 알고 있어. 대단해! ⭐","따뜻한 물에 샤워하고 푹 쉬자!","볼주머니에 내일 응원도 미리 넣어 뒀어!","오늘 하루 어땠는지 토리한테 얘기해 줄래?","쳇바퀴는 오늘 여기까지! 진우도 이제 쉬어","오늘 못 한 건 내일의 진우에게 맡기자 🌙","야식 생각나지? 토리도 그래. 조금만 먹자 🍗","내일도 토리가 도토리 까먹고 기다릴게!"];
const SL=[["벚꽃 잎이 굴 앞까지 날아왔어! 🌸","봄바람이 살랑살랑~ 산책 가고 싶다","새싹이 쑥쑥! 진우의 하루도 쑥쑥 자라는 중 🌸","봄비 오는 날엔 굴속이 아늑해 ☔","따뜻해서 졸려… 토리 낮잠 자도 될까?","꽃향기 맡으며 도토리 냠냠 🌰"],["더워서 쳇바퀴도 살살 돌려야겠어 ☀","수박 먹고 싶다! 진우도 시원한 거 마셔 🍉","장마철엔 굴속에서 기타 소리 듣기 딱이야 ☔","매미 소리가 시끌시끌! 토리 귀가 쫑긋","시원한 물 많이 마시기! 토리도 홀짝홀짝 💧","여름밤엔 별이 더 반짝여 ⭐"],["도토리가 주렁주렁! 토리는 신나 🌰","단풍이 예쁘게 물들었어 🍁","가을바람 시원~ 산책하기 딱 좋은 날이야","낙엽 밟는 소리 사각사각, 재밌다! 🍁","토리는 겨울 준비로 도토리 모으는 중이야","가을밤엔 기타 소리가 더 잘 어울려 🎸"],["눈이 오면 토리는 굴속에서 도토리 까먹기 ❄","추운 날엔 따뜻하게 입고 나가! 감기 조심","따끈한 국물이 생각나는 날이야 🍚","창밖에 눈송이가 폴폴 ❄","이불 속에서 토리랑 꼼지락 🌙","겨울엔 도토리가 더 고소해! 🌰"]];
function greet(){const h=kst().getUTCHours(),n=hn();
  if(isBday())return n+': 찍찍! 오늘은 진우의 생일이야! 🎂';
  {const hd=allHol().find(h=>holNext(h)===todayStr());if(hd)return n+': '+(HB[hd[0]]||'오늘은 '+hd[2]+'이야! 좋은 하루 보내 '+hd[1]);}
  {const sc=(S.sched||[]).find(s=>s.date===todayStr());if(sc)return n+': 오늘은 「'+sc.name+'」'+(sc.time?' '+sc.time+'에':'')+' 있는 날이야! 잊지 마 🗓';}
  if(mood()[1]!=='sleep'){const s=tState().st;if(s==='down')return n+': 쓰러질 것 같아… 운동 좀 시켜줘… 😵';if(s==='buff')return n+': 근육 빵빵! 오늘도 몸짱 토리야 💪';}
  {const td=todayStr(),ks=Object.keys(ACT),a0=ks.find(k=>S.actNext[k]===td),a1=ks.find(k=>S.actNext[k]&&dAgo(td,S.actNext[k])===1);
  if(a0)return n+': 오늘은 '+ACT[a0][3]+' 날이야! 잘 다녀와, 응원할게 🐹';if(a1)return n+': 내일은 '+ACT[a1][3]+' 날이지? 준비 잘 해 두자 ⭐';}
  const md=mood();if(md[1]==='sleep')return n+': 쿨쿨… 내일 또 놀자 🌙';if(AWAY>=2)return n+': 보고 싶었어! '+AWAY+'일 만이야 🌰';{const m=memPick();if(m)return n+': '+m.say;}
  const a=(h<11?GM:h<18?GD:GE).concat(SL[seasonOf()]),d=Math.floor(Date.parse(todayStr()+'T00:00:00Z')/864e5);return n+': '+a[d%a.length];}
/* ---------- 토리의 기억 (v4.6): 앱에 남긴 기록을 보고 토리가 먼저 말을 걸어요. 외부 AI 없이 기록만 봐요 ----------
   최근 3일 기록(마작·보드게임·밴드·운동·장소·일기)과 딱 1주 전 기록에서 골라요. 대화에서 답하면 다음 기억으로 넘어가요 */
const memCut=(s,n)=>{s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n)+'…':s;};
const memDay=d=>{const n=dAgo(d,todayStr());return n===0?'오늘':n===1?'어제':n===2?'그저께':n===7?'지난주 이맘때':'';};
const MEM_A={mj:[['재밌었어','찍찍! 진우가 즐거웠으면 토리도 신나요 🀄'],['아쉬웠어','찍찍… 다음 판은 진우 거예요! 토리가 응원할게요 📣'],['또 하고 싶어','찍찍! 다음 마작 날을 적어 두면 토리가 기억해 둘게요 📅']],
 bg:[['재밌었어','찍찍! 토리도 다음엔 옆에서 구경할래요 🎲'],['어려웠어','찍찍~ 처음엔 다 어려워요. 두 판째부터 진짜예요!'],['또 할 거야','찍찍! 그럼 도토리 걸고 한 판 해요? 🌰']],
 band:[['손가락 아파','찍찍… 손 꼭 풀어 주세요. 토리가 호호 불어 줄게요'],['재밌었어','찍찍! 합주실의 별은 역시 진우예요 🎸'],['다음 곡 연습할 거야','찍찍! 완성되면 토리한테 제일 먼저 들려줘요 🎵']],
 ex:[['뿌듯해','찍찍! 근육이 박수 치고 있어요 💪'],['힘들었어','찍찍… 그래도 해낸 진우가 최고예요. 오늘은 푹 쉬어요'],['오늘도 할 거야','찍찍!! 토리도 쳇바퀴 같이 돌게요 🏃']],
 pl:[['또 가고 싶어','찍찍! 다음엔 토리 몫 간식도 챙겨 줘요 🍪'],['별로였어','찍찍~ 그럼 다음엔 더 좋은 데 찾아봐요 📍'],['같이 가자','찍찍!! 볼주머니에 쏙 들어가서 따라갈게요 🐹']],
 dy:[['좋아졌어','찍찍! 다행이에요. 토리가 계속 옆에 있을게요 🌰'],['그냥 그래','찍찍… 그런 날도 있어요. 따뜻한 거 하나 먹어요'],['토리가 있어서 괜찮아','찍찍!! 토리도 진우가 있어서 괜찮아요 ❤']],
 wk:[['이번 주도 해','찍찍! 토리가 달력에 동그라미 쳐 둘게요 📅'],['이번 주는 쉬어','찍찍~ 쉬는 것도 중요해요. 푹 쉬어요 🛋️'],['기억하고 있었어?','찍찍! 토리는 진우 일이라면 다 기억해요 ⭐']]};
function memList(){const t=todayStr(),L=[];
  ['mj','bg','band','ex'].forEach(k=>(S.act[k]||[]).forEach(e=>{const n=dAgo(e.date,t);if(n<0||n>7||(n>2&&n<7))return;const dl=memDay(e.date);let s;
    if(n===7)s=dl+' '+ACT[k][0]+' 했었지? 이번 주도 할 거야? '+ACT[k][1];
    else if(k==='mj')s=e.rank===1?dl+' 마작 1등 했지? 역시 진우야! 🀄':e.rank===4?dl+' 마작은 좀 아쉬웠지? 그래도 재밌었으면 됐어 🀄':e.rank?dl+' 마작 '+e.rank+'등이었지? 다음엔 1등이다! 🀄':dl+' 마작했지? 재밌었어? 🀄';
    else if(k==='bg')s=e.game?(e.nw?dl+' 처음 해 본 「'+memCut(e.game,12)+'」, 어땠어? 🎲':dl+' 「'+memCut(e.game,12)+'」 했지? 또 하고 싶어? 🎲'):dl+' 보드게임 했지? 누가 이겼어? 🎲';
    else if(k==='band')s=dl+' 합주했지?'+(e.min?' '+e.min+'분이나!':'')+' 손가락 괜찮아? 🎸';
    else s=dl+' '+((e.t&&e.t!=='기타'?e.t:'운동')+(e.min?' '+e.min+'분 ':(e.t&&e.t!=='기타'?' ':'')))+'했지? 멋져! 💪';
    L.push({k:k+':'+e.id,n,c:n===7?'wk':k,say:s});
    if(n<=2&&e.pride&&!e.q)L.push({k:k+'p:'+e.id,n:n+.5,c:k,say:dl+' 「'+memCut(e.pride,16)+'」라고 적었지? 토리가 다 봤어 ⭐'});}));
  (S.places||[]).forEach(p=>{const n=p.date?dAgo(p.date,t):-1;if(n<0||n>2)return;const dl=memDay(p.date);
    L.push({k:'pl:'+p.id,n,c:'pl',say:p.stars>=4?dl+' 「'+memCut(p.name,12)+'」 다녀왔지? 별 '+p.stars+'개! 또 가자 📍':p.stars&&p.stars<=2?dl+' 「'+memCut(p.name,12)+'」는 좀 별로였지? 다음엔 더 좋은 데 가자 📍':dl+' 「'+memCut(p.name,12)+'」 다녀왔지? 어땠어? 📍'});});
  (S.diary||[]).forEach(x=>{const n=dAgo(x.d,t);if(n!==1&&n!==2)return;L.push({k:'dy:'+x.d,n:n+.2,c:'dy',say:memDay(x.d)+' 일기에 「'+memCut(x.t,16)+'」라고 썼더라. 오늘은 좀 어때? 📖'});});
  const seen=S.memSeen||[];return L.filter(m=>!seen.includes(m.k)).sort((a,b)=>a.n-b.n);}
function memPick(){const L=memList();return L.length?L[0]:null;}
function memSeen(k){if(!Array.isArray(S.memSeen))S.memSeen=[];if(!S.memSeen.includes(k))S.memSeen=[...S.memSeen,k].slice(-80);save();}
function memChat(m){return ['찍찍! '+m.say,MEM_A[m.c]||MEM_A.wk,m.k];}
/* ===== 운동 · 취미 밸런스 & 토리 상태 (기준 숫자는 BAL에서만 바꾸면 돼요) ===== */
const EXT=['헬스','러닝','걷기','기타'],HOB=['mj','bg','band'];
const BAL={down:3,fit:2,buff:4,balEx:3,balHob:2,bonus:1,grace:7};
/* 토리 그림(TORI_IMG)과 앨범 사진(PH)은 data/photos.js 로 옮겼어요 (가로 720 x 세로 1290, 9:16 비율) */

const addD=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const dset=(ks,a,b)=>new Set(ks.flatMap(k=>S.act[k].filter(e=>e.date>=a&&e.date<=b).map(e=>e.date)));
function tState(t){t=t||todayStr();const a=addD(t,-6),ex=dset(['ex'],a,t),rest=new Set(S.exRest),hob=[...dset(HOB,a,t)].filter(d=>!rest.has(d));
  const e=ex.size,h=hob.length,grace=dAgo(S.exStart,t)<BAL.grace;let st='ok';
  if(e===0&&h>=BAL.down&&!grace)st='down';else if(e>=BAL.buff)st='buff';else if(e>=BAL.fit)st='fit';
  return {st,e,h,bal:e>=BAL.balEx&&h>=BAL.balHob};}
/* ===== 상황별 토리 그림 (우선순위: 반응 3초 > 잠 > 생일 > 쓰러짐 > 밴드5회 > 일정 당일 > 몸짱 > 슬픔 > 배고픔 > 볼빵빵 > 기본) ===== */
const NYE_YEAR='2026';   /* h-nye 그림에 '2027'이 적혀 있어서 이 해 12/31에만 써요. 내년에 쓰려면 새 그림으로 바꾸고 이 값도 바꿔요 */
const TI_NOACC=new Set(['h_xme','h_xma','h_xmp','h_sak1','h_sak2','h_gin','tired','sulk','h_nye','sea1a','sea2a','sea3a','sea3b','sleep','bday','pat','ex','mj','bg','band3','sad','sad2']);
let RX=null,RXT=0,patS={n:0,t:0};
const dayNo=()=>Math.floor(Date.parse(todayStr()+'T00:00:00Z')/864e5);
function fedToday(){return !!S.lastFeed&&new Date(S.lastFeed+9*36e5).toISOString().slice(0,10)===todayStr();}
function heroKey(){
  const now=Date.now();if(RX&&now<RX.t)return RX.k;
  if(heroPhOk())return 'ph:'+S.heroPh;   /* v1.2.5: 앨범 사진을 홈 사진으로 골랐으면 늘 그 사진(밥 줄 때 같은 잠깐 반응만 먼저) */
  const md=mood()[1];if(md==='sleep')return todayStr().slice(5)==='12-24'?'h_xme':'sleep';
  if(isBday())return 'bday';
  const t0=todayStr();{const hd=HOL.find(h=>!(S.holOff||{})[h[0]]&&TORI_IMG['h_'+h[0]]&&holNext(h)===t0);if(hd)return 'h_'+hd[0];}
  {const md5=t0.slice(5);if(md5==='12-23')return 'h_gin';if(md5>='04-01'&&md5<='04-07')return dayNo()%2?'h_sak1':'h_sak2';if(md5==='12-24')return 'h_xme';if(md5==='12-25')return kst().getUTCHours()<12?'h_xma':'h_xmp';if(md5==='12-31'&&t0.slice(0,4)===NYE_YEAR)return 'h_nye';if(md5==='10-31')return 'h_hal';}
  {const mo=+t0.slice(5,7),dd=+t0.slice(8,10);if(mo%3===0&&dd<=2)return 'sea'+seasonOf(mo)+(dd===1?'a':'b');}
  const st=tState().st;if(st==='down')return 'down';
  const td=todayStr();if(S.bandStar===td)return 'band3';
  const a=Object.keys(ACT).find(k=>S.actNext[k]===td);if(a)return a;
  if(hobStreak3())return 'tired';
  if(st==='buff')return 'buff';
  if(!fedToday()){if(AWAY>=5)return 'sad2';if(AWAY>=2)return 'sad';}
  if(S.lastFeed&&(now-S.lastFeed)/36e5>48)return 'sad2';
  if(md==='hungry')return 'hungry';
  if(md==='full')return 'full';
  return 'normal';}
function hobStreak3(){const t=todayStr(),ds=dset(HOB,addD(t,-2),t);return ds.has(t)&&ds.has(addD(t,-1))&&ds.has(addD(t,-2));}
const heroPhOk=()=>!!(S.heroPh&&PH[S.heroPh]&&(S.album||[]).includes(S.heroPh));
function toriSrc(k){if(k&&k.startsWith('ph:')&&PH[k.slice(3)])return PH[k.slice(3)][2];const v=TORI_IMG[k]||HERO;return Array.isArray(v)?v[dayNo()%v.length]:v;}
const heroDim=k=>k==='h_xme'&&mood()[1]==='sleep'?' night':'';   /* 이브 밤(23~6시)엔 크리스마스 그림을 그대로 두고 자는 것처럼 어둡게 */
function heroFlag(k){return (TI_NOACC.has(k)||k.startsWith('ph:')?' noacc':'')+(k==='band'?' noguitar':'')+(liveOk(k)?' live':'');}
function heroSync(){const c=document.querySelector('#s-home .hero');if(!c)return;const im=c.querySelector('img.timg'),k=heroKey();c.querySelectorAll('.hero-out').forEach(e=>e.remove());let outgoing=null;if(im.getAttribute('src')!==toriSrc(k)&&!reduceMo()){outgoing=document.createElement('div');outgoing.className='hero-out';outgoing.appendChild(im.cloneNode(true));const live=c.querySelector('.tlive');if(live)outgoing.appendChild(live.cloneNode(true));}
  c.className='card hero s-'+tState().st+heroFlag(k);im.className='timg'+heroDim(k);im.src=toriSrc(k);c.querySelectorAll('.tlive,.tfill').forEach(x=>x.remove());(c.querySelector('.deco.bk')||im).insertAdjacentHTML('afterend',liveHtml(k));if(outgoing){c.appendChild(outgoing);setTimeout(()=>outgoing.remove(),260);}}
/* ---------- 살아 있는 토리 ----------
   토리가 가운데 앉은 그림에서만 움직여요(누운·자는·운동·쓰다듬기 그림 등은 그대로).
   눈 위치는 그림을 처음 볼 때 자동으로 찾고, 못 찾으면 깜빡이지 않아요. */
const LIVE_OFF=new Set(['down','ex','sleep','sulk','tired','pat','h_xmp']);
const reduceMo=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}};
function liveOk(k){return !LIVE_OFF.has(k)&&!k.startsWith('ph:')&&!heroDim(k)&&!reduceMo();}
function liveHtml(k){return liveOk(k)?'<div class="tlive" aria-hidden="true"><img alt=""></div>':'';}
/* 토리 윗몸 오려 내기: 진한 테두리선 안쪽을 토리 얼굴 쪽에서부터 칠해 나가 토리만 남겨요(그림마다 한 번만, 결과는 기억).
   잘 안 오려지면(너무 크거나 작으면) 그 그림에서는 움직이지 않아요. */
const CUTS={},FILLS={},CUT_Y=[.5,.66],AP=6;   /* v6.7: .6→.66 까지 찾아서 도토리 쥔 손 아래(배)에서 자르게 — 손을 지나 자르면 숨 쉴 때 손이 늘어나 보였어요 */
function cutOf(im){const src=im.currentSrc||im.src;if(src in CUTS)return CUTS[src];if(!im.complete||!im.naturalWidth)return undefined;CUTS[src]=null;
  try{const W=im.naturalWidth,H=im.naturalHeight,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);
    const x0=Math.round(W*.15),x1=Math.round(W*.9),y0=Math.round(H*.3);
    /* 자를 가로줄 고르기: 위아래 줄이 가장 비슷한(무늬·테두리가 없는) 줄에서 잘라야, 움직일 때 그 줄을 늘려도 티가 안 나요 */
    /* v1.2.5: 위아래 한 줄만 보면 도토리 한가운데(위아래로 매끈한 곳)에서 잘려 숨 쉴 때 도토리가 늘어나 보였어요.
       올라가는 높이(뛸 때 1.5칸)만큼 위아래가 모두 밋밋하고, 손·발 테두리(진한 선)를 지나지 않는 줄(배)을 골라요. 비슷하면 아래쪽(쥔 물건까지 함께 움직이게) */
    const B=Math.ceil(AP*1.5)+2,L0=Math.round(H*CUT_Y[0])-B,L=g.getImageData(x0,L0,x1-x0,Math.round(H*(CUT_Y[1]-CUT_Y[0]))+2*B).data,lw=x1-x0,lum=(r,x)=>{const i=(r*lw+x)*4;return .3*L[i]+.59*L[i+1]+.11*L[i+2];};
    let br=B,bs=1e18;for(let r=B;r<L.length/4/lw-B;r++){let s=0;for(let x=0;x<lw;x+=2){const v=lum(r,x);if(v<90)s+=400;for(let j=1;j<=B;j++)s+=Math.abs(v-lum(r+j,x))+Math.abs(v-lum(r-j,x))*.5;}s*=1+.5*(L.length/4/lw-B-r)/(L.length/4/lw-2*B);if(s<bs){bs=s;br=r;}}
    const y1=L0+br+1,w=x1-x0,h=y1-y0,d=g.getImageData(x0,y0,w,h).data,N=w*h;
    const dk=new Uint8Array(N),wall=new Uint8Array(N),m=new Uint8Array(N);
    for(let i=0;i<N;i++)dk[i]=(.3*d[i*4]+.59*d[i*4+1]+.11*d[i*4+2])<90?1:0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){let k=0;for(let dy=-1;dy<=1&&!k;dy++)for(let dx=-1;dx<=1;dx++){const yy=y+dy,xx=x+dx;if(yy>=0&&yy<h&&xx>=0&&xx<w&&dk[yy*w+xx]){k=1;break;}}wall[y*w+x]=k;}
    let sx=Math.round(W*.53)-x0,sy=Math.round(H*.5)-y0,best=-1,bd=1e9;
    for(let y=Math.max(0,sy-40);y<Math.min(h,sy+40);y++)for(let x=Math.max(0,sx-40);x<Math.min(w,sx+40);x++){const q=(x-sx)**2+(y-sy)**2;if(!wall[y*w+x]&&q<bd){bd=q;best=y*w+x;}}
    if(best<0)return null;
    const st=[best];m[best]=1;let n=0;while(st.length){const p=st.pop(),px=p%w;n++;
      if(px>0&&!m[p-1]&&!wall[p-1]){m[p-1]=1;st.push(p-1);}if(px<w-1&&!m[p+1]&&!wall[p+1]){m[p+1]=1;st.push(p+1);}
      if(p>=w&&!m[p-w]&&!wall[p-w]){m[p-w]=1;st.push(p-w);}if(p<N-w&&!m[p+w]&&!wall[p+w]){m[p+w]=1;st.push(p+w);}}
    if(n<W*H*.03||n>W*H*.17)return null;
    /* 구멍(눈·입·도토리 등) 메우기: 바깥에서 칠해서 닿지 않은 곳은 토리 */
    const out=new Uint8Array(N),os=[];for(let x=0;x<w;x++){os.push(x,N-w+x);}for(let y=0;y<h;y++){os.push(y*w,y*w+w-1);}
    for(const p of os)if(!m[p]&&!out[p])out[p]=1;
    while(os.length){const p=os.pop();if(m[p])continue;const px=p%w;for(const q of [px>0?p-1:-1,px<w-1?p+1:-1,p>=w?p-w:-1,p<N-w?p+w:-1])if(q>=0&&!m[q]&&!out[q]){out[q]=1;os.push(q);}}
    /* 테두리선까지 포함하도록 4px 넓히기 */
    const r=4,a=new Uint8Array(N),b=new Uint8Array(N);
    for(let y=0;y<h;y++){let last=-1e9;for(let x=0;x<w;x++){if(!out[y*w+x])last=x;a[y*w+x]=x-last<=r;}last=1e9;for(let x=w-1;x>=0;x--){if(!out[y*w+x])last=x;if(last-x<=r)a[y*w+x]=1;}}
    for(let x=0;x<w;x++){let last=-1e9;for(let y=0;y<h;y++){if(a[y*w+x])last=y;b[y*w+x]=y-last<=r;}last=1e9;for(let y=h-1;y>=0;y--){if(a[y*w+x])last=y;if(last-y<=r)b[y*w+x]=1;}}
    const o=g.createImageData(w,h);for(let i=0;i<N;i++)if(b[i]){o.data[i*4]=d[i*4];o.data[i*4+1]=d[i*4+1];o.data[i*4+2]=d[i*4+2];o.data[i*4+3]=255;}
    /* 볼 아래 메우기: 토리가 위로 올라가면 원래 그림의 볼 테두리가 아래에 남아 두 줄로 보여요.
       아래쪽 테두리(잘린 선 제외) 바로 위 띠를 그 아래 배경으로 채운 고정 겹(.tfill)을 깔아 가려요 */
    const F=AP*2,full=g.getImageData(0,0,W,H).data,fo=g.createImageData(w,h);
    for(let x=0;x<w;x++)for(let y=0;y<h-1;y++){if(!b[y*w+x]||b[(y+1)*w+x])continue;let top=y;while(top>0&&b[(top-1)*w+x])top--;
      for(let j=0;j<F&&y-j>=top;j++){const sy=Math.min(H-1,y0+y+1+j),s=(sy*W+x0+x)*4,t=((y-j)*w+x)*4;fo.data[t]=full[s];fo.data[t+1]=full[s+1];fo.data[t+2]=full[s+2];fo.data[t+3]=255;}}
    /* 잘린 선(가로줄)에 걸친 칸: 올라간 만큼 생기는 틈에 원래 그림이 다시 보이면 볼털·손이 두 번 보여요.
       잘린 선 바로 위 한 줄을 틈만큼 반복해 깔아서, 몸이 한 칸 늘어난 것처럼 이어 보이게 해요 */
    for(let x=0;x<w;x++){if(!b[(h-1)*w+x]||out[(h-1)*w+x])continue;const s=((h-1)*w+x)*4;
      for(let j=0;j<F&&b[(h-1-j)*w+x];j++){const t=((h-1-j)*w+x)*4;fo.data[t]=d[s];fo.data[t+1]=d[s+1];fo.data[t+2]=d[s+2];fo.data[t+3]=255;}}
    g.clearRect(0,0,W,H);g.putImageData(fo,x0,y0);FILLS[src]=cv.toDataURL('image/png');
    g.clearRect(0,0,W,H);g.putImageData(o,x0,y0);CUTS[src]=cv.toDataURL('image/png');
  }catch(e){CUTS[src]=null;}
  return CUTS[src];}
function liveCut(c,t){const ti=t.querySelector('img');if(ti.getAttribute('src'))return true;const im=c.querySelector('.timg'),u=cutOf(im);
  if(u===undefined)return false;if(!u){t.remove();c.classList.remove('live');return false;}ti.src=u;const fs=FILLS[im.currentSrc||im.src];if(fs&&!c.querySelector('.tfill'))t.insertAdjacentHTML('beforebegin','<img class="tfill" alt="" aria-hidden="true" src="'+fs+'">');liveAp(c);return true;}
function liveAp(c){const im=c.querySelector('.timg');if(!im||!im.naturalWidth||!im.clientWidth)return;const sc=Math.max(im.clientWidth/im.naturalWidth,im.clientHeight/im.naturalHeight),dp=devicePixelRatio||1;
  c.style.setProperty('--ap',Math.max(1,Math.round(AP*sc*dp))/dp+'px');}
const EYES={};
function eyesOf(im){const src=im.currentSrc||im.src;if(src in EYES)return EYES[src];if(!im.complete||!im.naturalWidth)return null;let r=null;
  try{const W=im.naturalWidth,H=im.naturalHeight,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);
    const x0=Math.round(W*.38),y0=Math.round(H*.39),w=Math.round(W*.78)-x0,h=Math.round(H*.53)-y0,d=g.getImageData(x0,y0,w,h).data,dk=new Uint8Array(w*h),seen=new Uint8Array(w*h),cs=[];
    for(let i=0;i<w*h;i++)dk[i]=(.3*d[i*4]+.59*d[i*4+1]+.11*d[i*4+2])<70?1:0;
    for(let i=0;i<w*h;i++){if(!dk[i]||seen[i])continue;const st=[i];let n=0,mx=1e9,Mx=-1,my=1e9,My=-1;seen[i]=1;
      while(st.length){const p=st.pop(),px=p%w,py=(p-px)/w;n++;if(px<mx)mx=px;if(px>Mx)Mx=px;if(py<my)my=py;if(py>My)My=py;
        for(const q of [p-1,p+1,p-w,p+w]){if(q<0||q>=w*h||seen[q]||!dk[q]||Math.abs(q%w-px)>1)continue;seen[q]=1;st.push(q);}}
      const bw=Mx-mx+1,bh=My-my+1;if(n>=80&&n<=4000&&bw/bh>.35&&bw/bh<2.2&&n/(bw*bh)>.4)cs.push({x:mx+x0,y:my+y0,w:bw,h:bh,n});}
    let best=null;for(let a=0;a<cs.length;a++)for(let b=a+1;b<cs.length;b++){const A=cs[a],B=cs[b],dx=Math.abs(A.x+A.w/2-B.x-B.w/2)/W,dy=Math.abs(A.y+A.h/2-B.y-B.h/2)/H;
      if(dy<.015&&dx>.09&&dx<.22&&Math.max(A.n,B.n)/Math.min(A.n,B.n)<2.2&&(!best||A.n+B.n>best.n))best={n:A.n+B.n,e:[A,B]};}
    if(best){const fur=e=>{const y1=Math.max(0,Math.round(e.y-e.h*.9)),hh=Math.max(2,Math.round(e.h*.6)),q=g.getImageData(e.x,y1,e.w,hh).data,c=[[],[],[]];
        for(let i=0;i<q.length;i+=4){c[0].push(q[i]);c[1].push(q[i+1]);c[2].push(q[i+2]);}return 'rgb('+c.map(v=>v.sort((a,b)=>a-b)[v.length>>1]).join(',')+')';};
      r={W,H,e:best.e.map(e=>({x:e.x,y:e.y,w:e.w,h:e.h,c:fur(e)}))};}
  }catch(e){r=null;}
  EYES[src]=r;return r;}
function liveLids(t){const im=t.parentNode.querySelector('.timg'),E=eyesOf(im);if(!E)return false;if(t.querySelector('.lid'))return true;
  const cw=im.clientWidth,ch=im.clientHeight;if(!cw||!ch)return false;const sc=Math.max(cw/E.W,ch/E.H),ox=(cw-E.W*sc)/2,oy=(ch-E.H*sc)/2;
  for(const e of E.e){const p=Math.max(1,e.w*.12),el=document.createElement('i');el.className='lid';
    el.style.cssText=`left:${ox+(e.x-p)*sc}px;top:${oy+(e.y-p)*sc}px;width:${(e.w+2*p)*sc}px;height:${(e.h+2*p)*sc}px;background:${e.c}`;t.appendChild(el);}
  return true;}
let liveNx={b:0,h:0};
function liveTick(){if(document.hidden||tab!=='home'||reduceMo())return;const c=document.querySelector('#s-home .hero'),t=c&&c.querySelector('.tlive');if(!t||!liveCut(c,t))return;const now=Date.now();
  if(!liveNx.b)liveNx={b:now+2500,h:now+9000};
  if(now>=liveNx.b){liveNx.b=now+3000+Math.random()*3500;if(liveLids(t)){const blink=()=>{t.classList.add('shut');setTimeout(()=>t.classList.remove('shut'),130);};blink();if(Math.random()<.25)setTimeout(blink,300);}}
  if(now>=liveNx.h){liveNx.h=now+10000+Math.random()*8000;c.classList.remove('hop');void c.offsetWidth;c.classList.add('hop');setTimeout(()=>c.classList.remove('hop'),800);}}
setInterval(liveTick,250);addEventListener('resize',()=>{document.querySelectorAll('.tlive .lid').forEach(l=>l.remove());document.querySelectorAll('.hero.live').forEach(liveAp);});
function rxPopClose(i){if(!i||i.classList.contains('rx-leaving'))return;i.removeAttribute('id');i.classList.add('rx-leaving');
  i.addEventListener('animationend',e=>{if(e.target===i&&e.animationName==='rxExit')i.remove();});setTimeout(()=>i.remove(),280);}
function rxPop(k,ms){const o=document.querySelector('.rx-popup:not(.rx-leaving)');if(o)rxPopClose(o);const i=document.createElement('img');i.id='rxp';i.className='rx-popup';i.src=toriSrc(k);document.body.appendChild(i);setTimeout(()=>rxPopClose(i),ms||3000);}
function rx(k,ms){ms=ms||3000;if(mood()[1]==='sleep')return;if(k==='acorn')setTimeout(heroSync,60500);RX={k,t:Date.now()+ms};clearTimeout(RXT);RXT=setTimeout(()=>{RX=null;heroSync();},ms);if(tab==='home')heroSync();else rxPop(k,ms);}
function starChk(k,d){if(k==='band'&&d===todayStr()&&S.act.band.length%5===0)S.bandStar=d;}
const avCls=()=>tState().st==='down'?'st-down':'';
function stHtml(){const s=tState().st;if(s==='ok'||TORI_IMG[s])return '';
  return s==='down'?'<span class="stx" style="left:38%;top:20%">💫</span><span class="stx" style="left:58%;top:30%;animation-delay:.5s">💦</span>'
   :s==='buff'?'<span class="stx" style="left:10%;top:14%">✨</span><span class="stx" style="right:10%;top:16%">💪</span>'
   :'<span class="stx" style="right:10%;top:16%">🏋️</span>';}
function stLine(){const T=tState(),L={down:'😵 쓰러졌어요! 운동을 한 번만 기록해도 일어나요',fit:'🏋️ 튼튼해지는 중',buff:'🏆 몸짱 토리!',ok:'🐹 보통 상태'};
  return `<div class="muted">${L[T.st]}${T.bal?' · ⚖️ 밸런스 달성':''}</div>`;}
function balCard(){const T=tState(),bar=(v,c)=>`<div class="bar" style="height:10px;margin:2px 0 8px"><i style="width:${Math.min(7,v)/7*100}%;background:${c}"></i></div>`;
  return `<div class="card"><h2>⚖️ 최근 7일 밸런스</h2><div class="row sp"><span>💪 운동 <b class="qty">${T.e}일</b></span><span>🎲 취미 <b class="qty">${T.h}일</b></span></div>${bar(T.e,'#5f8f3e')}${bar(T.h,'#c9852c')}${stLine()}${T.st==='down'?'<div class="muted">취미만 하고 운동을 안 했어요. 가볍게 걷기만 해도 돼요!</div>':''}</div>`;}
function exExtra(L){const t=todayStr(),ym=t.slice(0,7),ds=new Set(L.map(e=>e.date));let n=0,d=ds.has(t)?t:addD(t,-1);while(ds.has(d)){n++;d=addD(d,-1);}
  const mo=[...ds].filter(x=>x.slice(0,7)===ym).length,mins=L.reduce((a,e)=>a+(+e.min||0),0),bar=(v,c)=>`<div class="bar" style="height:10px;margin:2px 0"><i style="width:${v/7*100}%;background:${c}"></i></div>`;
  const wk=[3,2,1,0].map(i=>{const b=addD(t,-6-7*i),c=addD(t,-7*i);return [dset(['ex'],b,c).size,dset(HOB,b,c).size,i?i+'주 전':'최근 7일'];});
  return `<div class="card"><h2>운동 이력</h2><div class="row sp"><span>이번 달 <b class="qty">${mo}일</b></span><span>연속 <b class="qty">${n}일</b></span><span>누적 <b class="qty">${L.length}회</b></span></div><div class="muted">총 ${Math.floor(mins/60)}시간 ${mins%60}분 · 지금 ${stLine().replace(/<[^>]+>/g,'')}</div></div>
  <div class="card"><h2>4주 밸런스</h2><div class="muted">초록 운동 · 주황 취미 (활동한 날 수)</div>${wk.map(w=>`<div class="muted" style="margin-top:6px">${w[2]} · 운동 ${w[0]}일 · 취미 ${w[1]}일</div>${bar(w[0],'#5f8f3e')}${bar(w[1],'#c9852c')}`).join('')}</div>`;}
/* 운동 기록 직후: 퀘스트 자동 체크 · 기상 연출 · 밸런스 보너스 */
function exHook(k){let m='';if(k==='ex'){const q=qList().find(x=>/운동/.test(x.n));if(q&&!qToday().includes(q.id))qDone(q.id);S.wq.filter(x=>/운동/.test(x.n)).forEach(x=>wDone(x.id));}
  const T=tState();if(k==='ex'&&T.st==='buff'&&S.lastSt!=='buff')setTimeout(()=>tako('buff'),1300);if(k==='ex'&&S.lastSt==='down'&&T.st!=='down'){m='토리가 벌떡 일어났어요! 💪';fx('star',18);}
  if(T.bal&&S.balW!==wkKey()){S.balW=wkKey();S.balN=(S.balN||0)+1;setTimeout(()=>tako('bal'),2600);S.acorns+=BAL.bonus;m+=(m?' / ':'')+'⚖️ 밸런스 달성! 🌰+'+BAL.bonus;}
  S.lastSt=T.st;return m;}
/* ===== 업적 · 몸짱 유지 도전 · 달력 · 연말 리포트 · 보상 공유 ===== */
function buffStreak(){const t=todayStr();let n=0;while(n<40&&tState(addD(t,-n)).st==='buff')n++;return n;}
const ACH=[['att7','📅','출석 7일 연속',()=>[S.streak.n,7]],['att30','📅','출석 30일 연속',()=>[S.streak.n,30]],
['ex10','🏃','운동 10회',()=>[S.act.ex.length,10]],['ex50','🏃','운동 50회',()=>[S.act.ex.length,50]],['ex100','🏃','운동 100회',()=>[S.act.ex.length,100]],
['buff1','💪','몸짱 토리 첫 변신',()=>[S.ach.buff1||buffStreak()>0?1:0,1]],['buff14','🏆','몸짱 2주 유지',()=>[buffStreak(),14]],['buff28','👑','몸짱 4주 유지',()=>[buffStreak(),28]],
['bal4','⚖️','밸런스 4번 달성',()=>[S.balN||0,4]],['song5','🎸','곡 5개 완성',()=>[S.songs.filter(x=>x.st===2).length,5]],
['pl10','📍','장소 10곳 기록',()=>[S.places.length,10]],['cp20','🎟','보상 20장 사용',()=>[S.used.length,20]],['fed100','🌰','도토리 100개 먹이기',()=>[S.fed,100]]];
function achChk(){const nm=[];ACH.forEach(a=>{if(S.ach[a[0]])return;const [c,g]=a[3]();if(c<g)return;S.ach[a[0]]=todayStr();nm.push(a[2]);
  if(a[0]==='buff14'){S.acorns+=5;S.coupons.push({id:uid(),emoji:'🏆',name:'몸짱 2주 유지 기념: 간식 골라 먹기권',desc:'2주 동안 몸짱 토리를 지켰어요!',grade:'희귀',qty:1,expire:''});}
  if(a[0]==='buff28'){S.acorns+=10;S.coupons.push({id:uid(),emoji:'👑',name:'몸짱 4주 유지 기념: 소원 하나권',desc:'4주 동안 몸짱 토리를 지켰어요! 왕관도 선물했어요',grade:'전설',qty:1,expire:''});if(!S.deco.own.includes(7)){S.deco.own.push(7);S.deco.on.push(7);}}});
  if(nm.length){save();setTimeout(()=>{toast('🏅 업적 달성: '+nm.join(', '));sfx('fan');fx('star',14);},900);setTimeout(()=>tako('ach',nm.join(', ')),1600);}}
function rAch(){const bs=buffStreak(),done=ACH.filter(a=>S.ach[a[0]]).length;
  $('dbody').innerHTML=`<div class="card"><h2>🏆 몸짱 유지 도전</h2><div class="muted">몸짱 상태를 이어 가요 (지금 ${bs}일째)</div>${[[14,'2주','보상 + 🌰5'],[28,'4주','전설 보상 + 🌰10 + 👑 왕관']].map(([n,l,r])=>`<div class="q ${S.ach['buff'+n]?'':''}"><span>${S.ach['buff'+n]?'✔':'💪'} 몸짱 ${l} 유지<div class="muted">${S.ach['buff'+n]?'달성! 보상을 받았어요':Math.min(bs,n)+' / '+n+'일 · 보상 '+r}</div></span></div>`).join('')}</div>
  <div class="card"><h2>🏅 업적 (${done}/${ACH.length})</h2>${ACH.map(a=>{const on=S.ach[a[0]],[c,g]=a[3]();return `<div class="q ${on?'':'dim'}"><span>${on?a[1]:'🔒'} ${esc(a[2])}<div class="muted">${on?esc(on)+' 달성':Math.min(c,g)+' / '+g}</div></span></div>`;}).join('')}</div>${yearCard()}`;}
function yearCard(){const y=todayStr().slice(0,4),c=k=>S.act[k].filter(e=>e.date.slice(0,4)===y),ex=c('ex'),mn=ex.reduce((a,e)=>a+(+e.min||0),0),pl=S.places.filter(x=>(x.date||'').slice(0,4)===y),cnt={};
  pl.forEach(x=>cnt[x.name]=(cnt[x.name]||0)+1);const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0],R=(a,b)=>`<div class="row sp"><span>${a}</span><span class="qty">${b}</span></div>`;
  return `<div class="card legend"><h2>🎊 ${y}년 진우의 한 해</h2>${R('💪 운동',new Set(ex.map(e=>e.date)).size+'일 · '+Math.floor(mn/60)+'시간')}${HOB.map(k=>R(ACT[k][1]+' '+ACT[k][0],c(k).length+'회')).join('')}${R('🎸 완성한 곡',S.songs.filter(x=>x.st===2).length+'곡')}${R('📍 새 장소',pl.length+'곳')}${top&&top[1]>1?R('가장 자주 간 곳',esc(top[0])+' '+top[1]+'번'):''}${R('🎟 쓴 보상',S.used.filter(u=>u.date.slice(0,4)===y).length+'장')}<div style="margin-top:6px">${esc(hn())}: 올해도 곁에 있어 줘서 든든했어! 🌰</div></div>`;}
let cMon='',dyQ='',dyPage=0;const DY_PAGE_SIZE=5;
function calMv(d){dyPage=0;const [y,m]=cMon.split('-').map(Number);cMon=new Date(Date.UTC(y,m-1+d,1)).toISOString().slice(0,7);rPlace();}
function rCal(){const t=todayStr();if(!cMon)cMon=t.slice(0,7);const [y,m]=cMon.split('-').map(Number),f=new Date(Date.UTC(y,m-1,1)).getUTCDay(),n=new Date(Date.UTC(y,m,0)).getUTCDate(),ex=dset(['ex'],'0000','9999'),hb=dset(HOB,'0000','9999'),di=new Set((S.diary||[]).map(x=>x.d)),sd=new Set((S.sched||[]).map(x=>x.date));
  let g=[...WD].map(w=>`<b class="cw">${w}</b>`).join('')+'<span></span>'.repeat(f),ec=0,hc=0,dc=0;
  for(let d=1;d<=n;d++){const ds=cMon+'-'+p2(d),e=ex.has(ds),h=hb.has(ds),dy=di.has(ds);ec+=e?1:0;hc+=h?1:0;dc+=dy?1:0;g+=`<button class="cd ${ds===t?'today':''}" onclick="calDay('${ds}')">${d}<span>${e?'<u class="g"></u>':''}${h?'<u class="o"></u>':''}${dy?'<u class="d"></u>':''}${sd.has(ds)?'<u class="s"></u>':''}</span></button>`;}
  $('dbody').innerHTML=`<div class="card"><div class="row sp"><button class="btn sm" onclick="calMv(-1)">◀</button><h2 style="margin:0">${y}년 ${m}월</h2><button class="btn sm" onclick="calMv(1)">▶</button></div><div class="muted" style="margin:6px 0">초록 운동 ${ec}일 · 주황 취미 ${hc}일 · 분홍 일기 ${dc}일 · 보라 일정 · 날짜를 누르면 기록이 나와요</div><div class="cal">${g}</div></div>`;}
function calDay(ds){const l=['ex',...HOB].flatMap(k=>S.act[k].filter(e=>e.date===ds).map(e=>`<div class="q"><span>${ACT[k][1]} ${esc(e.what)}${actTag(k,e)}</span></div>`)),pl=S.places.filter(x=>x.date===ds).map(x=>`<div class="q"><span>📍 ${esc(x.name)}</span></div>`).concat((S.sched||[]).filter(x=>x.date===ds).map(x=>`<div class="q" onclick="schForm('${x.id}')" style="cursor:pointer"><span>🗓 ${esc(x.name)}<div class="muted">${esc(x.time||'')}${x.memo?' · '+esc(x.memo):''}</div></span></div>`));
  const dv=(S.diary||[]).find(x=>x.d===ds),dh=dv?`<div class="q"><span>🌙 ${esc(dv.t)}<div class="muted">${toriDiaryIcon()} ${esc(hn())}: ${esc(dv.r||'')}</div></span></div>`:'';
  modal(`<h3>${esc(ds)} (${wdOf(ds)})</h3>${dh+l.concat(pl).join('')||'<div class="empty">이날은 기록이 없어요.</div>'}${ds<=todayStr()?`<button class="btn wood full" style="margin-top:10px" onclick="dyForm('${esc(ds)}')">${dv?'📖 일기 고치기':'📖 이 날 일기 쓰기'}</button>`:''}<button class="btn ghost full" style="margin-top:8px" onclick="schForm();$('sd').value='${esc(ds)}'">🗓 이 날 일정 넣기</button><button class="btn full" style="margin-top:8px" onclick="closeM()">닫기</button>`);}
async function cpShare(){const c=window.lastCp;if(!c)return;const t='🎟️ 보상 사용했어요!\n「'+c.name+'」 · '+c.date+'\n남은 '+c.left+'장 — JW Diary';
  try{if(navigator.share){await navigator.share({text:t});return;}}catch(e){if(e&&e.name==='AbortError')return;}
  try{await navigator.clipboard.writeText(t);toast('복사했어요. 붙여넣어 보내 주세요');}catch(e){toast('이 브라우저는 공유를 지원하지 않아요');}}
/* ===== 혼자 쓰는 보상 · 카테고리 · 보상 뽑기 ===== */
const SOLO=[['귀찮음 면제','🧺','설거지 내일로 미루기',4],['귀찮음 면제','🏠','약속 없는 집콕 하루',6],['귀찮음 면제','😴','죄책감 없는 늦잠',5],['귀찮음 면제','☁','아무것도 안 하는 1시간',4],['귀찮음 면제','🛵','배달로 한 끼 해결 (요리·설거지 면제)',7],['귀찮음 면제','🙅','하기 싫은 일 하나 패스',6],
['먹거리','🏪','편의점 만 원어치 골라 담기',6],['먹거리','🍜','야식 메뉴 마음대로',5],['먹거리','🍜','좋아하는 라면 끓여 먹기',3],['먹거리','🍗','치킨 한 마리 혼자 먹기',9],['먹거리','🍰','처음 보는 디저트 도전',5],['먹거리','☕','카페에서 혼자 1시간 앉아 있기',6],
['취미','🎲','보드게임 신작 하나 사기 (위시 목록에서)',15],['취미','🎮','게임 결제 만 원 이내',8],['취미','🎸','기타 줄 새로 갈기',5],['취미','🎧','연주 영상 1시간 몰아보기',3],['취미','🍽','새 곡 완성 기념 맛있는 것 먹기',10],['취미','🛒','중고장터 구경 30분',3],
['운동','💧','운동 후 시원한 음료',3],['운동','🛋','운동 끝나고 30분 멍때리기',3],['운동','🎧','좋아하는 플레이리스트 틀고 산책',3],['운동','🏃','새 운동 코스 도전',4],['운동','👟','운동복·운동용품 하나 사기',15],
['나들이','🎬','혼자 영화 한 편',8],['나들이','🚌','버스 타고 종점까지 가 보기',6],['나들이','🌇','노을 보러 가기',4],['나들이','🗺','낯선 동네 골목 탐험',6],['나들이','📚','서점·문구점 구경',4],['나들이','📍','새 식당 도장깨기 (도감에 기록)',8],['나들이','🚆','혼자 당일치기 여행',18],
['마음','🛁','따뜻한 샤워 20분',3],['마음','🎵','좋아하는 노래 크게 틀고 한 곡',2],['마음','✏','나에게 칭찬 한 줄 쓰기',2],['마음','🌙','밤하늘 보며 5분',3],['마음','🎁','나에게 주는 선물 (만 오천 원 이내)',12]];
const SC={'마작 한 판 하기':'취미','마작 모임 다녀오기':'취미','마작 연습 1시간':'취미','보드게임 한 판 하기':'취미','보드게임 모임 나가기':'취미','기타 한 곡 마음껏 치기':'취미','새 곡 하나 카피해 보기':'취미','기타 소품 하나 사기 (피크 · 줄 등)':'취미','운동 하루 쉬기':'운동','지금부터 1시간, 하고 싶은 것만 하기':'귀찮음 면제','맛있는 음료 마시기':'먹거리','스스로 머리 쓰담쓰담 5회':'마음'};
SOLO.forEach(x=>{SC[x[2]]=x[0];MEV.push([x[1],x[2],x[3]]);});
const catOf=n=>SC[n]||'시즌',CATS=['전체','귀찮음 면제','먹거리','취미','운동','나들이','마음','시즌'],GC=6;let mCat='전체';
function catChips(){return `<div class="chips">${CATS.map(c=>`<button class="chip ${mCat===c?'on':''}" onclick="mCat='${c}';mPage=0;rCoupon()">${c}</button>`).join('')}</div>`;}
function gachaCard(){const st=mcState(),n=monthList().filter(c=>!st.got.includes(c.id)).length;
  return `<div class="card legend"><h2>🎰 보상 뽑기</h2><div class="muted">고르기 귀찮을 땐 랜덤! 🌰 ${GC}개로 이번 달 보상 한 장 (남은 ${n}장)</div><button class="btn wood full" style="margin-top:8px" onclick="gacha()">🎰 뽑기 · 🌰${GC}</button></div>`;}
function gacha(){const st=mcState(),L=monthList().filter(c=>!st.got.includes(c.id));
  if(!L.length){toast('이번 달 보상을 다 모았어요!');return;}
  if(S.acorns<GC){toast('도토리가 부족해요. 퀘스트로 모아 보세요');sfx('no');return;}
  askOk('도토리 '+GC+'개로 보상 뽑기를 할까요?',gachaGo);}
function gachaGo(free){const st=mcState(),L=monthList().filter(c=>!st.got.includes(c.id));
  if(!L.length){toast('이번 달 보상을 다 모았어요!');return;}
  if(free!==true&&S.acorns<GC){toast('도토리가 부족해요. 퀘스트로 모아 보세요');sfx('no');return;}
  const r=Math.random(),g=r<.1?'전설':r<.4?'희귀':'일반';let pool=L.filter(c=>c.g===g);if(!pool.length)pool=L;
  const c=pool[Math.floor(Math.random()*pool.length)];
  if(free!==true)S.acorns-=GC;st.got.push(c.id);S.coupons.push({id:uid(),emoji:c.e,name:c.n,desc:+todayStr().slice(5,7)+'월 뽑기 보상',grade:c.g,qty:1,expire:''});save();
  modal(`<h3 style="text-align:center">🎰 보상 뽑기</h3><div class="big" id="gz">🎁</div><div id="gn" class="nm" style="text-align:center;min-height:56px"></div><button class="btn full" id="gb" disabled style="opacity:.4" onclick="closeM();rCoupon()">확인</button>`);
  let n=0;const t=setInterval(()=>{if(!$('gz')){clearInterval(t);return;}
    if(++n>12){clearInterval(t);$('gz').textContent=c.e;$('gn').innerHTML=esc(c.n)+'<br><span class="badge g-'+c.g+'">'+c.g+'</span>';const b=$('gb');b.disabled=false;b.style.opacity=1;sfx(c.g==='일반'?'coin':'fan');if(c.g!=='일반')fx('star',c.g==='전설'?20:10);return;}
    const x=L[Math.floor(Math.random()*L.length)];$('gz').textContent=x.e;$('gn').textContent=x.n;sfx('tick');},90);}
/* ===== 타코: 칭찬 · 응원 팝업 (터치하면 닫혀요, 7초 뒤 자동으로 사라져요) ===== */
const TAKO='images/icons/tako-8ee4b489.png';
const TK={buff:['몸짱 토리 탄생이다코! 꾸준히 운동한 진우, 멋지다코 💪','근육 빵빵이다코! 타코도 반해 버렸다코 🐙'],
 bal:['운동도 취미도 균형 완벽이다코! 타코가 100점 준다코 ⚖️'],
 ach:['새 업적 달성이다코! 물방울 폭죽을 터뜨린다코 🫧','대단하다코 진우! 박수 짝짝짝이다코 👏'],
 clear:['오늘 퀘스트 전부 클리어했다코! 진우 최고다코 ⭐'],
 stay:['오늘도 몸짱 유지 중이다코! 이대로 쭉 간다코 💪'],
 down:['토리가 쓰러졌다코… 5분 산책만 해도 일어난다코. 타코가 응원한다코 🐙','한 번만 움직이면 된다코! 작게 시작해도 충분하다코!'],
 away:['오랜만이다코! 타코는 기다리고 있었다코 🫧','쉬어 가는 날도 있는 거다코. 오늘부터 천천히 다시 하면 된다코']};
let tkT,tkQ=[],tkOn=0,tkOut=0,tkH=0;
function tako(k,extra,ms,hint,opts){const a=(typeof k==='string'&&k[0]==='=')?[k.slice(1)]:TK[k];if(!a)return;
  if(hint)tkQ=tkQ.filter(q=>!q.h);
  tkQ.push({m:a[Math.floor(Math.random()*a.length)],x:extra,ms:ms,k:k,h:hint,o:opts});
  if(tkOn&&!tkOut){if(hint&&tkH)tkClose();else{clearTimeout(tkT);tkT=setTimeout(tkClose,2500);}}
  tkNext();}
function tkNext(){if(tkOn||!tkQ.length)return;if($('splash')||$('tut')){setTimeout(tkNext,800);return;}
  const it=tkQ.shift();tkOn=1;tkOut=0;tkH=it.h?1:0;
  let o=$('tako');if(!o){o=document.createElement('div');o.id='tako';o.setAttribute('role','status');o.setAttribute('aria-live','polite');o.onclick=tkClose;document.body.appendChild(o);}
  const nv=document.querySelector('nav'),vv=window.visualViewport,kb=vv?Math.max(0,innerHeight-vv.height-vv.offsetTop):0;
  o.style.bottom=(kb>80?kb+10:(nv?nv.offsetHeight:76)+6)+'px';
  o.innerHTML=`<img src="${TAKO}" alt="타코"><div class="tb">${esc(it.m)}${it.x?'<div class="muted">'+esc(it.x)+'</div>':''}${it.o?'<div class="tbr">'+it.o.map((b,i)=>`<button class="btn sm ${i?'ghost':''}" onclick="event.stopPropagation();tkAns(${b[1]})">${esc(b[0])}</button>`).join('')+'</div>':''}</div>`;
  o.className='';void o.offsetWidth;o.className='on';document.body.classList.add('tkon');document.body.style.setProperty('--tkh',(o.offsetHeight+(nv?nv.offsetHeight:76)+12)+'px');clearTimeout(tkT);tkT=setTimeout(tkClose,it.ms||7000);sfx(it.k[0]==='='?'tick':(it.k==='down'||it.k==='away'?'coin':'fan'));}
function tkAns(v){tkClose();if(v===900){backupSend();return;}if(v===901){bkLater();return;}if(v>=400){dLayer(v-400);return;}if(v>=300){dSize(v-300);return;}if(v>=200){dMoveCancel();return;}if(v>=100){dMoveStart(v-100);return;}if(v<0)return;nightAns(v);}
function tkClose(){if(!tkOn||tkOut)return;tkOut=1;clearTimeout(tkT);const o=$('tako');if(o)o.className='off';setTimeout(()=>{tkOn=0;tkOut=0;if(!tkQ.length)document.body.classList.remove('tkon');tkNext();},380);}
function tkDaily(k){const t=todayStr();if(!S.tk||S.tk.d!==t)S.tk={d:t};if(S.tk[k])return;S.tk[k]=1;save();tako(k);}
/* ===== 타코: 도감에 기록할 때 반응 (종류별 여러 가지 + 상황에 맞는 한마디) ===== */
const TKR={
 mj:['마작 기록 완료다코! 오늘은 패가 잘 붙었을까 궁금하다코 🀄','패를 착착 놓는 진우, 타코는 멋있다고 생각한다코 🐙','다음 판도 기대된다코! 타코는 촉수가 근질근질하다코 🀄','이기든 지든 재밌었으면 그걸로 충분하다코 🫧','도감에 마작 한 판 추가다코! 기록은 마음의 패다코 ✍️'],
 bg:['보드게임 기록이다코! 타코도 끼워 달라코 🎲','테이블 위의 승부사 진우, 오늘도 수고했다코 🎲','같이 놀면 더 즐거운 게 보드게임이다코! 🫧','다음엔 어떤 게임을 할지 타코는 벌써 궁금하다코 🐙','주사위 굴리는 소리가 들리는 것 같다코 🎲'],
 band:['합주 기록이다코! 타코는 리듬 타는 중이다코 🎸','연습한 만큼 소리가 좋아진다코 🎵','무대에 선 진우를 상상해 본다코! 🐙','박자가 딱딱 맞는 날은 기분이 최고다코 🥁','기타 소리가 여기까지 들린다코 🫧'],
 ex:['운동 기록이다코! 토리 근육이 쑥쑥 큰다코 💪','땀 흘린 만큼 멋져진다코! 🫧','오늘도 해냈다코, 대단하다코 🏃','꾸준함이 제일 센 운동이다코! 타코가 응원한다코 🐙','몸도 마음도 가벼워졌길 바란다코 ✨'],
 edit:['기록을 고쳤다코! 꼼꼼하다코 ✏️','수정 완료다코. 타코가 확인했다코 🐙','더 정확해졌다코! 좋다코 ✍️'],
 dex:['새 장소가 도감에 추가됐다코! 📍','진우의 발자국이 도감에 찍혔다코 🐾','좋은 곳이었길 바란다코! 타코도 가 보고 싶다코 🐙','기록해 두면 나중에 다시 꺼내 보는 재미가 있다코 📖'],
 wish:['가고 싶은 곳을 담았다코! 언젠가 꼭 가자코 🗺️','리스트가 늘어난다코! 타코도 두근두근한다코 ✨','다음 나들이 후보가 생겼다코 🧭'],
 gone:['다녀왔다코! 가고 싶은 곳 하나 클리어다코 🎉'],
 song:['새 곡 등록이다코! 연습 시작이다코 🎸','곡이 하나 더 늘었다코! 레퍼토리가 풍성해진다코 🎵','한 곡씩 완성해 가는 거다코! 천천히 가자코 🫧'],
 diary:['일기가 도감에 쌓인다코! 타코가 읽어 봤다코 📖','하루를 글로 남기는 건 멋진 일이다코 ✍️','오늘의 한 줄이 나중엔 보물이 된다코 💎']};
let tkLastR='';
/* cat: 기본 문구 묶음, sp: 상황별 문구(가끔 뽑혀요), pri: 특별한 순간 문구(있으면 무조건 이걸로) */
function takoRec(cat,sp,pri){if(S.tkRec===0)return;
  const pool=(pri&&pri.length)?pri:(sp&&sp.length&&Math.random()<.65?sp:(TKR[cat]||[]));if(!pool.length)return;
  let m,n=0;do{m=pool[Math.floor(Math.random()*pool.length)];}while(m===tkLastR&&pool.length>1&&++n<6);
  tkLastR=m;setTimeout(()=>tako('='+m,'',5500),450);}
function takoActRec(k,edit,d,p,ex){if(edit){takoRec('edit');return;}
  const nm=ACT[k][0],td=todayStr(),mc=S.act[k].filter(e=>e.date.slice(0,7)===d.slice(0,7)).length,tot=S.act[k].length,sp=[],pri=[];
  if(p)sp.push('뿌듯했던 점까지 적었다코! 타코가 두 번 읽었다코 📖','"'+p+'" — 이 마음, 타코가 기억해 둔다코 🫧');
  if(k==='bg'&&ex.nw&&ex.game)sp.push('"'+ex.game+'"은(는) 처음 해 본 게임이다코! 새 도전 멋지다코 🎲');
  if(k==='mj'&&ex.rank===1)pri.push('1등이다코!! 타코가 박수를 백 번 친다코 👏🀄');
  if(k==='mj'&&ex.rank===4)sp.push('4등이어도 괜찮다코. 다음 판이 있다코! 🀄');
  if(k==='ex'&&ex.min>=60)sp.push('한 시간 넘게 했다코?! 토리가 깜짝 놀랐다코 💪');
  if(d<td)sp.push('지난 기록도 챙겼다코! 꼼꼼하다코 📅');
  if([3,5,10,20,30].includes(mc))sp.push('이번 달 '+nm+' '+mc+'번째 기록이다코! 꾸준하다코 🔥');
  if([10,30,50,100,200].includes(tot))pri.push(nm+' 기록이 벌써 '+tot+'개다코! 대단하다코 🏆');
  takoRec(k,sp,pri);}
function takoPlRec(isDex,edit,fromWish,o){if(edit){takoRec('edit');return;}
  if(fromWish){takoRec('gone',[],['드디어 "'+o.name+'"에 다녀왔다코! 가고 싶은 곳 하나 클리어다코 🎉']);return;}
  if(!isDex){takoRec('wish',['"'+o.name+'" 담았다코! 언젠가 꼭 같이 가자코 🗺️']);return;}
  const sp=[],pri=[],n=S.places.length;
  if([5,10,20,30,50,100].includes(n))pri.push('도감에 벌써 '+n+'곳이다코! 진짜 탐험가다코 🧭');
  if(o.stars>=5)sp.push('별 다섯 개다코! 타코도 "'+o.name+'" 꼭 가 보고 싶다코 ⭐');
  if(o.stars<=2)sp.push('아쉬웠구나다코. 다음엔 더 좋은 곳으로 가자코 🫧');
  if(o.with)sp.push(o.with+'랑 같이 갔구나다코! 좋은 추억이다코 👥');
  if(o.comment)sp.push('한 줄 평까지 남겼다코! 나중에 읽으면 재밌겠다코 📝');
  const tp={식당:'맛있었겠다코! 타코는 군침이 돈다코 🍽️',카페:'카페 기록이다코! 타코는 달콤한 게 좋다코 ☕',놀거리:'재밌게 놀았다코! 타코도 신났다코 🎡'}[o.type];if(tp)sp.push(tp);
  takoRec('dex',sp,pri);}
function takoSongRec(pv,n,st){if(pv>=0){if(st===2&&pv!==2)takoRec('song',[],['"'+n+'" 완성이다코!! 타코가 앵콜을 외친다코 🎉🎸']);else takoRec('edit');return;}
  const sp=['"'+n+'" 곡 추가다코! 어떤 곡인지 궁금하다코 🎵'];if(st===2)sp.push('처음부터 완성된 곡이다코?! 대단하다코 🎸');takoRec('song',sp);}
function takoDiaryRec(ds,edit){if(edit){takoRec('edit');return;}
  const n=(S.diary||[]).length,sp=ds<todayStr()?['지난 날 일기를 채웠다코! 하루하루가 소중하다코 📖']:[],pri=[10,30,50,100,200,365].includes(n)?['일기가 벌써 '+n+'일 치다코! 꾸준한 진우, 멋지다코 📚']:[];
  takoRec('diary',sp,pri);}
/* 새해 그림(2027 글자)을 2028용으로 바꿀 때 알려 주기: 2027-12-01 ~ 2028-01-31 사이 처음 열 때 1번 */
/* 새해 그림에는 연도가 적혀 있어요(NYE_YEAR). 그 다음 해 12월이 되면 타코가 한 번 물어봐요. 그림을 새로 만들고 NYE_YEAR를 바꾸면 더는 안 물어봐요 (문구는 아래 tako 줄에서 고쳐요) */
function nyRemind(){const t=todayStr(),y=+t.slice(0,4);if(t.slice(5)<'12-01'||y<=+NYE_YEAR||S.nyRm===y)return;S.nyRm=y;save();
  tako('=12월이 왔다코! 🎆 새해 파티 준비는 됐냐코? 새해 날짜를 까먹지는 않았냐코!','',15000);}
function takoStart(fromTut){if(!S.tutDone){tut(0);return;}const st=()=>{const T=tState();if(AWAY>=3)tkDaily('away');else if(T.st==='down')tkDaily('down');else if(T.st==='buff')tkDaily('stay');nyRemind();if(bkDue())setTimeout(bkAsk,6500);};if(fromTut===1){st();setTimeout(nightAsk,1200);return;}takoHello();setTimeout(nightAsk,1200);setTimeout(st,7600);}
{const _q=qDone;qDone=function(id){const b=!!S.qdone.clr;_q(id);if(S.qdone.clr&&!b)setTimeout(()=>tako('clear'),1200);};}

/* ===== 타코의 시간대별 인사 (켤 때 · 앱으로 돌아왔을 때 · 하루 마무리 후) ===== */
Object.assign(TK,{
 hm:['좋은 아침이다코 진우! 오늘도 타코가 응원한다코 ☀️','일어났구나코! 물 한 잔 마시고 시작한다코 💧'],
 hl:['점심 시간이다코! 밥 든든히 챙겨 먹는다코 🍚','진우 안녕이다코! 벌써 하루의 절반이 지났다코 🐙'],
 ha:['오후도 힘내자코! 타코가 옆에서 응원한다코 🫧','잠깐 스트레칭 한 번 해 본다코! 5분이면 충분하다코 🤸'],
 he:['수고했다코 진우! 저녁은 챙겨 먹었는지 궁금하다코 🍽','저녁이다코! 오늘 하루도 잘 버텼다코 🌆'],
 hn:['늦은 시간이다코… 오늘 하루 정말 수고했다코 🌙','이제 슬슬 쉴 시간이다코. 타코는 옆에 있다코 💤'],
 bm:['잘 다녀오라코! 오늘 하루 응원한다코 ☀️'],
 bl:['점심 맛있게 먹으라코! 또 보자코 🍚'],
 ba:['남은 오후도 힘내라코! 또 보자코 🫧'],
 be:['오늘 저녁도 편안하게 보내라코! 기다린다코 🌆'],
 bn:['푹 자라코 진우! 좋은 꿈 꾼다코 🌙']});
const tkSlot=()=>{const h=kst().getUTCHours();return h>=5&&h<11?'m':h>=11&&h<14?'l':h>=14&&h<18?'a':h>=18&&h<22?'e':'n';};
function takoHello(){const td=todayStr();if(S.takoHelloDay===td)return false;S.takoHelloDay=td;save();tako('h'+tkSlot());return true;}
{const _d=dySave;dySave=function(){const v=$('dyi')&&$('dyi').value.trim();_d.apply(this,arguments);if(v)setTimeout(()=>tako('b'+tkSlot()),1200);};}
let _dayK=todayStr();function dayRoll(){const t=todayStr();if(t===_dayK)return;_dayK=t;if(typeof render==='function'&&!$('splash')&&!$('tut')&&!$('mg')&&!$('bgo')&&!$('ov').classList.contains('on')&&(!document.activeElement||!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)))render();}
setInterval(dayRoll,30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)dayRoll();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){window._hid=Date.now();}else if(window._hid&&Date.now()-window._hid>=5*60*1000&&S.tutDone&&!$('splash')&&!$('tut')){window._hid=0;takoHello();setTimeout(nightAsk,1200);}});
/* ===== 타코의 사용법 (처음 한 번 자동으로, 설정 탭에서 다시 볼 수 있어요) ===== */
const TUT=[['🐙','안녕이다코! 나는 타코타코','진우의 하루를 응원하러 온 문어 요정이다코. 이 앱은 오늘 한 일을 기록하면 🌰 도토리를 받아서, 햄스터 토리를 키우고 보상으로 바꾸는 다이어리다코. 1분만 설명한다코!'],
['🌰','도토리는 이렇게 모은다코','• 홈 화면의 "오늘 빠른 기록" 버튼 한 번이면 된다코\n• 햄스터 탭의 매일 퀘스트를 체크한다코\n• 앱을 열면 출석 체크가 된다코\n• 운동·취미·장소를 기록해도 받는다코\n하루에 받는 양은 정해져 있으니까, 부담 없이 조금씩만 하면 된다코!'],
['🐹','햄스터 토리를 키운다코','햄스터 탭에서 도토리를 주면 레벨이 오르고, 도토리 코인이 생겨서 상점에서 보상을 살 수 있다코. 밥은 하루 한 번 무료다코. 도토리로 토리 집을 꾸미고 미니게임도 할 수 있다코!'],
['💪','운동과 취미는 균형이다코','도감의 "운동", "마작", "보드게임", "밴드"에 한 줄씩 기록한다코. 최근 7일 동안 취미만 하고 운동을 안 하면 토리가 쓰러지고, 운동을 4일 이상 하면 몸짱이 된다코. 5분 산책도 운동 기록으로 충분하다코!'],
['🎟','보상은 이렇게 쓴다코','모은 도토리로 보상 탭의 "월의 보상"에서 보상을 교환하거나, 🎰 뽑기로 랜덤 한 장을 뽑을 수 있다코. 보상은 혼자 쓰는 선물이다코. 쓸 때는 "사용하기"만 누르면 된다코!'],
['📍','도감과 달력이다코','도감에는 다녀온 곳, 가고 싶은 곳(룰렛도 있다코), 활동 기록, 달력, 업적이 모여 있다코. 달력에서 운동한 날은 초록, 취미한 날은 주황으로 보인다코!'],
['💾','이것만은 기억한다코: 백업','기록은 이 폰 안에만 저장된다코. 설정 탭의 "백업 파일 저장"을 가끔 눌러 두면 폰을 바꿔도 안전하다코. 3일이 지나면 홈 화면에서 알려 준다코. 이 설명은 설정 탭에서 언제든 다시 볼 수 있다코!']];
function tut(i){i=Math.max(0,Math.min(TUT.length-1,i));const t=TUT[i],last=i===TUT.length-1;let o=$('tut');if(!o){o=document.createElement('div');o.id='tut';document.body.appendChild(o);}
  o.innerHTML=`<div class="tbox">${last?'':'<button class="btn ghost sm tskip" onclick="tutEnd()">건너뛰기</button>'}<img src="${TAKO}" alt=""><div class="tn">타코 🐙 · ${i+1} / ${TUT.length}</div><h3>${t[0]} ${esc(t[1])}</h3><div class="tt">${esc(t[2]).replace(/\n/g,'<br>')}</div><div class="row" style="margin-top:14px">${i?`<button class="btn ghost" onclick="tut(${i-1})">◀</button>`:''}<button class="btn full" onclick="${last?'tutEnd()':'tut('+(i+1)+')'}">${last?'시작하기! 🌰':'다음 ▶'}</button></div></div>`;sfx('tick');}
function tutEnd(){const o=$('tut');if(o)o.remove();if(!S.tutDone){S.tutDone=1;save();}sfx('fan');setTimeout(()=>takoStart(1),300);}
if(!S.mig4){S.mig4=1;S.acorns=0;S.coupons=[];S.pend=[];}   /* 시작 상태: 도토리·보상 0 (한 번만) */
if(!S.mig3){S.mig3=1;S.streak.last=todayStr();S.streak.n=Math.max(1,S.streak.n||0);}
/* ---------- 도토리 내역 · 하루 한 줄 ---------- */
function acLog(){const a=S.acorns;if(typeof S.acL!=='number'){S.acL=a;return;}const d=a-S.acL;if(d){if(!Array.isArray(S.acLog))S.acLog=[];S.acLog.unshift({t:Date.now(),d,w:ACW||(d>0?'획득':'교환·사용')});S.acLog=S.acLog.slice(0,20);}S.acL=a;}
function acHist(){const L=(S.acLog||[]).map(x=>`<div class="q"><span>${esc(x.w)}<div class="muted">${new Date(x.t+9*36e5).toISOString().slice(5,16).replace('T',' ')}</div></span><b class="qty" style="${x.d<0?'color:#c0392b':''}">${x.d>0?'+':''}${x.d}</b></div>`).join('');
  modal(`<h3>🌰 도토리 내역</h3><div class="muted" style="margin-bottom:6px">최근 20건이에요.</div>${L||'<div class="empty">아직 내역이 없어요.</div>'}<button class="btn full" style="margin-top:10px" onclick="closeM()">닫기</button>`);}
function toriDiaryIcon(){return '<img class="diary-tori" src="images/icons/tori-icon-b.png" alt="토리">';}
const DYR={sad:['오늘 힘들었구나… 토리가 볼로 꾹 안아 줄게. 무사히 돌아온 것만으로 충분해.','찍… 그런 날도 있는 거야. 도토리 하나 까먹고 푹 쉬자.','말해 줘서 고마워. 토리는 항상 진우 편이야.'],
 happy:['찍찍! 그런 날이었구나! 토리도 볼이 빵빵해질 만큼 기뻐!','와, 오늘 진우 정말 반짝반짝했네! 박수 짝짝짝!','좋은 하루였다니 토리도 행복해. 내일도 이렇게 웃자!'],
 ex:['운동한 진우, 멋져! 토리도 쳇바퀴 열 바퀴 뛰고 올게!','몸을 움직인 하루라니, 토리가 근육 자랑 같이 하고 싶어!'],
 music:['진우의 연주가 귀에 들리는 것 같아. 토리는 앵콜을 외칠래!','한 소절씩 쌓이는 거야. 오늘 연습도 분명 실력이 됐어.'],
 game:['재밌게 놀았구나! 다음엔 토리도 한 판 끼워 줘.','즐기는 시간도 진우한테 꼭 필요해. 잘 놀았어!'],
 def:['오늘의 한 줄, 토리가 도토리 속에 소중히 넣어 둘게.','한 줄이면 충분해. 오늘도 기록해 줘서 고마워!','읽었어! 진우의 하루는 토리가 다 기억할게.','수고했어, 진우. 오늘 밤은 푹 자자 🌙']};
function dyReact(t){const k=/힘들|피곤|지쳤|지친|우울|슬프|속상|짜증|외로|아프|졸려|귀찮/.test(t)?'sad':/좋았|행복|뿌듯|즐거|재밌|재미|신나|성공|해냈|맛있|기뻤|웃었/.test(t)?'happy':/운동|러닝|헬스|산책|걷/.test(t)?'ex':/기타|연습|합주|곡/.test(t)?'music':/마작|보드게임/.test(t)?'game':'def';const a=DYR[k];return a[Math.floor(Math.random()*a.length)];}
function dyCard(){const t=todayStr(),e=(S.diary||[]).find(x=>x.d===t),ed=e&&window.dyEditing;
  if(kst().getUTCHours()<DY_FROM)return '';
  return `<div class="card"><h2>🌙 하루 마무리 한 줄</h2>${e&&!ed?`<div>✏️ ${esc(e.t)}</div><div class="muted" style="margin-top:6px">${toriDiaryIcon()} ${esc(hn())}: ${esc(e.r)}</div><button class="btn ghost sm" style="margin-top:8px" onclick="window.dyEditing=1;rHome()">고치기</button>`:`<input id="dyi" maxlength="60" placeholder="오늘 하루, 한 줄로 남긴다면?" value="${esc(ed?e.t:'')}"><button class="btn wood full" onclick="dySave()">기록하고 ${esc(hn())}에게 보여주기</button>`}<button class="btn ghost sm" style="margin-top:8px" onclick="dSub='diary';go('place')">📖 지난 일기 보기</button></div>`;}
function dySave(){const v=$('dyi').value.trim();if(!v){toast('한 줄을 적어 주세요');return;}const t=todayStr();S.diary=(S.diary||[]).filter(x=>x.d!==t);S.diary.unshift({d:t,t:v,r:dyReact(v)});S.diary.sort((a,b)=>a.d<b.d?1:a.d>b.d?-1:0);S.diary=S.diary.slice(0,1500);window.dyEditing=0;save();sfx('fan');rHome();toast('🐹 '+hn()+'가 한 줄을 읽었어요');}
/* ---------- 지난 오늘의 일기 (홈 화면) ---------- */
function dyAgoDate(n,u){const t=todayStr(),y=+t.slice(0,4),m=+t.slice(5,7),d=+t.slice(8,10);let yy=y,mm=m;
  if(u==='y')yy=y-n;else{mm=m-n;while(mm<1){mm+=12;yy--;}}
  const last=new Date(Date.UTC(yy,mm,0)).getUTCDate();return yy+'-'+p2(mm)+'-'+p2(Math.min(d,last));}
function dyMemCard(){const map=new Map((S.diary||[]).map(e=>[e.d,e])),L=[];
  const add=(lb,ds)=>{const e=map.get(ds);if(e)L.push({lb,e});};
  add('지난달 오늘',dyAgoDate(1,'m'));
  for(let n=1;n<=10;n++)add(n===1?'작년 오늘':n+'년 전 오늘',dyAgoDate(n,'y'));
  if(!L.length)return '';
  return `<div class="card"><h2>🕰️ 지난 오늘의 일기</h2>${L.slice(0,4).map(({lb,e})=>`<div class="q"><span>${lb} · ${esc(e.d)}<div>${esc(e.t)}</div><div class="muted">${toriDiaryIcon()} ${esc(hn())}: ${esc(e.r||'')}</div></span></div>`).join('')}</div>`;}
/* ---------- 일기 다시 보기 (도감 > 일기) ---------- */
const dyEnt=e=>`<div class="card"><div class="row sp"><b>${esc(e.d)} (${wdOf(e.d)})</b><button class="btn ghost sm" onclick="dyForm('${esc(e.d)}')">✏️</button></div><div>${esc(e.t)}</div><div class="muted" style="margin-top:4px">${toriDiaryIcon()} ${esc(hn())}: ${esc(e.r||'')}</div></div>`;
function dyItems(){const all=[...(S.diary||[])].sort((a,b)=>b.d.localeCompare(a.d)),q=dyQ.trim().toLowerCase();return {all,q,L:all.filter(e=>q?(e.t||'').toLowerCase().includes(q):e.d.slice(0,7)===cMon)};}
function dyView(){const {all,q,L}=dyItems(),pages=Math.max(1,Math.ceil(L.length/DY_PAGE_SIZE));dyPage=Math.max(0,Math.min(dyPage,pages-1));const group=Math.floor(dyPage/5)*5,sum=q?'검색 결과 '+L.length+'개':'이 달 '+L.length+'일 · 전체 '+all.length+'일 기록';
 const nav=L.length?`<nav class="place-pages" aria-label="일기 페이지"><button class="btn ghost sm" onclick="dyPageMove(-1)" aria-label="이전 일기 페이지">◀</button>${Array.from({length:Math.min(5,pages-group)},(_,j)=>{const n=group+j;return `<button class="btn ghost sm" onclick="dyPageTo(${n})" ${n===dyPage?'aria-current="page"':''}>${n+1}</button>`;}).join('')}<button class="btn ghost sm" onclick="dyPageMove(1)" aria-label="다음 일기 페이지">▶</button></nav><p class="muted" style="text-align:center">${dyPage+1} / ${pages} 페이지 · ${L.length}일</p>`:'';
 return {sum,html:(L.slice(dyPage*DY_PAGE_SIZE,(dyPage+1)*DY_PAGE_SIZE).map(dyEnt).join('')||`<div class="empty">${q?'찾는 일기가 없어요.':'이 달에는 일기가 없어요.'}</div>`)+nav};}
function dyRefresh(){const r=dyView();$('dysum').textContent=r.sum;$('dylist').innerHTML=r.html;}
function dyFind(v){dyQ=v;dyPage=0;dyRefresh();}
function dyPageMove(d){const pages=Math.max(1,Math.ceil(dyItems().L.length/DY_PAGE_SIZE));dyPage=(dyPage+d+pages)%pages;dyRefresh();}
function dyPageTo(p){dyPage=p;dyRefresh();}
function rDiary(){const t=todayStr();if(!cMon)cMon=t.slice(0,7);const [y,m]=cMon.split('-').map(Number),r=dyView();
  $('dbody').innerHTML=`<div class="card"><div class="row sp"><button class="btn sm" onclick="calMv(-1)">◀</button><h2 style="margin:0">📖 ${y}년 ${m}월</h2><button class="btn sm" onclick="calMv(1)">▶</button></div><input id="dyq" placeholder="🔍 일기 검색 (전체 기간)" value="${esc(dyQ)}" oninput="dyFind(this.value)" style="margin-top:10px"><div class="muted" id="dysum">${r.sum}</div><button class="btn wood full" style="margin-top:8px" onclick="dyForm()">+ 일기 쓰기 · 지난 날 고치기</button></div><div id="dylist">${r.html}</div>`;}
function dyForm(d){const t=todayStr(),ds=d||t,e=(S.diary||[]).find(x=>x.d===ds);
  modal(`<h3>${toriDiaryIcon()} 일기 ${e?'고치기':'쓰기'}</h3><label>날짜</label><input id="dyd" type="date" max="${t}" value="${esc(ds)}" onchange="dyPick()"><label>한 줄</label><input id="dyt" maxlength="60" placeholder="그날 하루, 한 줄로" value="${esc(e?e.t:'')}"><div class="muted" id="dyn">${e?'이 날 일기가 있어요. 저장하면 바뀌어요.':''}</div><div class="row" style="margin-top:8px"><button class="btn ghost full" onclick="closeM()">취소</button><button class="btn full" onclick="dyEdSave()">저장</button></div><button id="dyx" class="btn pink full" style="margin-top:8px;${e?'':'display:none'}" onclick="dyDel()">이 날 일기 삭제</button>`);}
function dyPick(){const ds=$('dyd').value,e=(S.diary||[]).find(x=>x.d===ds);if(e)$('dyt').value=e.t;$('dyn').textContent=e?'이 날 일기가 있어요. 저장하면 바뀌어요.':'';$('dyx').style.display=e?'':'none';}
function dyEdSave(){const ds=$('dyd').value,v=$('dyt').value.trim(),t=todayStr();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(ds)||ds>t){toast('오늘까지의 날짜를 골라 주세요');return;}
  if(!v){toast('한 줄을 적어 주세요');return;}
  const o=(S.diary||[]).find(x=>x.d===ds),r=o&&o.t===v&&o.r?o.r:dyReact(v);
  S.diary=(S.diary||[]).filter(x=>x.d!==ds).concat([{d:ds,t:v,r}]).sort((a,b)=>a.d<b.d?1:a.d>b.d?-1:0).slice(0,1500);
  window.dyEditing=0;save();closeM();sfx('coin');render();toast('일기를 저장했어요');takoDiaryRec(ds,!!o);}
function dyDel(){const ds=$('dyd').value;askOk('이 날 일기를 지울까요?',()=>{S.diary=(S.diary||[]).filter(x=>x.d!==ds);save();render();toast('지웠어요');});}
/* 도토리 내역용 이름표: 함수를 부르는 동안 들어오는 도토리에 이유를 붙여요 */
[['checkIn','출석 체크'],['qDone','퀘스트'],['wDone','주간 퀘스트'],['quickAct','빠른 기록'],['actSave','활동 기록'],['plSave','도감 기록'],['songUp','곡 완성'],['mgEnd','미니게임'],['mg2End','미니게임'],['mg3End','미니게임'],['mg4End','미니게임'],['mg5End','미니게임'],['mg6End','미니게임'],['mg7End','미니게임'],['mg8End','미니게임'],['pat','쓰담쓰담'],['feed','토리에게 주기'],['dBuy','토리의 방'],['dSetChk','장식 세트 완성'],['gachaGo','보상 뽑기'],['claimBday','생일 선물'],['achChk','업적']].forEach(([n,l])=>{const f=window[n];if(typeof f!=='function')return;window[n]=function(){const o=ACW;if(!o)ACW=l;try{return f.apply(this,arguments);}finally{ACW=o;}};});
hold=fresh||loadErr;checkIn();if(hold)idbRestore();else save();
/* 첫 화면은 다른 js 파일(boardgames.js 등)까지 다 읽은 뒤 그려요 (v1.1.9에서 파일을 나눈 뒤 osCard가 없다는 오류가 났음) */
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>render(),{once:true});else render();
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist();}catch(e){}setTimeout(autoBackup,2500);setTimeout(lvNotice,3800);setTimeout(shopNotice,6500);
/* 실행 화면: 화면을 터치해야 넘어가요 */
(function(){const o=document.createElement('div');o.id='splash';
o.innerHTML=`<div class="spf"><img src="${AVATAR}" alt=""><h1>안녕 진우야!</h1><p>${esc(hn())}가 기다리고 있었어요 🌰</p><div class="muted go">▼ 터치해서 시작</div></div>`;
document.body.appendChild(o);let d=0;const c=()=>{if(d)return;d=1;o.classList.add('out');setTimeout(()=>o.remove(),450);setTimeout(takoStart,750);};o.addEventListener('click',c);})();
