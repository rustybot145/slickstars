#!/bin/bash
set -e
cd "/Users/benp/Desktop/Slick Stars website"
FF=/Users/benp/.local/bin/ffmpeg
rm -f images/services/*.jpg images/process.jpg

# His real photos: full frame, exact original aspect, only scaled down for weight.
# Nothing is cropped — the whole picture is what shows.
python3 - <<'PY'
from PIL import Image
jobs = [("media/new/photo_IMG_5512.jpg", "images/services/starlight.jpg"),
        ("media/new/photo_IMG_2978.jpg", "images/process.jpg"),
        ("media/new/photo_IMG_4715.jpg", "images/faq.jpg")]
for src, dst in jobs:
    im = Image.open(src)
    w, h = im.size
    if w > 2000:                       # proportional only, never a crop
        im = im.resize((2000, round(h * 2000 / w)), Image.LANCZOS)
    im.convert("RGB").save(dst, quality=84, optimize=True)
    print(f"  {dst}  {Image.open(dst).size}  (source {w}x{h}, same ratio)")
PY

# Where he has no photo, the FULL video frame — 16:9 out of a 16:9 source, so
# again nothing is cut away.
"$FF" -nostdin -v error -ss 3.5 -i IMG_3539.MOV -frames:v 1 -update 1 -vf "scale=1920:1080,setsar=1" -q:v 3 -y images/services/ambient.jpg
"$FF" -nostdin -v error -ss 1.4 -i IMG_1315.MOV -frames:v 1 -update 1 -vf "scale=1920:1080,setsar=1" -q:v 3 -y images/services/underglow.jpg
echo "  images/services/ambient.jpg   1920x1080 (full frame)"
echo "  images/services/underglow.jpg 1920x1080 (full frame)"
