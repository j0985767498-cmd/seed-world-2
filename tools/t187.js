/* 第 187 節：連擊數。由 tload.js 呼叫，也可以單獨跑：node tools/t187.js */
const fs=require('fs'),vm=require('vm'),path=require('path');
const h=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
let clock=1e12;class FD extends Date{static now(){return clock}}
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={newGame,packState,loadSave,repairState,monHit,comboNow,comboTick,COMBO_FNS,setMon(L){MON_RT={list:L,due:[],xs:null}},setScene(v){scene=v},get state(){return state},set state(v){state=v}};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date:FD,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>clock},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[187] '+m);if(!c)fails++};
/* 舊存檔補 comboMax */
{T.newGame();const st=T.state;delete st.comboMax;const r=T.loadSave(T.packState(st));T.repairState(r.state);ok(r.state.comboMax===0,'old save gets comboMax = 0');T.state=r.state}
T.setScene('explore');const M=[{k:'slime',x:500,y:500,hp:1e9,max:1e9,el:null}];T.setMon(M);
const seen=[];T.COMBO_FNS.push((n,t)=>seen.push(n));
for(let i=0;i<12;i++){T.monHit(0,10);clock+=500}
ok(T.comboNow()===12&&T.state.comboMax===12&&seen[seen.length-1]===12,'12 hits 0.5 s apart → combo 12, comboMax 12, onCombo hook gets n');
T.monHit(0,10,false,false,true);ok(T.comboNow()===12,'神之子 (pet) hits do not count');
clock+=2400;T.comboTick();ok(T.comboNow()===12,"still 12 at 2.9 s after the last hit");clock+=200;T.comboTick();ok(T.comboNow()===0&&T.state.comboMax===12,'reset after 3 s without a hit; comboMax kept');
T.monHit(0,10);T.setScene('farm');T.comboTick();ok(T.comboNow()===0,'leaving the wild resets');
console.log(fails?('[187] FAILS '+fails):'[187] ALL PASS');if(fails)process.exitCode=1;
