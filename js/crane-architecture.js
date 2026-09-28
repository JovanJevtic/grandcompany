// Architectural variation and an excavated foundation, using the scene's shared kit.
export function architectureKit({box,rod,group,batch,m}) {
  function windowUnit(g,x,y,z,w,h,side=1) {
    box(g,m.window,x,y,z,w,h,.035);
    for(const dx of [-w/2,w/2])box(g,m.frame,x+dx,y,z+side*.025,.045,h+.08,.08);
    for(const dy of [-h/2,h/2])box(g,m.frame,x,y+dy,z+side*.025,w+.08,.045,.08);
    box(g,m.frame,x,y,z+side*.03,.035,h,.08);
    box(g,m.slab,x,y-h/2-.055,z+side*.05,w+.15,.08,.22);
  }
  function floor(g,{w,d,f,n,style}) {
    if(style==='residential'&&f<5) {
      // Installed windows below, exposed masonry and casting work above.
      for(let x=-w/2+.75;x<w/2;x+=1.9)for(const side of [-1,1]) {
        windowUnit(g,x+.14,1.51,side*(d/2-.065),1.24,.89,side);
        if(f<3)box(g,m.facade,x,.56,side*(d/2+.015),1.72,.94,.085);
      }
      for(const side of [-1,1])for(let z=-d/2+.8;z<d/2;z+=1.8) {
        const sideWindow=group(g,side*(w/2-.05),0,z+.12);sideWindow.rotation.y=side*Math.PI/2;
        windowUnit(sideWindow,0,1.49,0,1.06,.84);batch(sideWindow);
      }
      if(f>0&&f<4) {
        // Recessed balconies with thin aluminium balustrades.
        box(g,m.slab,w/2+.58,.1,.65,1.25,.18,2.7);
        for(const z of [-.65,.65,1.95])rod(g,m.frame,[w/2+1.15,.2,z],[w/2+1.15,1.13,z],.025);
        box(g,m.frame,w/2+1.15,1.14,.65,.05,.05,2.65);
        box(g,m.window,w/2+1.15,.67,.65,.025,.85,2.5);
      }
    }
    if(style==='office'&&f<n-2) {
      // Broad glazing and deep vertical fins distinguish the second volume.
      for(let x=-w/2+.7;x<w/2;x+=1.15) {
        windowUnit(g,x,1.15,d/2+.025,.98,1.75);
        box(g,m.facade,x-.56,1.14,d/2+.22,.12,1.92,.5);
      }
      box(g,m.facade,0,.31,d/2+.05,w,.25,.18);
      for(const side of [-1,1])box(g,m.facade,side*(w/2-.15),1.17,0,.22,2.1,d);
    }
    if(style==='frame') {
      // A solid stair/lift core contrasts with the exposed concrete frame.
      box(g,m.concrete,-w/2+1.4,1.17,-d/2+1.3,1.55,2.34,2.15);
      if(f<n)box(g,m.steel,-w/2+1.4,1.1,-d/2+2.39,.78,1.65,.04);
      if(f===n) {
        for(const x of [-w/2+.7,-w/2+2.1])box(g,m.formwork,x,1.05,-d/2+1.3,.085,1.9,2.25);
        for(const y of [.5,1.5])rod(g,m.steel,[-w/2+.5,y,-d/2+.15],[-w/2+2.3,y,-d/2+2.4],.035);
      }
    }
    if(style==='residential'&&f===n) {
      box(g,m.concrete,-.6,.82,-.5,1.8,1.45,1.6);
      box(g,m.steel,-.6,1.59,-.5,1.95,.12,1.75);
      for(let i=0;i<6;i++)box(g,m.frame,-.6,.5+i*.15,.315,1.3,.04,.025);
      for(const x of [1.2,1.65])rod(g,m.steel,[x,.2,-1.1],[x,1.6,-1.1],.09);
    }
  }
  function excavation(site) {
    // Continuous ground extends well beyond every shot; only the excavation has an edge.
    for(const [x,z,w,d] of [[-492.7,0,1014.6,2000],[510.2,0,979.6,2000],[17.5,-501.5,5.8,997],[17.5,500.8,5.8,998.4]]) {
      box(site,m.earth,x,-.66,z,w,1.3,d);
      box(site,m.ground,x,-.06,z,w,.1,d);
    }
    const pit=group(site,18,0,1.4);
    box(pit,m.earth,-.5,-1.25,-2.1,5.8,.14,4.6);
    box(pit,m.concrete,.75,-1.08,-2.55,2.4,.2,2.8);
    for(let x=-.3;x<1.9;x+=.28)rod(pit,m.steel,[x,-.94,-3.8],[x,-.94,-1.3],.019);
    for(let z=-3.8;z<-1.2;z+=.28)rod(pit,m.steel,[-.3,-.91,z],[1.85,-.91,z],.019);
    for(const x of [-.15,1.65])for(const z of [-3.5,-1.55]) {
      for(const dx of [-.09,.09])for(const dz of [-.09,.09])rod(pit,m.steel,[x+dx,-.94,z+dz],[x+dx,.3,z+dz],.02);
    }
    // Timber shoring and steel soldier posts on the two exposed sides.
    for(const x of [-3.35,2.35]) {
      for(let y=-1.1;y<0;y+=.19)box(pit,m.timber,x,y,-2.1,.08,.16,4.5);
      for(let z=-4.1;z<.2;z+=1.05)box(pit,m.steel,x,-.52,z,.12,1.25,.12);
    }
    for(let x=-3.2;x<2.4;x+=1.05) {
      rod(pit,m.red,[x,.02,-4.5],[x,1.02,-4.5],.025);
      rod(pit,m.line,[x,.65,-4.5],[Math.min(2.4,x+1.05),.65,-4.5],.022);
    }
    // Footprints, trench-edge barriers and a ladder provide human scale.
    for(let i=0;i<10;i++)box(pit,m.steel,-2.7,-1.15+i*.16,-3.25+i*.11,.55,.035,.07);
    for(const x of [-3,-2.4])rod(pit,m.yellow,[x,-1.25,-3.35],[x,.5,-2.2],.03);
    for(let i=0;i<13;i++) {
      const x=-4.15-Math.sin(i*2.4)*.65,z=-2+Math.cos(i*1.9)*1.2;
      const stone=box(pit,m.earth,x,.13+(i%3)*.08,z,.4,.3,.32);stone.rotation.y=i*.73;
    }
    batch(pit);
  }
  return {floor,excavation};
}
