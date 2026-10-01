import * as THREE from '../vendor/three.module.min.js';

// Štampa u tačkama (halftone) za 3D scenu krana — stil iz Marijinih referenci: kobalt mastilo
// na papiru, sve od tačaka (gušće/veće = tamnije), kran kao puno mastilo sa "izbijenim"
// svijetlim linijama između elemenata rešetke.
//
// 1) G-buffer: scena se nacrta jednom, svaki materijal zamijenjen "print" materijalom koji
//    upisuje pravac površine (RG), količinu mastila (B: 0 = papir, 1 = puno mastilo) i pokrivenost (A).
// 2) Shader preko cijelog ekrana: ivice (iz normala i dubine) + AM raster — tačke na rotiranoj
//    mreži, poluprečnik raste sa tonom. Pozadina (grad u oblacima) je tonska slika koja ide kroz
//    ISTI raster, pa su scena i pozadina jedna štampa.
// 3) Poglavlja priče mijenjaju boju papira i mastila, veličinu i ugao rastera. Prelaz ide u
//    stepenastim kolonama (isti motiv kao SkySwipe posle herosa).
//
// API je isti kao kod starog renderera (compile, setSamples, setSize, render, dispose) + setStyle.

// ——— Poglavlja (sirovi progres skrola 0..1) ———
// paper/ink: sRGB hex; cell: veličina ćelije rastera u CSS pikselima; angle: ugao rastera;
// bg: koliko se vidi grad u pozadini (0..1); at: progres kad prelaz u ovo poglavlje počinje.
export const STAGES = [
  { at: 0, paper: '#e4e8f0', ink: '#1e40d6', cell: 6.5, angle: 45, bg: .32 },  // kran se okreće
  { at: .17, paper: '#1e40d6', ink: '#e9eefb', cell: 5.2, angle: 18, bg: .30 }, // zgrada niče — plavi blok (negativ, nacrt)
  { at: .36, paper: '#a9c4e4', ink: '#142a8f', cell: 7.4, angle: 72, bg: .34 }, // spuštanje na krov, kuka se otkači
  { at: .58, paper: '#f4f1ec', ink: '#1e40d6', cell: 5.0, angle: 45, bg: .42 },   // enterijer — topao papir
  { at: .925, paper: '#f4f1ec', ink: '#2a4fe0', cell: 6.0, angle: 30, bg: .5 }, // napolju, nebo i rečenica
];
const WIPE = .045; // trajanje prelaza u progresu
const COLS = 12;   // broj kolona stepenastog prelaza
const STEPS = 8;   // skokovi po visini (steps(8) kao SkySwipe)

const hexRGB = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

/** Napredak prelaza i (0..1) za dati progres. */
export function wipeAt(i, p) {
  const s = STAGES[i];
  return Math.min(1, Math.max(0, (p - s.at) / WIPE));
}

/** Isto što radi shader, za jednu tačku ekrana (uv 0..1, y naviše) — za boju wordmarka u CSS-u. */
export function stageAt(p, x, y, cols = COLS) {
  let stage = 0;
  for (let i = 1; i < STAGES.length; i++) if (switched(wipeAt(i, p), x, y, i, cols)) stage = i;
  return stage;
}
function switched(w, x, y, i, cols) {
  if (w <= 0) return false;
  if (w >= 1) return true;
  const col = Math.floor(x * cols);
  const order = i % 2 ? col : cols - 1 - col;
  const lag = .55 * order / (cols - 1);
  const local = Math.min(1, Math.max(0, (w - lag) / (1 - .55)));
  const h = Math.floor(local * STEPS) / STEPS;
  const yy = i % 2 ? y : 1 - y;
  return yy < h;
}

