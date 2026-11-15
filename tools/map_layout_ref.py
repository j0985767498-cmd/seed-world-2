import math, random, sys
from PIL import Image
R=random.Random(11)
A='assets/grass/'
def dim(n): return Image.open(A+n+'.png').size
ART={'tree':('round_tree',125),'oak':('oak',185),'bush':('flower_bush',58),'fl':('wildflowers',42),'tg':('tall_grass',46),'rock':('boulder',64),'log':('log',48),'sign':('signpost',74),'cliff':('cliff',137),'stairs':('stairs',124),'mush':('mushroom_ring',40)}
DIM={k:dim(v[0]) for k,v in ART.items()}
objs=[]  # (y, svg)
def put(k,x,y,s=1.0,flip=None,br=1.0,shadow=True,flat=False):
    n,h=ART[k]; w0,h0=DIM[k]; hh=h*s; ww=hh*w0/h0
    if flip is None: flip=R.random()<.5
    sh=f'<ellipse cx="{x:.1f}" cy="{y-2:.1f}" rx="{ww*0.36:.1f}" ry="{max(4,ww*0.10):.1f}" fill="rgba(40,60,20,.22)"/>' if shadow else ''
    f=f' style="filter:brightness({br:.2f})"' if abs(br-1)>.01 else ''
    g=f'{sh}<g transform="translate({x:.1f} {y:.1f}) scale({-1 if flip else 1} 1)"{f}><image href="{A}{n}.png" x="{-ww/2:.1f}" y="{-hh:.1f}" width="{ww:.1f}" height="{hh:.1f}"/></g>'
    objs.append((-1e9 if flat else y,g))
W,H=800,1100
# ---------- terrace edge (wavy) ----------
def E(x): return 438+26*math.sin(x/800*math.pi*1.7+0.6)+10*math.sin(x/800*math.pi*4.3)
TH=108; GAP=(430,526)
# ---------- ground ----------
g=[f'<rect x="-40" y="-40" width="{W+80}" height="{H+80}" fill="#A8C478"/>']
for i in range(16):
    x,y=R.uniform(40,760),R.uniform(60,1060); rx,ry=R.uniform(60,150),R.uniform(40,90)
    g.append(f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{rx:.0f}" ry="{ry:.0f}" fill="{R.choice(["#9FBB6F","#B3CC86","#A2BF72"])}" opacity=".55" transform="rotate({R.uniform(-25,25):.0f} {x:.0f} {y:.0f})"/>')
# high ground tint polygon
up='M-40 -40 L840 -40 '+' '.join(f'L{x} {E(x)+26:.1f}' for x in range(840,-41,-20))+'Z'
g.append(f'<path d="{up}" fill="#C6DC96" opacity=".72"/>')
# ---------- path (spline with varying width) ----------
def spline(P,step=6):
    out=[]
    P=[P[0]]+P+[P[-1]]
    for i in range(1,len(P)-2):
        p0,p1,p2,p3=P[i-1],P[i],P[i+1],P[i+2]
        d=max(2,int(math.hypot(p2[0]-p1[0],p2[1]-p1[1])/step))
        for j in range(d):
            t=j/d; t2=t*t; t3=t2*t
            out.append(tuple(0.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3) for k in (0,1)))
    out.append(P[-2]); return out
def ribbon(P,w,seed,taper=False):
    rr=random.Random(seed); pts=spline(P); L=[];Rr=[]; n=len(pts); ph=rr.uniform(0,6)
    for i,(x,y) in enumerate(pts):
        a=pts[min(i+1,n-1)]; b=pts[max(i-1,0)]; dx,dy=a[0]-b[0],a[1]-b[1]; d=math.hypot(dx,dy) or 1; nx,ny=-dy/d,dx/d
        hw=w/2*(1+0.16*math.sin(i*0.11+ph)+0.07*math.sin(i*0.37+ph*2))
        if taper: hw*=min(1,(n-1-i)/14+0.15)
        L.append((x+nx*(hw+rr.uniform(-2,2)),y+ny*(hw+rr.uniform(-2,2)))); Rr.append((x-nx*(hw+rr.uniform(-2,2)),y-ny*(hw+rr.uniform(-2,2))))
    poly=L+Rr[::-1]; return 'M'+' L'.join(f'{x:.1f} {y:.1f}' for x,y in poly)+'Z', pts
