/* 토리네 온천 — 온천 화면·소리·풍경 */
// Onsen preview: real local time, frame-stepped scenery and locally synthesized ambience.
const OS={audio:null,clockTimer:null,frameTimer:null,observer:null,active:false,ui:true,volume:35,ctx:null,gain:null,water:null,frame:0,cycle:-1,lastTalk:{},retry:null};
const OS_LANDSCAPES=['images/scenes/onsen-landscape-day-v118.webp','images/scenes/onsen-landscape-day-v118.webp','images/scenes/onsen-landscape-day-v118.webp','images/scenes/onsen-landscape-night-v118.webp'];
const OS_PORTRAITS=['images/scenes/onsen-portrait-day-v118.webp','images/scenes/onsen-portrait-day-v118.webp','images/scenes/onsen-portrait-day-v118.webp','images/scenes/onsen-portrait-night-v118.webp'];
const OS_ANIMALS={'토리':'images/icons/onsen-tori-v125.png','호두':'images/icons/onsen-hodu-v125.png','도치':'images/icons/onsen-dochi-v125.png','부엉박사':'images/icons/onsen-owl-v125.png'};
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
function osLayoutFriends(){const c=$('os-bamboo');if(!c)return;const {portrait,W,H}=osSceneSize(c),scale=Math.max(c.clientWidth/W,c.clientHeight/H),ox=(c.clientWidth-W*scale)/2,oy=(c.clientHeight-H*scale)*(portrait?.5:.75);
 const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;document.querySelectorAll('.os-friend').forEach((el,i)=>{const [x,y,w]=osFriendPlaces(portrait)[i];el.style.left=(ox+x*scale)+'px';el.style.top=(oy+y*scale)+'px';el.style.width=(w*scale)+'px';el.style.transform='translate(-50%,calc(-50% + '+(reduced?0:osFloatPose(OS.frame,i)*(portrait?1:3)*scale)+'px))';});}
function osFloatPose(f,i){return [0,1,1,0,-1,-1][(Math.floor(f/4)+i*2)%6];}
function osFriendPlaces(portrait){const four=OS_SLOTS[osClock()].friends.length===4;return portrait?(four?[[92,350,56],[152,354,49],[126,408,44],[185,412,48]]:[[98,358,56],[171,393,49]]):(four?[[700,690,145],[970,690,140],[800,786,128],[1160,770,140]]:[[760,710,150],[1040,775,145]]);}
function osSceneArt(slot){const c=$('os-weather');if(!c)return;const {portrait}=osSceneSize(c),key=(portrait?'p':'l')+slot,src=portrait?OS_PORTRAITS[slot]:OS_LANDSCAPES[slot];
 // 별도 효과용 그림이 늦거나 실패해도, 화면에 이미 뜬 같은 방향·시간대의 배경으로 복구해요.
 const shown=document.querySelector('#bgo .os-background');if(shown&&shown.complete&&shown.naturalWidth&&(shown.currentSrc||shown.src||'').endsWith(src)&&(OS.sceneKey!==key||!OS.sceneArt||!OS.sceneArt.complete||!OS.sceneArt.naturalWidth)){OS.sceneKey=key;OS.sceneArt=shown;OS.waterPlateKey=null;OS.starKey=null;return;}
 if(OS.sceneKey===key)return;OS.sceneKey=key;const img=new Image();OS.sceneArt=img;OS.waterPlateKey=null;OS.starKey=null;img.onload=()=>{if(OS.sceneArt===img&&osIsOpen())osDraw();};img.src=src;}
function osPlate(portrait,W,H){osSceneArt(osClock());const img=OS.sceneArt;if(!img||!img.complete||!img.naturalWidth)return null;
 if(!OS.waterPlate)OS.waterPlate=document.createElement('canvas');const c=OS.waterPlate;if(c.width!==W||c.height!==H||OS.waterPlateKey!==OS.sceneKey){c.width=W;c.height=H;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(img,0,0,W,H);osTintPlate(g,W,H,osClock());OS.waterPlateKey=OS.sceneKey;}return c;}
