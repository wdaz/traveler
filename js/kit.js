// Building blocks for the travel scenes: flat-shaded low-poly shapes, plus modern people, vehicles and street furniture.
// Every helper returns a THREE.Object3D positioned at the origin; the caller places it.
import * as THREE from "three";

const matCache = new Map();
export function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshLambertMaterial({ color, flatShading: true, ...opts }));
  }
  return matCache.get(key);
}

function shadowed(mesh) { mesh.castShadow = true; mesh.receiveShadow = true; return mesh; }

export function box(w, h, d, color) {
  const m = shadowed(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color)));
  m.position.y = h / 2; // sits on the ground
  return m;
}

export function cylinder(rTop, rBottom, h, color, seg = 10) {
  const m = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, seg), mat(color)));
  m.position.y = h / 2;
  return m;
}

export function cone(r, h, color, seg = 8) {
  const m = shadowed(new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat(color)));
  m.position.y = h / 2;
  return m;
}

export function sphere(r, color, seg = 10) {
  return shadowed(new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(6, seg - 2)), mat(color)));
}

// A wall with an arched opening cut out (extruded shape). w × h, thickness t, opening ow × oh.
export function archWall(w, h, t, color, ow = 0, oh = 0) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.lineTo(-w / 2, 0);
  if (ow > 0) {
    const hole = new THREE.Path();
    hole.moveTo(-ow / 2, 0); hole.lineTo(ow / 2, 0); hole.lineTo(ow / 2, oh - ow / 2);
    hole.absarc(0, oh - ow / 2, ow / 2, 0, Math.PI, false);
    hole.lineTo(-ow / 2, 0);
    s.holes.push(hole);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false });
  g.translate(0, 0, -t / 2);
  return shadowed(new THREE.Mesh(g, mat(color)));
}

// A solid arch-topped slab (a door, a window panel). Stands on the ground.
export function archSlab(w, h, t, color) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - w / 2);
  s.absarc(0, h - w / 2, w / 2, 0, Math.PI, false); s.lineTo(-w / 2, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false });
  g.translate(0, 0, -t / 2);
  return shadowed(new THREE.Mesh(g, mat(color)));
}

// Stairs going up along -z. n steps, each step w wide, sh high, sd deep.
export function stairs(n, w, sh, sd, color) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const b = box(w, sh * (i + 1), sd, color);
    b.position.z = -i * sd;
    g.add(b);
  }
  return g;
}

