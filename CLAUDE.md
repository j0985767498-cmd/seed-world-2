# 《種子的世界》專案說明（CLAUDE.md）

> 程式：`index.html`。**程式碼才是唯一的事實來源**，和文件衝突時以程式為準。
> 2026-11-18 起 CLAUDE.md 只放接手需要的東西。已完成各節的原文、第 9 節（各系統的實作紀錄）、第 10 節（版本歷程）、第 17 節都在 `docs/規格存檔.md`；還沒做或還沒定案的節，每節一個檔案在 `docs/待實作/`。哪一節在哪裡看最下面的「節號索引表」。
> **目前 BUILD `2026-11-20q`，下一版 `2026-11-20r`。**
> **使用者要自己做的事**：Realtime Database 規則整份貼 `tools/rtdb_rules_173.txt`（含 62 的 status、135、172、173）；Firestore 規則整份貼 `tools/firestore_rules_console_114.txt`（117 那份＋`fairyFirst`）。舊的規則檔都只是紀錄。
> **還沒做的節**：165（新版角色正面、背面走路）、108 的其他地區／農場／城鎮（3D）、135 的後六區與神寵技能、136（跟晶霜雪原那一章一起做）；未定案：14、19、69。各節做完的紀錄看下面的索引表。

---

## 0. 接手者必讀

### 0.1 如何讀取程式碼

1. 本專案在 Claude Code 中使用，`index.html` 就在專案資料夾內，直接讀取即可。
2. **不要把整個 `index.html` 讀進來**（約 1.7 MB、1 萬 2 千多行，會耗掉大量額度）。用 `grep -n`、Python 搜尋關鍵字，只看需要的段落。
3. 修改時用 Python 做字串替換，每次替換都確認「只出現一次」，替換後立刻做語法檢查（見第 15 節）。
4. **注意：** 程式中很多函式寫在同一行。插入註解時一律用 `/* … */`，不要用 `//`，否則會把同一行後面的程式碼變成註解（曾經實際發生過）。

### 0.2 工作守則

1. **每次改版都要更新 `BUILD`**（`const BUILD='…'`），**同時把專案根目錄的 `version.json` 改成同一個值**（`{"build":"…"}`；16h 起遊戲一打開會抓這個檔，和程式裡的 BUILD 不一樣就自動重新整理一次，見 9.53）。遊戲會比對網頁上的版本號，舊版畫面發現有新版時會停止存檔並提示重新整理。忘記更新會造成新舊版本混用、存檔互相覆蓋。
2. **不要重置玩家資料。** 使用者明確要求改版時保留既有的品種、種子與植株。需要轉換資料時，寫一次性的遷移函式，放在 `migrate(o)` 裡，並用 `state` 上的旗標避免重複執行。旗標都在 `migrate(o)` 與 `newGame()`，新增時兩邊都要加。例外：舊肥料換金幣（14g）刻意**不用旗標**，每次載入都檢查（見 9.10）。
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

- **單一檔案** `index.html`（約 12,300 行、1.7 MB），CSS 與 JavaScript 都在檔案內；3D 畫面另有 `js/w3d.js`、`lib/three.min.js`，舊人物另有 `assets/char/av3*.js`，用到才載入。
- 後端：Firebase（compat 10.12.2），專案名稱 `seed-world`
  - Auth：Google 登入；
  - Firestore 集合：`players`（每人一份存檔，欄位 `save` 為字串）、`listings`、`registry`、`rights`、`news`、`discoveries`、`boards`、`profiles`、`messages`、`backups`；
  - Realtime Database：線上狀態與角色位置。
- Firestore 安全規則在 Firebase 主控台。最新的完整一份是 `tools/firestore_rules_console_114.txt`（以使用者 2026-11-21 提供的主控台版 `firestore_rules_console_117.txt` 為底，加了 `fairyFirst`）；**之後要改規則，一律以最新的這份為底，產出完整的一份新檔案**（例 `tools/firestore_rules_console_<節>.txt`），不要只給片段。舊的 `firestore_rules_91／93／95／98／117.txt` 是片段，只當紀錄。
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
  pc: ['white','white'], // 花紋顏色：兩個是同一種夢幻色才是夢幻色花紋，否則是一般花紋（顏色照果皮自動配，patTone）
  pf: [0, 2],            // 花紋形式 0 條紋、2 星點、3 漸層、4 櫻花瓣（PF_OK）；條紋以外兩個一樣才出現，否則條紋；1 斑點 123 起拿掉（讀到當條紋）
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

`lots`（種子袋，格數 `bagCap()`＝100＋每 5 級 10，常用 `MY_SLOTS` 10；每包最多 `LOT_MAX` 60 顆）、`vault`（種原庫）、`fruits`（果實袋 `FRUIT_SLOTS` 30 格）、`mats`（素材）、`items`（道具：`acc` 加速劑、`mut` 誘變劑、`pot`／`pot_m`／`pot_l` 補血藥、`fix` 定型劑、`glove` 偷偷手套、精魄 `sp_<地區>`…）、`packs`（卡包）、`weapons`／`wpn`（武器）、`pets`／`petOn`（神寵）、`fairy`（神之子）、`look`（新版人物外觀）、`plots`、`plotPos`（`null` 表示未開墾）、`tray`（育苗盤）、`fixq`（定型中）、`trip`（這趟拿到的素材）、`mq2`（主線）、`orders`、`weekly`、`daily`、`coins`、`lv`／`xp`、`specs`（標本）；遷移旗標見 0.2 第 2 點。

## 4. 遺傳規則（現行；14l 起照第 20 節，詳見 20.0）

> 特殊色自第 49 節起顯示為夢幻色（程式裡仍叫 `SPECIAL`／特殊色）

