/* 토리네 온천 — 온천 화면·소리·풍경 */
// Onsen preview: real local time, frame-stepped scenery and locally synthesized ambience.
const OS={audio:null,clockTimer:null,frameTimer:null,observer:null,active:false,ui:true,volume:35,ctx:null,gain:null,water:null,frame:0,cycle:-1,lastTalk:{},retry:null};
const OS_LANDSCAPES=['images/scenes/onsen-landscape-day-v118.webp','images/scenes/onsen-landscape-day-v118.webp','images/scenes/onsen-landscape-day-v118.webp','images/scenes/onsen-landscape-night-v118.webp'];
const OS_PORTRAITS=['images/scenes/onsen-portrait-day-v118.webp','images/scenes/onsen-portrait-day-v118.webp','images/scenes/onsen-portrait-day-v118.webp','images/scenes/onsen-portrait-night-v118.webp'];
const OS_ANIMALS={'토리':'images/icons/onsen-tori-v102.png','호두':'images/icons/onsen-hodu-v102.png','도치':'images/icons/onsen-dochi-v102.png','부엉박사':'images/icons/onsen-owl-v102.png'};
const OS_MUSIC='audio/onsen-pixel-bgm-v102.wav';
const OS_SLOTS=[{name:'아침',friends:['토리','호두'],line:'따뜻한 물부터 만나고, 오늘은 천천히 시작해요.'},{name:'낮',friends:['토리','도치'],line:'햇살이 물 위에서 쉬고 있어요. 우리도 같이 쉴까요?'},{name:'저녁',friends:['토리','부엉박사'],line:'오늘 들고 온 생각들을 물가에 잠깐 내려놓아요.'},{name:'밤',friends:['토리','호두','도치','부엉박사'],line:'작은 물소리와 함께, 오늘도 여기까지 잘 왔어요.'}];
const OS_LINES={
 '토리':['찍찍… 따끈한 물에 들어오니까 볼주머니까지 풀리는 기분이에요.','저 구름, 도토리를 닮지 않았어요? 아, 제가 조금 배고픈가 봐요.','오늘은 아무것도 안 해도 괜찮아요. 토리랑 둥둥 떠 있어요.','수건이 자꾸 한쪽으로 기울어요. 제 귀가 베개가 됐나 봐요.','대나무가 톡 하고 인사했어요. 토리도 작게 찍찍!','물 위에 햇빛 조각이 떠 있어요. 주워서 집에 가져가고 싶어요.','급한 마음은 바깥에 두고 왔어요. 나갈 때도 꼭 챙길 필요는 없겠죠?','저는 수영보다 온천욕이 좋아요. 발을 안 바쁘게 움직여도 되거든요.','옆에 같이 있어 주니까 물이 조금 더 따뜻한 것 같아요.','지금 이 시간이 오늘의 제일 폭신한 순간이에요.','물결이 제 발끝을 간질였어요. 저 웃는 거 아니에요, 찍찍…','온천 끝나면 시원한 물 한 모금 마셔요. 토리도 같이 마실게요.'],
 '호두':['꼬리는 물 밖에! 오늘은 도토리 걱정도 물 밖에!','저 바위 뒤에 도토리를 숨겨 뒀는데… 아니, 오늘은 생각 안 할래.','나무 위에서 보는 구름이랑 물속에서 보는 구름은 기분이 달라.','톡, 하고 들렸지? 대나무가 우리 쉬는 시간 재는 것 같아.','꼬리 말리는 데 오래 걸려도 괜찮아. 오늘은 서두를 일 없으니까.','온천에 도토리를 띄우면 배가 될까? …알았어, 안 띄울게.','나 아까부터 가만히 있었어. 이 정도면 꽤 대단한 거야.','여기서는 바람도 살금살금 부네. 꼬리가 조금만 흔들려.','따뜻한 돌에 앉아서 쉬는 것도 좋더라. 나중에 같이 가 보자.','구름 하나 지나갈 때까지는 더 쉬자. 큰 구름이면 더 오래!','뭔가 떠오르려다가 잊어버렸어. 오늘은 그것도 괜찮겠지?','내일 할 일은 내일의 호두에게 맡겼어. 지금의 호두는 온천 담당!'],
 '도치':['물 온도가 딱 좋다치. 오늘은 가시도 힘을 뺐다치.','물에 비친 구름이 나보다 빨리 움직인다치. 난 여기 있을 거다치.','수건을 작게 접었는데 아직도 내 머리보다 크다치.','톡 소리 들을 때마다 마음속 생각이 하나씩 떨어진다치.','쉬는 것도 잘하는 일이란다치. 오늘은 다 같이 잘하고 있다치.','이 바위는 따뜻하고 저 바위는 더 따뜻하다치. 연구는 여기까지다치.','첨벙 뛰어들지는 않는다치. 작은 물결부터 친구가 된다치.','난 조용히 있어도 즐겁다치. 옆에 있는 건 잘 알고 있다치.','방금 새가 왔다 갔다치. 온천 구경만 하고 갔다치.','온천물에 별이 떠 있다치. 건드리면 도망가니까 보기만 한다치.','가시 끝에 물방울이 반짝인다치. 오늘의 장식이다치.','잠깐 눈 감아도 된다치. 내가 물소리 듣고 있겠다치.'],
 '부엉박사':['오늘의 연구 주제는 아무것도 하지 않는 즐거움입니다. 자료는 충분하군요.','대나무에 물이 차면 균형이 바뀝니다. 쉬는 시간도 마음의 균형을 찾아 주지요.','저는 물결의 수를 세다가 그만두었습니다. 그냥 바라보는 편이 좋더군요.','안경에 김이 서려도 괜찮습니다. 지금은 또렷이 볼 일이 많지 않으니까요.','한숨을 길게 내쉬어 보세요. 물소리가 그 뒤를 조용히 채워 줄 겁니다.','저 구름은 조금 전과 다른 모양이군요. 천천히 변하는 것도 변화랍니다.','해가 지는 속도를 재려 했는데, 감상하는 쪽으로 연구 계획을 바꿨습니다.','오늘 풀리지 않은 문제는 잠시 접어 두지요. 젖으면 글씨가 번질 테니까요.','별빛과 물빛은 다른 빛인데도 여기서는 사이좋게 어울리는군요.','대나무의 톡 소리가 아주 좋은 쉼표입니다. 문장을 끝내지 않아도 쉴 수 있지요.','따뜻한 물, 작은 바람, 곁에 있는 친구들. 오늘의 결론은 꽤 간단하군요.','쉬는 시간에는 정답을 찾지 않아도 됩니다. 함께 있다는 사실이면 충분하지요.']};
