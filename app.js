const $=s=>document.querySelector(s),C=$('#c'),X=C.getContext('2d'),screens=[...document.querySelectorAll('.screen')];let W,H,dpr,G,raf;
const CFG={spawnRate:2.0,minSpawnInterval:1.0,spawnRamp:420,maxEnemies:55};
const BOSS=[{x:650,y:0,name:'Gardien Est',color:'#ff784d',hp:55,xp:22},{x:-620,y:-620,name:'Gardien Nord-Ouest',color:'#f04d8b',hp:80,xp:28},{x:0,y:900,name:'Colosse Sud',color:'#a96cff',hp:110,xp:35}];
const BIOME_COLORS = {
  forest: {
    ground: '#263d2b',
    detail: '#355438'
  },
  swamp: {
    ground: '#293b2b',
    detail: '#46502d'
  },
  desert: {
    ground: '#b99a5d',
    detail: '#d0b477'
  }
};
const BLOCK_COLORS = {
    default: ['#59616b', '#343b45'],
    forest: ['#47734b', '#294b32'],
    swamp: ['#68734a', '#414a30'],
    desert: ['#c9a45e', '#92703c']
};
const MAP_SIZE=12000;
const MAP_HALF=MAP_SIZE/2;

const RUINS=[
{id:'forest',name:'Sanctuaire des Racines',biome:'forest',x:1100,y:1100,color:'#7bc77a',stone:'#526b4c',symbol:'✦'},
{id:'volcano',name:'Forge des Cendres',biome:'volcano',x:-2200,y:0,color:'#ff7545',stone:'#69443c',symbol:'♨'},
{id:'ice',name:'Temple du Givre',biome:'ice',x:2200,y:0,color:'#8be8ff',stone:'#668a9a',symbol:'❄'},
{id:'swamp',name:'Autel Englouti',biome:'swamp',x:-3700,y:-3700,color:'#b4d45a',stone:'#586044',symbol:'☠'},
{id:'desert',name:'Tombeau des Sables',biome:'desert',x:3700,y:-3700,color:'#f2ce78',stone:'#9b8051',symbol:'◇'},
{id:'corrupt',name:'Cathédrale Corrompue',biome:'corrupt',x:-3700,y:3700,color:'#d27cff',stone:'#65466d',symbol:'✧'},
{id:'crystal',name:'Observatoire Cristallin',biome:'crystal',x:3700,y:3700,color:'#76eaff',stone:'#477d9b',symbol:'✦'}
];
const RUIN_BOSSES={
forest:{name:'Florax, Gardien Sylvestre',color:'#67c65c',hp:260,xp:120,coins:220,r:34},
volcano:{name:'Ignar, Cœur de Magma',color:'#ff6338',hp:300,xp:140,coins:240,r:35},
ice:{name:'Cryon, Sentinelle de Glace',color:'#71dfff',hp:320,xp:150,coins:250,r:36},
swamp:{name:'Mordec, Œil des Marais',color:'#a9c84c',hp:340,xp:160,coins:270,r:34},
desert:{name:'Mékan, Scarabée Ancien',color:'#e8b95c',hp:370,xp:175,coins:290,r:37},
corrupt:{name:'Nox, Crâne des Ombres',color:'#bd6be8',hp:410,xp:190,coins:320,r:36},
crystal:{name:'Astra, Cœur Prismatique',color:'#5edcff',hp:450,xp:220,coins:350,r:38}
};
const SWORD_UP=[['sDamage','Impact',['+50 % dégâts','+100 % dégâts','+175 % dégâts']],['sRange','Zone de frappe',['70 px','100 px','125 px']],['sRate','Recharge',['-12 % délai','-24 % délai','-36 % délai']],['lifeSteal','Vampirisme',['5 %','10 %','15 %']]];
const GUN_UP=[['multi','Tir multiple',['2 projectiles','3 projectiles','4 projectiles']],['damage','Puissance',['+20 % dégâts','+40 % dégâts','+65 % dégâts']],['rate','Cadence',['+12 %','+25 %','+40 %']],['range','Portée',['380 px','440 px','500 px']],['life','Vie maximale',['120 PV et +20 PV','145 PV et +20 PV','175 PV et +20 PV']],['armor','Armure',['-8 % dégâts','-16 % dégâts','-25 % dégâts']],['speed','Vitesse',['+8 %','+15 %','+23 %']],['magnet','Aimant',['120 px','170 px','230 px']],['pierce','Perforation',['1 ennemi','2 ennemis','3 ennemis']],['regen','Régénération',['1 PV / 10 s','1 PV / 7 s','1 PV / 4 s']]];
const ICONS={sDamage:'⚔',sRange:'↗',sRate:'⏱',lifeSteal:'♥',multi:'⑂',damage:'💥',rate:'⚡',range:'◎',life:'✚',armor:'⬡',speed:'➤',magnet:'🧲',pierce:'➶',regen:'♻',fire:'🔥',chain:'ϟ',slow:'◉',shield:'⬡',fury:'✹',magnetSupreme:'🧲',divineRegen:'✚',storm:'ϟ',overdrive:'⚡'};
const COLORS={sDamage:'#ff7b63',sRange:'#79d7ff',sRate:'#ffd45f',lifeSteal:'#ff668b',multi:'#ffe475',damage:'#ff695e',rate:'#63dbff',range:'#70b9ff',life:'#66e28b',armor:'#9fb7d8',speed:'#70e5ca',magnet:'#c18cff',pierce:'#e2e8ff',regen:'#5de19b',fire:'#ff8a36',chain:'#67d9ff',slow:'#a78bfa',shield:'#7de0ff',fury:'#ff8066',magnetSupreme:'#d5a0ff',divineRegen:'#68e6a5',storm:'#f4d35e',overdrive:'#ff9b58'};
let SETTINGS=JSON.parse(localStorage.nzSettings||'{}');SETTINGS={effects:'normal',vibration:true,shake:true,damageText:true,joyOpacity:100,buttonSize:'normal',eco:false,...SETTINGS};function saveSettings(){localStorage.nzSettings=JSON.stringify(SETTINGS);applySettings()}function applySettings(){document.documentElement.style.setProperty('--joy-opacity',SETTINGS.joyOpacity/100);document.body.classList.toggle('largeButtons',SETTINGS.buttonSize==='large');document.body.classList.toggle('eco',SETTINGS.eco)}applySettings();function notify(text,kind='info'){let n=document.createElement('div');n.className='toast '+kind;n.textContent=text;document.body.appendChild(n);setTimeout(()=>n.classList.add('show'),10);setTimeout(()=>{n.classList.remove('show');setTimeout(()=>n.remove(),250)},1600)}


function rnd(min, max) {
    if (max === undefined) {
        max = min;
        min = 0;
    }
    return Math.random() * (max - min) + min;
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function show(id){screens.forEach(s=>s.classList.remove('active'));$('#'+id).classList.add('active')}

function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    const rect = C.parentElement.getBoundingClientRect();

    W = Math.max(1, Math.round(rect.width));
    H = Math.max(1, Math.round(rect.height));

    C.width = Math.round(W * dpr);
    C.height = Math.round(H * dpr);

    C.style.width = W + 'px';
    C.style.height = H + 'px';

    X.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);

window.addEventListener('orientationchange', () => {
    setTimeout(resize, 300);
});

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resize);
}
function blockData(cx,cy){
    let seed=((cx*73856093)^(cy*19349663)^G.mapSeed)>>>0;

    let r=()=>{
        seed=Math.imul(seed^seed>>>15,1|seed);
        seed^=seed+Math.imul(seed^seed>>>7,61|seed);
        return ((seed^seed>>>14)>>>0)/4294967296;
    };

    let a=[];

    if(cx||cy){
        for(let i=0,n=2+Math.floor(r()*4);i<n;i++){
            let wall=r()<.35;

            let o={
                x:cx*700+80+r()*540,
                y:cy*700+80+r()*540,
                w:wall?25:45+r()*55,
                h:wall?100+r()*130:45+r()*55
            };

            // Ne pas placer de structure en dehors de la carte
            if(
                o.x>=-MAP_HALF+50 &&
                o.y>=-MAP_HALF+50 &&
                o.x+o.w<=MAP_HALF-50 &&
                o.y+o.h<=MAP_HALF-50
            ){
                a.push(o);
            }
        }
    }

    return a;
}

function hit(p,o){
    return p.x+p.r>o.x &&
           p.x-p.r<o.x+o.w &&
           p.y+p.r>o.y &&
           p.y-p.r<o.y+o.h;
}

function move(o,dx,dy,b){
    const oldX=o.x,oldY=o.y;
    o.x+=dx;
    if(b.some(q=>hit(o,q)))o.x=oldX;
    o.y+=dy;
    if(b.some(q=>hit(o,q)))o.y=oldY;
    if(b.some(q=>hit(o,q))){
        let escaped=false;
        for(let radius=12;radius<=120&&!escaped;radius+=12){
            for(let k=0;k<16;k++){
                const angle=k*Math.PI/8,tx=oldX+Math.cos(angle)*radius,ty=oldY+Math.sin(angle)*radius;
                const probe={...o,x:tx,y:ty};
                if(!b.some(q=>hit(probe,q))){o.x=tx;o.y=ty;escaped=true;break;}
            }
        }
        if(!escaped){o.x=oldX;o.y=oldY;}
    }

    const margin=(o.r||0)+5;

    o.x=clamp(o.x,-MAP_HALF+margin,MAP_HALF-margin);
    o.y=clamp(o.y,-MAP_HALF+margin,MAP_HALF-margin);
}
function blocks(){
    let p=G.p;
    let cx=Math.floor(p.x/700);
    let cy=Math.floor(p.y/700);
    let a=[];

    for(let x=cx-1;x<=cx+1;x++){
        for(let y=cy-1;y<=cy+1;y++){
            let k=x+','+y;

            if(!G.blocks[k]){
                G.blocks[k]=blockData(x,y);
            }

            a.push(...G.blocks[k]);
        }
    }

    return a;
}

// ===============================
// BIOMES
// ===============================

// Organisation de la carte :
// Centre : forêt
// Ouest : volcan
// Est : glacier
// Coins : 4 biomes spécifiques



