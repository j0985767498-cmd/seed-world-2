# 人物參考圖提示詞（新畫法用）

用途：照這些圖描出新畫法的零件（和 `char_front.png` 的做法一樣）。**只當描圖樣本，不放進遊戲。**

## 進度（2026-11-14）

已收到（存在 `assets/ref/v3/`）：
| 檔案 | 內容 |
| --- | --- |
| `v3_base_turn.png` | 基本角色：正、斜前、側、斜後、背、正面走路 |
| `v3_base_walk.png` | 走路：正面 2 步、側面 2 步、背面 2 步 |
| `v3_hair_01.png` | 長髮、馬尾、雙馬尾 |
| `v3_hair_02.png` | 捲髮、丸子頭、平頭 |
| `v3_hair_03.png` | 齊瀏海、鮑伯頭、刺蝟頭 |
| `v3_hair_05.png` | 半紮蝴蝶結、低側包頭、蓬鬆亂髮 |
| `v3_hair_19_20_21.png` | 中分、呆毛短髮、雙丸子 |
| `v3_hat_01.png` | 草帽、毛帽、鴨舌帽 |
| `v3_hat_10.png` | 毛絨耳罩（只有這一種） |

還缺：
- 髮型：旁分、波浪長髮、單側辮子、雙辮子、高馬尾瀏海、狼尾（髮型 4 那張，加上髮型 6、8 去掉已收到的）
- 表情：正面、側面兩張
- 帽子：貝雷帽、漁夫帽、寬邊遮陽帽、貓耳毛帽、報童帽、花圈
- 上衣、下身、鞋子、配件：全部

## 共同設定（每張都一樣）

- 模型：**GPT Image 2.6 Sunburst**（第 18.9 節，不要換）。
- 參考圖：上傳 `assets/ref/char_front.png`；能放多張就把 `char_side.png`、`char_back.png` 也放上去。
- 比例：照每張標的（全身用 2:3 直式，頭像用 1:1）。
- 存到 `assets/ref/v3/`，檔名照每張寫的。同一張可以多跑幾次，挑**三個方向最一致**的一張。
- 挑圖重點（重要性由高到低）：
  1. 每一列的正、側、背是**同一個造型**，大小一樣；
  2. 頭的大小、身體比例和 `char_front.png` 一樣；
  3. 側面一律**面向右邊**；
  4. 人物之間沒有重疊。
- 顏色不重要（遊戲會換色），但同一件東西要是**單一顏色**，不要漸層或花紋（條紋、格子由程式畫）。
- 某張跑不好（少一個方向、兩個造型黏在一起），就把那張改成只放 1–2 列再跑。

## 1. 基本角色（最重要，先做這兩張）

### 基本角色 5 方向
存檔名稱：`v3_base_turn.png`　比例：3:2

```
Character turnaround sheet, 3 columns x 2 rows, of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, with messy medium-brown short hair in pointed clumps, wearing green-and-cream striped short-sleeve t-shirt, blue denim overalls with rolled cuffs, brown boots. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view.
Row 1: left = front view, middle = three-quarter front view facing right, right = side view facing right.
Row 2: left = three-quarter back view facing right, middle = back view, right = front view walking with the left foot forward.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 走路姿勢
存檔名稱：`v3_base_walk.png`　比例：3:2

```
Walk cycle sheet, 3 columns x 2 rows, of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, with messy medium-brown short hair in pointed clumps, wearing green-and-cream striped short-sleeve t-shirt, blue denim overalls with rolled cuffs, brown boots. Every figure exactly the same size and scale, evenly spaced, not touching.
Row 1: left = front view, left foot forward, right arm forward; middle = front view, right foot forward, left arm forward; right = side view facing right, mid-stride, front leg forward.
Row 2: left = side view facing right, the other leg forward; middle = back view, left foot forward; right = back view, right foot forward.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

## 2. 髮型（每張 3 種 × 正、側、背）

