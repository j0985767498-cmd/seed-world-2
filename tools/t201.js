/* 第 201 節（序章～第三章）：渡界者、夢拿掉、祭壇前選第一位、大殿夜襲、老李／阿土伯、舊存檔。由 tload.js 呼叫，也可以單獨跑：node tools/t201.js */
const fs=require('fs'),vm=require('vm'),path=require('path');
const h=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';var __notes=[],__vn=[];noteOpen=function(h){__notes.push(String(h))};vnPlay=function(pg,o){__vn.push(pg);if(o&&o.onEnd)o.onEnd()};globalThis.T={newGame,packState,loadSave,repairState,dreamNeed,altObj,altFull,fyWakeAlt,fyHas,mq2Cur,mq2Tick,MQ2,pick201,altarTap,raidGo,raidLoop,raidDeal,RAID,townNpcs,vnParse,t201,setScene(v){scene=v},set townMap(v){townMap=v},get notes(){return __notes},get vn(){return __vn},get state(){return state},set state(v){state=v},get pHP(){return pHP},set pHP(v){pHP=v}};';
const TQ=[];const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:(f)=>{TQ.push(f);return TQ.length},setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,cancelAnimationFrame(){},fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[201] '+m);if(!c)fails++};const run=()=>{let n=0;while(TQ.length&&n++<200)try{TQ.shift()()}catch(e){}};
/* 201.1、201.1b：改字 */
ok(!/幾百年/.test(js)&&!/接住/.test(js)&&!/DREAM_L/.test(js)&&!/王國/.test(js),'程式裡沒有「幾百年」「接住」、夢的台詞');
ok(T.MQ2[0].open.includes('四十幾年')&&T.MQ2[0].open.includes('召喚的魔法')&&T.MQ2[1].open.includes('渡界者'),'序章：四十幾年、召喚的魔法、渡界者');
/* 夢拿掉；新遊戲有旗標 */
T.newGame();const st=T.state;ok(!T.dreamNeed()&&st.mq201V===1,'新遊戲：沒有夢、有 201 旗標');
/* {名}、{神} */
st.pname='小綠';const pg=T.vnParse('{名}：嗨｜阿土伯：你好，{名}',{kind:'narr'});ok(pg[0].name==='小綠'&&pg[0].text==='嗨'&&pg[1].who==='tu'&&pg[1].text==='你好，小綠','對話的 {名} 換成玩家名字、說話的人分得開');
/* 老李、阿土伯 */
T.setScene('market');T.townMap='plaza';let ids=T.townNpcs().map(p=>p.id);ok(ids.includes('li')&&!ids.includes('tu'),'城鎮：老李在、阿土伯不在');
T.townMap='garden';ok(T.townNpcs().some(p=>p.id==='tu'),'阿土伯在城郊菜圃');
/* 祭壇前選第一位 */
st.mq2={i:8,st:1,f:{}};const A=T.altObj('tomato');A.n=[3,3,3,3,3];A.cols=['red','yellow'];
ok(T.pick201()&&!T.fyWakeAlt('tomato','red')&&!T.fyHas('tomato'),'清單獻滿：九座一起亮；還沒選之前不能直接喚醒');
T.townMap='church_hall';T.altarTap('chili');run();ok(st.anchor==='chili'&&st.pick201===1&&!T.pick201(),'點卡宴的祭壇、確認：選了卡宴');
const n0=T.notes.length;ok(T.fyWakeAlt('tomato','yellow')&&T.fyHas('chili')&&!T.fyHas('tomato'),'選光芒顏色：醒來的是卡宴');
T.mq2Tick();run();const nt=T.notes.slice(n0).join('');ok(/光怎麼偏了/.test(nt)&&/大幹一場/.test(nt)&&/今晚為神之子祈福/.test(nt),'1-5 完成：光偏了、卡宴醒來的台詞、神父');
/* 夜襲 */
ok(T.mq2Cur().id==='1-6'&&st.mq2.st===1,'接著是 1-6 大殿夜襲（自動接下）');
const v0=T.vn.length;T.raidGo();ok(T.RAID.on&&T.RAID.foes.length===4,'4 個黑衣人');
T.pHP=5;const f=T.RAID.foes[0];f.x=400;f.y=600;ctx.marketMe=undefined;vm.runInContext('marketMe={x:400,y:610}',ctx);f.wind=-1;T.raidLoop();ok(T.pHP>=1,'被打到也不會死（血量最低 1，現在 '+T.pHP+'）');
for(const g of T.RAID.foes.slice(0,3))T.raidDeal(g,1e9,0);T.raidLoop();run();
ok(!T.RAID.on&&T.mq2Cur().id==='2-1','打倒 3 個：演出、1-6 完成、到第二章');
ok(T.vn.slice(v0).some(p=>p.some(x=>/八果實下落古籍/.test(x.text))),'演出：搶走《八果實下落古籍》');
/* 蘿瑪 */
T.newGame();const s2=T.state;s2.mq2={i:8,st:1,f:{}};const B=T.altObj('tomato');B.n=[3,3,3,3,3];B.cols=['red'];T.townMap='church_hall';T.altarTap('tomato');run();T.fyWakeAlt('tomato','red');const n1=T.notes.length;T.mq2Tick();run();
ok(T.fyHas('tomato')&&/……蘿瑪大人。/.test(T.notes.slice(n1).join(''))&&!/光怎麼偏了/.test(T.notes.slice(n1).join('')),'選蘿瑪：光直接落下、神父「……蘿瑪大人。」');
/* 舊存檔 */
const oldSave=f=>{T.newGame();const s=T.state;delete s.mq201V;f(s);const r=T.loadSave(T.packState(s));if(!r.state)throw new Error(r.err);T.repairState(r.state);T.state=r.state;return r.state};
{const s=oldSave(x=>{x.fairy.tomato={col:'red',no:1,evo:0};x.mq2={i:9,st:1,f:{}}});ok(s.mq2.i===10&&T.mq2Cur().id==='2-1'&&s.rc201===1,'舊存檔在第二章 2-1：往後挪一格、補演夜襲回顧');}
{const s=oldSave(x=>{x.mq2={i:6,st:1,f:{}}});ok(s.mq2.i===6&&!s.rc201,'舊存檔在第一章中途：位置不動、不演回顧');}
{const s=oldSave(x=>{x.anchor='melon';x.mq2={i:8,st:1,f:{}};const a=x.fairy.altar||(x.fairy.altar={});a.tomato={n:[3,3,3,3,3],cols:['red']}});ok(T.pick201()&&!T.fyWakeAlt('tomato','red'),'夢裡選過但還沒喚醒：到祭壇重新選');}
/* ---- 201 後半：第二、三章、關鍵道具 ---- */
{const X=(c)=>vm.runInContext(c,ctx);
  const fr=(c,k,qk,n)=>({c,k,t:0,q:{[qk]:n}});
  T.newGame();const s3=T.state;s3.pname='小綠';s3.lv=30;s3.fairy.tomato={col:'red',no:1,evo:0};s3.anchor='tomato';s3.chSeen={0:1,1:1,2:1,3:1};
  /* 2-1：兩位都說過話 → 完成，演兩邊吵架 */
  s3.mq2={i:10,st:1,f:{}};X("mq2Talk('yue');mq2Talk('jin')");run();const n2=T.notes.length;X('mq2Tick()');run();
  ok(T.mq2Cur().id==='2-2+3'&&/林子是守護者大人的地盤/.test(T.notes.slice(n2-1).join('')),'2-1：巴頓、林婆婆吵架，進到兩件委託');
  /* 2-2：白色南瓜 3＋巨大的南瓜 1（兩種分開交） */
  X("mq2Accept('2-2');mq2Accept('2-3')");const G0=X("giveSpec('mq2','2-2#0')"),G1=X("giveSpec('mq2','2-2#1')");ok(G0&&G0.c.skin==='white'&&G0.need===3&&G1&&G1.c.minSize===4&&G1.need===1,'巴頓要兩種：白色南瓜 3、巨大的南瓜 1');
  s3.fruits=[fr('pumpkin','b0|white|-','2|1',3),fr('pumpkin','b0|red|-','4|1',1),fr('pumpkin','b0|red|n/2','2|1',3)];
  X("giveDo('mq2','2-2#0',3)");ok(!X("mq2SF('2-2').d"),'只交白色的：還沒完成');X("giveDo('mq2','2-2#1',1)");run();ok(X("mq2SF('2-2').d")===1,'兩種都交了：巴頓的委託完成');
  X("giveDo('mq2','2-3#0',3)");run();ok(T.mq2Cur().id==='2-4','林婆婆：星點花紋的南瓜 3 → 兩件都完成，到 2-4');
  /* 2-4：林婆婆交出果實 → 祭壇 → 維恩借走手電筒、識別卡 */
  X("mq2Accept();mq2Talk('yue');mq2Talk('jin')");ok(s3.mq2.f.fruit===1,'和解：拿到永生的果實（南瓜）');
  X("noteGet('R6',true);noteGet('R7',true)");X("mq2Ev('altar')");run();ok(T.mq2Cur().id==='3-1','放上祭壇：第二章完成');
  X("scene='market';townMap='church_hall'");X('wien201()');ok(s3.lab201&&s3.lab201.R6&&s3.lab201.R7&&/交給研究所的東西/.test(X('noteHTML()')),'維恩借走手電筒、識別卡，筆記頁移到「交給研究所的東西」');
  X("scene='explore';exBiome='marsh'");
  /* 3-1 */
  X("mq2Accept()");const l31=X("mq2Talk('duo')");run();ok(/採樣船/.test(l31)&&T.mq2Cur().id==='3-2','3-1：老舵說果實被偷了');
  /* 3-2：阿海要白色月牙形的甜瓜 */
  X("mq2Accept()");s3.fruits=[fr('melon','p5|white|-','2|1',3)];X("giveDo('mq2','3-2',3)");run();ok(T.mq2Cur().id==='3-3','3-2：交白色月牙形的甜瓜 3 → 完成');
  /* 3-3：三條線索 → 神父 → 碼頭 → 回去看小船 */
  X("mq2Accept()");const go=(map,dx)=>{X(`regMap='${map}';{const p=pathPt('marsh','${map}',${dx});exMe={x:p[0],y:p[1]}}`);X('VN=null;mq2MarshTick()');run()};
  for(const [m,dx] of [['marsh',60],['village',-60],['lotus',50]])go(m,dx);const c=s3.mq2.f.cl;ok(c.mud&&c.root&&c.boat&&c.theo,'三條線索都找到，神父來指路');
  go('tunnel',0);ok(c.dock,'碼頭（倒木隧道）：只找到爛麻布');go('lotus',50);run();ok(T.mq2Cur().id==='3-4','回蓮花池：小船開走了 → 3-3 完成');
  /* 3-4：海蝕洞 */
  X("mq2Accept()");go('log',0);ok(s3.mq2.f.fruit===1&&X("noteHas('K5')"),'海蝕洞：拿回果實、日蝕的記號記進筆記');
  X("mq2Ev('altar')");run();ok(T.mq2Cur().id==='3-7','果實放上祭壇：3-4 完成');
  /* 領主的金屬環、墨先生 */
  X("ki201Lord('grass')");ok(X("noteHas('K1')"),'讓克洛諾斯平靜下來：鏽蝕的編號金屬環');const v1=T.vn.length;X("VN=null;npc201('mo')");ok(T.vn.slice(v1).some(p=>p.some(x=>/No\.01-G/.test(x.text))),'墨先生看金屬環');
  X("ki201Lord('marsh')");ok(X("noteHas('K4')"),'艾克希爾：新的編號金屬環');}
