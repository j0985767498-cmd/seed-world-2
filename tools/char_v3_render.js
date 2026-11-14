/* ===== 人物新畫法（14n）：照參考圖描出來的 5 個方向，分成 身體／手／腳 =====
   資料 AV3[view] = {body:[圖層], arms:[{n,p:[支點],L:[圖層]}], legs:[{n,p,L}]}
   圖層 {r:部位, k:明暗, d:路徑}；r='ol' 是整塊外框色。
   上色後的零件字串依「顏色＋方向」快取，每一格只換 transform（腳抬起／擺動、手擺動、身體上下）。
   動作（澆水、播種、收成、授粉）：手的角度、蹲低照舊畫法；手上的工具還沒畫。 */
const AV3_CACHE=new Map();
function av3Parts(av,view){
  const key=view+'|'+av.skin+'|'+av.hairC+'|'+av.topC+'|'+av.bottomC+'|'+av.shoeC;
  let P=AV3_CACHE.get(key);if(P)return P;
  const hex=c=>c.startsWith('#')?c:'#'+c.match(/\d+/g).slice(0,3).map(v=>(+v).toString(16).padStart(2,'0')).join('');
  const col={ol:AV_OL,hair:HAIRC[av.hairC]||HAIRC[0],skin:SKINS[av.skin]||SKINS[0],shirt:avCol(av.topC),cream:'#F4EBD8',pants:avCol(av.bottomC),btn:'#E2B07A',boot:avCol(av.shoeC)};
  const draw=L=>L.map(x=>`<path d="${x.d}" fill="${x.k?shade(hex(col[x.r]),x.k):col[x.r]}"/>`).join('');
  const D=AV3[view]||AV3.front;
  P={body:draw(D.body),arms:D.arms.map(a=>({p:a.p,s:draw(a.L)})),legs:D.legs.map(l=>({p:l.p,s:draw(l.L),ol:l.L[0].d}))};
  if(AV3_CACHE.size>200)AV3_CACHE.clear();
  AV3_CACHE.set(key,P);return P;
}
function av3SVG(av,flip,pose){
  av=avNorm(av);if(typeof pose!=='object'||pose===null)pose={bob:pose||0};
  const view=pose.view||'front',P=av3Parts(av,view);
  const walk=pose.ph!=null,ph=pose.ph||0,t=pose.t||0,sn=Math.sin(ph);
  const act=pose.act||null,ap=Math.min(1,Math.max(0,pose.actP||0)),e=Math.sin(ap*Math.PI);
  const crouch=(act==='plant'||act==='harvest')?e*3.2:0;
  /* 動作時的手：F＝前面那隻、B＝另一隻（角度同舊畫法） */
  let aF=null,aB=null;
  if(act==='water'){aF=-70*e}else if(act==='plant'){aF=-50*e;aB=-35*e}else if(act==='harvest'){aF=-135*e;aB=-135*e}else if(act==='pollinate'){aF=-60*e+Math.sin(t*14)*10*e}
  const bob=(walk?-Math.abs(sn)*1.1:Math.sin(t*2.2)*0.25)+(pose.bob||0)+crouch;
  const rot=(a,p)=>`rotate(${a.toFixed(1)} ${p[0]} ${p[1]})`;
  const g=(s,tr)=>`<g transform="${tr}">${s}</g>`;
  const idle=Math.sin(t*1.6)*1.5;
  let legs='',armsB='',armsF='';
  if(view==='side'){
    const L=P.legs[0],A=P.arms[0],ang=walk?sn*26:0;
    legs=g(L.s+`<path d="${L.ol}" fill="rgba(40,25,15,.22)"/>`,rot(-ang,L.p))+g(L.s,rot(ang,L.p));
    armsF=g(A.s,rot(aF!=null?aF:(walk?-sn*28:idle),A.p));
  }else if(view==='front'||view==='back'){
    const up=[walk?-Math.max(0,sn)*1.7:0,walk?-Math.max(0,-sn)*1.7:0];
    legs=P.legs.map((L,i)=>g(L.s,`translate(0 ${up[i].toFixed(2)})`)).join('');
    const ang=walk?sn*9:idle;
    /* 正面、背面看不到手往前舉，改成往兩旁抬起一點 */
    const s0=aF!=null?-aF*0.45:ang,s1=aB!=null?aB*0.45:(aF!=null?-ang*0.3:-ang);
    armsF=P.arms.map((A,i)=>g(A.s,rot(i?s1:s0,A.p))).join('');
  }else{/* fq、bq：a0 是靠近的手，a1 畫在身體後面 */
    const ang=walk?sn*15:0,up=[walk?-Math.max(0,sn):0,walk?-Math.max(0,-sn):0];
    legs=P.legs.map((L,i)=>g(L.s,`translate(0 ${up[i].toFixed(2)}) `+rot(i?-ang:ang,L.p))).join('');
    const aa=walk?sn*16:idle;
    if(P.arms[1])armsB=g(P.arms[1].s,rot(aB!=null?aB:aa,P.arms[1].p));
    armsF=g(P.arms[0].s,rot(aF!=null?aF:-aa,P.arms[0].p));
  }
  const inner=`<g transform="translate(0 ${bob.toFixed(2)})">${legs}${armsB}${P.body}${armsF}</g>`;
  return `<ellipse cx="0" cy=".3" rx="${walk?9.4-Math.abs(sn)*0.6:10}" ry="2.6" fill="rgba(60,40,20,.18)"/>`+(flip?`<g transform="scale(-1 1)">${inner}</g>`:inner);
}
