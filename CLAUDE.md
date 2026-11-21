# 《種子的世界》專案說明（CLAUDE.md）

> 程式：`index.html`（`BUILD = '2026-11-19s'`）。**程式碼才是唯一的事實來源**，和文件衝突時以程式為準。
> 2026-11-18 起 CLAUDE.md 只放接手需要的東西。已完成各節的原文、第 9 節（各系統的實作紀錄）、第 10 節（版本歷程）、第 17 節都在 `docs/規格存檔.md`；還沒做或還沒定案的節，每節一個檔案在 `docs/待實作/`。哪一節在哪裡看最下面的「節號索引表」。
> 下一版 BUILD 是 `2026-11-19t`。第 141 節（19g）、第 142 節（19h）、第 143 節（19i）、第 144 節（19j）、第 145 節（19k）、第 144 節修正（19l、19m）、第 147、148 節（19m）、第 149 節（19n）、第 150 節（19o，19p 修 iPhone 地面圖）、第 151～154 節（19q）、第 155 節（19r）、第 156 節（19s）已做；第 146 節（色塊圖工具）已做。第 138 節（19c）、第 135 節第二階段（19d）、第 139 節的地圖部分（19e）、第 140 節（19f）已做。第 111～134、137 節（18c～19a）已做，第 135 節第一階段（19b）已做（**Realtime Database 要加 `tools/rtdb_rules_135_fight.txt` 那一段**）；探險家大衣還沒有圖，`state.coatDue` 記著要補發，都還沒在 iPhone 實測；主控台的 Firestore 規則已經包含第 117 節；**要貼的是 `tools/firestore_rules_console_114.txt`（整份取代，加了 `fairyFirst`，第 114 節的「全服第一個」公告才寫得進去）**；第 114 節神化改 2,000（114.10，程式在第 134.5 節改）。接下來：134 → 133 → 131；135 等 131 做完；136 跟晶霜雪原那一章。另外進行中：第 108 節（3D 畫面），草原 5 張已做（17x、17y），第 109 節的修正已做（17z），都還沒在 iPhone 實測；接下來是第 108.0 的第 2 階段（其他地區，每區一節）。

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
11. **每一節做完都要跑 `node tools/tload.js`**（帶異質基因的種子包和植株，載入 → 存檔 → 再載入，基因、數量不變；也檢查沒有同名的 function）。**新函式取名前先全文搜尋有沒有同名的**（18f 的 `fixGeno` 同名把讀檔修補蓋掉，見規格存檔 9.120）。（第 128 節）

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
- Firestore 安全規則在 Firebase 主控台。主控台上目前完整的一份是 `tools/firestore_rules_console_117.txt`（使用者 2026-11-21 提供）；**之後要改規則，一律以最新的這份為底，產出完整的一份新檔案**（例 `tools/firestore_rules_console_<節>.txt`），不要只給片段。舊的 `firestore_rules_91／93／95／98／117.txt` 是片段，只當紀錄。
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
- 每日備份與還原（128）：`bkDaily`（`bootLoad` 讀到原始存檔、`migrate` 之前）、`bkWrite`／`bkRead`（`backups/<uid>_day<0-6>`、分段 `stamp`、`BK_CH`）、失敗計數 `sw_bkf_<uid>`、設定頁 `bkBox`／`renderBk`、還原 `openBk`／`bkHTML`／`bkAction`／`bkSum`／`bkRestore`（`_prerestore`）。
- 存檔：`packState`／`unpack`（`gReplacer`／`gReviver`，基因型自動編碼成 `K:`）、`save()`（重要變動立刻存）、`saveLite()`／`liteRun`（輕量：本機 5 秒、雲端 60 秒）、`saveNow()`、`flush()`。上限 1 MB（`byteLen`）。
- 遷移：`migrate(o)`（旗標 `shapeV`、`cleanV`、`tutV`、`resV`、`specV`、`geneV`、`exV`、`farmV`、`lvV`、`rv98`…，`newGame()` 同步）；`geneMigrate`、`exMigrate`、`lvMigrate`、`recover98`。
- 讀取：`bootLoad`→`bootStart`、`loadSave`、`saveSanitize`（壞資料略過）、`backupSaveStrict`、`repairState`、`isGeno`；載入畫面 `#boot`（`bootHide`）；版本檢查 `verCheck`（`version.json`）、`checkBuild`。

**遺傳與外觀**（「v0.5 遺傳引擎」區塊）
- 基因型 v3：`genc3`／`gdec3`、`gFlat`／`gUnflat`、`gamete`／`fuse`、`isGeno`、`fixGeno`、`geno3`（新增欄位要同步改這四處）。
- `phen(g,crop)`（外觀、`stab` 穩定度、`ab.size`）、`appParts`／`appKey`、`colKey`／`cnOf`／`MIX15`／`ALL_SKINS`、`spExpr`、`offspringDist`／`lotDist`（預覽，精確計算）。
- 花紋（123）：`patOf`（形式、顏色怎麼顯示）、`PF_OK`、`patN`（文字）、`keyV4`（舊鍵值換算）、`pNormG`（基因整理）、`patTone`／`patToneRGB`（一般花紋自動配色）；遷移 `m123`（旗標 `patV`）；定型的函式是 `fixToGeno`（讀檔修補才是 `fixGeno`，不要再同名）。
- 中間色顯示（111.4）：`cnOf` 對中間色回「A＋B」（`MIX_ORD` 照 `BASIC` 排）、`cnSe` 不加「色」。
- 突變：`mutRound`（`MUT_P`）、`mutateX`（`MUTX`）、`takeSeeds`（取種、`mseeds` 突變種子、跨界彩蛋 `crossPollen`／`P_CROSS_EX`）、`muOf`／`muReveal`／`mu96*`。
- 稀有度（124 起）：等級 `rarityTier`（最稀有的一項）、原因 `rarityWhy`→`rarityHint`、排序 `rarityRank`；`rarityScore`／`TIER_MIN`／`tierOfScore` 只剩排序與對照；`rarityOf`、徽章 `rbHTML`／`rbT`／`rbE`、名品 `MEIHIN`／`mhOf`、專屬造型 `EX_OF`／`exRoll`／`EX_P`。
- 果實畫法：`fruitSVG`／`fruitInner`→`fruitImgSVG`（素模 `fruitBase`／`fruitPrep`／`fruitPaint`、快取 `FRUIT_CACHE`、`FRUIT_VER`）；夢幻色 `dreamPx`、光層 `dreamLightSVG`／`dreamLightHTML`、`DREAM_PERIOD`；造型特效 `tfxWrap`。
- 植株：`plantSVG`、`plantImg`／`plantImgSVG`（`assets/crops/`）、`plantFruitsSVG`（`FRUIT_AT`、`PLANT_H`）。