function osTintPlate(g,W,H,slot){if((slot!==0&&slot!==2)||!g.getImageData)return;const sepia=t=>[1-.607*t,.769*t,.189*t,.349*t,1-.314*t,.168*t,.272*t,.534*t,1-.869*t],sat=t=>[.213+.787*t,.715-.715*t,.072-.072*t,.213-.213*t,.715+.285*t,.072-.072*t,.213-.213*t,.715-.715*t,.072+.928*t],hue=t=>{const c=Math.cos(t),s=Math.sin(t);return [.213+.787*c-.213*s,.715-.715*c-.715*s,.072-.072*c+.928*s,.213-.213*c+.143*s,.715+.285*c+.140*s,.072-.072*c-.283*s,.213-.213*c-.787*s,.715-.715*c+.715*s,.072+.928*c+.072*s];},mul=(a,b)=>Array.from({length:9},(_,i)=>[0,1,2].reduce((v,k)=>v+a[Math.floor(i/3)*3+k]*b[k*3+i%3],0));
 const matrix=slot===0?mul(sepia(.12),sat(.82)).map(x=>x*.96):mul(hue(335*Math.PI/180),mul(sat(.85),sepia(.4))).map(x=>x*.82),im=g.getImageData(0,0,W,H),a=im.data;for(let i=0;i<a.length;i+=4){const r=a[i],b=a[i+1],c=a[i+2];a[i]=matrix[0]*r+matrix[1]*b+matrix[2]*c;a[i+1]=matrix[3]*r+matrix[4]*b+matrix[5]*c;a[i+2]=matrix[6]*r+matrix[7]*b+matrix[8]*c;}g.putImageData(im,0,0);}
function osPool(portrait){return portrait?[[150,301],[201,304],[210,316],[248,329],[281,339],[281,390],[251,414],[236,425],[201,444],[174,459],[160,462],[140,450],[119,439],[118,428],[80,414],[57,395],[53,360],[72,338],[84,317],[120,310]]:[[720,612],[1010,615],[1150,640],[1258,669],[1350,683],[1352,696],[1430,728],[1490,753],[1445,785],[1300,817],[1040,867],[900,862],[753,847],[625,860],[500,806],[368,785],[326,746],[279,731],[287,716],[420,680],[590,648]];}
function osClipPool(g,portrait){g.beginPath();osPool(portrait).forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.clip();}
// v1.2.5 온천물: 도트 게임식 물 표현 — ① 줄마다 사인파로 출렁(멀수록 작게) ② 밝은 물빛이 띠처럼 흘러가는 색 순환
// ③ 4프레임 반짝임 ④ 친구 둘레로 퍼지는 물결 고리. 그림 칸(k) 단위로만 움직여 도트가 뭉개지지 않아요.
function osWaterTexture(g,portrait,W,H,f){const c=osPlate(portrait,W,H);if(!c)return;const k=portrait?1:3,step=portrait?2:6,top=portrait?300:610,bottom=portrait?465:875;for(let y=top;y<bottom;y+=step){const depth=(y-top)/(bottom-top),amp=depth<.35?1:2,dx=Math.round(amp*Math.sin(y/(step*2.3)-f*.42))*k;g.drawImage(c,0,y,W,step,dx,y,W,step);}}
function osGlints(portrait,W,H){if(OS.glintKey===OS.sceneKey&&OS.glints)return OS.glints;const c=osPlate(portrait,W,H);if(!c)return [];const g=c.getContext('2d');if(!g.getImageData)return [];
 const k=portrait?1:3,top=portrait?300:610,bottom=portrait?465:875,a=g.getImageData(0,top,W,bottom-top).data,m=document.createElement('canvas');m.width=W;m.height=H;const mg=m.getContext('2d');mg.beginPath();osPool(portrait).forEach(([x,y],i)=>i?mg.lineTo(x,y):mg.moveTo(x,y));mg.closePath();
 const pts=[],lum=[];for(let y=top;y<bottom;y+=k)for(let x=0;x<W;x+=k){if(!mg.isPointInPath(x,y))continue;const i=((y-top)*W+x)*4,l=.3*a[i]+.59*a[i+1]+.11*a[i+2];pts.push([x,y,l]);lum.push(l);}
 lum.sort((p,q)=>p-q);const cut=lum[Math.floor(lum.length*.9)]||255;OS.glintKey=OS.sceneKey;OS.glints=pts.filter(p=>p[2]>=cut);OS.poolPts=pts;return OS.glints;}
