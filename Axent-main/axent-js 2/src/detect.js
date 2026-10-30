/* Read only public URL fields and explicit token/pair DOM attributes. */
function axentDetectContext(doc, href, platform, fallbackChain) {
  const url = new URL(href);
  const aliases = {sol:'solana',solana:'solana',eth:'ethereum',ethereum:'ethereum',base:'base',bsc:'bsc',bnb:'bsc','1':'ethereum','8453':'base','56':'bsc'};
  const normalize = value => aliases[String(value || '').toLowerCase()];
  const segments = url.pathname.split('/').filter(Boolean).map(s => {try{return decodeURIComponent(s);}catch{return s;}});
  const explicitChain = normalize(url.searchParams.get('chain') || url.searchParams.get('network') || url.searchParams.get('chainId')) || segments.map(normalize).find(Boolean);
  function candidate(address,kind,source,chainHint) {
    if (typeof address !== 'string') return null;
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return {chain:'solana',address,kind,source};
    if (/^0x[0-9a-fA-F]{40}$/.test(address)) {
      const chain = normalize(chainHint) || explicitChain || (fallbackChain !== 'solana' ? fallbackChain : null);
      return chain ? {chain,address,kind,source} : null;
    }
    return null;
  }
  for (const [key,kind] of [['token','token'],['mint','token'],['ca','token'],['tokenAddress','token'],['pair','pair'],['pairAddress','pair'],['pool','pair'],['address','unknown']]) {
    const found=candidate(url.searchParams.get(key),kind,'URL · '+key);if(found)return found;
  }
  // Current route wins over unrelated wallet or trending-token links on the page.
  for(let i=segments.length-1;i>=0;i--){
    const prefix=(segments[i-1]||'').toLowerCase();
    const kind=/^(pair|pairs|pool|pools|meme)$/.test(prefix)?'pair':/^(token|tokens|coin|coins)$/.test(prefix)?'token':'unknown';
    const found=candidate(segments[i],kind,'URL · '+platform.name);if(found)return found;
  }
  if (!doc.querySelectorAll) return null;
  // Only explicitly marked active-token areas; never scan arbitrary page text or app state.
  const contexts = doc.querySelectorAll('main [data-token-address], main [data-mint], main [data-pair-address], [data-current-token-address]');
  const found=[];
  for (const el of Array.from(contexts).slice(0,30)) {
    if(el.getClientRects && !el.getClientRects().length)continue;
    const address=el.getAttribute('data-current-token-address')||el.getAttribute('data-token-address')||el.getAttribute('data-mint')||el.getAttribute('data-pair-address');
    const item=candidate(address,el.hasAttribute('data-pair-address')?'pair':'token','Page · token attributes',el.getAttribute('data-chain'));
    if(item&&!found.some(f=>f.chain===item.chain&&f.address===item.address&&f.kind===item.kind))found.push(item);
  }
  return found.length===1?found[0]:null;
}
