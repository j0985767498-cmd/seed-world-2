/* 108（17x）：3D 繪圖模組（three.js r128，lib/three.min.js）。
   做法照 tools/proto_25d/index.html（使用者確認過的試做頁）：程式畫的地面貼圖、高度網格地形、葉叢樹、立牌（自訂著色器、輪廓影子）、省電。
   遊戲邏輯一律照舊用 2D 地圖座標（800×1100 px）：這裡只負責「畫」與「點擊換算」。地圖 1px＝1/43 單位，地圖 x→3D x、地圖 y→3D z。
   對外：w3dEnter(地區,地圖)、w3dLeave()、w3dSetPlayer(x,y,方向,動作)、w3dSetOthers(list)、w3dSetMonsters(list)、w3dSetPlants(list)、w3dPick(螢幕x,y)、w3dDirty()。
   index.html 的 W3D_HOST 提供地圖資料、角色與植株的 SVG、省電與閒置的幀數上限、點擊之後要做什麼。 */
(function(){
'use strict';
const T3=window.THREE;
const U=1/43,PAD=12,CK=1.215;/* CK：SVG 裡的角色約 62px，3D 裡照 108.1 做成 1.75 單位高，植株、道具、怪物用同一個比例 */
const TREE_K=1.25;/* 2D 素材的樹冠畫得比較緊湊，3D 放大一點，和試做頁的比例接近 */
const VIEWS3=[['低',38,30],['中',50,32],['高',64,36]];
const lin=v=>Math.pow(Math.max(0,Math.min(1,v)),2.2);
const sstep=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
function hsh(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function mkRnd(seed){let s=(seed%2147483646)+1;return ()=>{s=(s*16807)%2147483647;return (s-1)/2147483646}}
const hex=c=>new T3.Color(c);

let R=null,W=null;/* R：渲染器（只建一次）；W：目前這張圖的 3D 世界 */
let vi=0;try{vi=Math.max(0,Math.min(2,+localStorage.getItem('sw_3dview')||0))}catch(e){}

/* ---------- 渲染器 ---------- */
function ensureR(){if(R)return R;
  const cv=document.createElement('canvas');cv.id='w3dc';cv.setAttribute('aria-label','遊戲畫面（3D）');
  const sc=document.getElementById('scene');sc.parentNode.insertBefore(cv,sc.nextSibling);
  const rd=new T3.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'low-power'});
  rd.outputEncoding=T3.sRGBEncoding;rd.shadowMap.enabled=true;rd.shadowMap.type=T3.PCFSoftShadowMap;
  R={cv,rd,raf:0,draws:0,last:0,lastDraw:0,eco:null};
  addEventListener('resize',()=>{if(W){sizeR();W.dirty=true}});
  /* 點擊：手指沒有移動超過 12px 才算點 */
  let down=null;
  cv.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY,performance.now()]},{passive:true});
  cv.addEventListener('pointerup',e=>{if(!down||!W)return;const [x,y,t]=down;down=null;if(Math.hypot(e.clientX-x,e.clientY-y)>12||performance.now()-t>600)return;const p=w3dPick(e.clientX,e.clientY);if(p)try{W3D_HOST.tap(p)}catch(er){console.error(er)}});
  return R}
function sizeR(){const eco=W3D_HOST.eco();R.rd.setPixelRatio(Math.min(window.devicePixelRatio||1,eco?1.5:2));R.rd.setSize(innerWidth,innerHeight,false);R.cv.style.width='100vw';R.cv.style.height='100dvh';
  if(W){W.cam.aspect=innerWidth/innerHeight;W.cam.updateProjectionMatrix()}}

/* 走出地圖的路（出口）往外再延伸 400px，畫面靠邊時路不會突然斷掉 */
function extPaths(M){const B=M.B,out=[];for(const p of M._P||[]){const P=p.rb.pts,n=P.length;if(n<8)continue;
  for(const [i,j] of [[0,6],[n-1,n-7]]){const [x,y]=P[i];if(x>B.x0&&x<B.x1&&y>B.y0&&y<B.y1)continue;const dx=x-P[j][0],dy=y-P[j][1],d=Math.hypot(dx,dy)||1;out.push({a:[x,y],b:[x+dx/d*400,y+dy/d*400],hw:p.rb.hw[i]})}}
  return out}
/* ---------- 高度網格 ---------- */
function buildHeight(M,rnd){const MW=M.W*U,MD=M.H*U,x0=-PAD,z0=-PAD,w=MW+PAD*2,d=MD+PAD*2,st=(M._T&&M._T.length)||(M._LG&&M._LG.length)||(M._RV&&M._RV.length)?0.35:0.5,nx=Math.ceil(w/st)+1,nz=Math.ceil(d/st)+1,G=new Float32Array(nx*nz);
  const pts=[];for(const p of M._P||[]){const rb=p.rb;for(let i=0;i<rb.pts.length;i+=2)pts.push([rb.pts[i][0]*U,rb.pts[i][1]*U,rb.hw[i]*U])}
  for(const e of extPaths(M))for(let t=0;t<=1;t+=0.05)pts.push([(e.a[0]+(e.b[0]-e.a[0])*t)*U,(e.a[1]+(e.b[1]-e.a[1])*t)*U,e.hw*U]);
  const B=M.B,bx0=B.x0*U,bx1=B.x1*U,bz0=B.y0*U,bz1=B.y1*U,ph=rnd()*6,ph2=rnd()*6;
  const WP=waterPolys(M),wbb=WP.bb;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+i*st,z=z0+j*st;
    let h=0.22*Math.sin(x*0.55+ph)*Math.cos(z*0.45-0.4)+0.1*Math.sin(x*0.9+z*0.7+ph2)+0.035*Math.cos(x*1.6-z*1.2);
    let pd=1e9;for(const [px,pz,hw] of pts){const dd=Math.hypot(x-px,z-pz)-hw;if(dd<pd)pd=dd}
    const fl=1-sstep(0,1.4,pd);h*=1-0.85*fl;h+=0.3;/* 墊高 0.3：沒有水的地方不會低於水面 */
    /* 地圖外面慢慢隆起成小丘，把場景圍起來（路經過的地方壓平） */
    const out=Math.max(bx0-x-0.8,x-bx1-0.8,bz0-z-1.8,z-bz1-2.5,0);h+=Math.min(3.2,0.32*out*out*0.5+0.25*out)*(1-fl*0.9);
    /* 108.2：高台（崖頂一整片抬高）＋石階改成草地緩坡 */
    if(M._T&&M._T.length){const px=x/U,py=z/U;let add=0;for(const T of M._T){const E=T.E(px),Bt=T.Bt(px);let hp=PLAT*sstep(Bt-8,E+(Bt-E)*0.45,py);/* 崖面集中在崖壁那一段的下半部，看起來是陡的 */
      const dx=px-T.top[0],dy=py-T.top[1],sa=dx*T.u[0]+dy*T.u[1],wl=Math.abs(dx*T.u[1]-dy*T.u[0]),core=(T.gap[1]-T.gap[0])/2;
      const hr=PLAT*sstep(0,1,1+sa*U/RAMP_L)*(1-sstep(core,core+RAMP_SH/U,wl));add=Math.max(add,hp,hr)}h+=add}
    /* 108.4：河、池只能往下挖 */
    if(WP.list.length&&x>wbb[0]-1.5&&x<wbb[2]+1.5&&z>wbb[1]-1.5&&z<wbb[3]+1.5){const r=waterDist(WP,x/U,z/U);
      if(r.inside)h=Math.min(h,WSURF+0.02-0.64*sstep(6,52,r.d));else if(r.d<60)h=Math.min(h,WSURF+0.02+r.d*U*0.3)}/* 碰撞讓水邊往內 6px 還能走，那一圈留乾的 */
    G[j*nx+i]=h}
  return {G,nx,nz,x0,z0,st,w,d,MW,MD}}
/* 水域：湖（v2lakeGroups 的外輪廓）＋河（帶狀多邊形），全部用地圖 px */
const WSURF=-0.15,PLAT=2.8,RAMP_L=PLAT/0.3,RAMP_SH=4.5;
function waterPolys(M){const list=[];if(!M.ice)for(const G of M._LG||[])list.push({poly:G.poly(0),lake:1});for(const r of M._RV||[])list.push({poly:r.rb.poly,lake:0});
  const bb=[1e9,1e9,-1e9,-1e9];for(const L of list){let b=[1e9,1e9,-1e9,-1e9];for(const [x,y] of L.poly){b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.max(b[2],x);b[3]=Math.max(b[3],y)}L.bb=b;bb[0]=Math.min(bb[0],b[0]*U);bb[1]=Math.min(bb[1],b[1]*U);bb[2]=Math.max(bb[2],b[2]*U);bb[3]=Math.max(bb[3],b[3]*U)}
  return {list,bb}}
function pip(poly,x,y){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
function edgeD(poly,x,y){let d=1e9;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[j],b=poly[i],vx=b[0]-a[0],vy=b[1]-a[1],L=vx*vx+vy*vy||1;let t=((x-a[0])*vx+(y-a[1])*vy)/L;t=t<0?0:t>1?1:t;const ex=a[0]+vx*t-x,ey=a[1]+vy*t-y,e=ex*ex+ey*ey;if(e<d)d=e}return Math.sqrt(d)}
/* 回傳 {inside, d}：在水裡時 d＝離岸多遠（取最深的那片），在岸上時 d＝離最近的水多遠（px） */
function waterDist(WP,x,y){let din=-1,dout=1e9;for(const L of WP.list){const b=L.bb;if(x<b[0]-50||x>b[2]+50||y<b[1]-50||y>b[3]+50)continue;const e=edgeD(L.poly,x,y);if(pip(L.poly,x,y))din=Math.max(din,e);else dout=Math.min(dout,e)}
  return din>=0?{inside:true,d:din}:{inside:false,d:dout}}
