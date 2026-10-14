/* 墨点识字 · 离线缓存（自动生成，勿手改）。核心版本 40b0ddd277，笔顺字库版本 9b2757bc99 */
var CORE = 'modian-core-40b0ddd277';
var STROKES = 'modian-strokes-9b2757bc99';
var CORE_FILES = ["./", "avatar.js", "core.js", "data.js", "engine.js", "games.js", "games2.js", "games3.js", "games4.js", "hanzi-writer.min.js", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "index.html", "items.js", "licenses.js", "licenses/ARPHICPL.TXT", "licenses/CJK-DECOMP-LICENSE-APACHE-2.0.txt", "licenses/HANZI-WRITER-LICENSE-MIT.txt", "manifest.webmanifest", "play.css", "qrun.js", "quiz.js", "review.js", "style.css", "views.js"];
var STROKE_FILES = ["strokes/s01.js", "strokes/s02.js", "strokes/s03.js", "strokes/s04.js", "strokes/s05.js", "strokes/s06.js", "strokes/s07.js", "strokes/s08.js", "strokes/s09.js", "strokes/s10.js", "strokes/s11.js", "strokes/s12.js", "strokes/s13.js", "strokes/s14.js", "strokes/s15.js", "strokes/s16.js", "strokes/s17.js", "strokes/s18.js", "strokes/s19.js", "strokes/s20.js", "strokes/s21.js", "strokes/s22.js", "strokes/s23.js", "strokes/s24.js", "strokes/s25.js", "strokes/s26.js", "strokes/s27.js", "strokes/s28.js", "strokes/s29.js", "strokes/s30.js", "strokes/s31.js", "strokes/s32.js"];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CORE).then(function (c) { return c.addAll(CORE_FILES.map(function (f) { return new Request(f, { cache: 'reload' }); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('modian-') === 0 && k !== CORE && k !== STROKES; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var u = new URL(e.request.url);
  if (u.pathname.indexOf('/strokes/') >= 0) {
    e.respondWith(caches.open(STROKES).then(function (c) {
      return c.match(e.request, { ignoreSearch: true }).then(function (r) {
        return r || fetch(e.request).then(function (res) { if (res && res.ok) c.put(e.request, res.clone()); return res; });
      });
    }));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || fetch(e.request); }));
});
var warming = false;
self.addEventListener('message', function (e) {
  if (!e.data || e.data.cmd !== 'warm' || warming) return;
  warming = true;
  e.waitUntil(caches.open(STROKES).then(function (c) {
    var i = 0;
    function next() {
      if (i >= STROKE_FILES.length) { warming = false; return; }
      var f = STROKE_FILES[i++];
      return c.match(f).then(function (hit) { return hit ? null : fetch(f, { cache: 'reload' }).then(function (res) { if (res && res.ok) return c.put(f, res); }); }).then(next, function () { warming = false; });
    }
    return next();
  }));
});
