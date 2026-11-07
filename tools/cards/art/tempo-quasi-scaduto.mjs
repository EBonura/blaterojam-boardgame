// An hourglass with its last grains falling, sweating bullets. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  const cx = 16
  const half = { 3: 6, 4: 6, 5: 6, 6: 6, 7: 5, 8: 4, 9: 3, 10: 2, 11: 1, 12: 1, 13: 2, 14: 3, 15: 4, 16: 5, 17: 6, 18: 6, 19: 6, 20: 6 }
  // glass: tinted inside, bright rim
  for (let y = 3; y <= 20; y++) {
    const w = half[y]
    rect(cx - w, y, 2 * w, 1, 1)
    px(cx - w - 1, y, 6), px(cx + w, y, 12)
  }
  px(cx - 5, 4, 7), px(cx - 5, 5, 7), px(cx - 4, 17, 7) // glints
  // the last grains up top, the stream, the pile below
  rect(cx - 1, 10, 2, 1, 15), rect(cx - 1, 11, 2, 2, 15)
  for (let y = 13; y < 17; y++) px(cx - (y % 2), y, 15)
  for (let y = 16; y <= 20; y++) {
    const w = Math.min(half[y], y - 14)
    rect(cx - w, y, 2 * w, 1, 15)
    px(cx + w - 1, y, 9)
  }
  // wooden ends and posts
  rect(7, 1, 18, 2, 4), rect(7, 1, 18, 1, 9)
  rect(7, 21, 18, 2, 4), rect(7, 21, 18, 1, 9)
  rect(8, 3, 1, 18, 4), rect(23, 3, 1, 18, 4)
  // sweat flying off
  const drop = (x, y) => { px(x, y, 12), rect(x - 1, y + 1, 2, 2, 12), px(x - 1, y + 1, 7) }
  drop(4, 3), drop(28, 6), drop(3, 13), drop(29, 15)
  // panic lines
  px(5, 8, 7), px(4, 9, 7), px(27, 11, 7), px(28, 10, 7), px(26, 19, 7), px(6, 18, 7)
}
