// Run locally: node tools/test_picture_picker.js. DOM/canvas are simulated;
// this checks persisted completion and preservation, not browser rendering.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const moduleCode=html.slice(html.indexOf('const DF='),html.indexOf('function mjRoomOpen()'));
const saveCode=html.slice(html.indexOf('function save(){'),html.indexOf('\n',html.indexOf('function save(){')));
const initial={fed:137,coinSpent:25,claimed:[2,9],album:['n001'],logs:{'2026-10-09':{note:'keep'}},bg:{su:{q:[1],done:false},tc:{sc:[100,0]},my:{n:4}},mg:{d:'2026-10-10',n:2,b1:45},deco:{pos:{1:[10,20]}},sched:[{title:'keep'}],myHol:[],holOff:[],memSeen:['keep'],snd:false,bgmOn:false,vol:35,sv:50,playT:'diff',coupons:['keep'],custom:'unknown-field'};
let disk=JSON.stringify(initial),idb='';
function session(){
 const nodes=new Map(),ctx=new Proxy({}, {get:()=>()=>{}});
 const el=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',style:{},classList:{add(){},toggle(){}},getBoundingClientRect(){return {width:374,height:630};},hidden:false,disabled:false,addEventListener(){},getContext(){return ctx;}});return nodes.get(id);};
 const env={S:JSON.parse(disk),KEY:'jw_diary_v1',$:el,acLog(){},localStorage:{setItem(k,j){assert.equal(k,'jw_diary_v1');disk=j;}},idbPut(j){idb=j;},bgStop(){},bgStart(){},bgShell(){return el('bgb');},document:{querySelector(){return el('pair');}},Image:class{set src(s){this.onload();}},console,setTimeout(){return 1;},clearTimeout(){}};
 vm.createContext(env);vm.runInContext(saveCode+'\n'+moduleCode,env);return {env,el,run:s=>vm.runInContext(s,env)};
}
(async()=>{
 let t=session();t.run('dfOpen()');assert(t.el('bgb').innerHTML.includes('딸기 티파티'));
 t.run('dfPage(-1)');assert.equal(t.run('DF.page'),3);t.run('dfPage(1)');assert.equal(t.run('DF.page'),0);
 t.run('dfPageTo(1)');assert.equal(t.run('DF.page'),1);
 t.run('dfStart(0)');await new Promise(r=>setImmediate(r));
 t.run('dfTako()');assert.equal(t.run('DF.hint'),0);assert(t.el('df-note').textContent.includes('타코:'));assert.equal(t.run('DF.found.length'),0);assert(!JSON.parse(disk).dfCompleted);
 t.run('dfTap(129,146);dfTap(129,146)');assert.equal(t.run('DF.found.length'),1);
 t.run('dfTako()');assert.equal(t.run('DF.hint'),1);
 assert(!JSON.parse(disk).dfCompleted,'Partial plays must not complete a scene');
 t.run('dfTap(17,216);dfTap(170,162);dfTap(76,251);dfTap(147,71)');
 t.run('dfTako()');assert(t.el('df-note').textContent.includes('이미 다 찾았네'));
 assert.equal(t.run('DF.found.length'),5);assert.equal(JSON.parse(disk).dfCompleted['strawberry-teaparty'],true);assert.equal(idb,disk);
 const saved=JSON.parse(disk);delete saved.dfCompleted;assert.deepStrictEqual(saved,initial,'Existing records and reward fields changed');
 assert.deepStrictEqual(Array.from(t.run('dfOrder().map(v=>v.scene.id)')),['acorn-cookie-workshop','starlight-library','glass-garden','strawberry-teaparty']);
 t.run('dfNext()');assert(t.el('bgb').innerHTML.includes('쿠키 공방'));
 t.run('dfSelect("strawberry-teaparty")');assert.equal(t.run('DF.page'),3);assert(t.el('bgb').innerHTML.includes('완료 ·'));
 t.run('dfStart(0)');assert.equal(t.run('DF.found.length'),0);assert(t.run('dfDone("strawberry-teaparty")'));
 t.el('bgx').onclick();assert(t.el('bgb').innerHTML.includes('이 그림 다시 하기'));
 t=session();t.run('dfOpen()');assert.equal(t.run('dfOrder()[3].scene.id'),'strawberry-teaparty');
 t.run('DF_SCENES.reverse()');assert(t.run('dfDone(DF_SCENES[3].id)'));assert(!t.run('dfDone(DF_SCENES[0].id)'));
 t.run('dfStart(0)');await new Promise(r=>setImmediate(r));t.run('dfSpots().forEach(p=>dfTap(p.x,p.y))');
 for(let stage=1;stage<3;stage++){t.run('dfStart('+stage+')');await new Promise(r=>setImmediate(r));t.run('dfSpots().forEach(p=>dfTap(p.x,p.y))');}
 assert(t.run('dfOrder().every(v=>dfDone(v.scene.id))'));
 t.run('dfOpen();dfPage(1);dfStart(1)');assert.equal(t.run('DF.found.length'),0);
 console.log('PASS: page wrap/number, duplicate touch, 5 spots, sorting, replay, back, localStorage + IDB write, restart, stable IDs after source reorder, all complete, 19 existing fields unchanged.');
})().catch(e=>{console.error(e);process.exitCode=1;});
