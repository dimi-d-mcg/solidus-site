/* Solidus Commodities — motion layer (DB0002 v2).
   The page is authored fully static; this file layers motion as progressive enhancement.
   Every reveal fires once; prefers-reduced-motion collapses everything to the settled document. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var config = window.SOLIDUS_CONFIG || {};
  var heroActive = false;

  /* The page always opens at the top — the film is the opening statement.
     Deep links to anchors are respected. */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);
  window.addEventListener('pageshow', function (e) {
    if (e.persisted && !location.hash) window.scrollTo(0, 0);
  });

  /* The letterhead is sticky; downstream offsets (compliance title, anchors) read its height. */
  function setHeaderVar() {
    var h = document.querySelector('.site-header');
    if (h) document.documentElement.style.setProperty('--header-h', h.offsetHeight + 'px');
  }

  /* The cinema pin needs a landscape stage: a 21:9 frame cannot cover a portrait
     viewport without cropping the resting logo frame to a sliver. Portrait gets
     the settled framed panel directly under the letterhead. */
  function shouldPin() {
    return window.innerWidth > window.innerHeight && window.innerWidth >= 752;
  }

  setupScale();
  setHeaderVar();
  window.addEventListener('resize', function () { setupScale(); setHeaderVar(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setHeaderVar);

  /* The monogram is "back to the start": true top, clean URL — an anchor jump
     would tuck the film under the sticky letterhead and pin #top into the URL. */
  var brand = document.querySelector('.brand');
  if (brand) {
    brand.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo(0, 0);
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    });
  }

  setupVideo();
  if (reduce) return; /* static settled document — no pin, no drift, no reveals */

  drawSlash();
  var heroRefresh = setupHero();

  var tick = false;
  function schedule() {
    if (tick) return;
    tick = true;
    requestAnimationFrame(function () {
      tick = false;
      updateDrift();
      updateNumerals();
      updateReveals();
    });
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule);
  [0, 250, 750, 1500].forEach(function (t) {
    setTimeout(function () {
      if (heroRefresh) heroRefresh();
      schedule();
    }, t);
  });

  /* Wide screens: scale the whole sheet continuously (design width 1360, cap 2.6).
     Refines the stepped CSS fallback; composition and measure stay locked. */
  function setupScale() {
    var s = window.innerWidth / 1360;
    document.body.style.zoom = s > 1.02 ? String(Math.min(s, 2.6)) : '';
  }

  function pageZoom() {
    var z = parseFloat(getComputedStyle(document.body).zoom);
    return isNaN(z) || z <= 0 ? 1 : z;
  }

  /* The header slash draws itself once at load — the mark is drawn, not typed. */
  function drawSlash() {
    var slash = document.querySelector('.site-header .slash');
    if (!slash) return;
    slash.classList.add('slash-pre');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        slash.classList.remove('slash-pre');
        slash.classList.add('slash-drawn');
      });
    });
  }

  /* Hero — pinned film: full-bleed cinema at the top settles into the framed 21:9 panel
     over 90vh of scroll, then the pin releases. Scroll-linked, never hijacked. */
  function setupHero() {
    var sec = document.querySelector('[data-hero-section]');
    var wrap = document.querySelector('[data-hero-sticky]');
    var box = document.querySelector('[data-hero-box]');
    if (!sec || !wrap || !box) return null;
    box.style.willChange = 'transform';
    var svh = window.CSS && CSS.supports && CSS.supports('height', '100svh');
    /* vh units multiply under body{zoom}, so the pinned heights are set in
       real pixels divided by zoom — the wrapper must render exactly one viewport. */
    function applyHeights() {
      heroActive = shouldPin();
      if (!heroActive) {
        /* portrait: static settled panel (the CSS default layout) */
        sec.style.height = '';
        wrap.style.position = '';
        wrap.style.top = '';
        wrap.style.height = '';
        wrap.style.overflow = '';
        wrap.style.padding = '';
        box.style.transform = '';
        return;
      }
      wrap.style.position = 'sticky';
      wrap.style.top = '0';
      wrap.style.overflow = 'hidden';
      wrap.style.padding = '0 28px';
      var z = pageZoom();
      if (z > 1) {
        sec.style.height = (window.innerHeight * 1.9 / z).toFixed(2) + 'px';
        wrap.style.height = (window.innerHeight / z).toFixed(2) + 'px';
      } else {
        /* svh keeps the pin stable under mobile URL-bar collapse */
        sec.style.height = svh ? '190svh' : '190vh';
        wrap.style.height = svh ? '100svh' : '100vh';
      }
    }
    applyHeights();
    var s0 = 1;
    function measure() {
      if (!heroActive) return;
      /* offsetWidth/Height are pre-zoom local px; scale by page zoom to compare
         against the real viewport. */
      var z = pageZoom();
      var w0 = (box.offsetWidth * z) || 1;
      var h0 = (box.offsetHeight * z) || 1;
      s0 = Math.max(window.innerWidth / w0, Math.min(window.innerHeight / h0, 2.75));
      s0 = Math.max(s0, 1);
    }
    var ticking = false;
    function update() {
      ticking = false;
      if (!heroActive) return;
      /* All in visual (post-zoom) units: rect height vs real viewport. */
      var rect = sec.getBoundingClientRect();
      var range = rect.height - window.innerHeight;
      var p = Math.min(1, Math.max(0, -rect.top / (range || 1)));
      var s = s0 + (1 - s0) * p;
      box.style.transform = 'scale(' + s.toFixed(4) + ')';
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    measure();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { applyHeights(); measure(); update(); });
    return function () { applyHeights(); measure(); update(); };
  }

  /* Parallax drift — images sit "deeper" than the page. 15% differential, clamped ±40px. */
  function updateDrift() {
    var vh2 = window.innerHeight / 2;
    document.querySelectorAll('[data-drift]').forEach(function (el) {
      var r = el.getBoundingClientRect();
      var cur = el._ty || 0;
      var center = r.top + r.height / 2 - cur;
      var ty = Math.max(-40, Math.min(40, (vh2 - center) * 0.15));
      el._ty = ty;
      el.style.transform = 'translateY(' + ty.toFixed(2) + 'px)';
    });
  }

  /* The in-view row's numeral takes Porphyry (≥45% of the row visible), reverting on exit. */
  function updateNumerals() {
    var vh = window.innerHeight;
    document.querySelectorAll('[data-crow]').forEach(function (row) {
      var num = row.querySelector('[data-num]');
      if (!num) return;
      var r = row.getBoundingClientRect();
      var visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      var on = visible / Math.max(1, Math.min(r.height, vh)) >= 0.45;
      num.classList.toggle('is-current', on);
    });
  }

  /* Reveals — every reveal fires once. Blocks rise-and-fade; compliance rows stamp in
     (rule drawing with each stamp) staggered 90ms per row, cap 450ms; commodity rows run
     their arrival choreography. Armed against live layout: anything already in view when
     armed is never hidden. */
  function updateReveals() {
    var vh = window.innerHeight;
    var batch = 0;
    document.querySelectorAll('[data-reveal],[data-comp-row],[data-crow]').forEach(function (el) {
      if (el.dataset.rvState === 'done') return;
      var r = el.getBoundingClientRect();
      var inView = r.top < vh * 0.88 && r.bottom > 0;
      if (!el.dataset.rvState) {
        if (inView) { el.dataset.rvState = 'done'; return; }
        el.classList.add('rv');
        el.dataset.rvState = 'hidden';
      } else if (inView) {
        el.dataset.rvState = 'done';
        el.style.setProperty('--rv-delay', Math.min(batch * 90, 450) + 'ms');
        batch += 1;
        el.classList.add('rv-in');
      }
    });
  }

  /* Scroll cue — when the film ends, a rule draws itself downward at the bottom of the
     stage (the house device; no text over the film, no icons). The first scroll, or the
     film ending mid-scrub, dismisses it permanently. */
  function wireScrollCue(video) {
    var wrap = document.querySelector('[data-hero-sticky]');
    if (!wrap) return;
    var cue = document.createElement('div');
    cue.className = 'scroll-cue';
    cue.setAttribute('aria-hidden', 'true');
    cue.innerHTML = '<svg viewBox="0 0 8 44" focusable="false"><line x1="4" y1="2" x2="4" y2="42"/></svg>';
    wrap.appendChild(cue);
    /* the film loops, so 'ended' never fires — the cue appears when the first
       loop completes (currentTime wraps back toward zero) */
    var last = 0;
    var fired = false;
    video.addEventListener('timeupdate', function () {
      if (fired) return;
      var t = video.currentTime;
      if (t < last - 5) {
        fired = true;
        if (!heroActive) return; /* no pinned stage — no prompt */
        if (window.scrollY > 40) return; /* already reading — no prompt */
        cue.classList.add('cue-on');
        window.addEventListener('scroll', function () {
          cue.classList.remove('cue-on');
          cue.classList.add('cue-off');
        }, { once: true, passive: true });
      }
      last = t;
    });
  }

  /* Hero film — wired once the asset exists (SOLIDUS_CONFIG.heroFilmSrc).
     Plays once, muted, inline; rests on its final logo frame. No text over the film, ever. */
  function setupVideo() {
    var film = (config.heroFilmSrc || '').trim();
    var filmSmall = (config.heroFilmSrcSmall || '').trim();
    /* min dimension, so landscape phones also get the small encode */
    if (filmSmall && Math.min(window.innerWidth, window.innerHeight) <= 768) film = filmSmall;
    if (!film) return; /* framed poster stays */
    var box = document.querySelector('[data-hero-box]');
    var media = document.querySelector('[data-hero-media]');
    if (!box) return;
    var v = document.createElement('video');
    v.src = film;
    var poster = (config.heroPosterSrc || '').trim();
    if (poster) v.poster = poster;
    v.muted = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('autoplay', '');
    v.setAttribute('aria-label', 'Solidus Commodities');
    v.loop = true; /* the film runs continuously */
    v.preload = 'auto';
    if (media) box.replaceChild(v, media); else box.appendChild(v);
    if (!reduce) wireScrollCue(v);
    if (reduce) {
      var rest = function () {
        try { v.currentTime = Math.max(0, (v.duration || 0) - 0.05); } catch (e) {}
      };
      if (v.readyState >= 1) rest();
      else v.addEventListener('loadedmetadata', rest, { once: true });
    } else {
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
      /* mobile browsers sometimes reject the first early play(); retry once ready */
      v.addEventListener('canplay', function () {
        if (v.paused) {
          var r = v.play();
          if (r && r.catch) r.catch(function () {});
        }
      }, { once: true });
    }
  }
})();
