#!/usr/bin/env bash
# Chroma-key a near-white background to transparent, then compress the agenda
# icons as WebP. Source files are never changed.
# Requires ffmpeg on PATH.
#
# Usage:
#   ./scripts/process-agenda-icons.sh [INPUT_DIR] [OUT_DIR]
#   SIM=0.20 ./scripts/process-agenda-icons.sh      # remove more white (if a ring remains)
#   SIZE=320 ./scripts/process-agenda-icons.sh      # larger output
#   WEBP_Q=90 ./scripts/process-agenda-icons.sh     # preserve more fine gold linework
set -euo pipefail

INPUT_DIR="${1:-C:/Users/Dell/Documents/WeddingInvitation/Test/Agenda}"
OUT_DIR="${2:-$INPUT_DIR/processed}"
SIZE="${SIZE:-256}"      # max width in px (height auto, aspect kept)
SIM="${SIM:-0.15}"       # white match tolerance: raise to remove more, lower to protect gold edges
BLEND="${BLEND:-0.08}"   # edge feather for soft anti-aliased alpha
WEBP_Q="${WEBP_Q:-82}"   # webp quality

command -v ffmpeg >/dev/null 2>&1 || { echo "ffmpeg not found on PATH"; exit 1; }
mkdir -p "$OUT_DIR"
shopt -s nullglob nocaseglob

files=(
  "$INPUT_DIR"/*.png
  "$INPUT_DIR"/*.jpg
  "$INPUT_DIR"/*.jpeg
  "$INPUT_DIR"/*.webp
)
[ ${#files[@]} -gt 0 ] || { echo "No PNG, JPG, JPEG, or WebP files in $INPUT_DIR"; exit 1; }

FILTER="colorkey=0xFFFFFF:${SIM}:${BLEND},format=rgba,scale=${SIZE}:-1:flags=lanczos"

printf "%-24s %12s %12s\n" "icon" "source" "webp"
printf -- "%.0s-" {1..64}; printf "\n"

for f in "${files[@]}"; do
  base="$(basename "${f%.*}")"
  webp_out="$OUT_DIR/${base}.webp"

  ffmpeg -y -loglevel error -i "$f" -vf "$FILTER" \
    -map_metadata -1 -an -c:v libwebp -q:v "$WEBP_Q" -compression_level 6 \
    "$webp_out"

  printf "%-24s %12s %12s\n" "$base" \
    "$(stat -c%s "$f")" "$(stat -c%s "$webp_out")"
done

echo ""
echo "Done -> $OUT_DIR"
