// Open world RPG: a caped hero on a hilltop looking across a vast valley at a far castle under the mountains. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // sky
  rect(0, 0, 32, 13, 12)
  rect(0, 9, 32, 4, 6)
  rect(3, 2, 5, 1, 7), rect(22, 1, 4, 1, 7)
  px(14, 3, 0), px(15, 4, 0), px(16, 3, 0), px(18, 2, 0), px(19, 3, 0), px(20, 2, 0) // birds
  // mountain range with snow caps
  const peak = (cx, top, base) => {
    for (let y = top; y < base; y++) {
      const h = y - top
      rect(cx - h, y, h * 2 + 1, 1, 13)
      rect(cx + 1, y, h, 1, 5)
      if (h < 2) rect(cx - h, y, h * 2 + 1, 1, 7)
    }
  }
  peak(6, 4, 12)
  peak(26, 3, 12)
  peak(17, 6, 12)
  // far hills and the castle on a ridge
  rect(0, 12, 32, 4, 3)
  rect(13, 11, 12, 1, 3)
  rect(18, 8, 5, 4, 6)
  rect(17, 7, 2, 5, 6), rect(22, 7, 2, 5, 6)
  px(17, 6, 6), px(23, 6, 6)
  rect(20, 10, 1, 2, 0)
  px(22, 6, 6), px(22, 5, 8), px(23, 5, 8) // flag
  rect(23, 7, 1, 5, 5)
  // valley and near grass
  rect(0, 16, 32, 8, 11)
  for (const [x, y] of [[20, 18], [27, 21], [15, 22], [24, 17]]) px(x, y, 3)
  // winding path toward the castle
  for (const [x, y, w] of [[20, 12, 1], [19, 13, 2], [18, 14, 2], [19, 15, 3], [20, 16, 3], [19, 17, 4], [17, 18, 4], [15, 19, 5], [14, 20, 5], [15, 21, 6], [16, 22, 7], [17, 23, 8]]) rect(x, y, w, 1, 9)
  // trees on the far side
  rect(27, 14, 3, 3, 3), px(28, 17, 4), rect(29, 16, 2, 2, 3)
  // foreground hill the hero stands on
  for (const [x, y, w] of [[2, 15, 8], [1, 16, 11], [0, 17, 13], [0, 18, 14], [0, 19, 15], [0, 20, 15], [0, 21, 15], [0, 22, 16], [0, 23, 16]]) {
    rect(x, y, w, 1, 11)
    px(x + w, y, 3)
  }
  for (const [x, y] of [[3, 19], [8, 21], [11, 18]]) px(x, y, 3)
  // hero from behind: hair, red cape, sword on the back
  rect(5, 7, 3, 2, 4)
  rect(4, 9, 5, 5, 8)
  rect(7, 9, 2, 5, 2)
  px(4, 8, 7), px(3, 7, 6), px(2, 6, 6) // sword hilt and blade over the shoulder
  rect(5, 14, 1, 1, 1), rect(7, 14, 1, 1, 1)
}