// Local calendar seasons: spring Mar–May, summer Jun–Aug, autumn Sep–Nov.
const OS_SEASON_LINES={
 spring:{
  '토리':['찍찍! 꽃잎이 물가까지 놀러 왔어요. 오늘은 눈으로만 간식 구경해요.','따뜻한 바람이 귀 끝에 닿았어요. 토리도 봄이 온 걸 알겠어요.','새싹은 조금씩 자라는데도 매일 달라요. 토리도 천천히 해 볼래요.'],
  '호두':['새 가지가 생겼다람. 온천 끝나면 나무 위에서 봄 구경하자람.','꽃잎이 꼬리에 붙었다람. 오늘은 숲에서 받은 장식이다람.','겨울에 숨겨 둔 도토리를 찾았다람! 새싹이 난 건 숲한테 양보할 거다람.'],
  '도치':['풀잎이 간지럽다치. 봄이 내 가시보다 부드럽다치.','꽃 냄새는 바람에 맡기고 나는 물속에서 쉬겠다치.','새들이 아침부터 노래한다치. 오늘은 박수 대신 물결을 보내겠다치.'],
  '부엉박사':['새싹은 서두르지 않아도 햇빛 쪽으로 자랍니다. 좋은 참고 자료군요.','꽃잎이 물 위를 지나가는 속도를 재다가 봄 구경으로 바꿨습니다.','봄바람과 따뜻한 물이 번갈아 인사하는군요. 귀 기울여 보시겠어요?']},
 summer:{
  '토리':['찍찍! 나뭇잎 그늘이 커졌어요. 온천 끝나면 그 아래에서 물 한 모금 마셔요.','매미도 오늘 열심히 노래하네요. 토리는 조용한 관객이 될게요.','따뜻한 물에 잠깐 쉬었으니, 밖에 나가서는 시원한 바람을 만날래요.'],
  '호두':['꼬리로 부채질하면 시원하다람. 물 밖에서만 해 줄게람.','풀숲이 무성해져서 도토리 숨길 곳도 많아졌다람. 위치는 꼭 기억할 거다람.','구름이 커서 그늘도 크다람. 저 구름 아래까지 느긋하게 걸어가자람.'],
  '도치':['햇빛이 힘이 세다치. 오늘은 그늘이 있는 자리가 내 자리다치.','수건이 금방 마른다치. 그렇다고 물에 또 넣지는 않겠다치.','매미가 잠깐 조용해졌다치. 물소리가 자기 차례를 얻었다치.'],
  '부엉박사':['여름에는 쉬는 중에도 물을 챙기면 좋지요. 나가서 함께 한 모금 마십시다.','나뭇잎이 만든 그늘에는 여러 모양이 있군요. 오늘의 관찰은 여기까지입니다.','바람이 잠깐 지나갔습니다. 더운 날의 작은 선물이군요.']},
 autumn:{
  '토리':['찍찍! 낙엽이 도토리랑 같이 인사하러 왔어요. 토리가 좋아하는 계절이에요.','물 밖 공기가 조금 차가워졌어요. 수건으로 귀까지 폭신하게 감쌀래요.','오늘은 바스락 소리도 물소리처럼 들려요. 숲이 쉬는 얘기를 하나 봐요.'],
  '호두':['도토리 창고 정리는 끝났다람. 이제 온천에서 머릿속도 비울 거다람.','꼬리 색이랑 낙엽 색이 비슷하다람. 숲이 내 옷을 따라 입었나 보다람.','바스락 소리가 들리면 자꾸 돌아보게 된다람. 오늘은 도토리 말고 바람이었다람.'],
  '도치':['낙엽이 가시 위에 앉았다치. 바람이 데려갈 때까지 기다리겠다치.','따뜻한 돌이 더 반갑다치. 오늘은 이 자리에서 가을을 보겠다치.','숲에서 도토리가 톡 떨어졌다치. 대나무랑 번갈아 연주한다치.'],
  '부엉박사':['나뭇잎이 색을 바꾸는 중입니다. 천천히 바뀌는 풍경은 오래 보게 되는군요.','가을바람이 차가워졌군요. 나갈 때는 수건을 잘 챙겨야겠습니다.','낙엽 소리, 대나무 소리, 물소리. 오늘은 기록 대신 그냥 듣겠습니다.']},
 winter:{
  '토리':['찍찍! 코끝은 시원하고 발끝은 따뜻해요. 겨울 온천은 두 가지 기분이에요.','김이 작은 구름처럼 올라가요. 토리의 겨울 인사도 같이 날아가요.','나갈 때 수건을 꼭 덮을래요. 오늘의 따뜻함을 조금 가져가고 싶어요.'],
  '호두':['숨겨 둔 도토리는 넉넉하다람. 오늘은 꼬리까지 포근하게 쉬겠다람.','나뭇가지가 조용하다람. 봄이 올 때까지 나도 조금 천천히 지낼 거다람.','밖에서는 입김, 여기서는 물김이다람. 구름 만들기 대회 같지만 조용히 볼 거다람.'],
  '도치':['겨울에는 따뜻한 자리를 더 잘 찾는다치. 오늘의 실력은 이 바위가 증명한다치.','찬 바람은 수건으로 막겠다치. 가시는 바람막이가 아니었다치.','물김 사이로 친구가 보인다치. 가까이 있는 것만으로도 든든하다치.'],
  '부엉박사':['찬 공기와 따뜻한 물이 만나 김을 만드는군요. 겨울의 작은 풍경입니다.','겨울 숲은 조용하지만 멈춘 것은 아닙니다. 우리도 잠깐 쉬어 가지요.','나갈 때는 몸을 잘 말리고 따뜻하게 감싸세요. 오늘의 마지막 연구 과제입니다.']}
};
function osSeason(date=new Date()){const m=date.getMonth();return m>=2&&m<=4?'spring':m>=5&&m<=7?'summer':m>=8&&m<=10?'autumn':'winter';}
function osClock(){const h=new Date().getHours();return h>=6&&h<11?0:h>=11&&h<17?1:h>=17&&h<21?2:3;}
function osIsOpen(){return OS.active&&!!$('bgo')&&$('bgo').classList.contains('onsen-playing');}
function osRender(quiet=false){if(!osIsOpen())return;const prior=quiet&&$('os-talk')?$('os-talk').textContent:null,index=osClock(),t=OS_SLOTS[index];
 $('bgb').innerHTML=`<div class="os-scene os-slot-${index} ${OS.ui?'':'os-ui-off'}"><picture><source media="(orientation: portrait)" srcset="${OS_PORTRAITS[index]}"><img class="os-background" src="${OS_LANDSCAPES[index]}" alt="${t.name}의 토리네 온천"></picture><canvas class="os-bamboo" id="os-bamboo" width="1672" height="941" aria-hidden="true"></canvas><canvas class="os-weather" id="os-weather" aria-hidden="true"></canvas><div class="os-friends ${t.friends.length===4?'os-four':'os-two'}">${t.friends.map((n,i)=>`<button class="os-friend" style="--i:${i};--size:${n==='토리'?1:n==='부엉박사'?.96:n==='호두'?.92:.89}" onclick="osTalk('${n}')" aria-label="${n}와 이야기"><img src="${OS_ANIMALS[n]}" alt="${n}"></button>`).join('')}</div><i class="os-steam s1"></i><i class="os-steam s2"></i><i class="os-steam s3"></i><button class="os-icon os-exit" onclick="osExit()" aria-label="온천 나가기">←</button><div class="os-volume"><button class="os-icon" id="os-volume-button" onclick="osVolumeToggle()" aria-label="온천 소리 조절" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3zM16 8q5 4 0 8M19 5q8 7 0 14"/></svg></button><div class="os-volume-panel" id="os-volume-panel" hidden><label for="os-volume">소리 <output id="os-volume-value">${OS.volume}%</output></label><input id="os-volume" type="range" min="0" max="100" value="${OS.volume}" oninput="osSetVolume(this.value)" aria-label="배경음악과 온천 효과음 볼륨"></div></div><div class="os-hud"><p id="os-talk" class="os-talk" >${t.line}</p></div></div>`;
 if(prior!==null)$('os-talk').textContent=prior;osSceneArt(index);
 document.querySelector('.os-scene').addEventListener('click',e=>{if(e.target.classList.contains('os-background')||e.target.classList.contains('os-scene'))osToggleUI();});osLayoutFriends();osDraw();osDrawBamboo();
}
function osVolumeToggle(){const p=$('os-volume-panel');p.hidden=!p.hidden;$('os-volume-button').setAttribute('aria-expanded',String(!p.hidden));if(!p.hidden)osAudioStart();}
function osSetVolume(v){OS.volume=Math.max(0,Math.min(100,Number(v)||0));S.osVolume=OS.volume;save();if(OS.audio)OS.audio.volume=OS.volume/100*.65;if(OS.gain)OS.gain.gain.setTargetAtTime(OS.volume/100,OS.ctx.currentTime,.05);if($('os-volume-value'))$('os-volume-value').textContent=OS.volume+'%';if(OS.volume>0)osAudioStart();}
function osToggleUI(){OS.ui=!OS.ui;const el=document.querySelector('.os-scene');if(el)el.classList.toggle('os-ui-off',!OS.ui);}
function osTalk(n){if(!OS_LINES[n])return;const seasonal=OS_SEASON_LINES[osSeason()][n],pool=Math.random()<.5?seasonal:OS_LINES[n],a=pool.filter(line=>line!==OS.lastTalk[n]),line=a[Math.floor(Math.random()*a.length)];OS.lastTalk[n]=line;OS.ui=true;document.querySelector('.os-scene').classList.remove('os-ui-off');$('os-talk').textContent=n+': '+line;}
function osAudioStart(){if(!osIsOpen()||document.hidden)return;
 if(!OS.audio){OS.audio=new Audio(OS_MUSIC);OS.audio.loop=true;OS.audio.volume=OS.volume/100*.65;}
 if(OS.audio.paused)OS.audio.play().catch(()=>{});
 try{if(!OS.ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;OS.ctx=new C();OS.gain=OS.ctx.createGain();OS.gain.gain.value=OS.volume/100;OS.gain.connect(OS.ctx.destination);
  const b=OS.ctx.createBuffer(1,OS.ctx.sampleRate*6,OS.ctx.sampleRate),a=b.getChannelData(0);let brown=0;for(let i=0;i<a.length;i++){const white=Math.random()*2-1;brown=(brown+.025*white)/1.025;a[i]=brown*2.5;}
  const src=OS.ctx.createBufferSource();src.buffer=b;src.loop=true;const filter=OS.ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1900;const g=OS.ctx.createGain();g.gain.value=.18;src.connect(filter);filter.connect(g);g.connect(OS.gain);src.start();OS.water=src;
 }osKnockLoad();if(OS.ctx.state==='suspended')OS.ctx.resume().catch(()=>{});}catch(e){}
}
function osTone(freq,duration,volume,type='sine',end){if(!OS.ctx||OS.ctx.state!=='running'||!osIsOpen()||document.hidden||OS.volume===0)return;const c=OS.ctx,t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(end)o.frequency.exponentialRampToValueAtTime(end,t+duration);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(OS.gain);o.start(t);o.stop(t+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();};}
function osKnockLoad(){if(OS.knockBuffer||OS.knockLoading||!OS.ctx)return;const ctx=OS.ctx;
 OS.knockLoading=fetch('audio/onsen-bamboo-knock-v114.wav').then(r=>{if(!r.ok)throw new Error('knock');return r.arrayBuffer();}).then(a=>ctx.decodeAudioData(a)).then(b=>{OS.knockBuffer=b;}).catch(()=>{}).finally(()=>{OS.knockLoading=null;});}