// Générateur aléatoire déterministe
function makeRandom(seed) {
    return function() {
        seed = Math.imul(seed ^ seed >>> 15, 1 | seed);
        seed ^= seed + Math.imul(seed ^ seed >>> 7, 61 | seed);
        return ((seed ^ seed >>> 14) >>> 0) / 4294967296;
    };
}

function getBiome(x, y) {
    // Déformation déterministe des coordonnées :
    // les frontières ne sont plus parfaitement droites.
    const wx = x
        + Math.sin(y / 390) * 230
        + Math.sin(y / 170 + x / 700) * 95;

    const wy = y
        + Math.sin(x / 430) * 220
        + Math.sin(x / 190 + y / 650) * 85;

    if (Math.abs(wx) > 2500 && Math.abs(wy) > 2500) {
        if (wx < 0 && wy < 0) return 'swamp';
        if (wx > 0 && wy < 0) return 'desert';
        if (wx < 0 && wy > 0) return 'corrupt';
        return 'crystal';
    }

    if (wx < -1500) return 'volcano';
    if (wx > 1500) return 'ice';

    return 'forest';
}

// Décors : peu nombreux et imposants
function decorData(cx,cy){
    const candidates=[];
    for(let gx=cx-1;gx<=cx+1;gx++)for(let gy=cy-1;gy<=cy+1;gy++){
        let seed=(gx*73856093^gy*19349663^G.mapSeed^92821)>>>0;
        let r=makeRandom(seed),n=1+Math.floor(r()*3);
        for(let i=0;i<n;i++){
            const x=gx*700+70+r()*560,y=gy*700+70+r()*560;
            if(x< -MAP_HALF+60||x>MAP_HALF-60||y< -MAP_HALF+60||y>MAP_HALF-60)continue;
            const biome=getBiome(x,y),types={forest:['tree','tree','tree','bush'],volcano:['rock','rock','rock'],ice:['pine','pine','crystal'],swamp:['deadTree','deadTree','mushroom'],desert:['cactus','rock','rock'],corrupt:['corruptTree','corruptTree','rock'],crystal:['crystal','crystal','crystal']};
            const list=types[biome];
            candidates.push({x,y,type:list[Math.floor(r()*list.length)],size:40+r()*30,cx:gx,cy:gy});
        }
    }
    candidates.sort((a,b)=>a.x-b.x||a.y-b.y);
    const accepted=[];
    for(const o of candidates)if(!accepted.some(q=>Math.hypot(o.x-q.x,o.y-q.y)<(o.size+q.size)*.95))accepted.push(o);
    return accepted.filter(o=>o.cx===cx&&o.cy===cy);
}

function drawBiomeGround(p) {
    X.fillStyle = '#0d1b2c';
    X.fillRect(p.x-W/2,p.y-H/2,W,H);

    const size = 85;

    const left = Math.max(-MAP_HALF, Math.floor((p.x-W/2)/size)*size);
    const right = Math.min(MAP_HALF, p.x+W/2+size);
    const top = Math.max(-MAP_HALF, Math.floor((p.y-H/2)/size)*size);
    const bottom = Math.min(MAP_HALF, p.y+H/2+size);

    // BOUCLE À REMPLACER
    for(let x=left;x<right;x+=size){
        for(let y=top;y<bottom;y+=size){
            const biome=getBiome(x+size/2,y+size/2);

            X.fillStyle = BIOME_COLORS[biome]?.ground || '#0d1b2c';
            X.fillRect(x,y,size+1,size+1);
        }
    }
}


// Décors droits, sans rotation
function drawDecorations(p) {
    let cx1 = Math.floor((p.x - W / 2) / 700) - 1;
    let cx2 = Math.floor((p.x + W / 2) / 700) + 1;
    let cy1 = Math.floor((p.y - H / 2) / 700) - 1;
    let cy2 = Math.floor((p.y + H / 2) / 700) + 1;

    for (let cx = cx1; cx <= cx2; cx++) {
        for (let cy = cy1; cy <= cy2; cy++) {
            for (let o of decorData(cx, cy)) {
                if (
                    o.x < p.x - W / 2 - 100 ||
                    o.x > p.x + W / 2 + 100 ||
                    o.y < p.y - H / 2 - 100 ||
                    o.y > p.y + H / 2 + 100
                ) continue;

                let s = o.size;

                X.save();
                X.translate(o.x, o.y);

                if (o.type === 'tree' || o.type === 'deadTree' || o.type === 'corruptTree') {
                    // Tronc
                    X.fillStyle = o.type === 'deadTree' ? '#51483a' :
                                  o.type === 'corruptTree' ? '#493052' : '#493326';
                    X.fillRect(-7, -2, 14, s * 1.15);

                    // Ombre au sol
                    X.fillStyle = '#080e0b66';
                    X.beginPath();
                    X.ellipse(0, s * .85, s * .8, s * .25, 0, 0, Math.PI * 2);
                    X.fill();

                    if (o.type === 'deadTree') {
                        X.strokeStyle = '#71604b';
                        X.lineWidth = 8;
                        X.beginPath();
                        X.moveTo(0, 0);
                        X.lineTo(-s * .55, -s * .65);
                        X.moveTo(0, -s * .15);
                        X.lineTo(s * .55, -s * .8);
                        X.stroke();
                    } else {
                        X.fillStyle = o.type === 'corruptTree' ? '#62366c' : '#245638';
                        X.beginPath();
                        X.arc(0, -s * .45, s * .78, 0, Math.PI * 2);
                        X.fill();

                        X.fillStyle = o.type === 'corruptTree' ? '#9952a6' : '#347448';
                        X.beginPath();
                        X.arc(-s * .2, -s * .6, s * .42, 0, Math.PI * 2);
                        X.fill();
                    }
                }

                else if (o.type === 'pine') {
                    X.fillStyle = '#244b55';
                    X.beginPath();
                    X.moveTo(0, -s);
                    X.lineTo(s * .72, s * .55);
                    X.lineTo(-s * .72, s * .55);
                    X.closePath();
                    X.fill();

                    X.fillStyle = '#d9f3ff';
                    X.beginPath();
                    X.moveTo(0, -s);
                    X.lineTo(s * .3, -s * .05);
                    X.lineTo(-s * .3, -s * .05);
                    X.closePath();
                    X.fill();

                    X.fillStyle = '#5c4534';
                    X.fillRect(-5, s * .45, 10, s * .35);
                }

                else if (o.type === 'rock') {
                    X.fillStyle = '#51434a';
                    X.beginPath();
                    X.moveTo(-s, s * .4);
                    X.lineTo(-s * .75, -s * .35);
                    X.lineTo(-s * .2, -s);
                    X.lineTo(s * .55, -s * .65);
                    X.lineTo(s, s * .25);
                    X.lineTo(s * .5, s * .75);
                    X.closePath();
                    X.fill();

                    X.fillStyle = '#806b70';
                    X.beginPath();
                    X.moveTo(-s * .2, -s * .8);
                    X.lineTo(s * .45, -s * .55);
                    X.lineTo(s * .05, -s * .15);
                    X.closePath();
                    X.fill();
                }

                else if (o.type === 'crystal') {
                    X.shadowColor = '#72dfff';
                    X.shadowBlur = 15;

                    X.fillStyle = '#4389b7';
                    X.beginPath();
                    X.moveTo(0, -s * 1.2);
                    X.lineTo(s * .48, -s * .15);
                    X.lineTo(s * .3, s);
                    X.lineTo(-s * .35, s * .8);
                    X.lineTo(-s * .48, -s * .2);
                    X.closePath();
                    X.fill();

                    X.fillStyle = '#a6edff';
                    X.beginPath();
                    X.moveTo(0, -s * 1.2);
                    X.lineTo(s * .08, s * .35);
                    X.lineTo(-s * .25, s * .5);
                    X.closePath();
                    X.fill();

                    X.shadowBlur = 0;
                }

                else if (o.type === 'cactus') {
                    X.fillStyle='#173d25';X.beginPath();X.ellipse(0,s*.48,s*.42,s*.13,0,0,Math.PI*2);X.fill();
                    X.strokeStyle='#477b42';X.lineWidth=s*.24;X.lineCap='round';X.lineJoin='round';
                    X.beginPath();X.moveTo(0,s*.42);X.lineTo(0,-s*.78);
                    X.moveTo(-s*.08,-s*.05);X.lineTo(-s*.43,-s*.05);X.lineTo(-s*.43,-s*.48);
                    X.moveTo(s*.08,s*.12);X.lineTo(s*.42,s*.12);X.lineTo(s*.42,-s*.34);X.stroke();
                    X.strokeStyle='#79a85c';X.lineWidth=2;X.beginPath();X.moveTo(-s*.035,-s*.68);X.lineTo(-s*.035,s*.32);X.stroke();
                }

                else if (o.type === 'mushroom') {
                    X.fillStyle = '#d8c5a0';
                    X.fillRect(-5, -s * .25, 10, s * .6);
                    X.fillStyle = '#a94e58';
                    X.beginPath();
                    X.ellipse(0, -s * .25, s * .45, s * .28, 0, Math.PI, 0);
                    X.fill();
                }

                X.restore();
            }
        }
    }
}

// ===============================
// ZONES DE LAVE
// ===============================

function lavaData(cx, cy) {
    let seed = (
        cx * 73856093 ^
        cy * 19349663 ^
        G.mapSeed ^
        48291
    ) >>> 0;

    let r = makeRandom(seed);
    let pools = [];

    let x = cx * 700 + 100 + r() * 500;
    let y = cy * 700 + 100 + r() * 500;

    if (getBiome(x, y) === 'volcano' && r() < .65) {
        pools.push({
            x,
            y,
            rx: 55 + r() * 45,
            ry: 35 + r() * 30,
            phase: r() * 10
        });
    }

    return pools;
}

function waterData(cx,cy){
    let seed=(
        cx*73856093 ^
        cy*19349663 ^
        G.mapSeed ^
        918273
    )>>>0;

    let r=makeRandom(seed);
    let x=cx*700+100+r()*500;
    let y=cy*700+100+r()*500;

    const biome=getBiome(x,y);

    let chance=0;
    let type='';

    if(biome==='forest'){
        chance=.27;
        type='lake';
    }
    else if(biome==='swamp'){
        chance=.32;
        type='poison';
    }
    else if(biome==='desert'){
        chance=.085;
        type='oasis';
    }

    if(r()>chance)return [];

    let radius=type==='oasis'
        ? 25+r()*18
        : type==='poison'
            ? 145+r()*100
            : 120+r()*100;

    return [{
        x,y,
        rx:radius,
        ry:radius*(.65+r()*.35),
        phase:r()*Math.PI*2,
        type
    }];
}