function hAt(HF,x,z){const fx=(x-HF.x0)/HF.st,fz=(z-HF.z0)/HF.st;let i=Math.floor(fx),j=Math.floor(fz);i=Math.max(0,Math.min(HF.nx-2,i));j=Math.max(0,Math.min(HF.nz-2,j));const tx=Math.max(0,Math.min(1,fx-i)),tz=Math.max(0,Math.min(1,fz-j)),G=HF.G,n=HF.nx;
  return (G[j*n+i]*(1-tx)+G[j*n+i+1]*tx)*(1-tz)+(G[(j+1)*n+i]*(1-tx)+G[(j+1)*n+i+1]*tx)*tz}

/* ---------- 地面貼圖（canvas 程式畫，照試做頁） ---------- */
function buildGroundTex(M,HF,rnd){const C=REGION_CFG[M.bk],V=REG_V2[M.bk]||{};const CW=2048,CH=Math.round(2048*HF.d/HF.w),cv=document.createElement('canvas');cv.width=CW;cv.height=CH;const g=cv.getContext('2d');
  const sx=CW/HF.w,toC=(px,py)=>[(px*U-HF.x0)*sx,(py*U-HF.z0)*sx],K=U*sx;/* K：地圖 1px 在貼圖上幾 px */
  g.fillStyle=C.outer||C.ground;g.fillRect(0,0,CW,CH);
  {const [ax,ay]=toC(0,0),[bx,by]=toC(M.W,M.H);g.save();g.filter='blur(40px)';g.fillStyle=C.ground;g.fillRect(ax+20,ay+20,bx-ax-40,by-ay-40);g.restore();g.fillStyle=C.ground;g.fillRect(ax+60,ay+60,bx-ax-120,by-ay-120)}
  const blot=(x,y,r,c,a)=>{const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,c);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=a;g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.globalAlpha=1};
  const sp=(V.spots||C.spots||[C.ground]).concat(C.spots||[]);
  for(let i=0;i<380;i++)blot(rnd()*CW,rnd()*CH,40+rnd()*170,sp[i%sp.length],0.32);
  /* 高處偏亮、低處偏暗 */
  for(let i=0;i<900;i++){const x=HF.x0+rnd()*HF.w,z=HF.z0+rnd()*HF.d,h=hAt(HF,x,z),cx=(x-HF.x0)*sx,cz=(z-HF.z0)*sx;if(h>0.25)blot(cx,cz,60,V.hi||'#C6DC96',0.12);if(h<-0.15)blot(cx,cz,50,V.shade||'#4E6E2A',0.08)}
  /* 樹叢底下的樹蔭、陽光 */
  for(const [x,y,rx,ry] of M._shades||[]){const [cx,cy]=toC(x,y);g.save();g.translate(cx,cy);g.scale(1,ry/rx);blot(0,0,rx*K,V.shade||'#4E6E2A',0.22);g.restore()}
  for(const [x,y,rx,ry] of M.suns||[]){const [cx,cy]=toC(x,y);g.save();g.translate(cx,cy);g.scale(1,ry/rx);blot(0,0,rx*K,'#FFF6C8',0.22);g.restore()}
  /* 草葉筆觸 */
  const tf=V.tufts||['#86A85A','#8FB060'];
  for(let i=0;i<22000;i++){const x=rnd()*CW,y=rnd()*CH;g.strokeStyle=rnd()<0.5?'rgba(70,100,40,.30)':'rgba(205,228,150,.30)';if(rnd()<0.15)g.strokeStyle=tf[i%tf.length];g.lineWidth=1.4;g.beginPath();g.moveTo(x,y);g.lineTo(x+(rnd()-0.5)*3,y-4-rnd()*5);g.stroke()}
  /* 泥土路：柔和邊緣（多層），路面斑塊、小石子 */
  const PC=V.path||['#B5A678','#D2C598','#DCD0A6','#C6B88A','#A8997A'];
  for(const p of M._P||[]){const rb=p.rb,poly=rb.poly.map(q=>toC(q[0],q[1]));
    const fillP=()=>{g.beginPath();poly.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill()};
    g.save();g.filter='blur(14px)';g.fillStyle=PC[0];g.globalAlpha=0.55;fillP();g.restore();
    g.save();g.filter='blur(3px)';g.fillStyle=PC[1];g.globalAlpha=0.95;fillP();g.restore();
    g.save();g.beginPath();poly.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.clip();
    for(let i=0;i<rb.pts.length;i+=3){const [cx,cy]=toC(rb.pts[i][0],rb.pts[i][1]),r=rb.hw[i]*K;blot(cx+(rnd()-0.5)*r,cy+(rnd()-0.5)*r,r*(0.4+rnd()*0.5),rnd()<0.5?PC[2]:PC[3],0.45)}
    for(let i=0;i<rb.pts.length*5;i++){const k=Math.floor(rnd()*rb.pts.length),[cx,cy]=toC(rb.pts[k][0],rb.pts[k][1]),r=rb.hw[k]*K;g.fillStyle=rnd()<0.5?'rgba(120,96,60,.45)':'rgba(240,226,190,.5)';g.beginPath();g.arc(cx+(rnd()-0.5)*1.8*r,cy+(rnd()-0.5)*1.8*r,1+rnd()*2.2,0,7);g.fill()}
    g.restore()}
  for(const e of extPaths(M)){const a=toC(e.a[0],e.a[1]),b=toC(e.b[0],e.b[1]);g.lineCap='round';
    g.save();g.filter='blur(14px)';g.strokeStyle=PC[0];g.globalAlpha=0.55;g.lineWidth=e.hw*2*K*1.15;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();g.restore();
    g.save();g.filter='blur(3px)';g.strokeStyle=PC[1];g.globalAlpha=0.95;g.lineWidth=e.hw*2*K;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();g.restore()}
  /* 108.2：崖面畫岩石色塊（照坡度） */
  if(M._T&&M._T.length){const CC=(REGION_CFG[M.bk]||{}).cliff||['#9C8A6A','#857458'],st=0.11;let z0=1e9,z1=-1e9;for(const T of M._T)for(let px=0;px<=M.W;px+=40){z0=Math.min(z0,T.E(px)*U-1);z1=Math.max(z1,T.Bt(px)*U+1)}
    for(let x=-1;x<HF.MW+1;x+=st)for(let z=z0;z<z1;z+=st){const gr=Math.hypot(hAt(HF,x+0.12,z)-hAt(HF,x-0.12,z),hAt(HF,x,z+0.12)-hAt(HF,x,z-0.12))/0.24;if(gr<0.85)continue;
      const cx=(x-HF.x0)*sx,cz=(z-HF.z0)*sx,nz=Math.sin(x*3.1)*Math.cos(z*2.3)+Math.sin(x*7.3+z*3.0)*0.5,band=nz>0.4?2:(nz<-0.4?1:0);g.globalAlpha=Math.min(1,(gr-0.85)*2.2);g.fillStyle=[CC[0],CC[1],'#B3A383'][band];g.fillRect(cx-st*sx*0.62,cz-st*sx*0.62,st*sx*1.24,st*sx*1.24);
      if(rnd()<0.05){g.fillStyle='rgba(60,50,35,.45)';g.fillRect(cx-4,cz,8,1.5)}g.globalAlpha=1}}
  /* 108.4：濕泥岸、卵石、水底（水是半透明的，看得到底） */
  {const WP=waterPolys(M);if(WP.list.length){const V2=REG_V2[M.bk]||{},WC=V2.water||{},path=poly=>{g.beginPath();poly.forEach(([x,y],i)=>{const q=toC(x,y);i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])});g.closePath()};
    for(const L of WP.list){path(L.poly);g.save();g.filter='blur(10px)';g.strokeStyle=WC.wet||'#8FAC66';g.globalAlpha=0.9;g.lineWidth=36*K;g.stroke();g.restore()}
    for(const L of WP.list){path(L.poly);g.save();g.filter='blur(3px)';g.strokeStyle='#B8A678';g.globalAlpha=0.85;g.lineWidth=12*K;g.stroke();g.restore()}
    for(const L of WP.list){path(L.poly);g.save();g.filter='blur(6px)';g.fillStyle='#55704A';g.fill();g.restore()}
    for(let i=0;i<1600;i++){const L=WP.list[i%WP.list.length],k=Math.floor(rnd()*L.poly.length),[x,y]=L.poly[k],a=rnd()*6.28,r=rnd()*16,q=toC(x+Math.cos(a)*r,y+Math.sin(a)*r);g.fillStyle=['#9c9480','#b9b29c','#7f7a6a'][(rnd()*3)|0];g.beginPath();g.ellipse(q[0],q[1],1.4+rnd()*2.4,1+rnd()*1.6,rnd()*3,0,7);g.fill()}}}
  /* 花點（53.2-2 的小花點） */
  for(const [x,y,r,c] of M._drift||[]){const [cx,cy]=toC(x,y);g.fillStyle=c;g.beginPath();g.arc(cx,cy,r*K*0.75,0,7);g.fill()}
  for(let i=0;i<900;i++){const x=HF.x0+rnd()*HF.w,z=HF.z0+rnd()*HF.d,cx=(x-HF.x0)*sx,cz=(z-HF.z0)*sx;g.fillStyle=['#fffaf0','#ffe066','#f7d6e0','#ffffff'][(rnd()*4)|0];g.globalAlpha=0.7;g.beginPath();g.arc(cx,cz,1+rnd()*1.2,0,7);g.fill();g.globalAlpha=1}
  const t=new T3.CanvasTexture(cv);t.encoding=T3.sRGBEncoding;t.anisotropy=Math.min(8,R.rd.capabilities.getMaxAnisotropy());return t}

