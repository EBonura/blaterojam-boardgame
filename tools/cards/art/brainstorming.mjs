// A lit-up idea bulb surrounded by sticky notes. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // sticky notes: colour, shade, position; each with a scribble and a curled corner
  const notes = [[0, 1, 14, 2], [25, 0, 11, 3], [0, 15, 12, 1], [25, 16, 15, 4]]
  for (const [x, y, c, s] of notes) {
    rect(x, y, 7, 7, c)
    rect(x + 1, y + 2, 5, 1, s), rect(x + 1, y + 4, 3, 1, s)
    px(x + 6, y + 6, s), px(x + 5, y + 6, -1)
  }
  // rays
  for (const [x, y] of [[16, 0], [9, 3], [8, 4], [23, 3], [24, 4], [7, 9], [6, 9], [25, 9], [26, 9], [9, 14], [23, 14]]) px(x, y, 10)
  // glass bulb, shaded on the lower right
  for (let y = 0; y < 24; y++)
    for (let x = 0; x < 32; x++) {
      const dx = x + 0.5 - 16, dy = y + 0.5 - 8.5, d = Math.hypot(dx, dy)
      if (d <= 6.4) px(x, y, dx + dy > 4.5 ? 9 : 10)
    }
  rect(13, 14, 6, 2, 10), rect(17, 14, 2, 2, 9)
  px(11, 6, 7), px(12, 5, 7), px(12, 6, 7), px(13, 4, 7)
  // filament
  for (const [x, y] of [[14, 13], [14, 12], [14, 11], [14, 10], [15, 9], [16, 10], [17, 9], [17, 10], [17, 11], [17, 12], [17, 13]]) px(x, y, 4)
  // screw base
  for (let j = 0; j < 4; j++) rect(13, 16 + j, 6, 1, j % 2 ? 5 : 6)
  rect(14, 20, 4, 1, 5), rect(15, 21, 2, 1, 0)
}
