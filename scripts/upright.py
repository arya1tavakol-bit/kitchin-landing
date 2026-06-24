"""Deskew a tilted phone render into an upright, tightly-cropped PNG.

Detects the phone outline from the alpha matte, then flattens the (rotated /
perspective) phone quad into an upright rectangle so it visually matches the
other, already-upright renders.
"""
import sys
import numpy as np
from PIL import Image


def detect_phone_corners(im):
    arr = np.asarray(im)
    alpha = arr[..., 3]
    ys, xs = np.nonzero(alpha > 40)
    s = xs + ys
    d = xs - ys
    tl = np.array([xs[np.argmin(s)], ys[np.argmin(s)]], float)
    br = np.array([xs[np.argmax(s)], ys[np.argmax(s)]], float)
    tr = np.array([xs[np.argmax(d)], ys[np.argmax(d)]], float)
    bl = np.array([xs[np.argmin(d)], ys[np.argmin(d)]], float)
    return tl, tr, br, bl


def upright(path, out_path, aspect=0.462):
    im = Image.open(path).convert("RGBA")
    tl, tr, br, bl = detect_phone_corners(im)

    hp = int(round(max(abs(bl[1] - tl[1]), abs(br[1] - tr[1]))))
    wp = int(round(hp * aspect))
    quad = (tl[0], tl[1], bl[0], bl[1], br[0], br[1], tr[0], tr[1])  # UL,LL,LR,UR
    flat = im.transform((wp, hp), Image.QUAD, quad, Image.BICUBIC)

    # Pad slightly so the drop-shadow / edges aren't clipped.
    pad = 16
    canvas = Image.new("RGBA", (wp + pad * 2, hp + pad * 2), (0, 0, 0, 0))
    canvas.paste(flat, (pad, pad))
    canvas.save(out_path)
    print(f"{path} -> {out_path}: {canvas.size}")


if __name__ == "__main__":
    upright(sys.argv[1], sys.argv[2])
