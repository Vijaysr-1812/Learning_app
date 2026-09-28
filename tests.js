'use strict';
document.getElementById('preview-size').addEventListener('change',event=>document.getElementById('test-app').style.width=event.target.value);
document.getElementById('run-tests').addEventListener('click',async()=>{
 const button=document.getElementById('run-tests'),frame=document.getElementById('test-app'),results=document.getElementById('test-results'),summary=document.getElementById('test-summary');
 button.disabled=true;results.innerHTML='';let passed=0,failed=0;
 const test=(name,fn)=>{try{fn();passed++;const li=document.createElement('li');li.textContent='PASS · '+name;li.style.color='#326551';results.append(li);}catch(e){failed++;const li=document.createElement('li');li.textContent='FAIL · '+name+' — '+e.message;li.style.color='#a43e35';results.append(li);}};
 const assert=(condition,message)=>{if(!condition)throw new Error(message||'Assertion failed');};
 const tick=()=>new Promise(resolve=>setTimeout(resolve,30));
 const reload=()=>new Promise(resolve=>{frame.onload=()=>resolve();frame.src='index.html?test=1&run='+Date.now();});
 const w=()=>frame.contentWindow,d=()=>frame.contentDocument,api=()=>w().Commonplace;
 const go=async(hash)=>{w().location.hash=hash;await tick();};
 const click=selector=>{const el=d().querySelector(selector);assert(el,'Missing '+selector);el.click();};
 const change=(selector,value)=>{const el=d().querySelector(selector);assert(el,'Missing '+selector);el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));};
 const input=(selector,value)=>{const el=d().querySelector(selector);assert(el,'Missing '+selector);el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));};
 const throws=fn=>{let threw=false;try{fn();}catch{threw=true;}assert(threw,'Expected validation to reject input');};
 try{
 localStorage.removeItem('commonplace.learning.v1.test');await reload();
 test('Application starts without dependencies',()=>assert(api()&&w().TRACKS.length===4));
 test('Curriculum identifiers are unique and complete',()=>{
  const ts=api().topics;assert(new Set(ts.map(t=>t.id)).size===ts.length);assert(ts.length>=100);assert(api().problems.length>=80);
  ts.forEach(t=>{assert(t.parts.length>=3&&t.parts.every(p=>p.title&&p.detail),t.id+' has missing checkpoints');assert(t.summary&&t.example.code&&t.example.explanation&&t.question&&t.answer,t.id+' has missing content');assert(t.sources.every(s=>w().BOOKS[s]),t.id+' has missing sources');if(t.track==='dsa')assert(t.practice.length>=2,t.id+' has no practice set');});
 });
 test('All external resources use HTTPS and LeetCode paths are valid',()=>{Object.values(w().BOOKS).forEach(b=>assert(new URL(b.url).protocol==='https:'));api().problems.forEach(p=>assert(/^https:\/\/leetcode\.com\/problems\/[a-z0-9-]+\/$/.test(p.url)));});
 const errors=[];w().addEventListener('error',e=>errors.push(e.message));
 for(const t of api().topics){await go('#topic/'+t.id);assert(d().querySelector('h1')?.textContent===t.title,'Topic did not render: '+t.id);}
 test('Every topic renders its explanation, checkpoints, and review questions',()=>{assert(errors.length===0,errors.join('; '));assert(d().querySelectorAll('.question-card').length===2);});
 for(const t of w().TRACKS){await go('#track/'+t.id);assert(d().querySelectorAll('.module').length===t.modules.length,'Module count mismatch');}
 test('All four learning paths render all modules',()=>assert(errors.length===0));
 await go('#topic/dsa-pointers-1');
 click('[data-check="dsa-pointers-1-p0"]');
 test('Checkpoint updates the correct topic, including hyphenated IDs',()=>assert(api().getState().checks['dsa-pointers-1-p0']===true&&api().getState().topics['dsa-pointers-1'].status==='learning'));
 click('[data-check="dsa-pointers-1-p1"]');click('[data-check="dsa-pointers-1-p2"]');
 test('All checkpoints complete the topic',()=>assert(api().getState().topics['dsa-pointers-1'].status==='completed'));
 click('[data-check="dsa-pointers-1-p1"]');
 test('Unchecking a concept reopens the topic',()=>assert(api().getState().topics['dsa-pointers-1'].status==='learning'));
 change('[data-exercise="lc-125"]','issue');click('[data-action="attempt"][data-id="lc-125"][data-delta="1"]');
 test('Problem status and attempts are independent and persistent',()=>assert(api().getState().exercises['lc-125'].status==='issue'&&api().getState().exercises['lc-125'].attempts===1));
 change('[data-attempts="lc-125"]','-9');test('Attempt count cannot become negative',()=>assert(api().getState().exercises['lc-125'].attempts===0));
 change('[data-attempts="lc-125"]','2.9');test('Attempt count is a whole number',()=>assert(api().getState().exercises['lc-125'].attempts===2));
 click('[data-action="scope-notes"][data-scope="dsa-pointers-1-p0"]');input('#note-title','A checkpoint takeaway');input('#note-body','- Keep the sorted invariant\n**Compare both ends**\n<img src=x onerror="window.BAD=true">');click('[data-action="note-color"][data-color="lavender"]');click('[data-action="close-modal"]');
 test('Checkpoint notes save with the correct scope and color',()=>{const n=api().getState().notes[0];assert(n.scope==='dsa-pointers-1-p0'&&n.color==='lavender'&&n.body.includes('sorted'));});
 await go('#notes');
 test('Note formatting is safe and user HTML stays inert',()=>assert(d().querySelectorAll('.note-card img').length===0&&d().querySelector('.note-content strong').textContent==='Compare both ends'&&!w().BAD));
 input('#notes-search','sorted');test('Notes search matches body content',()=>assert(d().querySelectorAll('.note-card').length===1));
 input('#notes-search','absent-note-xyz');test('Notes search handles no matches',()=>assert(d().querySelectorAll('.note-card').length===0));
 await go('#review');test('Problem difficulties appear in the revisit queue',()=>assert(d().querySelector('[data-exercise="lc-125"]')));
 change('[data-exercise="lc-125"]','completed');test('Resolving a difficult problem removes it from revisit queue',()=>assert(!d().querySelector('[data-exercise="lc-125"]')));
 await go('#track/sql');input('#track-search','BULK');test('Curriculum search finds topic subdivisions',()=>assert(d().querySelectorAll('.topic-row').length>0));
 await go('#practice');input('#practice-search','Palindrome');test('Practice search filters problem titles',()=>assert(d().querySelectorAll('tbody tr').length>=1));change('#practice-filter','completed');test('Practice status filters work together with search',()=>assert(d().querySelectorAll('tbody tr').length===1));
 await go('#overview');click('[data-action="search"]');input('#global-search','checkpoint takeaway');test('Global search includes personal notes',()=>assert(d().querySelector('.search-result')?.textContent.includes('checkpoint takeaway')));click('[data-action="close-modal"]');
 const snapshot=api().getState();
 test('Backup round trip preserves notes, checks, statuses, and attempts',()=>{const round=api().validateState(JSON.parse(JSON.stringify(snapshot)));['notes','checks','topics','exercises','goal','activity'].forEach(k=>assert(JSON.stringify(round[k])===JSON.stringify(snapshot[k]),k));});
 test('Malformed backups and unknown versions are rejected',()=>{throws(()=>api().validateState({version:2}));throws(()=>api().validateState({version:1}));});
 test('Invalid attempts and unknown topic IDs are rejected',()=>{const bad=JSON.parse(JSON.stringify(snapshot));bad.exercises['lc-125'].attempts=-1;throws(()=>api().validateState(bad));bad.exercises['lc-125'].attempts=1;bad.topics['unknown']={status:'completed',updated:new Date().toISOString()};throws(()=>api().validateState(bad));});
 test('Unsafe note shapes and prototype keys are rejected',()=>{const bad=JSON.parse(JSON.stringify(snapshot));bad.notes[0].color='" onclick="x';throws(()=>api().validateState(bad));const bad2=JSON.parse(JSON.stringify(snapshot));bad2.topics['dsa-pointers-1'].status='__proto__';throws(()=>api().validateState(bad2));});
 await reload();test('Progress and notes survive a full reload',()=>{assert(api().getState().notes[0].title==='A checkpoint takeaway');assert(api().getState().exercises['lc-125'].attempts===2);assert(api().getState().topics['dsa-pointers-1'].status==='learning');});
 await go('#progress');test('Progress view shows real activity and aggregates',()=>assert(d().querySelectorAll('.heat-cell:not(.level0)').length>0&&d().querySelectorAll('.progress-track-row').length===4));
 await go('#library');test('Every book and documentation source appears in the library',()=>assert(d().querySelectorAll('.source-card').length===Object.keys(w().BOOKS).length));
 const importFile=async obj=>{const win=w(),transfer=new win.DataTransfer();transfer.items.add(new win.File([JSON.stringify(obj)],'test-backup.json',{type:'application/json'}));d().querySelector('#import-file').files=transfer.files;d().querySelector('#import-file').dispatchEvent(new Event('change',{bubbles:true}));await tick();};
 const restored=api().blankState();restored.goal=7;await importFile(restored);
 test('Import shows a review dialog before replacing data',()=>assert(d().querySelector('#modal').open&&d().querySelector('[data-action="confirm-import"]')));
 click('[data-action="close-modal"]');test('Canceling restore leaves the workspace unchanged',()=>assert(api().getState().notes.length===1));
 await importFile(restored);click('[data-action="confirm-import"]');test('Confirmed restore replaces data and saves the chosen version',()=>assert(api().getState().goal===7&&api().getState().notes.length===0&&JSON.parse(localStorage.getItem('commonplace.learning.v1.test')).goal===7));
 await importFile({version:99});test('Invalid import leaves existing progress untouched',()=>assert(api().getState().goal===7&&!d().querySelector('#modal').open));
 await go('#track/dsa');d().querySelectorAll('.module')[4].open=true;click('[data-topic-toggle="dsa-lists-1"]');test('Progress updates preserve expanded roadmap modules',()=>assert(d().querySelectorAll('.module')[4].open));
 for(const width of [320,390,768]){
  frame.style.width=width+'px';await tick();
  for(const hash of ['#overview','#track/ai','#topic/dsa-pointers-1','#practice','#notes','#review','#library','#progress']){
   await go(hash);test('Responsive '+width+'px '+hash+' has no page overflow',()=>assert(d().documentElement.scrollWidth<=d().documentElement.clientWidth+1,'page overflow '+d().documentElement.scrollWidth+' > '+d().documentElement.clientWidth));
  }
 }
 frame.style.width='100%';await go('#overview');
 click('[data-action="new-note"][data-scope="workspace"]');input('#note-title','Concurrent edit test');
 const otherTab=JSON.parse(localStorage.getItem('commonplace.learning.v1.test'));otherTab.goal=9;localStorage.setItem('commonplace.learning.v1.test',JSON.stringify(otherTab));await tick();input('#note-body','Keep this draft without replacing the other version.');
 test('Concurrent editing pauses saves instead of overwriting another tab',()=>assert(JSON.parse(localStorage.getItem('commonplace.learning.v1.test')).goal===9&&!d().querySelector('#storage-warning').hidden));
 click('[data-action="close-modal"]');await reload();await go('#overview');
 test('Reload can adopt the other tab’s saved version after a conflict',()=>assert(api().getState().goal===9));
 test('There are no uncaught errors during the interaction checks',()=>assert(errors.length===0,errors.join('; ')));
 }catch(e){failed++;const li=document.createElement('li');li.textContent='FAIL · Test sequence stopped: '+e.message;li.style.color='#a43e35';results.append(li);}
 finally{summary.textContent=`${passed} passed · ${failed} failed`;summary.dataset.result=failed?'fail':'pass';button.disabled=false;}
});
