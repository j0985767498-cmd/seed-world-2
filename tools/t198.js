/* 第 198 節：神之子的技能。由 tload.js 呼叫，也可以單獨跑：node tools/t198.js */
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..'),h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const PLAN=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/fx/plan.json'),'utf8'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={newGame,FY_SK,FYS,fySkDo,fySkTick,fyHitMod,fyHurtMod,fyAtkK,fyMonHold,fyUlt,fyUltReady,fyBuffRemote,fySkHTML,fyCharge,skHurt,curMe,FY_ULT_MAX,setMon(L){MON_RT={list:L,due:[],xs:null,key:"x"}},setScene(v){scene=v},get pHP(){return pHP},set pHP(v){pHP=v},pMax:()=>pMax(),get state(){return state}};';
let NOW=1e12;const TQ=[];const sT=(f,ms)=>{TQ.push({t:NOW+(ms||0),f});return TQ.length};const run=ms=>{const end=NOW+ms;while(NOW<end){NOW=Math.min(end,NOW+50);for(;;){TQ.sort((a,b)=>a.t-b.t);if(!TQ.length||TQ[0].t>NOW)break;const q=TQ.shift();try{q.f()}catch(e){}}}};
class FD extends Date{constructor(...a){a.length?super(...a):super(NOW)}static now(){return NOW}}
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:sT,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date:FD,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>NOW},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[198] '+m);if(!c)fails++};
T.newGame();T.setScene('explore');const st=T.state;st.lv=40;
const use=(k,evo)=>{st.fairy={follow:k,[k]:{col:'red',no:1,evo}};T.FYS.k=null;T.FYS.buf={};T.FYS.charge=0;T.FYS.ultAt=0;T.fySkTick()};
const mon=(x,y)=>({k:'slime',x,y,hp:1e9,max:1e9,face:-1,el:null,aggro:1,lastHit:NOW,dead:false});
const me=T.curMe();me.x=500;me.y=500;
/* 資料、特效 */
const ks=Object.keys(T.FY_SK);ok(ks.length===9&&ks.every(k=>T.FY_SK[k].length===3),'九位各三招');
const miss=[];for(const k of ks)for(const s of [1,2,3]){const S=PLAN.fairy&&PLAN.fairy[k]&&PLAN.fairy[k]['s'+s];if(!S)miss.push(k+s);else for(const tm in S)for(const e of S[tm])if(!PLAN.fx[e.k]||!fs.existsSync(path.join(ROOT,'assets/fx',e.k+'.webp')))miss.push(k+s+e.k)}
ok(!miss.length,'plan.json 的 fairy：27 招都有特效、圖都在'+(miss.length?'；缺 '+miss:''));
/* 蘿瑪：光束（易傷）、冠冕（增傷） */
use('tomato',1);let M=[mon(560,500)];T.setMon(M);T.fySkDo('tomato',1,{m:M[0]});run(400);const hp1=1e9-M[0].hp;
ok(hp1>0&&M[0]._fyV&&Math.abs(M[0]._fyV.k-T.FY_SK.tomato[0].vul)<1e-9,`光束：打中（${hp1}）、4 秒易傷 +${T.FY_SK.tomato[0].vul*100}%`);
let r=T.fyHitMod(M[0],1000,false,true);ok(r.d===Math.round(1000*(1+T.FY_SK.tomato[0].vul)),'易傷期間傷害照加（1000 → '+r.d+'）');
T.fySkDo('tomato',2,{m:M[0]});r=T.fyHitMod({},1000,false,true);ok(r.d===Math.round(1000*(1+T.FY_SK.tomato[1].up)),'冠冕：自己的傷害 +'+T.FY_SK.tomato[1].up*100+'%');
/* 自動放：沒有目標時冷卻不跑 */
use('melon',1);T.setMon([]);T.FYS.left={1:0,2:0};T.fySkTick();run(1000);T.fySkTick();ok(T.FYS.left[1]<=0,'沒有目標：招 1 不放、冷卻不跑');M=[mon(540,500)];T.setMon(M);T.fySkTick();ok(T.FYS.left[1]===T.FY_SK.melon[0].cd,'有目標：自動放招 1、冷卻 '+T.FY_SK.melon[0].cd+' 秒');
/* 芙蕾：花雨不用目標；迷香不攻擊 */
use('strawberry',1);T.setMon([]);T.pHP=T.pMax()*0.5;T.FYS.left={1:0,2:0};T.fySkTick();ok(T.pHP>T.pMax()*0.5,'花雨：沒有目標也放、回血');
M=[mon(540,500)];T.setMon(M);T.fySkDo('strawberry',2,{m:M[0]});ok(M[0].calm>NOW&&T.fyMonHold(M[0],0,NOW,0.02),'迷香：怪 3 秒內不攻擊');
const B={def:{h:1},x:520,y:500,done:false};T.fySkDo('strawberry',2,{boss:B});ok(B.atkDn&&B.atkDn.k===0.2&&Math.abs(T.fyAtkK(B)-0.8)<1e-9,'迷香對領主：攻擊力 −20%');
/* 凱爾：光盾、符文 */
use('broccoli',1);T.fySkDo('broccoli',1,null);const sh=T.FYS.buf.shield.v;ok(T.skHurt(sh*0.5,null)===null&&T.FYS.buf.shield.v>0,'光盾：先扣護盾（擋住時不扣血）');T.fySkDo('broccoli',2,null);T.FYS.buf.shield=null;ok(Math.abs(T.fyHurtMod(1000)-800)<1,'符文：受到的傷害 −20%');
/* 傑柯：鬼火疊層 */
use('pumpkin',0);M=[mon(540,500)];T.setMon(M);for(let i=0;i<7;i++){T.fyHitMod(M[0],100,false,false);NOW+=50}ok(M[0]._fyB&&M[0]._fyB.n===5,'鬼火：主人每打中一次疊一層，最多 5 層');
/* 大招：充能、30 秒 */
use('corn',2);for(let i=0;i<50;i++){T.fyCharge(NOW);NOW+=50}ok(T.FYS.charge===T.FY_ULT_MAX,'充能：打中 40 下就滿（同一幀只算 1）');
T.FYS.charge=0;for(let i=0;i<10;i++)T.fyCharge(NOW);ok(T.FYS.charge===1,'同一幀打中很多下只算 1');
T.FYS.charge=40;ok(T.fyUlt()&&T.FYS.charge===0,'充滿：放大招、歸零');T.FYS.charge=40;ok(!T.fyUlt(),'30 秒內充滿也要等');NOW+=30001;ok(T.fyUlt(),'30 秒後可以再放');
/* 蜜露：慶典連鎖 */
use('melon',2);M=[mon(560,500),mon(660,500),mon(760,500),mon(860,500)];T.setMon(M);T.fySkDo('melon',3,{m:M[0]});run(2000);ok(M.every(m=>m.hp<1e9),'慶典：一路炸到旁邊的怪（4 隻都中）');
/* 隊友效果：範圍內才套 */
use('chili',1);T.FYS.buf={};T.fyBuffRemote('uX',{k:'broccoli2',t:NOW,x:me.x+100,y:me.y});ok(Math.abs(T.fyHurtMod(1000)-800)<1,'隊友的符文：在 150 內，自己也減傷');T.FYS.buf={};T.fyBuffRemote('uY',{k:'broccoli2',t:NOW,x:me.x+400,y:me.y});ok(Math.abs(T.fyHurtMod(1000)-1000)<1,'太遠：不套');
/* 資訊頁 */
const H=T.fySkHTML('tomato',0);ok(/光束/.test(H)&&/進化後開放/.test(H)&&/神化後開放/.test(H),'資訊頁：三招、還沒到的階段加鎖');
/* 35% */
const S=require('./sim198.js').table();ok(S.worst<=0.35+1e-9,`招 1＋招 2＋普通攻擊 ÷ 主人：最高 ${(S.worst*100).toFixed(1)}%（≤ 35%）`);
if(fails)process.exitCode=1;
