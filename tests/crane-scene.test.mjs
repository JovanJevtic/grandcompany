import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.min.js';
import {createCraneScene, choreography} from '../js/crane-scene.js';

test('opening has no construction site and orbit is reversible',()=>{
  const w=createCraneScene();
  w.update(0);assert.equal(w.site.visible,false);
  const initial=w.camera.position.clone();
  for(let i=0;i<=45;i++) {w.update(i/100);assert.equal(w.site.visible,false);}
  w.update(1);assert.equal(w.site.visible,true);
  w.update(0);assert.ok(w.camera.position.distanceTo(initial)<1e-9);assert.equal(w.site.visible,false);
});
test('delivery lands inside receiving slab with no floating payload',()=>{
  const w=createCraneScene();w.update(1);w.scene.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(w.load);
  assert.ok(Math.abs(bounds.min.y-9.6)<.03,`pallet bottom ${bounds.min.y}, slab top 9.6`);
  assert.ok(bounds.min.x>5.5&&bounds.max.x<12.5);
  assert.ok(bounds.min.z>-3&&bounds.max.z<3);
  assert.equal(choreography(1).slack,1);
  assert.ok(w.floors.every(f=>f.group.visible&&f.group.scale.y===1));
});
test('continuous camera, finite transforms, and stationary crane base',()=>{
  const w=createCraneScene();let previous;
  for(let i=0;i<=1000;i++) {
    const p=i/1000;w.update(p,1.4);w.scene.updateMatrixWorld(true);
    assert.equal(w.slew.parent.position.x,-7);
    for(const value of [...w.camera.position.toArray(),...w.camera.quaternion.toArray()])assert.ok(Number.isFinite(value));
    if(previous)assert.ok(previous.distanceTo(w.camera.position)<1.5,'camera jumps between keyframes');
    previous=w.camera.position.clone();
  }
});

test('assembled-site batching preserves every visible instance',()=>{
  const w=createCraneScene();
  function snapshot(p) {
    w.update(p);w.scene.updateMatrixWorld(true);const parts=new Map(),matrix=new THREE.Matrix4();
    function visit(o) {
      if(!o.visible)return;
      if(o.isInstancedMesh)for(let i=0;i<o.count;i++) {
        o.getMatrixAt(i,matrix);const key=`${o.geometry.id}:${o.material.id}`;
        if(!parts.has(key))parts.set(key,[]);
        parts.get(key).push(o.matrixWorld.clone().multiply(matrix).elements);
      }
      for(const c of o.children)visit(c);
    }
    visit(w.site);return parts;
  }
  const before=snapshot(.684),after=snapshot(.686);
  assert.deepEqual([...before.keys()].sort(),[...after.keys()].sort());
  for(const [key,matrices] of before) {
    assert.equal(matrices.length,after.get(key).length);
    matrices.forEach((matrix,i)=>matrix.forEach((value,j)=>assert.ok(Math.abs(value-after.get(key)[i][j])<1e-5,'instance moved during batching')));
  }
});

test('payload stays in frame through every camera angle on desktop and portrait',()=>{
  const w=createCraneScene();
  for(const aspect of [1.5,.75])for(let i=0;i<=200;i++) {
    w.update(i/200,aspect);w.scene.updateMatrixWorld(true);w.camera.updateMatrixWorld();
    for(const x of [-.98,.98])for(const y of [0,3.25])for(const z of [-.82,.82]) {
      const p=w.load.localToWorld(new THREE.Vector3(x,y,z)).project(w.camera);
      assert.ok(Math.abs(p.x)<.96&&Math.abs(p.y)<.96&&p.z<1,`load clipped at ${i/200}, aspect ${aspect}`);
    }
  }
});

// The revised story uses a small camera arc, never another full orbit.
test('camera and crane rotation remain restrained',()=>{
  const poses=Array.from({length:101},(_,i)=>choreography(i/100));
  for(const key of ['azimuth','slew']) {
    const travel=poses.slice(1).reduce((sum,p,i)=>sum+Math.abs(p[key]-poses[i][key]),0);
    assert.ok(travel<(key==='slew'?Math.PI/2:Math.PI/3),`${key} exceeds its short rotation`);
    if(key==='slew')assert.ok(travel>Math.PI/3,'crane rotation is too subtle');
  }
});

test('opening crops the base, camera approaches cargo then reveals the site',()=>{
  const w=createCraneScene();
  for(const aspect of [1.5,.75]) {
    w.update(0,aspect);w.camera.updateMatrixWorld();
    assert.ok(new THREE.Vector3(-7,0,0).project(w.camera).y<-1,'base visible in close opening');
    w.update(.68,aspect);w.camera.updateMatrixWorld();
    assert.ok(Math.abs(new THREE.Vector3(-7,31.25,0).project(w.camera).y)<1,'crane head clipped in establishing view');
  }
  const detail=choreography(.323),opening=choreography(0);
  assert.ok(detail.distance<opening.distance*.9,'cargo shot must move closer');
  assert.ok(detail.target[0]>2,'detail shot must track toward the payload');
  assert.ok(Math.abs(detail.azimuth-opening.azimuth)>.4,'detail shot needs a distinct angle');
  let previous=choreography(.34);
  for(let p=.35;p<=.68;p+=.01) {
    const next=choreography(p);
    assert.ok(Math.abs(next.azimuth-previous.azimuth)<.035,'camera angle jumps');
    assert.equal(next.slew,0);
    assert.ok(next.distance>=previous.distance);
    assert.ok(next.target[1]<=previous.target[1]+1e-9);
    previous=next;
  }
});

