/* 讀檔往返：帶異質基因的種子包、植株，載入 → 存檔 → 再載入，每一份基因要和原本完全相同。
   用法：node tools/tload.js [index.html 的路徑]（預設專案裡的；也可以拿舊版本測，例如 git show a368f29:index.html 存成檔案） */
const fs=require('fs'),vm=require('vm');
const src=process.argv[2]||require('path').join(__dirname,'..','index.html');
const h=fs.readFileSync(src,'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={newGame,makeWild,plantFromLot,packState,loadSave,repairState,lookNorm,lookPack,lookUnpack,char3On,charG,c3MfSet,c3Layers,c3G,get state(){return state},set state(v){state=v}};';
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
/* 第 171、177 節：新版人物的開關開／關都能讀舊存檔；177：照 manifest，舊測試編號 → 預設、男女都能讀、看不懂的 ap 不會壞 */
{const MF=JSON.parse(fs.readFileSync(require('path').join(__dirname,'..','assets','char3','manifest.json'),'utf8')),DF=MF.bodies.f.default,DM=MF.bodies.m.default;
  const old=J(T.packState(st));for(const sw of [undefined,false,true]){const o=JSON.parse(old);const S=load(typeof o==='string'?o:JSON.stringify(o));S.char3=sw;S.look={hair:'h01',hairColor:0,top:'t01',bottom:'b01',shoes:'s01'};const S2=load(T.packState(S));ok(JSON.stringify(genes(S2))===JSON.stringify(want)&&S2.look&&S2.look.top==='t01',`171: switch ${sw===undefined?'(not set = on)':sw?'on':'off'}: old save loads, genes intact, look kept as-is until the list is read`)}
  const S=load(T.packState(st));S.look={hair:'h01',hairColor:0,top:'t01',bottom:'b01',shoes:'s01'};S.char2Sex='f';T.state=S;ok(T.c3MfSet(MF)===true,'177: manifest accepted');
  const L=T.state.look;ok(L.hair===DF.hair&&L.top===DF.top&&L.bottom===DF.bottom&&L.shoes===DF.shoes&&L.hairColor===DF.hairColor&&!('b' in L),'177: old test look (t01, b01) on a girl → girl default, stored without body');
  S.look={hair:'h03',hairColor:3,top:'t04',bottom:'b03',shoes:'s02'};ok(T.lookPack(T.lookNorm(S.look))==='f.h03.3.t04.b03.s02','177: valid girl look packs as f.h03.3.t04.b03.s02');
  S.char2Sex='m';const LM=T.lookNorm(S.look);ok(LM.b==='m'&&LM.top===DM.top&&LM.hair===DM.hair,'177: same look on a boy (t04 is not a boy item) → boy default');
  ok(T.lookNorm({hair:'h02',hairColor:2,top:'o02',bottom:'b03',shoes:'s03'}).top==='o02','177: boy suit (cape) is valid');
  ok(T.lookNorm({hair:'h01',hairColor:99,top:'t01',bottom:'b01',shoes:'s01'}).hairColor===DM.hairColor,'177: hair colour out of range → default colour only');
  ok(T.char3On()===true,'177: boy → new character on (body m)');S.char3=false;ok(T.char3On()===false,'…switched off → old drawing');S.char3=undefined;
  const U=T.lookUnpack('m.h03.1.t03.b03.s03');ok(U&&U.b==='m'&&U.top==='t03','177: boy ap unpacks');
  const U2=T.lookUnpack('f.h99.0.zz.b01.s01');ok(U2&&U2.b==='f'&&U2.top===DF.top,'177: unreadable item ids → their body default');
  ok(T.lookUnpack('x.h01.0.t01.b01.s01')===null&&T.lookUnpack('m.x')===null&&T.lookUnpack(5)===null,'177: unknown body / broken strings → old drawing');
  const ly=T.c3Layers(T.lookNorm({hair:'h01',hairColor:0,top:'o01',bottom:'b03',shoes:'s01'},'f'),'move').map(l=>l.src);ok(ly.length===5&&!ly.some(s=>/bottom/.test(s))&&/f\/hair\/h01\/move_hb\.png$/.test(ly[0])&&/move_hf\.png$/.test(ly[4]),'177: wearing a one-piece → no bottom layer; hair hb first, hf last');
  const ly2=T.c3Layers(T.lookNorm({hair:'h01',hairColor:0,top:'t04',bottom:'b03',shoes:'s01'},'f'),'atkA').map(l=>l.src);ok(ly2.length===6&&ly2[3]==='assets/char3/f/bottom/b03/atkA.png','177: normal top → bottom drawn, paths use the group name');
  const G=T.c3G('chop');ok(G&&G.g==='atkA'&&G.row===12&&G.n===6&&T.c3G('cast').g==='atkB'&&T.c3G('hit').g==='move','177: actions map to groups from the manifest');
  ok(T.c3G('chop_w')&&T.c3G('chop_w').g==='atkAw'&&T.c3G('cast_w').g==='atkBw'&&['slash','dual','chop','sweep','cast','shoot'].every(k=>T.c3G(k+'_w').n===T.c3G(k).n),'178: walking-attack actions exist with the same frame count');
  for(const ap of ['f.h01.0.t01.b01.s01','m.h01.0.t01.b01.s01','m.???.x.y.z.w','junk']){let g='';try{g=T.charG('',10,10,S.avatar,false,{view:'front',face:2},'朋友',3,null,'u9',false,null,null,ap)}catch(e){g='ERR '+e.message}ok(g&&!/^ERR/.test(g),`177: other player with ap "${ap}" while the art is still loading → no error`)}
  const miss=[];for(const b of ['f','m']){const B=MF.bodies[b];for(const k of ['hair','top','bottom','shoes'])for(const o of B[k])for(const gp of Object.keys(MF.groups)){const fs2=k==='hair'?[`${gp}_hb`,`${gp}_hf`]:[gp];for(const f of fs2){const pth=require('path').join(__dirname,'..','assets','char3',b,k,o[0],f+'.png');if(!fs.existsSync(pth))miss.push(`${b}/${k}/${o[0]}/${f}`)}}for(const gp of Object.keys(MF.groups))if(!fs.existsSync(require('path').join(__dirname,'..','assets','char3',b,'body','base',gp+'.png')))miss.push(`${b}/body/base/${gp}`);if(!fs.existsSync(require('path').join(__dirname,'..','assets','char3',b,MF.anchors)))miss.push(b+'/'+MF.anchors)}
  ok(!miss.length,'177: every file the manifest lists exists'+(miss.length?': '+miss.slice(0,8).join(', '):''))}
console.log(fails?('FAILS '+fails):'ALL PASS');
/* 第 172 節：主、僕人共鬥（兩到三個假玩家共用假的 Realtime Database） */
try{require('./tcoop.js')}catch(e){console.log('FAIL tcoop.js crashed: '+e.message);process.exitCode=1}
try{require('./t183.js')}catch(e){console.log('FAIL t183.js crashed: '+e.message);process.exitCode=1}
try{require('./t184.js')}catch(e){console.log('FAIL t184.js crashed: '+e.message);process.exitCode=1}
try{require('./t185.js')}catch(e){console.log('FAIL t185.js crashed: '+e.message);process.exitCode=1}
try{require('./t186.js')}catch(e){console.log('FAIL t186.js crashed: '+e.message);process.exitCode=1}
try{require('./t187.js')}catch(e){console.log('FAIL t187.js crashed: '+e.message);process.exitCode=1}
try{require('./t190.js')}catch(e){console.log('FAIL t190.js crashed: '+e.message);process.exitCode=1}
try{require('./t191.js')}catch(e){console.log('FAIL t191.js crashed: '+e.message);process.exitCode=1}