// A robed, masked character. Options:
//  robe, trim (sash/hat colour), mask, skin, hat: "hood"|"tall"|"turban"|"round"|"crown"|none,
//  prop: "spear"|"staff"|"book"|"scroll"|none, scale, sit (boolean)
export function figure(o = {}) {
  const g = new THREE.Group();
  const s = o.scale || 1, robe = o.robe || "#8a6a5a", trim = o.trim || "#d9b44a";
  const bodyH = (o.sit ? 0.9 : 1.45) * s;
  const body = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.2 * s, 0.42 * s, bodyH, 10), mat(robe)));
  body.position.y = bodyH / 2; g.add(body);
  const sash = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.3 * s, 0.33 * s, 0.1 * s, 10), mat(trim)));
  sash.position.y = bodyH * 0.55; g.add(sash);
  const headY = bodyH + 0.22 * s;
  const head = sphere(0.22 * s, o.skin || "#2a1a14"); head.position.y = headY; g.add(head);
  // mask: a flattened sphere in front of the head, with a dark eye slit
  const mask = sphere(0.19 * s, o.mask || "#f2e6d0"); mask.scale.set(1, 1.15, 0.55); mask.position.set(0, headY, 0.1 * s); g.add(mask);
  const slit = new THREE.Mesh(new THREE.BoxGeometry(0.2 * s, 0.035 * s, 0.05 * s), mat("#1a1010"));
  slit.position.set(0, headY + 0.02 * s, 0.2 * s); g.add(slit);
  let hat = null;
  if (o.hat === "hood") { hat = new THREE.Mesh(new THREE.SphereGeometry(0.27 * s, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), mat(robe)); hat.position.y = headY - 0.02 * s; hat.rotation.x = -0.25; }
  if (o.hat === "tall") { hat = new THREE.Mesh(new THREE.ConeGeometry(0.2 * s, 0.75 * s, 8), mat(trim)); hat.position.y = headY + 0.5 * s; }
  if (o.hat === "turban") { hat = new THREE.Mesh(new THREE.SphereGeometry(0.26 * s, 10, 6), mat(trim)); hat.scale.set(1, 0.6, 1); hat.position.y = headY + 0.16 * s; }
  if (o.hat === "round") { hat = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * s, 0.4 * s, 0.14 * s, 12), mat(trim)); hat.position.y = headY + 0.2 * s; }
  if (o.hat === "crown") { hat = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * s, 0.2 * s, 0.26 * s, 6, 1, true), mat(trim, { side: THREE.DoubleSide })); hat.position.y = headY + 0.24 * s; }
  if (hat) { shadowed(hat); g.add(hat); }
  if (o.prop === "spear" || o.prop === "staff") {
    const len = (o.prop === "spear" ? 2.6 : 1.9) * s;
    const pole = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.03 * s, 0.03 * s, len, 6), mat("#4a2e1c")));
    pole.position.set(0.5 * s, len / 2, 0.1 * s); g.add(pole);
    if (o.prop === "spear") { const tip = shadowed(new THREE.Mesh(new THREE.ConeGeometry(0.08 * s, 0.3 * s, 6), mat(trim))); tip.position.set(0.5 * s, len + 0.15 * s, 0.1 * s); g.add(tip); }
  }
  if (o.prop === "book" || o.prop === "scroll") {
    const p = o.prop === "book" ? new THREE.Mesh(new THREE.BoxGeometry(0.3 * s, 0.22 * s, 0.08 * s), mat(trim))
                                : new THREE.Mesh(new THREE.CylinderGeometry(0.05 * s, 0.05 * s, 0.4 * s, 6), mat("#efe2c4"));
    p.position.set(0.25 * s, bodyH * 0.6, 0.35 * s); if (o.prop === "scroll") p.rotation.z = Math.PI / 2;
    shadowed(p); g.add(p);
  }
  g.userData.height = headY + 0.4 * s;
  return g;
}

// Text on a plaque, readable in the world. Faces +z by default.
export function sign(text, { bg = "#f2e3c4", ink = "#2a1a12", height = 0.4, font = "Marcellus, Georgia, serif" } = {}) {
  const px = 64, c = document.createElement("canvas"), ctx = c.getContext("2d");
  ctx.font = `${px}px ${font}`;
  const w = Math.ceil(ctx.measureText(text).width + px * 1.2);
  c.width = w; c.height = Math.ceil(px * 1.6);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = ink; ctx.lineWidth = 6; ctx.strokeRect(3, 3, c.width - 6, c.height - 6);
  ctx.font = `${px}px ${font}`; ctx.fillStyle = ink; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, c.width / 2, c.height / 2 + 4);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const aspect = c.width / c.height;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(height * aspect, height), new THREE.MeshBasicMaterial({ map: tex }));
  return m;
}

// An emoji drawn on a camera-facing sprite (fruit, bread, a key...). size in world units.
export function emoji(ch, size = 0.5) {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const ctx = c.getContext("2d"); ctx.font = "100px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(ch, 64, 72);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sp.scale.set(size, size, size);
  return sp;
}

// Small helper: place an object and return it.
export function at(obj, x, y, z, rotY = 0) { obj.position.x += x; obj.position.y += y; obj.position.z += z; obj.rotation.y = rotY; return obj; }

export function group(...children) { const g = new THREE.Group(); children.forEach(c => g.add(c)); return g; }



/* ======================= MODERN WORLD ======================= */

