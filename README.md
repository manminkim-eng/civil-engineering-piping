# 단지내 우수·오수 배관산정 시스템 [MANMIN Ver2.0]

**CIVIL ENGINEER KIM MANMIN** — 단지내 토목 우수·오수 배관 산정 웹앱 (PWA)

## 📱 설치 방법
- **Android Chrome**: 주소창 오른쪽 메뉴 → "앱 설치" 또는 하단 배너의 [설치하기] 버튼
- **iPhone Safari**: 하단 공유 버튼 → "홈 화면에 추가"
- **PC Chrome/Edge**: 주소창 오른쪽 설치 아이콘 또는 헤더의 [앱 설치] 버튼

## 🌐 GitHub Pages 배포
```
https://<username>.github.io/<repo>/
```

## 📂 파일 구조
```
/
├── index.html          ← 메인 앱 (PWA 완전 내장)
├── manifest.json       ← PWA 매니페스트
├── sw.js               ← 서비스 워커 (오프라인 캐시)
├── .nojekyll           ← GitHub Pages Jekyll 비활성화
├── README.md
└── icons/
    ├── favicon.ico
    ├── apple-touch-icon.png
    ├── icon-16x16.png
    ├── icon-32x32.png
    ├── icon-48x48.png
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

## ⚙️ 기술 스택
- **설계기준**: KDS 61 10 00 · 하수도설계기준
- **우수**: 합리식 Q=C·I·A/360
- **오수**: Manning 공식 · 시간변동계수
- **PWA**: Service Worker Cache-First · Web App Manifest
- **버전**: MANMIN Ver2.0

## 📋 주요 기능
- 🌧️ 우수 배관 산정 (합리식 · Talbot IDF · 재현기간 5~50년)
- 🚽 오수 배관 산정 (Manning · 충만도 · 다중 구간)
- 📋 A4 결과보고서 출력 (인쇄 · JPG 저장)
- 📱 Galaxy S24 Ultra 모바일 미리보기
- 🔌 오프라인 완전 동작 (Service Worker)