function osWaterLife(g,p,portrait,W,H,f,s){const k=portrait?1:3,gl=osGlints(portrait,W,H);if(!gl.length)return;
 // ② 색 순환: 비스듬한 빛 띠가 밝은 물빛 위를 천천히 지나가요
 const warm=s===3?'220,245,255':s===2?'255,226,170':'255,252,226';for(const [x,y] of gl){const v=Math.sin(x*.09/k+y*.33/k-f*.45);if(v>.5)p(x,y,k,k,'rgba('+warm+','+(.18+.42*(v-.5)).toFixed(2)+')');}
 // ③ 반짝임: 자리마다 8프레임 동안 점→작은 십자→큰 십자→작은 십자→점
 if(!OS.spark||OS.sparkKey!==OS.sceneKey){OS.sparkKey=OS.sceneKey;OS.spark=Array.from({length:portrait?5:7},(_,i)=>({t:-i*3,x:0,y:0}));}
 const shape=[1,2,3,2,1,0,0,0],col=s===3?'#fffbe0':'#ffffff';OS.spark.forEach(sp=>{const age=f-sp.t;if(age<0)return;if(age>=shape.length||!sp.x){const q=gl[Math.floor(Math.random()*gl.length)];sp.x=q[0];sp.y=q[1];sp.t=f+Math.floor(Math.random()*10);return;}
  const z=shape[age];if(!z)return;p(sp.x,sp.y,k,k,col);if(z>=2){p(sp.x-k,sp.y,k,k,col+'b0');p(sp.x+k,sp.y,k,k,col+'b0');p(sp.x,sp.y-k,k,k,col+'b0');p(sp.x,sp.y+k,k,k,col+'b0');}if(z>=3){p(sp.x-2*k,sp.y,k,k,col+'60');p(sp.x+2*k,sp.y,k,k,col+'60');}});}
// ④ 물결 고리: 친구마다 3초쯤에 한 번, 몸 둘레에서 바깥으로 퍼지며 흐려져요(아래 반쪽만 보이게 친구 그림이 위를 덮어요)
function osRipples(p,portrait,f,s){const k=portrait?1:3,col=s===3?'190,235,230':'235,255,245';osFriendPlaces(portrait).forEach(([x,y,w],i)=>{const age=(f+i*9)%26;if(age>=14)return;const sway=osFloatPose(f,i)*k,rx=w*.5+age*1.6*k,ry=rx*.3,cy=y+w*.34+sway,al=(.85*(1-age/14)).toFixed(2);
  const n=Math.max(24,Math.round(2*Math.PI*Math.sqrt((rx*rx+ry*ry)/2)*1.5/k));let last='';for(let j=0;j<n;j++){const t=j/n*Math.PI*2,px=Math.round((x+Math.cos(t)*rx)/k)*k,py=Math.round((cy+Math.sin(t)*ry)/k)*k,key=px+','+py;if(key===last)continue;last=key;p(px,py,k,k,'rgba('+col+','+al+')');}});}
