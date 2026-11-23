/* 第 209 節：武器鑲嵌（每一格指定造型、照順序）、城郊菜圃改到城鎮西邊、建築物用走的進去。由 tload.js 呼叫，也可以單獨跑：node tools/t209.js */
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..'),h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={newGame,WP_SHAPES,wpWant,wpSlot,wpStarFruits,wpStarDo,wpStarRow,wpStarHTML,wpTrDo,TOWN_SUB,TOWN_MAPS,townDoors,townDoorIn,regPrep,regBlocked,regExitAt,setScene(v){scene=v},set townMap(v){townMap=v},get townMap(){return townMap},get me(){return marketMe},set me(v){marketMe=v},get state(){return state}};';
const TQ=[];const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:(f)=>{TQ.push(f);return TQ.length},setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[209] '+m);if(!c)fails++};const run=()=>{while(TQ.length)try{TQ.shift()()}catch(e){}};
T.newGame();const st=T.state;
/* 209.1：順序表 */
const [A,B]=T.WP_SHAPES.corn,seq=[...Array(18)].map((_,i)=>T.wpWant('corn',i)===A?'A':'B').join('');
ok(seq==='ABA'+'BAB'+'AAB'+'BBA'+'ABB'+'BAA','槍的 18 格照表：'+seq.match(/.../g).join(' '));
/* 只列這一格要的造型；造型不對鑲不進去 */
const fruit=(crop,sp,t,n)=>({c:crop,k:`p${sp}|red|-`,t,q:{'2|1':n}});
st.fruits=[fruit('corn',A,0,3),fruit('corn',B,0,3)];st.weapons=[{crop:'corn',tier:1,st:[]}];
let L=T.wpStarFruits(st.weapons[0]);ok(L.length===1&&L[0].i===0,'第 1 格（星形）：只列星形的果實');
ok(T.wpStarDo(0,1).err&&!st.weapons[0].st.length,'第 1 格放甜甜圈：鑲不進去');
T.wpStarDo(0,0);L=T.wpStarFruits(st.weapons[0]);ok(st.weapons[0].st.length===1&&L.length===1&&L[0].i===1,'鑲好第 1 格後，第 2 格只列甜甜圈');
const row=T.wpStarRow(st.weapons[0]);ok(/wpst on/.test(row)&&/下一格：/.test(row)&&/先鑲前一格/.test(row)&&/鑲嵌 1／3/.test(row),'鑲嵌列：第 1 格已鑲、第 2 格下一格、第 3 格「先鑲前一格」、文字「鑲嵌 1／3」');
ok(!/放星星|顆星/.test(T.wpStarHTML(0,st.weapons[0])),'鑲嵌頁不再出現「放星星」「顆星」');
/* 舊星星照留 */
st.weapons[0].st=[B,B,B];ok(T.wpSlot(st.weapons[0])===null&&st.weapons[0].st.join()===[B,B,B].join(),'已經鑲好的舊星星照原本造型保留');
/* 轉移照每一格指定的造型 */
vm.runInContext("wpTrOk=()=>null;wpTrCost=()=>({coins:0,gold:0})",ctx);st.weapons=[{crop:'corn',tier:2,st:[A,B,A,B,A,B]},{crop:'tomato',tier:1,st:[]}];T.wpTrDo(0,1);
ok(st.weapons[1].st.join()===[0,1,2,3,4,5].map(i=>T.wpWant('tomato',i)).join(),'轉移：照番茄劍每一格指定的造型');
/* 209.2：城鎮西側出口、菜圃右邊出口 */
const PM=T.regPrep('town','plaza');ok(T.regExitAt(PM,PM.B.x0-5,432).to==='garden'&&!T.regExitAt(PM,PM.B.x1+5,432),'城鎮往左（西側）進菜圃');
const G=T.TOWN_SUB.garden;ok(T.regExitAt(G,G.B.x1+5,710).to==='plaza','菜圃往右回城鎮');
T.setScene('market');T.townMap='garden';vm.runInContext("townMapGo('plaza')",ctx);run();ok(T.townMap==='plaza'&&T.me.x<PM.B.x0+40,'從菜圃回來站在城鎮的西邊（x '+Math.round(T.me.x)+'）');
/* 209.3：門墊走進去、出來站外面、1 秒內不觸發 */
T.townMap='plaza';const D=T.townDoors().filter(d=>d.t==='in');let walk=0;for(const d of D)if(!T.regBlocked(PM,d.x,d.y)||!T.regBlocked(PM,d.x,d.y+4))walk++;ok(D.length===2&&walk===2,'教會、研究所門口的門墊踩得到');
const ch=D.find(d=>d.to==='church_hall');T.me={x:ch.x,y:ch.y+2};vm.runInContext('townDoorCool=0;townSubTick()',ctx);run();ok(T.townMap==='church_hall','踩上教會門墊：走進大殿');
vm.runInContext("townMapGo('plaza')",ctx);run();ok(T.townMap==='plaza'&&!T.townDoorIn(),'從大殿出來：站在門墊外面');
T.me={x:ch.x,y:ch.y};vm.runInContext('townSubTick()',ctx);run();ok(T.townMap==='plaza','出來 1 秒內踩到門墊也不會被吸回去');
ok(!/進去<\/text>|出去<\/text>/.test(h.replace(/function townDoorBtn\(\)\{return '';[^\n]*/,'')),'「進去」「出去」按鈕拿掉');
if(fails)process.exitCode=1;
