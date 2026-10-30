/* AXENT open-source overlay. No remote code, credentials or trading execution. */
function axentOverlay(platform, preview) {
  'use strict';
  const ID = 'axent-open-overlay-v1';
  const existing = document.getElementById(ID);
  if (existing) { existing.dispatchEvent(new Event('axent-close')); return; }
  if (!preview && !platform.hosts.some(h => location.hostname === h || location.hostname.endsWith('.' + h))) {
    alert('Open ' + platform.url + ' and click this bookmark again.'); return;
  }
  const priorFocus = document.activeElement;
  const host = document.createElement('div'); host.id = ID;
  host.style.cssText = 'all:initial!important;position:fixed!important;right:20px!important;top:24px!important;width:min(370px,calc(100vw - 24px))!important;z-index:2147483647!important;color-scheme:dark!important;';
  const root = host.attachShadow({mode:'open'});
  root.innerHTML = `<style>
  :host{font:14px/1.45 -apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#eeeeee}*{box-sizing:border-box}section{font:14px/1.45 -apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#eeeeee;background:#080808;border:1px solid #282828;border-radius:16px;box-shadow:0 18px 80px #0009;overflow:hidden}header{display:flex;align-items:center;gap:10px;padding:15px 18px;border-bottom:1px solid #232323;cursor:move;touch-action:none}header strong{font-size:22px;font-weight:400;letter-spacing:-.8px}header span{flex:1;font-family:monospace;color:#999999;font-size:11px;text-transform:uppercase;letter-spacing:1px}button,input,select{font:inherit;border:1px solid #303030;border-radius:20px;background:#111111;color:#eeeeee;padding:9px;min-width:0}button{cursor:pointer}button:hover{border-color:#eeeeee}button:focus-visible,input:focus-visible,select:focus-visible,a:focus-visible{outline:2px solid #eeeeee;outline-offset:2px}header button{padding:3px 8px}main{padding:18px;max-height:calc(100vh - 130px);overflow:auto}p{margin:0 0 12px;color:#888888;font-size:12px}form{display:grid;grid-template-columns:95px 1fr auto;gap:6px}label{display:block;font-size:11px;color:#888888;margin:12px 0 5px}input{width:100%}.row{display:flex;align-items:center;gap:8px;margin-top:12px}.row>*{flex:1}.primary{background:#eeeeee;color:#080808;font-weight:500}.list{display:flex;gap:6px;flex-wrap:wrap;margin:14px 0}.list button{font-size:12px;padding:6px 9px}.list button[aria-pressed=true]{border-color:#eeeeee;color:#eeeeee}h2{font-weight:400;font-size:24px;letter-spacing:-.6px;margin:16px 0 4px}.price{font-size:30px;font-variant-numeric:tabular-nums;color:#eeeeee}.stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.stat{background:transparent;border:1px solid #ffffff12;border-radius:0;padding:12px}.stat small{display:block;color:#888888}.stat b{font-weight:400;font-size:17px;font-variant-numeric:tabular-nums}a{color:#eeeeee}svg{width:100%;height:65px;background:#0c0c0c;border-radius:8px}#status{min-height:35px;margin-top:12px;font-size:11px;color:#929292}#events{color:#eeeeee;font-size:12px;margin:10px 0}footer{font-size:10px;color:#777777;border-top:1px solid #232323;padding-top:12px;margin-top:16px}.hidden{display:none!important}#auto{flex:none}#autoLabel{margin:0;flex:1}button:disabled{opacity:.5;cursor:wait}details{margin:12px 0;color:#888;font-size:12px}summary{cursor:pointer;padding:8px 0}details form{margin-top:10px}#context{font:11px/1.6 monospace;color:#8b8b8b;overflow-wrap:anywhere}#follow,#auto{accent-color:#eee}header button{border:0;background:transparent;color:#aaa}header button:hover{color:#fff}.stats{gap:0}#remove{font-size:11px}a{font-size:12px}#price{margin:8px 0 20px}
  </style><section role="region" aria-label="AXENT trading overlay"><header><strong>Axent</strong><span></span><button id="min" aria-label="Collapse overlay">−</button><button id="close" aria-label="Close overlay">×</button></header><main>
  <p id="context">Detecting the open token…</p><div class="row"><input id="follow" type="checkbox" checked style="flex:none;width:auto"><label for="follow" style="margin:0">Follow the open token automatically</label></div>
  <details id="settings"><summary>Manual controls</summary><form><select id="chain" aria-label="Chain"><option value="solana">Solana</option><option value="ethereum">Ethereum</option><option value="base">Base</option><option value="bsc">BNB Chain</option></select><input id="address" aria-label="Token contract address" placeholder="Token contract address" required><button class="primary" id="add">Track</button></form>
  <div class="row"><button id="fromPage">Detect current pair</button><button id="copy">Copy address</button></div><div id="list" class="list" aria-label="Watchlist"></div></details>
  <div id="detail" class="hidden"><h2 id="name"></h2><div id="price" class="price"></div><div class="stats" id="stats"></div><svg viewBox="0 0 350 65" role="img" aria-label="Price samples collected during this session"><polyline fill="none" stroke="#eeeeee" stroke-width="2" points=""/></svg><p>Session samples · not historical candles</p><div class="row"><a id="dex" target="_blank" rel="noopener noreferrer">View market ↗</a><button id="remove">Remove token</button></div><label for="threshold">Alert when price moves ± this % from the next sample</label><div class="row"><input id="threshold" type="number" min="0.1" max="1000" step="0.1" value="5" aria-label="Price movement threshold percent"><button id="arm">Arm alert</button></div></div>
  <div id="events" role="status"></div><div class="row"><input id="auto" type="checkbox" checked><label for="auto" id="autoLabel">Refresh every 15 seconds</label><button id="refresh">Refresh</button></div><div id="status" role="status"></div><footer>DEX Screener · public data may be delayed. Alerts run while this tab is open. No order execution. Watchlist stays in this site's browser storage.</footer></main></section>`;
  (document.body || document.documentElement).append(host);
  const $ = selector => root.querySelector(selector);
  $('header span').textContent = platform.name;
  const key = 'axent:open:watchlist:v1';
  const validAddress = (chain,address) => chain === 'solana' ? /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address) : /^0x[0-9a-fA-F]{40}$/.test(address);
  const chains = ['solana','ethereum','base','bsc'];
  let current = null, contextSignature = null, pendingRefresh = false;
  let watch = [], selected = '', closed = false, busy = false, controller, storageFailed = false;
  const cache = new Map(), samples = new Map(), alerts = new Map();
  try { const stored = JSON.parse(localStorage.getItem(key) || '[]'); if (Array.isArray(stored)) watch = stored.filter(t => chains.includes(t.chain) && typeof t.address === 'string' && validAddress(t.chain,t.address)).slice(0,10); } catch { storageFailed = true; }
  const tokenKey = t => t.chain + ':' + (t.chain === 'solana' ? t.address : t.address.toLowerCase()) + (t.kind ? ':'+t.kind : '');
  const save = () => { try { localStorage.setItem(key,JSON.stringify(watch)); } catch { storageFailed = true; } };
  const number = value => value == null || !Number.isFinite(Number(value)) ? '—' : new Intl.NumberFormat('en',{notation:'compact',maximumFractionDigits:2}).format(Number(value));
  const price = value => '$' + Number(value).toLocaleString('en',{maximumSignificantDigits:7});
  const message = text => { $('#status').textContent = text + (storageFailed ? ' Storage unavailable; watchlist lasts this session.' : ''); };
  function list() {
    $('#list').replaceChildren();
    for (const t of watch) { const k = tokenKey(t), b = document.createElement('button'); b.textContent = cache.get(k)?.baseToken?.symbol || t.address.slice(0,5) + '…'; b.setAttribute('aria-pressed',String(k === selected)); b.onclick = () => { selected = k; draw(); }; $('#list').append(b); }
  }
  function draw() {
    list(); const pair = cache.get(selected), tracked = current && tokenKey(current) === selected ? current : watch.find(t => tokenKey(t) === selected);
    $('#detail').classList.toggle('hidden',!pair); if (!pair || !tracked) return;
    $('#name').textContent = (pair.baseToken?.symbol || 'Token') + ' / ' + (pair.quoteToken?.symbol || '') + ' · ' + tracked.chain;
    $('#price').textContent = price(pair.priceUsd);
    $('#stats').replaceChildren();
    for (const [label,value] of [['5m change',pair.priceChange?.m5 == null ? '—' : pair.priceChange.m5 + '%'],['1h volume',pair.volume?.h1 == null ? '—' : '$'+number(pair.volume.h1)],['Liquidity',pair.liquidity?.usd == null ? '—' : '$'+number(pair.liquidity.usd)],['Market cap',pair.marketCap == null ? '—' : '$'+number(pair.marketCap)]]) { const box = document.createElement('div'); box.className='stat'; const small=document.createElement('small'), b=document.createElement('b'); small.textContent=label; b.textContent=value; box.append(small,b); $('#stats').append(box); }
    const points = samples.get(selected) || [], lo = Math.min(...points), hi = Math.max(...points), span = hi-lo || 1;
    $('polyline').setAttribute('points',points.map((n,i) => `${points.length===1?175:5+i/(points.length-1)*340},${55-(n-lo)/span*45}`).join(' '));
    $('#dex').href = 'https://dexscreener.com/' + encodeURIComponent(tracked.chain) + '/' + encodeURIComponent(pair.pairAddress);
    $('#arm').textContent = alerts.has(selected) ? 'Disarm alert' : 'Arm alert';
  }
  async function refresh() {
    if (closed) return; if(busy){pendingRefresh=true;return;} if(!watch.length&&!current)return;
    busy = true; $('#refresh').disabled = true; message('Updating public markets…'); let failures = 0;
    const targets = current ? [current,...watch.filter(t=>t.chain!==current.chain||t.address!==current.address)] : [...watch];
    for (const t of targets) {
      if (closed) break;
      const k = tokenKey(t); controller = new AbortController(); const timeout = setTimeout(() => controller.abort(),10000);
      try {
        async function request(path) {
          const response=await fetch('https://api.dexscreener.com/'+path,{credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal});
          if(!response.ok)throw new Error('HTTP '+response.status);return response.json();
        }
        const suffix=encodeURIComponent(t.chain)+'/'+encodeURIComponent(t.address);
        let matches=[];
        const equal=(a,b)=>t.chain==='solana'?a===b:String(a).toLowerCase()===String(b).toLowerCase();
        if(t.kind==='pair'||t.kind==='unknown') {
          const data=await request('latest/dex/pairs/'+suffix);
          matches=(data.pairs||[]).filter(p=>p.chainId===t.chain&&equal(p.pairAddress,t.address)&&Number(p.priceUsd)>0);
        }
        if(!matches.length&&t.kind!=='pair') {
          const data=await request('token-pairs/v1/'+suffix);
          matches=(Array.isArray(data)?data:[]).filter(p=>p.chainId===t.chain&&p.baseToken?.address&&equal(p.baseToken.address,t.address)&&Number(p.priceUsd)>0&&typeof p.pairAddress==='string');
          matches.sort((a,b)=>Number(b.liquidity?.usd||0)-Number(a.liquidity?.usd||0));
        }
        const pair=matches[0];if(!pair)throw new Error('No indexed market');
        if(closed||!(current&&tokenKey(current)===k)&&!watch.some(w=>tokenKey(w)===k))continue;
        cache.set(k,pair); const values = samples.get(k) || []; values.push(Number(pair.priceUsd)); samples.set(k,values.slice(-60));
        const alert = alerts.get(k);
        if (alert) { if (alert.baseline === null) alert.baseline = Number(pair.priceUsd); else { const change=(Number(pair.priceUsd)/alert.baseline-1)*100; if (Math.abs(change)>=alert.threshold) { $('#events').textContent = `${pair.baseToken.symbol}: ${change.toFixed(2)}% since alert armed`; alerts.delete(k); } } }
      } catch { failures++; } finally { clearTimeout(timeout); }
    }
    if (!closed) { draw(); message(failures ? `${failures} market(s) unavailable. Existing figures may be stale. Try Refresh; CSP, network limits or unlisted tokens can prevent updates.` : 'Updated ' + new Date().toLocaleTimeString() + ' · current pair / indexed market'); $('#refresh').disabled=false; }
    busy=false; if(pendingRefresh&&!closed){pendingRefresh=false;refresh();}
  }
  $('form').onsubmit = event => { event.preventDefault(); const t={chain:$('#chain').value,address:$('#address').value.trim()}; if (!validAddress(t.chain,t.address)) { message('Enter a valid token contract address for the selected chain.'); return; } const k=tokenKey(t); if (!watch.some(w=>tokenKey(w)===k)) { if(watch.length>=10){message('Watchlist limit: 10 tokens. Remove one first.');return;} watch.push(t); save(); } current=null;$('#follow').checked=false;selected=k; $('#address').value=''; draw(); if (!busy) refresh(); else message('Token added. It will load on the next refresh.'); };
  function followPage(force) {
    if(closed||!force&&!$('#follow').checked)return;
    const detected=axentDetectContext(document,location.href,platform,$('#chain').value);
    const signature=detected?detected.chain+':'+detected.address+':'+detected.kind:'none:'+location.pathname;
    if(!force&&signature===contextSignature)return;
    contextSignature=signature;current=detected;$('#events').textContent='';
    if(!detected){selected='';draw();$('#context').textContent='Open a token or pair page in '+platform.name+'.';message('No unambiguous current address found. Waiting for a token page; manual entry is available below.');return;}
    selected=tokenKey(current);$('#chain').value=current.chain;
    $('#context').textContent='Current '+(current.kind==='pair'?'pair':'token / pair')+' · '+current.address.slice(0,6)+'…'+current.address.slice(-5)+' · '+current.source;
    draw();refresh();
  }
  $('#fromPage').onclick=()=>followPage(true);
  $('#follow').onchange=()=>{if($('#follow').checked)followPage(true);};
  $('#chain').onchange=()=>followPage(true);
  $('#copy').onclick = async () => { const t=current&&tokenKey(current)===selected?current:watch.find(w=>tokenKey(w)===selected); if(!t){message('Track a token first.');return;} try{await navigator.clipboard.writeText(t.address);message('Contract address copied.');}catch{$('#address').value=t.address;$('#address').select();message('Select and copy the address manually.');} };
  $('#remove').onclick = () => { if(current&&tokenKey(current)===selected){current=null;$('#follow').checked=false;} watch=watch.filter(t=>tokenKey(t)!==selected); cache.delete(selected);samples.delete(selected);alerts.delete(selected); selected=watch[0]?tokenKey(watch[0]):'';save();draw();message('Token removed.'); };
  $('#arm').onclick = () => { if(alerts.has(selected)){alerts.delete(selected);message('Alert disarmed.');}else {const threshold=Number($('#threshold').value); if(!Number.isFinite(threshold)||threshold<.1||threshold>1000){message('Use a threshold between 0.1 and 1000%.');return;} alerts.set(selected,{threshold,baseline:null});$('#events').textContent='';message('Alert will use the next successful price sample as baseline.');}draw(); };
  $('#refresh').onclick=refresh;
  $('#min').onclick=() => { const hidden=$('main').classList.toggle('hidden');$('#min').textContent=hidden?'+':'−';$('#min').setAttribute('aria-label',hidden?'Expand overlay':'Collapse overlay'); };
  const timer=setInterval(()=>{if($('#auto').checked && !document.hidden)refresh();},15000);
  const contextTimer=setInterval(()=>followPage(false),1000);
  function close(){if(closed)return;closed=true;clearInterval(timer);clearInterval(contextTimer);controller?.abort();document.removeEventListener('keydown',escape);host.remove();priorFocus?.focus?.();}
  function escape(event){if(event.key==='Escape'){event.stopPropagation();close();}}
  document.addEventListener('keydown',escape);host.addEventListener('axent-close',close);$('#close').onclick=close;
  $('header').onpointerdown=e=>{if(e.target.closest('button'))return;const rect=host.getBoundingClientRect(),x=e.clientX,y=e.clientY;const header=$('header');header.setPointerCapture(e.pointerId);header.onpointermove=ev=>{host.style.setProperty('left',Math.max(0,Math.min(innerWidth-rect.width,rect.left+ev.clientX-x))+'px','important');host.style.setProperty('top',Math.max(0,Math.min(innerHeight-60,rect.top+ev.clientY-y))+'px','important');host.style.setProperty('right','auto','important');};header.onpointerup=header.onpointercancel=()=>{header.onpointermove=null;};};
  selected='';list();followPage(true);
}
