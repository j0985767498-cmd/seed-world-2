/* 第 190 節：放星星、升階、副武器、轉移。由 tload.js 呼叫，也可以單獨跑：node tools/t190.js */
const fs=require('fs'),vm=require('vm'),path=require('path');
const h=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={newGame,packState,loadSave,repairState,wpStarDo,wpStarP,wpSlot,wpStarFruits,wpUpNeed,wpUpDo,wpTrDo,wpTrOk,wpTrCost,wpSetMain,wpSetSub,wpnSwap,wpn2Tick,wpStat,wpPageHTML,skCast,WEAPONS,WP_UP,MATS,get SKC(){return SKC},setSheet(v){sheet=v},setScene(v){scene=v},get state(){return state},set state(v){state=v}};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[190] '+m);if(!c)fails++};
/* 舊存檔補 wpn2、sf */
{T.newGame();const st=T.state;st.weapons=[{crop:'tomato',tier:1,st:[]}];delete st.wpn2;const r=T.loadSave(T.packState(st));T.repairState(r.state);ok(r.state.wpn2===null&&r.state.weapons[0].sf===0,'old save gets wpn2 = null, weapons[].sf = 0');T.state=r.state}
const st=T.state;st.lv=60;st.coins=1e6;
const fruit=(crop,sp,t,n)=>({c:crop,k:`p${sp}|red|-`,t,q:{'2|1':n}});
/* 放星星的條件：同作物、造型是那兩種、稀有度 ≥ 那一格的階 */
{st.weapons=[{crop:'tomato',tier:2,st:[2,4,2],sf:0}];st.wpn=0;/* 劍收三角形(2)、星形(4) */st.fruits=[fruit('tomato',2,0,5),fruit('tomato',3,4,5),fruit('eggplant',2,4,5),fruit('tomato',4,1,5)];
  const L=T.wpStarFruits(st.weapons[0]).map(x=>x.i);ok(L.length===1&&L[0]===3,'star fruit filter: same crop, accepted shape, rarity ≥ the slot\'s tier (2nd tier needs 少見+): only the 少見 star tomato');}
/* 成功率：1 萬次 */
{const e={crop:'tomato',tier:2,st:[2,4,2,4,2],sf:0};st.weapons=[e];/* 第 2 階第 3 格：80% */let win=0;const N=10000;
  for(let k=0;k<N;k++){e.st=[2,4,2,4,2];e.sf=0;st.fruits=[fruit('tomato',4,5,1)];/* 209.1：2 階第 3 格是 B（星形） */if(T.wpStarDo(0,0).ok)win++}
  ok(Math.abs(win/N-0.8)<0.02,`3rd star of tier 2: 80% (${(win/N*100).toFixed(1)}% in 10,000)`);
  e.st=[2,4,2];e.sf=0;st.fruits=[fruit('tomato',2,5,1)];ok(T.wpStarP(e)===1,'1st / 2nd star of a tier: 100%');}
/* 失敗累積 +10%、成功歸零 */
{const e={crop:'tomato',tier:6,st:Array(17).fill(2),sf:0};st.weapons=[e];e.st=Array(17).fill(2).slice(0,17);e.st.length=17;
  const p0=T.wpStarP(e);st.fruits=[fruit('tomato',2,5,3)];let R=T.wpStarDo(0,0,()=>0.99);ok(p0===0.5&&!R.ok&&e.sf===1&&Math.abs(T.wpStarP(e)-0.6)<1e-9,'tier 6 3rd star 50%; a failure → +10% (60%), fruit lost');
  R=T.wpStarDo(0,0,()=>0.1);ok(R.ok&&e.sf===0&&e.st.length===18,'success → stored, fail count reset');}
