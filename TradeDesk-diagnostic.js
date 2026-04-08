// ════════════════════════════════════════════════════════════════
// TradeDesk Diagnostic v3.1 — paste into browser console
// Tests all features added in recent sessions
// Note: const/let globals aren't on window — we eval them directly
// ════════════════════════════════════════════════════════════════
(async function(){
  const R=[];
  let pass=0,warn=0,fail=0;
  const ok=(msg)=>{R.push('  ✓ '+msg);pass++;};
  const wn=(msg)=>{R.push('  ⚠ '+msg);warn++;};
  const er=(msg)=>{R.push('  ✗ '+msg);fail++;};
  const hd=(msg)=>{R.push('\n── '+msg+' ──────────────────────');};
  // eval handles const/let that aren't on window
  function g(n){try{return eval(n);}catch(e){return undefined;}}
  function has(n){try{const v=eval(n);return v!==undefined&&v!==null;}catch(e){return false;}}

  hd('Core globals');
  ['clients','bids','jobs','estSurfaces','roomScopeMap','_swColors',
   'SW_PRODUCTS','SW_FAMILIES','SCOPE_ITEMS','SURF_TYPES']
    .forEach(k=>has(k)?ok(k):er(k+' MISSING'));

  hd('SW Color catalog');
  try{
    const colors=await swLoadColors();
    colors?.length>=1500?ok(colors.length+' colors loaded'):er('Only '+(colors?.length||0)+' colors');
    const fams={};colors.forEach(c=>{fams[c.family]=(fams[c.family]||0)+1;});
    (fams.black||0)>=10?ok('Black family: '+fams.black):er('Black family: '+(fams.black||0)+' (expected ≥10)');
    ['white','gray','beige','brown','blue','green','teal','orange','red','pink','purple','yellow','black']
      .filter(f=>!fams[f]).length===0?ok('All 13 families present'):er('Missing: '+['white','gray','beige','brown','blue','green','teal','orange','red','pink','purple','yellow','black'].filter(f=>!fams[f]).join(', '));
    colors.find(c=>c.name==='Repose Gray')?ok('Repose Gray found'):er('Repose Gray missing');
    const tc=colors.find(c=>c.name==='Tricorn Black');
    tc?.family==='black'?ok('Tricorn Black=black'):er('Tricorn Black family='+(tc?.family||'missing'));
  }catch(e){er('swLoadColors: '+e.message);}

  hd('SW Products');
  const SP=g('SW_PRODUCTS')||{};
  const allP=Object.values(SP).flat();
  allP.length>=20?ok(allP.length+' products'):er('Only '+allP.length);
  ['interior','ceiling','exterior','trim'].forEach(c=>SP[c]?.length>=2?ok(c+': '+SP[c].length):er(c+' missing'));
  const pm=allP.find(p=>p.id==='pm200');
  pm?.cov>=300?ok('ProMar 200 cov:'+pm.cov):er('ProMar 200 missing cov');
  pm?.contractor>=25?ok('ProMar 200 $'+pm.contractor+' contractor'):er('ProMar 200 missing contractor price');
  allP.find(p=>p.id==='emure')?ok('Emerald Urethane present'):er('Emerald Urethane MISSING');

  hd('SW Product info');
  const SPI=g('SW_PRODUCT_INFO');
  typeof SPI==='object'?ok(Object.keys(SPI).length+' info entries'):er('SW_PRODUCT_INFO MISSING');
  if(SPI){const pm2=SPI.pm200;pm2?.when&&pm2?.good&&pm2?.notFor?ok('ProMar 200 info complete'):er('ProMar 200 info incomplete');}

  hd('Scope items');
  const SI=g('SCOPE_ITEMS')||[];
  SI.length>=10?ok(SI.length+' items'):er('Only '+SI.length);
  SI.find(s=>s.id==='sand')?.ratePerSqFt>=0?ok('Sand has ratePerSqFt'):er('Sand missing ratePerSqFt');
  SI.find(s=>s.id==='popcorn')?ok('Popcorn item'):er('Popcorn MISSING');
  SI.find(s=>s.id==='wallpaper')?ok('Wallpaper item'):er('Wallpaper MISSING');
  SI.every(s=>s.hint)?ok('All have hints'):er('Some missing hints');
  SI.every(s=>s.icon)?ok('All have icons'):er('Some missing icons');
  SI.every(s=>s.clientDesc)?ok('All have clientDesc'):er('Some missing clientDesc');

  hd('Estimate DOM — step A/B/product');
  ['surf-room-name','surf-room-sqft','surf-step-a','surf-step-b','surf-scope-first',
   'surf-measure-color-wrap','surf-scope-first-grid','sw-state-family','sw-state-swatches',
   'sw-family-grid','sw-swatch-grid','sw-search-input','sw-selected-pill','sw-selected-hex',
   'sw-selected-finish','sw-accent-wrap','sw-accent-search','sw-accent-note',
   'sw-accent-dropdown','sw-product-grid','sw-selected-product','sw-product-grid-hdr']
    .forEach(id=>document.getElementById(id)?ok('#'+id):er('#'+id+' MISSING'));

  hd('Functions');
  ['swLoadColors','swInitFamilyGrid','swShowFamily','swBackToFamilies','swSearch',
   'swSelectColor','swOpenFullscreenColor','swSelectFinish','swRenderProductGrid',
   'swSelectProduct','swShowProductInfo','swResetProduct','swGetProductName',
   'swAccentSearch','swAccentSelect','swClearAccent','swHideAccentDropdown',
   'goSurfStepB','goSurfScopeToMeasure','renderSurfBCurrent','saveSurfBAndNext',
   'finishRoom','showRoomSavedState','editRoomSurfs','addAnotherRoom',
   'buildScopeGrid','toggleScopeRoom','calcEst','renderEstReview','renderEstRunning',
   'buildProposal','saveAndExitEstimate','showJobDebrief','saveDebriefAndComplete',
   'showSupplyList','supplyCheckAll','supplyUncheckAll','swRefreshPrices','confirmMarkComplete']
    .forEach(fn=>typeof window[fn]==='function'?ok('fn:'+fn):er('fn:'+fn+' MISSING'));

  hd('calcEst — paint lines + coats');
  try{
    const _s=g('estSurfaces');const _r=JSON.parse(JSON.stringify(g('roomScopeMap')||{}));
    estSurfaces=[
      {id:1,type:'walls',qty:280,room:'TR — ProMar 200 · Accessible Beige (SW 7036) [Eggshell]'},
      {id:2,type:'ceiling',qty:200,room:'TR — Eminence Ceiling · Pure White (SW 7005) [Flat]'},
    ];
    roomScopeMap={};
    const r=calcEst();
    r.paintLines?.length>=1?ok('paintLines: '+r.paintLines.length):er('paintLines empty');
    r.paintLines?.every(pl=>pl.wholeCans>=1)?ok('wholeCans present'):er('wholeCans missing');
    r.paintLines?.every(pl=>pl.cov>=300)?ok('cov rates present'):er('cov missing');
    r.coats>=1?ok('coats='+r.coats):er('coats not returned');
    r.paintLines?.find(pl=>pl.spec?.includes('ProMar 200'))?.cov===350?ok('ProMar 200 uses 350 sf/gal'):wn('ProMar 200 cov unexpected');
    estSurfaces=_s;roomScopeMap=_r;
  }catch(e){er('calcEst: '+e.message);}

  hd('Scope auto-pricing');
  try{
    const _s=g('estSurfaces');const _r=JSON.parse(JSON.stringify(g('roomScopeMap')||{}));
    estSurfaces=[{id:1,type:'walls',qty:300,room:'T — ProMar 200 · Agreeable Gray (SW 7029) [Eggshell]'}];
    roomScopeMap={'T':{sand:{active:true},spackle:{active:true}}};
    const r=calcEst();
    r.lines?.find(l=>l.label==='Sanding')?.sub>0?ok('Sanding auto-priced $'+r.lines.find(l=>l.label==='Sanding').sub):er('Sanding not priced');
    r.lines?.find(l=>l.label==='Spackle & patch')?.sub>0?ok('Spackle auto-priced $'+r.lines.find(l=>l.label==='Spackle & patch').sub):er('Spackle not priced');
    estSurfaces=_s;roomScopeMap=_r;
  }catch(e){er('Scope pricing: '+e.message);}

  hd('Settings — price refresh');
  ['sw-price-table','sw-price-refresh-btn','sw-price-refresh-status','sw-price-updated',
   'spp-pm200','spp-sp','spp-dur','spp-em','spp-dure','spp-emure']
    .forEach(id=>document.getElementById(id)?ok('#'+id):er('#'+id+' MISSING'));

  hd('Save & exit');
  [...document.querySelectorAll('#est-s5 button')].some(b=>b.textContent.includes('Save bid'))?ok('"Save bid & exit" in step 5'):er('"Save bid & exit" MISSING');
  [...document.querySelectorAll('#est-s6 button')].some(b=>b.textContent.includes('Not signing'))?ok('"Not signing now" in step 6'):er('"Not signing now" MISSING');

  hd('Supply list');
  try{
    const _b=g('bids');
    const mb={id:99998,client_id:null,
      surfaces:[
        {id:1,type:'walls',qty:280,room:'LR — ProMar 200 · Accessible Beige (SW 7036) [Eggshell]'},
        {id:2,type:'ceiling',qty:200,room:'LR — Eminence Ceiling · Pure White (SW 7005) [Flat]'},
        {id:3,type:'trim',qty:80,room:'LR — ProClassic WB · Extra White (SW 6001) [Semi-Gloss]'},
      ],
      roomScopeMap:{'LR':{sand:{active:true},spackle:{active:true},caulk:{active:true},pwash:{active:true}}},
    };
    bids.push(mb);
    showSupplyList(99998);
    const modal=document.querySelector('.zmodal-overlay');
    if(modal){
      const checks=modal.querySelectorAll('.supply-check');
      checks.length>=10?ok(checks.length+' checkable items'):wn('Only '+checks.length+' items');
      ['Paint','Prep','Tools','Rental'].forEach(s=>modal.innerHTML.includes(s)?ok(s+' section'):wn(s+' section missing'));
      modal.innerHTML.includes('gal')?ok('Gallon quantities shown'):er('No gallons');
      supplyCheckAll();
      [...modal.querySelectorAll('.supply-check')].every(c=>c.checked)?ok('Check all works'):er('Check all failed');
      supplyUncheckAll();
      [...modal.querySelectorAll('.supply-check')].every(c=>!c.checked)?ok('Uncheck all works'):er('Uncheck all failed');
      modal.remove();
    }else{er('Supply list modal did not render');}
    bids=bids.filter(b=>b.id!==99998);
  }catch(e){er('showSupplyList: '+e.message);bids=bids.filter(b=>b.id!==99998);}

  hd('Proposal — paint order');
  try{
    const _s=g('estSurfaces');
    estSurfaces=[{id:1,type:'walls',qty:280,room:'LR — ProMar 200 · Accessible Beige (SW 7036) [Eggshell]'}];
    const cp=document.getElementById('e-customer-paint');if(cp)cp.value='';
    buildProposal();
    const prop=document.getElementById('est-proposal');
    prop?.innerHTML?.includes('Paint Order Summary')?ok('Paint Order Summary present'):er('Paint Order Summary MISSING');
    prop?.innerHTML?.includes('gal')?ok('Gallon quantities in proposal'):er('No gallons in proposal');
    prop?.innerHTML?.includes('sq ft/gal')?ok('Coverage rate shown'):er('Coverage rate missing');
    estSurfaces=_s;
  }catch(e){er('buildProposal: '+e.message);}

  hd('Scope-first flow');
  document.getElementById('surf-scope-first')?ok('surf-scope-first exists'):er('MISSING');
  document.getElementById('surf-scope-first')?.style.display==='none'?ok('hidden by default'):wn('display unexpected');
  typeof goSurfScopeToMeasure==='function'?ok('goSurfScopeToMeasure exists'):er('MISSING');

  R.push('\n════════════════════════════════════════');
  R.push('  '+pass+' passed  '+(warn?warn+' warnings  ':'')+fail+' failed');
  if(!fail&&!warn)R.push('  🟢 All clear');
  else if(!fail)R.push('  🟡 Passing with warnings');
  else R.push('  🔴 '+fail+' failure'+(fail!==1?'s':'')+' to fix');
  R.push('════════════════════════════════════════');
  console.log('%cTradeDesk Diagnostic v3.1','font-size:16px;font-weight:bold;color:#185FA5');
  console.log(R.join('\n'));
  return{pass,warn,fail};
})();
