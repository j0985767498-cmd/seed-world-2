// 86.3 試做頁產生器（不放進遊戲）：新畫法人物換衣服的三套試做，和現在的預設造型並排
// 用法（在專案資料夾執行）：node tools/build_outfit_try.js　產生 tools/outfit_try.html（要從網站或本機伺服器打開，頭的圖才換得了髮色）
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..');
const h=fs.readFileSync(path.join(root,'index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
const DATA=['BUILD','AV_DEF','AV_KEYS','AV_OPT','HAIRC','SKINS','CLOTHC','AV_OL','AVH_MAP','AVH_LIST','AVH_HATS','AVO_V','AVO_TOP','AVO_BOT','AVO_SHOE','AVO_LONG','WARD_CROPS','EX_OF'];
const FNS=['clamp','hexRGB','shade','avCol','avNorm','avHid','avhLoaded','avhImg','avhLum','avhTint','avhCompose','avhHead','avhHat','avHex','avImg','avoBox','avFab','avOutfitOf','avOutfitParts','avFruitBit','avHatX','avAccX','avV3SVG'];
js+=';globalThis.T={'+[...DATA,...FNS].join(',')+'};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);const T=ctx.T;
const src=DATA.map(k=>`const ${k}=${JSON.stringify(T[k])};`).join('\n')+
  `\nconst AVH_DIR='../assets/char/h/',AVH_IMG={},AVH_URL=new Map();let AVH_N=0,AVO_N=0,avhT=null,sheet=null;const RGBC={};const rgbS=c=>c;let FRUIT_ANIM=false;const fruitInner=(a,r,crop)=>'<ellipse cy=".15" rx="1.25" ry="1.15" fill="#E2533F" stroke="#4A3020" stroke-width=".12"/><path d="M0 -1 L-.5 -1.4 M0 -1 L.5 -1.4 M0 -1 V-1.5" stroke="#6E8A3C" stroke-width=".18"/>';/* 對照頁：果實帽、頭飾用簡化的果實（遊戲裡是素模上色） */\n`+
  FNS.map(k=>{const s=T[k].toString();return s.startsWith('function')?s:`const ${k}=${s};`}).join('\n');
const page=`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>新畫法換衣服試做</title>
<style>body{margin:0;padding:12px;background:#EEF2F5;font:14px "Noto Sans TC",sans-serif;color:#3B2A18}h1{font-size:20px;margin:0}h2{font-size:16px;margin:16px 0 6px}
.note{color:#6B5A48;font-size:13px}.wrap{overflow-x:auto;background:#A8C478;border-radius:10px;padding:6px}table{border-collapse:collapse}td,th{padding:2px 4px;text-align:center;font-size:12px;vertical-align:bottom}
th{color:#3B2A18;font-weight:600;white-space:nowrap}.ctl{background:#fff;border-radius:10px;padding:8px;margin:8px 0}.game{display:flex;gap:6px;align-items:flex-end;background:#A8C478;border-radius:10px;padding:10px}</style></head><body>
<h1>新畫法換衣服試做（第 86.3 節，${T.BUILD}）</h1>
<p class="note">不放進遊戲。頭、臉、髮型、手、身形照 v3；上衣、下身、鞋子用程式畫在 v3 零件的外形上（外框、兩階明暗、粗的細節線）。第一列是現在的預設造型（條紋 T＋吊帶褲＋靴子），下面三列是試做。顏色可以換。</p>
<div class="ctl">上衣色：<span id="tc"></span><br>下身色：<span id="bc"></span><br>外套色：<span id="jc"></span>　<label><input type="checkbox" id="walk"> 走路姿勢（勾了每個方向畫兩個影格）</label></div>
<h2>4 套 × 5 個方向</h2><div class="wrap"><table id="tb"></table></div>
<h2>遊戲實際大小（農場上約 62px 高）</h2><div class="game" id="game"></div>
<h2>全部上衣（14）× 5 個方向（下身長褲、布鞋）</h2><div class="wrap"><table id="tops"></table></div>
<h2>全部下身（7）（上衣素 T）</h2><div class="wrap"><table id="bots"></table></div>
<h2>86.5 新款（帽子、頭飾、上衣、下身、鞋子、配件）</h2><p class="note">果實帽、頭飾在這頁用簡化的紅色果實代替（遊戲裡照選的成品顏色上色，夢幻色也會動）。</p><div class="wrap"><table id="news"></table></div>
<h2>全部鞋子（5）（長褲；最後一列是短褲）</h2><div class="wrap"><table id="shoes"></table></div>
<script src="../assets/char/av3.js?v=${T.BUILD}"></script><script src="../assets/char/av3_heads.js?v=${T.BUILD}"></script>
<script>
${src}
let TC=6,BC=7,JC=2;
const VIEWS5=[['front','正面'],['fq','斜前'],['side','側面'],['bq','斜後'],['back','背面']];
const SETS=()=>[
  ['現在的預設（條紋 T＋吊帶褲＋靴子）',{...AV_DEF},null],
  ['1 素 T＋長褲＋布鞋',{...AV_DEF,topC:TC,bottomC:BC,shoeC:6},{top:'tee',bottom:'pants',shoe:'sneaker'}],
  ['2 洋裝＋布鞋',{...AV_DEF,hair:3,topC:5,shoeC:6},{top:'dress',bottom:null,shoe:'sneaker'}],
  ['3 外套（敞開、裡面素 T）＋短褲＋靴子',{...AV_DEF,hair:15,topC:6,bottomC:11,shoeC:12},{top:'jacket',bottom:'shorts',shoe:'boot',jacketC:JC}]];
const svg=(av,v,w,o,ph)=>'<svg viewBox="-17 -62 34 64" width="'+w+'" height="'+Math.round(w*64/34)+'">'+avV3SVG(av,false,{view:v,t:0,ph,outfit:o||undefined})+'</svg>';
function sw(id,list,get,set){document.getElementById(id).innerHTML=list.map((c,i)=>'<button data-i="'+i+'" style="width:22px;height:22px;border-radius:50%;border:'+(get()===i?'3px solid #333':'1px solid #999')+';background:'+c+'"></button>').join('');
  document.getElementById(id).onclick=e=>{const b=e.target.closest('button');if(b){set(+b.dataset.i);render()}}}
function render(){
  sw('tc',CLOTHC,()=>TC,v=>TC=v);sw('bc',CLOTHC,()=>BC,v=>BC=v);sw('jc',CLOTHC,()=>JC,v=>JC=v);
  const wk=document.getElementById('walk').checked;
  document.getElementById('tb').innerHTML='<tr><th></th>'+VIEWS5.map(v=>'<th>'+v[1]+'</th>').join('')+'</tr>'+SETS().map(([n,av,o])=>'<tr><th style="max-width:90px;white-space:normal">'+n+'</th>'+VIEWS5.map(([v])=>'<td>'+(wk?svg(av,v,84,o,1.2)+svg(av,v,84,o,-1.2):svg(av,v,96,o))+'</td>').join('')+'</tr>').join('');
  const row=(lbl,av)=>'<tr><th style="max-width:80px;white-space:normal">'+lbl+'</th>'+VIEWS5.map(([v])=>'<td>'+(wk?svg(av,v,70,undefined,1.2):svg(av,v,80))+'</td>').join('')+'</tr>';
  const hd='<tr><th></th>'+VIEWS5.map(v=>'<th>'+v[1]+'</th>').join('')+'</tr>';
  document.getElementById('tops').innerHTML=hd+AV_OPT.top.map((n,i)=>row(n,{...AV_DEF,top:i,topC:[0,1,13,2,8,4,1,12,9,3,6,5,9,2][i],bottom:0,bottomC:BC,shoe:i===2?0:1,shoeC:6})).join('');
  document.getElementById('bots').innerHTML=hd+AV_OPT.bottom.map((n,i)=>row(n,{...AV_DEF,hair:i===2||i===4||i===6?3:0,top:0,topC:0,bottom:i,bottomC:[7,11,1,13,10,0,5][i],shoe:1,shoeC:6})).join('');
  document.getElementById('shoes').innerHTML=hd+AV_OPT.shoe.map((n,i)=>row(n,{...AV_DEF,top:0,topC:6,bottom:0,bottomC:7,shoe:i,shoeC:[12,6,3,12,1][i]})).join('')+AV_OPT.shoe.map((n,i)=>row(n+'＋短褲',{...AV_DEF,top:0,topC:6,bottom:1,bottomC:11,shoe:i,shoeC:[12,6,3,12,1][i]})).join('');
  const NW=[...[11,12,13,14,15].map(i=>[AV_OPT.hat[i],{hat:i,hatC:[11,2,4,0,0][i-11]}]),['頭飾（番茄皇冠）',{head:1}],
    ...[14,15,16,17,18,19,20].map(i=>[AV_OPT.top[i],{top:i,topC:[6,9,3,1,1,5,4][i-14],bottom:0,bottomC:7,shoe:1,shoeC:6}]),
    ...[7,8,9].map(i=>[AV_OPT.bottom[i],{top:0,topC:6,bottom:i,bottomC:[11,4,2][i-7],shoe:1,shoeC:6,hair:i===8?3:0}]),
    ...[5,6,7,8].map(i=>[AV_OPT.shoe[i],{top:0,topC:6,bottom:1,bottomC:11,shoe:i,shoeC:[1,12,4,3][i-5]}]),
    ...[10,11,12,13,14,15,16,17].map(i=>[AV_OPT.acc[i],{acc:i,accC:1}])];
  document.getElementById('news').innerHTML=hd+NW.map(([n,o])=>row(n,{...AV_DEF,...o})).join('');
  document.getElementById('game').innerHTML=SETS().map(([n,av,o])=>VIEWS5.map(([v],i)=>svg(av,v,39,o,i%2?1.2:undefined)).join('')).join('<span style="width:10px"></span>');
}
function renderChars(){render()}
document.getElementById('walk').onchange=render;
render();
</script></body></html>`;
fs.writeFileSync(path.join(__dirname,'outfit_try.html'),page);
console.log('ok',(page.length/1024).toFixed(0)+' KB');