function osKnock(){if(!OS.ctx||OS.ctx.state!=='running'||!OS.knockBuffer||!osIsOpen()||document.hidden||OS.volume===0)return;
 const src=OS.ctx.createBufferSource(),gain=OS.ctx.createGain();src.buffer=OS.knockBuffer;gain.gain.value=.5;src.connect(gain);gain.connect(OS.gain);src.start();src.onended=()=>{src.disconnect();gain.disconnect();};}
function osDrip(){osTone(980,.09,.035,'sine',1700);}
// Background, sprites and friends share one uncropped scene coordinate system.
function osSceneSize(c){const portrait=c.clientHeight>=c.clientWidth;return {portrait,W:portrait?288:1672,H:portrait?512:941};}
function osLayoutFriends(){const c=$('os-bamboo');if(!c)return;const {portrait,W,H}=osSceneSize(c),scale=Math.min(c.clientWidth/W,c.clientHeight/H),ox=(c.clientWidth-W*scale)/2,oy=(c.clientHeight-H*scale)/2;
 const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;document.querySelectorAll('.os-friend').forEach((el,i)=>{const [x,y,w]=osFriendPlaces(portrait)[i];el.style.left=(ox+x*scale)+'px';el.style.top=(oy+y*scale)+'px';el.style.width=(w*scale)+'px';el.style.transform='translate(-50%,calc(-50% + '+(reduced?0:osFloatPose(OS.frame,i)*(portrait?1:3)*scale)+'px))';});}
