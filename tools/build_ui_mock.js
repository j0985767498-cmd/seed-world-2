// 介面改版對照頁產生器（不放進遊戲）：用程式畫的新介面樣品（農場畫面框、植株資訊、收成回饋＋合成音效、元件規格）
// 用法（在專案資料夾執行）：node tools/build_ui_mock.js　產生 tools/ui_mock.html（要從網站或本機伺服器打開；字體從 Google Fonts 載入）
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..');
const h=fs.readFileSync(path.join(root,'index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
const DATA=['RGBC','SPGRAD','RAINBOW','EX_OF','SPECIAL','BASIC','CN','CSTR','MIX15','FRUIT_SHAPE_MUL','FRUIT_UNRIPE','DREAM_NF','DREAM_PERIOD','DZ_STARS','DZ_XSTAR','DZ_FACET','DZ_GSPK','DZ_CSPK','DZ_OBS','STEM_MUL','STEM_MUL_EGG','HALF_DEF','DZ_SKP'];
const FNS=['clamp','hexRGB','mixRGB','rgbS','isSpecC','colParts','hashStr','stemMulOf','fruitPrep','dreamPx','fruitColSpec','fruitPaint'];
js+=';globalThis.T={'+[...DATA,...FNS].join(',')+'};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);const T=ctx.T;
const src=DATA.map(k=>`const ${k}=${JSON.stringify(T[k])};`).join('\n')+'\nconst MIXSET=new Set(Object.values(MIX15));\n'+FNS.map(k=>{const s=T[k].toString();return s.startsWith('function')?s:`const ${k}=${s};`}).join('\n');
const IMG={};for(const n of ['tomato_b0','tomato_sp2','tomato_b1','eggplant_b0','strawberry_b0'])IMG[n]='data:image/png;base64,'+fs.readFileSync(path.join(root,'assets','fruits',n+'.png')).toString('base64');
const old=['ui_old_farm.png','ui_old_panel.png'].filter(f=>fs.existsSync(path.join(__dirname,f)));

const page=String.raw`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>介面改版樣品</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Huninn&family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet">
<style>
:root{--wood1:#A86C3A;--wood2:#7E4B22;--wood3:#55300F;--paper:#FFF8E8;--paper2:#F5E4C2;--ink:#4A3020;--ink2:#7A6250;
  --g1:#8EDB5A;--g2:#4E9F2C;--g3:#2F6E17;--o1:#FFD36B;--o2:#F09A1E;--o3:#A85E05;--r1:#FF8E73;--r2:#D9482F;--r3:#8E2A18;--b1:#8FD3FF;--b2:#3A8FD6;--b3:#1F5A94;
  --noise:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .35 0 0 0 0 .22 0 0 0 0 .1 0 0 0 .22 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  --grain:repeating-linear-gradient(92deg,rgba(255,255,255,.06) 0 2px,rgba(0,0,0,0) 2px 7px,rgba(0,0,0,.05) 7px 8px,rgba(0,0,0,0) 8px 15px)}
*{box-sizing:border-box}body{margin:0;background:#2E2418;color:#F3E6CF;font:15px "Noto Sans TC",sans-serif}
.fd{font-family:"Huninn","Noto Sans TC",sans-serif}
.wrap{max-width:1240px;margin:0 auto;padding:20px 16px 60px}
h1{font:400 30px "Huninn",sans-serif;margin:0 0 4px;color:#FFE7A8}.lead{color:#CDB89A;margin:0 0 18px;line-height:1.6}
h2.sec{font:400 22px "Huninn",sans-serif;color:#FFE7A8;margin:30px 0 10px}
.row{display:flex;gap:22px;flex-wrap:wrap;align-items:flex-start}
.col{display:flex;flex-direction:column;gap:6px;align-items:center}.cap{font-size:13px;color:#CDB89A}
.oldimg{width:390px;border-radius:26px;border:6px solid #111;display:block}
/* ===== 手機外框 ===== */
.phone{position:relative;width:390px;height:780px;border-radius:30px;overflow:hidden;border:6px solid #111;box-shadow:0 20px 40px rgba(0,0,0,.5);background:#A8C478;user-select:none;-webkit-user-select:none}
/* ===== 農場 ===== */
.farm{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 60%,#B6D184 0,#A2C070 60%,#8EAE5E 100%)}
.farm::before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(70,110,40,.35) 1.2px,transparent 1.6px);background-size:26px 22px;opacity:.6}
.tile{position:absolute;width:86px;height:49px;background:url(../assets/farm/s/soil_patch.png) center/100% 100% no-repeat}
.plant{position:absolute;transform-origin:50% 100%;cursor:pointer}
.plant img.pl{position:absolute;left:50%;bottom:0;transform:translateX(-50%);height:58px;filter:drop-shadow(0 3px 2px rgba(40,30,10,.25))}
.plant .fr{position:absolute;width:30px;left:50%;bottom:26px;transform:translateX(-50%)}
.plant.sq{animation:sq .45s cubic-bezier(.3,1.6,.5,1)}
@keyframes sq{0%{transform:scale(1)}25%{transform:scale(1.18,.78)}55%{transform:scale(.9,1.12)}100%{transform:scale(1)}}
.shake{animation:shk .25s linear}
@keyframes shk{0%,100%{transform:none}20%{transform:translate(3px,-2px)}40%{transform:translate(-3px,1px)}60%{transform:translate(2px,2px)}80%{transform:translate(-2px,-1px)}}
.hint{position:absolute;left:50%;top:440px;transform:translateX(-50%);font:14px "Huninn";color:#fff;background:rgba(60,35,10,.55);padding:6px 14px;border-radius:999px;white-space:nowrap;animation:bob 1.6s ease-in-out infinite}
@keyframes bob{50%{transform:translate(-50%,-4px)}}
/* ===== HUD ===== */
.plaque{position:absolute;left:10px;top:12px;height:50px;width:182px;padding:5px 10px 0 58px;border-radius:14px;background:var(--noise),var(--grain),linear-gradient(180deg,var(--wood1),var(--wood2));box-shadow:inset 0 2px 0 rgba(255,220,170,.45),inset 0 -3px 0 rgba(0,0,0,.25),0 3px 0 var(--wood3),0 5px 8px rgba(0,0,0,.3)}
.ava{position:absolute;left:-4px;top:-6px;width:60px;height:60px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#FFF4D6,#F2D8A0);border:4px solid #F2C14E;box-shadow:0 0 0 3px var(--wood3),0 4px 6px rgba(0,0,0,.35);overflow:hidden}
.ava img{width:120%;margin:-2px 0 0 -10%}
.lv{position:absolute;left:34px;top:32px;width:28px;height:28px;display:grid;place-items:center;font:14px "Huninn";color:#fff;background:linear-gradient(180deg,var(--g1),var(--g2));clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);text-shadow:0 1px 0 var(--g3)}
.lvw{position:absolute;left:32px;top:30px;width:32px;height:32px;background:var(--g3);clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)}
.pname{font:17px "Huninn";color:#FFF6E2;text-shadow:0 2px 0 var(--wood3),1px 0 0 var(--wood3),-1px 0 0 var(--wood3);line-height:1.2}
.xp{margin-top:5px;height:9px;border-radius:9px;background:#3E2410;box-shadow:inset 0 2px 2px rgba(0,0,0,.4);overflow:hidden}
.xp i{display:block;height:100%;width:62%;border-radius:9px;background:linear-gradient(180deg,#C6F48A,#6DC53A);box-shadow:inset 0 2px 0 rgba(255,255,255,.5)}
.cur{position:absolute;top:16px;height:38px;padding:0 12px 0 34px;border-radius:999px;display:flex;align-items:center;font:19px "Huninn";color:#fff;text-shadow:0 2px 0 #3E2410,1px 0 0 #3E2410,-1px 0 0 #3E2410;background:linear-gradient(180deg,#6E4422,#4E2D12);box-shadow:inset 0 2px 0 rgba(255,220,170,.25),inset 0 0 0 2px rgba(0,0,0,.25),0 3px 6px rgba(0,0,0,.3)}
.cur img{position:absolute;left:-8px;top:50%;transform:translateY(-50%);height:42px;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))}
.cur.bump{animation:bump .35s cubic-bezier(.3,1.8,.5,1)}
@keyframes bump{40%{transform:scale(1.18)}}
.rb{position:absolute;width:56px;height:56px;border-radius:50%;display:grid;place-items:center;cursor:pointer;background:radial-gradient(circle at 38% 30%,#FFFDF4 0,#F7E9C8 55%,#E6CE9C 100%);box-shadow:inset 0 -3px 0 rgba(140,90,40,.25),0 0 0 4px var(--wood1),0 0 0 6px var(--wood3),0 5px 0 2px var(--wood3),0 7px 10px rgba(0,0,0,.3);transition:transform .08s}
.rb:active,.rb.pr{transform:translateY(3px) scale(.96)}
.rb img{width:38px;height:38px;object-fit:contain;filter:drop-shadow(0 2px 1px rgba(80,50,20,.3))}
.rb b{position:absolute;bottom:-17px;left:50%;transform:translateX(-50%);font:400 13px "Huninn";color:#fff;white-space:nowrap;text-shadow:0 1.5px 0 var(--wood3),1.5px 0 0 var(--wood3),-1.5px 0 0 var(--wood3),0 -1px 0 var(--wood3)}
.badge{position:absolute;top:-6px;right:-6px;min-width:22px;height:22px;padding:0 6px;border-radius:11px;font:13px "Huninn";color:#fff;display:grid;place-items:center;background:linear-gradient(180deg,var(--r1),var(--r2));box-shadow:0 0 0 2.5px #fff,0 2px 3px rgba(0,0,0,.3)}
.big{position:absolute;right:16px;bottom:22px;width:86px;height:86px;border-radius:50%;cursor:pointer;display:grid;place-items:center;background:radial-gradient(circle at 36% 28%,#D8FFA8 0,var(--g1) 30%,var(--g2) 78%,var(--g3) 100%);box-shadow:inset 0 -5px 0 rgba(0,0,0,.18),inset 0 4px 0 rgba(255,255,255,.45),0 0 0 5px #fff,0 0 0 8px var(--g3),0 8px 0 3px #1F4A0E,0 10px 16px rgba(0,0,0,.35);transition:transform .08s}
.big:active{transform:translateY(4px)}
.big img{width:46px;margin-top:-10px;filter:drop-shadow(0 2px 1px rgba(0,0,0,.3))}
.big b{position:absolute;bottom:10px;font:16px "Huninn";color:#fff;text-shadow:0 2px 0 var(--g3)}
.joy{position:absolute;left:22px;bottom:30px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.18) 0,rgba(255,255,255,.08) 60%,rgba(255,255,255,.22) 61%,rgba(255,255,255,.05) 70%);box-shadow:inset 0 0 0 3px rgba(255,255,255,.45),0 4px 10px rgba(0,0,0,.15)}
.joy i{position:absolute;left:50%;top:50%;width:52px;height:52px;margin:-26px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#fff,#EDE3CF);box-shadow:0 4px 0 rgba(0,0,0,.18),0 6px 10px rgba(0,0,0,.2)}
/* 收成回饋 */
.fly{position:absolute;pointer-events:none;z-index:20}
.pop{position:absolute;pointer-events:none;z-index:21;font:30px "Huninn";color:#fff;white-space:nowrap;text-shadow:0 3px 0 var(--o3),2px 0 0 var(--o3),-2px 0 0 var(--o3),0 -2px 0 var(--o3),0 5px 8px rgba(0,0,0,.3);animation:popup 1.1s cubic-bezier(.2,1.4,.4,1) forwards}
@keyframes popup{0%{transform:translate(-50%,0) scale(.3);opacity:0}25%{transform:translate(-50%,-34px) scale(1.15);opacity:1}45%{transform:translate(-50%,-40px) scale(1)}100%{transform:translate(-50%,-70px) scale(1);opacity:0}}
.prt{position:absolute;pointer-events:none;z-index:19}
.toast{position:absolute;left:50%;top:80px;z-index:30;transform:translate(-50%,-20px);opacity:0;padding:9px 18px 10px;border-radius:16px;font:16px "Huninn";color:#fff;white-space:nowrap;background:var(--noise),var(--grain),linear-gradient(180deg,var(--wood1),var(--wood2));box-shadow:inset 0 2px 0 rgba(255,220,170,.45),0 3px 0 var(--wood3),0 6px 12px rgba(0,0,0,.3);text-shadow:0 1.5px 0 var(--wood3);transition:.25s cubic-bezier(.3,1.5,.5,1)}
.toast.on{opacity:1;transform:translate(-50%,0)}
/* ===== 面板 ===== */
.dim{position:absolute;inset:0;background:rgba(30,18,6,.55)}
.panel{position:absolute;left:10px;right:10px;bottom:10px;top:118px;border-radius:24px;padding:12px;background:var(--noise),var(--grain),linear-gradient(180deg,var(--wood1),var(--wood2));box-shadow:inset 0 2px 0 rgba(255,220,170,.45),inset 0 -3px 0 rgba(0,0,0,.25),0 4px 0 var(--wood3),0 12px 30px rgba(0,0,0,.45)}
.paper{position:relative;height:100%;border-radius:16px;padding:34px 16px 16px;overflow:auto;color:var(--ink);background:var(--noise),radial-gradient(ellipse at 50% 0,#FFFDF5 0,var(--paper) 50%,var(--paper2) 100%);box-shadow:inset 0 0 0 2px rgba(120,70,30,.25),inset 0 0 18px rgba(150,100,40,.25)}
.ribbon{position:absolute;left:50%;top:-14px;z-index:2;transform:translateX(-50%);padding:8px 30px 10px;border-radius:12px;font:20px "Huninn";color:#fff;white-space:nowrap;background:linear-gradient(180deg,var(--g1),var(--g2));text-shadow:0 2px 0 var(--g3);box-shadow:inset 0 2px 0 rgba(255,255,255,.45),0 4px 0 var(--g3),0 6px 8px rgba(0,0,0,.25)}
.ribbon::before,.ribbon::after{content:"";position:absolute;top:12px;width:20px;height:28px;background:var(--g3);z-index:-1}
.ribbon::before{left:-12px;clip-path:polygon(0 0,100% 0,100% 100%,0 100%,45% 50%)}.ribbon::after{right:-12px;clip-path:polygon(0 0,100% 0,55% 50%,100% 100%,0 100%)}
.xbtn{position:absolute;right:2px;top:-4px;z-index:3;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;font:22px "Huninn";color:#fff;background:linear-gradient(180deg,var(--r1),var(--r2));box-shadow:inset 0 2px 0 rgba(255,255,255,.4),0 0 0 3px #fff,0 4px 0 2px var(--r3),0 6px 8px rgba(0,0,0,.3);text-shadow:0 2px 0 var(--r3)}
.medal{position:relative;width:200px;height:170px;margin:0 auto}
.medal .glow{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.95) 0,rgba(255,214,110,.55) 38%,rgba(255,214,110,0) 68%)}
.medal .rays{position:absolute;left:50%;top:50%;width:300px;height:300px;margin:-150px;background:repeating-conic-gradient(rgba(255,210,100,.35) 0 6deg,transparent 6deg 20deg);-webkit-mask:radial-gradient(circle,#000 15%,transparent 55%);mask:radial-gradient(circle,#000 15%,transparent 55%);animation:spin 24s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.medal img{position:absolute;left:50%;top:48%;width:118px;transform:translate(-50%,-50%);filter:drop-shadow(0 8px 8px rgba(90,60,10,.3));animation:fbob 3s ease-in-out infinite}
@keyframes fbob{50%{transform:translate(-50%,-56%)}}
.medal .ped{position:absolute;left:50%;bottom:8px;width:130px;height:24px;margin-left:-65px;border-radius:50%;background:radial-gradient(ellipse,rgba(160,110,40,.35),transparent 70%)}
.nm{text-align:center;font:30px "Huninn";color:#9A5A00;margin:2px 0 6px;background:linear-gradient(180deg,#F2A51E,#9A5A00);-webkit-background-clip:text;background-clip:text;color:transparent}
.chips{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:12px}
.chip{display:inline-flex;align-items:center;gap:4px;padding:4px 11px;border-radius:999px;font:14px "Huninn";background:#fff;color:var(--ink);box-shadow:inset 0 0 0 2px #E5CFA5,0 2px 0 #D6BC8C}
.chip.gold{background:linear-gradient(180deg,#FFF1B8,#F6CF57);color:#6A4200;box-shadow:inset 0 0 0 2px #D59A1E,0 2px 0 #B07A10}
.card{background:rgba(255,255,255,.7);border-radius:14px;padding:10px 12px;margin:8px 0;box-shadow:inset 0 0 0 2px #EBD7AF,0 2px 0 #DCC394}
.card .lb{display:flex;justify-content:space-between;align-items:center;font:15px "Huninn";color:var(--ink)}
.card .lb small{font:13px "Noto Sans TC";color:var(--ink2)}
.bar{height:14px;border-radius:10px;margin-top:6px;background:#E9D9B8;box-shadow:inset 0 2px 3px rgba(120,80,30,.35);overflow:hidden}
.bar i{display:block;height:100%;border-radius:10px;background:linear-gradient(180deg,#B9F27A,#5DB332);box-shadow:inset 0 3px 0 rgba(255,255,255,.45)}
.dots{display:flex;gap:6px;margin-top:6px}.dots i{width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#FF9B86,#D9482F);box-shadow:inset 0 -2px 0 rgba(0,0,0,.2),0 0 0 2px #fff,0 2px 0 2px #C9A876}.dots i.off{background:#E5D6B6;box-shadow:inset 0 2px 3px rgba(120,80,30,.3)}
.btns{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
.b3{position:relative;border:0;border-radius:16px;padding:12px 8px 13px;cursor:pointer;font:19px "Huninn";color:#fff;line-height:1.15;transition:transform .08s}
.b3 small{display:block;font:13px "Noto Sans TC";opacity:.95;margin-top:3px}
.b3:active,.b3.pr{transform:translateY(4px)}
.b3.gold{background:linear-gradient(180deg,var(--o1),var(--o2));text-shadow:0 2px 0 var(--o3);box-shadow:inset 0 2px 0 rgba(255,255,255,.55),inset 0 -3px 0 rgba(0,0,0,.1),0 5px 0 var(--o3),0 7px 10px rgba(0,0,0,.25)}
.b3.gold:active{box-shadow:inset 0 2px 0 rgba(255,255,255,.55),0 1px 0 var(--o3)}
.b3.green{background:linear-gradient(180deg,var(--g1),var(--g2));text-shadow:0 2px 0 var(--g3);box-shadow:inset 0 2px 0 rgba(255,255,255,.5),inset 0 -3px 0 rgba(0,0,0,.1),0 5px 0 var(--g3),0 7px 10px rgba(0,0,0,.25)}
.b3.green:active{box-shadow:inset 0 2px 0 rgba(255,255,255,.5),0 1px 0 var(--g3)}
.b3.blue{background:linear-gradient(180deg,var(--b1),var(--b2));text-shadow:0 2px 0 var(--b3);box-shadow:inset 0 2px 0 rgba(255,255,255,.5),0 5px 0 var(--b3),0 7px 10px rgba(0,0,0,.25)}
.b3.wood{background:var(--grain),linear-gradient(180deg,#FFF3D6,#EBD3A2);color:var(--ink);text-shadow:none;box-shadow:inset 0 2px 0 #fff,0 5px 0 #B98D52,0 7px 10px rgba(0,0,0,.2)}
.b3 .ic{height:22px;vertical-align:-4px;margin-right:4px}
.pv{display:flex;gap:6px;margin-top:8px}.pv span{flex:1;text-align:center;font:12px "Noto Sans TC";color:var(--ink2)}.pv img{width:44px;display:block;margin:0 auto 2px}
/* ===== 元件規格 ===== */
.spec{background:var(--noise),#3A2C1D;border-radius:18px;padding:16px;display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.spec>div{background:var(--noise),linear-gradient(180deg,#FFFDF5,var(--paper2));color:var(--ink);border-radius:14px;padding:12px}
.spec h3{margin:0 0 8px;font:400 18px "Huninn"}
.sw{display:inline-flex;flex-direction:column;align-items:center;gap:3px;margin:0 6px 8px 0;font-size:11px}.sw i{width:44px;height:30px;border-radius:8px;box-shadow:inset 0 0 0 2px rgba(0,0,0,.12)}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style></head><body><div class="wrap">
<h1>介面改版樣品</h1>
<p class="lead">全部用程式畫（不用 AI 素材、不用音效檔）。左邊是現在的遊戲，右邊是新樣式，可以直接操作：<b>點農場上的番茄＝收成回饋</b>（有聲音，第一次點會開啟音效），按鈕按下去會凹。字體：標題與數字用「粉圓」（Huninn，Google Fonts），內文用思源黑體。</p>

<h2 class="sec">1　農場畫面</h2>
<div class="row">
 ${old.includes('ui_old_farm.png')?'<div class="col"><img class="oldimg" src="ui_old_farm.png" alt="現在的農場畫面"><span class="cap">現在</span></div>':''}
 <div class="col"><div class="phone" id="ph1">
  <div class="farm" id="farm"></div>
  <div class="plaque"><div class="ava"><img src="../assets/char/npc/npc_kai.png" alt=""></div><div class="lvw"></div><div class="lv">12</div><div class="pname">小農夫</div><div class="xp"><i></i></div></div>
  <div class="cur" id="coin" style="right:14px;width:118px"><img src="../assets/icons/s/coin.png" alt=""><span id="coinN">1,000</span></div>
  ${[['seed_bag','種子袋',90,'新'],['codex','圖鑑',180],['quest','任務',270,'2'],['genes','遺傳',360]].map(([i,n,t,bd])=>`<div class="rb" id="rb_${i}" style="left:16px;top:${t}px"><img src="../assets/icons/s/${i}.png" alt=""><b>${n}</b>${bd?`<span class="badge">${bd}</span>`:''}</div>`).join('')}
  ${[['town','城鎮',90],['explore','探索',180],['decor','裝飾',270],['settings','設定',360]].map(([i,n,t])=>`<div class="rb" style="right:16px;top:${t}px"><img src="../assets/icons/s/${i}.png" alt=""><b>${n}</b></div>`).join('')}
  <div class="hint" id="hint">點一下成熟的番茄</div>
  <div class="joy"><i></i></div>
  <div class="big"><img src="../assets/icons/s/seed_bag.png" alt=""><b>種植</b></div>
  <div class="toast" id="toast"></div>
 </div><span class="cap">新：木牌名片＋等級徽章、金幣錢包、圓形按鈕（按下會凹）、大的種植鈕</span></div>
</div>

<h2 class="sec">2　植株資訊</h2>
<div class="row">
 ${old.includes('ui_old_panel.png')?'<div class="col"><img class="oldimg" src="ui_old_panel.png" alt="現在的植株資訊"><span class="cap">現在</span></div>':''}
 <div class="col"><div class="phone"><div class="farm" id="farm2"></div><div class="dim"></div>
  <div class="panel"><div class="ribbon">番茄・第 1 塊地</div><div class="xbtn">✕</div><div class="paper">
   <div class="medal"><div class="rays"></div><div class="glow"></div><div class="ped"></div><img id="bigfruit" alt=""></div>
   <div class="nm">金字塔番茄</div>
   <div class="chips"><span class="chip gold">★ 名品</span><span class="chip">三角形</span><span class="chip">金色</span><span class="chip">大</span></div>
   <div class="card"><div class="lb">外觀穩定度<small>自交後約 100% 一樣</small></div><div class="bar"><i style="width:100%"></i></div></div>
   <div class="card"><div class="lb">還能採收<small>2／3 次</small></div><div class="dots"><i></i><i></i><i class="off"></i></div></div>
   <div class="btns"><button class="b3 gold"><img class="ic" src="../assets/icons/s/coin.png" alt="">賣果實<small>+246 金幣</small></button><button class="b3 green"><img class="ic" src="../assets/icons/s/seed_bag.png" alt="">取種<small>18 顆放回原包</small></button></div>
   <div class="card"><div class="lb">自交的後代<small>1 種外觀</small></div><div class="pv" id="pv"></div></div>
  </div></div></div><span class="cap">新：木框＋紙張面板、緞帶標題、果實站在光座上、資訊做成小卡片、立體按鈕</span></div>
</div>

<h2 class="sec">3　元件規格</h2>
<div class="spec">
 <div><h3>配色</h3>${[['木頭','#A86C3A'],['深木','#55300F'],['紙張','#FFF8E8'],['墨色','#4A3020'],['綠（主要）','#4E9F2C'],['金（賣、獎勵）','#F09A1E'],['紅（關閉、提醒）','#D9482F'],['藍（資訊）','#3A8FD6']].map(([n,c])=>`<span class="sw"><i style="background:${c}"></i>${n}</span>`).join('')}</div>
 <div><h3>字體</h3><div class="fd" style="font-size:28px;color:#9A5A00">粉圓：標題、數字 1,234</div><div style="font-size:15px;margin-top:6px">思源黑體：內文、說明文字，小字也清楚。</div><div class="fd" style="font-size:24px;color:#fff;text-shadow:0 2px 0 #55300F,2px 0 0 #55300F,-2px 0 0 #55300F,0 -2px 0 #55300F;margin-top:8px">畫面上的字加描邊</div></div>
 <div><h3>按鈕</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><button class="b3 green">確定</button><button class="b3 gold">賣出</button><button class="b3 blue">查看</button><button class="b3 wood">取消</button></div><p style="font-size:12px;color:#7A6250;margin:10px 0 0">按下去會往下凹、影子變短；全部都有厚度。</p></div>
 <div><h3>標籤與提示</h3><div class="chips" style="justify-content:flex-start"><span class="chip gold">★ 名品</span><span class="chip">三角形</span><span class="chip">金色</span></div><div style="position:relative;height:50px"><div class="toast on" style="top:4px">收成了 3 株，+54 顆種子</div></div></div>
</div>
</div>
<script>
${src}
const IMG=${JSON.stringify(IMG)};
const PB={};
function loadAll(){return Promise.all(Object.entries(IMG).map(([k,u])=>new Promise(res=>{const im=new Image();im.onload=()=>{const cv=document.createElement('canvas');cv.width=im.naturalWidth;cv.height=im.naturalHeight;const cx=cv.getContext('2d');cx.drawImage(im,0,0);const id=cx.getImageData(0,0,cv.width,cv.height);PB[k]=fruitPrep(id.width,id.height,id.data);PB[k].sm=stemMulOf(k);res()};im.onerror=res;im.src=u})))}
function fruitURL(name,a){const B=PB[name];if(!B)return '';const px=fruitPaint(B,a,1,hashStr(name+a.skin),0,0);const cv=document.createElement('canvas');cv.width=B.w;cv.height=B.h;const cx=cv.getContext('2d');const id=cx.createImageData(B.w,B.h);id.data.set(px);cx.putImageData(id,0,0);return cv.toDataURL()}
/* ===== 合成音效（Web Audio，不用音效檔） ===== */
let AC=null;const ac=()=>{if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC};
function tone(f0,f1,dur,type,vol,delay){const a=ac();if(!a)return;const t=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+dur);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.2,t+0.012);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g).connect(a.destination);o.start(t);o.stop(t+dur+0.02)}
const SFX={pop:()=>{tone(520,170,0.14,'sine',0.35);tone(1200,600,0.06,'triangle',0.08)},
  coin:d=>{tone(1318,null,0.09,'square',0.05,d);tone(1975,null,0.22,'triangle',0.12,(d||0)+0.07)},
  sparkle:()=>[1046,1318,1568,2093].forEach((f,i)=>tone(f,null,0.25,'triangle',0.07,i*0.05)),
  click:()=>tone(880,660,0.05,'sine',0.12),
  whoosh:()=>{const a=ac();if(!a)return;const n=a.createBufferSource(),b=a.createBuffer(1,a.sampleRate*0.3,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);n.buffer=b;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(600,a.currentTime);f.frequency.exponentialRampToValueAtTime(2400,a.currentTime+0.25);const g=a.createGain();g.gain.value=0.12;n.connect(f).connect(g).connect(a.destination);n.start()}};
/* ===== 農場 ===== */
const TILES=[];for(let r=0;r<7;r++)for(let c=0;c<4;c++){const x=66+c*84+(r%2)*42,y=482+r*24;if(x<360)TILES.push([x,y,r,c])}
function buildFarm(el,withPlants,fruits){let s='';for(const [x,y] of TILES)s+='<div class="tile" style="left:'+(x-43)+'px;top:'+(y-25)+'px"></div>';el.innerHTML=s;
  if(!withPlants)return;const spots=TILES.map((t,k)=>k).filter(k=>TILES[k][2]===0||TILES[k][2]===3||TILES[k][2]===6).slice(0,11);spots.forEach((k,i)=>{const [x,y]=TILES[k];const d=document.createElement('div');d.className='plant';d.style.cssText='left:'+(x-30)+'px;top:'+(y-62)+'px;width:60px;height:64px';d.innerHTML='<img class="pl" src="../assets/crops/tomato_3.png" alt=""><img class="fr" src="'+fruits[i%fruits.length]+'" alt="">';d.onclick=e=>harvest(d,e);el.appendChild(d)})}
function partBurst(ph,x,y){const cols=['#FFE27A','#FFB347','#8EDB5A','#FFFFFF','#FF8FB1'];for(let i=0;i<16;i++){const p=document.createElement('div');p.className='prt';const leaf=i%3===0,a=Math.random()*Math.PI*2,d=40+Math.random()*60,sz=leaf?12:7+Math.random()*5;
  p.style.cssText='left:'+x+'px;top:'+y+'px;width:'+sz+'px;height:'+(leaf?sz*0.55:sz)+'px;background:'+(leaf?'#6DBE3C':cols[i%cols.length])+';border-radius:'+(leaf?'60% 0':'50%')+';box-shadow:0 0 6px '+(leaf?'transparent':'rgba(255,240,180,.9)');ph.appendChild(p);
  p.animate([{transform:'translate(-50%,-50%) scale(.4) rotate(0)',opacity:1},{transform:'translate(calc(-50% + '+Math.cos(a)*d+'px),calc(-50% + '+(Math.sin(a)*d-30)+'px)) scale(1) rotate('+(Math.random()*360)+'deg)',opacity:1,offset:.6},{transform:'translate(calc(-50% + '+Math.cos(a)*d*1.1+'px),calc(-50% + '+(Math.sin(a)*d+20)+'px)) scale(.6) rotate(400deg)',opacity:0}],{duration:900,easing:'cubic-bezier(.2,.8,.4,1)'}).onfinish=()=>p.remove()}}
function flyTo(ph,src,x,y,tx,ty,w,dur,delay,done){const f=document.createElement('img');f.className='fly';f.src=src;f.style.cssText='left:'+x+'px;top:'+y+'px;width:'+w+'px;opacity:0';ph.appendChild(f);
  const mx=(x+tx)/2+(Math.random()*60-30),my=Math.min(y,ty)-120;
  const an=f.animate([{transform:'translate(-50%,-50%) scale(.4)',opacity:0},{transform:'translate(calc(-50% + 0px),calc(-50% - 50px)) scale(1.2)',opacity:1,offset:.22},{transform:'translate(calc(-50% + '+(mx-x)+'px),calc(-50% + '+(my-y)+'px)) scale(1)',opacity:1,offset:.6},{transform:'translate(calc(-50% + '+(tx-x)+'px),calc(-50% + '+(ty-y)+'px)) scale(.45)',opacity:.9}],{duration:dur,delay,easing:'cubic-bezier(.4,0,.6,1)',fill:'forwards'});an.onfinish=()=>{f.remove();done&&done()}}
let coins=1000,busy=new Set();
function toast(t){const el=document.getElementById('toast');el.textContent=t;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),1800)}
function harvest(d,e){if(busy.has(d))return;busy.add(d);document.getElementById('hint').style.display='none';const ph=document.getElementById('ph1'),pr=ph.getBoundingClientRect(),r=d.getBoundingClientRect(),x=r.left-pr.left+r.width/2-6,y=r.top-pr.top+18;
  SFX.pop();SFX.sparkle();d.classList.remove('sq');void d.offsetWidth;d.classList.add('sq');ph.classList.remove('shake');void ph.offsetWidth;ph.classList.add('shake');partBurst(ph,x,y);
  const fr=d.querySelector('.fr');fr.style.opacity=0;const pop=document.createElement('div');pop.className='pop';pop.style.left=x+'px';pop.style.top=(y-30)+'px';pop.textContent='+18 顆';ph.appendChild(pop);setTimeout(()=>pop.remove(),1200);
  const bag=document.getElementById('rb_seed_bag').getBoundingClientRect(),bx=bag.left-pr.left+28,by=bag.top-pr.top+28;
  setTimeout(SFX.whoosh,120);flyTo(ph,fr.src,x,y,bx,by,34,700,80,()=>{const b=document.getElementById('rb_seed_bag');b.classList.remove('pr');void b.offsetWidth;b.classList.add('pr');setTimeout(()=>b.classList.remove('pr'),120);SFX.click()});
  const cr=document.getElementById('coin').getBoundingClientRect(),cx=cr.left-pr.left+14,cy=cr.top-pr.top+19;
  for(let i=0;i<5;i++)flyTo(ph,'../assets/icons/s/coin.png',x+(Math.random()*30-15),y,cx,cy,26,650,250+i*70,()=>{coins+=6;document.getElementById('coinN').textContent=coins.toLocaleString();const c=document.getElementById('coin');c.classList.remove('bump');void c.offsetWidth;c.classList.add('bump');SFX.coin()});
  setTimeout(()=>toast('收成了！+18 顆種子，+30 金幣'),900);
  setTimeout(()=>{fr.style.transition='opacity .4s';fr.style.opacity=1;setTimeout(()=>{fr.style.transition='';busy.delete(d)},400)},2600)}
document.querySelectorAll('.rb,.b3,.big,.xbtn').forEach(b=>b.addEventListener('pointerdown',()=>SFX.click()));
loadAll().then(()=>{const fr=[fruitURL('tomato_b0',{skin:'red',pat:null}),fruitURL('tomato_b1',{skin:'orange',pat:null}),fruitURL('tomato_b0',{skin:'l-gold',sb:'red',pat:null}),fruitURL('tomato_b0',{skin:'red',pat:{c:'yellow',f:0}})];
  buildFarm(document.getElementById('farm'),true,fr);buildFarm(document.getElementById('farm2'),true,fr);
  document.getElementById('bigfruit').src=fruitURL('tomato_sp2',{skin:'gold',pat:null});
  const dm=/demo=(\d+)/.exec(location.search);if(dm){const d=document.querySelectorAll('#farm .plant')[5];harvest(d);const t=+dm[1];requestAnimationFrame(()=>{document.getAnimations().forEach(a=>{a.pause();a.currentTime=t})})}/* 截圖用：收成後把所有動畫停在第 t 毫秒 */
  const pv=[[{skin:'gold',pat:null},'tomato_sp2','100%']];document.getElementById('pv').innerHTML=pv.map(([a,n,p])=>'<span><img src="'+fruitURL(n,a)+'" alt="">'+p+'</span>').join('')+'<span style="flex:3;text-align:left;align-self:center">自交後代全部都是金字塔番茄。</span>'});
</script></body></html>`;
fs.writeFileSync(path.join(__dirname,'ui_mock.html'),page);
console.log('ok',(page.length/1024).toFixed(0)+' KB');
