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
    setSize(width,height) {
      const ratio=renderer.getPixelRatio();
      if(pixelRatio!==ratio){composer.setPixelRatio(ratio);pixelRatio=ratio;}
      composer.setSize(width,height);
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
