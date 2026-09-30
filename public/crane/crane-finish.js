import * as THREE from '../vendor/three.module.min.js';

// Završna faza zgrade na koju kran spušta paletu: posle dostave zgrada se "dovrši" sprat po
// sprat. Jezik prati reference: svijetla kamena fasada sa finim fugama, ugaoni pilastri i
// istaknuti pojas na svakoj ploči, prozori od poda do plafona uvučeni u zid (grafitni ramovi,
// staklo koje odražava nebo, zavjese iza za dubinu), balkoni sa staklenom ogradom i mesinganim
// rukohvatom, žardinjere sa zelenilom i palete blokova. Svaki sprat raste odozdo (scale.y iz
// svoje ploče), kao i ostatak gradilišta.
//
// Koordinate su lokalne za zgradu: x -3.5..3.5, z -3..3. Sprat f počinje na f*2.35 + .2.
// Sprat ENTRY ima otvorena balkonska vrata sprijeda (+Z, x -1.85..-0.3) i veliki otvor na +X
// strani (z -1.6..1.6, y .5..2.1) — kroz njih kamera ulazi u kupatilo i izlazi u nebo.
export const ENTRY=2;
const W=7,D=6,STOREY=2.35,H=2.15,T=.16;

export function buildFinish({parent,box,rod,group,batch,m,pallet,storeys=4}) {
  const mat=(color,roughness,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  const stone=mat('#ece7de',.86);
  const stoneDeep=mat('#e2dbcf',.9);       // pilastri i pojasevi — ton dublje, da se čitaju
  const joint=mat('#d3cbbd',.95);
  const brass=mat('#b89a6a',.34,.72);
  const frame=mat('#5f6468',.5,.35);
  const glass=mat('#c3d1da',.12,.2);        // odražava okruženje (scene.environment)
  const curtain=mat('#f1ece3',.95);
  const planter=mat('#ddd6ca',.9);
  const green=mat('#b7c4ae',.9);
  const greenDeep=mat('#a3b39b',.9);
  const railGlass=new THREE.MeshStandardMaterial({color:'#e3ebee',roughness:.1,metalness:.05,transparent:true,opacity:.26,depthWrite:false});

  // Zid sa pravougaonim otvorima (kamen + fine horizontalne fuge na punim dijelovima).
  // `axis` je osa duž koje zid ide ('x' za ±Z fasade, 'z' za ±X), `at` ravan zida, `side`
  // smjer spolja, `openings` su {c,w,y0,y1} duž zida.
  function wall(g,axis,at,side,from,to,openings) {
    const put=(c,len,y,h)=>{
      if(len<=.01||h<=.01)return;
      if(axis==='x')box(g,stone,c,y,at,len,h,T);else box(g,stone,at,y,c,T,h,len);
      // Fuge kamenih ploča: tanke linije na spoljnoj strani, na ~0.45 m.
      for(let jy=y-h/2+.45;jy<y+h/2-.05;jy+=.45)
        if(axis==='x')box(g,joint,c,jy,at+side*(T/2+.002),len,.012,.006);
        else box(g,joint,at+side*(T/2+.002),jy,c,.006,.012,len);
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

  // Prozor uvučen u zid: špaleta (dubina), tanki ram, staklo, podjela i zavjesa iza.
  function glazing(g,axis,at,side,o,{glass:withGlass=true,curtainSide=1}={}) {
    const cy=(o.y0+o.y1)/2,h=o.y1-o.y0,inset=at-side*.06;
    const b=(x,y,z,sx,sy,sz,material)=>axis==='x'?box(g,material,x,y,z,sx,sy,sz):box(g,material,z,y,x,sz,sy,sx);
    // Špaleta: unutrašnje stranice otvora u dubljem kamenu.
    for(const dx of [-o.w/2,o.w/2])b(o.c+dx,cy,at,.05,h,T+.01,stoneDeep);
    b(o.c,o.y1,at,o.w,.05,T+.01,stoneDeep);
    if(withGlass) {
      b(o.c,cy,inset,o.w-.04,h-.04,.025,glass);
      if(o.w>1.3)b(o.c,cy,inset+side*.015,.035,h,.05,frame);
      // Zavjesa iza stakla na jednoj strani — daje dubinu i "nastanjenost".
      b(o.c+curtainSide*o.w*.28,cy+.02,inset-side*.12,o.w*.34,h-.12,.02,curtain);
    }
    for(const dx of [-o.w/2+.02,o.w/2-.02])b(o.c+dx,cy,inset+side*.015,.04,h,.05,frame);
    for(const y of [o.y0+.02,o.y1-.02])b(o.c,y,inset+side*.015,o.w,.04,.05,frame);
    // Kamena klupčica spolja (samo kad otvor ne ide do poda).
    if(o.y0>.05)b(o.c,o.y0-.03,at+side*.1,o.w+.18,.06,.2,stoneDeep);
  }

  // Balkon: konzolna ploča, staklena ograda sa mesinganim rukohvatom, žardinjere.
  function balcony(g,x0,x1,depth,plants=true) {
    const cx=(x0+x1)/2,len=x1-x0,z=D/2+depth/2,front=D/2+depth;
    box(g,stoneDeep,cx,-.11,z,len,.22,depth);
    box(g,joint,cx,-.005,front-.02,len,.01,.02);
    box(g,railGlass,cx,.55,front-.04,len-.04,.92,.02);
    for(const x of [x0+.04,x1-.04])box(g,railGlass,x,.55,z,.02,.92,depth-.06);
    box(g,brass,cx,1.03,front-.04,len+.02,.04,.05);
    for(const x of [x0+.04,x1-.04])box(g,brass,x,1.03,z,.05,.04,depth-.04);
    // Tanki mesingani nosači stakla.
    for(let x=x0+.5;x<x1-.3;x+=1.4)box(g,brass,x,.1,front-.04,.05,.06,.06);
    if(plants)for(const x of [x0+.45,x1-.45]) {
      box(g,planter,x,.22,front-.32,.62,.44,.36);
      box(g,green,x,.56,front-.32,.56,.3,.3);
      box(g,greenDeep,x+.12,.76,front-.3,.24,.22,.2);
    }
  }

  // Pilastri na uglovima i pojas na ploči: vertikalni i horizontalni ritam fasade.
  function frameOfStorey(g) {
    for(const sx of [-1,1])for(const sz of [-1,1])
      box(g,stoneDeep,sx*(W/2+T/2),H/2,sz*(D/2+T/2),.34,H,.34);
    for(const sz of [-1,1])box(g,stoneDeep,0,-.1,sz*(D/2+T+.03),W+2*T+.12,.22,.08);
    for(const sx of [-1,1])box(g,stoneDeep,sx*(W/2+T+.03),-.1,0,.08,.22,D+2*T+.12);
  }

  const floors=[];
  for(let f=0;f<storeys;f++) {
    const g=group(parent,0,f*STOREY+.2,0);
    const entry=f===ENTRY;
    // Prednja fasada (+Z): prozori od poda do plafona; na ulaznom spratu lijevo su vrata.
    const front=entry
      ?[{c:-1.075,w:1.55,y0:0,y1:2.1},{c:1.9,w:1.9,y0:.05,y1:2.0}]
      :[{c:-2.2,w:1.7,y0:.05,y1:2.0},{c:0,w:1.3,y0:.05,y1:2.0},{c:2.2,w:1.7,y0:.05,y1:2.0}];
    wall(g,'x',D/2+T/2,1,-W/2,W/2,front);
    front.forEach((o,i)=>glazing(g,'x',D/2+T/2,1,o,{glass:!(entry&&i===0),curtainSide:i%2?-1:1}));
    // Zadnja fasada (-Z).
    const back=[{c:-1.8,w:1.6,y0:.45,y1:2.0},{c:1.8,w:1.6,y0:.45,y1:2.0}];
    wall(g,'x',-D/2-T/2,-1,-W/2,W/2,back);
    back.forEach(o=>glazing(g,'x',-D/2-T/2,-1,o));
    // Bočne fasade; na ulaznom spratu +X ima veliki otvor bez stakla (izlaz u nebo).
    const east=entry?[{c:0,w:3.2,y0:.5,y1:2.1}]:[{c:-1.3,w:1.4,y0:.3,y1:2.0},{c:1.3,w:1.4,y0:.3,y1:2.0}];
    wall(g,'z',W/2+T/2,1,-D/2-T,D/2+T,east);
    east.forEach(o=>glazing(g,'z',W/2+T/2,1,o,{glass:!entry}));
    const west=[{c:0,w:1.4,y0:.3,y1:2.0}];
    wall(g,'z',-W/2-T/2,-1,-D/2-T,D/2+T,west);
    west.forEach(o=>glazing(g,'z',-W/2-T/2,-1,o));
    frameOfStorey(g);

    // Balkoni sprijeda na svim spratovima osim prizemlja; paleta blokova na prvom.
    // Na ulaznom spratu ograda je niža od pogleda kamere, pa ona prolazi iznad nje.
    if(f>0) {
      balcony(g,-3.3,3.3,1.25,!entry);
      if(f===1)pallet(g,.9,0,D/2+.64,true,1);
    }
    // Vrh: kamena atika iznad posljednjeg sprata.
    if(f===storeys-1) {
      for(const sz of [-1,1])box(g,stoneDeep,0,H+.36,sz*(D/2+T/2),W+2*T,.3,T+.02);
      for(const sx of [-1,1])box(g,stoneDeep,sx*(W/2+T/2),H+.36,0,T+.02,.3,D+2*T);
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
