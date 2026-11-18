# 《種子的世界》專案說明（CLAUDE.md）

> 程式：`index.html`（`BUILD = '2026-11-17y'`）。**程式碼才是唯一的事實來源**，和文件衝突時以程式為準。
> 2026-11-18 起 CLAUDE.md 只放接手需要的東西。已完成各節的原文、第 9 節（各系統的實作紀錄）、第 10 節（版本歷程）、第 17 節都在 `docs/規格存檔.md`；還沒做或還沒定案的節，每節一個檔案在 `docs/待實作/`。哪一節在哪裡看最下面的「節號索引表」。
> 下一版 BUILD 是 `2026-11-17z`。目前進行中：第 108 節（3D 畫面），草原 5 張已做（17x 入口、17y 其他 4 張），還沒在 iPhone 實測；接下來是第 108.0 的第 2 階段（其他地區，每區一節）。

---

## 0. 接手者必讀

### 0.1 如何讀取程式碼

1. 本專案在 Claude Code 中使用，`index.html` 就在專案資料夾內，直接讀取即可。
2. **不要把整個 `index.html` 讀進來**（約 380 KB，會耗掉大量額度）。用 `grep -n`、Python 搜尋關鍵字，只看需要的段落。
3. 修改時用 Python 做字串替換，每次替換都確認「只出現一次」，替換後立刻做語法檢查（見第 15 節）。
4. **注意：** 程式中很多函式寫在同一行。插入註解時一律用 `/* … */`，不要用 `//`，否則會把同一行後面的程式碼變成註解（曾經實際發生過）。

### 0.2 工作守則

1. **每次改版都要更新 `BUILD`**（`const BUILD='…'`），**同時把專案根目錄的 `version.json` 改成同一個值**（`{"build":"…"}`；16h 起遊戲一打開會抓這個檔，和程式裡的 BUILD 不一樣就自動重新整理一次，見 9.53）。遊戲會比對網頁上的版本號，舊版畫面發現有新版時會停止存檔並提示重新整理。忘記更新會造成新舊版本混用、存檔互相覆蓋。
2. **不要重置玩家資料。** 使用者明確要求改版時保留既有的品種、種子與植株。需要轉換資料時，寫一次性的遷移函式，放在 `migrate(o)` 裡，並用 `state` 上的旗標避免重複執行（現有旗標：`shapeV`、`cleanV`、`tutV`、`resV`、`specV`、`geneV`）。`newGame()` 也要同步加上新旗標。例外：舊肥料換金幣（14g）刻意**不用旗標**，每次載入都檢查（見 9.10）。
3. **基因型新增任何欄位，必須同步修改四個地方**，否則存檔後欄位會遺失：`genc3`／`gdec3`（14l 起新格式 `K:`；`genc2`／`gdec2`／`needH` 只剩讀舊存檔）；`gFlat`／`gUnflat`；`gamete`／`fuse`；`isGeno`。
4. **大的設計變更先討論、確認後才動程式。** 使用者常說「先別改」「你先等等想一下」，習慣先看方案、確認細節再實作。明確的錯誤修正可以直接做。使用者說「你自己決定吧」時，要給出明確的決定與理由。
5. **介面文字一律繁體中文，避免專業術語**（不出現「顯性、隱性、自交系、分離」等詞，或只放在說明頁）。使用者本身是作物遺傳育種背景的碩士生，討論時可以用專業用語。
6. **交付前檢查**：Node 語法檢查＋能測的邏輯用 vm 模擬環境實測（第 15 節）。誠實說明哪些沒有在手機上實測。
7. 修改後直接存回專案資料夾的 `index.html`，**不要自行 commit 或 push**。使用者會用 GitHub Desktop 檢查變更、commit 並 push 到 GitHub Pages。交付時簡短列出改了哪些地方，方便使用者在 GitHub Desktop 對照。
8. 測試者都用 **iPhone（Safari）**。
9. 測試需要 Node.js。若電腦沒有安裝，先告訴使用者，請他到 nodejs.org 安裝 LTS 版，不要跳過測試。
10. 使用者的電腦是 Windows；測試者用 iPhone（Safari）。

### 0.3 工作規則（2026-11-18）

