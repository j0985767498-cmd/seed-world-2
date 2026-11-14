"""產生人物新畫法試做頁 tools/char_v3.html（不放進遊戲）
用法：python tools/build_char_v3.py [--debug]
來源：assets/ref/v3/v3_base_turn.png（正、斜前、側、斜後、背）與 v3_base_walk.png（走路，只當對照）。
做法：
  1. 從參考圖切出每個方向的人物，邊緣洪水填色去背。
  2. 五個方向一起分色（k-means），每一群對應到部位：外框／頭髮／皮膚／條紋／米色條紋／吊帶褲／鈕扣／靴子。
  3. 依切線把人物分成 身體、兩隻手、兩條腿（腿和手往身體裡多留一段，轉動時不會露縫）。
  4. 每個零件描成 SVG 路徑：先整塊外框色，再疊各部位的底色與明暗。顏色由遊戲色票換。
需要：pip install pillow numpy scipy scikit-image
"""
import base64, json, os, re, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from skimage import measure

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
REFD = os.path.join(ROOT, 'assets', 'ref', 'v3')
DEBUG = '--debug' in sys.argv
DBG = os.environ.get('V3_DEBUG_DIR', os.path.join(ROOT, 'tools'))
H_UNITS = 54.0          # 正面人物的高度（遊戲座標，腳底 = 0）
VIEWS = ['front', 'fq', 'side', 'bq', 'back']

