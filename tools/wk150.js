/* 用法：在裝了 playwright 的資料夾執行（npm i playwright; npx playwright install webkit），本機先開 static 伺服器（port 8765）：
   node tools/wk150.js <輸出資料夾> [舊版 index.html（測舊版時才給）] */
/* 第 150 節：WebKit（Safari 的引擎）裡噴泉廣場的地面圖有沒有換上去 */
const {webkit,devices}=require('playwright');
(async()=>{
  const out=process.argv[2]||'.';
  const b=await webkit.launch();
  const ctx=await b.newContext({...devices['iPhone 13'],viewport:{width:375,height:667}});
  const pg=await ctx.newPage();const fs=require('fs');if(process.argv[3]){const old=fs.readFileSync(process.argv[3],'utf8');const bm=old.match(/const BUILD='([^']+)'/)[1];await pg.route('**/index.html*',r=>r.fulfill({status:200,contentType:'text/html; charset=utf-8',body:old}));await pg.route('**/version.json*',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({build:bm})}))}const logs=[];pg.on('console',m=>{if(m.type()==='error')logs.push(m.text())});pg.on('pageerror',e=>logs.push('pageerror '+e.message));
  await pg.goto('http://localhost:8765/index.html?wk=1',{waitUntil:'load'});await pg.waitForTimeout(3000);
  const r=await pg.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));
    newGame();loginEl.hidden=true;bootHide();save=()=>{};state.lv=99;REG_OPEN.ruins=1;goExplore('ruins');await W(1500);regEnter('plaza');
    const seen=[];for(let i=0;i<20;i++){await W(500);const el=document.getElementById('rgimg');seen.push((REG_GND_ST['assets/ground/ruins_plaza.jpg']||'-')+':'+(el?(el.dataset.k+'/'+String(el.getAttribute('href')||'').slice(0,12)):'none'));if(REG_GND_ST['assets/ground/ruins_plaza.jpg']==='ok'&&el&&el.dataset.k==='G')break}
    const el=document.getElementById('rgimg');
    return {BUILD,ua:navigator.userAgent.slice(0,80),seen,href:el&&el.getAttribute('href'),xlink:el&&el.getAttributeNS('http://www.w3.org/1999/xlink','href'),k:el&&el.dataset.k,regMap}});
  await pg.waitForTimeout(1500);
  await pg.screenshot({path:out+(process.argv[3]?'/wk150_old_375.png':'/wk150_plaza_375.png')});
  /* 也試一次「沒有 fetch」：只靠 Image（舊路徑）在 WebKit 會不會成功 */
  console.log(JSON.stringify({r,logs:logs.slice(0,8)},null,1));
  await b.close()})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
