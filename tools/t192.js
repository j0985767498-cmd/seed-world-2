/* 第 192 節：領主與眷屬的招式特效。由 tload.js 呼叫，也可以單獨跑：node tools/t192.js（印出 17 招各播幾個） */
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..'),h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const PLAN=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/fx/plan.json'),'utf8'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={newGame,bossFx,bossFxWatch,bossStrike,BATK,FXQ,fxK,setPlan(j){FXP=j;FXPst=1;for(const k in j.fx){FXIst[k]=1;FXI[k]={width:1,height:1}}},setScene(v){scene=v},set eco(v){ECO_USER=v},get state(){return state}};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>Date.now()},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[192] '+m);if(!c)fails++};
T.newGame();T.setScene('explore');T.setPlan(PLAN);T.eco=false;
const atks=Object.keys(T.BATK);
const ORIG=['cross','spin','hide','dive','flock','fake','thrust','wave','guard','combo','gale','decoy','fogdive','charge','tide','tide2'];
ok(atks.length>=63&&atks.every(a=>PLAN.boss[a]),`BATK ${atks.length} 招（第一季 16＋196 的 47）都有 plan`);
const used=new Set();for(const a in PLAN.boss)for(const t in PLAN.boss[a]){const v=PLAN.boss[a][t];if(Array.isArray(v))for(const e of v)used.add(e.k)}
const miss=[...used].filter(k=>!PLAN.fx[k]||!fs.existsSync(path.join(ROOT,'assets/fx',k+'.webp')));ok(!miss.length,'boss 用到的圖都有'+(miss.length?'；缺 '+miss:''));
const mk=a=>{const b={kind:'lord',x:400,y:600,face:1,def:{atk:[a]},atk:a,seq:1,mode:'wind',ph:1,cx:400,cy:600,B:{x0:0,x1:800,y0:0,y1:1200},rs:7,tx:500,ty:700};b.shape=T.BATK[a].shape(b,500,700);return b};
const rows=[];
for(const a of ORIG){const b=mk(a),S=PLAN.boss[a];const r=[a];for(const tm of ['wind','strike','aura']){T.FXQ.length=0;T.bossFx(b,tm);r.push(tm+' '+T.FXQ.length);
    const L=S[tm]||[];let want=0;for(const e of L){want+=e.along?(e.along*(b.shape&&b.shape.t==='cross'?2:1)):e.ringN?e.ringN:e.at==='decoys'?((b.shape&&b.shape.decoys)||[]).length:1}
    if(T.FXQ.length!==Math.min(want,40)){ok(false,`${a} ${tm}：播了 ${T.FXQ.length}、應該 ${want}`)}
    if(tm==='wind'&&T.FXQ.length&&!T.FXQ.every(p=>p.a===0.6))ok(false,a+' wind 透明度不是 0.6')}rows.push(r.join('  '))}
console.log(rows.join('\n'));
/* fit：圓的直徑 × fit；along＋dir 轉到直線方向 */
{const b=mk('spin');T.FXQ.length=0;T.bossFx(b,'strike');const p=T.FXQ[0];ok(Math.abs(p.size-240*1.15)<0.5,'spin：gseg 顯示邊長＝直徑 240 × 1.15');}
{const b=mk('thrust');T.FXQ.length=0;T.bossFx(b,'strike');const ang=Math.atan2(100,100);ok(Math.abs(T.FXQ[0].rot-ang)<1e-6&&T.FXQ.length===3,'thrust：pierce 沿線 2 個、轉 45°、尾端 hit2');}
{const b=mk('flock');T.FXQ.length=0;T.bossFx(b,'strike');const s=b.shape;ok(T.FXQ.every(p=>!(p.x>s.g0&&p.x<s.g1)),'flock：缺口那段不放');}
{const b=mk('tide');T.FXQ.length=0;T.bossFx(b,'strike');ok(T.FXQ.every(p=>Math.hypot(p.x-400,(p.y-600)*1.2)>210),'tide：繞圓周、中間安全的地方不放');}
/* rep：combo 三刀，每一刀都播 strike */
{const b=mk('combo');T.FXQ.length=0;for(let i=0;i<3;i++)T.bossStrike(b);ok(T.FXQ.length===3*(3+1),'combo 三刀各播一次');}
/* watch：同一個 seq 只播一次；guard 播 aura */
{const b=mk('cross');T.FXQ.length=0;T.bossFxWatch(b);T.bossFxWatch(b);ok(T.FXQ.length===1,'蓄力的特效同一刀只播一次');
  const g=mk('guard');g.mode='guard';g.shape=null;g.seq=5;T.FXQ.length=0;T.bossFxWatch(g);ok(T.FXQ.length===1&&g._fxA===5,'guard 播 aura');
  const l=mk('combo');l.mode='idle';l.ph=2;T.FXQ.length=0;T.bossFxWatch(l);ok(T.FXQ.length===2,'第二階段播 phase2');l.done=true;T.FXQ.length=0;T.bossFxWatch(l);ok(T.FXQ.length===1,'平靜播 calm');}
/* 省電：只播 strike 第一筆 */
{T.eco=true;const b=mk('wave');T.FXQ.length=0;T.bossFx(b,'wind');T.bossFx(b,'strike');ok(T.FXQ.length===5&&T.FXQ.every(p=>p.k==='wsplash'),'省電：只播 strike 第一筆');T.eco=false}
if(fails)process.exitCode=1;