paths=[ ([(400,1140),(392,1000),(430,880),(470,760),(455,640),(478,560)],58,1,False),      # south exit -> stairs
        ([(-40,835),(90,820),(220,850),(340,840),(446,800)],50,2,False),                  # west exit joins
        ([(478,450),(470,380),(420,310),(330,265),(250,250)],46,3,True) ]                 # top: stairs -> lookout clearing
pe=[];pf=[];pp=[]
for P,w,sd,tp in paths:
    d,pts=ribbon(P,w+10,sd,tp); pe.append(f'<path d="{d}" fill="#B5A678" opacity=".8"/>')
    d,pts=ribbon(P,w,sd+50,tp); pf.append(f'<path d="{d}" fill="#D2C598"/>')
    rr=random.Random(sd+9)
    for (x,y) in pts[::7]:
        pp.append(f'<ellipse cx="{x+rr.uniform(-w*.3,w*.3):.0f}" cy="{y+rr.uniform(-6,6):.0f}" rx="{rr.uniform(5,13):.0f}" ry="{rr.uniform(3,6):.0f}" fill="{rr.choice(["#DCD0A6","#C6B88A"])}" opacity=".7"/>')
    for (x,y) in pts[::5]:
        if rr.random()<.45: pp.append(f'<circle cx="{x+rr.uniform(-w*.42,w*.42):.0f}" cy="{y+rr.uniform(-5,5):.0f}" r="{rr.uniform(1.5,3):.1f}" fill="#A8997A"/>')
# lookout clearing (dirt patch) at end of top path
clear=f'<ellipse cx="225" cy="255" rx="92" ry="54" fill="#B5A678" opacity=".8"/><ellipse cx="225" cy="255" rx="84" ry="47" fill="#D2C598"/>'
clear=f'<ellipse cx="225" cy="255" rx="88" ry="50" fill="#D2C598"/>'
g+= pe+[f'<ellipse cx="225" cy="255" rx="94" ry="56" fill="#B5A678" opacity=".8"/>']+pf+[clear]+pp
# grass tufts & tiny flowers on ground (decals)
def inpath(x,y):
    for P,w,sd,tp in paths:
        for (px,py) in spline(P,20):
            if abs(px-x)<w*0.55 and abs(py-y)<w*0.55: return True
    return math.hypot((x-225)/90,(y-255)/52)<1
for i in range(230):
    x,y=R.uniform(30,770),R.uniform(70,1070)
    if inpath(x,y) or (E(x)+8<y<E(x)+TH+14): continue
    c=R.choice(['#86A85A','#8FB060','#7FA054']); s=R.uniform(.8,1.5)
    g.append(f'<path d="M{x:.0f} {y:.0f} l{-3*s:.1f} {-7*s:.1f} M{x:.0f} {y:.0f} l0 {-9*s:.1f} M{x:.0f} {y:.0f} l{3*s:.1f} {-7*s:.1f}" stroke="{c}" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".5"/>')
for i in range(0):
    x,y=R.uniform(30,770),R.uniform(70,1070)
    if inpath(x,y) or (E(x)+8<y<E(x)+TH+14): continue
    g.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="2.2" fill="{R.choice(["#FFFFFF","#F6E27A","#F3C6D8"])}" opacity=".9"/>')
# ---------- terrace ----------
t=[]
sh='M-40 '+f'{E(-40)+TH-10:.1f} '+' '.join(f'L{x} {E(x)+TH-10:.1f}' for x in range(-20,841,20))+' '+' '.join(f'L{x} {E(x)+TH+70:.1f}' for x in range(840,-41,-20))+'Z'
t.append(f'<path d="{sh}" fill="url(#shg)"/>')
for a,b in ((-40,GAP[0]),(GAP[1],840)):
    d='M'+' L'.join(f'{x} {E(x)+10:.1f}' for x in range(a,b+1,10))+' '+' '.join(f'L{x} {E(x)+TH-8:.1f}' for x in range(b,a-1,-10))+'Z'
    t.append(f'<path d="{d}" fill="#9F8A7C"/>')