1. **一次只有一個 Claude Code 改程式**（`index.html`、`js/`、`CLAUDE.md`、`docs/`）。
2. **改 CLAUDE.md（或 docs 裡的檔案）之前，先從磁碟重讀那個檔案**，不要用對話裡舊的版本覆蓋。
3. **預設不截圖、不產生預覽頁**（`_preview_game.html`、`tools/` 裡的總覽頁、截圖），使用者要求或規格寫了才做。**回報只用幾句話**：改了什麼、和規格不同的地方、測了什麼、沒測什麼。
4. **實作第 N 節時，只讀 CLAUDE.md 和 `docs/待實作/第N節.md`**（需要舊的細節再搜尋 `docs/規格存檔.md`，不要整份讀進來）。做完：把 `docs/待實作/第N節.md` 的原文接到 `docs/規格存檔.md` 最後面、刪掉那個檔案，在規格存檔裡補一段實作紀錄（原本寫在第 9 節的那種），更新下面的「程式地圖」（只寫新的區塊與關鍵函式）與「節號索引表」的狀態。
5. 使用者給新的規格檔時（例如 `CLAUDE_第N節.md`），不要併進 CLAUDE.md：原文搬到 `docs/待實作/第N節.md`，在索引表加一列。
6. 版本歷程（每個 BUILD 一句）寫在 `docs/規格存檔.md` 的第 10 節表格最上面。

## 15. 測試方法

### 15.1 語法檢查（`chk.js`）

```js
const fs=require('fs');const h=fs.readFileSync(process.argv[2],'utf8');
const js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
try{new Function(js);process.stdout.write('ok')}catch(e){process.stdout.write('ERR '+e.message)}
```

用法：`node chk.js index.html`。終端機輸出含中文時，建議導到檔案再用 Python 讀取，避免輸出被截斷。

### 15.2 邏輯測試（vm 模擬環境範本）

```js
const fs=require('fs'),vm=require('vm');
const h=fs.readFileSync('index.html','utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={newGame,makeWild,phen,child,plantFromLot,lotDist,infoHTML,traySow,trayHTML,trayAction,openHarvest,harvestHTML,harvestAction,lotCat,migrate,packState,unpack,get state(){return state},get sheet(){return sheet},setScene(v){scene=v}};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;T.newGame();T.setScene('farm');const st=T.state;
// 純合親本：把每組對偶基因改成相同
const hom=g=>JSON.parse(JSON.stringify(g),(k,v)=>Array.isArray(v)&&v.length===2&&!Array.isArray(v[0])&&typeof v[0]!=='object'?[v[0],v[0]]:v);
const A=hom(T.makeWild('tomato','grass',false)),B=hom(T.makeWild('tomato','forest',false));
```

注意：`newGame()` 本身會設定 `state`，不要寫成 `state=newGame()`。新遊戲 `lots` 是空的，測試用種子包要自己建立。此方式無法測 Firebase 連線、權限與實際畫面。

## 16. 與使用者溝通的習慣

- 使用者是作物遺傳育種碩士生，討論遊戲時語氣可以輕鬆，但要具體、直接，提出明確建議與理由。
- 使用者會用「不是質疑，是疑問」提問，回答要老實說明設計原因；若原設計不合理，直接承認並提出修正。
- 每次只問一個問題；大改動先列方案確認。
- 交付後簡短說明：改了什麼、和先前決定不同的地方、測試結果、需要注意的地方。

---

## 1. 專案概況

- 多人線上作物育種遊戲：種植、雜交、選拔作物，培育新外觀並登錄全服圖鑑（品種權），讓自己的名字留在圖鑑上。
- 定位：介於「現實育種」與「虛擬奇幻」之間；遺傳規則寫實，但要讓沒有遺傳背景的玩家也能玩。
- 目前是**測試服**，2–3 位朋友測試，`TEST_MODE = true`。託管於 GitHub Pages，手機瀏覽器遊玩。
- 使用者長期期望：形成類似天堂、楓之谷的交易文化（有人刷寶、有人收購），並有任務與成長讓玩家有方向。

## 2. 技術架構

- **單一檔案** `index.html`（約 3,600 行、380 KB），CSS 與 JavaScript 都在檔案內。
- 後端：Firebase（compat 10.12.2），專案名稱 `seed-world`
  - Auth：Google 登入；
  - Firestore 集合：`players`（每人一份存檔，欄位 `save` 為字串）、`listings`、`registry`、`rights`、`news`、`discoveries`、`boards`、`profiles`、`messages`、`backups`；
  - Realtime Database：線上狀態與角色位置。
- Firestore 安全規則在 Firebase 主控台，不在檔案內。
- `ADMIN_EMAILS = []`，管理員功能目前無法使用。
- **每位玩家的存檔上限 1 MB**，用 `byteLen()`（`TextEncoder`）計算，不能用字串長度。

## 3. 資料模型

### 3.1 基因型