// A modern low-poly person with a face, rigged like the tower's figures so animateFigure() brings it to life. Options:
//  top (shirt/jacket colour), bottom (trousers/skirt), skin, hair, hairStyle: "short"|"long"|"bun"|"bald",
//  hat: "cap"|"police"|"beanie"|"chef"|none (hatColor), prop: "suitcase"|"backpack"|"phone"|"clipboard"|"bag"|"tray"|none (propColor),
//  skirt (boolean), vest (colour, e.g. hi-vis), tie (colour), glasses (boolean), beard (colour), scale, sit (boolean, legs bent forward)
export function person(o = {}) {
  const g = new THREE.Group(), rig = new THREE.Group(); g.add(rig);
  const s = o.scale || 1, top = o.top || "#3d6fb6", bottom = o.bottom || "#2b2f3a";
  const skin = o.skin || SKINS[Math.abs(hash(top + bottom)) % SKINS.length], hair = o.hair || HAIRS[Math.abs(hash(bottom + top + "h")) % HAIRS.length];
  const legH = 0.8 * s, torsoH = 0.62 * s;
  const hipY = o.sit ? 0.48 * s : legH;
  // legs hang from the hips; rotating the pivot swings the leg
  const legs = [-1, 1].map(sd => {
    const pivot = new THREE.Group(); pivot.position.set(sd * 0.11 * s, hipY, 0); rig.add(pivot);
    if (o.sit) {
      const thigh = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.17 * s, 0.17 * s, 0.45 * s), mat(bottom))); thigh.position.set(0, 0, 0.2 * s); pivot.add(thigh);
      const shin = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.15 * s, 0.45 * s, 0.15 * s), mat(bottom))); shin.position.set(0, -0.25 * s, 0.42 * s); pivot.add(shin);
      const shoe = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.16 * s, 0.08 * s, 0.26 * s), mat("#1d1d22"))); shoe.position.set(0, -hipY + 0.04 * s, 0.48 * s); pivot.add(shoe);
    } else {
      const leg = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.17 * s, legH, 0.18 * s), mat(bottom))); leg.position.y = -legH / 2; pivot.add(leg);
      const shoe = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.17 * s, 0.08 * s, 0.28 * s), mat("#1d1d22"))); shoe.position.set(0, -legH + 0.04 * s, 0.04 * s); pivot.add(shoe);
    }
    return pivot;
  });
  if (o.skirt) { const sk = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.22 * s, 0.32 * s, 0.4 * s, 10), mat(bottom))); sk.position.y = hipY - 0.12 * s; rig.add(sk); }
  // torso, slightly tapered, with shoulders
  const torso = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.25 * s, 0.2 * s, torsoH, 4, 1), mat(top)));
  torso.rotation.y = Math.PI / 4; torso.scale.z = 0.62; torso.position.y = hipY + torsoH / 2; rig.add(torso);
  [-1, 1].forEach(sd => { const sh = sphere(0.09 * s, top, 8); sh.position.set(sd * 0.25 * s, hipY + torsoH - 0.07 * s, 0); rig.add(sh); });
  if (o.vest) { const v = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.265 * s, 0.215 * s, torsoH * 0.8, 4, 1), mat(o.vest))); v.rotation.y = Math.PI / 4; v.scale.z = 0.66; v.position.y = hipY + torsoH * 0.45; rig.add(v); }
  if (o.tie) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.06 * s, 0.32 * s, 0.02 * s), mat(o.tie)); t.position.set(0, hipY + torsoH * 0.62, 0.115 * s); rig.add(t); }
  // arms hang from the shoulders; rotating the pivot swings the whole arm
  const shoulderY = hipY + torsoH - 0.06 * s;
  const arm = sd => {
    const pivot = new THREE.Group(); pivot.position.set(sd * 0.3 * s, shoulderY, 0);
    const sleeve = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.13 * s, 0.56 * s, 0.14 * s), mat(top))); sleeve.position.y = -0.28 * s; pivot.add(sleeve);
    const hand = sphere(0.07 * s, skin, 6); hand.position.set(0, -0.6 * s, 0); pivot.add(hand);
    pivot.rotation.z = sd * 0.08; rig.add(pivot); return pivot;
  };
  const armL = arm(-1), armR = arm(1);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07 * s, 0.07 * s, 0.1 * s, 6), mat(skin)); neck.position.y = hipY + torsoH + 0.04 * s; rig.add(neck);
  // head with a face: eyes that blink, brows, nose, ears, a mouth that opens when talking
  const headY = hipY + torsoH + 0.25 * s;
  const headG = new THREE.Group(); headG.position.y = headY; rig.add(headG);
  const head = sphere(0.19 * s, skin, 14); head.scale.set(0.95, 1.1, 1); headG.add(head);
  [-1, 1].forEach(sd => { const ear = sphere(0.042 * s, skin, 6); ear.scale.set(0.5, 1, 0.8); ear.position.set(sd * 0.18 * s, 0, 0); headG.add(ear); });
  const eyes = new THREE.Group(), white = new THREE.MeshBasicMaterial({ color: "#fbf7ef" }), dark = new THREE.MeshBasicMaterial({ color: "#1d120c" });
  [-1, 1].forEach(sd => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.036 * s, 10, 8), white); e.scale.set(1.15, 1, 0.5); e.position.set(sd * 0.068 * s, 0.03 * s, 0.168 * s); eyes.add(e);
    const pu = new THREE.Mesh(new THREE.SphereGeometry(0.02 * s, 8, 6), dark); pu.position.set(sd * 0.068 * s, 0.028 * s, 0.186 * s); eyes.add(pu);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.072 * s, 0.016 * s, 0.02 * s), mat(o.hairStyle === "bald" ? "#5a4636" : hair)); brow.position.set(sd * 0.07 * s, 0.08 * s, 0.172 * s); brow.rotation.z = -sd * 0.12; headG.add(brow);
  });
  headG.add(eyes);
  const nose = shadowed(new THREE.Mesh(new THREE.ConeGeometry(0.028 * s, 0.065 * s, 6), mat(skin))); nose.rotation.x = Math.PI / 2; nose.position.set(0, -0.015 * s, 0.205 * s); headG.add(nose);
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.034 * s, 10, 6), new THREE.MeshBasicMaterial({ color: "#5a1e1a" })); mouth.scale.set(1.2, 0.18, 0.4); mouth.position.set(0, -0.092 * s, 0.162 * s); headG.add(mouth);
  if (o.glasses) {
    [-1, 1].forEach(sd => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.045 * s, 0.008 * s, 6, 14), mat("#222")); r.position.set(sd * 0.068 * s, 0.03 * s, 0.19 * s); headG.add(r); });
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.05 * s, 0.01 * s, 0.01 * s), mat("#222")); br.position.set(0, 0.035 * s, 0.195 * s); headG.add(br);
  }
  if (o.beard) { const bd = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.15 * s, 10, 6, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.4), mat(o.beard))); bd.position.set(0, 0.0, 0.03 * s); headG.add(bd); }
  // hair
  const hs = o.hairStyle || "short";
  if (hs !== "bald") {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.205 * s, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), mat(hair));
    cap.position.set(0, 0.02 * s, -0.015 * s); cap.rotation.x = -0.35; shadowed(cap); headG.add(cap);
    if (hs === "long") { const back = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.36 * s, 0.42 * s, 0.12 * s), mat(hair))); back.position.set(0, -0.12 * s, -0.12 * s); headG.add(back); }
    if (hs === "bun") { const bun = sphere(0.1 * s, hair, 8); bun.position.set(0, 0.17 * s, -0.12 * s); headG.add(bun); }
  }
  // hats
  const hatCol = o.hatColor || top;
  if (o.hat === "cap" || o.hat === "police") {
    const pol = o.hat === "police";
    const crown = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.2 * s, 0.205 * s, (pol ? 0.16 : 0.12) * s, 12), mat(pol ? (o.hatColor || "#1d2a4a") : hatCol)));
    crown.position.y = 0.15 * s; headG.add(crown);
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.3 * s, 0.03 * s, 0.16 * s), mat(pol ? "#111" : hatCol)); brim.position.set(0, 0.1 * s, 0.2 * s); headG.add(brim);
    if (pol) { const badge = new THREE.Mesh(new THREE.BoxGeometry(0.07 * s, 0.06 * s, 0.01 * s), mat("#e8c45a")); badge.position.set(0, 0.16 * s, 0.205 * s); headG.add(badge); }
  }
  if (o.hat === "beanie") { const b = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.215 * s, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), mat(hatCol))); b.position.y = 0.03 * s; headG.add(b); }
  if (o.hat === "chef") { const c = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.2 * s, 0.17 * s, 0.3 * s, 10), mat("#ffffff"))); c.position.y = 0.3 * s; headG.add(c); }
  // props: held ones live on the right arm so they move with it
  if (o.prop === "suitcase") {
    const sc = box(0.42 * s, 0.55 * s, 0.22 * s, o.propColor || "#c0392b"); sc.position.set(0.55 * s, 0, 0.05 * s); g.add(sc);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04 * s, 0.35 * s, 0.04 * s), mat("#333")); handle.position.set(0.55 * s, 0.72 * s, 0.05 * s); g.add(handle);
  }
  if (o.prop === "backpack") { const bp = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.38 * s, 0.46 * s, 0.2 * s), mat(o.propColor || "#e67e22"))); bp.position.set(0, hipY + torsoH * 0.5, -0.2 * s); rig.add(bp); }
  if (o.prop === "phone") { const ph = new THREE.Mesh(new THREE.BoxGeometry(0.08 * s, 0.14 * s, 0.02 * s), mat("#111")); ph.position.set(0, -0.62 * s, 0.07 * s); armR.add(ph); armR.rotation.x = -1.0; armR.userData.holding = true; }
  if (o.prop === "clipboard") { const cb = new THREE.Mesh(new THREE.BoxGeometry(0.24 * s, 0.32 * s, 0.03 * s), mat("#c8a46a")); cb.position.set(-0.05 * s, -0.58 * s, 0.1 * s); cb.rotation.x = 0.6; armR.add(cb); armR.rotation.x = -0.9; armR.userData.holding = true; }
  if (o.prop === "bag") { const b = box(0.3 * s, 0.32 * s, 0.14 * s, o.propColor || "#f2f2f2"); b.position.set(0, -0.92 * s, 0); armL.add(b); }
  if (o.prop === "tray") { const t = new THREE.Mesh(new THREE.BoxGeometry(0.4 * s, 0.03 * s, 0.3 * s), mat("#7a7a7a")); t.position.set(-0.1 * s, -0.6 * s, 0.2 * s); armR.add(t); armR.rotation.x = -1.2; armR.userData.holding = true; }
  g.userData.height = headY + 0.35 * s;
  g.userData.figure = { rig, armL, armR, headG, eyes, mouth, legs: o.sit ? null : legs, sit: !!o.sit, phase: Math.random() * 10,
    baseArmRx: armR.rotation.x, yaw: null, talk: 0, look: 0, nextBlink: 1 + Math.random() * 3 };
  return g;
}

