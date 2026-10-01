#!/usr/bin/env bash
# Pretvara generisane PNG slike (public/gen) u lagane WebP verzije za sajt.
# Proizvodi: 1000 px širine (portret 2:3). Editorijalne: 2000 px duža strana.
set -e
shopt -s nullglob
cd "$(dirname "$0")/.."
for f in public/gen/products/*.png; do
  out="public/shop/$(basename "${f%.png}").webp"
  [ "$out" -nt "$f" ] || magick "$f" -resize 1000x -quality 80 "$out"
done
for f in public/gen/editorial/*.png; do
  out="public/editorial/$(basename "${f%.png}").webp"
  [ "$out" -nt "$f" ] || magick "$f" -resize 2000x2000\> -quality 80 "$out"
done
