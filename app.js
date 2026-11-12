const $=s=>document.querySelector(s),C=$('#c'),X=C.getContext('2d'),screens=[...document.querySelectorAll('.screen')];let W,H,dpr,G,raf;
const CFG={spawnRate:2.0,minSpawnInterval:1.0,spawnRamp:420,maxEnemies:55};const BOSS=[{x:650,y:0,name:'Gardien Est',color:'#ff784d',hp:55,xp:22},{x:-620,y:-620,name:'Gardien Nord-Ouest',color:'#f04d8b',hp:80,xp:28},{x:0,y:900,name:'Colosse Sud',color:'#a96cff',hp:110,xp:35}];
const SWORD_UP=[['sDamage','Impact',['+40 % dégâts','+90 % dégâts','+160 % dégâts']],['sRange','Zone de frappe',['105 px','125 px','150 px']],['sRate','Recharge',['1,10 s','0,95 s','0,80 s']],['lifeSteal','Vampirisme',['4 %','8 %','12 %']]];
const GUN_UP=[['multi','Tir multiple',['2 projectiles','3 projectiles','4 projectiles']],['damage','Puissance',['+25 % dégâts','+50 % dégâts','+80 % dégâts']],['rate','Cadence',['+15 %','+30 %','+45 %']],['range','Portée',['380 px','440 px','500 px']],['life','Vie maximale',['120 PV et +20 PV','145 PV et +20 PV','175 PV et +20 PV']],['armor','Armure',['-10 % dégâts','-20 % dégâts','-30 % dégâts']],['speed','Vitesse',['+8 %','+16 %','+25 %']],['magnet','Aimant',['120 px','170 px','230 px']],['pierce','Perforation',['1 ennemi','2 ennemis','3 ennemis']],['regen','Régénération',['1 PV / 12 s','1 PV / 8 s','1 PV / 5 s']]];
const ICONS={sDamage:'⚔',sRange:'↗',sRate:'⏱',lifeSteal:'♥',multi:'⑂',damage:'💥',rate:'⚡',range:'◎',life:'✚',armor:'⬡',speed:'➤',magnet:'🧲',pierce:'➶',regen:'♻',fire:'🔥'};const COLORS={sDamage:'#ff7b63',sRange:'#79d7ff',sRate:'#ffd45f',lifeSteal:'#ff668b',multi:'#ffe475',damage:'#ff695e',rate:'#63dbff',range:'#70b9ff',life:'#66e28b',armor:'#9fb7d8',speed:'#70e5ca',magnet:'#c18cff',pierce:'#e2e8ff',regen:'#5de19b',fire:'#ff8a36'};
let SETTINGS=JSON.parse(localStorage.nzSettings||'{}');SETTINGS={effects:'normal',vibration:true,shake:true,damageText:true,joyOpacity:100,buttonSize:'normal',eco:false,...SETTINGS};function saveSettings(){localStorage.nzSettings=JSON.stringify(SETTINGS);applySettings()}function applySettings(){document.documentElement.style.setProperty('--joy-opacity',SETTINGS.joyOpacity/100);document.body.classList.toggle('largeButtons',SETTINGS.buttonSize==='large');document.body.classList.toggle('eco',SETTINGS.eco)}applySettings();function notify(text,kind='info'){let n=document.createElement('div');n.className='toast '+kind;n.textContent=text;document.body.appendChild(n);setTimeout(()=>n.classList.add('show'),10);setTimeout(()=>{n.classList.remove('show');setTimeout(()=>n.remove(),250)},1600)}
function show(id){screens.forEach(s=>s.classList.remove('active'));$('#'+id).classList.add('active')}
function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;C.width=W*dpr;C.height=H*dpr;X.setTransform(dpr,0,0,dpr,0,0)}addEventListener('resize',resize);resize();const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a);
function blockData(cx,cy){let seed=((cx*73856093)^(cy*19349663))>>>0,r=()=>((seed=Math.imul(seed^seed>>>15,1|seed),seed^=seed+Math.imul(seed^seed>>>7,61|seed),(seed^seed>>>14)>>>0)/4294967296),a=[];if(cx||cy)for(let i=0,n=2+Math.floor(r()*4);i<n;i++){let wall=r()<.35;a.push({x:cx*700+80+r()*540,y:cy*700+80+r()*540,w:wall?25:45+r()*55,h:wall?100+r()*130:45+r()*55})}return a}function blocks(){let p=G.p,cx=Math.floor(p.x/700),cy=Math.floor(p.y/700),a=[];for(let x=cx-1;x<=cx+1;x++)for(let y=cy-1;y<=cy+1;y++){let k=x+','+y;if(!G.blocks[k])G.blocks[k]=blockData(x,y);a.push(...G.blocks[k])}return a}function hit(p,o){let x=clamp(p.x,o.x,o.x+o.w),y=clamp(p.y,o.y,o.y+o.h);return Math.hypot(p.x-x,p.y-y)<p.r}function move(o,dx,dy,b){o.x+=dx;if(b.some(q=>hit(o,q)))o.x-=dx;o.y+=dy;if(b.some(q=>hit(o,q)))o.y-=dy}
function stats(){let u=G.up;return{speed:210*[1,1.08,1.16,1.25][u.speed],range:[330,380,440,500][u.range],damage:[1,1.25,1.5,1.8][u.damage],rate:.62/[1,1.15,1.30,1.45][u.rate],shots:1+u.multi,armor:[0,.1,.2,.3][u.armor],magnet:[85,120,170,230][u.magnet],pierce:u.pierce,regen:[0,12,8,5][u.regen]}}
function particle(x,y,color,n=6,power=90){if(!G||SETTINGS.effects==='low')return;let cap=SETTINGS.eco?50:SETTINGS.effects==='high'?180:120,limit=Math.max(0,cap-G.particles.length);for(let i=0;i<Math.min(n,limit);i++){let a=Math.random()*Math.PI*2,v=rnd(power*.35,power);G.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rnd(.22,.42),max:.42,color,r:rnd(1.5,3.5)})}}function floatText(x,y,text,color='#fff',size=13){if(SETTINGS.damageText&&G&&G.texts.length<35)G.texts.push({x,y,text,color,life:.65,max:.65,size})}
function impact(e,dmg,color='#fff',critical=false){
    e.flash=.08;
    e.squash=.1;

    let d=dist(G.p,e)||1;
    e.x+=(e.x-G.p.x)/d*5;
    e.y+=(e.y-G.p.y)/d*5;

    particle(e.x,e.y,color,4,65);

    floatText(
        e.x,
        e.y-e.r-8,
        Number(dmg).toFixed(dmg%1?1:0),
        color
    );

    if(critical){
        floatText(e.x,e.y,'CRIT !','#ffd84c',14);
    }
}
function start(){document.body.classList.add('transitioning');setTimeout(()=>document.body.classList.remove('transitioning'),300);let up={};[...SWORD_UP,...GUN_UP].forEach(x=>up[x[0]]=0);G={p:{x:0,y:0,r:15,hp:100,maxHp:100},en:[],bul:[],enemyBul:[],bombs:[],slashes:[],drops:[],particles:[],texts:[],waves:[],blocks:{},bosses:[],bossTimer:180,bossIndex:0,bossCount:0,joy:null,kills:0,bossKills:0,damageDone:0,damageTaken:0,coinsRun:0,coresRun:0,carrying:false,coreExists:false,t:0,last:performance.now(),shot:0,spawn:0,inv:0,running:true,paused:false,level:1,xp:0,xpNeed:8,pending:0,levelUpDelay:0,up,fire:false,regenT:0,gun:false,smg:false,weapon:'pistol',swordT:0,swordMax:1.25,merchantT:45,merchantReady:false,merchantOpen:false,shake:0,levelFlash:0};updateHUD();show('game');cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
function enemyType(){let t=G.t,r=Math.random();if(t>=240&&r<.06&&G.en.filter(e=>e.kind==='bomber').length<2)return{kind:'bomber',shape:2,color:'#9d55d9',hp:9,xp:10,speed:34,dmg:18,r:18,coins:4,attack:1};if(t>=120&&r<.28)return{kind:'spear',shape:1,color:'#f0a33e',hp:7,xp:7,speed:55,dmg:15,r:16,coins:3,attack:1};if(t>=90&&r<.38)return{kind:'shooter',shape:3,color:'#397ccf',hp:4,xp:6,speed:52,dmg:8,r:14,coins:2,attack:1};if(t>=420&&r<.55)return{kind:'tank',shape:3,color:'#9aa4b2',hp:18,xp:15,speed:62,dmg:22,r:19,coins:5,attack:0};if(t>=60&&r>=.55&&r<.78)return{kind:'brute',shape:0,color:'#b96b45',hp:8,xp:3,speed:58,dmg:13,r:15,coins:2,attack:0};return{kind:'chaser',shape:0,color:'#e54855',hp:t>=120?4:4,xp:1,speed:68,dmg:10,r:14,coins:1,attack:0}}
function spawnEnemy(){let a=Math.random()*Math.PI*2,d=Math.max(W,H)*.62+80,e=enemyType();const elite=Math.random()<0.05;

if(elite){

    e.hp*=3;
    e.maxHp=e.hp;
    e.speed*=1.15;
    e.coins*=4;
    e.xp*=3;
    e.color='#ffd84c';
    e.r*=1.4;
}G.en.push({...e,x:G.p.x+Math.cos(a)*d,y:G.p.y+Math.sin(a)*d,maxHp:e.hp,hitT:0,armor:0,atk:rnd(1,2.5),tele:0,target:null})}
function spawnBoss(){
    let template=BOSS[G.bossIndex%BOSS.length];
    G.bossIndex++;
    G.bossCount++;

    let angle=Math.random()*Math.PI*2;
    let distance=Math.max(W,H)*0.65+180;
    let x=G.p.x+Math.cos(angle)*distance;
    let y=G.p.y+Math.sin(angle)*distance;

    let scale=1+(G.bossCount-1)*0.20;
    let hp=Math.round(template.hp*scale);

    let boss={
        ...template,
        x,y,
        homeX:x,
        homeY:y,
        hp,
        maxHp:hp,
        xp:Math.round(template.xp*4*scale),
        r:30,
        alive:true,
        hitT:0,
        active:true,
        hunting:true,
        speed:52+G.bossCount*2,
        armor:0,
        attackT:2,
        attackPattern:0
    };

    G.bosses.push(boss);

    notify('ALERTE : '+boss.name+' APPROCHE !','rare');
    particle(x,y,boss.color,30,220);
}
function targets(){let s=stats();return[...G.en,...G.bosses.filter(b=>b.alive)].filter(e=>dist(G.p,e)<=s.range).sort((a,b)=>dist(G.p,a)-dist(G.p,b))}
function fire(){
    if(!G.gun)return;

    let tar=targets()[0];
    if(!tar)return;

    let s=stats();
    let base=Math.atan2(tar.y-G.p.y,tar.x-G.p.x);
    let spread=.16;

    for(let i=0;i<s.shots;i++){
        let a=base+(i-(s.shots-1)/2)*spread;
        let critical=Math.random()<0.03;

        G.bul.push({
            x:G.p.x,
            y:G.p.y,
            r:4,
            vx:Math.cos(a)*430,
            vy:Math.sin(a)*430,
            travel:0,
            damage:s.damage*(G.weapon==='smg'?.8:1)*(critical?2:(s.shots>1?.85:1)),
            critical:critical,
            hits:s.pierce+1,
            seen:new Set(),
            fire:G.fire
        });
    }
}
function addXP(n){
    let bonus=1;

    if(G.t>300) bonus=1.2;
    if(G.t>600) bonus=1.5;
    if(G.t>900) bonus=2;

    G.xp+=Math.round(n*bonus);

    while(G.xp>=G.xpNeed&&G.level<25){
        G.xp-=G.xpNeed;
        G.level++;
        G.xpNeed=Math.ceil(G.xpNeed*1.2+2);
        G.pending++;
    }

    if(G.pending&&!G.paused&&G.levelUpDelay<=0){
        G.levelUpDelay=.5;
    }
}
function openLevel(){G.waves.push({x:G.p.x,y:G.p.y,r:15,life:.6,max:.6,color:'#55b9ff'});G.levelFlash=.45;particle(G.p.x,G.p.y,'#55b9ff',18,150);G.paused=true;cancelAnimationFrame(raf);joyEnd();let pool=[...SWORD_UP,...GUN_UP.filter(x=>G.gun||['life','armor','speed','magnet','regen'].includes(x[0]))].filter(x=>G.up[x[0]]<3),chosen=[];while(pool.length&&chosen.length<3){let i=Math.floor(Math.random()*pool.length);chosen.push(pool.splice(i,1)[0])}if(G.gun&&!G.fire&&G.up.multi>0)chosen[Math.floor(Math.random()*chosen.length)]=['fire','Tir enflammé',['Brûlure pendant 2 s']];let box=$('#choices');box.innerHTML='';for(let u of chosen){let fire=u[0]==='fire',lv=fire?0:G.up[u[0]],btn=document.createElement('button');btn.className='choice'+(fire?' fire':'');let cost=40,ok=!fire||G.coinsRun>=cost;btn.disabled=!ok;let key=u[0],ico=ICONS[key]||'✦',color=COLORS[key]||'#65d8ff';btn.style.setProperty('--accent',color);btn.innerHTML=`<span class="cardIcon">${ico}</span><span class="cardBody"><strong>${u[1]}${fire?'':` ${lv+1}/3`}</strong><small>${u[2][fire?0:lv]}${fire?` — ${cost} 🪙`:''}</small></span><span class="cardLevel">${fire?'◆':(lv+1)+'/3'}</span>`;btn.onclick=()=>choose(u[0]);box.appendChild(btn)}$('#levelup').classList.add('show')}
function choose(k){
    G.waves.push({x:G.p.x,y:G.p.y,r:20,life:.75,max:.75,color:'#75e4ff'});
    particle(G.p.x,G.p.y,'#75e4ff',14,120);
    floatText(G.p.x,G.p.y-35,'AMÉLIORATION !','#75e4ff',15);
    if(k==='fire'){
        if(G.coinsRun<40)return;
        G.coinsRun-=40;
        G.fire=true;
    }else{
        G.up[k]++;
        if(k==='life'){
            G.p.maxHp=[100,120,145,175][G.up.life];
            G.p.hp=Math.min(G.p.maxHp,G.p.hp+20);
        }
    }
    G.pending--;
    $('#levelup').classList.remove('show');
    if(G.pending)setTimeout(openLevel,50);
    else{
        G.paused=false;
        G.last=performance.now();
        raf=requestAnimationFrame(loop);
    }
    updateHUD();
}
function kill(e,boss=false,bySword=false){
    particle(e.x,e.y,e.color||'#e54855',boss?18:8,boss?170:105);

    G.waves.push({
        x:e.x,
        y:e.y,
        r:e.r||14,
        life:boss?.55:.22,
        max:boss?.55:.22,
        color:e.color||'#e54855'
    });

    if(boss)G.shake=4;

    if(G.up.lifeSteal>0 && Math.random()<[0,.04,.08,.12][G.up.lifeSteal]){
    const oldHp=G.p.hp;
    G.p.hp=Math.min(G.p.maxHp,G.p.hp+2);

    if(G.p.hp>oldHp){
        floatText(G.p.x,G.p.y-35,'+1 PV','#ff668b',14);
        particle(G.p.x,G.p.y,'#ff668b',8);
    }
}

    G.kills+=boss?5:1;

    if(boss){
        G.bossKills++;
        G.coinsRun+=150;

        notify('+150 PIÈCES — BOSS ÉLIMINÉ !','rare');

        particle(e.x,e.y,'#ffd84c',40,260);
        floatText(e.x,e.y-55,'+150 PIÈCES','#ffd84c',20);
        floatText(e.x,e.y-80,'+'+e.xp+' XP','#75d7ff',18);
    }

    addXP(e.xp||1);

    G.drops.push({
        x:e.x,
        y:e.y,
        r:boss?13:8,
        type:'coin',
        age:0,
        bounce:.32,
        v:boss?100:(e.coins||1)+Math.floor(Math.random()*2)
    });

    if(!boss&&Math.random()<.03){
        G.drops.push({
            x:e.x+12,
            y:e.y,
            r:10,
            type:'heal',
            v:20
        });
    }

    // Seuls les boss donnent des noyaux
    if(boss){
        G.drops.push({
            x:e.x,
            y:e.y,
            r:13,
            type:'core',
            age:0,
            bounce:.32
        });

        G.coreExists=true;

        notify('NOYAU DE BOSS RÉCUPÉRABLE !','rare');
    }
}
function swordAttack(){const u=G.up,reach=[60,70,100,125][u.sRange],damage=[2,4.5,6.8,8.5][u.sDamage];const candidates=[...G.en.filter(e=>e.hp>0),...G.bosses.filter(b=>b.alive&&b.hp>0)];let target=null,best=Infinity;for(const e of candidates){const gap=Math.max(0,dist(G.p,e)-G.p.r-e.r);if(gap<=reach&&gap<best){best=gap;target=e}}if(!target)return false;const a=Math.atan2(target.y-G.p.y,target.x-G.p.x);G.slashes.push({a,life:.26,max:.26,range:reach+G.p.r,target});target.hp-=damage;G.damageDone+=damage;target.hitT=3;impact(target,damage,'#d9f2ff');G.shake=Math.max(G.shake,2);if(target.hp<=0){const boss=G.bosses.includes(target);if(boss)target.alive=false;kill(target,boss,true)}return true}
function openMerchant(){
    if(!G.merchantReady||G.merchantOpen||G.paused)return;

    G.paused=true;
    G.merchantOpen=true;
    joyEnd();
    cancelAnimationFrame(raf);

    let box=$('#shop');
    box.innerHTML='';

    let items=[];

    if(!G.gun){
        items.push({
            name:'Pistolet',
            desc:'Débloque le tir à distance.',
            cost:80,
            gun:true,
            icon:'🔫',
            color:'#ffd45f'
        });
    }

    if(G.gun&&!G.smg){
        items.push({
            name:'Mitraillette',
            desc:'Cadence de tir très élevée. Arme automatique améliorée.',
            cost:500,
            smg:true,
            icon:'🔫',
            color:'#ff785e'
        });
    }

    items.push({
        name:'Soin complet',
        desc:'Restaure tous les PV.',
        cost:75,
        heal:true,
        icon:'✚',
        color:'#62e795'
    });

    items.push({
        name:'Affûtage',
        desc:'+15 % dégâts à l’épée pour cette partie.',
        cost:45,
        sharp:true,
        icon:'⚔',
        color:'#7fd8ff'
    });

    for(let it of items){
        let b=document.createElement('button');

        b.className='choice '+(it.gun?'gun':'sword');
        b.disabled=G.coinsRun<it.cost;
        b.style.setProperty('--accent',it.color||'#f1cb54');

        b.innerHTML=`
            <span class="cardIcon">${it.icon||'✦'}</span>
            <span class="cardBody">
                <strong>${it.name}</strong>
                <small>${it.desc}</small>
                <em>${it.cost} 🪙</em>
            </span>
            <span class="buyArrow">›</span>
        `;

        b.onclick=()=>buy(it);
        box.appendChild(b);
    }

    $('#merchant').classList.add('show');
}
function buy(it){
    if(G.coinsRun<it.cost){
        let m=$('#coins');
        m.animate([
            {transform:'translateX(-4px)',color:'#ff5252'},
            {transform:'translateX(4px)'},
            {transform:'none'}
        ],{duration:220});
        return;
    }

    G.coinsRun-=it.cost;

    floatText(
        G.p.x,
        G.p.y-35,
        it.name.toUpperCase(),
        '#ffd34f',
        16
    );

    particle(G.p.x,G.p.y,'#ffd34f',16,120);

    if(it.gun){
        G.gun=true;
        G.weapon='pistol';
        notify('PISTOLET DÉBLOQUÉ !','rare');
    }

    if(it.smg){
        G.smg=true;
        G.weapon='smg';
        notify('MITRAILLETTE DÉBLOQUÉE !','rare');
    }

    if(it.heal)G.p.hp=G.p.maxHp;

    if(it.sharp){
        G.up.sDamage=Math.min(3,G.up.sDamage+1);
    }

    updateHUD();
    closeMerchant();
}
function closeMerchant(){G.merchantOpen=false;G.paused=false;$('#merchant').classList.remove('show');G.last=performance.now();raf=requestAnimationFrame(loop)}
function rangedEnemy(e,dt){let d=dist(e,G.p)||1,ideal=e.kind==='bomber'?330:260;if(d>ideal+35)move(e,(G.p.x-e.x)/d*e.speed*dt,(G.p.y-e.y)/d*e.speed*dt,blocks());else if(d<ideal-45)move(e,-(G.p.x-e.x)/d*e.speed*dt,-(G.p.y-e.y)/d*e.speed*dt,blocks());e.atk-=dt;if(e.atk<=0){if(e.kind==='bomber'){G.bombs.push({x:G.p.x,y:G.p.y,t:1.6,r:60})}else{let sp=e.kind==='spear'?340:230;G.enemyBul.push({x:e.x,y:e.y,vx:(G.p.x-e.x)/d*sp,vy:(G.p.y-e.y)/d*sp,r:e.kind==='spear'?6:4,dmg:e.dmg,life:2.4,color:e.kind==='spear'?'#ffad4d':'#78b8ff'})}e.atk=e.kind==='bomber'?6:e.kind==='spear'?2.5:2}}
function bossAttack(q,dt){
    q.attackT-=dt;
    if(q.attackT>0)return;

    let p=G.p;
    let angle=Math.atan2(p.y-q.y,p.x-q.x);

    // Attaque 1 : cercle de 12 projectiles
    if(q.attackPattern===0){
        let count=12;

        for(let i=0;i<count;i++){
            let a=i*Math.PI*2/count;

            G.enemyBul.push({
                x:q.x,
                y:q.y,
                vx:Math.cos(a)*180,
                vy:Math.sin(a)*180,
                r:7,
                dmg:12,
                life:3.5,
                color:q.color
            });
        }

        q.attackPattern=1;
    }

    // Attaque 2 : éventail de 7 projectiles ciblant le joueur
    else{
        let count=7;

        for(let i=0;i<count;i++){
            let spread=(i-(count-1)/2)*0.20;
            let a=angle+spread;

            G.enemyBul.push({
                x:q.x,
                y:q.y,
                vx:Math.cos(a)*270,
                vy:Math.sin(a)*270,
                r:6,
                dmg:15,
                life:3,
                color:'#ffcf62'
            });
        }

        q.attackPattern=0;
    }

    particle(q.x,q.y,q.color,12,120);
    q.attackT=2.7;
}
function update(dt){let p=G.p,b=blocks(),s=stats(),j=G.joy;if(j&&j.mag>8)move(p,j.dx/j.mag*s.speed*dt,j.dy/j.mag*s.speed*dt,b);G.t+=dt;

G.bossTimer-=dt;

if(G.bossTimer<=0){
    spawnBoss();
    G.bossTimer=180;
}G.shake=Math.max(0,G.shake-dt*14);G.levelFlash=Math.max(0,G.levelFlash-dt);for(let z of G.particles){z.x+=z.vx*dt;z.y+=z.vy*dt;z.vx*=.94;z.vy*=.94;z.life-=dt}G.particles=G.particles.filter(z=>z.life>0);for(let z of G.texts){z.y-=24*dt;z.life-=dt}G.texts=G.texts.filter(z=>z.life>0);for(let z of G.waves){z.r+=150*dt;z.life-=dt}G.waves=G.waves.filter(z=>z.life>0);if(!G.merchantReady){G.merchantT-=dt;if(G.merchantT<=0){G.merchantT=0;G.merchantReady=true;notify('Marchand disponible','shop')}}if(G.swordT>0)G.swordT=Math.max(0,G.swordT-dt);if(G.swordT===0&&swordAttack()){G.swordMax=[1.25,1.10,.95,.80][G.up.sRate];G.swordT=G.swordMax}G.inv=Math.max(0,G.inv-dt);if(s.regen){G.regenT+=dt;if(G.regenT>=s.regen){G.regenT=0;p.hp=Math.min(p.maxHp,p.hp+1)}}G.shot-=dt;if(G.shot<=0){
    fire();
    G.shot=s.rate*(G.weapon==='smg'?.60:1);
}G.spawn-=dt;if(G.spawn<=0&&G.en.length<CFG.maxEnemies){spawnEnemy();G.spawn=Math.max(CFG.minSpawnInterval,CFG.spawnRate-G.t/CFG.spawnRamp)}for(let e of G.en){e.hitT=Math.max(0,e.hitT-dt);e.flash=Math.max(0,(e.flash||0)-dt);e.squash=Math.max(0,(e.squash||0)-dt);if(e.kind==='shooter'||e.kind==='spear'||e.kind==='bomber')rangedEnemy(e,dt);else{

    let d=dist(e,p)||1;

    let rx=0;
    let ry=0;

    for(const other of G.en){

        if(other===e) continue;

        const dx=e.x-other.x;
        const dy=e.y-other.y;

        const dd=Math.hypot(dx,dy);

        if(dd<35 && dd>0){

            rx+=(dx/dd)*40;
            ry+=(dy/dd)*40;
        }
    }

    move(
        e,
        (
            (p.x-e.x)/d*e.speed
            + rx
        )*dt,
        (
            (p.y-e.y)/d*e.speed
            + ry
        )*dt,
        b
    );

    contact(e,e.dmg);
}
}for(let q of G.bosses.filter(x=>x.alive)){
    q.hitT=Math.max(0,q.hitT-dt);
    q.flash=Math.max(0,(q.flash||0)-dt);
    q.squash=Math.max(0,(q.squash||0)-dt);

    let dp=dist(q,p);
    q.active=q.hunting||dp<310;

    if(q.active){
        let d=dp||1;

        move(
            q,
            (p.x-q.x)/d*q.speed*dt,
            (p.y-q.y)/d*q.speed*dt,
            b
        );

        contact(q,18);
        bossAttack(q,dt);
    }
}for(let q of G.bul){let dx=q.vx*dt,dy=q.vy*dt;q.x+=dx;q.y+=dy;q.travel+=Math.hypot(dx,dy);if(b.some(o=>hit(q,o)))q.travel=9999;for(let e of[...G.en,...G.bosses.filter(z=>z.alive)])if(!q.seen.has(e)&&dist(q,e)<q.r+e.r){q.seen.add(e);e.hp-=q.damage;G.damageDone+=q.damage;e.hitT=3;impact(e,q.damage,q.fire?'#ff8a3d':'#ffe56a',q.critical);q.hits--;if(q.fire)e.burn=2;if(e.hp<=0){
    if(G.bosses.includes(e)){
        e.alive=false;
        kill(e,true);
    }else{
        kill(e);
    }
}if(q.hits<=0)q.travel=9999}}for(let e of G.en){if(e.burn>0){e.burn-=dt;e.burnTick=(e.burnTick||0)+dt;if(e.burnTick>=1){e.burnTick=0;e.hp-=1;if(e.hp<=0)kill(e)}}}G.en=G.en.filter(e=>e.hp>0&&dist(e,p)<1500);G.bul=G.bul.filter(q=>q.travel<s.range);for(let q of G.enemyBul){q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;if(b.some(o=>hit(q,o)))q.life=0;if(dist(q,p)<q.r+p.r&&G.inv<=0){p.hp-=Math.max(1,Math.round(q.dmg*(1-s.armor)));G.inv=.7;q.life=0;if(p.hp<=0)return end()}}G.enemyBul=G.enemyBul.filter(q=>q.life>0);for(let q of G.bombs){q.t-=dt;if(q.t<=0&&!q.boom){q.boom=.22;let d=dist(q,p);if(d<q.r&&G.inv<=0){p.hp-=Math.round((d<q.r*.45?25:12)*(1-s.armor));G.inv=.7;if(p.hp<=0)return end()}for(let e of G.en)if(dist(q,e)<q.r)e.hp-=1}if(q.boom)q.boom-=dt}G.bombs=G.bombs.filter(q=>q.t>0||q.boom>0);for(let q of G.slashes)q.life-=dt;G.slashes=G.slashes.filter(q=>q.life>0);for(let d of G.drops){d.age=(d.age||0)+dt;d.bounce=Math.max(0,(d.bounce||0)-dt)}for(let d of G.drops)if(d.type==='coin'&&dist(d,p)<s.magnet){let m=dist(d,p)||1;d.x+=(p.x-d.x)/m*270*dt;d.y+=(p.y-d.y)/m*270*dt}G.drops=G.drops.filter(d=>{if(dist(d,p)<p.r+d.r+5){if(d.type==='coin'){G.coinsRun+=d.v;floatText(p.x,p.y-25,'+'+d.v,'#ffd84c');particle(p.x,p.y,'#ffd84c',3,45)}else if(d.type==='heal'){p.hp=Math.min(p.maxHp,p.hp+d.v);floatText(p.x,p.y-28,'+'+d.v+' PV','#5cff8d',14);particle(p.x,p.y,'#5cff8d',8,75)}else{G.carrying=true;G.coreExists=false;notify('Noyau rare récupéré','rare');floatText(p.x,p.y-35,'NOYAU RARE','#d562ff',16);G.waves.push({x:p.x,y:p.y,r:20,life:.8,max:.8,color:'#d562ff'})}return false}return dist(d,p)<1900});if(G.carrying&&Math.hypot(p.x,p.y)<48){G.carrying=false;G.coresRun++;localStorage.cores=+(localStorage.cores||0)+1}if(G.pending>0&&!G.paused){
    G.levelUpDelay-=dt;

    if(G.levelUpDelay<=0){
        G.levelUpDelay=0;
        openLevel();
        return;
    }
}

updateHUD()}
function contact(e,dmg){if(dist(e,G.p)<e.r+G.p.r&&G.inv<=0){let received=Math.max(1,Math.round(dmg*(1-stats().armor)));G.p.hp-=received;G.damageTaken+=received;G.inv=.7;if(G.p.hp<=0)end()}}
function updateHUD(){if(!G)return;$('#hpbar').style.width=G.p.hp/G.p.maxHp*100+'%';$('#hptext').textContent=Math.ceil(G.p.hp)+'/'+G.p.maxHp;$('#xpbar').style.width=G.xp/G.xpNeed*100+'%';$('#xptext').textContent=G.xp+'/'+G.xpNeed;$('#level').textContent=G.level;$('#kills').textContent=G.kills;$('#coins').textContent=G.coinsRun;$('#cores').textContent=G.coresRun;$('#timer').textContent=Math.floor(G.t/60)+':'+String(Math.floor(G.t%60)).padStart(2,'0');let a=G.bosses.find(b=>b.alive&&b.active);$('#bossHud').style.display=a?'block':'none';if(a){$('#bossName').textContent=a.name;$('#bossLife').textContent=Math.ceil(a.hp)+'/'+a.maxHp;$('#bossbar').style.width=a.hp/a.maxHp*100+'%'}$('#notice').textContent=G.carrying?'◆ Noyau transporté — retourne au spawn':'';let mb=$('#merchantBtn'),mt=$('#merchantTimer');mb.disabled=!G.merchantReady;mb.classList.toggle('ready',G.merchantReady);mt.textContent=G.merchantReady?'PRÊT':Math.ceil(G.merchantT)+'s';let cd=Math.max(0,G.swordT),pct=G.swordMax?100*(1-cd/G.swordMax):100,sc=$('#swordCooldown');$('#swordFill').style.height=Math.max(0,Math.min(100,pct))+'%';sc.classList.toggle('ready',cd===0)}
function edgeArrow(tx,ty,color,label){let sx=tx-G.p.x,sy=ty-G.p.y,top=G.bosses.some(b=>b.active)?150:110;if(Math.abs(sx)<W/2-35&&Math.abs(sy)<H/2-top)return;let a=Math.atan2(sy,sx),cx=W/2,cy=(H+top)/2,rx=W/2-28,ry=(H-top)/2-28,t=Math.min(rx/Math.max(.001,Math.abs(Math.cos(a))),ry/Math.max(.001,Math.abs(Math.sin(a)))),x=cx+Math.cos(a)*t,y=cy+Math.sin(a)*t;X.save();X.translate(x,y);X.rotate(a);X.fillStyle=color;X.beginPath();X.moveTo(10,0);X.lineTo(-7,-7);X.lineTo(-4,0);X.lineTo(-7,7);X.closePath();X.fill();X.rotate(-a);X.font='10px system-ui';X.textAlign='center';X.fillText(label,0,20);X.restore()}
function hpbar(e){if(e.hitT<=0&&e.shape!==3)return;X.fillStyle='#351018';X.fillRect(e.x-18,e.y-e.r-10,36,5);X.fillStyle='#ef4f5c';X.fillRect(e.x-18,e.y-e.r-10,36*Math.max(0,e.hp/e.maxHp),5)}function enemyShape(e){X.save();X.translate(e.x,e.y);let sq=e.squash>0?1.22:1;X.scale(sq,2-sq);if((e.kind==='shooter'||e.kind==='spear')&&e.atk<.55){X.strokeStyle=e.kind==='spear'?'#ffab47':'#79bfff';X.globalAlpha=.35+.5*(.55-e.atk)/.55;X.beginPath();X.moveTo(0,0);let a=Math.atan2(G.p.y-e.y,G.p.x-e.x);X.lineTo(Math.cos(a)*240,Math.sin(a)*240);X.stroke();X.globalAlpha=1}X.fillStyle=e.flash>0?'#ffffff':e.burn>0?'#ff9d3d':e.color;X.beginPath();if(e.shape===1)X.rect(-e.r,-e.r,e.r*2,e.r*2);else if(e.shape===2){X.moveTo(0,-e.r);X.lineTo(e.r,e.r);X.lineTo(-e.r,e.r);X.closePath()}else if(e.shape===3){for(let i=0;i<6;i++){let a=i*Math.PI/3;X[i?'lineTo':'moveTo'](Math.cos(a)*e.r,Math.sin(a)*e.r)}X.closePath()}else X.arc(0,0,e.r,0,7);X.fill();X.restore();hpbar(e)}
function draw(){X.clearRect(0,0,W,H);let p=G.p,sx=SETTINGS.shake&&G.shake?rnd(-G.shake,G.shake):0,sy=SETTINGS.shake&&G.shake?rnd(-G.shake,G.shake):0,ox=W/2-p.x+sx,oy=H/2-p.y+sy;X.save();X.translate(ox,oy);X.fillStyle='#0d1b2c';X.fillRect(p.x-W/2,p.y-H/2,W,H);X.strokeStyle='#1b3048';for(let x=Math.floor((p.x-W/2)/80)*80;x<p.x+W/2;x+=80){X.beginPath();X.moveTo(x,p.y-H/2);X.lineTo(x,p.y+H/2);X.stroke()}for(let y=Math.floor((p.y-H/2)/80)*80;y<p.y+H/2;y+=80){X.beginPath();X.moveTo(p.x-W/2,y);X.lineTo(p.x+W/2,y);X.stroke()}X.strokeStyle='#48e7ff';X.lineWidth=4;X.beginPath();X.arc(0,0,38,0,7);X.stroke();for(let o of blocks()){X.fillStyle=o.w<35?'#536174':'#34465c';X.fillRect(o.x,o.y,o.w,o.h)}for(let d of G.drops){let by=d.bounce?Math.sin((.32-d.bounce)/.32*Math.PI)*10:0;X.save();X.translate(d.x,d.y-by);if(d.type==='core'){X.shadowColor='#d562ff';X.shadowBlur=14+Math.sin(d.age*6)*5;X.rotate(d.age)}else if(d.type==='coin'){X.scale(.35+.65*Math.abs(Math.sin(d.age*7)),1)}X.fillStyle=d.type==='coin'?'#ffd84c':d.type==='heal'?'#46d978':'#c85cff';X.beginPath();if(d.type==='heal'){X.fillRect(-3,-10,6,20);X.fillRect(-10,-3,20,6)}else if(d.type==='core'){X.moveTo(0,-d.r);X.lineTo(d.r,0);X.lineTo(0,d.r);X.lineTo(-d.r,0);X.closePath()}else X.arc(0,0,d.r,0,7);X.fill();X.restore()}for(let q of G.bul){X.fillStyle=q.fire?'#ff7b32':'#ffe363';X.beginPath();X.arc(q.x,q.y,q.r,0,7);X.fill()}for(let q of G.enemyBul){X.fillStyle=q.color;X.beginPath();X.arc(q.x,q.y,q.r,0,7);X.fill()}for(let q of G.bombs){let pulse=q.boom?1:Math.max(.18,1-q.t);X.strokeStyle=q.boom?'#ffd05b':'#ff4545';X.lineWidth=q.boom?6:3;X.beginPath();X.arc(q.x,q.y,q.r*pulse,0,7);X.stroke();if(q.boom){X.fillStyle='#ff7a3066';X.beginPath();X.arc(q.x,q.y,q.r,0,7);X.fill()}}for(let q of G.slashes){let progress=1-q.life/q.max,extend=progress<.35?progress/.35:progress<.65?1:Math.max(0,1-(progress-.65)/.35),len=(q.range+18)*extend;X.save();X.strokeStyle='#e8fbff';X.shadowColor='#66d9ff';X.shadowBlur=10;X.lineCap='round';X.lineWidth=9;X.beginPath();X.moveTo(p.x+Math.cos(q.a)*18,p.y+Math.sin(q.a)*18);X.lineTo(p.x+Math.cos(q.a)*len,p.y+Math.sin(q.a)*len);X.stroke();X.lineWidth=2;X.beginPath();X.arc(q.target.x,q.target.y,q.target.r+7,0,7);X.stroke();X.restore()}for(let e of G.en)enemyShape(e);for(let b of G.bosses.filter(x=>x.alive)){X.fillStyle=b.color;X.beginPath();X.arc(b.x,b.y,b.r,0,7);X.fill();hpbar(b)}X.globalAlpha=G.inv>0&&Math.floor(G.inv*12)%2?.25:1;X.fillStyle='#36a3ff';X.beginPath();X.arc(p.x,p.y,p.r,0,7);X.fill();X.globalAlpha=1;if(G.carrying){X.shadowColor='#d562ff';X.shadowBlur=14;X.fillStyle='#d562ff';X.beginPath();X.arc(p.x,p.y-25,7,0,7);X.fill();X.shadowBlur=0}for(let z of G.waves){X.globalAlpha=z.life/z.max;X.strokeStyle=z.color;X.lineWidth=3;X.beginPath();X.arc(z.x,z.y,z.r,0,7);X.stroke()}for(let z of G.particles){X.globalAlpha=z.life/z.max;X.fillStyle=z.color;X.beginPath();X.arc(z.x,z.y,z.r,0,7);X.fill()}X.textAlign='center';for(let z of G.texts){X.globalAlpha=z.life/z.max;X.fillStyle=z.color;X.font='bold '+z.size+'px system-ui';X.fillText(z.text,z.x,z.y)}X.globalAlpha=1;X.restore();edgeArrow(0,0,'#44bfff',Math.round(Math.hypot(p.x,p.y))+'m');for(let b of G.bosses.filter(x=>x.alive))edgeArrow(b.x,b.y,b.color,Math.round(dist(p,b))+'m');if(G.levelFlash>0){X.fillStyle='rgba(80,180,255,'+(G.levelFlash*.18)+')';X.fillRect(0,0,W,H)}}
function loop(n){if(!G?.running||G.paused)return;let dt=Math.min((n-G.last)/1000,.04);G.last=n;update(dt);if(G.running&&!G.paused){draw();raf=requestAnimationFrame(loop)}}function end(){G.running=false;let oldKills=+(localStorage.bestKills||0),oldTime=+(localStorage.bestTime||0),oldLevel=+(localStorage.bestLevel||0),newRecords=[];if(G.kills>oldKills)newRecords.push('ÉLIMINATIONS');if(Math.floor(G.t)>oldTime)newRecords.push('TEMPS');if(G.level>oldLevel)newRecords.push('NIVEAU');localStorage.coins=+(localStorage.coins||0)+G.coinsRun;localStorage.bestKills=Math.max(oldKills,G.kills);localStorage.bestTime=Math.max(oldTime,Math.floor(G.t));localStorage.bestLevel=Math.max(oldLevel,G.level);localStorage.totalGames=+(localStorage.totalGames||0)+1;localStorage.totalKills=+(localStorage.totalKills||0)+G.kills;localStorage.totalTime=+(localStorage.totalTime||0)+Math.floor(G.t);localStorage.totalBoss=+(localStorage.totalBoss||0)+G.bossKills;$('#resultBanner').textContent=newRecords.length?'NOUVEAU RECORD : '+newRecords.join(' · '):'PARTIE TERMINÉE';$('#resultBanner').className=newRecords.length?'newRecord':'';$('#summary').innerHTML=`<div class="resultGrid"><span>⏱ Temps<b>${Math.floor(G.t/60)}:${String(Math.floor(G.t%60)).padStart(2,'0')}</b></span><span>✦ Niveau<b>${G.level}</b></span><span>☠ Éliminations<b>${G.kills}</b></span><span>👑 Boss<b>${G.bossKills}</b></span><span>⚔ Dégâts infligés<b>${Math.round(G.damageDone)}</b></span><span>♥ Dégâts reçus<b>${G.damageTaken}</b></span><span>🪙 Pièces<b>${G.coinsRun}</b></span><span>◆ Noyaux<b>${G.coresRun}</b></span></div>`;records();show('over')}
function records(){$('#records').innerHTML=`Record : <b>${localStorage.bestKills||0}</b> éliminations<br>Temps : <b>${localStorage.bestTime||0}s</b><br>Réserve : 🪙 <b>${localStorage.coins||0}</b> &nbsp; ◆ <b>${localStorage.cores||0}</b>`}records();
C.addEventListener('pointerdown',e=>{if(!G?.running||G.paused||G.joy)return;G.joy={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0,mag:0};let j=$('#joy');j.style.display='block';j.style.left=e.clientX+'px';j.style.top=e.clientY+'px';C.setPointerCapture(e.pointerId)});C.addEventListener('pointermove',e=>{if(!G?.joy||e.pointerId!==G.joy.id)return;let j=G.joy;j.dx=e.clientX-j.x;j.dy=e.clientY-j.y;j.mag=Math.hypot(j.dx,j.dy);let m=Math.min(33,j.mag),a=Math.atan2(j.dy,j.dx);$('#joy i').style.transform=`translate(${Math.cos(a)*m}px,${Math.sin(a)*m}px)`});function joyEnd(){if(G)G.joy=null;$('#joy').style.display='none';$('#joy i').style.transform=''}C.addEventListener('pointerup',joyEnd);C.addEventListener('pointercancel',joyEnd);function pause(){if(!G?.running||G.paused)return;G.paused=true;$('#pauseStats').innerHTML=`Niveau <b>${G.level}</b> · ${Math.floor(G.t/60)}:${String(Math.floor(G.t%60)).padStart(2,'0')}<br>☠ ${G.kills} · 🪙 ${G.coinsRun} · ◆ ${G.coresRun}`;let build=[...SWORD_UP,...GUN_UP].filter(u=>G.up[u[0]]>0).map(u=>`<span>${ICONS[u[0]]||'✦'} ${u[1]} ${G.up[u[0]]}/3</span>`);$('#pauseBuild').innerHTML=build.length?build.join(''):'<small>Aucune amélioration obtenue</small>';G.paused=true;joyEnd();cancelAnimationFrame(raf);$('#pause').classList.add('show')}document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});$('#merchantBtn').onclick=openMerchant;$('#closeShop').onclick=closeMerchant;$('#resume').onclick=()=>{G.paused=false;G.last=performance.now();$('#pause').classList.remove('show');raf=requestAnimationFrame(loop)};$('#play').onclick=start;$('#again').onclick=start;$('#menu').onclick=()=>{records();show('home')};$('#quit').onclick=()=>{if(G){G.running=false;cancelAnimationFrame(raf)}records();show('home')};$('#settingsBtn').onclick=()=>openSettings(false);$('#pauseSettings').onclick=()=>openSettings(true);function openSettings(fromPause){$('#settings').dataset.fromPause=fromPause?'1':'0';$('#effects').value=SETTINGS.effects;$('#vibration').checked=SETTINGS.vibration;$('#shakeSetting').checked=SETTINGS.shake;$('#damageText').checked=SETTINGS.damageText;$('#joyOpacity').value=SETTINGS.joyOpacity;$('#buttonSize').value=SETTINGS.buttonSize;$('#eco').checked=SETTINGS.eco;$('#settings').classList.add('show')}$('#closeSettings').onclick=()=>{SETTINGS.effects=$('#effects').value;SETTINGS.vibration=$('#vibration').checked;SETTINGS.shake=$('#shakeSetting').checked;SETTINGS.damageText=$('#damageText').checked;SETTINGS.joyOpacity=+$('#joyOpacity').value;SETTINGS.buttonSize=$('#buttonSize').value;SETTINGS.eco=$('#eco').checked;saveSettings();$('#settings').classList.remove('show')};$('#abandon').onclick=()=>{if(confirm('Abandonner la partie en cours ?')){G.running=false;cancelAnimationFrame(raf);$('#pause').classList.remove('show');records();show('home')}};if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'));
