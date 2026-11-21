import sys,numpy as np
from PIL import Image
from scipy import ndimage
def strip(a,passes=4):
  a=a.astype(np.float32);al=a[:,:,3]
  def outer(al):
    t=al<20;lab,n=ndimage.label(t)
    ids=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    return np.isin(lab,list(ids))
  for _ in range(passes):
    tr=outer(al)
    bd=(al>=20)&ndimage.binary_dilation(tr)
    mn=a[:,:,:3].min(2);sat=a[:,:,:3].max(2)-mn
    kill=bd&(mn>=183)&(sat<66)
    if kill.sum()==0:break
    al[kill]=0
  # soften: boundary light-ish pixels get partial alpha
  tr=outer(al);bd=(al>=20)&ndimage.binary_dilation(tr)
  mn=a[:,:,:3].min(2);sat=a[:,:,:3].max(2)-mn
  soft=bd&(mn>170)&(sat<60)
  al[soft]=np.minimum(al[soft],140)
  a[:,:,3]=al;return a.clip(0,255).astype(np.uint8)
if __name__=='__main__':
  for f in sys.argv[2:]:
    a=np.array(Image.open(f).convert('RGBA'));Image.fromarray(strip(a)).save(sys.argv[1]+'/'+f.split('/')[-1])
