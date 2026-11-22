/* 第 184.7 節：技能平衡模擬。node tools/sim184.js [階]（不給就跑 1、3、6 階）
   讀 index.html 的 SKILLS、WEAPONS、pAtk（改數字只改表）。模型（不是跑真的遊戲迴圈）：
   - 玩家在原點面向右；草原怪群 3 隻在 r100 內（(40,0)、(62,32)、(55,-40)），單一僕人在 (60,0)（一個點）；怪物血量無限、不會死、不會被推遠（推開、拉近只影響下一招的位置：一律假設下一招時又回到原位）。
   - 普通攻擊：照 W.cd 自動打；每下打到幾隻照武器的判定（錘 r50、浮游砲 3 顆各 r35 落在目標 r25 內…），期望爆擊（5%＋W.crit，×1.5＋critDmg）。
   - 技能冷卻好就放；範圍招照幾何數打到幾隻；隨機落點的用固定種子跑 2000 次取平均。
   - 被打：怪群每 1.7 秒被一隻打一次（3 隻）＝ 1.76 次／秒、僕人 0.35 次／秒（雷霆護身的落雷用這個算）。 */
const fs=require('fs'),vm=require('vm'),path=require('path');
const h=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={SKILLS,WEAPONS,pAtk,SK_ROLL};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console:{log(){},warn(){},error(){}},setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const {SKILLS,WEAPONS,pAtk}=ctx.T;
const LV=20,SEC=60,ATK=pAtk(LV);
let seed=1;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const GROUP=[[40,0],[62,32],[55,-40]],SOLO=[[60,0]];
const hyp=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const inR=(T,c,r)=>T.filter(p=>hyp(p,c)<=r).length;
const inRect=(T,o,d,L,W)=>T.filter(p=>{const a=(p[0]-o[0])*d[0]+(p[1]-o[1])*d[1],q=Math.abs(-(p[0]-o[0])*d[1]+(p[1]-o[1])*d[0]);return a>=-12&&a<=L&&q<=W/2}).length;
const MC=(f,n=2000)=>{seed=7;let s=0;for(let i=0;i<n;i++)s+=f();return s/n};
function nearest(T){return T.reduce((a,p)=>hyp(p,[0,0])<hyp(a,[0,0])?p:a,T[0])}
function dirTo(p){const d=hyp(p,[0,0]);return [p[0]/d,p[1]/d]}
/* 普通攻擊每一下打到幾隻（期望） */
function normHits(W,T){const t=nearest(T),k=W.k;
  if(k==='hammer')return inR(T,t,50);
  if(k==='scythe')return T.filter(p=>hyp(p,[0,0])<=W.range&&p[0]>=-4).length;
  if(k==='axe')return 1+0.25*0.5;
  if(k==='pod')return (W.shots||3)*MC(()=>{const a=rnd()*Math.PI*2,r=rnd()*25,x=[t[0]+Math.cos(a)*r,t[1]+Math.sin(a)*r];return inR(T,x,35)},400);
  if(k==='fan'){const d=dirTo(t);return Math.max(1,inRect(T,[0,0],d,W.range*1.2,36))}
  return 1}
