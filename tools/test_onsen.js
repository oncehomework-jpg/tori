const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8');const worker=fs.readFileSync('sw.js','utf8');for(const asset of ['onsen-plate-v107.webp','onsen-bamboo-v107.webp','onsen-pixel-bgm-v102.wav'])assert(worker.includes('assets/'+asset),'offline cache includes '+asset);const engine=html.slice(html.indexOf('// Onsen preview:'),html.indexOf('</script>',html.indexOf('// Onsen preview:')));
let hidden=false,opened=true,hour=12,saved=0,closed=0,started=0,paused=0,timers=new Map(),id=0;
const c={width:0,height:0,clientWidth:960,clientHeight:540,getContext:()=>({clearRect(){},fillRect(){},save(){},restore(){},translate(){},scale(){},rotate(){},beginPath(){},lineTo(){},moveTo(){},closePath(){},clip(){},drawImage(){}})};
const elements={bgo:{classList:{contains:()=>opened,add(){} }},bgb:{innerHTML:''},'os-weather':c,'os-bamboo':c,'os-talk':{textContent:''},'os-volume-value':{textContent:''}};
const scene={classList:{toggle(){},remove(){}},addEventListener(){}};
class Audio {constructor(){this.paused=true;this.volume=1;}play(){started++;this.paused=false;return Promise.resolve();}pause(){paused++;this.paused=true;}load(){}removeAttribute(){}}
const listeners={},windowListeners={};const sandbox={console,Math,Number,Date:class extends Date{getHours(){return hour;}},Audio,Image:class{constructor(){this.complete=true;this.naturalWidth=1672;}},S:{vol:35},$:n=>elements[n],save:()=>saved++,bgStop(){},bgShell(){opened=true;return elements.bgb;},bgClose(){opened=false;closed++;},bgStart(){},document:{get hidden(){return hidden;},querySelector:()=>scene,addEventListener:(n,f)=>listeners[n]=f,removeEventListener(){}},window:{addEventListener:(n,f)=>windowListeners[n]=f},MutationObserver:class{observe(){}disconnect(){}},setInterval:f=>{timers.set(++id,f);return id;},clearInterval:i=>timers.delete(i)};
vm.createContext(sandbox);vm.runInContext(engine,sandbox);
const run=s=>vm.runInContext(s,sandbox);
for(const [h,expected]of[[0,3],[5,3],[6,0],[10,0],[11,1],[16,1],[17,2],[20,2],[21,3],[23,3]]){hour=h;assert.equal(run('osClock()'),expected);}
hour=12;run('osOpen()');assert(started>0,'music starts on entry');assert(!/BGM 듣기|현재 시간|os-times|나가기<\/button/.test(elements.bgb.innerHTML));assert.equal(timers.size,2);
run("osTalk('도치')");let prior=elements['os-talk'].textContent;run("osTalk('도치')");assert.notEqual(elements['os-talk'].textContent,prior);
run('osSetVolume(0)');assert.equal(run('OS.audio.volume'),0);assert.equal(sandbox.S.osVolume,0);
hidden=true;listeners.visibilitychange();assert(paused>0);hidden=false;listeners.visibilitychange();
for(let i=0;i<112;i++)run('osTick()');
windowListeners.pagehide();assert.equal(timers.size,0);assert.equal(run('OS.active'),false);
windowListeners.pageshow({persisted:true});assert.equal(run('OS.active'),true);assert.equal(timers.size,2);assert(started>1);
run('osExit()');assert.equal(timers.size,0);assert.equal(run('OS.audio'),null);assert.equal(closed,1);
for(let i=0;i<3;i++){run('osOpen()');assert.equal(timers.size,2);run('osExit()');assert.equal(timers.size,0);}
console.log('Onsen: clock boundaries, automatic audio, volume, varied dialogue, pixel frames, visibility and cleanup OK');
const weekly=html.slice(html.indexOf('const MD_WEEKLY='),html.indexOf('function hnSave',html.indexOf('const MD_WEEKLY=')));
let date='2026-10-11',holiday='',shown=0;const w={console,Date,Number,MD:{},S:{tutDone:1},tab:'home',todayStr:()=>date,dayTag:()=>holiday,$:n=>n==='ov'?{classList:{contains:()=>false}}:null,setTimeout:f=>{w.pending=f;return 1;},save(){},mdShow:()=>shown++,mandam:()=>shown++};vm.createContext(w);vm.runInContext('let mdL,mdI;'+weekly,w);
const wr=s=>vm.runInContext(s,w);wr('mdDayChk()');w.pending();assert.equal(shown,1);assert.equal(w.S.mdWeeklyDay,date);
date='2026-10-17';w.pending=null;wr('mdDayChk()');assert.equal(w.pending,null);
date='2026-10-18';wr('mdDayChk()');w.pending();assert.equal(shown,2);assert.equal(w.S.mdWeeklyCount,2);
date='2026-10-19';holiday='hol:test';wr('mdDayChk()');w.pending();assert.equal(shown,3);assert.equal(w.S.mdWeeklyDay,'2026-10-18');
console.log('Weekly dialogue: 7-day spacing, rotating episodes and holiday priority OK');
