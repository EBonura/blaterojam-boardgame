// A retro synth box blasting a "pew" burst. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  const inPoly = (pts, x, y) => {
    let inside = false
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j]
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
    }
    return inside
  }
  const star = (cx, cy, ro, ri, n, rot) =>
    Array.from({ length: n * 2 }, (_, k) => {
      const r = k % 2 ? ri : ro, a = rot + (k * Math.PI) / n
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
    })
  // the burst: orange outline, yellow body, white core
  const outer = star(24.5, 7, 7.6, 4.2, 9, 0.2), mid = star(24.5, 7, 6.2, 3.3, 9, 0.2), core = star(24.5, 7, 3.6, 2, 9, 0.5)
  for (let y = 0; y < 24; y++)
    for (let x = 0; x < 32; x++) {
      const p = [x + 0.5, y + 0.5]
      if (inPoly(core, ...p)) px(x, y, 7)
      else if (inPoly(mid, ...p)) px(x, y, 10)
      else if (inPoly(outer, ...p)) px(x, y, 9)
    }
  // little sound waves leaving the box
  for (const [x, y] of [[14, 8], [15, 7], [16, 6], [17, 6], [14, 5], [15, 4], [16, 3], [17, 3]]) px(x, y, 12)
  // synth box: wooden cheeks, grey panel, light top edge
  rect(2, 11, 22, 11, 5)
  rect(2, 10, 22, 1, 6)
  rect(1, 10, 2, 12, 4), rect(23, 10, 2, 12, 4)
  rect(1, 10, 1, 12, 9), rect(23, 10, 1, 12, 9)
  rect(1, 22, 24, 1, 0)
  // knobs with white pointers
  for (const [x, c] of [[4, 8], [8, 10], [12, 12]]) {
    rect(x, 12, 3, 3, c), px(x, 12, 5), px(x + 2, 12, 5), px(x, 14, 5), px(x + 2, 14, 5)
    px(x + 1, 12, 7)
  }
  // tiny waveform screen
  rect(16, 12, 6, 3, 0)
  for (const [x, y] of [[16, 13], [17, 12], [18, 13], [19, 14], [20, 13], [21, 12]]) px(x, y, 11)
  // keyboard
  rect(3, 17, 20, 4, 7)
  for (let x = 6; x < 23; x += 3) rect(x, 17, 1, 4, 6)
  for (const x of [5, 8, 14, 17, 20]) rect(x, 17, 2, 2, 0)
}