// Bring a person to life for one frame (same rig as the tower's figures, plus walking legs).
// st: { walking, talking, lookAt: THREE.Vector3 | null, turnTo: THREE.Vector3 | null, keepYaw, still (reduced motion) }
const _v = new THREE.Vector3();
export function animateFigure(g, t, dt, st = {}) {
  const f = g.userData.figure; if (!f) return;
  const ph = f.phase, k = Math.min(1, dt * 6);
  if (f.yaw === null) f.yaw = g.rotation.y;
  f.talk += ((st.talking ? 1 : 0) - f.talk) * Math.min(1, dt * 5);
  if (st.still) { f.rig.scale.y = 1; return; }

  // breathing and a slow weight shift
  f.rig.scale.y = 1 + Math.sin(t * 1.9 + ph) * 0.015;
  f.rig.rotation.z = Math.sin(t * 0.6 + ph) * 0.02 + (st.walking ? Math.sin(t * 10) * 0.03 : 0);
  f.rig.position.y = st.talking ? Math.abs(Math.sin(t * 7 + ph)) * 0.015 : 0;

  // turn the whole body towards someone who comes close, then back to the authored pose
  if (st.turnTo) { g.getWorldPosition(_v); const want = Math.atan2(st.turnTo.x - _v.x, st.turnTo.z - _v.z); g.rotation.y += angleDelta(g.rotation.y, want) * Math.min(1, dt * 3); }
  else if (!st.walking && !st.keepYaw) g.rotation.y += angleDelta(g.rotation.y, f.yaw) * Math.min(1, dt * 1.5);

  // head: look at a target, otherwise glance around now and then
  let yaw = Math.sin(t * 0.35 + ph) * 0.35 * (Math.sin(t * 0.13 + ph * 2) > 0.3 ? 1 : 0.2), pitch = 0;
  if (st.lookAt) {
    f.headG.getWorldPosition(_v);
    const world = Math.atan2(st.lookAt.x - _v.x, st.lookAt.z - _v.z);
    yaw = THREE.MathUtils.clamp(angleDelta(g.rotation.y, world), -1.1, 1.1);
    pitch = THREE.MathUtils.clamp(-Math.atan2(st.lookAt.y - _v.y, Math.hypot(st.lookAt.x - _v.x, st.lookAt.z - _v.z)), -0.4, 0.4);
  }
  f.headG.rotation.y += (yaw - f.headG.rotation.y) * k;
  f.headG.rotation.x += (pitch + (st.talking ? Math.sin(t * 9 + ph) * 0.09 : 0) - f.headG.rotation.x) * k;
  f.headG.rotation.z = Math.sin(t * 0.8 + ph) * 0.04 * (1 - f.talk) + Math.sin(t * 4.5) * 0.06 * f.talk;

  // arms: swing when walking, gesture when talking, rest otherwise
  let lx = Math.sin(t * 1.3 + ph) * 0.04, rx = f.baseArmRx + Math.sin(t * 1.3 + ph + 1) * 0.04, lz = -0.08, rz = 0.08;
  if (st.walking) { lx = Math.sin(t * 10) * 0.6; if (!f.armR.userData.holding) rx = -Math.sin(t * 10) * 0.6; }
  if (f.talk > 0.01) {
    const free = f.armR.userData.holding ? f.armL : f.armR, side = free === f.armR ? 1 : -1;
    const gx = -1.1 - Math.sin(t * 5.5 + ph) * 0.35, gz = side * (0.35 + Math.sin(t * 3.7) * 0.15);
    if (free === f.armR) { rx += (gx - rx) * f.talk; rz += (gz - rz) * f.talk; } else { lx += (gx - lx) * f.talk; lz += (gz - lz) * f.talk; }
  }
  f.armL.rotation.x += (lx - f.armL.rotation.x) * k; f.armL.rotation.z += (lz - f.armL.rotation.z) * k;
  f.armR.rotation.x += (rx - f.armR.rotation.x) * k; f.armR.rotation.z += (rz - f.armR.rotation.z) * k;
  // legs step while walking
  if (f.legs) { const sw = st.walking ? Math.sin(t * 10) * 0.55 : 0; f.legs[0].rotation.x += (-sw - f.legs[0].rotation.x) * k * 2; f.legs[1].rotation.x += (sw - f.legs[1].rotation.x) * k * 2; }

  // mouth opens and closes while talking
  f.mouth.scale.y = 0.18 + f.talk * (0.35 + Math.sin(t * 17 + ph) * 0.3 + Math.sin(t * 11) * 0.15);
  // blink
  f.nextBlink -= dt;
  if (f.nextBlink < 0) { f.eyes.scale.y = 0.1; if (f.nextBlink < -0.12) { f.eyes.scale.y = 1; f.nextBlink = 2 + Math.random() * 4; } }
}
const SKINS = ["#e9c3a0", "#d9a77f", "#c08a62", "#a36f4c", "#7d5236", "#f0d2b6"];
const HAIRS = ["#2b1d16", "#4a3022", "#6b4a2e", "#1f1a1a", "#8c8278", "#b5651d"];
function hash(str) { let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) | 0; return h; }
function angleDelta(a, b) { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; }

