// Grand Hotel lobby: marble floor, wood panelling, gold trim, a reception desk, sofa, porter and a lift on the right.
// Spot ids (must match content.js): receptionist, form, keycard, breakfast, porter, guest, lift
// Flags read in update(): tookKey (hides the key card), st.open (lift doors open + glow)

function marbleTexture(THREE) {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d");
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
    g.fillStyle = (x + y) % 2 ? "#e9dfcf" : "#f7f1e6"; g.fillRect(x * 64, y * 64, 64, 64);
  }
  g.strokeStyle = "rgba(150,130,110,0.25)"; g.lineWidth = 1.5;
  for (let i = 0; i < 14; i++) {
    g.beginPath(); let px = Math.random() * 256, py = Math.random() * 256; g.moveTo(px, py);
    for (let s = 0; s < 5; s++) { px += (Math.random() - 0.3) * 40; py += (Math.random() - 0.5) * 30; g.lineTo(px, py); }
    g.stroke();
  }
  g.strokeStyle = "#c9a85a"; g.lineWidth = 2;
  for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 256); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(256, i * 64); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(7, 5); t.anisotropy = 4;
  return t;
}

export default {
  sky: { top: "#5a3a26", bottom: "#8a5a3a" },
  groundColor: "#3a2618",
  light: { sky: "#fff4e2", ground: "#6a4a30", hemi: 1.15, sun: "#ffe6c0", sunIntensity: 1.3, sunPos: [-6, 14, 8] },
  bounds: { minX: -11, maxX: 11, minZ: -3.5, maxZ: 5 },
  camera: [0, 5.5, 10],

  build(k, api) {
    const { THREE } = api;
    api.spawn = [-8, 3];
    const GOLD = "#d4a93a", WOOD = "#6e4024", DARKWOOD = "#4a2a18", CREAM = "#f1e4cc";

    // ---- shell: cream walls, marble floor, wood wainscoting, gold trim
    api.add(k.room({ w: 28, d: 13, h: 7.5, wall: CREAM, floor: "#efe6d6" }));
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 18), new THREE.MeshLambertMaterial({ map: marbleTexture(THREE) }));
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.012, 2.5); floor.receiveShadow = true; api.add(floor);
    const wains = k.box(27.6, 1.3, 0.12, WOOD); k.at(wains, 0, 0, -6.3); api.add(wains);
    const rail = k.box(27.6, 0.1, 0.18, GOLD); k.at(rail, 0, 1.3, -6.3); api.add(rail);
    const cornice = k.box(27.6, 0.3, 0.3, GOLD); k.at(cornice, 0, 7.2, -6.3); api.add(cornice);
    [-1, 1].forEach(sx => {
      const sw = k.box(0.12, 1.3, 13, WOOD); k.at(sw, sx * 13.8, 0, 0); api.add(sw);
    });
    // pilasters
    [-11.5, -6, 1.8, 8.4, 12].forEach(x => {
      const p = k.box(0.6, 7, 0.25, "#e2cfae"); k.at(p, x, 0, -6.2); api.add(p);
      const cap = k.box(0.8, 0.25, 0.35, GOLD); k.at(cap, x, 6.75, -6.2); api.add(cap);
    });
    // red carpet runner from the entrance
    const runner = k.box(14, 0.02, 1.8, "#8e2430"); k.at(runner, -4, 0.01, 2.2); runner.castShadow = false; api.add(runner);
    const rEdge = k.box(14, 0.025, 2.0, GOLD); k.at(rEdge, -4, 0, 2.2); rEdge.castShadow = false; api.add(rEdge);

    // ---- entrance: glass doors in the back-left corner + doormat
    const ent = k.group();
    const frame = k.box(3.4, 4.2, 0.3, GOLD); ent.add(frame);
    const glassMat = new THREE.MeshLambertMaterial({ color: "#a8d4e6", transparent: true, opacity: 0.75 });
    [-0.8, 0.8].forEach(x => { const gl = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.9, 0.05), glassMat); gl.position.set(x, 1.95, 0.17); ent.add(gl); });
    const street = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 3.9), new THREE.MeshBasicMaterial({ color: "#d8ecf4" })); street.position.set(0, 1.95, 0.155); ent.add(street);
    [-0.12, 0.12].forEach(x => { const h = k.box(0.05, 0.9, 0.08, GOLD); k.at(h, x, 1.3, 0.22); ent.add(h); });
    const entSign = k.sign("ENTRANCE", { height: 0.32, bg: DARKWOOD, ink: "#f3d27a" }); entSign.position.set(0, 4.55, 0.2); ent.add(entSign);
    k.at(ent, -9.5, 0, -6.1); api.add(ent);

    // ---- big signs on the wall
    const gh = k.sign("GRAND HOTEL", { height: 0.8, bg: DARKWOOD, ink: "#f3d27a" }); gh.position.set(-2.5, 5.6, -6.12); api.add(gh);
    [-5.1, 0.1].forEach(x => { const st = k.sign("★★★★★", { height: 0.36, bg: DARKWOOD, ink: "#f3d27a", font: "Arial, sans-serif" }); st.position.set(x, 5.6, -6.12); st.scale.setScalar(0.8); api.add(st); });
    const rec = k.sign("RECEPTION", { height: 0.45, bg: "#f8efdc", ink: "#5a3418" }); rec.position.set(-2.5, 4.3, -6.12); api.add(rec);
    // wooden back panel behind the desk with key pigeonholes
    const panel = k.box(5.2, 2.6, 0.12, WOOD); k.at(panel, -2.5, 1.3, -6.15); api.add(panel);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
      const hole = k.box(0.6, 0.5, 0.06, DARKWOOD); k.at(hole, -4.25 + c * 0.7, 1.55 + r * 0.7, -6.07); hole.castShadow = false; api.add(hole);
      if ((r + c) % 3 === 0) { const kk = k.box(0.08, 0.22, 0.04, GOLD); k.at(kk, -4.25 + c * 0.7, 1.68 + r * 0.7, -6.02); kk.castShadow = false; api.add(kk); }
    }
    // clock on the wall
    const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.08, 20), k.mat("#fffaf0")); clock.rotation.x = Math.PI / 2; clock.position.set(-7.6, 4.8, -6.1); api.add(clock);
    const clockRim = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.05, 6, 20), k.mat(GOLD)); clockRim.position.set(-7.6, 4.8, -6.05); api.add(clockRim);
    const hand1 = k.box(0.04, 0.32, 0.02, "#222"); k.at(hand1, -7.6, 4.8, -6.03); hand1.geometry.translate(0, 0, 0); api.add(hand1);
    const hand2 = k.box(0.05, 0.22, 0.02, "#222"); hand2.rotation.z = -1.2; k.at(hand2, -7.6, 4.8, -6.03); hand2.rotation.z = -1.4; api.add(hand2);

    // ---- reception desk
    const DX = -2.5, DZ = -3.0;
    const desk = k.group();
    const body = k.box(5, 1.05, 1.0, WOOD); desk.add(body);
    const top = k.box(5.3, 0.1, 1.2, "#2f2622"); k.at(top, 0, 1.05, 0); desk.add(top);
    const trim = k.box(5.05, 0.08, 1.05, GOLD); k.at(trim, 0, 0.12, 0); desk.add(trim);
    [-1.7, 0, 1.7].forEach(x => { const inlay = k.box(1.3, 0.6, 0.04, DARKWOOD); k.at(inlay, x, 0.3, 0.51); desk.add(inlay); });
    const monitor = k.box(0.7, 0.45, 0.06, "#222"); k.at(monitor, 1.0, 1.25, -0.25); desk.add(monitor);
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), k.mat(GOLD)); bell.position.set(1.9, 1.1, 0.2); desk.add(bell);
    const flowers = k.group(k.cylinder(0.12, 0.09, 0.35, "#e8f0f4", 8)); [[-0.08, 0], [0.08, 0.05], [0, -0.07]].forEach(([x, z], i) => { const f = k.sphere(0.12, ["#e85a7a", "#f4c040", "#f4f0f0"][i], 6); f.position.set(x, 0.5, z); flowers.add(f); });
    k.at(flowers, -2.2, 1.1, -0.1); desk.add(flowers);
    k.at(desk, DX, 0, DZ); api.add(desk);

    // receptionist behind the desk
    const recp = k.person({ top: "#1f3a5f", bottom: "#1f3a5f", skirt: true, hair: "#7a4a22", hairStyle: "bun", skin: "#f0c8a0" });
    const badge = k.box(0.1, 0.06, 0.02, GOLD); k.at(badge, -0.13, 1.25, 0.13); recp.add(badge);
    const scarf = k.box(0.2, 0.08, 0.04, "#c0392b"); k.at(scarf, 0, 1.38, 0.13); recp.add(scarf);
    k.at(recp, DX - 0.2, 0, DZ - 1.0);
    api.spot("receptionist", recp, { walkTo: [DX - 0.6, -1.6], height: 2.0 });

    // registration form (paper + pen) on the desk
    const form = k.group();
    const paper = k.box(0.42, 0.012, 0.56, "#ffffff"); form.add(paper);
    for (let i = 0; i < 5; i++) { const ln = k.box(0.3, 0.004, 0.015, "#8090a0"); k.at(ln, 0, 0.012, -0.2 + i * 0.09); ln.castShadow = false; form.add(ln); }
    const pen = k.box(0.03, 0.03, 0.4, "#1d2a4a"); pen.rotation.y = 0.5; k.at(pen, 0.3, 0.01, 0); pen.rotation.y = 0.5; form.add(pen);
    const fSign = k.sign("REGISTRATION FORM", { height: 0.28, bg: "#fffaf0", ink: "#3a2a1a" }); fSign.position.set(-0.15, -0.42, 0.62); form.add(fSign);
    k.at(form, DX - 1.2, 1.11, DZ + 0.05);
    api.spot("form", form, { walkTo: [DX - 1.2, -1.6], height: 1.6 });

    // room key card on the desk, on a little stand
    const key = k.group();
    const stand = k.box(0.36, 0.06, 0.26, DARKWOOD); key.add(stand);
    const card = k.box(0.32, 0.22, 0.02, "#f3d27a"); card.rotation.x = -0.35; k.at(card, 0, 0.06, 0); card.rotation.x = -0.35; key.add(card);
    const stripe = k.box(0.32, 0.04, 0.025, "#2a1a12"); k.at(stripe, 0, 0.16, 0.0); stripe.rotation.x = -0.35; key.add(stripe);
    const kSign = k.sign("ROOM KEY", { height: 0.28, bg: "#fffaf0", ink: "#3a2a1a" }); kSign.position.set(0.2, -0.42, 0.52); key.add(kSign);
    k.at(key, DX + 0.3, 1.11, DZ + 0.15);
    api.spot("keycard", key, { walkTo: [DX + 0.3, -1.6], height: 1.6 });
    api.keyCard = key;

    // ---- breakfast easel sign
    const bf = k.group();
    [-0.45, 0.45].forEach(x => { const leg = k.box(0.07, 1.9, 0.07, GOLD); leg.rotation.x = -0.1; k.at(leg, x, 0, 0.05); bf.add(leg); });
    const back = k.box(0.07, 1.8, 0.07, GOLD); back.rotation.x = 0.25; k.at(back, 0, 0, -0.35); bf.add(back);
    const board = k.box(1.3, 1.0, 0.06, DARKWOOD); k.at(board, 0, 0.95, 0.1); bf.add(board);
    const bSign = k.screen("BREAKFAST\n7–10\nFIRST FLOOR", { width: 1.15, bg: "#2a1a12", ink: "#f3d27a", px: 44 });
    bSign.position.set(0, 1.45, 0.14); bf.add(bSign);
    const bLabel = k.sign("BREAKFAST · 7–10 · FIRST FLOOR", { height: 0.22, bg: "#fffaf0", ink: "#3a2a1a" }); bLabel.position.set(0, 0.62, 0.14); bf.add(bLabel);
    k.at(bf, 1.6, 0, -1.6);
    api.spot("breakfast", bf, { walkTo: [1.6, 0.0], height: 2.2 });

    // ---- the guest on a sofa (left, near the entrance)
    const sofa = k.group();
    const seat = k.box(2.6, 0.45, 0.9, "#2f5a4a"); sofa.add(seat);
    const sback = k.box(2.6, 0.6, 0.25, "#2f5a4a"); k.at(sback, 0, 0.45, -0.38); sofa.add(sback);
    [-1.38, 1.38].forEach(x => { const arm = k.box(0.25, 0.7, 0.95, "#264a3c"); k.at(arm, x, 0, 0); sofa.add(arm); });
    const cush = k.box(0.5, 0.4, 0.15, "#d4a93a"); cush.rotation.z = 0.2; k.at(cush, 0.8, 0.55, -0.2); sofa.add(cush);
    k.at(sofa, -7.6, 0, -3.6); api.add(sofa);
    const ctable = k.group(k.cylinder(0.5, 0.5, 0.06, "#2f2622", 14)); ctable.children[0].position.y = 0.45; const cl = k.cylinder(0.06, 0.12, 0.45, GOLD, 6); ctable.add(cl);
    const cup = k.cylinder(0.08, 0.06, 0.12, "#ffffff", 8); k.at(cup, 0.15, 0.48, 0); ctable.add(cup);
    k.at(ctable, -5.4, 0, -3.2); api.add(ctable);
    const guest = k.person({ sit: true, top: "#3a3f4a", bottom: "#3a3f4a", tie: "#a8323a", hair: "#2a2a2a", skin: "#c99878", prop: "phone" });
    const shirt = k.box(0.18, 0.3, 0.02, "#ffffff"); k.at(shirt, 0, 0.92, 0.13); guest.add(shirt);
    const brief = k.box(0.45, 0.32, 0.12, "#5a3418"); k.at(brief, -0.7, 0, 0.35); guest.add(brief);
    k.at(guest, -7.9, 0.02, -3.65);
    guest.userData.height = 1.7;
    api.spot("guest", guest, { walkTo: [-7.4, -1.8], height: 1.8 });

    // ---- the lift (exit) on the right
    const LX = 5.2;
    const lift = k.group();
    const surround = k.box(3.2, 4.0, 0.3, GOLD); lift.add(surround);
    const shaft = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.3), k.mat("#2a2420")); shaft.position.set(0, 1.65, 0.16); lift.add(shaft);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 3.2), new THREE.MeshBasicMaterial({ color: "#fff3c4" })); glow.position.set(0, 1.65, 0.17); lift.add(glow);
    const doors = [-1, 1].map(side => {
      const d = k.box(1.2, 3.3, 0.08, "#b8bcc2"); d.position.z = 0.2; lift.add(d);
      const strip = k.box(0.06, 3.3, 0.02, "#8a8e94"); strip.position.set(-side * 0.55, 0, 0.05); d.add(strip); strip.position.y = 0;
      d.userData.side = side; return d;
    });
    const lintel = k.box(3.4, 0.5, 0.4, DARKWOOD); k.at(lintel, 0, 3.4, 0.05); lift.add(lintel);
    const liftSign = k.sign("LIFT", { height: 0.48, bg: DARKWOOD, ink: "#f3d27a" }); liftSign.position.set(0, 3.65, 0.26); lift.add(liftSign);
    const floorInd = k.screen("▲ 4", { width: 0.6, bg: "#111", ink: "#ff7a3a", px: 40 }); floorInd.position.set(0, 4.35, 0.17); lift.add(floorInd);
    const btnPlate = k.box(0.25, 0.5, 0.05, GOLD); k.at(btnPlate, 1.95, 1.1, 0.1); lift.add(btnPlate);
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 10), new THREE.MeshBasicMaterial({ color: "#ff4a3a" }));
    btn.rotation.x = Math.PI / 2; btn.position.set(1.95, 1.35, 0.15); lift.add(btn);
    const spark = k.emoji("✨", 0.9); spark.position.set(0, 2.2, 0.8); lift.add(spark);
    const light = new THREE.PointLight("#ffe9a8", 0, 9); light.position.set(0, 2.2, 1.4); lift.add(light);
    const closedPlate = k.sign("CLOSED", { height: 0.36, bg: "#fffaf0", ink: "#a8323a" }); closedPlate.position.set(0, 1.9, 0.27); lift.add(closedPlate);
    k.at(lift, LX, 0, -6.05);
    api.spot("lift", lift, { walkTo: [LX, -3.3], height: 3.0 });
    api.liftDoors = doors; api.liftGlow = [glow, spark]; api.liftLight = light; api.liftClosed = [closedPlate]; api.liftBtn = btn;

    // ---- porter with a luggage trolley (right)
    const porter = k.person({ top: "#b8262b", bottom: "#1d1d22", hat: "cap", hatColor: "#b8262b", hair: "#3a2618", skin: "#d8a070" });
    [1.05, 1.2, 1.35].forEach(y => { const b = k.sphere(0.025, GOLD, 5); b.position.set(0, y, 0.135); porter.add(b); });
    const band = k.box(0.42, 0.04, 0.42, GOLD); k.at(band, 0, 1.79, 0); porter.add(band);
    [-1, 1].forEach(s => { const ep = k.box(0.15, 0.04, 0.16, GOLD); k.at(ep, s * 0.3, 1.38, 0); porter.add(ep); });
    k.at(porter, 9.2, 0, -2.6); porter.rotation.y = -0.25;
    api.spot("porter", porter, { walkTo: [9.0, -1.0], height: 2.0 });
    const trolley = k.group();
    const base = k.box(1.4, 0.1, 0.8, "#8e2430"); k.at(base, 0, 0.25, 0); trolley.add(base);
    [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]].forEach(([x, z]) => { const w = k.sphere(0.1, "#222", 6); w.position.set(x, 0.1, z); trolley.add(w); });
    [-0.65, 0.65].forEach(x => { const p = k.cylinder(0.035, 0.035, 2.0, GOLD, 6); k.at(p, x, 0.3, 0); trolley.add(p); });
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.04, 6, 14, Math.PI), k.mat(GOLD)); arch.position.set(0, 2.3, 0); trolley.add(arch);
    const s1 = k.suitcase("#2e86de", 1.3); k.at(s1, -0.3, 0.3, 0); trolley.add(s1);
    const s2 = k.suitcase("#e67e22", 1.1); k.at(s2, 0.32, 0.3, 0.05); trolley.add(s2);
    const s3 = k.box(0.9, 0.3, 0.5, "#6a3a7a"); k.at(s3, 0, 1.3, 0); trolley.add(s3);
    const hbox = k.box(0.4, 0.3, 0.35, "#f4e0b0"); k.at(hbox, 0.05, 1.6, 0); trolley.add(hbox);
    k.at(trolley, 7.6, 0, -2.9); api.add(trolley);

    // ---- decoration: plants, lamps, armchair, paintings, chandeliers
    [[-12, -5.3], [3.2, -5.4], [7.2, -5.4], [12, -4.5]].forEach(([x, z]) => { const p = k.plant({ scale: 1.3, pot: GOLD, color: "#3d7a42" }); k.at(p, x, 0, z); api.add(p); });
    [[-11.5, 1.5], [11.6, 1.5]].forEach(([x, z]) => { const p = k.plant({ scale: 1.1, pot: "#f4f0e8" }); k.at(p, x, 0, z); api.add(p); });
    // floor lamps with warm shades
    [[-9.9, -3.8], [11.2, -2.4]].forEach(([x, z]) => {
      const l = k.group(k.cylinder(0.04, 0.05, 1.7, GOLD, 6));
      const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.38, 0.45, 10, 1, true), new THREE.MeshBasicMaterial({ color: "#ffe2a8", side: THREE.DoubleSide })); shade.position.y = 1.8; l.add(shade);
      const foot = k.cylinder(0.25, 0.25, 0.05, GOLD, 10); l.add(foot);
      k.at(l, x, 0, z); api.add(l);
    });
    // wall sconces
    [-6, 1.8, 8.4].forEach(x => {
      const sc = k.sphere(0.18, "#fff3c4", 8); sc.material = new THREE.MeshBasicMaterial({ color: "#ffeab0" }); sc.position.set(x, 3.6, -5.95); api.add(sc);
      const cup2 = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.25, 8), k.mat(GOLD)); cup2.rotation.x = Math.PI; cup2.position.set(x, 3.45, -5.95); api.add(cup2);
    });
    // paintings in gold frames
    [[10.3, 3.6, "#5a8ab0", "#e8c060"]].forEach(([x, y, a, b]) => {
      const fr = k.box(1.6, 1.2, 0.08, GOLD); k.at(fr, x, y - 0.6, -6.08); api.add(fr);
      const cv = k.box(1.35, 0.95, 0.04, a); k.at(cv, x, y - 0.475, -6.02); api.add(cv);
      const hill = k.sphere(0.5, b, 6); hill.scale.set(1.2, 0.5, 0.1); hill.position.set(x + 0.2, y - 0.3, -5.99); api.add(hill);
    });
    // chandeliers hanging from above
    api.chandeliers = [];
    [-2.5, 5.2].forEach(x => {
      const ch = k.group();
      const chain = k.cylinder(0.02, 0.02, 3, GOLD, 4); chain.position.y = 1.5 + 0.5; ch.add(chain);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.05, 6, 16), k.mat(GOLD)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.3; ch.add(ring);
      const hub = k.sphere(0.18, GOLD, 8); hub.position.y = 0.35; ch.add(hub);
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2, bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: "#fff1c0" }));
        bulb.position.set(Math.cos(a) * 0.6, 0.45, Math.sin(a) * 0.6); ch.add(bulb);
      }
      const drop = new THREE.Mesh(new THREE.OctahedronGeometry(0.15), new THREE.MeshLambertMaterial({ color: "#e8f4ff", flatShading: true })); drop.position.y = 0.05; ch.add(drop);
      ch.traverse(o => { o.castShadow = false; });
      k.at(ch, x, 6.1, -4.6); api.add(ch); api.chandeliers.push(ch);
    });
    const warm = new THREE.PointLight("#ffdca0", 3, 14); warm.position.set(-2.5, 5.5, -3); api.add(warm);
    // armchair on the right front
    const armch = k.group(k.box(1.0, 0.45, 0.9, "#8e2430")); const ab = k.box(1.0, 0.6, 0.2, "#8e2430"); k.at(ab, 0, 0.45, -0.35); armch.add(ab);
    [-0.5, 0.5].forEach(x => { const a2 = k.box(0.15, 0.65, 0.9, "#6e1c26"); k.at(a2, x, 0, 0); armch.add(a2); });
    k.at(armch, 11.5, 0, -0.3, -0.9); api.add(armch);
    // a couple of guests in the background, checking in
    const bg1 = k.person({ top: "#7a9a5a", bottom: "#4a4a5a", hair: "#c89a5a", hairStyle: "long", prop: "suitcase", propColor: "#4a6a9a", scale: 0.95 });
    k.at(bg1, -10.6, 0, -4.6, 0.5); api.add(bg1);
  },

  update(api, st) {
    const open = !!st.open;
    if (api.keyCard) api.keyCard.visible = !st.has("tookKey");
    (api.liftDoors || []).forEach(d => { d.position.x = d.userData.side * (open ? 1.45 : 0.61); d.scale.x = open ? 0.25 : 1; });
    (api.liftGlow || []).forEach(o => { o.visible = open; });
    (api.liftClosed || []).forEach(o => { o.visible = !open; });
    if (api.liftLight) api.liftLight.intensity = open ? 6 : 0;
    if (api.liftBtn) api.liftBtn.material.color.set(open ? "#4ae06a" : "#ff4a3a");
  },

  tick(api, t) {
    if (api.liftLight && api.liftLight.intensity > 0) api.liftLight.intensity = 5 + Math.sin(t * 2) * 1.2;
    (api.chandeliers || []).forEach((c, i) => { c.rotation.y = Math.sin(t * 0.5 + i) * 0.15; });
  },
};