```js
{                        // 14l 起（第 20、24 節）
  sv: 3,
  b:  [0, 2],            // 基本造型類型 0–2，兩個一樣才顯示該類型，否則顯示 0
  sp: [0, 3],            // 特殊/專屬造型因子：0 無、1–6 特殊、7–13 專屬，兩個一樣才出現
  pw: [1, 1],            // 花紋開關，兩個都是 1 才有花紋
  c:  ['red','yellow'],  // 果皮顏色（一對，看到什麼就是什麼：純色／混色／淡特殊色／雙色）
  pc: ['white','white'], // 花紋顏色（同一條規則）
  pf: [0, 1],            // 花紋形式 0 條紋、1 斑點、2 星點、3 漸層；兩個不同 → 兩種一起
  n:  { size, perf },    // 各 10 組，NUMN = 10，數值 0–1
  o:  { sp, c, pc, pf }  // 選填：遠緣導入的來源作物
}
```

14l 起 `speed`、`yield`、`vigor`、尖因子 `s`、主副色 `c1`／`c2` 已移除。舊格式（sv 1、2）由 `geno3(g,crop)` 轉成 v3；`fixGeno` 在讀檔時修補。

### 3.2 存檔編碼

`packState` / `unpack`（`gReplacer` / `gReviver`）會自動把 state 中**任何位置**的基因型物件編碼成 `K:` 字串（14l，`genc3`／`gdec3`，長度 `GLEN3`）。舊的 `G:`／`H:` 仍讀得懂，讀入時轉成 v3。種原庫壓縮 `zs.v=3`（舊壓縮用 `gUnflatOld` 還原）。育苗盤裡的基因型也因此自動被編碼。

### 3.3 種子包（lot）

```js
{ id, lid, crop, name, source,
  m, f,                  // 母本、父本（後代預覽 lotDist 只用這兩個）
  count | seeds | zs,    // 只記顆數 / 逐顆基因型陣列 / 壓縮
  zi, germ, ptier, cross, wide, rel, gen, par, gpar, slot, obs }
```

- 顆數一律用 `lc(l)`；抽種用 `drawSeed(l)`。
- `gen`：`0` 原始，`1` 雜交第一代，自交 +1（野生 gen 0 自交仍為 0）。
- **不同植株的種子不可混在同一包**，因為預覽只用 `m`、`f` 計算，混包會讓預覽錯誤。

### 3.4 植株（plot）

`plantFromLot(lot, g)` 建立，含 `g, m, crop, name, lid, lotId, no, stage, prog, watered, fert, flowerT, pollen, wide, gen, hv, yf, obs`。
- `stage`：`seedling` → `flower` → `fruit` → `ripe`。
- `watered`、`fert`（每階段施肥）**已不再使用**，欄位保留。
- `pollen`：雜交時 `{type:'cross', fatherG, fatherCrop, fatherLid, fatherName, fatherPar, wide}`；自交 `{type:'self'}`；雜交失敗 `{type:'self', failed:true}`。

### 3.5 state 重要欄位

`lots`（種子袋 40 格：常用 10、備用 30）、`vault`、`plots`、`plotPos`（`null` 表示未開墾）、`tray`（育苗盤，見 9.2）、`ex`、`exCap`、`weekly`、`daily`、`orders`、`counts`、`coins`、`items`（14g 起只有 `acc` 生長加速劑「次」、`mut` 誘變劑「瓶」）、`speed`、`tut`、`specs`（果實標本清單，14i）、旗標 `shapeV`／`cleanV`／`tutV`／`resV`／`specV`／`geneV`（14l 遺傳改版遷移）。

## 4. 遺傳規則（現行；14l 起照第 20 節，詳見 20.0）

> 特殊色自第 49 節起顯示為夢幻色
> 一般突變、專屬造型突變已由第 67 節移除（下表「突變」那一列只剩夢幻色、特殊造型）

| 性狀 | 規則 |
| --- | --- |
| 基本造型 | 一對類型因子 `b`（0–2），兩個一樣 → 該類型，否則第 0 種；各作物名稱見第 24.2 節 |
| 特殊造型（1–6） | 正方形、三角形、愛心、星形、月牙形、甜甜圈。兩個一樣才出現（`spExpr`），否則顯示基本造型；沒有強弱排序 |
| 專屬造型（7–13） | 與特殊造型同一組因子，規則相同（14 元寶已停用） |
| 顏色 | 沒有強弱排序。基本色 6：白、綠、黃、紅、紫、黑；特殊色 8：銀、珍珠白、藍、金、黑曜、水晶、星空、彩虹 |
| 果皮顏色 | `colKey`：兩個一樣 → 純色；兩種基本色 → 15 種混色（`MIX15`）；特殊＋基本 → 淡特殊色 `l-x`；兩種特殊色 → 雙色 `d-a-b`。共 65 種（`ALL_SKINS`） |
| 花紋 | `pw` 兩個都是 1 才有；花紋顏色同果皮規則；形式 4 種，兩個不同就兩種一起畫；與果皮同色時畫成稍深／稍淺 |
| 大小、完美度 | 各 10 組加性因子，取平均。**只顯示等級**（迷你／小／中／大／巨大；奇異造型／歪斜／良好／完美），不影響稀有度與品種權，只影響賣價與紀錄榜 |
| 突變（每顆種子，`mutRound`） | 特殊色 0.2%、特殊造型 0.05%、一般 0.1%（基本色、基本造型、大小完美度）；誘變劑 `mutateX` 為 25 倍且不蓋掉專屬造型 |

