import * as THREE from '../vendor/three.module.min.js';

// Kupatilo u zgradi na koju kran spušta paletu (sprat 2). Kamera ulazi kroz balkonska vrata
// na prednjoj (+Z) strani, vidi umivaonik i okruglo ogledalo, okreće se ka velikom prozoru
// na +X strani i izlazi kroz njega u nebo.
//
// Lokalne koordinate su koordinate zgrade: x i z od centra zgrade, y od gornje ivice ploče.
// Soba: x -2.0..3.44, z -2.8..2.8. Stubovi po obodu (x=0 i x=3.2 na z=±2.85) ulaze u zidove.
export function buildTowerBath({parent,box,rod,m}) {
  const ceramic=new THREE.MeshStandardMaterial({color:'#f2f0eb',roughness:.4,metalness:.02});
  const wall=new THREE.MeshStandardMaterial({color:'#efece6',roughness:.93,metalness:0});
  const stone=new THREE.MeshStandardMaterial({color:'#e9e3d8',roughness:.8,metalness:0});
  const brass=new THREE.MeshStandardMaterial({color:'#b89a6a',roughness:.35,metalness:.75});
  const showerGlass=new THREE.MeshStandardMaterial({color:'#e9eff2',roughness:.18,metalness:0,transparent:true,opacity:.16,depthWrite:false});
  const plantGreen=new THREE.MeshStandardMaterial({color:'#c7d0c2',roughness:.9});
  const X0=-2.0,X1=3.44,Z=2.8,H=2.15,CX=(X0+X1)/2,LX=X1-X0;

  // ——— Pod: veliki kameni format ———
  box(parent,stone,CX,.02,0,LX,.04,Z*2);
  for(let x=X0+1.2;x<X1;x+=1.2)box(parent,m.joint,x,.045,0,.012,.004,Z*2);
  for(let z=-Z+1.2;z<Z;z+=1.2)box(parent,m.joint,CX,.045,z,LX,.004,.012);

  // ——— Zidovi ———
  box(parent,wall,X0,H/2,0,.12,H,Z*2);                        // -X, pun
  box(parent,wall,CX,H/2,-Z,LX,H,.12);                        // -Z, iza umivaonika
  // +Z: balkonska vrata x -1.85..-0.3 (visina 2.1), ostatak pun.
  box(parent,wall,(-0.3+X1)/2,H/2,Z,X1+0.3,H,.12);
  box(parent,wall,(X0-1.85)/2,H/2,Z,Math.abs(-1.85-X0),H,.12);
  box(parent,wall,-1.075,2.125,Z,1.55,.05,.12);
  // Okvir vrata + odmaknuto klizno krilo (staklo uz zid, ne u prolazu).
  for(const x of [-1.85,-0.3])box(parent,m.frame,x,1.05,Z,.06,2.1,.1);
  box(parent,m.frame,-1.075,2.1,Z,1.6,.06,.1);
  box(parent,showerGlass,.45,1.05,Z-.1,1.5,2.05,.02);
  // +X: veliki prozor z -1.6..1.6, y .5..2.1 — kroz njega kamera izlazi.
  box(parent,wall,X1,.25,0,.12,.5,Z*2);
  for(const s of [-1,1])box(parent,wall,X1,H/2,s*(Z+1.6)/2,.12,H,Z-1.6);
  box(parent,wall,X1,2.125,0,.12,.05,3.2);
  for(const y of [.5,2.1])box(parent,m.frame,X1,y,0,.1,.06,3.26);
  for(const s of [-1,1])box(parent,m.frame,X1,1.3,s*1.6,.1,1.66,.06);
  box(parent,m.slab,X1-.14,.47,0,.3,.05,3.3);

  // ——— Umivaonik na -Z zidu: drvena ploča, posuda od porcelana, mesingana slavina ———
  const VX=.9,VZ=-Z+.3;
  box(parent,m.timber,VX,.62,VZ,2.2,.34,.5);
  box(parent,m.lamp,VX,.43,VZ+.02,2.1,.02,.44);                // topla LED traka ispod ploče
  box(parent,stone,VX,.8,VZ,2.3,.04,.54);
  // Posuda: nizak cilindar + unutrašnji "otvor" (tamniji disk).
  rod(parent,ceramic,[VX,.82,VZ],[VX,1.0,VZ],.26);
  rod(parent,stone,[VX,.995,VZ],[VX,1.005,VZ],.21);
  rod(parent,brass,[VX,.82,VZ-.2],[VX,1.28,VZ-.2],.018);
  rod(parent,brass,[VX,1.28,VZ-.2],[VX,1.28,VZ-.02],.016);
  rod(parent,brass,[VX,1.28,VZ-.02],[VX,1.2,VZ-.02],.014);
  // Okruglo ogledalo sa tankim mesinganim obodom.
  rod(parent,brass,[VX,1.62,-Z+.06],[VX,1.62,-Z+.08],.43);
  rod(parent,m.glass,[VX,1.62,-Z+.08],[VX,1.62,-Z+.1],.4);
  box(parent,m.white,VX+1.45,1.05,-Z+.08,.36,.62,.06);          // peškir

  // ——— Tuš u uglu (-Z, +X) ———
  box(parent,showerGlass,2.3,1.05,-1.55,1.9,2.1,.02);
  box(parent,m.frame,1.37,1.05,-1.55,.04,2.1,.04);
  rod(parent,brass,[3.3,2.05,-2.2],[3.05,2.05,-2.2],.014);
  rod(parent,brass,[3.05,2.05,-2.2],[3.05,2.0,-2.2],.1);
  box(parent,m.steel,2.4,.05,-2.2,.6,.02,.08);

  // ——— WC na +Z zidu (konzolni) ———
  box(parent,ceramic,1.6,.45,Z-.34,.4,.36,.56);
  box(parent,ceramic,1.6,.65,Z-.36,.42,.05,.58);
  box(parent,stone,1.6,1.05,Z-.1,.7,.12,.14);

  // ——— Biljka uz prozor ———
  box(parent,m.pale,2.9,.2,2.1,.3,.4,.3);
  box(parent,plantGreen,2.9,.62,2.1,.52,.46,.52);
  box(parent,plantGreen,2.8,.9,2.18,.22,.26,.22);
}
