// Museum: a bright city museum hall with paintings, statues on plinths, velvet ropes and an exit to the gift shop.
// Spot ids (must match content.js): guard, cloakroom, painting1, painting2, statue1, statue2, guide, visitor, exit
export default {
  sky: { top: "#e9e4da", bottom: "#f6f2ea" },
  fog: { color: "#f2eee6", near: 34, far: 80 },
  groundColor: "#a87a4f",
  light: { sky: "#ffffff", ground: "#8a6a4a", hemi: 1.2, sun: "#fff4e2", sunIntensity: 1.4, sunPos: [-6, 18, 10] },
  bounds: { minX: -11, maxX: 11, minZ: -3, maxZ: 5 },
  camera: [0, 5.5, 10],

  build(k, api) {
    const { THREE } = api;
    api.spawn = [-8, 3];

    const WALL = "#f7f5f0";
    // ---- wooden floor with planks
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(26, 16), k.mat("#b98a5c"));
    fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.005, 1); fl.receiveShadow = true; api.add(fl);
    for (let z = -6.5; z <= 8; z += 0.9) { const l = k.box(26, 0.012, 0.04, "#94683f"); k.at(l, 0, 0, z); l.castShadow = false; api.add(l); }
    // a long grey runner carpet
    const runner = k.box(22, 0.02, 2.2, "#8f2f3a"); k.at(runner, 0, 0, 1.6); runner.castShadow = false; api.add(runner);
    const rEdge = k.box(22.2, 0.015, 2.4, "#d9b44a"); k.at(rEdge, 0, 0, 1.6); rEdge.castShadow = false; api.add(rEdge);

    // ---- walls: high and white, with a skirting board and a cornice
    const back = k.box(26, 8, 0.3, WALL); k.at(back, 0, 0, -7); api.add(back);
    [-13, 13].forEach(x => { const w = k.box(0.3, 8, 14, WALL); k.at(w, x, 0, 0); api.add(w); });
    const skirt = k.box(26, 0.3, 0.1, "#7a5a3c"); k.at(skirt, 0, 0, -6.82); api.add(skirt);
    const cornice = k.box(26.4, 0.4, 0.5, "#e2ddd2"); k.at(cornice, 0, 7.6, -6.9); api.add(cornice);
    const frieze = k.box(26, 0.12, 0.06, "#c9b48a"); k.at(frieze, 0, 5.8, -6.82); frieze.castShadow = false; api.add(frieze);
    // tall windows high on the back wall (light coming in)
    [-9.5, 0.6, 8.5].forEach(x => {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), new THREE.MeshBasicMaterial({ color: "#cfe6f5" })); w.position.set(x, 6.6, -6.84); api.add(w);
      const fr = k.box(1.8, 0.1, 0.08, "#bdb5a6"); k.at(fr, x, 6.0, -6.82); api.add(fr);
    });
    // museum name over the hall
    const title = k.sign("CITY MUSEUM", { height: 0.55, bg: "#f7f5f0", ink: "#2c2a28" }); title.position.set(-5.5, 6.6, -6.83); api.add(title);

    // ---- helpers
    function canvasPlane(w, h, draw, pw = 512) {
      const c = document.createElement("canvas"); c.width = pw; c.height = Math.round(pw * h / w);
      draw(c.getContext("2d"), c.width, c.height);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
      return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: t }));
    }
    function framed(w, h, draw, label) {
      const g = new THREE.Group();
      const fr = k.box(w + 0.36, h + 0.36, 0.12, "#b8862e"); fr.position.y = 0; g.add(fr);
      const inner = k.box(w + 0.1, h + 0.1, 0.14, "#6b4a1c"); inner.position.y = 0; g.add(inner);
      const pic = canvasPlane(w, h, draw); pic.position.z = 0.08; g.add(pic);
      const lbl = k.sign(label, { height: 0.36, bg: "#ffffff", ink: "#222", font: "Figtree, Arial, sans-serif" }); lbl.position.set(0, -h / 2 - 0.5, 0.02); g.add(lbl);
      // a small spotlight lamp above
      const arm = k.box(0.06, 0.06, 0.6, "#222"); k.at(arm, 0, h / 2 + 0.55, 0.3); g.add(arm);
      const head = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.3, 8), k.mat("#222")); head.position.set(0, h / 2 + 0.48, 0.6); head.rotation.x = 0.9; g.add(head);
      return g;
    }
    function rope(x1, x2, z) {
      const g = new THREE.Group(), n = Math.max(2, Math.round((x2 - x1) / 1.4) + 1);
      for (let i = 0; i < n; i++) {
        const x = x1 + (x2 - x1) * i / (n - 1);
        const base = k.cylinder(0.16, 0.18, 0.05, "#c9a23a", 10); k.at(base, x, 0, z); g.add(base);
        const post = k.cylinder(0.035, 0.035, 0.9, "#d9b44a", 6); k.at(post, x, 0, z); g.add(post);
        const knob = k.sphere(0.07, "#e3c35a", 8); knob.position.set(x, 0.95, z); g.add(knob);
        if (i < n - 1) {
          const dx = (x2 - x1) / (n - 1);
          for (let j = 0; j < 4; j++) {
            const sx = x + dx * (j + 0.5) / 4, sag = Math.sin(Math.PI * (j + 0.5) / 4) * 0.14;
            const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, dx / 4 + 0.03, 6), k.mat("#a3122a"));
            seg.rotation.z = Math.PI / 2 - (j < 2 ? 1 : -1) * 0.12; seg.position.set(sx, 0.88 - sag, z); g.add(seg);
          }
        }
      }
      return g;
    }
    function plinth(w, h, label) {
      const g = new THREE.Group();
      const p = k.box(w, h, w, "#ece8df"); g.add(p);
      const capT = k.box(w + 0.15, 0.12, w + 0.15, "#d8d2c4"); k.at(capT, 0, h, 0); g.add(capT);
      const capB = k.box(w + 0.15, 0.12, w + 0.15, "#d8d2c4"); g.add(capB);
      // a placard on a low stand in front of the plinth
      const lbl = k.sign(label, { height: 0.3, bg: "#ffffff", ink: "#222", font: "Figtree, Arial, sans-serif" });
      const pz = w / 2 + 0.45;
      lbl.rotation.x = -0.5; lbl.position.set(0, 0.62, pz + 0.02); g.add(lbl);
      const stand = k.box(lbl.geometry.parameters.width + 0.08, 0.36, 0.06, "#2c2a28"); stand.rotation.x = -0.5; k.at(stand, 0, 0.44, pz - 0.02); stand.rotation.x = -0.5; g.add(stand);
      [-0.3, 0.3].forEach(x => { const leg = k.box(0.05, 0.5, 0.05, "#2c2a28"); k.at(leg, x, 0, pz - 0.08); g.add(leg); });
      return g;
    }

    // ---- security guard, by the entrance on the left
    const entr = k.sign("ENTRANCE ←", { height: 0.35, bg: "#2c2a28", ink: "#ffffff", font: "Figtree, Arial, sans-serif" });
    entr.rotation.y = Math.PI / 2; entr.position.set(-12.8, 3.9, 1.5); api.add(entr);
    // the entrance doorway in the left wall, with daylight beyond, and a tall exhibition banner
    const door = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.3), new THREE.MeshBasicMaterial({ color: "#d8ecf7" }));
    door.rotation.y = Math.PI / 2; door.position.set(-12.83, 1.65, 1.5); api.add(door);
    [0.2, 2.8].forEach(z => { const j = k.box(0.4, 3.5, 0.2, "#d8d2c4"); k.at(j, -12.7, 0, z); api.add(j); });
    const lin = k.box(0.4, 0.3, 2.8, "#d8d2c4"); k.at(lin, -12.7, 3.4, 1.5); api.add(lin);
    const banner = new THREE.Group();
    const bcl = k.box(0.06, 3.2, 1.3, "#8f2f3a"); banner.add(bcl);
    const be = k.emoji("🏛️", 0.9); be.position.set(0.1, 2.3, 0); banner.add(be);
    const bt = k.sign("ART & HISTORY", { height: 0.22, bg: "#8f2f3a", ink: "#ffffff", font: "Figtree, Arial, sans-serif" });
    bt.rotation.y = Math.PI / 2; bt.position.set(0.04, 1.3, 0); banner.add(bt);
    k.at(banner, -12.8, 3.0, -2.8); api.add(banner);
    const guard = k.person({ top: "#1e2533", bottom: "#151a24", hat: "police", hair: "#1a1410", skin: "#b07a52", tie: "#0d0f14" });
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.02), k.mat("#e8c45a")); badge.position.set(-0.12, 1.25, 0.14); guard.add(badge);
    const radio = k.box(0.08, 0.14, 0.05, "#111"); k.at(radio, 0.14, 1.12, 0.14); guard.add(radio);
    const gplate = k.sign("SECURITY", { height: 0.22, bg: "#1e2533", ink: "#ffffff", font: "Figtree, Arial, sans-serif" }); gplate.position.set(0, 2.25, 0); guard.add(gplate);
    k.at(guard, -10.2, 0, -1.4); guard.rotation.y = 0.25;
    api.spot("guard", guard, { walkTo: [-9.6, 0.2], height: 2.4 });

    // ---- cloakroom counter with coats
    const cl = new THREE.Group();
    const counter = k.box(3.2, 1.05, 0.7, "#7a4f2e"); cl.add(counter);
    const ctop = k.box(3.4, 0.08, 0.85, "#4a2e1c"); k.at(ctop, 0, 1.05, 0); cl.add(ctop);
    const bell = k.sphere(0.08, "#e3c35a", 8); bell.position.set(0.9, 1.17, 0.1); cl.add(bell);
    const rail = k.box(3.0, 0.05, 0.05, "#888"); k.at(rail, 0, 2.15, -1.0); cl.add(rail);
    [-1.45, 1.45].forEach(x => { const p = k.box(0.06, 2.2, 0.06, "#666"); k.at(p, x, 0, -1.0); cl.add(p); });
    ["#2c3e50", "#c0392b", "#7d5a3a", "#27ae60", "#8e44ad", "#d35400"].forEach((c, i) => {
      const x = -1.25 + i * 0.5;
      const hook = k.box(0.02, 0.12, 0.02, "#555"); k.at(hook, x, 2.05, -1.0); cl.add(hook);
      const coat = k.box(0.42, 1.0, 0.22, c); k.at(coat, x, 1.0, -1.0); cl.add(coat);
      const sh = k.box(0.46, 0.08, 0.24, c); k.at(sh, x, 1.95, -1.0); cl.add(sh);
    });
    const tags = k.box(0.25, 0.04, 0.18, "#f4e6c8"); k.at(tags, -0.9, 1.09, 0.05); cl.add(tags);
    const clS = k.sign("CLOAKROOM", { height: 0.4, bg: "#2c2a28", ink: "#ffffff", font: "Figtree, Arial, sans-serif" }); clS.position.set(0, 2.85, -0.9); cl.add(clS);
    const attendant = k.person({ top: "#6b2b3a", bottom: "#222", hairStyle: "long", hair: "#5a3a1c", skin: "#e8b88e" }); k.at(attendant, 0.3, 0, -0.55); cl.add(attendant);
    k.at(cl, -6.3, 0, -4.4);
    cl.userData.height = 3.2;
    api.spot("cloakroom", cl, { walkTo: [-6.3, -2.4], height: 3.4 });

    // ---- painting 1: sunflowers
    const sunflowers = framed(2.4, 1.9, (g, w, h) => {
      g.fillStyle = "#3f6f8f"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#c9a35a"; g.fillRect(0, h * 0.72, w, h * 0.28);
      // vase
      g.fillStyle = "#e7c46a"; g.beginPath(); g.ellipse(w / 2, h * 0.78, w * 0.13, h * 0.16, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "#3f7a2a"; g.lineWidth = 7;
      const heads = [[0.3, 0.3, 46], [0.5, 0.18, 52], [0.7, 0.3, 46], [0.38, 0.5, 40], [0.62, 0.48, 42], [0.5, 0.4, 36]];
      heads.forEach(([fx, fy]) => { g.beginPath(); g.moveTo(w / 2, h * 0.7); g.lineTo(w * fx, h * fy); g.stroke(); });
      heads.forEach(([fx, fy, r]) => {
        const cx = w * fx, cy = h * fy;
        g.fillStyle = "#f6c623";
        for (let a = 0; a < 12; a++) { const an = a * Math.PI / 6; g.beginPath(); g.ellipse(cx + Math.cos(an) * r * 0.75, cy + Math.sin(an) * r * 0.75, r * 0.45, r * 0.2, an, 0, Math.PI * 2); g.fill(); }
        g.fillStyle = "#6b3e12"; g.beginPath(); g.arc(cx, cy, r * 0.45, 0, Math.PI * 2); g.fill();
      });
    }, "SUNFLOWERS · 19TH CENTURY");
    k.at(sunflowers, -2.2, 3.2, -6.75);
    sunflowers.userData.height = 4.5;
    api.spot("painting1", sunflowers, { walkTo: [-2.2, -2.4], height: 4.7 });

    // ---- painting 2: the storm (abstract)
    const storm = framed(2.4, 1.9, (g, w, h) => {
      const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, "#2c3e5a"); grd.addColorStop(1, "#7f8c9a");
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
      const cols = ["#5a6f8f", "#9aa7b5", "#3a4a66", "#c3ccd6", "#26324a"];
      for (let i = 0; i < 9; i++) {
        g.strokeStyle = cols[i % cols.length]; g.lineWidth = 14 + (i % 3) * 6;
        g.beginPath(); g.arc(w * (0.2 + (i * 0.37) % 0.7), h * (0.25 + (i * 0.23) % 0.5), 40 + i * 12, i, i + 2.4); g.stroke();
      }
      g.fillStyle = "#1f2a3c"; g.beginPath(); g.moveTo(0, h); g.lineTo(w * 0.3, h * 0.7); g.lineTo(w * 0.55, h * 0.85); g.lineTo(w, h * 0.65); g.lineTo(w, h); g.fill();
      g.strokeStyle = "#fff6c0"; g.lineWidth = 8; g.beginPath(); g.moveTo(w * 0.62, h * 0.05); g.lineTo(w * 0.55, h * 0.32); g.lineTo(w * 0.64, h * 0.34); g.lineTo(w * 0.54, h * 0.62); g.stroke();
    }, "THE STORM · 20TH CENTURY");
    k.at(storm, 4.3, 3.2, -6.75);
    storm.userData.height = 4.5;
    api.spot("painting2", storm, { walkTo: [4.3, -2.4], height: 4.7 });

    // velvet ropes in front of the paintings
    api.add(rope(-3.6, -0.8, -5.2));
    api.add(rope(2.9, 5.7, -5.2));

    // ---- statue 1: stone athlete on a plinth
    const st1 = new THREE.Group();
    const pl1 = plinth(1.1, 1.0, "ATHLETE · ANCIENT GREECE"); st1.add(pl1);
    const athlete = k.person({ top: "#b8b6b0", bottom: "#b8b6b0", skin: "#b8b6b0", hair: "#a9a7a1", scale: 0.95 });
    const stone = k.mat("#bdbab3");
    athlete.traverse(o => { if (o.isMesh) o.material = stone; });
    // raise one arm (a victory pose): the right arm is child with x>0 at arm height
    athlete.children.filter(o => o.isMesh && o.geometry.type === "BoxGeometry" && Math.abs(o.position.x - 0.285) < 0.02 && o.geometry.parameters.height > 0.5).forEach(a => { a.rotation.z = 2.6; a.position.y += 0.42; a.position.x += 0.1; });
    athlete.children.filter(o => o.isMesh && o.geometry.type === "SphereGeometry" && Math.abs(o.position.x - 0.285) < 0.02 && o.position.y < 1.2).forEach(hd => { hd.position.y += 1.02; hd.position.x += 0.22; });
    athlete.position.y = 1.12; st1.add(athlete);
    k.at(st1, 0.6, 0, -3.9);
    st1.userData.height = 3.1;
    api.spot("statue1", st1, { walkTo: [0.6, -2.0], height: 3.3 });

    // ---- statue 2: bronze horse on a plinth
    const st2 = new THREE.Group();
    const pl2 = plinth(1.6, 0.9, "HORSE · 18TH CENTURY"); st2.add(pl2);
    const horse = new THREE.Group(), bronze = "#8a5a2c", dark = "#5e3a1a";
    const torso = k.box(1.25, 0.5, 0.42, bronze); k.at(torso, 0, 0.6, 0); horse.add(torso);
    [[-0.48, 0.14], [-0.48, -0.14], [0.48, 0.14], [0.48, -0.14]].forEach(([x, z], i) => {
      const leg = k.box(0.12, 0.65, 0.12, bronze); k.at(leg, x, 0, z); if (i === 2) { leg.rotation.z = 0.5; leg.position.y += 0.15; leg.position.x += 0.12; } horse.add(leg);
    });
    const neck = k.box(0.28, 0.6, 0.3, bronze); neck.rotation.z = -0.55; k.at(neck, 0.66, 0.6, 0); horse.add(neck);
    const head = k.box(0.5, 0.22, 0.24, bronze); head.rotation.z = -0.5; k.at(head, 0.92, 1.0, 0); horse.add(head);
    const mane = k.box(0.08, 0.55, 0.08, dark); mane.rotation.z = -0.55; k.at(mane, 0.58, 0.7, 0); horse.add(mane);
    [0.06, -0.06].forEach(z => { const ear = k.cone(0.04, 0.12, dark, 4); k.at(ear, 0.82, 1.17, z); horse.add(ear); });
    const tail = k.box(0.08, 0.5, 0.08, dark); tail.rotation.z = -0.4; k.at(tail, -0.72, 0.4, 0); horse.add(tail);
    horse.scale.setScalar(1.25); horse.rotation.y = 0.35; horse.position.y = 1.02; st2.add(horse);
    k.at(st2, 7.8, 0, -4.0);
    st2.userData.height = 2.6;
    api.spot("statue2", st2, { walkTo: [7.8, -2.0], height: 3.0 });

    // ---- museum guide with a small flag and a clipboard
    const guide = k.person({ top: "#2f4f7a", bottom: "#3a3a44", tie: "#d9b44a", hairStyle: "short", hair: "#7a4a22", skin: "#f0c8a0", prop: "clipboard" });
    const fpole = k.cylinder(0.018, 0.018, 1.5, "#333", 6); k.at(fpole, -0.32, 0.7, 0.08); guide.add(fpole);
    const flag = k.box(0.35, 0.22, 0.02, "#e6492d"); k.at(flag, -0.14, 1.85, 0.08); guide.add(flag);
    const gp = k.sign("GUIDE", { height: 0.2, bg: "#d9b44a", ink: "#222", font: "Figtree, Arial, sans-serif" }); gp.position.set(0.02, 1.22, 0.15); gp.scale.setScalar(0.7); guide.add(gp);
    k.at(guide, 2.6, 0, -1.6); guide.rotation.y = -0.15;
    api.spot("guide", guide, { walkTo: [2.6, -0.1] });

    // ---- tourist with a camera / phone
    const visitor = k.person({ top: "#f39c12", bottom: "#4a6fa5", hat: "cap", hatColor: "#e74c3c", hair: "#e0c070", skin: "#f2c9a0", prop: "phone" });
    const camB = k.box(0.22, 0.14, 0.1, "#222"); k.at(camB, -0.05, 0.85, 0.16); visitor.add(camB);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8), k.mat("#555")); lens.rotation.x = Math.PI / 2; lens.position.set(-0.05, 0.92, 0.24); visitor.add(lens);
    const strap = k.box(0.04, 0.6, 0.02, "#333"); strap.rotation.z = 0.6; k.at(strap, -0.05, 0.95, 0.14); visitor.add(strap);
    k.at(visitor, 5.6, 0, -1.4); visitor.rotation.y = -0.2;
    api.spot("visitor", visitor, { walkTo: [5.6, 0.1] });

    // ---- exit doorway to the gift shop (back right)
    const ex = new THREE.Group(), EXX = 10.6;
    const jambL = k.box(0.3, 3.4, 0.4, "#d8d2c4"); k.at(jambL, -1.15, 0, 0); ex.add(jambL);
    const jambR = k.box(0.3, 3.4, 0.4, "#d8d2c4"); k.at(jambR, 1.15, 0, 0); ex.add(jambR);
    const lintel = k.box(2.6, 0.35, 0.4, "#d8d2c4"); k.at(lintel, 0, 3.4, 0); ex.add(lintel);
    const hole = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 3.4), k.mat("#3a3530")); hole.position.set(0, 1.7, 0.02); ex.add(hole);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 3.4), new THREE.MeshBasicMaterial({ color: "#fff3c4" })); glow.position.set(0, 1.7, 0.03); glow.visible = false; ex.add(glow);
    const gifts = k.emoji("🎁", 0.8); gifts.position.set(0, 1.2, 0.3); gifts.visible = false; ex.add(gifts);
    const spark = k.emoji("✨", 0.9); spark.position.set(0.5, 2.6, 0.4); spark.visible = false; ex.add(spark);
    const exS = k.sign("EXIT · GIFT SHOP", { height: 0.4, bg: "#1e8a4a", ink: "#ffffff", font: "Figtree, Arial, sans-serif" }); exS.position.set(0, 4.05, 0.05); ex.add(exS);
    const doors = [-0.5, 0.5].map(x => { const d = k.box(0.98, 3.35, 0.1, "#6b4428"); k.at(d, x, 0, 0.08); ex.add(d);
      const kn = k.sphere(0.05, "#e3c35a", 6); kn.position.set(x - Math.sign(x) * 0.38, 1.6, 0.16); ex.add(kn); return [d, kn]; }).flat();
    const exRope = rope(-0.95, 0.95, 0.75); ex.add(exRope);
    const closed = k.sign("CLOSED", { height: 0.3, bg: "#ffffff", ink: "#a3122a" }); closed.position.set(0, 0.58, 0.8); ex.add(closed);
    const exLight = new THREE.PointLight("#ffe9a8", 0, 9); exLight.position.set(0, 2.2, 1.6); ex.add(exLight);
    k.at(ex, EXX, 0, -6.7);
    ex.userData.height = 3.8;
    api.spot("exit", ex, { walkTo: [EXX - 0.3, -2.6], height: 4.0 });
    Object.assign(api, { exitClosed: [...doors, exRope, closed], exitOpen: [glow, gifts, spark], exitLight: exLight });

    // ---- decoration: benches, plants, a few background visitors
    const bnch = k.bench({ width: 2.2, color: "#4a2e1c" }); k.at(bnch, -2.2, 0, -3.4); api.add(bnch);
    const sitter = k.person({ top: "#16a085", bottom: "#2b2f3a", sit: true, hairStyle: "long", hair: "#2a1a10", skin: "#8d5a3b" }); k.at(sitter, -2.8, 0, -3.55); api.add(sitter);
    [[-11.8, -5.8], [12, -5.8], [-3.9, -6.2]].forEach(([x, z]) => { const p = k.plant({ scale: 1.2, pot: "#e8e2d6" }); k.at(p, x, 0, z); api.add(p); });
    const bg1 = k.person({ top: "#c0392b", bottom: "#222", prop: "backpack", propColor: "#2e86de", hair: "#1a1a1a" }); k.at(bg1, 4.0, 0, -4.6, Math.PI); api.add(bg1);
    const bg2 = k.person({ top: "#ecf0f1", bottom: "#7f8c8d", hairStyle: "bun", hair: "#c9c9cc", skirt: true, scale: 0.92 }); k.at(bg2, -1.4, 0, -4.7, Math.PI * 0.9); api.add(bg2);

    // gallery spotlights (no shadows) on the two paintings
    [[-2.2, sunflowers], [4.3, storm]].forEach(([x, tgt]) => {
      const sl = new THREE.SpotLight("#fff1d0", 18, 9, 0.5, 0.6, 1.5); sl.position.set(x, 5.5, -4.6); sl.target = tgt; api.add(sl);
    });
  },

  update(api, st) {
    const open = !!st.open;
    api.exitClosed.forEach(o => { o.visible = !open; });
    api.exitOpen.forEach(o => { o.visible = open; });
    api.exitLight.intensity = open ? 6 : 0;
  },

  tick(api, t) {
    if (api.exitLight.intensity > 0) api.exitLight.intensity = 5 + Math.sin(t * 2) * 1.2;
  },
};
