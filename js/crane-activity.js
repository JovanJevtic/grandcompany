import * as THREE from '../vendor/three.module.min.js';
// Every movement is a deterministic function of scroll; no idle loops or timers.
export function createSiteActivity({root,box,rod,group,batch,m,smooth}) {
  const excavator=group(root,16,0,2.7);
  for(const z of [-.65,.65]) {
    box(excavator,m.rubber,0,.35,z,2.5,.55,.38);
    for(let x=-1;x<=1;x+=.35) {
      rod(excavator,m.steel,[x,.34,z-.22],[x,.34,z+.22],.22);
      box(excavator,m.steel,x,.66,z,.12,.045,.42);
    }
  }
  batch(excavator);
  const turret=group(excavator,0,.85,0);
  box(turret,m.yellow,0,0,0,2,.4,1.25);
  box(turret,m.yellow,-.7,.33,0,.7,.55,1.2);
  box(turret,m.steel,-.1,.77,-.28,.85,1.22,.7);
  box(turret,m.glass,.34,.84,-.28,.035,.85,.57);
  box(turret,m.glass,-.1,.84,-.65,.67,.85,.03);
  box(turret,m.yellow,-.1,1.42,-.28,1,.1,.87);
  const boom=group(turret,.65,.4,.35);
  rod(boom,m.yellow,[0,0,0],[1.15,1.55,0],.16);
  rod(boom,m.steel,[.15,.03,0],[.9,1.21,0],.055);
  const dipper=group(boom,1.15,1.55,0);
  rod(dipper,m.yellow,[0,0,0],[.8,-2,0],.12);
  rod(dipper,m.steel,[.08,-.2,0],[.62,-1.4,0],.045);
  const bucket=group(dipper,.85,-2.15,0);
  // Curved open scoop, side cheeks and replaceable teeth, rather than a block.
  const scoop=new THREE.Shape();
  scoop.moveTo(-.26,.15);scoop.lineTo(-.30,-.10);
  scoop.quadraticCurveTo(-.28,-.48,.20,-.48);scoop.lineTo(.57,-.36);
  scoop.lineTo(.54,-.29);scoop.lineTo(.18,-.39);
  scoop.quadraticCurveTo(-.20,-.39,-.21,-.09);scoop.lineTo(-.18,.15);
  const shell=new THREE.Mesh(new THREE.ExtrudeGeometry(scoop,{depth:.78,bevelEnabled:false,curveSegments:8}),m.steel);
  shell.position.z=-.39;shell.castShadow=shell.receiveShadow=true;bucket.add(shell);
  const cheek=new THREE.Shape();cheek.moveTo(-.26,.15);cheek.lineTo(.12,.08);cheek.lineTo(.55,-.36);
  cheek.quadraticCurveTo(-.32,-.65,-.26,.15);
  const cheekGeo=new THREE.ExtrudeGeometry(cheek,{depth:.035,bevelEnabled:false,curveSegments:8});
  for(const z of [-.43,.395]){const side=new THREE.Mesh(cheekGeo,m.steel);side.position.z=z;side.castShadow=true;bucket.add(side);}
  for(const z of [-.3,0,.3])box(bucket,m.steel,.59,-.36,z,.23,.065,.085);
  rod(bucket,m.steel,[-.08,.1,-.47],[-.08,.1,.47],.075);
  for(const part of [turret,boom,dipper,bucket])batch(part);

  // Exterior materials hoist on the tall building's side elevation.
  const lift=group(root,16.7,0,-10);
  for(const x of [-.48,.48]) {
    rod(lift,m.steel,[x,0,0],[x,18.7,0],.055);
    for(let y=.2;y<18.5;y+=1)rod(lift,m.steel,[-.48,y,0],[.48,y+.8,0],.023);
  }
  const cage=group(lift,0,.4,.72);
  box(cage,m.yellow,0,0,0,1.35,.13,1.3);
  box(cage,m.yellow,0,1.85,0,1.45,.1,1.4);
  for(const x of [-.62,.62])for(const z of [-.6,.6])rod(cage,m.yellow,[x,0,z],[x,1.85,z],.035);
  for(const z of [-.6,.6]) {
    for(let x=-.6;x<=.65;x+=.16)rod(cage,m.frame,[x,.12,z],[x,1.7,z],.014);
    rod(cage,m.yellow,[-.65,1,z],[.65,1,z],.025);
  }
  box(cage,m.pale,0,.52,0,.8,.85,.75);batch(cage);batch(lift);
  return {
    excavator,lift,cage,turret,boom,dipper,bucket,
    update(p) {
      const dig=smooth(.55,.7,p),raise=smooth(.7,.84,p),turn=smooth(.81,.96,p);
      turret.rotation.y=.72-turn*.48;
      boom.rotation.z=-.23*dig+.3*raise;
      dipper.rotation.z=-.32*dig+.5*raise;
      bucket.rotation.z=.65*dig-.35*raise;
      lift.visible=p>.67;
      cage.position.y=.4+9.4*smooth(.7,.93,p);
    },
  };
}
