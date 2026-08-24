#!/bin/bash
set -e
cd "$(dirname "$0")/.."
FF="/Users/benp/.local/bin/ffmpeg"
while IFS='|' read -r code slug t; do
  [ -z "$code" ] && continue
  "$FF" -nostdin -v error -i "media/raw/$code.mp4" -an -vf scale=720:1280 \
    -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p -movflags +faststart -y "video/work/$slug.mp4"
  "$FF" -nostdin -v error -ss "$t" -i "media/raw/$code.mp4" -frames:v 1 -vf scale=720:1280 -q:v 4 -y "video/work/$slug.jpg"
  "$FF" -nostdin -v error -ss "$t" -i "media/raw/$code.mp4" -frames:v 1 -vf scale=1080:1920 -q:v 3 -y "images/work/$slug.jpg"
  echo "done $slug"
done < media/manifest.txt
"$FF" -nostdin -v error -ss 13 -t 7 -i "media/raw/DbYsliKRPj-.mp4" -an -vf scale=1080:1920 \
  -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart -y video/hero.mp4
"$FF" -nostdin -v error -ss 16 -i "media/raw/DbYsliKRPj-.mp4" -frames:v 1 -vf scale=1080:1920 -q:v 3 -y video/hero-poster.jpg
echo "hero done"