t.append(f'<path d="M{GAP[0]-6} {E(GAP[0])+14:.0f} L{GAP[1]+6} {E(GAP[1])+14:.0f} L{GAP[1]+6} {E(GAP[1])+TH-6:.0f} L{GAP[0]-6} {E(GAP[0])+TH-6:.0f}Z" fill="#6E5C50"/>')
tiles=[]
aw=128*1.0
for a,b in ((-40,GAP[0]+10),(GAP[1]-10,840)):
    n=max(1,round((b-a)/(aw*0.6)))
    for i in range(n):
        k=R.uniform(.9,1.14); cx=a+(i+.5)*(b-a)/n+R.uniform(-6,6); tiles.append((E(cx)+TH+R.uniform(-4,4),cx,k,R.random()<.5))
tiles.sort()
w0,h0=DIM['cliff']
for by,cx,k,fl in tiles:
    hh=137*k; ww=hh*w0/h0
    t.append(f'<g transform="translate({cx:.1f} {by:.1f}) scale({-1 if fl else 1} 1)"><image href="{A}cliff.png" x="{-ww/2:.1f}" y="{-hh:.1f}" width="{ww:.1f}" height="{hh:.1f}"/></g>')
sx=(GAP[0]+GAP[1])/2; w0,h0=DIM['stairs']; shh=132; sww=shh*w0/h0
t.append(f'<image href="{A}stairs.png" x="{sx-sww/2:.1f}" y="{E(sx)+TH+12-shh:.1f}" width="{sww:.1f}" height="{shh:.1f}"/>')
# ---------- border: staggered, varied, wavy inner edge ----------
def exit_gap(side,v):
    if side=='s' and abs(v-400)<70: return True
    if side=='w' and abs(v-832)<64: return True
    return False
for x in range(-10,830,58):      # top: two rows
    put('tree',x+R.uniform(-10,10),58+R.uniform(-8,8),R.uniform(1.0,1.2),br=.90)
for x in range(20,830,64):
    if R.random()<.6: put('tree',x+R.uniform(-14,14),98+R.uniform(-8,18),R.uniform(.8,1.0))
for side,x0 in (('w',2),('e',798)):
    for y in range(150,1090,66):
        if exit_gap(side,y): continue
        put('tree',x0+R.uniform(-8,8),y+R.uniform(-10,10),R.uniform(1.0,1.2),br=.92)
        if R.random()<.33 and not exit_gap(side,y+30): put('tree',x0+(40 if side=='w' else -40)+R.uniform(-10,10),y+34+R.uniform(-10,10),R.uniform(.8,1.0))
for x in range(-10,830,62):      # bottom: crowns peeking up from below the map
    if exit_gap('s',x): continue
    put('tree',x+R.uniform(-10,10),1100+R.uniform(78,100),R.uniform(1.0,1.2),br=.92,shadow=False)
    if R.random()<.5: put('bush',x+R.uniform(-20,20),1088+R.uniform(-6,6),R.uniform(.8,1.1))
# ---------- composition: groups, not scatter ----------
SHADE=[]
def grove(cx,cy,n,spread=70,oak=False):
    SHADE.append(f'<ellipse cx="{cx}" cy="{cy+18}" rx="{spread*1.9:.0f}" ry="{spread*.95:.0f}" fill="url(#gsh)"/>')
    if oak: put('oak',cx,cy,1.0,br=1.0)
    for i in range(n):
        a=R.uniform(0,6.28); r=R.uniform(.35,1)*spread
        put('tree',cx+math.cos(a)*r*1.3,cy+math.sin(a)*r*.6+ (30 if oak else 0),R.uniform(.8,1.15))
    for i in range(2): put('bush',cx+R.uniform(-spread,spread),cy+R.uniform(20,46),R.uniform(.8,1.05))
    for i in range(3): put('tg',cx+R.uniform(-spread*1.2,spread*1.2),cy+R.uniform(24,60),R.uniform(.8,1.1),shadow=False)
DRIFT=[]
def meadow(cx,cy,n,rx=80,ry=44,pal=("#FFFFFF","#F7E68A","#F2D24E")):
    k=max(3,n//3)
    for i in range(k):
        a=R.uniform(0,6.28); r=R.uniform(0,.55)
        put('fl',cx+math.cos(a)*r*rx,cy+math.sin(a)*r*ry,(1.15 if i==0 else R.uniform(.6,.95)),shadow=False)
    for i in range(int(n*10)):
        x=R.gauss(cx,rx*.5); y=R.gauss(cy,ry*.5)
        if inpath(x,y) or (E(x)+2<y<E(x)+TH+16) or not(40<x<760 and 110<y<1060): continue
        r=R.uniform(2.0,3.4); c=R.choice(pal)
        DRIFT.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.1f}" fill="{c}"/><circle cx="{x:.0f}" cy="{y:.0f}" r="{r*.38:.1f}" fill="#E8B93C" opacity=".8"/>')
