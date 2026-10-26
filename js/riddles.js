/* 수수께끼 창과 기존 저장·공통 미니게임 보상의 연결. 저장 키는 그대로 유지합니다. */
(()=>{
  'use strict';
  const C=window.RiddleCore;
  const clone=x=>JSON.parse(JSON.stringify(x));
  let overlay=null,frame=null,oldOverflow='',closing=false,voices=[],appRoot=null,oldInert=false,oldHidden=null;
  function currentReceipt(id){
    const r=S.riddle;
    if(!r)return null;
    const active=r.active&&r.active.id===id&&r.active.result;
    if(active&&active.recorded)return active;
    return Array.isArray(r.archive)?r.archive.find(x=>x.id===id&&x.recorded)||null:null;
  }
  function updateArchive(state,id,result){
    const archived=state.archive.find(x=>x.id===id);
    if(archived)Object.assign(archived,result);
  }
  function readable(raw){
    if(!C.validState(raw))throw Error('수수께끼 기록을 읽지 못했어요. 설정에서 기록을 백업한 뒤 다시 열어 주세요.');
    return clone(raw);
  }
  function load(){
    if(S.riddle)return readable(S.riddle);
    const state=C.fresh();
    state.sound=true;
    return state;
  }
  function persist(raw){
    const next=readable(raw),r=next.active,paid=r&&currentReceipt(r.id);
    if(paid){
      r.result=clone(paid);
      updateArchive(next,r.id,paid);
    }
    S.riddle=next;
    return save();
  }
  function complete(raw,id){
    const previous=currentReceipt(id);
    if(previous)return clone(previous);
    const next=readable(raw),r=next.active;
    if(!r||r.id!==id||r.practice||r.items.length!==5||r.items.some(x=>!x.response)||!r.result)throw Error('다섯 문제의 답을 먼저 확인해 주세요.');
    const correct=r.items.filter(x=>x.response.correct).length,solo=r.items.filter(x=>x.response.correct&&!x.response.hint).length,requested=correct===5?2:correct>=3?1:0,available=S.mg.d!==todayStr()||S.mg.n<ECO.mgPlays;
    const result={...r.result,correct,solo,help:correct-solo,amount:available?requested:0,reason:!requested?'score':available?'earned':'limit',recorded:true,rewardDay:todayStr()};
    r.result=result;
    updateArchive(next,id,result);
    S.riddle=next;
    // 결과의 지급 표시를 먼저 S 안에 넣고, mgRw의 한 번의 저장으로 함께 보관합니다.
    mgRw(requested,'세 문제부터 도토리를 받을 수 있어요','br'+['light','mixed','deep'].indexOf(r.level),correct);
    return clone(result);
  }
  function info(){
    const n=S.mg.d===todayStr()?S.mg.n:0;
    return {
      remaining:Math.max(0,ECO.mgPlays-n),plays:ECO.mgPlays,acorns:S.acorns,
      sound:!!S.snd&&S.sv>0,
      music:!!S.bgmOn&&S.vol>0,musicVolume:(S.vol||0)/100,soundVolume:(S.sv||0)/100,
      fontScale:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fs'))||1,
      bold:!!S.bold,noAnim:!!S.noAnim
    };
  }
  function hush(){
    voices.forEach(v=>{
      try{
        const t=v.a.currentTime;
        v.g.gain.cancelScheduledValues(t);
        v.g.gain.setValueAtTime(v.g.gain.value,t);
        v.g.gain.linearRampToValueAtTime(0,t+.04);
        v.o.stop(t+.05);
      }catch(e){}
    });
    voices=[];
  }
  function sound(correct){
    if(document.hidden||!document.hasFocus())return;
    const a=mgAC();
    if(!a)return;
    const notes=correct?[523.25,659.25,783.99]:[392,349.23];
    notes.forEach((f,i)=>{
      const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+i*.10;
      o.type='sine';
      o.frequency.value=f;
      g.gain.setValueAtTime(0,t);
      g.gain.linearRampToValueAtTime(.10*mgV(),t+.015);
      g.gain.exponentialRampToValueAtTime(.0001,t+.17);
      o.connect(g).connect(a.destination);
      o.start(t);
      o.stop(t+.19);
      const voice={o,g,a};
      voices.push(voice);
      o.onended=()=>{
        voices=voices.filter(x=>x!==voice);
        o.disconnect();
        g.disconnect();
      };
    });
  }
  function close(){
    if(!overlay||closing)return;
    closing=true;
    hush();
    try{frame.contentWindow.dispatchEvent(new Event('tori-riddle-close'));}catch(e){}
    const o=overlay;
    overlay=null;
    frame=null;
    mgGone(o);
    document.body.style.overflow=oldOverflow;
    document.documentElement.classList.remove('riddle-on');
    if(appRoot){
      appRoot.inert=oldInert;
      if(oldHidden===null)appRoot.removeAttribute('aria-hidden');
      else appRoot.setAttribute('aria-hidden',oldHidden);
      appRoot=null;
    }
    closing=false;
    render();
    const opener=document.querySelector('[onclick="riddleOpen()"]');
    if(opener)opener.focus({preventScroll:true});
    bgStart();
  }
  window.ToriRiddleBridge=Object.freeze({load,persist,complete,info,sound,hush,close});
  window.riddleOpen=function(){
    if($('mg')||$('bgo')||$('mjroom'))return;
    oldOverflow=document.body.style.overflow;
    overlay=document.createElement('div');
    overlay.id='mg';
    overlay.className='riddle-overlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','부엉박사의 수수께끼 찻집');
    appRoot=document.querySelector('.app');
    if(appRoot){
      oldInert=!!appRoot.inert;
      oldHidden=appRoot.getAttribute('aria-hidden');
      appRoot.inert=true;
      appRoot.setAttribute('aria-hidden','true');
    }
    const loading=document.createElement('div');
    loading.className='riddle-loading';
    loading.textContent='수수께끼 찻집을 열고 있어요…';
    overlay.appendChild(loading);
    frame=document.createElement('iframe');
    frame.title='부엉박사의 수수께끼 찻집';
    frame.src='games/tori-riddles/index.html';
    frame.setAttribute('allow','autoplay');
    frame.addEventListener('load',()=>{
      if(loading.isConnected)loading.remove();
      if(frame)frame.focus();
    });
    overlay.appendChild(frame);
    document.body.appendChild(overlay);
    document.body.style.overflow='hidden';
    document.documentElement.classList.add('riddle-on');
    appScreenTheme();
    acHush();
  };
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hush();});
  addEventListener('blur',hush);
  addEventListener('pagehide',hush);
})();
