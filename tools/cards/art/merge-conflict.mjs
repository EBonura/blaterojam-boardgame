// Two git branches run head-on into each other. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  const node = (x, y, c) => { rect(x - 1, y - 2, 3, 5, c), rect(x - 2, y - 1, 5, 3, c), rect(x - 1, y - 1, 3, 3, 7), px(x, y, c) }
  // branch one (blue), coming down from the top
  rect(0, 4, 10, 2, 12)
  for (let i = 0; i < 6; i++) rect(10 + i, 5 + i, 2, 2, 12)
  node(3, 4, 12), node(9, 4, 12)
  // branch two (orange), coming up from the bottom
  rect(0, 18, 10, 2, 9)
  for (let i = 0; i < 6; i++) rect(10 + i, 17 - i, 2, 2, 9)
  node(3, 19, 9), node(9, 19, 9)
  // the crash
  const pts = [[22, 1], [24, 7], [30, 4], [26, 10], [31, 13], [25, 14], [27, 21], [22, 16], [17, 20], [18, 14], [14, 11], [19, 9], [17, 3], [21, 7]]
  const inside = (x, y, s) => {
    let hit = false
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = [22 + (pts[i][0] - 22) * s, 11.5 + (pts[i][1] - 11.5) * s]
      const [xj, yj] = [22 + (pts[j][0] - 22) * s, 11.5 + (pts[j][1] - 11.5) * s]
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
    }
    return hit
  }
  for (let y = 0; y < 24; y++) for (let x = 12; x < 32; x++) {
    if (inside(x + 0.5, y + 0.5, 0.45)) px(x, y, 7)
    else if (inside(x + 0.5, y + 0.5, 0.75)) px(x, y, 10)
    else if (inside(x + 0.5, y + 0.5, 1)) px(x, y, 8)
  }
  // debris flying off
  px(30, 0, 10), px(13, 17, 8), px(31, 18, 9), px(12, 2, 12)
}