function terrainAt(p){
    let cx=Math.floor(p.x/700);
    let cy=Math.floor(p.y/700);

    for(let x=cx-1;x<=cx+1;x++){
        for(let y=cy-1;y<=cy+1;y++){
            for(let l of waterData(x,y)){
                let dx=(p.x-l.x)/l.rx;
                let dy=(p.y-l.y)/l.ry;

                let angle=Math.atan2(dy,dx);
                let irregular=1+
                    Math.sin(angle*3+l.phase)*.07+
                    Math.sin(angle*5-l.phase)*.035;

                if(Math.hypot(dx,dy)<irregular*.88){
                    return l.type;
                }
            }
        }
    }

    return null;
}

function isNearOasis(x,y){
    let cx=Math.floor(x/700);
    let cy=Math.floor(y/700);

    for(let bx=cx-2;bx<=cx+2;bx++){
        for(let by=cy-2;by<=cy+2;by++){
            for(let l of waterData(bx,by)){
                if(l.type==='oasis' &&
                   Math.hypot(x-l.x,y-l.y)<l.rx+115){
                    return l;
                }
            }
        }
    }

    return null;
}

function ensureOasisFeatures(p) {
    let cx = Math.floor(p.x / 700);
    let cy = Math.floor(p.y / 700);

    for (let bx = cx - 2; bx <= cx + 2; bx++) {
        for (let by = cy - 2; by <= cy + 2; by++) {
            for (let l of waterData(bx, by)) {
                if (l.type !== 'oasis' || dist(p, l) > 950) continue;

                const key = bx + ',' + by;
                let oasis = G.oasisSpawned[key];

                // Première découverte : création définitive des deux gardiens
                if (!oasis) {
                    oasis = G.oasisSpawned[key] = {
                        healTimer: 120,
                        healWave: 0
                    };

                    let base = Math.atan2(p.y - l.y, p.x - l.x);

                    for (let i = 0; i < 2; i++) {
                        let angle = base + (i === 0 ? -0.62 : 0.62);
                        let x = l.x + Math.cos(angle) * (l.rx + 38);
                        let y = l.y + Math.sin(angle) * (l.ry + 38);

                        G.en.push({
                            kind: 'shade',
                            shape: 0,
                            color: '#090b10',
                            x, y,
                            homeX: x,
                            homeY: y,
                            oasisX: l.x,
                            oasisY: l.y,
                            oasisKey: key,
                            leash: 220,
                            aggroRange: 360,
                            returnRange: 520,
                            hp: 18,
                            maxHp: 18,
                            xp: 12,
                            speed: 88,
                            dmg: 16,
                            r: 17,
                            coins: 4,
                            attack: 0,
                            hitT: 0,
                            armor: 0,
                            atk: rnd(1, 2.5),
                            tele: 0,
                            target: null
                        });
                    }

                    // Trois soins disponibles dès la découverte
                    for (let i = 0; i < 3; i++) {
                        G.drops.push({
                            x: l.x,
                            y: l.y,
                            r: 10,
                            type: 'heal',
                            v: 20,
                            age: 0,
                            oasisKey: key,
                            orbit: {
                                x: l.x,
                                y: l.y,
                                rx: l.rx * 0.38,
                                ry: l.ry * 0.38,
                                phase: i * Math.PI * 2 / 3,
                                speed: 0.8
                            }
                        });
                    }
                } else {
                    // Les soins reviennent par vagues de trois, toutes les 120 secondes
                    oasis.healTimer -= (G.dt || 0);
                    const remaining = G.drops.some(d => d.type === 'heal' && d.oasisKey === key);
                    if (oasis.healTimer <= 0 && !remaining) {
                        oasis.healTimer = 120;
                        oasis.healWave++;

                        for (let i = 0; i < 3; i++) {
                            G.drops.push({
                                x: l.x,
                                y: l.y,
                                r: 10,
                                type: 'heal',
                                v: 20,
                                age: 0,
                                oasisKey: key,
                                orbit: {
                                    x: l.x,
                                    y: l.y,
                                    rx: l.rx * 0.38,
                                    ry: l.ry * 0.38,
                                    phase: i * Math.PI * 2 / 3 + oasis.healWave * 0.4,
                                    speed: 0.8
                                }
                            });
                        }
                    }
                }
            }
        }
    }
}


function drawWater(p){
    let cx1=Math.floor((p.x-W/2)/700)-1;
    let cx2=Math.floor((p.x+W/2)/700)+1;
    let cy1=Math.floor((p.y-H/2)/700)-1;
    let cy2=Math.floor((p.y+H/2)/700)+1;

    let t=performance.now()/1000;

    for(let cx=cx1;cx<=cx2;cx++){
        for(let cy=cy1;cy<=cy2;cy++){
            for(let l of waterData(cx,cy)){
                X.save();
                X.translate(l.x,l.y);

                const poison=l.type==='poison';
                const oasis=l.type==='oasis';

                X.fillStyle=poison?'#172d23':
                    oasis?'#66502a':'#172d36';

                X.beginPath();
                X.ellipse(0,0,l.rx*1.1,l.ry*1.12,0,0,Math.PI*2);
                X.fill();

                X.fillStyle=poison?'#548b35':
                    oasis?'#38b9a1':'#267dba';

                X.beginPath();

                for(let i=0;i<=40;i++){
                    let a=i/40*Math.PI*2;
                    let wobble=1+
                        Math.sin(a*3+l.phase)*.07+
                        Math.sin(a*5-l.phase)*.035;

                    let xx=Math.cos(a)*l.rx*wobble;
                    let yy=Math.sin(a)*l.ry*wobble;

                    if(i===0)X.moveTo(xx,yy);
                    else X.lineTo(xx,yy);
                }

                X.closePath();
                X.fill();

                // Reflets animés
                X.globalAlpha=.3;
                X.strokeStyle=oasis?'#b6fff0':
                    poison?'#b0d84b':'#a3eaff';

                X.lineWidth=3;
                X.beginPath();
                X.ellipse(
                    Math.sin(t+l.phase)*l.rx*.2,
                    Math.cos(t*.7+l.phase)*l.ry*.2,
                    l.rx*.35,l.ry*.18,0,0,Math.PI*2
                );
                X.stroke();
                X.globalAlpha=1;

                // Petites plantes autour des oasis
                if(oasis){
                    X.fillStyle='#276d37';

                    for(let i=0;i<5;i++){
                        let a=i*Math.PI*2/5+l.phase;
                        let xx=Math.cos(a)*l.rx*1.25;
                        let yy=Math.sin(a)*l.ry*1.25;

                        X.beginPath();
                        X.arc(xx,yy,5,0,Math.PI*2);
                        X.fill();
                    }
                }

                X.restore();
            }
        }
    }
}


function isOnLava(p) {
    let cx = Math.floor(p.x / 700);
    let cy = Math.floor(p.y / 700);

    for (let x = cx - 1; x <= cx + 1; x++) {
        for (let y = cy - 1; y <= cy + 1; y++) {
            for (let l of lavaData(x, y)) {
                let dx = (p.x - l.x) / (l.rx * .82);
                let dy = (p.y - l.y) / (l.ry * .82);

                if (dx * dx + dy * dy < 1) return true;
            }
        }
    }

    return false;
}

function drawLava(p) {
    let cx1 = Math.floor((p.x - W / 2) / 700) - 1;
    let cx2 = Math.floor((p.x + W / 2) / 700) + 1;
    let cy1 = Math.floor((p.y - H / 2) / 700) - 1;
    let cy2 = Math.floor((p.y + H / 2) / 700) + 1;

    let t = performance.now() / 1000;

    for (let cx = cx1; cx <= cx2; cx++) {
        for (let cy = cy1; cy <= cy2; cy++) {
            for (let l of lavaData(cx, cy)) {
                X.save();
                X.translate(l.x, l.y);

                // Bord sombre
                X.fillStyle = '#481712';
                X.beginPath();
                X.ellipse(0, 0, l.rx * 1.15, l.ry * 1.2, 0, 0, Math.PI * 2);
                X.fill();

                // Surface rouge
                X.fillStyle = '#c52d16';
                X.beginPath();
                X.ellipse(0, 0, l.rx, l.ry, 0, 0, Math.PI * 2);
                X.fill();

                // Texture animée
                X.save();
                X.beginPath();
                X.ellipse(0, 0, l.rx, l.ry, 0, 0, Math.PI * 2);
                X.clip();

                for (let i = 0; i < 7; i++) {
                    let yy = Math.sin(t * 1.4 + i * 2 + l.phase) * l.ry * .55;
                    let xx = Math.cos(t * .9 + i * 3 + l.phase) * l.rx * .45;

                    X.strokeStyle = i % 2 ? '#ff8a26' : '#ffcf54';
                    X.globalAlpha = .65;
                    X.lineWidth = 5 + Math.sin(t * 2 + i) * 2;
                    X.beginPath();
                    X.moveTo(xx - 35, yy);
                    X.quadraticCurveTo(xx, yy - 12, xx + 35, yy + 5);
                    X.stroke();
                }

                X.restore();
                X.globalAlpha = 1;

                // Reflets
                X.fillStyle = '#ffdc63';
                X.beginPath();
                X.arc(Math.sin(t + l.phase) * l.rx * .35,
                      Math.cos(t * .8 + l.phase) * l.ry * .3,
                      5, 0, Math.PI * 2);
                X.fill();

                X.restore();
            }
        }
    }
}
function stats(){let u=G.up,L=G.legendary||{};return{speed:210*[1,1.08,1.16,1.25][u.speed],range:[330,380,440,500][u.range],damage:[1,1.20,1.40,1.65][u.damage]*(L.fury?1.4:1),rate:(.62/[1,1.12,1.25,1.40][u.rate])*(L.overdrive?.70:1),shots:1+u.multi,armor:Math.min(.65,[0,.08,.16,.25][u.armor]+(L.shield?.25:0)),magnet:[85,120,170,230][u.magnet]*(L.magnetSupreme?2:1),pierce:u.pierce,regen:[0,10,7,4][u.regen]}}
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
function start(){document.body.classList.add('transitioning');
                 setTimeout(()=>document.body.classList.remove('transitioning'),300);let up={};
                 [...SWORD_UP,...GUN_UP].forEach(x=>up[x[0]]=0);G={mapSeed:Math.floor(Math.random()*4294967296),oasisSpawned:{},p:{x:0,y:0,r:15,hp:100,maxHp:100},en:[],bul:[],enemyBul:[],bombs:[],slashes:[],drops:[],particles:[],texts:[],waves:[],blocks:{},ruins:{},bosses:[],bossTimer:180,bossIndex:0,bossCount:0,joy:null,kills:0,bossKills:0,damageDone:0,damageTaken:0,coinsRun:0,coresRun:0,purchases:[],carrying:false,coreExists:false,t:0,last:performance.now(),shot:0,spawn:0,inv:0,running:true,paused:false,level:1,xp:0,xpNeed:8,pending:0,levelUpDelay:0,up,fire:false,legendary:{},regenT:0,gun:false,smg:false,weapon:'pistol',swordT:0,swordMax:1.25,merchantT:45,merchantReady:false,merchantOpen:false,shake:0,levelFlash:0};updateHUD();
show('game');

requestAnimationFrame(() => {
    resize();
    draw();

    cancelAnimationFrame(raf);
    G.last = performance.now();
    raf = requestAnimationFrame(loop);
});
                }
