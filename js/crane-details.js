// Construction detail kit. Uses shared primitive geometry and material batches.
export function detailKit({box,rod,group,batch,m}) {
  function ring(g,material,c,r,plane='xz',thickness=.022) {
    const point=a=>plane==='xz'?[c[0]+Math.cos(a)*r,c[1],c[2]+Math.sin(a)*r]:[c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r,c[2]];
    for(let i=0;i<16;i++)rod(g,material,point(i*Math.PI/8),point((i+1)*Math.PI/8),thickness);
  }
  function mast(g) {
    // Bolted mast-module flanges, anchor plates and ladder safety hoops.
    for(let y=.5;y<25;y+=2.45)for(const x of [-.68,.68])for(const z of [-.68,.68]) {
      box(g,m.edge,x,y,z,.25,.095,.25);
      for(const dx of [-.075,.075])for(const dz of [-.075,.075])rod(g,m.steel,[x+dx,y-.07,z+dz],[x+dx,y+.09,z+dz],.023);
    }
    for(let y=3;y<24;y+=1.2)ring(g,m.edge,[0,y,1.01],.4);
    for(const x of [-.37,.37])rod(g,m.edge,[x,3,1.16],[x,24,1.16],.024);
    for(const x of [-1.5,1.5])for(const z of [-1.5,1.5]) {
      box(g,m.steel,x,.48,z,.5,.07,.5);
      for(const dx of [-.14,.14])for(const dz of [-.14,.14])rod(g,m.steel,[x+dx,.48,z+dz],[x+dx,.65,z+dz],.025);
    }
    for(let y=7.8;y<25;y+=7.35) {
      box(g,m.steel,0,y,0,1.35,.055,1.35);
      box(g,m.yellow,.93,y,0,.5,.07,1.4);
      for(const z of [-.68,.68])rod(g,m.yellow,[1.15,y,z],[1.15,y+1,z],.025);
      rod(g,m.yellow,[1.15,y+1,-.68],[1.15,y+1,.68],.025);
    }
  }
  function upper(g) {
    // Slewing race, gear teeth, service walkway and cable drum.
    ring(g,m.edge,[0,-.05,0],1.08,'xz',.09);
    for(let i=0;i<36;i++) {
      const a=i*Math.PI/18;box(g,m.steel,Math.cos(a)*1.04,-.07,Math.sin(a)*1.04,.08,.16,.08);
    }
    box(g,m.steel,-3.3,.83,0,1.9,.09,1.25);
    rod(g,m.steel,[-3.3,1.35,-.45],[-3.3,1.35,.45],.34);
    for(const z of [-.5,.5])rod(g,m.edge,[-3.3,1.35,z-.03],[-3.3,1.35,z+.03],.44);
    for(let z=-.42;z<.45;z+=.065)ring(g,m.steel,[-3.3,1.35,z],.35,'xy',.018);
    for(let x=-6;x<18;x+=.6)box(g,m.steel,x,.94,.72,.38,.035,.22);
    for(let x=-6;x<18;x+=1.3) {
      rod(g,m.edge,[x,1,.85],[x,1.8,.85],.019);
      rod(g,m.edge,[x,1.8,.85],[Math.min(18,x+1.3),1.8,.85],.019);
      for(const z of [-.6,.6])box(g,m.edge,x,1,z,.18,.16,.16);
    }
    for(let x=-7;x<-4;x+=.64) {
      ring(g,m.steel,[x,2.35,-.35],.09,'xy',.025);
      ring(g,m.steel,[x,2.35,.35],.09,'xy',.025);
      box(g,m.yellow,x,-.56,0,.12,.1,1.85);
    }
    rod(g,m.steel,[0,5.5,0],[0,6.25,0],.025);
    box(g,m.red,0,6.02,0,.16,.16,.16);
    // Framed panoramic cab, floor, seat and controls.
    box(g,m.white,1.1,-.65,1.05,1.4,.4,1.15);
    box(g,m.white,1.1,.98,1.05,1.45,.13,1.2);
    for(const x of [.43,1.77])for(const z of [.5,1.6])box(g,m.white,x,.15,z,.075,1.6,.075);
    for(const z of [.49,1.61]) {
      box(g,m.glass,1.1,.24,z,1.25,1.3,.025);
      box(g,m.white,1.15,.25,z,.045,1.35,.04);
    }
    for(const x of [.42,1.78])box(g,m.glass,x,.24,1.05,.025,1.3,1);
    box(g,m.steel,.92,-.27,1.05,.5,.12,.48);
    box(g,m.steel,.7,-.03,1.05,.12,.55,.48);
    box(g,m.steel,1.55,-.15,1.05,.25,.25,.85);
    rod(g,m.steel,[1.805,-.1,.72],[1.805,.55,1.15],.017);
    box(g,m.white,1.82,.48,1.72,.04,.08,.28);
    box(g,m.steel,1.1,-.88,1.05,1.8,.08,1.5);
    for(let y=-1.5;y<-.85;y+=.25)box(g,m.steel,.35,y,1.85,.5,.045,.22);
    for(const x of [.1,.6])rod(g,m.yellow,[x,-1.5,1.85],[x,.1,1.85],.023);
  }
  function hook(g) {
    for(const z of [-.17,.17]) {
      box(g,m.hazard,0,.21,z,.5,.65,.085);
      for(const x of [-.18,.18])for(const y of [-.03,.45])rod(g,m.steel,[x,y,z-.06],[x,y,z+.06],.025);
    }
    for(const z of [-.08,.08])ring(g,m.steel,[0,.25,z],.18,'xy',.032);
    rod(g,m.steel,[0,-.05,0],[0,-.2,0],.07);
  }
  function floor(g,{w,d,f,n,brick}) {
    // Slab joints and tie holes break up uninterrupted concrete surfaces.
    for(let x=-w/2+.7;x<w/2;x+=1.4) {
      box(g,m.joint,x,.202,0,.012,.006,d);
      for(const z of [-d/2-.002,d/2+.002])box(g,m.joint,x,.1,z,.065,.025,.008);
    }
    if(f<n) {
      // Stair flight inside the frame; the receiving area stays clear.
      for(let step=0;step<12;step++)box(g,m.concrete,-w/2+.95,.24+step*.19,-d/2+.55+step*.24,1.1,.18,.3);
      rod(g,m.steel,[-w/2+1.5,1.2,-d/2+.45],[-w/2+1.5,3.25,-d/2+3.3],.022);
      if(brick&&f<n-1) {
        for(let x=-w/2+.75;x<w/2;x+=1.9)for(const z of [-d/2+.2,d/2-.2]) {
          box(g,m.concrete,x,2.02,z,1.7,.18,.25);
          for(let row=0;row<5;row++)for(let j=0;j<5;j++)box(g,m.joint,x-.72+j*.32+(row%2)*.15,.25+row*.19,z+Math.sign(z)*.1,.009,.16,.01);
        }
      }
      if(brick&&f<n-2)for(const side of [-1,1]) {
        for(let z=-d/2+.8;z<d/2;z+=1.8) {
          box(g,m.brick,side*(w/2-.2),.6,z,.2,.8,1.55);
          box(g,m.brick,side*(w/2-.2),1.53,z-.6,.2,1.1,.33);
          box(g,m.concrete,side*(w/2-.2),2.08,z,.24,.18,1.55);
          for(let row=0;row<4;row++)box(g,m.joint,side*(w/2-.09),.29+row*.19,z,.014,.013,1.55);
        }
        // Unfinished stair core gives the open frame architectural depth.
        box(g,m.concrete,-w/2+1.6,1.25,-d/2+1.7,.15,2.1,2.8);
      }
      // Adjustable props supporting formwork on the highest unfinished floor.
      if(f===n-1)for(let x=-w/2+.8;x<w/2;x+=1.3)for(const z of [-1.4,1.4]) {
        rod(g,m.red,[x,.2,z],[x,2.2,z],.035);
        box(g,m.steel,x,.25,z,.2,.035,.2);box(g,m.timber,x,2.21,z,.16,.13,2.2);
        ring(g,m.steel,[x,1.2,z],.07,'xz',.016);
      }
    } else {
      for(const x of [-w/2+.3,w/2-.3])for(const z of [-d/2+.3,d/2-.3])for(let y=1.3;y<1.95;y+=.19) {
        for(const side of [-1,1]) {
          rod(g,m.steel,[x-.11,y,z+side*.11],[x+.11,y,z+side*.11],.012);
          rod(g,m.steel,[x+side*.11,y,z-.11],[x+side*.11,y,z+.11],.012);
        }
      }
      // Formwork panels, timber bundles and reinforcing rods await installation.
      for(let i=0;i<5;i++)box(g,m.timber,-w/2+1,.27+i*.075,0,.9,.065,1.7);
      for(let i=0;i<8;i++)rod(g,m.steel,[-w/2+.6,.3,-1.5+i*.07],[-w/2+2.2,.3,-1.5+i*.07],.019);
      for(let i=0;i<3;i++)box(g,m.brick,w/2-.65,.35+i*.21,-d/2+.8,.75,.2,.7);
      if(n===4) {
        // Survey equipment and secured lifting hardware establish a working roof.
        const survey=group(g,-2.05,.2,1.65);
        for(let i=0;i<3;i++) {
          const angle=i*Math.PI*2/3;
          rod(survey,m.galvanized,[Math.cos(angle)*.32,0,Math.sin(angle)*.32],[0,1.18,0],.022);
          rod(survey,m.rubber,[Math.cos(angle)*.32,0,Math.sin(angle)*.32],[Math.cos(angle)*.29,.22,Math.sin(angle)*.29],.025);
        }
        box(survey,m.steel,0,1.21,0,.25,.08,.23);
        box(survey,m.white,0,1.36,0,.19,.23,.18);
        rod(survey,m.rubber,[-.14,1.4,0],[.14,1.4,0],.065);
        batch(survey);
        for(let i=0;i<3;i++) {
          ring(g,m.steel,[2.15+i*.13,.23,-1.5],.095,'xz',.016);
          box(g,m.steel,2.15+i*.13,.23,-1.41,.13,.025,.025);
        }
        for(const x of [-1.2,1.2])for(const z of [-1.05,1.05]) {
          box(g,m.yellow,x,.207,z,.45,.008,.035);
          box(g,m.yellow,x-Math.sign(x)*.2,.207,z-Math.sign(z)*.2,.035,.008,.45);
        }
        box(g,m.blue,2.4,.4,1.5,.55,.35,.36);
        rod(g,m.steel,[2.2,.59,1.5],[2.6,.59,1.5],.02);
        for(let i=0;i<4;i++)box(g,m.timber,-2.4,.27+i*.065,-1.7,.75,.055,1.7);
        ring(g,m.rubber,[2,.215,.6],.24,'xz',.025);
        ring(g,m.rubber,[2,.218,.6],.19,'xz',.025);
      }
      for(const side of [-1,1]) {
        for(let z=-d/2;z<=d/2;z+=1.5)rod(g,m.galvanized,[side*w/2,.2,z],[side*w/2,1.2,z],.025);
        for(const y of [.7,1.15])box(g,m.timber,side*w/2,y,0,.06,.08,d);
        box(g,m.timber,0,.32,side*d/2,w,.17,.05);
      }
    }
  }
  function site(g) {
    // Corrugated site-office skins, doors, roof lips and an air conditioner.
    const offices=group(g,0,0,2);
    for(const x of [14,18]) {
      for(let dx=-1.4;dx<1.5;dx+=.15)box(offices,m.white,x+dx,.92,9.88,.035,1.65,.035);
      box(offices,m.blue,x+.65,.9,9.92,.7,1.75,.05);
      box(offices,m.glass,x+.65,1.32,9.955,.5,.48,.02);
      box(offices,m.steel,x+.88,.9,9.96,.04,.12,.04);
      box(offices,m.concrete,x+.65,.13,10.25,.95,.23,.6);
      box(offices,m.white,x-1.53,1.3,9,.25,.6,.8);
      for(let z=8.7;z<9.4;z+=.08)box(offices,m.steel,x-1.67,1.3,z,.02,.45,.022);
    }
    batch(offices);
    // Lumber, pipes, cable reel and orderly work-zone barriers.
    for(let i=0;i<5;i++)for(let j=0;j<3;j++)box(g,m.timber,-10+j*.25,.15+i*.16,2,.2,.13,2.5);
    for(let i=0;i<5;i++)rod(g,m.steel,[-11+i*.2,.18,-6],[-11+i*.2,.18,-3],.08);
    ring(g,m.timber,[-10,.55,-3],.55,'xy',.08);ring(g,m.timber,[-10,.55,-2.3],.55,'xy',.08);
    rod(g,m.steel,[-10,.55,-3],[-10,.55,-2.3],.35);
    for(const x of [-4,5,10]) {
      box(g,m.white,x,.7,6.1,1.7,.28,.09);
      for(const dx of [-.65,.65]) {
        rod(g,m.red,[x+dx,.1,5.95],[x+dx,.9,6.1],.035);
        box(g,m.steel,x+dx,.07,6.05,.4,.08,.3);
      }
      for(const dx of [-.6,0,.6])box(g,m.red,x+dx,.7,6.16,.25,.28,.025);
    }
    // Gate, threshold and clear access route instead of an uninterrupted fence.
    for(const x of [-4,2]) {
      box(g,m.steel,x,1.2,13.5,.12,2.4,.12);
      box(g,m.hazard,x,.85,13.59,.16,1.65,.035);
    }
    box(g,m.blue,-5.2,1.3,13.56,1.35,.72,.045);
    for(const x of [-1.1,-.9])box(g,m.line,x,.04,11.2,.045,.01,4.5);
    for(let z=9.3;z<13.4;z+=.65) {
      const a=box(g,m.line,-1.2,.04,z,.5,.01,.055);a.rotation.y=-.65;
      const b=box(g,m.line,-.8,.04,z,.5,.01,.055);b.rotation.y=.65;
    }
    // Foundation spoil and stacked drainage sections add depth around the plant.
    for(let i=0;i<25;i++) {
      const x=-.7+Math.sin(i*2.4)*1.1,z=1.15+Math.cos(i*1.7)*.7;
      const stone=box(g,i%2?m.concrete:m.ground,x,.08+(i%3)*.035,z,.19+(i%4)*.035,.15,.16);
      stone.rotation.set((i%3)*.25,i*.63,(i%4)*.13);
    }
    for(let i=0;i<3;i++) {
      ring(g,m.concrete,[-10.3+i*.7,.4,.3],.36,'xy',.09);
      ring(g,m.concrete,[-10.3+i*.7,.4,.9],.36,'xy',.09);
    }
  }
  function truck(g) {
    for(const z of [-.81,.81]) {
      box(g,m.glass,1.5,1.22,z,.95,.7,.025);
      box(g,m.white,1.5,.98,z,.04,1.35,.03);
      box(g,m.steel,1.88,1.3,z*1.25,.16,.28,.13);
      for(const x of [-1.4,1.3])rod(g,m.slab,[x,.3,z-.13],[x,.3,z+.13],.16);
      box(g,m.steel,.95,.69,z,.18,.045,.025);
    }
    box(g,m.steel,2.23,.72,0,.04,.25,.75);
    for(const z of [-.57,.57])box(g,m.lamp,2.24,.73,z,.04,.22,.26);
    box(g,m.white,2.28,.42,0,.14,.16,1.65);
    for(const z of [-.8,.8]) {
      box(g,m.yellow,-.8,1.12,z,2.8,.32,.07);
      for(let x=-2;x<.6;x+=.5)box(g,m.edge,x,1.12,z,.05,.34,.08);
    }
  }
  return {mast,upper,hook,floor,site,truck,ring};
}
