// ════════════════════════════════════════════════════════════════
// TradeDesk Diagnostic v3 — paste into browser console
// Tests all features added in recent sessions
// ════════════════════════════════════════════════════════════════
(async function(){
  const R=[];
  let pass=0,warn=0,fail=0;

  const ok =(msg)=>{R.push('  ✓ '+msg);pass++;};
  const wn =(msg)=>{R.push('  ⚠ '+msg);warn++;};
  const er =(msg)=>{R.push('  ✗ '+msg);fail++;};
  const hd =(msg)=>{R.push('\n── '+msg+' ──────────────────────');};

  // ── 1. Core globals ─────────────────────────────────────────
  hd('Core globals');
  ['clients','bids','jobs','estSurfaces','roomScopeMap','_swColors','SW_PRODUCTS','SW_FAMILIES','SCOPE_ITEMS','SURF_TYPES']
    .forEach(k=>window[k]!==undefined?ok(k+' declared'):er(k+' MISSING'));

  // ── 2. SW Color data ─────────────────────────────────────────
  hd('SW Color catalog');
  try {
    const colors = await swLoadColors();
    if(colors&&colors.length>=1500) ok('sw-colors.json loaded — '+colors.length+' colors');
    else er('sw-colors.json loaded but only '+((colors&&colors.length)||0)+' colors');

    const fams={};colors.forEach(c=>{fams[c.family]=(fams[c.family]||0)+1;});
    const blacks=fams.black||0;
    blacks>=10?ok('Black family: '+blacks+' colors'):er('Black family: '+blacks+' colors (expected ≥10)');

    const key=['white','gray','beige','brown','blue','green','teal','orange','red','pink','purple','yellow','black'];
    const missing=key.filter(f=>!fams[f]);
    missing.length===0?ok('All 13 color families present'):er('Missing families: '+missing.join(', '));

    const repose=colors.find(c=>c.name==='Repose Gray');
    repose?ok('Repose Gray found — '+repose.sw+' '+repose.family):er('Repose Gray not found');
    const tricorn=colors.find(c=>c.name==='Tricorn Black');
    tricorn&&tricorn.family==='black'?ok('Tricorn Black tagged as black'):er('Tricorn Black family = '+(tricorn?.family||'NOT FOUND'));
  } catch(e) { er('swLoadColors threw: '+e.message); }

  // ── 3. SW Products ───────────────────────────────────────────
  hd('SW Products catalog');
  const allProds=Object.values(SW_PRODUCTS).flat();
  allProds.length>=20?ok(allProds.length+' products across all categories'):er('Only '+allProds.length+' products');
  ['interior','ceiling','exterior','trim'].forEach(cat=>
    SW_PRODUCTS[cat]?.length>=2?ok('Category '+cat+': '+SW_PRODUCTS[cat].length+' products'):er('Category '+cat+' missing or empty'));
  const pm200=allProds.find(p=>p.id==='pm200');
  pm200?.cov>=300?ok('ProMar 200 has coverage rate: '+pm200.cov+' sf/gal'):er('ProMar 200 missing coverage rate');
  pm200?.contractor>=25?ok('ProMar 200 contractor price: $'+pm200.contractor):er('ProMar 200 missing contractor price');
  const emure=allProds.find(p=>p.id==='emure');
  emure?ok('Emerald Urethane present ($'+emure.contractor+' contractor)'):er('Emerald Urethane missing');

  // ── 4. SW Product Info ───────────────────────────────────────
  hd('SW Product info bubbles');
  typeof SW_PRODUCT_INFO==='object'?ok('SW_PRODUCT_INFO declared'):er('SW_PRODUCT_INFO MISSING');
  if(typeof SW_PRODUCT_INFO==='object'){
    const ids=Object.keys(SW_PRODUCT_INFO);
    ids.length>=15?ok(ids.length+' products have info entries'):wn('Only '+ids.length+' info entries');
    const pm=SW_PRODUCT_INFO.pm200;
    pm?.when&&pm?.good&&pm?.notFor&&pm?.jobs?ok('ProMar 200 info complete'):er('ProMar 200 info incomplete');
  }

  // ── 5. Scope items ───────────────────────────────────────────
  hd('Scope items');
  SCOPE_ITEMS.length>=10?ok(SCOPE_ITEMS.length+' scope items'):er('Only '+SCOPE_ITEMS.length+' scope items');
  const sand=SCOPE_ITEMS.find(s=>s.id==='sand');
  sand?.ratePerSqFt>=0?ok('Sand has ratePerSqFt: $'+sand.ratePerSqFt):er('Sand missing ratePerSqFt');
  const popcorn=SCOPE_ITEMS.find(s=>s.id==='popcorn');
  popcorn?ok('Popcorn removal scope item present'):er('Popcorn removal missing');
  const wallpaper=SCOPE_ITEMS.find(s=>s.id==='wallpaper');
  wallpaper?ok('Wallpaper removal scope item present'):er('Wallpaper removal missing');
  SCOPE_ITEMS.every(s=>s.hint)?ok('All scope items have hints'):er('Some scope items missing hints');
  SCOPE_ITEMS.every(s=>s.icon)?ok('All scope items have icons'):er('Some scope items missing icons');
  SCOPE_ITEMS.every(s=>s.clientDesc)?ok('All scope items have clientDesc'):er('Some scope items missing clientDesc');

  // ── 6. DOM elements — estimate flow ─────────────────────────
  hd('Estimate DOM — step A');
  ['surf-room-name','surf-room-sqft','surf-step-a','surf-step-b','surf-scope-first',
   'surf-measure-color-wrap','surf-scope-first-grid'].forEach(id=>
    document.getElementById(id)?ok('#'+id+' exists'):er('#'+id+' MISSING'));

  hd('Estimate DOM — step B color browser');
  ['sw-state-family','sw-state-swatches','sw-family-grid','sw-swatch-grid',
   'sw-search-input','sw-selected-pill','sw-selected-hex','sw-selected-finish',
   'sw-accent-wrap','sw-accent-search','sw-accent-note','sw-accent-dropdown'].forEach(id=>
    document.getElementById(id)?ok('#'+id+' exists'):er('#'+id+' MISSING'));

  hd('Estimate DOM — product selector');
  ['sw-product-grid','sw-selected-product','sw-product-grid-hdr'].forEach(id=>
    document.getElementById(id)?ok('#'+id+' exists'):er('#'+id+' MISSING'));

  // ── 7. Functions ─────────────────────────────────────────────
  hd('Key functions');
  ['swLoadColors','swInitFamilyGrid','swShowFamily','swBackToFamilies','swSearch',
   'swSelectColor','swOpenFullscreenColor','swSelectFinish','swRenderProductGrid',
   'swSelectProduct','swShowProductInfo','swResetProduct','swGetProductName',
   'swAccentSearch','swAccentSelect','swClearAccent',
   'goSurfStepB','goSurfScopeToMeasure','renderSurfBCurrent','saveSurfBAndNext',
   'finishRoom','showRoomSavedState','editRoomSurfs','addAnotherRoom',
   'buildScopeGrid','toggleScopeRoom',
   'calcEst','renderEstReview','renderEstRunning','buildProposal',
   'saveAndExitEstimate','showJobDebrief','saveDebriefAndComplete',
   'showSupplyList','supplyCheckAll','supplyUncheckAll',
   'swRefreshPrices','confirmMarkComplete'
  ].forEach(fn=>typeof window[fn]==='function'?ok('fn: '+fn):er('fn: '+fn+' MISSING'));

  // ── 8. calcEst — paint order calc ───────────────────────────
  hd('calcEst — paint order');
  try {
    // Inject test surfaces
    const _saved=[...estSurfaces];
    estSurfaces=[
      {id:1,type:'walls',qty:280,room:'Test Room — ProMar 200 · Accessible Beige (SW 7036) [Eggshell]'},
      {id:2,type:'ceiling',qty:200,room:'Test Room — Eminence Ceiling · Pure White (SW 7005) [Flat]'},
    ];
    const result=calcEst();
    result.paintLines?.length>=1?ok('calcEst returns paintLines: '+result.paintLines.length+' entries'):er('calcEst paintLines empty');
    result.paintLines?.every(pl=>pl.wholeCans>=1)?ok('All paintLines have wholeCans'):er('paintLines missing wholeCans');
    result.paintLines?.every(pl=>pl.cov>=300)?ok('All paintLines have coverage rate'):er('paintLines missing cov');
    result.coats>=1?ok('coats returned: '+result.coats):er('coats not returned from calcEst');
    // Check ProMar 200 uses 350 cov not 400
    const wallLine=result.paintLines?.find(pl=>pl.spec?.includes('ProMar 200'));
    wallLine?.cov===350?ok('ProMar 200 uses correct 350 sf/gal coverage'):wn('ProMar 200 coverage: '+(wallLine?.cov||'not found')+' (expected 350)');
    estSurfaces=_saved;
  } catch(e) { er('calcEst threw: '+e.message); }

  // ── 9. Scope auto-pricing ────────────────────────────────────
  hd('Scope auto-pricing (no hours)');
  try {
    const _savedSurfs=[...estSurfaces];
    const _savedScope=JSON.parse(JSON.stringify(roomScopeMap));
    estSurfaces=[{id:1,type:'walls',qty:300,room:'Test Room — ProMar 200 · Agreeable Gray (SW 7029) [Eggshell]'}];
    roomScopeMap={'Test Room':{sand:{active:true},spackle:{active:true}}};
    const r=calcEst();
    const sandLine=r.lines?.find(l=>l.label==='Sanding');
    const spackleLine=r.lines?.find(l=>l.label==='Spackle & patch');
    sandLine?.sub>0?ok('Sanding auto-priced: $'+sandLine.sub):er('Sanding not in lines or $0');
    spackleLine?.sub>0?ok('Spackle auto-priced: $'+spackleLine.sub):er('Spackle not in lines or $0');
    estSurfaces=_savedSurfs;
    roomScopeMap=_savedScope;
  } catch(e) { er('Scope pricing threw: '+e.message); }

  // ── 10. Settings page ────────────────────────────────────────
  hd('Settings — SW price refresh');
  ['sw-price-table','sw-price-refresh-btn','sw-price-refresh-status','sw-price-updated',
   'spp-pm200','spp-sp','spp-dur','spp-em','spp-dure','spp-emure'].forEach(id=>
    document.getElementById(id)?ok('#'+id+' exists'):er('#'+id+' MISSING'));
  typeof swRefreshPrices==='function'?ok('swRefreshPrices function exists'):er('swRefreshPrices MISSING');

  // ── 11. Save & exit ──────────────────────────────────────────
  hd('Save & exit bid flow');
  document.getElementById('est-s5')?ok('#est-s5 exists'):er('#est-s5 MISSING');
  const exitBtn=[...document.querySelectorAll('#est-s5 button')].find(b=>b.textContent.includes('Save bid'));
  exitBtn?ok('"Save bid & exit" button exists in step 5'):er('"Save bid & exit" button MISSING from step 5');
  const s6Exit=[...document.querySelectorAll('#est-s6 button')].find(b=>b.textContent.includes('Not signing'));
  s6Exit?ok('"Not signing now" button exists in step 6'):er('"Not signing now" button MISSING from step 6');
  typeof saveAndExitEstimate==='function'?ok('saveAndExitEstimate function exists'):er('saveAndExitEstimate MISSING');

  // ── 12. Post-job debrief ──────────────────────────────────────
  hd('Post-job debrief');
  typeof showJobDebrief==='function'?ok('showJobDebrief function exists'):er('showJobDebrief MISSING');
  typeof saveDebriefAndComplete==='function'?ok('saveDebriefAndComplete exists'):er('saveDebriefAndComplete MISSING');
  typeof confirmMarkComplete==='function'?ok('confirmMarkComplete alias exists'):er('confirmMarkComplete MISSING');

  // ── 13. Supply list ──────────────────────────────────────────
  hd('Supply list');
  typeof showSupplyList==='function'?ok('showSupplyList function exists'):er('showSupplyList MISSING');
  typeof supplyCheckAll==='function'?ok('supplyCheckAll exists'):er('supplyCheckAll MISSING');
  // Test supply list builds without error on a mock bid
  try {
    const mockBid={
      id:99999,client_id:null,
      surfaces:[
        {id:1,type:'walls',qty:280,room:'LR — ProMar 200 · Accessible Beige (SW 7036) [Eggshell]'},
        {id:2,type:'ceiling',qty:200,room:'LR — Eminence Ceiling · Pure White (SW 7005) [Flat]'},
        {id:3,type:'trim',qty:80,room:'LR — ProClassic WB · Extra White (SW 6001) [Semi-Gloss]'},
      ],
      roomScopeMap:{'LR':{sand:{active:true},spackle:{active:true},caulk:{active:true}}},
    };
    bids.push(mockBid);
    showSupplyList(99999);
    const modal=document.querySelector('.zmodal-overlay');
    if(modal){
      const checks=modal.querySelectorAll('.supply-check');
      checks.length>=10?ok('Supply list renders: '+checks.length+' checkable items'):wn('Supply list has only '+checks.length+' items');
      const paintSection=modal.innerHTML.includes('Paint');
      const prepSection=modal.innerHTML.includes('Prep');
      const toolsSection=modal.innerHTML.includes('Tools');
      paintSection&&prepSection&&toolsSection?ok('All 3 sections present (Paint, Prep, Tools)'):wn('Missing sections in supply list');
      const galText=modal.innerHTML.includes('gal');
      galText?ok('Gallon quantities shown in paint section'):er('No gallon quantities found');
      modal.remove();
    } else {
      er('Supply list modal did not render');
    }
    bids=bids.filter(b=>b.id!==99999);
  } catch(e){ er('showSupplyList threw: '+e.message); bids=bids.filter(b=>b.id!==99999); }

  // ── 14. Proposal paint order section ─────────────────────────
  hd('Proposal — paint order summary');
  try {
    const _saved=[...estSurfaces];
    estSurfaces=[{id:1,type:'walls',qty:280,room:'LR — ProMar 200 · Accessible Beige (SW 7036) [Eggshell]'}];
    // Ensure paint supply is on
    const ps=document.getElementById('e-customer-paint');if(ps)ps.value='';
    buildProposal();
    const prop=document.getElementById('est-proposal');
    const hasPaintOrder=prop?.innerHTML?.includes('Paint Order Summary');
    hasPaintOrder?ok('Proposal contains Paint Order Summary section'):er('Proposal MISSING Paint Order Summary');
    const hasGallons=prop?.innerHTML?.includes('gal');
    hasGallons?ok('Proposal shows gallon quantities'):er('Proposal missing gallon quantities');
    const hasCoverage=prop?.innerHTML?.includes('sq ft/gal');
    hasCoverage?ok('Proposal shows coverage rate'):er('Proposal missing coverage rate');
    estSurfaces=_saved;
  } catch(e){ er('buildProposal threw: '+e.message); }

  // ── 15. Accent wall search DOM ───────────────────────────────
  hd('Accent wall search');
  ['sw-accent-search','sw-accent-dropdown','sw-accent-note','sw-accent-selected',
   'sw-accent-preview','sw-accent-label'].forEach(id=>
    document.getElementById(id)?ok('#'+id+' exists'):er('#'+id+' MISSING'));
  ['swAccentSearch','swAccentSelect','swClearAccent','swHideAccentDropdown'].forEach(fn=>
    typeof window[fn]==='function'?ok('fn: '+fn):er('fn: '+fn+' MISSING'));

  // ── 16. Scope-first flow ─────────────────────────────────────
  hd('Scope-first flow');
  document.getElementById('surf-scope-first')?ok('#surf-scope-first exists'):er('#surf-scope-first MISSING');
  document.getElementById('surf-measure-color-wrap')?ok('#surf-measure-color-wrap exists'):er('#surf-measure-color-wrap MISSING');
  typeof goSurfScopeToMeasure==='function'?ok('goSurfScopeToMeasure exists'):er('goSurfScopeToMeasure MISSING');
  // Check scope-first is hidden by default (step A not in B yet)
  const sf=document.getElementById('surf-scope-first');
  sf&&sf.style.display==='none'?ok('surf-scope-first hidden by default'):wn('surf-scope-first display: '+(sf?.style.display||'unknown'));

  // ── Summary ──────────────────────────────────────────────────
  R.push('\n════════════════════════════════════════');
  R.push('  '+pass+' passed  '+warn+' warnings  '+fail+' failed');
  R.push('════════════════════════════════════════');

  console.log('%cTradeDesk Diagnostic v3','font-size:16px;font-weight:bold;color:#185FA5');
  console.log(R.join('\n'));
  if(fail>0) console.warn(fail+' failures — check items marked ✗ above');
  if(warn>0) console.info(warn+' warnings — check items marked ⚠ above');
  return {pass,warn,fail};
})();
