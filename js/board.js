/* Shared message board — AES-GCM encrypted (PBKDF2 from vault password), stored on api.restful-api.dev */
(function () {
  const API = 'https://api.restful-api.dev/objects/';
  const OBJ = 'ff808181a09d98f701a11720018f1861';
  const SALT = 'blub-board-v1-salt';
  const enc = new TextEncoder(), dec = new TextDecoder();
  let key = null, timer = null;
  const b64 = (u) => btoa(String.fromCharCode(...new Uint8Array(u)));
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

  async function deriveKey(pw) {
    const base = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode(SALT), iterations: 150000, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function load() {
    const r = await fetch(API + OBJ, { cache: 'no-store' });
    if (!r.ok) throw new Error('load ' + r.status);
    const d = (await r.json()).data || {};
    if (!d.ct) return [];
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(d.iv) }, key, unb64(d.ct));
    return JSON.parse(dec.decode(pt));
  }
  async function save(msgs) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(msgs)));
    const r = await fetch(API + OBJ, { method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'blub-board', data: { v: 1, iv: b64(iv), ct: b64(ct) } }) });
    if (!r.ok) throw new Error('save ' + r.status);
  }

  const $ = (id) => document.getElementById(id);
  function status(t) { const s = $('boardStatus'); if (s) s.textContent = t; }
  function render(msgs) {
    const list = $('boardList');
    list.innerHTML = '';
    if (!msgs.length) { list.innerHTML = '<li style="color:var(--ink-soft);font-size:0.9rem">No messages yet — leave the first one 💙</li>'; return; }
    msgs.slice().sort((a, b) => b.t - a.t).forEach((m) => {
      const li = document.createElement('li');
      li.className = 'note-item board-msg';
      li.innerHTML = '<div class="note-date"></div><div class="note-title"></div><p></p>';
      li.querySelector('.note-date').textContent = new Date(m.t).toLocaleString();
      li.querySelector('.note-title').textContent = m.name;
      li.querySelector('p').textContent = m.text;
      list.appendChild(li);
    });
  }
  async function refresh() {
    try { render(await load()); status('Synced ✓'); }
    catch (e) { status('Could not load messages (offline?)'); }
  }

  window.BlubBoard = {
    async open(pw) {
      key = await deriveKey(pw);
      await refresh();
      clearInterval(timer); timer = setInterval(refresh, 20000);
    },
    close() { key = null; clearInterval(timer); const l = $('boardList'); if (l) l.innerHTML = ''; },
  };

  const form = $('boardForm');
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!key) return;
    const sel = $('boardName').value, other = $('boardOther').value.trim();
    const name = sel === 'other' ? (other || 'Someone') : sel;
    const text = $('boardText').value.trim();
    if (!text) return;
    const btn = form.querySelector('button'); btn.disabled = true; status('Posting…');
    try {
      const msgs = await load();
      msgs.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: name.slice(0, 40), text: text.slice(0, 1000), t: Date.now() });
      await save(msgs.slice(-300));
      $('boardText').value = '';
      render(msgs); status('Posted 💙');
      if (window.spawnHeart) window.spawnHeart(window.innerWidth / 2, 300);
    } catch (err) { status('Could not post — try again'); }
    btn.disabled = false;
  });
  const nameSel = $('boardName');
  if (nameSel) nameSel.addEventListener('change', () => { $('boardOther').style.display = nameSel.value === 'other' ? '' : 'none'; });
})();