/* ---------- 立牌（自訂著色器：風吹搖動、底部陰暗、暖色調、霧、輪廓影子） ---------- */
const BB_VS=`uniform float uTime,uSway,uPhase;varying vec2 vUv;varying float vFog;
void main(){vUv=uv;vec3 p=position;float h=uv.y;p.x+=uSway*h*h*(sin(uTime*1.5+uPhase)+0.4*sin(uTime*2.7+uPhase*1.3));
vec4 mv=modelViewMatrix*vec4(p,1.);vFog=-mv.z;gl_Position=projectionMatrix*mv;}`;
const BB_FS=`uniform sampler2D map;uniform vec3 uTint,uFogC;uniform float uAO,uFlip,uNear,uFar,uFlash,uOp;varying vec2 vUv;varying float vFog;
void main(){vec2 uv=vec2(uFlip>0.5?1.-vUv.x:vUv.x,vUv.y);vec4 c=texture2D(map,uv);if(c.a<0.1)discard;
float ao=mix(uAO,1.,smoothstep(0.,0.28,vUv.y));vec3 rgb=c.rgb*uTint*ao;rgb=mix(rgb,vec3(1.),uFlash);
rgb=mix(rgb,uFogC,smoothstep(uNear,uFar,vFog));gl_FragColor=vec4(rgb,c.a*uOp);}`;
const SH_FS=`uniform sampler2D map;uniform float uFlip,uA,uOp;varying vec2 vUv;
void main(){vec2 uv=vec2(uFlip>0.5?1.-vUv.x:vUv.x,vUv.y);float a=texture2D(map,uv).a;a=step(0.3,a)*uA*uOp*(1.-vUv.y*0.7);if(a<0.01)discard;gl_FragColor=vec4(0.10,0.16,0.05,a);}`;
const SH_DIR=Math.atan2(-0.55,-0.85);
let BBGEO=null;
function bbMat(tex,sway,tint,flip,rnd){return new T3.ShaderMaterial({uniforms:{map:{value:tex},uTime:W.UT,uSway:{value:sway},uSway0:{value:sway},uPhase:{value:rnd()*6.28},uTint:{value:tint},uAO:{value:0.74},uFlip:{value:flip?1:0},uFogC:{value:W.FOGS},uNear:W.UN,uFar:W.UF,uFlash:{value:0},uOp:{value:1}},vertexShader:BB_VS,fragmentShader:BB_FS,transparent:true,depthWrite:true})}
function shMat(bm){return new T3.ShaderMaterial({uniforms:{map:bm.uniforms.map,uTime:W.UT,uSway:bm.uniforms.uSway,uPhase:bm.uniforms.uPhase,uFlip:bm.uniforms.uFlip,uA:{value:0.34},uOp:bm.uniforms.uOp},vertexShader:BB_VS,fragmentShader:SH_FS,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4})}
/* opt：w、h（單位）、sway、flip、shLen、sink、shadow:false、tint:false */
function billboard(tex,x,z,opt){const r=W.rnd,v=opt.tint===false?1:(0.97+r()*0.07),tint=new T3.Vector3(1.02*v,1.0*v,0.95*v);
  const m=new T3.Mesh(BBGEO,bbMat(tex,opt.sway||0,tint,!!opt.flip,r));m.renderOrder=2;W.scene.add(m);
  const o={m,x,z,w:opt.w,h:opt.h,sink:(opt.sink==null?0.05:opt.sink)*opt.h,lift:opt.lift||0,sil:null,shLen:opt.shLen||0.5};
  if(opt.shadow!==false){const sm=new T3.Mesh(BBGEO,shMat(m.material));sm.rotation.order='YXZ';sm.rotation.set(-Math.PI/2,SH_DIR,0);sm.renderOrder=1;W.scene.add(sm);o.sil=sm}
  orientOne(o);placeBB(o,x,z,0);W.BBS.push(o);return o}
function placeBB(o,x,z,bob){o.x=x;o.z=z;const y=gY(x,z);o.m.position.set(x,y-o.sink+bob+o.lift,z);if(o.sil)o.sil.position.set(x,y+0.06,z+0.02)}
function orientOne(o){const pr=VIEWS3[vi][1]*Math.PI/180,a=pr*0.55,comp=1/Math.cos(pr-a);o.m.rotation.x=-a;o.m.scale.set(o.w,o.h*comp,1);if(o.sil)o.sil.scale.set(o.w,o.h*o.shLen,1)}
function dropBB(o){if(!o)return;W.scene.remove(o.m);o.m.material.dispose();if(o.sil){W.scene.remove(o.sil);o.sil.material.dispose()}const i=W.BBS.indexOf(o);if(i>=0)W.BBS.splice(i,1)}

