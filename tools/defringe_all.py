"""去背修邊（聊天室 2026-11-22）。用法（在 repo 根目錄）：
  pip install numpy scipy pillow
  python tools/defringe_all.py            # 掃描＋修邊，原檔先備份到 ../seed-world-2_asset_backup/
  python tools/defringe_all.py --pockets 清單.txt   # 只把清單裡指定的「被包住的白底」清掉
輸出：tools/_defringe_report/ 裡的對照圖（每張 12 個，修前／修後，放大邊緣）與 report.json。
"""
import sys,os,json,shutil,numpy as np
from PIL import Image
from scipy import ndimage as nd
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS=os.path.join(ROOT,'assets');BK=os.path.join(os.path.dirname(ROOT),'seed-world-2_asset_backup')
REP=os.path.join(ROOT,'tools','_defringe_report')
SKIP=('app'+os.sep,'ref'+os.sep)
def defringe(a,band=3):
    A=a[...,3];rgb=a[...,:3];mn=rgb.min(2);sat=rgb.max(2)-mn
    tr=A<8
    if tr.sum()<10:return None,0
    d=nd.distance_transform_edt(~tr);edge=(~tr)&(d<=band);inner=(~tr)&(d>band+1)&(d<=band+5)
    if inner.sum()==0:return None,0
    k=np.ones((9,9));s=nd.convolve(np.where(inner,mn,0),k,mode='constant');c=nd.convolve(inner.astype(float),k,mode='constant')
    loc=np.where(c>0,s/np.maximum(c,1),255)
    fr=edge&(mn>195)&(sat<45)&(mn>loc+20);n=int(fr.sum())
    if n<20:return None,n
    al=np.clip((255-mn)/60.0,0,1);na=A.copy();na[fr]=np.minimum(A[fr],al[fr]*255)
    aa=np.clip(al[fr],0.05,1)[:,None];rgb2=rgb.copy();rgb2[fr]=np.clip((rgb[fr]-255*(1-aa))/aa,0,255)
    return np.dstack([rgb2,na]),n
def pockets(a):
    A=a[...,3];rgb=a[...,:3];mn=rgb.min(2);sat=rgb.max(2)-mn
    lab,k=nd.label((A>200)&(mn>240)&(sat<12))
    if not k:return []
    sz=nd.sum(np.ones_like(lab),lab,range(1,k+1));out=[]
    for i,s in enumerate(sz,1):
        if s>60:
            ys,xs=np.where(lab==i);out.append([int(xs.mean()),int(ys.mean()),int(s)])
    return out
def main():
    os.makedirs(REP,exist_ok=True);rep={};changed=[]
    for dp,_,fs in os.walk(ASSETS):
        for f in fs:
            if not f.lower().endswith('.png'):continue
            p=os.path.join(dp,f);rel=os.path.relpath(p,ASSETS)
            if rel.startswith(SKIP):continue
            im=Image.open(p)
            if im.mode!='RGBA':continue
            a=np.array(im).astype(float);o,n=defringe(a);pk=pockets(a if o is None else o)
            rep[rel.replace(os.sep,'/')]={'fringe':n,'pockets':pk}
            if o is not None:
                b=os.path.join(BK,rel);os.makedirs(os.path.dirname(b),exist_ok=True)
                if not os.path.exists(b):shutil.copy2(p,b)
                Image.fromarray(o.astype(np.uint8)).save(p);changed.append(rel)
    json.dump(rep,open(os.path.join(REP,'report.json'),'w'),ensure_ascii=False,indent=0)
    sheets(changed,'fringe');sheets([r for r,v in rep.items() if v['pockets']],'pockets',rep)
    print('修邊',len(changed),'張；疑似被包住的白底',sum(1 for v in rep.values() if v['pockets']),'張；報告在',REP)
def sheets(rels,tag,rep=None):
    W=200;per=12
    for si in range(0,len(rels),per):
        part=rels[si:si+per];c=Image.new('RGB',(W*per,2*W+20),(40,120,40))
        for i,rel in enumerate(part):
            rel=rel.replace('/',os.sep);cur=Image.open(os.path.join(ASSETS,rel)).convert('RGBA')
            b=os.path.join(BK,rel);old=Image.open(b).convert('RGBA') if os.path.exists(b) else cur
            for j,im in enumerate([old,cur]):
                t=im.copy();t.thumbnail((W-6,W-6));bg=Image.new('RGBA',t.size,(40,120,40,255));bg.alpha_composite(t);c.paste(bg.convert('RGB'),(i*W+3,j*W+3))
        c.save(os.path.join(REP,f'{tag}_{si//per:03d}.png'))
        json.dump(part,open(os.path.join(REP,f'{tag}_{si//per:03d}.json'),'w'),ensure_ascii=False)
def clear_pockets(listfile):
    for line in open(listfile,encoding='utf8'):
        rel=line.strip()
        if not rel:continue
        p=os.path.join(ASSETS,rel.replace('/',os.sep));a=np.array(Image.open(p).convert('RGBA')).astype(float)
        A=a[...,3];mn=a[...,:3].min(2);sat=a[...,:3].max(2)-mn
        lab,k=nd.label((A>0)&(mn>236)&(sat<14))
        if k:
            sz=nd.sum(np.ones_like(lab),lab,range(1,k+1))
            for i,s in enumerate(sz,1):
                if s>30:a[...,3][lab==i]=0
        b=os.path.join(BK,rel.replace('/',os.sep));os.makedirs(os.path.dirname(b),exist_ok=True)
        if not os.path.exists(b):shutil.copy2(p,b)
        Image.fromarray(a.astype(np.uint8)).save(p);print('清白底',rel)
if __name__=='__main__':
    if len(sys.argv)>2 and sys.argv[1]=='--pockets':clear_pockets(sys.argv[2])
    else:main()
