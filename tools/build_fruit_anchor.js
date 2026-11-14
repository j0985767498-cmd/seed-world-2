// 果實掛點調整工具產生器（不放進遊戲，第 26 節 26.3）
// 用法（在專案資料夾執行）：node tools/build_fruit_anchor.js
// 產生：tools/fruit_anchor.html
// 用遊戲實際的上色函式畫果實（素模包在頁面裡），植株圖片讀 ../assets/crops/<作物>_3.png。
// 手指或滑鼠拖曳果實、滑桿調大小，下方即時輸出 FRUIT_AT 的 JSON，複製後貼回 index.html 的 const FRUIT_AT=…;
// 調整中的數值會暫存在這台裝置的瀏覽器（localStorage），重新整理不會不見；「還原成遊戲目前的值」可清掉。
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..');
const h=fs.readFileSync(path.join(root,'index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
const DATA=['RGBC','SPGRAD','RAINBOW','EX_OF','ALL_SKINS','BASIC','SPECIAL','SPN','EXN','CN','CSTR','MIX15','FRUIT_SHAPE_MUL','FRUIT_UNRIPE','PFN','BUILD','PLANT_IMG','PLANT_H','FRUIT_AT','FRUIT_ONE','SIZE_BANDS'];
const FNS=['clamp','hexRGB','mixRGB','rgbS','isSpecC','colParts','cnOf','patKey','hashStr','f3','pfName','fruitShapeKey','fruitPrep','fruitColSpec','fruitPaint'];
js+=';globalThis.T={'+[...DATA,...FNS].join(',')+',CROPS};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams,Image:function(){return {}}};
ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);const T=ctx.T;
const CROPS9=['tomato','chili','strawberry','eggplant','corn','pumpkin','zucchini','melon','broccoli'];
const FS={};const CNAME={};for(const c of CROPS9){FS[c]=T.CROPS[c].fs;CNAME[c]=T.CROPS[c].n}
const src=DATA.map(k=>`const ${k}=${JSON.stringify(T[k])};`).join('\n')+'\nconst MIXSET=new Set(Object.values(MIX15));\n'+
  FNS.map(k=>{const s=T[k].toString();return s.startsWith('function')?s:`const ${k}=${s};`}).join('\n');
const IMG={};for(const c of CROPS9){const f=path.join(root,'assets','fruits',`${c}_b0.png`);if(fs.existsSync(f))IMG[`${c}_b0`]='data:image/png;base64,'+fs.readFileSync(f).toString('base64')}
const DEFC={tomato:'red',chili:'red',strawberry:'red',eggplant:'purple',corn:'yellow',pumpkin:'yellow',zucchini:'green',melon:'yellow',broccoli:'green'};
const page=`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><title>果實掛點工具</title>
<style>body{margin:0;padding:10px;background:#EEF2F5;font:14px "Noto Sans TC",sans-serif;color:#3B2A18;-webkit-user-select:none;user-select:none}
h1{font-size:18px;margin:0 0 4px}h2{font-size:15px;margin:14px 0 6px}.note{color:#6B5A48;font-size:12.5px;margin:4px 0}
.crops{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.crops button{font:inherit;padding:6px 10px;border-radius:16px;border:1.5px solid #B9A88E;background:#fff}
.crops button[aria-pressed=true]{background:#F2C230;border-color:#8A6A00;font-weight:700}
#stage{position:relative;margin:8px auto;background:#8FD45E;border-radius:12px;touch-action:none;overflow:hidden}
#stage img.pl{position:absolute;pointer-events:none}#stage .fr{position:absolute;touch-action:none;cursor:grab}
#stage .fr.sel{outline:2px dashed #fff;outline-offset:2px;border-radius:6px}
#stage .fr b{position:absolute;left:-6px;top:-6px;background:#3B2A18;color:#fff;font-size:11px;border-radius:8px;padding:0 4px;pointer-events:none}
.row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:6px 0}input[type=range]{width:180px}
textarea{width:100%;height:120px;font:12px monospace;box-sizing:border-box}button.b{font:inherit;padding:6px 12px;border-radius:8px;border:1.5px solid #8A6A00;background:#F2C230;font-weight:700}
#farm{position:relative;margin:8px auto;background:#8FD45E;border-radius:12px;overflow:hidden}#farm *{position:absolute;pointer-events:none}</style></head><body>
<h1>果實掛點工具（${T.BUILD}）</h1>
<p class="note">不放進遊戲。選作物後拖曳果實到植株上想要的位置，滑桿調大小。數字 1、2、3 是採收順序：剩 3 次畫 1–3、剩 2 次畫 1–2、剩 1 次只畫 1。甘藍家族只有 1 顆，1→2→3 依次縮小（三個點建議放同一處）。調好後按「複製 JSON」，把整段貼回 index.html 的 <code>const FRUIT_AT=…;</code>。</p>
<div class="crops" id="crops"></div>
<div class="row"><label>果皮 <select id="skin"></select></label><label>大小 <select id="size"><option value="0.45">迷你</option><option value="0.72">小</option><option value="1" selected>中</option><option value="1.32">大</option><option value="1.72">巨大</option></select></label><label><input type="checkbox" id="unripe"> 結果期（70%、偏綠）</label></div>
<div id="stage"></div>
<div class="row"><span id="selTxt">點一顆果實來調大小</span><input type="range" id="sz" min="0.3" max="1.6" step="0.01"><span id="szv"></span></div>
<h2>農地排列預覽（遊戲中的實際間距與縮小比例，看前排有沒有擋到後排的果實）</h2><div id="farm"></div>
<h2>FRUIT_AT</h2><textarea id="out" readonly></textarea>
<div class="row"><button class="b" id="copy">複製 JSON</button><button id="reset" style="font:inherit;padding:6px 12px">還原成遊戲目前的值</button><span id="msg" class="note"></span></div>
<script>
${src}
const CROPS9=${JSON.stringify(CROPS9)},CNAME=${JSON.stringify(CNAME)},FS=${JSON.stringify(FS)},IMG=${JSON.stringify(IMG)},DEFC=${JSON.stringify(DEFC)};
const ORIG=JSON.parse(JSON.stringify(FRUIT_AT));
let AT=JSON.parse(JSON.stringify(FRUIT_AT));try{const v=JSON.parse(localStorage.getItem('fruitAnchor')||'null');if(v&&typeof v==='object')for(const c of CROPS9)if(Array.isArray(v[c])&&v[c].length===3)AT[c]=v[c]}catch(e){}
let crop='tomato',sel=0,skin=DEFC[crop];const BASES={},URLS={};
function base(c){if(BASES[c])return Promise.resolve(BASES[c]);return new Promise(res=>{const im=new Image();im.onload=()=>{const cv=document.createElement('canvas');cv.width=im.naturalWidth;cv.height=im.naturalHeight;const x=cv.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,cv.width,cv.height);BASES[c]=fruitPrep(d.width,d.height,d.data);res(BASES[c])};im.src=IMG[c+'_b0']})}
function furl(c,B,ripe){const k=c+'|'+skin+'|'+ripe;if(URLS[k])return URLS[k];const px=fruitPaint(B,{skin,pat:null,level:0},ripe,hashStr(k));const cv=document.createElement('canvas');cv.width=B.w;cv.height=B.h;const x=cv.getContext('2d');const id=x.createImageData(B.w,B.h);id.data.set(px);x.putImageData(id,0,0);return URLS[k]=cv.toDataURL()}
const out=document.getElementById('out'),stage=document.getElementById('stage'),farm=document.getElementById('farm');
function save(){try{localStorage.setItem('fruitAnchor',JSON.stringify(AT))}catch(e){}out.value='const FRUIT_AT={'+CROPS9.map(c=>c+':'+JSON.stringify(AT[c].map(p=>p.map(v=>Math.round(v*100)/100)))).join(',')+'};'}
/* 一顆果實在畫面上的大小：和遊戲 plantFruitsSVG／fruitImgSVG 相同的算法；box＝果實框（植株座標 cd.fs×大小×階段×s） */
function fruitBox(c,B,k,scale){const mul=document.getElementById('unripe').checked?0.7:1,sz=FS[c]*(+document.getElementById('size').value)*mul*k*scale;const m=(FRUIT_SHAPE_MUL[c+'_b0']||1)*0.82,s=Math.min(3/B.w,3.2/B.h)*m;return {sz,w:B.w*s*sz/3,h:B.h*s*sz/3}}
function draw(){
  document.querySelectorAll('#crops button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.c===crop));
  const dim=PLANT_IMG[crop][2],H=PLANT_H[crop],dispH=Math.min(320,innerWidth*0.8*dim[1]/dim[0]),dispW=dispH*dim[0]/dim[1],scale=dispH/H;
  stage.style.width=(dispW+60)+'px';stage.style.height=(dispH+40)+'px';const ox=30,oy=20;
  base(crop).then(B=>{const ripe=document.getElementById('unripe').checked?0:1,url=furl(crop,B,ripe);
    let hh='<img class="pl" src="../assets/crops/'+crop+'_3.png" style="left:'+ox+'px;top:'+oy+'px;width:'+dispW+'px;height:'+dispH+'px">';
    AT[crop].forEach(([u,v,k],i)=>{const f=fruitBox(crop,B,k,scale);hh+='<div class="fr'+(i===sel?' sel':'')+'" data-i="'+i+'" style="left:'+(ox+u*dispW-f.w/2)+'px;top:'+(oy+v*dispH-f.h/2)+'px;width:'+f.w+'px;height:'+f.h+'px;background:url('+url+') center/100% 100%"><b>'+(i+1)+'</b></div>'});
    stage.innerHTML=hh;stage._g={ox,oy,dispW,dispH};
    document.getElementById('sz').value=AT[crop][sel][2];document.getElementById('szv').textContent=AT[crop][sel][2].toFixed(2);document.getElementById('selTxt').textContent='第 '+(sel+1)+' 顆的大小';
    drawFarm(B,url);save()});
}
/* 農地：3×3 菱形交錯（左右 84、上下 24），植株縮成 0.72，和遊戲 plotSVG 相同 */
function drawFarm(B,url){
  const K=0.72,H=PLANT_H[crop],dim=PLANT_IMG[crop][2],h=H*K,w=h*dim[0]/dim[1],z=1.6;/* z：預覽放大倍數 */
  const pts=[];for(let r=0;r<5;r++)for(let c=0;c<3;c++)pts.push([60+84*c+(r%2)*42,70+24*r]);
  const W=60+84*3+42,HH=70+24*4+30;farm.style.width=W*z+'px';farm.style.height=HH*z+'px';
  let hh='';for(const [x,y] of pts){hh+='<div style="left:'+(x-41)*z+'px;top:'+(y-23)*z+'px;width:'+82*z+'px;height:'+46*z+'px;background:#D9A15F;clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%)"></div>'}
  for(const [x,y] of pts){const yy=y+3;hh+='<img src="../assets/crops/'+crop+'_3.png" style="left:'+(x-w/2)*z+'px;top:'+(yy-h)*z+'px;width:'+w*z+'px;height:'+h*z+'px">';
    const list=FRUIT_ONE[crop]?[AT[crop][0]]:AT[crop];
    for(const [u,v,k] of list){const f=fruitBox(crop,B,k,K*z);hh+='<div style="left:'+((x-w/2+u*w)*z-f.w/2)+'px;top:'+((yy-h+v*h)*z-f.h/2)+'px;width:'+f.w+'px;height:'+f.h+'px;background:url('+url+') center/100% 100%"></div>'}}
  farm.innerHTML=hh;
}
document.getElementById('crops').innerHTML=CROPS9.map(c=>'<button data-c="'+c+'">'+CNAME[c]+'</button>').join('');
document.getElementById('crops').onclick=e=>{const b=e.target.closest('button');if(!b)return;crop=b.dataset.c;sel=0;skin=DEFC[crop];document.getElementById('skin').value=skin;draw()};
document.getElementById('skin').innerHTML=['white','green','yellow','red','purple','black'].map(k=>'<option value="'+k+'">'+(CN[k]||k)+'</option>').join('');document.getElementById('skin').value=skin;
document.getElementById('skin').onchange=e=>{skin=e.target.value;draw()};document.getElementById('size').onchange=draw;document.getElementById('unripe').onchange=draw;
document.getElementById('sz').oninput=e=>{AT[crop][sel][2]=+e.target.value;draw()};
let drag=null;
stage.addEventListener('pointerdown',e=>{const f=e.target.closest('.fr');if(!f)return;sel=+f.dataset.i;const g=stage._g,r=stage.getBoundingClientRect();drag={id:e.pointerId,g,r,dx:e.clientX-r.left-(g.ox+AT[crop][sel][0]*g.dispW),dy:e.clientY-r.top-(g.oy+AT[crop][sel][1]*g.dispH)};try{stage.setPointerCapture(e.pointerId)}catch(err){}document.querySelectorAll('#stage .fr').forEach(x=>x.classList.toggle('sel',+x.dataset.i===sel));document.getElementById('sz').value=AT[crop][sel][2];document.getElementById('szv').textContent=AT[crop][sel][2].toFixed(2);document.getElementById('selTxt').textContent='第 '+(sel+1)+' 顆的大小';e.preventDefault()});
stage.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const g=drag.g,x=e.clientX-drag.r.left-drag.dx,y=e.clientY-drag.r.top-drag.dy;AT[crop][sel][0]=Math.min(1.1,Math.max(-0.1,(x-g.ox)/g.dispW));AT[crop][sel][1]=Math.min(1.1,Math.max(-0.1,(y-g.oy)/g.dispH));const f=stage.querySelector('.fr[data-i="'+sel+'"]');if(f){f.style.left=(g.ox+AT[crop][sel][0]*g.dispW-f.offsetWidth/2)+'px';f.style.top=(g.oy+AT[crop][sel][1]*g.dispH-f.offsetHeight/2)+'px'}e.preventDefault()});
const end=e=>{if(drag&&e.pointerId===drag.id){drag=null;draw()}};stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
document.getElementById('copy').onclick=()=>{out.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}if(navigator.clipboard)navigator.clipboard.writeText(out.value).then(()=>{document.getElementById('msg').textContent='已複製'},()=>{});document.getElementById('msg').textContent=ok?'已複製':'已選取，請長按複製'};
document.getElementById('reset').onclick=()=>{AT=JSON.parse(JSON.stringify(ORIG));try{localStorage.removeItem('fruitAnchor')}catch(e){}draw()};
draw();
</script></body></html>`;
fs.writeFileSync(path.join(__dirname,'fruit_anchor.html'),page);
console.log('ok fruit_anchor.html',(page.length/1024).toFixed(0)+' KB');
