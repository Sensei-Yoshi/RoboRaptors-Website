(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Mobile nav ──
  var navBtn = document.querySelector('.nav-toggle');
  var navLinks = document.getElementById('nav-links');
  if (navBtn && navLinks) {
    navBtn.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // ── Missing photos: show a placeholder until the file is added ──
  document.querySelectorAll('.photo img').forEach(function (img) {
    function markMissing() { img.closest('.photo').classList.add('missing'); img.remove(); }
    if (img.complete && img.naturalWidth === 0) markMissing();
    else img.addEventListener('error', markMissing);
  });

  // ── Hero slider (swipe/scroll natively, plus arrows, progress bars, autoplay) ──
  document.querySelectorAll('.slider').forEach(function (slider) {
    var track = slider.querySelector('.slides');
    var slides = Array.prototype.slice.call(track.children);
    var dotsWrap = slider.querySelector('.dots');
    var count = slider.querySelector('.count');
    var prev = slider.querySelector('[data-prev]');
    var next = slider.querySelector('[data-next]');
    var delay = 6000;
    var current = 0, timer = null;
    slider.style.setProperty('--slide-ms', delay + 'ms');

    var dots = slides.map(function (slide, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show slide ' + (i + 1) + ' of ' + slides.length);
      b.addEventListener('click', function () { go(i); restart(); });
      dotsWrap.appendChild(b);
      return b;
    });

    function render(i) {
      current = i;
      slides.forEach(function (s, j) {
        s.classList.toggle('is-active', j === i);
        s.setAttribute('aria-hidden', j === i ? 'false' : 'true');
        s.querySelectorAll('a, button').forEach(function (el) { el.tabIndex = j === i ? 0 : -1; });
      });
      dots.forEach(function (d, j) {
        d.removeAttribute('aria-current');
        if (j === i) { void d.offsetWidth; d.setAttribute('aria-current', 'true'); }
      });
      if (count) count.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    }
    function go(i) {
      i = (i + slides.length) % slides.length;
      track.scrollTo({ left: i * track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
      render(i);
    }
    function start() { if (reduceMotion) { slider.classList.add('paused'); return; } stop(); slider.classList.remove('paused'); timer = setInterval(function () { go(current + 1); }, delay); }
    function stop() { clearInterval(timer); timer = null; }
    function restart() { start(); }

    if (prev) prev.addEventListener('click', function () { go(current - 1); restart(); });
    if (next) next.addEventListener('click', function () { go(current + 1); restart(); });

    // Keep state in sync when the user swipes or scrolls the track
    var scrollEnd;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollEnd);
      scrollEnd = setTimeout(function () {
        var i = Math.round(track.scrollLeft / track.clientWidth);
        if (i !== current) { render(i); restart(); }
      }, 90);
    }, { passive: true });

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { go(current + 1); restart(); }
      if (e.key === 'ArrowLeft') { go(current - 1); restart(); }
    });
    slider.addEventListener('mouseenter', function () { stop(); slider.classList.add('paused'); });
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', function () { stop(); slider.classList.add('paused'); });
    window.addEventListener('resize', function () { track.scrollLeft = current * track.clientWidth; });

    render(0);
    start();
  });

  // ── Horizontal rail arrows ──
  document.querySelectorAll('[data-rail]').forEach(function (wrap) {
    var rail = document.getElementById(wrap.getAttribute('data-rail'));
    if (!rail) return;
    wrap.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        var dir = b.hasAttribute('data-next') ? 1 : -1;
        rail.scrollBy({ left: dir * rail.clientWidth * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
  });

  // ── Count-up numbers ──
  var counters = document.querySelectorAll('[data-count]');
  function format(n) { return n.toLocaleString('en-US'); }
  function run(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = format(target) + suffix; return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { io.observe(c); });
  } else {
    counters.forEach(run);
  }

  // ── Initiative filters ──
  var filterBar = document.querySelector('.filters');
  if (filterBar) {
    var tiles = document.querySelectorAll('.tiles .tile');
    filterBar.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      filterBar.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var f = b.getAttribute('data-filter');
      tiles.forEach(function (t) {
        t.classList.toggle('hidden', f !== 'all' && t.getAttribute('data-type') !== f);
      });
    });
  }
})();
