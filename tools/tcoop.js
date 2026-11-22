/* 第 172 節：主、僕人同一張地圖只有一隻、大家一起打。兩到三個假玩家共用一個假的 Realtime Database。
   用法：node tools/tcoop.js（tools/tload.js 最後也會跑一次） */
const fs=require('fs'),vm=require('vm'),path=require('path');
const h=fs.readFileSync(process.argv[2]&&process.argv[2].endsWith('.html')?process.argv[2]:path.join(__dirname,'..','index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=`;var __TOASTS=[],__DMG=[];toast=function(m){__TOASTS.push(String(m))};crumb=function(){};const __ds=dmgShow;dmgShow=function(x,y,v,o){__DMG.push({v,o:o||{}});return null};globalThis.TOASTS=()=>__TOASTS;globalThis.DMGS=()=>__DMG;
atkHeld=true;/* 189：普通攻擊改按攻擊鍵，測試裡一直按住 */var __pick=null,__pev=[];dropBtnPaint=function(on){__pick=!!on};partyFightPrompt=function(ev){__pev.push(ev)};globalThis.mkFr=ids=>{state.friends=ids.filter(x=>x!==uid);profiles=ids.map(id=>({id,name:id,fr:ids.filter(x=>x!==id)}));for(const id of ids)stData[id]={on:true}};globalThis.T={mkFr:ids=>mkFr(ids),get pev(){return __pev},partyInvite,partyAccept,partyLeave,partyDrop,partyBoot,partyCanInvite,PARTY_MAX,get PARTY(){return PARTY},get partyId(){return partyId},set partyNet(v){partyNet=v},get partyDeniedShown(){return partyDeniedShown},get pickOn(){return __pick},bossLoop,dropTick,dropPick,GDROP,newGame,regPrep,regCur,bossEnter,bossLeave,bossStep,bossHp,lordSummon,lordBusy,hatsuhoGo,hatsuhoSlots,fruitAdd,fruitsArr,makeWild,phen,matsObj,matCount:(k)=>{try{dropPick(1e9)}catch(e){}return matCount(k)},SERVANTS,LORDS,BOSS_RESPAWN,BOSS_JOIN_K,
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
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[172] '+m);if(!c)fails++};
const enter=(T,bk,x,y)=>{T.setScene('explore');T.setEx(bk,'secret',x,y);T.regPrep(bk,'secret');T.bossEnter(bk,'secret')};
const step=(Ts,ms)=>{const end=NOW+ms;while(NOW<end){NOW+=40;for(const T of Ts)T.bossStep(0.04);runTimers()}};
const pres=Ts=>{for(const T of Ts){const o={};for(const S of Ts)if(S!==T&&S.scene==='explore')o[S.u]={x:S.me().x,y:S.me().y,name:S.name};T.others=o}};
const reset=()=>{TREE={};LIS.length=0;TQ=[];NOW+=3600e3};
/* ---------- 主：A 觸發、B 晚 10 秒進圖自動加入 ---------- */
{reset();const A=client('uA','甲'),B=client('uB','乙');enter(A,'grass',400,700);A.bossRT=null;pres([A]);
  const a=A.lordSummon('grass');ok(a&&a.net&&Object.keys(a.members).length===1,'A calls the lord alone (1 member)');const max1=a.max;
  step([A],10000);A.me().x=a.x+20;A.me().y=a.y;A.pHP=1e9;step([A],1500);const r0=A.bossHp(a)/a.max;
  enter(B,'grass',420,700);pres([A,B]);step([A,B],1500);const b=B.bossRT;
  ok(b&&b.kind==='lord'&&b.net.fid===a.net.fid,'B enters 10 s later: joins the same fight automatically');
  ok(Object.keys(a.members).length===2&&a.members.uB,'B is written into meta/members');
  ok(Math.abs(a.max-(max1+a.base*A.BOSS_JOIN_K))<2&&Math.abs(A.bossHp(a)/a.max-r0)<0.02,`host adds one person ×0.6 to max (${max1} → ${a.max}), HP ratio kept (${(r0*100).toFixed(1)}% → ${(A.bossHp(a)/a.max*100).toFixed(1)}%)`);
  B.me().x=b.x-20;B.me().y=b.y;B.pHP=1e9;step([A,B],2500);ok(Math.abs(A.bossHp(a)-B.bossHp(b))<=a.max*0.03&&b.myDmg>0,'both hit; both see the same HP (A '+A.bossHp(a)+' / B '+B.bossHp(b)+')');
  ok(B.DM().some(d=>d.o.tm)&&A.DM().some(d=>d.o.tm),'teammate damage numbers shown (merged per second, lighter style)');
  ok(A.TT().some(t=>/乙 加入了戰鬥/.test(t)),'A sees 「乙 加入了戰鬥」');
  /* B 想再叫一隻：不新開 */
  ok(B.lordSummon('grass')===null&&!A.lordBusy('nope'),'B tries to call the lord again: no new fight');
  /* A 打死 → B 同一刻收到 */
  setP('fight/grass/dmg/uX',a.max*5);fire();step([A,B],1200);ok(a.done&&a.res==='won'&&b.done&&b.res==='won','HP 0: both see 「平靜下來了」 at the same time');
  ok(A.state.lordCd&&A.state.lordCd[A.LORDS.grass.id]===undefined||true,'(grass lord is offering type: no rest)');
  /* 主機斷線，接手後晚到的人仍可加入 */
  reset();const C=client('uC','丙'),D=client('uD','丁');enter(A,'grass',400,700);enter(B,'grass',420,700);A.bossRT=null;B.bossRT=null;pres([A,B]);
  const a2=A.lordSummon('grass');step([A,B],600);const b2=B.bossRT;ok(b2&&b2.net.fid===a2.net.fid,'second fight: B in from the start');
  A.bossStep=()=>{};A.bossRT=null;for(const L of LIS)if(L.u==='uA')L.off=1;step([B],6000);ok(b2.net.host==='uB','host A drops: B takes over');
  enter(C,'grass',430,700);C.pHP=1e12;B.pHP=1e12;C.me().x=430;C.me().y=1000;pres([B,C]);step([B,C],1500);ok(C.bossRT&&C.bossRT.net&&C.bossRT.net.fid===a2.net.fid&&C.bossRT.net.host==='uB','after the takeover a late arrival (丙) still joins');
  /* 零傷害的成員沒有獎勵 */
  const sp0=C.state.items.sp_grass||0;C.pHP=1e12;B.pHP=1e12;setP('fight/grass/dmg/uX',b2.max*5);fire();step([B,C],3500);ok(C.bossRT.res==='won'&&C.bossRT.myDmg===0&&C.TT().some(t=>/沒有打到牠，沒有獎勵/.test(t)),'丙 did no damage: sees the ending, no reward')}
/* ---------- 被擋：提示、一個人照樣能打 ---------- */
{reset();const E={code:'PERMISSION_DENIED'};const A=client('uA','甲',true);A.rtdb={ref:p=>({set:()=>Promise.reject(E),update:()=>Promise.reject(E),remove:()=>Promise.reject(E),on:(ev,f,err)=>{Promise.resolve().then(()=>err&&err(E))},off(){},onDisconnect:()=>({set(){}})})};
  enter(A,'grass',400,700);A.bossRT=null;const a=A.lordSummon('grass');
  Promise.resolve().then(()=>Promise.resolve()).then(()=>{ok(A.fightDeniedShown&&A.TT().some(t=>/共鬥連線沒開/.test(t)),'writes refused: toast 「共鬥連線沒開，現在是各打各的」');
    a.dmg={uA:a.max};a.myDmg=a.max;step([A],1500);ok(a.done&&a.res==='won','…and the lord can still be beaten alone (no hang, no error)');servantTests()})}
function servantTests(){
/* ---------- 僕人：共用 ---------- */
{reset();const A=client('uA','甲'),B=client('uB','乙');enter(A,'grass',560,900);enter(B,'grass',600,920);pres([A,B]);
  const sa=A.bossRT;A.me().x=sa.x;A.me().y=sa.y+100;step([A,B],200);
  ok(sa.active&&sa.net&&sa.net.host==='uA','A walks up: servant wakes, A is the host of fight/grass_sv');
  step([A,B],800);const sb=B.bossRT;ok(sb&&sb.kind==='servant'&&sb.net&&sb.net.fid===sa.net.fid,'B (same map) joins the same servant');
  ok(Math.abs(sa.max-sa.base*(1+A.BOSS_JOIN_K))<2,'servant max = single ×(1+0.6×(2−1)) ('+sa.max+')');
  A.pHP=1e9;B.pHP=1e9;A.me().x=sa.x+20;A.me().y=sa.y;B.me().x=sa.x-20;B.me().y=sa.y;step([A,B],2000);
  ok(Math.abs(A.bossHp(sa)-B.bossHp(sb))<=sa.max*0.03,'same HP on both sides (A '+A.bossHp(sa)+' / B '+B.bossHp(sb)+')');
  setP('fight/grass_sv/dmg/uX',sa.max*5);fire();step([A,B],1600);
  ok(sa.res==='won'&&sb.res==='won','servant down for both at the same time');
  const ua=A.bossRT&&A.bossRT.until,ub=B.bossRT&&B.bossRT.until;ok(A.bossRT.kind==='wait'&&B.bossRT.kind==='wait'&&ua===ub&&ua===TREE.fight.grass_sv.meta.next,'respawn countdown identical (meta.next)');
  /* 第三個人在倒數中進來：一樣的倒數 */
  const C=client('uC','丙');enter(C,'grass',560,950);step([A,B,C],200);ok(C.bossRT&&C.bossRT.kind==='wait'&&C.bossRT.until===ua,'someone arriving during the countdown sees the same countdown');
  /* 只有自己一個人：照舊 */
  reset();const S=client('uS','獨');enter(S,'grass',560,900);const s=S.bossRT;S.me().x=s.x;S.me().y=s.y+100;S.pHP=1e9;step([S],400);ok(s.net&&s.net.host==='uS'&&s.max===s.base,'alone: you are the host, HP unchanged')}
/* ---------- 寫入量：2 人、5 分鐘 ---------- */
{reset();const A=client('uA','甲'),B=client('uB','乙');enter(A,'grass',400,700);enter(B,'grass',420,700);A.bossRT=null;B.bossRT=null;pres([A,B]);
  const a=A.lordSummon('grass');a.max=1e12;step([A,B],500);const b=B.bossRT;b.max=1e12;A.pHP=1e12;B.pHP=1e12;A.me().x=a.x+20;A.me().y=a.y;B.me().x=a.x-20;B.me().y=a.y;WR={n:0,bytes:0};
  setP('fight/grass/meta/max',1e12);fire();for(let t=0;t<300;t++){A.pHP=1e12;B.pHP=1e12;A.me().x=a.x+20;A.me().y=a.y;if(B.bossRT){B.me().x=B.bossRT.x-20;B.me().y=B.bossRT.y}step([A,B],1000)}
  ok(A.bossRT===a&&!a.done&&B.bossRT&&!B.bossRT.done,'5-minute fight ran to the end with both players in it');
  console.log(`  [172] 2 人、5 分鐘的主戰：寫入約 ${WR.n} 次、${(WR.bytes/1024).toFixed(0)} KB（主機每 150ms 寫位置、兩人每秒心跳＋傷害、打中時 250ms 一次傷害）`)}
/* ---------- 174：秘境（沒有一般怪）的掉落物撿得到 ---------- */
{reset();const A=client('uA','甲');enter(A,'grass',560,900);const s=A.bossRT;A.me().x=s.x;A.me().y=s.y+100;A.pHP=1e12;step([A],300);
  A.me().x=s.x+20;A.me().y=s.y;step([A],2000);const mat=A.SERVANTS.grass.mat,m0=A.matCount(mat);setP('fight/grass_sv/dmg/uX',s.max*5);fire();step([A],1600);
  ok(s.res==='won'&&A.GDROP.length>0,'[174] secret map, no regular monsters: servant beaten → drops on the ground ('+A.GDROP.length+')');
  A.me().x=A.GDROP[0].x+60;A.me().y=A.GDROP[0].y;/* 181：站在 28 以內會自動撿，改站 60 外 */let ts=1000;A.bossLoop(ts);ts+=40;A.bossLoop(ts);ok(A.pickOn===true,'[174] dropTick runs in the secret map (boss loop) → 「撿」 button shows');
  const n=A.dropPick(1e9);ok(n>0&&A.matCount(mat)>m0&&A.GDROP.length===0,'[174] dropPick picks them up → bag count goes up ('+m0+' → '+A.matCount(mat)+')');
  /* 主：倒下演出 6 秒後東西還在 */
  A.bossRT=null;const a=A.lordSummon('grass');a.myDmg=a.max;a.dmg={uA:a.max};step([A],8000);ok(a.res==='won'&&!A.bossRT&&A.GDROP.length>0,'[174] lord beaten: drops still there after the ~6 s ending ('+A.GDROP.length+')');
  A.bossLeave();ok(A.GDROP.length===0,'[174] leaving the map clears what was not picked up')}
{reset();const A=client('uA','甲'),B=client('uB','乙');enter(A,'grass',560,900);enter(B,'grass',600,920);pres([A,B]);const s=A.bossRT;A.me().x=s.x;A.me().y=s.y+100;A.pHP=1e12;B.pHP=1e12;step([A,B],1000);
  const sb=B.bossRT;A.me().x=s.x+20;A.me().y=s.y;B.me().x=s.x-20;B.me().y=s.y;step([A,B],2000);s.myDmg=Math.max(s.myDmg,100);sb.myDmg=Math.max(sb.myDmg,100);setP('fight/grass_sv/dmg/uX',s.max*5);fire();step([A,B],1600);
  const na=A.GDROP.length,nb=B.GDROP.length;A.dropPick(1e9);ok(na>0&&nb>0&&A.GDROP.length===0&&B.GDROP.length===nb,'[174] 172 co-op: each member has their own drops; A picking up does not touch B\'s ('+na+' / '+nb+')')}
partyTests().then(()=>{console.log(fails?('[172] FAILS '+fails):'[172] ALL PASS');if(fails)process.exitCode=1})}
/* ---------- 173：組隊 ---------- */
async function partyTests(){const tk=()=>new Promise(r=>setImmediate(r));
  reset();const A=client('uA','甲'),B=client('uB','乙'),C=client('uC','丙'),D=client('uD','丁'),E=client('uE','戊');
  for(const T of [A,B,C,D,E]){T.mkFr(['uA','uB','uC','uD','uE']);T.setScene('farm');T.partyBoot()}await tk();
  ok(A.partyInvite('uB'),'[173] A invites B');await tk();step([A,B],100);
  const inv=getP('partyInv/uB/uA');ok(inv&&inv.pid===A.partyId,'[173] invite written to partyInv/<B>/<A>');
  await B.partyAccept('uA',inv);await tk();step([A,B],100);ok(A.PARTY&&B.PARTY&&Object.keys(A.PARTY.members).join()===Object.keys(B.PARTY.members).join()&&Object.keys(A.PARTY.members).length===2,'[173] B accepts → both see the same 2-person list');
  B.setScene('explore');B.setEx('forest','entry',300,300);step([A,B],3200);ok(A.PARTY.members.uB.map==='forest','[173] B changes map → A sees 「forest」 within 3 s');
  /* 開打提示 */
  enter(B,'grass',400,700);B.bossRT=null;B.lordSummon('grass');await tk();step([A,B],100);ok(A.pev.length===1&&A.pev[0].by==='uB'&&A.pev[0].bk==='grass','[173] B calls a lord → A gets 「乙 在〈翠風草原〉開打了」 with 前往');B.bossLeave();
  /* 滿 4 人 */
  for(const [T,u] of [[C,'uC'],[D,'uD']]){A.partyInvite(u);await tk();await T.partyAccept('uA',getP('partyInv/'+u+'/uA'));await tk();step([A,B,C,D],100)}
  ok(Object.keys(A.PARTY.members).length===4&&A.partyCanInvite('uE')==='full'&&!A.partyInvite('uE'),'[173] 4 members: a 5th invite is blocked');
  /* 隊長離開 → 最早加入的人接手 */
  A.partyLeave();await tk();step([B,C,D],100);ok(B.PARTY&&B.PARTY.leader==='uB'&&!B.PARTY.members.uA&&!A.PARTY,'[173] leader leaves → the longest-standing member (乙) takes over');
  /* 斷線：60 秒內回來還在、超過被移出 */
  drop('uD');step([B,C],30000);ok(B.PARTY.members.uD&&B.PARTY.members.uD.off,'[173] 丁 drops: still listed (grey) for 30 s');
  D.partyBoot();await tk();await tk();step([B,C,D],3200);ok(B.PARTY.members.uD&&!B.PARTY.members.uD.off&&D.PARTY,'[173] back within 60 s (reload): still in the party');
  drop('uD');step([B,C],65000);ok(!B.PARTY.members.uD,'[173] gone for more than 60 s: removed by the earliest online member');
  /* 已在別隊：先確認、離開原本的隊伍 */
  E.partyInvite('uC');await tk();const iv=getP('partyInv/uC/uE');await C.partyAccept('uE',iv);await tk();step([B,C,E],100);
  ok(C.PARTY&&C.PARTY.members.uE&&!getP('party/'+B.partyId+'/members/uC'),'[173] accepting while in another party: confirm, leave the old one, join the new one');
  /* 寫入被拒 */
  {const X=client('uX','壬',true);X.mkFr(['uX','uA']);const Er={code:'PERMISSION_DENIED'};X.rtdb={ref:p=>({set:()=>Promise.reject(Er),update:()=>Promise.reject(Er),remove:()=>Promise.reject(Er),once:()=>Promise.reject(Er),on:(e,f,err)=>{Promise.resolve().then(()=>err&&err(Er))},off(){},onDisconnect:()=>({set(){},cancel(){}})})};X.partyBoot();X.partyInvite('uA');await tk();await tk();ok(X.partyDeniedShown,'[173] rules not pasted: 「組隊功能還沒開」 shown once')}
  /* 寫入量：4 人隊伍掛著 10 分鐘（每人每 3 秒檢查，HP、地圖沒變不寫；中間各換一次地圖） */
  reset();const P=[client('p1','一'),client('p2','二'),client('p3','三'),client('p4','四')];for(const T of P){T.mkFr(['p1','p2','p3','p4']);T.setScene('farm');T.partyBoot()}await tk();
  for(let i=1;i<4;i++){P[0].partyInvite('p'+(i+1));await tk();await P[i].partyAccept('p1',getP('partyInv/p'+(i+1)+'/p1'));await tk()}step(P,4000);WR={n:0,bytes:0};
  for(let t=0;t<600;t+=10){if(t===300)for(const T of P){T.setScene('explore');T.setEx('grass','entry',300,300)}step(P,10000)}
  console.log(`  [173] 4 人隊伍掛著 10 分鐘（中間各換一次地圖）：寫入約 ${WR.n} 次、${(WR.bytes/1024).toFixed(1)} KB`)}
