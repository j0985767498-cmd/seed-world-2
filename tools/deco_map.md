# 裝飾對照表（第 31.7 節，2026-11-15）

用途：31.7 第 1 步「舊裝飾 → 新素材」對照表，**使用者確認後才改程式**。

- 鍵名不變，玩家已擺好的裝飾位置不動。
- 圖片以底部中央對齊地面座標，影子由程式畫（18.5、18.6）。
- 顯示高度照 27.1：大型物 120–160、一般 50–80、小物 35–55。這裡的數字是建議值，做完會在對照頁和角色、植株並排再調。
- 圍籬類對齊現有圍籬鋪設的 44×12 格線：顯示高度是讓圖寬約 46（左右相接稍微重疊），所以看起來比較矮。
- 素材原圖約 160–300px 高；有幾張超過 100 KB（hand_cart 149、farmhouse 143、greenhouse 138、koi_pond 138、table_chairs 138、seed_stall 136、crates 131、compost 129、barn 125、beehives 123、hay_bales 123、entrance_gate 122），做的時候會另存縮小版（顯示高度約 2 倍），原圖不動。

## 一、舊裝飾 → 新素材（34 種）

| 舊鍵名 | 舊名稱 | 新素材路徑 | 建議顯示高度 | 備註 |
| --- | --- | --- | --- | --- |
| fence | 木柵欄 | assets/farm/fence_wood.png | 25 | 圍籬格線 44×12 |
| picket | 白色籬笆 | assets/farm/fence_picket.png | 25 | 圍籬格線 |
| stonewall | 石牆 | assets/farm/stone_wall.png | 20 | 圍籬格線 |
| hedge | 樹籬 | assets/farm/hedge.png | 21 | 圍籬格線 |
| stone | 石板路 | （程式畫） | — | 地面類，照 18.3 由程式畫，顏色改低彩度配合草地 #A8C478 |
| gravel | 碎石路 | （程式畫） | — | 同上 |
| deck | 木棧道 | （程式畫） | — | 同上 |
| lawn | 草皮 | （程式畫） | — | 同上 |
| tile | 花磚 | （程式畫） | — | 同上 |
| bed | 花圃 | assets/farm/flower_bed.png | 45 | |
| tree | 小樹 | assets/farm/tree.png | 110 | 輕微晃動 |
| bush | 灌木 | assets/farm/bush.png | 50 | 輕微晃動 |
| pot | 盆栽 | assets/farm/potted_flower.png | 42 | 單盆 |
| arch | 藤蔓拱門 | assets/farm/rose_arch.png | 110 | 不擋路 |
| lamp | 路燈 | assets/farm/lamp_post.png | 95 | 燈頭柔和光暈 |
| lantern | 燈籠 | assets/farm/hanging_lantern.png | 60 | 柔和光暈 |
| lights | 串燈 | assets/farm/string_lights.png | 70 | 柔和光暈 |
| fire | 營火 | assets/farm/campfire.png | 42 | 柔和光暈 |
| bench | 長椅 | assets/farm/bench.png | 45 | |
| picnic | 野餐桌 | assets/farm/picnic_table.png | 55 | |
| parasol | 遮陽傘 | assets/farm/parasol_table.png | 80 | |
| swing | 鞦韆 | assets/farm/swing.png | 85 | |
| scarecrow | 稻草人 | assets/farm/scarecrow.png | 85 | |
| well | 水井 | assets/grass/well.png | 110 | 農場素材裡沒有水井，借用草原素材（直接引用原路徑，不複製） |
| cart | 木推車 | assets/farm/hand_cart.png | 60 | |
| rack | 工具架 | assets/farm/tool_rack.png | 75 | |
| greenhouse | 溫室 | assets/farm/greenhouse.png | 140 | |
| sign | 大告示牌 | assets/farm/sign_large.png | 75 | 告示牌上的字照舊由程式寫 |
| signS | 小告示牌 | assets/farm/sign_small.png | 55 | 字由程式寫 |
| flag | 旗幟 | assets/farm/flag.png | 90 | |
| mailbox | 信箱 | assets/farm/mailbox.png | 55 | |
| pond | 小池塘 | assets/farm/pond.png | 70 | 舊版畫在地面層，照舊 |
| fountain | 噴泉 | assets/farm/fountain.png | 90 | |
| bridge | 石橋 | assets/farm/stone_bridge.png | 70 | |

結果：34 種舊裝飾中 29 種換成圖片，5 種地面類照舊由程式畫（只改顏色）。沒有找不到素材的舊裝飾。

## 二、準備新增的素材（39 個）

