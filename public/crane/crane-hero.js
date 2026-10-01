// Pokretač 3D scene krana. Kopija iz grandcompany (main), prilagođena maison sajtu.
//
// Razlika u odnosu na original: tamo scena visi ispod <header>-a, a ovdje ispod
// fiksnog wordmarka "GRAND COMPANY" (element sa data-wordmark). Njegovo dno je
// gornja ivica scene, pa se visina offseta mjeri iz njega, a ne iz headera.
// Dodat je i dispose() da se scena ugasi ako se stranica montira ponovo.
import * as THREE from '../vendor/three.module.min.js';
import {createScrollAmbience} from './crane-ambience.js?v=17';
import {RoomEnvironment} from '../vendor/RoomEnvironment.js';
import {createCraneRenderer} from './crane-renderer.js?v=25';
import {craneQuality} from './crane-quality.js?v=19';
import {createCraneScene, clamp, smooth, STORY_END} from './crane-scene.js?v=32';

const cover=document.querySelector('.construction-story');
const viewport=cover?.querySelector('.crane-viewport');
const canvas=cover?.querySelector('canvas');
const outro=cover?.querySelector('.story-outro');
const wordmark=document.querySelector('[data-wordmark]');

// Gornja ivica scene: dno wordmarka. Rezervna vrijednost dok se font ne učita.
function topOffset() {
  if(wordmark) {
    const bottom=wordmark.getBoundingClientRect().bottom;
    if(bottom>0)return bottom;
  }
  return parseFloat(getComputedStyle(cover).getPropertyValue('--story-header'))||88;
}

