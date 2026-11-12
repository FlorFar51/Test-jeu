const $=s=>document.querySelector(s), C=$('#c'), X=C.getContext('2d');
const screens=[...document.querySelectorAll('.screen')]; let W,H,dpr,G,raf;
const CFG={speed:210,hp:100,shotRate:.62,enemyHp:2,contact:10,invuln:.7,spawnRate:1.35,maxEnemies:65,coreChance:.012};
function show(id){screens.forEach(s=>s.classList.remove('active'));$('#'+id).classList.add('active')}
function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;C.width=W*dpr;C.height=H*dpr;X.setTransform(dpr,0,0,dpr,0,0)} addEventListener('resize',resize);resize();
const rnd=(a,b)=>a+Math.random()*(b-a), dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y), key=(x,y)=>Math.floor(x/700)+','+Math.floor(y/700);
function blockData(cx,cy){let seed=((cx*73856093)^(cy*19349663))>>>0, r=()=>((seed=Math.imul(seed^seed>>>15,1|seed),seed^=seed+Math.imul(seed^seed>>>7,61|seed),(seed^seed>>>14)>>>0)/4294967296);let a=[];if(cx||cy){let n=2+Math.floor(r()*4);for(let i=0;i<n;i++){let wall=r()<.35;a.push({x:cx*700+80+r()*540,y:cy*700+80+r()*540,w:wall?25:45+r()*55,h:wall?100+r()*130:45+r()*55})}}return a}
function nearbyBlocks(){let p=G.p,cx=Math.floor(p.x/700),cy=Math.floor(p.y/700),a=[];for(let x=cx-1;x<=cx+1;x++)for(let y=cy-1;y<=cy+1;y++){let k=key(x*700,y*700);if(!G.blocks[k])G.blocks[k]=blockData(x,y);a.push(...G.blocks[k])}return a}
function hitCircleRect(p,o){let x=Math.max(o.x,Math.min(p.x,o.x+o.w)),y=Math.max(o.y,Math.min(p.y,o.y+o.h));return Math.hypot(p.x-x,p.y-y)<p.r}
function move(o,dx,dy,blocks){o.x+=dx;if(blocks.some(b=>hitCircleRect(o,b)))o.x-=dx;o.y+=dy;if(blocks.some(b=>hitCircleRect(o,b)))o.y-=dy}
function start(){G={p:{x:0,y:0,r:15,hp:100},en:[],bul:[],drops:[],blocks:{},joy:null,kills:0,coinsRun:0,coresRun:0,carrying:false,coreExists:false,t:0,last:performance.now(),shot:0,spawn:0,inv:0,running:true};updateHUD();show('game');cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
function spawnEnemy(){let a=Math.random()*Math.PI*2,d=Math.max(W,H)*.62+80;G.en.push({x:G.p.x+Math.cos(a)*d,y:G.p.y+Math.sin(a)*d,r:14,hp:2,speed:65+Math.min(70,G.t/8)})}
function fire(){if(!G.en.length)return;let e=G.en.reduce((a,b)=>dist(G.p,a)<dist(G.p,b)?a:b),d=dist(G.p,e)||1;G.bul.push({x:G.p.x,y:G.p.y,r:4,vx:(e.x-G.p.x)/d*430,vy:(e.y-G.p.y)/d*430,life:1.4})}
function dieEnemy(e){G.kills++;G.drops.push({x:e.x,y:e.y,r:8,type:'coin',v:1+Math.floor(Math.random()*3)});if(!G.coreExists&&!G.carrying&&Math.random()<CFG.coreChance){G.drops.push({x:e.x+20,y:e.y,r:11,type:'core'});G.coreExists=true}}
function update(dt){let p=G.p,b=nearbyBlocks(),j=G.joy;if(j&&j.mag>8)move(p,j.dx/j.mag*CFG.speed*dt,j.dy/j.mag*CFG.speed*dt,b);G.t+=dt;G.inv=Math.max(0,G.inv-dt);G.shot-=dt;if(G.shot<=0){fire();G.shot=CFG.shotRate}G.spawn-=dt;if(G.spawn<=0&&G.en.length<CFG.maxEnemies){spawnEnemy();G.spawn=Math.max(.42,CFG.spawnRate-G.t/240)}
for(let e of G.en){let d=dist(e,p)||1;move(e,(p.x-e.x)/d*e.speed*dt,(p.y-e.y)/d*e.speed*dt,b);if(dist(e,p)<e.r+p.r&&G.inv<=0){p.hp-=CFG.contact;G.inv=CFG.invuln;if(p.hp<=0)return end()}}
for(let q of G.bul){q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;if(b.some(o=>hitCircleRect(q,o)))q.life=0;for(let e of G.en)if(e.hp>0&&dist(q,e)<q.r+e.r){e.hp--;q.life=0;if(e.hp<=0)dieEnemy(e);break}}
G.en=G.en.filter(e=>e.hp>0&&dist(e,p)<1500);G.bul=G.bul.filter(q=>q.life>0);
G.drops=G.drops.filter(d=>{if(dist(d,p)<p.r+d.r+5){if(d.type==='coin')G.coinsRun+=d.v;else{G.carrying=true;G.coreExists=false}return false}return dist(d,p)<1800});
if(G.carrying&&Math.hypot(p.x,p.y)<48){G.carrying=false;G.coresRun++;localStorage.cores=+(localStorage.cores||0)+1}
updateHUD()}
function updateHUD(){$('#hpbar').style.width=(G?G.p.hp:100)+'%';$('#kills').textContent=G?.kills||0;$('#coins').textContent=G?.coinsRun||0;$('#cores').textContent=G?.coresRun||0;$('#timer').textContent=G?Math.floor(G.t/60)+':'+String(Math.floor(G.t%60)).padStart(2,'0'):'0:00';if(G){let d=Math.round(Math.hypot(G.p.x,G.p.y));$('#coreState').textContent=G.carrying?'◆ Noyau transporté — spawn à '+d+' m':G.coreExists?'◆ Noyau rare présent sur la carte':''}}
function draw(){X.clearRect(0,0,W,H);let p=G.p,ox=W/2-p.x,oy=H/2-p.y;X.save();X.translate(ox,oy);X.fillStyle='#0d1b2c';X.fillRect(p.x-W/2,p.y-H/2,W,H);X.strokeStyle='#1b3048';X.lineWidth=1;let s=80;for(let x=Math.floor((p.x-W/2)/s)*s;x<p.x+W/2;x+=s){X.beginPath();X.moveTo(x,p.y-H/2);X.lineTo(x,p.y+H/2);X.stroke()}for(let y=Math.floor((p.y-H/2)/s)*s;y<p.y+H/2;y+=s){X.beginPath();X.moveTo(p.x-W/2,y);X.lineTo(p.x+W/2,y);X.stroke()}
X.strokeStyle='#48e7ff';X.lineWidth=4;X.beginPath();X.arc(0,0,38,0,7);X.stroke();X.fillStyle='#173d4c';X.fillRect(-8,-8,16,16);
for(let o of nearbyBlocks()){X.fillStyle=o.w<35?'#536174':'#34465c';X.fillRect(o.x,o.y,o.w,o.h)}
for(let d of G.drops){X.fillStyle=d.type==='coin'?'#ffd84c':'#c85cff';X.beginPath();X.arc(d.x,d.y,d.r,0,7);X.fill()}
for(let q of G.bul){X.fillStyle='#ffe363';X.beginPath();X.arc(q.x,q.y,q.r,0,7);X.fill()}
for(let e of G.en){X.fillStyle='#e54855';X.beginPath();X.arc(e.x,e.y,e.r,0,7);X.fill()}
X.globalAlpha=G.inv>0&&Math.floor(G.inv*12)%2?0.25:1;X.fillStyle='#36a3ff';X.beginPath();X.arc(p.x,p.y,p.r,0,7);X.fill();X.globalAlpha=1;if(G.carrying){X.fillStyle='#d562ff';X.beginPath();X.arc(p.x,p.y-25,7,0,7);X.fill()}X.restore()}
function loop(n){if(!G?.running)return;let dt=Math.min((n-G.last)/1000,.04);G.last=n;update(dt);if(G.running){draw();raf=requestAnimationFrame(loop)}}
function end(){G.running=false;localStorage.coins=+(localStorage.coins||0)+G.coinsRun;localStorage.bestKills=Math.max(+(localStorage.bestKills||0),G.kills);localStorage.bestTime=Math.max(+(localStorage.bestTime||0),Math.floor(G.t));$('#summary').innerHTML=`Temps : <b>${Math.floor(G.t/60)}:${String(Math.floor(G.t%60)).padStart(2,'0')}</b><br>Éliminations : <b>${G.kills}</b><br>Pièces gagnées : <b>${G.coinsRun}</b><br>Noyaux déposés : <b>${G.coresRun}</b>`;records();show('over')}
function records(){$('#records').innerHTML=`Record : <b>${localStorage.bestKills||0}</b> éliminations<br>Temps : <b>${localStorage.bestTime||0}s</b><br>Réserve : 🪙 <b>${localStorage.coins||0}</b> &nbsp; ◆ <b>${localStorage.cores||0}</b>`}records();
function point(e){let t=e.changedTouches?e.changedTouches[0]:e;return{x:t.clientX,y:t.clientY,id:t.identifier??e.pointerId}}
C.addEventListener('pointerdown',e=>{if(!G?.running||G.joy)return;let p=point(e);G.joy={id:p.id,x:p.x,y:p.y,dx:0,dy:0,mag:0};let j=$('#joy');j.style.display='block';j.style.left=p.x+'px';j.style.top=p.y+'px';C.setPointerCapture(e.pointerId)});
C.addEventListener('pointermove',e=>{if(!G?.joy)return;let p=point(e),j=G.joy;j.dx=p.x-j.x;j.dy=p.y-j.y;j.mag=Math.hypot(j.dx,j.dy);let m=Math.min(33,j.mag),a=Math.atan2(j.dy,j.dx);$('#joy i').style.transform=`translate(${Math.cos(a)*m}px,${Math.sin(a)*m}px)`});
function joyEnd(){if(G)G.joy=null;$('#joy').style.display='none';$('#joy i').style.transform=''}C.addEventListener('pointerup',joyEnd);C.addEventListener('pointercancel',joyEnd);
$('#play').onclick=start;$('#again').onclick=start;$('#menu').onclick=()=>{records();show('home')};$('#quit').onclick=()=>{if(G){G.running=false;cancelAnimationFrame(raf)}records();show('home')};
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'));
