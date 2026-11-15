"""人物新畫法的頭（髮型）與帽子（第 35 節，15i）
用法：python tools/build_char_heads.py [--debug]
來源：assets/char/v3_base_turn.png（身體，用來對位）、v3_hair_*.png（髮型，每張 3 種 × 正、側、背）、v3_hat_01.png、v3_hat_10.png。
產生：assets/char/h/<髮型>_<f|s|b>.png（頭髮以外：臉、耳朵、外框、髮飾）、<髮型>_<f|s|b>_h.png（只有頭髮，遊戲裡換髮色）、
      hat<帽子>_<f|s|b>.png，以及 assets/char/av3_heads.js（位置資料 AV3H）。
做法（35.2）：
  1. 每張圖切出 9 個頭（物件偵測＋依位置排成 3×3）。
  2. 在領口切開：從底部的衣服往上找，第一個碰到皮膚或頭髮的地方是領口。領口以下只留頭髮與緊鄰頭髮的外框
     （長髮、馬尾會垂到肩膀前後；v3_hair_05 第 1 列殘留的條紋也因此清掉，36.6）。
  3. 大小：用正面兩眼間距對齊身體圖（base_eye / eye_span），同一列的側、背用同一個比例。
  4. 位置：頭的領口中心對齊身體圖該方向的領口中心。斜前用正面的頭、斜後用背面的頭。
  5. 頭髮像素（棕色系，排除膚色、腮紅、髮飾）另外存一張，遊戲照 26.2 的明暗公式換色。
需要：pip install pillow numpy scipy
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CH = os.path.join(ROOT, 'assets', 'char')
OUT = os.path.join(CH, 'h')
DEBUG = '--debug' in sys.argv
H_UNITS = 54.0
VIEWS = ['front', 'fq', 'side', 'bq', 'back']
HEAD_OF = {'front': 'f', 'fq': 'f', 'side': 's', 'bq': 'b', 'back': 'b'}
# 髮型編號（照 AV_OPT.hair）：每張圖由上到下 3 種
SHEETS = [('v3_hair_01', [1, 2, 3]), ('v3_hair_02', [4, 5, 6]), ('v3_hair_03', [7, 8, 9]),
          ('v3_hair_05', [13, 14, 15]), ('v3_hair_19_20_21', [19, 20, 21])]
HATS = [('v3_hat_01', [1, 2, 3]), ('v3_hat_10', [10])]   # 草帽、毛帽、鴨舌帽；毛絨耳罩

def load(name): return np.array(Image.open(os.path.join(CH, name + '.png')).convert('RGB')).astype(int)

def bg_mask(a):
    """背景：從邊緣連通、亮且低彩度的像素；另外把被包住的大塊純白（頭和馬尾中間的縫）也算背景"""
    bright = (a.min(2) > 200) & ((a.max(2) - a.min(2)) < 30)
    lab, n = nd.label(bright)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    white = (a.min(2) > 238) & ((a.max(2) - a.min(2)) < 14)
    wl, wn = nd.label(white)
    if wn:
        sz = nd.sum(white, wl, range(1, wn + 1))
        for i, s in enumerate(sz, 1):
            if s > 60: bg |= wl == i
    return bg

def objects(a, rows, cols):
    fg = ~bg_mask(a)
    lab, n = nd.label(nd.binary_closing(fg, iterations=3))
    H, W = fg.shape
    cells = {}
    for i, s in enumerate(nd.find_objects(lab), 1):
        hh, ww = s[0].stop - s[0].start, s[1].stop - s[1].start
        if hh * ww < 6000: continue
        cy, cx = (s[0].start + s[0].stop) / 2, (s[1].start + s[1].stop) / 2
        r, c = int(cy / (H / rows)), int(cx / (W / cols))
        m = (lab == i)[s]
        prev = cells.get((r, c))
        if prev is None or m.sum() > prev[2]: cells[(r, c)] = (s, m, m.sum())
    out = {}
    for (r, c), (s, m, _) in cells.items():
        y0, y1, x0, x1 = s[0].start, s[0].stop, s[1].start, s[1].stop
        crop = a[y0:y1, x0:x1].copy()
        keep = m & ~bg_mask(crop)
        out[(r, c)] = (crop, keep, y0)
    return out

def hsv(a):
    r, g, b = a[..., 0] / 255, a[..., 1] / 255, a[..., 2] / 255
    mx, mn = np.maximum(np.maximum(r, g), b), np.minimum(np.minimum(r, g), b)
    d = mx - mn + 1e-9
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    s = np.where(mx > 0, (mx - mn) / (mx + 1e-9), 0)
    return h, s, mx

def classes(a, keep, rb=40, gr=0.76):
    h, s, v = hsv(a)
    lum = a @ np.array([.299, .587, .114])
    hair = keep & (lum >= 56) & (h >= 13) & (h <= 38) & (s >= 0.28) & (v <= 0.89)
    hl, hn = nd.label(hair)
    if hn:
        sz = nd.sum(hair, hl, range(1, hn + 1))
        for i, z in enumerate(sz, 1):
            if z < 300: hair &= hl != i
    ol = keep & (lum < 72) & ~hair
    skin = keep & ~ol & ~hair & (a[..., 0] > 205) & (a[..., 0] - a[..., 2] > rb) & (a[..., 1] > 150) & (a[..., 1] > gr * a[..., 0]) & (a[..., 1] < 0.895 * a[..., 0])
    return ol, hair, skin

def eyes(a, keep, region=None):
    """正面兩眼的中心（深色、獨立、接近圓形的小塊，高度相同）"""
    lum = a @ np.array([.299, .587, .114])
    dark = keep & (lum < 90)
    lab, n = nd.label(dark)
    H, W = dark.shape
    blobs = []
    for i, sl in enumerate(nd.find_objects(lab), 1):
        hh, ww = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        area = (lab[sl] == i).sum()
        if not (25 <= area <= 900): continue
        if max(hh, ww) > 3.4 * min(hh, ww) or hh < 6 or ww > hh * 1.6: continue
        cy, cx = (sl[0].start + sl[0].stop) / 2, (sl[1].start + sl[1].stop) / 2
        if region and not (region[0] <= cy <= region[1]): continue
        blobs.append((cy, cx, area))
    best = None
    for i in range(len(blobs)):
        for j in range(i + 1, len(blobs)):
            a1, a2 = blobs[i], blobs[j]
            dy, dx = abs(a1[0] - a2[0]), abs(a1[1] - a2[1])
            if dy > 6 or not (0.15 * W < dx < 0.6 * W) or max(a1[2], a2[2]) > 2.2 * min(a1[2], a2[2]): continue
            sc = dy + abs(a1[2] - a2[2]) / 20
            if best is None or sc < best[0]: best = (sc, a1, a2)
    if not best: return None
    _, a1, a2 = best
    return ((a1[1] + a2[1]) / 2, (a1[0] + a2[0]) / 2, abs(a1[1] - a2[1]))

def collar(a, keep, x, y_from, y_to, rb=40, gr=0.76):
    """沿著 x 這一欄從 y_from 往上找：經過衣服之後，第一條「上面緊接著皮膚或頭髮」的深色外框＝領口。
    淡色條紋（米色、粉色）有時會被當成皮膚，所以一定要先碰到領口的外框；找不到外框才退回「第一個皮膚或頭髮」"""
    ol, hair, skin = classes(a, keep, rb, gr)
    def row(y):
        xs = range(max(0, int(x) - 2), min(a.shape[1], int(x) + 3))
        return [('n' if not keep[y, xx] else 'o' if ol[y, xx] else 'h' if hair[y, xx] else 's' if skin[y, xx] else 'c') for xx in xs]
    seen_cloth, first, last = False, None, None
    for y in range(y_from, y_to, -1):
        c = row(y)
        if c.count('c') >= 3: seen_cloth = True
        if not seen_cloth: continue
        if first is None and (c.count('s') >= 3 or c.count('h') >= 3): first = y + 1
        if c.count('o') < 3:
            last = 'c' if c.count('c') >= 3 else 'x'
            continue
        if last == 'c':
            for yy in range(y - 1, max(y_to, y - 5), -1):
                u = row(yy)
                if u.count('s') >= 3 or u.count('h') >= 3: return y + 1
    return first

# ---------- 身體圖：每個方向的領口、眼距、座標換算 ----------
def body_figs():
    a = load('v3_base_turn')
    fg = ~bg_mask(a)
    lab, n = nd.label(nd.binary_closing(fg, iterations=3))
    res = []
    for s in nd.find_objects(lab):
        if (s[0].stop - s[0].start) * (s[1].stop - s[1].start) < 20000: continue
        res.append(s)
    res.sort(key=lambda s: (s[0].start // 300, s[1].start))
    out = []
    for s in res[:5]:
        y0, y1, x0, x1 = s[0].start - 4, s[0].stop + 4, s[1].start - 4, s[1].stop + 4
        c = a[y0:y1, x0:x1]
        out.append((c, ~bg_mask(c)))
    return dict(zip(VIEWS, out))

BODY = body_figs()
# 和 build_char_v3.py 相同的座標：腳底中點為原點，正面人物高 54
CFG_HIP = {'front': 290, 'fq': 292, 'side': 288, 'bq': 300, 'back': 298}
fb = BODY['front'][1]; fy = np.nonzero(fb)[0]
S = H_UNITS / (fy.max() - fy.min() + 1)
BASE = {}
for v in VIEWS:
    c, k = BODY[v]
    ys = np.nonzero(k)[0]; top, bot = ys.min(), ys.max()
    lr = np.nonzero(k[CFG_HIP[v]:bot])[1]
    ox, oy = (lr.min() + lr.max() + 1) / 2, bot + 0.5
    yc = int(top + 0.58 * (bot - top))
    xs = np.nonzero(k[yc])[0]
    xm = (xs.min() + xs.max()) / 2
    if v == 'side':   # 側面：身體窄，脖子在上半身中間偏右一點，用胸口那列的皮膚以外中點
        xm = (xs.min() + xs.max()) / 2
    cy = collar(c, k, xm, yc, top, 65, 0.66)
    BASE[v] = dict(ox=ox, oy=oy, cx=xm, cy=cy, top=top, bot=bot)
# 斜前、斜後的中間那一欄會碰到吊帶，改用正面、背面「領口離腳底的距離」
for v, ref in (('fq', 'front'), ('bq', 'back')):
    BASE[v]['cy'] = int(round(BASE[v]['bot'] - (BASE[ref]['bot'] - BASE[ref]['cy'])))
ef = eyes(*BODY['front'], region=(BASE['front']['top'], BASE['front']['cy']))
BASE_EYE = ef[2]
print('身體：S', round(S, 4), '眼距', BASE_EYE, {v: (round(b['cx']), b['cy']) for v, b in BASE.items()})

# ---------- 頭 ----------
os.makedirs(OUT, exist_ok=True)
DATA = {'heads': {}, 'hats': {}, 'collar': {v: round((BASE[v]['cy'] - BASE[v]['oy']) * S, 2) for v in VIEWS}}
dbg = []

def place(crop, keep, hx, hy, sc, v):
    """回傳這張頭（縮放後）在遊戲座標的 x, y, w, h"""
    b = BASE[v]
    H, W = keep.shape
    x0 = b['cx'] - hx * sc; y0 = b['cy'] - hy * sc
    return [round((x0 - b['ox']) * S, 2), round((y0 - b['oy']) * S, 2), round(W * sc * S, 2), round(H * sc * S, 2)]

def save_rgba(arr, alpha, path, sc):
    im = Image.fromarray(np.dstack([arr.astype('uint8'), (alpha * 255).astype('uint8')]))
    W, H = im.size
    im = im.resize((max(1, round(W * sc)), max(1, round(H * sc))), Image.LANCZOS)
    im.quantize(colors=128, method=Image.Quantize.FASTOCTREE).save(path, optimize=True)
    return im

def head_parts(crop, keep, cy_force=None):
    """回傳 (領口列, 中心欄, 頭髮遮罩, 其他遮罩)"""
    H, W = keep.shape
    ol0, hair0, _ = classes(crop, keep)
    cloth = keep & ~hair0 & ~ol0
    colm = cloth[H - 10:H].sum(0) >= 4
    runs, st = [], None
    for x in range(W + 1):
        on = x < W and colm[x]
        if on and st is None: st = x
        if not on and st is not None: runs.append((x - st, st, x - 1)); st = None
    _, x0, x1 = max(runs) if runs else (0, 0, W - 1)
    xc = (x0 + x1) / 2
    cy = cy_force if cy_force is not None else collar(crop, keep, xc, H - 3, int(H * 0.35))
    ol, hair, skin = classes(crop, keep)
    # 小塊的「不是頭髮」被頭髮包住（頭髮裡的暗色陰影）也算頭髮
    holes = nd.binary_fill_holes(hair) & ~hair & keep & ~skin
    hl, hn = nd.label(holes)
    if hn:
        sz = nd.sum(holes, hl, range(1, hn + 1))
        for i, z in enumerate(sz, 1):
            if z < 400: hair |= hl == i
    rest = keep & ~hair
    if cy:
        below = np.zeros_like(keep); below[cy:] = True
        near = nd.binary_dilation(hair, iterations=2)
        rest = rest & (~below | (ol & near))
        hair = hair & (np.ones_like(keep))
    return cy, xc, hair, rest

def hair_lum(crop, hair):
    lum = crop @ np.array([.299, .587, .114])
    return float(np.median(lum[hair])) if hair.any() else 120.0

for sheet, ids in SHEETS:
    a = load(sheet)
    objs = objects(a, 3, 3)
    for r, hid in enumerate(ids):
        fc, fk, fy0 = objs[(r, 0)]
        e = eyes(fc, fk, region=(0.3 * fc.shape[0], 0.8 * fc.shape[0]))
        if not e: raise SystemExit(f'{sheet} 第 {r+1} 列找不到眼睛')
        sc = BASE_EYE / e[2]
        fcy = head_parts(fc, fk)[0]
        if fcy is None: raise SystemExit(f'{sheet} 第 {r+1} 列正面找不到領口')
        rec = {}
        for col, hv in enumerate(['f', 's', 'b']):
            crop, keep, cy0 = objs[(r, col)]
            cy, xc, hair, rest = head_parts(crop, keep, fcy + fy0 - cy0)
            if cy is None: raise SystemExit(f'{sheet} {r+1}-{hv} 找不到領口')
            name = f'{hid}_{hv}'
            save_rgba(crop, rest, os.path.join(OUT, name + '.png'), sc)
            save_rgba(crop, hair, os.path.join(OUT, name + '_h.png'), sc)
            rec[hv] = dict(cy=cy, cx=xc, hl=round(hair_lum(crop, hair), 1), shape=keep.shape)
            if DEBUG:
                im = np.full(crop.shape, 255, 'uint8')
                im[rest] = crop[rest]; im[hair] = (200, 60, 200)
                im[cy, :] = (0, 200, 0); im[:, int(xc)] = (0, 120, 255)
                dbg.append(im)
        DATA['heads'][hid] = {v: dict(img=HEAD_OF[v], hl=rec[HEAD_OF[v]]['hl'],
                                     box=place(None, np.zeros(rec[HEAD_OF[v]]['shape'], bool), rec[HEAD_OF[v]]['cx'], rec[HEAD_OF[v]]['cy'], sc, v))
                              for v in VIEWS}
        print('髮型', hid, '眼距', round(e[2], 1), '比例', round(sc, 3), {k: (x['cy'], round(x['cx'])) for k, x in rec.items()})

# ---------- 帽子 ----------
def hat_mask(crop, keep):
    h, s, v = hsv(crop)
    lum = crop @ np.array([.299, .587, .114])
    blue = keep & (crop[..., 2] > crop[..., 0] + 15) & (crop[..., 2] >= crop[..., 1])
    straw = keep & (h >= 33) & (h <= 58) & (s > 0.28) & (v > 0.62) & (lum > 120)
    fluff = keep & (lum > 205) & ((crop[..., 0] - crop[..., 2]) < 46) & ((crop[..., 0] - crop[..., 2]) > 8)
    fl, fn = nd.label(fluff)
    keepf = np.zeros_like(fluff)
    if fn:
        sz = nd.sum(fluff, fl, range(1, fn + 1))
        for i, z in enumerate(sz, 1):
            if z > 400: keepf |= fl == i
    seed = blue | straw | keepf
    sl, sn = nd.label(seed)
    if sn:
        sz = nd.sum(seed, sl, range(1, sn + 1))
        for i, z in enumerate(sz, 1):
            if z < 120: seed &= sl != i
    m = nd.binary_fill_holes(nd.binary_dilation(seed, iterations=3)) & keep
    return m, blue

for sheet, ids in HATS:
    a = load(sheet)
    rows = len(ids)
    objs = objects(a, rows if rows > 1 else 1, 3)
    for r, hid in enumerate(ids):
        fc, fk, fy0 = objs[(r, 0)]
        e = eyes(fc, fk, region=(0.3 * fc.shape[0], 0.85 * fc.shape[0]))
        if not e: raise SystemExit(f'{sheet} 第 {r+1} 列找不到眼睛')
        sc = BASE_EYE / e[2]
        # 帽子圖裡的人和身體圖是同一張臉：用眼睛對位（領口被吊帶、外套擋住，不準）
        fcy = int(round(e[1] + (BASE['front']['cy'] - ef[1]) / sc))
        rec = {}
        for col, hv in enumerate(['f', 's', 'b']):
            crop, keep, cy0 = objs[(r, col)]
            cy, xc, _, _ = head_parts(crop, keep, fcy + fy0 - cy0)
            m, blue = hat_mask(crop, keep)
            m[cy - 2:] = False; blue = blue & m   # 帽子只在領口以上（帽子圖裡的人穿藍色吊帶褲）
            ml, mn = nd.label(m)
            if mn:
                sz = nd.sum(m, ml, range(1, mn + 1)); m = ml == (int(np.argmax(sz)) + 1) if hid != 10 else m
            blue = blue & m
            ys = np.nonzero(m[:, max(0, int(xc) - 3):int(xc) + 4].any(1))[0]
            brim = int(ys.max()) - 4 if hid != 10 and len(ys) else None
            save_rgba(crop, m, os.path.join(OUT, f'hat{hid}_{hv}.png'), sc)
            lum = crop @ np.array([.299, .587, .114])
            rec[hv] = dict(cy=cy, cx=xc, shape=keep.shape, brim=brim, bl=round(float(np.median(lum[blue & m])) if (blue & m).any() else 110, 1))
            if DEBUG:
                im = np.full(crop.shape, 255, 'uint8'); im[keep] = (crop[keep] * 0.35 + 160).astype('uint8'); im[m] = crop[m]
                if brim: im[brim, :] = (255, 0, 0)
                im[cy, :] = (0, 200, 0); dbg.append(im)
        out = {}
        for v in VIEWS:
            q = rec[HEAD_OF[v]]
            box = place(None, np.zeros(q['shape'], bool), q['cx'], q['cy'], sc, v)
            br = None if q['brim'] is None else round((BASE[v]['cy'] - (q['cy'] - q['brim']) * sc - BASE[v]['oy']) * S, 2)
            out[v] = dict(img=HEAD_OF[v], box=box, brim=br, bl=q['bl'])
        DATA['hats'][hid] = out
        print('帽子', hid, {k: (x['cy'], x['brim']) for k, x in rec.items()})

js = '/* 人物新畫法的頭與帽子（第 35 節，15i）：tools/build_char_heads.py 產生，不要手改 */\nwindow.AV3H=' + json.dumps(DATA, ensure_ascii=False, separators=(',', ':')) + ';\n'
open(os.path.join(CH, 'av3_heads.js'), 'w', encoding='utf8').write(js)
tot = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
print('完成：', len(os.listdir(OUT)), '張，共', tot // 1024, 'KB')
if DEBUG:
    Hh = max(i.shape[0] for i in dbg)
    rows = [dbg[i:i + 9] for i in range(0, len(dbg), 9)]
    lines = []
    for rw in rows:
        line = np.concatenate([np.pad(i, ((0, Hh - i.shape[0]), (0, 6), (0, 0)), constant_values=255) for i in rw], 1)
        lines.append(line)
    Wm = max(l.shape[1] for l in lines)
    big = np.concatenate([np.pad(l, ((0, 6), (0, Wm - l.shape[1]), (0, 0)), constant_values=255) for l in lines], 0)
    Image.fromarray(big).save(os.environ.get('HEADS_DEBUG', os.path.join(ROOT, 'tools', 'heads_debug.png')))
