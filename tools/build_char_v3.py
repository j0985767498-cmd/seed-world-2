"""產生人物新畫法試做頁 tools/char_v3_front.html（不放進遊戲）
用法：python tools/build_char_v3.py
做法：把 assets/ref/char_front.png 分色（k-means 16 色），依「外框圍起來的區塊＋顏色」分成
頭髮／皮膚／條紋上衣／米色條紋／吊帶褲／鈕扣／靴子／線條，每一區再分明暗，描成 SVG 路徑。
外框一律畫成 AV_OL，顏色由遊戲的色票換（髮色、膚色、上衣色、下身色、鞋子色）。
需要：pip install pillow numpy scikit-image
"""
import base64, json, os, re, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from skimage import measure

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
REF = os.path.join(ROOT, 'assets', 'ref', 'char_front.png')
TOP_Y = -54.0  # 頭頂在遊戲座標的高度（腳底 = 0），和現在的人物差不多高

# ---------- 1. 分色 ----------
a = np.array(Image.open(REF).convert('RGBA')).astype(float)
body = a[..., 3] > 128
px = a[body][:, :3]
rng = np.random.default_rng(0)
K = 16
C = px[rng.choice(len(px), K, replace=False)]
for _ in range(40):
    l = ((px[:, None, :] - C[None]) ** 2).sum(-1).argmin(1)
    C = np.array([px[l == k].mean(0) if (l == k).any() else C[k] for k in range(K)])
C = C[np.argsort(C.sum(1))]
l = ((px[:, None, :] - C[None]) ** 2).sum(-1).argmin(1)
lab = np.full(body.shape, -1)
lab[body] = l

def mode3(L):
    H, W = L.shape
    P = np.pad(L, 1, constant_values=-1)
    st = np.stack([P[y:y + H, x:x + W] for y in range(3) for x in range(3)])
    cnt = np.stack([(st == k).sum(0) for k in range(-1, K)])
    m = cnt.argmax(0) - 1
    keep = cnt.max(0) <= 3
    m[keep] = L[keep]
    return m
lab0 = lab.copy()
lab = mode3(lab)
lab[body & (lab < 0)] = lab0[body & (lab < 0)]
lab[~body] = -1

lum = C.mean(1)
def isbrown(c): r, g, b = C[c]; return r > b + 15 and lum[c] < 200 and not (g > r)
def isblue(c): r, g, b = C[c]; return b > r + 25
def isskin(c): return lum[c] > 185 and C[c][0] > C[c][2] + 20
# 外框：最暗的兩群
OL = set(int(i) for i in np.argsort(lum)[:2])
GREEN = [c for c in range(K) if C[c][1] >= C[c][0] - 5 and C[c][1] > C[c][2] and 120 < lum[c] < 185]
print('外框群', OL, '條紋群', GREEN)

# ---------- 2. 區塊 ----------
cells, n = nd.label(body & ~np.isin(lab, list(OL)))
role = np.full(body.shape, '', dtype=object)
_st, _sn = nd.label(np.isin(lab, GREEN))
_big = np.isin(_st, [i for i, sz in enumerate(nd.sum(_st > 0, _st, range(1, _sn + 1)), 1) if sz >= 25])
near_stripe = nd.distance_transform_edt(~_big) <= 9  # 只看真正的條紋（大塊），眼睛邊緣的雜點不算
for i in range(1, n + 1):
    m = cells == i
    area = int(m.sum())
    ys, xs = np.nonzero(m)
    cy = ys.mean()
    h = np.bincount(lab[m], minlength=K)
    dom = int(h.argmax())
    has_stripe = sum(h[c] for c in GREEN) >= 50
    if area < 15:
        kind = 'line'
    elif isbrown(dom) and cy < 220:
        kind = 'hair'
    elif isbrown(dom) and cy > 430:
        kind = 'boot'
    elif isskin(dom) and area < 220 and cy > 240:
        kind = 'btn'
    elif isskin(dom) and not has_stripe:
        kind = 'skin'
    elif isblue(dom):
        kind = 'pants'
    else:
        kind = 'shirtcell'
    for y, x in zip(ys, xs):
        c = lab[y, x]
        if kind == 'line':
            r = 'line'
        elif isblue(c):
            r = 'pants'
        elif c in GREEN and kind in ('shirtcell', 'pants'):
            r = 'shirt' if near_stripe[y, x] else 'skin'
        elif kind in ('hair', 'boot', 'btn'):
            r = kind
        elif kind == 'skin':
            r = 'line' if lum[c] < 100 else 'skin'
        else:  # 上衣或吊帶褲區塊裡的其他顏色（區塊可能經由脖子連到臉，靠近條紋的才算米色條紋）
            r = ('cream' if near_stripe[y, x] else 'skin') if isskin(c) else 'line'
        role[y, x] = r