// Ne čekamo `load` (slike i fontovi ostatka strane): scena kreće čim je modul tu, dok splash traje.
if(new URLSearchParams(location.search).has('debug'))console.info(`[crane] modul pokrenut: ${Math.round(performance.now())} ms`);
if(canvas)init();
async function init() {
  if(!cover||!viewport)return;
  if(window.__gcCrane)window.__gcCrane.dispose();
  // Privremena ručka dok se šejderi prevode: ako se stranica ugasi u međuvremenu, init odustaje.
  let cancelled=false;
  window.__gcCrane={dispose(){cancelled=true;}};
  let renderer;
  try {
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
  } catch(error) { console.warn('3D hero unavailable; showing illustration.',error); cover.classList.add('crane-failed'); return; }
  // `resolutionCap` postavlja mjerenje GPU-a pri pokretanju (vidi pickResolution): slabiji
  // uređaji dobiju nižu rezoluciju umjesto trzanja, jaki zadržavaju punu.
  let resolutionCap=Infinity,contactEnabled=true;
  const quality=()=>{
    const q=craneQuality(viewport.clientWidth,viewport.clientHeight,window.devicePixelRatio,window.innerWidth<768,renderer.capabilities.maxTextureSize);
    q.pixelRatio=Math.min(q.pixelRatio,Math.max(1,resolutionCap));
    return q;
  };
  renderer.setPixelRatio(quality().pixelRatio);
  renderer.shadowMap.enabled=false; // linijski crtež: bez sjenki
  // Mapa sjenki se ne obnavlja svaki kadar, nego samo kad se geometrija pomjeri (vidi draw).
  renderer.shadowMap.autoUpdate=false;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;
  const breathe=()=>new Promise(r=>setTimeout(r,0));
  await breathe();
  const world=createCraneScene();
  await breathe();
  if(cancelled){renderer.dispose();return;}
  world.lighting.key.shadow.mapSize.setScalar(quality().shadowSize);
  const textures=new Set();
  world.scene.traverse(object=>{
    for(const material of [object.material].flat().filter(Boolean))
      for(const value of Object.values(material))if(value?.isTexture)textures.add(value);
  });
  for(const texture of textures){texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());texture.needsUpdate=true;}
  const updateAmbience=createScrollAmbience(cover);
  const coolFill=new THREE.Color('#e2eaef'),warmFill=new THREE.Color('#f2e6d2');
  updateAmbience(0);
  const pmrem=new THREE.PMREMGenerator(renderer);
  const studio=new RoomEnvironment();
  const environment=pmrem.fromScene(studio,.055);
  world.scene.environment=environment.texture;
  world.scene.environmentIntensity=.7;
  studio.dispose();pmrem.dispose();
  await breathe();
  const pipeline=createCraneRenderer(renderer,world,quality().contactSamples);
  // Dijagnostika (samo uz ?debug u adresi): pristup rendereru i sceni iz konzole.
  const debug=new URLSearchParams(location.search).has('debug');
  if(debug)window.__gcCraneDebug={renderer,world,pipeline,THREE};
  // Bez sinhrone provjere grešaka šejdera: ona tjera browser da čeka prevod svakog programa.
  renderer.debug.checkShaderErrors=debug;

  // ——— Prevod šejdera unaprijed ———
  // Scena ima ~60 šejder programa (na Windowsu ~¼ s svaki). Bez ovoga se prevode usred skrola,
  // kad se neki dio scene prvi put pojavi — to su bili višesekundni zastoji. compileAsync ih
  // prevodi paralelno i ne blokira stranicu; zatim nekoliko kadrova na malom platnu (prije
  // prvog measure) "zagrije" i varijante za sjenke i SSAO na ključnim trenucima priče.
  const tCompile=performance.now();
  await pipeline.compile();
  if(debug)console.info(`[crane] šejderi: ${Math.round(performance.now()-tCompile)} ms, programa ${renderer.info.programs.length}`);
  if(cancelled){pipeline.dispose();renderer.dispose();return;}
  for(const p of [0,.3,.5,.62,.72,.86]) {
    const tw=performance.now();
    world.update(p,1.6,1);renderer.shadowMap.needsUpdate=true;pipeline.render(1);
    if(debug)console.info(`[crane] zagrijavanje p=${p}: ${Math.round(performance.now()-tw)} ms, programa ${renderer.info.programs.length}: ${renderer.info.programs.slice(-12).map(x=>x.name).join(',')}`);
    await new Promise(r=>setTimeout(r,0));
    if(cancelled){pipeline.dispose();renderer.dispose();return;}
  }
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let extra=0,frameHeight=1,lastShadowKey='',skippedShadow=false,progress=0,targetProgress=0,targetOutro=0,outroP=0,frame=0,active=true,width=1,height=1,lastTime=0;
  // ——— Rezolucija po mjeri GPU-a ———
  // Najteži kadar (cijelo gradilište) se nacrta u rezoluciji 1 i u punoj, pa iz ta dva vremena
  // (trošak ≈ fiksni dio + dio po pikselu) izračunamo najveću rezoluciju koja staje u ~18 ms.
  function pickResolution() {
    const w=Math.max(1,viewport.clientWidth),h=Math.max(1,viewport.clientHeight);
    const full=quality().pixelRatio;
    if(full<=1.05)return full;
    const gl=renderer.getContext(),pixel=new Uint8Array(4);
    const sync=()=>gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);
    const cost=(ratio,ao=1)=>{
      renderer.setPixelRatio(ratio);renderer.setSize(w,h,false);pipeline.setSize(w,h);
      world.update(.45,w/h,1);renderer.shadowMap.needsUpdate=true;pipeline.render(ao);sync();
      const t=performance.now();
      for(let i=0;i<2;i++){renderer.shadowMap.needsUpdate=true;pipeline.render(ao);}
      sync();return (performance.now()-t)/2;
    };
    const TARGET=18;
    const low=cost(1);
    // Ako je već rezolucija 1 preskupa, viša ne dolazi u obzir — preskačemo skupo mjerenje.
    if(low>=TARGET){
      // Slab GPU i na rezoluciji 1: kao posljednji korak isključujemo kontaktne sjenke (SSAO),
      // ako to primjetno ubrza kadar. Model, sjenke i ostalo ostaju isti.
      if(low>=TARGET*1.4) {
        const plain=cost(1,0);
        if(plain<low*.85)contactEnabled=false;
        if(debug)console.info(`[crane] GPU: 1x ${low.toFixed(1)} ms, bez SSAO ${plain.toFixed(1)} ms → SSAO ${contactEnabled?'ostaje':'isključen'}`);
      } else if(debug)console.info(`[crane] GPU: 1x ${low.toFixed(1)} ms → rezolucija 1.00x`);
      cover.dataset.gpuCost=low.toFixed(1);
      return 1;
    }
    const high=cost(full);
    const perPixel=(high-low)/(full*full-1),fixed=low-perPixel;
    let ratio=perPixel>0?Math.sqrt(Math.max(0,(TARGET-fixed)/perPixel)):full;
    ratio=Math.min(full,Math.max(1,Math.floor(ratio*20)/20));
    if(debug)console.info(`[crane] GPU: 1x ${low.toFixed(1)} ms, ${full.toFixed(2)}x ${high.toFixed(1)} ms → rezolucija ${ratio.toFixed(2)}x`);
    cover.dataset.gpuCost=`${low.toFixed(1)}/${high.toFixed(1)}`;
    return ratio;
  }
  // Mjerenje na startu se radi dok se stranica još učitava (fontovi, slike, splash), pa ispadne
  // pesimistično i scena ostane zaključana na mutnih 1×. Zato: kreće se od pune rezolucije, ali
  // nikad ispod rezolucije ekrana (pod = devicePixelRatio), a dalje odlučuje regulator u draw().
  // Kreće se od rezolucije ekrana (oštro, a ne 2× supersampling koji guši slabiji GPU). Mjerenja
  // na startu više nema: radilo se dok se stranica učitava, kasnilo je prikaz scene i bilo netačno.
  // Dalje odlučuje regulator u draw(): kad je sporo, PRVO se gase kontaktne sjenke, pa tek onda
  // pada rezolucija (do 1×); kad je brzo, rezolucija raste ka punoj, pa se sjenke vraćaju.
  const native=Math.max(1,Math.min(2,window.devicePixelRatio||1));
  const floorRatio=1;
  resolutionCap=Math.min(quality().pixelRatio,native);

  let sizeKey='';
  function measure() {
    width=Math.max(1,viewport.clientWidth);height=Math.max(1,viewport.clientHeight);
    const settings=quality();
    const shadow=world.lighting.key.shadow;
    if(shadow.mapSize.x!==settings.shadowSize){shadow.map?.dispose();shadow.map=null;shadow.mapSize.setScalar(settings.shadowSize);shadow.needsUpdate=true;lastShadowKey='';}
    // Render targeti (slika, SSAO, normale) se alociraju samo kad se veličina stvarno promijeni —
    // ResizeObserver javlja i za promjene koje ne diraju platno (npr. visina sekcije).
    const key=`${width}x${height}@${settings.pixelRatio.toFixed(3)}`;
    if(key!==sizeKey) {
      sizeKey=key;
      renderer.setPixelRatio(settings.pixelRatio);
      renderer.setSize(width,height,false);pipeline.setSize(width,height);
    }
    // Platno je produženo naviše iza wordmarka (CSS: top = -visina headera), da naslov nema
    // traku ispod sebe. Kamera i dalje kadrira samo donji dio (visina `frameHeight`), a gornji
    // pojas je "prozor" produžen naviše — kadar scene je isti kao prije, piksel za piksel.
    extra=Math.max(0,-parseFloat(getComputedStyle(viewport).top)||0);
    frameHeight=Math.max(1,height-extra);
    if(extra>0)world.camera.setViewOffset(width,frameHeight,0,-extra,width,height);
    else world.camera.clearViewOffset();
    cover.dataset.renderResolution=`${canvas.width}×${canvas.height}`;
    cover.dataset.shadowResolution=String(settings.shadowSize);
    onScroll();requestDraw();
  }
  function onScroll() {
    // Native page distance drives the illustration only. Text stays in document flow.
    const rect=cover.getBoundingClientRect();
    const offset=topOffset();
    // Outro (kraj na nebu) je dodatni skrol iza animacije: scena ga ne troši, on vozi samo tekst.
    const outroHeight=outro?outro.offsetHeight:0;
    const distance=Math.max(1,cover.offsetHeight-window.innerHeight+offset-outroHeight);
    const scrolled=offset-rect.top;
    targetProgress=reduced.matches?0:clamp(scrolled/distance);
    targetOutro=reduced.matches?1:clamp((scrolled-distance)/Math.max(1,outroHeight));
    // U outru je skrol "teži": kotačić ide upola sporije da se rečenica ne preleti.
    const lenis=window.__gcLenis;
    if(lenis?.options){
      const slow=targetOutro>0&&targetOutro<1;
      lenis.options.wheelMultiplier=slow?.5:1;
      lenis.options.lerp=slow?.06:.1;
    }
    requestDraw();
  }
  function requestDraw() {if(!frame&&active&&!document.hidden)frame=requestAnimationFrame(draw);}
  // ——— Regulator rezolucije ———
  // Dok se skroluje (kadrovi idu jedan za drugim) prati se prosječno trajanje kadra. Ako je
  // stalno sporo (< ~42 fps), rezolucija se spusti za korak (ali ne ispod rezolucije ekrana);
  // ako je stalno brzo, podigne se nazad ka punoj. Promjena se primijeni tek kad skrol stane,
  // da se usred pokreta ne realocira platno (to bi bio trzaj).
  let frameAvg=16,slowRun=0,fastRun=0,wantedCap=resolutionCap;
  function govern(ms,continuous) {
    if(!continuous)return;
    frameAvg+=(ms-frameAvg)*.1;
    if(frameAvg>24){slowRun++;fastRun=0;}else if(frameAvg<13){fastRun++;slowRun=0;}else{slowRun=0;fastRun=0;}
    const full=quality().pixelRatio;
    if(slowRun>30){
      slowRun=0;
      if(contactEnabled)contactEnabled=false; // prvi korak: bez SSAO (najskuplji dio, slika ostaje oštra)
      else if(wantedCap>floorRatio+.01)wantedCap=Math.max(floorRatio,Math.min(wantedCap,full)-.2);
    } else if(fastRun>180){
      fastRun=0;
      if(wantedCap<Math.min(full,native)-.01)wantedCap=Math.min(full,wantedCap+.15);
      else if(!contactEnabled&&frameAvg<10)contactEnabled=true;
    }
  }
  function applyGovernor() {
    if(Math.abs(wantedCap-resolutionCap)<.01)return;
    resolutionCap=wantedCap;sizeKey='';measure();
  }
  function draw(now) {
    frame=0;
    const gapMs=now-lastTime;
    govern(gapMs,gapMs>0&&gapMs<60);
    const dt=Math.min(.1,(now-lastTime)/1000||1/60);lastTime=now;
    // Lenis već ublažava skrol; ovdje samo mali dodatni filter, da scena ne kasni za točkićem.
    progress=Math.abs(targetProgress-progress)<.00015?targetProgress:progress+(targetProgress-progress)*(1-Math.exp(-22*dt));
    // Postojeća priča se mjeri u "story vremenu"; posle STORY_END ide ulazak u enterijer.
    const storyT=clamp(progress/STORY_END);
    const interiorT=smooth(STORY_END,STORY_END+.08,progress);
    const ambience=updateAmbience(storyT);
    // U enterijeru se toplo svetlo povlači — soba treba da ostane svetla i vazdušasta.
    world.lighting.fill.color.copy(coolFill).lerp(warmFill,ambience.warm*(1-interiorT));
    // Full-width canvas throughout: lens framing holds the opening between columns.
    const middleWidth=Math.min(window.innerWidth,1680)*(window.innerWidth<1200?.45:.47);
    const framingCorrection=Math.max(1,frameHeight/middleWidth)/Math.max(1,frameHeight/width);
    const framing=window.innerWidth<1024?1+.13*smooth(.32,.62,storyT):framingCorrection*(1+.22*smooth(.28,.58,storyT));
    const openingFrame=framing;
    const siteEntry=smooth(.68,.88,storyT);
    const state=world.update(progress,width/frameHeight,openingFrame+(1-openingFrame)*siteEntry);
    cover.dataset.siteEntry=siteEntry.toFixed(3);
    // Kucanje rečenice: počinje kad kamera izađe kroz prozor, a završi na dnu hero-a.
    // Pisanje: prvih ~72% outra piše rečenicu, ostatak je mirovanje na gotovom tekstu.
    outroP=Math.abs(targetOutro-outroP)<.0005?targetOutro:outroP+(targetOutro-outroP)*(1-Math.exp(-8*dt));
    cover.style.setProperty('--type-p',(reduced.matches?1:clamp((outroP-.04)/.68)).toFixed(4));
    // Sjenke zavise samo od geometrije i svjetla (fiksno), ne od kamere. Geometrija se mijenja
    // do kraja rasta fasade (~.76); posle toga se pomjera samo kamera, pa mapa ostaje ista.
    // Dok se skroluje, na slabijem GPU-u (rezolucija ograničena) mapa se obnavlja svaki drugi
    // kadar — sjenka kasni 16 ms, što se ne vidi; kad skrol stane, obnovi se odmah.
    const shadowKey=progress<.77?progress.toFixed(5):'static';
    const settling=progress===targetProgress;
    if(shadowKey!==lastShadowKey&&(settling||resolutionCap>=2||!skippedShadow)) {
      renderer.shadowMap.needsUpdate=true;lastShadowKey=shadowKey;skippedShadow=true;
    } else if(shadowKey!==lastShadowKey)skippedShadow=false;
    const siteDissolve=smooth(.43,.46,storyT)*(1-smooth(.57,.61,storyT));
    const districtDissolve=smooth(.70,.73,storyT)*(1-smooth(.82,.86,storyT));
    // Linijski crtež; na samom kraju (izlaz kroz prozor u nebo) scena se rastvori u ravnu 2D sliku.
    pipeline.render(1,1-smooth(.95,.995,progress));
    cover.dataset.sceneChapter=String(state.chapter+1);
    cover.dataset.sceneProgress=progress.toFixed(3);
    if(progress!==targetProgress||outroP!==targetOutro)requestDraw();
    else applyGovernor();
  }
  const observer=new ResizeObserver(measure);observer.observe(viewport);observer.observe(cover);
  if(wordmark)observer.observe(wordmark);
  const intersection=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;if(active){onScroll();requestDraw();}},{rootMargin:'100px'});intersection.observe(cover);
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',measure,{passive:true});
  document.addEventListener('visibilitychange',requestDraw);
  const onReducedChange=()=>{cover.classList.toggle('crane-reduced',reduced.matches);measure();};
  reduced.addEventListener('change',onReducedChange);
  const onContextLost=event=>{event.preventDefault();cover.classList.remove('crane-ready');active=false;};
  const onContextRestored=()=>location.reload();
  canvas.addEventListener('webglcontextlost',onContextLost);
  canvas.addEventListener('webglcontextrestored',onContextRestored);
  cover.classList.add('crane-ready');cover.classList.toggle('crane-reduced',reduced.matches);measure();
  // Javljamo ostatku stranice da se raspored promijenio (sekcije su više niske dok scena ne krene),
  // pa GSAP/ScrollTrigger treba ponovo da izmjeri pozicije. Flag je i za uvodni splash: on
  // čeka da scena bude spremna, inače se animacija uvoda zamrzne dok se WebGL inicijalizuje.
  window.__gcCraneReady=true;
  window.dispatchEvent(new CustomEvent('gc:crane-ready'));

  // Gašenje: bez ovoga bi stara scena ostala da animira u pozadini nakon nove montaže.
  window.__gcCrane={
    dispose() {
      observer.disconnect();intersection.disconnect();
      window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',measure);
      document.removeEventListener('visibilitychange',requestDraw);
      reduced.removeEventListener('change',onReducedChange);
      canvas.removeEventListener('webglcontextlost',onContextLost);
      canvas.removeEventListener('webglcontextrestored',onContextRestored);
      cancelAnimationFrame(frame);
      pipeline.dispose();renderer.dispose();
      cover.classList.remove('crane-ready','crane-reduced');
      window.__gcCraneReady=false;
      window.__gcCrane=null;
    },
  };
}