/* 地面高度（橋上用橋面的高度） */
function gY(x,z){if(W.BR)for(const b of W.BR){const dx=x-b.c[0],dz=z-b.c[1],a=dx*b.d[0]+dz*b.d[1],c=-dx*b.d[1]+dz*b.d[0];if(Math.abs(a)<b.L/2&&Math.abs(c)<b.Wd/2)return brY(b,a)}return hAt(W.HF,x,z)}
function brY(b,a){const t=a/b.L+0.5;return b.y0+(b.y1-b.y0)*t+b.arch*(1-(2*t-1)**2)+0.12}
/* ---------- 圖片與 SVG 貼圖 ---------- */
const TEXL=new Map();/* 素材圖 */
function imgTex(url){let t=TEXL.get(url);if(t)return t;t=new T3.TextureLoader().load(url,()=>{if(W)W.dirty=true});t.encoding=T3.sRGBEncoding;t.anisotropy=4;TEXL.set(url,t);return t}
/* SVG → canvas 貼圖：SVG 當成圖片畫的時候讀不到外部圖，所以先把每個 href 換成 data URL（同外觀快取） */
const DURL=new Map(),SVGT=new Map();
function toData(h){if(/^data:/.test(h))return Promise.resolve(h);let p=DURL.get(h);if(p)return p;p=fetch(h).then(r=>r.blob()).then(b=>new Promise(res=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=()=>res('');fr.readAsDataURL(b)})).catch(()=>'');DURL.set(h,p);return p}
function svgTex(key,inner,vb,pw,ph){let e=SVGT.get(key);if(e){e.at=performance.now();return e.ready?e.tex:null}
  const cv=document.createElement('canvas');cv.width=pw;cv.height=ph;e={tex:new T3.CanvasTexture(cv),ready:false,at:performance.now()};e.tex.encoding=T3.sRGBEncoding;SVGT.set(key,e);
  const hs=[...new Set([...inner.matchAll(/href="([^"#][^"]*)"/g)].map(m=>m[1]))];
  Promise.all(hs.map(toData)).then(us=>{let s=inner;hs.forEach((h,i)=>{s=s.split('href="'+h+'"').join('href="'+us[i]+'"')});
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${vb}" width="${pw}" height="${ph}">${s}</svg>`,im=new Image();
    im.onload=()=>{const g=cv.getContext('2d');g.clearRect(0,0,pw,ph);g.drawImage(im,0,0,pw,ph);e.tex.needsUpdate=true;e.ready=true;if(W)W.dirty=true};im.onerror=()=>{e.ready=true};
    im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)});
  if(SVGT.size>220){const old=[...SVGT.entries()].sort((a,b)=>a[1].at-b[1].at).slice(0,40);for(const [k,v] of old){if(W&&W.inUse&&W.inUse.has(v.tex))continue;v.tex.dispose();SVGT.delete(k)}}
  return null}

/* ---------- 3D 樹、石頭、花叢（照試做頁「樹：葉叢」） ---------- */
const LEAF=()=>{if(LEAF.t)return LEAF.t;const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');let sd=3;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
  for(let i=0;i<46;i++){const back=i<18;const a=r()*6.28,d=Math.sqrt(r())*82,x=128+Math.cos(a)*d,y=128+Math.sin(a)*d*0.92,L=(back?34:26)+r()*20,Wd=L*(0.36+r()*0.1),rot=a+(r()-0.5)*1.4;
    g.save();g.translate(x,y);g.rotate(rot);const v0=back?110:160,v=v0+r()*70|0;const gr=g.createLinearGradient(-L/2,0,L/2,0);gr.addColorStop(0,'rgb('+(v*0.72|0)+','+(v*0.72|0)+','+(v*0.72|0)+')');gr.addColorStop(1,'rgb('+Math.min(255,v*1.12|0)+','+Math.min(255,v*1.12|0)+','+Math.min(255,v*1.12|0)+')');g.fillStyle=gr;
    g.beginPath();g.moveTo(-L/2,0);g.bezierCurveTo(-L/4,-Wd,L/4,-Wd*0.9,L/2,0);g.bezierCurveTo(L/4,Wd*0.9,-L/4,Wd,-L/2,0);g.fill();
    g.strokeStyle='rgba(0,0,0,.22)';g.lineWidth=1.2;g.stroke();g.strokeStyle='rgba(255,255,255,.28)';g.lineWidth=1;g.beginPath();g.moveTo(-L/2+3,0);g.lineTo(L/2-4,0);g.stroke();g.restore()}
  LEAF.t=new T3.CanvasTexture(c);LEAF.t.anisotropy=4;return LEAF.t};
function hash3(x,y,z){const h=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return h-Math.floor(h)}
const GREENS=[[0.42,0.66,0.25],[0.47,0.72,0.29],[0.38,0.61,0.23],[0.52,0.76,0.33],[0.44,0.69,0.27]];
function buildFlora(trees,rocks,bushes){const rnd=W.rnd,TPL=new T3.IcosahedronGeometry(1,2).attributes.position.array,P=[],N=[],C=[],S=[];
  function blob(cx,cy,cz,r,tc,Rr,base,blossom,swayH){const sd=hash3(cx,cy,cz)*10;
    for(let i=0;i<TPL.length;i+=3){const vx=TPL[i],vy=TPL[i+1],vz=TPL[i+2];const nz=1+(hash3(vx*3+sd,vy*3,vz*3)-0.5)*0.22+(hash3(vx*9,vy*9+sd,vz*9)-0.5)*0.08;
      const px=cx+vx*r*nz,py=cy+vy*r*nz*0.92,pz=cz+vz*r*nz;P.push(px,py,pz);
      let nx=px-tc[0],ny=(py-tc[1])*1.15,nzz=pz-tc[2];const l=Math.hypot(nx,ny,nzz)||1;nx=nx/l*0.7+vx*0.3;ny=ny/l*0.7+vy*0.3;nzz=nzz/l*0.7+vz*0.3;const l2=Math.hypot(nx,ny,nzz);N.push(nx/l2,ny/l2,nzz/l2);
      const hF=Math.max(0,Math.min(1,(py-(tc[1]-Rr))/(2*Rr)));let k=0.62+0.5*hF+(hash3(vx*17+sd,vy*17,vz*17)-0.5)*0.12;let rr=base[0]*k,gg=base[1]*k,bb=base[2]*k;if(hF<0.35){gg*=0.92;bb*=1.05}
      if(blossom&&ny>0.1&&hash3(vx*23+sd,vy*23,vz*23)>0.82){rr=0.97;gg=0.72;bb=0.80}
      C.push(lin(rr),lin(gg),lin(bb));S.push(Math.max(0,(py-swayH))*0.06)}}
  const CH=new Map(),CHS=7,chunk=(x,z)=>{const k=Math.floor(x/CHS)+','+Math.floor(z/CHS);if(!CH.has(k))CH.set(k,{d:{P:[],N:[],C:[],S:[],U:[]},s:{P:[],N:[],C:[],S:[],U:[]},x:0,z:0,n:0});return CH.get(k)};
  const pr=45*Math.PI/180,RX=[1,0,0],UP=[0,Math.cos(pr),-Math.sin(pr)];
  function cards(cx,cy,cz,r,tc,Rr,base,blossom,swayH,cr,dense,out){const n=dense?Math.round(80*(r/cr)*(r/cr)+34):Math.round(22*(r/cr)*(r/cr)+9);const {P:LP,N:LN,C:LC,S:LS,U:LU}=out;
    for(let i=0;i<n;i++){let dx=rnd()*2-1,dy=rnd()*2-1,dz=rnd()*2-1;const dl=Math.hypot(dx,dy,dz)||1;dx/=dl;dy/=dl;dz/=dl;if(dy<-0.55&&rnd()<0.7)dy=-dy*0.5;if(dense&&(dy*0.71+dz*0.71)<0&&rnd()<0.6){dz=-dz;dy=Math.abs(dy)}
      const inner=dense&&rnd()<0.3;const rad=r*(inner?0.55+rnd()*0.25:0.78+rnd()*0.32);const px=cx+dx*rad,py=cy+dy*rad*0.92,pz=cz+dz*rad;const sz=cr*(dense?0.34+rnd()*0.2:0.46+rnd()*0.22);
      const ro=rnd()*6.28,co=Math.cos(ro),si=Math.sin(ro);const ax=[RX[0]*co+UP[0]*si+dx*0.1,RX[1]*co+UP[1]*si,RX[2]*co+UP[2]*si+dz*0.1],bx=[-RX[0]*si+UP[0]*co,-RX[1]*si+UP[1]*co+dy*0.1,-RX[2]*si+UP[2]*co];
      let nx=px-tc[0],ny=(py-tc[1])*1.15,nz=pz-tc[2];const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;ny/=nl;nz/=nl;
      const hF=Math.max(0,Math.min(1,(py-(tc[1]-Rr))/(2*Rr)));let k=(inner?0.55:0.72)+0.5*hF+(rnd()-0.5)*0.14;const sunF=Math.max(0,(-nx*0.45+ny*0.75-nz*0.35));k*=0.9+0.25*sunF;let cr_=base[0]*k,cg=base[1]*k,cb=base[2]*k;if(hF<0.35){cg*=0.92;cb*=1.06}
      if(blossom&&ny>0&&rnd()<0.18){cr_=0.98;cg=0.74;cb=0.82}
      const col=[lin(cr_),lin(cg),lin(cb)],sw=Math.max(0,py-swayH)*0.06,hs=sz/2;
      const vs=[[-1,-1,0,0],[1,-1,1,0],[1,1,1,1],[-1,1,0,1]].map(([a,b,u,v])=>[px+ax[0]*a*hs+bx[0]*b*hs,py+ax[1]*a*hs+bx[1]*b*hs,pz+ax[2]*a*hs+bx[2]*b*hs,u,v]);
      for(const idx of [0,1,2,0,2,3]){const q=vs[idx];LP.push(q[0],q[1],q[2]);LN.push(nx,ny,nz);LC.push(col[0],col[1],col[2]);LS.push(sw);LU.push(q[3],q[4])}}}
  const trunks=[];
  for(const T of trees){const {x,z,h,k,br}=T,y=hAt(W.HF,x,z),round=k!=='oak';
    trunks.push({x,y,z,sx:h*0.2,sy:h*(round?0.45:0.5),sz:h*0.2,c:[0x8a5f3c,0x7d5636,0x94683f][(rnd()*3)|0],ry:rnd()*6});
    const cy=y+h*(round?0.63:0.66),cr=h*(round?0.3:0.27),Rr=cr*1.6,b0=GREENS[(rnd()*5)|0],base=[b0[0]*br,b0[1]*br,b0[2]*br],tc=[x,cy,z],bl=rnd()<0.22;
    const n=round?4:7,bs=[[x,cy,z,cr*(round?1.2:1.0),base]];
    for(let i=0;i<n;i++){const ang=i/n*6.28+rnd(),rr=cr*(0.6+rnd()*0.25),b2=GREENS[(rnd()*5)|0];bs.push([x+Math.cos(ang)*rr,cy+(rnd()-0.4)*cr*0.7,z+Math.sin(ang)*rr*0.85,cr*(0.6+rnd()*0.25),[(base[0]+b2[0]*br)/2,(base[1]+b2[1]*br)/2,(base[2]+b2[2]*br)/2]])}
    bs.push([x,cy+cr*0.65,z,cr*0.72,base]);
    for(const b of bs)blob(b[0],b[1],b[2],b[3]*0.66,tc,Rr,[b[4][0]*0.5,b[4][1]*0.56,b[4][2]*0.6],false,y+h*0.35);
    const ck=chunk(x,z);ck.x+=x;ck.z+=z;ck.n++;for(const b of bs)cards(b[0],b[1],b[2],b[3],tc,Rr,b[4],bl,y+h*0.35,cr,true,ck.d);for(const b of bs)cards(b[0],b[1],b[2],b[3],tc,Rr,b[4],bl,y+h*0.35,cr,false,ck.s)}
  for(const B of bushes){const y=hAt(W.HF,B.x,B.z),r=B.h*0.42,tc=[B.x,y+r*0.6,B.z],base=GREENS[(rnd()*5)|0];for(let i=0;i<4;i++){const ang=i*1.7+rnd();blob(B.x+Math.cos(ang)*r*0.6,y+r*0.6,B.z+Math.sin(ang)*r*0.5,r*(0.65+rnd()*0.3),tc,r*1.4,base,true,y)}}
  const geo=new T3.BufferGeometry();geo.setAttribute('position',new T3.Float32BufferAttribute(P,3));geo.setAttribute('normal',new T3.Float32BufferAttribute(N,3));geo.setAttribute('color',new T3.Float32BufferAttribute(C,3));geo.setAttribute('aSway',new T3.Float32BufferAttribute(S,1));
  const SWAY=c=>{c.uniforms.uTime=W.UT;c.uniforms.uSw=W.SW;c.vertexShader='uniform float uTime;uniform float uSw;attribute float aSway;\n'+c.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfloat ph=position.x*0.35+position.z*0.27;transformed.x+=uSw*aSway*(sin(uTime*1.3+ph)+0.35*sin(uTime*2.9+ph*1.7));transformed.z+=uSw*aSway*0.5*sin(uTime*1.1+ph*1.3);')};
  const leafMat=new T3.MeshLambertMaterial({vertexColors:true});leafMat.onBeforeCompile=SWAY;
  const leaves=new T3.Mesh(geo,leafMat);leaves.castShadow=true;leaves.receiveShadow=true;W.G3.add(leaves);
  const cm=new T3.MeshLambertMaterial({vertexColors:true,map:LEAF(),alphaTest:0.5,side:T3.DoubleSide});cm.onBeforeCompile=SWAY;
  const dmat=new T3.MeshDepthMaterial({depthPacking:T3.RGBADepthPacking,map:LEAF(),alphaTest:0.5});
  const mk=o=>{const lg=new T3.BufferGeometry();lg.setAttribute('position',new T3.Float32BufferAttribute(o.P,3));lg.setAttribute('normal',new T3.Float32BufferAttribute(o.N,3));lg.setAttribute('color',new T3.Float32BufferAttribute(o.C,3));lg.setAttribute('aSway',new T3.Float32BufferAttribute(o.S,1));lg.setAttribute('uv',new T3.Float32BufferAttribute(o.U,2));const m=new T3.Mesh(lg,cm);m.castShadow=true;m.receiveShadow=true;m.customDepthMaterial=dmat;W.G3.add(m);return m};
  W.LOD=[];for(const c of CH.values()){if(!c.n)continue;const md=mk(c.d),ms=mk(c.s);md.visible=false;W.LOD.push({x:c.x/c.n,z:c.z/c.n,md,ms,near:false})}
  const dm=new T3.Object3D(),col=new T3.Color();
  const trunkGeo=new T3.CylinderGeometry(0.15,0.3,1,16,8);trunkGeo.translate(0,0.5,0);
  {const tp=trunkGeo.attributes.position,tcl=[];for(let i=0;i<tp.count;i++){const x=tp.getX(i),y=tp.getY(i),z=tp.getZ(i),an=Math.atan2(z,x),st=Math.sin(an*9+Math.sin(y*6)*0.8),flare=1+Math.max(0,0.25-y)*1.6*(0.7+0.3*Math.sin(an*5)),rr=(1+st*0.06)*flare;tp.setXYZ(i,x*rr,y,z*rr);const k=0.78+0.18*st+0.1*Math.sin(y*11+an*3);tcl.push(lin(0.58*k),lin(0.42*k),lin(0.28*k))}
   trunkGeo.setAttribute('color',new T3.Float32BufferAttribute(tcl,3));trunkGeo.computeVertexNormals()}
  if(trunks.length){const im=new T3.InstancedMesh(trunkGeo,new T3.MeshLambertMaterial({vertexColors:true}),trunks.length);trunks.forEach((b,i)=>{dm.position.set(b.x,b.y,b.z);dm.rotation.set(0,b.ry,0);dm.scale.set(b.sx,b.sy,b.sz);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);col.setHex(b.c).convertSRGBToLinear();col.multiplyScalar(1.6);im.setColorAt(i,col)});im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.castShadow=true;im.receiveShadow=true;W.G3.add(im)}
  if(rocks.length){const im=new T3.InstancedMesh(new T3.DodecahedronGeometry(1,1),new T3.MeshLambertMaterial({color:0xffffff}),rocks.length);rocks.forEach((b,i)=>{dm.position.set(b.x,b.y,b.z);dm.rotation.set(0,b.ry,0);dm.scale.set(b.sx,b.sy,b.sz);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);col.setHex(b.c).convertSRGBToLinear();im.setColorAt(i,col)});im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.castShadow=true;im.receiveShadow=true;W.G3.add(im)}}

/* ---------- 程式做的小景物：稻草堆、倒木、圍籬、告示牌 ---------- */
const lam=c=>new T3.MeshLambertMaterial({color:hex(c).convertSRGBToLinear()});
function addMesh(m){m.castShadow=true;m.receiveShadow=true;W.G3.add(m);return m}
function haystack(x,z,h){const y=hAt(W.HF,x,z),r=h*0.42,g=new T3.Group();
  const cv=document.createElement('canvas');cv.width=128;cv.height=64;const c=cv.getContext('2d');c.fillStyle='#E2BE62';c.fillRect(0,0,128,64);for(let i=0;i<160;i++){c.strokeStyle=['rgba(160,118,40,.55)','rgba(255,236,160,.6)','rgba(196,150,60,.5)'][i%3];c.lineWidth=1.2;const a=Math.random()*128;c.beginPath();c.moveTo(a,0);c.lineTo(a+(Math.random()-.5)*10,64);c.stroke()}
  const tx=new T3.CanvasTexture(cv);tx.encoding=T3.sRGBEncoding;tx.wrapS=T3.RepeatWrapping;tx.repeat.set(3,1);const mt=new T3.MeshLambertMaterial({map:tx});
  const body=new T3.Mesh(new T3.CylinderGeometry(r,r*1.08,h*0.5,20,1),mt);body.position.y=h*0.25;g.add(body);
  const top=new T3.Mesh(new T3.SphereGeometry(r,20,10,0,Math.PI*2,0,Math.PI/2),mt);top.scale.y=1.05;top.position.y=h*0.5;g.add(top);
  const band=new T3.Mesh(new T3.TorusGeometry(r*1.01,0.035,6,24),lam('#9B7234'));band.rotation.x=Math.PI/2;band.position.y=h*0.34;g.add(band);
  g.position.set(x,y-0.02,z);g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});W.G3.add(g)}
