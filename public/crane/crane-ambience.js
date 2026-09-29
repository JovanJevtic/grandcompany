const clamp=n=>Math.max(0,Math.min(1,n));
const ease=(a,b,p)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t);};

// Composited gradient layers follow the same scroll value as the camera.
// No clock, autonomous animation, or work after the scroll settles.
export function ambienceAt(progress) {
  const p=clamp(progress),cool=ease(.10,.46,p),warm=ease(.57,.96,p);
  return {
    weights:[1-cool,cool*(1-warm),warm],
    x:-4+9*p,
    y:4-10*p,
    angle:-8+17*p,
    warm,
  };
}
export function createScrollAmbience(root) {
  const layers=[...root.querySelectorAll('[data-ambience]')];
  const baseColors=[[238,244,249],[217,231,242],[184,204,225]];
  return progress=>{
    const state=ambienceAt(progress);
    layers.forEach((layer,i)=>{
      layer.style.opacity=state.weights[i].toFixed(4);
      const direction=i===1?-1:1;
      layer.style.transform=`translate3d(${state.x*direction}%,${state.y*(i===2?-.6:1)}%,0) rotate(${state.angle*direction}deg) scale(1.12)`;
    });
    const base=[0,1,2].map(c=>Math.round(state.weights.reduce((v,w,i)=>v+w*baseColors[i][c],0)));
    root.style.setProperty('--scene-base',base.join(' '));
    root.style.setProperty('--scene-progress',clamp(progress).toFixed(4));
    root.dataset.ambience=state.weights.map(w=>w.toFixed(3)).join(',');
    return state;
  };
}