| 性狀 | 規則 |
| --- | --- |
| 基本造型 | 一對類型因子 `b`（0–2），兩個一樣 → 該類型，否則第 0 種；各作物名稱見第 24.2 節 |
| 特殊造型（1–6） | 正方形、三角形、愛心、星形、月牙形、甜甜圈。兩個一樣才出現（`spExpr`），否則顯示基本造型；沒有強弱排序 |
| 專屬造型（7–13） | 與特殊造型同一組因子，規則相同（14 元寶已停用） |
| 顏色 | 沒有強弱排序。基本色 6（`BASIC`）：白、綠、黃、紅、紫、黑；夢幻色 9（`SPECIAL`，顯示名 `CN`）：銀、珍珠白、水藍、金、黑曜、水晶、星空、彩虹、櫻雪。**設計已改名**為翡翠、銀、珍珠、櫻雪、金、水晶、赤曜、星空、彩虹，**程式未改** |
| 果皮顏色 | `colKey`：兩個一樣 → 純色；兩種基本色 → 15 種混色（`MIX15`）；特殊＋基本 → 淡特殊色 `l-x`；兩種特殊色 → 雙色 `d-a-b`。共 75 種（`ALL_SKINS`：6＋15＋9＋9＋36） |
| 花紋 | `pw` 兩個都是 1 才有（第 123 節起）：形式 條紋、星點、漸層、櫻花瓣，條紋以外兩份一樣才出現、否則條紋；顏色兩份是同一種夢幻色才是夢幻色花紋，其他是一般花紋、顏色照果皮自動配（`patOf`／`patTone`）；不再有兩種形式一起、混色花紋 |
| 大小、完美度 | 各 10 組加性因子，取平均。**只顯示等級**（迷你／小／中／大／巨大；奇異造型／歪斜／良好／完美），不影響稀有度與品種權，只影響賣價與紀錄榜 |
| 突變（每顆種子，`mutRound`） | 只剩夢幻色 0.2%、特殊造型 0.05%（`MUT_P`）；一般突變、專屬造型突變第 67 節拿掉；誘變劑 `mutateX` 為 25 倍（`MUTX`）且不蓋掉專屬造型 |