/* 名品果實 ×1.5（星形＋夢幻色金） */
{const e={crop:'tomato',tier:1,st:[2],sf:0};st.weapons=[e];st.fruits=[{c:'tomato',k:'p4|gold|-',t:3,q:{'2|1':1}}];T.setScene('explore');const R=T.wpStarDo(0,0);ok(R.ok&&R.mh&&e.st[1]===-4&&/* 209.1：1 階第 2 格是星形 */Math.abs(T.wpStat('crit')-0.015)<1e-9,'名品 fruit: stored as −4, star bonus ×1.5 (crit +1.5%)');}
/* 升階條件 */
{const e={crop:'tomato',tier:1,st:[2,4],sf:0};st.weapons=[e];st.mats={};st.fruits=[];let R=T.wpUpNeed(e);ok(R.t===2&&!R.ok&&!R.L.find(x=>x.k==='stars').ok,'upgrade to 2: blocked until 3 stars');
  e.st=[2,4,2];st.lv=5;R=T.wpUpNeed(e);ok(!R.L.find(x=>x.k==='lv').ok,'… and player level 10');
  st.lv=60;const W={mats:vm.runInContext('WP_UP2.tomato[2]',ctx)};for(const [m,n] of W.mats)st.mats[m]=n;/* 208.4：升階素材改讀 WP_UP2 */st.fruits=[fruit('tomato',0,1,10)];const c0=st.coins;R=T.wpUpDo(0);
  ok(R.ok&&e.tier===2&&e.st.length===3&&st.coins===c0-200&&!st.fruits.length&&W.mats.every(([m])=>!st.mats[m]),'upgrade to 2: materials, 10 少見+ fruits, 200 coins taken; stars kept; tier 2');
  ok(R.learn==='十字斬','… 「學會了：十字斬」');}
/* 轉移 */
{const A={crop:'tomato',tier:4,st:[2,4,2,4,2,4,2,4,2,-4],sf:0},B={crop:'chili',tier:2,st:[5,6,5],sf:0};st.weapons=[A,B];st.mats={};const C=T.wpTrCost(A,B);
  ok(C.coins===850&&C.gold===3,'transfer cost (A tier 4): 850 coins + 3 gold of B\'s near material');
  ok(/不夠/.test(T.wpTrOk(0,1)),'not enough gold material → blocked');st.mats[T.WEAPONS.chili.mats[0][0]+'_g']=3;const c0=st.coins;const R=T.wpTrDo(0,1);
  ok(R.ok&&B.tier===4&&B.st.length===10&&B.st.every((x,k)=>x===vm.runInContext(`wpWant('${B.crop}',${k})`,ctx))&&A.tier===1&&!A.st.length&&st.coins===c0-850,'transfer: B gets tier 4 + 10 stars (B\'s slot shapes per 209.1, no 名品), A back to tier 1 / 0 stars');
  ok(/比這把低/.test(T.wpTrOk(1,0)===''?'':T.wpTrOk(0,1)),'B must be lower tier than A');}
/* 副武器：2-4 完成解鎖；換手；冷卻各算 */
{st.weapons=[{crop:'tomato',tier:2,st:[],sf:0},{crop:'broccoli',tier:2,st:[],sf:0}];st.wpn=0;st.wpn2=null;delete st.wpn2On;st.mq2={i:11,st:1,f:{}};T.wpn2Tick();ok(!st.wpn2On,'sub weapon locked before 2-4 is done');
  st.mq2={i:12,st:0,f:{}};T.wpn2Tick();ok(st.wpn2On===1,'unlocked once 2-4 is done (old players: on login)');
  T.setScene('explore');ok(!T.wpSetSub(0)&&T.wpSetSub(1)&&st.wpn2===1,'sub can\'t be the main weapon; set sub = hammer');
  T.SKC.s1=0;const M=[];ok(T.skCast(1)&&T.SKC.s1>Date.now(),'cast sword skill 1 → on cooldown');const cdSword=T.SKC.s1;
  ok(T.wpnSwap()&&st.wpn===1&&st.wpn2===0&&T.SKC.s1===0,'swap: hammer in hand, its own cooldown (0)');T.wpnSwap();ok(st.wpn===0&&T.SKC.s1===cdSword,'swap back: sword cooldown still counting from where it was');}
/* 武器頁畫得出來 */
{T.setSheet({wpi:0});const H=T.wpPageHTML();ok(/鑲嵌/.test(H)&&!/放星星/.test(H)&&/升階/.test(H)&&/轉移/.test(H)&&/設為副武器|副武器/.test(H),'weapon page renders (stars, upgrade, sub, transfer)');}
console.log(fails?('[190] FAILS '+fails):'[190] ALL PASS');if(fails)process.exitCode=1;
