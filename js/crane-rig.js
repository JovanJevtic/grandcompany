import * as THREE from '../vendor/three.module.min.js';

// Details sized for the close crane and cargo shots.
export function craneRigKit({box,rod,group,batch,m}) {
  function upper(g) {
    // Cast gearboxes, cooling fins and service cabinets on the counterjib.
    for(const x of [-2.5,-1.25]) {
      box(g,m.steel,x,1.32,-.22,.64,.65,.7);
      for(let dx=-.25;dx<.3;dx+=.08)box(g,m.frame,x+dx,1.33,-.59,.035,.49,.09);
      rod(g,m.steel,[x,1.33,.12],[x,1.33,.43],.23);
      box(g,m.yellow,x,.99,-.22,.82,.08,.85);
    }
    box(g,m.white,-4.1,1.46,-.15,.48,.94,.73);
    for(let y=1.16;y<1.7;y+=.08)box(g,m.frame,-4.35,y,-.15,.015,.025,.51);
    // Slew drives and exposed pinion axes beneath the tower head.
    for(const x of [-.78,.78]) {
      rod(g,m.steel,[x,.32,-.82],[x,.8,-.82],.17);
      for(let y=.39;y<.77;y+=.09)box(g,m.frame,x,y,-.82,.4,.028,.4);
      box(g,m.yellow,x,.83,-.82,.4,.065,.4);
    }
    // Work lamps and conduits are attached to the structure, never floating.
    for(const x of [-4,1.5,11]) {
      rod(g,m.steel,[x,1,.62],[x,.65,.91],.025);
      const housing=box(g,m.frame,x,.59,.96,.32,.22,.2);housing.rotation.x=.3;
      const lens=box(g,m.lamp,x,.55,1.075,.25,.13,.018);lens.rotation.x=.3;
    }
    for(const z of [-.53,.53])rod(g,m.rubber,[-4.1,1.03,z],[2.1,1.03,z],.023);
    // Seated operator silhouette, visible through the cab's panoramic glazing.
    box(g,m.blue,.99,-.12,1.05,.23,.35,.30);
    rod(g,m.skin,[1.03,.12,1.05],[1.03,.29,1.05],.08);
    rod(g,m.white,[1.03,.27,1.05],[1.03,.35,1.05],.105);
    for(const z of [.94,1.16]) {
      rod(g,m.blue,[1.06,-.2,z],[1.36,-.29,z],.054);
      rod(g,m.blue,[1.36,-.29,z],[1.42,-.57,z],.05);
      rod(g,m.blue,[1.03,.01,z],[1.38,-.05,z],.044);
    }
    // Diagonal stiffeners and lift eyes on the counterweight retention frame.
    for(const z of [-.89,.89]) {
      rod(g,m.edge,[-7.15,-.57,z],[-4,2.4,z],.055);
      box(g,m.steel,-5.65,-.59,z,3.35,.13,.14);
    }
  }
  function cargo(g) {
    // EUR-style timber skid, exposed terracotta cells and real lifting hardware.
    for(const x of [-.67,0,.67])for(const z of [-.49,.49])box(g,m.darkWood,x,.12,z,.22,.22,.23);
    for(const x of [-.67,0,.67])box(g,m.timber,x,.035,0,.22,.07,1.3);
    for(let z=-.55;z<.7;z+=.275)box(g,m.timber,0,.27,z,1.76,.10,.22);
    for(let layer=0;layer<5;layer++)for(let x=0;x<3;x++)for(let z=0;z<2;z++) {
      const cx=-.55+x*.55,cz=-.30+z*.60,y=.35+layer*.23;
      if(layer<4)box(g,m.cargo,cx,y+.10,cz,.525,.215,.565);
      else {
        // The top course has open cavities, with inner walls catching light.
        for(const dx of [-.25,.25])box(g,m.cargo,cx+dx,y+.1,cz,.026,.215,.565);
        for(const dz of [-.27,.27])box(g,m.cargo,cx,y+.1,cz+dz,.5,.215,.026);
        for(const dx of [-.08,.08])box(g,m.cargo,cx+dx,y+.1,cz,.022,.215,.54);
        box(g,m.cargo,cx,y+.1,cz,.5,.215,.022);
      }
    }
    // Packing bands and folded cardboard protectors run over the actual load.
    for(const x of [-.59,.59]) {
      for(const z of [-.602,.602])box(g,m.sling,x,.89,z,.056,1.15,.017);
      box(g,m.sling,x,1.487,0,.056,.015,1.22);
      for(const z of [-.60,.60]) {
        box(g,m.timber,x,1.475,z,.18,.025,.14);
        box(g,m.timber,x,1.42,z,.18,.12,.022);
        box(g,m.steel,x,.69,z*1.02,.09,.13,.025);
      }
    }
    // Fork rails beneath the skid transfer the weight into the four lifting legs.
    for(const x of [-.75,.75])box(g,m.steel,x,.10,0,.12,.14,1.6);
    for(const z of [-.70,.70])box(g,m.steel,0,.20,z,1.92,.10,.12);
    // Four-leg spreader keeps the slings off the clay blocks.
    for(const z of [-.69,.69]) {
      box(g,m.edge,0,2.04,z,1.9,.15,.11);
      for(const x of [-.9,.9]) {
        rod(g,m.sling,[x,.30,z],[x,2.04,z],.024);
        rod(g,m.steel,[x,1.98,z-.055],[x,2.13,z+.055],.035);
        box(g,m.steel,x,.29,z,.15,.075,.15);
      }
    }
    for(const x of [-.9,.9])box(g,m.edge,x,2.04,0,.11,.15,1.48);
    box(g,m.frame,0,2.13,.75,.72,.18,.025);
    batch(g);
  }
  function festoon(parent) {
    const cables=group(parent);
    const spans=Array.from({length:20},()=>rod(cables,m.rubber,[0,0,0],[1,0,0],.018));
    const yAxis=new THREE.Vector3(0,1,0);
    return {
      update(trolleyX) {
        spans.forEach((segment,i)=>{
          const point=t=>new THREE.Vector3(1.8+(trolleyX-1.8)*t,.86-.21*Math.abs(Math.sin(t*Math.PI*5)),.68);
          const a=point(i/20),b=point((i+1)/20),d=b.clone().sub(a);
          segment.position.copy(a.add(b).multiplyScalar(.5));segment.scale.y=d.length();segment.quaternion.setFromUnitVectors(yAxis,d.normalize());
        });
      },
    };
  }
  return {upper,cargo,festoon};
}
