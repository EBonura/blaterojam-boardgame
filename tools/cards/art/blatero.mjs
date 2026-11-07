// The BLATERO wild card: a rainbow ring around a gold star, with sparkles. 32x24, PICO-8 palette indexes.
export default function draw({ px }) {
  const cx = 16, cy = 12
  const bands = [8, 9, 10, 11, 12, 14]
  for (let y = 0; y < 24; y++)
    for (let x = 0; x < 32; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy)
      if (d > 7.6 && d <= 11.6) {
        const t = (Math.atan2(dy, dx) / (2 * Math.PI) + 1.25) % 1
        px(x, y, bands[Math.floor(t * bands.length)])
      }
    }
  // star
  const pts = Array.from({ length: 10 }, (_, k) => {
    const r = k % 2 ? 3 : 7.2, a = -Math.PI / 2 + (k * Math.PI) / 5
    return [cx + r * Math.cos(a), cy + 0.4 + r * Math.sin(a)]
  })
  const inside = (x, y) => {
    let c = false
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j]
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
    }
    return c
  }
  for (let y = 0; y < 24; y++)
    for (let x = 0; x < 32; x++) if (inside(x + 0.5, y + 0.5)) px(x, y, x + y > 28 ? 9 : 10)
  px(15, 7, 7), px(15, 8, 7), px(15, 9, 7), px(13, 10, 7), px(14, 10, 7)
  // sparkles in the corners
  for (const [x, y, c] of [[3, 3, 7], [28, 4, 10], [2, 19, 10], [29, 20, 7]]) {
    px(x, y, c), px(x - 1, y, c), px(x + 1, y, c), px(x, y - 1, c), px(x, y + 1, c)
  }
}
