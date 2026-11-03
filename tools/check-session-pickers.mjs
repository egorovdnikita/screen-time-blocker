import fs from 'node:fs';import {Buffer} from 'node:buffer';import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawn}from'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');const out=path.join(root,'docs/reviews/2026-11-02-session-pickers');fs.mkdirSync(out,{recursive:true});const profile='/tmp/block-rn-check-'+Date.now();const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--hide-scrollbars','--remote-debugging-port=9339','--remote-allow-origins=*','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
let tab;for(let i=0;i<80;i++){try{tab=(await(await fetch('http://localhost:9339/json')).json()).find(t=>t.type==='page');break}catch{await new Promise(r=>setTimeout(r,100))}}
const errors=[];const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r));let seq=0;const pending=new Map();ws.onmessage=e=>{const d=JSON.parse(e.data);if(d.method==='Runtime.exceptionThrown')errors.push(d.params);if(d.method==='Runtime.consoleAPICalled'&&['warning','error'].includes(d.params.type))errors.push(d.params); if(d.id&&pending.has(d.id)){const p=pending.get(d.id);pending.delete(d.id);if(d.error)p.reject(Error(JSON.stringify(d.error)));else p.resolve(d.result)}};const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});const ev=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};const wait=ms=>new Promise(r=>setTimeout(r,ms));const shot=async name=>{await wait(500);const r=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(out+'/'+name+'.png',Buffer.from(r.data,'base64'))};
const click=async(text)=>{let r=await ev(`(()=>{const els=[...document.querySelectorAll('[role="button"],[role="checkbox"],[role="switch"],[aria-label]')];const e=els.findLast(e=>e.getAttribute('aria-label')===${JSON.stringify(text)}||e.textContent.trim()===${JSON.stringify(text)});if(!e)throw Error('Нет кнопки '+${JSON.stringify(text)});let r=e.getBoundingClientRect();if(r.y<60||r.bottom>690){e.scrollIntoView({block:'center',inline:'nearest'});r=e.getBoundingClientRect()}return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await cdp('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...r});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...r});await wait(450)};

const wheel = async (label) => ev(`(()=>{const e=[...document.querySelectorAll('[role="slider"]')].findLast(e=>e.getAttribute('aria-label')===${JSON.stringify(label)});if(!e)throw Error('Нет колеса '+${JSON.stringify(label)});return {value:Number(e.getAttribute('aria-valuenow')),rect:e.getBoundingClientRect().toJSON()}})()`);
const chooseWheel = async (label, target) => {
 await ev(`(()=>{const e=[...document.querySelectorAll('[role="slider"]')].findLast(e=>e.getAttribute('aria-label')===${JSON.stringify(label)});if(!e)throw Error('Нет колеса');e.focus()})()`);
 for(let i=0;i<65;i++){
  const q=await wheel(label);if(q.value===target){await wait(450);const r=await wheel(label);if(r.value===target)return;}
  const value=(await wheel(label)).value;const key=value<target?'ArrowUp':'ArrowDown';const code=key==='ArrowUp'?38:40;
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key,code:key,windowsVirtualKeyCode:code});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key,code:key,windowsVirtualKeyCode:code});await wait(65);
 }
 throw Error('Не выбрано '+label+'='+target+'; '+JSON.stringify(await wheel(label)));
};
const tap = async(x,y)=>{await cdp('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,x,y});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,x,y});await wait(350)};
try {
 await cdp('Page.enable').then(()=>cdp('Page.addScriptToEvaluateOnNewDocument',{source:'globalThis.__BLOCK_DEMO__=1'}));await cdp('Runtime.enable');await cdp('Network.enable');await cdp('Network.setCacheDisabled',{cacheDisabled:true});await cdp('Emulation.setDeviceMetricsOverride',{width:393,height:852,deviceScaleFactor:3,mobile:false});
 await cdp('Page.navigate',{url:(process.env.EXPO_WEB_URL??'http://localhost:8081')+''});for(let i=0;i<80;i++){if(await ev("document.body.innerText.includes('Начать блокировку')"))break;await wait(500)}
 await click('Начать блокировку');await click('Прямо сейчас');await wait(600);await shot('00-overview');await click('Длительность');await shot('01-immediate-048');
 const initial=await wheel('Минуты длительности');
 await chooseWheel('Минуты длительности',1);const minimumMinute=(await wheel('Минуты длительности')).value===1;if(!minimumMinute)throw Error('Нулевая длительность');
 await chooseWheel('Минуты длительности',45);
 const r=(await wheel('Минуты длительности')).rect;
 await cdp('Input.dispatchMouseEvent',{type:'mouseWheel',x:r.x+r.width/2,y:r.y+r.height/2,deltaX:0,deltaY:145});await wait(650);
 const scrolled=await wheel('Минуты длительности');if(scrolled.value===45)throw Error('Колесо не реагирует на прокрутку');
 await chooseWheel('Минуты длительности',45);await chooseWheel('Дни длительности',1);await chooseWheel('Часы длительности',2);await shot('02-duration-combined');
 await click('Активность');await click('Начать');await wait(600);const durationSaved=await ev("document.body.innerText.includes('Осталось 1 д 2 ч 45 мин')");if(!durationSaved)throw Error('Длительность не сохранена');
 await click('Начать блокировку');await click('По расписанию');await click('Активность');await shot('03-scheduled-049');await click('Начало');await shot('04-time-popover-050');
 await chooseWheel('Часы начала',9);await shot('04b-time-popover-051');await tap(10,80);
 await click('Окончание');await chooseWheel('Часы окончания',6);await tap(10,80);await shot('04c-scheduled-052');
 await click('Сб');await click('Вс');await shot('04d-every-day-053');
 await click('Начало');await chooseWheel('Часы начала',12);await chooseWheel('Минуты начала',15);await chooseWheel('Период начала',0);await tap(10,80);
 await click('Окончание');await chooseWheel('Часы окончания',12);await chooseWheel('Минуты окончания',45);await chooseWheel('Период окончания',1);await tap(10,80);
 const midnightNoon=await ev("document.body.innerText.includes('00:15') && document.body.innerText.includes('12:45')");if(!midnightNoon)throw Error('Ошибка AM/PM');
 await click('Весь день');await shot('05-all-day-053');
 const allDayDisabled=await ev("[...document.querySelectorAll('[aria-label=\"Начало\"],[aria-label=\"Окончание\"]')].slice(-2).every(e=>e.getAttribute('aria-disabled')==='true')");if(!allDayDisabled)throw Error('Часы не отключены для всего дня');
 await click('Весь день');await click('Новый шаблон');await wait(500);await click('Добавить шаблон Сессия');const scheduleSaved=await ev("document.body.innerText.includes('00:15 – 12:45') && document.body.innerText.includes('Каждый день')");if(!scheduleSaved)throw Error('Расписание не применилось');
 if(errors.length)throw Error(JSON.stringify(errors));await shot('06-saved');fs.writeFileSync(out+'/checks.json',JSON.stringify({initial,scrollValue:scrolled.value,minimumMinute,durationSaved,midnightNoon,allDayDisabled,scheduleSaved,errors},null,2));console.log('Picker flow OK');
}catch(e){await shot('error');fs.writeFileSync(out+'/error-dom.json',JSON.stringify(await ev(`({text:document.body.innerText,sliders:[...document.querySelectorAll('[role="slider"]')].map(e=>({label:e.getAttribute('aria-label'),value:e.getAttribute('aria-valuenow'),tabindex:e.getAttribute('tabindex')}))})`),null,2));console.log(String(e));process.exitCode=1;}finally{ws.close();chrome.kill();await wait(300);fs.rmSync(profile,{recursive:true,force:true});}
