// City main square: a sunny European square with old houses, a clock tower, café tables, a fountain, a ticket kiosk and a metro entrance.
// Spot ids (must match content.js): seller, prices, mapboard, tourist, fountain, metro
// Flags read in update(): st.open (metro gate removed, entrance glows)

// A painted house front: wall colour, rows of shuttered windows, a shop/door on the ground floor.
function facadeTexture(THREE, { wall, shutter, w, h, shop }) {
  const c = document.createElement("canvas"), S = 48; c.width = Math.round(w * S); c.height = Math.round(h * S);
  const g = c.getContext("2d");
  g.fillStyle = wall; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = "rgba(0,0,0,0.08)"; g.fillRect(0, c.height - 1.6 * S, c.width, 1.6 * S);
  g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(0, c.height - 1.75 * S, c.width, 0.12 * S);
  const cols = Math.max(2, Math.floor(w / 1.4)), gap = c.width / cols;
  for (let fl = 0; fl < Math.floor((h - 2) / 1.6); fl++) {
    const y = c.height - (2.3 + fl * 1.6) * S - 0.95 * S;
    for (let i = 0; i < cols; i++) {
      const x = gap * (i + 0.5) - 0.3 * S;
      g.fillStyle = "#f8f4ea"; g.fillRect(x - 4, y - 4, 0.6 * S + 8, 0.95 * S + 8);
      g.fillStyle = (fl + i) % 4 === 1 ? "#ffe9a8" : "#5a7f9a"; g.fillRect(x, y, 0.6 * S, 0.95 * S);
      g.fillStyle = "#f8f4ea"; g.fillRect(x + 0.28 * S, y, 3, 0.95 * S);
      g.fillStyle = shutter; g.fillRect(x - 0.28 * S, y - 2, 0.24 * S, 0.95 * S + 4); g.fillRect(x + 0.64 * S, y - 2, 0.24 * S, 0.95 * S + 4);
      g.fillStyle = "#f8f4ea"; g.fillRect(x - 6, y + 0.95 * S + 4, 0.6 * S + 12, 6);
    }
  }
  // ground floor: door + shop window
  g.fillStyle = "#4a2c18"; g.fillRect(c.width * 0.15, c.height - 1.45 * S, 0.7 * S, 1.45 * S);
  if (shop) { g.fillStyle = "#3a5a6a"; g.fillRect(c.width * 0.45, c.height - 1.3 * S, c.width * 0.45, 1.0 * S); g.fillStyle = "#ffe9a8"; g.fillRect(c.width * 0.47, c.height - 1.25 * S, c.width * 0.41, 0.15 * S); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

function mapTexture(THREE) {
  const c = document.createElement("canvas"); c.width = 320; c.height = 220;
  const g = c.getContext("2d");
  g.fillStyle = "#f4ecd8"; g.fillRect(0, 0, 320, 220);
  g.fillStyle = "#9fd08a"; g.fillRect(200, 20, 90, 60);                 // park
  g.fillStyle = "#8ac4e8"; g.fillRect(0, 170, 320, 22);                 // river
  g.fillStyle = "#d9c8a8"; [[30, 30, 50, 40], [110, 30, 60, 40], [30, 110, 50, 40], [200, 110, 90, 40], [110, 110, 60, 40]].forEach(r => g.fillRect(...r));
  g.fillStyle = "#ffffff";
  g.fillRect(0, 82, 320, 18); g.fillRect(90, 0, 16, 220); g.fillRect(180, 0, 14, 170); g.fillRect(0, 150, 320, 12);
  g.fillStyle = "#e8c45a"; g.beginPath(); g.arc(98, 91, 14, 0, Math.PI * 2); g.fill();  // the square
  g.fillStyle = "#1f5aa8"; g.font = "bold 22px Arial"; g.fillText("M", 228, 103);
  g.fillStyle = "#e23a2a"; g.beginPath(); g.arc(98, 91, 9, 0, Math.PI * 2); g.fill();
  g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.stroke();
  g.strokeStyle = "#3a2a1a"; g.lineWidth = 6; g.strokeRect(3, 3, 314, 214);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

export default {
  sky: { top: "#4fa8e8", bottom: "#cdeaff" },
  fog: { color: "#d8ecf8", near: 30, far: 70 },
  groundColor: "#cdbb98",
  light: { sky: "#f4fbff", ground: "#8a7a60", hemi: 1.15, sun: "#fff4dc", sunIntensity: 1.8, sunPos: [-8, 16, 10] },
  bounds: { minX: -11, maxX: 11, minZ: -3.5, maxZ: 5 },
  camera: [0, 5.5, 10],

  build(k, api) {
    const { THREE } = api;
    api.spawn = [-8, 3];

    // ---- paving: a lighter cobbled square in front of the houses
    const pave = k.box(40, 0.04, 24, "#ddd0b4"); k.at(pave, 0, 0, 4); pave.castShadow = false; api.add(pave);
    for (let i = -9; i <= 9; i++) { const ln = k.box(0.06, 0.045, 24, "#c8b894"); k.at(ln, i * 2.2, 0, 4); ln.castShadow = false; api.add(ln); }
    const ring = new THREE.Mesh(new THREE.RingGeometry(2.4, 3.0, 28), k.mat("#c0ae8a")); ring.rotation.x = -Math.PI / 2; ring.position.set(0.8, 0.05, -2.5); api.add(ring);
    const kerb = k.box(40, 0.18, 0.4, "#b8aa90"); k.at(kerb, 0, 0, -6.3); api.add(kerb);

    // ---- house fronts along the back
    const houses = [
      [-17, 5, 6.4, "#e8b07a", "#3a7a5a"], [-12.2, 4.4, 7.2, "#f2d6a2", "#2f5a8a", true], [-7.6, 4.6, 6.6, "#d9826a", "#f4e6c8", true],
      [-3.2, 4.0, 7.4, "#f4e8d0", "#8a3a2a"], [6.2, 4.6, 6.8, "#a8c8d8", "#f4e6c8", true], [10.8, 4.4, 7.4, "#f0c070", "#3a7a5a"], [15.4, 4.6, 6.4, "#e89a8a", "#2f5a8a", true], [20, 4.4, 7, "#d8c8a8", "#8a3a2a"],
    ];
    houses.forEach(([x, w, h, wall, shutter, shop]) => {
      const b = k.box(w, h, 4, wall); k.at(b, x, 0, -9); b.castShadow = false; api.add(b);
      const f = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: facadeTexture(THREE, { wall, shutter, w, h, shop }) }));
      f.position.set(x, h / 2, -6.99); api.add(f);
      const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 2.6, 1.6, 4, 1), k.mat("#b0503a")); roof.rotation.y = Math.PI / 4; roof.scale.set(w / 3.6, 1, 1.1); roof.position.set(x, h + 0.8, -9); api.add(roof);
      const cornice = k.box(w + 0.2, 0.2, 0.3, "#f8f4ea"); k.at(cornice, x, h - 0.2, -6.9); cornice.castShadow = false; api.add(cornice);
      if (shop) { const aw = k.box(w * 0.55, 0.08, 0.9, shutter); aw.rotation.x = 0.3; k.at(aw, x + w * 0.17, 1.95, -6.6); aw.rotation.x = 0.3; aw.castShadow = false; api.add(aw); }
    });
    // clock tower (between the houses, behind the fountain)
    const tw = k.box(3.2, 11, 3.2, "#d8b48a"); k.at(tw, 1.4, 0, -9.2); tw.castShadow = false; api.add(tw);
    const twBand = k.box(3.5, 0.3, 3.5, "#f4e8d0"); k.at(twBand, 1.4, 4.0, -9.2); api.add(twBand);
    const twDoor = k.archSlab(1.2, 2.2, 0.1, "#5a3420"); k.at(twDoor, 1.4, 0, -7.55); api.add(twDoor);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.95, 24), k.mat("#fffaf0")); face.position.set(1.4, 5.6, -7.57); api.add(face);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.09, 6, 24), k.mat("#c9a03a")); rim.position.set(1.4, 5.6, -7.55); api.add(rim);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, tk = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.02), k.mat("#2a2a2a")); tk.position.set(1.4 + Math.sin(a) * 0.8, 5.6 + Math.cos(a) * 0.8, -7.55); tk.rotation.z = -a; api.add(tk); }
    const hourH = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.02), k.mat("#1a1a1a")); hourH.geometry.translate(0, 0.2, 0); hourH.position.set(1.4, 5.6, -7.53); hourH.rotation.z = -1.0; api.add(hourH);
    const minH = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.7, 0.02), k.mat("#1a1a1a")); minH.geometry.translate(0, 0.32, 0); minH.position.set(1.4, 5.6, -7.52); api.add(minH);
    api.clockHands = [hourH, minH];
    const belfry = k.box(3.2, 0.9, 3.2, "#c09a70"); k.at(belfry, 1.4, 7.0, -9.2); api.add(belfry);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(2.4, 3, 4), k.mat("#3a6a7a")); spire.rotation.y = Math.PI / 4; spire.position.set(1.4, 12.5, -9.2); api.add(spire);

    // ---- trees, lamps, benches, café
    [[-10.8, -4.8], [12.0, -4.6], [-13.5, 0.5]].forEach(([x, z]) => { const t = k.tree({ scale: 1.15 }); k.at(t, x, 0, z); api.add(t); });
    [[-4.6, -4.8], [2.9, -5.6], [8.0, -5.2], [-12.4, -1.2]].forEach(([x, z]) => { const l = k.lamp({ height: 3.4 }); k.at(l, x, 0, z); api.add(l); });
    const bn = k.bench({ width: 2, color: "#3a6a4a" }); k.at(bn, -1.3, 0, -5.4); api.add(bn);
    // café: tables with red/white umbrellas in front of the left houses
    [[-9.4, -4.0], [-7.4, -4.6]].forEach(([x, z], i) => {
      const t = k.group(k.cylinder(0.45, 0.45, 0.05, "#ffffff", 12)); t.children[0].position.y = 0.75;
      const leg = k.cylinder(0.04, 0.2, 0.75, "#333", 6); t.add(leg);
      const pole = k.cylinder(0.03, 0.03, 2.4, "#ffffff", 6); t.add(pole);
      const umb = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.5, 8), k.mat(i ? "#2f6aa8" : "#d94a3a")); umb.position.y = 2.45; umb.castShadow = true; t.add(umb);
      const cup = k.cylinder(0.06, 0.05, 0.1, "#ffffff", 6); k.at(cup, 0.15, 0.8, 0.1); t.add(cup);
      [[-0.75, 0], [0.75, 0]].forEach(([cx]) => { const ch = k.group(k.box(0.4, 0.05, 0.4, "#2a2a2a")); ch.children[0].position.y = 0.45; const cb = k.box(0.4, 0.45, 0.04, "#2a2a2a"); k.at(cb, 0, 0.45, cx < 0 ? -0.18 : 0.18); ch.add(cb); ch.rotation.y = Math.PI / 2; k.at(ch, cx, 0, 0); ch.rotation.y = cx < 0 ? -Math.PI / 2 : Math.PI / 2; t.add(ch); });
      k.at(t, x, 0, z); api.add(t);
    });
    const cafeSign = k.sign("CAFÉ", { height: 0.4, bg: "#2f5a8a", ink: "#ffffff" }); cafeSign.position.set(-11.2, 2.4, -6.95); api.add(cafeSign);
    const diner = k.person({ sit: true, top: "#e8a0b8", bottom: "#3a3a5a", hairStyle: "long", hair: "#c89a5a", scale: 0.95 }); k.at(diner, -10.1, 0, -4.0, Math.PI / 2); api.add(diner);
    const walker = k.person({ top: "#5a9a6a", bottom: "#4a4a5a", hair: "#2a1a10", prop: "bag", propColor: "#f2c230", scale: 0.95 }); k.at(walker, 13.2, 0, -5.8, -0.6); api.add(walker);

    // ---- city map board
    const mb = k.group();
    [-0.85, 0.85].forEach(x => { const p = k.box(0.1, 2.3, 0.1, "#2d3436"); k.at(p, x, 0, 0); mb.add(p); });
    const frame = k.box(1.9, 1.35, 0.1, "#2d3436"); k.at(frame, 0, 0.85, 0); mb.add(frame);
    const map = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 1.2), new THREE.MeshBasicMaterial({ map: mapTexture(THREE) })); map.position.set(0, 1.52, 0.06); mb.add(map);
    const mSign = k.sign("CITY MAP · YOU ARE HERE", { height: 0.24, bg: "#1f5aa8", ink: "#ffffff", font: "Figtree, Arial, sans-serif" }); mSign.position.set(0, 2.42, 0.06); mb.add(mSign);
    k.at(mb, -5.6, 0, -2.0, 0.15);
    mb.userData.height = 2.6;
    api.spot("mapboard", mb, { walkTo: [-5.4, -0.4], height: 2.8 });

    // ---- the lost tourist (cap, backpack, phone), looking around
    const tourist = k.person({ top: "#f2c230", bottom: "#4a7aa8", hat: "cap", hatColor: "#e8573f", hair: "#c8a060", skin: "#f0c8a0", prop: "phone" });
    const bp = k.box(0.4, 0.5, 0.22, "#2a9d8f"); k.at(bp, 0, 0.88, -0.24); tourist.add(bp);
    const cam = k.box(0.16, 0.1, 0.08, "#222"); k.at(cam, -0.15, 1.05, 0.15); tourist.add(cam);
    const q = k.emoji("❓", 0.45); q.position.set(0.25, 2.25, 0); tourist.add(q); api.question = q;
    k.at(tourist, -2.8, 0, -1.8, 0.35);
    api.spot("tourist", tourist, { walkTo: [-2.6, -0.3], height: 2.4 });
    api.tourist = tourist;

    // ---- fountain
    const fo = k.group();
    const basin = k.cylinder(1.8, 1.9, 0.6, "#d8ccb4", 20); fo.add(basin);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.12, 6, 24), k.mat("#ece2cc")); lip.rotation.x = Math.PI / 2; lip.position.y = 0.6; fo.add(lip);
    const water = new THREE.Mesh(new THREE.CircleGeometry(1.7, 24), new THREE.MeshLambertMaterial({ color: "#5ab8e0", transparent: true, opacity: 0.9 })); water.rotation.x = -Math.PI / 2; water.position.y = 0.52; fo.add(water);
    const col = k.cylinder(0.22, 0.32, 1.5, "#d8ccb4", 10); k.at(col, 0, 0.5, 0); fo.add(col);
    const bowl = k.cylinder(0.75, 0.25, 0.3, "#d8ccb4", 14); k.at(bowl, 0, 1.9, 0); fo.add(bowl);
    const bwater = new THREE.Mesh(new THREE.CircleGeometry(0.68, 16), k.mat("#6ac4ea")); bwater.rotation.x = -Math.PI / 2; bwater.position.y = 2.21; fo.add(bwater);
    const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 0.9, 8), new THREE.MeshBasicMaterial({ color: "#d8f4ff", transparent: true, opacity: 0.8 })); jet.position.y = 2.6; fo.add(jet);
    const top = k.sphere(0.13, "#d8ccb4", 8); top.position.y = 3.05; fo.add(top);
    const drops = [];
    for (let i = 0; i < 8; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), new THREE.MeshBasicMaterial({ color: "#d8f4ff" })); d.userData.a = i / 8 * Math.PI * 2; fo.add(d); drops.push(d); }
    api.drops = drops;
    const fSign = k.sign("FOUNTAIN", { height: 0.28, bg: "#f4ecd8", ink: "#2a3a4a" }); fSign.position.set(0, 0.33, 1.92); fo.add(fSign);
    k.at(fo, 0.8, 0, -2.5);
    fo.userData.height = 3.1;
    api.spot("fountain", fo, { walkTo: [0.8, -0.2], height: 3.3 });
    // pigeons around the fountain
    api.pigeons = [];
    [[-1.4, -0.9, 0.5], [-0.9, -0.5, -0.7], [3.0, -1.0, 2.6], [2.4, -0.4, -2.2], [-1.8, 0.2, 1.4]].forEach(([x, z, r]) => {
      const p = k.group();
      const body = k.sphere(0.13, "#8a8f9a", 6); body.scale.set(0.8, 0.75, 1.25); body.position.y = 0.14; p.add(body);
      const head = k.sphere(0.07, "#6a7080", 6); head.position.set(0, 0.26, 0.13); p.add(head);
      const neck = k.sphere(0.06, "#4a8a7a", 5); neck.position.set(0, 0.2, 0.09); p.add(neck);
      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 4), k.mat("#e8a040")); beak.rotation.x = Math.PI / 2; beak.position.set(0, 0.26, 0.2); p.add(beak);
      const tail = k.box(0.12, 0.03, 0.12, "#5a5f6a"); k.at(tail, 0, 0.12, -0.17); p.add(tail);
      p.traverse(o => { o.castShadow = false; });
      k.at(p, x, 0, z, r); api.add(p); api.pigeons.push({ p, head, phase: Math.random() * 6 });
    });

    // ---- ticket kiosk with the seller
    const KX = 4.6;
    const kiosk = k.group();
    const base = k.box(2.4, 1.1, 1.6, "#2f6aa8"); kiosk.add(base);
    const counter = k.box(2.6, 0.08, 0.5, "#f4f0e8"); k.at(counter, 0, 1.1, 0.75); kiosk.add(counter);
    [[-1.15, 0.75], [1.15, 0.75], [-1.15, -0.75], [1.15, -0.75]].forEach(([x, z]) => { const p = k.box(0.12, 1.5, 0.12, "#f4f0e8"); k.at(p, x, 1.1, z); kiosk.add(p); });
    const back = k.box(2.4, 1.5, 0.1, "#2f6aa8"); k.at(back, 0, 1.1, -0.78); kiosk.add(back);
    const roof = k.box(2.9, 0.25, 2.0, "#e23a2a"); k.at(roof, 0, 2.6, 0); kiosk.add(roof);
    const valance = [];
    for (let i = 0; i < 7; i++) { const v = k.box(0.36, 0.2, 0.04, i % 2 ? "#ffffff" : "#e23a2a"); k.at(v, -1.25 + i * 0.415, 2.42, 1.02); kiosk.add(v); valance.push(v); }
    const kSign = k.sign("TICKETS · CITY PASS", { height: 0.34, bg: "#ffffff", ink: "#1f3a6a", font: "Figtree, Arial, sans-serif" }); kSign.position.set(0, 3.1, 0.3); kiosk.add(kSign);
    const brochures = [["#e8573f", -0.8], ["#f2c230", -0.55], ["#2a9d8f", 0.75]].map(([c, x]) => { const b = k.box(0.18, 0.26, 0.04, c); k.at(b, x, 1.14, 0.8); b.rotation.x = -0.3; kiosk.add(b); return b; });
    const tPlate = k.sign("CITY PASS", { height: 0.22, bg: "#f2c230", ink: "#1f3a6a", font: "Figtree, Arial, sans-serif" }); tPlate.position.set(0, 0.6, 0.81); kiosk.add(tPlate);
    k.at(kiosk, KX, 0, -3.6); api.add(kiosk);
    const seller = k.person({ top: "#ffffff", bottom: "#2f3a5a", vest: "#2f6aa8", hair: "#1a1a1a", hairStyle: "short", skin: "#b07a52", hat: "cap", hatColor: "#2f6aa8" });
    k.at(seller, KX, 0, -3.95);
    seller.userData.height = 2.0;
    api.spot("seller", seller, { walkTo: [KX, -1.6], height: 3.6 });

    // ---- price board next to the kiosk
    const pb = k.group();
    const pPost = k.box(0.12, 1.3, 0.12, "#2d3436"); pb.add(pPost);
    const pBoard = k.screen("CITY PASS\n1 DAY   €12\n3 DAYS €25", { width: 1.3, bg: "#1f3a6a", ink: "#ffe08a", px: 44 }); pBoard.position.set(0, 1.75, 0.07); pb.add(pBoard);
    const pBack = k.box(1.4, 1.0, 0.08, "#2d3436"); k.at(pBack, 0, 1.25, 0); pb.add(pBack);
    const pSign = k.sign("CITY PASS · 1 DAY €12 · 3 DAYS €25", { height: 0.25, bg: "#ffffff", ink: "#1f3a6a", font: "Figtree, Arial, sans-serif" }); pSign.position.set(0, 0.95, 0.1); pb.add(pSign);
    k.at(pb, 6.9, 0, -2.4, -0.15);
    pb.userData.height = 2.3;
    api.spot("prices", pb, { walkTo: [6.8, -0.9], height: 2.5 });

    // ---- metro entrance (exit): stairs going down, railings, big M sign
    const MX = 9.6;
    const me = k.group();
    const pit = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.0), k.mat("#2a2e34")); pit.rotation.x = -Math.PI / 2; pit.position.set(0, 0.06, 0); me.add(pit);
    for (let i = 0; i < 7; i++) {
      const shade = 0.75 - i * 0.09, col = new THREE.Color(shade, shade, shade * 1.03);
      const step = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.32), new THREE.MeshLambertMaterial({ color: col }));
      step.rotation.x = -Math.PI / 2; step.position.set(0, 0.07, 1.3 - i * 0.4); me.add(step);
      const nose = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.05), new THREE.MeshBasicMaterial({ color: "#f2c230" })); nose.rotation.x = -Math.PI / 2; nose.position.set(0, 0.075, 1.45 - i * 0.4); me.add(nose);
    }
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.4), new THREE.MeshBasicMaterial({ color: "#fff3c4" })); glow.rotation.x = -Math.PI / 2; glow.position.set(0, 0.08, -0.8); me.add(glow);
    // low walls + railings on three sides
    [-1.2, 1.2].forEach(x => {
      const wl = k.box(0.2, 0.5, 3.2, "#8a9098"); k.at(wl, x, 0, 0); me.add(wl);
      const rl = k.box(0.06, 0.06, 3.2, "#2a7a4a"); k.at(rl, x, 1.1, 0); me.add(rl);
      [-1.5, 0, 1.5].forEach(z => { const p = k.box(0.05, 0.6, 0.05, "#2a7a4a"); k.at(p, x, 0.5, z); me.add(p); });
    });
    const backW = k.box(2.6, 0.5, 0.2, "#8a9098"); k.at(backW, 0, 0, -1.6); me.add(backW);
    const backR = k.box(2.4, 0.06, 0.06, "#2a7a4a"); k.at(backR, 0, 1.1, -1.6); me.add(backR);
    // big M sign on a pole
    const pole = k.cylinder(0.07, 0.07, 3.2, "#2d3436", 6); k.at(pole, 1.6, 0, 1.2); me.add(pole);
    const mBox = k.box(0.95, 0.95, 0.15, "#1f5aa8"); k.at(mBox, 1.6, 3.05, 1.2); me.add(mBox);
    const mLetter = k.sign("M", { height: 0.8, bg: "#1f5aa8", ink: "#ffffff", font: "Figtree, Arial, sans-serif" }); mLetter.scale.x = 1.0; mLetter.position.set(1.6, 3.52, 1.285); me.add(mLetter);
    const metroSign = k.sign("METRO", { height: 0.34, bg: "#ffffff", ink: "#1f5aa8", font: "Figtree, Arial, sans-serif" }); metroSign.position.set(0, 0.85, -1.48); me.add(metroSign);
    const metroSign2 = k.sign("METRO", { height: 0.3, bg: "#1f5aa8", ink: "#ffffff", font: "Figtree, Arial, sans-serif" }); metroSign2.position.set(1.6, 2.35, 1.3); me.add(metroSign2);
    // closed: a gate across the top of the stairs + CLOSED plaque
    const gate = k.group();
    const gBar = k.box(2.3, 0.12, 0.1, "#e23a2a"); k.at(gBar, 0, 0.95, 0); gate.add(gBar);
    const gBar2 = k.box(2.3, 0.08, 0.1, "#ffffff"); k.at(gBar2, 0, 0.5, 0); gate.add(gBar2);
    for (let i = 0; i < 6; i++) { const v = k.box(0.05, 1.05, 0.05, "#e23a2a"); k.at(v, -1.0 + i * 0.4, 0, 0); gate.add(v); }
    const closed = k.sign("CLOSED", { height: 0.3, bg: "#ffffff", ink: "#c0392b", font: "Figtree, Arial, sans-serif" }); closed.position.set(0, 0.72, 0.07); gate.add(closed);
    k.at(gate, 0, 0, 1.55); me.add(gate);
    const spark = k.emoji("✨", 0.9); spark.position.set(0.3, 0.7, 0.4); me.add(spark);
    const light = new THREE.PointLight("#ffe9a8", 0, 8); light.position.set(0, 1.5, -0.5); me.add(light);
    k.at(me, MX, 0, -2.4);
    me.userData.height = 2.0;
    api.spot("metro", me, { walkTo: [MX - 0.3, -0.2], height: 2.6 });
    api.metro = { gate, glow, spark, light };
  },

  update(api, st) {
    const open = !!st.open;
    if (api.metro) {
      api.metro.gate.visible = !open;
      api.metro.glow.visible = open; api.metro.spark.visible = open;
      api.metro.light.intensity = open ? 6 : 0;
    }
  },

  tick(api, t) {
    if (api.metro && api.metro.light.intensity > 0) api.metro.light.intensity = 5 + Math.sin(t * 2) * 1.2;
    (api.drops || []).forEach((d, i) => {
      const f = (t * 0.8 + i * 0.37) % 1, a = d.userData.a;
      d.position.set(Math.cos(a) * (0.15 + f * 0.6), 3.0 + f * 0.3 - f * f * 1.1, Math.sin(a) * (0.15 + f * 0.6));
    });
    (api.pigeons || []).forEach(({ p, head, phase }) => { const peck = Math.max(0, Math.sin(t * 3 + phase)); head.position.y = 0.26 - peck * 0.14; head.position.z = 0.13 + peck * 0.05; });
    if (api.tourist) api.tourist.rotation.y = 0.35 + Math.sin(t * 0.8) * 0.35;
    if (api.question) api.question.position.y = 2.25 + Math.sin(t * 2) * 0.05;
    if (api.clockHands) api.clockHands[1].rotation.z = -t * 0.05;
  },
};
