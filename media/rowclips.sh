set -e
cd "$(dirname "$0")/.."
D="$HOME/Desktop"
# The two install rows he wants moving instead of still. Both are phone videos,
# 9:16 once the rotation tag is applied, so these are straight proportional
# encodes — nothing cropped, no upscaling past what the camera gave.
clip () {  # src  start  length  w  h  out
  ffmpeg -nostdin -v error -ss "$2" -t "$3" -i "$1" \
    -vf "scale=$4:$5:flags=lanczos,setsar=1,fps=30,format=yuv420p" \
    -an -c:v libx264 -crf 26 -preset slow -movflags +faststart -y "video/$6.mp4"
  ffmpeg -nostdin -v error -ss 0.4 -i "video/$6.mp4" -frames:v 1 -update 1 -q:v 3 -y "video/$6.jpg"
}

clip "$D/26717627-145C-4325-A693-2E7C829837EE.MOV" 0.3 9.0  540 960  ambient
clip "$D/IMG_1315.MOV"                             0.1 2.75 1080 1920 underglow