function osFloatPose(f,i){return [0,1,1,0,-1,-1][(Math.floor(f/4)+i*2)%6];}
function osFriendPlaces(portrait){const four=OS_SLOTS[osClock()].friends.length===4;return portrait?(four?[[92,350,56],[152,354,49],[126,408,44],[185,412,48]]:[[98,358,56],[171,393,49]]):(four?[[700,690,145],[970,690,140],[800,786,128],[1160,770,140]]:[[760,710,150],[1040,775,145]]);}
function osSceneArt(slot){const c=$('os-weather');if(!c)return;const {portrait}=osSceneSize(c),key=(portrait?'p':'l')+slot;if(OS.sceneKey===key)return;OS.sceneKey=key;const img=new Image();OS.sceneArt=img;OS.waterPlateKey=null;OS.starKey=null;img.onload=()=>{if(OS.sceneArt===img&&osIsOpen())osDraw();};img.src=portrait?OS_PORTRAITS[slot]:OS_LANDSCAPES[slot];}
function osPlate(portrait,W,H){osSceneArt(osClock());const img=OS.sceneArt;if(!img||!img.complete||!img.naturalWidth)return null;
 if(!OS.waterPlate)OS.waterPlate=document.createElement('canvas');const c=OS.waterPlate;if(c.width!==W||c.height!==H||OS.waterPlateKey!==OS.sceneKey){c.width=W;c.height=H;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(img,0,0,W,H);osTintPlate(g,W,H,osClock());OS.waterPlateKey=OS.sceneKey;}return c;}
