/* ════════════════════════════════════════════════════════
   sw.js — Service Worker
   단지내 우수·오수 배관산정 시스템 [MANMIN Ver2.0]
   Cache-First 전략 + 오프라인 완전 동작
════════════════════════════════════════════════════════ */

const CACHE_NAME   = 'manmin-pipe-v2.0';
const OFFLINE_URL  = './index.html';

/* ── 캐시할 핵심 파일 ── */
const PRECACHE = [
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/icon-152x152.png',
  './icons/icon-144x144.png',
  './icons/icon-128x128.png',
  './icons/icon-96x96.png',
  './icons/icon-72x72.png',
  './icons/icon-48x48.png',
  './icons/icon-32x32.png',
  './icons/icon-16x16.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.ico',
  /* 외부 폰트/라이브러리는 네트워크 우선 */
];

/* ════════ INSTALL ════════ */
self.addEventListener('install', function(e) {
  console.log('[SW] Install v:', CACHE_NAME);
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE);
    }).then(function() {
      return self.skipWaiting(); // 즉시 활성화
    })
  );
});

/* ════════ ACTIVATE ════════ */
self.addEventListener('activate', function(e) {
  console.log('[SW] Activate v:', CACHE_NAME);
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) {
              console.log('[SW] Delete old cache:', k);
              return caches.delete(k);
            })
      );
    }).then(function() {
      return self.clients.claim(); // 즉시 모든 탭 제어
    })
  );
});

/* ════════ FETCH ════════ */
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  /* ── 외부 CDN (폰트, 라이브러리) → 네트워크 우선, 실패 시 캐시 ── */
  if (url.includes('cdn.jsdelivr.net') ||
      url.includes('fonts.googleapis.com') ||
      url.includes('fonts.gstatic.com') ||
      url.includes('cdnjs.cloudflare.com')) {
    e.respondWith(
      fetch(e.request).then(function(resp) {
        var clone = resp.clone();
        caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
        return resp;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }

  /* ── 로컬 파일 → 캐시 우선, 없으면 네트워크 후 캐시 저장 ── */
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;

      return fetch(e.request).then(function(resp) {
        if (!resp || resp.status !== 200 || resp.type === 'opaque') {
          return resp;
        }
        var clone = resp.clone();
        caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
        return resp;
      }).catch(function() {
        /* 완전 오프라인 → index.html 반환 */
        if (e.request.destination === 'document') {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});

/* ════════ MESSAGE (skipWaiting 요청 처리) ════════ */
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
