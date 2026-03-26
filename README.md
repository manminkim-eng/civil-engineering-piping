# 🏗️ 단지내 우수·오수 배관산정 시스템 — MANMIN Ver2.0

> **CIVIL ENGINEER KIM MANMIN** — KDS 61 10 00 / 하수도설계기준 기반 합리식·Manning 배관 산정 웹앱 (PWA)

[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Live-blue?logo=github)](https://[YOUR_ID].github.io/[REPO_NAME]/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green?logo=pwa)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🌧️ **우수 배관 산정** | 합리식(Rational Method) 기반, 구역별 설계유량 자동계산 |
| 🚿 **오수 배관 산정** | 세대수·오수원단위 기반 설계유량 계산 |
| 📐 **Manning 공식** | n값·경사·관경별 유속·유량 자동산정 |
| 📊 **A4 보고서** | 계산서 인쇄·JPG 저장 기능 |
| 📱 **PWA 설치** | 앱처럼 설치 (Android/iOS/PC) |
| 🔌 **오프라인 지원** | Service Worker 캐싱 — 인터넷 없이도 사용 가능 |

## 🛠️ 적용 기술기준

- **KDS 61 10 00** — 하수도설계기준 (단지내 배관)
- **합리식** Q = C·I·A/360
- **Manning 공식** V = (1/n)·R^(2/3)·S^(1/2)
- 최소유속 0.6 m/s / 최대유속 3.0 m/s 검토

---

## 🚀 GitHub Pages 배포 방법

### 1단계 — 레포지토리 생성 및 파일 업로드

```bash
# 레포지토리 클론 (또는 새로 생성 후 파일 복사)
git init
git add .
git commit -m "feat: MANMIN 배관산정 PWA v2.0 초기 배포"
git branch -M main
git remote add origin https://github.com/[YOUR_ID]/[REPO_NAME].git
git push -u origin main
```

### 2단계 — GitHub Pages 활성화

1. GitHub 레포지토리 → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / Folder: `/ (root)`
4. **Save** 클릭
5. 약 1~2분 후 `https://[YOUR_ID].github.io/[REPO_NAME]/` 접속 확인

### 3단계 — PWA 설치

| 기기 | 방법 |
|------|------|
| **Android Chrome** | 주소창 오른쪽 ⋮ → "앱 설치" 또는 헤더의 📲 설치 버튼 |
| **iPhone Safari** | 하단 공유 버튼 □↑ → "홈 화면에 추가" |
| **PC Chrome/Edge** | 주소창 오른쪽 설치 아이콘 또는 헤더의 📲 설치 버튼 |

---

## 📁 파일 구조

```
📦 pwa-manmin/
 ┣ 📄 index.html          ← 메인 앱 (단일 파일 SPA)
 ┣ 📄 manifest.json       ← PWA 매니페스트
 ┣ 📄 sw.js               ← Service Worker (오프라인 캐싱)
 ┣ 📄 404.html            ← GitHub Pages SPA 리다이렉트
 ┣ 📄 .nojekyll           ← Jekyll 빌드 비활성화
 ┣ 📄 README.md           ← 이 파일
 ┗ 📁 icons/              ← PWA 아이콘 셋 (전 사이즈)
    ┣ 📄 favicon.ico
    ┣ 📄 apple-touch-icon.png
    ┣ 📄 icon-16x16.png
    ┣ 📄 icon-32x32.png
    ┣ 📄 icon-72x72.png
    ┣ 📄 icon-96x96.png
    ┣ 📄 icon-128x128.png
    ┣ 📄 icon-144x144.png
    ┣ 📄 icon-152x152.png
    ┣ 📄 icon-192x192.png  ← Android 필수
    ┣ 📄 icon-384x384.png
    ┣ 📄 icon-512x512.png  ← Splash / 스토어
    ┗ 📄 icon.svg          ← 벡터 원본
```

---

## 🔧 로컬 개발 환경

```bash
# Python 내장 서버 (가장 간단)
python3 -m http.server 8080

# Node.js serve
npx serve . -p 8080

# 브라우저에서 http://localhost:8080 접속
```

> ⚠️ `file://` 프로토콜에서는 Service Worker가 동작하지 않습니다.  
> 반드시 `http://localhost` 또는 `https://` 환경에서 테스트하세요.

---

## 📄 라이선스

MIT License — © 2025 CIVIL ENGINEER KIM MANMIN

---

*Made with ❤️ for Korean Civil Engineers*
