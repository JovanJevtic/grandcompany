import * as THREE from '../vendor/three.module.min.js';

// Linijski crtež (line-art) za 3D scenu: bez tekstura, boja i sjenki.
// 1) Scena se nacrta jednom sa materijalom normala (pravac svake površine) u render target sa
//    dubinom. 2) Shader preko cijelog ekrana poredi susjedne piksele: gdje se pravac površine ili
//    dubina naglo promijene, crta se tamnoplava linija (boja teksta sajta); površine objekata su
//    bijele, a prazno nebo ostaje providno (iza platna su CSS slojevi neba).
// Linije su glatke (mekani prelaz preko smoothstep) i iste debljine u pikselima ekrana.
// API je isti kao kod starog SSAO renderera (compile, setSamples, setSize, render, dispose).

const LINE = new THREE.Color('#1b2436');
const FILL = new THREE.Color('#ffffff');

export function createCraneRenderer(renderer, world) {
  const normalMaterial = new THREE.MeshNormalMaterial();
  let target = null;
  let width = 1, height = 1;

  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tNormal: { value: null },
        tDepth: { value: null },
        resolution: { value: new THREE.Vector2(1, 1) },
        thickness: { value: 1.3 },
        near: { value: 0.1 },
        far: { value: 220 },
        lineColor: { value: new THREE.Vector3(LINE.r, LINE.g, LINE.b) },
        fillColor: { value: new THREE.Vector3(FILL.r, FILL.g, FILL.b) },
        fillAlpha: { value: 1 },
        dotSize: { value: 1.5 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform sampler2D tNormal;
        uniform sampler2D tDepth;
        uniform vec2 resolution;
        uniform float thickness, near, far, fillAlpha, dotSize;
        uniform vec3 lineColor, fillColor;
        varying vec2 vUv;
        float lin(float d) { float z = d * 2.0 - 1.0; return (2.0 * near * far) / (far + near - z * (far - near)); }
        void sampleAt(vec2 uv, out vec3 n, out float d, out float a) {
          vec4 t = texture2D(tNormal, uv);
          n = normalize(t.rgb * 2.0 - 1.0);
          a = t.a;
          d = lin(texture2D(tDepth, uv).r);
        }
        void main() {
          vec2 px = thickness / resolution;
          vec3 n0; float d0; float a0;
          sampleAt(vUv, n0, d0, a0);
          float nEdge = 0.0, dEdge = 0.0, aEdge = 0.0;
          vec2 offs[8];
          offs[0] = vec2(1.0, 0.0); offs[1] = vec2(-1.0, 0.0); offs[2] = vec2(0.0, 1.0); offs[3] = vec2(0.0, -1.0);
          offs[4] = vec2(0.7, 0.7); offs[5] = vec2(-0.7, 0.7); offs[6] = vec2(0.7, -0.7); offs[7] = vec2(-0.7, -0.7);
          for (int i = 0; i < 8; i++) {
            vec3 n; float d; float a;
            sampleAt(vUv + offs[i] * px, n, d, a);
            aEdge = max(aEdge, abs(a - a0));
            if (a > 0.5 && a0 > 0.5) {
              nEdge = max(nEdge, 1.0 - dot(n0, n));
              dEdge = max(dEdge, abs(d - d0) / max(d0, 0.001));
            }
          }
          // površine pod oštrim uglom (gledane "po ivici") daju lažne linije dubine — prigušujemo ih
          float facing = clamp(abs(n0.z), 0.2, 1.0);
          float e = smoothstep(0.12, 0.32, nEdge);
          e = max(e, smoothstep(0.012 / facing, 0.03 / facing, dEdge));
          e = max(e, smoothstep(0.3, 0.9, aEdge));
          // Zrnasta tačkasta tekstura (stipple): gustina tačaka prati sjenčenje — strane okrenute
          // od svjetla su gušće (tamnije), osvijetljene rjeđe. Tačke su u boji linija (ink plava).
          vec3 L = normalize(vec3(-0.45, 0.72, 0.55));
          float lit = clamp(dot(n0, L) * 0.5 + 0.5, 0.0, 1.0);
          float shade = 1.0 - lit;
          vec2 cell = floor(gl_FragCoord.xy / dotSize);
          float rnd = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
          float density = 0.012 + pow(shade, 1.7) * 0.34;
          float stipple = a0 * step(rnd, density) * 0.7;
          float ink = max(e, stipple);
          float alpha = max(a0, e) * fillAlpha; // fillAlpha = rastvaranje cijele scene na kraju (2D)
          if (alpha < 0.002) discard;
          vec3 col = mix(fillColor, lineColor, ink);
          gl_FragColor = vec4(col * alpha, alpha);
        }
      `,
    }),
  );
  const post = new THREE.Scene();
  post.add(quad);
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  function ensureTarget() {
    const ratio = renderer.getPixelRatio();
    const w = Math.max(1, Math.round(width * ratio)), h = Math.max(1, Math.round(height * ratio));
    if (target && target.width === w && target.height === h) return;
    target?.dispose();
    const depth = new THREE.DepthTexture(w, h);
    depth.type = THREE.UnsignedIntType;
    target = new THREE.WebGLRenderTarget(w, h, { depthTexture: depth, type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    quad.material.uniforms.tNormal.value = target.texture;
    quad.material.uniforms.tDepth.value = depth;
    quad.material.uniforms.resolution.value.set(w, h);
    quad.material.uniforms.thickness.value = 1.15 * Math.max(1, ratio);
    quad.material.uniforms.dotSize.value = 1.4 * Math.max(1, ratio);
  }

  return {
    async compile() {
      ensureTarget();
      const prev = world.scene.overrideMaterial;
      world.scene.overrideMaterial = normalMaterial;
      renderer.setRenderTarget(target);
      await renderer.compileAsync(world.scene, world.camera);
      renderer.setRenderTarget(null);
      world.scene.overrideMaterial = prev;
      await renderer.compileAsync(post, postCam);
    },
    setSamples() {},
    setSize(w, h) {
      width = w;
      height = h;
      ensureTarget();
    },
    /** fade: 1 = puna scena; 0 = scena se potpuno rastvorila (kraj herosa ostaje 2D: nebo + rečenica) */
    render(_contact = 1, fillAlpha = 1) {
      ensureTarget();
      const cam = world.camera;
      quad.material.uniforms.near.value = cam.near;
      quad.material.uniforms.far.value = cam.far;
      quad.material.uniforms.fillAlpha.value = fillAlpha;
      const bg = world.scene.background;
      world.scene.background = null;
      world.scene.overrideMaterial = normalMaterial;
      renderer.setRenderTarget(target);
      renderer.setClearColor(0x000000, 0);
      renderer.clear(true, true, true);
      renderer.render(world.scene, cam);
      world.scene.overrideMaterial = null;
      world.scene.background = bg;
      renderer.setRenderTarget(null);
      renderer.clear(true, true, true);
      renderer.render(post, postCam);
    },
    dispose() {
      target?.dispose();
      normalMaterial.dispose();
      quad.geometry.dispose();
      quad.material.dispose();
    },
  };
}
