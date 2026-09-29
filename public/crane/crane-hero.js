// Pokretač 3D scene krana. Kopija iz grandcompany (main), prilagođena maison sajtu.
//
// Razlika u odnosu na original: tamo scena visi ispod <header>-a, a ovdje ispod
// fiksnog wordmarka "GRAND COMPANY" (element sa data-wordmark). Njegovo dno je
// gornja ivica scene, pa se visina offseta mjeri iz njega, a ne iz headera.
// Dodat je i dispose() da se scena ugasi ako se stranica montira ponovo.
import * as THREE from '../vendor/three.module.min.js';
import {createScrollAmbience} from './crane-ambience.js?v=16';
import {RoomEnvironment} from '../vendor/RoomEnvironment.js';
import {createCraneRenderer} from './crane-renderer.js?v=18';
import {craneQuality} from './crane-quality.js?v=17';
import {createCraneScene, clamp, smooth} from './crane-scene.js?v=18';

const cover=document.querySelector('.construction-story');
const viewport=cover?.querySelector('.crane-viewport');
const canvas=cover?.querySelector('canvas');
const wordmark=document.querySelector('[data-wordmark]');

// Gornja ivica scene: dno wordmarka. Rezervna vrijednost dok se font ne učita.
function topOffset() {
  if(wordmark) {
    const bottom=wordmark.getBoundingClientRect().bottom;
    if(bottom>0)return bottom;
  }
  return parseFloat(getComputedStyle(cover).getPropertyValue('--story-header'))||88;
}

if(canvas) {
  if(document.readyState==='complete')init();
  else window.addEventListener('load',init,{once:true});
}
function init() {
  if(!cover||!viewport)return;
  if(window.__gcCrane)window.__gcCrane.dispose();
  let renderer;
  try {
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
  } catch(error) { console.warn('3D hero unavailable; showing illustration.',error); return; }
  const quality=()=>craneQuality(viewport.clientWidth,viewport.clientHeight,window.devicePixelRatio,window.innerWidth<768,renderer.capabilities.maxTextureSize);
  renderer.setPixelRatio(quality().pixelRatio);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;
  const world=createCraneScene();
  world.lighting.key.shadow.mapSize.setScalar(quality().shadowSize);
  const textures=new Set();
  world.scene.traverse(object=>{
    for(const material of [object.material].flat().filter(Boolean))
      for(const value of Object.values(material))if(value?.isTexture)textures.add(value);
  });
  for(const texture of textures){texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());texture.needsUpdate=true;}
  const updateAmbience=createScrollAmbience(cover);
  const coolFill=new THREE.Color('#dbe5eb'),warmFill=new THREE.Color('#f0d7b6');
  updateAmbience(0);
  const pmrem=new THREE.PMREMGenerator(renderer);
  const studio=new RoomEnvironment();
  const environment=pmrem.fromScene(studio,.055);
  world.scene.environment=environment.texture;
  world.scene.environmentIntensity=.38;
  studio.dispose();pmrem.dispose();
  const pipeline=createCraneRenderer(renderer,world,quality().contactSamples);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let progress=0,targetProgress=0,frame=0,active=true,width=1,height=1,lastTime=0;
  function measure() {
    width=Math.max(1,viewport.clientWidth);height=Math.max(1,viewport.clientHeight);
    const settings=quality();
    renderer.setPixelRatio(settings.pixelRatio);
    const shadow=world.lighting.key.shadow;
    if(shadow.mapSize.x!==settings.shadowSize){shadow.map?.dispose();shadow.map=null;shadow.mapSize.setScalar(settings.shadowSize);shadow.needsUpdate=true;}
    renderer.setSize(width,height,false);pipeline.setSize(width,height);
    cover.dataset.renderResolution=`${canvas.width}×${canvas.height}`;
    cover.dataset.shadowResolution=String(settings.shadowSize);
    onScroll();requestDraw();
  }
  function onScroll() {
    // Native page distance drives the illustration only. Text stays in document flow.
    const rect=cover.getBoundingClientRect();
    const offset=topOffset();
    const distance=Math.max(1,cover.offsetHeight-window.innerHeight+offset);
    targetProgress=reduced.matches?0:clamp((offset-rect.top)/distance);
    requestDraw();
  }
  function requestDraw() {if(!frame&&active&&!document.hidden)frame=requestAnimationFrame(draw);}
  function draw(now) {
    frame=0;
    const dt=Math.min(.1,(now-lastTime)/1000||1/60);lastTime=now;
    progress=Math.abs(targetProgress-progress)<.00015?targetProgress:progress+(targetProgress-progress)*(1-Math.exp(-14*dt));
    const ambience=updateAmbience(progress);
    world.lighting.fill.color.copy(coolFill).lerp(warmFill,ambience.warm);
    // Full-width canvas throughout: lens framing holds the opening between columns.
    const middleWidth=Math.min(window.innerWidth,1680)*(window.innerWidth<1200?.45:.47);
    const framingCorrection=Math.max(1,height/middleWidth)/Math.max(1,height/width);
    const framing=window.innerWidth<1024?1+.13*smooth(.32,.62,progress):framingCorrection*(1+.22*smooth(.28,.58,progress));
    const openingFrame=framing;
    const siteEntry=smooth(.68,.88,progress);
    const state=world.update(progress,width/height,openingFrame+(1-openingFrame)*siteEntry);
    cover.dataset.siteEntry=siteEntry.toFixed(3);
    const siteDissolve=smooth(.43,.46,progress)*(1-smooth(.57,.61,progress));
    const districtDissolve=smooth(.70,.73,progress)*(1-smooth(.82,.86,progress));
    pipeline.render((1-siteDissolve)*(1-districtDissolve));
    cover.dataset.sceneChapter=String(state.chapter+1);
    cover.dataset.sceneProgress=progress.toFixed(3);
    if(progress!==targetProgress)requestDraw();
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
  // pa GSAP/ScrollTrigger treba ponovo da izmjeri pozicije.
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
      window.__gcCrane=null;
    },
  };
}