BASE = {}
def base_of(r):
    m = role == r
    h = np.bincount(lab[m], minlength=K)
    return int(h.argmax())
ROLES = ['skin', 'hair', 'shirt', 'cream', 'pants', 'btn', 'boot']
for r in ROLES:
    BASE[r] = base_of(r)
print('各部位基準色', {r: C[BASE[r]].round().tolist() for r in ROLES})

def tone_k(r, c):
    b = lum[BASE[r]]; v = lum[c]
    k = (v / b - 1) if v <= b else (v - b) / (255 - b)
    return round(float(k) * 20) / 20  # 0.05 一階

# ---------- 3. 描邊 ----------
ys_all = np.nonzero(body)[0]
xs_all = np.nonzero(body)[1]
ybot = ys_all.max() + 0.5
s = -TOP_Y / (ybot - ys_all.min() + 0.5)
# 身體中心：用腿和軀幹（y 230–440）的左右中點
mid = body[230:440]
cx = (np.nonzero(mid)[1].min() + np.nonzero(mid)[1].max() + 1) / 2

def fmt(v): t = f'{v:.1f}'; return '0' if t in ('0.0', '-0.0') else t.replace('0.', '.') if t.startswith('0.') else t.replace('-0.', '-.')

def trace(mask, tol=0.9, min_area=6):
    lab_m, nn = nd.label(mask)
    if nn:
        sizes = nd.sum(mask, lab_m, range(1, nn + 1))
        for i, sz in enumerate(sizes, 1):
            if sz < min_area: mask = mask & (lab_m != i)
    if not mask.any(): return ''
    P = np.pad(mask.astype(float), 1)
    out = []
    for cnt in measure.find_contours(P, 0.5):
        cnt = measure.approximate_polygon(cnt, tol)
        if len(cnt) < 4: continue
        pts = [((x - 1 - cx + 0.5) * s, (y - 1 + 0.5 - ybot) * s) for y, x in cnt[:-1]]
        npt = len(pts)
        mids = [((pts[i][0] + pts[(i + 1) % npt][0]) / 2, (pts[i][1] + pts[(i + 1) % npt][1]) / 2) for i in range(npt)]
        d = f'M{fmt(mids[-1][0])} {fmt(mids[-1][1])}'
        for i in range(npt):
            d += f'Q{fmt(pts[i][0])} {fmt(pts[i][1])} {fmt(mids[i][0])} {fmt(mids[i][1])}'
        out.append(d + 'Z')
    return ''.join(out)

layers = [{'r': 'ol', 'd': trace(body, 0.8, 2)}]
for r in ROLES:
    m = role == r
    layers.append({'r': r, 'k': 0, 'd': trace(m)})
    ks = {}
    for c in np.unique(lab[m]):
        k = tone_k(r, c)
        if abs(k) < 0.08: continue
        ks.setdefault(k, []).append(c)
    for k, cs in sorted(ks.items()):
        tm = m & np.isin(lab, cs)
        d = trace(tm, 0.9, 10)
        if d: layers.append({'r': r, 'k': k, 'd': d})
layers = [L for L in layers if L['d']]
total = sum(len(L['d']) for L in layers)
print('圖層', len(layers), '路徑字元', total)

# ---------- 4. 試做頁 ----------
h = open(os.path.join(ROOT, 'index.html'), encoding='utf8').read()
a0 = h.index('// ===== 角色（14k'); b0 = h.index('// ===== 角色動畫')
def line(pat):
    m = re.search(pat, h)
    if not m: raise SystemExit('找不到 ' + pat)
    return m.group(0)
ri = h.index('const RGBC='); RGBC = h[ri:h.index('};', ri) + 2]
helpers = '\n'.join([line(r'const clamp=[^\n]*'), RGBC, line(r'const rgbS=[^\n]*'),
                     "const VIEWS=['side','fq','front','fq','side','bq','back','bq'];"])
avatar = h[a0:b0]
build = re.search(r"const BUILD='([^']*)'", h).group(1)
refb64 = base64.b64encode(open(REF, 'rb').read()).decode()

V3 = r"""
/* ===== 新畫法試做（正面，照參考圖描出來） ===== */
function av3Front(av){
  av=avNorm(av);
  const col={ol:AV_OL,hair:HAIRC[av.hairC]||HAIRC[0],skin:SKINS[av.skin]||SKINS[0],shirt:avCol(av.topC),cream:'#F4EBD8',pants:avCol(av.bottomC),btn:'#E2B07A',boot:avCol(av.shoeC)};
  const hex=c=>c.startsWith('#')?c:'#'+c.match(/\d+/g).slice(0,3).map(v=>(+v).toString(16).padStart(2,'0')).join('');
  let s='<ellipse cx="0" cy=".3" rx="10" ry="2.6" fill="rgba(60,40,20,.18)"/>';
  for(const L of AV3F){const c=col[L.r];s+=`<path d="${L.d}" fill="${L.k?shade(hex(c),L.k):c}" fill-rule="evenodd"/>`}
  return s;
}
"""

