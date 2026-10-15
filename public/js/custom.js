// Eigene Ergänzungen zum Webflow-JS.

// Sanftes Einblenden neuer Bausteine mit data-reveal (Webflow-Interactions bleiben unberührt).
(function () {
  var els = document.querySelectorAll('[data-reveal]');
  if (!els.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('js-reveal');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  els.forEach(function (el) { io.observe(el); });
})();

// Reel-Wall (Social First Ads Karte): Spalten bewegen sich beim Scrollen gegenläufig.
// data-reel = Richtung (-1 hoch, 1 runter), data-reel-base = Versatz in Kachelhöhen.
(function () {
  var walls = document.querySelectorAll('.reel-wall');
  if (!walls.length) return;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SPEED = 1.2; // Weg pro Spalte über den ganzen Scrollbereich, in Kartenhöhen
  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    walls.forEach(function (wall) {
      var r = wall.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var h = wall.offsetHeight;
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      Array.prototype.forEach.call(wall.querySelectorAll('.reel-wall_col'), function (col) {
        var tile = col.firstElementChild ? col.firstElementChild.offsetHeight : 0;
        var base = parseFloat(col.getAttribute('data-reel-base') || 0) * tile;
        var move = still ? 0 : parseFloat(col.getAttribute('data-reel')) * (p - 0.5) * h * SPEED;
        col.style.transform = 'translate3d(0,' + (base + move).toFixed(1) + 'px,0)';
      });
    });
  }
  function request() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  window.addEventListener('load', request);
  update();
})();

// Content-Bühne (Social First Content Karte): Videos stumm abspielen, solange sie im Bild sind.
(function () {
  var stage = document.querySelector('.content-stage');
  if (!stage) return;
  var videos = stage.querySelectorAll('video');
  var bar = stage.querySelector('.cs-progress');
  var yt = stage.querySelector('.cs-video[data-slot="yt"]');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  var RATE = 0.85; // etwas langsamer als normal, wirkt ruhiger
  videos.forEach(function (v) { v.muted = true; });
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      videos.forEach(function (v) {
        if (e.isIntersecting) {
          if (v.preload === 'none') { v.preload = 'auto'; v.load(); }
          v.playbackRate = RATE;
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          v.pause();
        }
      });
    });
  }, { rootMargin: '100px 0px' }).observe(stage);
  // Scroll-Bewegung: jedes Fenster wandert leicht, unterschiedlich schnell und teils gegenläufig
  var drift = [['.cs-yt', -0.09], ['.cs-shorts', 0.12], ['.cs-tiktok', -0.13], ['.cs-insta', 0.1]].map(function (d) {
    return { el: stage.querySelector(d[0]), f: d[1] };
  });
  var ticking = false;
  function move() {
    ticking = false;
    var r = stage.getBoundingClientRect(), vh = window.innerHeight;
    if (r.bottom < -100 || r.top > vh + 100) return;
    var p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    var h = stage.offsetHeight * Math.min(1, stage.offsetWidth / 450); // in schmalen Karten weniger Weg
    drift.forEach(function (d) {
      if (d.el) d.el.style.setProperty('--cs-y', ((p - 0.5) * h * d.f * 2).toFixed(1) + 'px');
    });
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(move); }
  }, { passive: true });
  move();
  // Fortschrittsbalken folgt dem YouTube-Video
  if (yt && bar) yt.addEventListener('timeupdate', function () {
    if (yt.duration) bar.style.setProperty('--cs-progress', (yt.currentTime / yt.duration * 100).toFixed(1) + '%');
  });
})();
