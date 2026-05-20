/* ==========================================================================
   GMG SOFTWARE SOLUTION — Multi-Page Router & Interactive Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ═══════════════════════════════════════════════
     NAVBAR SCROLL BEHAVIOUR
     - Transparent at top → frosted glass when scrolled
     - Hides when scrolling down fast, reappears going up
  ═══════════════════════════════════════════════ */
  const navEl = document.getElementById('nav');
  let lastScrollY  = 0;
  let ticking      = false;
  const SCROLL_THRESHOLD = 60;   // px before glass activates
  const HIDE_AFTER       = 140;  // px before hide-on-down kicks in

  function updateNav() {
    const currentY = window.scrollY;

    // Glass effect: transparent → frosted
    if (currentY > SCROLL_THRESHOLD) {
      navEl.classList.add('scrolled');
    } else {
      navEl.classList.remove('scrolled');
    }

    // Hide / show on scroll direction — only past HIDE_AFTER
    if (currentY > HIDE_AFTER) {
      if (currentY > lastScrollY + 8) {
        // Scrolling DOWN — hide
        navEl.classList.add('nav-hidden');
      } else if (currentY < lastScrollY - 4) {
        // Scrolling UP — reveal
        navEl.classList.remove('nav-hidden');
      }
    } else {
      navEl.classList.remove('nav-hidden');
    }

    lastScrollY = currentY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });

  // Run once on load in case page is already scrolled
  updateNav();

  /* ═══════════════════════════════════════════════
     CURSOR GLOW
  ═══════════════════════════════════════════════ */
  const cursorGlow = document.getElementById('cursor-glow');
  let mx = 0, my = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function animateCursor() {
    cx += (mx - cx) * 0.08;
    cy += (my - cy) * 0.08;
    cursorGlow.style.left = cx + 'px';
    cursorGlow.style.top  = cy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  /* ═══════════════════════════════════════════════
     PAGE ROUTER
  ═══════════════════════════════════════════════ */
  const pages     = document.querySelectorAll('.page');
  const navLinks  = document.querySelectorAll('.nav-link');
  const overlay   = document.getElementById('transition-overlay');
  let currentPage = 'home';
  let transitioning = false;

  function showPage(name, extra) {
    if (name === currentPage && !extra) return;
    if (transitioning) return;
    transitioning = true;

    // Phase 1: panels slide UP (in)
    overlay.className = 'in';

    setTimeout(() => {
      // Switch pages at midpoint
      pages.forEach(p => p.classList.remove('active'));
      const target = document.getElementById('page-' + name);
      if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
        // Reset nav to transparent top state on every page change
        lastScrollY = 0;
        navEl.classList.remove('scrolled', 'nav-hidden');
      }

      // Update nav active state
      navLinks.forEach(l => l.classList.toggle('active', l.dataset.page === name));
      currentPage = name;

      // Handle extras (e.g. switching project tab)
      if (extra && extra.proj) {
        setTimeout(() => switchProjTab(extra.proj), 50);
      }

      // Phase 2: panels slide DOWN (out)
      overlay.className = 'out';

      setTimeout(() => {
        overlay.className = '';
        transitioning = false;
      }, 600);

    }, 420);
  }

  // Global click delegation for data-page links
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-page]');
    if (!el) return;
    e.preventDefault();
    const page = el.dataset.page;
    const proj = el.dataset.proj || null;
    showPage(page, proj ? { proj } : null);
  });

  // Nav hamburger
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu   = document.getElementById('mobileMenu');
  let menuOpen = false;

  hamburgerBtn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('open', menuOpen);
    const spans = hamburgerBtn.querySelectorAll('span');
    if (menuOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  mobileMenu.querySelectorAll('[data-page]').forEach(a => {
    a.addEventListener('click', () => {
      menuOpen = false;
      mobileMenu.classList.remove('open');
      const spans = hamburgerBtn.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });

  /* ═══════════════════════════════════════════════
     ANIMATED NUMBER COUNTERS (Home page)
  ═══════════════════════════════════════════════ */
  function animateCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count);
      if (isNaN(target) || target === 0) return;
      const suffix = el.dataset.suffix || (el.textContent.match(/[^\d]+$/) || [''])[0];
      let start = 0;
      const dur = 1400;
      const step = 16;
      const increment = target / (dur / step);
      let current = 0;

      const timer = setInterval(() => {
        current = Math.min(current + increment, target);
        el.textContent = Math.round(current) + (el.dataset.suffix || '');
        if (current >= target) clearInterval(timer);
      }, step);
    });
  }

  // Run counters when home page is active
  setTimeout(animateCounters, 800);

  /* ═══════════════════════════════════════════════
     PROJECT TABS — Work page
  ═══════════════════════════════════════════════ */
  function switchProjTab(name) {
    const tabBtns   = document.querySelectorAll('.proj-tab-btn');
    const projPanels = document.querySelectorAll('.proj-panel');

    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.proj === name));
    projPanels.forEach(p => p.classList.toggle('active', p.id === 'proj-panel-' + name));
  }

  document.querySelectorAll('.proj-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchProjTab(btn.dataset.proj));
  });

  /* ═══════════════════════════════════════════════
     GYM ROLE SWITCHER
  ═══════════════════════════════════════════════ */
  const grBtns   = document.querySelectorAll('.gr-btn');
  const gymPortals = document.querySelectorAll('.gym-portal');

  grBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      grBtns.forEach(b => b.classList.remove('active'));
      gymPortals.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const portal = document.getElementById('gp-' + btn.dataset.role);
      if (portal) portal.classList.add('active');
    });
  });

  /* ═══════════════════════════════════════════════
     ERP ROLE SWITCHER
  ═══════════════════════════════════════════════ */
  const erpBtns    = document.querySelectorAll('.erb-btn');
  const erpPortals = document.querySelectorAll('.erp-portal');

  erpBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      erpBtns.forEach(b => b.classList.remove('active'));
      erpPortals.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const portal = document.getElementById('ep-' + btn.dataset.erp);
      if (portal) portal.classList.add('active');
    });
  });

  /* ═══════════════════════════════════════════════
     DAIRY SWIPE SIMULATOR
  ═══════════════════════════════════════════════ */
  const sCard   = document.getElementById('sCard');
  const sOk     = document.getElementById('sOk');
  const sFail   = document.getElementById('sFail');
  const waSheet = document.getElementById('waSheet');
  const waSend  = document.getElementById('waSend');
  const waSkip  = document.getElementById('waSkip');
  const dtPending = document.getElementById('dt-pending');
  const dtDone    = document.getElementById('dt-done');

  let dragging = false, startX = 0, currentX = 0;
  const SNAP = 88;

  function onDragStart(x) { dragging = true; startX = x - currentX; sCard.style.transition = 'none'; }

  function onDragMove(x) {
    if (!dragging || !sCard) return;
    currentX = x - startX;
    sCard.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.04}deg)`;
    const r = Math.min(Math.abs(currentX) / SNAP, 1);
    if (currentX > 0) { sOk.style.opacity = r; sFail.style.opacity = 0; }
    else { sFail.style.opacity = r; sOk.style.opacity = 0; }
  }

  function onDragEnd() {
    if (!dragging) return;
    dragging = false;
    sCard.style.transition = 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)';

    if (currentX > SNAP) {
      sCard.style.transform = 'translateX(140%) rotate(8deg)';
      setTimeout(() => { if(waSheet) waSheet.classList.add('show'); }, 260);
    } else if (currentX < -SNAP) {
      sCard.style.transform = 'translateX(-140%) rotate(-8deg)';
      setTimeout(() => resetDairy(), 400);
    } else {
      sCard.style.transform = 'translateX(0)';
      if(sOk) sOk.style.opacity = 0;
      if(sFail) sFail.style.opacity = 0;
      currentX = 0;
    }
  }

  if (sCard) {
    sCard.addEventListener('mousedown', e => onDragStart(e.clientX));
    sCard.addEventListener('touchstart', e => onDragStart(e.touches[0].clientX), { passive: true });
    sCard.addEventListener('dblclick', () => {
      sCard.style.transition = 'transform 0.3s';
      sCard.style.transform = 'translateX(140%) rotate(8deg)';
      if(sOk) sOk.style.opacity = 1;
      setTimeout(() => { if(waSheet) waSheet.classList.add('show'); }, 260);
    });
  }

  window.addEventListener('mousemove', e => onDragMove(e.clientX));
  window.addEventListener('mouseup', onDragEnd);
  window.addEventListener('touchmove', e => { if(dragging) onDragMove(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchend', onDragEnd);

  function resetDairy() {
    currentX = 0;
    if (sCard) { sCard.style.transition = 'none'; sCard.style.transform = 'translateX(0)'; }
    if (sOk) sOk.style.opacity = 0;
    if (sFail) sFail.style.opacity = 0;
  }

  if (waSend) {
    waSend.addEventListener('click', () => {
      waSheet.classList.remove('show');
      dtPending.textContent = 'Pending (0)';
      dtDone.textContent = 'Done (1) ✓';
      dtPending.classList.remove('active');
      dtDone.classList.add('active');

      const swipeWrap = document.getElementById('swipeWrap');
      if (swipeWrap) {
        swipeWrap.innerHTML = `
          <div style="height:95px; background:rgba(22,163,74,0.08); border:1px solid rgba(34,197,94,0.18); border-radius:10px; display:flex; flex-direction:column; justify-content:center; align-items:center; gap:4px; animation:fadeUp 0.3s ease-out;">
            <p style="font-size:0.72rem; font-weight:700; color:#22c55e;">2.5L Delivered ✓</p>
            <p style="font-size:0.56rem; color:#64748b;">WhatsApp sent to Ramesh Kumar</p>
            <button id="resetBtn" style="margin-top:6px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); color:#64748b; font-size:0.53rem; padding:4px 10px; border-radius:5px; cursor:pointer;">Reset demo</button>
          </div>`;
        document.getElementById('resetBtn').addEventListener('click', () => location.reload());
      }
    });
  }

  if (waSkip) {
    waSkip.addEventListener('click', () => {
      waSheet.classList.remove('show');
      resetDairy();
    });
  }

  /* ═══════════════════════════════════════════════
     ESTIMATOR — Pricing page
  ═══════════════════════════════════════════════ */
  const prPrice = document.getElementById('prPrice');
  const prTime  = document.getElementById('prTime');

  function recalcEstimator() {
    // Update .on class on all labels
    document.querySelectorAll('.est-option').forEach(opt => {
      const inp = opt.querySelector('input');
      if (inp) opt.classList.toggle('on', inp.checked);
    });

    const multiInp = document.querySelector('#eopt-multi input');
    const isMulti  = multiInp && multiInp.checked;
    let base = isMulti ? 75000 : 45000;
    let wMin = isMulti ? 4 : 2;
    let wMax = isMulti ? 6 : 3;

    const auth   = document.getElementById('e-auth');
    const db     = document.getElementById('e-db');
    const wa     = document.getElementById('e-wa');
    const sheets = document.getElementById('e-sheets');

    if (auth   && auth.checked)   { base += 15000; wMin += 1; wMax += 1; }
    if (db     && db.checked)     { base += 25000; wMin += 1; wMax += 2; }
    if (wa     && wa.checked)     { base += 18000; wMin += 1; wMax += 1; }
    if (sheets && sheets.checked) { base += 20000; wMin += 1; wMax += 2; }

    const fmt = n => '₹' + (n >= 100000 ? (n / 100000).toFixed(1) + 'L' : (n / 1000).toFixed(0) + 'k');

    if (prPrice) {
      prPrice.style.transition = 'opacity 0.2s';
      prPrice.style.opacity = '0';
      setTimeout(() => {
        prPrice.textContent = `${fmt(base)} – ${fmt(base + 20000)}`;
        prPrice.style.opacity = '1';
      }, 150);
    }
    if (prTime) prTime.textContent = `${wMin} – ${wMax} weeks delivery`;

    // Pre-fill contact form when clicking CTA
    const prCta = document.getElementById('prCta');
    if (prCta) {
      prCta.onclick = (e) => {
        e.preventDefault();
        const platform = isMulti ? 'Multi-role portal' : 'Single web app';
        const addons = [];
        if (auth && auth.checked)   addons.push('User accounts (Firebase Auth)');
        if (db   && db.checked)     addons.push('Real-time database (Firestore)');
        if (wa   && wa.checked)     addons.push('WhatsApp / SMS');
        if (sheets && sheets.checked) addons.push('Sheets ERP');

        const msg = `Hi GMG team,\n\nI used the estimator and here's what I need:\n- Platform: ${platform}\n- Add-ons: ${addons.length ? addons.join(', ') : 'None selected'}\n- Budget range: ${prPrice ? prPrice.textContent : ''}\n\nMore details about my project:\n`;
        showPage('contact');
        setTimeout(() => {
          const cfMsg = document.getElementById('cfMsg');
          if (cfMsg) cfMsg.value = msg;
        }, 700);
      };
    }
  }

  document.querySelectorAll('.est-option input').forEach(inp => {
    inp.addEventListener('change', recalcEstimator);
  });
  recalcEstimator();

  /* ═══════════════════════════════════════════════
     CONTACT FORM
  ═══════════════════════════════════════════════ */
  const contactForm = document.getElementById('contactForm');
  const cfBtn       = document.getElementById('cfBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      cfBtn.disabled = true;
      cfBtn.textContent = 'Sending…';

      setTimeout(() => {
        cfBtn.textContent = 'Message sent ✓';
        cfBtn.style.background = '#16a34a';
        setTimeout(() => {
          contactForm.reset();
          cfBtn.disabled = false;
          cfBtn.textContent = 'Send message';
          cfBtn.style.background = '';
        }, 2500);
      }, 1400);
    });
  }

});
