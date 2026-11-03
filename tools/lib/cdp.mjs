// Общий запуск headless Chrome и CDP-хелперы для новых проверок (старые скрипты содержат свои копии).
import fs from 'node:fs';import {Buffer} from 'node:buffer';import {spawn} from 'node:child_process';
export const wait=ms=>new Promise(r=>setTimeout(r,ms));
export async function openChrome({port=9350,width=393,height=852,demo=false}={}){
  const profile='/tmp/block-check-'+Date.now()+'-'+port;
  const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--hide-scrollbars',`--remote-debugging-port=${port}`,'--remote-allow-origins=*','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
  let tab;for(let i=0;i<100;i++){try{tab=(await(await fetch(`http://localhost:${port}/json`)).json()).find(t=>t.type==='page');if(tab)break}catch{}await wait(100)}
  const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r));
  let seq=0;const pending=new Map();const errors=[];
  ws.onmessage=e=>{const d=JSON.parse(e.data);if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails?.exception?.description??d.params);if(d.method==='Runtime.consoleAPICalled'&&d.params.type==='error')errors.push(d.params.args?.map(a=>a.value??a.description).join(' '));if(d.id&&pending.has(d.id)){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}};
  const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
  const ev=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails.exception?.description??r.exceptionDetails));return r.result.value};
  await cdp('Page.enable');await cdp('Runtime.enable');
  if(demo)await cdp('Page.addScriptToEvaluateOnNewDocument',{source:'globalThis.__BLOCK_DEMO__=1'});
  await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
  const base=process.env.EXPO_WEB_URL??'http://localhost:8082';
  const has=async(label,ms=8000)=>{for(let i=0;i<ms/100;i++){if(await ev(`!!document.querySelector('[aria-label=${JSON.stringify(label)}]')`))return true;await wait(100)}return false};
  const nav=async url=>{await cdp('Page.navigate',{url:base+url});await wait(1800)};
  const reload=async()=>{await cdp('Page.reload',{});await wait(2200)};
  const click=async text=>{const r=await ev(`(()=>{const els=[...document.querySelectorAll('[role="button"],[role="checkbox"],[role="switch"],[role="tab"],[aria-label]')];const e=els.findLast(e=>e.getAttribute('aria-label')===${JSON.stringify(text)}||e.textContent.trim()===${JSON.stringify(text)});if(!e)throw Error('Нет кнопки '+${JSON.stringify(text)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await cdp('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...r});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...r});await wait(900)};
  const shot=async file=>{const r=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(file,Buffer.from(r.data,'base64'))};
  const close=async()=>{ws.close();chrome.kill();await wait(300);fs.rmSync(profile,{recursive:true,force:true})};
  return {cdp,ev,nav,reload,click,shot,has,close,errors,base};
}
