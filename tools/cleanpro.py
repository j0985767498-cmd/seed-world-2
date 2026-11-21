#!/usr/bin/env python3
"""cleanpro.py — 素材去背／去白邊／去中間雜邊（強化版）

用法：
  python tools/cleanpro.py --repo          # 在 repo 根目錄跑：處理 assets/ 全部（跳過 ref/、*_fx.png、不透明圖）
                                           # 原檔備份到 ../seed-world-2_asset_backup_clean/，比較圖在 tools/_clean_report/
  python3 cleanpro.py IN.png OUT.png [--pockets] [--preview P.png]
  python3 cleanpro.py --dir DIR --out OUTDIR [--pockets] [--sheet SHEET.png]

步驟：
 1. 去掉外圍殘留的白底（和外框相連、接近白色的像素）。
 2. 剝白邊：外緣上比內側明顯亮、或偏白偏灰的像素，一層一層剝，最多 PEEL 層；
    只在往內 5px 內有更暗的描線時才剝（不會把白色牆面本身吃掉）。
 3. 去半透明雜邊：外緣 2px 的半透明像素，顏色改用內側最近的實色，
    透明度依「跟白色混了多少」重算，消除白霧。
 4. 補小破洞：物件內部 <15px 的透明小洞補回來（原圖誤挖的黑點）。
 5. 中間雜邊（--pockets）：被物件包住、接近純白、>=60px 的區塊挖掉，
    並把洞的邊緣同樣剝白邊。玻璃、雲、白牆類物件不要開。
 6. 刪掉很小、偏白的白點（白底殘渣）；有顏色的閃光、星星、碎晶保留。
"""
import sys, os, glob, argparse
import numpy as np
from PIL import Image
from scipy import ndimage

PEEL = int(os.environ.get('PEEL', 4))


def lum(rgb):
    return rgb[..., 0] * 0.299 + rgb[..., 1] * 0.587 + rgb[..., 2] * 0.114


def sat(rgb):
    return rgb.max(2) - rgb.min(2)


def min_filter_lum(L, mask, r):
    """往內 r px 內（只看實色像素）的最暗亮度"""
    Lm = np.where(mask, L, 999.0)
    return ndimage.minimum_filter(Lm, size=2 * r + 1)