function logMesh(x,z,len,fl){const y=hAt(W.HF,x,z),r=len*0.17,g=new T3.Group();
  const cv=document.createElement('canvas');cv.width=128;cv.height=64;const c=cv.getContext('2d');c.fillStyle='#8B6040';c.fillRect(0,0,128,64);for(let i=0;i<30;i++){c.fillStyle=i%2?'rgba(60,38,20,.5)':'rgba(170,125,85,.4)';c.fillRect(0,Math.random()*64,128,1+Math.random()*2.5)}
  const tx=new T3.CanvasTexture(cv);tx.encoding=T3.sRGBEncoding;const body=new T3.Mesh(new T3.CylinderGeometry(r,r*1.05,len,14,1),new T3.MeshLambertMaterial({map:tx}));body.rotation.z=Math.PI/2;g.add(body);
  const end=new T3.Mesh(new T3.CircleGeometry(r*0.98,14),lam('#D9B07A'));end.position.x=(fl?-1:1)*len/2+(fl?-0.005:0.005);end.rotation.y=(fl?-1:1)*Math.PI/2;g.add(end);
  const ring=new T3.Mesh(new T3.RingGeometry(r*0.4,r*0.48,14),lam('#A8784A'));ring.position.copy(end.position);ring.position.x+=fl?-0.004:0.004;ring.rotation.copy(end.rotation);g.add(ring);
  g.position.set(x,y+r*0.75,z-len*0.05);g.rotation.y=(fl?0.18:-0.18);g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});W.G3.add(g)}
function fenceLine(pts){const wood=lam('#B08356'),wood2=lam('#8C6440');
  for(let i=0;i<pts.length;i++){const [x,z]=pts[i],y=hAt(W.HF,x,z);const post=addMesh(new T3.Mesh(new T3.CylinderGeometry(0.06,0.075,0.82,7),wood2));post.position.set(x,y+0.38,z);
    const cap=addMesh(new T3.Mesh(new T3.ConeGeometry(0.075,0.1,7),wood2));cap.position.set(x,y+0.84,z);
    if(i+1<pts.length){const [x2,z2]=pts[i+1],y2=hAt(W.HF,x2,z2),len=Math.hypot(x2-x,z2-z);if(len>2.4)continue;
      for(const hh of [0.32,0.62]){const rail=addMesh(new T3.Mesh(new T3.BoxGeometry(len,0.07,0.05),wood));rail.position.set((x+x2)/2,(y+y2)/2+hh,(z+z2)/2);rail.rotation.y=-Math.atan2(z2-z,x2-x);rail.rotation.z=Math.atan2(y2-y,len)}}}}
function signMesh(x,z,text,lv){const y=hAt(W.HF,x,z),g=new T3.Group(),wood=lam('#9A6B40');
  const post=new T3.Mesh(new T3.CylinderGeometry(0.06,0.07,1.25,7),wood);post.position.y=0.6;g.add(post);
  const cv=document.createElement('canvas');cv.width=256;cv.height=104;const c=cv.getContext('2d');c.fillStyle='#C99462';c.fillRect(0,0,256,104);for(let i=0;i<14;i++){c.fillStyle=i%2?'rgba(120,80,40,.25)':'rgba(240,200,150,.25)';c.fillRect(0,Math.random()*104,256,2)}
  c.strokeStyle='#6B4426';c.lineWidth=8;c.strokeRect(4,4,248,96);c.fillStyle='#4A3020';c.textAlign='center';c.textBaseline='middle';c.font='bold 34px "PingFang TC","Noto Sans TC",sans-serif';c.fillText(String(text||'').slice(0,8),128,lv?40:54);if(lv){c.font='bold 26px sans-serif';c.fillStyle='#8A2A1A';c.fillText('Lv '+lv,128,80)}
  const tx=new T3.CanvasTexture(cv);tx.encoding=T3.sRGBEncoding;tx.anisotropy=4;
  const board=new T3.Mesh(new T3.BoxGeometry(1.25,0.5,0.07),[wood,wood,wood,wood,new T3.MeshLambertMaterial({map:tx}),wood]);board.position.y=1.05;g.add(board);
  g.position.set(x,y,z);g.rotation.y=(Math.random()-.5)*0.2;g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});W.G3.add(g)}

/* ---------- 水（108.4：相連的水是同一片；樣子只看深度） ---------- */
const NOISE=`float hsh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hsh(i),hsh(i+vec2(1,0)),f.x),mix(hsh(i+vec2(0,1)),hsh(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){return vn(p)*.55+vn(p*2.07+1.7)*.3+vn(p*4.3+3.1)*.15;}`;
const W_VS=`varying vec2 vUv;varying vec3 vW;varying float vFog;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vec4 mv=viewMatrix*w;vFog=-mv.z;gl_Position=projectionMatrix*mv;}`;
const W_FS=`uniform float uTime,uNear,uFar,uMode,uSpeed;uniform sampler2D uDepth;uniform vec4 uDR;uniform vec3 uFogC;varying vec2 vUv;varying vec3 vW;varying float vFog;`+NOISE+`
void main(){float dep=texture2D(uDepth,(vW.xz-uDR.xy)/uDR.zw).r;if(dep<0.004)discard;
 vec2 wq=vW.xz*.45+vec2(uTime*.05,uTime*.035);vec2 q=uMode<0.5?vec2(vUv.x*3.5,vUv.y*.8-uTime*uSpeed):wq;
 float n=fbm(q),n2=fbm(q*vec2(2.,1.7)+vec2(5.,-uTime*uSpeed*.6));float edge=smoothstep(0.,.3,dep);
 vec3 sh=vec3(.60,.86,.83),dp=vec3(.24,.55,.70);vec3 c=mix(sh,dp,smoothstep(.03,.4,dep));c+=vec3(.07,.09,.09)*(n-.5);
 float ln=smoothstep(.64,.68,n2)*(1.-smoothstep(.68,.74,n2));c=mix(c,vec3(.92,.98,1.),ln*.45*smoothstep(.08,.35,dep));
 float sp=step(.93,vn(q*9.+vec2(0.,uTime*1.3)))*smoothstep(.15,.5,dep);c+=sp*.35;
 float foam=1.-smoothstep(.0,.05+.05*n,dep);c=mix(c,vec3(.96,.99,1.),foam*.8);
 float a=smoothstep(.0,.04,dep)*mix(.8,.95,edge);c=mix(c,uFogC,smoothstep(uNear,uFar,vFog));gl_FragColor=vec4(c,a);}`;
