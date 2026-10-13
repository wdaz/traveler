// Metro: an underground station platform with tiled walls, a train waiting at the back and busy commuters.
// Spot ids (must match content.js): staff, metromap, lady, speaker, plat1, plat2, train
export default {
  sky: { top: "#2a3340", bottom: "#4a5462" },
  fog: { color: "#3a4452", near: 30, far: 70 },
  groundColor: "#8f949c",
  light: { sky: "#f4f8ff", ground: "#4a4f58", hemi: 1.25, sun: "#fff6e6", sunIntensity: 1.3, sunPos: [-6, 16, 10] },
  bounds: { minX: -11, maxX: 11, minZ: -3.2, maxZ: 5 },
  camera: [0, 5.5, 10],

  build(k, api) {
    const { THREE } = api;
    api.spawn = [-8, 3];

    // canvas tile texture for the walls
    function tiles(base, grout, cols, rows, band) {
      const c = document.createElement("canvas"); c.width = 512; c.height = 256;
      const g = c.getContext("2d");
      g.fillStyle = grout; g.fillRect(0, 0, c.width, c.height);
      const tw = c.width / cols, th = c.height / rows;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        g.fillStyle = band && (y === band[0] || y === band[1]) ? band[2] : base;
        g.fillRect(x * tw + 2, y * th + 2, tw - 4, th - 4);
      }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
      return t;
    }
    const tileMat = new THREE.MeshLambertMaterial({ map: tiles("#eef1ec", "#b9c0c4", 26, 7, [4, 5, "#2f8f7a"]) });

    // ---- floor: platform (light grey) with the dark track bed behind the yellow line
    const plat = new THREE.Mesh(new THREE.PlaneGeometry(26, 14), k.mat("#c9ccd1"));
    plat.rotation.x = -Math.PI / 2; plat.position.set(0, 0.01, 3); plat.receiveShadow = true; api.add(plat);
    const tactile = k.box(26, 0.02, 0.5, "#e3e7ea"); k.at(tactile, 0, 0, -3.25); api.add(tactile);
    const yellow = k.box(26, 0.03, 0.18, "#f4c430"); k.at(yellow, 0, 0, -3.6); api.add(yellow);
    const edge = k.box(26, 0.05, 0.3, "#f7f7f7"); k.at(edge, 0, 0, -4.0); api.add(edge);
    const bed = k.box(26, 0.02, 3.0, "#2b2a2c"); k.at(bed, 0, 0, -5.6); bed.castShadow = false; api.add(bed);
    for (let x = -12.5; x <= 12.5; x += 0.9) { const s = k.box(0.25, 0.04, 2.4, "#5a4a3c"); k.at(s, x, 0, -5.6); s.castShadow = false; api.add(s); }
    [-6.3, -4.9].forEach(z => { const r = k.box(26, 0.1, 0.1, "#9aa0a8"); k.at(r, 0, 0.04, z); r.castShadow = false; api.add(r); });

    // ---- walls: tiled back wall behind the track, tiled side walls
    const back = new THREE.Mesh(new THREE.BoxGeometry(26, 7, 0.3), tileMat); back.position.set(0, 3.5, -7.25); back.receiveShadow = true; api.add(back);
    [-13, 13].forEach(x => { const w = k.box(0.3, 7, 14, "#e4e8e3"); k.at(w, x, 0, -0.5); api.add(w); });
    const top = k.box(26.4, 0.5, 0.5, "#2f8f7a"); k.at(top, 0, 7, -7.2); api.add(top);
    // station name roundel on the back wall (left part, not hidden by the train)
    const roundel = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.06, 24), k.mat("#d63a3a"));
    roundel.rotation.x = Math.PI / 2; roundel.position.set(-11, 2.6, -7.05); api.add(roundel);
    const rin = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.07, 24), k.mat("#ffffff"));
    rin.rotation.x = Math.PI / 2; rin.position.set(-11, 2.6, -7.03); api.add(rin);
    const rbar = k.sign("METRO", { height: 0.32, bg: "#1f3d8a", ink: "#ffffff", font: "Figtree, Arial, sans-serif" });
    rbar.position.set(-11, 2.6, -6.98); api.add(rbar);
    // posters on the back wall
    [["#f39c12", "☀️"], ["#8e44ad", "🎭"]].forEach(([c, e], i) => {
      const x = -2.8 + i * 1.6;
      const p = k.box(1.2, 1.7, 0.05, c); k.at(p, x, 1.6, -7.07); p.castShadow = false; api.add(p);
      const em = k.emoji(e, 0.8); k.at(em, x, 2.6, -6.95); api.add(em);
    });

    // ---- ceiling lights: bright tubes hanging on thin wires
    const lightMat = new THREE.MeshBasicMaterial({ color: "#fdfdf2" });
    [-9, -3, 3, 9].forEach(x => {
      const tube = new THREE.Mesh(new THREE.BoxGeometry(3, 0.12, 0.3), lightMat); tube.position.set(x, 6.2, -1.5); api.add(tube);
      [-1.2, 1.2].forEach(dx => { const w = k.box(0.02, 1, 0.02, "#444"); k.at(w, x + dx, 6.2, -1.5); w.castShadow = false; api.add(w); });
    });

    // ---- pillars (left part of the platform)
    function pillar(x) { const p = k.box(0.8, 7, 0.8, "#2f8f7a"); k.at(p, x, 0, -2.6); api.add(p);
      const band = k.box(0.84, 0.3, 0.84, "#f4c430"); k.at(band, x, 1.0, -2.6); api.add(band); return p; }
    pillar(-12.2);
    pillar(-0.2);

    // ---- metro map on the back wall (left, above the track)
    const mapG = new THREE.Group();
    const mc = document.createElement("canvas"); mc.width = 640; mc.height = 400;
    const g = mc.getContext("2d");
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, 640, 400);
    g.lineCap = "round"; g.lineWidth = 18;
    g.strokeStyle = "#d63a3a"; g.beginPath(); g.moveTo(40, 340); g.lineTo(200, 200); g.lineTo(600, 200); g.stroke();
    g.strokeStyle = "#2e6fd8"; g.beginPath(); g.moveTo(320, 30); g.lineTo(320, 280); g.lineTo(560, 370); g.stroke();
    const stn = (x, y) => { g.fillStyle = "#fff"; g.strokeStyle = "#222"; g.lineWidth = 6; g.beginPath(); g.arc(x, y, 14, 0, Math.PI * 2); g.fill(); g.stroke(); };
    [[40, 340], [200, 200], [470, 200], [600, 200], [320, 30], [320, 110], [560, 370]].forEach(([x, y]) => stn(x, y));
    g.fillStyle = "#fff"; g.strokeStyle = "#111"; g.lineWidth = 8; g.beginPath(); g.arc(320, 200, 26, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#111"; g.font = "bold 34px Figtree, Arial, sans-serif"; g.fillText("CENTRAL", 350, 250);
    g.font = "bold 26px Figtree, Arial, sans-serif"; g.fillText("AIRPORT", 520, 175);
    const mt = new THREE.CanvasTexture(mc); mt.colorSpace = THREE.SRGBColorSpace; mt.anisotropy = 4;
    const frame = k.box(3.4, 2.3, 0.08, "#1f3d8a"); mapG.add(frame);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.0), new THREE.MeshBasicMaterial({ map: mt })); face.position.set(0, 1.15, 0.05); mapG.add(face);
    const mlbl = k.sign("METRO MAP · RED LINE · BLUE LINE", { height: 0.42, bg: "#1f3d8a", ink: "#ffffff", font: "Figtree, Arial, sans-serif" });
    mlbl.position.set(0, 2.6, 0.05); mapG.add(mlbl);
    k.at(mapG, -6.5, 1.6, -7.05);
    mapG.userData.height = 4.4;
    api.spot("metromap", mapG, { walkTo: [-6.5, -2.4], height: 4.6 });

    // ---- benches and bins
    const b1 = k.bench({ width: 2.2, color: "#2f8f7a" }); k.at(b1, -3.6, 0, -2.7); api.add(b1);
    const bin = k.cylinder(0.25, 0.22, 0.8, "#c0392b", 8); k.at(bin, -10.6, 0, -2.6); api.add(bin);

    // ---- station staff (hi-vis vest, cap) on the left by a help point
    const staff = k.person({ top: "#1f3d8a", bottom: "#1d2230", vest: "#c6f53a", hat: "cap", hatColor: "#1f3d8a", hair: "#2a1a10", skin: "#c68a5e", prop: "clipboard" });
    k.at(staff, -9.3, 0, -1.6); staff.rotation.y = 0.2;
    api.spot("staff", staff, { walkTo: [-9.0, -0.2] });
    const help = k.box(0.5, 1.6, 0.35, "#1f3d8a"); k.at(help, -10.4, 0, -1.9); api.add(help);
    const helpS = k.sign("HELP", { height: 0.22, bg: "#ffffff", ink: "#1f3d8a", font: "Figtree, Arial, sans-serif" }); k.at(helpS, -10.4, 1.35, -1.71); api.add(helpS);

    // ---- old lady with a grey bun, handbag and walking stick, near the bench
    const lady = k.person({ top: "#a2557a", bottom: "#5b4a6a", skirt: true, hair: "#c9c9cc", hairStyle: "bun", skin: "#eec4a0", prop: "bag", propColor: "#6b3a20", scale: 0.92 });
    const stick = k.cylinder(0.025, 0.025, 0.95, "#5a3a20", 6); k.at(stick, 0.36, 0, 0.12); lady.add(stick);
    const knob = k.sphere(0.05, "#5a3a20", 6); knob.position.set(0.36, 0.97, 0.12); lady.add(knob);
    k.at(lady, -5.4, 0, -1.6); lady.rotation.y = 0.15;
    api.spot("lady", lady, { walkTo: [-5.0, -0.2] });

    // ---- loudspeaker on the central pillar
    const spk = new THREE.Group();
    const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.38, 0.55, 10, 1, true), k.mat("#d9dde2", { side: THREE.DoubleSide }));
    horn.rotation.x = Math.PI / 2 + 0.35; horn.castShadow = true; spk.add(horn);
    const bk = k.box(0.3, 0.3, 0.25, "#555b63"); k.at(bk, 0, -0.15, -0.3); spk.add(bk);
    const arm = k.box(0.08, 0.08, 0.5, "#555b63"); k.at(arm, 0, -0.04, -0.55); spk.add(arm);
    const se = k.emoji("🔊", 0.65); se.position.set(0, 0.6, 0.2); spk.add(se);
    k.at(spk, -0.2, 3.4, -1.75);
    spk.userData.height = 4.1;
    api.spot("speaker", spk, { walkTo: [-0.2, -0.4], height: 4.3 });
    api.speakerEmoji = se;

    // ---- hanging platform signs
    function hanging(text, x, bg) {
      const h = new THREE.Group();
      const s = k.sign(text, { height: 0.42, bg, ink: "#ffffff", font: "Figtree, Arial, sans-serif" });
      s.position.y = 0; h.add(s);
      const backing = k.box(s.geometry.parameters.width + 0.1, 0.5, 0.06, "#1d2230"); backing.position.set(0, 0, -0.04); h.add(backing);
      [-1, 1].forEach(sx => { const w = k.box(0.03, 1.4, 0.03, "#333"); w.castShadow = false; k.at(w, sx * s.geometry.parameters.width * 0.4, 0.2, -0.04); h.add(w); });
      k.at(h, x, 5.0, -2.0);
      return h;
    }
    const p1 = hanging("PLATFORM 1 · RED LINE → CENTRAL", 5.5, "#d63a3a");
    api.spot("plat1", p1, { walkTo: [5.5, -0.6], height: 5.6 });
    const p2 = hanging("PLATFORM 2 · RED LINE → AIRPORT", -2.9, "#9a2a2a");
    api.spot("plat2", p2, { walkTo: [-2.6, -0.6], height: 5.6 });

    // ---- the train, waiting at the platform on the right
    const tr = new THREE.Group();
    const L = 11.5, TX = 6.0;
    const body = k.box(L, 2.9, 2.5, "#dfe3e8"); k.at(body, 0, 0.3, 0); tr.add(body);
    const roof = k.box(L, 0.25, 2.2, "#b8bec6"); k.at(roof, 0, 3.2, 0); tr.add(roof);
    const stripe = k.box(L + 0.02, 0.28, 2.54, "#d63a3a"); k.at(stripe, 0, 1.0, 0); tr.add(stripe);
    const skirt = k.box(L, 0.3, 2.3, "#3a3f46"); tr.add(skirt);
    const glass = k.mat("#22303e");
    const doorXs = [-3.6, 0, 3.6];
    // windows between doors
    [-5.1, -1.8, 1.8, 5.1].forEach(x => { const w = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.95, 0.02), glass); w.position.set(x, 2.25, 1.26); tr.add(w); });
    // interior glow behind each doorway, and door panels
    const glowMat = new THREE.MeshBasicMaterial({ color: "#fff1b8" });
    const glows = [], doorsL = [], doorsR = [];
    doorXs.forEach(x => {
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.3), glowMat); gl.position.set(x, 1.5, 1.28); gl.visible = false; tr.add(gl); glows.push(gl);
      const frameD = k.box(1.7, 0.12, 0.08, "#8c939c"); k.at(frameD, x, 2.68, 1.26); tr.add(frameD);
      const dark = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.3), k.mat("#3a4048")); dark.position.set(x, 1.5, 1.265); tr.add(dark);
      [-1, 1].forEach(sd => {
        const d = new THREE.Group();
        const panel = k.box(0.75, 2.35, 0.06, "#c8ced6"); panel.position.y += 0.3; d.add(panel);
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.8, 0.02), glass); win.position.set(0, 2.05, 0.04); d.add(win);
        const red = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.2, 0.02), k.mat("#d63a3a")); red.position.set(0, 1.25, 0.04); d.add(red);
        d.position.set(x + sd * 0.38, 0, 1.3); d.userData.home = x + sd * 0.38; d.userData.open = x + sd * 1.15;
        tr.add(d); (sd < 0 ? doorsL : doorsR).push(d);
      });
    });
    // destination board on the side
    const dest = k.sign("RED LINE → CENTRAL", { height: 0.3, bg: "#111", ink: "#ffb020", font: "Figtree, Arial, sans-serif" });
    dest.position.set(-5.1, 2.95, 1.27); tr.add(dest);
    const closedS = k.sign("DOORS CLOSED", { height: 0.36, bg: "#c0392b", ink: "#ffffff", font: "Figtree, Arial, sans-serif" });
    closedS.position.set(0, 2.95, 1.32); tr.add(closedS);
    const openS = k.sign("DOORS OPEN", { height: 0.36, bg: "#27ae60", ink: "#ffffff", font: "Figtree, Arial, sans-serif" });
    openS.position.set(0, 2.95, 1.32); openS.visible = false; tr.add(openS);
    const spark = k.emoji("✨", 0.9); spark.position.set(0, 3.8, 1.4); spark.visible = false; tr.add(spark);
    const tl = new THREE.PointLight("#ffe9a8", 0, 9); tl.position.set(0, 2, 2.6); tr.add(tl);
    k.at(tr, TX, 0, -5.6);
    tr.userData.height = 3.6;
    api.spot("train", tr, { walkTo: [TX, -2.8], height: 3.6 });
    Object.assign(api, { trainDoors: [...doorsL, ...doorsR], trainGlows: glows, trainClosed: closedS, trainOpen: [openS, spark], trainLight: tl });

    // ---- background commuters (not clickable)
    const commuters = [
      [{ top: "#34495e", bottom: "#2c2c34", tie: "#c0392b", prop: "bag", propColor: "#3a2a1c" }, 2.0, -2.0, 0.3],
      [{ top: "#e67e22", bottom: "#3d5a80", hairStyle: "long", hair: "#6b3a1c", prop: "phone" }, 3.2, -2.6, -0.4],
      [{ top: "#16a085", bottom: "#222", hat: "beanie", hatColor: "#f4c430", prop: "backpack", propColor: "#8e44ad" }, 9.2, -2.2, -0.3],
      [{ top: "#f2f2f2", bottom: "#7a5a3a", hairStyle: "bun", hair: "#1a1a1a", skin: "#8d5a3b", prop: "suitcase", propColor: "#2e86de" }, 10.6, -1.2, -0.5],
      [{ top: "#9b59b6", bottom: "#2b2f3a", sit: true, hair: "#d9b26a" }, -3.2, -2.75, 0],
    ];
    commuters.forEach(([o, x, z, r]) => { const p = k.person(o); k.at(p, x, 0, z, r); api.add(p); });

    // a few plants / exit-arrow sign on the right wall
    const way = k.sign("WAY OUT →", { height: 0.35, bg: "#f4c430", ink: "#111", font: "Figtree, Arial, sans-serif" });
    k.at(way, 11.5, 5.2, -6.9); api.add(way);
  },

  update(api, st) {
    const open = !!st.open;
    api.trainDoors.forEach(d => { d.position.x = open ? d.userData.open : d.userData.home; });
    api.trainGlows.forEach(g => { g.visible = open; });
    api.trainClosed.visible = !open;
    api.trainOpen.forEach(o => { o.visible = open; });
    api.trainLight.intensity = open ? 6 : 0;
  },

  tick(api, t) {
    if (api.trainLight.intensity > 0) api.trainLight.intensity = 5 + Math.sin(t * 2) * 1.2;
    if (api.speakerEmoji) { const s = 0.65 + Math.max(0, Math.sin(t * 3)) * 0.08; api.speakerEmoji.scale.set(s, s, s); }
  },
};