function enemyType(){let t=G.t,r=Math.random();if(t>=240&&r<.06&&G.en.filter(e=>e.kind==='bomber').length<2)return{kind:'bomber',shape:2,color:'#9d55d9',hp:9,xp:10,speed:34,dmg:18,r:18,coins:4,attack:1};if(t>=120&&r<.28)return{kind:'spear',shape:1,color:'#f0a33e',hp:7,xp:7,speed:55,dmg:15,r:16,coins:3,attack:1};if(t>=90&&r<.38)return{kind:'shooter',shape:3,color:'#397ccf',hp:4,xp:6,speed:52,dmg:8,r:14,coins:2,attack:1};if(t>=420&&r<.55)return{kind:'tank',shape:3,color:'#9aa4b2',hp:18,xp:15,speed:62,dmg:22,r:19,coins:5,attack:0};if(t>=60&&r>=.55&&r<.78)return{kind:'brute',shape:0,color:'#b96b45',hp:8,xp:3,speed:58,dmg:13,r:15,coins:2,attack:0};return{kind:'chaser',shape:0,color:'#e54855',hp:t>=120?4:4,xp:1,speed:68,dmg:10,r:14,coins:1,attack:0}}

function findFreePosition(x,y,r=16,obstacles=blocks()){
    const probe={x,y,r};
    if(!obstacles.some(q=>hit(probe,q)))return{x,y};
    for(let radius=18;radius<=220;radius+=18)for(let k=0;k<24;k++){
        const angle=k*Math.PI/12,tx=x+Math.cos(angle)*radius,ty=y+Math.sin(angle)*radius;
        probe.x=tx;probe.y=ty;if(!obstacles.some(q=>hit(probe,q)))return{x:tx,y:ty};
    }
    return{x,y};
}
function spawnEnemy(){
    let a=Math.random()*Math.PI*2;
    let d=Math.max(W,H)*.62+80;

    let x=clamp(
        G.p.x+Math.cos(a)*d,
        -MAP_HALF+40,
        MAP_HALF-40
    );

    let y=clamp(
        G.p.y+Math.sin(a)*d,
        -MAP_HALF+40,
        MAP_HALF-40
    );

    const free=findFreePosition(x,y,18,blocks());x=free.x;y=free.y;
    let e = enemyType();
    const elite=Math.random()<.05;

    if(elite){
        e.hp*=3;
        e.maxHp=e.hp;
        e.speed*=1.15;
        e.coins*=4;
        e.xp*=3;
        e.color='#ffd84c';
        e.r*=1.4;
    }

    G.en.push({
        ...e,
        x,y,
        maxHp:e.hp,
        hitT:0,
        armor:0,
        atk:rnd(1,2.5),
        tele:0,
        target:null
    });
}

