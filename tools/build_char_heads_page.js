// 人物新畫法對照頁產生器（不放進遊戲，第 35 節 35.5）
// 用法（在專案資料夾執行）：node tools/build_char_heads_page.js
// 產生：tools/char_v3.html（取代 14n 的試做頁）。頭與帽子的圖讀 ../assets/char/，要從網站或本機伺服器打開
// （GitHub Pages 上是 …/tools/char_v3.html），直接開檔案時 canvas 不能換髮色。
// 內容：16 種髮型 × 5 個方向 × 5 種髮色，以及 4 種帽子疊在不同髮型上。用的是遊戲裡真正的畫法（avatarSVG 的新畫法 avV3SVG）。
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..');
const h=fs.readFileSync(path.join(root,'index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
const DATA=['BUILD','AV_DEF','AV_KEYS','AV_OPT','HAIRC','SKINS','CLOTHC','AV_OL','AVH_MAP','AVH_LIST','AVH_HATS'];
const FNS=['clamp','hexRGB','shade','avCol','avNorm','avHid','avhLoaded','avhImg','avhLum','avhTint','avhCompose','avhHead','avhHat','avHex','avImg','avV3SVG'];
js+=';globalThis.T={'+[...DATA,...FNS].join(',')+'};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);const T=ctx.T;
const src=DATA.map(k=>`const ${k}=${JSON.stringify(T[k])};`).join('\n')+
  `\nconst AVH_DIR='../assets/char/h/',AVH_IMG={},AVH_URL=new Map();let AVH_N=0,avhT=null,sheet=null;const RGBC={};const rgbS=c=>c;\n`+
  FNS.map(k=>{const s=T[k].toString();return s.startsWith('function')?s:`const ${k}=${s};`}).join('\n');
const page=`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>人物新畫法對照頁</title>
<style>body{margin:0;padding:12px;background:#EEF2F5;font:14px "Noto Sans TC",sans-serif;color:#3B2A18}h1{font-size:20px;margin:0}h2{font-size:16px;margin:16px 0 6px}
.note{color:#6B5A48;font-size:13px}.wrap{overflow-x:auto;background:#A8C478;border-radius:10px;padding:6px}table{border-collapse:collapse}td,th{padding:2px 4px;text-align:center;font-size:12px;vertical-align:bottom}
th{color:#3B2A18;font-weight:600;white-space:nowrap}.ctl{background:#fff;border-radius:10px;padding:8px;margin:8px 0}</style></head><body>
<h1>人物新畫法對照頁（${T.BUILD}）</h1>
<p class="note">不放進遊戲。用遊戲裡真正的畫法畫出 16 種髮型、5 個方向；斜前用正面的頭、斜後用背面的頭。下面可以換髮色。最下面是 4 種帽子疊在不同髮型上（帽子顏色可換）。
頭與帽子的圖在 assets/char/h/，由 <code>python tools/build_char_heads.py</code> 產生。要從網站或本機伺服器打開才看得到換色。</p>
<div class="ctl">髮色：<span id="hc"></span>　帽子顏色：<span id="tc"></span>　<label><input type="checkbox" id="walk"> 走路姿勢</label></div>
<h2>16 種髮型 × 5 個方向</h2><div class="wrap"><table id="tb"></table></div>
<h2>5 種髮色（正面、背面）</h2><div class="wrap"><table id="cols"></table></div>
<h2>帽子 × 髮型</h2><div class="wrap"><table id="hats"></table></div>
<script src="../assets/char/av3.js?v=${T.BUILD}"></script><script src="../assets/char/av3_heads.js?v=${T.BUILD}"></script>
<script>
${src}
let HC=1,TC=1;
const VIEWS5=[['front','正面'],['fq','斜前'],['side','側面'],['bq','斜後'],['back','背面']];
const svg=(av,v,w)=>'<svg viewBox="-17 -62 34 64" width="'+w+'" height="'+Math.round(w*64/34)+'">'+avV3SVG(av,false,{view:v,t:0,ph:document.getElementById('walk').checked?1.1:undefined})+'</svg>';
function sw(id,list,get,set){document.getElementById(id).innerHTML=list.map((c,i)=>'<button data-i="'+i+'" style="width:22px;height:22px;border-radius:50%;border:'+(get()===i?'3px solid #333':'1px solid #999')+';background:'+c+'"></button>').join('');
  document.getElementById(id).onclick=e=>{const b=e.target.closest('button');if(b){set(+b.dataset.i);render()}}}
function render(){
  sw('hc',HAIRC,()=>HC,v=>HC=v);sw('tc',CLOTHC,()=>TC,v=>TC=v);
  document.getElementById('tb').innerHTML='<tr><th></th>'+VIEWS5.map(v=>'<th>'+v[1]+'</th>').join('')+'</tr>'+AVH_LIST.map(hid=>'<tr><th>'+AV_OPT.hair[hid]+'</th>'+VIEWS5.map(([v])=>'<td>'+svg({...AV_DEF,hair:hid,hairC:HC},v,90)+'</td>').join('')+'</tr>').join('');
  const C5=[0,2,4,6,8];
  document.getElementById('cols').innerHTML='<tr><th></th>'+C5.map(c=>'<th colspan="2"><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:'+HAIRC[c]+'"></span></th>').join('')+'</tr>'+AVH_LIST.map(hid=>'<tr><th>'+AV_OPT.hair[hid]+'</th>'+C5.map(c=>'<td>'+svg({...AV_DEF,hair:hid,hairC:c},'front',54)+'</td><td>'+svg({...AV_DEF,hair:hid,hairC:c},'back',54)+'</td>').join('')+'</tr>').join('');
  const HS=[0,1,3,4,8,13,21];
  document.getElementById('hats').innerHTML=[1,2,3,10].map(ht=>'<tr><th>'+AV_OPT.hat[ht]+'</th>'+HS.map(hd=>'<td>'+svg({...AV_DEF,hair:hd,hat:ht,hairC:HC,hatC:TC},'front',70)+svg({...AV_DEF,hair:hd,hat:ht,hairC:HC,hatC:TC},'side',70)+'</td>').join('')+'</tr>').join('');
}
function renderChars(){render()}
document.getElementById('walk').onchange=render;
render();
</script></body></html>`;
fs.writeFileSync(path.join(__dirname,'char_v3.html'),page);
console.log('ok',(page.length/1024).toFixed(0)+' KB');
