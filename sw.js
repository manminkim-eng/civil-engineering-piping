/* ═══════════════════════════════════════════════════════════
   MANMIN 배관산정 PWA — Service Worker  v2.0
   KDS 61 10 00 / 하수도설계기준 / CIVIL ENGINEER KIM MANMIN
═══════════════════════════════════════════════════════════ */

const CACHE_NAME    = 'manmin-pipe-v2.0';
const STATIC_CACHE  = 'manmin-static-v2.0';
const DYNAMIC_CACHE = 'manmin-dynamic-v2.0';

/* 오프라인 필수 캐시 파일 목록 */
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.ico'
];

/* 외부 CDN 리소스 (캐시 시도) */
const CDN_URLS = [
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

/* ── INSTALL ── */
self.addEventListener('install', function(event) {
  console.log('[SW] Install v2.0');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function(cache) {
      return cache.addAll(PRECACHE_URLS).then(function() {
        /* CDN은 실패해도 설치 계속 */
        return Promise.allSettled(
          CDN_URLS.map(url => cache.add(url).catch(() => {}))
        );
      });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

/* ── ACTIVATE ── */
self.addEventListener('activate', function(event) {
  console.log('[SW] Activate v2.0');
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== STATIC_CACHE && key !== DYNAMIC_CACHE;
        }).map(function(key) {
          console.log('[SW] 구 캐시 삭제:', key);
          return caches.delete(key);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* ── FETCH 전략 ──
   · 앱 셸(index.html, manifest) → Cache-First → Network Fallback
   · CDN/외부 폰트/라이브러리   → Cache-First → Network + 동적 캐시
   · 나머지                       → Network-First → Cache Fallback
*/
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  /* POST 등 비 GET 요청 → 패스스루 */
  if (event.request.method !== 'GET') return;

  /* ① 앱 셸 — Cache-First */
  if (isAppShell(url)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  /* ② CDN — Cache-First + 동적 저장 */
  if (isCDN(url)) {
    event.respondWith(cacheFirstWithFallback(event.request));
    return;
  }

  /* ③ 그 외 — Network-First */
  event.respondWith(networkFirst(event.request));
});

/* ── 메시지 처리 (skipWaiting) ── */
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* ─────────────────────────────────────
   헬퍼 함수들
───────────────────────────────────── */
function isAppShell(url) {
  return url.pathname.endsWith('index.html') ||
         url.pathname.endsWith('/') ||
         url.pathname.endsWith('manifest.json') ||
         url.pathname.includes('/icons/');
}

function isCDN(url) {
  return url.hostname.includes('jsdelivr.net') ||
         url.hostname.includes('fonts.googleapis.com') ||
         url.hostname.includes('fonts.gstatic.com') ||
         url.hostname.includes('cdnjs.cloudflare.com');
}

function cacheFirst(request) {
  return caches.match(request).then(function(cached) {
    if (cached) return cached;
    return fetch(request).then(function(response) {
      if (response && response.status === 200) {
        var clone = response.clone();
        caches.open(STATIC_CACHE).then(function(c) { c.put(request, clone); });
      }
      return response;
    }).catch(function() {
      return offlineFallback(request);
    });
  });
}

function cacheFirstWithFallback(request) {
  return caches.match(request).then(function(cached) {
    if (cached) return cached;
    return fetch(request).then(function(response) {
      if (response && response.status === 200) {
        var clone = response.clone();
        caches.open(DYNAMIC_CACHE).then(function(c) { c.put(request, clone); });
      }
      return response;
    }).catch(function() { return new Response('', { status: 503 }); });
  });
}

function networkFirst(request) {
  return fetch(request).then(function(response) {
    if (response && response.status === 200) {
      var clone = response.clone();
      caches.open(DYNAMIC_CACHE).then(function(c) { c.put(request, clone); });
    }
    return response;
  }).catch(function() {
    return caches.match(request).then(function(cached) {
      return cached || offlineFallback(request);
    });
  });
}

function offlineFallback(request) {
  var accept = request.headers.get('Accept') || '';
  if (accept.includes('text/html')) {
    return caches.match('./index.html');
  }
  return new Response('오프라인 상태입니다.', {
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}
