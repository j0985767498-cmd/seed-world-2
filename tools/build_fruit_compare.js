// 果實素模對照頁產生器（不放進遊戲，第 26 節 26.6）
// 用法（在專案資料夾執行）：node tools/build_fruit_compare.js
// 產生：tools/fruit_compare.html
// 用遊戲實際的上色函式（index.html 的「果實素模上色」區塊）畫出 9 種作物 × 10 個造型；素模直接包進頁面，
// 所以從資料夾直接打開也能用（canvas 不能讀本機檔案的像素）。
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..');
const h=fs.readFileSync(path.join(root,'index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
const DATA=['RGBC','SPGRAD','RAINBOW','EX_OF','ALL_SKINS','BASIC','SPECIAL','BASE_SHAPES','SPN','EXN','CN','CSTR','MIX15','FRUIT_SHAPE_MUL','FRUIT_UNRIPE','PFN','BUILD'];
const FNS=['clamp','hexRGB','mixRGB','rgbS','isSpecC','colParts','cnOf','patKey','hashStr','f3','pfName','fruitShapeKey','fruitPrep','fruitColSpec','fruitPaint'];
js+=';globalThis.T={'+[...DATA,...FNS].join(',')+'};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);const T=ctx.T;
const src=DATA.map(k=>`const ${k}=${JSON.stringify(T[k])};`).join('\n')+'\nconst MIXSET=new Set(Object.values(MIX15));\n'+
  FNS.map(k=>{const s=T[k].toString();return s.startsWith('function')?s:`const ${k}=${s};`}).join('\n');
const CROPS9=['tomato','chili','strawberry','eggplant','corn','pumpkin','zucchini','melon','broccoli'];
const CNAME={tomato:'番茄',chili:'辣椒',strawberry:'草莓',eggplant:'茄子',corn:'玉米',pumpkin:'南瓜',zucchini:'櫛瓜',melon:'甜瓜',broccoli:'甘藍家族'};
const SHAPES=['b0','b1','b2','sp1','sp2','sp3','sp4','sp5','sp6','ex'];
const IMG={};for(const c of CROPS9)for(const s of SHAPES){const f=path.join(root,'assets','fruits',`${c}_${s}.png`);if(fs.existsSync(f))IMG[`${c}_${s}`]='data:image/png;base64,'+fs.readFileSync(f).toString('base64')}
const page=`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>果實對照頁</title>
<style>body{margin:0;padding:12px;background:#EEF2F5;font:14px "Noto Sans TC",sans-serif;color:#3B2A18}h1{font-size:20px;margin:0}h2{font-size:16px;margin:16px 0 6px}
.ctl{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;background:#fff;border-radius:10px;padding:8px;position:sticky;top:0;z-index:2;box-shadow:0 2px 6px rgba(0,0,0,.08)}
.ctl label{font-size:13px}select{font-size:13px}table{border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden}td,th{border:1px solid #E4DCCF;padding:3px;text-align:center;font-size:12px}
th{background:#F6F1E8;font-weight:600}canvas{display:block;margin:auto}.wrap{overflow-x:auto}.note{color:#6B5A48;font-size:13px}.tiny{display:flex;flex-wrap:wrap;gap:3px;background:#fff;border-radius:10px;padding:8px}
.tiny div{text-align:center;font-size:10px;color:#7A6A58}.grass{background:#A9CF7C}</style></head><body>
<h1>果實對照頁（${T.BUILD}）</h1>
<p class="note">不放進遊戲。用遊戲實際的上色函式（素模＋程式上色，第 26 節 26.2、26.3）畫出 9 種作物 × 10 個造型。上方可以選果皮色、花紋顏色、花紋形式、結果期／成熟期與顯示大小。</p>
<div class="ctl">
<label>果皮 <select id="skin"></select></label>
<label>花紋 <select id="pf"><option value="">無</option><option value="0">條紋</option><option value="1">斑點</option><option value="2">星點</option><option value="3">漸層</option><option value="0,1">條紋＋斑點</option><option value="0,3">條紋＋漸層</option><option value="1,2">斑點＋星點</option></select></label>
<label>花紋顏色 <select id="pc"></select></label>
<label>階段 <select id="rp"><option value="1">成熟期</option><option value="0">結果期（70% 大小、偏綠）</option></select></label>
<label>大小 <select id="sz"><option value="64">64px</option><option value="44">44px</option><option value="30">30px</option><option value="22">22px（手機上植株的果實）</option></select></label>
<label><input type="checkbox" id="gr"> 草地背景</label>
</div>
<h2>9 種作物 × 10 個造型</h2><div class="wrap"><table id="tb"></table></div>
<h2>所有果皮顏色（番茄・圓形，22px）</h2><div class="tiny" id="all"></div>
<script>
${src}
const CROPS9=${JSON.stringify(CROPS9)},CNAME=${JSON.stringify(CNAME)},SHAPES=${JSON.stringify(SHAPES)},IMG=${JSON.stringify(IMG)};
const PB={};
function loadAll(){return Promise.all(Object.entries(IMG).map(([k,u])=>new Promise(res=>{const im=new Image();im.onload=()=>{const cv=document.createElement('canvas');cv.width=im.naturalWidth;cv.height=im.naturalHeight;const cx=cv.getContext('2d');cx.drawImage(im,0,0);const id=cx.getImageData(0,0,cv.width,cv.height);PB[k]=fruitPrep(id.width,id.height,id.data);res()};im.onerror=res;im.src=u})))}
function draw(name,a,ripe,size){
  const B=PB[name];const cv=document.createElement('canvas');const H=Math.round(size*3.2/3);cv.width=size*2;cv.height=H*2;cv.style.width=size+'px';cv.style.height=H+'px';
  if(!B)return cv;const px=fruitPaint(B,a,ripe,hashStr(name+'|'+a.skin+'|'+patKey(a.pat)+'|'+ripe));
  const t=document.createElement('canvas');t.width=B.w;t.height=B.h;const tc=t.getContext('2d');const id=tc.createImageData(B.w,B.h);id.data.set(px);tc.putImageData(id,0,0);
  const m=(FRUIT_SHAPE_MUL[name]||1)*(ripe?1:0.7),s=Math.min(cv.width/B.w,cv.height/B.h)*m,w=B.w*s,h=B.h*s;const cx=cv.getContext('2d');cx.imageSmoothingQuality='high';cx.drawImage(t,(cv.width-w)/2,(cv.height-h)/2,w,h);return cv;
}
const shapeLabel=(c,s)=>s[0]==='b'?BASE_SHAPES[c][+s[1]]:s==='ex'?EXN[EX_OF[c]]||'專屬':SPN[+s.slice(2)];
function opts(id,def){const e=document.getElementById(id);e.innerHTML=ALL_SKINS.map(k=>'<option value="'+k+'"'+(k===def?' selected':'')+'>'+cnOf(k)+'</option>').join('');e.onchange=render}
opts('skin','red');opts('pc','white');['pf','rp','sz','gr'].forEach(id=>document.getElementById(id).onchange=render);
function cur(){const g=id=>document.getElementById(id).value;const pf=g('pf');let pat=null;if(pf){const f=pf.split(',').map(Number);pat=f.length>1?{c:g('pc'),f:f[0],f2:f[1]}:{c:g('pc'),f:f[0]}}return {a:{level:0,sp:0,skin:g('skin'),pat},ripe:+g('rp'),size:+g('sz')}}
function render(){
  const {a,ripe,size}=cur(),tb=document.getElementById('tb');tb.className=document.getElementById('gr').checked?'grass':'';
  tb.innerHTML='<tr><th></th>'+SHAPES.map(s=>'<th>'+s+'</th>').join('')+'</tr>';
  for(const c of CROPS9){const tr=document.createElement('tr');tr.innerHTML='<th>'+CNAME[c]+'</th>';
    for(const s of SHAPES){const td=document.createElement('td');td.appendChild(draw(c+'_'+s,a,ripe,size));const lb=document.createElement('div');lb.textContent=shapeLabel(c,s);td.appendChild(lb);tr.appendChild(td)}
    tb.appendChild(tr)}
  const all=document.getElementById('all');all.innerHTML='';for(const k of ALL_SKINS){const d=document.createElement('div');d.appendChild(draw('tomato_b0',{level:0,sp:0,skin:k,pat:null},1,22));d.appendChild(document.createTextNode(cnOf(k)));all.appendChild(d)}
}
loadAll().then(render);
</script></body></html>`;
fs.writeFileSync(path.join(__dirname,'fruit_compare.html'),page);
console.log('ok',(page.length/1024).toFixed(0)+' KB');
