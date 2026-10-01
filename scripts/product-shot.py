"""Studijski snimak artikla iz stvarne fotografije.

Uklanja pozadinu (rembg), obreže proizvod, centrira ga na podlogu boje sajta (#f4f1ec) u formatu
1000 × 1500 (isti kao ostali snimci u public/shop) i doda meku senku ispod. Rezultat: public/shop/<SKU>.webp

Upotreba:  python scripts/product-shot.py <ulazna-slika> <SKU> [--keep-bg] [--scale 0.78]
  --alpha    ulaz je već izrezan PNG (npr. ručno, po obliku) — koristi njegovu providnost
  --keep-bg  ne uklanja pozadinu (za fotografije koje su već na bijeloj/svijetloj podlozi a rembg
             bi ih oštetio); bijela se tada stopi sa podlogom.
"""
import argparse
import io
import os

from PIL import Image, ImageFilter

W, H = 1000, 1500
BG = (244, 241, 236)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def cutout(img: Image.Image) -> Image.Image:
    from rembg import remove, new_session

    session = new_session("isnet-general-use")
    buf = io.BytesIO()
    img.convert("RGB").save(buf, "PNG")
    out = Image.open(io.BytesIO(remove(buf.getvalue(), session=session))).convert("RGBA")
    return out


def keep_bg(img: Image.Image) -> Image.Image:
    """Bijela/svijetla pozadina → providna (prag po svjetlini), mekane ivice."""
    rgb = img.convert("RGB")
    gray = rgb.convert("L")
    # sve što je skoro bijelo postaje providno
    mask = gray.point(lambda v: 0 if v > 232 else 255).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    out = rgb.convert("RGBA")
    out.putalpha(mask)
    return out


def compose(obj: Image.Image, scale: float) -> Image.Image:
    bbox = obj.getchannel("A").point(lambda a: 255 if a > 24 else 0).getbbox()
    obj = obj.crop(bbox)
    box_w, box_h = W * scale, H * 0.58
    k = min(box_w / obj.width, box_h / obj.height)
    obj = obj.resize((max(1, round(obj.width * k)), max(1, round(obj.height * k))), Image.LANCZOS)

    canvas = Image.new("RGB", (W, H), BG)
    x = (W - obj.width) // 2
    y = round(H * 0.56 - obj.height / 2)

    # senka: zamućena silueta spljoštena ispod predmeta
    a = obj.getchannel("A")
    sh = Image.new("L", (W, H), 0)
    flat = a.resize((obj.width, max(1, obj.height // 9)))
    sh.paste(flat, (x, y + obj.height - flat.height // 2))
    sh = sh.filter(ImageFilter.GaussianBlur(28)).point(lambda v: int(v * 0.32))
    shade = Image.new("RGB", (W, H), (120, 112, 100))
    canvas = Image.composite(shade, canvas, sh)

    canvas.paste(obj, (x, y), obj)
    return canvas


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("sku")
    ap.add_argument("--keep-bg", action="store_true")
    ap.add_argument("--alpha", action="store_true", help="ulaz je već izrezan (PNG sa providnošću)")
    ap.add_argument("--scale", type=float, default=0.78)
    ap.add_argument("--out", default=None)
    args = ap.parse_args()

    img = Image.open(args.src)
    img.load()
    obj = img.convert("RGBA") if args.alpha else keep_bg(img) if args.keep_bg else cutout(img)
    shot = compose(obj, args.scale)
    out = args.out or os.path.join(ROOT, "public", "shop", f"{args.sku}.webp")
    shot.save(out, "WEBP", quality=84, method=6)
    print(out, os.path.getsize(out) // 1024, "KB")


if __name__ == "__main__":
    main()