function osTintPlate(g,W,H,slot){if((slot!==0&&slot!==2)||!g.getImageData)return;const sepia=t=>[1-.607*t,.769*t,.189*t,.349*t,1-.314*t,.168*t,.272*t,.534*t,1-.869*t],sat=t=>[.213+.787*t,.715-.715*t,.072-.072*t,.213-.213*t,.715+.285*t,.072-.072*t,.213-.213*t,.715-.715*t,.072+.928*t],hue=t=>{const c=Math.cos(t),s=Math.sin(t);return [.213+.787*c-.213*s,.715-.715*c-.715*s,.072-.072*c+.928*s,.213-.213*c+.143*s,.715+.285*c+.140*s,.072-.072*c-.283*s,.213-.213*c-.787*s,.715-.715*c+.715*s,.072+.928*c+.072*s];},mul=(a,b)=>Array.from({length:9},(_,i)=>[0,1,2].reduce((v,k)=>v+a[Math.floor(i/3)*3+k]*b[k*3+i%3],0));
 const matrix=slot===0?mul(sepia(.12),sat(.82)).map(x=>x*.96):mul(hue(335*Math.PI/180),mul(sat(.85),sepia(.4))).map(x=>x*.82),im=g.getImageData(0,0,W,H),a=im.data;for(let i=0;i<a.length;i+=4){const r=a[i],b=a[i+1],c=a[i+2];a[i]=matrix[0]*r+matrix[1]*b+matrix[2]*c;a[i+1]=matrix[3]*r+matrix[4]*b+matrix[5]*c;a[i+2]=matrix[6]*r+matrix[7]*b+matrix[8]*c;}g.putImageData(im,0,0);}
