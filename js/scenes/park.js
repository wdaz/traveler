// Park: a sunny city park with paths, trees, flowers, a duck lake, an ice-cream van, a picnic and a sunset viewpoint.
// Spot ids (must match content.js): icecream, woman, dog1, dog2, dog3, oldman, leyla, viewpoint
// Flags: "foundDog" moves dog2 (the small brown dog, red collar) to sit next to the woman.
const FONT = "Figtree, Arial, sans-serif";

export default {
  sky: { top: "#5fb4f0", bottom: "#d9f1ff" },
  fog: { color: "#d9f1ff", near: 30, far: 70 },
  groundColor: "#7cc66a",
  light: { sky: "#fffbea", ground: "#4f8a3c", hemi: 1.1, sun: "#fff3d0", sunIntensity: 1.7, sunPos: [-8, 16, 9] },
  bounds: { minX: -11, maxX: 11, minZ: -1.6, maxZ: 5 },
  camera: [0, 5.5, 10],

  build(k, api) {
    const { THREE } = api;
    api.spawn = [-8, 3.2];
    const sg = (t, o = {}) => k.sign(t, { font: FONT, ...o });
    const flat = (w, d, color, y = 0.012) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), k.mat(color)); m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true; return m; };
    const noShadow = g => { g.traverse(o => { o.castShadow = false; }); return g; };

    // ---- ground: lighter lawn, a main path along the front, a side path to the lake
    const path = flat(30, 2.4, "#e8d6ae"); k.at(path, 0, 0, 1.4); api.add(path);
    const edge1 = flat(30, 0.12, "#c9b68c", 0.014); k.at(edge1, 0, 0, 0.2); api.add(edge1);
    const side = flat(1.6, 6, "#e8d6ae"); side.rotation.z = 0.35; k.at(side, 9.0, 0, -2.0); api.add(side);
    const lawn = flat(30, 6, "#8bd477", 0.008); k.at(lawn, 0, 0, -3.2); api.add(lawn);

    // ---- lake at the back right, with ducks and reeds
    const lake = new THREE.Mesh(new THREE.CircleGeometry(1, 24), k.mat("#4aa8d8")); lake.rotation.x = -Math.PI / 2;
    lake.scale.set(8, 3.4, 1); lake.position.set(7.5, 0.02, -7.4); lake.receiveShadow = true; api.add(lake);
    const shore = new THREE.Mesh(new THREE.CircleGeometry(1, 24), k.mat("#d9c79a")); shore.rotation.x = -Math.PI / 2;
    shore.scale.set(8.5, 3.8, 1); shore.position.set(7.5, 0.016, -7.4); api.add(shore);
    const shine = new THREE.Mesh(new THREE.CircleGeometry(1, 16), new THREE.MeshBasicMaterial({ color: "#bfe8ff" })); shine.rotation.x = -Math.PI / 2;
    shine.scale.set(2.2, 0.4, 1); shine.position.set(5.2, 0.025, -6.4); api.add(shine);
    api.ducks = [];
    [[4.5, -6.8], [5.3, -7.4], [9.8, -8.2], [3.2, -8.4]].forEach(([x, z], i) => {
      const d = k.group();
      const b = k.sphere(0.22, i === 0 ? "#8a6a3a" : "#ffffff", 7); b.scale.set(1.3, 0.8, 1); b.position.y = 0.15; d.add(b);
      const h = k.sphere(0.12, i === 0 ? "#2e7d32" : "#ffffff", 6); h.position.set(0.22, 0.38, 0); d.add(h);
      const bk = k.box(0.12, 0.05, 0.08, "#f39c12"); k.at(bk, 0.36, 0.34, 0); d.add(bk);
      k.at(d, x, 0, z, i % 2 ? Math.PI : 0); noShadow(d); api.add(d); api.ducks.push({ d, x, z, ph: i * 1.7 });
    });
    [[0.5, -6.2], [1.0, -6.6], [13.4, -6.0]].forEach(([x, z]) => { for (let i = 0; i < 3; i++) { const r = k.cylinder(0.03, 0.04, 0.9 + i * 0.2, "#5d8a3a", 4); k.at(r, x + i * 0.15, 0, z); r.castShadow = false; api.add(r); } });

    // ---- trees, bushes, flowers, lamps, a far city skyline
    [[-12, -6, 1.3], [-8.5, -8, 1.5], [-3, -8.5, 1.4], [1.5, -9.5, 1.2], [13, -9.5, 1.4], [-11.5, -2.2, 1.0], [12.5, -2.6, 1.1], [-0.6, -6.2, 1.0]].forEach(([x, z, s], i) => {
      const t = k.tree({ scale: s, color: i % 2 ? "#3f9a4a" : "#56b05b", color2: i % 2 ? "#5fbf5f" : "#7ccc6a" }); k.at(t, x, 0, z); api.add(t);
    });
    [[-9.2, -4.2], [-4.2, -5.6], [2.2, -5.2]].forEach(([x, z]) => { const b = k.sphere(0.7, "#4c9a52", 7); b.scale.y = 0.7; k.at(b, x, 0.4, z); api.add(b); });
    const fl = ["🌷", "🌼", "🌸", "🌻"];
    [[-10.5, -0.6], [-9.7, -0.4], [-4.6, -0.5], [-0.4, -0.4], [4.9, -0.5], [5.6, -0.4], [-7.5, -5], [-1.6, -5.1], [11.5, -0.5]].forEach(([x, z], i) => {
      const f = k.emoji(fl[i % 4], 0.42); k.at(f, x, 0.22, z); api.add(f);
    });
    [[-11.2, -0.9], [-4.3, -0.9], [12.4, -0.9]].forEach(([x, z]) => { const l = k.lamp({ height: 3.0 }); k.at(l, x, 0, z); api.add(l); });
    [[-22, 4], [-15, 6], [-8, 3.5], [14, 5], [21, 3.8]].forEach(([x, h], i) => { const b = k.box(5, h, 3, i % 2 ? "#cfe0f0" : "#dde9f5"); k.at(b, x, 0, -34); noShadow(b); api.add(b); });

    // ---- ICE-CREAM VAN with the seller at the serving hatch
    const van = k.group();
    const pink = "#ffc3d8", mint = "#b8f0dc";
    const lower = k.box(3.2, 1.0, 1.8, pink); lower.position.y = 0.4 + 0.5; van.add(lower);
    const backW = k.box(3.2, 1.1, 0.1, pink); k.at(backW, 0, 1.4, -0.85); van.add(backW);
    [-1.55, 1.55].forEach(x => { const p = k.box(0.1, 1.1, 1.8, pink); k.at(p, x, 1.4, 0); van.add(p); });
    const roof = k.box(3.3, 0.18, 1.9, mint); k.at(roof, 0, 2.5, 0); van.add(roof);
    const cab = k.box(1.2, 1.5, 1.8, mint); k.at(cab, 2.2, 0.4, 0); van.add(cab);
    const ws = k.box(0.05, 0.6, 1.5, "#203040"); k.at(ws, 2.81, 1.3, 0); van.add(ws);
    const sideWin = k.box(0.8, 0.5, 0.02, "#203040"); k.at(sideWin, 2.2, 1.35, 0.91); van.add(sideWin);
    [[-1.0, 0.85], [1.0, 0.85], [2.2, 0.85], [-1.0, -0.85], [2.2, -0.85]].forEach(([x, z]) => {
      const w = k.cylinder(0.32, 0.32, 0.2, "#2d2d2d", 12); w.rotation.x = Math.PI / 2; w.position.set(x, 0.32, z); van.add(w);
    });
    const counter = k.box(3.1, 0.08, 0.35, "#ffffff"); k.at(counter, 0, 1.4, 0.95); van.add(counter);
    for (let i = 0; i < 8; i++) { const s = k.box(0.42, 0.06, 0.6, i % 2 ? "#ff8fb3" : "#ffffff"); k.at(s, -1.47 + i * 0.42, 2.6, 1.15); s.rotation.x = 0.3; van.add(s); }
    const vsg = sg("ICE CREAM", { height: 0.32, bg: "#ff8fb3", ink: "#ffffff" }); k.at(vsg, -0.3, 0.95, 0.91); van.add(vsg);
    const ic1 = k.emoji("🍦", 0.5); k.at(ic1, 1.0, 0.95, 0.95); van.add(ic1);
    // giant cone on the roof
    const cone = k.cone(0.3, 0.8, "#e0b070", 8); cone.rotation.x = Math.PI; cone.position.set(-0.6, 3.0, 0); van.add(cone);
    const scoop = k.sphere(0.36, "#fff5e0", 9); scoop.position.set(-0.6, 3.5, 0); van.add(scoop);
    const scoop2 = k.sphere(0.28, "#ff9ec4", 9); scoop2.position.set(-0.6, 3.85, 0); van.add(scoop2);
    const menu = k.screen("VANILLA  €2\nSTRAWBERRY  €2\nCHOCOLATE  €2.50", { width: 1.0, bg: "#ffffff", ink: "#d6336c", px: 40 }); k.at(menu, -1.0, 1.75, 0.95); van.add(menu);
    k.at(van, -6.4, 0, -3.4); api.add(van);
    const seller = k.person({ top: "#ffffff", bottom: "#ff8fb3", hat: "cap", hatColor: "#ff8fb3", hair: "#e3b46a", skin: "#f3c9a5", vest: "#b8f0dc" });
    k.at(seller, -6.0, 0.15, -3.2);
    api.spot("icecream", seller, { walkTo: [-6.0, -1.2], height: 2.7 });

    // ---- the WORRIED WOMAN with an empty dog lead
    const woman = k.person({ top: "#9b59b6", bottom: "#34495e", hairStyle: "long", hair: "#c0392b", skin: "#e8b48a", skirt: false });
    const lead = k.box(0.03, 0.75, 0.03, "#e74c3c"); lead.position.set(0.36, 0.44, 0.18); lead.rotation.x = 0.5; woman.add(lead);
    const clip = k.box(0.08, 0.08, 0.08, "#888"); clip.position.set(0.36, 0.12, 0.35); woman.add(clip);
    const worry = k.emoji("😟", 0.4); worry.position.set(0, 2.35, 0); woman.add(worry);
    k.at(woman, -2.6, 0, -1.6, 0.15);
    api.spot("woman", woman, { walkTo: [-2.6, -0.2], height: 2.6 });

    // ---- DOGS
    function dog({ fur, collar, s = 1, ear = fur }) {
      const g = k.group();
      const legs = [[0.17, 0.09], [0.17, -0.09], [-0.17, 0.09], [-0.17, -0.09]];
      legs.forEach(([x, z]) => { const l = k.box(0.08, 0.22, 0.08, fur); k.at(l, x, 0, z); g.add(l); });
      const body = k.box(0.5, 0.22, 0.26, fur); k.at(body, 0, 0.2, 0); g.add(body);
      const head = k.box(0.24, 0.22, 0.22, fur); k.at(head, 0.32, 0.38, 0); g.add(head);
      const snout = k.box(0.12, 0.1, 0.14, fur); k.at(snout, 0.48, 0.38, 0); g.add(snout);
      const nose = k.box(0.04, 0.04, 0.05, "#1a1a1a"); k.at(nose, 0.55, 0.45, 0); g.add(nose);
      [-0.065, 0.065].forEach(z => {
        const e = k.box(0.03, 0.03, 0.03, "#1a1a1a"); k.at(e, 0.43, 0.5, z); g.add(e);
        const ea = k.box(0.08, 0.14, 0.04, ear); k.at(ea, 0.28, 0.5, z * 1.7); ea.rotation.x = z > 0 ? 0.3 : -0.3; g.add(ea);
      });
      const col = k.box(0.1, 0.08, 0.3, collar); k.at(col, 0.22, 0.3, 0); g.add(col);
      const colT = k.box(0.14, 0.09, 0.05, collar); k.at(colT, 0.24, 0.29, 0.14); g.add(colT);
      const tag = k.sphere(0.03, "#f1c40f", 6); tag.position.set(0.27, 0.28, 0.16); g.add(tag);
      const tail = k.box(0.05, 0.05, 0.2, fur); k.at(tail, -0.28, 0.33, 0); tail.rotation.set(0, Math.PI / 2, 0); tail.rotation.z = 0.8; g.add(tail);
      g.userData.tail = tail;
      g.scale.setScalar(s);
      const w = k.group(g);
      const plate = sg("WOOF!", { height: 0.22, bg: "#ffffff", ink: "#2d3436" }); plate.position.y = 0.75 * s + 0.25; w.add(plate);
      w.userData.height = 0.75 * s + 0.5; w.userData.dog = g;
      return w;
    }
    const dog1 = dog({ fur: "#f7f7f2", collar: "#e53935", s: 1.0, ear: "#e6e3da" });
    k.at(dog1, -0.6, 0, -3.5); dog1.userData.dog.rotation.y = -0.5;
    api.spot("dog1", dog1, { walkTo: [-0.6, -1.4], height: 1.4 });
    const dog2 = dog({ fur: "#9a5f2e", collar: "#e53935", s: 1.0, ear: "#6b3d1c" });
    k.at(dog2, -10.0, 0, -3.0); dog2.userData.dog.rotation.y = -0.4;
    api.spot("dog2", dog2, { walkTo: [-10.0, -1.2], height: 1.4 });
    const dog3 = dog({ fur: "#8a5a30", collar: "#1e6fe0", s: 2.0, ear: "#5e3a1c" });
    k.at(dog3, 7.9, 0, -1.4); dog3.userData.dog.rotation.y = -2.4;
    api.spot("dog3", dog3, { walkTo: [7.7, 0.0], height: 2.1 });
    api.dogs = [dog1, dog2, dog3]; api.dog2 = dog2;

    // ---- LEYLA at a picnic blanket with two friends
    const pic = k.group();
    for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) {
      const t = flat(0.5, 0.5, (i + j) % 2 ? "#e74c3c" : "#ffffff", 0.03); t.position.x = -1 + i * 0.5; t.position.z = -0.5 + j * 0.5; pic.add(t);
    }
    const basket = k.box(0.5, 0.32, 0.34, "#c8913f"); k.at(basket, 0.7, 0, -0.4); pic.add(basket);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 4, 10, Math.PI), k.mat("#8a5a22")); handle.position.set(0.7, 0.32, -0.4); pic.add(handle);
    [["🍉", -0.2, 0.2], ["🥪", 0.25, 0.35], ["🍓", 0.0, -0.3]].forEach(([c, x, z]) => { const e = k.emoji(c, 0.32); k.at(e, x, 0.18, z); pic.add(e); });
    const f1 = k.person({ top: "#f1c40f", bottom: "#2c3e50", sit: true, hairStyle: "bun", hair: "#111", skin: "#8d5524" }); k.at(f1, 0.0, -0.03, -0.6, 0.2); pic.add(f1);
    const f2 = k.person({ top: "#1abc9c", bottom: "#7f8c8d", sit: true, hair: "#c49a5a", skin: "#f1c27d" }); k.at(f2, 1.0, -0.03, 0.15, -0.9); pic.add(f2);
    k.at(pic, 2.9, 0, -3.0); api.add(pic);
    const leyla = k.person({ top: "#ff7f50", bottom: "#3d5a80", hairStyle: "long", hair: "#1e120c", skin: "#d9a47a", prop: "phone" });
    k.at(leyla, 1.3, 0, -2.2, 0.3);
    api.spot("leyla", leyla, { walkTo: [1.4, -0.6], height: 2.1 });

    // ---- the OLD MAN on a bench by the lake
    const bn = k.bench({ width: 1.8, color: "#2e7d4f" }); k.at(bn, 6.0, 0, -3.4); api.add(bn);
    const oldman = k.person({ top: "#8d6e63", bottom: "#5d4037", sit: true, hairStyle: "bald", skin: "#e8c4a0", hat: "beanie", hatColor: "#455a64" });
    const cane = k.cylinder(0.025, 0.025, 0.9, "#4e342e", 5); cane.position.set(0.45, 0.45, 0.55); cane.rotation.z = -0.2; oldman.add(cane);
    k.at(oldman, 5.7, 0, -3.35);
    api.spot("oldman", oldman, { walkTo: [5.8, -1.2], height: 1.8 });
    const bread = k.emoji("🍞", 0.3); k.at(bread, 6.5, 0.65, -3.3); api.add(bread);

    // ---- SUNSET VIEWPOINT: wooden platform at the lake edge
    const vp = k.group();
    const deck = k.box(3.2, 0.25, 2.6, "#b07a45"); k.at(deck, 0, 0, -0.6); vp.add(deck);
    for (let i = 0; i < 6; i++) { const pl = k.box(3.2, 0.02, 0.05, "#8a5a30"); k.at(pl, 0, 0.25, -1.75 + i * 0.45); vp.add(pl); }
    [-1.5, -0.5, 0.5, 1.5].forEach(x => { const p = k.box(0.1, 1.1, 0.1, "#7a4a24"); k.at(p, x, 0.25, -1.85); vp.add(p); });
    [-1.5, 1.5].forEach(x => { [-1.3, -0.7].forEach(z => { const p = k.box(0.1, 1.1, 0.1, "#7a4a24"); k.at(p, x, 0.25, z); vp.add(p); }); });
    const tr = k.box(3.2, 0.08, 0.12, "#8a5a30"); k.at(tr, 0, 1.3, -1.85); vp.add(tr);
    [-1.5, 1.5].forEach(x => { const r = k.box(0.12, 0.08, 1.2, "#8a5a30"); k.at(r, x, 1.3, -1.25); vp.add(r); });
    const pole = k.box(0.12, 2.6, 0.12, "#7a4a24"); k.at(pole, -1.0, 0.25, -0.1); vp.add(pole);
    const vsign = sg("SUNSET VIEWPOINT", { height: 0.32, bg: "#ffe0a8", ink: "#7a3e12" }); k.at(vsign, -0.2, 2.6, -0.02); vp.add(vsign);
    const telescope = k.cylinder(0.06, 0.08, 0.5, "#455a64", 6); telescope.rotation.x = 1.2; telescope.position.set(0.6, 1.5, -1.5); vp.add(telescope);
    const tstand = k.cylinder(0.04, 0.04, 1.2, "#455a64", 5); k.at(tstand, 0.6, 0.25, -1.4); vp.add(tstand);
    // closed: rope across the entrance + CLOSED plaque
    const rposts = [-1.3, 1.3].map(x => { const p = k.box(0.12, 0.9, 0.12, "#5d4037"); k.at(p, x, 0, 0.9); vp.add(p); return p; });
    const rope = k.box(2.6, 0.06, 0.06, "#c0392b"); k.at(rope, 0, 0.75, 0.9); vp.add(rope);
    const closed = sg("CLOSED", { height: 0.28, bg: "#ffffff", ink: "#c0392b" }); k.at(closed, 0, 0.45, 0.97); vp.add(closed);
    // open: warm sunset glow + sparkle + light
    const glow = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24), new THREE.MeshBasicMaterial({ color: "#ffb347", transparent: true, opacity: 0.85 }));
    k.at(glow, 0, 2.4, -2.6); glow.visible = false; vp.add(glow);
    const halo = new THREE.Mesh(new THREE.CircleGeometry(2.6, 24), new THREE.MeshBasicMaterial({ color: "#ffd59a", transparent: true, opacity: 0.45 }));
    k.at(halo, 0, 2.4, -2.7); halo.visible = false; vp.add(halo);
    const sheen = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.8), new THREE.MeshBasicMaterial({ color: "#ffcf8a", transparent: true, opacity: 0.5 }));
    sheen.rotation.x = -Math.PI / 2; k.at(sheen, 0, 0.27, -0.6); sheen.visible = false; vp.add(sheen);
    const spark = k.emoji("✨", 0.9); k.at(spark, 0.3, 1.9, -0.6); spark.visible = false; vp.add(spark);
    const light = new THREE.PointLight("#ffb05a", 0, 10); k.at(light, 0, 2.5, 0.3); vp.add(light);
    k.at(vp, 10.5, 0, -3.6);
    vp.userData.height = 3.0;
    api.spot("viewpoint", vp, { walkTo: [10.4, -1.2], height: 3.2 });
    api.vpClosed = [...rposts, rope, closed]; api.vpOpen = [glow, halo, sheen, spark]; api.vpLight = light;

    // a jogger and a kid with a balloon for life
    const jog = k.person({ top: "#00b894", bottom: "#2d3436", hat: "cap", hatColor: "#fdcb6e", scale: 0.95 }); k.at(jog, -9.6, 0, -6.6, 1.2); noShadow(jog); api.add(jog);
    const kid = k.person({ top: "#fd79a8", bottom: "#0984e3", scale: 0.6, hair: "#5a3a22" }); k.at(kid, -1.6, 0, -5.4, 0.3); noShadow(kid); api.add(kid);
    const bal = k.emoji("🎈", 0.5); k.at(bal, -1.3, 1.6, -5.4); api.add(bal);
  },

  update(api, st) {
    const open = !!st.open;
    (api.vpClosed || []).forEach(o => { o.visible = !open; });
    (api.vpOpen || []).forEach(o => { o.visible = open; });
    if (api.vpLight) api.vpLight.intensity = open ? 7 : 0;
    if (api.dog2) {
      const found = st.has && st.has("foundDog");
      if (found) { api.dog2.position.set(-1.9, 0, -1.25); api.dog2.userData.dog.rotation.y = 2.6; }
      else { api.dog2.position.set(-10.0, 0, -3.0); api.dog2.userData.dog.rotation.y = -0.4; }
    }
  },

  tick(api, t) {
    if (api.vpLight && api.vpLight.intensity > 0) api.vpLight.intensity = 6 + Math.sin(t * 2) * 1.5;
    (api.dogs || []).forEach((w, i) => { const tl = w.userData.dog.userData.tail; if (tl) tl.rotation.y = Math.PI / 2 + Math.sin(t * 8 + i) * 0.6; });
    (api.ducks || []).forEach(({ d, x, z, ph }) => { d.position.x = x + Math.sin(t * 0.4 + ph) * 0.6; d.position.z = z + Math.cos(t * 0.3 + ph) * 0.2; d.position.y = Math.sin(t * 2 + ph) * 0.02; });
  },
};
