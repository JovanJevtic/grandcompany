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
// bg: koliko se vidi pozadina (0..1); at: progres kad prelaz u ovo poglavlje počinje;
// city: 0 = pozadina je samo nebo u oblacima, 1 = grad sa neboderima (tek kad se izađe kroz prozor).
export const STAGES = [
  { at: 0, paper: '#e4e8f0', ink: '#1e40d6', cell: 4.4, angle: 45, bg: .2, floor: 0, city: 0 },  // uspon uz kran, tabla sa logom, vožnja do kuke
  { at: .30, paper: '#1e40d6', ink: '#e9eefb', cell: 5.2, angle: 18, bg: .24, floor: 0, city: 0 }, // plavi blok (negativ, nacrt): spuštanje na krov, otkačinjanje, fasada
  { at: .72, paper: '#f4f1ec', ink: '#1e40d6', cell: 5.0, angle: 45, bg: .42, floor: 0, city: 0 },   // enterijer — topao papir
  // Napolju: puna kobalt pozadina, i dalje u tačkama (tamnija plava; `floor` = najmanja tačka svuda),
  // grad se nazire samo kroz gustinu tačaka. Preko nje se ispisuje rečenica, svijetla i centrirana.
  { at: .925, paper: '#2448e0', ink: '#13289c', cell: 6.0, angle: 30, bg: .55, floor: .2, city: 1 },
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
  varying vec3 vInst;
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
    // Položaj samog objekta (ili instance) — isti za cijeli prozor, za izbor "tačkastih" prozora.
    #ifdef USE_INSTANCING
      vInst = (modelMatrix * instanceMatrix[3]).xyz;
    #else
      vInst = modelMatrix[3].xyz;
    #endif
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
  uniform float lineOnly; // 1 = samo linije: površina je papir, crtaju se samo obrisi (zgrada, skela)
  uniform float someDots; // 1 = prozor u linijskom crtežu: otprilike svaki drugi ostaje u tačkama
  uniform float paperOnly; // 1 = površina je čist papir (tlo), bez tačaka i bez obrisa
  uniform float inside;    // 1 = objekat iz sobe (enterijer)
  uniform float crane;     // 1 = kran/teret (puna boja): pokrivenost .99, na početku se "razvija"
  uniform float navy;      // 1 = tabla sa logom: ravan ton (bez sjenčenja), mastilo tamno plavo
  uniform float flatInk;   // 1 = puno mastilo bez rastera (kontrateg, kabina)
  varying vec3 vInst;
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
    // Mastilo (kran, čelik): puna ploha bez rastera — kao na referencama, kran je puna boja,
    // a tačke se vide samo u pozadini. Sjenčenje unutar pune plohe daju "izbijene" linije
    // koje crta završni shader (pregibi i preklapanja), a ne raster.
    if (navy > .5) tone = base;
    else if (base > .88) tone = 1.0;
    else tone = clamp(base + (1.0 - base) * (1.0 - light) * shadeK, 0.0, 1.0);
    if (radial.w > 0.0) tone *= 1.0 - smoothstep(radial.z, radial.w, length(vWorld.xz - radial.xy));
    // vazdušna perspektiva: daleko = manje mastila (stapa se sa papirom)
    tone *= 1.0 - .92 * smoothstep(fog.x, fog.y, vDepth);
    float lo = lineOnly;
    if (someDots > .5 && fract(sin(dot(floor(vInst * 2.0), vec3(12.99, 78.23, 37.71))) * 43758.55) > .5) lo = 0.0;
    tone *= (1.0 - lo) * (1.0 - paperOnly);
    if (flatInk > .5) tone = 1.0;
    // Linijski objekti (zgrada) pišu pokrivenost .95 umjesto 1, da ih završni shader prepozna.
    // Pokrivenost nosi i oznake: .95 = linijski objekat, .92 = linijski objekat u zgradi sa sobom,
    // .85 = soba, .76 = tabla sa logom, .99 = puni kran, ostalo edgeW. Geometrijske linije (LINE_FRAG): .975 / .89.
    gl_FragColor = vec4(n.xy * .5 + .5, tone, navy > .5 ? .76 : lo > .5 ? (inside > .5 ? .92 : .95) : crane > .5 ? .99 : inside > .5 ? .85 : edgeW);
  }
