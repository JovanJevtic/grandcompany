import * as THREE from '../vendor/three.module.min.js';

// ——— Toranjski kran kao čist crtež (detaljna verzija, kao na referencama) ———
// Oblik prati reference: stub sa X-ukrućenjem, prirubnicama i merdevinama, mašinski pod sa
// vitlom, ogradom i kontrategom od kocki, staklena kabina sa ramovima, kratka kontra-strijela,
// trouglasta strijela sa X-ukrućenjem u svakom polju, glava sa koturovima i priveznicama,
// kolica sa četiri sajle, kuka sa pločama i koturovima, teret = svežanj dasaka u trakama.
// Sve je i dalje crtež: nema sitnih mehanizama koji se u štampi pretvaraju u hrpu linija.
//
// Konvencija (isto kao u crane-scene): kran stoji na (x=-7, y=0); stub je 0..MAST_TOP,
// glava (slew) je grupa na MAST_TOP, a strijela ide od JIB_ROOT do JIB_TIP u lokalnom x.
export const MAST_TOP = 25;
export const JIB_ROOT = -7;
export const JIB_TIP = 19;
/** Visina tereta u lokalnim koordinatama (donja ivica svežnja). */
export const BUNDLE_TOP = .62;

const HALF = .8;        // pola širine stuba
const BAYS = 8;         // broj polja stuba
const JIB_Z = .62;      // razmak donjih tetiva strijele
const TOP_Y = 2.6;      // gornja tetiva (lokalno u glavi)
const BOT_ROOT_Y = 1.15;
const BOT_TIP_Y = 2.35;
const PANELS = 11;      // broj polja strijele

const bottomY = (x) => BOT_ROOT_Y + (BOT_TIP_Y - BOT_ROOT_Y) * (x - JIB_ROOT) / (JIB_TIP - JIB_ROOT);
/** Visina kolica u lokalnim koordinatama glave, za datu udaljenost od stuba. */
export const trolleyY = (x) => bottomY(x);