// A car, nose facing +x. Options: color, taxi (yellow roof sign), length.
export function car(o = {}) {
  const g = new THREE.Group(), c = o.color || (o.taxi ? "#f2c230" : "#3a6fa0"), L = o.length || 3.4;
  const body = box(L, 0.55, 1.6, c); body.position.y = 0.3 + 0.275; g.add(body);
  const cabin = box(L * 0.55, 0.5, 1.45, c); cabin.position.set(-L * 0.05, 0.85, 0); g.add(cabin);
  const glassMat = mat("#203040");
  [0.74, -0.74].forEach(z => { const w = new THREE.Mesh(new THREE.BoxGeometry(L * 0.5, 0.36, 0.02), glassMat); w.position.set(-L * 0.05, 1.1, z); g.add(w); });
  [1, -1].forEach(sx => { const w = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.36, 1.3), glassMat); w.position.set(sx * L * 0.27 - L * 0.05, 1.1, 0); g.add(w); });
  [[L * 0.32, 0.8], [L * 0.32, -0.8], [-L * 0.32, 0.8], [-L * 0.32, -0.8]].forEach(([x, z]) => {
    const wh = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 12), mat("#1b1b1b"))); wh.rotation.x = Math.PI / 2; wh.position.set(x, 0.32, z); g.add(wh);
  });
  [0.5, -0.5].forEach(z => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.25), new THREE.MeshBasicMaterial({ color: "#fff6c8" })); l.position.set(L / 2 + 0.01, 0.65, z); g.add(l); });
  if (o.taxi) {
    const ts = box(0.6, 0.18, 0.3, "#ffffff"); ts.position.y = 1.1 + 0.09; g.add(ts);
    const lbl = sign("TAXI", { height: 0.16, bg: "#ffffff", ink: "#111" }); lbl.position.set(0, 1.19, 0.16); g.add(lbl);
    for (let i = 0; i < 6; i++) { const ch = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.02), mat(i % 2 ? "#111" : "#fff")); ch.position.set(-L * 0.3 + i * 0.2, 0.62, 0.81); g.add(ch); }
  }
  g.userData.height = 1.6;
  return g;
}

