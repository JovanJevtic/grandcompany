// Kaolin kao niz kadrova (iz Runway klipova, vidi scripts/kaolin-frames.mjs).
//
// Skrol bira kadar, a canvas ga crta — kao premotavanje videa, samo pouzdano i unazad.
// Kadrovi se učitavaju grubo pa fino: prvo svaki 8., pa svaki 4., 2. i na kraju svi. Tako
// je cijela transformacija "premotljiva" odmah, a oštrina stiže dok se gleda. Dok neki kadar
// još nije stigao, crta se najbliži učitani.

export function createFramePlayer(figure,manifest,base){
  const mobile=matchMedia('(max-width: 767px)').matches;
  const suffix=mobile?'-m':'';
  const count=manifest.count;
  const frames=new Array(count).fill(null);
  const canvas=document.createElement('canvas');
  canvas.className='kaolin-frames';
  figure.append(canvas);
  const ctx=canvas.getContext('2d');
  let current=-1,disposed=false;

  const src=i=>`${base}/f${String(i+1).padStart(4,'0')}${suffix}.webp`;

  // Redoslijed učitavanja: 0,8,16… pa 4,12… pa 2,6… pa neparni.
  const order=[];
  const seen=new Set();
  for(const step of [8,4,2,1])for(let i=0;i<count;i+=step)if(!seen.has(i)){seen.add(i);order.push(i);}
  if(!seen.has(count-1))order.splice(1,0,count-1);

  let cursor=0,inflight=0;
  function pump(){
    while(!disposed&&inflight<6&&cursor<order.length){
      const i=order[cursor++];inflight++;
      const img=new Image();
      img.decoding='async';
      img.src=src(i);
      img.decode().then(()=>{
        frames[i]=img;
        // Ako je stigao kadar bliži onom koji treba, precrtaj.
        if(current>=0&&nearest(current)===i)paint(i);
      }).catch(()=>{}).finally(()=>{inflight--;pump();});
    }
  }

  function nearest(i){
    if(frames[i])return i;
    for(let d=1;d<count;d++){
      if(i-d>=0&&frames[i-d])return i-d;
      if(i+d<count&&frames[i+d])return i+d;
    }
    return -1;
  }

  function resize(){
    const r=figure.getBoundingClientRect();
    const dpr=Math.min(2,devicePixelRatio||1);
    canvas.width=Math.max(1,Math.round(r.width*dpr));
    canvas.height=Math.max(1,Math.round(r.height*dpr));
    if(current>=0)paint(nearest(current));
  }

  function paint(k){
    const img=frames[k];
    if(!img)return;
    // Figura ima isti odnos kao kadar, pa ga crtamo cijelog; min() čuva proporcije ako odstupi.
    const s=Math.min(canvas.width/img.naturalWidth,canvas.height/img.naturalHeight);
    const w=img.naturalWidth*s,h=img.naturalHeight*s;
    ctx.drawImage(img,(canvas.width-w)/2,(canvas.height-h)/2,w,h);
  }

  const ro=new ResizeObserver(resize);
  ro.observe(figure);
  resize();

  return {
    start:pump,
    draw(p){
      current=Math.round(p*(count-1));
      const k=nearest(current);
      if(k>=0)paint(k);
    },
    dispose(){disposed=true;ro.disconnect();canvas.remove();},
  };
}