外觀穩定度 `ph.stab`：這株自交後保留同外觀的機率。外觀鍵值 `appKey`（14l）：`b{0-2}` 或 `p{1-13}` ＋ `|果皮|花紋顏色/形式`（兩種形式寫成 `f+f2`）。舊的大寫鍵值用 `keyV3()` 對照成新鍵值。

---

## 11. 設計原則（討論後的共識）

1. **核心樂趣**：用真實的遺傳規則，做出別人還沒做出來的外觀，讓名字留在圖鑑上。所有設計應讓玩家把時間花在「想做出什麼、怎麼配」，而不是澆水、命名、整理。
2. **把遺傳藏起來**：參考《動物森友會》（寫實遺傳但完全不顯示），玩家只需要知道「這包種子種下去會長什麼」。預覽必須準確。
3. **每個育種目標只留一包**：同外觀只從穩定度最高的那株取種（系譜法選拔的概念）。
4. **整齊不等於穩定**：F1 整齊一致，但自交後會分離，介面要分清楚。
5. **母本資訊不要讓人誤會是這包種子的性質**（F1 曾被誤顯示為「完全穩定」）。
6. 大小、完美度留給想挑戰紀錄的進階玩家（類似寶可夢個體值），一般玩家可忽略。
7. 新增地點必須有功能，不能只是裝飾；測試人數少，空蕩的場所會更冷清。

## 12. 已確定不做

花粉保存、F1 雜種優勢、玩家分工（探索者／育種家／農夫）、品評會、種子袋「整理建議」、混合不同植株的種子成同一包。

---

## 程式地圖（從第 9 節濃縮；細節見 `docs/規格存檔.md` 第 9 節同名小節）

`index.html` 只能有一個 `<script>` 區塊（工具都用「`</style>` 之後第一個 `<script>` 到最後一個 `</script>`」取程式）。程式裡大部分新功能都包在 `/* ===== 節號（BUILD）：名稱 ===== */` 這種註解區塊裡，用節號或 BUILD 搜尋就找得到。

**存檔與載入**
- 存檔：`packState`／`unpack`（`gReplacer`／`gReviver`，基因型自動編碼成 `K:`）、`save()`（重要變動立刻存）、`saveLite()`／`liteRun`（輕量：本機 5 秒、雲端 60 秒）、`saveNow()`、`flush()`。上限 1 MB（`byteLen`）。
- 遷移：`migrate(o)`（旗標 `shapeV`、`cleanV`、`tutV`、`resV`、`specV`、`geneV`、`exV`、`farmV`、`lvV`、`rv98`…，`newGame()` 同步）；`geneMigrate`、`exMigrate`、`lvMigrate`、`recover98`。
- 讀取：`bootLoad`→`bootStart`、`loadSave`、`saveSanitize`（壞資料略過）、`backupSaveStrict`、`repairState`、`isGeno`；載入畫面 `#boot`（`bootHide`）；版本檢查 `verCheck`（`version.json`）、`checkBuild`。

**遺傳與外觀**（「v0.5 遺傳引擎」區塊）
- 基因型 v3：`genc3`／`gdec3`、`gFlat`／`gUnflat`、`gamete`／`fuse`、`isGeno`、`fixGeno`、`geno3`（新增欄位要同步改這四處）。
- `phen(g,crop)`（外觀、`stab` 穩定度、`ab.size`）、`appParts`／`appKey`、`colKey`／`cnOf`／`MIX15`／`ALL_SKINS`、`spExpr`、`offspringDist`／`lotDist`（預覽，精確計算）。
- 突變：`mutRound`（`MUT_P`）、`mutateX`（`MUTX`）、`takeSeeds`（取種、`mseeds` 突變種子、跨界彩蛋 `crossPollen`／`P_CROSS_EX`）、`muOf`／`muReveal`／`mu96*`。
- 稀有度：`rarityScore`／`rarityOf`（`TIER_MIN`）、`rarityHint`、徽章 `rbHTML`／`rbT`／`rbE`、名品 `MEIHIN`／`mhOf`、專屬造型 `EX_OF`／`exRoll`／`EX_P`。
- 果實畫法：`fruitSVG`／`fruitInner`→`fruitImgSVG`（素模 `fruitBase`／`fruitPrep`／`fruitPaint`、快取 `FRUIT_CACHE`、`FRUIT_VER`）；夢幻色 `dreamPx`、光層 `dreamLightSVG`／`dreamLightHTML`、`DREAM_PERIOD`；造型特效 `tfxWrap`。
- 植株：`plantSVG`、`plantImg`／`plantImgSVG`（`assets/crops/`）、`plantFruitsSVG`（`FRUIT_AT`、`PLANT_H`）。

