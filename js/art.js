// =====================================================================
// GRAND COMPANY — product illustrations
// Every product is drawn as a small SVG "packshot" from the recipe in
// data.js (product.art), so the catalogue has consistent, colourful
// imagery until real product photography exists.
// =====================================================================

'use strict';

// Wrapped in an IIFE: only productArt() becomes global, the drawing helpers stay private
(() => {

const ART_FONT = 'Instrument Sans, system-ui, sans-serif';

// Deterministic pseudo-random numbers: the same SKU always gets the same texture
function seeded(seed) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const target = amount < 0 ? 0 : 255;
  const mix = (c) => Math.round((target - c) * Math.abs(amount) + c);
  const r = mix((n >> 16) & 255), g = mix((n >> 8) & 255), b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const pts = (list) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const poly = (list, fill, extra = '') => `<polygon points="${pts(list)}" fill="${fill}" ${extra}/>`;
const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
const shadow = (cx, cy, rx, ry, rot = 0) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#1B1E22" opacity="0.1" transform="rotate(${rot} ${cx} ${cy})"/>`;

// A flat box in oblique projection: side, front and top faces
function slab(x, y, w, h, ox, oy, c) {
  const A = [x, y], B = [x + w, y], C = [x + w + ox, y - oy], D = [x + ox, y - oy];
  return (
    poly([B, C, add(C, [0, h]), add(B, [0, h])], c.side) +
    poly([A, B, add(B, [0, h]), add(A, [0, h])], c.front) +
    poly([A, B, C, D], c.top)
  );
}

// Text lying on the top face of a slab (glyphs lean back with the depth axis)
function topLabel(x, y, ox, oy, text, color, size) {
  const len = Math.hypot(ox, oy);
  const m = `1 0 ${(-ox / len).toFixed(3)} ${(oy / len).toFixed(3)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  return `<text transform="matrix(${m})" font-family="${ART_FONT}" font-size="${size}" font-weight="700" fill="${color}">${esc(text)}</text>`;
}

function sticker(x, y, text, rot = 0) {
  const w = Math.max(54, text.length * 7.6 + 18);
  return `<g transform="translate(${x} ${y}) rotate(${rot})">
    <rect x="${-w / 2}" y="-12" width="${w}" height="22" fill="#F8F4EC" stroke="#1B1E22" stroke-opacity="0.12"/>
    <text y="4" text-anchor="middle" font-family="${ART_FONT}" font-size="12" font-weight="700" fill="#1B1E22">${esc(text)}</text>
  </g>`;
}

// ---------------------------------------------------------------------
// Drawings
// ---------------------------------------------------------------------
function drawBoard(a) {
  const w = 236, ox = 84, oy = 58, h = 10, x0 = 36, base = 240;
  const jitter = [0, 6, -3, 4, 0];
  const colors = { top: a.face, front: '#DAD4C7', side: '#C6BFB0' };
  let s = shadow(212, 250, 178, 18);
  jitter.forEach((j, i) => {
    const y = base - (i + 1) * h;
    s += slab(x0 + j, y, w, h, ox, oy, colors);
    s += `<line x1="${x0 + j}" y1="${y + 1}" x2="${x0 + j + w}" y2="${y + 1}" stroke="${shade(a.face, -0.18)}" stroke-width="2"/>`;
  });
  const yTop = base - jitter.length * h;
  s += `<line x1="${x0 + 30 + ox * 0.62}" y1="${yTop - oy * 0.62}" x2="${x0 + w - 20 + ox * 0.62}" y2="${yTop - oy * 0.62}" stroke="${shade(a.face, -0.3)}" stroke-width="1.2" stroke-dasharray="3 7"/>`;
  s += topLabel(x0 + 22 + ox * 0.22, yTop - oy * 0.22, ox, oy, a.label, shade(a.face, -0.6), 17);
  return `<g transform="translate(200 190) scale(1.18) translate(-200 -190)">${s}</g>`;
}

function drawProfile(a) {
  const b = a.web, f = a.flange, L = [236, -122];
  const metal = { outer: '#CDD2D7', web: '#AEB5BC', inner: '#8C949C', edge: '#F1F3F5' };
  const x = (400 - (b + L[0])) / 2 + 12;
  const angle = (Math.atan2(L[1], L[0]) * 180) / Math.PI;

  const one = (O) => {
    const P1 = O, P2 = add(O, [b, 0]), P3 = add(O, [0, -f]), P4 = add(O, [b, -f]);
    const lip = a.lips ? 7 : 0;
    return (
      poly([P2, P4, add(P4, L), add(P2, L)], metal.inner) +
      poly([P1, P2, add(P2, L), add(P1, L)], metal.web) +
      `<line x1="${P1[0] + b / 2}" y1="${P1[1]}" x2="${P1[0] + b / 2 + L[0]}" y2="${P1[1] + L[1]}" stroke="${metal.inner}" stroke-width="2" stroke-dasharray="2 12" opacity="0.7"/>` +
      poly([P1, P3, add(P3, L), add(P1, L)], metal.outer) +
      `<polyline points="${pts([add(P3, [lip, 0]), P3, P1, P2, P4, add(P4, [-lip, 0])])}" fill="none" stroke="${metal.edge}" stroke-width="3" stroke-linejoin="round"/>`
    );
  };

  const front = [x, 232];
  let s = shadow(front[0] + b / 2 + L[0] / 2, 238 + L[1] / 2, 170, 16, angle);
  s += one(add(front, [-16, -42]));
  s += one(front);
  const mid = add(add(front, [b / 2, -f / 2]), [L[0] * 0.5, L[1] * 0.5]);
  s += sticker(mid[0], mid[1], a.label, angle);
  return s;
}

const SLAB_MATERIALS = {
  stonewool: { top: '#D6B274', front: '#C09657', side: '#A98049', tex: '#7E5E2E', texture: 'fibre' },
  eps: { top: '#FBFAF6', front: '#ECE8DF', side: '#DAD5C9', tex: '#B5AD9B', texture: 'beads' },
  graphite: { top: '#8E9298', front: '#767A80', side: '#61656B', tex: '#C7CBD0', texture: 'beads' },
  xps: { top: '#AACDE5', front: '#8DB5D4', side: '#77A0C0', tex: '#5F87A7', texture: 'groove' },
};

function drawSlabs(a, sku) {
  const m = SLAB_MATERIALS[a.material];
  const rand = seeded(sku);
  const w = 216, ox = 94, oy = 60, h = a.thick, n = a.count, x0 = 42;
  const base = Math.min(246, 160 + (n * h + oy) / 2);
  let s = shadow(214, base + 8, 176, 18);

  for (let i = 0; i < n; i++) {
    const y = base - (i + 1) * h;
    const x = x0 + (rand() - 0.5) * 10;
    s += slab(x, y, w, h, ox, oy, m);

    if (m.texture === 'fibre') {
      for (let k = 0; k < 16; k++) {
        const fx = x + 6 + rand() * (w - 22), fy = y + 3 + rand() * (h - 6), len = 7 + rand() * 12;
        s += `<line x1="${fx.toFixed(1)}" y1="${fy.toFixed(1)}" x2="${(fx + len).toFixed(1)}" y2="${(fy + (rand() - 0.5) * 3).toFixed(1)}" stroke="${m.tex}" stroke-width="1.1" opacity="0.55"/>`;
      }
    } else if (m.texture === 'beads') {
      for (let k = 0; k < 20; k++) {
        s += `<circle cx="${(x + 5 + rand() * (w - 10)).toFixed(1)}" cy="${(y + 3 + rand() * (h - 6)).toFixed(1)}" r="1.4" fill="${m.tex}" opacity="0.6"/>`;
      }
    } else {
      s += `<line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="${m.tex}" stroke-width="1.5"/>`;
    }
  }

  const yTop = base - n * h;
  s += topLabel(x0 + 20 + ox * 0.24, yTop - oy * 0.24, ox, oy, a.label, shade(m.top, -0.62), 16);
  return s;
}

function drawRoll(a) {
  const R = 76, cx = 142, cy = 176, axis = [128, -64], steps = 28;
  const colors = { side: '#D9AE36', face: '#E8C24E', band: '#1B1E22' };
  let s = shadow(212, 252, 170, 18);

  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const inBand = t > 0.42 && t < 0.62;
    s += `<circle cx="${(cx + axis[0] * t).toFixed(1)}" cy="${(cy + axis[1] * t).toFixed(1)}" r="${R}" fill="${inBand ? colors.band : colors.side}"/>`;
  }

  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${colors.face}"/>`;
  for (let r = R - 9, k = 0; r > 12; r -= 9, k++) {
    s += `<circle cx="${cx + k * 0.8}" cy="${cy - k * 0.4}" r="${r}" fill="none" stroke="${shade(colors.face, -0.22)}" stroke-width="1.4"/>`;
  }
  s += `<circle cx="${cx + 7}" cy="${cy - 3}" r="7" fill="${shade(colors.face, -0.45)}"/>`;

  const len = Math.hypot(axis[0], axis[1]);
  const normal = [axis[1] / len, -axis[0] / len]; // points up-left, onto the visible top of the roll
  const labelAt = add([cx + axis[0] * 0.52, cy + axis[1] * 0.52], [normal[0] * R * 0.78, normal[1] * R * 0.78]);
  const angle = (Math.atan2(axis[1], axis[0]) * 180) / Math.PI;
  s += `<text transform="translate(${labelAt[0].toFixed(1)} ${labelAt[1].toFixed(1)}) rotate(${angle.toFixed(1)})" text-anchor="middle" font-family="${ART_FONT}" font-size="14" font-weight="700" fill="#F8F4EC">${esc(a.label)}</text>`;
  return s;
}

const TAPE_MATERIALS = {
  mesh: { face: '#F3F0E8', side: '#DAD3C4', line: '#C4BBA7' },
  paper: { face: '#E3D2B2', side: '#C8B38D', line: '#B09A74' },
  foam: { face: '#707579', side: '#575C60', line: '#8B9094' },
};

function drawTape(a) {
  const m = TAPE_MATERIALS[a.material];
  const R = 90, cx = 186, cy = 150, depth = [28, -16], steps = 12;
  let s = shadow(200, 252, 120, 16);

  for (let i = steps; i >= 1; i--) {
    const t = i / steps;
    s += `<circle cx="${cx + depth[0] * t}" cy="${cy + depth[1] * t}" r="${R}" fill="${m.side}"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${m.face}"/>`;

  if (a.material === 'mesh') {
    for (let k = -R + 10; k < R; k += 11) {
      const half = Math.sqrt(R * R - k * k);
      s += `<line x1="${cx - half}" y1="${cy + k}" x2="${cx + half}" y2="${cy + k}" stroke="${m.line}" stroke-width="0.9"/>`;
      s += `<line x1="${cx + k}" y1="${cy - half}" x2="${cx + k}" y2="${cy + half}" stroke="${m.line}" stroke-width="0.9"/>`;
    }
  } else {
    for (let r = R - 8; r > 46; r -= 8) {
      s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${m.line}" stroke-width="1" opacity="0.7"/>`;
    }
  }

  s += `<circle cx="${cx}" cy="${cy}" r="42" fill="#B8946A"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="33" fill="#8C6C48"/>`;
  s += `<circle cx="${cx + 5}" cy="${cy - 3}" r="30" fill="#6E5236" opacity="0.55"/>`;
  s += sticker(cx + 62, cy + 84, a.label);
  return s;
}

function drawBox(a) {
  const A = [104, 132], B = [256, 132], depth = [62, -40], h = 106;
  const c = { top: '#DDBB90', front: '#C99F72', side: '#B08658' };
  let s = shadow(212, 250, 150, 16);
  s += poly([B, add(B, depth), add(add(B, depth), [0, h]), add(B, [0, h])], c.side);
  s += poly([A, B, add(B, [0, h]), add(A, [0, h])], c.front);
  s += poly([A, B, add(B, depth), add(A, depth)], c.top);
  s += poly([[172, 132], [192, 132], add([192, 132], depth), add([172, 132], depth)], '#EAD5B2', 'opacity="0.85"');
  s += `<rect x="122" y="158" width="116" height="56" fill="#F8F4EC"/>`;
  s += `<rect x="122" y="158" width="6" height="56" fill="#2F5FA7"/>`;
  s += `<text x="184" y="184" text-anchor="middle" font-family="${ART_FONT}" font-size="15" font-weight="700" fill="#1B1E22">${esc(a.label)}</text>`;
  s += `<text x="184" y="202" text-anchor="middle" font-family="${ART_FONT}" font-size="12" fill="#5A6069">${esc(a.sub)}</text>`;

  const screw = (x, y, rot) => {
    let g = `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="0" y="-2.5" width="42" height="5" fill="#59606A"/>`;
    for (let t = 6; t < 40; t += 5) g += `<line x1="${t}" y1="-3.5" x2="${t + 2}" y2="3.5" stroke="#3F454D" stroke-width="1"/>`;
    g += `<circle cx="-2" cy="0" r="7" fill="#737B85"/><path d="M-6 0h8M-2 -4v8" stroke="#3F454D" stroke-width="1.4"/><polygon points="42,-2.5 50,0 42,2.5" fill="#59606A"/></g>`;
    return g;
  };
  s += screw(92, 262, -8) + screw(150, 270, 6) + screw(270, 262, -20);
  return s;
}

function drawBag(a) {
  const dark = shade(a.body, -0.12);
  const xl = (y) => 132 - (16 * (y - 76)) / 160;
  const xr = (y) => 268 + (16 * (y - 76)) / 160;
  const scale = a.small ? 0.8 : 1;

  let body = `<path d="M132,76 C152,62 248,62 268,76 L284,236 C285,249 277,256 264,256 L136,256 C123,256 115,249 116,236 Z" fill="${a.body}"/>`;
  body += `<path d="M238,68 C252,68 262,72 268,76 L284,236 C285,249 277,256 264,256 L244,256 Z" fill="${dark}" opacity="0.55"/>`;
  body += `<path d="M140,86 C162,74 238,74 260,86" fill="none" stroke="${shade(a.body, -0.25)}" stroke-width="2" stroke-dasharray="4 5"/>`;
  body += poly([[xl(118), 118], [xr(118), 118], [xr(124), 124], [xl(124), 124]], a.band);
  body += poly([[xl(146), 146], [xr(146), 146], [xr(200), 200], [xl(200), 200]], a.band);
  body += `<text x="200" y="180" text-anchor="middle" font-family="${ART_FONT}" font-size="${a.label.length > 10 ? 18 : 22}" font-weight="700" fill="${a.bandText || '#F8F4EC'}">${esc(a.label)}</text>`;
  body += `<text x="200" y="232" text-anchor="middle" font-family="${ART_FONT}" font-size="17" font-weight="700" fill="${a.band === '#D9A62E' ? '#1B1E22' : a.band}">${esc(a.weight)}</text>`;

  return shadow(200, 262, 110 * scale, 12) + `<g transform="translate(200 258) scale(${scale}) translate(-200 -258)">${body}</g>`;
}

function drawHanger(a) {
  const strip = (x, y) => {
    let g = `<g transform="translate(${x} ${y}) rotate(-24)">`;
    g += `<rect x="-15" y="-92" width="30" height="176" fill="#C3C9CF"/>`;
    g += `<rect x="-15" y="-92" width="9" height="176" fill="#DCE0E4"/>`;
    for (let k = -74; k <= 58; k += 26) g += `<rect x="-4" y="${k}" width="8" height="13" rx="4" fill="#7F8891"/>`;
    g += `<polygon points="-15,84 15,84 30,100 0,100" fill="#A5ACB3"/></g>`;
    return g;
  };
  return shadow(210, 250, 150, 16) + strip(140, 148) + strip(204, 142) + strip(268, 136) + sticker(300, 248, a.label);
}

const ART_DRAWERS = { board: drawBoard, profile: drawProfile, slab: drawSlabs, roll: drawRoll, tape: drawTape, box: drawBox, bag: drawBag, hanger: drawHanger };
const artCache = new Map();

function productArt(p, className = 'h-full w-full') {
  const photo = typeof PRODUCT_PHOTOS !== 'undefined' && PRODUCT_PHOTOS[p.sku];
  if (photo) {
    return `<img src="${photo}" alt="${esc(p.name)}" loading="lazy" class="${className} object-cover" />`;
  }
  if (!artCache.has(p.sku)) {
    const draw = ART_DRAWERS[p.art.kind];
    artCache.set(p.sku, draw ? draw(p.art, p.sku) : '');
  }
  return `<svg viewBox="0 0 400 300" class="${className}" role="img" aria-label="${esc(p.name)}" xmlns="http://www.w3.org/2000/svg">${artCache.get(p.sku)}</svg>`;
}

window.productArt = productArt;
})();