export function craneTowerKit({ box, rod, profile, group, batch, m }) {
  // Puni tonovi: kontrateg i kabina su puna mrlja (kontrateg bez `flat`, pa mu štampa
  // ostavi blage tačke po stranama — kao na referenci).
  const solid = (color, flat) => {
    const mm = new THREE.MeshStandardMaterial({ color, roughness: .87, metalness: .02 });
    mm.userData.ink = 1; mm.userData.printSolid = true; if (flat) mm.userData.flat = true;
    return mm;
  };
  const cubeMat = solid('#e8e2d6', false);
  const glassGeo = new THREE.PlaneGeometry(1, 1);

  function base(g) {
    box(g, m.concrete, 0, .24, 0, 3.0, .48, 3.0);
    box(g, m.steel, 0, .54, 0, 2.0, .12, 2.0);
  }

  function mast(g) {
    const y0 = .6, bay = (MAST_TOP - y0) / BAYS;
    for (const x of [-HALF, HALF]) for (const z of [-HALF, HALF])
      profile(g, m.yellow, [x, y0, z], [x, MAST_TOP, z], .2);
    for (let i = 0; i < BAYS; i++) {
      const y = y0 + i * bay, top = y + bay;
      for (const s of [-1, 1]) {
        rod(g, m.yellow, [-HALF, y, s * HALF], [HALF, top, s * HALF], .06);
        rod(g, m.yellow, [HALF, y, s * HALF], [-HALF, top, s * HALF], .06);
        rod(g, m.yellow, [s * HALF, y, -HALF], [s * HALF, top, HALF], .06);
        rod(g, m.yellow, [s * HALF, y, HALF], [s * HALF, top, -HALF], .06);
        rod(g, m.yellow, [-HALF, top, s * HALF], [HALF, top, s * HALF], .05);
        rod(g, m.yellow, [s * HALF, top, -HALF], [s * HALF, top, HALF], .05);
        // Prirubnice (koljena) na svakom spoju polja — bez sitnih vijaka (u štampi se stope).
        if (i > 0) for (const x of [-HALF, HALF]) box(g, m.edge, x, y, s * HALF, .27, .1, .27);
      }
    }
    // Merdevine uz jedno lice stuba: dvije vođice + prečke.
    for (const x of [-.22, .22]) rod(g, m.steel, [x, 1.6, HALF + .1], [x, 23.6, HALF + .1], .022);
    for (let y = 2.2; y < 23.4; y += 1.1) rod(g, m.steel, [-.22, y, HALF + .1], [.22, y, HALF + .1], .018);
  }

  function deck(g) {
    box(g, m.yellow, 0, .16, 0, 2.4, .32, 2.4);
  }

  function machinery(g) {
    // Vitlo: bubanj (krug sa strane), kućište i sajla ka koturu na glavi.
    box(g, m.frame, -2.0, 1.0, 0, 1.6, 1.25, 1.5);
    rod(g, m.steel, [-2.0, 1.0, -.62], [-2.0, 1.0, .62], .36);
    rod(g, m.steel, [-2.0, 1.16, 0], [0, 4.75, 0], .03);
    box(g, m.edge, -3.8, .8, 0, .9, .95, 1.1);
    // Ograda oko mašinskog poda (iza i lijevo).
    for (let x = -4.9; x <= -.6; x += 1.05) rod(g, m.steel, [x, .35, -1.08], [x, 1.45, -1.08], .022);
    rod(g, m.steel, [-4.9, 1.45, -1.08], [-.6, 1.45, -1.08], .02);
    rod(g, m.steel, [-4.9, .95, -1.08], [-.6, .95, -1.08], .018);
  }

  function jib(g) {
    // Donje tetive (dvije) se uzdignu ka vrhu; gornja je prava.
    for (const z of [-JIB_Z, JIB_Z])
      profile(g, m.yellow, [JIB_ROOT, bottomY(JIB_ROOT), z], [JIB_TIP, bottomY(JIB_TIP), z], .12);
    profile(g, m.yellow, [JIB_ROOT, TOP_Y, 0], [JIB_TIP, TOP_Y, 0], .15);
    const step = (JIB_TIP - JIB_ROOT) / PANELS;
    for (let i = 0; i < PANELS; i++) {
      const xa = JIB_ROOT + i * step, xb = xa + step;
      // X-ukrućenje u svakom polju, sa obje strane — kao na referenci.
      for (const z of [-JIB_Z, JIB_Z]) {
        rod(g, m.yellow, [xa, bottomY(xa), z], [xb, TOP_Y, 0], .045);
        rod(g, m.yellow, [xb, bottomY(xb), z], [xa, TOP_Y, 0], .045);
      }
      for (const z of [-JIB_Z, JIB_Z]) rod(g, m.yellow, [xa, bottomY(xa), z], [xa, TOP_Y, 0], .03);
    }
    for (const z of [-JIB_Z, JIB_Z]) rod(g, m.yellow, [JIB_TIP, bottomY(JIB_TIP), z], [JIB_TIP, TOP_Y, 0], .045);
    box(g, m.edge, JIB_TIP + .1, TOP_Y - .12, 0, .26, .3, .3);
    // Staza (uska greda) ispod gornje tetive, vidljiva u donjim kadrovima.
    box(g, m.frame, 4, 1.55, 0, 20, .05, .9);
  }

  function head(g) {
    // Glava: piramida sa dva kotura na vrhu i priveznicama ka strijeli i kontrategu.
    const feet = [[-.55, .3, -.55], [.55, .3, -.55], [.55, .3, .55], [-.55, .3, .55]];
    const apex = [0, 4.7, 0];
    for (const p of feet) rod(g, m.yellow, p, [p[0] * .5, apex[1], p[2] * .5], .06);
    for (const t of [.45, .8]) {
      const q = feet.map((p) => p.map((v, i) => v + (apex[i] - v) * t));
      for (let i = 0; i < 4; i++) rod(g, m.yellow, q[i], q[(i + 1) % 4], .035);
    }
    box(g, m.edge, 0, apex[1] + .1, 0, .6, .34, .52);
    for (const z of [-.2, .2]) rod(g, m.edge, [-.22, apex[1] + .22, z], [.22, apex[1] + .22, z], .27);
    rod(g, m.steel, [0, apex[1] + .32, 0], [0, apex[1] + .14, 0], .05);
    // Priveznice: jedna ka vrhu strijele i jedna ka kontrategu — dvije čiste linije.
    rod(g, m.steel, [0, apex[1] + .3, 0], [JIB_TIP, TOP_Y + .12, 0], .05);
    rod(g, m.steel, [0, apex[1] + .3, 0], [JIB_ROOT + .2, bottomY(JIB_ROOT) + .12, 0], .05);
  }

  function cab(g) {
    // Kabina sa ramovima i staklima na tri strane; nadstrešnica i nosači do poda.
    const x = 1.7, y = -.45, z = .85, w = 1.5, h = 1.55, d = 1.35;
    box(g, m.yellow, x, y, z, w, h, d);
    for (const sx of [-1, 1]) box(g, m.edge, x + sx * .43, y, z, .09, h + .1, .09);
    for (const sz of [-1, 1]) box(g, m.edge, x, y, z + sz * (.38), .09, h + .1, .09);
    rod(g, m.edge, [x - w / 2, y + h / 2 + .06, z - d / 2], [x + w / 2, y + h / 2 + .06, z - d / 2], .05);
    rod(g, m.edge, [x - w / 2, y + h / 2 + .06, z + d / 2], [x + w / 2, y + h / 2 + .06, z + d / 2], .05);
    const win = (gw, gh, wx, wy, wz, ry) => {
      const p = new THREE.Mesh(glassGeo, m.glass);
      p.position.set(wx, wy, wz); p.scale.set(gw, gh, 1); p.rotation.y = ry; g.add(p);
    };
    win(1.2, 1.05, x + w / 2 + .02, y + .05, z, Math.PI / 2);
    win(1.2, 1.05, x, y + .05, z + d / 2 + .02, 0);
    win(1.2, 1.05, x, y + .05, z - d / 2 - .02, Math.PI);
    for (const a of [-1, 1]) {
      rod(g, m.edge, [x + a * .62, y - h / 2 - .02, z - d / 2], [x + a * .45, y - h / 2 - .7, z - d / 2 + .3], .05);
      rod(g, m.edge, [x + a * .62, y - h / 2 - .02, z + d / 2], [x + a * .45, y - h / 2 - .7, z + d / 2 - .3], .05);
    }
  }

  function counterweight(g) {
    // Kontrateg: slagalica kocki (3 × 2 × 2), kao kocke betona na referenci.
    const s = .76;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++)
      box(g, cubeMat, -4.5 - i * s, -.38 + j * s, (k ? 1 : -1) * s / 2, s - .04, s - .04, s - .04);
    // Okvir koji drži kocke.
    for (const z of [-.42, .42]) rod(g, m.edge, [-6.4, .5, z], [-4.1, .5, z], .04);
    for (const x of [-6.3, -5.5, -4.7]) for (const z of [-.42, .42]) rod(g, m.edge, [x, .45, z], [x, 1.15, z], .035);
  }

  function trolley(g) {
    box(g, m.yellow, 0, 0, 0, 1.0, .45, 1.5);
    for (const x of [-.32, .32]) rod(g, m.steel, [x, -.24, -.84], [x, -.24, .84], .11);
    box(g, m.edge, 0, -.34, 0, .6, .3, .8);
    for (const z of [-.3, .3]) rod(g, m.steel, [-.18, -.34, z], [.18, -.34, z], .17);
  }

  function hookBlock(g) {
    // Kuka: kompaktan blok (jaram, dvije ploče sa koturovima), vrat i luk kuke.
    box(g, m.edge, 0, .8, 0, .55, .3, .42);
    for (const z of [-.17, .17]) {
      box(g, m.edge, 0, .3, z, .85, 1.0, .07);
      // Koturovi kao diskovi na ploči: čitaju se kao krugovi (veliki + glavčina).
      rod(g, m.edge, [0, .35, z * 1.25], [0, .35, z * 1.42], .32);
      rod(g, m.edge, [0, .3, z * 1.5], [0, .3, z * 1.6], .13);
    }
    for (const x of [-.2, .2]) rod(g, m.steel, [x, .3, -.2], [x, .3, .2], .26);
    rod(g, m.steel, [0, .0, 0], [0, -.55, 0], .1);
    const p = [[0, -.55], [.28, -.74], [.42, -1.02], [.32, -1.28], [-.02, -1.36], [-.28, -1.22]];
    for (let i = 0; i < p.length - 1; i++) rod(g, m.steel, [p[i][0], p[i][1], 0], [p[i + 1][0], p[i + 1][1], 0], .08);
  }

  function bundle(g) {
    // Teret: svežanj dasaka sa dvije trake — kao na referenci.
    for (let i = 0; i < 6; i++)
      box(g, m.white, 0, .055 + i * .1, 0, 1.95 - (i % 2) * .04, .1, 1.15 - (i % 3) * .02);
    for (const x of [-.62, .62]) {
      rod(g, m.sling, [x, .615, -.6], [x, .615, .6], .028);
      for (const z of [-.6, .6]) rod(g, m.sling, [x, .02, z], [x, .615, z], .028);
    }
    batch(g);
  }

  return { base, mast, deck, machinery, jib, head, cab, counterweight, trolley, hookBlock, bundle };
}
