set -e
D="$HOME/Desktop"
OUT="$(cd "$(dirname "$0")/.." && pwd)/video"
T=$(mktemp -d)

# Four clips off the Desktop. Every one of them is a phone video: 9:16 after the
# rotation tag is applied. So the hero is 9:16 — the shape they were shot in.
# scale=1080:1920 is a straight proportional resize on all four. Nothing cropped.
seg () {  # file  start  length  index
  ffmpeg -nostdin -v error -ss "$2" -t "$3" -i "$1" \
    -vf "scale=1080:1920:flags=lanczos,setsar=1,fps=30,format=yuv420p" \
    -an -c:v libx264 -crf 20 -preset slow -y "$T/s$4.mp4"
}

seg "$D/IMG_3043.MOV"                          1.0 2.6 1   # violet cabin, stars over the ambient line
seg "$D/IMG_3794.mov"                          5.6 2.8 2   # the monogram picked out in the headliner
seg "$D/b340c18799f8451cb4deb86ce2a447c6.MOV"  2.0 2.8 3   # blue cabin, the line running dash to pillar
seg "$D/IMG_1315.MOV"                          0.15 2.4 4  # underglow, walking away from it

ffmpeg -nostdin -v error \
  -i "$T/s1.mp4" -i "$T/s2.mp4" -i "$T/s3.mp4" -i "$T/s4.mp4" \
  -filter_complex "\
   [0][1]xfade=transition=fade:duration=0.5:offset=2.1[a];\
   [a][2]xfade=transition=fade:duration=0.5:offset=4.4[b];\
   [b][3]xfade=transition=fade:duration=0.5:offset=6.7,format=yuv420p[v]" \
  -map "[v]" -an -c:v libx264 -crf 26 -preset slow -movflags +faststart \
  -y "$OUT/hero.mp4"

ffmpeg -nostdin -v error -ss 1.4 -i "$OUT/hero.mp4" -frames:v 1 -update 1 -q:v 3 -y "$OUT/hero-poster.jpg"
rm -rf "$T"