test('site vehicles and hoist follow scroll reversibly without appearing in opening',()=>{
  const w=createCraneScene();
  for(const p of [0,.2,.45,.5]) {w.update(p);assert.equal(w.activityRoot.visible,false);}
  const snapshot=p=>{
    w.update(p);
    return [w.truck.position.x,w.activity.cage.position.y,w.activity.turret.rotation.y,w.activity.boom.rotation.z,w.activity.dipper.rotation.z,w.activity.bucket.rotation.z,...w.wheels.map(o=>o.rotation.z)];
  };
  const start=snapshot(.52),middle=snapshot(.75),end=snapshot(1);
  assert.ok(start[0]<middle[0]&&middle[0]===end[0]);
  assert.ok(start[1]<middle[1]&&middle[1]<end[1]);
  assert.notEqual(middle[3],end[3]);
  assert.ok(w.activity.cage.position.y+1.9<18.7,'hoist exceeds guides');
  assert.equal(w.truck.position.z,8);
  assert.deepEqual(snapshot(.75),middle);
  assert.deepEqual(snapshot(.52),start);
  for(let i=51;i<=100;i++) {
    w.update(i/100);w.scene.updateMatrixWorld(true);
    const truck=new THREE.Box3().setFromObject(w.truck);
    assert.ok(truck.min.z>=6&&truck.max.z<=10,'truck leaves its road');
    assert.ok(truck.min.x>=-13&&truck.max.x<=21,'truck leaves site');
    const bucket=w.activity.bucket.getWorldPosition(new THREE.Vector3());
    assert.ok(bucket.x<21&&bucket.y>-.9,'excavator leaves site or intersects foundation');
  }
});

test('establishing shot includes the main site before the camera enters',()=>{
  const w=createCraneScene();
  for(const aspect of [.75,1,1.5,2])for(const p of [.68]) {
    w.update(p,aspect);w.camera.updateMatrixWorld();
    const points=[[-7,31.25,0]];
    for(const x of [-13,21])for(const z of [-16,14])points.push([x,-1.31,z]);
    for(const point of points) {
      const projected=new THREE.Vector3(...point).project(w.camera);
      assert.ok(Math.abs(projected.x)<=.941&&Math.abs(projected.y)<=.921,`site clipped at ${p}, aspect ${aspect}`);
    }
  }
});


test('final approach moves into the site, keeps cargo visible and has ground across the frame',()=>{
  const w=createCraneScene(),cargo=new THREE.Vector3(),ray=new THREE.Raycaster();
  for(const aspect of [.75,1.67,2.2]) {
    w.update(.68,aspect);w.scene.updateMatrixWorld(true);w.load.getWorldPosition(cargo);
    const establishingDistance=w.camera.position.distanceTo(cargo),establishingHeight=w.camera.position.y;
    w.update(1,aspect);w.scene.updateMatrixWorld(true);w.camera.updateMatrixWorld();w.load.getWorldPosition(cargo);
    assert.ok(w.camera.position.distanceTo(cargo)<establishingDistance*.5,'camera must approach, not keep the island framed');
    assert.ok(w.camera.position.y<establishingHeight-10,'camera must descend into the site');
    const ground=new THREE.Plane(new THREE.Vector3(0,1,0),.01);
    for(const x of [-.99,0,.99]) {
      ray.setFromCamera(new THREE.Vector2(x,-.9),w.camera);
      const point=ray.ray.intersectPlane(ground,new THREE.Vector3());
      assert.ok(point&&point.x>-120&&point.x<120&&point.z>-120&&point.z<100,'ground has a visible edge');
    }
    const before=w.camera.position.clone();w.update(0,aspect);w.update(1,aspect);
    assert.ok(before.distanceTo(w.camera.position)<1e-9,'entry does not reverse consistently');
  }
});

test('architectural reveal preserves full floor proportions and crane opacity',()=>{
  const w=createCraneScene();
  for(const p of [.47,.51,.56,.74,.81,1,.51]) {
    w.update(p);
    for(const floor of w.floors) {
      assert.equal(floor.group.scale.y,1,'building floor is being stretched');
      assert.equal(floor.group.position.y,floor.height,'building floor is moving');
    }
    assert.equal(w.site.position.y,0);
    assert.equal(w.materials.yellow.opacity,1,'site fade must not fade the crane');
    assert.equal(w.materials.steel.opacity,1,'site fade must not fade lifting hardware');
  }
});