def clean(img, pockets=False):
    a = np.array(img.convert('RGBA')).astype(np.float32)
    rgb, al = a[..., :3], a[..., 3]
    H, W = al.shape
    st = {}
    small = max(H, W) < 180          # 小圖（/s 縮圖、圖示）只剝 1 層、白霧帶 1px
    peel_n = 1 if small else PEEL
    band_w = 1 if small else 2
    if (al < 20).sum() < H * W * 0.01:
        st['skip'] = 'opaque'          # 沒有透明區（地面、頭像底圖）不處理
        return img.convert('RGBA'), st

    # 0) 若整張不透明（沒去過背），先用外圍白底 flood
    was_opaque = (al < 20).sum() < H * W * 0.01
    if was_opaque:
        L = lum(rgb); S = sat(rgb)
        bgc = (L > 230) & (S < 25)
        lab, _ = ndimage.label(bgc)
        ids = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
        ids = ids[ids > 0]
        al[np.isin(lab, ids)] = 0

    # 1) 和透明區相連的近白像素（外圍殘底）——只對還沒去過背的圖做
    L = lum(rgb); S = sat(rgb)
    op = al >= 20
    nearw = op & (L > 228) & (S < 22)
    lab, n = ndimage.label(nearw)
    if n and was_opaque:
        touch = ndimage.binary_dilation(~op) & nearw
        ids = np.unique(lab[touch]); ids = ids[ids > 0]
        rm = np.isin(lab, ids)
        # 只刪薄的（避免整面白牆）：該塊往內 5px 內有暗描線
        dark_near = min_filter_lum(L, op, 5) < 150
        rm &= dark_near
        al[rm] = 0
        st['bg_left'] = int(rm.sum())

    # 4) 補小破洞（先補，免得被當成外緣去剝）
    op = al >= 20
    lab, n = ndimage.label(~op)
    border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    filled = 0
    if n:
        sizes = ndimage.sum(np.ones_like(al), lab, range(1, n + 1))
        L0 = lum(rgb)
        holes_ = []
        for i, s_ in enumerate(sizes, 1):
            if i in border or s_ >= 400:
                continue
            m = lab == i
            if s_ < 15:
                holes_.append(i)
        if holes_:
            hole = np.isin(lab, holes_)
            idx = ndimage.distance_transform_edt(hole, return_distances=False, return_indices=True)
            rgb[hole] = rgb[idx[0][hole], idx[1][hole]]
            al[hole] = 255
            filled = int(hole.sum())
    st['pinhole'] = filled

    # 5) 中間雜邊：被包住的近白塊
    pk = 0
    if pockets:
        op = al >= 20
        L = lum(rgb); S = sat(rgb)
        w = op & (L > 222) & (S < 24)
        w = ndimage.binary_opening(w, iterations=1)
        lab, n = ndimage.label(w)
        if n:
            sizes = ndimage.sum(np.ones_like(al), lab, range(1, n + 1))
            ring_dark = min_filter_lum(L, op & ~w, 3)
            for i, s in enumerate(sizes, 1):
                if s < 60:
                    continue
                m = lab == i
                ring = ndimage.binary_dilation(m, iterations=2) & ~m
                # 外圈大多是暗描線才算「被包住的白底」
                if (L[ring] < 140).mean() > 0.55:
                    al[m] = 0; pk += int(s)
    st['pocket'] = pk

    # 2) 剝白邊（外緣＋洞緣），一層一層。
    #    只剝「比內側鄰居明顯亮」的外緣像素：白牆本身的邊緣跟鄰居一樣亮，不會被吃。
    peeled = 0
    for _ in range(peel_n):
        op = al >= 20
        L = lum(rgb); S = sat(rgb)
        edge = op & ndimage.binary_dilation(~op)
        inner = op & ~edge
        Li = np.where(inner, L, 0.0)
        cnt = ndimage.uniform_filter(inner.astype(np.float32), 5)
        mean_in = ndimage.uniform_filter(Li, 5) / np.maximum(cnt, 1e-3)
        cond = edge & (cnt > 0.08) & (L > 150) & (S < 60) & (L > mean_in + 38)
        k = int(cond.sum())
        if k == 0:
            break
        al[cond] = 0; peeled += k
    st['peel'] = peeled

    # 3) 去半透明白霧：外緣 2px
    op = al >= 20
    band = op & ~ndimage.binary_erosion(op, iterations=band_w)
    core = op & ~band
    if core.any():
        idx = ndimage.distance_transform_edt(~core, return_distances=False, return_indices=True)
        F = rgb[idx[0], idx[1]]
        Lc, Lf = lum(rgb), lum(F)
        # 跟白色混了多少：t=0 純前景，t=1 純白
        t = np.clip((Lc - Lf) / np.maximum(255 - Lf, 1), 0, 1)
        newa = al * (1 - t)
        fix = band & (Lc > Lf + 12)
        rgb[fix] = F[fix]
        al[fix] = newa[fix]
        st['defringe'] = int(fix.sum())
    al[al < 25] = 0

    # 6) 小碎片：只刪「很小又偏白偏灰」的白點（白底殘渣）。
    #    有顏色的小東西（閃光、星星、碎晶）一律保留。
    op = al >= 20
    lab, n = ndimage.label(op)
    if n > 1:
        idxs = np.arange(1, n + 1)
        sizes = ndimage.sum(op, lab, idxs)
        L = lum(rgb); S = sat(rgb)
        mL = ndimage.mean(L, lab, idxs); mS = ndimage.mean(S, lab, idxs)
        kill = [i for i, sz, l, s_ in zip(idxs, sizes, mL, mS)
                if sz < 40 and l > 185 and s_ < 40]
        if kill:
            m = np.isin(lab, kill); al[m] = 0; st['islands'] = int(m.sum())
    rgb[al == 0] = 0
    out = np.dstack([rgb, al]).clip(0, 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA'), st


def on_bg(im, col, size=None):
    bg = Image.new('RGBA', im.size, col + (255,)); bg.alpha_composite(im)
    return bg


def compare(before, after, scale=2):
    cols = [(28, 28, 36), (86, 120, 70), (240, 236, 225)]
    W, H = before.size
    sheet = Image.new('RGBA', (W * 3 * 2 + 20, H), (0, 0, 0, 255))
    x = 0
    for c in cols:
        sheet.paste(on_bg(before, c), (x, 0)); x += W
        sheet.paste(on_bg(after, c), (x, 0)); x += W
        x += 10 if c != cols[-1] else 0
    return sheet.resize((sheet.width * scale // 2, sheet.height * scale // 2))


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('inp', nargs='?'); ap.add_argument('out', nargs='?')
    ap.add_argument('--dir'); ap.add_argument('--outdir')
    ap.add_argument('--pockets', action='store_true')
    ap.add_argument('--preview'); ap.add_argument('--sheet')
    ap.add_argument('--repo', action='store_true')
    g = ap.parse_args()
    if g.repo:
        import shutil, collections
        root = 'assets'; bak = os.path.join('..', 'seed-world-2_asset_backup_clean'); rep = os.path.join('tools', '_clean_report')
        os.makedirs(rep, exist_ok=True)
        groups = collections.defaultdict(list); log = []
        for dp, dn, fn in os.walk(root):
            rel = os.path.relpath(dp, root).replace('\\', '/')
            if rel.split('/')[0] in ('ref', 'ruins'):   # ruins 已在 2026-11-22 處理過
                continue
            for f in sorted(fn):
                if not f.lower().endswith('.png') or f.endswith('_fx.png'):
                    continue
                src = os.path.join(dp, f)
                dst = os.path.join(bak, rel, f)
                if os.path.exists(dst):
                    continue                      # 已處理過（有備份）就不再剝一次
                b = Image.open(src).convert('RGBA')
                r, st = clean(b, False)
                if st.get('skip'):
                    log.append(f'{rel}/{f} skip'); continue
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                shutil.copy2(src, dst)
                r.save(src)
                log.append(f'{rel}/{f} {st}')
                T = 160
                pair = Image.new('RGBA', (T * 2 + 4, T + 14), (0, 0, 0, 255))
                for k, im in enumerate((b, r)):
                    t = im.copy(); t.thumbnail((T, T))
                    bg = Image.new('RGBA', (T, T), (28, 28, 36, 255) if k == 0 else (40, 30, 30, 255))
                    bg.alpha_composite(t, ((T - t.width) // 2, (T - t.height) // 2))
                    pair.paste(bg, (k * (T + 4), 0))
                groups[rel].append(pair)
        for rel, pairs in groups.items():
            name = rel.replace('/', '_') or 'root'
            for part in range(0, len(pairs), 40):
                chunk = pairs[part:part + 40]; cols = 4; rows = (len(chunk) + cols - 1) // cols
                pw, ph = chunk[0].size
                sh = Image.new('RGBA', (cols * (pw + 8), rows * (ph + 4)), (255, 255, 255, 255))
                for i, pp in enumerate(chunk):
                    sh.paste(pp, ((i % cols) * (pw + 8), (i // cols) * (ph + 4)))
                sh.convert('RGB').save(os.path.join(rep, f'{name}_{part // 40 + 1}.jpg'), quality=85)
        open(os.path.join(rep, 'log.txt'), 'w', encoding='utf-8').write('\n'.join(log))
        print('done', len(log), 'files; report in', rep)
        sys.exit(0)
    if g.dir:
        os.makedirs(g.outdir, exist_ok=True)
        rows = []
        for f in sorted(glob.glob(os.path.join(g.dir, '*.png'))):
            if f.endswith('_fx.png'):
                continue
            b = Image.open(f).convert('RGBA')
            r, st = clean(b, g.pockets)
            r.save(os.path.join(g.outdir, os.path.basename(f)))
            print(os.path.basename(f), st)
            if g.sheet:
                bb = b.copy(); bb.thumbnail((240, 240)); rr = r.copy(); rr.thumbnail((240, 240))
                rows.append(compare(bb, rr))
        if g.sheet and rows:
            W = max(x.width for x in rows); Ht = sum(x.height + 6 for x in rows)
            s = Image.new('RGBA', (W, Ht), (0, 0, 0, 255)); y = 0
            for x in rows:
                s.paste(x, (0, y)); y += x.height + 6
            s.save(g.sheet)
    else:
        b = Image.open(g.inp).convert('RGBA')
        r, st = clean(b, g.pockets); r.save(g.out); print(st)
        if g.preview:
            compare(b, r).save(g.preview)
