/* 第 191 節：特效層。由 tload.js 呼叫，也可以單獨跑：node tools/t191.js（會印出每把武器多載多少 KB） */
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..'),h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const PLAN=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/fx/plan.json'),'utf8'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={newGame,fxT,fxGrp,fxSet,fxHas,fxOnHit,skCast,wpnFire,curWpn,FXQ,FX_MAX,SKILLS,setPlan(j){FXP=j;FXPst=1;for(const k in j.fx){FXIst[k]=1;FXI[k]={width:1,height:1}}},set hitKind(v){fxHitKind=v},set skCtx(v){fxSkCtx=v},get mute(){return fxMute},setMon(L){MON_RT={list:L,due:[],xs:null}},setScene(v){scene=v},get state(){return state}};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>Date.now()},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[191] '+m);if(!c)fails++};
/* 素材：plan 用到的每個鍵都有 fx 資料和圖檔 */
{const used=new Set();const arr=v=>!v?[]:Array.isArray(v)?v:[v],add=L=>{for(const e of arr(L))used.add(e.k)};for(const t in PLAN.common)add(PLAN.common[t]);for(const c in PLAN.weapons){const W=PLAN.weapons[c];for(const t in W.atk)add(W.atk[t]);for(const s of ['s1','s2'])for(const g of W[s])for(const t in g)add(g[t])}
  const miss=[...used].filter(k=>!PLAN.fx[k]||!fs.existsSync(path.join(ROOT,'assets/fx',k+'.webp')));ok(!miss.length&&Object.keys(PLAN.weapons).length===9,`plan.json: ${used.size} effects used, all have metadata and a .webp`+(miss.length?'；缺 '+miss:''));
  const kb=k=>fs.statSync(path.join(ROOT,'assets/fx',k+'.webp')).size/1024,sum=S=>[...S].reduce((s,k)=>s+kb(k),0),com=new Set();for(const t in PLAN.common)for(const e of arr(PLAN.common[t]))com.add(e.k);
  const rows=[];for(const c in PLAN.weapons){const W=PLAN.weapons[c],A=new Set(),B=new Set();const put=(S,L)=>{for(const e of arr(L))S.add(e.k)};for(const t in W.atk)put(A,W.atk[t]);for(const t in W.s1[0])put(A,W.s1[0][t]);for(const t in W.s2[0])put(A,W.s2[0][t]);for(const t in W.atk)put(B,W.atk[t]);for(const t in W.s1[2])put(B,W.s1[2][t]);for(const t in W.s2[2])put(B,W.s2[2][t]);rows.push(`${c} 1 階 ${Math.round(sum(A))} KB／6 階 ${Math.round(sum(B))} KB`)}
  console.log(`[191] 共用 ${Math.round(sum(com))} KB；裝備一把武器多載：`+rows.join('、'));}
T.setPlan(PLAN);T.newGame();T.setScene('explore');const st=T.state;st.lv=40;
/* 組別：s1＝1～2／3～4／5～6 階；s2＝2～3／4～5／6 階 */
ok([1,2,3,4,5,6].map(t=>T.fxGrp('s1',t)).join('')==='001122'&&[2,3,4,5,6].map(t=>T.fxGrp('s2',t)).join('')==='00112','tier → group mapping (s1 1-2/3-4/5-6, s2 2-3/4-5/6)');
/* 播放、別人、省電 */
{const C={crop:'tomato',key:'s1',tier:1,face:1,own:true};T.FXQ.length=0;ok(T.fxT('cast',100,100,C)&&T.FXQ.length===2,'own skill: cast plays (sword s1: thrust + cone)');
  T.FXQ.length=0;ok(!T.fxT('hit',100,100,{...C,own:false})&&T.fxT('cast',100,100,{...C,own:false}),'someone else\'s skill: hit not played, cast played');
  ok(!T.fxT('nosuch',100,100,C),'timing not in plan → false (old drawing stays)');}
/* 上限 40 */
{const C={crop:'tomato',key:'s1',tier:5,face:1,own:false};T.FXQ.length=0;for(let i=0;i<60;i++)T.fxT('cast',100,100,C);ok(T.FXQ.length<=T.FX_MAX,`at most ${T.FX_MAX} effects at once (${T.FXQ.length})`);}
/* 命中：同一幀最多 6 個 */
{T.FXQ.length=0;T.hitKind='atk';st.weapons=[{crop:'tomato',tier:1,st:[],sf:0}];st.wpn=0;for(let i=0;i<10;i++)T.fxOnHit(100,100,false);T.hitKind=null;ok(T.FXQ.length===6,`hit effects capped at 6 per frame (${T.FXQ.length})`);}
/* 普通攻擊：近戰有 swing 就不畫舊的刀光（wpnFire 期間 fxMute） */
{const w0=Date.now();while(Date.now()-w0<25){}/* 上一項塞滿了同一幀的 6 個命中 */T.FXQ.length=0;const M=[{k:'slime',x:510,y:500,hp:1e9,max:1e9,el:null,face:1}];T.setMon(M);const me=st.me;T.wpnFire(T.curWpn(),{m:M[0],i:0});console.log('  queued:',T.FXQ.map(p=>p.k).join(','),'hp',M[0].hp<1e9);ok(T.FXQ.some(p=>p.k==='slash')&&T.FXQ.some(p=>p.k==='hit')&&!T.mute,'sword normal attack: swing (slash) + hit; old drawing muted only during the attack');}
/* 技能：放出去會播 cast、命中 hit */
{T.FXQ.length=0;st.weapons=[{crop:'broccoli',tier:1,st:[],sf:0}];st.wpn=0;const M=[{k:'slime',x:530,y:500,hp:1e9,max:1e9,el:null,face:1}];T.setMon(M);ok(T.skCast(1)&&T.FXQ.length>0,'hammer skill 1 (震地) plays plan effects ('+T.FXQ.map(p=>p.k).join(',')+')');}
console.log(fails?('[191] FAILS '+fails):'[191] ALL PASS');if(fails)process.exitCode=1;
