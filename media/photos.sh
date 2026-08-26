set -e
cd "$(dirname "$0")/.."
# Straight from the Slick Stars folder. Format conversion only, so a browser can
# read them — same pixels, same framing, full original resolution, no crop.
# The rotation tag gets baked in so the stored frame is the frame he shot.
for n in IMG_2978 IMG_4715 IMG_5512; do
  sips -s format jpeg -s formatOptions 95 "$n.heic" --out "images/photos/$n.jpg" >/dev/null
done
cp IMG_3840.jpeg images/photos/IMG_3840.jpg
python3 - <<'PY'
from PIL import Image, ImageOps
import glob, os
for p in sorted(glob.glob("images/photos/*.jpg")):
    im = Image.open(p)
    before = im.size
    im = ImageOps.exif_transpose(im)           # bake rotation; no crop, no resize
    im.save(p, "JPEG", quality=92, subsampling=0, optimize=True)
    print(f"{os.path.basename(p):16} {before[0]}x{before[1]} -> {im.size[0]}x{im.size[1]}")
PY
