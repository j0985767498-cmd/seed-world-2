27. 新地區地圖：草原、森林、沙漠、濕地（2026-11-14 確定方向，尚未實作）

把雪原原型（9.12）的做法推廣到其他四個地區，取代它們目前的無限方塊（exChunk／exItems／exPlants）。地圖大小、資料格式、碰撞、遮擋、刷新點、切換、多人同步、小地圖全部沿用 9.12；本節只寫要改的通用化與各地區內容。

27.1 先通用化（雪原外觀不得改變）
- `SNOW_MAPS` → `REGION_MAPS[biome][id]`；`SNOW_ART`、`SNOW_IMG` → 依地區分表（`REGION_ART[biome]`），素材路徑 `assets/<biome>/`。函式改名或包一層通用版（regionEnter／regionGo／regionPlants／regionItems／regionMapSVG…），雪原改用通用版後必須和 14j 完全一樣（用 vm 比對雪原 7 張圖的物件、出口、刷新點）。
- 每個地區的設定 `REGION_CFG[biome]={name, ground, groundSpots, edgeTree, edgeBush, weather, caveGround, caveWall}`：地面色、邊界自動排的樹與灌木（草原 round_tree／flower_bush、森林 pine／mossy_bush、沙漠 saguaro／tumbleweed、濕地 willow／cattails）、天氣（沿用 setWeather 既有效果）。
- 水面由程式畫：沿用 `lakes`（橢圓），新增 `rivers:[[x0,y0,x1,y1,…],寬]`（折線帶狀水面，擋路）。橋、木棧道、踏腳石放在 `walks`（可走，優先於擋路）。
- 地面色（低對比，物件底下的小草皮要融入）：草原 #A8C478、森林 #8CAA69、沙漠 #DEC896、濕地 #96AF78（水 #8FB8B0）。洞內：暗色地面＋程式畫的洞壁，顏色依地區（神殿砂岩、樹洞木頭、隧道泥土）。
- 物件顯示高度原則：大樹 140–180、一般樹 110–140、建築與地標 120–160、灌木與岩石 50–80、小植物與小物 35–55、告示牌 80。`REGION_ART` 裡每個物件填 [檔名, 顯示高度, 碰撞寬, 碰撞高]，碰撞只算底部、比圖略小。
- 告示牌 `signpost` 由程式寫地名（每區各有一張，檔名都叫 signpost.png，放在各自資料夾）。
- 每張圖 1–3 個道具點、2–4 個植株點；好東西放在死路角落或繞路才到的地方。珍稀種原比例：室外 8%、洞內 10%、洞最深處 15%（同雪原）。
- 地區特色（第 7 節）維持：草原常見黃色；森林黑色只在這裡；沙漠第 1、2 種基本造型多、常見迷你；濕地常巨大、特殊造型最多。

27.2 草原（5 張，無洞穴）
| id | 地名 | 重點 | 出口 |
| --- | --- | --- | --- |
| entry | 草原入口 | 告示牌、haystack、幾棵 round_tree | 南→農場；北→野花坡；東→小河邊 |
| meadow | 野花坡 | 大片 wildflowers、tall_grass、mushroom_ring 點綴，oak 當地標 | 南→入口；東→山丘 |
| river | 小河邊 | 一條斜向小河（rivers）擋路，bridge 過河，也可從下游繞；log、fence | 西→入口；北→山丘；東→古井遺跡 |
| hill | 山丘 | 中間一道 cliff，只能走 stairs 上去；上方平台放 boulder 與植株點（觀景點） | 西→野花坡；南→小河邊 |
| old_well | 古井遺跡 | well、stone_arch、stump_house（小樹屋只當地標）；死路角落放道具 | 西→小河邊 |

27.3 森林（6 張＋樹洞 1 張）
| id | 地名 | 重點 | 出口 |
| --- | --- | --- | --- |
| entry | 森林入口 | 告示牌、pine、fern | 南→農場；北→松林小徑 |
| pine_path | 松林小徑 | 兩排 pine 樹牆做 Z 字走廊，bramble 擋住捷徑 | 南→入口；東→青苔谷；北→石祠 |
| glen | 青苔谷 | waterfall 在上方、下方程式畫小池（lakes）、mossy_rocks、mossy_log、plank_bridge 過溪 | 西→松林小徑；北→獵人小屋 |
| shrine | 石祠 | shrine、stone_circle、purple_tree（紫葉樹只長在這張附近） | 南→松林小徑；東→獵人小屋；北→神木 |
| cabin | 獵人小屋 | cabin 地標、root_arch 當通道（可走過） | 西→石祠；南→青苔谷 |
| giant_tree | 神木 | giant_tree 地標，樹洞是入口（door）；old_tree、red_mushrooms | 南→石祠；樹洞→樹洞內 |
| hollow | 樹洞內（洞內） | 木頭色地面與洞壁、glow_mushrooms 照明（加柔和光暈）、mossy_rocks 擋路；最深處珍稀 15% | 出口→神木 |

