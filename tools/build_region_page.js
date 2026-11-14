// 地區總覽頁產生器（不放進遊戲，第 27 節 27.6）
// 用法（在專案資料夾執行）：node tools/build_region_page.js grass   （或 snow、forest、desert、marsh）
// 產生：tools/region_<地區>.html
// 用遊戲實際的地圖程式（regPrep）畫出該地區每張圖，疊上：碰撞框（紅）、可走區（綠，橋／石階）、水面輪廓、出口、植株點（綠圈）、道具點（黃菱形），
// 並用 10px 格子檢查每張圖從入口走得到的範圍（灰色＝走不到）。最下面是角色、野生植株、物件的實際比例。
const fs=require('fs'),vm=require('vm'),path=require('path');
const bk=process.argv[2]||'grass';
const root=path.join(__dirname,'..');
const h=fs.readFileSync(path.join(root,'index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={newGame,REGION_MAPS,REGION_CFG,regPrep,regBlocked,regArrival,regPlants,regItems,wpSVG,itemSVG,avatarSVG,AV_DEF,BUILD,BIOMES};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams,Image:function(){return {}}};
ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
try{vm.runInContext(fs.readFileSync(path.join(root,'assets','char','av3.js'),'utf8'),ctx)}catch(e){}
const T=ctx.T;T.newGame();
const MS=T.REGION_MAPS[bk];if(!MS){console.log('沒有這個地區的地圖：'+bk);process.exit(1)}
const C=T.REGION_CFG[bk],fix=s=>s.replace(/href="assets\//g,'href="../assets/');
const exitPt=(M,id,e)=>e.to==='farm'?[e.c,M.B.y1-18]:T.regArrival(bk,id,e.to);
function bfs(M,s0){const seen=new Set(),q=[[Math.round(s0[0]/10),Math.round(s0[1]/10)]];
  while(q.length){const [gx,gy]=q.pop(),k=gx+','+gy;if(seen.has(k))continue;seen.add(k);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=gx+dx,ny=gy+dy;if(!seen.has(nx+','+ny)&&!T.regBlocked(M,nx*10,ny*10))q.push([nx,ny])}}return seen}
const day=1000;let cards='',maxX=1,maxY=1;
for(const [id,M0] of Object.entries(MS)){const M=T.regPrep(bk,id);maxX=Math.max(maxX,M0.gx);maxY=Math.max(maxY,M0.gy+1);
  const seen=bfs(M,exitPt(M,id,M.exits[0]));
  let un='';for(let y=M.B.y0;y<=M.B.y1;y+=10)for(let x=M.B.x0;x<=M.B.x1;x+=10){const k=Math.round(x/10)+','+Math.round(y/10);if(!seen.has(k)&&!T.regBlocked(M,x,y))un+=`<rect x="${x-5}" y="${y-5}" width="10" height="10" fill="#555" opacity=".45"/>`}
  let ov='';
  for(const r of M.blk)ov+=`<rect x="${r[0]}" y="${r[1]}" width="${r[2]-r[0]}" height="${r[3]-r[1]}" fill="rgba(220,40,40,.28)" stroke="#C02020" stroke-width="2"/>`;
  for(const r of M.wlk)ov+=`<rect x="${r[0]}" y="${r[1]}" width="${r[2]-r[0]}" height="${r[3]-r[1]}" fill="rgba(40,200,80,.3)" stroke="#1A8A3A" stroke-width="3"/>`;
  for(const [cx,cy,rx,ry] of M.lk)ov+=`<ellipse cx="${cx}" cy="${cy}" rx="${rx-6}" ry="${ry-6}" fill="none" stroke="#1060C0" stroke-width="3" stroke-dasharray="10 6"/>`;
  for(const [pts,wd] of M.rv)ov+=`<polyline points="${pts.map(q=>q.join(',')).join(' ')}" fill="none" stroke="#1060C0" stroke-width="3" stroke-dasharray="10 6"/>`;
  ov+=`<rect x="${M.B.x0}" y="${M.B.y0}" width="${M.B.x1-M.B.x0}" height="${M.B.y1-M.B.y0}" fill="none" stroke="#222" stroke-width="3" stroke-dasharray="14 8"/>`;
  for(const e of M.exits){const [x,y]=exitPt(M,id,e),nm=e.to==='farm'?'農場':MS[e.to].n;ov+=`<circle cx="${x}" cy="${y}" r="14" fill="#7A3FC0" stroke="#fff" stroke-width="3"/><text x="${x}" y="${y-22}" text-anchor="middle" font-size="30" font-weight="700" fill="#5A1FA0" stroke="#fff" stroke-width="6" paint-order="stroke">→ ${nm}</text>`}
  for(const [x,y] of M.spawns)ov+=`<circle cx="${x}" cy="${y}" r="16" fill="none" stroke="#0A8A2A" stroke-width="5"/>`;
  for(const [x,y] of M.items)ov+=`<path d="M${x} ${y-18} L${x+14} ${y} L${x} ${y+18} L${x-14} ${y}Z" fill="#F2C230" stroke="#7A5A00" stroke-width="3"/>`;
  const objs=M._objs.map(o=>o.h).join('');
  cards+=`<div class="card" style="grid-column:${M0.gx};grid-row:${M0.gy+1}"><b>${M0.n}</b>${M0.cave?'（洞內）':''}<small> ${id}・植株 ${M.spawns.length}・道具 ${M.items.length}</small>
  <svg viewBox="-20 -20 ${M.W+40} ${M.H+40}" width="260">${fix(M._ground)}${objs.replace(/href="assets\//g,'href="../assets/')}<g class="ov">${un}${ov}</g></svg></div>`;
}
/* 實際比例：入口那張圖的一角＋角色＋野生植株 */
const E=T.regPrep(bk,'entry'),pl=T.regPlants(bk,'entry',day);let scale='';
try{const w=pl[0]||{key:'x',x:400,y:700,crop:T.BIOMES[bk].crops[0][0],rel:false,seed:1,bk};
  const wv={...w,x:420,y:760};
  scale=`<svg viewBox="200 560 400 320" width="400" height="320" style="background:#fff;border-radius:10px">${fix(E._ground)}${E._objs.map(o=>o.h).join('').replace(/href="assets\//g,'href="../assets/')}${T.wpSVG(wv,false)}<g transform="translate(340 780) scale(1.15)">${T.avatarSVG(T.AV_DEF,false,{view:'front'})}</g></svg>`}catch(e){scale='（無法產生：'+e.message+'）'}
const page=`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${C.name}總覽</title>
<style>body{margin:0;padding:12px;background:#EEF2F5;font:14px "Noto Sans TC",sans-serif;color:#3B2A18}h1{font-size:20px;margin:0}h2{font-size:16px;margin:16px 0 6px}
.grid{display:grid;grid-template-columns:repeat(${maxX},270px);gap:10px;overflow-x:auto}.card{background:#fff;border-radius:10px;padding:5px}.card small{color:#7A6A58}
.note{color:#6B5A48;font-size:13px}label{font-size:13px}.hideov .ov{display:none}</style></head><body>
<h1>${C.name}總覽（${T.BUILD}）</h1>
<p class="note">不放進遊戲。每張圖照小地圖的位置排列（左下是靠近農場那邊）。紅框＝擋路、綠框＝可走（橋、石階）、藍虛線＝水面擋路範圍、黑虛線＝可走邊界、紫點＝出口抵達點、綠圈＝植株點、黃菱形＝道具點、灰格＝從入口走不到的地方（應該只有被圍起來的空地）。</p>
<label><input type="checkbox" onchange="document.body.classList.toggle('hideov',this.checked)"> 隱藏標記，只看畫面</label>
<div class="grid">${cards}</div>
<h2>實際比例（角色、野生植株、物件；遊戲中人物放大 1.15 倍）</h2>${scale}
</body></html>`;
fs.writeFileSync(path.join(__dirname,`region_${bk}.html`),page);
console.log('ok',`region_${bk}.html`,(page.length/1024).toFixed(0)+' KB');
