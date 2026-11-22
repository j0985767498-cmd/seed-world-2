/* 第 185 節：素材的取得提示。由 tload.js 呼叫，也可以單獨跑：node tools/t185.js（會列出找不到來源的素材） */
const fs=require('fs'),vm=require('vm'),path=require('path');
const h=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={newGame,MATS,RECIPES,WEAPONS,OUTFIT_MATS,matSrc,matRowHTML,msrcHTML,matHTML,setSheet(v){sheet=v},get state(){return state}};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[185] '+m);if(!c)fails++};
T.newGame();const st=T.state;st.lv=1;
const all=Object.keys(T.MATS),none=all.filter(k=>!T.matSrc(k).length);
/* 配方、武器、服裝用到的素材都要有來源 */
const used=new Set();for(const r of T.RECIPES)for(const e of r.mats){used.add(e[0]);(e[2]||[]).forEach(x=>used.add(x))}for(const c in T.WEAPONS)for(const e of T.WEAPONS[c].mats)used.add(e[0]);for(const b in T.OUTFIT_MATS)for(const e of T.OUTFIT_MATS[b])used.add(e[0]);
const prim=[];for(const r of T.RECIPES)for(const e of r.mats)prim.push(e);for(const c in T.WEAPONS)prim.push(...T.WEAPONS[c].mats);for(const b in T.OUTFIT_MATS)prim.push(...T.OUTFIT_MATS[b]);
const usedNone=prim.filter(e=>![e[0]].concat(e[2]||[]).some(k=>T.matSrc(k).length)).map(e=>e[0]);
console.log(`[185] 找不到來源的素材 ${none.length}／${all.length}：${none.map(k=>k+'（'+T.MATS[k].n+'）').join('、')||'無'}`);
ok(!usedNone.length,'every recipe / weapon / outfit material has a source (or a substitute that has one)'+(usedNone.length?'：缺 '+usedNone.join(','):''));
{const S=T.matSrc('hay');ok(S.length&&S[0].kind==='mon'&&S[0].reg==='grass'&&S[0].map==='entry'&&S[0].rare==='c','乾草束 → 草原入口的乾草堆怪、常見');}
{const S=T.matSrc('hay_g');ok(S.length&&S.every(x=>x.rare==='r'),'金色的 → 很少見');}
{const S=T.matSrc('jadeblade');ok(S.length===2&&S[0].kind==='sv'&&S[1].kind==='lord'&&S[1].cond,'翡翠鐮片 → 刈穗螳（僕人）＋克洛諾斯（主，要滿足條件）');}
{const row=T.matRowHTML(['jadeblade',2],0,2);ok(/🔒Lv/.test(row)&&/0／2/.test(row)&&/等 2 處/.test(row),'craft row: 0／2, main source, 「等 2 處」, level lock at Lv 1');
  st.lv=80;const r2=T.matRowHTML(['hay',2],5,2);ok(!/🔒/.test(r2)&&/✓/.test(r2),'craft row: enough → ✓, no lock');}
{T.setSheet({msrc:'jadeblade'});const H=T.msrcHTML();ok(/帶我去/.test(H)&&/要滿足條件才會出現/.test(H)&&/會掉：/.test(H),'取得方式 card: 帶我去, lord condition line, 「會掉：」');
  T.setSheet({mat:'hay'});ok(/取得方式/.test(T.matHTML()),'material detail page uses the same source list');}
{const r=T.matRowHTML(['mossshell',1,['x_moss_stump']],0,1);ok(/苔殼/.test(r)&&/data-msrc="x_moss_stump"/.test(r)&&!/還沒有地方掉/.test(r),'苔殼 (old monster) row shows the 苔岩根 source');}
console.log(fails?('[185] FAILS '+fails):'[185] ALL PASS');if(fails)process.exitCode=1;
