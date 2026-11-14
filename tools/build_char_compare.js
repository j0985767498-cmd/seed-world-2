/* 產生人物對照頁 tools/char_compare.html（不放進遊戲）
   用法：node tools/build_char_compare.js
   從 index.html 抽出角色區塊（「// ===== 角色（14k」到「// ===== 角色動畫」）與需要的小工具，
   用遊戲實際的 avatarSVG 畫出所有選項的 5 個方向，旁邊放 assets/ref 的參考圖。 */
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const h=fs.readFileSync(path.join(root,'index.html'),'utf8');
const a=h.indexOf('// ===== 角色（14k'),b=h.indexOf('// ===== 角色動畫');
if(a<0||b<0)throw new Error('找不到角色區塊');
const line=re=>{const m=h.match(re);if(!m)throw new Error('找不到 '+re);return m[0]};
/* RGBC 跨多行，抓到下一個 '};' */
const ri=h.indexOf('const RGBC=');const RGBC=h.slice(ri,h.indexOf('};',ri)+2);
const helpers=[line(/const clamp=[^\n]*/),RGBC,line(/const rgbS=[^\n]*/),"const VIEWS=['side','fq','front','fq','side','bq','back','bq'];"].join('\n');
const avatar=h.slice(a,b);
const build=(h.match(/const BUILD='([^']*)'/)||[])[1]||'';

