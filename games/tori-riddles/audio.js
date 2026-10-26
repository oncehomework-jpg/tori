/* 사용자가 고른 달빛 오르골 서재. 소리는 탭에서만 깨우고, 가려지면 짧게 줄입니다. */
(()=>{
  'use strict';
  window.createRiddleAudio=(info,enabled)=>{
    let context=null,music=null,unlocked=false,closed=false,epoch=0,resumeTimer=0,musicPending=false;
    const buffers=new Map(),voices=new Set();
    const visible=()=>!closed&&!document.hidden&&document.hasFocus();
    const canMusic=()=>visible()&&enabled()&&info().music;
    const canEffect=()=>visible()&&enabled()&&info().sound;
    async function buffer(name){
      if(!buffers.has(name))buffers.set(name,fetch('../../audio/riddles/moon-'+name+'-v163.wav').then(r=>{if(!r.ok)throw Error('audio');return r.arrayBuffer();}).then(b=>context.decodeAudioData(b)).catch(e=>{buffers.delete(name);throw e;}));
      return buffers.get(name);
    }
    function voice(data,level,loop=false){
      const source=context.createBufferSource(),gain=context.createGain(),t=context.currentTime;
      source.buffer=data;source.loop=loop;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(level,t+(loop?.4:.008));
      source.connect(gain).connect(context.destination);const v={source,gain};voices.add(v);
      source.onended=()=>{voices.delete(v);source.disconnect();gain.disconnect();};source.start();return v;
    }
    function hush(){
      epoch++;musicPending=false;clearTimeout(resumeTimer);music=null;
      if(!context)return;
      const t=context.currentTime;
      voices.forEach(v=>{try{v.gain.gain.cancelScheduledValues(t);v.gain.gain.setValueAtTime(v.gain.gain.value,t);v.gain.gain.linearRampToValueAtTime(0,t+.04);v.source.stop(t+.05);}catch(e){}});
      voices.clear();
    }
    async function start(){
      if(!unlocked||!canMusic()||music||musicPending)return;
      musicPending=true;const ticket=epoch;
      try{const data=await buffer('bgm');if(ticket===epoch&&canMusic()&&!music)music=voice(data,info().musicVolume,true);}catch(e){}
      finally{if(ticket===epoch)musicPending=false;}
    }
    async function tap(){
      if(!visible()||!enabled()||(!info().music&&!info().sound))return;
      try{context=context||new(window.AudioContext||window.webkitAudioContext)();if(context.state==='suspended')await context.resume();unlocked=true;start();}catch(e){}
    }
    async function effect(name){
      if(!canEffect())return;
      await tap();if(!context)return;const ticket=epoch;
      try{const data=await buffer(name);if(ticket===epoch&&canEffect())voice(data,info().soundVolume);}catch(e){}
    }
    function returnLater(){clearTimeout(resumeTimer);resumeTimer=setTimeout(()=>{if(visible()&&unlocked)start();},400);}
    document.addEventListener('visibilitychange',()=>{if(document.hidden)hush();else returnLater();});
    window.addEventListener('blur',hush);window.addEventListener('pagehide',hush);window.addEventListener('focus',returnLater);window.addEventListener('pageshow',returnLater);
    window.addEventListener('tori-riddle-close',()=>{closed=true;hush();});
    return Object.freeze({tap,effect,hush});
  };
})();