// Discover actual bright star pixels once. Each cluster keeps its position and its own rhythm.
function osStarPixels(portrait,W,H){if(OS.starKey===OS.sceneKey)return OS.stars||[];const c=osPlate(portrait,W,H);if(!c)return [];
 const g=c.getContext('2d');if(!g.getImageData)return [];const a=g.getImageData(0,0,W,H).data,maxY=portrait?104:215,moon=portrait?[175,38,222,88]:[1020,55,1150,180],seen=new Set(),stars=[];
 const bright=(x,y)=>{if(x<0||x>=W||y<0||y>=maxY||(x>=moon[0]&&x<=moon[2]&&y>=moon[1]&&y<=moon[3]))return false;const i=(y*W+x)*4;return a[i]>174&&a[i+1]>155&&a[i+2]>95;};
 for(let y=0;y<maxY;y++)for(let x=0;x<W;x++){const key=y*W+x;if(seen.has(key)||!bright(x,y))continue;const queue=[[x,y]],pixels=[];seen.add(key);for(let j=0;j<queue.length;j++){const [xx,yy]=queue[j],i=(yy*W+xx)*4;pixels.push([xx,yy,a[i],a[i+1],a[i+2]]);for(const [dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=xx+dx,ny=yy+dy,nk=ny*W+nx;if(!seen.has(nk)&&bright(nx,ny)){seen.add(nk);queue.push([nx,ny]);}}}if(pixels.length<(portrait?65:220))stars.push(pixels);}
 OS.starKey=OS.sceneKey;OS.stars=stars;return stars;}
// v1.4.2 여관 불빛 일렁임: 창·등불마다 따로 불규칙하게 밝아졌다 어두워졌다(사인파 세 개를 섞음)해요.
function osFlick(i,f){return (Math.sin(f*.83+i*2.1)+.7*Math.sin(f*.37+i*5.3)+.4*Math.sin(f*1.71+i*.9))/2.1;}
function osSkyLights(g,p,portrait,s,f,k){if(s===2||s===3){const lamps=portrait?[[26,189,7,15],[79,225,6,13]]:[[209,338,26,42],[399,398,26,44]];
  lamps.forEach((r,i)=>{const v=osFlick(i+5,f),a=.1+.28*(v+1)/2,gl=Math.round((portrait?2:6)*(1+v*.4));g.fillStyle='rgba(255,170,60,'+(a*.3).toFixed(3)+')';g.fillRect(r[0]-gl,r[1]-gl,r[2]+gl*2,r[3]+gl*2);g.fillStyle='rgba(255,226,140,'+a.toFixed(3)+')';g.fillRect(...r);});}
 if(s!==3)return;const W=portrait?288:1672,H=portrait?512:941;
 osStarPixels(portrait,W,H).forEach((pixels,i)=>{const levels=[.56,.66,.82,1,.9,.75,.62,.56],level=levels[(Math.floor(f/(5+i%5))+i*3)%levels.length];pixels.forEach(([x,y,r,b,c])=>p(x,y,1,1,'rgb('+Math.round(r*level)+','+Math.round(b*level)+','+Math.round(c*level)+')'));});
 // Light on the existing crescent is still; its reflection is animated separately in water.
 const box=portrait?[182,46,31,34]:[1037,68,95,103];g.save();g.globalAlpha=[.025,.04,.055,.04][Math.floor(f/16)%4];const c=osPlate(portrait,W,H);if(c)g.drawImage(c,...box,...box);g.restore();}
function osWaterLight(g,p,portrait,s,f,k){const cx=portrait?171:976,top=portrait?320:630,bottom=portrait?458:858,step=portrait?6:15,pose=[0,1,1,0,-1,-1][Math.floor(f/6)%6];
 if(s===3){const alpha=[.055,.075,.095,.075][Math.floor(f/11)%4];for(let y=top;y<bottom;y+=step){const width=(portrait?6:22)+(y-top)*.16;p(cx-width/2+pose*k,y,width,k,'rgba(255,245,183,'+alpha+')');}}
 else{const alpha=[.025,.035,.045,.035][Math.floor(f/14)%4],beam=portrait?144:930;for(let y=top+30*k;y<bottom;y+=4*k){const spread=(portrait?26:92)+(y-top)*.15;for(let x=beam-spread;x<beam+spread;x+=5*k){if((Math.round(x/k)+Math.round(y/k))%3===0)p(x+pose*k,y,2*k,k,'rgba(255,237,159,'+alpha+')');}}}}
// v1.4.2 온천 화면 위 상태 표시줄(배터리·시간)이 앱 갈색으로 보이던 것: 온천 동안 theme-color와 바탕색을 그림 맨 위 하늘색으로 바꾸고, 나가면 되돌려요.
function osTheme(){try{osTheme2();}catch(e){}}
function osTheme2(){const m=document.querySelector('meta[name="theme-color"]');if(!m)return;if(OS.themeOld==null){OS.themeOld=[m.content,document.documentElement.style.backgroundColor,document.body.style.backgroundColor];}
 let col=['#337cc3','#1783ec','#487a9c','#061e38'][osClock()];m.content=col;const c=OS.waterPlate;if(c&&c.width&&OS.waterPlateKey===OS.sceneKey&&c.getContext){try{const view=$('os-weather'),scale=view?Math.max(view.clientWidth/c.width,view.clientHeight/c.height):1,y=view?Math.max(0,Math.floor((c.height-view.clientHeight/scale)*(view.clientHeight>=view.clientWidth?.5:.75))):0,d=c.getContext('2d').getImageData(Math.floor(c.width*.5),Math.min(c.height-1,y),1,1).data;col='rgb('+d[0]+','+d[1]+','+d[2]+')';const h='#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('');m.content=h;}catch(e){}}else m.content=col;
 document.documentElement.style.backgroundColor=col;document.body.style.backgroundColor=col;}
function osThemeRestore(){try{osThemeRestore2();}catch(e){OS.themeOld=null;}}
function osThemeRestore2(){if(OS.themeOld==null)return;const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=OS.themeOld[0];document.documentElement.style.backgroundColor=OS.themeOld[1];document.body.style.backgroundColor=OS.themeOld[2];OS.themeOld=null;OS.themeKey=null;}
function osDraw(){const c=$('os-weather');if(!c)return;const {portrait,W,H}=osSceneSize(c);const plate=osPlate(portrait,W,H),themeKey=OS.waterPlateKey+':'+c.clientWidth+':'+c.clientHeight;if(OS.themeKey!==themeKey){osTheme();OS.themeKey=themeKey;}if(c.width!==W||c.height!==H){c.width=W;c.height=H;}const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,W,H);if(!plate)return;const f=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:OS.frame,s=osClock(),k=portrait?1:3,p=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
 g.save();osClipPool(g,portrait);osWaterTexture(g,portrait,W,H,f);osWaterLight(g,p,portrait,s,f,k);
 osWaterLife(g,p,portrait,W,H,f,s);osRipples(p,portrait,f,s);g.restore();osDrawClouds(g,portrait,W,H,f);osSkyLights(g,p,portrait,s,f,k);osDrawBirds((x,y,w,h,col)=>{g.fillStyle=col;x=Math.round(x);y=Math.round(y);for(let yy=y;yy<y+Math.round(h);yy++)for(let xx=x;xx<x+Math.round(w);xx++)if(osInSky(xx,yy))g.fillRect(xx,yy,1,1);},W,H,f,k,s);}
// v1.2.5 하늘: 그림 위쪽에서 하늘(+구름·별)만 골라낸 판. 새는 이 판 안에서만 보여서 나무 뒤로 숨고,
// 구름은 그림에서 오려 내 제자리 근처에서 천천히 둥둥 떠다녀요(빈자리는 그 줄의 하늘색으로 메워요).
function osSky(portrait,W,H){if(OS.skyKey===OS.sceneKey&&OS.sky)return OS.sky;const c=osPlate(portrait,W,H);if(!c)return null;const g=c.getContext('2d');if(!g.getImageData)return null;
 const maxY=Math.round(H*(portrait?.36:.42)),paint=g.getImageData(0,0,W,maxY).data,raw=document.createElement('canvas');raw.width=W;raw.height=maxY;const rg=raw.getContext('2d');rg.imageSmoothingEnabled=false;rg.drawImage(OS.sceneArt,0,0,W,H);const a=rg.getImageData(0,0,W,maxY).data,N=W*maxY,m=new Uint8Array(N),st=[];
 const leafy=i=>{const r=a[i*4],gg=a[i*4+1],b=a[i*4+2];return gg>b+4&&gg>=r-2;},skyish=i=>{const r=a[i*4],gg=a[i*4+1],b=a[i*4+2];return !leafy(i)&&(b>=gg-6&&b>=r-30||(r+gg+b)>560);};
 for(let x=0;x<W;x++)if(skyish(x)){m[x]=1;st.push(x);}
 while(st.length){const p=st.pop(),x=p%W;for(const q of [x>0?p-1:-1,x<W-1?p+1:-1,p>=W?p-W:-1,p<N-W?p+W:-1])if(q>=0&&!m[q]&&skyish(q)){m[q]=1;st.push(q);}}
 // 구멍(별·달·구름 속) 메우기: 아래쪽·양옆 가장자리까지 이어지지 않는 칸은 하늘
 const out=new Uint8Array(N),os=[];for(let x=0;x<W;x++){const p=(maxY-1)*W+x;if(!m[p]){out[p]=1;os.push(p);}}for(let y=0;y<maxY;y++)for(const p of [y*W,y*W+W-1])if(!m[p]&&!out[p]){out[p]=1;os.push(p);}
 while(os.length){const p=os.pop(),x=p%W;for(const q of [x>0?p-1:-1,x<W-1?p+1:-1,p>=W?p-W:-1,p<N-W?p+W:-1])if(q>=0&&!m[q]&&!out[q]){out[q]=1;os.push(q);}}
 for(let i=0;i<N;i++)if(!out[i])m[i]=1;
 // 원화 색으로 구름·나뭇잎을 구분하고, 실제로 그릴 때는 시간대 보정 색을 씁니다.
 // 줄마다 하늘 바탕색과 구름의 어두운 가장자리까지 함께 고릅니다.
 const L=i=>.3*a[i*4]+.59*a[i*4+1]+.11*a[i*4+2],base=[],basePaint=[],cl=new Uint8Array(N),cloudY=Math.round(H*(portrait?.215:.215)),moon=osClock()!==3?[-1,-1,-1,-1]:portrait?[170,30,228,95]:[1000,40,1170,200];   // 구름은 산보다 위에서만, 달은 빼고
 for(let y=0;y<maxY;y++){const v=[];for(let x=0;x<W;x++){const i=y*W+x;if(m[i])v.push(i);}v.sort((p,q)=>L(p)-L(q));const i=v.length?v[v.length>>2]:-1;base[y]=i<0?null:[a[i*4],a[i*4+1],a[i*4+2],L(i)];basePaint[y]=i<0?null:[paint[i*4],paint[i*4+1],paint[i*4+2]];
  if(base[y]&&y<cloudY)for(const i of v){const x=i%W;if(x>=moon[0]&&x<=moon[2]&&y>=moon[1]&&y<=moon[3])continue;if(L(i)>base[y][3]+8&&!leafy(i))cl[i]=1;}}
 const seen=new Uint8Array(N),clouds=[],minN=portrait?40:300;
 for(let i=0;i<N;i++){if(!cl[i]||seen[i])continue;const comp=[i];seen[i]=1;for(let k=0;k<comp.length;k++){const p=comp[k],x=p%W;for(const q of [x>0?p-1:-1,x<W-1?p+1:-1,p>=W?p-W:-1,p<N-W?p+W:-1,p>=W&&x>0?p-W-1:-1,p>=W&&x<W-1?p-W+1:-1,p<N-W&&x>0?p+W-1:-1,p<N-W&&x<W-1?p+W+1:-1])if(q>=0&&cl[q]&&!seen[q]){seen[q]=1;comp.push(q);}}
  if(comp.length<minN)continue;let x0=W,x1=0,y0=maxY,y1=0;for(const p of comp){const x=p%W,y=(p-x)/W;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  // 가장자리 1칸 넓혀 오려 내기(테두리 빛번짐까지)
  if(x1-x0<(portrait?20:60))continue;   // 별처럼 작은 덩어리는 구름이 아니에요
  x0=Math.max(0,x0-1);y0=Math.max(0,y0-1);x1=Math.min(W-1,x1+1);y1=Math.min(maxY-1,y1+1);const cw=x1-x0+1,ch=y1-y0+1,cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const cg=cv.getContext('2d'),im=cg.createImageData(cw,ch);
  const inC=new Uint8Array(N);for(const p of comp)inC[p]=1;for(const p of comp){const x=p%W;for(const q of [p-1,p+1,p-W,p+W])if(q>=0&&q<N&&m[q]&&!inC[q]&&Math.abs(q%W-x)<=1&&L(q)>base[Math.floor(q/W)][3]+3&&!leafy(q))inC[q]=2;}
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const p=y*W+x;if(!inC[p])continue;const t=((y-y0)*cw+x-x0)*4;im.data[t]=paint[p*4];im.data[t+1]=paint[p*4+1];im.data[t+2]=paint[p*4+2];im.data[t+3]=255;}
  cg.putImageData(im,0,0);clouds.push({cv,x:x0,y:y0,w:cw,h:ch,px:[...inC.keys()].filter(p=>inC[p]),ph:clouds.length*1.7,amp:(portrait?5:15)+(clouds.length%3)*(portrait?2:6)});}
 // 구름을 지운 하늘판(구름 자리는 그 줄 바탕색) + 하늘 마스크 판
 const clean=document.createElement('canvas');clean.width=W;clean.height=maxY;const kg=clean.getContext('2d'),ki=kg.createImageData(W,maxY),mk=document.createElement('canvas');mk.width=W;mk.height=maxY;const mg=mk.getContext('2d'),mi=mg.createImageData(W,maxY);
 const cover=new Uint8Array(N);for(const c of clouds)for(const p of c.px)cover[p]=1;
 for(let i=0;i<N;i++)if(m[i])mi.data[i*4+3]=255;
 // 구름 자리를 메우는 색: 그 구름 옆(좌우 12칸)의 구름 아닌 하늘 줄 색(없으면 그 줄 바탕색)
 clouds.forEach(c=>{const rows={};for(const p of c.px){const y=Math.floor(p/W);if(!rows[y]){const v=[];for(let x=Math.max(0,c.x-12);x<=Math.min(W-1,c.x+c.w+12);x++){const q=y*W+x;if(m[q]&&!cover[q])v.push(q);}v.sort((u,w)=>L(u)-L(w));const q=v.length>3?v[v.length>>1]:-1;rows[y]=q>=0?[paint[q*4],paint[q*4+1],paint[q*4+2]]:basePaint[y];}
  const b=rows[y];if(!b||!m[p])continue;ki.data[p*4]=b[0];ki.data[p*4+1]=b[1];ki.data[p*4+2]=b[2];ki.data[p*4+3]=255;}});
 kg.putImageData(ki,0,0);mg.putImageData(mi,0,0);clouds.forEach(c=>delete c.px);
 OS.skyKey=OS.sceneKey;OS.sky={m,W,maxY,clean,mask:mk,clouds};return OS.sky;}
function osDrawClouds(g,portrait,W,H,f){const sky=osSky(portrait,W,H);if(!sky||!sky.clouds.length)return;if(!OS.skyLayer)OS.skyLayer=document.createElement('canvas');const L=OS.skyLayer;if(L.width!==W||L.height!==sky.maxY){L.width=W;L.height=sky.maxY;}const lg=L.getContext('2d');lg.imageSmoothingEnabled=false;lg.globalCompositeOperation='source-over';lg.clearRect(0,0,W,sky.maxY);lg.drawImage(sky.clean,0,0);
 const k=portrait?1:3;sky.clouds.forEach((c,i)=>{const dx=Math.round(c.amp*Math.sin(f/(80+i*17)+c.ph)/k)*k,dy=Math.round(Math.sin(f/(53+i*11)+c.ph)*.6)*k;lg.drawImage(c.cv,c.x+dx,c.y+dy);});
 lg.globalCompositeOperation='destination-in';lg.drawImage(sky.mask,0,0);lg.globalCompositeOperation='source-over';g.drawImage(L,0,0);}
function osInSky(x,y){const s=OS.sky;if(!s||OS.skyKey!==OS.sceneKey)return false;x=Math.round(x);y=Math.round(y);if(x<0||x>=s.W||y<0)return true;if(y>=s.maxY)return false;return !!s.m[y*s.W+x];}
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
// v1.2.5: 대나무는 부품 그림을 그림 칸(세로 288칸) 캔버스에 줄여 찍으면 각지고 뭉개져 보였어요(사용자: '저퀄').
// 화면 해상도만큼(R배, 최대 4) 큰 캔버스에 부드럽게 줄여 그려요. 물줄기 점은 그대로 칸 단위.
function osDrawBamboo(){const c=$('os-bamboo');if(!c)return;const {portrait,W,H}=osSceneSize(c),sc=Math.max((c.clientWidth||W)/W,(c.clientHeight||H)/H),R=Math.max(1,Math.min(4,Math.ceil(sc*(window.devicePixelRatio||1)-.05)));if(c.width!==W*R||c.height!==H*R){c.width=W*R;c.height=H*R;}const g=c.getContext('2d');if(g.setTransform)g.setTransform(R,0,0,R,0,0);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.clearRect(0,0,W,H);if(!OS.art||!OS.art.complete||!OS.art.naturalWidth||!OS.inlet||!OS.inlet.complete||!OS.inlet.naturalWidth)return;
 const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches,f=reduced?0:OS.frame,{pose,pivot,scale:k,mouth,lip,nozzle,hit,catching}=osBambooGeometry(portrait,f);
 const part=(sx,sy,sw,sh,x,y,w,h)=>g.drawImage(OS.art,sx,sy,sw,sh,x,y,w,h),dot=(x,y,w,h,col='#d7ffff')=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,h);};
 g.save();g.translate(...pivot);g.scale(k,k);if(osClock()===3)g.globalAlpha=.92;
 // Supply post and horizontal upper pipe are fixed. The stand's axle stays fixed too.
 g.drawImage(OS.inlet,249,89,834,1127,-20.42,-35,31,44);
 part(1682,255,278,405,-5,-4,11,16);part(1981,506,171,129,11,3.8,9,6.8);g.restore();
 const end=catching?mouth[1]:hit[1],start=nozzle[1];
 for(let y=start;y<end;y+=k){const n=Math.floor((y-start)/k)+f*2;if(n%6>=3)continue;dot(nozzle[0]-.4*k,y,k,k,n%6===0?'#e2ffffb0':'#97d7de85');}   // v1.4.2 양을 절반으로: 3칸 이어지고 3칸 쉬며 흘러내려요
 // Rotate only the water receiver around the visible axle.
 g.save();g.translate(...pivot);g.rotate(pose.angle);g.scale(k,k);part(760,409,795,145,-24,-3.5,39,7.1);
 if(pose.fill>0){g.save();g.beginPath();g.ellipse(-19.8,-1.2,2.6,1.05,-.45,0,Math.PI*2);g.clip();g.fillStyle='#a8e4e2';g.globalAlpha=.35+pose.fill*.45;g.fillRect(-23,-2+1.5*(1-pose.fill),6,2);g.restore();}g.restore();
 // Drain from the OPEN front lip only, projecting gently forward into the bath.
 // v1.4.2 물이 다 빠질 땐 뚝 끊기지 않고: 굵은 줄기 → 가는 줄기 → 끊어진 물줄기 → 방울 또르르(간격이 점점 벌어짐) → 입술에 맺힌 마지막 방울.
 const ph=pose.phase,curve=(l,t)=>l+(hit[0]-l)*(1-(1-t)*(1-t));
 if(pose.pour>0){const h=Math.max(1,hit[1]-lip[1]),width=ph<146&&pose.pour>.55?1.6*k:k;for(let y=lip[1];y<hit[1];y+=k){const t=(y-lip[1])/h,n=Math.floor(y/k)+f*2;if(ph>=149&&((n%6>=3)||t<(ph-148)*.3))continue;dot(curve(lip[0],t),y,width,k,n%8<3?'#e4ffffc0':'#94dadd9c');}}
 const DR=[151,154,158,163,169],FALL=4;DR.forEach(r=>{const dt=ph-r;if(dt<-2||dt>FALL)return;const g0=osBambooGeometry(portrait,f-Math.max(0,dt)).lip;
  if(dt<0){dot(g0[0]-k,g0[1],2*k,2*k,'#d8f8f8c0');return;}   // 입술에 맺힌 방울
  const t=dt/FALL,y=g0[1]+(hit[1]-g0[1])*t*t,x=curve(g0[0],t*t);
  if(dt<FALL){dot(x,y,k,2*k,'#cdf3f4b0');dot(x,y,k,k,'#ffffff');}
  else{g.save();osClipPool(g,portrait);dot(hit[0]-3*k,hit[1],6*k,k,'#c4f6efa0');dot(hit[0]-5*k,hit[1]+k,2*k,k,'#a4e0e65c');dot(hit[0]+3*k,hit[1]+k,2*k,k,'#a4e0e65c');g.restore();}});
 // Splash is clipped to the inner pool, so it never paints over stones or garden.
 if(pose.pour>0||!catching){g.save();osClipPool(g,portrait);const hx=pose.pour>0?hit[0]:nozzle[0],spread=[2,4,6,4][f%4]*k;dot(hx-spread,hit[1],spread*2,k,'#c4f6ef8c');dot(hx-spread-2*k,hit[1]+2*k,2*k,k,'#a4e0e65c');dot(hx+spread,hit[1]+2*k,2*k,k,'#a4e0e65c');g.restore();}
}
function osTick(){if(!osIsOpen()||document.hidden)return;OS.frame++;osLayoutFriends();const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches,pose=osBambooPose(OS.frame);if(!reduced&&pose.knock)osKnock();if(!reduced&&pose.phase%32===0&&pose.phase<128)osDrip();osDraw();osDrawBamboo();}
function osCleanup(){OS.active=false;osThemeRestore();clearInterval(OS.frameTimer);clearInterval(OS.clockTimer);OS.frameTimer=OS.clockTimer=null;if(OS.retry){document.removeEventListener('pointerdown',OS.retry,true);document.removeEventListener('keydown',OS.retry,true);OS.retry=null;}if(OS.observer){OS.observer.disconnect();OS.observer=null;}if(OS.audio){OS.audio.pause();OS.audio.removeAttribute('src');OS.audio.load();OS.audio=null;}if(OS.ctx){const c=OS.ctx;OS.ctx=null;OS.gain=null;OS.water=null;c.close().catch(()=>{});}}
function osExit(){osCleanup();bgClose();const o=$('bgo');if(o&&o.classList&&o.classList.remove)o.classList.remove('onsen-playing');bgStart();}
function osOpen(){osCleanup();bgStop();if(typeof bgG!=='undefined'&&bgG)bgG.gain.value=0;bgShell('토리네 온천',osExit);$('bgo').classList.add('onsen-playing');OS.active=true;if(!OS.art){OS.art=new Image();OS.art.onload=()=>{if(osIsOpen())osDrawBamboo();};OS.art.src='images/scenes/onsen-shishiodoshi-parts-v118.webp';}if(!OS.inlet){OS.inlet=new Image();OS.inlet.onload=()=>{if(osIsOpen())osDrawBamboo();};OS.inlet.src='images/scenes/onsen-shishiodoshi-inlet-v118.webp';}OS.ui=true;OS.frame=0;OS.birdCycle=null;OS.birdFlock=null;OS.volume=Number.isFinite(S.osVolume)?S.osVolume:35;osRender();osAudioStart();OS.retry=()=>osAudioStart();document.addEventListener('pointerdown',OS.retry,true);document.addEventListener('keydown',OS.retry,true);OS.frameTimer=setInterval(osTick,125);let last=osClock();OS.clockTimer=setInterval(()=>{const slot=osClock();if(slot!==last){last=slot;osRender(true);}},30000);OS.observer=new MutationObserver(()=>{if(!osIsOpen()){osCleanup();if(!document.hidden)bgStart();}});OS.observer.observe(document.body,{childList:true});}
document.addEventListener('visibilitychange',()=>{if(!osIsOpen())return;if(document.hidden){if(OS.audio)OS.audio.pause();if(OS.ctx){try{OS.gain.gain.cancelScheduledValues(0);OS.gain.gain.setValueAtTime(0,OS.ctx.currentTime);}catch(e){}OS.ctx.suspend().catch(()=>{});}}else{if(OS.gain&&OS.ctx)OS.gain.gain.setValueAtTime(OS.volume/100,OS.ctx.currentTime);osRender(true);osAudioStart();}});
window.addEventListener('resize',()=>{if(osIsOpen()){osLayoutFriends();osDraw();osDrawBamboo();}});
window.addEventListener('pagehide',osCleanup);
window.addEventListener('pageshow',e=>{if(e.persisted&&$('bgo')&&$('bgo').classList.contains('onsen-playing'))osOpen();});


