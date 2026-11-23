/* 第 210 節：城鎮改用畫好的地面——出口、死路、攤位前、建築門口走得到、主要道路沒有被擋。由 tload.js 呼叫，也可以單獨跑：node tools/t210.js */
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..'),h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={newGame,TOWN_MAPS,TOWN_BLD,TOWN_NPC,STALLS,WORLD,GATE,regPrep,regBlocked,regExitAt,regArrival,townFront,townNpcs,setScene(v){scene=v}};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[210] '+m);if(!c)fails++};
T.newGame();T.setScene('market');
const M=T.regPrep('town','plaza');
ok(M.W===800&&M.H===1334&&T.WORLD.market.H===1334&&fs.existsSync(path.join(ROOT,M.ground)),'城鎮 800×1334、地面圖 '+M.ground);
/* 從南入口（農場來）走得到的地方：5px 格子 */
const G=5,seen=new Set(),st=T.regArrival('town','plaza','farm'),q=[[Math.round(st[0]/G),Math.round(st[1]/G)]];seen.add(q[0].join());
while(q.length){const [gx,gy]=q.pop();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=gx+dx,ny=gy+dy,k=nx+','+ny;if(seen.has(k))continue;const x=nx*G,y=ny*G;if(x<M.B.x0||x>M.B.x1||y<M.B.y0||y>M.B.y1||T.regBlocked(M,x,y))continue;seen.add(k);q.push([nx,ny])}}
const reach=(x,y)=>{for(let r=0;r<=12;r+=G)for(const [dx,dy] of [[0,0],[r,0],[-r,0],[0,r],[0,-r]])if(seen.has(Math.round((x+dx)/G)+','+Math.round((y+dy)/G)))return true;return false};
/* 出口 */
const ew=T.regExitAt(M,M.B.x0-5,432),es=T.regExitAt(M,400,M.B.y1+5);ok(ew&&ew.to==='garden'&&reach(M.B.x0+5,432),'西出口（y 432）走得出去、往城郊菜圃');ok(es&&es.to==='farm'&&reach(400,M.B.y1-5),'南出口（x 400）走得出去、往農場');
ok(!T.regExitAt(M,M.B.x1+5,290)&&!T.regExitAt(M,M.B.x1+5,432),'東邊沒有出口（上方橫路東端是死路）');
ok(!T.regExitAt(M,M.B.x0-5,300)&&!T.regExitAt(M,M.B.x0-5,700),'西邊除了道路那一段都是樹籬');
/* 攤位前、建築門口、NPC */
const bad=[];T.STALLS.forEach(([x,y],i)=>{if(!reach(x,y+34))bad.push('攤位'+(i+1));if(y<487||y>842||x-40<99||x+40>703)bad.push('攤位'+(i+1)+'不在廣場')});
for(const b of T.TOWN_BLD){const [fx,fy]=T.townFront(b);if(!reach(fx,fy))bad.push(b.n+'門口')}
for(const p of T.TOWN_NPC.filter(p=>!p.map&&(!p.cond||p.cond===undefined))){if(!p.x)continue;if(!reach(p.x,p.y+24))bad.push(p.n)}
ok(!bad.length,'8 個攤位前、9 個建築門口、NPC 都走得到'+(bad.length?'：'+bad.join('、'):''));
/* 主要道路沒有被擋：沿中線取點 */
const roads=[['上方橫路（東端的盆栽是故意擋的，不算）',[...Array(28)].map((_,i)=>[60+i*22,290])],['西側道路',[...Array(14)].map((_,i)=>[62+i*20,432])],['中央直路',[...Array(40)].map((_,i)=>[400,450+i*22])],['下方橫路',[...Array(20)].map((_,i)=>[172+i*22,1088])],['市集中間走道',[...Array(16)].map((_,i)=>[400,490+i*22])]];
const rb=[];for(const [n,L] of roads){const b=L.filter(([x,y])=>x<=M.B.x1&&T.regBlocked(M,x,y));if(b.length)rb.push(n+' '+b.slice(0,3).map(p=>p.join(',')).join(' '))}
ok(!rb.length,'主要道路沒有物件擋住'+(rb.length?'：'+rb.join('；'):''));
ok(T.GATE.market[1]>1290&&Math.abs(T.GATE.market[0]-400)<5,'入口拱門在中央直路底端');
if(fails)process.exitCode=1;