// A city bus, nose facing +x. Options: color, number, dest (text shown on the destination board).
export function bus(o = {}) {
  const g = new THREE.Group(), c = o.color || "#d94a3a", L = o.length || 8;
  const body = box(L, 2.4, 2.3, c); body.position.y = 0.35 + 1.2; g.add(body);
  const glass = mat("#1e2c3a");
  const winR = new THREE.Mesh(new THREE.BoxGeometry(L * 0.86, 0.9, 0.02), glass); winR.position.set(-L * 0.04, 2.15, 1.16); g.add(winR);
  const winL = winR.clone(); winL.position.z = -1.16; g.add(winL);
  const front = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.2, 2.0), glass); front.position.set(L / 2 + 0.01, 2.0, 0); g.add(front);
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.9, 0.03), mat("#2c3e50")); door.position.set(L / 2 - 1.0, 1.35, 1.17); g.add(door);
  [L * 0.33, -L * 0.33].forEach(x => [1.05, -1.05].forEach(z => {
    const wh = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 12), mat("#1b1b1b"))); wh.rotation.x = Math.PI / 2; wh.position.set(x, 0.45, z); g.add(wh);
  }));
  const board = sign(`${o.number || "7"}  ${o.dest || "CITY CENTRE"}`, { height: 0.3, bg: "#111", ink: "#ffb020", font: "Figtree, Arial, sans-serif" });
  board.rotation.y = Math.PI / 2; board.position.set(L / 2 + 0.03, 2.5, 0); g.add(board);
  const side = sign(`${o.number || "7"}`, { height: 0.4, bg: "#111", ink: "#ffb020", font: "Figtree, Arial, sans-serif" }); side.position.set(L / 2 - 2.2, 2.5, 1.17); g.add(side);
  g.userData.height = 3.2;
  return g;
}