`assets/farm/` 共 68 個檔：扣掉 `soil_patch`（田地，不當裝飾）和上表用掉的 28 個，剩下 39 個。之前口頭回報寫成 38 個，少算了一個，正確是 39 個。

**價格：程式裡目前所有裝飾都免費**（放置時只檢查最多 400 個，沒有扣金幣），所以「比照同類」的話全部是 0。下表的建議價格是**假如之後裝飾開始收費**的參考值（依大小與用途分級），要不要收費請使用者決定。

| 素材路徑 | 建議名稱 | 分類 | 建議顯示高度 | 建議價格（現行：免費） | 備註 |
| --- | --- | --- | --- | --- | --- |
| assets/farm/bamboo_fence.png | 竹籬笆 | 圍籬 | 29 | 5／格 | 圍籬格線 |
| assets/farm/garden_gate.png | 庭園門 | 圍籬 | 40 | 15 | 放在圍籬中間當門，不擋路 |
| assets/farm/apple_tree.png | 蘋果樹 | 植栽 | 130 | 40 | 輕微晃動 |
| assets/farm/cherry_tree.png | 櫻花樹 | 植栽 | 130 | 40 | 輕微晃動 |
| assets/farm/maple_tree.png | 楓樹 | 植栽 | 130 | 40 | 輕微晃動 |
| assets/farm/lavender.png | 薰衣草 | 植栽 | 40 | 10 | |
| assets/farm/sunflowers.png | 向日葵 | 植栽 | 60 | 10 | |
| assets/farm/pampas_grass.png | 芒草 | 植栽 | 55 | 10 | 輕微晃動 |
| assets/farm/mushrooms.png | 蘑菇 | 植栽 | 35 | 8 | |
| assets/farm/flower_shelf.png | 花架 | 植栽 | 70 | 25 | |
| assets/farm/flower_pots.png | 盆花組 | 植栽 | 50 | 15 | |
| assets/farm/stone_lantern.png | 石燈籠 | 照明 | 60 | 25 | 柔和光暈 |
| assets/farm/firefly_jar.png | 螢火蟲罐 | 照明 | 38 | 20 | 柔和光暈 |
| assets/farm/hammock.png | 吊床 | 家具 | 70 | 40 | |
| assets/farm/rocking_chair.png | 搖椅 | 家具 | 55 | 30 | |
| assets/farm/table_chairs.png | 桌椅組 | 家具 | 60 | 35 | |
| assets/farm/barn.png | 穀倉 | 設施 | 160 | 400 | 大型建築 |
| assets/farm/farmhouse.png | 農舍 | 設施 | 160 | 400 | 大型建築 |
| assets/farm/chicken_coop.png | 雞舍 | 設施 | 120 | 250 | |
| assets/farm/tool_shed.png | 工具棚 | 設施 | 120 | 200 | |
| assets/farm/water_tower.png | 水塔 | 設施 | 150 | 250 | |
| assets/farm/windmill.png | 風車 | 設施 | 160 | 350 | |
| assets/farm/beehives.png | 蜂箱 | 設施 | 65 | 60 | |
| assets/farm/birdhouse.png | 鳥屋 | 設施 | 75 | 30 | |
| assets/farm/compost.png | 堆肥箱 | 設施 | 60 | 30 | |
| assets/farm/seed_chest.png | 種子箱 | 設施 | 55 | 30 | |
| assets/farm/seed_stall.png | 種子攤 | 設施 | 100 | 120 | |
| assets/farm/crates.png | 木箱 | 設施 | 50 | 15 | |
| assets/farm/barrel.png | 木桶 | 設施 | 50 | 15 | |
| assets/farm/rain_barrel.png | 雨水桶 | 設施 | 60 | 25 | |
| assets/farm/water_trough.png | 水槽 | 設施 | 45 | 25 | |
| assets/farm/hay_bales.png | 乾草堆 | 設施 | 55 | 20 | |
| assets/farm/wheelbarrow.png | 手推車 | 設施 | 50 | 25 | 和舊的「木推車」（hand_cart）不同 |
| assets/farm/entrance_gate.png | 農場大門 | 標示 | 130 | 150 | 純裝飾，不取代真正的大門 |
| assets/farm/signpost_arrows.png | 指路牌 | 標示 | 80 | 20 | |
| assets/farm/notice_board.png | 公布欄 | 標示 | 80 | 30 | |
| assets/farm/koi_pond.png | 錦鯉池 | 水景 | 75 | 150 | 畫在地面層 |
| assets/farm/dock.png | 碼頭 | 水景 | 60 | 80 | |
| assets/farm/stepping_stones.png | 踏腳石 | 地面 | 30 | 5 | 畫在地面層 |
