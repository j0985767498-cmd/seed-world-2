/* 第 183 節：轉生的夢、第一位神之子、主線不再發神之子。由 tload.js 呼叫，也可以單獨跑：node tools/t183.js */
const fs=require('fs'),vm=require('vm'),path=require('path');
const h=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';var __notes=[];noteOpen=function(h){__notes.push(String(h))};globalThis.T={newGame,packState,loadSave,repairState,migrate,dreamNeed,altObj,altL,altWho,altFull,fyWakeAlt,fyHas,fyqTick,qList,cropOpen,mq2Cur,mq2Done,mq2Tick,MQ2,ALT_LIST,get notes(){return __notes},get state(){return state},set state(v){state=v}};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[183] '+m);if(!c)fails++};
const ids=()=>T.MQ2.map(s=>s.id).join(',');
ok(ids()==='0-1,0-2,0-3,0-4,1-1,1-2,1-3,1-4,1-5,2-1,2-2+3,2-4,3-1,3-2,3-3,3-4,3-7','main story: 2-5, 2-6, 3-5, 3-6 removed ('+T.MQ2.length+' steps)');
/* 舊存檔：做一份「舊版」的存檔（沒有 mq183V），載入 → 遷移 */
const oldSave=f=>{T.newGame();const st=T.state;delete st.mq183V;f(st);const r=T.loadSave(T.packState(st));if(!r.state)throw new Error(r.err);T.repairState(r.state);T.state=r.state;return r.state};
/* 1. 有蘿瑪、在舊的 2-6（喚醒傑柯）：→ 3-1、補 500 金幣和稱號、沒有夢；傑柯變成神之子類任務 */
{const s=oldSave(st=>{st.fairy.tomato={col:'red',no:1,evo:0};st.mq2={i:13,st:1,f:{}};st.altLit={pumpkin:1};st.coins=1000});
  ok(s.mq2.i===12&&T.mq2Cur().id==='3-1'&&s.mq2.st===0,'old save with Roma at old 2-6 → now at 3-1');
  ok(s.coins===1500&&s.titles.includes('調停的人'),'… gets the moved 2-6 reward (500 coins, 調停的人)');
  ok(!T.dreamNeed()&&!s.anchor,'… no dream, anchor not set');
  T.fyqTick();const q=T.qList().filter(x=>x.kind==='fyq').map(x=>x.t);ok(q.includes('傑柯的清單')&&!q.includes('喚醒傑柯'),'… 「神之子・傑柯的清單」 shows in the task panel');}
/* 2. 有蘿瑪、舊的 3-6 蜜露跑掉中：→ 3-7、補獎勵；找到她時播台詞 */
{const s=oldSave(st=>{st.fairy.tomato={col:'red',no:1,evo:0};st.fairy.melon={col:'green',no:1,evo:0};st.fyRun={melon:1};st.mq2={i:19,st:1,f:{}};st.altLit={pumpkin:1,melon:1};st.coins=0});
  ok(T.mq2Cur().id==='3-7'&&s.coins===500&&s.titles.includes('把果實找回來的人'),'old save at old 3-6 (Mieru ran off) → 3-7 with the moved reward');
  T.fyqTick();ok(T.qList().some(x=>x.kind==='fyq'&&x.t==='喚醒蜜露'&&x.st==='run'),'… 「喚醒蜜露」 is a running 神之子 task while she is away');
  delete s.fyRun.melon;const n0=T.notes.length;T.fyqTick();T.fyqTick();ok(T.notes.slice(n0).filter(x=>/砰/.test(x)).length===1&&s.fyq.mw===1,'… found her → her lines play once (a level-up note may come with it)');}
/* 3. 沒有神之子、第一章中途：先看夢；選傑柯 → 1-5 的番茄清單喚醒傑柯 */
{const s=oldSave(st=>{st.mq2={i:6,st:1,f:{}}});
  ok(T.dreamNeed(),'old save, no 神之子, chapter 1 (1-3) → dream shows');
  s.anchor='pumpkin';ok(!T.dreamNeed()&&T.altWho('tomato')==='pumpkin','… chose 傑柯 → the tomato list now wakes 傑柯');
  const A=T.altObj('tomato');A.n=[3,3,3,3,3];A.cols=['red','yellow'];s.mq2={i:8,st:1,f:{}};ok(T.altFull('tomato'),'… tomato list filled');
  ok(T.fyWakeAlt('tomato','yellow')&&T.fyHas('pumpkin')&&!T.fyHas('tomato')&&s.fairy.pumpkin.col==='yellow','… 1-5 wakes 傑柯 with the chosen colour (not 蘿瑪)');
  ok(s.cropEarly&&s.cropEarly.pumpkin===1&&T.cropOpen('pumpkin'),'… pumpkin can be planted right away');
  ok(s.lots.some(l=>l.crop==='pumpkin'&&/傑柯/.test(l.source)),'… gets 傑柯\'s exclusive-shape seeds');
  ok(T.altObj('tomato').l2===1&&T.altL('tomato')===T.ALT_LIST.tomato2&&!T.altFull('tomato')&&T.altWho('tomato')==='tomato','… tomato altar reset to the second list, which wakes 蘿瑪');
  const n0=T.notes.length;T.mq2Tick();ok(T.mq2Cur().id==='2-1'&&/不是蘿瑪大人/.test(T.notes.slice(n0).join('')),'… 1-5 completes with 傑柯\'s lines + 「……不是蘿瑪大人。」');
  T.fyqTick();T.fyqTick();const q=T.qList().filter(x=>x.kind==='fyq').map(x=>x.t);ok(q.includes('蘿瑪的清單')&&!q.includes('傑柯的清單'),'… 「蘿瑪的清單」 task appears; 傑柯 tasks do not');}
/* 新遊戲：有旗標、要看夢 */
{T.newGame();ok(T.state.mq183V===1&&T.dreamNeed(),'new game: flag set, dream shows');}
/* 已經有任何一位神之子的舊玩家：沒有夢 */
{oldSave(st=>{st.fairy.corn={col:'green',no:1,evo:0};st.mq2={i:5,st:1,f:{}}});ok(!T.dreamNeed(),'old save with any 神之子 (麥斯) in chapter 1 → no dream');}
console.log(fails?('[183] FAILS '+fails):'[183] ALL PASS');if(fails)process.exitCode=1;
