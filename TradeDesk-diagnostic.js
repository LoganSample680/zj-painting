// ============================================================
// TradeDesk Full Diagnostic — paste into browser console
// Tests every major function, data flow, DOM, and Supabase
// ============================================================
(async function TD_FULL_TEST(){
  const R=[];
  const pass=(g,l,d='')=>R.push({g,s:'✅',l,d});
  const fail=(g,l,d='')=>R.push({g,s:'❌',l,d});
  const warn=(g,l,d='')=>R.push({g,s:'⚠️',l,d});
  const grp=(n)=>console.log('%c── '+n+' ──','color:#185FA5;font-weight:800;font-size:12px');

  // ── 1. CORE DATA ARRAYS ─────────────────────────────────────
  grp('1. Core Data');
  const arrays={clients,bids,jobs,expenses,payments,mileage,income,liens};
  Object.entries(arrays).forEach(([k,v])=>{
    if(Array.isArray(v))pass('data',k,v.length+' records');
    else fail('data',k,'NOT AN ARRAY');
  });
  if(typeof S==='object'&&S!==null)pass('data','S settings','keys: '+Object.keys(S).length);
  else fail('data','S settings','MISSING');

  // ── 2. CRITICAL FUNCTIONS EXIST ─────────────────────────────
  grp('2. Function Existence');
  const mustExist=[
    // Core
    'saveAll','loadAll','goPg','closeTopModal','showToast','zAlert','zConfirm',
    // Estimates
    'calcEst','renderEstRunning','renderEstReview','renderEstSurfs','buildProposal',
    'buildDescription','confirmContract','goEstStep','validateAndGoStep5',
    'prefillEstimateRates','newEstimate','clearEstimatorForm','downloadProposalPDF',
    'saveEstFullDraft','loadEstFullDraft','restoreEstFullDraft','clearEstFullDraft',
    // Clients
    'openClientDetail','openNewClient','saveClient','deleteClient','checkClientDupe',
    'renderClientList','renderClientDetail','renderCDBids','renderCDTimeline',
    // Jobs/Calendar
    'markJobDone','confirmJobDone','scheduleJob','renderCalendar','getJobsOnDay',
    'renderCalGrid','renderCalWeek','renderCalUpcoming',
    // Payments/Collections
    'openPayPanel','closePayPanel','selectPayType','logPayment','deletePay',
    'getBidBalance','getBidPaid','openLienPanel','closeLienPanel','saveLien',
    // Dashboard
    'renderDash','renderLeadSources','renderPipeline','renderDashCollect',
    'renderDashActiveLiens','fmtShort',
    // Books/Expenses
    'expProcessPhoto','expSave','closeExpenseFlow','openExpenseFlow',
    'renderExpenses','addExpense','delExpense','exportReceiptImages',
    'exportExpensesCSV','exportMileageCSV','exportTaxPDF','exportFullBackup',
    // Mileage/Drive
    'startDrive','endDrive','saveDriveTrip','renderAllMileage','addMileage',
    // Settings
    'saveSettings','loadSettingsForm','applySettings','getOwnerName','setOwnerName',
    // Supabase
    'supaEnabled','supaInit','supaSaveToCloud','supaLoadFromCloud','supaSignIn',
    'supaSignUp','supaSignOut','supaSetStatus',
    // Utilities
    'fmt','fmtTime','fmtPhone','calcBrackets','getClientById','getClientBids',
    'addDays','todayKey',
  ];
  mustExist.forEach(fn=>{
    const exists=typeof window[fn]==='function'||
      (function(){try{return eval('typeof '+fn)==='function'}catch(e){return false}})();
    if(exists)pass('functions',fn);
    else fail('functions',fn,'MISSING');
  });

  // ── 3. DOM ELEMENTS ─────────────────────────────────────────
  grp('3. DOM Elements');
  const mustExistDOM=[
    // Pages
    'pg-dash','pg-clients','pg-est','pg-leads','pg-cal','pg-taxes','pg-tracker',
    'pg-settings','pg-client-detail',
    // Estimate steps
    'est-s1','est-s2','est-s3','est-s4','est-s5','est-s6','est-s7',
    // Estimate fields
    'e-cname','e-cphone','e-caddr','e-paint','e-days','e-cond',
    'e-r-walls','e-r-ceil','e-r-trim','e-r-door','e-r-win',
    // Nav
    'nav-user-name','nav-user-avatar','nav-user-role','supa-status',
    // Dashboard
    'dash-kpi','dash-collect','dash-sources',
    // Settings
    'set-bname','set-bphone','set-owner-name','set-labor-rate',
    // Books
    'tr-t-income','tr-t-expenses','tr-t-mileage','tr-t-jobs','tr-t-summary',
    // Signature
    'sig-canvas','sig-typed','sig-pname','confirm-btn',
  ];
  mustExistDOM.forEach(id=>{
    if(document.getElementById(id))pass('dom','#'+id);
    else fail('dom','#'+id,'MISSING FROM DOM');
  });

  // ── 4. ESTIMATE FLOW (dry run) ───────────────────────────────
  grp('4. Estimate Flow');
  try{
    // Step 1 validation
    const s1=runStep1Validation?runStep1Validation():null;
    pass('estimate','runStep1Validation','callable');
  }catch(e){fail('estimate','runStep1Validation',e.message);}
  try{
    const {lines,bid,laborTotal,matTotal,final}=calcEst();
    if(typeof final==='number')pass('estimate','calcEst','returns final: $'+final.toFixed(2));
    else fail('estimate','calcEst','no final value returned');
  }catch(e){fail('estimate','calcEst',e.message);}
  try{
    renderEstRunning();
    pass('estimate','renderEstRunning','no error');
  }catch(e){fail('estimate','renderEstRunning',e.message);}
  try{
    renderEstReview();
    pass('estimate','renderEstReview','no error');
  }catch(e){fail('estimate','renderEstReview',e.message);}
  try{
    buildDescription();
    pass('estimate','buildDescription','no error');
  }catch(e){fail('estimate','buildDescription',e.message);}
  try{
    prefillEstimateRates();
    const walls=document.getElementById('e-r-walls')?.value;
    if(walls&&parseFloat(walls)>0)pass('estimate','prefillEstimateRates','walls: $'+walls+'/sqft');
    else warn('estimate','prefillEstimateRates','rates not filling — check settings');
  }catch(e){fail('estimate','prefillEstimateRates',e.message);}

  // ── 5. CLIENT FUNCTIONS ──────────────────────────────────────
  grp('5. Client Functions');
  try{
    const c=clients[0];
    if(c){
      const found=getClientById(c.id);
      if(found&&found.id===c.id)pass('clients','getClientById','found: '+found.name);
      else fail('clients','getClientById','returned wrong record');
      const bidsForC=getClientBids(c.id);
      pass('clients','getClientBids',bidsForC.length+' bids');
      const jobsForC=getClientJobs(c.id);
      pass('clients','getClientJobs',jobsForC.length+' jobs');
    }else warn('clients','getClientById','no clients to test with');
  }catch(e){fail('clients','client functions',e.message);}
  try{
    checkClientDupe('');
    pass('clients','checkClientDupe','no error on empty');
  }catch(e){fail('clients','checkClientDupe',e.message);}

  // ── 6. PAYMENT MATH ─────────────────────────────────────────
  grp('6. Payment Math');
  try{
    const wonBids=bids.filter(b=>b.status==='Closed Won');
    if(wonBids.length){
      const b=wonBids[0];
      const paid=getBidPaid(b.id);
      const bal=getBidBalance(b);
      if(typeof paid==='number'&&typeof bal==='number'){
        pass('payments','getBidPaid/Balance','paid: $'+paid.toFixed(2)+', balance: $'+bal.toFixed(2));
        if(Math.abs((paid+bal)-b.amount)>0.02)fail('payments','math check','paid+balance ≠ total: '+paid+'+'+bal+'≠'+b.amount);
        else pass('payments','math check','paid+balance = total ✓');
      }else fail('payments','getBidPaid/Balance','returned non-numbers');
    }else warn('payments','getBidPaid/Balance','no Closed Won bids to test');
  }catch(e){fail('payments','payment math',e.message);}

  // ── 7. DASHBOARD RENDER ──────────────────────────────────────
  grp('7. Dashboard');
  try{
    renderDash();
    pass('dashboard','renderDash','no error');
    const kpi=document.getElementById('dash-kpi');
    if(kpi&&kpi.innerHTML.length>50)pass('dashboard','KPI cards','rendered');
    else warn('dashboard','KPI cards','may be empty');
  }catch(e){fail('dashboard','renderDash',e.message);}
  try{
    renderLeadSources();
    pass('dashboard','renderLeadSources','no error');
  }catch(e){fail('dashboard','renderLeadSources',e.message);}

  // ── 8. NAVIGATION ───────────────────────────────────────────
  grp('8. Navigation');
  const pages=['pg-dash','pg-clients','pg-leads','pg-cal','pg-taxes','pg-tracker','pg-settings'];
  pages.forEach(pg=>{
    try{
      goPg(pg);
      const el=document.getElementById(pg);
      if(el&&el.classList.contains('active'))pass('nav','goPg('+pg+')','active');
      else warn('nav','goPg('+pg+')','page exists but may not be active');
    }catch(e){fail('nav','goPg('+pg+')',e.message);}
  });
  // Return to dash
  try{goPg('pg-dash');}catch(e){}

  // ── 9. SETTINGS ─────────────────────────────────────────────
  grp('9. Settings');
  try{
    loadSettingsForm();
    pass('settings','loadSettingsForm','no error');
    const ownerName=getOwnerName();
    if(ownerName&&ownerName!=='My Account')pass('settings','getOwnerName',ownerName);
    else warn('settings','getOwnerName','not set — go to Settings → Your name');
    if(S.bname)pass('settings','business name',S.bname);
    else warn('settings','business name','not set');
    if(S.rWalls&&parseFloat(S.rWalls)>0)pass('settings','rate card','walls: $'+S.rWalls);
    else warn('settings','rate card','no wall rate set');
  }catch(e){fail('settings','settings functions',e.message);}

  // ── 10. FORMAT FUNCTIONS ─────────────────────────────────────
  grp('10. Formatters');
  try{
    const f1=fmt(1234.56);
    if(f1==='$1,234.56')pass('format','fmt','$1,234.56 ✓');
    else fail('format','fmt','expected $1,234.56 got '+f1);
  }catch(e){fail('format','fmt',e.message);}
  try{
    const fs1=fmtShort(1234567);
    if(fs1.includes('M'))pass('format','fmtShort millions',fs1+' ✓');
    else fail('format','fmtShort millions','expected M suffix got '+fs1);
    const fs2=fmtShort(45200);
    if(fs2.includes('K'))pass('format','fmtShort thousands',fs2+' ✓');
    else fail('format','fmtShort thousands','expected K suffix got '+fs2);
  }catch(e){fail('format','fmtShort',e.message);}
  try{
    const t=todayKey();
    if(/\d{4}-\d{2}-\d{2}/.test(t))pass('format','todayKey',t);
    else fail('format','todayKey','wrong format: '+t);
  }catch(e){fail('format','todayKey',e.message);}
  try{
    const d=addDays('2025-01-01',5);
    if(d==='2025-01-06')pass('format','addDays','2025-01-01 +5 = '+d+' ✓');
    else fail('format','addDays','expected 2025-01-06 got '+d);
  }catch(e){fail('format','addDays',e.message);}

  // ── 11. LOCALSTORAGE ────────────────────────────────────────
  grp('11. localStorage');
  try{
    const keys={'zp3_clients':'clients','zp3_bids':'bids','zp3_jobs':'jobs',
      'zp3_pay':'payments','zp3_exp':'expenses','zp3_mil':'mileage','zp3_S':'settings'};
    let totalKB=0;
    Object.entries(keys).forEach(([k,label])=>{
      const v=localStorage.getItem(k);
      const kb=v?Math.round(v.length/1024):0;
      totalKB+=kb;
      if(v)pass('storage',label+' ('+k+')',kb+'KB');
      else warn('storage',label+' ('+k+')','empty — may not have saved yet');
    });
    pass('storage','total localStorage',totalKB+'KB');
    if(totalKB>4000)warn('storage','size warning',totalKB+'KB — approaching iOS limit');
    // Receipt image cache
    const rcptKeys=Object.keys(localStorage).filter(k=>k.startsWith('zp3_rcpt_'));
    if(rcptKeys.length)pass('storage','receipt cache',rcptKeys.length+' images cached locally');
    // Test write/read
    localStorage.setItem('zp3_test','ok');
    if(localStorage.getItem('zp3_test')==='ok')pass('storage','read/write test','✓');
    else fail('storage','read/write test','localStorage not working');
    localStorage.removeItem('zp3_test');
  }catch(e){fail('storage','localStorage',e.message);}

  // ── 12. SUPABASE ────────────────────────────────────────────
  grp('12. Supabase');
  try{
    if(supaEnabled()){
      pass('supabase','config','URL and key present');
      if(_supa){
        pass('supabase','client','initialized');
        const{data:{session},error:se}=await _supa.auth.getSession();
        if(se)fail('supabase','getSession',se.message);
        else if(session){
          pass('supabase','session','signed in as '+session.user.email);
          // Test DB read
          const{data,error}=await _supa.from('zj_data')
            .select('user_id,updated_at,receipt_images')
            .eq('user_id',session.user.id).maybeSingle();
          if(error)fail('supabase','DB read',error.message);
          else if(data){
            pass('supabase','DB read','row found, last sync: '+(data.updated_at?.slice(0,19)||'unknown'));
            // Check receipt_images column
            if('receipt_images' in data)pass('supabase','receipt_images column','exists ✓');
            else fail('supabase','receipt_images column','MISSING — run: ALTER TABLE zj_data ADD COLUMN receipt_images text default \'{}\'');
          }else warn('supabase','DB read','no row yet — will create on first save');
          // Test auth user metadata
          if(session.user.email)pass('supabase','user email',session.user.email);
        }else warn('supabase','session','not signed in — cloud sync inactive');
      }else fail('supabase','client','_supa is null — init failed');
    }else warn('supabase','config','SUPA_URL or SUPA_KEY not set — cloud sync disabled');
  }catch(e){fail('supabase','supabase',e.message);}

  // ── 13. EXPENSE/RECEIPT INTEGRITY ───────────────────────────
  grp('13. Expenses & Receipts');
  try{
    const withPhoto=expenses.filter(e=>e.receipt_img);
    const withFlag=expenses.filter(e=>e.receipt_img_local&&!e.receipt_img);
    const withReceipt=expenses.filter(e=>e.receipt==='Yes — photo stored');
    pass('expenses','total',expenses.length+' expenses');
    if(withPhoto.length)pass('expenses','with receipt photo',withPhoto.length+' expenses have images');
    if(withFlag.length)warn('expenses','stale receipt flags',withFlag.length+' have old receipt_img_local flag — re-save to fix');
    if(withReceipt.length!==withPhoto.length)warn('expenses','receipt field mismatch',
      withReceipt.length+' say "Yes" but '+withPhoto.length+' have actual images');
    // Check expense categories
    const missingCat=expenses.filter(e=>!e.cat);
    if(missingCat.length)warn('expenses','missing categories',missingCat.length+' expenses have no IRS category');
    // Check for missing dates
    const missingDate=expenses.filter(e=>!e.date);
    if(missingDate.length)fail('expenses','missing dates',missingDate.length+' expenses have no date');
    else pass('expenses','all dates present','✓');
  }catch(e){fail('expenses','expense integrity',e.message);}

  // ── 14. BID/JOB INTEGRITY ───────────────────────────────────
  grp('14. Bid & Job Integrity');
  try{
    const orphanBids=bids.filter(b=>!getClientById(b.client_id));
    if(orphanBids.length)warn('integrity','orphan bids',orphanBids.length+' bids with no matching client');
    else pass('integrity','bid-client links','all bids have valid clients ✓');
    const orphanJobs=jobs.filter(j=>j.client_id&&!getClientById(j.client_id));
    if(orphanJobs.length)warn('integrity','orphan jobs',orphanJobs.length+' jobs with no matching client');
    else pass('integrity','job-client links','all jobs have valid clients ✓');
    const draftBids=bids.filter(b=>b.draft);
    if(draftBids.length)warn('integrity','draft bids',draftBids.length+' draft bids lingering — may be from abandoned estimates');
    const negBals=bids.filter(b=>b.status==='Closed Won'&&getBidBalance(b)<-0.01);
    if(negBals.length)warn('integrity','overpaid bids',negBals.length+' bids show negative balance (overpaid)');
    else pass('integrity','bid balances','no negative balances ✓');
  }catch(e){fail('integrity','bid/job integrity',e.message);}

  // ── 15. EXPORT FUNCTIONS ────────────────────────────────────
  grp('15. Export Functions');
  ['exportExpensesCSV','exportMileageCSV','exportTaxPDF','exportFullBackup','exportReceiptImages']
    .forEach(fn=>{
      if(typeof window[fn]==='function'||
        (function(){try{return eval('typeof '+fn)==='function'}catch(e){return false}})()){
        pass('exports',fn,'defined ✓');
      }else fail('exports',fn,'MISSING');
    });

  // ── 16. SAVEALL ROUNDTRIP ────────────────────────────────────
  grp('16. Save/Load Roundtrip');
  try{
    const clientsBefore=clients.length;
    saveAll();
    loadAll();
    const clientsAfter=clients.length;
    if(clientsBefore===clientsAfter)pass('roundtrip','saveAll/loadAll',clientsBefore+' clients preserved ✓');
    else fail('roundtrip','saveAll/loadAll','lost '+(clientsBefore-clientsAfter)+' clients!');
  }catch(e){fail('roundtrip','saveAll/loadAll',e.message);}

  // ── FINAL REPORT ─────────────────────────────────────────────
  const groups={};
  R.forEach(r=>{if(!groups[r.g])groups[r.g]=[];groups[r.g].push(r);});
  const fails=R.filter(r=>r.s==='❌');
  const warns=R.filter(r=>r.s==='⚠️');
  const passes=R.filter(r=>r.s==='✅');

  console.log('\n%c════════════ RESULTS ════════════','font-weight:800;font-size:14px;color:#185FA5');
  console.log('%c✅ '+passes.length+' passed   ⚠️ '+warns.length+' warnings   ❌ '+fails.length+' failed',
    'font-size:13px;font-weight:700;color:'+(fails.length?'#A32D2D':warns.length?'#D97706':'#3B8C2A'));

  if(fails.length){
    console.log('%c\nFAILED — fix these:','color:#A32D2D;font-weight:800;font-size:12px');
    fails.forEach(r=>console.log('  ❌ ['+r.g+'] '+r.l+(r.d?' — '+r.d:'')));
  }
  if(warns.length){
    console.log('%c\nWARNINGS — review these:','color:#D97706;font-weight:800;font-size:12px');
    warns.forEach(r=>console.log('  ⚠️  ['+r.g+'] '+r.l+(r.d?' — '+r.d:'')));
  }
  if(!fails.length&&!warns.length){
    console.log('%c\n🎉 All clear — app is healthy!','color:#3B8C2A;font-weight:800;font-size:14px');
  }
  return{passed:passes.length,warnings:warns.length,failed:fails.length,details:R};
})();
