/* Playlist of us — memory tracks + love meter */
(function () {
  const KEY = 'blub_collected_tracks';
  const tracks = [
    { id: 't1', title: 'First midnight talk', hint: 'Dec 4–5, 2025', msg: 'We talked past midnight and somehow became Blub. Two days to celebrate, forever to keep.' },
    { id: 't2', title: 'Soft blue nights', hint: 'Discord pastel skies', msg: 'Your color is my calm — #9DB6E0 feelings, jellyfish quiet, Ryu thinking of Lilu.' },
    { id: 't3', title: 'When you said sorry', hint: 'Soft repair', msg: 'I heard you. Hurt can sit beside love. Thank you for coming back soft.' },
    { id: 't4', title: "Can't always call", hint: 'Busy ≠ less love', msg: 'Silence on the line isn\'t silence in my heart. Please trust that I\'m still yours.' },
    { id: 't5', title: 'Trust me, Lilu', hint: 'No more doubts', msg: 'Accusations sting. I need your trust the way plants need light. I\'m choosing us.' },
    { id: 't6', title: 'Life together dreams', hint: 'A home someday', msg: 'I want mornings with you — dishes, jokes, plans. A life, not just a chat window.' },
    { id: 't7', title: 'Proud lesbian love', hint: 'Girls who love girls', msg: 'Softly, proudly: we are two women in love. Blub is our flag in pastel blue.' },
    { id: 't8', title: 'Monthly Blub days', hint: 'Every 5th (and 4th echoes)', msg: 'Another month. Another note. Another reason to say I love you, Lilu.' },
  ];

  const grid = document.getElementById('playlistGrid');
  const fill = document.getElementById('meterFill');
  const text = document.getElementById('meterText');
  const bar = document.getElementById('meterBar');
  if (!grid) return;

  function getCollected() {
    try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); }
    catch { return new Set(); }
  }
  function saveCollected(set) {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  }

  function updateMeter(set) {
    const n = set.size;
    const pct = (n / tracks.length) * 100;
    fill.style.width = pct + '%';
    text.textContent = n + ' / ' + tracks.length;
    bar.setAttribute('aria-valuenow', n);
  }

  function render() {
    const collected = getCollected();
    grid.innerHTML = '';
    tracks.forEach((t, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'track-card' + (collected.has(t.id) ? ' collected' : '');
      btn.innerHTML =
        '<div class="track-num">Track ' + String(i + 1).padStart(2, '0') + '</div>' +
        '<div class="track-title"></div>' +
        '<div class="track-hint"></div>' +
        '<div class="collected-badge">💙 collected</div>';
      btn.querySelector('.track-title').textContent = t.title;
      btn.querySelector('.track-hint').textContent = t.hint;
      btn.addEventListener('click', (e) => {
        collected.add(t.id);
        saveCollected(collected);
        btn.classList.add('collected');
        updateMeter(collected);
        window.openModal(t.title, t.msg);
        if (window.spawnHeart) window.spawnHeart(e.clientX, e.clientY);
      });
      grid.appendChild(btn);
    });
    updateMeter(collected);
  }

  render();
})();
