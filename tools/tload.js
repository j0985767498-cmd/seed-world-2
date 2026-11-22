/* 讀檔往返：帶異質基因的種子包、植株，載入 → 存檔 → 再載入，每一份基因要和原本完全相同。
   用法：node tools/tload.js [index.html 的路徑]（預設專案裡的；也可以拿舊版本測，例如 git show a368f29:index.html 存成檔案） */
const fs=require('fs'),vm=require('vm');
const src=process.argv[2]||require('path').join(__dirname,'..','index.html');
const h=fs.readFileSync(src,'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={newGame,makeWild,plantFromLot,packState,loadSave,repairState,lookNorm,lookPack,lookUnpack,char3On,charG,get state(){return state},set state(v){state=v}};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const J=x=>JSON.parse(JSON.stringify(x));
/* 每一組因子都是兩份不同；花紋顏色用 white／gold、形式用 0／2（123 之後的合法值，遷移不會動） */
const het=(crop,i)=>{const g=J(T.makeWild(crop,'grass',false));g.b=[0,1+(i%2)];g.sp=[0,3+(i%3)];g.pw=[1,0];g.c=[['red','yellow','green'][i%3],'white'];g.pc=['white','gold'];g.pf=[0,2];g.n.size=g.n.size.map((x,k)=>[(20+k)/100,(70-k)/100]);g.n.perf=g.n.perf.map((x,k)=>[(10+2*k)/100,(90-2*k)/100]);return g};
T.newGame();const st=T.state;
st.lots.push({id:1,lid:'L1',crop:'tomato',name:'甲',source:'x',m:het('tomato',0),f:het('tomato',1),seeds:[het('tomato',2),het('tomato',3),het('tomato',4)],gen:2,germ:1});
st.lots.push({id:2,lid:'L2',crop:'melon',name:'乙',source:'x',m:het('melon',5),f:het('melon',6),count:12,gen:1,germ:1});
const p1=T.plantFromLot(st.lots[0],het('tomato',7));p1.stage='flower';st.plots[0]=p1;
const p2=T.plantFromLot(st.lots[1],het('melon',8));p2.stage='fruit';p2.pollen={type:'cross',fatherG:het('melon',9),fatherCrop:'melon',fatherLid:'L2',fatherName:'乙',wide:false};st.plots[1]=p2;
const genes=o=>J({l0:[o.lots.find(l=>l.id===1).m,o.lots.find(l=>l.id===1).f,...o.lots.find(l=>l.id===1).seeds],l1:[o.lots.find(l=>l.id===2).m,o.lots.find(l=>l.id===2).f],p0:[o.plots[0].g,o.plots[0].m],p1:[o.plots[1].g,o.plots[1].m,o.plots[1].pollen.fatherG]});
const want=genes(st);
/* 照 bootLoad 的順序：loadSave（unpack、saveSanitize、migrate）→ repairState */
const load=s=>{const r=T.loadSave(s);if(!r.state)throw new Error(r.err);T.repairState(r.state);return r.state};
const a=load(T.packState(st)),b=load(T.packState(a));
const cmp=(o,tag)=>{const got=genes(o);for(const k of Object.keys(want))want[k].forEach((g,i)=>{const same=JSON.stringify(got[k][i])===JSON.stringify(g);if(!same){fails++;const G=got[k][i],dk=Object.keys({...g,...G}).filter(q=>JSON.stringify(g[q])!==JSON.stringify(G[q]));console.log(`FAIL ${tag} ${k}[${i}] fields ${dk.join(",")} ${dk.map(q=>JSON.stringify(g[q]).slice(0,80)+"→"+JSON.stringify(G[q]).slice(0,80)).join(" ")} ; c ${JSON.stringify(g.c)}→${JSON.stringify(got[k][i].c)} b ${JSON.stringify(g.b)}→${JSON.stringify(got[k][i].b)}`)}})};
const f0=fails;cmp(a,'load 1');cmp(b,'load 2');ok(fails===f0,'every genotype identical after load → save → load (lots, seeds, plants, mother, pollen father)');
ok(a.lots.find(l=>l.id===2).count===12&&a.lots.find(l=>l.id===1).seeds.length===3,'seed counts unchanged');
/* 同名函式：同一個名字的 function 宣告只能有一個（後面的會蓋掉前面的） */
const names={};for(const x of js.matchAll(/(?:^|[;}\s])(?:async\s+)?function\s+([A-Za-z_\$][\w\$]*)\s*\(/g))names[x[1]]=(names[x[1]]||0)+1;
const dup=Object.keys(names).filter(k=>names[k]>1&&k!=='openBuild');ok(!dup.length,'no duplicate function names (openBuild is old dead code, known)'+(dup.length?': '+dup.join(','):''));
/* 第 171 節：新版人物的開關開／關都能讀舊存檔；look 缺欄位補預設值 */
{const old=J(T.packState(st));for(const sw of [undefined,false,true]){const o=JSON.parse(old);const S=load(typeof o==='string'?o:JSON.stringify(o));S.char3=sw;const S2=load(T.packState(S));ok(JSON.stringify(genes(S2))===JSON.stringify(want)&&S2.look&&S2.look.top==='t01',`171: switch ${sw===undefined?'(not set = on)':sw?'on':'off'}: old save loads, genes intact, look filled in`)}
  const S=load(T.packState(st));S.look={top:'t02'};const S2=load(T.packState(S));ok(S2.look.top==='t02'&&S2.look.shoes==='s01'&&S2.look.hair==='h01'&&S2.look.hairColor===0,'171: look with missing fields → defaults filled, chosen top kept');
  S.look={top:'zzz',hairColor:99};ok(JSON.stringify(T.lookNorm(S.look))===JSON.stringify({hair:'h01',hairColor:0,top:'t01',bottom:'b01',shoes:'s01'}),'171: unknown values → defaults');
  ok(T.lookPack(T.lookNorm({top:'t02',hairColor:3}))==='f.h01.3.t02.b01.s01'&&T.lookUnpack('f.h01.3.t02.b01.s01').top==='t02'&&T.lookUnpack('m.x')===null,'171: ap string packs / unpacks; bad strings ignored');
  T.state=S;S.char2Sex='f';S.char3=undefined;ok(T.char3On()===true,'171: girl, switch not set → new character on');S.char3=false;ok(T.char3On()===false,'…switched off → old drawing');S.char3=true;S.char2Sex='m';ok(T.char3On()===false,'…boy → old drawing (only girl art for now)');
  let g='';try{g=T.charG('',10,10,S.avatar,false,{view:'front',face:2},'朋友',3,null,'u9',false,null,null,'f.h01.0.t01.b01.s01')}catch(e){g='ERR '+e.message}ok(g&&!/^ERR/.test(g),'171: other player with ap while the art is still loading → falls back to the old drawing, no error')}
console.log(fails?('FAILS '+fails):'ALL PASS');
/* 第 172 節：主、僕人共鬥（兩到三個假玩家共用假的 Realtime Database） */
try{require('./tcoop.js')}catch(e){console.log('FAIL tcoop.js crashed: '+e.message);process.exitCode=1}