**農場**
- 畫面：`renderWorld`→`farmWorld`（內容沒變不重建，`L._fk`）、`plotSVG`（田地圖 `soilReady`、授粉倒數圈）、`decorSVG`（`DECO_IMG`／`DECO_NEW`、斜向圍籬 `isoSVG`／`ISO_META`）。`WORLD.farm` 2200×2200。
- 生長時間（111）：`GROW_SEED_MIN`／`GROW_FRUIT_MIN`→`stageDur`、加速劑 `ACC_MIN`→`useAccel`、舊植株換算 `m111`（旗標 `growV`）；`ACC_PACK`、`NPC_BUY`。
- 操作：綠色按鈕 `#ringBtn`（點＝`openTray`；長按圓盤 `openRing`／`RING`）、多選與模式 `openPick`（收成、自交、雜交 `crossCommit`）、加速 `openAccel`、剷除 `openShovel`、開墾 `openBuild`（`buildAt`、`dragPlot`）、裝飾模式 `openDecor`（`decoPaintAt`、`decoTake`、`state.decoStore`）、`exitAllModes`。
- 收成與果實袋（112）：`harvestPlant`（`FRUIT_N`、`SEED_N`、`takeSeeds`、`afterHarvest` 只清田）、`fruitAdd`／`fruitFit`／`fruitPrice`（`SIZE_REP`）、`state.fruits`（`FRUIT_SLOTS`、`FRUIT_MAX`）、種子袋「果實」分頁 `fruitBagHTML`、`openFruit`／`fruitHTML`／`fruitAction`；遷移 `m112`（旗標 `hvV`）。
- 育苗盤：`TRAY_LV`／`trayOn()`（111.5，未開放時綠色按鈕是「種植」）、`trayObj`、`traySow`、`trayHTML`／`trayAction`（分區、目標、穩定度 `trayStab`）、移植 `openSow(null,true)`。收成總表 `openHarvest`／`harvestHTML`／`harvestAction`、`harvestFly`。授粉 `polCard`、`pollinate`、預約 `rsvTick`。
- 種子袋：還會變的種子畫布袋 `seedBagSVG`（127）；`renderBag`／`bagGridHTML`／`slotCell`、`lotCat`、`bagCap`、`LOT_MAX`、`lotNew`（「新」）、`sellOldGo`；種原庫 `zipLot`、`vault`。