只畫頭像（肩膀以上），頭髮一律中棕色。順序照遊戲裡的髮型順序；短髮已經有了。

### 髮型 1：長髮、馬尾、雙馬尾
存檔名稱：`v3_hair_01.png`　比例：1:1

```
Character turnaround sheet, 3 columns x 3 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Head and shoulders only (bust) of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, wearing the striped t-shirt collar. Hair color medium brown in every row.
Row 1: long straight hair reaching the middle of the back, side-swept bangs.
Row 2: single ponytail at the back of the head tied with a hair band, bangs.
Row 3: twin tails, two pigtails on both sides of the head.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 髮型 2：捲髮、丸子頭、平頭
存檔名稱：`v3_hair_02.png`　比例：1:1

```
Character turnaround sheet, 3 columns x 3 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Head and shoulders only (bust) of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, wearing the striped t-shirt collar. Hair color medium brown in every row.
Row 1: short fluffy curly hair.
Row 2: one round bun on top of the head.
Row 3: very short buzz cut.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 髮型 3：齊瀏海、鮑伯頭、刺蝟頭
存檔名稱：`v3_hair_03.png`　比例：1:1

```
Character turnaround sheet, 3 columns x 3 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Head and shoulders only (bust) of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, wearing the striped t-shirt collar. Hair color medium brown in every row.
Row 1: straight blunt-cut bangs with chin-length straight hair.
Row 2: rounded bob cut to the chin.
Row 3: spiky hair pointing upward.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 髮型 4：旁分、波浪長髮、單側辮子
存檔名稱：`v3_hair_04.png`　比例：1:1

```
Character turnaround sheet, 3 columns x 3 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Head and shoulders only (bust) of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, wearing the striped t-shirt collar. Hair color medium brown in every row.
Row 1: neat short hair with a side part.
Row 2: long wavy hair reaching the middle of the back.
Row 3: one braid hanging over one shoulder.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 髮型 5：半紮蝴蝶結、低側包頭、蓬鬆亂髮
存檔名稱：`v3_hair_05.png`　比例：1:1

```
Character turnaround sheet, 3 columns x 3 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Head and shoulders only (bust) of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, wearing the striped t-shirt collar. Hair color medium brown in every row.
Row 1: half-up hair tied with a small ribbon bow at the back, the rest hanging to the shoulders.
Row 2: one low bun at the side of the neck.
Row 3: big fluffy messy hair.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 髮型 6：及肩外翹、雙辮子、高馬尾瀏海
存檔名稱：`v3_hair_06.png`　比例：1:1

```
Character turnaround sheet, 3 columns x 3 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Head and shoulders only (bust) of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, wearing the striped t-shirt collar. Hair color medium brown in every row.
Row 1: shoulder-length hair with the ends flipped outward.
Row 2: two braids hanging down on both sides.
Row 3: high ponytail on the back of the head, with bangs.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 髮型 7：中分、呆毛短髮、雙丸子
存檔名稱：`v3_hair_07.png`　比例：1:1

```
Character turnaround sheet, 3 columns x 3 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Head and shoulders only (bust) of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, wearing the striped t-shirt collar. Hair color medium brown in every row.
Row 1: center-parted hair reaching the ears.
Row 2: short hair with one single strand sticking up on top.
Row 3: two round buns on the top left and top right of the head.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 髮型 8：狼尾
存檔名稱：`v3_hair_08.png`　比例：1:1

```
Character turnaround sheet, 3 columns x 1 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Head and shoulders only (bust) of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, wearing the striped t-shirt collar. Hair color medium brown in every row.
Row 1: wolf cut: short layered top, longer choppy layers at the back reaching the neck.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

## 3. 表情（12 種，正面一張、側面一張）

順序（由左到右、由上到下）：點點眼、笑眼、眨眼、驚訝、瞇眼、開心、大笑、害羞、鼓臉、哭哭、星星眼、想睡。

### 表情（正面）
存檔名稱：`v3_face_front.png`　比例：4:3

