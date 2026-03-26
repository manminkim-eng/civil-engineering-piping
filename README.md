# 단지내 우수·오수 배관산정 시스템 MANMIN Ver 2.0

**CIVIL ENGINEER KIM MANMIN** — PWA (Progressive Web App)

---

## 📌 개요

단지내 토목 우수·오수 배관 산정을 위한 웹 애플리케이션입니다.

- **우수 배관**: 합리식(Rational Method) 기반 — KDS 61 10 00
- **오수 배관**: 오수 유량 산정 — 하수도설계기준
- **Manning 공식** 적용 유속·유량 검토
- 반응형 UI (데스크탑 · 태블릿 · 모바일)
- **PWA** — 오프라인 지원, 홈화면 설치 가능

---

## 🛠 적용 기술 기준

| 구분 | 기준 |
|------|------|
| 우수 설계 | KDS 61 10 00 (단지내 도로·우수·오수) |
| 하수도 | 하수도설계기준 (환경부) |
| 유량 산정 | 합리식 Q = C·I·A / 360 |
| 유속 계산 | Manning 공식 V = (1/n)·R^(2/3)·I^(1/2) |

---

## 📁 파일 구조

```
📦 manmin-pipe-pwa/
├── index.html          # 메인 앱
├── manifest.json       # PWA 매니페스트
├── sw.js               # Service Worker (오프라인 지원)
├── offline.html        # 오프라인 폴백 페이지
├── .nojekyll           # GitHub Pages Jekyll 비활성화
├── README.md
└── icons/
    ├── favicon.ico
    ├── apple-touch-icon.png  (180×180)
    ├── icon-16x16.png
    ├── icon-32x32.png
    ├── icon-48x48.png
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png      (PWA 필수)
    ├── icon-384x384.png
    └── icon-512x512.png      (PWA 필수)
```

---

## 🚀 GitHub Pages 배포 방법

1. 이 저장소를 **Fork** 또는 **Clone**
2. `Settings` → `Pages` → Source: `main` branch / `/ (root)`
3. 저장 후 `https://{username}.github.io/{repo-name}/` 접속

---

## 📱 PWA 설치 방법

| 환경 | 방법 |
|------|------|
| Android Chrome | 주소창 우측 메뉴 → "앱 설치" |
| iPhone Safari | 하단 공유 버튼 → "홈 화면에 추가" |
| PC Chrome/Edge | 주소창 우측 설치 아이콘 클릭 |

---

## 👤 제작

**CIVIL ENGINEER KIM MANMIN**  
단지내 토목 우수 및 오수 배관 설계 전문

---

*KDS 61 10 00 · 하수도설계기준 · 합리식(Rational Method) · Manning 공식 적용*
