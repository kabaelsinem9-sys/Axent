import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const platforms=(await import('../platforms.mjs')).default;
for(const p of platforms){
 const href=fs.readFileSync(path.join(root,'terminals',p.id,'bookmarklet.txt'),'utf8').trim();
 assert.ok(href.startsWith('javascript:'));
 const script=decodeURIComponent(href.slice(11));
 new vm.Script(script);
 let notice='';
 const context={document:{getElementById:()=>null},location:{hostname:'example.org'},alert:s=>notice=s};
 vm.runInNewContext(script,context,{timeout:1000});
 assert.ok(notice.includes(p.url),'Wrong-domain guard');
 let closed=false;
 vm.runInNewContext(script,{document:{getElementById:()=>({dispatchEvent:()=>{closed=true;}})},Event:class{}},{timeout:1000});
 assert.equal(closed,true,'Second click closes existing overlay');
 assert.ok(!script.includes('featureassets.org'));
 console.log(p.id+': valid generated JS, domain guard and repeat-click close passed');
}
// Exercise async market loading and alert transitions without network or a wallet.
const nodes=new Map();
function element(){return {value:'',textContent:'',children:[],className:'',classList:{toggle(){}},style:{setProperty(){}},setAttribute(k,v){this[k]=v;},append(...n){this.children.push(...n);},replaceChildren(...n){this.children=n;},focus(){},remove(){},addEventListener(){},attachShadow(){return {querySelector(selector){if(!nodes.has(selector))nodes.set(selector,element());return nodes.get(selector);},set innerHTML(value){}};}};}
const hostParent=element();
let currentPrice=100, fail=false, fetches=0, intervalCleared=false, stored='[]';
const source=fs.readFileSync(path.join(root,'src/detect.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'src/overlay.js'),'utf8');
const context={
 document:{getElementById:()=>null,activeElement:null,createElement:element,body:hostParent,addEventListener(){},removeEventListener(){}},
 location:{hostname:'fomo.family',href:'https://fomo.family/'},
 localStorage:{getItem:()=>stored,setItem:(k,v)=>{stored=v;}},
 setInterval:()=>1,clearInterval:()=>{intervalCleared=true;},setTimeout:()=>1,clearTimeout(){},
 AbortController,Intl,URL,Date,Event,
 fetch:async()=>{fetches++;if(fail)throw new Error('offline');return {ok:true,json:async()=>[{chainId:'solana',baseToken:{address:'So11111111111111111111111111111111111111112',symbol:'SOL'},quoteToken:{symbol:'USDC'},priceUsd:String(currentPrice),pairAddress:'pool',liquidity:{usd:10000}}]};}
};
vm.runInNewContext(source+';axentOverlay('+JSON.stringify(platforms[0])+');',context);
const q=selector=>{if(!nodes.has(selector))nodes.set(selector,element());return nodes.get(selector);};
q('#chain').value='solana';q('#address').value='invalid';
q('form').onsubmit({preventDefault(){}});
assert.equal(fetches,0,'Invalid addresses never sent to API');
q('#address').value='So11111111111111111111111111111111111111112';
q('form').onsubmit({preventDefault(){}});
await new Promise(resolve=>setImmediate(resolve));
assert.equal(q('#price').textContent,'$100');
assert.equal(JSON.parse(stored).length,1);
q('#threshold').value='5';q('#arm').onclick();
assert.equal(q('#arm').textContent,'Disarm alert');
await q('#refresh').onclick(); // Set next-sample baseline at 100.
currentPrice=106;await q('#refresh').onclick();
assert.ok(q('#events').textContent.includes('6.00%'),'Movement alert fires');
assert.equal(q('#arm').textContent,'Arm alert','Alert is one-shot');
fail=true;await q('#refresh').onclick();
assert.ok(q('#status').textContent.includes('stale'),'Failed fetch flags stale values');
assert.equal(q('#price').textContent,'$106','Last good price retained');
q('#close').onclick();assert.equal(intervalCleared,true,'Close clears polling');
console.log('Market load, invalid input, persistence, one-shot alert, stale state and cleanup passed');

const detectContext={URL};
vm.createContext(detectContext);
vm.runInContext(fs.readFileSync(path.join(root,'src/detect.js'),'utf8'),detectContext);
const detect=detectContext.axentDetectContext, doc={querySelectorAll:()=>[]};
const mint='So11111111111111111111111111111111111111112';
assert.equal(detect(doc,'https://pump.fun/coin/'+mint,platforms[1]).kind,'token');
assert.equal(detect(doc,'https://axiom.trade/meme/'+mint+'?chain=sol',platforms[5]).kind,'pair');
assert.equal(detect(doc,'https://fomo.family/token/'+mint,platforms[0]).address,mint);
assert.equal(detect(doc,'https://trojan.com/trade?token='+mint,platforms[2]).address,mint);
assert.equal(detect(doc,'https://trade.padre.gg/trade/solana/'+mint,platforms[3]).chain,'solana');
assert.equal(detect(doc,'https://basedbot.app/trade?pair='+mint,platforms[4]).kind,'pair');
assert.equal(detect(doc,'https://axiom.trade/discover',platforms[5]),null);
const evm='0x'+'a'.repeat(40);
assert.equal(detect(doc,'https://trade.padre.gg/base/token/'+evm,platforms[3]).chain,'base');
assert.equal(detect(doc,'https://trade.padre.gg/token/'+evm,platforms[3]),null,'Do not guess an EVM chain');
console.log('URL detection: six platform route fixtures, pool vs token, chain identification, empty discovery page passed');
nodes.clear();
const pollers=[];let lastEndpoint='';
context.localStorage.getItem=()=> '[]';
context.location.href='https://axiom.trade/meme/'+mint+'?chain=sol';context.location.hostname='axiom.trade';
context.setInterval=fn=>{pollers.push(fn);return pollers.length;};
context.fetch=async endpoint=>{lastEndpoint=endpoint;return {ok:true,json:async()=>({pairs:[{chainId:'solana',baseToken:{address:mint,symbol:'SOL'},quoteToken:{symbol:'USDC'},pairAddress:mint,priceUsd:'123',liquidity:{usd:100}}]})};};
vm.runInNewContext(source+';axentOverlay('+JSON.stringify(platforms[5])+');',context);
await new Promise(resolve=>setImmediate(resolve));
assert.ok(lastEndpoint.includes('/latest/dex/pairs/solana/'),'Pool URL requests exact pair endpoint');
assert.equal(q('#name').textContent,'SOL / USDC · solana','Current pair renders without manual input');
q('#follow').checked=true;context.location.href='https://axiom.trade/discover';pollers[1]();
assert.ok(q('#context').textContent.includes('Open a token or pair page'),'Discovery page clears active context');
q('#close').onclick();
console.log('Automatic pool startup and same-page navigation cleanup passed');
