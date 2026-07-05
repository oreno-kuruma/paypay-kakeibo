// PayPay家計簿 Service Worker(http/httpsで配信した場合のみ使用されます)
// キャッシュファーストで自分自身を保存し、完全オフラインで起動できるようにします。
const CACHE = "ppb-v2";
const ASSETS = ["./", "./index.html"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => c.add("./")))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(hit =>
      hit || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match("./"))
    )
  );
});
