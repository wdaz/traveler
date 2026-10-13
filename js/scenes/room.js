// Hotel room 412: a cosy room on a hot sunny day, sun pouring in through a big window; bathroom on the left, door on the right.
// Spot ids (must match content.js): phone, aircon, window, shower, guide, bed, door
// Flags read in update(): fixed (air conditioning works: green light, "OK" sign), tookGuide (hides the city guide), st.open (door open + glow)

function planksTexture(THREE) {
  const c = document.createElement("canvas"); c.width = 256; c.height = 256;
  const g = c.getContext("2d");
  const cols = ["#b98a5a", "#c49464", "#ad7f52", "#bf8f5e"];
  for (let r = 0; r < 8; r++) {
    let x = -((r * 53) % 128);
    while (x < 256) { const w = 96 + ((r * 37 + x) % 64); g.fillStyle = cols[(r + Math.abs(x)) % 4]; g.fillRect(x, r * 32, w, 32); g.fillStyle = "rgba(60,35,15,0.5)"; g.fillRect(x, r * 32, 2, 32); x += w; }
    g.fillStyle = "rgba(60,35,15,0.45)"; g.fillRect(0, r * 32, 256, 2);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 4); t.anisotropy = 4;
  return t;
}

export default {
  sky: { top: "#e9b77a", bottom: "#f6d8a8" },
  groundColor: "#6a4a30",
  light: { sky: "#fff2dc", ground: "#8a6040", hemi: 1.2, sun: "#ffe2a8", sunIntensity: 1.5, sunPos: [6, 14, 9] },
  bounds: { minX: -9, maxX: 9, minZ: -3.3, maxZ: 4.5 },
  camera: [0, 5.5, 10],

  build(k, api) {
    const { THREE } = api;
    api.spawn = [-1.2, 1.6];
    const WALL = "#f4dfc0", WOOD = "#7a4a2a", DARK = "#4a2c18", WZ = -6;

    // ---- floor and walls (back wall built in pieces to leave a bathroom doorway on the left)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), new THREE.MeshLambertMaterial({ map: planksTexture(THREE) }));
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.01, 2); floor.receiveShadow = true; api.add(floor);
    const H = 5.2;
    const wl = k.box(1.6, H, 0.3, WALL); k.at(wl, -9.2, 0, WZ); api.add(wl);           // x -10 .. -8.4
    const wTop = k.box(2.2, H - 2.9, 0.3, WALL); k.at(wTop, -7.3, 2.9, WZ); api.add(wTop); // above doorway x -8.4 .. -6.2
    const wm = k.box(16.2, H, 0.3, WALL); k.at(wm, 1.9, 0, WZ); api.add(wm);             // x -6.2 .. 10
    [-1, 1].forEach(sx => { const sw = k.box(0.3, H, 14, WALL); k.at(sw, sx * 10, 0, 1); api.add(sw); });
    const skirting = k.box(16.2, 0.18, 0.06, "#fff8ec"); k.at(skirting, 1.9, 0, WZ + 0.17); api.add(skirting);
    const top = k.box(20.6, 0.2, 0.5, "#d9b48a"); k.at(top, 0, H, WZ); api.add(top);
    [-1, 1].forEach(sx => { const t2 = k.box(0.5, 0.2, 14, "#d9b48a"); k.at(t2, sx * 10, H, 1); api.add(t2); });
    // soft wallpaper stripes
    for (let x = -5.6; x < 10; x += 1.2) { if (x > 2.2 && x < 7.8) continue; const s = k.box(0.5, H - 0.4, 0.02, "#efd4b0"); k.at(s, x, 0.2, WZ + 0.16); s.castShadow = false; api.add(s); }
    // rug
    const rug = k.box(5.6, 0.02, 3.4, "#b0503a"); k.at(rug, -3.2, 0.01, -1.6); rug.castShadow = false; api.add(rug);
    const rugIn = k.box(5.0, 0.025, 2.8, "#d98a4a"); k.at(rugIn, -3.2, 0.01, -1.6); rugIn.castShadow = false; api.add(rugIn);

    // ---- bathroom behind the doorway (shower + towels)
    const sh = k.group();
    const tilesBack = k.box(3.6, 3.4, 0.2, "#bfe2ea"); k.at(tilesBack, 0, 0, -2.6); sh.add(tilesBack);
    [-1, 1].forEach(sx => { const t = k.box(0.2, 3.4, 2.6, "#bfe2ea"); k.at(t, sx * 1.8, 0, -1.3); sh.add(t); });
    for (let r = 1; r < 6; r++) { const ln = k.box(3.6, 0.03, 0.02, "#ffffff"); k.at(ln, 0, r * 0.55, -2.49); ln.castShadow = false; sh.add(ln); }
    for (let c = -3; c <= 3; c++) { const ln = k.box(0.03, 3.4, 0.02, "#ffffff"); k.at(ln, c * 0.5, 0, -2.49); ln.castShadow = false; sh.add(ln); }
    const tray = k.box(1.4, 0.15, 1.4, "#ffffff"); k.at(tray, 0.5, 0, -1.8); sh.add(tray);
    const pipe = k.cylinder(0.03, 0.03, 2.2, "#c8ccd2", 6); k.at(pipe, 0.5, 0, -2.45); sh.add(pipe);
    const head = k.cylinder(0.18, 0.1, 0.1, "#c8ccd2", 10); k.at(head, 0.5, 2.2, -2.3); head.rotation.x = 0.5; sh.add(head);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.1, 1.4), new THREE.MeshLambertMaterial({ color: "#d8f4ff", transparent: true, opacity: 0.45 }));
    glass.position.set(-0.22, 1.2, -1.8); sh.add(glass);
    // towel rail + towels
    const railT = k.box(0.05, 0.05, 1.2, "#c8ccd2"); k.at(railT, -1.65, 1.5, -1.0); sh.add(railT);
    ["#ffffff", "#9fd0e0"].forEach((c, i) => { const tw = k.box(0.08, 0.8, 0.5, c); k.at(tw, -1.62, 0.75, -1.3 + i * 0.6); sh.add(tw); });
    const shelf = k.box(0.6, 0.06, 0.6, "#ffffff"); k.at(shelf, -1.2, 0.9, -2.1); sh.add(shelf);
    [0, 1, 2].forEach(i => { const ft = k.box(0.5, 0.14, 0.45, i % 2 ? "#9fd0e0" : "#ffffff"); k.at(ft, -1.2, 0.96 + i * 0.15, -2.1); sh.add(ft); });
    // door frame + sign
    [-1.15, 1.15].forEach(x => { const f = k.box(0.14, 2.95, 0.4, WOOD); k.at(f, x, 0, 0); sh.add(f); });
    const lint = k.box(2.44, 0.14, 0.4, WOOD); k.at(lint, 0, 2.9, 0); sh.add(lint);
    const shSign = k.sign("SHOWER · CLEAN TOWELS", { height: 0.32, bg: "#ffffff", ink: "#1f5a6a", font: "Figtree, Arial, sans-serif" }); shSign.position.set(0, 3.45, 0.2); sh.add(shSign);
    const bLight = new THREE.PointLight("#e8f8ff", 2.5, 5); bLight.position.set(0, 2.6, -1.3); sh.add(bLight);
    k.at(sh, -7.3, 0, WZ);
    api.spot("shower", sh, { walkTo: [-7.3, -3.2], height: 3.4 });

    // ---- bedside table with the telephone
    const nt = k.group();
    const ntb = k.box(0.9, 0.7, 0.7, WOOD); nt.add(ntb);
    const drawer = k.box(0.7, 0.22, 0.03, DARK); k.at(drawer, 0, 0.38, 0.36); nt.add(drawer);
    const base = k.box(0.42, 0.14, 0.32, "#c0392b"); k.at(base, 0, 0.7, 0.02); nt.add(base);
    const handset = k.group(k.box(0.44, 0.06, 0.09, "#c0392b"));
    [-0.19, 0.19].forEach(x => { const e = k.box(0.1, 0.08, 0.13, "#a8302a"); k.at(e, x, -0.03, 0); handset.add(e); });
    k.at(handset, 0, 0.88, -0.04); nt.add(handset);
    const keypad = k.box(0.22, 0.02, 0.1, "#f4f0e8"); k.at(keypad, 0, 0.84, 0.13); keypad.rotation.x = 0.3; nt.add(keypad);
    const cord = k.box(0.03, 0.03, 0.2, "#222"); k.at(cord, 0.26, 0.74, 0.0); nt.add(cord);
    const plate = k.sign("RECEPTION · 0", { height: 0.26, bg: "#fffaf0", ink: "#3a2a1a", font: "Figtree, Arial, sans-serif" }); plate.position.set(0, 1.45, -0.32); nt.add(plate);
    k.at(nt, -5.4, 0, WZ + 0.6);
    nt.userData.height = 1.1;
    api.spot("phone", nt, { walkTo: [-5.4, -3.2], height: 1.4 });

    // ---- double bed
    const BX = -3.0;
    const bed = k.group();
    const headb = k.box(2.8, 1.5, 0.15, DARK); k.at(headb, 0, 0, -0.08); bed.add(headb);
    const hbPad = k.box(2.5, 0.8, 0.06, "#c98a5a"); k.at(hbPad, 0, 0.6, 0.02); bed.add(hbPad);
    const frame = k.box(2.6, 0.35, 3.0, WOOD); k.at(frame, 0, 0, 1.55); bed.add(frame);
    const mat = k.box(2.5, 0.25, 2.9, "#ffffff"); k.at(mat, 0, 0.35, 1.55); bed.add(mat);
    const duvet = k.box(2.56, 0.12, 2.0, "#3f7fa8"); k.at(duvet, 0, 0.58, 2.05); bed.add(duvet);
    const fold = k.box(2.58, 0.14, 0.35, "#f4f0e8"); k.at(fold, 0, 0.6, 1.05); bed.add(fold);
    const runner2 = k.box(2.6, 0.13, 0.5, "#d9a03a"); k.at(runner2, 0, 0.62, 2.55); bed.add(runner2);
    [-0.6, 0.6].forEach(x => { const p = k.box(0.95, 0.22, 0.45, "#fffaf2"); k.at(p, x, 0.6, 0.4); p.rotation.x = -0.25; bed.add(p); });
    const towelSwan = k.box(0.5, 0.12, 0.35, "#ffffff"); k.at(towelSwan, 0.5, 0.72, 2.3); bed.add(towelSwan);
    const bedSign = k.sign("ROOM 412", { height: 0.4, bg: "#3a2416", ink: "#f3d27a" }); bedSign.position.set(0, 2.15, 0.02); bed.add(bedSign);
    k.at(bed, BX, 0, WZ + 0.25);
    bed.userData.height = 1.2;
    api.spot("bed", bed, { walkTo: [BX + 0.2, -2.3], height: 2.6 });
    // a little reading lamp on the right of the bed
    const lampT = k.group(k.box(0.7, 0.6, 0.6, WOOD));
    const lpole = k.cylinder(0.03, 0.05, 0.5, "#d4a93a", 6); k.at(lpole, 0, 0.6, 0); lampT.add(lpole);
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 0.3, 10, 1, true), new THREE.MeshBasicMaterial({ color: "#ffe9b8", side: THREE.DoubleSide })); shade.position.y = 1.2; lampT.add(shade);
    k.at(lampT, -0.95, 0, WZ + 0.55); api.add(lampT);
    // open suitcase on the floor by the bed
    const sc = k.group(k.box(1.0, 0.25, 0.65, "#2e86de"));
    const lid = k.box(1.0, 0.65, 0.06, "#2e86de"); k.at(lid, 0, 0.2, -0.33); lid.rotation.x = -0.3; sc.add(lid);
    [["#ffffff", -0.25], ["#e8573f", 0.15], ["#f2c230", 0.35]].forEach(([c, x]) => { const cl = k.box(0.3, 0.06, 0.4, c); k.at(cl, x, 0.25, 0); sc.add(cl); });
    k.at(sc, -6.4, 0, -1.6, 0.3); api.add(sc);

    // ---- air conditioning unit (broken) above the desk
    const AX = 0.9;
    const ac = k.group();
    const unit = k.box(2.2, 0.7, 0.4, "#f8f8f4"); ac.add(unit);
    for (let i = 0; i < 6; i++) { const slot = k.box(1.9, 0.03, 0.02, "#b8bcc2"); k.at(slot, 0, 0.08 + i * 0.04, 0.21); slot.castShadow = false; ac.add(slot); }
    const vent = k.box(2.0, 0.08, 0.1, "#d8dce0"); k.at(vent, 0, 0.0, 0.2); vent.rotation.x = 0.5; ac.add(vent);
    const statusLight = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshBasicMaterial({ color: "#ff3a2a" }));
    statusLight.position.set(0.9, 0.55, 0.22); ac.add(statusLight);
    const acBroken = k.sign("AIR CONDITIONING · BROKEN", { height: 0.26, bg: "#fff1e8", ink: "#b02a1a", font: "Figtree, Arial, sans-serif" }); acBroken.position.set(0, -0.3, 0.05); ac.add(acBroken);
    const acOk = k.sign("AIR CONDITIONING · OK", { height: 0.26, bg: "#eaf8ec", ink: "#1f7a3a", font: "Figtree, Arial, sans-serif" }); acOk.position.set(0, -0.3, 0.05); ac.add(acOk);
    // cool air puffs when fixed
    const puffs = [0, 1, 2].map(i => { const p = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: "#cfefff", transparent: true, opacity: 0.6 })); p.position.set(-0.6 + i * 0.6, -0.1, 0.4); p.userData.x0 = p.position.x; ac.add(p); return p; });
    k.at(ac, AX, 3.6, WZ + 0.35);
    ac.userData.height = 4.4;
    api.spot("aircon", ac, { walkTo: [AX, -3.2], height: 4.4 });
    api.ac = { light: statusLight, broken: acBroken, ok: acOk, puffs };
    // thermometer showing the heat
    const thermo = k.screen("32°C", { width: 0.55, bg: "#2a1a12", ink: "#ff8a3a", px: 40 }); thermo.position.set(-0.6, 2.4, WZ + 0.17); api.add(thermo);

    // ---- desk with the city guide
    const desk = k.group();
    const dtop = k.box(2.6, 0.08, 0.9, WOOD); k.at(dtop, 0, 0.82, 0); desk.add(dtop);
    [-1.2, 1.2].forEach(x => { const leg = k.box(0.1, 0.82, 0.8, DARK); k.at(leg, x, 0, 0); desk.add(leg); });
    const chair = k.group(k.box(0.55, 0.06, 0.55, "#c0392b")); chair.children[0].position.y = 0.5;
    [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]].forEach(([x, z]) => { const l = k.box(0.05, 0.5, 0.05, DARK); k.at(l, x, 0, z); chair.add(l); });
    const cback = k.box(0.55, 0.6, 0.06, "#c0392b"); k.at(cback, 0, 0.53, 0.25); chair.add(cback);
    k.at(chair, 1.75, 0, 0.5); chair.rotation.y = -0.6; desk.add(chair);
    const dlamp = k.cylinder(0.04, 0.12, 0.45, "#d4a93a", 6); k.at(dlamp, 1.0, 0.86, -0.2); desk.add(dlamp);
    const dshade = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.22, 10, 1, true), new THREE.MeshBasicMaterial({ color: "#ffe9b8", side: THREE.DoubleSide })); dshade.position.set(1.0, 1.42, -0.2); desk.add(dshade);
    const bottle = k.cylinder(0.06, 0.06, 0.3, "#7ac8e8", 8); k.at(bottle, -1.0, 0.86, -0.2); desk.add(bottle);
    k.at(desk, AX, 0, WZ + 0.75); api.add(desk);
    const guide = k.group();
    const book = k.box(0.42, 0.06, 0.56, "#2a9d8f"); guide.add(book);
    const cover = k.box(0.3, 0.005, 0.2, "#f2c230"); k.at(cover, 0, 0.06, -0.08); guide.add(cover);
    const tower = k.box(0.05, 0.005, 0.18, "#e8573f"); k.at(tower, 0, 0.066, 0.12); guide.add(tower);
    const gSign = k.sign("CITY GUIDE", { height: 0.28, bg: "#fffaf0", ink: "#1f5a50", font: "Figtree, Arial, sans-serif" }); gSign.position.set(0, -0.2, 0.47); guide.add(gSign);
    k.at(guide, AX + 0.2, 0.86, WZ + 0.8); guide.rotation.y = -0.15;
    guide.userData.height = 1.1;
    api.spot("guide", guide, { walkTo: [AX + 0.9, -3.0], height: 1.4 });
    api.guide = guide;

    // ---- big sunny window with a city view
    const WX = 5.0;
    const win = k.group();
    const view = k.group();
    const skyC = document.createElement("canvas"); skyC.width = 4; skyC.height = 128;
    const sg = skyC.getContext("2d"), grd = sg.createLinearGradient(0, 0, 0, 128); grd.addColorStop(0, "#5fb8f0"); grd.addColorStop(1, "#d8f0ff"); sg.fillStyle = grd; sg.fillRect(0, 0, 4, 128);
    const skyT = new THREE.CanvasTexture(skyC); skyT.colorSpace = THREE.SRGBColorSpace;
    const skyP = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.0), new THREE.MeshBasicMaterial({ map: skyT })); skyP.position.set(0, 1.5, 0); view.add(skyP);
    const sun = new THREE.Mesh(new THREE.CircleGeometry(0.28, 16), new THREE.MeshBasicMaterial({ color: "#fff3a0" })); sun.position.set(1.2, 2.4, 0.01); view.add(sun);
    const bcols = ["#e8b88a", "#d98a6a", "#f2d6a8", "#c9a07a", "#e0c8a0", "#b8846a", "#f0c090"];
    [[-1.5, 0.6, 1.4], [-0.9, 0.5, 2.1], [-0.35, 0.6, 1.2], [0.25, 0.55, 1.7], [0.8, 0.5, 1.0], [1.35, 0.6, 1.9]].forEach(([x, w, h], i) => {
      const b = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: bcols[i % bcols.length] })); b.position.set(x, h / 2, 0.02); view.add(b);
      for (let r = 0; r < Math.floor(h / 0.3); r++) for (let c = 0; c < 2; c++) {
        const wd = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.13), new THREE.MeshBasicMaterial({ color: (r + c + i) % 3 ? "#7aa8c8" : "#fff2c0" }));
        wd.position.set(x - w / 4 + c * w / 2, 0.25 + r * 0.3, 0.03); view.add(wd);
      }
    });
    // clock tower in the distance
    const ct = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 2.5), new THREE.MeshBasicMaterial({ color: "#c08a5a" })); ct.position.set(-0.6, 1.25, 0.015); view.add(ct);
    const ctr = new THREE.Mesh(new THREE.CircleGeometry(0.2, 3), new THREE.MeshBasicMaterial({ color: "#8a4a3a" })); ctr.position.set(-0.6, 2.6, 0.016); ctr.rotation.z = Math.PI / 2; view.add(ctr);
    const ctc = new THREE.Mesh(new THREE.CircleGeometry(0.1, 12), new THREE.MeshBasicMaterial({ color: "#ffffff" })); ctc.position.set(-0.6, 2.25, 0.02); view.add(ctc);
    k.at(view, 0, 1.0, 0.2); win.add(view);
    // frame: sill, sides, cross bars
    const sill = k.box(4.2, 0.15, 0.5, "#ffffff"); k.at(sill, 0, 0.85, 0.25); win.add(sill);
    const wtop = k.box(4.0, 0.15, 0.25, "#ffffff"); k.at(wtop, 0, 3.95, 0.18); win.add(wtop);
    [-1.92, 0, 1.92].forEach(x => { const s = k.box(0.15, 3.0, 0.25, "#ffffff"); k.at(s, x, 1.0, 0.18); win.add(s); });
    const cross = k.box(3.9, 0.1, 0.22, "#ffffff"); k.at(cross, 0, 2.6, 0.18); win.add(cross);
    // curtains
    [-1, 1].forEach(sx => { const cu = k.box(0.7, 3.8, 0.12, "#e8a040"); k.at(cu, sx * 2.35, 0.5, 0.3); win.add(cu); });
    const rod = k.box(5.6, 0.07, 0.07, "#d4a93a"); k.at(rod, 0, 4.35, 0.3); win.add(rod);
    const wSign = k.sign("WINDOW", { height: 0.32, bg: "#fffaf0", ink: "#3a2a1a", font: "Figtree, Arial, sans-serif" }); wSign.position.set(0, 4.65, 0.2); win.add(wSign);
    const pot = k.plant({ scale: 0.6, pot: "#e8573f" }); k.at(pot, -1.3, 0.92, 0.25); win.add(pot);
    k.at(win, WX, 0, WZ);
    win.userData.height = 4.2;
    api.spot("window", win, { walkTo: [WX, -3.0], height: 4.6 });
    // sunlight pouring in: a warm patch on the floor + a light
    const patch = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 4.5), new THREE.MeshBasicMaterial({ color: "#ffe6a0", transparent: true, opacity: 0.35, depthWrite: false }));
    patch.rotation.x = -Math.PI / 2; patch.position.set(WX - 0.6, 0.03, -3.2); api.add(patch);
    const sunIn = new THREE.PointLight("#ffd890", 5, 12); sunIn.position.set(WX, 3, -4.5); api.add(sunIn);
    // armchair by the window
    const arm = k.group(k.box(1.0, 0.45, 0.9, "#4a8a7a")); const ab = k.box(1.0, 0.65, 0.2, "#4a8a7a"); k.at(ab, 0, 0.45, -0.35); arm.add(ab);
    [-0.5, 0.5].forEach(x => { const a = k.box(0.15, 0.65, 0.9, "#3a7062"); k.at(a, x, 0, 0); arm.add(a); });
    k.at(arm, 9.1, 0, -0.6, -1.0); api.add(arm);

    // ---- the room door (exit) on the right
    const DX = 8.6;
    const door = k.group();
    [-0.85, 0.85].forEach(x => { const f = k.box(0.16, 3.0, 0.4, "#fffaf0"); k.at(f, x, 0, 0); door.add(f); });
    const dl = k.box(1.86, 0.16, 0.4, "#fffaf0"); k.at(dl, 0, 2.95, 0); door.add(dl);
    const hall = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 2.95), k.mat("#3a2a20")); hall.position.set(0, 1.47, 0.16); door.add(hall);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.9), new THREE.MeshBasicMaterial({ color: "#fff3c4" })); glow.position.set(0, 1.47, 0.17); door.add(glow);
    const hinge = new THREE.Group(); hinge.position.set(-0.77, 0, 0.2); door.add(hinge);
    const panel = k.box(1.54, 2.92, 0.08, "#8a5232"); k.at(panel, 0.77, 0, 0); hinge.add(panel);
    [[0.77, 2.0], [0.77, 0.8]].forEach(([x, y]) => { const pn = k.box(1.1, 0.9, 0.04, "#7a4428"); k.at(pn, x, y - 0.45, 0.05); hinge.add(pn); });
    const knob = k.sphere(0.07, "#d4a93a", 8); knob.position.set(1.35, 1.25, 0.1); hinge.add(knob);
    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.04), new THREE.MeshBasicMaterial({ color: "#ff3a2a" })); lock.position.set(1.35, 1.5, 0.08); hinge.add(lock);
    const num = k.sign("412", { height: 0.2, bg: "#d4a93a", ink: "#2a1a12" }); num.position.set(0.77, 2.3, 0.1); hinge.add(num);
    const dSign = k.sign("DOOR", { height: 0.34, bg: "#fffaf0", ink: "#3a2a1a", font: "Figtree, Arial, sans-serif" }); dSign.position.set(0, 3.4, 0.21); door.add(dSign);
    const spark = k.emoji("✨", 0.8); spark.position.set(0, 1.9, 0.8); door.add(spark);
    const light = new THREE.PointLight("#ffe9a8", 0, 8); light.position.set(0, 2, 1.2); door.add(light);
    const dnd = k.sign("CLOSED", { height: 0.24, bg: "#fffaf0", ink: "#a8323a", font: "Figtree, Arial, sans-serif" }); dnd.position.set(0.77, 1.75, 0.08); hinge.add(dnd);
    k.at(door, DX, 0, WZ + 0.05);
    door.userData.height = 3.2;
    api.spot("door", door, { walkTo: [DX - 0.2, -3.0], height: 3.4 });
    api.door = { hinge, glow, spark, light, lock, closed: dnd };

    // ---- extra decoration
    const plantR = k.plant({ scale: 1.2, pot: "#f4f0e8" }); k.at(plantR, 9.3, 0, 1.6); api.add(plantR);
    const wardrobe = k.box(0.9, 3.0, 2.2, WOOD); k.at(wardrobe, -9.4, 0, -2.2); api.add(wardrobe);
    [-0.12, 0.12].forEach(x => { const s = k.box(0.12, 0.05, 0.3, "#ffffff"); k.at(s, -1.5 + x, 0, -1.2); api.add(s); });
    const fan = k.group(k.cylinder(0.2, 0.25, 0.05, "#e8e8e8", 10)); const fp = k.cylinder(0.03, 0.03, 1.1, "#e8e8e8", 6); fan.add(fp);
    const fh = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 6, 16), k.mat("#e8e8e8")); fh.position.set(0, 1.35, 0); fan.add(fh);
    const blades = k.group(); [0, 1, 2].forEach(i => { const b = k.box(0.5, 0.12, 0.02, "#7ac8e8"); b.position.y = 0; b.rotation.z = i * Math.PI / 3; blades.add(b); });
    blades.position.set(0, 1.35, 0.02); fan.add(blades);
    k.at(fan, 3.9, 0, -4.4, -0.3); api.add(fan); api.fanBlades = blades;
  },

  update(api, st) {
    const open = !!st.open, fixed = st.has("fixed");
    if (api.guide) api.guide.visible = !st.has("tookGuide");
    if (api.ac) {
      api.ac.light.material.color.set(fixed ? "#2ee06a" : "#ff3a2a");
      api.ac.broken.visible = !fixed; api.ac.ok.visible = fixed;
      api.ac.puffs.forEach(p => { p.visible = fixed; });
    }
    if (api.door) {
      api.door.hinge.rotation.y = open ? -1.25 : 0;
      api.door.glow.visible = open; api.door.spark.visible = open;
      api.door.light.intensity = open ? 6 : 0;
      api.door.lock.material.color.set(open ? "#2ee06a" : "#ff3a2a");
      api.door.closed.visible = !open;
    }
  },

  tick(api, t, dt) {
    if (api.door && api.door.light.intensity > 0) api.door.light.intensity = 5 + Math.sin(t * 2) * 1.2;
    if (api.fanBlades) api.fanBlades.rotation.z += dt * 9;
    if (api.ac && api.ac.ok.visible) api.ac.puffs.forEach((p, i) => { const f = (t * 0.6 + i / 3) % 1; p.position.y = -0.1 - f * 0.9; p.material.opacity = 0.6 * (1 - f); });
  },
};
