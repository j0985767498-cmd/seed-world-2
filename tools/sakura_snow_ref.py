import numpy as np, math
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
exec(open('sakura_gif.py').read().split('def frames')[0])  # load, petal
def shade(a,body,strength=1.0,seed=3):
    H,W=body.shape; ys,xs=np.where(body)
    cy,cx=ys.mean(),xs.mean(); R=max(ys.max()-ys.min(),xs.max()-xs.min())/2
    y,x=np.mgrid[0:H,0:W]; u=(x-cx)/R; v=(y-cy)/R; r=np.clip(np.hypot(u,v),0,1)
    light=np.clip(0.5-0.45*(u*0.7+v*0.7),0,1)       # top-left lit
    rim=np.array([186,40,108.]); mid=np.array([246,118,170.]); core=np.array([255,222,234.])
    t=np.clip(light*0.8+(1-r)*0.5,0,1)[...,None]
    col=np.where(t<0.5, rim+(mid-rim)*(t/0.5), mid+(core-mid)*((t-0.5)/0.5))
    col=col*(1-0.38*(r[...,None]**2.2))               # darker edge
    # inner faint petals (embedded)
    lay=Image.new('L',(W,H),0); rng=np.random.default_rng(seed)
    for i in range(6):
        sz=int(R*rng.uniform(0.45,0.7)); p=petal(sz,rng.uniform(0,360),1.0).split()[3]
        lay.paste(p,(int(cx+R*rng.uniform(-0.6,0.5)-sz/2),int(cy+R*rng.uniform(-0.5,0.6)-sz/2)),p)
    lay=np.array(lay.filter(ImageFilter.GaussianBlur(2.0)))/255*0.30
    col=col*(1-lay[...,None]*0.9)+np.array([255,246,250.])*lay[...,None]*0.9
    # pearly glow center
    g=np.clip(1-np.hypot(u+0.1,v+0.05)/0.6,0,1)**2*0.35
    col=col*(1-g[...,None])+np.array([255,240,246.])*g[...,None]
    # rim light bottom-right
    rl=np.clip((r-0.78)/0.22,0,1)*np.clip((u*0.7+v*0.7),0,1)*0.6
    col=col*(1-rl[...,None])+np.array([255,214,230.])*rl[...,None]
    # specular highlights
    s1=np.clip(1-np.hypot((u+0.40)/0.26,(v+0.22)/0.13),0,1)**0.35
    s2=np.clip(1-np.hypot((u+0.10)/0.09,(v+0.38)/0.07),0,1)**0.5
    s3=np.clip(1-np.abs(np.hypot(u-0.05,v-0.05)-0.80)/0.035,0,1)*np.clip(u*0.7+v*0.7-0.2,0,1)*0.8
    s=np.maximum(np.maximum(s1,s2),s3)
    col=col*(1-s[...,None])+255*s[...,None]
    if strength<1:
        l=col@[0.299,0.587,0.114]; col=l[...,None]+(col-l[...,None])*0.55
        col=col*0.85+np.array([236,226,216.])*0.15
    out=a.copy(); out[body,:3]=np.clip(col[body],0,255); return out,(cx,cy,R)
def frames2(path,strength=1.0,N=40,S=200):
    a,body,lum=load(path,S); base,(cx,cy,R)=shade(a,body,strength)
    base=Image.fromarray(base.astype('uint8')); H,W=body.shape
    ys,xs=np.where(body); y0,y1=ys.min(),ys.max(); x0,x1=xs.min(),xs.max()
    mask=np.array(Image.fromarray((ndimage.binary_erosion(body,iterations=2)*255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.8)))/255
    rng=np.random.default_rng(7); P=7
    px=rng.uniform(0.15,0.85,P); ph=np.arange(P)/P+rng.uniform(-0.04,0.04,P); sw=rng.uniform(6,12,P); rs=rng.uniform(-1,1,P)
    sp=[(rng.uniform(-0.6,0.6),rng.uniform(-0.6,0.6),rng.uniform(0,1)) for _ in range(5)]
    out=[]
    for f in range(N):
        t=f/N; layer=Image.new('RGBA',(W,H),(0,0,0,0))
        for i in range(P):
            uu=(t+ph[i])%1.0
            y=y0-10+(y1-y0+20)*uu; x=x0+(x1-x0)*px[i]+sw[i]*math.sin(2*math.pi*(uu*1.3+i*0.37))
            al=min(1,uu/0.15)*min(1,(1-uu)/0.2)*(1.0 if strength==1 else 0.5)
            sz=int(S*0.12); p=petal(sz,rs[i]*360*uu+40*i,al)
            glow=Image.new('RGBA',(sz+8,sz+8),(0,0,0,0)); ga=p.split()[3].point(lambda v:v*0.7)
            gl=Image.new('RGBA',(sz,sz),(255,255,255,0)); gl.putalpha(ga); glow.alpha_composite(gl,(4,4)); glow=glow.filter(ImageFilter.GaussianBlur(3))
            layer.alpha_composite(glow,(int(x-sz/2-4),int(y-sz/2-4))); layer.alpha_composite(p,(int(x-sz/2),int(y-sz/2)))
        d=ImageDraw.Draw(layer)
        for (su,sv,sph) in sp:
            k=max(0,math.sin(2*math.pi*(t*2+sph)))**3*(1 if strength==1 else 0.5)
            if k>0.05:
                X=cx+su*R; Y=cy+sv*R; L=R*0.10*k; A=int(255*k)
                d.line([(X-L,Y),(X+L,Y)],fill=(255,255,255,A),width=2); d.line([(X,Y-L),(X,Y+L)],fill=(255,255,255,A),width=2)
        la=np.array(layer).astype(float); la[...,3]*=mask
        fr=base.copy(); fr.alpha_composite(Image.fromarray(la.astype('uint8'))); out.append(fr)
    return out
A=frames2('/mnt/user-data/uploads/fruits/tomato_b0.png',1.0,S=150)
C=frames2('/mnt/user-data/uploads/fruits/tomato_b0.png',0.5,S=150)
dc=Image.open('/mnt/user-data/uploads/seed-world-2/tools/dream_colors.gif')
G=[]
for f in range(40):
    dc.seek(int(f*dc.n_frames/40)); fr=dc.convert('RGB')
    pearl=fr.crop((220,10,350,200)); aqua=fr.crop((410,10,540,200)); star=fr.crop((410,210,540,400))
    s=Image.new('RGB',(130*3+170*2+20,200),(168,196,120)); x=0
    for im in (pearl,aqua,star): s.paste(im,(x,0)); x+=130
    s.paste(A[f],(x+10,15),A[f]); s.paste(C[f],(x+180,15),C[f])
    G.append(s.convert('P',palette=Image.ADAPTIVE,colors=255))
G[0].save('sakura_snow2.gif',save_all=True,append_images=G[1:],duration=75,loop=0)
G[12].convert('RGB').save('ss2.png')
