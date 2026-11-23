/* 第 211 節：NPC 新人物圖（阿土伯、維恩、提歐神父）——地圖上的站姿、轉向、對話頭像與表情。由 tload.js 呼叫，也可以單獨跑：node tools/t211.js */
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..'),h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={newGame,TOWN_NPC,townNpcSVG,regNpcSVG,vnParse,vnPortrait,t201,npcTalk,MQ2,NPC2_ID,NPC2_ST,setMF(j){NPC2_MF=j},setScene(v){scene=v},set townMap(v){townMap=v},set me(v){marketMe=v},get state(){return state}};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[211] '+m);if(!c)fails++};
const MF=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/npc/manifest.json'),'utf8'));
ok(['atubo','wein','theo'].every(id=>MF.npcs[id]&&fs.existsSync(path.join(ROOT,'assets/npc',id,'stand.png'))&&MF.npcs[id].faces.every(f=>fs.existsSync(path.join(ROOT,'assets/npc',id,'face_'+f+'.png')))),'三位的 stand.png、每個表情的 face 都在');
T.newGame();T.setScene('market');T.townMap='garden';const tu=T.TOWN_NPC.find(p=>p.id==='tu');
/* 圖還沒載好：照舊用換裝外觀 */
T.me={x:900,y:900};ok(!/assets\/npc\/atubo/.test(T.townNpcSVG(tu)),'圖還沒載好：照舊畫換裝外觀');
T.setMF(MF);for(const id of ['atubo','wein','theo'])T.NPC2_ST[id]=1;
/* 玩家很遠：正面（第 0 欄） */
let s=T.townNpcSVG(tu);ok(/assets\/npc\/atubo\/stand\.png/.test(s)&&/viewBox="0 0 128 192"/.test(s),'玩家很遠：畫新人物圖、正面');
const k=vm.runInContext('C3_HU/C3.H',ctx);ok(s.includes(`scale(${k.toFixed(3)} ${k.toFixed(3)})`),'縮放和玩家新版人物一樣（C3_HU/C3.H，外面同樣 ×1.15）');
/* 玩家在右邊 100：轉向右邊（左側那一欄鏡射） */
T.me={x:tu.x+100,y:tu.y};s=T.townNpcSVG(tu);ok(/viewBox="256 0 128 192"/.test(s)&&/scale\(-/.test(s),'玩家在右邊 100 以內：轉向右（側面、鏡射）');
T.me={x:tu.x-100,y:tu.y};s=T.townNpcSVG(tu);ok(/viewBox="256 0 128 192"/.test(s)&&!/scale\(-/.test(s),'玩家在左邊：轉向左（側面、不鏡射）');
T.me={x:tu.x,y:tu.y-100};s=T.townNpcSVG(tu);ok(/viewBox="512 0 128 192"/.test(s),'玩家在上面：背面');
/* 野外的維恩 */
const wi=T.TOWN_NPC.find(p=>p.id==='wien');ok(/assets\/npc\/wein\/stand\.png/.test(T.regNpcSVG(wi,690,580,false)),'野外（潟湖）的所長也換成新圖');
/* 對話頭像與表情 */
const pg=T.vnParse('阿土伯：{f:angry}兩株一模一樣｜還以為你在唸咒｜提歐神父：{f:surprised}光怎麼偏了',{kind:'narr'});
ok(pg[0].emo==='angry'&&pg[0].text==='兩株一模一樣'&&pg[1].emo==='normal'&&pg[2].emo==='surprised','{f:表情} 只管那一句，沒寫就是 normal');
ok(/assets\/npc\/atubo\/face_angry\.png/.test(T.vnPortrait(pg[0]))&&/assets\/npc\/theo\/face_surprised\.png/.test(T.vnPortrait(pg[2])),'對話頭像：face_<表情>.png');
ok(/face_normal\.png/.test(T.vnPortrait({kind:'npc',who:'theo',emo:'smile'})),'沒有的表情（神父沒有 smile）用 normal');
ok(!/\{f:/.test(T.npcTalk('tu','{f:smile}配出來不一樣')),'對話框文字不顯示 {f:…} 標記');
/* 第 201 節的句子照表設了表情 */
ok(/\{f:angry\}兩株一模一樣/.test(T.MQ2.find(x=>x.id==='0-3').open)&&/\{f:smile\}有空來研究所坐坐/.test(T.MQ2.find(x=>x.id==='0-4').open),'201 的句子照表設了表情（阿土伯 angry、維恩 smile…）');
if(fails)process.exitCode=1;