# ---------- 1. 切出人物 ----------
def figures(name):
    a = np.array(Image.open(os.path.join(REFD, name + '.png')).convert('RGB')).astype(int)
    fg = (a.min(2) < 225) | ((a.max(2) - a.min(2)) > 25)
    lab, n = nd.label(nd.binary_closing(fg, iterations=3))
    res = []
    for s in nd.find_objects(lab):
        if (s[0].stop - s[0].start) * (s[1].stop - s[1].start) < 20000: continue
        res.append(s)
    res.sort(key=lambda s: (s[0].start // 300, s[1].start))
    out = []
    for s in res:
        y0, y1, x0, x1 = s[0].start - 4, s[0].stop + 4, s[1].start - 4, s[1].stop + 4
        out.append(a[y0:y1, x0:x1].astype(float))
    return out

def body_mask(a):
    bright = (a.min(2) > 200) & ((a.max(2) - a.min(2)) < 30)
    lab, n = nd.label(bright)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    m = ~np.isin(lab, list(border))
    lab2, n2 = nd.label(m)
    if n2 > 1:  # 只留最大塊
        sz = nd.sum(m, lab2, range(1, n2 + 1)); m = lab2 == (int(np.argmax(sz)) + 1)
    return m

turn = figures('v3_base_turn')
IMG = dict(zip(VIEWS, turn[:5]))
WALK = dict(zip(['fwA', 'fwB', 'swA', 'swB', 'bwA', 'bwB'], figures('v3_base_walk')))

# ---------- 2. 分色 ----------
K = 18
px = np.concatenate([IMG[v][body_mask(IMG[v])] for v in VIEWS])
rng = np.random.default_rng(0)
sub = px[rng.choice(len(px), 40000, replace=False)]
C = sub[rng.choice(len(sub), K, replace=False)]
for _ in range(50):
    l = ((sub[:, None] - C[None]) ** 2).sum(-1).argmin(1)
    C = np.array([sub[l == k].mean(0) if (l == k).any() else C[k] for k in range(K)])
C = C[np.argsort(C.sum(1))]
lum = C.mean(1)
r_, g_, b_ = C[:, 0], C[:, 1], C[:, 2]
sat = C.max(1) - C.min(1)

def kind(c):
    """每一群顏色是哪一類（不看位置）"""
    if lum[c] < 40: return 'ol'
    if lum[c] < 60 and r_[c] > b_[c] + 25: return 'dbrown'   # 頭髮、靴子最暗的陰影（其他地方當線條）
    if b_[c] > r_[c] + 8: return 'line' if lum[c] < 70 else 'blue'
    if sat[c] < 18 and lum[c] > 150: return 'gray'          # 褲管反摺
    if g_[c] >= r_[c] - 4 and g_[c] > b_[c] + 10: return 'green'
    if lum[c] > 205 and (r_[c] - g_[c]) < 26: return 'cream'
    if lum[c] > 140 and r_[c] > b_[c] + 60: return 'skin'   # 含耳朵、脖子的皮膚陰影
    if lum[c] < 70: return 'ol'
    return 'brown'
KIND = [kind(c) for c in range(K)]
print('分色：', [(k, C[k].round().astype(int).tolist(), KIND[k]) for k in range(K)])

def mode3(L, valid):
    H, W = L.shape
    P = np.pad(L, 1, constant_values=-1)
    st = np.stack([P[y:y + H, x:x + W] for y in range(3) for x in range(3)])
    cnt = np.stack([(st == k).sum(0) for k in range(K)])
    m = cnt.argmax(0)
    keep = (cnt.max(0) <= 3) | ~valid
    m[keep] = L[keep]
    return m

# ---------- 3. 部位（每個像素） ----------
def roles(a):
    body = body_mask(a)
    lab = ((a[..., None, :] - C[None, None]) ** 2).sum(-1).argmin(-1)
    lab = mode3(lab, body); lab[~body] = -1
    ys = np.nonzero(body)[0]; top, bot = ys.min(), ys.max()
    yn = (np.arange(a.shape[0])[:, None] - top) / (bot - top)
    yn = np.broadcast_to(yn, body.shape)
    kd = np.full(body.shape, '', dtype=object)
    for c in range(K): kd[lab == c] = KIND[c]
    role = np.full(body.shape, '', dtype=object)
    role[body & (kd == 'ol')] = 'line'
    role[body & (kd == 'line')] = 'line'
    role[body & np.isin(kd, ['blue', 'gray'])] = 'pants'
    band = (yn > 0.36) & (yn < 0.66)
    role[body & (kd == 'green') & band] = 'shirt'
    role[body & (kd == 'cream') & band] = 'cream'
    role[body & (kd == 'cream') & ~band] = 'skin'
    role[body & (kd == 'skin')] = 'skin'
    br = body & (kd == 'brown')
    db = body & (kd == 'dbrown')
    role[(br | db) & (yn < 0.5)] = 'hair'
    role[(br | db) & (yn > 0.78)] = 'boot'
    role[db & (yn >= 0.5) & (yn <= 0.78)] = 'line'
    # 皮膚陰影色也出現在頭髮亮部：一塊一塊看，周圍頭髮比亮皮膚多就算頭髮
    shd = body & (kd == 'skin') & (lum[np.maximum(lab, 0)] < 200) & (yn < 0.5)
    sl, sn_ = nd.label(shd)
    for i in range(1, sn_ + 1):
        m = sl == i
        ring = nd.binary_dilation(m, iterations=3) & ~m
        nh = (ring & (role == 'hair')).sum(); ns = (ring & (kd == 'skin') & ~shd).sum()
        if nh > ns: role[m] = 'hair'
    # 鈕扣：吊帶上的小圓點（貼著吊帶褲、小、接近圓形）
    cand = body & np.isin(kd, ['skin', 'brown']) & (yn > 0.4) & (yn < 0.62)
    cl, cn = nd.label(cand)
    near_pants = nd.binary_dilation(body & np.isin(kd, ['blue']), iterations=4)
    for i, s in enumerate(nd.find_objects(cl), 1):
        m = cl == i
        hh, ww = s[0].stop - s[0].start, s[1].stop - s[1].start
        if 8 <= m.sum() <= 200 and max(hh, ww) <= 1.8 * min(hh, ww) and (m & near_pants).sum() > 0.5 * m.sum():
            role[m] = 'btn'
    # 其他沒分到的：用附近最多的部位
    unk = body & (role == '')
    if unk.any():
        known = body & (role != '')
        _, (iy, ix) = nd.distance_transform_edt(~known, return_indices=True)
        role[unk] = role[iy[unk], ix[unk]]
    return body, lab, role, top, bot

# ---------- 4. 零件切線（裁切後的像素座標，看 grid 決定） ----------
# arms: (名稱, 範圍函式, 肩膀支點)；hip: 腿從這裡轉；split: 左右腿分界 x（None = 側面，一條腿畫兩次）
CFG = {
    'front': dict(arms=[('a0', lambda y, x: (y > 180) & (y < 305) & (x < 66), (70, 194)),
                        ('a1', lambda y, x: (y > 180) & (y < 305) & (x > 139), (135, 194))], hip=290, split=101),
    'fq':    dict(arms=[('a0', lambda y, x: (y > 180) & (y < 305) & (x < 60), (66, 194)),
                        ('a1', lambda y, x: (y > 182) & (y < 305) & (x > 151), (146, 196))], hip=292, split=100),
    'side':  dict(arms=[('a0', lambda y, x: (y > 214) & (y < 305) & (x > 78) & (x < 128), (102, 212))], hip=288, split=None, sidearm=True),
    'bq':    dict(arms=[('a0', lambda y, x: (y > 182) & (y < 310) & (x < 58), (64, 196)),
                        ('a1', lambda y, x: (y > 184) & (y < 310) & (x > 152), (148, 198))], hip=300, split=100),
    'back':  dict(arms=[('a0', lambda y, x: (y > 182) & (y < 310) & (x < 64), (68, 194)),
                        ('a1', lambda y, x: (y > 182) & (y < 310) & (x > 140), (136, 194))], hip=298, split=100),
}
OV = 26  # 腿往身體裡多留的像素

# ---------- 5. 描邊 ----------
SC = None
def fmt(v):
    t = f'{v:.1f}'
    if t in ('0.0', '-0.0'): return '0'
    return t.replace('-0.', '-.') if t.startswith('-0.') else (t[1:] if t.startswith('0.') else t)

def trace(mask, ox, oy, s, tol=0.9, min_area=6):
    lm, nn = nd.label(mask)
    if nn:
        sizes = nd.sum(mask, lm, range(1, nn + 1))
        for i, sz in enumerate(sizes, 1):
            if sz < min_area: mask = mask & (lm != i)
    if not mask.any(): return ''
    P = np.pad(mask.astype(float), 1)
    out = []
    for cnt in measure.find_contours(P, 0.5):
        cnt = measure.approximate_polygon(cnt, tol)
        if len(cnt) < 4: continue
        pts = [((x - 1 + 0.5 - ox) * s, (y - 1 + 0.5 - oy) * s) for y, x in cnt[:-1]]
        n = len(pts)
        mids = [((pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2) for i in range(n)]
        d = f'M{fmt(mids[-1][0])} {fmt(mids[-1][1])}'
        for i in range(n):
            d += f'Q{fmt(pts[i][0])} {fmt(pts[i][1])} {fmt(mids[i][0])} {fmt(mids[i][1])}'
        out.append(d + 'Z')
    return ''.join(out)

ROLES = ['skin', 'hair', 'shirt', 'cream', 'pants', 'btn', 'boot']
# 各部位的基準色（五個方向一起算，最多的那一群）
_cnt = {r: np.zeros(K) for r in ROLES}
RD = {}
for v in VIEWS:
    RD[v] = roles(IMG[v])
    body, lab, role, top, bot = RD[v]
    for r in ROLES:
        m = role == r
        if m.any(): _cnt[r] += np.bincount(lab[m], minlength=K)
BASE = {r: int(_cnt[r].argmax()) for r in ROLES}
print('基準色：', {r: C[BASE[r]].round().astype(int).tolist() for r in ROLES})

def tone_k(r, c):
    b = lum[BASE[r]]; v = lum[c]
    k = (v / b - 1) if v <= b else (v - b) / (255 - b)
    return round(float(k) * 20) / 20

def part_layers(mask, lab, role, ox, oy, s):
    L = [{'r': 'ol', 'd': trace(mask, ox, oy, s, 0.8, 3)}]
    for r in ROLES:
        m = mask & (role == r)
        if not m.any(): continue
        L.append({'r': r, 'd': trace(m, ox, oy, s)})
        ks = {}
        for c in np.unique(lab[m]):
            if c < 0: continue
            k = tone_k(r, c)
            if abs(k) < 0.08: continue
            ks.setdefault(k, []).append(c)
        for k, cs in sorted(ks.items()):
            d = trace(m & np.isin(lab, cs), ox, oy, s, 0.9, 10)
            if d: L.append({'r': r, 'k': k, 'd': d})
    return [x for x in L if x['d']]

front_body = RD['front'][0]
fy = np.nonzero(front_body)[0]
S = H_UNITS / (fy.max() - fy.min() + 1)

DATA = {}
dbg_imgs = []
for v in VIEWS:
    a = IMG[v]; body, lab, role, top, bot = RD[v]; cfg = CFG[v]
    H, W = body.shape
    Y, X = np.mgrid[0:H, 0:W]
    oy = bot + 0.5
    # 中心：腿部的左右中點
    lr = np.nonzero(body[cfg['hip']:bot])[1]
    ox = (lr.min() + lr.max() + 1) / 2
    part = np.zeros(body.shape, int)  # 0 身體
    arms = []
    for i, (nm, fn, pv) in enumerate(cfg['arms']):
        m = body & fn(Y, X)
        if cfg.get('sidearm'):
            m = m & np.isin(role, ['skin', 'line'])
            lm, nn = nd.label(m)
            if nn:
                sz = nd.sum(m, lm, range(1, nn + 1)); m = lm == (int(np.argmax(sz)) + 1)
            m = nd.binary_dilation(m, iterations=1) & body
        part[m] = 10 + i
        arms.append((nm, m, pv))
    hip = cfg['hip']
    armm = part >= 10
    legs = []
    if cfg['split'] is None:
        lm = body & (Y > hip - OV) & ~armm
        legs.append(('l0', lm, (ox, hip)))
    else:
        for i, cond in enumerate([X < cfg['split'], X >= cfg['split']]):
            lm = body & (Y > hip - OV) & cond & ~armm
            cx = np.nonzero(lm & (Y > hip))[1]
            legs.append((f'l{i}', lm, ((cx.min() + cx.max() + 1) / 2 if len(cx) else ox, hip)))
    bodym = body & (Y <= hip) & ~armm
    role_b = role.copy(); lab_b = lab.copy()
    if cfg.get('sidearm'):
        # 側面的手蓋在身體上：手轉開後露出的地方補成吊帶褲底色
        filled = nd.binary_fill_holes(bodym | (armm & (Y <= hip) & nd.binary_erosion(body, iterations=3)))
        hole = filled & ~bodym
        role_b[hole] = 'pants'; lab_b[hole] = BASE['pants']
        bodym = filled
    pv = lambda p: [round((p[0] - ox) * S, 2), round((p[1] - oy) * S, 2)]
    DATA[v] = {
        'body': part_layers(bodym, lab_b, role_b, ox, oy, S),
        'arms': [{'n': nm, 'p': pv(p), 'L': part_layers(m, lab, role, ox, oy, S)} for nm, m, p in arms],
        'legs': [{'n': nm, 'p': pv(p), 'L': part_layers(m, lab, role, ox, oy, S)} for nm, m, p in legs],
    }
    if DEBUG:
        cols = {'line': (60, 30, 20), 'skin': (255, 210, 170), 'hair': (150, 90, 50), 'shirt': (90, 170, 80), 'cream': (255, 255, 200),
                'pants': (70, 110, 200), 'btn': (255, 140, 0), 'boot': (200, 60, 60), '': (255, 255, 255)}
        im = np.full(body.shape + (3,), 255, 'uint8')
        for r, c in cols.items(): im[body & (role == r)] = c
        pm = np.full(body.shape + (3,), 255, 'uint8')
        pm[bodym] = (200, 200, 200)
        for i, (_, m, _) in enumerate(legs): pm[m & ~bodym] = [(120, 160, 255), (120, 220, 160)][i]
        for i, (_, m, _) in enumerate(arms): pm[m] = [(255, 120, 120), (230, 120, 255)][i]
        dbg_imgs.append(np.concatenate([im, pm], 1))
    print(v, '零件', 'body', len(DATA[v]['body']), 'arms', len(arms), 'legs', len(legs))

if DEBUG:
    Hh = max(i.shape[0] for i in dbg_imgs)
    row = np.concatenate([np.pad(i, ((0, Hh - i.shape[0]), (0, 8), (0, 0)), constant_values=255) for i in dbg_imgs], 1)
    Image.fromarray(row).save(os.path.join(DBG, 'v3_debug_parts.png'))
    print('除錯圖：', os.path.join(DBG, 'v3_debug_parts.png'))

total = len(json.dumps(DATA, separators=(',', ':')))
print('路徑資料', round(total / 1024), 'KB')

# ---------- 6. 試做頁 ----------
h = open(os.path.join(ROOT, 'index.html'), encoding='utf8').read()
a0 = h.index('// ===== 角色（14k'); b0 = h.index('// ===== 角色動畫')
def line(pat):
    m = re.search(pat, h)
    if not m: raise SystemExit('找不到 ' + pat)
    return m.group(0)
ri = h.index('const RGBC='); RGBC = h[ri:h.index('};', ri) + 2]
helpers = '\n'.join([line(r'const clamp=[^\n]*'), RGBC, line(r'const rgbS=[^\n]*'),
                     "const VIEWS=['side','fq','front','fq','side','bq','back','bq'];",
                     "const faceFlip=f=>f===3||f===4||f===5;"])
avatar = h[a0:b0]
build = re.search(r"const BUILD='([^']*)'", h).group(1)

def png64(arr):
    from io import BytesIO
    b = BytesIO(); Image.fromarray(arr.astype('uint8')).save(b, 'PNG'); return base64.b64encode(b.getvalue()).decode()
REF = {k: png64(IMG[k]) for k in VIEWS}
REFW = {k: png64(WALK[k]) for k in WALK}

V3JS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'char_v3_render.js'), encoding='utf8').read()

page = f"""<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>人物新畫法試做</title>
<style>body{{margin:0;padding:12px;background:#EEF2F5;font:14px "Noto Sans TC",sans-serif;color:#3B2A18}}h2{{margin:18px 0 6px;font-size:17px}}
.row{{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end}}.card{{background:#fff;border-radius:10px;padding:6px;text-align:center;font-size:12px}}
.card img{{display:block;height:200px}}p{{margin:4px 0;font-size:13px;color:#6b5a48}}
#field{{position:relative;background:#A9CF7C;border-radius:12px;height:340px;overflow:hidden;touch-action:none}}
#field svg{{position:absolute;left:0;top:0;width:100%;height:100%}}
.pad{{display:grid;grid-template-columns:repeat(3,48px);gap:4px;margin-top:8px}}.pad button{{height:44px;border-radius:10px;border:1px solid #c9b79c;background:#fff;font-size:18px}}
label{{font-size:13px;margin-right:10px}}</style></head><body>
<h2>人物新畫法試做（5 個方向＋走路）　遊戲版本 {build}</h2>
<p>來源：assets/ref/v3/v3_base_turn.png。每個方向上排是參考圖、下排是新畫法（照參考圖描出來，分成身體、手、腳，顏色由遊戲色票換）。</p>
<div class="row" id="views"></div>
<h2>走路（新畫法一直在走）</h2>
<p>和走路參考圖 v3_base_walk.png 對照。斜前、斜後沒有走路參考圖，用腳前後擺動代替。</p>
<div class="row" id="walks"></div>
<h2>走走看</h2>
<p>電腦用方向鍵（可以斜走）、手機按下面的方向鍵或在草地上拖曳。左邊是新畫法，旁邊的是遊戲現在的畫法（同樣大小，1.15 倍）。</p>
<div><label><input type="checkbox" id="zoom2"> 放大 2 倍</label><label><input type="checkbox" id="showOld" checked> 顯示舊畫法</label>
<label>髮色 <select id="hc"></select></label><label>膚色 <select id="sk"></select></label><label>上衣 <select id="tc"></select></label><label>吊帶褲 <select id="bc"></select></label><label>鞋子 <select id="sc"></select></label></div>
<div id="field"><svg id="fsvg" viewBox="0 0 400 340"></svg></div>
<div class="pad"><button data-d="-1,-1">↖</button><button data-d="0,-1">↑</button><button data-d="1,-1">↗</button><button data-d="-1,0">←</button><button disabled></button><button data-d="1,0">→</button><button data-d="-1,1">↙</button><button data-d="0,1">↓</button><button data-d="1,1">↘</button></div>
<h2>效能</h2><p id="perf"></p>
<script>
{helpers}
{avatar}
const AV3={json.dumps(DATA, ensure_ascii=False, separators=(',', ':'))};
{V3JS}
const REF={json.dumps(REF)},REFW={json.dumps(REFW)};
</script>
<script>
const VB='-17 -57 34 60';
const img=b=>`<img src="data:image/png;base64,${{b}}">`;
const sv=(html,w,h)=>`<svg width="${{w}}" height="${{h}}" viewBox="${{VB}}">${{html}}</svg>`;
const NAMES={{front:'正面',fq:'斜前',side:'側面',bq:'斜後',back:'背面'}};
document.getElementById('views').innerHTML=['front','fq','side','bq','back'].map(v=>`<div class="card">${{img(REF[v])}}<svg width="113" height="200" viewBox="${{VB}}">${{av3SVG(AV_DEF,false,{{view:v}})}}</svg><br>${{NAMES[v]}}</div>`).join('');
const WREF=[['fwA','front'],['fwB','front'],['swA','side'],['swB','side'],['bwA','back'],['bwB','back']];
document.getElementById('walks').innerHTML=WREF.map(([k])=>`<div class="card">${{img(REFW[k])}}</div>`).join('')+['front','fq','side','bq','back'].map(v=>`<div class="card"><svg class="wk" data-v="${{v}}" width="113" height="200" viewBox="${{VB}}"></svg><br>${{NAMES[v]}}</div>`).join('');
const sel=(id,arr,def)=>{{const e=document.getElementById(id);e.innerHTML=arr.map((c,i)=>`<option value="${{i}}" ${{i===def?'selected':''}} style="background:${{c}}">${{i+1}}</option>`).join('');e.onchange=()=>{{av[id==='hc'?'hairC':id==='sk'?'skin':id==='tc'?'topC':id==='bc'?'bottomC':'shoeC']=+e.value}}}};
const av={{...AV_DEF}};
sel('hc',HAIRC,av.hairC);sel('sk',SKINS,av.skin);sel('tc',CLOTHC,av.topC);sel('bc',CLOTHC,av.bottomC);sel('sc',CLOTHC,av.shoeC);
let me={{x:150,y:230,f:2,ph:0,moving:false}},keys={{}},padD=null,drag=null;
addEventListener('keydown',e=>{{if(e.key.startsWith('Arrow')){{keys[e.key]=1;e.preventDefault()}}}});addEventListener('keyup',e=>{{delete keys[e.key]}});
document.querySelectorAll('.pad button[data-d]').forEach(b=>{{const d=b.dataset.d.split(',').map(Number);const on=e=>{{padD=d;e.preventDefault()}},off=()=>padD=null;b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointerleave',off);b.addEventListener('pointercancel',off)}});
const field=document.getElementById('field');
field.addEventListener('pointerdown',e=>{{drag={{x:e.clientX,y:e.clientY}};field.setPointerCapture(e.pointerId)}});
field.addEventListener('pointermove',e=>{{if(drag)drag.cx=e.clientX-drag.x,drag.cy=e.clientY-drag.y}});
field.addEventListener('pointerup',()=>drag=null);field.addEventListener('pointercancel',()=>drag=null);
let last=performance.now();
function frame(now){{
  const dt=Math.min(0.05,(now-last)/1000);last=now;const t=now/1000;
  let vx=(keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0),vy=(keys.ArrowDown?1:0)-(keys.ArrowUp?1:0);
  if(padD){{vx=padD[0];vy=padD[1]}}
  if(drag&&drag.cx!=null&&Math.hypot(drag.cx,drag.cy)>8){{vx=drag.cx;vy=drag.cy}}
  const L=Math.hypot(vx,vy);me.moving=L>0;
  if(me.moving){{vx/=L;vy/=L;me.x=clamp(me.x+vx*70*dt,20,380);me.y=clamp(me.y+vy*70*dt,70,330);me.ph+=dt*11;me.f=dirIdx(vx,vy)}}
  const z=document.getElementById('zoom2').checked?2:1,old=document.getElementById('showOld').checked;
  const pose={{view:VIEWS[me.f],t}};if(me.moving)pose.ph=me.ph;
  const flip=faceFlip(me.f);
  let s=`<g transform="translate(${{me.x}} ${{me.y}}) scale(${{1.15*z}})">${{av3SVG(av,flip,pose)}}</g>`;
  if(old)s+=`<g transform="translate(${{me.x+40*z}} ${{me.y}}) scale(${{1.15*z}})" opacity=".95">${{avatarSVG(av,flip,pose)}}</g>`;
  document.getElementById('fsvg').innerHTML=s;
  document.querySelectorAll('.wk').forEach(e=>{{e.innerHTML=av3SVG(av,false,{{view:e.dataset.v,ph:t*7,t}})}});
  requestAnimationFrame(frame);
}}
function dirIdx(vx,vy){{return ((Math.round(Math.atan2(vy,vx)/(Math.PI/4))%8)+8)%8}}
requestAnimationFrame(frame);
function bench(fn){{const g=document.createElementNS('http://www.w3.org/2000/svg','svg');g.setAttribute('viewBox',VB);g.style.cssText='position:absolute;left:-999px;width:60px;height:100px';document.body.appendChild(g);const t0=performance.now();for(let i=0;i<200;i++){{g.innerHTML=fn(i);g.getBBox()}}const t=(performance.now()-t0)/200;g.remove();return t}}
setTimeout(()=>{{const tN=bench(i=>av3SVG(AV_DEF,false,{{view:'front',ph:i*0.3,t:i*0.08}})),tO=bench(i=>avatarSVG(AV_DEF,false,{{view:'front',ph:i*0.3,t:i*0.08}}));
document.getElementById('perf').textContent=`每畫一次（走路中）：新 ${{tN.toFixed(2)}} ms、舊 ${{tO.toFixed(2)}} ms（電腦上量的，iPhone 會慢幾倍）。新畫法 5 個方向的路徑資料共約 {round(total/1024)} KB。`}},500);
</script></body></html>"""
out = os.path.join(ROOT, 'tools', 'char_v3.html')
open(out, 'w', encoding='utf8', newline='\n').write(page)
print('寫入', out)
