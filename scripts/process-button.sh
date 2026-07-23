#!/usr/bin/env bash
# Chroma-key the blue background of button.png to transparent and compress as WebP.
# Source file is never changed. Requires ffmpeg on PATH.
#
# The background is a flat #0123f3 blue (sampled across multiple corners of
# the source PNG). The plaque face is dark green with gold trim, so the key
# sits far from any artwork color -- SIM/BLEND can stay generous with no risk
# of eating into the artwork (unlike the earlier white/#fefefe export, where
# the plaque's own cream face was close enough to get partially keyed out).
#
# Usage:
#   ./scripts/process-button.sh [INPUT] [OUTPUT]
#   SIM=0.30 ./scripts/process-button.sh   # remove more blue (if a ring remains)
#   BLEND=0.15 ./scripts/process-button.sh # softer/wider feathered edge
#   SIZE=1600 ./scripts/process-button.sh  # larger output
#   WEBP_Q=95 ./scripts/process-button.sh  # preserve more fine detail
set -euo pipefail

INPUT="${1:-C:/Users/Dell/Documents/WeddingInvitation/Test/button.png}"
OUTPUT="${2:-${INPUT%.*}.webp}"
KEY="${KEY:-0x0123F3}"   # chroma-key background color (measured blue)
SIZE="${SIZE:-1200}"     # max width in px (height auto, aspect kept)
SIM="${SIM:-0.24}"       # key match tolerance: raise to remove more blue
BLEND="${BLEND:-0.10}"   # edge feather for soft anti-aliased alpha
WEBP_Q="${WEBP_Q:-90}"   # webp quality

command -v ffmpeg >/dev/null 2>&1 || { echo "ffmpeg not found on PATH"; exit 1; }
[ -f "$INPUT" ] || { echo "Input not found: $INPUT"; exit 1; }

ffmpeg -y -loglevel error -i "$INPUT" \
  -vf "colorkey=${KEY}:${SIM}:${BLEND},format=rgba,scale=${SIZE}:-1:flags=lanczos" \
  -map_metadata -1 -an -c:v libwebp -q:v "$WEBP_Q" -compression_level 6 \
  "$OUTPUT"

printf "%-24s %12s -> %12s\n" "$(basename "$INPUT")" \
  "$(stat -c%s "$INPUT") B" "$(stat -c%s "$OUTPUT") B"
echo "Done -> $OUTPUT"
