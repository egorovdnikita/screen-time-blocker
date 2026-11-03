// Сравнение текстов RN-web с HTML-замерами полного аудита (docs/reviews/2026-11-03-full-audit/html/<id>.json).
// Использование: node tools/compare-html-text.mjs <id>=<route> ...   Пример: 1=/onboarding?step=1
// Печатает тексты, у которых x/y/ширина/кегль/вес расходятся больше порога (0.75pt).
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {openChrome,wait} from './lib/cdp.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pairs=process.argv.slice(2).map(a=>{const i=a.indexOf('=');return [a.slice(0,i),a.slice(i+1)]});
const b=await openChrome({port:9360,demo:true});const report={};
const collect=()=>b.ev(`(()=>{const out=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(w.nextNode()){const n=w.currentNode,e=n.parentElement,t=n.textContent.trim();if(!t)continue;const s=getComputedStyle(e);if(s.visibility==='hidden'||s.display==='none'||+s.opacity===0)continue;const r=document.createRange();r.selectNodeContents(n);const b=r.getBoundingClientRect();if(!b.width||b.bottom<0||b.top>innerHeight)continue;out.push({text:t,x:b.x,y:b.y,w:b.width,font:parseFloat(s.fontSize),weight:s.fontWeight})}return out})()`);
const norm=t=>t.replace(/\s+/g,' ').trim();
try{for(const [id,route] of pairs){
  const html=JSON.parse(fs.readFileSync(path.join(root,'docs/reviews/2026-11-03-full-audit/html',String(id).padStart(3,'0')+'.json'),'utf8')).texts;
  await b.nav(route);await wait(800);const rn=await collect();const used=new Set();const diffs=[];
  for(const h of html){const key=norm(h.text);const i=rn.findIndex((r,j)=>!used.has(j)&&(norm(r.text)===key||norm(r.text).startsWith(key)));if(i<0){diffs.push({text:key,missing:true});continue}used.add(i);const r=rn[i];
    const d={dx:+(r.x-h.x).toFixed(2),dy:+(r.y-h.y).toFixed(2),dw:+(r.w-h.w).toFixed(2),font:[parseFloat(h.font),r.font],weight:[h.weight,r.weight]};
    if(Math.abs(d.dx)>.75||Math.abs(d.dy)>.75||Math.abs(d.dw)>.75||d.font[0]!==d.font[1]||String(d.weight[0])!==String(d.weight[1]))diffs.push({text:key.slice(0,40),...d});}
  report[id]=diffs;console.log(`${id} ${route}: ${diffs.length} расхождений`);for(const x of diffs)console.log('   ',JSON.stringify(x));
}}finally{await b.close()}
fs.writeFileSync(process.env.OUT??'/dev/null',JSON.stringify(report,null,2));
