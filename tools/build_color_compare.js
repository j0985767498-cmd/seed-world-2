// 顏色對照頁產生器（不放進遊戲）：用遊戲實際的繪圖函式 fruitSVG 畫出所有顏色、花紋與基本造型。
// 用法（在專案資料夾執行）：node tools/build_color_compare.js
// 產生：tools/color_compare.html
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..');
const h=fs.readFileSync(path.join(root,'index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={fruitSVG,ALL_SKINS,BASIC,SPECIAL,MIX15,ACTIVE_CROPS,CROPS,PFN,SPN,EXN,EX_OF,cnOf,pfName,BUILD};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:390,innerHeight:750,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);const T=ctx.T;
const CROPS4=['tomato','chili','pumpkin','melon'];
const fr=(a,crop,sz=46)=>T.fruitSVG({level:0,sp:0,pat:null,perfCls:2,seed:7,...a},crop,sz);
const card=(inner,label)=>`<div class="card"><div class="ic">${inner}</div><div class="lb">${label}</div></div>`;
const row4=(a,label)=>card(CROPS4.map(c=>fr(a,c)).join(''),label);
const mixes=Object.entries(T.MIX15).map(([k,v])=>[v,k.split('|')]);
let b='';
b+=`<h2>基本色（6）</h2><div class="grid">${T.BASIC.map(c=>row4({skin:c},T.cnOf(c))).join('')}</div>`;
b+=`<h2>混色（15）</h2><div class="grid">${mixes.map(([v,[x,y]])=>row4({skin:v},`${T.cnOf(v)}<small>${T.cnOf(x)}＋${T.cnOf(y)}</small>`)).join('')}</div>`;
b+=`<h2>特殊色（8）</h2><div class="grid">${T.SPECIAL.map(c=>row4({skin:c},T.cnOf(c))).join('')}</div>`;
b+=`<h2>淡特殊色（8）：特殊色＋基本色</h2><div class="grid">${T.SPECIAL.map(c=>row4({skin:'l-'+c},T.cnOf('l-'+c))).join('')}</div>`;
const duals=T.ALL_SKINS.filter(k=>k.startsWith('d-'));
b+=`<h2>雙色（${duals.length}）：兩種不同的特殊色</h2><div class="grid">${duals.map(c=>row4({skin:c},T.cnOf(c))).join('')}</div>`;
b+=`<h2>花紋形式（4）與兩種一起</h2><div class="grid">${T.PFN.map((n,f)=>row4({skin:'red',pat:{c:'white',f}},n)).join('')}`;
for(let f=0;f<4;f++)for(let f2=f+1;f2<4;f2++)b+=row4({skin:'green',pat:{c:'yellow',f,f2}},T.pfName(f,f2));
b+=`</div><h2>花紋顏色：特殊色、淡特殊色、和果皮同色</h2><div class="grid">`;
b+=row4({skin:'red',pat:{c:'gold',f:0}},'紅皮・金色條紋')+row4({skin:'white',pat:{c:'l-starry',f:1}},'白皮・淡星空斑點')+row4({skin:'purple',pat:{c:'purple',f:0}},'紫皮・紫色條紋（同色）')+row4({skin:'yellow',pat:{c:'yellow',f:2}},'黃皮・黃色星點（同色）')+row4({skin:'starry',pat:{c:'starry',f:1}},'星空皮・星空斑點（同色）')+row4({skin:'orange',pat:{c:'d-gold-silver',f:3}},'橙皮・金銀雙色漸層');
b+=`</div><h2>每種作物的 3 種基本造型與專屬造型</h2><div class="grid">`;
for(const c of T.ACTIVE_CROPS)b+=card([0,1,2].map(lv=>fr({level:lv,skin:'red'},c,52)).join('')+(T.EX_OF[c]?fr({sp:T.EX_OF[c],skin:'red'},c,52):''),`${T.CROPS[c].n}<small>${T.CROPS[c].shapes.join('・')}${T.EX_OF[c]?'・'+T.EXN[T.EX_OF[c]]:''}</small>`);
b+=`</div><h2>特殊造型（6）</h2><div class="grid">${T.SPN.slice(1).map((n,i)=>row4({sp:i+1,skin:'blue'},n)).join('')}</div>`;
b+=`<h2>手機實際大小（約 22px）辨識度檢查</h2><div class="tiny">${T.ALL_SKINS.map(c=>`<span title="${T.cnOf(c)}">${fr({skin:c},'tomato',22)}</span>`).join('')}</div>`;
const page=`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>顏色對照頁</title>
<style>body{margin:0;padding:12px;background:#EEF2F5;font:14px "Noto Sans TC",sans-serif;color:#3B2A18}h1{font-size:20px;margin:0}h2{font-size:16px;margin:18px 0 6px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px}.card{background:#fff;border:1px solid #D8CFC0;border-radius:10px;padding:6px}
.ic{display:flex;gap:2px;justify-content:center}.lb{text-align:center;font-size:13px;margin-top:2px}.lb small{display:block;color:#7A6A58;font-size:11px}
.tiny{display:flex;flex-wrap:wrap;gap:2px;background:#fff;border-radius:10px;padding:8px}.note{color:#6B5A48}</style></head><body>
<h1>顏色對照頁（${T.BUILD}）</h1><p class="note">不放進遊戲。用遊戲實際的繪圖函式畫出所有純色、15 種混色、特殊色、淡特殊色、雙色，以及 4 種花紋形式與組合，每種畫在番茄、辣椒、南瓜、甜瓜上，方便檢查在手機大小下兩兩可辨。改了果實畫法後執行 <code>node tools/build_color_compare.js</code> 重新產生。</p>
${b}</body></html>`;
fs.writeFileSync(path.join(__dirname,'color_compare.html'),page);
console.log('ok',(page.length/1024).toFixed(0)+' KB');