/* 傑柯是第一位：第二章照樣要走 */
{T.newGame();const s4=T.state;s4.fairy.pumpkin={col:'red',no:1,evo:0};s4.anchor='pumpkin';s4.mq2={i:10,st:1,f:{}};vm.runInContext('mq2Tick()',ctx);run();ok(T.mq2Cur().id==='2-1','第一位是傑柯：2-1 不會自動跳過');
  const L=T.MQ2.find(x=>x.id==='2-4').doneF();ok(/傑柯：……嗯。/.test(L),'第一位是傑柯：放果實時只有「……嗯。」');}
/* 201 後半的舊存檔 */
{const old2=f=>{T.newGame();const s=T.state;delete s.mq201bV;f(s);const r=T.loadSave(T.packState(s));T.repairState(r.state);T.state=r.state;return r.state};
  let s=old2(x=>{x.mq2={i:14,st:1,f:{cl:{mud:1}}}});ok(s.mq2.i===15&&T.mq2Cur().id==='3-3'&&s.mq2.f.cl.mud===1,'舊的 3-2（線索）→ 新的 3-3 線索，已找到的保留');
  s=old2(x=>{x.mq2={i:15,st:1,f:{got:2}}});ok(s.mq2.i===16&&T.mq2Cur().id==='3-4'&&s.mq2.st===1,'舊的 3-3（所長的甜瓜）→ 新的 3-4 海蝕洞');
  s=old2(x=>{x.notes={R6:123}});ok(s.notes.R7===123,'有指南針（現在是手電筒）的舊存檔補識別卡');}
if(fails)process.exitCode=1;
