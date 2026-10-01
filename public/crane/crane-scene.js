import * as THREE from '../vendor/three.module.min.js';
import {craneRigKit} from './crane-rig.js?v=18';
import {applyConstructionSurfaces} from './crane-surfaces.js?v=18';
import {RoundedBoxGeometry} from '../vendor/three-addons/geometries/RoundedBoxGeometry.js';
import {createDeliveryEffects} from './crane-effects.js?v=7';
import {detailKit} from './crane-details.js?v=18';

import {architectureKit} from './crane-architecture.js?v=14';
import {createSiteActivity} from './crane-activity.js?v=11';
import {buildTowerBath} from './crane-interior.js?v=4';
import {buildFinish,ENTRY} from './crane-finish.js?v=4';

export const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
export const smooth = (a, b, p) => { const t = clamp((p-a)/(b-a)); return t*t*(3-2*t); };
const mix = THREE.MathUtils.lerp;

// Do ovde traje postojeća priča (kran, dostava, gradilište). Ostatak skrola je nova
// chapter-a: zgrada sa paletom se dovrši sprat po sprat, kamera uđe kroz balkonska vrata
// u kupatilo i izađe kroz prozor u nebo. Sve staro se računa u "story vremenu"
// (progress / STORY_END), a završna chapter-a koristi sirovi progress.
export const STORY_END = .56;
const LOAD_SCALE = 1.22;
// Visina gornje ivice krova zgrade (vidi crane-finish: 4 sprata + krovna ploča) — tu sleće paleta.
const ROOF_Y = 9.62;

// One world, one anchored mast, one payload. All keyframes are reversible.
export function choreography(progress) {
  const p = clamp(progress / .95);
  // Establish the head, make one brief slew, approach the load, reveal the site.
  const keys = [
    // Establish the working head, track toward the cargo, then reveal its destination.
    [0,   1.30, .25, 32, -2, 24.4, 8, -1.15, 20.5],
    [.18, 1.04, .08, 28,  3, 24, 1, 0, 20.5],
    [.34,  .80, .16, 26,  2.5, 21.3, 0, 0, 18.6],
    [.48,  .82, .29, 36,  5, 16.3, -1, 0, 16.5],
    [.73,  .96, .36, 53,  3, 12, -2, 0, 12.8],
    [.84,  .90, .29, 36,  6, 11.8, -1, 0, 10.6],
    [1,    .80, .20, 16.5, 8.7, 11.2, -.5, 0, 9.62],
  ];
  const i = Math.min(keys.length-2, Math.max(0, keys.findIndex(k => k[0] > p)-1));
  const a = p === 1 ? keys[keys.length-2] : keys[i];
  const b = p === 1 ? keys[keys.length-1] : keys[i+1];
  const t = smooth(a[0], b[0], p);
  const v = a.map((n,j)=>mix(n,b[j],t));
  return { azimuth:v[1], elevation:v[2], distance:v[3], target:[v[4],v[5],v[6]], slew:v[7], loadY:v[8], site:smooth(.46,.62,p), slack:smooth(.975,1,p), chapter:p<.2?0:p<.5?1:p<.99?2:3 };
}

