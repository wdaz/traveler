// Mall: a shiny shopping mall with glass shop fronts, a clothes shop, fitting rooms, an escalator and a shoe shop.
// Spot ids (must match content.js): directory, assistant, rack, fitting, escalator, shoeseller, exit
const FONT = "Figtree, Arial, sans-serif";

export default {
  sky: { top: "#e9eef3", bottom: "#f6f8fa" },
  fog: { color: "#eef2f6", near: 26, far: 60 },
  groundColor: "#e4e7ea",
  light: { sky: "#ffffff", ground: "#d8d2c8", hemi: 1.5, sun: "#fffaf0", sunIntensity: 1.35, sunPos: [-6, 16, 10] },
  bounds: { minX: -11, maxX: 11, minZ: -1.0, maxZ: 5 },
  camera: [0, 5.5, 10],

  build(k, api) {
    const { THREE } = api;
    api.spawn = [-8, 3.2];
    const sg = (t, o = {}) => k.sign(t, { font: FONT, ...o });
    const glassMat = new THREE.MeshLambertMaterial({ color: "#bfe3f2", transparent: true, opacity: 0.35 });
    const glassPane = (w, h) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), glassMat); m.position.y = h / 2; return m; };
    const noShadow = g => { g.traverse(o => { o.castShadow = false; }); return g; };

    // ---- shell: white walls, polished floor with tile lines and a central shiny strip
    const room = k.room({ w: 28, d: 13, h: 7, wall: "#f4f5f7", floor: "#f3eee6" });
    api.add(room);
    const shine = new THREE.MeshPhongMaterial({ color: "#fbf8f3", shininess: 120, specular: "#ffffff", flatShading: true });
    for (let x = -12; x <= 12; x += 3) for (let z = -4; z <= 5; z += 3) {
      const t = new THREE.Mesh(new THREE.PlaneGeometry(2.92, 2.92), (x / 3 + z / 3) % 2 === 0 ? shine : k.mat("#e6ddd0"));
      t.rotation.x = -Math.PI / 2; t.position.set(x, 0.011, z + 0.5); t.receiveShadow = true; api.add(t);
    }
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(26, 0.5), k.mat("#c8b48a")); strip.rotation.x = -Math.PI / 2; strip.position.set(0, 0.015, 0.6); api.add(strip);

    // mezzanine (first floor) along the back, with a glass balustrade
    const mez = k.box(28, 0.4, 1.8, "#d9dee4"); k.at(mez, 0, 4.1, -5.6); noShadow(mez); api.add(mez);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(28, 0.8, 0.05), glassMat); rail.position.set(0, 4.9, -4.72); api.add(rail);
    const railTop = k.box(28, 0.06, 0.08, "#b0b8c0"); k.at(railTop, 0, 5.3, -4.72); api.add(railTop);
    // upper shop fronts
    [[-9, "#ff8fab"], [-3, "#74b9ff"], [9, "#55efc4"]].forEach(([x, c]) => {
      const f = k.box(4.4, 2.2, 0.1, c); k.at(f, x, 4.5, -6.3); noShadow(f); api.add(f);
      const gp = glassPane(3.8, 1.8); k.at(gp, x, 4.6, -6.2); api.add(gp);
    });
    // shoppers upstairs
    [[-6, "#6c5ce7"], [7, "#e17055"], [1, "#00b894"]].forEach(([x, c], i) => {
      const p = k.person({ top: c, bottom: "#2d3436", scale: 0.9, hairStyle: i === 1 ? "long" : "short", prop: i === 0 ? "bag" : undefined, propColor: "#fdcb6e" });
      k.at(p, x, 4.3, -5.4); noShadow(p); api.add(p);
    });
    // ceiling-ish light strips (skylight glow on back wall top)
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(28, 0.6), new THREE.MeshBasicMaterial({ color: "#ffffff" })); sky.position.set(0, 6.6, -6.3); api.add(sky);

    const band = k.box(28, 0.25, 0.1, "#fd79a8"); k.at(band, 0, 3.75, -6.28); noShadow(band); api.add(band);
    [[-11, "#fdcb6e"], [1.4, "#74b9ff"]].forEach(([x, c]) => { const b = k.box(0.9, 2.2, 0.05, c); k.at(b, x, 4.0, -4.6); noShadow(b); api.add(b);
      const t = k.emoji(x < 0 ? "🛍️" : "⭐", 0.6); k.at(t, x, 5.2, -4.55); api.add(t); });
    // ---- DIRECTORY: a tall screen kiosk near the entrance
    const dir = k.group();
    const post = k.box(1.9, 2.6, 0.3, "#2d3436"); dir.add(post);
    const dscr = k.screen("DIRECTORY\nGROUND: FOOD\nFIRST: CLOTHES\nSECOND: SHOES", { width: 1.7, bg: "#0f1a2a", ink: "#7fe3ff", px: 44 });
    k.at(dscr, 0, 1.55, 0.16); dir.add(dscr);
    const you = sg("YOU ARE HERE", { height: 0.16, bg: "#e84393", ink: "#fff" }); k.at(you, 0, 0.45, 0.16); dir.add(you);
    k.at(dir, -9.6, 0, -0.6);
    api.spot("directory", dir, { walkTo: [-9.6, 1.0], height: 2.9 });

    // ---- CLOTHES SHOP: glass front with mannequins, the assistant in front, a sale rack
    const shop = k.group();
    const fr = k.box(6.2, 0.9, 0.3, "#2d3436"); k.at(fr, 0, 3.0, 0); shop.add(fr);
    const ssg = sg("FASHION", { height: 0.5, bg: "#2d3436", ink: "#ffffff" }); k.at(ssg, 0, 3.2, 0.16); shop.add(ssg);
    [-3, 3].forEach(x => { const p = k.box(0.2, 3.0, 0.3, "#2d3436"); k.at(p, x, 0, 0); shop.add(p); });
    const win = glassPane(5.8, 3.0); shop.add(win);
    const inside = k.box(6.0, 3.0, 0.1, "#fde2e4"); k.at(inside, 0, 0, -1.2); shop.add(inside);
    [-2.2, -1.2].forEach((x, i) => {
      const m = k.person({ top: i ? "#fdcb6e" : "#e84393", bottom: "#2d3436", skin: "#f1f2f6", hairStyle: "bald", skirt: !i });
      k.at(m, x, 0, -0.6); noShadow(m); shop.add(m);
    });
    k.at(shop, -4.2, 0, -4.6); api.add(shop);
    const assistant = k.person({ top: "#2d3436", bottom: "#2d3436", tie: "#e84393", hairStyle: "long", hair: "#7a4a2a", skin: "#e0ac7e", skirt: true });
    const nb = k.box(0.14, 0.08, 0.02, "#ffffff"); nb.position.set(-0.13, 1.25, 0.14); assistant.add(nb);
    const nbs = k.box(0.14, 0.02, 0.022, "#e84393"); nbs.position.set(-0.13, 1.28, 0.145); assistant.add(nbs);
    k.at(assistant, -5.6, 0, -2.6, 0.2);
    api.spot("assistant", assistant, { walkTo: [-5.4, -0.5], height: 2.0 });

    // RACK: clothes rack with colourful T-shirts
    const rk = k.group();
    [-1.1, 1.1].forEach(x => { const p = k.cylinder(0.04, 0.04, 1.6, "#b0b8c0", 6); k.at(p, x, 0, 0); rk.add(p); const f = k.box(0.1, 0.05, 0.6, "#b0b8c0"); k.at(f, x, 0, 0); rk.add(f); });
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.3, 6), k.mat("#b0b8c0")); bar.rotation.z = Math.PI / 2; bar.position.y = 1.6; rk.add(bar);
    ["#e74c3c", "#f1c40f", "#2ecc71", "#3498db", "#9b59b6", "#e67e22", "#1abc9c"].forEach((c, i) => {
      const tsh = k.group(k.box(0.36, 0.55, 0.06, c), k.box(0.6, 0.16, 0.06, c));
      tsh.children[1].position.y = 0.42; tsh.position.set(-0.9 + i * 0.3, 0.98, 0.04 * (i % 2)); rk.add(tsh);
    });
    const rsg = sg("T-SHIRTS · SALE · 50% OFF", { height: 0.3, bg: "#e84393", ink: "#ffffff" }); k.at(rsg, 0, 2.0, 0); rk.add(rsg);
    k.at(rk, -2.3, 0, -1.9);
    api.spot("rack", rk, { walkTo: [-2.3, -0.4], height: 2.3 });

    // FITTING ROOMS: two curtained booths
    const ft = k.group();
    const fwall = k.box(3.2, 2.5, 0.12, "#dfe6e9"); k.at(fwall, 0, 0, -0.9); ft.add(fwall);
    [-1.6, 0, 1.6].forEach(x => { const d = k.box(0.1, 2.5, 1.0, "#dfe6e9"); k.at(d, x, 0, -0.45); ft.add(d); });
    const top = k.box(3.3, 0.12, 1.05, "#b2bec3"); k.at(top, 0, 2.5, -0.45); ft.add(top);
    [-0.8, 0.8].forEach((x, b) => {
      for (let i = 0; i < 5; i++) {
        const fold = k.cylinder(0.11, 0.11, 2.1, b ? "#6c5ce7" : "#a29bfe", 6);
        k.at(fold, x - 0.56 + i * 0.28, 0.25, 0.02); fold.scale.z = 0.6; ft.add(fold);
      }
    });
    const fsg = sg("FITTING ROOMS", { height: 0.3, bg: "#6c5ce7", ink: "#ffffff" }); k.at(fsg, 0, 2.85, 0); ft.add(fsg);
    k.at(ft, 1.0, 0, -3.4);
    api.spot("fitting", ft, { walkTo: [1.0, -0.4], height: 3.0 });

    // ESCALATOR: going up to the mezzanine at the back
    const es = k.group();
    const L = 4.8, H = 4.1, ang = Math.atan2(H, L);
    const ramp = new THREE.Group();
    const tread = k.box(1.2, 0.12, Math.hypot(L, H), "#7f8c8d"); tread.position.y = 0; ramp.add(tread);
    for (let i = 0; i < 12; i++) { const s = k.box(1.1, 0.04, 0.05, "#dfe6e9"); k.at(s, 0, 0.12, -Math.hypot(L, H) / 2 + 0.3 + i * 0.55); ramp.add(s); }
    [-0.7, 0.7].forEach(x => {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, Math.hypot(L, H)), glassMat); side.position.set(x, 0.5, 0); ramp.add(side);
      const hr = k.box(0.12, 0.08, Math.hypot(L, H), "#2d3436"); k.at(hr, x, 0.9, 0); ramp.add(hr);
    });
    ramp.rotation.x = ang; ramp.position.set(0, H / 2, -L / 2);
    es.add(ramp);
    const boot = k.box(1.6, 0.25, 1.0, "#636e72"); k.at(boot, 0, 0, 0.3); es.add(boot);
    const under = k.box(1.3, 1.6, 2.0, "#b2bec3"); k.at(under, 0, 0, -L + 1.0); under.position.y = 0.8 + 0.8; es.add(under);
    const esg = sg("ESCALATOR", { height: 0.3, bg: "#0984e3", ink: "#ffffff" }); k.at(esg, 0, 1.55, 0.35); es.add(esg);
    const up = k.emoji("⬆️", 0.4); k.at(up, 0, 2.05, 0.35); es.add(up);
    k.at(es, 4.3, 0, -1.0);
    es.userData.height = 2.2;
    api.spot("escalator", es, { walkTo: [4.3, 0.4], height: 2.4 });
    api.escSteps = ramp.children.slice(1, 13);
    api.escLen = Math.hypot(L, H);

    // SHOE SHOP: shelves of trainers + seller
    const sh = k.group();
    const sback = k.box(3.4, 3.0, 0.2, "#ffeaa7"); k.at(sback, 0, 0, -0.6); sh.add(sback);
    [0.6, 1.3, 2.0].forEach(y => {
      const s = k.box(3.2, 0.06, 0.5, "#e17055"); k.at(s, 0, y, -0.3); sh.add(s);
      [-1.1, -0.35, 0.4, 1.15].forEach((x, i) => { const e = k.emoji(i % 2 ? "👟" : (y > 1.5 ? "👠" : "👟"), 0.45); k.at(e, x, y + 0.22, -0.2); sh.add(e); });
    });
    const ssign = sg("SHOES", { height: 0.5, bg: "#e17055", ink: "#ffffff" }); k.at(ssign, 0, 3.35, -0.45); sh.add(ssign);
    const stool = k.box(0.9, 0.42, 0.5, "#74b9ff"); k.at(stool, -1.0, 0, 0.7); sh.add(stool);
    const box1 = k.box(0.45, 0.25, 0.3, "#fd79a8"); k.at(box1, 1.2, 0, 0.6); sh.add(box1);
    const box2 = k.box(0.45, 0.25, 0.3, "#ffffff"); k.at(box2, 1.2, 0.25, 0.6); sh.add(box2);
    k.at(sh, 7.6, 0, -3.6); api.add(sh);
    const shoeseller = k.person({ top: "#e17055", bottom: "#636e72", hat: "beanie", hatColor: "#2d3436", hair: "#111", skin: "#8d5524", prop: "clipboard" });
    k.at(shoeseller, 7.0, 0, -2.4, -0.15);
    api.spot("shoeseller", shoeseller, { walkTo: [7.0, -0.4], height: 2.0 });

    // ---- EXIT: automatic glass doors to the park
    const ex = k.group();
    const fc = "#2d3436";
    [-1.5, 1.5].forEach(x => { const p = k.box(0.22, 3.2, 0.3, fc); k.at(p, x, 0, 0); ex.add(p); });
    const ftop = k.box(3.2, 0.5, 0.3, fc); k.at(ftop, 0, 3.2, 0); ex.add(ftop);
    const park = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 3.2), new THREE.MeshBasicMaterial({ color: "#a8e6a1" })); k.at(park, 0, 1.6, -0.2); ex.add(park);
    const parkSky = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.4), new THREE.MeshBasicMaterial({ color: "#9fd8ff" })); k.at(parkSky, 0, 2.5, -0.19); ex.add(parkSky);
    const tr = k.emoji("🌳", 1.0); k.at(tr, -0.6, 1.4, -0.4); ex.add(tr);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 3.2), new THREE.MeshBasicMaterial({ color: "#fff3c4", transparent: true, opacity: 0.55 }));
    k.at(glow, 0, 1.6, -0.15); glow.visible = false; ex.add(glow);
    const doors = [-1, 1].map(s => { const d = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.1, 0.06), glassMat); d.position.set(s * 0.7, 1.55, -0.06); ex.add(d); return d; });
    const sensor = k.box(0.3, 0.12, 0.1, "#111"); k.at(sensor, 0, 3.05, 0.17); ex.add(sensor);
    const xsg = sg("EXIT · PARK", { height: 0.36, bg: "#00b894", ink: "#ffffff" }); k.at(xsg, 0, 3.45, 0.17); ex.add(xsg);
    const closed = sg("CLOSED", { height: 0.3, bg: "#d63031", ink: "#ffffff" }); k.at(closed, 0, 1.7, 0.1); ex.add(closed);
    const barrier = k.box(2.7, 0.1, 0.08, "#d63031"); k.at(barrier, 0, 1.0, 0.55); ex.add(barrier);
    const posts = [-1.25, 1.25].map(x => { const p = k.box(0.1, 1.1, 0.1, "#333"); k.at(p, x, 0, 0.55); ex.add(p); return p; });
    const spark = k.emoji("✨", 0.9); k.at(spark, 0, 2.6, 0.6); spark.visible = false; ex.add(spark);
    const light = new THREE.PointLight("#ffe9a8", 0, 9); k.at(light, 0, 2.5, 1.2); ex.add(light);
    const dmat = k.box(2.8, 0.03, 1.2, "#636e72"); k.at(dmat, 0, 0, 0.8); ex.add(dmat);
    k.at(ex, 10.9, 0, -3.8);
    ex.userData.height = 3.7;
    api.spot("exit", ex, { walkTo: [10.6, -0.6], height: 3.9 });
    api.exitDoors = doors; api.exitClosed = [closed, barrier, ...posts]; api.exitOpen = [glow, spark]; api.exitLight = light;

    // ---- decoration: plants, benches, a fountain-ish planter, shoppers
    [[-11.6, -1.6], [-0.9, -1.2], [5.9, -1.2], [12.6, -1.6]].forEach(([x, z], i) => { const p = k.plant({ scale: i % 2 ? 1.0 : 1.3, pot: "#ffffff", color: i % 2 ? "#2ecc71" : "#27ae60" }); k.at(p, x, 0, z); api.add(p); });
    const bn = k.bench({ width: 1.8, color: "#b2bec3" }); k.at(bn, -7.4, 0, -1.4); api.add(bn);
    const sp1 = k.person({ top: "#00cec9", bottom: "#2d3436", prop: "bag", propColor: "#fd79a8", hairStyle: "bun", hair: "#2a1a10", skin: "#f1c27d" });
    k.at(sp1, -1.8, 0, -4.2, 0.4); noShadow(sp1); api.add(sp1);
    const sp2 = k.person({ top: "#fdcb6e", bottom: "#0984e3", sit: true, hair: "#5a3a22", prop: "phone" });
    k.at(sp2, -7.0, 0, -1.4); noShadow(sp2); api.add(sp2);
  },

  update(api, st) {
    const open = !!st.open;
    (api.exitClosed || []).forEach(o => { o.visible = !open; });
    (api.exitOpen || []).forEach(o => { o.visible = open; });
    if (api.exitDoors) api.exitDoors.forEach((d, i) => { d.position.x = (i ? 1 : -1) * (open ? 1.45 : 0.7); });
    if (api.exitLight) api.exitLight.intensity = open ? 6 : 0;
  },

  tick(api, t) {
    if (api.exitLight && api.exitLight.intensity > 0) api.exitLight.intensity = 5 + Math.sin(t * 2) * 1.2;
    // escalator steps creep upwards
    if (api.escSteps) {
      const n = api.escSteps.length, len = api.escLen;
      api.escSteps.forEach((s, i) => { s.position.z = len / 2 - 0.3 - (((i * 0.55 + t * 0.4) % (n * 0.55))); });
    }
  },
};
