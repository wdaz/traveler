// Game logic for the travel version: state, dialogue, puzzles, journal, bag, speech.
// The 3D world lives in engine.js and scenes/<scene>.js; this file never touches Three.js directly.
import { PLACES, PICS } from "./content.js";
import { createEngine } from "./engine.js";

/* ======================= STATE ======================= */
const KEY = "tower-of-words-travel-v1";
const fresh = () => ({ started: false, place: 0, rate: .9, bag: [], phrases: [], ended: false,
  p: PLACES.map(() => ({ task: 0, talked: false, seen: [], guess: {}, sealed: [], flags: [], free: "", got: [], intro: false })) });
let S = fresh();
function load(d) { if (d && Array.isArray(d.p) && d.p.length === PLACES.length) S = Object.assign(fresh(), d); }
try { load(JSON.parse(localStorage.getItem(KEY) || "null")); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const P = () => PLACES[S.place], PS = () => S.p[S.place];
const tasksDone = i => S.p[i].task >= PLACES[i].tasks.length;
const pagesOf = i => [PLACES[i].words.slice(0, 4), PLACES[i].words.slice(4, 8)];
const journalDone = i => S.p[i].sealed.length === 2;
const placeDone = i => tasksDone(i) && journalDone(i);
const unlocked = i => i === 0 || placeDone(i - 1);
const knownWord = (i, w) => pagesOf(i).some((p, k) => S.p[i].sealed.includes(k) && p.some(x => x.w === w));

/* ======================= VOICE OUT ======================= */
let voice = null;
function pickVoice() { const vs = (window.speechSynthesis && speechSynthesis.getVoices()) || []; voice = vs.find(v => /en[-_](US|GB)/i.test(v.lang) && /Google|Natural|Samantha|Daniel|Aria|Jenny/i.test(v.name)) || vs.find(v => /^en/i.test(v.lang)) || null; }
if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
// who = the spot that is speaking, so its character moves its mouth and gestures
let talkTimer = null, engineRef = null;
function talking(id, ms) { engineRef && engineRef.setTalking(id); clearTimeout(talkTimer); if (id && ms) talkTimer = setTimeout(() => engineRef && engineRef.setTalking(null), ms); }
function speak(text, rate, who) {
  text = String(text);
  const est = Math.max(900, text.split(/\s+/).length * 420 / (rate || S.rate));
  talking(who ? who.id : null, who ? est : 0);
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/·/g, ",").replace(/€(\d+)/g, "$1 euros"));
  u.lang = "en-US"; if (voice) u.voice = voice; u.rate = rate || S.rate; u.pitch = (who && who.pitch) || 1;
  if (who) { u.onstart = () => talking(who.id, est * 1.5); u.onend = () => talking(null); }
  speechSynthesis.speak(u);
}