```
Expression sheet, 4 columns x 3 rows, 12 heads (head and shoulders only) of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, with messy medium-brown short hair in pointed clumps. All heads in front view, exactly the same size, evenly spaced, not touching. Only the facial expression changes, read left to right, top to bottom: 1. small vertical oval dot eyes, small closed smile. 2. eyes closed in happy upward arcs, smile. 3. winking, left eye closed, smile. 4. surprised, round eyes, small round open mouth. 5. squinting eyes as flat lines, calm smile. 6. dot eyes, open happy smiling mouth. 7. laughing, eyes closed, big open mouth. 8. shy, pink blushing cheeks, eyes looking aside, small wavy mouth. 9. pouting with puffed cheeks. 10. crying, tear drops, wobbly mouth. 11. sparkling star-shaped eyes, open smile. 12. sleepy half-closed eyes, small yawn.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 表情（側面）
存檔名稱：`v3_face_side.png`　比例：4:3

```
Expression sheet, 4 columns x 3 rows, 12 heads (head and shoulders only) of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, with messy medium-brown short hair in pointed clumps. All heads in side view facing right, exactly the same size, evenly spaced, not touching. Only the facial expression changes, read left to right, top to bottom: 1. small vertical oval dot eyes, small closed smile. 2. eyes closed in happy upward arcs, smile. 3. winking, left eye closed, smile. 4. surprised, round eyes, small round open mouth. 5. squinting eyes as flat lines, calm smile. 6. dot eyes, open happy smiling mouth. 7. laughing, eyes closed, big open mouth. 8. shy, pink blushing cheeks, eyes looking aside, small wavy mouth. 9. pouting with puffed cheeks. 10. crying, tear drops, wobbly mouth. 11. sparkling star-shaped eyes, open smile. 12. sleepy half-closed eyes, small yawn.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

## 4. 帽子（每張 3 種 × 正、側、背）

戴在預設短髮上；帽子用單一霧藍色（草帽、花圈例外）。

### 帽子 1：草帽、毛帽、鴨舌帽
存檔名稱：`v3_hat_01.png`　比例：1:1

```
Character turnaround sheet, 3 columns x 3 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Head and shoulders only (bust) of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, with messy medium-brown short hair in pointed clumps. Each hat in a single solid muted blue color unless stated.
Row 1: wearing a natural straw hat with a band.
Row 2: wearing a knitted beanie.
Row 3: wearing a baseball cap facing forward.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 帽子 2：貝雷帽、漁夫帽、寬邊遮陽帽
存檔名稱：`v3_hat_02.png`　比例：1:1

```
Character turnaround sheet, 3 columns x 3 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Head and shoulders only (bust) of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, with messy medium-brown short hair in pointed clumps. Each hat in a single solid muted blue color unless stated.
Row 1: wearing a beret tilted slightly.
Row 2: wearing a bucket hat.
Row 3: wearing a wide-brim sun hat with a ribbon band.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 帽子 3：貓耳毛帽、報童帽、花圈
存檔名稱：`v3_hat_03.png`　比例：1:1

```
Character turnaround sheet, 3 columns x 3 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Head and shoulders only (bust) of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, with messy medium-brown short hair in pointed clumps. Each hat in a single solid muted blue color unless stated.
Row 1: wearing a knitted beanie with two cat ears.
Row 2: wearing a newsboy cap.
Row 3: wearing a flower crown of small flowers.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 帽子 4：毛絨耳罩
存檔名稱：`v3_hat_04.png`　比例：1:1

```
Character turnaround sheet, 3 columns x 1 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Head and shoulders only (bust) of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, with messy medium-brown short hair in pointed clumps. Each hat in a single solid muted blue color unless stated.
Row 1: wearing a fluffy earmuffs with a headband.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

## 5. 上衣（每張 3 種 × 正、側、背，全身）

下身固定深灰長褲＋棕色靴子，頭髮固定預設短髮；上衣用單一霧藍色。吊帶褲已經有了。