**農場**
- 畫面：`renderWorld`→`farmWorld`（內容沒變不重建，`L._fk`）、`plotSVG`（田地圖 `soilReady`、授粉倒數圈）、`decorSVG`（`DECO_IMG`／`DECO_NEW`、斜向圍籬 `isoSVG`／`ISO_META`）。`WORLD.farm` 2200×2200。
- 操作：綠色按鈕 `#ringBtn`（點＝`openTray`；長按圓盤 `openRing`／`RING`）、多選與模式 `openPick`（收成、自交、雜交 `crossCommit`）、加速 `openAccel`、剷除 `openShovel`、開墾 `openBuild`（`buildAt`、`dragPlot`）、裝飾模式 `openDecor`（`decoPaintAt`、`decoTake`、`state.decoStore`）、`exitAllModes`。
- 育苗盤：`trayObj`、`traySow`、`trayHTML`／`trayAction`（分區、目標、穩定度 `trayStab`）、移植 `openSow(null,true)`。收成總表 `openHarvest`／`harvestHTML`／`harvestAction`、`harvestFly`。授粉 `polCard`、`pollinate`、預約 `rsvTick`。
- 種子袋：`renderBag`／`bagGridHTML`／`slotCell`、`lotCat`、`bagCap`、`LOT_MAX`、`lotNew`（「新」）、`sellOldGo`；種原庫 `zipLot`、`vault`。

**探索（各地區固定地圖）**
- 資料：`SNOW_MAPS`、`GRASS_MAPS`、`FOREST_MAPS`、`DESERT_MAPS`、`MARSH_MAPS`、`SAKURA_MAPS`（`*_ART`／`*_IMG`／`*_FLAT`／`*_SWAY`）→ `REGION_MAPS`、`REGION_CFG`、`REG_V2`。
- 準備與畫：`regPrep`→`regPrepV2`（產生 `M._raw` 物件清單、`M._objs`、`M.blk`／`M.wlk` 碰撞、`M._P` 小路、`M._LG` 湖、`M._RV` 河、`M._T` 階地、`M._BR` 橋）、`regGroundSVG`／`regGroundEl`（地面轉 PNG，`REG_GLRU`）、`regWaterHTML`、`regTerraceHTML`、`regDynHTML`、`regTopV2`、`regWorld`、`regCam`。
- 移動與事件：`regBlocked`、`regMove`、`regExitAt`、`regGo`、`regEnter`、`regArrival`、`regPlants`（`wpGeno`、`makeWild`、`wpDepth`）、`regItems`、`regFxStep`（機關）、`secEnter`（秘境）、`regStandTick`、`mapLv`／`gateStop`（等級）、地圖面板 `renderRegMap`。
- 怪物（105）：`MON_DEF`／`MON_IMG`／`MON_MAP`、`monEnter`、`monLoop`、`monHit`、`monKill`、`monDrop`、`monSwing`、`monReach`／`monSpotFar`；圖層 `#monBack`／`#monFront`／`#monSw`。
- 發光的植株 `roam*`（`ROAM_PTS`）、謎語 NPC `RIDDLE`／`rdHere`、櫻花花季 `sakuraBloom`。
- **3D 畫面（108）**：`js/w3d.js`（`w3dEnter`、`w3dLeave`、`w3dSetPlayer`／`Others`／`Monsters`／`Plants`、`w3dPick`、`w3dView`）＋`lib/three.min.js`，用到才載入；地形 `buildHeight`（高台 `PLAT`、緩坡 `RAMP_L`、水往下挖 `waterDist`）、水 `buildWater`（深度圖＋湖面＋河帶）、橋 `buildBridges`／`gY`、景物 `wellMesh`／`archMesh`／`mushRing`；index.html 的「108（17x）」區塊：`W3D_MAPS`（目前草原 5 張）、`w3dSync`、`w3dLoad`、`W3D_HOST`（`pump`、`tap`）、`w3dBtn`。

