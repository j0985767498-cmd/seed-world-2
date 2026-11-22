/* 第 198.3 節：神之子的每秒傷害和主人比（招 1＋招 2＋普通攻擊合計不能超過主人的 35%）。
   主人＝tools/sim184.js 的 run()（同武器同階、單一目標、60 秒、技能冷卻好就放）；神之子用公式（單一目標，增傷、爆擊照持續時間折算成主人傷害的百分比）。
   用法：node tools/sim198.js（tload.js 會跑並檢查） */
const S=require('./sim184.js'),T=S.T;
const LIMIT=0.35;
/* 神之子每秒傷害（fyBaseDmg 的倍數）：na＝普通攻擊；s＝招 1、招 2 自己的傷害；buf＝增傷、易傷、爆擊換成「主人傷害 ×多少」 */
function fy(k,st){const K=T.FY_SK[k],na=(T.FY_ATK_PCT[st]||0.3)/T.FY_ATK_CD;let dmg=0,buf=0;const has=i=>i<=st;
  const s1=K[0],s2=K[1];
  if(k==='tomato'){if(has(0)){dmg+=s1.mul/s1.cd;buf+=s1.vul*4/s1.cd}if(has(1))buf+=s2.up*6/s2.cd}
  if(k==='pumpkin'){if(has(0))dmg+=5*s1.mul}
  if(k==='melon'){if(has(0))dmg+=s1.mul/s1.cd;if(has(1))dmg+=3*s2.mul/s2.cd}
  if(k==='chili'){if(has(0))dmg+=s1.mul*1.025/s1.cd;if(has(1))buf+=s2.crit*0.5*6/s2.cd}
  if(k==='zucchini'){if(has(0))dmg+=s1.mul/s1.cd}
  if(k==='eggplant'){if(has(0))dmg+=3*s1.mul/s1.cd}
  if(k==='corn'){if(has(0))dmg+=5*s1.mul/s1.cd;if(has(1))dmg+=s2.mul*2*8/s2.cd}
  return {na,dmg,buf}}
function table(){const rows=[];let worst=0,bad=[];
  for(const [tier,stars] of S.CFG){const own={};for(const c of Object.keys(T.WP_TARGET)){const tot=S.run(c,tier,stars,'single');const base=T.fyBaseDmg();own[c]=tot/60/base}/* 主人每秒傷害 ÷ fyBaseDmg */
    for(const k of Object.keys(T.FY_SK))for(const st of [1,2]){const F=fy(k,st);let mx=0,mc='';for(const c in own){const r=(F.na+F.dmg)/own[c]+F.buf;if(r>mx){mx=r;mc=c}}worst=Math.max(worst,mx);if(mx>LIMIT)bad.push(`${k} ${st} ${tier}階 ${mc} ${(mx*100).toFixed(0)}%`);rows.push({tier,k,st,mx,mc})}}
  return {rows,worst,bad}}
module.exports={table,fy,LIMIT};
if(require.main===module){const R=table(),NM={tomato:'蘿瑪',pumpkin:'傑柯',melon:'蜜露',strawberry:'芙蕾',chili:'卡宴',zucchini:'祖琪',broccoli:'凱爾',eggplant:'奧貝琳',corn:'麥斯'},W=c=>T.WEAPONS[c].n;
  const L=['神之子 招1＋招2＋普通攻擊 ÷ 主人（同武器同階、單一目標）：每格是 9 把武器裡最高的那一把'];
  for(const [tier] of S.CFG){L.push(`\n=== ${tier} 階 ===`);for(const k of Object.keys(NM)){const a=R.rows.find(r=>r.tier===tier&&r.k===k&&r.st===1),b=R.rows.find(r=>r.tier===tier&&r.k===k&&r.st===2);L.push(`${NM[k].padEnd(4,'　')} 進化 ${(a.mx*100).toFixed(0).padStart(3)}%（${W(a.mc)}）  神化 ${(b.mx*100).toFixed(0).padStart(3)}%（${W(b.mc)}）`)}}
  L.push(`\n最高 ${(R.worst*100).toFixed(0)}%；${R.bad.length?'超過 35%：'+R.bad.join('、'):'全部 ≤ 35%'}`);console.log(L.join('\n'))}
