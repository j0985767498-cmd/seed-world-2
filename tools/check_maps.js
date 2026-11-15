/* 探索地圖檢查（第 53、54 節）：在專案資料夾執行 node tools/check_maps.js <地區> */
/* 53、54 檢查：node vmv2.js <地區> [index.html]
   1. 從每個抵達點走得到所有出口、植株點、道具點（10px 格子 BFS，用 regBlocked）
   2. 小路中心線上沒有擋路（水上要有橋）
   3. 每個 walks（橋、石階、木棧道）有小路從兩側接上（中心線經過 walks 的範圍、且兩端外 30px 內有路）
   4. 門口前 50px 內有路 */
const fs=require('fs'),vm=require('vm');
const bk=process.argv[2],file=process.argv[3]||require('path').join(__dirname,'..','index.html');
if(!bk){console.log('用法：node tools/check_maps.js <grass|forest|marsh|desert|snow> [index.html] [只檢查這張圖的 id]');process.exit(1)}
const h=fs.readFileSync(file,'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=`;globalThis.T={newGame,REGION_MAPS,regPrep,regBlocked,regExitAt,regArrival,v2spline,regPlants,regItems};`;
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);const T=ctx.T;T.newGame();
let bad=0;const say=(...a)=>{bad++;console.log('  ✗',...a)};
const ids=Object.keys(T.REGION_MAPS[bk]).filter(id=>!process.argv[4]||id===process.argv[4]);
for(const id of ids){const M=T.regPrep(bk,id);if(!M.v2){console.log(id,'(舊畫法，略過)');continue}
  const S=8,GW=Math.ceil(M.W/S),GH=Math.ceil(M.H/S),seen=new Uint8Array(GW*GH),q=[];
  const starts=M.exits.filter(e=>!e.need).map(e=>e.to==='farm'?null:T.regArrival(bk,id,e.to)).filter(Boolean);
  const fe=M.exits.find(e=>e.to==='farm');if(fe)starts.push([fe.c,M.B.y1-18]);
  for(const [x,y] of starts){if(T.regBlocked(M,x,y))say(id,'抵達點擋路',x,y);const k=Math.round(y/S)*GW+Math.round(x/S);if(!seen[k]){seen[k]=1;q.push(k)}}
  const exitHit=new Set();
  while(q.length){const k=q.pop(),gx=k%GW,gy=(k/GW)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=gx+dx,ny=gy+dy;const X=nx*S,Y=ny*S;
      const ex=T.regExitAt(M,X,Y);if(ex){exitHit.add(ex.to);continue}
      if(nx<0||ny<0||nx>=GW||ny>=GH)continue;const kk=ny*GW+nx;if(seen[kk])continue;if(T.regBlocked(M,X,Y))continue;seen[kk]=1;q.push(kk)}}
  /* 門：門框內任一點走得到就算 */
  for(const e of M.exits){if(e.door){let ok=false;for(let x=e.door[0];x<=e.door[2];x+=4)for(let y=e.door[1];y<=e.door[3]+30;y+=4){const k=Math.round(y/S)*GW+Math.round(x/S);if(seen[k])ok=true}if(ok)exitHit.add(e.to)}}
  for(const e of M.exits)if(!e.trig&&!e.need&&!exitHit.has(e.to))say(id,'走不到出口',e.to);
  const reach=([x,y])=>{for(let r=0;r<=2;r++)for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++){const k=(Math.round(y/S)+b)*GW+Math.round(x/S)+a;if(seen[k])return true}return false};
  M.spawns.forEach((p,i)=>{if(!reach(p))say(id,'走不到植株點',i,p);if(T.regBlocked(M,p[0],p[1]))say(id,'植株點擋路',p)});
  M.items.forEach((p,i)=>{if(!reach(p))say(id,'走不到道具點',i,p)});
  /* 小路上沒有擋路 */
  for(const [pi,p] of M._P.entries()){let n=0,first=null;for(const [x,y] of p.rb.pts){if(x<M.B.x0+2||x>M.B.x1-2||y<M.B.y0+2||y>M.B.y1-2)continue;if(T.regBlocked(M,x,y)){n++;if(!first)first=[x|0,y|0]}}if(n)say(id,'小路',pi,'有',n,'點擋路，第一點',first)}
  /* walks 兩側有路：互相重疊的 walks 當成一條（木棧道、踏腳石），看整條的兩端 */
  {const W=M.wlk,par=W.map((_,i)=>i),find=i=>par[i]===i?i:(par[i]=find(par[i]));
   for(let i=0;i<W.length;i++)for(let j=i+1;j<W.length;j++)if(W[i][0]<W[j][2]&&W[j][0]<W[i][2]&&W[i][1]<W[j][3]&&W[j][1]<W[i][3])par[find(i)]=find(j);
   const comps={};W.forEach((w,i)=>{(comps[find(i)]=comps[find(i)]||[]).push(w)});
   const near=(x,y,r)=>M._P.some(p=>p.rb.pts.some(q=>Math.hypot(q[0]-x,q[1]-y)<(r||40)));
   for(const g of Object.values(comps)){
     const stairT=M._T&&M._T.find(t=>g.some(w=>{const cx=(w[0]+w[2])/2,cy=(w[1]+w[3])/2;return cx>t.gap[0]&&cx<t.gap[1]&&Math.abs(cy-(t.E(cx)+t.H/2))<t.H}));
     if(stairT){if(!near(stairT.bot[0],stairT.bot[1],30))say(id,'石階底下沒有路接上');continue}
     {const c=[(g[0][0]+g[0][2])/2,(g[0][1]+g[0][3])/2];if(M.exits.some(e=>e.hid&&e.side&&Math.hypot((e.side==='w'?M.B.x0:e.side==='e'?M.B.x1:e.c)-c[0],(e.side==='n'?M.B.y0:e.side==='s'?M.B.y1:e.c)-c[1])<90))continue}/* 秘境的隱藏缺口不用有路 */
     let e1,e2;
     if(g.length===1){const w=g[0],cx=(w[0]+w[2])/2,cy=(w[1]+w[3])/2,wide=w[2]-w[0]>w[3]-w[1];e1=wide?[w[0]-10,cy]:[cx,w[1]-10];e2=wide?[w[2]+10,cy]:[cx,w[3]+10]}
     else{let best=-1;const c=g.map(w=>[(w[0]+w[2])/2,(w[1]+w[3])/2]);for(const p of c)for(const q of c){const d=Math.hypot(p[0]-q[0],p[1]-q[1]);if(d>best){best=d;e1=p;e2=q}}}
     if(!near(...e1))say(id,'橋／步道的一端沒有路接上',e1.map(v=>v|0));if(!near(...e2))say(id,'橋／步道的一端沒有路接上',e2.map(v=>v|0));
     for(const e of [e1,e2])if(T.regBlocked(M,e[0],e[1]))say(id,'橋／步道的端點擋路（沒落在岸上）',e.map(v=>v|0))}}
  for(const e of M.exits)if(e.door&&!M.noPath){const x=(e.door[0]+e.door[2])/2,y=e.door[3]+20;if(!M._P.some(p=>p.rb.pts.some(q=>Math.hypot(q[0]-x,q[1]-y)<60))&&!(M.worn||[]).some(w=>Math.hypot(w[0]-x,w[1]-y)<60))say(id,'門口沒有路也沒有踩踏痕跡',e.to)}
  console.log(id,'物件',M._objs.length,'可走格',seen.reduce((a,b)=>a+b,0));
}
console.log(bad?('問題 '+bad):'全部通過');