/* ======================= VOICE IN ======================= */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let micBroken = !SR;
function listenOnce(onText, onEnd) {
  const r = new SR(); r.lang = "en-US"; r.interimResults = true; r.continuous = false; let fin = "";
  r.onresult = e => { let t = ""; for (const res of e.results) t += res[0].transcript; fin = t; onText(t); };
  r.onerror = e => { if (["not-allowed", "service-not-allowed", "audio-capture"].includes(e.error)) micBroken = true; onEnd(e.error, fin); };
  r.onend = () => onEnd(null, fin);
  try { r.start(); } catch (e) { micBroken = true; onEnd("start", ""); }
  return r;
}
const NUM = { one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10" };
const norm = s => s.toLowerCase().replace(/[’']/g, "'").replace(/\bi'm\b/g, "i am").replace(/\bit's\b/g, "it is").replace(/\bwon't\b/g, "will not").replace(/\bcan't\b/g, "cannot").replace(/\bi've\b/g, "i have").replace(/\bi'll\b/g, "i will").replace(/\bi'd\b/g, "i would").replace(/\bdon't\b/g, "do not")
  .replace(/[^a-z0-9' ]+/g, " ").trim().split(/\s+/).filter(Boolean).map(w => NUM[w] || w);
/* Word-level longest common subsequence: order matters, small slips are forgiven. */
function scoreSpeech(target, heard) {
  const a = norm(target), b = norm(heard);
  const L = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? 1 + L[i + 1][j + 1] : Math.max(L[i + 1][j], L[i][j + 1]);
  const hit = new Array(a.length).fill(false);
  for (let i = 0, j = 0; i < a.length && j < b.length;) { if (a[i] === b[j]) { hit[i] = true; i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++; }
  return { score: a.length ? L[0][0] / a.length : 0, words: target.split(/\s+/), hit: alignHits(target, hit) };
}
// map hits on normalised words back onto the words as written (contractions expand, so align by count)
function alignHits(target, hit) { const ws = target.split(/\s+/); let k = 0; return ws.map(w => { const n = Math.max(1, norm(w).length); const ok = hit.slice(k, k + n).every(Boolean); k += n; return ok; }); }
const PASS = .75;
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/* ======================= DOM HELPERS ======================= */
const $ = h => { const t = document.createElement("template"); t.innerHTML = h.trim(); return t.content.firstElementChild; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const stage = document.getElementById("stage"), dialog = document.getElementById("dialog"), quest = document.getElementById("quest"), layer = document.getElementById("layer");
const spotOf = id => P().spots.find(s => s.id === id);

/* words in a line: key words are underlined; seeing them notes them in the journal */
function lineEl(text, cls = "line") {
  const pl = P(), pi = S.place, keys = new Map(pl.words.map(x => [x.w, x]));
  const p = document.createElement("p"); p.className = cls;
  text.split(/([A-Za-z']+)/).forEach((tok, n) => {
    if (n % 2 === 0) { if (tok) p.append(tok); return; }
    const lw = tok.toLowerCase(), base = keys.has(lw) ? lw : (pl.forms && pl.forms[lw]);
    if (base && keys.has(base)) {
      if (!PS().seen.includes(base)) { PS().seen.push(base); save(); updateCount(); }
      const b = $(`<button class="k${knownWord(pi, base) ? " known" : ""}" title="Dəftərə yazıldı">${esc(tok)}</button>`);
      b.onclick = () => speak(tok); p.append(b);
      if (knownWord(pi, base)) p.append($(`<span class="g">${esc(keys.get(base).az)}</span>`));
    } else { const b = $(`<button class="k plain">${esc(tok)}</button>`); b.onclick = () => speak(tok); p.append(b); }
  });
  return p;
}

/* ======================= SCENE ======================= */
const engine = createEngine(stage, { onSpot: id => clickSpot(id) }); engineRef = engine;
const sceneMods = {};
async function sceneModule(i) {
  const name = PLACES[i].scene;
  if (sceneMods[name]) return sceneMods[name];
  try { sceneMods[name] = (await import(`./scenes/${name}.js`)).default; }
  catch (e) { console.warn("scene", name, "not built yet, using placeholder", e); sceneMods[name] = placeholderScene(i); }
  return sceneMods[name];
}
// Stand-in scene so the game stays playable while a location's art is missing.
function placeholderScene(i) {
  return { sky: { top: "#9cd3f5", bottom: "#e8f4fb" }, groundColor: "#8a8f96", build(k, api) {
    PLACES[i].spots.forEach((s, n) => { const x = -10 + n * (20 / Math.max(1, PLACES[i].spots.length - 1));
      const o = s.npc ? k.person({ top: "#88a" }) : k.box(1, 1, 1, s.exit ? "#c84" : "#aa8"); o.position.x = x; o.position.z = -2; api.spot(s.id, o); });
  } };
}
function sceneState() { const st = new Set(PS().flags); st.open = placeDone(S.place); return st; }
let loadedPlace = -1;
async function renderScene() {
  if (loadedPlace !== S.place) { const pi = S.place, mod = await sceneModule(pi); if (pi !== S.place) return; engine.loadFloor(mod, sceneState()); loadedPlace = pi; }
  else engine.refresh(sceneState());
  const t = P().tasks[PS().task], ids = [];
  if (t && !PS().talked) ids.push(t.npc);
  if (placeDone(S.place)) ids.push(P().spots.find(s => s.exit).id);
  engine.setMarkers(ids);
}

/* ======================= QUEST BAR ======================= */
function renderQuest() {
  const pl = P(), ps = PS(), t = pl.tasks[ps.task];
  let text;
  if (t) text = ps.talked && t.doHint ? t.doHint : (t.hint || `${spotOf(t.npc).npc} ilə söhbəti davam etdir.`);
  else if (!journalDone(S.place)) text = `Dəftəri aç: ${2 - ps.sealed.length} səhifəni deşifrə et. Sözləri dialoqlardan və lövhələrdən topladın.`;
  else text = S.place === PLACES.length - 1 ? "Gün batımına bax: Sunset Viewpoint açıqdır." : "Yol açıqdır! Çıxışa get, növbəti yer səni gözləyir.";
  const n = pl.tasks.length, done = Math.min(ps.task, n);
  quest.innerHTML = `<span class="label">${S.place + 1}/${PLACES.length} · ${esc(pl.cefr)}</span><span class="place">${esc(pl.name)}</span><span class="text">${esc(text)}</span><span class="prog" title="Tapşırıqlar">${done}/${n}</span>`;
  const fb = document.getElementById("route"); fb.innerHTML = "";
  PLACES.forEach((pp, i) => fb.appendChild($(`<span class="${i === S.place ? "on" : placeDone(i) ? "done" : unlocked(i) ? "" : "locked"}" title="${esc(pp.az)}"></span>`)));
}
function updateCount() { document.getElementById("jcount").textContent = PS().seen.length + "/8"; document.getElementById("bcount").textContent = S.bag.length; }

/* ======================= DIALOGUE ======================= */
function speakerHead(name, lines, who) {
  const h = $(`<div class="who"><b>${esc(name)}</b><span class="tools"><button class="icon" aria-label="Dinlə">▶</button><button class="icon" aria-label="Yavaş dinlə">🐢</button></span></div>`);
  const all = lines.join(" ");
  const [p1, p2] = h.querySelectorAll("button"); p1.onclick = () => speak(all, null, who); p2.onclick = () => speak(all, .65, who);
  return h;
}
function showLines(sp, lines, after, { hidden = false } = {}) {
  dialog.innerHTML = ""; const who = sp && sp.npc ? sp : null;
  dialog.appendChild(speakerHead(sp ? sp.npc || "" : "", lines, who));
  if (hidden) dialog.appendChild($(`<p class="hint listen">🎧 Mətn gizlidir: əvvəlcə qulaq as. ▶ ilə yenidən, 🐢 ilə yavaş dinlə.</p>`));
  else lines.forEach(l => dialog.appendChild(lineEl(l)));
  speak(lines.join(" "), null, who);
  if (after) after(dialog);
}
function say(text) { dialog.innerHTML = ""; dialog.appendChild($(`<p class="hint">${esc(text)}</p>`)); }
const row = (...els) => { const r = $(`<div class="row"></div>`); r.append(...els); return r; };
const btn = (label, cls = "btn") => $(`<button class="${cls}">${esc(label)}</button>`);

function clickSpot(id) {
  const pl = P(), ps = PS(), sp = spotOf(id), t = pl.tasks[ps.task];
  if (!sp) return;
  if (sp.exit) {
    if (placeDone(S.place)) return S.place === PLACES.length - 1 ? ending() : travel(S.place + 1);
    dialog.innerHTML = ""; dialog.appendChild(speakerHead("", [sp.label])); dialog.appendChild(lineEl(sp.label, "sign"));
    dialog.appendChild($(`<p class="hint">🔒 ${esc(sp.locked)}</p>`)); speak(sp.label); return;
  }
  // an active find task: was this the thing they asked for?
  if (t && ps.talked && (t.type === "fetch" || t.type === "fetchAll") && !sp.npc) {
    if (t.type === "fetch" && id === t.target) { if (t.flag) ps.flags.push(t.flag); return completeTask(t); }
    if (t.type === "fetchAll" && t.targets.includes(id)) {
      if (!ps.got.includes(id)) ps.got.push(id); save();
      const left = t.targets.filter(x => !ps.got.includes(x));
      if (!left.length) { ps.got = []; return completeTask(t); }
      readSign(sp); dialog.appendChild($(`<p class="msg ok">✓ Götürdün. Daha ${left.length} şey qalıb.</p>`)); return;
    }
  }
  if (sp.npc) {
    if (t && t.npc === id) { ps.talked = true; save(); renderQuest(); renderScene(); return runTask(t, sp); }
    if (t && ps.talked && t.npc !== id && (t.type === "fetch" || t.type === "fetchAll")) { /* chatting doesn't cancel the hunt */ }
    const idle = sp.idle || ["…"]; return showLines(sp, [idle[Math.floor(Math.random() * idle.length)]]);
  }
  readSign(sp);
  if (t && ps.talked && (t.type === "fetch" || t.type === "fetchAll")) dialog.appendChild($(`<p class="hint">Bu deyil. Nə istədiklərini yenidən dinlə: ${esc(spotOf(t.npc).npc)} ilə danış.</p>`));
}
function readSign(sp) {
  dialog.innerHTML = ""; dialog.appendChild(speakerHead("", [sp.label]));
  dialog.appendChild(lineEl(sp.label, "sign")); speak(sp.label);
}

function runTask(t, sp) {
  const hidden = t.type === "listen";
  showLines(sp, t.say, d => {
    if (t.pic && PICS[t.pic] && t.type !== "listen") d.appendChild($(PICS[t.pic]));
    if (t.q && t.type !== "listen") d.appendChild($(`<p class="hint q">❔ ${esc(t.q)}</p>`));
    ({ fetch: fetchUI, fetchAll: fetchUI, line: lineUI, choice: choiceUI, listen: listenUI, fill: fillUI, order: orderUI, anagram: anagramUI, build: buildUI, free: freeUI }[t.type])(t, d, sp);
  }, { hidden });
}
function completeTask(t) {
  const ps = PS(), pl = P();
  if (t.flagAfter) ps.flags.push(t.flagAfter);
  if (t.give && !S.bag.some(b => b.n === t.give.n)) { S.bag.push(t.give); toast(`${t.give.e} Çantana əlavə olundu: ${t.give.n}`); }
  ps.task++; ps.talked = false; save();
  renderScene(); renderQuest(); updateCount();
  const sp = spotOf(t.npc), next = pl.tasks[ps.task];
  const after = d => {
    if (next && next.chain) { const b = btn("Davam et ▸", "btn primary"); b.onclick = () => { ps.talked = true; save(); renderQuest(); renderScene(); runTask(next, spotOf(next.npc)); }; d.appendChild(row(b)); return; }
    if (tasksDone(S.place) && !journalDone(S.place)) { const b = btn("Dəftəri aç", "btn primary"); b.onclick = openJournal; d.appendChild(row(b)); }
    else if (placeDone(S.place)) d.appendChild($(`<p class="msg ok">Bu yer tamamlandı! Çıxış açıqdır.</p>`));
  };
  if (t.done) showLines(sp, [t.done], after); else { dialog.innerHTML = ""; after(dialog); }
}
function addPhrase(s) { if (!S.phrases.includes(s)) { S.phrases.push(s); save(); } }

function fetchUI(t, d) { d.appendChild($(`<p class="hint">🔎 ${esc(t.doHint)}</p>`)); }
function lineUI(t, d) { const b = btn("Anladım", "btn primary"); b.onclick = () => completeTask(t); d.appendChild(row(b)); }

function optionsUI(opts, a, d, onRight, { say: sayIt = true } = {}) {
  const box = $(`<div class="opts"></div>`), msg = $(`<p class="msg"></p>`);
  shuffle(opts.map((o, i) => [o, i])).forEach(([o, i]) => {
    const b = $(`<button class="opt">${esc(o)}</button>`);
    b.onclick = () => {
      if (sayIt && /[a-z]/i.test(o) && !/[əğışçöü]/i.test(o)) speak(o);
      if (i === a) { b.classList.add("right"); box.querySelectorAll("button").forEach(x => x.disabled = true); setTimeout(onRight, 900); }
      else { b.classList.add("wrong"); msg.className = "msg bad"; msg.textContent = "Yox, bir daha dinlə və fikirləş."; }
    };
    box.appendChild(b);
  });
  d.append(box, msg);
}
function choiceUI(t, d) { optionsUI(t.opts, t.a, d, () => { if (/[a-z]/i.test(t.opts[t.a]) && !/[əğışçöü]/i.test(t.opts[t.a])) addPhrase(t.opts[t.a]); completeTask(t); }); }

function listenUI(t, d, sp) {
  if (t.pic && PICS[t.pic]) d.appendChild($(PICS[t.pic]));
  d.appendChild($(`<p class="hint q">❔ ${esc(t.q)}</p>`));
  optionsUI(t.opts, t.a, d, () => {
    // reveal what was said, so its words reach the journal
    d.querySelector(".listen")?.remove();
    const rev = $(`<div class="reveal"></div>`); t.say.forEach(l => rev.appendChild(lineEl(l)));
    d.querySelector(".who").after(rev);
    setTimeout(() => completeTask(t), 1800);
  }, { say: false });
}

function fillUI(t, d) {
  let k = 0;
  const box = $(`<div class="fill"></div>`); d.appendChild(box);
  const next = () => {
    if (k >= t.items.length) return setTimeout(() => completeTask(t), 500);
    const it = t.items[k], p = $(`<div class="fillitem"></div>`);
    const [pre, post] = it.text.split("___");
    p.appendChild($(`<p class="line">${esc(pre)}<span class="gap">?</span>${esc(post || "")}</p>`)); box.appendChild(p);
    optionsUI(it.opts, it.a, p, () => {
      p.querySelector(".opts").remove(); p.querySelector(".msg").remove();
      const full = it.text.replace("___", it.opts[it.a]); p.replaceChildren(lineEl(full)); speak(full);
      k++; next();
    }, { say: false });
  };
  next();
}

function orderUI(t, d) {
  d.appendChild($(`<p class="hint">Cümlələrə toxunaraq onları düzgün ardıcıllıqla düz.</p>`));
  let built = [];
  const pool = shuffle(t.lines.map((l, i) => ({ l, i }))), list = $(`<ol class="orderlist"></ol>`), tiles = $(`<div class="opts"></div>`), msg = $(`<p class="msg"></p>`);
  const clr = btn("Təmizlə");
  const draw = () => {
    list.innerHTML = ""; built.forEach((x, n) => { const li = $(`<li><button class="opt sel">${esc(x.l)}</button></li>`); li.firstChild.onclick = () => { built.splice(n, 1); draw(); }; list.appendChild(li); });
    tiles.innerHTML = ""; pool.forEach(x => { if (built.includes(x)) return; const b = $(`<button class="opt">${esc(x.l)}</button>`); b.onclick = () => { built.push(x); speak(x.l); draw(); check(); }; tiles.appendChild(b); });
  };
  const check = () => {
    if (built.length < t.lines.length) { msg.textContent = ""; return; }
    if (built.every((x, n) => x.i === n)) {
      msg.className = "msg ok"; msg.textContent = "Doğrudur!";
      tiles.remove(); clr.remove(); list.replaceWith(Object.assign(document.createElement("div"), { className: "reveal" }));
      const rev = d.querySelector(".reveal"); t.lines.forEach(l => rev.appendChild(lineEl(l)));
      setTimeout(() => completeTask(t), 1600);
    } else { msg.className = "msg bad"; msg.textContent = "Sıra səhvdir. Səhv cümləyə toxunub geri qaytar."; }
  };
  clr.onclick = () => { built = []; draw(); msg.textContent = ""; };
  draw(); d.append(list, tiles, row(clr), msg);
}

function anagramUI(t, d) {
  const word = t.word.toUpperCase();
  let letters = shuffle([...word].map((c, i) => ({ c, i })));
  while (letters.map(x => x.c).join("") === word) letters = shuffle(letters);
  let built = [];
  d.appendChild($(`<p class="hint">🧩 Ekrandakı hərflər qarışıb. Onlara düzgün sırayla toxun.</p>`));
  const area = $(`<div class="built letters"></div>`), tiles = $(`<div class="tiles"></div>`), msg = $(`<p class="msg"></p>`);
  const clr = btn("Təmizlə"), hintB = btn("💡 İpucu");
  const draw = () => {
    area.innerHTML = ""; built.forEach((x, n) => { const b = $(`<button class="tile">${x.c}</button>`); b.onclick = () => { built.splice(n, 1); draw(); }; area.appendChild(b); });
    for (let n = built.length; n < word.length; n++) area.appendChild($(`<span class="tile blank">_</span>`));
    tiles.innerHTML = ""; letters.forEach(x => { const b = $(`<button class="tile${built.includes(x) ? " used" : ""}">${x.c}</button>`); b.onclick = () => { built.push(x); draw(); check(); }; tiles.appendChild(b); });
  };
  const check = () => {
    if (built.length < word.length) return;
    if (built.map(x => x.c).join("") === word) { msg.className = "msg ok"; msg.textContent = `${word}! Doğrudur.`; speak(t.word); tiles.remove(); clr.remove(); hintB.remove(); area.replaceWith(lineEl(t.word.toUpperCase(), "sign")); setTimeout(() => completeTask(t), 1200); }
    else { msg.className = "msg bad"; msg.textContent = "Belə söz yoxdur. Yenə cəhd et."; }
  };
  clr.onclick = () => { built = []; draw(); msg.textContent = ""; };
  hintB.onclick = () => { msg.className = "msg"; msg.textContent = `Söz "${word[0]}" hərfi ilə başlayır və ${word.length} hərfdir. Dinlə:`; speak(t.word, .6); };
  draw(); d.append(area, tiles, row(clr, hintB), msg);
}

function buildUI(t, d) {
  const target = t.answer.split(" ");
  const pool = shuffle([...target, ...t.extra].map((w, i) => ({ w, i })));
  let built = [];
  d.appendChild($(`<p class="hint">Cavabı sözlərdən qur, sonra ucadan de.</p>`));
  const area = $(`<div class="built" aria-label="Sənin cümlən"></div>`), tiles = $(`<div class="tiles"></div>`), msg = $(`<p class="msg"></p>`);
  const clr = btn("Təmizlə"), chk = btn("Yoxla", "btn primary");
  const draw = () => {
    area.innerHTML = ""; built.forEach((x, k) => { const b = $(`<button class="tile">${esc(x.w)}</button>`); b.onclick = () => { built.splice(k, 1); draw(); }; area.appendChild(b); });
    tiles.innerHTML = ""; pool.forEach(x => { const b = $(`<button class="tile${built.includes(x) ? " used" : ""}">${esc(x.w)}</button>`); b.onclick = () => { built.push(x); speak(x.w); draw(); }; tiles.appendChild(b); });
  };
  clr.onclick = () => { built = []; draw(); };
  chk.onclick = () => {
    const s = built.map(x => x.w).join(" ");
    if (norm(s).join(" ") === norm(t.answer).join(" ")) { msg.className = "msg ok"; msg.textContent = "Doğrudur! İndi bunu ucadan de."; area.remove(); tiles.remove(); clr.parentNode.remove(); speakUI(t.answer, d, () => { addPhrase(t.answer); completeTask(t); }); }
    else { msg.className = "msg bad"; msg.textContent = built.length < target.length ? "Cümlə tam deyil." : "Söz sırası və ya sözlər səhvdir."; }
  };
  draw(); d.append(area, tiles, row(clr, chk), msg);
}

function speakUI(target, d, onPass) {
  const box = $(`<div class="stack"><p class="line big">“${esc(target)}”</p><div class="row act"></div><p class="heard"></p><div class="meter"><i></i></div><p class="msg"></p></div>`);
  const act = box.querySelector(".act"), heard = box.querySelector(".heard"), bar = box.querySelector(".meter i"), msg = box.querySelector(".msg");
  const play = $(`<button class="icon" aria-label="Nümunəni dinlə">▶</button>`); play.onclick = () => speak(target);
  let passed = false;
  const judge = text => {
    const r = scoreSpeech(target, text);
    heard.innerHTML = r.words.map((w, k) => `<span class="${r.hit[k] ? "hit" : "miss"}">${esc(w)}</span>`).join(" ");
    bar.style.width = Math.round(r.score * 100) + "%";
    if (r.score >= PASS) { if (passed) return; passed = true; msg.className = "msg ok"; msg.textContent = `Səni anladılar (${Math.round(r.score * 100)}%).`; setTimeout(onPass, 1100); }
    else { msg.className = "msg bad"; msg.textContent = `${Math.round(r.score * 100)}%. Qırmızı sözlərə diqqət et və yenə de.`; }
  };
  const build = () => {
    act.innerHTML = "";
    if (!micBroken) {
      const mic = $(`<button class="mic" aria-label="Danış">🎙</button>`); let rec = null;
      mic.onclick = () => {
        if (rec) { rec.stop(); return; }
        window.speechSynthesis && speechSynthesis.cancel(); mic.classList.add("live"); heard.textContent = "Dinləyirəm…";
        rec = listenOnce(x => heard.textContent = x, (err, fin) => {
          mic.classList.remove("live"); rec = null;
          if (micBroken) { build(); return; }
          if (fin) judge(fin); else { msg.className = "msg bad"; msg.textContent = err && err !== "no-speech" ? "Səs alınmadı: " + err : "Heç nə eşidilmədi. Bas və danış."; }
        });
      };
      const skip = btn("Mikrofonsuz"); skip.onclick = () => { micBroken = true; build(); };
      act.append(mic, play, $(`<span class="hint flex1">Mikrofona bas və cümləni de.</span>`), skip);
    } else {
      const inp = $(`<input type="text" placeholder="Ucadan de, sonra dediyini yaz…" autocomplete="off" aria-label="Dediyin cümlə">`); inp.classList.add("flex1");
      const ok = btn("Yoxla", "btn primary"); ok.onclick = () => judge(inp.value); inp.onkeydown = e => { if (e.key === "Enter") judge(inp.value); };
      act.append(play, inp, ok);
      if (!act.nextElementSibling?.classList.contains("note")) act.after($(`<p class="note">Mikrofon yoxdur və ya icazə verilməyib. Cümləni ucadan de və yaz. Mikrofon Chrome/Edge-də, saytın öz ünvanında işləyir.</p>`));
    }
  };
  build(); d.appendChild(box);
}

function freeUI(t, d) {
  const ps = PS();
  const box = $(`<div class="stack"><p class="hint">Ən azı ${t.min} söz danış və ya yaz. Səhvlərdən qorxma: məqsəd axıcılıqdır. ${esc(t.prompt || "")}</p><div class="row act"></div><textarea id="free-talk" aria-label="Sənin cavabın" placeholder="Danışdıqların burada görünəcək…"></textarea><div class="row"><span class="msg flex1"></span><button class="btn primary">Göndər</button></div></div>`);
  const ta = box.querySelector("textarea"), msg = box.querySelector(".msg"), send = box.querySelector(".btn.primary"), act = box.querySelector(".act");
  ta.value = ps.free;
  const upd = () => { ps.free = ta.value; save(); const n = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0; msg.textContent = `${n} söz` + (n >= t.min ? " ✓" : ""); msg.className = "msg flex1" + (n >= t.min ? " ok" : ""); send.disabled = n < t.min; };
  ta.oninput = upd; upd();
  if (!micBroken) {
    const mic = $(`<button class="mic" aria-label="Danış">🎙</button>`); let rec = null;
    mic.onclick = () => { if (rec) { rec.stop(); return; } mic.classList.add("live"); const base = ta.value.trim(); rec = listenOnce(x => { ta.value = (base ? base + " " : "") + x; }, () => { mic.classList.remove("live"); rec = null; upd(); }); };
    act.append(mic, $(`<span class="hint">Bas, danış, dayan. Yenidən basıb davam et.</span>`));
  }
  const rd = btn("▶ Mətnimi oxu"); rd.onclick = () => speak(ta.value); act.append(rd);
  send.onclick = () => { ps.free = ""; save(); completeTask(t); };
  d.appendChild(box);
}

/* ======================= JOURNAL ======================= */
let jTab = null, picking = null;
function openJournal() { jTab = S.place; picking = null; drawJournal(); }
function drawJournal() {
  layer.innerHTML = "";
  const ov = $(`<div class="overlay" role="dialog" aria-modal="true" aria-label="Dəftər"></div>`), sh = $(`<div class="sheet"></div>`); ov.appendChild(sh);
  ov.onclick = e => { if (e.target === ov) closeLayer(); };
  sh.appendChild($(`<div class="row"><h2 class="flex1">Səyyahın dəftəri</h2><button class="btn" id="jclose">Bağla</button></div>`));
  sh.querySelector("#jclose").onclick = closeLayer;
  const tabs = $(`<div class="tabs" role="tablist"></div>`);
  PLACES.forEach((pl, i) => { if (!unlocked(i)) return; const b = $(`<button role="tab" aria-selected="${i === jTab}">${esc(pl.az)}${journalDone(i) ? " ✓" : ""}</button>`); b.onclick = () => { jTab = i; picking = null; drawJournal(); }; tabs.appendChild(b); });
  sh.appendChild(tabs);
  const pi = jTab, ps = S.p[pi], words = PLACES[pi].words;
  sh.appendChild($(`<p class="hint">Dialoqlarda və lövhələrdə altından xətt çəkilmiş sözlər bura yazılır. Sözün xanasına toxun və mənasına uyğun şəkli seç. Səhifənin 4 sözü də doğru olanda səhifə möhürlənir və tərcümə açılır.</p>`));
  const pages = $(`<div class="pages"></div>`);
  pagesOf(pi).forEach((pg, k) => {
    const sealed = ps.sealed.includes(k);
    const el = $(`<div class="page${sealed ? " sealed" : ""}"><h3>Səhifə ${k + 1}${sealed ? "<small>Deşifrə edildi</small>" : ""}</h3></div>`);
    pg.forEach(x => {
      const seen = ps.seen.includes(x.w), g = sealed ? x.p : ps.guess[x.w];
      const e = $(`<div class="entry"><button class="slot${g ? " filled" : ""}${picking === x.w ? " picking" : ""}">${g || ""}</button><div class="w${seen ? "" : " unknown"}">${seen ? esc(x.w) : "· · ·"}${sealed ? `<span class="az">${esc(x.az)}</span>` : ""}</div></div>`);
      const slot = e.querySelector(".slot");
      slot.setAttribute("aria-label", seen ? `${x.w}: şəkil seç` : "Hələ tapılmayıb");
      if (sealed || !seen) slot.disabled = true; else slot.onclick = () => { picking = picking === x.w ? null : x.w; speak(x.w); drawJournal(); };
      if (seen) { e.querySelector(".w").style.cursor = "pointer"; e.querySelector(".w").onclick = () => speak(x.w); }
      el.appendChild(e);
    });
    if (!sealed) {
      const allSeen = pg.every(x => ps.seen.includes(x.w)), allSet = pg.every(x => ps.guess[x.w]);
      const msg = $(`<p class="msg"></p>`), chk = btn("Səhifəni yoxla", "btn primary");
      chk.disabled = !(allSeen && allSet);
      if (!allSeen) msg.innerHTML = `<span class="hint">Bu səhifənin bütün sözlərini hələ eşitməmisən. Danışmağa və lövhələri oxumağa davam et.</span>`;
      chk.onclick = () => {
        const wrong = pg.filter(x => ps.guess[x.w] !== x.p).length;
        if (!wrong) { ps.sealed.push(k); save(); pg.forEach((x, n) => setTimeout(() => speak(x.w), n * 800)); drawJournal(); renderQuest(); renderScene(); if (placeDone(pi) && pi === S.place) say("Bu yer tamamlandı! Çıxış indi açıqdır: parlayan nişana bax."); return; }
        msg.className = "msg bad"; msg.textContent = wrong === 1 ? "Az qaldı: yalnız bir söz səhvdir." : "Hələ deyil. Bəzi mənalar səhvdir.";
      };
      el.append(chk, msg);
    }
    pages.appendChild(el);
  });
  sh.appendChild(pages);
  if (ps.sealed.length < 2) {
    const used = new Set(Object.values(ps.guess));
    const pal = $(`<div class="page"><p class="hint">${picking ? `<b>${esc(picking)}</b> üçün şəkil seç:` : "Şəkillər. Əvvəlcə bir sözün xanasına toxun."}</p><div class="palette"></div></div>`);
    [...words].sort((a, b) => a.p < b.p ? -1 : 1).forEach(x => {
      const b = $(`<button class="pict${used.has(x.p) ? " used" : ""}">${x.p}</button>`); b.disabled = !picking;
      b.onclick = () => { for (const q in ps.guess) if (ps.guess[q] === x.p) delete ps.guess[q]; ps.guess[picking] = x.p; picking = null; save(); drawJournal(); };
      pal.querySelector(".palette").appendChild(b);
    });
    sh.appendChild(pal);
  } else if (pi === S.place && placeDone(pi)) {
    sh.appendChild($(`<p class="msg ok">Bu yerin sözləri deşifrə edildi. Çıxış açıqdır.</p>`));
  }
  layer.appendChild(ov);
}
function closeLayer() { layer.innerHTML = ""; }

/* ======================= BAG ======================= */
function openBag() {
  layer.innerHTML = "";
  const ov = $(`<div class="overlay" role="dialog" aria-modal="true" aria-label="Çanta"><div class="sheet"><div class="row"><h2 class="flex1">Çanta</h2><button class="btn">Bağla</button></div>
    <p class="hint">Səyahətdə topladıqların və öyrəndiyin ifadələr. İfadəyə toxun: dinlə və təkrar et.</p>
    <div class="items"></div><h3 class="sub">İfadələr kitabçası</h3><div class="phrases"></div></div></div>`);
  ov.onclick = e => { if (e.target === ov) closeLayer(); };
  ov.querySelector(".btn").onclick = closeLayer;
  const items = ov.querySelector(".items"), ph = ov.querySelector(".phrases");
  if (!S.bag.length) items.appendChild($(`<p class="hint">Çanta hələ boşdur.</p>`));
  S.bag.forEach(b => items.appendChild($(`<div class="item"><span>${b.e}</span>${esc(b.n)}</div>`)));
  if (!S.phrases.length) ph.appendChild($(`<p class="hint">Qurduğun və seçdiyin cümlələr burada toplanacaq.</p>`));
  S.phrases.forEach(s => { const b = $(`<button class="opt">▶ ${esc(s)}</button>`); b.onclick = () => speak(s); ph.appendChild(b); });
  layer.appendChild(ov);
}
let toastT = null;
function toast(text) {
  let el = document.getElementById("toast"); if (!el) { el = $(`<div id="toast" role="status"></div>`); document.body.appendChild(el); }
  el.textContent = text; el.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("on"), 2600);
}

/* ======================= MAP / FLOW ======================= */
function openMap() {
  layer.innerHTML = "";
  const ov = $(`<div class="overlay" role="dialog" aria-modal="true" aria-label="Səyahət xəritəsi"><div class="sheet"><div class="row"><h2 class="flex1">Səyahət xəritəsi</h2><button class="btn">Bağla</button></div>
    <p class="hint">Hər yer əvvəlki tamamlananda açılır. Keçdiyin yerlərə qayıdıb təkrar edə bilərsən.</p><ol class="trip"></ol></div></div>`);
  ov.onclick = e => { if (e.target === ov) closeLayer(); };
  ov.querySelector(".btn").onclick = closeLayer;
  const list = ov.querySelector(".trip");
  PLACES.forEach((pl, i) => {
    const st = placeDone(i) ? "✓" : unlocked(i) ? "▶" : "🔒";
    const li = $(`<li class="${i === S.place ? "here" : ""}${unlocked(i) ? "" : " locked"}"><button ${unlocked(i) ? "" : "disabled"}><span class="st">${st}</span><span class="nm">${esc(pl.name)}<small>${esc(pl.az)} · ${esc(pl.cefr)}</small></span><span class="pc">${Math.min(S.p[i].task, pl.tasks.length)}/${pl.tasks.length}</span></button></li>`);
    if (unlocked(i)) li.querySelector("button").onclick = () => { closeLayer(); if (i !== S.place) travel(i); };
    list.appendChild(li);
  });
  layer.appendChild(ov);
}
function story() {
  const pl = P();
  layer.innerHTML = "";
  const ov = $(`<div class="overlay"><div class="sheet center"><p class="kicker">Yer ${S.place + 1} / ${PLACES.length} · ${esc(pl.cefr)}</p><h2>${esc(pl.name)}</h2><p>${esc(pl.story)}</p><button class="btn primary">Başla</button></div></div>`);
  ov.querySelector("button").onclick = () => { closeLayer(); S.started = true; PS().intro = true; save(); say("Yerə toxunaraq gəz, insanlara və əşyalara toxunaraq danış. Parlayan almaz kiminlə danışmalı olduğunu göstərir. Klaviaturada W A S D da işləyir."); };
  layer.appendChild(ov);
}
function travel(i) { S.place = i; save(); renderAll(); if (!PS().intro) story(); }
function ending() {
  S.ended = true; save(); speak("Welcome home, traveler. You can speak English freely now.");
  const learned = S.p.reduce((n, p) => n + p.sealed.length * 4, 0);
  layer.innerHTML = "";
  const ov = $(`<div class="overlay"><div class="sheet center"><p class="kicker">Səyahət bitdi</p><h2>Gün batımı</h2><p>Leyla ilə gölün kənarında gün batımına baxırsan. Sən ${learned} söz deşifrə etdin, ${S.phrases.length} ifadə öyrəndin və on yerdə ingiliscə danışdın: aeroportdan parka qədər. A2-dən B1-ə yol belə keçir: hər gün bir az dinlə, bir az danış.</p><div class="row" style="justify-content:center"><button class="btn" id="again">Yenidən başla</button><button class="btn primary" id="stay">Parkda qal</button></div></div></div>`);
  ov.querySelector("#again").onclick = () => { S = fresh(); save(); renderAll(); story(); };
  ov.querySelector("#stay").onclick = closeLayer;
  layer.appendChild(ov);
}
function menu() {
  layer.innerHTML = "";
  const ov = $(`<div class="overlay"><div class="sheet"><div class="row"><h2 class="flex1">Menyu</h2><button class="btn" id="mclose">Bağla</button></div>
    <label class="row" for="rate">Danışıq sürəti <input id="rate" class="flex1" type="range" min="0.6" max="1.1" step="0.05" value="${S.rate}"></label>
    <div class="row"><button class="btn" id="mmic">${micBroken ? "Mikrofonu yenidən yoxla" : "Mikrofonsuz oyna (yazaraq)"}</button><a class="btn" href="https://wdaz.github.io/ower-of-words/">Tower of Words oyununa keç</a></div>
    <div class="row"><button class="btn" id="mreset">Oyunu sıfırla</button></div></div></div>`);
  ov.onclick = e => { if (e.target === ov) closeLayer(); };
  ov.querySelector("#mclose").onclick = closeLayer;
  ov.querySelector("#rate").oninput = e => { S.rate = +e.target.value; save(); };
  ov.querySelector("#mmic").onclick = () => { micBroken = micBroken ? !SR : true; closeLayer(); toast(micBroken ? "Yazaraq rejim açıqdır." : "Mikrofon rejimi açıqdır."); };
  let armed = false; ov.querySelector("#mreset").onclick = e => { if (!armed) { armed = true; e.target.textContent = "Əminsən? Yenidən bas"; return; } S = fresh(); save(); loadedPlace = -1; renderAll(); story(); };
  layer.appendChild(ov);
}
function renderAll() { document.body.dataset.place = P().id; renderScene(); renderQuest(); updateCount(); say("Yerə toxunaraq gəz, insanlara və əşyalara toxunaraq danış. Parlayan almaz kiminlə danışmalı olduğunu göstərir. Klaviaturada W A S D da işləyir."); }
document.getElementById("journalBtn").onclick = openJournal;
document.getElementById("bagBtn").onclick = openBag;
document.getElementById("mapBtn").onclick = openMap;
document.getElementById("menuBtn").onclick = menu;

// handle for tests and debugging
window.TRAVEL = { get S() { return S; }, PLACES, P, PS, tasksDone, placeDone, openJournal, engine, setMicBroken(v) { micBroken = v; }, clickSpot, save, renderAll, travel };
renderAll(); if (!S.started || !PS().intro) story();
