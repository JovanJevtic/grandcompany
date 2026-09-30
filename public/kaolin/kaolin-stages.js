// Kaolin: od kamena do umivaonika, kroz 9 poravnatih rendera (public/kaolin/stages).
//
// Nema 3D-a ni šuma: dvije susjedne slike se "pretapaju" kao morph — stara forma se blago
// zamuti i raširi, nova izranja iz zamućenja u oštrinu. Između prelaza svaka forma kratko
// stoji potpuno oštra (HOLD), da se vidi detalj. Slike su unaprijed poravnate na isto
// težište i isti pod, pa objekat nikad ne skače. Skrol i scrubber linija voze `p` (0..1).

const clamp01=n=>Math.min(1,Math.max(0,n));
const ss=(a,b,x)=>{const t=clamp01((x-a)/(b-a));return t*t*(3-2*t);};
const lerp=(a,b,t)=>a+(b-a)*t;

// Dio svakog segmenta u kojem forma miruje oštra (pola na početku, pola na kraju).
const HOLD=.34;
// Najveće zamućenje u sredini prelaza (px pri punoj veličini slike).
const BLUR=9;

function bootKaolin(){
  const section=document.querySelector('[data-kaolin]');
  const stack=section?.querySelector('[data-kaolin-stack]');
  const shadow=section?.querySelector('[data-kaolin-shadow]');
  const track=section?.querySelector('[data-kaolin-track]');
  const knob=section?.querySelector('[data-kaolin-knob]');
  if(!section||!stack||!track||!knob)return;
  window.__gcKaolin?.dispose?.();

  const layers=[...stack.querySelectorAll('img')];
  // Širina objekta u slici (0..1) — po njoj se sjenka na podu širi i skuplja.
  const widths=layers.map(img=>Number(img.dataset.w)||.55);
  const segments=layers.length-1;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const forced=new URLSearchParams(location.search).get('p');
  let progress=-1,dragging=false,visible=false,pending=false;

  const setKnob=p=>{
    section.style.setProperty('--p',p.toFixed(4));
    track.setAttribute('aria-valuenow',String(Math.round(p*100)));
  };

  function render(p){
    const x=p*segments;
    const i=Math.min(segments-1,Math.floor(x));
    // m: 0 = forma i oštra, 1 = forma i+1 oštra. Prelaz je samo u sredini segmenta.
    const m=ss(HOLD/2,1-HOLD/2,x-i);
    layers.forEach((img,k)=>{
      let o=0,b=0,s=1;
      if(k===i){
        // Stara forma drži punu gustinu do pola prelaza, pa tek onda nestaje — nema "prozirne" sredine.
        o=1-ss(.45,1,m);b=BLUR*m;s=1+.035*m;
      }else if(k===i+1){
        o=ss(0,.6,m);b=BLUR*(1-m);s=.965+.035*m;
      }
      const on=o>.001;
      img.style.opacity=on?o.toFixed(3):'0';
      img.style.filter=on&&b>.05?`blur(${b.toFixed(2)}px)`:'none';
      img.style.transform=on?`scale(${s.toFixed(4)})`:'';
      img.style.zIndex=k===i+1?'2':'1';
    });
    if(shadow){
      shadow.style.setProperty('--sw',lerp(widths[i],widths[i+1],m).toFixed(4));
      shadow.style.setProperty('--sb',(1+Math.sin(m*Math.PI)*.35).toFixed(3));
    }
  }

  const apply=p=>{
    setKnob(p);
    if(Math.abs(p-progress)<1e-5)return;
    progress=p;render(p);section.dataset.kaolinP=p.toFixed(3);
  };

  function scrollProgress(){
    const r=section.getBoundingClientRect();
    const total=Math.max(1,section.offsetHeight-innerHeight);
    return clamp01(-r.top/total);
  }
  function schedule(){
    if(forced!==null||pending)return;
    pending=true;
    requestAnimationFrame(()=>{pending=false;apply(scrollProgress());});
  }
  const onScroll=()=>{if(!dragging)schedule();};

  const scrollToY=y=>{
    const l=window.__gcLenis;
    if(l&&typeof l.scrollTo==='function')l.scrollTo(y,{immediate:true});
    else window.scrollTo(0,y);
  };
  function scrub(e){
    const r=track.getBoundingClientRect();
    const ratio=clamp01((e.clientX-r.left)/Math.max(1,r.width));
    const total=Math.max(1,section.offsetHeight-innerHeight);
    const top=section.getBoundingClientRect().top+window.scrollY;
    // Model se mijenja odmah (uživo), a stranica se skroluje na isto mjesto da ostane usklađena.
    apply(ratio);
    scrollToY(top+ratio*total);
  }
  const onDown=e=>{dragging=true;track.setPointerCapture?.(e.pointerId);scrub(e);};
  const onMove=e=>{if(dragging){e.preventDefault();scrub(e);}};
  const onUp=e=>{
    if(!dragging)return;dragging=false;
    try{track.releasePointerCapture?.(e.pointerId);}catch{}
    schedule();
  };
  // Tastatura: strelice pomjeraju po jednu formu (za one koji ne vuku mišem).
  const onKey=e=>{
    const d={ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1}[e.key];
    if(!d)return;
    e.preventDefault();
    const next=clamp01(Math.round(progress*segments+d)/segments);
    const total=Math.max(1,section.offsetHeight-innerHeight);
    scrollToY(section.getBoundingClientRect().top+window.scrollY+next*total);
  };

  // Slike se učitavaju tek kad se sekcija približi (loading=lazy + ovaj signal).
  const io=new IntersectionObserver(([e])=>{
    visible=e.isIntersecting;
    if(visible){section.classList.add('is-near');schedule();}
  },{rootMargin:'120% 0px'});
  io.observe(section);
  const ro=new ResizeObserver(schedule);
  ro.observe(section);

  window.addEventListener('scroll',onScroll,{passive:true});
  track.addEventListener('pointerdown',onDown);
  track.addEventListener('pointermove',onMove,{passive:false});
  track.addEventListener('pointerup',onUp);
  track.addEventListener('pointercancel',onUp);
  track.addEventListener('keydown',onKey);

  if(forced!==null)apply(clamp01(Number(forced)));
  else if(reduced)apply(1);
  else apply(scrollProgress());

  window.__gcKaolin={
    dispose(){
      io.disconnect();ro.disconnect();
      window.removeEventListener('scroll',onScroll);
      track.removeEventListener('pointerdown',onDown);
      track.removeEventListener('pointermove',onMove);
      track.removeEventListener('pointerup',onUp);
      track.removeEventListener('pointercancel',onUp);
      track.removeEventListener('keydown',onKey);
      window.__gcKaolin=null;
    },
  };
  window.__gcKaolinReady=true;
  window.dispatchEvent(new CustomEvent('gc:kaolin-ready'));
}

if(typeof document!=='undefined')bootKaolin();
