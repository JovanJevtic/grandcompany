import * as THREE from '../vendor/three.module.min.js';

// Enterijer za završnu chapter-u: kratak hodnik -> kupatilo -> prozor u nebo.
//
// Namjerno je "kulisа": nema vrata ni plafona (gornja ploča zgrade je plafon), a prozor
// nema zatamnjeno staklo — kroz otvor se vidi nebo koje je ionako iza providnog canvasa.
// Sve boje prate istu visoko-svetlu, mat paletu kao i scena (ivory, svetlo drvo, grafit).
//
// Lokalne koordinate: x je pravac kretanja kamere (-5 ulaz -> +5 prozor), z je širina,
// y počinje od poda sprata. Grupa se pozicionira na osnovu sprata u kome se nalazi.
export function buildInterior({parent,box,rod,m}) {
  // Staklo kroz koje se vidi nebo mora biti skoro nevidljivo; staklo tuša je malo vidljivije.
  const windowGlass=new THREE.MeshStandardMaterial({color:'#eef4f8',roughness:.12,metalness:0,transparent:true,opacity:.07,depthWrite:false});
  const showerGlass=new THREE.MeshStandardMaterial({color:'#e9eff2',roughness:.18,metalness:0,transparent:true,opacity:.16,depthWrite:false});
  const plantGreen=new THREE.MeshStandardMaterial({color:'#c7d0c2',roughness:.9});
  const ceramic=new THREE.MeshStandardMaterial({color:'#f2f0eb',roughness:.4,metalness:.02});
  // Čist, mat zid bez betonskog šablona sa fasade (kupatilo je gletovano, ne oplata).
  const wall=new THREE.MeshStandardMaterial({color:'#efece6',roughness:.93,metalness:0});

  // ——— Podovi ———
  box(parent,m.pale,2,.02,0,6.0,.04,5.9);      // kupatilo
  box(parent,m.pale,-2.9,.02,0,4.2,.04,2.6);   // hodnik
  for(let x=-1;x<5;x+=1.2)box(parent,m.joint,x,.045,0,.02,.004,5.9);
  for(let z=-2.8;z<3.2;z+=1.2)box(parent,m.joint,2,.045,z,6.0,.004,.02);

  // ——— Zidovi (otvoreni odozgo) ———
  for(const side of [-1,1]) {
    box(parent,wall,-2.9,1.15,side*1.3,4.2,2.3,.12);   // hodnik
    box(parent,wall,2.1,1.15,side*2.95,5.8,2.3,.12);   // kupatilo
  }
  // Čeoni zid sa velikim prozorskim otvorom (y .95-1.95, z -1.9..1.9).
  box(parent,wall,5,.475,0,.12,.95,5.9);               // parapet
  for(const side of [-1,1])box(parent,wall,5,1.45,side*2.45,.12,1.0,1.1);
  box(parent,wall,5,2.125,0,.12,.35,5.9);              // greda iznad otvora
  // Okvir prozora (grafit) + klupčica + skoro nevidljivo staklo.
  box(parent,m.frame,5,.93,0,.1,.07,3.9);
  box(parent,m.frame,5,1.97,0,.1,.07,3.9);
  for(const side of [-1,1])box(parent,m.frame,5,1.45,side*.95,.06,1.04,.06);
  for(const side of [-1,1])box(parent,m.frame,5,1.45,side*1.93,.08,1.06,.07);
  box(parent,m.slab,4.86,.9,0,.34,.06,4.1);
  box(parent,windowGlass,5.0,1.45,0,.02,1.0,3.86);

  // ——— Kupatilo: umivaonik, ogledalo, svetlo, peškiri ———
  box(parent,m.timber,1.6,.5,-2.6,1.9,.72,.52);
  box(parent,m.pale,1.6,.88,-2.6,2.0,.06,.56);
  box(parent,ceramic,1.6,.95,-2.6,.62,.13,.44);
  rod(parent,m.galvanized,[1.6,1.02,-2.83],[1.6,1.22,-2.72],.022);
  rod(parent,m.galvanized,[1.6,1.22,-2.72],[1.6,1.22,-2.6],.018);
  box(parent,m.glass,1.6,1.6,-2.9,1.05,.75,.02);
  box(parent,m.frame,1.6,1.6,-2.87,1.12,.82,.012);
  box(parent,m.lamp,1.6,2.03,-2.9,.7,.05,.05);
  box(parent,m.white,.2,.85,-2.9,.35,.5,.06);
  box(parent,m.white,.2,.28,-2.9,.35,.5,.06);
  rod(parent,m.frame,[2.7,1.25,-2.9],[1.5,1.25,-2.9],.018);

  // ——— Tuš (staklo, slivnik, niša) ———
  box(parent,showerGlass,3.05,1.15,2.2,.02,2.3,1.5);
  box(parent,m.frame,3.05,1.15,1.5,.05,2.3,.05);
  rod(parent,m.galvanized,[4.5,2.28,2.62],[4.5,2.06,2.2],.02);
  box(parent,m.pale,4.5,2.3,2.75,.22,.03,.22);
  rod(parent,m.galvanized,[4.5,1.06,2.78],[4.5,1.24,2.7],.028);
  box(parent,m.pale,4.5,1.35,2.9,.7,.4,.06);
  box(parent,m.steel,4.0,.05,2.2,.5,.02,.1);

  // ——— WC ———
  box(parent,ceramic,1.1,.45,2.5,.42,.4,.6);
  box(parent,ceramic,1.1,.66,2.44,.44,.06,.62);
  box(parent,ceramic,1.1,.95,2.82,.5,.5,.14);

  // ——— Detalji: klupa u hodniku, biljka ———
  box(parent,m.timber,-2.9,.32,-1.02,1.7,.07,.42);
  for(const x of [-3.6,-2.2])box(parent,m.frame,x,.16,-1.02,.05,.32,.38);
  box(parent,m.pale,4.4,.18,.2,.26,.36,.26);
  box(parent,plantGreen,4.4,.6,.2,.48,.46,.48);
  box(parent,plantGreen,4.25,.86,.28,.2,.24,.2);
}
