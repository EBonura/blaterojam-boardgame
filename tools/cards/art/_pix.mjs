// Shared drawing helpers for the card art modules (not a card itself: no id in cards.json uses it).
// Usage inside a module: `import { pen } from './_pix.mjs'` then `const p = pen(px)` in draw().

/** Wraps the build's px() with shape helpers. Every helper takes a PICO-8 palette index. */
export function pen(raw) {
  const px = (x, y, c) => raw(Math.round(x), Math.round(y), c)
  const p = {
    px,
    rect(x, y, w, h, c) {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c)
    },
    /** Horizontal and vertical runs. */
    hline(x, y, w, c) { p.rect(x, y, w, 1, c) },
    vline(x, y, h, c) { p.rect(x, y, 1, h, c) },
    /** Bresenham line, both ends included. */
    line(x0, y0, x1, y1, c) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1)
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0)
      const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1
      let e = dx + dy
      for (;;) {
        px(x0, y0, c)
        if (x0 === x1 && y0 === y1) break
        const e2 = 2 * e
        if (e2 >= dy) { e += dy; x0 += sx }
        if (e2 <= dx) { e += dx; y0 += sy }
      }
    },
    /** Filled ellipse centred on (cx, cy); radii can be fractional (cx 10.5 centres between pixels). */
    ellipse(cx, cy, rx, ry, c) {
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
        for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
          const u = (x - cx) / (rx + 0.5), v = (y - cy) / (ry + 0.5)
          if (u * u + v * v <= 1) px(x, y, c)
        }
    },
    disc(cx, cy, r, c) { p.ellipse(cx, cy, r, r, c) },
    /** One-pixel ellipse outline. */
    ring(cx, cy, rx, ry, c) {
      const inside = (x, y) => { const u = (x - cx) / (rx + 0.5), v = (y - cy) / (ry + 0.5); return u * u + v * v <= 1 }
      for (let y = Math.floor(cy - ry) - 1; y <= Math.ceil(cy + ry) + 1; y++)
        for (let x = Math.floor(cx - rx) - 1; x <= Math.ceil(cx + rx) + 1; x++)
          if (inside(x, y) && (!inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1))) px(x, y, c)
    },
    /** Filled polygon, points as [[x, y], ...] (pixel centres). */
    poly(pts, c) {
      const ys = pts.map((q) => q[1])
      for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
        const xs = []
        for (let i = 0; i < pts.length; i++) {
          const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]
          if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + ((y - ay) / (by - ay)) * (bx - ax))
        }
        xs.sort((a, b) => a - b)
        for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x <= Math.round(xs[k + 1]); x++) px(x, y, c)
      }
      for (let i = 0; i < pts.length; i++) p.line(...pts[i], ...pts[(i + 1) % pts.length], c)
    },
    /** Checkerboard of two colours (pass -1 as b to leave every other pixel untouched). */
    dither(x, y, w, h, a, b = -1) {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const c = (x + i + y + j) % 2 ? b : a
        if (c >= 0) px(x + i, y + j, c)
      }
    },
    /**
     * Pixel sprite from strings. Each character maps to a palette index through `map`;
     * '.' and ' ' are transparent. Hex digits 0-f map to themselves unless `map` overrides them.
     * Options: flip (mirror horizontally).
     */
    sprite(x, y, rows, map = {}, { flip = false } = {}) {
      rows.forEach((row, j) => [...row].forEach((ch, i) => {
        if (ch === '.' || ch === ' ') return
        const c = ch in map ? map[ch] : parseInt(ch, 16)
        if (Number.isInteger(c) && c >= 0) px(flip ? x + row.length - 1 - i : x + i, y + j, c)
      }))
    },
  }
  return p
}

/**
 * An offscreen layer: draw into it with the same helpers, then outline() what you drew and
 * stamp() it onto the card. Handy for giving a shape a 1-pixel dark outline against the background.
 */
export function layer(W = 64, H = 48) {
  const g = Array.from({ length: H }, () => Array(W).fill(-1))
  const set = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = c }
  const l = pen(set)
  l.grid = g
  /** Adds a 1-pixel outline of colour c around everything drawn so far (diagonals too when corners is true). */
  l.outline = (c, { corners = false } = {}) => {
    const add = []
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (g[y][x] >= 0) continue
      const n = [[1, 0], [-1, 0], [0, 1], [0, -1], ...(corners ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : [])]
      if (n.some(([dx, dy]) => g[y + dy]?.[x + dx] >= 0)) add.push([x, y])
    }
    for (const [x, y] of add) g[y][x] = c
  }
  l.stamp = (px, ox = 0, oy = 0) => g.forEach((row, y) => row.forEach((c, x) => c >= 0 && px(x + ox, y + oy, c)))
  return l
}
