/* 第 186 節：2 階解鎖、每階名字、星星、舊存檔補 st。由 tload.js 呼叫，也可以單獨跑：node tools/t186.js */
const fs=require('fs'),vm=require('vm'),path=require('path');
const h=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={newGame,packState,loadSave,repairState,skDef,skName,skDmg,wpnDmg,curWpn,wpStat,pMax,SK_NAMES,WP_SHAPES,SKILLS,setScene(v){scene=v},get state(){return state},set state(v){state=v}};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math:Object.assign(Object.create(Math),{random:()=>0.99}),Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[186] '+m);if(!c)fails++};
/* 舊存檔：武器沒有 st → 讀得到、補 [] */
{T.newGame();const st=T.state;st.weapons=[{crop:'tomato',tier:2},{crop:'corn',tier:1}];st.wpn=0;const r=T.loadSave(T.packState(st));T.repairState(r.state);T.state=r.state;
  ok(r.state.weapons.length===2&&r.state.weapons.every(w=>Array.isArray(w.st)&&!w.st.length)&&r.state.weapons[0].tier===2,'old save (weapons without st) loads, st filled with []');}
T.setScene('explore');const st=T.state;st.lv=20;
/* 2 階就有技能 2；名字照階 */
{st.weapons=[{crop:'tomato',tier:1,st:[]}];st.wpn=0;const a=T.skDef(2);st.weapons[0].tier=2;const b=T.skDef(2);
  ok(a.locked&&!b.locked&&b.id==='xcut','tier 1: skill 2 locked; tier 2: 十字斬 unlocked');
  ok(T.skName('tomato',1,1)==='突刺'&&T.skName('tomato',1,6)==='天光一閃'&&T.skName('tomato',2,2)==='十字斬'&&T.skName('tomato',2,6)==='天十字','names per tier (突刺→天光一閃, 十字斬→天十字)');
  ok(Object.keys(T.SKILLS).every(c=>T.SK_NAMES[c]&&T.SK_NAMES[c][0].length===6&&T.SK_NAMES[c][1].length===5),'SK_NAMES: 9 weapons × 6 + 5 names');}
/* 星星：技能傷害 +5%／顆；三角形攻擊 +2%、愛心血量 +2% */
{st.weapons=[{crop:'tomato',tier:1,st:[]}];const d0=T.skDmg(1).d;st.weapons[0].st=[2,4,2,4];const d4=T.skDmg(1).d;
  ok(Math.abs(d4/d0-1.2*1.04)<0.01,`4 stars (2 triangles): skill damage ×1.20 × attack +4% (${(d4/d0).toFixed(3)})`);
  const n0=T.wpnDmg(T.curWpn()).d;st.weapons[0].st=[];const n1=T.wpnDmg(T.curWpn()).d;ok(Math.abs(n0/n1-1.04)<0.01,'normal attack: 2 triangles → +4%');
  const h0=T.pMax();st.weapons=[{crop:'broccoli',tier:1,st:[3,3,1]}];ok(Math.abs(T.pMax()/h0-1.04)<0.01&&Math.abs(T.wpStat('def')-0.015)<1e-9,'hammer: 2 hearts → HP max +4%, 1 square → damage taken −1.5%');}
console.log(fails?('[186] FAILS '+fails):'[186] ALL PASS');if(fails)process.exitCode=1;
