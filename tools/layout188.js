/* 第 188 節：照 CSS 的數字算每顆按鈕的範圍，檢查四個場景 × 兩種寬度 × 兩種高度有沒有重疊（不是真的畫面；改了 188 的 CSS 要同步改這裡）。node tools/layout188.js */
const sizes=[[375,812],[375,667],[320,568],[320,667]];let bad=0;
for(const [W,H] of sizes){const cs=W>=375?1:W>=350?0.9:0.82,fk=H<=520?34:38;
  const R=(name,x,y,w,h,round)=>({name,x,y,w,h,round});
  const fromRB=(name,r,b,s,round=true)=>R(name,W-(r+s)*cs,H-(b+s)*cs,s*cs,s*cs,round);/* 右、下 → 左上角 */
  const left=[R('頭像＋血條',8,8,172,58),R('任務提示',8,66,W-128,30)];
  ['背包','任務','神之子','選單'].forEach((n,i)=>left.push(R(n,8-3,104+i*(fk+6)-3,fk+6,fk+6)));
  const joy=R('搖桿',18,H-24-124,124,124,true);
  const scenes={
    '農場':[...left,R('地圖按鈕',W-52,8,44,44,true),R('地名',W-60-(W-248),18,W-248,24),fromRB('綠色大按鈕',18,30,88),R('情境按鈕 1',W-52,H-244*cs-44,44,44,true),R('情境按鈕 2',W-52,H-244*cs-96,44,44,true),joy],
    '城鎮':[...left,R('地圖按鈕',W-52,8,44,44,true),R('地名',W-60-(W-248),18,W-248,24),R('情境按鈕 1',W-52,H-244*cs-44,44,44,true),joy],
    '野外（有掉落物、有組隊）':[...left,R('隊伍名單',54,104,148,120),R('小地圖',W-104,8,96,96),fromRB('翻滾',18,30,88),fromRB('技能 1',116,22,64),fromRB('技能 2',100,98,64),fromRB('補血藥',176,W<350?120:92,46),fromRB('撿起',100,176,56),R('連擊',W-14-80,H*0.4,80,64),joy],
    '秘境打僕人':[...left,R('小地圖',W-104,8,96,96),R('主、僕人血條',W/2-105,110,210,30),fromRB('翻滾',18,30,88),fromRB('技能 1',116,22,64),fromRB('技能 2',100,98,64),fromRB('補血藥',176,W<350?120:92,46),fromRB('撿起',100,176,56),R('連擊',W-14-80,H*0.4,80,64),joy]};
  const hit=(a,b)=>{if(a.round&&b.round){const ax=a.x+a.w/2,ay=a.y+a.h/2,bx=b.x+b.w/2,by=b.y+b.h/2;return Math.hypot(ax-bx,ay-by)<a.w/2+b.w/2-0.5}
    return a.x<b.x+b.w-0.5&&b.x<a.x+a.w-0.5&&a.y<b.y+b.h-0.5&&b.y<a.y+a.h-0.5};
  for(const [sc,L] of Object.entries(scenes)){const o=[];for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++)if(hit(L[i],L[j]))o.push(L[i].name+' × '+L[j].name);
    const colBot=104+4*(fk+6)-6,gap=joy.y-colBot;if(gap<40)o.push(`功能鍵直排離搖桿只有 ${Math.round(gap)}px`);
    console.log(`${W}×${H} ${sc}：${o.length?'✗ '+o.join('、'):'沒有重疊'}`);bad+=o.length}}
console.log(bad?`共 ${bad} 處`:'全部沒有重疊');