const page=`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>人物對照頁</title>
<style>body{margin:0;padding:12px;background:#EEF2F5;font:14px "Noto Sans TC",sans-serif;color:#3B2A18}h2{margin:20px 0 6px;font-size:17px}h3{margin:12px 0 4px;font-size:15px}
.row{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end}.card{background:#fff;border:1px solid #D8CFC0;border-radius:10px;padding:4px 6px;text-align:center;font-size:12px}
.card.new{border-color:#E0A23A;box-shadow:0 0 0 2px #F6D58E}.note{color:#6B5A48;font-size:13px}svg{display:block}
.refs{display:flex;flex-wrap:wrap;gap:10px}.refs figure{margin:0;background:#fff;border:1px solid #D8CFC0;border-radius:10px;padding:4px;text-align:center;font-size:12px}
.refs img{width:300px;max-width:90vw;display:block}
.sec{display:grid;grid-template-columns:minmax(0,1fr);gap:10px}@media(min-width:1100px){.sec{grid-template-columns:320px minmax(0,1fr)}}</style></head><body>
<h1 style="font-size:20px;margin:0">人物對照頁（${build}）</h1>
<p class="note">這頁不會放進遊戲，只用來檢查人物畫風：用遊戲實際的繪圖程式（avatarSVG）畫出每個選項的 5 個方向（正面、斜前、側面、斜後、背面）。黃框是第 25 節新增的選項，旁邊是 assets/ref 的參考圖。改了 index.html 的角色程式後，執行 <code>node tools/build_char_compare.js</code> 重新產生。</p>
<h2>參考圖 ↔ 遊戲人物（預設造型）</h2><div class="row" id="ref"></div>
<h2>五個方向＋走路</h2><div class="row" id="dirs"></div>
<h2>和雪原素材並排（遊戲中的實際比例）</h2><div id="scene"></div>
<div id="opts"></div>
<script>
${helpers}
${avatar}
const V5=['front','fq','side','bq','back'],VN={front:'正面',fq:'斜前',side:'側面',bq:'斜後',back:'背面'};
const box=(av,v,w,pose)=>'<svg viewBox="-30 -66 60 70" width="'+w+'" height="'+(w*70/60)+'">'+avatarSVG(av,false,Object.assign({view:v},pose||{}))+'</svg>';
const headBox=(av,v,w)=>'<svg viewBox="-20 -60 40 40" width="'+w+'" height="'+w+'">'+avatarSVG(av,false,{view:v})+'</svg>';
document.getElementById('ref').innerHTML=['front','side','back'].map(v=>'<div class="card"><img src="../assets/ref/char_'+v+'.png" height="220"><br>參考：'+VN[v]+'</div><div class="card">'+box(AV_DEF,v,190)+'遊戲：'+VN[v]+'</div>').join('');
document.getElementById('dirs').innerHTML=V5.map(v=>'<div class="card">'+box(AV_DEF,v,110)+VN[v]+'</div>').join('')+[0,1.6,3.2].map(p=>'<div class="card">'+box(AV_DEF,'side',110,{ph:p})+'走路</div>').join('');
const S=[['small_pine',150,214,280,60],['cabin',132,244,260,190],['snowman',84,132,170,300],['bush',62,171,140,380],['boulder',56,116,110,440]];
let sc='<svg viewBox="0 0 520 220" width="100%" style="max-width:820px;background:#E9EFF4;border-radius:12px">';
for(const [f,dh,iw,ih,x] of S){const w=dh*iw/ih;sc+='<ellipse cx="'+x+'" cy="199" rx="'+(w*.34)+'" ry="5" fill="rgba(70,95,120,.2)"/><image href="../assets/snow/'+f+'.png" x="'+(x-w/2)+'" y="'+(200-dh)+'" width="'+w+'" height="'+dh+'"/>'}
[[120,AV_DEF],[250,{...AV_DEF,hair:11,hairC:3,top:9,topC:3,bottom:1,shoe:2,shoeC:3,hat:0,acc:7,accC:12,face:6,blush:1}],[480,{...AV_DEF,hair:21,hairC:1,top:12,topC:5,hat:9,acc:9,accC:7,shoe:3,shoeC:12,face:10}]].forEach(([x,av])=>{sc+='<g transform="translate('+x+' 200) scale(1.15)">'+avatarSVG(av,false,{view:'fq'})+'</g>'});
document.getElementById('scene').innerHTML=sc+'</svg><p class="note">松樹顯示高度 150、小木屋 132、雪人 84（和雪原地圖相同）；人物放大 1.15 倍（和遊戲相同）。</p>';
/* 第 25 節：每類新增從第幾號開始，參考圖檔 */
const NEW={face:6,hair:11,hat:5,top:6,bottom:3,shoe:2,acc:7,blush:1};
const REF={face:['ref_face'],hair:['ref_hair_a','ref_hair_b'],hat:['ref_hat'],top:['ref_top_a','ref_top_b'],bottom:['ref_top_b'],shoe:['ref_shoe_acc'],acc:['ref_shoe_acc']};
const T={face:'表情',blush:'腮紅',hair:'髮型（不戴帽子）',hat:'帽子',top:'上衣',bottom:'下身（上衣換成 T 恤，吊帶褲、洋裝會蓋住下身）',shoe:'鞋子',acc:'配件'};
const BASE={top:{bottom:1},shoe:{top:0,bottom:1},bottom:{top:0},acc:{top:0}};
let o='';
for(const k of Object.keys(T)){
  const refs=(REF[k]||[]).map(f=>'<figure><img src="../assets/ref/'+f+'.png" loading="lazy"><figcaption>'+f+'.png</figcaption></figure>').join('');
  let cards='';AV_OPT[k].forEach((n,i)=>{const av={...AV_DEF,...(BASE[k]||{}),[k]:i};if(k==='hair')av.hat=0;if(k==='top'&&i===9)av.topC=3;if(k==='shoe'&&i===2)av.shoeC=3;
    const head=k==='face'||k==='blush';cards+='<div class="card'+(i>=NEW[k]?' new':'')+'"><div class="row" style="gap:0">'+V5.map(v=>head?headBox(av,v,62):box(av,v,62)).join('')+'</div>'+i+'. '+n+'</div>'});
  o+='<h2>'+T[k]+'</h2><div class="sec">'+(refs?'<div class="refs">'+refs+'</div>':'<div></div>')+'<div class="row">'+cards+'</div></div>';
}
o+='<h2>表情 × 腮紅（臉部放大）</h2><div class="row">'+AV_OPT.face.map((n,i)=>'<div class="card">'+headBox({...AV_DEF,face:i,blush:1},'front',80)+n+'＋腮紅</div>').join('')+'</div>';
o+='<h2>膚色與髮色</h2><div class="row">'+SKINS.map((c,i)=>'<div class="card">'+box({...AV_DEF,skin:i},'front',60)+'膚色 '+(i+1)+'</div>').join('')+HAIRC.map((c,i)=>'<div class="card">'+box({...AV_DEF,hairC:i},'front',60)+'髮色 '+(i+1)+'</div>').join('')+'</div>';
o+='<h2>布料（之後標本解鎖用：果實顏色＋花紋＋徽章）</h2><div class="row">'+AV_FAB_P.map((n,p)=>'<div class="card">'+box({...AV_DEF,top:6,bottom:1,fab:{top:{c:['red','starry','blue','gold','green'][p],p,pc:'white',b:1},acc:{c:3,p:(p+1)%5,pc:6}},acc:8},'front',90)+n+'</div>').join('')
  +[[5,'漁夫帽'],[6,'寬邊遮陽帽'],[7,'貓耳毛帽'],[8,'報童帽']].map(([hh,n])=>'<div class="card">'+box({...AV_DEF,hat:hh,fab:{hat:{c:'starry',p:2,pc:'gold'}},acc:7,fab2:0},'front',90)+n+'（星空星點）</div>').join('')
  +'<div class="card">'+box({...AV_DEF,top:0,acc:7,fab:{acc:{c:'purple',p:1,pc:'white'}}},'front',90)+'斜背包（斑點）</div></div>';
document.getElementById('opts').innerHTML=o;
</script></body></html>`;
fs.writeFileSync(path.join(__dirname,'char_compare.html'),page);
console.log('寫入 tools/char_compare.html',(page.length/1024).toFixed(1)+' KB');
