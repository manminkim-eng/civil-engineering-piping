#!/usr/bin/env python3
"""
MANMIN PWA 아이콘 생성기
- 토목배관.jpg 없을 경우 SVG 기반으로 모든 아이콘 자동 생성
"""
import os, math

try:
    from PIL import Image, ImageDraw, ImageFont
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

ICONS_DIR = os.path.join(os.path.dirname(__file__), 'icons')
os.makedirs(ICONS_DIR, exist_ok=True)

SIZES = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512]

# ── SVG 아이콘 템플릿 (KIM MANMIN 브랜드 색상)
def make_svg(size):
    s = size
    r = max(4, int(s * 0.12))  # corner radius
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{s}" height="{s}" viewBox="0 0 {s} {s}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f3460"/>
      <stop offset="100%" style="stop-color:#1565c0"/>
    </linearGradient>
    <linearGradient id="teal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00897b"/>
      <stop offset="100%" style="stop-color:#26a69a"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="{s}" height="{s}" rx="{r}" fill="url(#bg)"/>
  <!-- Building icon (scaled) -->
  <g transform="scale({s/100}) translate(18,12)">
    <!-- Main building -->
    <rect x="10" y="35" width="30" height="45" fill="none" stroke="#90caf9" stroke-width="3.5" rx="1"/>
    <!-- Roof peak -->
    <polyline points="8,35 25,18 42,35" fill="none" stroke="#90caf9" stroke-width="3.5" stroke-linejoin="round"/>
    <!-- Windows -->
    <rect x="17" y="44" width="8" height="7" fill="#42a5f5" rx="1" opacity="0.9"/>
    <rect x="30" y="44" width="8" height="7" fill="#42a5f5" rx="1" opacity="0.9"/>
    <rect x="17" y="57" width="8" height="7" fill="#26c6da" rx="1" opacity="0.7"/>
    <rect x="30" y="57" width="8" height="7" fill="#26c6da" rx="1" opacity="0.7"/>
    <!-- Door -->
    <rect x="22" y="68" width="9" height="12" fill="#1976d2" rx="1"/>
    <!-- Pipe symbol (left) -->
    <line x1="2" y1="55" x2="10" y2="55" stroke="#26c6da" stroke-width="3" stroke-linecap="round"/>
    <line x1="2" y1="62" x2="10" y2="62" stroke="#00897b" stroke-width="3" stroke-linecap="round"/>
    <!-- Accent teal bar bottom -->
    <rect x="10" y="78" width="30" height="4" fill="url(#teal)" rx="2"/>
  </g>
</svg>'''
    return svg

# SVG 파일 저장
svg_path = os.path.join(ICONS_DIR, 'icon.svg')
with open(svg_path, 'w', encoding='utf-8') as f:
    f.write(make_svg(512))
print(f'✓ SVG 생성: {svg_path}')

if HAS_PIL:
    import io, subprocess
    # cairosvg가 없으면 PIL만으로 직접 드로잉
    try:
        import cairosvg
        HAS_CAIRO = True
    except ImportError:
        HAS_CAIRO = False

    if HAS_CAIRO:
        for sz in SIZES:
            out = os.path.join(ICONS_DIR, f'icon-{sz}x{sz}.png')
            cairosvg.svg2png(url=svg_path, write_to=out, output_width=sz, output_height=sz)
            print(f'✓ {out}')
    else:
        # PIL 직접 드로잉
        def draw_icon(sz):
            img = Image.new('RGBA', (sz, sz), (0,0,0,0))
            d = ImageDraw.Draw(img)
            r = max(4, int(sz*0.12))
            # Background gradient (simulate with two rects)
            d.rounded_rectangle([0,0,sz-1,sz-1], radius=r, fill=(21,101,192,255))
            # Building body
            bx1 = int(sz*0.25); bx2 = int(sz*0.75)
            by1 = int(sz*0.38); by2 = int(sz*0.88)
            d.rectangle([bx1,by1,bx2,by2], outline=(144,202,249,255), width=max(1,sz//32))
            # Roof
            cx = sz//2
            d.polygon([(int(sz*0.22),by1),(cx,int(sz*0.18)),(int(sz*0.78),by1)],
                      outline=(144,202,249,255))
            # Windows
            ws = max(2, sz//14)
            for wx,wy in [(int(sz*0.33),int(sz*0.48)),(int(sz*0.57),int(sz*0.48)),
                          (int(sz*0.33),int(sz*0.61)),(int(sz*0.57),int(sz*0.61))]:
                d.rectangle([wx,wy,wx+ws,wy+ws], fill=(66,165,245,230))
            # Bottom teal bar
            d.rectangle([bx1,by2-int(sz*0.06),bx2,by2], fill=(0,137,123,200))
            return img

        for sz in SIZES:
            img = draw_icon(sz)
            out = os.path.join(ICONS_DIR, f'icon-{sz}x{sz}.png')
            img.save(out, 'PNG')
            print(f'✓ {out}')

        # Apple touch icon (180x180)
        img = draw_icon(180)
        img.save(os.path.join(ICONS_DIR, 'apple-touch-icon.png'), 'PNG')
        print(f'✓ apple-touch-icon.png')

        # Favicon ICO
        fav_img = draw_icon(32)
        fav_img.save(os.path.join(ICONS_DIR, 'favicon.ico'), format='ICO', sizes=[(16,16),(32,32)])
        print(f'✓ favicon.ico')

else:
    print("PIL 없음 — SVG만 생성됨. pip install Pillow 후 재실행하세요.")
    print("GitHub Pages에서는 SVG 아이콘도 동작합니다.")

print('\n아이콘 생성 완료!')