function buildWater(M){const WP=waterPolys(M);if(!WP.list.length)return;const HF=W.HF,N=512,NZ=Math.round(512*HF.d/HF.w),data=new Uint8Array(N*NZ*4),bb=WP.bb;
  for(let iz=0;iz<NZ;iz++){const z=HF.z0+(iz+0.5)/NZ*HF.d;if(z<bb[1]-1.2||z>bb[3]+1.2)continue;for(let ix=0;ix<N;ix++){const x=HF.x0+(ix+0.5)/N*HF.w;if(x<bb[0]-1.2||x>bb[2]+1.2)continue;const d=Math.max(0,Math.min(1,WSURF-hAt(HF,x,z)));const o=(iz*N+ix)*4;data[o]=data[o+1]=data[o+2]=Math.round(d*255);data[o+3]=255}}
  const tex=new T3.DataTexture(data,N,NZ,T3.RGBAFormat);tex.magFilter=T3.LinearFilter;tex.minFilter=T3.LinearFilter;tex.needsUpdate=true;
  const mat=(mode,speed)=>new T3.ShaderMaterial({uniforms:{uTime:W.UT,uNear:W.UN,uFar:W.UF,uFogC:{value:W.FOGS},uMode:{value:mode},uSpeed:{value:speed},uDepth:{value:tex},uDR:{value:new T3.Vector4(HF.x0,HF.z0,HF.w,HF.d)}},vertexShader:W_VS,fragmentShader:W_FS,transparent:true,depthWrite:true});
  /* 湖、池：一片水平面（比水域大，邊緣藏在岸裡）。先畫，寫入深度 */
  for(const L of WP.list.filter(l=>l.lake)){const b=L.bb,cx=(b[0]+b[2])/2*U,cz=(b[1]+b[3])/2*U,rx=(b[2]-b[0])/2*U+0.8,rz=(b[3]-b[1])/2*U+0.8,g=new T3.CircleGeometry(1,48);g.rotateX(-Math.PI/2);g.scale(rx,1,rz);const m=new T3.Mesh(g,mat(1,0));m.position.set(cx,WSURF,cz);m.renderOrder=3;W.scene.add(m)}
  /* 河：沿河道的帶狀面，水紋沿流向移動；和湖重疊的地方被湖擋掉（往後推一點） */
  for(const r of M._RV||[]){const P=r.rb.pts,HW=r.rb.hw,V=[],UV=[],I=[];let cum=0;
    for(let i=0;i<P.length;i++){if(i)cum+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1])*U;const a=P[Math.min(P.length-1,i+1)],b=P[Math.max(0,i-1)];let tx=a[0]-b[0],tz=a[1]-b[1];const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;const hw=(HW[i]+14)*U,x=P[i][0]*U,z=P[i][1]*U;
      V.push(x-tz*hw,WSURF,z+tx*hw,x+tz*hw,WSURF,z-tx*hw);UV.push(0,cum,1,cum);if(i){const o=(i-1)*2;I.push(o,o+2,o+1,o+1,o+2,o+3)}}
    const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(V,3));g.setAttribute('uv',new T3.Float32BufferAttribute(UV,2));g.setIndex(I);
    const m=new T3.Mesh(g,mat(0,0.9));m.material.polygonOffset=true;m.material.polygonOffsetFactor=2;m.material.polygonOffsetUnits=2;m.renderOrder=4;W.scene.add(m)}
  W.hasWater=true}
/* 木橋（拱起來的木板橋＋欄杆），可以走在橋上 */
function buildBridges(M){W.BR=[];const wood=lam('#B07C4C'),wood2=lam('#8B5E37');
  for(const G of M._BR||[]){const A=[G.A[0]*U,G.A[1]*U],B=[G.B[0]*U,G.B[1]*U],dx0=B[0]-A[0],dz0=B[1]-A[1],L0=Math.hypot(dx0,dz0),dx=dx0/L0,dz=dz0/L0,L=L0+0.9,c=[(A[0]+B[0])/2,(A[1]+B[1])/2],Wd=Math.max(1.4,G.hw*2*U*1.1);
    const e0=[c[0]-dx*L/2,c[1]-dz*L/2],e1=[c[0]+dx*L/2,c[1]+dz*L/2],b={c,d:[dx,dz],L,Wd,y0:hAt(W.HF,e0[0],e0[1])+0.04,y1:hAt(W.HF,e1[0],e1[1])+0.04,arch:0.42};W.BR.push(b);
    const grp=new T3.Group(),ang=Math.atan2(-dz,dx),n=Math.max(9,Math.round(L/0.42));
    for(let k=0;k<n;k++){const a=((k+0.5)/n-0.5)*L,x=c[0]+dx*a,z=c[1]+dz*a,pl=new T3.Mesh(new T3.BoxGeometry(L/n*0.9,0.12,Wd*(0.96+((k*7)%3)*0.02)),wood);pl.position.set(x,brY(b,a)-0.18,z);pl.rotation.y=ang;grp.add(pl)}
    for(const sd of [-1,1]){const nx=-dz*sd*Wd/2,nz=dx*sd*Wd/2,pts=[];for(let k=0;k<=4;k++){const a=(k/4-0.5)*L,x=c[0]+dx*a+nx,z=c[1]+dz*a+nz,y=brY(b,a)-0.15;const post=new T3.Mesh(new T3.CylinderGeometry(0.07,0.09,0.75,6),wood2);post.position.set(x,y+0.37,z);grp.add(post);pts.push([x,y+0.68,z])}
      for(let k=0;k<4;k++){const [x1,y1,z1]=pts[k],[x2,y2,z2]=pts[k+1],len=Math.hypot(x2-x1,y2-y1,z2-z1),rail=new T3.Mesh(new T3.CylinderGeometry(0.05,0.05,len,6),wood2);rail.position.set((x1+x2)/2,(y1+y2)/2,(z1+z2)/2);rail.lookAt(x2,y2,z2);rail.rotateX(Math.PI/2);grp.add(rail)}}
    grp.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});W.G3.add(grp)}}
/* 石砌圓井＋木頂＋轆轤 */
function wellMesh(x,z,h,fl){const y=hAt(W.HF,x,z),g=new T3.Group(),r=h*0.3,stone=lam('#A39E92'),wood=lam('#8E6440'),roof=lam('#9A5A3A');
  const cv=document.createElement('canvas');cv.width=256;cv.height=64;const c=cv.getContext('2d');c.fillStyle='#8F8A7E';c.fillRect(0,0,256,64);for(let row=0;row<3;row++)for(let k=0;k<8;k++){c.fillStyle=['#B3AE9F','#A5A092','#C0BAA9'][(row+k)%3];c.fillRect(k*32+(row%2)*16+2,row*21+2,28,17)}
  const tx=new T3.CanvasTexture(cv);tx.encoding=T3.sRGBEncoding;tx.wrapS=T3.RepeatWrapping;tx.repeat.set(2,1);
  const ring=new T3.Mesh(new T3.CylinderGeometry(r,r*1.05,h*0.26,20,1,true),new T3.MeshLambertMaterial({map:tx,side:T3.DoubleSide}));ring.position.y=h*0.13;g.add(ring);
  const rim=new T3.Mesh(new T3.TorusGeometry(r,0.08,6,24),stone);rim.rotation.x=Math.PI/2;rim.position.y=h*0.26;g.add(rim);
  const wat=new T3.Mesh(new T3.CircleGeometry(r*0.92,20),lam('#2E5560'));wat.rotation.x=-Math.PI/2;wat.position.y=h*0.12;g.add(wat);
  for(const sx of [-1,1]){const p=new T3.Mesh(new T3.BoxGeometry(0.12,h*0.72,0.12),wood);p.position.set(sx*r*0.95,h*0.36,0);g.add(p)}
  const ax=new T3.Mesh(new T3.CylinderGeometry(0.06,0.06,r*2.1,8),wood);ax.rotation.z=Math.PI/2;ax.position.y=h*0.5;g.add(ax);
  const rope=new T3.Mesh(new T3.CylinderGeometry(0.012,0.012,h*0.22,4),lam('#D8C79A'));rope.position.y=h*0.38;g.add(rope);
  const bk=new T3.Mesh(new T3.CylinderGeometry(0.1,0.08,0.16,10),wood);bk.position.y=h*0.26;g.add(bk);
  const rf=new T3.Mesh(new T3.ConeGeometry(r*1.5,h*0.3,4),roof);rf.rotation.y=Math.PI/4;rf.position.y=h*0.86;g.add(rf);
  g.position.set(x,y,z);g.rotation.y=fl?0.2:-0.2;g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});W.G3.add(g)}
/* 石塊疊成的拱門（可以穿過） */
function archMesh(x,z,h,rnd){const y=hAt(W.HF,x,z),g=new T3.Group(),half=h*0.38,leg=h*0.5,R=half,cols=['#A9A28F','#9B9483','#B7B09C'],ms=cols.map(lam);
  for(const sx of [-1,1])for(let k=0;k<4;k++){const b=new T3.Mesh(new T3.BoxGeometry(0.42+rnd()*0.06,leg/4*0.94,0.46),ms[(k+(sx>0?1:0))%3]);b.position.set(sx*half,leg/8+k*leg/4,0);b.rotation.y=(rnd()-0.5)*0.12;g.add(b)}
  const n=9;for(let k=0;k<n;k++){const a=Math.PI*(k+0.5)/n,b=new T3.Mesh(new T3.BoxGeometry(0.44,0.4,0.46),ms[k%3]);b.position.set(-Math.cos(a)*R,leg+Math.sin(a)*R,0);b.rotation.z=a-Math.PI/2;g.add(b)}
  const moss=lam('#7FA05A');for(let k=0;k<5;k++){const m=new T3.Mesh(new T3.SphereGeometry(0.14+rnd()*0.08,8,6),moss);const a=Math.PI*(0.2+rnd()*0.6);m.position.set(-Math.cos(a)*R,leg+Math.sin(a)*R+0.2,0.1);m.scale.y=0.5;g.add(m)}
  g.position.set(x,y,z);g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});W.G3.add(g)}
/* 一圈小蘑菇 */
function mushRing(x,z,s,rnd){const g=new T3.Group(),R=0.62*s,cap=lam('#D2493B'),capB=lam('#C9A27A'),stem=lam('#F2E9D6'),dot=lam('#FFF8EC');
  for(let k=0;k<11;k++){const a=k/11*6.28+rnd()*0.3,r=R*(0.9+rnd()*0.2),px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r*0.8,sz=0.11+rnd()*0.07,y=hAt(W.HF,px,pz),m=new T3.Group();
    const st=new T3.Mesh(new T3.CylinderGeometry(sz*0.35,sz*0.45,sz*1.5,7),stem);st.position.y=sz*0.75;m.add(st);
    const cp=new T3.Mesh(new T3.SphereGeometry(sz,12,8,0,6.29,0,Math.PI/2),k%4===3?capB:cap);cp.position.y=sz*1.4;cp.scale.y=0.75;m.add(cp);
    if(k%4!==3)for(let d=0;d<3;d++){const dd=new T3.Mesh(new T3.SphereGeometry(sz*0.16,5,4),dot);const aa=d*2.1+k;dd.position.set(Math.cos(aa)*sz*0.55,sz*1.4+sz*0.55,Math.sin(aa)*sz*0.55);m.add(dd)}
    m.position.set(px,y,pz);m.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});g.add(m)}
  W.G3.add(g)}
