// Airport: the bright arrivals hall — passport booth, flight screen, three baggage belts, an info desk and glass exit doors.
// Spot ids (must match content.js): officer, board, speaker, belt1, belt2, belt3, info, exit
export default {
  sky: { top: "#7fc1ff", bottom: "#d8ecff" },
  groundColor: "#9aa3ad",
  light: { sky: "#ffffff", ground: "#8a96a6", hemi: 1.35, sun: "#ffffff", sunIntensity: 1.3, sunPos: [5, 16, 9] },
  bounds: { minX: -11, maxX: 11.5, minZ: -3.5, maxZ: 5 },
  camera: [0, 5.5, 10],

  build(k, api) {
    const { THREE } = api;
    api.spawn = [-8, 3];
    const WHITE = "#f4f6f8", GREY = "#c9d0d8", DARK = "#5b6673", BLUE = "#2f7fd8", NAVY = "#1d3f75";
    const glassMat = new THREE.MeshLambertMaterial({ color: "#bfe3ff", transparent: true, opacity: 0.28, depthWrite: false });
    const glass = (w, h, t = 0.04) => new THREE.Mesh(new THREE.BoxGeometry(w, h, t), glassMat);
    const plain = (o) => { o.traverse(m => { m.castShadow = false; }); return o; };

    // ---- floor: light tiles with a blue walkway stripe
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(27, 24), k.mat("#e3e7ec"));
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.005, 5); floor.receiveShadow = true; api.add(floor);
    for (let i = 0; i < 9; i++) { const t = k.box(2.6, 0.012, 24, i % 2 ? "#d8dde3" : "#e9edf1"); k.at(t, -10.4 + i * 2.6, 0, 5); t.castShadow = false; api.add(t); }
    const stripe = k.box(26, 0.02, 0.35, BLUE); k.at(stripe, 0, 0, 1.4); stripe.castShadow = false; api.add(stripe);

    // ---- back wall at z = -7 with big windows (and a door bay at the exit)
    const WZ = -7, EX = 11.0;
    const low = k.box(22.9, 0.7, 0.3, GREY); k.at(low, -2.05, 0, WZ); api.add(low);
    const low2 = k.box(0.9, 0.7, 0.3, GREY); k.at(low2, 13.05, 0, WZ); api.add(low2);
    const top = k.box(27, 3.6, 0.3, WHITE); k.at(top, 0, 4.6, WZ); api.add(top);
    const band = k.box(27, 0.35, 0.34, BLUE); k.at(band, 0, 4.6, WZ + 0.02); api.add(band);
    for (let x = -13; x <= 13.01; x += 2.6) { if (Math.abs(x - EX) < 1.4) continue; const m = k.box(0.18, 3.9, 0.32, "#9aa5b2"); k.at(m, x, 0.7, WZ); api.add(m); }
    const pane = glass(22.9, 3.9); k.at(pane, -2.05, 2.65, WZ); api.add(pane);
    const pane2 = glass(0.9, 3.9); k.at(pane2, 13.05, 2.65, WZ); api.add(pane2);
    // side walls (short, only behind the play area)
    [-13.3, 13.3].forEach(x => { const s = k.box(0.3, 8.2, 12, WHITE); k.at(s, x, 0, -1); api.add(s); const b = k.box(0.34, 0.35, 12, BLUE); k.at(b, x, 4.6, -1); api.add(b); });
    const welcome = k.sign("WELCOME · ARRIVALS", { height: 0.7, bg: BLUE, ink: "#ffffff", font: "Figtree, Arial, sans-serif" });
    k.at(welcome, -1.5, 6.3, WZ + 0.17); api.add(welcome);

    // ---- outside the windows: tarmac, a plane, a tower
    const apron = k.box(80, 0.02, 30, "#8d969f"); k.at(apron, 0, 0, -22); apron.castShadow = false; api.add(apron);
    for (let i = 0; i < 8; i++) { const l = k.box(2, 0.03, 0.2, "#f2d23a"); k.at(l, -14 + i * 4, 0, -12); api.add(l); }
    const plane = new THREE.Group();
    const fus = k.cylinder(1.3, 1.3, 20, "#ffffff", 14); fus.rotation.z = Math.PI / 2; fus.position.set(0, 2.6, 0); plane.add(fus);
    const nose = k.sphere(1.3, "#ffffff", 12); nose.scale.set(1.6, 1, 1); nose.position.set(10, 2.6, 0); plane.add(nose);
    const tailc = k.cone(1.3, 4, "#ffffff", 12); tailc.rotation.z = Math.PI / 2; tailc.position.set(-12, 2.8, 0); plane.add(tailc);
    const fin = k.box(3, 3.6, 0.25, BLUE); fin.position.set(-12, 3.6 + 1.8, 0); fin.rotation.z = -0.35; plane.add(fin);
    const wing = k.box(4, 0.25, 18, "#e6ebf0"); wing.position.set(-1, 1.9, 0); wing.rotation.y = 0.0; plane.add(wing);
    const stab = k.box(1.8, 0.2, 6, "#e6ebf0"); stab.position.set(-12, 3, 0); plane.add(stab);
    const pstripe = k.box(20, 0.3, 2.66, BLUE); pstripe.position.set(0, 2.2, 0); plane.add(pstripe);
    for (let i = 0; i < 12; i++) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.05), k.mat("#1e2c3a")); w.position.set(-7 + i * 1.3, 3.0, 1.29); plane.add(w); }
    [[-3, 4], [-3, -4]].forEach(([x, z]) => { const e = k.cylinder(0.6, 0.6, 2.2, "#cfd6de", 10); e.rotation.z = Math.PI / 2; e.position.set(x + 0.5, 1.2, z); plane.add(e); });
    [6, -2].forEach(x => { const g = k.cylinder(0.08, 0.08, 1.4, "#333", 6); g.position.set(x, 0, 0); plane.add(g); });
    k.at(plane, 2, 0, -20); plane.rotation.y = 0.15; plain(plane); api.add(plane);
    const tower = k.cylinder(0.8, 1.1, 12, "#dfe4ea", 8); k.at(tower, -14, 0, -32); api.add(plain(tower));
    const cab = k.cylinder(2, 1.4, 1.6, "#2b4a6b", 8); k.at(cab, -14, 12, -32); api.add(plain(cab));

    // ---- passport control booth (left, near spawn)
    const booth = new THREE.Group();
    const counter = k.box(2.6, 1.1, 0.8, WHITE); counter.position.z = 0.5; booth.add(counter);
    const ctop = k.box(2.8, 0.08, 1.0, NAVY); k.at(ctop, 0, 1.1, 0.5); booth.add(ctop);
    const cstripe = k.box(2.62, 0.18, 0.82, BLUE); k.at(cstripe, 0, 0.75, 0.5); booth.add(cstripe);
    [-1.35, 1.35].forEach(x => { const p = k.box(0.1, 2.9, 2.0, "#9aa5b2"); k.at(p, x, 0, -0.2); p.scale.x = 1; booth.add(p); });
    const gl = glass(2.6, 1.7); k.at(gl, 0, 2.05, 0.85); booth.add(gl);
    const roof = k.box(3.0, 0.25, 2.3, NAVY); k.at(roof, 0, 2.9, -0.2); booth.add(roof);
    const ppSign = k.sign("PASSPORT CONTROL", { height: 0.42, bg: NAVY, ink: "#ffffff", font: "Figtree, Arial, sans-serif" });
    k.at(ppSign, 0, 3.45, 0.2); booth.add(ppSign);
    const stamp = k.emoji("🛂", 0.5); k.at(stamp, 1.0, 1.4, 0.6); booth.add(stamp);
    k.at(booth, -9.3, 0, -2.6); api.add(booth);
    const officer = k.person({ top: NAVY, bottom: "#1a2438", hat: "police", tie: "#c0392b", hair: "#2a1a10", skin: "#c98f62" });
    k.at(officer, -9.3, 0, -3.2);
    api.spot("officer", officer, { walkTo: [-9.3, -1.0], height: 2.2 });
    // queue barrier posts in front of the booth
    [-11, -10, -7.6, -6.6].forEach(x => { const p = k.cylinder(0.05, 0.05, 1, "#8b95a1", 6); k.at(p, x, 0, -0.8); api.add(p); const b = k.cylinder(0.2, 0.2, 0.05, "#8b95a1", 8); k.at(b, x, 0, -0.8); api.add(b); });
    [[-10.5], [-7.1]].forEach(([x]) => { const t = k.box(1, 0.08, 0.04, BLUE); k.at(t, x, 0.9, -0.8); api.add(t); });

    // ---- arrivals screen on the wall
    const board = new THREE.Group();
    const frame = k.box(3.6, 1.9, 0.18, "#2a3038"); board.add(frame);
    const scr = k.screen("ARRIVALS\nFLIGHT 205 FROM BAKU\nLANDED", { width: 3.3, px: 48 });
    k.at(scr, 0, 0.95, 0.1); board.add(scr);
    [-1.4, 1.4].forEach(x => { const r = k.box(0.08, 1.2, 0.08, "#8b95a1"); k.at(r, x, 1.85, 0); board.add(r); });
    k.at(board, -3.0, 2.9, -6.6);
    api.spot("board", board, { walkTo: [-3.0, -3.2], height: 4.4 });

    // ---- loudspeaker on a pole
    const spk = new THREE.Group();
    const pole = k.cylinder(0.07, 0.09, 3.2, "#8b95a1", 8); spk.add(pole);
    const base = k.cylinder(0.3, 0.35, 0.08, "#8b95a1", 10); spk.add(base);
    const boxS = k.box(0.6, 0.75, 0.45, "#3a4250"); k.at(boxS, 0, 3.0, 0.05); spk.add(boxS);
    const grille = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 14), k.mat("#1a1e24")); grille.rotation.x = Math.PI / 2; k.at(grille, 0, 3.45, 0.29); spk.add(grille);
    const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 10), k.mat("#1a1e24")); tw.rotation.x = Math.PI / 2; k.at(tw, 0, 3.12, 0.29); spk.add(tw);
    const icon = k.emoji("🔊", 0.6); k.at(icon, 0, 4.1, 0.1); spk.add(icon);
    k.at(spk, -6.2, 0, -2.8);
    api.spot("speaker", spk, { walkTo: [-6.0, -1.5], height: 4.2 });

    // ---- three baggage belts
    const caseCols = ["#2e86de", "#27ae60", "#8e44ad", "#34495e", "#e67e22", "#16a085", "#7f8c8d"];
    function belt(n, flight, x, cases) {
      const g = new THREE.Group();
      const body = k.box(2.8, 0.42, 1.5, "#7d8894"); g.add(body);
      const rub = k.box(2.9, 0.06, 1.6, "#2a2e34"); k.at(rub, 0, 0.42, 0); g.add(rub);
      const isl = k.box(2.1, 0.12, 0.7, "#c4ccd5"); k.at(isl, 0, 0.48, 0); g.add(isl);
      for (let i = 0; i < 8; i++) { const sl = k.box(0.03, 0.01, 1.58, "#444b54"); k.at(sl, -1.3 + i * 0.37, 0.48, 0); sl.castShadow = false; g.add(sl); }
      cases.forEach(([cx, cz, c, rot]) => { const s = k.suitcase(c, 0.75); k.at(s, cx, 0.45, cz, rot || 0); g.add(s); });
      [-1.2, 1.2].forEach(px => { const p = k.box(0.08, 2.3, 0.08, "#8b95a1"); k.at(p, px, 0, -0.85); g.add(p); });
      const sg = k.sign(`BELT ${n} · FLIGHT ${flight}`, { height: 0.34, bg: n === 3 ? BLUE : NAVY, ink: "#ffffff", font: "Figtree, Arial, sans-serif" });
      k.at(sg, 0, 2.5, -0.8); g.add(sg);
      const num = k.sign(String(n), { height: 0.5, bg: "#ffcc4d", ink: "#1a1e24", font: "Figtree, Arial, sans-serif" });
      k.at(num, 0, 0.21, 0.76); g.add(num);
      k.at(g, x, 0, -3.3);
      g.userData.height = 2.8;
      return g;
    }
    const b1 = belt(1, 118, -1.2, [[-0.9, 0.5, caseCols[0], 0.3], [0.6, -0.5, caseCols[1], 1.6]]);
    api.spot("belt1", b1, { walkTo: [-1.2, -1.5], height: 2.9 });
    const b2 = belt(2, 340, 2.2, [[-0.8, -0.5, caseCols[2], 1.2], [0.3, 0.5, caseCols[3], 0.1], [1.0, -0.5, caseCols[4], 1.5]]);
    api.spot("belt2", b2, { walkTo: [2.2, -1.5], height: 2.9 });
    const b3 = belt(3, 205, 5.6, [[-1.0, 0.5, caseCols[5], 0.2], [0.9, -0.5, caseCols[6], 1.4]]);
    // the traveler's own case: big, red, with a yellow ribbon and a tag
    const red = new THREE.Group();
    const rc = k.suitcase("#d62f2f", 1.05); red.add(rc);
    const rib = k.box(0.48, 0.07, 0.28, "#ffd23f"); k.at(rib, 0, 0.36, 0); red.add(rib);
    const tag = k.box(0.12, 0.16, 0.02, "#ffffff"); k.at(tag, 0.12, 0.72, 0.14); red.add(tag);
    const star = k.emoji("⭐", 0.25); k.at(star, 0, 1.15, 0.1); red.add(star);
    k.at(red, 0.1, 0.45, 0.45); b3.add(red);
    api.redCase = red;
    api.spot("belt3", b3, { walkTo: [5.6, -1.5], height: 2.9 });

    // ---- information desk
    const desk = new THREE.Group();
    const d1 = k.box(2.2, 1.05, 0.8, WHITE); desk.add(d1);
    const d2 = k.box(2.3, 0.08, 0.95, "#e8d6b4"); k.at(d2, 0, 1.05, 0); desk.add(d2);
    const d3 = k.box(2.22, 0.3, 0.82, BLUE); k.at(d3, 0, 0.35, 0); desk.add(d3);
    const ipost = k.box(0.1, 2.4, 0.1, "#8b95a1"); k.at(ipost, -0.9, 0, -1.0); desk.add(ipost);
    const ipost2 = ipost.clone(); ipost2.position.x = 0.9; desk.add(ipost2);
    const isg = k.sign("INFORMATION", { height: 0.42, bg: "#ffcc4d", ink: "#1a1e24", font: "Figtree, Arial, sans-serif" });
    k.at(isg, 0.2, 2.15, -0.95); desk.add(isg);
    const iem = k.emoji("ℹ️", 0.6); k.at(iem, 0.2, 2.75, -0.9); desk.add(iem);
    const mon = k.box(0.5, 0.35, 0.05, "#222"); k.at(mon, 0.6, 1.1, -0.2); desk.add(mon);
    const leaflets = k.box(0.35, 0.05, 0.25, "#ff8a5c"); k.at(leaflets, -0.6, 1.1, 0.15); desk.add(leaflets);
    k.at(desk, 8.4, 0, -1.8); api.add(desk);
    const info = k.person({ top: "#18a99a", bottom: "#2b2f3a", hair: "#7a4a22", hairStyle: "long", skirt: true, skin: "#f0c39a", tie: "#ffcc4d" });
    k.at(info, 8.4, 0, -2.7);
    api.spot("info", info, { walkTo: [8.4, -0.4], height: 2.2 });

    // ---- exit: glass sliding doors in the window wall (right)
    const exit = new THREE.Group();
    const fr = k.box(3.2, 0.4, 0.4, "#9aa5b2"); k.at(fr, 0, 3.1, 0); exit.add(fr);
    [-1.6, 1.6].forEach(x => { const p = k.box(0.2, 3.1, 0.4, "#9aa5b2"); k.at(p, x, 0, 0); exit.add(p); });
    const esg = k.sign("EXIT · TAXI · BUS", { height: 0.45, bg: "#1f9d55", ink: "#ffffff", font: "Figtree, Arial, sans-serif" });
    k.at(esg, 0, 3.85, 0.25); exit.add(esg);
    const day = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.1), new THREE.MeshBasicMaterial({ color: "#fff6d0" }));
    k.at(day, 0, 1.55, -0.25); exit.add(day);
    const doorMat = new THREE.MeshLambertMaterial({ color: "#9fd4ff", transparent: true, opacity: 0.55 });
    const doors = [-0.75, 0.75].map(x => {
      const d = new THREE.Group();
      const pnl = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.0, 0.06), doorMat); pnl.position.y = 1.5; d.add(pnl);
      const edge = k.box(1.5, 0.1, 0.08, "#7d8894"); d.add(edge);
      const handle = k.box(0.06, 0.6, 0.1, "#5b6673"); k.at(handle, -Math.sign(x) * 0.6, 1.1, 0.06); d.add(handle);
      d.position.x = x; d.userData.homeX = x; exit.add(d); return d;
    });
    const closed = k.sign("CLOSED", { height: 0.3, bg: "#d63031", ink: "#ffffff", font: "Figtree, Arial, sans-serif" });
    k.at(closed, 0, 1.7, 0.1); exit.add(closed);
    const redLamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: "#ff3b30" }));
    k.at(redLamp, 1.25, 3.1, 0.25); exit.add(redLamp);
    const spark = k.emoji("✨", 0.9); k.at(spark, 0, 2.2, 0.4); exit.add(spark);
    const light = new THREE.PointLight("#fff1c0", 0, 10); k.at(light, 0, 2.2, 1.5); exit.add(light);
    const mat = k.box(3, 0.02, 1.4, "#3a4250"); k.at(mat, 0, 0, 0.9); mat.castShadow = false; exit.add(mat);
    k.at(exit, EX, 0, WZ + 0.05);
    api.spot("exit", exit, { walkTo: [EX, -3.4], height: 4.3 });
    api.exitDoors = doors; api.exitClosed = [closed, redLamp]; api.exitOpen = [day, spark]; api.exitLight = light;
    api.exitDoorT = 0;

    // ---- decoration: plants, benches, waiting people, a trolley
    [[-12.2, -5.8], [-2.2, -6.2], [12.6, -4.6], [3.9, -6.2]].forEach(([x, z]) => { const p = k.plant({ scale: 1.1 }); k.at(p, x, 0, z); api.add(p); });
    const bn = k.bench({ width: 2.4, color: "#5b6673" }); k.at(bn, 1.2, 0, -5.9); api.add(bn);
    const bn2 = k.bench({ width: 2.4, color: "#5b6673" }); k.at(bn2, 5.2 + 2.6, 0, -5.9); api.add(bn2);
    const sitter = k.person({ sit: true, top: "#e67e22", bottom: "#34495e", hair: "#111", prop: "phone" }); k.at(sitter, 0.7, 0, -6.0); api.add(sitter);
    const waiter = k.person({ top: "#8e44ad", bottom: "#2b2f3a", hair: "#c9a26b", hairStyle: "bun", prop: "suitcase", propColor: "#16a085" });
    k.at(waiter, 3.9, 0, -1.7, -0.3); api.add(waiter);
    const kid = k.person({ scale: 0.65, top: "#f1c40f", bottom: "#2e86de", hair: "#3a2618", prop: "backpack", propColor: "#e84393" });
    k.at(kid, 4.4, 0, -1.3, -0.5); api.add(kid);
    const trolley = new THREE.Group();
    const tb = k.box(0.9, 0.06, 0.6, "#8b95a1"); k.at(tb, 0, 0.35, 0); trolley.add(tb);
    const th = k.box(0.06, 1.0, 0.6, "#8b95a1"); k.at(th, -0.45, 0.35, 0); trolley.add(th);
    const tc = k.suitcase("#f39c12", 0.8); k.at(tc, 0.1, 0.38, 0); trolley.add(tc);
    k.at(trolley, -2.6, 0, -1.2, -0.3); api.add(trolley);
  },

  update(api, st) {
    const open = !!st.open;
    if (api.redCase) api.redCase.visible = !st.has("gotLuggage");
    api.exitClosed.forEach(o => { o.visible = !open; });
    api.exitOpen.forEach(o => { o.visible = open; });
    api.exitLight.intensity = open ? 6 : 0;
    api.exitWant = open ? 1 : 0;
    if (api.exitDoorT === 0 && open && !api.exitSeen) api.exitDoorT = 1; // opened at load: no slide needed
    api.exitSeen = true;
    api.exitDoors.forEach(d => { d.position.x = d.userData.homeX * (1 + 1.6 * api.exitDoorT); });
  },

  tick(api, t, dt) {
    if (api.exitWant === undefined) return;
    const want = api.exitWant;
    if (api.exitDoorT !== want) {
      api.exitDoorT += Math.sign(want - api.exitDoorT) * Math.min(Math.abs(want - api.exitDoorT), dt * 1.2);
      api.exitDoors.forEach(d => { d.position.x = d.userData.homeX * (1 + 1.6 * api.exitDoorT); });
    }
    if (api.exitLight.intensity > 0) api.exitLight.intensity = 5 + Math.sin(t * 2) * 1.2;
  },
};
