"""Remove the flat studio background from the phone renders.

Border-seeded flood fill where a pixel is treated as background only if it is
close (in RGB distance) to the sampled studio background color. This keeps the
white app screen intact: it sits far enough from the sage background color that
the fill cannot propagate across it even if a few specular bezel pixels leak.
"""
from collections import deque
from PIL import Image, ImageFilter


def sample_bg(px, w, h):
    pts = []
    for (sx, sy) in [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3),
                     (w // 2, 2), (2, h // 2), (w - 3, h // 2), (w // 2, h - 3)]:
        pts.append(px[sx, sy])
    r = sum(p[0] for p in pts) / len(pts)
    g = sum(p[1] for p in pts) / len(pts)
    b = sum(p[2] for p in pts) / len(pts)
    return (r, g, b)


def cutout(src, dst, tol=34):
    im = Image.open(src).convert("RGB")
    w, h = im.size
    px = im.load()
    br, bg_, bb = sample_bg(px, w, h)
    tol2 = tol * tol

    alpha = bytearray([255]) * (w * h)
    visited = bytearray(w * h)
    dq = deque()

    def near_bg(x, y):
        r, g, b = px[x, y]
        dr, dg, db = r - br, g - bg_, b - bb
        if (dr * dr + dg * dg + db * db) <= tol2:
            return True
        # Also strip soft grey shadow / floor reflection: low-saturation,
        # mid-to-light pixels. The white screen (lum > 248) is excluded, so a
        # leak through bezel highlights cannot spread across it.
        mx, mn = max(r, g, b), min(r, g, b)
        lum = (r + g + b) / 3
        return (mx - mn) <= 22 and 150 <= lum <= 248

    def seed(x, y):
        i = y * w + x
        if not visited[i]:
            visited[i] = 1
            if near_bg(x, y):
                alpha[i] = 0
                dq.append((x, y))

    for x in range(w):
        seed(x, 0)
        seed(x, h - 1)
    for y in range(h):
        seed(0, y)
        seed(w - 1, y)

    while dq:
        x, y = dq.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h:
                j = ny * w + nx
                if not visited[j]:
                    visited[j] = 1
                    if near_bg(nx, ny):
                        alpha[j] = 0
                        dq.append((nx, ny))

    mask = Image.frombytes("L", (w, h), bytes(alpha))
    mask = mask.filter(ImageFilter.GaussianBlur(0.8))
    out = im.convert("RGBA")
    out.putalpha(mask)
    bbox = mask.getbbox()
    if bbox:
        pad = 16
        l, t, r, b = bbox
        out = out.crop((max(0, l - pad), max(0, t - pad),
                        min(w, r + pad), min(h, b + pad)))
    out.save(dst)
    print(f"{dst}: bg={tuple(round(c) for c in (br,bg_,bb))} size={out.size}")


if __name__ == "__main__":
    pairs = [
        ("/tmp/m_a.png", "home"),
        ("/tmp/m_b.png", "inventory"),
        ("/tmp/m_c.png", "recipes"),
        ("/tmp/m_d.png", "scan"),
    ]
    for s, name in pairs:
        cutout(s, f"/Users/a28/freshly-landing/public/mockups/{name}.png")
