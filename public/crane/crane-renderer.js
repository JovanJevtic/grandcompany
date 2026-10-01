import * as THREE from '../vendor/three.module.min.js';
import {EffectComposer} from '../vendor/three-addons/postprocessing/EffectComposer.js';
import {RenderPass} from '../vendor/three-addons/postprocessing/RenderPass.js';
import {SSAOPass} from '../vendor/three-addons/postprocessing/SSAOPass.js';
import {OutputPass} from '../vendor/three-addons/postprocessing/OutputPass.js';
import {ShaderPass} from '../vendor/three-addons/postprocessing/ShaderPass.js';
import {FXAAShader} from '../vendor/three-addons/shaders/FXAAShader.js';

// Contact shading gives floors, lattice joints and stacked blocks physical depth.
export function createCraneRenderer(renderer,world,contactSamples=32) {
  const composer=new EffectComposer(renderer);
  let pixelRatio=renderer.getPixelRatio();
  const beauty=new RenderPass(world.scene,world.camera);
  const contact=new SSAOPass(world.scene,world.camera,1,1,contactSamples);
  contact.kernelRadius=.85;
  contact.minDistance=.00015;
  contact.maxDistance=.025;
  // Fade contact shading to neutral while the architectural layers dissolve in.
  contact.copyMaterial.fragmentShader=contact.copyMaterial.fragmentShader.replace(
    'gl_FragColor = opacity * texel;',
    'gl_FragColor = vec4(mix(vec3(1.0), texel.rgb, opacity), texel.a);'
  );
  const output=new OutputPass();
  const antialias=new ShaderPass(FXAAShader);
  composer.addPass(beauty);composer.addPass(contact);composer.addPass(output);composer.addPass(antialias);
  return {
    // Prevod šejdera unaprijed, u ISTOJ varijanti koju koristi crtanje: scena se crta u render
    // target kompozera (linearno, bez tone mappinga), a ne direktno na ekran — bez ovoga bi se
    // prevodile pogrešne varijante, a prave bi opet stale usred skrola.
    async compile() {
      const previous=renderer.getRenderTarget();
      // Priprema programa je teška za glavnu nit, pa je sječemo po grupama scene (kran,
      // gradilište, okolne zgrade, fasada, kupatilo…) sa predahom između — stranica ostaje živa.
      // Svjetla se uzimaju iz cijele scene (treći argument), pa su varijante iste kao pri crtanju.
      const pending=[];
      for(const part of world.scene.children) {
        let meshes=false;part.traverse(o=>{if(o.isMesh||o.isPoints)meshes=true;});
        if(!meshes)continue;
        renderer.setRenderTarget(composer.renderTarget1);
        pending.push(renderer.compileAsync(part,world.camera,world.scene));
        renderer.setRenderTarget(previous);
        await new Promise(r=>setTimeout(r,0));
      }
      renderer.setRenderTarget(composer.renderTarget1);
      const main=Promise.all(pending);
      // SSAO crta normale sa jednim zajedničkim materijalom (override) — i njegove varijante
      // (obična i instancirana geometrija) prevodimo unaprijed, u njegov render target.
      renderer.setRenderTarget(contact.normalRenderTarget);
      const probe=new THREE.Scene(),geometry=new THREE.BoxGeometry();
      probe.add(new THREE.Mesh(geometry,contact.normalMaterial),new THREE.InstancedMesh(geometry,contact.normalMaterial,1));
      // Sjenke: dubinski materijal (običan i instanciran) koji three koristi za mapu sjenki.
      const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});
      probe.add(new THREE.Mesh(geometry,depth),new THREE.InstancedMesh(geometry,depth,1));
      const normals=renderer.compileAsync(probe,world.camera);
      // Koraci obrade slike (SSAO, blur, miješanje, izlaz) crtaju se u render targete, a FXAA na ekran.
      const quad=new THREE.PlaneGeometry(2,2),passes=new THREE.Scene(),screen=new THREE.Scene();
      for(const material of [contact.ssaoMaterial,contact.blurMaterial,contact.copyMaterial,contact.depthRenderMaterial,output.material])
        if(material)passes.add(new THREE.Mesh(quad,material));
      screen.add(new THREE.Mesh(quad,antialias.material));
      renderer.setRenderTarget(composer.renderTarget2);
      const post=renderer.compileAsync(passes,world.camera);
      renderer.setRenderTarget(null);
      const final=renderer.compileAsync(screen,world.camera);
      renderer.setRenderTarget(previous);
      await Promise.all([main,normals,post,final]);
      geometry.dispose();quad.dispose();depth.dispose();
    },
    // MSAA na slici scene: na nižoj rezoluciji čuva tanke kablove glatkim (jeftinije od 2x piksela).
    setSamples(n) {
      for(const target of [composer.renderTarget1,composer.renderTarget2])
        if(target.samples!==n){target.samples=n;target.dispose();}
    },
    setSize(width,height) {
      const ratio=renderer.getPixelRatio();
      if(pixelRatio!==ratio){composer.setPixelRatio(ratio);pixelRatio=ratio;}
      composer.setSize(width,height);
      // Kontaktne sjenke (SSAO) su meke, pa se računaju na pola rezolucije — četvrtina posla,
      // a razlika se ne vidi. Rezultat se rastegne preko pune slike u koraku miješanja.
      // Kontaktne sjenke (SSAO) na pola rezolucije pa razvučene daju vidljivo "zrno" (šum iz
      // kernela se uveća 2×). Do 1,5× ih računamo u punoj rezoluciji; tek iznad toga upola.
      const ssao=ratio<=1.5?1:.5;
      contact.setSize(Math.max(1,Math.round(width*ratio*ssao)),Math.max(1,Math.round(height*ratio*ssao)));
      antialias.uniforms.resolution.value.set(1/(width*ratio),1/(height*ratio));
    },
    render(contactStrength=1) {
      contact.enabled=contactStrength>.001;
      contact.copyMaterial.uniforms.opacity.value=contactStrength;
      contact.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(world.camera.projectionMatrix);
      contact.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(world.camera.projectionMatrixInverse);
      composer.render();
    },
    dispose() {contact.dispose();output.dispose();antialias.dispose();composer.dispose();},
  };
}
