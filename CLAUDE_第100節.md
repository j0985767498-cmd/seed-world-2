## 100. 加入主畫面（PWA）（2026-11-17 使用者同意試做）

狀態：可以實作。目的：iPhone「分享 → 加入主畫面」後有圖示、打開是全螢幕（沒有 Safari 網址列）。**更新流程完全不變**（照舊 push 到 GitHub Pages），不可以因為這節讓玩家卡在舊版。

### 100.1 要加的東西
- `manifest.json`：`name` 種子的世界、`short_name` 種子的世界、`display: standalone`、`orientation: portrait`、`start_url` 與 `scope` 用相對路徑 `./`（GitHub Pages 在子路徑下）、`background_color`／`theme_color` 用載入畫面（71.2）的底色。
- `index.html` 的 `<head>`：`<link rel="manifest">`、`apple-mobile-web-app-capable`、`apple-mobile-web-app-status-bar-style`（`black-translucent`）、`apple-mobile-web-app-title`、`apple-touch-icon`、`viewport-fit=cover`。
- 圖示：`assets/app/icon-180.png`、`icon-192.png`、`icon-512.png`（不透明底）。先用現有素材暫做（例如番茄果實或種子袋圖示放在淡綠底上），回報用了哪張；之後使用者可以另外生圖換掉。

### 100.2 更新不能變麻煩（重要）
- **不加會快取 index.html 的 service worker。** 如果需要 service worker，只能是 network-first 或只快取圖片；`index.html`、`version.json` 一律走網路。
- 71.3 的版本檢查（`version.json`、`cache:'no-store'`、不同就重整一次）在主畫面模式下照樣要有效；另外在 `visibilitychange` 回到前景、且離上次檢查超過 10 分鐘時再查一次（主畫面 App 常常整天不關，不會重新載入）。

### 100.3 全螢幕後的版面
- 沒有網址列後，上方會有瀏海、下方有 Home 條：HUD、右下圓盤、底部面板都要避開 `env(safe-area-inset-*)`。
- 98.2 的面板高度規則照用。
- 檢查：主畫面模式與一般 Safari 兩種都截圖回報（農場、地圖面板、道具行）。

### 100.4 給玩家的提示
- 設定頁加一行「把遊戲加到主畫面」：點了顯示簡短說明（iPhone：分享 → 加入主畫面；Android：選單 → 安裝應用程式）。已經是主畫面模式（`navigator.standalone` 或 `display-mode: standalone`）時不顯示。不主動跳視窗。
