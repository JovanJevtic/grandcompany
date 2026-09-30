import * as THREE from '../vendor/three.module.min.js';
import {RoomEnvironment} from '../vendor/RoomEnvironment.js';

// JEDAN objekat koji se stvarno deformiše (bez smene slika) — kao modelovanje u plastelinu.
//
// Geometrija je OBRTNA POVRŠINA (lathe): profil ide od donjeg centra, gore po SPOLJNOM zidu,
// preko OBODA, pa niz UNUTRAŠNJI zid do dna činije. Tako nastaje prava činija (radijalni
// model to ne može — uvek bi ostao "poklopac" preko otvora).
//
// Deformacija je glatka interpolacija između profila LOPTE i profila ČINIJE, plus:
//   rough/grain — hrapavost i zrnastost (sirovi kamen / prah)
//   facet       — kristalne ravni (konveksni poliedar) -> OŠTRINA
//   tilt        — nagib/talas oboda (1. i 2. harmonik)
// Redosled: kamen sa ravnima -> kristal -> prah -> glina (plastelin) -> lopta -> činija
// -> talasasta činija -> umivaonik sa slavinom. Znači OŠTRO pa MEKO.

const clampn=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
const ss=(e0,e1,x)=>{const t=clampn((x-e0)/(e1-e0));return t*t*(3-2*t);};
const lerp=(a,b,t)=>a+(b-a)*t;

// ——— Perlin 3D (2 oktave; bez alokacija u vrućoj petlji) ———
const PERM=new Uint8Array(512);
(function(){
  let s=20260930;const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
  const p=new Uint8Array(256);for(let i=0;i<256;i++)p[i]=i;
  for(let i=255;i>0;i--){const j=(rnd()*(i+1))|0;const t=p[i];p[i]=p[j];p[j]=t;}
  for(let i=0;i<512;i++)PERM[i]=p[i&255];
})();
const fade=t=>t*t*(3-2*t);
function gdot(h,gx,gy,gz){
  const hh=h&15;
  const u=hh<8?gx:gy;
  const v=hh<4?gy:(hh===12||hh===14?gx:gz);
  return ((hh&1)?-u:u)+((hh&2)?-v:v);
}
function permNoise(x,y,z){
  const X=Math.floor(x)&255,Y=Math.floor(y)&255,Z=Math.floor(z)&255;
  const fx=x-Math.floor(x),fy=y-Math.floor(y),fz=z-Math.floor(z);
  const u=fade(fx),v=fade(fy),w=fade(fz);
  const A=PERM[X]+Y,AA=PERM[A]+Z,AB=PERM[A+1]+Z,B=PERM[X+1]+Y,BA=PERM[B]+Z,BB=PERM[B+1]+Z;
  return lerp(lerp(lerp(gdot(PERM[AA],fx,fy,fz),gdot(PERM[BA],fx-1,fy,fz),u),
                   lerp(gdot(PERM[AB],fx,fy-1,fz),gdot(PERM[BB],fx-1,fy-1,fz),u),v),
              lerp(lerp(gdot(PERM[AA+1],fx,fy,fz-1),gdot(PERM[BA+1],fx-1,fy,fz-1),u),
                   lerp(gdot(PERM[AB+1],fx,fy-1,fz-1),gdot(PERM[BB+1],fx-1,fy-1,fz-1),u),v),w);
}
function fbmRough(x,y,z){
  return permNoise(x,y,z)+0.5*permNoise(x*2.03+5.2,y*2.03-1.3,z*2.03+2.7);
}

// ——— Kristalne ravni: konveksni poliedar (svaka ravan je jedan faset) ———
const PLANES=(function(){
  const out=[];let s=777;const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
  const n=22,ga=Math.PI*(3-Math.sqrt(5));
  for(let i=0;i<n;i++){
    const y=1-(i/(n-1))*2,rad=Math.sqrt(Math.max(0,1-y*y)),th=ga*i;
    out.push([Math.cos(th)*rad,y,Math.sin(th)*rad,0.84+rnd()*0.24]);
  }
  return out;
})();

