"""Mirror a phone render to the opposite tilt while keeping the screen readable.

Plain horizontal flip would reverse the on-screen text. Instead we:
  1. detect the screen quad,
  2. un-warp the screen to a flat rectangle,
  3. flip the phone frame horizontally (new tilt),
  4. re-project the flat screen onto the mirrored quad (text stays correct).
"""
import sys
import numpy as np
from PIL import Image


def luminance(arr):
    return arr[..., 0] * 0.299 + arr[..., 1] * 0.587 + arr[..., 2] * 0.114


def detect_phone_corners(im):
    """Corners of the phone outline via the alpha matte (robust)."""
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


def perspective_coeffs(dst, src):
    """coeffs mapping OUTPUT(dst) -> INPUT(src) for PIL PERSPECTIVE."""
    A = []
    B = []
    for (X, Y), (u, v) in zip(dst, src):
        A.append([X, Y, 1, 0, 0, 0, -u * X, -u * Y])
        A.append([0, 0, 0, X, Y, 1, -v * X, -v * Y])
        B += [u, v]
    A = np.array(A, dtype=np.float64)
    B = np.array(B, dtype=np.float64)
    res = np.linalg.solve(A, B)
    return tuple(res)


def tilt(path):
    im = Image.open(path).convert("RGBA")
    W, H = im.size
    tl, tr, br, bl = detect_phone_corners(im)

    # Flatten the whole phone to an upright rectangle (text stays correct).
    wp = int(round(max(abs(tr[0] - tl[0]), abs(br[0] - bl[0]))))
    hp = int(round(max(abs(bl[1] - tl[1]), abs(br[1] - tr[1]))))
    quad = (tl[0], tl[1], bl[0], bl[1], br[0], br[1], tr[0], tr[1])  # UL,LL,LR,UR
    flat = im.transform((wp, hp), Image.QUAD, quad, Image.BICUBIC)

    # Mirror the outline quad: x -> W-1-x, and L/R corner roles swap.
    def mx(p):
        return (W - 1 - p[0], p[1])

    dst = [mx(tr), mx(tl), mx(bl), mx(br)]  # new TL,TR,BR,BL
    srcr = [(0, 0), (wp, 0), (wp, hp), (0, hp)]
    coeffs = perspective_coeffs(dst, srcr)
    out = flat.transform((W, H), Image.PERSPECTIVE, coeffs, Image.BICUBIC,
                         fillcolor=(0, 0, 0, 0))
    out.save(path)
    print(f"{path}: phone={wp}x{hp} tl={tl.round()} tr={tr.round()} "
          f"br={br.round()} bl={bl.round()}")


if __name__ == "__main__":
    for p in sys.argv[1:]:
        tilt(p)