// A rounded-ish tree: trunk + two blobs of leaves.
export function tree(o = {}) {
  const g = new THREE.Group(), s = o.scale || 1;
  const trunk = cylinder(0.15 * s, 0.22 * s, 1.6 * s, "#6b4a2b", 7); g.add(trunk);
  const c = o.color || "#4c9a52";
  const a = sphere(1.0 * s, c, 8); a.position.y = 2.1 * s; g.add(a);
  const b = sphere(0.7 * s, o.color2 || "#5fb465", 7); b.position.set(0.4 * s, 2.7 * s, 0.2 * s); g.add(b);
  g.userData.height = 3.2 * s;
  return g;
}

// A park/station bench (seat along x).
export function bench(o = {}) {
  const g = new THREE.Group(), w = o.width || 2, c = o.color || "#9a6a3a";
  const seat = box(w, 0.08, 0.5, c); seat.position.y = 0.48; g.add(seat);
  const back = box(w, 0.45, 0.06, c); back.position.set(0, 0.62, -0.24); g.add(back);
  [-w / 2 + 0.15, w / 2 - 0.15].forEach(x => { const l = box(0.08, 0.48, 0.45, "#333"); l.position.x = x; g.add(l); });
  g.userData.height = 1.2;
  return g;
}

// A street lamp.
export function lamp(o = {}) {
  const g = new THREE.Group(), h = o.height || 3.6;
  const pole = cylinder(0.06, 0.08, h, "#2d3436", 6); g.add(pole);
  const head = sphere(0.22, "#fff3c4", 8); head.position.y = h + 0.1; head.material = new THREE.MeshBasicMaterial({ color: "#fff3c4" }); g.add(head);
  g.userData.height = h + 0.4;
  return g;
}