外觀穩定度 `ph.stab`：這株自交後保留同外觀的機率。外觀鍵值 `appKey`（14l）：`b{0-2}` 或 `p{1-13}` ＋ `|果皮|花紋（夢幻色或 n）/形式`（123 起；舊鍵值用 `keyV4()`，更舊的大寫鍵值用 `keyV3()` 換算）。

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
- 遷移：`migrate(o)`（旗標都在 `migrate(o)` 與 `newGame()`，新增時兩邊都要加）；`geneMigrate`、`exMigrate`、`lvMigrate`、`recover98`。
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
- 素材、製作、定型（115）：`MATS`／`MON_MAT`、`matDrop`（`MAT_P`、`MAT_GOLD_P`）、`matIcon`（`MAT_ICON`）、`state.mats`、種子袋「素材」分頁 `matBagHTML`／`matHTML`；道具行「製作」`RECIPES`、`craftEntries`／`craftPlan`／`craftDo`／`craftHTML`；定型 `fixWhy`／`fixBlock`／`fixToGeno`／`fixStart`／`fixTick`（`FIX_MIN`、`FIX_MAX`、`state.fixq`）。
- 主與僕人（135 第一階段）：`SERVANTS`／`LORDS`／`BATK`（招式資料）、`bossRT`、`bossEnter`／`bossLeave`／`bossLoop`→`bossStep`、`bossAI`／`bossFollow`（不是主機）、`bossStrike`／`bossHit`、畫 `bossPaint`（`bossG`、範圍 `bossTel`）、`#bossBar`；掉落 `bossReward`（`state.servantAt`、`state.lordCd`、`state.spirits`／`spiritLine`、`lordSeed`、`lordFirst`）；現身 `lordSummonTick`（`minervaFog`／`MIN_FEATHERS`、`exhShore`／`lordSum.path`／`bossWalkOk`）、初穗 `sheet.hatsuho`（`hatsuhoHTML`／`hatsuhoGo`）、`lordSummon`、出口封住 `regSealed`；同步 `bossNet`、`fight/<地區>`（`lordNetStart`／`lordNetSync`／`lordHeartbeat`／`lordHostCheck`／`lordEnd`／`lordResult`／`lordForfeit`、`lordBusy`）。
- 精魄與神寵（135 第二階段）：精魄是道具 `sp_<地區>`（`SPK`／`isSpK`、`spiritArt`）、孵化 `spiritUse`／`hatchTick`（`state.hatch`、`HATCH_MS`）、神寵 `state.pets`／`state.petOn`（`petsArr`、`petCur`、`petName`、`petSVG` 佔位、`petCharG`／`petMove`、`petXp`、`petEvoNeed`／`petEvoOk`／`petEvolve`、頁面 `sheet.pet` `petHTML`／`petAction`）、卡包 `state.packs`（`packsObj`）、背包道具分頁 `spiritLine`；米涅瓦的巢 `NEST_AT`／`nestObj`／`nestTick`（`state.lordWon`、筆記 `R6`，`x:1` 不算進五件）；旗標 `spV`。
- 主題布置（137）：`THEMES`（相對 `THEME_A`）、`themePrice`、`themeApply`（`decoCollectAll`、`decoPlaceList`）、`themeUndo`（`state.themePrev`）、我的布置 `state.layouts`（`layoutSave`／`layoutApply`／`layoutRename`／`layoutDel`）、面板 `themeBoxHTML`／`themeSVG`、預覽 `sheet.theme`／`themeHTML`、`state.themeUsed`（名片 `th`）、旗標 `themeV`。
- 戰鬥（131）：血量 `pHP`（上限 `pMax`，158）、`pDamage`／`pDie`／`pRegen`、`#hpBar`（`renderHP`）；怪物 `MON_RHP`／`MON_RDMG`／`SICKLE_DMG`、還手（`aggro`、`MON_WIND`／`MON_ATK_R`／`MON_LEASH`／`MON_GIVEUP`、`.mwind`）、數量 `monCount`（`MON_RT.xs`）；小補血藥 `pot`（`drinkPot`、`#potBtn`、`state.potGift`）；這趟素材 `state.trip`（`tripAdd`／`tripSave`／`tripLose`）；經驗 `monXp`（`MON_XP_ON=false`）。
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
- 標本與精靈：`claimSpec`、`rightsTx`、`specUse`、收藏櫃 `cabListHTML`；精靈之泉 `fySpringHTML`（設計已作廢，程式還在、城鎮 `spring` 還開得到，待刪）、跟隨 `fyLoop`、演出 `fyShow`、圖 `fyArt`／`fyArtHTML`（167 起 `assets/fairy2/<鍵>_<階段>.png`，`fyStg`／`fy2Src`、畫布 `FY_CV`，不再上色）。
- 角色（舊人物，**後備**：新版人物 171 載入失敗、也沒開 156 時才用）：`avatarSVG`→`avV3SVG`（`av3.js`、`av3_heads.js`、衣服 `avOutfitParts`）、`avNorm`／`avPack`、打扮頁 `avatarEditorHTML`、衣櫃 `WARD`／`wardCheck`；`renderChars`、`updateMe`、`charG`、`poseFor`、`walkLoop`、`walkTo`。
- 介面改版（138）：共用樣式 CSS 變數 `--tx`／`--ol`／`--pn`…、稀有度色 `RCOL`（`--r0`～`--r5`）；一套面板 `sheetMode`／`sheetModeOff`（`body.shOnP`、`shFull`、`SHEET_FULL`、`#sheetBack`）、`body.pnlOpen`；主畫面 `#rbar`、`#mapBtn`→`p-map`（`renderMapPanel`／`mapPanelTap`）、選單 `p-menu`（`MENU`／`menuTap`）、神之子 `openFyPage`、`#syncDot`；背包 `bagTabsHTML`（分頁見 140）、`bagCatOf`（野生）、`slotCell`／`lotIc`／`lotTier`、`bagSel`／`bagInfoHTML`、`bagTidy`、`bagVaultReq`；種子詳細 `lotHeroHTML`／`lotParentsTxt`／`rbtn`；任務面板 `ordersHTML`（`qTab`／`qCatOf`／`Q_GRP`／`qCardHTML2`／`qProgHTML`）。
- 主畫面重排（140）：右上 `#tbar`（`#ibFr`／`#frDot` `frDotOn`、`#ibDex`、`#ibLay`、`#mapBtn`、`#ibMenu`）、右下 `#rbar`（column-reverse：背包、任務、神之子）、布置模式 `layMode`／`renderLay`／`layTap`（`#layBar`）、背包分頁 種子／果實／素材（含道具 `itemBagHTML`）／武器／種原庫、`MENU` 三格。
- 自然命名（145）：`appName`（`nameCol`／`patWord`／`shapeWord`／`cropWord`）、`appTags`／`appTagsHTML`、`nmIc`、`shortApp(ph,crop)`、`lotAppOf`／`lotAutoName`、`lotsVarietySync`、玩家改名 `l.nm`／`p.nm`、遷移 `m145`（旗標 `nameV`）；地名兩層 `#sceneName.two`、`regBanner(地區,地圖)`。地圖版面色塊圖 `tools/export_layout.js`（146）。
- 類型名稱（149）：`BASE_NAMES`／`baseName`（完整名稱）、`BASE_SHAPES`（小標籤短詞）、`gAutoName`（原始品種、野生種原的名字）、遷移 `m149`（旗標 `n149V`）、圖鑑系統名字在 `sortReg` 顯示時換；`shortApp(ph,crop)` 一定要傳作物。
- 主與僕人的頭像（147）：`porHTML`／`porFail`／`porSrc`／`porC`（`POR_C`）、`porArtOfSrc`（素材圖示）；血條 `#bossBar .bpor`。
- NPC 點擊（148）：`npcHitList`／`npcAt`／`npcGo`／`npcAtClient`（`handleTap` 最先看）、`walkTo(x,y,then,force)`；神之子資訊 `openFyInfo`／`openFyBtn`／`fyInfoHTML`（`sheet.fyinfo`）。
- 選地區預覽圖（151）：`rgCardHTML`／`rgPrev`（`assets/regions/preview_<地區>.jpg`）。
- 傷害數字（152）：`dmgShow`（`#dmgL`、`dmgPool` 12 個、`dmgStack`、`w2s`、`dmgFmt`、`monHeadY`、開關 `state.dmgNum`）；神之子立繪 `fyHeroHTML`／`fyGlowC`／`fyPop`。
- 道具圖示（153）：`itemArt`（新圖＋`itemArtOld` 退路、`itFail`、`ITEM_IMG`／`ITEM_DIM`、精魄 `spTint`、金色濾鏡 `itDefs`）、`potIc`（快捷格）。
- 小地圖（154）：`renderMini`／`regMiniSVG`／`mapQSet`／`miniFight`（`#miniMap`、`state.miniMap`）；地區地圖 `regMapSVG`（等級、任務、頭像）＋`regMapInfo`（`#rmInfo`）。
- 神之子放大（155）：`FY_S`＝1.3×角色高（`fyScaleSet`／`fyScaleMeasure`、`AV_HU`、`CHAR_S`、`FY_DX`／`FY_DY`／`FY_Q`）、放招 `fyCast`／`fyCastOrigin`；地面圖 `imgHref`（href＋xlink:href）。
- 新版主角（156，**後備**：分層人物 171 載入失敗時才用）：`state.char2`／`state.char2Sex`（`char2Sex`、`CHAR2_FHAIR`）、`char2SVG`／`char2Paint`（同一個 `<image>` 換格）／`char2Frame`／`char2Geo`／`char2Preload`、名牌 `char2TagDY`、鐮刀 `CHAR2_HAND_DY`、設定 `renderChar2Box`（`#char2Box`）；WebKit 測試 `tools/wk150.js`。
- 升級獎勵（157）：`LV_PACK`／`lvPackFor`（`ITEM_DOWN`、`lvItemResolve`、`itemExists`）、`lvPackBk`、`lvGiftHTML`；套裝 `OUTFITS`／`OUTFIT_MATS`／`outfitCoins`、`state.outfitRx`／`state.outfits`、`outfitReady`（`OF_READY`，看 `assets/char2/outfit/<套裝>/m_front.png`）、`outfitMake`、製作分頁 `craftTabsHTML`／`outfitCraftHTML`（`sheet.ctab`）、衣櫃 `outfitWardHTML`、遷移 `m157`（旗標 `rx157V`）。
- 等級成長（158）：`pAtk`／`pHpMax`（`pAtkNow`、`pMax`，取代 `PHP_MAX`；`PHP_BASE` 只當開局值）；野外鏡頭 `exZoom`／`EX_ZOOM`（`state.camZoom`，`zk`、`setZoom`）；影子 `charShadow`、`fyShRx`。
- 武器（159）：`WEAPONS`／`WP_ORDER`／`WP_DIM`、`state.weapons`／`state.wpn`／`state.wpnPick`、`curWpn`／`wpnTag`／`wpnDmg`／`wpnFire`（`dealT`、`hitMon`、`bossDealt`、`m.stun`、`m.burn`）、子彈 `wpnShot`／`wpnStep`／`wpnLoop`（`WPN_PROJ`）、特效 `fxW`、拿在手上 `wpnHTML`／`wpnPaintMe`／`wpnAnim`（`#meWB`／`#meWF`、`WP_HAND`；171／179 起只在退回舊人物時用，新版人物的武器是 `c3Wpn`）、`wpnEquip`／`wpnLock`、新手 `wpickHTML`／`wpickDo`、背包 `wpnBagHTML`、製作 `wpCraftHTML`／`wpMake`（`fruitCropTake`）。
- 補血藥（160）：`POT_TYPES` 三種（pot／pot_m／pot_l）、配方在 `RECIPES`。
- 掉落物在地上（161）：`GDROP`（`DROP_LIFE`、`PICK_R` 90、`PICK_SHOW_R` 120／`PICK_HIDE_R` 132、`AUTO_PICK_R` 28，181）、`dropLayer`（`#dropL`）、`dropArt`、`dropSpawn`、`dropTake`→`dropFly`（181）、`dropPick`、`dropPickBtn`（181：90 內沒有就走過去）、`dropTick`（在 `monLoop`；181 起一律自動撿）、`dropClear`（在 `monClear`）、撿起按鈕 `#pickBtn`（`dropBtnPaint({d,n})`，pointerdown）；`state.autoPick` 181 起不用；`matDrop(m,p,ground)`；`bossReward` 的素材、金幣也掉地上；傷害數字 28／36px。
- 僕人下來空地（162）：`SERVANTS`／`LORDS` 的 `arena`（`arenaR`）、`ARENA_R`／`ARENA_JUMP`／`ARENA_LEAVE`、`bossArena`／`bossArenaR`、`bossJump`／`bossJumpStep`／`bossArenaSet`、`bossClamp`、`bossHomeStep`。
- 劇情對話（163）：`VN_REG`／`VN_STORY`、`vnParse`（「名字(表情)：台詞」、「｜」分頁、「旁白：」）、`vnPlay`／`vnNext`／`vnTap`／`vnLog`／`vnEnd`／`vnFromNote`、立繪 `vnPortrait`（`assets/portrait/`、`VN_PID`／`FY_PID`）＋替代 `vnFallback`／`vnImgFail`（神之子裁切 `FY_CROP2`）、鏡頭 `vnCamP`／`vnZ`／`vnCamTo`、章節卡 `chapterCard`（`CH_BK`、`state.chSeen`）、設定 `renderVnBox`（`state.vnSpeed`）；`npcTalk`／`fyTalkHTML` 用 `<!--vnS:id-->…<!--vnE-->` 包台詞，`noteOpen` 看到就先播。
- 鏡頭、神之子大小（164）：`EX_ZOOM` 1.15（遷移 `cam164V`）、`FY_REL` 1.0、`FY_DX`／`FY_DY`；被擋住的白色剪影 178 拿掉，現在的做法見 178 那條（`meOccluded` 還在但沒人呼叫）。
- 武器平衡（166）：`wpnMelee`（受傷 ×0.6）；背武器（166.1）已由第 179 節刪掉；野外鐮刀 `wpnDmg(null)` ×0.5。怪物追擊（19x）：`MON_CHASE_K` 0.85×玩家走路、`MON_LEASH` 400，正在打的那隻也追。
- 神之子新圖、光芒顏色（167）：`fyStg`／`fy2Src`、`FY_CV`（420×424、身體 88%）、`fyCols`（`fyGlowC`→暗色換紫綠反光／往白混、動態色列）、`fyBodySVG`（背光 `.fy7bl.s1～s3`、神化腳下 `.fy7ring`）、`fyLoop` 的光點（`S.cols`）、`FY_CROP2`。
- 別人看得到新版主角（168）：`pushPos` 的 `c2`、`profiles.c2`（`pushProfile`）、`charG(…,c2)`、`char2SVG(face,moving,sex)`／`char2Paint(…,sex)`、`char2PaintOthers`（`[data-c2w]`）、`charShadow(c2s)`、名片 `spinC2`。
- 神之子背面（169）：`fy2Src(k,st,b)`、`fyBackReady`／`FY_BK`、`fyUp`／`fyWantBack`、`fyFace`、`S.sq`（壓扁翻面）；`getPos` 回傳 `face`。
- 神之子的普通攻擊（170）：`FY_ATK_R`／`FY_ATK_CD`／`FY_ATK_PCT`／`FY_ATK_ENG`／`FY_BOLT`、`fyAtkTick`（`monLoop`、`bossLoop`）、`fyTarget`、`fyBaseDmg`、`fyAutoOn`（`state.fyAuto`）、演出 `fyAtkFx`／`fyCastArt`（`_c` 圖、`FY_CK`、`S.castFlip`）、同步 `fyAct`→`pushPos` 的 `fa`、`fyAtkRemote`（`FY_SEEN`）；`monHit(…,pet)`、`bossDealt` 的 `o.pet`。170 補：`FY_BOLT_MS` 380、`FY_LINE_HOLD`、打中 `fyHitFx`（`.fyp-ring`）、出手光環 `.fyp-cring`。
- 主、僕人共鬥（172）：`bpath`（`fight/<區>`／`fight/<區>_sv`）、`bossNetSync`（加入、更新、結束，`lordNetSync` 轉呼叫）、`svNetWatch`／`svNetState`／`svBusy`／`bossSvNet`、`bossScaleUp`（`BOSS_JOIN_K`、`b.base`／`b.adj`／`b.mcount`，`bossHp` 扣 `adj`）、`svResult`、`bossMemHTML`（`.bmem`）、`tmDmg`（`.dmg.tm`）、`bossEvents`、`fightDenied`；測試 `tools/tcoop.js`（`tload.js` 會跑）。
- 秘境掉落物（174）：`bossLoop` 也跑 `dropTick`、`bossLeave` 先 `dropClear`。
- 分層人物（171，177 改讀 manifest）：`C3`／`C3_HU`／`C3_DIR`／`C3_WPN`、`char3On`（`state.char3`）、`lookNorm`／`lookPack`／`lookUnpack`（`state.look`、同步 `ap`）、`c3Im`／`c3Anc`、`c3Sheet`（合成＋外輪廓→blob，LRU 24，`c3LastMs`）、`c3Act`／`c3State`、`c3SVG`／`c3Paint`／`c3PaintAll`、`c3Wpn`／`c3Part`、`c3Atk`／`c3HitAt`／`c3Walk`、造型 `sheet.look`（`lookHTML`／`lookAction`、`c3TestWeapons`）；參考實作在 `docs/規格存檔_附件/第171節_參考實作.html`。
- 新版人物修正（176）：`c3Preload`／`c3Ready`／`c3Fail`（`C3_WAIT`，404 或 5 秒才退回舊人物）、等素材時 `<g class="c3w">`、淡入 `c3in`（`C3_SHOWN`）、頭像與名片裁圖 `c3Crop`（`C3_HEAD`／`C3_BODY`，`renderMe`、`spinSVG`／`spinC3`、`profiles.ap`）。
- 打扮、正式素材（177）：`assets/char3/manifest.json`（`c3Mf`／`c3MfSet`、`C3_MF`）、`c3Anc(體型)`（`C3_ANCB`）、`c3G(動作)`→組、`c3Sheet(L,組)`（move／atkA／atkB）、`c3Layers`（`manifest.order`、套服 `c3Suit` 不畫 bottom）、`c3Comp`、`c3HS`、`c3Body`（跟著 `char2Sex`）、`lookNorm(l,b)`／`lookStore`、`ap` 第一段是體型；打扮面板 `openLook`／`lookHTML`／`lookAction`（`sheet.ld` 草稿、`sheet.lt` 分頁、`sheet.lr` 方向、`LOOK_TABS`／`LOOK_RING`）、`c3Release`。
- 打扮面板改版（180）：單品縮圖 `lkThumb`（`LK_TH`，髮型照髮色分開快取）、分頁圖示 `LK_IC`、色點 `data-lkc`、`#sheet.lkOpen`（`.lkp` 預覽／`.lks` 捲動區／`.lkf` 固定按鈕）、滑動轉身 `lkSw`／`lookPrevPaint`／`lookPrevSVG`。
- 邊走邊攻擊、變白（178）：`c3State` 攻擊中有移動 → `<動作>_w`（atkAw／atkBw，好了才換）；`wpnPaintMe` 遇到新版人物不畫（浮游砲兩個的原因）、`c3PodPos`（飛彈起點）、`wBob3`；白色剪影拿掉：`ghostTick` 改成 `occList`→前景物件 `.fo[data-fo]` 加 `focc`（`M._objs[i].r`）；被打 `c3hurt`（只改透明度）、hit 0.3 秒。
- 遠程從武器射出（179）：`wpnHTML` 只在退回舊人物時用；`mzFire`（取代 `wpnFire` 的遠程四段、`MZ_FR` 第幾格）、出手點 `mzOf`／`mzCalc`（`MZ`，高階圖照 `WP_DIM` 換框內比例）、`mzCell`／`mzToW`／`mzMe`；測試開關 `mzShow`（`sw_mz`、`c3Part` 的 `mz`、設定 `data-ap="mz"`）。
- 任務提示收合（175）：`#mqWrap`（`mqColInit` 把 `#mqLine` 搬進去）、`#mqCol`「‹」、左邊緣標籤 `#mqTab`（紅點 `dot`、`bump`）、`mqColSet`（本機 `sw_mqcol`）、`mqColSync`（包在 `renderMqLine` 外面，`mqSig`）、`mqLay`（隊伍名單在上、任務提示在下，`body.mqParty`；也包在 `renderParty` 外面）。
- 組隊（173）：`party/<pid>`／`partyInv`、`partyNet`／`partyDenied`、`partyBoot`／`partyWatch`／`partySync`／`partyTick`（3 秒、沒變不寫）、`partyInvite`／`partyCanInvite`／`partyInvSync`／`partyInvCard`／`partyAccept`、`partyLeave`／`partyDrop`、`partyFightEv`（在 `lordNetStart`）／`partyFightPrompt`／`partyGo`、`renderParty`（`#partyBox`）、`partyHas`（名牌、172.3 成員列、隊友傷害數字用 `PARTY_COLOR`）。
- 素材的取得提示（185）：`matSrc`（`MAT_RARE_N`、`matSrcNm`／`matSrcPic`）、製作畫面一行 `matRowHTML`、取得方式小卡 `sheet.msrc`／`msrcHTML`／`msrcGo`（`qGo`）、`monDropsHTML`、`matHTML` 的來源清單；測試 `tools/t185.js`。
- 武器平衡、184 新版（186）：目標 `WP_TARGET`、錘與鐮刀 `W.splash`、`SK_NAMES`／`skName`／`skNameShow`（`state.skSeen`）、`SK_DESC`／`skCardShow`（長按）、星星 `weapons[i].st`／`WP_SHAPES`／`STAR_FX`／`wpStat`／`skStarK`；`tools/sim184.js` 跑真的 `wpnFire`／`skCast`（186 補：合格線 `LIMIT` ±15%，結果 `tools/sim186b_20p.txt`）、測試 `tools/t186.js`。
- 畫面按鈕重排（188）：位置都在 `<style>` 最後的「188」區塊（`body.h188`、`--h188-*` 變數）、`hud188()`（選單搬進 `#rbar`、回家／幫忙照顧搬進 `#ctxBar`）、`MENU` 加朋友／圖鑑／布置、`renderFrDot` 紅點在選單；`#hpBar` 所有場景都顯示；檢查 `tools/layout188.js`。**之後加按鈕要照 188 的位置表排**。
- 連擊數（187）：`comboHit`（在 `monHit`／`bossDealt`，神之子不算）、`COMBO_GAP`、`comboTick`／`comboReset`、`#combo`（`comboPaint`）、`state.comboMax`、`comboNow()`、`onCombo(n,t)`（`COMBO_FNS`）；測試 `tools/t187.js`。
- 武器技能、翻滾（184）：表 `SKILLS`／`SK_ROLL`、`skDef`／`skV`／`skDmg`、`skCast`→`SK_DO[招式]`＋特效 `skFx[招式]`（之後換圖只改這裡）、`skAim`／`skTs`／`skIn`／`skInRect`／`skShove`／`skStun`／`skMove`／`skBlink`、`skRoll`、冷卻 `SKC`、狀態 `SKB`（不存檔）、受傷 `skHurt`（`pDamage(n,src)`）、普通攻擊掛鉤 `skIv`／`skPreAtk`／`skPostAtk`／`skSat`（`c3Wpn` 第 4 參數）、`skTick`、子彈 `sb`／`pt`（`wpnStep`）、按鈕 `#skBar`（`skBar`／`skPaint`、`SK_GLYPH`）、同步 `pushPos` 的 `sk`／`skRemote`、主僕 `b.stun`；測試模式武器階 `data-tool="wtier"`；模擬 `tools/sim184.js`、測試 `tools/t184.js`。
- 第一位神之子、轉生的夢（183）：`state.anchor`（`mq2First`）、夢 `dreamNeed`／`dreamOpen`／`dreamAfter`（`#dream`、`DREAM_L`）、1-5 `altWho`／`mq2FirstBody`（`FIRST_L`）、`state.cropEarly`（`cropKept`）、清單 `altL(k)`（取代 `ALT_LIST[k]`；番茄第二份 `ALT_LIST.tomato2`、`altObj('tomato').l2`）；主線 17 步（2-5、2-6、3-5、3-6 拿掉），神之子類任務 `FYQ`／`fyqTick`（`state.fyq`，kind `fyq`）；遷移 `m183`（旗標 `mq183V`）；測試 `tools/t183.js`。
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

