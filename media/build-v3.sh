#!/bin/bash
set -e
cd "$(dirname "$0")/.."
FF=/Users/benp/.local/bin/ffmpeg
rm -f video/work/*.mp4 video/work/*.jpg images/work/*.jpg
mkdir -p video/work images/work images/services

# ── 9:16 work clips from the Instagram originals (native portrait, no crop) ──
while IFS='|' read -r code slug t; do
  [ -z "$code" ] && continue
  "$FF" -nostdin -v error -i "media/raw/$code.mp4" -an -vf scale=720:1280 \
    -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p -movflags +faststart -y "video/work/$slug.mp4"
  "$FF" -nostdin -v error -ss "$t" -i "media/raw/$code.mp4" -frames:v 1 -update 1 -vf scale=720:1280 -q:v 4 -y "video/work/$slug.jpg"
  "$FF" -nostdin -v error -ss "$t" -i "media/raw/$code.mp4" -frames:v 1 -update 1 -vf scale=1080:1920 -q:v 3 -y "images/work/$slug.jpg"
  echo "  IG  $slug"
done <<'EOF'
DbYsliKRPj-|tesla-night|14
DbgdiiTxCbl|tesla-fiber|6
Db3vzygg1Mz|cadillac-spectrum|8
Db8mO3XuoFQ|cadillac-ambient|9
DcG2Sn_OAlN|honda-stars|12.8
DcY14ZeuR1z|bench-test|4.5
DcIT8FiOkj6|panel-lit|7
DcSkFsaOl-8|daylight-stars|8
DcPT8v3uYSu|night-spectrum|13.5
EOF

# ── a few from his own camera, centre-cropped to the same 9:16 ──
while IFS='|' read -r src slug st du pt; do
  [ -z "$src" ] && continue
  "$FF" -nostdin -v error -ss "$st" -t "$du" -i "$src" -an \
    -vf "scale=-2:1280,crop=720:1280,setsar=1" \
    -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p -movflags +faststart -y "video/work/$slug.mp4"
  "$FF" -nostdin -v error -ss "$pt" -i "$src" -frames:v 1 -update 1 -vf "scale=-2:1280,crop=720:1280,setsar=1" -q:v 4 -y "video/work/$slug.jpg"
  "$FF" -nostdin -v error -ss "$pt" -i "$src" -frames:v 1 -update 1 -vf "scale=-2:1920,crop=1080:1920,setsar=1" -q:v 3 -y "images/work/$slug.jpg"
  echo "  NEW $slug"
done <<'EOF'
IMG_3794.mov|custom-logo|1.5|6.5|5.0
IMG_1315.MOV|underglow|0.2|2.6|1.4
IMG_3539.MOV|red-cabin|1.2|4.5|3.5
EOF

# ── hero: two videos, side by side, 4:5 each ──
"$FF" -nostdin -v error -ss 1.0 -t 5.0 -i IMG_3539.MOV -an \
  -vf "scale=-2:1350,crop=1080:1350,setsar=1" \
  -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart -y video/hero-a.mp4
"$FF" -nostdin -v error -ss 3.5 -i IMG_3539.MOV -frames:v 1 -update 1 -vf "scale=-2:1350,crop=1080:1350,setsar=1" -q:v 3 -y video/hero-a.jpg
"$FF" -nostdin -v error -ss 1.0 -t 5.0 -i IMG_3043.MOV -an \
  -vf "scale=-2:1350,crop=1080:1350,setsar=1" \
  -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart -y video/hero-b.mp4
"$FF" -nostdin -v error -ss 3.2 -i IMG_3043.MOV -frames:v 1 -update 1 -vf "scale=-2:1350,crop=1080:1350,setsar=1" -q:v 3 -y video/hero-b.jpg
rm -f video/hero.mp4 video/hero-poster.jpg
echo "  hero pair built"

# ── service cards: the FULL 16:9 frame, nothing cropped away ──
card(){ "$FF" -nostdin -v error -ss "$2" -i "$1" -frames:v 1 -update 1 -vf "scale=1280:720,setsar=1" -q:v 3 -y "$3"; }
rm -f images/services/suede.jpg
card IMG_5509.MOV 2.7 images/services/starlight.jpg
card IMG_3539.MOV 3.5 images/services/ambient.jpg
card IMG_1315.MOV 1.4 images/services/underglow.jpg
rm -f images/band.jpg
echo "  service cards + hero done"
