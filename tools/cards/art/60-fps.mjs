// A speedometer pinned near the top, reading "60", with speed lines. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  const cx = 18, cy = 12
  // speed lines trailing to the left
  for (const [x, y, w, c] of [[0, 4, 6, 12], [2, 7, 5, 7], [0, 10, 7, 12], [1, 13, 6, 7], [0, 16, 6, 12], [3, 19, 4, 7]]) rect(x, y, w, 1, c)
  // dial: grey rim lit from the top left, black face
  for (let y = 0; y < 24; y++)
    for (let x = 0; x < 32; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy)
      if (d > 11.3) continue
      if (d > 9.6) px(x, y, dx + dy < -6 ? 7 : dx + dy > 2 ? 5 : 6)
      else px(x, y, 0)
    }
  // tick marks around the 270 degree sweep: green, yellow, red
  const ticks = [11, 11, 11, 10, 10, 8, 8]
  ticks.forEach((c, k) => {
    const a = ((225 - k * 45) * Math.PI) / 180
    for (const r of [8, 8.9]) px(Math.floor(cx + r * Math.cos(a)), Math.floor(cy - r * Math.sin(a)), c)
  })
  // red zone arc
  for (let deg = -45; deg <= 5; deg += 6) {
    const a = (deg * Math.PI) / 180
    px(Math.floor(cx + 8.9 * Math.cos(a)), Math.floor(cy - 8.9 * Math.sin(a)), 8)
  }
  // needle pushed up toward the red
  const na = (25 * Math.PI) / 180
  for (let r = 0; r <= 7.5; r += 0.5) px(Math.floor(cx + r * Math.cos(na)), Math.floor(cy - r * Math.sin(na)), 8)
  rect(17, 11, 2, 2, 7)
  // "60" in FPS-counter green
  const six = ['.##.', '#...', '###.', '#..#', '#..#', '.##.']
  const zero = ['.##.', '#..#', '#..#', '#..#', '#..#', '.##.']
  for (const [glyph, x0] of [[six, 14], [zero, 19]])
    glyph.forEach((row, j) => [...row].forEach((ch, i) => ch === '#' && px(x0 + i, 14 + j, 11)))
}
