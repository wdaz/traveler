// Outside the airport: a sunny curb with a taxi rank, a bus stop and the number 7 bus; the terminal facade behind the road.
// Spot ids (must match content.js): driver, taxi, lady, timetable, machine, stopsign, busdriver, bus
export default {
  sky: { top: "#4fa8f0", bottom: "#cfeaff" },
  fog: { color: "#d6ecfb", near: 34, far: 80 },
  groundColor: "#8cc06a",
  light: { sky: "#ffffff", ground: "#6a8a5a", hemi: 1.15, sun: "#fff4dc", sunIntensity: 1.8, sunPos: [-6, 16, 10] },
  bounds: { minX: -11, maxX: 11, minZ: -2.2, maxZ: 5 },
  camera: [0, 5.5, 10],

  build(k, api) {
    const { THREE } = api;
    api.spawn = [-9, 2.6];
    const ROADZ = -4.6;

    // big letters with no plaque (canvas text on a transparent plane)
    function letters(text, height, color) {
      const c = document.createElement("canvas"), ctx = c.getContext("2d"), px = 128;
      ctx.font = `bold ${px}px Figtree, Arial, sans-serif`;
      c.width = Math.ceil(ctx.measureText(text).width + 40); c.height = Math.ceil(px * 1.25);
      ctx.font = `bold ${px}px Figtree, Arial, sans-serif`; ctx.fillStyle = color; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(text, c.width / 2, c.height / 2 + 6);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
      return new THREE.Mesh(new THREE.PlaneGeometry(height * c.width / c.height, height), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    }
    const noShadow = o => { o.traverse(m => { m.castShadow = false; }); return o; };

    // ---- pavement, curb, road
    const walk = k.box(40, 0.14, 7.6, "#d9d4ca"); k.at(walk, 0, 0, 1.6); walk.castShadow = false; api.add(walk);
    for (let x = -19; x < 20; x += 1.6) { const l = k.box(0.03, 0.01, 7.6, "#c4bfb4"); k.at(l, x, 0.14, 1.6); l.castShadow = false; api.add(l); }
    const curb = k.box(40, 0.2, 0.3, "#f0eee8"); k.at(curb, 0, 0, -2.2); api.add(curb);
    const road = k.box(44, 0.04, 6.4, "#4b4f57"); k.at(road, 0, 0, ROADZ - 0.9); road.castShadow = false; api.add(road);
    for (let x = -20; x < 21; x += 3) { const d = k.box(1.6, 0.01, 0.15, "#f4f4f4"); k.at(d, x, 0.04, -7.3); d.castShadow = false; api.add(d); }
    // yellow bus bay / taxi rank markings
    const bay = k.box(9, 0.01, 0.12, "#f2c230"); k.at(bay, 7.5, 0.04, -2.7); api.add(noShadow(bay));
    const bay2 = k.box(5, 0.01, 0.12, "#f2c230"); k.at(bay2, -8, 0.04, -2.7); api.add(noShadow(bay2));
    const busTxt = letters("BUS", 0.8, "#f2c230"); busTxt.rotation.x = -Math.PI / 2; k.at(busTxt, 3.2, 0.05, -3.4); api.add(busTxt);
    // crossing
    for (let i = 0; i < 7; i++) { const z = k.box(4, 0.01, 0.5, "#f4f4f4"); k.at(z, -4.6, 0.045, -2.8 - i * 0.9); api.add(noShadow(z)); }

    // ---- behind the road: lawn, trees, the terminal facade
    const fac = new THREE.Group();
    const main = k.box(70, 6.5, 3, "#e9edf1"); fac.add(main);
    const glassBand = k.box(70, 3.2, 0.1, "#6fa8d8"); k.at(glassBand, 0, 0.6, 1.52); fac.add(glassBand);
    for (let x = -34; x <= 34; x += 2) { const m = k.box(0.15, 3.2, 0.14, "#d0d8e0"); k.at(m, x, 0.6, 1.55); fac.add(m); }
    const roofE = k.box(72, 0.5, 4.4, "#2f7fd8"); k.at(roofE, 0, 6.5, 0.5); fac.add(roofE);
    const canopy = k.box(70, 0.25, 2.4, "#ffffff"); k.at(canopy, 0, 3.9, 2.6); fac.add(canopy);
    const word = letters("AIRPORT", 2.0, "#1d3f75"); k.at(word, 0, 5.2, 1.56); fac.add(word);
    const ctrl = k.cylinder(0.9, 1.2, 12, "#dfe4ea", 8); k.at(ctrl, 16, 0, -3); fac.add(ctrl);
    const cab = k.cylinder(2.1, 1.5, 1.7, "#2b4a6b", 8); k.at(cab, 16, 12, -3); fac.add(cab);
    k.at(fac, 0, 0, -15.5); api.add(noShadow(fac));
    const plane = k.emoji("✈️", 2.2); k.at(plane, -7, 10.5, -14); api.add(plane); api.plane = plane;
    [-15, -10, -5.2, 0.5, 6, 11, 15.5].forEach((x, i) => { const t = k.tree({ scale: 1 + (i % 3) * 0.12 }); k.at(t, x, 0, -10.4 + (i % 2) * 0.6); api.add(t); });
    const hedge = k.box(60, 0.5, 0.6, "#4f9a52"); k.at(hedge, 0, 0, -8.6); api.add(noShadow(hedge));

    // ---- taxi rank (left)
    const taxi = k.car({ taxi: true });
    const tsPole = k.box(0.08, 2.4, 0.08, "#5b6673"); k.at(tsPole, -2.4, 0, 2.4); taxi.add(tsPole);
    const tsSign = k.sign("TAXI", { height: 0.5, bg: "#f2c230", ink: "#111", font: "Figtree, Arial, sans-serif" }); k.at(tsSign, -2.4, 2.45, 2.45); taxi.add(tsSign);
    k.at(taxi, -8, 0, ROADZ + 0.9);
    api.spot("taxi", taxi, { walkTo: [-8.6, -1.6], height: 2.0 });
    const driver = k.person({ top: "#ffffff", bottom: "#2b2f3a", hat: "cap", hatColor: "#111111", hair: "#2a1a10", skin: "#b9805a", vest: "#2c3e50", prop: "phone" });
    k.at(driver, -5.6, 0.14, -1.6, -0.25);
    api.spot("driver", driver, { walkTo: [-5.6, -0.2], height: 2.1 });

    // ---- bus stop (middle)
    const shelter = new THREE.Group();
    const back = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.0, 0.05), new THREE.MeshLambertMaterial({ color: "#bfe3ff", transparent: true, opacity: 0.4 }));
    k.at(back, 0, 1.2, -0.7); shelter.add(back);
    [-1.6, 1.6].forEach(x => { const p = k.box(0.1, 2.5, 0.1, "#3a4250"); k.at(p, x, 0, -0.7); shelter.add(p); const f = k.box(0.1, 2.5, 0.1, "#3a4250"); k.at(f, x, 0, 0.5); shelter.add(f); });
    const roof = k.box(3.5, 0.15, 1.6, "#2f7fd8"); k.at(roof, 0, 2.5, -0.1); shelter.add(roof);
    const bnch = k.bench({ width: 2.4, color: "#9a6a3a" }); k.at(bnch, 0, 0, -0.35); shelter.add(bnch);
    const ad = k.box(1.0, 1.6, 0.06, "#ff8a5c"); k.at(ad, 1.05, 0.5, -0.74); shelter.add(ad);
    const adTxt = k.emoji("🏙️", 0.7); k.at(adTxt, 1.05, 1.4, -0.68); shelter.add(adTxt);
    const pole = k.cylinder(0.05, 0.05, 2.9, "#5b6673", 6); k.at(pole, -2.2, 0, 0.3); shelter.add(pole);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 16), k.mat("#1f9d55")); disc.rotation.x = Math.PI / 2; k.at(disc, -2.2, 2.9, 0.3); shelter.add(disc);
    const busIcon = k.emoji("🚌", 0.5); k.at(busIcon, -2.2, 2.92, 0.36); busIcon.scale.set(0.45, 0.45, 0.45); shelter.add(busIcon);
    const bsSign = k.sign("BUS STOP", { height: 0.42, bg: "#1f9d55", ink: "#ffffff", font: "Figtree, Arial, sans-serif" }); k.at(bsSign, 0, 2.86, 0.72); shelter.add(bsSign);
    k.at(shelter, -1.2, 0.14, -1.1);
    shelter.userData.height = 3.3;
    api.spot("stopsign", shelter, { walkTo: [-2.6, 0.4], height: 3.4 });
    const lady = k.person({ top: "#a77bca", bottom: "#5a4a6a", hair: "#c9c9c9", hairStyle: "bun", skirt: true, prop: "bag", propColor: "#8e3b2e", skin: "#efc6a4" });
    k.at(lady, -0.6, 0.14, -0.9, -0.15);
    api.spot("lady", lady, { walkTo: [-0.4, 0.6], height: 2.1 });

    const tt = new THREE.Group();
    [-1.0, 1.0].forEach(x => { const l = k.box(0.08, 2.5, 0.08, "#5b6673"); k.at(l, x, 0, 0); tt.add(l); });
    const ttFrame = k.box(2.3, 1.5, 0.1, "#1f9d55"); k.at(ttFrame, 0, 1.15, 0); tt.add(ttFrame);
    const ttScr = k.screen("BUS 7\nCITY CENTRE\nEVERY 15 MINUTES", { width: 2.15, bg: "#ffffff", ink: "#1a1e24", px: 52 });
    k.at(ttScr, 0, 1.9, 0.06); tt.add(ttScr);
    k.at(tt, 1.8, 0.14, -1.6);
    tt.userData.height = 2.6;
    api.spot("timetable", tt, { walkTo: [1.8, -0.2], height: 2.7 });

    const machine = new THREE.Group();
    const mb = k.box(0.9, 1.7, 0.6, "#e9edf1"); machine.add(mb);
    const mt = k.box(0.95, 0.22, 0.65, "#d63031"); k.at(mt, 0, 1.7, 0); machine.add(mt);
    const ms = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.42), new THREE.MeshBasicMaterial({ color: "#5ec8ff" })); k.at(ms, 0, 1.3, 0.31); machine.add(ms);
    const tIcon = k.emoji("🎫", 0.35); k.at(tIcon, 0, 1.3, 0.34); machine.add(tIcon);
    const slot = k.box(0.4, 0.06, 0.04, "#222"); k.at(slot, 0, 0.75, 0.3); machine.add(slot);
    const pad = k.box(0.3, 0.2, 0.04, "#555"); k.at(pad, 0, 0.95, 0.31); machine.add(pad);
    const mSign = k.sign("TICKET MACHINE", { height: 0.3, bg: "#d63031", ink: "#ffffff", font: "Figtree, Arial, sans-serif" }); k.at(mSign, 0, 2.1, 0.05); machine.add(mSign);
    k.at(machine, 4.0, 0.14, -1.5);
    machine.userData.height = 2.4;
    api.spot("machine", machine, { walkTo: [4.0, -0.1], height: 2.6 });

    // ---- the number 7 bus (right) — the exit
    const busG = new THREE.Group();
    const bus = k.bus({ number: "7", dest: "CITY CENTRE", color: "#f39c12" }); busG.add(bus);
    const dest = k.sign("7 · CITY CENTRE", { height: 0.36, bg: "#111", ink: "#ffb020", font: "Figtree, Arial, sans-serif" }); k.at(dest, -1.6, 2.5, 1.18); busG.add(dest);
    const DX = 4 - 1.0, DZ = 1.19; // the bus's front door (kit puts it at L/2 - 1)
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.85), new THREE.MeshBasicMaterial({ color: "#fff2b8" })); k.at(glow, DX, 1.35, DZ); busG.add(glow);
    const leafMat = k.mat("#24313f");
    const leaves = [-0.25, 0.25].map(o => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.48, 1.85, 0.04), leafMat); k.at(l, DX + o, 1.35, DZ + 0.03); l.userData.homeX = DX + o; busG.add(l); return l; });
    leaves.forEach(l => { const w = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.7, 0.01), k.mat("#5a7a98")); w.position.set(0, 0.35, 0.025); l.add(w); });
    const plaque = k.sign("DOORS CLOSED", { height: 0.18, bg: "#d63031", ink: "#ffffff", font: "Figtree, Arial, sans-serif" }); k.at(plaque, DX, 1.0, DZ + 0.07); busG.add(plaque);
    const spark = k.emoji("✨", 0.9); k.at(spark, DX, 2.6, DZ + 0.6); busG.add(spark);
    const light = new THREE.PointLight("#ffe9a8", 0, 8); k.at(light, DX, 1.6, DZ + 1.2); busG.add(light);
    const step = k.box(1.0, 0.12, 0.3, "#3a4250"); k.at(step, DX, 0.2, DZ + 0.12); busG.add(step);
    k.at(busG, 7.4, 0, ROADZ + 0.4);
    busG.userData.height = 3.2;
    api.spot("bus", busG, { walkTo: [10.2, -1.6], height: 3.6 });
    api.busClosed = [plaque]; api.busOpen = [glow, spark]; api.busLeaves = leaves; api.busLight = light;
    const busdriver = k.person({ top: "#8ec5ff", bottom: "#1d3f75", hat: "cap", hatColor: "#1d3f75", tie: "#1d3f75", hair: "#5a3a22", skin: "#d9a07a", prop: "clipboard" });
    k.at(busdriver, 8.6, 0.14, -1.7, -0.2);
    api.spot("busdriver", busdriver, { walkTo: [8.4, -0.2], height: 2.1 });

    // ---- street life: lamps, planters, a bin, a traveller with a suitcase
    [-11.5, -3.6, 12.6].forEach(x => { const l = k.lamp({ height: 3.8 }); k.at(l, x, 0.14, -1.9); api.add(l); });
    [[-13.2, 0.6], [12.4, 0.6]].forEach(([x, z]) => { const p = k.plant({ scale: 1.1, pot: "#9aa5b2" }); k.at(p, x, 0.14, z); api.add(p); });
    const bin = k.cylinder(0.25, 0.22, 0.8, "#1f9d55", 8); k.at(bin, -3.0, 0.14, -1.5); api.add(bin);
    const trav = k.person({ top: "#e67e22", bottom: "#34495e", hair: "#111", prop: "suitcase", propColor: "#8e44ad" });
    k.at(trav, -12.4, 0.14, -1.2, 0.3); api.add(trav);
    const car2 = k.car({ color: "#c0392b" }); k.at(car2, -16, 0, -6.6); api.add(car2);
  },

  update(api, st) {
    const open = !!st.open;
    api.busClosed.forEach(o => { o.visible = !open; });
    api.busOpen.forEach(o => { o.visible = open; });
    api.busLight.intensity = open ? 6 : 0;
    api.busLeaves.forEach(l => { l.visible = !open; });
  },

  tick(api, t) {
    if (api.busLight && api.busLight.intensity > 0) api.busLight.intensity = 5 + Math.sin(t * 2) * 1.2;
    if (api.plane) { api.plane.position.x = -16 + ((t * 1.2) % 34); }
  },
};