export function createCraneScene() {
  const scene = new THREE.Scene();
  const mat = (color, roughness=.85, metalness=0) => new THREE.MeshStandardMaterial({color,roughness,metalness});
  // ——— Paleta: visoki ključ, gotovo bijeli arhitektonski render ———
  // Sve boje su namjerno svijetle i desaturirane. Scena je 80–90% bijela/ivory;
  // grafit ide samo na kablove, čelične šipke i sitne konstruktivne detalje.
  // Sve je mat (visok roughness, nizak metalness) — bez sjaja i "igračkastog" PBR-a.
  const PALETTE = {
    crane: '#d1c4ae',      // topla bež — konstrukcija krana (nekada mustard žuta)
    craneEdge: '#bfb29a',  // malo dublja bež — ivice, prirubnice, zupčanici
    steel: '#62676b',      // grafit — kablovi, šipke, sitni čelik
    galvanized: '#c9c8c2', // svijetli pocinkovani čelik
    frame: '#6e7377',      // grafitni ramovi (prozori, konzole, rešetka)
    concrete: '#e2e0da',   // vrlo svijetli beton
    slab: '#e8e5de',       // ploče, stepenice, ivičnjaci
    brick: '#d9cfc3',      // blijeda, prigušena cigla
    facade: '#e4e1d8',     // fasada
    pale: '#e8e5de',       // palete / građevinski materijal
    white: '#f1efea',      // kabina, kontejneri, kamion, rampe
    timber: '#e6dfd0',     // svijetlo drvo
    darkWood: '#cfc6b4',   // noge palete
    formwork: '#e0d6c4',   // svijetla oplata
    earth: '#ded8ce',      // iskop — svijetla zemlja
    asphalt: '#d9dcde',    // svijetli asfalt
    paving: '#e4e7e9',     // popločanje
    ground: '#e4e9ec',     // plato — stapa se sa nebom
    line: '#fbfcfd',       // horizontalna signalizacija
    joint: '#c9cdd1',      // dilatacije i fuge
    blue: '#aeb8bd',       // prigušena plavo-siva (vrata, ograde, rukovalac)
    red: '#c0a79e',        // prigušena glina (zaštitne noge, rampe)
    rubber: '#6e7276',     // guma i crijeva
    skin: '#dcc7b8',       // rukovalac
    cargo: '#d9cfc3',      // keramički blokovi
    sling: '#62676b',      // trake za vezivanje
    hazard: '#ffffff',     // rampe bez crno-žutih pruga (samo tih ton-na-ton)
    lamp: '#fff9ee',       // stakla lampi
    glass: '#ccd7db',      // staklo (kabina, kamion)
    window: '#c8d2d6',     // staklo na zgradama
    net: '#d6dad8',        // zaštitna mreža skele
  };
  const m = {
    yellow:mat(PALETTE.crane,.84,.02), edge:mat(PALETTE.craneEdge,.86,.02),
    steel:mat(PALETTE.steel,.7,.2), concrete:mat(PALETTE.concrete,.96),
    slab:mat(PALETTE.slab,.95), brick:mat(PALETTE.brick,.95),
    timber:mat(PALETTE.timber,.9), pale:mat(PALETTE.pale,.9),
    white:mat(PALETTE.white,.86), glass:mat(PALETTE.glass,.38,.06),
    rubber:mat(PALETTE.rubber,.85), ground:mat(PALETTE.ground,.92,.02),
    line:mat(PALETTE.line,.9), blue:mat(PALETTE.blue,.85), darkWood:mat(PALETTE.darkWood,.9),
    skin:mat(PALETTE.skin,.9), net:mat(PALETTE.net,1), red:mat(PALETTE.red,.85),
    joint:mat(PALETTE.joint,.95), hazard:mat(PALETTE.hazard,.9), lamp:mat(PALETTE.lamp,.4),
    earth:mat(PALETTE.earth,1), facade:mat(PALETTE.facade,.88),
    frame:mat(PALETTE.frame,.6,.28), formwork:mat(PALETTE.formwork,.9),
    asphalt:mat(PALETTE.asphalt,.95), galvanized:mat(PALETTE.galvanized,.8,.1),
    cargo:mat(PALETTE.cargo,.95), sling:mat(PALETTE.sling,.85),
    paving:mat(PALETTE.paving,.9), window:mat(PALETTE.window,.38,.07),
  };
  m.glass.transparent=true;m.glass.opacity=.78;
  // U linijskom crtežu zgrade dio prozora ostaje u tačkama (crane-print bira koje, po položaju).
  m.window.userData.printDots=true;m.glass.userData.printDots=true;
  m.net.transparent=true;m.net.opacity=.35;m.net.side=THREE.DoubleSide;
  if(typeof document!=='undefined') {
    // Fine surface relief keeps the model an illustration with tangible materials.
    let seed=711;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    const surface=document.createElement('canvas');surface.width=surface.height=512;
    const ctx=surface.getContext('2d'),pixels=ctx.createImageData(512,512);
    for(let i=0;i<pixels.data.length;i+=4) {const shade=182+random()*58;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=shade;pixels.data[i+3]=255;}
    ctx.putImageData(pixels,0,0);
    const grain=new THREE.CanvasTexture(surface);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(3,3);
    for(const name of ['concrete','slab','pale','brick']) {m[name].bumpMap=grain;m[name].bumpScale=.012;m[name].roughnessMap=grain;}
    // Broad color variation reads as cast concrete; the fine grain provides relief.
    const stone=surface.cloneNode();stone.width=stone.height=1024;const sc=stone.getContext('2d');sc.scale(4,4);sc.fillStyle='#f0eeea';sc.fillRect(0,0,256,256);
    for(let i=0;i<2600;i++){const value=168+random()*72;sc.fillStyle=`rgba(${value},${value},${value},.05)`;sc.fillRect(random()*256,random()*256,random()*5+1,random()*2+1);}
    for(let y=0;y<256;y+=64){sc.fillStyle='rgba(150,144,132,.035)';sc.fillRect(0,y,256,1);}
    const stoneMap=new THREE.CanvasTexture(stone);stoneMap.colorSpace=THREE.SRGBColorSpace;
    for(const name of ['concrete','slab'])m[name].map=stoneMap;
    const stripes=surface.cloneNode();stripes.width=stripes.height=1024;const hc=stripes.getContext('2d');hc.scale(4,4);hc.fillStyle='#efede7';hc.fillRect(0,0,256,256);hc.strokeStyle='#dedad1';hc.lineWidth=30;
    for(let x=-256;x<512;x+=80){hc.beginPath();hc.moveTo(x,0);hc.lineTo(x+256,256);hc.stroke();}
    m.hazard.map=new THREE.CanvasTexture(stripes);m.hazard.map.colorSpace=THREE.SRGBColorSpace;m.hazard.color.set('#ffffff');
    const netCanvas=document.createElement('canvas');netCanvas.width=netCanvas.height=64;
    const nc=netCanvas.getContext('2d');nc.strokeStyle='#ffffff';nc.lineWidth=2;
    for(let i=0;i<=64;i+=16){nc.beginPath();nc.moveTo(i,0);nc.lineTo(i,64);nc.moveTo(0,i);nc.lineTo(64,i);nc.stroke();}
    m.net.map=new THREE.CanvasTexture(netCanvas);m.net.map.wrapS=m.net.map.wrapT=THREE.RepeatWrapping;m.net.map.repeat.set(4,3);m.net.alphaTest=.1;
    const wood=surface.cloneNode();wood.width=wood.height=1024;const wc=wood.getContext('2d');wc.scale(4,4);wc.fillStyle='#c9b898';wc.fillRect(0,0,256,256);
    for(let i=0;i<300;i++){wc.strokeStyle=`rgba(65,45,20,${random()*.3})`;wc.beginPath();const y=random()*256;wc.moveTo(0,y);wc.bezierCurveTo(90,y+random()*5,180,y-random()*5,256,y);wc.stroke();}
    m.timber.bumpMap=new THREE.CanvasTexture(wood);m.timber.bumpScale=.035;
  }
  applyConstructionSurfaces(m);
  // Štampa u tačkama (crane-print.js): `userData.ink` je količina mastila materijala (0 = papir,
  // 1 = puno mastilo). Kran i sav čelik su puno mastilo kao na referencama; ostalo se računa iz boje.
  for(const k of ['yellow','edge','steel','rubber','sling','frame'])m[k].userData.ink=1;
  m.concrete.userData.ink=.14;m.slab.userData.ink=.1;
  const boxGeo = new THREE.BoxGeometry(1,1,1);
  const roundedBoxGeo = new RoundedBoxGeometry(1,1,1,1,.009);
  // Šipke: broj strana prema debljini. Tanki kablovi, armatura i ograde (većina od ~5000 šipki)
  // se na ovoj udaljenosti ne razlikuju sa 8 ili 20 strana, a koštaju 2.5x manje trouglova.
  // Debele šipke i sve u enterijeru (vidi se izbliza) ostaju glatke.
  const rodGeo = new THREE.CylinderGeometry(1,1,1,20);
  const rodGeoMid = new THREE.CylinderGeometry(1,1,1,12);
  const rodGeoThin = new THREE.CylinderGeometry(1,1,1,8);
  const unitY = new THREE.Vector3(0,1,0);
  function group(parent,x=0,y=0,z=0) { const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g; }
  function mesh(parent,geo,material,x,y,z,sx,sy,sz) {
    const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=![m.ground,m.asphalt,m.paving].includes(material);o.receiveShadow=true;parent.add(o);return o;
  }
  const box=(g,material,x,y,z,w,h,d)=>mesh(g,[m.pale,m.yellow,m.white].includes(material)?roundedBoxGeo:boxGeo,material,x,y,z,w,h,d);
  function rod(g,material,a,b,r=.045,fine=false) {
    const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);
    const geo=fine||r>=.12?rodGeo:r>=.035?rodGeoMid:rodGeoThin;
    const o=mesh(g,geo,material,...av.add(bv).multiplyScalar(.5).toArray(),r,delta.length(),r);
    o.quaternion.setFromUnitVectors(unitY,delta.normalize());return o;
  }
  function profile(g,material,a,b,width=.12) {
    const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);
    const o=box(g,material,...av.add(bv).multiplyScalar(.5).toArray(),width,delta.length(),width);
    o.quaternion.setFromUnitVectors(unitY,delta.normalize());return o;
  }
  // Batch repeated structural parts into GPU instances per independently animated group.
  function batch(g) {
    const buckets=new Map();
    for(const o of [...g.children]) {
      if(!o.isMesh)continue;
      const key=o.geometry.uuid+o.material.uuid;
      if(!buckets.has(key))buckets.set(key,[]);
      buckets.get(key).push(o);
    }
    for(const items of buckets.values()) {
      const inst=new THREE.InstancedMesh(items[0].geometry,items[0].material,items.length);
      items.forEach((o,i)=>{o.updateMatrix();inst.setMatrixAt(i,o.matrix);g.remove(o);});
      inst.castShadow=![m.ground,m.asphalt,m.paving].includes(inst.material);inst.receiveShadow=true;g.add(inst);
    }
  }
  // Once assembled, the entire site can share a handful of instanced draws.
  // `floorList` povezuje svaku instancu sa spratom iz kog je došla: tako spratovi mogu
  // da rastu i posle spajanja (instanced) — čuvamo im osnovnu matricu i trenutak `at`.
  function flatten(root,floorList) {
    const floorOf=new Map();
    for(const f of floorList||[])f.group.traverse(o=>{if(o.isMesh)floorOf.set(o,f);});
    root.updateWorldMatrix(true,true);
    const inverse=root.matrixWorld.clone().invert(),buckets=new Map(),matrix=new THREE.Matrix4();
    root.traverse(o=>{
      if(!o.isMesh)return;
      const key=o.geometry.uuid+o.material.uuid;
      if(!buckets.has(key))buckets.set(key,{geometry:o.geometry,material:o.material,matrices:[],growth:[]});
      const info=floorOf.get(o)||null,local=inverse.clone().multiply(o.matrixWorld);
      const bucket=buckets.get(key);
      if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);bucket.matrices.push(local.clone().multiply(matrix));bucket.growth.push(info);}
      else {bucket.matrices.push(local);bucket.growth.push(info);}
    });
    const result=new THREE.Group();
    for(const b of buckets.values()){
      const inst=new THREE.InstancedMesh(b.geometry,b.material,b.matrices.length);
      b.matrices.forEach((matrix,i)=>inst.setMatrixAt(i,matrix));inst.castShadow=![m.ground,m.asphalt,m.paving].includes(inst.material);inst.receiveShadow=true;
      // Sav materijal ide u iste draw pozive kao i pre; samo instance sa spratom dobijaju
      // mogućnost da rastu (osnovna matrica + visina osnove + `at`).
      if(b.growth.some(Boolean)){inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);inst.userData.growthBase=new Float32Array(inst.instanceMatrix.array);inst.userData.growthInfo=b.growth.map(v=>v?{y:v.height,at:v.at}:null);}
      result.add(inst);
    }
    return result;
  }
  const details=detailKit({box,rod,group,batch,m});
  const rig=craneRigKit({box,rod,group,batch,m});
  const architecture=architectureKit({box,rod,group,batch,m});
  const SIMPLE_CRANE=true;
  const crane=group(scene,-7,0,0);
  // Štampa: kran se crta samo linijama (obrisi), bez tačaka i punog mastila — vidi crane-print.
  crane.userData.printLine=true;
  box(crane,m.concrete,0,.23,0,3.8,.46,3.8);
  for(const x of [-1.3,1.3]) for(const z of [-1.3,1.3]) {
    box(crane,m.steel,x,.5,z,.7,.1,.7);
    box(crane,m.concrete,x,1,z,.85,.9,.85);
    rod(crane,m.yellow,[x,.5,z],[Math.sign(x)*.65,4,Math.sign(z)*.65],.105);
  }
  const mastTop=25;
  for(let y=.5;y<mastTop;y+=2.45) {
    for(const x of [-.68,.68])for(const z of [-.68,.68])profile(crane,m.yellow,[x,y,z],[x,y+2.45,z],.14);
    for(const s of [-1,1]) {
      rod(crane,m.yellow,[-.68,y,s*.68],[.68,y+2.45,s*.68],.045);
      if(!SIMPLE_CRANE)rod(crane,m.yellow,[.68,y,s*.68],[-.68,y+2.45,s*.68],.045);
      rod(crane,m.yellow,[s*.68,y,-.68],[s*.68,y+2.45,.68],.045);
      if(!SIMPLE_CRANE)rod(crane,m.yellow,[s*.68,y,.68],[s*.68,y+2.45,-.68],.045);
      rod(crane,m.yellow,[-.68,y,s*.68],[.68,y,s*.68],.065);
      rod(crane,m.yellow,[s*.68,y,-.68],[s*.68,y,.68],.065);
    }
  }
  // Kran kao crtež u linijama: bez merdevina, prirubnica, platformi i staze (SIMPLE_CRANE = false vraća ih).
  if(!SIMPLE_CRANE) {
    for(let y=1;y<25;y+=.38)rod(crane,m.steel,[-.2,y,.78],[.2,y,.78],.018);
    for(const x of [-.22,.22])rod(crane,m.steel,[x,.5,.78],[x,25,.78],.025);
    details.mast(crane);
  }
  batch(crane);
  const slew=group(crane,0,25,0);
  mesh(slew,rodGeo,m.steel,0,0,0,1.05,.4,1.05);
  box(slew,m.yellow,0,.38,0,2.4,.35,2.4);
  // Triangular truss boom: working jib + short counterjib.
  for(let x=-7;x<19;x+=1.3) {
    const end=Math.min(19,x+1.3);
    for(const z of [-.6,.6]) {
      rod(slew,m.yellow,[x,1,z],[end,1,z],.07);
      rod(slew,m.yellow,[x,1,z],[end,2.25,0],.047);
      rod(slew,m.yellow,[x,2.25,0],[end,1,z],.047);
    }
    rod(slew,m.yellow,[x,2.25,0],[end,2.25,0],.07);
    rod(slew,m.yellow,[x,1,-.6],[x,1,.6],.045);
  }
  for(const z of [-.6,.6])rod(slew,m.yellow,[0,.4,z],[0,5.5,0],.09);
  for(const x of [-6.5,8,17])rod(slew,m.steel,[0,5.5,0],[x,2.2,0],.026);
  for(let x=-7;x<-4;x+=.64)box(slew,m.edge,x,.9,0,.58,2.8,1.6); // kontrateg (u štampi puno mastilo)
  box(slew,m.yellow,-3.5,1.1,0,1.5,.6,.85);
  if(!SIMPLE_CRANE)for(let x=-6;x<1;x+=1) {
    rod(slew,m.yellow,[x,1,.9],[x,2,.9],.025);
    rod(slew,m.yellow,[x,2,.9],[x+1,2,.9],.025);
  }
  if(!SIMPLE_CRANE){details.upper(slew);rig.upper(slew);}
  // Real signage connects the crane to the storefront identity.
  if(!SIMPLE_CRANE&&typeof document!=='undefined') {
    const sign=document.createElement('canvas');sign.width=1024;sign.height=192;
    const sc=sign.getContext('2d');sc.fillStyle='#f7f6f2';sc.fillRect(0,0,1024,192);
    sc.fillStyle='#d6cbb6';sc.fillRect(0,0,180,192);
    sc.fillStyle='#4c5155';sc.font='bold 140px sans-serif';sc.fillText('G',30,149);
    sc.font='bold 92px sans-serif';sc.fillText('GRAND',210,108);
    sc.font='26px sans-serif';sc.fillText('C O M P A N Y',218,155);
    const signTexture=new THREE.CanvasTexture(sign);signTexture.colorSpace=THREE.SRGBColorSpace;
    const signMaterial=new THREE.MeshStandardMaterial({map:signTexture,roughness:.7,metalness:.05});
    for(const side of [-1,1]) {
      const panel=new THREE.Mesh(new THREE.PlaneGeometry(3.4,.64),signMaterial);
      panel.position.set(3.2,1.48,side*.68);panel.rotation.y=side<0?Math.PI:0;
      panel.castShadow=true;panel.receiveShadow=true;slew.add(panel);
    }
  }
  batch(slew);

  // Kablovi duž strijele: u jednostavnom kranu se ne crtaju (ali se i dalje ažuriraju).
  const festoonRoot=group(slew);festoonRoot.visible=!SIMPLE_CRANE;
  const festoon=rig.festoon(festoonRoot);
  const trolley=group(slew,16,0,0);
  box(trolley,m.yellow,0,.75,0,1.05,.26,1.45);
  for(const x of [-.38,.38])for(const z of [-.62,.62])rod(trolley,m.steel,[x,.94,z-.09],[x,.94,z+.09],.14);
  for(const z of [-.14,.14])rod(trolley,m.steel,[-.22,.7,z],[.22,.7,z],.17);
  batch(trolley);
  // Teret, kuka i sajle više nisu djeca strijele: teret ostaje na krovu kad se kuka otkači,
  // a kuka nastavlja sa kranom. Njihov položaj u svijetu računa update() (vidi rigPose).
  const load=group(scene,0,0,0);
  load.userData.printLine=true;
  load.scale.setScalar(LOAD_SCALE);
  function pallet(g,x,y,z,blocks=true,variant=0) {
    for(const px of [-.65,0,.65])box(g,m.darkWood,x+px,y+.12,z,.17,.24,1.3);
    for(let dz=-.56;dz<.7;dz+=.28)box(g,m.timber,x,y+.29,z+dz,1.7,.1,.21);
    if(blocks) {
      for(let ly=0;ly<6;ly++)for(let bx=0;bx<3;bx++)for(let bz=0;bz<2;bz++)box(g,variant===1?m.brick:variant===2?m.concrete:m.pale,x-.55+bx*.55,y+.44+ly*.17,z-.3+bz*.6,.53,.16,.58);
      for(const px of [-.58,.58])box(g,m.steel,x+px,y+.85,z,.035,1.05,1.23);
    }
  }
  function boardPallet(g) {
    const board=mat('#ebe8e2',.9),boardEdge=mat('#dcd7cd',.92);
    board.userData.ink=.22;boardEdge.userData.ink=.42;
    // Drvena paleta: tri podužne grede, kocke i gornje daske.
    for(const x of [-.67,0,.67])for(const z of [-.49,.49])box(g,m.darkWood,x,.12,z,.22,.22,.23);
    for(const x of [-.67,0,.67])box(g,m.timber,x,.035,0,.22,.07,1.3);
    for(let z=-.55;z<.7;z+=.275)box(g,m.timber,0,.27,z,1.76,.10,.22);
    // Složaj ploča: svaka druga ploča je za dlaku uvučena, pa ivice složaja daju tanke pruge.
    for(let i=0;i<15;i++)box(g,i%2?boardEdge:board,0,.345+i*.044,0,1.68-(i%2)*.02,.042,1.06-(i%2)*.02);
    const top=.345+15*.044;
    // Zaštitna kartonska ploča i kutni štitnici, preko njih dvije čelične trake.
    box(g,m.white,0,top+.02,0,1.72,.04,1.1);
    for(const x of [-.84,.84])for(const z of [-.53,.53])box(g,m.timber,x,.68,z,.07,.72,.07);
    for(const x of [-.52,.52]) {
      box(g,m.sling,x,top+.045,0,.05,.012,1.12);
      for(const z of [-.555,.555])box(g,m.sling,x,.68,z,.05,.72,.012);
    }
    // Kavez za podizanje: četiri stuba od palete do okvira, okvir i ušice za sajle.
    for(const x of [-.9,.9])for(const z of [-.69,.69]) {
      rod(g,m.steel,[x,.28,z],[x,2.04,z],.03);
      box(g,m.steel,x,.29,z,.15,.075,.15);
      box(g,m.steel,x,2.125,z,.21,.025,.21);
    }
    for(const z of [-.69,.69])box(g,m.edge,0,2.04,z,1.9,.12,.1);
    for(const x of [-.9,.9])box(g,m.edge,x,2.04,0,.1,.12,1.48);
    // Dijagonale kaveza (ukrućenje), kao na referenci sa spreaderom.
    for(const z of [-.69,.69])for(const s of [-1,1])rod(g,m.steel,[s*.9,1.2,z],[0,2.0,z],.018);
    for(const x of [-.75,.75])box(g,m.steel,x,.10,0,.12,.14,1.6);
    batch(g);
  }
  // Paleta gipsanih ploča (2000×1250) u kavezu za podizanje — glavni artikal firme.
  boardPallet(load);
  if(typeof document!=='undefined') {
    const label=document.createElement('canvas');label.width=512;label.height=320;
    const lc=label.getContext('2d');lc.fillStyle='#e1dfd3';lc.fillRect(0,0,512,320);
    lc.fillStyle='#2c302e';lc.font='bold 42px sans-serif';lc.fillText('GRAND COMPANY',24,66);
    lc.font='22px sans-serif';lc.fillText('GIPS PLOČE 2000×1250 / PALETA',24,104);
    lc.fillRect(24,123,464,2);lc.font='18px sans-serif';lc.fillText('PALETA / 01     •     SUHO SKLADIŠTENJE',24,158);
    for(let x=25;x<475;x+=7){const width=2+(x%5);lc.fillRect(x,186,width,78);}
    lc.font='17px monospace';lc.fillText('GC  78000  /  001',24,295);
    const texture=new THREE.CanvasTexture(label);texture.colorSpace=THREE.SRGBColorSpace;
    const paper=new THREE.MeshStandardMaterial({map:texture,roughness:.95});
    for(const side of [0,1]) {
      const tag=new THREE.Mesh(new THREE.PlaneGeometry(.72,.45),paper);tag.position.set(side?.846:0,.74,side?0:.536);tag.rotation.y=side?Math.PI/2:0;load.add(tag);
    }
  }
  // Kuka (kolotur + ušica) visi sa kolica; dok nosi teret, sjedi tačno iznad kaveza.
  const hook=group(scene,0,0,0);
  hook.userData.printLine=true;
  hook.scale.setScalar(LOAD_SCALE);
  details.hook(hook);
  batch(hook);
  const hookRing=new THREE.Mesh(new THREE.TorusGeometry(.18,.05,8,16,Math.PI*1.65),m.steel);
  hookRing.rotation.z=1;hookRing.position.y=-.16;hook.add(hookRing);
  const hoists=[-.12,.12].map(()=>rod(scene,m.steel,[0,0,0],[0,1,0],.017));
  // Četiri kraka sajle od kuke do ušica kaveza; svaki krak ima dva dijela (da se može ulegnuti).
  const slings=[];
  for(const x of [-.9,.9])for(const z of [-.69,.69])slings.push({x,z,parts:[rod(scene,m.steel,[0,0,0],[0,1,0],.023),rod(scene,m.steel,[0,0,0],[0,1,0],.023)]});

  const site=group(scene);
  site.userData.printLine=true;
  architecture.excavation(site);
  // Access road and kerbs keep the complex legible.
  box(site,m.asphalt,0,.005,8,140,.035,4);
  for(let x=-50;x<52;x+=2)box(site,m.line,x,.03,8,.8,.012,.07);
  for(let x=-50;x<52;x+=1.5)box(site,m.paving,x,.12,5.8,1.4,.24,.2);
  for(let x=-32;x<=40;x+=2) {
    // Otvori: glavni ulaz i prolaz do kulisа zgrade na ivici.
    if(x>=-4&&x<2)continue;if(x>=20&&x<36)continue;
    rod(site,m.steel,[x,0,13.5],[x,1.7,13.5],.035);
    box(site,m.slab,x+1,.85,13.5,1.95,1.6,.06);
  }
  // A continuous approach road and pavement connect the surrounding blocks.
  box(site,m.paving,0,.02,16.5,140,.12,3.8);
  for(let x=-48;x<53;x+=4)box(site,m.joint,x,.082,16.5,.025,.005,3.8);
  // Stacked materials and site offices.
  for(let i=0;i<7;i++)pallet(site,-10+i*2.4,0,4.3,true,i%3);
  const offices=group(site,0,0,2);
  for(const x of [14,18]) {
    box(offices,m.white,x,1,9,3,2,1.7);
    for(const z of [8.13,9.87]) {
      for(const dx of [-1.4,1.4])box(offices,m.blue,x+dx,1,z,.1,2.1,.08);
      box(offices,m.blue,x,1.2,z,2,.85,.04);
    }
    box(offices,m.slab,x,2.1,9,3.2,.15,1.9);
  }
  batch(offices);
  const floors=[];
  function building(x,z,w,d,n,offset,brick=true,style=null,parent=site,opts={}) {
    // opts.perimeter: stubovi samo po obodu (sredina sprata prohodna); opts.open: spratovi bez cigle.
    const open=opts.open||[];
    const base=group(parent,x,0,z);
    for(let f=0;f<=n;f++) {
      const level=group(base,0,f*2.35,0);
      box(level,m.slab,0,.1,0,w,.2,d);
      if(f<n) {
        if(opts.perimeter) {
          for(const px of [-w/2+.3,0,w/2-.3]) {
            for(const pz of [-d/2+.15,d/2-.15])box(level,m.concrete,px,1.22,pz,.3,2.3,.3);
            box(level,m.concrete,px,2.15,0,.26,.35,d);
          }
        } else for(let px=-w/2+.3;px<=w/2;px+=w/3)for(let pz=-d/2+.3;pz<=d/2;pz+=d/2) {
          box(level,m.concrete,px,1.22,pz,.3,2.3,.3);
          box(level,m.concrete,px,2.15,0,.26,.35,d);
        }
        if(brick&&f<n-1&&!open.includes(f)) {
          for(let px=-w/2+.75;px<w/2;px+=1.9)for(const side of [-1,1]) {
            box(level,m.brick,px,.57,side*(d/2-.2),1.7,.95,.18);
            box(level,m.brick,px-.68,1.57,side*(d/2-.2),.34,1.1,.18);
            // Mortar courses provide small-scale texture without bitmap dependencies.
            for(let row=0;row<5;row++)box(level,m.slab,px,.17+row*.19,side*(d/2-.095),1.68,.013,.012);
          }
        }
      } else {
        for(const px of [-w/2+.3,w/2-.3])for(const pz of [-d/2+.3,d/2-.3]) {
          box(level,m.concrete,px,.7,pz,.3,1.2,.3);
          for(const dx of [-.09,.09])for(const dz of [-.09,.09])rod(level,m.steel,[px+dx,1.1,pz+dz],[px+dx,2,pz+dz],.014);
        }
      }
      // Fall protection around unfinished slab perimeter.
      if(f>=n-1)for(const side of [-1,1]) {
        for(let px=-w/2;px<=w/2;px+=1.5)rod(level,m.galvanized,[px,.2,side*d/2],[px,1.2,side*d/2],.025);
        for(const h of [.7,1.15])box(level,m.timber,0,h,side*d/2,w,.08,.06);
      }
      details.floor(level,{w,d,f,n,brick:brick&&!open.includes(f)});
      architecture.floor(level,{w,d,f,n,style});
      if(style==='residential'&&f>=n-1){level.scale.x=.8;level.scale.z=.8;}
      // `at` = trenutak u kome sprat počinje da niče; viši spratovi malo kasnije.
      batch(level);floors.push({group:level,height:f*2.35,at:.46+offset+f*.019});
    }
    return base;
  }
  // Receiving slab top = 9.6; pallet bottom = 9.64. U ovu zgradu kamera na kraju ulazi,
  // pa su joj stubovi po obodu, a ulazni sprat je bez cigle (fasada dolazi u završnoj fazi).
  building(9,0,7,6,4,0,true,null,site,{perimeter:true,open:[ENTRY]});
  building(-7,-8,6,6,6,.005,false,'frame');
  building(1,-10,6,6,7,.02,false,'office');
  building(12,-10,7,6,9,.035,true,'residential');
  // ——— Kulisа zgrada: otvoren betonski skelet na ivici gradilišta ———
  // U nju kamera ulazi u završnoj chapter-i. Namjerno je bez zidova na ±X stranama i bez
  // cigle na spratu u koji se ulazi, pa je prolaz i prozor otvoren. Raste kao i ostale.
  const SW=10,SD=6,SN=3,studio=group(site,27,0,13);
  for(let f=0;f<=SN;f++) {
    const level=group(studio,0,f*2.35,0);
    box(level,m.slab,0,.1,0,SW,.2,SD);
    if(f<SN) {
      // Stubovi samo po ivicama (±Z), da sredina ostane prohodna za kameru.
      for(const px of [-4.7,0,4.7])for(const pz of [-2.7,2.7])box(level,m.concrete,px,1.22,pz,.32,2.3,.32);
      for(const pz of [-2.7,2.7])box(level,m.concrete,0,2.17,pz,SW,.34,.3);
      for(const px of [-4.7,4.7])box(level,m.concrete,px,2.17,0,.3,.34,SD);
      // Cigla samo na donja dva sprata i samo na ±Z stranama; +X i -X ostaju otvoreni.
      if(f<SN-1)for(let px=-4.2;px<4.5;px+=1.9)for(const side of [-1,1]) {
        box(level,m.brick,px,.6,side*(SD/2-.2),1.7,.9,.18);
        for(let row=0;row<4;row++)box(level,m.slab,px,.2+row*.19,side*(SD/2-.11),1.68,.013,.012);
      }
    }
    batch(level);floors.push({group:level,height:f*2.35,at:.46+f*.02});
  }
  // Neighbouring work zones fill the periphery as the camera enters the site.
  const district=group(scene),districtFloorStart=floors.length;
  building(-23,-13,10,9,5,.015,false,'frame',district);
  building(30,-16,11,10,7,.02,true,'residential',district);
  building(-10,-31,13,9,6,.015,false,'office',district);
  building(17,-36,14,11,5,.02,true,null,district);
  for(const x of [-34,39])for(let z=-15;z<4;z+=3.3)pallet(district,x,0,z,true,Math.abs(z)%3);
  for(const x of [-37,43]) {
    box(district,m.concrete,x,.22,-23,9,.44,12);
    for(let dx=-3.6;dx<4;dx+=1.2)for(let z=-28;z<-17;z+=1.5)rod(district,m.steel,[x+dx,.45,z],[x+dx,1.2,z],.02);
  }
  const finishedDistrict=flatten(district);
  district.clear();district.add(finishedDistrict);floors.splice(districtFloorStart);
  const scaffold=group(site,12,0,-10);
  for(let y=.4;y<17;y+=2.35) {
    for(let x=-3.9;x<4;x+=1.3)for(const z of [-3.7,3.7]) {
      rod(scaffold,m.steel,[x,y,z],[x,y+2.35,z],.028);
      rod(scaffold,m.steel,[x,y,z],[x+1.3,y+2.35,z],.018);
      box(scaffold,m.timber,x+.65,y,z,1.3,.07,.65);
      rod(scaffold,m.yellow,[x,y+1,z],[x+1.3,y+1,z],.025);
    }
  }
  // Partially hung protection mesh, with visible toe boards and scaffold ties.
  for(const y of [4.9,7.25,9.6])for(const x of [-2.6,0,2.6]) {
    const screen=box(scaffold,m.net,x,y+1,3.76,2.5,1.85,.015);screen.castShadow=false;
    box(scaffold,m.timber,x,y+.12,3.8,2.5,.2,.055);
    rod(scaffold,m.steel,[x,y+.2,3.7],[x,y+.2,2.8],.024);
  }
  batch(scaffold);
  // A delivery truck gives the buildings and load a clear scale.
  const activityRoot=group(scene);
  const activity=createSiteActivity({root:activityRoot,box,rod,group,batch,m,smooth});
  const truck=group(activityRoot,1,.08,8);
  const wheels=[];
  box(truck,m.steel,0,.35,0,4.4,.3,1.55);
  box(truck,m.white,1.5,1,0,1.4,1.5,1.55);
  box(truck,m.glass,2.21,1.25,0,.03,.7,1.3);
  box(truck,m.yellow,-.8,.9,0,2.7,.15,1.6);
  for(const x of [-1.4,1.3])for(const z of [-.8,.8]) {
    const wheel=group(truck,x,.3,z);
    const tire=mesh(wheel,rodGeo,m.rubber,0,0,0,.38,.2,.38);tire.rotation.x=Math.PI/2;
    for(const angle of [0,Math.PI/3,Math.PI*2/3]){const spoke=box(wheel,m.frame,0,0,Math.sign(z)*.11,.55,.045,.035);spoke.rotation.z=angle;}
    batch(wheel);wheels.push(wheel);
  }
  pallet(truck,-.8,1,0);details.truck(truck);batch(truck);details.site(site);batch(site);
  const growingParts=[...site.children];
  const finishedSite=flatten(site,floors);site.add(finishedSite);
  // Instanced mesh-evi u kojima ima spratova koji rastu.
  const growthMeshes=[];
  finishedSite.traverse(o=>{if(o.isInstancedMesh&&o.userData.growthBase)growthMeshes.push(o);});
  function architecturalFade(root) {
    const copies=new Map();
    root.traverse(object=>{
      if(!object.isMesh)return;
      const source=object.material;
      if(!copies.has(source)) {
        const copy=source.clone();
        copy.onBeforeCompile=source.onBeforeCompile;
        copy.customProgramCacheKey=source.customProgramCacheKey;
        copy.transparent=true;
        copies.set(source,{material:copy,opacity:source.opacity});
      }
      object.material=copies.get(source).material;
    });
    return opacity=>{for(const entry of copies.values())entry.material.opacity=entry.opacity*opacity;};
  }
  const siteFade=architecturalFade(finishedSite);
  const districtFade=architecturalFade(finishedDistrict);

  // ——— Završna chapter-a: fasada zgrade sa paletom, pa kupatilo na ulaznom spratu ———
  // Fasada je van `site` (koji je spojen u instance) da bi mogla da raste nezavisno.
  const finishRoot=group(scene,9,0,0);
  finishRoot.userData.printLine=true;
  const finish=buildFinish({parent:finishRoot,box,rod,group,batch,m,pallet});
  finishRoot.visible=false;
  const ENTRY_Y=ENTRY*2.35+.2;
  const interiorRoot=new THREE.Group();
  interiorRoot.position.set(9,ENTRY_Y,0);
  buildTowerBath({parent:interiorRoot,box,rod:(g,material,a,b,r)=>rod(g,material,a,b,r,true),m});
  scene.add(interiorRoot);
  const interiorFade=architecturalFade(interiorRoot);
  // Mekano, toplo svetlo u sobi — spoljno svetlo ne dopire ispod ploče sprata iznad.
  const interiorLight=new THREE.PointLight('#fff4e6',0,10,2);
  interiorLight.position.set(10.2,ENTRY_Y+2.0,0);scene.add(interiorLight);
  interiorRoot.visible=false;interiorFade(0);

  // ——— Putanja kamere kroz cijelu priču (sirovi progres 0..1) ———
  // Jedna glatka kriva (Catmull-Rom) kroz ključeve: široki kadar krana uperenog lijevo, lagana
  // orbita udesno dok se kran okreće i zgrada niče, srednji plan krova (spuštanje + otkačinjanje
  // kuke), pa spust niz fasadu do balkona, ulaz u kupatilo, okret ka prozoru i izlaz u nebo.
  // Kamera namjerno ne ide u ekstremni krupni plan — teret, kuka i krov su uvijek zajedno u kadru.
  const EYE=ENTRY_Y+1.5;
  const CAMERA_KEYS=[
    // p      pozicija                 pogled
    [0,         [3,17,48],             [-4,19,0]],        // cijeli kran, strijela lijevo
    [.10,       [10,17.5,47],          [-2,18,0]],
    [.22,       [22,18,40],            [2,14.5,0]],       // kran prolazi ispred nas, zgrada raste
    [.34,       [30,18,34],            [6,12.6,0]],       // teret iznad krova
    [.44,       [29,17.5,29],          [8.2,11.2,0]],     // spuštanje na krov (srednji plan)
    [.52,       [26,18.5,25],          [8.6,12.6,0]],     // kuka se otkači i ode gore
    [.60,       [20,13,19],            [8.8,8.4,0]],      // niz fasadu
    [.68,       [15.2,7.6,12.2],       [8.6,6.0,0]],      // ka balkonu sprata ENTRY
    [.76,       [8.1,EYE+.1,11.5],     [8.1,EYE-.1,0]],   // ispred balkonskih vrata
    [.82,       [8.1,EYE,2.0],         [8.9,EYE-.25,-3]], // kroz vrata — umivaonik i ogledalo
    [.87,       [8.9,EYE,.3],          [11.8,EYE-.15,-2.2]], // okret ka prozoru
    [.91,       [10.3,EYE,0],          [14.5,EYE,0]],     // pred prozorom
    [.96,       [13.8,EYE+.05,0],      [18,EYE+.45,0]],   // kroz prozor
    [1,         [17.0,EYE+.3,0],       [22,EYE+3.4,0]],   // napolju — ostaje samo nebo
  ];
  const cameraCurve=new THREE.CatmullRomCurve3(CAMERA_KEYS.map(k=>new THREE.Vector3(...k[1])),false,'centripetal');
  const lookCurve=new THREE.CatmullRomCurve3(CAMERA_KEYS.map(k=>new THREE.Vector3(...k[2])),false,'centripetal');
  const _pathPos=new THREE.Vector3(),_pathLook=new THREE.Vector3();
  function cameraPath(p) {
    const k=CAMERA_KEYS,last=k.length-1;
    let i=last-1;
    for(let j=0;j<last;j++)if(p<k[j+1][0]){i=j;break;}
    let f=clamp((p-k[i][0])/(k[i+1][0]-k[i][0]));
    // Prvi i poslednji segment se ublaže — kamera kreće i staje mekano.
    if(i===0)f=f*f*(3-2*f)*.5+f*.5;
    if(i===last-1)f=1-(1-f)*(1-f);
    const u=(i+f)/last;
    cameraCurve.getPoint(u,_pathPos);lookCurve.getPoint(u,_pathLook);
    return {position:_pathPos,look:_pathLook};
  }
  // Tlo: veliki svijetli disk; u daljini se tačke prorijede i stapa se sa papirom (magla u crane-print).
  const groundMat=new THREE.MeshStandardMaterial({color:'#efede8'});
  groundMat.userData.ink=.1;groundMat.userData.radial=[1,0,9,34];groundMat.userData.edgeW=.2;
  const ground=new THREE.Mesh(new THREE.CircleGeometry(90,64),groundMat);
  ground.rotation.x=-Math.PI/2;ground.position.y=-.02;scene.add(ground);
  // Betonski plato oko krana i zgrade — tamniji, da kran i zgrada "stoje" na nečemu.
  const pad=group(scene);
  box(pad,m.concrete,1,.03,0,26,.06,13);
  for(let x=-11;x<14;x+=2.6)box(pad,m.joint,x,.065,0,.03,.01,13);
  const ambient=new THREE.HemisphereLight('#f2f4f5','#cbc7bf',.5);scene.add(ambient);
  const key=new THREE.DirectionalLight('#fff8ef',2.9);key.position.set(-22,29,12);key.castShadow=true;
  key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-48,right:48,top:45,bottom:-40,near:1,far:150});key.shadow.radius=4;key.shadow.bias=-.0003;key.shadow.normalBias=.04;scene.add(key);
  const fill=new THREE.DirectionalLight('#e4ebef',.42);fill.position.set(20,15,-20);scene.add(fill);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(180,180),new THREE.ShadowMaterial({opacity:.2}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.35;shadow.receiveShadow=true;scene.add(shadow);
  const childrenBeforeEffects=scene.children.length;
  const deliveryEffects=createDeliveryEffects(scene);
  // Linijski crtež: prašina i čestice dostave se ne prikazuju.
  scene.children.slice(childrenBeforeEffects).forEach(o=>{o.visible=false;});
  shadow.visible=false;
  const camera=new THREE.PerspectiveCamera(37,1,.1,220);
  const target=new THREE.Vector3();
  // ——— Rast gradilišta ———
  // Svaki sprat niče (skalira se po visini oko svoje ploče) u trenutku `at`. Instanced
  // matrice se vraćaju na osnovu pa se skalira samo Y-red — zato rast i dalje radi u
  // istim draw pozivima (bez ponovnog instanciranja scene po spratu).
  const GROW_DURATION=.11,GROW_LIMIT=.8;
  let growthFinalized=false;
  function applyGrowth(p) {
    if(p>=GROW_LIMIT) {
      if(growthFinalized)return;
      for(const inst of growthMeshes){inst.instanceMatrix.array.set(inst.userData.growthBase);inst.instanceMatrix.needsUpdate=true;}
      growthFinalized=true;return;
    }
    growthFinalized=false;
    for(const inst of growthMeshes) {
      const base=inst.userData.growthBase,info=inst.userData.growthInfo,a=inst.instanceMatrix.array;
      for(let i=0;i<inst.count;i++) {
        const o=i*16,meta=info[i];
        const g=meta?clamp(smooth(meta.at,meta.at+GROW_DURATION,p)):1;
        // Sprat koji još nije počeo da raste se ne crta. Sa visinom tačno 0 šejder dijeli
        // nulom pri računanju normala, pa se ploča pojavi kao crni kvadrat (to je bio glitch).
        if(g<1e-4){a.fill(0,o,o+16);continue;}
        // Kolonski (column-major) zapis: Y koeficijenti su 1,5,9; translacija po Y je 13.
        a[o]=base[o];a[o+1]=base[o+1]*g;a[o+2]=base[o+2];a[o+3]=base[o+3];
        a[o+4]=base[o+4];a[o+5]=base[o+5]*g;a[o+6]=base[o+6];a[o+7]=base[o+7];
        a[o+8]=base[o+8];a[o+9]=base[o+9]*g;a[o+10]=base[o+10];a[o+11]=base[o+11];
        a[o+12]=base[o+12];a[o+13]=base[o+13]*g+(meta?meta.y:0)*(1-g);a[o+14]=base[o+14];a[o+15]=base[o+15];
      }
      inst.instanceMatrix.needsUpdate=true;
    }
  }
  // ——— Kran: okretanje, teret, kuka ———
  // Trenuci priče u sirovom progresu skrola.
  const T={swing0:.02,swing1:.37,drop0:.36,drop1:.47,release0:.47,release1:.51,lift0:.49,lift1:.57,away0:.51,away1:.66};
  const MAST_X=-7,JIB_Y=25.98;
  // Ugao strijele: -π = uperena lijevo (prema -X), 0 = desno, iznad zgrade. Okreće se preko
  // prednje strane (prema kameri), pa teret proleti kroz kadar. Kad otkači teret, nastavlja udesno.
  function slewAt(p) {
    return -Math.PI*(1-smooth(T.swing0,T.swing1,p))+.6*smooth(T.away0,T.away1,p);
  }
  // Tačka u ravni strijele (x = udaljenost od stuba) zarotirana za ugao th, u svijetu.
  function onJib(x,y,z,th,out) {
    const c=Math.cos(th),s=Math.sin(th);
    return out.set(MAST_X+x*c+z*s,y,-x*s+z*c);
  }
  const _a=new THREE.Vector3(),_b=new THREE.Vector3(),_mid=new THREE.Vector3(),_dir=new THREE.Vector3(),_end=new THREE.Vector3();
  function setRod(o,a,b) {
    _dir.subVectors(b,a);
    const len=Math.max(1e-4,_dir.length());
    o.position.addVectors(a,b).multiplyScalar(.5);
    o.scale.y=len;
    o.quaternion.setFromUnitVectors(unitY,_dir.multiplyScalar(1/len));
  }
  // Scena posle priče ostaje ista: bez okolnog gradilišta, samo kran, teret, zgrada i soba.
  site.visible=false;district.visible=false;activityRoot.visible=false;
  finishRoot.visible=true;
  const focus=new THREE.Vector3();
  function update(p,aspect=1) {
    const th=slewAt(p);
    slew.rotation.y=th;
    // Kolica idu ka kraju strijele dok se kran okreće; posle otkačinjanja se vraćaju.
    const tx=13+3*smooth(.05,.30,p)-3*smooth(.53,.64,p);
    trolley.position.x=tx;
    festoon.update(tx);
    // Teret na sajli malo kasni za strijelom dok se kran okreće (inercija), a smiri se pri spuštanju.
    const rate=(slewAt(p+.002)-slewAt(p-.002))/.004;
    const landed=p>=T.drop1;
    const thLoad=landed?0:th-.0032*rate*(1-smooth(T.drop0,T.drop1,p));
    const loadR=landed?16:tx;
    const loadY=mix(15.2,ROOF_Y,smooth(T.drop0,T.drop1,p));
    onJib(loadR,loadY,0,thLoad,load.position);
    load.rotation.y=thLoad;
    // Kuka: dok nosi, sjedi iznad kaveza; kad se sajle otkače, diže se ka kolicima i ide sa kranom.
    const release=smooth(T.release0,T.release1,p);
    const lift=smooth(T.lift0,T.lift1,p);
    const hookTh=p<T.release0?thLoad:th;
    const hookR=p<T.release0?loadR:tx;
    const hookY=loadY+2.8*LOAD_SCALE+lift*4.8;
    onJib(hookR,hookY,0,hookTh,hook.position);
    hook.rotation.y=hookTh;
    for(let i=0;i<hoists.length;i++) {
      const z=i?.12:-.12;
      setRod(hoists[i],onJib(tx,JIB_Y,z,th,_a),onJib(hookR,hookY+.45*LOAD_SCALE,z,hookTh,_b));
    }
    // Sajle: od ušica kaveza do kuke. Pri otkačinjanju donji kraj napušta ušicu, sajla se
    // ulegne i ostane da visi ispod kuke koja odlazi.
    const hang=(.35+1.2*lift)*LOAD_SCALE;
    for(const sling of slings) {
      const anchor=onJib(hookR,hookY-.15*LOAD_SCALE,0,hookTh,_a);
      const eye=onJib(loadR+sling.x*LOAD_SCALE,loadY+2.13*LOAD_SCALE,sling.z*LOAD_SCALE,thLoad,_end);
      const free=onJib(hookR+sling.x*.28*LOAD_SCALE,hookY-hang,sling.z*.28*LOAD_SCALE,hookTh,_b);
      eye.lerp(free,release);
      _mid.copy(eye).lerp(anchor,.5);
      _mid.y-=Math.sin(release*Math.PI)*.55;
      // sajla se ne smije spustiti kroz gornji okvir kaveza dok se oslobađa
      _mid.y=Math.max(_mid.y,loadY+2.22*LOAD_SCALE);
      setRod(sling.parts[0],eye,_mid);
      setRod(sling.parts[1],_mid,anchor);
    }
    // Zgrada niče sprat po sprat dok se kran okreće; krov je gotov prije nego teret krene dolje.
    finish.update(p,.06,.07,.09);
    interiorRoot.visible=p>.66;
    interiorFade(smooth(.66,.72,p));
    interiorLight.intensity=0;
    // Kamera: jedna kriva kroz cijelu priču. Na uskom (uspravnom) ekranu se, dok traje kran,
    // odmakne od tačke pogleda da kran i zgrada stanu u širinu; u sobi je normalna.
    const path=cameraPath(p);
    target.copy(path.look);
    const pull=mix(Math.max(1,.92/aspect),1,smooth(.58,.68,p));
    camera.position.copy(path.position).sub(target).multiplyScalar(pull).add(target);
    // Uzak ekran: dok je strijela lijevo, kadar se pomjeri ulijevo (teret ne ispada sa ivice),
    // a pogled spusti, pa kran sjedne više (ispod naslova, a ne pri dnu).
    const portrait=clamp((1-aspect)/.5);
    if(portrait>0) {
      _dir.set(-6*portrait*(1-smooth(.04,.3,p)),-3*portrait*(1-smooth(.3,.5,p)),0);
      camera.position.add(_dir);target.add(_dir);
    }
    focus.copy(target);
    // U sobi je objektiv širi (naročito na uskom ekranu), da kupatilo stane u kadar.
    const inside=smooth(.74,.8,p)*(1-smooth(.94,.99,p));
    camera.fov=37+(aspect<1?24:9)*inside;
    camera.aspect=aspect;camera.lookAt(target);camera.updateProjectionMatrix();
    return {chapter:p<.17?0:p<.36?1:p<.58?2:p<.925?3:4};
  }
  update(0);
  // Oslobađa geometrije, materijale i teksture scene (pri ponovnoj montaži stranice).
  function dispose() {
    const seen=new Set();
    scene.traverse(o=>{
      if(o.geometry&&!seen.has(o.geometry)){seen.add(o.geometry);o.geometry.dispose();}
      for(const mt of [o.material].flat().filter(Boolean)) {
        if(seen.has(mt))continue;seen.add(mt);
        for(const v of Object.values(mt))if(v?.isTexture&&!seen.has(v)){seen.add(v);v.dispose();}
        mt.dispose();
      }
    });
  }
  return {dispose,scene,camera,update,focus,load,hook,site,slew,trolley,hoists,floors,activity,activityRoot,truck,wheels,lighting:{key,fill},materials:m};
}