def outcrop(cx,cy):
    put('rock',cx,cy,1.15); put('rock',cx+44,cy+12,.6); put('rock',cx-38,cy+16,.48); put('tg',cx+16,cy+26,.9,shadow=False); put('fl',cx-52,cy+30,.8,shadow=False)
# high ground: lookout with hero oak beside the clearing, flower meadow, outcrop
put('oak',150,238,1.05,flip=False)
meadow(318,318,9,74,30,pal=('#FFFFFF','#F6C9DA','#EBA9C6','#F7E68A')); meadow(585,255,12,105,48)
outcrop(640,372); put('log',292,208,1.0)
grove(690,205,2,46)
put('mush',235,262,1.1,shadow=False,flat=False)
# edge dressing on the lip (sells that the top continues to the edge)
for x in (110,330,640): put('bush' if R.random()<.5 else 'tg',x,E(x)+18,R.uniform(.7,.95),shadow=False)
# low ground
grove(215,650,3,56); grove(650,700,3,70,oak=False)
meadow(615,905,11,110,46)
outcrop(120,720)
for x in (90,300,600,730):   # things leaning against the cliff base
    k=R.choice(['rock','bush','tg']); put(k,x,E(x)+TH+R.uniform(14,26),R.uniform(.45,.8))
put('log',560,980,1.0)
# path edging: tufts and stones hugging the path
for P,w,sd,tp in paths:
    pts=spline(P,40)
    for (x,y) in pts[1:-1]:
        if E(x)<y<E(x)+TH+20: continue
        for sgn in (-1,1):
            if R.random()<.22: put('tg',x+sgn*(w/2+R.uniform(6,16)),y+R.uniform(-8,8),R.uniform(.55,.8),shadow=False)
# signs: one per exit, right beside the path
put('sign',330,1010,1.0,flip=False); put('sign',70,790,1.0,flip=True)
ava=open('out/ava.svgfrag',encoding='utf8').read()
objs.append((1015,f'<g transform="translate(410 1015) scale(1.15)">{ava}</g>'))
objs.append((300,f'<g transform="translate(270 300) scale(1.15)">{ava}</g>'))
objs.sort(key=lambda o:o[0])
css=open('out/game.css',encoding='utf8').read()
defs='<defs><radialGradient id="gsh"><stop offset="0" stop-color="#4E6E2A" stop-opacity=".34"/><stop offset="1" stop-color="#4E6E2A" stop-opacity="0"/></radialGradient><radialGradient id="sun"><stop offset="0" stop-color="#FFF6C8" stop-opacity=".42"/><stop offset="1" stop-color="#FFF6C8" stop-opacity="0"/></radialGradient><radialGradient id="vig" cx=".5" cy=".48" r=".72"><stop offset=".55" stop-color="#22401A" stop-opacity="0"/><stop offset="1" stop-color="#22401A" stop-opacity=".30"/></radialGradient><linearGradient id="shg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3F5A22" stop-opacity=".55"/><stop offset="1" stop-color="#3F5A22" stop-opacity="0"/></linearGradient></defs>'
html=f'<!doctype html><html><head><meta charset="utf-8"><style>{css}</style><style>html,body{{margin:0;background:#222}}*{{animation:none!important}}</style></head><body><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">{defs}{"".join(g)}<ellipse cx="250" cy="270" rx="230" ry="130" fill="url(#sun)"/><ellipse cx="470" cy="830" rx="250" ry="170" fill="url(#sun)"/><ellipse cx="150" cy="262" rx="150" ry="52" fill="url(#gsh)"/>{"".join(SHADE)}{"".join(DRIFT)}{"".join(t)}{"".join(o[1] for o in objs)}<rect x="0" y="0" width="800" height="1100" fill="url(#vig)" pointer-events="none"/></svg></body></html>'
open('mock_hill2.html','w',encoding='utf8').write(html); print(len(objs),'objects')
