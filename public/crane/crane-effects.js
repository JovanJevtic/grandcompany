import * as THREE from '../vendor/three.module.min.js';

// A small, reversible dust puff at contact; never visible during the opening.
export function createDeliveryEffects(scene) {
  const count=18, positions=new Float32Array(count*3);
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  let texture=null;
  if(typeof document!=='undefined') {
    const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
    const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);
    gradient.addColorStop(0,'rgba(255,255,255,.7)');gradient.addColorStop(.4,'rgba(255,255,255,.28)');gradient.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);texture=new THREE.CanvasTexture(canvas);
  }
  const material=new THREE.PointsMaterial({color:'#e8e4db',map:texture,size:.65,transparent:true,opacity:0,depthWrite:false});
  const dust=new THREE.Points(geometry,material);dust.frustumCulled=false;scene.add(dust);
  return {
    update(p) {
      const t=Math.max(0,Math.min(1,(p-.95)/.05));
      dust.visible=t>0&&t<1;material.opacity=Math.sin(t*Math.PI)*.32;
      for(let i=0;i<count;i++) {
        const angle=i/count*Math.PI*2,radius=1.1+t*(.45+(i%3)*.14);
        positions[i*3]=9+Math.cos(angle)*radius;
        positions[i*3+1]=9.65+t*(.2+(i%4)*.08);
        positions[i*3+2]=Math.sin(angle)*radius*.7;
      }
      geometry.attributes.position.needsUpdate=true;
    },
  };
}