第 1～134 節中沒有列在下面的，都已完成，原文與實作紀錄在 `docs/規格存檔.md`（第 70、75、107 節沒有這一節；第 102 節已取消）。

| 節 | 名稱 | 狀態 | 檔案；備註 |
| --- | --- | --- | --- |
| 0 | 接手者必讀 | 保留 | CLAUDE.md |
| 1 | 專案概況 | 保留 | CLAUDE.md |
| 2 | 技術架構 | 保留 | CLAUDE.md |
| 3 | 資料模型 | 保留 | CLAUDE.md |
| 4 | 遺傳規則 | 保留 | CLAUDE.md |
| 9 | 主要系統 | 紀錄 | docs/規格存檔.md；各版本的實作紀錄（程式地圖濃縮在 CLAUDE.md） |
| 10 | 版本歷程 | 紀錄 | docs/規格存檔.md；各 BUILD 改了什麼 |
| 11 | 設計原則 | 保留 | CLAUDE.md |
| 12 | 已確定不做 | 保留 | CLAUDE.md |
| 14 | 後續規劃 | 未定案 | docs/待實作/第14節.md；第五、六版規劃（多已由 28–33 取代）；「延後評估」4 項未定案 |
| 15 | 測試方法 | 保留 | CLAUDE.md |
| 16 | 與使用者溝通的習慣 | 保留 | CLAUDE.md |
| 17 | 2026-11-14 設計討論紀錄 | 紀錄 | docs/規格存檔.md；討論紀錄；多數已由後續各節取代 |
| 18 | 畫風規範 | 紀錄 | docs/規格存檔.md；畫風規範（做素材時查） |
| 19 | 標本機制與服裝 | 未定案 | docs/待實作/第19節.md；19.0 已做（14i）；19.3／19.4 布料、服裝、製作費用、正式名額還要討論 |
| 23 | 待辦總表 | 紀錄 | docs/規格存檔.md；舊的待辦總表，已由本索引表取代 |
| 59 | 茄科果實的辨識度 | 已完成 | docs/規格存檔.md；番茄細萼片要等使用者看 iPhone |
| 69 | 採集、素材 | 未定案 | 還沒有規格檔（第 91.5 節會用到） |
| 73 | 專屬造型換新：火山、球棒、炸彈、萬聖節南瓜 | 已完成 | docs/規格存檔.md；73.4 萬聖節活動未定案（在規格存檔） |
| 82 | 櫻花區 | 已完成 | docs/規格存檔.md；82.6 秘境、謎語 NPC、抽籤繪馬未定案（在規格存檔） |
| 91 | 全服稀有植株「發光的植株」 | 已完成 | docs/規格存檔.md；91.5 等第 69 節；規則要貼 Firebase |
| 108 | 立體化改版 | 未做 | docs/待實作/第108節.md；草原 5 張已做（17x、17y，見規格存檔 9.104、9.105）；其他地區、農場、城鎮還沒做 |
| 109 | 3D 草原試玩回報修正 | 已完成 | docs/規格存檔.md；17z（9.106）；黑塊、頭閃的原因是推測，等 iPhone 確認 |
| 120 | 修正：十級一區、支線「失落的種子庫」的結尾、新手前三株加速 | 已完成 | docs/規格存檔.md；18k（9.117）；探險家大衣之後補發（`coatDue`）；沒測 iPhone |
| 131 | 戰鬥改版第一步：血量、怪物會還手、小補血藥、打怪經驗、白樺林與潟湖的素材 | 已完成 | docs/規格存檔.md；18z（9.132）；打怪經驗先 0（使用者）；怪物仍是各人各自的；**要請使用者 iPhone 實機試邊走邊打邊躲**；沒有截圖 |
| 133 | 任務的指引、「可以完成了」的提示、提醒（擴到所有任務） | 已完成 | docs/規格存檔.md；18y（9.131）；難判斷的四類列在 9.131；**要請使用者在 iPhone 上看那一行和箭頭**；沒有截圖 |
| 135 | 主、主的僕人、精魄、神寵：九隻主的現身條件、重生、掉落、神寵三階段 | 進行中 | docs/待實作/第135節.md；第一、二階段已做（19b、19d）；後六區、27 個神寵技能未做；135.13 巴絲打法已定未做；要兩支手機實測 |
| 136 | 冰封種子庫的由來（門禁卡、館藏重開、古老的種子） | 未做（設計定案） | docs/待實作/第136節.md；跟晶霜雪原那一章一起做 |
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
| 157 | 升級獎勵改版：道具包、地區套裝配方 | 已完成 | docs/規格存檔.md；19t（9.156）；中、大補血藥 19v 起直接給（第 160 節），重鑄石跳過；配方素材列在 9.156（19u 使用者改了草原、森林、沙漠）；服裝圖還沒有，先「準備中」；沒有截圖、沒測 iPhone |
| 158 | 等級成長、野外鏡頭、影子 | 已完成 | docs/規格存檔.md；19u（9.157）；Lv 40 攻擊 3,075／血量 2,856、Lv 80 攻擊 10,030／血量 8,619；有截圖；沒測 iPhone |
| 159 | 武器接進戰鬥（第一版） | 已完成 | docs/規格存檔.md；19v（9.158）；素材替代、雙刀一張圖、鐮刀和劍差不多強都列在 9.158 等使用者確認；手的位置固定偏移等看截圖；有截圖；沒測 iPhone |
| 160 | 中、大補血藥 | 已完成 | docs/規格存檔.md；19v（9.159）；苔殼的怪不在地圖上，中補血藥也收苔岩根；沒有截圖、沒測 iPhone |
| 161 | 掉落物撿取、傷害數字放大 | 已完成 | docs/規格存檔.md；19w（9.160）；主、僕人的素材和金幣也掉地上，精魄、卡包、種子照舊直接給；有截圖；沒測 iPhone |
| 162 | 秘境的僕人下來空地打 | 已完成 | docs/規格存檔.md；19w（9.161）；潟湖秘境沒有半徑 120 的空地，用 80；潟湖的主照舊在水上；有截圖；沒測 iPhone |
| 163 | 劇情對話改版：視覺小說式對話、劇情演出 | 已完成 | docs/規格存檔.md；19w（9.162）；背景音樂沒做（沒有音樂系統）；立繪還沒有圖，先用替代圖（裁切表在 9.162）；有截圖；沒測 iPhone |
| 164 | 鏡頭、神之子大小、被怪物蓋住 | 已完成 | docs/規格存檔.md；19w（9.163）；有截圖；沒測 iPhone |
| 165 | 新版角色的正面、背面走路 | 未做 | docs/待實作/第165節.md |
| 166 | 武器平衡第一次調整、平常背著武器 | 已完成 | docs/規格存檔.md；19w（9.164）、19x 修正（9.166：被打的怪以 0.85 倍追、放棄距離 400；背武器 60°、錘槍朝上）；新版角色男女截圖；沒測 iPhone |
| 167 | 神之子新圖（三階段）、固定配色、果實顏色改成光芒顏色 | 已完成 | docs/規格存檔.md；19y（9.167）；跟隨大小照 164 ×1.0（使用者）；喚醒選色也改「光芒顏色」；有截圖；沒測 iPhone |
| 168 | 別人也看得到新版主角（補第 156 節） | 已完成 | docs/規格存檔.md；19z（9.168）；Firestore 不用改、RTDB presence 規則不在 repo（照 w、fy 的經驗應該不用改，9.168 附上萬一要加的那段）；互看截圖用假的其他玩家；沒測多人連線、iPhone |
| 169 | 神之子的背面（補第 167 節） | 已完成 | docs/規格存檔.md；19z（9.169）；朝上先用正上方（165 還沒做）；順便修省電時換不到圖、換階段用錯圖；有截圖；沒測 iPhone |
| 170 | 神之子的普通攻擊（要同步給別人看）；170 補：演出加強 | 已完成 | docs/規格存檔.md；20a（9.170）；傷害佔比：喚醒約 6%、神化 14～18%；有出手截圖、互看要兩個帳號沒拍；沒測 iPhone、多人連線；170 補 20b（9.171），九隻的畫面使用者自己進遊戲看（不截圖） |
| 171 | 分層人物（3D 拍成 2D）：換裝、動作、武器拿在手上 | 已完成 | docs/規格存檔.md；20d（9.174）；參考實作移到 docs/規格存檔_附件/；法杖在左前方被身體擋住、握角等聊天室調；總覽截圖（在頁面裡畫）；沒測 iPhone 掉幀 |
| 172 | 主、僕人改成同一張地圖只有一隻、大家一起打 | 已完成 | docs/規格存檔.md；20c（9.172）；**規則 `tools/rtdb_rules_172.txt` 要使用者自己貼**；2 人 5 分鐘約 4,800 次寫入、320 KB；沒測兩台手機、iPhone |
| 173 | 組隊邀請 | 已完成 | docs/規格存檔.md；20d（9.175）；**規則 `tools/rtdb_rules_173.txt`（含 172）要使用者自己貼**；4 人掛 10 分鐘約 7 次寫入；沒測兩台手機 |
| 174 | 主、僕人的掉落物撿不到（使用者回報，先修） | 已完成 | docs/規格存檔.md；20d（9.173）；原因：秘境沒有一般怪、monLoop 不跑、dropTick 跑不到；有截圖 |
| 175 | 左邊的任務提示可以收合 | 已完成 | docs/規格存檔.md；20f（9.177）；紅點是改 `mqSig` 觸發測的；有截圖；沒測 iPhone |
| 176 | 新版人物的三個修正（素材換新、不先閃舊人物、頭像和名片） | 已完成 | docs/規格存檔.md；20e（9.176）；朋友名單本來就沒有角色縮圖；有截圖；沒測 iPhone |
| 177 | 打扮功能：正式素材（女 6 套、男 3 套）、新的素材格式、打扮面板 | 已完成 | docs/規格存檔.md；20g（9.178）；髮型預設髮色拿來用；地圖上各套拍成合併的兩張、互看用假玩家；舊測試素材已刪；沒測 iPhone、兩台手機 |
| 178 | 邊走邊攻擊、劈砍加深、浮游砲重複、人物變白 | 已完成 | docs/規格存檔.md；20h（9.179）；變白是 164 的剪影濾鏡；每幀耗時只量到 JS（窗格在背景），要請使用者 iPhone 開 ?perf=1 看；有截圖；沒測 iPhone |
| 179 | 舊武器畫法全部拿掉、遠程攻擊從武器射出 | 已完成 | docs/規格存檔.md；20i（9.180）；槍改取離握點最遠的像素（base 是握把方向）、高階圖換框內比例；**沒有截圖**（Browser 窗格卡住）；沒測 iPhone、兩台手機 |
| 180 | 打扮面板改版：縮圖只放單品、版面好操作 | 已完成 | docs/規格存檔.md；20j（9.181）；選髮型不再換成預設髮色（和 177 不同）；**沒有截圖**（Browser 窗格卡住）；沒測 iPhone |
| 181 | 撿起按鈕改版；神之子攻擊、雙色特效的問題先查 | 已完成 | docs/規格存檔.md；20k（9.182）；90～120 之間按了會走過去（規格沒寫）、「自動撿取」設定拿掉；181.2 只查：怪方塊是麥斯 `corn_2_c`／`corn_3_c` 圖裡的全息方塊、28 張圖光效碰到畫布邊；**沒有遊戲截圖**（Browser 窗格卡住）；沒測 iPhone |
| 182 | 整理 CLAUDE.md：刪掉過時、被取代的內容 | 已完成 | 只改 CLAUDE.md；照 182.4 沒有動 `docs/規格存檔.md`、`docs/待實作/`（`第182節.md` 還在） |
| 183 | 第一位神之子自己選：轉生的夢；主線不再發神之子 | 已完成 | docs/規格存檔.md；20l（9.183）；神之子類任務放在「故事」分頁、2-4／3-4 獎勵是加上去；**沒有截圖**；沒測 iPhone |
| 184 | 武器技能（每把 2 招＋覺醒）、翻滾閃避 | 已完成 | docs/規格存檔.md；20m（9.184）；**±15% 只調技能倍率做不到（差在普通攻擊），倍率照起始值，等使用者決定**；主沒有 ult 狀態（改看長蓄力）；測試模式武器階之後拿掉；沒有截圖；沒測 iPhone、兩台手機 |
| 185 | 素材的取得提示（楓之谷式） | 已完成 | docs/規格存檔.md；20n（9.185）；遊戲沒有怪物資訊畫面，「會掉：」放在來源卡；8 種舊怪素材沒有來源；沒有截圖；沒測 iPhone |
| 186 | 武器平衡照定位重調；第 184 節補成新版 | 已完成 | docs/規格存檔.md；20o（9.186）；186 補 20p（9.187）：合格線 ±15%，5／54 格超出（雙刀、斧），之後照試玩改；鐮刀也加 splash；技能改放開才放（長按看說明）；沒有截圖；沒測 iPhone |
| 187 | 連擊數；三隻主的現身條件改版 | 已完成 | docs/規格存檔.md；20p（9.188）；187.2 只改第 135 節文件；100 連擊用粉紅；沒有截圖；沒測 iPhone |
| 188 | 畫面按鈕整體重排：功能鍵固定在左邊、戰鬥鍵弧形在右下 | 已完成 | docs/規格存檔.md；20q（9.189）；樣稿移到 docs/規格存檔_附件/；主僕血條上 110、地名放地圖按鈕左邊（規格沒寫）；照數字算沒有重疊（`tools/layout188.js`）；**沒有截圖**；沒測 iPhone |
