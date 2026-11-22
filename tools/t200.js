/* 第 200 節：領主變難（傷害、血量、倒下站起來）；神寵的普通攻擊。由 tload.js 呼叫，也可以單獨跑：node tools/t200.js */
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..'),h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={newGame,LORDS,MON_RDMG,LV_REG,pHpMax,bossDmgOf,bossMake,lordKoOn,pDamage,petAtkTick,PET_ATK_PCT,fyBaseDmg,curMe,setMon(L){MON_RT={list:L,due:[],xs:null,key:"x"}},setScene(v){scene=v},setEx(b,m){exBiome=b;regMap=m},set bossRT(v){bossRT=v},get bossRT(){return bossRT},get pHP(){return pHP},set pHP(v){pHP=v},pMax:()=>pMax(),get petAct(){return petAct},get state(){return state},get went(){return globalThis.__went||0}};goFarm=function(){globalThis.__went=(globalThis.__went||0)+1};';
let NOW=1e12;const TQ=[];const sT=(f,ms)=>{TQ.push({t:NOW+(ms||0),f});return TQ.length};const run=ms=>{const end=NOW+ms;while(NOW<end){NOW=Math.min(end,NOW+50);for(;;){TQ.sort((a,b)=>a.t-b.t);if(!TQ.length||TQ[0].t>NOW)break;const q=TQ.shift();try{q.f()}catch(e){}}}};
class FD extends Date{constructor(...a){a.length?super(...a):super(NOW)}static now(){return NOW}}
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:sT,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date:FD,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>NOW},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[200] '+m);if(!c)fails++};
T.newGame();T.setScene('explore');const st=T.state;
/* 傷害：dmg 1 的招，近戰入口等級扣 22%（招本身 36.7%）；第二階段 ×1.3 */
let okAll=true,rows=[];for(const bk in T.LORDS){const L=T.LORDS[bk],r=T.MON_RDMG[bk],avg=(r[0]+r[1])/2,hp=T.pHpMax(T.LV_REG[bk]),pct=avg*L.dmgK*0.6/hp;rows.push(`${bk} ${(pct*100).toFixed(1)}%`);if(Math.abs(pct-0.22)>0.005)okAll=false}
ok(okAll,'九隻：一招（dmg 1）近戰入口等級扣 22%（'+rows.join('、')+'）');
{const W={snow:460,volcano:610,canyon:660,ruins:1080};ok(Object.keys(T.LORDS).every(k=>T.LORDS[k].hpK===(W[k]||300)),'hpK 前五隻 300、後四隻照估計（奧索 460、歐特魯斯 610、蕾普絲 660、塔羅斯 1080）')}
const b={kind:'lord',bk:'grass',def:T.LORDS.grass,dmgK:T.LORDS.grass.dmgK,atk:'cross',ph:1,art:'lord_grass',x:0,y:0};let s1=0,s2=0;for(let i=0;i<400;i++){s1+=T.bossDmgOf(b)}b.ph=2;for(let i=0;i<400;i++){s2+=T.bossDmgOf(b)}
ok(Math.abs(s2/s1-1.3)<0.05,'第二階段 ×1.3（'+(s2/s1).toFixed(2)+'）');
/* 倒下：15 秒後站起來 50%、最多 2 次、第 3 次回農場 */
T.setEx('grass','secret');const L=T.bossMake('lord','grass',T.LORDS.grass,null);T.bossRT=L;T.pHP=10;T.pDamage(1e6,L);
ok(T.lordKoOn()&&T.went===0,'血量歸零：倒下（不是回農場）');T.pDamage(1e6,L);ok(T.lordKoOn()&&T.pHP===0,'倒下中不會再被打');
NOW+=15100;try{vm.runInContext('lordKoTick()',ctx)}catch(e){}ok(!T.lordKoOn()&&Math.abs(T.pHP-T.pMax()*0.5)<=1,'15 秒後站起來、血量 50%');
T.pHP=10;T.pDamage(1e6,L);NOW+=15100;vm.runInContext('lordKoTick()',ctx);T.pHP=10;T.pDamage(1e6,L);ok(T.went===1,'第 3 次倒下：照舊放棄（回農場）');T.bossRT=null;
/* 神寵的普通攻擊 */
st.pets=[{id:'p1',bk:'grass',st:1,lv:20,xp:0}];st.petOn='p1';const me=T.curMe();me.x=500;me.y=500;const M=[{k:'slime',x:560,y:500,hp:1e9,max:1e9,face:-1,el:null,aggro:1,lastHit:NOW,dead:false}];T.setMon(M);
const d=T.petAtkTick();run(400);ok(d>0&&M[0].hp<1e9&&Math.abs(d-Math.round(T.fyBaseDmg()*T.PET_ATK_PCT[1]))<=1,`成獸：打主人正在打的怪（${d}＝fyBaseDmg ×${T.PET_ATK_PCT[1]}）`);
ok(T.petAct&&T.petAct.c===T.LORDS.grass.glow,'同步 pa：位置、時間、光色');
ok(!T.petAtkTick(),'冷卻 3 秒');NOW+=3100;M[0].x=900;ok(!T.petAtkTick(),'超過 200 不打');st.fyAuto=false;M[0].x=560;NOW+=3100;ok(!T.petAtkTick(),'自動戰鬥關掉時不打');st.fyAuto=true;
const S=require('./sim200.js').table();ok(S.worstPct<=0.5,`神寵＋神之子的普通攻擊 ÷ 主人：最高 ${(S.worstPct*100).toFixed(0)}%（≤ 50%）`);
if(fails)process.exitCode=1;
