// 人材法務クエスト Service Worker
// 戦略: Network First（常に最新版を優先、オフライン時はキャッシュ）
const CACHE_NAME = 'jinzai-rpg-v3';

// インストール時
self.addEventListener('install', (event) => {
  self.skipWaiting(); // 新バージョンを即座に有効化
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        './index.html',
        './manifest.json'
      ]).catch(()=>{});
    })
  );
});

// 有効化時：古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// フェッチ：ネットワーク優先（常に最新版）
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 成功したらキャッシュを更新
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // オフライン時はキャッシュから
        return caches.match(event.request);
      })
  );
});
