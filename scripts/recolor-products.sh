#!/usr/bin/env bash
# Studijske fotografije artikala (public/gen/products, pozadina ~#E4DFD9) prebacuje na boju stranice
# (#F4F1EC): svaka slika se pomnoži odnosom ciljne i izmjerene boje pozadine (sjena ostaje
# proporcionalna), pa se ivice meko utope u čistu boju da nema vinjete. Izlaz: public/shop/<SKU>.webp
set -e
cd "$(dirname "$0")/.."
T=(244 241 236)
for f in public/gen/products/*.png; do
  out="public/shop/$(basename "${f%.png}").webp"
  read r g b <<< "$(magick "$f" -crop 80x80+10+10 -resize 1x1 -format "%[fx:r*255] %[fx:g*255] %[fx:b*255]" info:)"
  m=$(python -c "print(${T[0]}/$r, 0, 0, 0, ${T[1]}/$g, 0, 0, 0, ${T[2]}/$b)")
  magick "$f" -resize 1000x -color-matrix "$m" \
    \( -size 1000x1500 xc:black -fill white -draw "rectangle 70,70 930,1430" -blur 0x45 \) \
    -compose CopyOpacity -composite \
    -background "rgb(${T[0]},${T[1]},${T[2]})" -compose Over -flatten \
    -quality 82 "$out"
done