page = f"""<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>人物新畫法試做</title>
<style>body{{margin:0;padding:12px;background:#EEF2F5;font:14px "Noto Sans TC",sans-serif;color:#3B2A18}}h2{{margin:18px 0 6px;font-size:17px}}
.row{{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end}}.card{{background:#fff;border-radius:10px;padding:8px;text-align:center;font-size:12px}}
.grass{{background:#BFD89A;border-radius:10px;padding:10px}}p{{margin:4px 0;font-size:13px;color:#6b5a48}}</style></head><body>
<h2>人物新畫法試做（正面）　遊戲版本 {build}</h2>
<p>只試正面、預設造型（短髮＋條紋 T＋吊帶褲＋靴子）。左：參考圖；中：新畫法（照參考圖描輪廓，顏色由遊戲色票換）；右：遊戲現在的畫法。</p>
<div class="row">
<div class="card"><img src="data:image/png;base64,{refb64}" style="height:420px;display:block"><br>參考圖</div>
<div class="card"><svg id="big3" width="230" height="420"></svg><br>新畫法</div>
<div class="card"><svg id="bigOld" width="230" height="420"></svg><br>現在</div>
</div>
<h2>遊戲中實際大小（草地上，左新右舊）</h2>
<p>手機上人物約這麼大（遊戲裡放大 1.15 倍）。第二排放大 2 倍方便看。</p>
<div class="grass" id="small"></div>
<h2>換顏色（新畫法）</h2>
<p>髮色、膚色、上衣、吊帶褲、鞋子都由色票換，外框固定深棕色。</p>
<div class="row" id="vars"></div>
<h2>效能</h2><p id="perf"></p>
<script>
{helpers}
{avatar}
const AV3F={json.dumps(layers, ensure_ascii=False, separators=(',', ':'))};
{V3}
const VB='-17 -57 34 60';
const put=(id,html)=>{{const e=document.getElementById(id);e.setAttribute('viewBox',VB);e.innerHTML=html}};
put('big3',av3Front(AV_DEF));
put('bigOld',avatarSVG(AV_DEF,false,{{view:'front'}}));
const sm=(html,k)=>`<svg width="${{34*1.15*k}}" height="${{60*1.15*k}}" viewBox="${{VB}}">${{html}}</svg>`;
let S='';for(const k of [1,2]){{S+='<div class="row" style="margin:6px 0">'+sm(av3Front(AV_DEF),k)+sm(avatarSVG(AV_DEF,false,{{view:'front'}}),k)+sm(av3Front({{...AV_DEF,hairC:4,skin:2,topC:1,bottomC:7,shoeC:7}}),k)+sm(avatarSVG({{...AV_DEF,hairC:4,skin:2,topC:1,bottomC:7,shoeC:7}},false,{{view:'front'}}),k)+'</div>'}}
document.getElementById('small').innerHTML=S;
const VARS=[{{}},{{hairC:0,skin:1,topC:6,bottomC:2,shoeC:7}},{{hairC:4,skin:0,topC:5,bottomC:4,shoeC:12}},{{hairC:5,skin:3,topC:3,bottomC:1,shoeC:7}},{{hairC:7,skin:4,topC:9,bottomC:7,shoeC:3}},{{hairC:8,skin:5,topC:11,bottomC:0,shoeC:12}},{{hairC:9,skin:2,topC:0,bottomC:3,shoeC:8}}];
document.getElementById('vars').innerHTML=VARS.map(v=>`<div class="card"><svg width="120" height="212" viewBox="${{VB}}">${{av3Front({{...AV_DEF,...v}})}}</svg></div>`).join('');
/* 效能：同一個容器重畫 200 次 */
function bench(fn){{const g=document.createElementNS('http://www.w3.org/2000/svg','svg');g.setAttribute('viewBox',VB);g.style.cssText='position:absolute;left:-999px;width:60px;height:100px';document.body.appendChild(g);const t0=performance.now();for(let i=0;i<200;i++){{g.innerHTML=fn(i);g.getBBox()}}const t=(performance.now()-t0)/200;g.remove();return t}}
const tNew=bench(i=>av3Front(AV_DEF)),tOld=bench(i=>avatarSVG(AV_DEF,false,{{view:'front',t:i*0.08}}));
document.getElementById('perf').textContent=`每畫一次：新 ${{tNew.toFixed(2)}} ms、舊 ${{tOld.toFixed(2)}} ms（電腦上量的，iPhone 會慢幾倍）。新畫法的路徑資料約 {round(total/1024)} KB。`;
</script></body></html>"""
out = os.path.join(ROOT, 'tools', 'char_v3_front.html')
open(out, 'w', encoding='utf8').write(page)
print('寫入', out)