// A potted plant.
export function plant(o = {}) {
  const g = new THREE.Group(), s = o.scale || 1;
  const pot = cylinder(0.28 * s, 0.2 * s, 0.45 * s, o.pot || "#d9d2c5", 8); g.add(pot);
  const leaves = sphere(0.45 * s, o.color || "#3f8f4a", 7); leaves.position.y = 0.85 * s; leaves.scale.y = 1.3; g.add(leaves);
  g.userData.height = 1.5 * s;
  return g;
}

// A suitcase standing on its wheels.
export function suitcase(color = "#c0392b", s = 1) {
  const g = new THREE.Group();
  const b = box(0.45 * s, 0.6 * s, 0.25 * s, color); b.position.y += 0.05 * s; g.add(b);
  const h = new THREE.Mesh(new THREE.BoxGeometry(0.2 * s, 0.05 * s, 0.05 * s), mat("#222")); h.position.y = 0.72 * s; g.add(h);
  g.userData.height = 0.9 * s;
  return g;
}

// A screen / display panel with text (dark background, glowing letters). Lines separated by "\n".
export function screen(text, { width = 2, bg = "#10161f", ink = "#ffcc4d", px = 48, font = "Figtree, Arial, sans-serif" } = {}) {
  const lines = String(text).split("\n");
  const c = document.createElement("canvas"), ctx = c.getContext("2d");
  ctx.font = `bold ${px}px ${font}`;
  const w = Math.ceil(Math.max(...lines.map(l => ctx.measureText(l).width)) + px * 1.2);
  c.width = w; c.height = Math.ceil(px * 1.35 * lines.length + px * 0.8);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
  ctx.font = `bold ${px}px ${font}`; ctx.fillStyle = ink; ctx.textBaseline = "middle";
  lines.forEach((l, i) => ctx.fillText(l, px * 0.6, px * 0.4 + px * 1.35 * (i + 0.5)));
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const h = width * c.height / c.width;
  return new THREE.Mesh(new THREE.PlaneGeometry(width, h), new THREE.MeshBasicMaterial({ map: tex }));
}

// A room shell: floor + back wall + side walls, open towards +z (the camera). Interiors use this.
// Returns the group; w along x, d along z (wall at z = -d/2), h tall.
export function room({ w = 26, d = 14, h = 6, wall = "#e8e2d6", floor = "#cbbfa9", side = true } = {}) {
  const g = new THREE.Group();
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w, d + 10), mat(floor)); f.rotation.x = -Math.PI / 2; f.position.set(0, 0.005, 5); f.receiveShadow = true; g.add(f);
  const back = box(w, h, 0.3, wall); back.position.z = -d / 2; g.add(back);
  if (side) [-1, 1].forEach(sx => { const sw = box(0.3, h, d, wall); sw.position.x = sx * w / 2; g.add(sw); });
  return g;
}

export { THREE };
