// A graphics card on fire, spitting out triangles. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // flames licking up from the card
  const h = [3, 5, 7, 6, 4, 6, 9, 8, 6, 8, 10, 9, 7, 5, 7, 9, 8, 5, 6, 7, 5, 3]
  h.forEach((t, i) => {
    const x = 5 + i
    rect(x, 12 - t, 1, t, 8)
    if (t > 2) rect(x, 14 - t, 1, t - 2, 9)
    if (t > 5) rect(x, 16 - t, 1, t - 4, 10)
  })
  // flying triangles (the polygons)
  const up = (x, y, s, c) => { for (let j = 0; j < s; j++) rect(x - j, y + j, 2 * j + 1, 1, c) }
  const corner = (x, y, s, c) => { for (let j = 0; j < s; j++) rect(x, y + j, j + 1, 1, c) }
  up(3, 2, 3, 12), corner(26, 1, 3, 11), up(29, 6, 2, 14), corner(0, 7, 3, 13), up(16, 0, 2, 7), corner(27, 9, 2, 12), up(2, 9, 2, 11)
  // card body
  rect(3, 12, 26, 9, 5)
  rect(3, 12, 26, 1, 6)
  rect(3, 20, 26, 1, 0)
  rect(1, 11, 2, 11, 6) // bracket
  rect(1, 11, 1, 11, 7)
  // two fans
  for (const cx of [10, 21]) {
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) if (dx * dx + dy * dy <= 10) px(cx + dx, 16 + dy, 0)
    px(cx, 16, 13)
    for (const [dx, dy] of [[0, -2], [-1, -2], [2, 0], [2, -1], [0, 2], [1, 2], [-2, 0], [-2, 1]]) px(cx + dx, 16 + dy, 6)
  }
  // board and gold contacts
  rect(5, 21, 22, 1, 3)
  for (let x = 7; x < 25; x += 2) px(x, 22, 10)
}