### 上衣 1：T恤、條紋T、外套
存檔名稱：`v3_top_01.png`　比例：2:3

```
Character turnaround sheet, 3 columns x 3 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Full body of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, with messy medium-brown short hair in pointed clumps, wearing plain dark gray long pants and brown boots. The top is a single solid muted blue color unless stated.
Row 1: wearing a plain short-sleeve t-shirt.
Row 2: wearing a short-sleeve t-shirt with wide horizontal stripes in two colors.
Row 3: wearing a zip-up jacket, long sleeves.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 上衣 2：毛衣、帽T、格子襯衫
存檔名稱：`v3_top_02.png`　比例：2:3

```
Character turnaround sheet, 3 columns x 3 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Full body of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, with messy medium-brown short hair in pointed clumps, wearing plain dark gray long pants and brown boots. The top is a single solid muted blue color unless stated.
Row 1: wearing a crew-neck knitted sweater, long sleeves.
Row 2: wearing a hoodie with the hood down, long sleeves.
Row 3: wearing a collared button-up shirt, long sleeves, solid color (no plaid).
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 上衣 3：針織背心、羽絨外套、雨衣
存檔名稱：`v3_top_03.png`　比例：2:3

```
Character turnaround sheet, 3 columns x 3 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Full body of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, with messy medium-brown short hair in pointed clumps, wearing plain dark gray long pants and brown boots. The top is a single solid muted blue color unless stated.
Row 1: wearing a knitted vest over a cream collared shirt.
Row 2: wearing a puffy quilted down jacket.
Row 3: wearing a hooded raincoat reaching the knees, hood down.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 上衣 4：水手領上衣、開襟毛衣、細肩帶洋裝
存檔名稱：`v3_top_04.png`　比例：2:3

```
Character turnaround sheet, 3 columns x 3 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Full body of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, with messy medium-brown short hair in pointed clumps, wearing plain dark gray long pants and brown boots. The top is a single solid muted blue color unless stated.
Row 1: wearing a sailor collar top with a navy collar.
Row 2: wearing a open cardigan over a cream t-shirt.
Row 3: wearing a knee-length spaghetti strap sundress (no pants).
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 上衣 5：園藝圍裙
存檔名稱：`v3_top_05.png`　比例：2:3

```
Character turnaround sheet, 3 columns x 1 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Full body of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, with messy medium-brown short hair in pointed clumps, wearing plain dark gray long pants and brown boots. The top is a single solid muted blue color unless stated.
Row 1: wearing a gardening apron with a front pocket over a cream t-shirt.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

## 6. 下身（每張 3 種 × 正、側、背，全身）

上衣固定芥末黃 T 恤（紮進去），鞋子固定棕色靴子；下身用單一霧藍色。

### 下身 1：長褲、短褲、裙子
存檔名稱：`v3_bottom_01.png`　比例：2:3

```
Character turnaround sheet, 3 columns x 3 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Full body of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, with messy medium-brown short hair in pointed clumps, wearing a plain mustard yellow t-shirt tucked in and brown boots. The bottom is a single solid muted blue color.
Row 1: wearing plain long pants.
Row 2: wearing shorts above the knee.
Row 3: wearing a knee-length A-line skirt.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 下身 2：工裝褲、百褶裙、七分牛仔褲
存檔名稱：`v3_bottom_02.png`　比例：2:3

```
Character turnaround sheet, 3 columns x 3 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Full body of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, with messy medium-brown short hair in pointed clumps, wearing a plain mustard yellow t-shirt tucked in and brown boots. The bottom is a single solid muted blue color.
Row 1: wearing cargo pants with side pockets.
Row 2: wearing a pleated skirt.
Row 3: wearing cropped jeans with rolled-up cuffs at mid-calf.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 下身 3：吊帶裙
存檔名稱：`v3_bottom_03.png`　比例：2:3

```
Character turnaround sheet, 3 columns x 1 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Full body of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, with messy medium-brown short hair in pointed clumps, wearing a plain mustard yellow t-shirt tucked in and brown boots. The bottom is a single solid muted blue color.
Row 1: wearing a pinafore overall dress with straps.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

