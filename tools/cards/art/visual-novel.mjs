// Visual novel: a character portrait over a sunset backdrop, dialogue box at the bottom. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // sunset sky and a distant rooftop line
  rect(0, 0, 32, 6, 13)
  rect(0, 6, 32, 5, 14)
  rect(0, 11, 32, 6, 15)
  rect(26, 2, 3, 5, 10), rect(25, 3, 5, 3, 10), px(26, 3, 7)
  rect(0, 13, 7, 4, 2), rect(25, 12, 7, 5, 2), px(28, 11, 2), rect(2, 12, 1, 1, 2)
  // long hair, rounded on top, falling past the shoulders
  rect(11, 1, 10, 1, 4)
  rect(10, 2, 12, 2, 4)
  rect(9, 4, 14, 12, 4)
  rect(12, 2, 4, 1, 9), px(11, 3, 9) // shine
  // face
  rect(12, 4, 8, 8, 15)
  rect(13, 12, 6, 1, 15)
  rect(19, 6, 1, 6, 9) // shadow side
  // fringe with jagged tips
  rect(11, 4, 10, 1, 4)
  for (const x of [12, 14, 15, 17, 19]) px(x, 5, 4)
  px(14, 6, 4), px(19, 6, 4)
  // big eyes with highlights
  for (const ex of [13, 17]) {
    rect(ex, 7, 2, 3, 12)
    px(ex, 7, 7)
    px(ex + 1, 9, 1)
    rect(ex, 6, 2, 1, 0)
  }
  // blush and mouth
  px(12, 10, 14), px(19, 10, 14)
  px(15, 11, 8), px(16, 11, 8)
  // neck and uniform with a white collar and red bow
  rect(14, 12, 4, 2, 15)
  rect(10, 14, 12, 3, 12)
  rect(12, 14, 3, 1, 7), rect(17, 14, 3, 1, 7)
  px(15, 14, 8), px(16, 14, 8), px(15, 15, 8), px(16, 15, 8)
  // dialogue box with name tag and "next" arrow
  rect(0, 16, 12, 3, 14)
  rect(2, 17, 7, 1, 7)
  rect(0, 18, 32, 6, 7)
  rect(1, 19, 30, 4, 1)
  rect(3, 20, 15, 1, 7)
  rect(19, 20, 6, 1, 7)
  rect(3, 22, 10, 1, 6)
  rect(27, 21, 3, 1, 10), px(28, 22, 10)
}