// ——— Profil činije ———
// Obod na 110° od donje ose; unutrašnja sfera R=0.961 sa centrom na y=0.541 daje dno na
// y=-0.42 i prolazi tačno kroz obod — zid je debeo pri dnu, tanak pri ivici.
const THR=Math.PI*110/180, KIN=0.961, YIN=0.541, PSIR=1.361;

// Vraća (rho, y) u meridijanskoj ravni. v=0 donji centar, v=0.5 obod, v=1 dno (unutra).
const RIM_A=0.022;   // polu-širina zaobljenja oboda
const _pa=[0,0],_pb=[0,0];
function profileBase(v,bowl,out){
  const sRho=Math.sin(Math.PI*v), sY=-Math.cos(Math.PI*v);      // lopta
  let bRho,bY;
  if(v<=0.5){
    const th=THR*(v/0.5);
    bRho=Math.sin(th); bY=-Math.cos(th);                        // spoljni zid
  }else{
    const psi=PSIR*((1-v)/0.5);
    bRho=KIN*Math.sin(psi); bY=YIN-KIN*Math.cos(psi);           // unutrašnji zid
  }
  out[0]=sRho+(bRho-sRho)*bowl;
  out[1]=sY+(bY-sY)*bowl;
}
function profileAt(v,bowl,out){
  // Obod nije nož-ivica: prelaz spolja->unutra je kratak zaobljen pojas (kao porcelan).
  if(v>0.5-RIM_A&&v<0.5+RIM_A){
    profileBase(0.5-RIM_A,bowl,_pa);
    profileBase(0.5+RIM_A,bowl,_pb);
    const s=(v-(0.5-RIM_A))/(2*RIM_A);
    const t=s*s*(3-2*s);
    out[0]=_pa[0]+(_pb[0]-_pa[0])*t;
    out[1]=_pa[1]+(_pb[1]-_pa[1])*t;
    return;
  }
  profileBase(v,bowl,out);
}

// Hrapavost / zrno / kristal — pomak po radijusu (koristi se samo dok je lopta).
function radialOffset(x,y,z,p){
  let d=p.rough*0.42*fbmRough(x*1.55+3.1,y*1.55-2.2,z*1.55+5.7);
  d+=p.grain*0.07*permNoise(x*7.5+11.3,y*7.5+1.7,z*7.5-4.9);
  return d;
}
function facetRadius(x,y,z,p){
  let rp=1e9;
  for(let i=0;i<PLANES.length;i++){
    const pl=PLANES[i],dd=x*pl[0]+y*pl[1]+z*pl[2];
    if(dd>0.02){const v=pl[3]/dd;if(v<rp)rp=v;}
  }
  if(rp>1.35)rp=1.35;else if(rp<0.5)rp=0.5;
  return rp;
}

// ——— Vremenska linija: OŠTRO -> MEKO ———
// tiltPh1 = azimut najvišeg dijela oboda (nazad), tiltPh2 = azimut talasa (lijevo/desno).
const PH1=-1.78, PH2=-0.21;
const KEYS=[
  {at:0.00,rough:0.78,grain:0.26,facet:0.50,bowl:0.00,tiltA1:0,tiltA2:0,tiltPh1:PH1,tiltPh2:PH2,squash:1.00},
  {at:0.14,rough:0.55,grain:0.16,facet:0.74,bowl:0.00,tiltA1:0,tiltA2:0,tiltPh1:PH1,tiltPh2:PH2,squash:1.00},
  {at:0.28,rough:0.24,grain:0.05,facet:0.96,bowl:0.00,tiltA1:0,tiltA2:0,tiltPh1:PH1,tiltPh2:PH2,squash:1.00},
  {at:0.42,rough:0.40,grain:0.80,facet:0.30,bowl:0.00,tiltA1:0,tiltA2:0,tiltPh1:PH1,tiltPh2:PH2,squash:1.00},
  {at:0.56,rough:0.26,grain:0.05,facet:0.04,bowl:0.00,tiltA1:0,tiltA2:0,tiltPh1:PH1,tiltPh2:PH2,squash:1.00},
  {at:0.68,rough:0.10,grain:0.04,facet:0.00,bowl:0.00,tiltA1:0,tiltA2:0,tiltPh1:PH1,tiltPh2:PH2,squash:1.00},
  // Zadnje tri forme (kao na referencama): činija -> talasasta činija -> umivaonik.
  {at:0.80,rough:0.04,grain:0.03,facet:0.00,bowl:0.55,tiltA1:0.18,tiltA2:0.04,tiltPh1:PH1,tiltPh2:PH2,squash:0.95},
  {at:0.90,rough:0.03,grain:0.03,facet:0.00,bowl:0.85,tiltA1:0.10,tiltA2:0.26,tiltPh1:PH1,tiltPh2:PH2,squash:0.92},
  {at:1.00,rough:0.03,grain:0.03,facet:0.00,bowl:1.00,tiltA1:0.22,tiltA2:0.08,tiltPh1:PH1,tiltPh2:PH2,squash:0.90},
];
const FIELDS=['rough','grain','facet','bowl','tiltA1','tiltA2','tiltPh1','tiltPh2','squash'];
export const morphParams=(progress,out={})=>{
  const p=clampn(progress);let i=KEYS.length-2;
  for(let j=0;j<KEYS.length-1;j++)if(p<KEYS[j+1].at){i=j;break;}
  const a=KEYS[i],b=KEYS[i+1],t=ss(a.at,b.at,p);
  for(const f of FIELDS)out[f]=lerp(a[f],b[f],t);
  return out;
};

