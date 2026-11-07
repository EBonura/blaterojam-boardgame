// A gear whose hub is a little platformer viewport. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  const cx = 16, cy = 12
  // teeth: square blocks around the rim, shadowed on the bottom right
  const teeth = [[14, 0, 4, 3], [14, 21, 4, 3], [3, 10, 3, 4], [26, 10, 3, 4], [6, 3, 4, 4], [22, 3, 4, 4], [6, 17, 4, 4], [22, 17, 4, 4]]
  for (const [x, y, w, h] of teeth) rect(x, y, w, h, x + y > 30 ? 5 : 6)
  for (let y = 0; y < 24; y++)
    for (let x = 0; x < 32; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy)
      if (d <= 8) px(x, y, 12) // sky
      else if (d <= 8.9) px(x, y, 5) // inner lip
      else if (d <= 10.8) px(x, y, d > 9.8 && dx + dy < -9 ? 7 : dx + dy > 5 ? 5 : 6)
    }
  px(14, 0, 7), px(15, 0, 7), px(6, 3, 7), px(3, 10, 7)
  // ground with grass top, clipped to the viewport
  for (let y = 15; y < 21; y++)
    for (let x = 7; x < 25; x++) if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= 8) px(x, y, y === 15 ? 11 : y === 16 ? 3 : 4)
  // cloud
  rect(10, 7, 4, 1, 7), rect(11, 6, 2, 1, 7)
  // floating ledge with a gem above it
  rect(17, 9, 4, 1, 4), rect(17, 10, 4, 1, 2)
  px(19, 7, 12), px(18, 6, 12), px(19, 6, 7), px(20, 6, 12), px(19, 5, 12)
  // tiny hero jumping up to it
  px(17, 11, 15), px(18, 11, 12)
  rect(17, 12, 2, 1, 12)
  px(17, 13, 1), px(18, 13, 1)
  // little tree on the left
  rect(11, 11, 3, 2, 11), px(12, 10, 11), px(11, 11, 3), rect(12, 13, 1, 2, 4)
}