// ——— Print materijal (G-buffer) ———
const PRINT_VERT = /* glsl */ `
  #include <common>
  varying vec3 vViewN;
  varying vec3 vWorldN;
  varying vec2 vUv;
  varying float vDepth;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    #include <beginnormal_vertex>
    #include <defaultnormal_vertex>
    #include <begin_vertex>
    #include <project_vertex>
    vViewN = normalize(transformedNormal);
    vDepth = -mvPosition.z;
    vec4 wp = vec4(transformed, 1.0);
    #ifdef USE_INSTANCING
      wp = instanceMatrix * wp;
    #endif
    vWorld = (modelMatrix * wp).xyz;
    vWorldN = normalize((vec4(vViewN, 0.0) * viewMatrix).xyz);
  }
`;
const PRINT_FRAG = /* glsl */ `
  uniform float baseTone;
  uniform float opacity;
  uniform vec3 lightDir;
  uniform vec2 fog;
  uniform float shadeK;
  uniform vec4 radial;   // xz centar, r0, r1: ton se gasi od r0 do r1 (tlo); r1 = 0 znači bez toga
  uniform float edgeW;   // 1 = crta obris; manje = bez obrisa prema papiru (tlo)
  varying float vDepth;
  varying vec3 vWorld;
  #ifdef PRINT_MAP
  uniform sampler2D map;
  #endif
  varying vec3 vViewN;
  varying vec3 vWorldN;
  varying vec2 vUv;
  float bayer4(vec2 p) {
    vec2 q = mod(floor(p), 4.0);
    float i = q.x + q.y * 4.0;
    // 4x4 Bayer matrica, redom
    float m[16];
    m[0]=0.;m[1]=8.;m[2]=2.;m[3]=10.;m[4]=12.;m[5]=4.;m[6]=14.;m[7]=6.;
    m[8]=3.;m[9]=11.;m[10]=1.;m[11]=9.;m[12]=15.;m[13]=7.;m[14]=13.;m[15]=5.;
    for (int k = 0; k < 16; k++) if (float(k) == i) return (m[k] + .5) / 16.0;
    return .5;
  }
  void main() {
    // Providnost (staklo, pretapanje enterijera) kao raster tačaka: dio piksela se ne crta.
    if (opacity < .999 && opacity <= bayer4(gl_FragCoord.xy)) discard;
    vec3 n = normalize(vViewN);
    vec3 nw = normalize(vWorldN);
    #ifdef DOUBLE_SIDED
      float fd = gl_FrontFacing ? 1.0 : -1.0;
      n *= fd; nw *= fd;
    #endif
    float lamb = max(dot(nw, lightDir), 0.0);
    float light = .26 + .64 * lamb + .10 * (nw.y * .5 + .5);
    float base = baseTone;
    #ifdef PRINT_MAP
      vec3 tex = texture2D(map, vUv).rgb;
      float lum = pow(max(dot(tex, vec3(.2126, .7152, .0722)), 0.0), .4545);
      base = max(base, clamp((1.0 - lum) * 1.15, 0.0, 1.0));
    #endif
    float tone;
    // Mastilo (kran, čelik): puno, samo lica okrenuta direktno ka svjetlu se "otvore" u tačke.
    if (base > .88) tone = 1.0 - pow(lamb, 6.0) * .2;
    else tone = clamp(base + (1.0 - base) * (1.0 - light) * shadeK, 0.0, 1.0);
    if (radial.w > 0.0) tone *= 1.0 - smoothstep(radial.z, radial.w, length(vWorld.xz - radial.xy));
    // vazdušna perspektiva: daleko = manje mastila (stapa se sa papirom)
    tone *= 1.0 - .92 * smoothstep(fog.x, fog.y, vDepth);
    gl_FragColor = vec4(n.xy * .5 + .5, tone, edgeW);
  }
`;

