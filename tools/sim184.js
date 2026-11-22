/* 第 184.7／186.1 節：武器平衡模擬（跑真的 wpnFire／skCast／wpnStep，用假的時鐘）。
   node tools/sim184.js            → 6 張表（1 階 0 星、3 階 9 星、6 階 18 星 × 單一目標、怪群），實際／目標／差距（劍＝100）
   也可以 require：module.exports.measure(patch) 給調數字用（patch(T) 先改 WEAPONS／SKILLS 再跑）。
   假設（寫在報告裡）：玩家站著不動，主要目標在 25（每把武器都打得到），怪群另外兩隻在 (45,28)、(40,-34)；怪不會動、不會死，被推、被拉之後每 20ms 放回原位；
   單一目標用一般怪代替僕人（對主僕「推開、拉近、瞬移無效」不影響傷害）；被怪打（雷霆護身的落雷）每 0.6 秒一次（怪群）／2.8 秒一次（單一）；神之子不出手；Lv 20、60 秒、冷卻好就放。 */
const fs=require('fs'),vm=require('vm'),path=require('path');
const h=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const JS=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
function boot(){let clock=1e12,seed=12345;const Q=[];const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
  class FD extends Date{static now(){return clock}}
  const M2=Object.create(Math);M2.random=rnd;
  const js=JS+';globalThis.T={newGame,wpnFire,wpnStep,skCast,curWpn,WEAPONS,SKILLS,WP_TARGET,WP_SHAPES,skIv,pDamage,setMon(L){MON_RT={list:L,due:[],xs:null}},setScene(v){scene=v},get state(){return state},curMe,set pHP(v){pHP=v},pMax,get WPN_PROJ(){return WPN_PROJ},reset(){SKC={s1:0,s2:0,roll:0};SKB.inv=0;SKB.red=[];SKB.aegis=null;SKB.thor=null;SKB.focus=0;SKB.sat=0;SKB.crits=0;SKB.hot=null;WPN_PROJ.length=0;monSwingAt=0}};';
  const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console:{log(){},warn(){},error(){}},setTimeout:(f,ms)=>{Q.push({at:clock+(ms||0),f});return Q.length},setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math:M2,Date:FD,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>clock},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
  ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
  const T=ctx.T;T.newGame();T.setScene('explore');T.state.lv=20;
  return {T,tick(ms){const end=clock+ms;for(;;){Q.sort((a,b)=>a.at-b.at);if(!Q.length||Q[0].at>end)break;const q=Q.shift();clock=Math.max(clock,q.at);try{q.f()}catch(e){}}clock=end},get clock(){return clock},clearQ(){Q.length=0},reseed(v){seed=v}}}
const E=boot();const T=E.T;
const LAY={single:[[25,0]],group:[[25,0],[45,28],[40,-34]]};
const CFG=[[1,0],[3,9],[6,18]];
function run(crop,tier,stars,lay,secs){secs=secs||60;E.clearQ();E.reseed(777);T.reset();const st=T.state,S2=T.WP_SHAPES[crop]||[2,4];st.weapons=[{crop,tier,st:Array.from({length:stars},(_,i)=>S2[i%2])}];st.wpn=0;
  const me=T.curMe(),HP=1e13,L=LAY[lay].map(([x,y])=>({k:'slime',x:500+x,y:500+y,hp:HP,max:HP,face:-1,el:null,ox:500+x,oy:500+y}));T.setMon(L);
  const w=T.curWpn(),W=w.W,rate=lay==='group'?600:2800;let swing=0,hitAt=0,skill0=0;const t0=E.clock;
  for(let t=0;t<secs*1000;t+=20){me.x=500;me.y=500;for(const m of L){m.x=m.ox;m.y=m.oy;m.dead=false}T.pHP=T.pMax()*10;
    const now=E.clock;if(now>=swing){swing=now+W.cd*T.skIv();T.wpnFire(T.curWpn(),{m:L[0],i:0})}
    if(now-hitAt>=rate){hitAt=now;T.pDamage(60,L[0])}
    const before=L.reduce((s,m)=>s+(HP-m.hp),0);T.skCast(1);T.skCast(2);skill0+=L.reduce((s,m)=>s+(HP-m.hp),0)-before;/* 放招當下的傷害（延遲、子彈的算在總數，不在這裡） */
    E.tick(20);T.wpnStep(0.02)}
  return L.reduce((s,m)=>s+(HP-m.hp),0)}
function measure(patch){if(patch)patch(T);const out={};for(const [tier,stars] of CFG){const k=tier+'/'+stars;out[k]={};for(const lay of ['single','group']){const R={};for(const c of Object.keys(T.WP_TARGET))R[c]=run(c,tier,stars,lay);const ref=R.tomato;out[k][lay]={};for(const c in R)out[k][lay][c]=R[c]/ref*100}}return out}
module.exports={measure,T,run,CFG};
if(require.main===module){const LIMIT=15;/* 186 補：合格線 ±15% */const M=measure();const lines=[];let bad=0;
  for(const [tier,stars] of CFG){const k=tier+'/'+stars;for(const [lay,li] of [['single',0],['group',1]]){lines.push(`\n=== ${tier} 階 ${stars} 星・${lay==='single'?'單一目標':'怪群 3 隻'}（劍＝100）===`);
    for(const c of Object.keys(T.WP_TARGET)){const a=M[k][lay][c],g=T.WP_TARGET[c][li],d=(a/g-1)*100;if(Math.abs(d)>LIMIT)bad++;lines.push(`${T.WEAPONS[c].n.padEnd(6,'　')} 實際 ${a.toFixed(0).padStart(4)}  目標 ${String(g).padStart(4)}  差距 ${(d>=0?'+':'')+d.toFixed(0)}%${Math.abs(d)>LIMIT?'  ✗':''}`)}}}
  lines.push(`\n${bad?`有 ${bad} 格超出 ±${LIMIT}%`:`全部在 ±${LIMIT}% 內`}`);console.log(lines.join('\n'))}
