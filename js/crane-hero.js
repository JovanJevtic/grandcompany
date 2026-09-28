import * as THREE from '../vendor/three.module.min.js';
import {RoomEnvironment} from '../vendor/RoomEnvironment.js';
import {createCraneRenderer} from './crane-renderer.js?v=11';
import {createCraneScene, clamp, smooth} from './crane-scene.js?v=13';

const cover=document.querySelector('.construction-story');
const viewport=cover?.querySelector('.crane-viewport');
const canvas=cover?.querySelector('canvas');
if(canvas) {
  if(document.readyState==='complete')init();
  else window.addEventListener('load',init,{once:true});
}
function init() {
  let renderer;
  try {
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
  } catch(error) { console.warn('3D hero unavailable; showing illustration.',error); return; }
  renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio,1.5),window.innerWidth<768?1.5:1.75));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;
  const world=createCraneScene();
  const pmrem=new THREE.PMREMGenerator(renderer);
  const studio=new RoomEnvironment();
  const environment=pmrem.fromScene(studio,.055);
  world.scene.environment=environment.texture;
  world.scene.environmentIntensity=.65;
  studio.dispose();pmrem.dispose();
  const pipeline=createCraneRenderer(renderer,world);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let progress=0,targetProgress=0,frame=0,active=true,width=1,height=1,lastTime=0;
  const header=document.querySelector('header');
  function measure() {
    cover.style.setProperty('--story-header',`${Math.ceil(header.getBoundingClientRect().height)}px`);
    width=Math.max(1,viewport.clientWidth);height=Math.max(1,viewport.clientHeight);
    renderer.setSize(width,height,false);pipeline.setSize(width,height);onScroll();requestDraw();
  }
  function onScroll() {
    // Native page distance drives the illustration only. Text stays in document flow.
    const rect=cover.getBoundingClientRect();
    const headerHeight=header.getBoundingClientRect().height;
    const distance=Math.max(1,cover.offsetHeight-window.innerHeight+headerHeight);
    targetProgress=reduced.matches?0:clamp((headerHeight-rect.top)/distance);
    requestDraw();
  }
  function requestDraw() {if(!frame&&active&&!document.hidden)frame=requestAnimationFrame(draw);}
  function draw(now) {
    frame=0;
    const dt=Math.min(.1,(now-lastTime)/1000||1/60);lastTime=now;
    progress=Math.abs(targetProgress-progress)<.00015?targetProgress:progress+(targetProgress-progress)*(1-Math.exp(-14*dt));
    // Full-width canvas throughout: lens framing holds the opening between columns.
    const middleWidth=Math.min(window.innerWidth,1680)*(window.innerWidth<1200?.45:.47);
    const framingCorrection=Math.max(1,height/middleWidth)/Math.max(1,height/width);
    const framing=window.innerWidth<1024?1+.13*smooth(.32,.62,progress):framingCorrection*(1+.22*smooth(.28,.58,progress));
    const openingFrame=framing;
    const siteEntry=smooth(.68,.88,progress);
    const state=world.update(progress,width/height,openingFrame+(1-openingFrame)*siteEntry);
    cover.dataset.siteEntry=siteEntry.toFixed(3);
    pipeline.render();
    cover.dataset.sceneChapter=String(state.chapter+1);
    cover.dataset.sceneProgress=progress.toFixed(3);
    if(progress!==targetProgress)requestDraw();
  }
  const observer=new ResizeObserver(measure);observer.observe(viewport);observer.observe(header);observer.observe(cover);
  const intersection=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;if(active){onScroll();requestDraw();}},{rootMargin:'100px'});intersection.observe(cover);
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',measure,{passive:true});
  document.addEventListener('visibilitychange',requestDraw);
  reduced.addEventListener('change',()=>{cover.classList.toggle('crane-reduced',reduced.matches);measure();});
  canvas.addEventListener('webglcontextlost',(event)=>{event.preventDefault();cover.classList.remove('crane-ready');active=false;});
  canvas.addEventListener('webglcontextrestored',()=>location.reload());
  cover.classList.add('crane-ready');cover.classList.toggle('crane-reduced',reduced.matches);measure();
}
