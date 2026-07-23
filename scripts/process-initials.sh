#!/usr/bin/env bash
# Chroma-key the green background of Initials.png to transparent and compress as WebP.
# Source file is never changed. Requires ffmpeg on PATH.
#
# Usage:
#   ./scripts/process-initials.sh [INPUT] [OUTPUT]
#   SIM=0.30 ./scripts/process-initials.sh   # remove more green (if a ring remains)
#   BLEND=0.15 ./scripts/process-initials.sh # softer/wider feathered edge
#   SIZE=1280 ./scripts/process-initials.sh  # larger output
#   WEBP_Q=95 ./scripts/process-initials.sh  # preserve more fine detail
set -euo pipefail

INPUT="${1:-C:/Users/Dell/Documents/WeddingInvitation/Test/Initials.png}"
OUTPUT="${2:-${INPUT%.*}.webp}"
KEY="${KEY:-0x14EA14}"   # chroma-key background color (green screen)
SIZE="${SIZE:-1024}"     # max width in px (height auto, aspect kept)
SIM="${SIM:-0.24}"       # key match tolerance: raise to remove more green
BLEND="${BLEND:-0.10}"   # edge feather for soft anti-aliased alpha
GREENLIMIT="${GREENLIMIT:-1}" # 1 = clamp green fringe on edges (safe for gold); 0 = off
WEBP_Q="${WEBP_Q:-92}"   # webp quality

command -v ffmpeg >/dev/null 2>&1 || { echo "ffmpeg not found on PATH"; exit 1; }
[ -f "$INPUT" ] || { echo "Input not found: $INPUT"; exit 1; }

# Key the green background to transparent. colorkey's BLEND feathers the alpha
# so edges fade smoothly instead of snapping. Despill is off by default: the
# gold is itself high in the green channel, so despilling desaturates it toward
# copper — only dial it up if a green fringe survives the key.
FILTER="colorkey=${KEY}:${SIM}:${BLEND}"
if [ "$GREENLIMIT" != "0" ]; then
  # Neutralize green spill on anti-aliased edges without touching the gold:
  # only pull green down where it exceeds red (a spill/fringe pixel). Gold has
  # red >= green, so it passes through unchanged. Alpha is preserved as-is.
  FILTER="${FILTER},format=rgba,geq=r='r(X,Y)':b='b(X,Y)':a='alpha(X,Y)':g='min(g(X,Y),max(r(X,Y),b(X,Y)))'"
fi

ffmpeg -y -loglevel error -i "$INPUT" \
  -vf "${FILTER},format=rgba,scale=${SIZE}:-1:flags=lanczos" \
  -map_metadata -1 -an -c:v libwebp -q:v "$WEBP_Q" -compression_level 6 \
  "$OUTPUT"

printf "%-24s %12s -> %12s\n" "$(basename "$INPUT")" \
  "$(stat -c%s "$INPUT") B" "$(stat -c%s "$OUTPUT") B"
echo "Done -> $OUTPUT"