`;

// ——— Geometrijske linije za linijske objekte (zgrada, krov, skela) ———
// Umjesto ivica izvučenih iz piksela (nazubljene, isprekidane), crtaju se prave ivice geometrije:
// kutija → 12 ivica, šipka → jedna središnja linija. Svaka linija je traka konstantne širine u
// pikselima (kao LineSegments2), pa je glatka i neprekinuta. Upisuje se u G-buffer sa svojom
// oznakom (.975 napolju / .89 u zgradi sa sobom), a završni shader je štampa kao puno mastilo.
// Kran i teret se ovim ne crtaju: oni su pune plohe mastila (vidi PRINT_FRAG).
const LINE_VERT = /* glsl */ `
  attribute vec3 instanceStart;
  attribute vec3 instanceEnd;
  uniform vec2 resolution;
  uniform float linewidth;
  void trimSegment(const in vec4 start, inout vec4 end) {
    float a = projectionMatrix[2][2], b = projectionMatrix[3][2];
    float nearEstimate = -0.5 * b / a;
    float alpha = (nearEstimate - start.z) / (end.z - start.z);
    end.xyz = mix(start.xyz, end.xyz, alpha);
  }
  void main() {
    vec4 start = modelViewMatrix * vec4(instanceStart, 1.0);
    vec4 end = modelViewMatrix * vec4(instanceEnd, 1.0);
    // malo ka kameri: ivica na površini (i središnja linija šipke) ne nestaje u svojoj geometriji
    start.z += .15; end.z += .15;
    if (start.z < 0.0 && end.z >= 0.0) trimSegment(start, end);
    else if (end.z < 0.0 && start.z >= 0.0) trimSegment(end, start);
    vec4 clipStart = projectionMatrix * start, clipEnd = projectionMatrix * end;
    vec2 ndcStart = clipStart.xy / clipStart.w, ndcEnd = clipEnd.xy / clipEnd.w;
    float aspect = resolution.x / resolution.y;
    vec2 dir = ndcEnd - ndcStart;
    dir.x *= aspect;
    dir = length(dir) > 1e-6 ? normalize(dir) : vec2(1.0, 0.0);
    vec2 offset = vec2(dir.y, -dir.x);
    dir.x /= aspect; offset.x /= aspect;
    if (position.x < 0.0) offset *= -1.0;
    // kratko produženje na krajevima: spojevi ivica se zatvore bez rupa
    offset += (position.y < 0.5 ? -dir : dir) * .5;
    offset *= linewidth / resolution.y;
    vec4 clip = position.y < 0.5 ? clipStart : clipEnd;
    clip.xy += offset * clip.w;
    gl_Position = clip;
  }
`;
const LINE_FRAG = /* glsl */ `
  uniform float flag;
  void main() { gl_FragColor = vec4(.5, .5, 1.0, flag); }