**探索（各地區固定地圖）**
- 地區名（111.3）：`BIOMES[k].n`／`REGION_CFG[k].name`，舊名在 `BIOMES[k].on`；種子包血統顯示用 `srcName()`，`lotWild` 新舊名都認。
- 資料：`SNOW_MAPS`、`GRASS_MAPS`、`FOREST_MAPS`、`DESERT_MAPS`、`MARSH_MAPS`、`SAKURA_MAPS`（`*_ART`／`*_IMG`／`*_FLAT`／`*_SWAY`）→ `REGION_MAPS`、`REGION_CFG`、`REG_V2`。
- 準備與畫：`regPrep`→`regPrepV2`（產生 `M._raw` 物件清單、`M._objs`、`M.blk`／`M.wlk` 碰撞、`M._P` 小路、`M._LG` 湖、`M._RV` 河、`M._T` 階地、`M._BR` 橋）、`regGroundSVG`／`regGroundEl`（地面轉 PNG，`REG_GLRU`）、`regWaterHTML`、`regTerraceHTML`、`regDynHTML`、`regTopV2`、`regWorld`、`regCam`。
- 移動與事件：`regBlocked`、`regMove`、`regExitAt`、`regGo`、`regEnter`、`regArrival`、`regPlants`（`wpGeno`、`makeWild`、`wpDepth`）、`regItems`、`regFxStep`（機關）、`secEnter`（秘境）、`regStandTick`、`mapLv`／`gateStop`（等級）、地圖面板 `renderRegMap`。
- 後六區地圖（139）：`VOLCANO_MAPS`／`CANYON_MAPS`／`RUINS_MAPS`（`borrowArt`、`SRC_IMG`、`*_ART`／`*_IMG`）、`SAKURA_SECRET`（狐火庭）、開放 `REG_OPEN`／`regOpenOk`、調色 `REGION_CFG.tint`→`regSrc`（`RT_CACHE`、`rtDone`、`regTintPreload`）、水色 `M.water`（`LAVA_W`、`SULFUR_W`）、程式畫的 `regX139`（seams／chains／smokes／vents／lstrings／mural／rails…）、峽谷 `night`（暗場用 `cave||night`）、機關 `reg139Step`（噴氣孔、回音 `ECHO_L`）、NPC smith／appr／cguard／granny／pounder／miko／oasisp／miner。
- 畫好的地面（150）：地圖的 `ground` 是圖片路徑才算（`gndImg`；秘境的 `ground` 是顏色）、`gndLoad`（fetch 成 blob、`REG_GND_IM` 留住參考、逾時重試）／`REG_GND_ST`／`gndHref`（在 `regGroundEl`）、接地陰影 `gndShadowSVG`；先做 `RUINS_MAPS.plaza`（`assets/ground/ruins_plaza.jpg`、1100×1100）。
- 遺城重排（143）：`RUINS_ART`（assets/ruins/ 自己的圖）、v2 邊界掛鉤 `REG_V2.<區>.edgeFn`（`ruinsEdge`）、地面 `ruins143`（`road:1` 人行道＋柏油、`zebra`、`pit`、`geo`）、坑洞入口 `pitStep`（`pitTrig`、`body.pitglow`）。
- 素材、製作、定型（115）：`MATS`／`MON_MAT`、`matDrop`（`MAT_P`、`MAT_GOLD_P`）、`matIcon`（`MAT_ICON`）、`state.mats`、種子袋「素材」分頁 `matBagHTML`／`matHTML`；道具行「製作」`RECIPES`、`craftEntries`／`craftPlan`／`craftDo`／`craftHTML`；定型 `fixWhy`／`fixBlock`／`fixGeno`／`fixStart`／`fixTick`（`FIX_MIN`、`FIX_MAX`、`state.fixq`）。
- 主與僕人（135 第一階段）：`SERVANTS`／`LORDS`／`BATK`（招式資料）、`bossRT`、`bossEnter`／`bossLeave`／`bossLoop`→`bossStep`、`bossAI`／`bossFollow`（不是主機）、`bossStrike`／`bossHit`、畫 `bossPaint`（`bossG`、範圍 `bossTel`）、`#bossBar`；掉落 `bossReward`（`state.servantAt`、`state.lordCd`、`state.spirits`／`spiritLine`、`lordSeed`、`lordFirst`）；現身 `lordSummonTick`（`minervaFog`／`MIN_FEATHERS`、`exhShore`／`lordSum.path`／`bossWalkOk`）、初穗 `sheet.hatsuho`（`hatsuhoHTML`／`hatsuhoGo`）、`lordSummon`、出口封住 `regSealed`；同步 `bossNet`、`fight/<地區>`（`lordNetStart`／`lordNetSync`／`lordHeartbeat`／`lordHostCheck`／`lordEnd`／`lordResult`／`lordForfeit`、`lordBusy`）。
- 精魄與神寵（135 第二階段）：精魄是道具 `sp_<地區>`（`SPK`／`isSpK`、`spiritArt`）、孵化 `spiritUse`／`hatchTick`（`state.hatch`、`HATCH_MS`）、神寵 `state.pets`／`state.petOn`（`petsArr`、`petCur`、`petName`、`petSVG` 佔位、`petCharG`／`petMove`、`petXp`、`petEvoNeed`／`petEvoOk`／`petEvolve`、頁面 `sheet.pet` `petHTML`／`petAction`）、卡包 `state.packs`（`packsObj`）、背包道具分頁 `spiritLine`；米涅瓦的巢 `NEST_AT`／`nestObj`／`nestTick`（`state.lordWon`、筆記 `R6`，`x:1` 不算進五件）；旗標 `spV`。
- 主題布置（137）：`THEMES`（相對 `THEME_A`）、`themePrice`、`themeApply`（`decoCollectAll`、`decoPlaceList`）、`themeUndo`（`state.themePrev`）、我的布置 `state.layouts`（`layoutSave`／`layoutApply`／`layoutRename`／`layoutDel`）、面板 `themeBoxHTML`／`themeSVG`、預覽 `sheet.theme`／`themeHTML`、`state.themeUsed`（名片 `th`）、旗標 `themeV`。
- 戰鬥（131）：血量 `PHP_MAX`／`pHP`、`pDamage`／`pDie`／`pRegen`、`#hpBar`（`renderHP`）；怪物 `MON_RHP`／`MON_RDMG`／`SICKLE_DMG`、還手（`aggro`、`MON_WIND`／`MON_ATK_R`／`MON_LEASH`／`MON_GIVEUP`、`.mwind`）、數量 `monCount`（`MON_RT.xs`）；小補血藥 `pot`（`drinkPot`、`#potBtn`、`state.potGift`）；這趟素材 `state.trip`（`tripAdd`／`tripSave`／`tripLose`）；經驗 `monXp`（`MON_XP_ON=false`）。
- 後六區的怪（141）：`MON_DEF` 的 `var`（變種，`monVar`／`MON_VAR_K`）、佔位 `monPhTag`／`monDim`／`MON_PH_C`／`monPhIcon`、被打 `monHit2`（`#monFlash`、`.hit2`）／`monDebris`／`monColor`、素材鍵 `x_<怪物 id>`、`monSrcB`（素材圖示用那一區的資料夾）。
- 第一季怪換新（142）：元素變種（`var`）、`monFill` 會把不在這張圖的舊怪重抽、配方素材替代品 `mcnt`／`mtake`（定型劑 碎石／陶片）。
- 野外戰鬥按鈕（144）：`POT_TYPES`、`potPick`／`potChoose`（`state.potSel`）、快捷格 `#potBtn`（`potSlotPaint`／`potSlotBind`／`potMenu`／`potCdRun`）、自動喝藥 `autoPotCheck`（`state.autoPot`／`autoPotAt`、設定 `renderPotBox`）、頭上血條 `hpHeadG`／`hpHeadPaint`；`wildBar` 只切 `body.wild`（19l 起按鈕不搬，快捷格在背包左邊）。
- 怪物（105）：`MON_DEF`／`MON_IMG`／`MON_MAP`、`monEnter`、`monLoop`、`monHit`、`monKill`、`monDrop`、`monSwing`、`monReach`／`monSpotFar`；圖層 `#monBack`／`#monFront`／`#monSw`。
- 發光的植株 `roam*`（`ROAM_PTS`）、謎語 NPC `RIDDLE`／`rdHere`、櫻花花季 `sakuraBloom`。
- **3D 畫面（108）**：`js/w3d.js`（`w3dEnter`、`w3dLeave`、`w3dSetPlayer`／`Others`／`Monsters`／`Plants`、`w3dPick`、`w3dView`）＋`lib/three.min.js`，用到才載入；地形 `buildHeight`（高台 `PLAT`、緩坡 `RAMP_L`、水往下挖 `waterDist`）、水 `buildWater`（深度圖＋湖面＋河帶）、橋 `buildBridges`／`gY`、景物 `wellMesh`／`archMesh`／`mushRing`、夢幻色光 `glowFor`、精靈 `w3dSetFairies`、樹冠透視 `holes`（`uHole`）、角色影格 `w3dPreload`；index.html 的「108（17x）」區塊：`W3D_MAPS`（目前草原 5 張）、`w3dSync`、`w3dLoad`、`W3D_HOST`（`pump`、`tap`）、`w3dBtn`。

