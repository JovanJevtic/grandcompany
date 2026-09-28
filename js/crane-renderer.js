import {EffectComposer} from '../vendor/three-addons/postprocessing/EffectComposer.js';
import {RenderPass} from '../vendor/three-addons/postprocessing/RenderPass.js';
import {SSAOPass} from '../vendor/three-addons/postprocessing/SSAOPass.js';
import {OutputPass} from '../vendor/three-addons/postprocessing/OutputPass.js';
import {ShaderPass} from '../vendor/three-addons/postprocessing/ShaderPass.js';
import {FXAAShader} from '../vendor/three-addons/shaders/FXAAShader.js';

// Contact shading gives floors, lattice joints and stacked blocks physical depth.
export function createCraneRenderer(renderer,world) {
  const composer=new EffectComposer(renderer);
  const beauty=new RenderPass(world.scene,world.camera);
  const contact=new SSAOPass(world.scene,world.camera,1,1,16);
  contact.kernelRadius=.85;
  contact.minDistance=.00015;
  contact.maxDistance=.025;
  const output=new OutputPass();
  const antialias=new ShaderPass(FXAAShader);
  composer.addPass(beauty);composer.addPass(contact);composer.addPass(output);composer.addPass(antialias);
  return {
    setSize(width,height) {
      composer.setSize(width,height);
      const ratio=renderer.getPixelRatio();
      antialias.uniforms.resolution.value.set(1/(width*ratio),1/(height*ratio));
    },
    render() {
      contact.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(world.camera.projectionMatrix);
      contact.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(world.camera.projectionMatrixInverse);
      composer.render();
    },
    dispose() {contact.dispose();output.dispose();antialias.dispose();composer.dispose();},
  };
}
