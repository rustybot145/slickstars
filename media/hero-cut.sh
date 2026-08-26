set -e
cd "$(dirname "$0")/.."
SRC="$HOME/Desktop/0826(1).mov"

# The whole clip, start to finish, exactly as shot. Already 1080x1920 with no
# rotation tag, so this is a straight re-encode for the web — no trim, no crop.
ffmpeg -nostdin -v error -i "$SRC" \
  -vf "scale=1080:1920:flags=lanczos,setsar=1,fps=30,format=yuv420p" \
  -an -c:v libx264 -crf 27 -preset slow -movflags +faststart \
  -y video/hero.mp4

# The clip opens almost black, so the poster comes from the strongest moment
# instead — it only covers the gap before the video has frames.
ffmpeg -nostdin -v error -ss 6.9 -i "$SRC" -frames:v 1 -update 1 -q:v 3 -y video/hero-poster.jpg
