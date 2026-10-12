/* 墨点识字 · 离线缓存（自动生成，勿手改）。版本 2d6b9b32af */
var CACHE = 'modian-2d6b9b32af';
var FILES = ["./", "core.js", "data.js", "engine.js", "games.js", "games2.js", "hanzi-writer.min.js", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "index.html", "licenses.js", "licenses/ARPHICPL.TXT", "licenses/HANZI-WRITER-LICENSE-MIT.txt", "manifest.webmanifest", "play.css", "qrun.js", "quiz.js", "review.js", "strokes.js", "style.css", "views.js"];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('modian-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || fetch(e.request); }));
});
