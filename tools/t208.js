/* 第 208 節：發光的植株（點、撿取鍵、點的範圍、走不到）、世界地圖小卡、野外地圖鍵、武器升階素材。由 tload.js 呼叫，也可以單獨跑：node tools/t208.js */
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..'),h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';globalThis.T={newGame,matSrc,ROAM_PTS,REGION_MAPS,regPrep,regBlocked,regPlants,regItems,exCorner,roamWalkPt,roamBtnO,WP_UP2,WEAPONS,MATS,wpUpNeed,wpUpDo,wpUpUses,worldMapHTML,matsObj,setScene(v){scene=v},get state(){return state},set wmSel(v){wmSel=v}};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[208] '+m);if(!c)fails++};
T.newGame();T.setScene('explore');const st=T.state;
/* 208.1：每張 5 個點，都不在邊、都可走 */
let bad=[],n=0;for(const bk in T.ROAM_PTS)for(const id in T.ROAM_PTS[bk]){const M=T.regPrep(bk,id),L=T.ROAM_PTS[bk][id];n++;if(L.length!==5)bad.push(bk+'/'+id+' 只有 '+L.length);for(const [x,y] of L){if(y>M.H-180||x<160||x>M.W-160)bad.push(bk+'/'+id+' 邊上 '+x+','+y);if(T.regBlocked(M,x,y))bad.push(bk+'/'+id+' 擋住 '+x+','+y)}}
ok(!bad.length,`發光植株 ${n} 張地圖都 5 個點、離下緣 180／左右 160 以外、可以走${bad.length?'：'+bad.slice(0,4).join('；'):''}`);
/* 採種植株、道具不出現在角落（所有地區、30 天） */
let cw=0,ci=0;for(const bk in T.REGION_MAPS)for(const id in T.REGION_MAPS[bk]){const M=T.regPrep(bk,id);for(let d=1;d<=30;d++){for(const w of T.regPlants(bk,id,d))if(T.exCorner(M,w.x,w.y))cw++;for(const it of T.regItems(bk,id,d))if(T.exCorner(M,it.x,it.y))ci++}}
ok(cw===0&&ci===0,`採種植株、道具不在左下／右下角（植株 ${cw}、道具 ${ci}）`);
/* 走不到時走到最近的可走點 */
{const M=T.regPrep('grass','entry');vm.runInContext("exBiome='grass';regMap='entry'",ctx);let bp=null;for(let y=200;y<900&&!bp;y+=10)for(let x=200;x<600;x+=10)if(T.regBlocked(M,x,y+14)){bp=[x,y];break}
  const [tx,ty]=T.roamWalkPt({x:bp[0],y:bp[1]});ok(!T.regBlocked(M,tx,ty)&&Math.hypot(tx-bp[0],ty-bp[1])<=140,`植株腳下被擋住（${bp}）：改走到 (${Math.round(tx)},${Math.round(ty)})`)}
/* 撿取鍵：90 內有發光的植株就出現 */
{vm.runInContext("regMap='entry';exBiome='grass';ROAM.grass={map:'entry',x:400,y:600,crop:'tomato',spawnAt:Date.now(),takenBy:null}",ctx);
  vm.runInContext("exMe={x:400,y:670}",ctx);const a=T.roamBtnO();vm.runInContext("exMe={x:400,y:720}",ctx);const b=T.roamBtnO();
  ok(a&&a.d.roam&&!b,'站在植株 90 內撿取鍵會出現（70：有、120：沒有）')}
/* 208.2：小卡在 .wm 裡面 */
{T.wmSel='grass';st.lv=30;const H=T.worldMapHTML(),i=H.indexOf('class="wmcard"'),j=H.lastIndexOf('</div>');ok(i>0&&i<j&&/class="wmgo"/.test(H),'世界地圖小卡放在地圖容器裡、前往鍵在右側');T.wmSel=null}
/* 208.3：野外不再藏地圖鍵 */
ok(!/body\.h188\.wild #mapBtn\{display:none/.test(h)&&/rb\.prepend\(mp\)/.test(h),'野外不再藏地圖鍵、搬到左邊那一排最上面');
/* 208.4：每把每階都有素材、鍵都在 MATS、3 階起有眷屬素材 */
{let miss=[];for(const c in T.WEAPONS){for(let t=2;t<=6;t++){const L=(T.WP_UP2[c]||{})[t]||[];if(L.length<(t===4?1:2))miss.push(c+t);for(const [k] of L)if(!T.MATS[k])miss.push(c+t+':'+k);if(t>=3&&!L.some(([k])=>T.MATS[k]&&T.MATS[k].sv))miss.push(c+t+' 沒有眷屬素材');for(const [k] of L)if(!T.matSrc(k).length)miss.push(c+t+':'+k+' 沒有地方掉')}}ok(!miss.length,'九把武器 2～6 階的素材都接上 MATS、每一種都有地方掉'+(miss.length?'：'+miss.join(','):''))}
{st.weapons=[{crop:'tomato',tier:2,st:[1,1,1,1,1,1]}];st.lv=20;st.coins=1e5;const S=T.matsObj();S.ringstone=12;S.x_silver_stone=4;S.ravenfeather=2;st.fruits=[];
  const R=T.wpUpNeed(st.weapons[0]),mk=R.L.filter(x=>x.k==='mat').map(x=>x.m[0]+'×'+x.want).join(',');ok(R.t===3&&mk==='creekstone×12,x_silver_stone×4,ravenfeather×2','番茄劍 3 階要：溪石 12（環石沒有怪掉了，換溪石、環石也算）、銀晶 4、鴉羽 2（'+mk+'）');
  vm.runInContext("WP_UP[3].fn=0",ctx);const R2=T.wpUpNeed(st.weapons[0]);const r=R2.ok?T.wpUpDo(0):{err:'not ok'};ok(r.ok&&st.weapons[0].tier===3&&!S.ringstone&&!S.ravenfeather,'升 3 階：素材照表扣掉（手上的舊環石當替代品扣掉）')}
ok(T.wpUpUses('ravenfeather').length===9&&T.wpUpUses('hoop').some(x=>/升 2 階 ×10/.test(x)),'素材詳細頁的用途：鴉羽 9 把 3 階、鐵箍「升 2 階 ×10」');
if(fails)process.exitCode=1;
