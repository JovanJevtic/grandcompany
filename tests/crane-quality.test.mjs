import test from 'node:test';
import assert from 'node:assert/strict';
import {craneQuality} from '../js/crane-quality.js';

test('desktop and phone get two render pixels per CSS pixel',()=>{
  assert.equal(craneQuality(1440,912,1).pixelRatio,2);
  assert.equal(craneQuality(390,321,3,true).pixelRatio,2);
  assert.equal(craneQuality(1440,912,2.5).shadowSize,4096);
  assert.equal(craneQuality(390,321,3,true).shadowSize,2048);
});
test('ultrawide, Retina and resized stages respect allocation and GPU limits',()=>{
  for(const [w,h] of [[5120,2880],[1440,912],[390,321],[1024,768]])for(const mobile of [false,true]){
    const q=craneQuality(w,h,3,mobile,4096);
    assert.ok(w*h*q.pixelRatio**2<=(mobile?2500000:6500000)+.001);
    assert.ok(w*q.pixelRatio<=4096 && h*q.pixelRatio<=4096);
    assert.ok(q.shadowSize<=4096);
    assert.ok(Number.isFinite(q.pixelRatio)&&q.pixelRatio>0);
  }
});