// ——— Scena ———
const SEG_DESKTOP=[160,110],SEG_MOBILE=[88,62];

export function createKaolinObject(canvas){
  const scene=new THREE.Scene();
  // Kamera gleda odozgo (~32°) i malo sa strane, kao na referencama; objekat je ~25% visine.
  const camera=new THREE.PerspectiveCamera(30,1,.1,90);
  camera.position.set(2.7,9.0,12.6);
  camera.lookAt(0,0.95,0);

  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=.98;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.VSMShadowMap;

  const pmrem=new THREE.PMREMGenerator(renderer);
  const studio=new RoomEnvironment();
  scene.environment=pmrem.fromScene(studio,.04).texture;
  scene.environmentIntensity=.32;
  studio.dispose();pmrem.dispose();

  scene.add(new THREE.HemisphereLight('#ffffff','#dfe3ea',.16));
  const key=new THREE.DirectionalLight('#fff8ee',1.4);
  key.position.set(2.6,4.6,2.8);key.castShadow=true;
  key.shadow.mapSize.set(2048,2048);key.shadow.radius=1.6;key.shadow.blurSamples=16;
  key.shadow.bias=-.0002;key.shadow.normalBias=0;
  Object.assign(key.shadow.camera,{left:-1.5,right:1.5,top:1.9,bottom:-1.1,near:.5,far:16});
  scene.add(key);
  const rimLight=new THREE.DirectionalLight('#eef2f6',.32);rimLight.position.set(-2.6,2.2,-2.8);scene.add(rimLight);
  key.target.position.set(0,1,0);scene.add(key.target);

  // Pod je NEVIDLJIV — prima samo sjenku; pozadina ostaje naša bijela stranica.
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.ShadowMaterial({opacity:.24}));
  floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);

  const material=new THREE.MeshStandardMaterial({color:'#f2efe9',roughness:.7,metalness:.02,side:THREE.DoubleSide});
  const mesh=new THREE.Mesh(new THREE.BufferGeometry(),material);
  mesh.castShadow=true;mesh.receiveShadow=false;scene.add(mesh);

  // ——— Slavina (mesing) — pojavi se kad se činija sklopi ———
  const brass=new THREE.MeshStandardMaterial({color:'#b29570',roughness:.36,metalness:.72});
  const tap=new THREE.Group();
  {
    const cyl=(r,h,seg=28)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),brass);m.castShadow=true;return m;};
    const stand=cyl(.05,.05);stand.position.y=.025;
    const body=cyl(.032,.56);body.position.y=.32;
    const collar=cyl(.037,.028);collar.position.y=.60;
    const cap=cyl(.026,.02);cap.position.y=.617;
    const lever=cyl(.011,.2,16);lever.rotation.z=Math.PI/2;lever.position.set(.055,.638,0);
    const pts=[[0,.42,.03],[0,.44,.09],[0,.45,.15],[0,.43,.20],[0,.385,.225],[0,.345,.228]];
    const spout=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(q=>new THREE.Vector3(q[0],q[1],q[2]))),28,.026,12,false),brass);
    spout.castShadow=true;
    const nozzle=new THREE.Mesh(new THREE.CylinderGeometry(.029,.025,.04,20),brass);nozzle.position.set(0,.302,.272);
    tap.add(stand,body,collar,cap,lever,spout,nozzle);
  }
  mesh.add(tap);

  // ——— Slivnik na dnu činije ———
  const steel=new THREE.MeshStandardMaterial({color:'#c9c4b6',roughness:.3,metalness:.75});
  const drain=new THREE.Group();
  {
    const disc=new THREE.Mesh(new THREE.CylinderGeometry(.185,.185,.014,32),steel);disc.castShadow=true;
    const lip=new THREE.Mesh(new THREE.CylinderGeometry(.215,.215,.009,32),steel);lip.position.y=-.007;
    drain.add(lip,disc);
  }
  mesh.add(drain);

  let segW=0,segH=0,count=0,gridU=null,gridV=null;
  const params=morphParams(0,{});
  const pr=[0,0];

  function buildSegments(W,H){
    segW=W;segH=H;
    const nu=W+1,nv=H+1;count=nu*nv;
    gridU=new Float32Array(count);gridV=new Float32Array(count);
    const pos=new Float32Array(count*3),nor=new Float32Array(count*3);
    const idx=new Uint32Array(W*H*6);
    let t=0;
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){
      const k=j*nu+i;
      gridV[k]=j/H;
      gridU[k]=(i/W)*Math.PI*2;
      if(j<H&&i<W){
        const a=j*nu+i,b=j*nu+i+1,c=(j+1)*nu+i,d=(j+1)*nu+i+1;
        idx[t++]=a;idx[t++]=c;idx[t++]=b;
        idx[t++]=b;idx[t++]=c;idx[t++]=d;
      }
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    g.setAttribute('normal',new THREE.BufferAttribute(nor,3));
    g.setIndex(new THREE.BufferAttribute(idx,1));
    mesh.geometry.dispose();
    mesh.geometry=g;
    lastProgress=NaN;
    applyMorph(currentProgress);
  }

  let lastProgress=NaN,currentProgress=0;
  function applyMorph(progress){
    if(progress===lastProgress)return;
    lastProgress=progress;currentProgress=progress;
    morphParams(progress,params);
    const pos=mesh.geometry.attributes.position.array;
    const sy=params.squash;
    const hasDisp=params.rough>0.002||params.grain>0.002||params.facet>0.002;
    let minY=Infinity;
    let rimTopY=-Infinity,rimTopX=0,rimTopZ=0,rimTopRho=0;
    for(let k=0;k<count;k++){
      const v=gridV[k],u=gridU[k];
      profileAt(v,params.bowl,pr);
      let rho=pr[0],y=pr[1];
      if(hasDisp&&rho>1e-4){
        const cs=Math.cos(u),sn=Math.sin(u);
        const dx=cs,dz=sn,dy=y;
        const dl=Math.hypot(dx,dy,dz)||1;
        const nx=dx/dl,ny=dy/dl,nz=dz/dl;
        const len=Math.hypot(rho,y);
        let nl=len+radialOffset(nx,ny,nz,params);
        if(params.facet>0.002)nl=nl*(1-params.facet)+facetRadius(nx,ny,nz,params)*params.facet;
        const sc=nl/(len||1);
        rho*=sc;y*=sc;
      }
      let py=y*sy;
      // Nagib / talas oboda: pomak je pun na obodu (v=0.5), a NULA na oba pola — inače
      // se polovi raziđu u lepezu i nastane artefakt.
      if(params.tiltA1>0.001||params.tiltA2>0.001){
        const lift=params.tiltA1*Math.cos(u-params.tiltPh1)+params.tiltA2*Math.cos(2*(u-params.tiltPh2));
        py+=lift*Math.sin(Math.PI*v);
        if(Math.abs(v-0.5)<1e-6&&py>rimTopY){rimTopY=py;rimTopX=Math.cos(u)*rho;rimTopZ=Math.sin(u)*rho;rimTopRho=rho;}
      }
      const o=k*3;
      pos[o]=Math.cos(u)*rho;pos[o+1]=py;pos[o+2]=Math.sin(u)*rho;
      if(py<minY)minY=py;
    }
    mesh.position.y=-minY;
    mesh.geometry.attributes.position.needsUpdate=true;
    // Normale iz same mreže — tačno i za konkavnu unutrašnjost i za nagib.
    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeBoundingSphere();

    // Slavina stoji na najvišoj tački oboda; slivnik na dnu činije.
    const tapT=ss(.87,1,progress);
    tap.visible=tapT>.01;
    if(tap.visible){
      // Tačno na obod (uključujući njegovo zaobljenje) — nikad da lebdi.
      const u=params.tiltPh1;
      profileAt(0.5,params.bowl,pr);
      const tx=Math.cos(u)*pr[0],tz=Math.sin(u)*pr[0];
      const ty=pr[1]*sy+params.tiltA1-0.035;   // sjedne tačno na obod (malo ulegne)
      tap.position.set(tx,ty,tz);
      // Blagi zakret: da se savijeni izljev vidi iz profila, a ne tačno po osi
      // (tada bi se sveo na tanku "trunku").
      tap.rotation.y=Math.atan2(-tx,-tz)+0.55;
    }
    tap.scale.setScalar(Math.max(.001,tapT*1.3));
    const drainT=ss(.70,.84,progress);
    drain.visible=drainT>.01;
    drain.scale.setScalar(Math.max(.001,drainT));
    if(drain.visible){
      const floorY=(YIN-KIN)*params.bowl+(-1)*(1-params.bowl);
      drain.position.set(0,floorY*sy+0.012,0);
    }

    // Sirov materijal je grublji i topliji; porcelan je glatkiji i bjelji.
    const polished=ss(0.56,1,progress);
    material.roughness=lerp(0.9,0.42,polished);
    material.color.setRGB(lerp(0.86,0.965,polished),lerp(0.845,0.955,polished),lerp(0.815,0.945,polished));
    key.shadow.radius=lerp(1.4,7,clampn(progress));
  }

  let started=false,frame=0,spin=0,last=0;
  function loop(now){
    frame=0;
    if(!started)return;
    const dt=Math.min(.05,(now-last)/1000||1/60);last=now;
    spin+=dt*.2;
    mesh.rotation.y=0.22*Math.sin(spin*.6);
    renderer.render(scene,camera);
    frame=requestAnimationFrame(loop);
  }
  function start(){if(started)return;started=true;last=performance.now();if(!frame)frame=requestAnimationFrame(loop);}
  function stop(){started=false;if(frame){cancelAnimationFrame(frame);frame=0;}}

  function setSize(w,h,dpr){
    const mobile=w<768||(navigator.hardwareConcurrency||8)<=4;
    renderer.setPixelRatio(Math.min(2,dpr||1));
    renderer.setSize(w,h,false);
    camera.aspect=w/h;camera.updateProjectionMatrix();
    const want=mobile?SEG_MOBILE:SEG_DESKTOP;
    if(segW!==want[0]||segH!==want[1])buildSegments(want[0],want[1]);
  }

  const api={
    setSize,
    setProgress(p){applyMorph(clampn(p));},
    start,stop,
    render(){renderer.render(scene,camera);},
    dispose(){stop();mesh.geometry.dispose();material.dispose();floor.geometry.dispose();floor.material.dispose();renderer.dispose();},
    debug:{params,morphParams,profileAt},
  };
  setSize(1,1,1);
  applyMorph(0);
  return api;
}

