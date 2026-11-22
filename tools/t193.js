/* 第 193 節：神寵跟隨看得到。由 tload.js 呼叫，也可以單獨跑：node tools/t193.js */
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..'),h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={newGame,petSVG,petCharG,petArt,petHW,PET_IMG,petStep,set face(v){meFace=v},get state(){return state}};';
let NOW=0;const imgs=[];
class Img{set src(v){this._s=v;imgs.push(this)}get src(){return this._s}}
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>NOW},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams,Image:Img};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[193] '+m);if(!c)fails++};
T.newGame();const st=T.state;
const pet={bk:'grass',st:0,xp:0};
/* 還沒載到：先用領主的 idle 圖（等確認），pet_grass_0.png 沒有 → 照用 idle */
let s=T.petSVG(pet,40);ok(/lord_grass_idle\.png/.test(s)&&/<image/.test(s),'幼獸也畫領主的 idle 圖');
for(const im of imgs.splice(0))(/pet_grass_0/.test(im.src)?im.onerror:im.onload)&&(/pet_grass_0/.test(im.src)?im.onerror():(im.naturalWidth=363,im.naturalHeight=343,im.onload()));
s=T.petSVG(pet,40);ok(/lord_grass_idle/.test(s)&&(s.match(/<ellipse/g)||[]).length===1&&/opacity="0.25"|opacity="\.25"/.test(s),'幼獸：一圈淡光');
ok((T.petSVG({bk:'grass',st:2},40).match(/<ellipse/g)||[]).length===2,'完全體：兩圈光');
/* 有 pet_<地區>_<階段>.png 就優先用 */
const p1={bk:'forest',st:1};T.petSVG(p1,40);for(const im of imgs.splice(0)){im.naturalWidth=300;im.naturalHeight=300;im.onload()}
ok(/pet_forest_1\.png/.test(T.petSVG(p1,40)),'有 pet_forest_1.png 就用它');
/* 圖載不到才退回圓球 */
const p2={bk:'marsh',st:2};T.petSVG(p2,40);for(const im of imgs.splice(0))im.onerror();
ok(!/<image/.test(T.petSVG(p2,40)),'圖載不到退回佔位');
/* 高度＝人物 85%，跟在身後、滑過去 */
ok(Math.abs(T.petHW()-57.5*1.15*.85)<8,'高度約人物的 85%：'+T.petHW().toFixed(1));
st.pets=[pet];st.petOn=0;
pet.id='p1';st.petOn='p1';T.face=1;
NOW=1000;const a={...T.petStep()};NOW=1016;T.face=3;let b={...T.petStep()};const gap0=Math.abs(b.x-a.x);
for(let i=0;i<20;i++){NOW+=16;b={...T.petStep()}}
ok(gap0>0&&gap0<30&&Math.abs(Math.abs(b.x-a.x)-60)<3,`換方向滑過去（第一格移 ${gap0.toFixed(1)}，0.32 秒後差 ${Math.abs(b.x-a.x).toFixed(1)}）`);
ok(/id="petG"/.test(T.petCharG())&&/<image/.test(T.petCharG()),'跟隨的 petG 用圖');
if(fails)process.exitCode=1;
