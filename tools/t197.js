/* 第 197 節：省電模式＝特效變少。由 tload.js 呼叫，也可以單獨跑：node tools/t197.js */
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..'),h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const PLAN=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/fx/plan.json'),'utf8'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={newGame,fxT,fxGrp,fxSet,fxHas,fxOnHit,skCast,wpnFire,curWpn,FXQ,FX_MAX,SKILLS,setPlan(j){FXP=j;FXPst=1;for(const k in j.fx){FXIst[k]=1;FXI[k]={width:1,height:1}}},set hitKind(v){fxHitKind=v},set skCtx(v){fxSkCtx=v},get mute(){return fxMute},setMon(L){MON_RT={list:L,due:[],xs:null}},setScene(v){scene=v},get state(){return state},set eco(v){ECO_USER=v},get fxMax(){return fxMax()}};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>Date.now()},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[197] '+m);if(!c)fails++};

T.newGame();T.setScene('explore');T.setPlan(PLAN);
/* 現在的 plan：劍、槍的普通攻擊，省電時照播（第 197 節之前是 0 個） */
for(const [c,tm] of [['tomato','swing'],['tomato','hit'],['corn','muzzle']]){const C={crop:c,key:'atk',tier:1,face:1,own:true};T.eco=true;T.FXQ.length=0;const r=T.fxT(tm,100,100,C);ok(r&&T.FXQ.length===1,`省電：${c} 普通攻擊 ${tm} 照播（${T.FXQ.length} 個）`)}
/* 好幾筆、count、spread：省電只留第一筆、count 1、不散開 */
const P2=JSON.parse(JSON.stringify(PLAN)),k0=PLAN.weapons.tomato.atk.swing,K=(Array.isArray(k0)?k0[0]:k0).k;P2.weapons.tomato.atk.swing=[{k:K,count:3,spread:20},{k:K,size:80}];T.setPlan(P2);
const C={crop:'tomato',key:'atk',tier:1,face:1,own:true};T.eco=false;T.FXQ.length=0;T.fxT('swing',100,100,C);const nOff=T.FXQ.length;T.eco=true;T.FXQ.length=0;T.fxT('swing',100,100,C);const nOn=T.FXQ.length;
ok(nOff===4&&nOn===1&&T.FXQ[0].dx===0,`好幾筆的普通攻擊：關 ${nOff} 個 → 開 ${nOn} 個（第一筆、count 1、不散開）`);T.setPlan(PLAN);
/* 別人的：省電時 cast 不播、target 只播第一筆 */
let sk=null;for(const c in PLAN.weapons){for(const key of ['s1','s2'])PLAN.weapons[c][key].forEach((g,gi)=>{const v=g.target;const L=!v?[]:Array.isArray(v)?v:[v];if(L.length>1&&!sk)sk={c,key,gi,L}})}
if(sk){const R={crop:sk.c,key:sk.key,tier:sk.key==='s1'?[1,3,5][sk.gi]:[2,4,6][sk.gi],face:1,own:false};T.FXQ.length=0;T.fxT('target',0,0,R);ok(T.FXQ.length===1,'別人的技能 target：省電只播第一筆（'+sk.L.length+' 筆 → '+T.FXQ.length+'）');ok(T.fxT('cast',0,0,R)===false,'別人的 cast：省電不播')}
/* 同時最多 16 個 */
T.FXQ.length=0;for(let i=0;i<40;i++)T.fxT('swing',100,100,C);ok(T.fxMax===16&&T.FXQ.length<=16,'省電：同時最多 16 個（'+T.FXQ.length+'）');T.eco=false;ok(T.fxMax===40,'平常 40');
if(fails)process.exitCode=1;
