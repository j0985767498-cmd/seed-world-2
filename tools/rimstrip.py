"""剝掉 AI 去背後殘留的外圈淺色描邊（貼紙白框）。
只處理和圖片外圍透明區相連的邊緣，不挖物件內部的洞。
只有「淺色像素的內側不遠處有比較深的線條」才算描邊，所以本身是白色、沒有描線的物件不會被吃掉。

用法：
  python tools/rimstrip.py --repo            # 處理 assets/ 底下所有 png（跳過 app/ ref/ 和 *_fx.png）
                                             # 原圖備份到 ../seed-world-2_asset_backup_rim/，報告與對照圖寫到 tools/_rim_report/
  python tools/rimstrip.py OUTDIR a.png b.png  # 處理指定檔案，輸出到 OUTDIR
"""
import sys, os, json, shutil
import numpy as np
from PIL import Image
from scipy import ndimage

LIGHT = 183     # 描邊候選：最暗通道 >= 這個值
LOWSAT = 66     # 而且飽和度 < 這個值
DARKER = 45     # 內側 4 像素內要有比它暗這麼多的像素，才算是描邊
PASSES = 5

def outer_mask(al):
    t = al < 20
    lab, n = ndimage.label(t)
    ids = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    return np.isin(lab, list(ids)) if ids else np.zeros_like(t)

def strip(a):
    a = a.astype(np.float32)
    al = a[:, :, 3].copy()
    rgb = a[:, :, :3]
    mn = rgb.min(2); sat = rgb.max(2) - mn
    # 每個像素附近 4px 內最暗的值（只看不透明像素）
    mn_op = np.where(al > 200, mn, 255)
    near_dark = ndimage.minimum_filter(mn_op, size=9)
    removed = 0
    for _ in range(PASSES):
        tr = outer_mask(al)
        bd = (al >= 20) & ndimage.binary_dilation(tr)
        kill = bd & (mn >= LIGHT) & (sat < LOWSAT) & (near_dark < mn - DARKER)
        k = int(kill.sum())
        if k == 0:
            break
        al[kill] = 0
        removed += k
    tr = outer_mask(al)
    bd = (al >= 20) & ndimage.binary_dilation(tr)
    soft = bd & (mn > 170) & (sat < 60) & (near_dark < mn - DARKER)
    al[soft] = np.minimum(al[soft], 140)
    a[:, :, 3] = al
    return a.clip(0, 255).astype(np.uint8), removed

def on_dark(im, h=160):
    im = im.copy(); im.thumbnail((h * 2, h))
    c = Image.new('RGBA', im.size, (45, 55, 45, 255)); c.alpha_composite(im); return c

def repo():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    assets = os.path.join(root, 'assets')
    backup = os.path.join(os.path.dirname(root), 'seed-world-2_asset_backup_rim')
    rep = os.path.join(root, 'tools', '_rim_report')
    os.makedirs(rep, exist_ok=True)
    report = []
    changed_pairs = []
    for dp, dn, fn in os.walk(assets):
        rel_dir = os.path.relpath(dp, assets).replace('\\', '/')
        if rel_dir.split('/')[0] in ('app', 'ref'):
            continue
        for f in sorted(fn):
            if not f.lower().endswith('.png') or f.lower().endswith('_fx.png'):
                continue
            p = os.path.join(dp, f)
            im = Image.open(p)
            if im.mode not in ('RGBA', 'LA', 'P'):
                continue
            src = np.array(im.convert('RGBA'))
            if (src[:, :, 3] < 20).sum() == 0:
                continue
            out, removed = strip(src)
            if removed == 0:
                continue
            rel = os.path.relpath(p, assets).replace('\\', '/')
            bp = os.path.join(backup, rel)
            os.makedirs(os.path.dirname(bp), exist_ok=True)
            if not os.path.exists(bp):
                shutil.copy2(p, bp)
            Image.fromarray(out).save(p)
            op = int((src[:, :, 3] > 20).sum())
            report.append({'file': rel, 'removed': removed, 'pct': round(100 * removed / max(op, 1), 2)})
            changed_pairs.append((rel, Image.fromarray(src), Image.fromarray(out)))
    report.sort(key=lambda r: -r['pct'])
    json.dump(report, open(os.path.join(rep, 'report.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    # 對照圖：每張 10 組，左原圖右處理後，深色底；照 pct 由大到小排
    order = {r['file']: i for i, r in enumerate(report)}
    changed_pairs.sort(key=lambda t: order[t[0]])
    for s in range(0, len(changed_pairs), 10):
        rows = []
        for rel, a, b in changed_pairs[s:s + 10]:
            A, B = on_dark(a), on_dark(b)
            r = Image.new('RGBA', (A.width + B.width + 10, 160), (255, 255, 255, 255))
            r.alpha_composite(A, (0, 0)); r.alpha_composite(B, (A.width + 10, 0)); rows.append(r)
        W = max(r.width for r in rows)
        sheet = Image.new('RGB', (W, 170 * len(rows)), 'white')
        for i, r in enumerate(rows):
            sheet.paste(r.convert('RGB'), (0, i * 170))
        sheet.save(os.path.join(rep, 'sheet_%03d.png' % (s // 10)))
    print('changed', len(report), 'files; report in tools/_rim_report/')

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--repo':
        repo()
    else:
        for f in sys.argv[2:]:
            out, k = strip(np.array(Image.open(f).convert('RGBA')))
            Image.fromarray(out).save(os.path.join(sys.argv[1], os.path.basename(f)))
            print(os.path.basename(f), k)