function osPool(portrait){return portrait?[[150,301],[201,304],[210,316],[248,329],[281,339],[281,390],[251,414],[236,425],[201,444],[174,459],[160,462],[140,450],[119,439],[118,428],[80,414],[57,395],[53,360],[72,338],[84,317],[120,310]]:[[720,612],[1010,615],[1150,640],[1258,669],[1350,683],[1352,696],[1430,728],[1490,753],[1445,785],[1300,817],[1040,867],[900,862],[753,847],[625,860],[500,806],[368,785],[326,746],[279,731],[287,716],[420,680],[590,648]];}
function osClipPool(g,portrait){g.beginPath();osPool(portrait).forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.clip();}
function osWaterTexture(g,portrait,W,H,f){const c=osPlate(portrait,W,H);if(!c)return;const step=portrait?2:6,top=portrait?300:610,bottom=portrait?465:875;for(let y=top;y<bottom;y+=step){const dx=[0,1,1,0,-1,-1][(Math.floor(f/3)+Math.floor(y/step/3))%6]*(portrait?1:3);g.drawImage(c,0,y,W,step,dx,y,W,step);}}
// Discover actual bright star pixels once. Each cluster keeps its position and its own rhythm.
function osStarPixels(portrait,W,H){if(OS.starKey===OS.sceneKey)return OS.stars||[];const c=osPlate(portrait,W,H);if(!c)return [];
 const g=c.getContext('2d');if(!g.getImageData)return [];const a=g.getImageData(0,0,W,H).data,maxY=portrait?104:215,moon=portrait?[175,38,222,88]:[1020,55,1150,180],seen=new Set(),stars=[];
 const bright=(x,y)=>{if(x<0||x>=W||y<0||y>=maxY||(x>=moon[0]&&x<=moon[2]&&y>=moon[1]&&y<=moon[3]))return false;const i=(y*W+x)*4;return a[i]>174&&a[i+1]>155&&a[i+2]>95;};
 for(let y=0;y<maxY;y++)for(let x=0;x<W;x++){const key=y*W+x;if(seen.has(key)||!bright(x,y))continue;const queue=[[x,y]],pixels=[];seen.add(key);for(let j=0;j<queue.length;j++){const [xx,yy]=queue[j],i=(yy*W+xx)*4;pixels.push([xx,yy,a[i],a[i+1],a[i+2]]);for(const [dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=xx+dx,ny=yy+dy,nk=ny*W+nx;if(!seen.has(nk)&&bright(nx,ny)){seen.add(nk);queue.push([nx,ny]);}}}if(pixels.length<(portrait?65:220))stars.push(pixels);}
 OS.starKey=OS.sceneKey;OS.stars=stars;return stars;}
function osSkyLights(g,p,portrait,s,f,k){if(s===2||s===3){const level=[.035,.055,.075,.055][Math.floor(f/13)%4];g.fillStyle='rgba(255,202,94,'+level+')';const panes=portrait?[[2,181,14,43],[42,189,23,52]]:[[18,307,65,118],[104,312,77,116],[264,330,83,106]];panes.forEach(r=>g.fillRect(...r));}
 if(s!==3)return;const W=portrait?288:1672,H=portrait?512:941;
 osStarPixels(portrait,W,H).forEach((pixels,i)=>{const levels=[.56,.66,.82,1,.9,.75,.62,.56],level=levels[(Math.floor(f/(5+i%5))+i*3)%levels.length];pixels.forEach(([x,y,r,b,c])=>p(x,y,1,1,'rgb('+Math.round(r*level)+','+Math.round(b*level)+','+Math.round(c*level)+')'));});
 // Light on the existing crescent is still; its reflection is animated separately in water.
 const box=portrait?[182,46,31,34]:[1037,68,95,103];g.save();g.globalAlpha=[.025,.04,.055,.04][Math.floor(f/16)%4];const c=osPlate(portrait,W,H);if(c)g.drawImage(c,...box,...box);g.restore();}
function osWaterLight(g,p,portrait,s,f,k){const cx=portrait?171:976,top=portrait?320:630,bottom=portrait?458:858,step=portrait?6:15,pose=[0,1,1,0,-1,-1][Math.floor(f/6)%6];
 if(s===3){const alpha=[.055,.075,.095,.075][Math.floor(f/11)%4];for(let y=top;y<bottom;y+=step){const width=(portrait?6:22)+(y-top)*.16;p(cx-width/2+pose*k,y,width,k,'rgba(255,245,183,'+alpha+')');}}
 else{const alpha=[.025,.035,.045,.035][Math.floor(f/14)%4],beam=portrait?144:930;for(let y=top+30*k;y<bottom;y+=4*k){const spread=(portrait?26:92)+(y-top)*.15;for(let x=beam-spread;x<beam+spread;x+=5*k){if((Math.round(x/k)+Math.round(y/k))%3===0)p(x+pose*k,y,2*k,k,'rgba(255,237,159,'+alpha+')');}}}}
function osDraw(){const c=$('os-weather');if(!c)return;const {portrait,W,H}=osSceneSize(c);if(c.width!==W||c.height!==H){c.width=W;c.height=H;}const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,W,H);const f=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:OS.frame,s=osClock(),k=portrait?1:3,p=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
 g.save();osClipPool(g,portrait);osWaterTexture(g,portrait,W,H,f);osWaterLight(g,p,portrait,s,f,k);
 for(let i=0;i<18;i++){const pose=[0,0,1,1,0,-1][(Math.floor(f/2)+i)%6];p((portrait?70:400)+(i*37)%(portrait?180:1000)+pose*k,(portrait?315:650)+(i*19)%(portrait?120:200),(4+i%5)*k,k,s===3?'#bde9d629':s===2?'#ffe6ac35':'#fff5bb3c');}
 osFriendPlaces(portrait).forEach(([x,y,w],i)=>{const sway=osFloatPose(f,i)*k,rx=w*.38,ry=y+w*.3+sway;for(let j=0;j<3;j++)p(x-rx-j*k,ry+j*2*k,rx*2+j*2*k,k,s===3?'#9be4db50':'#edffef70');});g.restore();osSkyLights(g,p,portrait,s,f,k);osDrawBirds(p,W,H,f,k,s);}
