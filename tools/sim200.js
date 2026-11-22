/* 第 200 節：九隻領主的數字表與一個人打完要幾分鐘；神寵＋神之子的普通攻擊不能超過主人的 50%。
   主人＝tools/sim184.js 的 run()（單一目標、Lv 20 的結果照 pAtk 換成入口等級）。假設：入口等級、武器階 1＋⌊等級÷15⌋（最多 6）、0 星；
   打得到的時間 55%（躲招、第二階段、塔羅斯換形態、倒下）；不算神之子、神寵、補血。hpK 照遊戲裡的 LORDS。用法：node tools/sim200.js */
const S=require('./sim184.js'),T=S.T;
const UP=0.55;
const vmT=()=>T;
function table(){const own={},pa=lv=>Math.round(1000*Math.pow(1.03,Math.max(0,(lv||1)-2)));const LV={grass:2,forest:10,marsh:20,sakura:30,desert:40,snow:50,volcano:60,canyon:70,ruins:80};
  const rows=[];for(const bk in LV){const lv=LV[bk],tier=Math.min(6,1+Math.floor(lv/15));let sum=0,n=0;for(const c of Object.keys(T.WP_TARGET)){sum+=S.run(c,tier,0,'single')/60*pa(lv)/pa(20);n++}const dps=sum/n;rows.push({bk,lv,tier,dps})}
  /* 50%：神之子神化普通攻擊（0.8÷2.5）＋完全體神寵（0.4÷3），fyBaseDmg 的倍數；主人＝每秒傷害÷fyBaseDmg，9 把裡最吃虧的 */
  let worstPct=0;for(const [tier,stars] of S.CFG)for(const c of Object.keys(T.WP_TARGET)){const tot=S.run(c,tier,stars,'single');const O=tot/60/T.fyBaseDmg();worstPct=Math.max(worstPct,(0.8/2.5+0.4/3)/O)}
  return {rows,worstPct}}
module.exports={table};
if(require.main===module){const fs=require('fs'),path=require('path'),h=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  const R=table(),HP={grass:3000,forest:5000,marsh:7000,sakura:12000,desert:18000,snow:25000,volcano:33000,canyon:41000,ruins:50000},RD={grass:[50,80],forest:[80,120],marsh:[100,150],sakura:[180,250],desert:[250,350],snow:[350,450],volcano:[450,550],canyon:[550,650],ruins:[650,750]},NM={grass:'克洛諾斯',forest:'米涅瓦',marsh:'艾克希爾',sakura:'列那',desert:'巴絲',snow:'奧索',volcano:'歐特魯斯',canyon:'蕾普絲',ruins:'塔羅斯'};
  const php=lv=>Math.round(1000*Math.pow(1.028,Math.max(0,lv-2)));const L=['領主　　 入口 Lv  hpK   血量        dmgK   一下扣（招本身／近戰）  估計時間'];
  for(const r of R.rows){const hpK=T.LORDS[r.bk].hpK,hp=HP[r.bk]*hpK,avg=(RD[r.bk][0]+RD[r.bk][1])/2,dk=+(0.22/0.6*php(r.lv)/avg).toFixed(2),hit=Math.round(avg*dk),min=hp/(r.dps*UP)/60;
    L.push(`${NM[r.bk].padEnd(4,'　')} Lv ${String(r.lv).padStart(2)}  ${hpK}  ${String(hp).padStart(10)}  ${dk.toFixed(2).padStart(5)}  ${hit}／${Math.round(hit*0.6)}（血 ${php(r.lv)}）  ${min.toFixed(1)} 分（武器 ${r.tier} 階、每秒 ${Math.round(r.dps)}）`)}
  L.push(`\n神寵（完全體）＋神之子（神化）的普通攻擊 ÷ 主人：最高 ${(R.worstPct*100).toFixed(0)}%`);console.log(L.join('\n'))}