// ——— Završni shader (raster + ivice + boje poglavlja) ———
const POST_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D tG;
  uniform sampler2D tDepth;
  uniform sampler2D tBg;
  uniform vec2 resolution;
  uniform float near, far, dpr, fill, bgAspect, cols;
  uniform vec2 bgShift;
  uniform float bgScale;
  uniform vec3 paperC[5];
  uniform vec3 inkC[5];
  uniform float cellC[5];
  uniform float angleC[5];
  uniform float bgC[5];
  uniform float wipe[5];
  varying vec2 vUv;

  float lin(float d) { float z = d * 2.0 - 1.0; return (2.0 * near * far) / (far + near - z * (far - near)); }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  bool switched(float w, vec2 uv, float i) {
    if (w <= 0.0) return false;
    if (w >= 1.0) return true;
    float col = floor(uv.x * cols);
    bool odd = mod(i, 2.0) > .5;
    float order = odd ? col : cols - 1.0 - col;
    float lag = .55 * order / (cols - 1.0);
    float local = clamp((w - lag) / (1.0 - .55), 0.0, 1.0);
    float h = floor(local * 8.0) / 8.0;
    float y = odd ? uv.y : 1.0 - uv.y;
    return y < h;
  }
  void sampleG(vec2 uv, out vec3 n, out float d, out float a, out float tone) {
    vec4 g = texture2D(tG, uv);
    tone = g.b;
    vec2 xy = g.rg * 2.0 - 1.0;
    n = vec3(xy, sqrt(max(0.0, 1.0 - dot(xy, xy))));
    a = g.a;
    d = lin(texture2D(tDepth, uv).r);
  }
  void main() {
    vec2 frag = gl_FragCoord.xy;

    // ——— poglavlje za ovaj piksel ———
    int si = 0;
    for (int i = 1; i < 5; i++) if (switched(wipe[i], vUv, float(i))) si = i;
    vec3 paper = paperC[0], ink = inkC[0];
    float cell = cellC[0], ang = angleC[0], bgS = bgC[0];
    for (int i = 1; i < 5; i++) if (i == si) { paper = paperC[i]; ink = inkC[i]; cell = cellC[i]; ang = angleC[i]; bgS = bgC[i]; }
    cell *= dpr;

    // ——— G-buffer ———
    vec4 g0 = texture2D(tG, vUv);
    vec3 n0; float d0; float a0; float tone0;
    sampleG(vUv, n0, d0, a0, tone0);

    // ——— pozadina: tonska slika grada, "cover" preko platna ———
    vec2 buv = vUv - .5;
    float sa = resolution.x / resolution.y;
    if (sa > bgAspect) buv.y *= bgAspect / sa; else buv.x *= sa / bgAspect;
    buv = buv * bgScale + .5 + bgShift;
    float bgTone = (1.0 - texture2D(tBg, clamp(buv, .001, .999)).r) * bgS;

    // ——— ivice ———
    vec2 px = max(1.0, 1.1 * dpr) / resolution;
    float nEdge = 0.0, dEdge = 0.0, aEdge = 0.0;
    vec2 offs[8];
    offs[0] = vec2(1.0, 0.0); offs[1] = vec2(-1.0, 0.0); offs[2] = vec2(0.0, 1.0); offs[3] = vec2(0.0, -1.0);
    offs[4] = vec2(0.7, 0.7); offs[5] = vec2(-0.7, 0.7); offs[6] = vec2(0.7, -0.7); offs[7] = vec2(-0.7, -0.7);
    float c0 = step(.1, a0), farEdge = 0.0, solidN = 0.0;
    for (int i = 0; i < 8; i++) {
      vec3 n; float d; float a; float tn;
      sampleG(vUv + offs[i] * px, n, d, a, tn);
      float c = step(.1, a);
      solidN = max(solidN, c * smoothstep(.78, .86, tn));
      // obris prema papiru samo za objekte sa punom težinom ivice (tlo je nema)
      aEdge = max(aEdge, abs(c - c0) * smoothstep(.3, .9, max(a, a0)));
      if (c > .5 && c0 > .5) {
        nEdge = max(nEdge, 1.0 - dot(n0, n));
        dEdge = max(dEdge, abs(d - d0) / max(d0, .001));
        farEdge = max(farEdge, (d0 - d) / max(d, .001)); // > 0: ovaj piksel je IZA susjeda
      }
    }
    a0 = c0;
    float facing = clamp(n0.z, .2, 1.0);
    float inner = max(smoothstep(.10, .28, nEdge), smoothstep(.010 / facing, .026 / facing, dEdge));
    float silhouette = smoothstep(.3, .9, aEdge);
    // Na punom mastilu svijetla linija ide samo na element koji je iza drugog (razdvaja rešetku
    // kao na referenci) i na oštre lomove — ne na zaobljenje tankih šipki.
    float knockLine = max(smoothstep(.42, .6, nEdge), smoothstep(.02, .05, farEdge));

    // ——— ton ———
    float objTone = g0.b;
    float solid = a0 * smoothstep(.78, .86, objTone);
    float t = mix(bgTone, mix(bgTone, objTone, a0), fill);

    // ——— AM raster: tačka po ćeliji rotirane mreže, poluprečnik ~ sqrt(ton) ———
    float ca = cos(radians(ang)), sn = sin(radians(ang));
    vec2 r = mat2(ca, -sn, sn, ca) * frag / cell;
    vec2 f = fract(r) - .5;
    float dist = length(f);
    // zrno štampe: tačke nisu savršeno iste (blago "razliveno" mastilo)
    float grain = vnoise(frag / (1.6 * dpr));
    float rad = sqrt(clamp(t, 0.0, 1.0)) * .72 * (.9 + .2 * vnoise(floor(r) * .37 + 3.1));
    float aa = .9 / cell;
    float dotInk = 1.0 - smoothstep(rad - aa, rad + aa, dist);
    dotInk *= step(.012, t);
    dotInk = max(dotInk, step(.985, t));

    // ——— sklapanje ———
    float edgeF = fill;
    // linije mastila na svijetlim površinama; na punom mastilu linije su "izbijene" (boja papira)
    float inkLine = max(inner * (1.0 - solid), silhouette * a0) * edgeF;
    float knock = knockLine * solid * edgeF;
    // puno mastilo se razlije ~1px (deblja, štamparska linija; tanke šipke krana ne pucaju)
    float amount = max(max(dotInk, inkLine), solidN * edgeF);
    amount = mix(amount, 0.0, knock * .92);
    // istrošena štampa: sitne mrlje papira u mastilu i poneka mrlja mastila na papiru
    float fleck = smoothstep(.84, .9, grain * vnoise(frag / (5.0 * dpr) + 7.0) * 1.7);
    amount *= 1.0 - fleck * .3;
    vec3 col = mix(paper, ink, clamp(amount, 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createCraneRenderer(renderer, world) {
  const lightDir = { value: new THREE.Vector3(-.5, .74, .46).normalize() };
  const fog = { value: new THREE.Vector2(80, 160) };
  const shadeK = { value: .78 };
  const cache = new Map();
  const tmp = new THREE.Color();

  function toneOf(src) {
    if (src.userData && src.userData.ink !== undefined) return src.userData.ink;
    if (!src.color) return .15;
    tmp.copy(src.color).convertLinearToSRGB();
    const lum = .2126 * tmp.r + .7152 * tmp.g + .0722 * tmp.b;
    return Math.min(1, Math.max(0, (.965 - lum) * 1.9));
  }
  function printFor(src) {
    let pm = cache.get(src);
    if (pm) return pm;
    const defines = {};
    if (src.map) defines.PRINT_MAP = '';
    pm = new THREE.ShaderMaterial({
      uniforms: { baseTone: { value: toneOf(src) }, opacity: { value: 1 }, lightDir, fog, shadeK, radial: { value: new THREE.Vector4(...(src.userData.radial || [0, 0, 0, 0])) }, edgeW: { value: src.userData.edgeW ?? 1 }, map: { value: src.map || null } },
      defines,
      side: src.side,
      vertexShader: PRINT_VERT,
      fragmentShader: PRINT_FRAG,
    });
    cache.set(src, pm);
    return pm;
  }
  // Zamjena materijala samo za vrijeme crtanja G-buffera (original ostaje za pretapanja i sl.).
  const swapped = [];
  function swapIn(root) {
    root.traverse((o) => {
      if (!o.isMesh || !o.material || Array.isArray(o.material)) return;
      const src = o.material;
      const pm = printFor(src);
      pm.uniforms.opacity.value = src.opacity;
      // Providno staklo koje ne piše dubinu (ograde, tuš, folija) se ne štampa: rasterizovano
      // bi dalo šum ivica. Ostala providnost (pretapanje sobe) ide kroz raster tačaka.
      pm.visible = src.visible && !(src.transparent && src.depthWrite === false);
      swapped.push(o, src);
      o.material = pm;
    });
  }
  function swapOut() {
    for (let i = 0; i < swapped.length; i += 2) swapped[i].material = swapped[i + 1];
    swapped.length = 0;
  }

  // Pozadina: tonska slika (bijelo = papir, tamno = mastilo). Dok se ne učita, prazna.
  const blank = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  blank.needsUpdate = true;
  const uniforms = {
    tG: { value: null },
    tDepth: { value: null },
    tBg: { value: blank },
    bgAspect: { value: 1 },
    bgShift: { value: new THREE.Vector2() },
    bgScale: { value: 1 },
    resolution: { value: new THREE.Vector2(1, 1) },
    near: { value: .1 },
    far: { value: 220 },
    dpr: { value: 1 },
    fill: { value: 1 },
    cols: { value: COLS },
    paperC: { value: STAGES.map((s) => hexRGB(s.paper)) },
    inkC: { value: STAGES.map((s) => hexRGB(s.ink)) },
    cellC: { value: STAGES.map((s) => s.cell) },
    angleC: { value: STAGES.map((s) => s.angle) },
    bgC: { value: STAGES.map((s) => s.bg) },
    wipe: { value: STAGES.map(() => 0) },
  };
  new THREE.TextureLoader().load('/hero/city-tone.webp', (tex) => {
    tex.colorSpace = THREE.NoColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
    uniforms.tBg.value = tex;
    uniforms.bgAspect.value = tex.image.width / tex.image.height;
    onBg?.();
  });
  let onBg = null;

  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      uniforms,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: POST_FRAG,
    }),
  );
  const post = new THREE.Scene();
  post.add(quad);
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  let target = null, width = 1, height = 1;
  function ensureTarget() {
    const ratio = renderer.getPixelRatio();
    const w = Math.max(1, Math.round(width * ratio)), h = Math.max(1, Math.round(height * ratio));
    if (target && target.width === w && target.height === h) return;
    target?.dispose();
    const depth = new THREE.DepthTexture(w, h);
    depth.type = THREE.UnsignedIntType;
    target = new THREE.WebGLRenderTarget(w, h, { depthTexture: depth, type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    uniforms.tG.value = target.texture;
    uniforms.tDepth.value = depth;
    uniforms.resolution.value.set(w, h);
    uniforms.dpr.value = Math.max(1, ratio);
  }

  return {
    async compile() {
      ensureTarget();
      swapIn(world.scene);
      renderer.setRenderTarget(target);
      try { await renderer.compileAsync(world.scene, world.camera); } finally { renderer.setRenderTarget(null); swapOut(); }
      await renderer.compileAsync(post, postCam);
    },
    setSamples() {},
    setSize(w, h) { width = w; height = h; ensureTarget(); },
    /** p: sirovi progres; mouse: -1..1 (parallax pozadine); narrow: uzak ekran (manje kolona). */
    setStyle(p, mouse = { x: 0, y: 0 }, narrow = false) {
      for (let i = 0; i < STAGES.length; i++) uniforms.wipe.value[i] = i === 0 ? 1 : wipeAt(i, p);
      uniforms.cols.value = narrow ? 6 : COLS;
      // Pozadina lagano tone (spušta se) dok kran radi, i blago prati miš.
      uniforms.bgShift.value.set(mouse.x * -.012, mouse.y * .01 + .05 - p * .07);
      uniforms.bgScale.value = .86 - .08 * Math.min(1, p / .5);
      // U sobi nema sunca: sjenčenje je mekše, pa enterijer ostane svijetao i čitljiv.
      const inside = Math.min(1, Math.max(0, (p - .62) / .1));
      shadeK.value = .78 - .45 * inside * inside * (3 - 2 * inside);
    },
    onBackground(fn) { onBg = fn; if (uniforms.tBg.value !== blank) fn(); },
    /** fill: 1 = puna scena; 0 = scena se rastvori u pozadinu (ostaje samo raster neba) */
    render(_contact = 1, fill = 1) {
      ensureTarget();
      const cam = world.camera;
      uniforms.near.value = cam.near;
      uniforms.far.value = cam.far;
      uniforms.fill.value = fill;
      if (world.focus) {
        const d = cam.position.distanceTo(world.focus);
        fog.value.set(d * 1.25 + 4, d * 2.6 + 10);
      }
      const bg = world.scene.background;
      world.scene.background = null;
      renderer.setRenderTarget(target);
      renderer.setClearColor(0x000000, 0);
      renderer.clear(true, true, true);
      if (fill > .001) {
        swapIn(world.scene);
        try { renderer.render(world.scene, cam); } finally { swapOut(); }
      }
      world.scene.background = bg;
      renderer.setRenderTarget(null);
      renderer.render(post, postCam);
    },
    dispose() {
      target?.dispose();
      for (const pm of cache.values()) pm.dispose();
      quad.geometry.dispose();
      quad.material.dispose();
      uniforms.tBg.value?.dispose?.();
    },
  };
}
