/* Vault — SHA-256 gate, letter, notes, galaxy photos */
(function () {
  const HASH = 'bb2ce3575d751a87855bd65fe6b2169bb8816c12c23e436422aeda893f217d08';
  const SESSION_KEY = 'blub_vault_ok';
  const NOTES_KEY = 'blub_monthly_notes';
  const PHOTOS_KEY = 'blub_galaxy_photos';

  const gate = document.getElementById('vaultGate');
  const content = document.getElementById('vaultContent');
  const form = document.getElementById('vaultForm');
  const err = document.getElementById('vaultError');
  if (!form) return;

  async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function unlock() {
    gate.classList.add('vault-hidden');
    content.classList.remove('vault-hidden');
    sessionStorage.setItem(SESSION_KEY, '1');
    renderNotes();
    renderPhotos();
    const pw = sessionStorage.getItem('blub_vault_pw');
    if (pw && window.BlubBoard) window.BlubBoard.open(pw);
  }
  function lock() {
    sessionStorage.removeItem('blub_vault_pw');
    if (window.BlubBoard) window.BlubBoard.close();
    content.classList.add('vault-hidden');
    gate.classList.remove('vault-hidden');
    sessionStorage.removeItem(SESSION_KEY);
    document.getElementById('vaultPw').value = '';
  }

  if (sessionStorage.getItem(SESSION_KEY) === '1') unlock();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.textContent = '';
    const pw = document.getElementById('vaultPw').value;
    const h = await sha256(pw);
    if (h === HASH) {
      sessionStorage.setItem('blub_vault_pw', pw);
      unlock();
      if (window.spawnHeart) window.spawnHeart(window.innerWidth / 2, 200);
    } else {
      err.textContent = 'Not quite — ask Ryu for the key 💙';
    }
  });

  document.getElementById('vaultLock').addEventListener('click', lock);

  /* Notes */
  function getNotes() {
    try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'); }
    catch { return []; }
  }
  function saveNotes(arr) {
    localStorage.setItem(NOTES_KEY, JSON.stringify(arr));
  }
  function renderNotes() {
    const list = document.getElementById('notesList');
    const notes = getNotes().sort((a, b) => b.month.localeCompare(a.month));
    list.innerHTML = '';
    if (!notes.length) {
      list.innerHTML = '<li style="color:var(--ink-soft);font-size:0.9rem">No notes yet — write the first one ♡</li>';
      return;
    }
    notes.forEach((n, i) => {
      const li = document.createElement('li');
      li.className = 'note-item';
      li.innerHTML = '<div class="note-date"></div><div class="note-title"></div><p></p><button type="button" class="note-del">Delete</button>';
      li.querySelector('.note-date').textContent = n.month;
      li.querySelector('.note-title').textContent = n.title;
      li.querySelector('p').textContent = n.body;
      li.querySelector('.note-del').addEventListener('click', () => {
        const all = getNotes().filter((_, idx) => {
          // match by month+title+body after sort — use id
          return true;
        });
        const fresh = getNotes().filter((x) => x.id !== n.id);
        saveNotes(fresh);
        renderNotes();
      });
      list.appendChild(li);
    });
  }

  document.getElementById('notesForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const month = document.getElementById('noteMonth').value;
    const title = document.getElementById('noteTitle').value.trim();
    const body = document.getElementById('noteBody').value.trim();
    if (!month || !title || !body) return;
    const notes = getNotes();
    notes.push({ id: Date.now().toString(36), month, title, body });
    saveNotes(notes);
    e.target.reset();
    renderNotes();
  });

  /* Galaxy photos */
  function getPhotos() {
    try { return JSON.parse(localStorage.getItem(PHOTOS_KEY) || '[]'); }
    catch { return []; }
  }
  function savePhotos(arr) {
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(arr));
  }
  function renderPhotos() {
    const gal = document.getElementById('photoGallery');
    const photos = getPhotos();
    gal.innerHTML = '';
    photos.forEach((p) => {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'position:relative;border-radius:12px;overflow:hidden;border:1px solid var(--glass-border);aspect-ratio:1;background:#E4ECF8';
      const img = document.createElement('img');
      img.src = p.data;
      img.alt = p.name || 'Galaxy photo';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block';
      const del = document.createElement('button');
      del.type = 'button';
      del.textContent = '×';
      del.setAttribute('aria-label', 'Remove photo');
      del.style.cssText = 'position:absolute;top:4px;right:4px;width:28px;height:28px;border:none;border-radius:50%;background:rgba(106,136,198,.85);color:#fff;cursor:pointer;font-size:1.1rem;line-height:1';
      del.addEventListener('click', () => {
        savePhotos(getPhotos().filter((x) => x.id !== p.id));
        renderPhotos();
      });
      wrap.appendChild(img);
      wrap.appendChild(del);
      gal.appendChild(wrap);
    });
  }

  document.getElementById('photoInput').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 1.5e6) {
        alert('Keep photos under ~1.5MB so localStorage can hold them.');
        continue;
      }
      const data = await readFile(file);
      const photos = getPhotos();
      // rough quota guard
      try {
        photos.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: file.name, data });
        savePhotos(photos);
      } catch {
        alert('Storage full — remove an old photo first.');
        break;
      }
    }
    renderPhotos();
  });

  function readFile(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }
})();
