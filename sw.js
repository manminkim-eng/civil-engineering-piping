/* ═══════════════════════════════════════════════════════════════
   MANMIN PWA Service Worker  —  단지내 우수·오수 배관산정 시스템
   KDS 61 10 00 / 하수도설계기준 / 합리식 기반
   CIVIL ENGINEER KIM MANMIN Ver 2.0
═══════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'manmin-pipe-v2.0.0';
const STATIC_CACHE = 'manmin-static-v2.0.0';
const DYNAMIC_CACHE = 'manmin-dynamic-v2.0.0';

/* ── 캐시할 핵심 파일 목록 ── */
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.ico',
  './icons/icon-32x32.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  /* CDN 폰트/라이브러리는 동적 캐시로 처리 */
];

/* ── 외부 CDN 도메인 (동적 캐시 대상) ── */
const CDN_DOMAINS = [
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com',
];

/* ════════════════════════════════════════════════════════
   INSTALL — 핵심 파일 사전 캐시
════════════════════════════════════════════════════════ */
self.addEventListener('install', function(event) {
  console.log('[SW] Installing MANMIN PWA v2.0.0...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function(cache) {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(PRECACHE_URLS.map(url => {
        return new Request(url, { cache: 'reload' });
      })).catch(function(err) {
        console.warn('[SW] Pre-cache partial failure (non-fatal):', err);
      });
    }).then(function() {
      console.log('[SW] Installation complete');
      return self.skipWaiting(); /* 즉시 활성화 */
    })
  );
});

/* ════════════════════════════════════════════════════════
   ACTIVATE — 구버전 캐시 정리
════════════════════════════════════════════════════════ */
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== STATIC_CACHE && name !== DYNAMIC_CACHE;
        }).map(function(name) {
          console.log('[SW] Deleting old cache:', name);
          return caches.delete(name);
        })
      );
    }).then(function() {
      console.log('[SW] Activation complete — clients claimed');
      return self.clients.claim();
    })
  );
});

/* ════════════════════════════════════════════════════════
   FETCH — 캐시 우선 / 네트워크 폴백 전략
════════════════════════════════════════════════════════ */
self.addEventListener('fetch', function(event) {
  const req = event.request;
  const url = new URL(req.url);

  /* ① 비-GET 요청 → 네트워크 직통 */
  if (req.method !== 'GET') return;

  /* ② chrome-extension 등 외부 스킴 → 무시 */
  if (!url.protocol.startsWith('http')) return;

  /* ③ CDN 리소스 → Stale-While-Revalidate */
  if (CDN_DOMAINS.some(function(d) { return url.hostname.includes(d); })) {
    event.respondWith(staleWhileRevalidate(req, DYNAMIC_CACHE));
    return;
  }

  /* ④ 동일 오리진 리소스 → Cache First */
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  /* ⑤ 기타 크로스 오리진 → 네트워크 우선 */
  event.respondWith(networkFirst(req, DYNAMIC_CACHE));
});

/* ── 전략 함수들 ── */

/* Cache First: 캐시 있으면 즉시 반환, 없으면 네트워크 후 캐시 저장 */
function cacheFirst(request, cacheName) {
  return caches.open(cacheName).then(function(cache) {
    return cache.match(request).then(function(cached) {
      if (cached) return cached;
      return fetch(request).then(function(response) {
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
        return response;
      }).catch(function() {
        /* 오프라인 폴백 */
        return caches.match('./index.html');
      });
    });
  });
}

/* Stale While Revalidate: 캐시 즉시 반환하면서 백그라운드 업데이트 */
function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then(function(cache) {
    return cache.match(request).then(function(cached) {
      var fetchPromise = fetch(request).then(function(response) {
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
        return response;
      });
      return cached || fetchPromise;
    });
  });
}

/* Network First: 네트워크 우선, 실패시 캐시 */
function networkFirst(request, cacheName) {
  return fetch(request).then(function(response) {
    if (response && response.status === 200) {
      caches.open(cacheName).then(function(cache) {
        cache.put(request, response.clone());
      });
    }
    return response;
  }).catch(function() {
    return caches.match(request);
  });
}

/* ════════════════════════════════════════════════════════
   MESSAGE — skipWaiting 메시지 처리 (업데이트 알림용)
════════════════════════════════════════════════════════ */
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING received — activating new SW');
    self.skipWaiting();
  }
});

/* ════════════════════════════════════════════════════════
   BACKGROUND SYNC (옵션 — 향후 계산 결과 동기화용)
════════════════════════════════════════════════════════ */
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-calc-results') {
    console.log('[SW] Background sync: sync-calc-results');
    /* 추후 서버 동기화 로직 추가 가능 */
  }
});

/* ════════════════════════════════════════════════════════
   PUSH NOTIFICATION (옵션 — 향후 알림 기능용)
════════════════════════════════════════════════════════ */
self.addEventListener('push', function(event) {
  var data = {};
  if (event.data) {
    try { data = event.data.json(); } catch(e) { data = { title: 'MANMIN', body: event.data.text() }; }
  }
  var options = {
    body: data.body || '배관산정 알림',
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || './' }
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'MANMIN 배관산정', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

console.log('[SW] MANMIN Service Worker v2.0.0 loaded');
