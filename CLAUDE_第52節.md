## 52. 高低差的畫法：階地（2026-11-15；取代 38.2 的畫法。聊天室已用 15l 的三張地圖實際畫出來，使用者看過對照圖）

狀態：可以實作，優先於第 38 節其他項目。對照圖：聊天室交給使用者的 `cliff_before_after.png`。

### 52.1 現在為什麼看起來像一道牆
- 岩壁素材一塊一塊分開站在地上，中間看得到地面，所以是「一排石頭」，不是地形。
- 素材下面另外畫了一條顏色平平的橫帶（`M.cliff`），兩種東西疊在一起，看起來像圍牆的牆基。
- 上面和下面的地面顏色完全一樣，沒有任何線索說明哪邊高。
- 石階是貼在缺口上的，沒有切進岩壁裡。

### 52.2 畫法（不用新素材，沿用各區現有的岩壁圖與石階圖）
1. **高地整片變亮**：從地圖頂端到岩壁上緣，蓋一層比較亮的地面色（透明度約 0.7）；上緣往上 46px 再疊一道漸層，顏色接近岩壁素材頂部的草（雪、沙），讓素材頂部和高地地面連成一片。
2. **岩壁連續、不留縫**：
   - 先鋪一整條岩石底色（石階缺口除外），確保素材之間露出來的是岩石、不是地面。
   - 岩壁素材連續排列、互相重疊（間距＝素材寬度的 0.62 倍），每一塊大小 0.92–1.12 倍、隨機左右鏡像、底部上下 ±4px，依底部 y 排序。固定亂數種子。
   - 左右要排到地圖邊界外（-30 到 W+30），由邊界的樹蓋住收尾。
3. **岩壁要夠高**：岩壁高度至少是角色高度的 1.3 倍（約 105px 以上）。太矮就只是一道矮牆。
4. **低地在岩壁腳下有陰影**：岩壁底部往下 70px 的漸層暗色（高地擋住光），這是「下面比較低」最重要的線索。
5. **石階嵌進岩壁**：缺口先填岩石暗面色，石階圖放大到跨滿整個岩壁高度，頂端接高地、底部落在低地並略微突出。
6. **拿掉**：`regGroundHTML` 裡 `M.cliff` 畫的那條平帶與圓角邊條；地圖 `objs` 裡單獨擺放的岩壁素材（草原 `cliff`、沙漠 `cliff`／`sidecliff`、雪原 `rockwall`）。沙漠峽谷那三塊孤立站在沙地上的 `sidecliff` 直接刪除。
7. 碰撞照新的範圍：岩壁整條擋路（上緣到底部），石階範圍是 `walks`。植株點、道具點若落在岩壁範圍內就往上或往下移開。

### 52.3 各區參數（聊天室試畫時用的，可微調）
| 地圖 | 岩壁圖 | 高地亮色 | 上緣漸層色 | 岩石底色／暗面 | 腳下陰影色 |
| --- | --- | --- | --- | --- | --- |
| 草原 山丘 | grass/cliff（顯示約 128×137） | #C3DA92 | #BECB7D | #9F8A7C／#6E5C50 | #3F5A22 |
| 沙漠 峽谷（上方懸崖） | desert/sand_cliff（約 112×146） | #F0DDB0 | #F2C98A | #F09A50／#B36A30 | #8A6030 |
| 雪原 冰洞前 | snow/rock_wall（約 150×100） | #FFFFFF | #F4F8FF | #8F8690／#5E5862 | #7C8CA8 |
- 資料格式照 38.2 的 `plateaus`，但目前三張圖都是「上半張是高地」的橫向階地：`terraces:[{E:上緣y, H:岩壁高, gap:[石階左x, 石階右x]}]`。之後若要做四面都有岩壁的小台地，再擴充。
- 森林青苔谷的瀑布（51.1 F）也用同一個函式做一段階地，瀑布圖放在岩壁正面。

