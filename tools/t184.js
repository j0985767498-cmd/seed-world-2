/* 第 184 節：武器技能（189 起翻滾拿掉、普通攻擊改按攻擊鍵）。由 tload.js 呼叫，也可以單獨跑：node tools/t184.js */
const fs=require('fs'),vm=require('vm'),path=require('path');
const h=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
const timers=[];
js+=';var __errs=[];logErr=function(e,t){__errs.push(String(t)+": "+(e&&e.message))};globalThis.T={errs:()=>__errs,newGame,packState,SKILLS,SK_DO,skFx,SK_GLYPH,skDef,skCast,skHurt,atkTick,atkPress,atkRelease,get atkLock(){return atkLock},get moveTo(){return moveTo},skIv,SKB,get SKC(){return SKC},pDamage,get pHP(){return pHP},set pHP(v){pHP=v},pMax,setMon(L){MON_RT={list:L,due:[],xs:null}},setScene(v){scene=v},get state(){return state},curMe};';
const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:(f,ms)=>{timers.push([f,ms||0]);return 0},setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[184] '+m);if(!c)fails++};
const flush=()=>{let n=0;while(timers.length&&n<500){const [f]=timers.shift();try{f()}catch(e){}n++}};
/* 表：每一招都有做法、特效、圖示 */
{const miss=[];for(const [c,S] of Object.entries(T.SKILLS))for(const k of ['s1','s2','aw']){const id=S[k].id;if(!T.SK_DO[id]||!T.skFx[id]||!T.SK_GLYPH[id])miss.push(c+':'+id)}ok(!miss.length&&Object.keys(T.SKILLS).length===9,'9 weapons × (2 skills + awakening): every move has an action, an effect and an icon'+(miss.length?' missing '+miss:''));}
T.newGame();T.setScene('explore');const st=T.state;st.lv=20;st.weapons=[{crop:'broccoli',tier:1}];st.wpn=0;
/* 階：1 階技能 2 鎖著、3 階解鎖、4 階強化、6 階覺醒 */
{const tier=t=>{st.weapons[0].tier=t};tier(1);const a=T.skDef(2);tier(3);const b=T.skDef(2);tier(4);const c=T.skDef(1);tier(6);const d=T.skDef(2);tier(1);
  ok(a.locked&&!b.locked&&b.id==='wall'&&c.up&&d.id==='jail'&&d.cd===T.SKILLS.broccoli.s2.cd,'tier 1: skill 2 locked; 3: 岩壁; 4: skill 1 strengthened; 6: 岩之牢 (cooldown = skill 2)');}
/* 震地：r80 內 3 隻扣血、暈；冷卻 */
{const me=T.curMe();me.x=500;me.y=500;const M=[[540,500],[560,530],[555,460],[700,500]].map(([x,y],i)=>({k:'slime',x,y,hp:1e9,max:1e9,face:1,el:null}));T.setMon(M);
  ok(T.skCast(1),'skill 1 casts (震地)');const hit=M.map(m=>m.hp<1e9);ok(hit[0]&&hit[1]&&hit[2]&&!hit[3]&&M[0].stun>Date.now(),'震地 hits the 3 monsters within r80 (not the one at 200) and stuns them');
  ok(!T.skCast(1)&&T.SKC.s1>Date.now(),'… then it is on cooldown (8 s)');}
/* 189：沒按攻擊鍵時走進怪的範圍不會出手；按一下打一下 */
{const me=T.curMe();me.x=500;me.y=500;const M=[{k:'slime',x:520,y:500,hp:1e9,max:1e9,face:1,el:null}];T.setMon(M);for(let i=0;i<5;i++)T.atkTick();ok(M[0].hp===1e9,'no attack key pressed: a monster 20 away is not hit');
  T.atkPress();T.atkRelease();ok(M[0].hp<1e9&&T.atkLock&&T.atkLock.m===M[0],'tap the attack key: locks the nearest monster and hits once');
  const h1=M[0].hp;for(let i=0;i<5;i++)T.atkTick();ok(M[0].hp===h1,'… only once (released; next swing needs another press)');}
{const me=T.curMe();me.x=500;me.y=500;T.state.weapons=[];const M=[{k:'slime',x:600,y:500,hp:1e9,max:1e9,face:1,el:null}];T.setMon(M);T.atkPress();ok(T.atkLock&&T.atkLock.m===M[0]&&T.moveTo&&T.moveTo.x>500&&M[0].hp===1e9,'monster 100 away (out of reach, inside search 120): locked, walks toward it, not hit yet');T.atkRelease();T.state.weapons=[{crop:'broccoli',tier:1}];T.state.wpn=0;}
/* 翻滾拿掉（技能附帶的無敵照舊，見十字斬） */
{ok(!('skRoll' in T)&&typeof T.SKB.inv==='number','roll removed (skill invincibility still exists)');}
/* 岩壁：3 秒內受傷 −60% */
{st.weapons[0].tier=3;T.SKC.s2=0;T.SKB.inv=0;ok(T.skCast(2),'skill 2 casts (岩壁, tier 3)');T.pHP=1000;T.pDamage(1000);ok(Math.abs((1000-T.pHP)-1000*0.4*0.6)<2,'… damage taken −60% (melee −40% stacks): '+(1000-T.pHP));}
/* 集中砲火：普通攻擊間隔減半 */
{st.weapons=[{crop:'melon',tier:1}];st.wpn=0;T.SKC.s1=0;T.skCast(1);ok(T.skIv()===0.5,'浮游砲 集中砲火: normal attack interval ×0.5');}
/* 冷卻不存檔、舊存檔讀得到 */
{const s=T.packState(st);ok(!/SKC|skcd|"s1":\d{10}/.test(s)&&!('skc' in st)&&!('SKC' in st),'cooldowns are not saved');}
/* 27 招都放一次（含延遲的事件），沒有錯誤 */
{const me=T.curMe();let n=0;for(const c of Object.keys(T.SKILLS))for(const tier of [1,3,6]){st.weapons=[{crop:c,tier}];st.wpn=0;const M=[[540,500],[560,530],[555,460]].map(([x,y])=>({k:'slime',x,y,hp:1e9,max:1e9,face:1,el:null}));T.setMon(M);me.x=500;me.y=500;
  for(const sl of [1,2]){T.SKC.s1=0;T.SKC.s2=0;if(T.skCast(sl))n++;flush()}}
  const E=T.errs();ok(!E.length&&n===45,`every move cast once at tiers 1/3/6 (${n} casts), delayed events run, no errors`+(E.length?': '+E.slice(0,3).join(' | '):''));}
flush();
console.log(fails?('[184] FAILS '+fails):'[184] ALL PASS');if(fails)process.exitCode=1;