function osBirdCount(r=Math.random()){return r<.5?1:r<.8?2:r<.95?3:r<.98?4:5;}
function osDrawBirds(p,W,H,f,k,s){const phase=f%360;if(phase<210||phase>=274)return;const cycle=Math.floor(f/360);
 if(OS.birdCycle!==cycle){OS.birdCycle=cycle;OS.birdFlock={n:osBirdCount(),dir:Math.random()<.5?1:-1,start:.12+Math.random()*.035,end:.14+Math.random()*.055,bend:(Math.random()<.5?-1:1)*.035};}
 const flock=OS.birdFlock,t=(phase-210)/64,u=1-t,x=(flock.dir===1?t:1-t)*(W+60*k)-30*k,y=H*(u*u*u*flock.start+3*u*u*t*(flock.start+flock.bend)+3*u*t*t*(flock.end-flock.bend)+t*t*t*flock.end);
 for(let i=0;i<flock.n;i++){const bx=x-i*8*k*flock.dir,by=y+(i%2?1:-1)*Math.ceil(i/2)*4*k+Math.sin(t*6.28+i*.5)*k,wing=[2,1,0,-1,0,1][(f+i)%6],col=s===3?'#86a8bf':'#685947';p(bx,by,3*k,k,col);p(bx-4*k,by-wing*k,4*k,k,col);p(bx+3*k,by-wing*k,4*k,k,col);}
}
// 22 seconds: receive -> tip -> empty -> return -> closed tail strikes the stone.
// Positive rest angle raises the open left receiver; the sealed right end never pours.
function osBambooPose(frame){const phase=((frame%176)+176)%176,rest=.20,tipped=-.66;let angle=rest,pour=0,fill=0;
 if(phase<128)fill=phase/128;else if(phase<140){const t=(phase-128)/12;angle=rest+(tipped-rest)*(t*t*(3-2*t));fill=1;if(angle<-.20)pour=(phase-132)/8;}
 else if(phase<154){angle=tipped;pour=(154-phase)/14;fill=pour;}
 else if(phase<168){const t=(phase-154)/14;angle=tipped+(rest-tipped)*(t*t*(3-2*t));}
 else if(phase<173)angle=rest-[0,.035,.018,0,0][phase-168];
 return {phase,angle,pour:Math.max(0,Math.min(1,pour)),fill,knock:phase===168};}
function osBambooGeometry(portrait,frame){const pose=osBambooPose(frame),pivot=portrait?[226,271]:[1340,581],scale=portrait?1:3;
 const transform=([x,y])=>[pivot[0]+(Math.cos(pose.angle)*x-Math.sin(pose.angle)*y)*scale,pivot[1]+(Math.sin(pose.angle)*x+Math.cos(pose.angle)*y)*scale],mouth=transform([-20,-1.3]),lip=transform([-22.5,1.5]);
 // Fixed nozzle is aligned with the receiving mouth at rest. Gravity never steers it sideways.
 const nozzle=[pivot[0]-19.34*scale,pivot[1]-10.99*scale],hit=[pivot[0]-24*scale,portrait?307:704],catching=Math.abs(mouth[0]-nozzle[0])<2.2*scale&&pose.angle>-.24;
 return {pose,pivot,scale,mouth,lip,nozzle,hit,catching};}
