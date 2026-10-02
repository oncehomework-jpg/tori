"""16x16 픽셀 그림 도우미 (v4.4 아이콘 다시 그리기용).
도형을 칠한 뒤 outline()으로 바깥 테두리를 k로 만들고, 그 위에 세부를 찍는다."""
import math
class G:
    def __init__(s, w=16, h=16): s.w, s.h = w, h; s.a = [['.'] * w for _ in range(h)]
    def px(s, x, y, c):
        if 0 <= x < s.w and 0 <= y < s.h: s.a[y][x] = c
    def get(s, x, y): return s.a[y][x] if 0 <= x < s.w and 0 <= y < s.h else '.'
    def disc(s, cx, cy, r, c, ry=None):
        ry = ry or r
        for y in range(s.h):
            for x in range(s.w):
                if ((x + .5 - cx) / r) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1: s.a[y][x] = c
    def rect(s, x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): s.px(x, y, c)
    def line(s, x0, y0, x1, y1, c, w=.5):
        for y in range(s.h):
            for x in range(s.w):
                px, py = x + .5, y + .5; dx, dy = x1 - x0, y1 - y0
                t = max(0, min(1, ((px - x0) * dx + (py - y0) * dy) / (dx * dx + dy * dy or 1)))
                if math.hypot(px - x0 - t * dx, py - y0 - t * dy) <= w: s.a[y][x] = c
    def poly(s, pts, c):
        for y in range(s.h):
            for x in range(s.w):
                px, py = x + .5, y + .5; ins = False
                for i in range(len(pts)):
                    (ax, ay), (bx, by) = pts[i], pts[i - 1]
                    if (ay > py) != (by > py) and px < (bx - ax) * (py - ay) / (by - ay) + ax: ins = not ins
                if ins: s.a[y][x] = c
    def outline(s, c='k', diag=False):
        n = [(0, 1), (0, -1), (1, 0), (-1, 0)] + ([(1, 1), (1, -1), (-1, 1), (-1, -1)] if diag else [])
        e = [(x, y) for y in range(s.h) for x in range(s.w) if s.a[y][x] != '.' and any(s.get(x + a, y + b) == '.' for a, b in n)]
        for x, y in e: s.a[y][x] = c
    def put(s, x, y, rows):
        """rows 문자열들을 (x,y)에 찍기, '_'는 건너뜀"""
        for j, r in enumerate(rows):
            for i, c in enumerate(r):
                if c != '_': s.px(x + i, y + j, c)
    def rows(s): return [''.join(r) for r in s.a]
    def halo(s, c='k', diag=True):
        """칠한 곳 바깥쪽 빈칸에 테두리"""
        n = [(0, 1), (0, -1), (1, 0), (-1, 0)] + ([(1, 1), (1, -1), (-1, 1), (-1, -1)] if diag else [])
        e = [(x, y) for y in range(s.h) for x in range(s.w) if s.a[y][x] == '.' and any(s.get(x + a, y + b) not in '.' + c for a, b in n)]
        for x, y in e: s.a[y][x] = c
    def ell(s, cx, cy, rx, ry, ang, c):
        """기울어진 타원 (ang 도)"""
        t = math.radians(ang); co, si = math.cos(t), math.sin(t)
        for y in range(s.h):
            for x in range(s.w):
                dx, dy = x + .5 - cx, y + .5 - cy
                u, v = dx * co + dy * si, -dx * si + dy * co
                if (u / rx) ** 2 + (v / ry) ** 2 <= 1: s.a[y][x] = c
    def star(s, cx, cy, R, c, r=None, rot=-90):
        r = r or R * .45
        pts = [(cx + (R if i % 2 == 0 else r) * math.cos(math.radians(rot + i * 36)), cy + (R if i % 2 == 0 else r) * math.sin(math.radians(rot + i * 36))) for i in range(10)]
        s.poly(pts, c)
    def arc(s, cx, cy, R, a0, a1, c, w=.5):
        for y in range(s.h):
            for x in range(s.w):
                dx, dy = x + .5 - cx, y + .5 - cy
                if abs(math.hypot(dx, dy) - R) <= w:
                    a = math.degrees(math.atan2(dy, dx)) % 360
                    if (a0 <= a <= a1) if a0 <= a1 else (a >= a0 or a <= a1): s.a[y][x] = c
