/* 第 205（3D 預設關）、206、207 節：城鎮的子地圖（城郊菜圃）、室內地圖（小木屋、穗光教會大殿、分子育種研究所）。由 tload.js 呼叫，也可以單獨跑：node tools/t207.js */
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..'),h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={newGame,TOWN_SUB,TOWN_MAPS,TOWN_BLD,TOWN_NPC,townNpcs,townMove,townDoorAt,townDoors,townSubWorld,regBlocked,regExitAt,regPrep,altarPos,ALTAR_K,bldFront,WORLD,setScene(v){scene=v},set townMap(v){townMap=v},get townMap(){return townMap},get me(){return marketMe},set me(v){marketMe=v},get state(){return state}};';
const TQ=[];const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:(f,ms)=>{TQ.push(f);return TQ.length},setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[207] '+m);if(!c)fails++};const run=()=>{while(TQ.length)try{TQ.shift()()}catch(e){}};
T.newGame();T.setScene('market');const st=T.state;st.lv=30;st.mq2={i:5};
for(const f of ['assets/ground/town_garden.jpg','assets/town/church.png','assets/town/institute.png','assets/hut/hut_bed.png','assets/church/altar_lit.png','assets/lab/machine.png'])ok(fs.existsSync(path.join(ROOT,f)),'圖在：'+f);
/* 廣場：東側出口往菜圃、建築位置 */
const PM=T.regPrep('town','plaza');const e=T.regExitAt(PM,PM.B.x1+5,590);ok(e&&e.to==='garden','廣場東側（y 590）出口往城郊菜圃');ok(T.regExitAt(PM,400,PM.B.y1+5).to==='farm','南邊照舊回農場（城鎮加高到 '+T.TOWN_MAPS.plaza.H+'）');
const ch=T.TOWN_BLD.find(b=>b.id==='church'),ins=T.TOWN_BLD.find(b=>b.id==='institute'),hall=T.TOWN_BLD.find(b=>b.id==='hall');ok(ch&&ch.x===400&&ch.y<520&&ins&&hall,'教會在噴水池北邊；研究所、農會在加高出來的那一條');
/* 菜圃：圍籬只能從上邊左側缺口進出 */
T.townMap='garden';const G=T.TOWN_SUB.garden;ok(T.regBlocked(G,200,747)&&T.regBlocked(G,450,747)&&!T.regBlocked(G,300,747),'木圍籬擋住，上邊左側缺口（x 300）可以走');
ok(!T.regBlocked(G,300,900)&&T.regBlocked(G,106,900),'菜畦可以走、左邊圍籬擋住');ok(T.regExitAt(G,G.B.x1+5,710).to==='plaza'&&!T.regExitAt(G,G.B.x1+5,400),'右邊樹籬缺口（y 710）回城鎮，其他地方不行');
/* 門口 60 內出現「進去」 */
T.me={x:222,y:340};ok(T.townDoorAt()&&T.townDoorAt().to==='garden_hut','小木屋門口 60 內：進去');T.me={x:400,y:500};ok(!T.townDoorAt(),'離門遠：沒有按鈕');
/* 室內：家具有碰撞、門口出去 */
const H=T.TOWN_SUB.garden_hut;ok(H.indoor&&H.blk.length===6&&T.regExitAt(H,300,H.B.y1+5).to==='garden','小木屋：6 件家具有碰撞、門口出去回菜圃');
T.townMap='garden_hut';T.me={x:300,y:300};const W1=T.townSubWorld();ok(/data-hutsee="watch"/.test(W1)&&/data-hutsee="photo"/.test(W1),'手錶、照片可以調查');
/* 大殿：九座祭壇、神父在大殿 */
T.townMap='church_hall';T.me={x:450,y:700};const W2=T.townSubWorld();ok((W2.match(/data-altar="/g)||[]).length===9&&T.ALTAR_K.length===9,'大殿：九座祭壇都點得到');
const a=T.ALTAR_K.map((_,i)=>T.altarPos(i));ok(a[4][1]<a[0][1]&&Math.abs(a[0][1]-a[8][1])<1,'祭壇排成開口朝下的半圓（中間最上面）');
ok(T.townNpcs().map(p=>p.id).join()==='theo','提歐神父在大殿');T.townMap='plaza';ok(!T.townNpcs().some(p=>p.id==='theo'||p.id==='wien'),'廣場上不再有神父、所長');
T.townMap='institute_lab';T.me={x:400,y:500};const W3=T.townSubWorld();ok(/data-hutsee="machine"/.test(W3)&&T.townNpcs().some(p=>p.id==='wien'),'研究所：維恩在、小機器可以調查');
/* 換地圖：從大殿出去站在教會門口 */
T.townMap='church_hall';vm.runInContext("townMapGo('plaza')",ctx);run();const [fx,fy]=T.bldFront('church');ok(T.townMap==='plaza'&&Math.abs(T.me.x-fx)<1&&Math.abs(T.me.y-fy-18)<1&&T.WORLD.market.H===T.TOWN_MAPS.plaza.H,'從大殿出去：回到教會門口、相機範圍換回城鎮');
vm.runInContext("townMapGo('institute_lab')",ctx);run();ok(T.townMap==='institute_lab'&&T.WORLD.market.W===800&&T.WORLD.market.H===700,'進研究所：相機範圍 800×700');
/* 走去找神父：在廣場會先走到教會門口再進去 */
T.townMap='plaza';T.me={x:400,y:600};let walked=null;ctx.walkTo=undefined;vm.runInContext("walkTo=function(x,y,fn){globalThis.__wk=[x,y];fn&&fn()}",ctx);vm.runInContext("townGo('npc','theo')",ctx);run();ok(T.townMap==='church_hall','走去找提歐神父：先進教會');
/* 205：3D 預設關、不載 Three.js */
ok(vm.runInContext('W3D_USER',ctx)===false&&vm.runInContext('W3D_ST',ctx)===0,'205：3D 預設關（沒存過開關＝關），沒有開始載 Three.js');
if(fails)process.exitCode=1;