/* ---------- 進入／離開 ---------- */
function w3dEnter(bk,id){ensureR();if(W)w3dLeave(true);
  const M=W3D_HOST.map();if(!M||!M._raw)throw new Error('沒有 3D 用的地圖資料');
  const rnd=mkRnd(hsh('w3d|'+bk+'|'+id));
  W={bk,id,M,rnd,scene:new T3.Scene(),BBS:[],G3:new T3.Group(),UT:{value:0},SW:{value:1},UN:{value:30},UF:{value:62},dirty:true,mons:new Map(),plants:new Map(),others:new Map(),inUse:new Set(),me:{x:400,y:600,face:2,svg:null},sig:0,lodT:0,lastMs:0,tgt:null,eco:null};
  BBGEO=BBGEO||(()=>{const g=new T3.PlaneGeometry(1,1);g.translate(0,0.5,0);return g})();
  const fogC=hex('#D6E8CF');W.FOGS=new T3.Vector3(Math.pow(fogC.r,1/2.2),Math.pow(fogC.g,1/2.2),Math.pow(fogC.b,1/2.2));
  W.scene.background=hex('#CFE3C8');W.scene.fog=new T3.Fog('#D6E8CF',30,62);W.scene.add(W.G3);
  W.cam=new T3.PerspectiveCamera(45,innerWidth/innerHeight,0.5,160);
  W.scene.add(new T3.HemisphereLight('#FFF7E2','#5F7F3C',0.78));
  const sun=new T3.DirectionalLight('#FFF1D6',0.72);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);{const c=sun.shadow.camera;c.left=-17;c.right=17;c.top=17;c.bottom=-17;c.near=1;c.far=70}sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.03;W.scene.add(sun);W.scene.add(sun.target);W.sun=sun;
  W.HF=buildHeight(M,rnd);
  {const HF=W.HF,geo=new T3.PlaneGeometry(HF.w,HF.d,HF.nx-1,HF.nz-1);geo.rotateX(-Math.PI/2);geo.translate(HF.x0+HF.w/2,0,HF.z0+HF.d/2);const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,hAt(HF,p.getX(i),p.getZ(i)));geo.computeVertexNormals();
   W.ground=new T3.Mesh(geo,new T3.MeshLambertMaterial({map:buildGroundTex(M,HF,rnd)}));W.ground.receiveShadow=true;W.scene.add(W.ground)}
  buildBridges(M);buildObjects(M);buildWater(M);
  W.me.bb=null;sizeR();applyEco(true);
  R.cv.style.display='block';placeCam(true);
  if(!R.raf)R.raf=requestAnimationFrame(loop);
  return true}
function buildObjects(M){const bk=M.bk,ART=REGION_ART[bk],FLAT=REGION_FLAT[bk]||{},dir=(REGION_CFG[bk]||{}).dir||bk,rnd=W.rnd,trees=[],rocks=[],bushes=[],fences=[];
  const url=f=>`assets/${dir}/${f}.png?v=${BUILD}`;
  const add=(k,px,py,txt,op)=>{op=op&&typeof op==='object'?op:{};const a=ART[k];if(!a)return;const s=op.s||1,x=px*U,z=py*U,h=a[1]*s*U;
    if(k==='round_tree'||k==='oak'){trees.push({x,z,h:h*TREE_K,k,br:op.br||1});return}
    if(k==='flower_bush'){bushes.push({x,z,h:h*1.15});return}
    if(k==='boulder'){const sz=h*0.55;rocks.push({x,y:hAt(W.HF,x,z)+sz*0.2,z,sx:sz*(1+rnd()*0.4),sy:sz*(0.7+rnd()*0.3),sz:sz*(0.9+rnd()*0.3),ry:rnd()*6,c:[0x9c9d8d,0xa9a996,0x8f9183][(rnd()*3)|0]});if(s>0.9&&rnd()<0.6)rocks.push({x:x+sz*0.9,y:hAt(W.HF,x,z)+sz*0.05,z:z+sz*0.4,sx:sz*0.45,sy:sz*0.32,sz:sz*0.4,ry:rnd()*6,c:0x9a9b8a});return}
    if(k==='haystack'){haystack(x,z,h*1.05);return}
    if(k==='log'){logMesh(x,z,(a[2]||70)*s*U*1.05,!!op.fl);return}
    if(k==='fence'&&op.belt){fences.push([x,z]);return}
    if(k==='sign'){signMesh(x,z,txt||'',op.lv);return}
    if(k==='well'){wellMesh(x,z,h*0.95,!!op.fl);return}
    if(k==='arch'){archMesh(x,z,h,rnd);return}
    if(k==='mushroom'){mushRing(x,z,s,rnd);return}
    if(FLAT[k]||k==='cliff')return;/* 橋另外做（buildBridges）；石階、崖壁由地形處理（108.2） */
    /* 其他（高草、野花、向日葵、樹屋…）：2D 立牌 */
    const tex=imgTex(url(a[0])),I=(REGION_IMG[bk]||{})[a[0]];const asp=I?I[0]/I[1]:1;const soft=k==='tallgrass'||k==='flowers'||k==='sunflowers'||k==='reed';
    billboard(tex,x,z,{w:h*asp*1.1,h:h*1.1,sway:soft?0.07:0,flip:!!op.fl,shadow:!soft||h>1.2,shLen:0.45})};
  for(const o of M._raw){if(o[2]>M.H+20&&o[4]&&o[4].edge)continue;add(o[0],o[1],o[2],o[3],o[4])}
  /* 地圖外面再種一圈樹，鏡頭靠邊時不會空空的（不擋路、只是背景） */
  {const MW=W.HF.MW,MD=W.HF.MD,ex=(M.exits||[]).filter(e=>e.side);
   const gapAt=(x,z)=>ex.some(e=>{const c=e.c*U,h=e.w*U/2+1.4;return e.side==='n'?(z<0.5&&Math.abs(x-c)<h):e.side==='s'?(z>MD-0.5&&Math.abs(x-c)<h):e.side==='w'?(x<0.5&&Math.abs(z-c)<h):(x>MW-0.5&&Math.abs(z-c)<h)});
   for(let i=0;i<70;i++){let x,z;const side=i%4;if(side===0){x=-1.5-rnd()*8;z=-4+rnd()*(MD+8)}else if(side===1){x=MW+1.5+rnd()*8;z=-4+rnd()*(MD+8)}else if(side===2){x=-6+rnd()*(MW+12);z=-1.2-rnd()*7}else{x=-6+rnd()*(MW+12);z=MD+3+rnd()*6}
     if(gapAt(x,z))continue;trees.push({x,z,h:(3.2+rnd()*1.6)*TREE_K,k:rnd()<0.4?'oak':'round_tree',br:0.88})}}
  /* 崖腳、崖邊的岩塊，打破一整面牆的感覺 */
  for(const T of M._T||[])for(let px=20;px<M.W-10;px+=30+rnd()*34){if(px>T.gap[0]-70&&px<T.gap[1]+70)continue;for(const [py,top] of [[T.Bt(px)+6,false],[T.E(px)+2,true]]){if(rnd()<0.35)continue;const x=px*U,z=py*U,sz=(top?0.25:0.38)+rnd()*0.4;rocks.push({x,y:hAt(W.HF,x,z)+sz*0.1,z,sx:sz*(1.1+rnd()*0.6),sy:sz*(0.7+rnd()*0.5),sz:sz,ry:rnd()*6,c:[0x9a8d74,0x8b7f69,0xa79a80,0x8f907f][(rnd()*4)|0]})}}
  /* 河邊、池邊的石頭 */
  {const WP=waterPolys(M);for(const L of WP.list)for(let i=0;i<Math.min(16,Math.round(L.poly.length/14));i++){const q=L.poly[Math.floor(rnd()*L.poly.length)],x=q[0]*U+(rnd()-0.5)*0.5,z=q[1]*U+(rnd()-0.5)*0.5;if(W.BR&&W.BR.some(b=>Math.hypot(x-b.c[0],z-b.c[1])<b.L/2+0.6))continue;const sz=0.12+rnd()*0.2;rocks.push({x,y:hAt(W.HF,x,z)+sz*0.12,z,sx:sz*(1+rnd()*0.5),sy:sz*0.6,sz:sz,ry:rnd()*6,c:[0x8f907f,0xa0a08c,0x7e7f70][(rnd()*3)|0]})}}
  /* 圍籬：沿著擺放的順序連起來 */
  if(fences.length)fenceLine(fences);
  buildFlora(trees,rocks,bushes)}
function w3dLeave(quick){if(!W)return;const w=W;W=null;
  w.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){for(const m of [].concat(o.material)){if(m.map&&!TEXL.has(m.map)&&![...SVGT.values()].some(v=>v.tex===m.map)&&m.map!==LEAF.t)m.map.dispose();m.dispose()}}});
  try{R.rd.renderLists.dispose()}catch(e){}
  if(!quick&&R){R.cv.style.display='none';if(R.raf>0)cancelAnimationFrame(R.raf);R.raf=0}}

/* ---------- 遊戲狀態 → 立牌 ---------- */
function w3dSetPlayer(x,y,face,svg){if(!W)return;W.me.x=x;W.me.y=y;W.me.face=face;if(svg)W.me.svg=svg}
function avatarBB(o,S){/* S：{key,svg}；角色的 SVG 以腳底為原點，畫在 -32 -64 64 68 */
  const tex=svgTex(S.key,S.svg,'-32 -64 64 68',192,204);
  if(!o.bb){if(!tex)return;const h=68*1.15*CK*U;o.bb=billboard(tex,o.x*U,o.y*U,{w:h*64/68,h,tint:false,flip:false,shLen:0.5,sink:0.02});o.tex=tex}
  else if(tex&&tex!==o.tex){o.bb.m.material.uniforms.map.value=tex;o.tex=tex}
  if(o.tex)W.inUse.add(o.tex)}
function w3dSetOthers(list){if(!W)return;const seen=new Set();for(const p of list){seen.add(p.id);let o=W.others.get(p.id);if(!o){o={x:p.x,y:p.y,bb:null};W.others.set(p.id,o)}o.x=p.x;o.y=p.y;avatarBB(o,p);if(o.bb)placeBB(o.bb,o.x*U,o.y*U,0)}
  for(const [k,o] of W.others)if(!seen.has(k)){dropBB(o.bb);W.others.delete(k)}}
