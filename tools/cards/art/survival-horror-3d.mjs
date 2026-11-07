// 3D survival horror: a dark corridor, a flashlight beam finding blood on the wall, red eyes in the doorway. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  rect(0, 0, 32, 24, 0)
  // corridor walls converging on a far doorway, edges picked out in grey
  for (let x = 0; x < 12; x++) {
    const top = Math.round((7 * x) / 12), bot = 23 - Math.round((8 * x) / 12)
    rect(x, top, 1, bot - top + 1, 1)
    rect(31 - x, top, 1, bot - top + 1, 1)
    px(x, top, 5), px(x, bot, 5), px(31 - x, top, 5), px(31 - x, bot, 5)
  }
  rect(12, 7, 8, 1, 5), rect(12, 7, 1, 9, 5), rect(19, 7, 1, 9, 5)
  // flashlight beam from the bottom left, dithered
  const sx = 7, sy = 20, ex = 23, ey = 12
  for (let y = 0; y < 24; y++) for (let x = 0; x < 32; x++) {
    const vx = ex - sx, vy = ey - sy
    const t = ((x - sx) * vx + (y - sy) * vy) / (vx * vx + vy * vy)
    if (t < 0 || t > 1) continue
    const dist = Math.abs((x - sx) * vy - (y - sy) * vx) / Math.hypot(vx, vy)
    if (dist < 0.8 + t * 3.5 && (x + y) % 2) px(x, y, 5)
  }
  // lit spot on the right wall
  for (let y = 7; y < 18; y++) for (let x = 18; x < 28; x++) {
    const d = Math.hypot((x - ex) / 1.1, y - ey)
    if (d < 1.5) px(x, y, 7)
    else if (d < 3.6) px(x, y, 6)
    else if (d < 4.6) px(x, y, 13)
  }
  // blood smear revealed by the light
  for (const [x, y, c] of [[22, 10, 8], [23, 10, 8], [21, 11, 8], [22, 11, 8], [23, 11, 8], [24, 11, 2], [22, 12, 8], [22, 13, 2], [24, 12, 8], [24, 13, 2], [20, 10, 2]]) px(x, y, c)
  // something in the doorway: red eyes
  px(13, 10, 8), px(16, 10, 8)
  px(13, 11, 2), px(16, 11, 2)
  // flashlight in hand
  rect(4, 21, 3, 2, 6), px(7, 20, 7), px(6, 20, 7), px(7, 21, 7)
  rect(1, 22, 4, 2, 15), rect(0, 22, 1, 2, 4)
}