27.4 沙漠（6 張＋神殿 2 張）
| id | 地名 | 重點 | 出口 |
| --- | --- | --- | --- |
| entry | 沙漠入口 | 告示牌、saguaro、tent（旅人帳篷當地標） | 南→農場；北→沙丘；東→仙人掌田 |
| dunes | 沙丘 | sand_dune 排成迷宮式走廊，tumbleweed 點綴 | 南→入口；北→峽谷 |
| cactus | 仙人掌田 | barrel_cactus、prickly_pear、succulents，wagon 半埋在沙裡 | 西→入口；北→綠洲 |
| oasis | 綠洲 | oasis 地標＋程式畫的大一點水面、palm；植株點多 | 南→仙人掌田；西→峽谷 |
| canyon | 峽谷 | 兩側 sand_cliff，中間程式畫的深溝擋路，rope_bridge 過溝；sand_stairs 上平台 | 南→沙丘；東→綠洲；北→遺跡 |
| ruins | 遺跡 | ruins 柱子群、sand_arch（可走過）、temple 地標，神殿門口是入口（door） | 南→峽谷；門→神殿 |
| temple1 | 神殿（洞內） | 砂岩色地面與牆、ruins 柱子與 sandstone_rock 擋路 | 南→遺跡；北→神殿深處 |
| temple2 | 神殿深處（洞內） | 最深處只放植株點與道具點，珍稀 15% | 南→神殿 |

27.5 濕地（6 張＋隧道 1 張）
| id | 地名 | 重點 | 出口 |
| --- | --- | --- | --- |
| entry | 濕地入口 | 告示牌、willow、cattails | 南→農場；北→蘆葦沼；東→蓮花池 |
| marsh | 蘆葦沼 | 大片程式畫的淺水擋路，boardwalk 連成步道；reed_fence、cattails | 南→入口；北→高腳屋聚落 |
| lotus | 蓮花池 | 大池（lakes）中間 giant_lotus 地標、lily_pads，stepping_stones 走過去 | 西→入口；北→青蛙石像 |
| village | 高腳屋聚落 | stilt_hut 地標、stone_lantern（暖光，加柔和光暈）、sunken_boat | 南→蘆葦沼；東→青蛙石像 |
| frog | 青蛙石像 | frog_statue 地標、muddy_boulder、mossy_stump、elephant_ear | 西→高腳屋聚落；南→蓮花池；北→倒木 |
| log | 倒木 | swamp_tree、mossy_log，log_tunnel 洞口是入口（door） | 南→青蛙石像；洞口→隧道 |
| tunnel | 倒木隧道（洞內） | 泥土色地面與木頭洞壁、小蘑菇照明；最深處珍稀 15% | 出口→倒木 |
- 濕地天氣沿用霧 2 層＋螢火蟲。

27.6 檢查
- 每完成一個地區，產生 `tools/region_<biome>.html`（不放進遊戲）：把該地區所有地圖縮小排在一起，標出出口連線、可走範圍、碰撞框、植株點與道具點，讓使用者一眼看完整個地區；另附一張「角色＋植株＋物件」實際比例的截圖區。
- vm 測試：每張圖的出口都互相指向（A→B 必有 B→A）；所有出口、抵達點不在擋路範圍內；每張圖從入口都走得到（格子 BFS）；刷新點同一天全服一致。
- 使用者在 iPhone 實測：走一圈、過橋與石階、進出洞、撞牆滑開、前景遮擋。

27.7 順序
1. 27.1 通用化（雪原不變）→ 2. 草原 → 3. 森林 → 4. 沙漠 → 5. 濕地。
每一步 commit、push、iPhone 測試後再做下一個；某地區做好後，該地區的舊無限方塊停用（程式保留，不刪）。