function w3dSetMonsters(list){if(!W)return;const now=Date.now(),seen=new Set();
  for(const m of list){seen.add(m.id);let o=W.mons.get(m.id);
    if(!o){const h=m.pxh*CK*U,tex=imgTex(m.src);o={bb:billboard(tex,m.x*U,m.y*U,{w:h*m.asp,h,tint:false,flip:m.face>0,shLen:0.45,lift:m.fly*U*CK}),src:m.src,h,dieAt:0,born:m.born};W.mons.set(m.id,o)}
    const u=o.bb.m.material.uniforms,src=m.hit?m.srcHit:m.src;if(src!==o.cur){o.cur=src;u.map.value=imgTex(src)}
    u.uFlip.value=m.face>0?1:0;
    const ht=now-m.lastHit;u.uFlash.value=ht<160?0.75*(1-ht/160):0;
    let sx=1,sy=1,dx=0,bob=0,op=1;
    if(ht<200){const t=ht/200;sx=1+0.12*(1-t);sy=1-0.12*(1-t);dx=(m.face>0?-1:1)*0.14*(1-t)}
    if(m.moving)bob=Math.abs(Math.sin(m.wph*6))*0.06;
    if(m.born&&now-m.born<400){const t=(now-m.born)/400;op=t;sx*=0.8+0.2*t;sy*=0.8+0.2*t}
    if(m.dead){if(!o.dieAt)o.dieAt=now;const t=Math.min(1,(now-o.dieAt)/500);op=1-t;dx+=(m.face>0?-1:1)*1.6*t;bob+=2.2*t-1.2*t*t;o.bb.m.rotation.z=(m.face>0?1:-1)*t*3}
    u.uOp.value=op;placeBB(o.bb,m.x*U+dx,m.y*U,bob);orientOne(o.bb);o.bb.m.scale.x*=sx;o.bb.m.scale.y*=sy;if(o.bb.sil)o.bb.sil.visible=!m.dead}
  for(const [k,o] of W.mons)if(!seen.has(k)){dropBB(o.bb);W.mons.delete(k)}}
/* 植株、道具、發光的植株：都是 SVG 畫好的小圖（key、svg、x、y、vb、pw、ph、kind） */
function w3dSetPlants(list){if(!W)return;const seen=new Set();
  for(const p of list){seen.add(p.key);let o=W.plants.get(p.key);const tex=svgTex(p.tk,p.svg,p.vb,p.pw,p.ph);
    if(!o){if(!tex)continue;const h=p.vh*CK*U;o={bb:billboard(tex,p.x*U,p.y*U,{w:h*p.pw/p.ph,h,tint:false,flip:false,shLen:0.45,sink:0}),tex};o.bb.m.userData.pick={kind:p.kind,key:p.key};W.plants.set(p.key,o)}
    else if(tex&&tex!==o.tex){o.bb.m.material.uniforms.map.value=tex;o.tex=tex}
    W.inUse.add(o.tex);placeBB(o.bb,p.x*U,p.y*U,p.bob||0)}
  for(const [k,o] of W.plants)if(!seen.has(k)){dropBB(o.bb);W.plants.delete(k)}}
function w3dDirty(){if(W)W.dirty=true}
/* 螢幕座標 → 地圖座標（先看有沒有點到植株、道具，再打地面） */
let RAY=null,MV=null;
function w3dPick(sx,sy){if(!W)return null;if(!RAY){RAY=new T3.Raycaster();MV=new T3.Vector2()}MV.set(sx/innerWidth*2-1,-(sy/innerHeight)*2+1);RAY.setFromCamera(MV,W.cam);
  const pk=[...W.plants.values()].map(o=>o.bb.m);const h=RAY.intersectObjects(pk)[0];if(h&&h.object.userData.pick)return {...h.object.userData.pick,x:h.object.position.x/U,y:h.object.position.z/U};
  const g=RAY.intersectObject(W.ground)[0];if(!g)return null;return {kind:'ground',x:g.point.x/U,y:g.point.z/U}}
/* 測試用：地圖座標 ↔ 3D 座標 */
function w3dToWorld(px,py){return W?[px*U,hAt(W.HF,px*U,py*U),py*U]:[px*U,0,py*U]}
function w3dToMap(x,z){return [x/U,z/U]}

/* ---------- 鏡頭 ---------- */
function placeCam(snap){const [,p,d]=VIEWS3[vi],pr=p*Math.PI/180,MW=W.HF.MW,MD=W.HF.MD;
  const tx=Math.max(Math.min(MW/2,5.4),Math.min(Math.max(MW/2,MW-5.4),W.me.x*U)),tz=Math.max(2.6,Math.min(MD-1.4,W.me.y*U+0.4));
  if(!W.ct||snap)W.ct=new T3.Vector3(tx,hAt(W.HF,tx,tz),tz);
  else{const k=Math.min(1,W.dt*4);W.ct.x+=(tx-W.ct.x)*k;W.ct.z+=(tz-W.ct.z)*k;W.ct.y+=(hAt(W.HF,W.ct.x,W.ct.z)-W.ct.y)*Math.min(1,W.dt*3)}
  W.cam.position.set(W.ct.x,W.ct.y+Math.sin(pr)*d,W.ct.z+Math.cos(pr)*d);W.cam.lookAt(W.ct)}
function w3dView(next){if(next!=null)vi=next;else vi=(vi+1)%3;try{localStorage.setItem('sw_3dview',vi)}catch(e){}if(W){for(const o of W.BBS)orientOne(o);W.dirty=true;if(W.eco)R.rd.shadowMap.needsUpdate=true}return VIEWS3[vi][0]}
function w3dViewName(){return VIEWS3[vi][0]}

/* ---------- 省電（108.6） ---------- */
function applyEco(force){const eco=!!W3D_HOST.eco();if(!force&&eco===W.eco)return;W.eco=eco;sizeR();W.SW.value=eco?0:1;
  for(const o of W.BBS){const u=o.m.material.uniforms;u.uSway.value=eco?0:u.uSway0.value}
  const c=W.sun.shadow.camera;const r=eco?Math.max(W.HF.MW,W.HF.MD)/2+8:17;c.left=-r;c.right=r;c.top=r;c.bottom=-r;c.updateProjectionMatrix();W.sun.shadow.mapSize.set(eco?2048:1024,eco?2048:1024);if(W.sun.shadow.map){W.sun.shadow.map.dispose();W.sun.shadow.map=null}
  if(eco){const cx=W.HF.MW/2,cz=W.HF.MD/2;W.sun.position.set(cx-12,24,cz-10);W.sun.target.position.set(cx,0,cz);W.sun.target.updateMatrixWorld();R.rd.shadowMap.autoUpdate=false;R.rd.shadowMap.needsUpdate=true}else R.rd.shadowMap.autoUpdate=true;
  W.dirty=true}

/* ---------- 迴圈：畫面沒有變化就不重畫 ---------- */
function loop(ts){R.raf=0;if(!W)return;
  const cap=W3D_HOST.cap(),eco=W3D_HOST.eco(),lim=Math.max(cap,eco?32:0);
  if(cap>=1e9){R.raf=-1;setTimeout(()=>{if(W)R.raf=requestAnimationFrame(loop)},500);return}
  if(lim>0){R.raf=-1;setTimeout(()=>{if(W)R.raf=requestAnimationFrame(loop)},Math.max(0,lim-18))}else R.raf=requestAnimationFrame(loop);
  const dt=R.last?Math.min(0.1,(ts-R.last)/1000):0.016;R.last=ts;W.dt=dt;W.UT.value=ts/1000;
  applyEco(false);W.inUse=new Set();
  try{W3D_HOST.pump()}catch(e){console.error(e)}
  /* 玩家 */
  if(W.me.svg)avatarBB(W.me,W.me.svg);if(W.me.bb)placeBB(W.me.bb,W.me.x*U,W.me.y*U,W.me.bob||0);
  placeCam(false);
  W.lodT+=dt;if(W.lodT>0.25){W.lodT=0;for(const L of W.LOD){const near=Math.hypot(L.x-W.ct.x,(L.z-W.ct.z)*0.8)<12;if(near!==L.near){L.near=near;L.md.visible=near;L.ms.visible=!near;W.dirty=true;if(W.eco)R.rd.shadowMap.needsUpdate=true}}}
  if(!W.eco){W.sun.position.set(W.ct.x-12,W.ct.y+22,W.ct.z-10);W.sun.target.position.copy(W.ct)}
  let sig=W.me.x*7.1+W.me.y*3.3+(W.me.bob||0)*11+W.cam.position.x*5.7+W.cam.position.z*2.9+W.cam.position.y;
  for(const o of W.mons.values())sig+=o.bb.m.position.x*1.3+o.bb.m.position.y*7+o.bb.m.position.z*0.7+o.bb.m.material.uniforms.uFlash.value*3+o.bb.m.material.uniforms.uOp.value;
  if(Math.abs(sig-W.sig)>1e-4){W.dirty=true;W.sig=sig}
  /* 一般模式：有東西在動就每幀畫；什麼都沒動時樹還在搖，降到每秒 20 次。省電模式：沒動就完全不畫 */
  const idleOK=!W.eco&&ts-R.lastDraw>50;
  if(W.dirty||idleOK){R.rd.render(W.scene,W.cam);R.lastDraw=ts;W.dirty=false;R.draws++;try{if(window.PF)window.PF.d3=(window.PF.d3||0)+1}catch(e){}}}

window.w3dEnter=w3dEnter;window.w3dLeave=w3dLeave;window.w3dSetPlayer=w3dSetPlayer;window.w3dSetOthers=w3dSetOthers;window.w3dSetMonsters=w3dSetMonsters;window.w3dSetPlants=w3dSetPlants;window.w3dPick=w3dPick;window.w3dDirty=w3dDirty;
window.w3dView=w3dView;window.w3dViewName=w3dViewName;window.w3dToWorld=w3dToWorld;window.w3dToMap=w3dToMap;window.W3D_U=U;
window.w3dHeightOf=(M)=>{const HF=buildHeight(M,mkRnd(hsh('w3d|'+M.bk+'|'+M.id)));return (px,py)=>hAt(HF,px*U,py*U)};
window.w3dInfo=()=>W?{draws:R.draws,bbs:W.BBS.length,tris:R.rd.info.render.triangles,calls:R.rd.info.render.calls,view:VIEWS3[vi][0],eco:W.eco}:null;
})();