**城鎮、任務、角色**
- 任務指引與提醒（133）：`qList`（七種任務統一，st acc／run／wait／done）、`giveReady`／`giveProg`、`altItemReady`／`altListReady`、`qNpcWhere`；記號 `qMarkSVG`／`qMarkFor`／`qChip`；追蹤 `state.qTrack`／`qTracked`、那一行 `qLineText`（`renderMqLine`）；帶路 `qGo`、`qArrow`（`qArrowExplore`、`regNextExit`、`exitPos`、`qArrowCheck`）、`qGoHTML`、說明 `qDetailHTML`；面板 `qPanelHTML`；提醒 `qScan`／`qNotify`（`state.qSeen`／`qAcc`／`qWait`／`qLoginDay`／`qExpDay`、開關 `state.qRemind`）；`openOrders`。
- 秘境帶路（134）：地區故事第 4 步 `enter`（`rsEnter`，在 `regEnter` 裡）、`rsReady`、`RS_DONE3`（130 的「完成」看第 3 步）、舊玩家 `paid`（旗標 `rs134V`）、傳說卡 `state.legSeen`／`RS_LEG`；種子台座拿掉（`EX_P` 只剩 deep），仙境花園 `cutRing`（`regGroundSVG`）；`GOD_NEED=2000`。
- 筆記頁（130）：`state.notes`／`state.noteNew`、`noteGet`（`NOTE_XP`）、`noteDot`；傳說 `NOTE_LEG`、`noteTalk`；遺物 `NOTE_REL`、`NOTE_SPOTS`、`noteTick`（在 `tick` 裡和 `rsTick` 一起跑）、`relCardHTML`；頁面 `noteHTML`。
- 互助（132）：`HELP_MIN`／`HELP_COIN`／`HELP_XP`／`HELP_DAYS`、`helpDo`（`state.helped`）、`helpApply`（`state.helpGot`）、`helpedToday`、圖示列 `ibHelp`；私訊 kind `help`；經驗上限 `XP_CAP.f`。
- 朋友名單（129）：`state.friends`（`myFr`，同步到 profiles 的 `fr`）、`isFriendU`（兩邊都有）、`frStatus`／`frInvite`／`frRespond`／`frDelete`／`frSync`、代碼 `frCode`、`FRIEND_MAX`、`FR_DAYS`；私訊 kind `frinv`／`frok`／`frno`（`frMsg`，欄位 `t`）；朋友頁分頁 `socTab`、名片按鈕 `frBtnHTML`。
- 偷菜（125）：`STEAL_HR`／`STEAL_P`／`STEAL_N`、`isFriendU`、`ripeAtOf`（植株成熟時間 `p.rt`）、`stealRipe`、`stealInfo`／`stealDo`／`stealBoxHTML`（朋友植株資訊頁 `fplotHTML`）、`state.stole`、`state.stealSeen`；手套 `RECIPES` 的 glove、`state.items.glove`。
- 委託交果實、果實市集（117）：`giveSpec`／`giveAvail`／`giveDo`／`giveHTML`（`sheet.give`）、`cmNorm`；果實袋 `b`（買來的）；果實上架 `fruitListHTML`／`fruitListSave`、`fruitCardHTML`、`fruitBuy`、`fruitCollect`（`state.fcol`）、`fruitCancel`、`fruitAddQ`。
- 城鎮：`TOWN_MAPS.plaza`、`TOWN_BLD`、`TOWN_NPC`（圖片 `npcReady`）、`marketWorld`、`townMove`、`openTown`／`townSheetHTML`／`townAction`、攤位 `stallHTML`、標本交易 `spBuy`。
- 第三章（122）：`MQ2` 的 3-1～3-7、`CLUES`／`DOCK`／`HIDE`／`MARK_SVG`、`marshObjs`／`mq2MarshTick`、所長 `wienAway`、蜜露跑掉 `state.fyRun`（`fyRunning`）；`altNeed`（每一項的顆數）、`ALT_LIST.melon`。
- 第二章（121）：`MQ2` 的 2-1～2-6、同一步兩件事 `subs`（`mq2SF`、`mq2SubDone`）、`mq2Talk`、`mq2GiveFin`；`ALT_LIST.pumpkin`（`altQ`、`altDark`、`state.altLit`）；`exGift`（九位通用的專屬造型種子）；野外 NPC `REG_NPCS`／`regNpcObjs`／`regNpcTap`／`rnpcHTML`、白南瓜路標 `lampPos`、`mq2KidTick`。
- 新主線（116）：`MQ2`（序章、第一章）、`state.mq2`、`mq2Accept`／`mq2Tick`／`mq2Done`／`mq2CardHTML`、`mq2Seed`（`qf` 快速株）、`mq2Wild`（草原第一包黃番茄藏花紋）、`mq2Trade`；NPC 提歐神父、所長維恩（`townNpcs`）；目前任務 `#mqLine`（`renderMqLine`、`mqLineTap`、`townArrowSVG`）；第一次提示 `tipOnce`（`state.tips`）。舊 `MQ` 第 5–11 章＝支線「失落的種子庫」。
- 等級（119、120）：`regLv`／`cropKept`（舊玩家 `state.lvKeep`，`lvKeepMigrate`）；`LV_REG`／`LV_CROP`／`LV_TOWN` 前三區重排；新經驗 `XP_WAKE`、`XP_EVO`、`XP_GOD`、`XP_OFFER`、`XP_CRAFT`（`XP_CAP.o`／`.k`）。
- 等級與任務（15y）：`addXp`、`levelUp`、`LV_CROP`／`LV_REG`、主線 `MQ`／`mqEv`、委託 `commGen`／`ensureComm`、每週 `wkTxt`／`wkFits`、NPC 故事 `NS`／`nsAccept`、種子庫館藏 `vdHTML`、主題榜 `wkTheme`／`wkSettle`。
- 供奉（114）：`EVO_NEED`／`GOD_NEED`／`EVO_P`／`GOD_P`／`OFFER_PERF`、階段 `f.evo` 0／1／2（`fyStage`、`FY_STAGE`）、進度 `f.op`（`fyOp`）、`offerOk`／`offerRate`／`offerSlots`／`offerDo`、`fyStageUp`（`fyFirstAct`）、換色 `RECOLOR_N`／`recolorOk`／`fyRecolor`；114.9 進度百分比 `fyPct`／`numC`、門檻台詞 `FY_MS`（`f.op.ms`）；畫面 `fyOffHTML`／`fyUpColHTML`／`fyColHTML`、`fyOfferFx`、神化演出 `fyShow('god')`；遷移旗標 `fyopV`。
- 神之子（113）：名字 `FY_NM`→`fyN`；祭壇清單 `ALT_LIST`（`ALT_N`）、`altObj`／`altGive`／`altFull`、`fyWakeAlt`（皇冠番茄 `crownGift`）、專屬造型捷徑 `fyExSlots`／`fyWakeEx`（`WAKE_EX_N`）；進度 `state.fairy.altar`。
- 故事引擎（126）：`FY_STORY[作物]` 每段 `steps`（deep／regions／talk／give／gives／altar／show，進度 `s.f.i`），`fsStep`／`fsNext`／`fsMap`／`fsCheck`（`fsTickAll`）／`fsAnswer`／`fsGiveSpec`（交付 id＝作物或「作物|第幾種」）、`FY_STORY_LATER`；台詞 `FY_LTAB`（`ROMA_L`／`JACK_L`／`MIERU_L`）；煙火 `fwShow`；地區故事 `RS[地區]`（grass／forest／marsh；步驟 `npc`／`spot`／`wait`／`ask`），`rsObj(bk)`／`rsAccept(bk)`／`rsDone(bk)`／`rsTick`、`rsNpcHTML`／`rsAskHTML`／`rsAllCardsHTML`；`mq2Past`。
- 蘿瑪與地區故事（118）：台詞 `fyLinesFor`（`ROMA_L`、`fyGod`）；`FY_STORY`／`fsObj`／`fsAccept`／`fsDone`／`fsMap`／`fsCheck`／`fsCardHTML`（`state.fyst`）；地區故事 `RS_GRASS`／`rsObj`／`rsTick`／`rsCardHTML`／`rsTheoHTML`（`state.rs`）；交付 `giveSpec` 的 kind `fs`、`rs`。
- 標本名額照組（127）：`specGroup`／`specGid`、`sgTally`／`sgFetch`／`sgCounts`／`sgN`、`sgFullTxt`。
- 標本與精靈：`claimSpec`、`rightsTx`、`specUse`、收藏櫃 `cabListHTML`；精靈 `fyWake`／`fyEvolve`、`fySpringHTML`、跟隨 `fyLoop`、演出 `fyShow`、圖 `fyArt`／`fyArtHTML`（新畫布 `FY_CV`、上色開關 `FY_RECOLOR`）。
- 角色：`avatarSVG`→`avV3SVG`（`av3.js`、`av3_heads.js`、衣服 `avOutfitParts`）、`avNorm`／`avPack`、打扮頁 `avatarEditorHTML`、衣櫃 `WARD`／`wardCheck`；`renderChars`、`updateMe`、`charG`、`poseFor`、`walkLoop`、`walkTo`。
- 介面改版（138）：共用樣式 CSS 變數 `--tx`／`--ol`／`--pn`…、稀有度色 `RCOL`（`--r0`～`--r5`）；一套面板 `sheetMode`／`sheetModeOff`（`body.shOnP`、`shFull`、`SHEET_FULL`、`#sheetBack`）、`body.pnlOpen`；主畫面 `#rbar`、`#mapBtn`→`p-map`（`renderMapPanel`／`mapPanelTap`）、選單 `p-menu`（`MENU`／`menuTap`）、神之子 `openFyPage`、`#syncDot`；背包 `bagTabsHTML`（種子／果實／素材／道具 `itemBagHTML`）、`bagCatOf`（野生）、`slotCell`／`lotIc`／`lotTier`、`bagSel`／`bagInfoHTML`、`bagTidy`、`bagVaultReq`；種子詳細 `lotHeroHTML`／`lotParentsTxt`／`rbtn`；任務面板 `ordersHTML`（`qTab`／`qCatOf`／`Q_GRP`／`qCardHTML2`／`qProgHTML`）。
- 主畫面重排（140）：右上 `#tbar`（`#ibFr`／`#frDot` `frDotOn`、`#ibDex`、`#ibLay`、`#mapBtn`、`#ibMenu`）、右下 `#rbar`（column-reverse：背包、任務、神之子）、布置模式 `layMode`／`renderLay`／`layTap`（`#layBar`）、背包分頁 種子／果實／素材（含道具）／種原庫、`MENU` 三格。
- 自然命名（145）：`appName`（`nameCol`／`patWord`／`shapeWord`／`cropWord`）、`appTags`／`appTagsHTML`、`nmIc`、`shortApp(ph,crop)`、`lotAppOf`／`lotAutoName`、`lotsVarietySync`、玩家改名 `l.nm`／`p.nm`、遷移 `m145`（旗標 `nameV`）；地名兩層 `#sceneName.two`、`regBanner(地區,地圖)`。地圖版面色塊圖 `tools/export_layout.js`（146）。
- 類型名稱（149）：`BASE_NAMES`／`baseName`（完整名稱）、`BASE_SHAPES`（小標籤短詞）、`gAutoName`（原始品種、野生種原的名字）、遷移 `m149`（旗標 `n149V`）、圖鑑系統名字在 `sortReg` 顯示時換；`shortApp(ph,crop)` 一定要傳作物。
- 主與僕人的頭像（147）：`porHTML`／`porFail`／`porSrc`／`porC`（`POR_C`）、`porArtOfSrc`（素材圖示）；血條 `#bossBar .bpor`。
- NPC 點擊（148）：`npcHitList`／`npcAt`／`npcGo`／`npcAtClient`（`handleTap` 最先看）、`walkTo(x,y,then,force)`；神之子資訊 `openFyInfo`／`openFyBtn`／`fyInfoHTML`（`sheet.fyinfo`）。
- 選地區預覽圖（151）：`rgCardHTML`／`rgPrev`（`assets/regions/preview_<地區>.jpg`）。
- 傷害數字（152）：`dmgShow`（`#dmgL`、`dmgPool` 12 個、`dmgStack`、`w2s`、`dmgFmt`、`monHeadY`、開關 `state.dmgNum`）；神之子立繪 `fyHeroHTML`／`fyGlowC`／`fyPop`。
- 道具圖示（153）：`itemArt`（新圖＋`itemArtOld` 退路、`itFail`、`ITEM_IMG`／`ITEM_DIM`、精魄 `spTint`、金色濾鏡 `itDefs`）、`potIc`（快捷格）。
- 小地圖（154）：`renderMini`／`regMiniSVG`／`mapQSet`／`miniFight`（`#miniMap`、`state.miniMap`）；地區地圖 `regMapSVG`（等級、任務、頭像）＋`regMapInfo`（`#rmInfo`）。
- 神之子放大（155）：`FY_S`＝1.3×角色高（`fyScaleSet`／`fyScaleMeasure`、`AV_HU`、`CHAR_S`、`FY_DX`／`FY_DY`／`FY_Q`）、放招 `fyCast`／`fyCastOrigin`；地面圖 `imgHref`（href＋xlink:href）。
- 新版主角（156）：`state.char2`／`state.char2Sex`（`char2Sex`、`CHAR2_FHAIR`）、`char2SVG`／`char2Paint`（同一個 `<image>` 換格）／`char2Frame`／`char2Geo`／`char2Preload`、名牌 `char2TagDY`、鐮刀 `CHAR2_HAND_DY`、設定 `renderChar2Box`（`#char2Box`）；WebKit 測試 `tools/wk150.js`。
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
| 109 | 3D 草原試玩回報修正 | 已完成 | docs/規格存檔.md；17z（9.106）；黑塊、頭閃的原因是推測，等 iPhone 確認 |
| 110 | 花精靈新圖上線 | 已完成 | docs/規格存檔.md；18a（9.107）、修訂版 18b（9.108：348×445 畫布、恢復上色） |
| 111 | 種植節奏第一步：生長時間、加速劑、地區改名、中間色不取名、育苗盤 10 等解鎖 | 已完成 | docs/規格存檔.md；18c（9.109）；沒有截圖、沒測 iPhone |
| 112 | 一株只收一次、果實袋 | 已完成 | docs/規格存檔.md；18d（9.110）；沒有截圖、沒測 iPhone |
| 113 | 神之子：改稱呼與名字、祭壇清單喚醒、專屬造型捷徑 | 已完成 | docs/規格存檔.md；18e（9.111）；「精靈之翼」照舊不改名（使用者 2026-11-20）；沒有截圖、沒測 iPhone |
| 114 | 神之子的供奉：進化、神化、換色 | 已完成 | docs/規格存檔.md；18s（9.125）；照 114.9（1,000／1,500、百分比、25／50／75% 的話）；**114.10 神化改 2,000，程式在 134.5 改**；買來的果實可以供奉；公告要貼 `tools/firestore_rules_console_114.txt` 才寫得進去；沒有截圖、沒測 iPhone |
| 115 | 怪物素材、背包、製作、定型 | 已完成 | docs/規格存檔.md；18f（9.112）；素材圖示暫用怪物縮圖；沒有截圖、沒測 iPhone |
| 116 | 主線改寫第一步：序章「醒來」、第一章「蘿瑪的清單」、操作引導 | 已完成 | docs/規格存檔.md；18g（9.113）；花紋兩邊各藏一份（使用者決定）；沒有截圖、沒測 iPhone |
| 117 | 果實的去處：委託改從果實袋交、果實上架市集 | 已完成 | docs/規格存檔.md；18h（9.114）；Firestore 規則要貼主控台；沒有 9 顆的那一類委託；沒有截圖、沒測 iPhone |
| 118 | 蘿瑪的故事、蘿瑪的台詞、翠風草原的地區故事 | 已完成 | docs/規格存檔.md；18j（9.116）；第二、三段等第 114 節；可以調查的田改成乾草堆、筆記頁沒做；沒有截圖、沒測 iPhone |
| 119 | 等級與解鎖：配合新主線重排前三區、新動作的經驗、節奏試算 | 已完成 | docs/規格存檔.md；18i（9.115）；進化、神化、供奉的經驗等第 114 節接上；沒測 iPhone |
| 120 | 修正：十級一區、支線「失落的種子庫」的結尾、新手前三株加速 | 已完成 | docs/規格存檔.md；18k（9.117）；探險家大衣之後補發（`coatDue`）；沒測 iPhone |
| 121 | 主線第二章「銀霧白樺林」：調停、傑柯的清單、喚醒傑柯 | 已完成 | docs/規格存檔.md；18l（9.118）；照使用者三點修改；沒有截圖、沒測 iPhone |
| 122 | 主線第三章「珍珠潟湖」：追查、蜜露的清單、喚醒蜜露、第一季收尾 | 已完成 | docs/規格存檔.md；18m（9.119）；估計 3～4 天（第 3 項約 1.5～2 天）；沒有截圖、沒測 iPhone |
| 123 | 花紋改版：三種形式、顏色自動配 | 已完成 | docs/規格存檔.md；18n（9.120）；櫻花瓣保留成第四種（使用者）；自動配色定案（2026-11-21，有問題再改）；順便修定型函式同名的錯；沒測 iPhone |
| 124 | 稀有度改版：最稀有的一項決定等級 | 已完成 | docs/規格存檔.md；18o（9.121）；跨界照舊是神話（規格沒提）；rights 各等級數量讀不到；沒測 iPhone |
| 125 | 偷菜與偷偷手套 | 已完成 | docs/規格存檔.md；18p（9.122）；第 129 節起只限朋友；通知用私訊、不用改規則；沒有截圖、沒測 iPhone |
| 126 | 傑柯與蜜露的台詞、故事；銀霧白樺林與珍珠潟湖的地區故事 | 已完成 | docs/規格存檔.md；18v（9.128）；傑柯第三段之後開放；裝飾給楓樹；沒有截圖、沒測 iPhone |
| 127 | 種子袋整理：還會變的種子換圖示；標本名額照「作物＋夢幻色」算 | 已完成 | docs/規格存檔.md；18q（9.123）；自動合併不做（使用者）；不用改規則；沒測 iPhone |
| 128 | 每日自動備份與自己還原 | 已完成 | docs/規格存檔.md；18r（9.124）；不用改規則；沒測 iPhone |
| 129 | 朋友名單（補第 125 節：偷菜只能偷朋友） | 已完成 | docs/規格存檔.md；18t（9.126）；不用改規則；沒有截圖、沒測 iPhone |
| 130 | 筆記頁：主的傳說、第一批的遺物 | 已完成 | docs/規格存檔.md；18w（9.129）；調查點都用現成物件；沒有截圖、沒測 iPhone |
| 134 | 秘境公開、當地人帶路、拿掉種子台座；神化 2,000 | 已完成 | docs/規格存檔.md；18x（9.130）；白樺林、潟湖照觸發改對白（種子、睡蓮）；沒有截圖、沒測 iPhone |
| 133 | 任務的指引、「可以完成了」的提示、提醒（擴到所有任務） | 已完成 | docs/規格存檔.md；18y（9.131）；難判斷的四類列在 9.131；**要請使用者在 iPhone 上看那一行和箭頭**；沒有截圖 |
| 131 | 戰鬥改版第一步：血量、怪物會還手、小補血藥、打怪經驗、白樺林與潟湖的素材 | 已完成 | docs/規格存檔.md；18z（9.132）；打怪經驗先 0（使用者）；怪物仍是各人各自的；**要請使用者 iPhone 實機試邊走邊打邊躲**；沒有截圖 |
| 135 | 主、主的僕人、精魄、神寵：九隻主的現身條件、重生、掉落、神寵三階段 | 進行中 | docs/待實作/第135節.md；**第一階段（19b，9.134）、第二階段（19d，9.136）已做**：三隻僕人、第一季三隻主、多人同步（Realtime Database 要加 `tools/rtdb_rules_135_fight.txt`）、精魄孵化與神寵、卡包（規則文件不在 repo，先收著）、米涅瓦的巢；圖都是佔位；神寵經驗跟著打怪經驗（現在 0）；後六區、27 個技能還沒做；**要請使用者兩支手機實測**；**135.13 金瞳的巴絲（黑貓）的打法已定（2026-11-22，只是設計、還沒做）**：看眼睛（凝視扇形金光掃過→被盯住、撲擊三下、金瞳暗下來 3 秒是破綻、每掉三分之一血化沙＋聖甲蟲記號；第二階段雙重凝視、化沙時冒 2 條小金蛇、破綻縮成 2 秒），只用現有 6 張圖 |
| 136 | 冰封種子庫的由來（門禁卡、館藏重開、古老的種子） | 未做（設計定案） | docs/待實作/第136節.md；跟晶霜雪原那一章一起做 |
| 132 | 互助：每天幫每位朋友照顧一次 | 已完成 | docs/規格存檔.md；18u（9.127）；開花等授粉的不計時、不受影響；不用改規則；沒有截圖、沒測 iPhone |
| 137 | 主題布置：一鍵套用、存自己的布置 | 已完成 | docs/規格存檔.md；19a（9.133）；田園小屋是「已擁有」、沒有開局自動擺；**要請使用者 iPhone 看四套套用後的畫面** |
| 138 | 介面改版第一步：共用樣式、主畫面、背包、種子詳細、任務面板 | 已完成 | docs/規格存檔.md；19c（9.135）；農場上的抽屜照舊是抽屜、野生不含雜交第一代、道具放背包第四分頁（和規格不同的地方列在 9.135）；果實、素材詳細只換樣式；沒有截圖；**要請使用者 iPhone 看主畫面與面板** |
| 139 | 後六區的地圖模板與怪物 | 已完成 | docs/規格存檔.md；19e（9.137）；139.7、139.8 由第 141 節取代；建議之後產圖的物件列在 9.137 |
| 140 | 主畫面按鈕重排（第 138 節的修正） | 已完成 | docs/規格存檔.md；19f（9.138）；金幣在兩種尺寸都放頭像下面、道具併進素材分頁（和規格不同）；有截圖（假存檔）；沒測 iPhone |
| 141 | 後六區的一般怪與素材（取代 139.7、139.8） | 已完成 | docs/規格存檔.md；19g（9.139）；42 隻是佔位圖；怪物圖鑑還沒有（變種排在原版旁邊沒做）；森林、潟湖要換的怪照舊沒素材；沒測 iPhone |
| 142 | 第一季三區的一般怪換新（神之子畫風、元素變種） | 已完成 | docs/規格存檔.md；19h（9.140）；沒有地方指名拿掉的怪；潟湖、草原沒截圖（面板收起來、草原是 3D）；沒測 iPhone |
| 143 | 虹光遺城重排：失落的高文明城市（修改 139.4、139.5 的遺城部分） | 已完成 | docs/規格存檔.md；19i（9.141）；建議補的圖列在 9.141；沒測 iPhone |
| 144 | 野外的戰鬥按鈕：補血藥快捷格、自動喝藥（修改 131、140） | 已完成 | docs/規格存檔.md；19j（9.142）、2026-11-22 修正 19l（9.145：按鈕到哪裡都不動、快捷格在背包左邊）、19m（9.146：右上布置在別處留空位）；量了位置、沒截圖；**要請使用者 iPhone 試長按換藥水** |
| 145 | 介面上不用「・」：地點兩層字、種子與果實自然命名 | 已完成 | docs/規格存檔.md；19k（9.143）；剩下 194 處分隔用的「・」列在 9.143 等使用者決定；截圖會切邊、另外量了位置；沒測 iPhone |
| 146 | 地圖版面色塊圖（給 AI 畫地面用；只做工具） | 已完成 | docs/規格存檔.md；9.144；先輸出 tools/layout/ruins_plaza.png／.json，其他地圖等試完 |
| 147 | 主與僕人的頭像 | 已完成 | docs/規格存檔.md；19m（9.146）；圖鑑沒有主的清單（截圖改拍素材）；有截圖；沒測 iPhone |
| 148 | NPC 驚嘆號點了沒反應；點神之子改成看資訊 | 已完成 | docs/規格存檔.md；19m（9.147）；原因四個列在 9.147；神之子沒有等級、數值、技能資料先不顯示；有截圖；**要請使用者 iPhone 試點驚嘆號** |
| 149 | 原始品種改用現實的類型名稱；甘藍家族改叫甘藍 | 已完成 | docs/規格存檔.md；19n（9.148）；詳細頁的來源那行改成「來源：…」；順便修好名字裡形狀一律用番茄；開發用頁面還有「甘藍家族」；有截圖；沒測 iPhone |
| 150 | 地圖用一整張畫好的地面當底（先做虹光遺城噴泉廣場） | 已完成 | docs/規格存檔.md；19o（9.149）、19p 修 iPhone 上地面圖沒換上去（19s WebKit 實測：新版正常，但舊版在電腦 WebKit 也正常，原因沒證實，要 iPhone 再看）；`ground` 照副檔名分辨（秘境用它寫顏色）；手機上會有點糊，建議放大 2 倍；有截圖；沒測 iPhone |
| 151 | 選地區的預覽圖換成畫好的圖 | 已完成 | docs/規格存檔.md；19q（9.150）；有截圖；沒測 iPhone |
| 152 | 傷害數字（楓之谷式）；神之子資訊面板放大、會動 | 已完成 | docs/規格存檔.md；19q（9.151）；爆擊、MISS、神之子出手的樣式做好但遊戲裡還沒有這些傷害；順便修玩家被打的數字位置；有截圖；沒測 iPhone |
| 153 | 道具圖示換新 | 已完成 | docs/規格存檔.md；19q（9.152）；功能按鈕的舊圖示沒動（列在 9.152）；精魄目前只有三隻主；有截圖；沒測 iPhone |
| 154 | 野外常駐的地區小地圖 | 已完成 | docs/規格存檔.md；19q（9.153）；共用原本的地區地圖；截圖右邊被切（瀏覽器隱藏），量了位置；沒測 iPhone |
| 155 | 神之子在遊戲裡放大 | 已完成 | docs/規格存檔.md；19r（9.154）；遊戲裡還沒有神之子技能，放招動作 `fyCast` 先做好沒人呼叫；有截圖；沒測 iPhone |
| 156 | 新版主角素材（測試接入） | 已完成 | docs/規格存檔.md；19s（9.155）；沒有性別設定，開關旁加男生／女生；鐮刀錨點先用固定值等使用者看；舊衣服等不疊；有截圖；沒測 iPhone |