## 7. 鞋子（每張 2 種 × 正、側、背，只畫膝蓋以下）

靴子已經有了。

### 鞋子 1：布鞋、雨靴
存檔名稱：`v3_shoe_01.png`　比例：3:2

```
Character turnaround sheet, 3 columns x 2 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Close-up of the legs from the knees down of the same chibi kid, wearing plain dark gray long pants (hem at the ankle). Shoes in a single solid muted blue color.
Row 1: wearing low sneakers.
Row 2: wearing tall rain boots.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 鞋子 2：涼鞋、高筒帆布鞋
存檔名稱：`v3_shoe_02.png`　比例：3:2

```
Character turnaround sheet, 3 columns x 2 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Close-up of the legs from the knees down of the same chibi kid, wearing plain dark gray long pants (hem at the ankle). Shoes in a single solid muted blue color.
Row 1: wearing strappy sandals.
Row 2: wearing high-top canvas sneakers.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

## 8. 配件（每張 3 種 × 正、側、背，全身）

穿預設造型；配件用單一霧藍色（草籃、鐮刀照原本材質）。

### 配件 1：圍巾、眼鏡、背包
存檔名稱：`v3_acc_01.png`　比例：2:3

```
Character turnaround sheet, 3 columns x 3 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Full body of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, with messy medium-brown short hair in pointed clumps, wearing green-and-cream striped short-sleeve t-shirt, blue denim overalls with rolled cuffs, brown boots. The accessory is a single solid muted blue color unless stated.
Row 1: with a knitted scarf around the neck.
Row 2: with a pair of round glasses.
Row 3: with a backpack on the back.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 配件 2：花朵髮飾、草籃、鐮刀
存檔名稱：`v3_acc_02.png`　比例：2:3

```
Character turnaround sheet, 3 columns x 3 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Full body of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, with messy medium-brown short hair in pointed clumps, wearing green-and-cream striped short-sleeve t-shirt, blue denim overalls with rolled cuffs, brown boots. The accessory is a single solid muted blue color unless stated.
Row 1: with a flower hair clip on one side of the head.
Row 2: with a woven basket held in one hand.
Row 3: with a small sickle held in one hand.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

### 配件 3：斜背包、領巾、耳機
存檔名稱：`v3_acc_03.png`　比例：2:3

```
Character turnaround sheet, 3 columns x 3 rows. Every figure exactly the same size and scale, evenly spaced with plenty of empty space, not touching, standing straight, arms relaxed at the sides, same proportions in every view. In every row: left = front view, middle = side view facing right, right = back view.
Full body of the SAME chibi kid as the reference image: same face, same big head (about 2.6 heads tall), light peach skin, small vertical oval dot eyes, small smile, visible ears, with messy medium-brown short hair in pointed clumps, wearing green-and-cream striped short-sleeve t-shirt, blue denim overalls with rolled cuffs, brown boots. The accessory is a single solid muted blue color unless stated.
Row 1: with a small crossbody bag with a strap across the chest.
Row 2: with a neckerchief tied around the neck.
Row 3: with a pair of headphones resting around the neck.
flat vector cartoon style, thin dark brown outline, 2-tone cel shading, light from top-left, soft pastel colors, cute and simple, plain white background, no shadow, no text, no labels, no numbers
```

## 張數總表

| 類別 | 張數 | 順序 |
| --- | --- | --- |
| 基本角色（5 方向、走路） | 2 | 最先 |
| 髮型 | 8 | 2 |
| 表情 | 2 | 2 |
| 上衣 | 5 | 3 |
| 下身 | 3 | 3 |
| 帽子 | 4 | 4 |
| 鞋子 | 2 | 4 |
| 配件 | 3 | 4 |
| 合計 | 29 | |
