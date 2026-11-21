/* 地圖版面色塊圖（第 146 節）：給 AI 畫地面用的結構參考。只做工具，不改遊戲。
   用法（在專案資料夾執行）：node tools/export_layout.js <地區> <地圖 id>      例：node tools/export_layout.js ruins plaza
   輸出：tools/layout/<地區>_<地圖>.png（正上方俯視、長邊 1024 像素、純色、不描邊、不寫字、不畫物件）
        tools/layout/<地區>_<地圖>.json（世界尺寸、每像素幾個遊戲單位、最接近的 Leonardo 比例）
   顏色：路面 #8a8a8a、人行磚／地磚 #c8c8c8、草地／土地 #7fb069、水 #4a90c8、淺水 #8cc8e8、懸崖／牆／不能走 #3a3030、坑洞 #000000 */
const fs=require('fs'),vm=require('vm'),path=require('path'),zlib=require('zlib');
const bk=process.argv[2],id=process.argv[3];
if(!bk||!id){console.log('用法：node tools/export_layout.js <地區> <地圖 id>');process.exit(1)}
const root=path.join(__dirname,'..');
const h=fs.readFileSync(path.join(root,'index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={newGame,REGION_MAPS,REGION_ART,regPrep,v2pip,v2ribIn};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams,Image:function(){},MutationObserver:function(){this.observe=()=>{}}};
ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);const T=ctx.T;T.newGame();
const MS=T.REGION_MAPS[bk];if(!MS||!MS[id]){console.log('沒有這張地圖：'+bk+' '+id);process.exit(1)}
const M=T.regPrep(bk,id),W=M.W,H=M.H,B=M.B;
const C={road:[0x8a,0x8a,0x8a],tile:[0xc8,0xc8,0xc8],grass:[0x7f,0xb0,0x69],water:[0x4a,0x90,0xc8],shallow:[0x8c,0xc8,0xe8],wall:[0x3a,0x30,0x30],pit:[0,0,0]};
const S=1024/Math.max(W,H),PW=Math.round(W*S),PH=Math.round(H*S),U=1/S;
/* 地形判斷（物件的碰撞不算：物件會疊在地面圖上） */
const roads=(M._P||[]).filter(p=>p.rb),inRib=(rb,x,y,pad)=>T.v2ribIn(rb,x,y,pad||0);
const floods=(M.objs||[]).filter(o=>o[0]==='flood').map(o=>[o[1],o[2]-58,64,38]);/* 淹水路面（地面層）當淺水 */
function cls(x,y){
  if(M.pit){const [cx,cy,rx,ry]=M.pit;if(((x-cx)/rx)**2+((y-cy)/ry)**2<1)return 'pit'}
  for(const [cx,cy,rx,ry] of floods)if(((x-cx)/rx)**2+((y-cy)/ry)**2<1)return 'shallow';
  if(!M.ice){for(const G of M._LG||[]){if(x>G.bb[0]&&x<G.bb[2]&&y>G.bb[1]&&y<G.bb[3]&&T.v2pip(G.poly?G.poly(0):G.blk,x,y)){const deep=T.v2pip(G.poly?G.poly(-14):G.blk,x,y);return deep?'water':'shallow'}}
    for(const r of M._RV||[]){if(inRib(r.rb,x,y,0))return inRib(r.rb,x,y,-12)?'water':'shallow'}}
  if(M._CH&&inRib(M._CH.rb,x,y,0))return 'wall';
  for(const p of roads){if(inRib(p.rb,x,y,0))return p.road||p.w>=50?'road':'grass'}/* 路先算：出口的路要一路畫到地圖邊 */
  if(x<B.x0||x>B.x1||y<B.y0||y>B.y1)return 'wall';
  for(const p of roads)if(p.road&&inRib(p.rb,x,y,13))return 'tile';/* 路兩邊的人行磚 */
  if(M.cave)return 'tile';/* 洞內、大廳的地磚 */
  return 'grass'}
const raw=Buffer.alloc((PW*3+1)*PH);
for(let j=0;j<PH;j++){raw[j*(PW*3+1)]=0;for(let i=0;i<PW;i++){const c=C[cls((i+0.5)*U,(j+0.5)*U)];const o=j*(PW*3+1)+1+i*3;raw[o]=c[0];raw[o+1]=c[1];raw[o+2]=c[2]}}
/* PNG（RGB、不壓 alpha） */
const crcT=new Int32Array(256).map((_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;return c});
const crc=b=>{let c=-1;for(const x of b)c=crcT[(c^x)&255]^(c>>>8);return (c^-1)>>>0};
const chunk=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c])};
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(PW,0);ihdr.writeUInt32BE(PH,4);ihdr[8]=8;ihdr[9]=2;ihdr[10]=0;ihdr[11]=0;ihdr[12]=0;
const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
const out=path.join(__dirname,'layout');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,`${bk}_${id}.png`),png);
const RATIOS=[['1:1',1],['2:3',2/3],['3:2',3/2],['9:16',9/16],['16:9',16/9]],ar=W/H,best=RATIOS.reduce((a,b)=>Math.abs(Math.log(b[1]/ar))<Math.abs(Math.log(a[1]/ar))?b:a);
const info={map:`${bk}/${id}`,name:MS[id].n,world:{w:W,h:H},walkable:{x0:B.x0,y0:B.y0,x1:B.x1,y1:B.y1},image:{w:PW,h:PH},unitsPerPixel:+U.toFixed(4),aspect:+ar.toFixed(4),leonardo:best[0],colors:{road:'#8a8a8a',tile:'#c8c8c8',grass:'#7fb069',water:'#4a90c8',shallow:'#8cc8e8',wall:'#3a3030',pit:'#000000'}};
fs.writeFileSync(path.join(out,`${bk}_${id}.json`),JSON.stringify(info,null,1));
console.log('ok',`tools/layout/${bk}_${id}.png`,PW+'x'+PH,'leonardo',best[0]);