function spawnBoss(){
    let template=BOSS[G.bossIndex%BOSS.length];
    G.bossIndex++;
    G.bossCount++;

    let angle=Math.random()*Math.PI*2;
    let distance=Math.max(W,H)*0.65+180;
    let x=clamp(G.p.x+Math.cos(angle)*distance,-MAP_HALF+120,MAP_HALF-120);
let y=clamp(G.p.y+Math.sin(angle)*distance,-MAP_HALF+120,MAP_HALF-120);

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
function activateRuins(){
    for(const ruin of RUINS){
        if(G.ruins[ruin.id]||dist(G.p,ruin)>560)continue;
        G.ruins[ruin.id]='awakened';
        const t=RUIN_BOSSES[ruin.id];
        const boss={...t,ruinId:ruin.id,x:ruin.x,y:ruin.y,homeX:ruin.x,homeY:ruin.y,maxHp:t.hp,hp:t.hp,alive:true,hitT:0,flash:0,squash:0,active:false,hunting:false,speed:48,armor:0,attackT:1.2,attackPattern:0,rotation:0,xp:t.xp};
        G.bosses.push(boss);
        notify('RUINES ÉVEILLÉES : '+ruin.name,'rare');
        particle(ruin.x,ruin.y,ruin.color,42,250);
        G.waves.push({x:ruin.x,y:ruin.y,r:80,life:1.2,max:1.2,color:ruin.color});
    }
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
            fire:G.fire,
            chainLeft:G.legendary?.chain?4:0
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
const LEGENDARY_UP=[
{id:'chain',name:'Foudre en chaîne',desc:'Les projectiles rebondissent sur 4 ennemis proches (60 % des dégâts).',icon:'ϟ',color:'#67d9ff'},
{id:'slow',name:'Ralentisseur',desc:'Tous les ennemis se déplacent 25 % moins vite.',icon:'◉',color:'#a78bfa'},
{id:'shield',name:'Bouclier',desc:'Réduit de 25 % tous les dégâts reçus.',icon:'⬡',color:'#7de0ff'},
{id:'fury',name:'Fureur',desc:'Inflige 40 % de dégâts supplémentaires.',icon:'✹',color:'#ff8066'},
{id:'magnetSupreme',name:'Aimant suprême',desc:'Double la portée d’attraction des pièces.',icon:'🧲',color:'#d5a0ff'},
{id:'divineRegen',name:'Régénération divine',desc:'Récupère 1 % des PV maximum chaque seconde.',icon:'✚',color:'#68e6a5'},
{id:'storm',name:'Orage permanent',desc:'Un éclair frappe un ennemi proche chaque seconde.',icon:'ϟ',color:'#f4d35e'},
{id:'overdrive',name:'Surpuissance',desc:'Cadence de tir +30 % et frappe de l’épée +20 % plus rapide.',icon:'⚡',color:'#ff9b58'}];
function openLevel(){
 G.waves.push({x:G.p.x,y:G.p.y,r:15,life:.6,max:.6,color:'#55b9ff'});G.levelFlash=.45;particle(G.p.x,G.p.y,'#55b9ff',18,150);G.paused=true;cancelAnimationFrame(raf);joyEnd();
 let pool=[...SWORD_UP,...GUN_UP.filter(x=>G.gun||['life','armor','speed','magnet','regen'].includes(x[0]))].filter(x=>G.up[x[0]]<3),chosen=[];
 while(pool.length&&chosen.length<4){let i=Math.floor(Math.random()*pool.length);chosen.push(pool.splice(i,1)[0])}
 if(G.gun&&!G.fire&&G.up.multi>0&&Math.random()<.05&&chosen.length)chosen[Math.floor(Math.random()*chosen.length)]=['fire','Tir enflammé',['Brûlure pendant 2 s']];
 const legendaryPool=LEGENDARY_UP.filter(x=>!G.legendary?.[x.id]);
 const legendary=legendaryPool.length?legendaryPool[Math.floor(Math.random()*legendaryPool.length)]:null;
 let box=$('#choices');box.innerHTML='';
 for(let u of chosen){let fire=u[0]==='fire',lv=fire?0:G.up[u[0]],btn=document.createElement('button');btn.className='choice'+(fire?' fire':'');let key=u[0],ico=ICONS[key]||'✦',color=COLORS[key]||'#65d8ff';btn.style.setProperty('--accent',color);btn.innerHTML=`<span class="cardIcon">${ico}</span><span class="cardBody"><strong>${u[1]}${fire?'':` ${lv+1}/3`}</strong><small>${u[2][fire?0:lv]}${fire?' — ATout rare gratuit':''}</small></span><span class="cardLevel">${fire?'RARE':(lv+1)+'/3'}</span>`;btn.onclick=()=>choose(u[0]);box.appendChild(btn)}
 if(legendary){let btn=document.createElement('button');btn.className='choice legendary';btn.style.setProperty('--accent',legendary.color);btn.disabled=(+(localStorage.cores||0))<1;btn.innerHTML=`<span class="cardIcon">${legendary.icon}</span><span class="cardBody"><strong>${legendary.name}</strong><small>${legendary.desc}</small><em>◆ 1 diamant</em></span><span class="cardLevel">LÉGENDAIRE</span>`;btn.onclick=()=>choose('legendary:'+legendary.id);box.appendChild(btn)}
 $('#levelup').classList.add('show');
}
function choose(k){
    if(k.startsWith('legendary:')){const id=k.split(':')[1];if((+(localStorage.cores||0))<1||G.legendary[id])return;localStorage.cores=+(localStorage.cores||0)-1;G.legendary[id]=true;notify('Atout légendaire acquis : '+(LEGENDARY_UP.find(x=>x.id===id)?.name||id),'rare');}
    G.waves.push({x:G.p.x,y:G.p.y,r:20,life:.75,max:.75,color:'#75e4ff'});
    particle(G.p.x,G.p.y,'#75e4ff',14,120);
    floatText(G.p.x,G.p.y-35,'AMÉLIORATION !','#75e4ff',15);
    if(k==='fire'){
        G.fire=true;
    }else if(!k.startsWith('legendary:')){
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

    if(G.up.lifeSteal>0 && Math.random()<[0,.05,.10,.15][G.up.lifeSteal]){
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
        const bossCoins=e.ruinId?(RUIN_BOSSES[e.ruinId]?.coins||250):150;
        if(!e.ruinId)G.coinsRun+=150;

        notify(e.ruinId?'RÉCOMPENSE : '+bossCoins+' PIÈCES À RÉCUPÉRER !':'+'+bossCoins+' PIÈCES — BOSS ÉLIMINÉ !','rare');

        particle(e.x,e.y,'#ffd84c',40,260);
        floatText(e.x,e.y-55,'+'+(e.ruinId?(RUIN_BOSSES[e.ruinId]?.coins||250):150)+' PIÈCES','#ffd84c',20);
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
        v:boss?(e.ruinId?(RUIN_BOSSES[e.ruinId]?.coins||250):100):(e.coins||1)+Math.floor(Math.random()*2)
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
function swordAttack(){const u=G.up,reach=[60,70,100,125][u.sRange],damage=[2,3,4,5.5][u.sDamage]*(G.legendary?.fury?1.4:1);const candidates=[...G.en.filter(e=>e.hp>0),...G.bosses.filter(b=>b.alive&&b.hp>0)];let target=null,best=Infinity;for(const e of candidates){const gap=Math.max(0,dist(G.p,e)-G.p.r-e.r);if(gap<=reach&&gap<best){best=gap;target=e}}if(!target)return false;const a=Math.atan2(target.y-G.p.y,target.x-G.p.x);G.slashes.push({a,life:.26,max:.26,range:reach+G.p.r,target});target.hp-=damage;G.damageDone+=damage;target.hitT=3;impact(target,damage,'#d9f2ff');G.shake=Math.max(G.shake,2);if(target.hp<=0){const boss=G.bosses.includes(target);if(boss)target.alive=false;kill(target,boss,true)}return true}
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
        cost:45,
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
    G.purchases=G.purchases||[];
    G.purchases.push(it.name);

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
function rangedEnemy(e,dt){let slow=G.legendary?.slow?.75:1;let d=dist(e,G.p)||1,ideal=e.kind==='bomber'?330:260;if(d>ideal+35)move(e,(G.p.x-e.x)/d*e.speed*slow*dt,(G.p.y-e.y)/d*e.speed*slow*dt,blocks());else if(d<ideal-45)move(e,-(G.p.x-e.x)/d*e.speed*slow*dt,-(G.p.y-e.y)/d*e.speed*slow*dt,blocks());e.atk-=dt;if(e.atk<=0){if(e.kind==='bomber'){G.bombs.push({x:G.p.x,y:G.p.y,t:1.6,r:60})}else{let sp=e.kind==='spear'?340:230;G.enemyBul.push({x:e.x,y:e.y,vx:(G.p.x-e.x)/d*sp,vy:(G.p.y-e.y)/d*sp,r:e.kind==='spear'?6:4,dmg:e.dmg,life:2.4,color:e.kind==='spear'?'#ffad4d':'#78b8ff'})}e.atk=e.kind==='bomber'?6:e.kind==='spear'?2.5:2}}

function separateEnemies(obstacles) {
    const enemies = G.en;

    // Deux passes pour corriger les chevauchements
    for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < enemies.length; i++) {
            let a = enemies[i];

            for (let j = i + 1; j < enemies.length; j++) {
                let other = enemies[j];

                let dx = other.x - a.x;
                let dy = other.y - a.y;
                let d = Math.hypot(dx, dy);

                let minDist = (a.r || 14) + (other.r || 14) + 6;

                if (d >= minDist) continue;

                // Évite les divisions par zéro
                if (d < 0.001) {
                    let angle = (i * 17 + j * 31) * Math.PI / 180;
                    dx = Math.cos(angle);
                    dy = Math.sin(angle);
                    d = 1;
                }

                let nx = dx / d;
                let ny = dy / d;

                let push = (minDist - d) * 0.65;

                // Repousse les deux ennemis
                move(
                    a,
                    -nx * push * 0.5,
                    -ny * push * 0.5,
                    obstacles
                );

                move(
                    other,
                    nx * push * 0.5,
                    ny * push * 0.5,
                    obstacles
                );
            }
        }
    }
}

function bossAttack(q,dt){
    q.attackT-=dt;
    if(q.attackT>0)return;

    let p=G.p;
    let angle=Math.atan2(p.y-q.y,p.x-q.x);

    if(q.ruinId){
        const patterns={
            forest:{count:8,speed:185,r:7,dmg:12,mode:'ring'},
            volcano:{count:9,speed:205,r:8,dmg:14,mode:'ring'},
            ice:{count:6,speed:235,r:7,dmg:13,mode:'star'},
            swamp:{count:10,speed:155,r:8,dmg:12,mode:'ring'},
            desert:{count:5,speed:285,r:7,dmg:15,mode:'fan'},
            corrupt:{count:12,speed:180,r:7,dmg:14,mode:'spiral'},
            crystal:{count:3,speed:300,r:9,dmg:16,mode:'fan'}
        };
        const cfg=patterns[q.ruinId]||patterns.forest;
        q.rotation=(q.rotation||0)+.34;
        for(let i=0;i<cfg.count;i++){
            let a=cfg.mode==='fan'
                ? angle+(i-(cfg.count-1)/2)*.22
                : cfg.mode==='spiral'
                    ? q.rotation+i*Math.PI*2/cfg.count
                    : q.rotation+i*Math.PI*2/cfg.count;
            if(cfg.mode==='star')a+=Math.PI/6;
            G.enemyBul.push({x:q.x,y:q.y,vx:Math.cos(a)*cfg.speed,vy:Math.sin(a)*cfg.speed,r:cfg.r,dmg:cfg.dmg,life:3.6,color:q.color});
        }
        particle(q.x,q.y,q.color,16,150);
        q.attackT=q.ruinId==='volcano'||q.ruinId==='corrupt'?2.25:2.6;
        return;
    }

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

function update(dt){
let p=G.p,b=blocks(),s=stats(),j=G.joy;

let terrain=terrainAt(p);
let terrainSpeed=terrain==='lake'?.58:
                 terrain==='poison'?.48:
                 terrain==='oasis'?.85:1;

if(j&&j.mag>8){
    move(
        p,
        j.dx/j.mag*s.speed*terrainSpeed*dt,
        j.dy/j.mag*s.speed*terrainSpeed*dt,
        b
    );
}

G.t+=dt;
G.dt=dt;
ensureOasisFeatures(p);
// Lave
G.lavaT=Math.max(0,(G.lavaT||0)-dt);

if(isOnLava(p)&&G.lavaT<=0){
    let dmg=Math.max(1,Math.round(12*(1-s.armor)));
    p.hp-=dmg;
    G.damageTaken+=dmg;
    G.lavaT=.65;

    floatText(p.x,p.y-30,'-'+dmg+' PV','#ff6238',15);
    particle(p.x,p.y,'#ff572d',8,90);

    if(p.hp<=0)return end();
}

// Poison : dégâts réguliers
G.poisonT=Math.max(0,(G.poisonT||0)-dt);

if(terrain==='poison'&&G.poisonT<=0){
    let dmg=Math.max(1,Math.round(4*(1-s.armor)));

    p.hp-=dmg;
    G.damageTaken+=dmg;
    G.poisonT=1.2;

    floatText(p.x,p.y-30,'-'+dmg+' PV','#a8df43',14);
    particle(p.x,p.y,'#a8df43',5,55);

    if(p.hp<=0)return end();
}

// Oasis : très faible régénération
G.oasisT=(G.oasisT||0)+dt;

if(terrain==='oasis'&&G.oasisT>=5){
    G.oasisT=0;

    if(p.hp<p.maxHp){
        p.hp=Math.min(p.maxHp,p.hp+1);
        floatText(p.x,p.y-30,'+1 PV','#65edb1',13);
        particle(p.x,p.y,'#65edb1',3,35);
    }
}else if(terrain!=='oasis'){
    G.oasisT=0;
}
// Dégâts lorsque le joueur marche dans la lave
G.lavaT = Math.max(0, (G.lavaT || 0) - dt);

if (isOnLava(p) && G.lavaT <= 0) {
    let dmg = Math.max(1, Math.round(12 * (1 - s.armor)));

    p.hp -= dmg;
    G.damageTaken += dmg;
    G.lavaT = 0.65;

    floatText(p.x, p.y - 30, '-' + dmg + ' PV', '#ff6238', 15);
    particle(p.x, p.y, '#ff572d', 8, 90);

    if (p.hp <= 0) return end();
}

activateRuins();

G.bossTimer-=dt;

if(G.bossTimer<=0){
    spawnBoss();
    G.bossTimer=180;
}G.shake=Math.max(0,G.shake-dt*14);G.levelFlash=Math.max(0,G.levelFlash-dt);for(let z of G.particles){z.x+=z.vx*dt;z.y+=z.vy*dt;z.vx*=.94;z.vy*=.94;z.life-=dt}G.particles=G.particles.filter(z=>z.life>0);for(let z of G.texts){z.y-=24*dt;z.life-=dt}G.texts=G.texts.filter(z=>z.life>0);for(let z of G.waves){z.r+=150*dt;z.life-=dt}G.waves=G.waves.filter(z=>z.life>0);if(!G.merchantReady){G.merchantT-=dt;if(G.merchantT<=0){G.merchantT=0;G.merchantReady=true;notify('Marchand disponible','shop')}}if(G.swordT>0)G.swordT=Math.max(0,G.swordT-dt);if(G.swordT===0&&swordAttack()){G.swordMax=[1.25,1.10,.95,.80][G.up.sRate]*(G.legendary?.overdrive?.8:1);G.swordT=G.swordMax}G.inv=Math.max(0,G.inv-dt);if(s.regen){G.regenT+=dt;if(G.regenT>=s.regen){G.regenT=0;p.hp=Math.min(p.maxHp,p.hp+1)}}if(G.legendary?.divineRegen){G.divineT=(G.divineT||0)+dt;if(G.divineT>=1){G.divineT-=1;p.hp=Math.min(p.maxHp,p.hp+Math.max(1,p.maxHp*.01))}}if(G.legendary?.storm){G.stormT=(G.stormT||0)+dt;if(G.stormT>=1){G.stormT-=1;let target=[...G.en,...G.bosses.filter(z=>z.alive)].filter(e=>dist(e,p)<230).sort((a,b)=>dist(a,p)-dist(b,p))[0];if(target){let dmg=3*stats().damage;target.hp-=dmg;G.damageDone+=dmg;impact(target,dmg,'#f4d35e');particle(target.x,target.y,'#f4d35e',8,100);if(target.hp<=0){let boss=G.bosses.includes(target);if(boss)target.alive=false;kill(target,boss)}}}}G.shot-=dt;if(G.shot<=0){
    fire();
    G.shot=s.rate*(G.weapon==='smg'?.60:1);
}G.spawn-=dt;if(G.spawn<=0&&G.en.length<CFG.maxEnemies){spawnEnemy();G.spawn=Math.max(CFG.minSpawnInterval,CFG.spawnRate-G.t/CFG.spawnRamp)}for(let e of G.en){e.hitT=Math.max(0,e.hitT-dt);e.flash=Math.max(0,(e.flash||0)-dt);e.squash=Math.max(0,(e.squash||0)-dt);if(e.kind==='shade'){
    const free=findFreePosition(e.x,e.y,e.r,b);e.x=free.x;e.y=free.y;
    const playerDistance = dist(e, p);
    const homeDistance = Math.hypot(e.x - e.homeX, e.y - e.homeY);
    const oasisDistance = Math.hypot(p.x - e.oasisX, p.y - e.oasisY);

    // Le gardien ne poursuit que si le joueur approche de son oasis
    // et reste dans le périmètre défendu.
    const canChase = oasisDistance <= e.returnRange &&
                     playerDistance <= e.aggroRange &&
                     homeDistance < e.leash;

    if(canChase){
        const d = playerDistance || 1;
        move(e, (p.x-e.x)/d*e.speed*(G.legendary?.slow?.75:1)*dt, (p.y-e.y)/d*e.speed*(G.legendary?.slow?.75:1)*dt, b);
        contact(e, e.dmg);
    } else {
        // Retour vers sa position de garde, sans poursuivre le joueur.
        if(homeDistance > 5){
            const d = homeDistance || 1;
            const speed = e.speed * (homeDistance > 35 ? 1.25 : 0.75);
            move(e, (e.homeX-e.x)/d*speed*dt, (e.homeY-e.y)/d*speed*dt, b);
        }
    }
    // Garde-fou : un gardien ne peut jamais sortir de son petit cercle de garde.
    const leashNow = Math.hypot(e.x-e.homeX,e.y-e.homeY);
    if(leashNow > 78){
        const k = 78 / leashNow;
        e.x = e.homeX + (e.x-e.homeX)*k;
        e.y = e.homeY + (e.y-e.homeY)*k;
    }
}else if(e.kind==='shooter'||e.kind==='spear'||e.kind==='bomber')rangedEnemy(e,dt);else{

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
            (p.x-e.x)/d*e.speed*(G.legendary?.slow?.75:1)
            + rx
        )*dt,
        (
            (p.y-e.y)/d*e.speed*(G.legendary?.slow?.75:1)
            + ry
        )*dt,
        b
    );
    contact(e,e.dmg);
}
}
separateEnemies(b);

for(let q of G.bosses.filter(x=>x.alive)){
    q.hitT=Math.max(0,q.hitT-dt);
    q.flash=Math.max(0,(q.flash||0)-dt);
    q.squash=Math.max(0,(q.squash||0)-dt);

    let dp=dist(q,p);
    q.active=q.hunting||dp<310;

    if(q.active){
        let d=dp||1;
        if(q.hunting){
            move(
                q,
                (p.x-q.x)/d*q.speed*(G.legendary?.slow?.75:1)*dt,
                (p.y-q.y)/d*q.speed*(G.legendary?.slow?.75:1)*dt,
                b
            );
        }
        contact(q,q.ruinId?16:18);
        bossAttack(q,dt);
    }
}for(let q of G.bul){let dx=q.vx*dt,dy=q.vy*dt;q.x+=dx;q.y+=dy;q.travel+=Math.hypot(dx,dy);if(b.some(o=>hit(q,o)))q.travel=9999;for(let e of[...G.en,...G.bosses.filter(z=>z.alive)])if(!q.seen.has(e)&&dist(q,e)<q.r+e.r){q.seen.add(e);e.hp-=q.damage;G.damageDone+=q.damage;e.hitT=3;impact(e,q.damage,q.fire?'#ff8a3d':'#ffe56a',q.critical);q.hits--;if(q.fire)e.burn=2;if(q.chainLeft>0){let next=[...G.en,...G.bosses.filter(z=>z.alive)].filter(z=>z!==e&&!q.seen.has(z)&&dist(z,e)<190).sort((a,b)=>dist(a,e)-dist(b,e))[0];if(next){q.seen.add(next);let cdmg=q.damage*.6;next.hp-=cdmg;G.damageDone+=cdmg;next.hitT=3;impact(next,cdmg,'#67d9ff');q.chainLeft--;if(next.hp<=0){let boss=G.bosses.includes(next);if(boss)next.alive=false;kill(next,boss)}}}if(e.hp<=0){
    if(G.bosses.includes(e)){
        e.alive=false;
        kill(e,true);
    }else{
        kill(e);
    }
}if(q.hits<=0)q.travel=9999}}for(let e of G.en){if(e.burn>0){e.burn-=dt;e.burnTick=(e.burnTick||0)+dt;if(e.burnTick>=1){e.burnTick=0;e.hp-=1;if(e.hp<=0)kill(e)}}}G.en=G.en.filter(e=>e.hp>0&&(e.kind==='shade'||dist(e,p)<1500));G.bul=G.bul.filter(q=>q.travel<s.range);for(let q of G.enemyBul){q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;if(b.some(o=>hit(q,o)))q.life=0;if(dist(q,p)<q.r+p.r&&G.inv<=0){p.hp-=Math.max(1,Math.round(q.dmg*(1-s.armor)));G.inv=.7;q.life=0;if(p.hp<=0)return end()}}G.enemyBul=G.enemyBul.filter(q=>q.life>0);for(let q of G.bombs){q.t-=dt;if(q.t<=0&&!q.boom){q.boom=.22;let d=dist(q,p);if(d<q.r&&G.inv<=0){p.hp-=Math.round((d<q.r*.45?25:12)*(1-s.armor));G.inv=.7;if(p.hp<=0)return end()}for(let e of G.en)if(dist(q,e)<q.r)e.hp-=1}if(q.boom)q.boom-=dt}G.bombs=G.bombs.filter(q=>q.t>0||q.boom>0);for(let q of G.slashes)q.life-=dt;G.slashes=G.slashes.filter(q=>q.life>0);for(let d of G.drops){d.age=(d.age||0)+dt;d.bounce=Math.max(0,(d.bounce||0)-dt)}// Déplacement des soins dans les oasis
for(let d of G.drops){
    if(!d.orbit) continue;

    let a = d.age * d.orbit.speed + d.orbit.phase;

    d.x = d.orbit.x + Math.cos(a) * d.orbit.rx;
    d.y = d.orbit.y + Math.sin(a) * d.orbit.ry;
}for(let d of G.drops)if((d.type==='coin'||G.legendary?.magnetSupreme)&&dist(d,p)<s.magnet){let m=dist(d,p)||1;d.x+=(p.x-d.x)/m*270*dt;d.y+=(p.y-d.y)/m*270*dt}G.drops=G.drops.filter(d=>{if(dist(d,p)<p.r+d.r+5){if(d.type==='coin'){G.coinsRun+=d.v;floatText(p.x,p.y-25,'+'+d.v,'#ffd84c');particle(p.x,p.y,'#ffd84c',3,45)}else if(d.type==='heal'){p.hp=Math.min(p.maxHp,p.hp+d.v);floatText(p.x,p.y-28,'+'+d.v+' PV','#5cff8d',14);particle(p.x,p.y,'#5cff8d',8,75)}else{G.carrying=true;G.coreExists=false;notify('Noyau rare récupéré','rare');floatText(p.x,p.y-35,'NOYAU RARE','#d562ff',16);G.waves.push({x:p.x,y:p.y,r:20,life:.8,max:.8,color:'#d562ff'})}return false}return dist(d,p)<1900});if(G.carrying&&Math.hypot(p.x,p.y)<48){G.carrying=false;G.coresRun++;localStorage.cores=+(localStorage.cores||0)+1}if(G.pending>0&&!G.paused){
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
function hpbar(e){if(e.hitT<=0&&e.shape!==3)return;X.fillStyle='#351018';X.fillRect(e.x-18,e.y-e.r-10,36,5);X.fillStyle='#ef4f5c';X.fillRect(e.x-18,e.y-e.r-10,36*Math.max(0,e.hp/e.maxHp),5)}
function enemyShape(e){X.save();X.translate(e.x,e.y);let sq=e.squash>0?1.22:1;X.scale(sq,2-sq);if((e.kind==='shooter'||e.kind==='spear')&&e.atk<.55){X.strokeStyle=e.kind==='spear'?'#ffab47':'#79bfff';X.globalAlpha=.35+.5*(.55-e.atk)/.55;X.beginPath();X.moveTo(0,0);let a=Math.atan2(G.p.y-e.y,G.p.x-e.x);X.lineTo(Math.cos(a)*240,Math.sin(a)*240);X.stroke();X.globalAlpha=1}X.fillStyle=e.flash>0?'#ffffff':e.burn>0?'#ff9d3d':e.color;X.beginPath();if(e.shape===1)X.rect(-e.r,-e.r,e.r*2,e.r*2);else if(e.shape===2){X.moveTo(0,-e.r);X.lineTo(e.r,e.r);X.lineTo(-e.r,e.r);X.closePath()}else if(e.shape===3){for(let i=0;i<6;i++){let a=i*Math.PI/3;X[i?'lineTo':'moveTo'](Math.cos(a)*e.r,Math.sin(a)*e.r)}X.closePath()}else X.arc(0,0,e.r,0,7);X.fill();if(e.kind==='shade'){
    // Aura sombre
    X.shadowColor='#a00035';
    X.shadowBlur=17;

    X.strokeStyle='#53102b';
    X.lineWidth=3;
    X.beginPath();
    X.arc(0,0,e.r+4,0,Math.PI*2);
    X.stroke();
    // Yeux rouges
    X.shadowColor='#ff174f';
    X.shadowBlur=10;
    X.fillStyle='#ff174f';
    X.beginPath();
    X.arc(-6,-3,3,0,Math.PI*2);
    X.arc(6,-3,3,0,Math.PI*2);
    X.fill();
    X.shadowBlur=0;
}X.restore();hpbar(e)}
function drawRuins(p){
    for(const r of RUINS){
        if(r.x<p.x-W/2-260||r.x>p.x+W/2+260||r.y<p.y-H/2-260||r.y>p.y+H/2+260)continue;
        const discovered=!!G.ruins[r.id];
        X.save();X.translate(r.x,r.y);
        X.fillStyle='#0008';X.beginPath();X.ellipse(0,28,190,135,0,0,Math.PI*2);X.fill();
        X.strokeStyle=r.stone;X.lineWidth=18;X.beginPath();X.ellipse(0,0,155,112,-.12,0,Math.PI*2);X.stroke();
        X.strokeStyle='#ffffff22';X.lineWidth=3;X.beginPath();X.ellipse(0,-5,143,100,-.12,0,Math.PI*2);X.stroke();
        const cols=[[-125,-58],[-125,58],[125,-58],[125,58]];
        for(let i=0;i<cols.length;i++){
            const [cx,cy]=cols[i];
            X.fillStyle=r.stone;X.fillRect(cx-13,cy-38,26,78);
            X.fillStyle='#ffffff25';X.fillRect(cx-13,cy-38,6,78);
            X.fillStyle=r.stone;X.fillRect(cx-19,cy-43,38,10);
            X.fillRect(cx-17,cy+35,34,9);
        }
        X.fillStyle=r.color;X.globalAlpha=.16;X.beginPath();X.arc(0,0,72,0,Math.PI*2);X.fill();X.globalAlpha=1;
        X.strokeStyle=r.color;X.lineWidth=5;X.beginPath();X.arc(0,0,54,0,Math.PI*2);X.stroke();
        X.fillStyle=r.color;X.font='bold 42px system-ui';X.textAlign='center';X.textBaseline='middle';X.fillText(r.symbol,0,0);
        X.fillStyle='#fff';X.font='bold 17px system-ui';X.fillText(r.name,0,165);
        X.fillStyle=discovered?'#ffcf68':'#d9e7f5';X.font='12px system-ui';X.fillText(discovered?'BOSS ÉVEILLÉ':'RUINES ANCIENNES',0,186);
        X.restore();
    }
}
function drawRuinBoss(b){
    X.save();X.translate(b.x,b.y);X.rotate((b.rotation||0)*.12);
    X.shadowColor=b.color;X.shadowBlur=18;
    X.fillStyle=b.flash>0?'#fff':b.color;
    X.strokeStyle='#241d2a';X.lineWidth=5;
    X.beginPath();
    if(b.ruinId==='ice'||b.ruinId==='crystal'){
        for(let i=0;i<6;i++){let a=-Math.PI/2+i*Math.PI/3;X[i?'lineTo':'moveTo'](Math.cos(a)*b.r,Math.sin(a)*b.r)}
    }else if(b.ruinId==='desert'){
        for(let i=0;i<12;i++){let a=i*Math.PI/6,rr=i%2?b.r*.82:b.r;X[i?'lineTo':'moveTo'](Math.cos(a)*rr,Math.sin(a)*rr)}
    }else if(b.ruinId==='corrupt'){
        X.moveTo(0,-b.r);X.lineTo(b.r*.82,-b.r*.35);X.lineTo(b.r*.7,b.r*.8);X.lineTo(0,b.r*.55);X.lineTo(-b.r*.7,b.r*.8);X.lineTo(-b.r*.82,-b.r*.35);
    }else{
        X.arc(0,0,b.r,0,Math.PI*2);
    }
    X.closePath();X.fill();X.stroke();X.shadowBlur=0;
    if(b.ruinId==='forest'){
        X.strokeStyle='#244b25';X.lineWidth=7;for(let i=0;i<4;i++){let a=i*Math.PI/2;X.beginPath();X.moveTo(Math.cos(a)*18,Math.sin(a)*18);X.lineTo(Math.cos(a)*b.r*1.35,Math.sin(a)*b.r*1.35);X.stroke()}
        X.fillStyle='#f3ff9b';X.beginPath();X.arc(0,0,8,0,Math.PI*2);X.fill();
    }else if(b.ruinId==='volcano'){
        X.fillStyle='#ffdf78';X.beginPath();X.arc(0,0,11,0,Math.PI*2);X.fill();
        X.fillStyle='#49252a';X.beginPath();X.moveTo(-17,-b.r+4);X.lineTo(-8,-b.r-15);X.lineTo(0,-b.r+4);X.lineTo(9,-b.r-15);X.lineTo(18,-b.r+4);X.fill();
    }else if(b.ruinId==='ice'){
        X.fillStyle='#e8fbff';X.beginPath();X.moveTo(0,-b.r*.72);X.lineTo(8,0);X.lineTo(0,b.r*.72);X.lineTo(-8,0);X.closePath();X.fill();
    }else if(b.ruinId==='swamp'){
        X.fillStyle='#eaff8b';X.beginPath();X.ellipse(0,0,17,12,0,0,Math.PI*2);X.fill();X.fillStyle='#182414';X.beginPath();X.arc(0,0,6,0,Math.PI*2);X.fill();
    }else if(b.ruinId==='desert'){
        X.strokeStyle='#704a24';X.lineWidth=5;for(let i=0;i<8;i++){let a=i*Math.PI/4;X.beginPath();X.moveTo(Math.cos(a)*12,Math.sin(a)*12);X.lineTo(Math.cos(a)*b.r*1.2,Math.sin(a)*b.r*1.2);X.stroke()}
        X.fillStyle='#ffedb0';X.beginPath();X.arc(0,0,9,0,Math.PI*2);X.fill();
    }else if(b.ruinId==='corrupt'){
        X.fillStyle='#250e32';X.beginPath();X.arc(-9,-5,5,0,Math.PI*2);X.arc(9,-5,5,0,Math.PI*2);X.fill();X.fillStyle='#fff';X.fillRect(-8,11,16,4);
    }else{
        X.fillStyle='#eaffff';X.beginPath();X.moveTo(0,-18);X.lineTo(8,0);X.lineTo(0,18);X.lineTo(-8,0);X.closePath();X.fill();
        X.strokeStyle='#d8faff';X.lineWidth=3;X.beginPath();X.moveTo(-b.r,0);X.lineTo(b.r,0);X.moveTo(0,-b.r);X.lineTo(0,b.r);X.stroke();
    }
    X.restore();
}
function draw(){X.clearRect(0,0,W,H);let p=G.p,sx=SETTINGS.shake&&G.shake?rnd(-G.shake,G.shake):0,sy=SETTINGS.shake&&G.shake?rnd(-G.shake,G.shake):0,ox=W/2-p.x+sx,oy=H/2-p.y+sy;X.save();X.translate(ox,oy);// Limites du monde
// Fond selon le biome
drawBiomeGround(p);

// Bordure rouge du monde
X.save();
X.strokeStyle = '#ff3030';
X.lineWidth = 12;
X.shadowColor = '#ff2020';
X.shadowBlur = 18;
X.strokeRect(-MAP_HALF, -MAP_HALF, MAP_SIZE, MAP_SIZE);
X.restore();// Lave et décors du biome
drawLava(p);
drawWater(p);
drawDecorations(p);
drawRuins(p);
X.strokeStyle='#48e7ff';
                X.lineWidth=4;X.beginPath();X.arc(0,0,38,0,7);X.stroke();
for (let o of blocks()) {
    let biome = getBiome(o.x + o.w / 2, o.y + o.h / 2);
    let colors = BLOCK_COLORS[biome] || BLOCK_COLORS.default;
    X.fillStyle = o.w < 35 ? colors[0] : colors[1];
    X.fillRect(o.x, o.y, o.w, o.h);
    // Petit relief
    X.fillStyle = colors[0];
    X.fillRect(o.x, o.y, o.w, 5);
}for(let d of G.drops){let by=d.bounce?Math.sin((.32-d.bounce)/.32*Math.PI)*10:0;X.save();X.translate(d.x,d.y-by);if(d.type==='core'){X.shadowColor='#d562ff';X.shadowBlur=14+Math.sin(d.age*6)*5;X.rotate(d.age)}else if(d.type==='coin'){X.scale(.35+.65*Math.abs(Math.sin(d.age*7)),1)}X.fillStyle=d.type==='coin'?'#ffd84c':d.type==='heal'?'#46d978':'#c85cff';X.beginPath();if(d.type==='heal'){X.fillRect(-3,-10,6,20);X.fillRect(-10,-3,20,6)}else if(d.type==='core'){X.moveTo(0,-d.r);X.lineTo(d.r,0);X.lineTo(0,d.r);X.lineTo(-d.r,0);X.closePath()}else X.arc(0,0,d.r,0,7);X.fill();X.restore()}for(let q of G.bul){X.fillStyle=q.fire?'#ff7b32':'#ffe363';X.beginPath();X.arc(q.x,q.y,q.r,0,7);X.fill()}for(let q of G.enemyBul){X.fillStyle=q.color;X.beginPath();X.arc(q.x,q.y,q.r,0,7);X.fill()}for(let q of G.bombs){let pulse=q.boom?1:Math.max(.18,1-q.t);X.strokeStyle=q.boom?'#ffd05b':'#ff4545';X.lineWidth=q.boom?6:3;X.beginPath();X.arc(q.x,q.y,q.r*pulse,0,7);X.stroke();if(q.boom){X.fillStyle='#ff7a3066';X.beginPath();X.arc(q.x,q.y,q.r,0,7);X.fill()}}for(let q of G.slashes){let progress=1-q.life/q.max,extend=progress<.35?progress/.35:progress<.65?1:Math.max(0,1-(progress-.65)/.35),len=(q.range+18)*extend;X.save();X.strokeStyle='#e8fbff';X.shadowColor='#66d9ff';X.shadowBlur=10;X.lineCap='round';X.lineWidth=9;X.beginPath();X.moveTo(p.x+Math.cos(q.a)*18,p.y+Math.sin(q.a)*18);X.lineTo(p.x+Math.cos(q.a)*len,p.y+Math.sin(q.a)*len);X.stroke();X.lineWidth=2;X.beginPath();X.arc(q.target.x,q.target.y,q.target.r+7,0,7);X.stroke();X.restore()}for(let e of G.en)enemyShape(e);for(let b of G.bosses.filter(x=>x.alive)){if(b.ruinId)drawRuinBoss(b);else{X.fillStyle=b.color;X.beginPath();X.arc(b.x,b.y,b.r,0,7);X.fill()}hpbar(b)}X.globalAlpha=G.inv>0&&Math.floor(G.inv*12)%2?.25:1;X.fillStyle='#36a3ff';X.beginPath();X.arc(p.x,p.y,p.r,0,7);X.fill();X.globalAlpha=1;if(G.carrying){X.shadowColor='#d562ff';X.shadowBlur=14;X.fillStyle='#d562ff';X.beginPath();X.arc(p.x,p.y-25,7,0,7);X.fill();X.shadowBlur=0}for(let z of G.waves){X.globalAlpha=z.life/z.max;X.strokeStyle=z.color;X.lineWidth=3;X.beginPath();X.arc(z.x,z.y,z.r,0,7);X.stroke()}for(let z of G.particles){X.globalAlpha=z.life/z.max;X.fillStyle=z.color;X.beginPath();X.arc(z.x,z.y,z.r,0,7);X.fill()}X.textAlign='center';for(let z of G.texts){X.globalAlpha=z.life/z.max;X.fillStyle=z.color;X.font='bold '+z.size+'px system-ui';X.fillText(z.text,z.x,z.y)}X.globalAlpha=1;X.restore();edgeArrow(0,0,'#44bfff',Math.round(Math.hypot(p.x,p.y))+'m');for(let b of G.bosses.filter(x=>x.alive))edgeArrow(b.x,b.y,b.color,Math.round(dist(p,b))+'m');
const nextRuin=RUINS.filter(r=>!G.ruins[r.id]).sort((a,b)=>dist(p,a)-dist(p,b))[0];
if(nextRuin)edgeArrow(nextRuin.x,nextRuin.y,nextRuin.color,'RUINES');if(G.levelFlash>0){X.fillStyle='rgba(80,180,255,'+(G.levelFlash*.18)+')';X.fillRect(0,0,W,H)}}
function loop(n){if(!G?.running||G.paused)return;let dt=Math.min((n-G.last)/1000,.04);G.last=n;update(dt);if(G.running&&!G.paused){draw();raf=requestAnimationFrame(loop)}}function end(){G.running=false;let oldKills=+(localStorage.bestKills||0),oldTime=+(localStorage.bestTime||0),oldLevel=+(localStorage.bestLevel||0),newRecords=[];if(G.kills>oldKills)newRecords.push('ÉLIMINATIONS');if(Math.floor(G.t)>oldTime)newRecords.push('TEMPS');if(G.level>oldLevel)newRecords.push('NIVEAU');if(!G.finalized){localStorage.coins=+(localStorage.coins||0)+G.coinsRun;localStorage.bestKills=Math.max(oldKills,G.kills);localStorage.bestTime=Math.max(oldTime,Math.floor(G.t));localStorage.bestLevel=Math.max(oldLevel,G.level);localStorage.totalGames=+(localStorage.totalGames||0)+1;localStorage.totalKills=+(localStorage.totalKills||0)+G.kills;localStorage.totalTime=+(localStorage.totalTime||0)+Math.floor(G.t);localStorage.totalBoss=+(localStorage.totalBoss||0)+G.bossKills;G.finalized=true;}$('#resultBanner').textContent=newRecords.length?'NOUVEAU RECORD : '+newRecords.join(' · '):'PARTIE TERMINÉE';$('#resultBanner').className=newRecords.length?'newRecord':'';$('#summary').innerHTML=`<div class="resultGrid"><span>⏱ Temps<b>${Math.floor(G.t/60)}:${String(Math.floor(G.t%60)).padStart(2,'0')}</b></span><span>✦ Niveau<b>${G.level}</b></span><span>☠ Éliminations<b>${G.kills}</b></span><span>👑 Boss<b>${G.bossKills}</b></span><span>⚔ Dégâts infligés<b>${Math.round(G.damageDone)}</b></span><span>♥ Dégâts reçus<b>${G.damageTaken}</b></span><span>🪙 Pièces<b>${G.coinsRun}</b></span><span>◆ Noyaux<b>${G.coresRun}</b></span></div>`;records();$('#devContinue').hidden=false;show('over')}
function continueDeveloper(){if(!G)return;G.p.hp=G.p.maxHp;G.inv=2;G.running=true;G.paused=false;G.last=performance.now();show('game');updateHUD();draw();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);notify('MODE DÉVELOPPEUR : PARTIE REPRISE','rare')}
$('#devContinue').onclick=continueDeveloper;
function records(){$('#records').innerHTML=`Record : <b>${localStorage.bestKills||0}</b> éliminations<br>Temps : <b>${localStorage.bestTime||0}s</b><br>Réserve : 🪙 <b>${localStorage.coins||0}</b> &nbsp; ◆ <b>${localStorage.cores||0}</b>`}records();
C.addEventListener('pointerdown',e=>{if(!G?.running||G.paused||G.joy)return;G.joy={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0,mag:0};let j=$('#joy');j.style.display='block';j.style.left=e.clientX+'px';j.style.top=e.clientY+'px';C.setPointerCapture(e.pointerId)});C.addEventListener('pointermove',e=>{if(!G?.joy||e.pointerId!==G.joy.id)return;let j=G.joy;j.dx=e.clientX-j.x;j.dy=e.clientY-j.y;j.mag=Math.hypot(j.dx,j.dy);let m=Math.min(33,j.mag),a=Math.atan2(j.dy,j.dx);$('#joy i').style.transform=`translate(${Math.cos(a)*m}px,${Math.sin(a)*m}px)`});function joyEnd(){if(G)G.joy=null;$('#joy').style.display='none';$('#joy i').style.transform=''}C.addEventListener('pointerup',joyEnd);C.addEventListener('pointercancel',joyEnd);function pause(){if(!G?.running||G.paused||G.merchantOpen)return;G.paused=true;$('#pauseStats').innerHTML=`Niveau <b>${G.level}</b> · ${Math.floor(G.t/60)}:${String(Math.floor(G.t%60)).padStart(2,'0')}<br>☠ ${G.kills} · 🪙 ${G.coinsRun} · ◆ ${G.coresRun}`;let build=[...SWORD_UP,...GUN_UP].filter(u=>G.up[u[0]]>0).map(u=>`<span>${ICONS[u[0]]||'✦'} ${u[1]} <b>${G.up[u[0]]}/3</b></span>`);let legendaryBuild=LEGENDARY_UP.filter(u=>G.legendary?.[u.id]).map(u=>`<span>◆ ${u.name}</span>`);let gear=[];if(G.gun)gear.push('<span>🔫 Pistolet débloqué</span>');if(G.smg)gear.push('<span>🔫 Mitraillette débloquée</span>');if(G.weapon==='smg')gear.push('<span>⚡ Arme équipée : mitraillette</span>');else if(G.gun)gear.push('<span>⚡ Arme équipée : pistolet</span>');if(G.up.sDamage>0)gear.push(`<span>⚔ Affûtage ${G.up.sDamage}/3</span>`);if(G.purchases?.length)G.purchases.forEach((name,i)=>gear.push(`<span>🛒 ${name}</span>`));if(G.coresRun>0)gear.push(`<span>◆ ${G.coresRun} diamant(s) récupéré(s)</span>`);$('#pauseBuild').innerHTML=(build.length?'<strong class="pauseSection">AMÉLIORATIONS</strong>'+build.join(''):'<small>Aucune amélioration obtenue</small>')+(legendaryBuild.length?'<strong class="pauseSection">ATOUTS LÉGENDAIRES</strong>'+legendaryBuild.join(''):'')+(gear.length?'<strong class="pauseSection">ÉQUIPEMENT & ACHATS</strong>'+gear.join(''):'');joyEnd();cancelAnimationFrame(raf);$('#pause').classList.add('show')}document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});$('#merchantBtn').onclick=openMerchant;$('#pauseBtn').onclick=pause;$('#closeShop').onclick=closeMerchant;$('#resume').onclick=()=>{G.paused=false;G.last=performance.now();$('#pause').classList.remove('show');raf=requestAnimationFrame(loop)};$('#play').onclick=start;$('#again').onclick=start;$('#menu').onclick=()=>{records();show('home')};$('#quit').onclick=()=>{if(G){G.running=false;cancelAnimationFrame(raf)}records();show('home')};$('#settingsBtn').onclick=()=>openSettings(false);$('#pauseSettings').onclick=()=>openSettings(true);document.body.appendChild($('#settings'));function openSettings(fromPause){$('#settings').dataset.fromPause=fromPause?'1':'0';$('#effects').value=SETTINGS.effects;$('#vibration').checked=SETTINGS.vibration;$('#shakeSetting').checked=SETTINGS.shake;$('#damageText').checked=SETTINGS.damageText;$('#joyOpacity').value=SETTINGS.joyOpacity;$('#buttonSize').value=SETTINGS.buttonSize;$('#eco').checked=SETTINGS.eco;$('#settings').classList.add('show')}$('#closeSettings').onclick=()=>{SETTINGS.effects=$('#effects').value;SETTINGS.vibration=$('#vibration').checked;SETTINGS.shake=$('#shakeSetting').checked;SETTINGS.damageText=$('#damageText').checked;SETTINGS.joyOpacity=+$('#joyOpacity').value;SETTINGS.buttonSize=$('#buttonSize').value;SETTINGS.eco=$('#eco').checked;saveSettings();$('#settings').classList.remove('show');if($('#settings').dataset.fromPause==='1'&&G?.running)$('#pause').classList.add('show')};$('#abandon').onclick=()=>{if(confirm('Abandonner la partie en cours ?')){G.running=false;cancelAnimationFrame(raf);$('#pause').classList.remove('show');records();show('home')}};if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'));
