/* 第 204 節：後六區領主的修正。假玩家、假的 Realtime Database 照 tcoop.js。用法：node tools/t204.js（tload.js 會跑） */
const fs=require('fs'),vm=require('vm'),path=require('path');
const h=fs.readFileSync(process.argv[2]&&process.argv[2].endsWith('.html')?process.argv[2]:path.join(__dirname,'..','index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=`;var __TOASTS=[],__DMG=[];toast=function(m){__TOASTS.push(String(m))};crumb=function(){};const __ds=dmgShow;dmgShow=function(x,y,v,o){__DMG.push({v,o:o||{}});return null};globalThis.TOASTS=()=>__TOASTS;globalThis.DMGS=()=>__DMG;
atkHeld=true;/* 189：普通攻擊改按攻擊鍵，測試裡一直按住 */var __pick=null,__pev=[];dropBtnPaint=function(on){__pick=!!on};partyFightPrompt=function(ev){__pev.push(ev)};globalThis.mkFr=ids=>{state.friends=ids.filter(x=>x!==uid);profiles=ids.map(id=>({id,name:id,fr:ids.filter(x=>x!==id)}));for(const id of ids)stData[id]={on:true}};globalThis.T={mkFr:ids=>mkFr(ids),get pev(){return __pev},partyInvite,partyAccept,partyLeave,partyDrop,partyBoot,partyCanInvite,PARTY_MAX,get PARTY(){return PARTY},get partyId(){return partyId},set partyNet(v){partyNet=v},get partyDeniedShown(){return partyDeniedShown},get pickOn(){return __pick},bossLoop,dropTick,dropPick,GDROP,newGame,regPrep,regCur,bossEnter,bossLeave,bossStep,bossHp,lordSummon,lordBusy,hatsuhoGo,hatsuhoSlots,fruitAdd,fruitsArr,makeWild,phen,matsObj,matCount:(k)=>{try{dropPick(1e9)}catch(e){}return matCount(k)},SERVANTS,LORDS,BOSS_RESPAWN,BOSS_JOIN_K,bossDealt,LAI,BATK,bossOver,regNextExitAll,exitPos,basSteal,catLoop,orth196Tick,MAT_ICON,REGION_MAPS,TOWN_NPC,regMapSVG:typeof regMapSVG==='function'?regMapSVG:null,fxPlay,FXQ,setPlanFx(j){FXP=j;FXPst=1;for(const k in j.fx){FXIst[k]=1;FXI[k]={width:1,height:1}}},setCombo(n){comboN=n;comboAt=Date.now()},
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

let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[204] '+m);if(!c)fails++};
const enter=(T,bk,id,x,y)=>{T.setScene('explore');T.setEx(bk,id,x,y);T.regPrep(bk,id);T.bossEnter(bk,id)};
const step=(Ts,ms)=>{const end=NOW+ms;while(NOW<end){NOW+=40;for(const T of Ts)T.bossStep(0.04);runTimers()}};
const pres=Ts=>{for(const T of Ts){const o={};for(const S of Ts)if(S!==T)o[S.u]={x:S.me().x,y:S.me().y,name:S.name};T.others=o}};/* 假玩家沒有 scene 屬性，不看它 */
const reset=()=>{TREE={};LIS.length=0;TQ=[];NOW+=3600e3};
const ROOT=path.join(__dirname,'..');
/* 1. 巴絲的眼睛 */
{reset();const A=client('uA','甲');enter(A,'desert','secret',400,900);A.bossRT=null;const b=A.lordSummon('desert');b.atk='gaze';b.mode='wind';const hot=A.bossOver(b,100,108);b.mode='rest';b.atk='dim';const dim=A.bossOver(b,100,108);b.mode='sand';const sand=A.bossOver(b,100,108);
  ok(/baseye hot/.test(hot)&&/baseye dim/.test(dim)&&/class="sand"/.test(dim)&&sand==='','巴絲的眼睛：凝視時亮（會閃）、暗下來灰＋沙塵、化沙不畫')}
/* 2. 奧索的暴風雪：霧在 paint（紅色範圍下面），不再整個畫面蓋白 */
{reset();const A=client('uA','甲');enter(A,'snow','cave2',400,900);A.bossRT=null;const b=A.lordSummon('snow');b.fs.fog=NOW+5000;const s=A.LAI.urso.paint(b);ok(/fill="#EEF4FA" opacity=".7"/.test(s)&&s.indexOf('EEF4FA')<s.indexOf('<g'),'暴風雪：白霧 0.7 畫在地上那一層最底下（紅色範圍、影子在上面）')}
/* 3. 小黑貓：還沒發現的入口，跟到 120 內就算發現 */
{reset();const A=client('uA','甲');enter(A,'desert','dunes',400,700);const e=A.regNextExitAll('desert','dunes','secret');ok(e&&e.to==='secret'&&e.hid,'往秘境的路包括還沒發現的入口');
  A.state.secrets={};const P=A.exitPos(A.regCur(),e);A.matsObj().x_sand_whale_g=1;A.basSteal('x_sand_whale_g');const C=A.lordSum.cat;C.x=P[0];C.y=P[1];A.me().x=P[0]+60;A.me().y=P[1];A.catLoop(1000);A.catLoop(1016);NOW+=600;runTimers();
  ok(A.state.secrets&&A.state.secrets.desert&&C.map==='secret','跟到入口 120 內：入口被發現（發現秘境）、貓跳進去')}
/* 4～6、7：雙人 */
{reset();const A=client('uA','甲'),B=client('uB','乙');enter(A,'ruins','secret',400,900);enter(B,'ruins','secret',420,900);A.bossRT=null;B.bossRT=null;A.pHP=1e12;B.pHP=1e12;pres([A,B]);const a=A.lordSummon('ruins');step([A,B],1200);const b=B.bossRT;A.pHP=1e12;B.pHP=1e12;
  A.me().x=a.x-120;A.me().y=a.y;B.me().x=a.x+120;B.me().y=a.y;pres([A,B]);setP('fight/ruins/dmg/uA',10);setP('fight/ruins/dmg/uB',900);fire();a.face=-1;step([A,B],3600);
  ok(a.face===1&&b&&b.face===1,'塔羅斯：主機轉向傷害最多的乙（面向 '+a.face+'／乙看到 '+(b&&b.face)+'）');
  const fa=a.x,fb=b.x;A.me().x=a.x+80;B.me().x=b.x+80;let d0=a.myDmg;A.bossDealt(a,{d:1000,crit:false});const ka=a.myDmg-d0;d0=b.myDmg;B.bossDealt(b,{d:1000,crit:false});const kb=b.myDmg-d0;ok(ka===200&&kb===200,'兩邊照同一個朝向判定正面 ×0.2（甲 '+ka+'、乙 '+kb+'）')}
{reset();const A=client('uA','甲'),B=client('uB','乙');enter(A,'desert','secret',400,900);enter(B,'desert','secret',420,900);A.bossRT=null;B.bossRT=null;A.pHP=1e12;B.pHP=1e12;pres([A,B]);const a=A.lordSummon('desert');step([A,B],1200);const b=B.bossRT;A.pHP=1e12;B.pHP=1e12;
  B.me().x=a.x+120;B.me().y=a.y;A.me().x=a.x-300;A.me().y=a.y+300;pres([A,B]);a.atk='gaze';a.mode='act';a.shape={t:'sweep',x:a.x,y:a.y,r:340,w:70,a0:-0.3,dir:1,span:0.6,dur:2000,t0:NOW};a.until=NOW+2000;a.seq++;step([A,B],600);
  const M=a.fs.marked||{};ok(M.uB&&!M.uA,'巴絲：主機用位置判定，凝視掃到乙、沒掃到甲');step([A,B],400);ok(b.fs&&b.fs.marked&&b.fs.marked.uB,'盯住名單同步到乙那邊（兩邊一樣）');
  const t=A.LAI.bas.aim(a,[{u:'uA',x:1,y:1},{u:'uB',x:2,y:2}]);ok(t&&t.u==='uB','撲擊先撲被盯住的乙')}
{reset();const A=client('uA','甲'),B=client('uB','乙');enter(A,'volcano','secret',404,820);enter(B,'volcano','secret',420,820);pres([A,B]);const sa=A.bossRT;A.me().x=sa.x;A.me().y=sa.y+100;step([A,B],300);step([A,B],800);const sb=B.bossRT;
  ok(sa.active&&sa.net&&sb&&sb.net&&sb.net.fid===sa.net.fid,'抽火傀儡：兩個人在同一場');A.setCombo(30);B.setCombo(25);A.orth196Tick(0.05);B.orth196Tick(0.05);runTimers();step([A,B],200);A.orth196Tick(0.05);
  ok(A.bossRT&&A.bossRT.kind==='lord'&&A.bossRT.bk==='volcano','歐特魯斯：兩人連擊加總 30＋25 ≥ 50 → 主機燒斷鎖鏈、現身');step([A,B],800);ok(B.bossRT&&B.bossRT.kind==='lord','乙也加入同一場')}
/* 8. 特效染色 */
{const PL=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/fx/plan.json'),'utf8'));let n=0;for(const k in PL.boss)for(const tm in PL.boss[k])if(Array.isArray(PL.boss[k][tm]))for(const e of PL.boss[k][tm])if(e.tint)n++;let nf=0;for(const k in PL.fairy)for(const s in PL.fairy[k])for(const tm in PL.fairy[k][s])for(const e of PL.fairy[k][s][tm])if(e.tint)nf++;
  ok(n>=20&&nf>=10,`plan.json 加了 tint（領主、眷屬 ${n} 筆、神之子 ${nf} 筆）`);const A=client('uA','甲');A.setPlanFx(PL);A.setScene('explore');A.fxPlay([{k:'beam',size:100,tint:'#5FE8FF'}],0,0,{});ok(A.FXQ.length&&A.FXQ[A.FXQ.length-1].tint==='#5FE8FF','fxPlay 帶著 tint')}
/* 9～12 */
{const A=client('uA','甲');ok(A.BATK.roar.shove===60,'鎮社獅的吼聲：打到往外推 60');const K=A.TOWN_NPC.find(n=>n.id==='kannushi');ok(K&&K.av.top===15&&K.av.bottom===7&&K.av.hat===0,'神官：浴衣＋寬褲、不戴帽子、不是斗篷');
  const miss=['sakuramoss','shrinebell','snakescale','snakeeye','crystalspine','icecore','ironlink','redshard','toadskin','moonpearl','oldpart','rainbowcore'].filter(k=>!/assets\/icons\/mats\//.test(A.MAT_ICON[k]||'')||!fs.existsSync(path.join(ROOT,'assets/icons/mats',k+'.webp')));ok(!miss.length,'12 種素材都有自己的圖示'+(miss.length?'；缺 '+miss:''));
  const MS=A.REGION_MAPS.sakura,seen={},dup=[];for(const id in MS){const k=MS[id].gx+','+MS[id].gy;if(seen[k])dup.push(seen[k]+'/'+id);seen[k]=id}ok(!dup.length&&MS.secret.gx===1&&MS.secret.gy===-1,'櫻花之丘：狐火庭在 (1,-1)，地圖格子沒有重疊'+(dup.length?'；重疊 '+dup:''));
  let ok2=true;try{A.regMapSVG&&A.regMapSVG('sakura')}catch(e){ok2=false}ok(ok2,'櫻花之丘的地區地圖畫得出來')}
console.log(fails?('[204] FAILS '+fails):'[204] ALL PASS');if(fails)process.exitCode=1;
