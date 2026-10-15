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
      if (!wall._cols) measure(wall);
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      wall._cols.forEach(function (c) {
        var y = (c.base + (still ? 0 : c.dir * (p - 0.5) * wall._h * SPEED)).toFixed(1);
        if (y !== c.last) { c.last = y; c.el.style.transform = 'translate3d(0,' + y + 'px,0)'; }
      });
    });
  }
  // Maße einmal lesen (und nach Größenänderung neu), danach nur noch schreiben
  function measure(wall) {
    wall._h = wall.offsetHeight;
    wall._cols = Array.prototype.map.call(wall.querySelectorAll('.reel-wall_col'), function (col) {
      var tile = col.firstElementChild ? col.firstElementChild.offsetHeight : 0;
      return { el: col, dir: parseFloat(col.getAttribute('data-reel')), base: parseFloat(col.getAttribute('data-reel-base') || 0) * tile, last: null };
    });
  }
  function request() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', function () { walls.forEach(function (w) { w._cols = null; }); request(); });
  window.addEventListener('load', function () { walls.forEach(function (w) { w._cols = null; }); request(); });
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
    if (!stage._h) stage._h = stage.offsetHeight * Math.min(1, stage.offsetWidth / 450); // in schmalen Karten weniger Weg
    var h = stage._h;
    drift.forEach(function (d) {
      if (d.el) d.el.style.setProperty('--cs-y', ((p - 0.5) * h * d.f * 2).toFixed(1) + 'px');
    });
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(move); }
  }, { passive: true });
  window.addEventListener('resize', function () { stage._h = 0; move(); });
  move();
  // Fortschrittsbalken folgt dem YouTube-Video
  if (yt && bar) yt.addEventListener('timeupdate', function () {
    if (yt.duration) bar.style.setProperty('--cs-progress', (yt.currentTime / yt.duration * 100).toFixed(1) + '%');
  });
})();

// Videos im Sichtbereich (Case Studies): stumme Vorschau-Videos mit data-inview spielen nur, solange sie zu sehen sind.
(function () {
  var vids = document.querySelectorAll('video[data-inview]');
  if (!vids.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) {
        if (v.preload === 'none') { v.preload = 'auto'; v.load(); }
        v.muted = true;
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        v.pause();
      }
    });
  }, { rootMargin: '150px 0px' });
  vids.forEach(function (v) { io.observe(v); });
})();

// Interview-Player (Case Studies): das Video wird erst geladen, wenn man auf Abspielen klickt.
(function () {
  document.querySelectorAll('[data-click-video]').forEach(function (box) {
    var btn = box.querySelector('.case-player_play');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var v = document.createElement('video');
      v.controls = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.poster = (box.querySelector('img') || {}).src || '';
      [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(function (s) {
        var src = box.getAttribute('data-' + s[0]);
        if (!src) return;
        var el = document.createElement('source');
        el.src = src;
        el.type = s[1];
        v.appendChild(el);
      });
      var img = box.querySelector('img');
      if (img) img.replaceWith(v); else box.prepend(v);
      box.classList.add('is-playing');
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    });
  });
})();

// Collage (casusQuo „Die Ads“): Motive wandern beim Scrollen leicht, Videos laufen nur beim Drüberfahren mit der Maus.
(function () {
  var box = document.querySelector('.case-collage');
  if (!box) return;
  var items = Array.prototype.slice.call(box.querySelectorAll('.case-collage_item'));
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Bewegung: vordere Ebenen wandern weiter als hintere, abwechselnd hoch/runter
  if (!still) {
    var ticking = false;
    var move = function () {
      ticking = false;
      var r = box.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < -100 || r.top > vh + 100) return;
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))) - 0.5;
      var h = box.offsetHeight;
      items.forEach(function (el, i) {
        var z = parseFloat(el.style.getPropertyValue('--z')) || 1;
        var dir = i % 2 ? 1 : -1;
        el.style.setProperty('--py', (p * h * (0.08 + z * 0.035) * dir).toFixed(1) + 'px');
      });
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(move); }
    }, { passive: true });
    move();
  }
  // Hover: Video erst beim Drüberfahren laden und abspielen (nur Geräte mit Maus)
  if (!window.matchMedia('(hover: hover)').matches) return;
  items.forEach(function (el) {
    var src = el.getAttribute('data-hover-video');
    if (!src) return;
    var v = null;
    el.addEventListener('mouseenter', function () {
      if (!v) {
        v = document.createElement('video');
        v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('playsinline', '');
        v.innerHTML = '<source src="' + src + '.webm" type="video/webm"><source src="' + src + '.mp4" type="video/mp4">';
        el.appendChild(v);
      }
      el.classList.add('is-playing');
      var pr = v.play();
      if (pr && pr.catch) pr.catch(function () {});
    });
    el.addEventListener('mouseleave', function () {
      el.classList.remove('is-playing');
      if (v) v.pause();
    });
  });
})();

// Interview über Cloudflare Stream: Player wird erst beim Klick eingebunden
(function () {
  document.querySelectorAll('.case-player[data-stream]').forEach(function (box) {
    var btn = box.querySelector('.case-player_play');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = box.getAttribute('data-stream');
      f.allow = 'accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;';
      f.setAttribute('allowfullscreen', 'true');
      f.title = 'Interview mit casusQuo';
      var img = box.querySelector('img');
      if (img) img.replaceWith(f); else box.prepend(f);
      box.classList.add('is-playing');
    });
  });
})();