**城鎮、任務、角色**
- 城鎮：`TOWN_MAPS.plaza`、`TOWN_BLD`、`TOWN_NPC`（圖片 `npcReady`）、`marketWorld`、`townMove`、`openTown`／`townSheetHTML`／`townAction`、攤位 `stallHTML`、標本交易 `spBuy`。
- 等級與任務（15y）：`addXp`、`levelUp`、`LV_CROP`／`LV_REG`、主線 `MQ`／`mqEv`、委託 `commGen`／`ensureComm`、每週 `wkTxt`／`wkFits`、NPC 故事 `NS`／`nsAccept`、種子庫館藏 `vdHTML`、主題榜 `wkTheme`／`wkSettle`。
- 標本與精靈：`claimSpec`、`rightsTx`、`specUse`、收藏櫃 `cabListHTML`；精靈 `fyWake`／`fyEvolve`、`fySpringHTML`、跟隨 `fyLoop`、演出 `fyShow`。
- 角色：`avatarSVG`→`avV3SVG`（`av3.js`、`av3_heads.js`、衣服 `avOutfitParts`）、`avNorm`／`avPack`、打扮頁 `avatarEditorHTML`、衣櫃 `WARD`／`wardCheck`；`renderChars`、`updateMe`、`charG`、`poseFor`、`walkLoop`、`walkTo`。
- 個人介面 `openMe`／`meSheetHTML`、通知 `noteOpen`、慶祝卡 `celShow`、提示 `toast`、「？」小說明 `qh`。

**效能、模式、其他**
- 遊玩模式 `isTestMode`（`sw_mode`）、測試工具在設定頁 `renderSpeed`。
- 省電與閒置（104）：`ecoOn`、`frameCap`、`idleSet`、`body.paused`／`body.idle`／`body.eco`；`?perf=1` 面板 `PF`。
- 動畫相位 `animSync`；音效 `sfx`；錯誤紀錄 `crumb`、`sw_err`；PWA `manifest.json`。
- 多人：Realtime Database `presence/<場景>`（`joinFarm`、`pushPos`）、`status/<uid>`（`statusOn`）；Firestore 集合見第 2 節。規則全文在 `tools/firestore_rules_*.txt`。
- 測試：第 15 節的語法檢查與 vm 範本；各地區地圖檢查 `node tools/check_maps.js <地區>`、總覽頁 `node tools/build_region_page.js <地區>`。

---

## 節號索引表

狀態：保留（就在這個檔案）、已完成、未做、未定案、紀錄（不是待做的事，只是紀錄）。