function osDrawBamboo(){const c=$('os-bamboo');if(!c)return;const {portrait,W,H}=osSceneSize(c);if(c.width!==W||c.height!==H){c.width=W;c.height=H;}const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,W,H);if(!OS.art||!OS.art.complete||!OS.art.naturalWidth||!OS.inlet||!OS.inlet.complete||!OS.inlet.naturalWidth)return;
 const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches,f=reduced?0:OS.frame,{pose,pivot,scale:k,mouth,lip,nozzle,hit,catching}=osBambooGeometry(portrait,f);
 const part=(sx,sy,sw,sh,x,y,w,h)=>g.drawImage(OS.art,sx,sy,sw,sh,x,y,w,h),dot=(x,y,w,h,col='#d7ffff')=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,h);};
 g.save();g.translate(...pivot);g.scale(k,k);if(osClock()===3)g.globalAlpha=.92;
 // Supply post and horizontal upper pipe are fixed. The stand's axle stays fixed too.
 g.drawImage(OS.inlet,249,89,834,1127,-20.42,-35,31,44);
 part(1682,255,278,405,-5,-4,11,16);part(1981,506,171,129,11,3.8,9,6.8);g.restore();
 const end=catching?mouth[1]:hit[1],start=nozzle[1];
 for(let y=start;y<end;y+=k){const bright=(Math.floor((y-start)/k)+f*2)%9<3;dot(nozzle[0]-.4*k,y,k,k,bright?'#e2ffffb0':'#97d7de85');}
 // Rotate only the water receiver around the visible axle.
 g.save();g.translate(...pivot);g.rotate(pose.angle);g.scale(k,k);part(760,409,795,145,-24,-3.5,39,7.1);
 if(pose.fill>0){g.save();g.beginPath();g.ellipse(-19.8,-1.2,2.6,1.05,-.45,0,Math.PI*2);g.clip();g.fillStyle='#a8e4e2';g.globalAlpha=.35+pose.fill*.45;g.fillRect(-23,-2+1.5*(1-pose.fill),6,2);g.restore();}g.restore();
 // Drain from the OPEN front lip only, projecting gently forward into the bath.
 if(pose.pour>0){const h=Math.max(1,hit[1]-lip[1]),width=pose.pour>.35?1.6*k:k;for(let y=lip[1];y<hit[1];y+=k){const t=(y-lip[1])/h,x=lip[0]+(hit[0]-lip[0])*(1-(1-t)*(1-t));dot(x,y,width,k,(Math.floor(y/k)+f*2)%8<3?'#e4ffffc0':'#94dadd9c');}}
 // Splash is clipped to the inner pool, so it never paints over stones or garden.
 if(pose.pour>0||!catching){g.save();osClipPool(g,portrait);const hx=pose.pour>0?hit[0]:nozzle[0],spread=[2,4,6,4][f%4]*k;dot(hx-spread,hit[1],spread*2,k,'#c4f6ef8c');dot(hx-spread-2*k,hit[1]+2*k,2*k,k,'#a4e0e65c');dot(hx+spread,hit[1]+2*k,2*k,k,'#a4e0e65c');g.restore();}
}
function osTick(){if(!osIsOpen()||document.hidden)return;OS.frame++;osLayoutFriends();const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches,pose=osBambooPose(OS.frame);if(!reduced&&pose.knock)osKnock();if(!reduced&&pose.phase%32===0&&pose.phase<128)osDrip();osDraw();osDrawBamboo();}
function osCleanup(){OS.active=false;clearInterval(OS.frameTimer);clearInterval(OS.clockTimer);OS.frameTimer=OS.clockTimer=null;if(OS.retry){document.removeEventListener('pointerdown',OS.retry,true);document.removeEventListener('keydown',OS.retry,true);OS.retry=null;}if(OS.observer){OS.observer.disconnect();OS.observer=null;}if(OS.audio){OS.audio.pause();OS.audio.removeAttribute('src');OS.audio.load();OS.audio=null;}if(OS.ctx){const c=OS.ctx;OS.ctx=null;OS.gain=null;OS.water=null;c.close().catch(()=>{});}}
function osExit(){osCleanup();bgClose(1);bgStart();}
function osOpen(){osCleanup();bgStop();if(typeof bgG!=='undefined'&&bgG)bgG.gain.value=0;bgShell('토리네 온천',osExit);$('bgo').classList.add('onsen-playing');OS.active=true;if(!OS.art){OS.art=new Image();OS.art.onload=()=>{if(osIsOpen())osDrawBamboo();};OS.art.src='images/scenes/onsen-shishiodoshi-parts-v118.webp';}if(!OS.inlet){OS.inlet=new Image();OS.inlet.onload=()=>{if(osIsOpen())osDrawBamboo();};OS.inlet.src='images/scenes/onsen-shishiodoshi-inlet-v118.webp';}OS.ui=true;OS.frame=0;OS.birdCycle=null;OS.birdFlock=null;OS.volume=Number.isFinite(S.osVolume)?S.osVolume:35;osRender();osAudioStart();OS.retry=()=>osAudioStart();document.addEventListener('pointerdown',OS.retry,true);document.addEventListener('keydown',OS.retry,true);OS.frameTimer=setInterval(osTick,125);let last=osClock();OS.clockTimer=setInterval(()=>{const slot=osClock();if(slot!==last){last=slot;osRender(true);}},30000);OS.observer=new MutationObserver(()=>{if(!osIsOpen()){osCleanup();if(!document.hidden)bgStart();}});OS.observer.observe(document.body,{childList:true});}
document.addEventListener('visibilitychange',()=>{if(!osIsOpen())return;if(document.hidden){if(OS.audio)OS.audio.pause();if(OS.ctx)OS.ctx.suspend().catch(()=>{});}else{osRender(true);osAudioStart();}});
window.addEventListener('resize',()=>{if(osIsOpen()){osLayoutFriends();osDraw();osDrawBamboo();}});
window.addEventListener('pagehide',osCleanup);
window.addEventListener('pageshow',e=>{if(e.persisted&&$('bgo')&&$('bgo').classList.contains('onsen-playing'))osOpen();});


