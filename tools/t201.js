/* 第 201 節（第一次：序章、第一章）：渡界者、夢拿掉、祭壇前選第一位、大殿夜襲、老李／阿土伯、舊存檔。由 tload.js 呼叫，也可以單獨跑：node tools/t201.js */
const fs=require('fs'),vm=require('vm'),path=require('path');
const h=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let js=h.slice(h.indexOf('<script>',h.indexOf('</style>'))+8,h.lastIndexOf('</script>'));
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:P),apply:()=>P,construct:()=>P,set:()=>true});
js+=';var __notes=[],__vn=[];noteOpen=function(h){__notes.push(String(h))};vnPlay=function(pg,o){__vn.push(pg);if(o&&o.onEnd)o.onEnd()};globalThis.T={newGame,packState,loadSave,repairState,dreamNeed,altObj,altFull,fyWakeAlt,fyHas,mq2Cur,mq2Tick,MQ2,pick201,altarTap,raidGo,raidLoop,raidDeal,RAID,townNpcs,vnParse,t201,setScene(v){scene=v},set townMap(v){townMap=v},get notes(){return __notes},get vn(){return __vn},get state(){return state},set state(v){state=v},get pHP(){return pHP},set pHP(v){pHP=v}};';
const TQ=[];const ctx={document:P,window:P,firebase:P,navigator:P,location:{pathname:'/',search:'',hash:''},localStorage:P,console,setTimeout:(f)=>{TQ.push(f);return TQ.length},setInterval:()=>0,clearTimeout(){},clearInterval(){},requestAnimationFrame:()=>0,cancelAnimationFrame(){},fetch:()=>new Promise(()=>{}),btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),TextEncoder,Math,Date,JSON,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},innerWidth:400,innerHeight:800,devicePixelRatio:1,screen:P,history:P,alert(){},confirm:()=>true,URLSearchParams};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const T=ctx.T;let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+'[201] '+m);if(!c)fails++};const run=()=>{let n=0;while(TQ.length&&n++<200)try{TQ.shift()()}catch(e){}};
/* 201.1、201.1b：改字 */
ok(!/幾百年/.test(js)&&!/接住/.test(js)&&!/DREAM_L/.test(js)&&!/王國/.test(js),'程式裡沒有「幾百年」「接住」、夢的台詞');
ok(T.MQ2[0].open.includes('四十幾年')&&T.MQ2[0].open.includes('召喚的魔法')&&T.MQ2[1].open.includes('渡界者'),'序章：四十幾年、召喚的魔法、渡界者');
/* 夢拿掉；新遊戲有旗標 */
T.newGame();const st=T.state;ok(!T.dreamNeed()&&st.mq201V===1,'新遊戲：沒有夢、有 201 旗標');
/* {名}、{神} */
st.pname='小綠';const pg=T.vnParse('{名}：嗨｜阿土伯：你好，{名}',{kind:'narr'});ok(pg[0].name==='小綠'&&pg[0].text==='嗨'&&pg[1].who==='tu'&&pg[1].text==='你好，小綠','對話的 {名} 換成玩家名字、說話的人分得開');
/* 老李、阿土伯 */
T.setScene('market');T.townMap='plaza';let ids=T.townNpcs().map(p=>p.id);ok(ids.includes('li')&&!ids.includes('tu'),'城鎮：老李在、阿土伯不在');
T.townMap='garden';ok(T.townNpcs().some(p=>p.id==='tu'),'阿土伯在城郊菜圃');
/* 祭壇前選第一位 */
st.mq2={i:8,st:1,f:{}};const A=T.altObj('tomato');A.n=[3,3,3,3,3];A.cols=['red','yellow'];
ok(T.pick201()&&!T.fyWakeAlt('tomato','red')&&!T.fyHas('tomato'),'清單獻滿：九座一起亮；還沒選之前不能直接喚醒');
T.townMap='church_hall';T.altarTap('chili');run();ok(st.anchor==='chili'&&st.pick201===1&&!T.pick201(),'點卡宴的祭壇、確認：選了卡宴');
const n0=T.notes.length;ok(T.fyWakeAlt('tomato','yellow')&&T.fyHas('chili')&&!T.fyHas('tomato'),'選光芒顏色：醒來的是卡宴');
T.mq2Tick();run();const nt=T.notes.slice(n0).join('');ok(/光怎麼偏了/.test(nt)&&/大幹一場/.test(nt)&&/今晚為神之子祈福/.test(nt),'1-5 完成：光偏了、卡宴醒來的台詞、神父');
/* 夜襲 */
ok(T.mq2Cur().id==='1-6'&&st.mq2.st===1,'接著是 1-6 大殿夜襲（自動接下）');
const v0=T.vn.length;T.raidGo();ok(T.RAID.on&&T.RAID.foes.length===4,'4 個黑衣人');
T.pHP=5;const f=T.RAID.foes[0];f.x=400;f.y=600;ctx.marketMe=undefined;vm.runInContext('marketMe={x:400,y:610}',ctx);f.wind=-1;T.raidLoop();ok(T.pHP>=1,'被打到也不會死（血量最低 1，現在 '+T.pHP+'）');
for(const g of T.RAID.foes.slice(0,3))T.raidDeal(g,1e9,0);T.raidLoop();run();
ok(!T.RAID.on&&T.mq2Cur().id==='2-1','打倒 3 個：演出、1-6 完成、到第二章');
ok(T.vn.slice(v0).some(p=>p.some(x=>/八果實下落古籍/.test(x.text))),'演出：搶走《八果實下落古籍》');
/* 蘿瑪 */
T.newGame();const s2=T.state;s2.mq2={i:8,st:1,f:{}};const B=T.altObj('tomato');B.n=[3,3,3,3,3];B.cols=['red'];T.townMap='church_hall';T.altarTap('tomato');run();T.fyWakeAlt('tomato','red');const n1=T.notes.length;T.mq2Tick();run();
ok(T.fyHas('tomato')&&/……蘿瑪大人。/.test(T.notes.slice(n1).join(''))&&!/光怎麼偏了/.test(T.notes.slice(n1).join('')),'選蘿瑪：光直接落下、神父「……蘿瑪大人。」');
/* 舊存檔 */
const oldSave=f=>{T.newGame();const s=T.state;delete s.mq201V;f(s);const r=T.loadSave(T.packState(s));if(!r.state)throw new Error(r.err);T.repairState(r.state);T.state=r.state;return r.state};
{const s=oldSave(x=>{x.fairy.tomato={col:'red',no:1,evo:0};x.mq2={i:9,st:1,f:{}}});ok(s.mq2.i===10&&T.mq2Cur().id==='2-1'&&s.rc201===1,'舊存檔在第二章 2-1：往後挪一格、補演夜襲回顧');}
{const s=oldSave(x=>{x.mq2={i:6,st:1,f:{}}});ok(s.mq2.i===6&&!s.rc201,'舊存檔在第一章中途：位置不動、不演回顧');}
{const s=oldSave(x=>{x.anchor='melon';x.mq2={i:8,st:1,f:{}};const a=x.fairy.altar||(x.fairy.altar={});a.tomato={n:[3,3,3,3,3],cols:['red']}});ok(T.pick201()&&!T.fyWakeAlt('tomato','red'),'夢裡選過但還沒喚醒：到祭壇重新選');}
if(fails)process.exitCode=1;
