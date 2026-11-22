/* 第 196 節：後六區的領主、眷屬、現身條件。假玩家、假的 Realtime Database 照 tcoop.js。用法：node tools/t196.js（tload.js 會跑） */
const fs=require('fs'),vm=require('vm'),path=require('path');
const h=fs.readFileSync(process.argv[2]&&process.argv[2].endsWith('.html')?process.argv[2]:path.join(__dirname,'..','index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=`;var __TOASTS=[],__DMG=[];toast=function(m){__TOASTS.push(String(m))};crumb=function(){};const __ds=dmgShow;dmgShow=function(x,y,v,o){__DMG.push({v,o:o||{}});return null};globalThis.TOASTS=()=>__TOASTS;globalThis.DMGS=()=>__DMG;
atkHeld=true;/* 189：普通攻擊改按攻擊鍵，測試裡一直按住 */var __pick=null,__pev=[];dropBtnPaint=function(on){__pick=!!on};partyFightPrompt=function(ev){__pev.push(ev)};globalThis.mkFr=ids=>{state.friends=ids.filter(x=>x!==uid);profiles=ids.map(id=>({id,name:id,fr:ids.filter(x=>x!==id)}));for(const id of ids)stData[id]={on:true}};globalThis.T={mkFr:ids=>mkFr(ids),get pev(){return __pev},partyInvite,partyAccept,partyLeave,partyDrop,partyBoot,partyCanInvite,PARTY_MAX,get PARTY(){return PARTY},get partyId(){return partyId},set partyNet(v){partyNet=v},get partyDeniedShown(){return partyDeniedShown},get pickOn(){return __pick},bossLoop,dropTick,dropPick,GDROP,newGame,regPrep,regCur,bossEnter,bossLeave,bossStep,bossHp,lordSummon,lordBusy,hatsuhoGo,hatsuhoSlots,fruitAdd,fruitsArr,makeWild,phen,matsObj,matCount:(k)=>{try{dropPick(1e9)}catch(e){}return matCount(k)},SERVANTS,LORDS,BOSS_RESPAWN,BOSS_JOIN_K,bossDealt,bossParts,LAI,BATK,bossHit,bossShapeSVG,kujiToday,nextFullMoons,fullMoonDay,rabbitMissing,l196Tap,l196Action,l196HTML,foxL,MAP_OF,TALOS_KEYS,urso196Tick,catTap,basSteal,orth196Tick,regExitAt,shrineOpen,lord196Tool,bossInv,lordWonOthers,setCombo(n){comboN=n;comboAt=Date.now()},get sheet(){return sheet},set sheet(v){sheet=v},
 get bossRT(){return bossRT},set bossRT(v){bossRT=v},get lordSum(){return lordSum},get pHP(){return pHP},set pHP(v){pHP=v},set others(v){others=v},set uid(v){uid=v},set rtdb(v){rtdb=v},set bossNet(v){bossNet=v},get bossNet(){return bossNet},get fightDeniedShown(){return fightDeniedShown},get state(){return state},setScene(v){scene=v},setEx(b,m,x,y){exBiome=b;regMap=m;exMe.x=x;exMe.y=y},me:()=>exMe};`;
let NOW=Date.UTC(2026,10,21,5,30,0);
class FD extends Date{constructor(...a){a.length?super(...a):super(NOW)}static now(){return NOW}}
let TQ=[];const sT=(f,ms)=>{TQ.push({t:NOW+(ms||0),f});return TQ.length};
const runTimers=()=>{let k=0;while(k++<1000){const i=TQ.findIndex(o=>o.t<=NOW);if(i<0)break;const o=TQ.splice(i,1)[0];try{o.f()}catch(e){}}};
let TREE={};const LIS=[];let WR={n:0,bytes:0};
const segs=p=>p.split('/').filter(Boolean);
function getP(p){let o=TREE;for(const s of segs(p)){if(o==null||typeof o!=='object')return null;o=o[s]}return o==null?null:JSON.parse(JSON.stringify(o))}
function setP(p,v){const S=segs(p);let o=TREE;for(let i=0;i<S.length-1;i++){if(typeof o[S[i]]!=='object'||o[S[i]]==null)o[S[i]]={};o=o[S[i]]}if(v==null)delete o[S[S.length-1]];else o[S[S.length-1]]=JSON.parse(JSON.stringify(v))}
const fire=()=>{for(const L of LIS.slice())if(!L.off)L.cb(getP(L.p))};
const cnt=(p,v)=>{WR.n++;WR.bytes+=p.length+JSON.stringify(v==null?null:v).length};
const TS=v=>JSON.parse(JSON.stringify(v===undefined?null:v),(k,x)=>x==='__TS__'?NOW:x);const DIS={};
const mkNet=u=>({fake:1,on:(p,cb)=>{const L={p,cb,u};LIS.push(L);cb(getP(p));return ()=>{L.off=1}},get:p=>Promise.resolve(getP(p)),set:(p,v)=>{cnt(p,v);setP(p,TS(v));fire()},update:(p,v)=>{cnt(p,v);for(const k in v)setP(p+'/'+k,TS(v[k]));fire()},remove:p=>{cnt(p,null);setP(p,null);fire()},stamp:()=>'__TS__',onDis:(p,v)=>{(DIS[u]=DIS[u]||{})[p]=v},onDisOff:p=>{if(DIS[u])delete DIS[u][p]}});
const drop=u=>{for(const [p,v] of Object.entries(DIS[u]||{}))setP(p,TS(v===undefined?1:v));DIS[u]={};for(const L of LIS)if(L.u===u)L.off=1;fire()};
function client(u,name,real){const D=new Proxy(function(){},{get:(t,k)=>k==='hidden'?false:k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
  const ctx={document:D,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:(()=>{const m={};return {getItem:k=>k in m?m[k]:null,setItem:(k,v)=>{m[k]=String(v)},removeItem:k=>{delete m[k]}}})(),console,setTimeout:sT,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date:FD,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams,Image:function(){}};
  ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);const T=ctx.T;T.newGame();T.state.lv=40;T.state.pname=name;T.uid=u;if(!real){T.bossNet=mkNet(u);T.partyNet=mkNet(u)}T.u=u;T.name=name;T.TT=()=>ctx.TOASTS();T.DM=()=>ctx.DMGS();return T}

let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[196] '+m);if(!c)fails++};
const enter=(T,bk,id,x,y)=>{T.setScene('explore');T.setEx(bk,id,x,y);T.regPrep(bk,id);T.bossEnter(bk,id)};
const step=(Ts,ms)=>{const end=NOW+ms;while(NOW<end){NOW+=40;for(const T of Ts)T.bossStep(0.04);runTimers()}};
const pres=Ts=>{for(const T of Ts){const o={};for(const S of Ts)if(S!==T&&S.scene==='explore')o[S.u]={x:S.me().x,y:S.me().y,name:S.name};T.others=o}};
const reset=()=>{TREE={};LIS.length=0;TQ=[];NOW+=3600e3};
const hit=(T,b,d)=>T.bossDealt(b,{d,crit:false});
const NEW=['sakura','desert','snow','volcano','canyon','ruins'];
/* ---- 每隻：叫得出來、60 秒裡招式照輪、不出錯 ---- */
for(const bk of NEW){reset();const A=client('uA','甲');const id=A.MAP_OF('lord',bk);enter(A,bk,id,400,800);A.bossRT=null;pres([A]);
  let err=null;let b=null;try{b=A.lordSummon(bk)}catch(e){err=e}
  ok(b&&b.kind==='lord'&&b.fs,`${A.LORDS[bk].n}：在「${id}」叫得出來，場上物件 fs 有初始化`+(err?' '+err.message:''));if(!b)continue;
  const seen=new Set();let hp0=1e12;try{for(let i=0;i<1500;i++){A.pHP=1e12;A.me().x=b.x+60;A.me().y=b.y+20;step([A],40);if(b.atk)seen.add(b.atk)}}catch(e){err=e}
  ok(!err&&seen.size>=2,`${A.LORDS[bk].n}：60 秒出了 ${seen.size} 種招（${[...seen].join('、')}）`+(err?' 錯誤 '+err.message+' '+(err.stack||'').split('\n')[1]:''));
  let svg='';try{for(const a of seen){const S=A.BATK[a].shape(b,b.x+100,b.y+50);svg+=A.bossShapeSVG(S)}}catch(e){err=e}ok(!err,`${A.LORDS[bk].n}：每一招的範圍畫得出來（${svg.length} 字）`)}
/* ---- 眷屬：三招都畫得出來 ---- */
{reset();const A=client('uA','甲');for(const bk of NEW){const sv=A.SERVANTS[bk],id=A.MAP_OF('servant',bk);enter(A,bk,id,sv.at[0],sv.at[1]+100);const b=A.bossRT;let e2=null,n=0;
  try{for(const a of sv.atk){const S=A.BATK[a].shape(b,b.x+80,b.y+40);A.bossShapeSVG(S);if(S&&A.bossHit(S,b.x+80,b.y+40,Date.now()))n++}}catch(e){e2=e}
  ok(b&&b.kind==='servant'&&!e2,`${sv.n}（${id}）：三招 ${sv.atk.join('、')}，範圍判定得到 ${n} 招`+(e2?' '+e2.message:''))}}
/* ---- 列那 ---- */
{reset();const A=client('uA','甲');enter(A,'sakura','shrine',400,900);A.bossRT=null;const b=A.lordSummon('sakura');A.pHP=1e12;step([A],1000);
  b.x=b.cx;b.y=b.cy+200;const d0=b.myDmg;hit(A,b,1000);ok(A.bossInv(b)&&b.myDmg===d0,'列那：離狐火遠的時候打不到');
  for(const p of A.bossParts())hit(A,p,1e9);step([A],200);ok(b.mode==='rest'&&b.fs.P.every(f=>f.hp<=0),'三盞狐火都熄 → 現形坐下（rest）');
  hit(A,b,1000);ok(b.myDmg===d0+1000,'坐下的時候打得到');step([A],9000);ok(b.fs.P.every(f=>f.hp>0),'8 秒後狐火重燃')}
/* ---- 奧索 ---- */
{reset();const A=client('uA','甲');enter(A,'snow','cave2',400,900);A.bossRT=null;const b=A.lordSummon('snow');A.pHP=1e12;step([A],1000);A.pHP=1e12;const d0=b.myDmg;hit(A,b,1000);ok(b.myDmg-d0===300,'奧索：有冰甲時傷害 ×0.3（1000 → '+(b.myDmg-d0)+'）');
  b.fs.ice=[{x:b.x+150,y:b.y,t:NOW+9e3}];b.atk='icharge';b.shape={t:'line',x0:b.x,y0:b.y,x1:b.x+400,y1:b.y,w:80};b.mode='wind';b.until=NOW;b.rep=1;step([A],80);ok(b.fs.arm===2&&b.stun>NOW&&b.fs.ice.length===0,'衝撞撞到冰柱：冰柱碎、暈 4 秒、冰甲剩 2 層')}
/* ---- 歐特魯斯 ---- */
{reset();const A=client('uA','甲');enter(A,'volcano','secret',400,900);A.bossRT=null;const b=A.lordSummon('volcano');A.pHP=1e12;hit(A,b,b.max*2);ok(Math.abs(A.bossHp(b)/b.max-0.5)<0.01,'歐特魯斯：鎖鏈還在，血量停在 50%（'+(A.bossHp(b)/b.max*100).toFixed(1)+'%）');
  step([A],2000);ok(b.ph===1,'鎖鏈還在：不進第二階段');for(const p of A.bossParts())hit(A,p,1e12);step([A],2000);ok(b.ph===2&&b.fs.P.every(q=>q.hp<=0),'四根鐵樁都打斷 → 第二階段')}
/* ---- 蕾普絲 ---- */
{reset();const A=client('uA','甲');enter(A,'canyon','secret',400,900);A.bossRT=null;const b=A.lordSummon('canyon');A.pHP=1e12;ok(A.bossInv(b),'蕾普絲：平常打不到');let landed=false;for(let i=0;i<800&&!landed;i++){A.pHP=1e12;step([A],40);if(b.mode==='rest'&&b.atk==='lrest'&&!A.bossInv(b))landed=true}
  ok(landed,'跳完落地停住的時候打得到');const near=A.nextFullMoons(3,Date.UTC(2026,10,23));ok(near.length===3,'接下來三次滿月（前後 3 天的第一天）：'+near.join('、'))}
/* ---- 塔羅斯 ---- */
{reset();const A=client('uA','甲');enter(A,'ruins','secret',400,900);A.bossRT=null;const b=A.lordSummon('ruins');A.pHP=1e12;step([A],1000);A.pHP=1e12;b.face=1;A.me().x=b.x+80;A.me().y=b.y;let d0=b.myDmg;hit(A,b,1000);const f=b.myDmg-d0;A.me().x=b.x-80;d0=b.myDmg;hit(A,b,1000);const bk2=b.myDmg-d0;
  ok(f===200&&bk2===1000,`塔羅斯石盾：正面 ×0.2（${f}）、背面照常（${bk2}）`);hit(A,b,b.max*0.4);step([A],200);ok(b.art==='lord_ruins2'&&b.mode==='rest','66% 以下 → 光環形態（換圖、停 2 秒）');hit(A,b,b.max*0.35);step([A],200);ok(b.art==='lord_ruins','33% 以下 → 羽翼形態');
  const s1=A.LAI.talos.shadow(b).length;b.fs.pil=[];ok(s1===3&&A.BATK.wingult.shape(b).dk>0,'翼板張開：三根殘柱三個影子；柱子都沒了改成全場 ×0.5')}
/* ---- 巴絲 ---- */
{reset();const A=client('uA','甲');enter(A,'desert','secret',400,900);A.bossRT=null;const b=A.lordSummon('desert');A.pHP=1e12;step([A],1000);A.pHP=1e12;hit(A,b,b.max*0.36);step([A],200);ok(b.mode==='sand'&&A.bossInv(b),'巴絲：掉三分之一血 → 化沙（打不到）');step([A],2500);ok(b.mode!=='sand','2 秒後從聖甲蟲記號出現');
  hit(A,b,b.max*0.32);step([A],300);step([A],2500);ok(b.ph===2&&b.fs.P.filter(q=>q.snake).length===2,'第二階段化沙 → 冒出兩條小金蛇（'+b.fs.P.length+'）')}
/* ---- 現身條件 ---- */
{reset();const A=client('uA','甲');const K=A.kujiToday('2026-11-23'),K2=A.kujiToday('2026-11-23');ok(K.length===5&&JSON.stringify(K)===JSON.stringify(K2)&&K.every(k=>k.sp>=1&&k.sp<=6&&k.hint),'籤詩：五盞、同一天全服相同 — '+K.map(k=>k.no+'——'+k.hint).join('／'));
  enter(A,'sakura','pagoda',700,632);const M=A.regPrep('sakura','pagoda');ok(!A.regExitAt(M,M.B.x1+5,632),'竹籬門：還沒開');A.state.lordWon={kronos:1,minerva:1,exhir:1};A.sheet={l196:'kan'};A.l196HTML();ok(A.shrineOpen()&&A.regExitAt(M,M.B.x1+5,632),'讓其他 3 隻平靜下來過 → 神官說「狐大人想見你」，門打開');
  ok(A.bossRT&&A.bossRT.kind==='servant'&&A.bossRT.n==='鎮社獅','鎮社獅在神社（門口），門沒開也打得到');
  enter(A,'sakura','shrine',400,900);const day=new Date(NOW+8*3600e3).toISOString().slice(0,10),Kt=A.kujiToday(day);A.state.fruits=Kt.map(k=>({c:'tomato',k:'p'+k.sp+'|red|-',t:0,q:{'2|1':1}})).concat([{c:'tomato',k:'b0|red|-',t:0,q:{'2|1':1}}]);
  A.sheet={l196:'lant',i:0};const wrong=A.state.fruits.length-1;A.l196Action({dataset:{act:'lantput',i:String(wrong)}});ok(!A.foxL().ok[0]&&A.state.fruits.length===5,'放錯：被狐火燒掉（不退還）');
  for(let i=0;i<5;i++){const fi=A.state.fruits.findIndex(f=>f.k==='p'+Kt[i].sp+'|red|-');A.sheet={l196:'lant',i};A.l196Action({dataset:{act:'lantput',i:String(fi)}})}NOW+=800;runTimers();ok(A.bossRT&&A.bossRT.kind==='lord'&&A.bossRT.bk==='sakura','五盞都放對 → 列那現身')}
{reset();const A=client('uA','甲');enter(A,'snow','cave2',400,900);A.urso196Tick(Date.now());const P=A.lordSum.P;ok(P&&P.length===8,'冰洞深處：8 根冰柱');for(let i=0;i<5;i++)for(let j=0;j<3;j++)hit(A,A.bossParts().find(o=>o.pid===P[i].id),1);NOW+=900;runTimers();ok(A.bossRT&&A.bossRT.kind==='lord'&&A.bossRT.bk==='snow','30 秒內打碎 5 根 → 奧索站起來')}
{reset();const A=client('uA','甲');enter(A,'volcano','secret',404,800);const pu=A.bossRT;pu.active=true;A.setCombo(50);A.orth196Tick(0.1);ok(A.bossRT&&A.bossRT.kind==='lord'&&A.bossRT.bk==='volcano','對抽火傀儡 50 連擊 → 鎖鏈燒斷、歐特魯斯現身')}
{reset();const A=client('uA','甲');enter(A,'canyon','secret',400,900);A.lord196Tool('moon');const miss=A.rabbitMissing();for(const i of miss)A.l196Tap('l196:star:'+i);NOW+=800;runTimers();ok(A.bossRT&&A.bossRT.kind==='lord'&&A.bossRT.bk==='canyon','（假裝滿月）把缺的 3 顆星點回去 → 蕾普絲跳下來');A.lord196Tool('moon')}
{reset();const A=client('uA','甲');enter(A,'ruins','secret',392,640);const M=A.matsObj();for(const k of A.TALOS_KEYS())M[k]=1;A.sheet={l196:'panel'};A.l196Action({dataset:{act:'panelgo'}});ok(A.bossRT&&A.bossRT.kind==='lord'&&A.bossRT.bk==='ruins'&&A.TALOS_KEYS().every(k=>!M[k]),'控制台放入九區眷屬的金色素材 → 塔羅斯啟動（素材用掉）')}
{reset();const A=client('uA','甲');enter(A,'desert','dunes',400,700);A.matsObj().x_sand_whale_g=1;A.basSteal('x_sand_whale_g');ok(A.lordSum.cat&&!A.matsObj().x_sand_whale_g,'巴絲：金色素材被叼走、前方出現小黑貓');enter(A,'desert','secret',400,900);const C=A.lordSum.cat;C.map='secret';C.sit=1;C.x=400;C.y=880;A.me().x=400;A.me().y=900;A.catTap();NOW+=700;runTimers();ok(A.matsObj().x_sand_whale_g===1&&A.bossRT&&A.bossRT.kind==='lord'&&A.bossRT.bk==='desert','追進沙中遺跡、點祭壇上的貓 → 素材還你、巴絲現出原形')}
/* ---- 雙人 ---- */
{reset();const A=client('uA','甲'),B=client('uB','乙');enter(A,'sakura','shrine',400,900);enter(B,'sakura','shrine',420,900);A.bossRT=null;B.bossRT=null;pres([A,B]);const a=A.lordSummon('sakura');step([A,B],600);const b=B.bossRT;A.pHP=1e12;B.pHP=1e12;
  ok(b&&b.net&&b.net.fid===a.net.fid&&b.fs&&b.fs.P.length===3,'列那雙人：乙加入、看得到三盞狐火');for(const p of B.bossParts())hit(B,p,1e9);step([A,B],600);ok(a.fs.P.every(f=>f.hp<=0)&&a.mode==='rest','乙（不是主機）打熄三盞 → 主機（甲）那邊也熄了、列那坐下');step([A,B],300);ok(b.mode==='rest'&&b.fs.P.every(f=>f.hp<=0),'乙那邊收到同樣的狀態')}
{reset();const A=client('uA','甲'),B=client('uB','乙');enter(A,'ruins','secret',400,900);enter(B,'ruins','secret',420,900);A.bossRT=null;B.bossRT=null;pres([A,B]);const a=A.lordSummon('ruins');step([A,B],600);const b=B.bossRT;A.pHP=1e12;B.pHP=1e12;
  a.face=-1;A.me().x=a.x+80;hit(A,a,a.max*0.4);step([A,B],800);ok(a.art==='lord_ruins2'&&b&&b.art==='lord_ruins2','塔羅斯雙人：甲打到 66% 以下 → 兩邊都換成光環形態');a.myDmg+=a.max*0.3;a.dmg.uA=a.myDmg;step([A,B],800);ok(b&&b.art==='lord_ruins','33% 以下 → 兩邊都是羽翼形態')}
console.log(fails?('[196] FAILS '+fails):'[196] ALL PASS');if(fails)process.exitCode=1;
