// Market: a bright covered food market / small supermarket with stalls, shelves and a checkout.
// Spot ids (must match content.js): list, fruitseller, apples, bread, cheese, cashier, exit
const FONT = "Figtree, Arial, sans-serif";

export default {
  sky: { top: "#f3e9d8", bottom: "#f7f1e6" },
  fog: { color: "#f3ead9", near: 26, far: 60 },
  groundColor: "#d8cdb8",
  light: { sky: "#fffaf0", ground: "#8a7a64", hemi: 1.2, sun: "#fff4dc", sunIntensity: 1.4, sunPos: [-6, 16, 10] },
  bounds: { minX: -11, maxX: 11, minZ: -1.2, maxZ: 5 },
  camera: [0, 5.5, 10],

  build(k, api) {
    const { THREE } = api;
    api.spawn = [-8, 3.2];
    const sg = (t, o = {}) => k.sign(t, { font: FONT, ...o });

    // ---- the hall: cream walls, chequered tiled floor, green beams
    const room = k.room({ w: 28, d: 13, h: 6.5, wall: "#fbf3e2", floor: "#e9e1d0" });
    k.at(room, 0, 0, 0); api.add(room);
    for (let x = -12; x <= 12; x += 2) for (let z = -5; z <= 5; z += 2) {
      if (((x + z) / 2) % 2 === 0) continue;
      const t = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), k.mat("#d9cfbb")); t.rotation.x = -Math.PI / 2;
      t.position.set(x, 0.01, z); t.receiveShadow = true; api.add(t);
    }
    // lower wall band + green roof beams (market hall)
    const band = k.box(28, 1.2, 0.1, "#2f8f6a"); k.at(band, 0, 0, -6.3); api.add(band);
    const beam = k.box(28, 0.4, 0.5, "#2f6f58"); k.at(beam, 0, 6.3, -6.2); api.add(beam);
    [-10, -3.5, 3.5].forEach(x => { const c = k.box(0.4, 6.5, 0.4, "#2f6f58"); k.at(c, x, 0, -6.0); api.add(c); });
    // big hall name
    const title = sg("FRESH MARKET", { height: 0.8, bg: "#2f8f6a", ink: "#ffffff" }); k.at(title, -0.5, 5.4, -6.1); api.add(title);
    // high windows
    [-7, 0, 6].forEach(x => {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.2), new THREE.MeshBasicMaterial({ color: "#bfe6f5" }));
      k.at(w, x, 0, -6.12); w.position.y = 4.0; if (x === 0) w.position.y = 3.95; api.add(w);
    });
    // bunting
    const flagCols = ["#e74c3c", "#f1c40f", "#2ecc71", "#3498db", "#e67e22"];
    for (let i = 0; i < 18; i++) {
      const f = k.cone(0.2, 0.4, flagCols[i % 5], 3); f.rotation.x = Math.PI; f.scale.z = 0.25; f.castShadow = false;
      const fx = -12 + i * 1.4; if (fx > -3.6 && fx < 2.6) continue; k.at(f, fx, 4.9, -5.9); api.add(f);
    }

    // ---- helpers
    function awning(cols, w = 3.2, d = 1.4) {
      const g = new THREE.Group(), n = 8, sw = w / n;
      for (let i = 0; i < n; i++) {
        const s = k.box(sw, 0.06, d, cols[i % 2]); k.at(s, -w / 2 + sw / 2 + i * sw, 0, 0); g.add(s);
        const v = k.box(sw * 0.92, 0.2, 0.04, cols[i % 2]); k.at(v, -w / 2 + sw / 2 + i * sw, -0.2, d / 2); g.add(v);
      }
      g.rotation.x = 0.2; return g;
    }
    const tag = (txt, col = "#fff8c8") => sg(txt, { height: 0.16, bg: col, ink: "#c0392b" });

    // ---- LIST: Leyla's message on a smartphone, on a little stand near the entrance
    const phoneSt = k.group();
    const pole = k.cylinder(0.05, 0.05, 1.0, "#555e66", 6); phoneSt.add(pole);
    const foot = k.cylinder(0.3, 0.3, 0.05, "#555e66", 10); phoneSt.add(foot);
    const tray = k.box(0.6, 0.05, 0.4, "#555e66"); k.at(tray, 0, 1.0, 0); tray.rotation.x = -0.5; phoneSt.add(tray);
    const ph = k.box(0.3, 0.04, 0.5, "#1b1f24"); k.at(ph, 0, 1.06, 0.02); ph.rotation.x = 1.0; phoneSt.add(ph);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.42), new THREE.MeshBasicMaterial({ color: "#7fd3ff" }));
    k.at(scr, 0, 1.08, 0.05); scr.rotation.x = -0.57; phoneSt.add(scr);
    const bubble = k.emoji("💬", 0.45); k.at(bubble, 0.35, 1.55, 0); phoneSt.add(bubble);
    const mplate = sg("MESSAGE FROM LEYLA", { height: 0.34, bg: "#ffffff", ink: "#2f6f58" }); k.at(mplate, 0, 1.95, 0); phoneSt.add(mplate);
    k.at(phoneSt, -9.6, 0, 0.6);
    phoneSt.userData.height = 2.1;
    api.spot("list", phoneSt, { walkTo: [-9.2, 1.9], height: 2.2 });
    // baskets by the entrance
    [[-10.8, 1.6], [-10.8, 2.2]].forEach(([x, z], i) => { const b = k.box(0.6, 0.35, 0.4, i ? "#e74c3c" : "#2ecc71"); k.at(b, x, i * 0.35, 1.9); api.add(b); });
    const trolley = k.group(k.box(0.8, 0.5, 0.5, "#9aa3ab"), k.box(0.05, 0.6, 0.05, "#666"));
    trolley.children[0].position.y = 0.45; trolley.children[1].position.set(-0.4, 0.7, 0);
    k.at(trolley, -10.9, 0, 3.6); api.add(trolley);

    // ---- FRUIT STALL with the fruit seller behind it
    const fs = k.group();
    const ctr = k.box(3.0, 0.95, 0.9, "#a0683a"); ctr.position.z = -0.45; fs.add(ctr);
    const ctop = k.box(3.2, 0.08, 1.05, "#7a4a2a"); k.at(ctop, 0, 0.95, -0.45); fs.add(ctop);
    [[-1.6, 0], [1.6, 0], [-1.6, -1.9], [1.6, -1.9]].forEach(([x, z]) => { const p = k.box(0.1, 3.0, 0.1, "#5a3a22"); k.at(p, x, 0, z); fs.add(p); });
    const aw = awning(["#e74c3c", "#ffffff"]); k.at(aw, 0, 3.0, -0.9); fs.add(aw);
    [["🍊", -1.0], ["🍌", -0.35], ["🍐", 0.35], ["🍇", 1.0]].forEach(([ch, x]) => { const e = k.emoji(ch, 0.5); k.at(e, x, 1.25, -0.45); fs.add(e); });
    const ftag = sg("FRUIT & VEG", { height: 0.3, bg: "#ffffff", ink: "#c0392b" }); k.at(ftag, 0, 0.55, 0.01); fs.add(ftag);
    k.at(fs, -5, 0, -2.2); api.add(fs);
    const fruitseller = k.person({ top: "#3aa655", bottom: "#2b2f3a", vest: "#f5f0e6", hat: "cap", hatColor: "#e74c3c", hair: "#5a3a22", skin: "#c98d5e" });
    k.at(fruitseller, -5.2, 0, -3.5);
    api.spot("fruitseller", fruitseller, { walkTo: [-5.6, -0.6], height: 2.0 });
    // veg crates in front-left of the stall
    [[-7.2, "🥕"], [-6.4, "🥦"]].forEach(([x, ch]) => {
      const c = k.box(0.7, 0.45, 0.55, "#b8834e"); k.at(c, x, 0, -1.6); api.add(c);
      const e = k.emoji(ch, 0.45); k.at(e, x, 0.65, -1.6); api.add(e);
    });

    // ---- APPLES: a stepped crate display piled with red apples
    const ap = k.group();
    const cr1 = k.box(1.4, 0.5, 0.8, "#b8834e"); ap.add(cr1);
    const cr2 = k.box(1.4, 0.5, 0.6, "#a87443"); k.at(cr2, 0, 0.5, -0.3); ap.add(cr2);
    for (let i = 0; i < 8; i++) {
      const a = k.sphere(0.13, i % 3 ? "#d63031" : "#c0392b", 7);
      a.position.set(-0.5 + (i % 4) * 0.33, i < 4 ? 0.58 : 1.08, i < 4 ? 0.2 : -0.3); a.castShadow = false; ap.add(a);
    }
    const ae = k.emoji("🍎", 0.55); k.at(ae, 0, 1.55, -0.2); ap.add(ae);
    const asg = sg("APPLES · €2 A KILO", { height: 0.3, bg: "#fff8c8", ink: "#c0392b" }); k.at(asg, 0, 2.05, -0.2); ap.add(asg);
    const apSign = tag("€2/kg"); k.at(apSign, 0, 0.25, 0.41); ap.add(apSign);
    k.at(ap, -2.4, 0, -1.6);
    api.spot("apples", ap, { walkTo: [-2.4, -0.2], height: 2.3 });

    // ---- BREAD: a wooden bread shelf against the back wall
    const br = k.group();
    const back = k.box(2.8, 2.6, 0.2, "#c48a52"); k.at(back, 0, 0, -0.45); br.add(back);
    [0.15, 0.95, 1.75].forEach((y, r) => {
      const sh = k.box(2.8, 0.08, 0.7, "#9a6232"); k.at(sh, 0, y, -0.1); br.add(sh);
      const items = r === 1 ? ["🥖", "🥖", "🥖"] : ["🍞", "🥐", "🍞"];
      items.forEach((ch, i) => { const e = k.emoji(ch, 0.55); k.at(e, -0.9 + i * 0.9, y + 0.33, 0); br.add(e); });
    });
    [-1.45, 1.45].forEach(x => { const s = k.box(0.1, 2.6, 0.8, "#9a6232"); k.at(s, x, 0, -0.1); br.add(s); });
    const bsg = sg("BREAD · €1.50 A LOAF", { height: 0.32, bg: "#fff3d6", ink: "#7a3e12" }); k.at(bsg, 0, 2.95, -0.3); br.add(bsg);
    k.at(br, 0.6, 0, -3.6);
    api.spot("bread", br, { walkTo: [0.6, -0.6], height: 3.1 });

    // ---- CHEESE: a glass-fronted chilled counter
    const ch = k.group();
    const base = k.box(2.6, 0.8, 0.9, "#f3f6f8"); ch.add(base);
    const stripe = k.box(2.62, 0.15, 0.92, "#f1c40f"); k.at(stripe, 0, 0.55, 0); ch.add(stripe);
    const deck = k.box(2.5, 0.06, 0.8, "#dfe6ea"); k.at(deck, 0, 0.8, 0); ch.add(deck);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 0.04), new THREE.MeshLambertMaterial({ color: "#cfefff", transparent: true, opacity: 0.35 }));
    glass.position.set(0, 1.1, 0.35); glass.rotation.x = -0.35; ch.add(glass);
    [-0.8, 0, 0.8].forEach((x, i) => {
      const w = k.cylinder(0.28, 0.28, 0.2, i === 1 ? "#f5d76e" : "#f0c24a", 10); k.at(w, x, 0.86, -0.05); ch.add(w);
    });
    const ce = k.emoji("🧀", 0.6); k.at(ce, 0.0, 1.5, -0.1); ch.add(ce);
    const csg = sg("CHEESE · 20% DISCOUNT", { height: 0.32, bg: "#f1c40f", ink: "#5a3a00" }); k.at(csg, 0, 2.05, -0.1); ch.add(csg);
    const star = sg("-20%", { height: 0.22, bg: "#e74c3c", ink: "#ffffff" }); k.at(star, 0.9, 0.3, 0.46); ch.add(star);
    k.at(ch, 3.8, 0, -1.9);
    api.spot("cheese", ch, { walkTo: [3.8, -0.4], height: 2.3 });
    // cheese man decoration (no spot) - a deli worker in white behind the counter
    const deli = k.person({ top: "#ffffff", bottom: "#555", hat: "chef", hair: "#222", skin: "#f0c8a0", scale: 0.95 });
    k.at(deli, 3.6, 0, -3.0); api.add(deli);

    // ---- background shelves with colourful products along the back wall
    function shelf(x, cols) {
      const g = k.group();
      const b = k.box(2.4, 2.2, 0.6, "#e6e8ea"); g.add(b);
      [0.45, 1.1, 1.75].forEach((y, r) => {
        for (let i = 0; i < 6; i++) {
          const p = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.1), k.mat(cols[(i + r) % cols.length]));
          p.position.set(-0.95 + i * 0.38, y, 0.31); g.add(p);
        }
      });
      k.at(g, x, 0, -5.7); g.traverse(o => { o.castShadow = false; }); api.add(g); return g;
    }
    shelf(-8.2, ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71"]);
    shelf(-2.5, ["#9b59b6", "#e67e22", "#1abc9c", "#ecf0f1"]);
    shelf(7.0, ["#3498db", "#e84393", "#fdcb6e", "#00b894"]);
    const aisle = sg("AISLE 3 · DRINKS", { height: 0.3, bg: "#3498db", ink: "#fff" }); k.at(aisle, 7.0, 2.6, -5.4); api.add(aisle);

    // ---- CASHIER at a checkout with a conveyor belt
    const co = k.group();
    const desk = k.box(2.6, 0.9, 0.8, "#2f6f58"); co.add(desk);
    const belt = k.box(2.0, 0.05, 0.55, "#2b2b2b"); k.at(belt, -0.25, 0.9, 0.05); co.add(belt);
    [-0.9, -0.5].forEach((x, i) => { const g = k.box(0.3, 0.25, 0.25, i ? "#f39c12" : "#e74c3c"); k.at(g, x, 0.95, 0.05); co.add(g); });
    const till = k.box(0.45, 0.35, 0.35, "#ecf0f1"); k.at(till, 0.6, 0.9, -0.1); co.add(till);
    const tscr = k.box(0.4, 0.3, 0.05, "#1b1f24"); k.at(tscr, 0.6, 1.25, -0.1); tscr.rotation.x = -0.3; tscr.scale.set(0.8, 0.7, 1); co.add(tscr);
    const lp = k.cylinder(0.03, 0.03, 1.4, "#888", 6); k.at(lp, -1.2, 0.9, 0.2); co.add(lp);
    const num = sg("1", { height: 0.3, bg: "#e74c3c", ink: "#fff" }); k.at(num, -1.2, 2.45, 0.2); co.add(num);
    const coSign = sg("CHECKOUT", { height: 0.36, bg: "#2f8f6a", ink: "#ffffff" }); k.at(coSign, 0.4, 2.7, -0.6); co.add(coSign);
    k.at(co, 6.5, 0, -1.6); api.add(co);
    const cashier = k.person({ top: "#e74c3c", bottom: "#2b2f3a", hairStyle: "bun", hair: "#2a1a10", skin: "#f1c27d", skirt: false });
    const badge = k.box(0.1, 0.07, 0.02, "#ffffff"); k.at(badge, 0.12, 1.22, 0.14); cashier.add(badge);
    k.at(cashier, 8.15, 0, -2.3, -0.35);
    api.spot("cashier", cashier, { walkTo: [7.4, -0.4], height: 2.0 });

    // ---- EXIT: sliding glass doors in the right wall corner
    const ex = k.group();
    const frameCol = "#5d6d7e";
    const fL = k.box(0.25, 3.2, 0.3, frameCol); k.at(fL, -1.55, 0, 0); ex.add(fL);
    const fR = k.box(0.25, 3.2, 0.3, frameCol); k.at(fR, 1.55, 0, 0); ex.add(fR);
    const fT = k.box(3.35, 0.4, 0.3, frameCol); k.at(fT, 0, 3.2, 0); ex.add(fT);
    const outside = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 3.2), new THREE.MeshBasicMaterial({ color: "#b8dff0" }));
    k.at(outside, 0, 1.6, -0.18); ex.add(outside);
    const glowMat = new THREE.MeshBasicMaterial({ color: "#fff3c4" });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 3.2), glowMat); k.at(glow, 0, 1.6, -0.16); glow.visible = false; ex.add(glow);
    const doorMat = new THREE.MeshLambertMaterial({ color: "#9fd4e8", transparent: true, opacity: 0.6 });
    const doors = [-1, 1].map(s => {
      const d = new THREE.Mesh(new THREE.BoxGeometry(1.45, 3.1, 0.06), doorMat); d.position.set(s * 0.73, 1.55, 0.02); ex.add(d);
      const h = k.box(0.05, 0.5, 0.08, "#c0c7ce"); h.position.set(s * 0.1, 1.0, 0.06); d.add(h); h.position.y = 0;
      return d;
    });
    const esg = sg("EXIT", { height: 0.42, bg: "#27ae60", ink: "#ffffff" }); k.at(esg, 0, 3.4, 0.17); ex.add(esg);
    const closed = sg("CLOSED", { height: 0.32, bg: "#e74c3c", ink: "#ffffff" }); k.at(closed, 0, 1.7, 0.1); ex.add(closed);
    const barrier = k.box(2.9, 0.1, 0.08, "#e74c3c"); k.at(barrier, 0, 1.0, 0.5); ex.add(barrier);
    const posts = [-1.3, 1.3].map(x => { const p = k.box(0.1, 1.1, 0.1, "#333"); k.at(p, x, 0, 0.5); ex.add(p); return p; });
    const spark = k.emoji("✨", 0.9); k.at(spark, 0, 2.6, 0.6); spark.visible = false; ex.add(spark);
    const light = new THREE.PointLight("#ffe9a8", 0, 9); k.at(light, 0, 2.5, 1.2); ex.add(light);
    const mat = k.box(2.8, 0.03, 1.2, "#3d4a55"); k.at(mat, 0, 0, 0.8); ex.add(mat);
    k.at(ex, 10.4, 0, -4.2);
    ex.userData.height = 3.6;
    api.spot("exit", ex, { walkTo: [10.2, -1.0], height: 3.9 });
    api.exitDoors = doors; api.exitClosed = [closed, barrier, ...posts]; api.exitOpen = [glow, spark]; api.exitLight = light;

    // plants and a couple of shoppers in the background
    [[-11.5, -5.2], [12, -5.2]].forEach(([x, z]) => { const p = k.plant({ scale: 1.1 }); k.at(p, x, 0, z); api.add(p); });
    const sh1 = k.person({ top: "#8e44ad", bottom: "#34495e", prop: "bag", propColor: "#f5cd79", hairStyle: "long", hair: "#c49a5a" });
    k.at(sh1, 5.6, 0, -4.8, -0.4); api.add(sh1);
    const sh2 = k.person({ top: "#16a085", bottom: "#2c3e50", hair: "#111", scale: 0.95 });
    k.at(sh2, 2.6, 0, -4.9, -0.5); api.add(sh2);
  },

  update(api, st) {
    const open = !!st.open;
    (api.exitClosed || []).forEach(o => { o.visible = !open; });
    (api.exitOpen || []).forEach(o => { o.visible = open; });
    if (api.exitDoors) api.exitDoors.forEach((d, i) => { d.position.x = (i ? 1 : -1) * (open ? 1.95 : 0.73); });
    if (api.exitLight) api.exitLight.intensity = open ? 6 : 0;
  },

  tick(api, t) {
    if (api.exitLight && api.exitLight.intensity > 0) api.exitLight.intensity = 5 + Math.sin(t * 2) * 1.2;
  },
};