### 52.4 參考程式（聊天室實際跑過，可直接改寫進 `regPrep`／`regGroundHTML`）
畫的順序：地面 → 這個函式的輸出 → 物件（依 y 排序）。
```js
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
/* 階地：上半部是高地。E＝高地邊緣的 y，H＝岩壁高度，gap＝石階的左右 x，art＝岩壁素材 */
function terrace(o){const {W,E,H,gap,art,aw,ah,stairs,sw,sh,hi,lip,rock,rockD,shade,seed}=o;const r=rng(seed);let s='';
  /* 1. 高地：整片蓋一層比較亮的顏色，一直鋪到邊緣 */
  s+=`<rect x="-20" y="-20" width="${W+40}" height="${E+30}" fill="${hi}" opacity=".7"/>`;
  s+=`<rect x="-20" y="${E-46}" width="${W+40}" height="60" fill="url(#lipg)"/>`;
  /* 2. 低地：岩壁腳下的陰影（高地擋住光） */
  s+=`<rect x="-20" y="${E+H-8}" width="${W+40}" height="70" fill="url(#shg)"/>`;
  /* 3. 岩壁底色：先鋪一整條，素材之間不會露出地面 */
  s+=`<rect x="-20" y="${E+8}" width="${gap[0]+20}" height="${H-14}" fill="${rock}"/><rect x="${gap[1]}" y="${E+8}" width="${W+20-gap[1]}" height="${H-14}" fill="${rock}"/>`;
  /* 4. 石階後面的凹槽：填岩石暗面色 */
  s+=`<rect x="${gap[0]-4}" y="${E+14}" width="${gap[1]-gap[0]+8}" height="${H-20}" fill="${rockD}"/>`;
  /* 5. 岩壁素材：連續排、互相重疊、大小與鏡像隨機；頂部的草就是高地的邊緣 */
  const tiles=[];const step=aw*0.62;
  for(const [a,b] of [[-30,gap[0]+8],[gap[1]-8,W+30]]){const n=Math.max(1,Math.round((b-a)/step));for(let i=0;i<n;i++){const k=0.92+r()*0.2,w=aw*k,hh=ah*k,cx=a+(i+0.5)*(b-a)/n+(r()-.5)*10,by=E+H+(r()-.5)*8;tiles.push({cx,by,w,hh,fl:r()<.5})}}
  tiles.sort((p,q)=>p.by-q.by);
  for(const t of tiles)s+=`<g transform="translate(${t.cx.toFixed(1)} ${t.by.toFixed(1)}) scale(${t.fl?-1:1} 1)"><image href="${art}" x="${(-t.w/2).toFixed(1)}" y="${(-t.hh).toFixed(1)}" width="${t.w.toFixed(1)}" height="${t.hh.toFixed(1)}"/></g>`;
  /* 6. 石階：嵌在凹槽裡，頂端接高地、底部落在低地 */
  s+=`<image href="${stairs}" x="${(gap[0]+gap[1])/2-sw/2}" y="${E+H+10-sh}" width="${sw}" height="${sh}"/>`;
  return `<defs><linearGradient id="lipg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lip}" stop-opacity="0"/><stop offset="1" stop-color="${lip}" stop-opacity=".9"/></linearGradient><linearGradient id="shg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade}" stop-opacity=".55"/><stop offset="1" stop-color="${shade}" stop-opacity="0"/></linearGradient></defs>`+s}
```
呼叫例（草原山丘）：`terrace({W:800,E:452,H:106,gap:[353,447],art:'assets/grass/cliff.png',aw:128,ah:137,stairs:'assets/grass/stairs.png',sw:141,sh:119,hi:'#C3DA92',lip:'#BECB7D',rock:'#9F8A7C',rockD:'#6E5C50',shade:'#3F5A22',seed:7})`

### 52.5 檢查
- 三張圖做完各截一張「隱藏標記」的圖回報，和 `cliff_before_after.png` 的右圖比對。
- vm：只有石階能上下；岩壁沒有可以穿過的縫；雪原、草原、沙漠其他地圖輸出不變。
