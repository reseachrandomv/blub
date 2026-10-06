/* Blub — navigation, bubbles, ripples, hearts */
(function () {
  const pages = {
    home: document.getElementById('page-home'),
    about: document.getElementById('page-about'),
    calendar: document.getElementById('page-calendar'),
    poster: document.getElementById('page-poster'),
    playlist: document.getElementById('page-playlist'),
    vault: document.getElementById('page-vault'),
  };

  const navLinks = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');

  function showPage(name) {
    const key = pages[name] ? name : 'home';
    Object.entries(pages).forEach(([k, el]) => {
      if (!el) return;
      el.classList.toggle('active', k === key);
    });
    document.querySelectorAll('[data-nav]').forEach((a) => {
      a.classList.toggle('active', a.getAttribute('data-nav') === key);
    });
    if (navLinks) navLinks.classList.remove('open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.replaceState(null, '', '#' + key);
  }

  function routeFromHash() {
    const h = (location.hash || '#home').slice(1).split('?')[0];
    showPage(h);
  }

  document.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(el.getAttribute('data-nav'));
      spawnHeart(e.clientX || window.innerWidth / 2, e.clientY || 80);
    });
  });

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  window.addEventListener('hashchange', routeFromHash);
  routeFromHash();

  /* Bubbles */
  const bub = document.getElementById('bubbles');
  if (bub) {
    for (let i = 0; i < 12; i++) {
      const b = document.createElement('span');
      b.className = 'bubble';
      const size = 8 + Math.random() * 28;
      b.style.width = size + 'px';
      b.style.height = size + 'px';
      b.style.left = Math.random() * 100 + '%';
      b.style.animationDuration = 12 + Math.random() * 18 + 's';
      b.style.animationDelay = Math.random() * 12 + 's';
      bub.appendChild(b);
    }
  }

  /* Ripples on buttons */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .track-card, .home-chip');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const r = document.createElement('span');
    r.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = size + 'px';
    r.style.left = e.clientX - rect.left - size / 2 + 'px';
    r.style.top = e.clientY - rect.top - size / 2 + 'px';
    btn.appendChild(r);
    setTimeout(() => r.remove(), 600);
  });

  window.spawnHeart = function (x, y) {
    const h = document.createElement('span');
    h.className = 'heart-fly';
    h.textContent = '💙';
    h.style.left = x + 'px';
    h.style.top = y + 'px';
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1000);
  };

  /* Poster download via canvas */
  const dlBtn = document.getElementById('downloadPoster');
  if (dlBtn) {
    dlBtn.addEventListener('click', () => {
      const w = 900, h = 1200;
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#C8D6EE');
      g.addColorStop(0.35, '#9DB6E0');
      g.addColorStop(0.7, '#839FD3');
      g.addColorStop(1, '#6A88C6');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // bubbles
      for (let i = 0; i < 18; i++) {
        ctx.beginPath();
        const bx = Math.random() * w, by = Math.random() * h, br = 8 + Math.random() * 40;
        const bg = ctx.createRadialGradient(bx - br * 0.3, by - br * 0.3, 0, bx, by, br);
        bg.addColorStop(0, 'rgba(255,255,255,0.55)');
        bg.addColorStop(1, 'rgba(255,255,255,0.05)');
        ctx.fillStyle = bg;
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }
      // border
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 4;
      ctx.strokeRect(36, 36, w - 72, h - 72);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 72px "Segoe UI", system-ui, sans-serif';
      ctx.fillText("I'm taken ♡", w / 2, h * 0.42);
      ctx.font = '600 42px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('Ryu ♡ Lilu', w / 2, h * 0.52);
      ctx.font = '600 28px "Segoe UI", system-ui, sans-serif';
      ctx.letterSpacing = '6px';
      ctx.fillText('BLUB', w / 2, h * 0.62);
      ctx.font = '32px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('💙  ·  🫧  ·  💙', w / 2, h * 0.72);
      c.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'blub-im-taken.png';
        a.click();
        URL.revokeObjectURL(a.href);
        spawnHeart(window.innerWidth / 2, window.innerHeight / 2);
      });
    });
  }

  /* Modal helpers */
  const backdrop = document.getElementById('modalBackdrop');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');

  window.openModal = function (title, body) {
    modalTitle.textContent = title;
    modalBody.textContent = body;
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add('open'));
    modalClose.focus();
  };
  function closeModal() {
    backdrop.classList.remove('open');
    setTimeout(() => { backdrop.hidden = true; }, 250);
  }
  modalClose.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('open')) closeModal();
  });
})();