// ——— Povezivanje sa stranicom ———
function bootKaolin(){
  const section=document.querySelector('[data-kaolin]');
  const canvas=document.querySelector('[data-kaolin-canvas]');
  const track=document.querySelector('[data-kaolin-track]');
  const knob=document.querySelector('[data-kaolin-knob]');
  const play=document.querySelector('[data-kaolin-play]');
  if(!section||!canvas||!track||!knob)return;
  window.__gcKaolin?.dispose?.();

  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const forced=new URLSearchParams(location.search).get('p');
  const world=createKaolinObject(canvas);
  const clamp01=n=>Math.min(1,Math.max(0,n));
  let progress=0,auto=false,autoP=0,dragging=false,frame=0,visible=false,pending=false;

  const setKnob=p=>section.style.setProperty('--p',p.toFixed(4));
  const apply=p=>{progress=p;world.setProgress(p);setKnob(p);section.dataset.kaolinP=p.toFixed(3);};

  function scrollProgress(){
    const r=section.getBoundingClientRect();
    const total=Math.max(1,section.offsetHeight-innerHeight);
    return clamp01(-r.top/total);
  }
  function resize(){
    const w=canvas.clientWidth||section.clientWidth;
    const h=canvas.clientHeight||innerHeight;
    if(w>0&&h>0)world.setSize(w,h,devicePixelRatio||1);
  }
  function schedule(){
    if(forced!==null||auto)return;
    if(pending)return;pending=true;
    requestAnimationFrame(()=>{pending=false;if(!auto)apply(scrollProgress());});
  }
  const onScroll=()=>{if(!dragging)schedule();};

  const scrollToY=y=>{
    const l=window.__gcLenis;
    if(l&&typeof l.scrollTo==='function')l.scrollTo(y,{immediate:true});
    else window.scrollTo(0,y);
  };
  const ratioFromEvent=e=>{
    const r=track.getBoundingClientRect();
    return clamp01((e.clientX-r.left)/Math.max(1,r.width));
  };
  function scrub(e){
    const ratio=ratioFromEvent(e);
    const total=Math.max(1,section.offsetHeight-innerHeight);
    const top=section.getBoundingClientRect().top+window.scrollY;
    setKnob(ratio);
    scrollToY(top+ratio*total);
  }
  const onDown=e=>{auto=false;setPlayState(false);dragging=true;track.setPointerCapture?.(e.pointerId);scrub(e);};
  const onMove=e=>{if(dragging){e.preventDefault();scrub(e);}};
  const onUp=e=>{
    if(!dragging)return;dragging=false;
    try{track.releasePointerCapture?.(e.pointerId);}catch{}
    schedule();
  };
  function setPlayState(on){play?.classList.toggle('is-on',on);play?.setAttribute('aria-pressed',on?'true':'false');}
  function toggleAuto(){
    auto=!auto;setPlayState(auto);
    if(auto){autoP=progress<0.02?0:progress;apply(autoP);}
    else apply(scrollProgress());
  }

  const io=new IntersectionObserver(([e])=>{
    visible=e.isIntersecting;
    if(visible)world.start();else world.stop();
  },{rootMargin:'20% 0px'});
  io.observe(section);
  const ro=new ResizeObserver(()=>{resize();schedule();});
  ro.observe(section);

  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  track.addEventListener('pointerdown',onDown);
  track.addEventListener('pointermove',onMove,{passive:false});
  track.addEventListener('pointerup',onUp);
  track.addEventListener('pointercancel',onUp);
  play?.addEventListener('click',toggleAuto);

  resize();
  if(forced!==null)apply(clamp01(Number(forced)));
  else if(reduced){apply(1);world.render();}
  else apply(scrollProgress());

  let last=performance.now();
  function tick(now){
    frame=0;
    const dt=Math.min(.05,(now-last)/1000||1/60);last=now;
    if(auto&&visible){
      autoP+=dt*0.055;
      if(autoP>1){autoP=1;auto=false;setPlayState(false);apply(scrollProgress());}
      else apply(autoP);
    }
    if(visible||auto)frame=requestAnimationFrame(tick);
  }
  frame=requestAnimationFrame(tick);

  window.__gcKaolin={
    dispose(){
      io.disconnect();ro.disconnect();
      window.removeEventListener('scroll',onScroll);
      window.removeEventListener('resize',resize);
      track.removeEventListener('pointerdown',onDown);
      track.removeEventListener('pointermove',onMove);
      track.removeEventListener('pointerup',onUp);
      track.removeEventListener('pointercancel',onUp);
      play?.removeEventListener('click',toggleAuto);
      if(frame)cancelAnimationFrame(frame);frame=0;
      world.dispose();
      window.__gcKaolin=null;
    },
  };
  window.__gcKaolinReady=true;
  window.dispatchEvent(new CustomEvent('gc:kaolin-ready'));
}

if(typeof document!=='undefined')bootKaolin();