`;
const BOX_EDGES = (() => {
  const c = (i) => [(i & 1) - .5, ((i >> 1) & 1) - .5, ((i >> 2) & 1) - .5];
  const out = [];
  for (let i = 0; i < 8; i++) for (const bit of [1, 2, 4]) if (!(i & bit)) out.push(c(i), c(i | bit));
  return out;
})();
const ROD_LINE = [[0, -.5, 0], [0, .5, 0]];

function buildLineOverlays(scene, lineUniforms) {
  const mats = [false, true].map((inside) => new THREE.ShaderMaterial({
    uniforms: { ...lineUniforms, flag: { value: inside ? .89 : .975 } },
    vertexShader: LINE_VERT,
    fragmentShader: LINE_FRAG,
  }));
  const edgeCache = new Map();
  const isBox = (geo) => geo.type.includes('Box') || !!(geo.parameters && 'depth' in geo.parameters && 'width' in geo.parameters);
  const segsOf = (geo) => {
    if (isBox(geo)) return BOX_EDGES;
    if (geo.type === 'CylinderGeometry') return ROD_LINE;
    if (!edgeCache.has(geo.uuid)) {
      const p = new THREE.EdgesGeometry(geo, 35).attributes.position, pts = [];
      for (let i = 0; i < p.count; i++) pts.push([p.getX(i), p.getY(i), p.getZ(i)]);
      edgeCache.set(geo.uuid, pts);
    }
    return edgeCache.get(geo.uuid);
  };
  // Sitni detalji (fuge, šrafovi, nosači) se ne crtaju: na crtežu su samo crtice po bijelom.
  const pos = new THREE.Vector3(), quat = new THREE.Quaternion(), scl = new THREE.Vector3();
  const tooSmall = (geo, m) => {
    m.decompose(pos, quat, scl);
    const d = [Math.abs(scl.x), Math.abs(scl.y), Math.abs(scl.z)].sort((a, b) => a - b);
    if (geo.type === 'CylinderGeometry') return Math.abs(scl.y) < .3;
    if (isBox(geo)) return d[1] < .05 || d[2] < .3;
    if (!geo.boundingSphere) geo.computeBoundingSphere();
    return geo.boundingSphere.radius * d[2] < .15;
  };
  const perParent = new Map();
  const v = new THREE.Vector3(), mi = new THREE.Matrix4(), mm = new THREE.Matrix4();
  const collect = (o, inside) => {
    o.updateMatrix();
    const add = (m) => {
      if (tooSmall(o.geometry, m)) return;
      if (!perParent.has(o.parent)) perParent.set(o.parent, { inside, data: [] });
      const data = perParent.get(o.parent).data;
      for (const p of segsOf(o.geometry)) { v.set(p[0], p[1], p[2]).applyMatrix4(m); data.push(v.x, v.y, v.z); }
    };
    if (o.isInstancedMesh) for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, mi); add(mm.multiplyMatrices(o.matrix, mi)); }
    else add(o.matrix);
  };
  const walk = (o, line, inside) => {
    line = line || !!o.userData.printLine;
    inside = inside || !!o.userData.printInside;
    if (line && o.isMesh && o.visible && !o.userData.printSolid && !o.userData.printKeep && o.material && !Array.isArray(o.material) && !o.material.userData.printSolid &&
        !(o.material.transparent && o.material.depthWrite === false)) collect(o, inside);
    for (const c of o.children) walk(c, line, inside);
  };
  walk(scene, false, false);
  const quadPos = new THREE.Float32BufferAttribute([-1, 0, 0, 1, 0, 0, -1, 1, 0, 1, 1, 0], 3);
  const made = [];
  for (const [parent, { inside, data }] of perParent) {
    if (!data.length) continue;
    const geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute('position', quadPos);
    geo.setIndex([0, 1, 2, 2, 1, 3]);
    const buf = new THREE.InstancedInterleavedBuffer(new Float32Array(data), 6, 1);
    geo.setAttribute('instanceStart', new THREE.InterleavedBufferAttribute(buf, 3, 0));
    geo.setAttribute('instanceEnd', new THREE.InterleavedBufferAttribute(buf, 3, 3));
    geo.instanceCount = data.length / 6;
    const line = new THREE.Mesh(geo, mats[inside ? 1 : 0]);
    line.frustumCulled = false;
    line.userData.printKeep = true;
    parent.add(line);
    made.push(line);
  }
  return () => {
    for (const l of made) { l.removeFromParent(); l.geometry.dispose(); }
    mats.forEach((m) => m.dispose());
  };
}

// ——— Završni shader (raster + ivice + boje poglavlja) ———
const N = STAGES.length;
const POST_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D tG;
  uniform sampler2D tDepth;
  uniform sampler2D tBg;
  uniform sampler2D tSky;
  uniform vec2 resolution;
  uniform float near, far, dpr, fill, bgAspect, cols;
  uniform vec2 bgShift;
  uniform float bgScale;
  uniform vec3 paperC[${N}];
  uniform vec3 inkC[${N}];
  uniform float cellC[${N}];
  uniform float angleC[${N}];
  uniform float bgC[${N}];
  uniform float floorC[${N}];
  uniform float cityC[${N}];
  uniform float room; // 1 = kamera je u sobi: sve van sobe se crta kao završni plavi grad
  uniform float lineFade; // 0 = kran se ne vidi (zum na tablu sa logom), 1 = puni crtež
  uniform float wipe[${N}];
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
    for (int i = 1; i < ${N}; i++) if (switched(wipe[i], vUv, float(i))) si = i;
    vec3 paper = paperC[0], ink = inkC[0];
    float cell = cellC[0], ang = angleC[0], bgS = bgC[0], flo = floorC[0], city = cityC[0];
    for (int i = 1; i < ${N}; i++) if (i == si) { paper = paperC[i]; ink = inkC[i]; cell = cellC[i]; ang = angleC[i]; bgS = bgC[i]; flo = floorC[i]; city = cityC[i]; }
    // ——— G-buffer ———
    vec4 g0 = texture2D(tG, vUv);
    // Kamera u sobi: piksel koji nije soba (pogled kroz prozor) je odmah završni plavi grad.
    float isIn = step(.8, g0.a) * step(g0.a, .935);
    // Geometrijske linije (glatke ivice krana i zgrade, LINE_FRAG) i površine linijskih objekata.
    float geoLine = max(step(.965, g0.a) * step(g0.a, .985), step(.875, g0.a) * step(g0.a, .905));
    float lineSurf = step(.9, g0.a) * step(g0.a, .97);
    float navyF = step(.745, g0.a) * step(g0.a, .775);
    // Puni kran (kran, teret, sajle): pokrivenost .99. Na početku priče se ne vidi — "razvija" se
    // dok kamera odmiče od table (lineFade), kao i linijski crtež prije njega.
    float craneF = step(.985, g0.a) * step(g0.a, .996);
    float outside = room * (1.0 - isIn) * (si == 2 ? 1.0 : 0.0);
    if (navyF > .5) { paper = vec3(.957, .945, .925); ink = vec3(.106, .141, .212); }
    if (outside > .5) { paper = paperC[${N - 1}]; ink = inkC[${N - 1}]; cell = cellC[${N - 1}]; ang = angleC[${N - 1}]; bgS = bgC[${N - 1}]; flo = floorC[${N - 1}]; city = cityC[${N - 1}]; }
    cell *= dpr;
    vec2 xy0 = g0.rg * 2.0 - 1.0;
    vec3 n0 = vec3(xy0, sqrt(max(0.0, 1.0 - dot(xy0, xy0))));
    float a0 = g0.a;
    float d0 = lin(texture2D(tDepth, vUv).r);

    // ——— pozadina: tonska slika neba ili grada (po poglavlju), "cover" preko platna ———
    vec2 buv = vUv - .5;
    float sa = resolution.x / resolution.y;
    if (sa > bgAspect) buv.y *= bgAspect / sa; else buv.x *= sa / bgAspect;
    buv = buv * bgScale + .5 + bgShift;
    vec2 cuv = clamp(buv, .001, .999);
    float bgTone = (1.0 - mix(texture2D(tSky, cuv).r, texture2D(tBg, cuv).r, city)) * bgS;
    bgTone = flo + (1.0 - flo) * bgTone;
    // Oko krana (pune mastilo-plohe i linije) čist papir: pozadinske tačke se ne lijepe uz
    // crtež, pa kran čita kao naslikan, a oblaci ostaju iza njega. Obilazak u dva prstena (~3 i ~7 px).
    float nearLine = 0.0;
    for (int i = 0; i < 12; i++) {
      float an = float(i) * .5236;
      vec2 dir = vec2(cos(an), sin(an)) * dpr / resolution;
      vec4 s1 = texture2D(tG, vUv + dir * 3.0), s2 = texture2D(tG, vUv + dir * 7.0);
      // pokrivenost .875-.985 = linijski objekti; ton iznad .78 = puna ploha mastila (kran, tabla)
      nearLine = max(nearLine, max(
        max(step(.875, s1.a) * step(s1.a, .985), step(.5, s1.a) * smoothstep(.78, .88, s1.b)),
        max(step(.875, s2.a) * step(s2.a, .985), step(.5, s2.a) * smoothstep(.78, .88, s2.b))));
    }
    bgTone *= 1.0 - nearLine * fill * (1.0 - outside) * lineFade;

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
      float nGeo = max(step(.965, a) * step(a, .985), step(.875, a) * step(a, .905));
      solidN = max(solidN, c * smoothstep(.78, .86, tn) * (1.0 - nGeo));
      // obris prema papiru samo za objekte sa punom težinom ivice (tlo je nema)
      // obris prema linijskim objektima (zgrada) i punom kranu gasi se zajedno sa njima (lineFade)
      float lineN = max(max(step(.875, a) * step(a, .985), step(.875, a0) * step(a0, .985)), max(step(.985, a) * step(a, .996), step(.985, a0) * step(a0, .996)));
      aEdge = max(aEdge, abs(c - c0) * smoothstep(.3, .9, max(a, a0)) * mix(1.0, lineFade, lineN));
      // Piksel koji je IZA krana (kroz rupe rešetke se vidi tlo/zgrada) ne crta ivicu prema njemu —
      // liniju crta samo kran, inače se tanke rupe popune mastilom.
      float behindLine = step(.9, a) * step(a, .97) * step(d * 1.001, d0);
      if (c > .5 && c0 > .5 && behindLine < .5) {
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
    // Dok se kran ne vidi (lineFade 0), njegove površine propuštaju pozadinu — ostaje samo tabla.
    float t = mix(bgTone, mix(bgTone, objTone, a0 * (1.0 - outside) * (1.0 - max(max(lineSurf, geoLine), craneF) * (1.0 - lineFade))), fill);

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
    // Linijski objekti nemaju ivice iz piksela (nazubljene, isprekidane) — samo geometrijske linije.
    float edgeF = fill * (1.0 - outside) * (1.0 - lineSurf) * (1.0 - geoLine) * mix(1.0, lineFade, step(.5, a0) * (1.0 - navyF));
    // linije mastila na svijetlim površinama; na punom mastilu linije su "izbijene" (boja papira)
    float inkLine = max(inner * (1.0 - solid), silhouette * a0) * edgeF;
    float knock = knockLine * solid * edgeF;
    // puno mastilo se razlije ~1px (deblja, štamparska linija; tanke šipke krana ne pucaju)
    float amount = max(max(dotInk, inkLine), solidN * edgeF);
    amount = mix(amount, 0.0, knock * .92);
    // Puni kran ne treba prisilno mastilo: njegov ton je 1, pa dotInk pokrije cijelu plohu.
    amount = max(amount, geoLine * fill * (1.0 - outside) * lineFade);
    if (navyF > .5) amount = smoothstep(.45, .55, objTone);
    // istrošena štampa: sitne mrlje papira u mastilu i poneka mrlja mastila na papiru
    float fleck = smoothstep(.84, .9, grain * vnoise(frag / (5.0 * dpr) + 7.0) * 1.7);
    amount *= 1.0 - fleck * .3 * (1.0 - geoLine) * (1.0 - navyF);
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
  // Isti materijal može biti i na kranu (puna boja) i na zgradi, pa su to dva print materijala.
  const lineCache = new Map();
  const rodCache = new Map();
  const insideCache = new Map();
  const craneCache = new Map();
  function printFor(src, line, inside, crane) {
    const store = crane ? craneCache : inside ? insideCache : line ? lineCache : cache;
    let pm = store.get(src);
    if (pm) return pm;
    const defines = {};
    if (src.map) defines.PRINT_MAP = '';
    pm = new THREE.ShaderMaterial({
      uniforms: { baseTone: { value: toneOf(src) }, opacity: { value: 1 }, lightDir, fog, shadeK, radial: { value: new THREE.Vector4(...(src.userData.radial || [0, 0, 0, 0])) }, edgeW: { value: src.userData.edgeW ?? 1 }, lineOnly: { value: line ? 1 : 0 }, someDots: { value: line && src.userData.printDots ? 1 : 0 }, paperOnly: { value: src.userData.paper ? 1 : 0 }, inside: { value: inside ? 1 : 0 }, crane: { value: crane ? 1 : 0 }, navy: { value: src.userData.navy ? 1 : 0 }, flatInk: { value: src.userData.flat ? 1 : 0 }, map: { value: src.map || null } },
      defines,
      side: src.side,
      vertexShader: PRINT_VERT,
      fragmentShader: PRINT_FRAG,
    });
    store.set(src, pm);
    return pm;
  }
  // Zamjena materijala samo za vrijeme crtanja G-buffera (original ostaje za pretapanja i sl.).
  const swapped = [];
  function swapIn(root) {
    walk(root, false, false, false);
  }
  // Kao traverseVisible, uz nasljeđivanje oznaka `printLine` (linijski crtež) i `printCrane` (puni kran).
  function walk(o, line, inside, crane) {
    if (!o.visible) return;
    line = line || !!o.userData.printLine;
    inside = inside || !!o.userData.printInside;
    crane = crane || !!o.userData.printCrane;
    swapOne(o, line, inside, crane);
    for (const c of o.children) walk(c, line, inside, crane);
  }
  function swapOne(o, line, inside, crane) {
    if (!o.isMesh || !o.material || Array.isArray(o.material) || o.userData.printKeep) return;
    const src = o.material;
    const asLine = line && !o.userData.printSolid && !src.userData.printSolid;
    // Puni tonovi (kontrateg, tabla) se ne vežu na lineFade — vidljivi su od prvog kadra,
    // kao i prije; ostalo od krana se "razvija" dok se kamera odmiče od table.
    const solidInk = !!o.userData.printSolid || !!src.userData.printSolid;
    let pm = printFor(src, asLine, inside, crane && !asLine && !solidInk);
    // Šipke u linijskom crtežu su samo linija kroz sredinu: površina se ne crta i ne zaklanja.
    if (asLine && o.geometry?.type === 'CylinderGeometry') {
      let thin = rodCache.get(pm);
      if (!thin) { thin = pm.clone(); thin.uniforms = pm.uniforms; thin.depthWrite = false; thin.colorWrite = false; rodCache.set(pm, thin); }
      pm = thin;
    }
    pm.uniforms.opacity.value = src.opacity;
    // Providno staklo koje ne piše dubinu (ograde, tuš, folija) se ne štampa: rasterizovano
    // bi dalo šum ivica. Ostala providnost (pretapanje sobe) ide kroz raster tačaka.
    pm.visible = src.visible && !(src.transparent && src.depthWrite === false);
    swapped.push(o, src);
    o.material = pm;
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
    tSky: { value: blank },
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
    floorC: { value: STAGES.map((s) => s.floor) },
    room: { value: 0 },
    lineFade: { value: 1 },
    cityC: { value: STAGES.map((s) => s.city) },
    wipe: { value: STAGES.map(() => 0) },
  };
  let disposed = false;
  // Dvije tonske slike istog formata (2688×1152): nebo za početak, grad za kraj (posle prozora).
  let pending = 2;
  const loadTone = (url, key) => new THREE.TextureLoader().load(url, (tex) => {
    // Scena ugašena dok se slika učitavala: ne instaliramo je (inače ostaje u memoriji GPU-a).
    if (disposed) { tex.dispose(); return; }
    tex.colorSpace = THREE.NoColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
    uniforms[key].value = tex;
    uniforms.bgAspect.value = tex.image.width / tex.image.height;
    if (--pending === 0) { blank.dispose(); onBg?.(); }
  });
  loadTone('/hero/sky-tone.webp', 'tSky');
  loadTone('/hero/city-tone.webp', 'tBg');
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
  // Glatke linije za kran, zgradu i teret (vidi buildLineOverlays).
  const lineUniforms = { resolution: { value: new THREE.Vector2(1, 1) }, linewidth: { value: 2 } };
  const disposeLines = buildLineOverlays(world.scene, lineUniforms);
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  let target = null, width = 1, height = 1;
  function ensureTarget() {
    const ratio = renderer.getPixelRatio();
    const w = Math.max(1, Math.round(width * ratio)), h = Math.max(1, Math.round(height * ratio));
    if (target && target.width === w && target.height === h) return;
    target?.dispose();
    const depth = new THREE.DepthTexture(w, h);
    depth.type = THREE.UnsignedIntType;
    target = new THREE.WebGLRenderTarget(w, h, { depthTexture: depth, type: THREE.UnsignedByteType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    uniforms.tG.value = target.texture;
    uniforms.tDepth.value = depth;
    uniforms.resolution.value.set(w, h);
    uniforms.dpr.value = Math.max(1, ratio);
    lineUniforms.resolution.value.set(w, h);
    lineUniforms.linewidth.value = 1.35 * Math.max(1, ratio);
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
      const inside = Math.min(1, Math.max(0, (p - .68) / .1));
      // Kamera je u sobi (vidi crane-scene: širi objektiv od .74–.8): kroz prozor se vidi plavi grad.
      uniforms.room.value = p > .805 ? 1 : 0; // tek kad kamera prođe kroz balkonska vrata (.76 ispred, .82 unutra)
      // Uvodni kadar je sada baza krana (kamera gleda uvis), pa se kran vidi od prvog trenutka:
      // "razvijanje" iz tačaka (lineFade) je isključeno i drži se na 1.
      uniforms.lineFade.value = 1;
      shadeK.value = .78 - .45 * inside * inside * (3 - 2 * inside);
    },
    onBackground(fn) { onBg = fn; if (pending === 0) fn(); },
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
      disposed = true;
      target?.dispose();
      for (const pm of cache.values()) pm.dispose();
      for (const pm of lineCache.values()) pm.dispose();
      for (const pm of rodCache.values()) pm.dispose();
      for (const pm of insideCache.values()) pm.dispose();
      for (const pm of craneCache.values()) pm.dispose();
      disposeLines();
      quad.geometry.dispose();
      quad.material.dispose();
      uniforms.tBg.value?.dispose?.();
      uniforms.tSky.value?.dispose?.();
    },
  };
}