const critE=W=>1+(0.05+(W.crit||0))*(0.5+(W.critDmg||0));
function run(crop,tier,T,hitRate){const W=WEAPONS[crop],S=SKILLS[crop],tk=Math.pow(1.3,tier-1),ce=critE(W);
  const base=ATK*tk,nh=normHits(W,T),normPer=base*W.mul*ce*nh;let normal=0,skill=0;
  const s1={...S.s1,up:tier>=4},s2=tier>=6?{...S.s2,...S.aw,aw:1}:tier>=3?{...S.s2}:null,V=(d,k)=>d.up&&d[k+'4']!=null?d[k+'4']:d[k];
  /* 普通攻擊：時間軸（集中砲火、衛星砲、雷神降臨、影步會改） */
  const buffs=[];/* {from,to,type} */
  const sk=(d)=>{const t=nearest(T),dd=dirTo(t),me=[0,0];const H=(n,mul)=>n*base*mul*ce;
    switch(d.id){
      case 'thrust':return H(inRect(T,me,dd,V(d,'len')+20,d.w),d.mul);
      case 'xcut':case 'heavenx':{const one=(k)=>{const L=d.L*k,Wd=d.W*k,c=[dd[0]*L/2,dd[1]*L/2];return T.filter(p=>{const a1=inRect([p],[c[0]-dd[0]*L/2,c[1]-dd[1]*L/2],dd,L,Wd),a2=inRect([p],[c[0]+dd[1]*L/2,c[1]-dd[0]*L/2],[-dd[1],dd[0]],L,Wd);return a1||a2}).length};return d.id==='xcut'?H(one(1),d.mul):H(one(1)*2+one(2),d.mul)}
      case 'whirl':return H(inR(T,me,d.r)*V(d,'hits'),d.mul);
      case 'shadow':return 0;/* 之後 3 下必定爆擊：在普通攻擊那裡算 */
      case 'thousand':return Math.min(d.max,inR(T,me,d.range))*base*d.mul*(1.5+(W.critDmg||0));
      case 'gale':return H(inRect(T,me,dd,d.L,V(d,'W')),d.mul);
      case 'heal':case 'bloom':return 0;
      case 'starfall':return H(inR(T,t,V(d,'r')),d.mul);
      case 'meteor':return H(MC(()=>{let s=0;const c=[dd[0]*d.area*0.55,dd[1]*d.area*0.55];for(let i=0;i<d.n;i++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*d.area*0.5;s+=inR(T,[c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r],d.r)}return s}),d.mul);
      case 'comet':return H(inR(T,t,d.r),d.mul);
      case 'strafe':{const n=Math.floor(V(d,'dur')/d.every),ang=Math.atan2(dd[1],dd[0]);return H(n*MC(()=>{const an=ang+(rnd()-.5)*d.arc*Math.PI/180,u=[Math.cos(an),Math.sin(an)];return T.some(p=>{const a=p[0]*u[0]+p[1]*u[1],q=Math.abs(-p[0]*u[1]+p[1]*u[0]);return a>0&&a<=d.len&&q<=(T.length===1?24:14)})?1:0}),d.mul)}
      case 'popshot':return H(inR(T,t,d.r),d.mul);
      case 'popstorm':{let s=inR(T,t,d.r)*d.mul;for(let i=0;i<d.split;i++){const a=i/d.split*Math.PI*2;s+=inR(T,[t[0]+Math.cos(a)*d.sd,t[1]+Math.sin(a)*d.sd],d.sr)*d.smul}return base*ce*s}
      case 'wisp':{const n=inR(T,me,V(d,'r'));return H(n,d.mul)+n*0.3*base}
      case 'reap':return H(inR(T,me,d.r),d.mul);
      case 'hades':{const n=inR(T,me,d.r);return H(n,d.mul)+H(n*Math.floor(d.gate/d.tick),d.gmul)}
      case 'quake':return H(inR(T,me,V(d,'r')),d.mul);
      case 'wall':{const n=inRect(T,[dd[0]*30,dd[1]*30],dd,d.front,d.W);return H(n*2,d.mul)}
      case 'jail':{return H(inR(T,t,d.r),d.mul)}
      case 'thunder':return H(inR(T,t,d.r),d.mul)+H(V(d,'bolts'),d.bolt);
      case 'aegis':return H(hitRate*d.dur/1000,d.bolt);
      case 'thor':case 'focus':case 'sat':return 0;
      case 'saturate':return H(MC(()=>{let s=0;for(let i=0;i<d.n;i++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*d.area;s+=inR(T,[t[0]+Math.cos(a)*r,t[1]+Math.sin(a)*r],d.r)}return s}),d.mul)}
    return 0};
  const casts={s1:0,s2:0};
  for(const [d,key] of [[s1,'s1'],[s2,'s2']]){if(!d)continue;for(let t=0;t<SEC;t+=d.cd){casts[key]++;skill+=sk(d);
    if(d.id==='focus')buffs.push({from:t,to:t+V(d,'dur')/1000,type:'focus'});if(d.id==='sat')buffs.push({from:t,to:t+d.dur/1000,type:'sat'});if(d.id==='thor')buffs.push({from:t,to:t+d.dur/1000,type:'thor',bolt:d.bolt});if(d.id==='shadow')buffs.push({at:t,type:'crit',n:d.crits})}}
  /* 普通攻擊時間軸（每 10ms 一格） */
  let t=0,critLeft=0;const crits=buffs.filter(b=>b.type==='crit').map(b=>b.at);let ci=0;
  while(t<SEC){const on=ty=>buffs.find(b=>b.type===ty&&t>=b.from&&t<b.to);while(ci<crits.length&&crits[ci]<=t){critLeft=3;ci++}
    const sat=on('sat')?2:1;let per=normPer*(W.k==='pod'?sat:1);if(critLeft>0){per=per/ce*(1.5+(W.critDmg||0));critLeft--}
    normal+=per;const th=on('thor');if(th)skill+=base*th.bolt*ce;
    t+=W.cd/1000*(on('focus')?0.5:1)}
  return {normal,skill,total:normal+skill,casts}}
const tiers=process.argv[2]?[+process.argv[2]]:[1,3,6];
const out=[];
for(const tier of tiers)for(const [name,T,rate] of [['怪群 3 隻',GROUP,1.76],['單一僕人',SOLO,0.35]]){
  const R=Object.keys(SKILLS).map(c=>({c,n:WEAPONS[c].n,...run(c,tier,T,rate)})),avg=R.reduce((s,r)=>s+r.total,0)/R.length;
  out.push(`\n=== ${tier} 階・${name}・Lv ${LV}・${SEC} 秒（平均 ${Math.round(avg).toLocaleString()}）===`);
  for(const r of R)out.push(`${r.n.padEnd(6,'　')} 總 ${Math.round(r.total).toLocaleString().padStart(10)}  技能 ${(r.skill/r.total*100).toFixed(0).padStart(3)}%  對平均 ${((r.total/avg-1)*100).toFixed(0).padStart(4)}%`);
  const mx=Math.max(...R.map(r=>r.total/avg-1)),mn=Math.min(...R.map(r=>r.total/avg-1));out.push(`最大 ${(mx*100).toFixed(0)}%、最小 ${(mn*100).toFixed(0)}%  ${mx<=0.15&&mn>=-0.15?'在 ±15% 內':'超出 ±15%'}`)}
console.log(out.join('\n'));