| 節 | 名稱 | 狀態 | 檔案；備註 |
| --- | --- | --- | --- |
| 0 | 接手者必讀 | 保留 | CLAUDE.md |
| 1 | 專案概況 | 保留 | CLAUDE.md |
| 2 | 技術架構 | 保留 | CLAUDE.md |
| 3 | 資料模型 | 保留 | CLAUDE.md |
| 4 | 遺傳規則 | 保留 | CLAUDE.md |
| 5 | 稀有度與數值 | 已完成 | docs/規格存檔.md；已由第 28 節取代 |
| 6 | 作物與造型 | 已完成 | docs/規格存檔.md；部分由 24、73 節更新 |
| 7 | 探索與地區 | 已完成 | docs/規格存檔.md |
| 8 | 遠緣雜交與品種登錄 | 已完成 | docs/規格存檔.md |
| 9 | 主要系統 | 紀錄 | docs/規格存檔.md；各版本的實作紀錄（程式地圖濃縮在 CLAUDE.md） |
| 10 | 版本歷程 | 紀錄 | docs/規格存檔.md；各 BUILD 改了什麼 |
| 11 | 設計原則 | 保留 | CLAUDE.md |
| 12 | 已確定不做 | 保留 | CLAUDE.md |
| 13 | 下一批待改 | 已完成 | docs/規格存檔.md；14h、14z |
| 14 | 後續規劃 | 未定案 | docs/待實作/第14節.md；第五、六版規劃（多已由 28–33 取代）；「延後評估」4 項未定案 |
| 15 | 測試方法 | 保留 | CLAUDE.md |
| 16 | 與使用者溝通的習慣 | 保留 | CLAUDE.md |
| 17 | 2026-11-14 設計討論紀錄 | 紀錄 | docs/規格存檔.md；討論紀錄；多數已由後續各節取代 |
| 18 | 畫風規範 | 紀錄 | docs/規格存檔.md；畫風規範（做素材時查） |
| 19 | 標本機制與服裝 | 未定案 | docs/待實作/第19節.md；19.0 已做（14i）；19.3／19.4 布料、服裝、製作費用、正式名額還要討論 |
| 20 | 外觀遺傳規則改版 | 已完成 | docs/規格存檔.md |
| 21 | 作物植株與果實重畫 | 已完成 | docs/規格存檔.md；由第 26 節取代 |
| 22 | 人物重畫 | 已完成 | docs/規格存檔.md |
| 23 | 待辦總表 | 紀錄 | docs/規格存檔.md；舊的待辦總表，已由本索引表取代 |
| 24 | 作物精簡與果實素模 | 已完成 | docs/規格存檔.md；24.4 由第 26 節取代 |
| 25 | 人物換裝選項擴充 | 已完成 | docs/規格存檔.md |
| 26 | 作物植株與果實素模上線 | 已完成 | docs/規格存檔.md |
| 27 | 新地區地圖：草原、森林、沙漠、濕地 | 已完成 | docs/規格存檔.md |
| 28 | 稀有度計分制、標本規則修正、育種家等級 | 已完成 | docs/規格存檔.md |
| 29 | 主線任務 | 已完成 | docs/規格存檔.md |
| 30 | NPC 委託 | 已完成 | docs/規格存檔.md |
| 31 | 農地維持自由鋪設 | 已完成 | docs/規格存檔.md |
| 32 | 城鎮 | 已完成 | docs/規格存檔.md |
| 33 | 秘境 | 已完成 | docs/規格存檔.md |
| 34 | 專屬造型與神話的稀有感特效 | 已完成 | docs/規格存檔.md |
| 35 | 人物新畫法擴充：所有造型都用新畫法 | 已完成 | docs/規格存檔.md；35.4 部分帽子、配件等素材 |
| 36 | 2026-11-15 補充決定與待辦管理 | 已完成 | docs/規格存檔.md |
| 37 | 2026-11-15 試玩回報修正 | 已完成 | docs/規格存檔.md |
| 38 | 水面、台地、方向性、種子袋整理、紀錄榜 | 已完成 | docs/規格存檔.md；38.4 圍籬由第 68 節處理 |
| 39 | 圓盤選單調整：開墾、剷除 | 已完成 | docs/規格存檔.md |
| 40 | NPC 服裝、重複資訊清理、農場改成正方形 | 已完成 | docs/規格存檔.md；40.1 由第 74 節取代 |
| 41 | 個人介面 | 已完成 | docs/規格存檔.md |
| 42 | 主線之後：種子庫館藏、NPC 個人故事 | 已完成 | docs/規格存檔.md |
| 43 | 待定事項定案 | 已完成 | docs/規格存檔.md |
| 44 | 預約雜交與拖曳授粉 | 已完成 | docs/規格存檔.md |
| 45 | 選單與動作圖示 | 已完成 | docs/規格存檔.md |
| 46 | 裝飾模式的操作改成和開墾一樣 | 已完成 | docs/規格存檔.md |
| 47 | 突變揭曉、新種子標示 | 已完成 | docs/規格存檔.md |
| 48 | 特殊色的動態質感 | 已完成 | docs/規格存檔.md |
| 49 | 改名：特殊色 → 夢幻色；藍 → 水藍 | 已完成 | docs/規格存檔.md |
| 50 | 遺傳說明頁重寫 | 已完成 | docs/規格存檔.md |
| 51 | 探索地圖：美化、機關、秘境修訂 | 已完成 | docs/規格存檔.md |
| 52 | 高低差的畫法：階地 | 已完成 | docs/規格存檔.md |
| 53 | 探索地圖重新擺設 | 已完成 | docs/規格存檔.md |
| 54 | 連接與地形的合理性 | 已完成 | docs/規格存檔.md |
| 55 | 秘境地標與水面紋理素材、水的流動 | 已完成 | docs/規格存檔.md |
| 56 | 環境小動畫 | 已完成 | docs/規格存檔.md |
| 57 | 夢幻色八種的畫法 | 已完成 | docs/規格存檔.md |
| 58 | 遊玩模式：一般／測試 | 已完成 | docs/規格存檔.md |
| 59 | 茄科果實的辨識度 | 已完成 | docs/規格存檔.md；番茄細萼片要等使用者看 iPhone |
| 60 | 專屬造型：個人運氣、極低機率、全服公告 | 已完成 | docs/規格存檔.md |
| 61 | 主線交付與第 11 章獎勵 | 已完成 | docs/規格存檔.md |
| 62 | 好友上線狀態 | 已完成 | docs/規格存檔.md；Realtime Database 要加 status 規則 |
| 63 | 會動的物件靠近時跳回開頭 | 已完成 | docs/規格存檔.md |
| 64 | 地圖場勘修正 | 已完成 | docs/規格存檔.md |
| 65 | 遺傳說明頁加入「基因」「等位基因」 | 已完成 | docs/規格存檔.md |
| 66 | 秘境的謎語 NPC | 已完成 | docs/規格存檔.md；16p 已做 |
| 67 | 拿掉一般突變與專屬造型突變 | 已完成 | docs/規格存檔.md |
| 68 | 農場圍籬改成斜向，可以把田圍起來 | 已完成 | docs/規格存檔.md |
| 69 | 採集、素材 | 未定案 | 還沒有規格檔（第 91.5 節會用到） |
| 70 | （沒有這一節） | — | — |
| 71 | 稱號閃爍、載入畫面、朋友卡在讀取 | 已完成 | docs/規格存檔.md |
| 72 | 遺傳說明頁：圖多字少、夢幻色動態 | 已完成 | docs/規格存檔.md |
| 73 | 專屬造型換新：火山、球棒、炸彈、萬聖節南瓜 | 已完成 | docs/規格存檔.md；73.4 萬聖節活動未定案（在規格存檔） |
| 74 | NPC 外觀重新設計 | 已完成 | docs/規格存檔.md |
| 75 | （沒有這一節） | — | — |
| 76 | 地面上莫名的圓形色塊 | 已完成 | docs/規格存檔.md |
| 77 | 法老王棺材放上長方形石台 | 已完成 | docs/規格存檔.md |
| 78 | 沙漠：黃金沙地＋流沙 | 已完成 | docs/規格存檔.md |
| 79 | 水邊輪廓自然化 | 已完成 | docs/規格存檔.md |
| 80 | 夢幻色動態：預覽也要動、更明顯、稍快 | 已完成 | docs/規格存檔.md |
| 81 | 夢幻色動態改成連續流動 | 已完成 | docs/規格存檔.md |
| 82 | 櫻花區 | 已完成 | docs/規格存檔.md；82.6 秘境、謎語 NPC、抽籤繪馬未定案（在規格存檔） |
| 83 | 遠緣雜交不帶專屬造型 | 已完成 | docs/規格存檔.md |
| 84 | 遺傳說明頁：先講「兩份」再講混色，卡片照重要性重排 | 已完成 | docs/規格存檔.md |
| 85 | 果實上色原則：除了蒂頭，整顆都由顏色基因決定 | 已完成 | docs/規格存檔.md |
| 86 | 新畫法人物可以換各種衣服：先用程式試做 | 已完成 | docs/規格存檔.md；門檻是暫定值 |
| 87 | 夢幻色不混色：一半一半 | 已完成 | docs/規格存檔.md |
| 88 | 授粉倒數圈；雜交改成「先標記、確認後才授粉」、可以多個父本 | 已完成 | docs/規格存檔.md |
| 89 | 洞穴內部擺設 | 已完成 | docs/規格存檔.md |
| 90 | 名品：特殊造型＋完整夢幻色的組合名稱 | 已完成 | docs/規格存檔.md；數值暫定 |
| 91 | 全服稀有植株「發光的植株」 | 已完成 | docs/規格存檔.md；91.5 等第 69 節；規則要貼 Firebase |
| 92 | 謎語 NPC 台詞修正 | 已完成 | docs/規格存檔.md |
| 93 | 花精靈：傳說喚醒、神話進化 | 已完成 | docs/規格存檔.md；基本型素材還沒有（FAIRY_BASE_READY） |
| 94 | 介面文字精簡 | 已完成 | docs/規格存檔.md |
| 95 | 精靈改版：標本是一次性通行證 | 已完成 | docs/規格存檔.md；規則要貼 Firebase |
| 96 | 突變通知改版 | 已完成 | docs/規格存檔.md |
| 97 | 精靈的動態、喚醒與進化特效 | 已完成 | docs/規格存檔.md |
| 98 | 存檔修復誤刪櫻花區種子、探索地圖面板被切掉 | 已完成 | docs/規格存檔.md；救回要 backups 讀取規則 |
| 99 | 試玩回報：重複入口、閃退、數字字型、佈置拖曳、打扮轉向 | 已完成 | docs/規格存檔.md |
| 100 | 加入主畫面 | 已完成 | docs/規格存檔.md |
| 101 | 育苗盤改版：分區、目標、穩定度、和種子袋統一 | 已完成 | docs/規格存檔.md |
| 102 | 害蟲（草稿） | 已取消 | 由第 105 節取代，沒有搬進來 |
| 103 | 稀有度徽章：和特徵標籤分開、放到顯眼的地方 | 已完成 | docs/規格存檔.md |
| 104 | 手機發熱：量測與省電 | 已完成 | docs/規格存檔.md；104.2 第 6 點已取消（第 108 節） |
| 105 | 野外怪物：第一階段 | 已完成 | docs/規格存檔.md；掉落是測試值 |
| 106 | 整體順暢度優化 | 已完成 | docs/規格存檔.md |
| 107 | （沒有這一節） | — | — |
| 108 | 立體化改版 | 未做 | docs/待實作/第108節.md；草原 5 張已做（17x、17y，見規格存檔 9.104、9.105）；其他地區、農場、城鎮還沒做 |
