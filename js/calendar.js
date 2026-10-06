/* Blub calendar — Dec 2025 → Dec 2052 */
(function () {
  const MIN = { y: 2025, m: 11 }; // Dec 2025 (0-indexed month)
  const MAX = { y: 2052, m: 11 };
  let viewY = 2025;
  let viewM = 11;

  const titleEl = document.getElementById('calTitle');
  const grid = document.getElementById('calGrid');
  if (!grid) return;

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function clamp() {
    if (viewY < MIN.y || (viewY === MIN.y && viewM < MIN.m)) { viewY = MIN.y; viewM = MIN.m; }
    if (viewY > MAX.y || (viewY === MAX.y && viewM > MAX.m)) { viewY = MAX.y; viewM = MAX.m; }
  }

  function specials(y, m, d) {
    const tags = [];
    const msgs = [];
    if (m === 11 && d === 4) {
      tags.push('special', 'dating');
      msgs.push({ title: 'Dating day · Dec 4', body: 'The night we started — Ryu & Lilu talking past midnight. We celebrate two days. Happy Blub anniversary 💙' });
    }
    if (m === 11 && d === 5) {
      tags.push('special', 'dating', 'monthly');
      msgs.push({ title: 'Dating day · Dec 5', body: 'Day two of our beginning — and every month\'s primary anniversary. Soft blue forever, Lilu.' });
    }
    if (m === 3 && d === 27) {
      tags.push('special', 'bday-ryu');
      msgs.push({ title: "Ryu's birthday", body: 'April 27 — celebrate Ryu (Malaak)! Blow soft blue bubbles for her 🫧' });
    }
    if (m === 1 && d === 19) {
      tags.push('special', 'bday-lilu');
      msgs.push({ title: "Lilu's birthday", body: 'February 19 — celebrate Lilu (Lisa)! Ryu loves you extra today 💙' });
    }
    if (m === 6 && d === 4) {
      tags.push('special');
      msgs.push({ title: 'July 4 · Blub day', body: 'A marked day on our calendar — soft blue, fireworks optional, love required.' });
    }
    // Monthly anniversary: 5th of every month (and mark Dec 4 specially already)
    if (d === 5 && !(m === 11)) {
      tags.push('special', 'monthly');
      msgs.push({ title: 'Monthly Blub anniversary', body: 'Another month of us — Ryu ♡ Lilu. Leave a note in the vault if you want.' });
    }
    // Also mark 4th lightly as secondary monthly nod (except already dating Dec)
    if (d === 4 && m !== 11 && m !== 6) {
      tags.push('special', 'monthly');
      msgs.push({ title: 'Soft anniversary echo', body: 'Dec 4 energy — a little reminder of the night we began. Blub loves you.' });
    }
    return { tags: [...new Set(tags)], msgs };
  }

  function render() {
    clamp();
    titleEl.textContent = MONTHS[viewM] + ' ' + viewY;
    grid.innerHTML = '';
    const first = new Date(viewY, viewM, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
    const today = new Date();

    for (let i = 0; i < startPad; i++) {
      const e = document.createElement('div');
      e.className = 'cal-day empty';
      e.setAttribute('aria-hidden', 'true');
      grid.appendChild(e);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-day';
      btn.textContent = d;
      const sp = specials(viewY, viewM, d);
      if (sp.tags.length) {
        btn.classList.add(...sp.tags);
        btn.setAttribute('aria-label', sp.msgs.map(m => m.title).join(', '));
        btn.addEventListener('click', (e) => {
          const msg = sp.msgs[0];
          window.openModal(msg.title, msg.body);
          if (window.spawnHeart) window.spawnHeart(e.clientX, e.clientY);
        });
      } else {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
      }
      if (today.getFullYear() === viewY && today.getMonth() === viewM && today.getDate() === d) {
        btn.classList.add('today');
      }
      grid.appendChild(btn);
    }
  }

  function shift(dm, dy) {
    viewM += dm;
    viewY += dy;
    while (viewM > 11) { viewM -= 12; viewY++; }
    while (viewM < 0) { viewM += 12; viewY--; }
    render();
  }

  document.getElementById('calPrev').addEventListener('click', () => shift(-1, 0));
  document.getElementById('calNext').addEventListener('click', () => shift(1, 0));
  document.getElementById('calPrevY').addEventListener('click', () => shift(0, -1));
  document.getElementById('calNextY').addEventListener('click', () => shift(0, 1));

  // Start at Dec 2025 or current month if in range
  const now = new Date();
  if (now >= new Date(2025, 11, 1) && now <= new Date(2052, 11, 31)) {
    viewY = now.getFullYear();
    viewM = now.getMonth();
  }
  render();
})();
