import * as THREE from '../vendor/three.module.min.js';

// Završna faza zgrade na koju kran spušta paletu: posle dostave zgrada se "dovrši" sprat po
// sprat — fasadni zidovi, prozori sa grafitnim ramovima, balkoni sa staklenom ogradom i
// palete blokova na balkonu. Svaki sprat raste odozdo (scale.y iz svoje ploče), kao i
// ostatak gradilišta, pa se uklapa u isti vizuelni jezik.
//
// Koordinate su lokalne za zgradu: x -3.5..3.5, z -3..3. Sprat f počinje na f*2.35 + .2.
// Sprat ENTRY ima otvorena balkonska vrata sprijeda (+Z) i veliki otvor na +X strani —
// kroz njih kamera ulazi u kupatilo i izlazi u nebo (vidi buildTowerBath).
export const ENTRY=2;
const W=7,D=6,STOREY=2.35,H=2.15,T=.14;

export function buildFinish({parent,box,rod,group,batch,m,pallet,storeys=4}) {
  const railGlass=new THREE.MeshStandardMaterial({color:'#e3ebee',roughness:.15,metalness:0,transparent:true,opacity:.28,depthWrite:false});

  // Zid sa pravougaonim otvorima. `axis` je osa duž koje zid ide ('x' za ±Z fasade, 'z' za ±X),
  // `at` je koordinata ravni zida, `openings` su {c,w,y0,y1} u koordinatama duž zida.
  function wall(g,axis,at,from,to,openings,material=m.facade) {
    const put=(c,len,y,h)=>{
      if(len<=.01||h<=.01)return;
      if(axis==='x')box(g,material,c,y,at,len,h,T);else box(g,material,at,y,c,T,h,len);
    };
    let cursor=from;
    for(const o of [...openings].sort((a,b)=>a.c-b.c)) {
      const a=o.c-o.w/2,b=o.c+o.w/2;
      put((cursor+a)/2,a-cursor,H/2,H);
      put(o.c,o.w,o.y0/2,o.y0);
      put(o.c,o.w,(o.y1+H)/2,H-o.y1);
      cursor=b;
    }
    put((cursor+to)/2,to-cursor,H/2,H);
  }

  // Prozor u otvoru: staklo, obodni ram, vertikalna podjela i kamena klupčica spolja.
  function glazing(g,axis,at,side,o,glass=true) {
    const cy=(o.y0+o.y1)/2,h=o.y1-o.y0;
    const at2=at+side*.02;
    const b=(x,y,z,sx,sy,sz,mat)=>axis==='x'?box(g,mat,x,y,z,sx,sy,sz):box(g,mat,z,y,x,sz,sy,sx);
    if(glass)b(o.c,cy,at,o.w,h,.03,m.window);
    for(const dx of [-o.w/2,o.w/2])b(o.c+dx,cy,at2,.06,h+.06,.08,m.frame);
    for(const y of [o.y0,o.y1])b(o.c,y,at2,o.w+.06,.06,.08,m.frame);
    if(glass&&o.w>1.2)b(o.c,cy,at2,.04,h,.07,m.frame);
    if(o.y0>.05)b(o.c,o.y0-.04,at+side*.1,o.w+.16,.06,.22,m.slab);
  }

  // Balkon: konzolna ploča, staklena ograda sa grafitnim rukohvatom.
  function balcony(g,x0,x1,depth) {
    const cx=(x0+x1)/2,len=x1-x0,z=D/2+depth/2;
    box(g,m.slab,cx,-.1,z,len,.2,depth);
    box(g,railGlass,cx,.55,D/2+depth-.03,len,.9,.02);
    for(const x of [x0+.03,x1-.03])box(g,railGlass,x,.55,z,.02,.9,depth);
    box(g,m.frame,cx,1.02,D/2+depth-.03,len+.04,.045,.06);
    for(const x of [x0+.03,x1-.03])box(g,m.frame,x,1.02,z,.06,.045,depth);
  }

  const floors=[];
  for(let f=0;f<storeys;f++) {
    const g=group(parent,0,f*STOREY+.2,0);
    const entry=f===ENTRY;
    // Prednja fasada (+Z): tri polja; na ulaznom spratu lijevo su balkonska vrata.
    const front=entry
      ?[{c:-1.075,w:1.55,y0:0,y1:2.1},{c:1.9,w:1.7,y0:.45,y1:1.95}]
      :[{c:-2.2,w:1.5,y0:.45,y1:1.95},{c:0,w:1.2,y0:.45,y1:1.95},{c:2.2,w:1.5,y0:.45,y1:1.95}];
    wall(g,'x',D/2+T/2,-W/2,W/2,front,f%2?m.brick:m.facade);
    front.forEach((o,i)=>glazing(g,'x',D/2+T/2,1,o,!(entry&&i===0)));
    // Zadnja fasada (-Z).
    const back=[{c:-1.8,w:1.5,y0:.45,y1:1.95},{c:1.8,w:1.5,y0:.45,y1:1.95}];
    wall(g,'x',-D/2-T/2,-W/2,W/2,back);
    back.forEach(o=>glazing(g,'x',-D/2-T/2,-1,o));
    // Bočne fasade; na ulaznom spratu +X ima veliki otvor bez stakla (izlaz u nebo).
    const east=entry?[{c:0,w:3.2,y0:.5,y1:2.1}]:[{c:-1.3,w:1.3,y0:.45,y1:1.95},{c:1.3,w:1.3,y0:.45,y1:1.95}];
    wall(g,'z',W/2+T/2,-D/2-T,D/2+T,east);
    if(!entry)east.forEach(o=>glazing(g,'z',W/2+T/2,1,o));
    const west=[{c:0,w:1.3,y0:.45,y1:1.95}];
    wall(g,'z',-W/2-T/2,-D/2-T,D/2+T,west);
    west.forEach(o=>glazing(g,'z',-W/2-T/2,-1,o));
    // Venac ploče: tanka traka koja razdvaja spratove na fasadi.
    box(g,m.slab,0,-.1,D/2+T+.02,W+2*T+.04,.2,.06);
    box(g,m.slab,0,-.1,-D/2-T-.02,W+2*T+.04,.2,.06);

    // Balkoni na spratovima 1 i 3 (ne na ulaznom — kamera tu prolazi), paleta blokova na prvom.
    if(f===1||f===3) {
      balcony(g,-3.3,3.3,1.3);
      if(f===1)pallet(g,1.6,0,D/2+.66,true,1);
    }
    batch(g);
    floors.push({group:g,at:f});
  }

  // Rast: sprat f počinje u `start + f*step` i traje `span`.
  function update(p,start,step,span) {
    for(const fl of floors) {
      const t=THREE.MathUtils.clamp((p-(start+fl.at*step))/span,0,1);
      const k=t*t*(3-2*t);
      fl.group.visible=k>.001;
      fl.group.scale.y=Math.max(.001,k);
    }
  }
  return {update,floors};
}
